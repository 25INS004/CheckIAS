import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import ThemeToggle from '../components/ThemeToggle';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  React.useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'reviews', 'features', 'pricing'];
      
      const currentSection = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          // Check if section is roughly in the upper half of the viewport
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });

      if (currentSection) {
        setActiveSection(currentSection);
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Initial check
    handleScroll(); 
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Live Now', href: '/#hero', id: 'hero' },
    { name: 'Reviews', href: '/#reviews', id: 'reviews' },
    { name: 'Features', href: '/#features', id: 'features' },
    { name: 'Pricing', href: '/#pricing', id: 'pricing' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black font-sans text-gray-900 dark:text-gray-100 transition-colors duration-200">
      {/* Redesigned Header - Centered Layout */}
      <nav data-aos="fade-down" className="border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-black/50 backdrop-blur-md sticky top-0 z-50 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-20 flex justify-between lg:grid lg:grid-cols-3 items-center">
            
            {/* Left: Logo */}
            <div className="flex justify-start">
              <Link to="/" className="text-2xl font-black tracking-tight text-gray-900 dark:text-white hover:opacity-80 transition-opacity">
                CHECKIAS
              </Link>
            </div>

            {/* Center: Navigation */}
            <div className="hidden lg:flex justify-center">
              <nav className="flex gap-2">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={() => setActiveSection(link.id)}
                    className={`text-sm font-medium px-4 py-2 rounded-full transition-all whitespace-nowrap flex items-center gap-2 ${
                      activeSection === link.id
                        ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    {link.name === 'Live Now' && (
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                    )}
                    {link.name}
                  </a>
                ))}
                <Link
                  to="/about"
                  onClick={() => setActiveSection('about')}
                  className={`text-sm font-medium px-4 py-2 rounded-full transition-all whitespace-nowrap ${
                    activeSection === 'about'
                      ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
                >
                  About us
                </Link>
              </nav>
            </div>
            
            {/* Right: Actions */}
            <div className="flex justify-end items-center gap-4">
              <ThemeToggle />
              <Link 
                to="/signup"
                className="hidden lg:block bg-indigo-600 hover:bg-indigo-700 text-white !text-white px-7 py-2.5 rounded-full text-sm font-bold tracking-wide transition-all shadow-lg hover:shadow-indigo-500/30 transform hover:-translate-y-0.5 whitespace-nowrap"
              >
                Get Started
              </Link>
              
              {/* Mobile Menu Button */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Backdrop & Drawer */}
      <div className={`fixed inset-0 z-[60] lg:hidden transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
      </div>

      <div className={`fixed inset-y-0 left-0 w-72 bg-white dark:bg-black z-[70] lg:hidden shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col h-full ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0">
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-black tracking-tight text-gray-900 dark:text-white">
              CHECKIAS
            </Link>
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-4 px-4 space-y-2 min-h-0">
            <a href="/#hero" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-base font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              Live Now
            </a>
            <a href="/#reviews" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-base font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all">Reviews</a>
            <a href="/#features" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-base font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all">Features</a>
            <a href="/#pricing" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-base font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all">Pricing</a>
            <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-base font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all">About us</Link>
          </div>

          <div className="p-4 border-t border-gray-100 dark:border-gray-800 shrink-0">
            <Link 
              to="/signup" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block w-full text-center bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-xl text-base font-medium hover:bg-black dark:hover:bg-gray-100 transition-all shadow-lg"
            >
              Get Started
            </Link>
          </div>
      </div>

      {/* Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

