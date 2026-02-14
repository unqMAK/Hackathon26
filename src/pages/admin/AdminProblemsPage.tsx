import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { Search, Users, Lock, Unlock, Mail, Phone, Building, Loader2, Pencil, Save, Video, X, Plus, Trash2, Lightbulb, CheckCircle, XCircle, Clock, ExternalLink, Eye, FileText, Youtube, Download } from 'lucide-react';
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

interface VideoItem {
    _id: string;
    youtubeLink: string;
    title: string;
    representativeName: string;
    representativeDesignation: string;
    problemStatements: { problemId: string; problemTitle: string }[];
    isActive: boolean;
    order: number;
}

interface IdeaSubmissionItem {
    _id: string;
    teamId: { _id: string; name: string; instituteName: string; instituteCode: string };
    problemId: { _id: string; title: string; category: string };
    youtubeVideoLink: string;
    documentOriginalName: string;
    hasDocument: boolean;
    status: 'pending' | 'approved' | 'rejected';
    reviewedBy?: { name: string };
    reviewNote?: string;
    reviewedAt?: string;
    submittedBy?: { name: string; email: string };
    createdAt: string;
}

const AdminProblemsPage = () => {
    const { data: problems = [] } = useProblems();
    const queryClient = useQueryClient();

    const [selectedProblem, setSelectedProblem] = useState<any>(null);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    // Idea Submissions state
    const [ideaPsFilter, setIdeaPsFilter] = useState<string>('all');
    const [ideaReviewDialogOpen, setIdeaReviewDialogOpen] = useState(false);
    const [selectedIdeaSubmission, setSelectedIdeaSubmission] = useState<IdeaSubmissionItem | null>(null);
    const [reviewNote, setReviewNote] = useState('');

    // Video form state
    const [isVideoCreateOpen, setIsVideoCreateOpen] = useState(false);
    const [isVideoEditOpen, setIsVideoEditOpen] = useState(false);
    const [isVideoDeleteOpen, setIsVideoDeleteOpen] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
    const [videoFormTitle, setVideoFormTitle] = useState('');
    const [videoFormLink, setVideoFormLink] = useState('');
    const [videoFormRepName, setVideoFormRepName] = useState('');
    const [videoFormRepDesignation, setVideoFormRepDesignation] = useState('');
    const [videoFormIsActive, setVideoFormIsActive] = useState(true);
    const [videoFormProblemTags, setVideoFormProblemTags] = useState<{ problemId: string; problemTitle: string }[]>([]);

    // Fetch selection data
    const { data: selectionData, isLoading: selectionsLoading } = useQuery<SelectionData>({
        queryKey: ['adminProblemSelections'],
        queryFn: async () => {
            const response = await api.get('/problem-selection/all');
            return response.data;
        }
    });

    // Fetch videos
    const { data: videosData, isLoading: videosLoading } = useQuery<{ videos: VideoItem[] }>({
        queryKey: ['adminVideos'],
        queryFn: async () => {
            const response = await api.get('/videos/admin');
            return response.data;
        }
    });
    const videos = videosData?.videos || [];

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

    // ===== Video CRUD =====
    const createVideoMutation = useMutation({
        mutationFn: async (data: any) => {
            const response = await api.post('/videos', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminVideos'] });
            queryClient.invalidateQueries({ queryKey: ['publicVideos'] });
            toast.success('Video created successfully');
            setIsVideoCreateOpen(false);
            resetVideoForm();
        },
        onError: (error: any) => toast.error(error.response?.data?.message || 'Failed to create video')
    });

    const updateVideoMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            const response = await api.put(`/videos/${id}`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminVideos'] });
            queryClient.invalidateQueries({ queryKey: ['publicVideos'] });
            toast.success('Video updated successfully');
            setIsVideoEditOpen(false);
            resetVideoForm();
        },
        onError: (error: any) => toast.error(error.response?.data?.message || 'Failed to update video')
    });

    const deleteVideoMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await api.delete(`/videos/${id}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminVideos'] });
            queryClient.invalidateQueries({ queryKey: ['publicVideos'] });
            toast.success('Video deleted successfully');
            setIsVideoDeleteOpen(false);
            setSelectedVideo(null);
        },
        onError: (error: any) => toast.error(error.response?.data?.message || 'Failed to delete video')
    });

    const toggleVideoMutation = useMutation({
        mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
            const response = await api.put(`/videos/${id}`, { isActive });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminVideos'] });
            queryClient.invalidateQueries({ queryKey: ['publicVideos'] });
        },
        onError: (error: any) => toast.error(error.response?.data?.message || 'Failed to toggle video')
    });

    const resetVideoForm = () => {
        setVideoFormTitle('');
        setVideoFormLink('');
        setVideoFormRepName('');
        setVideoFormRepDesignation('');
        setVideoFormIsActive(true);
        setVideoFormProblemTags([]);
    };

    const handleCreateVideo = () => {
        resetVideoForm();
        setIsVideoCreateOpen(true);
    };

    const handleEditVideo = (video: VideoItem) => {
        setSelectedVideo(video);
        setVideoFormTitle(video.title);
        setVideoFormLink(video.youtubeLink);
        setVideoFormRepName(video.representativeName);
        setVideoFormRepDesignation(video.representativeDesignation);
        setVideoFormIsActive(video.isActive);
        setVideoFormProblemTags([...video.problemStatements]);
        setIsVideoEditOpen(true);
    };

    const handleDeleteVideo = (video: VideoItem) => {
        setSelectedVideo(video);
        setIsVideoDeleteOpen(true);
    };

    const handleSubmitCreateVideo = () => {
        if (!videoFormTitle.trim() || !videoFormLink.trim()) {
            toast.error('Title and YouTube link are required');
            return;
        }
        createVideoMutation.mutate({
            title: videoFormTitle,
            youtubeLink: videoFormLink,
            representativeName: videoFormRepName,
            representativeDesignation: videoFormRepDesignation,
            isActive: videoFormIsActive,
            problemStatements: videoFormProblemTags
        });
    };

    const handleSubmitEditVideo = () => {
        if (!selectedVideo || !videoFormTitle.trim() || !videoFormLink.trim()) {
            toast.error('Title and YouTube link are required');
            return;
        }
        updateVideoMutation.mutate({
            id: selectedVideo._id,
            data: {
                title: videoFormTitle,
                youtubeLink: videoFormLink,
                representativeName: videoFormRepName,
                representativeDesignation: videoFormRepDesignation,
                isActive: videoFormIsActive,
                problemStatements: videoFormProblemTags
            }
        });
    };

    const addProblemTag = (problemId: string, problemTitle: string) => {
        if (videoFormProblemTags.some(t => t.problemId === problemId)) return;
        setVideoFormProblemTags(prev => [...prev, { problemId, problemTitle }]);
    };

    const removeProblemTag = (problemId: string) => {
        setVideoFormProblemTags(prev => prev.filter(t => t.problemId !== problemId));
    };

    const filteredProblems = problems.filter((problem) => {
        const matchesSearch = problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (problem.tags && problem.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
        const matchesCategory = categoryFilter === 'all' || problem.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const categories = Array.from(new Set(problems.map(p => p.category)));

    // ==================== IDEA SUBMISSIONS ====================

    const { data: ideaSubmissions = [], isLoading: ideaLoading } = useQuery<IdeaSubmissionItem[]>({
        queryKey: ['adminIdeaSubmissions'],
        queryFn: async () => {
            const res = await api.get('/idea-submissions/admin');
            return res.data;
        }
    });

    const { data: ideaStats } = useQuery({
        queryKey: ['adminIdeaStats'],
        queryFn: async () => {
            const res = await api.get('/idea-submissions/admin/stats');
            return res.data;
        }
    });

    const reviewIdeaMutation = useMutation({
        mutationFn: async ({ id, status, reviewNote }: { id: string; status: string; reviewNote: string }) => {
            const res = await api.put(`/idea-submissions/admin/${id}/review`, { status, reviewNote });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminIdeaSubmissions'] });
            queryClient.invalidateQueries({ queryKey: ['adminIdeaStats'] });
            setIdeaReviewDialogOpen(false);
            setSelectedIdeaSubmission(null);
            setReviewNote('');
            toast.success('Submission reviewed successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to review submission');
        }
    });

    // Submission window status
    const { data: submissionWindowData } = useQuery({
        queryKey: ['submissionWindowStatus'],
        queryFn: async () => {
            const res = await api.get('/idea-submissions/submission-status');
            return res.data;
        }
    });

    const toggleSubmissionMutation = useMutation({
        mutationFn: async (isOpen: boolean) => {
            const res = await api.post('/idea-submissions/admin/toggle-submission', { isOpen });
            return res.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['submissionWindowStatus'] });
            toast.success(data.message);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to toggle submission window');
        }
    });

    // PS color map
    const psColors: Record<number, { bg: string; text: string; border: string; badge: string }> = {
        1: { bg: 'bg-yellow-50', text: 'text-yellow-800', border: 'border-yellow-200', badge: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
        2: { bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-200', badge: 'bg-green-100 text-green-800 border-green-300' },
        3: { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-800 border-blue-300' },
        4: { bg: 'bg-pink-50', text: 'text-pink-800', border: 'border-pink-200', badge: 'bg-pink-100 text-pink-800 border-pink-300' },
        5: { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-800 border-purple-300' }
    };

    // Get PS index for a given problem (1-based)
    const getPsIndex = (problemId: string): number => {
        const idx = problems.findIndex(p => (p as any)._id === problemId);
        return idx >= 0 ? idx + 1 : 0;
    };

    // Filter idea submissions
    const filteredIdeaSubmissions = ideaPsFilter === 'all'
        ? ideaSubmissions
        : ideaSubmissions.filter(s => {
            const idx = getPsIndex(s.problemId?._id);
            return String(idx) === ideaPsFilter;
        });

    // Extract YouTube video ID for embedding
    const getYoutubeEmbedUrl = (url: string): string | null => {
        try {
            const parsed = new URL(url);
            let videoId = '';
            if (parsed.hostname.includes('youtu.be')) {
                videoId = parsed.pathname.slice(1);
            } else {
                videoId = parsed.searchParams.get('v') || '';
            }
            return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
        } catch {
            return null;
        }
    };

    // Video form dialog (shared between create and edit)
    const videoFormContent = (
        <div className="space-y-4 py-4">
            <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">Display Title *</label>
                <Input
                    placeholder="e.g. Smart Road Damage Reporting & Rapid Response System"
                    value={videoFormTitle}
                    onChange={(e) => setVideoFormTitle(e.target.value)}
                />
            </div>
            <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">YouTube Embed URL *</label>
                <Input
                    placeholder="https://www.youtube.com/embed/..."
                    value={videoFormLink}
                    onChange={(e) => setVideoFormLink(e.target.value)}
                />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1 block">Representative Name</label>
                    <Input
                        placeholder="e.g. Mr. Satish Ekbote"
                        value={videoFormRepName}
                        onChange={(e) => setVideoFormRepName(e.target.value)}
                    />
                </div>
                <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1 block">Representative Designation</label>
                    <Input
                        placeholder="e.g. Assistant Manager, SMC"
                        value={videoFormRepDesignation}
                        onChange={(e) => setVideoFormRepDesignation(e.target.value)}
                    />
                </div>
            </div>

            {/* Problem Statement Tags */}
            <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">Tagged Problem Statements</label>
                <div className="flex flex-wrap gap-1.5 mb-2 min-h-[32px] p-2 bg-gray-50 rounded-lg border">
                    {videoFormProblemTags.length === 0 && (
                        <span className="text-xs text-gray-400 italic">No problem statements tagged. Select from below.</span>
                    )}
                    {videoFormProblemTags.map((tag) => (
                        <Badge key={tag.problemId} className="bg-purple-100 text-purple-700 border-purple-200 gap-1">
                            {tag.problemTitle.length > 40 ? tag.problemTitle.slice(0, 40) + '...' : tag.problemTitle}
                            <X className="h-3 w-3 cursor-pointer hover:text-red-600" onClick={() => removeProblemTag(tag.problemId)} />
                        </Badge>
                    ))}
                </div>
                <Select onValueChange={(val) => {
                    const problem = problems.find(p => (p._id || p.id) === val);
                    if (problem) addProblemTag(problem._id || problem.id, problem.title);
                }}>
                    <SelectTrigger className="text-sm">
                        <SelectValue placeholder="Select a problem statement to tag..." />
                    </SelectTrigger>
                    <SelectContent>
                        {problems.map((p, i) => (
                            <SelectItem key={p._id || p.id || i} value={p._id || p.id}>
                                ID-{String(i + 1).padStart(2, '0')}: {p.title}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex items-center gap-3">
                <label className="text-sm font-semibold text-gray-700">Active</label>
                <Switch checked={videoFormIsActive} onCheckedChange={setVideoFormIsActive} />
            </div>
        </div>
    );

    return (
        <DashboardLayout role="admin">
            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Problem Statements</h2>
                        <p className="text-muted-foreground">Manage problem statements, team selections, and videos.</p>
                    </div>
                </div>

                {/* Selection Window Control */}
                <Card className={`border-2 ${selectionData?.isSelectionOpen ? 'border-green-200 bg-green-50/30' : 'border-red-200 bg-red-50/30'}`}>
                    <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {selectionData?.isSelectionOpen ? (
                                    <Unlock className="h-5 w-5 text-green-600" />
                                ) : (
                                    <Lock className="h-5 w-5 text-red-600" />
                                )}
                                <div>
                                    <p className="font-semibold">Problem Selection Window</p>
                                    <p className="text-sm text-muted-foreground">
                                        {selectionData?.isSelectionOpen
                                            ? 'Teams can currently select their problem statements.'
                                            : 'Problem selection is currently closed.'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
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

                {/* Tabs for Problems / Team Selections / Videos / Idea Submissions */}
                <Tabs defaultValue="selections" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="selections">Team Selections</TabsTrigger>
                        <TabsTrigger value="problems">Problem Statements</TabsTrigger>
                        <TabsTrigger value="videos" className="flex items-center gap-1.5">
                            <Video className="h-4 w-4" /> Videos
                        </TabsTrigger>
                        <TabsTrigger value="ideas" className="flex items-center gap-1.5">
                            <Lightbulb className="h-4 w-4" /> Idea Submissions
                        </TabsTrigger>
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

                    {/* ===== Videos Tab ===== */}
                    <TabsContent value="videos" className="space-y-4">
                        {/* Video Stats */}
                        <div className="grid gap-4 md:grid-cols-3">
                            <Card>
                                <CardContent className="pt-4">
                                    <div className="flex items-center gap-3">
                                        <Video className="h-8 w-8 text-blue-600" />
                                        <div>
                                            <p className="text-2xl font-bold">{videos.length}</p>
                                            <p className="text-sm text-muted-foreground">Total Videos</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="border-green-200 bg-green-50/30">
                                <CardContent className="pt-4">
                                    <div className="flex items-center gap-3">
                                        <Video className="h-8 w-8 text-green-600" />
                                        <div>
                                            <p className="text-2xl font-bold text-green-700">{videos.filter(v => v.isActive).length}</p>
                                            <p className="text-sm text-green-600">Active Videos</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="border-purple-200 bg-purple-50/30">
                                <CardContent className="pt-4">
                                    <div className="flex items-center gap-3">
                                        <Video className="h-8 w-8 text-purple-600" />
                                        <div>
                                            <p className="text-2xl font-bold text-purple-700">{videos.filter(v => !v.isActive).length}</p>
                                            <p className="text-sm text-purple-600">Inactive Videos</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Add Video Button */}
                        <div className="flex justify-end">
                            <Button onClick={handleCreateVideo} className="bg-[#8B2A3B] hover:bg-[#6d2130] text-white">
                                <Plus className="h-4 w-4 mr-2" /> Add Video
                            </Button>
                        </div>

                        {/* Videos Table */}
                        {videosLoading ? (
                            <Card>
                                <CardContent className="py-12 text-center">
                                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                                    <p className="mt-2 text-muted-foreground">Loading videos...</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="rounded-md border bg-card">
                                <Table>
                                    <TableHeader className="bg-gray-50/50">
                                        <TableRow>
                                            <TableHead className="w-[50px] font-bold">#</TableHead>
                                            <TableHead className="font-bold">Title</TableHead>
                                            <TableHead className="font-bold">Representative</TableHead>
                                            <TableHead className="font-bold">Problem Tags</TableHead>
                                            <TableHead className="font-bold">Status</TableHead>
                                            <TableHead className="text-right font-bold">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {videos.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                                    No videos found. Click "Add Video" to create one.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            videos.map((video, index) => (
                                                <TableRow key={video._id} className={!video.isActive ? 'opacity-50' : ''}>
                                                    <TableCell className="font-medium">{index + 1}</TableCell>
                                                    <TableCell>
                                                        <p className="font-semibold text-sm">{video.title}</p>
                                                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">{video.youtubeLink}</p>
                                                    </TableCell>
                                                    <TableCell>
                                                        <p className="text-sm font-medium">{video.representativeName || '—'}</p>
                                                        <p className="text-xs text-muted-foreground">{video.representativeDesignation || ''}</p>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                                                            {video.problemStatements.length === 0 ? (
                                                                <span className="text-xs text-gray-400 italic">No tags</span>
                                                            ) : (
                                                                video.problemStatements.map((ps) => (
                                                                    <Badge key={ps.problemId} variant="outline" className="text-[10px] bg-purple-50 text-purple-700 border-purple-200">
                                                                        {ps.problemTitle.length > 30 ? ps.problemTitle.slice(0, 30) + '...' : ps.problemTitle}
                                                                    </Badge>
                                                                ))
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Switch
                                                            checked={video.isActive}
                                                            onCheckedChange={(checked) => toggleVideoMutation.mutate({ id: video._id, isActive: checked })}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button variant="outline" size="sm" onClick={() => handleEditVideo(video)}>
                                                                <Pencil className="h-3 w-3" />
                                                            </Button>
                                                            <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => handleDeleteVideo(video)}>
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </TabsContent>

                    {/* ==================== IDEA SUBMISSIONS TAB ==================== */}
                    <TabsContent value="ideas" className="space-y-4">
                        {ideaLoading ? (
                            <Card>
                                <CardContent className="py-12 text-center">
                                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                                    <p className="mt-2 text-muted-foreground">Loading idea submissions...</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <>
                                {/* Submission Window Toggle */}
                                <Card className={`border-2 ${submissionWindowData?.isOpen !== false ? 'border-green-200 bg-green-50/30' : 'border-red-200 bg-red-50/30'}`}>
                                    <CardContent className="py-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                {submissionWindowData?.isOpen !== false ? (
                                                    <Unlock className="h-5 w-5 text-green-600" />
                                                ) : (
                                                    <Lock className="h-5 w-5 text-red-600" />
                                                )}
                                                <div>
                                                    <p className="font-semibold">Idea Submission Portal</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {submissionWindowData?.isOpen !== false
                                                            ? 'Teams can currently submit their ideas.'
                                                            : 'Idea submission portal is currently closed.'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium">
                                                    {submissionWindowData?.isOpen !== false ? 'Open' : 'Closed'}
                                                </span>
                                                <Switch
                                                    checked={submissionWindowData?.isOpen !== false}
                                                    onCheckedChange={(checked) => toggleSubmissionMutation.mutate(checked)}
                                                    disabled={toggleSubmissionMutation.isPending}
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Stats Cards */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <Card className="border-2 border-blue-200">
                                        <CardContent className="pt-4 pb-3 text-center">
                                            <p className="text-3xl font-bold text-blue-600">{ideaStats?.total || 0}</p>
                                            <p className="text-xs text-muted-foreground mt-1">Total Submissions</p>
                                        </CardContent>
                                    </Card>
                                    <Card className="border-2 border-amber-200">
                                        <CardContent className="pt-4 pb-3 text-center">
                                            <p className="text-3xl font-bold text-amber-600">{ideaStats?.pending || 0}</p>
                                            <p className="text-xs text-muted-foreground mt-1">Pending Review</p>
                                        </CardContent>
                                    </Card>
                                    <Card className="border-2 border-green-200">
                                        <CardContent className="pt-4 pb-3 text-center">
                                            <p className="text-3xl font-bold text-green-600">{ideaStats?.approved || 0}</p>
                                            <p className="text-xs text-muted-foreground mt-1">Shortlisted ✅</p>
                                        </CardContent>
                                    </Card>
                                    <Card className="border-2 border-red-200">
                                        <CardContent className="pt-4 pb-3 text-center">
                                            <p className="text-3xl font-bold text-red-600">{ideaStats?.rejected || 0}</p>
                                            <p className="text-xs text-muted-foreground mt-1">Rejected ❌</p>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* PS Filter Bar */}
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-sm font-medium text-muted-foreground">Filter by PS:</span>
                                    <Button
                                        size="sm"
                                        variant={ideaPsFilter === 'all' ? 'default' : 'outline'}
                                        onClick={() => setIdeaPsFilter('all')}
                                    >
                                        All
                                    </Button>
                                    {problems.map((p: any, i: number) => {
                                        const colors = psColors[i + 1] || psColors[1];
                                        return (
                                            <Button
                                                key={p._id}
                                                size="sm"
                                                variant="outline"
                                                className={`${ideaPsFilter === String(i + 1) ? colors.bg + ' ' + colors.text + ' ' + colors.border + ' border-2' : ''}`}
                                                onClick={() => setIdeaPsFilter(String(i + 1))}
                                            >
                                                PS{i + 1}
                                            </Button>
                                        );
                                    })}
                                </div>

                                {/* Submissions Table */}
                                {filteredIdeaSubmissions.length === 0 ? (
                                    <Card>
                                        <CardContent className="py-12 text-center">
                                            <Lightbulb className="h-10 w-10 mx-auto text-muted-foreground opacity-50" />
                                            <p className="mt-3 text-muted-foreground">No idea submissions yet.</p>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="border rounded-lg overflow-hidden">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Team</TableHead>
                                                    <TableHead>Problem Statement</TableHead>
                                                    <TableHead>Document</TableHead>
                                                    <TableHead>YouTube Video</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead className="text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredIdeaSubmissions.map((sub) => {
                                                    const psIdx = getPsIndex(sub.problemId?._id);
                                                    const colors = psColors[psIdx] || psColors[1];
                                                    return (
                                                        <TableRow key={sub._id}>
                                                            <TableCell>
                                                                <div>
                                                                    <p className="font-medium text-sm">{sub.teamId?.name || 'Unknown'}</p>
                                                                    <p className="text-xs text-muted-foreground">{sub.teamId?.instituteName}</p>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge className={colors.badge + ' border'}>
                                                                    PS{psIdx}: {sub.problemId?.title?.slice(0, 30)}{sub.problemId?.title?.length > 30 ? '...' : ''}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>
                                                                {sub.hasDocument ? (
                                                                    <div className="flex items-center gap-1">
                                                                        <span className="inline-flex items-center gap-1 text-xs text-green-700">
                                                                            <FileText className="h-3 w-3" /> {sub.documentOriginalName?.slice(0, 20)}{sub.documentOriginalName?.length > 20 ? '...' : ''}
                                                                        </span>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                const token = localStorage.getItem('token');
                                                                                const link = document.createElement('a');
                                                                                link.href = `${api.defaults.baseURL}/idea-submissions/admin/${sub._id}/download`;
                                                                                // Use fetch with auth header for download
                                                                                fetch(link.href, { headers: { Authorization: `Bearer ${token}` } })
                                                                                    .then(res => res.blob())
                                                                                    .then(blob => {
                                                                                        const url = window.URL.createObjectURL(blob);
                                                                                        const a = document.createElement('a');
                                                                                        a.href = url;
                                                                                        a.download = sub.documentOriginalName || 'document.docx';
                                                                                        a.click();
                                                                                        window.URL.revokeObjectURL(url);
                                                                                    })
                                                                                    .catch(() => alert('Download failed'));
                                                                            }}
                                                                            title="Download document"
                                                                        >
                                                                            <Download className="h-3 w-3" />
                                                                        </Button>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-xs text-muted-foreground">No document</span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="text-red-600 hover:text-red-700 p-0 h-auto"
                                                                    onClick={() => {
                                                                        setSelectedIdeaSubmission(sub);
                                                                        setIdeaReviewDialogOpen(true);
                                                                        setReviewNote(sub.reviewNote || '');
                                                                    }}
                                                                >
                                                                    <Youtube className="h-4 w-4 mr-1" /> View
                                                                </Button>
                                                            </TableCell>
                                                            <TableCell>
                                                                {sub.status === 'pending' && (
                                                                    <Badge className="bg-amber-100 text-amber-800 border border-amber-300">
                                                                        <Clock className="h-3 w-3 mr-1" /> Pending
                                                                    </Badge>
                                                                )}
                                                                {sub.status === 'approved' && (
                                                                    <Badge className="bg-green-100 text-green-800 border border-green-300">
                                                                        <CheckCircle className="h-3 w-3 mr-1" /> Approved
                                                                    </Badge>
                                                                )}
                                                                {sub.status === 'rejected' && (
                                                                    <Badge className="bg-red-100 text-red-800 border border-red-300">
                                                                        <XCircle className="h-3 w-3 mr-1" /> Rejected
                                                                    </Badge>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <div className="flex justify-end gap-2">
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className="text-green-700 hover:bg-green-50 border-green-300"
                                                                        onClick={() => reviewIdeaMutation.mutate({ id: sub._id, status: 'approved', reviewNote: '' })}
                                                                        disabled={sub.status === 'approved' || reviewIdeaMutation.isPending}
                                                                    >
                                                                        <CheckCircle className="h-3 w-3 mr-1" /> Approve
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className="text-red-700 hover:bg-red-50 border-red-300"
                                                                        onClick={() => {
                                                                            setSelectedIdeaSubmission(sub);
                                                                            setIdeaReviewDialogOpen(true);
                                                                            setReviewNote(sub.reviewNote || '');
                                                                        }}
                                                                        disabled={sub.status === 'rejected' || reviewIdeaMutation.isPending}
                                                                    >
                                                                        <XCircle className="h-3 w-3 mr-1" /> Reject
                                                                    </Button>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}

                                {/* Shortlisted & Rejected Sections */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Shortlisted Teams */}
                                    <Card className="border-green-200">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm flex items-center gap-2 text-green-700">
                                                <CheckCircle className="h-4 w-4" />
                                                Shortlisted Teams ({ideaSubmissions.filter(s => s.status === 'approved').length})
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {ideaSubmissions.filter(s => s.status === 'approved').length === 0 ? (
                                                <p className="text-xs text-muted-foreground">No teams shortlisted yet</p>
                                            ) : (
                                                <div className="space-y-1 max-h-48 overflow-y-auto">
                                                    {ideaSubmissions.filter(s => s.status === 'approved').map(s => {
                                                        const psIdx = getPsIndex(s.problemId?._id);
                                                        const colors = psColors[psIdx] || psColors[1];
                                                        return (
                                                            <div key={s._id} className="flex items-center justify-between py-1 px-2 rounded bg-green-50">
                                                                <span className="text-sm font-medium">{s.teamId?.name}</span>
                                                                <Badge className={colors.badge + ' border text-[10px] px-1.5 py-0'}>PS{psIdx}</Badge>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* Rejected Teams */}
                                    <Card className="border-red-200">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm flex items-center gap-2 text-red-700">
                                                <XCircle className="h-4 w-4" />
                                                Rejected Teams ({ideaSubmissions.filter(s => s.status === 'rejected').length})
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {ideaSubmissions.filter(s => s.status === 'rejected').length === 0 ? (
                                                <p className="text-xs text-muted-foreground">No teams rejected</p>
                                            ) : (
                                                <div className="space-y-1 max-h-48 overflow-y-auto">
                                                    {ideaSubmissions.filter(s => s.status === 'rejected').map(s => {
                                                        const psIdx = getPsIndex(s.problemId?._id);
                                                        const colors = psColors[psIdx] || psColors[1];
                                                        return (
                                                            <div key={s._id} className="flex items-center justify-between py-1 px-2 rounded bg-red-50">
                                                                <span className="text-sm font-medium">{s.teamId?.name}</span>
                                                                <Badge className={colors.badge + ' border text-[10px] px-1.5 py-0'}>PS{psIdx}</Badge>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            </>
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            {/* View Problem Details Dialog (simplified - no video editing here) */}
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

            {/* Create Video Dialog */}
            <Dialog open={isVideoCreateOpen} onOpenChange={setIsVideoCreateOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Add New Video</DialogTitle>
                        <DialogDescription>Add a new SMC department briefing video.</DialogDescription>
                    </DialogHeader>
                    {videoFormContent}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsVideoCreateOpen(false)}>Cancel</Button>
                        <Button onClick={handleSubmitCreateVideo} disabled={createVideoMutation.isPending}
                            className="bg-[#8B2A3B] hover:bg-[#6d2130] text-white">
                            {createVideoMutation.isPending ? 'Creating...' : 'Create Video'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Video Dialog */}
            <Dialog open={isVideoEditOpen} onOpenChange={setIsVideoEditOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Edit Video</DialogTitle>
                        <DialogDescription>Update video details and problem statement tags.</DialogDescription>
                    </DialogHeader>
                    {videoFormContent}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsVideoEditOpen(false)}>Cancel</Button>
                        <Button onClick={handleSubmitEditVideo} disabled={updateVideoMutation.isPending}
                            className="bg-[#8B2A3B] hover:bg-[#6d2130] text-white">
                            {updateVideoMutation.isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Video Confirmation Dialog */}
            <Dialog open={isVideoDeleteOpen} onOpenChange={setIsVideoDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Video</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this video? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 px-2 bg-red-50 border border-red-200 rounded-lg">
                        <p className="font-semibold text-red-800 text-sm">{selectedVideo?.title}</p>
                        <p className="text-xs text-red-600 mt-1">{selectedVideo?.representativeName}</p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsVideoDeleteOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={() => selectedVideo && deleteVideoMutation.mutate(selectedVideo._id)}
                            disabled={deleteVideoMutation.isPending}>
                            {deleteVideoMutation.isPending ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Idea Submission Review Dialog */}
            <Dialog open={ideaReviewDialogOpen} onOpenChange={setIdeaReviewDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Lightbulb className="h-5 w-5" />
                            Review Idea Submission
                        </DialogTitle>
                        <DialogDescription>
                            {selectedIdeaSubmission?.teamId?.name} — {selectedIdeaSubmission?.teamId?.instituteName}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedIdeaSubmission && (
                        <div className="space-y-4 py-2">
                            {/* Problem Statement Badge */}
                            <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1">Problem Statement</p>
                                {(() => {
                                    const psIdx = getPsIndex(selectedIdeaSubmission.problemId?._id);
                                    const colors = psColors[psIdx] || psColors[1];
                                    return (
                                        <Badge className={colors.badge + ' border'}>
                                            PS{psIdx}: {selectedIdeaSubmission.problemId?.title}
                                        </Badge>
                                    );
                                })()}
                            </div>

                            {/* Embedded YouTube Video */}
                            <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1">YouTube Video</p>
                                {(() => {
                                    const embedUrl = getYoutubeEmbedUrl(selectedIdeaSubmission.youtubeVideoLink);
                                    return embedUrl ? (
                                        <div className="aspect-video rounded-lg overflow-hidden border">
                                            <iframe
                                                src={embedUrl}
                                                title="Idea Submission Video"
                                                className="w-full h-full"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            />
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">Unable to embed video</p>
                                    );
                                })()}
                            </div>

                            {/* Document */}
                            <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1">Document</p>
                                <div className="flex items-center gap-2 p-2 bg-muted rounded">
                                    <FileText className="h-4 w-4 text-blue-600" />
                                    <span className="text-sm flex-1">{selectedIdeaSubmission.documentOriginalName}</span>
                                    {selectedIdeaSubmission.hasDocument && (
                                        <>
                                            <Badge variant="outline" className="text-green-700 border-green-300 text-xs">Uploaded to Drive</Badge>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-7 text-xs gap-1"
                                                onClick={() => {
                                                    const token = localStorage.getItem('token');
                                                    fetch(`${api.defaults.baseURL}/idea-submissions/admin/${selectedIdeaSubmission._id}/download`, {
                                                        headers: { Authorization: `Bearer ${token}` }
                                                    })
                                                        .then(res => res.blob())
                                                        .then(blob => {
                                                            const url = window.URL.createObjectURL(blob);
                                                            const a = document.createElement('a');
                                                            a.href = url;
                                                            a.download = selectedIdeaSubmission.documentOriginalName || 'document.docx';
                                                            a.click();
                                                            window.URL.revokeObjectURL(url);
                                                        })
                                                        .catch(() => alert('Download failed'));
                                                }}
                                            >
                                                <Download className="h-3 w-3" /> Download
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Submitted Info */}
                            <div className="text-xs text-muted-foreground">
                                <p>Submitted by: {selectedIdeaSubmission.submittedBy?.name} ({selectedIdeaSubmission.submittedBy?.email})</p>
                                <p>Date: {new Date(selectedIdeaSubmission.createdAt).toLocaleString()}</p>
                            </div>

                            {/* Review Note */}
                            <div>
                                <label className="text-sm font-medium mb-1 block">Review Note (optional)</label>
                                <Textarea
                                    placeholder="Add feedback or reason for approval/rejection..."
                                    value={reviewNote}
                                    onChange={(e) => setReviewNote(e.target.value)}
                                    className="min-h-[80px]"
                                    maxLength={1000}
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter className="flex gap-2">
                        <Button variant="outline" onClick={() => setIdeaReviewDialogOpen(false)}>Cancel</Button>
                        <Button
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => selectedIdeaSubmission && reviewIdeaMutation.mutate({ id: selectedIdeaSubmission._id, status: 'approved', reviewNote })}
                            disabled={reviewIdeaMutation.isPending}
                        >
                            <CheckCircle className="h-4 w-4 mr-1" /> Approve
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => selectedIdeaSubmission && reviewIdeaMutation.mutate({ id: selectedIdeaSubmission._id, status: 'rejected', reviewNote })}
                            disabled={reviewIdeaMutation.isPending}
                        >
                            <XCircle className="h-4 w-4 mr-1" /> Reject
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
};

export default AdminProblemsPage;
