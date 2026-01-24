import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { User, Phone, BookOpen, Calendar, Globe, CheckCircle, Lock, ChevronDown, Loader2, Cake } from 'lucide-react';
import DatePicker from './DatePicker';
import { useUser } from '../context/UserContext';
import { useProfile } from '../hooks/useProfile';

interface ProfileCompletionModalProps {
  isOpen: boolean;
}

const OPTIONAL_SUBJECTS = {
  'General Subjects': [
    'Agriculture',
    'Animal Husbandry and Veterinary Science',
    'Anthropology',
    'Botany',
    'Chemistry',
    'Civil Engineering',
    'Commerce and Accountancy',
    'Economics',
    'Electrical Engineering',
    'Geography',
    'Geology',
    'History',
    'Law',
    'Management',
    'Mathematics',
    'Mechanical Engineering',
    'Medical Science',
    'Philosophy',
    'Physics',
    'Political Science and International Relations',
    'Psychology',
    'Public Administration',
    'Sociology',
    'Statistics',
    'Zoology'
  ],
  'Literature Subjects': [
    'Assamese',
    'Bengali',
    'Bodo',
    'Dogri',
    'English',
    'Gujarati',
    'Hindi',
    'Kannada',
    'Kashmiri',
    'Konkani',
    'Maithili',
    'Malayalam',
    'Manipuri',
    'Marathi',
    'Nepali',
    'Odia',
    'Punjabi',
    'Sanskrit',
    'Santhali',
    'Sindhi',
    'Tamil',
    'Telugu',
    'Urdu'
  ]
};

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
    language: 'English',
    dob: ''
  });
  const [isYearOpen, setIsYearOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isSubjectOpen, setIsSubjectOpen] = useState(false);

  // Pre-fill from user data if available (but NOT fullName - let user enter it)
  useEffect(() => {
    if (user) {
      setProfile({
        fullName: '', // Don't pre-fill from email
        phone: user.phone || '',
        subject: user.optionalSubject || '',
        yearOfAttempt: user.yearOfAttempt || '',
        language: 'English',
        dob: user.dob || ''
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
      dob: profile.dob || null,
    });
    
    if (success) {
      // Update local state immediately so Settings page has correct data
      updateUser({
        name: profile.fullName,
        phone: profile.phone,
        yearOfAttempt: profile.yearOfAttempt,
        optionalSubject: profile.subject,
        dob: profile.dob,
        isProfileComplete: true
      });
    } else {
      console.error('Profile save failed:', saveError);
      setError(saveError || 'Failed to save profile');
    }
    
    setLoading(false);
  };

  const closeAllDropdowns = () => {
    setIsYearOpen(false);
    setIsLanguageOpen(false);
    setIsSubjectOpen(false);
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
        <div className="p-6 bg-indigo-600">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-white/20 rounded-full">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Complete Your Profile</h2>
              <p className="text-indigo-100 text-sm">Welcome! Let's personalize your experience.</p>
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

          {/* Date of Birth (Optional) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Cake className="w-4 h-4 text-indigo-500" />
              Date of Birth <span className="text-gray-400 text-xs">(optional)</span>
            </label>
            <DatePicker
              value={profile.dob}
              onChange={(date) => setProfile({ ...profile, dob: date })}
              placeholder="Select Date of Birth"
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Optional Subject Dropdown */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              Optional Subject
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => { setIsSubjectOpen(!isSubjectOpen); setIsYearOpen(false); setIsLanguageOpen(false); }}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-left flex items-center justify-between"
              >
                <span className={profile.subject ? '' : 'text-gray-400'}>{profile.subject || 'Select Optional Subject'}</span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isSubjectOpen ? 'rotate-180' : ''}`} />
              </button>
              
              <div className={`absolute top-full left-0 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-20 overflow-hidden transition-all origin-top ${isSubjectOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                  {Object.entries(OPTIONAL_SUBJECTS).map(([category, subjects]) => (
                    <div key={category}>
                      <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-xs font-semibold text-gray-500 dark:text-gray-400 sticky top-0">
                        {category}
                      </div>
                      {subjects.map((subject) => (
                        <button
                          key={subject}
                          type="button"
                          onClick={() => {
                            setProfile({ ...profile, subject });
                            setIsSubjectOpen(false);
                          }}
                          className={`w-full px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700 text-sm ${profile.subject === subject ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : 'text-gray-900 dark:text-white'}`}
                        >
                          {subject}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
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
                  onClick={() => { setIsYearOpen(!isYearOpen); setIsLanguageOpen(false); setIsSubjectOpen(false); }}
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
                  onClick={() => { setIsLanguageOpen(!isLanguageOpen); setIsYearOpen(false); setIsSubjectOpen(false); }}
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
