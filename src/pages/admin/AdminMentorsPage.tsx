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
import { Plus, Mail } from 'lucide-react';
import { useUsers } from '@/hooks/useMockData';

const AdminMentorsPage = () => {
    const { data: users = [] } = useUsers();
    const mentors = users.filter(u => u.role === 'mentor');

    return (
        <DashboardLayout role="admin">
            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Mentors</h2>
                        <p className="text-muted-foreground">Manage hackathon mentors and advisors.</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Mentors ({mentors.length})</CardTitle>
                        <CardDescription>Registered mentors for team guidance.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Assigned Teams</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mentors.map((mentor) => (
                                    <TableRow key={mentor.id}>
                                        <TableCell className="font-medium">{mentor.name}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-muted-foreground" />
                                                {mentor.email}
                                            </div>
                                        </TableCell>
                                        <TableCell>0</TableCell>
                                        <TableCell>
                                            <Badge variant="default">Active</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {mentors.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-4">
                                            No mentors registered yet.
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

export default AdminMentorsPage;
