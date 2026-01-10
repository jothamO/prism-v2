import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MigrationStats {
  users: { migrated: number; failed: number; skipped: number };
  transactions: { migrated: number; failed: number };
  connections: { telegram: number; whatsapp: number; bank: number };
  duration: number;
  errors: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const startTime = Date.now();
    
    // Get V1 credentials from secrets
    const V1_URL = Deno.env.get("V1_SUPABASE_URL");
    const V1_KEY = Deno.env.get("V1_SUPABASE_SERVICE_KEY");
    
    // Get V2 credentials (this project)
    const V2_URL = Deno.env.get("SUPABASE_URL");
    const V2_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!V1_URL || !V1_KEY) {
      return new Response(
        JSON.stringify({ error: "V1 Supabase credentials not configured" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!V2_URL || !V2_KEY) {
      return new Response(
        JSON.stringify({ error: "V2 Supabase credentials not available" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify admin access
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const v2Client = createClient(V2_URL, V2_KEY);
    const v1Client = createClient(V1_URL, V1_KEY);

    // Verify user is admin
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await v2Client.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user is admin
    const { data: userRecord } = await v2Client
      .from("users")
      .select("id")
      .eq("auth_user_id", user.id)
      .single();

    if (!userRecord) {
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: roleData } = await v2Client
      .from("user_roles")
      .select("role")
      .eq("user_id", userRecord.id)
      .in("role", ["admin", "owner"]);

    if (!roleData || roleData.length === 0) {
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stats: MigrationStats = {
      users: { migrated: 0, failed: 0, skipped: 0 },
      transactions: { migrated: 0, failed: 0 },
      connections: { telegram: 0, whatsapp: 0, bank: 0 },
      duration: 0,
      errors: [],
    };

    // ============= Migrate Users =============
    console.log("📦 Migrating users...");
    
    const { data: v1Users, error: usersError } = await v1Client
      .from("users")
      .select("*")
      .order("created_at", { ascending: true });

    if (usersError) {
      stats.errors.push(`Error fetching V1 users: ${usersError.message}`);
    } else {
      for (const v1User of v1Users ?? []) {
        try {
          // Check if user already exists in V2
          const { data: existing } = await v2Client
            .from("users")
            .select("id")
            .eq("email", v1User.email)
            .maybeSingle();

          if (existing) {
            stats.users.skipped++;
            continue;
          }

          // Map V1 user schema to V2 schema
          const v2User = {
            id: v1User.id,
            email: v1User.email,
            full_name: v1User.full_name || (v1User.first_name || '') + ' ' + (v1User.last_name || ''),
            phone: v1User.phone,
            account_type: v1User.entity_type || v1User.account_type || 'individual',
            state: v1User.state,
            tin: v1User.tin,
            nin: v1User.nin,
            bvn: v1User.bvn,
            business_name: v1User.business_name,
            cac_number: v1User.cac_number,
            onboarding_complete: v1User.onboarding_completed || false,
            onboarding_step: v1User.onboarding_step || 1,
            kyc_level: v1User.kyc_level || 0,
            verification_status: v1User.verification_status,
            created_at: v1User.created_at,
            updated_at: new Date().toISOString(),
            migrated_from_v1: true,
            v1_id: v1User.id,
          };

          const { error: insertError } = await v2Client
            .from("users")
            .insert(v2User);

          if (insertError) {
            stats.errors.push(`Failed to migrate user ${v1User.email}: ${insertError.message}`);
            stats.users.failed++;
          } else {
            stats.users.migrated++;
          }
        } catch (err) {
          stats.errors.push(`Error migrating user ${v1User.id}: ${err}`);
          stats.users.failed++;
        }
      }
    }

    // ============= Migrate Transactions =============
    console.log("📦 Migrating transactions...");
    
    // Get migrated user IDs mapping
    const { data: v2Users } = await v2Client
      .from("users")
      .select("id, v1_id")
      .not("v1_id", "is", null);

    const userIdMap = new Map<string, string>();
    for (const u of v2Users ?? []) {
      if (u.v1_id) userIdMap.set(u.v1_id, u.id);
    }

    // Fetch V1 transactions in batches
    const batchSize = 500;
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const { data: v1Txns, error: txnError } = await v1Client
        .from("transactions")
        .select("*")
        .range(offset, offset + batchSize - 1)
        .order("date", { ascending: true });

      if (txnError) {
        stats.errors.push(`Error fetching V1 transactions: ${txnError.message}`);
        break;
      }

      if (!v1Txns || v1Txns.length === 0) {
        hasMore = false;
        continue;
      }

      // Map and insert transactions
      const v2Txns = v1Txns
        .filter((tx) => userIdMap.has(tx.user_id))
        .map((tx) => ({
          user_id: userIdMap.get(tx.user_id),
          external_id: tx.external_id || tx.id,
          description: tx.description || tx.narration || 'No description',
          amount: tx.amount,
          type: tx.type,
          transaction_date: tx.date,
          category: tx.category,
          source: tx.source || 'migrated',
          categorization_status: tx.categorization_status || 'pending',
          metadata: tx.metadata || {},
          created_at: tx.created_at,
          migrated_from_v1: true,
          v1_id: tx.id,
        }));

      if (v2Txns.length > 0) {
        const { error: insertError } = await v2Client
          .from("transactions")
          .insert(v2Txns);

        if (insertError) {
          stats.errors.push(`Batch insert error: ${insertError.message}`);
          stats.transactions.failed += v2Txns.length;
        } else {
          stats.transactions.migrated += v2Txns.length;
        }
      }

      offset += batchSize;
      
      // Stop if we got less than batch size
      if (v1Txns.length < batchSize) {
        hasMore = false;
      }
    }

    // ============= Migrate Connections =============
    console.log("📦 Migrating connections...");

    // Telegram connections
    const { data: telegramConns } = await v1Client
      .from("telegram_connections")
      .select("*");

    for (const conn of telegramConns ?? []) {
      try {
        const { error } = await v2Client.from("telegram_connections").insert({
          ...conn,
          migrated_from_v1: true,
        });
        if (!error) stats.connections.telegram++;
      } catch {
        // Ignore duplicates
      }
    }

    // WhatsApp connections
    const { data: whatsappConns } = await v1Client
      .from("whatsapp_connections")
      .select("*");

    for (const conn of whatsappConns ?? []) {
      try {
        const { error } = await v2Client.from("whatsapp_connections").insert({
          ...conn,
          migrated_from_v1: true,
        });
        if (!error) stats.connections.whatsapp++;
      } catch {
        // Ignore duplicates
      }
    }

    // Bank connections
    const { data: bankConns } = await v1Client
      .from("bank_connections")
      .select("*");

    for (const conn of bankConns ?? []) {
      try {
        const { error } = await v2Client.from("bank_connections").insert({
          ...conn,
          migrated_from_v1: true,
        });
        if (!error) stats.connections.bank++;
      } catch {
        // Ignore duplicates
      }
    }

    stats.duration = (Date.now() - startTime) / 1000;

    // Log migration result
    await v2Client.from("system_logs").insert({
      level: "info",
      category: "system",
      message: "V1 to V2 migration completed",
      metadata: stats,
      user_id: userRecord.id,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Migration completed",
        stats,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Migration error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
