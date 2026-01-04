import React, { useState, useRef } from 'react';
import { User, Save, Shield, Bell, Key, Mail, Lock, Camera, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';

export default function AdminSettings() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const [adminProfile, setAdminProfile] = useState({
    name: 'Admin User',
    email: 'admin@checkias.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  });
  
  const [notifications, setNotifications] = useState({
    newUsers: true,
    submissions: true
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAdminProfile(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast.success('Settings saved successfully!');
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account preferences and security configuration</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-4 px-2 text-sm font-medium transition-colors relative ${
            activeTab === 'profile' 
              ? 'text-indigo-600 dark:text-indigo-400' 
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          Profile Details
          {activeTab === 'profile' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`pb-4 px-2 text-sm font-medium transition-colors relative ${
            activeTab === 'security' 
              ? 'text-indigo-600 dark:text-indigo-400' 
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          Security & Notifications
          {activeTab === 'security' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-t-full" />
          )}
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 sm:p-8 animate-fade-in">
          <div className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-6 pb-6 border-b border-gray-100 dark:border-gray-800">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <img 
                  src={adminProfile.avatar} 
                  alt="Profile" 
                  className="w-20 h-20 rounded-full object-cover border-4 border-white dark:border-gray-950 shadow-sm group-hover:opacity-75 transition-opacity"
                />
                <button type="button" className="absolute bottom-0 right-0 p-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full text-gray-500 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-sm transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Profile Photo</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Update your account picture</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                <div className="flex items-center w-full rounded-lg border border-gray-300 dark:border-gray-800 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 bg-gray-50 dark:bg-gray-900 transition-all">
                  <div className="pl-3.5 pr-2 py-2.5 text-gray-400">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={adminProfile.name}
                    onChange={(e) => setAdminProfile({ ...adminProfile, name: e.target.value })}
                    className="w-full pr-4 py-2.5 outline-none border-none focus:ring-0 text-gray-900 dark:text-white bg-transparent"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                <div className="flex items-center w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900/50 transition-all">
                  <div className="pl-3.5 pr-2 py-2.5 text-gray-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    value={adminProfile.email}
                    disabled
                    className="w-full pr-4 py-2.5 outline-none border-none focus:ring-0 text-gray-500 dark:text-gray-400 bg-transparent cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-gray-500">Email address cannot be changed</p>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-all disabled:opacity-50"
              >
                {loading ? 'Saving...' : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 sm:p-8 animate-fade-in">
            <div className="max-w-lg space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Password</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Securely update your password by receiving a reset link via email.
                </p>
              </div>
              
              <button
                onClick={() => navigate('/forgot-password')}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-all"
              >
                <Lock className="w-4 h-4" />
                Reset Password
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 sm:p-8 animate-fade-in">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Email Notifications</h3>
            <div className="space-y-4">
              {/* Toggle 1: New User Registrations */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-transparent dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">New User Registrations</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Get notified when a new user signs up.</p>
                  </div>
                </div>
                {/* Toggle Button */}
                <button
                  type="button"
                  onClick={() => setNotifications(prev => ({ ...prev, newUsers: !prev.newUsers }))}
                  className={`
                    relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent items-center
                    transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2
                    ${notifications.newUsers ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}
                  `}
                >
                  <span className="sr-only">Use setting</span>
                  <span
                    aria-hidden="true"
                    className={`
                      pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 
                      transition duration-200 ease-in-out
                      ${notifications.newUsers ? 'translate-x-3' : 'translate-x-0'}
                    `}
                  />
                </button>
              </div>

              {/* Toggle 2: New Submissions */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-transparent dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">New Submissions</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Get notified when a new copy is submitted.</p>
                  </div>
                </div>
                {/* Toggle Button */}
                <button
                  type="button"
                  onClick={() => setNotifications(prev => ({ ...prev, submissions: !prev.submissions }))}
                  className={`
                    relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent items-center
                    transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2
                    ${notifications.submissions ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}
                  `}
                >
                  <span className="sr-only">Use setting</span>
                  <span
                    aria-hidden="true"
                    className={`
                      pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 
                      transition duration-200 ease-in-out
                      ${notifications.submissions ? 'translate-x-3' : 'translate-x-0'}
                    `}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
