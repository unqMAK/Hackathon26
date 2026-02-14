import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
    Loader2,
    Lightbulb,
    Youtube,
    FileUp,
    Info,
    XCircle
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
    problemId?: any;
}

const StudentSubmissionPage = () => {
    const queryClient = useQueryClient();
    const user = getCurrentUser();

    // ==================== COMMON STATE ====================
    const [repoUrl, setRepoUrl] = useState('');
    const [notes, setNotes] = useState('');
    const [fileUrls, setFileUrls] = useState<{ url: string; filename: string }[]>([]);
    const [newFileUrl, setNewFileUrl] = useState('');
    const [newFileName, setNewFileName] = useState('');

    // ==================== IDEA SUBMISSION STATE ====================
    const [youtubeLink, setYoutubeLink] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [confirmText, setConfirmText] = useState('');

    // Fetch user's team
    const { data: teams = [] } = useQuery<Team[]>({
        queryKey: ['userTeams'],
        queryFn: async () => {
            const res = await api.get('/teams');
            return res.data;
        }
    });

    // Find user's team
    const myTeam = teams.find((t: any) => {
        const userId = user?.id || (user as any)?._id;
        if (!userId) return false;
        const leaderId = typeof t.leaderId === 'object' ? t.leaderId?._id : t.leaderId;
        if (leaderId === userId) return true;
        if (t.members && Array.isArray(t.members)) {
            return t.members.some((m: any) => {
                const memberId = typeof m === 'object' ? m._id : m;
                return memberId === userId;
            });
        }
        return false;
    });

    // Check if user is team leader
    const isTeamLeader = (() => {
        if (!myTeam || !user) return false;
        const userId = user.id || (user as any)?._id;
        const leaderId = typeof myTeam.leaderId === 'object' ? (myTeam as any).leaderId?._id : myTeam.leaderId;
        return leaderId === userId;
    })();

    // ==================== PROJECT SUBMISSION HOOKS ====================

    const { data: deadline } = useQuery({
        queryKey: ['submissionDeadline'],
        queryFn: submissionService.getDeadline
    });

    const { data: submissions = [], isLoading: loadingSubmissions } = useQuery({
        queryKey: ['teamSubmissions', myTeam?._id],
        queryFn: () => submissionService.getTeamSubmissions(myTeam!._id),
        enabled: !!myTeam?._id
    });

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

    // ==================== IDEA SUBMISSION HOOKS ====================

    const { data: ideaData, isLoading: loadingIdea } = useQuery({
        queryKey: ['ideaSubmission', myTeam?._id],
        queryFn: async () => {
            const res = await api.get('/idea-submissions/my');
            return res.data;
        },
        enabled: !!myTeam?._id
    });

    const { data: submissionWindowData } = useQuery({
        queryKey: ['submissionWindowStatus'],
        queryFn: async () => {
            const res = await api.get('/idea-submissions/submission-status');
            return res.data;
        }
    });
    const isSubmissionPortalOpen = submissionWindowData?.isOpen !== false;

    const ideaSubmission = ideaData?.submission;

    const ideaMutation = useMutation({
        mutationFn: async (formData: FormData) => {
            const res = await api.post('/idea-submissions', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return res.data;
        },
        onSuccess: () => {
            toast.success('Idea submitted successfully! This submission is final and cannot be modified.');
            queryClient.invalidateQueries({ queryKey: ['ideaSubmission'] });
            setYoutubeLink('');
            setSelectedFile(null);
            setShowConfirmDialog(false);
            setConfirmText('');
            if (fileInputRef.current) fileInputRef.current.value = '';
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to submit idea');
            setShowConfirmDialog(false);
            setConfirmText('');
        }
    });

    // ==================== TIMERS ====================

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

    // ==================== PROJECT HANDLERS ====================

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

    const handleRemoveFile = (index: number) => {
        setFileUrls(fileUrls.filter((_, i) => i !== index));
    };

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

    // ==================== IDEA HANDLERS ====================

    const handleIdeaSubmit = () => {
        if (!myTeam || myTeam.status !== 'approved') {
            toast.error('Your team must be approved');
            return;
        }
        if (!isTeamLeader) {
            toast.error('Only the team leader can submit');
            return;
        }
        if (ideaSubmission) {
            toast.error('Your team has already submitted. Submissions cannot be modified.');
            return;
        }
        if (!selectedFile) {
            toast.error('Please select a document to upload');
            return;
        }
        if (!youtubeLink.trim()) {
            toast.error('Please enter a YouTube video link');
            return;
        }
        if (!/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)/.test(youtubeLink)) {
            toast.error('Please enter a valid YouTube link');
            return;
        }

        // Open confirmation dialog instead of submitting directly
        setConfirmText('');
        setShowConfirmDialog(true);
    };

    const handleConfirmIdeaSubmit = () => {
        if (confirmText !== 'Confirm') {
            toast.error('Please type "Confirm" exactly to proceed');
            return;
        }
        const formData = new FormData();
        if (selectedFile) {
            formData.append('document', selectedFile);
        }
        formData.append('youtubeVideoLink', youtubeLink.trim());
        ideaMutation.mutate(formData);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (ext !== 'doc' && ext !== 'docx') {
            toast.error('Only .doc and .docx files are allowed');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            toast.error('File size must be less than 10MB');
            return;
        }
        setSelectedFile(file);
    };

    // ==================== HELPERS ====================

    const latestSubmission = submissions[0];
    const isLocked = latestSubmission?.status === 'locked';
    const canSubmit = myTeam?.status === 'approved' && !isDeadlinePassed && !isLocked && isTeamLeader;
    const canSubmitIdea = myTeam?.status === 'approved' && isTeamLeader && !ideaSubmission;

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

    const getIdeaStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge className="bg-amber-100 text-amber-800 border-amber-300"><Clock className="w-3 h-3 mr-1" /> Under Review</Badge>;
            case 'approved':
                return <Badge className="bg-green-100 text-green-800 border-green-300"><CheckCircle className="w-3 h-3 mr-1" /> Approved</Badge>;
            case 'rejected':
                return <Badge className="bg-red-100 text-red-800 border-red-300"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <DashboardLayout role="student">
            <div className="space-y-6 animate-fade-in">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Submissions</h2>
                    <p className="text-muted-foreground">Submit your idea document and project files.</p>
                </div>

                {/* Common Warnings */}
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

                {myTeam && !isTeamLeader && (
                    <Card className="border-blue-500 bg-blue-50">
                        <CardContent className="py-4">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="h-5 w-5 text-blue-600" />
                                <p className="text-blue-800">
                                    Only the <strong>Team Leader</strong> can submit. Please contact your team leader.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* ==================== TABS ==================== */}
                <Tabs defaultValue="idea" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="idea" className="flex items-center gap-2">
                            <Lightbulb className="h-4 w-4" />
                            Idea Submission
                        </TabsTrigger>
                        <TabsTrigger value="project" className="flex items-center gap-2">
                            <Paperclip className="h-4 w-4" />
                            Project Submission
                        </TabsTrigger>
                    </TabsList>

                    {/* ==================== IDEA SUBMISSION TAB ==================== */}
                    <TabsContent value="idea" className="space-y-6">
                        {/* Instructions Card */}
                        <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-purple-800">
                                    <Info className="h-5 w-5" />
                                    Idea Submission Instructions
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4 text-sm">
                                    <div>
                                        <h4 className="font-semibold text-purple-800 mb-2">📄 Problem Statement & Proposed Solution Document</h4>
                                        <p className="text-muted-foreground mb-2">For your chosen problem statement:</p>
                                        <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-2">
                                            <li>Clearly define the problem</li>
                                            <li>Provide a detailed proposed solution</li>
                                        </ol>
                                    </div>

                                    <div className="bg-white/60 rounded-lg p-3 border border-purple-100">
                                        <p className="font-medium text-purple-700 mb-1">📌 Instructions:</p>
                                        <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-2">
                                            <li>Use the official template shared on your registered email</li>
                                            <li>Submit the document in <strong>.doc</strong> or <strong>.docx</strong> format only</li>
                                            <li>Ensure your content is clear, structured, and concise</li>
                                        </ol>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold text-purple-800 mb-2">🎬 Video Description</h4>
                                        <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                                            <li>Describe the problem and solution in a video</li>
                                            <li><strong>Maximum duration: 10 minutes</strong></li>
                                            <li>Upload to YouTube and share the link</li>
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Existing Submission Status */}
                        {ideaSubmission && (
                            <Card className={`border-2 ${ideaSubmission.status === 'approved' ? 'border-green-300 bg-green-50' :
                                ideaSubmission.status === 'rejected' ? 'border-red-300 bg-red-50' :
                                    'border-amber-300 bg-amber-50'
                                }`}>
                                <CardContent className="py-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {ideaSubmission.status === 'approved' ? (
                                                <CheckCircle className="h-6 w-6 text-green-600" />
                                            ) : ideaSubmission.status === 'rejected' ? (
                                                <XCircle className="h-6 w-6 text-red-600" />
                                            ) : (
                                                <Clock className="h-6 w-6 text-amber-600" />
                                            )}
                                            <div>
                                                <p className="font-semibold">
                                                    {ideaSubmission.status === 'approved' ? 'Your idea has been approved! 🎉' :
                                                        ideaSubmission.status === 'rejected' ? 'Your idea needs revision' :
                                                            'Your idea is under review'}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    Submitted: {new Date(ideaSubmission.createdAt).toLocaleString()}
                                                </p>
                                                {ideaSubmission.reviewNote && (
                                                    <p className="text-sm mt-1"><strong>Reviewer Note:</strong> {ideaSubmission.reviewNote}</p>
                                                )}
                                            </div>
                                        </div>
                                        {getIdeaStatusBadge(ideaSubmission.status)}
                                    </div>
                                    <div className="mt-3 flex flex-wrap gap-2 text-sm text-muted-foreground">
                                        <span className="inline-flex items-center gap-1"><FileText className="h-3 w-3" /> {ideaSubmission.documentOriginalName}</span>
                                        <span className="inline-flex items-center gap-1"><Youtube className="h-3 w-3" /> YouTube link submitted</span>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Idea Submission Form — ONLY show if not yet submitted */}
                        {!isSubmissionPortalOpen && !ideaSubmission ? (
                            <Card className="border-2 border-red-300 bg-red-50">
                                <CardContent className="py-8 text-center">
                                    <XCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
                                    <h3 className="text-lg font-semibold text-red-800">Submission Portal Closed</h3>
                                    <p className="text-sm text-red-600 mt-1">The idea submission portal is currently closed. Please contact your SPOC or admin for more information.</p>
                                </CardContent>
                            </Card>
                        ) : !ideaSubmission ? (
                            <Card className={(!canSubmitIdea) ? 'opacity-60' : ''}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Lightbulb className="h-5 w-5" />
                                        Submit Your Idea
                                    </CardTitle>
                                    <CardDescription>
                                        Upload your solution document and share your YouTube video link.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Document Upload */}
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <FileUp className="h-4 w-4" />
                                            Solution Document (.doc / .docx)
                                        </Label>
                                        <div className="flex items-center gap-3">
                                            <Input
                                                ref={fileInputRef}
                                                type="file"
                                                accept=".doc,.docx"
                                                onChange={handleFileChange}
                                                disabled={!canSubmitIdea}
                                                className="flex-1"
                                            />
                                            {selectedFile && (
                                                <Badge variant="outline" className="text-green-700 border-green-300">
                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                    {selectedFile.name}
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground">Max file size: 10MB. Only .doc and .docx formats accepted.</p>
                                    </div>

                                    {/* YouTube Link */}
                                    <div className="space-y-2">
                                        <Label htmlFor="youtubeLink" className="flex items-center gap-2">
                                            <Youtube className="h-4 w-4 text-red-500" />
                                            YouTube Video Link
                                        </Label>
                                        <Input
                                            id="youtubeLink"
                                            placeholder="https://www.youtube.com/watch?v=..."
                                            value={youtubeLink}
                                            onChange={(e) => setYoutubeLink(e.target.value)}
                                            disabled={!canSubmitIdea}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Upload your video to YouTube (max 10 minutes) and paste the link here.
                                        </p>
                                    </div>

                                    {/* Warning Banner */}
                                    <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                                        <div className="flex items-start gap-2">
                                            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="font-semibold text-red-800 text-sm">⚠️ One-Time Submission Only</p>
                                                <p className="text-xs text-red-700 mt-1">
                                                    Once submitted, your idea <strong>cannot be modified or re-submitted</strong>.
                                                    Please double-check your document and YouTube link before submitting.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        className="w-full bg-purple-600 hover:bg-purple-700"
                                        onClick={handleIdeaSubmit}
                                        disabled={!canSubmitIdea || ideaMutation.isPending}
                                    >
                                        {ideaMutation.isPending ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Uploading...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="mr-2 h-4 w-4" />
                                                Submit Idea
                                            </>
                                        )}
                                    </Button>
                                </CardFooter>
                            </Card>
                        ) : (
                            <Card className="border-2 border-gray-300">
                                <CardContent className="py-6 text-center">
                                    <Lock className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                                    <p className="font-semibold text-lg">Submission Locked</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Your idea has been submitted and cannot be modified.
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Confirmation Dialog */}
                        <Dialog open={showConfirmDialog} onOpenChange={(open) => { setShowConfirmDialog(open); if (!open) setConfirmText(''); }}>
                            <DialogContent className="max-w-md">
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2 text-red-700">
                                        <AlertCircle className="h-5 w-5" />
                                        Confirm Your Submission
                                    </DialogTitle>
                                    <DialogDescription>
                                        <span className="block mt-2 text-red-600 font-semibold">
                                            ⚠️ This action cannot be undone!
                                        </span>
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-4 py-2">
                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                        <p className="text-sm text-amber-800">
                                            Please cross-check the following before submitting:
                                        </p>
                                        <ul className="text-sm text-amber-700 list-disc list-inside mt-2 space-y-1">
                                            <li>Your document is complete and uses the official template</li>
                                            <li>You've uploaded the correct .doc/.docx file</li>
                                            <li>Your YouTube video link is correct and accessible</li>
                                            <li>Video duration is within 10 minutes</li>
                                        </ul>
                                    </div>

                                    <div className="bg-gray-50 border rounded-lg p-3">
                                        <p className="text-sm mb-1"><strong>Document:</strong> {selectedFile?.name}</p>
                                        <p className="text-sm"><strong>YouTube:</strong> {youtubeLink}</p>
                                    </div>

                                    <div>
                                        <Label className="text-sm font-semibold">Type <span className="text-red-600">Confirm</span> to submit</Label>
                                        <Input
                                            placeholder="Type 'Confirm' here"
                                            value={confirmText}
                                            onChange={(e) => setConfirmText(e.target.value)}
                                            className="mt-1"
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <DialogFooter className="flex gap-2">
                                    <Button variant="outline" onClick={() => { setShowConfirmDialog(false); setConfirmText(''); }}>
                                        Go Back & Review
                                    </Button>
                                    <Button
                                        className="bg-red-600 hover:bg-red-700 text-white"
                                        onClick={handleConfirmIdeaSubmit}
                                        disabled={confirmText !== 'Confirm' || ideaMutation.isPending}
                                    >
                                        {ideaMutation.isPending ? (
                                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
                                        ) : (
                                            'Submit — I Understand'
                                        )}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </TabsContent>

                    {/* ==================== PROJECT SUBMISSION TAB ==================== */}
                    <TabsContent value="project" className="space-y-6">
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
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
};

export default StudentSubmissionPage;
