// =====================================================
// PRISM V2 - User Dashboard (Mobile-First)
// Home screen with Tax Health and transactions
// =====================================================

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/domains/auth';
import { useTransactionStats, useTransactions } from '@/domains/transactions';
import { useTaxHealth } from '@/domains/tax';
import { TaxHealthCard, TransactionCard } from '@/ui/components';

export function Dashboard() {
    const { user } = useAuth();

    // Get transaction stats for tax health
    const { stats } = useTransactionStats();

    // Get recent transactions
    const { transactions, loading } = useTransactions({ limit: 5 });

    // Calculate tax health
    const healthMetrics = useMemo(() => ({
        categorizedTransactions: stats?.categorizedCount ?? 0,
        totalTransactions: stats?.transactionCount ?? 0,
        filedReturns: 0,
        dueReturns: 0,
    }), [stats]);

    const { score, categorizationPercent } = useTaxHealth(healthMetrics);

    // Get greeting based on time
    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    }, []);

    // Get first name
    const firstName = user?.email?.split('@')[0] ?? 'there';

    return (
        <div className="pb-20 px-4 pt-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-500 dark:text-gray-400">{greeting},</p>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                        {firstName}
                    </h1>
                </div>
                <button className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[hsl(240,24%,26%)]">
                    <span className="text-xl">🔔</span>
                    <span className="absolute top-1 right-1 w-2 h-2 bg-[hsl(346,96%,63%)] rounded-full" />
                </button>
            </div>

            {/* Tax Health Card */}
            <TaxHealthCard
                score={score}
                ytdIncome={stats?.totalIncome ?? 0}
                taxReady={categorizationPercent >= 80}
            />

            {/* Quick Actions */}
            <div>
                <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
                    Quick Actions
                </h2>
                <div className="grid grid-cols-4 gap-4">
                    {[
                        { icon: '📊', label: 'Reports', path: '/reports' },
                        { icon: '📅', label: 'Calendar', path: '/tax-calendar' },
                        { icon: '💳', label: 'Transactions', path: '/transactions' },
                        { icon: '⚙️', label: 'Settings', path: '/settings' },
                    ].map((action) => (
                        <Link
                            key={action.label}
                            to={action.path}
                            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white dark:bg-[hsl(240,27%,20%)] shadow-sm hover:shadow-md transition-shadow"
                        >
                            <span className="text-2xl">{action.icon}</span>
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                {action.label}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Recent Transactions */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                        Recent Transactions
                    </h2>
                    <Link
                        to="/transactions"
                        className="text-sm font-medium text-[hsl(248,80%,36%)] dark:text-[hsl(248,36%,53%)]"
                    >
                        See All
                    </Link>
                </div>

                <div className="space-y-2 bg-white dark:bg-[hsl(240,27%,20%)] rounded-2xl overflow-hidden shadow-sm">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Loading...</div>
                    ) : transactions.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No transactions yet
                        </div>
                    ) : (
                        transactions.map((tx) => (
                            <TransactionCard
                                key={tx.id}
                                icon={tx.type === 'credit' ? '💰' : '🛒'}
                                title={tx.description}
                                subtitle={tx.category ?? 'Needs categorization'}
                                amount={Number(tx.amount)}
                                type={tx.type as 'credit' | 'debit'}
                                needsCategorization={!tx.category}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
