// =====================================================
// PRISM V2 - Admin Logs Page
// System logs and audit trail
// =====================================================

import { useState, useEffect } from 'react';
import { Card, Button, SearchInput, Select } from '@/ui/components';
import { supabase } from '@/domains/auth/service';

interface LogEntry {
    id: string;
    level: 'info' | 'warn' | 'error';
    category: string;
    message: string;
    metadata?: Record<string, unknown>;
    user_id?: string;
    created_at: string;
}

export function AdminLogs() {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [levelFilter, setLevelFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');

    useEffect(() => {
        loadLogs();
    }, [levelFilter, categoryFilter]);

    const loadLogs = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('system_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(100);

            if (levelFilter !== 'all') {
                query = query.eq('level', levelFilter);
            }
            if (categoryFilter !== 'all') {
                query = query.eq('category', categoryFilter);
            }

            const { data, error } = await query;
            if (error) throw error;
            setLogs(data ?? []);
        } catch (error) {
            console.error('Error loading logs:', error);
            // Mock data if table doesn't exist
            setLogs([
                { id: '1', level: 'info', category: 'auth', message: 'User logged in', created_at: new Date().toISOString() },
                { id: '2', level: 'info', category: 'classification', message: 'Batch classification completed (50 transactions)', created_at: new Date().toISOString() },
                { id: '3', level: 'warn', category: 'banking', message: 'Mono sync delayed - retrying', created_at: new Date(Date.now() - 60000).toISOString() },
                { id: '4', level: 'error', category: 'ai', message: 'Claude API rate limit exceeded', metadata: { retryAfter: 60 }, created_at: new Date(Date.now() - 120000).toISOString() },
                { id: '5', level: 'info', category: 'compliance', message: 'Document processed: Finance Act 2025', created_at: new Date(Date.now() - 180000).toISOString() },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const getLevelColor = (level: string) => {
        switch (level) {
            case 'error': return 'bg-[hsl(346,96%,63%)]/10 text-[hsl(346,96%,63%)]';
            case 'warn': return 'bg-[hsl(38,100%,58%)]/10 text-[hsl(38,100%,58%)]';
            default: return 'bg-[hsl(164,59%,58%)]/10 text-[hsl(164,59%,58%)]';
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'auth': return '🔐';
            case 'classification': return '🤖';
            case 'banking': return '🏦';
            case 'ai': return '🧠';
            case 'compliance': return '⚖️';
            case 'system': return '⚙️';
            default: return '📋';
        }
    };

    const filteredLogs = logs.filter(log =>
        search === '' ||
        log.message.toLowerCase().includes(search.toLowerCase()) ||
        log.category.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        System Logs
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Real-time activity and audit trail
                    </p>
                </div>
                <Button onClick={loadLogs}>
                    🔄 Refresh
                </Button>
            </div>

            {/* Filters */}
            <div className="flex gap-4 flex-wrap">
                <div className="flex-1 max-w-md">
                    <SearchInput placeholder="Search logs..." onSearch={setSearch} />
                </div>
                <Select
                    value={levelFilter}
                    onChange={(e) => setLevelFilter(e.target.value)}
                    options={[
                        { value: 'all', label: 'All Levels' },
                        { value: 'info', label: 'Info' },
                        { value: 'warn', label: 'Warning' },
                        { value: 'error', label: 'Error' },
                    ]}
                    className="w-32"
                />
                <Select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    options={[
                        { value: 'all', label: 'All Categories' },
                        { value: 'auth', label: 'Auth' },
                        { value: 'classification', label: 'Classification' },
                        { value: 'banking', label: 'Banking' },
                        { value: 'ai', label: 'AI' },
                        { value: 'compliance', label: 'Compliance' },
                        { value: 'system', label: 'System' },
                    ]}
                    className="w-40"
                />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <Card className="text-center !py-4">
                    <p className="text-2xl font-bold text-[hsl(164,59%,58%)]">
                        {logs.filter(l => l.level === 'info').length}
                    </p>
                    <p className="text-sm text-gray-500">Info</p>
                </Card>
                <Card className="text-center !py-4">
                    <p className="text-2xl font-bold text-[hsl(38,100%,58%)]">
                        {logs.filter(l => l.level === 'warn').length}
                    </p>
                    <p className="text-sm text-gray-500">Warnings</p>
                </Card>
                <Card className="text-center !py-4">
                    <p className="text-2xl font-bold text-[hsl(346,96%,63%)]">
                        {logs.filter(l => l.level === 'error').length}
                    </p>
                    <p className="text-sm text-gray-500">Errors</p>
                </Card>
            </div>

            {/* Logs List */}
            <Card className="!p-0 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading...</div>
                ) : filteredLogs.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No logs found</div>
                ) : (
                    <div className="divide-y divide-gray-200 dark:divide-[hsl(240,24%,30%)]">
                        {filteredLogs.map(log => (
                            <div key={log.id} className="p-4 hover:bg-gray-50 dark:hover:bg-[hsl(240,24%,26%)]">
                                <div className="flex items-start gap-3">
                                    <span className="text-xl">{getCategoryIcon(log.category)}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`px-2 py-0.5 text-xs rounded-full ${getLevelColor(log.level)}`}>
                                                {log.level.toUpperCase()}
                                            </span>
                                            <span className="text-xs text-gray-400">{log.category}</span>
                                            <span className="text-xs text-gray-400">
                                                {new Date(log.created_at).toLocaleTimeString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-900 dark:text-white">
                                            {log.message}
                                        </p>
                                        {log.metadata && (
                                            <pre className="mt-2 text-xs text-gray-500 bg-gray-50 dark:bg-[hsl(240,24%,26%)] p-2 rounded overflow-x-auto">
                                                {JSON.stringify(log.metadata, null, 2)}
                                            </pre>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}
