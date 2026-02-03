import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Check, X, Key, RefreshCw, Mail, Clock, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PasswordResetRequest {
    _id: string;
    userId: string;
    email: string;
    userName: string;
    userPhone: string;
    status: 'pending' | 'approved' | 'rejected';
    requestedAt: string;
    processedAt?: string;
    processedBy?: string;
}

const AdminPasswordResetPage = () => {
    const [isManualResetOpen, setIsManualResetOpen] = useState(false);
    const [manualResetEmail, setManualResetEmail] = useState('');
    const queryClient = useQueryClient();

    // Fetch password reset requests
    const { data: requests = [], isLoading, refetch } = useQuery({
        queryKey: ['password-reset-requests'],
        queryFn: async () => {
            const { data } = await api.get('/admin/password-reset-requests');
            return data;
        }
    });

    // Approve request mutation
    const approveMutation = useMutation({
        mutationFn: async (requestId: string) => {
            const { data } = await api.put(`/admin/password-reset-requests/${requestId}/approve`);
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['password-reset-requests'] });
            toast.success(`Password reset approved! New password sent to user's email.`);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to approve request');
        }
    });

    // Reject request mutation
    const rejectMutation = useMutation({
        mutationFn: async (requestId: string) => {
            const { data } = await api.put(`/admin/password-reset-requests/${requestId}/reject`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['password-reset-requests'] });
            toast.success('Password reset request rejected');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to reject request');
        }
    });

    // Manual reset mutation
    const manualResetMutation = useMutation({
        mutationFn: async (email: string) => {
            const { data } = await api.post('/admin/reset-user-password', { email });
            return data;
        },
        onSuccess: (data) => {
            toast.success(`Password reset! New password sent to ${manualResetEmail}`);
            setIsManualResetOpen(false);
            setManualResetEmail('');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to reset password');
        }
    });

    const handleApprove = (requestId: string) => {
        if (confirm('Are you sure you want to approve this password reset request? A new password will be generated and sent to the user.')) {
            approveMutation.mutate(requestId);
        }
    };

    const handleReject = (requestId: string) => {
        if (confirm('Are you sure you want to reject this password reset request?')) {
            rejectMutation.mutate(requestId);
        }
    };

    const handleManualReset = (e: React.FormEvent) => {
        e.preventDefault();
        if (confirm(`Are you sure you want to reset the password for ${manualResetEmail}?`)) {
            manualResetMutation.mutate(manualResetEmail);
        }
    };

    const pendingRequests = requests.filter((r: PasswordResetRequest) => r.status === 'pending');
    const processedRequests = requests.filter((r: PasswordResetRequest) => r.status !== 'pending');

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
            case 'approved':
                return <Badge variant="outline" className="bg-green-100 text-green-800">Approved</Badge>;
            case 'rejected':
                return <Badge variant="outline" className="bg-red-100 text-red-800">Rejected</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <DashboardLayout role="admin">
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold gradient-text">Password Reset Management</h1>
                        <p className="text-muted-foreground">Manage user password reset requests</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => refetch()}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Refresh
                        </Button>
                        <Dialog open={isManualResetOpen} onOpenChange={setIsManualResetOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-gradient-to-r from-secondary to-secondary/80">
                                    <Key className="mr-2 h-4 w-4" />
                                    Manual Reset
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Manual Password Reset</DialogTitle>
                                    <DialogDescription>
                                        Immediately reset a user's password without a request. A new password will be generated and emailed to them.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleManualReset}>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="email">User Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={manualResetEmail}
                                                onChange={(e) => setManualResetEmail(e.target.value)}
                                                placeholder="Enter user's email address"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="button" variant="outline" onClick={() => setIsManualResetOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={manualResetMutation.isPending}>
                                            {manualResetMutation.isPending ? 'Resetting...' : 'Reset Password'}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Pending Requests
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{pendingRequests.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Check className="h-4 w-4" />
                                Approved
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {requests.filter((r: PasswordResetRequest) => r.status === 'approved').length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <X className="h-4 w-4" />
                                Rejected
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">
                                {requests.filter((r: PasswordResetRequest) => r.status === 'rejected').length}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Pending Requests */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-yellow-600" />
                            Pending Requests
                        </CardTitle>
                        <CardDescription>Requests awaiting your approval or rejection</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Phone</TableHead>
                                        <TableHead>Requested At</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center">Loading...</TableCell>
                                        </TableRow>
                                    ) : pendingRequests.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center text-muted-foreground">
                                                No pending password reset requests
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        pendingRequests.map((request: PasswordResetRequest) => (
                                            <TableRow key={request._id}>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-4 w-4 text-muted-foreground" />
                                                        {request.userName || 'Unknown'}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                                        {request.email}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{request.userPhone || '-'}</TableCell>
                                                <TableCell>
                                                    {new Date(request.requestedAt).toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                            onClick={() => handleApprove(request._id)}
                                                            disabled={approveMutation.isPending}
                                                        >
                                                            <Check className="h-4 w-4 mr-1" />
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            onClick={() => handleReject(request._id)}
                                                            disabled={rejectMutation.isPending}
                                                        >
                                                            <X className="h-4 w-4 mr-1" />
                                                            Reject
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Processed Requests History */}
                <Card>
                    <CardHeader>
                        <CardTitle>Request History</CardTitle>
                        <CardDescription>Previously processed password reset requests</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Requested At</TableHead>
                                        <TableHead>Processed At</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center">Loading...</TableCell>
                                        </TableRow>
                                    ) : processedRequests.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center text-muted-foreground">
                                                No processed requests yet
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        processedRequests.map((request: PasswordResetRequest) => (
                                            <TableRow key={request._id}>
                                                <TableCell className="font-medium">{request.userName || 'Unknown'}</TableCell>
                                                <TableCell>{request.email}</TableCell>
                                                <TableCell>{getStatusBadge(request.status)}</TableCell>
                                                <TableCell>{new Date(request.requestedAt).toLocaleString()}</TableCell>
                                                <TableCell>
                                                    {request.processedAt ? new Date(request.processedAt).toLocaleString() : '-'}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default AdminPasswordResetPage;
