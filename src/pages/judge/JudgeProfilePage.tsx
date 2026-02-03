import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getCurrentUser } from '@/lib/mockAuth';
import { toast } from 'sonner';

const JudgeProfilePage = () => {
    const user = getCurrentUser();

    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [domain, setDomain] = useState('AI/ML');
    const [phone, setPhone] = useState('');
    const [bio, setBio] = useState('');

    const handleSaveProfile = () => {
        toast.success('Profile updated successfully!');
    };

    return (
        <DashboardLayout role="judge">
            <div className="space-y-6 animate-fade-in">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Profile</h2>
                    <p className="text-muted-foreground">Manage your personal information and settings.</p>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Profile Picture Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Picture</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center space-y-4">
                            <Avatar className="h-32 w-32">
                                <AvatarImage src="" alt={name} />
                                <AvatarFallback className="text-3xl">{name[0]}</AvatarFallback>
                            </Avatar>
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
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="domain">Domain Expertise</Label>
                                    <Input
                                        id="domain"
                                        value={domain}
                                        onChange={(e) => setDomain(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="+91 XXXXX XXXXX"
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
                        <CardFooter>
                            <Button onClick={handleSaveProfile}>Save Changes</Button>
                        </CardFooter>
                    </Card>
                </div>

                {/* Account Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Account Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Role</p>
                                <p className="text-lg font-semibold capitalize">{user?.role}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Account Status</p>
                                <p className="text-lg font-semibold text-green-600">Active</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Member Since</p>
                                <p className="text-lg font-semibold">November 2024</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Evaluations</p>
                                <p className="text-lg font-semibold">12</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default JudgeProfilePage;
