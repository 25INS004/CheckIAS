import React, { useState } from 'react';
import { Search, Plus, Minus, X, Calendar, Filter, Download, History, ChevronDown } from 'lucide-react';
import DatePicker from '../../components/DatePicker';

// Mock user data with updated plan names
const mockUsers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', plan: 'Pro', credits: 10, status: 'Active', registrationDate: '2024-12-01' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', plan: 'Free', credits: 2, status: 'Active', registrationDate: '2024-12-05' },
  { id: 3, name: 'Mike Johnson', email: 'mike@example.com', plan: 'Achiever', credits: 5, status: 'Active', registrationDate: '2024-11-15' },
  { id: 4, name: 'Sarah Wilson', email: 'sarah@example.com', plan: 'Free', credits: 0, status: 'Inactive', registrationDate: '2024-10-20' },
  { id: 5, name: 'David Brown', email: 'david@example.com', plan: 'Starter', credits: 15, status: 'Active', registrationDate: '2024-12-10' },
];

// ... (existing code)

// Mock audit log
const mockAuditLog: Array<{id: number; adminId: string; action: string; userId: number; timestamp: string; ip: string}> = [];

const UserManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState(mockUsers);
  const [auditLog, setAuditLog] = useState(mockAuditLog);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showAuditLog, setShowAuditLog] = useState(false);
  
  // Dropdown visibility states
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isPlanOpen, setIsPlanOpen] = useState(false);
  
  // Credit modal
  const [creditModal, setCreditModal] = useState<{ open: boolean; userId: number | null; amount: number; reason: string }>({
    open: false,
    userId: null,
    amount: 0,
    reason: ''
  });

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesPlan = 
      planFilter === 'all' || 
      (planFilter === 'paid' && user.plan !== 'Free') ||
      user.plan === planFilter;
    const matchesDateFrom = !dateFrom || new Date(user.registrationDate) >= new Date(dateFrom);
    const matchesDateTo = !dateTo || new Date(user.registrationDate) <= new Date(dateTo);
    
    return matchesSearch && matchesStatus && matchesPlan && matchesDateFrom && matchesDateTo;
  });

  const logAction = (action: string, userId: number) => {
    const newLog = {
      id: auditLog.length + 1,
      adminId: 'ADMIN001',
      action,
      userId,
      timestamp: new Date().toISOString(),
      ip: '192.168.1.1' // In real app, get from server
    };
    setAuditLog([newLog, ...auditLog]);
  };

  const handleAdjustCredits = (userId: number) => {
    setCreditModal({ open: true, userId, amount: 0, reason: '' });
  };

  const applyCredits = () => {
    if (creditModal.userId && creditModal.reason.trim()) {
      const user = users.find(u => u.id === creditModal.userId);
      setUsers(users.map(u => 
        u.id === creditModal.userId 
          ? { ...u, credits: Math.max(0, u.credits + creditModal.amount) }
          : u
      ));
      logAction(`Adjusted credits by ${creditModal.amount} for ${user?.email}. Reason: ${creditModal.reason}`, creditModal.userId);
    }
    setCreditModal({ open: false, userId: null, amount: 0, reason: '' });
  };

  const handleActivatePlan = (userId: number) => {
    const user = users.find(u => u.id === userId);
    setUsers(users.map(u => 
      u.id === userId 
        ? { ...u, plan: 'Premium', status: 'Active' }
        : u
    ));
    logAction(`Activated Premium plan for ${user?.email}`, userId);
  };

  const handleRevokePlan = (userId: number) => {
    if (confirm('Are you sure you want to revoke this user\'s plan?')) {
      const user = users.find(u => u.id === userId);
      setUsers(users.map(u => 
        u.id === userId 
          ? { ...u, plan: 'Free', credits: 0 }
          : u
      ));
      logAction(`Revoked Premium plan for ${user?.email}`, userId);
    }
  };

  const exportUserCSV = () => {
    const headers = 'Name,Email,Plan,Credits,Status,Registration Date\n';
    const rows = filteredUsers.map(u => `${u.name},${u.email},${u.plan},${u.credits},${u.status},${u.registrationDate}`).join('\n');
    const csvContent = headers + rows;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getPlanLabel = (plan: string) => {
    if (plan === 'all') return 'All Plans';
    if (plan === 'paid') return 'All Paid Plans';
    return plan;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage users, credits, and subscriptions</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAuditLog(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
          >
            <History className="w-4 h-4" />
            Audit Log
          </button>
          <button
            onClick={exportUserCSV}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by email or name..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl border font-medium transition-all ${
              showFilters ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <div className="relative">
                <button
                  onClick={() => setIsStatusOpen(!isStatusOpen)}
                  onBlur={() => setTimeout(() => setIsStatusOpen(false), 200)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-left flex items-center justify-between"
                >
                  <span className="capitalize">{statusFilter === 'all' ? 'All Status' : statusFilter}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isStatusOpen ? 'rotate-180' : ''}`} />
                </button>
                
                <div className={`absolute top-full left-0 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg z-20 overflow-hidden transition-all origin-top ${isStatusOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                  {['all', 'Active', 'Inactive'].map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setStatusFilter(status);
                        setIsStatusOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800 ${statusFilter === status ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300'}`}
                    >
                      {status === 'all' ? 'All Status' : status}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Plan</label>
              <div className="relative">
                <button
                  onClick={() => setIsPlanOpen(!isPlanOpen)}
                  onBlur={() => setTimeout(() => setIsPlanOpen(false), 200)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-left flex items-center justify-between"
                >
                  <span className="capitalize">{getPlanLabel(planFilter)}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isPlanOpen ? 'rotate-180' : ''}`} />
                </button>
                
                <div className={`absolute top-full left-0 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg z-20 overflow-hidden transition-all origin-top ${isPlanOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                  {['all', 'Free', 'paid', 'Starter', 'Pro', 'Achiever'].map((plan) => (
                    <button
                      key={plan}
                      onClick={() => {
                        setPlanFilter(plan);
                        setIsPlanOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800 ${planFilter === plan ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300'}`}
                    >
                      {getPlanLabel(plan)}
                    </button>
                  ))}
                </div>
              </div>
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">From Date</label>
              <DatePicker
                value={dateFrom}
                onChange={setDateFrom}
                placeholder="Select start date"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">To Date</label>
              <DatePicker
                value={dateTo}
                onChange={setDateTo}
                placeholder="Select end date"
              />
            </div>
          </div>
        )}
      </div>

      {/* User Table */}
      <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Plan</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Credits</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Registered</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{user.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                      user.plan === 'Premium' ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300' : 'bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400'
                    }`}>
                      {user.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{user.credits}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                      user.status === 'Active' ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{user.registrationDate}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAdjustCredits(user.id)}
                        className="px-3 py-1.5 text-xs font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                      >
                        Adjust Credits
                      </button>
                      {user.plan === 'Premium' ? (
                        <button
                          onClick={() => handleRevokePlan(user.id)}
                          className="px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          Revoke
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivatePlan(user.id)}
                          className="px-3 py-1.5 text-xs font-medium text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                        >
                          Activate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredUsers.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No users found matching your filters
          </div>
        )}
      </div>

      {/* Credit Adjustment Modal */}
      {creditModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Adjust Credits</h3>
              <button onClick={() => setCreditModal({ open: false, userId: null, amount: 0, reason: '' })} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex items-center justify-center gap-4 mb-4">
              <button 
                onClick={() => setCreditModal(prev => ({ ...prev, amount: prev.amount - 1 }))}
                className="p-3 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
              >
                <Minus className="w-5 h-5" />
              </button>
              <span className={`text-4xl font-bold ${creditModal.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {creditModal.amount > 0 ? '+' : ''}{creditModal.amount}
              </span>
              <button 
                onClick={() => setCreditModal(prev => ({ ...prev, amount: prev.amount + 1 }))}
                className="p-3 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reason (required for audit)</label>
              <input
                type="text"
                value={creditModal.reason}
                onChange={(e) => setCreditModal(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="e.g., Customer support request"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <button
              onClick={applyCredits}
              disabled={!creditModal.reason.trim()}
              className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Apply Changes
            </button>
          </div>
        </div>
      )}

      {/* Audit Log Modal */}
      {showAuditLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-3xl shadow-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Admin Audit Log</h3>
              <button onClick={() => setShowAuditLog(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="overflow-y-auto flex-1">
              {auditLog.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">No actions logged yet</p>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 sticky top-0">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Admin ID</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Action</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Timestamp</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">IP Address</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {auditLog.map((log) => (
                      <tr key={log.id}>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{log.adminId}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{log.action}</td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{new Date(log.timestamp).toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 font-mono">{log.ip}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
