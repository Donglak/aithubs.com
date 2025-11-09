import { AlertCircle, CheckCircle, Mail } from 'lucide-react';
import React, { useState } from 'react';
import { submitNewsletterToSheet, validateEmail } from '../services/googleSheets';

interface NewsletterFormProps {
  className?: string;
  source?: string;
}

const NewsletterForm: React.FC<NewsletterFormProps> = ({ 
  className = '', 
  source = 'newsletter_form' 
}) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset states
    setError('');
    
    // Validate email
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!validateEmail(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit to Google Sheets
      await submitNewsletterToSheet({
        name: '', // No name field in this form
        email: email.trim(),
        timestamp: new Date().toISOString(),
        source: source
      });

      // Show success state
      setIsSuccess(true);
      setEmail('');
      
      // Reset success state after 5 seconds
      setTimeout(() => {
        setIsSuccess(false);
      }, 5000);

      // Track successful subscription (optional analytics)
      if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', 'newsletter_subscribe', {
        event_category: 'engagement',
        event_label: source,
        });
}

    } catch (error) {
      console.error('Newsletter subscription failed:', error);
      setError('An error occurred while subscribing. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className={`flex items-center justify-center gap-3 text-white bg-green-500/20 backdrop-blur-sm rounded-lg p-4 ${className}`}>
        <CheckCircle className="w-6 h-6 text-green-400" />
        <div className="text-center">
          <div className="font-semibold">Thank you for subscribing!</div>
          <div className="text-sm text-white/80">We'll send you the most valuable insights to your email.</div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
        <div className="flex-1">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(''); // Clear error when user types
            }}
            placeholder="Enter your email"
            className="w-full px-6 py-4 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
            disabled={isSubmitting}
            required
          />
          {error && (
            <div className="flex items-center gap-2 text-red-200 text-sm mt-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={isSubmitting || !email.trim()}
          className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[140px]"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-primary-600/30 border-t-primary-600 rounded-full animate-spin"></div>
              Subscribing...
            </>
          ) : (
            <>
              <Mail className="w-5 h-5" />
              Subscribe
            </>
          )}
        </button>
      </div>
      
      <p className="text-white/70 text-sm text-center">
        Join 50,000+ subscribers. No spam, unsubscribe anytime.
      </p>
    </form>
  );
};

export default NewsletterForm;