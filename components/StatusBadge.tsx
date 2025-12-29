import React from 'react';
import { Activity, Circle } from 'lucide-react';

interface StatusBadgeProps {
  label: string;
  status: 'active' | 'inactive' | 'loading';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ label, status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'active': return 'text-green-500 bg-green-50 border-green-200';
      case 'inactive': return 'text-slate-400 bg-slate-50 border-slate-200';
      case 'loading': return 'text-amber-500 bg-amber-50 border-amber-200';
      default: return 'text-slate-500';
    }
  };

  return (
    <div className={`flex items-center justify-between p-4 rounded-lg border ${getStatusColor()}`}>
      <div className="flex items-center space-x-3">
        <Activity className="w-5 h-5 opacity-70" />
        <span className="font-medium text-slate-700">{label}</span>
      </div>
      <Circle className={`w-3 h-3 fill-current animate-pulse`} />
    </div>
  );
};

export default StatusBadge;