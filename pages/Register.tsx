import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Check, X, KeyRound, Send, RefreshCw, ArrowLeft, ArrowRight } from 'lucide-react';
import { sendOtp, verifyOtp } from '../lib/otp';
import Seo from '../components/Seo';

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Step Management (1=Email, 2=OTP, 3=Password)
  const [step, setStep] = useState(1);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // OTP States
  const [otp, setOtp] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [otpError, setOtpError] = useState('');

  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const plan = params.get('plan');
    if (plan) {
      sessionStorage.setItem('pendingPlan', plan);
    }
  }, [location]);

  // Password validation checks
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Step 1: Send OTP
  const handleSendOtp = async () => {
    if (!email || !isEmailValid) {
      setError('Please enter a valid email address.');
      return;
    }

    setError('');
    setIsSendingOtp(true);

    const result = await sendOtp(email, 'signup');

    setIsSendingOtp(false);

    if (result.success) {
      setStep(2); // Move to OTP step
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

    const result = await verifyOtp(email, otp, 'signup');

    setIsVerifyingOtp(false);

    if (result.valid) {
      setStep(3); // Move to Password step
    } else {
      setOtpError(result.error || 'Invalid OTP');
    }
  };

  // Step 3: Submit registration
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordsMatch || !agreedToTerms) return;

    setIsSubmitting(true);
    setError('');

    try {
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

      if (!response.ok) {
        setError(data.error_description || data.msg || 'Signup failed');
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      navigate('/login', { state: { message: 'Account created successfully! Please login.' } });
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Step Indicator Component
  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-6">
      {[1, 2, 3].map((s) => (
        <React.Fragment key={s}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${step > s
            ? 'bg-green-500 text-white'
            : step === s
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            }`}>
            {step > s ? <Check className="w-4 h-4" /> : s}
          </div>
          {s < 3 && (
            <div className={`w-12 h-1 rounded transition-all ${step > s ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
              }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center px-4 py-12 transition-colors duration-200">
      <Seo title="Register" description="Create an account on CheckIAS to start your UPSC answer evaluation journey." />
      {/* Back Button */}
      <button
        onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)}
        className="absolute top-6 left-6 p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        title="Go back"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

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

          <div className="p-8">
            <StepIndicator />

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm mb-5">
                {error}
              </div>
            )}

            {/* STEP 1: Email */}
            {step === 1 && (
              <div className="space-y-5 animate-fadeIn">
                <div className="text-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Enter Your Email</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">We'll send you a verification code</p>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-800 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 dark:focus-within:ring-indigo-900/30 transition-all bg-gray-50 dark:bg-black/50">
                  <Mail className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                  <div className="flex-1">
                    <label className="block text-xs text-gray-400 dark:text-gray-500 mb-0.5">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full text-sm text-gray-900 dark:text-white outline-none bg-transparent placeholder-gray-300 dark:placeholder-gray-500"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={!isEmailValid || isSendingOtp}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-indigo-200 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                <div className="text-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Verify Your Email</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Enter the 6-digit code sent to <span className="font-medium text-indigo-600 dark:text-indigo-400">{email}</span></p>
                </div>

                <div className={`flex items-center gap-3 p-4 rounded-xl border transition-all bg-gray-50 dark:bg-black/50 ${otpError
                  ? 'border-red-400 ring-2 ring-red-100 dark:ring-red-900/30'
                  : 'border-gray-200 dark:border-gray-800 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100'
                  }`}>
                  <KeyRound className={`w-5 h-5 ${otpError ? 'text-red-500' : 'text-indigo-500 dark:text-indigo-400'}`} />
                  <div className="flex-1">
                    <label className="block text-xs text-gray-400 dark:text-gray-500 mb-0.5">Verification Code</label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => {
                        setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                        setOtpError('');
                      }}
                      className="w-full text-sm text-gray-900 dark:text-white outline-none bg-transparent placeholder-gray-300 dark:placeholder-gray-500 tracking-[0.5em] font-mono text-center text-lg"
                      placeholder="000000"
                      maxLength={6}
                    />
                  </div>
                </div>
                {otpError && <p className="text-xs text-red-500 text-center">{otpError}</p>}

                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={otp.length !== 6 || isVerifyingOtp}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-indigo-200 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                  className="w-full py-2.5 text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {isSendingOtp ? 'Sending...' : 'Resend OTP'}
                </button>
              </div>
            )}

            {/* STEP 3: Password */}
            {step === 3 && (
              <form onSubmit={handleSubmit} className="space-y-5 animate-fadeIn">
                <div className="text-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Create Password</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Set a strong password for your account</p>
                </div>

                {/* Password */}
                <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-800 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 dark:focus-within:ring-indigo-900/30 transition-all bg-gray-50 dark:bg-black/50">
                  <Lock className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                  <div className="flex-1">
                    <label className="block text-xs text-gray-400 dark:text-gray-500 mb-0.5">Password</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full text-sm text-gray-900 dark:text-white outline-none bg-transparent placeholder-gray-300 dark:placeholder-gray-500"
                      placeholder="••••••••••"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
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
                <div className={`flex items-center gap-3 p-4 rounded-xl border focus-within:ring-2 transition-all bg-gray-50 dark:bg-black/50 ${confirmPassword.length > 0
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
                      className="w-full text-sm text-gray-900 dark:text-white outline-none bg-transparent placeholder-gray-300 dark:placeholder-gray-500"
                      placeholder="••••••••••"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Terms Agreement */}
                <div className="flex items-start gap-3">
                  <label className="relative cursor-pointer mt-0.5">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
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
                  <span className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    I agree to the{' '}
                    <Link to="/terms-of-service" target="_blank" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                      Terms of Service
                    </Link>
                    {' '}and{' '}
                    <Link to="/privacy-policy" target="_blank" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                      Privacy Policy
                    </Link>
                  </span>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!hasMinLength || !hasUppercase || !hasNumber || !passwordsMatch || !agreedToTerms || isSubmitting}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-indigo-200 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer Link */}
        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-700 dark:hover:text-indigo-300">
            Login
          </Link>
        </p>
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

export default Register;
