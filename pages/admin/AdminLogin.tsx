import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, RefreshCw, ArrowLeft, Shield } from 'lucide-react';
import { useUser } from '../../context/UserContext';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { refreshUser } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Use direct fetch for login
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
      console.log('Admin login response:', data);

      if (!response.ok) {
        setError(data.error_description || data.msg || 'Invalid credentials');
        setIsLoading(false);
        return;
      }

      // Check if user exists in admins table
      const adminResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/admins?email=eq.${encodeURIComponent(email)}&is_active=eq.true&select=id,email,full_name`,
        {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${data.access_token}`,
          },
        }
      );

      const adminData = await adminResponse.json();
      
      if (!adminData || adminData.length === 0) {
        setError('Access denied. Admin credentials required.');
        setIsLoading(false);
        return;
      }

      // Update last_login timestamp
      await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/admins?id=eq.${adminData[0].id}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${data.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ last_login: new Date().toISOString() }),
        }
      );

      // Store session
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
          localStorage.removeItem('supabase.auth.token');
        }
        
        await refreshUser();
      }

      setIsLoading(false);
      navigate('/admin');
    } catch (err: any) {
      console.error('Admin login error:', err);
      setError(err.message || 'Login failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-12 transition-colors duration-200">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
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
          {/* Tab Switcher */}
          <div className="flex border-b border-gray-700">
            <button
              className="flex-1 py-4 text-sm font-semibold transition-all bg-red-600 text-white"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/admin/forgot-password')}
              className="flex-1 py-4 text-sm font-semibold transition-all bg-gray-700/50 text-gray-400 hover:bg-gray-700"
            >
              Forgot Password
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Email */}
            <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-700 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-900/30 transition-all bg-gray-900/50">
              <Mail className="w-5 h-5 text-red-500" />
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-0.5">Admin Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full text-sm text-white outline-none bg-transparent placeholder-gray-500"
                  placeholder="admin@checkias.com"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-700 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-900/30 transition-all bg-gray-900/50">
              <Lock className="w-5 h-5 text-red-500" />
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-0.5">Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full text-sm text-white outline-none bg-transparent placeholder-gray-500"
                  placeholder="••••••••••"
                />
              </div>
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-500 hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded-full border-2 transition-colors flex items-center justify-center ${
                    rememberMe 
                      ? 'bg-red-600 border-red-600' 
                      : 'border-gray-600 group-hover:border-gray-500'
                  }`}>
                    {rememberMe && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-sm text-gray-400 group-hover:text-gray-300">Remember me (90 days)</span>
              </label>
              <Link 
                to="/admin/forgot-password" 
                className="text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-semibold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Access Admin Panel
                </>
              )}
            </button>
          </form>

          {/* Back to Main Site */}
          <div className="p-4 border-t border-gray-700">
            <Link 
              to="/" 
              className="flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-red-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Main Site
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
