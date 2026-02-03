import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/lib/api';
import { toast } from 'sonner';
import { UserPlus, ArrowLeft } from 'lucide-react';
import logoGif from '@/assets/mit-vpu-logo.gif';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    instituteCode: '',
    instituteName: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [validatingCode, setValidatingCode] = useState(false);
  const [isCodeValid, setIsCodeValid] = useState(false);

  const validateInstituteCode = async (code: string) => {
    if (!code || code.length < 3) return;

    setValidatingCode(true);
    try {
      await api.get(`/institutes/validate/${code}`);
      setIsCodeValid(true);
      toast.success('Institute code verified!');
    } catch (error) {
      setIsCodeValid(false);
      toast.error('Invalid Institute Code. Please contact your SPOC.');
    } finally {
      setValidatingCode(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    if (!isCodeValid) {
      toast.error('Please enter a valid Institute Code');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        instituteCode: formData.instituteCode,
        instituteId: formData.instituteName // Manually entered name
      });

      localStorage.setItem('user', JSON.stringify(data));
      toast.success('Account created successfully!');

      // All signups are students, navigate to student dashboard
      navigate('/student/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream via-skyblue to-accent/20 p-4 animate-fade-in">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8 animate-slide-up">
          <img src={logoGif} alt="MIT Vishwaprayag University Logo" className="h-24 mx-auto mb-4" />
          <h1 className="text-3xl font-bold gradient-text mb-2">Join MIT Vishwaprayag University Hackathon</h1>
          <p className="text-muted-foreground">Create your account to participate</p>
        </div>

        <Card className="shadow-2xl border-0 hover-lift animate-scale-in">
          <CardHeader>
            {/* Back Button */}
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="self-start mb-2 hover:bg-accent transition-all"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
            <CardTitle className="text-2xl font-bold text-center">Sign Up</CardTitle>
            <CardDescription className="text-center">
              Fill in your details to create an account
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Min. 8 characters"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              {/* Institute Code field */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="instituteCode">Institute Code *</Label>
                  <Input
                    id="instituteCode"
                    placeholder="e.g., MITVPU"
                    value={formData.instituteCode}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase().replace(/\s/g, '');
                      if (val.length <= 10) {
                        setFormData({ ...formData, instituteCode: val });
                        setIsCodeValid(false); // Reset valid state on change
                      }
                    }}
                    onBlur={() => validateInstituteCode(formData.instituteCode)}
                    disabled={validatingCode}
                    className={isCodeValid ? 'border-green-500' : ''}
                    required
                  />
                  <p className="text-xs text-muted-foreground">Enter the code provided by your SPOC.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instituteName">Institute Name *</Label>
                  <Input
                    id="instituteName"
                    placeholder="MIT Vishwaprayag University"
                    value={formData.instituteName}
                    onChange={(e) => setFormData({ ...formData, instituteName: e.target.value })}
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-secondary to-secondary/80 hover:shadow-glow transition-all"
                disabled={loading || !isCodeValid || validatingCode}
              >
                {loading ? (
                  'Creating Account...'
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create Account
                  </>
                )}
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:underline font-semibold">
                  <ArrowLeft className="inline h-3 w-3" /> Sign in
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Signup;