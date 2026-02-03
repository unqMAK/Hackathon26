import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Plus,
    Pencil,
    Trash2,
    Loader2,
    AlertCircle,
    CheckCircle,
    GripVertical
} from 'lucide-react';
import { evaluationService } from '@/services/evaluationService';
import { toast } from 'sonner';
import type { Rubric, RubricInput } from '@/types/evaluation';

const AdminRubricsPage = () => {
    const queryClient = useQueryClient();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingRubric, setEditingRubric] = useState<Rubric | null>(null);
    const [formData, setFormData] = useState<RubricInput>({
        title: '',
        description: '',
        maxScore: 10,
        weight: 0.2
    });

    // Fetch rubrics (all including inactive)
    const { data: rubrics = [], isLoading } = useQuery({
        queryKey: ['rubrics', 'all'],
        queryFn: () => evaluationService.getRubrics(true)
    });

    // Validate weights
    const { data: weightValidation } = useQuery({
        queryKey: ['rubricWeights'],
        queryFn: evaluationService.validateWeights
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: evaluationService.createRubric,
        onSuccess: () => {
            toast.success('Rubric created successfully');
            queryClient.invalidateQueries({ queryKey: ['rubrics'] });
            queryClient.invalidateQueries({ queryKey: ['rubricWeights'] });
            handleCloseDialog();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create rubric');
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<RubricInput & { isActive: boolean }> }) =>
            evaluationService.updateRubric(id, data),
        onSuccess: () => {
            toast.success('Rubric updated successfully');
            queryClient.invalidateQueries({ queryKey: ['rubrics'] });
            queryClient.invalidateQueries({ queryKey: ['rubricWeights'] });
            handleCloseDialog();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update rubric');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: evaluationService.deleteRubric,
        onSuccess: () => {
            toast.success('Rubric deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['rubrics'] });
            queryClient.invalidateQueries({ queryKey: ['rubricWeights'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to delete rubric');
        }
    });

    const handleOpenDialog = (rubric?: Rubric) => {
        if (rubric) {
            setEditingRubric(rubric);
            setFormData({
                title: rubric.title,
                description: rubric.description || '',
                maxScore: rubric.maxScore,
                weight: rubric.weight
            });
        } else {
            setEditingRubric(null);
            setFormData({
                title: '',
                description: '',
                maxScore: 10,
                weight: 0.2
            });
        }
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setEditingRubric(null);
        setFormData({ title: '', description: '', maxScore: 10, weight: 0.2 });
    };

    const handleSubmit = () => {
        if (!formData.title.trim()) {
            toast.error('Title is required');
            return;
        }
        if (formData.weight <= 0 || formData.weight > 1) {
            toast.error('Weight must be between 0 and 1');
            return;
        }

        if (editingRubric) {
            updateMutation.mutate({ id: editingRubric._id, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const handleToggleActive = (rubric: Rubric) => {
        updateMutation.mutate({
            id: rubric._id,
            data: { isActive: !rubric.isActive }
        });
    };

    const handleDelete = (rubric: Rubric) => {
        if (confirm(`Are you sure you want to delete "${rubric.title}"?`)) {
            deleteMutation.mutate(rubric._id);
        }
    };

    const activeRubrics = rubrics.filter((r: Rubric) => r.isActive);
    const totalWeight = activeRubrics.reduce((sum: number, r: Rubric) => sum + r.weight, 0);

    return (
        <DashboardLayout role="admin">
            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Evaluation Rubrics</h2>
                        <p className="text-muted-foreground">
                            Manage scoring criteria for team evaluations.
                        </p>
                    </div>
                    <Button onClick={() => handleOpenDialog()}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Rubric
                    </Button>
                </div>

                {/* Weight Validation Banner */}
                <Card className={totalWeight === 1 ? 'border-green-500 bg-green-50' : 'border-amber-500 bg-amber-50'}>
                    <CardContent className="py-4">
                        <div className="flex items-center gap-3">
                            {totalWeight === 1 ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                                <AlertCircle className="h-5 w-5 text-amber-600" />
                            )}
                            <div>
                                <p className={totalWeight === 1 ? 'text-green-800' : 'text-amber-800'}>
                                    Total Weight: <strong>{(totalWeight * 100).toFixed(0)}%</strong>
                                    {totalWeight !== 1 && (
                                        <span className="ml-2">
                                            (Should be 100% for accurate scoring)
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Rubrics Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Rubrics ({activeRubrics.length} active)</CardTitle>
                        <CardDescription>
                            Define scoring criteria with weights that sum to 100%.
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
                                        <TableHead className="w-[50px]">Order</TableHead>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Max Score</TableHead>
                                        <TableHead>Weight</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rubrics.map((rubric: Rubric) => (
                                        <TableRow key={rubric._id} className={!rubric.isActive ? 'opacity-50' : ''}>
                                            <TableCell>
                                                <GripVertical className="h-4 w-4 text-muted-foreground" />
                                            </TableCell>
                                            <TableCell className="font-medium">{rubric.title}</TableCell>
                                            <TableCell className="max-w-[200px] truncate">
                                                {rubric.description || '-'}
                                            </TableCell>
                                            <TableCell>{rubric.maxScore}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {(rubric.weight * 100).toFixed(0)}%
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Switch
                                                    checked={rubric.isActive}
                                                    onCheckedChange={() => handleToggleActive(rubric)}
                                                />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleOpenDialog(rubric)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(rubric)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {rubrics.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8">
                                                No rubrics defined yet. Add your first rubric to get started.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingRubric ? 'Edit Rubric' : 'Add New Rubric'}
                        </DialogTitle>
                        <DialogDescription>
                            Define a scoring criterion for team evaluations.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g., Innovation & Creativity"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Describe what judges should evaluate..."
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="maxScore">Max Score</Label>
                                <Input
                                    id="maxScore"
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={formData.maxScore}
                                    onChange={(e) => setFormData({ ...formData, maxScore: parseInt(e.target.value) || 10 })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="weight">Weight (0-1)</Label>
                                <Input
                                    id="weight"
                                    type="number"
                                    step="0.05"
                                    min="0"
                                    max="1"
                                    value={formData.weight}
                                    onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
                                />
                                <p className="text-xs text-muted-foreground">
                                    {(formData.weight * 100).toFixed(0)}% of total score
                                </p>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={handleCloseDialog}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={createMutation.isPending || updateMutation.isPending}
                        >
                            {(createMutation.isPending || updateMutation.isPending) && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {editingRubric ? 'Update' : 'Create'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
};

export default AdminRubricsPage;
