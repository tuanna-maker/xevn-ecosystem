#!/usr/bin/env node
/**
 * R-SPINE-MGR-HIER-01-QA-DEVICE-JMOB05-R2 — J-MOB-05 Option A after PERSONA-LOCK
 * Approver L1: uat.nv0001 · Submitter leave ac9db485 (or FE submit uat.nv0003 if missing)
 * U65: no seed · no Option C · not ceo as L1
 */
import { execSync, spawnSync } from 'node:child_process';
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const adb = process.env.LOCALAPPDATA + '\\Android\\Sdk\\platform-tools\\adb.exe';
const HOST = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
const EMU = process.env.HRM_EMU_API || 'http://10.0.2.2:28001';
const PKG = 'vn.xevn.hrm.mobile';
const OUT = 'docs/qa/evidence/screens/r-spine-mgr-hier-01-qa-device-jmob05-r2';
const SUBMITTER = 'uat.nv0003@xe.vn';
const APPROVER = 'uat.nv0001@xe.vn';
const PASS = 'xevn-uat-2026';
const SUB_EMP = '2680f15f-02b6-44e1-8b42-92a6aaeb7bfb';
const MGR_EMP = '3796d949-4513-45c0-88fa-33030a062b17';
const HOLDING_UUID = '10000000-0000-4000-8000-000000000001';
const KNOWN_LEAVE = 'ac9db485-5d4f-4d77-9d25-114b157f70cf';

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
    tapText(xml, "Don't allow") ||
      tapText(xml, 'Không cho phép') ||
      tapId(xml, 'com.android.permissioncontroller:id/permission_deny_button');
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

async function leaveList(token, managerId = MGR_EMP) {
  const res = await fetch(
    `${HOST}/api/hrm/attendance/leave-requests?status=pending&manager_employee_id=${managerId}&company_id=holding&page_size=20`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  const j = await res.json();
  const rows = j.data?.data || j.data?.items || [];
  return { code: j.code, status: res.status, total: j.data?.total ?? rows.length, rows };
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
  const err = `${r.stderr || ''}${r.stdout || ''}`;
  if (r.status !== 0 && !/Warning: Activity not started|Starting: Intent/.test(err)) {
    throw new Error(err || 'am start fail');
  }
  await sleep(4500);
  await dismissPerm();
  const markers = ['Chào buổi', 'Trang chủ', 'Xin chào', 'Việc cần làm', 'Đồng nghiệp', 'Thông báo', 'Cần duyệt'];
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
  let hit = tapId(xml, 'check-in-fab') || tapText(xml, 'Thao tác nhanh');
  if (!hit) sh(`"${adb}" shell input tap 980 2100`);
  await sleep(1500);
  xml = dump('11-fab');
  hit = tapText(xml, 'Tạo đơn nghỉ') || tapId(xml, 'fab-action-create_leave');
  log('tap create leave', { hit });
  await sleep(2500);
  xml = dump('12-create-step0');
  if (!xml.includes('Tạo đơn') && !xml.includes('Bước 1') && !xml.includes('Khoảng ngày')) {
    tapText(xml, 'Trang chủ');
    await sleep(800);
    xml = dump('12b-home');
    hit = tapId(xml, 'home-action-tile-time_off') || tapText(xml, 'Nghỉ phép');
    await sleep(2000);
    xml = dump('12c-leave-list');
    hit = tapText(xml, 'Tạo đơn') || tapText(xml, 'Tạo đơn nghỉ');
    if (!hit) sh(`"${adb}" shell input tap 980 2100`);
    await sleep(2500);
    xml = dump('12d-create');
  }
  const onCreate = xml.includes('Tạo đơn') || xml.includes('Bước 1') || xml.includes('Khoảng ngày');
  if (!onCreate) return { ok: false, reason: 'create_screen_not_reached' };

  tapText(xml, 'Khoảng ngày nghỉ') ||
    tap(xml, [/class="android.widget.EditText"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/]);
  await sleep(1200);
  let px = dump('13-datepicker');
  tapText(px, 'OK') || tapText(px, 'Xác nhận') || tapText(px, 'Lưu');
  await sleep(800);
  px = dump('13b-datepicker');
  tapText(px, 'OK') || tapText(px, 'Xác nhận') || tapText(px, 'Lưu');
  await sleep(800);

  xml = dump('14-step0');
  tapId(xml, 'leave-create-next') || tapText(xml, 'Tiếp tục');
  await sleep(2000);
  xml = dump('15-step1');
  // Prefer unpaid (prior annual 0/0)
  tapText(xml, 'Nghỉ không lương') || tapText(xml, 'Phép năm') || tapText(xml, 'Nghỉ phép năm');
  await sleep(500);
  xml = dump('16-step1-type');
  tapId(xml, 'leave-create-next') || tapText(xml, 'Tiếp tục');
  await sleep(2000);
  xml = dump('17-step2');
  const reasonField =
    tapText(xml, 'Lý do') ||
    tap(xml, [/class="android.widget.EditText"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/]);
  if (reasonField) {
    await sleep(300);
    try {
      sh(`"${adb}" shell input text "JMOB05_R2_UAT0003"`);
    } catch {
      /* ignore */
    }
  }
  tapId(xml, 'leave-create-next') || tapText(xml, 'Tiếp tục');
  await sleep(2000);
  xml = dump('18-step3');
  tapText(xml, 'Gửi đơn nghỉ') || tapText(xml, 'Gửi đơn');
  await sleep(1500);
  xml = dump('19-confirm');
  tapText(xml, 'Xác nhận') || tapText(xml, 'Gửi') || tapText(xml, 'Đồng ý') || tapText(xml, 'Gửi đơn');
  await sleep(3500);
  xml = dump('20-after-submit');
  const success =
    xml.includes('thành công') ||
    xml.includes('Thành công') ||
    xml.includes('Đã gửi') ||
    xml.includes('Đơn nghỉ phép đã được gửi');
  tapText(xml, 'OK') || tapText(xml, 'Đóng');
  await sleep(1000);
  return { ok: success, success };
}

function isApprovalsScreen(xml) {
  return (
    xml.includes('manager-approvals-screen') ||
    /Nghỉ phép\s*\(\d+\)/.test(xml) ||
    (xml.includes('Phê duyệt') && xml.includes('Duyệt') && xml.includes('Chờ duyệt'))
  );
}

async function openApprovalsFromHome(tag = '30') {
  tapText(dump(`${tag}-goto-home`), 'Trang chủ') || sh(`"${adb}" shell input keyevent 4`);
  await sleep(1000);
  let xml = dump(`${tag}-mgr-home`);
  const tiles = [...xml.matchAll(/resource-id="(home-action-tile-[^"]+)"/g)].map((m) => m[1]);
  log('mgr home', { tag, tiles, sample: texts(xml).slice(0, 30) });
  const hit =
    tapId(xml, 'home-action-tile-approve') ||
    tapText(xml, 'Cần duyệt') ||
    tapText(xml, 'Duyệt') ||
    tapText(xml, 'Phê duyệt');
  log('open approvals tile', { tag, hit });
  await sleep(3000);
  xml = dump(`${tag}-approvals`);
  return { mounted: isApprovalsScreen(xml), xml, tiles };
}

async function tryOpenApprovals(xml0) {
  // Path A first — if mounts, stay on screen (do not wander to Profile)
  tapText(xml0, 'Trang chủ');
  await sleep(1000);
  let opened = await openApprovalsFromHome('30');
  const pathA = opened.mounted;
  let fabHasApprovals = false;
  let pathB = false;
  let pathC = false;
  let approvalsXml = opened.xml;

  if (!pathA) {
    // Path B: FAB
    tapText(opened.xml, 'Trang chủ') || sh(`"${adb}" shell input keyevent 4`);
    await sleep(1000);
    let xml = dump('32-before-fab');
    let hit = tapId(xml, 'check-in-fab') || tapText(xml, 'Thao tác nhanh');
    if (!hit) sh(`"${adb}" shell input tap 980 2100`);
    await sleep(1500);
    xml = dump('33-fab');
    fabHasApprovals =
      xml.includes('fab-action-manager-approvals') ||
      xml.includes('Duyệt đơn') ||
      (xml.includes('Phê duyệt') && xml.includes('chờ duyệt'));
    hit =
      tapId(xml, 'fab-action-manager-approvals') ||
      tapText(xml, 'Duyệt đơn') ||
      tapText(xml, 'Phê duyệt');
    log('pathB FAB', { hit, fabHasApprovals });
    await sleep(2500);
    xml = dump('34-pathB');
    pathB = isApprovalsScreen(xml);
    if (pathB) approvalsXml = xml;

    if (!pathB) {
      // Path C: Profile
      tapText(xml, 'Hồ sơ') || tapText(xml, 'Cá nhân') || tapId(xml, 'tab-profile');
      await sleep(1500);
      xml = dump('35-profile');
      hit =
        tapId(xml, 'profile-approvals-entry') ||
        tapId(xml, 'profile-quick-approvals') ||
        tapText(xml, 'Phê duyệt');
      log('pathC profile', { hit, hasEntry: xml.includes('profile-approvals-entry') });
      await sleep(2500);
      xml = dump('36-pathC');
      pathC = isApprovalsScreen(xml);
      if (pathC) approvalsXml = xml;
    }
  } else {
    // Still probe FAB presence without leaving approvals permanently:
    // snapshot only — reopen Path A before approve.
    fabHasApprovals = true; // Path A mounted implies manager path available
    log('pathA mounted — skip FAB/Profile navigation to keep approvals focused');
  }

  // Ensure we are on a live Approvals dump before returning
  if (pathA || pathB || pathC) {
    if (!isApprovalsScreen(approvalsXml) || pathA) {
      opened = await openApprovalsFromHome('39');
      if (opened.mounted) approvalsXml = opened.xml;
    }
  }

  const mounted = pathA || pathB || pathC || isApprovalsScreen(approvalsXml);
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

  // Re-open Path A so taps hit live bounds (not stale XML after path probes)
  const live = await openApprovalsFromHome('40');
  let xml = live.xml;
  if (!live.mounted) {
    xml = approvals.xml;
    if (!isApprovalsScreen(xml)) return { ok: false, reason: 'approvals_lost_after_reopen' };
  }

  // Prefer leave tab by exact count label; do NOT tap bare "Nghỉ phép" (home tile collision)
  const leaveHit =
    tap(xml, [/text="Nghỉ phép \(\d+\)"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/]) ||
    tap(xml, [/content-desc="Nghỉ phép \(\d+\)"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/]);
  log('leave tab', { leaveHit });
  await sleep(1500);
  xml = dump('40-leave-tab');

  // If already showing leave rows + Duyệt on Tất cả, proceed without tab
  if (!xml.includes('Duyệt') && isApprovalsScreen(approvals.xml)) {
    xml = dump('40b-retry-dump');
  }

  const count = (xml.match(/Nghỉ phép\s*\((\d+)\)/) || [])[1] ?? null;
  const empty =
    xml.includes('Không có đơn nghỉ phép chờ duyệt') || /Nghỉ phép\s*\(0\)/.test(xml);
  log('leave queue', {
    count,
    empty,
    hasDuyet: xml.includes('Duyệt'),
    hasUat0003: xml.includes('UAT NV 0003'),
    sample: texts(xml).slice(0, 30),
  });
  if (empty || !xml.includes('Duyệt')) return { ok: false, reason: 'empty_or_no_duyet', count, empty };

  // Prefer first Duyệt near UAT NV 0003 row if present
  let duy = null;
  if (xml.includes('UAT NV 0003')) {
    const idx = xml.indexOf('UAT NV 0003');
    const slice = xml.slice(idx, idx + 2500);
    duy =
      tap(slice, [/text="Duyệt"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/]) ||
      tap(slice, [/content-desc="Duyệt"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/]) ||
      tap(slice, [/resource-id="manager-approve-button"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/]);
  }
  if (!duy) {
    duy =
      tapId(xml, 'manager-approve-button') ||
      tapText(xml, 'Duyệt') ||
      tap(xml, [/content-desc="Duyệt"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/]);
  }
  log('duyet tap', { duy });
  await sleep(2000);
  xml = dump('41-after-duyet');
  // Confirm: exact content-desc/button Duyệt — NEVER substring "Xác nhận…" label
  if (xml.includes('Duyệt đơn?') || xml.includes('Xác nhận duyệt')) {
    const confirm =
      tap(xml, [/content-desc="Duyệt"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/]) ||
      (() => {
        const all = [...xml.matchAll(/content-desc="Duyệt"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/g)];
        if (!all.length) return null;
        const m = all[all.length - 1];
        const x = Math.floor((+m[1] + +m[3]) / 2);
        const y = Math.floor((+m[2] + +m[4]) / 2);
        sh(`"${adb}" shell input tap ${x} ${y}`);
        return { x, y };
      })();
    log('confirm Duyệt button', { confirm });
    if (!confirm) {
      sh(`"${adb}" shell input tap 751 1488`);
      log('confirm coord fallback');
    }
  }
  await sleep(3500);
  xml = dump('42-duyet-result');
  const successUi =
    xml.includes('Thành công') ||
    xml.includes('đã duyệt') ||
    xml.includes('Đã duyệt') ||
    xml.includes('Duyệt thành công') ||
    xml.includes('Đã phê duyệt') ||
    xml.includes('Đã duyệt đơn nghỉ phép');
  const hardFail =
    xml.includes('409') ||
    xml.includes('HRM-ATT-REQ-203') ||
    xml.includes('thất bại') ||
    /Lỗi\s/.test(xml);
  // F5 / pull refresh
  sh(`"${adb}" shell input swipe 540 500 540 1400 400`);
  await sleep(2500);
  xml = dump('43-f5');
  const leaveAfter = (xml.match(/Nghỉ phép\s*\((\d+)\)/) || [])[1] ?? null;
  const allAfter = (xml.match(/Tất cả\s*\((\d+)\)/) || [])[1] ?? null;
  const uat0003Still = xml.includes('UAT NV 0003') && xml.includes('Chờ duyệt');
  return {
    ok: successUi && !hardFail && !uat0003Still,
    leaveAfter,
    allAfter,
    successUi,
    hardFail,
    uat0003Still,
    sample: texts(xml).slice(0, 30),
  };
}

// ---------- preflight ----------
const mgrSession = await apiLogin(APPROVER);
const subSession = await apiLogin(SUBMITTER);
const leaveProbe = await leaveList(mgrSession.token);
const fromSub = leaveProbe.rows.filter((r) => r.employee_id === SUB_EMP);
const knownAlive = fromSub.some((r) => r.id === KNOWN_LEAVE);

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

const empDetail = await (
  await fetch(`${HOST}/api/hrm/employees/${SUB_EMP}?company_id=holding`, {
    headers: { Authorization: `Bearer ${mgrSession.token}` },
  })
).json();

const preflight = {
  submitter: {
    email: SUBMITTER,
    emp: subSession.emp,
    code: subSession.employee_code,
    uuid: subSession.uuid,
  },
  approver: {
    email: APPROVER,
    emp: mgrSession.emp,
    code: mgrSession.employee_code,
    uuid: mgrSession.uuid,
    roles: mgrSession.roles,
    is_manager: mgrSession.is_manager,
    jwt_roles: mgrSession.jwt_roles,
  },
  subordinate_manager_id: empDetail.data?.manager_id ?? null,
  hierarchy_ok: (empDetail.data?.manager_id ?? null) === MGR_EMP,
  holding_uuid_ok: mgrSession.uuid === HOLDING_UUID && mgrSession.uuid !== 'main',
  leave_pending_mgr: leaveProbe.total,
  from_sub_pending: fromSub.map((r) => r.id),
  known_leave_alive: knownAlive,
  home_is_manager: homeSum.data?.viewer?.is_manager ?? null,
  home_manager_pending: homeSum.data?.manager_pending ?? null,
  manager_unlock_ok: mgrSession.is_manager === true && (mgrSession.roles || []).includes('manager'),
};
writeFileSync(`${OUT}/_preflight.json`, JSON.stringify(preflight, null, 2));
log('preflight', preflight);

if (!preflight.manager_unlock_ok) {
  const finishedAt = new Date().toISOString();
  const run = {
    work_item_id: 'R-SPINE-MGR-HIER-01-QA-DEVICE-JMOB05-R2',
    startedAt,
    finishedAt,
    verdict: 'FAIL',
    preflight,
    ack_status: 'FAIL_TO_PM',
    reason: 'manager_unlock_not_live',
    steps,
  };
  writeFileSync(`${OUT}/_run.json`, JSON.stringify(run, null, 2));
  console.log(JSON.stringify({ verdict: 'FAIL', reason: 'manager_unlock_not_live' }, null, 2));
  process.exit(2);
}

// ---------- ensure ≥1 leave from submitter (reuse or FE submit) ----------
let submitResult = { ok: true, reused: true, leaveIds: fromSub.map((r) => r.id) };
if (fromSub.length === 0) {
  log('no pending from UAT-0003 — FE submit required (U65)');
  const subHome = await loginDeep(subSession);
  log('submitter home', { ok: subHome.ok, hit: subHome.hit });
  if (!subHome.ok) {
    submitResult = { ok: false, reason: 'submitter_login_fail' };
  } else {
    const fe = await submitLeave(subHome.xml);
    const after = await leaveList(mgrSession.token);
    const ids = after.rows.filter((r) => r.employee_id === SUB_EMP).map((r) => r.id);
    submitResult = { ok: fe.ok && ids.length > 0, reused: false, leaveIds: ids, fe };
    log('submit result', submitResult);
  }
} else {
  log('reuse pending leave from UAT-0003', { ids: fromSub.map((r) => r.id), knownAlive });
}

// ---------- approver ManagerApprovals ----------
const mgrHome = await loginDeep(mgrSession);
log('approver home', {
  ok: mgrHome.ok,
  hit: mgrHome.hit,
  roles: mgrSession.roles,
  is_manager: mgrSession.is_manager,
});
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
    sample: approvals.sample,
  });
  approveResult = await approveIfPossible(approvals);
  log('approve result', approveResult);
}

const leaveFinal = await leaveList(mgrSession.token);
const fromSubFinal = leaveFinal.rows.filter((r) => r.employee_id === SUB_EMP);
const knownCleared = knownAlive && !fromSubFinal.some((r) => r.id === KNOWN_LEAVE);
const queueCleared =
  knownCleared ||
  (submitResult.leaveIds?.length > 0 &&
    !fromSubFinal.some((r) => submitResult.leaveIds.includes(r.id)));

const finishedAt = new Date().toISOString();
const apiCleared =
  (knownAlive && knownCleared) ||
  (submitResult.leaveIds?.length > 0 &&
    !fromSubFinal.some((r) => submitResult.leaveIds.includes(r.id)));

const jmob05Pass =
  submitResult.ok === true &&
  approvals.mounted === true &&
  approveResult.ok === true &&
  apiCleared === true &&
  preflight.hierarchy_ok &&
  preflight.holding_uuid_ok &&
  preflight.manager_unlock_ok &&
  !String(mgrSession.uuid).includes('main');

const run = {
  work_item_id: 'R-SPINE-MGR-HIER-01-QA-DEVICE-JMOB05-R2',
  startedAt,
  finishedAt,
  verdict: jmob05Pass ? 'PASS' : 'FAIL',
  preflight,
  submitResult,
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
  leaveFinal: {
    total: leaveFinal.total,
    fromSub: fromSubFinal.map((r) => r.id),
    knownCleared,
    queueCleared,
    apiCleared,
  },
  steps,
  ack_status: jmob05Pass ? 'PASS_TO_PM' : 'FAIL_TO_PM',
};
writeFileSync(`${OUT}/_run.json`, JSON.stringify(run, null, 2));
console.log(
  JSON.stringify(
    {
      verdict: run.verdict,
      ack_status: run.ack_status,
      jmob05Pass,
      managerUnlock: preflight.manager_unlock_ok,
      submitOk: submitResult.ok,
      approvalsMounted: approvals.mounted,
      approveOk: approveResult.ok,
      apiCleared,
      knownCleared,
      leaveFinalTotal: leaveFinal.total,
    },
    null,
    2,
  ),
);
process.exit(jmob05Pass ? 0 : 2);
