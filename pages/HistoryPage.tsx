import React from 'react';
import { Link } from 'react-router-dom';
import { Download, FileText, Plus } from 'lucide-react';

// Mock submission data - in real app would come from API
const mockSubmissions = [
  { id: 'SUB001', subject: 'General Studies I', year: '2024', paperCode: 'GS1-24-01', submittedOn: '2024-12-28', status: 'Checked' },
  { id: 'SUB002', subject: 'General Studies II', year: '2024', paperCode: 'GS2-24-02', submittedOn: '2024-12-27', status: 'Pending' },
  { id: 'SUB003', subject: 'Essay', year: '2023', paperCode: 'ESS-23-01', submittedOn: '2024-12-25', status: 'Checked' },
];

// Set to empty array to test empty state:
// const mockSubmissions: any[] = [];

const HistoryPage = () => {
  const submissions = mockSubmissions;
  const isEmpty = submissions.length === 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Submission History</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">View and manage your past submissions</p>
        </div>
        <Link
          to="/dashboard/submit"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-all"
        >
          <Plus className="w-4 h-4" />
          New Submission
        </Link>
      </div>

      {isEmpty ? (
        /* Empty State */
        <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-16 text-center">
          <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No submissions found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">You haven't submitted any answer copies yet.</p>
          <Link
            to="/dashboard/submit"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-all"
          >
            <Plus className="w-4 h-4" />
            New Submission
          </Link>
        </div>
      ) : (
        /* Table */
        <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Subject</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Year</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Paper Code</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Submitted On</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {submissions.map((submission) => (
                  <tr key={submission.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{submission.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{submission.subject}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{submission.year}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 font-mono">{submission.paperCode}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{submission.submittedOn}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        submission.status === 'Checked'
                          ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300'
                          : 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300'
                      }`}>
                        {submission.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        disabled={submission.status !== 'Checked'}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          submission.status === 'Checked'
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
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
