import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/lib/api';
import { toast } from 'sonner';
import { LogIn, ArrowRight, ArrowLeft, Lock } from 'lucide-react';
import logoGif from '@/assets/mit-vpu-logo.gif';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(true);

  // Fetch registration status
  useEffect(() => {
    const fetchRegistrationStatus = async () => {
      try {
        const response = await axios.get('/api/public/registration-status');
        setRegistrationOpen(response.data.registrationOpen);
      } catch (error) {
        console.error('Error fetching registration status:', error);
        setRegistrationOpen(true); // Default to open if error
      }
    };
    fetchRegistrationStatus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await api.post('/auth/login', { email, password });

      localStorage.setItem('user', JSON.stringify(data));
      // Also set registeredUsers for mock compatibility if needed, but we are moving away from it.
      // For now, let's just rely on the 'user' key which our api interceptor uses.

      toast.success(`Welcome back, ${data.name}!`);

      // Navigate based on role
      switch (data.role) {
        case 'admin':
          navigate('/admin/dashboard');
          break;
        case 'spoc':
          navigate('/spoc/dashboard');
          break;
        case 'student':
          navigate('/student/dashboard');
          break;
        case 'judge':
          navigate('/judge/dashboard');
          break;
        case 'mentor':
          navigate('/mentor/dashboard');
          break;

        default:
          navigate('/');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid credentials');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream via-skyblue to-accent/20 p-4 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-slide-up">
          <img src={logoGif} alt="MIT Vishwaprayag University Logo" className="h-24 mx-auto mb-4" />
          <h1 className="text-3xl font-bold gradient-text mb-2">MIT Vishwaprayag University Hackathon</h1>
          <p className="text-muted-foreground">Sign in to your account</p>
        </div>

        <Card className="shadow-2xl border-0 hover-lift animate-scale-in">
          <CardHeader className="space-y-1">
            {/* Back Button */}
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="self-start mb-2 hover:bg-accent transition-all"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
            <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your dashboard
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="transition-all focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="transition-all focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <Link to="/forgot-password" className="text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-primary/80 hover:shadow-glow transition-all"
                disabled={loading}
              >
                {loading ? (
                  'Signing in...'
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In
                  </>
                )}
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                {registrationOpen ? (
                  <>
                    Don't have an account?{' '}
                    <Link to="/register-team" className="text-secondary hover:underline font-semibold">
                      Register Team <ArrowRight className="inline h-3 w-3" />
                    </Link>
                  </>
                ) : (
                  <span className="flex items-center justify-center gap-1 text-gray-500">
                    <Lock className="h-3 w-3" />
                    Registration is currently closed
                  </span>
                )}
              </div>
            </CardFooter>
          </form>
        </Card>


      </div>
    </div>
  );
};

export default Login;