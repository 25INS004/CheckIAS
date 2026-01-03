import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, FileText, Plus, Phone, MessageSquare, Clock, CheckCircle, AlertCircle, Calendar, RefreshCw, X } from 'lucide-react';
import RefreshButton from '../components/RefreshButton';
import { useSubmissions } from '../hooks/useSubmissions';
import { useGuidanceCalls } from '../hooks/useGuidanceCalls';
import { supabase } from '../lib/supabase';
import NotesModal from '../components/NotesModal';

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
import { useUser } from '../context/UserContext';


type TabType = 'submissions' | 'guidance' | 'support';

const HistoryPage = () => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<TabType>('submissions');
  
  // Use real hooks for data
  const { submissions, loading: submissionsLoading, fetchSubmissions } = useSubmissions();
  const { calls: guidanceCalls, loading: callsLoading, updateCall, fetchCalls } = useGuidanceCalls();

  // Support Tickets State
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [activeNoteCallId, setActiveNoteCallId] = useState<string | null>(null);
  const [viewTicketResponse, setViewTicketResponse] = useState<any | null>(null);

  const fetchTickets = React.useCallback(async () => {
    if (!user) return;
    setTicketsLoading(true);
    try {
      const token = getAccessToken();
      if (!token) return;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/support_tickets?user_id=eq.${user.id}&select=*&order=created_at.desc`,
        {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) throw new Error('Failed to fetch tickets');
      const data = await response.json();
      setSupportTickets(data || []);
    } catch (err) {
      console.error('Error fetching tickets:', err);
    } finally {
      setTicketsLoading(false);
    }
  }, [user]);

  React.useEffect(() => {
    if (activeTab === 'support') {
      fetchTickets();
    }
  }, [user, activeTab, fetchTickets]);

  // Realtime subscription for tickets
  React.useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('history-tickets')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'support_tickets', filter: `user_id=eq.${user.id}` },
        () => fetchTickets()
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, fetchTickets]);

  const handleRefresh = () => {
    if (activeTab === 'submissions') fetchSubmissions();
    else if (activeTab === 'guidance') fetchCalls();
    else if (activeTab === 'support') fetchTickets();
  };

  const isRefreshing = 
    (activeTab === 'submissions' && submissionsLoading) ||
    (activeTab === 'guidance' && callsLoading) ||
    (activeTab === 'support' && ticketsLoading);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'checked':
      case 'evaluated':
      case 'completed':
      case 'resolved':
      case 'closed':
      case 'confirmed':
        return 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300';
      case 'pending':
      case 'open':
        return 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300';
      case 'under review':
        return 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300';
      case 'cancelled':
        return 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Activity History</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">View your past submissions, calls, and support tickets</p>
        </div>
        
        {activeTab === 'submissions' && (
          <Link
            to="/dashboard/submit"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
          >
            <Plus className="w-4 h-4" />
            New Submission
          </Link>
        )}
        {activeTab === 'guidance' && (
          <Link
            to="/dashboard/guidance-calls"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
          >
            <Phone className="w-4 h-4" />
            Book Call
          </Link>
        )}
        {activeTab === 'support' && (
          <Link
            to="/dashboard/support"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
          >
            <MessageSquare className="w-4 h-4" />
            New Ticket
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('submissions')}
            className={`flex items-center gap-2 py-4 px-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'submissions'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-medium'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <FileText className="w-4 h-4" />
            Submissions
          </button>
          <button
            onClick={() => setActiveTab('guidance')}
            className={`flex items-center gap-2 py-4 px-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'guidance'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-medium'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Phone className="w-4 h-4" />
            Guidance Calls
          </button>
          <button
            onClick={() => setActiveTab('support')}
            className={`flex items-center gap-2 py-4 px-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'support'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-medium'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Support History
          </button>
        </div>
        

        
        <div className="mr-2">
          <RefreshButton onClick={handleRefresh} loading={isRefreshing} />
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden min-h-[400px]">
        {/* Submissions Tab */}
        {activeTab === 'submissions' && (
          <div className="overflow-x-auto custom-scrollbar">
            {submissionsLoading ? (
              <div className="flex items-center justify-center py-20">
                <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
              </div>
            ) : submissions.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Paper Type</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Question #</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Submitted On</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Score</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {submissions.map((submission) => (
                    <tr key={submission.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{submission.paper_type}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{submission.question_number}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{new Date(submission.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(submission.status)}`}>
                          {submission.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {submission.score !== null && submission.score !== undefined 
                          ? `${submission.score}/${submission.score_total || 15}` 
                          : '-'}
                      </td>
                      <td className="px-6 py-4">
                        {submission.checked_file_url ? (
                          <a
                            href={submission.checked_file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-900/40 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/60 rounded-lg text-xs font-medium transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Evaluated Copy
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400 dark:text-gray-500">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <EmptyState type="submission" />
            )}
          </div>
        )}

        {/* Guidance Calls Tab */}
        {activeTab === 'guidance' && (
          <div className="overflow-x-auto custom-scrollbar">
            {callsLoading ? (
              <div className="flex items-center justify-center py-20">
                <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
              </div>
            ) : guidanceCalls.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Topic</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date & Time</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {guidanceCalls.map((call) => (
                    <tr key={call.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{call.topic}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">ID: {call.id.slice(0, 8)}...</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-gray-900 dark:text-white">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {call.requested_date}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <Clock className="w-3 h-3" />
                          {call.requested_time}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(call.status)}`}>
                          {call.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setActiveNoteCallId(call.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg transition-colors border border-indigo-100 dark:border-indigo-800"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          {call.notes ? 'View Notes' : 'Add Notes'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <EmptyState type="guidance" />
            )}
          </div>
        )}

        {/* Support Tickets Tab */}
        {activeTab === 'support' && (
          <div className="overflow-x-auto custom-scrollbar">
            {ticketsLoading ? (
              <div className="flex items-center justify-center py-20">
                <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
              </div>
            ) : supportTickets.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ticket ID</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Subject</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Priority</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {supportTickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white uppercase">{ticket.ticket_number}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{ticket.subject}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{ticket.category}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{new Date(ticket.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          ticket.priority === 'High' 
                            ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                            : ticket.priority === 'Medium'
                            ? 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                            : 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        }`}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(ticket.status)}`}>
                          {ticket.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {ticket.admin_response && (
                          <button
                            onClick={() => setViewTicketResponse(ticket)}
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium text-xs bg-indigo-50 dark:bg-indigo-900/40 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors border border-indigo-100 dark:border-indigo-800"
                          >
                            View Response
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <EmptyState type="support" />
            )}
          </div>
        )}
      </div>
      
      {/* Notes Modal */}
      <NotesModal
        isOpen={activeNoteCallId !== null}
        onClose={() => setActiveNoteCallId(null)}
        initialNotes={guidanceCalls.find(c => c.id === activeNoteCallId)?.notes || ''}
        onSave={async (newNotes) => {
          if (activeNoteCallId) {
            await updateCall(activeNoteCallId, { notes: newNotes });
          }
        }}
        title={`Notes: ${guidanceCalls.find(c => c.id === activeNoteCallId)?.topic || 'Call'}`}
      />

      {/* Ticket Response Modal */}
      {viewTicketResponse && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setViewTicketResponse(null)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Admin Response</h3>
               <button onClick={() => setViewTicketResponse(null)} className="text-gray-400 hover:text-gray-500">
                 <X className="w-6 h-6" />
               </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="prose dark:prose-invert max-w-none">
                 <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{viewTicketResponse.admin_response}</p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-800 flex justify-end">
               <button onClick={() => setViewTicketResponse(null)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const EmptyState = ({ type }: { type: 'submission' | 'guidance' | 'support' }) => {
  const content = {
    submission: {
      icon: FileText,
      title: 'No submissions found',
      desc: "You haven't submitted any answer copies yet.",
      cta: 'New Submission',
      link: '/dashboard/submit'
    },
    guidance: {
      icon: Phone,
      title: 'No calls found',
      desc: "You haven't booked any guidance calls yet.",
      cta: 'Book Call',
      link: '/dashboard/guidance-calls'
    },
    support: {
      icon: MessageSquare,
      title: 'No tickets found',
      desc: "You haven't raised any support tickets yet.",
      cta: 'New Ticket',
      link: '/dashboard/support'
    }
  }[type];

  const Icon = content.icon;

  return (
    <div className="p-16 text-center flex flex-col items-center justify-center">
      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-full mb-4">
        <Icon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{content.title}</h3>
      <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm">{content.desc}</p>
      <Link
        to={content.link}
        className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
      >
        <Plus className="w-4 h-4" />
        {content.cta}
      </Link>
    </div>
  );
};

export default HistoryPage;
