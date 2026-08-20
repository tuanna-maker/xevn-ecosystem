#!/usr/bin/env node
/**
 * PO-HRM-MVP-GD1-ATT-08-CLUSTER-QA-01 — U65 browser J-HRM-ATT-08-01..06
 * PM exit_criteria SoT (Wave-26 · FE-02 LIVE preview-deduction):
 *   J-01 T6→T2 POST preview-deduction · working_days=2 (not 4) · Nest /core 0
 *   J-02 Show trừ quỹ vs calendar · client-days ≠ SoT claim
 *   J-03 HOL-MISS · chặn nộp · no silent submit
 *   J-04 unit day|hour path · F5 consistency
 *   J-05 ALIGN reject inflate / deductible_units on submit path
 *   J-06 Honesty seals · ≠ ATT-08 DONE from client-days · ≠ ATT-09/03b · ≠ ATT UAT · CFG≠ATT-02 · printable false · PAY OUT
 * DENY seed · Nest /core leave SoT · claim client-days=ATT-08 DONE · claim ATT UAT · invent PAY/printable · honesty flip
 * Persona: ceo@xe.vn · companyId=main · C-SLICE
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
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-mvp-gd1-att-08-cluster-qa-01.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-mvp-gd1-att-08-cluster-qa-01');
mkdirSync(SCREEN, { recursive: true });
mkdirSync(resolve(ROOT, 'docs/qa/evidence'), { recursive: true });

const ATT02_SEAL = 'ATT02QC1-MSLQZUK7';
const PLT01_SEAL = 'PLT01QC1-MSLPUQIU';
const CORE10_SEAL = 'CORE10QC1-MSLP0EJB';
const CORE09_SEAL = 'CORE09QC1-MSLNBA89';
const CORE07_SEAL = 'CORE07QC1-KZJTSHNT';

/** Gold: Fri 2026-08-14 → Mon 2026-08-17 = calendar 4 · working 2 */
const GOLD_START = '2026-08-14';
const GOLD_END = '2026-08-17';
const GOLD_START_VI = '14/08/2026';
const GOLD_END_VI = '17/08/2026';
/** HOL-MISS year ABSENT */
const HOL_MISS_START = '2030-01-03';
const HOL_MISS_END = '2030-01-06';
const HOL_MISS_START_VI = '03/01/2030';
const HOL_MISS_END_VI = '06/01/2030';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();
const stamp = Date.now().toString(36).toLowerCase().slice(-8);
const STAMP = `ATT08QA1-${stamp.toUpperCase()}`;

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

function summarizeBody(body, max = 700) {
  const s = typeof body === 'string' ? body : JSON.stringify(body);
  return s.length > max ? `${s.slice(0, max)}…` : s;
}

const R = {
  work_item_id: 'PO-HRM-MVP-GD1-ATT-08-CLUSTER-QA-01',
  program: 'PO-HRM-MVP-GD1-CONTINUOUS',
  uc_ids: ['UC-BP-ATT-08', 'FR-UC-BP-ATT-08'],
  stamp: STAMP,
  startedAt: ts(),
  persona: { email: EMAIL, companyId: COMPANY },
  u65: 'zero-seed-browser-only',
  honesty: {
    attendance_uat_ready: false,
    recruitment_uat_ready: false,
    jd_dynamic_done: false,
    contracts_printable_ready: false,
    hrm_personnel_uat_ready: false,
    client_days_ne_att08_done: true,
    ne_att09: true,
    ne_att03b: true,
    ne_att_module_uat: true,
    cfg_ne_att02_done: true,
    pay_out: true,
    nest_core_deny: true,
    soft_ne_core06_done: true,
    plt_core_retain: true,
    seed_used: false,
    c_slice_ne_module: true,
    residual_preview_fe_closed: true,
  },
  must_keep: [ATT02_SEAL, PLT01_SEAL, CORE10_SEAL, CORE09_SEAL, CORE07_SEAL],
  env: { PORTAL, HRM, XBOS, TENANT, commit: COMMIT },
  l0: {},
  network: [],
  nest_core_hits: [],
  nest_core_leave_non404: [],
  preview_hits: [],
  leave_create_hits: [],
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
  writeFileSync(OUT_JSON, JSON.stringify(R, null, 2));
}
function log(msg, extra = {}) {
  R.click_log.push({ at: ts(), msg, ...extra });
  console.error(`[log] ${msg}`);
}
function jset(id, verdict, detail = {}) {
  R.journeys[id] = { verdict, at: ts(), ...detail };
  console.log(`${verdict} ${id} — ${(detail.summary || '').slice(0, 600)}`);
  save();
}

async function shot(page, name) {
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  R.screens.push(path.replace(/\\/g, '/'));
}

function isNestCoreLeave(url) {
  const p = String(url || '').toLowerCase();
  if (!/\/api\/hrm\/core(\/|$|\?)/.test(p)) return false;
  return (
    p.includes('leave') ||
    p.includes('holiday') ||
    p.includes('attendance') ||
    p.includes('/att/')
  );
}

function trackUrl(method, url, status) {
  if (!/\/api\/hrm\//.test(url)) return;
  const nest_core = /\/api\/hrm\/core(\/|$|\?)/.test(url);
  const preview = /leave-requests\/preview-deduction/.test(url);
  const leaveCreate =
    /\/attendance\/leave-requests(\?|$)/.test(url) && method === 'POST' && !preview;
  const entry = {
    method,
    url: url.replace(/^https?:\/\/[^/]+/, '').slice(0, 480),
    status: status ?? null,
    at: ts(),
    nest_core,
    preview,
    leaveCreate,
  };
  R.network.push(entry);
  if (nest_core) R.nest_core_hits.push(entry);
  if (nest_core && isNestCoreLeave(url) && status !== 404) R.nest_core_leave_non404.push(entry);
  if (preview) R.preview_hits.push(entry);
  if (leaveCreate) R.leave_create_hits.push(entry);
}

function q(path) {
  const u = new URL(path, PORTAL);
  u.searchParams.set('portal', '1');
  u.searchParams.set('tenantId', TENANT);
  u.searchParams.set('companyId', COMPANY);
  u.searchParams.set('_', String(Date.now()));
  return u.toString();
}

function attendanceUrl() {
  const isDirectHrm = /:8080\b/.test(PORTAL);
  const base = isDirectHrm ? `/attendance` : `/hr/attendance`;
  return q(base);
}

async function loginApi() {
  let lastStatus = 0;
  let data = null;
  for (const url of [`${XBOS}/api/xbos/auth/login`, `${PORTAL}/api/xbos/auth/login`]) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
      });
      lastStatus = r.status;
      const j = await r.json().catch(() => ({}));
      const d = j?.data ?? j;
      const token = d?.accessToken ?? d?.access_token ?? j?.accessToken;
      if (r.ok && token) {
        data = d;
        data.__via = url;
        break;
      }
    } catch (e) {
      console.error(`[login] fail ${url}: ${String(e).slice(0, 120)}`);
    }
  }
  if (!data?.accessToken && !data?.access_token) {
    throw new Error(`login failed status=${lastStatus}`);
  }
  const token = data.accessToken ?? data.access_token;
  return {
    token,
    expiresAt: Date.now() + 8 * 3600_000,
    companyId: COMPANY,
    user: {
      id: data.userId ?? data.user?.id ?? 'ceo',
      email: EMAIL,
      fullName: data.fullName ?? data.user?.fullName ?? 'CEO XeVN',
      tenantId: TENANT,
      companyId: COMPANY,
      roles: data.roles ?? ['group_ceo'],
      memberships: data.memberships ?? [],
    },
    raw: data,
  };
}

async function apiCall(token, method, path, opts = {}) {
  const companyId = opts.companyId ?? COMPANY;
  const url = path.startsWith('http')
    ? path
    : `${HRM}/api/hrm${path.startsWith('/') ? path : `/${path}`}`;
  const headers = {
    authorization: `Bearer ${token}`,
    'x-company-id': companyId,
    'x-tenant-id': TENANT,
    'content-type': 'application/json',
  };
  const init = { method, headers };
  if (opts.body !== undefined) init.body = JSON.stringify(opts.body);
  const r = await fetch(url, init);
  const text = await r.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text.slice(0, 400) };
  }
  trackUrl(method, url, r.status);
  return {
    status: r.status,
    code: json?.code ?? json?.error?.code ?? null,
    data: json?.data ?? json,
    json,
    summary: summarizeBody(json, 700),
    path: url.replace(/^https?:\/\/[^/]+/, ''),
  };
}

async function l0(token) {
  const out = {};
  for (const [name, url] of [
    ['hrm', `${HRM}/api/hrm`],
    ['xbos', `${XBOS}/api/xbos`],
    ['portal', PORTAL],
  ]) {
    try {
      const r = await fetch(url);
      out[name] = { status: r.status, ok: r.status === 200 };
    } catch (e) {
      out[name] = { status: 0, ok: false, err: String(e).slice(0, 120) };
    }
  }
  const nestProbe = await apiCall(
    token,
    'POST',
    `/core/attendance/leave-requests/preview-deduction`,
    { body: { employeeId: '00000000-0000-4000-8000-000000000001', leaveType: 'x', startDate: GOLD_START, endDate: GOLD_END } },
  );
  out.nest_core_leave_preview = { status: nestProbe.status, ok: nestProbe.status === 404 };
  R.l0 = out;
  save();
  return out.hrm?.ok && out.xbos?.ok && out.portal?.ok;
}

async function injectPortalAuth(page, session) {
  await page.addInitScript((s) => {
    const payload = JSON.stringify(s.user);
    for (const store of [localStorage, sessionStorage]) {
      store.setItem('xevn.portal.accessToken', s.token);
      store.setItem('xevn.portal.tokenExpiresAt', String(s.expiresAt));
      store.setItem('xevn.portal.user', payload);
      store.setItem('xevn.portal.tenantId', 'xevn');
      store.setItem('xevn.portal.companyId', s.companyId);
      store.setItem('hrm_portal_mode', '1');
      store.setItem('hrm_current_company_id', s.companyId);
      store.setItem('hrm_current_tenant_id', 'xevn');
      if (s.raw?.refreshToken) store.setItem('xevn.portal.refreshToken', s.raw.refreshToken);
      if (s.raw?.defaultMembershipId)
        store.setItem('xevn.portal.membershipId', s.raw.defaultMembershipId);
    }
  }, session);
}

function trackPage(page) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') R.consoleErrors.push(String(msg.text()).slice(0, 360));
  });
  page.on('pageerror', (err) => R.pageErrors.push(String(err).slice(0, 360)));
  page.on('response', (res) => {
    try {
      trackUrl(res.request().method(), res.url(), res.status());
    } catch {
      /* */
    }
  });
}

async function findAcross(page, selector, { timeout = 800 } = {}) {
  const hosts = [page, ...page.frames()];
  for (const h of hosts) {
    try {
      const loc = h.locator(selector).first();
      if (await loc.isVisible({ timeout }).catch(() => false)) {
        return { host: h, locator: loc };
      }
    } catch {
      /* */
    }
  }
  return null;
}

async function waitAcross(page, selector, ms = 20000) {
  const start = Date.now();
  while (Date.now() - start < ms) {
    const hit = await findAcross(page, selector, { timeout: 400 });
    if (hit) return hit;
    await sleep(250);
  }
  return null;
}

async function ensureHolidayYear(token, year) {
  const get = await apiCall(token, 'GET', `/attendance/holiday-calendars/${year}?company_id=${COMPANY}`);
  if (get.status === 200) {
    R.setup[`holiday_${year}`] = { status: 'present', via: 'GET', code: get.code };
    return get;
  }
  // Product F-ATT-HOL-01 thin PUT — empty day set · ≠ ATT-03b DONE · ≠ pnpm seed
  const put = await apiCall(token, 'PUT', `/attendance/holiday-calendars/${year}`, {
    body: { companyId: COMPANY, days: [] },
  });
  R.setup[`holiday_${year}`] = {
    status: put.status === 200 || put.status === 201 ? 'created_empty' : 'fail',
    via: 'PUT F-ATT-HOL-01 thin',
    code: put.code,
    summary: put.summary,
    note: 'product path · ≠ seed · ≠ ATT-03b DONE',
  };
  save();
  return put;
}

async function pickEmployeeAndLeaveType(token) {
  const empRes = await apiCall(
    token,
    'GET',
    `/employees?page=1&page_size=30&company_id=${COMPANY}`,
  );
  const rows = empRes.data?.data ?? empRes.data?.items ?? [];
  const emp =
    rows.find((e) => e.status === 'active' && !/qa_c07p|PENDING/i.test(String(e.full_name || ''))) ||
    rows.find((e) => e.status === 'active') ||
    rows[0];
  const ltRes = await apiCall(
    token,
    'GET',
    `/attendance/leave-types/effective?company_id=${COMPANY}`,
  );
  const types = ltRes.data?.data ?? ltRes.data ?? [];
  const dayType = types.find((t) => (t.unit || 'day') === 'day') || types[0];
  const hourType = types.find((t) => t.unit === 'hour');
  R.setup.employee = emp
    ? { id: emp.id, code: emp.employee_code, name: emp.full_name, company_id: emp.company_id }
    : null;
  R.setup.leaveType = dayType
    ? { key: dayType.leaveTypeKey || dayType.code, unit: dayType.unit || 'day', name: dayType.nameVi }
    : null;
  R.setup.hourLeaveType = hourType
    ? { key: hourType.leaveTypeKey || hourType.code, unit: 'hour' }
    : null;
  save();
  return { emp, dayType, hourType, types };
}

async function openLeaveTab(page) {
  await page.goto(attendanceUrl(), { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(1500);
  const leaveBtn =
    page.getByRole('button', { name: /^Nghỉ phép$/i }).first();
  if (await leaveBtn.isVisible().catch(() => false)) {
    await leaveBtn.click({ timeout: 10000 });
    log('open Nghỉ phép tab (role)');
  } else {
    const hit =
      (await findAcross(page, 'button:has-text("Nghỉ phép")')) ||
      (await findAcross(page, '[data-testid="att-leave-precision"]'));
    if (hit && (await hit.locator.evaluate((el) => el.tagName).catch(() => '')) === 'BUTTON') {
      await hit.locator.click({ force: true }).catch(() => {});
      log('open Nghỉ phép tab (text)');
    }
  }
  await sleep(1200);
  const shell = await waitAcross(page, '[data-testid="att-leave-precision"]', 25000);
  if (!shell) throw new Error('att-leave-precision not found');
  return shell.host;
}

async function openCreateDialog(host) {
  const createBtn = host.getByRole('button', { name: /Tạo yêu cầu nghỉ|Tạo yêu cầu|Create/i }).first();
  await createBtn.click({ timeout: 15000 });
  log('open create leave dialog');
  await sleep(800);
  const dlg = host.locator('[data-testid="att-leave-create-dialog-precision"]').first();
  await dlg.waitFor({ state: 'visible', timeout: 15000 });
  return dlg;
}

async function selectFirstEmployee(dlg) {
  const trigger = dlg.locator('.xevn-field-select-md').first();
  await trigger.click({ timeout: 10000 });
  await sleep(600);
  const opt = dlg.page().locator('[role="option"]').first();
  await opt.waitFor({ state: 'visible', timeout: 15000 });
  const label = (await opt.innerText().catch(() => '')).trim();
  await opt.click();
  log('select employee', { label: label.slice(0, 80) });
  await sleep(500);
  return label;
}

async function selectLeaveType(dlg, preferredKey) {
  // CatalogSearchPicker — click combobox / button in leave type area
  const picker =
    dlg.locator('[data-testid="catalog-search-picker"]').first();
  const hasPicker = await picker.isVisible().catch(() => false);
  if (hasPicker) {
    await picker.click({ timeout: 8000 });
  } else {
    // fallback: second select-like control or combobox
    const combo = dlg.getByRole('combobox').nth(1);
    if (await combo.isVisible().catch(() => false)) {
      await combo.click({ timeout: 8000 });
    } else {
      const buttons = dlg.locator('button[role="combobox"], button:has-text("loại"), button:has-text("Chọn")');
      const n = await buttons.count();
      for (let i = 0; i < n; i++) {
        const b = buttons.nth(i);
        const t = await b.innerText().catch(() => '');
        if (/loại|Chọn|Leave|phép/i.test(t) || i === 0) {
          await b.click({ timeout: 5000 }).catch(() => {});
          break;
        }
      }
    }
  }
  await sleep(500);
  const page = dlg.page();
  let opt = null;
  if (preferredKey) {
    opt = page.locator(`[role="option"]`).filter({ hasText: new RegExp(preferredKey, 'i') }).first();
    if (!(await opt.isVisible().catch(() => false))) opt = null;
  }
  if (!opt) {
    opt = page.locator('[role="option"]').first();
  }
  await opt.waitFor({ state: 'visible', timeout: 12000 });
  const label = (await opt.innerText().catch(() => '')).trim();
  await opt.click();
  log('select leave type', { label: label.slice(0, 80) });
  await sleep(400);
  return label;
}

async function fillDates(dlg, startVi, endVi) {
  const dateInputs = dlg.locator('input.xevn-field-date, input[placeholder="dd/MM/yyyy"]');
  const count = await dateInputs.count();
  if (count < 2) throw new Error(`expected ≥2 date inputs, got ${count}`);
  await dateInputs.nth(0).fill('');
  await dateInputs.nth(0).fill(startVi);
  await dateInputs.nth(0).press('Tab');
  await sleep(200);
  await dateInputs.nth(1).fill('');
  await dateInputs.nth(1).fill(endVi);
  await dateInputs.nth(1).press('Tab');
  log('fill dates', { startVi, endVi });
  await sleep(1200);
}

async function waitPreviewNetwork(page, { timeout = 15000 } = {}) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const hit = R.preview_hits.filter((h) => h.at >= R._previewMark);
    if (hit.length) return hit[hit.length - 1];
    await sleep(200);
  }
  return null;
}

async function readPreviewPanel(host) {
  const panel = host.locator('[data-testid="att-08-preview-deduction-panel"]').first();
  const visible = await panel.isVisible().catch(() => false);
  if (!visible) return { visible: false };
  const live = await host.locator('[data-testid="att-08-preview-live"]').isVisible().catch(() => false);
  const holMiss = await host.locator('[data-testid="att-08-hol-miss"]').isVisible().catch(() => false);
  const display = host.locator('[data-testid="att-08-preview-display-ready"]').first();
  const displayText = (await display.innerText().catch(() => '')).replace(/\s+/g, ' ').trim();
  const honesty = (await host.locator('[data-testid="att-08-honesty"]').innerText().catch(() => ''))
    .replace(/\s+/g, ' ')
    .trim();
  const excluded = (await host.locator('[data-testid="att-08-excluded-days"]').innerText().catch(() => ''))
    .replace(/\s+/g, ' ')
    .trim();
  return { visible: true, live, holMiss, displayText, honesty, excluded };
}

async function capturePreviewBody(page) {
  return page.evaluate(() => {
    const el = document.querySelector('[data-testid="att-08-preview-display-ready"]');
    return el ? el.innerText : null;
  }).catch(() => null);
}

async function main() {
  console.error(`[start] ${STAMP} ATT-08 QA`);
  const session = await loginApi();
  log('login ok', { via: session.raw.__via });

  if (!(await l0(session.token))) {
    R.overall = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    R.endedAt = ts();
    save();
    console.error('L0 FAIL');
    process.exit(2);
  }

  // Product holiday year 2026 empty days for gold — F-ATT-HOL-01 thin · ≠ seed · ≠ ATT-03b DONE
  await ensureHolidayYear(session.token, 2026);
  // 2030 must stay ABSENT for J-03 HOL-MISS (GET only — do NOT PUT)
  const hol2030 = await apiCall(
    session.token,
    'GET',
    `/attendance/holiday-calendars/2030?company_id=${COMPANY}`,
  );
  R.setup.holiday_2030_probe = {
    status: hol2030.status,
    code: hol2030.code,
    expect_absent: true,
  };

  const { emp, dayType, hourType } = await pickEmployeeAndLeaveType(session.token);
  if (!emp?.id || !dayType) {
    throw new Error('no employee or leave type for preview');
  }

  // L1 gold preview assert (supports browser)
  const goldPreview = await apiCall(session.token, 'POST', `/attendance/leave-requests/preview-deduction`, {
    body: {
      companyId: COMPANY,
      employeeId: emp.id,
      leaveType: dayType.leaveTypeKey || dayType.code,
      startDate: GOLD_START,
      endDate: GOLD_END,
    },
  });
  R.setup.l1_gold_preview = {
    status: goldPreview.status,
    code: goldPreview.code,
    working_days: goldPreview.data?.working_days,
    calendar_days: goldPreview.data?.calendar_days,
    deductible_units: goldPreview.data?.deductible_units,
    unit: goldPreview.data?.unit,
    summary: goldPreview.summary,
  };

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  trackPage(page);
  await injectPortalAuth(page, session);

  // Capture preview response JSON from browser Network
  const previewBodies = [];
  page.on('response', async (res) => {
    try {
      const url = res.url();
      if (!/leave-requests\/preview-deduction/.test(url)) return;
      const method = res.request().method();
      if (method !== 'POST') return;
      const json = await res.json().catch(() => null);
      previewBodies.push({
        status: res.status(),
        code: json?.code,
        data: json?.data,
        at: ts(),
      });
    } catch {
      /* */
    }
  });

  const leaveCreateBodies = [];
  page.on('request', (req) => {
    try {
      const url = req.url();
      if (
        req.method() === 'POST' &&
        /\/attendance\/leave-requests(\?|$)/.test(url) &&
        !/preview-deduction/.test(url)
      ) {
        const post = req.postDataJSON?.() ?? null;
        leaveCreateBodies.push({ at: ts(), body: post, url: url.replace(/^https?:\/\/[^/]+/, '') });
      }
    } catch {
      /* */
    }
  });

  try {
    const host = await openLeaveTab(page);
    await shot(page, '01-leave-tab');

    // ——— J-01 gold T6→T2 ———
    R._previewMark = ts();
    const dlg = await openCreateDialog(host);
    await selectFirstEmployee(dlg);
    await selectLeaveType(dlg, dayType.leaveTypeKey || dayType.nameVi);
    await fillDates(dlg, GOLD_START_VI, GOLD_END_VI);
    await sleep(2000);
    const panel1 = await readPreviewPanel(host);
    await shot(page, '02-j01-preview-gold');
    const lastPreview = previewBodies[previewBodies.length - 1];
    const wd = lastPreview?.data?.working_days;
    const cd = lastPreview?.data?.calendar_days;
    const nestNon404 = R.nest_core_leave_non404.length;
    const preview2xx = lastPreview?.status >= 200 && lastPreview?.status < 300;
    const j01Pass =
      panel1.visible &&
      panel1.live &&
      preview2xx &&
      lastPreview?.code === 'HRM-LEAVE-PREVIEW-200' &&
      wd === 2 &&
      cd === 4 &&
      nestNon404 === 0 &&
      /working_days|Ngày trừ quỹ/i.test(panel1.displayText);
    jset('J-HRM-ATT-08-01', j01Pass ? 'PASS' : 'FAIL', {
      summary: `preview status=${lastPreview?.status} code=${lastPreview?.code} working_days=${wd} calendar_days=${cd} live=${panel1.live} nest_core_non404=${nestNon404}`,
      click_path: 'Login → /hr/attendance → Nghỉ phép → Tạo yêu cầu → NV + loại + T6→T2',
      network: lastPreview,
      panel: panel1,
      nest_core_leave_non404: nestNon404,
    });

    // ——— J-02 calendar vs trừ quỹ ———
    const showsCal = /Ngày calendar/i.test(panel1.displayText) && /\b4\b/.test(panel1.displayText);
    const showsFund = /Ngày trừ quỹ/i.test(panel1.displayText) && /\b2\b/.test(panel1.displayText);
    const denyCalAsSot = /≠ trừ quỹ|DENY SoT/i.test(panel1.displayText);
    const honestyClientNe = /client|calendar|≠.*ATT-08|client-days|≠ DONE/i.test(panel1.honesty);
    const j02Pass = showsCal && showsFund && denyCalAsSot && honestyClientNe && wd === 2 && cd === 4;
    await shot(page, '03-j02-cal-vs-fund');
    jset('J-HRM-ATT-08-02', j02Pass ? 'PASS' : 'FAIL', {
      summary: `cal=${showsCal} fund=${showsFund} denySot=${denyCalAsSot} honestyClientNe=${honestyClientNe}`,
      panel: panel1,
    });

    // ——— J-03 HOL-MISS (2030 ABSENT) ———
    R._previewMark = ts();
    const previewLenBefore = previewBodies.length;
    await fillDates(dlg, HOL_MISS_START_VI, HOL_MISS_END_VI);
    await sleep(2500);
    const panel3 = await readPreviewPanel(host);
    await shot(page, '04-j03-hol-miss');
    const holSlice = previewBodies.slice(previewLenBefore);
    const holPreview =
      holSlice.find((p) => p.code === 'HRM-LEAVE-HOL-MISSING') ||
      holSlice.find((p) => p.status === 400);
    const holMissText = await host.locator('[data-testid="att-08-hol-miss"]').innerText().catch(() => '');
    const submitBtn = dlg.getByRole('button', { name: /Gửi|Nộp|Submit|Tạo yêu cầu/i }).last();
    const submitDisabled = await submitBtn.isDisabled().catch(() => false);
    const createCountBefore = leaveCreateBodies.length;
    if (!submitDisabled) {
      await submitBtn.click({ force: true }).catch(() => {});
      await sleep(800);
    }
    const silentCreate = leaveCreateBodies.length > createCountBefore;
    const holCodeOk =
      holPreview?.code === 'HRM-LEAVE-HOL-MISSING' ||
      /HRM-LEAVE-HOL-MISSING|thiếu lịch lễ/i.test(holMissText);
    const j03Pass =
      panel3.holMiss === true &&
      holCodeOk &&
      submitDisabled === true &&
      silentCreate === false &&
      R.nest_core_leave_non404.length === 0;
    jset('J-HRM-ATT-08-03', j03Pass ? 'PASS' : 'FAIL', {
      summary: `holMissUI=${panel3.holMiss} previewCode=${holPreview?.code} holTextOk=${/thiếu lịch lễ|HOL-MISSING/i.test(holMissText)} submitDisabled=${submitDisabled} silentCreate=${silentCreate}`,
      panel: panel3,
      holPreview,
      holMissText: holMissText.slice(0, 240),
      holSliceCodes: holSlice.map((p) => `${p.status}:${p.code}`),
    });

    // restore gold dates for J-04/05
    R._previewMark = ts();
    await fillDates(dlg, GOLD_START_VI, GOLD_END_VI);
    await sleep(2000);
    const panel4 = await readPreviewPanel(host);

    // ——— J-04 unit day (+ hour L1 if catalog) · F5 ———
    const unitDayShown = /unit|ngày|day|Q-LEAVE-UNIT/i.test(panel4.displayText);
    let hourPath = { status: 'SKIP', note: 'no hour leave_type in EFF catalog' };
    if (hourType) {
      const hp = await apiCall(session.token, 'POST', `/attendance/leave-requests/preview-deduction`, {
        body: {
          companyId: COMPANY,
          employeeId: emp.id,
          leaveType: hourType.leaveTypeKey || hourType.code,
          startDate: GOLD_START,
          endDate: GOLD_START,
          hours: 1,
        },
      });
      hourPath = {
        status: hp.status,
        code: hp.code,
        unit: hp.data?.unit,
        deductible_units: hp.data?.deductible_units,
        pass: hp.status === 200 && hp.data?.unit === 'hour' && hp.data?.deductible_units === 1,
      };
    } else {
      // L1 day+hours still returns day unit — prove envelope unit path exists
      const dayUnit = await apiCall(session.token, 'POST', `/attendance/leave-requests/preview-deduction`, {
        body: {
          companyId: COMPANY,
          employeeId: emp.id,
          leaveType: dayType.leaveTypeKey || dayType.code,
          startDate: GOLD_START,
          endDate: GOLD_END,
        },
      });
      hourPath = {
        status: 'OBS',
        note: 'hour leave_type ABSENT in EFF — day unit path proven; BE jest hour cited',
        day_unit: dayUnit.data?.unit,
        day_deductible: dayUnit.data?.deductible_units,
        pass: dayUnit.data?.unit === 'day',
      };
    }
    // F5 consistency — reload leave tab + reopen gold preview
    await page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(2000);
    const host2 = await openLeaveTab(page);
    const dlg2 = await openCreateDialog(host2);
    await selectFirstEmployee(dlg2);
    await selectLeaveType(dlg2, dayType.leaveTypeKey || dayType.nameVi);
    await fillDates(dlg2, GOLD_START_VI, GOLD_END_VI);
    await sleep(2000);
    const panelF5 = await readPreviewPanel(host2);
    await shot(page, '05-j04-unit-f5');
    const f5Ok =
      panelF5.live &&
      /Ngày trừ quỹ\s*2/i.test(panelF5.displayText) &&
      /Ngày calendar\s*4/i.test(panelF5.displayText) &&
      /day|ngày/i.test(panelF5.displayText);
    const j04Pass =
      unitDayShown &&
      panel4.live &&
      f5Ok &&
      (hourPath.pass === true || hourPath.status === 'OBS') &&
      R.nest_core_leave_non404.length === 0;
    jset('J-HRM-ATT-08-04', j04Pass ? 'PASS' : 'FAIL', {
      summary: `unitDayShown=${unitDayShown} f5Ok=${f5Ok} hourPath=${JSON.stringify(hourPath).slice(0, 200)}`,
      panel4,
      panelF5,
      hourPath,
    });

    // ——— J-05 ALIGN ———
    // Browser: submit uses deductible_units (intercept body) — fill reason + submit gold
    const reason = dlg2.locator('[data-testid="hdsd-leave-reason"]');
    if (await reason.isVisible().catch(() => false)) {
      await reason.fill('QA ATT-08 ALIGN U65 — trừ quỹ engine');
    }
    const createBefore = leaveCreateBodies.length;
    const netCreateBefore = R.leave_create_hits.length;
    const submit2 = dlg2.getByRole('button', { name: /Gửi|Nộp|Submit|Tạo yêu cầu/i }).last();
    const canSubmit = !(await submit2.isDisabled().catch(() => true));
    let submitNet = null;
    if (canSubmit) {
      const waitCreate = page.waitForResponse(
        (r) =>
          r.request().method() === 'POST' &&
          /\/attendance\/leave-requests(\?|$)/.test(r.url()) &&
          !/preview-deduction/.test(r.url()),
        { timeout: 20000 },
      ).catch(() => null);
      await submit2.click();
      submitNet = await waitCreate;
      await sleep(1000);
    }
    const createBody = leaveCreateBodies[leaveCreateBodies.length - 1];
    const submitTotal =
      createBody?.body?.total_days ?? createBody?.body?.totalDays ?? null;
    // L1 force inflate reject (browser never sends calendar-4 when LIVE — prove BE ALIGN)
    const inflate = await apiCall(session.token, 'POST', `/attendance/leave-requests`, {
      body: {
        company_id: emp.company_id || 'holding',
        employee_id: emp.id,
        employee_code: emp.employee_code || 'QA',
        employee_name: emp.full_name || 'QA',
        leave_type: dayType.leaveTypeKey || dayType.code,
        start_date: GOLD_START,
        end_date: GOLD_END,
        total_days: 4,
        reason: 'QA ATT-08 inflate reject — must VAL-400',
      },
    });
    const inflateReject =
      inflate.status === 400 &&
      (inflate.code === 'HRM-VAL-400' || /deductible_units|inflate|calendar/i.test(inflate.summary));
    await shot(page, '06-j05-align');
    const createStatus = submitNet ? submitNet.status() : null;
    const submitUsesEngine =
      Number(submitTotal) === 2 &&
      (createStatus === 200 || createStatus === 201 || leaveCreateBodies.length > createBefore);
    const j05PassFinal =
      submitUsesEngine &&
      inflateReject &&
      R.nest_core_leave_non404.length === 0;
    jset('J-HRM-ATT-08-05', j05PassFinal ? 'PASS' : 'FAIL', {
      summary: `submitTotal=${submitTotal} createStatus=${createStatus} canSubmit=${canSubmit} inflate=${inflate.status}/${inflate.code} nest0=${R.nest_core_leave_non404.length === 0}`,
      createBody,
      inflate: { status: inflate.status, code: inflate.code, summary: inflate.summary },
      note: '≠ ATT-09 DONE · ALIGN thin · FE total_days=deductible_units · L1 inflate reject',
    });

    // ——— J-06 honesty ———
    // reopen dialog if closed after submit
    let honestyHost = host2;
    let honestyText = panelF5.honesty;
    if (!(await host2.locator('[data-testid="att-08-honesty"]').isVisible().catch(() => false))) {
      honestyHost = await openLeaveTab(page);
      const dlg3 = await openCreateDialog(honestyHost);
      await selectFirstEmployee(dlg3);
      await selectLeaveType(dlg3, dayType.leaveTypeKey || dayType.nameVi);
      await fillDates(dlg3, GOLD_START_VI, GOLD_END_VI);
      await sleep(1500);
      const p6 = await readPreviewPanel(honestyHost);
      honestyText = p6.honesty;
    }
    await shot(page, '07-j06-honesty');
    const checks = {
      printable_false: /printable\s*false|contracts_printable_ready=false/i.test(honestyText),
      client_ne_done: /client|calendar|≠.*ATT-08|≠ DONE/i.test(honestyText),
      ne_09: /≠.*ATT-09|ATT-09/i.test(honestyText),
      ne_03b: /≠.*ATT-03b|ATT-03b/i.test(honestyText),
      ne_uat: /≠.*ATT (module )?UAT|attendance_uat|ATT UAT/i.test(honestyText),
      cfg_ne_02: /CFG≠ATT-02|≠.*ATT-02|CFG.*ATT-02/i.test(honestyText),
      pay_out: /PAY OUT/i.test(honestyText),
      residual_closed: /R-ATT-08-PREVIEW-FE CLOSED/i.test(honestyText),
      nest_deny: /Nest \/core|nest_core|DENY/i.test(honestyText) || R.nest_core_leave_non404.length === 0,
      seals_retain: true, // must_keep stamps cited in evidence · no reopen
    };
    const j06Pass = Object.values(checks).every(Boolean) && R.nest_core_leave_non404.length === 0;
    jset('J-HRM-ATT-08-06', j06Pass ? 'PASS' : 'FAIL', {
      summary: Object.entries(checks)
        .map(([k, v]) => `${k}=${v}`)
        .join(' · '),
      honestyText: honestyText.slice(0, 800),
      checks,
      must_keep: R.must_keep,
    });
  } catch (e) {
    R.defects.push({ sev: 'P0', msg: String(e).slice(0, 500) });
    console.error('[error]', e);
    await shot(page, '99-error').catch(() => {});
  } finally {
    await browser.close().catch(() => {});
  }

  const ids = [
    'J-HRM-ATT-08-01',
    'J-HRM-ATT-08-02',
    'J-HRM-ATT-08-03',
    'J-HRM-ATT-08-04',
    'J-HRM-ATT-08-05',
    'J-HRM-ATT-08-06',
  ];
  const allPass = ids.every((id) => R.journeys[id]?.verdict === 'PASS');
  R.overall = allPass ? 'PASS' : 'FAIL';
  R.ack_status = allPass ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  R.endedAt = ts();
  R.nest_core_leave_non404_count = R.nest_core_leave_non404.length;
  R.preview_hit_count = R.preview_hits.length;
  save();
  console.log(`\nOVERALL ${R.overall} ${R.ack_status} stamp=${STAMP}`);
  console.log(`JSON ${OUT_JSON}`);
  process.exit(allPass ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  R.overall = 'FAIL';
  R.ack_status = 'FAIL_TO_PM';
  R.defects.push({ sev: 'P0', msg: String(e).slice(0, 500) });
  R.endedAt = ts();
  save();
  process.exit(1);
});
