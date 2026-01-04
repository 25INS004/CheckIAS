import { useState, useEffect, useCallback } from 'react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export interface Submission {
  id: string;
  user_id: string;
  paper_type: string;
  question_number: string;
  file_url: string;
  file_name?: string;
  status: 'pending' | 'reviewing' | 'completed' | 'Pending' | 'Under Review' | 'Evaluated';
  feedback?: string;
  score?: number;
  score_total?: number;
  pages?: number;
  created_at: string;
  reviewed_at?: string;
  checked_file_url?: string;
}

interface UseSubmissionsReturn {
  submissions: Submission[];
  loading: boolean;
  error: string | null;
  fetchSubmissions: (background?: boolean) => Promise<void>;
  createSubmission: (data: Omit<Submission, 'id' | 'user_id' | 'status' | 'created_at'>) => Promise<{ success: boolean; error?: string }>;
}

const getAccessToken = (): string | null => {
  const localData = localStorage.getItem('supabase.auth.token');
  const sessionData = sessionStorage.getItem('supabase.auth.token');
  const data = localData || sessionData;
  
  if (!data) return null;
  
  try {
    const { currentSession } = JSON.parse(data);
    return currentSession?.access_token || null;
  } catch {
    return null;
  }
};

const getUserId = (): string | null => {
  const localData = localStorage.getItem('supabase.auth.token');
  const sessionData = sessionStorage.getItem('supabase.auth.token');
  const data = localData || sessionData;
  
  if (!data) return null;
  
  try {
    const { currentSession } = JSON.parse(data);
    return currentSession?.user?.id || null;
  } catch {
    return null;
  }
};

export const useSubmissions = (): UseSubmissionsReturn => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubmissions = useCallback(async (background = false) => {
    if (!background) setLoading(true);
    setError(null);
    
    const token = getAccessToken();
    if (!token) {
      setSubmissions([]);
      if (!background) setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/submissions?select=*&order=created_at.desc`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('User Submissions Fetched:', data);
        if (data.length > 0) {
          console.log('First submission status:', data[0].status);
          console.log('First submission checked_url:', data[0].checked_file_url);
        }
        setSubmissions(data);
      } else {
        setError('Failed to fetch submissions');
      }
    } catch (err) {
      setError('Error fetching submissions');
      console.error(err);
    }
    
    if (!background) setLoading(false);
  }, []);

  const createSubmission = async (
    data: Omit<Submission, 'id' | 'user_id' | 'status' | 'created_at'>
  ): Promise<{ success: boolean; error?: string }> => {
    const token = getAccessToken();
    const userId = getUserId();
    
    if (!token || !userId) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/submissions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${token}`,
            'Prefer': 'return=representation',
          },
          body: JSON.stringify({ ...data, user_id: userId }),
        }
      );

      if (response.ok) {
        const newSubmission = await response.json();
        setSubmissions(prev => [newSubmission[0], ...prev]);
        return { success: true };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.message || 'Failed to create submission' };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Error creating submission' };
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  return { submissions, loading, error, fetchSubmissions, createSubmission };
};
