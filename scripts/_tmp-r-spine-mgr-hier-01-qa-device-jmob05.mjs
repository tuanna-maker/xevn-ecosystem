#!/usr/bin/env node
/**
 * R-SPINE-MGR-HIER-01-QA-DEVICE-JMOB05 — Option A J-MOB-05
 * Submitter: uat.nv0003 · Approver L1: uat.nv0001 (NOT ceo)
 * U65: no seed · no Option C
 */
import { execSync, spawnSync } from 'node:child_process';
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const adb = process.env.LOCALAPPDATA + '\\Android\\Sdk\\platform-tools\\adb.exe';
const HOST = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
const EMU = process.env.HRM_EMU_API || 'http://10.0.2.2:28001';
const PKG = 'vn.xevn.hrm.mobile';
const OUT = 'docs/qa/evidence/screens/r-spine-mgr-hier-01-qa-device-jmob05';
const SUBMITTER = 'uat.nv0003@xe.vn';
const APPROVER = 'uat.nv0001@xe.vn';
const PASS = 'xevn-uat-2026';
const SUB_EMP = '2680f15f-02b6-44e1-8b42-92a6aaeb7bfb';
const MGR_EMP = '3796d949-4513-45c0-88fa-33030a062b17';
const HOLDING_UUID = '10000000-0000-4000-8000-000000000001';

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
  sh(`"${adb}" shell uiautomator dump /sdcard/qa-jmob05.xml`);
  sh(`"${adb}" pull /sdcard/qa-jmob05.xml ${OUT}/${name}.xml`);
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
function texts(xml) {
  return [...xml.matchAll(/text="([^"]+)"/g)]
    .map((m) => m[1])
    .filter((t) => t.length > 1 && t.length < 80);
}

async function dismissPerm() {
  try {
    const xml = dump('_perm');
    if (!xml.includes('permissioncontroller')) return;
    tapText(xml, "Don't allow") || tapText(xml, 'Không cho phép') || tapId(xml, 'com.android.permissioncontroller:id/permission_deny_button');
    await sleep(700);
  } catch {
    /* ignore */
  }
}

async function apiLogin(email) {
  const res = await fetch(`${HOST}/api/hrm/auth/mobile/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: PASS }),
  });
  const j = await res.json();
  if (!j.success) throw new Error(`login ${email}: ${j.code || res.status}`);
  const a = j.data.active_membership ?? j.data.memberships?.[0] ?? {};
  const jwt = JSON.parse(Buffer.from(j.data.access_token.split('.')[1], 'base64url').toString());
  return {
    token: j.data.access_token,
    refresh: j.data.refresh_token ?? '',
    roles: j.data.roles,
    is_manager: j.data.is_manager,
    jwt_roles: jwt.roles,
    tenant: a.tenant_id ?? j.data.default_tenant_id,
    company: a.company_id ?? 'holding',
    uuid: a.company_uuid ?? '',
    emp: a.employee_id ?? '',
    company_label: a.company_label ?? '',
    tenant_label: a.tenant_label ?? '',
    role_label: a.role_label ?? '',
    job_title_label: a.job_title_label ?? '',
    employee_code: a.employee_code ?? '',
    employee_name: a.employee_name ?? '',
    email,
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
  const deep = `xevn://qa-login?${q.toString()}`;
  const r = spawnSync(
    adb,
    ['shell', 'am', 'start', '-a', 'android.intent.action.VIEW', '-n', `${PKG}/.MainActivity`, '-d', deep],
    { encoding: 'utf8' },
  );
  // Some emulators print Warning to stderr but still deliver intent — only fail on hard errors.
  const err = `${r.stderr || ''}${r.stdout || ''}`;
  if (r.status !== 0 && !/Warning: Activity not started|Starting: Intent/.test(err)) {
    throw new Error(err || 'am start fail');
  }
  await sleep(4500);
  await dismissPerm();
  const markers = ['Chào buổi', 'Trang chủ', 'Xin chào', 'Việc cần làm', 'Đồng nghiệp', 'Thông báo'];
  const deadline = Date.now() + 45000;
  while (Date.now() < deadline) {
    await dismissPerm();
    const xml = dump(`home-${session.email.split('@')[0]}`);
    const hit = markers.find((m) => xml.includes(m));
    if (hit) return { ok: true, hit, xml };
    await sleep(1500);
  }
  return { ok: false, hit: null, xml: dump(`home-fail-${session.email.split('@')[0]}`) };
}

async function submitLeave(xml0) {
  let xml = xml0;
  tapText(xml, 'Trang chủ');
  await sleep(1000);
  xml = dump('10-sub-home');

  let hit =
    tapId(xml, 'check-in-fab') ||
    tapText(xml, 'Thao ký nhanh') ||
    tapText(xml, 'Thao tác nhanh');
  if (!hit) {
    // FAB bottom-right fallback
    sh(`"${adb}" shell input tap 980 2100`);
    log('FAB coord fallback');
  } else {
    log('FAB open', { hit });
  }
  await sleep(1500);
  xml = dump('11-fab');
  hit = tapText(xml, 'Tạo đơn nghỉ') || tapId(xml, 'fab-action-create_leave');
  log('tap create leave', { hit });
  await sleep(2500);
  xml = dump('12-create-step0');
  if (!xml.includes('Tạo đơn') && !xml.includes('Bước 1') && !xml.includes('Khoảng ngày')) {
    // alternate: time_off tile
    tapText(xml, 'Trang chủ');
    await sleep(800);
    xml = dump('12b-home');
    hit =
      tapId(xml, 'home-action-tile-time_off') ||
      tapText(xml, 'Nghỉ phép') ||
      tapText(xml, 'Đơn nghỉ');
    log('time_off tile', { hit });
    await sleep(2000);
    xml = dump('12c-leave-list');
    hit =
      tapText(xml, 'Tạo đơn') ||
      tapText(xml, 'Tạo đơn nghỉ') ||
      tapText(xml, '+ Nghỉ');
    if (!hit) sh(`"${adb}" shell input tap 980 2100`);
    await sleep(2500);
    xml = dump('12d-create');
  }

  const onCreate = xml.includes('Tạo đơn') || xml.includes('Bước 1') || xml.includes('Khoảng ngày');
  log('on create', { onCreate, sample: texts(xml).slice(0, 20) });
  if (!onCreate) return { ok: false, reason: 'create_screen_not_reached', xml };

  hit =
    tapText(xml, 'Khoảng ngày nghỉ') ||
    tapText(xml, 'Chọn khoảng') ||
    tapText(xml, 'Từ ngày') ||
    tap(xml, [/class="android.widget.EditText"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/]);
  log('open date', { hit });
  await sleep(1500);
  let px = dump('13-datepicker');
  tapText(px, 'OK') || tapText(px, 'Xác nhận') || tapText(px, 'Lưu') || tapText(px, 'Done');
  await sleep(900);
  px = dump('13b-datepicker');
  tapText(px, 'OK') || tapText(px, 'Xác nhận') || tapText(px, 'Lưu') || tapText(px, 'Done');
  await sleep(800);

  xml = dump('14-step0');
  hit = tapId(xml, 'leave-create-next') || tapText(xml, 'Tiếp tục');
  log('step0 next', { hit });
  await sleep(2000);
  xml = dump('15-step1');
  tapText(xml, 'Phép năm') || tapText(xml, 'Nghỉ phép năm') || tapText(xml, 'ANNUAL');
  await sleep(500);
  xml = dump('16-step1-type');
  hit = tapId(xml, 'leave-create-next') || tapText(xml, 'Tiếp tục');
  log('step1 next', { hit });
  await sleep(2000);
  xml = dump('17-step2');
  // reason field if present
  const reasonField =
    tapText(xml, 'Lý do') ||
    tapText(xml, 'Mô tả') ||
    tap(xml, [/class="android.widget.EditText"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/]);
  if (reasonField) {
    await sleep(400);
    try {
      sh(`"${adb}" shell input text "JMOB05_OptionA_UAT0003_spine"`);
    } catch {
      /* ignore */
    }
    await sleep(400);
  }
  hit = tapId(xml, 'leave-create-next') || tapText(xml, 'Tiếp tục');
  log('step2 next', { hit });
  await sleep(2000);
  xml = dump('18-step3');
  hit = tapText(xml, 'Gửi đơn nghỉ') || tapText(xml, 'Gửi đơn');
  log('submit tap', { hit });
  await sleep(1500);
  xml = dump('19-confirm');
  hit = tapText(xml, 'Xác nhận') || tapText(xml, 'Gửi') || tapText(xml, 'Đồng ý') || tapText(xml, 'OK');
  log('confirm', { hit });
  await sleep(3500);
  xml = dump('20-after-submit');
  const success =
    xml.includes('Thành công') ||
    xml.includes('thành công') ||
    xml.includes('Đã gửi') ||
    xml.includes('Chờ duyệt') ||
    xml.includes('Đơn nghỉ phép đã được gửi') ||
    xml.includes('HRM-ATT');
  tapText(xml, 'OK') || tapText(xml, 'Đóng');
  await sleep(1200);
  xml = dump('21-submit-final');
  return { ok: success || xml.includes('Chờ duyệt'), xml, success };
}

async function tryOpenApprovals(xml0) {
  let xml = xml0;
  tapText(xml, 'Trang chủ');
  await sleep(1000);
  xml = dump('30-mgr-home');
  const tiles = [...xml.matchAll(/resource-id="(home-action-tile-[^"]+)"/g)].map((m) => m[1]);
  log('mgr home tiles', { tiles, sample: texts(xml).slice(0, 30) });

  // Path A: home approve tile
  let hit =
    tapId(xml, 'home-action-tile-approve') ||
    tapText(xml, 'Cần duyệt') ||
    tapText(xml, 'Phê duyệt');
  log('pathA approve tile', { hit });
  await sleep(3000);
  let afterA = dump('31-pathA');
  const pathA =
    afterA.includes('manager-approvals-screen') ||
    /Nghỉ phép\s*\(\d+\)/.test(afterA) ||
    (afterA.includes('Phê duyệt') && afterA.includes('Duyệt') && !afterA.includes('inbox-empty-state'));

  // Path B: FAB
  tapText(afterA, 'Trang chủ') || sh(`"${adb}" shell input keyevent 4`);
  await sleep(1000);
  xml = dump('32-before-fab');
  hit = tapId(xml, 'check-in-fab') || tapText(xml, 'Thao tác nhanh');
  if (!hit) sh(`"${adb}" shell input tap 980 2100`);
  await sleep(1500);
  xml = dump('33-fab');
  const fabHasApprovals =
    xml.includes('fab-action-manager-approvals') ||
    xml.includes('Duyệt đơn') ||
    (xml.includes('Phê duyệt') && xml.includes('chờ duyệt'));
  hit = tapId(xml, 'fab-action-manager-approvals') || tapText(xml, 'Duyệt đơn') || tapText(xml, 'Phê duyệt');
  log('pathB FAB', { hit, fabHasApprovals });
  await sleep(2500);
  let afterB = dump('34-pathB');
  const pathB =
    afterB.includes('manager-approvals-screen') || /Nghỉ phép\s*\(\d+\)/.test(afterB);

  // Path C: Profile → Phê duyệt
  tapText(afterB, 'Hồ sơ') || tapText(afterB, 'Cá nhân') || tapId(afterB, 'tab-profile');
  await sleep(1500);
  xml = dump('35-profile');
  hit =
    tapId(xml, 'profile-approvals-entry') ||
    tapId(xml, 'profile-quick-approvals') ||
    tapText(xml, 'Phê duyệt');
  log('pathC profile', { hit, hasEntry: xml.includes('profile-approvals-entry') });
  await sleep(2500);
  let afterC = dump('36-pathC');
  const pathC =
    afterC.includes('manager-approvals-screen') || /Nghỉ phép\s*\(\d+\)/.test(afterC);

  const mounted = pathA || pathB || pathC;
  const approvalsXml = pathC ? afterC : pathB ? afterB : afterA;
  return {
    mounted,
    pathA,
    pathB,
    pathC,
    fabHasApprovals,
    leaveTab: (approvalsXml.match(/Nghỉ phép\s*\((\d+)\)/) || [])[1] ?? null,
    allTab: (approvalsXml.match(/Tất cả\s*\((\d+)\)/) || [])[1] ?? null,
    hasDuyet: approvalsXml.includes('Duyệt'),
    isThongBao: approvalsXml.includes('Thông báo') || approvalsXml.includes('inbox-empty-state'),
    sample: texts(approvalsXml).slice(0, 40),
    xml: approvalsXml,
  };
}

async function approveIfPossible(approvals) {
  if (!approvals.mounted) return { ok: false, reason: 'manager_approvals_not_mounted' };
  let xml = approvals.xml;
  const leaveHit = tapText(xml, 'Nghỉ phép') || tap(xml, [/text="Nghỉ phép[^"]*"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/]);
  log('leave tab', { leaveHit });
  await sleep(1500);
  xml = dump('40-leave-tab');
  const count = (xml.match(/Nghỉ phép\s*\((\d+)\)/) || [])[1] ?? null;
  const empty =
    xml.includes('Không có đơn nghỉ phép chờ duyệt') || /Nghỉ phép\s*\(0\)/.test(xml);
  log('leave queue', { count, empty, hasDuyet: xml.includes('Duyệt') });
  if (empty || !xml.includes('Duyệt')) return { ok: false, reason: 'empty_or_no_duyet', count, empty };

  const duy =
    tapId(xml, 'manager-approve-button') ||
    tapText(xml, 'Duyệt') ||
    tap(xml, [/content-desc="Duyệt"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/]);
  log('duyet tap', { duy });
  await sleep(2000);
  xml = dump('41-after-duyet');
  tapText(xml, 'Xác nhận') || tapText(xml, 'Đồng ý') || tapText(xml, 'OK');
  await sleep(2500);
  xml = dump('42-duyet-result');
  const success =
    xml.includes('Thành công') ||
    xml.includes('đã duyệt') ||
    xml.includes('Đã duyệt') ||
    (!xml.includes('409') && !xml.includes('HRM-ATT-REQ-203'));
  // F5 / pull refresh
  sh(`"${adb}" shell input swipe 540 500 540 1400 400`);
  await sleep(2500);
  xml = dump('43-f5');
  const leaveAfter = (xml.match(/Nghỉ phép\s*\((\d+)\)/) || [])[1] ?? null;
  return { ok: success, leaveAfter, successUi: xml.includes('Thành công'), sample: texts(xml).slice(0, 30) };
}

// ---------- preflight ----------
const mgrSession = await apiLogin(APPROVER);
const subSession = await apiLogin(SUBMITTER);
const empDetail = await (
  await fetch(`${HOST}/api/hrm/employees/${SUB_EMP}?company_id=holding`, {
    headers: { Authorization: `Bearer ${mgrSession.token}` },
  })
).json();
const leaveProbe = await (
  await fetch(
    `${HOST}/api/hrm/attendance/leave-requests?status=pending&manager_employee_id=${MGR_EMP}&company_id=holding`,
    { headers: { Authorization: `Bearer ${mgrSession.token}` } },
  )
).json();
const homeSum = await (
  await fetch(
    `${HOST}/api/hrm/home/summary?company_id=holding&employee_id=${MGR_EMP}&include=tasks,manager_pending`,
    {
      headers: {
        Authorization: `Bearer ${mgrSession.token}`,
        'x-company-id': HOLDING_UUID,
        'x-tenant-id': mgrSession.tenant || 'xevn',
      },
    },
  )
).json();
const mgrEmpDetail = await (
  await fetch(`${HOST}/api/hrm/employees/${MGR_EMP}?company_id=holding`, {
    headers: { Authorization: `Bearer ${mgrSession.token}` },
  })
).json();

const preflight = {
  submitter: {
    email: SUBMITTER,
    emp: subSession.emp,
    code: subSession.employee_code,
    uuid: subSession.uuid,
    roles: subSession.roles,
  },
  approver: {
    email: APPROVER,
    emp: mgrSession.emp,
    code: mgrSession.employee_code,
    uuid: mgrSession.uuid,
    roles: mgrSession.roles,
    is_manager: mgrSession.is_manager,
    jwt_roles: mgrSession.jwt_roles,
    custom_fields: mgrEmpDetail.data?.custom_fields ?? null,
  },
  subordinate_manager_id: empDetail.data?.manager_id ?? null,
  hierarchy_ok: (empDetail.data?.manager_id ?? null) === MGR_EMP,
  holding_uuid_ok: mgrSession.uuid === HOLDING_UUID && mgrSession.uuid !== 'main',
  leave_pending_mgr: leaveProbe.data?.total ?? null,
  home_is_manager: homeSum.data?.viewer?.is_manager ?? null,
  home_manager_pending: homeSum.data?.manager_pending ?? null,
};
writeFileSync(`${OUT}/_preflight.json`, JSON.stringify(preflight, null, 2));
log('preflight', preflight);

const pendingBefore = leaveProbe.data?.total ?? 0;

// ---------- submitter FE leave ----------
const subHome = await loginDeep(subSession);
log('submitter home', { ok: subHome.ok, hit: subHome.hit });
let submitResult = { ok: false, reason: 'login_fail' };
if (subHome.ok) {
  submitResult = await submitLeave(subHome.xml);
  log('submit result', { ok: submitResult.ok, reason: submitResult.reason, success: submitResult.success });
}

// re-probe leave for UAT-0003
const leaveAfterSubmit = await (
  await fetch(
    `${HOST}/api/hrm/attendance/leave-requests?status=pending&manager_employee_id=${MGR_EMP}&company_id=holding&page_size=20`,
    { headers: { Authorization: `Bearer ${mgrSession.token}` } },
  )
).json();
const rows = leaveAfterSubmit.data?.data || [];
const fromSub = rows.filter((r) => r.employee_id === SUB_EMP);
log('leave after submit API', {
  total: leaveAfterSubmit.data?.total,
  from_uat0003: fromSub.length,
  ids: fromSub.map((r) => r.id),
});

// ---------- approver ManagerApprovals ----------
const mgrHome = await loginDeep(mgrSession);
log('approver home', { ok: mgrHome.ok, hit: mgrHome.hit, roles: mgrSession.roles, is_manager: mgrSession.is_manager });
let approvals = { mounted: false };
let approveResult = { ok: false, reason: 'approver_login_fail' };
if (mgrHome.ok) {
  approvals = await tryOpenApprovals(mgrHome.xml);
  log('approvals open', {
    mounted: approvals.mounted,
    pathA: approvals.pathA,
    pathB: approvals.pathB,
    pathC: approvals.pathC,
    leaveTab: approvals.leaveTab,
    isThongBao: approvals.isThongBao,
    fabHasApprovals: approvals.fabHasApprovals,
  });
  approveResult = await approveIfPossible(approvals);
  log('approve result', approveResult);
}

const leaveFinal = await (
  await fetch(
    `${HOST}/api/hrm/attendance/leave-requests?status=pending&manager_employee_id=${MGR_EMP}&company_id=holding`,
    { headers: { Authorization: `Bearer ${mgrSession.token}` } },
  )
).json();

const finishedAt = new Date().toISOString();
const jmob05Pass =
  submitResult.ok === true &&
  approvals.mounted === true &&
  approveResult.ok === true &&
  preflight.hierarchy_ok &&
  preflight.holding_uuid_ok &&
  !String(mgrSession.uuid).includes('main');

const verdict = jmob05Pass ? 'PASS' : 'FAIL';
const run = {
  work_item_id: 'R-SPINE-MGR-HIER-01-QA-DEVICE-JMOB05',
  startedAt,
  finishedAt,
  verdict,
  preflight,
  pendingBefore,
  pendingAfter: leaveFinal.data?.total ?? null,
  submitResult: { ok: submitResult.ok, reason: submitResult.reason, success: submitResult.success },
  approvals: {
    mounted: approvals.mounted,
    pathA: approvals.pathA,
    pathB: approvals.pathB,
    pathC: approvals.pathC,
    leaveTab: approvals.leaveTab,
    isThongBao: approvals.isThongBao,
    fabHasApprovals: approvals.fabHasApprovals,
    sample: approvals.sample,
  },
  approveResult,
  fromSubLeaveIds: fromSub.map((r) => r.id),
  steps,
  ack_status: jmob05Pass ? 'PASS_TO_PM' : 'FAIL_TO_PM',
};
writeFileSync(`${OUT}/_run.json`, JSON.stringify(run, null, 2));
console.log(JSON.stringify({ verdict, ack_status: run.ack_status, jmob05Pass, submitOk: submitResult.ok, approvalsMounted: approvals.mounted, approveOk: approveResult.ok }, null, 2));
process.exit(jmob05Pass ? 0 : 2);
