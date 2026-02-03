import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Search, Loader2 } from 'lucide-react';
import { useSearchStudents, useSendInvite } from '@/hooks/useTeam';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User } from '@/types/team';

interface TeamInviteModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const TeamInviteModal = ({ open, onOpenChange }: TeamInviteModalProps) => {
    const [searchQuery, setSearchQuery] = useState('');
    const { data: students, isLoading } = useSearchStudents(searchQuery);
    const sendInvite = useSendInvite();

    const handleSendInvite = (userId: string) => {
        sendInvite.mutate(userId, {
            onSuccess: () => {
                onOpenChange(false);
                setSearchQuery('');
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Invite Team Member</DialogTitle>
                    <DialogDescription>
                        Search for students to invite to your team. Only students without a team will appear.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="search">Search Students</Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="search"
                                placeholder="Search by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <ScrollArea className="h-[300px] border rounded-md">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : students && students.length > 0 ? (
                            <div className="divide-y">
                                {students.map((student: User) => (
                                    <div
                                        key={student._id}
                                        className="p-4 flex items-center justify-between hover:bg-accent transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10">
                                                <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">
                                                    {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{student.name}</p>
                                                <p className="text-sm text-muted-foreground">{student.email}</p>
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            onClick={() => handleSendInvite(student._id)}
                                            disabled={sendInvite.isPending}
                                        >
                                            {sendInvite.isPending ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                'Invite'
                                            )}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : searchQuery.length >= 2 ? (
                            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                                No available students found
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                                Type at least 2 characters to search
                            </div>
                        )}
                    </ScrollArea>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default TeamInviteModal;
