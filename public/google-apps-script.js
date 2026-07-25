// Code.gs
const SPREADSHEET_ID = '1xd9Ml3qzK9EmOXyrBhHJOablLQCybCK_ElH6R85AXds'; // ID của file Google Sheet
const MAP_SHEETS = {
  newsletter: 'newsletter',
  survey: 'survey',
};

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const sheetName = MAP_SHEETS[body.sheet] || body.sheet;
    const data = body.data || {};

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sh = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);

    // Tự ánh xạ các keys của object thành 1 hàng (append)
    // Lấy header (hàng 1) để giữ thứ tự cột ổn định
    const header = sh.getRange(1,1,1,sh.getLastColumn() || 1).getValues()[0].filter(Boolean);
    const keys = Object.keys(data);
    const allKeys = Array.from(new Set([...header, ...keys]));

    if (header.length !== allKeys.length) {
      // cập nhật header nếu có key mới
      sh.getRange(1,1,1,allKeys.length).setValues([allKeys]);
    }

    const row = allKeys.map(k => data[k] ?? '');
    sh.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, sheet: sheetName }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
