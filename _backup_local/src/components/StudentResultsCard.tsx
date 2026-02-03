import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Trophy,
    Lock,
    Loader2,
    Medal,
    Users
} from 'lucide-react';
import { evaluationService } from '@/services/evaluationService';

const StudentResultsCard = () => {
    // Fetch student's team result
    const { data, isLoading } = useQuery({
        queryKey: ['myTeamResult'],
        queryFn: evaluationService.getMyTeamResult,
        refetchInterval: 60000 // Refresh every minute
    });

    if (isLoading) {
        return (
            <Card>
                <CardContent className="py-8 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                </CardContent>
            </Card>
        );
    }

    if (!data?.visible) {
        // Results not published
        return (
            <Card className="border-amber-300 bg-amber-50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lock className="h-5 w-5 text-amber-600" />
                        Evaluation Results
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-4">
                        <p className="text-amber-800 font-medium">Results Pending</p>
                        <p className="text-sm text-amber-700 mt-1">
                            {data?.message || 'Results will be available once published by the administrators.'}
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!data?.result) {
        // No result available
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5" />
                        Evaluation Results
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-center py-4">
                        {data?.message || 'No evaluation data available for your team.'}
                    </p>
                </CardContent>
            </Card>
        );
    }

    const { result } = data;

    return (
        <Card className="border-green-300 bg-gradient-to-r from-green-50 to-emerald-50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Your Team's Results
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Rank */}
                    <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                        <Medal className="h-6 w-6 mx-auto text-amber-500 mb-2" />
                        <p className="text-2xl font-bold text-primary">
                            #{result.rank}
                        </p>
                        <p className="text-xs text-muted-foreground">Rank</p>
                    </div>

                    {/* Score */}
                    <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                        <Trophy className="h-6 w-6 mx-auto text-yellow-500 mb-2" />
                        <p className="text-2xl font-bold text-primary">
                            {result.avgScore.toFixed(1)}
                        </p>
                        <p className="text-xs text-muted-foreground">Avg Score</p>
                    </div>

                    {/* Evaluations */}
                    <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                        <Users className="h-6 w-6 mx-auto text-blue-500 mb-2" />
                        <p className="text-2xl font-bold text-primary">
                            {result.evaluationCount}
                        </p>
                        <p className="text-xs text-muted-foreground">Judges</p>
                    </div>

                    {/* Total Teams */}
                    <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                        <Users className="h-6 w-6 mx-auto text-purple-500 mb-2" />
                        <p className="text-2xl font-bold text-primary">
                            {result.totalTeams}
                        </p>
                        <p className="text-xs text-muted-foreground">Total Teams</p>
                    </div>
                </div>

                {result.problem && (
                    <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-muted-foreground">
                            Problem: <strong>{result.problem.title}</strong>
                            {result.problem.category && (
                                <Badge variant="outline" className="ml-2">
                                    {result.problem.category}
                                </Badge>
                            )}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default StudentResultsCard;
