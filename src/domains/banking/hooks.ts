// =====================================================
// PRISM V2 - Banking Hooks
// React hooks for bank connection management
// =====================================================

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/domains/auth';
import {
    getBankConnections,
    getBankConnection,
    syncBankTransactions,
    disconnectBank,
    getConnectionStatus,
} from './service';

/**
 * Hook to get all bank connections for current user
 */
export function useBankConnections() {
    const { user } = useAuth();
    const [connections, setConnections] = useState<Awaited<ReturnType<typeof getBankConnections>>>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchConnections = useCallback(async () => {
        if (!user?.id) {
            setConnections([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const data = await getBankConnections(user.id);
            setConnections(data ?? []);
        } catch (err) {
            setError((err as Error).message);
        }
        setLoading(false);
    }, [user?.id]);

    useEffect(() => {
        fetchConnections();
    }, [fetchConnections]);

    return { connections, loading, error, refetch: fetchConnections };
}

/**
 * Hook to get a single bank connection
 */
export function useBankConnection(connectionId: string | undefined) {
    const [connection, setConnection] = useState<Awaited<ReturnType<typeof getBankConnection>> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!connectionId) {
            setConnection(null);
            setLoading(false);
            return;
        }

        getBankConnection(connectionId)
            .then(data => {
                setConnection(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, [connectionId]);

    return { connection, loading, error };
}

/**
 * Hook for bank sync actions
 */
export function useBankSync() {
    const [syncing, setSyncing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastResult, setLastResult] = useState<{
        synced: number;
        newTransactions: number;
    } | null>(null);

    const sync = useCallback(async (connectionId: string) => {
        setSyncing(true);
        setError(null);
        try {
            const result = await syncBankTransactions(connectionId);
            setLastResult(result);
            setSyncing(false);
            return result;
        } catch (err) {
            setError((err as Error).message);
            setSyncing(false);
            throw err;
        }
    }, []);

    return { sync, syncing, error, lastResult };
}

/**
 * Hook for connection health status
 */
export function useConnectionStatus(connectionId: string | undefined) {
    const [status, setStatus] = useState<Awaited<ReturnType<typeof getConnectionStatus>> | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!connectionId) {
            setStatus(null);
            setLoading(false);
            return;
        }

        getConnectionStatus(connectionId)
            .then(data => {
                setStatus(data);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    }, [connectionId]);

    return { status, loading };
}

/**
 * Hook to manage bank connection actions
 */
export function useBankActions() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const disconnect = useCallback(async (connectionId: string) => {
        setLoading(true);
        setError(null);
        try {
            await disconnectBank(connectionId);
            setLoading(false);
        } catch (err) {
            setError((err as Error).message);
            setLoading(false);
            throw err;
        }
    }, []);

    return { disconnect, loading, error };
}
