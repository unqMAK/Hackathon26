import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Phone, FileText, Download, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Guidelines = () => {
  const [activeTab, setActiveTab] = useState('resources');

  const downloadResources = [
    {
      title: 'Team Registration Form',
      description: 'Authorization letter template for team registration',
      gradient: 'from-yellow-500 to-orange-500',
      icon: FileText,
      link: '/assets/MITVPU-Team-Authorization-Letter-2026.docx',
    },
    {
      title: 'Idea Presentation Template',
      description: 'PowerPoint template for idea submission',
      gradient: 'from-teal-500 to-green-500',
      icon: FileText,
      link: '/assets/MITVPU-SAMVED-Idea-Presentation-Template.pptx',
    },
    {
      title: 'Hackathon Rulebook',
      description: 'Complete rules and regulations document',
      gradient: 'from-purple-500 to-purple-600',
      icon: FileText,
      link: '/assets/MITVPU-Hackathon-Rulebook-2026.pdf',
    },
    {
      title: 'Code of Conduct',
      description: 'Ethics and behavior guidelines for participants',
      gradient: 'from-red-500 to-red-600',
      icon: FileText,
      link: '/assets/MITVPU-Hackathon-Code-of-Conduct.pdf',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF5EA] via-white to-[hsl(200,85%,92%)]">
      <Navbar />

      {/* Glossy Header Section with Maroon Gradient */}
      <div className="relative overflow-hidden py-20 animate-fade-in" style={{
        background: 'linear-gradient(135deg, #800000 0%, #a00000 50%, #c04000 100%)',
      }}>
        {/* Animated Glossy Shimmer Effects */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Diagonal Shimmer Wave 1 */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background: 'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.1) 45%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.1) 55%, transparent 100%)',
              animation: 'shimmer 8s ease-in-out infinite',
              transform: 'translateX(-100%)',
            }}
          ></div>

          {/* Diagonal Shimmer Wave 2 */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              background: 'linear-gradient(120deg, transparent 0%, rgba(255,165,0,0.1) 45%, rgba(255,165,0,0.25) 50%, rgba(255,165,0,0.1) 55%, transparent 100%)',
              animation: 'shimmer 10s ease-in-out infinite',
              animationDelay: '2s',
              transform: 'translateX(-100%)',
            }}
          ></div>

          {/* Glossy Light Reflection */}
          <div
            className="absolute top-0 -right-1/4 w-1/2 h-full opacity-20"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.3) 0%, transparent 70%)',
              animation: 'pulse 4s ease-in-out infinite',
            }}
          ></div>

          {/* Moving Gradient Overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)',
              animation: 'slideRight 6s linear infinite',
            }}
          ></div>
        </div>

        {/* CSS Keyframe Animations */}
        <style>{`
          @keyframes shimmer {
            0% {
              transform: translateX(-100%) translateY(-100%);
            }
            50% {
              transform: translateX(100%) translateY(100%);
            }
            100% {
              transform: translateX(-100%) translateY(-100%);
            }
          }
          
          @keyframes pulse {
            0%, 100% {
              opacity: 0.2;
              transform: scale(1);
            }
            50% {
              opacity: 0.3;
              transform: scale(1.05);
            }
          }
          
          @keyframes slideRight {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(100%);
            }
          }
        `}</style>

        {/* Decorative Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzLTIgMi00IDJjLTIgMC00IDItNCA0czItNCAyLTR6bTAgMTBjMC0yIDItNCAyLTRzLTIgMi00IDJjLTIgMC00IDItNCA0czItNCAyLTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-10"></div>

        {/* Glossy Overlay Effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/20"></div>

        {/* Radial Gradient Pattern from Right */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_50%,rgba(255,107,53,0.3),transparent_50%)]"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white animate-slide-up" style={{
            textShadow: '0 4px 12px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)'
          }}>
            Resources & Guidelines
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed animate-fade-in" style={{
            textShadow: '0 2px 8px rgba(0,0,0,0.2)',
            animationDelay: '0.1s'
          }}>
            Download essential resources and guidelines for participating in MIT Vishwaprayag University Smart City Hackathon 2025
          </p>
        </div>
      </div>

      {/* Tab Navigation with Enhanced Styling */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 relative z-20 animate-scale-in" style={{ animationDelay: '0.2s' }}>
        <div className="flex gap-5 mb-10 justify-center flex-wrap">
          <button
            onClick={() => setActiveTab('resources')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${activeTab === 'resources'
              ? 'bg-[#800000] text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}
          >
            Resources
          </button>
          <button
            onClick={() => setActiveTab('guidelines')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${activeTab === 'guidelines'
              ? 'bg-[#800000] text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}
          >
            Guidelines
          </button>
        </div>

        {/* Content for Resources Tab (Primary) */}
        {activeTab === 'resources' && (
          <div className="pb-16 animate-fade-in">
            <h2 className="text-4xl font-bold mb-4 text-center animate-slide-up" style={{
              color: '#800000',
              animationDelay: '0.1s'
            }}>
              Download Resources
            </h2>
            <p className="text-center text-gray-600 mb-12 text-lg max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Get all the essential documents and templates you need for the hackathon
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {downloadResources.map((resource, index) => (
                <Card
                  key={index}
                  className="border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 bg-white hover-lift group animate-fade-in overflow-hidden"
                  style={{ animationDelay: `${0.1 * (index + 1)}s` }}
                >
                  <CardContent className="pt-8 pb-8 px-6">
                    <div className="flex flex-col items-center text-center">
                      <div className={`w-16 h-16 bg-gradient-to-br ${resource.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                        <resource.icon className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        {resource.title}
                      </h3>
                      <p className="text-gray-600 mb-6 leading-relaxed min-h-[48px]">
                        {resource.description}
                      </p>
                      <a href={resource.link} download className="w-full">
                        <Button
                          className={`w-full bg-gradient-to-r ${resource.gradient} hover:shadow-lg text-white font-semibold transition-all duration-300 transform hover:scale-105`}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Content for Guidelines Tab (Secondary) */}
        {activeTab === 'guidelines' && (
          <div className="animate-fade-in">
            <h2 className="text-4xl font-bold mb-10 text-center animate-slide-up" style={{
              color: '#800000',
              animationDelay: '0.1s'
            }}>
              Guidelines for Institutes/Universities
            </h2>

            {/* First Row - SPOC Registration Process & Team Management */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* SPOC Registration Process - 7 Steps from Production */}
              <Card className="border border-orange-100 shadow-sm hover:shadow-lg transition-all duration-300 bg-[#FFF5EA] hover-lift animate-fade-in group" style={{ animationDelay: '0.2s' }}>
                <CardContent className="pt-8 pb-8 px-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-300">
                      <CheckCircle2 className="h-7 w-7 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      SPOC/Mentor Registration Process
                    </h3>
                  </div>
                  <ol className="space-y-4 text-gray-700 leading-relaxed">
                    <li className="flex items-start gap-3">
                      <span className="font-bold text-[#800000] text-lg flex-shrink-0">1.</span>
                      <span>Faculty registration as SPOC/Mentor via MIT Vishwaprayag University Hackathon portal will be created by admin.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="font-bold text-[#800000] text-lg flex-shrink-0">2.</span>
                      <span>Upload authorization letter on institutional letterhead (digitally signed preferred).</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="font-bold text-[#800000] text-lg flex-shrink-0">3.</span>
                      <span>Submit AICTE/UGC/NAAC affiliation details for institutional validation.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="font-bold text-[#800000] text-lg flex-shrink-0">4.</span>
                      <span>Receive portal access upon verification (within 48 hours).</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="font-bold text-[#800000] text-lg flex-shrink-0">5.</span>
                      <span>Complete institutional profile with ABC (Academic Bank of Credits) integration status.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="font-bold text-[#800000] text-lg flex-shrink-0">6.</span>
                      <span>After registration approval, students receive email for successful registration and ID card download from the student dashboard.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="font-bold text-[#800000] text-lg flex-shrink-0">7.</span>
                      <span>Team Leader can download ID card for entire team as well as for individual members.</span>
                    </li>
                  </ol>
                </CardContent>
              </Card>

              {/* Team Composition & Eligibility - Exactly 5 members */}
              <Card className="border border-orange-100 shadow-sm hover:shadow-lg transition-all duration-300 bg-[#FFF5EA] hover-lift animate-fade-in group" style={{ animationDelay: '0.3s' }}>
                <CardContent className="pt-8 pb-8 px-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-300">
                      <CheckCircle2 className="h-7 w-7 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      Team Composition & Eligibility
                    </h3>
                  </div>
                  <ul className="space-y-4 text-gray-700 leading-relaxed">
                    <li className="flex items-start gap-3">
                      <span className="text-[#FF6B35] text-xl flex-shrink-0">•</span>
                      <span><strong>Each team must have exactly 5 members</strong></span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#FF6B35] text-xl flex-shrink-0">•</span>
                      <span>Students from UG (any year), PG, or integrated programs are eligible</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#FF6B35] text-xl flex-shrink-0">•</span>
                      <span>Cross-disciplinary and inter-institutional teams encouraged (NEP 2020 aligned)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#FF6B35] text-xl flex-shrink-0">•</span>
                      <span>Each team must have a designated faculty mentor from their institution</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#FF6B35] text-xl flex-shrink-0">•</span>
                      <span>Registration exclusively through institutional SPOC/Mentor</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Second Row - Documentation Requirements & Important Deadlines */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Documentation & Compliance */}
              <Card className="border border-orange-100 shadow-sm hover:shadow-lg transition-all duration-300 bg-[#FFF5EA] hover-lift animate-fade-in group" style={{ animationDelay: '0.4s' }}>
                <CardContent className="pt-8 pb-8 px-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-300">
                      <FileText className="h-7 w-7 text-purple-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      Documentation & Compliance
                    </h3>
                  </div>
                  <ul className="space-y-4 text-gray-700 leading-relaxed">
                    <li className="flex items-start gap-3">
                      <span className="text-[#FF6B35] text-xl flex-shrink-0">•</span>
                      <span>SPOC/Mentor authorization letter on institutional letterhead (mandatory)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#FF6B35] text-xl flex-shrink-0">•</span>
                      <span>Valid AICTE/UGC/NAAC institutional affiliation proof</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#FF6B35] text-xl flex-shrink-0">•</span>
                      <span>Student enrollment verification (ID card or bonafide certificate)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#FF6B35] text-xl flex-shrink-0">•</span>
                      <span>Faculty mentor endorsement with institutional email</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#FF6B35] text-xl flex-shrink-0">•</span>
                      <span>Team member declaration form with valid ID (for identity verification)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#FF6B35] text-xl flex-shrink-0">•</span>
                      <span>Signed code of conduct and academic integrity pledge</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Important Deadlines - Updated from Production */}
              <Card className="border border-orange-100 shadow-sm hover:shadow-lg transition-all duration-300 bg-[#FFF5EA] hover-lift animate-fade-in group" style={{ animationDelay: '0.5s' }}>
                <CardContent className="pt-8 pb-8 px-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-300">
                      <CheckCircle2 className="h-7 w-7 text-rose-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      Important Deadlines
                    </h3>
                  </div>
                  <ul className="space-y-4 text-gray-700 leading-relaxed">
                    <li className="flex items-start gap-3">
                      <span className="text-[#FF6B35] text-xl flex-shrink-0">•</span>
                      <span>SPOC/Mentor Registration: <strong className="text-[#800000]">6th Jan 2026 to 4th Feb 2026</strong></span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#FF6B35] text-xl flex-shrink-0">•</span>
                      <span>Idea Submission: <strong className="text-[#800000]">15 Jan 2026 to 05th Feb 2026</strong></span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#FF6B35] text-xl flex-shrink-0">•</span>
                      <span>Final Hackathon: <strong className="text-[#800000]">15-16 April, 2026</strong></span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Contact for Queries - Enhanced Design */}
            <Card className="border border-orange-100 shadow-lg bg-gradient-to-br from-[#FFF5EA] to-white mb-16 animate-fade-in overflow-hidden" style={{ animationDelay: '0.6s' }}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#FF6B35]/10 to-transparent rounded-full blur-3xl"></div>
              <CardContent className="pt-10 pb-10 px-8 relative z-10">
                <h3 className="text-3xl font-bold text-center mb-8 text-gray-900">
                  Contact for Queries
                </h3>
                <div className="grid md:grid-cols-2 gap-10">
                  {/* Technical Support */}
                  <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover-lift">
                    <h4 className="font-bold text-xl text-[#800000] mb-4 flex items-center gap-2">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Mail className="h-5 w-5 text-blue-600" />
                      </div>
                      Technical Support
                    </h4>
                    <div className="space-y-3 text-gray-700">
                      <div className="flex items-center gap-3 hover:text-[#800000] transition-colors">
                        <Mail className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        <span className="font-medium">support@mitvpu.ac.in</span>
                      </div>
                      <div className="flex items-center gap-3 hover:text-[#800000] transition-colors">
                        <Phone className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        <span className="font-medium">+91-123-456-7890</span>
                      </div>
                    </div>
                  </div>

                  {/* Registration Queries */}
                  <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover-lift">
                    <h4 className="font-bold text-xl text-[#800000] mb-4 flex items-center gap-2">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Phone className="h-5 w-5 text-green-600" />
                      </div>
                      Registration Queries
                    </h4>
                    <div className="space-y-3 text-gray-700">
                      <div className="flex items-center gap-3 hover:text-[#800000] transition-colors">
                        <Mail className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        <span className="font-medium">registration@mitvpu.edu.in</span>
                      </div>
                      <div className="flex items-center gap-3 hover:text-[#800000] transition-colors">
                        <Phone className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        <span className="font-medium">+91-123-456-7891</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Guidelines;