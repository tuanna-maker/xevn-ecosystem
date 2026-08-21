#!/usr/bin/env node
/**
 * PO-HRM-MVP-GD1-ATT-09-CLUSTER-QA-02 — retest after BE-02 (U65 · zero-seed)
 *   Pre: PUT /attendance/leave-balance/tracked-entitlement entitled≥12 (product · ≠ seed)
 *   J-01 Submit tracked → pending↑ available↓ · held=pending_days · Nest /core 0
 *   J-02 Approve → 203 OK settle (leave_funnel_deferred OK) OR 2xx settle · Nest /core 0
 *   J-03 Reject → release 100% · Nest /core 0
 *   J-04 Soft ≠ ATT-09 DONE · honesty footer · Nest /core 0
 *   J-05 Overlap block + TYPE-BLOCK (UI miss → residual FE OK if hold/settle/release PASS)
 *   J-06 F5 + honesty seals · ≠ ATT UAT · printable false · PAY OUT · DENY att_leave_hold
 * DENY seed · Nest /core · invent att_leave_hold · soft/ATT-08=ATT-09 DONE · ATT UAT · CFG=ATT-02 · invent PAY/printable · honesty flip
 * Persona: ceo@xe.vn · companyId=main · C-SLICE · parent FAIL ATT09QA1-MSLTKERF
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
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-mvp-gd1-att-09-cluster-qa-02.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-mvp-gd1-att-09-cluster-qa-02');
mkdirSync(SCREEN, { recursive: true });
mkdirSync(resolve(ROOT, 'docs/qa/evidence'), { recursive: true });

const ATT08_SEAL = 'ATT08QC1-MSLSL36C';
const ATT02_SEAL = 'ATT02QC1-MSLQZUK7';
const PLT01_SEAL = 'PLT01QC1-MSLPUQIU';
const CORE10_SEAL = 'CORE10QC1-MSLP0EJB';
const CORE09_SEAL = 'CORE09QC1-MSLNBA89';
const CORE07_SEAL = 'CORE07QC1-KZJTSHNT';

/** Fresh ranges — Dec 2026 Mon–Tue / Wed–Thu / Mon–Tue later */
const RANGE_A = { start: '2026-12-07', end: '2026-12-08', startVi: '07/12/2026', endVi: '08/12/2026' };
const RANGE_B = { start: '2026-12-09', end: '2026-12-10', startVi: '09/12/2026', endVi: '10/12/2026' };
const RANGE_C = { start: '2026-12-14', end: '2026-12-15', startVi: '14/12/2026', endVi: '15/12/2026' };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();
const stamp = Date.now().toString(36).toLowerCase().slice(-8);
const STAMP = `ATT09QA2-${stamp.toUpperCase()}`;

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
  work_item_id: 'PO-HRM-MVP-GD1-ATT-09-CLUSTER-QA-02',
  program: 'PO-HRM-MVP-GD1-CONTINUOUS',
  uc_ids: ['UC-BP-ATT-09', 'FR-UC-BP-ATT-09'],
  stamp: STAMP,
  parent_fail: 'ATT09QA1-MSLTKERF',
  be02: 'docs/qa/evidence/po-hrm-mvp-gd1-att-09-cluster-be-02.md',
  startedAt: ts(),
  persona: { email: EMAIL, companyId: COMPANY },
  u65: 'zero-seed-browser-only · product PUT tracked-entitlement',
  honesty: {
    attendance_uat_ready: false,
    recruitment_uat_ready: false,
    jd_dynamic_done: false,
    contracts_printable_ready: false,
    hrm_personnel_uat_ready: false,
    soft_ne_att09_done: true,
    ne_att08_eq_att09: true,
    client_days_ne_att08_done: true,
    ne_att_module_uat: true,
    cfg_ne_att02_done: true,
    pay_out: true,
    nest_core_deny: true,
    deny_att_leave_hold: true,
    soft_ne_core06_done: true,
    plt_core_retain: true,
    seed_used: false,
    c_slice_ne_module: true,
  },
  must_keep: [ATT08_SEAL, ATT02_SEAL, PLT01_SEAL, CORE10_SEAL, CORE09_SEAL, CORE07_SEAL],
  env: { PORTAL, HRM, XBOS, TENANT, commit: COMMIT },
  l0: {},
  network: [],
  nest_core_hits: [],
  nest_core_leave_non404: [],
  leave_create_hits: [],
  leave_approve_hits: [],
  leave_reject_hits: [],
  panel_hits: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  click_log: [],
  journeys: {},
  residuals: [],
  defects: [],
  setup: {},
  capture: {
    createBodies: [],
    createResponses: [],
    approveResponses: [],
    rejectResponses: [],
    panelSnapshots: [],
  },
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
  console.log(`${verdict} ${id} — ${(detail.summary || '').slice(0, 700)}`);
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
  const leaveApprove = /\/leave-requests\/[^/]+\/approve/.test(url) && method === 'POST';
  const leaveReject = /\/leave-requests\/[^/]+\/reject/.test(url) && method === 'POST';
  const panel = /leave-balance(\/panel)?(\?|$)/.test(url) && method === 'GET';
  const entry = {
    method,
    url: url.replace(/^https?:\/\/[^/]+/, '').slice(0, 480),
    status: status ?? null,
    at: ts(),
    nest_core,
    preview,
    leaveCreate,
    leaveApprove,
    leaveReject,
    panel,
  };
  R.network.push(entry);
  if (nest_core) R.nest_core_hits.push(entry);
  if (nest_core && isNestCoreLeave(url) && status !== 404) R.nest_core_leave_non404.push(entry);
  if (leaveCreate) R.leave_create_hits.push(entry);
  if (leaveApprove) R.leave_approve_hits.push(entry);
  if (leaveReject) R.leave_reject_hits.push(entry);
  if (panel) R.panel_hits.push(entry);
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
  const nestProbe = await apiCall(token, 'POST', `/core/attendance/leave-requests`, {
    body: {
      employeeId: '00000000-0000-4000-8000-000000000001',
      leaveType: 'annual',
      startDate: RANGE_A.start,
      endDate: RANGE_A.end,
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
  const get = await apiCall(token, 'GET', `/attendance/holiday-calendars/${year}?company_id=${COMPANY}`);
  if (get.status === 200) {
    R.setup[`holiday_${year}`] = { status: 'present', via: 'GET', code: get.code };
    return get;
  }
  const put = await apiCall(token, 'PUT', `/attendance/holiday-calendars/${year}`, {
    body: { companyId: COMPANY, days: [] },
  });
  R.setup[`holiday_${year}`] = {
    status: put.status === 200 || put.status === 201 ? 'created_empty' : 'fail',
    via: 'PUT F-ATT-HOL-01 thin',
    code: put.code,
    note: 'product path · ≠ seed · ≠ ATT-03b DONE',
  };
  save();
  return put;
}

function leaveTypeKey(t) {
  return t?.leaveTypeKey || t?.code || t?.leave_type || t?.key || null;
}

async function pickEmployeeWithBalance(token) {
  const ltRes = await apiCall(
    token,
    'GET',
    `/attendance/leave-types/effective?company_id=${COMPANY}`,
  );
  const types = ltRes.data?.data ?? ltRes.data ?? [];
  // Prefer canonical annual / day unit · avoid QA custom catalog keys when possible
  const dayType =
    types.find((t) => leaveTypeKey(t) === 'annual' && (t.unit || 'day') === 'day') ||
    types.find(
      (t) =>
        (t.unit || 'day') === 'day' &&
        !/hr_custom|qa_leave|ATT override|ATTPLATQA/i.test(
          `${t.leaveTypeKey || ''} ${t.nameVi || ''}`,
        ),
    ) ||
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
      !/qa_c07|PENDING|HIRE-|CORE07/i.test(
        `${e.full_name || ''}${e.employee_code || ''}`,
      ),
  );

  let tracked = null;
  let soft = null;
  let scan = { trackedHits: 0, softHits: 0, defaultHits: 0 };
  for (const e of active.slice(0, 40)) {
    for (const t of (types.length ? types : [{ leaveTypeKey: ltKey }]).slice(0, 6)) {
      const key = leaveTypeKey(t) || ltKey;
      const bal = await apiCall(
        token,
        'GET',
        `/attendance/leave-balance?employee_id=${e.id}&leave_type=${encodeURIComponent(key)}&company_id=${COMPANY}`,
      );
      const row = bal.data?.data ?? bal.data ?? {};
      const source = row.source || 'default';
      if (source === 'employee_leave_balances' || source === 'custom_fields') {
        scan.trackedHits += 1;
        const available =
          Number(row.available_days ?? row.remaining_days ?? 0) ||
          Number(row.entitled_days || 0) -
            Number(row.used_days || 0) -
            Number(row.pending_days || 0);
        if (!tracked && available >= 1 && source === 'employee_leave_balances') {
          tracked = { emp: e, balance: row, available, ltKey: key };
        }
      } else {
        scan.defaultHits += 1;
        if (!soft) soft = { emp: e, balance: row, ltKey: key };
      }
    }
    if (tracked && soft) break;
  }

  R.setup.leaveType = dayType
    ? { key: ltKey, unit: dayType.unit || 'day', name: dayType.nameVi || dayType.name }
    : null;
  R.setup.balance_scan = scan;
  R.setup.tracked = tracked
    ? {
        id: tracked.emp.id,
        code: tracked.emp.employee_code,
        name: tracked.emp.full_name,
        ltKey: tracked.ltKey,
        balance: {
          entitled: tracked.balance.entitled_days,
          used: tracked.balance.used_days,
          pending: tracked.balance.pending_days,
          available: tracked.available,
          source: tracked.balance.source,
        },
      }
    : null;
  R.setup.soft = soft
    ? {
        id: soft.emp.id,
        code: soft.emp.employee_code,
        name: soft.emp.full_name,
        ltKey: soft.ltKey || ltKey,
        source: soft.balance?.source || 'default',
      }
    : null;
  save();
  return { dayType, ltKey: tracked?.ltKey || ltKey, tracked, soft, types, scan };
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
    held: Number(row.pending_days ?? row.held_units ?? row.held ?? 0),
    source: row.source || 'default',
    raw: row,
  };
}

/** U65 product path — HR PUT tracked entitlement (≠ pnpm seed:*) */
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
    path: '/api/hrm/attendance/leave-balance/tracked-entitlement',
    u65: 'product-PUT · ≠ seed',
    ok,
    verify: {
      source: verify.source,
      entitled: verify.entitled,
      used: verify.used,
      pending: verify.pending,
      available: verify.available,
    },
    summary: summarizeBody(put.json, 500),
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
  const createBtn = host.getByRole('button', { name: /Tạo yêu cầu nghỉ|Tạo yêu cầu|Create/i }).first();
  await createBtn.click({ timeout: 15000 });
  log('open create leave dialog');
  await sleep(800);
  const dlg = host.locator('[data-testid="att-leave-create-dialog-precision"]').first();
  await dlg.waitFor({ state: 'visible', timeout: 15000 });
  return dlg;
}

async function selectEmployeeByName(dlg, nameHint) {
  const search = dlg.locator('input[placeholder*="Nhân viên"], input[placeholder*="Tìm"], input').first();
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
    const filtered = page.locator('[role="option"]').filter({ hasText: new RegExp(nameHint.slice(0, 12), 'i') }).first();
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
    // type into search if present
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
    } else {
      const buttons = dlg.locator('button[role="combobox"], button:has-text("loại"), button:has-text("Chọn")');
      const n = await buttons.count();
      for (let i = 0; i < n; i++) {
        const b = buttons.nth(i);
        await b.click({ timeout: 5000 }).catch(() => {});
        break;
      }
    }
  }
  await sleep(500);
  const page = dlg.page();
  let opt = null;
  if (preferredKey) {
    const patterns =
      preferredKey === 'annual'
        ? [/Phép năm/i, /\bannual\b/i, /phép năm/i]
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
  const reasonInput = dlg.locator('[data-testid="hdsd-leave-reason"], textarea, input[name*="reason"]').first();
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

async function readPanelHeld(host, leaveTypeKey) {
  const panel = host.locator('[data-testid="leave-balance-panel"]').first();
  const visible = await panel.isVisible().catch(() => false);
  const heldSel = leaveTypeKey
    ? host.locator(`[data-testid="leave-balance-held-${leaveTypeKey}"]`).first()
    : host.locator('[data-testid^="leave-balance-held-"]').first();
  const availSel = leaveTypeKey
    ? host.locator(`[data-testid="leave-balance-available-${leaveTypeKey}"]`).first()
    : host.locator('[data-testid^="leave-balance-available-"]').first();
  const usedSel = leaveTypeKey
    ? host.locator(`[data-testid="leave-balance-used-${leaveTypeKey}"]`).first()
    : host.locator('[data-testid^="leave-balance-used-"]').first();
  const heldText = (await heldSel.innerText().catch(() => '—')).trim();
  const availText = (await availSel.innerText().catch(() => '—')).trim();
  const usedText = (await usedSel.innerText().catch(() => '—')).trim();
  const heldTitle = (await heldSel.getAttribute('title').catch(() => '')) || '';
  return {
    visible,
    heldText,
    availText,
    usedText,
    heldTitle,
    heldNum: Number.parseFloat(heldText),
    availNum: Number.parseFloat(availText),
    usedNum: Number.parseFloat(usedText),
  };
}

async function readHonesty(host) {
  const el = host.locator('[data-testid="att-09-honesty"]').first();
  const text = (await el.innerText().catch(() => '')).replace(/\s+/g, ' ').trim();
  return {
    visible: await el.isVisible().catch(() => false),
    text,
    softNe: /soft create alone ≠ ATT-09|≠ FR-09|soft.*≠.*ATT-09/i.test(text),
    neAtt08: /≠ ATT-08 preview = ATT-09|ATT08QC1/i.test(text),
    neUat: /≠ ATT module UAT|attendance_uat_ready=false/i.test(text),
    cfgNe: /CFG ≠ ATT-02|ATT02QC1/i.test(text),
    printable: /contracts_printable_ready=false|printable/i.test(text),
    denyHold: /DENY invent att_leave_hold|held=pending_days/i.test(text),
    payOut: /PAY OUT/i.test(text),
    nestDeny: /Nest \/core/i.test(text),
  };
}

async function closeDialogIfOpen(host) {
  const close = host.locator('[data-testid="att-leave-create-dialog-precision"] button').filter({ hasText: /Đóng|Hủy|Cancel/i }).first();
  if (await close.isVisible().catch(() => false)) {
    await close.click().catch(() => {});
    await sleep(400);
  }
  await host.keyboard?.press?.('Escape').catch(() => {});
  await sleep(300);
}

async function main() {
  console.error(`[start] ${STAMP} ATT-09 QA`);
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
  const { dayType, ltKey, tracked, soft, scan } = await pickEmployeeWithBalance(session.token);

  // Pick grant target: prefer soft (untracked) so we prove product PUT; else tracked emp
  const grantTarget = soft?.emp || tracked?.emp;
  if (!ltKey || !grantTarget?.id) {
    R.overall = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    R.defects.push({
      sev: 'P0',
      id: 'NO-EMPLOYEE-OR-TYPE',
      note: `ltKey=${ltKey} emp=${grantTarget?.id || 'none'}`,
    });
    R.endedAt = ts();
    save();
    process.exit(2);
  }

  // Grant annual + common UI fallback keys so hold AC works regardless of picker default
  const grantKeys = Array.from(
    new Set(
      ['annual', ltKey, soft?.ltKey, tracked?.ltKey, 'hr_custom_09'].filter(
        (k) => typeof k === 'string' && k.length > 0,
      ),
    ),
  );
  R.setup.grantKeys = grantKeys;
  let grantOk = false;
  let lastGrant = null;
  for (const key of grantKeys) {
    lastGrant = await grantTrackedEntitlement(session.token, grantTarget.id, key, 12);
    log('tracked entitlement grant', {
      leave_type: key,
      status: lastGrant.put.status,
      code: lastGrant.put.code,
      ok: lastGrant.ok,
      source: lastGrant.verify.source,
    });
    if (lastGrant.ok) grantOk = true;
  }
  if (!grantOk) {
    R.overall = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    R.defects.push({
      sev: 'P0',
      id: 'R-ATT-09-GRANT-PUT-FAIL',
      note: `PUT tracked-entitlement failed for keys=${grantKeys.join(',')}`,
    });
    R.endedAt = ts();
    save();
    console.error('GRANT FAIL — cannot run hold AC');
    process.exit(2);
  }

  const grantLt = 'annual';
  const postGrantBal = await fetchBalance(session.token, grantTarget.id, grantLt);
  // Also warm hr_custom_09 bal for UI default path
  const postGrantCustom = await fetchBalance(session.token, grantTarget.id, 'hr_custom_09');
  R.setup.postGrant = { annual: postGrantBal, hr_custom_09: postGrantCustom };

  const holdMode = 'tracked';
  R.setup.holdMode = holdMode;
  R.setup.tracked = {
    id: grantTarget.id,
    code: grantTarget.employee_code,
    name: grantTarget.full_name,
    ltKey: grantLt,
    balance: {
      entitled: postGrantBal.entitled,
      used: postGrantBal.used,
      pending: postGrantBal.pending,
      available: postGrantBal.available,
      source: postGrantBal.source,
    },
    via: 'PUT tracked-entitlement product (multi-key)',
    grantKeys,
  };
  save();

  const emp = grantTarget;
  const empName = emp.full_name || emp.employee_code || '';
  const expectHold = true;
  // Resolve after create from Network body; start with annual preference
  let effectiveLtKey = grantLt;

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
        R.capture.createBodies.push({ at: ts(), body: post, url: url.replace(/^https?:\/\/[^/]+/, '') });
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
      if (/\/attendance\/leave-requests(\?|$)/.test(url) && !/preview|approve|reject|cancel/.test(url)) {
        const json = await res.json().catch(() => null);
        R.capture.createResponses.push({
          status: res.status(),
          code: json?.code,
          data: json?.data,
          at: ts(),
          url: url.replace(/^https?:\/\/[^/]+/, ''),
        });
      }
      if (/\/leave-requests\/[^/]+\/approve/.test(url)) {
        const json = await res.json().catch(() => null);
        R.capture.approveResponses.push({
          status: res.status(),
          code: json?.code,
          data: json?.data,
          at: ts(),
        });
      }
      if (/\/leave-requests\/[^/]+\/reject/.test(url)) {
        const json = await res.json().catch(() => null);
        R.capture.rejectResponses.push({
          status: res.status(),
          code: json?.code,
          data: json?.data,
          at: ts(),
        });
      }
    } catch {
      /* */
    }
  });

  try {
    let host = await openLeaveTab(page);
    await shot(page, '01-leave-tab');

    // ——— Baseline balance (all grant keys — UI picker may not match annual) ———
    const balSnapshots = {};
    for (const key of grantKeys) {
      balSnapshots[key] = await fetchBalance(session.token, emp.id, key);
    }
    R.setup.balSnapshots = balSnapshots;
    let bal0 = balSnapshots[effectiveLtKey] || balSnapshots.annual || Object.values(balSnapshots)[0];
    R.setup.bal0 = bal0;
    log('baseline balance', { effectiveLtKey, bal0 });

    // ——— J-01 Hold submit ———
    const createLen0 = R.capture.createResponses.length;
    const bodyLen0 = R.capture.createBodies.length;
    let dlg = await openCreateDialog(host);
    await selectEmployeeByName(dlg, empName);
    await selectLeaveType(dlg, effectiveLtKey || dayType?.nameVi);
    await fillDates(dlg, RANGE_A.startVi, RANGE_A.endVi);
    await fillReason(dlg, `QA ATT-09 hold A ${STAMP}`);
    await sleep(1500);
    const submitA = await submitCreate(dlg);
    await sleep(2000);
    const createA = R.capture.createResponses.slice(createLen0).find((c) => c.status >= 200 && c.status < 300)
      || R.capture.createResponses.slice(createLen0).at(-1);
    const createBodyA = R.capture.createBodies.slice(bodyLen0).at(-1)?.body;
    const createdLeaveType =
      createA?.data?.leave_type || createBodyA?.leave_type || effectiveLtKey;
    if (createdLeaveType) effectiveLtKey = createdLeaveType;
    bal0 = balSnapshots[effectiveLtKey] || bal0;
    // If UI type was not pre-granted, product PUT now (hold already applied only if row existed)
    if (!balSnapshots[effectiveLtKey] || balSnapshots[effectiveLtKey].source !== 'employee_leave_balances') {
      const ensure = await grantTrackedEntitlement(session.token, emp.id, effectiveLtKey, 12);
      R.residuals.push({
        sev: 'P1',
        id: 'R-ATT-09-UI-TYPE-NE-ANNUAL',
        note: `UI selected ${effectiveLtKey}; post-hoc grant ok=${ensure.ok} — prefer FE pick Phép năm`,
      });
    }
    const bal1 = await fetchBalance(session.token, emp.id, effectiveLtKey);
    R.setup.bal0 = bal0;
    R.setup.effectiveLtKey = effectiveLtKey;
    // reopen leave tab to refresh panel FE
    host = await openLeaveTab(page);
    const panel1 = await readPanelHeld(host, effectiveLtKey);
    await shot(page, '02-j01-hold');
    const pendingUp = bal1.pending > bal0.pending;
    const availableDown = bal1.available < bal0.available;
    const heldEqPending = bal1.held === bal1.pending;
    const create2xx = createA && createA.status >= 200 && createA.status < 300;
    const pathPhysical = R.leave_create_hits.some((h) => /\/attendance\/leave-requests/.test(h.url) && h.status >= 200 && h.status < 300);
    const nest0 = R.nest_core_leave_non404.length === 0;
    const heldTitleOk = /held = pending_days/i.test(panel1.heldTitle) || Number.isFinite(panel1.heldNum);
    // AC-ATT-09-HOLD = API pending↑ available↓ (BR-BP-LV-06). Panel FE dash = residual OBS, not gate FAIL when API hold PASS.
    const holdAcPass = expectHold && pendingUp && availableDown && heldEqPending;
    if (holdAcPass && !heldTitleOk) {
      R.residuals.push({
        sev: 'P2 OBS',
        id: 'R-ATT-09-PANEL-HELD-DASH',
        owner: 'dev-fe',
        note: 'API hold pending↑ available↓ PASS · leave-balance-panel held/available still "—" after submit (bind/select residual)',
      });
    }
    const j01Pass =
      submitA.clicked &&
      create2xx &&
      pathPhysical &&
      holdAcPass &&
      nest0;
    if (!j01Pass) {
      R.defects.push({
        sev: 'P0',
        id: 'J01-HOLD',
        note: `Submit hold pending↑ available↓ failed · pending ${bal0.pending}→${bal1.pending} avail ${bal0.available}→${bal1.available} source=${bal1.source}`,
      });
    }
    const requestIdA =
      createA?.data?.id ||
      createA?.data?.request_id ||
      createA?.data?.requestId ||
      null;
    jset('J-HRM-ATT-09-01', j01Pass ? 'PASS' : 'FAIL', {
      summary: `mode=${holdMode} create=${createA?.status}:${createA?.code} pending ${bal0.pending}→${bal1.pending} avail ${bal0.available}→${bal1.available} held=${bal1.held} pathPhysical=${pathPhysical} holdAc=${holdAcPass} nest0=${nest0}`,
      click_path: 'Login → /hr/attendance → Nghỉ phép → Tạo yêu cầu → NV + loại + RANGE_A → Gửi',
      network: createA,
      bal0,
      bal1,
      panel: panel1,
      requestIdA,
      holdMode,
      expectHold,
      nest_core_leave_non404: R.nest_core_leave_non404.length,
    });
    if (!j01Pass) {
      /* defects already recorded */
    }

    // ——— J-02 Approve settle ———
    const approveLen0 = R.capture.approveResponses.length;
    // Prefer list approve button
    let approved = false;
    if (requestIdA) {
      const approveBtn = host.locator(`[data-testid="hdsd-leave-list-approve-${requestIdA}"]`).first();
      if (await approveBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await approveBtn.click({ timeout: 10000 });
        log('click approve list', { requestIdA });
        await sleep(2500);
        approved = true;
      }
    }
    if (!approved) {
      const anyApprove = host.locator('[data-testid^="hdsd-leave-list-approve-"]').first();
      if (await anyApprove.isVisible({ timeout: 3000 }).catch(() => false)) {
        await anyApprove.click({ timeout: 10000 });
        log('click approve list first pending');
        await sleep(2500);
        approved = true;
      } else {
        // API fallback still counts as path verify for settle — but prefer browser; mark OBS if used
        const list = await apiCall(session.token, 'GET', `/attendance/leave-requests?company_id=${COMPANY}&page_size=50`);
        const items = list.data?.data ?? list.data?.items ?? list.data ?? [];
        const pending = (Array.isArray(items) ? items : []).find(
          (r) =>
            r.status === 'pending' &&
            (r.id === requestIdA ||
              (r.employee_id === emp.id && r.start_date?.startsWith?.(RANGE_A.start))),
        );
        if (pending?.id) {
          // Try click row then detail approve
          const row = host.locator(`[data-testid="leave-status-${pending.id}"]`).first();
          if (await row.isVisible().catch(() => false)) {
            await row.click({ force: true }).catch(() => {});
            await sleep(800);
          }
          const detailApprove = host.getByRole('button', { name: /Duyệt|Approve/i }).first();
          if (await detailApprove.isVisible().catch(() => false)) {
            await detailApprove.click({ timeout: 8000 });
            await sleep(2500);
            approved = true;
            log('click approve detail');
          } else {
            const ap = await apiCall(session.token, 'POST', `/attendance/leave-requests/${pending.id}/approve`, {
              body: { reviewer_name: 'CEO XeVN', reviewer_employee_id: undefined },
            });
            R.capture.approveResponses.push({ status: ap.status, code: ap.code, data: ap.data, at: ts(), via: 'api_fallback' });
            approved = ap.status >= 200 && ap.status < 300;
            R.residuals.push({
              sev: 'P2 OBS',
              id: 'J02-APPROVE-API-FALLBACK',
              note: 'List approve CTA not visible for ceo@ — used physical POST /approve (same SoT)',
            });
            log('approve api fallback', { status: ap.status, id: pending.id });
          }
        }
      }
    }
    await sleep(1000);
    const approveA =
      R.capture.approveResponses.slice(approveLen0).find((c) => c.status >= 200 && c.status < 300) ||
      R.capture.approveResponses.slice(approveLen0).at(-1);
    const bal2 = await fetchBalance(session.token, emp.id, effectiveLtKey);
    host = await openLeaveTab(page);
    await shot(page, '03-j02-approve');
    const approveStatus = approveA?.status ?? 0;
    const approveData = approveA?.data ?? {};
    const funnelDeferred =
      approveData?.leave_funnel_deferred === true ||
      approveData?.data?.leave_funnel_deferred === true;
    // BE-02: 2xx/203 settle OK even when funnel deferred (not 409 SHEET-LOCKED block)
    const statusSettleOk = approveStatus >= 200 && approveStatus < 300;
    const notBlocked409 =
      !(approveStatus === 409 && /SHEET-LOCKED/i.test(String(approveA?.code || '')));
    const balanceSettleOk =
      expectHold && bal2.pending < bal1.pending && bal2.used > bal1.used;
    const j02Pass =
      statusSettleOk &&
      notBlocked409 &&
      balanceSettleOk &&
      R.nest_core_leave_non404.length === 0;
    if (!j02Pass) {
      R.defects.push({
        sev: 'P0',
        id: 'J02-SETTLE',
        note: `Approve settle pending→used failed · status=${approveStatus} code=${approveA?.code} funnelDeferred=${funnelDeferred} pending ${bal1.pending}→${bal2.pending} used ${bal1.used}→${bal2.used}`,
      });
    }
    jset('J-HRM-ATT-09-02', j02Pass ? 'PASS' : 'FAIL', {
      summary: `mode=${holdMode} approve=${approveA?.status}:${approveA?.code} funnelDeferred=${funnelDeferred} pending ${bal1.pending}→${bal2.pending} used ${bal1.used}→${bal2.used} balanceSettle=${balanceSettleOk} nest0=${R.nest_core_leave_non404.length === 0}`,
      click_path: 'After hold → list/detail Duyệt (GĐ1 one QL) · 203 leave_funnel_deferred OK',
      network: approveA,
      bal1,
      bal2,
      funnelDeferred,
      holdMode,
      expectHold,
    });
    if (!j02Pass) {
      /* defects recorded */
    }
    // ——— J-03 Reject release 100% ———
    const balBeforeRejectHold = await fetchBalance(session.token, emp.id, effectiveLtKey);
    const createLenB = R.capture.createResponses.length;
    dlg = await openCreateDialog(host);
    await selectEmployeeByName(dlg, empName);
    await selectLeaveType(dlg, effectiveLtKey || dayType?.nameVi);
    await fillDates(dlg, RANGE_B.startVi, RANGE_B.endVi);
    await fillReason(dlg, `QA ATT-09 reject B ${STAMP}`);
    await sleep(1500);
    await submitCreate(dlg);
    await sleep(2000);
    const createB =
      R.capture.createResponses.slice(createLenB).find((c) => c.status >= 200 && c.status < 300) ||
      R.capture.createResponses.slice(createLenB).at(-1);
    const balHeldB = await fetchBalance(session.token, emp.id, effectiveLtKey);
    const requestIdB =
      createB?.data?.id || createB?.data?.request_id || createB?.data?.requestId || null;

    host = await openLeaveTab(page);
    const rejectLen0 = R.capture.rejectResponses.length;
    let rejected = false;
    // Click Từ chối on list
    const rejectBtn = host.getByRole('button', { name: /Từ chối|Reject/i }).first();
    if (await rejectBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
      await rejectBtn.click({ timeout: 10000 });
      await sleep(600);
      const rejectDlg = host.locator('[data-testid="att-leave-reject-dialog-precision"]').first();
      if (await rejectDlg.isVisible().catch(() => false)) {
        const reason = rejectDlg.locator('textarea, input').first();
        await reason.fill(`QA ATT-09 release ${STAMP}`);
        const confirm = rejectDlg.getByRole('button', { name: /Từ chối|Xác nhận|Reject|Gửi/i }).last();
        await confirm.click({ timeout: 8000 });
        await sleep(2500);
        rejected = true;
        log('reject via dialog');
      }
    }
    if (!rejected && requestIdB) {
      const rj = await apiCall(session.token, 'POST', `/attendance/leave-requests/${requestIdB}/reject`, {
        body: {
          reviewer_name: 'CEO XeVN',
          rejected_reason: `QA ATT-09 release ${STAMP}`,
        },
      });
      R.capture.rejectResponses.push({ status: rj.status, code: rj.code, data: rj.data, at: ts(), via: 'api_fallback' });
      rejected = rj.status >= 200 && rj.status < 300;
      R.residuals.push({
        sev: 'P2 OBS',
        id: 'J03-REJECT-API-FALLBACK',
        note: 'Reject CTA path used API fallback when dialog not found',
      });
      log('reject api fallback', { status: rj.status });
    }
    const rejectB =
      R.capture.rejectResponses.slice(rejectLen0).find((c) => c.status >= 200 && c.status < 300) ||
      R.capture.rejectResponses.slice(rejectLen0).at(-1);
    const bal3 = await fetchBalance(session.token, emp.id, effectiveLtKey);
    await shot(page, '04-j03-reject');
    const released =
      expectHold &&
      balHeldB.pending > balBeforeRejectHold.pending &&
      bal3.pending < balHeldB.pending &&
      bal3.available > balHeldB.available;
    const rejectStatusOk = rejectB && rejectB.status >= 200 && rejectB.status < 300;
    const createBOk = createB && createB.status >= 200 && createB.status < 300;
    const j03Pass =
      createBOk && rejectStatusOk && released && R.nest_core_leave_non404.length === 0;
    if (!j03Pass) {
      R.defects.push({
        sev: 'P0',
        id: 'J03-RELEASE',
        note: `Reject release 100% failed · pending ${balBeforeRejectHold.pending}→${balHeldB.pending}→${bal3.pending}`,
      });
    }
    jset('J-HRM-ATT-09-03', j03Pass ? 'PASS' : 'FAIL', {
      summary: `mode=${holdMode} createB=${createB?.status} reject=${rejectB?.status}:${rejectB?.code} pending ${balBeforeRejectHold.pending}→${balHeldB.pending}→${bal3.pending} avail ${balBeforeRejectHold.available}→${balHeldB.available}→${bal3.available} released=${released}`,
      click_path: 'Hold RANGE_B → Từ chối (+ lý do) → release 100%',
      createB,
      rejectB,
      balBeforeRejectHold,
      balHeldB,
      bal3,
      holdMode,
      expectHold,
    });
    if (!j03Pass) {
      /* defects recorded */
    }
    // ——— J-04 Soft ≠ DONE + honesty ———
    host = await openLeaveTab(page);
    const honesty4 = await readHonesty(host);
    await shot(page, '05-j04-soft-honesty');
    let softCreate = { status: 'SKIP', note: 'no soft untracked employee found' };
    if (soft?.emp?.id && soft.emp.id !== emp.id) {
      const sc = await apiCall(session.token, 'POST', `/attendance/leave-requests`, {
        body: {
          company_id: COMPANY,
          employee_id: soft.emp.id,
          employee_code: soft.emp.employee_code || 'SOFT',
          employee_name: soft.emp.full_name || 'Soft NV',
          leave_type: soft.ltKey || effectiveLtKey,
          start_date: '2026-12-16',
          end_date: '2026-12-16',
          reason: `QA ATT-09 soft ${STAMP}`,
          total_days: 1,
        },
      });
      softCreate = {
        status: sc.status,
        code: sc.code,
        note: 'soft no-row create allow · ≠ ATT-09 DONE',
        pass: sc.status >= 200 && sc.status < 300,
      };
      const softId = sc.data?.id || sc.data?.request_id;
      if (softId && softCreate.pass) {
        await apiCall(session.token, 'POST', `/attendance/leave-requests/${softId}/reject`, {
          body: { reviewer_name: 'CEO XeVN', rejected_reason: `cleanup soft ${STAMP}` },
        }).catch(() => {});
      }
    } else {
      softCreate = {
        status: 'SKIP',
        note: 'grant target was soft emp — honesty alone asserts ≠ soft=DONE (no second untracked)',
        pass: true,
      };
    }
    const j04Pass =
      honesty4.visible &&
      honesty4.softNe &&
      honesty4.neUat &&
      R.nest_core_leave_non404.length === 0 &&
      (softCreate.status === 'SKIP' || softCreate.pass === true);
    jset('J-HRM-ATT-09-04', j04Pass ? 'PASS' : 'FAIL', {
      summary: `honesty softNe=${honesty4.softNe} neUat=${honesty4.neUat} softCreate=${softCreate.status}:${softCreate.code || softCreate.note}`,
      click_path: 'Leave tab honesty footer · soft create probe (API cite if untracked)',
      honesty: honesty4,
      softCreate,
      explicit: '≠ soft create alone = ATT-09 DONE',
    });

    // ——— J-05 Overlap + TYPE-BLOCK ———
    const createLenC = R.capture.createResponses.length;
    dlg = await openCreateDialog(host);
    await selectEmployeeByName(dlg, empName);
    await selectLeaveType(dlg, effectiveLtKey || dayType?.nameVi);
    await fillDates(dlg, RANGE_C.startVi, RANGE_C.endVi);
    await fillReason(dlg, `QA ATT-09 typeblock C ${STAMP}`);
    await sleep(1500);
    await submitCreate(dlg);
    await sleep(2000);
    const createC =
      R.capture.createResponses.slice(createLenC).find((c) => c.status >= 200 && c.status < 300) ||
      R.capture.createResponses.slice(createLenC).at(-1);
    const requestIdC =
      createC?.data?.id || createC?.data?.request_id || createC?.data?.requestId || null;

    host = await openLeaveTab(page);
    // Open detail for type-block
    let typeBlockVisible = false;
    let typeReadonly = false;
    if (requestIdC) {
      const statusCell = host.locator(`[data-testid="leave-status-${requestIdC}"]`).first();
      if (await statusCell.isVisible().catch(() => false)) {
        await statusCell.click({ force: true });
        await sleep(1000);
      } else {
        // click first pending row
        const pendingRow = host.locator('button, tr, div').filter({ hasText: /Chờ duyệt|pending/i }).first();
        await pendingRow.click({ force: true }).catch(() => {});
        await sleep(1000);
      }
    }
    const detail = host.locator('[data-testid="att-leave-detail-dialog-precision"]').first();
    if (await detail.isVisible({ timeout: 4000 }).catch(() => false)) {
      typeBlockVisible = await host.locator('[data-testid="att-09-type-block"]').isVisible().catch(() => false);
      typeReadonly = await host.locator('[data-testid="leave-detail-type-readonly"]').isVisible().catch(() => false);
      await shot(page, '06-j05-type-block');
      await host.keyboard.press('Escape').catch(() => {});
      await sleep(400);
    } else {
      // Probe via FE testid on page
      typeBlockVisible = await host.locator('[data-testid="att-09-type-block"]').isVisible().catch(() => false);
      await shot(page, '06-j05-type-block-miss');
    }

    // Overlap create same RANGE_C
    const overlap = await apiCall(session.token, 'POST', `/attendance/leave-requests`, {
      body: {
        company_id: COMPANY,
        employee_id: emp.id,
        employee_code: emp.employee_code || 'EMP',
        employee_name: emp.full_name || 'NV',
        leave_type: effectiveLtKey,
        start_date: RANGE_C.start,
        end_date: RANGE_C.end,
        reason: `QA ATT-09 overlap ${STAMP}`,
        total_days: 2,
      },
    });
    const overlapBlocked = overlap.status === 409 || overlap.status === 400;
    // cleanup pending C via reject
    if (requestIdC) {
      await apiCall(session.token, 'POST', `/attendance/leave-requests/${requestIdC}/reject`, {
        body: { reviewer_name: 'CEO XeVN', rejected_reason: `QA ATT-09 cleanup ${STAMP}` },
      }).catch(() => {});
    }

    const typeBlockOk = typeBlockVisible || typeReadonly;
    // QA-02 exit: overlap required; type-block UI miss → residual FE (not gate FAIL when hold/settle/release PASS)
    const j05CorePass =
      createC &&
      createC.status >= 200 &&
      createC.status < 300 &&
      overlapBlocked &&
      R.nest_core_leave_non404.length === 0;
    const j05Pass = j05CorePass; // type-block residual noted separately
    if (!typeBlockOk && j05CorePass) {
      R.residuals.push({
        sev: 'P1',
        id: 'R-ATT-09-TYPE-BLOCK-UI',
        owner: 'dev-fe',
        note: 'Overlap 409 PASS · att-09-type-block / leave-detail-type-readonly not observed in list→detail (FE-02 residual OK)',
      });
    }
    jset('J-HRM-ATT-09-05', j05Pass ? (typeBlockOk ? 'PASS' : 'PASS_WITH_RESIDUAL') : 'FAIL', {
      summary: `createC=${createC?.status} typeBlock=${typeBlockVisible} typeReadonly=${typeReadonly} overlap=${overlap.status}:${overlap.code} nest0=${R.nest_core_leave_non404.length === 0} residualTypeBlock=${!typeBlockOk}`,
      click_path: 'Create pending RANGE_C → detail TYPE-BLOCK · overlap POST 409/400',
      createC,
      typeBlockVisible,
      typeReadonly,
      overlap: { status: overlap.status, code: overlap.code, summary: overlap.summary },
    });
    if (!j05CorePass) {
      R.defects.push({
        sev: 'P0',
        id: 'J05-OVERLAP',
        note: `createC=${createC?.status} overlap=${overlap.status}`,
      });
    }

    // ——— J-06 F5 + honesty seals ———
    host = await openLeaveTab(page);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(2000);
    host = await openLeaveTab(page);
    const honesty6 = await readHonesty(host);
    const panel6 = await readPanelHeld(host, effectiveLtKey);
    await shot(page, '07-j06-f5-honesty');
    const sealsOk =
      honesty6.visible &&
      honesty6.printable &&
      honesty6.neUat &&
      honesty6.cfgNe &&
      honesty6.denyHold &&
      honesty6.payOut &&
      honesty6.softNe &&
      honesty6.neAtt08;
    const j06Pass = sealsOk && R.nest_core_leave_non404.length === 0 && R.honesty.seed_used === false;
    jset('J-HRM-ATT-09-06', j06Pass ? 'PASS' : 'FAIL', {
      summary: `F5 honesty seals printable=${honesty6.printable} neUat=${honesty6.neUat} denyHold=${honesty6.denyHold} nest0=${R.nest_core_leave_non404.length === 0}`,
      click_path: 'F5 → Nghỉ phép · att-09-honesty seals RETAIN',
      honesty: honesty6,
      panel: panel6,
      must_keep: R.must_keep,
      explicit:
        '≠ ATT-09 DONE · ≠ ATT UAT · printable false · PAY OUT · CFG≠ATT-02 · DENY att_leave_hold · C-SLICE',
    });

    // Overall — gate on hold/settle/release + honesty; J-05 PASS_WITH_RESIDUAL OK
    const gateIds = [
      'J-HRM-ATT-09-01',
      'J-HRM-ATT-09-02',
      'J-HRM-ATT-09-03',
      'J-HRM-ATT-09-04',
      'J-HRM-ATT-09-06',
    ];
    const gatePass = gateIds.every((id) => R.journeys[id]?.verdict === 'PASS');
    const j05v = R.journeys['J-HRM-ATT-09-05']?.verdict;
    const j05Ok = j05v === 'PASS' || j05v === 'PASS_WITH_RESIDUAL';
    const allPass = gatePass && j05Ok;
    R.overall = allPass ? 'PASS' : 'FAIL';
    R.ack_status = allPass ? 'PASS_TO_PM' : 'FAIL_TO_PM';
    R.endedAt = ts();
    R.network_summary = {
      leave_create: R.leave_create_hits.length,
      leave_approve: R.leave_approve_hits.length,
      leave_reject: R.leave_reject_hits.length,
      nest_core_leave_non404: R.nest_core_leave_non404.length,
      tracked_grant: R.setup.tracked_grant?.ok === true,
      seed: false,
    };
    R.explicit = {
      ne_att09_module_uat: true,
      c_slice: true,
      pay_out: true,
      soft_ne_done: true,
      ne_att08_eq_att09: true,
    };
    save();
    console.log(`\nOVERALL ${R.overall} ${R.ack_status} stamp=${STAMP}`);
    await browser.close();
    process.exit(allPass ? 0 : 1);
  } catch (err) {
    R.overall = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    R.defects.push({ sev: 'P0', id: 'RUNNER', note: String(err).slice(0, 500) });
    R.endedAt = ts();
    save();
    console.error(err);
    await browser.close().catch(() => {});
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
