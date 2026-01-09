import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, FileText } from 'lucide-react';


interface NotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (notes: string) => void;
  initialNotes: string;
  title?: string;
  subtitle?: string;
  placeholder?: string;
  maxWords?: number;
}

const NotesModal: React.FC<NotesModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialNotes,
  title = "Call Notes",
  subtitle = "Private notes for your reference",
  placeholder = "Write your takeaways, action items, and key points from the call here...",
  maxWords = 1500
}) => {
  const [notes, setNotes] = useState(initialNotes);

  useEffect(() => {
    // console.log('NotesModal received initialNotes:', initialNotes);
    setNotes(initialNotes);
  }, [initialNotes, isOpen]);

  if (!isOpen) return null;

  // ReactQuill Modules Configuration
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
      ['link'],
      ['clean']
    ],
  };



  // Helper to strip HTML for word count
  const getWordCount = (html: string) => {
    const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return text.length === 0 ? 0 : text.split(" ").length;
  };

  const wordCount = getWordCount(notes);
  const isOverLimit = wordCount > maxWords;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col"
        style={{ maxHeight: 'calc(100vh - 4rem)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full text-indigo-600 dark:text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {subtitle}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={placeholder}
            className="w-full h-64 sm:h-96 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none leading-relaxed custom-scrollbar"
          />
          <div className={`mt-2 text-right text-sm font-medium ${isOverLimit ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
            {wordCount} / {maxWords} words
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (!isOverLimit) {
                onSave(notes);
                onClose();
              }
            }}
            disabled={isOverLimit}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-lg shadow-indigo-200 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            Save Notes
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default NotesModal;
