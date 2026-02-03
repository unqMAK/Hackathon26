import { api } from './api';
import { Notification, NotificationStats } from '../types/notification';

export const notificationService = {
    // Get user's notifications
    getNotifications: async (page = 1, limit = 20) => {
        const response = await api.get<{ notifications: Notification[], pagination: any }>(`/notifications?page=${page}&limit=${limit}`);
        return response.data;
    },

    // Get unread count
    getUnreadCount: async () => {
        const response = await api.get<NotificationStats>('/notifications/unread-count');
        return response.data;
    },

    // Mark single notification as read
    markAsRead: async (id: string) => {
        const response = await api.put<Notification>(`/notifications/${id}/read`);
        return response.data;
    },

    // Mark all as read
    markAllAsRead: async () => {
        const response = await api.put<{ message: string }>('/notifications/read-all');
        return response.data;
    },

    // Create notification (Admin/SPOC only)
    createNotification: async (data: Partial<Notification>) => {
        const response = await api.post<Notification>('/notifications', data);
        return response.data;
    },

    // Delete notification (Admin/SPOC only)
    deleteNotification: async (id: string) => {
        const response = await api.delete<{ message: string }>(`/notifications/${id}`);
        return response.data;
    }
};

// Export as notificationApi for compatibility with existing hooks
export const notificationApi = {
    getNotifications: async () => {
        const response = await api.get<{ notifications: Notification[], pagination: any }>('/notifications?page=1&limit=50');
        return response.data.notifications;
    },
    getUnreadCount: async () => {
        const response = await api.get<{ unreadCount: number }>('/notifications/unread-count');
        return { count: response.data.unreadCount };
    },
    markAsRead: async (id: string) => {
        const response = await api.put<Notification>(`/notifications/${id}/read`);
        return response.data;
    },
    markAllAsRead: async () => {
        const response = await api.put<{ message: string }>('/notifications/read-all');
        return response.data;
    },
    deleteNotification: async (id: string) => {
        const response = await api.delete<{ message: string }>(`/notifications/${id}`);
        return response.data;
    }
};
