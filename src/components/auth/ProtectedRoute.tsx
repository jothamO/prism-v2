// =====================================================
// PRISM V2 - Protected Route Component
// Auth guard for protected pages
// =====================================================

import { forwardRef, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/domains/auth';

interface ProtectedRouteProps {
    children: ReactNode;
    requireAdmin?: boolean;
}

export const ProtectedRoute = forwardRef<HTMLDivElement, ProtectedRouteProps>(
    function ProtectedRoute({ children, requireAdmin = false }, ref) {
        const { user, loading, isAdmin } = useAuth();
        const location = useLocation();

        // Show loading state while checking auth
        if (loading) {
            return (
                <div ref={ref} className="min-h-screen flex items-center justify-center bg-background">
                    <div className="text-center">
                        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
                        <p className="text-muted-foreground">Loading...</p>
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

        return <div ref={ref}>{children}</div>;
    }
);
