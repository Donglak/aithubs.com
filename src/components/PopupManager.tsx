import React from 'react';
import NewsletterPopup from './NewsletterPopup';
import { useNewsletterPopup } from '../hooks/useNewsletterPopup';
import { submitToGoogleSheets } from '../services/googleSheets';

const PopupManager: React.FC = () => {
  const { isPopupOpen, closePopup, handleSubscribe } = useNewsletterPopup();

  const onSubscribe = async (email: string, name: string) => {
    try {
      // Submit to Google Sheets
      await submitToGoogleSheets({
        name,
        email,
        timestamp: new Date().toISOString(),
        source: 'newsletter_popup'
      });

      // Handle subscription in the hook
      await handleSubscribe(email, name);
    } catch (error) {
      console.error('Subscription failed:', error);
      throw error;
    }
  };

  return (
    <NewsletterPopup
      isOpen={isPopupOpen}
      onClose={closePopup}
      onSubscribe={onSubscribe}
    />
  );
};

export default PopupManager;