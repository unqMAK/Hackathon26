export interface Notification {
    _id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'team' | 'system';
    recipientType: 'all' | 'students' | 'spocs' | 'mentors' | 'judges' | 'admins' | 'custom';
    recipients?: string[];
    instituteId?: string;
    triggeredBy?: string;
    relatedTeamId?: string;
    relatedSubmissionId?: string;
    relatedAnnouncementId?: string;
    isReadBy: string[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    // Frontend specific
    isRead?: boolean;
}

export interface NotificationStats {
    unreadCount: number;
}
