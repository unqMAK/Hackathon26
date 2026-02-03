import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
    UserCheck,
    Users,
    Loader2,
    ClipboardList
} from 'lucide-react';
import { evaluationService } from '@/services/evaluationService';
import { api } from '@/services/api';
import { toast } from 'sonner';
import type { JudgeWithAssignments } from '@/types/evaluation';

interface Team {
    _id: string;
    name: string;
    problemId?: {
        title: string;
    };
}

const AssignJudgesPage = () => {
    const queryClient = useQueryClient();

    const [selectedJudge, setSelectedJudge] = useState<JudgeWithAssignments | null>(null);
    const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Fetch judges
    const { data: judges = [], isLoading: loadingJudges } = useQuery({
        queryKey: ['judgesWithAssignments'],
        queryFn: evaluationService.getJudgesWithAssignments
    });

    // Fetch all approved teams
    const { data: teams = [], isLoading: loadingTeams } = useQuery({
        queryKey: ['approvedTeams'],
        queryFn: async () => {
            const { data } = await api.get('/teams?status=approved');
            return data;
        }
    });

    // Assign mutation
    const assignMutation = useMutation({
        mutationFn: evaluationService.assignTeamsToJudge,
        onSuccess: () => {
            toast.success('Teams assigned successfully');
            queryClient.invalidateQueries({ queryKey: ['judgesWithAssignments'] });
            handleCloseDialog();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to assign teams');
        }
    });

    const handleOpenDialog = (judge: JudgeWithAssignments) => {
        setSelectedJudge(judge);
        setSelectedTeamIds(judge.assignedTeams?.map(t => t._id) || []);
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setSelectedJudge(null);
        setSelectedTeamIds([]);
    };

    const handleToggleTeam = (teamId: string) => {
        setSelectedTeamIds(prev =>
            prev.includes(teamId)
                ? prev.filter(id => id !== teamId)
                : [...prev, teamId]
        );
    };

    const handleSelectAll = () => {
        if (selectedTeamIds.length === teams.length) {
            setSelectedTeamIds([]);
        } else {
            setSelectedTeamIds(teams.map((t: Team) => t._id));
        }
    };

    const handleSubmit = () => {
        if (!selectedJudge) return;

        assignMutation.mutate({
            judgeId: selectedJudge._id,
            teamIds: selectedTeamIds
        });
    };

    const isLoading = loadingJudges || loadingTeams;

    return (
        <DashboardLayout role="admin">
            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Assign Judges</h2>
                        <p className="text-muted-foreground">
                            Assign teams to judges for evaluation.
                        </p>
                    </div>
                    {judges.length > 0 && (
                        <Button
                            onClick={() => judges.length > 0 && handleOpenDialog(judges[0])}
                            disabled={judges.length === 0}
                        >
                            <UserCheck className="mr-2 h-4 w-4" />
                            Quick Assign
                        </Button>
                    )}
                </div>

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Judges</CardTitle>
                            <UserCheck className="h-4 w-4 text-purple-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{judges.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Approved Teams</CardTitle>
                            <Users className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{teams.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Assignments Made</CardTitle>
                            <ClipboardList className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {judges.reduce((sum: number, j: JudgeWithAssignments) =>
                                    sum + (j.assignedTeams?.length || 0), 0
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Judges Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Judges</CardTitle>
                        <CardDescription>
                            Click "Manage" to assign teams to each judge.
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
                                        <TableHead>Judge Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Assigned Teams</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {judges.map((judge: JudgeWithAssignments) => (
                                        <TableRow key={judge._id}>
                                            <TableCell className="font-medium">{judge.name}</TableCell>
                                            <TableCell>{judge.email}</TableCell>
                                            <TableCell>
                                                {judge.assignedTeams?.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {judge.assignedTeams.slice(0, 3).map(team => (
                                                            <Badge key={team._id} variant="secondary">
                                                                {team.name}
                                                            </Badge>
                                                        ))}
                                                        {judge.assignedTeams.length > 3 && (
                                                            <Badge variant="outline">
                                                                +{judge.assignedTeams.length - 3} more
                                                            </Badge>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">No teams assigned</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleOpenDialog(judge)}
                                                >
                                                    Manage Assignments
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {judges.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-8">
                                                No judges found. Create judge accounts first.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Assignment Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            Assign Teams to {selectedJudge?.name}
                        </DialogTitle>
                        <DialogDescription>
                            Select teams for this judge to evaluate.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-sm text-muted-foreground">
                                {selectedTeamIds.length} of {teams.length} teams selected
                            </span>
                            <Button variant="outline" size="sm" onClick={handleSelectAll}>
                                {selectedTeamIds.length === teams.length ? 'Deselect All' : 'Select All'}
                            </Button>
                        </div>
                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                            {teams.map((team: Team) => (
                                <div
                                    key={team._id}
                                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                                    onClick={() => handleToggleTeam(team._id)}
                                >
                                    <Checkbox
                                        checked={selectedTeamIds.includes(team._id)}
                                        onCheckedChange={() => handleToggleTeam(team._id)}
                                    />
                                    <div className="flex-1">
                                        <p className="font-medium">{team.name}</p>
                                        {team.problemId?.title && (
                                            <p className="text-sm text-muted-foreground">
                                                {team.problemId.title}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {teams.length === 0 && (
                                <p className="text-center py-4 text-muted-foreground">
                                    No approved teams available.
                                </p>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={handleCloseDialog}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={assignMutation.isPending}
                        >
                            {assignMutation.isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Save Assignments
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
};

export default AssignJudgesPage;
