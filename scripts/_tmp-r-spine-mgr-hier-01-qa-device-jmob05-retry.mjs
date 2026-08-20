#!/usr/bin/env node
/** Retry: submit unpaid leave as nv0003 + confirm Gửi đơn; then nv0001 ManagerApprovals paths */
import { execSync, spawnSync } from 'node:child_process';
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const adb = process.env.LOCALAPPDATA + '\\Android\\Sdk\\platform-tools\\adb.exe';
const HOST = 'http://127.0.0.1:28001';
const EMU = 'http://10.0.2.2:28001';
const PKG = 'vn.xevn.hrm.mobile';
const OUT = 'docs/qa/evidence/screens/r-spine-mgr-hier-01-qa-device-jmob05';
const SUB_EMP = '2680f15f-02b6-44e1-8b42-92a6aaeb7bfb';
const MGR_EMP = '3796d949-4513-45c0-88fa-33030a062b17';
mkdirSync(OUT, { recursive: true });
const steps = [];

function sh(cmd) {
  return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}
function log(msg, extra = {}) {
  const row = { t: new Date().toISOString(), msg, ...extra };
  steps.push(row);
  console.log(JSON.stringify(row));
}
function dump(n) {
  sh(`"${adb}" shell uiautomator dump /sdcard/qa-jmob05.xml`);
  sh(`"${adb}" pull /sdcard/qa-jmob05.xml ${OUT}/${n}.xml`);
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

async function loginDeep(email) {
  const res = await fetch(`${HOST}/api/hrm/auth/mobile/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'xevn-uat-2026' }),
  });
  const j = await res.json();
  if (!j.success) throw new Error(JSON.stringify(j));
  const a = j.data.active_membership ?? j.data.memberships?.[0] ?? {};
  const session = {
    token: j.data.access_token,
    refresh: j.data.refresh_token ?? '',
    roles: j.data.roles,
    is_manager: j.data.is_manager,
    tenant: a.tenant_id,
    company: a.company_id ?? 'holding',
    uuid: a.company_uuid ?? '',
    emp: a.employee_id ?? '',
    company_label: a.company_label ?? '',
    tenant_label: a.tenant_label ?? '',
    role_label: a.role_label ?? '',
    job_title_label: a.job_title_label ?? '',
    employee_code: a.employee_code ?? '',
    employee_name: a.employee_name ?? '',
  };
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
  await sleep(4500);
  const deadline = Date.now() + 40000;
  while (Date.now() < deadline) {
    const xml = dump(`r-home-${email.split('@')[0]}`);
    if (xml.includes('Trang chủ') || xml.includes('home-action-tile')) return { session, xml };
    await sleep(1200);
  }
  throw new Error('home timeout ' + email);
}

const sub = await loginDeep('uat.nv0003@xe.vn');
let xml = sub.xml;
tapText(xml, 'Trang chủ');
await sleep(800);
xml = dump('r10-home');
let hit = tapId(xml, 'check-in-fab') || tapText(xml, 'Thao tác nhanh');
if (!hit) sh(`"${adb}" shell input tap 980 2100`);
await sleep(1200);
xml = dump('r11-fab');
hit = tapText(xml, 'Tạo đơn nghỉ') || tapId(xml, 'fab-action-create_leave');
log('create leave', { hit });
await sleep(2200);
xml = dump('r12-step0');
// dates already defaulted — next
hit = tapId(xml, 'leave-create-next') || tapText(xml, 'Tiếp tục');
log('step0', { hit });
await sleep(1800);
xml = dump('r13-step1');
// Prefer unpaid to avoid 0/0 annual balance soft-block UX
hit =
  tapText(xml, 'Nghỉ không lương') ||
  tapText(xml, 'không lương') ||
  tapText(xml, 'Nghỉ ốm') ||
  tapText(xml, 'Phép năm') ||
  tapText(xml, 'Nghỉ phép năm');
log('type', { hit });
await sleep(600);
xml = dump('r14-type');
hit = tapId(xml, 'leave-create-next') || tapText(xml, 'Tiếp tục');
log('step1 next', { hit });
await sleep(1800);
xml = dump('r15-step2');
hit = tapId(xml, 'leave-create-next') || tapText(xml, 'Tiếp tục');
log('step2 next', { hit });
await sleep(1800);
xml = dump('r16-step3');
hit = tapText(xml, 'Gửi đơn nghỉ');
log('submit CTA', { hit });
await sleep(1500);
xml = dump('r17-confirm');
// Prefer exact confirm button (not title)
hit = tapText(xml, 'Gửi đơn');
if (!hit) {
  // bounds from prior run [671,1459][831,1517]
  sh(`"${adb}" shell input tap 751 1488`);
  hit = { x: 751, y: 1488, fallback: true };
}
log('confirm Gui don', { hit });
await sleep(4000);
xml = dump('r18-after');
const submitOk =
  xml.includes('Thành công') ||
  xml.includes('thành công') ||
  xml.includes('Đã gửi') ||
  xml.includes('Chờ duyệt') ||
  xml.includes('Nghỉ phép của tôi') ||
  xml.includes('leave-requests');
tapText(xml, 'OK') || tapText(xml, 'Đóng');
await sleep(1000);
xml = dump('r19-final');
log('submitOk', { submitOk, stillConfirm: xml.includes('Gửi đơn nghỉ phép') });

const leave = await (
  await fetch(
    `${HOST}/api/hrm/attendance/leave-requests?status=pending&manager_employee_id=${MGR_EMP}&company_id=holding&page_size=30`,
    { headers: { Authorization: `Bearer ${sub.session.token}` } },
  )
).json();
// use mgr token for filter
const mgrLogin = await (
  await fetch(`${HOST}/api/hrm/auth/mobile/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'uat.nv0001@xe.vn', password: 'xevn-uat-2026' }),
  })
).json();
const leaveMgr = await (
  await fetch(
    `${HOST}/api/hrm/attendance/leave-requests?status=pending&manager_employee_id=${MGR_EMP}&company_id=holding&page_size=30`,
    { headers: { Authorization: `Bearer ${mgrLogin.data.access_token}` } },
  )
).json();
const fromSub = (leaveMgr.data?.data || []).filter((r) => r.employee_id === SUB_EMP);
log('api leave', { total: leaveMgr.data?.total, fromSub: fromSub.map((r) => ({ id: r.id, type: r.leave_type, status: r.status })) });

const mgr = await loginDeep('uat.nv0001@xe.vn');
xml = mgr.xml;
log('mgr persona', { roles: mgr.session.roles, is_manager: mgr.session.is_manager });
hit = tapId(xml, 'home-action-tile-approve');
await sleep(3000);
xml = dump('r30-pathA');
const thongBao = xml.includes('Thông báo');
const mgrScreen = xml.includes('manager-approvals-screen') || /Nghỉ phép\s*\(\d+\)/.test(xml);
log('pathA', { thongBao, mgrScreen });

const out = {
  submitOk,
  fromSubCount: fromSub.length,
  fromSub,
  leaveTotal: leaveMgr.data?.total,
  mgrRoles: mgr.session.roles,
  mgrIsManager: mgr.session.is_manager,
  pathA_thongBao: thongBao,
  pathA_managerApprovals: mgrScreen,
  steps,
};
writeFileSync(`${OUT}/_retry.json`, JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
process.exit(submitOk && fromSub.length > 0 ? 0 : 2);
