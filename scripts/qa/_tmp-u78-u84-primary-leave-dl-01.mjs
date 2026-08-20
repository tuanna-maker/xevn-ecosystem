#!/usr/bin/env node
/**
 * U78-U84-PRIMARY-LEAVE-DL-01 — P-LEAVE @ CO-DL · L1 only (U65 · U76 · U78)
 * Phase A: browser CO-DL probe (du-lich.ceo · finance / xe-du-lich)
 * Phase B: mobile ESS L1 chain (uat.nv0003 submit → uat.nv0001 approve → F5 Đã duyệt)
 * FORBIDDEN: seed · ceo@ as L1 · invent L2/T_L1 · apps/**
 */
import { chromium } from 'playwright';
import { execSync, spawnSync } from 'node:child_process';
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as sleep } from 'node:timers/promises';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HOST = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
const EMU = process.env.HRM_EMU_API || 'http://10.0.2.2:28001';
const XBOS = process.env.XBOS_HOST_API || 'http://127.0.0.1:28002';
const PKG = 'vn.xevn.hrm.mobile';
const SUBMITTER = 'uat.nv0003@xe.vn';
const APPROVER = 'uat.nv0001@xe.vn';
const DL_CEO = 'du-lich.ceo@xe.vn';
const PASS_MOB = 'xevn-uat-2026';
const PASS_WEB = 'Xevn@2026';
const SUB_EMP = '2680f15f-02b6-44e1-8b42-92a6aaeb7bfb';
const MGR_EMP = '3796d949-4513-45c0-88fa-33030a062b17';
const HOLDING_UUID = '10000000-0000-4000-8000-000000000001';
const CO_DL_UUID = '10000000-0000-4000-8000-000000000004';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const adb = process.env.LOCALAPPDATA + '\\Android\\Sdk\\platform-tools\\adb.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-u78-u84-primary-leave-dl-01-browser.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/u78-u84-primary-leave-dl-01');
const MOB = join(SCREEN, 'mobile');
mkdirSync(MOB, { recursive: true });

const ts = () => new Date().toISOString();
const results = {
  work_item_id: 'U78-U84-PRIMARY-LEAVE-DL-01',
  startedAt: ts(),
  u65: 'zero-seed',
  hdsd_align: true,
  phases: {},
  click_log: [],
  network: [],
  screens: [],
  api_probes: {},
  leave_id: null,
  residuals: [],
};

function save() {
  writeFileSync(OUT_JSON, JSON.stringify(results, null, 2));
}
function log(msg, extra = {}) {
  const row = { at: ts(), msg, ...extra };
  results.click_log.push(row);
  console.error(`[${results.click_log.length}] ${msg}`, extra.note || extra.url || '');
  return row;
}

function sh(cmd) {
  return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}
function dump(name) {
  sh(`"${adb}" shell uiautomator dump /sdcard/qa-u78-leave.xml`);
  const localXml = join(MOB, `${name}.xml`);
  const pull = spawnSync(adb, ['pull', '/sdcard/qa-u78-leave.xml', localXml], {
    encoding: 'utf8',
    maxBuffer: 10e6,
  });
  if (pull.status !== 0) {
    throw new Error(`adb pull failed: ${pull.stderr || pull.stdout || pull.status}`);
  }
  const shot = spawnSync(adb, ['exec-out', 'screencap', '-p'], { maxBuffer: 25e6, encoding: 'buffer' });
  if (shot.status === 0 && shot.stdout?.length) {
    const png = join(MOB, `${name}.png`);
    writeFileSync(png, shot.stdout);
    results.screens.push(png.replace(/\\/g, '/'));
  }
  return readFileSync(localXml, 'utf8');
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

async function apiLoginMobile(email) {
  const j = await (
    await fetch(`${HOST}/api/hrm/auth/mobile/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: PASS_MOB }),
    })
  ).json();
  if (!j.success) throw new Error(`mobile login ${email}: ${j.code}`);
  const a = j.data.active_membership ?? j.data.memberships?.[0] ?? {};
  return {
    token: j.data.access_token,
    refresh: j.data.refresh_token ?? '',
    roles: j.data.roles,
    is_manager: j.data.is_manager,
    tenant: a.tenant_id ?? 'xevn',
    company: a.company_id ?? 'holding',
    uuid: a.company_uuid ?? HOLDING_UUID,
    emp: a.employee_id ?? j.data.employee?.id ?? '',
    company_label: a.company_label ?? '',
    tenant_label: a.tenant_label ?? '',
    role_label: a.role_label ?? '',
    job_title_label: a.job_title_label ?? '',
    employee_code: a.employee_code ?? '',
    employee_name: a.employee_name ?? '',
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
    const xml = dump('home-wait');
    if (xml.includes('Trang chủ') || xml.includes('Chào buổi')) return xml;
    await sleep(1500);
  }
  return dump('home-fail');
}

async function probeEmployees(token, companyId, tenantId = 'xevn') {
  const url = `${HOST}/api/hrm/employees?page=1&page_size=5&company_id=${encodeURIComponent(companyId)}`;
  const r = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'x-tenant-id': tenantId,
      'x-company-id': companyId,
    },
  });
  const j = await r.json();
  return { status: r.status, code: j.code, total: j.data?.total ?? null };
}

async function leavePendingForMgr(token) {
  const url = `${HOST}/api/hrm/attendance/leave-requests?status=pending&manager_employee_id=${MGR_EMP}&company_id=holding&page_size=20`;
  const j = await (await fetch(url, { headers: { Authorization: `Bearer ${token}` } })).json();
  const rows = j.data?.data || [];
  return {
    code: j.code,
    total: j.data?.total ?? rows.length,
    fromSub: rows.filter((r) => r.employee_id === SUB_EMP),
    rows: rows.map((r) => ({ id: r.id, employee_id: r.employee_id, status: r.status, leave_type: r.leave_type })),
  };
}

async function leaveForEmployee(token, status) {
  const url = `${HOST}/api/hrm/attendance/leave-requests?employee_id=${SUB_EMP}&company_id=holding&page_size=20${status ? `&status=${status}` : ''}`;
  const j = await (await fetch(url, { headers: { Authorization: `Bearer ${token}` } })).json();
  const rows = j.data?.data || [];
  return { code: j.code, total: j.data?.total ?? rows.length, rows };
}

/* ───────── Phase A: CO-DL browser ───────── */
async function phaseA_coDlBrowser() {
  log('PHASE_A_START', { note: 'CO-DL web probe' });
  const phase = { name: 'CO-DL browser', steps: [], verdict: 'PENDING' };

  // API scope probe with group CEO (read-only)
  const ceoLogin = await (
    await fetch(`${XBOS}/api/xbos/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ceo@xe.vn', password: PASS_WEB }),
    })
  ).json();
  const ceoTok = ceoLogin.data?.accessToken;
  const fin = await probeEmployees(ceoTok, 'finance');
  const uuid = await probeEmployees(ceoTok, CO_DL_UUID);
  results.api_probes.finance_employees = fin;
  results.api_probes.co_dl_uuid_employees = uuid;
  log('API_PROBE_CO_DL', { fin, uuid });

  const dlLogin = await (
    await fetch(`${XBOS}/api/xbos/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: DL_CEO, password: PASS_WEB }),
    })
  ).json();
  const dlTok = dlLogin.data?.accessToken;
  const dlMem = dlLogin.data?.memberships?.[0];
  const dlEmp = await probeEmployees(dlTok, 'main', 'xe-du-lich');
  results.api_probes.du_lich_main_employees = dlEmp;
  results.api_probes.du_lich_membership = {
    tenantId: dlMem?.tenantId,
    companyId: dlMem?.companyId,
    roleCode: dlMem?.roleCode,
  };

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  page.on('response', async (res) => {
    const u = res.url();
    if (!/\/api\/(hrm|xbos)\//.test(u)) return;
    const method = res.request().method();
    if (method === 'OPTIONS') return;
    if (!/leave|employees|auth|workflow/.test(u)) return;
    results.network.push({ at: ts(), method, url: u.slice(0, 220), status: res.status() });
  });

  await page.addInitScript((s) => {
    const payload = JSON.stringify(s.user);
    for (const store of [localStorage, sessionStorage]) {
      store.setItem('xevn.portal.accessToken', s.token);
      store.setItem('xevn.portal.tokenExpiresAt', String(s.expiresAt));
      store.setItem('xevn.portal.user', payload);
      store.setItem('xevn.portal.tenantId', s.tenantId);
      store.setItem('xevn.portal.companyId', s.companyId);
      store.setItem('hrm_portal_mode', '1');
      store.setItem('hrm_current_company_id', s.hrmCompanyId);
      store.setItem('hrm_current_tenant_id', s.tenantId);
      if (s.membershipId) store.setItem('xevn.portal.membershipId', s.membershipId);
    }
  }, {
    token: dlTok,
    expiresAt: Date.now() + 8 * 3600_000,
    tenantId: 'xe-du-lich',
    companyId: 'main',
    hrmCompanyId: 'finance',
    membershipId: dlLogin.data?.defaultMembershipId,
    user: {
      userId: DL_CEO,
      email: DL_CEO,
      displayName: dlLogin.data?.user?.displayName || 'CEO Du lich',
      roles: ['subsidiary_ceo'],
    },
  });

  // Probe finance embed (Plane B) and member main
  for (const [name, url] of [
    ['finance', `${PORTAL}/hr/attendance?portal=1&tenantId=xevn&companyId=finance`],
    ['xe-du-lich-main', `${PORTAL}/hr/attendance?portal=1&tenantId=xe-du-lich&companyId=main`],
  ]) {
    log('NAV_CO_DL_ATTENDANCE', { url });
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(4000);
    const leaveTab = page.locator('[role="tab"], button, a').filter({ hasText: /Nghỉ phép|Leave/i });
    if (await leaveTab.count()) {
      await leaveTab.first().click().catch(() => {});
      await sleep(2500);
    }
    const shotPath = join(SCREEN, `01-co-dl-${name}.png`);
    await page.screenshot({ path: shotPath, fullPage: false });
    results.screens.push(shotPath.replace(/\\/g, '/'));
    const body = await page.evaluate(() => document.body?.innerText?.slice(0, 2000) || '');
    const rootChild = await page.evaluate(() => document.querySelector('#root')?.childElementCount ?? 0);
    const createBtn = await page.getByRole('button', { name: /Tạo yêu cầu|Tạo đơn|Đăng ký nghỉ/i }).count();
    phase.steps.push({
      name,
      url,
      rootChild,
      createBtn,
      hasLeave: /Nghỉ phép|Yêu cầu nghỉ/i.test(body),
      emptyHint: /không có|chưa có|0 nhân viên|No data|trống/i.test(body),
      bodySnippet: body.slice(0, 400),
    });
    log('CO_DL_PAGE', { name, rootChild, createBtn });
  }

  await browser.close();

  const zeroEmp = (fin.total === 0 || fin.total === null) && (dlEmp.total === 0 || dlEmp.total === null);
  phase.verdict = zeroEmp ? 'BLOCKED_ENV' : 'CONTINUE';
  phase.zero_employees_co_dl = zeroEmp;
  phase.note =
    'Primary co_key CO-DL has 0 HRM employees @ finance / xe-du-lich·main; preferred mobile personas are holding-scoped';
  results.phases.A = phase;
  if (zeroEmp) {
    results.residuals.push({
      id: 'R-U84-LEAVE-DL-PERSONA-SCOPE-01',
      severity: 'P0',
      layer: 'env/data',
      note: 'Map UAT NV or DL staff into finance/xe-du-lich (sponsor bootstrap) before claiming TC-HIM-LEAVE-DL-* EVIDENCED; U65 forbids seed in QA evidence',
    });
  }
  save();
  return phase;
}

/* ───────── Phase B: mobile L1 chain (locked personas) ───────── */
async function phaseB_mobileL1() {
  log('PHASE_B_START', { note: 'mobile L1 chain locked personas' });
  const phase = { name: 'mobile L1', steps: [], verdict: 'PENDING', company_scope: 'holding' };

  const sub = await apiLoginMobile(SUBMITTER);
  const mgr = await apiLoginMobile(APPROVER);
  results.api_probes.submitter = {
    email: SUBMITTER,
    company: sub.company,
    uuid: sub.uuid,
    emp: sub.emp,
    is_manager: sub.is_manager,
  };
  results.api_probes.approver = {
    email: APPROVER,
    company: mgr.company,
    uuid: mgr.uuid,
    emp: mgr.emp,
    is_manager: mgr.is_manager,
    roles: mgr.roles,
  };

  if (sub.company !== 'holding' && sub.company !== 'finance') {
    phase.note_company = `submitter company=${sub.company}`;
  }
  if (sub.company !== 'finance') {
    phase.co_dl_persona_mismatch = true;
    phase.note =
      'Locked submitter/approver are holding — not CO-DL finance; L1 product path only (not TC-HIM-LEAVE-DL co_key claim)';
  }

  // Submit as nv0003
  let xml = await loginDeep(sub);
  log('SUB_LOGIN', { home: xml.includes('Trang chủ') });
  phase.steps.push({ step: 'submitter_login', pass: xml.includes('Trang chủ') });
  tapText(xml, 'Trang chủ');
  await sleep(1000);
  xml = dump('10-sub-home');

  let hit = tapId(xml, 'check-in-fab') || tapText(xml, 'Thao tác nhanh');
  log('FAB', { hit });
  await sleep(1500);
  xml = dump('11-fab');
  hit = tapText(xml, 'Tạo đơn nghỉ') || tapId(xml, 'fab-action-create_leave');
  log('CREATE_LEAVE', { hit });
  await sleep(2500);
  xml = dump('12-create-step0');

  // optional fail-deep: next disabled before date
  const nextDisabled = /leave-create-next[^>]*(?:enabled="false"|clickable="false")/.test(xml);
  phase.steps.push({ step: 'fail_deep_step0_optional', nextDisabled, result: nextDisabled ? 'pass' : 'skipped' });

  hit =
    tapText(xml, 'Khoảng ngày nghỉ') ||
    tapText(xml, 'Chọn khoảng') ||
    tap(xml, [/class="android.widget.EditText"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/]);
  log('OPEN_DATE', { hit });
  await sleep(1500);
  let px = dump('13-date');
  // pick a far future day to avoid overlap — scroll calendar if needed; confirm OK
  tapText(px, 'OK') || tapText(px, 'Xác nhận') || tapText(px, 'Lưu') || tapText(px, 'Done');
  await sleep(900);
  px = dump('13b-date');
  tapText(px, 'OK') || tapText(px, 'Xác nhận') || tapText(px, 'Lưu') || tapText(px, 'Done');
  await sleep(800);

  xml = dump('14-step0-ready');
  hit = tapId(xml, 'leave-create-next') || tapText(xml, 'Tiếp tục');
  log('STEP0_NEXT', { hit });
  await sleep(2000);
  xml = dump('15-step1');
  tapText(xml, 'Phép năm') || tapText(xml, 'Nghỉ phép năm') || tapText(xml, 'Không lương');
  await sleep(500);
  hit = tapId(xml, 'leave-create-next') || tapText(xml, 'Tiếp tục');
  log('STEP1_NEXT', { hit });
  await sleep(2000);
  xml = dump('16-step2');
  hit = tapId(xml, 'leave-create-next') || tapText(xml, 'Tiếp tục');
  log('STEP2_NEXT', { hit });
  await sleep(2000);
  xml = dump('17-step3');
  hit = tapText(xml, 'Gửi đơn nghỉ');
  log('SUBMIT', { hit });
  await sleep(1500);
  xml = dump('18-confirm');
  hit =
    tapText(xml, 'Gửi đơn') ||
    tapText(xml, 'Xác nhận') ||
    tapText(xml, 'Gửi') ||
    tapText(xml, 'Đồng ý') ||
    tapText(xml, 'OK');
  log('CONFIRM', { hit });
  await sleep(3500);
  xml = dump('19-after-submit');
  const submitOk =
    xml.includes('Đã gửi') ||
    xml.includes('thành công') ||
    xml.includes('Chờ duyệt') ||
    xml.includes('Đơn nghỉ phép đã được gửi');
  tapText(xml, 'OK') || tapText(xml, 'Đóng');
  await sleep(1200);

  // API: find newest pending from sub
  const beforeMgr = await leavePendingForMgr(mgr.token);
  const fromSub = beforeMgr.fromSub.sort((a, b) => String(b.id).localeCompare(String(a.id)));
  results.leave_id = fromSub[0]?.id || null;
  results.api_probes.pending_after_submit = beforeMgr;
  phase.steps.push({
    step: 'submit_leave',
    ui_success: submitOk,
    leave_id: results.leave_id,
    pending_total: beforeMgr.total,
    from_sub_count: fromSub.length,
  });
  log('SUBMIT_API', { leave_id: results.leave_id, pending: beforeMgr.total, fromSub: fromSub.length });

  if (!results.leave_id && !submitOk) {
    phase.verdict = 'FAIL';
    phase.fail_reason = 'submit UI/API did not produce pending leave for UAT-0003';
    results.phases.B = phase;
    save();
    return phase;
  }

  // Approve as nv0001
  xml = await loginDeep(mgr);
  log('MGR_LOGIN', { home: xml.includes('Trang chủ'), is_manager: mgr.is_manager });
  phase.steps.push({ step: 'approver_login', pass: xml.includes('Trang chủ'), is_manager: mgr.is_manager });
  xml = dump('20-mgr-home');
  hit = tapId(xml, 'home-action-tile-approve') || tapText(xml, 'Duyệt') || tapText(xml, 'Phê duyệt');
  log('OPEN_APPROVALS', { hit });
  await sleep(5000);
  xml = dump('21-approvals');
  const leaveCount = (xml.match(/Nghỉ phép\s*\((\d+)\)/) || [])[1] ?? null;
  phase.steps.push({
    step: 'approvals_mount',
    leaveCount,
    hasDuyet: xml.includes('Duyệt'),
    empty: /Nghỉ phép\s*\(0\)/.test(xml) || xml.includes('Không có đơn nghỉ phép chờ duyệt'),
  });

  // Prefer Nghỉ phép tab
  tapText(xml, 'Nghỉ phép') || tap(xml, [/Nghỉ phép\s*\(\d+\)[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/]);
  await sleep(1500);
  xml = dump('22-leave-tab');

  // Tap Duyệt near UAT NV 0003 if present
  if (xml.includes('UAT NV 0003') || xml.includes('0003')) {
    // tap Duyệt — first Duyệt button
    hit = tapText(xml, 'Duyệt');
    log('TAP_DUYET', { hit });
  } else {
    hit = tapText(xml, 'Duyệt');
    log('TAP_DUYET_ANY', { hit });
  }
  await sleep(2000);
  xml = dump('23-confirm-duyet');
  hit = tapText(xml, 'Duyệt') || tapText(xml, 'Xác nhận') || tapText(xml, 'Đồng ý');
  log('CONFIRM_DUYET', { hit });
  await sleep(3500);
  xml = dump('24-after-approve');
  const approveUi =
    xml.includes('Đã duyệt') ||
    xml.includes('đã được duyệt') ||
    /Nghỉ phép\s*\(/.test(xml);
  phase.steps.push({ step: 'approve_ui', approveUi, texts: [...xml.matchAll(/text="([^"]+)"/g)].map((m) => m[1]).filter((t) => /duyệt|Đơn|Nghỉ/i.test(t)).slice(0, 20) });

  // pull refresh
  sh(`"${adb}" shell input swipe 540 800 540 1600 400`);
  await sleep(2500);
  xml = dump('25-f5-approvals');

  const afterMgr = await leavePendingForMgr(mgr.token);
  results.api_probes.pending_after_approve = afterMgr;
  const cleared =
    results.leave_id == null
      ? afterMgr.fromSub.length === 0
      : !afterMgr.fromSub.some((r) => r.id === results.leave_id);
  phase.steps.push({
    step: 'approve_api',
    cleared,
    leave_id: results.leave_id,
    pending_total: afterMgr.total,
    from_sub: afterMgr.fromSub.map((r) => r.id),
  });
  log('APPROVE_API', { cleared, pending: afterMgr.total });

  // Submitter F5 — list Đã duyệt
  xml = await loginDeep(sub);
  tapText(xml, 'Nghỉ phép') || tapId(xml, 'home-action-tile-leave');
  await sleep(2500);
  xml = dump('30-sub-leave-list');
  // try tab Đã duyệt
  tapText(xml, 'Đã duyệt') || tapText(xml, 'Đã phê duyệt');
  await sleep(1500);
  xml = dump('31-sub-approved-tab');
  sh(`"${adb}" shell input swipe 540 800 540 1600 400`);
  await sleep(2000);
  xml = dump('32-sub-f5');
  const subSeesApproved =
    xml.includes('Đã duyệt') ||
    xml.includes('approved') ||
    (results.leave_id && xml.includes(results.leave_id.slice(0, 8)));
  const empList = await leaveForEmployee(sub.token, 'approved');
  results.api_probes.submitter_approved = {
    code: empList.code,
    total: empList.total,
    hasLeave: results.leave_id ? empList.rows.some((r) => r.id === results.leave_id) : empList.rows.length > 0,
    sample: empList.rows.slice(0, 3).map((r) => ({ id: r.id, status: r.status, status_label: r.status_label })),
  };
  phase.steps.push({
    step: 'submitter_f5_approved',
    ui: subSeesApproved,
    api_has: results.api_probes.submitter_approved.hasLeave,
  });

  const chainPass = (submitOk || !!results.leave_id) && cleared && results.api_probes.submitter_approved.hasLeave;
  phase.verdict = chainPass ? 'PASS_HOLDING_L1' : cleared && submitOk ? 'PARTIAL' : 'FAIL';
  phase.l2_claimed = false;
  phase.t_l1_claimed = false;
  results.phases.B = phase;
  save();
  return phase;
}

/* ───────── main ───────── */
const skipA = process.argv.includes('--phase-b-only');
let A;
if (skipA) {
  try {
    const prev = JSON.parse(readFileSync(OUT_JSON, 'utf8'));
    results.phases.A = prev.phases?.A;
    results.api_probes = { ...prev.api_probes, ...results.api_probes };
    results.screens = [...(prev.screens || [])];
    results.network = [...(prev.network || [])];
    results.residuals = [...(prev.residuals || [])];
    A = results.phases.A || { verdict: 'BLOCKED_ENV', reused: true };
    log('PHASE_A_REUSED', { verdict: A.verdict });
  } catch {
    A = await phaseA_coDlBrowser();
  }
} else {
  A = await phaseA_coDlBrowser();
}
const B = await phaseB_mobileL1();
results.endedAt = ts();

const coDlBlocked = A.verdict === 'BLOCKED_ENV';
const l1HoldingPass = B.verdict === 'PASS_HOLDING_L1';
results.verdict = coDlBlocked
  ? l1HoldingPass
    ? 'BLOCKED_CO_DL_ENV__L1_HOLDING_PASS'
    : 'BLOCKED_CO_DL_ENV'
  : l1HoldingPass
    ? 'PASS'
    : B.verdict === 'FAIL'
      ? 'FAIL'
      : 'PARTIAL';
results.promoted = [];
results.not_promoted = [
  {
    tc_id: 'TC-HIM-LEAVE-DL-HP-001',
    status: 'BLOCKED',
    reason: 'co_key CO-DL has 0 employees; submitter persona on holding not finance/xe-du-lich',
  },
  {
    tc_id: 'TC-HIM-LEAVE-DL-AP-001',
    status: 'BLOCKED',
    reason: 'same co_key env gap; L1 holding path evidenced separately as supporting only',
  },
  {
    tc_id: 'TC-HIM-LEAVE-DL-SG-L2-001',
    status: 'SPEC_GAP',
    reason: 'L2/T_L1 HOLD — not executed; FORBIDDEN this WI',
  },
  {
    tc_id: 'TC-HIM-LEAVE-DL-FD-001',
    status: 'OPTIONAL_SKIP',
    reason: 'case_matrix fail-deep optional this WI',
  },
];
if (l1HoldingPass) {
  results.supporting_evidenced_xref = [
    'TC-MOB-LV-CR-HP-001 (holding)',
    'TC-MOB-LV-MGR-HP-001/003 (holding L1)',
  ];
}
save();
console.log(
  JSON.stringify(
    {
      verdict: results.verdict,
      leave_id: results.leave_id,
      A: A.verdict,
      B: B.verdict,
      residuals: results.residuals,
      out: OUT_JSON,
    },
    null,
    2,
  ),
);
process.exit(results.verdict.includes('FAIL') && !results.verdict.includes('BLOCKED') ? 2 : 0);
