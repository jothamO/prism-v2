// =====================================================
// PRISM V2 - Admin Chatbots Page
// Manage Telegram and WhatsApp bot configurations
// =====================================================

import { useState, useEffect } from 'react';
import { Card, Button, Input, Select } from '@/ui/components';

interface BotConfig {
    platform: 'telegram' | 'whatsapp';
    enabled: boolean;
    token?: string;
    webhookUrl?: string;
    connectedUsers: number;
    messagesHandled: number;
}

export function AdminChatbots() {
    const [_loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [configs, setConfigs] = useState<BotConfig[]>([
        {
            platform: 'telegram',
            enabled: true,
            token: '***configured***',
            webhookUrl: '',
            connectedUsers: 0,
            messagesHandled: 0,
        },
        {
            platform: 'whatsapp',
            enabled: false,
            token: '',
            webhookUrl: '',
            connectedUsers: 0,
            messagesHandled: 0,
        },
    ]);

    useEffect(() => {
        // Tables don't exist yet - using mock data
        // TODO: Create telegram_connections and whatsapp_connections tables
        setLoading(false);
    }, []);

    const handleToggle = (platform: string, enabled: boolean) => {
        setConfigs(prev => prev.map(config =>
            config.platform === platform ? { ...config, enabled } : config
        ));
    };

    const handleSave = async () => {
        setSaving(true);
        // Save configuration logic
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSaving(false);
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Chatbot Management
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Configure Telegram and WhatsApp integrations
                </p>
            </div>

            {/* Bot Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {configs.map(config => (
                    <Card key={config.platform} className="!p-0 overflow-hidden">
                        {/* Header */}
                        <div className={`p-6 text-white ${config.platform === 'telegram'
                                ? 'bg-[#0088cc]'
                                : 'bg-[#25D366]'
                            }`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">
                                        {config.platform === 'telegram' ? '📱' : '📲'}
                                    </span>
                                    <div>
                                        <h2 className="text-xl font-semibold capitalize">
                                            {config.platform} Bot
                                        </h2>
                                        <p className="text-white/80 text-sm">
                                            @prism_tax_bot
                                        </p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={config.enabled}
                                        onChange={(e) => handleToggle(config.platform, e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-white/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
                                </label>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="p-6 grid grid-cols-2 gap-4 border-b border-gray-200 dark:border-[hsl(240,24%,30%)]">
                            <div className="text-center">
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {config.connectedUsers}
                                </p>
                                <p className="text-sm text-gray-500">Connected Users</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {config.messagesHandled.toLocaleString()}
                                </p>
                                <p className="text-sm text-gray-500">Messages Handled</p>
                            </div>
                        </div>

                        {/* Configuration */}
                        <div className="p-6 space-y-4">
                            <Input
                                label="Bot Token"
                                type="password"
                                value={config.token}
                                placeholder={config.platform === 'telegram' ? 'Bot token from @BotFather' : 'Meta API token'}
                                onChange={() => { }}
                            />
                            <Input
                                label="Webhook URL"
                                value={config.webhookUrl}
                                placeholder="https://your-project.supabase.co/functions/v1/..."
                                onChange={() => { }}
                            />
                            <div className="flex gap-2">
                                <Button variant="outline" fullWidth>
                                    Test Connection
                                </Button>
                                <Button variant="outline" fullWidth>
                                    View Logs
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* PRISM AI Configuration */}
            <Card>
                <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
                    🤖 PRISM AI Configuration
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Anthropic API Key"
                        type="password"
                        placeholder="sk-ant-..."
                    />
                    <Select
                        label="Model"
                        options={[
                            { value: 'claude-sonnet-4-5-20250929', label: 'Claude claude-sonnet-4-5-20250929 (Recommended)' },
                            { value: 'claude-3-opus', label: 'Claude 3 Opus (Highest Quality)' },
                            { value: 'claude-3-haiku', label: 'Claude 3 Haiku (Fastest)' },
                        ]}
                    />
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            System Prompt
                        </label>
                        <textarea
                            rows={4}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-[hsl(240,24%,30%)] bg-gray-50 dark:bg-[hsl(240,24%,26%)] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[hsl(248,80%,36%)]"
                            placeholder="You are PRISM, a friendly Nigerian tax assistant..."
                        />
                    </div>
                </div>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button loading={saving} onClick={handleSave}>
                    Save Configuration
                </Button>
            </div>
        </div>
    );
}
