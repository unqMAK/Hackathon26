import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Calendar, Users, Settings, AlertTriangle, Save } from 'lucide-react';

const AdminSettingsPage = () => {
    // General Settings
    const [hackathonName, setHackathonName] = useState('HackSphere 2025');
    const [tagline, setTagline] = useState('Innovate for the Future');
    const [description, setDescription] = useState('Annual hackathon event bringing together the brightest minds.');

    // Timeline
    const [regStartDate, setRegStartDate] = useState('2024-12-01');
    const [regEndDate, setRegEndDate] = useState('2024-12-31');
    const [eventStartDate, setEventStartDate] = useState('2025-01-15');
    const [eventEndDate, setEventEndDate] = useState('2025-01-17');

    // Constraints
    const [minTeamSize, setMinTeamSize] = useState('3');
    const [maxTeamSize, setMaxTeamSize] = useState('6');
    const [allowCrossInstitute, setAllowCrossInstitute] = useState(true);

    // System
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [registrationsOpen, setRegistrationsOpen] = useState(true);

    const handleSave = () => {
        toast.success('Settings updated successfully!');
    };

    return (
        <DashboardLayout role="admin">
            <div className="space-y-6 animate-fade-in pb-10">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Platform Settings</h2>
                    <p className="text-muted-foreground">Configure the hackathon parameters and system preferences.</p>
                </div>

                <div className="grid gap-6">
                    {/* General Configuration */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Settings className="h-5 w-5 text-primary" />
                                <CardTitle>General Configuration</CardTitle>
                            </div>
                            <CardDescription>Basic details about the hackathon event.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="hackathonName">Hackathon Name</Label>
                                    <Input
                                        id="hackathonName"
                                        value={hackathonName}
                                        onChange={(e) => setHackathonName(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tagline">Tagline</Label>
                                    <Input
                                        id="tagline"
                                        value={tagline}
                                        onChange={(e) => setTagline(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="min-h-[100px]"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Timeline Settings */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-primary" />
                                <CardTitle>Timeline & Schedule</CardTitle>
                            </div>
                            <CardDescription>Manage important dates for the event.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Registration Start</Label>
                                    <Input type="date" value={regStartDate} onChange={(e) => setRegStartDate(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Registration End</Label>
                                    <Input type="date" value={regEndDate} onChange={(e) => setRegEndDate(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Event Start</Label>
                                    <Input type="date" value={eventStartDate} onChange={(e) => setEventStartDate(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Event End</Label>
                                    <Input type="date" value={eventEndDate} onChange={(e) => setEventEndDate(e.target.value)} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Participation Rules */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-primary" />
                                <CardTitle>Participation Rules</CardTitle>
                            </div>
                            <CardDescription>Set constraints for teams and participants.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Minimum Team Size</Label>
                                    <Input type="number" min="1" value={minTeamSize} onChange={(e) => setMinTeamSize(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Maximum Team Size</Label>
                                    <Input type="number" min="1" value={maxTeamSize} onChange={(e) => setMaxTeamSize(e.target.value)} />
                                </div>
                            </div>

                            <Separator />

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Allow Cross-Institute Teams</Label>
                                    <p className="text-sm text-muted-foreground">
                                        If enabled, students from different institutes can form a team.
                                    </p>
                                </div>
                                <Switch
                                    checked={allowCrossInstitute}
                                    onCheckedChange={setAllowCrossInstitute}
                                />
                            </div>

                            <Separator />

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Registrations Open</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Control whether new users can register for the hackathon.
                                    </p>
                                </div>
                                <Switch
                                    checked={registrationsOpen}
                                    onCheckedChange={setRegistrationsOpen}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Danger Zone */}
                    <Card className="border-red-200 dark:border-red-900">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-red-500" />
                                <CardTitle className="text-red-500">System Controls</CardTitle>
                            </div>
                            <CardDescription>Sensitive system-wide actions.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Maintenance Mode</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Disable access for all non-admin users.
                                    </p>
                                </div>
                                <Switch
                                    checked={maintenanceMode}
                                    onCheckedChange={setMaintenanceMode}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex justify-end gap-4 sticky bottom-6">
                    <Button variant="outline">Discard Changes</Button>
                    <Button onClick={handleSave} className="gap-2">
                        <Save className="h-4 w-4" />
                        Save All Settings
                    </Button>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminSettingsPage;
