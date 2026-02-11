import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
} from "@/components/ui/table";
import { Switch } from '@/components/ui/switch';
import { Plus, Pencil, Trash2, HelpCircle, MessageSquare, Loader2, FolderPlus } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';

interface FAQ {
    _id: string;
    question: string;
    answer: string;
    section: string;
    order: number;
    isActive: boolean;
}

const AdminFAQsPage = () => {
    const queryClient = useQueryClient();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isNewSectionOpen, setIsNewSectionOpen] = useState(false);
    const [selectedFaq, setSelectedFaq] = useState<FAQ | null>(null);
    const [filterSection, setFilterSection] = useState('all');
    const [newSectionName, setNewSectionName] = useState('');
    const [customSections, setCustomSections] = useState<string[]>([]);

    // Form state
    const [formQuestion, setFormQuestion] = useState('');
    const [formAnswer, setFormAnswer] = useState('');
    const [formSection, setFormSection] = useState('General');
    const [formIsActive, setFormIsActive] = useState(true);

    // Fetch FAQs
    const { data, isLoading } = useQuery<{ faqs: FAQ[]; sections: string[] }>({
        queryKey: ['adminFaqs'],
        queryFn: async () => {
            const response = await api.get('/faqs/admin');
            return response.data;
        }
    });

    const faqs = data?.faqs || [];
    const sections = [...new Set([...(data?.sections || ['General', 'Technical', 'Evaluation']), ...customSections])];

    // Create FAQ mutation
    const createMutation = useMutation({
        mutationFn: async (faqData: any) => {
            const response = await api.post('/faqs', faqData);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminFaqs'] });
            toast.success('FAQ created successfully');
            setIsCreateOpen(false);
            resetForm();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create FAQ');
        }
    });

    // Update FAQ mutation
    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            const response = await api.put(`/faqs/${id}`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminFaqs'] });
            toast.success('FAQ updated successfully');
            setIsEditOpen(false);
            resetForm();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update FAQ');
        }
    });

    // Delete FAQ mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await api.delete(`/faqs/${id}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminFaqs'] });
            toast.success('FAQ deleted successfully');
            setIsDeleteOpen(false);
            setSelectedFaq(null);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to delete FAQ');
        }
    });

    // Toggle active mutation
    const toggleMutation = useMutation({
        mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
            const response = await api.put(`/faqs/${id}`, { isActive });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminFaqs'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to toggle FAQ');
        }
    });

    const resetForm = () => {
        setFormQuestion('');
        setFormAnswer('');
        setFormSection('General');
        setFormIsActive(true);
    };

    const handleCreate = () => {
        resetForm();
        setIsCreateOpen(true);
    };

    const handleEdit = (faq: FAQ) => {
        setSelectedFaq(faq);
        setFormQuestion(faq.question);
        setFormAnswer(faq.answer);
        setFormSection(faq.section);
        setFormIsActive(faq.isActive);
        setIsEditOpen(true);
    };

    const handleDelete = (faq: FAQ) => {
        setSelectedFaq(faq);
        setIsDeleteOpen(true);
    };

    const handleSubmitCreate = () => {
        if (!formQuestion.trim() || !formAnswer.trim()) {
            toast.error('Question and answer are required');
            return;
        }
        createMutation.mutate({
            question: formQuestion,
            answer: formAnswer,
            section: formSection,
            isActive: formIsActive
        });
    };

    const handleSubmitEdit = () => {
        if (!selectedFaq || !formQuestion.trim() || !formAnswer.trim()) {
            toast.error('Question and answer are required');
            return;
        }
        updateMutation.mutate({
            id: selectedFaq._id,
            data: {
                question: formQuestion,
                answer: formAnswer,
                section: formSection,
                isActive: formIsActive
            }
        });
    };

    const handleAddSection = () => {
        if (!newSectionName.trim()) {
            toast.error('Section name is required');
            return;
        }
        const sectionName = newSectionName.trim();
        // Add to custom sections so it appears in dropdowns
        setCustomSections(prev => [...new Set([...prev, sectionName])]);
        setFormSection(sectionName);
        setNewSectionName('');
        setIsNewSectionOpen(false);
        // Now auto-open the Create FAQ dialog with this section
        resetForm();
        setFormSection(sectionName);
        setIsCreateOpen(true);
        toast.success(`Section "${sectionName}" created! Add your first FAQ to it.`);
    };

    const filteredFaqs = filterSection === 'all' ? faqs : faqs.filter(f => f.section === filterSection);

    // Group FAQs by section for stats
    const sectionStats: { [key: string]: number } = {};
    faqs.forEach(f => {
        sectionStats[f.section] = (sectionStats[f.section] || 0) + 1;
    });

    return (
        <DashboardLayout role="admin">
            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">FAQ Management</h2>
                        <p className="text-muted-foreground">Manage frequently asked questions displayed on the public FAQ page.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setIsNewSectionOpen(true)}>
                            <FolderPlus className="h-4 w-4 mr-2" /> New Section
                        </Button>
                        <Button onClick={handleCreate} className="bg-[#8B2A3B] hover:bg-[#6d2130] text-white">
                            <Plus className="h-4 w-4 mr-2" /> Add FAQ
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-3">
                                <HelpCircle className="h-8 w-8 text-blue-600" />
                                <div>
                                    <p className="text-2xl font-bold">{faqs.length}</p>
                                    <p className="text-sm text-muted-foreground">Total FAQs</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-green-200 bg-green-50/30">
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-3">
                                <MessageSquare className="h-8 w-8 text-green-600" />
                                <div>
                                    <p className="text-2xl font-bold text-green-700">{faqs.filter(f => f.isActive).length}</p>
                                    <p className="text-sm text-green-600">Active FAQs</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-orange-200 bg-orange-50/30">
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-3">
                                <MessageSquare className="h-8 w-8 text-orange-600" />
                                <div>
                                    <p className="text-2xl font-bold text-orange-700">{Object.keys(sectionStats).length}</p>
                                    <p className="text-sm text-orange-600">Sections</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-purple-200 bg-purple-50/30">
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-3">
                                <MessageSquare className="h-8 w-8 text-purple-600" />
                                <div>
                                    <p className="text-2xl font-bold text-purple-700">{faqs.filter(f => !f.isActive).length}</p>
                                    <p className="text-sm text-purple-600">Inactive FAQs</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Section Filter */}
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">Filter by Section</CardTitle>
                            <div className="flex gap-2 flex-wrap">
                                <Button
                                    size="sm"
                                    variant={filterSection === 'all' ? 'default' : 'outline'}
                                    onClick={() => setFilterSection('all')}
                                    className={filterSection === 'all' ? 'bg-[#8B2A3B] text-white' : ''}
                                >
                                    All ({faqs.length})
                                </Button>
                                {Object.entries(sectionStats).map(([section, count]) => (
                                    <Button
                                        key={section}
                                        size="sm"
                                        variant={filterSection === section ? 'default' : 'outline'}
                                        onClick={() => setFilterSection(section)}
                                        className={filterSection === section ? 'bg-[#8B2A3B] text-white' : ''}
                                    >
                                        {section} ({count})
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* FAQ Table */}
                {isLoading ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                            <p className="mt-2 text-muted-foreground">Loading FAQs...</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="rounded-md border bg-card">
                        <Table>
                            <TableHeader className="bg-gray-50/50">
                                <TableRow>
                                    <TableHead className="w-[50px] font-bold">#</TableHead>
                                    <TableHead className="font-bold">Question</TableHead>
                                    <TableHead className="font-bold max-w-xs">Answer</TableHead>
                                    <TableHead className="font-bold">Section</TableHead>
                                    <TableHead className="font-bold">Status</TableHead>
                                    <TableHead className="text-right font-bold">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredFaqs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                            No FAQs found. Click "Add FAQ" to create one.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredFaqs.map((faq, index) => (
                                        <TableRow key={faq._id} className={!faq.isActive ? 'opacity-50' : ''}>
                                            <TableCell className="font-medium">{index + 1}</TableCell>
                                            <TableCell className="font-semibold max-w-sm">
                                                <p className="truncate">{faq.question}</p>
                                            </TableCell>
                                            <TableCell className="max-w-xs">
                                                <p className="truncate text-muted-foreground text-sm">{faq.answer}</p>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                    {faq.section}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Switch
                                                    checked={faq.isActive}
                                                    onCheckedChange={(checked) => toggleMutation.mutate({ id: faq._id, isActive: checked })}
                                                />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" size="sm" onClick={() => handleEdit(faq)}>
                                                        <Pencil className="h-3 w-3" />
                                                    </Button>
                                                    <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => handleDelete(faq)}>
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
            </div>

            {/* Create FAQ Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Add New FAQ</DialogTitle>
                        <DialogDescription>Create a new frequently asked question.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-1 block">Question *</label>
                            <Input
                                placeholder="Enter the question..."
                                value={formQuestion}
                                onChange={(e) => setFormQuestion(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-1 block">Answer *</label>
                            <Textarea
                                placeholder="Enter the answer..."
                                value={formAnswer}
                                onChange={(e) => setFormAnswer(e.target.value)}
                                rows={4}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-1 block">Section</label>
                            <Select value={formSection} onValueChange={setFormSection}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {[...new Set([...sections, formSection])].map(s => (
                                        <SelectItem key={s} value={s}>{s}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-3">
                            <label className="text-sm font-semibold text-gray-700">Active</label>
                            <Switch checked={formIsActive} onCheckedChange={setFormIsActive} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                        <Button onClick={handleSubmitCreate} disabled={createMutation.isPending}
                            className="bg-[#8B2A3B] hover:bg-[#6d2130] text-white">
                            {createMutation.isPending ? 'Creating...' : 'Create FAQ'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit FAQ Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Edit FAQ</DialogTitle>
                        <DialogDescription>Update this frequently asked question.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-1 block">Question *</label>
                            <Input
                                placeholder="Enter the question..."
                                value={formQuestion}
                                onChange={(e) => setFormQuestion(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-1 block">Answer *</label>
                            <Textarea
                                placeholder="Enter the answer..."
                                value={formAnswer}
                                onChange={(e) => setFormAnswer(e.target.value)}
                                rows={4}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-1 block">Section</label>
                            <Select value={formSection} onValueChange={setFormSection}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {[...new Set([...sections, formSection])].map(s => (
                                        <SelectItem key={s} value={s}>{s}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-3">
                            <label className="text-sm font-semibold text-gray-700">Active</label>
                            <Switch checked={formIsActive} onCheckedChange={setFormIsActive} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                        <Button onClick={handleSubmitEdit} disabled={updateMutation.isPending}
                            className="bg-[#8B2A3B] hover:bg-[#6d2130] text-white">
                            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete FAQ</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this FAQ? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 px-2 bg-red-50 border border-red-200 rounded-lg">
                        <p className="font-semibold text-red-800 text-sm">{selectedFaq?.question}</p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={() => selectedFaq && deleteMutation.mutate(selectedFaq._id)}
                            disabled={deleteMutation.isPending}>
                            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* New Section Dialog */}
            <Dialog open={isNewSectionOpen} onOpenChange={setIsNewSectionOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Create New Section</DialogTitle>
                        <DialogDescription>Add a new FAQ section category.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Input
                            placeholder="e.g. Registration, Payment, etc."
                            value={newSectionName}
                            onChange={(e) => setNewSectionName(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsNewSectionOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddSection} className="bg-[#8B2A3B] hover:bg-[#6d2130] text-white">
                            Add Section
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
};

export default AdminFAQsPage;
