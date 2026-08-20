#!/usr/bin/env node
/** R4 MOB-04 retest — qa-login OBS session → check-in → GPS POST logcat */
import { execSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const adb = `${process.env.LOCALAPPDATA}\\Android\\Sdk\\platform-tools\\adb.exe`;
const S = 'emulator-5554';
const PKG = 'vn.xevn.hrm.mobile';
const OUT = 'docs/qa/evidence/screens/po-hrm-ui-brand-w4-mob-a-qa-01-r4';
const API = 'http://14.225.217.232:3001';
const JSON_OUT = 'docs/qa/evidence/_tmp-po-hrm-ui-brand-w4-mob-a-qa-01-r4-retest.json';

function adbSh(...a) {
  const r = spawnSync(adb, ['-s', S, ...a], { encoding: 'utf8', maxBuffer: 30e6, timeout: 90000 });
  if (r.status !== 0) throw new Error(String(r.stderr || r.stdout).slice(0, 500));
  return (r.stdout || '').trim();
}

async function dump(name) {
  for (let i = 0; i < 5; i++) {
    try {
      adbSh('shell', 'uiautomator', 'dump', '/sdcard/qa-r4r.xml');
      await sleep(350);
      execSync(`"${adb}" -s ${S} pull /sdcard/qa-r4r.xml "${OUT}/${name}.xml"`, { stdio: 'pipe' });
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

async function dismissPerms(xml) {
  const allow = find(xml, (n) => n.rid.includes('permission_allow_button') || n.text === 'Allow');
  if (allow) {
    tap(allow);
    await sleep(1500);
    return true;
  }
  const whileUsing = find(xml, (n) => /While using the app/i.test(n.text));
  if (whileUsing) {
    tap(whileUsing);
    await sleep(1500);
    return true;
  }
  return false;
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
  adbSh('shell', 'am', 'start', '-W', '-a', 'android.intent.action.VIEW', '-n', `${PKG}/.MainActivity`, '-d', `xevn://qa-login?${q.toString()}`);
  await sleep(10000);
}

const R = {};

await deeplink();
let xml = await dump('retest-home');
for (let i = 0; i < 4; i++) {
  if (!(await dismissPerms(xml))) break;
  xml = await dump(`retest-home-perm-${i}`);
}
if (xml.includes('fab-primary-action-sheet')) {
  tap(find(xml, (n) => n.text === 'Đóng'));
  await sleep(1500);
  xml = await dump('retest-home-closed');
}

const fabHit = find(xml, (n) => /Thao tác nhanh/i.test(n.text) || n.rid.includes('fab-primary'));
tap(fabHit);
await sleep(2000);
xml = await dump('retest-fab');

tap(find(xml, (n) => n.rid.includes('fab-action-check-in')) || find(xml, (n) => n.text === 'Chấm công'));
await sleep(3000);
xml = await dump('retest-checkin');
for (let i = 0; i < 3; i++) {
  if (!(await dismissPerms(xml))) break;
  xml = await dump(`retest-checkin-perm-${i}`);
}
R.checkin_has_gps = xml.includes('check-in-channel-gps');
R.checkin_has_submit = xml.includes('check-in-submit');

tap(find(xml, (n) => n.rid.includes('check-in-channel-gps')));
await sleep(1000);
xml = await dump('retest-gps');
adbSh('logcat', '-c');
const sub = find(xml, (n) => n.rid.includes('check-in-submit'));
const flat = xml.replace(/\s+/g, ' ');
const enabled = sub && !/check-in-submit[^>]*enabled="false"/.test(flat);
if (enabled) {
  tap(sub);
  await sleep(10000);
  xml = await dump('retest-gps-post');
  const log = adbSh('logcat', '-d', '-t', '1500');
  fs.writeFileSync(`${OUT}/retest-gps-logcat.txt`, log);
  R.mob04_post2xx =
    /attendance\/records.*(201|200|204)/i.test(log) ||
    /POST.*attendance.*(201|200)/i.test(log) ||
    /ReactNativeJS.*(201|200).*(attendance|record)/i.test(log);
  R.mob04_ui_success = /thành công|đã chấm|ghi nhận/i.test(xml);
  R.mob04_log_snip = log.split('\n').filter((l) => /attendance|ReactNativeJS|OkHttp|hrm/i.test(l)).slice(0, 25);
} else {
  R.mob04_post2xx = false;
  R.mob04_submit_disabled = true;
}

fs.writeFileSync(JSON_OUT, JSON.stringify(R, null, 2));
console.log(JSON.stringify(R, null, 2));
