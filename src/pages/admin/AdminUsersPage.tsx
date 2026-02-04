import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';
import { UserPlus, Trash2, Search, Filter, Globe, MapPin, Key, RefreshCw, Edit, Download, FileSpreadsheet } from 'lucide-react';
import { indiaData } from '@/lib/indiaData';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    instituteId?: string;
    instituteName?: string;
    instituteCode?: string;
    state?: string;
    district?: string;
    createdAt: string;
}

const AdminUsersPage = () => {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        password: '',
        role: 'judge',
        instituteName: '',
        instituteCode: '',
        state: '',
        district: '',
        phone: ''
    });
    const [districts, setDistricts] = useState<string[]>([]);

    // Password Reset Dialog State
    const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [resetMode, setResetMode] = useState<'auto' | 'manual'>('auto');
    const [manualPassword, setManualPassword] = useState('');

    const queryClient = useQueryClient();

    // Fetch all users
    const { data: users = [], isLoading } = useQuery({
        queryKey: ['admin-users'],
        queryFn: async () => {
            const { data } = await api.get('/users');
            return data;
        }
    });

    // Create user mutation
    const createUserMutation = useMutation({
        mutationFn: async (userData: typeof newUser) => {
            const endpoint = `/admin/create-${userData.role}`;
            const { data } = await api.post(endpoint, {
                name: userData.name,
                email: userData.email,
                password: userData.password,
                instituteName: userData.instituteName || undefined,
                instituteCode: userData.instituteCode || undefined,
                instituteId: userData.instituteName,
                state: userData.state,
                district: userData.district,
                phone: userData.phone || undefined
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            toast.success('User created successfully!');
            setIsCreateDialogOpen(false);
            setNewUser({
                name: '',
                email: '',
                password: '',
                role: 'judge',
                instituteName: '',
                instituteCode: '',
                state: '',
                district: '',
                phone: ''
            });
            setDistricts([]);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create user');
        }
    });

    // Delete user mutation
    const deleteUserMutation = useMutation({
        mutationFn: async (userId: string) => {
            await api.delete(`/users/${userId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            toast.success('User deleted successfully!');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to delete user');
        }
    });

    // Password reset mutation (automatic - generates random password)
    const autoResetMutation = useMutation({
        mutationFn: async (email: string) => {
            const { data } = await api.post('/admin/reset-user-password', { email });
            return data;
        },
        onSuccess: (data) => {
            toast.success(`Password reset! New password sent to ${selectedUser?.email}`);
            setIsResetDialogOpen(false);
            setSelectedUser(null);
            setManualPassword('');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to reset password');
        }
    });

    // Password reset mutation (manual - admin sets password)
    const manualResetMutation = useMutation({
        mutationFn: async ({ email, password }: { email: string; password: string }) => {
            const { data } = await api.post('/admin/reset-user-password', { email, password });
            return data;
        },
        onSuccess: (data) => {
            toast.success(`Password updated! Notification sent to ${selectedUser?.email}`);
            setIsResetDialogOpen(false);
            setSelectedUser(null);
            setManualPassword('');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to reset password');
        }
    });

    const handleCreateUser = (e: React.FormEvent) => {
        e.preventDefault();

        // State and District required only for SPOC and Mentor
        if ((newUser.role === 'spoc' || newUser.role === 'mentor') && (!newUser.state || !newUser.district)) {
            toast.error('Please select both State and District');
            return;
        }

        createUserMutation.mutate(newUser);
    };

    const handleStateChange = (state: string) => {
        setNewUser({ ...newUser, state, district: '' });
        setDistricts(indiaData[state] || []);
    };

    const handleDeleteUser = (userId: string) => {
        if (confirm('Are you sure you want to delete this user?')) {
            deleteUserMutation.mutate(userId);
        }
    };

    const openResetDialog = (user: User) => {
        setSelectedUser(user);
        setResetMode('auto');
        setManualPassword('');
        setIsResetDialogOpen(true);
    };

    const handlePasswordReset = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;

        if (resetMode === 'auto') {
            autoResetMutation.mutate(selectedUser.email);
        } else {
            if (manualPassword.length < 8) {
                toast.error('Password must be at least 8 characters');
                return;
            }
            manualResetMutation.mutate({ email: selectedUser.email, password: manualPassword });
        }
    };

    // Filter users
    const filteredUsers = users.filter((user: User) => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    // Calculate stats
    const stats = {
        total: users.length,
        students: users.filter((u: User) => u.role === 'student').length,
        judges: users.filter((u: User) => u.role === 'judge').length,
        mentors: users.filter((u: User) => u.role === 'mentor').length,
        spocs: users.filter((u: User) => u.role === 'spoc').length,
        admins: users.filter((u: User) => u.role === 'admin').length
    };

    const isResetPending = autoResetMutation.isPending || manualResetMutation.isPending;

    // CSV Download functions
    const [isDownloading, setIsDownloading] = useState(false);

    const downloadCSV = async (format: 'flat' | 'structured') => {
        setIsDownloading(true);
        try {
            const endpoint = format === 'flat' ? '/admin/export/teams-flat' : '/admin/export/teams-structured';
            const response = await api.get(endpoint, { responseType: 'blob' });

            // Create download link
            const blob = new Blob([response.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            // Extract filename from response headers or generate one
            const contentDisposition = response.headers['content-disposition'];
            let filename = `hacksphere_teams_${format}_${new Date().toISOString().replace(/[:.]/g, '-')}.csv`;
            if (contentDisposition) {
                const match = contentDisposition.match(/filename="(.+)"/);
                if (match) filename = match[1];
            }

            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success(`Teams data exported successfully (${format} format)`);
        } catch (error: any) {
            console.error('Error downloading CSV:', error);
            toast.error(error?.response?.data?.message || 'Failed to download CSV');
        } finally {
            setIsDownloading(false);
        }
    };

    const downloadExcel = async () => {
        setIsDownloading(true);
        try {
            const response = await api.get('/admin/export/teams-excel', { responseType: 'blob' });

            // Create download link
            const blob = new Blob([response.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            // Extract filename from response headers or generate one
            const contentDisposition = response.headers['content-disposition'];
            let filename = `hacksphere_teams_${new Date().toISOString().replace(/[:.]/g, '-')}.xlsx`;
            if (contentDisposition) {
                const match = contentDisposition.match(/filename="(.+)"/);
                if (match) filename = match[1];
            }

            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success('Teams data exported to Excel successfully');
        } catch (error: any) {
            console.error('Error downloading Excel:', error);
            toast.error(error?.response?.data?.message || 'Failed to download Excel');
        } finally {
            setIsDownloading(false);
        }
    };


    return (
        <DashboardLayout role="admin">
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold gradient-text">User Management</h1>
                        <p className="text-muted-foreground">Manage all users and create new accounts</p>
                    </div>
                    <div className="flex gap-2">
                        {/* CSV Download Buttons */}
                        <Button
                            variant="outline"
                            onClick={() => downloadCSV('flat')}
                            disabled={isDownloading}
                            title="Download detailed CSV with one row per team member"
                        >
                            <FileSpreadsheet className="mr-2 h-4 w-4" />
                            {isDownloading ? 'Downloading...' : 'Export Flat CSV'}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => downloadCSV('structured')}
                            disabled={isDownloading}
                            title="Download summary CSV with one row per team"
                        >
                            <Download className="mr-2 h-4 w-4" />
                            {isDownloading ? 'Downloading...' : 'Export Team CSV'}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={downloadExcel}
                            disabled={isDownloading}
                            title="Download as Excel spreadsheet"
                            className="bg-green-50 hover:bg-green-100 border-green-200"
                        >
                            <FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" />
                            {isDownloading ? 'Downloading...' : 'Export Excel'}
                        </Button>

                        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-gradient-to-r from-secondary to-secondary/80">
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    Create User
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Create New User</DialogTitle>
                                    <DialogDescription>
                                        Create a new user with Admin, Judge, Mentor, or SPOC role
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleCreateUser}>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Full Name *</Label>
                                            <Input
                                                id="name"
                                                value={newUser.name}
                                                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email *</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={newUser.email}
                                                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="password">Password *</Label>
                                            <Input
                                                id="password"
                                                type="password"
                                                value={newUser.password}
                                                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                                required
                                                minLength={8}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="role">Role *</Label>
                                            <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="admin">Admin</SelectItem>
                                                    <SelectItem value="judge">Judge</SelectItem>
                                                    <SelectItem value="mentor">Mentor</SelectItem>
                                                    <SelectItem value="spoc">SPOC</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        {/* Phone Number - Only for Judge */}
                                        {newUser.role === 'judge' && (
                                            <div className="space-y-2">
                                                <Label htmlFor="phone">Phone Number *</Label>
                                                <Input
                                                    id="phone"
                                                    type="tel"
                                                    value={newUser.phone}
                                                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                                                    required={newUser.role === 'judge'}
                                                    placeholder="e.g. +91 9876543210"
                                                />
                                            </div>
                                        )}
                                        {/* Institute Fields - Not required for Judge */}
                                        {newUser.role !== 'judge' && (
                                            <>
                                                <div className="space-y-2">
                                                    <Label htmlFor="instituteName">Institute Name {newUser.role !== 'admin' ? '*' : '(Optional)'}</Label>
                                                    <Input
                                                        id="instituteName"
                                                        value={newUser.instituteName}
                                                        onChange={(e) => setNewUser({ ...newUser, instituteName: e.target.value })}
                                                        required={newUser.role !== 'admin'}
                                                        placeholder="e.g. MIT Vishwaprayag University"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="instituteCode">Institute ID (Code) {newUser.role !== 'admin' ? '*' : '(Optional)'}</Label>
                                                    <Input
                                                        id="instituteCode"
                                                        value={newUser.instituteCode}
                                                        onChange={(e) => setNewUser({ ...newUser, instituteCode: e.target.value.toUpperCase() })}
                                                        required={newUser.role !== 'admin'}
                                                        placeholder="e.g. MITVPU"
                                                    />
                                                </div>
                                            </>
                                        )}
                                        {/* State and District - Only for SPOC and Mentor */}
                                        {(newUser.role === 'spoc' || newUser.role === 'mentor') && (
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="state">State *</Label>
                                                    <Select value={newUser.state} onValueChange={handleStateChange}>
                                                        <SelectTrigger id="state">
                                                            <SelectValue placeholder="Select State" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {Object.keys(indiaData).sort().map((state) => (
                                                                <SelectItem key={state} value={state}>
                                                                    {state}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="district">District *</Label>
                                                    <Select
                                                        value={newUser.district}
                                                        onValueChange={(value) => setNewUser({ ...newUser, district: value })}
                                                        disabled={!newUser.state}
                                                    >
                                                        <SelectTrigger id="district">
                                                            <SelectValue placeholder="Select District" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {districts.map((district) => (
                                                                <SelectItem key={district} value={district}>
                                                                    {district}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit" disabled={createUserMutation.isPending}>
                                            {createUserMutation.isPending ? 'Creating...' : 'Create User'}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Password Reset Dialog */}
                <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Key className="h-5 w-5" />
                                Reset Password
                            </DialogTitle>
                            <DialogDescription>
                                Reset password for <strong>{selectedUser?.name}</strong> ({selectedUser?.email})
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handlePasswordReset}>
                            <div className="space-y-4 py-4">
                                <RadioGroup value={resetMode} onValueChange={(v) => setResetMode(v as 'auto' | 'manual')}>
                                    <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                                        <RadioGroupItem value="auto" id="auto" />
                                        <Label htmlFor="auto" className="flex-1 cursor-pointer">
                                            <div className="flex items-center gap-2">
                                                <RefreshCw className="h-4 w-4 text-blue-600" />
                                                <span className="font-medium">Auto Generate Password</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                System will generate a random secure password and email it to the user
                                            </p>
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                                        <RadioGroupItem value="manual" id="manual" />
                                        <Label htmlFor="manual" className="flex-1 cursor-pointer">
                                            <div className="flex items-center gap-2">
                                                <Edit className="h-4 w-4 text-purple-600" />
                                                <span className="font-medium">Set Password Manually</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                You enter the new password and it will be emailed to the user
                                            </p>
                                        </Label>
                                    </div>
                                </RadioGroup>

                                {resetMode === 'manual' && (
                                    <div className="space-y-2 mt-4">
                                        <Label htmlFor="newPassword">New Password *</Label>
                                        <Input
                                            id="newPassword"
                                            type="password"
                                            value={manualPassword}
                                            onChange={(e) => setManualPassword(e.target.value)}
                                            placeholder="Enter new password (min 8 characters)"
                                            minLength={8}
                                            required
                                        />
                                    </div>
                                )}
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsResetDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isResetPending}>
                                    {isResetPending ? 'Resetting...' : 'Reset Password'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Students</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.students}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Judges</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.judges}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Mentors</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.mentors}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">SPOCs</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.spocs}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Admins</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.admins}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Users</CardTitle>
                        <CardDescription>Search and filter users</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4 mb-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Select value={roleFilter} onValueChange={setRoleFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <Filter className="mr-2 h-4 w-4" />
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Roles</SelectItem>
                                    <SelectItem value="student">Students</SelectItem>
                                    <SelectItem value="judge">Judges</SelectItem>
                                    <SelectItem value="mentor">Mentors</SelectItem>
                                    <SelectItem value="spoc">SPOCs</SelectItem>
                                    <SelectItem value="admin">Admins</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Users Table */}
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Institute Name</TableHead>
                                        <TableHead>Institute Code</TableHead>
                                        <TableHead>State</TableHead>
                                        <TableHead>District</TableHead>
                                        <TableHead>Created At</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={9} className="text-center">Loading...</TableCell>
                                        </TableRow>
                                    ) : filteredUsers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={9} className="text-center">No users found</TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredUsers.map((user: User) => (
                                            <TableRow key={user._id}>
                                                <TableCell className="font-medium">{user.name}</TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${user.role === 'admin' ? 'bg-red-100 text-red-800' : ''}
                            ${user.role === 'judge' ? 'bg-purple-100 text-purple-800' : ''}
                            ${user.role === 'mentor' ? 'bg-blue-100 text-blue-800' : ''}
                            ${user.role === 'spoc' ? 'bg-yellow-100 text-yellow-800' : ''}
                            ${user.role === 'student' ? 'bg-green-100 text-green-800' : ''}
                          `}>
                                                        {user.role.toUpperCase()}
                                                    </span>
                                                </TableCell>
                                                <TableCell>{user.instituteName || user.instituteId || '-'}</TableCell>
                                                <TableCell>{user.instituteCode || user.instituteId || '-'}</TableCell>
                                                <TableCell>{user.state || '-'}</TableCell>
                                                <TableCell>{user.district || '-'}</TableCell>
                                                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => openResetDialog(user)}
                                                            title="Reset Password"
                                                        >
                                                            <Key className="h-4 w-4 text-blue-600" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDeleteUser(user._id)}
                                                            disabled={deleteUserMutation.isPending || user.role === 'admin'}
                                                            title={user.role === 'admin' ? 'Cannot delete admin users' : 'Delete User'}
                                                            className={user.role === 'admin' ? 'cursor-not-allowed opacity-50' : ''}
                                                        >
                                                            <Trash2 className="h-4 w-4 text-destructive" />
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
            </div>
        </DashboardLayout>
    );
};

export default AdminUsersPage;
