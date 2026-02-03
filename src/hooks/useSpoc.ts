import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

// Get dashboard statistics
export const useSpocStats = () => {
    return useQuery({
        queryKey: ['spoc', 'stats'],
        queryFn: async () => {
            const { data } = await api.get('/spoc/stats');
            return data;
        }
    });
};

// Get pending teams
export const usePendingTeams = () => {
    return useQuery({
        queryKey: ['spoc', 'pending-teams'],
        queryFn: async () => {
            const { data } = await api.get('/spoc/teams/pending');
            return data;
        }
    });
};

// Get approved teams
export const useApprovedTeams = () => {
    return useQuery({
        queryKey: ['spoc', 'approved-teams'],
        queryFn: async () => {
            const { data } = await api.get('/spoc/teams/approved');
            return data;
        }
    });
};

// Get rejected teams
export const useRejectedTeams = () => {
    return useQuery({
        queryKey: ['spoc', 'rejected-teams'],
        queryFn: async () => {
            const { data } = await api.get('/spoc/teams/rejected');
            return data;
        }
    });
};

// Approve team
export const useApproveTeam = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ teamId, notes }: { teamId: string; notes?: string }) => {
            const { data } = await api.put(`/spoc/teams/${teamId}/approve`, { notes });
            return data;
        },
        onSuccess: () => {
            // Invalidate all team queries
            queryClient.invalidateQueries({ queryKey: ['spoc', 'pending-teams'] });
            queryClient.invalidateQueries({ queryKey: ['spoc', 'approved-teams'] });
            queryClient.invalidateQueries({ queryKey: ['spoc', 'stats'] });
        }
    });
};

// Reject team
export const useRejectTeam = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ teamId, notes }: { teamId: string; notes?: string }) => {
            const { data } = await api.put(`/spoc/teams/${teamId}/reject`, { notes });
            return data;
        },
        onSuccess: () => {
            // Invalidate all team queries
            queryClient.invalidateQueries({ queryKey: ['spoc', 'pending-teams'] });
            queryClient.invalidateQueries({ queryKey: ['spoc', 'rejected-teams'] });
            queryClient.invalidateQueries({ queryKey: ['spoc', 'stats'] });
        }
    });
};

// Get institute students
export const useInstituteStudents = () => {
    return useQuery({
        queryKey: ['spoc', 'students'],
        queryFn: async () => {
            const { data } = await api.get('/spoc/students');
            return data;
        }
    });
};

// Hook removed

// Get institute mentors
export const useInstituteMentors = () => {
    return useQuery({
        queryKey: ['spoc', 'mentors'],
        queryFn: async () => {
            const { data } = await api.get('/spoc/mentors');
            return data;
        }
    });
};

// Get institute judges
export const useInstituteJudges = () => {
    return useQuery({
        queryKey: ['spoc', 'judges'],
        queryFn: async () => {
            const { data } = await api.get('/spoc/judges');
            return data;
        }
    });
};
