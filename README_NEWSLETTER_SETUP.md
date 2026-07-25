# Newsletter Popup Setup Guide

## Overview
This implementation includes a beautiful newsletter popup that appears every 30 seconds until the user subscribes. Once subscribed, the popup stops appearing and the data is saved to Google Sheets.

## Features
- ✨ Beautiful animated popup with gradient design
- ⏰ Appears every 30 seconds until subscription
- 💾 Saves data to Google Sheets
- 🔒 Remembers subscription status in localStorage
- 📱 Fully responsive design
- 🌙 Dark mode support
- ✅ Form validation
- 🎯 Success state with confirmation

## Google Sheets Setup

### Step 1: Create a Google Sheet
1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "Newsletter Subscriptions" or similar
4. Note the Sheet ID from the URL: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit`

### Step 2: Create Google Apps Script
1. Go to [Google Apps Script](https://script.google.com)
2. Create a new project
3. Replace the default code with the content from `public/google-apps-script.js`
4. Replace `YOUR_GOOGLE_SHEET_ID_HERE` with your actual Sheet ID
5. Save the project

### Step 3: Deploy as Web App
1. Click "Deploy" > "New deployment"
2. Choose "Web app" as the type
3. Set execute as "Me"
4. Set access to "Anyone"
5. Click "Deploy"
6. Copy the Web App URL

### Step 4: Configure Environment Variables
1. Copy `.env.example` to `.env`
2. Replace `YOUR_SCRIPT_ID` with your actual Google Apps Script deployment URL
3. The URL format should be: `https://script.google.com/macros/s/SCRIPT_ID/exec`

## Usage

The popup system is automatically initialized when the app loads. It will:

1. Check if the user has already subscribed (stored in localStorage)
2. If not subscribed, show the popup after 30 seconds
3. Continue showing every 30 seconds until subscription
4. Save subscription data to Google Sheets
5. Stop showing popup once subscribed

## Customization

### Popup Timing
Edit the `POPUP_INTERVAL` constant in `src/hooks/useNewsletterPopup.ts`:
```typescript
const POPUP_INTERVAL = 30000; // 30 seconds (in milliseconds)
```

### Popup Content
Modify the content in `src/components/NewsletterPopup.tsx`:
- Change the title, description, and benefits
- Update the styling and colors
- Modify the form fields

### Google Sheets Columns
The default columns are:
- Timestamp
- Name  
- Email
- Source

You can modify these in the Google Apps Script code.

## Testing

1. Clear localStorage: `localStorage.removeItem('newsletter_subscribed')`
2. Refresh the page
3. Wait 30 seconds for the popup to appear
4. Test the form submission
5. Check your Google Sheet for the new entry

## Troubleshooting

### Popup Not Appearing
- Check browser console for errors
- Verify localStorage is cleared
- Ensure the component is properly imported in App.tsx

### Google Sheets Not Working
- Verify the Google Apps Script is deployed as a web app
- Check that the Sheet ID is correct
- Ensure the script has proper permissions
- Check the browser network tab for failed requests

### CORS Issues
- Google Apps Script requires `mode: 'no-cors'`
- This means you can't read the response, but the data should still be saved
- Consider using a backend proxy for better error handling

## Security Notes

- The Google Apps Script URL is public but only accepts POST requests
- No sensitive data should be stored in the frontend
- Consider adding rate limiting in the Google Apps Script
- Validate email addresses on both frontend and backend

## Browser Support

- Modern browsers with localStorage support
- Framer Motion animations require modern browsers
- Graceful degradation for older browsers