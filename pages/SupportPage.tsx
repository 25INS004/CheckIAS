import React, { useState } from 'react';
import { LifeBuoy, MessageSquare, Plus, Minus, Send, HelpCircle, Calendar, Flag, ChevronDown, Lock, Megaphone, X } from 'lucide-react';
import DatePicker from '../components/DatePicker';
import { useUser } from '../context/UserContext';
import RefreshButton from '../components/RefreshButton';
import Pagination from '../components/Pagination';
import { useAutoRefresh } from '../hooks/useAutoRefresh';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabase';

// Helper to get access token
const getAccessToken = () => {
  try {
    const localData = localStorage.getItem('supabase.auth.token');
    const sessionData = sessionStorage.getItem('supabase.auth.token');
    const data = localData || sessionData;
    if (data) {
      return JSON.parse(data).currentSession?.access_token;
    }
  } catch (e) {
    console.error('Error getting access token:', e);
  }
  return null;
};

const SupportPage = ({ hideHeader = false }: { hideHeader?: boolean }) => {
  const { user, refreshUser } = useUser();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'support' | 'faq'>('support');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  // Ticket State
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewTicketResponse, setViewTicketResponse] = useState<any | null>(null);
  const [ticketsPage, setTicketsPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  
  // Fetch tickets on mount
  React.useEffect(() => {
    if (user?.id) {
      fetchTickets();
    }
  }, [user]);

  const fetchTickets = async (background = false) => {
    try {
      if (!background) setLoading(true);
      const token = getAccessToken();
      if (!token) return;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/support_tickets?user_id=eq.${user?.id}&select=*&order=created_at.desc`,
        {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${token}`
          }
        }
      );
        
      if (!response.ok) throw new Error('Failed to fetch tickets');
      const data = await response.json();
      setTickets(data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      if (!background) setLoading(false);
    }
  };

  useAutoRefresh(() => fetchTickets(true));
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    category: 'Login Issues', // Default to a valid category
    priority: 'High', // Matches Login Issues
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const faqs = [
    { id: 1, question: "How long does evaluation take?", answer: "Evaluations are typically completed within 24-48 hours depending on your plan and current volume." },
    { id: 2, question: "Can I upgrade my plan later?", answer: "Yes, you can upgrade your plan at any time from the Dashboard or Settings page. The benefits are applied immediately." },
    { id: 3, question: "What file formats are supported?", answer: "We support PDF uploads for answer copies. Please ensure your file is clear and legible." },
    { id: 4, question: "How do guidance calls work?", answer: "Premium members can book 1-on-1 calls with mentors. Select a time slot, provide a topic, and we'll confirm the meeting details." },
    { id: 5, question: "What if I miss my scheduled call?", answer: "Please try to reschedule at least 24 hours in advance. Missed calls without notice may count against your monthly quota." },
  ];

  const categories = [
    "Login Issues",
    "Sign Up Issues",
    "Billing & Payments",
    "Technical Support",
    "Evaluation Queries",
    "Custom Issue"
  ];

  const priorities = ["Low", "Medium", "High"];

  const getPriority = (category: string) => {
    switch (category) {
      case "Billing & Payments":
      case "Technical Support":
      case "Login Issues":
        return "High";
      case "Sign Up Issues":
      case "Custom Issue":
        return "Medium";
      default:
        return "Low";
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const token = getAccessToken();
      if (!token) {
        toast.error('Authentication error. Please login again.');
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/support_tickets`,
        {
          method: 'POST',
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            user_id: user.id,
            subject: newTicket.subject,
            category: newTicket.category,
            priority: newTicket.priority,
            description: newTicket.description,
            status: 'Open'
          })
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to create ticket');
      }

      const data = await response.json();

      if (data && data.length > 0) {
        setTickets([data[0], ...tickets]);
        setNewTicket({ subject: '', category: 'Login Issues', priority: 'High', date: new Date().toISOString().split('T')[0], description: '' });
        setShowTicketForm(false);
        refreshUser(); // Refresh dashboard stats
        toast.success('Ticket created successfully!');
      }
    } catch (err: any) {
      console.error('Error creating ticket:', err);
      toast.error(`Failed to create ticket: ${err.message}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      {!hideHeader && (
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Help & Support</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Get assistance with your queries and manage requests</p>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('support')}
            className={`flex items-center gap-2 py-4 px-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'support'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-medium'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <LifeBuoy className="w-4 h-4" />
            My Tickets
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`flex items-center gap-2 py-4 px-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'faq'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-medium'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            FAQ
          </button>
        </div>
      </div>
      
      {/* Support / Tickets Content */}
      {activeTab === 'support' && (
        <div className="space-y-6 animate-fade-in">
          {user?.plan === 'Free' ? (
             <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-12 text-center relative overflow-hidden group">
                  <a href="/pricing" className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/60 dark:bg-black/60 backdrop-blur-sm transition-all hover:bg-white/50 dark:hover:bg-black/50">
                       <div className="p-4 bg-indigo-600 rounded-full shadow-lg mb-4 transform group-hover:scale-110 transition-transform">
                          <Lock className="w-8 h-8 text-white" />
                       </div>
                       <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Premium Support Locked</h3>
                       <p className="text-gray-600 dark:text-gray-300 font-medium">Upgrade to Pro to raise priority tickets</p>
                  </a>
                  <div className="blur-sm opacity-50 pointer-events-none select-none">
                       {/* Mock Content for Visuals */}
                       <div className="space-y-4">
                           <div className="bg-white dark:bg-gray-950 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
                                <div className="space-y-2">
                                     <div className="w-48 h-5 bg-gray-200 dark:bg-gray-800 rounded"></div>
                                     <div className="w-32 h-4 bg-gray-100 dark:bg-gray-900 rounded"></div>
                                </div>
                                <div className="w-20 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-full"></div>
                           </div>
                           <div className="bg-white dark:bg-gray-950 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
                                <div className="space-y-2">
                                     <div className="w-56 h-5 bg-gray-200 dark:bg-gray-800 rounded"></div>
                                     <div className="w-40 h-4 bg-gray-100 dark:bg-gray-900 rounded"></div>
                                </div>
                                <div className="w-20 h-8 bg-green-100 dark:bg-green-900/30 rounded-full"></div>
                           </div>
                       </div>
                  </div>
             </div>
          ) : !showTicketForm ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Support Tickets</h3>
                <div className="flex items-center gap-3">
                  <RefreshButton onClick={() => fetchTickets()} loading={loading} />
                  <button 
                    onClick={() => setShowTicketForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none"
                  >
                    <Plus className="w-4 h-4" />
                    Raise Ticket
                  </button>
                </div>
              </div>

              {tickets.length > 0 ? (
                <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                        <tr>
                          <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ticket ID</th>
                          <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Subject</th>
                          <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                          <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                          <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                          <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Response</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {tickets
                          .slice((ticketsPage - 1) * ITEMS_PER_PAGE, ticketsPage * ITEMS_PER_PAGE)
                          .map((ticket) => (
                          <tr key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white uppercase">{ticket.ticket_number}</td>
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{ticket.subject}</td>
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{ticket.category}</td>
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{new Date(ticket.created_at).toLocaleDateString()}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                                ticket.status === 'Resolved' || ticket.status === 'Closed'
                                  ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300'
                                  : ticket.status === 'Open' || ticket.status === 'Pending'
                                  ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300'
                                  : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
                              }`}>
                                {ticket.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {ticket.admin_response ? (
                                <button
                                  onClick={() => setViewTicketResponse(ticket)}
                                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium text-xs bg-indigo-50 dark:bg-indigo-900/40 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors border border-indigo-100 dark:border-indigo-800"
                                >
                                  View Response
                                </button>
                              ) : (
                                <span className="text-gray-500 dark:text-gray-400 font-medium text-xs bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700">
                                  Awaiting
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Pagination
                    currentPage={ticketsPage}
                    totalPages={Math.ceil(tickets.length / ITEMS_PER_PAGE)}
                    onPageChange={setTicketsPage}
                    totalItems={tickets.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                  />
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-12 text-center">
                   <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center mx-auto mb-6">
                     <LifeBuoy className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                   </div>
                   <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No tickets found</h3>
                   <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">Need help? Raise a new support ticket and we'll get back to you shortly.</p>
                   <button 
                      onClick={() => setShowTicketForm(true)}
                      className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                   >
                      Raise your first ticket
                   </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden animate-fade-in max-w-2xl mx-auto">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Create New Support Ticket</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Fill in the details below to get assistance.</p>
                </div>
                <button 
                  onClick={() => setShowTicketForm(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  <Minus className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleCreateTicket} className="p-6 space-y-6">
                 <div className="grid md:grid-cols-2 gap-6">
                   <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                          onBlur={() => setTimeout(() => setIsCategoryOpen(false), 200)}
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-left flex items-center justify-between transition-all"
                        >
                          <span>{newTicket.category}</span>
                          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
                        </button>
                        
                        <div className={`absolute top-full left-0 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg z-20 overflow-hidden transition-all origin-top ${isCategoryOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                          {categories.map((cat) => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => {
                                const priority = getPriority(cat);
                                setNewTicket({...newTicket, category: cat, priority});
                                setIsCategoryOpen(false);
                              }}
                              className={`w-full px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${newTicket.category === cat ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : 'text-gray-900 dark:text-white'}`}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      </div>
                   </div>
                   
                   {/* Priority is auto-assigned but hidden from user */}
                 </div>

                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject</label>
                    <input 
                      type="text"
                      required
                      value={newTicket.subject}
                      onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                      placeholder="e.g. Payment deduction issue"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                 </div>
                 
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Incident Date</label>
                    <DatePicker
                      value={newTicket.date}
                      onChange={(date) => setNewTicket({ ...newTicket, date })}
                      placeholder="Select Date"
                      max={new Date().toISOString().split('T')[0]} 
                    />
                    <p className="text-xs text-gray-500 mt-1">When did this issue occur?</p>
                 </div>

                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                    <textarea 
                      rows={4}
                      required
                      value={newTicket.description}
                      onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                      placeholder="Please describe your issue in detail..."
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                    />
                 </div>

                 <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowTicketForm(false)}
                      className="px-6 py-2.5 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-2 px-8 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
                    >
                       <Send className="w-4 h-4" />
                       Submit Ticket
                    </button>
                 </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* FAQ Content */}
      {activeTab === 'faq' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h3>
            <div className="space-y-2">
              {faqs.map((faq) => (
                <div key={faq.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <button
                    onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                    className="w-full py-4 flex items-center justify-between text-left group"
                  >
                    <span className="font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {faq.question}
                    </span>
                    {openFaq === faq.id ? (
                      <Minus className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Plus className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                  <div 
                    className={`overflow-hidden transition-all duration-300 ${openFaq === faq.id ? 'max-h-40 opacity-100 pb-4' : 'max-h-0 opacity-0'}`}
                  >
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Admin Response Modal */}
      {viewTicketResponse && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setViewTicketResponse(null)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Admin Response</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Ticket: {viewTicketResponse.ticket_number}</p>
              </div>
              <button onClick={() => setViewTicketResponse(null)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{viewTicketResponse.admin_response}</p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-800 flex justify-end">
              <button onClick={() => setViewTicketResponse(null)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportPage;
