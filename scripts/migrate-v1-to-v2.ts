// =====================================================
// PRISM V2 - Data Migration Script
// Migrate users and data from V1 to V2 Supabase
// Run with: npx ts-node scripts/migrate-v1-to-v2.ts
// =====================================================

import { createClient } from '@supabase/supabase-js';

// V1 Supabase credentials (source)
const V1_SUPABASE_URL = process.env.V1_SUPABASE_URL!;
const V1_SUPABASE_KEY = process.env.V1_SUPABASE_SERVICE_KEY!;

// V2 Supabase credentials (destination)
const V2_SUPABASE_URL = process.env.SUPABASE_URL!;
const V2_SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const v1Client = createClient(V1_SUPABASE_URL, V1_SUPABASE_KEY);
const v2Client = createClient(V2_SUPABASE_URL, V2_SUPABASE_KEY);

interface MigrationStats {
    users: { migrated: number; failed: number; skipped: number };
    transactions: { migrated: number; failed: number };
    connections: { telegram: number; whatsapp: number; bank: number };
    startTime: Date;
    endTime?: Date;
}

const stats: MigrationStats = {
    users: { migrated: 0, failed: 0, skipped: 0 },
    transactions: { migrated: 0, failed: 0 },
    connections: { telegram: 0, whatsapp: 0, bank: 0 },
    startTime: new Date(),
};

// ============= User Migration =============
async function migrateUsers() {
    console.log('\n📦 Migrating users...');

    const { data: v1Users, error } = await v1Client
        .from('users')
        .select('*')
        .order('created_at', { ascending: true });

    if (error) {
        console.error('❌ Error fetching V1 users:', error.message);
        return;
    }

    console.log(`Found ${v1Users?.length ?? 0} users in V1`);

    for (const v1User of v1Users ?? []) {
        try {
            // Check if user already exists in V2
            const { data: existing } = await v2Client
                .from('users')
                .select('id')
                .eq('email', v1User.email)
                .maybeSingle();

            if (existing) {
                stats.users.skipped++;
                continue;
            }

            // Map V1 user schema to V2 schema
            const v2User = {
                id: v1User.id,
                email: v1User.email,
                full_name: v1User.full_name || v1User.first_name + ' ' + (v1User.last_name || ''),
                phone: v1User.phone,
                account_type: v1User.entity_type || v1User.account_type || 'individual',
                state: v1User.state,
                tin: v1User.tin,
                nin: v1User.nin,
                bvn: v1User.bvn,
                business_name: v1User.business_name,
                cac_number: v1User.cac_number,
                onboarding_completed: v1User.onboarding_completed || false,
                onboarding_step: v1User.onboarding_step || 1,
                kyc_level: v1User.kyc_level || 0,
                verification_status: v1User.verification_status,
                created_at: v1User.created_at,
                updated_at: new Date().toISOString(),
                migrated_from_v1: true,
                v1_id: v1User.id,
            };

            const { error: insertError } = await v2Client
                .from('users')
                .insert(v2User);

            if (insertError) {
                console.error(`❌ Failed to migrate user ${v1User.email}:`, insertError.message);
                stats.users.failed++;
            } else {
                stats.users.migrated++;
            }
        } catch (err) {
            console.error(`❌ Error migrating user ${v1User.id}:`, err);
            stats.users.failed++;
        }
    }

    console.log(`✅ Users: ${stats.users.migrated} migrated, ${stats.users.skipped} skipped, ${stats.users.failed} failed`);
}

// ============= Transaction Migration =============
async function migrateTransactions() {
    console.log('\n📦 Migrating transactions...');

    // Get migrated user IDs mapping
    const { data: v2Users } = await v2Client
        .from('users')
        .select('id, v1_id')
        .not('v1_id', 'is', null);

    const userIdMap = new Map<string, string>();
    for (const u of v2Users ?? []) {
        if (u.v1_id) userIdMap.set(u.v1_id, u.id);
    }

    // Fetch V1 transactions in batches
    const batchSize = 500;
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
        const { data: v1Txns, error } = await v1Client
            .from('transactions')
            .select('*')
            .range(offset, offset + batchSize - 1)
            .order('date', { ascending: true });

        if (error) {
            console.error('❌ Error fetching V1 transactions:', error.message);
            break;
        }

        if (!v1Txns || v1Txns.length === 0) {
            hasMore = false;
            continue;
        }

        // Map and insert transactions
        const v2Txns = v1Txns
            .filter(tx => userIdMap.has(tx.user_id))
            .map(tx => ({
                user_id: userIdMap.get(tx.user_id),
                external_id: tx.external_id || tx.id,
                description: tx.description || tx.narration,
                amount: tx.amount,
                type: tx.type,
                date: tx.date,
                category: tx.category,
                source: tx.source || 'migrated',
                categorization_status: tx.categorization_status || 'pending',
                metadata: tx.metadata,
                created_at: tx.created_at,
                migrated_from_v1: true,
            }));

        if (v2Txns.length > 0) {
            const { error: insertError } = await v2Client
                .from('transactions')
                .insert(v2Txns);

            if (insertError) {
                console.error('❌ Batch insert error:', insertError.message);
                stats.transactions.failed += v2Txns.length;
            } else {
                stats.transactions.migrated += v2Txns.length;
            }
        }

        offset += batchSize;
        console.log(`  Processed ${offset} transactions...`);
    }

    console.log(`✅ Transactions: ${stats.transactions.migrated} migrated, ${stats.transactions.failed} failed`);
}

// ============= Connection Migration =============
async function migrateConnections() {
    console.log('\n📦 Migrating connections...');

    // Telegram connections
    const { data: telegramConns } = await v1Client
        .from('telegram_connections')
        .select('*');

    for (const conn of telegramConns ?? []) {
        try {
            await v2Client.from('telegram_connections').insert({
                ...conn,
                migrated_from_v1: true,
            });
            stats.connections.telegram++;
        } catch (err) {
            // Ignore duplicates
        }
    }

    // WhatsApp connections
    const { data: whatsappConns } = await v1Client
        .from('whatsapp_connections')
        .select('*');

    for (const conn of whatsappConns ?? []) {
        try {
            await v2Client.from('whatsapp_connections').insert({
                ...conn,
                migrated_from_v1: true,
            });
            stats.connections.whatsapp++;
        } catch (err) {
            // Ignore duplicates
        }
    }

    // Bank connections
    const { data: bankConns } = await v1Client
        .from('bank_connections')
        .select('*');

    for (const conn of bankConns ?? []) {
        try {
            await v2Client.from('bank_connections').insert({
                ...conn,
                migrated_from_v1: true,
            });
            stats.connections.bank++;
        } catch (err) {
            // Ignore duplicates
        }
    }

    console.log(`✅ Connections: ${stats.connections.telegram} Telegram, ${stats.connections.whatsapp} WhatsApp, ${stats.connections.bank} Bank`);
}

// ============= Main =============
async function main() {
    console.log('🚀 PRISM V1 → V2 Data Migration');
    console.log('================================\n');

    if (!V1_SUPABASE_URL || !V2_SUPABASE_URL) {
        console.error('❌ Missing environment variables. Required:');
        console.error('   V1_SUPABASE_URL, V1_SUPABASE_SERVICE_KEY');
        console.error('   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
        process.exit(1);
    }

    try {
        await migrateUsers();
        await migrateTransactions();
        await migrateConnections();

        stats.endTime = new Date();
        const duration = (stats.endTime.getTime() - stats.startTime.getTime()) / 1000;

        console.log('\n================================');
        console.log('📊 Migration Complete!');
        console.log('================================');
        console.log(`Duration: ${duration.toFixed(2)}s`);
        console.log(`Users: ${stats.users.migrated} migrated, ${stats.users.skipped} skipped`);
        console.log(`Transactions: ${stats.transactions.migrated} migrated`);
        console.log(`Connections: ${stats.connections.telegram + stats.connections.whatsapp + stats.connections.bank} total`);

    } catch (error) {
        console.error('\n❌ Migration failed:', error);
        process.exit(1);
    }
}

main();
