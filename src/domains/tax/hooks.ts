// =====================================================
// PRISM V2 - Tax Domain Hooks
// React hooks for tax-related functionality
// =====================================================

import { useMemo, useState } from 'react';
import { TaxYear, TaxResult } from '@/shared/types';
import { TAX_BANDS } from '@/shared/constants';
import { calculatePIT, calculateEMTL, calculateVAT, getAvailableTaxYears } from './calculator';

/**
 * Hook for tax calculation with memoization
 */
export function useTaxCalculation(income: number, year: TaxYear = 2026): TaxResult {
    return useMemo(() => calculatePIT(income, year), [income, year]);
}

/**
 * Hook for tax year selection with validation
 */
export function useTaxYear(defaultYear: TaxYear = 2026) {
    const [selectedYear, setSelectedYear] = useState<TaxYear>(defaultYear);
    const availableYears = getAvailableTaxYears();

    const isHistoricalMode = selectedYear < 2026;
    const currentBands = TAX_BANDS[selectedYear];

    return {
        selectedYear,
        setSelectedYear,
        availableYears,
        isHistoricalMode,
        currentBands,
    };
}

/**
 * Hook for EMTL calculation
 */
export function useEMTL(amount: number) {
    return useMemo(() => ({
        levy: calculateEMTL(amount),
        applies: amount >= 10000,
        threshold: 10000,
        rate: 50,
    }), [amount]);
}

/**
 * Hook for VAT calculation
 */
export function useVAT(amount: number, rate: number = 0.075) {
    return useMemo(() => ({
        vat: calculateVAT(amount, rate),
        rate,
        ratePercent: `${rate * 100}%`,
    }), [amount, rate]);
}

/**
 * Hook for tax health score calculation
 */
export function useTaxHealth(metrics: {
    categorizedTransactions: number;
    totalTransactions: number;
    filedReturns: number;
    dueReturns: number;
}) {
    return useMemo(() => {
        const categorizationScore = metrics.totalTransactions > 0
            ? (metrics.categorizedTransactions / metrics.totalTransactions) * 40
            : 0;

        const filingScore = metrics.dueReturns > 0
            ? (metrics.filedReturns / metrics.dueReturns) * 60
            : 60; // Full score if nothing due

        const totalScore = Math.round(categorizationScore + filingScore);

        return {
            score: totalScore,
            categorizationPercent: Math.round((metrics.categorizedTransactions / Math.max(metrics.totalTransactions, 1)) * 100),
            filingPercent: Math.round((metrics.filedReturns / Math.max(metrics.dueReturns, 1)) * 100),
            status: totalScore >= 90 ? 'excellent' : totalScore >= 70 ? 'good' : totalScore >= 50 ? 'fair' : 'needs_attention',
        };
    }, [metrics]);
}
