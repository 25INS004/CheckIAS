import React, { useState, useEffect } from 'react';
import { User, Phone, Lock, Save, Camera, ChevronDown } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import DatePicker from '../components/DatePicker';
import SupportPage from './SupportPage';

const ProfileSettings = () => {
  const { tab } = useParams<{ tab?: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const activeTab = tab || 'profile';
  
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isYearOpen, setIsYearOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);

  // Profile State
  const [profile, setProfile] = useState({
    fullName: 'John Doe',
    email: 'john@example.com',
    phone: '+91 98765 43210',
    avatar: '',
    subject: '',
    yearOfAttempt: '',
    dob: '',
    language: 'English'
  });

  useEffect(() => {
    if (!tab) {
      navigate('/dashboard/settings/profile', { replace: true });
    }
  }, [tab, navigate]);

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
          onClick={() => navigate('/dashboard/settings/profile')}
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
          onClick={() => navigate('/dashboard/settings/security')}
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
        <button
          onClick={() => navigate('/dashboard/settings/support')}
          className={`pb-4 px-2 text-sm font-medium transition-colors relative ${
            activeTab === 'support' 
              ? 'text-indigo-600 dark:text-indigo-400' 
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          Support
          {activeTab === 'support' && (
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
                <div className="flex items-center w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 transition-all">
                  <div className="pl-3.5 pr-2 py-2.5 text-gray-400">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={profile.fullName}
                    disabled
                    className="w-full pr-4 py-2.5 outline-none border-none focus:ring-0 text-gray-500 dark:text-gray-400 bg-transparent cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Contact Number</label>
                <div className="flex items-center w-full rounded-lg border border-gray-300 dark:border-gray-600 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 bg-white dark:bg-black/50 transition-all">
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

              {/* New Fields */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Optional Subject</label>
                <input
                  type="text"
                  value={profile.subject}
                  onChange={(e) => setProfile({ ...profile, subject: e.target.value })}
                  placeholder="e.g. Political Science"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Year of Attempt</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsYearOpen(!isYearOpen)}
                    onBlur={() => setTimeout(() => setIsYearOpen(false), 200)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-left flex items-center justify-between"
                  >
                    <span>{profile.yearOfAttempt || "Select Year"}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isYearOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <div className={`absolute top-full left-0 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg z-20 overflow-hidden transition-all origin-top ${isYearOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                  <div className="max-h-60 overflow-y-auto custom-scrollbar">
                    {[2025, 2026, 2027, 2028, 2029, 2030].map((year) => (
                      <button
                        key={year}
                        type="button"
                        onClick={() => {
                          setProfile({ ...profile, yearOfAttempt: year.toString() });
                          setIsYearOpen(false);
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 ${profile.yearOfAttempt === year.toString() ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : 'text-gray-900 dark:text-white'}`}
                      >
                        {year}
                      </button>
                    ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date of Birth</label>
                <DatePicker
                  value={profile.dob}
                  onChange={(date) => setProfile({ ...profile, dob: date })}
                  placeholder="Select Date of Birth"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Language Preference</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                    onBlur={() => setTimeout(() => setIsLanguageOpen(false), 200)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-left flex items-center justify-between"
                  >
                    <span>{profile.language}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isLanguageOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <div className={`absolute top-full left-0 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg z-20 overflow-hidden transition-all origin-top ${isLanguageOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                    {['English', 'Hindi'].map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => {
                          setProfile({ ...profile, language: lang });
                          setIsLanguageOpen(false);
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 ${profile.language === lang ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : 'text-gray-900 dark:text-white'}`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>
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

      {activeTab === 'support' && (
        <SupportPage hideHeader />
      )}
    </div>
  );
};

export default ProfileSettings;
