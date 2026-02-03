import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, AlertCircle, RefreshCw } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

import { useProblems } from '@/hooks/useMockData';

interface Problem {
  id: string;
  _id?: string; // Added for backend compatibility
  title: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  tags: string[];
  type: 'Software' | 'Hardware';
  organization: string;
  department: string;
  theme: string;
  youtubeLink?: string;
  datasetLink?: string;
  contactInfo: string;
  teamCount?: number;
}

const ProblemStatements = () => {
  const { data: fetchedProblems = [], isError, error } = useProblems();
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [customProblemDialogOpen, setCustomProblemDialogOpen] = useState(false);
  const [customProblemForm, setCustomProblemForm] = useState({
    title: '',
    description: '',
    category: '',
    type: 'Software' as 'Software' | 'Hardware',
    theme: '',
    tags: '',
    organization: '',
    department: '',
    contactInfo: '',
    youtubeLink: '',
    datasetLink: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);


  const problems: Problem[] = fetchedProblems.map((p: any, index: number) => ({
    id: `ID-${String(index + 1).padStart(2, '0')}`,
    _id: p._id || p.id,
    title: p.title,
    category: p.category,
    difficulty: p.difficulty,
    description: p.description,
    tags: p.tags || [],
    type: p.type || 'Software',
    organization: p.organization || 'MIT Vishwaprayag University',
    department: p.department || 'Computer Science',
    theme: p.theme || 'General',
    youtubeLink: p.youtubeLink,
    datasetLink: p.datasetLink,
    contactInfo: p.contactInfo || 'hackathon@mitwpu.edu.in',
    teamCount: p.teamCount || 0
  }));



  const handleCustomProblemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!customProblemForm.title || !customProblemForm.description || !customProblemForm.category) {
        toast.error('Please fill in all required fields');
        setIsSubmitting(false);
        return;
      }

      // Prepare the data
      const problemData = {
        ...customProblemForm,
        tags: customProblemForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        difficulty: 'Medium', // Default difficulty for custom problems
      };

      // Submit to backend (you may need to create this endpoint)
      await api.post('/problems/custom', problemData);

      toast.success('Custom problem submitted successfully! Our team will review it.');

      // Reset form
      setCustomProblemForm({
        title: '',
        description: '',
        category: '',
        type: 'Software',
        theme: '',
        tags: '',
        organization: '',
        department: '',
        contactInfo: '',
        youtubeLink: '',
        datasetLink: ''
      });

      setCustomProblemDialogOpen(false);
    } catch (error: any) {
      console.error('Error submitting custom problem:', error);
      toast.error(error.response?.data?.message || 'Failed to submit custom problem. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Hard':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredProblems = problems.filter(problem => {
    const matchesSearch = !searchTerm ||
      problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      problem.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDifficulty = difficultyFilter === 'all' || problem.difficulty.toLowerCase() === difficultyFilter;

    return matchesSearch && matchesDifficulty;
  });

  const softwareProblems = filteredProblems.filter(p => p.type === 'Software');
  const hardwareProblems = filteredProblems.filter(p => p.type === 'Hardware');

  const ProblemTable = ({ problems }: { problems: Problem[] }) => (
    <div className="rounded-xl border-2 border-gray-200 bg-white shadow-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gradient-to-r from-[#8B2A3B] via-[#a53549] to-[#8B2A3B] hover:bg-gradient-to-r">
            <TableHead className="w-[140px] text-white font-bold py-5 px-6">ID</TableHead>
            <TableHead className="text-white font-bold py-5 px-4 text-left">Title</TableHead>
            <TableHead className="text-white font-bold py-5 px-4 text-left">Category</TableHead>
            <TableHead className="hidden md:table-cell max-w-xs text-white font-bold py-5 px-4 text-left">Description</TableHead>
            <TableHead className="text-white font-bold py-5 px-4">Tags</TableHead>
            <TableHead className="text-center text-white font-bold py-5 px-4">Selected By</TableHead>
            <TableHead className="text-right text-white font-bold py-5 px-6">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {problems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-64 text-center bg-gray-50/30">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="p-4 bg-orange-50 rounded-full">
                    <Search className="h-8 w-8 text-orange-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xl font-bold text-gray-800">No problems found</p>
                    <p className="text-sm text-gray-500 max-w-xs mx-auto">We couldn't find any results matching your search criteria. Try a different keyword.</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchTerm('')}
                    className="mt-2 border-orange-200 text-orange-600 hover:bg-orange-50"
                  >
                    Clear Search
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            problems.map((problem, index) => (
              <TableRow
                key={problem.id}
                className={`group border-l-4 border-l-transparent hover:border-l-[#E25A2C] hover:bg-orange-50/50 transition-all duration-300 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
              >
                <TableCell className="py-5 px-6">
                  <Badge variant="outline" className="bg-[#8B2A3B]/10 text-[#8B2A3B] border-[#8B2A3B]/30 font-semibold">
                    {problem.id}
                  </Badge>
                </TableCell>
                <TableCell
                  className="font-semibold cursor-pointer hover:text-[#E25A2C] hover:underline transition-colors py-4 text-gray-800"
                  onClick={() => setSelectedProblem(problem)}
                >
                  {problem.title}
                </TableCell>
                <TableCell className="py-4">
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                    {problem.category}
                  </span>
                </TableCell>
                <TableCell className="hidden md:table-cell max-w-xs truncate py-4 text-gray-600" title={problem.description}>
                  {problem.description}
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex flex-wrap gap-1">
                    {problem.tags.slice(0, 2).map((tag, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="text-xs bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:border-blue-300"
                      >
                        {tag}
                      </Badge>
                    ))}
                    {problem.tags.length > 2 && (
                      <Badge variant="outline" className="text-xs bg-gray-100 text-gray-600 border-gray-300">
                        +{problem.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center py-4">
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-200">
                    {problem.teamCount} Teams
                  </Badge>
                </TableCell>
                <TableCell className="text-right py-4">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-[#8B2A3B] text-[#8B2A3B] hover:bg-[#8B2A3B] hover:text-white transition-colors"
                      onClick={() => setSelectedProblem(problem)}
                    >
                      View
                    </Button>

                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Header Section with 7 Layered Overlays */}
        <div className="relative bg-gradient-to-br from-[#8B2A3B] via-[#a53549] to-[#5e1b28] py-16 text-center rounded-2xl mb-12 overflow-hidden shadow-2xl">
          {/* Layer 1: Glossy Reflective Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/25 via-white/5 to-black/20 rounded-2xl"></div>

          {/* Layer 2: Animated Gradient Mesh */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background: `radial-gradient(circle at 20% 20%, rgba(226, 90, 44, 0.4) 0%, transparent 50%),
                          radial-gradient(circle at 80% 80%, rgba(139, 42, 59, 0.5) 0%, transparent 60%),
                          radial-gradient(circle at 50% 50%, rgba(255, 127, 80, 0.3) 0%, transparent 70%)`,
              animation: 'float 7s ease-in-out infinite'
            }}
          ></div>

          {/* Layer 3: Animated Decorative Pattern */}
          <div
            className="absolute inset-0 opacity-20 animate-pulse"
            style={{
              background: `radial-gradient(circle at 20% 30%, rgba(255, 200, 180, 0.6) 2px, transparent 2px),
                          radial-gradient(circle at 80% 70%, rgba(255, 150, 150, 0.6) 2px, transparent 2px)`,
              backgroundSize: '70px 70px',
              animation: 'float 9s ease-in-out infinite alternate'
            }}
          ></div>

          {/* Layer 4: Shimmer Sweep Effect */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
            style={{
              animation: 'shimmer 4s ease-in-out infinite',
              transform: 'skewX(-20deg)'
            }}
          ></div>

          {/* Layer 5: Secondary Shimmer (Diagonal) */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-red-600/0 via-orange-400/30 to-red-600/0"
            style={{
              animation: 'shimmer 5s ease-in-out infinite reverse'
            }}
          ></div>

          {/* Layer 6: Bottom Glow Effect */}
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#4a101d]/60 to-transparent rounded-2xl"></div>

          {/* Layer 7: Top Edge Highlight */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/60 to-transparent rounded-t-2xl"></div>

          {/* Content Layer */}
          <div className="relative z-10">
            <h1 className="text-5xl font-bold mb-4 text-white drop-shadow-lg">
              Problem{' '}
              <span className="bg-gradient-to-r from-orange-200 via-red-300 to-orange-200 bg-clip-text text-transparent">
                Statements
              </span>
            </h1>
            <p className="text-xl text-orange-50 max-w-3xl mx-auto drop-shadow-md">
              Choose from a diverse range of challenges across multiple domains.
              <br />
              Select the problem that aligns with your team's passion and skills.
            </p>
          </div>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Card 1 - Navy with Diagonal Shimmer */}
          <Card className="bg-navy text-white border-none hover:scale-105 hover:shadow-2xl transition-all duration-300 shadow-lg p-8 flex flex-col items-center justify-center animate-slide-up relative overflow-hidden" style={{ animationDelay: '0.1s' }}>
            {/* Glossy Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/20"></div>
            {/* Diagonal Shimmer Effect */}
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              style={{
                animation: 'shimmer 3s ease-in-out infinite',
                transform: 'skewX(-20deg)'
              }}
            ></div>
            <div className="relative z-10 text-center">
              <div className="text-5xl font-bold mb-2">{problems.length}</div>
              <div className="text-base font-medium opacity-90">Total Problems</div>
            </div>
          </Card>

          {/* Card 2 - Maroon with Diagonal Shimmer */}
          <Card className="bg-primary text-white border-none hover:scale-105 hover:shadow-2xl transition-all duration-300 shadow-lg p-8 flex flex-col items-center justify-center animate-scale-in relative overflow-hidden" style={{ animationDelay: '0.2s' }}>
            {/* Glossy Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/15 via-white/5 to-black/15"></div>
            {/* Diagonal Shimmer Effect */}
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              style={{
                animation: 'shimmer 3s ease-in-out infinite',
                transform: 'skewX(-20deg)'
              }}
            ></div>
            <div className="relative z-10 text-center">
              <div className="text-5xl font-bold mb-2">{problems.filter(p => p.type === 'Software').length}</div>
              <div className="text-base font-medium opacity-90">Software Category</div>
            </div>
          </Card>

          {/* Card 3 - Coral with Diagonal Shimmer */}
          <Card className="text-white border-none hover:scale-105 hover:shadow-2xl transition-all duration-300 shadow-lg p-8 flex flex-col items-center justify-center animate-fade-in relative overflow-hidden" style={{ animationDelay: '0.3s', backgroundColor: '#FF7F50' }}>
            {/* Glossy Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-yellow-200/20"></div>
            {/* Diagonal Shimmer Effect */}
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              style={{
                animation: 'shimmer 3s ease-in-out infinite',
                transform: 'skewX(-20deg)'
              }}
            ></div>
            <div className="relative z-10 text-center">
              <div className="text-5xl font-bold mb-2">{problems.filter(p => p.type === 'Hardware').length}</div>
              <div className="text-base font-medium opacity-90">Hardware Category</div>
            </div>
          </Card>
        </div>

        {/* Custom Animations for Glossy Effects */}
        <style>{`
          @keyframes shimmer {
            0% {
              transform: translateX(-100%) skewX(-20deg);
            }
            100% {
              transform: translateX(200%) skewX(-20deg);
            }
          }
          
          @keyframes float {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-10px);
            }
          }

          @keyframes slideDown {
            0% {
              transform: translateY(-100%);
            }
            100% {
              transform: translateY(100%);
            }
          }
          
          @keyframes wave {
            0% {
              background-position: 0 0;
            }
            100% {
              background-position: 40px 40px;
            }
          }
        `}</style>

        {/* Search & Filter Section */}
        <div className="flex flex-col gap-6 mb-8 bg-gradient-to-r from-white via-orange-50/50 to-white p-6 rounded-2xl border-2 border-orange-100 shadow-lg relative overflow-hidden">
          {/* Decorative gradient accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8B2A3B] via-[#E25A2C] to-[#8B2A3B]"></div>

          <div className="flex flex-col items-center text-center space-y-2">
            <h3 className="text-xl font-bold text-[#8B2A3B]">Filter Challenges</h3>
            <p className="text-sm text-gray-500 max-w-md">Find the perfect problem statement by searching through categories, titles, or specific technologies.</p>
          </div>

          <div className="flex flex-col items-center w-full">
            <div className="relative w-full max-w-2xl group">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 h-10 w-10 flex items-center justify-center rounded-lg transition-colors group-focus-within:bg-orange-100">
                <Search className="h-5 w-5 text-[#8B2A3B] transition-transform group-focus-within:scale-110" />
              </div>
              <Input
                placeholder="Search by title or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-14 py-7 text-lg border-2 border-gray-200 focus:border-[#E25A2C] focus:ring-2 focus:ring-[#E25A2C]/20 rounded-2xl shadow-sm bg-white/90 backdrop-blur-sm w-full transition-all"
              />
              <p className="mt-2 text-xs text-gray-400 text-center italic">Filter results by searching for Specific Titles or Technology Tags</p>
            </div>
          </div>
        </div>

        {/* Error Display Section */}
        {isError && (
          <div className="mb-8 p-6 bg-red-50 border-2 border-red-200 rounded-2xl shadow-lg">
            <div className="flex items-center justify-center gap-4">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-red-800">Database Connection Error</h3>
                <p className="text-red-600 mt-1">
                  {(error as any)?.response?.data?.errorType === 'MONGODB_CONNECTION_ERROR'
                    ? 'Unable to connect to the database. Please ensure MongoDB is running.'
                    : 'Failed to load problem statements. Please try again later.'}
                </p>
              </div>
              <Button
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-100"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* Tabs Section */}
        <Tabs defaultValue="software" className="w-full">
          <TabsList className="grid w-full max-w-lg grid-cols-2 mx-auto mb-8 p-2 bg-gradient-to-r from-[#8B2A3B]/10 via-purple-100 to-[#8B2A3B]/10 rounded-2xl shadow-lg border border-purple-200/50 h-auto">
            <TabsTrigger
              value="software"
              className="py-4 px-6 rounded-xl text-base font-semibold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#8B2A3B] data-[state=active]:to-[#a53549] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:ring-2 data-[state=active]:ring-[#8B2A3B]/30 data-[state=inactive]:text-[#8B2A3B] data-[state=inactive]:hover:bg-white/50"
            >
              Software Problems ({softwareProblems.length})
            </TabsTrigger>
            <TabsTrigger
              value="hardware"
              className="py-4 px-6 rounded-xl text-base font-semibold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#E25A2C] data-[state=active]:to-[#FF7F50] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:ring-2 data-[state=active]:ring-[#E25A2C]/30 data-[state=inactive]:text-[#E25A2C] data-[state=inactive]:hover:bg-white/50"
            >
              Hardware Problems ({hardwareProblems.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="software">
            <ProblemTable problems={softwareProblems} />
          </TabsContent>
          <TabsContent value="hardware">
            <ProblemTable problems={hardwareProblems} />
          </TabsContent>
        </Tabs>

        {/* CTA Section - "Submit Custom Problem" with 7 Layered Overlays */}
        <div
          className="mt-16 text-center relative bg-gradient-to-br from-slate-700 via-gray-800 to-slate-900 rounded-2xl p-12 border-2 border-slate-600/40 overflow-hidden shadow-2xl"
        >
          {/* Layer 1: Glossy Reflective Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-white/5 to-slate-900/20 rounded-2xl"></div>

          {/* Layer 2: Animated Gradient Mesh (Grey Tones) */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background: `radial-gradient(circle at 20% 20%, rgba(148, 163, 184, 0.4) 0%, transparent 50%),
                          radial-gradient(circle at 80% 80%, rgba(100, 116, 139, 0.5) 0%, transparent 60%),
                          radial-gradient(circle at 50% 50%, rgba(71, 85, 105, 0.3) 0%, transparent 70%)`,
              animation: 'float 7s ease-in-out infinite'
            }}
          ></div>

          {/* Layer 3: Animated Decorative Pattern */}
          <div
            className="absolute inset-0 opacity-20 animate-pulse"
            style={{
              background: `radial-gradient(circle at 20% 30%, rgba(203, 213, 225, 0.6) 2px, transparent 2px),
                          radial-gradient(circle at 80% 70%, rgba(148, 163, 184, 0.6) 2px, transparent 2px)`,
              backgroundSize: '70px 70px',
              animation: 'float 9s ease-in-out infinite alternate'
            }}
          ></div>

          {/* Layer 4: Shimmer Sweep Effect */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
            style={{
              animation: 'shimmer 4s ease-in-out infinite',
              transform: 'skewX(-20deg)'
            }}
          ></div>

          {/* Layer 5: Secondary Shimmer (Diagonal) */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-slate-600/0 via-slate-400/30 to-slate-600/0"
            style={{
              animation: 'shimmer 5s ease-in-out infinite reverse'
            }}
          ></div>

          {/* Layer 6: Bottom Glow Effect */}
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-slate-950/40 to-transparent rounded-2xl"></div>

          {/* Layer 7: Top Edge Highlight */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>

          {/* Content Layer */}
          <div className="relative z-10">
            <h3 className="text-3xl font-bold mb-4 text-white drop-shadow-lg">
              Don't see a problem that interests you?
            </h3>
            <p className="text-slate-200 mb-8 text-lg drop-shadow-sm font-medium">
              Propose your own problem statement or work on an open innovation track!
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 hover:from-orange-600 hover:via-orange-700 hover:to-red-700 text-white font-bold shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 transform hover:scale-110 border-0 px-8 py-6 text-lg"
              onClick={() => setCustomProblemDialogOpen(true)}
            >
              Submit Custom Problem
            </Button>
          </div>
        </div>
      </div>

      {/* Custom Problem Submission Dialog */}
      <Dialog open={customProblemDialogOpen} onOpenChange={setCustomProblemDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-orange-500 to-red-600">
            <DialogTitle className="text-2xl font-bold text-white">
              Submit Custom Problem Statement
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-grow p-6 h-[600px]" type="always">
            <form onSubmit={handleCustomProblemSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Problem Title *</label>
                <Input
                  placeholder="Enter a descriptive title for your problem"
                  value={customProblemForm.title}
                  onChange={(e) => setCustomProblemForm({ ...customProblemForm, title: e.target.value })}
                  required
                  className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Description *</label>
                <textarea
                  placeholder="Provide a detailed description of the problem statement"
                  value={customProblemForm.description}
                  onChange={(e) => setCustomProblemForm({ ...customProblemForm, description: e.target.value })}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              {/* Category and Type Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Category *</label>
                  <Input
                    placeholder="e.g., Healthcare, Education, FinTech"
                    value={customProblemForm.category}
                    onChange={(e) => setCustomProblemForm({ ...customProblemForm, category: e.target.value })}
                    required
                    className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Type *</label>
                  <Select
                    value={customProblemForm.type}
                    onValueChange={(value: 'Software' | 'Hardware') => setCustomProblemForm({ ...customProblemForm, type: value })}
                  >
                    <SelectTrigger className="border-gray-300 focus:border-orange-500 focus:ring-orange-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Software">Software</SelectItem>
                      <SelectItem value="Hardware">Hardware</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Theme */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Theme</label>
                <Input
                  placeholder="e.g., AI in Healthcare, Smart Cities"
                  value={customProblemForm.theme}
                  onChange={(e) => setCustomProblemForm({ ...customProblemForm, theme: e.target.value })}
                  className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Tags (comma-separated)</label>
                <Input
                  placeholder="e.g., AI, ML, IoT, Blockchain"
                  value={customProblemForm.tags}
                  onChange={(e) => setCustomProblemForm({ ...customProblemForm, tags: e.target.value })}
                  className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>

              {/* Organization and Department Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Organization</label>
                  <Input
                    placeholder="Your organization name"
                    value={customProblemForm.organization}
                    onChange={(e) => setCustomProblemForm({ ...customProblemForm, organization: e.target.value })}
                    className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Department</label>
                  <Input
                    placeholder="Department name"
                    value={customProblemForm.department}
                    onChange={(e) => setCustomProblemForm({ ...customProblemForm, department: e.target.value })}
                    className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Contact Email</label>
                <Input
                  type="email"
                  placeholder="your.email@example.com"
                  value={customProblemForm.contactInfo}
                  onChange={(e) => setCustomProblemForm({ ...customProblemForm, contactInfo: e.target.value })}
                  className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>

              {/* Optional Links */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">YouTube Link (Optional)</label>
                  <Input
                    type="url"
                    placeholder="https://youtube.com/..."
                    value={customProblemForm.youtubeLink}
                    onChange={(e) => setCustomProblemForm({ ...customProblemForm, youtubeLink: e.target.value })}
                    className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Dataset Link (Optional)</label>
                  <Input
                    type="url"
                    placeholder="https://dataset.example.com/..."
                    value={customProblemForm.datasetLink}
                    onChange={(e) => setCustomProblemForm({ ...customProblemForm, datasetLink: e.target.value })}
                    className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCustomProblemDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Problem'}
                </Button>
              </div>
            </form>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Problem Details Modal */}
      <Dialog open={!!selectedProblem} onOpenChange={() => setSelectedProblem(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="text-xl font-bold text-blue-900 uppercase tracking-wide">
              {selectedProblem?.id} - Problem Details
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-grow p-6 h-[600px]" type="always">
            {selectedProblem && (
              <div className="border rounded-md overflow-hidden text-sm">
                <div className="grid grid-cols-1 md:grid-cols-4">
                  <div className="p-3 font-semibold bg-gray-50 border-r border-b md:col-span-1">
                    Problem Statement ID
                  </div>
                  <div className="p-3 border-b md:col-span-3">{selectedProblem.id}</div>

                  <div className="p-3 font-semibold bg-gray-50 border-r border-b md:col-span-1">
                    Problem Statement Title
                  </div>
                  <div className="p-3 border-b md:col-span-3 font-medium">{selectedProblem.title}</div>

                  <div className="p-3 font-semibold bg-gray-50 border-r border-b md:col-span-1">
                    Description
                  </div>
                  <div className="p-3 border-b md:col-span-3">
                    <p className="leading-relaxed">{selectedProblem.description}</p>
                  </div>

                  <div className="p-3 font-semibold bg-gray-50 border-r border-b md:col-span-1">
                    Organization
                  </div>
                  <div className="p-3 border-b md:col-span-3">{selectedProblem.organization}</div>

                  <div className="p-3 font-semibold bg-gray-50 border-r border-b md:col-span-1">
                    Department
                  </div>
                  <div className="p-3 border-b md:col-span-3">{selectedProblem.department}</div>

                  <div className="p-3 font-semibold bg-gray-50 border-r border-b md:col-span-1">
                    Category
                  </div>
                  <div className="p-3 border-b md:col-span-3">{selectedProblem.category}</div>

                  <div className="p-3 font-semibold bg-gray-50 border-r border-b md:col-span-1">
                    Theme
                  </div>
                  <div className="p-3 border-b md:col-span-3">{selectedProblem.theme}</div>

                  {selectedProblem.youtubeLink && (
                    <>
                      <div className="p-3 font-semibold bg-gray-50 border-r border-b md:col-span-1">
                        YouTube Link
                      </div>
                      <div className="p-3 border-b md:col-span-3">
                        <a href={selectedProblem.youtubeLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {selectedProblem.youtubeLink}
                        </a>
                      </div>
                    </>
                  )}

                  {selectedProblem.datasetLink && (
                    <>
                      <div className="p-3 font-semibold bg-gray-50 border-r border-b md:col-span-1">
                        Dataset Link
                      </div>
                      <div className="p-3 border-b md:col-span-3">
                        <a href={selectedProblem.datasetLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {selectedProblem.datasetLink}
                        </a>
                      </div>
                    </>
                  )}

                  <div className="p-3 font-semibold bg-gray-50 border-r md:col-span-1">
                    Contact Info
                  </div>
                  <div className="p-3 md:col-span-3">{selectedProblem.contactInfo}</div>
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default ProblemStatements;