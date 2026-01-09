import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Check, X, KeyRound, Send, RefreshCw } from 'lucide-react';
import { sendOtp, verifyOtp } from '../lib/otp';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  
  // OTP States
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [otpError, setOtpError] = useState('');

  // Password States
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validation
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

  // Send OTP
  const handleSendOtp = async () => {
    if (!email || !isEmailValid) {
      setError('Please enter a valid email address first.');
      return;
    }
    
    setError('');
    setIsSendingOtp(true);
    
    const result = await sendOtp(email, 'password_reset');
    
    setIsSendingOtp(false);
    
    if (result.success) {
      setOtpSent(true);
      setOtp('');
      setIsOtpVerified(false);
    } else {
      setError(result.error || 'Failed to send OTP');
    }
  };

  // Verify OTP
  const handleOtpChange = async (value: string) => {
    const cleanValue = value.replace(/\D/g, '').slice(0, 6);
    setOtp(cleanValue);
    setOtpError('');

    if (cleanValue.length === 6) {
      setIsVerifyingOtp(true);
      
      const result = await verifyOtp(email, cleanValue, 'password_reset');
      
      setIsVerifyingOtp(false);
      
      if (result.valid) {
        setIsOtpVerified(true);
      } else {
        setOtpError(result.error || 'Invalid OTP');
        setIsOtpVerified(false);
      }
    } else {
      setIsOtpVerified(false);
    }
  };

  // Submit new password
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordsMatch || !isOtpVerified) return;

    setIsSubmitting(true);
    setError('');

    try {
      // Call reset-password Edge Function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/reset-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ 
            email,
            new_password: newPassword 
          }),
        }
      );

      const data = await response.json();
      // console.log('Password reset response:', data);

      if (!response.ok) {
        setError(data.error || 'Failed to reset password');
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      navigate('/login', { state: { message: 'Password updated successfully! Please login with your new password.' } });
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(err.message || 'Failed to reset password. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center px-4 py-12 transition-colors duration-200">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
            CHECKIAS
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-900 shadow-xl shadow-gray-200/50 dark:shadow-none rounded-2xl overflow-hidden border border-gray-300 dark:border-gray-700 transition-colors">
          <div className="p-6 bg-indigo-600 border-b border-indigo-700">
            <h2 className="text-xl font-bold text-white text-center">Reset Password/Update Password</h2>
            <p className="text-center text-sm text-indigo-100 mt-1">Verify your email to set a new password</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Email */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-800 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 dark:focus-within:ring-indigo-900/30 transition-all bg-gray-50 dark:bg-black/50">
                <Mail className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                <div className="flex-1">
                  <label className="block text-xs text-gray-400 dark:text-gray-500 mb-0.5">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isOtpVerified}
                    className="w-full text-sm text-gray-900 dark:text-white outline-none bg-transparent placeholder-gray-300 dark:placeholder-gray-500 disabled:opacity-50"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Send OTP Button */}
              {!isOtpVerified && (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={!isEmailValid || isSendingOtp}
                  className="w-full py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSendingOtp ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      {otpSent ? 'Resend OTP' : 'Get OTP'}
                    </>
                  )}
                </button>
              )}
            </div>

            {/* OTP Input (Visible after sending) */}
            {otpSent && (
              <div className={`transition-all duration-300 ${isOtpVerified ? 'opacity-50' : 'opacity-100'}`}>
                <div className={`flex items-center gap-3 p-4 rounded-xl border transition-all bg-gray-50 dark:bg-black/50 ${
                  isOtpVerified 
                    ? 'border-green-500 ring-2 ring-green-100 dark:ring-green-900/30' 
                    : otpError
                    ? 'border-red-400 ring-2 ring-red-100 dark:ring-red-900/30'
                    : 'border-gray-200 dark:border-gray-800 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100'
                }`}>
                  <KeyRound className={`w-5 h-5 ${isOtpVerified ? 'text-green-500' : otpError ? 'text-red-500' : 'text-indigo-500 dark:text-indigo-400'}`} />
                  <div className="flex-1">
                    <label className="block text-xs text-gray-400 dark:text-gray-500 mb-0.5">Enter OTP</label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => handleOtpChange(e.target.value)}
                      required
                      disabled={isOtpVerified || isVerifyingOtp}
                      className="w-full text-sm text-gray-900 dark:text-white outline-none bg-transparent placeholder-gray-300 dark:placeholder-gray-500 tracking-widest font-mono"
                      placeholder="XXXXXX"
                    />
                  </div>
                  {isVerifyingOtp && <RefreshCw className="w-5 h-5 text-indigo-500 animate-spin" />}
                  {isOtpVerified && <Check className="w-5 h-5 text-green-500" />}
                </div>
                {isOtpVerified && <p className="text-xs text-green-600 dark:text-green-400 mt-1 ml-1">OTP Verified Successfully!</p>}
                {otpError && <p className="text-xs text-red-500 mt-1 ml-1">{otpError}</p>}
              </div>
            )}

            {/* New Password Section (Locked until OTP Verified) */}
            <div className={`space-y-5 transition-all duration-500 ${isOtpVerified ? 'opacity-100' : 'opacity-40 pointer-events-none blur-[1px]'}`}>
              {/* New Password */}
              <div className="relative">
                <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-800 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 dark:focus-within:ring-indigo-900/30 transition-all bg-gray-50 dark:bg-black/50">
                  <Lock className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                  <div className="flex-1">
                    <label className="block text-xs text-gray-400 dark:text-gray-500 mb-0.5">New Password</label>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      disabled={!isOtpVerified}
                      className="w-full text-sm text-gray-900 dark:text-white outline-none bg-transparent placeholder-gray-300 dark:placeholder-gray-500"
                      placeholder="••••••••••"
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    disabled={!isOtpVerified}
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              <div className="flex gap-2 flex-wrap">
                <span className={`text-xs px-2.5 py-1 rounded-full ${hasMinLength ? 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-900/50 text-gray-400 dark:text-gray-500'}`}>
                  {hasMinLength ? <Check className="w-3 h-3 inline mr-1" /> : <X className="w-3 h-3 inline mr-1" />}
                  8+ chars
                </span>
                <span className={`text-xs px-2.5 py-1 rounded-full ${hasUppercase ? 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-900/50 text-gray-400 dark:text-gray-500'}`}>
                  {hasUppercase ? <Check className="w-3 h-3 inline mr-1" /> : <X className="w-3 h-3 inline mr-1" />}
                  Uppercase
                </span>
                <span className={`text-xs px-2.5 py-1 rounded-full ${hasNumber ? 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-900/50 text-gray-400 dark:text-gray-500'}`}>
                  {hasNumber ? <Check className="w-3 h-3 inline mr-1" /> : <X className="w-3 h-3 inline mr-1" />}
                  Number
                </span>
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <div className={`flex items-center gap-3 p-4 rounded-xl border focus-within:ring-2 transition-all bg-gray-50 dark:bg-black/50 ${
                  confirmPassword.length > 0 
                    ? passwordsMatch 
                      ? 'border-green-500 focus-within:ring-green-100 dark:focus-within:ring-green-900/30' 
                      : 'border-red-400 focus-within:ring-red-100 dark:focus-within:ring-red-900/30'
                    : 'border-gray-200 dark:border-gray-800 focus-within:border-indigo-500 focus-within:ring-indigo-100 dark:focus-within:ring-indigo-900/30'
                }`}>
                  <Lock className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                  <div className="flex-1">
                    <label className="block text-xs text-gray-400 dark:text-gray-500 mb-0.5">Confirm Password</label>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={!isOtpVerified}
                      className="w-full text-sm text-gray-900 dark:text-white outline-none bg-transparent placeholder-gray-300 dark:placeholder-gray-500"
                      placeholder="••••••••••"
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    disabled={!isOtpVerified}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!isOtpVerified || !hasMinLength || !hasUppercase || !hasNumber || !passwordsMatch || isSubmitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-indigo-200 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  'Update Password'
                )}
              </button>
            </div>
          </form>

          {/* Back to Login */}
          <div className="p-4 border-t border-gray-100 dark:border-gray-700">
            <Link 
              to="/login" 
              className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
