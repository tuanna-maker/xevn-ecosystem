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
  let lastErr;
  for (let i = 0; i < 4; i++) {
    try {
      sh(`"${adb}" shell uiautomator dump /sdcard/qa-hier.xml`);
      sh(`"${adb}" pull /sdcard/qa-hier.xml ${OUT}/${n}.xml`);
      const shot = spawnSync(adb, ['exec-out', 'screencap', '-p'], { maxBuffer: 25e6, encoding: 'buffer' });
      if (shot.status === 0 && shot.stdout?.length) writeFileSync(`${OUT}/${n}.png`, shot.stdout);
      return readFileSync(`${OUT}/${n}.xml`, 'utf8');
    } catch (e) {
      lastErr = e;
      spawnSync(process.execPath, ['-e', 'Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,1200)']);
    }
  }
  throw lastErr;
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
await sleep(800);
spawnSync(
  adb,
  ['shell', 'am', 'start', '-a', 'android.intent.action.VIEW', '-n', `${PKG}/.MainActivity`, '-d', `xevn://qa-login?${q}`],
  { encoding: 'utf8' },
);
await sleep(4000);
let xml = dump('40-home-relogin');
const tiles = [...xml.matchAll(/resource-id="(home-action-tile-[^"]+)"/g)].map((m) => m[1]);
console.log(
  JSON.stringify({
    home: xml.includes('Trang chủ'),
    hasApproveId: xml.includes('home-action-tile-approve'),
    hasPhe: xml.includes('Phê duyệt'),
    tiles,
  }),
);
let hit =
  tapId(xml, 'home-action-tile-approve') ||
  tapText(xml, 'Phê duyệt') ||
  tapText(xml, 'Cần duyệt');
if (!hit) {
  sh(`"${adb}" shell input swipe 950 500 150 500 250`);
  await sleep(700);
  xml = dump('41-swipe');
  const tiles2 = [...xml.matchAll(/resource-id="(home-action-tile-[^"]+)"/g)].map((m) => m[1]);
  hit =
    tapId(xml, 'home-action-tile-approve') ||
    tapText(xml, 'Phê duyệt') ||
    tapText(xml, 'Cần duyệt');
  console.log(JSON.stringify({ tiles2, hit }));
} else {
  console.log(JSON.stringify({ hit }));
}
await sleep(2200);
xml = dump('42-approvals');
const leave = (xml.match(/Nghỉ phép\s*\((\d+)\)/) || [])[1] ?? null;
const all = (xml.match(/Tất cả\s*\((\d+)\)/) || [])[1] ?? null;
const empty = xml.includes('Không có đơn') || /Nghỉ phép\s*\(0\)/.test(xml);
const titleBits = [...xml.matchAll(/text="([^"]{2,40})"/g)]
  .map((m) => m[1])
  .filter((t) => /duyệt|Nghỉ|Tất|Phê|Cần/i.test(t))
  .slice(0, 25);
const out = { hit, leave, all, empty, tiles, titleBits, hasDuyet: xml.includes('Duyệt'), bytes: xml.length };
writeFileSync(`${OUT}/_approve-finish.json`, JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
