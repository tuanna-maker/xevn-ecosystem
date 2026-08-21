#!/usr/bin/env node
/** R3 supplemental — home brand, MOB-04b, GPS POST with RN logcat */
import { spawnSync, execSync } from 'node:child_process';
import fs from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const adb = `${process.env.LOCALAPPDATA}\\Android\\Sdk\\platform-tools\\adb.exe`;
const S = 'emulator-5554';
const PKG = 'vn.xevn.hrm.mobile';
const OUT = 'docs/qa/evidence/screens/po-hrm-ui-brand-w4-mob-a-qa-01-r3';
const API = 'http://14.225.217.232:3001';

function adbSh(...a) {
  const r = spawnSync(adb, ['-s', S, ...a], { encoding: 'utf8', maxBuffer: 20e6 });
  if (r.status !== 0) throw new Error(String(r.stderr || r.stdout));
  return (r.stdout || '').trim();
}

async function dump(name, attempts = 5) {
  for (let i = 0; i < attempts; i++) {
    try {
      adbSh('shell', 'uiautomator', 'dump', '/sdcard/qa-r3f.xml');
      await sleep(400);
      execSync(`"${adb}" -s ${S} pull /sdcard/qa-r3f.xml "${OUT}/${name}.xml"`, { stdio: 'pipe' });
      const shot = spawnSync(adb, ['-s', S, 'exec-out', 'screencap', '-p'], { encoding: 'buffer', maxBuffer: 20e6 });
      if (shot.stdout?.length) fs.writeFileSync(`${OUT}/${name}.png`, shot.stdout);
      return fs.readFileSync(`${OUT}/${name}.xml`, 'utf8');
    } catch (e) {
      if (i === attempts - 1) throw e;
      await sleep(1200);
    }
  }
  throw new Error('dump failed');
}

function find(xml, pred) {
  for (const chunk of xml.split('<node ').slice(1)) {
    const text = (chunk.match(/text="([^"]*)"/) || [])[1] || '';
    const rid = (chunk.match(/resource-id="([^"]*)"/) || [])[1] || '';
    const b = chunk.match(/bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/);
    if (!b) continue;
    const node = { text, rid };
    if (!pred(node)) continue;
    return { x: Math.floor((+b[1] + +b[3]) / 2), y: Math.floor((+b[2] + +b[4]) / 2), rid };
  }
  return null;
}

function tap(hit) {
  if (hit) adbSh('shell', 'input', 'tap', String(hit.x), String(hit.y));
}

async function sessionHome() {
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
  adbSh('shell', 'am', 'force-stop', PKG);
  await sleep(500);
  spawnSync(adb, ['-s', S, 'shell', 'am', 'start', '-a', 'android.intent.action.VIEW', '-n', `${PKG}/.MainActivity`, '-d', `xevn://qa-login?${q.toString()}`]);
  await sleep(8000);
}

const results = {};

await sessionHome();
let xml = await dump('finish-home');
const closeFab = find(xml, (n) => /Đóng thao tác nhanh|Đóng/.test(n.text) || n.rid.includes('fab'));
if (xml.includes('fab-primary-action-sheet')) {
  tap(find(xml, (n) => n.text === 'Đóng') || find(xml, (n) => n.rid.includes('fab-primary')));
  await sleep(1500);
  xml = await dump('finish-home-closed');
}
results.jmob01_brand =
  xml.includes('home-top-bar-brand-accent') && xml.includes('dashboard-attendance-brand-bar');

tap(find(xml, (n) => /Thao tác nhanh/i.test(n.text)) || find(xml, (n) => n.rid.includes('fab')));
await sleep(2000);
xml = await dump('finish-fab-sheet');
results.jmob02_fab = xml.includes('fab-primary-action-sheet');

tap(find(xml, (n) => n.rid.includes('fab-action-check-in')) || find(xml, (n) => n.text === 'Chấm công'));
await sleep(2500);
xml = await dump('finish-checkin');

const face = find(xml, (n) => n.rid.includes('check-in-channel-face'));
if (face) {
  tap(face);
  await sleep(1500);
  xml = await dump('finish-mob04b-face');
}
results.mob04b_banner = xml.includes('face-mvp-honesty-banner');
results.mob04b_submit_disabled = /check-in-submit[^>]*enabled="false"/.test(xml.replace(/\s+/g, ' '));

tap(find(xml, (n) => n.rid.includes('check-in-channel-gps')) || find(xml, (n) => n.text === 'GPS'));
await sleep(800);
xml = await dump('finish-gps');
adbSh('logcat', '-c');
spawnSync(adb, ['-s', S, 'shell', 'logcat', '-G', '4M']);
const submit = find(xml, (n) => n.rid.includes('check-in-submit'));
const submitEnabled = submit && !/check-in-submit[^>]*enabled="false"/.test(xml.replace(/\s+/g, ' '));
if (submit && submitEnabled) {
  tap(submit);
  await sleep(7000);
  xml = await dump('finish-gps-after');
  const logcat = adbSh('logcat', '-d', '-t', '800');
  fs.writeFileSync(`${OUT}/finish-gps-logcat.txt`, logcat);
  results.mob04_post2xx =
    /attendance\/records.*(201|200)/i.test(logcat) ||
    /ReactNativeJS.*attendance.*(201|200|success)/i.test(logcat) ||
    /POST.*attendance\/records/i.test(logcat);
  results.mob04_logcat_snip = logcat.split('\n').filter((l) => /attendance|ReactNativeJS|hrm/i.test(l)).slice(0, 15).join('\n');
} else {
  results.mob04_post2xx = false;
  results.mob04_skip = submit ? 'submit disabled' : 'no submit';
}

fs.writeFileSync('docs/qa/evidence/_tmp-po-hrm-ui-brand-w4-mob-a-qa-01-r3-finish.json', JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
