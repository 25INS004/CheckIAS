import React, { useState } from 'react';
import { Search, MessageSquare, CheckCircle, Clock, AlertCircle, ChevronDown } from 'lucide-react';
import ConfirmationModal from '../../components/ConfirmationModal';

// Mock Ticket Data
const mockTickets = [
  { id: 'TKT-001', user: 'John Doe', email: 'john@example.com', subject: 'Evaluation Delay', status: 'Open', priority: 'High', date: '2025-12-28' },
  { id: 'TKT-002', user: 'Sarah Smith', email: 'sarah@test.com', subject: 'Payment Issue', status: 'Resolved', priority: 'Critical', date: '2025-12-27' },
  { id: 'TKT-003', user: 'Mike Ross', email: 'mike@law.com', subject: 'PDF Upload Error', status: 'Open', priority: 'Medium', date: '2025-12-29' },
  { id: 'TKT-004', user: 'Rachel Green', email: 'rachel@fashion.com', subject: 'Plan Upgrade Query', status: 'Open', priority: 'Low', date: '2025-12-29' },
  { id: 'TKT-005', user: 'Harvey Specter', email: 'harvey@law.com', subject: 'Login Issues', status: 'Resolved', priority: 'High', date: '2025-12-26' },
];

const AdminTickets = () => {
  const [tickets, setTickets] = useState(mockTickets);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [confirmResolveId, setConfirmResolveId] = useState<string | null>(null);

  const filteredTickets = tickets.filter(ticket => 
    (filterStatus === 'All' || ticket.status === filterStatus) &&
    (ticket.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
     ticket.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
     ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleResolve = (id: string) => {
    setTickets(tickets.map(t => t.id === id ? { ...t, status: 'Resolved' } : t));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Support Tickets</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage user support requests</p>
        </div>
        
        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-400 dark:text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search tickets..."
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
                {['All', 'Open', 'Resolved'].map((option) => (
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
                <th className="px-6 py-4">Ticket Details</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-indigo-50 dark:bg-indigo-900/40 rounded-lg text-indigo-600 dark:text-indigo-400 mt-1">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{ticket.subject}</p>
                        <p className="text-xs text-gray-400 mt-0.5">#{ticket.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900 dark:text-white">{ticket.user}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{ticket.email}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                    {new Date(ticket.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      ticket.priority === 'High' || ticket.priority === 'Critical'
                        ? 'bg-red-50 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-100 dark:border-red-900/50'
                        : ticket.priority === 'Medium'
                        ? 'bg-yellow-50 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 border-yellow-100 dark:border-yellow-900/50'
                        : 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-900/50'
                    }`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      ticket.status === 'Resolved'
                        ? 'bg-green-50 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-100 dark:border-green-900/50'
                        : 'bg-orange-50 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 border-orange-100 dark:border-orange-900/50'
                    }`}>
                      {ticket.status === 'Resolved' ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <Clock className="w-3 h-3" />
                      )}
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {ticket.status !== 'Resolved' && (
                      <button 
                        onClick={() => setConfirmResolveId(ticket.id)}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium text-xs bg-indigo-50 dark:bg-indigo-900/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 px-3 py-1.5 rounded-lg transition-colors border border-indigo-100 dark:border-indigo-800"
                      >
                        Resolve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredTickets.length === 0 && (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">
              <AlertCircle className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <p>No tickets found matching your criteria</p>
            </div>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={!!confirmResolveId}
        onClose={() => setConfirmResolveId(null)}
        onConfirm={() => {
          if (confirmResolveId) handleResolve(confirmResolveId);
        }}
        title="Resolve Ticket?"
        message="Are you sure you want to mark this ticket as resolved?"
        confirmText="Resolve Ticket"
        confirmStyle="bg-green-600 hover:bg-green-700 text-white"
      />
    </div>
  );
};

export default AdminTickets;

