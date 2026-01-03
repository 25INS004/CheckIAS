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
      className="p-2.5 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-xl transition-all border border-gray-700 hover:border-gray-600 shadow-lg shadow-gray-900/20 active:scale-95"
      title="Refresh"
    >
      <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
    </button>
  );
};

export default RefreshButton;
