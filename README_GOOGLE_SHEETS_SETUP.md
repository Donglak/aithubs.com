# Google Sheets Newsletter Integration Setup Guide

## Overview
The newsletter system has been integrated with Google Sheets to automatically store email subscriptions. When users enter their email and click subscribe, the information is automatically saved to Google Sheets.

## Features
- ✨ Beautiful subscription forms with validation
- 💾 Save data to Google Sheets
- 🔒 Error handling and success notifications
- 📱 Responsive design
- 🌙 Dark mode support
- ✅ Email validation
- 🎯 Subscription source tracking

## Google Sheets Setup

### Step 1: Create Google Sheet
1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "Newsletter Subscriptions" or similar
4. Note the Sheet ID from URL: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit`

### Step 2: Create Google Apps Script
1. Go to [Google Apps Script](https://script.google.com)
2. Create a new project
3. Replace default code with content from `public/google-apps-script.js`
4. Replace `YOUR_GOOGLE_SHEET_ID_HERE` with your actual Sheet ID
5. Save the project

### Step 3: Deploy Web App
1. Click "Deploy" > "New deployment"
2. Choose "Web app" as type
3. Set execute as "Me"
4. Set access to "Anyone"
5. Click "Deploy"
6. Copy the Web App URL

### Step 4: Configure Environment Variables
1. Create `.env` file from `.env.example`
2. Replace `YOUR_SCRIPT_ID` with your actual Google Apps Script deployment URL
3. URL format: `https://script.google.com/macros/s/SCRIPT_ID/exec`

## Data Structure

The Google Sheet will have these columns:
- **Timestamp**: Subscription time
- **Name**: Subscriber name (if provided)
- **Email**: Email address
- **Source**: Subscription source (footer_newsletter, newsletter_popup, etc.)
- **IP Address**: IP address (optional)
- **User Agent**: Browser information

## Usage

### Newsletter Form in Footer
- User enters email and clicks "Subscribe"
- System validates email
- Sends data to Google Sheets
- Shows success notification

### Newsletter Popup
- Popup appears after 30 seconds
- Requires both name and email
- Saves to Google Sheets with source "newsletter_popup"
- Doesn't show again after successful subscription

### Newsletter Form Component
- Reusable component
- Customizable source for tracking
- Automatic validation
- Error handling

## Customization

### Change popup timing
Edit `POPUP_INTERVAL` in `src/hooks/useNewsletterPopup.ts`:
```typescript
const POPUP_INTERVAL = 30000; // 30 seconds
```

### Add new fields
1. Update `SubscriptionData` interface in `src/services/googleSheets.ts`
2. Add new columns in Google Apps Script
3. Update form components

### Change validation
Edit `validateEmail` function in `src/services/googleSheets.ts`

## Testing

1. Clear localStorage: `localStorage.removeItem('newsletter_subscribed')`
2. Refresh page
3. Test subscription form
4. Check Google Sheet for new data

## Troubleshooting

### Form not submitting
- Check browser console for errors
- Verify Google Apps Script URL in .env
- Ensure Google Apps Script is properly deployed

### Google Sheets not receiving data
- Check Sheet ID in Google Apps Script
- Verify script permissions
- Check network tab in browser

### CORS Issues
- Google Apps Script requires `mode: 'no-cors'`
- Can't read response but data is still saved
- Consider using proxy endpoint for better response handling

## Security

- Google Apps Script URL is public but only accepts POST requests
- Don't store sensitive data in frontend
- Consider adding rate limiting in Google Apps Script
- Validate email on both frontend and backend

## Browser Support

- Modern browsers with localStorage support
- Framer Motion animations require modern browsers
- Graceful degradation for older browsers