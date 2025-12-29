import React from 'react';
import { Outlet } from 'react-router-dom';
import { Layers } from 'lucide-react';

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-brand-bg text-slate-900 font-sans">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Layers className="w-6 h-6 text-brand-primary" />
            <span className="text-xl font-bold text-slate-800 tracking-tight">CheckIAS</span>
          </div>
          <nav className="hidden md:flex space-x-4">
             <span className="text-sm font-medium text-slate-500 cursor-pointer hover:text-brand-primary transition-colors">Dashboard</span>
             <span className="text-sm font-medium text-slate-500 cursor-pointer hover:text-brand-primary transition-colors">Settings</span>
          </nav>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      
      <footer className="border-t border-slate-200 mt-auto py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
          &copy; {new Date().getFullYear()} CheckIAS. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;