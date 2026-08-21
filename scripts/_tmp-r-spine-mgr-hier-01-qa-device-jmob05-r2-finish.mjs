#!/usr/bin/env node
/** Finish R2: confirm Duyệt dialog + API assert leave cleared */
import { execSync, spawnSync } from 'node:child_process';
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const adb = process.env.LOCALAPPDATA + '\\Android\\Sdk\\platform-tools\\adb.exe';
const HOST = 'http://127.0.0.1:28001';
const EMU = 'http://10.0.2.2:28001';
const PKG = 'vn.xevn.hrm.mobile';
const OUT = 'docs/qa/evidence/screens/r-spine-mgr-hier-01-qa-device-jmob05-r2';
const APPROVER = 'uat.nv0001@xe.vn';
const PASS = 'xevn-uat-2026';
const SUB_EMP = '2680f15f-02b6-44e1-8b42-92a6aaeb7bfb';
const MGR_EMP = '3796d949-4513-45c0-88fa-33030a062b17';
const HOLDING_UUID = '10000000-0000-4000-8000-000000000001';
const KNOWN = 'ac9db485-5d4f-4d77-9d25-114b157f70cf';
mkdirSync(OUT, { recursive: true });
const steps = [];
const startedAt = new Date().toISOString();

function sh(cmd) {
  return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}
function log(msg, extra = {}) {
  const row = { t: new Date().toISOString(), msg, ...extra };
  steps.push(row);
  console.log(JSON.stringify(row));
}
function dump(name) {
  sh(`"${adb}" shell uiautomator dump /sdcard/qa-jmob05-r2.xml`);
  sh(`"${adb}" pull /sdcard/qa-jmob05-r2.xml ${OUT}/${name}.xml`);
  const shot = spawnSync(adb, ['exec-out', 'screencap', '-p'], { maxBuffer: 25e6, encoding: 'buffer' });
  if (shot.status === 0 && shot.stdout?.length) writeFileSync(`${OUT}/${name}.png`, shot.stdout);
  return readFileSync(`${OUT}/${name}.xml`, 'utf8');
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
function tapExactText(xml, text) {
  const e = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return tap(xml, [
    `text="${e}"[^>]*bounds="\\[(\\d+),(\\d+)\\]\\[(\\d+),(\\d+)\\]"`,
    `content-desc="${e}"[^>]*bounds="\\[(\\d+),(\\d+)\\]\\[(\\d+),(\\d+)\\]"`,
  ]);
}
function texts(xml) {
  return [...xml.matchAll(/text="([^"]+)"/g)].map((m) => m[1]).filter((t) => t.length > 1 && t.length < 80);
}

async function apiLogin() {
  const j = await (
    await fetch(`${HOST}/api/hrm/auth/mobile/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: APPROVER, password: PASS }),
    })
  ).json();
  if (!j.success) throw new Error(JSON.stringify(j));
  const a = j.data.active_membership ?? j.data.memberships?.[0] ?? {};
  return {
    token: j.data.access_token,
    refresh: j.data.refresh_token ?? '',
    roles: j.data.roles,
    is_manager: j.data.is_manager,
    tenant: a.tenant_id ?? 'xevn',
    company: a.company_id ?? 'holding',
    uuid: a.company_uuid ?? HOLDING_UUID,
    emp: a.employee_id ?? MGR_EMP,
    company_label: a.company_label ?? '',
    tenant_label: a.tenant_label ?? '',
    role_label: a.role_label ?? '',
    job_title_label: a.job_title_label ?? '',
    employee_code: a.employee_code ?? '',
    employee_name: a.employee_name ?? '',
  };
}

async function leavePending(token) {
  const j = await (
    await fetch(
      `${HOST}/api/hrm/attendance/leave-requests?status=pending&manager_employee_id=${MGR_EMP}&company_id=holding&page_size=20`,
      { headers: { Authorization: `Bearer ${token}` } },
    )
  ).json();
  const rows = j.data?.data || [];
  return {
    total: j.data?.total ?? rows.length,
    rows,
    knownPending: rows.some((r) => r.id === KNOWN),
    fromSub: rows.filter((r) => r.employee_id === SUB_EMP).map((r) => r.id),
  };
}

async function loginDeep(session) {
  const q = new URLSearchParams({
    access_token: session.token,
    refresh_token: session.refresh,
    tenant_id: session.tenant,
    company_id: session.company,
    company_uuid: session.uuid,
    employee_id: session.emp,
    base_url: EMU,
    company_label: session.company_label,
    tenant_label: session.tenant_label,
    role_label: session.role_label,
    job_title_label: session.job_title_label,
    employee_code: session.employee_code,
    employee_name: session.employee_name,
  });
  sh(`"${adb}" shell am force-stop ${PKG}`);
  await sleep(700);
  spawnSync(
    adb,
    [
      'shell',
      'am',
      'start',
      '-a',
      'android.intent.action.VIEW',
      '-n',
      `${PKG}/.MainActivity`,
      '-d',
      `xevn://qa-login?${q}`,
    ],
    { encoding: 'utf8' },
  );
  await sleep(5000);
  const deadline = Date.now() + 40000;
  while (Date.now() < deadline) {
    const xml = dump('f-home');
    if (xml.includes('Trang chủ') || xml.includes('Chào buổi')) return xml;
    await sleep(1500);
  }
  return dump('f-home-fail');
}

const session = await apiLogin();
const before = await leavePending(session.token);
log('before', before);
if (!before.knownPending) {
  writeFileSync(
    `${OUT}/_finish.json`,
    JSON.stringify({ startedAt, verdict: 'BLOCKED', reason: 'known_leave_already_gone', before }, null, 2),
  );
  process.exit(3);
}

await loginDeep(session);
let xml = dump('f10-home');
tapExactText(xml, 'Trang chủ');
await sleep(800);
xml = dump('f11-home');
let hit =
  tap(xml, [/resource-id="home-action-tile-approve"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/]) ||
  tapExactText(xml, 'Duyệt');
log('open approvals', { hit });
await sleep(3000);
xml = dump('f20-approvals');
const mounted =
  /Nghỉ phép\s*\(\d+\)/.test(xml) && xml.includes('Duyệt') && xml.includes('Phê duyệt');
log('mounted', { mounted, sample: texts(xml).slice(0, 25) });
if (!mounted) {
  writeFileSync(
    `${OUT}/_finish.json`,
    JSON.stringify({ startedAt, verdict: 'FAIL', reason: 'approvals_not_mounted', steps }, null, 2),
  );
  process.exit(2);
}

// Prefer leave tab exact
tap(xml, [/text="Nghỉ phép \(\d+\)"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/]);
await sleep(1200);
xml = dump('f30-leave-tab');

// Tap Duyệt near UAT NV 0003
let duy = null;
if (xml.includes('UAT NV 0003')) {
  const idx = xml.indexOf('UAT NV 0003');
  const slice = xml.slice(idx, idx + 2500);
  duy =
    tap(slice, [/content-desc="Duyệt"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/]) ||
    tap(slice, [/text="Duyệt"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/]);
}
if (!duy) duy = tapExactText(xml, 'Duyệt');
log('row Duyệt', { duy });
await sleep(2000);
xml = dump('f40-confirm');

// Confirm dialog: MUST tap button content-desc="Duyệt" — not substring "Xác nhận…"
const hasDialog = xml.includes('Duyệt đơn?') || xml.includes('Xác nhận duyệt');
let confirm = null;
if (hasDialog) {
  confirm =
    tap(xml, [/content-desc="Duyệt"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/]) ||
    tap(xml, [
      /class="android.widget.Button"[^>]*content-desc="Duyệt"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/,
    ]) ||
    // Prefer right-side Duyệt button bounds from known dialog layout
    (() => {
      const m = xml.match(
        /content-desc="Duyệt"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/g,
      );
      // pick last Duyệt (dialog confirm) if multiple
      if (!m?.length) return null;
      const last = m[m.length - 1].match(/bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/);
      if (!last) return null;
      const x = Math.floor((+last[1] + +last[3]) / 2);
      const y = Math.floor((+last[2] + +last[4]) / 2);
      sh(`"${adb}" shell input tap ${x} ${y}`);
      return { x, y, via: 'last-Duyệt' };
    })();
  // Fallback coordinates from prior dump dialog Duyệt button [551,1425][951,1551]
  if (!confirm) {
    sh(`"${adb}" shell input tap 751 1488`);
    confirm = { x: 751, y: 1488, via: 'coord-fallback' };
  }
}
log('confirm', { hasDialog, confirm, sample: texts(xml).slice(0, 20) });
await sleep(4000);
xml = dump('f50-after-confirm');
const successUi =
  xml.includes('Thành công') ||
  xml.includes('đã duyệt') ||
  xml.includes('Đã duyệt') ||
  xml.includes('Duyệt thành công') ||
  xml.includes('Đã phê duyệt');
const hardFail =
  xml.includes('409') || xml.includes('HRM-ATT-REQ-203') || xml.includes('thất bại');
log('after confirm UI', { successUi, hardFail, sample: texts(xml).slice(0, 30) });

// dismiss toast if any
tapExactText(xml, 'OK') || tapExactText(xml, 'Đóng');
await sleep(800);

// F5
sh(`"${adb}" shell input swipe 540 500 540 1400 400`);
await sleep(2500);
xml = dump('f60-f5');
const leaveAfter = (xml.match(/Nghỉ phép\s*\((\d+)\)/) || [])[1] ?? null;
const allAfter = (xml.match(/Tất cả\s*\((\d+)\)/) || [])[1] ?? null;
const uat0003Still = xml.includes('UAT NV 0003') && xml.includes('Chờ duyệt');
log('f5', { leaveAfter, allAfter, uat0003Still, sample: texts(xml).slice(0, 30) });

const after = await leavePending(session.token);
log('after API', after);

const apiCleared = before.knownPending && !after.knownPending;
const queueDown =
  leaveAfter !== null && Number(leaveAfter) < (before.total ?? 2);
const pass = apiCleared && !hardFail && (successUi || queueDown || !uat0003Still);

const finishedAt = new Date().toISOString();
const run = {
  work_item_id: 'R-SPINE-MGR-HIER-01-QA-DEVICE-JMOB05-R2',
  phase: 'finish-confirm',
  startedAt,
  finishedAt,
  before,
  after,
  apiCleared,
  successUi,
  hardFail,
  leaveAfter,
  allAfter,
  uat0003Still,
  steps,
  verdict: pass ? 'PASS' : 'FAIL',
  ack_status: pass ? 'PASS_TO_PM' : 'FAIL_TO_PM',
};
writeFileSync(`${OUT}/_finish.json`, JSON.stringify(run, null, 2));
console.log(
  JSON.stringify(
    {
      verdict: run.verdict,
      ack_status: run.ack_status,
      apiCleared,
      successUi,
      leaveAfter,
      afterTotal: after.total,
      knownPending: after.knownPending,
    },
    null,
    2,
  ),
);
process.exit(pass ? 0 : 2);
