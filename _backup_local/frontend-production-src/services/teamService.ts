import api from '../lib/api';
import { Team, TeamInvite, User } from '../types/team';

// Team APIs
export const teamApi = {
    getMyTeam: async (): Promise<Team> => {
        const response = await api.get('/teams/my-team');
        return response.data;
    },

    getAvailableTeams: async (): Promise<Team[]> => {
        const response = await api.get('/teams/available');
        return response.data;
    },

    createTeam: async (name: string, instituteId: string): Promise<Team> => {
        const response = await api.post('/teams', { name, instituteId });
        return response.data;
    },

    removeMember: async (teamId: string, userId: string): Promise<void> => {
        await api.delete(`/teams/${teamId}/members/${userId}`);
    },

    requestApproval: async (teamId: string): Promise<Team> => {
        const response = await api.put(`/teams/${teamId}/request-approval`);
        return response.data;
    },
};

// Team Invite APIs
// Objects removed

// User APIs
export const userApi = {
    searchAvailableStudents: async (query: string): Promise<User[]> => {
        const response = await api.get('/users/search-available', {
            params: { q: query },
        });
        return response.data;
    },
};
