#!/usr/bin/env node
import { execSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const adb = `${process.env.LOCALAPPDATA}\\Android\\Sdk\\platform-tools\\adb.exe`;
const SERIAL = 'emulator-5554';
const PKG = 'vn.xevn.hrm.mobile';
const API = 'http://14.225.217.232:3001';

function sh(args) {
  const r = spawnSync(adb, ['-s', SERIAL, ...args], { encoding: 'utf8', maxBuffer: 20e6 });
  return (r.stdout || '') + (r.stderr || '');
}

const manual = fs.readFileSync(`${process.env.TEMP}/qa-manual.xml`, 'utf8');
console.log('manual EditText', (manual.match(/EditText/g) || []).length);
console.log('manual login-email', manual.includes('login-email'));
console.log(
  'manual texts',
  [...manual.matchAll(/text="([^"]+)"/g)]
    .map((m) => m[1])
    .filter(Boolean)
    .slice(0, 20),
);

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
  employee_id: a.employee_id ?? '',
  base_url: API,
});
sh(['shell', 'am', 'force-stop', PKG]);
await sleep(800);
sh(['logcat', '-c']);
sh([
  'shell',
  'am',
  'start',
  '-a',
  'android.intent.action.VIEW',
  '-n',
  `${PKG}/.MainActivity`,
  '-d',
  `xevn://qa-login?${q.toString()}`,
]);
await sleep(12000);
sh(['shell', 'uiautomator', 'dump', '/sdcard/qa-dl.xml']);
execSync(`"${adb}" -s ${SERIAL} pull /sdcard/qa-dl.xml "${process.env.TEMP}/qa-dl.xml"`);
const dl = fs.readFileSync(`${process.env.TEMP}/qa-dl.xml`, 'utf8');
const texts = [...dl.matchAll(/text="([^"]+)"/g)].map((m) => m[1]).filter(Boolean);
console.log('deeplink home', texts.some((t) => /Trang chủ|Chào|Việc cần làm|Đi làm/.test(t)));
console.log('deeplink texts', texts.slice(0, 25));
console.log('brand ids', {
  homeAccent: dl.includes('home-top-bar-brand-accent'),
  statsBar: dl.includes('dashboard-attendance-brand-bar'),
  fab: dl.includes('fab-primary-action-sheet'),
});
const log = sh(['logcat', '-d', '-t', '100']);
console.log('logcat qa-login lines', log.split('\n').filter((l) => /qa-login|QA_LOGIN|deep.?link/i.test(l)).slice(0, 8));
