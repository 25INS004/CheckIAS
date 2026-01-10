import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Check, X, KeyRound, Send, RefreshCw, Shield, ArrowRight } from 'lucide-react';
import { sendOtp, verifyOtp } from '../../lib/otp';

const AdminForgotPassword = () => {
  const navigate = useNavigate();
  
  // Step Management (1=Email, 2=OTP, 3=Password)
  const [step, setStep] = useState(1);
  
  // Form State
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Loading States
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [otpError, setOtpError] = useState('');

  // Validation
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

  // Step 1: Send OTP
  const handleSendOtp = async () => {
    if (!email || !isEmailValid) {
      setError('Please enter a valid email address.');
      return;
    }
    
    setError('');
    setIsSendingOtp(true);
    
    const result = await sendOtp(email, 'password_reset');
    
    setIsSendingOtp(false);
    
    if (result.success) {
      setStep(2);
      setOtp('');
    } else {
      setError(result.error || 'Failed to send OTP');
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setOtpError('Please enter a 6-digit OTP');
      return;
    }
    
    setOtpError('');
    setIsVerifyingOtp(true);
    
    const result = await verifyOtp(email, otp, 'password_reset');
    
    setIsVerifyingOtp(false);
    
    if (result.valid) {
      setStep(3);
    } else {
      setOtpError(result.error || 'Invalid OTP');
    }
  };

  // Step 3: Submit new password
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordsMatch) return;

    setIsSubmitting(true);
    setError('');

    try {
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

      if (!response.ok) {
        setError(data.error || 'Failed to reset password');
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      navigate('/login', { state: { message: 'Password updated successfully! Please login with your new password.' } });
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Step Indicator Component (Admin Red Theme)
  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-6">
      {[1, 2, 3].map((s) => (
        <React.Fragment key={s}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
            step > s 
              ? 'bg-green-500 text-white' 
              : step === s 
              ? 'bg-red-600 text-white' 
              : 'bg-gray-700 text-gray-500'
          }`}>
            {step > s ? <Check className="w-4 h-4" /> : s}
          </div>
          {s < 3 && (
            <div className={`w-12 h-1 rounded transition-all ${
              step > s ? 'bg-green-500' : 'bg-gray-700'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-12 transition-colors duration-200">
      {/* Back Button */}
      <button
        onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)}
        className="absolute top-6 left-6 p-2 rounded-full bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
        title="Go back"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3">
            <div className="p-3 bg-red-600 rounded-xl">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight text-white">
              ADMIN PANEL
            </span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-gray-800 shadow-xl rounded-2xl overflow-hidden border border-gray-700 transition-colors">
          {/* Header */}
          <div className="p-6 bg-red-600 border-b border-red-700">
            <h2 className="text-xl font-bold text-white text-center">Reset Admin Password</h2>
            <p className="text-center text-sm text-red-100 mt-1">
              {step === 1 && 'Enter your admin email'}
              {step === 2 && 'Verify your email'}
              {step === 3 && 'Set your new password'}
            </p>
          </div>

          <div className="p-8">
            <StepIndicator />
            
            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-400 text-sm mb-5">
                {error}
              </div>
            )}

            {/* STEP 1: Email */}
            {step === 1 && (
              <div className="space-y-5 animate-fadeIn">
                <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-700 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-900/30 transition-all bg-gray-900/50">
                  <Mail className="w-5 h-5 text-red-500" />
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-0.5">Admin Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full text-sm text-white outline-none bg-transparent placeholder-gray-500"
                      placeholder="admin@checkias.com"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={!isEmailValid || isSendingOtp}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-semibold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSendingOtp ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      Get OTP
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* STEP 2: OTP Verification */}
            {step === 2 && (
              <div className="space-y-5 animate-fadeIn">
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-400">
                    Enter the 6-digit code sent to <span className="font-medium text-red-400">{email}</span>
                  </p>
                </div>
                
                <div className={`flex items-center gap-3 p-4 rounded-xl border transition-all bg-gray-900/50 ${
                  otpError 
                    ? 'border-red-400 ring-2 ring-red-900/30'
                    : 'border-gray-700 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-900/30'
                }`}>
                  <KeyRound className={`w-5 h-5 ${otpError ? 'text-red-400' : 'text-red-500'}`} />
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-0.5">Verification Code</label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => {
                        setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                        setOtpError('');
                      }}
                      className="w-full text-sm text-white outline-none bg-transparent placeholder-gray-500 tracking-[0.5em] font-mono text-center text-lg"
                      placeholder="000000"
                      maxLength={6}
                    />
                  </div>
                </div>
                {otpError && <p className="text-xs text-red-400 text-center">{otpError}</p>}

                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={otp.length !== 6 || isVerifyingOtp}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-semibold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isVerifyingOtp ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify OTP
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isSendingOtp}
                  className="w-full py-2.5 text-sm text-gray-400 hover:text-red-400 transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {isSendingOtp ? 'Sending...' : 'Resend OTP'}
                </button>
              </div>
            )}

            {/* STEP 3: Password */}
            {step === 3 && (
              <form onSubmit={handleSubmit} className="space-y-5 animate-fadeIn">
                {/* New Password */}
                <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-700 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-900/30 transition-all bg-gray-900/50">
                  <Lock className="w-5 h-5 text-red-500" />
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-0.5">New Password</label>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="w-full text-sm text-white outline-none bg-transparent placeholder-gray-500"
                      placeholder="••••••••••"
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="text-gray-500 hover:text-gray-300"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Password Requirements */}
                <div className="flex gap-2 flex-wrap">
                  <span className={`text-xs px-2.5 py-1 rounded-full ${hasMinLength ? 'bg-green-900/40 text-green-400' : 'bg-gray-900/50 text-gray-500'}`}>
                    {hasMinLength ? <Check className="w-3 h-3 inline mr-1" /> : <X className="w-3 h-3 inline mr-1" />}
                    8+ chars
                  </span>
                  <span className={`text-xs px-2.5 py-1 rounded-full ${hasUppercase ? 'bg-green-900/40 text-green-400' : 'bg-gray-900/50 text-gray-500'}`}>
                    {hasUppercase ? <Check className="w-3 h-3 inline mr-1" /> : <X className="w-3 h-3 inline mr-1" />}
                    Uppercase
                  </span>
                  <span className={`text-xs px-2.5 py-1 rounded-full ${hasNumber ? 'bg-green-900/40 text-green-400' : 'bg-gray-900/50 text-gray-500'}`}>
                    {hasNumber ? <Check className="w-3 h-3 inline mr-1" /> : <X className="w-3 h-3 inline mr-1" />}
                    Number
                  </span>
                  <span className={`text-xs px-2.5 py-1 rounded-full ${hasSpecialChar ? 'bg-green-900/40 text-green-400' : 'bg-gray-900/50 text-gray-500'}`}>
                    {hasSpecialChar ? <Check className="w-3 h-3 inline mr-1" /> : <X className="w-3 h-3 inline mr-1" />}
                    Special
                  </span>
                </div>

                {/* Confirm Password */}
                <div className={`flex items-center gap-3 p-4 rounded-xl border focus-within:ring-2 transition-all bg-gray-900/50 ${
                  confirmPassword.length > 0 
                    ? passwordsMatch 
                      ? 'border-green-500 focus-within:ring-green-900/30' 
                      : 'border-red-400 focus-within:ring-red-900/30'
                    : 'border-gray-700 focus-within:border-red-500 focus-within:ring-red-900/30'
                }`}>
                  <Lock className="w-5 h-5 text-red-500" />
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-0.5">Confirm Password</label>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full text-sm text-white outline-none bg-transparent placeholder-gray-500"
                      placeholder="••••••••••"
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-gray-500 hover:text-gray-300"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!hasMinLength || !hasUppercase || !hasNumber || !hasSpecialChar || !passwordsMatch || isSubmitting}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-semibold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Updating Password...
                    </>
                  ) : (
                    'Update Admin Password'
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Back to Admin Login */}
          <div className="p-4 border-t border-gray-700">
            <Link 
              to="/login" 
              className="flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-red-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Admin Login
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AdminForgotPassword;
