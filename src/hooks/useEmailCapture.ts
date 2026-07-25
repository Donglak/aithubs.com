import { useState, useCallback } from 'react';

interface EmailCaptureState {
  email: string;
  status: 'idle' | 'submitting' | 'success' | 'error';
  errorMessage?: string;
}

export function useEmailCapture() {
  const [state, setState] = useState<EmailCaptureState>({
    email: '',
    status: 'idle',
  });

  // Simulate API call - replace with actual Supabase edge function
  const submitEmail = useCallback(async (ebookId: number, chapterNumber: number) => {
    if (!state.email || !state.email.includes('@')) {
      setState(prev => ({ ...prev, status: 'error', errorMessage: 'Please enter a valid email' }));
      return false;
    }

    setState(prev => ({ ...prev, status: 'submitting' }));

    try {
      // In production, call your backend API here
      // const response = await fetch('/api/capture-lead', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email: state.email, ebookId, chapterNumber, source: 'ebook_preview' })
      // });

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Store in localStorage for demo
      const captured = JSON.parse(localStorage.getItem('captured_emails') || '[]');
      captured.push({ email: state.email, ebookId, chapterNumber, timestamp: Date.now() });
      localStorage.setItem('captured_emails', JSON.stringify(captured));

      setState(prev => ({ ...prev, status: 'success', email: '' }));
      return true;
    } catch (error) {
      setState(prev => ({ ...prev, status: 'error', errorMessage: 'Failed to submit. Please try again.' }));
      return false;
    }
  }, [state.email]);

  const reset = useCallback(() => {
    setState({ email: '', status: 'idle' });
  }, []);

  return {
    ...state,
    setEmail: (email: string) => setState(prev => ({ ...prev, email, status: 'idle' })),
    submitEmail,
    reset,
  };
}