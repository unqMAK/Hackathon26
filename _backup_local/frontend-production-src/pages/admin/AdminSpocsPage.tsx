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

const AdminSpocsPage = () => {
    const { data: users = [] } = useUsers();
    const spocs = users.filter(u => u.role === 'spoc');

    return (
        <DashboardLayout role="admin">
            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">SPOCs</h2>
                        <p className="text-muted-foreground">Single Point of Contact for institutes.</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All SPOCs ({spocs.length})</CardTitle>
                        <CardDescription>Institute coordinators and contacts.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Institute</TableHead>
                                    <TableHead>Institute Code</TableHead>
                                    <TableHead>District</TableHead>
                                    <TableHead>State</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {spocs.map((spoc: any) => (
                                    <TableRow key={spoc.id}>
                                        <TableCell className="font-medium">{spoc.name}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-muted-foreground" />
                                                {spoc.email}
                                            </div>
                                        </TableCell>
                                        <TableCell>{spoc.instituteName || spoc.instituteId || 'N/A'}</TableCell>
                                        <TableCell>{spoc.instituteCode || 'N/A'}</TableCell>
                                        <TableCell>{spoc.district || 'N/A'}</TableCell>
                                        <TableCell>{spoc.state || 'N/A'}</TableCell>
                                        <TableCell>
                                            <Badge variant="default">Active</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {spocs.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-4">
                                            No SPOCs registered yet.
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

export default AdminSpocsPage;
