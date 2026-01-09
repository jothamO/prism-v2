// =====================================================
// PRISM V2 - Admin Patterns Page
// Transaction pattern management
// =====================================================

import { useState, useEffect } from 'react';
import { Card, Button, Input, SearchInput, Select } from '@/ui/components';
import { supabase } from '@/domains/auth/service';
import { CATEGORIES } from '@/shared/constants';

interface TransactionPattern {
    id: string;
    pattern: string;
    category: string;
    merchant_type?: string;
    confidence: number;
    match_count: number;
    is_active: boolean;
    created_at: string;
}

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
    }, []);

    const loadPatterns = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('transaction_patterns')
                .select('*')
                .order('match_count', { ascending: false });

            if (error) throw error;
            setPatterns(data ?? []);
        } catch (error) {
            console.error('Error loading patterns:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!newPattern.pattern || !newPattern.category) return;
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
                });

            if (error) throw error;
            setNewPattern({ pattern: '', category: '', merchant_type: '' });
            setShowAdd(false);
            loadPatterns();
        } catch (error) {
            console.error('Error adding pattern:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = async (id: string, isActive: boolean) => {
        try {
            const { error } = await supabase
                .from('transaction_patterns')
                .update({ is_active: isActive })
                .eq('id', id);

            if (error) throw error;
            setPatterns(prev => prev.map(p =>
                p.id === id ? { ...p, is_active: isActive } : p
            ));
        } catch (error) {
            console.error('Error toggling pattern:', error);
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
            setPatterns(prev => prev.filter(p => p.id !== id));
        } catch (error) {
            console.error('Error deleting pattern:', error);
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
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Transaction Patterns
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
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
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
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
                        <thead className="bg-gray-50 dark:bg-[hsl(240,24%,26%)]">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                                    Pattern
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                                    Category
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                                    Matches
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                                    Confidence
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                                    Status
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
                            ) : filteredPatterns.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No patterns found
                                    </td>
                                </tr>
                            ) : (
                                filteredPatterns.map(pattern => (
                                    <tr key={pattern.id} className="hover:bg-gray-50 dark:hover:bg-[hsl(240,24%,26%)]">
                                        <td className="px-6 py-4">
                                            <code className="text-sm bg-gray-100 dark:bg-[hsl(240,24%,26%)] px-2 py-1 rounded">
                                                {pattern.pattern}
                                            </code>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 text-xs bg-[hsl(248,80%,36%)]/10 text-[hsl(248,80%,36%)] rounded-full">
                                                {pattern.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                            {pattern.match_count.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                            {Math.round(pattern.confidence * 100)}%
                                        </td>
                                        <td className="px-6 py-4">
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={pattern.is_active}
                                                    onChange={(e) => handleToggle(pattern.id, e.target.checked)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[hsl(164,59%,58%)]" />
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
