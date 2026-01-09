// =====================================================
// PRISM V2 - Teams Service
// Team management and collaboration
// =====================================================

import { supabase } from '@/domains/auth/service';
import type { Team, TeamMember, TeamRole, InviteStatus } from '@/shared/types';

/**
 * Create a new team
 */
export async function createTeam(name: string, ownerId: string): Promise<Team> {
    const { data, error } = await supabase
        .from('teams')
        .insert({
            name,
            owner_id: ownerId,
        })
        .select()
        .single();

    if (error) throw error;

    // Add owner as team member
    await supabase.from('team_members').insert({
        team_id: data.id,
        user_id: ownerId,
        email: '', // Will be filled from user
        role: 'owner',
        status: 'active',
        joined_at: new Date().toISOString(),
    });

    return {
        id: data.id,
        name: data.name,
        ownerId: data.owner_id,
        createdAt: new Date(data.created_at ?? new Date().toISOString()),
    };
}

/**
 * Get team by ID
 */
export async function getTeamById(teamId: string) {
    const { data, error } = await supabase
        .from('teams')
        .select(`
      id,
      name,
      owner_id,
      subscription_tier,
      created_at,
      team_members(
        id,
        user_id,
        email,
        role,
        status,
        joined_at,
        users(full_name, avatar_url)
      )
    `)
        .eq('id', teamId)
        .single();

    if (error) throw error;
    return data;
}

/**
 * Get teams for a user
 */
export async function getUserTeams(userId: string) {
    const { data, error } = await supabase
        .from('team_members')
        .select(`
      team_id,
      role,
      status,
      teams(
        id,
        name,
        owner_id,
        subscription_tier,
        created_at
      )
    `)
        .eq('user_id', userId)
        .eq('status', 'active');

    if (error) throw error;
    return data;
}

/**
 * Invite a member to a team
 */
export async function inviteMember(
    teamId: string,
    email: string,
    role: TeamRole,
    invitedBy: string
): Promise<TeamMember> {
    // Generate invite token
    const inviteToken = crypto.randomUUID();

    const { data, error } = await supabase
        .from('team_members')
        .insert({
            team_id: teamId,
            email,
            role,
            status: 'pending',
            invited_by: invitedBy,
            invite_token: inviteToken,
        })
        .select()
        .single();

    if (error) throw error;

    // TODO: Send invite email via edge function

    return {
        id: data.id,
        teamId: data.team_id,
        userId: data.user_id ?? '',
        role: data.role as TeamRole,
        status: data.status as InviteStatus,
        invitedBy: data.invited_by ?? '',
        joinedAt: data.joined_at ? new Date(data.joined_at) : null,
    };
}

/**
 * Accept a team invitation
 */
export async function acceptInvitation(inviteToken: string, userId: string) {
    const { data, error } = await supabase
        .from('team_members')
        .update({
            user_id: userId,
            status: 'active',
            joined_at: new Date().toISOString(),
            invite_token: null,
        })
        .eq('invite_token', inviteToken)
        .eq('status', 'pending')
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Remove a member from a team
 */
export async function removeMember(teamId: string, memberId: string) {
    const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId)
        .eq('team_id', teamId)
        .neq('role', 'owner'); // Can't remove owner

    if (error) throw error;
}

/**
 * Update a member's role
 */
export async function updateMemberRole(
    teamId: string,
    memberId: string,
    newRole: TeamRole
) {
    if (newRole === 'owner') {
        throw new Error('Cannot change role to owner. Use transferOwnership instead.');
    }

    const { data, error } = await supabase
        .from('team_members')
        .update({ role: newRole })
        .eq('id', memberId)
        .eq('team_id', teamId)
        .neq('role', 'owner')
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Transfer team ownership
 */
export async function transferOwnership(
    teamId: string,
    currentOwnerId: string,
    newOwnerId: string
) {
    // Demote current owner to admin
    await supabase
        .from('team_members')
        .update({ role: 'admin' })
        .eq('team_id', teamId)
        .eq('user_id', currentOwnerId);

    // Promote new owner
    await supabase
        .from('team_members')
        .update({ role: 'owner' })
        .eq('team_id', teamId)
        .eq('user_id', newOwnerId);

    // Update team owner
    const { error } = await supabase
        .from('teams')
        .update({ owner_id: newOwnerId })
        .eq('id', teamId);

    if (error) throw error;
}

/**
 * Leave a team
 */
export async function leaveTeam(teamId: string, userId: string) {
    // Check if user is owner
    const { data: member } = await supabase
        .from('team_members')
        .select('role')
        .eq('team_id', teamId)
        .eq('user_id', userId)
        .single();

    if (member?.role === 'owner') {
        throw new Error('Owner cannot leave team. Transfer ownership first.');
    }

    const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', teamId)
        .eq('user_id', userId);

    if (error) throw error;
}

/**
 * Delete a team (owner only)
 */
export async function deleteTeam(teamId: string, ownerId: string) {
    // Verify ownership
    const { data: team } = await supabase
        .from('teams')
        .select('owner_id')
        .eq('id', teamId)
        .single();

    if (team?.owner_id !== ownerId) {
        throw new Error('Only the owner can delete a team');
    }

    const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId);

    if (error) throw error;
}
