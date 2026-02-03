import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Search, Clock, Users, ShieldCheck, AlertCircle } from 'lucide-react';
import { useTeams, usePendingTeams } from '@/hooks/useMockData';
import { useState } from 'react';
import { TeamDetailsSheet } from '@/components/admin/TeamDetailsSheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminTeamsPage = () => {
    const { data: allTeams = [], isLoading: isLoadingAll } = useTeams();
    const { data: pendingTeams = [], isLoading: isLoadingPending } = usePendingTeams();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    const handleRowClick = (teamId: string) => {
        setSelectedTeamId(teamId);
        setIsDetailsOpen(true);
    };

    const filterTeams = (teamsList: any[]) => teamsList.filter(team =>
        team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.instituteName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.instituteCode?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredAllTeams = filterTeams(allTeams);
    const filteredPendingTeams = filterTeams(pendingTeams);

    return (
        <DashboardLayout role="admin">
            <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-end">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Team Management</h2>
                        <p className="text-muted-foreground">Oversee registrations and verify institutional governance.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-blue-50/50 border-blue-100">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Users className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Registered</p>
                                <p className="text-2xl font-bold">{allTeams.length}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-amber-50/50 border-amber-100">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="p-2 bg-amber-100 rounded-lg">
                                <Clock className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Pending Approval</p>
                                <p className="text-2xl font-bold text-amber-600">{pendingTeams.length}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-green-50/50 border-green-100">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <ShieldCheck className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Fully Verified</p>
                                <p className="text-2xl font-bold text-green-600">{allTeams.filter((t: any) => t.status === 'approved').length}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="pending" className="space-y-4">
                    <div className="flex items-center justify-between">
                        <TabsList>
                            <TabsTrigger value="pending" className="gap-2">
                                <AlertCircle className="h-4 w-4" />
                                Pending Actions
                                {pendingTeams.length > 0 && (
                                    <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-[10px] bg-amber-200 text-amber-800">
                                        {pendingTeams.length}
                                    </Badge>
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="all" className="gap-2">
                                <Users className="h-4 w-4" />
                                All Teams
                            </TabsTrigger>
                        </TabsList>

                        <div className="relative w-72">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or institute..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                    </div>

                    <TabsContent value="pending">
                        <Card>
                            <CardHeader>
                                <CardTitle>Action Required</CardTitle>
                                <CardDescription>Teams waiting for document verification and SPOC/Mentor account creation.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <TeamTable
                                    teams={filteredPendingTeams}
                                    onRowClick={handleRowClick}
                                    isLoading={isLoadingPending}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="all">
                        <Card>
                            <CardHeader>
                                <CardTitle>Historical Records</CardTitle>
                                <CardDescription>Complete database of all registration attempts.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <TeamTable
                                    teams={filteredAllTeams}
                                    onRowClick={handleRowClick}
                                    isLoading={isLoadingAll}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            <TeamDetailsSheet
                teamId={selectedTeamId}
                open={isDetailsOpen}
                onOpenChange={setIsDetailsOpen}
            />
        </DashboardLayout>
    );
};

const TeamTable = ({ teams, onRowClick, isLoading }: { teams: any[], onRowClick: (id: string) => void, isLoading: boolean }) => (
    <Table>
        <TableHeader>
            <TableRow>
                <TableHead>Team Name</TableHead>
                <TableHead>Institute</TableHead>
                <TableHead>Leader</TableHead>
                <TableHead>Registration Date</TableHead>
                <TableHead>Status</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {isLoading ? (
                <TableRow>
                    <TableCell colSpan={5} className="text-center py-10">
                        <div className="flex justify-center items-center gap-2">
                            <Clock className="animate-spin h-4 w-4" />
                            Loading teams...
                        </div>
                    </TableCell>
                </TableRow>
            ) : teams.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                        No team records found matching your criteria.
                    </TableCell>
                </TableRow>
            ) : teams.map((team: any) => (
                <TableRow
                    key={team._id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => onRowClick(team._id)}
                >
                    <TableCell className="font-bold">{team.name}</TableCell>
                    <TableCell>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium">{team.instituteName}</span>
                            <span className="text-[10px] text-muted-foreground font-mono">{team.instituteCode}</span>
                        </div>
                    </TableCell>
                    <TableCell>
                        <div className="flex flex-col">
                            <span className="text-sm">{(team.leaderId as any)?.name || 'N/A'}</span>
                            <span className="text-[10px] text-muted-foreground">{(team.leaderId as any)?.email}</span>
                        </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                        {new Date(team.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                        <Badge
                            variant={team.status === 'approved' ? 'default' : team.status === 'rejected' ? 'destructive' : 'secondary'}
                            className="capitalize"
                        >
                            {team.status}
                        </Badge>
                    </TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table>
);

export default AdminTeamsPage;
