// =====================================================
// PRISM V2 - Users Service
// User profile management
// =====================================================

import { supabase } from '@/domains/auth/service';
import type { AuthenticatedUser } from '@/shared/types';

interface UpdateUserData {
    fullName?: string;
    phone?: string;
    avatarUrl?: string;
    onboardingComplete?: boolean;
}

/**
 * Get user profile by ID
 */
export async function getUserById(userId: string) {
    const { data, error } = await supabase
        .from('users')
        .select(`
      id,
      email,
      full_name,
      phone,
      avatar_url,
      onboarding_complete,
      created_at,
      user_roles(role)
    `)
        .eq('id', userId)
        .single();

    if (error) throw error;
    return data;
}

/**
 * Update user profile
 */
export async function updateUser(userId: string, updates: UpdateUserData) {
    const { data, error } = await supabase
        .from('users')
        .update({
            full_name: updates.fullName,
            phone: updates.phone,
            avatar_url: updates.avatarUrl,
            onboarding_complete: updates.onboardingComplete,
            updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Complete user onboarding
 */
export async function completeOnboarding(userId: string) {
    return updateUser(userId, { onboardingComplete: true });
}

/**
 * Upload user avatar
 */
export async function uploadAvatar(userId: string, file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

    // Update user with new avatar URL
    await updateUser(userId, { avatarUrl: data.publicUrl });

    return data.publicUrl;
}

/**
 * Get users for admin view
 */
export async function getUsers(options?: {
    limit?: number;
    offset?: number;
    search?: string;
    role?: string;
}) {
    let query = supabase
        .from('users')
        .select(`
      id,
      email,
      full_name,
      phone,
      onboarding_complete,
      created_at,
      user_roles(role)
    `, { count: 'exact' });

    if (options?.search) {
        query = query.or(`email.ilike.%${options.search}%,full_name.ilike.%${options.search}%`);
    }

    if (options?.limit) {
        query = query.limit(options.limit);
    }

    if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit ?? 10) - 1);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) throw error;
    return { users: data, count };
}

/**
 * Delete user (admin only)
 */
export async function deleteUser(userId: string) {
    const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

    if (error) throw error;
}
