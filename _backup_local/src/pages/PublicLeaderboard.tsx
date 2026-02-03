import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
    Lock,
    Loader2,
    Clock
} from 'lucide-react';
import { evaluationService } from '@/services/evaluationService';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';

const PublicLeaderboard = () => {
    // Fetch leaderboard (respects publish status)
    const { data, isLoading } = useQuery({
        queryKey: ['publicLeaderboard'],
        queryFn: evaluationService.getPublicLeaderboard,
        refetchInterval: 30000 // Refresh every 30 seconds
    });

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return <Trophy className="h-5 w-5 text-yellow-500" />;
            case 2:
                return <Medal className="h-5 w-5 text-gray-400" />;
            case 3:
                return <Medal className="h-5 w-5 text-amber-600" />;
            default:
                return <span className="font-bold text-muted-foreground">#{rank}</span>;
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600 bg-green-100';
        if (score >= 60) return 'text-blue-600 bg-blue-100';
        if (score >= 40) return 'text-amber-600 bg-amber-100';
        return 'text-red-600 bg-red-100';
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <div className="container mx-auto px-4 py-8 pt-24">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold mb-2">
                            <Trophy className="inline-block mr-3 h-10 w-10 text-yellow-500" />
                            Hackathon Leaderboard
                        </h1>
                        <p className="text-muted-foreground">
                            Top performing teams based on judge evaluations
                        </p>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center py-16">
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        </div>
                    ) : !data?.visible ? (
                        // Results not published - show locked message
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Card className="max-w-lg mx-auto border-amber-300 bg-amber-50">
                                <CardContent className="py-12 text-center">
                                    <div className="p-4 rounded-full bg-amber-100 w-fit mx-auto mb-6">
                                        <Lock className="h-12 w-12 text-amber-600" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-amber-800 mb-2">
                                        Results Pending
                                    </h3>
                                    <p className="text-amber-700 mb-4">
                                        {data?.message || 'The leaderboard will be available once results are published by the administrators.'}
                                    </p>
                                    <div className="flex items-center justify-center gap-2 text-amber-600">
                                        <Clock className="h-4 w-4" />
                                        <span className="text-sm">Check back later</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ) : (
                        // Results published - show leaderboard
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Trophy className="h-5 w-5 text-yellow-500" />
                                    Rankings
                                </CardTitle>
                                <CardDescription>
                                    {data.leaderboard.length} teams ranked by average evaluation score
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[80px]">Rank</TableHead>
                                            <TableHead>Team</TableHead>
                                            <TableHead>Problem</TableHead>
                                            <TableHead className="text-right">Score</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data.leaderboard.map((entry) => (
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
                                        {data.leaderboard.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center py-8">
                                                    No teams have been evaluated yet.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default PublicLeaderboard;
