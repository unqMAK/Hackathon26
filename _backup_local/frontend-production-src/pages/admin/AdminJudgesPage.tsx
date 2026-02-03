import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Plus, Mail, UserPlus } from 'lucide-react';
import { useUsers } from '@/hooks/useMockData';
import { useNavigate } from 'react-router-dom';

const AdminJudgesPage = () => {
    const { data: users = [] } = useUsers();
    const judges = users.filter(u => u.role === 'judge');
    const navigate = useNavigate();

    return (
        <DashboardLayout role="admin">
            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Judges</h2>
                        <p className="text-muted-foreground">Manage hackathon judges and evaluators.</p>
                    </div>
                    <Button onClick={() => navigate('/admin/assign-judges')}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Assign Teams
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Judges ({judges.length})</CardTitle>
                        <CardDescription>Registered judges for evaluation.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Assigned Submissions</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {judges.map((judge) => (
                                    <TableRow key={judge.id}>
                                        <TableCell className="font-medium">{judge.name}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-muted-foreground" />
                                                {judge.email}
                                            </div>
                                        </TableCell>
                                        <TableCell>0</TableCell>
                                        <TableCell>
                                            <Badge variant="default">Active</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {judges.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-4">
                                            No judges registered yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default AdminJudgesPage;
