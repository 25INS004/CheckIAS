import React, { useState, useEffect } from 'react';
import { FileText, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const TosPage: React.FC = () => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load the TOS markdown file
    fetch('/readme/tos.md')
      .then((res) => res.text())
      .then((text) => {
        setContent(text);
        setLoading(false);
      })
      .catch(() => {
        setContent('Failed to load Terms of Service.');
        setLoading(false);
      });
  }, []);

  // Simple markdown parser for headings and paragraphs
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
      if (trimmed.startsWith('TERMS OF SERVICE')) {
        flushParagraph();
        elements.push(
          <h1 key={idx} className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Terms of Service
          </h1>
        );
        return;
      }

      // Last Updated
      if (trimmed.startsWith('Last Updated:')) {
        flushParagraph();
        elements.push(
          <p key={idx} className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            {trimmed}
          </p>
        );
        return;
      }

      // Section headers (e.g., "1. AGREEMENT TO TERMS")
      if (/^\d+\.\s+[A-Z]/.test(trimmed)) {
        flushParagraph();
        elements.push(
          <h2 key={idx} className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
            {trimmed}
          </h2>
        );
        return;
      }

      // Subsection headers (e.g., "1.1. Acceptance:")
      if (/^\d+\.\d+\.\s/.test(trimmed)) {
        flushParagraph();
        const [number, ...rest] = trimmed.split(':');
        elements.push(
          <div key={idx} className="mb-4">
            <span className="font-semibold text-gray-800 dark:text-gray-200">{number}:</span>
            <span className="text-gray-600 dark:text-gray-300">{rest.join(':')}</span>
          </div>
        );
        return;
      }

      // Bullet points
      if (trimmed.startsWith('Plan ') || trimmed.startsWith('Format:') || trimmed.startsWith('Size Limit:') || trimmed.startsWith('Metadata:')) {
        flushParagraph();
        elements.push(
          <li key={idx} className="text-gray-600 dark:text-gray-300 ml-6 mb-2 list-disc">
            {trimmed}
          </li>
        );
        return;
      }

      // Regular paragraph content
      currentParagraph.push(trimmed);
    });

    flushParagraph();
    return elements;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black font-sans transition-colors duration-200">
      {/* Header */}
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

      {/* Content */}
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

      {/* Footer */}
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

export default TosPage;
