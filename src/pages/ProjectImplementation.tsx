import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, MessageSquare, Headphones } from 'lucide-react';

const ProjectImplementation = () => {
    const maroonText = 'text-[#800000]';
    const cardBgColor = 'bg-[#FFF5EA]';

    const timelinePhases = [
        {
            date: '01-Jan-26',
            activity: 'Inauguration & Official Launch',
            details: [
                'Formal launch of Smart Governance Hackathon',
                'Press note release',
                'Newspaper announcements',
                'Outreach activities to be initiated across institutions'
            ],
            team: ''
        },
        {
            date: '1 Jan – 14 Jan 2026',
            activity: 'Registration Window',
            details: [
                'Online registration is open for participating teams',
                'Team members will be 5 compulsory'
            ],
            team: ''
        },
        {
            date: '1 Jan – 26 Jan 2026',
            activity: 'Outreach activity',
            details: [],
            team: ''
        },
        {
            date: '26-Jan-26',
            activity: 'Extended Registration Deadline',
            details: [
                'Final date for accepting registrations',
                'Clarity of the problem leading quality'
            ],
            team: 'Approx. 50 teams per problem definition'
        },
        {
            date: '10-Feb-26',
            activity: 'Idea Submission & Screening',
            details: [
                'Idea presentation round',
                'Clarity of the problem leading quality of the solution'
            ],
            team: 'Approx. 5 teams per problem definition'
        },
        {
            date: '10-Mar-26',
            activity: 'Prototype development',
            details: [
                'Detailed presentations',
                'Interviews and Implementation-level assessment'
            ],
            team: 'Approx. 5 teams per problem definition'
        },
        {
            date: '10-Apr-26',
            activity: 'Finalization Stage',
            details: [
                'Final confirmation of shortlisted teams'
            ],
            team: '5 teams per problem definition'
        },
        {
            date: '15-04-2026 - 16-04-2026',
            activity: 'Final Hackathon Event',
            details: [
                'Grand finale and presentation of final solutions'
            ],
            team: '5 teams per problem definition'
        }
    ];

    const supportResources = [
        {
            icon: BookOpen,
            iconColor: 'text-blue-600',
            title: 'Technical Documentation',
            description: 'Comprehensive guides and API documentation',
            buttonText: 'View Documentation',
            buttonColor: 'text-blue-600 hover:text-blue-800'
        },
        {
            icon: Users,
            iconColor: 'text-green-600',
            title: 'Mentorship Program',
            description: 'Connect with industry experts and technical mentors',
            buttonText: 'Join Program',
            buttonColor: 'text-green-600 hover:text-green-800'
        },
        {
            icon: MessageSquare,
            iconColor: 'text-purple-600',
            title: 'Community Forum',
            description: 'Connect with other participants and share experiences',
            buttonText: 'Join Community',
            buttonColor: 'text-purple-600 hover:text-purple-800'
        },
        {
            icon: Headphones,
            iconColor: 'text-yellow-600',
            title: '24/7 Support',
            description: 'Round-the-clock technical support and assistance',
            buttonText: 'Get Support',
            buttonColor: 'text-yellow-600 hover:text-yellow-800'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            {/* Hero Header Section with 7 Layered Overlays */}
            <div className="relative bg-gradient-to-br from-emerald-700 via-green-800 to-teal-900 py-16 text-center border-b overflow-hidden">
                {/* Layer 1: Glossy Reflective Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/25 via-white/5 to-emerald-900/20"></div>

                {/* Layer 2: Animated Gradient Mesh (Green Tones) */}
                <div
                    className="absolute inset-0 opacity-30"
                    style={{
                        background: `radial-gradient(circle at 20% 20%, rgba(16, 185, 129, 0.4) 0%, transparent 50%),
                        radial-gradient(circle at 80% 80%, rgba(6, 78, 59, 0.5) 0%, transparent 60%),
                        radial-gradient(circle at 50% 50%, rgba(20, 184, 166, 0.3) 0%, transparent 70%)`,
                        animation: 'float 7s ease-in-out infinite'
                    }}
                ></div>

                {/* Layer 3: Animated Decorative Pattern */}
                <div
                    className="absolute inset-0 opacity-20 animate-pulse"
                    style={{
                        background: `radial-gradient(circle at 20% 30%, rgba(167, 243, 208, 0.6) 2px, transparent 2px),
                        radial-gradient(circle at 80% 70%, rgba(110, 231, 183, 0.6) 2px, transparent 2px)`,
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
                    className="absolute inset-0 bg-gradient-to-br from-emerald-600/0 via-teal-400/30 to-emerald-600/0"
                    style={{
                        animation: 'shimmer 5s ease-in-out infinite reverse'
                    }}
                ></div>

                {/* Layer 6: Bottom Glow Effect */}
                <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-emerald-950/40 to-transparent"></div>

                {/* Layer 7: Top Edge Highlight */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>

                {/* Content Layer */}
                <div className="relative z-10">
                    <h1 className="text-5xl font-bold mb-4 text-white drop-shadow-lg">
                        Project Implementation
                    </h1>
                    <p className="text-emerald-50 max-w-2xl mx-auto px-4 text-lg drop-shadow-md">
                        Transform your hackathon prototype into a production-ready solution with our 6-month implementation program
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Timeline Section */}
                <div className="mb-12">
                    <div className="text-center mb-12">
                        <h2 className={`text-3xl font-bold ${maroonText} mb-4`}>
                            Hackathon Process
                        </h2>
                        <p className="text-gray-600 text-lg">
                            Official schedule and key milestones for the event
                        </p>
                    </div>

                    <div className="max-w-6xl mx-auto px-4">
                        <div className="grid md:grid-cols-2 gap-8">
                            {timelinePhases.map((phase, index) => (
                                <Card
                                    key={index}
                                    className={`${cardBgColor} border-orange-100 shadow-sm hover:shadow-md transition-all h-full`}
                                >
                                    <CardContent className="p-6">
                                        <div className="flex flex-col gap-2 mb-4">
                                            <div className="inline-block bg-[#800000] text-white px-3 py-1 rounded-full text-sm font-bold w-fit shadow-sm">
                                                {phase.date}
                                            </div>
                                            <h3 className={`text-xl font-bold ${maroonText}`}>
                                                {phase.activity}
                                            </h3>
                                        </div>

                                        {phase.details.length > 0 && (
                                            <div className="bg-white/50 p-3 rounded-lg mb-4">
                                                <p className="font-semibold text-gray-800 text-sm mb-2">Key Details:</p>
                                                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                                    {phase.details.map((detail, idx) => (
                                                        <li key={idx}>{detail}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {phase.team && (
                                            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-orange-100/50 p-2 rounded-lg">
                                                <Users className="w-4 h-4 text-[#800000]" />
                                                <span>{phase.team}</span>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Support Resources Section */}
                <div className="mb-12">
                    <h2 className={`text-3xl font-bold ${maroonText} text-center mb-4`}>
                        Support Resources
                    </h2>
                    <p className="text-center text-gray-600 mb-8">
                        Access resources and support for successful project implementation
                    </p>

                    <div className="grid md:grid-cols-2 gap-6">
                        {supportResources.map((resource, index) => (
                            <Card
                                key={index}
                                className={`${cardBgColor} border-orange-100 shadow-sm hover:shadow-md transition-all`}
                            >
                                <CardContent className="p-8 text-center">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                        <resource.icon className={`h-8 w-8 ${resource.iconColor}`} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        {resource.title}
                                    </h3>
                                    <p className="text-gray-600 mb-6">
                                        {resource.description}
                                    </p>
                                    <Button variant="link" className={`font-semibold ${resource.buttonColor}`}>
                                        {resource.buttonText} →
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* CTA Section */}
                <div className="bg-[#800000] rounded-2xl p-12 text-center text-white shadow-lg">
                    <h2 className="text-3xl font-bold mb-4">
                        Ready to Implement Your Solution?
                    </h2>
                    <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
                        Join MIT Vishwaprayag University Smart City Hackathon 2025 and turn your innovative ideas into real-world solutions
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Button className="bg-yellow-400 text-black hover:bg-yellow-500 font-bold px-8 py-6 text-lg">
                            Register Now
                        </Button>
                        <Button className="bg-white text-[#800000] hover:bg-gray-100 font-bold px-8 py-6 text-lg">
                            View Problems
                        </Button>
                    </div>
                </div>
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
        
        .from-emerald-700 {
          --tw-gradient-from: #047857;
        }
        
        .via-green-800 {
          --tw-gradient-via: #166534;
        }
        
        .to-teal-900 {
          --tw-gradient-to: #134e4a;
        }
        
        .from-emerald-950\/40 {
          --tw-gradient-from: rgba(2, 44, 34, 0.4);
        }
      `}</style>

            <Footer />
        </div>
    );
};

export default ProjectImplementation;
