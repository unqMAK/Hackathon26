import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
    Upload,
    Paperclip,
    Github,
    Clock,
    AlertCircle,
    CheckCircle,
    Lock,
    Plus,
    Trash2,
    ExternalLink,
    FileText,
    Loader2
} from 'lucide-react';
import { submissionService } from '@/services/submissionService';
import { toast } from 'sonner';
import { getCurrentUser } from '@/lib/mockAuth';
import { api } from '@/services/api';

interface Team {
    _id: string;
    name: string;
    status: string;
    leaderId: string | { _id: string };
}

const StudentSubmissionPage = () => {
    const queryClient = useQueryClient();
    const user = getCurrentUser();

    const [repoUrl, setRepoUrl] = useState('');
    const [notes, setNotes] = useState('');
    const [fileUrls, setFileUrls] = useState<{ url: string; filename: string }[]>([]);
    const [newFileUrl, setNewFileUrl] = useState('');
    const [newFileName, setNewFileName] = useState('');

    // Fetch user's team
    const { data: teams = [] } = useQuery<Team[]>({
        queryKey: ['userTeams'],
        queryFn: async () => {
            const res = await api.get('/teams');
            return res.data;
        }
    });

    // Find user's team (where they are a leader or member)
    const myTeam = teams.find((t: any) => {
        const userId = user?.id || (user as any)?._id;
        if (!userId) return false;

        // Check if user is leader (handle both string and object)
        const leaderId = typeof t.leaderId === 'object' ? t.leaderId?._id : t.leaderId;
        if (leaderId === userId) return true;

        // Check if user is in members array
        if (t.members && Array.isArray(t.members)) {
            return t.members.some((m: any) => {
                const memberId = typeof m === 'object' ? m._id : m;
                return memberId === userId;
            });
        }

        return false;
    });

    // Fetch deadline
    const { data: deadline } = useQuery({
        queryKey: ['submissionDeadline'],
        queryFn: submissionService.getDeadline
    });

    // Fetch team submissions
    const { data: submissions = [], isLoading: loadingSubmissions } = useQuery({
        queryKey: ['teamSubmissions', myTeam?._id],
        queryFn: () => submissionService.getTeamSubmissions(myTeam!._id),
        enabled: !!myTeam?._id
    });

    // Create submission mutation
    const createMutation = useMutation({
        mutationFn: submissionService.createSubmission,
        onSuccess: () => {
            toast.success('Project submitted successfully!');
            queryClient.invalidateQueries({ queryKey: ['teamSubmissions'] });
            setRepoUrl('');
            setNotes('');
            setFileUrls([]);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to submit project');
        }
    });

    // Calculate time remaining
    const [timeRemaining, setTimeRemaining] = useState<string>('');
    const [isDeadlinePassed, setIsDeadlinePassed] = useState(false);

    useEffect(() => {
        if (!deadline?.deadline || !deadline?.isActive) return;

        const updateTimer = () => {
            const now = new Date().getTime();
            const target = new Date(deadline.deadline).getTime();
            const diff = target - now;

            if (diff <= 0) {
                setTimeRemaining('Deadline Passed');
                setIsDeadlinePassed(true);
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeRemaining(`${days}d ${hours}h ${minutes}m ${seconds}s`);
            setIsDeadlinePassed(false);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [deadline]);

    // Add file URL
    const handleAddFile = () => {
        if (!newFileUrl.trim()) {
            toast.error('Please enter a file URL');
            return;
        }
        if (!/^https?:\/\/.+/.test(newFileUrl)) {
            toast.error('Please enter a valid URL');
            return;
        }
        setFileUrls([...fileUrls, {
            url: newFileUrl.trim(),
            filename: newFileName.trim() || newFileUrl.split('/').pop() || 'file'
        }]);
        setNewFileUrl('');
        setNewFileName('');
    };

    // Remove file URL
    const handleRemoveFile = (index: number) => {
        setFileUrls(fileUrls.filter((_, i) => i !== index));
    };

    // Submit project
    const handleSubmit = () => {
        if (!myTeam) {
            toast.error('You must be part of an approved team to submit');
            return;
        }
        if (myTeam.status !== 'approved') {
            toast.error('Your team must be approved to submit');
            return;
        }
        if (!repoUrl && fileUrls.length === 0) {
            toast.error('Please provide at least a repository URL or file links');
            return;
        }
        if (repoUrl && !/^https?:\/\/(github\.com|gitlab\.com|bitbucket\.org)/.test(repoUrl)) {
            toast.error('Please enter a valid GitHub, GitLab, or Bitbucket URL');
            return;
        }

        createMutation.mutate({
            teamId: myTeam._id,
            repoUrl: repoUrl || undefined,
            files: fileUrls,
            notes: notes || undefined
        });
    };

    // Get latest submission
    const latestSubmission = submissions[0];
    const isLocked = latestSubmission?.status === 'locked';

    // Status badge helper
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'submitted':
                return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" /> Submitted</Badge>;
            case 'updated':
                return <Badge className="bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" /> Updated</Badge>;
            case 'locked':
                return <Badge className="bg-gray-100 text-gray-800"><Lock className="w-3 h-3 mr-1" /> Locked</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    // Check if user is team leader
    const isTeamLeader = (() => {
        if (!myTeam || !user) return false;
        const userId = user.id || (user as any)?._id;
        const leaderId = typeof myTeam.leaderId === 'object' ? (myTeam as any).leaderId?._id : myTeam.leaderId;
        return leaderId === userId;
    })();

    const canSubmit = myTeam?.status === 'approved' && !isDeadlinePassed && !isLocked && isTeamLeader;

    return (
        <DashboardLayout role="student">
            <div className="space-y-6 animate-fade-in">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Project Submission</h2>
                    <p className="text-muted-foreground">Submit your project files and repository links.</p>
                </div>

                {/* Deadline Banner */}
                {deadline?.isActive && (
                    <Card className={`border-2 ${isDeadlinePassed ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'}`}>
                        <CardContent className="py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {isDeadlinePassed ? (
                                        <AlertCircle className="h-6 w-6 text-red-500" />
                                    ) : (
                                        <Clock className="h-6 w-6 text-green-600" />
                                    )}
                                    <div>
                                        <p className="font-semibold">
                                            {isDeadlinePassed ? 'Submission Closed' : 'Submission Deadline'}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(deadline.deadline).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                <div className={`text-2xl font-bold ${isDeadlinePassed ? 'text-red-600' : 'text-green-600'}`}>
                                    {timeRemaining}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Team Status Warning */}
                {myTeam && myTeam.status !== 'approved' && (
                    <Card className="border-amber-500 bg-amber-50">
                        <CardContent className="py-4">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="h-5 w-5 text-amber-600" />
                                <p className="text-amber-800">
                                    Your team must be approved before you can submit. Current status: <strong>{myTeam.status}</strong>
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* No Team Warning */}
                {!myTeam && (
                    <Card className="border-amber-500 bg-amber-50">
                        <CardContent className="py-4">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="h-5 w-5 text-amber-600" />
                                <p className="text-amber-800">
                                    You are not part of any team. Please join or create a team first.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Not Team Leader Warning */}
                {myTeam && !isTeamLeader && (
                    <Card className="border-blue-500 bg-blue-50">
                        <CardContent className="py-4">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="h-5 w-5 text-blue-600" />
                                <p className="text-blue-800">
                                    Only the <strong>Team Leader</strong> can submit projects. Please contact your team leader to submit.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Submission Form */}
                <Card className={!canSubmit ? 'opacity-60' : ''}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Paperclip className="h-5 w-5" />
                            {latestSubmission ? 'Update Submission' : 'Submit Your Project'}
                        </CardTitle>
                        <CardDescription>
                            {latestSubmission
                                ? `Current version: ${latestSubmission.version}. Submitting will create version ${latestSubmission.version + 1}.`
                                : 'Provide your project repository and file links.'
                            }
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Repository URL */}
                        <div className="space-y-2">
                            <Label htmlFor="repoUrl" className="flex items-center gap-2">
                                <Github className="h-4 w-4" />
                                Repository URL (GitHub / GitLab / Bitbucket)
                            </Label>
                            <Input
                                id="repoUrl"
                                placeholder="https://github.com/your-username/your-project"
                                value={repoUrl}
                                onChange={(e) => setRepoUrl(e.target.value)}
                                disabled={!canSubmit}
                            />
                        </div>

                        {/* File URLs */}
                        <div className="space-y-3">
                            <Label className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Additional File Links (Google Drive, Dropbox, etc.)
                            </Label>

                            {/* Existing files */}
                            {fileUrls.length > 0 && (
                                <div className="space-y-2">
                                    {fileUrls.map((file, index) => (
                                        <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                            <span className="flex-1 text-sm truncate">{file.filename}</span>
                                            <a
                                                href={file.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary hover:underline"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                            </a>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemoveFile(index)}
                                                disabled={!canSubmit}
                                            >
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Add new file */}
                            <div className="flex gap-2">
                                <Input
                                    placeholder="File URL (https://...)"
                                    value={newFileUrl}
                                    onChange={(e) => setNewFileUrl(e.target.value)}
                                    disabled={!canSubmit}
                                    className="flex-1"
                                />
                                <Input
                                    placeholder="File name (optional)"
                                    value={newFileName}
                                    onChange={(e) => setNewFileName(e.target.value)}
                                    disabled={!canSubmit}
                                    className="w-40"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleAddFile}
                                    disabled={!canSubmit}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                            <Label htmlFor="notes">Additional Notes</Label>
                            <Textarea
                                id="notes"
                                placeholder="Describe your solution, technologies used, or any special instructions..."
                                className="min-h-[120px]"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                disabled={!canSubmit}
                                maxLength={2000}
                            />
                            <p className="text-xs text-muted-foreground text-right">{notes.length}/2000</p>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button
                            className="w-full"
                            onClick={handleSubmit}
                            disabled={!canSubmit || createMutation.isPending}
                        >
                            {createMutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Upload className="mr-2 h-4 w-4" />
                                    {latestSubmission ? 'Update Submission' : 'Submit Project'}
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </Card>

                {/* Submission History */}
                {
                    loadingSubmissions ? (
                        <Card>
                            <CardContent className="py-8 flex justify-center">
                                <Loader2 className="h-6 w-6 animate-spin" />
                            </CardContent>
                        </Card>
                    ) : submissions.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Submission History</CardTitle>
                                <CardDescription>View your previous submissions and feedback.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {submissions.map((sub: any, i: number) => (
                                        <div key={sub._id} className="border rounded-lg p-4 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-lg font-semibold">Version {sub.version}</span>
                                                    {getStatusBadge(sub.status)}
                                                    {sub.isFinal && (
                                                        <Badge className="bg-purple-100 text-purple-800">Final</Badge>
                                                    )}
                                                </div>
                                                <span className="text-sm text-muted-foreground">
                                                    {new Date(sub.createdAt).toLocaleString()}
                                                </span>
                                            </div>

                                            <div className="grid gap-2 text-sm">
                                                {sub.repoUrl && (
                                                    <div className="flex items-center gap-2">
                                                        <Github className="h-4 w-4" />
                                                        <a
                                                            href={sub.repoUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-primary hover:underline"
                                                        >
                                                            {sub.repoUrl}
                                                        </a>
                                                    </div>
                                                )}

                                                {sub.files?.length > 0 && (
                                                    <div className="flex flex-wrap gap-2">
                                                        {sub.files.map((file: any, fi: number) => (
                                                            <a
                                                                key={fi}
                                                                href={file.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded text-xs hover:bg-muted/80"
                                                            >
                                                                <FileText className="h-3 w-3" />
                                                                {file.filename || 'File'}
                                                                <ExternalLink className="h-3 w-3" />
                                                            </a>
                                                        ))}
                                                    </div>
                                                )}

                                                {sub.notes && (
                                                    <p className="text-muted-foreground mt-2">{sub.notes}</p>
                                                )}
                                            </div>

                                            {/* Feedback Section */}
                                            {(sub.score !== undefined || sub.feedback) && (
                                                <div className="mt-3 p-3 bg-blue-50 rounded-md">
                                                    <p className="text-sm font-medium text-blue-800">Judge Feedback</p>
                                                    {sub.score !== undefined && (
                                                        <p className="text-sm">Score: <strong>{sub.score}/100</strong></p>
                                                    )}
                                                    {sub.feedback && (
                                                        <p className="text-sm text-muted-foreground mt-1">{sub.feedback}</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )
                }
            </div >
        </DashboardLayout >
    );
};

export default StudentSubmissionPage;
