import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useCreateTeam } from '@/hooks/useTeam';

interface CreateTeamModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const CreateTeamModal = ({ open, onOpenChange }: CreateTeamModalProps) => {
    const [teamName, setTeamName] = useState('');
    const createTeam = useCreateTeam();

    // Get user's institute ID from localStorage
    let user = {};
    try {
        user = JSON.parse(localStorage.getItem('user') || '{}');
    } catch (e) {
        console.error('Error parsing user data:', e);
    }
    const instituteId = (user as any).instituteId || 'default-institute';

    const handleCreateTeam = () => {
        if (!teamName.trim()) {
            return;
        }

        createTeam.mutate(
            { name: teamName, instituteId },
            {
                onSuccess: () => {
                    setTeamName('');
                    onOpenChange(false);
                },
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle>Create a New Team</DialogTitle>
                    <DialogDescription>
                        Create your own team and become the team leader. You'll be able to invite members to join.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="teamName">Team Name *</Label>
                        <Input
                            id="teamName"
                            placeholder="Enter team name"
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && teamName.trim()) {
                                    handleCreateTeam();
                                }
                            }}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCreateTeam}
                        disabled={!teamName.trim() || createTeam.isPending}
                    >
                        {createTeam.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            'Create Team'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CreateTeamModal;
