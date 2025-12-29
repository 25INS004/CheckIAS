import React from 'react';
import { Megaphone, FileText, Crown, Clock } from 'lucide-react';

// Mock user data - in real app, this would come from context/API
const userData = {
  submissionsLeft: 2,
  activePlan: 'Free', // 'Free' | 'Premium'
  daysLeft: 30,
  announcement: 'Due to high demand, evaluation times are extended to 48 hours this week. Thank you for your patience!'
};

const DashboardHome = () => {
  const { submissionsLeft, activePlan, daysLeft, announcement } = userData;

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
        {/* Submissions Left */}
        <div className="bg-white dark:bg-gray-950 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all group hover:border-black dark:hover:border-indigo-500">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Submissions Left</span>
            <div className="p-2 bg-indigo-50 dark:bg-gray-900 rounded-lg group-hover:bg-indigo-100 dark:group-hover:bg-gray-800 transition-colors">
              <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className={`text-3xl font-bold ${submissionsLeft > 0 ? 'text-gray-900 dark:text-white' : 'text-red-600 dark:text-red-400'}`}>
              {submissionsLeft}
            </p>
            <span className="text-sm text-gray-400">/ 5 total</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">Resets in 12 days</p>
        </div>

        {/* Active Plan */}
        <div className={`
          p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group
          ${activePlan === 'Free' 
            ? 'bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 hover:border-black dark:hover:border-indigo-500' 
            : 'bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-indigo-200 dark:shadow-none'}
        `}>
          <div className="flex items-center justify-between mb-4">
            <span className={`text-sm font-medium ${activePlan === 'Free' ? 'text-gray-500 dark:text-gray-400' : 'text-indigo-100'}`}>Current Plan</span>
            <div className={`p-2 rounded-lg transition-colors ${activePlan === 'Free' ? 'bg-purple-50 dark:bg-gray-900' : 'bg-white/10'}`}>
              <Crown className={`w-5 h-5 ${activePlan === 'Free' ? 'text-purple-600 dark:text-purple-400' : 'text-white'}`} />
            </div>
          </div>
          
          <div className="relative z-10">
            <p className={`text-3xl font-bold mb-1 ${activePlan === 'Free' ? 'text-gray-900 dark:text-white' : 'text-white'}`}>
              {activePlan}
            </p>
            <p className={`text-xs ${activePlan === 'Free' ? 'text-gray-400' : 'text-indigo-100 opacity-90'}`}>
              {activePlan === 'Free' ? 'Upgrade for more features' : 'Valid until Dec 20, 2025'}
            </p>
            <button className={`
              mt-4 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors border
              ${activePlan === 'Free' 
                ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-100 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/30' 
                : 'bg-white/20 text-white border-white/10 hover:bg-white/30'}
            `}>
              Manage Subscription
            </button>
          </div>

          {/* Decorative background for Premium */}
          {activePlan !== 'Free' && (
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <Crown className="w-24 h-24 transform translate-x-4 -translate-y-4" />
            </div>
          )}
        </div>

        {/* Days Left */}
        <div className="bg-white dark:bg-gray-950 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all group hover:border-black dark:hover:border-indigo-500">
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
            <div className="bg-orange-500 h-full rounded-full" style={{ width: '60%' }}></div>
          </div>
        </div>

        {/* Support Tickets */}
        <div className="bg-white dark:bg-gray-950 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all group hover:border-black dark:hover:border-indigo-500">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Support Tickets</span>
            <div className="p-2 bg-blue-50 dark:bg-gray-900 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-gray-800 transition-colors">
              <Megaphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              0
            </p>
            <span className="text-sm text-gray-400">open</span>
          </div>
           <p className="text-xs text-gray-400 mt-2">No pending issues</p>
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
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[
            { id: 1, type: 'submission', title: 'GS Paper 1 Evaluation', status: 'Completed', time: '2 hours ago', icon: FileText, color: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400' },
            { id: 2, type: 'ticket', title: 'Support Ticket #204', status: 'Resolved', time: '1 day ago', icon: Megaphone, color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' },
            { id: 3, type: 'submission', title: 'Essay Mock Test', status: 'Pending', time: '2 days ago', icon: Clock, color: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400' },
          ].map((activity) => (
            <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-800">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${activity.color}`}>
                  <activity.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{activity.title}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{activity.status}</p>
                </div>
              </div>
              <span className="text-sm text-gray-400">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
