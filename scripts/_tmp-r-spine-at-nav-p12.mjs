#!/usr/bin/env node
/** Retest PATH1 FAB + PATH2 hub late only (PATH3 already PASS). */
import { execSync, spawnSync } from 'node:child_process';
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const adb = process.env.LOCALAPPDATA + '\\Android\\Sdk\\platform-tools\\adb.exe';
const OUT = 'docs/qa/evidence/screens/r-spine-at-nav-01-qa';
mkdirSync(OUT, { recursive: true });
const log = [];
const note = (msg, extra = {}) => {
  const row = { t: new Date().toISOString(), msg, ...extra };
  log.push(row);
  console.log(JSON.stringify(row));
};
const sh = (c) => execSync(c, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();

async function dump(n, attempts = 5) {
  for (let i = 0; i < attempts; i++) {
    const r = spawnSync(
      adb,
      ['-s', 'emulator-5554', 'shell', 'uiautomator', 'dump', '/sdcard/qa-at-nav.xml'],
      { encoding: 'utf8', timeout: 20000 },
    );
    if (r.status === 0) {
      sh(`"${adb}" -s emulator-5554 pull /sdcard/qa-at-nav.xml ${OUT}/${n}.xml`);
      const shot = spawnSync(adb, ['-s', 'emulator-5554', 'exec-out', 'screencap', '-p'], {
        encoding: 'buffer',
        maxBuffer: 25e6,
      });
      if (shot.stdout?.length) writeFileSync(`${OUT}/${n}.png`, shot.stdout);
      return readFileSync(`${OUT}/${n}.xml`, 'utf8');
    }
    await sleep(1000);
  }
  throw new Error('dump fail ' + n);
}

function texts(xml) {
  return [...xml.matchAll(/text="([^"]+)"/g)].map((m) => m[1]);
}

function boundsOf(xml, re) {
  const m = xml.match(re);
  if (!m) return null;
  return { x1: +m[1], y1: +m[2], x2: +m[3], y2: +m[4] };
}

function tap(x, y) {
  sh(`"${adb}" -s emulator-5554 shell input tap ${x} ${y}`);
}

function tapText(xml, t) {
  const e = t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const b = boundsOf(
    xml,
    new RegExp(`text="${e}"[^>]*bounds="\\[(\\d+),(\\d+)\\]\\[(\\d+),(\\d+)\\]"`),
  );
  if (!b) return false;
  tap(Math.floor((b.x1 + b.x2) / 2), Math.floor((b.y1 + b.y2) / 2));
  return true;
}

function isForm(xml) {
  return xml.includes('Đơn công') && xml.includes('Loại điều chỉnh');
}

async function waitHome() {
  for (let i = 0; i < 20; i++) {
    const xml = await dump(`wait-home-${i}`);
    if (
      xml.includes('check-in-fab') ||
      (xml.includes('Trang chủ') && xml.includes('Nguyễn'))
    ) {
      return xml;
    }
    if (xml.includes('nexuslauncher')) {
      sh(
        `"${adb}" -s emulator-5554 shell am start -n vn.xevn.hrm.mobile/.MainActivity`,
      );
    }
    await sleep(1500);
  }
  throw new Error('home timeout');
}

const login = spawnSync(
  process.execPath,
  [
    'scripts/_tmp-po-spine-login.mjs',
    '--email',
    'uat.nv0001@xe.vn',
    '--password',
    'xevn-uat-2026',
  ],
  { encoding: 'utf8' },
);
console.log(login.stdout);
if (login.status !== 0) process.exit(2);
await sleep(2000);
let xml = await waitHome();
note('home ready', { texts: texts(xml).slice(0, 20) });

// PATH1
note('PATH1');
{
  const fab = boundsOf(
    xml,
    /resource-id="[^"]*check-in-fab"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/,
  );
  if (!fab) {
    note('PATH1 form', { pass: false, reason: 'no fab' });
  } else {
    tap(Math.floor((fab.x1 + fab.x2) / 2), Math.floor((fab.y1 + fab.y2) / 2));
    await sleep(1500);
    xml = await dump('r2-fab-sheet');
    const leave = xml.includes('Tạo đơn nghỉ');
    const update = xml.includes('Tạo đơn công');
    note('fab sheet', { leave, update });
    const b = boundsOf(
      xml,
      /text="Tạo đơn công"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/,
    );
    if (b) {
      tap(Math.floor((b.x1 + b.x2) / 2), Math.floor((b.y1 + b.y2) / 2));
      await sleep(2000);
      xml = await dump('r2-p1-form');
      note('PATH1 form', { pass: isForm(xml), leave, update, texts: texts(xml).slice(0, 20) });
    } else {
      note('PATH1 form', { pass: false, leave, update, reason: 'no Tạo đơn công' });
    }
  }
}

xml = await dump('r2-before-home');
tapText(xml, 'Trang chủ');
await sleep(1200);
xml = await waitHome();

// PATH2 — seek Đi muộn above FAB, else tap top/left of late cell
note('PATH2');
{
  for (let i = 0; i < 3; i++) {
    sh(`"${adb}" -s emulator-5554 shell input swipe 540 800 540 1800 250`);
    await sleep(400);
  }
  let target = null;
  for (let i = 0; i < 10; i++) {
    xml = await dump(`r2-seek-${i}`);
    const late = boundsOf(
      xml,
      /text="Đi muộn"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/,
    );
    const fab = boundsOf(
      xml,
      /resource-id="[^"]*check-in-fab"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/,
    );
    note('seek', { i, late, fab });
    if (late && fab && late.y2 < fab.y1 - 8) {
      target = late;
      break;
    }
    if (late && !fab) {
      target = late;
      break;
    }
    sh(`"${adb}" -s emulator-5554 shell input swipe 540 1500 540 1100 280`);
    await sleep(500);
  }
  if (target) {
    const x = Math.floor((target.x1 + target.x2) / 2);
    const y = Math.floor((target.y1 + target.y2) / 2);
    note('tap late clear', { x, y, target });
    tap(x, y);
  } else {
    xml = await dump('r2-fallback');
    const lateBtn = boundsOf(
      xml,
      /resource-id="attendance-stat-late"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/,
    );
    const fab = boundsOf(
      xml,
      /resource-id="[^"]*check-in-fab"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/,
    );
    if (lateBtn) {
      const y = lateBtn.y1 + 24;
      let x = Math.floor((lateBtn.x1 + lateBtn.x2) / 2);
      if (fab && x >= fab.x1 && x <= fab.x2) x = lateBtn.x1 + 36;
      note('fallback tap', { x, y, lateBtn, fab });
      tap(x, y);
    } else {
      note('PATH2 form', { pass: false, reason: 'no late' });
    }
  }
  await sleep(2000);
  xml = await dump('r2-p2-form');
  note('PATH2 form', {
    pass: isForm(xml),
    isFabSheet: xml.includes('Thao tác nhanh'),
    texts: texts(xml).slice(0, 25),
  });
}

writeFileSync(
  'docs/qa/evidence/r-spine-at-nav-01-qa-_device-log-p12.json',
  JSON.stringify({ log }, null, 2),
);
const p1 = log.find((r) => r.msg === 'PATH1 form');
const p2 = log.find((r) => r.msg === 'PATH2 form');
const pass = Boolean(p1?.pass && p2?.pass);
console.log(JSON.stringify({ pass, p1_pass: p1?.pass, p2_pass: p2?.pass }));
process.exit(pass ? 0 : 1);
