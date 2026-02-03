import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { useRejectedTeams } from '@/hooks/useSpoc';
import { XCircle, Search, Users } from 'lucide-react';

const SpocRejectedTeams = () => {
    const { data: teams = [], isLoading } = useRejectedTeams();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredTeams = teams.filter((team: any) =>
        team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.leaderId?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardLayout role="spoc">
            <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Rejected Teams</h2>
                        <p className="text-muted-foreground">
                            Review teams that were not approved
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <XCircle className="h-5 w-5 text-red-600" />
                                    Rejected Teams List
                                </CardTitle>
                                <CardDescription>
                                    Total {teams.length} teams rejected
                                </CardDescription>
                            </div>
                            <div className="relative w-64">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search teams..."
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
                                        <TableHead>Team Name</TableHead>
                                        <TableHead>Leader</TableHead>
                                        <TableHead>Members</TableHead>
                                        <TableHead>Rejection Reason</TableHead>
                                        <TableHead>Rejected At</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8">
                                                Loading teams...
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredTeams.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                No rejected teams found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredTeams.map((team: any) => (
                                            <TableRow key={team._id}>
                                                <TableCell className="font-medium">{team.name}</TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span>{team.leaderId?.name}</span>
                                                        <span className="text-xs text-muted-foreground">{team.leaderId?.email}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <Users className="h-3 w-3 text-muted-foreground" />
                                                        <span>{team.members?.length || 0}/5</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-red-600 text-sm italic">
                                                        {team.spocNotes || 'No reason provided'}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    {team.approvedAt ? new Date(team.approvedAt).toLocaleDateString() : '-'}
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

export default SpocRejectedTeams;
