import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Award, Users, Code, Trophy, Target, Lightbulb, GitBranch, Rocket, Lock } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroCountdown from '@/components/HeroCountdown';
import AnnouncementTicker from '@/components/AnnouncementTicker';
import buildingImage from '@/assets/mit-vpu-building-1.png';
import building2Image from '@/assets/mit-vpu-building-3.png';
import smcBuildingImage from '@/assets/smc-building.jpg';
import smcLogo from '@/assets/smc-logo.png';
import mitLogo from '@/assets/mit-vpu-logo-organizer.png';
import processFlowImage from '@/assets/process-flow-v2.jpg';
import TimelineSection from '@/components/TimelineSection';
import PrizePool from '@/components/PrizePool';
import axios from 'axios';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


const Home = () => {
  // Image slider state
  const heroImages = [buildingImage, smcBuildingImage];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [registrationOpen, setRegistrationOpen] = useState(true);

  // Auto-transition effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000); // Change image every 5 seconds
    return () => clearInterval(interval);
  }, [heroImages.length]);

  // Fetch registration status
  useEffect(() => {
    const fetchRegistrationStatus = async () => {
      try {
        const response = await axios.get('/api/public/registration-status');
        setRegistrationOpen(response.data.registrationOpen);
      } catch (error) {
        console.error('Error fetching registration status:', error);
        // Default to open if error
        setRegistrationOpen(true);
      }
    };
    fetchRegistrationStatus();
  }, []);

  const features = [
    {
      icon: Target,
      title: 'Innovation Challenge',
      description: 'Solve real-world problems with cutting-edge technology solutions',
      color: 'text-primary'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Work with talented peers from diverse backgrounds',
      color: 'text-secondary'
    },
    {
      icon: Award,
      title: 'Win Prizes',
      description: 'Exciting prizes and recognition for outstanding projects',
      color: 'text-primary'
    },
    {
      icon: Lightbulb,
      title: 'Mentorship',
      description: 'Learn from industry experts and experienced mentors',
      color: 'text-secondary'
    },
  ];

  const stats = [
    { value: '500+', label: 'Participants' },
    { value: '100+', label: 'Teams' },
    { value: '₹5L+', label: 'Prize Pool' },
    { value: '20+', label: 'Problem Statements' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <AnnouncementTicker />

      {/* Hero Section with Image Slider */}
      <section className="relative overflow-hidden py-4 pb-12 animate-fade-in min-h-[calc(100vh-80px)]">
        {/* Background Image Slider */}
        {heroImages.map((img, index) => (
          <div
            key={index}
            className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
            style={{
              backgroundImage: `url(${img})`,
              backgroundSize: '100% 100%',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              opacity: currentImageIndex === index ? 1 : 0,
            }}
          ></div>
        ))}

        {/* Brown/Maroon Overlay to match theme */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-[#8B2A3B]/60 to-black/70"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5QzkyQUMiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzLTIgMi00IDJjLTIgMC00IDItNCA0czItNCAyLTR6bTAgMTBjMC0yIDItNCAyLTRzLTIgMi00IDJjLTIgMC00IDItNCA0czItNCAyLTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-10"></div>

        {/* Slider Indicators */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${currentImageIndex === index
                ? 'bg-white scale-125'
                : 'bg-white/50 hover:bg-white/75'
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>


        {/* Hero Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mt-4">
          <div className="max-w-4xl mx-auto text-center space-y-4 animate-slide-up">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight font-halyard">
              <span className="bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent text-xl md:text-2xl font-medium">A Joint Initiative by MIT Vishwaprayag University & Solapur Municipal Corporation</span>
              <br />
              <span className="bg-gradient-to-r from-[#ff9a44] via-[#ff7a00] to-pink-600 bg-clip-text text-transparent">Grand Hackathon</span>
              <br />
              <span className="text-2xl md:text-4xl text-white/90">2025–26</span>
            </h1>
            <div className="flex flex-col items-center gap-1">
              <span className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-[#ff9a44] via-[#ff7a00] to-pink-600 bg-clip-text text-transparent">SAMVED</span>
              <span className="text-lg md:text-xl text-white/90 font-medium">A Smart Governance Hackathon</span>
            </div>
            <p className="text-base md:text-lg text-white/90 leading-relaxed max-w-3xl mx-auto font-allumi">
              Join us for an incredible journey of innovation, collaboration, and problem-solving.
              <br />
              Transform ideas into reality with cutting-edge technology.
            </p>

            {/* Countdown Timer - Inside Hero */}
            <div className="py-6">
              <HeroCountdown />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      {registrationOpen ? (
                        <Button size="lg" className="bg-gradient-to-r from-secondary to-secondary/80 hover:shadow-glow text-base text-white" asChild>
                          <Link to="/register-team">
                            Register Your Team <ArrowRight className="ml-2 h-5 w-5" />
                          </Link>
                        </Button>
                      ) : (
                        <Button size="lg" className="bg-gray-400 text-gray-200 cursor-not-allowed opacity-70" disabled>
                          <Lock className="mr-2 h-4 w-4" /> Registration Closed
                        </Button>
                      )}
                    </span>
                  </TooltipTrigger>
                  {!registrationOpen && (
                    <TooltipContent>
                      <p>Registration is currently closed. Please check back later.</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
              <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 text-base shadow-lg hover:shadow-xl transition-all" asChild>
                <Link to="/problem-statements">
                  View Challenges <Code className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>



      {/* Enhanced Stats Section with Concentric Pattern */}
      <section className="pt-16 pb-32 relative overflow-hidden" style={{
        backgroundColor: '#8B2A3B',
        backgroundImage: `radial-gradient(circle at 120% 50%, 
          transparent 0%, 
          transparent 35%, 
          rgba(139, 42, 59, 0.6) 35%, 
          rgba(139, 42, 59, 0.6) 36%, 
          transparent 36%, 
          transparent 45%, 
          rgba(139, 42, 59, 0.6) 45%, 
          rgba(139, 42, 59, 0.6) 46%, 
          transparent 46%
        )`
      }}>
        {/* Animated Gradient Mesh */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: `radial-gradient(circle at 30% 30%, rgba(226, 90, 44, 0.3) 0%, transparent 50%),
                         radial-gradient(circle at 70% 70%, rgba(139, 42, 59, 0.4) 0%, transparent 60%)`,
            animation: 'float 8s ease-in-out infinite'
          }}
        ></div>

        {/* Shimmer Sweep Effect */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          style={{
            animation: 'shimmer 5s ease-in-out infinite',
            transform: 'skewX(-20deg)'
          }}
        ></div>

        {/* Bottom Subtle Glow */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent" ></div>


        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="animate-fade-in transform hover:scale-105 transition-all duration-300 cursor-pointer"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div
                  className="text-4xl md:text-5xl font-bold mb-2"
                  style={{
                    color: '#E25A2C',
                    filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))'
                  }}
                >
                  {stat.value}
                </div>
                <div
                  className="text-sm md:text-base font-medium"
                  style={{
                    color: 'rgba(255,255,255,0.9)',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Organizers Card - Premium Glossy Design */}
      <section className="relative z-20 -mt-24 mb-16 max-w-5xl mx-auto px-4">
        <div className="relative overflow-hidden bg-gradient-to-br from-white via-gray-50 to-white rounded-3xl shadow-2xl border border-gray-200/50">
          {/* Glossy Top Edge Accent */}
          <div
            className="absolute top-0 left-0 right-0 h-1.5 rounded-t-3xl"
            style={{
              background: 'linear-gradient(90deg, #8B2A3B 0%, #a53549 30%, #E25A2C 70%, #ff7a44 100%)'
            }}
          ></div>

          {/* Glossy Overlay Layer */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-transparent to-white/30 pointer-events-none rounded-3xl"></div>

          {/* Content */}
          <div className="relative z-10 p-8 md:p-10">
            {/* Title with Gradient */}
            <h2
              className="text-2xl md:text-3xl font-bold text-center mb-10 uppercase tracking-widest"
              style={{
                background: 'linear-gradient(135deg, #003366 0%, #1a4d80 50%, #003366 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              ORGANISERS
            </h2>

            {/* Logos Grid - MIT and SMC only */}
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24">
              <div className="w-40 md:w-48 transition-all duration-500 hover:scale-110 cursor-pointer group">
                <div className="p-4 bg-white rounded-xl shadow-md group-hover:shadow-xl transition-all duration-300">
                  <img
                    src={mitLogo}
                    alt="MIT Vishwaprayag University"
                    className="w-full h-auto object-contain"
                  />
                </div>
              </div>
              <div className="w-28 md:w-32 transition-all duration-500 hover:scale-110 cursor-pointer group">
                <div className="p-4 bg-white rounded-xl shadow-md group-hover:shadow-xl transition-all duration-300">
                  <img
                    src={smcLogo}
                    alt="Solapur Municipal Corporation"
                    className="w-full h-auto object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Prize Pool Section */}
      <PrizePool />

      {/* Timeline Section */}
      <TimelineSection />



      {/* About Section with Image */}
      <section className="py-20 wave-bg" >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-scale-in overflow-hidden rounded-2xl">
              <img
                src={building2Image}
                alt="MIT Vishwaprayag University Innovation"
                className="w-full h-auto max-h-[600px] object-cover shadow-2xl m-4 mb-12 transition-all duration-500 hover:scale-105 hover:brightness-110"
              />
            </div>
            <div className="space-y-6 animate-slide-up">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                About the Hackathon
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                The MIT Vishwaprayag University Grand Hackathon is a premier innovation platform that brings together
                brilliant minds from across the nation. Our mission is to foster creativity,
                technical excellence, and collaborative problem-solving.
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Trophy className="h-6 w-6 text-secondary mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Competitive Environment</h4>
                    <p className="text-sm text-muted-foreground">
                      Compete with the best and showcase your innovative solutions
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <GitBranch className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Open Source Focus</h4>
                    <p className="text-sm text-muted-foreground">
                      Build solutions that can benefit the wider community
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Rocket className="h-6 w-6 text-secondary mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Career Opportunities</h4>
                    <p className="text-sm text-muted-foreground">
                      Get noticed by top recruiters and industry leaders
                    </p>
                  </div>
                </div>
              </div>
              <Button size="lg" variant="outline" className="border-primary hover:bg-primary hover:text-white" asChild>
                <Link to="/about">
                  Learn More <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>



      {/* YouTube Video & MIT Innovation Hub Section */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-br from-gray-50 via-orange-50/30 to-red-50/20" >
        {/* Floating Orbs - Animated Background Layer 1 */}
        <div
          className="absolute top-20 left-20 w-72 h-72 rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, #8B2A3B 0%, #5a1a26 100%)',
            animation: 'float 8s ease-in-out infinite',
            filter: 'blur(40px)'
          }}
        ></div>
        <div
          className="absolute bottom-20 right-20 w-96 h-96 rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, #E25A2C 0%, #a0401f 100%)',
            animation: 'float 10s ease-in-out infinite reverse',
            filter: 'blur(40px)'
          }}
        ></div>

        {/* Subtle Shimmer - Animated Background Layer 2 */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            background: 'linear-gradient(to right, transparent, #8B2A3B, transparent)',
            animation: 'shimmer 8s ease-in-out infinite',
            transform: 'skewX(-20deg)'
          }}
        ></div>

        {/* Content Layer */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-16 animate-fade-in">
            <h2
              className="text-4xl md:text-5xl font-bold mb-4"
              style={{
                background: 'linear-gradient(135deg, #8B2A3B 0%, #a53549 50%, #E25A2C 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                lineHeight: '1.3'
              }}
            >
              MIT Vishwaprayag University Innovation Ecosystem
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Discover how MIT Vishwaprayag University is fostering innovation and nurturing the next generation of tech leaders
            </p>
          </div>

          {/* Two Column Layout */}
          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Left: YouTube Video Players (2 Videos Stacked) */}
            <div className="space-y-8">
              {/* First Video */}
              <div
                className="animate-scale-in"
                style={{ animationDelay: '0.2s' }}
              >
                <div className="relative group">
                  {/* Outer Glow Effect */}
                  <div
                    className="absolute -inset-4 rounded-2xl opacity-30 group-hover:opacity-40 transition-all duration-500"
                    style={{
                      background: 'linear-gradient(135deg, rgba(139,42,59,0.3) 0%, rgba(226,90,44,0.2) 100%)',
                      filter: 'blur-xl group-hover:blur-2xl'
                    }}
                  ></div>

                  {/* Video Container with Border */}
                  <div className="relative border-4 border-white/80 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm transform group-hover:scale-105 transition-all duration-500">
                    {/* Responsive 16:9 Container */}
                    <div className="relative" style={{ paddingBottom: '56.25%' }}>
                      <iframe
                        className="absolute top-0 left-0 w-full h-full"
                        src="https://www.youtube.com/embed/mIXF7_A3hsA"
                        title="MIT Innovation Hub Video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>

                    {/* Glossy Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-white/5 pointer-events-none"></div>
                  </div>

                  {/* Floating "Watch Now" Badge */}
                  <div
                    className="absolute bottom-4 right-4 px-4 py-2 rounded-full text-sm font-bold text-white shadow-lg animate-pulse"
                    style={{
                      background: 'linear-gradient(135deg, #E25A2C 0%, #c04622 100%)'
                    }}
                  >
                    🎥 Watch Now
                  </div>
                </div>
              </div>

              {/* Second Video */}
              <div
                className="animate-scale-in"
                style={{ animationDelay: '0.3s' }}
              >
                <div className="relative group">
                  {/* Outer Glow Effect */}
                  <div
                    className="absolute -inset-4 rounded-2xl opacity-30 group-hover:opacity-40 transition-all duration-500"
                    style={{
                      background: 'linear-gradient(135deg, rgba(139,42,59,0.3) 0%, rgba(226,90,44,0.2) 100%)',
                      filter: 'blur-xl group-hover:blur-2xl'
                    }}
                  ></div>

                  {/* Video Container with Border */}
                  <div className="relative border-4 border-white/80 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm transform group-hover:scale-105 transition-all duration-500">
                    {/* Responsive 16:9 Container */}
                    <div className="relative" style={{ paddingBottom: '56.25%' }}>
                      <iframe
                        className="absolute top-0 left-0 w-full h-full"
                        src="https://www.youtube.com/embed/pgK3hnXzQcI"
                        title="MIT Vishwaprayag University Campus Video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>

                    {/* Glossy Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-white/5 pointer-events-none"></div>
                  </div>

                  {/* Floating "Watch Now" Badge */}
                  <div
                    className="absolute bottom-4 right-4 px-4 py-2 rounded-full text-sm font-bold text-white shadow-lg animate-pulse"
                    style={{
                      background: 'linear-gradient(135deg, #E25A2C 0%, #c04622 100%)'
                    }}
                  >
                    🎥 Watch Now
                  </div>
                </div>
              </div>
            </div>

            {/* Right: MIT Innovation Infographic */}
            <div
              className="animate-fade-in"
              style={{ animationDelay: '0.4s' }}
            >
              <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-gray-200/50 p-6 hover:shadow-3xl transition-all duration-500">
                {/* Top Edge Accent */}
                <div
                  className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl"
                  style={{
                    background: 'linear-gradient(90deg, rgba(139,42,59,0.3) 0%, rgba(139,42,59,0.5) 30%, rgba(226,90,44,0.5) 70%, rgba(226,90,44,0.3) 100%)'
                  }}
                ></div>

                {/* MIT Logo Header - Centered */}
                <div className="flex flex-col items-center gap-3 mb-6">
                  <h3
                    className="text-2xl font-bold text-center"
                    style={{
                      background: 'linear-gradient(135deg, #8B2A3B 0%, #E25A2C 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}
                  >
                    Process Flow & Timeline
                  </h3>
                </div>

                {/* Infographic Container */}
                <div className="relative mb-6 bg-gradient-to-b from-gray-50 to-white p-2 rounded-2xl border border-gray-100">
                  <img
                    src={processFlowImage}
                    alt="SMC-MIT Vishwaprayag University Process Flow and Timeline"
                    className="w-full h-auto rounded-lg transform hover:scale-105 transition-transform duration-500"
                  />

                  {/* Hover Shimmer */}
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-200/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
                    style={{
                      animation: 'shimmer 3s ease-in-out infinite'
                    }}
                  ></div>
                </div>

                {/* Decorative Particles */}
                <div
                  className="absolute top-6 right-6 w-20 h-20 rounded-full opacity-20 animate-pulse"
                  style={{
                    background: '#E25A2C',
                    filter: 'blur(30px)'
                  }}
                ></div>
                <div
                  className="absolute bottom-6 left-6 w-24 h-24 rounded-full opacity-20 animate-pulse"
                  style={{
                    background: '#8B2A3B',
                    filter: 'blur(30px)',
                    animationDelay: '1s'
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div
            className="text-center mt-12 animate-fade-in"
            style={{ animationDelay: '0.6s' }}
          >
            <Button
              size="lg"
              className="text-base font-semibold text-white hover:scale-105 transition-transform duration-300 shadow-lg hover:shadow-glow"
              style={{
                background: 'linear-gradient(135deg, #8B2A3B 0%, #E25A2C 100%)'
              }}
              asChild
            >
              <Link to="/about">
                Explore MIT Innovation Ecosystem <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary via-primary/90 to-secondary text-white" >
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Build the Future?</h2>
          <p className="text-xl mb-8 text-white/90">
            Join hundreds of innovators in creating impactful solutions
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    {registrationOpen ? (
                      <Button size="lg" className="bg-white text-primary hover:bg-white/90 hover:shadow-glow text-base" asChild>
                        <Link to="/register-team">
                          Get Started <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                      </Button>
                    ) : (
                      <Button size="lg" className="bg-gray-400 text-gray-200 cursor-not-allowed opacity-70" disabled>
                        <Lock className="mr-2 h-4 w-4" /> Registration Closed
                      </Button>
                    )}
                  </span>
                </TooltipTrigger>
                {!registrationOpen && (
                  <TooltipContent>
                    <p>Registration is currently closed. Please check back later.</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
            <Button size="lg" className="bg-white/10 border-2 border-white text-white hover:bg-white hover:text-[#8B2A3B] text-base font-semibold backdrop-blur-sm transition-all" asChild>
              <Link to="/guidelines">
                View Resources
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Custom Keyframe Animations */}
      <style > {`
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
      `}</style>

      <Footer />
    </div>
  );
};

export default Home;
