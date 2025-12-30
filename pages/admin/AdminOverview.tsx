import React, { useState } from 'react';
import { DollarSign, Users, Clock, TrendingUp, FileText, Download, Megaphone, X, Phone } from 'lucide-react';

const AdminOverview = () => {
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [revenueView, setRevenueView] = useState<'list' | 'chart'>('list');
  const [recipient, setRecipient] = useState('all');
  const [isRecipientOpen, setIsRecipientOpen] = useState(false);
  const [chartColor, setChartColor] = useState('#16a34a'); // green-600
  const [barColor, setBarColor] = useState('#6366f1'); // indigo-500

  // Mock stats - in real app would come from API
  const stats = {
    totalUsers: 1247,
    activeSubscriptions: 342,
    totalRevenue: '₹4,25,000',
    pendingReviews: 18,
    monthlyGrowth: '+12%',
    submissionTrend: [45, 62, 78, 55, 90, 85, 102], // last 7 days
    revenueHistory: [320000, 350000, 340000, 380000, 410000, 425000] // last 6 months
  };

  const handleBroadcast = () => {
    if (announcement.trim()) {
      // In real app, this would call an API
      console.log('Broadcasting:', announcement);
      alert('Announcement broadcasted successfully!');
      setAnnouncement('');
      setShowAnnouncementModal(false);
    }
  };

  const generateCSVReport = () => {
    // Mock CSV generation
    const csvContent = `Monthly Report - ${new Date().toLocaleDateString()}
    
New Registrations,${stats.totalUsers}
Active Subscriptions,${stats.activeSubscriptions}
Total Revenue,${stats.totalRevenue}
Pending Reviews,${stats.pendingReviews}`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `checkias_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Helper to generate SVG path for line chart
  const getLinePath = (data: number[], width: number, height: number) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min;
    const stepX = width / (data.length - 1);
    
    return data.map((val, i) => {
      const x = i * stepX;
      // Normalize y (10% padding top/bottom)
      const y = height - ((val - min) / range) * (height * 0.8) - (height * 0.1); 
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Overview</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Monitor platform performance and metrics</p>
        </div>
        <div className="flex gap-3">
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

      {/* Stats Row */}
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
          <div className="flex items-center gap-3 mt-3 text-xs font-medium">
             <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-md">
               {stats.activeSubscriptions} Premium
             </span>
             <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-md">
               {stats.totalUsers - stats.activeSubscriptions} Free
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
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalRevenue}</p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-2">+18% vs last month</p>
        </div>

         {/* Guidance Calls */}
         <div className="bg-white dark:bg-gray-950 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all group hover:border-black dark:hover:border-indigo-500">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
              <Phone className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Guidance Calls</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">5</p>
          <div className="flex items-center gap-3 mt-3 text-xs font-medium">
            <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 rounded-md">
              3 Pending
            </span>
            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded-md">
              2 Confirmed
            </span>
          </div>
        </div>

        {/* Submission Review */}
        <div className="bg-white dark:bg-gray-950 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all group hover:border-black dark:hover:border-indigo-500">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg">
              <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Submission Review</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">156</p>
          <div className="flex items-center gap-3 mt-3 text-xs font-medium">
            <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 rounded-md">
              18 Pending
            </span>
            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded-md">
              138 Done
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
            {/* Custom Bar Color Picker */}
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
              const maxValue = Math.max(...stats.submissionTrend);
              const barHeight = Math.round((value / maxValue) * 160);
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
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
              <div key={idx} className="flex-1 text-center text-xs text-gray-500 dark:text-gray-400">{day}</div>
            ))}
          </div>
        </div>

        {/* Revenue Analytics per Model */}
        <div className="bg-white dark:bg-gray-950 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all flex flex-col group hover:border-black dark:hover:border-indigo-500">
           <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue Breakdown</h3>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Custom Line Color Picker */}
                <div className="relative group">
                  <div 
                    className="w-9 h-9 rounded-xl shadow-md cursor-pointer border-2 border-white dark:border-gray-800 ring-2 ring-gray-200 dark:ring-gray-700 hover:ring-indigo-400 dark:hover:ring-indigo-500 transition-all hover:scale-105"
                    style={{ backgroundColor: chartColor }}
                    onClick={() => document.getElementById('chartColorPicker')?.click()}
                    title="Click to change line color"
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
                      <span className="text-gray-600 dark:text-gray-400">Premium (Monthly)</span>
                      <span className="font-semibold text-gray-900 dark:text-white">₹2,45,000</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3">
                      <div className="h-3 rounded-full transition-all" style={{ width: '65%', background: `linear-gradient(to right, ${chartColor}, ${chartColor}cc)` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400">Premium (Yearly)</span>
                      <span className="font-semibold text-gray-900 dark:text-white">₹1,80,000</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3">
                      <div className="h-3 rounded-full transition-all" style={{ width: '45%', background: `linear-gradient(to right, ${chartColor}dd, ${chartColor}99)` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400">Add-on Purchases</span>
                      <span className="font-semibold text-gray-900 dark:text-white">₹45,000</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3">
                      <div className="h-3 rounded-full transition-all" style={{ width: '15%', background: `linear-gradient(to right, ${chartColor}bb, ${chartColor}77)` }}></div>
                    </div>
                  </div>
                </div>
             ) : (
                /* Chart View */
                <div className="h-full flex flex-col animate-fade-in">
                   <div className="flex-1 relative flex items-end pb-6 px-2 min-h-[200px]">
                      {/* Grid lines */}
                      <div className="absolute inset-0 flex flex-col justify-between text-xs text-gray-400 dark:text-gray-500 pointer-events-none">
                         {[4, 3, 2, 1, 0].map(i => (
                           <div key={i} className="border-b border-gray-100 dark:border-gray-700 h-0 w-full relative">
                              <span className="absolute -top-2 -left-0">{i + 3}L</span>
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
                         
                         {/* Area path */}
                         <path 
                           d={`${getLinePath(stats.revenueHistory, 500, 200)} L 500 200 L 0 200 Z`} 
                           fill="url(#revenueGradient)" 
                         />
                         
                         {/* Line path */}
                         <path 
                           d={getLinePath(stats.revenueHistory, 500, 200)} 
                           fill="none" 
                           stroke={chartColor}
                           strokeWidth="3" 
                           vectorEffect="non-scaling-stroke"
                         />

                         {/* Data Points */}
                         {stats.revenueHistory.map((val, i) => {
                             // Re-calculate points for circles (simplified logic match helper)
                             const max = Math.max(...stats.revenueHistory);
                             const min = Math.min(...stats.revenueHistory);
                             const range = max - min;
                             const width = 500;
                             const height = 200;
                             const stepX = width / (stats.revenueHistory.length - 1);
                             const x = i * stepX;
                             const y = height - ((val - min) / range) * (height * 0.8) - (height * 0.1);
                             
                             return (
                               <circle key={i} cx={x} cy={y} r="4" fill="#fff" stroke={chartColor} strokeWidth="3" />
                             );
                         })}
                      </svg>
                   </div>
                   <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2 px-1">
                      {['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => <span key={m}>{m}</span>)}
                   </div>
                   <div className="text-center mt-4">
                     <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-full" style={{ backgroundColor: `${chartColor}20`, color: chartColor }}>
                       <TrendingUp className="w-3 h-3" /> Growth Trend: Consistent
                     </span>
                   </div>
                </div>
             )}

             {revenueView === 'list' && (
                <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center mt-4">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Plan Distribution</span>
                  <div className="flex gap-4 text-xs text-gray-600 dark:text-gray-300">
                     <div className="flex items-center gap-1">
                       <div className="w-2 h-2 rounded-full bg-purple-500"></div> Premium
                     </div>
                     <div className="flex items-center gap-1">
                       <div className="w-2 h-2 rounded-full bg-gray-400"></div> Free
                     </div>
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>

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
                          console.log('Selected recipient:', option.value);
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
