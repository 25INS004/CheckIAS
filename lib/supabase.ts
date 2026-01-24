import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- AUTH SYNCHRONIZATION FIX ---
// The app uses a custom object in localStorage ('supabase.auth.token') 
// which differs from the standard Supabase SDK storage pattern.
// We must manually sync the session to ensure 'supabase' client calls are authenticated.
(async () => {
  if (typeof window === 'undefined') return;

  const stored = localStorage.getItem('supabase.auth.token') || sessionStorage.getItem('supabase.auth.token');
  if (stored) {
    try {
      const { currentSession } = JSON.parse(stored);
      if (currentSession?.access_token && currentSession?.refresh_token) {
        // Hydrate the SDK with the existing valid session
        await supabase.auth.setSession({
          access_token: currentSession.access_token,
          refresh_token: currentSession.refresh_token,
        });
      }
    } catch (e) {
      console.warn('Manual auth sync failed:', e);
    }
  }
})();

// Types for database tables
export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  year_of_attempt: string | null;
  optional_subject: string | null;
  language: string;
  plan: 'free' | 'starter' | 'pro' | 'achiever';
  role: 'user' | 'admin';
  created_at: string;
}

export interface Submission {
  id: string;
  user_id: string;
  paper_type: string;
  question_number: string;
  file_url: string;
  status: 'pending' | 'reviewed' | 'completed';
  feedback: string | null;
  score: number | null;
  created_at: string;
}

export interface GuidanceCall {
  id: string;
  user_id: string;
  requested_date: string;
  requested_time: string;
  topic: string;
  status: 'pending' | 'scheduled' | 'completed' | 'cancelled';
  notes: string | null;
  created_at: string;
}
