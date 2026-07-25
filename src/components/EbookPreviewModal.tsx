import React from 'react';
import { X, Mail, Lock, AlertCircle, CheckCircle, Loader2, ArrowRight } from 'lucide-react';
import { Ebook, PreviewChapter } from '../data/ebooks';
import { useEmailCapture } from './useEmailCapture';

interface PreviewModalProps {
  ebook: Ebook;
  chapter: PreviewChapter;
  isOpen: boolean;
  onClose: () => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  ebook,
  chapter,
  isOpen,
  onClose,
}) => {
  const {
    email,
    status,
    errorMessage,
    setEmail,
    submitEmail,
    reset,
  } = useEmailCapture();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitEmail(ebook.id, chapter.chapterNumber);
  };

  const renderContent = () => {
    if (status === 'success') {
      return (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            You're in! 🎉
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Check your email for the full chapter access link.
            We've also added you to our newsletter for AI tips and new release updates.
          </p>
          <button
            onClick={() => { reset(); onClose(); }}
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
          >
            Close & Read
          </button>
        </div>
      );
    }

    return (
      <>
        {/* Preview Content */}
        <div className="prose prose-gray dark:prose-invert max-w-none mb-6">
          <div
            className="preview-content"
            dangerouslySetInnerHTML={{ __html: chapter.content }}
          />
        </div>

        {/* Teaser for remaining content */}
        <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-6 border border-primary-100 dark:border-primary-800 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <Lock className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <h4 className="font-semibold text-gray-900 dark:text-white">
              Chapter continues...
            </h4>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
            This preview covers approximately {chapter.wordCount.toLocaleString()} words of the full chapter.
            The complete chapter includes additional sections, practical exercises, and downloadable resources.
          </p>
          <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1 pl-4">
            <li>• 3 additional sections with advanced techniques</li>
            <li>• 5 hands-on exercises with solutions</li>
            <li>• Curated prompt library (12 ready-to-use prompts)</li>
            <li>• Bonus: Tool comparison spreadsheet</li>
          </ul>
        </div>

        {/* Email Capture Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-center">
            <Mail className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
              Unlock the full chapter FREE
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email to get instant access to the complete Chapter {chapter.chapterNumber}
              plus our weekly AI tools newsletter
            </p>
          </div>

          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              disabled={status === 'submitting'}
              className="w-full px-4 py-3 pr-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              autoComplete="email"
              required
            />
            {status === 'submitting' && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-500 animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
            )}
            {status === 'error' && (
              <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
            )}
          </div>

          {errorMessage && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={status === 'submitting' || status === 'success'}
            className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <span>{status === 'submitting' ? 'Sending...' : status === 'success' ? 'Sent!' : 'Get Full Chapter Free'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            No spam, unsubscribe anytime. By submitting, you agree to our{' '}
            <a href="/privacy" className="underline hover:text-primary-600">Privacy Policy</a>.
          </p>
        </form>
      </>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-3xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <img
                src={ebook.coverImage}
                alt={ebook.title}
                className="w-12 h-18 object-cover rounded"
              />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Chapter {chapter.chapterNumber}</p>
                <h3 className="font-semibold text-gray-900 dark:text-white truncate max-w-xs">
                  {chapter.title}
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              aria-label="Close preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};