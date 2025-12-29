import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone, Twitter, Linkedin, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer data-aos="fade-up" className="bg-white dark:bg-black border-t border-gray-100 dark:border-gray-900 transition-colors duration-200">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-8">
          
          {/* Brand Column (Span 2 on mobile, 4 on desktop) */}
          <div className="col-span-2 lg:col-span-4">
            <Link to="/" className="text-2xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">C</div>
              CheckIAS
            </Link>
            <p className="mt-6 text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-sm">
              Empowering UPSC aspirants with expert evaluation, detailed analytics, and personalized mentorship to crack the Civil Services Examination.
            </p>
            <div className="mt-8 flex items-center gap-4">
               {/* Social Icons mapped dynamically */}
               {[
                 { icon: Twitter, href: "https://twitter.com" },
                 { icon: Linkedin, href: "https://linkedin.com" },
                 { icon: Instagram, href: "https://instagram.com" }
               ].map((social, idx) => (
                 <a 
                   key={idx}
                   href={social.href}
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="w-10 h-10 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-full text-gray-500 dark:text-gray-400 hover:text-white hover:bg-indigo-600 dark:hover:bg-[#1B1F42] transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1"
                   aria-label={`Visit our ${idx === 0 ? 'Twitter' : idx === 1 ? 'LinkedIn' : 'Instagram'} page`}
                 >
                   <social.icon className="w-4 h-4" />
                 </a>
               ))}
            </div>
          </div>

          {/* Platform Links (Span 1 on mobile, 2 on desktop) */}
          <div className="col-span-1 lg:col-span-2">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-6">
              Platform
            </h4>
            <ul className="space-y-4">
              {['Home', 'Features', 'Pricing', 'About Us', 'Success Stories'].map((item) => (
                <li key={item}>
                  <Link 
                    to={item === 'Home' ? '/' : `/${item.toLowerCase().replace(' ', '-')}`} 
                    className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm font-medium transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links (Span 1 on mobile, 2 on desktop) */}
          <div className="col-span-1 lg:col-span-2">
             <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-6">
              Resources
            </h4>
            <ul className="space-y-4">
              {['Blog', 'Help Center', 'Privacy Policy', 'Terms of Service', 'Refund Policy'].map((item) => (
                <li key={item}>
                  <Link 
                    to={`/${item.toLowerCase().replace(' ', '-')}`} 
                    className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm font-medium transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column (Span 2 on mobile, 4 on desktop) */}
          <div className="col-span-2 lg:col-span-4">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-6">
              Contact Us
            </h4>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <span className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mt-2">
                  C-29, Patel Nagar, Ghaziabad, Uttar Pradesh, India, 201001
                </span>
              </li>
              <li className="flex items-center gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                   <Mail className="w-5 h-5" />
                </div>
                <a href="mailto:support@checkias.com" className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm transition-colors font-medium">
                  support@checkias.com
                </a>
              </li>
              <li className="flex items-center gap-4">
                 <div className="flex-shrink-0 w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                   <Phone className="w-5 h-5" />
                 </div>
                <a href="tel:+9199999xxxxx" className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm transition-colors font-medium">
                  +91-99999xxxxx
                </a>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-100 dark:border-gray-900 bg-gray-50/50 dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <p className="text-gray-400 dark:text-gray-500 text-sm font-medium">
              © {new Date().getFullYear()} CheckIAS. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
