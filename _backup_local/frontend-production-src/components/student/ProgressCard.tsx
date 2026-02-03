import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useMyTeam } from '@/hooks/useTeam';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

const ProgressCard = () => {
    const { data: team } = useMyTeam();

    const { data: progressData } = useQuery({
        queryKey: ['team-progress', team?._id],
        queryFn: async () => {
            if (!team?._id) return null;
            const { data } = await api.get(`/teams/${team._id}/progress`);
            return data;
        },
        enabled: !!team?._id
    });

    const getStatusVariant = (status: string) => {
        if (status === 'Completed') return 'default';
        if (status === 'In Progress') return 'secondary';
        return 'outline';
    };

    const getStatusColor = (status: string) => {
        if (status === 'Completed') return 'bg-green-100 text-green-700 hover:bg-green-200';
        if (status === 'In Progress') return 'bg-orange-100 text-orange-700 hover:bg-orange-200';
        return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
    };

    if (!team) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Project Progress</CardTitle>
                    <CardDescription>Join a team to track progress.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">No team data available</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Project Progress</CardTitle>
                <CardDescription>Your team's completion status.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>Overall Completion</span>
                        <span>{progressData?.overallCompletion || team.progress || 0}%</span>
                    </div>
                    <Progress value={progressData?.overallCompletion || team.progress || 0} />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="bg-muted/50 p-3 rounded-lg text-center">
                        <p className="text-sm font-medium mb-1">Ideation</p>
                        <Badge className={getStatusColor(progressData?.stages?.ideation || 'Not Started')}>
                            {progressData?.stages?.ideation || 'Not Started'}
                        </Badge>
                    </div>
                    <div className="bg-muted/50 p-3 rounded-lg text-center">
                        <p className="text-sm font-medium mb-1">Prototyping</p>
                        <Badge className={getStatusColor(progressData?.stages?.prototyping || 'Not Started')}>
                            {progressData?.stages?.prototyping || 'Not Started'}
                        </Badge>
                    </div>
                    <div className="bg-muted/50 p-3 rounded-lg text-center">
                        <p className="text-sm font-medium mb-1">Development</p>
                        <Badge className={getStatusColor(progressData?.stages?.development || 'Not Started')}>
                            {progressData?.stages?.development || 'Not Started'}
                        </Badge>
                    </div>
                    <div className="bg-muted/50 p-3 rounded-lg text-center">
                        <p className="text-sm font-medium mb-1">Final</p>
                        <Badge className={getStatusColor(progressData?.stages?.final || 'Not Started')}>
                            {progressData?.stages?.final || 'Not Started'}
                        </Badge>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default ProgressCard;
