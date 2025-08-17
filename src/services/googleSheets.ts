// Google Sheets integration service
export interface SubscriptionData {
  name: string;
  email: string;
  timestamp: string;
  source: string;
  ipAddress?: string;
  userAgent?: string;
}

export const submitToGoogleSheets = async (data: SubscriptionData): Promise<boolean> => {
  try {
    // Get the Google Apps Script Web App URL from environment variables
    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzicAhGcLdLAbStA0PcevOZllqmZtlJKJoHs8LRkxnO-_PiLk1-lGdJccIp0Cys-hMuXg/exec";
    
    if (!GOOGLE_SCRIPT_URL) {
      console.error('Google Script URL not configured');
      throw new Error('Google Script URL not configured. Please set VITE_GOOGLE_SCRIPT_URL in your .env file');
    }

    // Add additional data
    const enrichedData = {
      ...data,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    };

    console.log('Submitting to Google Sheets:', enrichedData);

    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors', // Required for Google Apps Script
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(enrichedData),
    });

    // Note: With no-cors mode, we can't read the response
    // We assume success if no error is thrown
    console.log('Successfully submitted to Google Sheets');
    return true;
  } catch (error) {
    console.error('Google Sheets submission error:', error);
    throw new Error('Failed to submit to Google Sheets: ' + (error as Error).message);
  }
};

// Alternative method with better error handling (requires CORS-enabled endpoint)
export const submitToGoogleSheetsWithResponse = async (data: SubscriptionData): Promise<any> => {
  try {
    const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;
    
    if (!GOOGLE_SCRIPT_URL) {
      throw new Error('Google Script URL not configured');
    }

    const enrichedData = {
      ...data,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    };

    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(enrichedData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Submission failed');
    }

    return result;
  } catch (error) {
    console.error('Google Sheets submission error:', error);
    throw error;
  }
};

// Validate email format
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Get user's IP address (optional)
export const getUserIP = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Failed to get IP address:', error);
    return 'Unknown';
  }
};
