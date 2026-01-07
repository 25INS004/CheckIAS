import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { Search, FileText, CheckCircle, Clock, ChevronDown, AlertCircle, Download, Eye, X, Upload, RefreshCw } from 'lucide-react';
import ConfirmationModal from '../../components/ConfirmationModal';
import Toast from '../../components/Toast';
import RefreshButton from '../../components/RefreshButton';
import Pagination from '../../components/Pagination';
import { useAutoRefresh } from '../../hooks/useAutoRefresh';

interface Submission {
  id: string;
  user_id: string;
  title: string;
  subject: string;
  paper_code: string;
  pages: number;
  status: string;
  created_at: string;
  file_url: string | null;
  checked_file_url: string | null;
  user_name: string;
  user_email: string;
  user_plan: string;
}

const AdminSubmissions = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingPages, setSyncingPages] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPlan, setFilterPlan] = useState('All');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isPlanDropdownOpen, setIsPlanDropdownOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ type: 'review' | 'evaluate', id: string } | null>(null);
  const [updating, setUpdating] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [scoreAcquired, setScoreAcquired] = useState('');
  const [scoreTotal, setScoreTotal] = useState('15');
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Upload checked/evaluated copy to Supabase storage with score
  const handleUploadCheckedCopy = async (file: File, submissionId: string, marksAcquired: number, marksTotal: number) => {
    if (!file || !file.type.includes('pdf')) {
      toast.error('Please select a valid PDF file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB.');
      return;
    }

    if (isNaN(marksAcquired) || marksAcquired < 0) {
      toast.error('Please enter valid marks acquired.');
      return;
    }

    if (isNaN(marksTotal) || marksTotal <= 0) {
      toast.error('Please enter valid total marks.');
      return;
    }

    setUploading(true);
    setUploadProgress('Uploading...');

    try {
      const token = localStorage.getItem('supabase.auth.token') || sessionStorage.getItem('supabase.auth.token');
      if (!token) {
        toast.error('Authentication error. Please log in again.');
        setUploading(false);
        return;
      }

      const { currentSession } = JSON.parse(token);
      const accessToken = currentSession?.access_token;
      
      console.log('User Email from Token:', currentSession?.user?.email);
      console.log('Attempting update for Submission ID:', submissionId);

      // Generate unique filename: CheckIAS_Evaluated_[SubmissionID]_[Timestamp]_[RandomString].pdf
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
      const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
      const fileName = `CheckIAS_Evaluated_${submissionId.slice(0, 8)}_${timestamp}_${randomString}.pdf`;
      const filePath = `evaluated/${fileName}`;

      // Upload to Supabase Storage (admin-submissions bucket)
      const uploadRes = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/admin-submissions/${filePath}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': file.type,
            'x-upsert': 'true',
          },
          body: file,
        }
      );

      if (!uploadRes.ok) {
        throw new Error('Failed to upload file');
      }

      setUploadProgress('Updating record...');

      // Get the public URL
      const checkedFileUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/admin-submissions/${filePath}`;
      console.log('File uploaded. URL:', checkedFileUrl);

      // Update submission record with the checked file URL, score, and status
      const updateRes = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/submissions?id=eq.${submissionId}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            'Prefer': 'return=representation',
          },
          body: JSON.stringify({ 
            checked_file_url: checkedFileUrl,
            status: 'Evaluated',
            score: marksAcquired,
            score_total: marksTotal,
            reviewed_at: new Date().toISOString()
          }),
        }
      );

      if (!updateRes.ok) {
        const errorText = await updateRes.text();
        console.error('Database update error:', updateRes.status, errorText);
        throw new Error(`Failed to update submission record: ${errorText}`);
      }

      const updatedData = await updateRes.json();
      console.log('Update Response Data:', updatedData);

      if (!updatedData || updatedData.length === 0) {
         console.error('CRITICAL: Update succeeded but no rows were modified. This usually means RLS blocked the update.');
         throw new Error('Update failed: No permission to update this submission. Is your email in the "admins" table?');
      }

      // Update local state with score info
      setSubmissions(submissions.map(sub =>
        sub.id === submissionId 
          ? { ...sub, checked_file_url: checkedFileUrl, status: 'Evaluated' } 
          : sub
      ));
      
      setSelectedSubmission(null);
      setPendingFile(null); // Assuming setFile is meant to be setPendingFile
      setScoreAcquired(''); // Assuming setMarksAcquired is meant to be setScoreAcquired
      setScoreTotal('15'); // Assuming setMarksTotal is meant to be setScoreTotal
      setToast({ message: 'Evaluated copy uploaded successfully!', type: 'success' });
      
    } catch (err) {
      console.error('Upload Error:', err);
      setToast({ message: 'Failed to upload file. Please try again.', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  // Fetch submissions from database
  const fetchSubmissions = async (background = false) => {
    if (!background) setLoading(true);
    try {
      // Get access token from storage (same pattern as AdminOverview)
      const token = localStorage.getItem('supabase.auth.token') || sessionStorage.getItem('supabase.auth.token');
      if (!token) {
        console.error('No auth token found');
        if (!background) setLoading(false);
        return;
      }
      
      const { currentSession } = JSON.parse(token);
      const accessToken = currentSession?.access_token;
      
      const headers = {
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${accessToken}`,
      };

      // Fetch submissions
      const submissionsRes = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/submissions?select=*&order=created_at.desc`,
        { headers }
      );
      
      if (!submissionsRes.ok) {
        console.error('Failed to fetch submissions:', submissionsRes.status);
        if (!background) setLoading(false);
        return;
      }
      
      const submissionsData = await submissionsRes.json();

      // Fetch all profiles to get user info
      const profilesRes = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles?select=id,full_name,email,plan`,
        { headers }
      );
      
      let profilesData: any[] = [];
      if (profilesRes.ok) {
        profilesData = await profilesRes.json();
      }

      // Create a map of user IDs to user info
      const userMap = new Map<string, { name: string; email: string; plan: string }>();
      if (Array.isArray(profilesData)) {
        profilesData.forEach((p: any) => {
          userMap.set(p.id, { 
            name: p.full_name || 'Unknown User', 
            email: p.email || 'No email', 
            plan: p.plan || 'free' 
          });
        });
      }

      // Merge submission data with user info
      const enrichedSubmissions: Submission[] = submissionsData.map((s: any) => {
        const userInfo = userMap.get(s.user_id) || { name: 'Unknown', email: 'Unknown', plan: 'free' };
        return {
          id: s.id,
          user_id: s.user_id,
          title: s.file_name || s.title || 'Untitled',
          subject: s.paper_type || 'General',
          paper_code: s.question_number || '-',
          pages: s.pages || 0,
          status: s.status || 'Pending',
          created_at: s.created_at,
          file_url: s.file_url,
          checked_file_url: s.checked_file_url,
          user_name: userInfo.name,
          user_email: userInfo.email,
          user_plan: userInfo.plan.charAt(0).toUpperCase() + userInfo.plan.slice(1),
        };
      });

      setSubmissions(enrichedSubmissions);
    } catch (err) {
      console.error('Failed to fetch submissions:', err);
    }
    if (!background) setLoading(false);
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  useAutoRefresh(() => fetchSubmissions(true));

  // Update status in database
  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdating(true);
    try {
      const token = localStorage.getItem('supabase.auth.token') || sessionStorage.getItem('supabase.auth.token');
      if (!token) {
        setToast({ message: 'Authentication error. Please log in again.', type: 'error' });
        setUpdating(false);
        return;
      }
      
      const { currentSession } = JSON.parse(token);
      const accessToken = currentSession?.access_token;
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/submissions?id=eq.${id}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        // Update local state
        setSubmissions(submissions.map(sub => 
          sub.id === id ? { ...sub, status: newStatus } : sub
        ));
        // Update selected submission if open
        if (selectedSubmission && selectedSubmission.id === id) {
          setSelectedSubmission({ ...selectedSubmission, status: newStatus });
        }
      } else {
        console.error('Failed to update status:', response.status);
        setToast({ message: 'Failed to update status. Please try again.', type: 'error' });
      }
    } catch (err) {
      console.error('Error updating status:', err);
      setToast({ message: 'Error updating status. Please try again.', type: 'error' });
    }
    setUpdating(false);
  };

  const handleSyncPages = async () => {
    if (!confirm('This will scan all submissions with 0 pages and update their page counts. This may take a while. Continue?')) return;
    
    setSyncingPages(true);
    let updatedCount = 0;
    
    try {
      const token = localStorage.getItem('supabase.auth.token') || sessionStorage.getItem('supabase.auth.token');
      if (!token) throw new Error('Not authenticated');
      
      const { currentSession } = JSON.parse(token);
      const accessToken = currentSession?.access_token;
      
      // Filter submissions that have a file but no pages
      const toUpdate = submissions.filter(s => s.file_url && (!s.pages || s.pages === 0));
      console.log(`Found ${toUpdate.length} submissions to sync.`);
      
      if (toUpdate.length === 0) {
        setToast({ message: 'All submissions already have page counts!', type: 'success' });
        setSyncingPages(false);
        return;
      }

      for (const sub of toUpdate) {
        try {
           // @ts-ignore
           const pdf = await window.pdfjsLib.getDocument(sub.file_url).promise;
           const pages = pdf.numPages;
           
           // Update DB
           const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/submissions?id=eq.${sub.id}`, {
             method: 'PATCH',
             headers: {
               'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
               'Authorization': `Bearer ${accessToken}`,
               'Content-Type': 'application/json',
               'Prefer': 'return=minimal'
             },
             body: JSON.stringify({ pages })
           });

           if (res.ok) {
             updatedCount++;
             // Update local state
             setSubmissions(prev => prev.map(p => p.id === sub.id ? { ...p, pages } : p));
           } else {
             console.error(`Failed to update ${sub.id}:`, await res.text());
           }
        } catch (e) {
          console.error(`Failed to process ${sub.id}:`, e);
        }
      }
      
      setToast({ message: `Sync Complete! Updated ${updatedCount} submissions.`, type: 'success' });
      
    } catch (err) {
      console.error('Sync failed:', err);
      setToast({ message: 'Sync failed. Check console for details.', type: 'error' });
    } finally {
      setSyncingPages(false);
    }
  };

  const filteredSubmissions = submissions.filter(sub => 
    (filterStatus === 'All' || sub.status === filterStatus) &&
    (filterPlan === 'All' || sub.user_plan === filterPlan) &&
    (sub.user_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     sub.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
     sub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
     sub.subject.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const statusCounts = {
    pending: submissions.filter(s => {
      const status = s.status?.toLowerCase() || '';
      return status === 'pending' || status === 'draft' || status === 'submitted' || status === 'open';
    }).length,
    evaluated: submissions.filter(s => {
      const status = s.status?.toLowerCase() || '';
      return status === 'evaluated' || status === 'reviewed' || status === 'completed' || status === 'done';
    }).length,
  };

  // Debug: log submissions to see what statuses exist
  console.log('Submissions fetched:', submissions.length, 'Statuses:', submissions.map(s => s.status));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-gray-500 dark:text-gray-400">Loading submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Copy Submissions</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Review and evaluate user answer copy submissions</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleSyncPages}
            disabled={syncingPages}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors text-sm disabled:opacity-50"
            title="Scan and update page counts for old submissions"
          >
            <RefreshCw className={`w-4 h-4 ${syncingPages ? 'animate-spin' : ''}`} />
            {syncingPages ? 'Syncing...' : 'Sync Pages'}
          </button>
          <button 
            onClick={handleSyncPages}
            disabled={syncingPages}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors text-sm disabled:opacity-50"
            title="Scan and update page counts for old submissions"
          >
            <RefreshCw className={`w-4 h-4 ${syncingPages ? 'animate-spin' : ''}`} />
            {syncingPages ? 'Syncing...' : 'Sync Pages'}
          </button>
          <RefreshButton onClick={() => fetchSubmissions()} loading={loading} />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <div>
              <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{statusCounts.pending}</p>
              <p className="text-sm text-yellow-600 dark:text-yellow-400">Pending</p>
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
              {['All', 'Pending', 'Evaluated'].map((option) => (
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
              {filteredSubmissions
                .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                .map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-indigo-50 dark:bg-indigo-900/40 rounded-lg text-indigo-600 dark:text-indigo-400 mt-1">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{sub.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">#{sub.id.slice(0, 8)} • {sub.pages} pages</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900 dark:text-white">{sub.user_name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{sub.user_email}</p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 mt-1">
                      {sub.user_plan}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-900 dark:text-white">{sub.subject}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                    {new Date(sub.created_at).toLocaleDateString()}
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
                      {sub.file_url && (
                        <a 
                          href={sub.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 font-medium text-xs bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-1.5 rounded-lg transition-colors border border-gray-200 dark:border-gray-700 flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          PDF
                        </a>
                      )}
                      {sub.status === 'Pending' && (
                        <button 
                          onClick={() => setConfirmAction({ type: 'review', id: sub.id })}
                          disabled={updating}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-xs bg-blue-50 dark:bg-blue-900/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 px-3 py-1.5 rounded-lg transition-colors border border-blue-100 dark:border-blue-800 disabled:opacity-50"
                        >
                          Start Review
                        </button>
                      )}
                      {sub.status === 'Under Review' && (
                        <button 
                          onClick={() => setConfirmAction({ type: 'evaluate', id: sub.id })}
                          disabled={updating}
                          className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 font-medium text-xs bg-green-50 dark:bg-green-900/40 hover:bg-green-100 dark:hover:bg-green-900/60 px-3 py-1.5 rounded-lg transition-colors border border-green-100 dark:border-green-800 disabled:opacity-50"
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
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredSubmissions.length / ITEMS_PER_PAGE)}
            onPageChange={setCurrentPage}
            totalItems={filteredSubmissions.length}
            itemsPerPage={ITEMS_PER_PAGE}
          />
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
                <p className="text-sm text-gray-500 dark:text-gray-400">#{selectedSubmission.id.slice(0, 8)}</p>
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
                  <p className="font-medium text-gray-900 dark:text-white">{selectedSubmission.user_name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{selectedSubmission.user_email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Plan</p>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
                    {selectedSubmission.user_plan}
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
                  <p className="font-medium text-gray-900 dark:text-white">{new Date(selectedSubmission.created_at).toLocaleDateString()}</p>
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
              {selectedSubmission.file_url && (
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
                    <a 
                      href={selectedSubmission.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium text-sm bg-indigo-50 dark:bg-indigo-900/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </a>
                  </div>
                </div>
              )}

              {/* Upload Checked Copy Section */}
              {selectedSubmission.checked_file_url ? (
                <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                  <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-3">✓ Evaluated Copy Uploaded</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Checked Copy</p>
                        <p className="text-xs text-green-600 dark:text-green-400">Available for user download</p>
                      </div>
                    </div>
                    <a 
                      href={selectedSubmission.checked_file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-green-600 dark:text-green-400 hover:text-green-800 font-medium text-sm bg-green-100 dark:bg-green-900/40 hover:bg-green-200 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      View
                    </a>
                  </div>
                </div>
              ) : (
                <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border-2 border-dashed border-green-200 dark:border-green-800">
                  <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-3">Upload Evaluated Copy with Score</p>
                  
                  {uploading ? (
                    <div className="flex flex-col items-center justify-center py-4">
                      <RefreshCw className="w-8 h-8 text-green-500 dark:text-green-400 mb-2 animate-spin" />
                      <p className="text-sm text-green-700 dark:text-green-300 font-medium">{uploadProgress}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Score Input */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Marks Acquired</label>
                          <input
                            type="number"
                            value={scoreAcquired}
                            onChange={(e) => setScoreAcquired(e.target.value)}
                            placeholder="e.g. 12"
                            min="0"
                            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none"
                          />
                        </div>
                        <span className="text-gray-400 dark:text-gray-500 mt-5">/</span>
                        <div className="flex-1">
                          <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Total Marks</label>
                          <input
                            type="number"
                            value={scoreTotal}
                            onChange={(e) => setScoreTotal(e.target.value)}
                            placeholder="e.g. 15"
                            min="1"
                            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none"
                          />
                        </div>
                      </div>

                      {/* File Selection */}
                      <div className="flex items-center gap-3">
                        <label className="flex-1 cursor-pointer">
                          <input 
                            type="file" 
                            accept=".pdf" 
                            className="hidden" 
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) setPendingFile(file);
                            }}
                          />
                          <div className={`flex items-center gap-2 px-4 py-2.5 border-2 border-dashed rounded-lg transition-colors ${
                            pendingFile 
                              ? 'border-green-500 bg-green-50 dark:bg-green-900/30' 
                              : 'border-gray-300 dark:border-gray-600 hover:border-green-400'
                          }`}>
                            <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-300 truncate">
                              {pendingFile ? pendingFile.name : 'Select evaluated PDF...'}
                            </span>
                          </div>
                        </label>
                      </div>

                      {/* Upload Button */}
                      <button
                        onClick={() => {
                          if (!pendingFile) {
                            toast.error('Please select a PDF file first.');
                            return;
                          }
                          if (!scoreAcquired) {
                            toast.error('Please enter marks acquired.');
                            return;
                          }
                          if (selectedSubmission) {
                            handleUploadCheckedCopy(
                              pendingFile, 
                              selectedSubmission.id, 
                              parseFloat(scoreAcquired), 
                              parseFloat(scoreTotal)
                            );
                          }
                        }}
                        disabled={!pendingFile || !scoreAcquired}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium text-sm rounded-lg transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                        Upload & Mark as Evaluated
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 shrink-0">
              {selectedSubmission.status === 'Pending' && (
                <button 
                  onClick={() => setConfirmAction({ type: 'review', id: selectedSubmission.id })}
                  disabled={updating}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm disabled:opacity-50"
                >
                  Start Review
                </button>
              )}
              {selectedSubmission.status === 'Under Review' && (
                <button 
                  onClick={() => setConfirmAction({ type: 'evaluate', id: selectedSubmission.id })}
                  disabled={updating}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors text-sm disabled:opacity-50"
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

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={async () => {
          if (confirmAction?.type === 'review') {
            await handleStatusChange(confirmAction.id, 'Under Review');
          } else if (confirmAction?.type === 'evaluate') {
            await handleStatusChange(confirmAction.id, 'Evaluated');
          }
        }}
        title={confirmAction?.type === 'review' ? "Start Review?" : "Mark as Evaluated?"}
        message={confirmAction?.type === 'review' 
          ? "Are you sure you want to start reviewing this submission? This will change the status to 'Under Review'." 
          : "Are you sure you want to mark this submission as evaluated? This will notify the student."}
        confirmText={confirmAction?.type === 'review' ? "Start Review" : "Mark Evaluated"}
        confirmStyle={confirmAction?.type === 'review' ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-green-600 hover:bg-green-700 text-white"}
      />
    </div>
  );
};

export default AdminSubmissions;
