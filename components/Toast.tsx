import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error';
  onClose: () => void;
}

const Toast = ({ message, type = 'success', onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-in">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border ${
        type === 'success' 
          ? 'bg-white dark:bg-gray-800 border-green-100 dark:border-green-900/50' 
          : 'bg-white dark:bg-gray-800 border-red-100 dark:border-red-900/50'
      }`}>
        <div className={`p-2 rounded-lg ${
          type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
            : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
        }`}>
          {type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
        </div>
        <div>
          <p className={`font-semibold text-sm ${
            type === 'success' ? 'text-gray-900 dark:text-white' : 'text-gray-900 dark:text-white'
          }`}>
            {type === 'success' ? 'Success' : 'Error'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
        </div>
        <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg ml-2 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
