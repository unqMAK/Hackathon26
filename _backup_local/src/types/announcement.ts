export interface Announcement {
    _id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'urgent' | 'general';
    audience: 'all' | 'institute' | 'team';
    targetInstituteId?: string;
    targetTeamId?: string;
    targetTeamName?: string;
    createdBy: string | { _id: string; name: string; email: string };
    createdByName: string;
    createdAt: string;
    updatedAt: string;
    isRead?: boolean;
}

export interface AnnouncementInput {
    title: string;
    message: string;
    type: 'info' | 'warning' | 'urgent' | 'general';
    audience: 'all' | 'institute' | 'team';
    targetInstituteId?: string;
    targetTeamId?: string;
}

export interface AnnouncementReadStatus {
    announcementId: string;
    isRead: boolean;
    readAt?: string;
}

export interface UnreadCountResponse {
    unreadCount: number;
}
