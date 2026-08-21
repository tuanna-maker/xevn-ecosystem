#!/usr/bin/env node
/** AT-01 via hub «Việc» / «Đi muộn» / Settings */
import { execSync, spawnSync } from 'node:child_process';
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const adb = process.env.LOCALAPPDATA + '\\Android\\Sdk\\platform-tools\\adb.exe';
const OUT = 'docs/qa/evidence/screens/po-e2e-spine-02-03-mob-qa-w1';
mkdirSync(OUT, { recursive: true });
const log = [];
const note = (m, e = {}) => {
  const row = { t: new Date().toISOString(), msg: m, ...e };
  log.push(row);
  console.log(JSON.stringify(row));
};
const sh = (c) => execSync(c, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
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
const texts = (xml) => [...xml.matchAll(/text="([^"]+)"/g)].map((m) => m[1]);

const login = spawnSync(
  process.execPath,
  ['scripts/_tmp-po-spine-login.mjs', '--email', 'uat.nv0001@xe.vn', '--password', 'xevn-uat-2026'],
  { encoding: 'utf8' },
);
console.log(login.stdout);
if (login.status !== 0) process.exit(2);
await sleep(1500);

let xml = dump('140-home');
// Try hub Việc
let hit = tapText(xml, 'Việc') || tapText(xml, 'Việc cần làm') || tapText(xml, 'Đi muộn');
note('hub tap', { hit });
await sleep(2000);
xml = dump('141-hub');
note('hub', { texts: texts(xml).slice(0, 45) });

hit =
  tapText(xml, 'Đơn công') ||
  tapText(xml, 'Tạo đơn') ||
  tapText(xml, 'Điều chỉnh') ||
  tapText(xml, 'Đi muộn') ||
  tapText(xml, 'Yêu cầu');
note('hub child', { hit });
await sleep(2000);
xml = dump('142-after-hub');

if (!xml.includes('Loại điều chỉnh') && !xml.includes('Gửi đơn') && !xml.includes('Đơn công')) {
  // Settings path
  tapText(xml, 'Trang chủ');
  await sleep(800);
  xml = dump('143-home2');
  tapText(xml, 'Hồ sơ');
  await sleep(1500);
  xml = dump('144-profile');
  hit = tapText(xml, 'Cài đặt');
  note('settings', { hit });
  await sleep(2000);
  xml = dump('145-settings');
  note('settings texts', { texts: texts(xml).slice(0, 50) });
  for (let i = 0; i < 3; i++) {
    hit = tapText(xml, 'Đơn công') || tapText(xml, 'Yêu cầu') || tapText(xml, 'Phê duyệt');
    if (hit) break;
    sh(`"${adb}" shell input swipe 540 1800 540 700 300`);
    await sleep(600);
    xml = dump(`146-set-scroll-${i}`);
  }
  note('settings entry', { hit });
  await sleep(2000);
  xml = dump('147-requests');
}

note('surface', { texts: texts(xml).slice(0, 40) });
const onForm = xml.includes('Loại điều chỉnh') || xml.includes('Lý do');
const onList = xml.includes('Đơn công') || xml.includes('Tạo đơn');

if (onList && !onForm) {
  hit = tapText(xml, 'Tạo đơn') || tapText(xml, '+ Tạo đơn') || tapText(xml, '+');
  if (!hit) sh(`"${adb}" shell input tap 1000 200`);
  await sleep(2000);
  xml = dump('148-form');
}

if (xml.includes('Lý do') || xml.includes('Loại điều chỉnh') || xml.includes('Gửi đơn')) {
  // fail empty reason
  tapText(xml, 'Lý do');
  await sleep(300);
  for (let i = 0; i < 50; i++) sh(`"${adb}" shell input keyevent 67`);
  tapText(dump('149-empty'), 'Gửi đơn');
  await sleep(1500);
  xml = dump('150-fail');
  note('AT-FAIL', { texts: texts(xml).slice(-15) });
  tapText(xml, 'OK') || tapText(xml, 'Đóng');
  await sleep(600);
  xml = dump('151-retry');
  tapText(xml, 'Loại điều chỉnh');
  await sleep(200);
  for (let i = 0; i < 25; i++) sh(`"${adb}" shell input keyevent 67`);
  try {
    sh(`"${adb}" shell input text "late_arrival"`);
  } catch {
    /* */
  }
  tapText(xml, 'Lý do');
  await sleep(200);
  try {
    sh(`"${adb}" shell input text "Di_muon_AT01"`);
  } catch {
    /* */
  }
  xml = dump('152-filled');
  tapText(xml, 'Gửi đơn');
  await sleep(2500);
  xml = dump('153-result');
  note('AT-01', {
    ok: ['Thành công', 'HRM-', 'Đã gửi'].some((t) => xml.includes(t)),
    texts: texts(xml).slice(-20),
  });
  tapText(xml, 'OK') || tapText(xml, 'Đóng');
} else {
  note('AT-01', { blocked: true, reason: 'no_create_update_surface', texts: texts(xml).slice(0, 40) });
}

writeFileSync(`${OUT}/_at-hub-log.json`, JSON.stringify(log, null, 2));
