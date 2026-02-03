import { useState } from 'react';
import {
    useTimeline,
    useCreateTimelineItem,
    useUpdateTimelineItem,
    useDeleteTimelineItem,
    useReorderTimeline,
    TimelineItem,
    CreateTimelineItemData,
    formatTimelineDate,
    getStatusColor,
    getStatusLabel
} from '@/services/timelineService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Plus,
    Pencil,
    Trash2,
    GripVertical,
    Calendar,
    ArrowUp,
    ArrowDown,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const AdminTimelineManager = () => {
    const { data: items = [], isLoading, error } = useTimeline();
    const createMutation = useCreateTimelineItem();
    const updateMutation = useUpdateTimelineItem();
    const deleteMutation = useDeleteTimelineItem();
    const reorderMutation = useReorderTimeline();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<TimelineItem | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<TimelineItem | null>(null);

    // Form state
    const [formData, setFormData] = useState<CreateTimelineItemData>({
        title: '',
        description: '',
        date: '',
        time: '',
        status: 'upcoming',
        ctaText: '',
        ctaUrl: '',
        imageUrl: ''
    });

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            date: '',
            time: '',
            status: 'upcoming',
            ctaText: '',
            ctaUrl: '',
            imageUrl: ''
        });
        setEditingItem(null);
    };

    const openCreateDialog = () => {
        resetForm();
        setDialogOpen(true);
    };

    const openEditDialog = (item: TimelineItem) => {
        setEditingItem(item);
        setFormData({
            title: item.title,
            description: item.description || '',
            date: new Date(item.date).toISOString().split('T')[0],
            time: item.time || '',
            status: item.status,
            ctaText: item.ctaText || '',
            ctaUrl: item.ctaUrl || '',
            imageUrl: item.imageUrl || ''
        });
        setDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title || !formData.date) {
            toast.error('Title and date are required');
            return;
        }

        try {
            if (editingItem) {
                await updateMutation.mutateAsync({
                    id: editingItem._id,
                    data: formData
                });
                toast.success('Timeline item updated successfully');
            } else {
                await createMutation.mutateAsync(formData);
                toast.success('Timeline item created successfully');
            }
            setDialogOpen(false);
            resetForm();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'An error occurred');
        }
    };

    const handleDelete = async () => {
        if (!itemToDelete) return;

        try {
            await deleteMutation.mutateAsync(itemToDelete._id);
            toast.success('Timeline item deleted successfully');
            setDeleteConfirmOpen(false);
            setItemToDelete(null);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete item');
        }
    };

    const handleMoveUp = async (index: number) => {
        if (index === 0) return;

        const newItems = items.map((item, i) => ({
            id: item._id,
            order: i === index ? items[index - 1].order :
                i === index - 1 ? items[index].order :
                    item.order
        }));

        try {
            await reorderMutation.mutateAsync(newItems);
            toast.success('Items reordered');
        } catch (error) {
            toast.error('Failed to reorder items');
        }
    };

    const handleMoveDown = async (index: number) => {
        if (index === items.length - 1) return;

        const newItems = items.map((item, i) => ({
            id: item._id,
            order: i === index ? items[index + 1].order :
                i === index + 1 ? items[index].order :
                    item.order
        }));

        try {
            await reorderMutation.mutateAsync(newItems);
            toast.success('Items reordered');
        } catch (error) {
            toast.error('Failed to reorder items');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-[#8B2A3B]" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Timeline Manager</h2>
                    <p className="text-gray-600">Manage hackathon milestones displayed on the home page</p>
                </div>
                <Button
                    onClick={openCreateDialog}
                    className="bg-gradient-to-r from-[#8B2A3B] to-[#E25A2C] text-white"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Milestone
                </Button>
            </div>

            {/* Items Table */}
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gradient-to-r from-[#8B2A3B] to-[#a53549]">
                                <TableHead className="text-white w-16">Order</TableHead>
                                <TableHead className="text-white">Title</TableHead>
                                <TableHead className="text-white">Date</TableHead>
                                <TableHead className="text-white">Status</TableHead>
                                <TableHead className="text-white">CTA</TableHead>
                                <TableHead className="text-white w-40">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                        <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                        <p>No timeline items yet. Create your first milestone!</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                items.map((item, index) => (
                                    <TableRow
                                        key={item._id}
                                        className={cn(
                                            'hover:bg-gray-50',
                                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                                        )}
                                    >
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <GripVertical className="h-4 w-4 text-gray-400" />
                                                <span className="font-medium">{item.order}</span>
                                                <div className="flex flex-col ml-2">
                                                    <button
                                                        onClick={() => handleMoveUp(index)}
                                                        disabled={index === 0}
                                                        className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                                    >
                                                        <ArrowUp className="h-3 w-3" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleMoveDown(index)}
                                                        disabled={index === items.length - 1}
                                                        className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                                    >
                                                        <ArrowDown className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">{item.title}</TableCell>
                                        <TableCell>{formatTimelineDate(item.date, item.time)}</TableCell>
                                        <TableCell>
                                            <span className={cn(
                                                'text-xs font-semibold px-2 py-1 rounded-full text-white',
                                                getStatusColor(item.status)
                                            )}>
                                                {getStatusLabel(item.status)}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {item.ctaText ? (
                                                <span className="text-sm text-blue-600">{item.ctaText}</span>
                                            ) : (
                                                <span className="text-sm text-gray-400">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => openEditDialog(item)}
                                                >
                                                    <Pencil className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => {
                                                        setItemToDelete(item);
                                                        setDeleteConfirmOpen(true);
                                                    }}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {editingItem ? 'Edit Milestone' : 'Create New Milestone'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g., Registration Opens"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Brief description of this milestone"
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="date">Date *</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="time">Time (optional)</Label>
                                <Input
                                    id="time"
                                    type="time"
                                    value={formData.time}
                                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="upcoming">Upcoming</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="ctaText">CTA Button Text</Label>
                                <Input
                                    id="ctaText"
                                    value={formData.ctaText}
                                    onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                                    placeholder="e.g., Register Now"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ctaUrl">CTA Button URL</Label>
                                <Input
                                    id="ctaUrl"
                                    value={formData.ctaUrl}
                                    onChange={(e) => setFormData({ ...formData, ctaUrl: e.target.value })}
                                    placeholder="e.g., /signup"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="imageUrl">Image URL (optional)</Label>
                            <Input
                                id="imageUrl"
                                value={formData.imageUrl}
                                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="bg-gradient-to-r from-[#8B2A3B] to-[#E25A2C]"
                                disabled={createMutation.isPending || updateMutation.isPending}
                            >
                                {(createMutation.isPending || updateMutation.isPending) && (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                )}
                                {editingItem ? 'Update' : 'Create'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Delete Milestone</DialogTitle>
                    </DialogHeader>
                    <p className="text-gray-600">
                        Are you sure you want to delete "{itemToDelete?.title}"? This action cannot be undone.
                    </p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending && (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            )}
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminTimelineManager;
