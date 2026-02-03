import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Eye,
    EyeOff,
    Loader2,
    AlertCircle,
    CheckCircle
} from 'lucide-react';
import { evaluationService } from '@/services/evaluationService';
import { toast } from 'sonner';

const AdminResultsSettings = () => {
    const queryClient = useQueryClient();

    // Fetch current publish status
    const { data: status, isLoading } = useQuery({
        queryKey: ['resultsPublishStatus'],
        queryFn: evaluationService.getResultsPublishStatus
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: ({ published }: { published: boolean }) =>
            evaluationService.updateResultsPublishStatus(published),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['resultsPublishStatus'] });
            queryClient.invalidateQueries({ queryKey: ['publicLeaderboard'] });
            toast.success(data.published
                ? 'Results are now visible to all participants!'
                : 'Results have been hidden from participants.');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update settings');
        }
    });

    const handleToggle = (checked: boolean) => {
        updateMutation.mutate({ published: checked });
    };

    return (
        <DashboardLayout role="admin">
            <div className="space-y-6 animate-fade-in max-w-2xl">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Results Settings</h2>
                    <p className="text-muted-foreground">
                        Control when participants can view evaluation results.
                    </p>
                </div>

                {/* Status Banner */}
                <Card className={status?.published
                    ? 'border-green-500 bg-green-50'
                    : 'border-amber-500 bg-amber-50'
                }>
                    <CardContent className="py-6">
                        <div className="flex items-center gap-4">
                            {status?.published ? (
                                <>
                                    <div className="p-3 rounded-full bg-green-100">
                                        <Eye className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-green-800">Results are Published</h3>
                                        <p className="text-sm text-green-700">
                                            All participants can view leaderboard and their scores.
                                        </p>
                                        {status.publishedAt && (
                                            <p className="text-xs text-green-600 mt-1">
                                                Published on: {new Date(status.publishedAt).toLocaleString()}
                                            </p>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="p-3 rounded-full bg-amber-100">
                                        <EyeOff className="h-6 w-6 text-amber-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-amber-800">Results are Hidden</h3>
                                        <p className="text-sm text-amber-700">
                                            Participants cannot view the leaderboard or their scores yet.
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Toggle Control */}
                <Card>
                    <CardHeader>
                        <CardTitle>Publish Results</CardTitle>
                        <CardDescription>
                            Toggle this switch to make results visible to all participants.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex items-center justify-center py-4">
                                <Loader2 className="h-6 w-6 animate-spin" />
                            </div>
                        ) : (
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    {status?.published ? (
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                    ) : (
                                        <AlertCircle className="h-5 w-5 text-amber-500" />
                                    )}
                                    <div>
                                        <Label htmlFor="publish-toggle" className="text-base cursor-pointer">
                                            {status?.published ? 'Results Published' : 'Results Hidden'}
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            {status?.published
                                                ? 'Click to hide results from participants'
                                                : 'Click to publish results to participants'
                                            }
                                        </p>
                                    </div>
                                </div>
                                <Switch
                                    id="publish-toggle"
                                    checked={status?.published || false}
                                    onCheckedChange={handleToggle}
                                    disabled={updateMutation.isPending}
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* What happens info */}
                <Card>
                    <CardHeader>
                        <CardTitle>What happens when results are published?</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-start gap-3">
                            <Badge variant="outline" className="mt-0.5">1</Badge>
                            <p className="text-sm">
                                <strong>Leaderboard becomes visible</strong> - The public leaderboard page will display all team rankings.
                            </p>
                        </div>
                        <div className="flex items-start gap-3">
                            <Badge variant="outline" className="mt-0.5">2</Badge>
                            <p className="text-sm">
                                <strong>Students can see their scores</strong> - Each student can view their team's average score and ranking.
                            </p>
                        </div>
                        <div className="flex items-start gap-3">
                            <Badge variant="outline" className="mt-0.5">3</Badge>
                            <p className="text-sm">
                                <strong>Real-time update</strong> - Changes apply immediately across all user sessions.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default AdminResultsSettings;
