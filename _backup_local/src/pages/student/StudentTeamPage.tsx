import DashboardLayout from '@/components/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Settings, CreditCard } from 'lucide-react';
import TeamMembers from '@/components/team/TeamMembers';
import TeamSettings from '@/components/team/TeamSettings';
import TeamIDCard from '@/components/team/TeamIDCard';
import { useMyTeam } from '@/hooks/useTeam';

const StudentTeamPage = () => {
    const { data: team } = useMyTeam();

    return (
        <DashboardLayout role="student">
            <div className="space-y-6 animate-fade-in">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Team Management</h2>
                    <p className="text-muted-foreground">
                        Manage your team members, communicate, and collaborate effectively
                    </p>
                </div>

                <Tabs defaultValue="members" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 lg:w-[500px]">
                        <TabsTrigger value="members" className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span className="hidden sm:inline">Members</span>
                        </TabsTrigger>
                        <TabsTrigger value="idcard" className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            <span className="hidden sm:inline">ID Card</span>
                        </TabsTrigger>
                        <TabsTrigger value="settings" className="flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            <span className="hidden sm:inline">Settings</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="members" className="mt-6">
                        <TeamMembers />
                    </TabsContent>

                    <TabsContent value="idcard" className="mt-6">
                        {team ? (
                            <TeamIDCard team={team} />
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>Join or create a team to view your ID card</p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="settings" className="mt-6">
                        <TeamSettings />
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
};

export default StudentTeamPage;

