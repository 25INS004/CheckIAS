import { useState, useEffect, useCallback } from 'react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export interface GuidanceCall {
  id: string;
  user_id: string;
  requested_date: string;
  requested_time: string;
  topic: string;
  description?: string;
  status: 'Requested' | 'Scheduled' | 'Completed' | 'Cancelled';
  notes?: string;
  created_at: string;
}

interface UseGuidanceCallsReturn {
  calls: GuidanceCall[];
  loading: boolean;
  error: string | null;
  fetchCalls: () => Promise<void>;
  createCall: (data: Omit<GuidanceCall, 'id' | 'user_id' | 'status' | 'created_at'>) => Promise<{ success: boolean; error?: string }>;
  updateCall: (id: string, data: Partial<GuidanceCall>) => Promise<{ success: boolean; error?: string }>;
  cancelCall: (id: string) => Promise<{ success: boolean; error?: string }>;
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

export const useGuidanceCalls = (): UseGuidanceCallsReturn => {
  const [calls, setCalls] = useState<GuidanceCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCalls = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const token = getAccessToken();
    if (!token) {
      setCalls([]);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/guidance_calls?select=*&order=created_at.desc`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCalls(data);
      } else {
        setError('Failed to fetch guidance calls');
      }
    } catch (err) {
      setError('Error fetching guidance calls');
      console.error(err);
    }
    
    setLoading(false);
  }, []);

  const createCall = async (
    data: Omit<GuidanceCall, 'id' | 'user_id' | 'status' | 'created_at'>
  ): Promise<{ success: boolean; error?: string }> => {
    const token = getAccessToken();
    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/guidance_calls`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${token}`,
            'Prefer': 'return=representation',
          },
          body: JSON.stringify(data),
        }
      );

      if (response.ok) {
        const newCall = await response.json();
        setCalls(prev => [newCall[0], ...prev]);
        return { success: true };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.message || 'Failed to create call' };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Error creating call' };
    }
  };

  const updateCall = async (id: string, data: Partial<GuidanceCall>): Promise<{ success: boolean; error?: string }> => {
    const token = getAccessToken();
    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/guidance_calls?id=eq.${id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );

      if (response.ok) {
        setCalls(prev => prev.map(call => 
          call.id === id ? { ...call, ...data } : call
        ));
        return { success: true };
      } else {
        return { success: false, error: 'Failed to update call' };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Error updating call' };
    }
  };

  const cancelCall = async (id: string): Promise<{ success: boolean; error?: string }> => {
    const token = getAccessToken();
    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/guidance_calls?id=eq.${id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ status: 'cancelled' }),
        }
      );

      if (response.ok) {
        setCalls(prev => prev.map(call => 
          call.id === id ? { ...call, status: 'cancelled' as const } : call
        ));
        return { success: true };
      } else {
        return { success: false, error: 'Failed to cancel call' };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Error cancelling call' };
    }
  };

  useEffect(() => {
    fetchCalls();
  }, [fetchCalls]);

  return { calls, loading, error, fetchCalls, createCall, updateCall, cancelCall };
};
