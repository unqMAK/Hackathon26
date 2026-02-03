import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Megaphone,
    AlertTriangle,
    Info,
    AlertCircle,
    ChevronRight,
    Loader2
} from 'lucide-react';
import { announcementService } from '@/services/announcementService';
import type { Announcement } from '@/types/announcement';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

const DashboardAnnouncements = () => {
    const queryClient = useQueryClient();

    const { data: announcements = [], isLoading } = useQuery({
        queryKey: ['announcements'],
        queryFn: announcementService.getAnnouncements
    });

    const markReadMutation = useMutation({
        mutationFn: announcementService.markAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['announcements'] });
            queryClient.invalidateQueries({ queryKey: ['announcementUnreadCount'] });
        }
    });

    // Show latest 3 announcements
    const latestAnnouncements = announcements.slice(0, 3);

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

    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'urgent':
                return <Badge variant="destructive">Urgent</Badge>;
            case 'warning':
                return <Badge className="bg-amber-500">Warning</Badge>;
            case 'info':
                return <Badge className="bg-blue-500">Info</Badge>;
            default:
                return <Badge variant="secondary">General</Badge>;
        }
    };

    const handleClick = (announcement: Announcement) => {
        if (!announcement.isRead) {
            markReadMutation.mutate(announcement._id);
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                    <Megaphone className="h-5 w-5 text-primary" />
                    Announcements
                </CardTitle>
                <Link to="/student/announcements">
                    <Button variant="ghost" size="sm" className="text-primary">
                        View All <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                </Link>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                ) : latestAnnouncements.length > 0 ? (
                    <div className="space-y-3">
                        {latestAnnouncements.map((announcement: Announcement) => (
                            <div
                                key={announcement._id}
                                className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${!announcement.isRead ? 'bg-muted/30 border-primary/30' : ''
                                    }`}
                                onClick={() => handleClick(announcement)}
                            >
                                <div className="flex items-start gap-3">
                                    {getTypeIcon(announcement.type)}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium text-sm truncate">
                                                {announcement.title}
                                            </span>
                                            {getTypeBadge(announcement.type)}
                                            {!announcement.isRead && (
                                                <span className="w-2 h-2 rounded-full bg-blue-500" />
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                            {announcement.message}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {formatDistanceToNow(new Date(announcement.createdAt), { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        <Megaphone className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No announcements yet</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default DashboardAnnouncements;
