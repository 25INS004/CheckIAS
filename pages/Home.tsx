import React from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { useToggle } from '../hooks/useToggle';

const Home: React.FC = () => {
  const [isExpanded, toggleExpanded] = useToggle(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-fade-in">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-3 bg-indigo-50 rounded-full mb-4">
          <CheckCircle2 className="w-12 h-12 text-brand-primary" />
        </div>
        
        <h1 className="text-5xl font-extrabold text-brand-primary tracking-tight">
          Hello CheckIAS
        </h1>
        
        <p className="text-xl text-brand-secondary max-w-lg mx-auto">
          Your modern React application is successfully initialized with Tailwind CSS and TypeScript.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center">
        <button 
          onClick={toggleExpanded}
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-brand-primary hover:bg-indigo-700 transition-colors shadow-sm"
        >
          {isExpanded ? 'Show Less' : 'Explore Features'}
          <ArrowRight className="ml-2 w-4 h-4" />
        </button>
        
        <button className="inline-flex items-center justify-center px-6 py-3 border border-slate-300 text-base font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-sm">
          Documentation
        </button>
      </div>

      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mt-8 pt-8 border-t border-slate-200">
          <StatusBadge label="Tailwind Configured" status="active" />
          <StatusBadge label="Router Active" status="active" />
          <StatusBadge label="Context Ready" status="active" />
        </div>
      )}
    </div>
  );
};

export default Home;