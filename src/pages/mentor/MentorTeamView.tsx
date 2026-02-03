import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    ArrowLeft,
    Users,
    MessageSquare,
    CheckCircle,
    Clock,
    AlertCircle,
    Loader2,
    Send,
    User,
    FileText,
    Target
} from 'lucide-react';
import { getTeamDetails } from '@/services/mentorService';
import { submitFeedback } from '@/services/feedbackService';
import { toast } from 'sonner';
import { format } from 'date-fns';
import type { MentorFeedback } from '@/types/mentor';

const MentorTeamView = () => {
    const { teamId } = useParams<{ teamId: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [showFeedbackForm, setShowFeedbackForm] = useState(false);
    const [selectedPhase, setSelectedPhase] = useState<string>('ideation');
    const [selectedStatus, setSelectedStatus] = useState<string>('pending');
    const [feedbackText, setFeedbackText] = useState('');

    // Fetch team details
    const { data, isLoading, error } = useQuery({
        queryKey: ['mentorTeamDetails', teamId],
        queryFn: () => getTeamDetails(teamId!),
        enabled: !!teamId
    });

    const team = data?.team;
    const feedback = data?.feedback || [];

    // Submit feedback mutation
    const submitFeedbackMutation = useMutation({
        mutationFn: submitFeedback,
        onSuccess: () => {
            toast.success('Feedback submitted successfully');
            queryClient.invalidateQueries({ queryKey: ['mentorTeamDetails', teamId] });
            queryClient.invalidateQueries({ queryKey: ['mentorTeams'] });
            queryClient.invalidateQueries({ queryKey: ['mentorStats'] });
            setShowFeedbackForm(false);
            setFeedbackText('');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to submit feedback');
        }
    });

    const handleSubmitFeedback = () => {
        if (!feedbackText.trim()) {
            toast.error('Please enter feedback');
            return;
        }

        submitFeedbackMutation.mutate({
            teamId: teamId!,
            phase: selectedPhase as any,
            status: selectedStatus as any,
            feedback: feedbackText
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" /> Approved</Badge>;
            case 'changes-required':
                return <Badge className="bg-amber-100 text-amber-800"><AlertCircle className="w-3 h-3 mr-1" /> Changes Required</Badge>;
            default:
                return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
        }
    };

    const getPhaseBadge = (phase: string) => {
        const colors: Record<string, string> = {
            ideation: 'bg-blue-100 text-blue-800',
            prototype: 'bg-purple-100 text-purple-800',
            development: 'bg-orange-100 text-orange-800',
            final: 'bg-green-100 text-green-800'
        };
        return <Badge className={colors[phase] || 'bg-gray-100'}>{phase}</Badge>;
    };

    if (isLoading) {
        return (
            <DashboardLayout role="mentor">
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            </DashboardLayout>
        );
    }

    if (error || !team) {
        return (
            <DashboardLayout role="mentor">
                <div className="text-center py-12">
                    <p className="text-red-500">Failed to load team details</p>
                    <Button onClick={() => navigate('/mentor/dashboard')} className="mt-4">
                        Go Back
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="mentor">
            <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <Button variant="ghost" onClick={() => navigate('/mentor/dashboard')} className="mb-2">
                            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
                        </Button>
                        <h2 className="text-3xl font-bold tracking-tight">{team.name}</h2>
                        <p className="text-muted-foreground">Review team progress and provide feedback</p>
                    </div>
                    <Dialog open={showFeedbackForm} onOpenChange={setShowFeedbackForm}>
                        <DialogTrigger asChild>
                            <Button>
                                <Send className="h-4 w-4 mr-2" /> Add Feedback
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                            <DialogHeader>
                                <DialogTitle>Submit Feedback</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Phase</Label>
                                        <Select value={selectedPhase} onValueChange={setSelectedPhase}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="ideation">Ideation</SelectItem>
                                                <SelectItem value="prototype">Prototype</SelectItem>
                                                <SelectItem value="development">Development</SelectItem>
                                                <SelectItem value="final">Final</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Status</Label>
                                        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="approved">Approved</SelectItem>
                                                <SelectItem value="changes-required">Changes Required</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Feedback</Label>
                                    <Textarea
                                        placeholder="Enter your feedback for the team..."
                                        value={feedbackText}
                                        onChange={(e) => setFeedbackText(e.target.value)}
                                        rows={5}
                                    />
                                </div>
                                <Button
                                    onClick={handleSubmitFeedback}
                                    className="w-full"
                                    disabled={submitFeedbackMutation.isPending}
                                >
                                    {submitFeedbackMutation.isPending ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : (
                                        <Send className="h-4 w-4 mr-2" />
                                    )}
                                    Submit Feedback
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Team Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" /> Team Info
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Team Leader</p>
                                <p className="font-medium">{team.leaderId?.name || 'N/A'}</p>
                                <p className="text-sm text-muted-foreground">{team.leaderId?.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Members ({team.members?.length || 0})</p>
                                <div className="space-y-1 mt-1">
                                    {team.members?.map((member: any) => (
                                        <div key={member._id} className="flex items-center gap-2">
                                            <User className="h-3 w-3 text-muted-foreground" />
                                            <span className="text-sm">{member.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Problem Statement */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="h-5 w-5" /> Problem Statement
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {team.problemId ? (
                                <div className="space-y-2">
                                    <p className="font-medium">{team.problemId.title}</p>
                                    <Badge variant="outline">{team.problemId.category}</Badge>
                                    {team.problemId.description && (
                                        <p className="text-sm text-muted-foreground mt-2 line-clamp-4">
                                            {team.problemId.description}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <p className="text-muted-foreground">No problem selected</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Phase Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5" /> Phase Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span>Ideation</span>
                                {getStatusBadge(team.phases?.ideation || 'pending')}
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Prototype</span>
                                {getStatusBadge(team.phases?.prototype || 'pending')}
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Development</span>
                                {getStatusBadge(team.phases?.development || 'pending')}
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Final</span>
                                {getStatusBadge(team.phases?.final || 'pending')}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Feedback Timeline */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5" /> Feedback History
                        </CardTitle>
                        <CardDescription>
                            All feedback provided to this team
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {feedback.length > 0 ? (
                            <div className="space-y-4">
                                {feedback.map((fb: MentorFeedback) => (
                                    <div key={fb._id} className="border rounded-lg p-4 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                {getPhaseBadge(fb.phase)}
                                                {getStatusBadge(fb.status)}
                                            </div>
                                            <span className="text-sm text-muted-foreground">
                                                {format(new Date(fb.createdAt), 'MMM d, yyyy h:mm a')}
                                            </span>
                                        </div>
                                        <p className="text-sm">{fb.feedback}</p>
                                        <p className="text-xs text-muted-foreground">
                                            By: {typeof fb.mentorId === 'object' ? fb.mentorId.name : 'Mentor'}
                                        </p>

                                        {/* Replies */}
                                        {fb.replies && fb.replies.length > 0 && (
                                            <div className="mt-3 pl-4 border-l-2 border-muted space-y-2">
                                                {fb.replies.map((reply: any, index: number) => (
                                                    <div key={index} className="bg-muted/30 p-2 rounded text-sm">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <span className="font-medium text-xs flex items-center gap-1">
                                                                <User className="h-3 w-3" />
                                                                {reply.userId?.name || 'User'}
                                                            </span>
                                                            <span className="text-[10px] text-muted-foreground">
                                                                {format(new Date(reply.createdAt), 'MMM d, h:mm a')}
                                                            </span>
                                                        </div>
                                                        <p className="text-muted-foreground">{reply.message}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No feedback yet</p>
                                <p className="text-sm">Click "Add Feedback" to provide your first review</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default MentorTeamView;
