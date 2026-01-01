import React, { useState } from 'react';
import { FileUp, AlertCircle, Crown, CheckCircle, ChevronDown, Lock, Loader2 } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { Link } from 'react-router-dom';
import { useSubmissions } from '../hooks/useSubmissions';
import { useFileUpload } from '../hooks/useFileUpload';

const subjects = [
  'General Studies I',
  'General Studies II', 
  'General Studies III',
  'General Studies IV (Ethics)',
  'Essay',
  'Optional Paper I',
  'Optional Paper II',
  'Other'
];

const years = ['2025', '2024', '2023', '2022', '2021', '2020'];

const SubmissionPage = () => {
  const { user, decrementSubmissions, refreshUser } = useUser();
  const { createSubmission } = useSubmissions();
  const { uploadFile, uploading } = useFileUpload();
  
  // Derived state from user object
  const submissionsRemaining = user?.submissionsLeft || 0;
  const isUnlimited = user?.plan !== 'free';
  const userId = user?.email || 'guest';
  
  const [subject, setSubject] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [year, setYear] = useState('');
  const [paperCode, setPaperCode] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Dropdown states
  const [isSubjectOpen, setIsSubjectOpen] = useState(false);
  const [isYearOpen, setIsYearOpen] = useState(false);

  // FR-SUB 04: Premium users have unlimited submissions
  const hasCredits = isUnlimited || submissionsRemaining > 0;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) return;
    
    setIsSubmitting(true);
    setError('');

    try {
      // 1. Upload file to Supabase Storage
      const { url, error: uploadError } = await uploadFile(file);
      
      if (uploadError || !url) {
        setError(uploadError || 'Failed to upload file');
        setIsSubmitting(false);
        return;
      }

      // 2. Create submission record in database
      const finalSubject = subject === 'Other' ? customSubject : subject;
      const { success, error: createError } = await createSubmission({
        paper_type: finalSubject,
        question_number: paperCode,
        file_url: url,
        file_name: file.name,
      });

      if (!success) {
        setError(createError || 'Failed to save submission');
        setIsSubmitting(false);
        return;
      }

      // 3. Success!
      decrementSubmissions();
      refreshUser(); // Refresh dashboard stats
      setIsSubmitted(true);
      // Reset form
      setSubject('');
      setCustomSubject('');
      setYear('');
      setPaperCode('');
      setFile(null);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    }
    
    setIsSubmitting(false);
  };

  const isFormValid = (subject === 'Other' ? customSubject : subject) && year && paperCode && file;

  if (isSubmitted) {
    return (
      <div className="max-w-xl mx-auto text-center py-12">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Submission Received!</h2>
        <p className="text-gray-500 mb-8">
          Your answer copy has been successfully uploaded and sent for evaluation. 
          You will be notified once the review is complete.
        </p>
        <button 
          onClick={() => setIsSubmitted(false)}
          className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
        >
          Submit Another Copy
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">New Submission</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Upload your answer copy for expert evaluation</p>
      </div>

      {/* FR-SUB 05: Mock Upgrade Prompt for Free users limit */}
      {!hasCredits && (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/40 dark:to-purple-900/40 border border-indigo-100 dark:border-indigo-800 rounded-xl p-6 flex items-start gap-4 mb-8 relative overflow-hidden">
          <div className="p-3 bg-white dark:bg-gray-950 rounded-lg shadow-sm z-10">
            <Crown className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="z-10 flex-1">
            <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-100">Limit Reached</h3>
            <p className="text-indigo-700 dark:text-indigo-200 mt-1 leading-relaxed">
              You've reached your plan's submission limit. Upgrade to Premium for <strong>unlimited submissions</strong> and priority evaluation.
            </p>
            <Link 
              to="/pricing" 
              className="inline-flex items-center gap-2 mt-4 bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Upgrade to Premium
            </Link>
          </div>
          {/* Decorative Background */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        </div>
      )}

      <form onSubmit={handleSubmit} className={`space-y-6 ${!hasCredits ? 'opacity-50 pointer-events-none filter blur-sm select-none' : ''}`}>
        {/* Metadata Form */}
        <div className="bg-white dark:bg-gray-950 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Submission Details</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            {/* Subject Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsSubjectOpen(!isSubjectOpen)}
                  onBlur={() => setTimeout(() => setIsSubjectOpen(false), 200)}
                  className="w-full px-4 py-3 text-left rounded-lg border border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all flex items-center justify-between"
                >
                  <span className={!subject ? 'text-gray-500 dark:text-gray-400' : ''}>{subject || 'Select Subject'}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isSubjectOpen ? 'rotate-180' : ''}`} />
                </button>
                
                <div className={`absolute left-0 w-full mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg z-20 overflow-hidden max-h-60 overflow-y-auto custom-scrollbar transition-all duration-200 origin-top ${isSubjectOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                   {subjects.map((sub) => (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => {
                        setSubject(sub);
                        setIsSubjectOpen(false);
                      }}
                       className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                        subject === sub 
                          ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Custom Subject Input */}
            {subject === 'Other' && (
              <div className="animate-fade-in relative z-0">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Custom Subject Name</label>
                <input
                  type="text"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  required
                  placeholder="Enter subject name"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
            )}

            {/* Year Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Year</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsYearOpen(!isYearOpen)}
                  onBlur={() => setTimeout(() => setIsYearOpen(false), 200)}
                  className="w-full px-4 py-3 text-left rounded-lg border border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all flex items-center justify-between"
                >
                  <span className={!year ? 'text-gray-500 dark:text-gray-400' : ''}>{year || 'Select Year'}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isYearOpen ? 'rotate-180' : ''}`} />
                </button>
                
                 <div className={`absolute left-0 w-full mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg z-20 overflow-hidden max-h-60 overflow-y-auto custom-scrollbar transition-all duration-200 origin-top ${isYearOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                   {years.map((yr) => (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => {
                        setYear(yr);
                        setIsYearOpen(false);
                      }}
                       className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                        year === yr 
                          ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      {yr}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Paper Code */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Paper Code</label>
              <input
                type="text"
                value={paperCode}
                onChange={(e) => setPaperCode(e.target.value.slice(0, 10))}
                required
                maxLength={10}
                placeholder="e.g., GS1-2024-01"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
              <p className="text-xs text-gray-400 mt-1">Max 10 characters</p>
            </div>
          </div>
        </div>

        {/* Upload Zone */}
        <div className="bg-white dark:bg-gray-950 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Upload File</h2>
          
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer ${
              isDragging 
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' 
                : file 
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/30' 
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
          >
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <FileUp className={`w-16 h-16 mx-auto mb-4 ${
                file ? 'text-green-500' : 'text-gray-400'
              }`} />
              
              {file ? (
                <>
                  <p className="text-lg font-medium text-green-700">{file.name}</p>
                  <p className="text-sm text-green-600 mt-1">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                  <p className="text-sm text-gray-500 mt-3">Click to change file</p>
                </>
              ) : (
                <>
                  <p className="text-lg font-medium text-gray-700 dark:text-gray-200">Drag PDF here</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">or click to browse</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">Max 20MB</p>
                </>
              )}
            </label>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!hasCredits || !isFormValid || isSubmitting || uploading}
          className={`w-full py-4 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 ${
            hasCredits && isFormValid && !isSubmitting && !uploading
              ? 'bg-indigo-600 hover:bg-indigo-700 cursor-pointer shadow-lg shadow-indigo-200'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          {isSubmitting || uploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {uploading ? 'Uploading PDF...' : 'Saving submission...'}
            </>
          ) : hasCredits ? (
            'Submit for Evaluation'
          ) : (
            'Upgrade to Continue'
          )}
        </button>

        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
             {isUnlimited ? (
                <span className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium">
                  <Crown className="w-4 h-4" /> Premium Plan Active (Unlimited Submissions)
                </span>
             ) : (
               <>
                 You have <span className={`font-semibold ${hasCredits ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {submissionsRemaining}
                </span> submission(s) remaining
               </>
             )}
          </p>
        </div>
      </form>
    </div>
  );
};

export default SubmissionPage;
