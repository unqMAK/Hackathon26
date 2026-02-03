import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Edit, CalendarIcon, Clock } from 'lucide-react';
import { timelineService, TimelineEvent } from '@/services/timelineService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';


const AdminTimelinePage = () => {
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
    const [formData, setFormData] = useState<Partial<TimelineEvent>>({
        title: '',
        date: '',
        time: '',
        description: '',
        status: 'upcoming',
        order: 0,
    });

    const { data: events = [], isLoading } = useQuery({
        queryKey: ['timeline'],
        queryFn: timelineService.getEvents,
    });

    const createMutation = useMutation({
        mutationFn: timelineService.createEvent,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['timeline'] });
            setIsDialogOpen(false);
            resetForm();
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<TimelineEvent> }) =>
            timelineService.updateEvent(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['timeline'] });
            setIsDialogOpen(false);
            resetForm();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: timelineService.deleteEvent,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['timeline'] });
        },
    });

    const resetForm = () => {
        setEditingEvent(null);
        setFormData({
            title: '',
            date: '',
            time: '',
            description: '',
            status: 'upcoming',
            order: 0,
        });
    };

    const handleSubmit = () => {
        if (editingEvent) {
            updateMutation.mutate({ id: editingEvent._id, data: formData });
        } else {
            createMutation.mutate(formData as Omit<TimelineEvent, '_id'>);
        }
    };

    const handleEdit = (event: TimelineEvent) => {
        setEditingEvent(event);
        setFormData(event);
        setIsDialogOpen(true);
    };

    return (
        <DashboardLayout role="admin">
            <div className="space-y-6 animate-fade-in">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Timeline Management</h2>
                    <p className="text-muted-foreground">Manage the hackathon timeline events.</p>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Timeline Events</CardTitle>
                            <CardDescription>Add, edit, or remove events from the timeline.</CardDescription>
                        </div>
                        <Dialog open={isDialogOpen} onOpenChange={(open) => {
                            setIsDialogOpen(open);
                            if (!open) resetForm();
                        }}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" /> Add Event
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{editingEvent ? 'Edit Event' : 'Add New Event'}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Title</Label>
                                            <Input
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Date</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className={cn(
                                                            "w-full justify-start text-left font-normal",
                                                            !formData.date && "text-muted-foreground"
                                                        )}
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {formData.date ? formData.date : <span>Pick a date</span>}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={formData.date ? new Date(formData.date) : undefined}
                                                        onSelect={(date) => {
                                                            if (date) {
                                                                setFormData({ ...formData, date: format(date, 'MMM d, yyyy') });
                                                            }
                                                        }}
                                                        initialFocus
                                                        className="pointer-events-auto"
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Time</Label>
                                            <div className="relative">
                                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    type="time"
                                                    value={formData.time || ''}
                                                    onChange={(e) => {
                                                        const time24 = e.target.value;
                                                        // Convert to 12-hour format for display
                                                        if (time24) {
                                                            const [hours, minutes] = time24.split(':');
                                                            const hour = parseInt(hours);
                                                            const ampm = hour >= 12 ? 'PM' : 'AM';
                                                            const hour12 = hour % 12 || 12;
                                                            setFormData({ ...formData, time: `${hour12}:${minutes} ${ampm}` });
                                                        } else {
                                                            setFormData({ ...formData, time: '' });
                                                        }
                                                    }}
                                                    className="pl-10"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Order</Label>
                                            <Input
                                                type="number"
                                                value={formData.order}
                                                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Status</Label>
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
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Description</Label>
                                        <Input
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={handleSubmit}>
                                        {editingEvent ? 'Update Event' : 'Create Event'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Order</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {events.map((event) => (
                                    <TableRow key={event._id}>
                                        <TableCell>{event.order}</TableCell>
                                        <TableCell>{event.date}</TableCell>
                                        <TableCell className="font-medium">{event.title}</TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                event.status === 'completed' ? 'secondary' :
                                                    event.status === 'active' ? 'default' : 'outline'
                                            } className="capitalize">
                                                {event.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(event)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => deleteMutation.mutate(event._id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {events.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-4">No events found.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default AdminTimelinePage;
