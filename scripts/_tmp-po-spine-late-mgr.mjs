#!/usr/bin/env node
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
  const m = xml.match(new RegExp(`text="${e}"[^>]*bounds="\\[(\\d+),(\\d+)\\]\\[(\\d+),(\\d+)\\]"`));
  if (!m) {
    const m2 = xml.match(new RegExp(`content-desc="[^"]*${e}[^"]*"[^>]*bounds="\\[(\\d+),(\\d+)\\]\\[(\\d+),(\\d+)\\]"`));
    if (!m2) return null;
    const x = Math.floor((+m2[1] + +m2[3]) / 2);
    const y = Math.floor((+m2[2] + +m2[4]) / 2);
    sh(`"${adb}" shell input tap ${x} ${y}`);
    return { x, y, t };
  }
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

async function login(email, password) {
  const r = spawnSync(process.execPath, ['scripts/_tmp-po-spine-login.mjs', '--email', email, '--password', password], {
    encoding: 'utf8',
  });
  console.log(r.stdout);
  return r.status === 0;
}

// --- LT-01: from current NV session (assume still nv0001 after leave) ---
let xml = dump('80-pre-late');
tapText(xml, 'OK');
await sleep(500);
tapText(xml, 'Trang chủ') || tapText(dump('80b'), 'Trang chủ');
await sleep(1200);
xml = dump('81-home');

// Profile / hub path to Đơn công — try FAB if available, else tile
let hit =
  tapText(xml, 'Đơn công') ||
  tapText(xml, 'Điều chỉnh') ||
  tapId(xml, 'home-action-tile-requests');
if (!hit) {
  // Profile tab → look for requests
  tapText(xml, 'Hồ sơ');
  await sleep(1500);
  xml = dump('82-profile');
  hit = tapText(xml, 'Đơn công') || tapText(xml, 'Yêu cầu điều chỉnh') || tapText(xml, 'Đơn chờ');
}
if (!hit) {
  tapText(dump('82b'), 'Trang chủ');
  await sleep(800);
  xml = dump('83-home2');
  tapId(xml, 'check-in-fab') || tapText(xml, 'Thao tác nhanh');
  await sleep(1200);
  xml = dump('84-fab');
  // no late in FAB — only check_in / leave / approvals
  note('LT-01', { fabActions: [...xml.matchAll(/text="([^"]+)"/g)].map((m) => m[1]).slice(0, 12) });
  tapText(xml, 'Đóng');
  await sleep(500);
  // Dashboard hub: scroll for Đơn công
  sh(`"${adb}" shell input swipe 540 1900 540 700 350`);
  await sleep(700);
  xml = dump('85-home-scroll');
  hit = tapText(xml, 'Đơn công') || tapText(xml, 'Điều chỉnh giờ') || tapText(xml, 'Yêu cầu');
}
note('LT entry', { hit });
await sleep(2000);
xml = dump('86-update-screen');

const onUpdateList =
  xml.includes('Đơn công') || xml.includes('UpdateRequest') || xml.includes('điều chỉnh') || xml.includes('CreateUpdate');
note('on update surface', {
  onUpdateList,
  texts: [...xml.matchAll(/text="([^"]+)"/g)].map((m) => m[1]).slice(0, 30),
});

// Try create
hit = tapText(xml, 'Tạo') || tapText(xml, 'Thêm') || tapText(xml, '+') || tapText(xml, 'Gửi đơn');
if (!hit && (xml.includes('Loại điều chỉnh') || xml.includes('Lý do'))) {
  note('already on create form');
} else if (!hit) {
  sh(`"${adb}" shell input tap 980 2100`);
  await sleep(1500);
  xml = dump('87-after-fab');
}
await sleep(1500);
xml = dump('88-create-update');

// Fail path: clear reason
if (xml.includes('Lý do')) {
  tapText(xml, 'Lý do');
  await sleep(400);
  for (let i = 0; i < 50; i++) sh(`"${adb}" shell input keyevent 67`);
  await sleep(300);
  xml = dump('89-empty-reason');
  tapText(xml, 'Gửi đơn');
  await sleep(1500);
  xml = dump('90-fail-result');
  const failUi = ['bắt buộc', 'Lỗi', 'Thiếu', 'required', 'không'].some((t) => xml.includes(t));
  note('LT-FAIL', { failUi, texts: [...xml.matchAll(/text="([^"]+)"/g)].map((m) => m[1]).slice(-15) });
  tapText(xml, 'OK') || tapText(xml, 'Đóng');
  await sleep(800);
  // refill
  xml = dump('91-refill');
  tapText(xml, 'Lý do');
  await sleep(300);
  try {
    sh(`"${adb}" shell input text "Di_muon_PO_E2E_spine"`);
  } catch {
    /* ignore */
  }
  await sleep(400);
  xml = dump('92-filled');
  hit = tapText(xml, 'Gửi đơn');
  note('LT submit', { hit });
  await sleep(2500);
  xml = dump('93-late-after');
  const ok = ['Thành công', 'HRM-', 'Đã gửi', 'pending'].some((t) => xml.includes(t));
  note('LT-01 result', { ok, texts: [...xml.matchAll(/text="([^"]+)"/g)].map((m) => m[1]).slice(-20) });
  tapText(xml, 'OK') || tapText(xml, 'Đóng');
} else {
  note('LT-01', { blocked: true, reason: 'create_update_ui_not_reached' });
}

// --- Manager approve ---
const mgrOk = await login('ceo@xe.vn', 'Xevn@2026');
note('mgr login', { mgrOk });
if (!mgrOk) {
  writeFileSync(`${OUT}/_late-mgr-log.json`, JSON.stringify(log, null, 2));
  process.exit(3);
}
await sleep(1500);
xml = dump('100-mgr-home');
hit =
  tapId(xml, 'home-action-tile-approve') ||
  tapText(xml, 'Cần duyệt') ||
  tapText(xml, 'Đơn chờ duyệt') ||
  tapText(xml, 'Phê duyệt');
if (!hit) {
  tapId(xml, 'check-in-fab');
  await sleep(1200);
  xml = dump('101-mgr-fab');
  hit = tapText(xml, 'Duyệt đơn') || tapText(xml, 'Phê duyệt') || tapText(xml, 'Cần duyệt');
}
if (!hit) {
  sh(`"${adb}" shell input swipe 540 1700 540 700 300`);
  await sleep(700);
  xml = dump('102-mgr-scroll');
  hit = tapId(xml, 'home-action-tile-approve') || tapText(xml, 'Cần duyệt');
}
note('open approvals', { hit });
await sleep(2500);
xml = dump('103-approvals');
const empty =
  !xml.includes('manager-approve-button') &&
  !xml.includes('Duyệt') &&
  (xml.includes('Không có') || xml.includes('trống') || xml.includes('Chưa có'));
note('queue', {
  empty,
  hasApproveBtn: xml.includes('manager-approve-button'),
  texts: [...xml.matchAll(/text="([^"]+)"/g)].map((m) => m[1]).slice(0, 40),
});

if (empty) {
  note('J-MOB-05 BLOCKED', { reason: 'empty_manager_queue_U65' });
  writeFileSync(`${OUT}/_late-mgr-log.json`, JSON.stringify(log, null, 2));
  process.exit(4);
}

hit = tapId(xml, 'manager-approve-button') || tapText(xml, 'Duyệt');
note('tap Duyet', { hit });
await sleep(1500);
xml = dump('104-confirm-approve');
tapText(xml, 'Xác nhận') || tapText(xml, 'Đồng ý') || tapText(xml, 'OK') || tapText(xml, 'Duyệt');
await sleep(2500);
xml = dump('105-after-approve');
const success = ['Thành công', 'Đã duyệt', 'APPROVED', 'Hoàn tác'].some((t) => xml.includes(t));
note('J-MOB-05', {
  success,
  texts: [...xml.matchAll(/text="([^"]+)"/g)].map((m) => m[1]).slice(-25),
});
tapText(xml, 'OK') || tapText(xml, 'Đóng');
writeFileSync(`${OUT}/_late-mgr-log.json`, JSON.stringify(log, null, 2));
process.exit(success ? 0 : 2);
