import { usePendingInvites, useAcceptInvite, useRejectInvite } from '@/hooks/useTeam';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, Check, X, Users } from 'lucide-react';
import { TeamInvite, Team, User } from '@/types/team';

const PendingInvites = () => {
    const { data: invites, isLoading } = usePendingInvites();
    const acceptInvite = useAcceptInvite();
    const rejectInvite = useRejectInvite();

    if (isLoading) {
        return null; // Or a skeleton if preferred, but null avoids layout shift if empty
    }

    if (!invites || invites.length === 0) {
        return null;
    }

    return (
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <CardTitle className="text-lg text-blue-900 dark:text-blue-100">Pending Team Invitations</CardTitle>
                </div>
                <CardDescription className="text-blue-700 dark:text-blue-300">
                    You have been invited to join the following teams
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {invites.map((invite: TeamInvite) => {
                        const team = invite.teamId as Team;
                        const sender = invite.fromUserId as User;

                        return (
                            <div
                                key={invite._id}
                                className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-lg border shadow-sm"
                            >
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
                                            {team.name.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h4 className="font-semibold text-base">{team.name}</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Invited by <span className="font-medium text-foreground">{sender.name}</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button
                                        size="sm"
                                        className="bg-green-600 hover:bg-green-700 text-white shadow-sm"
                                        onClick={() => acceptInvite.mutate(invite._id)}
                                        disabled={acceptInvite.isPending || rejectInvite.isPending}
                                    >
                                        {acceptInvite.isPending ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <>
                                                <Check className="mr-1.5 h-4 w-4" />
                                                Accept
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                        onClick={() => rejectInvite.mutate(invite._id)}
                                        disabled={acceptInvite.isPending || rejectInvite.isPending}
                                    >
                                        {rejectInvite.isPending ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <>
                                                <X className="mr-1.5 h-4 w-4" />
                                                Reject
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
};

export default PendingInvites;
