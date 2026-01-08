import React, { useState, useEffect } from 'react';
import { Search, MessageSquare, CheckCircle, Clock, AlertCircle, ChevronDown, Filter } from 'lucide-react';
import NotesModal from '../../components/NotesModal';
import Toast from '../../components/Toast';
import RefreshButton from '../../components/RefreshButton';
import Pagination from '../../components/Pagination';
import { useAutoRefresh } from '../../hooks/useAutoRefresh';

interface Ticket {
  id: string;
  ticket_number: string;
  subject: string;
  status: string;
  priority: string;
  created_at: string;
  category: string;
  description: string;
  user_id: string;
  admin_response?: string;
  profiles: {
    full_name: string;
    email: string;
  } | null;
}

const AdminTickets = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isPriorityDropdownOpen, setIsPriorityDropdownOpen] = useState(false);
  
  // Response Modal State
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [viewResponseTicket, setViewResponseTicket] = useState<Ticket | null>(null);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const fetchTickets = async (background = false) => {
    if (!background) setLoading(true);
    try {
      const token = localStorage.getItem('supabase.auth.token') || sessionStorage.getItem('supabase.auth.token');
      if (!token) throw new Error('Not authenticated');
      const { currentSession } = JSON.parse(token);
      const accessToken = currentSession?.access_token;

      const headers = {
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${accessToken}`,
      };

      // 1. Fetch Tickets
      const ticketsUrl = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/support_tickets?select=*&order=created_at.desc`;
      const ticketsRes = await fetch(ticketsUrl, { headers });
      
      if (!ticketsRes.ok) throw new Error(await ticketsRes.text());
      const ticketsData = await ticketsRes.json();

      // 2. Fetch Profiles for User Info
      const profilesRes = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles?select=id,full_name,email`,
        { headers }
      );
      
      if (!profilesRes.ok) throw new Error(await profilesRes.text());
      const profilesData = await profilesRes.json();

      // 3. Merge Data
      const profileMap = new Map(profilesData?.map((p: any) => [p.id, p]));
      
      const mergedTickets = (ticketsData || []).map((ticket: any) => ({
        ...ticket,
        profiles: profileMap.get(ticket.user_id) || { full_name: 'Unknown User', email: 'No email' }
      }));

      setTickets(mergedTickets);
    } catch (err) {
      console.error('Error fetching tickets:', err);
      // Don't show toast on initial load error to avoid spamming if just empty
      setToast({ message: 'Failed to fetch tickets. Please try again.', type: 'error' });
    } finally {
      if (!background) setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  useAutoRefresh(() => fetchTickets(true));

  const handleResolve = async (response: string) => {
    if (!activeTicketId) return;

    try {
      const token = localStorage.getItem('supabase.auth.token') || sessionStorage.getItem('supabase.auth.token');
      if (!token) throw new Error('Not authenticated');
      const { currentSession } = JSON.parse(token);
      const accessToken = currentSession?.access_token;

      const headers = {
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      };

      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/support_tickets?id=eq.${activeTicketId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          status: 'Resolved',
          admin_response: response
        })
      });

      if (!res.ok) {
         const errText = await res.text();
         throw new Error(errText);
      }

      setToast({ message: 'Ticket resolved successfully!', type: 'success' });
      fetchTickets(); // Refresh list
      setActiveTicketId(null);
    } catch (err) {
      console.error('Error resolving ticket:', err);
      setToast({ message: 'Failed to resolve ticket. Ensure admin_response column exists.', type: 'error' });
    }
  };

  const filteredTickets = tickets.filter(ticket => 
    (filterStatus === 'All' || ticket.status === filterStatus) &&
    (filterCategory === 'All' || ticket.category === filterCategory) &&
    (filterPriority === 'All' || ticket.priority === filterPriority) &&
    (
      (ticket.profiles?.full_name || 'Unknown').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (ticket.profiles?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ticket.ticket_number || ticket.id).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const categories = ['All', 'General', 'Technical Support', 'Billing & Payments', 'Account Issues', 'Other'];
  const priorities = ['All', 'Low', 'Medium', 'High', 'Critical'];

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Support Tickets</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage and respond to user support requests</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">{tickets.length}</p>
              <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400">Total Tickets</p>
            </div>
          </div>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{tickets.filter(t => t.status !== 'Resolved').length}</p>
              <p className="text-xs font-medium text-orange-600 dark:text-orange-400">Open Tickets</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">{tickets.filter(t => t.status === 'Resolved').length}</p>
              <p className="text-xs font-medium text-green-600 dark:text-green-400">Resolved</p>
            </div>
          </div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-700 dark:text-red-300">{tickets.filter(t => t.priority === 'High' || t.priority === 'Critical').length}</p>
              <p className="text-xs font-medium text-red-600 dark:text-red-400">High Priority</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <RefreshButton onClick={() => fetchTickets()} loading={loading} />
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none w-64 shadow-sm"
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
              onBlur={() => setTimeout(() => setIsStatusDropdownOpen(false), 200)}
              className="flex items-center justify-between w-36 px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
            >
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="truncate">{filterStatus === 'All' ? 'All Status' : filterStatus}</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isStatusDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            <div className={`absolute left-0 mt-2 w-36 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-10 overflow-hidden transition-all duration-200 origin-top-left ${isStatusDropdownOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
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

          {/* Category Filter */}
          <div className="relative">
            <button
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
              onBlur={() => setTimeout(() => setIsCategoryDropdownOpen(false), 200)}
              className="flex items-center justify-between w-44 px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
            >
              <span className="truncate">{filterCategory === 'All' ? 'All Categories' : filterCategory}</span>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            <div className={`absolute left-0 mt-2 w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-10 overflow-hidden transition-all duration-200 origin-top-left ${isCategoryDropdownOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
              <div className="py-1">
                {categories.map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setFilterCategory(option);
                      setIsCategoryDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      filterCategory === option 
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    {option === 'All' ? 'All Categories' : option}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Priority Filter */}
          <div className="relative">
            <button
              onClick={() => setIsPriorityDropdownOpen(!isPriorityDropdownOpen)}
              onBlur={() => setTimeout(() => setIsPriorityDropdownOpen(false), 200)}
              className="flex items-center justify-between w-36 px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
            >
              <span className="truncate">{filterPriority === 'All' ? 'All Priority' : filterPriority}</span>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isPriorityDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            <div className={`absolute left-0 mt-2 w-36 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-10 overflow-hidden transition-all duration-200 origin-top-left ${isPriorityDropdownOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
              <div className="py-1">
                {priorities.map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setFilterPriority(option);
                      setIsPriorityDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      filterPriority === option 
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    {option === 'All' ? 'All Priority' : option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto">
          {loading ? (
             <div className="p-20 text-center text-gray-500">Loading tickets...</div>
          ) : (
             <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="px-6 py-4">Ticket ID</th>
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Response</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredTickets
                  .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                  .map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/40 rounded-lg text-indigo-600 dark:text-indigo-400">
                          <MessageSquare className="w-4 h-4" />
                        </div>
                        <p className="font-mono text-sm text-gray-900 dark:text-white">#{ticket.ticket_number || ticket.id.slice(0,8)}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900 dark:text-white max-w-xs">{ticket.subject}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">{ticket.category || 'General'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900 dark:text-white">{ticket.profiles?.full_name || 'Unknown User'}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{ticket.profiles?.email || 'No email'}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {new Date(ticket.created_at).toLocaleDateString()}
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
                    <td className="px-6 py-4">
                      {ticket.admin_response ? (
                        <button
                          onClick={() => setViewResponseTicket(ticket)}
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium text-xs bg-indigo-50 dark:bg-indigo-900/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 px-3 py-1.5 rounded-lg transition-colors border border-indigo-100 dark:border-indigo-800"
                        >
                          View Response
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Awaiting</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {ticket.status !== 'Resolved' ? (
                        <button 
                          onClick={() => setActiveTicketId(ticket.id)}
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium text-xs bg-indigo-50 dark:bg-indigo-900/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 px-3 py-1.5 rounded-lg transition-colors border border-indigo-100 dark:border-indigo-800"
                        >
                          Resolve
                        </button>
                      ) : (
                         <span className="text-xs text-green-600 dark:text-green-400 font-medium">Resolved</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loading && filteredTickets.length === 0 && (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">
              <AlertCircle className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <p>No tickets found matching your criteria</p>
            </div>
          )}
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredTickets.length / ITEMS_PER_PAGE)}
            onPageChange={setCurrentPage}
            totalItems={filteredTickets.length}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        </div>
      </div>

      <NotesModal
        isOpen={!!activeTicketId}
        onClose={() => setActiveTicketId(null)}
        onSave={handleResolve}
        initialNotes=""
        title="Resolve Ticket"
        subtitle="Provide a response to the user. This will mark the ticket as Resolved."
        placeholder="Enter your response/solution here..."
      />

      {/* View Response Modal */}
      {viewResponseTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setViewResponseTicket(null)}>
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-lg w-full mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Admin Response</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Ticket: #{viewResponseTicket.ticket_number || viewResponseTicket.id.slice(0,8)}</p>
            </div>
            <div className="px-6 py-4">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{viewResponseTicket.admin_response}</p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex justify-end">
              <button
                onClick={() => setViewResponseTicket(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTickets;
