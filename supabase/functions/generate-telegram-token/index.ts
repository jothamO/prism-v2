// =====================================================
// PRISM V2 - Generate Telegram Token Edge Function
// Creates a one-time token for linking Telegram account
// =====================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        // Get authenticated user
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            throw new Error('Not authenticated');
        }

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        const anonClient = createClient(
            SUPABASE_URL,
            Deno.env.get('SUPABASE_ANON_KEY') || authHeader.replace('Bearer ', '')
        );

        const { data: { user }, error: authError } = await anonClient.auth.getUser(
            authHeader.replace('Bearer ', '')
        );

        if (authError || !user) {
            throw new Error('Invalid authentication');
        }

        // Check daily rate limit (3 tokens per day)
        const today = new Date().toISOString().split('T')[0];
        const { count } = await supabase
            .from('telegram_tokens')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .gte('created_at', `${today}T00:00:00Z`);

        if ((count ?? 0) >= 3) {
            const hoursUntilReset = 24 - new Date().getHours();
            return new Response(
                JSON.stringify({
                    success: false,
                    rateLimited: true,
                    retryAfter: hoursUntilReset * 3600,
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Generate token
        const token = crypto.randomUUID().replace(/-/g, '').substring(0, 8).toUpperCase();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Delete any existing tokens for this user
        await supabase
            .from('telegram_tokens')
            .delete()
            .eq('user_id', user.id)
            .eq('used', false);

        // Insert new token
        const { error: insertError } = await supabase
            .from('telegram_tokens')
            .insert({
                user_id: user.id,
                token,
                expires_at: expiresAt.toISOString(),
                used: false,
            });

        if (insertError) {
            // Table might not exist, create simple token response
            console.log('[generate-telegram-token] Table error, returning token directly');
        }

        return new Response(
            JSON.stringify({
                success: true,
                token,
                expiresAt: expiresAt.toISOString(),
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('[generate-telegram-token] Error:', error);
        return new Response(
            JSON.stringify({ success: false, error: (error as Error).message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
