#!/usr/bin/env node
/** Finish AT-01 (Đơn công) + J-MOB-05 approve for PO-E2E-SPINE-02-03-MOB-QA-W1 */
import { execSync, spawnSync } from 'node:child_process';
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const adb = process.env.LOCALAPPDATA + '\\Android\\Sdk\\platform-tools\\adb.exe';
const OUT = 'docs/qa/evidence/screens/po-e2e-spine-02-03-mob-qa-w1';
mkdirSync(OUT, { recursive: true });
const log = [];
const note = (msg, extra = {}) => {
  const row = { t: new Date().toISOString(), msg, ...extra };
  log.push(row);
  console.log(JSON.stringify(row));
};

function sh(cmd) {
  return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}
function dump(n) {
  sh(`"${adb}" shell uiautomator dump /sdcard/qa-lv.xml`);
  sh(`"${adb}" pull /sdcard/qa-lv.xml ${OUT}/${n}.xml`);
  const shot = spawnSync(adb, ['exec-out', 'screencap', '-p'], { encoding: 'buffer', maxBuffer: 25e6 });
  if (shot.stdout?.length) writeFileSync(`${OUT}/${n}.png`, shot.stdout);
  return readFileSync(`${OUT}/${n}.xml`, 'utf8');
}
function tapText(xml, t) {
  const e = t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  let m = xml.match(new RegExp(`text="${e}"[^>]*bounds="\\[(\\d+),(\\d+)\\]\\[(\\d+),(\\d+)\\]"`));
  if (!m) m = xml.match(new RegExp(`content-desc="[^"]*${e}[^"]*"[^>]*bounds="\\[(\\d+),(\\d+)\\]\\[(\\d+),(\\d+)\\]"`));
  if (!m) return null;
  const x = Math.floor((+m[1] + +m[3]) / 2);
  const y = Math.floor((+m[2] + +m[4]) / 2);
  sh(`"${adb}" shell input tap ${x} ${y}`);
  return { x, y, t };
}
function tapId(xml, id) {
  const e = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = xml.match(new RegExp(`resource-id="${e}"[^>]*bounds="\\[(\\d+),(\\d+)\\]\\[(\\d+),(\\d+)\\]"`));
  if (!m) return null;
  const x = Math.floor((+m[1] + +m[3]) / 2);
  const y = Math.floor((+m[2] + +m[4]) / 2);
  sh(`"${adb}" shell input tap ${x} ${y}`);
  return { x, y, id };
}
function texts(xml) {
  return [...xml.matchAll(/text="([^"]+)"/g)].map((m) => m[1]);
}

async function login(email, password) {
  const r = spawnSync(process.execPath, ['scripts/_tmp-po-spine-login.mjs', '--email', email, '--password', password], {
    encoding: 'utf8',
  });
  console.log(r.stdout);
  return r.status === 0;
}

// ===== AT-01 as NV =====
note('AT-01 start');
if (!(await login('uat.nv0001@xe.vn', 'xevn-uat-2026'))) {
  writeFileSync(`${OUT}/_at-mgr-finish.json`, JSON.stringify(log, null, 2));
  process.exit(2);
}
await sleep(1500);
let xml = dump('110-nv-home');
tapText(xml, 'Hồ sơ');
await sleep(2000);
xml = dump('111-profile');
note('profile texts', { texts: texts(xml).slice(0, 50) });

// Scroll profile for Đơn công / Yêu cầu
for (let i = 0; i < 4 && !xml.includes('Đơn công') && !xml.includes('Yêu cầu điều chỉnh') && !xml.includes('UpdateRequests'); i++) {
  sh(`"${adb}" shell input swipe 540 1900 540 700 350`);
  await sleep(700);
  xml = dump(`112-profile-scroll-${i}`);
}
let hit =
  tapText(xml, 'Đơn công') ||
  tapText(xml, 'Yêu cầu điều chỉnh') ||
  tapText(xml, 'Điều chỉnh chấm công') ||
  tapText(xml, 'Yêu cầu') ||
  tapText(xml, 'Đơn chỉnh sửa');
note('profile entry', { hit });

if (!hit) {
  // Try Chấm công tile from home
  tapText(xml, 'Trang chủ');
  await sleep(1200);
  xml = dump('113-home');
  hit = tapText(xml, 'Chấm công') || tapId(xml, 'home-action-tile-attendance') || tapId(xml, 'home-action-tile-check_in');
  note('attendance tile', { hit });
  await sleep(2000);
  xml = dump('114-attendance');
  note('att texts', { texts: texts(xml).slice(0, 40) });
  for (let i = 0; i < 3; i++) {
    hit = tapText(xml, 'Đơn công') || tapText(xml, 'Điều chỉnh') || tapText(xml, 'Yêu cầu');
    if (hit) break;
    sh(`"${adb}" shell input swipe 540 1800 540 700 300`);
    await sleep(600);
    xml = dump(`115-att-scroll-${i}`);
  }
  note('att entry', { hit });
}

await sleep(2000);
xml = dump('116-update-list');
note('update list', { texts: texts(xml).slice(0, 40) });

const onList =
  xml.includes('Đơn công') ||
  xml.includes('điều chỉnh') ||
  xml.includes('CreateUpdate') ||
  xml.includes('Loại điều chỉnh') ||
  xml.includes('Gửi đơn');

if (onList || xml.includes('Gửi đơn') || xml.includes('Loại điều chỉnh')) {
  if (!xml.includes('Loại điều chỉnh')) {
    hit = tapText(xml, 'Tạo') || tapText(xml, 'Thêm') || tapText(xml, '+') || tapText(xml, 'Tạo đơn');
    if (!hit) {
      // header action often top-right
      sh(`"${adb}" shell input tap 980 200`);
      note('header + fallback');
    }
    await sleep(2000);
    xml = dump('117-create-form');
  }

  note('create form', { texts: texts(xml).slice(0, 35), hasReason: xml.includes('Lý do') });

  // Fail: clear reason
  if (xml.includes('Lý do')) {
    tapText(xml, 'Lý do');
    await sleep(400);
    for (let i = 0; i < 60; i++) sh(`"${adb}" shell input keyevent 67`);
    await sleep(300);
    // change type to late-ish if field present
    if (xml.includes('Loại điều chỉnh') || texts(xml).some((t) => t.includes('adjust'))) {
      tapText(xml, 'Loại điều chỉnh');
      await sleep(300);
      for (let i = 0; i < 30; i++) sh(`"${adb}" shell input keyevent 67`);
      try {
        sh(`"${adb}" shell input text "late_arrival"`);
      } catch {
        /* ignore */
      }
    }
    xml = dump('118-empty-reason');
    tapText(xml, 'Gửi đơn');
    await sleep(1500);
    xml = dump('119-fail');
    note('AT-FAIL', {
      failUi: ['bắt buộc', 'Lỗi', 'Thiếu', 'required', 'không'].some((t) => xml.includes(t)),
      texts: texts(xml).slice(-20),
    });
    tapText(xml, 'OK') || tapText(xml, 'Đóng');
    await sleep(800);

    xml = dump('120-retry');
    tapText(xml, 'Lý do');
    await sleep(300);
    try {
      sh(`"${adb}" shell input text "Di_muon_PO_E2E_AT01"`);
    } catch {
      /* ignore */
    }
    await sleep(400);
    // ensure type
    tapText(xml, 'Loại điều chỉnh');
    await sleep(200);
    for (let i = 0; i < 30; i++) sh(`"${adb}" shell input keyevent 67`);
    try {
      sh(`"${adb}" shell input text "late_arrival"`);
    } catch {
      /* ignore */
    }
    xml = dump('121-filled');
    hit = tapText(xml, 'Gửi đơn');
    note('AT submit', { hit });
    await sleep(2500);
    xml = dump('122-at-after');
    note('AT-01', {
      ok: ['Thành công', 'HRM-', 'Đã gửi'].some((t) => xml.includes(t)),
      texts: texts(xml).slice(-20),
    });
    tapText(xml, 'OK') || tapText(xml, 'Đóng');
  } else {
    note('AT-01', { blocked: true, reason: 'form_fields_missing', texts: texts(xml).slice(0, 40) });
  }
} else {
  note('AT-01', { blocked: true, reason: 'update_ui_not_found', texts: texts(xml).slice(0, 40) });
}

// ===== Manager approve — try ceo then pull leave tab =====
note('MGR start');
if (!(await login('ceo@xe.vn', 'Xevn@2026'))) {
  writeFileSync(`${OUT}/_at-mgr-finish.json`, JSON.stringify(log, null, 2));
  process.exit(3);
}
await sleep(1500);
xml = dump('130-mgr-home');
hit = tapId(xml, 'home-action-tile-approve') || tapText(xml, 'Cần duyệt') || tapText(xml, 'Phê duyệt');
if (!hit) {
  tapId(xml, 'check-in-fab');
  await sleep(1200);
  xml = dump('131-fab');
  hit = tapText(xml, 'Duyệt đơn') || tapText(xml, 'Phê duyệt') || tapText(xml, 'Cần duyệt');
}
note('open approvals', { hit });
await sleep(2500);
xml = dump('132-approvals');
note('queue0', { texts: texts(xml).slice(0, 40), hasBtn: xml.includes('manager-approve-button') });

// Switch to Nghỉ phép tab if present
hit = tapText(xml, 'Nghỉ phép') || tapText(xml, 'Tất cả');
if (hit) {
  await sleep(1500);
  xml = dump('133-leave-tab');
  note('leave tab', { texts: texts(xml).slice(0, 40), hasBtn: xml.includes('manager-approve-button') });
}

if (!xml.includes('manager-approve-button') && !texts(xml).includes('Duyệt')) {
  // pull to refresh
  sh(`"${adb}" shell input swipe 540 600 540 1600 400`);
  await sleep(2000);
  xml = dump('134-refresh');
  note('after refresh', { texts: texts(xml).slice(0, 40), hasBtn: xml.includes('manager-approve-button') });
}

if (xml.includes('manager-approve-button') || texts(xml).includes('Duyệt')) {
  hit = tapId(xml, 'manager-approve-button') || tapText(xml, 'Duyệt');
  note('tap Duyet', { hit });
  await sleep(1500);
  xml = dump('135-confirm');
  tapText(xml, 'Xác nhận') || tapText(xml, 'Đồng ý') || tapText(xml, 'Gửi') || tapText(xml, 'OK') || tapText(xml, 'Duyệt');
  await sleep(2500);
  xml = dump('136-after');
  note('J-MOB-05', {
    success: ['Thành công', 'Đã duyệt', 'Hoàn tác', 'APPROVED'].some((t) => xml.includes(t)),
    texts: texts(xml).slice(-25),
  });
  tapText(xml, 'OK') || tapText(xml, 'Đóng');
} else {
  note('J-MOB-05', {
    blocked: true,
    reason: 'manager_queue_empty_despite_pending_leave_api',
    texts: texts(xml).slice(0, 40),
  });
}

writeFileSync(`${OUT}/_at-mgr-finish.json`, JSON.stringify(log, null, 2));
console.log(JSON.stringify({ done: true }, null, 2));
