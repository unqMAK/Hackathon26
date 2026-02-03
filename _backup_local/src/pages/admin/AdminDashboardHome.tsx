import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, FileText, Building, CheckCircle } from 'lucide-react';
import { useUsers, useTeams, useProblems } from '@/hooks/useMockData';

const AdminDashboardHome = () => {
    const { data: users = [] } = useUsers();
    const { data: teams = [] } = useTeams();
    const { data: problems = [] } = useProblems();

    const stats = [
        { title: 'Total Users', value: users.length, icon: Users, color: 'text-blue-500' },
        { title: 'Total Teams', value: teams.length, icon: Building, color: 'text-green-500' },
        { title: 'Active Problems', value: problems.length, icon: FileText, color: 'text-purple-500' },
        { title: 'Pending Teams', value: teams.filter(t => t.status === 'pending').length, icon: CheckCircle, color: 'text-orange-500' },
    ];

    return (
        <DashboardLayout role="admin">
            <div className="space-y-6 animate-fade-in">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
                    <p className="text-muted-foreground">Manage users, teams, and hackathon content.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat, index) => (
                        <Card key={index} className="hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Recent Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Latest actions across the platform.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {teams.slice(0, 5).map((team, i) => (
                                <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0">
                                    <div>
                                        <p className="font-medium">New Team Registered: {team.name}</p>
                                        <p className="text-sm text-muted-foreground">Status: {team.status}</p>
                                    </div>
                                    <Badge variant={team.status === 'approved' ? 'default' : 'secondary'}>
                                        {team.status}
                                    </Badge>
                                </div>
                            ))}
                            {teams.length === 0 && <p className="text-muted-foreground">No recent activity.</p>}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default AdminDashboardHome;
