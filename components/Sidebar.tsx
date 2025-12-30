import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, LucideIcon } from 'lucide-react';

interface NavItem {
  name: string;
  icon: LucideIcon;
  path: string;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: React.ReactNode;
  navItems: NavItem[];
  footer?: React.ReactNode;
  basePath?: string; // e.g. '/dashboard' or '/admin' - used for active state matching
}

export default function Sidebar({ 
  isOpen, 
  onClose, 
  title, 
  icon, 
  navItems, 
  footer,
  basePath = '/dashboard'
}: SidebarProps) {
  const location = useLocation();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800 
        transform transition-all duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-64'} 
        lg:fixed lg:inset-y-0
      `}>
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
          <Link to={basePath} className="flex items-center gap-2">
            {icon && (
              <div className={`${basePath.includes('admin') ? 'bg-red-600' : 'bg-indigo-600'} p-1.5 rounded-lg`}>
                {icon}
              </div>
            )}
            <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{title}</span>
          </Link>
          <button onClick={onClose} className="lg:hidden text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            // Check if active: exact match or starts with path (excluding base path if it's just root)
            const isActive = location.pathname === item.path || 
              (item.path !== basePath && location.pathname.startsWith(item.path));
            
            // Theme specific colors
            const activeBg = basePath.includes('admin') 
              ? 'bg-slate-100 dark:bg-gray-900 text-slate-900 dark:text-white' // Admin style
              : 'bg-indigo-600 text-white shadow-sm'; // Dashboard style
              
            const inactiveBg = 'text-slate-500 dark:text-gray-400 hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-gray-900 dark:hover:text-white';
            
            const activeIconColor = basePath.includes('admin')
              ? 'text-red-600 dark:text-red-500'
              : 'text-white';
              
            const inactiveIconColor = 'text-slate-400 dark:text-slate-500 group-hover:text-slate-500 dark:group-hover:text-slate-300';

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group
                  ${isActive ? activeBg : inactiveBg}
                `}
              >
                <item.icon className={`w-5 h-5 transition-colors ${isActive ? activeIconColor : inactiveIconColor}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

         {/* Footer */}
         {footer && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            {footer}
          </div>
        )}
      </aside>
    </>
  );
}
