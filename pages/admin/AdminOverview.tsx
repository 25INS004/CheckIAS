import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { DollarSign, Users, Clock, TrendingUp, FileText, Download, Megaphone, X, Phone, RefreshCw } from 'lucide-react';
import { useAutoRefresh } from '../../hooks/useAutoRefresh';
import { useUser } from '../../context/UserContext';
import { supabase } from '../../lib/supabase';

// Plan prices for revenue calculation
const PLAN_PRICES: Record<string, number> = {
  starter: 999,
  pro: 2499,
  achiever: 4999,
};

interface DashboardStats {
  totalUsers: number;
  freeUsers: number;
  starterUsers: number;
  proUsers: number;
  achieverUsers: number;
  totalRevenue: number;
  totalSubmissions: number;
  pendingSubmissions: number;
  completedSubmissions: number;
  totalCalls: number;
  pendingCalls: number;
  completedCalls: number;
  cancelledCalls: number;
  submissionTrend: number[];
  revenueByPlan: { starter: number; pro: number; achiever: number };
  monthlyRevenue: { month: string; revenue: number; starter: number; pro: number; achiever: number }[];
}

const AdminOverview = () => {
  const { toast } = useToast();
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [revenueView, setRevenueView] = useState<'list' | 'chart'>('list');
  const [recipient, setRecipient] = useState('all');
  const [isRecipientOpen, setIsRecipientOpen] = useState(false);
  const [chartColor, setChartColor] = useState('#16a34a');
  const [barColor, setBarColor] = useState('#6366f1');
  const [loading, setLoading] = useState(true);
  const [chartTooltip, setChartTooltip] = useState<{ 
    show: boolean; 
    x: number; 
    y: number; 
    month: string;
    total: number;
    starter: number;
    pro: number;
    achiever: number;
  }>({ show: false, x: 0, y: 0, month: '', total: 0, starter: 0, pro: 0, achiever: 0 });
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    freeUsers: 0,
    starterUsers: 0,
    proUsers: 0,
    achieverUsers: 0,
    totalRevenue: 0,
    totalSubmissions: 0,
    pendingSubmissions: 0,
    completedSubmissions: 0,
    totalCalls: 0,
    pendingCalls: 0,
    completedCalls: 0,
    cancelledCalls: 0,
    submissionTrend: [0, 0, 0, 0, 0, 0, 0],
    revenueByPlan: { starter: 0, pro: 0, achiever: 0 },
    monthlyRevenue: [],
  });

  // Fetch all dashboard data
  const fetchDashboardData = async (background = false) => {
    if (!background) setLoading(true);
    
    try {
      const token = localStorage.getItem('supabase.auth.token') || sessionStorage.getItem('supabase.auth.token');
      if (!token) return;
      
      const { currentSession } = JSON.parse(token);
      const accessToken = currentSession?.access_token;
      
      const headers = {
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${accessToken}`,
      };

      // Fetch all profiles
      const profilesRes = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles?select=id,plan,role,created_at,plan_started_at`,
        { headers }
      );
      const profilesData = await profilesRes.json();
      
      // Fetch all invoices for accurate revenue
      const invoicesRes = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/invoices?select=amount,final_amount,plan_purchased,invoice_date`,
        { headers }
      );
      const invoicesData = await invoicesRes.json();
      
      // Filter out admin users from stats
      const profiles = profilesData.filter((p: any) => p.role !== 'admin');

      // Count users by plan
      const freeUsers = profiles.filter((p: any) => p.plan === 'free').length;
      const starterUsers = profiles.filter((p: any) => p.plan === 'starter').length;
      const proUsers = profiles.filter((p: any) => p.plan === 'pro').length;
      const achieverUsers = profiles.filter((p: any) => p.plan === 'achiever').length;
      const totalUsers = profiles.length;

      // Calculate revenue from REAL INVOICES
      const revenueByPlan = {
        starter: 0,
        pro: 0,
        achiever: 0,
      };
      
      let totalRevenue = 0;
      
      if (Array.isArray(invoicesData)) {
        invoicesData.forEach((inv: any) => {
          totalRevenue += inv.final_amount || 0;
          
          const plan = inv.plan_purchased?.toLowerCase();
          if (plan === 'starter') revenueByPlan.starter += inv.final_amount || 0;
          else if (plan === 'pro') revenueByPlan.pro += inv.final_amount || 0;
          else if (plan === 'achiever') revenueByPlan.achiever += inv.final_amount || 0;
        });
      }

      // Calculate monthly revenue from INVOICES
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const now = new Date();
      const last6Months: { month: string; revenue: number; starter: number; pro: number; achiever: number }[] = [];
      
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
        const monthName = monthNames[monthDate.getMonth()];
        
        let starterRev = 0, proRev = 0, achieverRev = 0;
        
        if (Array.isArray(invoicesData)) {
          invoicesData.forEach((inv: any) => {
            if (!inv.invoice_date) return;
            
            const invDate = new Date(inv.invoice_date);
            const invMonthKey = `${invDate.getFullYear()}-${String(invDate.getMonth() + 1).padStart(2, '0')}`;
            
            if (invMonthKey === monthKey) {
              const amount = inv.final_amount || 0;
              const plan = inv.plan_purchased?.toLowerCase();
              
              if (plan === 'starter') starterRev += amount;
              else if (plan === 'pro') proRev += amount;
              else if (plan === 'achiever') achieverRev += amount;
            }
          });
        }
        
        last6Months.push({
          month: monthName,
          revenue: starterRev + proRev + achieverRev,
          starter: starterRev,
          pro: proRev,
          achiever: achieverRev,
        });
      }

      // Fetch all submissions
      const submissionsRes = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/submissions?select=id,status,created_at`,
        { headers }
      );
      const submissions = await submissionsRes.json();
      
      const totalSubmissions = submissions.length;
      const pendingSubmissions = submissions.filter((s: any) => {
        const status = s.status?.toLowerCase();
        return status === 'pending' || status === 'draft' || status === 'open';
      }).length;

      const completedSubmissions = submissions.filter((s: any) => {
        const status = s.status?.toLowerCase();
        return status === 'reviewed' || status === 'completed' || status === 'evaluated' || status === 'resolved';
      }).length;

      // Calculate submission trend (last 7 days, proper date comparison)
      const submissionTrend = Array(7).fill(0);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today
      
      submissions.forEach((s: any) => {
        if (!s.created_at) return;
        const created = new Date(s.created_at);
        
        // Check each of the last 7 days
        for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
          const dayStart = new Date(today);
          dayStart.setDate(today.getDate() - dayOffset);
          dayStart.setHours(0, 0, 0, 0);
          
          const dayEnd = new Date(today);
          dayEnd.setDate(today.getDate() - dayOffset);
          dayEnd.setHours(23, 59, 59, 999);
          
          if (created >= dayStart && created <= dayEnd) {
            submissionTrend[6 - dayOffset]++;
            break;
          }
        }
      });

      // Fetch all guidance calls
      const callsRes = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/guidance_calls?select=id,status`,
        { headers }
      );
      const calls = await callsRes.json();
      
      const totalCalls = calls.length;
      const pendingCalls = calls.filter((c: any) => 
        c.status?.toLowerCase() === 'pending'
      ).length;
      const completedCalls = calls.filter((c: any) => 
        c.status?.toLowerCase() === 'completed' || c.status?.toLowerCase() === 'confirmed'
      ).length;
      const cancelledCalls = calls.filter((c: any) => 
        c.status?.toLowerCase() === 'cancelled'
      ).length;

      setStats({
        totalUsers,
        freeUsers,
        starterUsers,
        proUsers,
        achieverUsers,
        totalRevenue,
        totalSubmissions,
        pendingSubmissions,
        completedSubmissions,
        totalCalls,
        pendingCalls,
        completedCalls,
        cancelledCalls,
        submissionTrend,
        revenueByPlan,
        monthlyRevenue: last6Months,
      });
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    }
    
    if (!background) setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useAutoRefresh(() => fetchDashboardData(true));
  const { user } = useUser();

  const handleBroadcast = async () => {
    if (!announcement.trim()) return;

    try {
      setLoading(true);
      
      // Get token from localStorage/sessionStorage
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
      if (!token) {
        toast.error('Not authenticated. Please log in again.');
        setLoading(false);
        return;
      }
      
      console.log('DEBUG - Using token for broadcast');
      
      // Use direct fetch to bypass Supabase SDK RLS issues
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/announcements`,
        {
          method: 'POST',
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            message: announcement,
            recipient_group: recipient,
            created_by: user?.id,
            is_active: true
          })
        }
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to broadcast');
      }

      toast.success('Announcement broadcasted successfully!');
      setAnnouncement('');
      setShowAnnouncementModal(false);
    } catch (error: any) {
      console.error('Error broadcasting announcement:', error);
      toast.error(`Failed to broadcast: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const generateCSVReport = () => {
    const csvContent = `Monthly Report - ${new Date().toLocaleDateString()}
    
Total Users,${stats.totalUsers}
Free Users,${stats.freeUsers}
Starter Users,${stats.starterUsers}
Pro Users,${stats.proUsers}
Achiever Users,${stats.achieverUsers}
Total Revenue,₹${stats.totalRevenue.toLocaleString()}
Total Submissions,${stats.totalSubmissions}
Pending Submissions,${stats.pendingSubmissions}
Total Guidance Calls,${stats.totalCalls}
Pending Calls,${stats.pendingCalls}
Cancelled Calls,${stats.cancelledCalls}`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `checkias_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)}L`;
    }
    return `₹${amount.toLocaleString()}`;
  };

  const premiumUsers = stats.starterUsers + stats.proUsers + stats.achieverUsers;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Overview</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Monitor platform performance and metrics</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => fetchDashboardData()}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowAnnouncementModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all"
          >
            <Megaphone className="w-4 h-4" />
            Broadcast
          </button>
          <button
            onClick={generateCSVReport}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      )}

      {/* Stats Row */}
      {!loading && (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Users & Tier Breakdown */}
            <div className="bg-white dark:bg-gray-950 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all group hover:border-black dark:hover:border-indigo-500">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">User Base</span>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalUsers.toLocaleString()}</p>
              <div className="flex items-center gap-2 mt-3 text-xs font-medium flex-wrap">
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-md">
                  {stats.freeUsers} Free
                </span>
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-md">
                  {stats.starterUsers} Starter
                </span>
                <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-md">
                  {stats.proUsers} Pro
                </span>
                <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-md">
                  {stats.achieverUsers} Achiever
                </span>
              </div>
            </div>

            {/* Revenue Stats */}
            <div className="bg-white dark:bg-gray-950 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all group hover:border-black dark:hover:border-indigo-500">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue</span>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.totalRevenue)}</p>
              <div className="flex items-center gap-2 mt-3 text-xs font-medium flex-wrap">
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-md" title={`${stats.starterUsers} × ₹999`}>
                  Starter: ₹{stats.revenueByPlan.starter.toLocaleString()}
                </span>
                <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-md" title={`${stats.proUsers} × ₹2,499`}>
                  Pro: ₹{stats.revenueByPlan.pro.toLocaleString()}
                </span>
                <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-md" title={`${stats.achieverUsers} × ₹4,999`}>
                  Achiever: ₹{stats.revenueByPlan.achiever.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Guidance Calls */}
            <div className="bg-white dark:bg-gray-950 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all group hover:border-black dark:hover:border-indigo-500">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
                  <Phone className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Guidance Calls</span>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalCalls}</p>
              <div className="flex items-center gap-2 mt-3 text-xs font-medium flex-wrap">
                <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 rounded-md">
                  {stats.pendingCalls} Pending
                </span>
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded-md">
                  {stats.completedCalls} Completed
                </span>
                <span className="px-2 py-1 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-md">
                  {stats.cancelledCalls} Cancelled
                </span>
              </div>
            </div>

            {/* Submission Review */}
            <div className="bg-white dark:bg-gray-950 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all group hover:border-black dark:hover:border-indigo-500">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg">
                  <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Submissions</span>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalSubmissions}</p>
              <div className="flex items-center gap-3 mt-3 text-xs font-medium">
                <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 rounded-md">
                  {stats.pendingSubmissions} Pending
                </span>
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded-md">
                  {stats.completedSubmissions} Reviewed
                </span>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Submission Trends */}
            <div className="bg-white dark:bg-gray-950 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all hover:border-black dark:hover:border-indigo-500">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Submission Trends (7 Days)</h3>
                </div>
                <div className="relative group">
                  <div 
                    className="w-9 h-9 rounded-xl shadow-md cursor-pointer border-2 border-white dark:border-gray-800 ring-2 ring-gray-200 dark:ring-gray-700 hover:ring-indigo-400 dark:hover:ring-indigo-500 transition-all hover:scale-105"
                    style={{ backgroundColor: barColor }}
                    onClick={() => document.getElementById('barColorPicker')?.click()}
                    title="Click to change bar color"
                  />
                  <input 
                    id="barColorPicker"
                    type="color" 
                    value={barColor}
                    onChange={(e) => setBarColor(e.target.value)}
                    className="absolute opacity-0 w-0 h-0"
                  />
                </div>
              </div>
              
              {/* Bar Chart */}
              <div className="flex items-end justify-between gap-3" style={{ height: '180px' }}>
                {stats.submissionTrend.map((value, idx) => {
                  const maxValue = Math.max(...stats.submissionTrend, 1);
                  const barHeight = Math.max(Math.round((value / maxValue) * 160), 4);
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full rounded-t-lg transition-all hover:opacity-80"
                        style={{ 
                          height: `${barHeight}px`,
                          background: `linear-gradient(to top, ${barColor}, ${barColor}99)`,
                          maxWidth: '48px',
                          margin: '0 auto'
                        }}
                      />
                    </div>
                  );
                })}
              </div>
              
              {/* Value Labels */}
              <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                {stats.submissionTrend.map((value, idx) => (
                  <div key={idx} className="flex-1 text-center">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{value}</span>
                  </div>
                ))}
              </div>
              
              {/* Day Labels */}
              <div className="flex gap-3 mt-1">
                {(() => {
                  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                  const today = new Date().getDay();
                  const labels = [];
                  for (let i = 6; i >= 0; i--) {
                    labels.push(days[(today - i + 7) % 7]);
                  }
                  return labels.map((day, idx) => (
                    <div key={idx} className="flex-1 text-center text-xs text-gray-500 dark:text-gray-400">{day}</div>
                  ));
                })()}
              </div>
            </div>

            {/* Revenue Analytics */}
            <div className="bg-white dark:bg-gray-950 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all flex flex-col group hover:border-black dark:hover:border-indigo-500">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue Breakdown</h3>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Color Picker */}
                  <div className="relative">
                    <div 
                      className="w-9 h-9 rounded-xl shadow-md cursor-pointer border-2 border-white dark:border-gray-800 ring-2 ring-gray-200 dark:ring-gray-700 hover:ring-indigo-400 dark:hover:ring-indigo-500 transition-all hover:scale-105"
                      style={{ backgroundColor: chartColor }}
                      onClick={() => document.getElementById('chartColorPicker')?.click()}
                      title="Click to change color"
                    />
                    <input 
                      id="chartColorPicker"
                      type="color" 
                      value={chartColor}
                      onChange={(e) => setChartColor(e.target.value)}
                      className="absolute opacity-0 w-0 h-0"
                    />
                  </div>
                  
                  {/* View Toggle */}
                  <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                    <button 
                      onClick={() => setRevenueView('list')}
                      className={`p-1.5 rounded-md transition-all ${revenueView === 'list' ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                      title="List View"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => setRevenueView('chart')}
                      className={`p-1.5 rounded-md transition-all ${revenueView === 'chart' ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                      title="Chart View"
                    >
                      <TrendingUp className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex-1">
                {revenueView === 'list' ? (
                  /* List View */
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600 dark:text-gray-400">Starter Plan ({stats.starterUsers} users)</span>
                        <span className="font-semibold text-gray-900 dark:text-white">₹{stats.revenueByPlan.starter.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3">
                        <div 
                          className="h-3 rounded-full transition-all" 
                          style={{ 
                            width: `${stats.totalRevenue > 0 ? (stats.revenueByPlan.starter / stats.totalRevenue) * 100 : 0}%`, 
                            background: `linear-gradient(to right, ${chartColor}, ${chartColor}cc)` 
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600 dark:text-gray-400">Pro Plan ({stats.proUsers} users)</span>
                        <span className="font-semibold text-gray-900 dark:text-white">₹{stats.revenueByPlan.pro.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3">
                        <div 
                          className="h-3 rounded-full transition-all" 
                          style={{ 
                            width: `${stats.totalRevenue > 0 ? (stats.revenueByPlan.pro / stats.totalRevenue) * 100 : 0}%`, 
                            background: `linear-gradient(to right, ${chartColor}dd, ${chartColor}99)` 
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600 dark:text-gray-400">Achiever Plan ({stats.achieverUsers} users)</span>
                        <span className="font-semibold text-gray-900 dark:text-white">₹{stats.revenueByPlan.achiever.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3">
                        <div 
                          className="h-3 rounded-full transition-all" 
                          style={{ 
                            width: `${stats.totalRevenue > 0 ? (stats.revenueByPlan.achiever / stats.totalRevenue) * 100 : 0}%`, 
                            background: `linear-gradient(to right, ${chartColor}bb, ${chartColor}77)` 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Chart View - Line Chart */
                  <div className="h-full flex flex-col animate-fade-in">
                    <div className="flex-1 relative flex items-end pb-6 px-2 min-h-[200px]">
                      {/* Grid lines */}
                      <div className="absolute inset-0 flex flex-col justify-between text-xs text-gray-400 dark:text-gray-500 pointer-events-none">
                        {[4, 3, 2, 1, 0].map(i => (
                          <div key={i} className="border-b border-gray-100 dark:border-gray-700 h-0 w-full relative">
                            <span className="absolute -top-2 -left-0">{(stats.totalRevenue / 5 * (i + 1) / 1000).toFixed(0)}K</span>
                          </div>
                        ))}
                      </div>

                      {/* SVG Line Chart */}
                      <svg className="w-full h-full overflow-visible z-10" viewBox="0 0 500 200" preserveAspectRatio="none">
                        {/* Area gradient */}
                        <defs>
                          <linearGradient id="revenueGradient" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor={chartColor} stopOpacity="0.2" />
                            <stop offset="100%" stopColor={chartColor} stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        
                        {(() => {
                          // Use real monthly revenue data from database
                          const monthlyData = stats.monthlyRevenue.length > 0 
                            ? stats.monthlyRevenue 
                            : [{ month: 'No Data', revenue: 0, starter: 0, pro: 0, achiever: 0 }];
                          
                          const revenueValues = monthlyData.map(m => m.revenue);
                          const maxVal = Math.max(...revenueValues);
                          const minVal = Math.min(...revenueValues);
                          
                          // Handle case where all values are 0 or same
                          const max = maxVal === 0 ? 100 : maxVal;
                          const min = maxVal === minVal ? 0 : minVal;
                          const range = max - min || 1;
                          
                          const width = 500;
                          const height = 200;
                          const stepX = monthlyData.length > 1 ? width / (monthlyData.length - 1) : width / 2;
                          
                          const getY = (val: number) => {
                            // Scale Y so that 0 is at bottom, max is at top with padding
                            const normalizedVal = (val - min) / range;
                            return height - (normalizedVal * (height * 0.8)) - (height * 0.1);
                          };
                          
                          const getLinePath = (data: number[]) => {
                            return data.map((val, i) => {
                              const x = monthlyData.length === 1 ? width / 2 : i * stepX;
                              const y = getY(val);
                              return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                            }).join(' ');
                          };
                          
                          return (
                            <>
                              {/* Area path */}
                              {monthlyData.length > 1 && (
                                <path 
                                  d={`${getLinePath(revenueValues)} L ${width} ${height} L 0 ${height} Z`} 
                                  fill="url(#revenueGradient)" 
                                />
                              )}
                              
                              {/* Line path */}
                              <path 
                                d={getLinePath(revenueValues)} 
                                fill="none" 
                                stroke={chartColor}
                                strokeWidth="3" 
                                vectorEffect="non-scaling-stroke"
                              />

                              {/* Data Points with hover tooltip */}
                              {monthlyData.map((monthData, i) => {
                                const x = monthlyData.length === 1 ? width / 2 : i * stepX;
                                const y = getY(monthData.revenue);
                                const tooltipContent = `${monthData.month}: ₹${monthData.revenue.toLocaleString()} | Starter: ₹${monthData.starter.toLocaleString()} | Pro: ₹${monthData.pro.toLocaleString()} | Achiever: ₹${monthData.achiever.toLocaleString()}`;
                                return (
                                  <g key={i}>
                                    <circle 
                                      cx={x} 
                                      cy={y} 
                                      r="10" 
                                      fill="#fff" 
                                      stroke={chartColor} 
                                      strokeWidth="3" 
                                      style={{ cursor: 'pointer' }}
                                      onMouseEnter={(e) => {
                                        const rect = (e.target as SVGCircleElement).getBoundingClientRect();
                                        setChartTooltip({ 
                                          show: true, 
                                          x: rect.left + rect.width / 2, 
                                          y: rect.top - 10, 
                                          month: monthData.month,
                                          total: monthData.revenue,
                                          starter: monthData.starter,
                                          pro: monthData.pro,
                                          achiever: monthData.achiever
                                        });
                                      }}
                                      onMouseLeave={() => setChartTooltip(prev => ({ ...prev, show: false }))}
                                    />
                                    {/* Value label on dot */}
                                    <text 
                                      x={x} 
                                      y={y - 18} 
                                      textAnchor="middle" 
                                      className="fill-gray-600 dark:fill-gray-300 text-[10px] font-medium"
                                    >
                                      ₹{monthData.revenue > 0 ? (monthData.revenue / 1000).toFixed(1) + 'K' : '0'}
                                    </text>
                                  </g>
                                );
                              })}
                            </>
                          );
                        })()}
                      </svg>

                      {/* Beautiful Tooltip Card */}
                      {chartTooltip.show && (() => {
                        // Calculate responsive position
                        const tooltipWidth = 220;
                        const tooltipHeight = 180;
                        const padding = 16;
                        const viewportWidth = window.innerWidth;
                        
                        // Clamp X position to stay within viewport
                        let xPos = chartTooltip.x;
                        const minX = tooltipWidth / 2 + padding;
                        const maxX = viewportWidth - tooltipWidth / 2 - padding;
                        xPos = Math.max(minX, Math.min(maxX, xPos));
                        
                        // If tooltip would go above viewport, show below the dot
                        const showBelow = chartTooltip.y < tooltipHeight + padding;
                        
                        return (
                          <div 
                            className="fixed z-50 pointer-events-none"
                            style={{ 
                              left: xPos, 
                              top: showBelow ? chartTooltip.y + 30 : chartTooltip.y, 
                              transform: showBelow ? 'translate(-50%, 0)' : 'translate(-50%, -100%)'
                            }}
                          >
                          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 min-w-[200px]">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100 dark:border-gray-700">
                              <span className="text-sm font-bold text-gray-900 dark:text-white">{chartTooltip.month}</span>
                              <span className="text-lg font-bold text-green-600 dark:text-green-400">₹{chartTooltip.total.toLocaleString()}</span>
                            </div>
                            {/* Plan Breakdown */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                                  <span className="text-xs text-gray-600 dark:text-gray-300">Starter</span>
                                </div>
                                <span className="text-xs font-semibold text-gray-900 dark:text-white">₹{chartTooltip.starter.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div>
                                  <span className="text-xs text-gray-600 dark:text-gray-300">Pro</span>
                                </div>
                                <span className="text-xs font-semibold text-gray-900 dark:text-white">₹{chartTooltip.pro.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                                  <span className="text-xs text-gray-600 dark:text-gray-300">Achiever</span>
                                </div>
                                <span className="text-xs font-semibold text-gray-900 dark:text-white">₹{chartTooltip.achiever.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                          {/* Arrow */}
                          <div className="flex justify-center">
                            <div className={`w-3 h-3 bg-white dark:bg-gray-800 border-r border-b border-gray-200 dark:border-gray-700 transform ${showBelow ? 'rotate-[225deg] -mt-1' : 'rotate-45 -mt-1.5'}`}></div>
                          </div>
                        </div>
                        );
                      })()}
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2 px-1">
                      {stats.monthlyRevenue.map((m) => <span key={m.month}>{m.month}</span>)}
                    </div>
                    <div className="text-center mt-4">
                      <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-full" style={{ backgroundColor: `${chartColor}20`, color: chartColor }}>
                        <TrendingUp className="w-3 h-3" /> Total: {formatCurrency(stats.totalRevenue)}
                      </span>
                    </div>
                  </div>
                )}

                {revenueView === 'list' && (
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center mt-6">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Plan Distribution</span>
                    <div className="flex gap-4 text-xs text-gray-600 dark:text-gray-300">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: chartColor, opacity: 0.6 }}></div> Starter
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: chartColor, opacity: 0.8 }}></div> Pro
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: chartColor }}></div> Achiever
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Broadcast Announcement Modal */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Broadcast Announcement</h3>
              <button onClick={() => setShowAnnouncementModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recipient Group</label>
                <div className="relative">
                  <button
                    onClick={() => setIsRecipientOpen(!isRecipientOpen)}
                    onBlur={() => setTimeout(() => setIsRecipientOpen(false), 200)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-left flex items-center justify-between"
                  >
                    <span className="capitalize">
                      {recipient === 'all' ? 'All Users' : 
                       recipient === 'free' ? 'Free Users' :
                       recipient === 'paid' ? 'All Paid Plan Users' :
                       recipient === 'starter' ? 'Starter Plan' :
                       recipient === 'pro' ? 'Pro Plan' :
                       recipient === 'achiever' ? 'Achiever Plan' : recipient}
                    </span>
                    <svg className={`w-4 h-4 text-gray-500 transition-transform ${isRecipientOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  <div className={`absolute top-full left-0 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-20 overflow-hidden transition-all origin-top ${isRecipientOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                    {[
                      { value: 'all', label: 'All Users' },
                      { value: 'free', label: 'Free Users' },
                      { value: 'paid', label: 'All Paid Plan Users' },
                      { value: 'starter', label: 'Starter Plan' },
                      { value: 'pro', label: 'Pro Plan' },
                      { value: 'achiever', label: 'Achiever Plan' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setRecipient(option.value);
                          setIsRecipientOpen(false);
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 ${recipient === option.value ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : 'text-gray-900 dark:text-white'}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message</label>
                <textarea
                  value={announcement}
                  onChange={(e) => setAnnouncement(e.target.value)}
                  placeholder="Enter announcement message..."
                  className="w-full h-32 px-4 py-3 border border-gray-300 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none bg-white dark:bg-gray-950 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">This message will be displayed on all selected user dashboards.</p>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAnnouncementModal(false)}
                className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBroadcast}
                className="flex-1 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
              >
                Broadcast
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOverview;
