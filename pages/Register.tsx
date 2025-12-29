import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Check, X } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password validation checks
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Register:', { email, password });
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
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!hasMinLength || !hasUppercase || !hasNumber || !passwordsMatch}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-indigo-200 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Register
            </button>
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
