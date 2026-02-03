import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { useInstituteJudges } from '@/hooks/useSpoc';
import { Award, Search } from 'lucide-react';

const SpocJudges = () => {
    const { data: judges = [], isLoading } = useInstituteJudges();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredJudges = judges.filter((judge: any) =>
        judge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        judge.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardLayout role="spoc">
            <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Institute Judges</h2>
                        <p className="text-muted-foreground">
                            View judges registered under your institute
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Award className="h-5 w-5" />
                                    Judges List
                                </CardTitle>
                                <CardDescription>
                                    Total {judges.length} judges registered
                                </CardDescription>
                            </div>
                            <div className="relative w-64">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search judges..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Joined At</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center py-8">
                                                Loading judges...
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredJudges.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                                                No judges found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredJudges.map((judge: any) => (
                                            <TableRow key={judge._id}>
                                                <TableCell className="font-medium">{judge.name}</TableCell>
                                                <TableCell>{judge.email}</TableCell>
                                                <TableCell>
                                                    {new Date(judge.createdAt).toLocaleDateString()}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default SpocJudges;
