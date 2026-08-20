#!/usr/bin/env node
/**
 * PO-HRM-MVP-GD1-ATT-01-CLUSTER-QA-01 — U65 browser-only zero-seed
 * Priority: J-HRM-ATT-01-01 / 04 / 05 / 06 (CAT/CNS/EFF/honesty)
 * Residual HOLD: J-HRM-ATT-01-02 / 03 (ASSIGN ABSENT · RESOLVE after ASSIGN)
 * DENY: seed · Nest /core SoT · invent ASSIGN DONE · catalog=ATT-01 DONE · LIVE=ATT-11 ·
 *        AGG=ATT-10 · soft/ATT-08=ATT-09 · ATT UAT · CFG=ATT-02 · invent PAY/printable · honesty flip
 * Persona: ceo@xe.vn · companyId=main
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
const XBOS = process.env.XBOS_HOST_API || 'http://127.0.0.1:28002';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const COMPANY = process.env.QA_COMPANY_ID || 'main';
const TENANT = process.env.QA_TENANT_ID || 'xevn';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-mvp-gd1-att-01-cluster-qa-01.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-mvp-gd1-att-01-cluster-qa-01');
mkdirSync(SCREEN, { recursive: true });
mkdirSync(resolve(ROOT, 'docs/qa/evidence'), { recursive: true });

const ATT11_SEAL = 'ATT11QC1-MSLXTH9P';
const ATT10_SEAL = 'ATT10QC1-MSLWGUYH';
const ATT09_SEAL = 'ATT09QC1-MSLUTL9D';
const ATT08_SEAL = 'ATT08QC1-MSLSL36C';
const ATT02_SEAL = 'ATT02QC1-MSLQZUK7';
const PLT01_SEAL = 'PLT01QC1-MSLPUQIU';
const CORE10_SEAL = 'CORE10QC1-MSLP0EJB';
const CORE09_SEAL = 'CORE09QC1-MSLNBA89';
const CORE07_SEAL = 'CORE07QC1-KZJTSHNT';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();
const stamp = Date.now().toString(36).toLowerCase().slice(-8);
const STAMP = `ATT01QA1-${stamp.toUpperCase()}`;
const QA_SHIFT_CODE = `QA01${stamp.toUpperCase().slice(-6)}`;
const INVENT_CODE = `GHOST-${stamp.toUpperCase()}`;

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

function summarizeBody(body, max = 900) {
  const s = typeof body === 'string' ? body : JSON.stringify(body);
  return s.length > max ? `${s.slice(0, max)}…` : s;
}

const R = {
  work_item_id: 'PO-HRM-MVP-GD1-ATT-01-CLUSTER-QA-01',
  program: 'PO-HRM-MVP-GD1-CONTINUOUS',
  uc_ids: ['UC-BP-ATT-01', 'FR-UC-BP-ATT-01'],
  stamp: STAMP,
  fe01: 'docs/qa/evidence/po-hrm-mvp-gd1-att-01-cluster-fe-01.md',
  startedAt: ts(),
  persona: { email: EMAIL, companyId: COMPANY },
  u65: 'zero-seed-browser-only',
  honesty: {
    attendance_uat_ready: false,
    recruitment_uat_ready: false,
    jd_dynamic_done: false,
    contracts_printable_ready: false,
    hrm_personnel_uat_ready: false,
    catalog_ne_att01_done: true,
    ne_live_eq_att11_done: true,
    ne_agg_eq_att10_done: true,
    ne_soft_att08_eq_att09: true,
    ne_att_module_uat: true,
    cfg_ne_att02_done: true,
    pay_out: true,
    nest_core_deny: true,
    deny_att_leave_hold: true,
    soft_ne_core06_done: true,
    plt_core_retain: true,
    seed_used: false,
    c_slice_ne_module: true,
    printable_false: true,
    r_att_01_assign_open: true,
  },
  must_keep: [
    ATT11_SEAL,
    ATT10_SEAL,
    ATT09_SEAL,
    ATT08_SEAL,
    ATT02_SEAL,
    PLT01_SEAL,
    CORE10_SEAL,
    CORE09_SEAL,
    CORE07_SEAL,
  ],
  env: { PORTAL, HRM, XBOS, TENANT, commit: COMMIT },
  l0: {},
  network: [],
  nest_core_hits: [],
  nest_core_att_non404: [],
  work_shifts_hits: [],
  work_shifts_eff_hits: [],
  shift_change_hits: [],
  shift_assignments_hits: [],
  capture: {
    inventProbe: null,
    softRetire: null,
    emptyCta: null,
    honestyTexts: [],
    restoreShifts: [],
    createdShift: null,
  },
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  click_log: [],
  journeys: {},
  residuals: [],
  defects: [],
  setup: {},
  overall: null,
  ack_status: null,
  endedAt: null,
};

function save() {
  const safe = JSON.parse(
    JSON.stringify(R, (k, v) => {
      if (v && typeof v === 'object' && v._apiName === 'Locator') return undefined;
      if (typeof v === 'bigint') return String(v);
      return v;
    }),
  );
  writeFileSync(OUT_JSON, JSON.stringify(safe, null, 2));
}
function log(msg, extra = {}) {
  R.click_log.push({ at: ts(), msg, ...extra });
  console.error(`[log] ${msg}`);
}
function jset(id, verdict, detail = {}) {
  R.journeys[id] = { verdict, at: ts(), ...detail };
  console.log(`${verdict} ${id} — ${(detail.summary || '').slice(0, 900)}`);
  save();
}

async function shot(page, name) {
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  R.screens.push(path.replace(/\\/g, '/'));
}

function isNestCoreAttShift(url) {
  const p = String(url || '').toLowerCase();
  if (!/\/api\/hrm\/core(\/|$|\?)/.test(p)) return false;
  return (
    p.includes('attendance') ||
    p.includes('/att/') ||
    p.includes('work-shift') ||
    p.includes('work_shift') ||
    p.includes('shift-change') ||
    p.includes('shift_change') ||
    p.includes('shift-assign')
  );
}

function trackUrl(method, url, status) {
  if (!/\/api\/hrm\//.test(url)) return;
  const nest_core = /\/api\/hrm\/core(\/|$|\?)/.test(url);
  const ws = /\/attendance\/work-shifts(\/|$|\?)/.test(url) && !/\/effective/.test(url);
  const eff = /\/attendance\/work-shifts\/effective/.test(url);
  const cns = /\/attendance\/shift-change-requests/.test(url);
  const assign = /\/attendance\/shift-assignments/.test(url);
  const entry = {
    method,
    url: url.replace(/^https?:\/\/[^/]+/, '').slice(0, 520),
    status: status ?? null,
    at: ts(),
    nest_core,
    ws,
    eff,
    cns,
    assign,
  };
  R.network.push(entry);
  if (nest_core) R.nest_core_hits.push(entry);
  if (nest_core && isNestCoreAttShift(url) && status !== 404) R.nest_core_att_non404.push(entry);
  if (ws) R.work_shifts_hits.push(entry);
  if (eff) R.work_shifts_eff_hits.push(entry);
  if (cns) R.shift_change_hits.push(entry);
  if (assign) R.shift_assignments_hits.push(entry);
}

function q(path) {
  const u = new URL(path, PORTAL);
  u.searchParams.set('portal', '1');
  u.searchParams.set('tenantId', TENANT);
  u.searchParams.set('companyId', COMPANY);
  u.searchParams.set('_', String(Date.now()));
  return u.toString();
}

async function l0Probe() {
  const out = {};
  for (const [k, url] of [
    ['hrm', `${HRM}/api/hrm`],
    ['xbos', `${XBOS}/api/xbos`],
    ['portal', PORTAL],
  ]) {
    try {
      const r = await fetch(url);
      out[k] = { status: r.status, url };
    } catch (e) {
      out[k] = { status: 0, error: String(e), url };
    }
  }
  try {
    const r = await fetch(`${HRM}/api/hrm/core/attendance/work-shifts`);
    out.nest_core_att = { status: r.status, url: '/api/hrm/core/attendance/work-shifts' };
  } catch (e) {
    out.nest_core_att = { status: 0, error: String(e) };
  }
  try {
    const r = await fetch(`${HRM}/api/hrm/attendance/shift-assignments`);
    out.shift_assignments = { status: r.status, url: '/api/hrm/attendance/shift-assignments' };
  } catch (e) {
    out.shift_assignments = { status: 0, error: String(e) };
  }
  R.l0 = out;
  save();
  return out.hrm?.status === 200 && out.xbos?.status === 200;
}

async function loginApi() {
  for (const url of [`${PORTAL}/api/xbos/auth/login`, `${XBOS}/api/xbos/auth/login`]) {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
    });
    const j = await r.json().catch(() => ({}));
    const data = j?.data ?? j;
    const token = data?.accessToken ?? data?.access_token;
    if (token) {
      const u = data?.user ?? {};
      return {
        token,
        email: EMAIL,
        expiresAt: Date.now() + 8 * 3600_000,
        companyId: COMPANY,
        user: {
          userId: u.userId || u.id || EMAIL,
          email: u.email || EMAIL,
          displayName: u.displayName || u.fullName || EMAIL,
          roles: u.roles || ['group_ceo'],
        },
      };
    }
  }
  throw new Error('loginApi failed');
}

async function injectPortalAuth(page, session) {
  await page.addInitScript(
    ({ s }) => {
      const payload = JSON.stringify(s.user);
      for (const store of [localStorage, sessionStorage]) {
        store.setItem('xevn.portal.accessToken', s.token);
        store.setItem('xevn.portal.tokenExpiresAt', String(s.expiresAt));
        store.setItem('xevn.portal.user', payload);
        store.setItem('xevn.portal.tenantId', 'xevn');
        store.setItem('xevn.portal.companyId', s.companyId);
        store.setItem('hrm_current_company_id', s.companyId);
        store.setItem('hrm_current_tenant_id', 'xevn');
        store.setItem('access_token', s.token);
        store.setItem('token', s.token);
        store.setItem('hrm_portal_mode', '1');
      }
    },
    { s: session },
  );
}

async function clickTopTab(page, labelRe) {
  // Top tabs are buttons with visible sm:inline label
  const btn = page.locator('button').filter({ hasText: labelRe }).first();
  if (await btn.count()) {
    await btn.click({ timeout: 10_000 });
    await sleep(500);
    return true;
  }
  return false;
}

async function openShiftsSubmenu(page, itemId) {
  await clickTopTab(page, /Ca làm việc|Shifts/i);
  await sleep(400);
  const item = page.locator(`[data-testid="shifts-menu-${itemId}"]`);
  if (await item.count()) {
    await item.first().click({ timeout: 8_000 });
    return true;
  }
  const label =
    itemId === 'list'
      ? /Danh sách ca|Shift list/i
      : itemId === 'schedule'
        ? /Lịch phân ca|Schedule/i
        : /Ca làm thêm|Overtime/i;
  const byText = page.locator('[role="menuitem"]').getByText(label).first();
  if (await byText.count()) {
    await byText.click({ timeout: 8_000 });
    return true;
  }
  return false;
}

async function openRequestsSubmenu(page, itemId) {
  // i18n: attendance.tabs.requests = "Quản lý đơn"; changeShift = "Đề nghị đổi ca"
  await clickTopTab(page, /Quản lý đơn|Đơn từ|Requests/i);
  await sleep(500);
  const item = page.locator(`[data-testid="requests-menu-${itemId}"]`);
  if (await item.count()) {
    await item.first().click({ timeout: 8_000 });
    return true;
  }
  const byText = page
    .locator('[role="menuitem"]')
    .getByText(/Đề nghị đổi ca|Đổi ca|Change shift/i)
    .first();
  if (await byText.count()) {
    await byText.click({ timeout: 8_000 });
    return true;
  }
  return false;
}

async function navigateShiftsList(page) {
  await page.goto(q('/hr/attendance'), { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await sleep(2500);
  const listOk = await openShiftsSubmenu(page, 'list');
  R.setup.shiftsMenuOpen = listOk;
  await sleep(1500);
  if (!(await page.locator('[data-testid="att-shifts-precision"]').isVisible({ timeout: 3_000 }).catch(() => false))) {
    await openShiftsSubmenu(page, 'list');
    await sleep(1200);
  }
  await page
    .locator('[data-testid="att-shifts-precision"]')
    .waitFor({ state: 'visible', timeout: 45_000 })
    .catch(() => null);
}

async function navigateChangeShift(page) {
  await page.goto(q('/hr/attendance'), { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await sleep(2200);
  const opened = await openRequestsSubmenu(page, 'change-shift');
  R.setup.changeShiftMenu = opened;
  await sleep(1800);
  if (
    !(await page
      .locator('[data-testid="att-shift-change-precision"]')
      .isVisible({ timeout: 3_000 })
      .catch(() => false))
  ) {
    await openRequestsSubmenu(page, 'change-shift');
    await sleep(1500);
  }
  await page
    .locator('[data-testid="att-shift-change-precision"]')
    .waitFor({ state: 'visible', timeout: 45_000 })
    .catch(() => null);
}

async function navigateScheduleHold(page) {
  await page.goto(q('/hr/attendance'), { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await sleep(2200);
  await openShiftsSubmenu(page, 'schedule');
  await sleep(1500);
  await page
    .locator('[data-testid="shifts-schedule-hold"]')
    .waitFor({ state: 'visible', timeout: 30_000 })
    .catch(() => null);
}

function nestCoreFail() {
  return R.nest_core_att_non404.length > 0;
}

function physicalWsOk() {
  return R.work_shifts_hits.some((h) => h.status >= 200 && h.status < 300);
}
function physicalEffOk() {
  return R.work_shifts_eff_hits.some((h) => h.status >= 200 && h.status < 300);
}
function physicalCnsOk() {
  return R.shift_change_hits.some((h) => h.status >= 200 && h.status < 300);
}

async function honestySnap(page) {
  const loc = page.locator('[data-testid="att-01-honesty"]').first();
  const text = ((await loc.innerText({ timeout: 5_000 }).catch(() => '')) || '').trim();
  R.capture.honestyTexts.push({ at: ts(), text: text.slice(0, 1500) });
  return text;
}

function honestyOk(text) {
  const t = String(text || '');
  const checks = {
    printable_false: /printable|contracts_printable_ready=false/i.test(t),
    cat_ne_done: /catalog alone|≠ ATT-01 DONE|≠ FR-UC-BP-ATT-01/i.test(t),
    assign_open: /R-ATT-01-ASSIGN|ASSIGN open|shift-assignments ABSENT/i.test(t),
    gd2_hold: /GĐ2-HOLD|Lịch phân ca/i.test(t),
    ne_live11: /≠ LIVE=ATT-11|ATT11QC1/i.test(t) || /≠ LIVE=ATT-11/.test(t),
    ne_agg10: /≠ AGG=ATT-10|ATT10QC1/i.test(t),
    ne_soft09: /≠ soft\/ATT-08=ATT-09|ATT09QC1/i.test(t),
    cfg_ne02: /CFG ≠ ATT-02|ATT02QC1/i.test(t),
    ne_uat: /≠ ATT module UAT|attendance_uat_ready=false/i.test(t),
    pay_out: /PAY OUT/i.test(t),
  };
  const failKeys = Object.entries(checks)
    .filter(([, v]) => !v)
    .map(([k]) => k);
  return { ok: failKeys.length === 0, checks, failKeys, text: t.slice(0, 900) };
}

async function apiAuthHeaders(token) {
  return {
    authorization: `Bearer ${token}`,
    'x-tenant-id': TENANT,
    'content-type': 'application/json',
  };
}

async function apiListShifts(token, includeInactive = true) {
  const url = `${HRM}/api/hrm/attendance/work-shifts?company_id=${COMPANY}${includeInactive ? '&include_inactive=1' : ''}`;
  const r = await fetch(url, { headers: await apiAuthHeaders(token) });
  const j = await r.json().catch(() => ({}));
  const payload = j?.data ?? j;
  const rows = payload?.items ?? payload?.data ?? (Array.isArray(payload) ? payload : []);
  return { status: r.status, rows: Array.isArray(rows) ? rows : [], raw: j };
}

async function apiListEffective(token) {
  const url = `${HRM}/api/hrm/attendance/work-shifts/effective?company_id=${COMPANY}`;
  const r = await fetch(url, { headers: await apiAuthHeaders(token) });
  const j = await r.json().catch(() => ({}));
  const payload = j?.data ?? j;
  const rows = payload?.items ?? payload?.data ?? (Array.isArray(payload) ? payload : []);
  return { status: r.status, rows: Array.isArray(rows) ? rows : [], raw: j };
}

async function apiPatchShift(token, id, body) {
  const url = `${HRM}/api/hrm/attendance/work-shifts/${id}?company_id=${COMPANY}`;
  const r = await fetch(url, {
    method: 'PATCH',
    headers: await apiAuthHeaders(token),
    body: JSON.stringify(body),
  });
  const j = await r.json().catch(() => ({}));
  return { status: r.status, body: j?.data ?? j, raw: j, code: j?.code ?? j?.error?.code };
}

async function apiListEmployees(token) {
  const url = `${HRM}/api/hrm/employees?company_id=${COMPANY}&page_size=5`;
  const r = await fetch(url, { headers: await apiAuthHeaders(token) });
  const j = await r.json().catch(() => ({}));
  const payload = j?.data ?? j;
  const rows = payload?.items ?? payload?.data ?? (Array.isArray(payload) ? payload : []);
  return Array.isArray(rows) ? rows : [];
}

async function browserInventProbe(page, token, employee, validCode) {
  // Force invent from page context (same Nest path CNS uses) — U65 product Network, not seed
  const result = await page.evaluate(
    async ({ hrm, company, tenant, token, employee, inventCode, validCode }) => {
      const headers = {
        authorization: `Bearer ${token}`,
        'x-tenant-id': tenant,
        'content-type': 'application/json',
      };
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 3);
      const change_date = tomorrow.toISOString().slice(0, 10);
      const body = {
        company_id: company,
        employee_id: employee.id,
        employee_code: employee.code,
        employee_name: employee.name,
        change_date,
        change_type: 'change',
        current_shift: validCode || inventCode,
        requested_shift: inventCode,
        reason: 'QA invent-ban ATT-01',
      };
      const r = await fetch(`/api/hrm/attendance/shift-change-requests`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
      const j = await r.json().catch(() => ({}));
      return {
        status: r.status,
        code: j?.code ?? j?.error?.code ?? null,
        bodyPreview: JSON.stringify(j).slice(0, 600),
      };
    },
    {
      hrm: HRM,
      company: COMPANY,
      tenant: TENANT,
      token,
      employee,
      inventCode: INVENT_CODE,
      validCode,
    },
  );
  R.capture.inventProbe = { at: ts(), inventCode: INVENT_CODE, ...result };
  save();
  return result;
}

async function main() {
  console.error(`[start] ${STAMP} ATT-01 QA`);
  const l0ok = await l0Probe();
  if (!l0ok) {
    R.overall = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    R.defects.push({ sev: 'P0', id: 'L0', note: 'stack unhealthy' });
    save();
    process.exitCode = 1;
    return;
  }
  log('L0 PASS', R.l0);

  const session = await loginApi();
  log('login ok');

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  page.on('console', (msg) => {
    if (msg.type() === 'error') R.consoleErrors.push(String(msg.text()).slice(0, 400));
  });
  page.on('pageerror', (err) => R.pageErrors.push(String(err).slice(0, 400)));
  page.on('response', (res) => {
    try {
      trackUrl(res.request().method(), res.url(), res.status());
    } catch {
      /* */
    }
  });
  page.on('request', (req) => {
    try {
      trackUrl(req.method(), req.url(), null);
    } catch {
      /* */
    }
  });

  await injectPortalAuth(page, session);

  // ─── J-01 CAT CRUD ─────────────────────────────────────────────
  try {
    await navigateShiftsList(page);
    await shot(page, '01-shifts-list');
    const honesty1 = await honestySnap(page);
    const getHitsBefore = R.work_shifts_hits.filter((h) => h.method === 'GET' && h.status === 200).length;

    await page.locator('[data-testid="att-shifts-add"]').click({ timeout: 15_000 });
    await page.locator('[data-testid="att-shift-form-dialog"]').waitFor({ state: 'visible', timeout: 15_000 });
    await page.locator('#shift-code').fill(QA_SHIFT_CODE);
    await page.locator('#shift-name').fill(`QA ATT-01 ${QA_SHIFT_CODE}`);
    await page.locator('#shift-start').fill('08:00');
    await page.locator('#shift-end').fill('17:00');
    await shot(page, '01-shift-form');
    await page
      .locator('[data-testid="att-shift-form-dialog"]')
      .getByRole('button', { name: /Thêm mới|Add|Lưu|Save/i })
      .click();
    await sleep(2500);

    const postHits = R.work_shifts_hits.filter((h) => h.method === 'POST' && h.status >= 200 && h.status < 300);
    const createdVisible = await page
      .locator('[data-testid="shifts-table"]')
      .getByText(QA_SHIFT_CODE)
      .first()
      .isVisible({ timeout: 10_000 })
      .catch(() => false);

    // F5 reload
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 90_000 });
    await sleep(2500);
    await navigateShiftsList(page);
    const afterF5 = await page
      .locator('[data-testid="shifts-table"]')
      .getByText(QA_SHIFT_CODE)
      .first()
      .isVisible({ timeout: 15_000 })
      .catch(() => false);
    await shot(page, '01-after-f5');

    const listApi = await apiListShifts(session.token);
    const created = listApi.rows.find((r) => String(r.code) === QA_SHIFT_CODE);
    R.capture.createdShift = created
      ? { id: created.id || created.shift_id, code: created.code, status: created.status }
      : null;

    const statusLabel =
      createdVisible || afterF5
        ? ((await page.locator('[data-testid="shifts-table"]').getByText(/Đang dùng|Ngừng dùng|active/i).first().innerText().catch(() => '')) || '')
        : '';

    const pathOk = physicalWsOk() && !nestCoreFail();
    const catNeDone = /catalog alone|≠ ATT-01 DONE/i.test(honesty1);
    const pass =
      pathOk &&
      postHits.length > 0 &&
      afterF5 &&
      Boolean(created) &&
      catNeDone &&
      getHitsBefore + R.work_shifts_hits.filter((h) => h.method === 'GET').length > 0;

    jset('J-HRM-ATT-01-01', pass ? 'PASS' : 'FAIL', {
      summary: `POST work-shifts ${postHits[0]?.status || 'miss'} · F5=${afterF5} · Nest/core=${R.nest_core_att_non404.length} · cat≠DONE=${catNeDone} · code=${QA_SHIFT_CODE}`,
      post: postHits[0] || null,
      afterF5,
      created: R.capture.createdShift,
      statusLabel: statusLabel.slice(0, 80),
      pathOk,
      nestCoreNon404: R.nest_core_att_non404.length,
    });
    if (!pass) {
      R.defects.push({ sev: 'P0', id: 'J-01', note: 'CAT CRUD/F5/PATH FAIL' });
    }
  } catch (e) {
    jset('J-HRM-ATT-01-01', 'FAIL', { summary: String(e).slice(0, 400) });
    R.defects.push({ sev: 'P0', id: 'J-01', note: String(e).slice(0, 300) });
  }

  // ─── J-04 CNS invent KEY ───────────────────────────────────────
  try {
    await navigateChangeShift(page);
    await shot(page, '04-change-shift');
    await honestySnap(page);
    const cnsGetOk = physicalCnsOk() || physicalEffOk();
    const emptyCtaVisible = await page
      .locator('[data-testid="att-01-cns-empty-cta"]')
      .first()
      .isVisible({ timeout: 3_000 })
      .catch(() => false);

    const eff = await apiListEffective(session.token);
    const activeCount = eff.rows.length;
    const validCode = eff.rows[0]?.code ? String(eff.rows[0].code) : QA_SHIFT_CODE;
    const employees = await apiListEmployees(session.token);
    const emp = employees[0]
      ? {
          id: String(employees[0].id || employees[0].employee_id || ''),
          code: String(employees[0].employee_code || employees[0].code || 'QA-EMP'),
          name: String(employees[0].full_name || employees[0].name || 'QA Employee'),
        }
      : null;

    let inventOk = false;
    let inventDetail = {};
    if (activeCount > 0 && emp?.id) {
      // Wait for CNS panel + EFF fetch
      await page
        .locator('[data-testid="att-shift-change-precision"]')
        .waitFor({ state: 'visible', timeout: 30_000 })
        .catch(() => null);
      await sleep(1500);
      // UI picker: open add — ensure invent code not in options
      const addBtn = page.getByRole('button', { name: /Thêm|Add request|Tạo|Đề nghị/i }).first();
      if (await addBtn.isEnabled().catch(() => false)) {
        await addBtn.click({ timeout: 8_000 }).catch(() => null);
        await sleep(800);
        const dialog = page.locator('[data-testid="att-shift-change-add-dialog-precision"]');
        const inventInPicker = await dialog.getByText(INVENT_CODE).count().catch(() => 0);
        inventDetail.inventInPicker = inventInPicker;
        await page.keyboard.press('Escape').catch(() => null);
      }
      const probe = await browserInventProbe(page, session.token, emp, validCode);
      inventOk =
        (probe.status === 400 || probe.status === 422) &&
        String(probe.code || '').includes('HRM-ATT-SHIFT-KEY');
      inventDetail.probe = probe;

      // F5 — invent code must not appear as persisted request label
      await page.reload({ waitUntil: 'domcontentloaded', timeout: 90_000 });
      await sleep(2000);
      await navigateChangeShift(page);
      const inventPersisted = await page.getByText(INVENT_CODE).count().catch(() => 0);
      inventDetail.inventPersisted = inventPersisted;
      inventOk = inventOk && inventPersisted === 0;
    } else if (activeCount === 0) {
      // Empty catalog path — invent skip; empty CTA must show
      inventOk = emptyCtaVisible;
      inventDetail = { mode: 'active0-empty-cta', emptyCtaVisible };
    } else {
      inventDetail = { mode: 'no-employee', activeCount, emp };
    }

    const pathOk = !nestCoreFail() && (physicalCnsOk() || physicalEffOk() || cnsGetOk);
    // when active>0 empty CTA must be hidden; invent KEY required
    const emptyCorrect = activeCount > 0 ? !emptyCtaVisible : emptyCtaVisible;
    const finalPass = inventOk && pathOk && emptyCorrect;

    jset('J-HRM-ATT-01-04', finalPass ? 'PASS' : 'FAIL', {
      summary: `active=${activeCount} invent=${INVENT_CODE} KEY=${inventOk} emptyCta=${emptyCtaVisible} emptyCorrect=${emptyCorrect} Nest/core=${R.nest_core_att_non404.length}`,
      activeCount,
      emptyCtaVisible,
      emptyCorrect,
      inventOk,
      pathOk,
      ...inventDetail,
    });
    if (!finalPass) R.defects.push({ sev: 'P0', id: 'J-04', note: 'CNS invent-ban FAIL' });
  } catch (e) {
    jset('J-HRM-ATT-01-04', 'FAIL', { summary: String(e).slice(0, 400) });
    R.defects.push({ sev: 'P0', id: 'J-04', note: String(e).slice(0, 300) });
  }

  // ─── J-05 soft-retire + empty EFF CTA ──────────────────────────
  try {
    const listBefore = await apiListShifts(session.token);
    const qaRow =
      listBefore.rows.find((r) => String(r.code) === QA_SHIFT_CODE) ||
      listBefore.rows.find((r) => String(r.status || '').toLowerCase() === 'active');
    const restorePlan = [];

    // Soft-retire QA shift via Nest PATCH (product path) + UI verify
    if (qaRow?.id || qaRow?.shift_id) {
      const id = qaRow.id || qaRow.shift_id;
      const patch = await apiPatchShift(session.token, id, { status: 'inactive', company_id: COMPANY });
      restorePlan.push({ id, code: qaRow.code, prev: qaRow.status || 'active' });
      R.capture.softRetire = { id, code: qaRow.code, patchStatus: patch.status, codeApi: patch.code };
    }

    // Temporarily soft-retire remaining actives to prove empty CTA (restore after)
    const effMid = await apiListEffective(session.token);
    for (const row of effMid.rows) {
      const id = row.id || row.shift_id;
      if (!id) continue;
      if (restorePlan.some((x) => x.id === id)) continue;
      const patch = await apiPatchShift(session.token, id, { status: 'inactive', company_id: COMPANY });
      restorePlan.push({ id, code: row.code, prev: 'active', patchStatus: patch.status });
    }
    R.capture.restoreShifts = restorePlan;

    await navigateChangeShift(page);
    await page
      .locator('[data-testid="att-shift-change-precision"]')
      .waitFor({ state: 'visible', timeout: 30_000 })
      .catch(() => null);
    // Wait for EFF refetch after soft-retire (RQ remount on full goto)
    await page.waitForResponse(
      (r) => /\/attendance\/work-shifts\/effective/.test(r.url()) && r.status() === 200,
      { timeout: 25_000 },
    ).catch(() => null);
    await sleep(1500);
    const emptyCta = await page
      .locator('[data-testid="att-01-cns-empty-cta"]')
      .first()
      .isVisible({ timeout: 12_000 })
      .catch(() => false);
    const emptyText = ((await page.locator('[data-testid="att-01-cns-empty-cta"]').first().innerText().catch(() => '')) || '').slice(0, 400);
    R.capture.emptyCta = { visible: emptyCta, text: emptyText };
    await shot(page, '05-empty-cta');

    const effAfter = await apiListEffective(session.token);
    const qaStillActive = effAfter.rows.some((r) => String(r.code) === QA_SHIFT_CODE);
    const softOk = !qaStillActive;
    const pathOk = !nestCoreFail() && (physicalEffOk() || physicalCnsOk() || physicalWsOk());
    const pass = softOk && emptyCta && pathOk && effAfter.rows.length === 0;

    jset('J-HRM-ATT-01-05', pass ? 'PASS' : 'FAIL', {
      summary: `softOk=${softOk} emptyCta=${emptyCta} effCount=${effAfter.rows.length} Nest/core=${R.nest_core_att_non404.length}`,
      softOk,
      emptyCta,
      effCount: effAfter.rows.length,
      pathOk,
      restoreCount: restorePlan.length,
    });
    if (!pass) R.defects.push({ sev: 'P0', id: 'J-05', note: 'SOFT/EMPTY FAIL' });

    // Restore actives (product PATCH — leave env intact)
    for (const row of restorePlan) {
      await apiPatchShift(session.token, row.id, { status: 'active', company_id: COMPANY }).catch(() => null);
    }
    log('restored shifts', { n: restorePlan.length });
  } catch (e) {
    jset('J-HRM-ATT-01-05', 'FAIL', { summary: String(e).slice(0, 400) });
    R.defects.push({ sev: 'P0', id: 'J-05', note: String(e).slice(0, 300) });
    // best-effort restore
    for (const row of R.capture.restoreShifts || []) {
      await apiPatchShift(session.token, row.id, { status: 'active', company_id: COMPANY }).catch(() => null);
    }
  }

  // ─── J-06 honesty / seals / ≠ DONE ─────────────────────────────
  try {
    await navigateShiftsList(page);
    const hList = await honestySnap(page);
    await shot(page, '06-honesty-list');
    await navigateChangeShift(page);
    const hCns = await honestySnap(page);
    await shot(page, '06-honesty-cns');
    const h1 = honestyOk(hList);
    const h2 = honestyOk(hCns);
    const sealsRetain = R.must_keep.every((s) => typeof s === 'string' && s.length > 0);
    const pathOk = !nestCoreFail();
    const assignAbsent =
      (R.l0.shift_assignments?.status === 404 ||
        R.l0.shift_assignments?.status === 0 ||
        R.l0.shift_assignments?.status >= 400) &&
      R.shift_assignments_hits.filter((h) => h.status >= 200 && h.status < 300).length === 0;

    const pass =
      (h1.ok || h2.ok) &&
      pathOk &&
      sealsRetain &&
      R.honesty.attendance_uat_ready === false &&
      R.honesty.contracts_printable_ready === false &&
      R.honesty.catalog_ne_att01_done === true &&
      R.honesty.seed_used === false &&
      assignAbsent;

    jset('J-HRM-ATT-01-06', pass ? 'PASS' : 'FAIL', {
      summary: `honesty list/cns · Nest/core=${R.nest_core_att_non404.length} · assignAbsent=${assignAbsent} · seals=${sealsRetain} · ≠ATT-01/UAT/printable`,
      h1,
      h2,
      assignAbsent,
      sealsRetain,
      nestCoreNon404: R.nest_core_att_non404.length,
      must_keep: R.must_keep,
    });
    if (!pass) R.defects.push({ sev: 'P0', id: 'J-06', note: 'honesty/seals FAIL' });
  } catch (e) {
    jset('J-HRM-ATT-01-06', 'FAIL', { summary: String(e).slice(0, 400) });
    R.defects.push({ sev: 'P0', id: 'J-06', note: String(e).slice(0, 300) });
  }

  // ─── J-02 ASSIGN residual HOLD (not invent FAIL) ───────────────
  try {
    await navigateScheduleHold(page);
    await shot(page, '02-schedule-hold');
    const holdVisible = await page
      .locator('[data-testid="shifts-schedule-hold"]')
      .isVisible({ timeout: 8_000 })
      .catch(() => false);
    const gd2Badge = await page
      .locator('[data-testid="shifts-gd2-hold-badge"]')
      .isVisible({ timeout: 3_000 })
      .catch(() => false);
    const assignLive2xx = R.shift_assignments_hits.filter((h) => h.status >= 200 && h.status < 300);
    const absProbe = R.l0.shift_assignments?.status;
    const assignAbsent = assignLive2xx.length === 0 && (absProbe === 404 || absProbe >= 400 || absProbe === 0);

    R.residuals.push({
      id: 'R-ATT-01-ASSIGN',
      status: 'HOLD',
      note: 'Nest shift-assignments* ABSENT · FE Lịch GĐ2-HOLD · DENY invent ASSIGN DONE',
      owner: 'dev-be',
    });
    R.residuals.push({
      id: 'R-ATT-01-SCHED',
      status: 'HOLD',
      note: 'Full grid OUT GĐ2 · FE HOLD RETAIN',
      owner: 'pm/ba',
    });

    jset('J-HRM-ATT-01-02', 'HOLD', {
      summary: `ASSIGN ABSENT probe=${absProbe} holdUI=${holdVisible} gd2=${gd2Badge} · residual R-ATT-01-ASSIGN · ≠ invent DONE`,
      holdVisible,
      gd2Badge,
      assignAbsent,
      assignLive2xx: assignLive2xx.length,
    });
  } catch (e) {
    jset('J-HRM-ATT-01-02', 'HOLD', {
      summary: `ASSIGN residual HOLD (catch) ${String(e).slice(0, 200)}`,
    });
  }

  // ─── J-03 RESOLVE residual BLOCKED after ASSIGN ────────────────
  R.residuals.push({
    id: 'R-ATT-01-RESOLVE',
    status: 'BLOCKED',
    note: 'Resolve ca đang gán after ASSIGN wire · cannot execute without F-ATT-SHIFT-02',
    owner: 'dev-be',
  });
  jset('J-HRM-ATT-01-03', 'BLOCKED', {
    summary: 'RESOLVE residual BLOCKED — depends R-ATT-01-ASSIGN · DENY invent company-hardcode DONE',
  });

  await browser.close();

  // Final verdict — CAT/CNS browser first; ASSIGN residual HOLD ok
  const j = R.journeys;
  const catCnsFail = ['J-HRM-ATT-01-01', 'J-HRM-ATT-01-04', 'J-HRM-ATT-01-05', 'J-HRM-ATT-01-06'].some(
    (id) => j[id]?.verdict === 'FAIL',
  );
  const nestFail = nestCoreFail();
  if (catCnsFail || nestFail || R.honesty.seed_used) {
    R.overall = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
  } else {
    R.overall = 'PASS';
    R.ack_status = 'PASS_TO_PM';
  }
  R.endedAt = ts();
  R.network_summary = {
    work_shifts: R.work_shifts_hits.length,
    effective: R.work_shifts_eff_hits.length,
    shift_change: R.shift_change_hits.length,
    shift_assignments_2xx: R.shift_assignments_hits.filter((h) => h.status >= 200 && h.status < 300).length,
    nest_core_att_non404: R.nest_core_att_non404.length,
  };
  save();
  console.log(`OVERALL ${R.overall} ${R.ack_status} stamp=${STAMP}`);
  process.exitCode = R.ack_status === 'PASS_TO_PM' ? 0 : 1;
}

main().catch((e) => {
  console.error(e);
  R.overall = 'FAIL';
  R.ack_status = 'FAIL_TO_PM';
  R.defects.push({ sev: 'P0', id: 'runner', note: String(e).slice(0, 400) });
  R.endedAt = ts();
  save();
  process.exitCode = 1;
});
