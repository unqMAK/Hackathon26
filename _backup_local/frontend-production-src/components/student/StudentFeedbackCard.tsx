import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, CheckCircle, Clock, AlertCircle, Loader2, Send, User } from 'lucide-react';
import { getTeamFeedback, addReply } from '@/services/feedbackService';
import { format } from 'date-fns';
import { Team } from '@/types/team';
import { toast } from 'sonner';

interface StudentFeedbackCardProps {
    team: Team;
}

const StudentFeedbackCard = ({ team }: StudentFeedbackCardProps) => {
    const queryClient = useQueryClient();
    const [replyText, setReplyText] = useState('');
    const [selectedFeedbackId, setSelectedFeedbackId] = useState<string | null>(null);

    const { data: feedback = [], isLoading } = useQuery({
        queryKey: ['teamFeedback', team._id],
        queryFn: () => getTeamFeedback(team._id),
        enabled: !!team._id
    });

    const latestFeedback = feedback[0];

    const replyMutation = useMutation({
        mutationFn: ({ feedbackId, message }: { feedbackId: string; message: string }) =>
            addReply(feedbackId, message),
        onSuccess: () => {
            toast.success('Reply sent successfully');
            setReplyText('');
            queryClient.invalidateQueries({ queryKey: ['teamFeedback', team._id] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to send reply');
        }
    });

    const handleSendReply = (feedbackId: string) => {
        if (!replyText.trim()) return;
        replyMutation.mutate({ feedbackId, message: replyText });
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

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Latest Feedback
                </CardTitle>
                <CardDescription>
                    Recent reviews from your mentor
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto max-h-[400px]">
                {isLoading ? (
                    <div className="flex justify-center py-6">
                        <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                ) : latestFeedback ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {getPhaseBadge(latestFeedback.phase)}
                                {getStatusBadge(latestFeedback.status)}
                            </div>
                            <span className="text-xs text-muted-foreground">
                                {format(new Date(latestFeedback.createdAt), 'MMM d')}
                            </span>
                        </div>

                        <div className="bg-muted/30 p-3 rounded-lg">
                            <p className="text-sm italic">"{latestFeedback.feedback}"</p>
                        </div>

                        <div className="text-xs text-muted-foreground text-right mb-4">
                            By {typeof latestFeedback.mentorId === 'object' ? (latestFeedback.mentorId as any).name : 'Mentor'}
                        </div>

                        {/* Replies Section */}
                        {latestFeedback.replies && latestFeedback.replies.length > 0 && (
                            <div className="space-y-3 pl-4 border-l-2 border-muted">
                                {latestFeedback.replies.map((reply: any, index: number) => (
                                    <div key={index} className="bg-background p-2 rounded border text-sm">
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

                        {/* Reply Input */}
                        <div className="flex gap-2 mt-4">
                            <Input
                                placeholder="Type a reply..."
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendReply(latestFeedback._id);
                                    }
                                }}
                            />
                            <Button
                                size="icon"
                                onClick={() => handleSendReply(latestFeedback._id)}
                                disabled={replyMutation.isPending || !replyText.trim()}
                            >
                                {replyMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-6 text-muted-foreground">
                        <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-20" />
                        <p>No feedback received yet.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default StudentFeedbackCard;
