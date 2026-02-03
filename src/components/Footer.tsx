import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import logo from '@/assets/mit-vpu-logo-footer.png';

const Footer = () => {
  return (
    <footer className="bg-navy text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and About */}
          <div className="space-y-4 animate-fade-in">
            <img src={logo} alt="MIT-VPU Logo" className="h-20 mb-4" />
            <h3 className="text-xl font-bold">MIT Vishwaprayag University</h3>
            <p className="text-sm text-white/80 leading-relaxed">
              Empowering innovation through technology. Join us in building the future through our prestigious hackathon program.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="text-white/70 hover:text-secondary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-white/70 hover:text-secondary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-white/70 hover:text-secondary transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-white/70 hover:text-secondary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <h4 className="text-lg font-semibold mb-4 text-secondary">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" onClick={() => window.scrollTo(0, 0)} className="text-sm text-white/80 hover:text-white hover:pl-2 transition-all">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" onClick={() => window.scrollTo(0, 0)} className="text-sm text-white/80 hover:text-white hover:pl-2 transition-all">
                  About Hackathon
                </Link>
              </li>
              <li>
                <Link to="/problem-statements" onClick={() => window.scrollTo(0, 0)} className="text-sm text-white/80 hover:text-white hover:pl-2 transition-all">
                  Problem Statements
                </Link>
              </li>
              <li>
                <Link to="/guidelines" onClick={() => window.scrollTo(0, 0)} className="text-sm text-white/80 hover:text-white hover:pl-2 transition-all">
                  Guidelines
                </Link>
              </li>
              <li>
                <Link to="/spoc-info" onClick={() => window.scrollTo(0, 0)} className="text-sm text-white/80 hover:text-white hover:pl-2 transition-all">
                  SPOC Information
                </Link>
              </li>
              <li>
                <Link to="/faqs" onClick={() => window.scrollTo(0, 0)} className="text-sm text-white/80 hover:text-white hover:pl-2 transition-all">
                  FAQs
                </Link>
              </li>
              <li>
                <Link to="/contact" onClick={() => window.scrollTo(0, 0)} className="text-sm text-white/80 hover:text-white hover:pl-2 transition-all">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <h4 className="text-lg font-semibold mb-4 text-secondary">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                <span className="text-sm text-white/80">
                  MIT Vishwaprayag University Solapur-Pune Highway, <br />Kegaon Solapur Maharashtra, India - 413255

                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-secondary flex-shrink-0" />
                <span className="text-sm text-white/80">+91 849 684 9849</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-secondary flex-shrink-0" />
                <span className="text-sm text-white/80">hackathon@mitvpu.edu.in</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 mt-10 pt-8 text-center">
          <p className="text-sm text-white/70 mb-2">
            © {new Date().getFullYear()} MIT Vishwaprayag University. All rights reserved.
          </p>
          <p className="text-xs text-white/50">
            Developed by <a href="https://www.linkedin.com/in/rushikesh-chintanpalli-771449370" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-secondary transition-colors">Rushikesh Chintanpalli</a>, <a href="https://www.linkedin.com/in/abhishekkamble-dev" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-secondary transition-colors">Abhishek Kamble</a>, <a href="https://www.linkedin.com/in/amey-telkar-ab14a12a9" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-secondary transition-colors">Amey Telkar</a> & <a href="https://www.linkedin.com/in/atherv-telkar-a59948330" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-secondary transition-colors">Atherv Telkar</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;