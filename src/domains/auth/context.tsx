// =====================================================
// PRISM V2 - Auth Context
// Shared authentication state across the app
// =====================================================

import { createContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { AuthenticatedUser } from '@/shared/types';
import {
    supabase,
    getCurrentUser,
    signIn as authSignIn,
    signOut as authSignOut,
    signUp as authSignUp,
} from './service';

interface AuthContextValue {
    user: AuthenticatedUser | null;
    loading: boolean;
    error: string | null;
    signIn: (email: string, password: string) => Promise<AuthenticatedUser | null>;
    signUp: (email: string, password: string, fullName?: string) => Promise<void>;
    signOut: () => Promise<void>;
    clearError: () => void;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isOwner: boolean;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<AuthenticatedUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Initialize auth state and listen for changes
    useEffect(() => {
        // Set up auth state listener FIRST
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session) {
                const currentUser = await getCurrentUser();
                setUser(currentUser);
                setLoading(false);
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
                setLoading(false);
            } else if (event === 'INITIAL_SESSION') {
                // Handle initial session check
                if (session) {
                    const currentUser = await getCurrentUser();
                    setUser(currentUser);
                }
                setLoading(false);
            }
        });

        // Then get initial session
        getCurrentUser()
            .then(currentUser => {
                setUser(currentUser);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error getting current user:', err);
                setLoading(false);
            });

        return () => subscription.unsubscribe();
    }, []);

    const signIn = useCallback(async (email: string, password: string) => {
        setError(null);
        try {
            await authSignIn(email, password);
            const currentUser = await getCurrentUser();
            setUser(currentUser);
            return currentUser;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Sign in failed';
            setError(message);
            throw err;
        }
    }, []);

    const signUp = useCallback(async (email: string, password: string, fullName?: string) => {
        setError(null);
        try {
            await authSignUp(email, password, fullName);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Sign up failed';
            setError(message);
            throw err;
        }
    }, []);

    const signOut = useCallback(async () => {
        try {
            await authSignOut();
            setUser(null);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Sign out failed';
            setError(message);
        }
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const value: AuthContextValue = {
        user,
        loading,
        error,
        signIn,
        signUp,
        signOut,
        clearError,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin' || user?.role === 'owner',
        isOwner: user?.role === 'owner',
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
