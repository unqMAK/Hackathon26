import { api } from './api';
import type {
    Rubric,
    RubricInput,
    Evaluation,
    EvaluationInput,
    LeaderboardEntry,
    JudgeWithAssignments,
    AssignTeamsPayload,
    AssignedTeam,
    WeightValidation
} from '@/types/evaluation';

// ============ Rubric API ============

export const getRubrics = async (all = false): Promise<Rubric[]> => {
    const { data } = await api.get(`/rubrics${all ? '?all=true' : ''}`);
    return data;
};

export const createRubric = async (rubric: RubricInput): Promise<Rubric> => {
    const { data } = await api.post('/rubrics', rubric);
    return data;
};

export const updateRubric = async (id: string, rubric: Partial<RubricInput & { isActive: boolean }>): Promise<Rubric> => {
    const { data } = await api.put(`/rubrics/${id}`, rubric);
    return data;
};

export const deleteRubric = async (id: string): Promise<void> => {
    await api.delete(`/rubrics/${id}`);
};

export const reorderRubrics = async (rubricIds: string[]): Promise<Rubric[]> => {
    const { data } = await api.put('/rubrics/reorder', { rubricIds });
    return data;
};

export const validateWeights = async (): Promise<WeightValidation> => {
    const { data } = await api.get('/rubrics/validate-weights');
    return data;
};

// ============ Evaluation API ============

export const submitEvaluation = async (evaluation: EvaluationInput): Promise<Evaluation> => {
    const { data } = await api.post('/evaluations', evaluation);
    return data;
};

export const getTeamEvaluations = async (teamId: string): Promise<Evaluation[]> => {
    const { data } = await api.get(`/evaluations/team/${teamId}`);
    return data;
};

export const getJudgeEvaluations = async (judgeId: string): Promise<Evaluation[]> => {
    const { data } = await api.get(`/evaluations/judge/${judgeId}`);
    return data;
};

export const getMyEvaluations = async (): Promise<Evaluation[]> => {
    const { data } = await api.get('/evaluations/my');
    return data;
};

export const getFinalResults = async (filters?: { instituteId?: string; problemId?: string }): Promise<LeaderboardEntry[]> => {
    const params = new URLSearchParams();
    if (filters?.instituteId) params.append('instituteId', filters.instituteId);
    if (filters?.problemId) params.append('problemId', filters.problemId);

    const { data } = await api.get(`/evaluations/final?${params.toString()}`);
    return data;
};

// ============ Judge Assignment API ============

export const getAssignedTeams = async (): Promise<AssignedTeam[]> => {
    const { data } = await api.get('/evaluations/assigned-teams');
    return data;
};

export const getJudgesWithAssignments = async (): Promise<JudgeWithAssignments[]> => {
    const { data } = await api.get('/evaluations/judges');
    return data;
};

export const assignTeamsToJudge = async (payload: AssignTeamsPayload): Promise<any> => {
    const { data } = await api.put('/evaluations/assign', payload);
    return data;
};

// ============ Results Settings API ============

export interface ResultsPublishStatus {
    published: boolean;
    publishedAt: string | null;
    message: string;
}

export interface PublicLeaderboardResponse {
    visible: boolean;
    message: string;
    leaderboard: {
        teamId: string;
        teamName: string;
        problem?: any;
        avgScore: number;
        evaluationCount: number;
        rank: number;
    }[];
}

export interface MyTeamResultResponse {
    visible: boolean;
    message: string;
    result: {
        teamId: string;
        teamName: string;
        problem?: any;
        avgScore: number;
        evaluationCount: number;
        rank: number | string;
        totalTeams: number;
    } | null;
}

export const getResultsPublishStatus = async (): Promise<ResultsPublishStatus> => {
    const { data } = await api.get('/settings/results');
    return data;
};

export const updateResultsPublishStatus = async (published: boolean, message?: string): Promise<ResultsPublishStatus> => {
    const { data } = await api.put('/settings/results', { published, message });
    return data;
};

export const getPublicLeaderboard = async (): Promise<PublicLeaderboardResponse> => {
    const { data } = await api.get('/evaluations/public-leaderboard');
    return data;
};

export const getMyTeamResult = async (): Promise<MyTeamResultResponse> => {
    const { data } = await api.get('/evaluations/my-result');
    return data;
};

// Export as object for React Query
export const evaluationService = {
    getRubrics,
    createRubric,
    updateRubric,
    deleteRubric,
    reorderRubrics,
    validateWeights,
    submitEvaluation,
    getTeamEvaluations,
    getJudgeEvaluations,
    getMyEvaluations,
    getFinalResults,
    getAssignedTeams,
    getJudgesWithAssignments,
    assignTeamsToJudge,
    getResultsPublishStatus,
    updateResultsPublishStatus,
    getPublicLeaderboard,
    getMyTeamResult
};

