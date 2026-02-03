// User interface
export interface User {
    _id: string;
    name: string;
    email: string;
    role: 'admin' | 'spoc' | 'student' | 'judge' | 'mentor';
    instituteId?: string;
    teamId?: string;
}

// Team interface
export interface Team {
    _id: string;
    name: string;
    leaderId: string | User;
    members: User[];
    problemId?: any;
    status: 'pending' | 'approved' | 'rejected';
    instituteId: string;
    instituteCode: string;
    instituteName: string;
    mentorName: string;
    mentorEmail: string;
    spocName: string;
    spocEmail: string;
    mentorId?: string | User;
    spocId?: string | User;
    consentFile: string;
    pendingMembers: { name: string; email: string }[];
    rejectionReason?: string;
    progress: number;
    requestSent?: boolean;
    requestedAt?: string;
    spocNotes?: string;
    createdAt: string;
    updatedAt: string;
}

// Notification interface
export interface Notification {
    _id: string;
    userId: string;
    type: 'member_removed' | 'info' | 'success' | 'warning' | 'error'; // Simplified types
    title: string;
    message: string;
    relatedId?: string;
    read: boolean;
    createdAt: string;
    updatedAt: string;
}

// API Response types
export interface ApiResponse<T> {
    data?: T;
    message?: string;
    error?: string;
}
