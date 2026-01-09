// =====================================================
// PRISM V2 - Team Page
// Team management and collaboration
// =====================================================

import { useState } from 'react';
import { useCurrentTeam, useTeamActions } from '@/domains/teams';
import { useAuth } from '@/domains/auth';
import { Card, Button, Input } from '@/ui/components';
import { getInitials } from '@/shared/utils';
import type { TeamRole } from '@/shared/types';

export function TeamPage() {
    const { user } = useAuth();
    const { team, loading, refetch } = useCurrentTeam();
    const { create, invite, remove, loading: actionLoading, error } = useTeamActions();
    const [showInvite, setShowInvite] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState<TeamRole>('member');
    const [teamName, setTeamName] = useState('');

    const handleCreateTeam = async () => {
        if (!teamName.trim()) return;
        await create(teamName);
        setShowCreate(false);
        setTeamName('');
        refetch();
    };

    const handleInvite = async () => {
        if (!team || !inviteEmail.trim()) return;
        await invite(team.id, inviteEmail, inviteRole);
        setShowInvite(false);
        setInviteEmail('');
        refetch();
    };

    const handleRemove = async (memberId: string) => {
        if (!team) return;
        await remove(team.id, memberId);
        refetch();
    };

    if (loading) {
        return (
            <div className="pb-20 px-4 pt-6 flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(248,80%,36%)]" />
            </div>
        );
    }

    // No team yet
    if (!team) {
        return (
            <div className="pb-20 px-4 pt-6 space-y-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Team</h1>

                <Card className="text-center py-12">
                    <span className="text-4xl mb-4 block">👥</span>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        No Team Yet
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        Create a team to collaborate with your accountant or colleagues
                    </p>

                    {showCreate ? (
                        <div className="max-w-sm mx-auto space-y-4">
                            <Input
                                placeholder="Team name"
                                value={teamName}
                                onChange={(e) => setTeamName(e.target.value)}
                            />
                            <div className="flex gap-2">
                                <Button variant="ghost" onClick={() => setShowCreate(false)}>
                                    Cancel
                                </Button>
                                <Button loading={actionLoading} onClick={handleCreateTeam}>
                                    Create Team
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <Button onClick={() => setShowCreate(true)}>
                            Create Team
                        </Button>
                    )}
                </Card>
            </div>
        );
    }

    const members = team.team_members ?? [];

    return (
        <div className="pb-20 px-4 pt-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {team.name}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        {members.length} member{members.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <Button onClick={() => setShowInvite(true)}>
                    + Invite
                </Button>
            </div>

            {/* Error */}
            {error && (
                <div className="p-4 rounded-xl bg-[hsl(346,96%,63%)]/10 border border-[hsl(346,96%,63%)]/20">
                    <p className="text-sm text-[hsl(346,96%,63%)]">{error}</p>
                </div>
            )}

            {/* Invite Modal */}
            {showInvite && (
                <Card>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                        Invite Team Member
                    </h3>
                    <div className="space-y-4">
                        <Input
                            label="Email"
                            type="email"
                            placeholder="colleague@example.com"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                        />
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Role
                            </label>
                            <div className="flex gap-2">
                                {(['member', 'admin', 'accountant'] as TeamRole[]).map((role) => (
                                    <button
                                        key={role}
                                        onClick={() => setInviteRole(role)}
                                        className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium ${inviteRole === role
                                                ? 'bg-[hsl(248,80%,36%)] text-white'
                                                : 'bg-gray-100 dark:bg-[hsl(240,24%,26%)] text-gray-600 dark:text-gray-400'
                                            }`}
                                    >
                                        {role.charAt(0).toUpperCase() + role.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="ghost" onClick={() => setShowInvite(false)}>
                                Cancel
                            </Button>
                            <Button loading={actionLoading} onClick={handleInvite}>
                                Send Invite
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            {/* Members List */}
            <Card>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Team Members
                </h3>
                <div className="space-y-3">
                    {members.map((member) => (
                        <div
                            key={member.id}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-[hsl(240,24%,26%)]"
                        >
                            <div className="w-10 h-10 rounded-full bg-[hsl(248,80%,36%)]/10 flex items-center justify-center text-sm font-medium text-[hsl(248,80%,36%)]">
                                {getInitials(member.email)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 dark:text-white truncate">
                                    {member.email}
                                </p>
                                <p className="text-sm text-gray-500 truncate">{member.email}</p>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${member.role === 'owner'
                                    ? 'bg-[hsl(248,80%,36%)]/10 text-[hsl(248,80%,36%)]'
                                    : member.status === 'pending'
                                        ? 'bg-[hsl(38,100%,58%)]/10 text-[hsl(38,100%,58%)]'
                                        : 'bg-gray-100 dark:bg-[hsl(240,24%,26%)] text-gray-600 dark:text-gray-400'
                                }`}>
                                {member.status === 'pending' ? 'Pending' : member.role}
                            </span>
                            {member.role !== 'owner' && member.user_id !== user?.id && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemove(member.id)}
                                >
                                    ✕
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}
