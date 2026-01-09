// =====================================================
// PRISM V2 - Auth Hooks
// React hooks for authentication state
// =====================================================

import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AuthenticatedUser, UserRole } from '@/shared/types';
import {
    supabase,
    getCurrentUser,
    signIn as authSignIn,
    signOut as authSignOut,
    signUp as authSignUp,
} from './service';

interface AuthState {
    user: AuthenticatedUser | null;
    loading: boolean;
    error: string | null;
}

/**
 * Main auth hook - provides user state and auth methods
 */
export function useAuth() {
    const [state, setState] = useState<AuthState>({
        user: null,
        loading: true,
        error: null,
    });
    const navigate = useNavigate();

    // Listen for auth state changes
    useEffect(() => {
        // Get initial session
        getCurrentUser()
            .then(user => setState({ user, loading: false, error: null }))
            .catch(err => setState({ user: null, loading: false, error: err.message }));

        // Subscribe to auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session) {
                const user = await getCurrentUser();
                setState({ user, loading: false, error: null });
            } else if (event === 'SIGNED_OUT') {
                setState({ user: null, loading: false, error: null });
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const signIn = useCallback(async (email: string, password: string) => {
        setState(s => ({ ...s, loading: true, error: null }));
        try {
            await authSignIn(email, password);
            const user = await getCurrentUser();
            setState({ user, loading: false, error: null });
            return user;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Sign in failed';
            setState(s => ({ ...s, loading: false, error: message }));
            throw err;
        }
    }, []);

    const signUp = useCallback(async (email: string, password: string, fullName?: string) => {
        setState(s => ({ ...s, loading: true, error: null }));
        try {
            await authSignUp(email, password, fullName);
            setState(s => ({ ...s, loading: false }));
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Sign up failed';
            setState(s => ({ ...s, loading: false, error: message }));
            throw err;
        }
    }, []);

    const signOut = useCallback(async () => {
        setState(s => ({ ...s, loading: true }));
        try {
            await authSignOut();
            setState({ user: null, loading: false, error: null });
            navigate('/auth');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Sign out failed';
            setState(s => ({ ...s, loading: false, error: message }));
        }
    }, [navigate]);

    const clearError = useCallback(() => {
        setState(s => ({ ...s, error: null }));
    }, []);

    return {
        user: state.user,
        loading: state.loading,
        error: state.error,
        signIn,
        signUp,
        signOut,
        clearError,
        isAuthenticated: !!state.user,
        isAdmin: state.user?.role === 'admin' || state.user?.role === 'owner',
        isOwner: state.user?.role === 'owner',
    };
}

/**
 * Hook to check if user has specific role
 */
export function useRole(requiredRole: UserRole): boolean {
    const { user } = useAuth();
    return user?.role === requiredRole;
}

/**
 * Hook to require authentication - redirects if not authenticated
 */
export function useRequireAuth(redirectTo = '/auth') {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !user) {
            navigate(redirectTo);
        }
    }, [user, loading, navigate, redirectTo]);

    return { user, loading };
}

/**
 * Hook to require admin role - redirects if not admin
 */
export function useRequireAdmin(redirectTo = '/dashboard') {
    const { user, loading, isAdmin } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && (!user || !isAdmin)) {
            navigate(redirectTo);
        }
    }, [user, loading, isAdmin, navigate, redirectTo]);

    return { user, loading, isAdmin };
}
