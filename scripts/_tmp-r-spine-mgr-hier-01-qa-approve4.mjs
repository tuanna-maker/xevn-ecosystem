#!/usr/bin/env node
import { execSync, spawnSync } from 'node:child_process';
import { writeFileSync, readFileSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const adb = process.env.LOCALAPPDATA + '\\Android\\Sdk\\platform-tools\\adb.exe';
const HOST = 'http://127.0.0.1:28001';
const EMU = 'http://10.0.2.2:28001';
const PKG = 'vn.xevn.hrm.mobile';
const OUT = 'docs/qa/evidence/screens/r-spine-mgr-hier-01-qa';

function sh(cmd) {
  return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}
function dump(n) {
  for (let i = 0; i < 5; i++) {
    try {
      sh(`"${adb}" shell uiautomator dump /sdcard/qa-hier.xml`);
      sh(`"${adb}" pull /sdcard/qa-hier.xml ${OUT}/${n}.xml`);
      const shot = spawnSync(adb, ['exec-out', 'screencap', '-p'], { maxBuffer: 25e6, encoding: 'buffer' });
      if (shot.status === 0 && shot.stdout?.length) writeFileSync(`${OUT}/${n}.png`, shot.stdout);
      return readFileSync(`${OUT}/${n}.xml`, 'utf8');
    } catch {
      awaitableSleep(1000);
    }
  }
  throw new Error('dump ' + n);
}
function awaitableSleep(ms) {
  spawnSync(process.execPath, ['-e', `Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,${ms})`]);
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
function textsOf(xml) {
  return [...xml.matchAll(/text="([^"]+)"/g)]
    .map((m) => m[1])
    .filter((t) => t.length > 1 && t.length < 70);
}

const res = await fetch(`${HOST}/api/hrm/auth/mobile/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'uat.nv0001@xe.vn', password: 'xevn-uat-2026' }),
});
const j = await res.json();
if (!j.success) {
  console.error(j);
  process.exit(2);
}
const d = j.data;
const a = d.active_membership ?? d.memberships?.[0] ?? {};
const q = new URLSearchParams({
  access_token: d.access_token,
  refresh_token: d.refresh_token ?? '',
  tenant_id: a.tenant_id,
  company_id: a.company_id ?? 'holding',
  company_uuid: a.company_uuid ?? '',
  employee_id: a.employee_id ?? '',
  base_url: EMU,
  company_label: a.company_label ?? '',
  tenant_label: a.tenant_label ?? '',
  role_label: a.role_label ?? '',
  job_title_label: a.job_title_label ?? '',
  employee_code: a.employee_code ?? '',
  employee_name: a.employee_name ?? '',
});
sh(`"${adb}" shell am force-stop ${PKG}`);
await sleep(900);
spawnSync(
  adb,
  ['shell', 'am', 'start', '-a', 'android.intent.action.VIEW', '-n', `${PKG}/.MainActivity`, '-d', `xevn://qa-login?${q}`],
  { encoding: 'utf8' },
);
await sleep(4500);
let xml = dump('60-home');
console.log(JSON.stringify({ home: xml.includes('Trang chủ'), tiles: [...xml.matchAll(/resource-id="(home-action-tile-[^"]+)"/g)].map((m) => m[1]) }));
const hit = tapId(xml, 'home-action-tile-approve');
console.log('hit', hit);
if (!hit) process.exit(1);

for (const [i, waitMs] of [
  [61, 3000],
  [62, 5000],
  [63, 5000],
]) {
  await sleep(waitMs);
  xml = dump(`${i}-approve`);
  const texts = textsOf(xml);
  const leave = (xml.match(/Nghỉ phép\s*\((\d+)\)/) || [])[1] ?? null;
  const all = (xml.match(/Tất cả\s*\((\d+)\)/) || [])[1] ?? null;
  const empty =
    xml.includes('Không có đơn nghỉ phép chờ duyệt') ||
    xml.includes('Không có đơn') ||
    /Nghỉ phép\s*\(0\)/.test(xml) ||
    texts.some((t) => /không có/i.test(t));
  const out = {
    waitMs,
    leave,
    all,
    empty,
    loading: xml.includes('Đang tải'),
    hasDuyet: xml.includes('Duyệt'),
    texts: texts.slice(0, 40),
  };
  console.log(JSON.stringify(out));
  writeFileSync(`${OUT}/_approve-finish.json`, JSON.stringify(out, null, 2));
  if (!out.loading && (leave !== null || empty || out.hasDuyet || texts.some((t) => /Nghỉ|Phê|Cần duyệt|chờ/i.test(t)))) {
    break;
  }
}
