import React, { useState, useEffect } from 'react';
import { FileText, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyPage: React.FC = () => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/readme/privacy.md')
      .then((res) => res.text())
      .then((text) => {
        setContent(text);
        setLoading(false);
      })
      .catch(() => {
        setContent('Failed to load Privacy Policy.');
        setLoading(false);
      });
  }, []);

  const renderContent = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let currentParagraph: string[] = [];

    const flushParagraph = () => {
      if (currentParagraph.length > 0) {
        elements.push(
          <p key={elements.length} className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            {currentParagraph.join(' ')}
          </p>
        );
        currentParagraph = [];
      }
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      
      if (trimmed === '') {
        flushParagraph();
        return;
      }

      // Main title
      if (trimmed.startsWith('PRIVACY POLICY') || trimmed.startsWith('# ')) {
        flushParagraph();
        elements.push(
          <h1 key={idx} className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Privacy Policy
          </h1>
        );
        return;
      }

      // Last Updated
      if (trimmed.startsWith('Last Updated:') || trimmed.startsWith('Effective Date:')) {
        flushParagraph();
        elements.push(
          <p key={idx} className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            {trimmed}
          </p>
        );
        return;
      }

      // Section headers
      if (/^\d+\.\s+[A-Z]/.test(trimmed) || trimmed.startsWith('## ')) {
        flushParagraph();
        elements.push(
          <h2 key={idx} className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
            {trimmed.replace(/^##\s*/, '')}
          </h2>
        );
        return;
      }

      // Subsection headers
      if (/^\d+\.\d+\.?\s/.test(trimmed) || trimmed.startsWith('### ')) {
        flushParagraph();
        const content = trimmed.replace(/^###\s*/, '');
        elements.push(
          <h3 key={idx} className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
            {content}
          </h3>
        );
        return;
      }

      // Bullet points
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        flushParagraph();
        elements.push(
          <li key={idx} className="text-gray-600 dark:text-gray-300 ml-6 mb-2 list-disc">
            {trimmed.substring(2)}
          </li>
        );
        return;
      }

      currentParagraph.push(trimmed);
    });

    flushParagraph();
    return elements;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black font-sans transition-colors duration-200">
      <header className="border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Home</span>
            </Link>
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <FileText className="w-5 h-5" />
              <span className="font-bold">Legal</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-8 sm:p-12">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="prose dark:prose-invert max-w-none">
              {renderContent(content)}
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-gray-100 dark:border-gray-800 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} CheckIAS. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPage;
