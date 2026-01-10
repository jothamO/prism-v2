// =====================================================
// PRISM V2 - Admin Logs Page
// System logs and audit trail
// =====================================================

import { useState, useEffect } from 'react';
import { Card, Button, SearchInput, Select } from '@/ui/components';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type LogEntry = Tables<'system_logs'>;

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
            setLogs(data || []);
        } catch (error) {
            console.error('Failed to load logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const getLevelColor = (level: string) => {
        switch (level) {
            case 'error':
            case 'critical':
                return 'bg-destructive/10 text-destructive';
            case 'warn':
                return 'bg-warning/10 text-warning';
            case 'debug':
                return 'bg-muted text-muted-foreground';
            default:
                return 'bg-success/10 text-success';
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

    const logCounts = {
        info: logs.filter(l => l.level === 'info').length,
        warn: logs.filter(l => l.level === 'warn').length,
        error: logs.filter(l => l.level === 'error' || l.level === 'critical').length,
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        System Logs
                    </h1>
                    <p className="text-muted-foreground">
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
                        { value: 'debug', label: 'Debug' },
                        { value: 'info', label: 'Info' },
                        { value: 'warn', label: 'Warning' },
                        { value: 'error', label: 'Error' },
                        { value: 'critical', label: 'Critical' },
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
                    <p className="text-2xl font-bold text-success">
                        {logCounts.info}
                    </p>
                    <p className="text-sm text-muted-foreground">Info</p>
                </Card>
                <Card className="text-center !py-4">
                    <p className="text-2xl font-bold text-warning">
                        {logCounts.warn}
                    </p>
                    <p className="text-sm text-muted-foreground">Warnings</p>
                </Card>
                <Card className="text-center !py-4">
                    <p className="text-2xl font-bold text-destructive">
                        {logCounts.error}
                    </p>
                    <p className="text-sm text-muted-foreground">Errors</p>
                </Card>
            </div>

            {/* Logs List */}
            <Card className="!p-0 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-muted-foreground">Loading...</div>
                ) : filteredLogs.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">No logs found</div>
                ) : (
                    <div className="divide-y divide-border">
                        {filteredLogs.map(log => (
                            <div key={log.id} className="p-4 hover:bg-muted/50">
                                <div className="flex items-start gap-3">
                                    <span className="text-xl">{getCategoryIcon(log.category)}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`px-2 py-0.5 text-xs rounded-full ${getLevelColor(log.level)}`}>
                                                {log.level.toUpperCase()}
                                            </span>
                                            <span className="text-xs text-muted-foreground">{log.category}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {log.created_at && new Date(log.created_at).toLocaleTimeString()}
                                            </span>
                                            {log.ip_address && (
                                                <span className="text-xs text-muted-foreground">
                                                    IP: {log.ip_address}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-foreground">
                                            {log.message}
                                        </p>
                                        {log.metadata && Object.keys(log.metadata).length > 0 && (
                                            <pre className="mt-2 text-xs text-muted-foreground bg-muted p-2 rounded overflow-x-auto">
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
