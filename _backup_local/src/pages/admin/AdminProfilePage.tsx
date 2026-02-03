import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getCurrentUser } from '@/lib/mockAuth';
import { toast } from 'sonner';
import { Shield, Mail, Phone, Building2, Calendar } from 'lucide-react';

const AdminProfilePage = () => {
    const user = getCurrentUser();

    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState('+91 98765 43210');
    const [department, setDepartment] = useState('Administration');
    const [bio, setBio] = useState('System Administrator for HackSphere Portal');

    const handleSaveProfile = () => {
        toast.success('Profile updated successfully!');
    };

    const handleChangePassword = () => {
        toast.info('Password change feature coming soon!');
    };

    return (
        <DashboardLayout role="admin">
            <div className="space-y-6 animate-fade-in">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Admin Profile</h2>
                    <p className="text-muted-foreground">Manage your administrator account settings and information.</p>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Profile Picture Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Picture</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center space-y-4">
                            <Avatar className="h-32 w-32 ring-4 ring-primary/10">
                                <AvatarImage src="" alt={name} />
                                <AvatarFallback className="text-3xl bg-primary/10">
                                    <Shield className="h-12 w-12" />
                                </AvatarFallback>
                            </Avatar>
                            <div className="text-center">
                                <p className="font-semibold text-lg">{name}</p>
                                <p className="text-sm text-muted-foreground flex items-center gap-1 justify-center mt-1">
                                    <Shield className="h-3 w-3" />
                                    Administrator
                                </p>
                            </div>
                            <Button variant="outline" size="sm">Change Picture</Button>
                        </CardContent>
                    </Card>

                    {/* Profile Info Card */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>Update your profile details.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="flex items-center gap-2">
                                        <Mail className="h-4 w-4" />
                                        Email
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="flex items-center gap-2">
                                        <Phone className="h-4 w-4" />
                                        Phone Number
                                    </Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="+91 XXXXX XXXXX"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="department" className="flex items-center gap-2">
                                        <Building2 className="h-4 w-4" />
                                        Department
                                    </Label>
                                    <Input
                                        id="department"
                                        value={department}
                                        onChange={(e) => setDepartment(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bio">Bio</Label>
                                <Input
                                    id="bio"
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    placeholder="Tell us about yourself..."
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex gap-2">
                            <Button onClick={handleSaveProfile}>Save Changes</Button>
                            <Button variant="outline" onClick={handleChangePassword}>Change Password</Button>
                        </CardFooter>
                    </Card>
                </div>

                {/* Account Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Account Information</CardTitle>
                        <CardDescription>Your administrator account details and permissions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 md:grid-cols-4">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <Shield className="h-4 w-4" />
                                    Role
                                </p>
                                <p className="text-lg font-semibold capitalize">{user?.role}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Account Status</p>
                                <p className="text-lg font-semibold text-green-600">Active</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Member Since
                                </p>
                                <p className="text-lg font-semibold">December 2025</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Permissions</p>
                                <p className="text-lg font-semibold">Full Access</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Security Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>Security Settings</CardTitle>
                        <CardDescription>Manage your account security</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between py-2">
                            <div>
                                <p className="font-medium">Two-Factor Authentication</p>
                                <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                            </div>
                            <Button variant="outline" size="sm">Enable</Button>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <div>
                                <p className="font-medium">Session Management</p>
                                <p className="text-sm text-muted-foreground">Manage your active sessions</p>
                            </div>
                            <Button variant="outline" size="sm">View Sessions</Button>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <div>
                                <p className="font-medium">Login History</p>
                                <p className="text-sm text-muted-foreground">Review recent login activity</p>
                            </div>
                            <Button variant="outline" size="sm">View History</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default AdminProfilePage;
