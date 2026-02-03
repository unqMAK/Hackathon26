import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

import { usePublicSpocs } from '@/hooks/useMockData';

interface SPOCData {
  sno: number;
  instituteName: string;
  instituteCode: string;
  spocName: string;
  district: string;
  state: string;
}

const SpocInfo = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState('10');
  const { data: spocs = [], isLoading } = usePublicSpocs();

  const spocData: SPOCData[] = spocs.map((spoc: any, index: number) => ({
    sno: index + 1,
    instituteName: spoc.instituteName || spoc.instituteId || 'N/A',
    instituteCode: spoc.instituteCode || 'N/A',
    spocName: spoc.name,
    district: spoc.district || 'N/A',
    state: spoc.state || 'N/A'
  }));

  const filteredData = spocData.filter(item => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      item.instituteName.toLowerCase().includes(search) ||
      item.spocName.toLowerCase().includes(search) ||
      item.state.toLowerCase().includes(search) ||
      item.district.toLowerCase().includes(search) ||
      item.instituteCode.toLowerCase().includes(search)
    );
  });

  const displayedData = filteredData.slice(0, parseInt(entriesPerPage));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Header Section with 7 Layered Overlays */}
        <div className="relative bg-gradient-to-br from-rose-700 via-pink-800 to-rose-900 py-16 text-center rounded-2xl mb-12 overflow-hidden shadow-2xl">
          {/* Layer 1: Glossy Reflective Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/25 via-white/5 to-rose-900/20 rounded-2xl"></div>

          {/* Layer 2: Animated Gradient Mesh (Cherry Pink Tones) */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background: `radial-gradient(circle at 20% 20%, rgba(244, 114, 182, 0.4) 0%, transparent 50%),
                          radial-gradient(circle at 80% 80%, rgba(190, 24, 93, 0.5) 0%, transparent 60%),
                          radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.3) 0%, transparent 70%)`,
              animation: 'float 7s ease-in-out infinite'
            }}
          ></div>

          {/* Layer 3: Animated Decorative Pattern */}
          <div
            className="absolute inset-0 opacity-20 animate-pulse"
            style={{
              background: `radial-gradient(circle at 20% 30%, rgba(251, 207, 232, 0.6) 2px, transparent 2px),
                          radial-gradient(circle at 80% 70%, rgba(249, 168, 212, 0.6) 2px, transparent 2px)`,
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
            className="absolute inset-0 bg-gradient-to-br from-rose-600/0 via-pink-400/30 to-rose-600/0"
            style={{
              animation: 'shimmer 5s ease-in-out infinite reverse'
            }}
          ></div>

          {/* Layer 6: Bottom Glow Effect */}
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-rose-950/40 to-transparent rounded-2xl"></div>

          {/* Layer 7: Top Edge Highlight */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/60 to-transparent rounded-t-2xl"></div>

          {/* Content Layer */}
          <div className="relative z-10">
            <h1 className="text-5xl font-bold mb-4 text-white drop-shadow-lg">
              Know Your{' '}
              <span className="bg-gradient-to-r from-pink-200 via-rose-300 to-pink-200 bg-clip-text text-transparent">
                SPOC
              </span>
            </h1>
            <p className="text-xl text-rose-50 max-w-3xl mx-auto drop-shadow-md">
              Find contact information for SPOCs (Single Point of Contact) from participating institutes across India
            </p>
          </div>
        </div>

        {/* Data Table Section */}
        <Card className="bg-white rounded-2xl border-2 border-rose-100 shadow-xl p-6 relative overflow-hidden">
          {/* Top Gradient Accent */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500"></div>

          {/* Controls Row */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 mt-2">
            {/* Entries Selector */}
            <div className="flex items-center gap-3 bg-gradient-to-r from-rose-50 to-pink-50 px-4 py-2 rounded-xl border border-rose-200">
              <span className="text-sm text-rose-700 font-medium">Show</span>
              <Select value={entriesPerPage} onValueChange={setEntriesPerPage}>
                <SelectTrigger className="w-[75px] border-rose-300 focus:border-rose-500 bg-white rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-lg border-rose-200">
                  <SelectItem value="10" className="focus:bg-rose-50">10</SelectItem>
                  <SelectItem value="25" className="focus:bg-rose-50">25</SelectItem>
                  <SelectItem value="50" className="focus:bg-rose-50">50</SelectItem>
                  <SelectItem value="100" className="focus:bg-rose-50">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-rose-700 font-medium">entries</span>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-rose-500" />
              <Input
                placeholder="Search by name, institute, state..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 py-5 border-2 border-rose-200 focus:border-rose-500 focus:ring-rose-500/20 rounded-xl bg-gradient-to-r from-white to-rose-50/50"
              />
            </div>
          </div>

          {/* Data Table */}
          <div className="rounded-xl border-2 border-rose-200 overflow-hidden shadow-lg">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 hover:bg-gradient-to-r">
                  <TableHead className="w-[80px] text-white font-bold py-4 text-center">S.No.</TableHead>
                  <TableHead className="text-white font-bold py-4">Institute Name</TableHead>
                  <TableHead className="text-white font-bold py-4 text-center">Institute Code</TableHead>
                  <TableHead className="text-white font-bold py-4">SPOC Name</TableHead>
                  <TableHead className="text-white font-bold py-4 text-center">District</TableHead>
                  <TableHead className="text-white font-bold py-4 text-center">State</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-700"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : displayedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground bg-rose-50">
                      No results found.
                    </TableCell>
                  </TableRow>
                ) : (
                  displayedData.map((item, index) => (
                    <TableRow
                      key={item.sno}
                      className={`hover:bg-rose-100 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-rose-50/50'}`}
                    >
                      <TableCell className="font-bold text-rose-700 text-center py-4">{item.sno}</TableCell>
                      <TableCell className="font-semibold text-gray-800 py-4">{item.instituteName}</TableCell>
                      <TableCell className="text-center py-4">
                        <span className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-sm font-medium">
                          {item.instituteCode}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium text-rose-800 py-4">{item.spocName}</TableCell>
                      <TableCell className="text-center text-gray-600 py-4">{item.district}</TableCell>
                      <TableCell className="text-center py-4">
                        <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-sm font-medium">
                          {item.state}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Footer */}
          <div className="flex items-center justify-between mt-6 text-sm">
            <div className="text-rose-700 font-medium bg-rose-50 px-4 py-2 rounded-lg">
              Showing 1 to {Math.min(filteredData.length, parseInt(entriesPerPage))} of {filteredData.length} entries
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled
                className="border-rose-300 text-rose-600 hover:bg-rose-50 rounded-lg px-4"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled
                className="border-rose-300 text-rose-600 hover:bg-rose-50 rounded-lg px-4"
              >
                Next
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Custom Keyframe Animations */}
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
        
        .from-rose-700 {
          --tw-gradient-from: #be123c;
        }
        
        .via-pink-800 {
          --tw-gradient-via: #9f1239;
        }
        
        .to-rose-900 {
          --tw-gradient-to: #881337;
        }
        
        .from-rose-950\/40 {
          --tw-gradient-from: rgba(76, 5, 25, 0.4);
        }
      `}</style>

      <Footer />
    </div>
  );
};

export default SpocInfo;