import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Upload, 
  Clock, 
  Phone,
  Settings, 
  Menu, 
  LogOut,
  CreditCard
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import Sidebar from '../components/Sidebar';
import ProfileCompletionModal from '../components/ProfileCompletionModal';
import { useUser } from '../context/UserContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { user, logout } = useUser();
  const [isSidebarOpen, setSidebarOpen] = useState(false); // Default to closed for mobile-first
  const location = useLocation();

  // Open sidebar on desktop by default
  React.useEffect(() => {
    if (window.innerWidth >= 1024) {
      setSidebarOpen(true);
    }
  }, []);

  // Close sidebar on mobile when route changes
  React.useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [location]);

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'New Submission', icon: Upload, path: '/dashboard/submit' },
    { name: 'History', icon: Clock, path: '/dashboard/history' },
    { name: 'Guidance Calls', icon: Phone, path: '/dashboard/guidance-calls' },
    { name: 'Subscription Plans', icon: CreditCard, path: '/dashboard/plans' },
    { name: 'Settings', icon: Settings, path: '/dashboard/settings' },
  ];

  const dashboardIcon = (
    <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );

  return (
    <div className="h-screen bg-gray-50 dark:bg-black flex overflow-hidden font-sans transition-colors duration-200">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        title="CheckIAS" 
        icon={dashboardIcon}
        navItems={navItems}
        basePath="/dashboard"
      />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : ''}`}>
        {/* Header */}
        <header className="h-16 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 sm:px-6 lg:px-8 flex-shrink-0 transition-colors duration-200">
          <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-2 text-slate-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors focus:outline-none"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-4 ml-auto">
            <ThemeToggle />
            <div className="h-8 w-px bg-slate-200 dark:bg-gray-800 mx-2"></div>
            <button 
              onClick={() => { logout(); navigate('/login'); }}
              className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 text-sm font-medium transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
             </div>
        </header>

        {/* Main Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-black transition-colors duration-200">
          <div className="max-w-7xl mx-auto">
             {children}
          </div>
        </main>
      </div>

      {/* Profile Completion Modal - blocks usage until complete */}
      <ProfileCompletionModal isOpen={!!user && !user.isProfileComplete} />
    </div>
  );
}
