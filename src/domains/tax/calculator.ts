// =====================================================
// PRISM V2 - Tax Calculator
// Pure functions for all tax calculations
// =====================================================

import { TaxResult, TaxBandBreakdown, TaxYear } from '@/shared/types';
import { TAX_BANDS, EMTL_THRESHOLD, EMTL_AMOUNT, VAT_RATE } from '@/shared/constants';

/**
 * Calculate Personal Income Tax (PAYE)
 * Uses graduated tax bands based on Nigeria Tax Act
 */
export function calculatePIT(income: number, year: TaxYear = 2026): TaxResult {
    const config = TAX_BANDS[year];
    if (!config) {
        throw new Error(`No tax bands configured for year ${year}`);
    }

    // Apply exemption
    let taxableIncome = Math.max(0, income - config.exemption);
    let totalTax = 0;
    const breakdown: TaxBandBreakdown[] = [];

    // Calculate tax for each band
    for (const band of config.bands) {
        if (taxableIncome <= 0) break;

        const bandWidth = band.ceiling - band.floor;
        const taxableInBand = Math.min(taxableIncome, bandWidth);
        const taxInBand = taxableInBand * band.rate;

        breakdown.push({
            band: band.name,
            taxableAmount: taxableInBand,
            rate: band.rate,
            tax: taxInBand,
        });

        totalTax += taxInBand;
        taxableIncome -= taxableInBand;
    }

    const effectiveRate = income > 0 ? totalTax / income : 0;

    return {
        totalTax: Math.round(totalTax),
        effectiveRate: Math.round(effectiveRate * 10000) / 10000, // 4 decimal places
        breakdown,
    };
}

/**
 * Calculate VAT on an amount
 */
export function calculateVAT(amount: number, rate: number = VAT_RATE): number {
    return Math.round(amount * rate);
}

/**
 * Calculate EMTL (Electronic Money Transfer Levy)
 * ₦50 per transfer of ₦10,000 or more
 */
export function calculateEMTL(
    amount: number,
    threshold: number = EMTL_THRESHOLD,
    levy: number = EMTL_AMOUNT
): number {
    return amount >= threshold ? levy : 0;
}

/**
 * Check if an income amount is tax-exempt for a given year
 */
export function isTaxExempt(income: number, year: TaxYear = 2026): boolean {
    const config = TAX_BANDS[year];
    return income <= (config?.exemption ?? 0);
}

/**
 * Get the exemption amount for a given year
 */
export function getExemption(year: TaxYear = 2026): number {
    return TAX_BANDS[year]?.exemption ?? 0;
}

/**
 * Get all available tax years
 */
export function getAvailableTaxYears(): TaxYear[] {
    return Object.keys(TAX_BANDS).map(Number) as TaxYear[];
}

/**
 * Calculate total estimated tax liability for a year
 */
export function calculateAnnualTaxLiability(
    totalIncome: number,
    totalVATableExpenses: number,
    year: TaxYear = 2026
): {
    pit: number;
    vatRecoverable: number;
    netTax: number;
} {
    const pitResult = calculatePIT(totalIncome, year);
    const vatRecoverable = calculateVAT(totalVATableExpenses);

    return {
        pit: pitResult.totalTax,
        vatRecoverable,
        netTax: pitResult.totalTax - vatRecoverable,
    };
}
