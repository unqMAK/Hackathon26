import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { Search, FileText, Link as LinkIcon, Plus, X, Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';

interface ProblemApplication {
    _id: string;
    problemId: {
        _id: string;
        title: string;
        category: string;
    };
    status: 'pending' | 'approved' | 'rejected';
    supportingLinks: string[];
    comments: string;
    reviewNote?: string;
    createdAt: string;
}

const StudentProblemsPage = () => {
    const { data: problems = [] } = useProblems();
    const { data: myTeam } = useMyTeam();
    const queryClient = useQueryClient();

    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    // Application dialog state
    const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
    const [selectedProblemForApply, setSelectedProblemForApply] = useState<any>(null);
    const [applicationLinks, setApplicationLinks] = useState<string[]>(['']);
    const [applicationComments, setApplicationComments] = useState('');

    // View details dialog
    const [selectedProblem, setSelectedProblem] = useState<any>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Fetch my applications
    const { data: myApplications = [] } = useQuery<ProblemApplication[]>({
        queryKey: ['myApplications'],
        queryFn: async () => {
            const response = await api.get('/problem-applications/my-applications');
            return response.data;
        },
        enabled: !!myTeam
    });

    // Apply for problem mutation
    const applyMutation = useMutation({
        mutationFn: async (data: { problemId: string; supportingLinks: string[]; comments: string }) => {
            const response = await api.post('/problem-applications/apply', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myApplications'] });
            toast.success('Application submitted successfully!');
            resetApplicationForm();
            setIsApplyDialogOpen(false);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to submit application');
        }
    });

    // Withdraw application mutation
    const withdrawMutation = useMutation({
        mutationFn: async (applicationId: string) => {
            const response = await api.delete(`/problem-applications/${applicationId}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myApplications'] });
            toast.success('Application withdrawn');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to withdraw application');
        }
    });

    const resetApplicationForm = () => {
        setApplicationLinks(['']);
        setApplicationComments('');
        setSelectedProblemForApply(null);
    };

    const handleOpenApplyDialog = (problem: any) => {
        if (!myTeam) {
            toast.error('You must be part of a team to apply');
            return;
        }
        if (myTeam.status !== 'approved') {
            toast.error('Your team must be approved by the SPOC before you can apply for problems.');
            return;
        }
        setSelectedProblemForApply(problem);
        setIsApplyDialogOpen(true);
    };

    const handleSubmitApplication = () => {
        if (!selectedProblemForApply) return;

        const validLinks = applicationLinks.filter(link => link.trim() !== '');

        applyMutation.mutate({
            problemId: selectedProblemForApply._id || selectedProblemForApply.id,
            supportingLinks: validLinks,
            comments: applicationComments.trim()
        });
    };

    const addLinkField = () => {
        setApplicationLinks([...applicationLinks, '']);
    };

    const removeLinkField = (index: number) => {
        const newLinks = applicationLinks.filter((_, i) => i !== index);
        setApplicationLinks(newLinks.length > 0 ? newLinks : ['']);
    };

    const updateLink = (index: number, value: string) => {
        const newLinks = [...applicationLinks];
        newLinks[index] = value;
        setApplicationLinks(newLinks);
    };

    const getApplicationStatus = (problemId: string) => {
        return myApplications.find(app => app.problemId._id === problemId || app.problemId._id === problemId);
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

    // Application stats
    const pendingCount = myApplications.filter(a => a.status === 'pending').length;
    const approvedCount = myApplications.filter(a => a.status === 'approved').length;
    const rejectedCount = myApplications.filter(a => a.status === 'rejected').length;

    return (
        <DashboardLayout role="student">
            <div className="space-y-6 animate-fade-in">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Problem Statements</h2>
                    <p className="text-muted-foreground">Browse and apply for problem statements for your team.</p>
                </div>

                {/* Application Stats */}
                {myTeam && (
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card className="border-yellow-200 bg-yellow-50/50">
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-3">
                                    <Clock className="h-8 w-8 text-yellow-600" />
                                    <div>
                                        <p className="text-2xl font-bold text-yellow-700">{pendingCount}</p>
                                        <p className="text-sm text-yellow-600">Pending Applications</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-green-200 bg-green-50/50">
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="h-8 w-8 text-green-600" />
                                    <div>
                                        <p className="text-2xl font-bold text-green-700">{approvedCount}</p>
                                        <p className="text-sm text-green-600">Approved (Shortlisted)</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-red-200 bg-red-50/50">
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-3">
                                    <XCircle className="h-8 w-8 text-red-600" />
                                    <div>
                                        <p className="text-2xl font-bold text-red-700">{rejectedCount}</p>
                                        <p className="text-sm text-red-600">Not Approved</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Filters */}
                <Card className="border-2 border-orange-100 shadow-md overflow-hidden relative">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#E85C33] to-orange-400"></div>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-bold flex items-center gap-2 text-gray-800">
                            <Search className="h-5 w-5 text-[#E85C33]" />
                            Filter Problems
                        </CardTitle>
                        <p className="text-xs text-muted-foreground italic">Find the perfect problem statement for your team.</p>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2 group">
                                <label className="text-sm font-semibold text-gray-700">Search</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#E85C33]" />
                                    <Input
                                        placeholder="Search by title or tags..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 border-gray-200 focus:border-[#E85C33] focus:ring-[#E85C33]/20 transition-all"
                                    />
                                </div>
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
                                <TableHead className="w-[120px] font-bold text-gray-700 py-4">Status</TableHead>
                                <TableHead className="w-[160px] text-right font-bold text-gray-700 py-4 px-4">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredProblems.map((problem, index) => {
                                const application = getApplicationStatus(problem._id || problem.id);
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
                                            {application ? (
                                                <Badge
                                                    className={
                                                        application.status === 'approved'
                                                            ? 'bg-green-100 text-green-700 border-green-200'
                                                            : application.status === 'rejected'
                                                                ? 'bg-red-100 text-red-700 border-red-200'
                                                                : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                                                    }
                                                >
                                                    {application.status === 'approved' ? 'Shortlisted' :
                                                        application.status === 'rejected' ? 'Not Approved' : 'Pending'}
                                                </Badge>
                                            ) : (
                                                <span className="text-gray-400 text-sm">Not Applied</span>
                                            )}
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
                                                {application ? (
                                                    application.status === 'pending' && (
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => withdrawMutation.mutate(application._id)}
                                                            disabled={withdrawMutation.isPending}
                                                        >
                                                            Withdraw
                                                        </Button>
                                                    )
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleOpenApplyDialog(problem)}
                                                        className="bg-[#E85C33] hover:bg-[#D64B25] text-white"
                                                    >
                                                        Apply
                                                    </Button>
                                                )}
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

            {/* Apply Dialog */}
            <Dialog open={isApplyDialogOpen} onOpenChange={(open) => {
                setIsApplyDialogOpen(open);
                if (!open) resetApplicationForm();
            }}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Apply for Problem Statement</DialogTitle>
                        <DialogDescription>
                            Submit your application for: <strong>{selectedProblemForApply?.title}</strong>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Supporting Links */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <LinkIcon className="h-4 w-4" />
                                Supporting Links (Optional)
                            </Label>
                            <p className="text-xs text-muted-foreground">Add links to portfolio, GitHub, previous projects, etc.</p>
                            {applicationLinks.map((link, index) => (
                                <div key={index} className="flex gap-2">
                                    <Input
                                        placeholder="https://..."
                                        value={link}
                                        onChange={(e) => updateLink(index, e.target.value)}
                                    />
                                    {applicationLinks.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeLinkField(index)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addLinkField}
                                className="mt-2"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Another Link
                            </Button>
                        </div>

                        {/* Comments */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Comments / Appeal Message (Optional)
                            </Label>
                            <p className="text-xs text-muted-foreground">Explain why your team is a great fit for this problem.</p>
                            <Textarea
                                placeholder="Tell us about your team's relevant experience, skills, or why you're interested in this problem..."
                                value={applicationComments}
                                onChange={(e) => setApplicationComments(e.target.value)}
                                className="min-h-[120px]"
                                maxLength={2000}
                            />
                            <p className="text-xs text-muted-foreground text-right">
                                {applicationComments.length}/2000 characters
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsApplyDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmitApplication}
                            disabled={applyMutation.isPending}
                            className="bg-[#E85C33] hover:bg-[#D64B25] text-white"
                        >
                            {applyMutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                'Submit Application'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

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
                        {!getApplicationStatus(selectedProblem?._id || selectedProblem?.id) && (
                            <Button
                                onClick={() => {
                                    setIsDialogOpen(false);
                                    handleOpenApplyDialog(selectedProblem);
                                }}
                                className="bg-[#E85C33] hover:bg-[#D64B25] text-white"
                            >
                                Apply for This Problem
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
};

export default StudentProblemsPage;
