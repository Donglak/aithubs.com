import React from 'react';
import { useNewsletterPopup } from '../hooks/useNewsletterPopup';
import NewsletterPopup from './NewsletterPopup';
const PopupManager: React.FC = () => {
  const { isPopupOpen, closePopup, handleSubscribe } = useNewsletterPopup();

  const onSubscribe = async (email: string, name: string) => {
    try {
           
      // Handle subscription in the hook
      await handleSubscribe();
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