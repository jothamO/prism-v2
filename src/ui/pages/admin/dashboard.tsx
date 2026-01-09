// =====================================================
// PRISM V2 - Admin Dashboard (Tablet-First)
// Overview with stats, users, and compliance
// =====================================================

import { useUsersList } from '@/domains/users';
import { useComplianceStats, useGaps } from '@/domains/compliance';
import { Card, StatCard } from '@/ui/components';
import { Link } from 'react-router-dom';

export function AdminDashboard() {
    const { users, count: userCount, loading: usersLoading } = useUsersList({ limit: 5 });
    const { stats } = useComplianceStats();
    const { gaps, count: gapCount } = useGaps({ status: 'identified', limit: 5 });

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Admin Dashboard
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        PRISM V2 Overview
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Users"
                    value={userCount}
                    icon="👥"
                />
                <StatCard
                    title="Active Rules"
                    value={stats?.activeRules ?? 0}
                    icon="📜"
                />
                <StatCard
                    title="Documents"
                    value={stats?.totalDocuments ?? 0}
                    icon="📄"
                />
                <StatCard
                    title="Pending Review"
                    value={stats?.pendingReview ?? 0}
                    icon="⏳"
                    trend={stats?.pendingReview && stats.pendingReview > 0 ? 'up' : 'neutral'}
                    change={stats?.pendingReview && stats.pendingReview > 0 ? 'Needs attention' : 'All clear'}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Users */}
                <Card>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold text-gray-900 dark:text-white">
                            Recent Users
                        </h2>
                        <Link
                            to="/admin/users"
                            className="text-sm text-[hsl(248,80%,36%)] dark:text-[hsl(248,36%,53%)] font-medium"
                        >
                            View All
                        </Link>
                    </div>

                    {usersLoading ? (
                        <div className="py-8 text-center text-gray-500">Loading...</div>
                    ) : (
                        <div className="space-y-3">
                            {users.map((user) => (
                                <div
                                    key={user.id}
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-[hsl(240,24%,26%)]"
                                >
                                    <div className="w-10 h-10 rounded-full bg-[hsl(248,80%,36%)]/10 flex items-center justify-center text-sm font-medium text-[hsl(248,80%,36%)]">
                                        {user.full_name?.charAt(0) ?? user.email.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 dark:text-white truncate">
                                            {user.full_name ?? 'No name'}
                                        </p>
                                        <p className="text-sm text-gray-500 truncate">{user.email}</p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs rounded-full ${user.onboarding_complete
                                            ? 'bg-[hsl(164,59%,58%)]/10 text-[hsl(164,59%,58%)]'
                                            : 'bg-[hsl(38,100%,58%)]/10 text-[hsl(38,100%,58%)]'
                                        }`}>
                                        {user.onboarding_complete ? 'Active' : 'Pending'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                {/* Gap Tracking */}
                <Card>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold text-gray-900 dark:text-white">
                            Identified Gaps
                        </h2>
                        <Link
                            to="/admin/compliance/gaps"
                            className="text-sm text-[hsl(248,80%,36%)] dark:text-[hsl(248,36%,53%)] font-medium"
                        >
                            View All ({gapCount})
                        </Link>
                    </div>

                    {gaps.length === 0 ? (
                        <div className="py-8 text-center text-gray-500">
                            No gaps identified 🎉
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {gaps.map((gap) => (
                                <div
                                    key={gap.id}
                                    className="p-3 rounded-xl bg-gray-50 dark:bg-[hsl(240,24%,26%)]"
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${gap.priority === 'high'
                                                ? 'bg-[hsl(346,96%,63%)]/10 text-[hsl(346,96%,63%)]'
                                                : gap.priority === 'medium'
                                                    ? 'bg-[hsl(38,100%,58%)]/10 text-[hsl(38,100%,58%)]'
                                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600'
                                            }`}>
                                            {gap.priority}
                                        </span>
                                        <span className="text-xs text-gray-500">{gap.gap_category}</span>
                                    </div>
                                    <p className="text-sm text-gray-900 dark:text-white line-clamp-2">
                                        {gap.gap_description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
