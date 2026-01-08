import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  Menu, 
  LogOut,
  Shield,
  MessageSquare,
  Phone,
  FileText,
  Tag,
  Receipt
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import Sidebar from '../components/Sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const handleSignOut = () => {
    // Clear session from both storage types
    localStorage.removeItem('supabase.auth.token');
    sessionStorage.removeItem('supabase.auth.token');
    // Redirect to admin login
    navigate('/admin/login');
  };

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
    { name: 'Copy Submissions', icon: FileText, path: '/admin/submissions' },
    { name: 'Guidance Calls', icon: Phone, path: '/admin/guidance-calls' },
    { name: 'Support Tickets', icon: MessageSquare, path: '/admin/tickets' },
    { name: 'Coupons', icon: Tag, path: '/admin/coupons' },
    { name: 'Invoices', icon: Receipt, path: '/admin/invoices' },
    { name: 'Settings', icon: Settings, path: '/admin/settings' },
  ];

  const adminIcon = <Shield className="h-5 w-5 text-white" />;

  const userFooter = (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-900 transition-colors cursor-pointer">
      <div className="h-9 w-9 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-red-700 dark:text-red-300 font-semibold text-sm border border-red-200 dark:border-red-900">
        AD
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">Admin User</p>
        <p className="text-xs text-slate-500 dark:text-gray-500 truncate">admin@checkias.com</p>
      </div>
      <LogOut className="w-4 h-4 text-slate-400 hover:text-red-600 dark:text-slate-500 dark:hover:text-red-400" />
    </div>
  );

  return (
    <div className="h-screen bg-gray-50 dark:bg-black flex overflow-hidden font-sans transition-colors duration-200">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        title="CheckIAS" 
        icon={adminIcon}
        navItems={navItems}
        basePath="/admin"
        footer={userFooter}
      />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : ''}`}>
        {/* Header */}
        <header className="h-16 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 sm:px-6 lg:px-8 flex-shrink-0 transition-colors duration-200">
          <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors focus:outline-none mr-2"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white md:ml-0 ml-4">
            {navItems.find(i => i.path === location.pathname || (i.path !== '/admin' && location.pathname.startsWith(i.path)))?.name || 'Admin'}
          </h1>
          
          <div className="flex items-center gap-4 ml-auto">
             <ThemeToggle />
             <div className="h-8 w-px bg-slate-200 dark:bg-gray-800 mx-2"></div>
             <button 
               onClick={handleSignOut}
               className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 text-sm font-medium transition-colors"
             >
               <LogOut className="w-4 h-4" />
               <span className="hidden sm:inline">Sign Out</span> 
             </button>
          </div>
        </header>

        {/* Main Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-black transition-colors duration-200">
          <div className="max-w-7xl mx-auto animate-fade-in">
             {children}
          </div>
        </main>
      </div>
    </div>
  );
}
