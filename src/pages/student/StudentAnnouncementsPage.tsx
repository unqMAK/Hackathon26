import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Megaphone,
    AlertTriangle,
    Info,
    AlertCircle,
    Search,
    CheckCheck,
    Loader2,
    Filter
} from 'lucide-react';
import { announcementService } from '@/services/announcementService';
import type { Announcement } from '@/types/announcement';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

const StudentAnnouncementsPage = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

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

    const markAllReadMutation = useMutation({
        mutationFn: announcementService.markAllAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['announcements'] });
            queryClient.invalidateQueries({ queryKey: ['announcementUnreadCount'] });
            toast.success('All announcements marked as read');
        }
    });

    // Filter announcements
    const filteredAnnouncements = announcements.filter((a: Announcement) => {
        const matchesSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.message.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'all' || a.type === typeFilter;
        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'unread' && !a.isRead) ||
            (statusFilter === 'read' && a.isRead);
        return matchesSearch && matchesType && matchesStatus;
    });

    const unreadCount = announcements.filter((a: Announcement) => !a.isRead).length;

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'urgent':
                return <AlertTriangle className="h-5 w-5 text-red-500" />;
            case 'warning':
                return <AlertCircle className="h-5 w-5 text-amber-500" />;
            case 'info':
                return <Info className="h-5 w-5 text-blue-500" />;
            default:
                return <Megaphone className="h-5 w-5 text-gray-500" />;
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

    const getAudienceBadge = (audience: string) => {
        switch (audience) {
            case 'all':
                return <Badge variant="outline">All Students</Badge>;
            case 'institute':
                return <Badge variant="outline">Institute</Badge>;
            case 'team':
                return <Badge variant="outline">Team</Badge>;
            default:
                return null;
        }
    };

    const handleClick = (announcement: Announcement) => {
        if (!announcement.isRead) {
            markReadMutation.mutate(announcement._id);
        }
    };

    return (
        <DashboardLayout role="student">
            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Announcements</h2>
                        <p className="text-muted-foreground">
                            Stay updated with the latest news and updates.
                        </p>
                    </div>
                    {unreadCount > 0 && (
                        <Button
                            onClick={() => markAllReadMutation.mutate()}
                            disabled={markAllReadMutation.isPending}
                        >
                            {markAllReadMutation.isPending ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <CheckCheck className="mr-2 h-4 w-4" />
                            )}
                            Mark All as Read
                        </Button>
                    )}
                </div>

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total</CardTitle>
                            <Megaphone className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{announcements.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Unread</CardTitle>
                            <Badge className="bg-blue-500">{unreadCount}</Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{unreadCount}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Urgent</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {announcements.filter((a: Announcement) => a.type === 'urgent').length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">This Week</CardTitle>
                            <Info className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {announcements.filter((a: Announcement) => {
                                    const weekAgo = new Date();
                                    weekAgo.setDate(weekAgo.getDate() - 7);
                                    return new Date(a.createdAt) > weekAgo;
                                }).length}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-wrap gap-4 items-center">
                            <div className="relative flex-1 min-w-[200px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search announcements..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="w-[150px]">
                                    <Filter className="h-4 w-4 mr-2" />
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="urgent">Urgent</SelectItem>
                                    <SelectItem value="warning">Warning</SelectItem>
                                    <SelectItem value="info">Info</SelectItem>
                                    <SelectItem value="general">General</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    <SelectItem value="unread">Unread</SelectItem>
                                    <SelectItem value="read">Read</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Announcements List */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Announcements</CardTitle>
                        <CardDescription>
                            {filteredAnnouncements.length} announcements found
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin" />
                            </div>
                        ) : filteredAnnouncements.length > 0 ? (
                            <div className="space-y-4">
                                {filteredAnnouncements.map((announcement: Announcement) => (
                                    <div
                                        key={announcement._id}
                                        className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${!announcement.isRead
                                                ? 'bg-muted/30 border-primary/30 shadow-sm'
                                                : 'hover:bg-muted/20'
                                            } ${announcement.type === 'urgent'
                                                ? 'border-l-4 border-l-red-500'
                                                : announcement.type === 'warning'
                                                    ? 'border-l-4 border-l-amber-500'
                                                    : announcement.type === 'info'
                                                        ? 'border-l-4 border-l-blue-500'
                                                        : ''
                                            }`}
                                        onClick={() => handleClick(announcement)}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="mt-1">
                                                {getTypeIcon(announcement.type)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                    <h3 className="font-semibold">{announcement.title}</h3>
                                                    {getTypeBadge(announcement.type)}
                                                    {getAudienceBadge(announcement.audience)}
                                                    {!announcement.isRead && (
                                                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                                                    )}
                                                </div>
                                                <p className="text-muted-foreground text-sm mb-2">
                                                    {announcement.message}
                                                </p>
                                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                    <span>By {announcement.createdByName}</span>
                                                    <span>•</span>
                                                    <span>
                                                        {formatDistanceToNow(new Date(announcement.createdAt), { addSuffix: true })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                <Megaphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No announcements found</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default StudentAnnouncementsPage;
