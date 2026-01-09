// =====================================================
// PRISM V2 - Protected Route Component
// Auth guard for protected pages
// =====================================================

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/domains/auth';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
    children: ReactNode;
    requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
    const { user, loading, isAdmin } = useAuth();
    const location = useLocation();

    // Show loading state while checking auth
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[hsl(240,30%,16%)]">
                <div className="text-center">
                    <div className="w-12 h-12 rounded-full border-4 border-[hsl(248,80%,36%)] border-t-transparent animate-spin mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Redirect to dashboard if not admin but admin required
    if (requireAdmin && !isAdmin) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
}
