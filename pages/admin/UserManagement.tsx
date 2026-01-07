import React, { useState, useEffect } from 'react';
import { Search, Plus, Minus, X, Calendar, Filter, Download, History, ChevronDown, CheckCircle, AlertCircle, Phone } from 'lucide-react';
import DatePicker from '../../components/DatePicker';
import Toast from '../../components/Toast';
import RefreshButton from '../../components/RefreshButton';
import Pagination from '../../components/Pagination';
import { useAutoRefresh } from '../../hooks/useAutoRefresh';

interface User {
  id: string;
  full_name: string;
  email: string;
  plan: string;
  plan_started_at: string | null;
  phone: string | null;
  status: string; // 'Active' | 'Inactive' (calculated or from DB)
  created_at: string;
  role: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  // Dropdown visibility states
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isPlanOpen, setIsPlanOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Action dropdown and confirmation states
  const [openActionDropdown, setOpenActionDropdown] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ userId: string; userName: string; action: string; plan: string } | null>(null);

  const fetchUsers = async (background = false) => {
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

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles?select=*&order=created_at.desc`,
        { headers }
      );

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      // Transform data
      const mappedUsers = data
        .filter((u: any) => u.role !== 'admin') // Exclude Admins
        .map((u: any) => ({
          id: u.id,
          full_name: u.full_name || 'Unknown',
        email: u.email,
        plan: u.plan ? u.plan.charAt(0).toUpperCase() + u.plan.slice(1) : 'Free',
        plan_started_at: u.plan_started_at,
        phone: u.phone,
        status: 'Active', // Default to Active for now, or use logic based on login
        created_at: u.created_at,
        role: u.role
      }));

      setUsers(mappedUsers);
    } catch (err) {
      console.error('Error fetching users:', err);
      setToast({ message: 'Failed to fetch users', type: 'error' });
    } finally {
      if (!background) setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useAutoRefresh(() => fetchUsers(true));

  const handleUpdatePlan = async (userId: string, newPlan: string) => {
    try {
      const token = localStorage.getItem('supabase.auth.token') || sessionStorage.getItem('supabase.auth.token');
      if (!token) throw new Error('Not authenticated');
      const { currentSession } = JSON.parse(token);
      const accessToken = currentSession?.access_token;

      const headers = {
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      };

      const body = {
        plan: newPlan.toLowerCase(),
        plan_started_at: newPlan === 'Free' ? null : new Date().toISOString()
      };

      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(body)
      });

      if (!res.ok) throw new Error(await res.text());

      setToast({ message: `User plan updated to ${newPlan}`, type: 'success' });
      fetchUsers(); // Refresh
    } catch (err) {
      console.error('Error updating plan:', err);
      setToast({ message: 'Failed to update plan', type: 'error' });
    }
  };

  const calculateExpiry = (plan: string, startDate: string | null) => {
    if (!startDate || plan === 'Free') return 'N/A';
    
    const start = new Date(startDate);
    let daysToAdd = 0;
    if (plan === 'Starter') daysToAdd = 30;
    if (plan === 'Pro') daysToAdd = 90;
    if (plan === 'Achiever') daysToAdd = 365;

    const expiry = new Date(start);
    expiry.setDate(expiry.getDate() + daysToAdd);
    
    return expiry.toLocaleDateString();
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.full_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesPlan = 
      planFilter === 'all' || 
      (planFilter === 'paid' && user.plan !== 'Free') ||
      user.plan === planFilter;
    
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const exportUserCSV = () => {
    const headers = 'Name,Email,Phone,Plan,Plan Expiry,Registered\n';
    const rows = filteredUsers.map(u => 
      `${u.full_name},${u.email},${u.phone || ''},${u.plan},${calculateExpiry(u.plan, u.plan_started_at)},${new Date(u.created_at).toLocaleDateString()}`
    ).join('\n');
    const csvContent = headers + rows;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage users and subscriptions</p>
        </div>
        <div className="flex gap-3">
          <RefreshButton onClick={() => fetchUsers()} loading={loading} />
          <button
            onClick={exportUserCSV}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
          >
            <Download className="w-4 h-4" />
            Export CSV
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
          <div className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800">
            <div className="w-48">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Plan</label>
              <div className="relative">
                <button
                  onClick={() => setIsPlanOpen(!isPlanOpen)}
                  onBlur={() => setTimeout(() => setIsPlanOpen(false), 200)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-left flex items-center justify-between"
                >
                  <span className="capitalize">{planFilter === 'all' ? 'All Plans' : planFilter}</span>
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
                      {plan === 'all' ? 'All Plans' : plan === 'paid' ? 'Paid Plans' : plan}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Table */}
      <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto">
          {loading ? (
             <div className="p-20 text-center text-gray-500">Loading users...</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="text-left px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">User Details</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">Contact</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">Plan</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">Expiry</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredUsers
                  .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                  .map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900 dark:text-white">{user.full_name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      <p className="text-xs text-gray-400 mt-1">Joined: {new Date(user.created_at).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-4">
                       {user.phone ? (
                         <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                            {user.phone}
                         </div>
                       ) : (
                         <span className="text-gray-400 text-xs italic">No phone</span>
                       )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        user.plan !== 'Free' 
                          ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300' 
                          : 'bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400'
                      }`}>
                        {user.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                       <span className="text-gray-600 dark:text-gray-400 font-mono text-xs">
                          {calculateExpiry(user.plan, user.plan_started_at)}
                       </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative">
                        <button
                          onClick={() => setOpenActionDropdown(openActionDropdown === user.id ? null : user.id)}
                          onBlur={() => setTimeout(() => setOpenActionDropdown(null), 200)}
                          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          Actions
                          <ChevronDown className={`w-3 h-3 transition-transform ${openActionDropdown === user.id ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {openActionDropdown === user.id && (
                          <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 overflow-hidden">
                            {user.plan !== 'Free' && (
                              <button
                                onClick={() => setConfirmAction({ userId: user.id, userName: user.full_name, action: 'Revoke', plan: 'Free' })}
                                className="w-full text-left px-4 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              >
                                Revoke Plan
                              </button>
                            )}
                            {user.plan !== 'Pro' && (
                              <button
                                onClick={() => setConfirmAction({ userId: user.id, userName: user.full_name, action: 'Gift', plan: 'Pro' })}
                                className="w-full text-left px-4 py-2 text-xs text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                              >
                                Gift Pro
                              </button>
                            )}
                            {user.plan !== 'Achiever' && (
                              <button
                                onClick={() => setConfirmAction({ userId: user.id, userName: user.full_name, action: 'Gift', plan: 'Achiever' })}
                                className="w-full text-left px-4 py-2 text-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                              >
                                Gift Achiever
                              </button>
                            )}
                            {user.plan !== 'Starter' && (
                              <button
                                onClick={() => setConfirmAction({ userId: user.id, userName: user.full_name, action: 'Gift', plan: 'Starter' })}
                                className="w-full text-left px-4 py-2 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                              >
                                Gift Starter
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loading && filteredUsers.length === 0 && (
             <div className="p-12 text-center text-gray-500 dark:text-gray-400">
               <p>No users found</p>
             </div>
          )}
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredUsers.length / ITEMS_PER_PAGE)}
            onPageChange={setCurrentPage}
            totalItems={filteredUsers.length}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        </div>
      </div>
      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setConfirmAction(null)}>
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {confirmAction.action === 'Revoke' ? 'Revoke Plan' : `Gift ${confirmAction.plan} Plan`}
              </h3>
            </div>
            <div className="px-6 py-4">
              <p className="text-gray-600 dark:text-gray-400">
                {confirmAction.action === 'Revoke' 
                  ? `Are you sure you want to revoke the plan for "${confirmAction.userName}"? This will remove their subscription access.`
                  : `Are you sure you want to gift ${confirmAction.plan} plan to "${confirmAction.userName}"?`
                }
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleUpdatePlan(confirmAction.userId, confirmAction.plan);
                  setConfirmAction(null);
                }}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                  confirmAction.action === 'Revoke' 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {confirmAction.action === 'Revoke' ? 'Revoke Plan' : `Gift ${confirmAction.plan}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
