import React from 'react';
import { RefreshCw } from 'lucide-react';

interface RefreshButtonProps {
  onClick: () => void;
  loading?: boolean;
}

const RefreshButton = ({ onClick, loading = false }: RefreshButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="p-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-xl transition-all border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 shadow-sm dark:shadow-lg dark:shadow-gray-900/20 active:scale-95"
      title="Refresh"
    >
      <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
    </button>
  );
};

export default RefreshButton;
