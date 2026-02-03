import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { toast } from 'sonner';

const MentorFeedbackPage = () => {
    const [feedback, setFeedback] = useState('');
    const [selectedTeam, setSelectedTeam] = useState('');

    const handleSubmit = () => {
        if (feedback && selectedTeam) {
            toast.success('Feedback sent successfully');
            setFeedback('');
            setSelectedTeam('');
        } else {
            toast.error('Please select a team and enter feedback');
        }
    };

    return (
        <DashboardLayout role="mentor">
            <div className="space-y-6 animate-fade-in">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Feedback</h2>
                    <p className="text-muted-foreground">Provide feedback to your teams.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Send Feedback</CardTitle>
                        <CardDescription>Select a team and write your feedback.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Team Name</label>
                            <Input
                                placeholder="Enter team name..."
                                value={selectedTeam}
                                onChange={(e) => setSelectedTeam(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Feedback</label>
                            <Textarea
                                placeholder="Write your feedback here..."
                                className="min-h-[150px]"
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                            />
                        </div>
                        <Button onClick={handleSubmit}>Send Feedback</Button>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default MentorFeedbackPage;
