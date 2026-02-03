import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, MapPin, Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { api } from '@/services/api';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await api.post('/contact', formData);
      toast.success(response.data.message || 'Message sent successfully! We\'ll get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      value: 'hackathon@mitvpu.edu.in',
      link: 'mailto:hackathon@mitvpu.edu.in'
    },
    {
      icon: Phone,
      title: 'Call Us',
      value: '+91 849 684 9849',
      link: 'tel:+918496849849'
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      value: 'MIT Vishwaprayag University, Solapur-Pune Highway, Kegaon, Solapur, Maharashtra - 413255',
      link: 'https://maps.google.com/?q=MIT+Vishwaprayag+University+Solapur'
    },
    {
      icon: Clock,
      title: 'Office Hours',
      value: 'Mon - Sat: 9:00 AM - 6:00 PM',
      link: null
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stunning Blue Header Section with Glossy Effects */}
        <div className="relative text-center mb-16 animate-fade-in py-16 px-8 rounded-3xl overflow-hidden">
          {/* Blue Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0052CC] via-[#0066FF] to-[#0047B3]"></div>

          {/* Glossy Overlay Layer */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/25 via-transparent to-black/20"></div>

          {/* Diagonal Light Beam */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent"></div>

          {/* Animated Shimmer Effect */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            style={{
              animation: 'shimmer 3s ease-in-out infinite',
              transform: 'skewX(-20deg)'
            }}
          ></div>

          {/* Floating Orbs */}
          <div className="absolute top-10 left-10 w-32 h-32 bg-blue-300/20 rounded-full blur-2xl" style={{ animation: 'float 6s ease-in-out infinite' }}></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-blue-400/20 rounded-full blur-3xl" style={{ animation: 'float 8s ease-in-out infinite reverse' }}></div>
          <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-cyan-300/15 rounded-full blur-xl" style={{ animation: 'float 5s ease-in-out infinite' }}></div>

          {/* Content */}
          <div className="relative z-10">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white drop-shadow-lg">
              Get in <span className="bg-gradient-to-r from-cyan-200 via-white to-cyan-200 bg-clip-text text-transparent">Touch</span>
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto drop-shadow-sm font-medium">
              Have questions or need assistance? We're here to help!
              Reach out to our team anytime.
            </p>
          </div>

          {/* Bottom Accent Line */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-300 to-transparent"></div>
        </div>

        {/* Custom Animations */}
        <style>{`
          @keyframes shimmer {
            0% { transform: translateX(-100%) skewX(-20deg); }
            100% { transform: translateX(200%) skewX(-20deg); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-15px); }
          }
        `}</style>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Send us a Message Card */}
          <div className="animate-slide-up">
            <Card className="h-full border-0 shadow-2xl bg-white relative overflow-hidden">
              {/* Top Gradient Border */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0052CC] via-[#0066FF] to-[#0052CC]"></div>

              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-[#0052CC] to-[#0066FF] bg-clip-text text-transparent">
                  Send us a Message
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-700 font-semibold">Full Name *</Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      disabled={isSubmitting}
                      className="border-2 border-gray-200 focus:border-[#0066FF] focus:ring-[#0066FF]/20 rounded-xl py-5 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700 font-semibold">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      disabled={isSubmitting}
                      className="border-2 border-gray-200 focus:border-[#0066FF] focus:ring-[#0066FF]/20 rounded-xl py-5 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-gray-700 font-semibold">Subject *</Label>
                    <Input
                      id="subject"
                      placeholder="How can we help?"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                      disabled={isSubmitting}
                      className="border-2 border-gray-200 focus:border-[#0066FF] focus:ring-[#0066FF]/20 rounded-xl py-5 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-gray-700 font-semibold">Message *</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us more about your query..."
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      disabled={isSubmitting}
                      className="border-2 border-gray-200 focus:border-[#0066FF] focus:ring-[#0066FF]/20 rounded-xl transition-all resize-none"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-[#0052CC] via-[#0066FF] to-[#0052CC] hover:from-[#0047B3] hover:via-[#0052CC] hover:to-[#0047B3] text-white font-bold py-6 rounded-xl shadow-lg hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 text-base"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send Message'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information & Quick Support */}
          <div className="space-y-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {/* Contact Information Card */}
            <Card className="border-0 shadow-2xl bg-white relative overflow-hidden">
              {/* Top Gradient Border */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0066FF] via-cyan-400 to-[#0066FF]"></div>

              <CardHeader className="pb-2">
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-[#0052CC] to-cyan-600 bg-clip-text text-transparent">
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {contactInfo.map((info, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl hover:from-blue-100 hover:to-cyan-100 transition-all duration-300 border border-blue-100"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0052CC] to-[#0066FF] flex items-center justify-center flex-shrink-0 shadow-lg">
                      <info.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800 mb-1">{info.title}</h4>
                      {info.link ? (
                        <a href={info.link} target="_blank" rel="noopener noreferrer" className="text-sm text-[#0052CC] hover:text-[#0047B3] transition-colors font-medium">
                          {info.value}
                        </a>
                      ) : (
                        <p className="text-sm text-gray-600">{info.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Support Card */}
            <Card className="border-0 shadow-2xl relative overflow-hidden bg-gradient-to-br from-[#0052CC] via-[#0066FF] to-[#0047B3]">
              {/* Glossy Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/10"></div>

              <CardContent className="pt-6 relative z-10">
                <h3 className="font-bold text-xl mb-4 text-white flex items-center gap-2">
                  <span className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">⚡</span>
                  Quick Support
                </h3>
                <p className="text-sm text-blue-100 mb-5 leading-relaxed">
                  For immediate assistance during the hackathon, our support team
                  is available 24/7 via email and phone.
                </p>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <span className="font-bold text-white">Technical Support:</span>
                    <span className="text-cyan-200">support@mitvpu.ac.in</span>
                  </div>
                  <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <span className="font-bold text-white">SPOC Queries:</span>
                    <span className="text-cyan-200">spoc@mitvpu.edu.in</span>
                  </div>
                  <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <span className="font-bold text-white">General Queries:</span>
                    <span className="text-cyan-200">info@mitvpu.edu.in</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Map Section */}
        <div className="wave-bg rounded-2xl p-8 md:p-12">
          <h3 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-[#0052CC] to-[#0066FF] bg-clip-text text-transparent">
            Find Us Here
          </h3>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3802.5!2d75.8568019!3d17.7125163!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc5d154eaa3b59b%3A0xcfd3c5cd91a27d87!2sMIT%20Vishwaprayag%20University!5e0!3m2!1sen!2sin!4v1703678400000!5m2!1sen!2sin"
            width="100%"
            height="400"
            style={{ border: 0, borderRadius: '1rem' }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="MIT Vishwaprayag University Solapur Location"
          ></iframe>
          <p className="text-center text-gray-600 mt-4">
            <MapPin className="inline-block h-4 w-4 mr-1 text-[#0052CC]" />
            MIT Vishwaprayag University, Solapur-Pune Highway, Kegaon, Solapur, Maharashtra - 413255
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Contact;