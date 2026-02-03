import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus } from 'lucide-react';
import { useMyTeam } from '@/hooks/useTeam';
import { useNavigate } from 'react-router-dom';

const TeamStatus = () => {
    const { data: team, isLoading } = useMyTeam();
    const navigate = useNavigate();

    if (isLoading) {
        return (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Team Status</CardTitle>
                    <Users className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">Loading...</div>
                </CardContent>
            </Card>
        );
    }

    if (!team) {
        return (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Team Status</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold mb-2">Not in a Team</div>
                    <div className="flex space-x-2">
                        <Button size="sm" onClick={() => navigate('/student/team')}>
                            <UserPlus className="mr-2 h-4 w-4" /> Join / Create Team
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Team Status</CardTitle>
                <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold truncate" title={team.name}>{team.name}</div>
                <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-muted-foreground">
                        {team.members.length} Members
                    </p>
                    <Badge variant={team.status === 'approved' ? 'default' : 'secondary'}>
                        {team.status}
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );
};

export default TeamStatus;
