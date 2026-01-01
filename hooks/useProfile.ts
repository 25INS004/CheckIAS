import { useState, useCallback } from 'react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  year_of_attempt?: string;
  optional_subject?: string;
  dob?: string;
  avatar_url?: string;
  language: string;
  plan: 'free' | 'starter' | 'pro' | 'achiever';
  role: 'user' | 'admin';
  created_at: string;
}

interface UseProfileReturn {
  updateProfile: (data: Partial<Profile>) => Promise<{ success: boolean; error?: string }>;
  updating: boolean;
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

export const useProfile = (): UseProfileReturn => {
  const [updating, setUpdating] = useState(false);

  const updateProfile = useCallback(async (
    data: Partial<Profile>
  ): Promise<{ success: boolean; error?: string }> => {
    const token = getAccessToken();
    const userId = getUserId();
    
    if (!token || !userId) {
      return { success: false, error: 'Not authenticated' };
    }

    setUpdating(true);

    try {
      console.log('Updating profile for user:', userId);
      console.log('Data to update:', data);
      
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${token}`,
            'Prefer': 'return=representation', // Return updated rows
          },
          body: JSON.stringify(data),
        }
      );

      const responseData = await response.json();
      console.log('Profile update response:', response.status, responseData);

      setUpdating(false);

      if (response.ok) {
        // Check if any row was actually updated
        if (Array.isArray(responseData) && responseData.length > 0) {
          return { success: true };
        } else {
          return { success: false, error: 'No profile found to update. Check RLS policies.' };
        }
      } else {
        return { success: false, error: responseData.message || 'Failed to update profile' };
      }
    } catch (err: any) {
      setUpdating(false);
      return { success: false, error: err.message || 'Error updating profile' };
    }
  }, []);

  return { updateProfile, updating };
};
