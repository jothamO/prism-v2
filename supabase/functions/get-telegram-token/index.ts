// =====================================================
// PRISM V2 - Get Telegram Token Edge Function
// Retrieves existing valid token for user
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

        // Get existing valid token
        const { data: token, error } = await supabase
            .from('telegram_tokens')
            .select('token, expires_at')
            .eq('user_id', user.id)
            .eq('used', false)
            .gt('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false })
            .maybeSingle();

        if (error) {
            console.log('[get-telegram-token] Token table error:', error.message);
            return new Response(
                JSON.stringify({ success: false, token: null }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        if (!token) {
            return new Response(
                JSON.stringify({ success: false, token: null }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        return new Response(
            JSON.stringify({
                success: true,
                token: token.token,
                expiresAt: token.expires_at,
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('[get-telegram-token] Error:', error);
        return new Response(
            JSON.stringify({ success: false, error: (error as Error).message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
