// =====================================================
// PRISM V2 - Classification Hooks
// React hooks for AI classification
// =====================================================

import { useState, useCallback } from 'react';
import { classifyTransaction, classifyBatch } from './engine';
import { categorizeTransaction } from '@/domains/transactions/service';
import { useAuth } from '@/domains/auth';
import type { Category, ClassificationResult, Transaction } from '@/shared/types';

/**
 * Hook for single transaction classification
 */
export function useClassification() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastResult, setLastResult] = useState<ClassificationResult | null>(null);

    const classify = useCallback(async (
        transaction: Pick<Transaction, 'id' | 'description' | 'amount' | 'type'>
    ): Promise<ClassificationResult | null> => {
        if (!user?.id) {
            setError('Not authenticated');
            return null;
        }

        setLoading(true);
        setError(null);

        try {
            const result = await classifyTransaction(transaction, user.id);
            setLastResult(result);

            // Auto-save if confident
            if (result.confidence >= 0.8 && result.category !== 'uncategorized') {
                await categorizeTransaction(
                    transaction.id,
                    result.category,
                    result.source === 'pattern' ? 'pattern' : 'ai'
                );
            }

            setLoading(false);
            return result;
        } catch (err) {
            setError((err as Error).message);
            setLoading(false);
            return null;
        }
    }, [user?.id]);

    return { classify, loading, error, lastResult };
}

/**
 * Hook for batch classification
 */
export function useBatchClassification() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const classifyAll = useCallback(async (
        transactions: Array<Pick<Transaction, 'id' | 'description' | 'amount' | 'type'>>,
        autoSave = true
    ): Promise<Map<string, ClassificationResult>> => {
        if (!user?.id) {
            setError('Not authenticated');
            return new Map();
        }

        setLoading(true);
        setProgress(0);
        setError(null);

        try {
            const results = await classifyBatch(transactions, user.id);
            setProgress(100);

            // Auto-save confident classifications
            if (autoSave) {
                for (const [txId, result] of results) {
                    if (result.confidence >= 0.8 && result.category !== 'uncategorized') {
                        await categorizeTransaction(
                            txId,
                            result.category,
                            result.source === 'pattern' ? 'pattern' : 'ai'
                        );
                    }
                }
            }

            setLoading(false);
            return results;
        } catch (err) {
            setError((err as Error).message);
            setLoading(false);
            return new Map();
        }
    }, [user?.id]);

    return { classifyAll, loading, progress, error };
}

/**
 * Hook for classification with manual confirmation
 */
export function useClassificationWithConfirmation() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [suggestion, setSuggestion] = useState<ClassificationResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const getSuggestion = useCallback(async (
        transaction: Pick<Transaction, 'id' | 'description' | 'amount' | 'type'>
    ) => {
        if (!user?.id) return;

        setLoading(true);
        try {
            const result = await classifyTransaction(transaction, user.id);
            setSuggestion(result);
        } catch (err) {
            setError((err as Error).message);
        }
        setLoading(false);
    }, [user?.id]);

    const confirm = useCallback(async (
        transactionId: string,
        category?: Category
    ) => {
        const finalCategory = category ?? suggestion?.category;
        if (!finalCategory) return;

        setLoading(true);
        try {
            await categorizeTransaction(transactionId, finalCategory, 'manual');
            setSuggestion(null);
        } catch (err) {
            setError((err as Error).message);
        }
        setLoading(false);
    }, [suggestion?.category]);

    const reject = useCallback(() => {
        setSuggestion(null);
    }, []);

    return { getSuggestion, confirm, reject, suggestion, loading, error };
}

/**
 * Hook to get classification stats
 */
export function useClassificationStats() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        patternMatched: 0,
        historyMatched: 0,
        aiClassified: 0,
        manuallyReviewed: 0,
        accuracy: 0,
    });
    const [loading, setLoading] = useState(true);

    // TODO: Implement actual stats fetching from database

    return { stats, loading };
}
