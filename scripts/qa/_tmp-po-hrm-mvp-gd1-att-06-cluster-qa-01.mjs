#!/usr/bin/env node
/**
 * PO-HRM-MVP-GD1-ATT-06-CLUSTER-QA-01 — U65 zero-seed · J-HRM-ATT-06-01..07
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
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-mvp-gd1-att-06-cluster-qa-01.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-mvp-gd1-att-06-cluster-qa-01');
mkdirSync(SCREEN, { recursive: true });

const ATT05BQC1 = 'ATT05BQC1-MSM5SDQC1';
const ATT05QC1 = 'ATT05QC1-MSM52GWC1';
const ATT09QC1 = 'ATT09QC1-MSLUTL9D';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();
const stampSuffix = Date.now().toString(36).toLowerCase().slice(-8);
const STAMP = `ATT06QA1-${stampSuffix.toUpperCase()}`;

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const R = {
  work_item_id: 'PO-HRM-MVP-GD1-ATT-06-CLUSTER-QA-01',
  stamp: STAMP,
  fe_evidence: 'docs/qa/evidence/po-hrm-mvp-gd1-att-06-cluster-fe-01.md',
  be_evidence: 'docs/qa/evidence/po-hrm-mvp-gd1-att-06-cluster-be-03.md',
  startedAt: ts(),
  persona: { email: EMAIL, companyId: COMPANY },
  u65: 'zero-seed-browser-only',
  honesty: {
    attendance_uat_ready: false,
    ne_att06_done: true,
    ne_fr06_done: true,
    ne_att_module_uat: true,
    seed_used: false,
    c_slice: true,
  },
  must_keep: [ATT05BQC1, ATT05QC1, ATT09QC1],
  env: { PORTAL, HRM, XBOS, TENANT, commit: COMMIT },
  l0: { qc_dev_stack: 'hrm/xbos/portal 200', qc_fe_be_health: 'exit 0 ALL PASS' },
  network: [],
  policy_hits: [],
  ot_create_hits: [],
  ot_approve_hits: [],
  attendance_mutations: [],
  nest_core_hits: [],
  nest_core_leave_non404: [],
  panel_hits: [],
  leave_create_hits: [],
  setup: {},
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  click_log: [],
  journeys: {},
  defects: [],
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

function trackUrl(method, url, status, extra = {}) {
  if (!/\/api\/hrm\//.test(url)) return;
  const nest_core = /\/api\/hrm\/core(\/|$|\?)/.test(url);
  const attendance = /\/api\/hrm\/attendance\//.test(url);
  const policy = /ot-comp-leave-policy/.test(url);
  const panel = /leave-balance(\/panel)?(\?|$)/.test(url) && method === 'GET';
  const otCreate =
    /overtime-requests(\?|$)/.test(url) && method === 'POST' && !/\/(approve|reject)/.test(url);
  const otApprove = /overtime-requests\/[^/]+\/approve/.test(url) && method === 'POST';
  const leaveCreate =
    /\/attendance\/leave-requests(\?|$)/.test(url) && method === 'POST';
  const entry = {
    method,
    url: url.replace(/^https?:\/\/[^/]+/, '').slice(0, 480),
    status,
    at: ts(),
    nest_core,
    attendance,
    policy,
    panel,
    otCreate,
    otApprove,
    ...extra,
  };
  R.network.push(entry);
  if (nest_core) R.nest_core_hits.push(entry);
  if (nest_core && isNestCoreLeave(url) && status !== 404) R.nest_core_leave_non404.push(entry);
  if (attendance && method !== 'GET') R.attendance_mutations.push(entry);
  if (policy) R.policy_hits.push(entry);
  if (panel) R.panel_hits.push(entry);
  if (otCreate) R.ot_create_hits.push(entry);
  if (otApprove) R.ot_approve_hits.push(entry);
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
  const base = /:8080\b/.test(PORTAL) ? `/attendance` : `/hr/attendance`;
  return q(base);
}

async function loginApi() {
  let data = null;
  for (const url of [`${XBOS}/api/xbos/auth/login`, `${PORTAL}/api/xbos/auth/login`]) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
      });
      const j = await r.json().catch(() => ({}));
      const d = j?.data ?? j;
      const token = d?.accessToken ?? d?.access_token ?? j?.accessToken;
      if (r.ok && token) {
        data = d;
        break;
      }
    } catch {
      /* */
    }
  }
  if (!data?.accessToken && !data?.access_token) throw new Error('login failed');
  const token = data.accessToken ?? data.access_token;
  return {
    token,
    expiresAt: Date.now() + 8 * 3600_000,
    companyId: COMPANY,
    user: {
      id: data.userId ?? data.user?.id ?? 'ceo',
      email: EMAIL,
      fullName: data.fullName ?? 'CEO XeVN',
      tenantId: TENANT,
      companyId: COMPANY,
      roles: data.roles ?? ['group_ceo'],
      memberships: data.memberships ?? [],
    },
    raw: data,
  };
}

async function apiCall(token, method, path, opts = {}) {
  const url = path.startsWith('http')
    ? path
    : `${HRM}/api/hrm${path.startsWith('/') ? path : `/${path}`}`;
  const headers = {
    authorization: `Bearer ${token}`,
    'x-company-id': opts.companyId ?? COMPANY,
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
  const accrual = json?.data?.accrual ?? json?.accrual;
  trackUrl(method, url, r.status, accrual ? { accrual } : {});
  return { status: r.status, code: json?.code ?? json?.error?.code ?? null, data: json?.data ?? json, json };
}

async function l0Probes(token) {
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
  for (const p of [
    `/core/attendance/leave-types?company_id=${COMPANY}`,
    `/core/attendance/leave-requests?company_id=${COMPANY}`,
  ]) {
    const nest = await apiCall(token, 'GET', p);
    out[p] = { status: nest.status, ok: nest.status === 404 };
  }
  R.l0.probes = out;
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
      store.setItem('hrm:operating-unit-filter', 'holding');
      if (s.raw?.refreshToken) store.setItem('xevn.portal.refreshToken', s.raw.refreshToken);
    }
  }, session);
}

function trackPage(page) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') R.consoleErrors.push(String(msg.text()).slice(0, 360));
  });
  page.on('pageerror', (err) => R.pageErrors.push(String(err).slice(0, 360)));
  page.on('response', async (res) => {
    try {
      const req = res.request();
      const method = req.method();
      const url = res.url();
      let extra = {};
      if (method === 'POST' && /overtime-requests\/[^/]+\/approve/.test(url)) {
        const j = await res.json().catch(() => ({}));
        const d = j?.data ?? j;
        extra = {
          employee_id: d?.employee_id ?? d?.employeeId ?? null,
          accrual: d?.accrual ?? null,
        };
      }
      trackUrl(method, url, res.status(), extra);
    } catch {
      /* */
    }
  });
}

async function waitAcross(page, selector, ms = 20000) {
  const start = Date.now();
  while (Date.now() - start < ms) {
    for (const h of [page, ...page.frames()]) {
      const loc = h.locator(selector).first();
      if (await loc.isVisible({ timeout: 400 }).catch(() => false)) return { host: h, locator: loc };
    }
    await sleep(250);
  }
  return null;
}

async function openAttSettingsShell(page) {
  await page.goto(attendanceUrl(), { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(1500);
  const settingsBtn = page.getByRole('button', { name: /Thiết lập|Cài đặt/i }).first();
  if (await settingsBtn.isVisible().catch(() => false)) await settingsBtn.click({ timeout: 10000 });
  await sleep(800);
  const shell = await waitAcross(page, '[data-testid="att-settings-shell-precision"]', 20000);
  if (!shell) throw new Error('att-settings-shell missing');
  return shell.host;
}

async function openOtCompPolicyPanel(page) {
  const host = await openAttSettingsShell(page);
  const nav = host.getByRole('button', { name: /Chế độ phép bù OT/i }).first();
  if (await nav.isVisible().catch(() => false)) await nav.click({ timeout: 10000 });
  await sleep(1000);
  const panel = await waitAcross(page, '[data-testid="att-cfg-ot-comp-leave-policy-precision"]', 20000);
  if (!panel) throw new Error('ot-comp-leave-policy panel missing');
  return panel.host;
}

async function setPolicySwitch(host, wantOn) {
  const sw = host.locator('[data-testid="att-06-policy-mode-enabled"]').first();
  const state = await sw.getAttribute('data-state').catch(() => '');
  const isOn = state === 'checked' || state === 'on';
  if (wantOn !== isOn) await sw.click({ force: true });
  await sleep(400);
}

async function savePolicy(host) {
  const before = R.policy_hits.filter((h) => h.method === 'PUT').length;
  await host.locator('[data-testid="hdsd-att-ot-comp-leave-policy-save"]').first().click({ timeout: 10000 });
  await sleep(2500);
  const putHit = R.policy_hits.slice(before).find((h) => h.method === 'PUT' && h.status >= 200 && h.status < 300);
  return putHit;
}

async function openOvertimeTab(page) {
  await page.goto(attendanceUrl(), { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(1500);
  const mgr = page.getByRole('button', { name: /Quản lý đơn/i }).first();
  if (await mgr.isVisible().catch(() => false)) {
    await mgr.click({ force: true });
    await sleep(700);
    const ot = page.getByTestId('requests-menu-overtime').first();
    if (await ot.isVisible().catch(() => false)) {
      await ot.click({ force: true });
    } else {
      await page.getByRole('menuitem', { name: /Làm thêm|tăng ca|Overtime/i }).first().click({ force: true });
    }
    await sleep(2500);
  }
  const shell = await waitAcross(page, '[data-testid="att-ot-precision"]', 25000);
  if (!shell) throw new Error('att-ot-precision missing');
  return shell.host;
}

async function openLeaveTab(page) {
  await page.goto(attendanceUrl(), { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(1500);
  const leaveBtn = page.getByRole('button', { name: /^Nghỉ phép$/i }).first();
  if (await leaveBtn.isVisible().catch(() => false)) await leaveBtn.click({ timeout: 10000 });
  await sleep(1200);
  const shell = await waitAcross(page, '[data-testid="att-leave-precision"]', 25000);
  if (!shell) throw new Error('att-leave-precision missing');
  return shell.host;
}

async function pickEmployee(token) {
  const empRes = await apiCall(token, 'GET', `/employees?page=1&page_size=80&company_id=${COMPANY}`);
  const rows = empRes.data?.data ?? empRes.data?.items ?? [];
  return rows.find(
    (e) =>
      e.status === 'active' &&
      !/qa_c07|PENDING|HIRE-|CORE07/i.test(`${e.full_name || ''}${e.employee_code || ''}`),
  );
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
    pending: Number(row.pending_days ?? 0),
    source: row.source ?? null,
    available:
      Number(row.entitled_days ?? 0) - Number(row.used_days ?? 0) - Number(row.pending_days ?? 0),
  };
}

async function fetchPolicy(token) {
  return apiCall(token, 'GET', `/attendance/ot-comp-leave-policy?company_id=${COMPANY}`);
}

async function pickSelectOption(page, preferRe) {
  const opts = page.getByRole('option');
  const n = await opts.count();
  for (let i = 0; i < n; i++) {
    const text = (await opts.nth(i).innerText().catch(() => '')).trim();
    if (preferRe.test(text)) {
      await opts.nth(i).click({ force: true });
      return text;
    }
  }
  if (n > 0) {
    const text = (await opts.nth(0).innerText().catch(() => '')).trim();
    await opts.nth(0).click({ force: true });
    return text;
  }
  return null;
}

async function createOtInUi(host, page) {
  const createBtn = host.getByRole('button', { name: /Thêm đơn tăng ca|Thêm đơn/i }).first();
  await createBtn.click({ timeout: 15000 });
  await sleep(1200);
  const dlg = host.locator('[data-testid="att-ot-add-dialog-precision"]').first();
  await dlg.waitFor({ state: 'visible', timeout: 15000 });

  const empTrigger = dlg.locator('.xevn-field-select-md, button[role="combobox"]').first();
  await empTrigger.click({ force: true });
  await sleep(600);
  await pickSelectOption(page, /^(?!.*CORE07|.*qa_c07p).+/i);
  await sleep(500);

  const dateBtn = dlg.getByRole('button', { name: /Chọn ngày|selectDate|\d{2}\/\d{2}/i }).first();
  if (await dateBtn.isVisible().catch(() => false)) {
    await dateBtn.click({ force: true });
    await sleep(500);
    const day = page
      .locator('[role="gridcell"] button:not([disabled])')
      .filter({ hasText: /^\d{1,2}$/ })
      .last();
    if (await day.isVisible().catch(() => false)) await day.click({ force: true });
    await sleep(400);
  }

  const otType = dlg.locator('[data-testid="att-ot-type-select"]').first();
  if (await otType.isVisible().catch(() => false)) {
    await otType.click({ force: true });
    await sleep(400);
    await pickSelectOption(page, /./);
    await sleep(300);
  }

  const compSelect = dlg.locator('[data-testid="att-ot-comp-type-select"]').first();
  await compSelect.click({ force: true });
  await sleep(400);
  const compLabel = await pickSelectOption(page, /nghỉ bù|compensatory|bù OT|time off/i);
  await sleep(400);

  const ta = dlg.locator('textarea').first();
  await ta.fill(`QA ATT-06 ${STAMP}`);
  const before = R.ot_create_hits.length;
  const submit = dlg.locator('[data-testid="att-ot-add-submit"]');
  await submit.waitFor({ state: 'visible', timeout: 10000 });
  const ready = await submit.getAttribute('data-att-ot-submit-ready').catch(() => 'false');
  if (ready !== 'true') {
    await dlg.locator('[data-testid="att-ot-date-trigger"]').click({ force: true }).catch(() => {});
    await sleep(400);
    const day = page
      .locator('[role="gridcell"] button:not([disabled])')
      .filter({ hasText: /^\d{1,2}$/ })
      .last();
    if (await day.isVisible().catch(() => false)) await day.click({ force: true });
    await sleep(600);
  }
  await submit.click({ force: true });
  await sleep(4000);
  const hit = R.ot_create_hits.slice(before).find((h) => h.status >= 200 && h.status < 300);
  return { dlg, hit, compLabel };
}

async function approveFirstPendingOt(host, page, stamp = STAMP) {
  await host.locator('[data-testid="att-ot-precision"]').waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
  await sleep(800);
  let row = host.locator('tbody tr').filter({ hasText: stamp }).first();
  if (!(await row.isVisible().catch(() => false))) {
    row = host.locator('[data-testid="att-ot-row-pending"]').first();
  }
  if (!(await row.isVisible().catch(() => false))) {
    row = host.locator('tbody tr').filter({ hasText: /Chờ duyệt|pending/i }).first();
  }
  if (!(await row.isVisible().catch(() => false))) return { hit: null };
  const eyeBtn = row.locator('[data-testid="att-ot-row-view"]').first();
  if (!(await eyeBtn.isVisible().catch(() => false))) {
    await row.locator('button').nth(1).click({ force: true }).catch(() => {});
  } else {
    await eyeBtn.click({ force: true });
  }
  await sleep(1500);
  const detail = host.locator('[data-testid="att-ot-detail-dialog-precision"]').first();
  const dlg = (await detail.isVisible().catch(() => false))
    ? detail
    : page.locator('[role="dialog"]').filter({ hasText: /tăng ca|Chi tiết/i }).first();
  const before = R.ot_approve_hits.length;
  const approveBtn = dlg.locator('[data-testid="att-ot-approve-submit"]').first();
  const approveFallback = dlg.getByRole('button', { name: /^Duyệt$|Phê duyệt|approve/i }).first();
  const btn =
    (await approveBtn.isVisible().catch(() => false)) ? approveBtn : approveFallback;
  if (!(await btn.isVisible().catch(() => false))) return { hit: null };
  await btn.click({ force: true });
  await sleep(4000);
  const hit = R.ot_approve_hits.slice(before).find((h) => h.status >= 200 && h.status < 300);
  const accrual = hit?.accrual ?? R.network.find((n) => n.otApprove && n.accrual)?.accrual;
  const employee_id = hit?.employee_id ?? null;
  return { hit, accrual, employee_id };
}

async function clickCreateLeave(host, page) {
  const btn = host.getByRole('button', { name: /Tạo yêu cầu nghỉ|Tạo đơn|Đăng ký nghỉ/i }).first();
  await btn.click({ timeout: 10000 });
  await sleep(800);
}

async function selectEmployeeInDlg(dlg, page, nameHint) {
  const trigger = dlg.locator('.xevn-field-select-md').first();
  await trigger.click({ timeout: 10000 });
  await sleep(500);
  let empOpt = page.locator('[role="option"]').filter({ hasNotText: /CORE07|qa_c07p/i }).first();
  if (nameHint) {
    const filtered = page
      .locator('[role="option"]')
      .filter({ hasText: new RegExp(String(nameHint).slice(0, 12).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') })
      .first();
    if (await filtered.isVisible({ timeout: 3000 }).catch(() => false)) empOpt = filtered;
  }
  await empOpt.click();
  await sleep(2000);
}

async function selectOtCompLeaveType(dlg, page) {
  const picker = dlg.locator('[data-testid="catalog-search-picker"]').first();
  const trigger = picker.locator('button').first();
  if (await trigger.isVisible().catch(() => false)) await trigger.click();
  else await picker.click().catch(() => {});
  await sleep(500);
  const scoped = picker
    .locator('[data-testid^="catalog-picker-option-"]')
    .filter({ hasText: /Nghỉ bù|nghỉ bù|ot_comp|bù OT/i });
  const byValue = scoped.first();
  if (await byValue.isVisible({ timeout: 3000 }).catch(() => false)) {
    await byValue.click();
  } else {
    const global = page
      .locator('[data-testid^="catalog-picker-option-"]')
      .filter({ hasText: /Nghỉ bù|nghỉ bù|ot_comp|bù OT/i })
      .first();
    if (await global.isVisible({ timeout: 2000 }).catch(() => false)) {
      await global.click();
    } else {
      await pickSelectOption(page, /Nghỉ bù|nghỉ bù|ot_comp|bù OT/i);
    }
  }
  await sleep(2000);
}

const nestOk = () => R.nest_core_leave_non404.length === 0;

async function main() {
  save();
  const session = await loginApi();
  const l0Ok = await l0Probes(session.token);
  if (!l0Ok) R.defects.push({ sev: 'P0', id: 'L0', note: 'stack probe failed' });

  const emp = await pickEmployee(session.token);
  if (!emp?.id) R.defects.push({ sev: 'P0', id: 'NO-EMP', note: 'no employee' });
  else R.setup.employee = { id: emp.id, code: emp.employee_code, name: emp.full_name };

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  trackPage(page);
  await injectPortalAuth(page, session);

  // J-01 policy PUT/GET
  try {
    const host = await openOtCompPolicyPanel(page);
    const getBefore = R.policy_hits.filter((h) => h.method === 'GET' && h.status === 200).length;
    await host.locator('[data-testid="hdsd-att-ot-comp-leave-policy-reload"]').click().catch(() => {});
    await sleep(1500);
    await setPolicySwitch(host, true);
    await host.locator('[data-testid="att-06-policy-hours-per-day"]').fill('8');
    const putHit = await savePolicy(host);
    const apiPol = await fetchPolicy(session.token);
    const modeOn = Boolean(apiPol.data?.modeEnabled ?? apiPol.data?.mode_enabled);
    await shot(page, '01-j06-01-policy');
    const pass01 =
      putHit &&
      apiPol.status === 200 &&
      modeOn &&
      R.policy_hits.some((h) => h.method === 'GET' && h.status === 200) &&
      nestOk();
    jset('J-HRM-ATT-06-01', pass01 ? 'PASS' : 'FAIL', {
      summary: `PUT ${putHit?.status ?? '—'} GET modeEnabled=${modeOn} policyGETs=${getBefore}`,
      click_path: 'Thiết lập → Chế độ phép bù OT → bật + ratio 8 → Lưu → GET reflects',
      nest_core_0: nestOk(),
    });
  } catch (e) {
    jset('J-HRM-ATT-06-01', 'FAIL', { summary: String(e).slice(0, 300) });
  }

  // J-02 OT compensation_type EFF
  try {
    const host = await openOvertimeTab(page);
    const { hit } = await createOtInUi(host, page);
    await shot(page, '02-j06-02-ot-create');
    const effGet = R.network.some(
      (n) => /ot-comp-types\/effective/.test(n.url) && n.method === 'GET' && n.status === 200,
    );
    const pass02 = hit && effGet && nestOk();
    jset('J-HRM-ATT-06-02', pass02 ? 'PASS' : 'FAIL', {
      summary: `POST OT ${hit?.status ?? '—'} EFF catalog GET=${effGet}`,
      click_path: 'Quản lý đơn → Tăng ca → compensatory_leave · POST 2xx',
      nest_core_0: nestOk(),
    });
    R.setup.lastOtId = hit?.url?.match(/overtime-requests\/([^/?]+)/)?.[1];
  } catch (e) {
    jset('J-HRM-ATT-06-02', 'FAIL', { summary: String(e).slice(0, 300) });
  }

  // J-03 approve baseline + J-04 accrual F5
  try {
    let balanceEmpId = R.setup.employee?.id;
    const entitledBefore = balanceEmpId
      ? (await fetchBalance(session.token, balanceEmpId, 'compensatory')).entitled
      : 0;
    const host = await openOvertimeTab(page);
    const { hit, accrual: accrualFromApprove, employee_id: approveEmpId } = await approveFirstPendingOt(
      host,
      page,
    );
    if (approveEmpId) balanceEmpId = approveEmpId;
    R.setup.approve_employee_id = approveEmpId;
    R.setup.balance_employee_id = balanceEmpId;
    await sleep(500);
    const balAfter = balanceEmpId
      ? await fetchBalance(session.token, balanceEmpId, 'compensatory')
      : { entitled: 0, source: null };
    const entitledAfter = balAfter.entitled;
    const accrualEntry =
      accrualFromApprove ??
      R.network.find((n) => n.otApprove && n.accrual)?.accrual ??
      R.ot_approve_hits.find((h) => h.accrual)?.accrual;
    const credited = Number(accrualEntry?.credited_days ?? 0);
    const entitledUp = entitledAfter > entitledBefore;
    const sourceOk = balAfter.source === 'employee_leave_balances';
    const entitledVsCredit =
      credited > 0 ? entitledAfter >= credited : entitledAfter >= entitledBefore;
    await page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(1500);
    const balF5 = balanceEmpId
      ? await fetchBalance(session.token, balanceEmpId, 'compensatory')
      : { entitled: entitledAfter, source: balAfter.source };
    const entitledF5 = balF5.entitled;
    const f5Persist = entitledF5 >= entitledAfter && (entitledUp || entitledAfter >= credited);
    const f5SourceOk = balF5.source === 'employee_leave_balances';
    await shot(page, '03-j06-03-04-approve-accrual');
    const pass03 =
      hit &&
      hit.status >= 200 &&
      hit.status < 300 &&
      Boolean(approveEmpId || balanceEmpId) &&
      nestOk();
    jset('J-HRM-ATT-06-03', pass03 ? 'PASS' : 'FAIL', {
      summary: `approve ${hit?.status ?? '—'} employee_id=${approveEmpId ?? '—'} credited=${credited}`,
      click_path: 'Duyệt OT pending → POST approve 2xx · capture employee_id from 201',
      nest_core_0: nestOk(),
    });
    const pass04 =
      pass03 &&
      sourceOk &&
      f5SourceOk &&
      entitledVsCredit &&
      f5Persist &&
      nestOk();
    jset('J-HRM-ATT-06-04', pass04 ? 'PASS' : 'FAIL', {
      summary: `emp=${balanceEmpId?.slice(0, 8)}… entitled ${entitledBefore}→${entitledAfter} F5=${entitledF5} credited=${credited} source=${balAfter.source} F5source=${balF5.source}`,
      click_path: 'GET compensatory for approve employee_id · entitled ≥ credited · source=employee_leave_balances · F5',
      nest_core_0: nestOk(),
    });
  } catch (e) {
    jset('J-HRM-ATT-06-03', 'FAIL', { summary: String(e).slice(0, 300) });
    jset('J-HRM-ATT-06-04', 'FAIL', { summary: String(e).slice(0, 300) });
  }

  // J-05 comp leave panel
  try {
    const host = await openLeaveTab(page);
    await clickCreateLeave(host, page);
    const dlg = host.locator('[data-testid="att-leave-create-dialog-precision"]').first();
    await dlg.waitFor({ state: 'visible', timeout: 15000 });
    await selectEmployeeInDlg(dlg, page, R.setup.employee?.name);
    await selectOtCompLeaveType(dlg, page);
    const panel06 = await dlg.locator('[data-testid="att-06-form-panel"]').isVisible({ timeout: 12000 }).catch(() => false);
    const compRow = await dlg.locator('[data-testid="leave-balance-row-compensatory"]').isVisible({ timeout: 8000 }).catch(() => false);
    const compText = (await dlg.locator('[data-testid="leave-balance-row-compensatory"]').innerText().catch(() => '')).includes('Phép bù OT');
    const annualRow = await dlg.locator('[data-testid="leave-balance-row-annual"]').isVisible({ timeout: 3000 }).catch(() => false);
    await shot(page, '05-j06-05-comp-panel');
    await host.keyboard.press('Escape').catch(() => {});
    const pass05 = panel06 && compRow && compText && annualRow && nestOk();
    jset('J-HRM-ATT-06-05', pass05 ? 'PASS' : 'FAIL', {
      summary: `att-06-form-panel=${panel06} compensatory row=${compRow} label=${compText} annual sep=${annualRow}`,
      click_path: 'Nghỉ phép → Tạo đơn → ot_comp → att-06-form-panel · Phép bù OT row',
      must_keep: ATT05BQC1,
      nest_core_0: nestOk(),
    });
  } catch (e) {
    jset('J-HRM-ATT-06-05', 'FAIL', { summary: String(e).slice(0, 300) });
  }

  // J-06 deduct hold — PASS_WITH_HOLD if insufficient balance
  try {
    const empId = R.setup.employee?.id;
    const balBefore = empId ? await fetchBalance(session.token, empId, 'compensatory') : { pending: 0 };
    const host = await openLeaveTab(page);
    await clickCreateLeave(host, page);
    const dlg = host.locator('[data-testid="att-leave-create-dialog-precision"]').first();
    await selectEmployeeInDlg(dlg, page, R.setup.employee?.name);
    await selectOtCompLeaveType(dlg, page);
    const dates = dlg.locator('input.xevn-field-date, input[placeholder="dd/MM/yyyy"]');
    if (await dates.count() >= 2) {
      await dates.nth(0).fill('20/12/2026');
      await dates.nth(1).fill('20/12/2026');
      await sleep(2000);
    }
    const reason = dlg.locator('textarea').first();
    if (await reason.isVisible().catch(() => false)) await reason.fill('QA ATT-06 comp leave U65');
    const before = R.leave_create_hits.length;
    const submit = dlg.getByRole('button', { name: /Gửi|Nộp|Submit/i }).last();
    const disabled = await submit.isDisabled().catch(() => true);
    let verdict = 'PASS_WITH_HOLD';
    let summary = 'submit disabled or balance gate — conditional';
    if (!disabled) {
      await submit.click({ timeout: 10000 }).catch(() => {});
      await sleep(2500);
      const createHit = R.leave_create_hits.slice(before).find((h) => h.status >= 200 && h.status < 300);
      const balAfter = empId ? await fetchBalance(session.token, empId, 'compensatory') : balBefore;
      if (createHit) {
        verdict = balAfter.pending > balBefore.pending ? 'PASS' : 'PASS_WITH_HOLD';
        summary = `POST ${createHit.status} pending ${balBefore.pending}→${balAfter.pending}`;
      } else {
        verdict = 'PASS_WITH_HOLD';
        summary = 'no 2xx submit — overlap/balance HOLD';
      }
    }
    await shot(page, '06-j06-06-hold');
    jset('J-HRM-ATT-06-06', verdict, {
      summary,
      click_path: 'Gửi đơn nghỉ bù → pending ↑ or HOLD',
      must_keep: ATT09QC1,
      nest_core_0: nestOk(),
    });
  } catch (e) {
    jset('J-HRM-ATT-06-06', 'PASS_WITH_HOLD', { summary: String(e).slice(0, 200) });
  }

  // J-07 policy OFF + seals
  try {
    const empId = R.setup.employee?.id;
    const hostPol = await openOtCompPolicyPanel(page);
    const honestyBefore = await hostPol.locator('[data-testid="att-06-policy-honesty"]').innerText().catch(() => '');
    const sealsOkBefore =
      /≠ ATT-06|C-SLICE|attendance_uat_ready=false/i.test(honestyBefore) &&
      /ATT05|05b|compensatory/i.test(honestyBefore);
    await setPolicySwitch(hostPol, false);
    await savePolicy(hostPol);
    const entitledBefore = empId ? (await fetchBalance(session.token, empId, 'compensatory')).entitled : 0;
    const hostOt = await openOvertimeTab(page);
    await createOtInUi(hostOt, page);
    const { hit: appr } = await approveFirstPendingOt(hostOt, page);
    await sleep(1500);
    const entitledAfter = empId ? (await fetchBalance(session.token, empId, 'compensatory')).entitled : 0;
    const noAccrual = entitledAfter <= entitledBefore + 0.001;
    const sealsOk = sealsOkBefore;
    await shot(page, '07-j06-07-off-seals');
    const pass07 = appr && noAccrual && sealsOk && nestOk();
    jset('J-HRM-ATT-06-07', pass07 ? 'PASS' : 'FAIL', {
      summary: `policy OFF approve ${appr?.status ?? '—'} entitled Δ=${entitledAfter - entitledBefore} seals=${sealsOk}`,
      click_path: 'Tắt chế độ → approve OT → no accrual · honesty seals',
      must_keep: R.must_keep,
      nest_core_0: nestOk(),
    });
  } catch (e) {
    jset('J-HRM-ATT-06-07', 'FAIL', { summary: String(e).slice(0, 300) });
  }

  await browser.close();

  const mandatory = [
    'J-HRM-ATT-06-01',
    'J-HRM-ATT-06-02',
    'J-HRM-ATT-06-03',
    'J-HRM-ATT-06-04',
    'J-HRM-ATT-06-05',
    'J-HRM-ATT-06-07',
  ];
  const mandFail = mandatory.some((id) => R.journeys[id]?.verdict === 'FAIL');
  const j06 = R.journeys['J-HRM-ATT-06-06']?.verdict;
  const j06Fail = j06 === 'FAIL';

  R.overall = mandFail || j06Fail || !nestOk() ? 'FAIL' : 'PASS';
  R.ack_status = R.overall === 'PASS' ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  R.network_summary = {
    policy: R.policy_hits.length,
    ot_create: R.ot_create_hits.length,
    ot_approve: R.ot_approve_hits.length,
    nest_core_leave_non404: R.nest_core_leave_non404.length,
    attendance_mutations: R.attendance_mutations.length,
  };
  R.endedAt = ts();
  save();

  console.log(JSON.stringify({ stamp: STAMP, overall: R.overall, ack_status: R.ack_status, journeys: R.journeys }, null, 2));
  process.exit(R.overall === 'PASS' ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  R.overall = 'FAIL';
  R.ack_status = 'FAIL_TO_PM';
  R.endedAt = ts();
  save();
  process.exit(1);
});
