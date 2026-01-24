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
  submissionsCompleted: number;
  submissionsPending: number;
  submissionsUnderReview: number;
  daysLeft: number;
  announcement?: string;
  guidanceCallsLeft: number;
  totalGuidanceCalls: number;
  callsCompletedThisMonth: number;
  callsCancelled: number;
  callsPending: number;
  isProfileComplete: boolean;
  // Profile fields for pre-filling
  phone?: string;
  yearOfAttempt?: string;
  optionalSubject?: string;
  dob?: string;
  avatarUrl?: string; // Add avatarUrl
  validUntil?: string; // Add validUntil
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

// Plan-specific limits (aligned with pricing config)
const planLimits = {
  free: { submissions: 3, guidanceCalls: 1, days: 0 },     // 3 submissions, 1 call (lifetime)
  starter: { submissions: 999, guidanceCalls: 999, days: 30 },   // 1 month
  pro: { submissions: 999, guidanceCalls: 999, days: 90 },       // 3 months
  achiever: { submissions: 999, guidanceCalls: 999, days: 180 }, // 6 months
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
          // console.log('Fetched profile:', profile);

          // If Admin, skip user-specific stats fetching
          if (profile?.role === 'admin') {
            setUser({
              id: authUser.id,
              name: profile.full_name || 'Admin',
              email: profile.email || authUser.email || '',
              plan: 'achiever', // Admin has no partial plan limits
              role: 'admin',
              submissionsLeft: 9999,
              totalSubmissions: 9999,
              submissionsCompleted: 0,
              submissionsPending: 0,
              submissionsUnderReview: 0,
              daysLeft: 365,
              guidanceCallsLeft: 9999,
              totalGuidanceCalls: 9999,
              callsCompletedThisMonth: 0,
              callsCancelled: 0,
              callsPending: 0,
              isProfileComplete: true,
              // Clear user-specific fields
              phone: '',
              yearOfAttempt: '',
              optionalSubject: '',
              dob: '',
              avatarUrl: profile.avatar_url || ''
            });
            setLoading(false);
            return;
          }
        } else {
          console.error('Profile fetch error:', await response.text());
        }
      } catch (err) {
        console.log('Profile fetch failed, using defaults', err);
      }

      // Fetch submission count and status breakdown from DB
      let submissionCount = 0;
      let submissionsCompleted = 0;
      let submissionsPending = 0;
      let submissionsUnderReview = 0;
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/submissions?user_id=eq.${authUser.id}&select=id,status`,
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
          
          submissionsCompleted = submissions.filter((s: any) => {
            const status = s.status?.toLowerCase();
            return status === 'completed' || status === 'graded' || status === 'evaluated' || status === 'resolved';
          }).length;
          
          submissionsPending = submissions.filter((s: any) => {
            const status = s.status?.toLowerCase();
            return status === 'pending' || status === 'draft' || status === 'open';
          }).length;
          
          submissionsUnderReview = submissions.filter((s: any) => {
             const status = s.status?.toLowerCase();
             return status === 'under_review' || status === 'reviewing' || status === 'under review';
          }).length;
        }
      } catch (err) {
        console.log('Submission count fetch failed');
      }

      // Fetch guidance calls count and status breakdown
      let guidanceCallsCount = 0;
      let callsCompleted = 0;
      let callsCancelled = 0;
      let callsPending = 0;
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/guidance_calls?user_id=eq.${authUser.id}&select=id,status`,
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
          callsCompleted = calls.filter((c: any) => c.status?.toLowerCase() === 'completed').length;
          callsCancelled = calls.filter((c: any) => c.status?.toLowerCase() === 'cancelled').length;
          callsPending = calls.filter((c: any) => {
            const status = c.status?.toLowerCase();
            return status === 'pending' || status === 'scheduled' || status === 'confirmed';
          }).length;
        }
      } catch (err) {
         console.log('Guidance call count fetch failed');
      }

      // Calculate remaining limits
      const plan = (profile?.plan || 'free') as 'free' | 'starter' | 'pro' | 'achiever';
      const limits = planLimits[plan];
      
      const submissionsLeft = plan === 'free' 
        ? Math.max(0, limits.submissions - submissionCount) // Free: 3 submissions
        : 999;

      const guidanceCallsLeft = Math.max(0, limits.guidanceCalls - guidanceCallsCount);
      
      // Calculate days left and valid until date based on plan_started_at from database
      let daysLeft = 0;
      let validUntil = '';
      
      if (plan !== 'free' && profile?.plan_started_at) {
        const planStartDate = new Date(profile.plan_started_at);
        const planDuration = limits.days; 
        const expiryDate = new Date(planStartDate);
        expiryDate.setDate(expiryDate.getDate() + planDuration);
        
        validUntil = expiryDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
        
        const today = new Date();
        const diffTime = expiryDate.getTime() - today.getTime();
        daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      }
      
      setUser({
        id: authUser.id,
        name: profile?.full_name || authUser.email?.split('@')[0] || 'User',
        email: profile?.email || authUser.email || '',
        plan,
        role: (profile?.role || 'user') as 'user' | 'admin',
        submissionsLeft,
        totalSubmissions: plan === 'free' ? 1 : 999,
        submissionsCompleted,
        submissionsPending,
        submissionsUnderReview,
        daysLeft,
        validUntil, // Add validUntil
        guidanceCallsLeft: guidanceCallsLeft,
        totalGuidanceCalls: limits.guidanceCalls,
        callsCompletedThisMonth: callsCompleted,
        callsCancelled: callsCancelled,
        callsPending: callsPending,
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
