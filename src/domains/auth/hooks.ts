// =====================================================
// PRISM V2 - Auth Hooks
// React hooks for authentication state
// =====================================================

import { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import type { UserRole } from '@/shared/types';
import { AuthContext } from './context';

/**
 * Main auth hook - provides user state and auth methods from context
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
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
