import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTeams } from '@/hooks/useMockData';

const MentorTeamsPage = () => {
    const { data: allTeams = [] } = useTeams();
    // Mock mentor's assigned teams
    const myTeams = allTeams.slice(0, 3);

    return (
        <DashboardLayout role="mentor">
            <div className="space-y-6 animate-fade-in">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">My Teams</h2>
                    <p className="text-muted-foreground">Manage and guide your assigned teams.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {myTeams.map((team) => (
                        <Card key={team.id} className="bg-muted/50">
                            <CardHeader>
                                <CardTitle className="text-lg">{team.name}</CardTitle>
                                <CardDescription>Problem: {team.problemId || 'None'}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Members:</span>
                                    <span>{team.members.length}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Status:</span>
                                    <Badge variant="outline">{team.status}</Badge>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Progress:</span>
                                    <span>{team.progress}%</span>
                                </div>
                                <Button className="w-full mt-4" variant="default">View Details</Button>
                            </CardContent>
                        </Card>
                    ))}
                    {myTeams.length === 0 && <p className="text-muted-foreground">No teams assigned.</p>}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default MentorTeamsPage;
