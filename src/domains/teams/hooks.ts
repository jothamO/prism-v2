// =====================================================
// PRISM V2 - Teams Hooks
// React hooks for team management
// =====================================================

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/domains/auth';
import {
    getTeamById,
    getUserTeams,
    createTeam,
    inviteMember,
    removeMember,
    updateMemberRole,
    leaveTeam,
} from './service';
import type { TeamRole } from '@/shared/types';

/**
 * Hook to get current user's team
 */
export function useCurrentTeam() {
    const { user } = useAuth();
    const [team, setTeam] = useState<Awaited<ReturnType<typeof getTeamById>> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user?.teamId) {
            setTeam(null);
            setLoading(false);
            return;
        }

        getTeamById(user.teamId)
            .then(data => {
                setTeam(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, [user?.teamId]);

    const refetch = useCallback(async () => {
        if (!user?.teamId) return;
        setLoading(true);
        try {
            const data = await getTeamById(user.teamId);
            setTeam(data);
        } catch (err) {
            setError((err as Error).message);
        }
        setLoading(false);
    }, [user?.teamId]);

    return { team, loading, error, refetch };
}

/**
 * Hook to get all teams for current user
 */
export function useUserTeams() {
    const { user } = useAuth();
    const [teams, setTeams] = useState<Awaited<ReturnType<typeof getUserTeams>>>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user?.id) {
            setTeams([]);
            setLoading(false);
            return;
        }

        getUserTeams(user.id)
            .then(data => {
                setTeams(data ?? []);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, [user?.id]);

    return { teams, loading, error };
}

/**
 * Hook for team management actions
 */
export function useTeamActions() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const create = useCallback(async (name: string) => {
        if (!user?.id) throw new Error('Not authenticated');
        setLoading(true);
        setError(null);
        try {
            const team = await createTeam(name, user.id);
            setLoading(false);
            return team;
        } catch (err) {
            setError((err as Error).message);
            setLoading(false);
            throw err;
        }
    }, [user?.id]);

    const invite = useCallback(async (teamId: string, email: string, role: TeamRole) => {
        if (!user?.id) throw new Error('Not authenticated');
        setLoading(true);
        setError(null);
        try {
            const member = await inviteMember(teamId, email, role, user.id);
            setLoading(false);
            return member;
        } catch (err) {
            setError((err as Error).message);
            setLoading(false);
            throw err;
        }
    }, [user?.id]);

    const remove = useCallback(async (teamId: string, memberId: string) => {
        setLoading(true);
        setError(null);
        try {
            await removeMember(teamId, memberId);
            setLoading(false);
        } catch (err) {
            setError((err as Error).message);
            setLoading(false);
            throw err;
        }
    }, []);

    const changeRole = useCallback(async (teamId: string, memberId: string, role: TeamRole) => {
        setLoading(true);
        setError(null);
        try {
            await updateMemberRole(teamId, memberId, role);
            setLoading(false);
        } catch (err) {
            setError((err as Error).message);
            setLoading(false);
            throw err;
        }
    }, []);

    const leave = useCallback(async (teamId: string) => {
        if (!user?.id) throw new Error('Not authenticated');
        setLoading(true);
        setError(null);
        try {
            await leaveTeam(teamId, user.id);
            setLoading(false);
        } catch (err) {
            setError((err as Error).message);
            setLoading(false);
            throw err;
        }
    }, [user?.id]);

    return {
        create,
        invite,
        remove,
        changeRole,
        leave,
        loading,
        error,
    };
}

/**
 * Hook to check if current user is team owner
 */
export function useIsTeamOwner(teamId?: string) {
    const { user } = useAuth();
    const [isOwner, setIsOwner] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!teamId || !user?.id) {
            setIsOwner(false);
            setLoading(false);
            return;
        }

        getTeamById(teamId)
            .then(team => {
                setIsOwner(team?.owner_id === user.id);
                setLoading(false);
            })
            .catch(() => {
                setIsOwner(false);
                setLoading(false);
            });
    }, [teamId, user?.id]);

    return { isOwner, loading };
}
