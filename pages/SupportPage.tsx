import React, { useState } from 'react';
import { LifeBuoy, MessageSquare, Plus, Minus, Send, HelpCircle, Calendar, Flag, ChevronDown, Lock } from 'lucide-react';
import DatePicker from '../components/DatePicker';
import { useUser } from '../context/UserContext';

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
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<'support' | 'faq'>('support');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  // Ticket State
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch tickets on mount
  React.useEffect(() => {
    if (user?.id) {
      fetchTickets();
    }
  }, [user]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
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
      console.error('Error fetching tickets:', err);
    } finally {
      setLoading(false);
    }
  };
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    category: 'General',
    priority: 'Medium',
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

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const token = getAccessToken();
      if (!token) {
        alert('Authentication error. Please login again.');
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
        setNewTicket({ subject: '', category: 'General', priority: 'Medium', date: new Date().toISOString().split('T')[0], description: '' });
        setShowTicketForm(false);
      }
    } catch (err: any) {
      console.error('Error creating ticket:', err);
      alert(`Failed to create ticket: ${err.message}`);
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
                <button 
                  onClick={() => setShowTicketForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none"
                >
                  <Plus className="w-4 h-4" />
                  Raise Ticket
                </button>
              </div>

              {tickets.length > 0 ? (
                <div className="grid gap-4">
                  {tickets.map((ticket) => (
                    <div key={ticket.id} className="bg-white dark:bg-gray-950 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-xl ${
                             ticket.status === 'Resolved' 
                               ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                               : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                          }`}>
                            <MessageSquare className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                              {ticket.subject}
                              <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                                {ticket.category}
                              </span>
                              <span className={`text-xs font-normal px-2 py-0.5 rounded-full ${
                                ticket.priority === 'High' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                                ticket.priority === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
                                'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                              }`}>
                                {ticket.priority} Priority
                              </span>
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{ticket.description}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                              ID: {ticket.ticket_number} • Raised on {new Date(ticket.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span className={`self-start sm:self-center px-3 py-1 rounded-full text-xs font-medium border ${
                          ticket.status === 'Resolved'
                            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'
                            : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'
                        }`}>
                          {ticket.status}
                        </span>
                      </div>
                    </div>
                  ))}
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
                                setNewTicket({...newTicket, category: cat});
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
                   
                   <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priority</label>
                      <div className="flex items-center gap-3">
                        {priorities.map((prio) => (
                          <button
                            key={prio}
                            type="button"
                            onClick={() => setNewTicket({...newTicket, priority: prio})}
                            className={`flex-1 px-3 py-2.5 text-sm font-medium rounded-lg border transition-all ${
                              newTicket.priority === prio
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-800 hover:border-indigo-500'
                            }`}
                          >
                            {prio}
                          </button>
                        ))}
                      </div>
                   </div>
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
    </div>
  );
};

export default SupportPage;
