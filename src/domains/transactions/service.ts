// =====================================================
// PRISM V2 - Transactions Service
// Transaction CRUD and filtering
// =====================================================

import { supabase } from '@/domains/auth/service';
import type { Category, TransactionType } from '@/shared/types';

export interface TransactionFilters {
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    type?: TransactionType;
    categories?: Category[];
    search?: string;
    needsReview?: boolean;
    limit?: number;
    offset?: number;
}

export interface TransactionStats {
    totalIncome: number;
    totalExpenses: number;
    transactionCount: number;
    categorizedCount: number;
    uncategorizedCount: number;
}

/**
 * Get transactions with filtering and pagination
 */
export async function getTransactions(filters: TransactionFilters) {
    let query = supabase
        .from('bank_transactions')
        .select('*', { count: 'exact' });

    if (filters.userId) {
        query = query.eq('user_id', filters.userId);
    }

    if (filters.startDate) {
        query = query.gte('transaction_date', filters.startDate.toISOString().split('T')[0]);
    }

    if (filters.endDate) {
        query = query.lte('transaction_date', filters.endDate.toISOString().split('T')[0]);
    }

    if (filters.type) {
        query = query.eq('type', filters.type);
    }

    if (filters.categories && filters.categories.length > 0) {
        query = query.in('category', filters.categories);
    }

    if (filters.search) {
        query = query.ilike('description', `%${filters.search}%`);
    }

    if (filters.needsReview !== undefined) {
        query = query.eq('needs_review', filters.needsReview);
    }

    if (filters.limit) {
        query = query.limit(filters.limit);
    }

    if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit ?? 50) - 1);
    }

    query = query.order('transaction_date', { ascending: false });

    const { data, error, count } = await query;

    if (error) throw error;
    return { transactions: data ?? [], count: count ?? 0 };
}

/**
 * Get a single transaction
 */
export async function getTransaction(transactionId: string) {
    const { data, error } = await supabase
        .from('bank_transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

    if (error) throw error;
    return data;
}

/**
 * Update transaction category
 */
export async function categorizeTransaction(
    transactionId: string,
    category: Category,
    source: 'manual' | 'ai' | 'pattern' = 'manual'
) {
    const { data, error } = await supabase
        .from('bank_transactions')
        .update({
            category,
            classification_source: source,
            classification_confidence: source === 'manual' ? 1.0 : null,
            needs_review: false,
            updated_at: new Date().toISOString(),
        })
        .eq('id', transactionId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Batch categorize multiple transactions
 */
export async function batchCategorize(
    transactionIds: string[],
    category: Category
) {
    const { data, error } = await supabase
        .from('bank_transactions')
        .update({
            category,
            classification_source: 'manual',
            classification_confidence: 1.0,
            needs_review: false,
            updated_at: new Date().toISOString(),
        })
        .in('id', transactionIds)
        .select();

    if (error) throw error;
    return data;
}

/**
 * Mark transaction for review
 */
export async function markForReview(transactionId: string) {
    const { error } = await supabase
        .from('bank_transactions')
        .update({ needs_review: true })
        .eq('id', transactionId);

    if (error) throw error;
}

/**
 * Get transaction statistics
 */
export async function getTransactionStats(
    userId: string,
    startDate?: Date,
    endDate?: Date
): Promise<TransactionStats> {
    let query = supabase
        .from('bank_transactions')
        .select('amount, type, category')
        .eq('user_id', userId);

    if (startDate) {
        query = query.gte('transaction_date', startDate.toISOString().split('T')[0]);
    }

    if (endDate) {
        query = query.lte('transaction_date', endDate.toISOString().split('T')[0]);
    }

    const { data, error } = await query;

    if (error) throw error;

    const transactions = data ?? [];

    return {
        totalIncome: transactions
            .filter(t => t.type === 'credit')
            .reduce((sum, t) => sum + Number(t.amount), 0),
        totalExpenses: transactions
            .filter(t => t.type === 'debit')
            .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0),
        transactionCount: transactions.length,
        categorizedCount: transactions.filter(t => t.category !== null).length,
        uncategorizedCount: transactions.filter(t => t.category === null).length,
    };
}

/**
 * Get monthly summary
 */
export async function getMonthlySummary(userId: string, year: number) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    const { data, error } = await supabase
        .from('bank_transactions')
        .select('amount, type, transaction_date')
        .eq('user_id', userId)
        .gte('transaction_date', startDate.toISOString().split('T')[0])
        .lte('transaction_date', endDate.toISOString().split('T')[0]);

    if (error) throw error;

    // Group by month
    const monthlyData: Record<number, { income: number; expenses: number }> = {};

    for (let i = 0; i < 12; i++) {
        monthlyData[i] = { income: 0, expenses: 0 };
    }

    for (const tx of data ?? []) {
        const month = new Date(tx.transaction_date).getMonth();
        const amount = Number(tx.amount);

        if (tx.type === 'credit') {
            monthlyData[month]!.income += amount;
        } else {
            monthlyData[month]!.expenses += Math.abs(amount);
        }
    }

    return Object.entries(monthlyData).map(([month, data]) => ({
        month: Number(month),
        ...data,
    }));
}

/**
 * Get transactions needing review
 */
export async function getTransactionsForReview(userId: string, limit = 20) {
    const { data, error } = await supabase
        .from('bank_transactions')
        .select('*')
        .eq('user_id', userId)
        .or('needs_review.eq.true,category.is.null')
        .order('transaction_date', { ascending: false })
        .limit(limit);

    if (error) throw error;
    return data ?? [];
}
