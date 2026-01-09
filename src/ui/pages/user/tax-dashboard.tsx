// =====================================================
// PRISM V2 - Tax Dashboard (Mobile-First)
// Tax overview with year selector and breakdowns
// =====================================================

import { useState, useMemo } from 'react';
import { useTaxYear, useTaxCalculation } from '@/domains/tax';
import { useTaxableTransactions } from '@/domains/transactions';
import { Card, StatCard, Select } from '@/ui/components';
import { formatCurrency } from '@/shared/utils';

export function TaxDashboard() {
    const { selectedYear, setSelectedYear, availableYears, currentBands, isHistoricalMode } = useTaxYear();

    // Get taxable transactions for selected year
    const { taxableIncome, deductibleExpenses, loading } = useTaxableTransactions(selectedYear);

    // Calculate tax
    const taxResult = useTaxCalculation(taxableIncome, selectedYear);

    // Year options for select
    const yearOptions = useMemo(() =>
        availableYears.map(y => ({ value: String(y), label: String(y) })),
        [availableYears]
    );

    return (
        <div className="pb-20 px-4 pt-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Tax Dashboard
                </h1>
                <Select
                    value={String(selectedYear)}
                    onChange={(e) => setSelectedYear(Number(e.target.value) as 2024 | 2025 | 2026)}
                    options={yearOptions}
                    className="w-24"
                />
            </div>

            {/* Historical Mode Banner */}
            {isHistoricalMode && (
                <div className="p-4 rounded-xl bg-[hsl(38,100%,58%)]/10 border border-[hsl(38,100%,58%)]/20">
                    <div className="flex items-center gap-2 text-[hsl(38,100%,45%)]">
                        <span>📅</span>
                        <span className="font-medium">Historical Mode: {selectedYear}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Viewing tax rules as they applied in {selectedYear}
                    </p>
                </div>
            )}

            {/* Compliance Score Card */}
            <Card className="!p-0 overflow-hidden">
                <div className="p-6 bg-gradient-to-br from-[hsl(248,80%,36%)] to-[hsl(248,36%,53%)] text-white">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-2xl">🎯</span>
                        <span className="text-lg font-medium opacity-90">Tax Position</span>
                    </div>

                    <div className="text-4xl font-bold mb-2">
                        {formatCurrency(taxResult.totalTax)}
                    </div>
                    <p className="text-sm opacity-80">
                        Estimated tax liability for {selectedYear}
                    </p>
                </div>

                <div className="p-4 bg-white dark:bg-[hsl(240,27%,20%)]">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Effective Rate</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                            {(taxResult.effectiveRate * 100).toFixed(1)}%
                        </span>
                    </div>
                </div>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                <StatCard
                    title="YTD Income"
                    value={taxableIncome}
                    icon="💰"
                />
                <StatCard
                    title="Deductible"
                    value={deductibleExpenses}
                    icon="📉"
                />
            </div>

            {/* Tax Bands Info */}
            <Card>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                    {selectedYear} Tax Bands
                </h3>
                <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Exemption Threshold</span>
                        <span className="font-medium text-[hsl(164,59%,58%)]">
                            {formatCurrency(currentBands?.exemption ?? 0)}
                        </span>
                    </div>
                    <hr className="border-gray-200 dark:border-[hsl(240,24%,30%)]" />
                    {currentBands?.bands.map((band, i) => (
                        <div key={i} className="flex justify-between text-sm">
                            <span className="text-gray-500">
                                {band.name}: {formatCurrency(band.floor)} - {band.ceiling < Infinity ? formatCurrency(band.ceiling) : '∞'}
                            </span>
                            <span className="font-medium text-gray-900 dark:text-white">
                                {(band.rate * 100).toFixed(0)}%
                            </span>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Tax Breakdown */}
            <Card>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Your Tax Breakdown
                </h3>
                <div className="space-y-3">
                    {taxResult.breakdown.map((item, i) => (
                        <div key={i} className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {item.band}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {formatCurrency(item.taxableAmount)} @ {(item.rate * 100).toFixed(0)}%
                                </p>
                            </div>
                            <span className="font-semibold text-gray-900 dark:text-white">
                                {formatCurrency(item.tax)}
                            </span>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}
