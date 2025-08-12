// Google Sheets integration service
export interface SubscriptionData {
  name: string;
  email: string;
  timestamp: string;
  source: string;
}

export const submitToGoogleSheets = async (data: SubscriptionData): Promise<boolean> => {
  try {
    // Replace with your Google Apps Script Web App URL
    const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbzicAhGcLdLAbStA0PcevOZllqmZtlJKJoHs8LRkxnO-_PiLk1-lGdJccIp0Cys-hMuXg/exec';
    
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors', // Required for Google Apps Script
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    // Note: With no-cors mode, we can't read the response
    // We assume success if no error is thrown
    return true;
  } catch (error) {
    console.error('Google Sheets submission error:', error);
    throw new Error('Failed to submit to Google Sheets');
  }
};

// Alternative method using a proxy endpoint
export const submitViaProxy = async (data: SubscriptionData): Promise<boolean> => {
  try {
    const response = await fetch('/api/google-sheets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Proxy submission error:', error);
    throw error;
  }
};
