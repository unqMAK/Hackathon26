import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { usePendingTeams } from '@/hooks/useSpoc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Check, X, Users, Calendar } from 'lucide-react';
import TeamApprovalModal from '@/components/spoc/TeamApprovalModal';
import { toast } from 'sonner';

const SpocPendingTeams = () => {
    const { data: teams, isLoading } = usePendingTeams();
    const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
    const [action, setAction] = useState<'approve' | 'reject' | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    const handleAction = (teamId: string, actionType: 'approve' | 'reject') => {
        setSelectedTeam(teamId);
        setAction(actionType);
        setDialogOpen(true);
    };

    return (
        <DashboardLayout role="spoc">
            <div className="space-y-6 animate-fade-in">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Approval Requests</h2>
                    <p className="text-muted-foreground">
                        Review and approve team creation requests from your institute students.
                    </p>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : teams && teams.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {teams.map((team: any) => (
                            <Card key={team._id} className="flex flex-col">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-xl">{team.name}</CardTitle>
                                        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                                            Pending
                                        </Badge>
                                    </div>
                                    <CardDescription>
                                        Leader: {team.leaderId?.name}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1 space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <Users className="mr-2 h-4 w-4" />
                                            {team.members?.length || 0} Members
                                        </div>
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <Calendar className="mr-2 h-4 w-4" />
                                            Requested: {new Date(team.requestedAt || team.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium mb-2">Members:</h4>
                                        <ul className="text-sm space-y-1 text-muted-foreground">
                                            {team.members?.map((member: any) => (
                                                <li key={member._id}>• {member.name}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex gap-2 pt-4 border-t">
                                    <Button
                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                        onClick={() => handleAction(team._id, 'approve')}
                                    >
                                        <Check className="mr-2 h-4 w-4" /> Approve
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        className="flex-1"
                                        onClick={() => handleAction(team._id, 'reject')}
                                    >
                                        <X className="mr-2 h-4 w-4" /> Reject
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 border rounded-lg bg-muted/10">
                        <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
                        <h3 className="mt-4 text-lg font-medium">No Pending Requests</h3>
                        <p className="text-muted-foreground">
                            There are no teams waiting for approval at the moment.
                        </p>
                    </div>
                )}

                <TeamApprovalModal
                    isOpen={dialogOpen}
                    onClose={() => setDialogOpen(false)}
                    teamId={selectedTeam}
                    action={action}
                />
            </div>
        </DashboardLayout>
    );
};

export default SpocPendingTeams;
