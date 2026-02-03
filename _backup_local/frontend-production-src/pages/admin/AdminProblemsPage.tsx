import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search } from 'lucide-react';
import { useProblems, useCreateProblem } from '@/hooks/useMockData';
import { Problem } from '@/lib/mockData';

const AdminProblemsPage = () => {
    const { data: problems = [] } = useProblems();

    const [selectedProblem, setSelectedProblem] = useState<any>(null);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');

    const handleViewDetails = (problem: any) => {
        setSelectedProblem(problem);
        setIsViewDialogOpen(true);
    };

    const filteredProblems = problems.filter((problem) => {
        const matchesSearch = problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (problem.tags && problem.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
        const matchesDifficulty = difficultyFilter === 'all' || problem.difficulty === difficultyFilter;
        const matchesCategory = categoryFilter === 'all' || problem.category === categoryFilter;
        return matchesSearch && matchesDifficulty && matchesCategory;
    });

    const categories = Array.from(new Set(problems.map(p => p.category)));

    return (
        <DashboardLayout role="admin">
            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Problem Statements</h2>
                        <p className="text-muted-foreground">Define challenges for the hackathon.</p>
                    </div>
                </div>

                {/* Filters */}
                <Card className="border-2 border-[#8B2A3B]/10 shadow-md overflow-hidden relative">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8B2A3B] to-[#a53549]"></div>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-bold flex items-center gap-2 text-gray-800">
                            <Search className="h-5 w-5 text-[#8B2A3B]" />
                            Filter Problems
                        </CardTitle>
                        <p className="text-xs text-muted-foreground italic">Search and categorize existing problem statements.</p>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2 group">
                                <label className="text-sm font-semibold text-gray-700">Search</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#8B2A3B] group-focus-within:text-[#a53549] transition-colors" />
                                    <Input
                                        placeholder="Search by title or tags..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 border-gray-200 focus:border-[#8B2A3B] focus:ring-[#8B2A3B]/20 transition-all"
                                    />
                                </div>
                                <p className="text-[10px] text-gray-400">Search by Title or Technology Tags</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Category</label>
                                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                    <SelectTrigger className="border-gray-200 focus:ring-[#8B2A3B]/20">
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
                <div className="rounded-md border bg-card">
                    <Table>
                        <TableHeader className="bg-gray-50/50">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-[140px] font-bold text-gray-700 py-4 px-6">ID</TableHead>
                                <TableHead className="font-bold text-gray-700 py-4">Title</TableHead>
                                <TableHead className="font-bold text-gray-700 py-4">Category</TableHead>
                                <TableHead className="max-w-[300px] font-bold text-gray-700 py-4">Description</TableHead>
                                <TableHead className="font-bold text-gray-700 py-4">Tags</TableHead>
                                <TableHead className="text-right font-bold text-gray-700 py-4 px-6">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredProblems.map((problem, index) => {
                                const displayId = `ID-${String(index + 1).padStart(2, '0')}`;

                                return (
                                    <TableRow
                                        key={problem._id || problem.id}
                                        className="group border-l-4 border-l-transparent hover:border-l-[#8B2A3B] hover:bg-orange-50/30 transition-all duration-200"
                                    >
                                        <TableCell className="font-medium py-4 px-6">{displayId}</TableCell>
                                        <TableCell className="font-semibold">{problem.title}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{problem.category}</Badge>
                                        </TableCell>
                                        <TableCell className="max-w-[300px] truncate" title={problem.description}>
                                            {problem.description}
                                        </TableCell>
                                        <TableCell>
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
                                        <TableCell className="text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleViewDetails(problem)}
                                            >
                                                View
                                            </Button>
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
                                                className="text-[#8B2A3B] font-semibold"
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

            {/* View Details Dialog */}
            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
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
                        <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
};

export default AdminProblemsPage;
