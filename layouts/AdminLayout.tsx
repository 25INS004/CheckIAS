import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  Menu, 
  X, 
  LogOut,
  Shield,
  MessageSquare
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Open sidebar on desktop by default
  React.useEffect(() => {
    if (window.innerWidth >= 768) {
      setSidebarOpen(true);
    }
  }, []);

  // Close sidebar on mobile when route changes
  React.useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [location]);

  const navItems = [
    { name: 'Overview', icon: LayoutDashboard, path: '/admin' },
    { name: 'User Management', icon: Users, path: '/admin/users' },
    { name: 'Support Tickets', icon: MessageSquare, path: '/admin/tickets' },
    { name: 'Settings', icon: Settings, path: '/admin/settings' },
  ];

  return (
    <div className="h-screen bg-gray-50 dark:bg-black flex overflow-hidden font-sans transition-colors duration-200">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 md:hidden" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800
        transform transition-transform duration-300 ease-in-out flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar Header */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="bg-red-600 p-1.5 rounded-lg">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">CheckIAS</span>
          </Link>
          <button className="ml-auto md:hidden text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group
                  ${isActive 
                    ? 'bg-slate-100 dark:bg-gray-900 text-slate-900 dark:text-white' 
                    : 'text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-900 hover:text-slate-900 dark:hover:text-white'}
                `}
              >
                <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-red-600 dark:text-red-500' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-500 dark:group-hover:text-slate-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
           <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-900 transition-colors cursor-pointer">
              <div className="h-9 w-9 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-red-700 dark:text-red-300 font-semibold text-sm border border-red-200 dark:border-red-900">
                AD
              </div>
              <div className="flex-1 min-w-0">
                 <p className="text-sm font-medium text-slate-900 dark:text-white truncate">Admin User</p>
                 <p className="text-xs text-slate-500 truncate">Administrator</p>
              </div>
              <LogOut className="w-4 h-4 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors" />
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : ''}`}>
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
              {navItems.find(i => i.path === location.pathname)?.name || 'Admin'}
            </h1>
          </div>
          
          {/* ADMIN Badge */}
          <div className="flex items-center gap-4">
             <ThemeToggle />
             <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-bold uppercase tracking-wide">
               <Shield className="w-3.5 h-3.5" />
               Admin
             </span>
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
