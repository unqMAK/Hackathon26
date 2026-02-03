import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { MessageSquare, CheckCircle, XCircle, UserPlus, FileText, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const RecentUpdates = () => {
    const { data: notifications = [] } = useQuery({
        queryKey: ['notifications'],
        queryFn: async () => {
            const { data } = await api.get('/notifications');
            return data;
        }
    });

    const getIcon = (type: string) => {
        switch (type) {
            case 'team_invite':
            case 'invite_accepted':
            case 'invite_rejected':
                return <UserPlus className="h-3 w-3" />;
            case 'join_request':
            case 'join_request_accepted':
            case 'join_request_rejected':
                return <UserPlus className="h-3 w-3" />;
            case 'team_approved':
            case 'team_rejected':
                return <CheckCircle className="h-3 w-3" />;
            case 'submission_scored':
                return <FileText className="h-3 w-3" />;
            case 'mentor_feedback':
                return <MessageSquare className="h-3 w-3" />;
            default:
                return <AlertCircle className="h-3 w-3" />;
        }
    };

    const getIconColor = (type: string) => {
        if (type.includes('accepted') || type.includes('approved')) return 'bg-green-100 text-green-600';
        if (type.includes('rejected')) return 'bg-red-100 text-red-600';
        if (type.includes('feedback') || type.includes('scored')) return 'bg-blue-100 text-blue-600';
        return 'bg-purple-100 text-purple-600';
    };

    const recentNotifications = notifications.slice(0, 5);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Updates</CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[200px]">
                    <div className="space-y-4">
                        {recentNotifications.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8">
                                No recent updates
                            </p>
                        ) : (
                            recentNotifications.map((notification: any) => (
                                <div key={notification._id} className="flex items-start space-x-3">
                                    <div className={`mt-1 p-1 rounded-full ${getIconColor(notification.type)}`}>
                                        {getIcon(notification.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{notification.title}</p>
                                        <p className="text-xs text-muted-foreground truncate">{notification.message}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                        </p>
                                    </div>
                                    {!notification.read && (
                                        <Badge variant="secondary" className="text-xs">New</Badge>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
};

export default RecentUpdates;
