// =====================================================
// PRISM V2 - Compliance Hooks
// React hooks for compliance management
// =====================================================

import { useState, useEffect, useCallback } from 'react';
import {
    getLegalDocuments,
    getDocumentById,
    getRegulatoryBodies,
    getActiveRules,
    getComplianceStats,
    approveDocument,
    rejectDocument,
} from './service';
import { getGaps, logGap } from './gap-tracking';
import { evaluateRules } from './rule-engine';
import type { ComplianceRule } from '@/shared/types';

/**
 * Hook to get compliance dashboard stats
 */
export function useComplianceStats() {
    const [stats, setStats] = useState<Awaited<ReturnType<typeof getComplianceStats>> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getComplianceStats()
            .then(data => {
                setStats(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    return { stats, loading, error };
}

/**
 * Hook to get regulatory bodies
 */
export function useRegulatoryBodies() {
    const [bodies, setBodies] = useState<Awaited<ReturnType<typeof getRegulatoryBodies>>>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getRegulatoryBodies()
            .then(data => {
                setBodies(data ?? []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    return { bodies, loading };
}

/**
 * Hook to get legal documents with filtering
 */
export function useLegalDocuments(options?: Parameters<typeof getLegalDocuments>[0]) {
    const [documents, setDocuments] = useState<Awaited<ReturnType<typeof getLegalDocuments>>['documents']>([]);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async () => {
        setLoading(true);
        try {
            const result = await getLegalDocuments(options);
            setDocuments(result.documents);
            setCount(result.count);
        } catch (err) {
            setError((err as Error).message);
        }
        setLoading(false);
    }, [options?.regulatoryBodyId, options?.status, options?.search]);

    useEffect(() => {
        fetch();
    }, [fetch]);

    return { documents, count, loading, error, refetch: fetch };
}

/**
 * Hook to get a single document with details
 */
export function useDocument(documentId: string | undefined) {
    const [document, setDocument] = useState<Awaited<ReturnType<typeof getDocumentById>> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!documentId) {
            setDocument(null);
            setLoading(false);
            return;
        }

        getDocumentById(documentId)
            .then(data => {
                setDocument(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, [documentId]);

    return { document, loading, error };
}

/**
 * Hook for document review actions
 */
export function useDocumentReview() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const approve = useCallback(async (documentId: string, notes?: string) => {
        setLoading(true);
        setError(null);
        try {
            await approveDocument(documentId, notes);
            setLoading(false);
        } catch (err) {
            setError((err as Error).message);
            setLoading(false);
            throw err;
        }
    }, []);

    const reject = useCallback(async (documentId: string, reason: string) => {
        setLoading(true);
        setError(null);
        try {
            await rejectDocument(documentId, reason);
            setLoading(false);
        } catch (err) {
            setError((err as Error).message);
            setLoading(false);
            throw err;
        }
    }, []);

    return { approve, reject, loading, error };
}

/**
 * Hook to get active compliance rules
 */
export function useActiveRules(options?: Parameters<typeof getActiveRules>[0]) {
    const [rules, setRules] = useState<Awaited<ReturnType<typeof getActiveRules>>>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getActiveRules(options)
            .then(data => {
                setRules(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [options?.ruleType]);

    return { rules, loading };
}

/**
 * Hook to evaluate rules against a context
 */
export function useRuleEvaluation(context: Record<string, unknown>) {
    const { rules, loading: rulesLoading } = useActiveRules();
    const [results, setResults] = useState<ReturnType<typeof evaluateRules>>([]);

    useEffect(() => {
        if (!rulesLoading && rules.length > 0) {
            const evalResults = evaluateRules(rules as ComplianceRule[], context);
            setResults(evalResults);
        }
    }, [rules, rulesLoading, JSON.stringify(context)]);

    return { results, loading: rulesLoading };
}

/**
 * Hook for gap tracking
 */
export function useGaps(options?: Parameters<typeof getGaps>[0]) {
    const [gaps, setGaps] = useState<Awaited<ReturnType<typeof getGaps>>['gaps']>([]);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetch = useCallback(async () => {
        setLoading(true);
        try {
            const result = await getGaps(options);
            setGaps(result.gaps);
            setCount(result.count);
        } catch {
            // Silently fail
        }
        setLoading(false);
    }, [options?.status, options?.category, options?.priority]);

    useEffect(() => {
        fetch();
    }, [fetch]);

    const addGap = useCallback(async (gap: Parameters<typeof logGap>[0]) => {
        await logGap(gap);
        await fetch();
    }, [fetch]);

    return { gaps, count, loading, refetch: fetch, addGap };
}
