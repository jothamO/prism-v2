// =====================================================
// PRISM V2 - Admin Settings Page
// System configuration
// =====================================================

import { useState } from 'react';
import { Card, Button, Input, Select } from '@/ui/components';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MigrationStats {
    users: { migrated: number; failed: number; skipped: number };
    transactions: { migrated: number; failed: number; skipped: number };
    connections: { telegram: number; whatsapp: number; bank: number };
    duration_seconds: number;
    errors: string[];
}

export function AdminSettings() {
    const [apiKeyVisible, setApiKeyVisible] = useState(false);
    const [saving, setSaving] = useState(false);
    const [migrating, setMigrating] = useState(false);
    const [migrationResult, setMigrationResult] = useState<MigrationStats | null>(null);
    const { toast } = useToast();

    const handleSave = async () => {
        setSaving(true);
        // Save settings logic
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSaving(false);
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Settings
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    System configuration and preferences
                </p>
            </div>

            {/* General Settings */}
            <Card>
                <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
                    General
                </h2>
                <div className="space-y-4">
                    <Input
                        label="System Name"
                        defaultValue="PRISM V2"
                    />
                    <Select
                        label="Default Tax Year"
                        options={[
                            { value: '2026', label: '2026' },
                            { value: '2025', label: '2025' },
                            { value: '2024', label: '2024' },
                        ]}
                    />
                    <Select
                        label="Currency"
                        options={[
                            { value: 'NGN', label: 'Nigerian Naira (₦)' },
                            { value: 'USD', label: 'US Dollar ($)' },
                        ]}
                    />
                </div>
            </Card>

            {/* API Keys */}
            <Card>
                <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
                    API Keys
                </h2>
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <Input
                                label="Anthropic API Key"
                                type={apiKeyVisible ? 'text' : 'password'}
                                placeholder="sk-ant-..."
                            />
                        </div>
                        <Button
                            variant="ghost"
                            onClick={() => setApiKeyVisible(!apiKeyVisible)}
                        >
                            {apiKeyVisible ? 'Hide' : 'Show'}
                        </Button>
                    </div>
                    <Input
                        label="Mono Secret Key"
                        type="password"
                        placeholder="live_sk_..."
                    />
                    <Input
                        label="Lovable API Key"
                        type="password"
                        placeholder="..."
                    />
                </div>
            </Card>

            {/* Notifications */}
            <Card>
                <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Notifications
                </h2>
                <div className="space-y-3">
                    {[
                        { label: 'Email notifications for new users', key: 'new_users' },
                        { label: 'Slack alerts for compliance issues', key: 'compliance' },
                        { label: 'Weekly analytics digest', key: 'analytics' },
                    ].map((setting) => (
                        <label key={setting.key} className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                defaultChecked
                                className="w-5 h-5 rounded border-gray-300 text-[hsl(248,80%,36%)] focus:ring-[hsl(248,80%,36%)]"
                            />
                            <span className="text-gray-700 dark:text-gray-300">{setting.label}</span>
                        </label>
                    ))}
                </div>
            </Card>

            {/* Data Migration */}
            <Card className="border-primary/20 border-2">
                <h2 className="font-semibold text-primary mb-4">
                    Data Migration
                </h2>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">Run V1 Migration</p>
                            <p className="text-sm text-gray-500">Migrate users, transactions, and connections from V1</p>
                        </div>
                        <Button 
                            variant="primary"
                            loading={migrating}
                            onClick={async () => {
                                setMigrating(true);
                                setMigrationResult(null);
                                try {
                                    const { data: { session } } = await supabase.auth.getSession();
                                    if (!session) {
                                        toast({ title: 'Error', description: 'Not authenticated', variant: 'destructive' });
                                        return;
                                    }
                                    
                                    const { data, error } = await supabase.functions.invoke('run-migration', {
                                        headers: { Authorization: `Bearer ${session.access_token}` }
                                    });
                                    
                                    if (error) throw error;
                                    
                                    if (data?.success) {
                                        setMigrationResult(data.stats);
                                        toast({ title: 'Migration Complete', description: `Migrated ${data.stats.users.migrated} users and ${data.stats.transactions.migrated} transactions` });
                                    } else {
                                        throw new Error(data?.error || 'Migration failed');
                                    }
                                } catch (error: any) {
                                    toast({ title: 'Migration Failed', description: error.message, variant: 'destructive' });
                                } finally {
                                    setMigrating(false);
                                }
                            }}
                        >
                            {migrating ? 'Migrating...' : 'Run Migration'}
                        </Button>
                    </div>
                    
                    {migrationResult && (
                        <div className="mt-4 p-4 bg-muted rounded-lg space-y-2">
                            <h3 className="font-medium text-foreground">Migration Results</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Users</p>
                                    <p className="text-foreground">
                                        ✓ {migrationResult.users.migrated} migrated, 
                                        ⏭ {migrationResult.users.skipped} skipped
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Transactions</p>
                                    <p className="text-foreground">
                                        ✓ {migrationResult.transactions.migrated} migrated, 
                                        ⏭ {migrationResult.transactions.skipped} skipped
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Connections</p>
                                    <p className="text-foreground">
                                        📱 {migrationResult.connections.telegram} Telegram, 
                                        💬 {migrationResult.connections.whatsapp} WhatsApp, 
                                        🏦 {migrationResult.connections.bank} Bank
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Duration</p>
                                    <p className="text-foreground">{migrationResult.duration_seconds.toFixed(1)}s</p>
                                </div>
                            </div>
                            {migrationResult.errors.length > 0 && (
                                <div className="mt-2 text-destructive text-sm">
                                    <p className="font-medium">Errors:</p>
                                    <ul className="list-disc list-inside">
                                        {migrationResult.errors.slice(0, 5).map((err, i) => (
                                            <li key={i}>{err}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive/20 border-2">
                <h2 className="font-semibold text-destructive mb-4">
                    Danger Zone
                </h2>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">Clear all cache</p>
                            <p className="text-sm text-gray-500">Remove cached data and regenerate</p>
                        </div>
                        <Button variant="outline">Clear Cache</Button>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">Reset ML models</p>
                            <p className="text-sm text-gray-500">Retrain classification models</p>
                        </div>
                        <Button variant="outline">Reset</Button>
                    </div>
                </div>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button loading={saving} onClick={handleSave}>
                    Save Settings
                </Button>
            </div>
        </div>
    );
}
