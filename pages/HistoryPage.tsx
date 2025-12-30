import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, FileText, Plus, Phone, MessageSquare, Clock, CheckCircle, AlertCircle, Calendar } from 'lucide-react';

// Mock submission data
const mockSubmissions = [
  { id: 'SUB001', subject: 'General Studies I', year: '2024', paperCode: 'GS1-24-01', submittedOn: '2024-12-28', status: 'Evaluated' },
  { id: 'SUB002', subject: 'General Studies II', year: '2024', paperCode: 'GS2-24-02', submittedOn: '2024-12-27', status: 'Pending' },
  { id: 'SUB003', subject: 'Essay', year: '2023', paperCode: 'ESS-23-01', submittedOn: '2024-12-25', status: 'Under Review' },
  { id: 'SUB004', subject: 'Optional - Geography', year: '2024', paperCode: 'OPT-24-01', submittedOn: '2024-12-24', status: 'Evaluated' },
  { id: 'SUB005', subject: 'GS Paper 4 Ethics', year: '2024', paperCode: 'GS4-24-01', submittedOn: '2024-12-20', status: 'Under Review' },
];

// Mock Guidance Call Data
const mockGuidanceCalls = [
  { id: 'CALL-001', topic: 'Essay Strategy', mentor: 'Dr. Sarah Wilson', date: '2025-12-30', time: '10:00 AM - 11:00 AM', status: 'Confirmed' },
  { id: 'CALL-002', topic: 'Optional Subject Stats', mentor: 'Prof. Rajesh Kumar', date: '2025-12-25', time: '02:00 PM - 03:00 PM', status: 'Completed' },
  { id: 'CALL-003', topic: 'GS Paper 4 Ethics', mentor: 'Dr. Sarah Wilson', date: '2025-12-20', time: '11:00 AM - 12:00 PM', status: 'Cancelled' },
];

// Mock Support Ticket Data
const mockSupportTickets = [
  { id: 'TKT-1024', subject: 'Payment Issue', category: 'Billing', date: '2024-12-29', status: 'Open', priority: 'High' },
  { id: 'TKT-1023', subject: 'PDF Upload Error', category: 'Technical', date: '2024-12-26', status: 'Resolved', priority: 'Medium' },
  { id: 'TKT-1022', subject: 'Evaluation Delay', category: 'General', date: '2024-12-20', status: 'Closed', priority: 'Low' },
];

type TabType = 'submissions' | 'guidance' | 'support';

const HistoryPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>('submissions');

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
      <div className="border-b border-gray-200 dark:border-gray-800">
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
      </div>

      {/* Content Area */}
      <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden min-h-[400px]">
        {/* Submissions Tab */}
        {activeTab === 'submissions' && (
          <div className="overflow-x-auto custom-scrollbar">
            {mockSubmissions.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Subject</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Year</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Submitted On</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {mockSubmissions.map((submission) => (
                    <tr key={submission.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{submission.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{submission.subject}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{submission.year}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{submission.submittedOn}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(submission.status)}`}>
                          {submission.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          disabled={submission.status !== 'Evaluated'}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                            submission.status === 'Evaluated'
                              ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 cursor-pointer'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </button>
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
            {mockGuidanceCalls.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Topic</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Mentor</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date & Time</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {mockGuidanceCalls.map((call) => (
                    <tr key={call.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{call.topic}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">ID: {call.id}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{call.mentor}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-gray-900 dark:text-white">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {call.date}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <Clock className="w-3 h-3" />
                          {call.time}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(call.status)}`}>
                          {call.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {call.status === 'Confirmed' && (
                          <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm font-medium hover:underline">
                            Join Meeting
                          </button>
                        )}
                        {call.status === 'Completed' && (
                          <span className="text-gray-400 dark:text-gray-500 text-sm">--</span>
                        )}
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
            {mockSupportTickets.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ticket ID</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Subject</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Priority</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {mockSupportTickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white uppercase">{ticket.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{ticket.subject}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{ticket.category}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{ticket.date}</td>
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
