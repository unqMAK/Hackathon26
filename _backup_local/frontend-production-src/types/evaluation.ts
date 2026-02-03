// Rubric types
export interface Rubric {
    _id: string;
    title: string;
    description?: string;
    maxScore: number;
    weight: number;
    order: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface RubricInput {
    title: string;
    description?: string;
    maxScore?: number;
    weight: number;
}

// Evaluation types
export interface EvaluationScore {
    rubricId: string;
    score: number;
}

export interface PopulatedEvaluationScore {
    rubricId: {
        _id: string;
        title: string;
        maxScore: number;
        weight?: number;
    };
    score: number;
}

export interface Evaluation {
    _id: string;
    teamId: string | {
        _id: string;
        name: string;
        problemId?: any;
    };
    judgeId: string | {
        _id: string;
        name: string;
        email: string;
    };
    scores: EvaluationScore[] | PopulatedEvaluationScore[];
    totalScore: number;
    feedback?: string;
    submittedAt: string;
    createdAt: string;
    updatedAt: string;
}

export interface EvaluationInput {
    teamId: string;
    scores: EvaluationScore[];
    feedback?: string;
}

// Leaderboard types
export interface LeaderboardEntry {
    teamId: string;
    teamName: string;
    problem?: {
        _id: string;
        title: string;
        category?: string;
    };
    leader?: {
        _id: string;
        name: string;
    };
    avgScore: number;
    evaluationCount: number;
    rank: number;
    evaluations: {
        judgeId: any;
        totalScore: number;
        submittedAt: string;
    }[];
}

// Judge assignment types
export interface JudgeWithAssignments {
    _id: string;
    name: string;
    email: string;
    assignedTeams: {
        _id: string;
        name: string;
    }[];
}

export interface AssignTeamsPayload {
    judgeId: string;
    teamIds: string[];
}

// Team with evaluation status
export interface AssignedTeam {
    _id: string;
    name: string;
    problemId?: {
        _id: string;
        title: string;
        category?: string;
    };
    leaderId?: {
        _id: string;
        name: string;
        email?: string;
    };
    isEvaluated: boolean;
}

// Weight validation
export interface WeightValidation {
    totalWeight: number;
    isValid: boolean;
    rubricCount: number;
}
