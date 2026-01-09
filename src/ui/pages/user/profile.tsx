// =====================================================
// PRISM V2 - Profile Page (Mobile-First)
// User profile with settings and logout
// =====================================================

import { useAuth } from '@/domains/auth';
import { useCurrentUserProfile } from '@/domains/users';
import { useTheme } from '@/ui/providers/theme-provider';
import { Card, Button } from '@/ui/components';
import { getInitials } from '@/shared/utils';

export function ProfilePage() {
    const { user, signOut, isAdmin } = useAuth();
    const { user: profile } = useCurrentUserProfile();
    const { theme, setTheme } = useTheme();

    const handleLogout = async () => {
        await signOut();
    };

    return (
        <div className="pb-20 px-4 pt-6 space-y-6">
            {/* Header */}
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Profile
            </h1>

            {/* Avatar & Name */}
            <div className="flex flex-col items-center py-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[hsl(248,80%,36%)] to-[hsl(248,36%,53%)] flex items-center justify-center text-3xl text-white font-bold mb-4">
                    {profile?.full_name
                        ? getInitials(profile.full_name)
                        : getInitials(user?.email ?? '')}
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {profile?.full_name ?? 'User'}
                </h2>
                <p className="text-gray-500 dark:text-gray-400">{user?.email}</p>

                {isAdmin && (
                    <span className="mt-2 px-3 py-1 bg-[hsl(248,80%,36%)]/10 text-[hsl(248,80%,36%)] text-sm font-medium rounded-full">
                        Admin
                    </span>
                )}
            </div>

            {/* Account Settings */}
            <Card>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Account Settings
                </h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-[hsl(240,24%,30%)]">
                        <span className="text-gray-600 dark:text-gray-400">Email</span>
                        <span className="text-gray-900 dark:text-white font-medium">{user?.email}</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-[hsl(240,24%,30%)]">
                        <span className="text-gray-600 dark:text-gray-400">Phone</span>
                        <span className="text-gray-900 dark:text-white font-medium">
                            {profile?.phone ?? 'Not set'}
                        </span>
                    </div>
                    <div className="flex items-center justify-between py-3">
                        <span className="text-gray-600 dark:text-gray-400">Member since</span>
                        <span className="text-gray-900 dark:text-white font-medium">
                            {profile?.created_at
                                ? new Date(profile.created_at).toLocaleDateString()
                                : '—'}
                        </span>
                    </div>
                </div>
            </Card>

            {/* Appearance */}
            <Card>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Appearance
                </h3>
                <div className="flex gap-2">
                    {(['light', 'dark', 'system'] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTheme(t)}
                            className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${theme === t
                                    ? 'bg-[hsl(248,80%,36%)] text-white'
                                    : 'bg-gray-100 dark:bg-[hsl(240,24%,26%)] text-gray-600 dark:text-gray-400'
                                }`}
                        >
                            {t === 'light' && '☀️ '}
                            {t === 'dark' && '🌙 '}
                            {t === 'system' && '💻 '}
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                    ))}
                </div>
            </Card>

            {/* Admin Link */}
            {isAdmin && (
                <Card>
                    <a
                        href="/admin"
                        className="flex items-center justify-between py-2 text-[hsl(248,80%,36%)] dark:text-[hsl(248,36%,53%)] font-medium"
                    >
                        <span>Go to Admin Dashboard</span>
                        <span>→</span>
                    </a>
                </Card>
            )}

            {/* Logout */}
            <Button
                variant="destructive"
                fullWidth
                onClick={handleLogout}
            >
                Sign Out
            </Button>
        </div>
    );
}
