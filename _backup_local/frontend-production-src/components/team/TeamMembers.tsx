import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Crown, Mail, Trash2, Loader2, Users, PlusCircle } from 'lucide-react';
import { useMyTeam, useRemoveMember } from '@/hooks/useTeam';
import CreateTeamModal from './CreateTeamModal';
import { User } from '@/types/team';
import { Skeleton } from '@/components/ui/skeleton';

const TeamMembers = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data: team, isLoading, error } = useMyTeam();
  const removeMember = useRemoveMember();

  // Get current user from localStorage
  let currentUser = {};
  try {
    currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  } catch (e) {
    console.error('Error parsing user data:', e);
  }
  const isLeader = team?.leaderId === (currentUser as any)._id ||
    (typeof team?.leaderId === 'object' && (team.leaderId as User)._id === (currentUser as any)._id);

  const handleRemoveMember = (userId: string) => {
    if (!team) return;
    if (window.confirm('Are you sure you want to remove this member from the team?')) {
      removeMember.mutate({ teamId: team._id, userId });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !team) {
    return (
      <div className="space-y-6">
        <Card className="border-2 border-dashed">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Users className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">You're Not Part of Any Team Yet</CardTitle>
            <CardDescription className="text-base">
              Create a team to get started with team collaboration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-1 max-w-md mx-auto">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2" onClick={() => setIsCreateModalOpen(true)}>
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <div className="mx-auto h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                      <PlusCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Create a Team</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Start your own team and become the team leader
                      </p>
                      <Button className="w-full bg-gradient-to-r from-primary to-secondary">
                        Create Team
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        <CreateTeamModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} />
      </div>
    );
  }

  const members = team.members || [];
  const teamSize = members.length;
  const maxSize = 5; // Updated to 5 as per recent changes in other files, assuming 5 is the new max

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Team Members ({teamSize}/{maxSize})</CardTitle>
              <CardDescription>
                {isLeader ? 'Manage your team composition' : 'View your team members'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {members.map((member: User) => {
              const isTeamLeader = member._id === team.leaderId ||
                (typeof team.leaderId === 'object' && member._id === (team.leaderId as User)._id);

              return (
                <Card key={member._id} className="hover-lift transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">
                          {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{member.name}</h4>
                              {isTeamLeader && <Crown className="h-4 w-4 text-yellow-500" />}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                              <Mail className="h-3 w-3" />
                              {member.email}
                            </div>
                          </div>

                          {isLeader && !isTeamLeader && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveMember(member._id)}
                              disabled={removeMember.isPending}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              {removeMember.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Badge className={isTeamLeader ? 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20' : 'bg-gray-500/10 text-gray-700 border-gray-500/20'}>
                            {isTeamLeader ? 'Team Leader' : 'Member'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamMembers;
