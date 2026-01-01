import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
