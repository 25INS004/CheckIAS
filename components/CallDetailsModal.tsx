import React from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, Clock, AlignLeft, Info, AlertTriangle } from 'lucide-react';
import { GuidanceCall } from '../hooks/useGuidanceCalls';

interface CallDetailsModalProps {
  call: GuidanceCall | null;
  isOpen: boolean;
  onClose: () => void;
  onCancelCall: (id: string) => Promise<void>;
}

const CallDetailsModal: React.FC<CallDetailsModalProps> = ({
  call,
  isOpen,
  onClose,
  onCancelCall
}) => {
  if (!isOpen || !call) return null;

  const canCancel = call.status === 'Requested' || call.status === 'Scheduled';

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Call Details</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
           {/* Status Badge */}
           <div className="flex items-center justify-between">
             <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</span>
             <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                call.status === 'Scheduled' 
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'
                  : call.status === 'Requested'
                  ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'
                  : call.status === 'Cancelled'
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
                  : 'bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-800'
              }`}>
                {call.status}
              </span>
           </div>

           {/* Topic */}
           <div className="space-y-1">
             <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
               <Info className="w-4 h-4 text-indigo-500" />
               Topic
             </div>
             <p className="text-gray-900 dark:text-white pl-6">{call.topic}</p>
           </div>

           {/* Date & Time */}
           <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1">
               <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                 <Calendar className="w-4 h-4 text-indigo-500" />
                 Date
               </div>
               <p className="text-gray-900 dark:text-white pl-6">{call.requested_date}</p>
             </div>
             <div className="space-y-1">
               <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                 <Clock className="w-4 h-4 text-indigo-500" />
                 Time
               </div>
               <p className="text-gray-900 dark:text-white pl-6">{call.requested_time}</p>
             </div>
           </div>

           {/* Description */}
           <div className="space-y-1">
             <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
               <AlignLeft className="w-4 h-4 text-indigo-500" />
               Description
             </div>
             <p className="text-sm text-gray-600 dark:text-gray-400 pl-6 leading-relaxed">
               {call.description || 'No description provided.'}
             </p>
           </div>

           {/* Cancellation Warning */}
           {canCancel && (
             <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-xl flex gap-3 text-red-800 dark:text-red-200 text-sm">
               <AlertTriangle className="w-5 h-5 flex-shrink-0" />
               <p>
                 Need to reschedule? It's best to cancel this request and book a new slot.
               </p>
             </div>
           )}
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3 bg-gray-50 dark:bg-black/20">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            Close
          </button>
          
          {canCancel && (
            <button
               onClick={() => {
                 if (confirm('Are you sure you want to cancel this call? This action cannot be undone.')) {
                   onCancelCall(call.id);
                   onClose();
                 }
               }}
               className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg transition-colors"
            >
              Cancel Call
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CallDetailsModal;
