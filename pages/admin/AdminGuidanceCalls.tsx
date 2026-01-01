import React, { useState } from 'react';
import { Search, Phone, Calendar, Clock, CheckCircle, XCircle, AlertCircle, ChevronDown, Video } from 'lucide-react';
import ConfirmationModal from '../../components/ConfirmationModal';

// Mock Call Data
const initialCalls = [
  { id: 'CALL-001', user: 'Mike Ross', email: 'mike@law.com', plan: 'Premium', topic: 'Essay Strategy', description: 'Want to discuss essay writing tips for GS papers', timeSlot: '10:00 AM - 11:00 AM', date: '2025-12-30', status: 'Requested' },
  { id: 'CALL-002', user: 'Rachel Green', email: 'rachel@fashion.com', plan: 'Achiever', topic: 'Optional Subject', description: 'Need guidance on choosing optional subject', timeSlot: '02:00 PM - 03:00 PM', date: '2025-12-31', status: 'Confirmed' },
  { id: 'CALL-003', user: 'Harvey Specter', email: 'harvey@law.com', plan: 'Premium', topic: 'Interview Preparation', description: 'Mock interview practice session', timeSlot: '11:00 AM - 12:00 PM', date: '2025-01-02', status: 'Requested' },
];

const AdminGuidanceCalls = () => {
  const [calls, setCalls] = useState(initialCalls);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ type: 'confirm' | 'cancel', id: string } | null>(null);

  const filteredCalls = calls.filter(call => 
    (filterStatus === 'All' || call.status === filterStatus) &&
    (call.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
     call.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
     call.topic.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleConfirmCall = (id: string) => {
    setCalls(calls.map(call => 
      call.id === id ? { ...call, status: 'Confirmed' } : call
    ));
  };

  const handleCancelCall = (id: string) => {
    setCalls(calls.map(call => 
      call.id === id ? { ...call, status: 'Cancelled' } : call
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Guidance Calls</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage and confirm mentorship call requests</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search calls..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none w-64"
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
              onBlur={() => setTimeout(() => setIsStatusDropdownOpen(false), 200)}
              className="flex items-center justify-between w-40 px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            >
              <span className="truncate">{filterStatus === 'All' ? 'All Status' : filterStatus}</span>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isStatusDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            <div className={`absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-10 overflow-hidden transition-all duration-200 origin-top-right ${isStatusDropdownOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
              <div className="py-1">
                {['All', 'Requested', 'Confirmed', 'Cancelled'].map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setFilterStatus(option);
                      setIsStatusDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      filterStatus === option 
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    {option === 'All' ? 'All Status' : option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="px-6 py-4">Call Details</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Scheduled For</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredCalls.map((call) => (
                <tr key={call.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-purple-50 dark:bg-purple-900/40 rounded-lg text-purple-600 dark:text-purple-400 mt-1">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{call.topic}</p>
                        <p className="text-xs text-gray-400 mt-0.5">#{call.id}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs truncate">{call.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900 dark:text-white">{call.user}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{call.email}</p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 mt-1">
                      {call.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-900 dark:text-white font-medium">{call.timeSlot}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(call.date).toLocaleDateString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      call.status === 'Confirmed'
                        ? 'bg-green-50 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-100 dark:border-green-900/50'
                        : call.status === 'Cancelled'
                        ? 'bg-red-50 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-100 dark:border-red-900/50'
                        : 'bg-yellow-50 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 border-yellow-100 dark:border-yellow-900/50'
                    }`}>
                      {call.status === 'Confirmed' ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <Clock className="w-3 h-3" />
                      )}
                      {call.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {call.status === 'Requested' && (
                        <>
                          <button 
                            onClick={() => setConfirmAction({ type: 'confirm', id: call.id })}
                            className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 font-medium text-xs bg-green-50 dark:bg-green-900/40 hover:bg-green-100 dark:hover:bg-green-900/60 px-3 py-1.5 rounded-lg transition-colors border border-green-100 dark:border-green-800"
                          >
                            Confirm
                          </button>
                          <button 
                            onClick={() => setConfirmAction({ type: 'cancel', id: call.id })}
                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium text-xs bg-red-50 dark:bg-red-900/40 hover:bg-red-100 dark:hover:bg-red-900/60 px-3 py-1.5 rounded-lg transition-colors border border-red-100 dark:border-red-800"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredCalls.length === 0 && (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">
              <AlertCircle className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <p>No calls found matching your criteria</p>
            </div>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => {
          if (confirmAction?.type === 'confirm') handleConfirmCall(confirmAction.id);
          else if (confirmAction?.type === 'cancel') handleCancelCall(confirmAction.id);
        }}
        title={confirmAction?.type === 'confirm' ? "Confirm Call?" : "Cancel Call?"}
        message={confirmAction?.type === 'confirm' 
          ? "Are you sure you want to confirm this mentorship call?" 
          : "Are you sure you want to cancel this mentorship call request?"}
        confirmText={confirmAction?.type === 'confirm' ? "Confirm Call" : "Cancel Call"}
        confirmStyle={confirmAction?.type === 'confirm' ? "bg-green-600 hover:bg-green-700 text-white" : "bg-red-600 hover:bg-red-700 text-white"}
      />
    </div>
  );
};

export default AdminGuidanceCalls;
