// Google Apps Script code to deploy as a Web App
// This should be deployed in Google Apps Script and the URL should be added to your environment variables

function doPost(e) {
  try {
    // Parse the request data
    const data = JSON.parse(e.postData.contents);
    
    // Open the Google Sheet (replace with your sheet ID)
    const SHEET_ID = '1yo39qlG02_yKby5is8LcFadZMNAZ-eyZQavIC37ki7M';
    const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
    
    // Add headers if this is the first row
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Timestamp', 'Name', 'Email', 'Source']);
    }
    
    // Add the new subscription data
    sheet.appendRow([
      data.timestamp,
      data.name,
      data.email,
      data.source
    ]);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: 'Subscription recorded' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle GET requests (optional)
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ message: 'Newsletter subscription endpoint' }))
    .setMimeType(ContentService.MimeType.JSON);
}
