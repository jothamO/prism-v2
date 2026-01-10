// =====================================================
// PRISM V2 - Admin Patterns Page
// Transaction pattern management
// =====================================================

import { useState, useEffect } from 'react';
import { Card, Button, Input, SearchInput, Select } from '@/ui/components';
import { CATEGORIES } from '@/shared/constants';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

type TransactionPattern = Tables<'transaction_patterns'>;

export function AdminPatterns() {
    const [patterns, setPatterns] = useState<TransactionPattern[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showAdd, setShowAdd] = useState(false);
    const [newPattern, setNewPattern] = useState({ pattern: '', category: '', merchant_type: '' });
    const [saving, setSaving] = useState(false);

    // Category options
    const categoryOptions = Object.entries(CATEGORIES).flatMap(([, cats]) =>
        Object.entries(cats).map(([key, val]) => ({
            value: key,
            label: val.label,
        }))
    );

    useEffect(() => {
        loadPatterns();

        // Subscribe to realtime changes
        const channel = supabase
            .channel('admin-patterns')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'transaction_patterns' },
                () => loadPatterns()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const loadPatterns = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('transaction_patterns')
                .select('*')
                .order('match_count', { ascending: false });

            if (error) throw error;
            setPatterns(data || []);
        } catch (error) {
            console.error('Failed to load patterns:', error);
            toast.error('Failed to load patterns');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!newPattern.pattern || !newPattern.category) {
            toast.error('Pattern and category are required');
            return;
        }

        setSaving(true);
        try {
            const { error } = await supabase
                .from('transaction_patterns')
                .insert({
                    pattern: newPattern.pattern,
                    category: newPattern.category,
                    merchant_type: newPattern.merchant_type || null,
                    confidence: 0.9,
                    is_active: true,
                    source: 'manual',
                });

            if (error) throw error;

            toast.success('Pattern added');
            await loadPatterns();
            setNewPattern({ pattern: '', category: '', merchant_type: '' });
            setShowAdd(false);
        } catch (error) {
            console.error('Failed to add pattern:', error);
            toast.error('Failed to add pattern');
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = async (id: string, isActive: boolean) => {
        try {
            const { error } = await supabase
                .from('transaction_patterns')
                .update({ is_active: isActive, updated_at: new Date().toISOString() })
                .eq('id', id);

            if (error) throw error;
            await loadPatterns();
        } catch (error) {
            console.error('Failed to toggle pattern:', error);
            toast.error('Failed to update pattern');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this pattern?')) return;

        try {
            const { error } = await supabase
                .from('transaction_patterns')
                .delete()
                .eq('id', id);

            if (error) throw error;
            toast.success('Pattern deleted');
            await loadPatterns();
        } catch (error) {
            console.error('Failed to delete pattern:', error);
            toast.error('Failed to delete pattern');
        }
    };

    const filteredPatterns = patterns.filter(p =>
        search === '' ||
        p.pattern.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        Transaction Patterns
                    </h1>
                    <p className="text-muted-foreground">
                        {patterns.length} patterns configured
                    </p>
                </div>
                <Button onClick={() => setShowAdd(!showAdd)}>
                    + Add Pattern
                </Button>
            </div>

            {/* Add Pattern Form */}
            {showAdd && (
                <Card>
                    <h3 className="font-semibold text-foreground mb-4">
                        New Pattern
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                            label="Pattern (regex)"
                            placeholder="e.g., UBER|BOLT|taxi"
                            value={newPattern.pattern}
                            onChange={(e) => setNewPattern({ ...newPattern, pattern: e.target.value })}
                        />
                        <Select
                            label="Category"
                            value={newPattern.category}
                            onChange={(e) => setNewPattern({ ...newPattern, category: e.target.value })}
                            options={[{ value: '', label: 'Select...' }, ...categoryOptions]}
                        />
                        <Input
                            label="Merchant Type (optional)"
                            placeholder="e.g., transport"
                            value={newPattern.merchant_type}
                            onChange={(e) => setNewPattern({ ...newPattern, merchant_type: e.target.value })}
                        />
                    </div>
                    <div className="flex gap-2 mt-4">
                        <Button variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
                        <Button loading={saving} onClick={handleAdd}>Save Pattern</Button>
                    </div>
                </Card>
            )}

            {/* Search */}
            <div className="max-w-md">
                <SearchInput placeholder="Search patterns..." onSearch={setSearch} />
            </div>

            {/* Patterns Table */}
            <Card className="!p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-muted">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase">
                                    Pattern
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase">
                                    Category
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase">
                                    Matches
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase">
                                    Confidence
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                                        Loading...
                                    </td>
                                </tr>
                            ) : filteredPatterns.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                                        No patterns found
                                    </td>
                                </tr>
                            ) : (
                                filteredPatterns.map(pattern => (
                                    <tr key={pattern.id} className="hover:bg-muted/50">
                                        <td className="px-6 py-4">
                                            <code className="text-sm bg-muted px-2 py-1 rounded text-foreground">
                                                {pattern.pattern}
                                            </code>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                                                {pattern.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground">
                                            {(pattern.match_count || 0).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground">
                                            {Math.round(Number(pattern.confidence || 0) * 100)}%
                                        </td>
                                        <td className="px-6 py-4">
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={pattern.is_active ?? true}
                                                    onChange={(e) => handleToggle(pattern.id, e.target.checked)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-success" />
                                            </label>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(pattern.id)}
                                            >
                                                🗑️
                                            </Button>
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
