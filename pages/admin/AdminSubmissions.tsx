import React, { useState, useRef } from 'react';
import { Search, FileText, CheckCircle, Clock, ChevronDown, AlertCircle, Download, Eye, X, Upload } from 'lucide-react';

// Mock Submission Data
const initialSubmissions = [
  { 
    id: 'SUB-001', 
    user: 'Mike Ross', 
    email: 'mike@law.com', 
    plan: 'Pro', 
    title: 'GS Paper 1 - Indian Culture', 
    subject: 'General Studies',
    pages: 12,
    date: '2025-12-30', 
    status: 'Pending',
    pdfUrl: '/sample.pdf'
  },
  { 
    id: 'SUB-002', 
    user: 'Rachel Green', 
    email: 'rachel@fashion.com', 
    plan: 'Achiever', 
    title: 'Essay - Women Empowerment', 
    subject: 'Essay',
    pages: 8,
    date: '2025-12-29', 
    status: 'Under Review',
    pdfUrl: '/sample.pdf'
  },
  { 
    id: 'SUB-003', 
    user: 'Harvey Specter', 
    email: 'harvey@law.com', 
    plan: 'Pro', 
    title: 'GS Paper 2 - Governance', 
    subject: 'General Studies',
    pages: 15,
    date: '2025-12-28', 
    status: 'Evaluated',
    pdfUrl: '/sample.pdf'
  },
  { 
    id: 'SUB-004', 
    user: 'John Doe', 
    email: 'john@example.com', 
    plan: 'Starter', 
    title: 'Optional - Geography', 
    subject: 'Optional Subject',
    pages: 20,
    date: '2025-12-27', 
    status: 'Pending',
    pdfUrl: '/sample.pdf'
  },
  { 
    id: 'SUB-005', 
    user: 'Sarah Smith', 
    email: 'sarah@test.com', 
    plan: 'Pro', 
    title: 'GS Paper 3 - Economy', 
    subject: 'General Studies',
    pages: 10,
    date: '2025-12-26', 
    status: 'Evaluated',
    pdfUrl: '/sample.pdf'
  },
];

const AdminSubmissions = () => {
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPlan, setFilterPlan] = useState('All');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isPlanDropdownOpen, setIsPlanDropdownOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<typeof initialSubmissions[0] | null>(null);

  const filteredSubmissions = submissions.filter(sub => 
    (filterStatus === 'All' || sub.status === filterStatus) &&
    (filterPlan === 'All' || sub.plan === filterPlan) &&
    (sub.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
     sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
     sub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
     sub.subject.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleStatusChange = (id: string, newStatus: string) => {
    setSubmissions(submissions.map(sub => 
      sub.id === id ? { ...sub, status: newStatus } : sub
    ));
  };

  const statusCounts = {
    pending: submissions.filter(s => s.status === 'Pending').length,
    underReview: submissions.filter(s => s.status === 'Under Review').length,
    evaluated: submissions.filter(s => s.status === 'Evaluated').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Copy Submissions</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Review and evaluate user answer copy submissions</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <div>
              <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{statusCounts.pending}</p>
              <p className="text-sm text-yellow-600 dark:text-yellow-400">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{statusCounts.underReview}</p>
              <p className="text-sm text-blue-600 dark:text-blue-400">Under Review</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">{statusCounts.evaluated}</p>
              <p className="text-sm text-green-600 dark:text-green-400">Evaluated</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-end gap-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search submissions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none w-64"
          />
        </div>

        {/* Plan Filter */}
        <div className="relative">
          <button
            onClick={() => setIsPlanDropdownOpen(!isPlanDropdownOpen)}
            onBlur={() => setTimeout(() => setIsPlanDropdownOpen(false), 200)}
            className="flex items-center justify-between w-36 px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          >
            <span className="truncate">{filterPlan === 'All' ? 'All Plans' : filterPlan}</span>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isPlanDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          
          <div className={`absolute right-0 mt-2 w-36 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-10 overflow-hidden transition-all duration-200 origin-top-right ${isPlanDropdownOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
            <div className="py-1">
              {['All', 'Free', 'Starter', 'Pro', 'Achiever'].map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    setFilterPlan(option);
                    setIsPlanDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    filterPlan === option 
                      ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-medium' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  {option === 'All' ? 'All Plans' : option}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
            onBlur={() => setTimeout(() => setIsStatusDropdownOpen(false), 200)}
            className="flex items-center justify-between w-44 px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          >
            <span className="truncate">{filterStatus === 'All' ? 'All Status' : filterStatus}</span>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isStatusDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          
          <div className={`absolute right-0 mt-2 w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-10 overflow-hidden transition-all duration-200 origin-top-right ${isStatusDropdownOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
            <div className="py-1">
              {['All', 'Pending', 'Under Review', 'Evaluated'].map((option) => (
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

      {/* Submissions Table */}
      <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="px-6 py-4">Submission Details</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Subject</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredSubmissions.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-indigo-50 dark:bg-indigo-900/40 rounded-lg text-indigo-600 dark:text-indigo-400 mt-1">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{sub.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">#{sub.id} • {sub.pages} pages</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900 dark:text-white">{sub.user}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{sub.email}</p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 mt-1">
                      {sub.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-900 dark:text-white">{sub.subject}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                    {new Date(sub.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      sub.status === 'Evaluated'
                        ? 'bg-green-50 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-100 dark:border-green-900/50'
                        : sub.status === 'Under Review'
                        ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-900/50'
                        : 'bg-yellow-50 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 border-yellow-100 dark:border-yellow-900/50'
                    }`}>
                      {sub.status === 'Evaluated' ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <Clock className="w-3 h-3" />
                      )}
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setSelectedSubmission(sub)}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium text-xs bg-indigo-50 dark:bg-indigo-900/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 px-3 py-1.5 rounded-lg transition-colors border border-indigo-100 dark:border-indigo-800 flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </button>
                      <button 
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 font-medium text-xs bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-1.5 rounded-lg transition-colors border border-gray-200 dark:border-gray-700 flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        PDF
                      </button>
                      {sub.status === 'Pending' && (
                        <button 
                          onClick={() => handleStatusChange(sub.id, 'Under Review')}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-xs bg-blue-50 dark:bg-blue-900/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 px-3 py-1.5 rounded-lg transition-colors border border-blue-100 dark:border-blue-800"
                        >
                          Start Review
                        </button>
                      )}
                      {sub.status === 'Under Review' && (
                        <button 
                          onClick={() => handleStatusChange(sub.id, 'Evaluated')}
                          className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 font-medium text-xs bg-green-50 dark:bg-green-900/40 hover:bg-green-100 dark:hover:bg-green-900/60 px-3 py-1.5 rounded-lg transition-colors border border-green-100 dark:border-green-800"
                        >
                          Mark Evaluated
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredSubmissions.length === 0 && (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">
              <AlertCircle className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <p>No submissions found matching your criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedSubmission(null)}
        >
          <div 
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800 shrink-0">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{selectedSubmission.title}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">#{selectedSubmission.id}</p>
              </div>
              <button 
                onClick={() => setSelectedSubmission(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            {/* Content - Scrollable */}
            <div className="p-5 overflow-y-auto flex-1 custom-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">User</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedSubmission.user}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{selectedSubmission.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Plan</p>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
                    {selectedSubmission.plan}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Subject</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedSubmission.subject}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Pages</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedSubmission.pages} pages</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Submitted On</p>
                  <p className="font-medium text-gray-900 dark:text-white">{new Date(selectedSubmission.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</p>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedSubmission.status === 'Evaluated'
                      ? 'bg-green-50 dark:bg-green-900/40 text-green-700 dark:text-green-300'
                      : selectedSubmission.status === 'Under Review'
                      ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                      : 'bg-yellow-50 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300'
                  }`}>
                    {selectedSubmission.status}
                  </span>
                </div>
              </div>

              {/* User's Submitted PDF */}
              <div className="mt-5 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">Submitted Answer Copy</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/40 rounded-lg">
                      <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedSubmission.title}.pdf</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{selectedSubmission.pages} pages</p>
                    </div>
                  </div>
                  <button className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium text-sm bg-indigo-50 dark:bg-indigo-900/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 px-3 py-1.5 rounded-lg transition-colors">
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>

              {/* Upload Checked Copy Section */}
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border-2 border-dashed border-green-200 dark:border-green-800">
                <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-3">Upload Checked Copy</p>
                <div className="flex flex-col items-center justify-center py-4">
                  <Upload className="w-8 h-8 text-green-500 dark:text-green-400 mb-2" />
                  <p className="text-sm text-green-700 dark:text-green-300 font-medium">Upload evaluated copy for {selectedSubmission.user}</p>
                  <p className="text-xs text-green-600 dark:text-green-500 mt-1">PDF only, max 10MB</p>
                  <label className="mt-3 cursor-pointer">
                    <input type="file" accept=".pdf" className="hidden" />
                    <span className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium text-sm rounded-lg transition-colors">
                      <Upload className="w-4 h-4" />
                      Select File
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 shrink-0">
              {selectedSubmission.status === 'Pending' && (
                <button 
                  onClick={() => {
                    handleStatusChange(selectedSubmission.id, 'Under Review');
                    setSelectedSubmission({...selectedSubmission, status: 'Under Review'});
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm"
                >
                  Start Review
                </button>
              )}
              {selectedSubmission.status === 'Under Review' && (
                <button 
                  onClick={() => {
                    handleStatusChange(selectedSubmission.id, 'Evaluated');
                    setSelectedSubmission({...selectedSubmission, status: 'Evaluated'});
                  }}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors text-sm"
                >
                  Mark Evaluated
                </button>
              )}
              <button 
                onClick={() => setSelectedSubmission(null)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-colors text-sm"
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

export default AdminSubmissions;
