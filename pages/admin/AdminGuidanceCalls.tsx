import React, { useState, useEffect } from 'react';
import { Search, Phone, Calendar, Clock, CheckCircle, XCircle, AlertCircle, ChevronDown, Video, RefreshCw, CheckSquare } from 'lucide-react';
import ConfirmationModal from '../../components/ConfirmationModal';
import Toast from '../../components/Toast';
import RefreshButton from '../../components/RefreshButton';

interface GuidanceCall {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_plan: string;
  topic: string;
  description: string;
  requested_date: string;
  requested_time: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
  created_at: string;
  meeting_link?: string;
}

const AdminGuidanceCalls = () => {
  const [calls, setCalls] = useState<GuidanceCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ type: 'confirm' | 'cancel' | 'complete', id: string } | null>(null);
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // Fetch Calls
  const fetchCalls = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('supabase.auth.token') || sessionStorage.getItem('supabase.auth.token');
      if (!token) return;
      const { currentSession } = JSON.parse(token);
      const accessToken = currentSession?.access_token;
      
      const headers = {
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${accessToken}`,
      };

      // 1. Fetch Calls
      const callsRes = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/guidance_calls?select=*&order=created_at.desc`,
        { headers }
      );
      const callsData = await callsRes.json();

      // 2. Fetch Profiles for User Info
      const profilesRes = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles?select=id,full_name,email,plan`,
        { headers }
      );
      const profilesData = await profilesRes.json();

      // Map profiles
      const userMap = new Map();
      profilesData.forEach((p: any) => {
        userMap.set(p.id, {
            name: p.full_name || 'Unknown',
            email: p.email || 'No Email',
            plan: p.plan || 'Free'
        });
      });

      // Merge Data
      const mergedCalls = callsData.map((c: any) => {
        const user = userMap.get(c.user_id) || { name: 'Unknown', email: 'Unknown', plan: 'Free' };
        return {
            id: c.id,
            user_id: c.user_id,
            user_name: user.name,
            user_email: user.email,
            user_plan: user.plan.charAt(0).toUpperCase() + user.plan.slice(1),
            topic: c.topic,
            description: c.description,
            requested_date: c.requested_date,
            requested_time: c.requested_time,
            status: c.status || 'Pending', // Handle null status
            created_at: c.created_at,
            meeting_link: c.meeting_link
        };
      });

      setCalls(mergedCalls);

    } catch (err) {
        console.error('Error fetching calls:', err);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalls();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setProcessing(true);
    try {
        const token = localStorage.getItem('supabase.auth.token') || sessionStorage.getItem('supabase.auth.token');
        if (!token) throw new Error('Not authenticated');
        const { currentSession } = JSON.parse(token);
        const accessToken = currentSession?.access_token;

        const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/guidance_calls?id=eq.${id}`, {
            method: 'PATCH',
            headers: {
                'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (!res.ok) {
            const err = await res.text();
            throw new Error(err);
        }

        // Update local state
        setCalls(prev => prev.map(c => c.id === id ? { ...c, status: newStatus as any } : c));
        setConfirmAction(null);
        setToast({ message: `Call marked as ${newStatus}`, type: 'success' });

    } catch (err) {
        console.error('Update failed:', err);
        setToast({ message: 'Failed to update status', type: 'error' });
    } finally {
        setProcessing(false);
    }
  };

  const filteredCalls = calls.filter(call => 
    (filterStatus === 'All' || call.status === filterStatus) &&
    (call.user_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     call.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
     call.topic.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Guidance Calls</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage and confirm mentorship call requests</p>
        </div>
        
        <div className="flex items-center gap-3">
          <RefreshButton onClick={fetchCalls} loading={loading} />

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search calls..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none w-64"
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
              onBlur={() => setTimeout(() => setIsStatusDropdownOpen(false), 200)}
              className="flex items-center justify-between w-40 px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            >
              <span className="truncate">{filterStatus === 'All' ? 'All Status' : filterStatus}</span>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isStatusDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            <div className={`absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-10 overflow-hidden transition-all duration-200 origin-top-right ${isStatusDropdownOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
              <div className="py-1">
                {['All', 'Requested', 'Confirmed', 'Completed', 'Cancelled'].map((option) => (
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
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Pending Card */}
        <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800/50 rounded-xl p-4 flex items-center gap-3">
          <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg text-yellow-600 dark:text-yellow-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
              {calls.filter(c => c.status?.toLowerCase() === 'pending' || c.status?.toLowerCase() === 'requested').length}
            </p>
            <p className="text-xs font-medium text-yellow-600 dark:text-yellow-400">Pending Requests</p>
          </div>
        </div>

        {/* Confirmed Card */}
        <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/50 rounded-xl p-4 flex items-center gap-3">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-green-700 dark:text-green-300">
              {calls.filter(c => c.status?.toLowerCase() === 'confirmed').length}
            </p>
            <p className="text-xs font-medium text-green-600 dark:text-green-400">Confirmed</p>
          </div>
        </div>

        {/* Completed Card */}
        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/50 rounded-xl p-4 flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {calls.filter(c => c.status?.toLowerCase() === 'completed').length}
            </p>
            <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Completed</p>
          </div>
        </div>

        {/* Cancelled Card - The Requested Feature */}
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/50 rounded-xl p-4 flex items-center gap-3">
          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-red-700 dark:text-red-300">
              {calls.filter(c => c.status?.toLowerCase() === 'cancelled').length}
            </p>
            <p className="text-xs font-medium text-red-600 dark:text-red-400">Cancelled</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="px-6 py-4">Call Details</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Scheduled For</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredCalls.map((call) => (
                <tr key={call.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-purple-50 dark:bg-purple-900/40 rounded-lg text-purple-600 dark:text-purple-400 mt-1">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{call.topic}</p>
                        <p className="text-xs text-gray-400 mt-0.5">#{call.id.slice(0,8)}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs truncate">{call.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900 dark:text-white">{call.user_name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{call.user_email}</p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 mt-1">
                      {call.user_plan}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-900 dark:text-white font-medium">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(call.requested_date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <Clock className="w-3.5 h-3.5" />
                        {call.requested_time}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      call.status?.toLowerCase() === 'confirmed'
                        ? 'bg-green-50 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-100 dark:border-green-900/50'
                        : call.status?.toLowerCase() === 'completed'
                        ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-900/50'
                        : call.status?.toLowerCase() === 'cancelled'
                        ? 'bg-red-50 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-100 dark:border-red-900/50'
                        : 'bg-yellow-50 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 border-yellow-100 dark:border-yellow-900/50'
                    }`}>
                      {call.status?.toLowerCase() === 'confirmed' ? <CheckCircle className="w-3 h-3" /> : 
                       call.status?.toLowerCase() === 'completed' ? <CheckSquare className="w-3 h-3" /> :
                       call.status?.toLowerCase() === 'cancelled' ? <XCircle className="w-3 h-3" /> :
                       <Clock className="w-3 h-3" />}
                      {call.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                        {/* Actions based on Status */}
                        {(call.status?.toLowerCase() === 'pending' || call.status?.toLowerCase() === 'requested') && (
                            <>
                                <button 
                                    onClick={() => setConfirmAction({ type: 'confirm', id: call.id })}
                                    className="px-3 py-1.5 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-md shadow-green-200 dark:shadow-none transition-all"
                                >
                                    Confirm
                                </button>
                                <button 
                                    onClick={() => setConfirmAction({ type: 'cancel', id: call.id })}
                                    className="px-3 py-1.5 text-xs font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-md shadow-red-200 dark:shadow-none transition-all"
                                >
                                    Cancel
                                </button>
                            </>
                        )}
                        {call.status?.toLowerCase() === 'confirmed' && (
                            <button 
                                onClick={() => setConfirmAction({ type: 'complete', id: call.id })}
                                className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md shadow-blue-200 dark:shadow-none transition-all flex items-center gap-1"
                            >
                                Completed
                            </button>
                        )}
                        {call.status?.toLowerCase() === 'confirmed' && (
                             <button 
                                onClick={() => setConfirmAction({ type: 'cancel', id: call.id })}
                                className="px-3 py-1.5 text-xs font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-md shadow-red-200 dark:shadow-none transition-all"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredCalls.length === 0 && (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">
              <AlertCircle className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <p>No calls found matching your criteria</p>
            </div>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => {
          if (confirmAction?.type === 'confirm') handleUpdateStatus(confirmAction.id, 'Confirmed');
          else if (confirmAction?.type === 'cancel') handleUpdateStatus(confirmAction.id, 'Cancelled');
          else if (confirmAction?.type === 'complete') handleUpdateStatus(confirmAction.id, 'Completed');
        }}
        title={
            confirmAction?.type === 'confirm' ? "Confirm Call?" : 
            confirmAction?.type === 'complete' ? "Mark Completed?" :
            "Cancel Call?"
        }
        message={
            confirmAction?.type === 'confirm' ? "Are you sure you want to confirm this mentorship call?" :
            confirmAction?.type === 'complete' ? "Have you completed the mentorship session?" :
            "Are you sure you want to cancel this mentorship call request?"
        }
        confirmText={
            confirmAction?.type === 'confirm' ? "Confirm Call" : 
            confirmAction?.type === 'complete' ? "Mark Completed" :
            "Cancel Call"
        }
        confirmStyle={
            confirmAction?.type === 'confirm' ? "bg-green-600 hover:bg-green-700 text-white" : 
            confirmAction?.type === 'complete' ? "bg-blue-600 hover:bg-blue-700 text-white" :
            "bg-red-600 hover:bg-red-700 text-white"
        }
      />
    </div>
  );
};

export default AdminGuidanceCalls;
