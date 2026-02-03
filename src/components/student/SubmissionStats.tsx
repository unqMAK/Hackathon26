import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload } from 'lucide-react';
import { useMyTeam } from '@/hooks/useTeam';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { format } from 'date-fns';

const SubmissionStats = () => {
    const { data: team } = useMyTeam();

    const { data: submissions = [] } = useQuery({
        queryKey: ['team-submissions', team?._id],
        queryFn: async () => {
            if (!team?._id) return [];
            const { data } = await api.get(`/submissions/team/${team._id}`);
            return data;
        },
        enabled: !!team?._id
    });

    const latestSubmission = submissions[0];

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Submissions</CardTitle>
                <Upload className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{submissions.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                    {latestSubmission
                        ? `Latest: ${format(new Date(latestSubmission.createdAt), 'MMM d, h:mm a')}`
                        : 'No submissions yet'}
                </p>
            </CardContent>
        </Card>
    );
};

export default SubmissionStats;
