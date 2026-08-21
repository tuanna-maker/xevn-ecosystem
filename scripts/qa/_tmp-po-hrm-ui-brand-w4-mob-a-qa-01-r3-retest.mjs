#!/usr/bin/env node
/** R3 focused retest — stay in app, face-mvp id, GPS POST logcat */
import { execSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const adb = `${process.env.LOCALAPPDATA}\\Android\\Sdk\\platform-tools\\adb.exe`;
const S = 'emulator-5554';
const PKG = 'vn.xevn.hrm.mobile';
const OUT = 'docs/qa/evidence/screens/po-hrm-ui-brand-w4-mob-a-qa-01-r3';
const API = 'http://14.225.217.232:3001';

function adbSh(...a) {
  const r = spawnSync(adb, ['-s', S, ...a], { encoding: 'utf8', maxBuffer: 30e6, timeout: 90000 });
  if (r.status !== 0) throw new Error(String(r.stderr || r.stdout).slice(0, 500));
  return (r.stdout || '').trim();
}

async function dump(name) {
  for (let i = 0; i < 5; i++) {
    try {
      adbSh('shell', 'uiautomator', 'dump', '/sdcard/qa-r3r.xml');
      await sleep(350);
      execSync(`"${adb}" -s ${S} pull /sdcard/qa-r3r.xml "${OUT}/${name}.xml"`, { stdio: 'pipe' });
      const shot = spawnSync(adb, ['-s', S, 'exec-out', 'screencap', '-p'], { encoding: 'buffer', maxBuffer: 25e6 });
      if (shot.stdout?.length) fs.writeFileSync(`${OUT}/${name}.png`, shot.stdout);
      return fs.readFileSync(`${OUT}/${name}.xml`, 'utf8');
    } catch {
      await sleep(1000);
    }
  }
  throw new Error('dump fail');
}

function find(xml, pred) {
  for (const chunk of xml.split('<node ').slice(1)) {
    const text = (chunk.match(/text="([^"]*)"/) || [])[1] || '';
    const rid = (chunk.match(/resource-id="([^"]*)"/) || [])[1] || '';
    const b = chunk.match(/bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/);
    if (!b) continue;
    const node = { text, rid };
    if (!pred(node)) continue;
    return { x: Math.floor((+b[1] + +b[3]) / 2), y: Math.floor((+b[2] + +b[4]) / 2) };
  }
  return null;
}

function tap(hit) {
  if (hit) adbSh('shell', 'input', 'tap', String(hit.x), String(hit.y));
}

async function deeplink() {
  const res = await fetch(`${API}/api/hrm/auth/mobile/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'uat.nv0001@xe.vn', password: 'xevn-uat-2026' }),
  });
  const j = await res.json();
  const d = j.data;
  const a = d.active_membership ?? d.memberships?.[0] ?? {};
  const q = new URLSearchParams({
    access_token: d.access_token,
    refresh_token: d.refresh_token ?? '',
    tenant_id: a.tenant_id ?? d.default_tenant_id,
    company_id: a.company_id ?? d.default_company_id,
    company_uuid: a.company_uuid ?? '',
    employee_id: a.employee_id ?? d.employee?.id ?? '',
    base_url: API,
  });
  const url = `xevn://qa-login?${q.toString()}`;
  fs.writeFileSync(`${OUT}/deeplink-url-len.txt`, String(url.length));
  adbSh('shell', 'am', 'start', '-W', '-a', 'android.intent.action.VIEW', '-n', `${PKG}/.MainActivity`, '-d', url);
  await sleep(10000);
}

const R = {};

await deeplink();
let xml = await dump('retest-home');
if (xml.includes('fab-primary-action-sheet')) {
  tap(find(xml, (n) => n.text === 'Đóng'));
  await sleep(1500);
  xml = await dump('retest-home-closed');
}
R.jmob01 = xml.includes('home-top-bar-brand-accent') && xml.includes('dashboard-attendance-brand-bar');

const fabHit = find(xml, (n) => /Thao tác nhanh/i.test(n.text) || n.rid.includes('fab-primary'));
tap(fabHit);
await sleep(2000);
xml = await dump('retest-fab');
R.jmob02 = xml.includes('fab-primary-action-sheet');

tap(find(xml, (n) => n.rid.includes('fab-action-check-in')) || find(xml, (n) => n.text === 'Chấm công'));
await sleep(2500);
xml = await dump('retest-checkin');

tap(find(xml, (n) => n.rid.includes('check-in-channel-face-mvp')) || find(xml, (n) => n.rid.includes('check-in-channel-face')));
await sleep(1500);
xml = await dump('retest-mob04b');
R.mob04b_banner = xml.includes('face-mvp-honesty-banner');
R.mob04b_submit_off = /check-in-submit[^>]*enabled="false"/.test(xml.replace(/\s+/g, ' '));

tap(find(xml, (n) => n.rid.includes('check-in-channel-gps')));
await sleep(800);
xml = await dump('retest-gps');
adbSh('logcat', '-c');
const sub = find(xml, (n) => n.rid.includes('check-in-submit'));
const enabled = sub && !/check-in-submit[^>]*enabled="false"/.test(xml.replace(/\s+/g, ' '));
if (enabled) {
  tap(sub);
  await sleep(8000);
  xml = await dump('retest-gps-post');
  const log = adbSh('logcat', '-d', '-t', '1200');
  fs.writeFileSync(`${OUT}/retest-gps-logcat.txt`, log);
  R.mob04_post =
    /attendance\/records.*(201|200)/i.test(log) ||
    /ReactNativeJS.*(201|200|success|attendance)/i.test(log);
  R.mob04_log_lines = log.split('\n').filter((l) => /attendance|ReactNativeJS|hrm|POST/i.test(l)).slice(0, 20);
} else {
  R.mob04_post = false;
  R.mob04_skip = 'submit not enabled on GPS';
}

fs.writeFileSync('docs/qa/evidence/_tmp-po-hrm-ui-brand-w4-mob-a-qa-01-r3-retest.json', JSON.stringify(R, null, 2));
console.log(JSON.stringify(R, null, 2));
