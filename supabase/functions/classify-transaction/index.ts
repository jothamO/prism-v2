// =====================================================
// PRISM V2 - Classify Transaction Edge Function
// Supabase Edge Function for AI classification
// =====================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { description, amount, type } = await req.json();

        // Build classification prompt
        const prompt = `Classify this Nigerian bank transaction:
Description: ${description}
Amount: ₦${Math.abs(amount).toLocaleString()}
Type: ${type}

Categories:
- salary: Regular employment income, payroll
- business_income: Business revenue, customer payments
- investment: Dividends, interest, capital gains
- groceries: Food, supermarket, provisions
- utilities: Electricity, water, internet, phone bills
- transport: Fuel, Uber, taxi, bus
- bank_charges: EMTL, SMS alerts, maintenance fees, COT, stamp duty
- transfer: Money transfers between own accounts
- personal: Non-business expenses
- uncategorized: Cannot determine

Nigerian context:
- POS = Point of Sale (card payment)
- NIP = NIBSS Instant Payment (bank transfer)
- USSD = Mobile banking codes (*737#, *901#)
- EMTL = Electronic Money Transfer Levy (₦50 fee)

Respond with JSON only: {"category": "...", "confidence": 0.0-1.0, "reasoning": "..."}`;

        // Call Claude API
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
        const content = result.content?.[0]?.text ?? '{}';

        // Parse response
        const classification = JSON.parse(content);

        return new Response(JSON.stringify(classification), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Classification error:', error);
        return new Response(
            JSON.stringify({
                category: 'uncategorized',
                confidence: 0,
                reasoning: 'Classification error'
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
