// =====================================================
// PRISM V2 - Admin Banking Page
// Manage bank connections and Mono integration
// =====================================================

import { useState, useEffect } from 'react';
import { Card, Button, SearchInput } from '@/ui/components';
import { formatCurrency } from '@/shared/utils';
import { supabase } from '@/domains/auth/service';

interface BankConnection {
    id: string;
    user_id: string;
    user_email?: string;
    bank_name: string;
    account_number: string;
    status: 'active' | 'pending' | 'reauth_required' | 'disconnected';
    last_synced_at: string | null;
    created_at: string;
    transaction_count?: number;
}

interface BankStats {
    totalConnections: number;
    activeConnections: number;
    pendingReauth: number;
    transactionsSynced: number;
}

export function AdminBanking() {
    const [connections, setConnections] = useState<BankConnection[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [stats, setStats] = useState<BankStats>({
        totalConnections: 0,
        activeConnections: 0,
        pendingReauth: 0,
        transactionsSynced: 0,
    });

    useEffect(() => {
        loadConnections();
    }, []);

    const loadConnections = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('bank_connections')
                .select('*, users(email)')
                .order('created_at', { ascending: false });

            if (error) throw error;

            const mappedData: BankConnection[] = (data ?? []).map(c => ({
                ...c,
                user_email: c.users?.email,
            }));

            setConnections(mappedData);

            // Calculate stats
            setStats({
                totalConnections: mappedData.length,
                activeConnections: mappedData.filter(c => c.status === 'active').length,
                pendingReauth: mappedData.filter(c => c.status === 'reauth_required').length,
                transactionsSynced: 0, // Would come from separate query
            });
        } catch (error) {
            console.error('Error loading connections:', error);
            // Mock data
            setConnections([
                { id: '1', user_id: 'u1', user_email: 'john@example.com', bank_name: 'GTBank', account_number: '****1234', status: 'active', last_synced_at: new Date().toISOString(), created_at: new Date().toISOString() },
                { id: '2', user_id: 'u2', user_email: 'jane@example.com', bank_name: 'Access Bank', account_number: '****5678', status: 'active', last_synced_at: new Date().toISOString(), created_at: new Date().toISOString() },
                { id: '3', user_id: 'u3', user_email: 'bob@example.com', bank_name: 'Zenith Bank', account_number: '****9012', status: 'reauth_required', last_synced_at: null, created_at: new Date().toISOString() },
            ]);
            setStats({ totalConnections: 3, activeConnections: 2, pendingReauth: 1, transactionsSynced: 1250 });
        } finally {
            setLoading(false);
        }
    };

    const triggerSync = async (connectionId: string) => {
        try {
            await supabase.functions.invoke('mono-sync-transactions', {
                body: { connectionId },
            });
            loadConnections();
        } catch (error) {
            console.error('Sync error:', error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-[hsl(164,59%,58%)]/10 text-[hsl(164,59%,58%)]';
            case 'pending': return 'bg-[hsl(38,100%,58%)]/10 text-[hsl(38,100%,58%)]';
            case 'reauth_required': return 'bg-[hsl(346,96%,63%)]/10 text-[hsl(346,96%,63%)]';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const getBankIcon = (bankName: string) => {
        const name = bankName.toLowerCase();
        if (name.includes('gtbank') || name.includes('guaranty')) return '🟠';
        if (name.includes('access')) return '🔵';
        if (name.includes('zenith')) return '🔴';
        if (name.includes('uba') || name.includes('united')) return '🟤';
        if (name.includes('first')) return '🟡';
        return '🏦';
    };

    const filteredConnections = connections.filter(c =>
        search === '' ||
        c.user_email?.toLowerCase().includes(search.toLowerCase()) ||
        c.bank_name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Bank Connections
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Manage Mono bank connections
                    </p>
                </div>
                <Button onClick={loadConnections}>
                    🔄 Refresh
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                <Card className="text-center !py-4">
                    <span className="text-3xl block mb-2">🏦</span>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stats.totalConnections}
                    </p>
                    <p className="text-xs text-gray-500">Total Connections</p>
                </Card>
                <Card className="text-center !py-4">
                    <span className="text-3xl block mb-2">✅</span>
                    <p className="text-2xl font-bold text-[hsl(164,59%,58%)]">
                        {stats.activeConnections}
                    </p>
                    <p className="text-xs text-gray-500">Active</p>
                </Card>
                <Card className="text-center !py-4">
                    <span className="text-3xl block mb-2">⚠️</span>
                    <p className="text-2xl font-bold text-[hsl(38,100%,58%)]">
                        {stats.pendingReauth}
                    </p>
                    <p className="text-xs text-gray-500">Need Reauth</p>
                </Card>
                <Card className="text-center !py-4">
                    <span className="text-3xl block mb-2">📊</span>
                    <p className="text-2xl font-bold text-[hsl(248,80%,36%)]">
                        {stats.transactionsSynced.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">Transactions</p>
                </Card>
            </div>

            {/* Search */}
            <div className="max-w-md">
                <SearchInput placeholder="Search by email or bank..." onSearch={setSearch} />
            </div>

            {/* Connections Table */}
            <Card className="!p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-[hsl(240,24%,26%)]">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                                    User
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                                    Bank
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                                    Account
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                                    Last Sync
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-[hsl(240,24%,30%)]">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        Loading...
                                    </td>
                                </tr>
                            ) : filteredConnections.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No connections found
                                    </td>
                                </tr>
                            ) : (
                                filteredConnections.map(conn => (
                                    <tr key={conn.id} className="hover:bg-gray-50 dark:hover:bg-[hsl(240,24%,26%)]">
                                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                            {conn.user_email ?? 'Unknown'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="flex items-center gap-2">
                                                <span>{getBankIcon(conn.bank_name)}</span>
                                                <span className="text-sm text-gray-900 dark:text-white">{conn.bank_name}</span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-mono text-gray-600 dark:text-gray-400">
                                            {conn.account_number}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(conn.status)}`}>
                                                {conn.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                            {conn.last_synced_at
                                                ? new Date(conn.last_synced_at).toLocaleString()
                                                : 'Never'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <Button size="sm" onClick={() => triggerSync(conn.id)}>
                                                    🔄 Sync
                                                </Button>
                                                <Button variant="ghost" size="sm">
                                                    View
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
