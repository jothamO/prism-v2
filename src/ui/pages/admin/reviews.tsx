// =====================================================
// PRISM V2 - Admin Reviews Page
// Transaction review queue
// =====================================================

import { useState } from 'react';
import { useTransactionsForReview, useCategorization } from '@/domains/transactions';
import { Card, Button, SearchInput, Select } from '@/ui/components';
import { formatCurrency } from '@/shared/utils';
import { CATEGORIES } from '@/shared/constants';
import type { Category } from '@/shared/types';

export function AdminReviews() {
    const [search, setSearch] = useState('');
    const { transactions, loading, refetch } = useTransactionsForReview(50);
    const { categorize, loading: categorizing } = useCategorization();
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [processingId, setProcessingId] = useState<string | null>(null);

    // Build category options
    const categoryOptions = Object.entries(CATEGORIES).flatMap(([, cats]) =>
        Object.entries(cats).map(([key, val]) => ({
            value: key,
            label: val.label,
        }))
    );

    const handleCategorize = async (txId: string) => {
        if (!selectedCategory) return;
        setProcessingId(txId);
        await categorize(txId, selectedCategory as Category);
        setSelectedCategory('');
        setProcessingId(null);
        refetch();
    };

    const handleBulkApprove = async () => {
        // Bulk approve all AI suggestions
        // Implementation would go here
    };

    const filteredTransactions = transactions.filter(tx =>
        search === '' ||
        tx.description.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Review Queue
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        {transactions.length} transactions need review
                    </p>
                </div>
                <Button onClick={handleBulkApprove} disabled={transactions.length === 0}>
                    ✓ Approve All AI Suggestions
                </Button>
            </div>

            {/* Search */}
            <div className="max-w-md">
                <SearchInput
                    placeholder="Search transactions..."
                    onSearch={setSearch}
                />
            </div>

            {/* Queue */}
            <Card className="!p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-[hsl(240,24%,26%)]">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                                    Date
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                                    Description
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                                    Amount
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                                    AI Suggestion
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                                    Category
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
                            ) : filteredTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        <span className="text-4xl block mb-2">🎉</span>
                                        No transactions pending review
                                    </td>
                                </tr>
                            ) : (
                                filteredTransactions.map(tx => (
                                    <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-[hsl(240,24%,26%)]">
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(tx.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {tx.description}
                                            </p>
                                            {tx.merchant && (
                                                <p className="text-xs text-gray-500">{tx.merchant}</p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`font-medium ${tx.type === 'credit'
                                                    ? 'text-[hsl(164,59%,58%)]'
                                                    : 'text-gray-900 dark:text-white'
                                                }`}>
                                                {tx.type === 'credit' ? '+' : '-'}{formatCurrency(Number(tx.amount))}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {tx.ai_suggested_category ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2 py-1 text-xs bg-[hsl(248,80%,36%)]/10 text-[hsl(248,80%,36%)] rounded-full">
                                                        {tx.ai_suggested_category}
                                                    </span>
                                                    <span className="text-xs text-gray-400">
                                                        {Math.round((tx.ai_confidence ?? 0) * 100)}%
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Select
                                                value={processingId === tx.id ? selectedCategory : ''}
                                                onChange={(e) => {
                                                    setProcessingId(tx.id);
                                                    setSelectedCategory(e.target.value);
                                                }}
                                                options={[
                                                    { value: '', label: 'Select...' },
                                                    ...categoryOptions,
                                                ]}
                                                className="w-40"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    loading={categorizing && processingId === tx.id}
                                                    disabled={processingId !== tx.id || !selectedCategory}
                                                    onClick={() => handleCategorize(tx.id)}
                                                >
                                                    Apply
                                                </Button>
                                                {tx.ai_suggested_category && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            setProcessingId(tx.id);
                                                            setSelectedCategory(tx.ai_suggested_category!);
                                                            handleCategorize(tx.id);
                                                        }}
                                                    >
                                                        ✓ Accept AI
                                                    </Button>
                                                )}
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
