import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { differenceInDays, differenceInHours } from 'date-fns';

const DeadlineCard = () => {
    const { data: deadlineData } = useQuery({
        queryKey: ['hackathon-deadline'],
        queryFn: async () => {
            const { data } = await api.get('/hackathon/deadline');
            return data;
        }
    });

    const calculateTimeLeft = () => {
        if (!deadlineData?.deadline) return 'Loading...';

        const deadline = new Date(deadlineData.deadline);
        const now = new Date();

        if (deadline < now) {
            return 'Deadline Passed';
        }

        const days = differenceInDays(deadline, now);
        const hours = differenceInHours(deadline, now) % 24;

        if (days > 0) {
            return `${days} Day${days > 1 ? 's' : ''}`;
        } else if (hours > 0) {
            return `${hours} Hour${hours > 1 ? 's' : ''}`;
        } else {
            return 'Less than 1 hour';
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Deadline</CardTitle>
                <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{calculateTimeLeft()}</div>
                <p className="text-xs text-muted-foreground mt-1">Time remaining</p>
            </CardContent>
        </Card>
    );
};

export default DeadlineCard;
