import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ id, message, type, duration = 3000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
  };

  const bgColors = {
    success: 'bg-white dark:bg-gray-900 border-green-500/20',
    error: 'bg-white dark:bg-gray-900 border-red-500/20',
    warning: 'bg-white dark:bg-gray-900 border-yellow-500/20',
    info: 'bg-white dark:bg-gray-900 border-blue-500/20',
  };

  return (
    <div className={`flex items-center gap-3 p-4 rounded-xl shadow-lg border ${bgColors[type]} animate-slide-in-right max-w-sm w-full backdrop-blur-sm`}>
      <div className="flex-shrink-0">
        {icons[type]}
      </div>
      <p className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100">{message}</p>
      <button 
        onClick={() => onClose(id)}
        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-gray-500"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;
