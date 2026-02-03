import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { countdownService } from '@/services/countdownService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const AdminCountdown = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [title, setTitle] = useState('Hackathon Starts');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [isActive, setIsActive] = useState(true);

    const { data: countdown, isLoading } = useQuery({
        queryKey: ['countdown'],
        queryFn: countdownService.getCountdown,
        retry: false,
    });

    // Populate form with existing data
    useEffect(() => {
        if (countdown) {
            setTitle(countdown.title);
            setIsActive(countdown.isActive);

            const targetDate = new Date(countdown.targetDate);
            const dateString = targetDate.toISOString().split('T')[0];
            const timeString = targetDate.toTimeString().substring(0, 5);

            setDate(dateString);
            setTime(timeString);
        }
    }, [countdown]);

    const updateMutation = useMutation({
        mutationFn: countdownService.updateCountdown,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['countdown'] });
            toast({
                title: 'Success',
                description: 'Countdown updated successfully!',
            });
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to update countdown',
                variant: 'destructive',
            });
        },
    });

    const disableMutation = useMutation({
        mutationFn: countdownService.disableCountdown,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['countdown'] });
            setIsActive(false);
            toast({
                title: 'Success',
                description: 'Countdown disabled successfully!',
            });
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to disable countdown',
                variant: 'destructive',
            });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!date || !time) {
            toast({
                title: 'Validation Error',
                description: 'Please select both date and time',
                variant: 'destructive',
            });
            return;
        }

        // Combine date and time
        const targetDateTime = new Date(`${date}T${time}`);
        const now = new Date();

        if (targetDateTime <= now && isActive) {
            toast({
                title: 'Validation Error',
                description: 'Target date must be in the future',
                variant: 'destructive',
            });
            return;
        }

        updateMutation.mutate({
            title,
            targetDate: targetDateTime.toISOString(),
            isActive,
        });
    };

    if (isLoading) {
        return (
            <Card>
                <CardContent className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl">Timer Settings</CardTitle>
                <CardDescription>
                    Configure when the hackathon starts.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Hackathon Starts"
                            required
                        />
                    </div>

                    {/* Date and Time */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="date">Date</Label>
                            <Input
                                id="date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="time">Time</Label>
                            <Input
                                id="time"
                                type="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Active Toggle */}
                    <div className="flex items-center gap-3">
                        <Switch
                            id="active"
                            checked={isActive}
                            onCheckedChange={setIsActive}
                        />
                        <Label htmlFor="active" className="cursor-pointer">
                            Enable Countdown
                        </Label>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                        <Button
                            type="submit"
                            disabled={updateMutation.isPending}
                            className="bg-primary hover:bg-primary/90"
                        >
                            {updateMutation.isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Save Changes
                        </Button>

                        <Button
                            type="button"
                            variant="destructive"
                            onClick={() => disableMutation.mutate()}
                            disabled={disableMutation.isPending || !countdown}
                        >
                            {disableMutation.isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Disable Timer
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default AdminCountdown;
