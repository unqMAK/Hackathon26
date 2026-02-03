// Submission types for the Project Submission Flow

export interface SubmissionFile {
    url: string;
    filename?: string;
    size?: number;
    provider?: 's3' | 'local' | 'url';
}

export interface SubmissionUser {
    _id: string;
    name: string;
    email: string;
}

export interface SubmissionTeam {
    _id: string;
    name: string;
    instituteId?: string;
    problemId?: string;
}

export interface Submission {
    _id: string;
    teamId: string | SubmissionTeam;
    submittedBy: string | SubmissionUser;
    files: SubmissionFile[];
    repoUrl?: string;
    notes?: string;
    version: number;
    status: 'submitted' | 'updated' | 'locked';
    isFinal: boolean;
    feedback?: string;
    score?: number;
    createdAt: string;
    updatedAt: string;
}

export interface SubmissionDeadline {
    deadline: string;
    isActive: boolean;
    title?: string;
}

export interface NewSubmissionPayload {
    teamId: string;
    files: { url: string; filename?: string }[];
    repoUrl?: string;
    notes?: string;
}

export interface UpdateSubmissionPayload {
    files?: { url: string; filename?: string }[];
    repoUrl?: string;
    notes?: string;
}

export interface SubmissionListParams {
    team?: string;
    status?: string;
    isFinal?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface SubmissionListResponse {
    submissions: Submission[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

export interface ScoreSubmissionPayload {
    score?: number;
    feedback?: string;
}

export interface UpdateDeadlinePayload {
    deadline: string;
    isActive?: boolean;
    title?: string;
}
