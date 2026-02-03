import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  Users, FileText, CheckCircle, Clock, Send, Paperclip, Upload, MessageSquare
} from 'lucide-react';
import { useProblems, useSubmissions, useCreateSubmission } from '@/hooks/useMockData';
import { useMyTeam } from '@/hooks/useTeam';
import { getCurrentUser } from '@/lib/mockAuth';
import { toast } from 'sonner';

const getProblemId = (problemId: any): string | null => {
  if (!problemId) return null;
  if (typeof problemId === 'string') return problemId;
  if (typeof problemId === 'object' && problemId?._id) return problemId._id;
  return null;
};

const TeamLeaderDashboard = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const { data: myTeam, isLoading: isTeamLoading } = useMyTeam();
  const { data: problems = [] } = useProblems();
  const { data: submissions = [] } = useSubmissions();
  const createSubmission = useCreateSubmission();

  // Filter submissions for the current team
  const mySubmissions = submissions.filter(s => s.teamId === myTeam?._id);

  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { sender: 'System', text: 'Welcome to your Team Dashboard!', time: '10:00 AM' },
  ]);

  const [submissionLink, setSubmissionLink] = useState('');
  const [submissionDesc, setSubmissionDesc] = useState('');

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      setChatHistory([...chatHistory, { sender: 'You', text: chatMessage, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      setChatMessage('');
    }
  };

  const handleSubmitProject = () => {
    if (myTeam && submissionLink && submissionDesc) {
      createSubmission.mutate({
        id: `sub-${Date.now()}`,
        teamId: myTeam._id,
        problemId: getProblemId(myTeam.problemId) || 'p1',
        fileUrl: submissionLink,
        description: submissionDesc,
        submittedAt: new Date().toISOString()
      });
      setSubmissionLink('');
      setSubmissionDesc('');
    } else {
      toast.error('Please fill in all fields');
    }
  };

  const stats = [
    { title: 'Team Status', value: myTeam?.status || 'Pending', icon: Users, color: 'text-blue-500' },
    { title: 'Problem', value: myTeam?.problemId ? 'Selected' : 'Not Selected', icon: FileText, color: 'text-purple-500' },
    { title: 'Submissions', value: mySubmissions.length, icon: Upload, color: 'text-green-500' },
    { title: 'Deadline', value: '3 Days', icon: Clock, color: 'text-orange-500' },
  ];

  if (isTeamLoading) {
    return (
      <DashboardLayout role="student">
        <div className="flex items-center justify-center h-full">
          <p>Loading dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student">
      <div className="space-y-6 animate-fade-in">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Team Leader Dashboard</h2>
          <p className="text-muted-foreground">Manage your team, track progress, and submit your project.</p>

          {myTeam ? (
            <div className="mt-4 flex flex-col md:flex-row gap-4">
              <Badge variant="outline" className="w-fit text-sm py-1 px-3">
                Team: <span className="font-semibold ml-1">{myTeam.name}</span>
              </Badge>
              <Badge variant="outline" className="w-fit text-sm py-1 px-3">
                Institute: <span className="font-semibold ml-1">{myTeam.instituteName || 'N/A'}</span>
              </Badge>
            </div>
          ) : (
            <div className="mt-4 p-4 border rounded-lg bg-yellow-50 text-yellow-800">
              <p>Your team registration is still being processed or could not be loaded.</p>
            </div>
          )}
        </div>

        {/* Only show dashboard content if user has a team */}
        {myTeam && (
          <>
            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, index) => (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="team">Team Members</TabsTrigger>
                <TabsTrigger value="problems">Problems</TabsTrigger>
                <TabsTrigger value="submission">Submission</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Governance Partners</CardTitle>
                      <CardDescription>Your Institute's official points of contact.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-4 border p-3 rounded-lg">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">SPOC</p>
                          <p className="text-sm text-muted-foreground">{myTeam.spocName}</p>
                          <p className="text-xs text-muted-foreground">{myTeam.spocEmail}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 border p-3 rounded-lg">
                        <div className="bg-purple-100 p-2 rounded-full">
                          <Users className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Mentor</p>
                          <p className="text-sm text-muted-foreground">{myTeam.mentorName}</p>
                          <p className="text-xs text-muted-foreground">{myTeam.mentorEmail}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Updates</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <div className="mt-1 bg-green-100 p-1 rounded-full"><CheckCircle className="h-3 w-3 text-green-600" /></div>
                          <div>
                            <p className="text-sm font-medium">Team Successfully Registered</p>
                            <p className="text-xs text-muted-foreground">You have access to the dashboard.</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Team Tab */}
              <TabsContent value="team">
                <Card>
                  <CardHeader>
                    <CardTitle>Team Roster</CardTitle>
                    <CardDescription>
                      Only the Team Leader can manage team communications. Member details are locked as per registration.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {myTeam?.members?.length ? myTeam.members.map((member, i) => (
                      <div key={i} className="flex items-center justify-between border-b pb-3 last:border-0">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarFallback>{member.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{member.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">{member.role === 'student' && member._id === myTeam.leaderId ? 'Team Leader' : 'Member'}</p>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {member.email}
                        </div>
                      </div>
                    )) : (
                      <p className="text-sm text-muted-foreground">No members found.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Problems Tab */}
              <TabsContent value="problems">
                <Card>
                  <CardHeader>
                    <CardTitle>Problem Statements</CardTitle>
                    <CardDescription>Select the problem your team is solving.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {problems.map((problem) => (
                        <div key={problem.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{problem.title}</h4>
                              <Badge variant="outline">{problem.difficulty}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{problem.description}</p>
                          </div>
                          <Button
                            variant={getProblemId(myTeam?.problemId) === problem.id ? "secondary" : "default"}
                            onClick={() => {
                              // In a real app, this would call an API
                              navigate('/problem-statements');
                            }}
                          >
                            {getProblemId(myTeam?.problemId) === problem.id ? "Selected" : "View"}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Submission Tab */}
              <TabsContent value="submission">
                <Card>
                  <CardHeader>
                    <CardTitle>Project Submission</CardTitle>
                    <CardDescription>Submit your project details and files.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="link">Project Link (GitHub/Drive)</Label>
                      <Input
                        id="link"
                        placeholder="https://..."
                        value={submissionLink}
                        onChange={(e) => setSubmissionLink(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="desc">Description</Label>
                      <Textarea
                        id="desc"
                        placeholder="Describe your solution..."
                        className="min-h-[100px]"
                        value={submissionDesc}
                        onChange={(e) => setSubmissionDesc(e.target.value)}
                      />
                    </div>
                    <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 transition-colors cursor-pointer">
                      <Upload className="h-8 w-8 mb-2" />
                      <p className="text-sm">Drag & drop files here or click to upload</p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" onClick={handleSubmitProject}>
                      <Paperclip className="mr-2 h-4 w-4" />
                      Submit Project
                    </Button>
                  </CardFooter>
                </Card>

                {mySubmissions.length > 0 && (
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>Submission History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {mySubmissions.map((sub, i) => (
                          <div key={i} className="flex items-center justify-between border-b pb-2">
                            <div>
                              <p className="font-medium">Submission #{i + 1}</p>
                              <p className="text-xs text-muted-foreground">{new Date(sub.submittedAt).toLocaleString()}</p>
                            </div>
                            <Badge variant="outline">Submitted</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TeamLeaderDashboard;