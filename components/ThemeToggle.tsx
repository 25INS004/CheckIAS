import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        p-2.5 rounded-xl transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500
        ${theme === 'dark' 
          ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700 hover:text-yellow-300 shadow-sm border border-gray-700' 
          : 'bg-white text-indigo-600 hover:bg-indigo-50 border border-gray-200 shadow-sm hover:shadow'}
      `}
      aria-label="Toggle Dark Mode"
    >
      {theme === 'dark' ? (
        // Modern Sun Icon
        <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24" stroke="none">
           <path d="M12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17Z" />
           <path d="M12 1V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
           <path d="M12 21V23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
           <path d="M4.22 4.22L5.64 5.64" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
           <path d="M18.36 18.36L19.78 19.78" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
           <path d="M1 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
           <path d="M21 12H23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
           <path d="M4.22 19.78L5.64 18.36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
           <path d="M18.36 5.64L19.78 4.22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ) : (
        // Modern Moon Icon
        <Moon className="w-5 h-5 flex-shrink-0" fill="currentColor" />
      )}
    </button>
  );
};

export default ThemeToggle;
