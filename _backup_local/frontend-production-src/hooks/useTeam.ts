import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teamApi, userApi } from '../services/teamService';
import { toast } from 'sonner';

import { getCurrentUser } from '../lib/mockAuth';

// Team Hooks
export const useMyTeam = () => {
    const user = getCurrentUser();
    return useQuery({
        queryKey: ['myTeam', user?.id],
        queryFn: teamApi.getMyTeam,
        retry: false,
        enabled: !!user,
    });
};

export const useRemoveMember = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ teamId, userId }: { teamId: string; userId: string }) =>
            teamApi.removeMember(teamId, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myTeam'] });
            toast.success('Member removed from team');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to remove member');
        },
    });
};

// Hooks removed

// User Search Hook
export const useSearchStudents = (query: string) => {
    return useQuery({
        queryKey: ['searchStudents', query],
        queryFn: () => userApi.searchAvailableStudents(query),
        enabled: query.length >= 2,
    });
};

// Hooks removed
export const useRequestTeamApproval = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: teamApi.requestApproval,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myTeam'] });
            toast.success('Approval request sent successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to send request');
        }
    });
};

// Available Teams Hook
export const useAvailableTeams = () => {
    return useQuery({
        queryKey: ['availableTeams'],
        queryFn: teamApi.getAvailableTeams,
    });
};

// Create Team Hook
export const useCreateTeam = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ name, instituteId }: { name: string; instituteId: string }) =>
            teamApi.createTeam(name, instituteId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myTeam'] });
            toast.success('Team created successfully! You are now the team leader.');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create team');
        },
    });
};

// Join Request Hooks
export const useSendJoinRequest = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (toTeamId: string) => teamJoinRequestApi.sendJoinRequest(toTeamId),
        onSuccess: () => {
            toast.success('Join request sent successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to send join request');
        },
    });
};
