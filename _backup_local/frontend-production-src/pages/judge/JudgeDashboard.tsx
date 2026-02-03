import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  FileText,
  CheckCircle,
  Clock,
  Award,
  Loader2,
  ClipboardCheck,
  Eye
} from 'lucide-react';
import { evaluationService } from '@/services/evaluationService';
import type { AssignedTeam, Evaluation } from '@/types/evaluation';

const JudgeDashboard = () => {
  const navigate = useNavigate();

  // Fetch assigned teams
  const { data: assignedTeams = [], isLoading: loadingTeams } = useQuery({
    queryKey: ['assignedTeams'],
    queryFn: evaluationService.getAssignedTeams
  });

  // Fetch my evaluations
  const { data: myEvaluations = [], isLoading: loadingEvaluations } = useQuery({
    queryKey: ['myEvaluations'],
    queryFn: evaluationService.getMyEvaluations
  });

  const pendingTeams = assignedTeams.filter((t: AssignedTeam) => !t.isEvaluated);
  const evaluatedTeams = assignedTeams.filter((t: AssignedTeam) => t.isEvaluated);

  const highestScore = myEvaluations.length > 0
    ? Math.max(...myEvaluations.map((e: Evaluation) => e.totalScore))
    : 0;

  const stats = [
    {
      title: 'Pending Reviews',
      value: pendingTeams.length,
      icon: Clock,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Evaluated',
      value: evaluatedTeams.length,
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Total Assigned',
      value: assignedTeams.length,
      icon: FileText,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Highest Score',
      value: Math.round(highestScore),
      icon: Award,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50'
    },
  ];

  const isLoading = loadingTeams || loadingEvaluations;

  return (
    <DashboardLayout role="judge">
      <div className="space-y-6 animate-fade-in">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Judge Dashboard</h2>
          <p className="text-muted-foreground">Evaluate teams using rubric-based scoring.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : stat.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Teams to Evaluate */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5" />
              Teams to Evaluate
            </CardTitle>
            <CardDescription>
              {pendingTeams.length} teams pending evaluation
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Team Name</TableHead>
                    <TableHead>Problem</TableHead>
                    <TableHead>Leader</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignedTeams.map((team: AssignedTeam) => (
                    <TableRow key={team._id}>
                      <TableCell className="font-medium">{team.name}</TableCell>
                      <TableCell>
                        {team.problemId?.title || 'N/A'}
                        {team.problemId?.category && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            {team.problemId.category}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{team.leaderId?.name || 'N/A'}</TableCell>
                      <TableCell>
                        {team.isEvaluated ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Evaluated
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-100 text-amber-800">
                            <Clock className="w-3 h-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {team.isEvaluated ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/judge/evaluate/${team._id}`)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => navigate(`/judge/evaluate/${team._id}`)}
                          >
                            Evaluate Now
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {assignedTeams.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        No teams assigned yet. Contact admin for assignments.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* My Evaluations */}
        {myEvaluations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>My Evaluations</CardTitle>
              <CardDescription>Scores you have submitted</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Team</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Submitted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myEvaluations.map((eval_: Evaluation) => (
                    <TableRow key={eval_._id}>
                      <TableCell className="font-medium">
                        {typeof eval_.teamId === 'object' ? eval_.teamId.name : 'Unknown'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-lg px-3">
                          {Math.round(eval_.totalScore)}/100
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(eval_.submittedAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default JudgeDashboard;