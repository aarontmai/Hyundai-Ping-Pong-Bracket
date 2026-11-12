/**
 * Hyundai Ping Pong Bracket – Google Sheets backend.
 *
 * Setup:
 *   1. In your Google Sheet: Extensions → Apps Script, paste this file, set ADMIN_PASSCODE below.
 *   2. Deploy → New deployment → type "Web app"
 *        Execute as: Me    Who has access: Anyone
 *   3. Authorize, then copy the Web app URL into SHEET_API in index.html.
 *
 * The "Bracket" tab holds the 16 team names (column B, editable right in the sheet)
 * and the match results as JSON in cell E2 (managed by the page – don't edit by hand).
 * The passcode lives only in this script, which bracket viewers can't see.
 */
const ADMIN_PASSCODE = 'CHANGE-ME';
const N = 16;

function sheet_() {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName('Bracket');
  if (!sh) {
    sh = ss.insertSheet('Bracket');
    sh.getRange('A1:B1').setValues([['Slot', 'Team name']]).setFontWeight('bold');
    sh.getRange(2, 1, N, 1).setValues(Array.from({ length: N }, (_, i) => [i + 1]));
    sh.getRange('E1').setValue('Results (managed by the bracket page)').setFontWeight('bold');
    sh.getRange('E2').setValue('{}');
    sh.setColumnWidth(2, 220);
  }
  return sh;
}

function read_() {
  const sh = sheet_();
  const teams = sh.getRange(2, 2, N, 1).getValues().map(r => String(r[0] || ''));
  let w = {};
  try { w = JSON.parse(sh.getRange('E2').getValue() || '{}'); } catch (e) {}
  return { teams, w };
}

function out_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return out_(read_());
}

function doPost(e) {
  let body = {};
  try { body = JSON.parse(e.postData.contents); } catch (err) { return out_({ ok: false }); }
  if (body.pin !== ADMIN_PASSCODE) return out_({ ok: false });
  if (body.check) return out_({ ok: true });

  const data = body.data || {};
  const teams = (Array.isArray(data.teams) ? data.teams : []).slice(0, N);
  while (teams.length < N) teams.push('');

  const lock = LockService.getScriptLock();
  lock.waitLock(5000);
  try {
    const sh = sheet_();
    sh.getRange(2, 2, N, 1).setValues(teams.map(t => [String(t).slice(0, 40)]));
    sh.getRange('E2').setValue(JSON.stringify(data.w || {}));
  } finally {
    lock.releaseLock();
  }
  return out_({ ok: true });
}
