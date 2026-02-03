import { useState } from 'react';
import { Bell, CheckCircle, MessageSquare, AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface Notification {
    id: string;
    type: 'success' | 'info' | 'warning';
    title: string;
    message: string;
    time: string;
    read: boolean;
}

const StudentNotifications = () => {
    const [notifications, setNotifications] = useState<Notification[]>([
        {
            id: '1',
            type: 'success',
            title: 'Team Registration Approved',
            message: 'Your team has been approved and is now registered.',
            time: '2 hours ago',
            read: false,
        },
        {
            id: '2',
            type: 'info',
            title: 'New Mentor Feedback',
            message: 'Your mentor has reviewed your proposal.',
            time: '5 hours ago',
            read: false,
        },
        {
            id: '3',
            type: 'warning',
            title: 'Submission Deadline',
            message: 'Only 3 days left to submit your project.',
            time: '1 day ago',
            read: true,
        },
    ]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAsRead = (id: string) => {
        setNotifications(notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
        ));
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    const removeNotification = (id: string) => {
        setNotifications(notifications.filter(n => n.id !== id));
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'success':
                return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'info':
                return <MessageSquare className="h-4 w-4 text-blue-600" />;
            case 'warning':
                return <AlertCircle className="h-4 w-4 text-orange-600" />;
            default:
                return <Bell className="h-4 w-4" />;
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 h-2 w-2 bg-destructive rounded-full"></span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-semibold">Notifications</h3>
                    {unreadCount > 0 && (
                        <Badge variant="secondary">{unreadCount} new</Badge>
                    )}
                </div>
                {notifications.length > 0 ? (
                    <>
                        <ScrollArea className="h-[300px]">
                            <div className="p-2 space-y-2">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-3 rounded-lg border transition-colors ${notification.read ? 'bg-background' : 'bg-muted/50'
                                            }`}
                                        onClick={() => markAsRead(notification.id)}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-start gap-2 flex-1">
                                                <div className="mt-1">{getIcon(notification.type)}</div>
                                                <div className="flex-1 space-y-1">
                                                    <p className="text-sm font-medium">{notification.title}</p>
                                                    <p className="text-xs text-muted-foreground">{notification.message}</p>
                                                    <p className="text-xs text-muted-foreground">{notification.time}</p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 w-6 p-0"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeNotification(notification.id);
                                                }}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                        <div className="p-2 border-t">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full"
                                onClick={markAllAsRead}
                            >
                                Mark all as read
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="p-8 text-center text-muted-foreground">
                        <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No notifications</p>
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default StudentNotifications;
