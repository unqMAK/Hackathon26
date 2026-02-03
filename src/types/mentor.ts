export interface Mentor {
    _id: string;
    name: string;
    email: string;
    role: 'mentor';
    expertise: string[];
    assignedTeams: string[] | MentorTeam[];
    createdAt: string;
    updatedAt: string;
}

export interface MentorTeam {
    _id: string;
    name: string;
    status: string;
}

export interface MentorFeedback {
    _id: string;
    teamId: string | FeedbackTeam;
    mentorId: string | FeedbackMentor;
    phase: 'ideation' | 'prototype' | 'development' | 'final';
    status: 'pending' | 'approved' | 'changes-required';
    feedback: string;
    attachments?: string[];
    replies?: {
        userId: string | { _id: string; name: string; email: string };
        message: string;
        createdAt: string;
    }[];
    createdAt: string;
    updatedAt: string;
}

export interface FeedbackTeam {
    _id: string;
    name: string;
    problemId?: any;
}

export interface FeedbackMentor {
    _id: string;
    name: string;
    email: string;
}

export interface TeamPhases {
    ideation: 'pending' | 'approved' | 'changes-required';
    prototype: 'pending' | 'approved' | 'changes-required';
    development: 'pending' | 'approved' | 'changes-required';
    final: 'pending' | 'approved' | 'changes-required';
}

export interface MentorAssignedTeam {
    _id: string;
    name: string;
    status: string;
    progress: number;
    phases?: TeamPhases;
    problemId?: {
        _id: string;
        title: string;
        category: string;
    };
    leaderId?: {
        _id: string;
        name: string;
        email: string;
    };
    members: {
        _id: string;
        name: string;
        email: string;
    }[];
    feedbackCount?: number;
    latestFeedback?: {
        phase: string;
        status: string;
        date: string;
    } | null;
}

export interface MentorStats {
    assignedTeams: number;
    totalFeedback: number;
    approvedPhases: number;
    pendingReviews: number;
}

export interface CreateMentorInput {
    name: string;
    email: string;
    password: string;
    expertise: string[];
}

export interface UpdateMentorInput {
    name?: string;
    email?: string;
    expertise?: string[];
    password?: string;
}

export interface AssignMentorInput {
    mentorId: string;
    teamId: string;
}

export interface SubmitFeedbackInput {
    teamId: string;
    phase: 'ideation' | 'prototype' | 'development' | 'final';
    status: 'pending' | 'approved' | 'changes-required';
    feedback: string;
    attachments?: string[];
}
