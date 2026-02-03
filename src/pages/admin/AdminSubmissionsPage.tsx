import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
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
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Search,
    ExternalLink,
    Lock,
    Eye,
    FileText,
    User,
    CheckCircle,
    Star,
    Loader2,
    RefreshCw,
    Calendar as CalendarIcon,
    Clock
} from 'lucide-react';
import submissionService from '@/services/submissionService';
import type { Submission } from '@/types/submission';
import { toast } from 'sonner';

const AdminSubmissionsPage = () => {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [page, setPage] = useState(1);

    // Detail modal state
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // Score modal state
    const [showScoreModal, setShowScoreModal] = useState(false);
    const [scoreValue, setScoreValue] = useState<string>('');
    const [feedbackValue, setFeedbackValue] = useState('');

    // Deadline state
    const [deadlineDate, setDeadlineDate] = useState<Date | undefined>(undefined);
    const [deadlineTime, setDeadlineTime] = useState<string>('');
    const [isDeadlineActive, setIsDeadlineActive] = useState(false);

    // Fetch submissions
    const { data: submissionsData, isLoading, error: submissionsError } = useQuery({
        queryKey: ['adminSubmissions', statusFilter, page],
        queryFn: () => submissionService.listSubmissions({
            status: statusFilter !== 'all' ? statusFilter : undefined,
            page,
            limit: 20
        }),
        retry: false
    });

    // Fetch deadline
    const { data: deadlineData } = useQuery({
        queryKey: ['submissionDeadline'],
        queryFn: submissionService.getDeadline
    });

    // Initialize deadline state
    useEffect(() => {
        if (deadlineData) {
            if (deadlineData.deadline) {
                const date = new Date(deadlineData.deadline);
                setDeadlineDate(date);
                // Format time as HH:mm
                const hours = date.getHours().toString().padStart(2, '0');
                const minutes = date.getMinutes().toString().padStart(2, '0');
                setDeadlineTime(`${hours}:${minutes}`);
            }
            setIsDeadlineActive(deadlineData.isActive);
        }
    }, [deadlineData]);

    // Lock mutation
    const lockMutation = useMutation({
        mutationFn: ({ id, isFinal }: { id: string; isFinal?: boolean }) =>
            submissionService.lockSubmission(id, isFinal),
        onSuccess: () => {
            toast.success('Submission locked successfully');
            queryClient.invalidateQueries({ queryKey: ['adminSubmissions'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to lock submission');
        }
    });

    // Score mutation
    const scoreMutation = useMutation({
        mutationFn: ({ id, score, feedback }: { id: string; score?: number; feedback?: string }) =>
            submissionService.scoreSubmission(id, { score, feedback }),
        onSuccess: () => {
            toast.success('Score updated successfully');
            queryClient.invalidateQueries({ queryKey: ['adminSubmissions'] });
            setShowScoreModal(false);
            setScoreValue('');
            setFeedbackValue('');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update score');
        }
    });

    // Update deadline mutation
    const updateDeadlineMutation = useMutation({
        mutationFn: submissionService.updateDeadline,
        onSuccess: () => {
            toast.success('Deadline updated successfully');
            queryClient.invalidateQueries({ queryKey: ['submissionDeadline'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update deadline');
        }
    });

    // Handle deadline save
    const handleSaveDeadline = () => {
        if (!deadlineDate) {
            toast.error('Please select a date');
            return;
        }
        if (!deadlineTime) {
            toast.error('Please select a time');
            return;
        }

        // Combine date and time
        const [hours, minutes] = deadlineTime.split(':').map(Number);
        const combinedDate = new Date(deadlineDate);
        combinedDate.setHours(hours, minutes);

        updateDeadlineMutation.mutate({
            deadline: combinedDate.toISOString(),
            isActive: isDeadlineActive
        });
    };

    // Handle score submit
    const handleScoreSubmit = () => {
        if (!selectedSubmission) return;
        scoreMutation.mutate({
            id: selectedSubmission._id,
            score: scoreValue ? parseInt(scoreValue) : undefined,
            feedback: feedbackValue || undefined
        });
    };

    // Filter submissions by search
    const submissions = submissionsData?.submissions || [];
    const filteredSubmissions = submissions.filter((sub: Submission) => {
        const teamName = typeof sub.teamId === 'object' ? sub.teamId.name : '';
        const submitterName = typeof sub.submittedBy === 'object' ? sub.submittedBy.name : '';
        const query = searchQuery.toLowerCase();
        return teamName.toLowerCase().includes(query) || submitterName.toLowerCase().includes(query);
    });

    // Status badge
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'submitted':
                return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" /> Submitted</Badge>;
            case 'updated':
                return <Badge className="bg-blue-100 text-blue-800"><RefreshCw className="w-3 h-3 mr-1" /> Updated</Badge>;
            case 'locked':
                return <Badge className="bg-gray-100 text-gray-800"><Lock className="w-3 h-3 mr-1" /> Locked</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    // Get team name
    const getTeamName = (teamId: string | any): string => {
        if (typeof teamId === 'object' && teamId?.name) {
            return teamId.name;
        }
        return 'Unknown Team';
    };

    // Get submitter name
    const getSubmitterName = (submittedBy: string | any): string => {
        if (typeof submittedBy === 'object' && submittedBy?.name) {
            return submittedBy.name;
        }
        return 'Unknown';
    };

    return (
        <DashboardLayout role="admin">
            <div className="space-y-6 animate-fade-in">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Submissions</h2>
                    <p className="text-muted-foreground">View and manage all project submissions.</p>
                </div>

                {/* Deadline Configuration */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CalendarIcon className="h-5 w-5" />
                            Submission Deadline
                        </CardTitle>
                        <CardDescription>Configure when teams can submit their projects.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-6 items-end">
                            <div className="grid gap-2 flex-1">
                                <Label>Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !deadlineDate && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {deadlineDate ? format(deadlineDate, "PPP") : <span>mm/dd/yyyy</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={deadlineDate}
                                            onSelect={setDeadlineDate}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="grid gap-2 flex-1">
                                <Label>Time</Label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="time"
                                        value={deadlineTime}
                                        onChange={(e) => setDeadlineTime(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label>Status</Label>
                                <div className="flex items-center space-x-2 h-10">
                                    <Switch
                                        checked={isDeadlineActive}
                                        onCheckedChange={setIsDeadlineActive}
                                        id="deadline-mode"
                                    />
                                    <Label htmlFor="deadline-mode">
                                        {isDeadlineActive ? 'Active' : 'Inactive'}
                                    </Label>
                                </div>
                            </div>
                            <Button
                                onClick={handleSaveDeadline}
                                disabled={updateDeadlineMutation.isPending}
                                className="w-full md:w-auto bg-[#800000] hover:bg-[#600000] text-white"
                            >
                                {updateDeadlineMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                Save Deadline
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Error display for debugging */}
                {submissionsError && (
                    <Card className="border-red-200 bg-red-50">
                        <CardContent className="p-4">
                            <p className="text-red-600">Error loading submissions: {(submissionsError as Error).message}</p>
                        </CardContent>
                    </Card>
                )}

                {/* Submissions Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Submissions ({submissionsData?.pagination?.total || 0})</CardTitle>
                        <CardDescription>Project submissions from teams.</CardDescription>
                        <div className="pt-4 flex gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by team or submitter..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="submitted">Submitted</SelectItem>
                                    <SelectItem value="updated">Updated</SelectItem>
                                    <SelectItem value="locked">Locked</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin" />
                            </div>
                        ) : (
                            <>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Team</TableHead>
                                            <TableHead>Submitted By</TableHead>
                                            <TableHead>Version</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Links</TableHead>
                                            <TableHead>Score</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredSubmissions.map((submission: Submission) => (
                                            <TableRow key={submission._id}>
                                                <TableCell className="font-medium">
                                                    {getTeamName(submission.teamId)}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <User className="h-3 w-3" />
                                                        {getSubmitterName(submission.submittedBy)}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">v{submission.version}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(submission.createdAt).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        {submission.repoUrl && (
                                                            <a
                                                                href={submission.repoUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-primary hover:underline"
                                                            >
                                                                {/* <Github className="h-4 w-4" /> */}
                                                                Repo
                                                            </a>
                                                        )}
                                                        {submission.files?.length > 0 && (
                                                            <span className="text-muted-foreground">
                                                                <FileText className="h-4 w-4" />
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {submission.score !== undefined ? (
                                                        <div className="flex items-center gap-1">
                                                            <Star className="h-3 w-3 text-yellow-500" />
                                                            {submission.score}/100
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>{getStatusBadge(submission.status)}</TableCell>
                                                <TableCell>
                                                    <div className="flex gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                setSelectedSubmission(submission);
                                                                setShowDetailModal(true);
                                                            }}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                setSelectedSubmission(submission);
                                                                setScoreValue(submission.score?.toString() || '');
                                                                setFeedbackValue(submission.feedback || '');
                                                                setShowScoreModal(true);
                                                            }}
                                                        >
                                                            <Star className="h-4 w-4" />
                                                        </Button>
                                                        {submission.status !== 'locked' && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => lockMutation.mutate({ id: submission._id, isFinal: true })}
                                                                disabled={lockMutation.isPending}
                                                            >
                                                                <Lock className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {filteredSubmissions.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={8} className="text-center py-8">
                                                    No submissions found.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>

                                {/* Pagination */}
                                {submissionsData?.pagination && submissionsData.pagination.pages > 1 && (
                                    <div className="flex justify-center gap-2 mt-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                        >
                                            Previous
                                        </Button>
                                        <span className="flex items-center px-4">
                                            Page {page} of {submissionsData.pagination.pages}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage(p => Math.min(submissionsData.pagination.pages, p + 1))}
                                            disabled={page === submissionsData.pagination.pages}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Detail Modal */}
            <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Submission Details</DialogTitle>
                        <DialogDescription>
                            Version {selectedSubmission?.version} - {getTeamName(selectedSubmission?.teamId)}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedSubmission && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-muted-foreground">Submitted By</Label>
                                    <p>{getSubmitterName(selectedSubmission.submittedBy)}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Date</Label>
                                    <p>{new Date(selectedSubmission.createdAt).toLocaleString()}</p>
                                </div>
                            </div>

                            {selectedSubmission.repoUrl && (
                                <div>
                                    <Label className="text-muted-foreground">Repository</Label>
                                    <a
                                        href={selectedSubmission.repoUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-primary hover:underline"
                                    >
                                        {/* <Github className="h-4 w-4" /> */}
                                        Repo:
                                        {selectedSubmission.repoUrl}
                                        <ExternalLink className="h-3 w-3" />
                                    </a>
                                </div>
                            )}

                            {selectedSubmission.files?.length > 0 && (
                                <div>
                                    <Label className="text-muted-foreground">Files</Label>
                                    <div className="space-y-2 mt-1">
                                        {selectedSubmission.files.map((file, i) => (
                                            <a
                                                key={i}
                                                href={file.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 p-2 bg-muted rounded hover:bg-muted/80"
                                            >
                                                <FileText className="h-4 w-4" />
                                                {file.filename || 'File'}
                                                <ExternalLink className="h-3 w-3 ml-auto" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedSubmission.notes && (
                                <div>
                                    <Label className="text-muted-foreground">Notes</Label>
                                    <p className="mt-1 p-3 bg-muted rounded">{selectedSubmission.notes}</p>
                                </div>
                            )}

                            <div className="flex gap-4">
                                <div>
                                    <Label className="text-muted-foreground">Status</Label>
                                    <div className="mt-1">{getStatusBadge(selectedSubmission.status)}</div>
                                </div>
                                {selectedSubmission.score !== undefined && (
                                    <div>
                                        <Label className="text-muted-foreground">Score</Label>
                                        <p className="text-lg font-bold">{selectedSubmission.score}/100</p>
                                    </div>
                                )}
                            </div>

                            {selectedSubmission.feedback && (
                                <div>
                                    <Label className="text-muted-foreground">Feedback</Label>
                                    <p className="mt-1 p-3 bg-blue-50 rounded">{selectedSubmission.feedback}</p>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Score Modal */}
            <Dialog open={showScoreModal} onOpenChange={setShowScoreModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Score Submission</DialogTitle>
                        <DialogDescription>
                            Provide score and feedback for {getTeamName(selectedSubmission?.teamId)}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Score (0-100)</Label>
                            <Input
                                type="number"
                                min="0"
                                max="100"
                                value={scoreValue}
                                onChange={(e) => setScoreValue(e.target.value)}
                                placeholder="Enter score..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Feedback</Label>
                            <Textarea
                                value={feedbackValue}
                                onChange={(e) => setFeedbackValue(e.target.value)}
                                placeholder="Enter feedback..."
                                className="min-h-[100px]"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowScoreModal(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleScoreSubmit} disabled={scoreMutation.isPending}>
                            {scoreMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                            Save Score
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
};

export default AdminSubmissionsPage;
