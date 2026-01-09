// =====================================================
// PRISM V2 - Mono Sync Transactions Edge Function
// Sync transactions from connected bank accounts
// =====================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MONO_SECRET_KEY = Deno.env.get('MONO_SECRET_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface MonoTransaction {
    _id: string;
    narration: string;
    amount: number;
    type: 'debit' | 'credit';
    balance: number;
    date: string;
    category?: string;
}

async function fetchMonoTransactions(accountId: string, startDate?: string, endDate?: string): Promise<MonoTransaction[]> {
    if (!MONO_SECRET_KEY) {
        throw new Error('MONO_SECRET_KEY not configured');
    }

    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const url = new URL(`https://api.withmono.com/v2/accounts/${accountId}/transactions`);
    url.searchParams.set('start', startDate ?? thirtyDaysAgo);
    url.searchParams.set('end', endDate ?? today);
    url.searchParams.set('paginate', 'false');

    const response = await fetch(url.toString(), {
        headers: {
            'mono-sec-key': MONO_SECRET_KEY,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.text();
        console.error('[mono-sync] Mono API error:', error);
        throw new Error('Failed to fetch transactions from Mono');
    }

    const data = await response.json();
    return data.data ?? [];
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const body = await req.json();
        const { connectionId, userId, startDate, endDate } = body;

        if (!connectionId || !userId) {
            throw new Error('Missing connectionId or userId');
        }

        // Get connection details
        const { data: connection, error: connError } = await supabase
            .from('bank_connections')
            .select('*')
            .eq('id', connectionId)
            .eq('user_id', userId)
            .single();

        if (connError || !connection) {
            throw new Error('Connection not found');
        }

        if (!connection.mono_account_id) {
            throw new Error('No Mono account linked');
        }

        // Fetch transactions from Mono
        const monoTransactions = await fetchMonoTransactions(
            connection.mono_account_id,
            startDate,
            endDate
        );

        console.log(`[mono-sync] Fetched ${monoTransactions.length} transactions`);

        // Get existing transaction IDs to avoid duplicates
        const { data: existingTxs } = await supabase
            .from('transactions')
            .select('external_id')
            .eq('user_id', userId)
            .eq('source', 'mono');

        const existingIds = new Set(existingTxs?.map(t => t.external_id) ?? []);

        // Filter and prepare new transactions
        const newTransactions = monoTransactions
            .filter(tx => !existingIds.has(tx._id))
            .map(tx => ({
                user_id: userId,
                external_id: tx._id,
                description: tx.narration,
                amount: tx.amount / 100, // Mono returns kobo
                type: tx.type,
                date: tx.date,
                source: 'mono',
                bank_connection_id: connectionId,
                categorization_status: 'pending',
            }));

        if (newTransactions.length > 0) {
            const { error: insertError } = await supabase
                .from('transactions')
                .insert(newTransactions);

            if (insertError) {
                console.error('[mono-sync] Insert error:', insertError);
                throw new Error('Failed to insert transactions');
            }
        }

        // Update last sync time
        await supabase
            .from('bank_connections')
            .update({ last_synced_at: new Date().toISOString() })
            .eq('id', connectionId);

        return new Response(
            JSON.stringify({
                success: true,
                fetched: monoTransactions.length,
                inserted: newTransactions.length,
                skipped: monoTransactions.length - newTransactions.length,
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('[mono-sync] Error:', error);
        return new Response(
            JSON.stringify({ success: false, error: (error as Error).message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
