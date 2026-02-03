import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, Loader2 } from 'lucide-react';
import { useAvailableTeams, useSendJoinRequest } from '@/hooks/useTeam';
import { Team, User } from '@/types/team';

interface JoinTeamModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const JoinTeamModal = ({ open, onOpenChange }: JoinTeamModalProps) => {
    const { data: teams, isLoading } = useAvailableTeams();
    const sendJoinRequest = useSendJoinRequest();

    const handleSendRequest = (teamId: string) => {
        sendJoinRequest.mutate(teamId, {
            onSuccess: () => {
                onOpenChange(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Join a Team</DialogTitle>
                    <DialogDescription>
                        Browse available teams and send a request to join. The team leader will review your request.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="h-[400px] border rounded-md">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : teams && teams.length > 0 ? (
                        <div className="divide-y">
                            {teams.map((team: Team) => {
                                const leader = typeof team.leaderId === 'object' ? team.leaderId : null;
                                const memberCount = team.members?.length || 0;

                                return (
                                    <div
                                        key={team._id}
                                        className="p-4 hover:bg-accent transition-colors"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h3 className="font-semibold text-lg">{team.name}</h3>
                                                    <Badge variant="outline" className="text-xs">
                                                        {memberCount}/6 members
                                                    </Badge>
                                                </div>

                                                {leader && (
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                                        <Avatar className="h-6 w-6">
                                                            <AvatarFallback className="text-xs bg-gradient-to-br from-primary to-secondary text-white">
                                                                {leader.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span>Leader: {leader.name}</span>
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Users className="h-4 w-4" />
                                                    <span>{memberCount} member{memberCount !== 1 ? 's' : ''}</span>
                                                </div>
                                            </div>

                                            <Button
                                                onClick={() => handleSendRequest(team._id)}
                                                disabled={sendJoinRequest.isPending}
                                                className="shrink-0"
                                            >
                                                {sendJoinRequest.isPending ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    'Request to Join'
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8">
                            <Users className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-sm text-muted-foreground">
                                No teams available at the moment. Try creating your own team!
                            </p>
                        </div>
                    )}
                </ScrollArea>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default JoinTeamModal;
