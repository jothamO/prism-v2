// =====================================================
// PRISM V2 - Bank Connect Page
// Mono integration for bank linking
// =====================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/domains/auth';
import { useBankConnections, useBankActions } from '@/domains/banking';
import { Card, Button } from '@/ui/components';

export function BankConnectPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { connections, loading } = useBankConnections();
    const { connect, disconnect, loading: actionLoading, error } = useBankActions();
    const [connecting, setConnecting] = useState(false);

    // Nigerian banks
    const supportedBanks = [
        { name: 'Access Bank', code: 'access', icon: '🏦' },
        { name: 'GTBank', code: 'gtb', icon: '🏦' },
        { name: 'First Bank', code: 'firstbank', icon: '🏦' },
        { name: 'UBA', code: 'uba', icon: '🏦' },
        { name: 'Zenith Bank', code: 'zenith', icon: '🏦' },
        { name: 'Sterling Bank', code: 'sterling', icon: '🏦' },
        { name: 'Wema Bank', code: 'wema', icon: '🏦' },
        { name: 'Stanbic IBTC', code: 'stanbic', icon: '🏦' },
    ];

    const handleConnect = async () => {
        if (!user?.id) return;
        setConnecting(true);

        try {
            // This will trigger Mono widget via edge function
            await connect(user.id);
            navigate('/bank-connected');
        } catch {
            // Error handled by hook
        } finally {
            setConnecting(false);
        }
    };

    const handleDisconnect = async (connectionId: string) => {
        await disconnect(connectionId);
    };

    return (
        <div className="pb-20 px-4 pt-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Bank Connections
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Connect your bank accounts for automatic transaction sync
                </p>
            </div>

            {/* Error */}
            {error && (
                <div className="p-4 rounded-xl bg-[hsl(346,96%,63%)]/10 border border-[hsl(346,96%,63%)]/20">
                    <p className="text-sm text-[hsl(346,96%,63%)]">{error}</p>
                </div>
            )}

            {/* Connected Accounts */}
            {connections.length > 0 && (
                <Card>
                    <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
                        Connected Accounts
                    </h2>
                    <div className="space-y-3">
                        {connections.map((conn) => (
                            <div
                                key={conn.id}
                                className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-[hsl(240,24%,26%)]"
                            >
                                <span className="text-2xl">🏦</span>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {conn.bank_name}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        ****{conn.account_number?.slice(-4)}
                                    </p>
                                </div>
                                <span className={`px-2 py-1 text-xs rounded-full ${conn.status === 'active'
                                        ? 'bg-[hsl(164,59%,58%)]/10 text-[hsl(164,59%,58%)]'
                                        : conn.status === 'pending'
                                            ? 'bg-[hsl(38,100%,58%)]/10 text-[hsl(38,100%,58%)]'
                                            : 'bg-[hsl(346,96%,63%)]/10 text-[hsl(346,96%,63%)]'
                                    }`}>
                                    {conn.status}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    loading={actionLoading}
                                    onClick={() => handleDisconnect(conn.id)}
                                >
                                    Disconnect
                                </Button>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Connect New Account */}
            <Card className="!p-0 overflow-hidden">
                <div className="p-6 bg-gradient-to-br from-[hsl(248,80%,36%)] to-[hsl(248,36%,53%)] text-white">
                    <h2 className="text-xl font-semibold mb-2">
                        Connect Your Bank
                    </h2>
                    <p className="text-white/80">
                        Securely link your Nigerian bank account via Mono
                    </p>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-4 gap-3 mb-6">
                        {supportedBanks.map((bank) => (
                            <div
                                key={bank.code}
                                className="text-center p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-[hsl(240,24%,26%)] transition-colors"
                            >
                                <span className="text-2xl block mb-1">{bank.icon}</span>
                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                    {bank.name}
                                </span>
                            </div>
                        ))}
                    </div>
                    <Button
                        fullWidth
                        loading={connecting || actionLoading}
                        onClick={handleConnect}
                    >
                        Connect Bank Account
                    </Button>
                    <p className="text-xs text-gray-500 text-center mt-4">
                        🔒 Your data is encrypted and secured by Mono
                    </p>
                </div>
            </Card>

            {/* Info */}
            <Card>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Why Connect Your Bank?
                </h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li className="flex items-center gap-2">
                        <span className="text-[hsl(164,59%,58%)]">✓</span>
                        Automatic transaction import
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="text-[hsl(164,59%,58%)]">✓</span>
                        AI-powered categorization
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="text-[hsl(164,59%,58%)]">✓</span>
                        Real-time tax calculations
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="text-[hsl(164,59%,58%)]">✓</span>
                        No manual data entry
                    </li>
                </ul>
            </Card>
        </div>
    );
}
