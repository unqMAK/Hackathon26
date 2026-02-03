import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '../services/notificationService';
import { toast } from 'sonner';

export const useNotifications = () => {
    return useQuery({
        queryKey: ['notifications'],
        queryFn: async () => {
            try {
                const data = await notificationApi.getNotifications();
                return data ?? [];
            } catch (error) {
                console.error('Failed to fetch notifications:', error);
                return [];
            }
        },
        refetchInterval: 30000,
        retry: false,
    });
};

export const useUnreadCount = () => {
    return useQuery({
        queryKey: ['unreadCount'],
        queryFn: async () => {
            try {
                const data = await notificationApi.getUnreadCount();
                return data ?? { count: 0 };
            } catch (error) {
                console.error('Failed to fetch unread count:', error);
                return { count: 0 };
            }
        },
        refetchInterval: 30000,
        retry: false,
    });
};

export const useMarkAsRead = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (notificationId: string) => notificationApi.markAsRead(notificationId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to mark as read');
        },
    });
};

export const useMarkAllAsRead = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: notificationApi.markAllAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
            toast.success('All notifications marked as read');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to mark all as read');
        },
    });
};

export const useDeleteNotification = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (notificationId: string) => notificationApi.deleteNotification(notificationId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
            toast.success('Notification deleted');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to delete notification');
        },
    });
};
