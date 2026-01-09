// =====================================================
// PRISM V2 - Chat Assist Edge Function
// AI-powered tax assistant with Claude
// =====================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface RequestBody {
    message: string;
    history?: Message[];
    context?: {
        totalIncome?: number;
        totalExpenses?: number;
        emtlPaid?: number;
        transactionCount?: number;
    };
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
        if (!apiKey) {
            throw new Error('ANTHROPIC_API_KEY not configured');
        }

        const body: RequestBody = await req.json();
        const { message, history = [], context } = body;

        // Build context string
        let contextStr = '';
        if (context) {
            contextStr = `
User's Financial Context:
- Total Income (YTD): ₦${context.totalIncome?.toLocaleString() ?? 0}
- Total Expenses (YTD): ₦${context.totalExpenses?.toLocaleString() ?? 0}
- EMTL Paid: ₦${context.emtlPaid?.toLocaleString() ?? 0}
- Transaction Count: ${context.transactionCount ?? 0}
`;
        }

        // Build conversation history
        const messages = [
            ...history.map(msg => ({
                role: msg.role,
                content: msg.content,
            })),
            {
                role: 'user' as const,
                content: message,
            },
        ];

        // Call Claude
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-5-20250929',
                max_tokens: 1024,
                system: `You are PRISM, a friendly and knowledgeable Nigerian tax assistant. You help users understand Nigerian tax laws, calculate their obligations, and stay compliant.

Key knowledge areas:
- Personal Income Tax (PIT) with graduated rates from 7% to 24%
- Value Added Tax (VAT) at 7.5%
- Company Income Tax (CIT) at 30%
- Electronic Money Transfer Levy (EMTL) of ₦50 per transfer ≥₦10,000
- Withholding Tax (WHT) at various rates
- PAYE (Pay As You Earn) system
- Tax deductions and allowances
- Filing deadlines and compliance requirements

${contextStr}

Guidelines:
1. Be warm, friendly, and use Nigerian expressions occasionally (e.g., "No wahala!")
2. Reference the user's actual financial data when relevant
3. Provide specific, actionable advice
4. Use Nigerian Naira (₦) for all amounts
5. Cite relevant tax laws (e.g., "Under the Nigeria Tax Act 2025...")
6. Keep responses concise but comprehensive
7. If unsure, recommend consulting a tax professional`,
                messages,
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('[chat-assist] Claude API error:', error);
            throw new Error('Failed to get response from AI');
        }

        const data = await response.json();
        const assistantResponse = data.content?.[0]?.text ?? 'I apologize, I could not generate a response.';

        return new Response(
            JSON.stringify({ response: assistantResponse }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('[chat-assist] Error:', error);
        return new Response(
            JSON.stringify({ error: (error as Error).message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
