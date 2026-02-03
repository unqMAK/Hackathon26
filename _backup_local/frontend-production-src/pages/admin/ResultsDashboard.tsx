import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Trophy,
    Medal,
    Download,
    Loader2,
    Search,
    Users,
    Award
} from 'lucide-react';
import { evaluationService } from '@/services/evaluationService';
import { api } from '@/services/api';
import type { LeaderboardEntry } from '@/types/evaluation';

const ResultsDashboard = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [problemFilter, setProblemFilter] = useState('all');

    // Fetch leaderboard
    const { data: leaderboard = [], isLoading } = useQuery({
        queryKey: ['finalResults'],
        queryFn: () => evaluationService.getFinalResults()
    });

    // Fetch problems for filter
    const { data: problems = [] } = useQuery({
        queryKey: ['problems'],
        queryFn: async () => {
            const { data } = await api.get('/problems');
            return data;
        }
    });

    // Filter leaderboard
    const filteredLeaderboard = leaderboard.filter((entry: LeaderboardEntry) => {
        const matchesSearch = entry.teamName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesProblem = problemFilter === 'all' ||
            (entry.problem && entry.problem._id === problemFilter);
        return matchesSearch && matchesProblem;
    });

    // Export to CSV
    const handleExportCSV = () => {
        const headers = ['Rank', 'Team Name', 'Average Score', 'Problem', 'Evaluations'];
        const rows = filteredLeaderboard.map((entry: LeaderboardEntry) => [
            entry.rank,
            entry.teamName,
            entry.avgScore.toFixed(2),
            entry.problem?.title || 'N/A',
            entry.evaluationCount
        ]);

        const csv = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hackathon-results-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return <Trophy className="h-5 w-5 text-yellow-500" />;
            case 2:
                return <Medal className="h-5 w-5 text-gray-400" />;
            case 3:
                return <Medal className="h-5 w-5 text-amber-600" />;
            default:
                return <span className="font-bold">#{rank}</span>;
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600 bg-green-100';
        if (score >= 60) return 'text-blue-600 bg-blue-100';
        if (score >= 40) return 'text-amber-600 bg-amber-100';
        return 'text-red-600 bg-red-100';
    };

    // Stats
    const avgScore = leaderboard.length > 0
        ? leaderboard.reduce((sum: number, e: LeaderboardEntry) => sum + e.avgScore, 0) / leaderboard.length
        : 0;

    const evaluatedTeams = leaderboard.filter((e: LeaderboardEntry) => e.evaluationCount > 0).length;

    return (
        <DashboardLayout role="admin">
            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Results Dashboard</h2>
                        <p className="text-muted-foreground">
                            Leaderboard based on judge evaluations.
                        </p>
                    </div>
                    <Button onClick={handleExportCSV} disabled={filteredLeaderboard.length === 0}>
                        <Download className="mr-2 h-4 w-4" />
                        Export CSV
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
                            <Users className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{leaderboard.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Evaluated</CardTitle>
                            <Award className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{evaluatedTeams}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                            <Trophy className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{avgScore.toFixed(1)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Top Score</CardTitle>
                            <Medal className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {leaderboard.length > 0 ? leaderboard[0].avgScore.toFixed(1) : 0}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex gap-4 items-center">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search teams..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Select value={problemFilter} onValueChange={setProblemFilter}>
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="Filter by problem" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Problems</SelectItem>
                                    {problems.map((problem: any) => (
                                        <SelectItem key={problem._id} value={problem._id}>
                                            {problem.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Leaderboard Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-yellow-500" />
                            Leaderboard
                        </CardTitle>
                        <CardDescription>
                            Teams ranked by average evaluation score
                        </CardDescription>
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
                                        <TableHead className="w-[80px]">Rank</TableHead>
                                        <TableHead>Team</TableHead>
                                        <TableHead>Problem</TableHead>
                                        <TableHead>Leader</TableHead>
                                        <TableHead>Evaluations</TableHead>
                                        <TableHead className="text-right">Score</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredLeaderboard.map((entry: LeaderboardEntry) => (
                                        <TableRow
                                            key={entry.teamId}
                                            className={entry.rank <= 3 ? 'bg-muted/30' : ''}
                                        >
                                            <TableCell className="font-bold">
                                                <div className="flex items-center gap-2">
                                                    {getRankIcon(entry.rank)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {entry.teamName}
                                            </TableCell>
                                            <TableCell>
                                                {entry.problem?.title || 'N/A'}
                                                {entry.problem?.category && (
                                                    <Badge variant="outline" className="ml-2 text-xs">
                                                        {entry.problem.category}
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {entry.leader?.name || 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                {entry.evaluationCount > 0 ? (
                                                    <Badge variant="secondary">
                                                        {entry.evaluationCount} judge{entry.evaluationCount > 1 ? 's' : ''}
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline">Pending</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {entry.evaluationCount > 0 ? (
                                                    <Badge className={`text-lg px-3 ${getScoreColor(entry.avgScore)}`}>
                                                        {entry.avgScore.toFixed(1)}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {filteredLeaderboard.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8">
                                                {isLoading ? 'Loading...' : 'No teams found.'}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default ResultsDashboard;
