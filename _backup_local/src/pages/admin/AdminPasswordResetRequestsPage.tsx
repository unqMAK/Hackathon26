import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Check, X, Clock, Search, Phone, Mail, User, Key, RefreshCw } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';

interface PasswordResetRequest {
    _id: string;
    userId: {
        _id: string;
        name: string;
        email: string;
        phone?: string;
        role: string;
    };
    email: string;
    userName: string;
    userPhone?: string;
    status: 'pending' | 'approved' | 'rejected';
    requestedAt: string;
    processedAt?: string;
    processedBy?: {
        name: string;
        email: string;
    };
    rejectionReason?: string;
}

const AdminPasswordResetRequestsPage = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRequest, setSelectedRequest] = useState<PasswordResetRequest | null>(null);
    const [manualPassword, setManualPassword] = useState('');
    const [approveDialogOpen, setApproveDialogOpen] = useState(false);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    // Fetch password reset requests
    const { data: requests = [], isLoading } = useQuery({
        queryKey: ['passwordResetRequests'],
        queryFn: async () => {
            const { data } = await api.get('/admin/password-reset-requests');
            return data as PasswordResetRequest[];
        }
    });

    // Approve mutation
    const approveMutation = useMutation({
        mutationFn: async ({ requestId, manualPassword }: { requestId: string; manualPassword?: string }) => {
            const { data } = await api.put(`/admin/password-reset/${requestId}/approve`, { manualPassword });
            return data;
        },
        onSuccess: () => {
            toast.success('Password reset approved! New password sent to user.');
            queryClient.invalidateQueries({ queryKey: ['passwordResetRequests'] });
            setApproveDialogOpen(false);
            setSelectedRequest(null);
            setManualPassword('');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to approve request');
        }
    });

    // Reject mutation
    const rejectMutation = useMutation({
        mutationFn: async ({ requestId, reason }: { requestId: string; reason: string }) => {
            const { data } = await api.put(`/admin/password-reset/${requestId}/reject`, { reason });
            return data;
        },
        onSuccess: () => {
            toast.success('Password reset request rejected');
            queryClient.invalidateQueries({ queryKey: ['passwordResetRequests'] });
            setRejectDialogOpen(false);
            setSelectedRequest(null);
            setRejectionReason('');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to reject request');
        }
    });

    const handleApprove = (request: PasswordResetRequest) => {
        setSelectedRequest(request);
        setApproveDialogOpen(true);
    };

    const handleReject = (request: PasswordResetRequest) => {
        setSelectedRequest(request);
        setRejectDialogOpen(true);
    };

    const confirmApprove = () => {
        if (selectedRequest) {
            approveMutation.mutate({
                requestId: selectedRequest._id,
                manualPassword: manualPassword || undefined
            });
        }
    };

    const confirmReject = () => {
        if (selectedRequest) {
            rejectMutation.mutate({
                requestId: selectedRequest._id,
                reason: rejectionReason
            });
        }
    };

    const filteredRequests = requests.filter(request =>
        request.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const pendingRequests = filteredRequests.filter(r => r.status === 'pending');
    const processedRequests = filteredRequests.filter(r => r.status !== 'pending');

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
            case 'approved':
                return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><Check className="h-3 w-3 mr-1" />Approved</Badge>;
            case 'rejected':
                return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><X className="h-3 w-3 mr-1" />Rejected</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <DashboardLayout role="admin">
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Password Reset Requests</h1>
                        <p className="text-muted-foreground">Review and manage password reset requests from users</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 w-64"
                            />
                        </div>
                    </div>
                </div>

                {/* Pending Requests */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-amber-500" />
                            Pending Requests
                            {pendingRequests.length > 0 && (
                                <Badge className="bg-amber-500">{pendingRequests.length}</Badge>
                            )}
                        </CardTitle>
                        <CardDescription>Requests awaiting your review</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="text-center py-8 text-muted-foreground">Loading...</div>
                        ) : pendingRequests.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">No pending requests</div>
                        ) : (
                            <div className="divide-y">
                                {pendingRequests.map((request) => (
                                    <div key={request._id} className="py-4 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                <User className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{request.userName}</p>
                                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Mail className="h-3 w-3" />
                                                        {request.email}
                                                    </span>
                                                    {request.userPhone && (
                                                        <span className="flex items-center gap-1">
                                                            <Phone className="h-3 w-3" />
                                                            {request.userPhone}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Requested: {new Date(request.requestedAt).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-red-600 hover:bg-red-50"
                                                onClick={() => handleReject(request)}
                                            >
                                                <X className="h-4 w-4 mr-1" />
                                                Reject
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="bg-green-600 hover:bg-green-700"
                                                onClick={() => handleApprove(request)}
                                            >
                                                <Check className="h-4 w-4 mr-1" />
                                                Approve
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Processed Requests */}
                {processedRequests.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Request History</CardTitle>
                            <CardDescription>Previously processed requests</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="divide-y">
                                {processedRequests.map((request) => (
                                    <div key={request._id} className="py-4 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                                <User className="h-5 w-5 text-gray-500" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{request.userName}</p>
                                                <p className="text-sm text-muted-foreground">{request.email}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Processed: {request.processedAt ? new Date(request.processedAt).toLocaleString() : 'N/A'}
                                                    {request.processedBy && ` by ${request.processedBy.name}`}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {getStatusBadge(request.status)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Approve Dialog */}
                <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Approve Password Reset</DialogTitle>
                            <DialogDescription>
                                Approve the password reset request for {selectedRequest?.userName} ({selectedRequest?.email})
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>New Password (Optional)</Label>
                                <Input
                                    type="text"
                                    placeholder="Leave empty to auto-generate"
                                    value={manualPassword}
                                    onChange={(e) => setManualPassword(e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    If left empty, a secure password will be auto-generated and sent to the user.
                                </p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                className="bg-green-600 hover:bg-green-700"
                                onClick={confirmApprove}
                                disabled={approveMutation.isPending}
                            >
                                {approveMutation.isPending ? (
                                    <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Processing...</>
                                ) : (
                                    <><Key className="h-4 w-4 mr-2" />Approve & Send Password</>
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Reject Dialog */}
                <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Reject Password Reset</DialogTitle>
                            <DialogDescription>
                                Reject the password reset request for {selectedRequest?.userName}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Reason (Optional)</Label>
                                <Input
                                    type="text"
                                    placeholder="Enter reason for rejection"
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={confirmReject}
                                disabled={rejectMutation.isPending}
                            >
                                {rejectMutation.isPending ? 'Rejecting...' : 'Reject Request'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    );
};

export default AdminPasswordResetRequestsPage;
