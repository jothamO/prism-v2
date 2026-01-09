// =====================================================
// PRISM V2 - Insights Page
// AI-powered financial insights and recommendations
// =====================================================

import { useState, useEffect } from 'react';
import { Card, Button } from '@/ui/components';
import { formatCurrency } from '@/shared/utils';

interface Insight {
    id: string;
    type: 'saving' | 'alert' | 'opportunity' | 'trend';
    title: string;
    description: string;
    impact?: number;
    actionLabel?: string;
    actionUrl?: string;
    priority: 'high' | 'medium' | 'low';
    createdAt: string;
}

interface TrendData {
    month: string;
    income: number;
    expenses: number;
    tax: number;
}

export function InsightsPage() {
    const [loading, setLoading] = useState(true);
    const [insights, setInsights] = useState<Insight[]>([]);
    const [trends, setTrends] = useState<TrendData[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadInsights();
    }, []);

    const loadInsights = async () => {
        setLoading(true);
        try {
            // In production, these would come from AI analysis
            // For now, generate contextual mock insights
            await new Promise(resolve => setTimeout(resolve, 500));

            const mockInsights: Insight[] = [
                {
                    id: '1',
                    type: 'saving',
                    title: 'Claim Office Expenses Deduction',
                    description: 'You have ₦45,000 in office-related expenses this month that may be tax-deductible.',
                    impact: 6750,
                    actionLabel: 'Review Expenses',
                    actionUrl: '/transactions?category=office',
                    priority: 'high',
                    createdAt: new Date().toISOString(),
                },
                {
                    id: '2',
                    type: 'alert',
                    title: 'VAT Return Due in 5 Days',
                    description: 'Your January 2026 VAT return is due on January 21st. Current VAT liability: ₦87,500.',
                    priority: 'high',
                    createdAt: new Date().toISOString(),
                },
                {
                    id: '3',
                    type: 'opportunity',
                    title: 'Consider Voluntary Pension',
                    description: 'Contributing to a pension fund could reduce your taxable income by up to ₦500,000 annually.',
                    impact: 120000,
                    actionLabel: 'Learn More',
                    actionUrl: '/education?article=pension-deductions',
                    priority: 'medium',
                    createdAt: new Date().toISOString(),
                },
                {
                    id: '4',
                    type: 'trend',
                    title: 'Income Up 23% This Quarter',
                    description: 'Your income has increased compared to last quarter. Consider adjusting your tax provisions.',
                    priority: 'low',
                    createdAt: new Date().toISOString(),
                },
                {
                    id: '5',
                    type: 'saving',
                    title: 'EMTL Refund Available',
                    description: 'Some of your EMTL charges may qualify for refund as business transfers. Total: ₦2,100.',
                    impact: 2100,
                    priority: 'low',
                    createdAt: new Date().toISOString(),
                },
            ];

            const mockTrends: TrendData[] = [
                { month: 'Sep', income: 450000, expenses: 180000, tax: 67500 },
                { month: 'Oct', income: 520000, expenses: 210000, tax: 78000 },
                { month: 'Nov', income: 480000, expenses: 195000, tax: 72000 },
                { month: 'Dec', income: 680000, expenses: 250000, tax: 102000 },
                { month: 'Jan', income: 550000, expenses: 220000, tax: 82500 },
            ];

            setInsights(mockInsights);
            setTrends(mockTrends);
        } catch (error) {
            console.error('Error loading insights:', error);
        } finally {
            setLoading(false);
        }
    };

    const refreshInsights = async () => {
        setRefreshing(true);
        // Call AI to regenerate insights
        await loadInsights();
        setRefreshing(false);
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'saving': return '💰';
            case 'alert': return '⚠️';
            case 'opportunity': return '💡';
            case 'trend': return '📈';
            default: return '📊';
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'saving': return 'bg-[hsl(164,59%,58%)]/10 border-[hsl(164,59%,58%)]/30';
            case 'alert': return 'bg-[hsl(38,100%,58%)]/10 border-[hsl(38,100%,58%)]/30';
            case 'opportunity': return 'bg-[hsl(248,80%,36%)]/10 border-[hsl(248,80%,36%)]/30';
            case 'trend': return 'bg-blue-100 dark:bg-blue-900/20 border-blue-300/30';
            default: return 'bg-gray-100 border-gray-200';
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'high':
                return <span className="px-2 py-0.5 text-xs rounded-full bg-[hsl(346,96%,63%)]/10 text-[hsl(346,96%,63%)]">High Priority</span>;
            case 'medium':
                return <span className="px-2 py-0.5 text-xs rounded-full bg-[hsl(38,100%,58%)]/10 text-[hsl(38,100%,58%)]">Medium</span>;
            default:
                return null;
        }
    };

    const totalPotentialSavings = insights
        .filter(i => i.type === 'saving' && i.impact)
        .reduce((sum, i) => sum + (i.impact ?? 0), 0);

    const highPriorityCount = insights.filter(i => i.priority === 'high').length;

    return (
        <div className="pb-20 px-4 pt-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Insights
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        AI-powered tax recommendations
                    </p>
                </div>
                <Button variant="outline" size="sm" loading={refreshing} onClick={refreshInsights}>
                    🔄 Refresh
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
                <Card className="!py-4 text-center bg-gradient-to-br from-[hsl(164,59%,58%)]/10 to-transparent">
                    <span className="text-2xl block mb-1">💰</span>
                    <p className="text-2xl font-bold text-[hsl(164,59%,58%)]">
                        {formatCurrency(totalPotentialSavings)}
                    </p>
                    <p className="text-xs text-gray-500">Potential Savings</p>
                </Card>
                <Card className="!py-4 text-center bg-gradient-to-br from-[hsl(38,100%,58%)]/10 to-transparent">
                    <span className="text-2xl block mb-1">⚡</span>
                    <p className="text-2xl font-bold text-[hsl(38,100%,58%)]">
                        {highPriorityCount}
                    </p>
                    <p className="text-xs text-gray-500">Action Items</p>
                </Card>
            </div>

            {/* Trends Chart (Simplified) */}
            <Card>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Financial Trends
                </h3>
                <div className="flex items-end justify-between h-32 gap-2">
                    {trends.map((trend, i) => {
                        const maxIncome = Math.max(...trends.map(t => t.income));
                        const height = (trend.income / maxIncome) * 100;
                        return (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                <div className="w-full flex flex-col justify-end h-24 gap-0.5">
                                    <div
                                        className="w-full bg-[hsl(164,59%,58%)] rounded-t"
                                        style={{ height: `${height}%` }}
                                    />
                                    <div
                                        className="w-full bg-gray-300 dark:bg-gray-600 rounded-b"
                                        style={{ height: `${(trend.expenses / maxIncome) * 100}%` }}
                                    />
                                </div>
                                <span className="text-xs text-gray-500">{trend.month}</span>
                            </div>
                        );
                    })}
                </div>
                <div className="flex gap-4 mt-4 text-xs">
                    <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded bg-[hsl(164,59%,58%)]" />
                        Income
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded bg-gray-300 dark:bg-gray-600" />
                        Expenses
                    </span>
                </div>
            </Card>

            {/* Insights List */}
            <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Your Insights ({insights.length})
                </h3>
                {loading ? (
                    <Card className="text-center py-12">
                        <p className="text-gray-500">Analyzing your data...</p>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {insights.map(insight => (
                            <Card
                                key={insight.id}
                                className={`border-l-4 ${getTypeColor(insight.type)}`}
                            >
                                <div className="flex gap-3">
                                    <span className="text-2xl">{getTypeIcon(insight.type)}</span>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-medium text-gray-900 dark:text-white">
                                                {insight.title}
                                            </h4>
                                            {getPriorityBadge(insight.priority)}
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {insight.description}
                                        </p>
                                        {insight.impact && (
                                            <p className="text-sm font-medium text-[hsl(164,59%,58%)] mt-2">
                                                Potential savings: {formatCurrency(insight.impact)}
                                            </p>
                                        )}
                                        {insight.actionLabel && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="mt-3"
                                                onClick={() => window.location.href = insight.actionUrl ?? '#'}
                                            >
                                                {insight.actionLabel} →
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
