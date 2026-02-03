import { api } from './api';
import type {
    Mentor,
    MentorAssignedTeam,
    MentorStats,
    CreateMentorInput,
    UpdateMentorInput,
    AssignMentorInput
} from '@/types/mentor';

// Admin: Get all mentors
export const getMentors = async (): Promise<Mentor[]> => {
    const { data } = await api.get('/mentors');
    return data;
};

// Admin: Create mentor
export const createMentor = async (input: CreateMentorInput): Promise<Mentor> => {
    const { data } = await api.post('/mentors', input);
    return data;
};

// Admin: Update mentor
export const updateMentor = async (id: string, input: UpdateMentorInput): Promise<Mentor> => {
    const { data } = await api.put(`/mentors/${id}`, input);
    return data;
};

// Admin: Delete mentor
export const deleteMentor = async (id: string): Promise<void> => {
    await api.delete(`/mentors/${id}`);
};

// Admin: Assign mentor to team
export const assignMentor = async (input: AssignMentorInput): Promise<any> => {
    const { data } = await api.put('/mentors/assign', input);
    return data;
};

// Admin: Unassign mentor from team
export const unassignMentor = async (teamId: string): Promise<any> => {
    const { data } = await api.put('/mentors/unassign', { teamId });
    return data;
};

// Mentor: Get assigned teams
export const getMyTeams = async (): Promise<MentorAssignedTeam[]> => {
    const { data } = await api.get('/mentors/my-teams');
    return data;
};

// Mentor: Get team details
export const getTeamDetails = async (teamId: string): Promise<any> => {
    const { data } = await api.get(`/mentors/team/${teamId}`);
    return data;
};

// Mentor: Get stats
export const getMentorStats = async (): Promise<MentorStats> => {
    const { data } = await api.get('/mentors/stats');
    return data;
};

export const mentorService = {
    getMentors,
    createMentor,
    updateMentor,
    deleteMentor,
    assignMentor,
    unassignMentor,
    getMyTeams,
    getTeamDetails,
    getMentorStats
};
