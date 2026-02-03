import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, ArrowRight, Eye } from 'lucide-react';
import { useMyTeam } from '@/hooks/useTeam';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const ProblemStatus = () => {
    const { data: team, isLoading: teamLoading } = useMyTeam();
    const navigate = useNavigate();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    if (teamLoading) {
        return (
            <Card className="border-2 border-purple-100 shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Problem Statement</CardTitle>
                    <FileText className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">Loading...</div>
                </CardContent>
            </Card>
        );
    }

    if (!team) {
        return (
            <Card className="border-2 border-gray-100 shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Problem Statement</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-muted-foreground">--</div>
                    <p className="text-xs text-muted-foreground mt-1">Join a team first</p>
                </CardContent>
            </Card>
        );
    }

    // Check if problemId exists (can be ObjectId or populated object)
    const hasProblem = !!team.problemId;

    if (!hasProblem) {
        return (
            <Card className="border-2 border-purple-100 shadow-md overflow-hidden relative">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Problem Statement</CardTitle>
                    <FileText className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold mb-2 text-gray-700">Not Selected</div>
                    <p className="text-xs text-muted-foreground mb-3">Select a problem statement for your team to start working.</p>
                    <Button size="sm" variant="outline" onClick={() => navigate('/student/problems')} className="border-purple-200 hover:bg-purple-50 hover:text-purple-700">
                        Select Problem <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </CardContent>
            </Card>
        );
    }

    // Problem is selected - check if it's populated
    const problem = typeof team.problemId === 'object' ? team.problemId : null;

    return (
        <>
            <Card className="border-2 border-green-100 shadow-md overflow-hidden relative">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        Problem Statement
                    </CardTitle>
                    <FileText className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent className="space-y-3">
                    <div>
                        <div className="text-lg font-bold text-gray-800 leading-tight">
                            {problem?.title || 'Selected'}
                        </div>
                        {problem?.category && (
                            <Badge variant="outline" className="mt-2 text-xs border-green-200 text-green-700 bg-green-50">
                                {problem.category}
                            </Badge>
                        )}
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                        {problem?.description || `Problem ID: ${team.problemId}`}
                    </p>

                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsDialogOpen(true)}
                        className="w-full text-green-700 hover:bg-green-50 hover:text-green-800 mt-2"
                    >
                        <Eye className="mr-2 h-4 w-4" /> View Full Details
                    </Button>
                </CardContent>
            </Card>

            {/* Full Details Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-gray-800">
                            {problem?.title || 'Problem Statement'}
                        </DialogTitle>
                        <DialogDescription>
                            <div className="flex flex-wrap gap-2 mt-3">
                                {problem?.category && (
                                    <Badge variant="outline" className="border-purple-200 text-purple-700 bg-purple-50">
                                        {problem.category}
                                    </Badge>
                                )}
                                {problem?.difficulty && (
                                    <Badge className={
                                        problem.difficulty === 'Easy' ? 'bg-green-100 text-green-700 border-green-200' :
                                            problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                                                'bg-red-100 text-red-700 border-red-200'
                                    }>
                                        {problem.difficulty}
                                    </Badge>
                                )}
                            </div>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        <div className="bg-gray-50 rounded-lg p-4 border">
                            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Description</h4>
                            <p className="text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {problem?.description || 'No description available.'}
                            </p>
                        </div>

                        {problem?.tags && problem.tags.length > 0 && (
                            <div>
                                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Technology Tags</h4>
                                <div className="flex flex-wrap gap-2">
                                    {problem.tags.map((tag: string, i: number) => (
                                        <Badge key={i} variant="secondary" className="bg-blue-50 text-blue-700 border border-blue-100">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Close</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ProblemStatus;
