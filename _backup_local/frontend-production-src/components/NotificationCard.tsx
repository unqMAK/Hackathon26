import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Notification } from '@/types/notification';
import { Bell, CheckCircle, Info, AlertTriangle, Users, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface NotificationCardProps {
    notification: Notification;
    onMarkAsRead: (id: string) => void;
    onDelete?: (id: string) => void; // Optional, for admin/spoc
    compact?: boolean; // For dropdown view
}

const NotificationCard: React.FC<NotificationCardProps> = ({
    notification,
    onMarkAsRead,
    onDelete,
    compact = false
}) => {
    const getIcon = () => {
        switch (notification.type) {
            case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
            case 'team': return <Users className="h-5 w-5 text-blue-500" />;
            case 'system': return <Bell className="h-5 w-5 text-purple-500" />;
            default: return <Info className="h-5 w-5 text-gray-500" />;
        }
    };

    const timeAgo = formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true });

    return (
        <Card className={`relative transition-colors ${!notification.isRead ? 'bg-muted/50 border-l-4 border-l-primary' : ''} ${compact ? 'border-none shadow-none' : 'mb-3'}`}>
            <CardContent className={`p-4 flex gap-4 ${compact ? 'p-3' : ''}`}>
                <div className="mt-1 flex-shrink-0">
                    {getIcon()}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <h4 className={`text-sm font-semibold ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {notification.title}
                        </h4>
                        {!compact && onDelete && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 -mt-1 -mr-2 text-muted-foreground hover:text-destructive"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(notification._id);
                                }}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                    <p className={`text-sm text-muted-foreground mt-1 ${compact ? 'line-clamp-2' : ''}`}>
                        {notification.message}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-muted-foreground">{timeAgo}</span>
                        {!notification.isRead && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-xs px-2"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onMarkAsRead(notification._id);
                                }}
                            >
                                Mark as read
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default NotificationCard;
