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
await sleep(700);
sh(`"${adb}" shell input keyevent 4`);
await sleep(700);
let xml = dump('30-back');
let hit = tapText(xml, 'Trang chủ');
console.log(JSON.stringify({ home: hit }));
await sleep(1200);
xml = dump('31-home');
const nodes = [...xml.matchAll(/(?:text|content-desc|resource-id)="([^"]*(?:duyệt|Duyệt|approve|Phê|Cần)[^"]*)"/gi)].map(
  (m) => m[1],
);
console.log(JSON.stringify({ approve_nodes: nodes.slice(0, 40) }));
hit =
  tapId(xml, 'home-action-tile-approve') ||
  tapText(xml, 'Phê duyệt') ||
  tapText(xml, 'Cần duyệt');
console.log(JSON.stringify({ tap_approve: hit }));
if (!hit) {
  sh(`"${adb}" shell input swipe 900 520 200 520 300`);
  await sleep(800);
  xml = dump('32-swipe1');
  hit =
    tapId(xml, 'home-action-tile-approve') ||
    tapText(xml, 'Phê duyệt') ||
    tapText(xml, 'Cần duyệt');
  console.log(JSON.stringify({ tap_after_swipe: hit, nodes2: [...xml.matchAll(/(?:text|content-desc|resource-id)="([^"]*(?:duyệt|Duyệt|approve|Phê|Cần|tile)[^"]*)"/gi)].map((m) => m[1]).slice(0, 40) }));
}
await sleep(2200);
xml = dump('33-approvals');
const leave = (xml.match(/Nghỉ phép\s*\((\d+)\)/) || [])[1] ?? null;
const all = (xml.match(/Tất cả\s*\((\d+)\)/) || [])[1] ?? null;
const empty = xml.includes('Không có đơn') || /Nghỉ phép\s*\(0\)/.test(xml);
const out = {
  leave,
  all,
  empty,
  hasDuyet: xml.includes('Duyệt'),
  hasApprovalsTitle: /Phê duyệt|Cần duyệt|ManagerApprovals|Chờ duyệt/.test(xml),
};
writeFileSync(`${OUT}/_approve-finish.json`, JSON.stringify({ ...out, nodes }, null, 2));
console.log(JSON.stringify(out, null, 2));
