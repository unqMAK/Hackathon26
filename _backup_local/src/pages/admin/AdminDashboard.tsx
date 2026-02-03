import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Users, FileText, Award, TrendingUp, Building, CheckCircle,
  Plus, Trash2, Search, Edit
} from 'lucide-react';
import { useUsers, useTeams, useProblems, useCreateProblem, useDeleteUser } from '@/hooks/useMockData';
import { Problem } from '@/lib/mockData';
import { timelineService, TimelineEvent } from '@/services/timelineService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const AdminDashboard = () => {
  const { data: users = [] } = useUsers();
  const { data: teams = [] } = useTeams();
  const { data: problems = [] } = useProblems();
  const createProblem = useCreateProblem();
  const deleteUser = useDeleteUser();

  const [newProblem, setNewProblem] = useState<Partial<Problem>>({
    title: '',
    description: '',
    category: '',
    difficulty: 'Medium'
  });
  const [isProblemDialogOpen, setIsProblemDialogOpen] = useState(false);

  const handleCreateProblem = () => {
    if (newProblem.title && newProblem.description) {
      createProblem.mutate({
        id: `p-${Date.now()}`,
        title: newProblem.title,
        description: newProblem.description,
        category: newProblem.category || 'General',
        difficulty: newProblem.difficulty as 'Easy' | 'Medium' | 'Hard'
      } as Problem);
      setIsProblemDialogOpen(false);
      setNewProblem({ title: '', description: '', category: '', difficulty: 'Medium' });
    }
  };

  const stats = [
    { title: 'Total Users', value: users.length, icon: Users, color: 'text-blue-500' },
    { title: 'Total Teams', value: teams.length, icon: Building, color: 'text-green-500' },
    { title: 'Active Problems', value: problems.length, icon: FileText, color: 'text-purple-500' },
    { title: 'Pending Teams', value: teams.filter(t => t.status === 'pending').length, icon: CheckCircle, color: 'text-orange-500' },
  ];

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6 animate-fade-in">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
          <p className="text-muted-foreground">Manage users, teams, and hackathon content.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
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
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="teams">Team Management</TabsTrigger>
            <TabsTrigger value="problems">Problem Statements</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest actions across the platform.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teams.slice(0, 5).map((team, i) => (
                    <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0">
                      <div>
                        <p className="font-medium">New Team Registered: {team.name}</p>
                        <p className="text-sm text-muted-foreground">Status: {team.status}</p>
                      </div>
                      <Badge variant={team.status === 'approved' ? 'default' : 'secondary'}>
                        {team.status}
                      </Badge>
                    </div>
                  ))}
                  {teams.length === 0 && <p className="text-muted-foreground">No recent activity.</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Users</CardTitle>
                <CardDescription>Manage registered users and their roles.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">{user.role}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteUser.mutate(user.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {users.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4">No users found.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Teams Tab */}
          <TabsContent value="teams">
            <Card>
              <CardHeader>
                <CardTitle>Teams</CardTitle>
                <CardDescription>View and manage participating teams.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Team Name</TableHead>
                      <TableHead>Institute ID</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teams.map((team) => (
                      <TableRow key={team.id}>
                        <TableCell className="font-medium">{team.name}</TableCell>
                        <TableCell>{team.instituteId}</TableCell>
                        <TableCell>{team.progress}%</TableCell>
                        <TableCell>
                          <Badge
                            variant={team.status === 'approved' ? 'default' : team.status === 'rejected' ? 'destructive' : 'secondary'}
                            className="capitalize"
                          >
                            {team.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {teams.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4">No teams registered yet.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Problems Tab */}
          <TabsContent value="problems">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Problem Statements</CardTitle>
                  <CardDescription>Define challenges for the hackathon.</CardDescription>
                </div>
                <Dialog open={isProblemDialogOpen} onOpenChange={setIsProblemDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" /> Add Problem
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Problem Statement</DialogTitle>
                      <DialogDescription>Create a new challenge for students.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          value={newProblem.title}
                          onChange={(e) => setNewProblem({ ...newProblem, title: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Input
                          id="category"
                          value={newProblem.category}
                          onChange={(e) => setNewProblem({ ...newProblem, category: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="desc">Description</Label>
                        <Input
                          id="desc"
                          value={newProblem.description}
                          onChange={(e) => setNewProblem({ ...newProblem, description: e.target.value })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleCreateProblem}>Save Problem</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {problems.map((problem) => (
                    <Card key={problem.id} className="bg-muted/50">
                      <CardHeader>
                        <CardTitle className="text-lg">{problem.title}</CardTitle>
                        <CardDescription>{problem.category} • {problem.difficulty}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{problem.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline">
            <TimelineManager />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

// Timeline Manager Component
const TimelineManager = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
  const [formData, setFormData] = useState<Partial<TimelineEvent>>({
    title: '',
    date: '',
    time: '',
    description: '',
    status: 'upcoming',
    order: 0,
  });

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['timeline'],
    queryFn: timelineService.getEvents,
  });

  const createMutation = useMutation({
    mutationFn: timelineService.createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
      setIsDialogOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TimelineEvent> }) =>
      timelineService.updateEvent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
      setIsDialogOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: timelineService.deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
    },
  });

  const resetForm = () => {
    setEditingEvent(null);
    setFormData({
      title: '',
      date: '',
      time: '',
      description: '',
      status: 'upcoming',
      order: 0,
    });
  };

  const handleSubmit = () => {
    if (editingEvent) {
      updateMutation.mutate({ id: editingEvent._id, data: formData });
    } else {
      createMutation.mutate(formData as Omit<TimelineEvent, '_id'>);
    }
  };

  const handleEdit = (event: TimelineEvent) => {
    setEditingEvent(event);
    setFormData(event);
    setIsDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Timeline Events</CardTitle>
          <CardDescription>Manage the hackathon timeline.</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Event
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingEvent ? 'Edit Event' : 'Add New Event'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    placeholder="e.g. Aug 1, 2025"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    placeholder="e.g. 10:00 AM"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Order</Label>
                  <Input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSubmit}>
                {editingEvent ? 'Update Event' : 'Create Event'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event._id}>
                <TableCell>{event.order}</TableCell>
                <TableCell>{event.date}</TableCell>
                <TableCell className="font-medium">{event.title}</TableCell>
                <TableCell>
                  <Badge variant={
                    event.status === 'completed' ? 'secondary' :
                      event.status === 'active' ? 'default' : 'outline'
                  } className="capitalize">
                    {event.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(event)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => deleteMutation.mutate(event._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {events.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">No events found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AdminDashboard;