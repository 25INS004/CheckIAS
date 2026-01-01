import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Check, X, KeyRound, Send, RefreshCw } from 'lucide-react';
import { sendOtp, verifyOtp } from '../lib/otp';
import { supabase } from '../lib/supabase';

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const plan = params.get('plan');
    if (plan) {
      sessionStorage.setItem('pendingPlan', plan);
    }
  }, [location]);

  // OTP States
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [otpError, setOtpError] = useState('');

  // Password validation checks
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Send OTP to email
  const handleSendOtp = async () => {
    if (!email || !isEmailValid) {
      setError('Please enter a valid email address first.');
      return;
    }
    
    setError('');
    setIsSendingOtp(true);
    
    const result = await sendOtp(email, 'signup');
    
    setIsSendingOtp(false);
    
    if (result.success) {
      setOtpSent(true);
      setOtp('');
      setIsOtpVerified(false);
    } else {
      setError(result.error || 'Failed to send OTP');
    }
  };

  // Verify OTP when user enters 6 digits
  const handleOtpChange = async (value: string) => {
    const cleanValue = value.replace(/\D/g, '').slice(0, 6);
    setOtp(cleanValue);
    setOtpError('');

    if (cleanValue.length === 6) {
      setIsVerifyingOtp(true);
      
      const result = await verifyOtp(email, cleanValue, 'signup');
      
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

  // Submit registration
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOtpVerified || !passwordsMatch || !agreedToTerms) return;

    setIsSubmitting(true);
    setError('');

    console.log('Starting signup for:', email);

    try {
      // Use direct fetch instead of SDK to bypass promise issue
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/auth/v1/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();
      console.log('Signup response:', data);

      if (!response.ok) {
        setError(data.error_description || data.msg || 'Signup failed');
        setIsSubmitting(false);
        return;
      }

      console.log('Signup successful, navigating to login');
      setIsSubmitting(false);
      navigate('/login', { state: { message: 'Account created successfully! Please login.' } });
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'Signup failed. Please try again.');
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
          {/* Tab Switcher */}
          <div className="flex border-b border-gray-100 dark:border-gray-700">
            <button
              onClick={() => navigate('/login')}
              className="flex-1 py-4 text-sm font-semibold transition-all bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Login
            </button>
            <button
              className="flex-1 py-4 text-sm font-semibold transition-all bg-indigo-600 text-white"
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Email with Get OTP Button */}
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

              {/* Get OTP Button */}
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

            {/* Password Section (Locked until OTP Verified) */}
            <div className={`space-y-5 transition-all duration-500 ${isOtpVerified ? 'opacity-100' : 'opacity-40 pointer-events-none blur-[1px]'}`}>
              {/* Password */}
              <div className="relative">
                <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-800 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 dark:focus-within:ring-indigo-900/30 transition-all bg-gray-50 dark:bg-black/50">
                  <Lock className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                  <div className="flex-1">
                    <label className="block text-xs text-gray-400 dark:text-gray-500 mb-0.5">Password</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={!isOtpVerified}
                      className="w-full text-sm text-gray-900 dark:text-white outline-none bg-transparent placeholder-gray-300 dark:placeholder-gray-500"
                      placeholder="••••••••••"
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    disabled={!isOtpVerified}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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

              {/* Terms Agreement Checkbox */}
              <div className="flex items-start gap-3">
                <label className="relative cursor-pointer mt-0.5">
                  <input
                    type="checkbox"
                    id="agreeTerms"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    disabled={!isOtpVerified}
                    className="sr-only peer"
                  />
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600 peer-checked:border-indigo-600 peer-checked:bg-indigo-600 transition-all flex items-center justify-center">
                    {agreedToTerms && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </label>
                <label htmlFor="agreeTerms" className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed cursor-pointer">
                  I agree to the{' '}
                  <Link to="/terms-of-service" target="_blank" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                    Terms of Service
                  </Link>
                  {' '}and{' '}
                  <Link to="/privacy-policy" target="_blank" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!isOtpVerified || !hasMinLength || !hasUppercase || !hasNumber || !passwordsMatch || !agreedToTerms || isSubmitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-indigo-200 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Register'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer Link */}
        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-700 dark:hover:text-indigo-300">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
