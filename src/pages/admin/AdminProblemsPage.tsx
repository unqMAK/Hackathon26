import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Users, Lock, Unlock, Mail, Phone, Building, Loader2 } from 'lucide-react';
import { useProblems } from '@/hooks/useMockData';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';

interface TeamWithSelection {
    _id: string;
    teamName: string;
    instituteName: string;
    instituteCode: string;
    leader: {
        name: string;
        email: string;
        phone: string;
    } | null;
    spoc: {
        name: string;
        email: string;
    };
    mentor: {
        name: string;
        email: string;
    };
}

interface ProblemSelection {
    problem: {
        _id: string;
        title: string;
        category: string;
    };
    teams: TeamWithSelection[];
}

interface SelectionData {
    isSelectionOpen: boolean;
    problemSelections: ProblemSelection[];
    unselectedTeams: TeamWithSelection[];
    problemStats: {
        _id: string;
        title: string;
        category: string;
        teamCount: number;
    }[];
    totalApprovedTeams: number;
    teamsWithSelection: number;
}

const AdminProblemsPage = () => {
    const { data: problems = [] } = useProblems();
    const queryClient = useQueryClient();

    const [selectedProblem, setSelectedProblem] = useState<any>(null);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    // Fetch selection data
    const { data: selectionData, isLoading: selectionsLoading } = useQuery<SelectionData>({
        queryKey: ['adminProblemSelections'],
        queryFn: async () => {
            const response = await api.get('/problem-selection/all');
            return response.data;
        }
    });

    // Toggle selection window mutation
    const toggleMutation = useMutation({
        mutationFn: async (isOpen: boolean) => {
            const response = await api.post('/problem-selection/toggle-window', { isOpen });
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['adminProblemSelections'] });
            toast.success(data.message);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to toggle selection window');
        }
    });

    const handleViewDetails = (problem: any) => {
        setSelectedProblem(problem);
        setIsViewDialogOpen(true);
    };

    const filteredProblems = problems.filter((problem) => {
        const matchesSearch = problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (problem.tags && problem.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
        const matchesCategory = categoryFilter === 'all' || problem.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const categories = Array.from(new Set(problems.map(p => p.category)));

    return (
        <DashboardLayout role="admin">
            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Problem Statements</h2>
                        <p className="text-muted-foreground">Manage problem statements and team selections.</p>
                    </div>
                </div>

                {/* Selection Window Control */}
                <Card className={`border-2 ${selectionData?.isSelectionOpen ? 'border-green-200 bg-green-50/30' : 'border-red-200 bg-red-50/30'}`}>
                    <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {selectionData?.isSelectionOpen ? (
                                    <Unlock className="h-6 w-6 text-green-600" />
                                ) : (
                                    <Lock className="h-6 w-6 text-red-600" />
                                )}
                                <div>
                                    <p className="font-semibold">
                                        Problem Selection Window: {selectionData?.isSelectionOpen ? 'Open' : 'Closed'}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {selectionData?.isSelectionOpen
                                            ? 'Students can select or change their problem statement'
                                            : 'Students cannot change their problem selection'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-medium">
                                    {selectionData?.isSelectionOpen ? 'Open' : 'Closed'}
                                </span>
                                <Switch
                                    checked={selectionData?.isSelectionOpen ?? true}
                                    onCheckedChange={(checked) => toggleMutation.mutate(checked)}
                                    disabled={toggleMutation.isPending}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-3">
                                <Users className="h-8 w-8 text-blue-600" />
                                <div>
                                    <p className="text-2xl font-bold">{selectionData?.totalApprovedTeams || 0}</p>
                                    <p className="text-sm text-muted-foreground">Total Approved Teams</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-green-200 bg-green-50/30">
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-3">
                                <Users className="h-8 w-8 text-green-600" />
                                <div>
                                    <p className="text-2xl font-bold text-green-700">{selectionData?.teamsWithSelection || 0}</p>
                                    <p className="text-sm text-green-600">Teams with Selection</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-orange-200 bg-orange-50/30">
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-3">
                                <Users className="h-8 w-8 text-orange-600" />
                                <div>
                                    <p className="text-2xl font-bold text-orange-700">{selectionData?.unselectedTeams?.length || 0}</p>
                                    <p className="text-sm text-orange-600">Pending Selection</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs for Problems / Team Selections */}
                <Tabs defaultValue="selections" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="selections">Team Selections</TabsTrigger>
                        <TabsTrigger value="problems">Problem Statements</TabsTrigger>
                    </TabsList>

                    {/* Team Selections Tab */}
                    <TabsContent value="selections" className="space-y-4">
                        {selectionsLoading ? (
                            <Card>
                                <CardContent className="py-12 text-center">
                                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                                    <p className="mt-2 text-muted-foreground">Loading selections...</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <>
                                {/* Problem Stats */}
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-lg">Selection Statistics</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                            {selectionData?.problemStats?.map((stat) => (
                                                <div key={stat._id} className="flex items-center justify-between p-3 border rounded-lg">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium truncate">{stat.title}</p>
                                                        <Badge variant="outline" className="text-xs">{stat.category}</Badge>
                                                    </div>
                                                    <Badge className="bg-blue-100 text-blue-700 ml-2">{stat.teamCount} teams</Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Teams by Problem */}
                                {selectionData?.problemSelections?.map((selection) => (
                                    <Card key={selection.problem._id}>
                                        <CardHeader className="pb-3">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <CardTitle className="text-lg">{selection.problem.title}</CardTitle>
                                                    <Badge variant="outline">{selection.problem.category}</Badge>
                                                </div>
                                                <Badge className="bg-blue-100 text-blue-700">{selection.teams.length} teams</Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Team</TableHead>
                                                        <TableHead>Institute</TableHead>
                                                        <TableHead>Team Leader</TableHead>
                                                        <TableHead>SPOC/Mentor</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {selection.teams.map((team) => (
                                                        <TableRow key={team._id}>
                                                            <TableCell className="font-medium">{team.teamName}</TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center gap-1">
                                                                    <Building className="h-3 w-3 text-muted-foreground" />
                                                                    <span className="text-sm">{team.instituteName}</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="space-y-1">
                                                                    <p className="font-medium text-sm">{team.leader?.name || 'N/A'}</p>
                                                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                                        <Mail className="h-3 w-3" />
                                                                        {team.leader?.email || 'N/A'}
                                                                    </div>
                                                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                                        <Phone className="h-3 w-3" />
                                                                        {team.leader?.phone || 'N/A'}
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="space-y-2">
                                                                    <div>
                                                                        <p className="text-xs font-medium text-muted-foreground">SPOC</p>
                                                                        <p className="text-sm">{team.spoc.name}</p>
                                                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                                            <Mail className="h-3 w-3" />
                                                                            {team.spoc.email}
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs font-medium text-muted-foreground">Mentor</p>
                                                                        <p className="text-sm">{team.mentor.name}</p>
                                                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                                            <Mail className="h-3 w-3" />
                                                                            {team.mentor.email}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </CardContent>
                                    </Card>
                                ))}

                                {/* Unselected Teams */}
                                {selectionData?.unselectedTeams && selectionData.unselectedTeams.length > 0 && (
                                    <Card className="border-orange-200">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-lg text-orange-700">Teams Without Selection</CardTitle>
                                                <Badge className="bg-orange-100 text-orange-700">{selectionData.unselectedTeams.length} teams</Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Team</TableHead>
                                                        <TableHead>Institute</TableHead>
                                                        <TableHead>Team Leader</TableHead>
                                                        <TableHead>SPOC</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {selectionData.unselectedTeams.map((team) => (
                                                        <TableRow key={team._id}>
                                                            <TableCell className="font-medium">{team.teamName}</TableCell>
                                                            <TableCell>{team.instituteName}</TableCell>
                                                            <TableCell>
                                                                <div>
                                                                    <p className="text-sm">{team.leader?.name || 'N/A'}</p>
                                                                    <p className="text-xs text-muted-foreground">{team.leader?.email}</p>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div>
                                                                    <p className="text-sm">{team.spoc.name}</p>
                                                                    <p className="text-xs text-muted-foreground">{team.spoc.email}</p>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </CardContent>
                                    </Card>
                                )}
                            </>
                        )}
                    </TabsContent>

                    {/* Problems Tab */}
                    <TabsContent value="problems" className="space-y-4">
                        {/* Filters */}
                        <Card className="border-2 border-[#8B2A3B]/10 shadow-md overflow-hidden relative">
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8B2A3B] to-[#a53549]"></div>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg font-bold flex items-center gap-2 text-gray-800">
                                    <Search className="h-5 w-5 text-[#8B2A3B]" />
                                    Filter Problems
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">Search</label>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#8B2A3B]" />
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
                        <div className="rounded-md border bg-card">
                            <Table>
                                <TableHeader className="bg-gray-50/50">
                                    <TableRow>
                                        <TableHead className="w-[100px] font-bold">ID</TableHead>
                                        <TableHead className="font-bold">Title</TableHead>
                                        <TableHead className="font-bold">Category</TableHead>
                                        <TableHead className="font-bold">Teams</TableHead>
                                        <TableHead className="text-right font-bold">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredProblems.map((problem, index) => {
                                        const displayId = `ID-${String(index + 1).padStart(2, '0')}`;
                                        const teamCount = selectionData?.problemStats?.find(s => s._id === problem._id)?.teamCount || 0;

                                        return (
                                            <TableRow key={problem._id || problem.id}>
                                                <TableCell className="font-medium">{displayId}</TableCell>
                                                <TableCell className="font-semibold">{problem.title}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{problem.category}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className="bg-blue-100 text-blue-700">{teamCount} teams</Badge>
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
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>
                </Tabs>
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
