import api from '@/lib/api';
import type {
    Submission,
    SubmissionDeadline,
    NewSubmissionPayload,
    UpdateSubmissionPayload,
    SubmissionListParams,
    SubmissionListResponse,
    ScoreSubmissionPayload,
    UpdateDeadlinePayload
} from '@/types/submission';

const BASE_URL = '/submissions';

export const submissionService = {
    // Create a new submission
    createSubmission: async (payload: NewSubmissionPayload): Promise<Submission> => {
        const response = await api.post<Submission>(BASE_URL, payload);
        return response.data;
    },

    // Update an existing submission (creates new version)
    updateSubmission: async (id: string, payload: UpdateSubmissionPayload): Promise<Submission> => {
        const response = await api.put<Submission>(`${BASE_URL}/${id}`, payload);
        return response.data;
    },

    // Get all submissions for a team
    getTeamSubmissions: async (teamId: string): Promise<Submission[]> => {
        const response = await api.get<Submission[]>(`${BASE_URL}/team/${teamId}`);
        return response.data;
    },

    // Get a single submission by ID
    getSubmission: async (id: string): Promise<Submission> => {
        const response = await api.get<Submission>(`${BASE_URL}/${id}`);
        return response.data;
    },

    // Get all submissions (admin/judge) with filters
    listSubmissions: async (params?: SubmissionListParams): Promise<SubmissionListResponse> => {
        const response = await api.get<SubmissionListResponse>(BASE_URL, { params });
        return response.data;
    },

    // Lock a submission (admin only)
    lockSubmission: async (id: string, isFinal?: boolean): Promise<Submission> => {
        const response = await api.put<Submission>(`${BASE_URL}/${id}/lock`, { isFinal });
        return response.data;
    },

    // Score/feedback a submission (judge/admin)
    scoreSubmission: async (id: string, payload: ScoreSubmissionPayload): Promise<Submission> => {
        const response = await api.put<Submission>(`${BASE_URL}/${id}/score`, payload);
        return response.data;
    },

    // Delete a submission (admin only)
    deleteSubmission: async (id: string): Promise<void> => {
        await api.delete(`${BASE_URL}/${id}`);
    },

    // Get submission deadline
    getDeadline: async (): Promise<SubmissionDeadline> => {
        const response = await api.get<SubmissionDeadline>(`${BASE_URL}/deadline`);
        return response.data;
    },

    // Update submission deadline (admin only)
    updateDeadline: async (payload: UpdateDeadlinePayload): Promise<SubmissionDeadline> => {
        const response = await api.put<SubmissionDeadline>(`${BASE_URL}/deadline`, payload);
        return response.data;
    }
};

export default submissionService;
