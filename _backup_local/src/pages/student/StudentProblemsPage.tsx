import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProblems } from '@/hooks/useMockData';
import { toast } from 'sonner';
import { useMyTeam } from '@/hooks/useTeam';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const StudentProblemsPage = () => {
    const { data: problems = [] } = useProblems();
    const { data: myTeam } = useMyTeam();
    const queryClient = useQueryClient();

    const [searchQuery, setSearchQuery] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');

    const selectProblemMutation = useMutation({
        mutationFn: async (problemId: string) => {
            console.log('Frontend: Sending problemId:', problemId);
            const response = await api.post('/teams/select-problem', { problemId });
            console.log('Frontend: Received response:', response.data);
            return response.data;
        },
        onSuccess: (data) => {
            console.log('Frontend: Problem selected successfully!', data);
            queryClient.invalidateQueries({ queryKey: ['myTeam'] });
            queryClient.invalidateQueries({ queryKey: ['problemStatus'] });
            queryClient.invalidateQueries({ queryKey: ['teams'] });
            toast.success('Problem selected successfully!');
        },
        onError: (error: any) => {
            console.error('Frontend: Error selecting problem:', error);
            toast.error(error.response?.data?.message || 'Failed to select problem');
        }
    });

    const handleSelectProblem = (problemId: string) => {
        if (!myTeam) {
            toast.error('You must be part of a team to select a problem');
            return;
        }

        if (myTeam.status !== 'approved') {
            toast.error('Your team must be approved by the SPOC before you can select a problem statement.');
            return;
        }

        const currentProblemId = typeof myTeam.problemId === 'object'
            ? (myTeam.problemId as any)?._id
            : myTeam.problemId;

        if (currentProblemId) {
            if (currentProblemId === problemId) {
                return;
            }
            toast.error("Your team has already selected a problem statement. You cannot select multiple.");
            return;
        }

        selectProblemMutation.mutate(problemId);
    };

    const filteredProblems = problems.filter((problem) => {
        const matchesSearch = problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (problem.tags && problem.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
        const matchesDifficulty = difficultyFilter === 'all' || problem.difficulty === difficultyFilter;
        const matchesCategory = categoryFilter === 'all' || problem.category === categoryFilter;
        return matchesSearch && matchesDifficulty && matchesCategory;
    });

    const categories = Array.from(new Set(problems.map(p => p.category)));

    const [selectedProblem, setSelectedProblem] = useState<any>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleViewDetails = (problem: any) => {
        setSelectedProblem(problem);
        setIsDialogOpen(true);
    };

    return (
        <DashboardLayout role="student">
            <div className="space-y-6 animate-fade-in">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Problem Statements</h2>
                    <p className="text-muted-foreground">Browse and select a problem statement for your team.</p>
                </div>

                {/* Filters */}
                <Card className="border-2 border-orange-100 shadow-md overflow-hidden relative">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#E85C33] to-orange-400"></div>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-bold flex items-center gap-2 text-gray-800">
                            <Search className="h-5 w-5 text-[#E85C33]" />
                            Filter Problems
                        </CardTitle>
                        <p className="text-xs text-muted-foreground italic">Refine the list of problem statements based on your interest.</p>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2 group">
                                <label className="text-sm font-semibold text-gray-700">Search</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#E85C33] group-focus-within:text-orange-600 transition-colors" />
                                    <Input
                                        placeholder="Search by title or tags..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 border-gray-200 focus:border-[#E85C33] focus:ring-[#E85C33]/20 transition-all"
                                    />
                                </div>
                                <p className="text-[10px] text-gray-400">Search by Title or Technology Tags</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Category</label>
                                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                    <SelectTrigger className="border-gray-200 focus:ring-[#E85C33]/20">
                                        <SelectValue placeholder="All Categories" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat as string} value={cat as string}>{cat as string}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Problems Table */}
                <div className="rounded-md border bg-card overflow-hidden overflow-x-auto">
                    <Table className="table-fixed w-full">
                        <TableHeader className="bg-gray-50/50">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-[80px] font-bold text-gray-700 py-4 px-4">ID</TableHead>
                                <TableHead className="w-[200px] font-bold text-gray-700 py-4">Title</TableHead>
                                <TableHead className="w-[120px] font-bold text-gray-700 py-4">Category</TableHead>
                                <TableHead className="font-bold text-gray-700 py-4 text-left">Description</TableHead>
                                <TableHead className="w-[150px] font-bold text-gray-700 py-4">Tags</TableHead>
                                <TableHead className="w-[160px] text-right font-bold text-gray-700 py-4 px-4">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredProblems.map((problem, index) => {
                                const teamProblemId = typeof myTeam?.problemId === 'object'
                                    ? (myTeam.problemId as any)?._id
                                    : myTeam?.problemId;
                                const isSelected = !!teamProblemId && (teamProblemId === problem._id || teamProblemId === problem.id);
                                const hasSelectedProblem = !!teamProblemId;
                                const displayId = `ID-${String(index + 1).padStart(2, '0')}`;

                                return (
                                    <TableRow
                                        key={problem._id || problem.id}
                                        className="group border-l-4 border-l-transparent hover:border-l-[#E85C33] hover:bg-orange-50/30 transition-all duration-200"
                                    >
                                        <TableCell className="font-medium py-4 px-4">{displayId}</TableCell>
                                        <TableCell className="font-semibold py-4">
                                            <div className="truncate" title={problem.title}>{problem.title}</div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <Badge variant="outline">{problem.category}</Badge>
                                        </TableCell>
                                        <TableCell className="py-4 text-gray-600">
                                            <div className="line-clamp-2 text-sm" title={problem.description}>
                                                {problem.description}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {problem.tags?.slice(0, 2).map((tag, i) => (
                                                    <Badge key={i} variant="secondary" className="text-xs">
                                                        {tag}
                                                    </Badge>
                                                ))}
                                                {problem.tags && problem.tags.length > 2 && (
                                                    <Badge variant="secondary" className="text-xs">+{problem.tags.length - 2}</Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right px-4">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleViewDetails(problem)}
                                                >
                                                    View
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant={isSelected ? "secondary" : "default"}
                                                    disabled={hasSelectedProblem && !isSelected}
                                                    onClick={() => handleSelectProblem(problem._id || problem.id)}
                                                    className={isSelected ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-[#E85C33] hover:bg-[#D64B25] text-white"}
                                                >
                                                    {isSelected ? "Selected" : "Select"}
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                            {filteredProblems.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-48 text-center bg-gray-50/20">
                                        <div className="flex flex-col items-center justify-center space-y-3">
                                            <Search className="h-10 w-10 text-gray-300" />
                                            <div className="space-y-1">
                                                <p className="text-lg font-semibold text-gray-700">No matching problems</p>
                                                <p className="text-sm text-muted-foreground">Try adjusting your filters or search terms.</p>
                                            </div>
                                            <Button
                                                variant="link"
                                                className="text-[#E85C33] font-semibold"
                                                onClick={() => {
                                                    setSearchQuery('');
                                                    setCategoryFilter('all');
                                                }}
                                            >
                                                Reset Filters
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">{selectedProblem?.title}</DialogTitle>
                        <DialogDescription>
                            <div className="flex flex-wrap gap-2 mt-2">
                                <Badge variant="outline">{selectedProblem?.category}</Badge>
                                <Badge
                                    className={
                                        selectedProblem?.difficulty === 'Easy' ? 'bg-green-100 text-green-700 border-green-200' :
                                            selectedProblem?.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                                                'bg-red-100 text-red-700 border-red-200'
                                    }
                                >
                                    {selectedProblem?.difficulty}
                                </Badge>
                            </div>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-2">Description</h4>
                            <p className="text-base leading-relaxed whitespace-pre-wrap">
                                {selectedProblem?.description}
                            </p>
                        </div>

                        {selectedProblem?.tags && selectedProblem.tags.length > 0 && (
                            <div>
                                <h4 className="text-sm font-medium text-muted-foreground mb-2">Tags</h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedProblem.tags.map((tag: string, i: number) => (
                                        <Badge key={i} variant="secondary">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Close</Button>
                        <Button
                            onClick={() => {
                                handleSelectProblem(selectedProblem?._id || selectedProblem?.id);
                                setIsDialogOpen(false);
                            }}
                            disabled={
                                (!!myTeam?.problemId &&
                                    (typeof myTeam.problemId === 'object' ? (myTeam.problemId as any)._id : myTeam.problemId) !== (selectedProblem?._id || selectedProblem?.id))
                            }
                            className="bg-[#E85C33] hover:bg-[#D64B25] text-white"
                        >
                            Select Problem
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
};

export default StudentProblemsPage;
