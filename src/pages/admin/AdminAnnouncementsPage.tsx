import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Megaphone,
    Plus,
    Pencil,
    Trash2,
    AlertTriangle,
    Info,
    AlertCircle,
    Loader2,
    Eye
} from 'lucide-react';
import { announcementService } from '@/services/announcementService';
import type { Announcement, AnnouncementInput } from '@/types/announcement';
import { api } from '@/services/api';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Team {
    _id: string;
    name: string;
}

const AdminAnnouncementsPage = () => {
    const queryClient = useQueryClient();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

    const [formData, setFormData] = useState<AnnouncementInput>({
        title: '',
        message: '',
        type: 'general',
        audience: 'all',
        displayLocation: 'both',
        targetTeamId: ''
    });

    // Fetch announcements for admin
    const { data: announcements = [], isLoading } = useQuery({
        queryKey: ['adminAnnouncements'],
        queryFn: announcementService.getAdminAnnouncements
    });

    // Fetch teams for targeting
    const { data: teams = [] } = useQuery({
        queryKey: ['teams'],
        queryFn: async () => {
            const { data } = await api.get('/teams?status=approved');
            return data;
        }
    });

    // Create mutation
    const createMutation = useMutation({
        mutationFn: announcementService.createAnnouncement,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminAnnouncements'] });
            queryClient.invalidateQueries({ queryKey: ['announcements'] });
            toast.success('Announcement published successfully!');
            setIsCreateOpen(false);
            resetForm();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create announcement');
        }
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<AnnouncementInput> }) =>
            announcementService.updateAnnouncement(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminAnnouncements'] });
            queryClient.invalidateQueries({ queryKey: ['announcements'] });
            toast.success('Announcement updated successfully!');
            setIsEditOpen(false);
            setSelectedAnnouncement(null);
            resetForm();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update announcement');
        }
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: announcementService.deleteAnnouncement,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminAnnouncements'] });
            queryClient.invalidateQueries({ queryKey: ['announcements'] });
            toast.success('Announcement deleted successfully!');
            setIsDeleteOpen(false);
            setSelectedAnnouncement(null);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to delete announcement');
        }
    });

    const resetForm = () => {
        setFormData({
            title: '',
            message: '',
            type: 'general',
            audience: 'all',
            displayLocation: 'both',
            targetTeamId: ''
        });
    };

    const openEdit = (announcement: Announcement) => {
        setSelectedAnnouncement(announcement);
        setFormData({
            title: announcement.title,
            message: announcement.message,
            type: announcement.type,
            audience: announcement.audience,
            targetTeamId: announcement.targetTeamId || ''
        });
        setIsEditOpen(true);
    };

    const openDelete = (announcement: Announcement) => {
        setSelectedAnnouncement(announcement);
        setIsDeleteOpen(true);
    };

    const handleSubmit = () => {
        if (!formData.title || !formData.message) {
            toast.error('Title and message are required');
            return;
        }
        createMutation.mutate(formData);
    };

    const handleUpdate = () => {
        if (!selectedAnnouncement) return;
        updateMutation.mutate({
            id: selectedAnnouncement._id,
            data: {
                title: formData.title,
                message: formData.message,
                type: formData.type
            }
        });
    };

    const handleDelete = () => {
        if (!selectedAnnouncement) return;
        deleteMutation.mutate(selectedAnnouncement._id);
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

    const getAudienceBadge = (audience: string, targetTeamName?: string) => {
        switch (audience) {
            case 'all':
                return <Badge variant="outline">All Students</Badge>;
            case 'institute':
                return <Badge variant="outline">Institute</Badge>;
            case 'team':
                return <Badge variant="outline">{targetTeamName || 'Team'}</Badge>;
            default:
                return null;
        }
    };

    return (
        <DashboardLayout role="admin">
            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Announcements</h2>
                        <p className="text-muted-foreground">
                            Manage and publish announcements to students.
                        </p>
                    </div>
                    <Button onClick={() => setIsCreateOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> New Announcement
                    </Button>
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
                            <CardTitle className="text-sm font-medium">Platform-wide</CardTitle>
                            <Info className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {announcements.filter((a: Announcement) => a.audience === 'all').length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Today</CardTitle>
                            <AlertCircle className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {announcements.filter((a: Announcement) => {
                                    const today = new Date();
                                    const created = new Date(a.createdAt);
                                    return created.toDateString() === today.toDateString();
                                }).length}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Announcements Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Announcements</CardTitle>
                        <CardDescription>
                            {announcements.length} announcements published
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin" />
                            </div>
                        ) : announcements.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Audience</TableHead>
                                        <TableHead>Created By</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {announcements.map((announcement: Announcement) => (
                                        <TableRow key={announcement._id}>
                                            <TableCell className="font-medium max-w-[200px] truncate">
                                                {announcement.title}
                                            </TableCell>
                                            <TableCell>{getTypeBadge(announcement.type)}</TableCell>
                                            <TableCell>
                                                {getAudienceBadge(announcement.audience, announcement.targetTeamName)}
                                            </TableCell>
                                            <TableCell>{announcement.createdByName}</TableCell>
                                            <TableCell>
                                                {format(new Date(announcement.createdAt), 'MMM d, yyyy')}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex gap-2 justify-end">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => {
                                                            setSelectedAnnouncement(announcement);
                                                            setIsPreviewOpen(true);
                                                        }}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => openEdit(announcement)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-destructive"
                                                        onClick={() => openDelete(announcement)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                <Megaphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No announcements yet. Create your first announcement!</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Create New Announcement</DialogTitle>
                        <DialogDescription>
                            Create a new announcement to notify students.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                placeholder="Announcement title..."
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="message">Message</Label>
                            <Textarea
                                id="message"
                                placeholder="Write your announcement message..."
                                rows={5}
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Type</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(value) => setFormData({ ...formData, type: value as any })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="general">General</SelectItem>
                                        <SelectItem value="info">Info</SelectItem>
                                        <SelectItem value="warning">Warning</SelectItem>
                                        <SelectItem value="urgent">Urgent</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Audience</Label>
                                <Select
                                    value={formData.audience}
                                    onValueChange={(value) => setFormData({ ...formData, audience: value as any })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Students</SelectItem>
                                        <SelectItem value="institute">Institute Only</SelectItem>
                                        <SelectItem value="team">Specific Team</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Display Location</Label>
                            <Select
                                value={formData.displayLocation || 'both'}
                                onValueChange={(value) => setFormData({ ...formData, displayLocation: value as any })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="both">Both (Home Page & Dashboard)</SelectItem>
                                    <SelectItem value="home">Home Page Ticker Only</SelectItem>
                                    <SelectItem value="dashboard">Student Dashboard Only</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                Choose where this announcement will be displayed
                            </p>
                        </div>
                        {formData.audience === 'team' && (
                            <div className="space-y-2">
                                <Label>Select Team</Label>
                                <Select
                                    value={formData.targetTeamId}
                                    onValueChange={(value) => setFormData({ ...formData, targetTeamId: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose a team..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {teams.map((team: Team) => (
                                            <SelectItem key={team._id} value={team._id}>
                                                {team.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} disabled={createMutation.isPending}>
                            {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Publish Announcement
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Announcement</DialogTitle>
                        <DialogDescription>
                            Update the announcement content.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-title">Title</Label>
                            <Input
                                id="edit-title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-message">Message</Label>
                            <Textarea
                                id="edit-message"
                                rows={5}
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Type</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value) => setFormData({ ...formData, type: value as any })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="general">General</SelectItem>
                                    <SelectItem value="info">Info</SelectItem>
                                    <SelectItem value="warning">Warning</SelectItem>
                                    <SelectItem value="urgent">Urgent</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
                            {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Preview Dialog */}
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {selectedAnnouncement?.title}
                            {selectedAnnouncement && getTypeBadge(selectedAnnouncement.type)}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-muted-foreground whitespace-pre-wrap">
                            {selectedAnnouncement?.message}
                        </p>
                        <div className="mt-4 pt-4 border-t flex items-center gap-4 text-sm text-muted-foreground">
                            <span>By {selectedAnnouncement?.createdByName}</span>
                            <span>•</span>
                            <span>
                                {selectedAnnouncement &&
                                    format(new Date(selectedAnnouncement.createdAt), 'MMM d, yyyy h:mm a')}
                            </span>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Announcement?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete "{selectedAnnouncement?.title}".
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </DashboardLayout>
    );
};

export default AdminAnnouncementsPage;
