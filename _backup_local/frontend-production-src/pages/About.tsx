import { useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Target, Users, Award, Rocket, Lightbulb, Code, Linkedin } from 'lucide-react';
import smcBuildingImage from '@/assets/smc-building.jpg';
import smcLogo from '@/assets/smc-logo.png';
import commissionerImage from '@/assets/commissioner.png';
// Images are in public folder, referenced directly
const profVishwanathKarad = '/prof_vishwanath_karad.png';
const profSwatiChate = '/prof_swati_chate.png';
const profGopalkrishnaJoshi = '/prof_gopalkrishna_joshi.png';

const About = () => {
  const [searchParams] = useSearchParams();
  const view = searchParams.get('view');

  const objectives = [
    {
      icon: Target,
      title: 'Foster Innovation',
      description: 'Encourage creative thinking and novel solutions to real-world problems'
    },
    {
      icon: Users,
      title: 'Build Community',
      description: 'Create a network of talented individuals passionate about technology'
    },
    {
      icon: Award,
      title: 'Recognize Excellence',
      description: 'Reward outstanding projects and innovative implementations'
    },
    {
      icon: Rocket,
      title: 'Launch Careers',
      description: 'Provide opportunities to connect with industry leaders and recruiters'
    },
  ];

  if (view === 'smc') {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16 animate-fade-in">
            {/* Glossy Title Container - Maroon/Red Theme */}
            <div className="relative bg-gradient-to-br from-[#8B0000] via-[#a00000] to-[#6B0000] py-12 px-6 text-center rounded-2xl mb-12 overflow-hidden shadow-2xl transform hover:scale-[1.01] transition-transform duration-500">
              {/* Layer 1: Glossy Reflective Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/15 via-white/5 to-black/30 rounded-2xl"></div>

              {/* Layer 2: Animated Gradient Mesh */}
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  background: `radial-gradient(circle at 20% 20%, rgba(220, 38, 38, 0.4) 0%, transparent 50%),
                              radial-gradient(circle at 80% 80%, rgba(153, 27, 27, 0.4) 0%, transparent 60%)`,
                  animation: 'float 6s ease-in-out infinite'
                }}
              ></div>

              {/* Layer 3: Shimmer Effect */}
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                style={{
                  animation: 'shimmer 4s ease-in-out infinite',
                  transform: 'skewX(-20deg)'
                }}
              ></div>

              {/* Layer 4: Bottom Glow */}
              <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/40 to-transparent"></div>

              {/* Content with Logo */}
              <div className="relative z-10 flex flex-col items-center justify-center gap-4">
                <img src={smcLogo} alt="SMC Logo" className="w-28 h-28 md:w-36 md:h-36 object-contain drop-shadow-lg" />
                <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg">
                  About <span className="bg-gradient-to-r from-orange-200 via-yellow-200 to-orange-200 bg-clip-text text-transparent">Solapur Municipal Corporation</span>
                </h1>
              </div>
            </div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Serving the citizens of Solapur with dedication and innovation since 1864.
            </p>
          </div>

          {/* Image Section */}
          <div className="mb-16 animate-scale-in flex justify-center">
            <img
              src={smcBuildingImage}
              alt="Solapur Municipal Corporation Building"
              className="w-full h-auto max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            />
          </div>

          {/* City Overview Section */}
          <div className="mb-16 animate-slide-up">
            <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-8 shadow-lg">
              <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-[#8B0000] to-[#c04000] bg-clip-text text-transparent">City Overview</h2>
              <div className="grid md:grid-cols-4 gap-6 text-center">
                <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow hover:-translate-y-1 transform duration-300">
                  <div className="text-4xl font-bold text-[#8B0000] mb-2">11+</div>
                  <p className="text-gray-600 font-medium">Lakh Population</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow hover:-translate-y-1 transform duration-300">
                  <div className="text-4xl font-bold text-[#a00000] mb-2">178</div>
                  <p className="text-gray-600 font-medium">Sq. Km Area</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow hover:-translate-y-1 transform duration-300">
                  <div className="text-4xl font-bold text-[#c04000] mb-2">1864</div>
                  <p className="text-gray-600 font-medium">Established</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow hover:-translate-y-1 transform duration-300">
                  <div className="text-4xl font-bold text-[#8B0000] mb-2">74</div>
                  <p className="text-gray-600 font-medium">Ward Divisions</p>
                </div>
              </div>
            </div>

            {/* Municipal Commissioner Section */}
            <div className="mb-16 animate-slide-up">
              <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 relative overflow-hidden">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-200 rounded-full -mr-32 -mt-32 opacity-60"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-red-200 rounded-full -ml-24 -mb-24 opacity-60"></div>

                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                  <div className="w-full md:w-1/3 flex justify-center">
                    <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-[#8B0000] shadow-2xl transform hover:scale-105 transition-transform duration-500">
                      <img
                        src={commissionerImage}
                        alt="Dr. Sachin Ombase (IAS)"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="w-full md:w-2/3 text-center md:text-left">
                    <div className="inline-block px-4 py-1 bg-orange-100 text-[#8B0000] rounded-full text-sm font-semibold mb-4">
                      Leadership
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-2 text-[#8B0000]">
                      Dr. Sachin Ombase (IAS)
                    </h2>
                    <h3 className="text-xl font-semibold text-gray-600 mb-6 flex items-center justify-center md:justify-start gap-2">
                      <Award className="w-5 h-5 text-orange-500" />
                      Municipal Commissioner & Administrator
                    </h3>
                    <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
                      <p>
                        Leading Solapur Municipal Corporation with a vision for sustainable urban development and efficient governance.
                        Under his dynamic leadership, SMC is committed to transforming Solapur into a smart, clean, and livable city
                        through innovative citizen-centric initiatives and robust infrastructure development.
                      </p>
                      <p className="italic font-medium text-[#8B0000]/80 border-l-4 border-[#8B0000] pl-4">
                        "Our goal is to leverage technology and community participation to build a resilient and future-ready Solapur."
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* About Content */}
          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div className="animate-slide-up">
              <h2 className="text-3xl font-bold mb-6 gradient-text-orange">Our Mission</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                To provide efficient, transparent, and citizen-centric services to the people of Solapur.
                We strive to improve the quality of life through sustainable urban development and
                effective governance.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Our commitment extends to ensuring clean drinking water, proper sanitation,
                well-maintained roads, and modern infrastructure for all citizens.
              </p>
            </div>
            <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <h2 className="text-3xl font-bold mb-6 gradient-text">Our Vision</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                To make Solapur a smart, clean, and green city that offers a high standard of living
                for all its residents, fostering economic growth and social well-being.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We envision Solapur as a model city with world-class amenities, sustainable
                development practices, and inclusive growth for all communities.
              </p>
            </div>
          </div>

          {/* Key Departments Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">Key Departments</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: '🏗️',
                  title: 'Engineering & Infrastructure',
                  description: 'Roads, bridges, public buildings, and urban infrastructure development'
                },
                {
                  icon: '💧',
                  title: 'Water Supply',
                  description: '24/7 clean drinking water supply and water resource management'
                },
                {
                  icon: '🌿',
                  title: 'Environment & Sanitation',
                  description: 'Waste management, cleanliness drives, and green initiatives'
                },
                {
                  icon: '🏥',
                  title: 'Health Services',
                  description: 'Public health programs, hospitals, and medical facilities'
                },
                {
                  icon: '📚',
                  title: 'Education',
                  description: 'Municipal schools, libraries, and educational programs'
                },
                {
                  icon: '🏛️',
                  title: 'Town Planning',
                  description: 'Urban development, building permissions, and city planning'
                },
                {
                  icon: '🚌',
                  title: 'Transport',
                  description: 'Public transportation, traffic management, and mobility solutions'
                },
                {
                  icon: '💡',
                  title: 'Smart City Initiatives',
                  description: 'Digital services, e-governance, and technology integration'
                },
              ].map((dept, index) => (
                <Card key={index} className="hover-lift animate-fade-in border-0 shadow-lg" style={{ animationDelay: `${index * 0.05}s` }}>
                  <CardContent className="pt-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center text-3xl">
                      {dept.icon}
                    </div>
                    <h3 className="font-bold text-lg mb-2">{dept.title}</h3>
                    <p className="text-sm text-muted-foreground">{dept.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Achievements Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">Key Achievements</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: '🏆',
                  title: 'Smart City Mission',
                  description: 'Selected under Smart Cities Mission for comprehensive urban development and digital transformation initiatives.',
                  color: 'from-yellow-400 to-orange-500'
                },
                {
                  icon: '♻️',
                  title: 'Swachh Bharat Award',
                  description: 'Recognized for excellence in cleanliness and sanitation under the Swachh Bharat Mission.',
                  color: 'from-green-400 to-emerald-500'
                },
                {
                  icon: '💧',
                  title: 'Water Conservation',
                  description: 'Successful implementation of water harvesting and conservation projects across the city.',
                  color: 'from-blue-400 to-cyan-500'
                },
              ].map((achievement, index) => (
                <Card key={index} className="hover-lift animate-scale-in border-0 shadow-lg overflow-hidden" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className={`h-2 bg-gradient-to-r ${achievement.color}`}></div>
                  <CardContent className="pt-6 text-center">
                    <div className="text-5xl mb-4">{achievement.icon}</div>
                    <h3 className="font-bold text-xl mb-3">{achievement.title}</h3>
                    <p className="text-muted-foreground">{achievement.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Smart City Initiatives */}
          <div className="mb-16">
            <div className="bg-gradient-to-br from-[#8B0000] via-[#a00000] to-[#6B0000] rounded-2xl p-8 shadow-2xl overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/20"></div>
              <div className="relative z-10">
                <h2 className="text-3xl font-bold text-center mb-8 text-white">Smart City Initiatives</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    { title: 'Digital Services Portal', description: 'Online platform for all municipal services and payments', icon: '🌐' },
                    { title: 'Smart Street Lighting', description: 'Energy-efficient LED lights with smart monitoring', icon: '💡' },
                    { title: 'CCTV Surveillance', description: 'City-wide security monitoring for citizen safety', icon: '📹' },
                    { title: 'E-Governance', description: 'Paperless administration and digital records', icon: '📱' },
                    { title: 'Smart Traffic Management', description: 'Intelligent traffic signals and route optimization', icon: '🚦' },
                    { title: 'Citizen Grievance App', description: 'Mobile app for reporting and tracking complaints', icon: '📞' },
                  ].map((initiative, index) => (
                    <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-colors">
                      <div className="text-3xl mb-2">{initiative.icon}</div>
                      <h3 className="font-bold text-white mb-1">{initiative.title}</h3>
                      <p className="text-sm text-orange-200">{initiative.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="text-center">
            <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-0 shadow-lg">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-[#8B0000] to-[#c04000] bg-clip-text text-transparent">Get in Touch</h2>
                <p className="text-muted-foreground mb-4">
                  For more information about Solapur Municipal Corporation and its services, visit our official website or contact us.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <a
                    href="https://www.solapurcorporation.gov.in/smc/home_marathi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#8B0000] to-[#c04000] text-white rounded-full font-medium hover:shadow-lg transition-all hover:scale-105"
                  >
                    🌐 Official Website
                  </a>
                  <a
                    href="tel:+919011962627"
                    className="inline-flex items-center px-6 py-3 bg-white border-2 border-[#8B0000] text-[#8B0000] rounded-full font-medium hover:bg-red-50 transition-all hover:scale-105"
                  >
                    📞 +91-9011962627
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Footer />

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
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in">
          {/* Glossy Title Container */}
          <div className="relative bg-gradient-to-br from-[#800000] via-[#a00000] to-[#c04000] py-12 px-6 text-center rounded-2xl mb-12 overflow-hidden shadow-2xl transform hover:scale-[1.01] transition-transform duration-500">
            {/* Layer 1: Glossy Reflective Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/15 via-white/5 to-black/30 rounded-2xl"></div>

            {/* Layer 2: Animated Gradient Mesh */}
            <div
              className="absolute inset-0 opacity-40"
              style={{
                background: `radial-gradient(circle at 20% 20%, rgba(226, 90, 44, 0.4) 0%, transparent 50%),
                            radial-gradient(circle at 80% 80%, rgba(139, 42, 59, 0.4) 0%, transparent 60%)`,
                animation: 'float 6s ease-in-out infinite'
              }}
            ></div>

            {/* Layer 3: Shimmer Effect */}
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              style={{
                animation: 'shimmer 4s ease-in-out infinite',
                transform: 'skewX(-20deg)'
              }}
            ></div>

            {/* Layer 4: Bottom Glow */}
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/40 to-transparent"></div>

            {/* Content */}
            <div className="relative z-10">
              <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg mb-2">
                About the <span className="bg-gradient-to-r from-orange-200 via-yellow-200 to-orange-200 bg-clip-text text-transparent">MIT Vishwaprayag University Hackathon</span>
              </h1>
            </div>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            A premier innovation platform bringing together the brightest minds to solve
            challenging problems through technology and teamwork.
          </p>
        </div>

        {/* Image Section */}
        <div className="mb-16 animate-scale-in">
          <img
            src="/MIT Full Img1.png"
            alt="MIT-VPU Campus"
            className="w-full h-auto rounded-2xl shadow-2xl"
          />
        </div>

        {/* About Content */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div className="animate-slide-up">
            <h2 className="text-3xl font-bold mb-6 gradient-text-orange">Our Mission</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-4">
              The MIT-VPU Grand Hackathon is designed to nurture innovation, collaboration,
              and technical excellence among students and professionals. Our mission is to
              create a platform where ideas transform into impactful solutions.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We believe in the power of collective intelligence and aim to foster an
              environment where participants can learn, grow, and showcase their talents
              while working on real-world challenges.
            </p>
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-3xl font-bold mb-6 gradient-text">Our Vision</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-4">
              To establish MIT-VPU as a leading hub for innovation and technology,
              producing solutions that make a meaningful difference in society. We envision
              a future where our hackathon becomes a launchpad for groundbreaking projects.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Through this event, we aim to build a strong community of innovators who
              continue to push boundaries and create positive change through technology.
            </p>
          </div>
        </div>

        {/* Objectives */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Our Objectives</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {objectives.map((objective, index) => (
              <Card key={index} className="hover-lift animate-fade-in border-0 shadow-lg" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="pt-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                    <objective.icon className="h-8 w-8 text-secondary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{objective.title}</h3>
                  <p className="text-sm text-muted-foreground">{objective.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Event Details */}


        {/* Tracks */}
        <div>
          <h2 className="text-3xl font-bold text-center mb-12">Hackathon Tracks</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Lightbulb,
                title: 'AI & Machine Learning',
                description: 'Build intelligent systems that learn and adapt',
                color: 'text-primary'
              },
              {
                icon: Code,
                title: 'Web & Mobile Development',
                description: 'Create innovative applications and platforms',
                color: 'text-secondary'
              },
              {
                icon: Rocket,
                title: 'Open Innovation',
                description: 'Any creative solution to real-world problems',
                color: 'text-primary'
              },
            ].map((track, index) => (
              <Card key={index} className="hover-lift animate-scale-in border-0 shadow-lg" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="pt-6">
                  <track.icon className={`h-12 w-12 mb-4 ${track.color}`} />
                  <h3 className="font-bold text-xl mb-3">{track.title}</h3>
                  <p className="text-muted-foreground">{track.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* University Leadership Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 mt-6 text-[#800000]">University Leadership</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Prof. Dr. Vishwanath D. Karad',
                title: 'Founder Executive President',
                description: 'Visionary educationist and founder of MIT Group of Institutions',
                image: profVishwanathKarad
              },
              {
                name: 'Prof. Swati Chate',
                title: 'Executive President',
                description: 'Leading the university towards global excellence and innovation',
                image: profSwatiChate
              },
              {
                name: 'Prof. Gopalkrishna Joshi',
                title: 'Founding Vice Chancellor',
                description: 'Spearheading academic and research initiatives',
                image: profGopalkrishnaJoshi
              }
            ].map((leader, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 relative overflow-hidden hover:scale-105 transition-transform duration-300">
                {/* Decorative Background Elements - Uniform Design */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-300 rounded-full -mr-16 -mt-16 opacity-40"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-300 rounded-full -ml-12 -mb-12 opacity-40"></div>

                <div className="flex flex-col items-center text-center relative z-10">
                  <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-[#800000] shadow-lg mb-6">
                    <img
                      src={leader.image}
                      alt={leader.name}
                      className={`w-full h-full object-cover object-center ${index === 0 ? 'scale-110' : ''}`}
                    />
                  </div>
                  <div className="inline-block px-3 py-1 bg-orange-100 text-[#800000] rounded-full text-xs font-semibold mb-3">
                    Leadership
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-[#800000]">
                    {leader.name}
                  </h3>
                  <h4 className="text-md font-semibold text-gray-700 mb-4 flex items-center justify-center gap-2">
                    <Award className="w-4 h-4 text-orange-600" />
                    {leader.title}
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed font-medium">
                    {leader.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Meet the Developers Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Meet the Developers</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                name: 'Amey Telkar',
                role: 'Full Stack Developer',
                linkedin: 'https://www.linkedin.com/in/amey-telkar-ab14a12a9',
                color: 'bg-blue-300',
                borderColor: 'border-blue-500'
              },
              {
                name: 'Rushikesh Chintanpalli',
                role: 'Full Stack Developer',
                linkedin: 'https://www.linkedin.com/in/rushikesh-chintanpalli-771449370',
                color: 'bg-green-300',
                borderColor: 'border-green-500'
              },
              {
                name: 'Abhishek Kamble',
                role: 'Frontend Developer',
                linkedin: 'https://www.linkedin.com/in/abhishekkamble-dev',
                color: 'bg-purple-300',
                borderColor: 'border-purple-500'
              },
              {
                name: 'Atherv Telkar',
                role: 'Backend Developer',
                linkedin: 'https://www.linkedin.com/in/atherv-telkar-a59948330',
                color: 'bg-yellow-300',
                borderColor: 'border-yellow-500'
              }
            ].map((dev, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 relative overflow-hidden hover:scale-105 transition-transform duration-300">
                {/* Decorative Background Elements */}
                <div className={`absolute top-0 right-0 w-24 h-24 ${dev.color} rounded-full -mr-12 -mt-12 opacity-40`}></div>
                <div className={`absolute bottom-0 left-0 w-20 h-20 ${dev.color} rounded-full -ml-10 -mb-10 opacity-40`}></div>

                <div className="flex flex-col items-center text-center relative z-10">
                  <div className={`relative w-32 h-32 rounded-full flex items-center justify-center border-4 ${dev.borderColor} bg-white shadow-lg mb-6 group`}>
                    <a href={dev.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full h-full hover:bg-gray-50 rounded-full transition-colors">
                      <Linkedin className="w-16 h-16 text-[#0077b5] group-hover:scale-110 transition-transform duration-300" />
                    </a>
                  </div>
                  <div className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold mb-3">
                    Developer
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900">
                    {dev.name}
                  </h3>
                  <h4 className="text-md font-semibold text-gray-600 mb-4 flex items-center justify-center gap-2">
                    <Code className="w-4 h-4 text-gray-500" />
                    {dev.role}
                  </h4>
                  <a
                    href={dev.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-[#0077b5] hover:underline flex items-center gap-1"
                  >
                    View Profile <Linkedin className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>



      <Footer />

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
      `}</style>
    </div >
  );
};

export default About;