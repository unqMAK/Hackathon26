import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Search,
    ExternalLink,
    FileText,
    Clock,
    CheckCircle,
    Github,
    Loader2,
    Eye
} from 'lucide-react';
import { submissionService } from '@/services/submissionService';
import { getAssignedTeams } from '@/services/evaluationService';
import type { Submission } from '@/types/submission';
import { format } from 'date-fns';

interface Team {
    _id: string;
    name: string;
    problemId?: {
        _id: string;
        title: string;
    };
}

interface AssignedTeam {
    _id: string;
    name: string;
    institute?: string;
    problemId?: {
        _id: string;
        title: string;
    };
    hasSubmission?: boolean;
    isEvaluated?: boolean;
}

const JudgeSubmissionsPage = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
    const [showDetail, setShowDetail] = useState(false);

    // Fetch assigned teams
    const { data: assignedTeams = [], isLoading: loadingTeams } = useQuery({
        queryKey: ['assignedTeams'],
        queryFn: getAssignedTeams
    });

    // Fetch all submissions
    const { data: submissionsData, isLoading: loadingSubmissions } = useQuery({
        queryKey: ['judgeSubmissions'],
        queryFn: () => submissionService.listSubmissions({ page: 1, limit: 100 })
    });

    const allSubmissions = submissionsData?.submissions || [];

    // Filter submissions to only show from assigned teams
    const assignedTeamIds = assignedTeams.map((t: AssignedTeam) => t._id);
    const submissions = allSubmissions.filter((sub: Submission) => {
        const teamId = typeof sub.teamId === 'object' ? sub.teamId._id : sub.teamId;
        return assignedTeamIds.includes(teamId);
    });

    // Search filter
    const filteredSubmissions = submissions.filter((sub: Submission) => {
        const teamName = typeof sub.teamId === 'object' ? sub.teamId.name : '';
        return teamName.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const isLoading = loadingTeams || loadingSubmissions;

    const getTeamName = (teamId: string | { _id: string; name: string }) => {
        return typeof teamId === 'object' ? teamId.name : 'Unknown Team';
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'submitted':
                return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" /> Submitted</Badge>;
            case 'updated':
                return <Badge className="bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" /> Updated</Badge>;
            case 'locked':
                return <Badge className="bg-gray-100 text-gray-800"><FileText className="w-3 h-3 mr-1" /> Locked</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const openDetail = (submission: Submission) => {
        setSelectedSubmission(submission);
        setShowDetail(true);
    };

    return (
        <DashboardLayout role="judge">
            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Submissions</h2>
                        <p className="text-muted-foreground">Review submissions from your assigned teams.</p>
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search teams..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 max-w-md"
                    />
                </div>

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Assigned Teams</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{assignedTeams.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Submissions Received</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{submissions.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                            <Clock className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {assignedTeams.filter((t: AssignedTeam) => !t.isEvaluated).length}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Submissions Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Team Submissions</CardTitle>
                        <CardDescription>
                            Submissions from teams assigned to you for evaluation
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin" />
                            </div>
                        ) : filteredSubmissions.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Team</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Version</TableHead>
                                        <TableHead>Submitted</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredSubmissions.map((submission: Submission) => (
                                        <TableRow key={submission._id}>
                                            <TableCell className="font-medium">
                                                {getTeamName(submission.teamId)}
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(submission.status)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">v{submission.version}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                {format(new Date(submission.createdAt), 'MMM d, yyyy h:mm a')}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex gap-2 justify-end">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => openDetail(submission)}
                                                    >
                                                        <Eye className="h-4 w-4 mr-1" /> View
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => {
                                                            const teamId = typeof submission.teamId === 'object'
                                                                ? submission.teamId._id
                                                                : submission.teamId;
                                                            navigate(`/judge/evaluate/${teamId}`);
                                                        }}
                                                    >
                                                        Evaluate
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No submissions from assigned teams yet.</p>
                                <p className="text-sm mt-2">
                                    You have {assignedTeams.length} teams assigned. Waiting for them to submit.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Submission Detail Modal */}
            <Dialog open={showDetail} onOpenChange={setShowDetail}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Submission Details</DialogTitle>
                    </DialogHeader>
                    {selectedSubmission && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Team</p>
                                    <p className="font-medium">{getTeamName(selectedSubmission.teamId)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Status</p>
                                    <p>{getStatusBadge(selectedSubmission.status)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Version</p>
                                    <p className="font-medium">v{selectedSubmission.version}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Submitted</p>
                                    <p className="font-medium">
                                        {format(new Date(selectedSubmission.createdAt), 'MMM d, yyyy h:mm a')}
                                    </p>
                                </div>
                            </div>

                            {selectedSubmission.repoUrl && (
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">Repository</p>
                                    <a
                                        href={selectedSubmission.repoUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-primary hover:underline"
                                    >
                                        <Github className="h-4 w-4" />
                                        {selectedSubmission.repoUrl}
                                        <ExternalLink className="h-3 w-3" />
                                    </a>
                                </div>
                            )}

                            {selectedSubmission.files && selectedSubmission.files.length > 0 && (
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">Files</p>
                                    <div className="space-y-2">
                                        {selectedSubmission.files.map((file, idx) => (
                                            <a
                                                key={idx}
                                                href={file.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 p-2 rounded border hover:bg-muted transition-colors"
                                            >
                                                <FileText className="h-4 w-4" />
                                                <span>{file.filename}</span>
                                                <ExternalLink className="h-3 w-3 ml-auto" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedSubmission.notes && (
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">Notes</p>
                                    <p className="text-sm bg-muted p-3 rounded">{selectedSubmission.notes}</p>
                                </div>
                            )}

                            <div className="flex justify-end pt-4">
                                <Button
                                    onClick={() => {
                                        const teamId = typeof selectedSubmission.teamId === 'object'
                                            ? selectedSubmission.teamId._id
                                            : selectedSubmission.teamId;
                                        navigate(`/judge/evaluate/${teamId}`);
                                    }}
                                >
                                    Evaluate Team
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
};

export default JudgeSubmissionsPage;
