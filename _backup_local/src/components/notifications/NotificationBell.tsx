import { Bell, Megaphone, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useUnreadCount, useNotifications } from '@/hooks/useNotifications';
import NotificationItem from './NotificationItem';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { announcementService } from '@/services/announcementService';
import type { Announcement } from '@/types/announcement';
import type { Notification as TeamNotification } from '@/types/team';
import { formatDistanceToNow } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const NotificationBell = () => {
    const queryClient = useQueryClient();
    const { data: unreadData } = useUnreadCount();
    const { data: notifications, isLoading: notifLoading } = useNotifications();

    // Announcements with error handling
    const { data: announcements = [], isLoading: annLoading } = useQuery({
        queryKey: ['announcements'],
        queryFn: async () => {
            try {
                const data = await announcementService.getAnnouncements();
                return data ?? [];
            } catch (error) {
                console.error('Failed to fetch announcements:', error);
                return [];
            }
        },
        refetchInterval: 30000,
        retry: false
    });

    const { data: unreadCountData } = useQuery({
        queryKey: ['announcementUnreadCount'],
        queryFn: async () => {
            try {
                const data = await announcementService.getUnreadCount();
                return data ?? { unreadCount: 0 };
            } catch (error) {
                console.error('Failed to fetch unread count:', error);
                return { unreadCount: 0 };
            }
        },
        refetchInterval: 30000,
        retry: false
    });

    const markReadMutation = useMutation({
        mutationFn: announcementService.markAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['announcements'] });
            queryClient.invalidateQueries({ queryKey: ['announcementUnreadCount'] });
        }
    });

    const notifUnread = unreadData?.count || 0;
    const annUnread = unreadCountData?.unreadCount || 0;
    const totalUnread = notifUnread + annUnread;
    const hasUnread = totalUnread > 0;

    // Show latest announcements (up to 5)
    const latestAnnouncements = announcements.slice(0, 5);

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'urgent':
                return <AlertTriangle className="h-4 w-4 text-red-500" />;
            case 'warning':
                return <AlertCircle className="h-4 w-4 text-amber-500" />;
            case 'info':
                return <Info className="h-4 w-4 text-blue-500" />;
            default:
                return <Megaphone className="h-4 w-4 text-gray-500" />;
        }
    };

    const getTypeBgColor = (type: string, isRead?: boolean) => {
        if (isRead) return 'bg-gray-50/50';
        switch (type) {
            case 'urgent':
                return 'bg-red-50 border-l-4 border-l-red-500';
            case 'warning':
                return 'bg-amber-50 border-l-4 border-l-amber-500';
            case 'info':
                return 'bg-blue-50 border-l-4 border-l-blue-500';
            default:
                return 'bg-gray-50';
        }
    };

    const handleAnnouncementClick = (announcement: Announcement) => {
        if (!announcement.isRead) {
            markReadMutation.mutate(announcement._id);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {hasUnread && (
                        <Badge
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs"
                            variant="destructive"
                        >
                            {totalUnread > 9 ? '9+' : totalUnread}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-96">
                <Tabs defaultValue="announcements" className="w-full">
                    <div className="p-3 border-b">
                        <TabsList className="w-full grid grid-cols-2">
                            <TabsTrigger value="announcements" className="text-xs">
                                Announcements {annUnread > 0 && `(${annUnread})`}
                            </TabsTrigger>
                            <TabsTrigger value="notifications" className="text-xs">
                                Notifications {notifUnread > 0 && `(${notifUnread})`}
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="announcements" className="m-0">
                        <ScrollArea className="h-[350px]">
                            {annLoading ? (
                                <div className="p-4 text-center text-sm text-muted-foreground">
                                    Loading announcements...
                                </div>
                            ) : latestAnnouncements.length > 0 ? (
                                <div className="divide-y">
                                    {latestAnnouncements.map((announcement: Announcement) => (
                                        <div
                                            key={announcement._id}
                                            className={`p-3 cursor-pointer hover:bg-muted/50 transition-colors ${getTypeBgColor(announcement.type, announcement.isRead)}`}
                                            onClick={() => handleAnnouncementClick(announcement)}
                                        >
                                            <div className="flex items-start gap-3">
                                                {getTypeIcon(announcement.type)}
                                                <div className="flex-1 min-w-0">
                                                    <p className={`font-medium text-sm truncate ${announcement.isRead ? 'text-muted-foreground' : ''}`}>
                                                        {announcement.title}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                                                        {announcement.message}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {formatDistanceToNow(new Date(announcement.createdAt), { addSuffix: true })}
                                                    </p>
                                                </div>
                                                {!announcement.isRead && (
                                                    <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center text-sm text-muted-foreground">
                                    No announcements yet
                                </div>
                            )}
                        </ScrollArea>
                    </TabsContent>

                    <TabsContent value="notifications" className="m-0">
                        <ScrollArea className="h-[350px]">
                            {notifLoading ? (
                                <div className="p-4 text-center text-sm text-muted-foreground">
                                    Loading notifications...
                                </div>
                            ) : notifications && notifications.length > 0 ? (
                                <div className="divide-y">
                                    {notifications.map((notification: any) => (
                                        <NotificationItem key={notification._id} notification={notification as TeamNotification} />
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center text-sm text-muted-foreground">
                                    No notifications yet
                                </div>
                            )}
                        </ScrollArea>
                    </TabsContent>
                </Tabs>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default NotificationBell;

