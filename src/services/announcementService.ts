import { api } from './api';
import type { Announcement, AnnouncementInput, UnreadCountResponse } from '@/types/announcement';

// Get announcements for current user (filtered by audience)
export const getAnnouncements = async (): Promise<Announcement[]> => {
    const { data } = await api.get('/announcements');
    return data;
};

// Get announcements for admin/spoc management
export const getAdminAnnouncements = async (): Promise<Announcement[]> => {
    const { data } = await api.get('/announcements/admin');
    return data;
};

// Get unread count
export const getUnreadCount = async (): Promise<UnreadCountResponse> => {
    const { data } = await api.get('/announcements/unread-count');
    return data;
};

// Mark single announcement as read
export const markAsRead = async (id: string): Promise<void> => {
    await api.put(`/announcements/${id}/read`);
};

// Mark all announcements as read
export const markAllAsRead = async (): Promise<void> => {
    await api.put('/announcements/read-all');
};

// Create announcement (admin/spoc)
export const createAnnouncement = async (data: AnnouncementInput): Promise<Announcement> => {
    const response = await api.post('/announcements', data);
    return response.data;
};

// Update announcement (admin/spoc)
export const updateAnnouncement = async (id: string, data: Partial<AnnouncementInput>): Promise<Announcement> => {
    const response = await api.put(`/announcements/${id}`, data);
    return response.data;
};

// Delete announcement (admin/spoc)
export const deleteAnnouncement = async (id: string): Promise<void> => {
    await api.delete(`/announcements/${id}`);
};

// Export as object
export const announcementService = {
    getAnnouncements,
    getAdminAnnouncements,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement
};
