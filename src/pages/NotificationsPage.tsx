import React, { useState, useEffect } from 'react';
import { notificationService } from '@/services/notificationService';
import { Notification } from '@/types/notification';
import NotificationCard from '@/components/NotificationCard';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCheck } from 'lucide-react';
import { toast } from 'sonner';
import DashboardLayout from '@/components/DashboardLayout';
import { getCurrentUser } from '@/lib/mockAuth';

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const user = getCurrentUser();

    const fetchNotifications = async (pageNum: number, append = false) => {
        try {
            setLoading(true);
            const data = await notificationService.getNotifications(pageNum, 20);

            if (append) {
                setNotifications(prev => [...prev, ...data.notifications]);
            } else {
                setNotifications(data.notifications);
            }

            setHasMore(data.pagination.page < data.pagination.pages);
        } catch (error) {
            toast.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications(1);
    }, []);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchNotifications(nextPage, true);
    };

    const handleMarkAsRead = async (id: string) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev => prev.map(n =>
                n._id === id ? { ...n, isRead: true } : n
            ));
        } catch (error) {
            toast.error('Failed to mark as read');
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            toast.success('All notifications marked as read');
        } catch (error) {
            toast.error('Failed to mark all as read');
        }
    };

    return (
        <DashboardLayout role={user?.role || 'student'}>
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
                        <p className="text-muted-foreground">
                            Stay updated with the latest announcements and alerts.
                        </p>
                    </div>
                    <Button onClick={handleMarkAllRead} variant="outline">
                        <CheckCheck className="mr-2 h-4 w-4" />
                        Mark all read
                    </Button>
                </div>

                <div className="space-y-4">
                    {notifications.length === 0 && !loading ? (
                        <div className="text-center py-12 text-muted-foreground">
                            No notifications found
                        </div>
                    ) : (
                        notifications.map(notification => (
                            <NotificationCard
                                key={notification._id}
                                notification={notification}
                                onMarkAsRead={handleMarkAsRead}
                            />
                        ))
                    )}

                    {loading && (
                        <div className="flex justify-center py-4">
                            <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                    )}

                    {!loading && hasMore && (
                        <div className="flex justify-center pt-4">
                            <Button onClick={handleLoadMore} variant="secondary">
                                Load More
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default NotificationsPage;
