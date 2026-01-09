// =====================================================
// PRISM V2 - Protected Route Component
// Wraps routes requiring authentication
// =====================================================

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/domains/auth';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
    const { user, loading, isAdmin } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen bg-[hsl(240,6%,97%)] dark:bg-[hsl(240,27%,13%)] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(248,80%,36%)]" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }

    if (requireAdmin && !isAdmin) {
        return (
            <div className="min-h-screen bg-[hsl(240,6%,97%)] dark:bg-[hsl(240,27%,13%)] flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Access Denied
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        You don't have permission to access this area.
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
