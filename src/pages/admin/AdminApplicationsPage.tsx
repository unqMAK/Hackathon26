import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';
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
import { Label } from '@/components/ui/label';
import {
    Search,
    Clock,
    CheckCircle,
    XCircle,
    FileText,
    ExternalLink,
    Loader2,
    Users,
    Building,
    RefreshCw
} from 'lucide-react';

interface ProblemApplication {
    _id: string;
    teamId: {
        _id: string;
        name: string;
        instituteCode: string;
        instituteName: string;
        leader?: {
            name: string;
            email: string;
        };
    };
    problemId: {
        _id: string;
        title: string;
        category: string;
        difficulty: string;
    };
    status: 'pending' | 'approved' | 'rejected';
    supportingLinks: string[];
    comments: string;
    submittedBy: {
        name: string;
        email: string;
    };
    reviewNote?: string;
    reviewedBy?: {
        name: string;
    };
    reviewedAt?: string;
    createdAt: string;
}

interface ApplicationStats {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
}

const AdminApplicationsPage = () => {
    const queryClient = useQueryClient();
    const [statusFilter, setStatusFilter] = useState('pending');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedApplication, setSelectedApplication] = useState<ProblemApplication | null>(null);
    const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
    const [reviewNote, setReviewNote] = useState('');

    // Fetch applications
    const { data: applications = [], isLoading, refetch } = useQuery<ProblemApplication[]>({
        queryKey: ['adminApplications', statusFilter],
        queryFn: async () => {
            const response = await api.get(`/problem-applications/admin?status=${statusFilter}`);
            return response.data;
        }
    });

    // Fetch stats
    const { data: stats } = useQuery<ApplicationStats>({
        queryKey: ['applicationStats'],
        queryFn: async () => {
            const response = await api.get('/problem-applications/stats');
            return response.data;
        }
    });

    // Approve mutation
    const approveMutation = useMutation({
        mutationFn: async (data: { id: string; reviewNote: string }) => {
            const response = await api.put(`/problem-applications/${data.id}/approve`, { reviewNote: data.reviewNote });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminApplications'] });
            queryClient.invalidateQueries({ queryKey: ['applicationStats'] });
            toast.success('Application approved! Team has been shortlisted.');
            closeReviewDialog();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to approve application');
        }
    });

    // Reject mutation
    const rejectMutation = useMutation({
        mutationFn: async (data: { id: string; reviewNote: string }) => {
            const response = await api.put(`/problem-applications/${data.id}/reject`, { reviewNote: data.reviewNote });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminApplications'] });
            queryClient.invalidateQueries({ queryKey: ['applicationStats'] });
            toast.success('Application rejected.');
            closeReviewDialog();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to reject application');
        }
    });

    const openReviewDialog = (application: ProblemApplication) => {
        setSelectedApplication(application);
        setReviewNote('');
        setIsReviewDialogOpen(true);
    };

    const closeReviewDialog = () => {
        setSelectedApplication(null);
        setReviewNote('');
        setIsReviewDialogOpen(false);
    };

    const handleApprove = () => {
        if (!selectedApplication) return;
        approveMutation.mutate({ id: selectedApplication._id, reviewNote });
    };

    const handleReject = () => {
        if (!selectedApplication) return;
        rejectMutation.mutate({ id: selectedApplication._id, reviewNote });
    };

    const filteredApplications = applications.filter(app => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            app.teamId?.name?.toLowerCase().includes(query) ||
            app.problemId?.title?.toLowerCase().includes(query) ||
            app.teamId?.instituteName?.toLowerCase().includes(query) ||
            app.submittedBy?.name?.toLowerCase().includes(query)
        );
    });

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <DashboardLayout role="admin">
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Problem Applications</h2>
                        <p className="text-muted-foreground">Review and approve team applications for problem statements.</p>
                    </div>
                    <Button variant="outline" onClick={() => refetch()}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter('all')}>
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-3">
                                <FileText className="h-8 w-8 text-blue-600" />
                                <div>
                                    <p className="text-2xl font-bold">{stats?.total || 0}</p>
                                    <p className="text-sm text-muted-foreground">Total Applications</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card
                        className={`cursor-pointer hover:shadow-md transition-shadow ${statusFilter === 'pending' ? 'ring-2 ring-yellow-400' : ''}`}
                        onClick={() => setStatusFilter('pending')}
                    >
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-3">
                                <Clock className="h-8 w-8 text-yellow-600" />
                                <div>
                                    <p className="text-2xl font-bold text-yellow-700">{stats?.pending || 0}</p>
                                    <p className="text-sm text-yellow-600">Pending Review</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card
                        className={`cursor-pointer hover:shadow-md transition-shadow ${statusFilter === 'approved' ? 'ring-2 ring-green-400' : ''}`}
                        onClick={() => setStatusFilter('approved')}
                    >
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                                <div>
                                    <p className="text-2xl font-bold text-green-700">{stats?.approved || 0}</p>
                                    <p className="text-sm text-green-600">Approved</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card
                        className={`cursor-pointer hover:shadow-md transition-shadow ${statusFilter === 'rejected' ? 'ring-2 ring-red-400' : ''}`}
                        onClick={() => setStatusFilter('rejected')}
                    >
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-3">
                                <XCircle className="h-8 w-8 text-red-600" />
                                <div>
                                    <p className="text-2xl font-bold text-red-700">{stats?.rejected || 0}</p>
                                    <p className="text-sm text-red-600">Rejected</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search and Filter */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Search className="h-5 w-5" />
                            Filter Applications
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Search</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search by team, problem, institute..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Applications</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Applications Table */}
                <div className="rounded-md border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="font-bold">Team</TableHead>
                                <TableHead className="font-bold">Problem Statement</TableHead>
                                <TableHead className="font-bold">Institute</TableHead>
                                <TableHead className="font-bold">Status</TableHead>
                                <TableHead className="font-bold">Submitted</TableHead>
                                <TableHead className="text-right font-bold">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center">
                                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                                    </TableCell>
                                </TableRow>
                            ) : filteredApplications.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <FileText className="h-10 w-10 text-gray-300" />
                                            <p className="text-gray-500">No applications found</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredApplications.map((app) => (
                                    <TableRow key={app._id} className="hover:bg-gray-50">
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4 text-gray-400" />
                                                <div>
                                                    <p className="font-medium">{app.teamId?.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Leader: {app.submittedBy?.name}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{app.problemId?.title}</p>
                                                <Badge variant="outline" className="mt-1">{app.problemId?.category}</Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Building className="h-4 w-4 text-gray-400" />
                                                <span className="text-sm">{app.teamId?.instituteName}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={
                                                    app.status === 'approved'
                                                        ? 'bg-green-100 text-green-700'
                                                        : app.status === 'rejected'
                                                            ? 'bg-red-100 text-red-700'
                                                            : 'bg-yellow-100 text-yellow-700'
                                                }
                                            >
                                                {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {formatDate(app.createdAt)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => openReviewDialog(app)}
                                            >
                                                {app.status === 'pending' ? 'Review' : 'View'}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Review Dialog */}
            <Dialog open={isReviewDialogOpen} onOpenChange={closeReviewDialog}>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl">Application Review</DialogTitle>
                        <DialogDescription>
                            Review application from <strong>{selectedApplication?.teamId?.name}</strong>
                        </DialogDescription>
                    </DialogHeader>

                    {selectedApplication && (
                        <div className="space-y-6 py-4">
                            {/* Team Info */}
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-1">
                                    <Label className="text-muted-foreground">Team Name</Label>
                                    <p className="font-medium">{selectedApplication.teamId?.name}</p>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-muted-foreground">Institute</Label>
                                    <p className="font-medium">{selectedApplication.teamId?.instituteName}</p>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-muted-foreground">Submitted By</Label>
                                    <p className="font-medium">{selectedApplication.submittedBy?.name}</p>
                                    <p className="text-sm text-muted-foreground">{selectedApplication.submittedBy?.email}</p>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-muted-foreground">Submitted On</Label>
                                    <p className="font-medium">{formatDate(selectedApplication.createdAt)}</p>
                                </div>
                            </div>

                            {/* Problem Info */}
                            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                                <Label className="text-muted-foreground">Problem Statement</Label>
                                <p className="font-semibold text-lg mt-1">{selectedApplication.problemId?.title}</p>
                                <div className="flex gap-2 mt-2">
                                    <Badge variant="outline">{selectedApplication.problemId?.category}</Badge>
                                    <Badge variant="secondary">{selectedApplication.problemId?.difficulty}</Badge>
                                </div>
                            </div>

                            {/* Supporting Links */}
                            {selectedApplication.supportingLinks && selectedApplication.supportingLinks.length > 0 && (
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <ExternalLink className="h-4 w-4" />
                                        Supporting Links
                                    </Label>
                                    <div className="space-y-2">
                                        {selectedApplication.supportingLinks.map((link, i) => (
                                            <a
                                                key={i}
                                                href={link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-blue-600 hover:underline text-sm"
                                            >
                                                <ExternalLink className="h-3 w-3" />
                                                {link}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Comments */}
                            {selectedApplication.comments && (
                                <div className="space-y-2">
                                    <Label>Team's Comments / Appeal</Label>
                                    <div className="p-4 bg-gray-50 rounded-lg border">
                                        <p className="whitespace-pre-wrap text-sm">{selectedApplication.comments}</p>
                                    </div>
                                </div>
                            )}

                            {/* Previous Review (if already reviewed) */}
                            {selectedApplication.status !== 'pending' && selectedApplication.reviewNote && (
                                <div className="space-y-2">
                                    <Label>Review Note</Label>
                                    <div className={`p-4 rounded-lg border ${selectedApplication.status === 'approved'
                                        ? 'bg-green-50 border-green-200'
                                        : 'bg-red-50 border-red-200'
                                        }`}>
                                        <p className="whitespace-pre-wrap text-sm">{selectedApplication.reviewNote}</p>
                                        {selectedApplication.reviewedBy && (
                                            <p className="text-xs text-muted-foreground mt-2">
                                                Reviewed by {selectedApplication.reviewedBy.name}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Review Note Input (for pending) */}
                            {selectedApplication.status === 'pending' && (
                                <div className="space-y-2">
                                    <Label>Review Note (Optional)</Label>
                                    <Textarea
                                        placeholder="Add feedback for the team..."
                                        value={reviewNote}
                                        onChange={(e) => setReviewNote(e.target.value)}
                                        className="min-h-[80px]"
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={closeReviewDialog}>
                            Close
                        </Button>
                        {selectedApplication?.status === 'pending' && (
                            <>
                                <Button
                                    variant="destructive"
                                    onClick={handleReject}
                                    disabled={rejectMutation.isPending || approveMutation.isPending}
                                >
                                    {rejectMutation.isPending ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : (
                                        <XCircle className="h-4 w-4 mr-2" />
                                    )}
                                    Reject
                                </Button>
                                <Button
                                    onClick={handleApprove}
                                    disabled={approveMutation.isPending || rejectMutation.isPending}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    {approveMutation.isPending ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : (
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                    )}
                                    Approve & Shortlist
                                </Button>
                            </>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
};

export default AdminApplicationsPage;
