// =====================================================
// PRISM V2 - Batch Classify Edge Function
// Classifies up to 10 transactions in one API call
// =====================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TransactionInput {
    id: string;
    description: string;
    amount: number;
    type: 'credit' | 'debit';
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { transactions } = await req.json() as { transactions: TransactionInput[] };

        if (!transactions || transactions.length === 0) {
            return new Response(JSON.stringify({ results: [] }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Limit to 10 transactions per batch
        const batch = transactions.slice(0, 10);

        // Build batch prompt
        const txList = batch.map((tx, i) =>
            `${i + 1}. ID: ${tx.id}\n   Description: ${tx.description}\n   Amount: ₦${Math.abs(tx.amount).toLocaleString()}\n   Type: ${tx.type}`
        ).join('\n\n');

        const prompt = `Classify these Nigerian bank transactions:

${txList}

Categories: salary, business_income, investment, groceries, utilities, transport, bank_charges, transfer, personal, uncategorized

Nigerian context:
- POS = Point of Sale payment
- NIP = Bank transfer
- USSD = Mobile banking
- EMTL = ₦50 transfer levy

Respond with JSON array only:
[{"id": "...", "category": "...", "confidence": 0.0-1.0, "reasoning": "..."}]`;

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': Deno.env.get('ANTHROPIC_API_KEY') ?? '',
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-5-20250929',
                max_tokens: 8000,
                messages: [{ role: 'user', content: prompt }],
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Anthropic API error:', response.status, errorText);
            throw new Error(`API error: ${response.status}`);
        }

        const result = await response.json();
        const content = result.content?.[0]?.text ?? '[]';

        // Parse and validate response
        let results = [];
        try {
            results = JSON.parse(content);
        } catch {
            // If parsing fails, return uncategorized for all
            results = batch.map(tx => ({
                id: tx.id,
                category: 'uncategorized',
                confidence: 0,
                reasoning: 'Batch parse error',
            }));
        }

        return new Response(JSON.stringify({ results }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Batch classification error:', error);
        return new Response(
            JSON.stringify({ results: [], error: 'Batch classification failed' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
