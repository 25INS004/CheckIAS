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
        <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24" stroke="none">
           <path fillRule="evenodd" clipRule="evenodd" d="M12.2266 2.05835C11.581 2.22822 11.2323 2.92994 11.5273 3.52835C12.3392 5.17604 12.7981 7.03716 12.7981 9.00004C12.7981 15.6274 7.42557 21.0001 0.79812 21.0001C0.375685 21.0001 -0.0264052 21.4326 0.160759 21.8028C2.33383 26.1026 6.78693 29.0001 11.9072 29.0001C18.5346 29.0001 23.9072 23.6275 23.9072 17.0001C23.9072 10.4552 18.6756 5.13222 12.2266 2.05835Z" transform="scale(0.8) translate(6, -2)" />
           {/* Fallback to simple SVG if path is too complex, but this crescent looks decent */}
           <path d="M21.0567 12.3995C20.6728 12.3995 20.2974 12.3789 19.932 12.339C19.8276 14.8643 18.2589 17.1121 15.9926 18.0671C13.7262 19.0221 11.1098 18.5398 9.35147 16.8395C7.59312 15.1392 7.108 12.5539 8.11718 10.3346C9.12635 8.11538 11.4429 6.64332 13.9926 6.64332C13.6271 6.60338 13.2518 6.58282 12.868 6.58282C8.34563 6.58282 4.6792 10.2492 4.6792 14.7716C4.6792 19.294 8.34563 22.9604 12.868 22.9604C17.3904 22.9604 21.0567 19.294 21.0567 14.7716C21.0567 13.951 20.9385 13.1539 20.7139 12.3995H21.0567Z" fill="currentColor"/>
        </svg>
      )}
    </button>
  );
};

export default ThemeToggle;
