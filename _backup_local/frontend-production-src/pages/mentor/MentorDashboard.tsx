import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Users,
  MessageSquare,
  CheckCircle,
  Clock,
  TrendingUp,
  Loader2,
  Eye,
  FileText
} from 'lucide-react';
import { getMyTeams, getMentorStats } from '@/services/mentorService';
import type { MentorAssignedTeam, MentorStats } from '@/types/mentor';

const MentorDashboard = () => {
  const navigate = useNavigate();

  // Fetch assigned teams
  const { data: teams = [], isLoading: loadingTeams } = useQuery({
    queryKey: ['mentorTeams'],
    queryFn: getMyTeams
  });

  // Fetch stats
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['mentorStats'],
    queryFn: getMentorStats
  });

  const isLoading = loadingTeams || loadingStats;

  const getPhaseStatus = (phase: string) => {
    switch (phase) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" /> Approved</Badge>;
      case 'changes-required':
        return <Badge className="bg-amber-100 text-amber-800"><Clock className="w-3 h-3 mr-1" /> Changes</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
    }
  };

  const calculateProgress = (team: MentorAssignedTeam) => {
    if (!team.phases) return 0;
    const phases = team.phases;
    let approved = 0;
    if (phases.ideation === 'approved') approved++;
    if (phases.prototype === 'approved') approved++;
    if (phases.development === 'approved') approved++;
    if (phases.final === 'approved') approved++;
    return Math.round((approved / 4) * 100);
  };

  const statCards = [
    {
      title: 'Assigned Teams',
      value: stats?.assignedTeams || 0,
      icon: Users,
      color: 'text-blue-500'
    },
    {
      title: 'Feedback Given',
      value: stats?.totalFeedback || 0,
      icon: MessageSquare,
      color: 'text-purple-500'
    },
    {
      title: 'Phases Approved',
      value: stats?.approvedPhases || 0,
      icon: CheckCircle,
      color: 'text-green-500'
    },
    {
      title: 'Pending Reviews',
      value: stats?.pendingReviews || 0,
      icon: Clock,
      color: 'text-amber-500'
    },
  ];

  return (
    <DashboardLayout role="mentor">
      <div className="space-y-6 animate-fade-in">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Mentor Dashboard</h2>
          <p className="text-muted-foreground">Guide your teams through their hackathon journey.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stat.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Assigned Teams */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              My Assigned Teams
            </CardTitle>
            <CardDescription>
              Teams you are mentoring through the hackathon
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : teams.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Team Name</TableHead>
                    <TableHead>Problem Statement</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Latest Phase</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teams.map((team: MentorAssignedTeam) => (
                    <TableRow key={team._id}>
                      <TableCell className="font-medium">
                        {team.name}
                      </TableCell>
                      <TableCell>
                        {team.problemId?.title || 'Not selected'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={calculateProgress(team)}
                            className="w-20"
                          />
                          <span className="text-sm text-muted-foreground">
                            {calculateProgress(team)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {team.latestFeedback ? (
                          <div className="flex flex-col gap-1">
                            <span className="text-xs text-muted-foreground capitalize">
                              {team.latestFeedback.phase}
                            </span>
                            {getPhaseStatus(team.latestFeedback.status)}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">No feedback yet</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={() => navigate(`/mentor/team/${team._id}`)}
                        >
                          <Eye className="h-4 w-4 mr-1" /> View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No teams assigned yet.</p>
                <p className="text-sm mt-2">
                  Contact an administrator to get teams assigned to you.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Team Progress Overview */}
        {teams.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Team Progress Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {teams.map((team: MentorAssignedTeam) => (
                  <Card key={team._id} className="bg-muted/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{team.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">Ideation:</span>
                        </div>
                        <div>{getPhaseStatus(team.phases?.ideation || 'pending')}</div>

                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">Prototype:</span>
                        </div>
                        <div>{getPhaseStatus(team.phases?.prototype || 'pending')}</div>

                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">Development:</span>
                        </div>
                        <div>{getPhaseStatus(team.phases?.development || 'pending')}</div>

                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">Final:</span>
                        </div>
                        <div>{getPhaseStatus(team.phases?.final || 'pending')}</div>
                      </div>
                      <Button
                        variant="secondary"
                        className="w-full"
                        onClick={() => navigate(`/mentor/team/${team._id}`)}
                      >
                        Review & Feedback
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MentorDashboard;