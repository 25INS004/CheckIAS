import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import HardcodedUsers from '../components/HardcodedUsers';
import { useUser } from '../context/UserContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login:', { email, password, rememberMe });
    
    // Simple mock authentication logic
    let plan: 'Free' | 'Starter' | 'Pro' | 'Achiever' = 'Free';
    if (email.includes('pro') || email === 'pro@checkias.com') {
        plan = 'Pro';
    } else if (email.includes('starter') || email === 'starter@checkias.com') {
        plan = 'Starter';
    } else if (email.includes('achiever') || email === 'achiever@checkias.com') {
        plan = 'Achiever';
    }
    
    login(email, plan);
    navigate('/dashboard');
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
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded-full border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 accent-indigo-600 bg-white dark:bg-gray-700"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-700 dark:hover:text-indigo-300">
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-indigo-200 dark:shadow-none"
            >
              Login
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

        {/* Test Credentials - Dev Only */}
        <HardcodedUsers />
      </div>
    </div>
  );
};

export default Login;
