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
  sh(`"${adb}" shell uiautomator dump /sdcard/qa-hier.xml`);
  sh(`"${adb}" pull /sdcard/qa-hier.xml ${OUT}/${n}.xml`);
  const shot = spawnSync(adb, ['exec-out', 'screencap', '-p'], { maxBuffer: 25e6, encoding: 'buffer' });
  if (shot.status === 0 && shot.stdout?.length) writeFileSync(`${OUT}/${n}.png`, shot.stdout);
  return readFileSync(`${OUT}/${n}.xml`, 'utf8');
}
function tap(xml, patterns) {
  for (const p of patterns) {
    const re = typeof p === 'string' ? new RegExp(p) : p;
    const m = xml.match(re);
    if (!m) continue;
    const x = Math.floor((+m[1] + +m[3]) / 2);
    const y = Math.floor((+m[2] + +m[4]) / 2);
    sh(`"${adb}" shell input tap ${x} ${y}`);
    return { x, y };
  }
  return null;
}
function tapText(xml, text) {
  const e = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return tap(xml, [
    `text="${e}"[^>]*bounds="\\[(\\d+),(\\d+)\\]\\[(\\d+),(\\d+)\\]"`,
    `content-desc="${e}"[^>]*bounds="\\[(\\d+),(\\d+)\\]\\[(\\d+),(\\d+)\\]"`,
    `text="[^"]*${e}[^"]*"[^>]*bounds="\\[(\\d+),(\\d+)\\]\\[(\\d+),(\\d+)\\]"`,
  ]);
}
function tapId(xml, id) {
  const e = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return tap(xml, [`resource-id="${e}"[^>]*bounds="\\[(\\d+),(\\d+)\\]\\[(\\d+),(\\d+)\\]"`]);
}

sh(`"${adb}" shell input keyevent 4`);
await sleep(800);
let xml = dump('80-back');
tapText(xml, 'Trang chủ');
await sleep(1200);
xml = dump('81-home');
tapId(xml, 'check-in-fab') || tapText(xml, 'Thao tác nhanh');
await sleep(1500);
xml = dump('82-fab');
const texts = [...xml.matchAll(/text="([^"]+)"/g)].map((m) => m[1]);
console.log(JSON.stringify({ fab: texts.slice(0, 30) }, null, 2));
let hit =
  tapText(xml, 'Phê duyệt') ||
  tapText(xml, 'Duyệt đơn') ||
  tapText(xml, 'Cần duyệt') ||
  tapId(xml, 'fab-action-approvals') ||
  tapId(xml, 'fab-action-approve');
console.log('fab_approve', hit);
await sleep(2500);
if (hit) {
  xml = dump('83-mgr-approvals');
  const t2 = [...xml.matchAll(/text="([^"]+)"/g)].map((m) => m[1]);
  const leave = (xml.match(/Nghỉ phép\s*\((\d+)\)/) || [])[1] ?? null;
  const empty = xml.includes('Không có đơn') || /Nghỉ phép\s*\(0\)/.test(xml);
  writeFileSync(
    `${OUT}/_fab-approve.json`,
    JSON.stringify({ hit, leave, empty, texts: t2.slice(0, 40) }, null, 2),
  );
  console.log(JSON.stringify({ leave, empty, texts: t2.slice(0, 40) }, null, 2));
} else {
  writeFileSync(`${OUT}/_fab-approve.json`, JSON.stringify({ hit: null, fab: texts.slice(0, 30) }, null, 2));
}
