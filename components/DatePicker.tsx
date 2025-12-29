import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown, X } from 'lucide-react';

interface DatePickerProps {
  value?: string;
  onChange: (date: string) => void;
  placeholder?: string;
  className?: string;
  min?: string;
  max?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({ 
  value, 
  onChange, 
  placeholder = "Select date", 
  className = "",
  min,
  max
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(value ? new Date(value) : null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      setSelectedDate(new Date(value));
      setCurrentMonth(new Date(value));
    } else {
      setSelectedDate(null);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    return { days, firstDay };
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    // Adjust for timezone offset to ensure string format is correct local YYYY-MM-DD
    const offset = newDate.getTimezoneOffset();
    const date = new Date(newDate.getTime() - (offset*60*1000));
    const dateString = date.toISOString().split('T')[0];
    
    onChange(dateString);
    setSelectedDate(newDate);
    setIsOpen(false);
  };

  const clearDate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSelectedDate(null);
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    // Don't select, just navigate
  };

  const { days, firstDay } = getDaysInMonth(currentMonth);
  const today = new Date();
  
  // Generate calendar grid
  const daysArray = [];
  for (let i = 0; i < firstDay; i++) {
    daysArray.push(<div key={`empty-${i}`} className="h-8 w-8" />);
  }
  for (let d = 1; d <= days; d++) {
    const dateToCheck = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d);
    const isSelected = selectedDate && 
      dateToCheck.getDate() === selectedDate.getDate() && 
      dateToCheck.getMonth() === selectedDate.getMonth() && 
      dateToCheck.getFullYear() === selectedDate.getFullYear();
    
    const isToday = 
      dateToCheck.getDate() === today.getDate() && 
      dateToCheck.getMonth() === today.getMonth() && 
      dateToCheck.getFullYear() === today.getFullYear();

    daysArray.push(
      <button
        key={d}
        onClick={() => handleDateClick(d)}
        className={`h-8 w-8 rounded-lg flex items-center justify-center text-sm transition-colors
          ${isSelected 
            ? 'bg-indigo-600 text-white font-medium shadow-sm' 
            : isToday 
              ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/50' 
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          }
        `}
      >
        {d}
      </button>
    );
  }

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
          isOpen 
            ? 'border-indigo-500 ring-2 ring-indigo-500/20' 
            : 'border-gray-300 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-700'
        } bg-white dark:bg-gray-900 text-gray-900 dark:text-white`}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <CalendarIcon className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
          <span className={`text-sm truncate ${!selectedDate ? 'text-gray-400 dark:text-gray-500' : ''}`}>
            {selectedDate ? selectedDate.toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            }) : placeholder}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {selectedDate && (
            <button 
              onClick={clearDate}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          )}
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl w-[280px] animate-in fade-in zoom-in-95 duration-100">
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={prevMonth}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </span>
            <button 
              onClick={nextMonth}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className="h-8 flex items-center justify-center text-xs font-medium text-gray-400 dark:text-gray-500">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {daysArray}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-end">
            <button 
              onClick={goToToday}
              className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
