import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, FileText, Plus, Phone, MessageSquare, Clock, CheckCircle, AlertCircle, Calendar, RefreshCw, X, Megaphone, BarChart3, TrendingUp, Target, Award, ChevronDown } from 'lucide-react';
import RefreshButton from '../components/RefreshButton';
import Pagination from '../components/Pagination';
import { useSubmissions } from '../hooks/useSubmissions';
import { useGuidanceCalls } from '../hooks/useGuidanceCalls';
import { supabase } from '../lib/supabase';
import NotesModal from '../components/NotesModal';
import { useAutoRefresh } from '../hooks/useAutoRefresh';

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


type TabType = 'submissions' | 'analytics';

interface Announcement {
  id: string;
  message: string;
  created_at: string;
}

const HistoryPage = () => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<TabType>('submissions');
  
  // Use real hooks for data
  const { submissions, loading: submissionsLoading, fetchSubmissions } = useSubmissions();
  const { calls: guidanceCalls, loading: callsLoading, updateCall, fetchCalls } = useGuidanceCalls();

  // Support Tickets State
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [activeNoteCallId, setActiveNoteCallId] = useState<string | null>(null);
  const [viewTicketResponse, setViewTicketResponse] = useState<any | null>(null);
  const [submissionsPage, setSubmissionsPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const fetchTickets = React.useCallback(async (background = false) => {
    if (!user) return;
    if (!background) setTicketsLoading(true);
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
      if (!background) setTicketsLoading(false);
    }
  }, [user]);

  React.useEffect(() => {
    if (activeTab === 'support') {
      fetchTickets();
    } else if (activeTab === 'updates') {
      const fetchAnnouncements = async () => {
        try {
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
          
          const token = getAccessToken();
          if (!token) return;
          
          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/announcements?is_active=eq.true&order=created_at.desc`,
            {
              headers: {
                'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${token}`
              }
            }
          );

          if (response.ok) {
            const data = await response.json();
            if (data) setAnnouncements(data);
          }
        } catch (err) {
          console.error('Error fetching announcements:', err);
        }
      };
      fetchAnnouncements();
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

  const handleRefresh = (background = false) => {
    if (activeTab === 'submissions') fetchSubmissions(background);
    else if (activeTab === 'guidance') fetchCalls(background);
    else if (activeTab === 'support') fetchTickets(background);
  };

  const isRefreshing = 
    (activeTab === 'submissions' && submissionsLoading);

  useAutoRefresh(() => handleRefresh(true));

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Submissions</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">View and manage your paper submissions</p>
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
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 py-4 px-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-medium'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Analytics
          </button>
        </div>
        
        <div className="mr-2">
          <RefreshButton onClick={() => handleRefresh(false)} loading={isRefreshing} />
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
              <>
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Subject</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Submitted On</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Score</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {submissions
                    .slice((submissionsPage - 1) * ITEMS_PER_PAGE, submissionsPage * ITEMS_PER_PAGE)
                    .map((submission) => (
                    <tr key={submission.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{submission.paper_type}</td>
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
                        <div className="flex items-center gap-2">
                          {submission.file_url && (
                            <a
                              href={submission.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-lg text-xs font-medium transition-colors"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Submitted
                            </a>
                          )}
                          {submission.checked_file_url && (
                            <a
                              href={submission.checked_file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-900/40 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/60 rounded-lg text-xs font-medium transition-colors"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Evaluated
                            </a>
                          )}
                          {!submission.file_url && !submission.checked_file_url && (
                            <span className="text-xs text-gray-400 dark:text-gray-500">-</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination
                currentPage={submissionsPage}
                totalPages={Math.ceil(submissions.length / ITEMS_PER_PAGE)}
                onPageChange={setSubmissionsPage}
                totalItems={submissions.length}
                itemsPerPage={ITEMS_PER_PAGE}
              />
              </>
            ) : (
              <EmptyState type="submission" />
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <AnalyticsTab submissions={submissions} loading={submissionsLoading} />
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

// Analytics Tab Component
const AnalyticsTab = ({ submissions, loading }: { submissions: any[], loading: boolean }) => {
  const [timeFilter, setTimeFilter] = React.useState<'all' | '30d' | '7d'>('all');
  const [subjectFilter, setSubjectFilter] = React.useState<string>('all');
  const [hoveredPoint, setHoveredPoint] = React.useState<number | null>(null);
  const [hoveredSegment, setHoveredSegment] = React.useState<number | null>(null);
  const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = React.useState(false);

  // Get unique subjects
  const subjects = React.useMemo(() => {
    const unique = [...new Set(submissions.map(s => s.paper_type || 'Unknown'))];
    return unique;
  }, [submissions]);

  // Filter submissions
  const filteredSubmissions = React.useMemo(() => {
    let filtered = [...submissions];
    
    // Time filter
    if (timeFilter !== 'all') {
      const days = timeFilter === '30d' ? 30 : 7;
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      filtered = filtered.filter(s => new Date(s.created_at) >= cutoff);
    }
    
    // Subject filter
    if (subjectFilter !== 'all') {
      filtered = filtered.filter(s => s.paper_type === subjectFilter);
    }
    
    return filtered;
  }, [submissions, timeFilter, subjectFilter]);

  // Scored submissions for charts
  const scoredSubmissions = React.useMemo(() => {
    return filteredSubmissions
      .filter(s => s.score !== null && s.score !== undefined && s.score_total)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }, [filteredSubmissions]);

  // Calculate stats
  const stats = React.useMemo(() => {
    const evaluated = filteredSubmissions.filter(s => s.status?.toLowerCase() === 'evaluated').length;
    const pending = filteredSubmissions.filter(s => s.status?.toLowerCase() === 'pending').length;
    const avgScore = scoredSubmissions.length > 0 
      ? Math.round(scoredSubmissions.reduce((acc, s) => acc + (s.score / s.score_total * 100), 0) / scoredSubmissions.length)
      : 0;
    const highest = scoredSubmissions.length > 0
      ? Math.round(Math.max(...scoredSubmissions.map(s => s.score / s.score_total * 100)))
      : 0;
    const lowest = scoredSubmissions.length > 0
      ? Math.round(Math.min(...scoredSubmissions.map(s => s.score / s.score_total * 100)))
      : 0;
    return { total: filteredSubmissions.length, evaluated, pending, avgScore, highest, lowest };
  }, [filteredSubmissions, scoredSubmissions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="text-center py-20">
        <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Analytics Yet</h3>
        <p className="text-gray-500 dark:text-gray-400">Submit your first paper to see analytics here.</p>
      </div>
    );
  }

  // Chart data points
  const chartPoints = scoredSubmissions.slice(-15).map((s, i, arr) => ({
    x: arr.length > 1 ? (i / (arr.length - 1)) * 100 : 50,
    y: 100 - (s.score / s.score_total * 100),
    score: Math.round(s.score / s.score_total * 100),
    date: new Date(s.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
    subject: s.paper_type || 'Unknown'
  }));

  // Subject breakdown for pie chart
  const subjectBreakdown = React.useMemo(() => {
    const counts: Record<string, number> = {};
    filteredSubmissions.forEach(s => {
      const subject = s.paper_type || 'Unknown';
      counts[subject] = (counts[subject] || 0) + 1;
    });
    const colors = ['#6366f1', '#8b5cf6', '#a855f7', '#c084fc', '#d8b4fe', '#e9d5ff'];
    return Object.entries(counts).map(([name, count], i) => ({
      name,
      count,
      percentage: Math.round((count / filteredSubmissions.length) * 100),
      color: colors[i % colors.length]
    }));
  }, [filteredSubmissions]);

  // Subject performance for radar chart
  const subjectPerformance = React.useMemo(() => {
    const performance: Record<string, { total: number, count: number }> = {};
    scoredSubmissions.forEach(s => {
      const subject = s.paper_type || 'Unknown';
      if (!performance[subject]) {
        performance[subject] = { total: 0, count: 0 };
      }
      performance[subject].total += (s.score / s.score_total) * 100;
      performance[subject].count += 1;
    });
    
    const colors = ['#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#f97316', '#10b981'];
    return Object.entries(performance)
      .map(([name, data], i) => ({
        name,
        avgScore: Math.round(data.total / data.count),
        count: data.count,
        color: colors[i % colors.length]
      }))
      .slice(0, 6); // Limit to 6 subjects for readability
  }, [scoredSubmissions]);

  return (
    <div className="p-6 space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">Time:</span>
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {[
              { key: 'all', label: 'All Time' },
              { key: '30d', label: '30 Days' },
              { key: '7d', label: '7 Days' }
            ].map(opt => (
              <button
                key={opt.key}
                onClick={() => setTimeFilter(opt.key as any)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  timeFilter === opt.key
                    ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-2 relative">
          <span className="text-sm text-gray-500 dark:text-gray-400">Subject:</span>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsSubjectDropdownOpen(!isSubjectDropdownOpen)}
              onBlur={() => setTimeout(() => setIsSubjectDropdownOpen(false), 200)}
              className="flex items-center justify-between gap-2 px-4 py-1.5 text-xs font-medium rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors min-w-[140px]"
            >
              <span>{subjectFilter === 'all' ? 'All Subjects' : subjectFilter}</span>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isSubjectDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isSubjectDropdownOpen && (
              <div className="absolute left-0 top-full mt-1 w-full min-w-[180px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto custom-scrollbar">
                <button
                  type="button"
                  onClick={() => {
                    setSubjectFilter('all');
                    setIsSubjectDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs transition-colors ${
                    subjectFilter === 'all'
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  All Subjects
                </button>
                {subjects.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setSubjectFilter(s);
                      setIsSubjectDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs transition-colors ${
                      subjectFilter === s
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Score Trend Line Chart */}
        <div className="lg:col-span-2 bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Score Trend</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Performance over time (percentage)</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{stats.avgScore}%</p>
              <p className="text-xs text-gray-500">Average</p>
            </div>
          </div>

          {chartPoints.length > 0 ? (
            <div className="relative h-64">
              {/* Y-axis */}
              <div className="absolute left-0 top-0 bottom-8 w-8 flex flex-col justify-between text-xs text-gray-400">
                <span>100%</span>
                <span>75%</span>
                <span>50%</span>
                <span>25%</span>
                <span>0%</span>
              </div>
              
              {/* Chart */}
              <div className="absolute left-10 right-0 top-0 bottom-0">
                {/* Grid */}
                <div className="absolute inset-0 bottom-8">
                  {[0, 25, 50, 75, 100].map(pct => (
                    <div 
                      key={pct} 
                      className="absolute w-full border-t border-gray-200 dark:border-gray-700/50 border-dashed" 
                      style={{ top: `${pct}%` }}
                    />
                  ))}
                </div>
                
                {/* SVG Chart */}
                <svg 
                  className="absolute inset-0 w-full" 
                  style={{ height: 'calc(100% - 32px)' }}
                  viewBox="0 0 100 100" 
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4"/>
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                  
                  {/* Area */}
                  {chartPoints.length > 1 && (
                    <path
                      d={`M ${chartPoints[0].x} ${chartPoints[0].y} ${chartPoints.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')} L ${chartPoints[chartPoints.length-1].x} 100 L ${chartPoints[0].x} 100 Z`}
                      fill="url(#areaGrad)"
                    />
                  )}
                  
                  {/* Line */}
                  <path
                    d={chartPoints.length > 1 
                      ? `M ${chartPoints[0].x} ${chartPoints[0].y} ${chartPoints.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')}`
                      : ''}
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="0.5"
                    vectorEffect="non-scaling-stroke"
                    style={{ strokeWidth: '2px' }}
                  />
                </svg>
                
                {/* Points as HTML elements (to avoid SVG stretching) */}
                <div className="absolute inset-0" style={{ bottom: '32px' }}>
                  {chartPoints.map((p, i) => (
                    <div
                      key={i}
                      className={`absolute w-3 h-3 rounded-full bg-indigo-500 border-2 border-white dark:border-gray-900 shadow-sm cursor-pointer transition-transform ${hoveredPoint === i ? 'scale-150 z-10' : ''}`}
                      style={{ 
                        left: `${p.x}%`, 
                        top: `${p.y}%`,
                        transform: 'translate(-50%, -50%)'
                      }}
                      onMouseEnter={() => setHoveredPoint(i)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  ))}
                </div>
                
                {/* Tooltip */}
                {hoveredPoint !== null && chartPoints[hoveredPoint] && (
                  <div 
                    className="absolute z-10 bg-gray-900 dark:bg-gray-700 text-white px-3 py-2 rounded-lg text-xs shadow-lg pointer-events-none transform -translate-x-1/2"
                    style={{ 
                      left: `${chartPoints[hoveredPoint].x}%`, 
                      top: `${chartPoints[hoveredPoint].y - 15}%` 
                    }}
                  >
                    <p className="font-semibold">{chartPoints[hoveredPoint].score}%</p>
                    <p className="text-gray-300">{chartPoints[hoveredPoint].date}</p>
                    <p className="text-gray-400 text-[10px]">{chartPoints[hoveredPoint].subject}</p>
                  </div>
                )}
                
                {/* X-axis labels */}
                <div className="absolute bottom-0 left-0 right-0 h-8 flex justify-between text-xs text-gray-400">
                  {chartPoints.filter((_, i) => i % Math.max(1, Math.floor(chartPoints.length / 5)) === 0 || i === chartPoints.length - 1).map((p, i) => (
                    <span key={i}>{p.date}</span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <Award className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No scored submissions in selected period</p>
              </div>
            </div>
          )}
        </div>

        {/* Subject Distribution */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Subject Distribution</h3>
          
          <div className="flex items-center gap-6">
            {/* Interactive Donut Chart */}
            <div className="relative w-36 h-36 flex-shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90" style={{ overflow: 'visible' }}>
                <defs>
                  {subjectBreakdown.map((item, i) => (
                    <filter key={`glow-${i}`} id={`segmentGlow-${i}`} x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="1" result="blur" />
                      <feFlood floodColor={item.color} floodOpacity="0.6" result="color" />
                      <feComposite in="color" in2="blur" operator="in" result="glow" />
                      <feMerge>
                        <feMergeNode in="glow" />
                        <feMergeNode in="glow" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  ))}
                </defs>
                {(() => {
                  let offset = 0;
                  return subjectBreakdown.map((item, i) => {
                    const dash = item.percentage;
                    const gap = 100 - dash;
                    const isHovered = hoveredSegment === i;
                    const circle = (
                      <circle
                        key={i}
                        cx="18"
                        cy="18"
                        r="15.9"
                        fill="none"
                        stroke={item.color}
                        strokeWidth={isHovered ? "4.5" : "3"}
                        strokeDasharray={`${dash} ${gap}`}
                        strokeDashoffset={-offset}
                        className="transition-all duration-200 cursor-pointer"
                        style={{ 
                          opacity: hoveredSegment !== null && !isHovered ? 0.4 : 1
                        }}
                        filter={isHovered ? `url(#segmentGlow-${i})` : undefined}
                        onMouseEnter={() => setHoveredSegment(i)}
                        onMouseLeave={() => setHoveredSegment(null)}
                      />
                    );
                    offset += dash;
                    return circle;
                  });
                })()}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  {hoveredSegment !== null ? (
                    <>
                      <p className="text-xl font-bold" style={{ color: subjectBreakdown[hoveredSegment]?.color }}>{subjectBreakdown[hoveredSegment]?.count}</p>
                      <p className="text-[9px] text-gray-500 max-w-[60px] truncate">{subjectBreakdown[hoveredSegment]?.name}</p>
                    </>
                  ) : (
                    <>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                      <p className="text-[10px] text-gray-500">Total</p>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {/* Legend */}
            <div className="flex-1 space-y-2">
              {subjectBreakdown.slice(0, 5).map((item, i) => (
                <div 
                  key={i} 
                  className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all duration-200 ${
                    hoveredSegment === i ? 'bg-indigo-50 dark:bg-indigo-900/30' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  onMouseEnter={() => setHoveredSegment(i)}
                  onMouseLeave={() => setHoveredSegment(null)}
                >
                  <div 
                    className={`w-3 h-3 rounded-full transition-all duration-200 ${
                      hoveredSegment === i ? 'ring-2 ring-offset-1 ring-offset-white dark:ring-offset-gray-900' : ''
                    }`}
                    style={{ 
                      backgroundColor: item.color,
                      ringColor: item.color
                    }} 
                  />
                  <span className={`text-xs flex-1 truncate transition-colors ${
                    hoveredSegment === i ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-600 dark:text-gray-300'
                  }`}>{item.name}</span>
                  <span className={`text-xs font-medium ${
                    hoveredSegment === i ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-900 dark:text-white'
                  }`}>{item.count} ({item.percentage}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Score Range Bar Chart */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Score Distribution</h3>
          
          {scoredSubmissions.length > 0 ? (
            <div className="space-y-3">
              {(() => {
                const ranges = [
                  { label: '90-100%', min: 90, max: 100, color: 'from-green-500 to-emerald-500' },
                  { label: '70-89%', min: 70, max: 89, color: 'from-blue-500 to-indigo-500' },
                  { label: '50-69%', min: 50, max: 69, color: 'from-yellow-500 to-orange-500' },
                  { label: '0-49%', min: 0, max: 49, color: 'from-red-500 to-pink-500' }
                ];
                
                const total = scoredSubmissions.length;
                
                return ranges.map((range, i) => {
                  const count = scoredSubmissions.filter(s => {
                    const pct = (s.score / s.score_total) * 100;
                    return pct >= range.min && pct <= range.max;
                  }).length;
                  const pct = Math.round((count / total) * 100);
                  
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600 dark:text-gray-400">{range.label}</span>
                        <span className="font-medium text-gray-900 dark:text-white">{count} ({pct}%)</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-gradient-to-r ${range.color} rounded-full transition-all duration-700`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center text-gray-400 text-sm">
              No scored submissions
            </div>
          )}
          
          {scoredSubmissions.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">{stats.highest}%</p>
                <p className="text-[10px] text-gray-500">Highest</p>
              </div>
              <div>
                <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{stats.avgScore}%</p>
                <p className="text-[10px] text-gray-500">Average</p>
              </div>
              <div>
                <p className="text-lg font-bold text-red-600 dark:text-red-400">{stats.lowest}%</p>
                <p className="text-[10px] text-gray-500">Lowest</p>
              </div>
            </div>
          )}
        </div>

        {/* Subject Performance Comparison - Horizontal Bar Chart */}
        {subjectPerformance.length >= 1 && (
          <div className="lg:col-span-2 bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 overflow-visible">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Subject Performance</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Average scores by subject</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{stats.avgScore}%</p>
                <p className="text-xs text-gray-500">Overall Average</p>
              </div>
            </div>
            
            <div className="space-y-4 overflow-visible">
              {subjectPerformance.map((item, i) => (
                <div 
                  key={i} 
                  className="group cursor-pointer"
                  onMouseEnter={() => setHoveredSegment(100 + i)}
                  onMouseLeave={() => setHoveredSegment(null)}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full transition-all duration-300 group-hover:scale-125" 
                        style={{ 
                          backgroundColor: item.color,
                          boxShadow: hoveredSegment === 100 + i ? `0 0 10px 3px ${item.color}80` : 'none'
                        }}
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                        {item.name}
                      </span>
                      <span className="text-xs text-gray-400">
                        ({item.count} {item.count === 1 ? 'paper' : 'papers'})
                      </span>
                    </div>
                    <span 
                      className="text-sm font-bold transition-all duration-200 group-hover:text-lg"
                      style={{ color: item.color }}
                    >
                      {item.avgScore}%
                    </span>
                  </div>
                  
                  <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-visible">
                    {/* Background grid lines */}
                    <div className="absolute inset-0 flex overflow-hidden rounded-full">
                      {[25, 50, 75].map(pct => (
                        <div 
                          key={pct}
                          className="absolute h-full border-l border-gray-300 dark:border-gray-600 border-dashed"
                          style={{ left: `${pct}%` }}
                        />
                      ))}
                    </div>
                    
                    {/* Progress bar */}
                    <div 
                      className="relative h-full rounded-full transition-all duration-300 ease-out"
                      style={{ 
                        width: `${item.avgScore}%`, 
                        background: `linear-gradient(135deg, ${item.color} 0%, ${item.color}dd 100%)`,
                        boxShadow: hoveredSegment === 100 + i ? `0 0 12px 2px ${item.color}60` : 'none'
                      }}
                    >
                      {/* Shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Scale reference */}
            <div className="flex justify-between mt-3 text-[10px] text-gray-400">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
            
            {/* Performance Summary */}
            {subjectPerformance.length > 1 && (
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Best Subject</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {subjectPerformance.reduce((best, curr) => curr.avgScore > best.avgScore ? curr : best).name}
                        </p>
                        <p className="text-xs font-bold text-green-600 dark:text-green-400">
                          {Math.max(...subjectPerformance.map(s => s.avgScore))}%
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                        <Target className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Needs Focus</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {subjectPerformance.reduce((worst, curr) => curr.avgScore < worst.avgScore ? curr : worst).name}
                        </p>
                        <p className="text-xs font-bold text-orange-600 dark:text-orange-400">
                          {Math.min(...subjectPerformance.map(s => s.avgScore))}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
