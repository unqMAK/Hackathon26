import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, MessageSquare, FolderOpen, Settings } from 'lucide-react';
import TeamMembers from '@/components/team/TeamMembers';
import TeamChat from '@/components/team/TeamChat';
import TeamFiles from '@/components/team/TeamFiles';
import TeamSettings from '@/components/team/TeamSettings';

const TeamManagement = () => {
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
          <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
            <TabsTrigger value="members" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Members</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Chat</span>
            </TabsTrigger>
            <TabsTrigger value="files" className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Files</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="mt-6">
            <TeamMembers />
          </TabsContent>

          <TabsContent value="chat" className="mt-6">
            <TeamChat />
          </TabsContent>

          <TabsContent value="files" className="mt-6">
            <TeamFiles />
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <TeamSettings />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default TeamManagement;
