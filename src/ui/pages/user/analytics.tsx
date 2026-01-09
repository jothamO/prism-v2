// =====================================================
// PRISM V2 - Analytics Page
// Financial insights and charts
// =====================================================

import { useState, useMemo } from 'react';
import { useMonthlySummary, useTransactionStats } from '@/domains/transactions';
import { Card, StatCard, Select } from '@/ui/components';
import { formatCurrency } from '@/shared/utils';

export function AnalyticsPage() {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const { data: monthlyData, loading } = useMonthlySummary(selectedYear);
    const { stats } = useTransactionStats();

    const yearOptions = useMemo(() => {
        const years = [];
        for (let y = 2024; y <= new Date().getFullYear(); y++) {
            years.push({ value: String(y), label: String(y) });
        }
        return years;
    }, []);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const totalIncome = monthlyData.reduce((sum, m) => sum + m.income, 0);
    const totalExpenses = monthlyData.reduce((sum, m) => sum + m.expenses, 0);
    const netIncome = totalIncome - totalExpenses;

    return (
        <div className="pb-20 px-4 pt-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Analytics
                </h1>
                <Select
                    value={String(selectedYear)}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    options={yearOptions}
                    className="w-24"
                />
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-4">
                <StatCard
                    title="Total Income"
                    value={totalIncome}
                    icon="💰"
                    trend="up"
                    change="YTD"
                />
                <StatCard
                    title="Total Expenses"
                    value={totalExpenses}
                    icon="💸"
                    trend="down"
                    change="YTD"
                />
            </div>

            {/* Net Income Card */}
            <Card className="!p-0 overflow-hidden">
                <div className={`p-6 ${netIncome >= 0 ? 'bg-[hsl(164,59%,58%)]/10' : 'bg-[hsl(346,96%,63%)]/10'}`}>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Net Income</p>
                    <p className={`text-3xl font-bold ${netIncome >= 0 ? 'text-[hsl(164,59%,58%)]' : 'text-[hsl(346,96%,63%)]'}`}>
                        {netIncome >= 0 ? '+' : ''}{formatCurrency(netIncome)}
                    </p>
                </div>
            </Card>

            {/* Monthly Breakdown */}
            <Card>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Monthly Breakdown
                </h3>

                {loading ? (
                    <div className="py-8 text-center text-gray-500">Loading...</div>
                ) : (
                    <div className="space-y-3">
                        {monthlyData.map((month) => (
                            <div key={month.month} className="flex items-center gap-4">
                                <span className="w-8 text-sm text-gray-500">
                                    {monthNames[month.month]}
                                </span>
                                <div className="flex-1">
                                    {/* Income bar */}
                                    <div className="h-4 bg-gray-100 dark:bg-[hsl(240,24%,26%)] rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[hsl(164,59%,58%)] rounded-full transition-all"
                                            style={{
                                                width: `${totalIncome > 0 ? (month.income / totalIncome) * 100 : 0}%`
                                            }}
                                        />
                                    </div>
                                </div>
                                <span className="w-24 text-right text-sm text-gray-900 dark:text-white">
                                    {formatCurrency(month.income)}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            {/* Categorization Stats */}
            <Card>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Categorization Progress
                </h3>
                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <div className="h-4 bg-gray-100 dark:bg-[hsl(240,24%,26%)] rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[hsl(248,80%,36%)] rounded-full"
                                style={{
                                    width: `${stats?.transactionCount ? (stats.categorizedCount / stats.transactionCount) * 100 : 0}%`
                                }}
                            />
                        </div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {stats?.categorizedCount ?? 0}/{stats?.transactionCount ?? 0}
                    </span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                    {stats?.uncategorizedCount ?? 0} transactions need categorization
                </p>
            </Card>
        </div>
    );
}
