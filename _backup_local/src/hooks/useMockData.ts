import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Team, Problem, Submission } from '@/lib/mockData'; // Keep interfaces

// --- TEAMS ---
export const useTeams = () => {
    return useQuery({
        queryKey: ['teams'],
        queryFn: async () => {
            const { data } = await api.get('/teams');
            return data;
        }
    });
};

export const usePendingTeams = () => {
    return useQuery({
        queryKey: ['pendingTeams'],
        queryFn: async () => {
            const { data } = await api.get('/admin/pending-teams');
            return data;
        }
    });
};

export const useCreateTeam = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (newTeam: any) => {
            const { data } = await api.post('/teams', newTeam);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teams'] });
            toast.success('Team created successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create team');
        }
    });
};

export const useUpdateTeam = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (updatedTeam: any) => {
            const { data } = await api.put(`/teams/${updatedTeam._id || updatedTeam.id}`, updatedTeam);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teams'] });
            toast.success('Team updated successfully');
        }
    });
};

// --- PROBLEMS ---
export const useProblems = () => {
    return useQuery({
        queryKey: ['problems'],
        queryFn: async () => {
            try {
                const { data } = await api.get('/problems');
                return data;
            } catch (error: any) {
                const errorData = error.response?.data;

                // Check if it's a MongoDB connection error
                if (errorData?.errorType === 'MONGODB_CONNECTION_ERROR') {
                    toast.error('Database connection failed. Please ensure MongoDB is running and try again.');
                } else if (error.response?.status === 503) {
                    toast.error('Service unavailable. The database might be down.');
                } else {
                    toast.error(errorData?.message || 'Failed to load problem statements');
                }

                throw error;
            }
        },
        retry: (failureCount, error: any) => {
            // Don't retry on MongoDB connection errors
            if (error.response?.data?.errorType === 'MONGODB_CONNECTION_ERROR') {
                return false;
            }
            return failureCount < 2;
        },
        retryDelay: 1000
    });
};

export const useCreateProblem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (problem: any) => {
            const { data } = await api.post('/problems', problem);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['problems'] });
            toast.success('Problem statement added');
        }
    });
};

// --- USERS ---
export const useUsers = () => {
    return useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const { data } = await api.get('/users');
            return data;
        }
    });
};

export const useDeleteUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (userId: string) => {
            await api.delete(`/users/${userId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('User deleted');
        }
    });
};

// --- SUBMISSIONS ---
export const useSubmissions = () => {
    return useQuery({
        queryKey: ['submissions'],
        queryFn: async () => {
            const { data } = await api.get('/submissions');
            return data;
        }
    });
};

export const useCreateSubmission = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (submission: any) => {
            const { data } = await api.post('/submissions', submission);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['submissions'] });
            toast.success('Submission uploaded successfully!');
        }
    });
};

export const useUpdateSubmission = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (updatedSubmission: any) => {
            const { data } = await api.put(`/submissions/${updatedSubmission._id || updatedSubmission.id}`, updatedSubmission);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['submissions'] });
            toast.success('Score updated successfully');
        }
    });
};

// --- PUBLIC ---
export const usePublicSpocs = () => {
    return useQuery({
        queryKey: ['publicSpocs'],
        queryFn: async () => {
            const { data } = await api.get('/public/spocs');
            return data;
        }
    });
};


