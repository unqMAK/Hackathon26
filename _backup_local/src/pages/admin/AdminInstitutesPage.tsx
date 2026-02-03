import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Loader2 } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Building } from 'lucide-react';
import { toast } from 'sonner';

interface Institute {
    id: string;
    name: string;
    location: string;
    spocCount: number;
    teamCount: number;
    mentorCount: number;
}

const AdminInstitutesPage = () => {
    const queryClient = useQueryClient();
    const [newInstitute, setNewInstitute] = useState({ name: '', code: '' }); // Changed location to code as per model
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const { data: institutes = [], isLoading } = useQuery({
        queryKey: ['institutes'],
        queryFn: async () => {
            const { data } = await api.get('/institutes');
            return data;
        }
    });

    const createInstituteMutation = useMutation({
        mutationFn: async (data: { name: string; code: string }) => {
            return await api.post('/institutes', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['institutes'] });
            setNewInstitute({ name: '', code: '' });
            setIsDialogOpen(false);
            toast.success('Institute added successfully!');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to add institute');
        }
    });

    const handleAddInstitute = () => {
        if (newInstitute.name && newInstitute.code) {
            createInstituteMutation.mutate(newInstitute);
        } else {
            toast.error('Please fill in all fields');
        }
    };

    return (
        <DashboardLayout role="admin">
            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Institutes</h2>
                        <p className="text-muted-foreground">Manage participating institutes.</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Institutes ({institutes.length})</CardTitle>
                        <CardDescription>Registered educational institutions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Institute Name</TableHead>
                                    <TableHead>Code</TableHead>
                                    <TableHead>SPOCs</TableHead>
                                    <TableHead>Mentors</TableHead>
                                    <TableHead>Teams</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-4">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                        </TableCell>
                                    </TableRow>
                                ) : institutes.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                                            No institutes found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    institutes.map((institute: any) => (
                                        <TableRow key={institute._id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Building className="h-4 w-4 text-muted-foreground" />
                                                    {institute.name}
                                                </div>
                                            </TableCell>
                                            <TableCell>{institute.code}</TableCell>
                                            <TableCell>{institute.spocCount}</TableCell>
                                            <TableCell>{institute.mentorCount}</TableCell>
                                            <TableCell>{institute.teamCount}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default AdminInstitutesPage;
