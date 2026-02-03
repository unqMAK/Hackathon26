import { api } from './api';
import type { MentorFeedback, SubmitFeedbackInput } from '@/types/mentor';

// Mentor: Submit feedback
export const submitFeedback = async (input: SubmitFeedbackInput): Promise<MentorFeedback> => {
    const { data } = await api.post('/feedback', input);
    return data;
};

// Get feedback for a team
export const getTeamFeedback = async (teamId: string): Promise<MentorFeedback[]> => {
    const { data } = await api.get(`/feedback/team/${teamId}`);
    return data;
};

// Mentor: Get my feedback history
export const getMyFeedback = async (): Promise<MentorFeedback[]> => {
    const { data } = await api.get('/feedback/my');
    return data;
};

// Mentor: Update feedback
export const updateFeedback = async (
    id: string,
    input: Partial<SubmitFeedbackInput>
): Promise<MentorFeedback> => {
    const { data } = await api.put(`/feedback/${id}`, input);
    return data;
};

// Delete feedback
export const deleteFeedback = async (id: string): Promise<void> => {
    await api.delete(`/feedback/${id}`);
};

// Add reply to feedback
export const addReply = async (feedbackId: string, message: string): Promise<MentorFeedback> => {
    const { data } = await api.post(`/feedback/${feedbackId}/reply`, { message });
    return data;
};

export const feedbackService = {
    submitFeedback,
    getTeamFeedback,
    getMyFeedback,
    updateFeedback,
    deleteFeedback,
    addReply
};
