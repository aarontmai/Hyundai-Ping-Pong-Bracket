/**
 * Hyundai Ping Pong Bracket – Google Sheets backend.
 *
 * Setup / update:
 *   1. In your Google Sheet: Extensions → Apps Script, paste this file, set ADMIN_PASSCODE below, Save.
 *   2. First time: Deploy → New deployment → Web app (Execute as: Me, Who has access: Anyone).
 *      Updating:   Deploy → Manage deployments → pencil → Version: New version → Deploy (URL stays the same).
 *
 * The "Bracket" tab holds the 16 team names (column B – anyone can edit them from the page,
 * or you can edit them right in the sheet). Match results live as JSON in cell E2 and can
 * only be changed with the admin passcode, which viewers never see.
 */
const ADMIN_PASSCODE = 'CHANGE-ME';
const N = 16;
const MAX_NAME = 40;

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

function withLock_(fn) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try { return fn(); } finally { lock.releaseLock(); }
}

function doGet() {
  return out_(read_());
}

function doPost(e) {
  let body = {};
  try { body = JSON.parse(e.postData.contents); } catch (err) { return out_({ ok: false }); }
  const isAdmin = body.pin === ADMIN_PASSCODE;

  // Passcode check for the Admin button
  if (body.check) return out_({ ok: isAdmin });

  // Anyone: set one team name
  if (body.action === 'name') {
    const slot = Number(body.slot);
    if (!(slot >= 1 && slot <= N)) return out_({ ok: false });
    // Leading = + - @ would make the sheet treat the name as a formula, so neutralise it
    let name = String(body.name || '').slice(0, MAX_NAME);
    if (/^[=+\-@]/.test(name)) name = "'" + name;
    withLock_(() => sheet_().getRange(slot + 1, 2).setValue(name));
    return out_({ ok: true });
  }

  if (!isAdmin) return out_({ ok: false });

  // Admin: save who advanced
  if (body.action === 'results') {
    withLock_(() => sheet_().getRange('E2').setValue(JSON.stringify(body.w || {})));
    return out_({ ok: true });
  }

  // Admin: wipe names and results
  if (body.action === 'clear') {
    withLock_(() => {
      const sh = sheet_();
      sh.getRange(2, 2, N, 1).clearContent();
      sh.getRange('E2').setValue('{}');
    });
    return out_({ ok: true });
  }

  return out_({ ok: false });
}
