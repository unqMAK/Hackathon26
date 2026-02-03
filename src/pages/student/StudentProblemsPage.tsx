import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProblems } from '@/hooks/useMockData';
import { toast } from 'sonner';
import { useMyTeam } from '@/hooks/useTeam';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
import { Search, Loader2, CheckCircle, AlertCircle, Lock } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface SelectionData {
    selectedProblem: {
        _id: string;
        title: string;
        category: string;
    } | null;
    isSelectionOpen: boolean;
    canSelect: boolean;
}

const StudentProblemsPage = () => {
    const { data: problems = [] } = useProblems();
    const { data: myTeam } = useMyTeam();
    const queryClient = useQueryClient();

    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    // View details dialog
    const [selectedProblem, setSelectedProblem] = useState<any>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Fetch my current selection
    const { data: selectionData } = useQuery<SelectionData>({
        queryKey: ['myProblemSelection'],
        queryFn: async () => {
            const response = await api.get('/problem-selection/my-selection');
            return response.data;
        },
        enabled: !!myTeam
    });

    // Select problem mutation
    const selectMutation = useMutation({
        mutationFn: async (problemId: string) => {
            const response = await api.put('/problem-selection/select', { problemId });
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['myProblemSelection'] });
            toast.success(data.message || 'Problem selected successfully!');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to select problem');
        }
    });

    const handleSelectProblem = (problemId: string) => {
        if (!myTeam) {
            toast.error('You must be part of a team to select a problem');
            return;
        }
        if (myTeam.status !== 'approved') {
            toast.error('Your team must be approved before selecting a problem');
            return;
        }
        if (!selectionData?.isSelectionOpen) {
            toast.error('Problem selection is currently closed');
            return;
        }
        if (!selectionData?.canSelect) {
            toast.error('Only the team leader can select a problem');
            return;
        }
        selectMutation.mutate(problemId);
    };

    const handleViewDetails = (problem: any) => {
        setSelectedProblem(problem);
        setIsDialogOpen(true);
    };

    const filteredProblems = problems.filter((problem) => {
        const matchesSearch = problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (problem.tags && problem.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
        const matchesCategory = categoryFilter === 'all' || problem.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const categories = Array.from(new Set(problems.map(p => p.category)));

    const isSelected = (problemId: string) => {
        return selectionData?.selectedProblem?._id === problemId;
    };

    const isSelectionClosed = selectionData?.isSelectionOpen === false;

    return (
        <DashboardLayout role="student">
            <div className="space-y-6 animate-fade-in">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Problem Statements</h2>
                    <p className="text-muted-foreground">Select a problem statement for your team.</p>
                </div>

                {/* Selection Status */}
                {myTeam && (
                    <Card className={`border-2 ${isSelectionClosed ? 'border-red-200 bg-red-50/50' : selectionData?.selectedProblem ? 'border-green-200 bg-green-50/50' : 'border-orange-200 bg-orange-50/50'}`}>
                        <CardContent className="pt-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {isSelectionClosed ? (
                                        <>
                                            <Lock className="h-8 w-8 text-red-600" />
                                            <div>
                                                <p className="font-semibold text-red-700">Selection Closed</p>
                                                <p className="text-sm text-red-600">Problem selection window is currently closed</p>
                                            </div>
                                        </>
                                    ) : selectionData?.selectedProblem ? (
                                        <>
                                            <CheckCircle className="h-8 w-8 text-green-600" />
                                            <div>
                                                <p className="font-semibold text-green-700">Selected Problem</p>
                                                <p className="text-sm text-green-600">{selectionData.selectedProblem.title}</p>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <AlertCircle className="h-8 w-8 text-orange-600" />
                                            <div>
                                                <p className="font-semibold text-orange-700">No Problem Selected</p>
                                                <p className="text-sm text-orange-600">Click "Select" on a problem below to choose it</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                                {selectionData?.selectedProblem && !isSelectionClosed && selectionData?.canSelect && (
                                    <Badge variant="outline" className="text-green-700 border-green-300">
                                        You can change your selection
                                    </Badge>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Filters */}
                <Card className="border-2 border-orange-100 shadow-md overflow-hidden relative">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#E85C33] to-orange-400"></div>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-bold flex items-center gap-2 text-gray-800">
                            <Search className="h-5 w-5 text-[#E85C33]" />
                            Filter Problems
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Search</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#E85C33]" />
                                    <Input
                                        placeholder="Search by title or tags..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Category</label>
                                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                    <SelectTrigger>
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
                                <TableHead className="w-[160px] text-right font-bold text-gray-700 py-4 px-4">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredProblems.map((problem, index) => {
                                const problemId = problem._id || problem.id;
                                const selected = isSelected(problemId);
                                const displayId = `ID-${String(index + 1).padStart(2, '0')}`;

                                return (
                                    <TableRow
                                        key={problemId}
                                        className={`group border-l-4 transition-all duration-200 ${selected
                                            ? 'border-l-green-500 bg-green-50/50'
                                            : 'border-l-transparent hover:border-l-[#E85C33] hover:bg-orange-50/30'
                                            }`}
                                    >
                                        <TableCell className="font-medium py-4 px-4">{displayId}</TableCell>
                                        <TableCell className="font-semibold py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="truncate" title={problem.title}>{problem.title}</span>
                                                {selected && (
                                                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <Badge variant="outline">{problem.category}</Badge>
                                        </TableCell>
                                        <TableCell className="py-4 text-gray-600">
                                            <div className="line-clamp-2 text-sm" title={problem.description}>
                                                {problem.description}
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
                                                {selected ? (
                                                    <Button
                                                        size="sm"
                                                        disabled={true}
                                                        className="bg-green-600 hover:bg-green-700 text-white cursor-default"
                                                    >
                                                        <CheckCircle className="h-4 w-4 mr-1" />
                                                        Selected
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleSelectProblem(problemId)}
                                                        disabled={selectMutation.isPending || isSelectionClosed || !selectionData?.canSelect}
                                                        className="bg-[#E85C33] hover:bg-[#D64B25] text-white disabled:opacity-50"
                                                    >
                                                        {selectMutation.isPending ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            'Select'
                                                        )}
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                            {filteredProblems.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-48 text-center bg-gray-50/20">
                                        <div className="flex flex-col items-center justify-center space-y-3">
                                            <Search className="h-10 w-10 text-gray-300" />
                                            <div className="space-y-1">
                                                <p className="text-lg font-semibold text-gray-700">No matching problems</p>
                                                <p className="text-sm text-muted-foreground">Try adjusting your filters.</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* View Details Dialog */}
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
                        {!isSelected(selectedProblem?._id || selectedProblem?.id) && !isSelectionClosed && selectionData?.canSelect && (
                            <Button
                                onClick={() => {
                                    setIsDialogOpen(false);
                                    handleSelectProblem(selectedProblem?._id || selectedProblem?.id);
                                }}
                                className="bg-[#E85C33] hover:bg-[#D64B25] text-white"
                            >
                                Select This Problem
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
};

export default StudentProblemsPage;
