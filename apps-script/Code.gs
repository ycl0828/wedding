/**
 * 청첩장 참석 여부 → 구글 시트 저장
 * 구글 시트 > 확장 프로그램 > Apps Script 에 이 코드를 붙여넣고
 * "배포 > 새 배포 > 웹 앱" (액세스 권한: 모든 사용자) 으로 배포하세요.
 */
const SHEET_NAME = "참석여부";
const HEADERS = ["접수시각", "구분", "참석여부", "식사여부", "인원", "성함", "동행인", "전달사항"];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {
    const p = (e && e.parameter) || {};
    if (p.website) return out({ ok: true }); // 스팸 봇 차단

    const sheet = getSheet_();
    const clean = (v, n) => String(v || "").replace(/^[=+\-@]/, "'$&").slice(0, n || 200);
    sheet.appendRow([
      new Date(),
      clean(p.side, 10),
      clean(p.attend, 10),
      clean(p.meal, 10),
      clean(p.count, 5),
      clean(p.name, 30),
      clean(p.companion, 60),
      clean(p.message, 500),
    ]);
    return out({ ok: true });
  } catch (err) {
    return out({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return out({ ok: true, message: "RSVP endpoint is running" });
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold").setBackground("#f3e6e4");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function out(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
