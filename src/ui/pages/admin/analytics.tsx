// =====================================================
// PRISM V2 - Admin Analytics Page
// System-wide analytics and metrics
// =====================================================

import { useState, useMemo } from 'react';
import { Card, StatCard, Select } from '@/ui/components';
import { formatCurrency } from '@/shared/utils';

export function AdminAnalytics() {
    const [period, setPeriod] = useState('this_month');

    // Mock analytics data
    const stats = useMemo(() => ({
        totalUsers: 1247,
        activeUsers: 892,
        newUsersThisMonth: 156,
        totalTransactions: 45892,
        totalVolume: 2_450_000_000,
        classificationAccuracy: 94.7,
        avgResponseTime: 1.2,
        uptime: 99.94,
    }), [period]);

    const periodOptions = [
        { value: 'today', label: 'Today' },
        { value: 'this_week', label: 'This Week' },
        { value: 'this_month', label: 'This Month' },
        { value: 'this_quarter', label: 'This Quarter' },
        { value: 'this_year', label: 'This Year' },
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Analytics
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        System-wide metrics and performance
                    </p>
                </div>
                <Select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    options={periodOptions}
                    className="w-40"
                />
            </div>

            {/* User Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Users"
                    value={stats.totalUsers.toLocaleString()}
                    icon="👥"
                />
                <StatCard
                    title="Active Users"
                    value={stats.activeUsers.toLocaleString()}
                    trend="up"
                    change="+12% from last month"
                    icon="✨"
                />
                <StatCard
                    title="New This Month"
                    value={stats.newUsersThisMonth.toLocaleString()}
                    trend="up"
                    change="+8%"
                    icon="🆕"
                />
                <StatCard
                    title="Classification Accuracy"
                    value={`${stats.classificationAccuracy}%`}
                    trend="up"
                    change="Improved"
                    icon="🎯"
                />
            </div>

            {/* Transaction Stats */}
            <Card>
                <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Transaction Volume
                </h2>
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Total Transactions</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                            {stats.totalTransactions.toLocaleString()}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Total Volume</p>
                        <p className="text-3xl font-bold text-[hsl(164,59%,58%)]">
                            {formatCurrency(stats.totalVolume)}
                        </p>
                    </div>
                </div>

                {/* Simple bar chart placeholder */}
                <div className="mt-6 flex items-end gap-2 h-32">
                    {[65, 45, 80, 75, 90, 85, 70, 95, 88, 72, 78, 82].map((height, i) => (
                        <div
                            key={i}
                            className="flex-1 bg-[hsl(248,80%,36%)]/20 rounded-t-lg relative group"
                            style={{ height: `${height}%` }}
                        >
                            <div
                                className="absolute bottom-0 w-full bg-[hsl(248,80%,36%)] rounded-t-lg transition-all group-hover:bg-[hsl(248,80%,40%)]"
                                style={{ height: `${height}%` }}
                            />
                        </div>
                    ))}
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>Jan</span>
                    <span>Feb</span>
                    <span>Mar</span>
                    <span>Apr</span>
                    <span>May</span>
                    <span>Jun</span>
                    <span>Jul</span>
                    <span>Aug</span>
                    <span>Sep</span>
                    <span>Oct</span>
                    <span>Nov</span>
                    <span>Dec</span>
                </div>
            </Card>

            {/* System Health */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <div className="text-center">
                        <span className="text-4xl mb-2 block">⚡</span>
                        <p className="text-sm text-gray-500">Avg Response Time</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {stats.avgResponseTime}s
                        </p>
                    </div>
                </Card>
                <Card>
                    <div className="text-center">
                        <span className="text-4xl mb-2 block">🟢</span>
                        <p className="text-sm text-gray-500">Uptime</p>
                        <p className="text-2xl font-bold text-[hsl(164,59%,58%)]">
                            {stats.uptime}%
                        </p>
                    </div>
                </Card>
                <Card>
                    <div className="text-center">
                        <span className="text-4xl mb-2 block">🤖</span>
                        <p className="text-sm text-gray-500">AI Accuracy</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {stats.classificationAccuracy}%
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );
}
