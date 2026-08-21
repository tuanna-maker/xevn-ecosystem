#!/usr/bin/env node
/**
 * R-SPINE-MGR-HIER-01-QA — Option A device discovery + J-MOB-05 path
 * U65: no seed. Approver = uat.nv0001 (NOT ceo).
 */
import { execSync, spawnSync } from 'node:child_process';
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const adb = process.env.LOCALAPPDATA + '\\Android\\Sdk\\platform-tools\\adb.exe';
const HOST_API = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
const EMU_API = process.env.HRM_EMU_API || 'http://10.0.2.2:28001';
const PKG = 'vn.xevn.hrm.mobile';
const OUT = 'docs/qa/evidence/screens/r-spine-mgr-hier-01-qa';
const APPROVER = 'uat.nv0001@xe.vn';
const PASS = 'xevn-uat-2026';
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
function dump(name) {
  sh(`"${adb}" shell uiautomator dump /sdcard/qa-hier.xml`);
  sh(`"${adb}" pull /sdcard/qa-hier.xml ${OUT}/${name}.xml`);
  const shot = spawnSync(adb, ['exec-out', 'screencap', '-p'], { maxBuffer: 25e6, encoding: 'buffer' });
  if (shot.status === 0 && shot.stdout?.length) writeFileSync(`${OUT}/${name}.png`, shot.stdout);
  return readFileSync(`${OUT}/${name}.xml`, 'utf8');
}
function findBounds(xml, pattern) {
  const m = xml.match(pattern);
  if (!m) return null;
  return { x: Math.floor((+m[1] + +m[3]) / 2), y: Math.floor((+m[2] + +m[4]) / 2) };
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
    `content-desc="[^"]*${e}[^"]*"[^>]*bounds="\\[(\\d+),(\\d+)\\]\\[(\\d+),(\\d+)\\]"`,
    `text="[^"]*${e}[^"]*"[^>]*bounds="\\[(\\d+),(\\d+)\\]\\[(\\d+),(\\d+)\\]"`,
  ]);
}
function tapId(xml, id) {
  const e = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return tap(xml, [`resource-id="${e}"[^>]*bounds="\\[(\\d+),(\\d+)\\]\\[(\\d+),(\\d+)\\]"`]);
}

async function dismissPerm() {
  try {
    const xml = dump('_perm');
    if (!xml.includes('permissioncontroller')) return;
    const deny =
      findBounds(
        xml,
        /resource-id="com\.android\.permissioncontroller:id\/permission_deny_button"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/,
      ) ??
      findBounds(xml, /text="Don't allow"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/) ??
      findBounds(xml, /text="Không cho phép"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/);
    if (deny) {
      sh(`"${adb}" shell input tap ${deny.x} ${deny.y}`);
      await sleep(800);
    }
  } catch {
    /* ignore */
  }
}

async function loginDeep(email) {
  const res = await fetch(`${HOST_API}/api/hrm/auth/mobile/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: PASS }),
  });
  const j = await res.json();
  if (!j.success) throw new Error(`login fail ${email}: ${j.code || res.status}`);
  const d = j.data;
  const a = d.active_membership ?? d.memberships?.[0] ?? {};
  const session = {
    token: d.access_token,
    refresh: d.refresh_token ?? '',
    tenant: a.tenant_id ?? d.default_tenant_id,
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
  writeFileSync(`${OUT}/_session-${email.split('@')[0]}.json`, JSON.stringify({ ...session, email }, null, 2));
  const q = new URLSearchParams({
    access_token: session.token,
    refresh_token: session.refresh,
    tenant_id: session.tenant,
    company_id: session.company,
    company_uuid: session.uuid,
    employee_id: session.emp,
    base_url: EMU_API,
    company_label: session.company_label,
    tenant_label: session.tenant_label,
    role_label: session.role_label,
    job_title_label: session.job_title_label,
    employee_code: session.employee_code,
    employee_name: session.employee_name,
  });
  const deep = `xevn://qa-login?${q.toString()}`;
  sh(`"${adb}" shell am force-stop ${PKG}`);
  await sleep(700);
  const r = spawnSync(
    adb,
    ['shell', 'am', 'start', '-a', 'android.intent.action.VIEW', '-n', `${PKG}/.MainActivity`, '-d', deep],
    { encoding: 'utf8' },
  );
  if (r.status !== 0) throw new Error(r.stderr || r.stdout || 'am start fail');
  await sleep(3500);
  await dismissPerm();
  const markers = ['Chào buổi', 'Trang chủ', 'Xin chào', 'Việc cần làm', 'Đồng nghiệp', 'Thông báo'];
  const deadline = Date.now() + 40000;
  while (Date.now() < deadline) {
    await dismissPerm();
    const xml = dump(`home-${email.split('@')[0]}`);
    const hit = markers.find((m) => xml.includes(m));
    if (hit) return { ok: true, hit, session, xml };
    await sleep(1500);
  }
  return { ok: false, hit: null, session, xml: '' };
}

async function openTeam(xml0) {
  let xml = xml0;
  let hit =
    tapId(xml, 'home-action-tile-team') ||
    tapText(xml, 'Đội nhóm') ||
    tapText(xml, 'Đồng nghiệp') ||
    tapText(xml, 'Team');
  log('open team', { hit });
  await sleep(2000);
  xml = dump('10-team');
  // tab Đội nhóm if bottom nav
  if (!xml.includes('team-directory') && !xml.includes('Đội nhóm')) {
    hit = tapText(xml, 'Đội nhóm') || tapId(xml, 'tab-team');
    log('tab team', { hit });
    await sleep(1500);
    xml = dump('11-team-tab');
  }
  return xml;
}

async function openApprovals(xml0) {
  let xml = xml0;
  tapText(xml, 'Trang chủ');
  await sleep(1000);
  xml = dump('20-home-before-approve');
  let hit =
    tapId(xml, 'home-action-tile-approve') ||
    tapText(xml, 'Phê duyệt') ||
    tapText(xml, 'Cần duyệt');
  log('open approvals', { hit });
  await sleep(2000);
  xml = dump('21-approvals');
  return xml;
}

// --- API discovery (read-only) ---
const loginRes = await fetch(`${HOST_API}/api/hrm/auth/mobile/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: APPROVER, password: PASS }),
});
const loginJ = await loginRes.json();
if (!loginJ.success) {
  console.error(JSON.stringify({ phase: 'api_login', fail: true, loginJ }));
  process.exit(2);
}
const a = loginJ.data.active_membership ?? loginJ.data.memberships?.[0] ?? {};
const mgrEmp = a.employee_id;
const token = loginJ.data.access_token;
const all = [];
let cursor = null;
for (let pages = 0; pages < 30; pages++) {
  let url = `${HOST_API}/api/hrm/employees?company_id=holding`;
  if (cursor) url += `&cursor=${encodeURIComponent(cursor)}`;
  const body = await (await fetch(url, { headers: { Authorization: `Bearer ${token}` } })).json();
  const rows = body.data?.data || [];
  all.push(...rows);
  cursor = body.data?.next_cursor || null;
  if (!cursor || rows.length === 0) break;
}
const reports = all.filter((e) => e.manager_id === mgrEmp);
const withMgr = all.filter((e) => e.manager_id);
const leaveProbe = await (
  await fetch(
    `${HOST_API}/api/hrm/attendance/leave-requests?status=pending&manager_employee_id=${mgrEmp}&company_id=holding`,
    { headers: { Authorization: `Bearer ${token}` } },
  )
).json();
const discovery = {
  mgrEmp,
  code: a.employee_code,
  scanned: all.length,
  with_manager_id: withMgr.length,
  report_count: reports.length,
  reports: reports.map((e) => ({ id: e.id, code: e.employee_code, email: e.email, name: e.full_name })),
  leave_pending_for_mgr: leaveProbe.data?.total ?? null,
};
writeFileSync(`${OUT}/_discovery.json`, JSON.stringify(discovery, null, 2));
log('discovery', discovery);

// Device: login approver → Team directory visual confirm
const home = await loginDeep(APPROVER);
log('approver home', { ok: home.ok, hit: home.hit, emp: home.session.emp, uuid: home.session.uuid });
if (!home.ok) {
  writeFileSync(`${OUT}/_run.json`, JSON.stringify({ verdict: 'FAIL', reason: 'approver_login_home', steps }, null, 2));
  process.exit(1);
}
const teamXml = await openTeam(home.xml);
const teamHasRows =
  /uat\.nv\d+@|UAT-\d+|HLD-\d+|team-directory-row|employee-row/i.test(teamXml) ||
  (teamXml.match(/text="[^"]{3,}"/g) || []).length > 40;
log('team directory', {
  hasTeamMarkers: /team-directory|Đội nhóm|Đồng nghiệp/.test(teamXml),
  teamHasRows,
  xmlBytes: teamXml.length,
});

const approvalsXml = await openApprovals(dump('19-pre-approve-nav'));
const leaveTabCount = (approvalsXml.match(/Nghỉ phép\s*\((\d+)\)/) || [])[1] ?? null;
const emptyCopy = approvalsXml.includes('Không có đơn nghỉ phép chờ duyệt') || /Nghỉ phép\s*\(0\)/.test(approvalsXml);
log('approvals state', { leaveTabCount, emptyCopy, hasDuyet: approvalsXml.includes('Duyệt') });

const verdict =
  discovery.report_count === 0
    ? 'BLOCKED'
    : emptyCopy && Number(leaveTabCount || 0) === 0
      ? 'BLOCKED'
      : 'CONTINUE_APPROVE';

writeFileSync(
  `${OUT}/_run.json`,
  JSON.stringify(
    {
      verdict,
      discovery,
      device: { home_ok: home.ok, leaveTabCount, emptyCopy, company_uuid: home.session.uuid },
      u65: true,
      approver: APPROVER,
      not_used: 'ceo@xe.vn',
      steps,
    },
    null,
    2,
  ),
);
console.log(JSON.stringify({ verdict, report_count: discovery.report_count, leave_pending_for_mgr: discovery.leave_pending_for_mgr }, null, 2));
process.exit(verdict === 'FAIL' ? 1 : 0);
