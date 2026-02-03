import { formatDistanceToNow } from 'date-fns';
import { Users, UserCheck, UserX, UserMinus, X } from 'lucide-react';
import { Notification } from '@/types/team';
import { useMarkAsRead, useDeleteNotification } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface NotificationItemProps {
    notification: Notification;
}

const NotificationItem = ({ notification }: NotificationItemProps) => {
    const markAsRead = useMarkAsRead();
    const deleteNotification = useDeleteNotification();
    const navigate = useNavigate();

    const getIcon = () => {
        switch (notification.type) {
            case 'member_removed':
                return <UserMinus className="h-5 w-5 text-orange-500" />;
            default:
                return <Users className="h-5 w-5 text-gray-500" />;
        }
    };

    const handleClick = () => {
        if (!notification.read) {
            markAsRead.mutate(notification._id);
        }
        // Navigate to team management for team-related notifications
        if (notification.type === 'member_removed') {
            // Or other team related notifications if any remain
            navigate('/student/team');
        }
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        deleteNotification.mutate(notification._id);
    };

    return (
        <div
            className={cn(
                'p-4 hover:bg-accent cursor-pointer transition-colors relative group',
                !notification.read && 'bg-blue-50 dark:bg-blue-950/20'
            )}
            onClick={handleClick}
        >
            <div className="flex items-start gap-3">
                <div className="mt-1">{getIcon()}</div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-sm">{notification.title}</h4>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={handleDelete}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                    </p>

                    <p className="text-xs text-muted-foreground mt-2">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                </div>
                {!notification.read && (
                    <div className="h-2 w-2 bg-blue-500 rounded-full mt-2" />
                )}
            </div>
        </div>
    );
};

export default NotificationItem;
