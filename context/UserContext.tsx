import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, Profile } from '../lib/supabase';

export interface UserData {
  id: string;
  name: string;
  email: string;
  plan: 'free' | 'starter' | 'pro' | 'achiever';
  role: 'user' | 'admin';
  submissionsLeft: number;
  totalSubmissions: number;
  daysLeft: number;
  announcement?: string;
  guidanceCallsLeft: number;
  totalGuidanceCalls: number;
  callsCompletedThisMonth: number;
  isProfileComplete: boolean;
  // Profile fields for pre-filling
  phone?: string;
  yearOfAttempt?: string;
  optionalSubject?: string;
  dob?: string;
  avatarUrl?: string; // Add avatarUrl
}

interface UserContextType {
  user: UserData | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => void;
  decrementSubmissions: () => void;
  completeProfile: () => void;
  updateUser: (data: Partial<UserData>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Plan-specific limits
const planLimits = {
  free: { submissions: 2, guidanceCalls: 0, days: 0 },
  starter: { submissions: 999, guidanceCalls: 2, days: 30 },
  pro: { submissions: 999, guidanceCalls: 6, days: 30 },
  achiever: { submissions: 999, guidanceCalls: 12, days: 365 },
};

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from session on mount
  useEffect(() => {
    loadUserFromSession();
  }, []);

  const loadUserFromSession = async () => {
    setLoading(true);
    
    try {
      // Check for session in localStorage first (Remember Me), then sessionStorage
      let sessionData = localStorage.getItem('supabase.auth.token');
      let storageType: 'local' | 'session' = 'local';
      
      if (!sessionData) {
        sessionData = sessionStorage.getItem('supabase.auth.token');
        storageType = 'session';
      }
      
      if (!sessionData) {
        setUser(null);
        setLoading(false);
        return;
      }

      const { currentSession } = JSON.parse(sessionData);
      
      if (!currentSession || !currentSession.user) {
        setUser(null);
        setLoading(false);
        return;
      }

      // Check if token is expired
      const expiresAt = currentSession.expires_at * 1000; // Convert to ms
      if (Date.now() > expiresAt) {
        console.log('Session expired, clearing...');
        localStorage.removeItem('supabase.auth.token');
        sessionStorage.removeItem('supabase.auth.token');
        setUser(null);
        setLoading(false);
        return;
      }

      const authUser = currentSession.user;
      const token = currentSession.access_token;

      // Fetch profile
      let profile = null;
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles?id=eq.${authUser.id}&select=*`,
          {
            headers: {
              'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${token}`,
            },
          }
        );
        
        if (response.ok) {
          const profiles = await response.json();
          profile = profiles[0] || null;
          console.log('Fetched profile:', profile);
        } else {
          console.error('Profile fetch error:', await response.text());
        }
      } catch (err) {
        console.log('Profile fetch failed, using defaults', err);
      }

      // Fetch submission count from DB
      let submissionCount = 0;
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/submissions?user_id=eq.${authUser.id}&select=id`,
          {
            headers: {
              'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${token}`,
            },
          }
        );
        
        if (response.ok) {
          const submissions = await response.json();
          submissionCount = submissions.length;
        }
      } catch (err) {
        console.log('Submission count fetch failed');
      }

      // Fetch guidance calls count
      let guidanceCallsCount = 0;
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/guidance_calls?user_id=eq.${authUser.id}&select=id`,
          {
            headers: {
              'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const calls = await response.json();
          guidanceCallsCount = calls.length;
        }
      } catch (err) {
         console.log('Guidance call count fetch failed');
      }

      // Calculate remaining limits
      const plan = (profile?.plan || 'free') as 'free' | 'starter' | 'pro' | 'achiever';
      const limits = planLimits[plan];
      
      const submissionsLeft = plan === 'free' 
        ? Math.max(0, 2 - submissionCount) 
        : 999;

      const guidanceCallsLeft = Math.max(0, limits.guidanceCalls - guidanceCallsCount);
      
      setUser({
        id: authUser.id,
        name: profile?.full_name || authUser.email?.split('@')[0] || 'User',
        email: profile?.email || authUser.email || '',
        plan,
        role: (profile?.role || 'user') as 'user' | 'admin',
        submissionsLeft,
        totalSubmissions: plan === 'free' ? 2 : 999,
        daysLeft: limits.days,
        guidanceCallsLeft: guidanceCallsLeft,
        totalGuidanceCalls: limits.guidanceCalls,
        callsCompletedThisMonth: guidanceCallsCount,
        isProfileComplete: !!(profile?.full_name && profile?.phone),
        // Store profile data for pre-filling
        phone: profile?.phone || '',
        yearOfAttempt: profile?.year_of_attempt || '',
        optionalSubject: profile?.optional_subject || '',
        dob: profile?.dob || '',
        avatarUrl: profile?.avatar_url || '', // Populate from DB
      });
    } catch (err) {
      console.error('Error loading user:', err);
      setUser(null);
    }
    
    setLoading(false);
  };

  const refreshUser = async () => {
    await loadUserFromSession();
  };

  const logout = () => {
    localStorage.removeItem('supabase.auth.token');
    sessionStorage.removeItem('supabase.auth.token');
    setUser(null);
  };

  const decrementSubmissions = () => {
    if (user && user.submissionsLeft > 0) {
      setUser({ ...user, submissionsLeft: user.submissionsLeft - 1 });
    }
  };

  const completeProfile = () => {
    if (user) {
      setUser({ ...user, isProfileComplete: true });
    }
  };

  const updateUser = (data: Partial<UserData>) => {
    if (user) {
      setUser({ ...user, ...data });
    }
  };

  return (
    <UserContext.Provider value={{ user, loading, refreshUser, logout, decrementSubmissions, completeProfile, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
