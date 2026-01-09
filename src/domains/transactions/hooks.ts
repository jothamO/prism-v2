// =====================================================
// PRISM V2 - Transactions Hooks
// React hooks for transaction management
// =====================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/domains/auth';
import {
    getTransactions,
    getTransactionStats,
    getMonthlySummary,
    getTransactionsForReview,
    categorizeTransaction,
    batchCategorize,
    type TransactionFilters,
} from './service';
import type { Category } from '@/shared/types';

/**
 * Hook to get transactions with filtering
 */
export function useTransactions(filters?: Partial<TransactionFilters>) {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState<Awaited<ReturnType<typeof getTransactions>>['transactions']>([]);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTransactions = useCallback(async () => {
        if (!user?.id) {
            setTransactions([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const result = await getTransactions({
                userId: user.id,
                ...filters,
            });
            setTransactions(result.transactions);
            setCount(result.count);
        } catch (err) {
            setError((err as Error).message);
        }
        setLoading(false);
    }, [user?.id, filters?.startDate?.getTime(), filters?.endDate?.getTime(), filters?.type, filters?.search, filters?.limit, filters?.offset]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    return { transactions, count, loading, error, refetch: fetchTransactions };
}

/**
 * Hook for transaction statistics
 */
export function useTransactionStats(startDate?: Date, endDate?: Date) {
    const { user } = useAuth();
    const [stats, setStats] = useState<Awaited<ReturnType<typeof getTransactionStats>> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user?.id) {
            setStats(null);
            setLoading(false);
            return;
        }

        getTransactionStats(user.id, startDate, endDate)
            .then(data => {
                setStats(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, [user?.id, startDate?.getTime(), endDate?.getTime()]);

    return { stats, loading, error };
}

/**
 * Hook for monthly summary data
 */
export function useMonthlySummary(year: number) {
    const { user } = useAuth();
    const [data, setData] = useState<Awaited<ReturnType<typeof getMonthlySummary>>>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user?.id) {
            setData([]);
            setLoading(false);
            return;
        }

        getMonthlySummary(user.id, year)
            .then(result => {
                setData(result);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, [user?.id, year]);

    return { data, loading, error };
}

/**
 * Hook for transactions needing review
 */
export function useReviewQueue(limit = 20) {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState<Awaited<ReturnType<typeof getTransactionsForReview>>>([]);
    const [loading, setLoading] = useState(true);

    const fetchQueue = useCallback(async () => {
        if (!user?.id) {
            setTransactions([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const data = await getTransactionsForReview(user.id, limit);
            setTransactions(data);
        } catch {
            // Silently fail
        }
        setLoading(false);
    }, [user?.id, limit]);

    useEffect(() => {
        fetchQueue();
    }, [fetchQueue]);

    return { transactions, loading, refetch: fetchQueue };
}

/**
 * Hook for categorization actions
 */
export function useCategorization() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const categorize = useCallback(async (transactionId: string, category: Category) => {
        setLoading(true);
        setError(null);
        try {
            const result = await categorizeTransaction(transactionId, category, 'manual');
            setLoading(false);
            return result;
        } catch (err) {
            setError((err as Error).message);
            setLoading(false);
            throw err;
        }
    }, []);

    const batchUpdate = useCallback(async (transactionIds: string[], category: Category) => {
        setLoading(true);
        setError(null);
        try {
            const result = await batchCategorize(transactionIds, category);
            setLoading(false);
            return result;
        } catch (err) {
            setError((err as Error).message);
            setLoading(false);
            throw err;
        }
    }, []);

    return { categorize, batchUpdate, loading, error };
}

/**
 * Hook for tax-related transaction filtering
 */
export function useTaxableTransactions(year: number) {
    // Auth hook unused here as useTransactions handles user filtering internally
    const startDate = useMemo(() => new Date(year, 0, 1), [year]);
    const endDate = useMemo(() => new Date(year, 11, 31), [year]);

    const { transactions, loading, error } = useTransactions({
        startDate,
        endDate,
    });

    const taxableIncome = useMemo(() => {
        return transactions
            .filter(t => t.type === 'credit' && t.category !== 'transfer')
            .reduce((sum, t) => sum + Number(t.amount), 0);
    }, [transactions]);

    const deductibleExpenses = useMemo(() => {
        const deductibleCategories: Category[] = ['utilities', 'transport', 'bank_charges'];
        return transactions
            .filter(t => t.type === 'debit' && t.category && deductibleCategories.includes(t.category as Category))
            .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);
    }, [transactions]);

    return { transactions, taxableIncome, deductibleExpenses, loading, error };
}
