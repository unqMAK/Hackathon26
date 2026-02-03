import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

// Send invitation
export const useSendInvite = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ teamId, userId }: { teamId: string; userId: string }) => {
            const { data } = await api.post('/invites/send', { teamId, userId });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['team-invites'] });
            queryClient.invalidateQueries({ queryKey: ['spoc', 'invitations'] });
        }
    });
};

// Accept invitation
export const useAcceptInvite = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (inviteId: string) => {
            const { data } = await api.put(`/invites/${inviteId}/accept`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-invites'] });
            queryClient.invalidateQueries({ queryKey: ['myTeam'] });
            queryClient.invalidateQueries({ queryKey: ['teams'] });
        }
    });
};

// Decline invitation
export const useDeclineInvite = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (inviteId: string) => {
            const { data } = await api.put(`/invites/${inviteId}/decline`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-invites'] });
        }
    });
};

// Get my invitations
export const useMyInvites = () => {
    return useQuery({
        queryKey: ['my-invites'],
        queryFn: async () => {
            const { data } = await api.get('/invites/my-invites');
            return data;
        }
    });
};

// Get team invitations
export const useTeamInvites = (teamId: string | undefined) => {
    return useQuery({
        queryKey: ['team-invites', teamId],
        queryFn: async () => {
            if (!teamId) return [];
            const { data } = await api.get(`/invites/team/${teamId}`);
            return data;
        },
        enabled: !!teamId
    });
};
