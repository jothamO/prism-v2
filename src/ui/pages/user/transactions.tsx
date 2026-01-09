// =====================================================
// PRISM V2 - Transactions Page (Mobile-First)
// Transaction list with filtering and categorization
// =====================================================

import { useState, useMemo } from 'react';
import { useTransactions, useCategorization } from '@/domains/transactions';
import { TransactionCard, SearchInput, Select, Card, Button } from '@/ui/components';
import { CATEGORIES } from '@/shared/constants';
import type { Category } from '@/shared/types';

export function TransactionsPage() {
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<'all' | 'credit' | 'debit'>('all');
    const [selectedTx, setSelectedTx] = useState<string | null>(null);

    // Transactions with filtering
    const { transactions, loading, refetch } = useTransactions({
        search: search || undefined,
        type: typeFilter === 'all' ? undefined : typeFilter,
        limit: 50,
    });

    const { categorize, loading: categorizing } = useCategorization();

    // Category options
    const categoryOptions = useMemo(() => {
        const options: Array<{ value: string; label: string }> = [];
        Object.entries(CATEGORIES).forEach(([group, cats]) => {
            Object.entries(cats).forEach(([key, val]) => {
                options.push({ value: key, label: val.label });
            });
        });
        return options;
    }, []);

    const handleCategorize = async (category: Category) => {
        if (!selectedTx) return;
        await categorize(selectedTx, category);
        setSelectedTx(null);
        refetch();
    };

    const selectedTransaction = transactions.find(t => t.id === selectedTx);

    return (
        <div className="pb-20 px-4 pt-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Transactions
                </h1>
            </div>

            {/* Search */}
            <SearchInput
                placeholder="Search transactions..."
                onSearch={setSearch}
            />

            {/* Filters */}
            <div className="flex gap-2">
                {(['all', 'credit', 'debit'] as const).map((type) => (
                    <button
                        key={type}
                        onClick={() => setTypeFilter(type)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${typeFilter === type
                                ? 'bg-[hsl(248,80%,36%)] text-white'
                                : 'bg-gray-100 dark:bg-[hsl(240,24%,26%)] text-gray-600 dark:text-gray-400'
                            }`}
                    >
                        {type === 'all' ? 'All' : type === 'credit' ? 'Income' : 'Expenses'}
                    </button>
                ))}
            </div>

            {/* Transaction List */}
            <div className="space-y-2">
                {loading ? (
                    <Card className="p-8 text-center text-gray-500">Loading...</Card>
                ) : transactions.length === 0 ? (
                    <Card className="p-8 text-center text-gray-500">
                        No transactions found
                    </Card>
                ) : (
                    transactions.map((tx) => (
                        <TransactionCard
                            key={tx.id}
                            icon={tx.type === 'credit' ? '💰' : '🛒'}
                            title={tx.description}
                            subtitle={tx.category ?? 'Tap to categorize'}
                            amount={Number(tx.amount)}
                            type={tx.type as 'credit' | 'debit'}
                            needsCategorization={!tx.category}
                            onClick={() => setSelectedTx(tx.id)}
                        />
                    ))
                )}
            </div>

            {/* Categorization Modal */}
            {selectedTx && selectedTransaction && (
                <div
                    className="fixed inset-0 z-50 bg-black/50 flex items-end"
                    onClick={() => setSelectedTx(null)}
                >
                    <div
                        className="w-full bg-white dark:bg-[hsl(240,27%,20%)] rounded-t-3xl p-6 space-y-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto" />

                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Categorize Transaction
                        </h3>

                        <div className="p-4 bg-gray-50 dark:bg-[hsl(240,24%,26%)] rounded-xl">
                            <p className="font-medium text-gray-900 dark:text-white">
                                {selectedTransaction.description}
                            </p>
                            <p className="text-sm text-gray-500">
                                ₦{Math.abs(Number(selectedTransaction.amount)).toLocaleString()}
                            </p>
                        </div>

                        <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                            {categoryOptions.map((cat) => (
                                <Button
                                    key={cat.value}
                                    variant="outline"
                                    size="sm"
                                    loading={categorizing}
                                    onClick={() => handleCategorize(cat.value as Category)}
                                    className="!h-auto py-3 flex-col"
                                >
                                    <span className="text-xs">{cat.label}</span>
                                </Button>
                            ))}
                        </div>

                        <Button
                            variant="ghost"
                            fullWidth
                            onClick={() => setSelectedTx(null)}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
