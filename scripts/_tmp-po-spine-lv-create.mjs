#!/usr/bin/env node
/** Focused LV-01 create leave via FAB → Tạo đơn nghỉ */
import { execSync, spawnSync } from 'node:child_process';
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const adb = process.env.LOCALAPPDATA + '\\Android\\Sdk\\platform-tools\\adb.exe';
const OUT = 'docs/qa/evidence/screens/po-e2e-spine-02-03-mob-qa-w1';
mkdirSync(OUT, { recursive: true });
const steps = [];

function sh(cmd) {
  return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}
function log(msg, extra = {}) {
  const row = { t: new Date().toISOString(), msg, ...extra };
  steps.push(row);
  console.log(JSON.stringify(row));
}
function dump(name) {
  sh(`"${adb}" shell uiautomator dump /sdcard/qa-lv.xml`);
  sh(`"${adb}" pull /sdcard/qa-lv.xml ${OUT}/${name}.xml`);
  const shot = spawnSync(adb, ['exec-out', 'screencap', '-p'], { maxBuffer: 25e6, encoding: 'buffer' });
  if (shot.status === 0 && shot.stdout?.length) writeFileSync(`${OUT}/${name}.png`, shot.stdout);
  return readFileSync(`${OUT}/${name}.xml`, 'utf8');
}
function tap(xml, patterns) {
  for (const p of patterns) {
    const re = typeof p === 'string' ? new RegExp(p) : p;
    const m = xml.match(re);
    if (!m) continue;
    const x = Math.floor((+m[1] + +m[3]) / 2);
    const y = Math.floor((+m[2] + +m[4]) / 2);
    sh(`"${adb}" shell input tap ${x} ${y}`);
    return { x, y, m: m[0].slice(0, 100) };
  }
  return null;
}
function tapText(xml, text) {
  const e = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return tap(xml, [
    `text="${e}"[^>]*bounds="\\[(\\d+),(\\d+)\\]\\[(\\d+),(\\d+)\\]"`,
    `content-desc="${e}"[^>]*bounds="\\[(\\d+),(\\d+)\\]\\[(\\d+),(\\d+)\\]"`,
    `content-desc="[^"]*${e}[^"]*"[^>]*bounds="\\[(\\d+),(\\d+)\\]\\[(\\d+),(\\d+)\\]"`,
    `text="[^"]*${e}[^"]*"[^>]*bounds="\\[(\\d+),(\\d+)\\]\\[(\\d+),(\\d+)\\]"`,
  ]);
}
function tapId(xml, id) {
  const e = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return tap(xml, [`resource-id="${e}"[^>]*bounds="\\[(\\d+),(\\d+)\\]\\[(\\d+),(\\d+)\\]"`]);
}

// Ensure home
let xml = dump('60-pre');
tapText(xml, 'Trang chủ');
await sleep(1200);
xml = dump('61-home');

// Open FAB sheet
let hit = tapId(xml, 'check-in-fab') || tapText(xml, 'Thao tác nhanh');
log('FAB open', { hit });
await sleep(1500);
xml = dump('62-fab-sheet');

// Fail path attempt: open create and try skip dates if next disabled — document
hit = tapText(xml, 'Tạo đơn nghỉ') || tapId(xml, 'fab-action-create_leave');
log('tap create leave', { hit });
await sleep(2500);
xml = dump('63-create-step0');

const onCreate = xml.includes('Tạo đơn nghỉ') || xml.includes('Bước 1');
log('on create screen', { onCreate, hasNext: xml.includes('Tiếp tục') || xml.includes('leave-create-next') });

// Fail: tap Tiếp tục without selecting date if disabled — or capture disabled
const nextDisabled = /leave-create-next[^>]*(?:enabled="false"|clickable="false")/.test(xml);
log('LV-FAIL step0', { nextDisabled, hasDateHint: xml.includes('Khoảng ngày') });

// Date field — open picker, confirm
hit =
  tapText(xml, 'Khoảng ngày nghỉ') ||
  tapText(xml, 'Chọn khoảng') ||
  tap(xml, [/class="android.widget.EditText"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/]);
log('open date', { hit });
await sleep(1500);
let px = dump('64-datepicker');
tapText(px, 'OK') || tapText(px, 'Xác nhận') || tapText(px, 'Lưu') || tapText(px, 'Done');
await sleep(1000);
px = dump('64b-datepicker');
tapText(px, 'OK') || tapText(px, 'Xác nhận') || tapText(px, 'Lưu') || tapText(px, 'Done');
await sleep(800);

xml = dump('65-step0-ready');
hit = tapId(xml, 'leave-create-next') || tapText(xml, 'Tiếp tục');
log('step0 next', { hit });
await sleep(2000);
xml = dump('66-step1');

tapText(xml, 'Phép năm') || tapText(xml, 'Nghỉ phép năm');
await sleep(500);
xml = dump('67-step1-type');
hit = tapId(xml, 'leave-create-next') || tapText(xml, 'Tiếp tục');
log('step1 next', { hit });
await sleep(2000);
xml = dump('68-step2');

hit = tapId(xml, 'leave-create-next') || tapText(xml, 'Tiếp tục');
log('step2 next', { hit });
await sleep(2000);
xml = dump('69-step3');

hit = tapText(xml, 'Gửi đơn nghỉ');
log('submit', { hit });
await sleep(1500);
xml = dump('70-confirm');
hit = tapText(xml, 'Xác nhận') || tapText(xml, 'Gửi') || tapText(xml, 'Đồng ý') || tapText(xml, 'OK');
log('confirm', { hit });
await sleep(3000);
xml = dump('71-after');
const success =
  xml.includes('Đã gửi') ||
  xml.includes('thành công') ||
  xml.includes('Thành công') ||
  xml.includes('Chờ duyệt') ||
  xml.includes('Đơn nghỉ phép đã được gửi');
tapText(xml, 'OK') || tapText(xml, 'Đóng');
await sleep(1500);
xml = dump('72-final');
log('LV-01 result', {
  success,
  hasChoDuyet: xml.includes('Chờ duyệt'),
  hasCreate: xml.includes('Tạo đơn nghỉ'),
  hasList: xml.includes('Nghỉ phép của tôi') || xml.includes('leave-requests-list'),
});

writeFileSync(`${OUT}/_lv-create-log.json`, JSON.stringify(steps, null, 2));
console.log(JSON.stringify({ pass: success || xml.includes('Chờ duyệt'), steps: steps.length }, null, 2));
process.exit(success || xml.includes('Chờ duyệt') ? 0 : 2);
