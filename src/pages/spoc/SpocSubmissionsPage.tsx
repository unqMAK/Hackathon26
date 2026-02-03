import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Search,
    ExternalLink,
    Eye,
    Github,
    FileText,
    User,
    CheckCircle,
    RefreshCw,
    Lock,
    Loader2
} from 'lucide-react';
import { submissionService } from '@/services/submissionService';
import type { Submission } from '@/types/submission';

const SpocSubmissionsPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // Fetch submissions (will be filtered by institute on backend)
    const { data: submissionsData, isLoading } = useQuery({
        queryKey: ['spocSubmissions'],
        queryFn: () => submissionService.listSubmissions({ page: 1, limit: 100 })
    });

    const submissions = submissionsData?.submissions || [];

    // Filter by search
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

    const getTeamName = (teamId: string | any): string => {
        if (typeof teamId === 'object' && teamId?.name) {
            return teamId.name;
        }
        return 'Unknown Team';
    };

    const getSubmitterName = (submittedBy: string | any): string => {
        if (typeof submittedBy === 'object' && submittedBy?.name) {
            return submittedBy.name;
        }
        return 'Unknown';
    };

    return (
        <DashboardLayout role="spoc">
            <div className="space-y-6 animate-fade-in">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Institute Submissions</h2>
                    <p className="text-muted-foreground">View project submissions from your institute's teams.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Submissions ({filteredSubmissions.length})</CardTitle>
                        <CardDescription>All project submissions from teams in your institute.</CardDescription>
                        <div className="pt-4">
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by team or submitter..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin" />
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Team</TableHead>
                                        <TableHead>Submitted By</TableHead>
                                        <TableHead>Version</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Links</TableHead>
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
                                                            <Github className="h-4 w-4" />
                                                        </a>
                                                    )}
                                                    {submission.files?.length > 0 && (
                                                        <span className="text-muted-foreground">
                                                            <FileText className="h-4 w-4" />
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(submission.status)}</TableCell>
                                            <TableCell>
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
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {filteredSubmissions.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8">
                                                No submissions found from your institute.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
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
                                    <p className="text-sm text-muted-foreground">Submitted By</p>
                                    <p className="font-medium">{getSubmitterName(selectedSubmission.submittedBy)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Date</p>
                                    <p className="font-medium">{new Date(selectedSubmission.createdAt).toLocaleString()}</p>
                                </div>
                            </div>

                            {selectedSubmission.repoUrl && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Repository</p>
                                    <a
                                        href={selectedSubmission.repoUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-primary hover:underline"
                                    >
                                        <Github className="h-4 w-4" />
                                        {selectedSubmission.repoUrl}
                                        <ExternalLink className="h-3 w-3" />
                                    </a>
                                </div>
                            )}

                            {selectedSubmission.files?.length > 0 && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Files</p>
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
                                    <p className="text-sm text-muted-foreground">Notes</p>
                                    <p className="mt-1 p-3 bg-muted rounded">{selectedSubmission.notes}</p>
                                </div>
                            )}

                            <div>
                                <p className="text-sm text-muted-foreground">Status</p>
                                <div className="mt-1">{getStatusBadge(selectedSubmission.status)}</div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
};

export default SpocSubmissionsPage;
