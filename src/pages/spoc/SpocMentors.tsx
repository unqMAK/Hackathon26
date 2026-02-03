import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { useInstituteMentors } from '@/hooks/useSpoc';
import { MessageSquare, Search } from 'lucide-react';

const SpocMentors = () => {
    const { data: mentors = [], isLoading } = useInstituteMentors();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredMentors = mentors.filter((mentor: any) =>
        mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mentor.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardLayout role="spoc">
            <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Institute Mentors</h2>
                        <p className="text-muted-foreground">
                            View mentors registered under your institute
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5" />
                                    Mentors List
                                </CardTitle>
                                <CardDescription>
                                    Total {mentors.length} mentors registered
                                </CardDescription>
                            </div>
                            <div className="relative w-64">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search mentors..."
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
                                                Loading mentors...
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredMentors.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                                                No mentors found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredMentors.map((mentor: any) => (
                                            <TableRow key={mentor._id}>
                                                <TableCell className="font-medium">{mentor.name}</TableCell>
                                                <TableCell>{mentor.email}</TableCell>
                                                <TableCell>
                                                    {new Date(mentor.createdAt).toLocaleDateString()}
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

export default SpocMentors;
