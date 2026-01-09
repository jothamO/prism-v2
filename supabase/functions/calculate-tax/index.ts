// =====================================================
// PRISM V2 - Calculate Tax Edge Function
// Calculate Nigerian taxes (PIT, CIT, VAT, EMTL)
// =====================================================

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TaxCalculationRequest {
    type: 'pit' | 'cit' | 'vat' | 'emtl' | 'all';
    income?: number;
    expenses?: number;
    transferAmount?: number;
    vatableAmount?: number;
    isVatRegistered?: boolean;
}

interface PITResult {
    taxableIncome: number;
    taxAmount: number;
    effectiveRate: number;
    breakdown: { band: string; taxable: number; rate: number; tax: number }[];
}

interface VATResult {
    netAmount: number;
    vatAmount: number;
    grossAmount: number;
    rate: number;
}

interface EMTLResult {
    transferAmount: number;
    emtlCharge: number;
    threshold: number;
    applicable: boolean;
}

interface CITResult {
    taxableProfit: number;
    taxAmount: number;
    rate: number;
    category: 'small' | 'medium' | 'large';
}

// Nigerian Personal Income Tax (PIT) bands
function calculatePIT(grossIncome: number, deductions: number = 0): PITResult {
    const taxableIncome = Math.max(0, grossIncome - deductions);

    const bands = [
        { min: 0, max: 300000, rate: 0.07, label: 'First ₦300,000' },
        { min: 300000, max: 600000, rate: 0.11, label: 'Next ₦300,000' },
        { min: 600000, max: 1100000, rate: 0.15, label: 'Next ₦500,000' },
        { min: 1100000, max: 1600000, rate: 0.19, label: 'Next ₦500,000' },
        { min: 1600000, max: 3200000, rate: 0.21, label: 'Next ₦1,600,000' },
        { min: 3200000, max: Infinity, rate: 0.24, label: 'Above ₦3,200,000' },
    ];

    let remaining = taxableIncome;
    let totalTax = 0;
    const breakdown: { band: string; taxable: number; rate: number; tax: number }[] = [];

    for (const band of bands) {
        if (remaining <= 0) break;

        const bandWidth = band.max === Infinity ? remaining : band.max - band.min;
        const taxable = Math.min(remaining, bandWidth);
        const tax = taxable * band.rate;

        if (taxable > 0) {
            breakdown.push({
                band: band.label,
                taxable,
                rate: band.rate * 100,
                tax,
            });
        }

        totalTax += tax;
        remaining -= taxable;
    }

    return {
        taxableIncome,
        taxAmount: totalTax,
        effectiveRate: taxableIncome > 0 ? (totalTax / taxableIncome) * 100 : 0,
        breakdown,
    };
}

// Nigerian VAT (7.5%)
function calculateVAT(amount: number, inclusive: boolean = false): VATResult {
    const rate = 0.075;

    if (inclusive) {
        const netAmount = amount / (1 + rate);
        const vatAmount = amount - netAmount;
        return { netAmount, vatAmount, grossAmount: amount, rate: rate * 100 };
    } else {
        const vatAmount = amount * rate;
        return { netAmount: amount, vatAmount, grossAmount: amount + vatAmount, rate: rate * 100 };
    }
}

// Nigerian EMTL (Electronic Money Transfer Levy)
function calculateEMTL(transferAmount: number): EMTLResult {
    const threshold = 10000;
    const charge = 50;
    const applicable = transferAmount >= threshold;

    return {
        transferAmount,
        emtlCharge: applicable ? charge : 0,
        threshold,
        applicable,
    };
}

// Nigerian Company Income Tax (CIT)
function calculateCIT(taxableProfit: number, turnover: number = 0): CITResult {
    // CIT rates based on company size
    // Small: ₦0-25M turnover = 0%
    // Medium: ₦25M-100M turnover = 20%
    // Large: >₦100M turnover = 30%

    let rate: number;
    let category: 'small' | 'medium' | 'large';

    if (turnover <= 25000000) {
        rate = 0;
        category = 'small';
    } else if (turnover <= 100000000) {
        rate = 0.20;
        category = 'medium';
    } else {
        rate = 0.30;
        category = 'large';
    }

    return {
        taxableProfit,
        taxAmount: taxableProfit * rate,
        rate: rate * 100,
        category,
    };
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const body: TaxCalculationRequest = await req.json();
        const { type, income = 0, expenses = 0, transferAmount = 0, vatableAmount = 0, isVatRegistered = false } = body;

        const results: Record<string, unknown> = {};

        if (type === 'pit' || type === 'all') {
            results.pit = calculatePIT(income, expenses);
        }

        if (type === 'vat' || type === 'all') {
            results.vat = calculateVAT(vatableAmount || income);
        }

        if (type === 'emtl' || type === 'all') {
            results.emtl = calculateEMTL(transferAmount || income);
        }

        if (type === 'cit' || type === 'all') {
            results.cit = calculateCIT(income - expenses, income);
        }

        // Summary if all types requested
        if (type === 'all') {
            const pit = results.pit as PITResult;
            const vat = results.vat as VATResult;
            const emtl = results.emtl as EMTLResult;

            results.summary = {
                totalIncome: income,
                totalExpenses: expenses,
                netIncome: income - expenses,
                estimatedTotalTax: pit.taxAmount + (isVatRegistered ? vat.vatAmount : 0),
                breakdown: {
                    incomeTax: pit.taxAmount,
                    vat: isVatRegistered ? vat.vatAmount : 0,
                    emtl: emtl.emtlCharge,
                },
            };
        }

        return new Response(
            JSON.stringify({ success: true, ...results }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('[calculate-tax] Error:', error);
        return new Response(
            JSON.stringify({ success: false, error: (error as Error).message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
