import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { useUser } from '../context/UserContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshUser } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Get success message from registration redirect
  const successMessage = location.state?.message;

  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const plan = params.get('plan');
    if (plan) {
      sessionStorage.setItem('pendingPlan', plan);
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Use direct fetch for login to avoid SDK promise issues
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/auth/v1/token?grant_type=password`,
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
      console.log('Login response:', data);

      if (!response.ok) {
        setError(data.error_description || data.msg || 'Invalid email or password');
        setIsLoading(false);
        return;
      }

      // Store session based on Remember Me setting
      if (data.access_token) {
        // Calculate expiry: 90 days if Remember Me, otherwise use token's natural expiry
        const expiresAt = rememberMe 
          ? Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60) // 90 days
          : data.expires_at;

        const session = {
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          expires_at: expiresAt,
          expires_in: data.expires_in,
          token_type: data.token_type,
          user: data.user,
        };
        
        const sessionData = JSON.stringify({ currentSession: session, rememberMe });
        
        if (rememberMe) {
          // Persist in localStorage for 90 days
          localStorage.setItem('supabase.auth.token', sessionData);
        } else {
          // Use sessionStorage - clears when browser/tab closes
          sessionStorage.setItem('supabase.auth.token', sessionData);
          // Also remove any old localStorage session
          localStorage.removeItem('supabase.auth.token');
        }
        
        console.log('Session stored, refreshing user...');
        
        // Refresh user context to pick up the new session
        await refreshUser();
        console.log('User refreshed, navigating to dashboard...');
      }

      setIsLoading(false);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please try again.');
      setIsLoading(false);
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
              className="flex-1 py-4 text-sm font-semibold transition-all bg-indigo-600 text-white"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="flex-1 py-4 text-sm font-semibold transition-all bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {/* Success Message */}
            {successMessage && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-600 dark:text-green-400 text-sm">
                {successMessage}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Email */}
            <div className="relative">
              <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-800 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 dark:focus-within:ring-indigo-900/30 transition-all bg-gray-50 dark:bg-black/50">
                <Mail className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                <div className="flex-1">
                  <label className="block text-xs text-gray-400 dark:text-gray-500 mb-0.5">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full text-sm text-gray-900 dark:text-white outline-none bg-transparent placeholder-gray-300 dark:placeholder-gray-500"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
            </div>

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
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600 peer-checked:border-indigo-600 peer-checked:bg-indigo-600 transition-all flex items-center justify-center">
                    {rememberMe && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-700 dark:hover:text-indigo-300">
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-indigo-200 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>
        </div>

        {/* Footer Link */}
        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Don't have an account?{' '}
          <Link to="/signup" className="text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-700 dark:hover:text-indigo-300">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
