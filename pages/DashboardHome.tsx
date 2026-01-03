import React from 'react';
import { Megaphone, FileText, Crown, Clock, Phone, Lock } from 'lucide-react';
import RefreshButton from '../components/RefreshButton';
import { useUser } from '../context/UserContext';
import { Link } from 'react-router-dom';
import { usePayment } from '../hooks/usePayment';
import { useProfile } from '../hooks/useProfile';
import { supabase } from '../lib/supabase';
import { formatDistanceToNow } from 'date-fns';

const DashboardHome = () => {
  const { user, updateUser, refreshUser } = useUser();
  const { openPaymentModal } = usePayment();
  const { updateProfile } = useProfile();

  React.useEffect(() => {
    const checkPendingPlan = async () => {
      const pendingPlan = sessionStorage.getItem('pendingPlan');
      if (pendingPlan && user) {
        // Clear it immediately to prevent re-trigger
        sessionStorage.removeItem('pendingPlan');
        
        // Map plan IDs to amounts (in paise)
        const PLAN_DETAILS: Record<string, number> = {
          starter: 99900,
          pro: 249900,
          achiever: 499900
        };

        const amount = PLAN_DETAILS[pendingPlan];
        
        if (amount && user.plan !== pendingPlan) {
            // Small delay to ensure UI renders
            setTimeout(() => {
                openPaymentModal({
                    planId: pendingPlan,
                    amount,
                    onSuccess: async (response) => {
                        console.log('Auto-upgrade success', response);
                        const { success } = await updateProfile({ 
                          plan: pendingPlan as any,
                          plan_started_at: new Date().toISOString()
                        });
                        if (success) {
                            updateUser({ plan: pendingPlan as any });
                            alert(`Welcome to ${pendingPlan}! Your account has been upgraded.`);
                        }
                    }
                });
            }, 500);
        }
      }
    };
    
    checkPendingPlan();
    checkPendingPlan();
  }, [user]);

  // Fetch Recent Activity
  const [recentActivity, setRecentActivity] = React.useState<any[]>([]);
  const [loadingActivity, setLoadingActivity] = React.useState(true);

  const fetchActivity = React.useCallback(async () => {
      if (!user) return;
      setLoadingActivity(true);
      
      try {
        const [submissions, tickets, calls] = await Promise.all([
          supabase.from('submissions').select('id, paper_type, status, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(3),
          supabase.from('support_tickets').select('id, subject, status, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(3),
          supabase.from('guidance_calls').select('id, topic, status, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(3)
        ]);

        const combined = [
          ...(submissions.data || []).map(i => ({ ...i, type: 'submission', title: i.paper_type, icon: FileText, color: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400' })),
          ...(tickets.data || []).map(i => ({ ...i, type: 'ticket', title: i.subject, icon: Megaphone, color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' })),
          ...(calls.data || []).map(i => ({ ...i, type: 'call', title: i.topic, icon: Clock, color: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400' }))
        ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
         .slice(0, 3);
         
        setRecentActivity(combined);
      } catch (err) {
        console.error('Error fetching activity:', err);
      } finally {
        setLoadingActivity(false);
      }
    }, [user]);

  React.useEffect(() => {
    fetchActivity();
  }, [user, fetchActivity]);

  // Realtime subscription for auto-updates
  React.useEffect(() => {
    if (!user) return;

    console.log('Setting up realtime subscription for guidance calls...');
    const channel = supabase
      .channel('dashboard-guidance-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'guidance_calls',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Realtime update received:', payload);
          refreshUser(); // Update stats cards
          fetchActivity(); // Update recent activity list
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, refreshUser, fetchActivity]);
  
  if (!user) return null;

  const { 
    submissionsLeft, 
    totalSubmissions,
    submissionsCompleted,
    submissionsPending,
    submissionsUnderReview,
    plan: activePlan, 
    daysLeft, 
    announcement, 
    guidanceCallsLeft, 
    totalGuidanceCalls, 
    callsCompletedThisMonth,
    callsCancelled,
    callsPending 
  } = user;

  return (
    <div className="space-y-6">
      {/* Broadcast Banner */}
      {announcement && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-start gap-3">
          <Megaphone className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Announcement</p>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">{announcement}</p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Submissions Card */}
        <div className="bg-white dark:bg-gray-950 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all group hover:border-black dark:hover:border-indigo-500">
          <div className="flex items-center justify-between ">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {activePlan.toLowerCase() === 'free' ? 'Submissions Left' : 'Submissions'}
            </span>
            <div className="p-2 bg-indigo-50 dark:bg-gray-900 rounded-lg group-hover:bg-indigo-100 dark:group-hover:bg-gray-800 transition-colors">
              <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          
          {activePlan.toLowerCase() === 'free' ? (
            <>
              <div className="flex items-baseline gap-2">
                <p className={`text-3xl font-bold ${submissionsLeft > 0 ? 'text-gray-900 dark:text-white' : 'text-red-600 dark:text-red-400'}`}>
                  {submissionsLeft}
                </p>
                <span className="text-sm text-gray-400">/ {totalSubmissions} total</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">Resets in {daysLeft} days</p>
            </>
          ) : (
            <>
              <div className="flex items-baseline gap-2 mb-3">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">∞</p>
                <span className="text-sm text-gray-400">Unlimited</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="flex items-center justify-between gap-4 px-3 py-1.5 text-xs font-medium rounded-lg border border-yellow-500/50 bg-yellow-900/20 text-yellow-400">
                  <span>Pending</span>
                  <span>{submissionsPending}</span>
                </span>
                <span className="flex items-center justify-between gap-4 px-3 py-1.5 text-xs font-medium rounded-lg border border-green-500/50 bg-green-900/20 text-green-400">
                  <span>Completed</span>
                  <span>{submissionsCompleted}</span>
                </span>
                <span className="flex items-center justify-between gap-4 px-3 py-1.5 text-xs font-medium rounded-lg border border-blue-500/50 bg-blue-900/20 text-blue-400">
                  <span>Reviewing</span>
                  <span>{submissionsUnderReview}</span>
                </span>
              </div>
            </>
          )}
        </div>

        {/* Active Plan */}
        <div className="bg-white dark:bg-gray-950 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all group hover:border-black dark:hover:border-indigo-500">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Plan</span>
            <div className="p-2 bg-purple-50 dark:bg-gray-900 rounded-lg group-hover:bg-purple-100 dark:group-hover:bg-gray-800 transition-colors">
              <Crown className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{activePlan}</p>
            {activePlan.toLowerCase() !== 'free' && (
              <span className="text-xs font-medium px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">Active</span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {activePlan.toLowerCase() === 'free' ? 'Upgrade for more features' : 'Valid until Dec 20, 2025'}
          </p>
          <Link 
            to="/dashboard/plans" 
            className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
          >
            <Crown className="w-3.5 h-3.5" />
            {activePlan.toLowerCase() === 'free' ? 'Upgrade Now' : 'Manage Plan'}
          </Link>
        </div>

        {/* Days Left - Billing Cycle */}
        <div className="relative group overflow-hidden bg-white dark:bg-gray-950 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all hover:border-black dark:hover:border-indigo-500">
          {activePlan.toLowerCase() === 'free' && (
            <a href="/pricing" className="absolute inset-0 z-20 bg-white/60 dark:bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center cursor-pointer transition-opacity opacity-0 group-hover:opacity-100">
              <div className="p-3 bg-indigo-600 rounded-full shadow-lg mb-2 transform scale-90 group-hover:scale-100 transition-transform">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">Upgrade to Unlock</span>
            </a>
          )}
           
          {activePlan.toLowerCase() === 'free' && (
             <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
                 <Lock className="w-8 h-8 text-gray-400 dark:text-gray-600 mb-2" />
                 <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Locked Feature</span>
             </div>
          )}

          <div className={activePlan.toLowerCase() === 'free' ? 'blur-sm opacity-50' : ''}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Billing Cycle</span>
              <div className="p-2 bg-orange-50 dark:bg-gray-900 rounded-lg group-hover:bg-orange-100 dark:group-hover:bg-gray-800 transition-colors">
                <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {daysLeft}
              </p>
              <span className="text-sm text-gray-400">days left</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-900 rounded-full h-1.5 mt-3 overflow-hidden">
              <div className="bg-orange-500 h-full rounded-full" style={{ width: `${(daysLeft / 30) * 100}%` }}></div>
            </div>
          </div>
        </div>

        {/* Guidance Calls */}
        <div className="relative group overflow-hidden bg-white dark:bg-gray-950 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all hover:border-black dark:hover:border-indigo-500">
          {activePlan.toLowerCase() === 'free' && (
            <a href="/pricing" className="absolute inset-0 z-20 bg-white/60 dark:bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center cursor-pointer transition-opacity opacity-0 group-hover:opacity-100">
              <div className="p-3 bg-indigo-600 rounded-full shadow-lg mb-2 transform scale-90 group-hover:scale-100 transition-transform">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">Upgrade to Unlock</span>
            </a>
          )}
           
          {activePlan.toLowerCase() === 'free' && (
             <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
                 <Lock className="w-8 h-8 text-gray-400 dark:text-gray-600 mb-2" />
                 <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Locked Feature</span>
             </div>
          )}

          <div className={activePlan.toLowerCase() === 'free' ? 'blur-sm opacity-50' : ''}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Guidance Calls</span>
              <div className="p-2 bg-purple-50 dark:bg-gray-900 rounded-lg group-hover:bg-purple-100 dark:group-hover:bg-gray-800 transition-colors">
                <Phone className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-3">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">∞</p>
              <span className="text-sm text-gray-400">Unlimited</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="flex items-center justify-between gap-4 px-3 py-1.5 text-xs font-medium rounded-lg border border-yellow-500/50 bg-yellow-900/20 text-yellow-400">
                <span>Pending</span>
                <span>{callsPending}</span>
              </span>
              <span className="flex items-center justify-between gap-4 px-3 py-1.5 text-xs font-medium rounded-lg border border-green-500/50 bg-green-900/20 text-green-400">
                <span>Completed</span>
                <span>{callsCompletedThisMonth}</span>
              </span>
              <span className="flex items-center justify-between gap-4 px-3 py-1.5 text-xs font-medium rounded-lg border border-red-500/50 bg-red-900/20 text-red-400">
                <span>Cancelled</span>
                <span>{callsCancelled}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-950 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <a 
            href="/dashboard/submit" 
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-all group"
          >
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/60 transition-colors">
              <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">New Submission</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Upload a new answer copy</p>
            </div>
          </a>
          <a 
            href="/dashboard/history" 
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group"
          >
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/60 transition-colors">
              <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">View History</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Check past submissions</p>
            </div>
          </a>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-950 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
          <RefreshButton onClick={fetchActivity} loading={loadingActivity} />
        </div>
        <div className="space-y-4">
          {loadingActivity ? (
            <div className="text-center py-4 text-gray-500 text-sm">Loading activity...</div>
          ) : recentActivity.length > 0 ? (
            recentActivity.map((activity) => (
              <div key={`${activity.type}-${activity.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${activity.color}`}>
                    <activity.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{activity.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{activity.status}</p>
                  </div>
                </div>
                <span className="text-sm text-gray-400 whitespace-nowrap ml-2">
                  {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500 text-sm">No recent activity</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
