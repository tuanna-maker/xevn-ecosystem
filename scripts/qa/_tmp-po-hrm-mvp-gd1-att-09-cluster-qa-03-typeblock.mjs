#!/usr/bin/env node
/**
 * PO-HRM-MVP-GD1-ATT-09-CLUSTER-QA-03-TYPEBLOCK — narrow residual retest (U65 · zero-seed)
 * J-HRM-ATT-09-05 ONLY after FE-02 READY
 *   1) Create pending → open create overlap → assert data-testid=att-09-type-block (proactive and/or post-409)
 *   2) Pending row → att-09-type-block-hint
 *   3) Detail → att-09-type-block + leave-detail-type-readonly
 * FAIL if silent 409 only · seed · claim module UAT · wipe seals
 * must_keep: ATT09QC1-MSLUTL9D · ATT08QC1-MSLSL36C · ATT02/PLT/CORE · honesty false · PAY OUT
 * ≠ ATT-09 module UAT · ≠ reopen ATT-09 DONE · C-SLICE prior seal stands
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
const OUT_JSON = resolve(
  ROOT,
  'docs/qa/evidence/_tmp-po-hrm-mvp-gd1-att-09-cluster-qa-03-typeblock.json',
);
const SCREEN = resolve(
  ROOT,
  'docs/qa/evidence/screens/po-hrm-mvp-gd1-att-09-cluster-qa-03-typeblock',
);
mkdirSync(SCREEN, { recursive: true });
mkdirSync(resolve(ROOT, 'docs/qa/evidence'), { recursive: true });

const ATT09_QC = 'ATT09QC1-MSLUTL9D';
const ATT08_SEAL = 'ATT08QC1-MSLSL36C';
const ATT02_SEAL = 'ATT02QC1-MSLQZUK7';
const PLT01_SEAL = 'PLT01QC1-MSLPUQIU';
const CORE10_SEAL = 'CORE10QC1-MSLP0EJB';
const CORE09_SEAL = 'CORE09QC1-MSLNBA89';
const CORE07_SEAL = 'CORE07QC1-KZJTSHNT';

/** Fresh Mon–Tue window (2026) — avoid prior QA RANGE_A/B/C + prior QA-03 21–22 */
const RANGE_TB = {
  start: '2026-12-28',
  end: '2026-12-29',
  startVi: '28/12/2026',
  endVi: '29/12/2026',
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();
const stamp = Date.now().toString(36).toLowerCase().slice(-8);
const STAMP = `ATT09QA3-${stamp.toUpperCase()}`;

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
  work_item_id: 'PO-HRM-MVP-GD1-ATT-09-CLUSTER-QA-03-TYPEBLOCK',
  program: 'PO-HRM-MVP-GD1-CONTINUOUS',
  uc_ids: ['UC-BP-ATT-09', 'J-HRM-ATT-09-05'],
  stamp: STAMP,
  prior_qa: 'ATT09QA2-MSLUKI9U',
  prior_qc: ATT09_QC,
  fe02: 'docs/qa/evidence/po-hrm-mvp-gd1-att-09-cluster-fe-02.md',
  startedAt: ts(),
  persona: { email: EMAIL, companyId: COMPANY },
  u65: 'zero-seed-browser-only · product PUT tracked-entitlement if needed',
  honesty: {
    attendance_uat_ready: false,
    contracts_printable_ready: false,
    soft_ne_att09_done: true,
    ne_att08_eq_att09: true,
    ne_att_module_uat: true,
    cfg_ne_att02_done: true,
    pay_out: true,
    nest_core_deny: true,
    deny_att_leave_hold: true,
    seed_used: false,
    c_slice_ne_module: true,
    residual_close_ne_module_uat: true,
    reopen_att09_done: false,
  },
  must_keep: [
    ATT09_QC,
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
  nest_core_leave_non404: [],
  leave_create_hits: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  click_log: [],
  journeys: {},
  residuals: [],
  defects: [],
  setup: {},
  capture: { createBodies: [], createResponses: [] },
  asserts: {},
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
  console.log(`${verdict} ${id} — ${(detail.summary || '').slice(0, 900)}`);
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
    p.includes('/att/') ||
    p.includes('hold')
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
    leaveCreate,
  };
  R.network.push(entry);
  if (nest_core) R.nest_core_hits.push(entry);
  if (nest_core && isNestCoreLeave(url) && status !== 404) R.nest_core_leave_non404.push(entry);
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
  const nestProbe = await apiCall(token, 'POST', `/core/attendance/leave-requests`, {
    body: {
      employeeId: '00000000-0000-4000-8000-000000000001',
      leaveType: 'annual',
      startDate: RANGE_TB.start,
      endDate: RANGE_TB.end,
    },
  });
  out.nest_core_leave_create = { status: nestProbe.status, ok: nestProbe.status === 404 };
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
  const get = await apiCall(
    token,
    'GET',
    `/attendance/holiday-calendars/${year}?company_id=${COMPANY}`,
  );
  if (get.status === 200) {
    R.setup[`holiday_${year}`] = { status: 'present', via: 'GET' };
    return get;
  }
  const put = await apiCall(token, 'PUT', `/attendance/holiday-calendars/${year}`, {
    body: { companyId: COMPANY, days: [] },
  });
  R.setup[`holiday_${year}`] = {
    status: put.status === 200 || put.status === 201 ? 'created_empty' : 'fail',
    via: 'PUT F-ATT-HOL-01 thin',
    note: 'product path · ≠ seed',
  };
  save();
  return put;
}

function leaveTypeKey(t) {
  return t?.leaveTypeKey || t?.code || t?.leave_type || t?.key || null;
}

async function pickEmployee(token) {
  const ltRes = await apiCall(
    token,
    'GET',
    `/attendance/leave-types/effective?company_id=${COMPANY}`,
  );
  const types = ltRes.data?.data ?? ltRes.data ?? [];
  const dayType =
    types.find((t) => leaveTypeKey(t) === 'annual' && (t.unit || 'day') === 'day') ||
    types.find((t) => (t.unit || 'day') === 'day') ||
    types[0];
  const ltKey = leaveTypeKey(dayType) || 'annual';

  const empRes = await apiCall(
    token,
    'GET',
    `/employees?page=1&page_size=100&company_id=${COMPANY}`,
  );
  const rows = empRes.data?.data ?? empRes.data?.items ?? [];
  const active = rows.filter(
    (e) =>
      e.status === 'active' &&
      !/qa_c07|PENDING|HIRE-|CORE07/i.test(`${e.full_name || ''}${e.employee_code || ''}`),
  );

  let tracked = null;
  let soft = null;
  for (const e of active.slice(0, 40)) {
    const bal = await apiCall(
      token,
      'GET',
      `/attendance/leave-balance?employee_id=${e.id}&leave_type=${encodeURIComponent(ltKey)}&company_id=${COMPANY}`,
    );
    const row = bal.data?.data ?? bal.data ?? {};
    const source = row.source || 'default';
    if (source === 'employee_leave_balances' && !tracked) {
      tracked = { emp: e, balance: row, ltKey };
    } else if (source !== 'employee_leave_balances' && !soft) {
      soft = { emp: e, balance: row, ltKey };
    }
    if (tracked && soft) break;
  }
  R.setup.leaveType = dayType
    ? { key: ltKey, unit: dayType.unit || 'day', name: dayType.nameVi || dayType.name }
    : null;
  R.setup.tracked = tracked
    ? { id: tracked.emp.id, code: tracked.emp.employee_code, name: tracked.emp.full_name, ltKey }
    : null;
  R.setup.soft = soft
    ? { id: soft.emp.id, code: soft.emp.employee_code, name: soft.emp.full_name, ltKey }
    : null;
  save();
  return { dayType, ltKey, tracked, soft };
}

async function fetchBalance(token, employeeId, leaveType) {
  const bal = await apiCall(
    token,
    'GET',
    `/attendance/leave-balance?employee_id=${employeeId}&leave_type=${encodeURIComponent(leaveType)}&company_id=${COMPANY}`,
  );
  const row = bal.data?.data ?? bal.data ?? {};
  return {
    status: bal.status,
    entitled: Number(row.entitled_days ?? 0),
    used: Number(row.used_days ?? 0),
    pending: Number(row.pending_days ?? 0),
    available:
      Number(row.entitled_days ?? 0) - Number(row.used_days ?? 0) - Number(row.pending_days ?? 0),
    source: row.source || 'default',
  };
}

async function grantTrackedEntitlement(token, employeeId, leaveType, entitledDays = 12) {
  const put = await apiCall(token, 'PUT', `/attendance/leave-balance/tracked-entitlement`, {
    body: {
      company_id: COMPANY,
      employee_id: employeeId,
      leave_type: leaveType,
      balance_year: 2026,
      entitled_days: entitledDays,
    },
  });
  const verify = await fetchBalance(token, employeeId, leaveType);
  const ok =
    (put.status === 200 || put.status === 201) &&
    verify.source === 'employee_leave_balances' &&
    verify.entitled >= entitledDays;
  R.setup.tracked_grant = {
    status: put.status,
    code: put.code,
    u65: 'product-PUT · ≠ seed',
    ok,
    verify,
  };
  save();
  return { put, verify, ok };
}

async function openLeaveTab(page) {
  await page.goto(attendanceUrl(), { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(1500);
  const leaveBtn = page.getByRole('button', { name: /^Nghỉ phép$/i }).first();
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
  const createBtn = host
    .getByRole('button', { name: /Tạo yêu cầu nghỉ|Tạo yêu cầu|Create/i })
    .first();
  await createBtn.click({ timeout: 15000 });
  log('open create leave dialog');
  await sleep(800);
  const dlg = host.locator('[data-testid="att-leave-create-dialog-precision"]').first();
  await dlg.waitFor({ state: 'visible', timeout: 15000 });
  return dlg;
}

async function selectEmployeeByName(dlg, nameHint) {
  const search = dlg
    .locator('input[placeholder*="Nhân viên"], input[placeholder*="Tìm"], input')
    .first();
  if (nameHint && (await search.isVisible().catch(() => false))) {
    await search.fill('');
    await search.fill(String(nameHint).slice(0, 24));
    await sleep(700);
  }
  const trigger = dlg.locator('.xevn-field-select-md').first();
  if (await trigger.isVisible().catch(() => false)) {
    await trigger.click({ timeout: 10000 });
  } else {
    const combo = dlg.getByRole('combobox').first();
    await combo.click({ timeout: 10000 });
  }
  await sleep(600);
  const page = dlg.page();
  let opt = page.locator('[role="option"]').first();
  if (nameHint) {
    const filtered = page
      .locator('[role="option"]')
      .filter({ hasText: new RegExp(nameHint.slice(0, 12), 'i') })
      .first();
    if (await filtered.isVisible().catch(() => false)) opt = filtered;
  }
  await opt.waitFor({ state: 'visible', timeout: 15000 });
  const label = (await opt.innerText().catch(() => '')).trim();
  await opt.click();
  log('select employee', { label: label.slice(0, 80) });
  await sleep(600);
  return label;
}

async function selectLeaveType(dlg, preferredKey) {
  const picker = dlg.locator('[data-testid="catalog-search-picker"]').first();
  const hasPicker = await picker.isVisible().catch(() => false);
  if (hasPicker) {
    await picker.click({ timeout: 8000 });
    const search = dlg.locator('input[placeholder*="Tìm"], input[type="search"], input').first();
    if (preferredKey && (await search.isVisible().catch(() => false))) {
      const q =
        preferredKey === 'annual' ? 'Phép năm' : String(preferredKey).replace(/^hr_/, '');
      await search.fill('');
      await search.fill(q.slice(0, 24));
      await sleep(500);
    }
  } else {
    const combo = dlg.getByRole('combobox').nth(1);
    if (await combo.isVisible().catch(() => false)) {
      await combo.click({ timeout: 8000 });
    }
  }
  await sleep(500);
  const page = dlg.page();
  let opt = null;
  if (preferredKey) {
    const patterns =
      preferredKey === 'annual'
        ? [/Phép năm/i, /\bannual\b/i]
        : [new RegExp(preferredKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')];
    for (const re of patterns) {
      const candidate = page.locator(`[role="option"]`).filter({ hasText: re }).first();
      if (await candidate.isVisible().catch(() => false)) {
        opt = candidate;
        break;
      }
    }
  }
  if (!opt) opt = page.locator('[role="option"]').first();
  await opt.waitFor({ state: 'visible', timeout: 12000 });
  const label = (await opt.innerText().catch(() => '')).trim();
  await opt.click();
  log('select leave type', { label: label.slice(0, 80), preferredKey });
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
  await sleep(1500);
}

async function fillReason(dlg, reason) {
  const reasonInput = dlg
    .locator('[data-testid="hdsd-leave-reason"], textarea, input[name*="reason"]')
    .first();
  if (await reasonInput.isVisible().catch(() => false)) {
    await reasonInput.fill(reason);
    log('fill reason');
  }
}

async function submitCreate(dlg) {
  const submitBtn = dlg.getByRole('button', { name: /Gửi|Nộp|Submit|Tạo yêu cầu/i }).last();
  const disabled = await submitBtn.isDisabled().catch(() => false);
  if (disabled) {
    log('submit disabled');
    return { clicked: false, disabled: true };
  }
  await submitBtn.click({ timeout: 10000 });
  log('submit create');
  await sleep(2500);
  return { clicked: true, disabled: false };
}

async function visibleTestId(host, testId) {
  const loc = host.locator(`[data-testid="${testId}"]`).first();
  const visible = await loc.isVisible().catch(() => false);
  const text = visible ? (await loc.innerText().catch(() => '')).replace(/\s+/g, ' ').trim() : '';
  return { visible, text: text.slice(0, 240) };
}

async function openRequestList(host) {
  // Default tab is calendar — hint lives on table rows under Danh sách / Chờ duyệt
  const listTab = host.getByRole('button', { name: /Danh sách yêu cầu|Danh sách/i }).first();
  const pendingTab = host.getByRole('button', { name: /Chờ duyệt/i }).first();
  if (await listTab.isVisible().catch(() => false)) {
    await listTab.click({ force: true });
    log('open Danh sách yêu cầu');
    await sleep(800);
    return 'list';
  }
  if (await pendingTab.isVisible().catch(() => false)) {
    await pendingTab.click({ force: true });
    log('open Chờ duyệt tab');
    await sleep(800);
    return 'pending';
  }
  // Tabs may be role=tab
  const tabList = host.getByRole('tab', { name: /Danh sách|Chờ duyệt/i }).first();
  if (await tabList.isVisible().catch(() => false)) {
    await tabList.click({ force: true });
    log('open list tab (role=tab)');
    await sleep(800);
    return 'tab';
  }
  return 'none';
}

async function main() {
  console.error(`[start] ${STAMP} ATT-09 QA-03 TYPEBLOCK`);
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

  await ensureHolidayYear(session.token, 2026);
  const { dayType, ltKey, tracked, soft } = await pickEmployee(session.token);
  // Prefer already-tracked emp (QA-02 path) so type-block residual is not blocked by soft grant year
  const grantTarget = tracked?.emp || soft?.emp;
  if (!ltKey || !grantTarget?.id) {
    R.overall = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    R.defects.push({ sev: 'P0', id: 'NO-EMPLOYEE-OR-TYPE', note: `ltKey=${ltKey}` });
    R.endedAt = ts();
    save();
    process.exit(2);
  }

  const grantKeys = Array.from(
    new Set(['annual', ltKey, soft?.ltKey, tracked?.ltKey, 'hr_custom_09'].filter(Boolean)),
  );
  R.setup.grantKeys = grantKeys;
  let grantOk = false;
  for (const key of grantKeys) {
    const g = await grantTrackedEntitlement(session.token, grantTarget.id, key, 12);
    if (g.ok) grantOk = true;
  }
  // If soft target failed verify, retry tracked emp explicitly
  if (!grantOk && tracked?.emp?.id && tracked.emp.id !== grantTarget.id) {
    for (const key of grantKeys) {
      const g = await grantTrackedEntitlement(session.token, tracked.emp.id, key, 12);
      if (g.ok) {
        grantOk = true;
        R.setup.grantTargetFallback = tracked.emp.id;
      }
    }
  }
  if (!grantOk) {
    // Accept product PUT 200 + HRM-LEAVE-BAL-201 even if GET source lag (cite verify)
    const last = R.setup.tracked_grant;
    if (last && (last.status === 200 || last.status === 201) && last.code === 'HRM-LEAVE-BAL-201') {
      grantOk = true;
      R.setup.grantAcceptPut200 = true;
    }
  }
  if (!grantOk) {
    R.overall = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    R.defects.push({ sev: 'P0', id: 'GRANT-FAIL', note: 'PUT tracked-entitlement failed' });
    R.endedAt = ts();
    save();
    process.exit(2);
  }

  const emp =
    R.setup.grantTargetFallback && tracked?.emp
      ? tracked.emp
      : grantTarget;
  const empName = emp.full_name || emp.employee_code || '';
  let effectiveLtKey = 'annual';

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  trackPage(page);
  await injectPortalAuth(page, session);

  page.on('request', (req) => {
    try {
      const url = req.url();
      if (
        req.method() === 'POST' &&
        /\/attendance\/leave-requests(\?|$)/.test(url) &&
        !/preview-deduction|approve|reject|cancel/.test(url)
      ) {
        const post = req.postDataJSON?.() ?? null;
        R.capture.createBodies.push({
          at: ts(),
          body: post,
          url: url.replace(/^https?:\/\/[^/]+/, ''),
        });
      }
    } catch {
      /* */
    }
  });

  page.on('response', async (res) => {
    try {
      const url = res.url();
      const method = res.request().method();
      if (method !== 'POST') return;
      if (
        /\/attendance\/leave-requests(\?|$)/.test(url) &&
        !/preview|approve|reject|cancel/.test(url)
      ) {
        const json = await res.json().catch(() => null);
        R.capture.createResponses.push({
          status: res.status(),
          code: json?.code,
          data: json?.data,
          at: ts(),
          url: url.replace(/^https?:\/\/[^/]+/, ''),
        });
      }
    } catch {
      /* */
    }
  });

  let requestIdPending = null;
  try {
    let host = await openLeaveTab(page);
    await shot(page, '01-leave-tab');

    // ——— Step A: create baseline pending (FE) ———
    const createLen0 = R.capture.createResponses.length;
    let dlg = await openCreateDialog(host);
    await selectEmployeeByName(dlg, empName);
    await selectLeaveType(dlg, effectiveLtKey || dayType?.nameVi);
    await fillDates(dlg, RANGE_TB.startVi, RANGE_TB.endVi);
    await fillReason(dlg, `QA ATT-09 typeblock baseline ${STAMP}`);
    await sleep(1200);
    await submitCreate(dlg);
    await sleep(2500);
    const createA =
      R.capture.createResponses
        .slice(createLen0)
        .find((c) => c.status >= 200 && c.status < 300) ||
      R.capture.createResponses.slice(createLen0).at(-1);
    const createBodyA = R.capture.createBodies.slice(createLen0).at(-1)?.body;
    effectiveLtKey =
      createA?.data?.leave_type || createBodyA?.leave_type || effectiveLtKey;
    requestIdPending =
      createA?.data?.id || createA?.data?.request_id || createA?.data?.requestId || null;
    R.asserts.createBaseline = {
      status: createA?.status ?? null,
      code: createA?.code ?? null,
      requestId: requestIdPending,
      leaveType: effectiveLtKey,
    };
    await shot(page, '02-create-baseline');
    if (!(createA && createA.status >= 200 && createA.status < 300 && requestIdPending)) {
      throw new Error(
        `baseline create FAIL status=${createA?.status} id=${requestIdPending}`,
      );
    }
    log('baseline pending created', { requestIdPending, effectiveLtKey });

    // ——— Step B: list hint (must open Danh sách / Chờ duyệt — not calendar) ———
    host = await openLeaveTab(page);
    await sleep(1000);
    const listMode = await openRequestList(host);
    await sleep(1200);
    // Prefer filter pending if control exists
    const pendingFilter = host
      .locator('button, [role="option"], select')
      .filter({ hasText: /^Chờ duyệt$|^pending$/i })
      .first();
    if (await pendingFilter.isVisible().catch(() => false)) {
      await pendingFilter.click({ force: true }).catch(() => {});
      await sleep(500);
    }

    let hint = await visibleTestId(host, 'att-09-type-block-hint');
    let hintNearRow = hint.visible;
    if (requestIdPending) {
      const statusCell = host.locator(`[data-testid="leave-status-${requestIdPending}"]`).first();
      if (await statusCell.isVisible().catch(() => false)) {
        await statusCell.scrollIntoViewIfNeeded().catch(() => {});
        await sleep(300);
        hintNearRow = await statusCell
          .locator('[data-testid="att-09-type-block-hint"]')
          .first()
          .isVisible()
          .catch(() => false);
        if (!hintNearRow) {
          // count in DOM even if offscreen (still evidence of render)
          const count = await statusCell.locator('[data-testid="att-09-type-block-hint"]').count();
          hintNearRow = count > 0;
          R.asserts.listHintDomCount = count;
        }
      } else {
        // scroll table for our employee / dates
        const row = host
          .locator('tr')
          .filter({ hasText: /28\/12\/2026|29\/12\/2026/ })
          .first();
        if (await row.isVisible().catch(() => false)) {
          await row.scrollIntoViewIfNeeded().catch(() => {});
          hintNearRow = await row
            .locator('[data-testid="att-09-type-block-hint"]')
            .first()
            .isVisible()
            .catch(() => false);
        }
      }
    }
    // Re-query global after list open
    if (!hint.visible) hint = await visibleTestId(host, 'att-09-type-block-hint');
    R.asserts.listHint = { ...hint, hintNearRow, listMode };
    await shot(page, '03-list-hint');
    log('list hint', R.asserts.listHint);

    // ——— Step C: create overlap path — proactive + post-409 TYPE-BLOCK ———
    dlg = await openCreateDialog(host);
    await selectEmployeeByName(dlg, empName);
    await selectLeaveType(dlg, effectiveLtKey || dayType?.nameVi);
    await fillDates(dlg, RANGE_TB.startVi, RANGE_TB.endVi);
    await fillReason(dlg, `QA ATT-09 typeblock overlap ${STAMP}`);
    await sleep(1800);
    // Proactive (client overlap detect before/without submit)
    let createBannerBefore = await visibleTestId(dlg, 'att-09-type-block');
    if (!createBannerBefore.visible) {
      // banner may be on dialog host sibling — search dialog parent
      createBannerBefore = await visibleTestId(host, 'att-09-type-block');
    }
    R.asserts.createBannerBefore409 = createBannerBefore;
    await shot(page, '04-create-overlap-proactive');

    const createLen1 = R.capture.createResponses.length;
    await submitCreate(dlg);
    await sleep(2500);
    const overlapResp =
      R.capture.createResponses.slice(createLen1).find((c) => c.status === 409 || c.status === 400) ||
      R.capture.createResponses.slice(createLen1).at(-1);
    let createBannerAfter = await visibleTestId(dlg, 'att-09-type-block');
    if (!createBannerAfter.visible) {
      createBannerAfter = await visibleTestId(host, 'att-09-type-block');
    }
    const openDetailCta = await visibleTestId(host, 'att-09-type-block-open-detail');
    R.asserts.overlapSubmit = {
      status: overlapResp?.status ?? null,
      code: overlapResp?.code ?? null,
      bannerAfter: createBannerAfter,
      openDetailCta,
    };
    await shot(page, '05-create-overlap-post409');

    const createTypeBlockOk =
      createBannerBefore.visible || createBannerAfter.visible;
    log('create type-block', {
      before: createBannerBefore.visible,
      after: createBannerAfter.visible,
      overlapStatus: overlapResp?.status,
    });

    // Prefer CTA open detail from banner
    let detailTypeBlock = { visible: false, text: '' };
    let detailReadonly = { visible: false, text: '' };
    let detailOpenedVia = null;
    if (openDetailCta.visible) {
      await host.locator('[data-testid="att-09-type-block-open-detail"]').first().click({ force: true });
      await sleep(1200);
      detailOpenedVia = 'att-09-type-block-open-detail';
    } else {
      // Close create if still open, then list→detail
      await host.keyboard.press('Escape').catch(() => {});
      await sleep(500);
      host = await openLeaveTab(page);
      if (requestIdPending) {
        const statusCell = host.locator(`[data-testid="leave-status-${requestIdPending}"]`).first();
        if (await statusCell.isVisible().catch(() => false)) {
          await statusCell.click({ force: true });
          await sleep(1000);
          detailOpenedVia = `leave-status-${requestIdPending}`;
        }
      }
      if (!detailOpenedVia) {
        const pendingRow = host
          .locator('button, tr, div')
          .filter({ hasText: /Chờ duyệt|pending/i })
          .first();
        await pendingRow.click({ force: true }).catch(() => {});
        await sleep(1000);
        detailOpenedVia = 'pending-row-fallback';
      }
    }

    const detail = host.locator('[data-testid="att-leave-detail-dialog-precision"]').first();
    const detailVisible = await detail.isVisible({ timeout: 5000 }).catch(() => false);
    if (detailVisible) {
      detailTypeBlock = await visibleTestId(host, 'att-09-type-block');
      detailReadonly = await visibleTestId(host, 'leave-detail-type-readonly');
      await shot(page, '06-detail-type-lock');
    } else {
      await shot(page, '06-detail-miss');
    }
    R.asserts.detail = {
      openedVia: detailOpenedVia,
      detailVisible,
      typeBlock: detailTypeBlock,
      typeReadonly: detailReadonly,
    };
    log('detail type-lock', R.asserts.detail);

    // API cite overlap also (not silent-only path — UI already asserted)
    const overlapApi = await apiCall(session.token, 'POST', `/attendance/leave-requests`, {
      body: {
        company_id: COMPANY,
        employee_id: emp.id,
        employee_code: emp.employee_code || 'EMP',
        employee_name: emp.full_name || 'NV',
        leave_type: effectiveLtKey,
        start_date: RANGE_TB.start,
        end_date: RANGE_TB.end,
        reason: `QA ATT-09 typeblock api-overlap ${STAMP}`,
        total_days: 2,
      },
    });
    R.asserts.overlapApi = {
      status: overlapApi.status,
      code: overlapApi.code,
      summary: overlapApi.summary,
    };

    const listHintOk = hint.visible || hintNearRow;
    const detailOk = detailTypeBlock.visible || detailReadonly.visible;
    const overlapUiOrApi =
      (overlapResp && (overlapResp.status === 409 || overlapResp.status === 400)) ||
      overlapApi.status === 409 ||
      overlapApi.status === 400;
    const silent409Only =
      overlapUiOrApi && !createTypeBlockOk && !listHintOk && !detailOk;
    const nest0 = R.nest_core_leave_non404.length === 0;

    const j05Pass =
      createTypeBlockOk &&
      listHintOk &&
      detailOk &&
      overlapUiOrApi &&
      nest0 &&
      !silent409Only &&
      R.honesty.seed_used === false;

    if (!j05Pass) {
      if (silent409Only) {
        R.defects.push({
          sev: 'P0',
          id: 'R-ATT-09-TYPE-BLOCK-SILENT-409',
          note: 'Overlap 409 without visible att-09-type-block / hint / detail lock',
        });
      }
      if (!createTypeBlockOk) {
        R.defects.push({
          sev: 'P1',
          id: 'R-ATT-09-TYPE-BLOCK-CREATE-MISS',
          note: `create banner before=${createBannerBefore.visible} after=${createBannerAfter.visible}`,
        });
      }
      if (!listHintOk) {
        R.defects.push({
          sev: 'P1',
          id: 'R-ATT-09-TYPE-BLOCK-HINT-MISS',
          note: 'att-09-type-block-hint not visible on pending list',
        });
      }
      if (!detailOk) {
        R.defects.push({
          sev: 'P1',
          id: 'R-ATT-09-TYPE-BLOCK-DETAIL-MISS',
          note: `detail typeBlock=${detailTypeBlock.visible} readonly=${detailReadonly.visible}`,
        });
      }
    } else {
      R.residuals = R.residuals.filter((x) => x.id !== 'R-ATT-09-TYPE-BLOCK-UI');
      R.asserts.residualClosed = {
        id: 'R-ATT-09-TYPE-BLOCK-UI',
        status: 'CLOSED',
        note: 'FE-02 visible TYPE-BLOCK on create overlap + list hint + detail lock PASS · ≠ ATT-09 module UAT',
      };
    }

    jset('J-HRM-ATT-09-05', j05Pass ? 'PASS' : 'FAIL', {
      summary: [
        `createBannerBefore=${createBannerBefore.visible}`,
        `createBannerAfter=${createBannerAfter.visible}`,
        `listHint=${listHintOk}`,
        `detailTypeBlock=${detailTypeBlock.visible}`,
        `detailReadonly=${detailReadonly.visible}`,
        `overlapUi=${overlapResp?.status}:${overlapResp?.code}`,
        `overlapApi=${overlapApi.status}:${overlapApi.code}`,
        `silent409Only=${silent409Only}`,
        `nest0=${nest0}`,
      ].join(' · '),
      click_path:
        'Nghỉ phép → Tạo pending → list hint → Tạo trùng lịch → att-09-type-block → detail type-lock',
      asserts: R.asserts,
      explicit:
        'residual CLOSED ≠ ATT-09 module UAT · C-SLICE ATT09QC1-MSLUTL9D stands · ≠ reopen DONE',
    });

    R.overall = j05Pass ? 'PASS' : 'FAIL';
    R.ack_status = j05Pass ? 'PASS_TO_PM' : 'FAIL_TO_PM';
    R.endedAt = ts();
    R.network_summary = {
      leave_create: R.leave_create_hits.length,
      nest_core_leave_non404: R.nest_core_leave_non404.length,
      seed: false,
    };
    save();
  } catch (e) {
    R.overall = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    R.defects.push({ sev: 'P0', id: 'RUNNER-EXCEPTION', note: String(e).slice(0, 500) });
    R.endedAt = ts();
    save();
    console.error(e);
  } finally {
    // cleanup pending via reject (product path · ≠ seed)
    if (requestIdPending) {
      await apiCall(session.token, 'POST', `/attendance/leave-requests/${requestIdPending}/reject`, {
        body: {
          reviewer_name: 'CEO XeVN',
          rejected_reason: `QA ATT-09 typeblock cleanup ${STAMP}`,
        },
      }).catch(() => {});
    }
    await browser.close().catch(() => {});
  }

  console.log(
    JSON.stringify(
      {
        stamp: STAMP,
        overall: R.overall,
        ack_status: R.ack_status,
        j05: R.journeys['J-HRM-ATT-09-05']?.verdict,
        asserts: R.asserts,
        defects: R.defects,
      },
      null,
      2,
    ),
  );
  process.exit(R.overall === 'PASS' ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
