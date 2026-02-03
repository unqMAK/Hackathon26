import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Menu, X, LogOut, User, ChevronDown } from 'lucide-react';
import { getCurrentUser, logout } from '@/lib/mockAuth';
import { toast } from 'sonner';
import logo from '@/assets/mit-logo-organizer.png';
import smcLogoNavbar from '@/assets/smc-logo.png';
import NotificationsDropdown from './NotificationsDropdown';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Problem Statements', path: '/problem-statements' },
    { name: 'Resources', path: '/guidelines' },
    { name: 'SPOC Info', path: '/spoc-info' },
    { name: 'Project Implementation', path: '/project-implementation' },
    { name: 'FAQs', path: '/faqs' },
    { name: 'Contact', path: '/contact' },
  ];

  // OPTION 5: Thin Border Slide (Left → Right)
  const getNavLinkClass = (path: string) => {
    const isActive = location.pathname === path;
    return `
      relative px-3 py-2 text-sm font-medium whitespace-nowrap
      transition-colors duration-200
      ${isActive ? 'text-primary font-semibold' : 'text-gray-700'}
      hover:text-primary
      after:absolute after:left-0 after:bottom-0 after:h-[1px] after:bg-primary
      after:transition-all after:duration-300 after:ease-out
      ${isActive ? 'after:w-full' : 'after:w-0 hover:after:w-full'}
    `.trim().replace(/\s+/g, ' ');
  };

  // Mobile nav link class - clean and minimal
  const getMobileNavLinkClass = (path: string) => {
    const isActive = location.pathname === path;
    return `
      block px-4 py-3 text-base font-medium rounded-lg
      transition-colors duration-200
      ${isActive
        ? 'text-primary font-semibold bg-primary/5 border-l-4 border-primary'
        : 'text-gray-700 hover:text-primary hover:bg-gray-50'
      }
    `.trim().replace(/\s+/g, ' ');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-3 transition-opacity duration-200 hover:opacity-80"
          >
            <img src={logo} alt="MIT-VPU" className="h-12 w-auto object-contain" />
          </Link>

          {/* Desktop Navigation - Thin Border Slide */}
          <div className="hidden lg:flex items-center space-x-6">
            {navLinks.map((link) => (
              link.name === 'About' ? (
                <DropdownMenu key={link.path}>
                  <DropdownMenuTrigger className="outline-none">
                    <span className={`${getNavLinkClass(link.path)} flex items-center cursor-pointer`}>
                      {link.name} <ChevronDown className="ml-1 h-4 w-4" />
                    </span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => navigate('/about?view=mit')}>
                      About MIT Vishwaprayag University
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/about?view=smc')}>
                      About Solapur Municipal Corporation
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  key={link.path}
                  to={link.path}
                  className={getNavLinkClass(link.path)}
                >
                  {link.name}
                </Link>
              )
            ))}
          </div>

          {/* User Actions */}
          <div className="hidden lg:flex items-center space-x-3">
            {user ? (
              <>
                <NotificationsDropdown />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const dashboardRole = (user.role as string) === 'institute_admin' ? 'admin' : user.role;
                    navigate(`/${dashboardRole}/dashboard`);
                  }}
                  className="border-primary/30 hover:border-primary hover:bg-primary/5 transition-colors duration-200"
                >
                  <User className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors duration-200"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="transition-colors duration-200"
                >
                  <Link to="/login">Login</Link>
                </Button>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70 transition-all duration-200"
                  asChild
                >
                  <Link to="/register-team">Register Team</Link>
                </Button>
              </>
            )}
            {/* SMC Logo - Always visible */}
            <div className="ml-3 pl-3 border-l border-gray-200">
              <img src={smcLogoNavbar} alt="Solapur Municipal Corporation" className="h-16 w-auto object-contain" />
            </div>
          </div>

          {/* Mobile Logo and Menu Button */}
          <div className="flex lg:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white animate-fade-in">
          <div className="px-3 pt-3 pb-4 space-y-1.5">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={getMobileNavLinkClass(link.path)}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4 space-y-2.5 border-t border-gray-200 mt-4">
              {user ? (
                <>
                  <Button
                    variant="outline"
                    className="w-full justify-start transition-colors duration-200"
                    onClick={() => {
                      const dashboardRole = (user.role as string) === 'institute_admin' ? 'admin' : user.role;
                      navigate(`/${dashboardRole}/dashboard`);
                      setMobileMenuOpen(false);
                    }}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors duration-200"
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="w-full transition-colors duration-200"
                    asChild
                  >
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      Login
                    </Link>
                  </Button>
                  <Button
                    className="w-full bg-gradient-to-r from-secondary to-secondary/80 transition-all duration-200"
                    asChild
                  >
                    <Link to="/register-team" onClick={() => setMobileMenuOpen(false)}>
                      Register Team
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;