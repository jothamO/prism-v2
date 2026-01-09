// =====================================================
// PRISM V2 - Users Hooks
// React hooks for user management
// =====================================================

import { useState, useEffect, useCallback } from 'react';
import { getUserById, updateUser, getUsers } from './service';
import { useAuth } from '@/domains/auth';

interface UseUserState {
    user: Awaited<ReturnType<typeof getUserById>> | null;
    loading: boolean;
    error: string | null;
}

/**
 * Hook to get current user's profile
 */
export function useCurrentUserProfile() {
    const { user: authUser } = useAuth();
    const [state, setState] = useState<UseUserState>({
        user: null,
        loading: true,
        error: null,
    });

    useEffect(() => {
        if (!authUser?.id) {
            setState({ user: null, loading: false, error: null });
            return;
        }

        getUserById(authUser.id)
            .then(user => setState({ user, loading: false, error: null }))
            .catch(err => setState({ user: null, loading: false, error: err.message }));
    }, [authUser?.id]);

    const refetch = useCallback(async () => {
        if (!authUser?.id) return;
        setState(s => ({ ...s, loading: true }));
        try {
            const user = await getUserById(authUser.id);
            setState({ user, loading: false, error: null });
        } catch (err) {
            setState(s => ({ ...s, loading: false, error: (err as Error).message }));
        }
    }, [authUser?.id]);

    return { ...state, refetch };
}

/**
 * Hook to update current user's profile
 */
export function useUpdateProfile() {
    const { user: authUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const update = useCallback(async (updates: Parameters<typeof updateUser>[1]) => {
        if (!authUser?.id) {
            setError('Not authenticated');
            return null;
        }

        setLoading(true);
        setError(null);

        try {
            const result = await updateUser(authUser.id, updates);
            setLoading(false);
            return result;
        } catch (err) {
            setError((err as Error).message);
            setLoading(false);
            return null;
        }
    }, [authUser?.id]);

    return { update, loading, error };
}

/**
 * Hook for admin user list with pagination
 */
export function useUsersList(options?: {
    limit?: number;
    page?: number;
    search?: string;
    role?: string;
}) {
    const [users, setUsers] = useState<Awaited<ReturnType<typeof getUsers>>['users']>([]);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const limit = options?.limit ?? 10;
    const page = options?.page ?? 1;
    const offset = (page - 1) * limit;

    useEffect(() => {
        setLoading(true);
        getUsers({
            limit,
            offset,
            search: options?.search,
            role: options?.role,
        })
            .then(result => {
                setUsers(result.users ?? []);
                setCount(result.count ?? 0);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, [limit, offset, options?.search, options?.role]);

    const totalPages = Math.ceil(count / limit);

    return { users, count, totalPages, loading, error };
}
