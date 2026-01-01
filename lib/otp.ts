import { supabase } from './supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export interface OtpResponse {
  success?: boolean;
  valid?: boolean;
  message?: string;
  error?: string;
}

/**
 * Send OTP to user's email
 */
export const sendOtp = async (email: string, purpose: 'signup' | 'password_reset'): Promise<OtpResponse> => {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ email, purpose }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to send OTP' };
    }
    
    return { success: true, message: data.message };
  } catch (error) {
    return { success: false, error: 'Network error. Please try again.' };
  }
};

/**
 * Verify OTP entered by user
 */
export const verifyOtp = async (email: string, otp: string, purpose: 'signup' | 'password_reset'): Promise<OtpResponse> => {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ email, otp, purpose }),
    });

    const data = await response.json();
    
    if (!response.ok || !data.valid) {
      return { valid: false, error: data.error || 'Invalid or expired OTP' };
    }
    
    return { valid: true, message: data.message };
  } catch (error) {
    return { valid: false, error: 'Network error. Please try again.' };
  }
};
