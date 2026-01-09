// =====================================================
// PRISM V2 - Auth Service
// Supabase authentication wrapper
// =====================================================

import { createClient } from '@supabase/supabase-js';
import type { AuthenticatedUser, UserRole } from '@/shared/types';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials not found. Auth will not work.');
}

export const supabase = createClient(
    supabaseUrl ?? '',
    supabaseAnonKey ?? ''
);

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) throw error;
    return data;
}

/**
 * Sign up with email and password
 */
export async function signUp(email: string, password: string, fullName?: string) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { full_name: fullName },
        },
    });

    if (error) throw error;
    return data;
}

/**
 * Sign out current user
 */
export async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}

/**
 * Reset password
 */
export async function resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
}

/**
 * Update password
 */
export async function updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
        password: newPassword,
    });
    if (error) throw error;
}

/**
 * Get current session
 */
export async function getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
}

/**
 * Get current user with profile data
 */
export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Get user profile
    const { data: profile } = await supabase
        .from('users')
        .select('id, email, full_name, onboarding_complete')
        .eq('auth_user_id', user.id)
        .single();

    if (!profile) return null;

    // Get user role
    const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', profile.id)
        .single();

    // Get team if exists
    const { data: teamMember } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', profile.id)
        .eq('status', 'active')
        .single();

    return {
        id: profile.id,
        email: profile.email,
        role: (roleData?.role as UserRole) ?? 'user',
        teamId: teamMember?.team_id ?? null,
        onboardingComplete: profile.onboarding_complete ?? false,
        createdAt: new Date(),
    };
}

/**
 * Check if user has a specific role
 */
export async function hasRole(role: UserRole): Promise<boolean> {
    const user = await getCurrentUser();
    return user?.role === role;
}

/**
 * Check if user is admin
 */
export async function isAdmin(): Promise<boolean> {
    const user = await getCurrentUser();
    return user?.role === 'admin' || user?.role === 'owner';
}
