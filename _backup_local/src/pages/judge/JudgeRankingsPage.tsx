import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Trophy, Medal, Award, Loader2, Users, Star, TrendingUp } from 'lucide-react';
import { getMyEvaluations, getAssignedTeams } from '@/services/evaluationService';
import type { Evaluation, AssignedTeam } from '@/types/evaluation';

interface LeaderboardEntry {
    teamId: string;
    teamName: string;
    problemTitle?: string;
    totalScore: number;
    rank: number;
}

const JudgeRankingsPage = () => {
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch evaluations done by current judge
    const { data: myEvaluations = [], isLoading: loadingEvaluations } = useQuery({
        queryKey: ['myEvaluations'],
        queryFn: getMyEvaluations,
        refetchInterval: 30000 // Refresh every 30 seconds
    });

    // Fetch assigned teams
    const { data: assignedTeams = [], isLoading: loadingAssigned } = useQuery({
        queryKey: ['assignedTeams'],
        queryFn: getAssignedTeams
    });

    const isLoading = loadingEvaluations || loadingAssigned;

    // Build leaderboard from my evaluations
    const leaderboard: LeaderboardEntry[] = myEvaluations
        .map((evaluation: Evaluation) => {
            const team = typeof evaluation.teamId === 'object' ? evaluation.teamId : null;
            return {
                teamId: team?._id || String(evaluation.teamId),
                teamName: team?.name || 'Unknown Team',
                problemTitle: team?.problemId?.title || 'N/A',
                totalScore: evaluation.totalScore || 0
            };
        })
        .sort((a, b) => b.totalScore - a.totalScore)
        .map((entry, index) => ({
            ...entry,
            rank: index + 1
        }));

    // Search filter
    const filteredLeaderboard = leaderboard.filter((entry) =>
        entry.teamName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return <Trophy className="h-5 w-5 text-yellow-500" />;
            case 2:
                return <Medal className="h-5 w-5 text-gray-400" />;
            case 3:
                return <Medal className="h-5 w-5 text-amber-600" />;
            default:
                return <span className="font-bold text-lg">{rank}</span>;
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600 bg-green-50';
        if (score >= 60) return 'text-blue-600 bg-blue-50';
        if (score >= 40) return 'text-amber-600 bg-amber-50';
        return 'text-red-600 bg-red-50';
    };

    // Stats
    const evaluatedCount = myEvaluations.length;
    const assignedCount = assignedTeams.length;
    const pendingCount = assignedTeams.filter(
        (t: AssignedTeam) => !t.isEvaluated
    ).length;
    const avgScore = evaluatedCount > 0
        ? (leaderboard.reduce((sum, e) => sum + e.totalScore, 0) / evaluatedCount).toFixed(1)
        : '0';

    return (
        <DashboardLayout role="judge">
            <div className="space-y-6 animate-fade-in">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Rankings</h2>
                    <p className="text-muted-foreground">Teams ranked by your evaluation scores.</p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Assigned Teams</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{assignedCount}</div>
                            <p className="text-xs text-muted-foreground">Teams to evaluate</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">My Evaluations</CardTitle>
                            <Star className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{evaluatedCount}</div>
                            <p className="text-xs text-muted-foreground">Teams I've evaluated</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending</CardTitle>
                            <TrendingUp className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{pendingCount}</div>
                            <p className="text-xs text-muted-foreground">Remaining to evaluate</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
                            <Award className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{avgScore}</div>
                            <p className="text-xs text-muted-foreground">My avg evaluation</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Search */}
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search teams..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Leaderboard */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-yellow-500" />
                            My Evaluation Rankings
                        </CardTitle>
                        <CardDescription>
                            Teams you have evaluated, ranked by your scores
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin" />
                            </div>
                        ) : filteredLeaderboard.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[80px]">Rank</TableHead>
                                        <TableHead>Team Name</TableHead>
                                        <TableHead>Problem Statement</TableHead>
                                        <TableHead className="text-right">Score</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredLeaderboard.map((entry) => (
                                        <TableRow
                                            key={entry.teamId}
                                            className={entry.rank <= 3 ? 'bg-muted/30' : ''}
                                        >
                                            <TableCell>
                                                <div className="flex items-center justify-center w-8 h-8">
                                                    {getRankIcon(entry.rank)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {entry.teamName}
                                            </TableCell>
                                            <TableCell>
                                                {entry.problemTitle}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <span className={`px-2 py-1 rounded font-semibold ${getScoreColor(entry.totalScore)}`}>
                                                    {entry.totalScore.toFixed(1)} pts
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No evaluations yet.</p>
                                <p className="text-sm mt-2">
                                    {assignedCount > 0
                                        ? `You have ${assignedCount} teams assigned. Start evaluating to see rankings.`
                                        : 'No teams have been assigned to you yet.'}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default JudgeRankingsPage;
