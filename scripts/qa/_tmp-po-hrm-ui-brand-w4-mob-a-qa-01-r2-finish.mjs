#!/usr/bin/env node
/** Finish J-MOB-02 / MOB-04 from Home (PO-HRM-UI-BRAND-W4-MOB-A-QA-01-R2) */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const adb = `${process.env.LOCALAPPDATA}\\Android\\Sdk\\platform-tools\\adb.exe`;
const SERIAL = 'emulator-5554';
const OUT = 'docs/qa/evidence/screens/po-hrm-ui-brand-w4-mob-a-qa-01-r2';

function adbSh(...args) {
  const r = spawnSync(adb, ['-s', SERIAL, ...args], { encoding: 'utf8', maxBuffer: 30e6 });
  if (r.status !== 0) throw new Error(r.stderr || r.stdout);
  return (r.stdout || '').trim();
}

async function dump(name, attempts = 5) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      adbSh('shell', 'uiautomator', 'dump', '/sdcard/qa-r2f.xml');
      await sleep(500);
      spawnSync(adb, ['-s', SERIAL, 'pull', '/sdcard/qa-r2f.xml', `${OUT}/${name}.xml`], { encoding: 'utf8' });
      const shot = spawnSync(adb, ['-s', SERIAL, 'exec-out', 'screencap', '-p'], { encoding: 'buffer', maxBuffer: 25e6 });
      if (shot.stdout?.length) fs.writeFileSync(`${OUT}/${name}.png`, shot.stdout);
      return fs.readFileSync(`${OUT}/${name}.xml`, 'utf8');
    } catch (e) {
      lastErr = e;
      await sleep(1200);
    }
  }
  throw lastErr;
}

function findBounds(xml, pred) {
  for (const chunk of xml.split('<node ').slice(1)) {
    const text = (chunk.match(/text="([^"]*)"/) || [])[1] || '';
    const desc = (chunk.match(/content-desc="([^"]*)"/) || [])[1] || '';
    const rid = (chunk.match(/resource-id="([^"]*)"/) || [])[1] || '';
    const b = chunk.match(/bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/);
    if (!b || !pred({ text, desc, rid })) continue;
    return { x: Math.floor((+b[1] + +b[3]) / 2), y: Math.floor((+b[2] + +b[4]) / 2), rid, text, desc };
  }
  return null;
}

function tap(hit) {
  if (!hit) return false;
  adbSh('shell', 'input', 'tap', String(hit.x), String(hit.y));
  return true;
}

const results = {};
adbSh('shell', 'am', 'start', '-n', 'vn.xevn.hrm.mobile/.MainActivity');
await sleep(4000);
let xml = await dump('r2-home-verify');
results.jmob01 = {
  home_top_bar_brand_accent: xml.includes('home-top-bar-brand-accent'),
  dashboard_attendance_brand_bar: xml.includes('dashboard-attendance-brand-bar'),
};

const fab = findBounds(xml, (n) => n.rid === 'check-in-fab' || /Thao tác nhanh/i.test(n.desc));
tap(fab);
await sleep(2000);
xml = await dump('r2-fab-sheet');
results.jmob02_fab = {
  fab_primary_action_sheet: xml.includes('fab-primary-action-sheet'),
  title: /Thao tác nhanh/.test(xml),
};

const checkInRow =
  findBounds(xml, (n) => /Chấm công/i.test(n.text) && !n.rid.includes('tile')) ||
  findBounds(xml, (n) => n.rid.includes('fab') && /Chấm/i.test(n.text));
if (!checkInRow) {
  const tile = findBounds(xml, (n) => n.rid === 'home-action-tile-checkin' || n.desc === 'Chấm công');
  tap(tile);
} else {
  tap(checkInRow);
  await sleep(2500);
  xml = await dump('r2-checkin-nav');
}

if (!xml.includes('check-in')) {
  xml = await dump('r2-checkin-screen');
  const tile = findBounds(xml, (n) => n.rid === 'home-action-tile-checkin' || n.desc === 'Chấm công');
  tap(tile);
  await sleep(2500);
  xml = await dump('r2-checkin-screen');
}

results.channels = {
  check_in_channel_gps: xml.includes('check-in-channel-gps'),
  check_in_channel_face: xml.includes('check-in-channel-face-mvp'),
};

const face = findBounds(xml, (n) => n.rid.includes('face-mvp') || /Khuôn mặt|Face/i.test(n.text));
if (face) {
  tap(face);
  await sleep(1500);
  xml = await dump('r2-face-channel');
  results.mob04b = {
    face_mvp_honesty_banner: xml.includes('face-mvp-honesty-banner'),
    check_in_submit_present: xml.includes('check-in-submit'),
    submit_disabled: /check-in-submit[^>]*enabled="false"/.test(xml.replace(/\s+/g, ' ')),
  };
}

const gps = findBounds(xml, (n) => n.rid.includes('check-in-channel-gps') || n.text === 'GPS');
if (gps) tap(gps);
await sleep(800);
xml = await dump('r2-gps-selected');

const allow = findBounds(xml, (n) => /While using|Cho phép|Allow/i.test(n.text));
if (allow) {
  tap(allow);
  await sleep(1200);
  xml = await dump('r2-gps-perm');
}

adbSh('logcat', '-c');
const submit =
  findBounds(xml, (n) => n.rid.includes('check-in-submit')) ||
  findBounds(xml, (n) => /Chấm công vào|Ghi nhận/i.test(n.text));
if (submit) {
  tap(submit);
  await sleep(6000);
  xml = await dump('r2-gps-after-submit');
}
const logcat = adbSh('logcat', '-d', '-t', '250');
results.mob04_gps = {
  logcat_has_attendance: /attendance\/records/i.test(logcat),
  logcat_2xx_hint: /(201|200).*attendance|attendance.*(201|200)/i.test(logcat),
  ui_success: /thành công|đã chấm|ghi nhận/i.test(xml),
  ui_error: /lỗi|thất bại|401|403|500/i.test(xml),
};

fs.writeFileSync('docs/qa/evidence/_tmp-po-hrm-ui-brand-w4-mob-a-qa-01-r2-finish.json', JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
