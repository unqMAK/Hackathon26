import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useApproveTeam, useRejectTeam } from '@/hooks/useSpoc';
import { toast } from 'sonner';

interface TeamApprovalModalProps {
    isOpen: boolean;
    onClose: () => void;
    teamId: string | null;
    action: 'approve' | 'reject' | null;
}

const TeamApprovalModal = ({ isOpen, onClose, teamId, action }: TeamApprovalModalProps) => {
    const [notes, setNotes] = useState('');
    const approveTeam = useApproveTeam();
    const rejectTeam = useRejectTeam();

    const confirmAction = () => {
        if (!teamId || !action) return;

        const mutation = action === 'approve' ? approveTeam : rejectTeam;

        mutation.mutate(
            { teamId, notes },
            {
                onSuccess: () => {
                    toast.success(`Team ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
                    setNotes('');
                    onClose();
                },
                onError: (error: any) => {
                    toast.error(error.response?.data?.message || `Failed to ${action} team`);
                }
            }
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {action === 'approve' ? 'Approve Team' : 'Reject Team'}
                    </DialogTitle>
                    <DialogDescription>
                        {action === 'approve'
                            ? 'Are you sure you want to approve this team? They will be able to participate in the hackathon.'
                            : 'Are you sure you want to reject this team? Please provide a reason.'}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="notes">
                            {action === 'approve' ? 'Notes (Optional)' : 'Reason for Rejection *'}
                        </Label>
                        <Textarea
                            id="notes"
                            placeholder={action === 'approve' ? 'Add any notes for the team...' : 'Explain why the team is being rejected...'}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        variant={action === 'approve' ? 'default' : 'destructive'}
                        onClick={confirmAction}
                        disabled={action === 'reject' && !notes.trim()}
                    >
                        {approveTeam.isPending || rejectTeam.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Confirm {action === 'approve' ? 'Approval' : 'Rejection'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default TeamApprovalModal;
