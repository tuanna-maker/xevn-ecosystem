#!/usr/bin/env node
import { execSync, spawnSync } from 'node:child_process';
import { writeFileSync, readFileSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const adb = process.env.LOCALAPPDATA + '\\Android\\Sdk\\platform-tools\\adb.exe';
const OUT = 'docs/qa/evidence/screens/r-spine-mgr-hier-01-qa';

function sh(cmd) {
  return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}
function dump(n) {
  for (let i = 0; i < 4; i++) {
    try {
      sh(`"${adb}" shell uiautomator dump /sdcard/qa-hier.xml`);
      sh(`"${adb}" pull /sdcard/qa-hier.xml ${OUT}/${n}.xml`);
      const shot = spawnSync(adb, ['exec-out', 'screencap', '-p'], { maxBuffer: 25e6, encoding: 'buffer' });
      if (shot.status === 0 && shot.stdout?.length) writeFileSync(`${OUT}/${n}.png`, shot.stdout);
      return readFileSync(`${OUT}/${n}.xml`, 'utf8');
    } catch {
      spawnSync(process.execPath, ['-e', 'Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,1000)']);
    }
  }
  throw new Error('dump fail ' + n);
}
function tapId(xml, id) {
  const e = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = xml.match(new RegExp(`resource-id="${e}"[^>]*bounds="\\[(\\d+),(\\d+)\\]\\[(\\d+),(\\d+)\\]"`));
  if (!m) return null;
  const x = Math.floor((+m[1] + +m[3]) / 2);
  const y = Math.floor((+m[2] + +m[4]) / 2);
  sh(`"${adb}" shell input tap ${x} ${y}`);
  return { x, y };
}
function tapText(xml, text) {
  const e = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  for (const re of [
    new RegExp(`text="${e}"[^>]*bounds="\\[(\\d+),(\\d+)\\]\\[(\\d+),(\\d+)\\]"`),
    new RegExp(`content-desc="${e}"[^>]*bounds="\\[(\\d+),(\\d+)\\]\\[(\\d+),(\\d+)\\]"`),
    new RegExp(`text="[^"]*${e}[^"]*"[^>]*bounds="\\[(\\d+),(\\d+)\\]\\[(\\d+),(\\d+)\\]"`),
  ]) {
    const m = xml.match(re);
    if (!m) continue;
    const x = Math.floor((+m[1] + +m[3]) / 2);
    const y = Math.floor((+m[2] + +m[4]) / 2);
    sh(`"${adb}" shell input tap ${x} ${y}`);
    return { x, y };
  }
  return null;
}

// Back to home from Thong bao
sh(`"${adb}" shell input keyevent 4`);
await sleep(1000);
let xml = dump('50-pre');
tapText(xml, 'Trang chủ');
await sleep(1200);
xml = dump('51-home');
console.log(
  JSON.stringify({
    home: xml.includes('Trang chủ'),
    tiles: [...xml.matchAll(/resource-id="(home-action-tile-[^"]+)"/g)].map((m) => m[1]),
  }),
);

let hit = tapId(xml, 'home-action-tile-approve');
console.log('tap approve', hit);
await sleep(5000);
xml = dump('52-after-approve');
let texts = [...xml.matchAll(/text="([^"]+)"/g)].map((m) => m[1]);
console.log('texts52', texts.filter((t) => t.length > 1 && t.length < 60).slice(0, 40));

// If still loading, wait more
if (xml.includes('Đang tải')) {
  await sleep(6000);
  xml = dump('53-after-wait');
  texts = [...xml.matchAll(/text="([^"]+)"/g)].map((m) => m[1]);
  console.log('texts53', texts.filter((t) => t.length > 1 && t.length < 60).slice(0, 40));
}

// Try tab chips Nghỉ phép / Tất cả
let leaveHit = tapText(xml, 'Nghỉ phép') || tapText(xml, 'Tất cả');
console.log('chip', leaveHit);
await sleep(1500);
xml = dump('54-leave-tab');
texts = [...xml.matchAll(/text="([^"]+)"/g)].map((m) => m[1]);
const leave = (xml.match(/Nghỉ phép\s*\((\d+)\)/) || [])[1] ?? null;
const all = (xml.match(/Tất cả\s*\((\d+)\)/) || [])[1] ?? null;
const empty =
  xml.includes('Không có đơn nghỉ phép chờ duyệt') ||
  xml.includes('Không có đơn') ||
  /Nghỉ phép\s*\(0\)/.test(xml);
const out = {
  leave,
  all,
  empty,
  hasDuyet: xml.includes('Duyệt'),
  texts: texts.filter((t) => t.length > 1 && t.length < 60).slice(0, 50),
  title: /Phê duyệt|Cần duyệt|Thông báo|Manager/.test(xml),
};
writeFileSync(`${OUT}/_approve-finish.json`, JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
