import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { evaluationService } from '@/services/evaluationService';
import { toast } from 'sonner';
import type { Rubric, EvaluationScore } from '@/types/evaluation';
import { api } from '@/services/api';

const EvaluateTeam = () => {
    const { teamId } = useParams<{ teamId: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [scores, setScores] = useState<Record<string, number>>({});
    const [feedback, setFeedback] = useState('');

    // Fetch team details
    const { data: team, isLoading: loadingTeam } = useQuery({
        queryKey: ['team', teamId],
        queryFn: async () => {
            const { data } = await api.get(`/teams/${teamId}`);
            return data;
        },
        enabled: !!teamId
    });

    // Fetch rubrics
    const { data: rubrics = [], isLoading: loadingRubrics } = useQuery({
        queryKey: ['rubrics'],
        queryFn: () => evaluationService.getRubrics()
    });

    // Check for existing evaluation
    const { data: existingEvaluations = [] } = useQuery({
        queryKey: ['teamEvaluations', teamId],
        queryFn: () => evaluationService.getTeamEvaluations(teamId!),
        enabled: !!teamId
    });

    const hasExistingEvaluation = existingEvaluations.length > 0;

    // Initialize scores when rubrics load
    useEffect(() => {
        if (rubrics.length > 0 && Object.keys(scores).length === 0) {
            const initialScores: Record<string, number> = {};
            rubrics.forEach((r: Rubric) => {
                initialScores[r._id] = 0;
            });
            setScores(initialScores);
        }
    }, [rubrics]);

    // Calculate live total score
    const liveTotal = useMemo(() => {
        if (rubrics.length === 0) return 0;

        let total = 0;
        rubrics.forEach((rubric: Rubric) => {
            const score = scores[rubric._id] || 0;
            total += (score / rubric.maxScore) * rubric.weight * 100;
        });
        return Math.round(total * 100) / 100;
    }, [scores, rubrics]);

    // Submit mutation
    const submitMutation = useMutation({
        mutationFn: evaluationService.submitEvaluation,
        onSuccess: () => {
            toast.success('Evaluation submitted successfully!');
            queryClient.invalidateQueries({ queryKey: ['assignedTeams'] });
            queryClient.invalidateQueries({ queryKey: ['myEvaluations'] });
            navigate('/judge/dashboard');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to submit evaluation');
        }
    });

    const handleScoreChange = (rubricId: string, value: number[]) => {
        setScores(prev => ({
            ...prev,
            [rubricId]: value[0]
        }));
    };

    const handleSubmit = () => {
        if (!teamId) return;

        const evaluationScores: EvaluationScore[] = rubrics.map((r: Rubric) => ({
            rubricId: r._id,
            score: scores[r._id] || 0
        }));

        submitMutation.mutate({
            teamId,
            scores: evaluationScores,
            feedback: feedback || undefined
        });
    };

    if (loadingTeam || loadingRubrics) {
        return (
            <DashboardLayout role="judge">
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            </DashboardLayout>
        );
    }

    if (hasExistingEvaluation) {
        return (
            <DashboardLayout role="judge">
                <div className="space-y-6 animate-fade-in">
                    <Button variant="ghost" onClick={() => navigate('/judge/dashboard')}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                    </Button>
                    <Card className="border-green-500 bg-green-50">
                        <CardContent className="py-8 text-center">
                            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-green-800">Already Evaluated</h3>
                            <p className="text-green-700 mt-2">
                                You have already submitted an evaluation for this team.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="judge">
            <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
                <div className="flex items-center justify-between">
                    <Button variant="ghost" onClick={() => navigate('/judge/dashboard')}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                    </Button>
                </div>

                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Evaluate Team</h2>
                    <p className="text-muted-foreground">
                        Team: <strong>{team?.name || 'Unknown'}</strong>
                    </p>
                </div>

                {/* Live Score Preview */}
                <Card className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
                    <CardContent className="py-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90">Calculated Total Score</p>
                                <p className="text-4xl font-bold">{liveTotal}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm opacity-90">Out of</p>
                                <p className="text-2xl font-semibold">100</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Rubric Scoring */}
                <Card>
                    <CardHeader>
                        <CardTitle>Scoring Rubrics</CardTitle>
                        <CardDescription>
                            Score each criterion. The final score is calculated based on weighted averages.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        {rubrics.map((rubric: Rubric) => (
                            <div key={rubric._id} className="space-y-4 p-4 border rounded-lg">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h4 className="font-semibold text-lg">{rubric.title}</h4>
                                        {rubric.description && (
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {rubric.description}
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <Badge variant="outline">
                                            Weight: {(rubric.weight * 100).toFixed(0)}%
                                        </Badge>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Score: <strong>{scores[rubric._id] || 0}</strong></span>
                                        <span>Max: {rubric.maxScore}</span>
                                    </div>
                                    <Slider
                                        value={[scores[rubric._id] || 0]}
                                        min={0}
                                        max={rubric.maxScore}
                                        step={1}
                                        onValueChange={(value) => handleScoreChange(rubric._id, value)}
                                        className="cursor-pointer"
                                    />
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>0</span>
                                        <span>{rubric.maxScore}</span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {rubrics.length === 0 && (
                            <div className="text-center py-8">
                                <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                                <p className="text-muted-foreground">
                                    No rubrics configured. Please contact admin.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Feedback */}
                <Card>
                    <CardHeader>
                        <CardTitle>Feedback</CardTitle>
                        <CardDescription>
                            Provide constructive feedback for the team (optional).
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            placeholder="Enter your feedback, suggestions, or comments..."
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            className="min-h-[150px]"
                            maxLength={2000}
                        />
                        <p className="text-xs text-muted-foreground text-right mt-1">
                            {feedback.length}/2000
                        </p>
                    </CardContent>
                    <CardFooter>
                        <Button
                            className="w-full"
                            size="lg"
                            onClick={handleSubmit}
                            disabled={submitMutation.isPending || rubrics.length === 0}
                        >
                            {submitMutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Send className="mr-2 h-4 w-4" />
                                    Submit Evaluation
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default EvaluateTeam;
