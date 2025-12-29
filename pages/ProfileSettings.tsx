import React, { useState } from 'react';
import { User, Phone, Lock, Save, Camera } from 'lucide-react';

const ProfileSettings = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

  // Profile State
  const [profile, setProfile] = useState({
    fullName: 'John Doe',
    email: 'john@example.com',
    phone: '+91 98765 43210',
    avatar: ''
  });

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      alert('Profile updated successfully!');
    }, 1000);
  };



  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account preferences and security</p>
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
          Password & Security
          {activeTab === 'security' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-t-full" />
          )}
        </button>
      </div>

      {activeTab === 'profile' && (
        <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 sm:p-8 animate-fade-in">
          <form onSubmit={handleProfileUpdate} className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-6 pb-6 border-b border-gray-100 dark:border-gray-800">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-2xl font-bold border-4 border-white dark:border-gray-950 shadow-sm">
                  {profile.fullName.charAt(0)}
                </div>
                <button type="button" className="absolute bottom-0 right-0 p-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full text-gray-500 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-sm transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
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
                    value={profile.fullName}
                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                    className="w-full pr-4 py-2.5 outline-none border-none focus:ring-0 text-gray-900 dark:text-white bg-transparent"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Contact Number</label>
                <div className="flex items-center w-full rounded-lg border border-gray-300 dark:border-gray-600 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 bg-gray-50 dark:bg-black/50 transition-all">
                  <div className="pl-3.5 pr-2 py-2.5 text-gray-400">
                    <Phone className="w-5 h-5" />
                  </div>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full pr-4 py-2.5 outline-none border-none focus:ring-0 text-gray-900 dark:text-white bg-transparent"
                  />
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500">Email address cannot be changed</p>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
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
          </form>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 sm:p-8 animate-fade-in">
          <div className="max-w-lg space-y-6">
             <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Password</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Securely update your password by receiving a reset link via email.
              </p>
            </div>
            
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                setTimeout(() => {
                  setLoading(false);
                  alert("A password reset link has been sent to your email address.");
                }, 1000);
              }}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-all disabled:opacity-50"
            >
              {loading ? 'Sending...' : (
                <>
                  <Lock className="w-4 h-4" />
                  Update Password
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSettings;
