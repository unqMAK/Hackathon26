import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSpocStats } from '@/hooks/useSpoc';
import { Users, CheckCircle, XCircle, Clock, Mail, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

const SpocDashboard = () => {
  const { data: stats, isLoading } = useSpocStats();

  const statCards = [
    {
      title: 'Pending Teams',
      value: stats?.pendingTeams || 0,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      link: '/spoc/teams/pending'
    },
    {
      title: 'Approved Teams',
      value: stats?.approvedTeams || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      link: '/spoc/teams/approved'
    },
    {
      title: 'Rejected Teams',
      value: stats?.rejectedTeams || 0,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      link: '/spoc/teams/rejected'
    },
    {
      title: 'Total Teams',
      value: stats?.totalTeams || 0,
      icon: Layers,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      link: '/spoc/teams/pending' // Or a dedicated 'all teams' page if it exists, otherwise pending or just teams root
    },
    {
      title: 'Total Students',
      value: stats?.totalStudents || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      link: '/spoc/students'
    },
    {
      title: 'Pending Invites',
      value: stats?.pendingInvites || 0,
      icon: Mail,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      link: '/spoc/invitations'
    }
  ];

  return (
    <DashboardLayout role="spoc">
      <div className="space-y-6 animate-fade-in">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">SPOC Dashboard</h2>
          <p className="text-muted-foreground">
            Manage teams and students from your institute
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link key={stat.title} to={stat.link}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.title}
                    </CardTitle>
                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {isLoading ? '...' : stat.value}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Click to view details
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Link
              to="/spoc/teams/pending"
              className="p-4 border rounded-lg hover:bg-accent transition-colors"
            >
              <h3 className="font-semibold mb-1">Approval Requests</h3>
              <p className="text-sm text-muted-foreground">
                Approve or reject team registrations
              </p>
            </Link>
            <Link
              to="/spoc/students"
              className="p-4 border rounded-lg hover:bg-accent transition-colors"
            >
              <h3 className="font-semibold mb-1">View Students</h3>
              <p className="text-sm text-muted-foreground">
                See all students from your institute
              </p>
            </Link>
            <Link
              to="/spoc/teams/approved"
              className="p-4 border rounded-lg hover:bg-accent transition-colors"
            >
              <h3 className="font-semibold mb-1">Monitor Teams</h3>
              <p className="text-sm text-muted-foreground">
                Track approved team progress
              </p>
            </Link>
            <Link
              to="/spoc/invitations"
              className="p-4 border rounded-lg hover:bg-accent transition-colors"
            >
              <h3 className="font-semibold mb-1">Invitation Logs</h3>
              <p className="text-sm text-muted-foreground">
                View team invitation history
              </p>
            </Link>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SpocDashboard;