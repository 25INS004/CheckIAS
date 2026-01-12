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

  const [view, setView] = useState<'days' | 'years'>('days');
  const [yearRangeStart, setYearRangeStart] = useState(new Date().getFullYear() - 5); // Show 12 years centered around current

  // Update year range when current month changes (e.g. from props)
  useEffect(() => {
    setYearRangeStart(currentMonth.getFullYear() - 5);
  }, [currentMonth]);

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
        setView('days'); // Reset view on close
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

  const handleYearClick = (year: number) => {
    setCurrentMonth(new Date(year, currentMonth.getMonth(), 1));
    setView('days');
  };

  const clearDate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSelectedDate(null);
  };

  const next = () => {
    if (view === 'days') {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    } else {
      setYearRangeStart(prev => prev + 12);
    }
  };

  const prev = () => {
    if (view === 'days') {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    } else {
      setYearRangeStart(prev => prev - 12);
    }
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setView('days');
    setYearRangeStart(today.getFullYear() - 5);
  };

  const toggleView = () => {
    setView(v => v === 'days' ? 'years' : 'days');
  };

  // Render Days Grid
  const renderDays = () => {
    const { days, firstDay } = getDaysInMonth(currentMonth);
    const today = new Date();
    const daysArray = [];

    // Calendar Headers
    const headers = (
      <div className="grid grid-cols-7 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} className="h-8 flex items-center justify-center text-xs font-medium text-gray-400 dark:text-gray-500">
            {day}
          </div>
        ))}
      </div>
    );

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
      <>
        {headers}
        <div className="grid grid-cols-7 gap-1">
          {daysArray}
        </div>
      </>
    );
  };

  // Render Years Grid
  const renderYears = () => {
    const years = [];
    const currentYear = new Date().getFullYear();
    const selectedYear = selectedDate?.getFullYear();

    for (let i = 0; i < 12; i++) {
      const year = yearRangeStart + i;
      const isSelected = selectedYear === year;
      const isCurrent = currentYear === year;

      years.push(
        <button
          key={year}
          onClick={() => handleYearClick(year)}
          className={`h-10 rounded-lg flex items-center justify-center text-sm transition-colors
            ${isSelected 
              ? 'bg-indigo-600 text-white font-medium shadow-sm' 
              : isCurrent
                ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/50'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }
          `}
        >
          {year}
        </button>
      );
    }

    return (
      <div className="grid grid-cols-3 gap-2 py-2">
        {years}
      </div>
    );
  };

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
              onClick={prev}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={toggleView}
              className="text-sm font-semibold text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1 rounded-md transition-colors flex items-center gap-1"
            >
              {view === 'days' 
                ? `${months[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`
                : `${yearRangeStart} - ${yearRangeStart + 11}`
              }
              <ChevronDown className={`w-3 h-3 text-gray-500 transition-transform ${view === 'years' ? 'rotate-180' : ''}`} />
            </button>
            <button 
              onClick={next}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {view === 'days' ? renderDays() : renderYears()}

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
