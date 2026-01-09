// =====================================================
// PRISM V2 - Generate PDF Report Edge Function
// Generate tax and transaction reports
// =====================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface ReportRequest {
    userId: string;
    reportType: 'transactions' | 'tax_summary' | 'vat_reconciliation' | 'income_tax';
    period: string;
    format: 'pdf' | 'csv';
}

function getPeriodDates(period: string): { start: Date; end: Date } {
    const now = new Date();
    let start: Date;
    let end: Date = new Date();

    switch (period) {
        case 'this_month':
            start = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
        case 'last_month':
            start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            end = new Date(now.getFullYear(), now.getMonth(), 0);
            break;
        case 'this_quarter':
            const quarter = Math.floor(now.getMonth() / 3);
            start = new Date(now.getFullYear(), quarter * 3, 1);
            break;
        case 'this_year':
            start = new Date(now.getFullYear(), 0, 1);
            break;
        case 'last_year':
            start = new Date(now.getFullYear() - 1, 0, 1);
            end = new Date(now.getFullYear() - 1, 11, 31);
            break;
        default:
            start = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return { start, end };
}

async function generateTransactionReport(userId: string, start: Date, end: Date, format: string) {
    const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .gte('date', start.toISOString())
        .lte('date', end.toISOString())
        .order('date', { ascending: false });

    if (format === 'csv') {
        const headers = 'Date,Description,Amount,Type,Category\n';
        const rows = (transactions ?? [])
            .map(t => `${t.date},${t.description?.replace(/,/g, ' ')},${t.amount},${t.type},${t.category ?? 'uncategorized'}`)
            .join('\n');
        return headers + rows;
    }

    // For PDF, return structured data (would need PDF library on client)
    return JSON.stringify({
        title: 'Transaction Report',
        period: `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`,
        transactions: transactions ?? [],
        summary: {
            totalCredit: (transactions ?? []).filter(t => t.type === 'credit').reduce((s, t) => s + Number(t.amount), 0),
            totalDebit: (transactions ?? []).filter(t => t.type === 'debit').reduce((s, t) => s + Number(t.amount), 0),
            count: transactions?.length ?? 0,
        },
    });
}

async function generateTaxSummaryReport(userId: string, start: Date, end: Date) {
    const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .gte('date', start.toISOString())
        .lte('date', end.toISOString());

    const income = (transactions ?? [])
        .filter(t => t.type === 'credit')
        .reduce((s, t) => s + Number(t.amount), 0);

    const expenses = (transactions ?? [])
        .filter(t => t.type === 'debit')
        .reduce((s, t) => s + Number(t.amount), 0);

    // Nigerian PIT calculation
    const taxableIncome = income;
    const bands = [
        { min: 0, max: 300000, rate: 0.07 },
        { min: 300000, max: 600000, rate: 0.11 },
        { min: 600000, max: 1100000, rate: 0.15 },
        { min: 1100000, max: 1600000, rate: 0.19 },
        { min: 1600000, max: 3200000, rate: 0.21 },
        { min: 3200000, max: Infinity, rate: 0.24 },
    ];

    let tax = 0;
    let remaining = taxableIncome;
    for (const band of bands) {
        if (remaining <= 0) break;
        const taxable = Math.min(remaining, band.max - band.min);
        tax += taxable * band.rate;
        remaining -= taxable;
    }

    return JSON.stringify({
        title: 'Tax Summary Report',
        period: `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`,
        income,
        expenses,
        netIncome: income - expenses,
        estimatedTax: tax,
        effectiveRate: income > 0 ? (tax / income) * 100 : 0,
    });
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const body: ReportRequest = await req.json();
        const { userId, reportType, period, format } = body;

        if (!userId || !reportType) {
            throw new Error('Missing userId or reportType');
        }

        const { start, end } = getPeriodDates(period);
        let content: string;

        switch (reportType) {
            case 'transactions':
                content = await generateTransactionReport(userId, start, end, format);
                break;
            case 'tax_summary':
            case 'income_tax':
                content = await generateTaxSummaryReport(userId, start, end);
                break;
            case 'vat_reconciliation':
                // Simplified VAT report
                content = await generateTransactionReport(userId, start, end, format);
                break;
            default:
                throw new Error('Invalid report type');
        }

        const contentType = format === 'csv'
            ? 'text/csv'
            : 'application/json';

        return new Response(
            JSON.stringify({ success: true, content, contentType }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('[generate-pdf-report] Error:', error);
        return new Response(
            JSON.stringify({ success: false, error: (error as Error).message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
