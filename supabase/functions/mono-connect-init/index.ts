// =====================================================
// PRISM V2 - Mono Connect Init Edge Function
// Initialize Mono widget for bank linking
// =====================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MONO_SECRET_KEY = Deno.env.get('MONO_SECRET_KEY');
const MONO_PUBLIC_KEY = Deno.env.get('MONO_PUBLIC_KEY');
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
            Deno.env.get('SUPABASE_ANON_KEY') || ''
        );

        const { data: { user }, error: authError } = await anonClient.auth.getUser(
            authHeader.replace('Bearer ', '')
        );

        if (authError || !user) {
            throw new Error('Invalid authentication');
        }

        // Check for existing connections
        const { data: existingConnections } = await supabase
            .from('bank_connections')
            .select('id, bank_name, status')
            .eq('user_id', user.id)
            .eq('status', 'active');

        // Return Mono public key and any existing connections
        return new Response(
            JSON.stringify({
                success: true,
                publicKey: MONO_PUBLIC_KEY,
                existingConnections: existingConnections ?? [],
                userId: user.id,
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('[mono-connect-init] Error:', error);
        return new Response(
            JSON.stringify({ success: false, error: (error as Error).message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
