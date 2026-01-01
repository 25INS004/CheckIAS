import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { User, Phone, BookOpen, Calendar, Globe, CheckCircle, Lock, ChevronDown, Loader2 } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useProfile } from '../hooks/useProfile';

interface ProfileCompletionModalProps {
  isOpen: boolean;
}

const ProfileCompletionModal: React.FC<ProfileCompletionModalProps> = ({ isOpen }) => {
  const { user, completeProfile, refreshUser, updateUser } = useUser();
  const { updateProfile, updating } = useProfile();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState({
    fullName: '',
    phone: '',
    subject: '',
    yearOfAttempt: '',
    language: 'English'
  });
  const [isYearOpen, setIsYearOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);

  // Pre-fill from user data if available
  useEffect(() => {
    if (user) {
      setProfile({
        fullName: user.name || '',
        phone: user.phone || '',
        subject: user.optionalSubject || '',
        yearOfAttempt: user.yearOfAttempt || '',
        language: 'English'
      });
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const isFormValid = profile.fullName.trim() !== '' && profile.phone.trim() !== '' && profile.yearOfAttempt !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);
    setError('');

    // Save to database
    const { success, error: saveError } = await updateProfile({
      full_name: profile.fullName,
      phone: profile.phone,
      year_of_attempt: profile.yearOfAttempt,
      optional_subject: profile.subject,
    });
    
    console.log('Profile update result:', { success, saveError });

    if (success) {
      console.log('Profile saved, updating local user state');
      // Update local state immediately so Settings page has correct data
      updateUser({
        name: profile.fullName,
        phone: profile.phone,
        yearOfAttempt: profile.yearOfAttempt,
        optionalSubject: profile.subject,
        isProfileComplete: true
      });
      // Don't refresh immediately - profile is already updated locally
    } else {
      console.error('Profile save failed:', saveError);
      setError(saveError || 'Failed to save profile');
    }
    
    setLoading(false);
  };

  const years = ['2025', '2026', '2027', '2028', '2029', '2030'];
  const languages = ['English', 'Hindi'];

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div 
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-white/20 rounded-full">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Complete Your Profile</h2>
              <p className="text-indigo-100 text-sm">Welcome, {user.name}! Let's personalize your experience.</p>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <div className="flex-1 h-1 rounded-full bg-white/30">
              <div className="h-full bg-white rounded-full transition-all duration-300" style={{ width: isFormValid ? '100%' : '50%' }} />
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-500" />
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={profile.fullName}
              onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
              placeholder="Enter your full name"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Phone className="w-4 h-4 text-indigo-500" />
              Contact Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              required
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              placeholder="+91 98765 43210"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              Optional Subject
            </label>
            <input
              type="text"
              value={profile.subject}
              onChange={(e) => setProfile({ ...profile, subject: e.target.value })}
              placeholder="e.g. Political Science"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Custom Year Dropdown */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-500" />
                Year of Attempt <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => { setIsYearOpen(!isYearOpen); setIsLanguageOpen(false); }}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-left flex items-center justify-between"
                >
                  <span className={profile.yearOfAttempt ? '' : 'text-gray-400'}>{profile.yearOfAttempt || 'Select'}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isYearOpen ? 'rotate-180' : ''}`} />
                </button>
                
                <div className={`absolute top-full left-0 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-20 overflow-hidden transition-all origin-top ${isYearOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                  <div className="max-h-48 overflow-y-auto custom-scrollbar">
                    {years.map((year) => (
                      <button
                        key={year}
                        type="button"
                        onClick={() => {
                          setProfile({ ...profile, yearOfAttempt: year });
                          setIsYearOpen(false);
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 ${profile.yearOfAttempt === year ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : 'text-gray-900 dark:text-white'}`}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Custom Language Dropdown */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-500" />
                Language
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => { setIsLanguageOpen(!isLanguageOpen); setIsYearOpen(false); }}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-left flex items-center justify-between"
                >
                  <span>{profile.language}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isLanguageOpen ? 'rotate-180' : ''}`} />
                </button>
                
                <div className={`absolute top-full left-0 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-20 overflow-hidden transition-all origin-top ${isLanguageOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                  {languages.map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => {
                        setProfile({ ...profile, language: lang });
                        setIsLanguageOpen(false);
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 ${profile.language === lang ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : 'text-gray-900 dark:text-white'}`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Green Submit Button with Lock */}
          <button
            type="submit"
            disabled={!isFormValid || loading}
            className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 font-semibold rounded-xl transition-all shadow-lg ${
              isFormValid 
                ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-200 dark:shadow-none cursor-pointer' 
                : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <span>Saving...</span>
            ) : isFormValid ? (
              <>
                <CheckCircle className="w-5 h-5" />
                Complete Profile & Continue
              </>
            ) : (
              <>
                <Lock className="w-5 h-5" />
                Complete Required Fields
              </>
            )}
          </button>

          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            You can update these details later in Settings
          </p>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default ProfileCompletionModal;
