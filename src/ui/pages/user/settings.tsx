// =====================================================
// PRISM V2 - User Settings Page
// =====================================================

import { useState } from 'react';
import { Card, Button, Input, Select } from '@/ui/components';
import { useAuth } from '@/domains/auth';

export function SettingsPage() {
    const { user } = useAuth();
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security'>('profile');

    const handleSave = async () => {
        setSaving(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSaving(false);
    };

    return (
        <div className="pb-20 px-4 pt-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Settings
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Manage your account preferences
                </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200 dark:border-[hsl(240,24%,30%)]">
                {['profile', 'notifications', 'security'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as typeof activeTab)}
                        className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab === tab
                                ? 'border-[hsl(248,80%,36%)] text-[hsl(248,80%,36%)]'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {/* Profile Tab */}
            {activeTab === 'profile' && (
                <Card>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                        Profile Information
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 rounded-full bg-[hsl(248,80%,36%)] text-white flex items-center justify-center text-2xl font-bold">
                                {user?.email?.[0]?.toUpperCase() ?? 'U'}
                            </div>
                            <Button variant="outline" size="sm">Change Photo</Button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="First Name" placeholder="John" />
                            <Input label="Last Name" placeholder="Doe" />
                        </div>
                        <Input label="Email" type="email" value={user?.email ?? ''} disabled />
                        <Input label="Phone" type="tel" placeholder="+234 XXX XXX XXXX" />
                        <Select
                            label="Timezone"
                            options={[
                                { value: 'Africa/Lagos', label: 'West Africa Time (Lagos)' },
                                { value: 'UTC', label: 'UTC' },
                            ]}
                        />
                    </div>
                </Card>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
                <Card>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                        Notification Preferences
                    </h3>
                    <div className="space-y-4">
                        {[
                            { label: 'Tax deadline reminders', desc: 'Get notified 7 days before deadlines', key: 'deadlines' },
                            { label: 'Weekly summary', desc: 'Receive weekly transaction summaries', key: 'weekly' },
                            { label: 'New transactions', desc: 'Notify when new bank transactions sync', key: 'transactions' },
                            { label: 'AI classifications', desc: 'Notify when AI categorizes transactions', key: 'ai' },
                            { label: 'Product updates', desc: 'News about new PRISM features', key: 'updates' },
                        ].map(item => (
                            <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-[hsl(240,24%,30%)] last:border-0">
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">{item.label}</p>
                                    <p className="text-sm text-gray-500">{item.desc}</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" defaultChecked={item.key !== 'updates'} />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[hsl(248,80%,36%)]" />
                                </label>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
                <div className="space-y-4">
                    <Card>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                            Change Password
                        </h3>
                        <div className="space-y-4">
                            <Input label="Current Password" type="password" />
                            <Input label="New Password" type="password" />
                            <Input label="Confirm New Password" type="password" />
                            <Button>Update Password</Button>
                        </div>
                    </Card>

                    <Card>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                            Two-Factor Authentication
                        </h3>
                        <p className="text-gray-500 mb-4">
                            Add an extra layer of security to your account
                        </p>
                        <Button variant="outline">Enable 2FA</Button>
                    </Card>

                    <Card>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                            Active Sessions
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[hsl(240,24%,26%)] rounded-xl">
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">💻</span>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">Current Device</p>
                                        <p className="text-xs text-gray-500">Lagos, Nigeria • Just now</p>
                                    </div>
                                </div>
                                <span className="text-xs text-[hsl(164,59%,58%)]">Active</span>
                            </div>
                        </div>
                    </Card>

                    <Card className="border-red-200 dark:border-red-900">
                        <h3 className="font-semibold text-red-600 mb-2">
                            Danger Zone
                        </h3>
                        <p className="text-gray-500 text-sm mb-4">
                            Permanently delete your account and all data
                        </p>
                        <Button variant="ghost" className="!text-red-600 !border-red-200">
                            Delete Account
                        </Button>
                    </Card>
                </div>
            )}

            {/* Save Button */}
            {activeTab === 'profile' && (
                <div className="flex justify-end">
                    <Button loading={saving} onClick={handleSave}>
                        Save Changes
                    </Button>
                </div>
            )}
        </div>
    );
}
