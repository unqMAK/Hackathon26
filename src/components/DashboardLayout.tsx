import { ReactNode, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Home,
  LogOut,
  Menu,
  X,
  Settings,
  User,
  LayoutDashboard,
  FileText,
  Users,
  Award,
  ClipboardCheck,
  ClipboardList,
  MessageSquare,
  Bell,
  Timer,
  Megaphone,
  Calendar,
  Key
} from 'lucide-react';
import { getCurrentUser, logout } from '@/lib/mockAuth';
import { toast } from 'sonner';
import logoImg from '@/assets/mit-vpu-logo-dashboard.png';
import NotificationBell from '@/components/notifications/NotificationBell';

interface DashboardLayoutProps {
  children: ReactNode;
  role: string;
}

const DashboardLayout = ({ children, role }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const user = getCurrentUser();
  const navigate = useNavigate();
  const location = useLocation();

  const queryClient = useQueryClient();

  const handleLogout = () => {
    logout();
    queryClient.clear();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  // Role-based navigation items
  const getNavItems = () => {
    switch (role) {
      case 'admin':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
          { icon: FileText, label: 'Problem Statements', path: '/admin/problems' },
          { icon: ClipboardList, label: 'Applications', path: '/admin/applications' },
          { icon: Users, label: 'Institutes', path: '/admin/institutes' },
          { icon: Users, label: 'SPOCs', path: '/admin/spocs' },
          { icon: Users, label: 'Teams', path: '/admin/teams' },
          { icon: Users, label: 'Users', path: '/admin/users' },
          { icon: Key, label: 'Password Reset', path: '/admin/password-reset' },
          { icon: Award, label: 'Judges', path: '/admin/judges' },
          { icon: MessageSquare, label: 'Mentors', path: '/admin/mentors' },
          { icon: ClipboardCheck, label: 'Submissions', path: '/admin/submissions' },
          { icon: Timer, label: 'Countdown', path: '/admin/countdown' },
          { icon: FileText, label: 'Rubrics', path: '/admin/rubrics' },
          { icon: Award, label: 'Assign Judges', path: '/admin/assign-judges' },
          { icon: Award, label: 'Results', path: '/admin/results' },
          { icon: Award, label: 'Publish Results', path: '/admin/results-settings' },
          { icon: Calendar, label: 'Timeline', path: '/admin/timeline' },
          { icon: Megaphone, label: 'Announcements', path: '/admin/announcements' },
          { icon: MessageSquare, label: 'FAQs', path: '/admin/faqs' },
          { icon: Settings, label: 'Settings', path: '/admin/settings' },
          { icon: Award, label: 'Certificates', path: '/admin/certificates/builder' },
          { icon: FileText, label: 'Generate Certs', path: '/admin/certificates/generate' },
        ];
      case 'spoc':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', path: '/spoc/dashboard' },
          { icon: Users, label: 'Teams', path: '/spoc/teams/approved' },
          { icon: ClipboardCheck, label: 'Approvals', path: '/spoc/teams/pending' },
          { icon: FileText, label: 'Submissions', path: '/spoc/submissions' },
          { icon: Users, label: 'Mentors', path: '/spoc/mentors' },
          { icon: Award, label: 'Judges', path: '/spoc/judges' },
          { icon: Megaphone, label: 'Announcements', path: '/spoc/announcements' },
          { icon: Award, label: 'My Certificates', path: '/spoc/certificates' },
          { icon: Settings, label: 'Settings', path: '/spoc/settings' },
        ];
      case 'student':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', path: '/student/dashboard' },
          { icon: Users, label: 'My Team', path: '/student/team' },
          { icon: FileText, label: 'Problems', path: '/student/problems' },
          { icon: ClipboardCheck, label: 'Submission', path: '/student/submission' },
          { icon: Megaphone, label: 'Announcements', path: '/student/announcements' },
          { icon: Award, label: 'My Certificates', path: '/student/certificates' },
          { icon: Settings, label: 'Profile', path: '/student/profile' },
        ];
      case 'judge':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', path: '/judge/dashboard' },
          { icon: ClipboardCheck, label: 'Submissions', path: '/judge/submissions' },
          { icon: Award, label: 'Rankings', path: '/judge/rankings' },
          { icon: Award, label: 'My Certificates', path: '/judge/certificates' },
          { icon: Settings, label: 'Profile', path: '/judge/profile' },
        ];
      case 'mentor':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', path: '/mentor/dashboard' },
          { icon: Users, label: 'My Teams', path: '/mentor/teams' },
          { icon: MessageSquare, label: 'Feedback', path: '/mentor/feedback' },
          { icon: Award, label: 'My Certificates', path: '/mentor/certificates' },
          { icon: Settings, label: 'Profile', path: '/mentor/profile' },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-navy text-white transition-all duration-300 z-40 ${sidebarOpen ? 'w-64' : 'w-20'
          }`}
      >
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          {sidebarOpen ? (
            <>
              <a href="/" className="flex items-center space-x-2">
                <img src={logoImg} alt="MIT-VPU" className="h-10 w-auto" />
              </a>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
                className="text-white hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="text-white hover:bg-white/10 mx-auto"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Scrollable Nav Container */}
        <div className="flex flex-col h-[calc(100%-73px)]">
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors ${isActive
                    ? 'bg-white/20 text-white'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                    } ${!sidebarOpen && 'justify-center'}`}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'
          }`}
      >
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-white border-b border-border shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground capitalize">
                {role} Dashboard
              </h1>
              <p className="text-sm text-muted-foreground">Welcome back, {user?.name}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-5 w-5" />
                <span className="hidden md:inline ml-2">Logout</span>
              </Button>
              <NotificationBell />
              <Link to={`/${role}/profile`}>
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span className="hidden md:inline">{user?.name}</span>
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export { DashboardLayout };
export default DashboardLayout;