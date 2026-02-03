import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

import {
    Pencil,

    Trash2,
    UserPlus,
    Users,
    Loader2,
    Search,
    X
} from 'lucide-react';
import { mentorService } from '@/services/mentorService';
import { toast } from 'sonner';
import api from '@/lib/api';
import type { Mentor } from '@/types/mentor';

const AdminMentorPage = () => {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState('');



    // Fetch mentors
    const { data: mentors = [], isLoading: loadingMentors } = useQuery({
        queryKey: ['adminMentors'],
        queryFn: mentorService.getMentors
    });

    // Fetch teams for assignment
    const { data: teamsData } = useQuery({
        queryKey: ['adminTeamsForMentor'],
        queryFn: async () => {
            const { data } = await api.get('/teams?status=approved');
            return data;
        }
    });
    const teams = teamsData?.teams || teamsData || [];



    // Delete mentor mutation
    const deleteMentorMutation = useMutation({
        mutationFn: mentorService.deleteMentor,
        onSuccess: () => {
            toast.success('Mentor deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['adminMentors'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to delete mentor');
        }
    });




    // Unassign mentor mutation
    const unassignMentorMutation = useMutation({
        mutationFn: mentorService.unassignMentor,
        onSuccess: () => {
            toast.success('Mentor unassigned successfully');
            queryClient.invalidateQueries({ queryKey: ['adminMentors'] });
            queryClient.invalidateQueries({ queryKey: ['adminTeamsForMentor'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to unassign mentor');
        }
    });

    // Filter mentors by search
    const filteredMentors = mentors.filter((mentor: Mentor) =>
        mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mentor.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Get teams without mentors
    const teamsWithoutMentor = teams.filter((t: any) => !t.mentorId);

    return (
        <DashboardLayout role="admin">
            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Mentor Management</h2>
                        <p className="text-muted-foreground">Create and manage mentors for teams</p>
                    </div>
                </div>
                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Mentors</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{mentors.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Teams with Mentors</CardTitle>
                            <UserPlus className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {teams.filter((t: any) => t.mentorId).length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Teams without Mentors</CardTitle>
                            <Users className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{teamsWithoutMentor.length}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search */}
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search mentors..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Mentors Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Mentors</CardTitle>
                        <CardDescription>All registered mentors in the system</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loadingMentors ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin" />
                            </div>
                        ) : filteredMentors.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Expertise</TableHead>
                                        <TableHead>Assigned Teams</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredMentors.map((mentor: Mentor) => (
                                        <TableRow key={mentor._id}>
                                            <TableCell className="font-medium">{mentor.name}</TableCell>
                                            <TableCell>{mentor.email}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {mentor.expertise && mentor.expertise.length > 0 ? (
                                                        mentor.expertise.map((exp, i) => (
                                                            <Badge key={i} variant="secondary">{exp}</Badge>
                                                        ))
                                                    ) : (
                                                        <span className="text-muted-foreground">-</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {Array.isArray(mentor.assignedTeams) && mentor.assignedTeams.length > 0 ? (
                                                    <div className="space-y-1">
                                                        {(mentor.assignedTeams as any[]).map((team: any) => (
                                                            <div key={team._id || team} className="flex items-center gap-1">
                                                                <Badge variant="outline">{team.name || team}</Badge>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-5 w-5"
                                                                    onClick={() => unassignMentorMutation.mutate(team._id || team)}
                                                                >
                                                                    <X className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">None</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        if (confirm('Are you sure you want to delete this mentor?')) {
                                                            deleteMentorMutation.mutate(mentor._id);
                                                        }
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No mentors found</p>
                                <p className="text-sm">Create a mentor to get started</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div >
        </DashboardLayout >
    );
};

export default AdminMentorPage;
