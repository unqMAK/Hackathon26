import { api } from './api';

export const adminService = {
    getPendingTeams: async (): Promise<any[]> => {
        const { data } = await api.get('/admin/pending-teams');
        return data;
    },

    approveTeam: async (teamId: string): Promise<any> => {
        const { data } = await api.put(`/admin/approve-team/${teamId}`);
        return data;
    },

    rejectTeam: async (teamId: string, reason: string): Promise<any> => {
        const { data } = await api.put(`/admin/reject-team/${teamId}`, { reason });
        return data;
    },

    // User management
    getUsers: async (): Promise<any[]> => {
        const { data } = await api.get('/users');
        return data;
    }
};
