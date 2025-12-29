import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Upload, 
  Clock, 
  LifeBuoy, 
  Settings, 
  Menu, 
  X, 
  LogOut 
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
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
    { name: 'Support', icon: LifeBuoy, path: '/dashboard/support' },
    { name: 'Settings', icon: Settings, path: '/dashboard/settings' },
  ];

  return (
    <div className="h-screen bg-gray-50 dark:bg-black flex overflow-hidden font-sans transition-colors duration-200">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800 
        transform transition-all duration-300 ease-in-out flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-64'} 
        lg:fixed lg:inset-y-0
      `}>
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
                <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">CheckIAS</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group
                  ${isActive 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-slate-500 dark:text-gray-400 hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-gray-900 dark:hover:text-white'}
                `}
              >
                <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-500 dark:group-hover:text-slate-300'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : ''}`}>
        {/* Header */}
        <header className="h-16 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 sm:px-6 lg:px-8 flex-shrink-0 transition-colors duration-200">
          <div className="flex items-center gap-4">
            <button 
              className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors focus:outline-none" 
              onClick={() => setSidebarOpen(!isSidebarOpen)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              {navItems.find(i => i.path === location.pathname)?.name || 'Dashboard'}
            </h1>
          </div>

          {/* User Profile - Moved to Top Right */}
          <div className="flex items-center gap-4">
             <ThemeToggle />
             <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-700">
                <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm border border-indigo-200">
                  JD
                </div>
                <div className="hidden sm:block">
                   <p className="text-sm font-medium text-gray-900 dark:text-white">John Doe</p>
                   <p className="text-xs text-gray-500 dark:text-gray-400">Student</p>
                </div>
                <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all ml-2" title="Logout">
                  <LogOut className="w-5 h-5" />
                </button>
             </div>
          </div>
        </header>

        {/* Main Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-black transition-colors duration-200">
          <div className="max-w-7xl mx-auto">
             {children}
          </div>
        </main>
      </div>
    </div>
  );
}
