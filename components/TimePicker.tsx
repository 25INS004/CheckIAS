import React, { useState, useEffect, useRef } from 'react';
import { Clock, ChevronDown } from 'lucide-react';

interface TimePickerProps {
  value: string; // HH:mm (24h)
  onChange: (time: string) => void;
  className?: string;
}

const TimePicker: React.FC<TimePickerProps> = ({ value, onChange, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial 24h time to 12h parts
  const parseTime = (timeStr: string) => {
    if (!timeStr) return { hour: 12, minute: 0, period: 'AM' };
    const [h, m] = timeStr.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return { hour, minute: m, period };
  };

  const { hour, minute, period } = parseTime(value);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const updateTime = (newHour: number, newMinute: number, newPeriod: string) => {
    let h = newHour;
    if (newPeriod === 'PM' && h !== 12) h += 12;
    if (newPeriod === 'AM' && h === 12) h = 0;
    
    // Ensure valid ranges
    h = Math.max(0, Math.min(23, h));
    
    const timeStr = `${String(h).padStart(2, '0')}:${String(newMinute).padStart(2, '0')}`;
    onChange(timeStr);
  };

  const scrollToSelected = (container: HTMLDivElement | null, selectedIndex: number) => {
    if (container) {
      const buttonHeight = 32; // Approx header + padding
      container.scrollTop = selectedIndex * 28; // Approx item height
    }
  };

  // Generate arrays
  const hours = Array.from({ length: 12 }, (_, i) => i + 1); // 1-12
  const minutes = Array.from({ length: 60 }, (_, i) => i);   // 0-59

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full px-3 py-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-all
          ${isOpen ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'}
          bg-white dark:bg-gray-900 text-gray-900 dark:text-white
        `}
      >
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium">
            {String(hour).padStart(2, '0')}:{String(minute).padStart(2, '0')} {period}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl flex gap-1 h-64 w-[240px] animate-in fade-in zoom-in-95 duration-100">
          
          {/* Hours Column */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800">
            <div className="text-[10px] uppercase font-bold text-center text-gray-400 mb-2 sticky top-0 bg-white dark:bg-gray-900 py-1">Hrs</div>
            <div className="space-y-1">
              {hours.map(h => (
                <button
                  key={h}
                  type="button"
                  onClick={() => updateTime(h, minute, period)}
                  className={`w-full py-1 rounded text-sm font-medium transition-colors ${
                    h === hour 
                      ? 'bg-indigo-600 text-white' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {String(h).padStart(2, '0')}
                </button>
              ))}
            </div>
          </div>

          {/* Minutes Column */}
           <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800 border-l border-r border-gray-100 dark:border-gray-800">
            <div className="text-[10px] uppercase font-bold text-center text-gray-400 mb-2 sticky top-0 bg-white dark:bg-gray-900 py-1">Min</div>
            <div className="space-y-1">
              {minutes.map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => updateTime(hour, m, period)}
                  className={`w-full py-1 rounded text-sm font-medium transition-colors ${
                    m === minute 
                      ? 'bg-indigo-600 text-white' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {String(m).padStart(2, '0')}
                </button>
              ))}
            </div>
          </div>

          {/* Period Column */}
           <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800">
            <div className="text-[10px] uppercase font-bold text-center text-gray-400 mb-2 sticky top-0 bg-white dark:bg-gray-900 py-1">Am/Pm</div>
            <div className="space-y-1">
              {['AM', 'PM'].map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => updateTime(hour, minute, p)}
                  className={`w-full py-1 rounded text-sm font-medium transition-colors ${
                    p === period 
                      ? 'bg-indigo-600 text-white' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default TimePicker;
