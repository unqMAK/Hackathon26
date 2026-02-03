import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Save, Bell, Mail, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

interface TeamSettings {
  teamName: string;
  teamDescription: string;
  githubRepo: string;
  notifications: {
    email: boolean;
    push: boolean;
    chat: boolean;
  };
  meetingSchedule: string;
}

const TeamSettings = () => {
  const [settings, setSettings] = useState<TeamSettings>({
    teamName: 'Team InnovatorsX',
    teamDescription: 'A passionate team working on AI-powered solutions for healthcare',
    githubRepo: 'https://github.com/team-innovatorsx/hackathon-project',
    notifications: {
      email: true,
      push: true,
      chat: true
    },
    meetingSchedule: 'Every Friday at 5 PM'
  });

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('teamSettings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error('Error parsing team settings:', e);
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('teamSettings', JSON.stringify(settings));
    toast.success('Team settings saved successfully!');
  };

  const handleNotificationToggle = (type: keyof typeof settings.notifications) => {
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [type]: !settings.notifications[type]
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Team Information</CardTitle>
          <CardDescription>Update your team details and preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="teamName">Team Name</Label>
            <Input
              id="teamName"
              value={settings.teamName}
              onChange={(e) => setSettings({ ...settings, teamName: e.target.value })}
              placeholder="Enter team name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="teamDescription">Team Description</Label>
            <Textarea
              id="teamDescription"
              value={settings.teamDescription}
              onChange={(e) => setSettings({ ...settings, teamDescription: e.target.value })}
              placeholder="Describe your team and project"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="githubRepo">GitHub Repository</Label>
            <Input
              id="githubRepo"
              value={settings.githubRepo}
              onChange={(e) => setSettings({ ...settings, githubRepo: e.target.value })}
              placeholder="https://github.com/your-team/project"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="meetingSchedule">Meeting Schedule</Label>
            <Input
              id="meetingSchedule"
              value={settings.meetingSchedule}
              onChange={(e) => setSettings({ ...settings, meetingSchedule: e.target.value })}
              placeholder="e.g., Every Friday at 5 PM"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Manage how you want to receive team updates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary" />
              <div>
                <Label htmlFor="emailNotif" className="cursor-pointer">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive updates via email</p>
              </div>
            </div>
            <Switch
              id="emailNotif"
              checked={settings.notifications.email}
              onCheckedChange={() => handleNotificationToggle('email')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-secondary" />
              <div>
                <Label htmlFor="pushNotif" className="cursor-pointer">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">Get real-time alerts</p>
              </div>
            </div>
            <Switch
              id="pushNotif"
              checked={settings.notifications.push}
              onCheckedChange={() => handleNotificationToggle('push')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-primary" />
              <div>
                <Label htmlFor="chatNotif" className="cursor-pointer">Chat Notifications</Label>
                <p className="text-sm text-muted-foreground">Notify when someone messages</p>
              </div>
            </div>
            <Switch
              id="chatNotif"
              checked={settings.notifications.chat}
              onCheckedChange={() => handleNotificationToggle('chat')}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="bg-gradient-to-r from-primary to-primary/80">
          <Save className="mr-2 h-4 w-4" />
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default TeamSettings;
