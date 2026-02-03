import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, User, Mail, ExternalLink } from 'lucide-react';
import { Team } from '@/types/team';

interface StudentMentorCardProps {
    team: Team;
}

const StudentMentorCard = ({ team }: StudentMentorCardProps) => {
    if (!team.mentorId) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Mentor Status
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-6 text-muted-foreground">
                        <User className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>No mentor assigned yet.</p>
                        <p className="text-sm mt-1">Your SPOC will assign a mentor to your team soon.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const mentor = team.mentorId as any; // Type assertion since it's populated

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Your Mentor
                </CardTitle>
                <CardDescription>
                    Assigned guide for your project
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                        <AvatarImage src={`https://ui-avatars.com/api/?name=${mentor.name}&background=random`} />
                        <AvatarFallback>{mentor.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1 flex-1">
                        <h4 className="font-semibold text-lg">{mentor.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {mentor.email}
                        </div>
                        {mentor.expertise && mentor.expertise.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                                {mentor.expertise.map((exp: string, i: number) => (
                                    <Badge key={i} variant="secondary" className="text-xs">
                                        {exp}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Feedback Received</p>
                        <p className="text-xl font-bold">
                            {/* This would ideally come from a separate fetch or populated field */}
                            --
                        </p>
                    </div>
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Next Review</p>
                        <p className="text-sm font-medium mt-1">Pending</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default StudentMentorCard;
