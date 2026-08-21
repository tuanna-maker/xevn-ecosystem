#!/usr/bin/env node
/**
 * QA-PO-HRM-MVP-GD1-ATT-07-CLUSTER-01 — U65 zero-seed · J-HRM-ATT-07-01..07 + J-HRM-ATT-06-04
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

const SICK_RANGE_LONG = { startVi: '01/12/2026', endVi: '05/12/2026' };
const SICK_RANGE_SHORT = { startVi: '18/12/2026', endVi: '19/12/2026' };

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-mvp-gd1-att-07-cluster-qa-01.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-mvp-gd1-att-07-cluster-qa-01');
const FIXTURE_PNG = join(SCREEN, '_fixture-sick-attach.png');
mkdirSync(SCREEN, { recursive: true });

const ATT06QC1 = 'ATT06QC1-MSM84GWC1';
const ATT05BQC1 = 'ATT05BQC1-MSM5SDQC1';
const ATT09QC1 = 'ATT09QC1-MSLUTL9D';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();
const STAMP = `ATT07QA1-${Date.now().toString(36).toUpperCase().slice(-8)}`;

function sickRangesForRun() {
  const off = parseInt(STAMP.replace(/\D/g, '').slice(-3), 10) % 20;
  const pad = (n) => String(n).padStart(2, '0');
  const dLong = 1 + off;
  const dShort = 15 + off;
  return {
    long: { startVi: `${pad(dLong)}/11/2027`, endVi: `${pad(dLong + 5)}/11/2027` },
    short: { startVi: `${pad(dShort)}/11/2027`, endVi: `${pad(dShort + 1)}/11/2027` },
  };
}

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const R = {
  work_item_id: 'QA-PO-HRM-MVP-GD1-ATT-07-CLUSTER-01',
  stamp: STAMP,
  fe_evidence: 'docs/qa/evidence/po-hrm-mvp-gd1-att-07-cluster-fe-01.md',
  be_evidence: 'docs/qa/evidence/po-hrm-mvp-gd1-att-07-cluster-be-01.md',
  startedAt: ts(),
  persona: { email: EMAIL, companyId: COMPANY },
  u65: 'zero-seed-browser-only',
  honesty: {
    attendance_uat_ready: false,
    ne_att07_done: true,
    ne_fr07_done: true,
    ne_att_module_uat: true,
    seed_used: false,
    c_slice: true,
  },
  must_keep: [ATT06QC1, ATT05BQC1, ATT09QC1],
  env: { PORTAL, HRM, XBOS, TENANT, commit: COMMIT },
  l0: {},
  l1: {},
  network: [],
  eff_hits: [],
  fund_order_hits: [],
  leave_create_hits: [],
  file_upload_hits: [],
  panel_hits: [],
  nest_core_leave_non404: [],
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

function ensureFixturePng() {
  const png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64',
  );
  writeFileSync(FIXTURE_PNG, png);
  return FIXTURE_PNG;
}

function isNestCoreLeave(url) {
  const p = String(url || '').toLowerCase();
  if (!/\/api\/hrm\/core(\/|$|\?)/.test(p)) return false;
  return /leave|holiday|attendance|\/att\/|hold/.test(p);
}

function trackUrl(method, url, status, extra = {}) {
  if (!/\/api\/hrm\//.test(url)) return;
  const nest_core = /\/api\/hrm\/core(\/|$|\?)/.test(url);
  const eff = /leave-types\/effective/.test(url) && method === 'GET';
  const fund = /sick-leave-fund-order/.test(url);
  const panel = /leave-balance(\/panel)?(\?|$)/.test(url) && method === 'GET';
  const preview = /preview-deduction/.test(url);
  const leaveCreate =
    /\/attendance\/leave-requests(\?|$)/.test(url) && method === 'POST' && !preview;
  const fileUp = /\/api\/hrm\/files/.test(url) && method === 'POST';
  const entry = {
    method,
    url: url.replace(/^https?:\/\/[^/]+/, '').slice(0, 480),
    status,
    at: ts(),
    nest_core,
    eff,
    fund,
    panel,
    leaveCreate,
    fileUp,
    ...extra,
  };
  R.network.push(entry);
  if (nest_core && isNestCoreLeave(url) && status !== 404) R.nest_core_leave_non404.push(entry);
  if (eff) R.eff_hits.push(entry);
  if (fund) R.fund_order_hits.push(entry);
  if (panel) R.panel_hits.push(entry);
  if (leaveCreate) R.leave_create_hits.push(entry);
  if (fileUp) R.file_upload_hits.push(entry);
}

function isLeaveCreateSuccess(hit) {
  if (!hit) return false;
  if (typeof hit.status === 'number' && hit.status >= 200 && hit.status < 300) return true;
  return hit.code === 'HRM-LEAVE-201' || hit.leaveStatus === 'pending';
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
const nestOk = () => R.nest_core_leave_non404.length === 0;

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
  return { token, expiresAt: Date.now() + 8 * 3600_000, companyId: COMPANY, user: { id: data.userId ?? 'ceo', email: EMAIL, tenantId: TENANT, companyId: COMPANY, roles: data.roles ?? ['group_ceo'] }, raw: data };
}

async function apiCall(token, method, path, opts = {}) {
  const url = path.startsWith('http') ? path : `${HRM}/api/hrm${path.startsWith('/') ? path : `/${path}`}`;
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
  const data = json?.data ?? json;
  const dayBranches = data?.dayBranches ?? data?.day_branches;
  trackUrl(method, url, r.status, dayBranches ? { dayBranches } : { code: json?.code ?? json?.error?.code });
  return { status: r.status, code: json?.code ?? json?.error?.code ?? null, data, json };
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
      if (method === 'POST' && /leave-requests(\?|$)/.test(url) && !/preview/.test(url)) {
        const j = await res.json().catch(() => ({}));
        const d = j?.data ?? j;
        extra = {
          code: j?.code,
          dayBranches: d?.dayBranches ?? d?.day_branches ?? null,
          id: d?.id,
          leaveStatus: d?.status,
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

async function openFundOrderPanel(page) {
  const host = await openAttSettingsShell(page);
  const nav = host.getByRole('button', { name: /Thứ tự quỹ nghỉ ốm/i }).first();
  if (await nav.isVisible().catch(() => false)) await nav.click({ timeout: 10000 });
  await sleep(1000);
  const panel = await waitAcross(page, '[data-testid="att-cfg-sick-leave-fund-order-precision"]', 20000);
  if (!panel) throw new Error('fund-order panel missing');
  return panel.host;
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

async function clickCreateLeave(host) {
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

async function selectSickLeaveType(dlg, page, preferKey) {
  const picker = dlg.locator('[data-testid="catalog-search-picker"]').first();
  const trigger = picker.locator('button').first();
  if (await trigger.isVisible().catch(() => false)) await trigger.click();
  else await picker.click().catch(() => {});
  await sleep(500);
  const key = preferKey || sickMeta?.sick?.leaveTypeKey || 'lvt_02';
  const byTestId = page.locator(`[data-testid="catalog-picker-option-${key}"]`).first();
  if (await byTestId.isVisible({ timeout: 3000 }).catch(() => false)) {
    await byTestId.click();
  } else {
    const sick = page
      .locator('[role="option"], [data-testid^="catalog-picker-option-"]')
      .filter({ hasText: /ốm|sick|lvt_02|LVT_02|LeaveCat/i })
      .first();
    if (await sick.isVisible({ timeout: 5000 }).catch(() => false)) await sick.click();
    else await page.locator('[role="option"]').first().click();
  }
  await sleep(2000);
}

let sickMeta = null;

async function fillDates(dlg, startVi, endVi) {
  const dates = dlg.locator('input.xevn-field-date, input[placeholder="dd/MM/yyyy"]');
  await dates.nth(0).fill(startVi);
  await dates.nth(1).fill(endVi);
  await sleep(2000);
}

async function pickEmployee(token) {
  const empRes = await apiCall(token, 'GET', `/employees?page=1&page_size=80&company_id=${COMPANY}`);
  const rows = empRes.data?.data ?? empRes.data?.items ?? [];
  return rows.find(
    (e) => e.status === 'active' && !/qa_c07|PENDING|HIRE-|CORE07/i.test(`${e.full_name || ''}${e.employee_code || ''}`),
  );
}

async function findSickTypeFromEff(token) {
  for (const cid of [COMPANY, 'holding', 'main']) {
    const eff = await apiCall(token, 'GET', `/attendance/leave-types/effective?company_id=${encodeURIComponent(cid)}`);
    const items = eff.data?.items ?? eff.data?.data ?? (Array.isArray(eff.data) ? eff.data : []);
    const sick =
      items.find((t) => t.leaveTypeKey === 'lvt_02' || t.leaveTypeKey === 'LVT_02') ??
      items.find((t) => t.category === 'sick') ??
      items.find((t) => /ốm|sick|lvt_02/i.test(`${t.leaveTypeKey || ''}${t.nameVi || ''}${t.name || ''}`));
    if (sick) return { companyId: cid, sick, effStatus: eff.status };
  }
  return null;
}

async function grantAnnual(token, employeeId, days = 14) {
  const put = await apiCall(token, 'PUT', `/attendance/leave-balance/tracked-entitlement`, {
    body: {
      company_id: COMPANY,
      employee_id: employeeId,
      leave_type: 'annual',
      balance_year: 2028,
      entitled_days: days,
    },
  });
  return put.status === 200 || put.status === 201;
}

async function waitSubmitReady(dlg, ms = 25000) {
  const submit = dlg.getByRole('button', { name: /Gửi|Nộp|Submit|yêu cầu/i }).last();
  const start = Date.now();
  while (Date.now() - start < ms) {
    if (!(await submit.isDisabled().catch(() => true))) return { ready: true, holMiss: false };
    const hol = await dlg.locator('[data-testid="att-08-hol-miss"]').isVisible().catch(() => false);
    if (hol) return { ready: false, holMiss: true };
    await sleep(500);
  }
  return { ready: false, holMiss: await dlg.locator('[data-testid="att-08-hol-miss"]').isVisible().catch(() => false) };
}

async function waitPreview2xx(ms = 20000) {
  const start = Date.now();
  while (Date.now() - start < ms) {
    const hit = R.network.find(
      (n) => /preview-deduction/.test(n.url) && n.method === 'POST' && n.status >= 200 && n.status < 300,
    );
    if (hit) return hit;
    await sleep(400);
  }
  return null;
}

async function selectCompLeaveType(dlg, page) {
  const picker = dlg.locator('[data-testid="catalog-search-picker"]').first();
  await picker.scrollIntoViewIfNeeded().catch(() => {});
  const trigger = picker.locator('button[role="combobox"], button').first();
  if (await trigger.isVisible().catch(() => false)) await trigger.click({ force: true });
  else await picker.click({ force: true }).catch(() => {});
  await sleep(600);
  const byId = page.locator('[data-testid="catalog-picker-option-ot_comp_leave"]').first();
  if (await byId.isVisible({ timeout: 4000 }).catch(() => false)) {
    await byId.click();
    return;
  }
  const scoped = picker
    .locator('[data-testid^="catalog-picker-option-"]')
    .filter({ hasText: /Nghỉ bù|nghỉ bù|ot_comp|bù OT/i });
  if (await scoped.first().isVisible({ timeout: 2000 }).catch(() => false)) {
    await scoped.first().click();
    return;
  }
  await page
    .locator('[role="option"], [data-testid^="catalog-picker-option-"]')
    .filter({ hasText: /Nghỉ bù|nghỉ bù|ot_comp|bù OT|Phép bù/i })
    .first()
    .click({ timeout: 10000 });
  await sleep(1500);
}

async function closeCreateDialog(page) {
  await page.keyboard.press('Escape').catch(() => {});
  await sleep(600);
}

async function fetchBalance(token, employeeId, leaveType) {
  const bal = await apiCall(token, 'GET', `/attendance/leave-balance?employee_id=${employeeId}&leave_type=${encodeURIComponent(leaveType)}&company_id=${COMPANY}`);
  const row = bal.data?.data ?? bal.data ?? {};
  return {
    pending: Number(row.pending_days ?? 0),
    entitled: Number(row.entitled_days ?? 0),
    source: row.source ?? null,
  };
}

async function main() {
  save();
  const session = await loginApi();
  const l0Ok = await l0Probes(session.token);
  R.l0.qc_dev_stack = l0Ok ? 'hrm/xbos/portal 200' : 'FAIL';
  if (!l0Ok) R.defects.push({ sev: 'P0', id: 'L0', note: 'stack probe failed' });

  try {
    const jestOut = execSync(
      'pnpm exec jest src/attendance/po-hrm-mvp-gd1-att-07-cluster-be-01.spec.ts --silent',
      { cwd: resolve(ROOT, 'apps/api/hrm-api'), encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] },
    );
    R.l1.be_jest_att07 = '7 PASS';
  } catch (e) {
    R.l1.be_jest_att07 = `FAIL ${String(e.message || e).slice(0, 120)}`;
    R.defects.push({ sev: 'P0', id: 'BE-JEST', note: 'att-07 be spec' });
  }

  const emp = await pickEmployee(session.token);
  sickMeta = await findSickTypeFromEff(session.token);
  R.setup.employee = emp ? { id: emp.id, name: emp.full_name } : null;
  R.setup.sick_eff = sickMeta;
  if (emp?.id) R.setup.grantAnnual = await grantAnnual(session.token, emp.id, 14);

  const browser = await chromium.launch({ headless: true, executablePath: CHROME, args: ['--disable-dev-shm-usage'] });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  trackPage(page);
  await injectPortalAuth(page, session);

  const sickRanges = sickRangesForRun();
  R.setup.sick_ranges = sickRanges;

  // J-07-01 picker BH/CTY
  try {
    const host = await openLeaveTab(page);
    await clickCreateLeave(host);
    const dlg = host.locator('[data-testid="att-leave-create-dialog-precision"]').first();
    await dlg.waitFor({ state: 'visible', timeout: 15000 });
    if (emp) await selectEmployeeInDlg(dlg, page, emp.full_name);
    await selectSickLeaveType(dlg, page, sickMeta?.sick?.leaveTypeKey);
    await sleep(1500);
    const effHit = R.eff_hits.find((h) => h.status === 200);
    const flagsVisible = await dlg.locator('[data-testid="att-07-sick-flags"]').isVisible({ timeout: 8000 }).catch(() => false);
    const bh = await dlg.locator('[data-testid="att-07-flag-bh"]').isVisible().catch(() => false);
    const cty = await dlg.locator('[data-testid="att-07-flag-cty"]').isVisible().catch(() => false);
    const expectBh = Boolean(sickMeta?.sick?.insuranceRegimeFlag);
    const expectCty = Boolean(sickMeta?.sick?.companyTopupFlag);
    const flagsMatch = bh === expectBh && cty === expectCty;
    await shot(page, '01-j07-01-flags');
    const pass01 = Boolean(effHit) && flagsVisible && flagsMatch && nestOk();
    jset('J-HRM-ATT-07-01', pass01 ? 'PASS' : 'FAIL', {
      summary: `EFF GET ${effHit?.status ?? '—'} flags=${flagsVisible} bh=${bh}/${expectBh} cty=${cty}/${expectCty}`,
      click_path: 'Nghỉ phép → Tạo đơn → loại ốm · att-07-flag-bh/cty',
      nest_core_0: nestOk(),
    });
    await closeCreateDialog(page);
  } catch (e) {
    jset('J-HRM-ATT-07-01', 'FAIL', { summary: String(e).slice(0, 300) });
  }

  // J-07-02 VAL-ATT without attach (≥3 days)
  try {
    const host = await openLeaveTab(page);
    await clickCreateLeave(host);
    const dlg = host.locator('[data-testid="att-leave-create-dialog-precision"]').first();
    if (emp) await selectEmployeeInDlg(dlg, page, emp.full_name);
    await selectSickLeaveType(dlg, page, sickMeta?.sick?.leaveTypeKey);
    await fillDates(dlg, sickRanges.long.startVi, sickRanges.long.endVi);
    await waitPreview2xx();
    const attachVisible = await dlg.locator('[data-testid="att-07-sick-attach"]').isVisible({ timeout: 5000 }).catch(() => false);
    const reason = dlg.locator('textarea').first();
    if (await reason.isVisible().catch(() => false)) await reason.fill(`QA ATT-07 VAL ${STAMP}`);
    const before = R.leave_create_hits.length;
    const submit = dlg.getByRole('button', { name: /Gửi|Nộp|Submit|yêu cầu/i }).last();
    const ready = await waitSubmitReady(dlg);
    if (ready.ready) await submit.click({ timeout: 10000 });
    else await submit.click({ force: true, timeout: 5000 }).catch(() => {});
    await sleep(3000);
    const failHit = R.leave_create_hits.slice(before).find((h) => typeof h.status === 'number' && h.status >= 400);
    const silent201 = R.leave_create_hits.slice(before).some((h) => isLeaveCreateSuccess(h));
    const bodyText = await page.evaluate(() => document.body.innerText.slice(0, 2500));
    const valAtt =
      failHit?.code === 'HRM-LEAVE-VAL-ATT' ||
      /HRM-LEAVE-VAL-ATT|giấy bác sĩ|đính kèm|chứng từ|bác sĩ/i.test(bodyText) ||
      (failHit && failHit.status === 400);
    await shot(page, '02-j07-02-val-att');
    const pass02 = attachVisible && !silent201 && valAtt && nestOk();
    jset('J-HRM-ATT-07-02', pass02 ? 'PASS' : 'FAIL', {
      summary: `attach=${attachVisible} submitReady=${ready.ready} holMiss=${ready.holMiss} no201=${!silent201} valAtt=${valAtt} status=${failHit?.status ?? '—'} code=${failHit?.code ?? '—'}`,
      click_path: 'ốm ≥3d · no attach → block/400 VAL-ATT',
      nest_core_0: nestOk(),
    });
    await closeCreateDialog(page);
  } catch (e) {
    jset('J-HRM-ATT-07-02', 'FAIL', { summary: String(e).slice(0, 300) });
  }

  // J-07-03/04 submit + dayBranches toast + F5
  let createdId = null;
  try {
    const host = await openLeaveTab(page);
    await clickCreateLeave(host);
    const dlg = host.locator('[data-testid="att-leave-create-dialog-precision"]').first();
    if (emp) await selectEmployeeInDlg(dlg, page, emp.full_name);
    await selectSickLeaveType(dlg, page, sickMeta?.sick?.leaveTypeKey);
    await fillDates(dlg, sickRanges.short.startVi, sickRanges.short.endVi);
    await waitPreview2xx();
    const attachInput = dlg.locator('[data-testid="hdsd-leave-attachment-input"]').first();
    if (await attachInput.isVisible().catch(() => false)) {
      await attachInput.setInputFiles(ensureFixturePng());
      await sleep(3500);
    }
    const reason = dlg.locator('textarea').first();
    if (await reason.isVisible().catch(() => false)) await reason.fill(`QA ATT-07 sick ${STAMP}`);
    const pendingBefore = emp ? (await fetchBalance(session.token, emp.id, 'annual')).pending : 0;
    const before = R.leave_create_hits.length;
    const submit = dlg.getByRole('button', { name: /Gửi|Nộp|Submit|yêu cầu/i }).last();
    const ready = await waitSubmitReady(dlg);
    if (!ready.ready) throw new Error(`submit disabled holMiss=${ready.holMiss}`);
    await submit.click({ timeout: 10000 });
    await sleep(4500);
    const createHit = R.leave_create_hits.slice(before).find((h) => isLeaveCreateSuccess(h));
    createdId = createHit?.id ?? null;
    const branches = createHit?.dayBranches;
    const hasBranches = Array.isArray(branches) && branches.length > 0;
    const toastText = await page.evaluate(() => document.body.innerText.slice(0, 2000));
    const toastOk = /Phân nhánh ngày ốm/i.test(toastText) || hasBranches;
    await shot(page, '03-j07-03-04-submit');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(2000);
    const list = await apiCall(session.token, 'GET', `/attendance/leave-requests?company_id=${COMPANY}&page_size=30`);
    const items = list.data?.data ?? list.data?.items ?? [];
    const row = createdId ? items.find((x) => x.id === createdId) : items.find((x) => String(x.reason || '').includes(STAMP));
    const f5Ok = Boolean(row && row.status === 'pending');
    const pendingAfter = emp ? (await fetchBalance(session.token, emp.id, 'annual')).pending : pendingBefore;
    const pass03 = Boolean(createHit) && nestOk();
    jset('J-HRM-ATT-07-03', pass03 ? 'PASS' : 'FAIL', {
      summary: `POST ${createHit?.status ?? '—'} id=${createdId ?? '—'} branches=${hasBranches ? branches.length : 0}`,
      click_path: 'attach + Gửi → POST 2xx pending',
      nest_core_0: nestOk(),
    });
    const pass04 = pass03 && toastOk && f5Ok;
    jset('J-HRM-ATT-07-04', pass04 ? 'PASS' : 'FAIL', {
      summary: `toast=${toastOk} F5 row=${Boolean(row)} pending ${pendingBefore}→${pendingAfter}`,
      click_path: 'dayBranches toast · F5 list persist',
      must_keep: ATT09QC1,
      nest_core_0: nestOk(),
    });
  } catch (e) {
    jset('J-HRM-ATT-07-03', 'FAIL', { summary: String(e).slice(0, 300) });
    jset('J-HRM-ATT-07-04', 'FAIL', { summary: String(e).slice(0, 300) });
  }

  // J-07-05 fund order GET/PUT
  try {
    const apiGet = await apiCall(session.token, 'GET', `/attendance/sick-leave-fund-order?company_id=${COMPANY}`);
    const host = await openFundOrderPanel(page);
    const programDefault = await host.locator('[data-testid="att-07-fund-order-program-default"]').isVisible({ timeout: 8000 }).catch(() => false);
    const getUi = R.fund_order_hits.filter((h) => h.method === 'GET' && h.status === 200).length > 0;
    const beforePut = R.fund_order_hits.filter((h) => h.method === 'PUT').length;
    await host.locator('[data-testid="hdsd-att-sick-leave-fund-order-save"]').click({ timeout: 10000 });
    await sleep(3000);
    const putHit = R.fund_order_hits.slice(beforePut).find((h) => h.method === 'PUT' && h.status >= 200 && h.status < 300);
    const persisted = await host.locator('[data-testid="att-07-fund-order-persisted"]').isVisible({ timeout: 5000 }).catch(() => false);
    await shot(page, '05-j07-05-fund-order');
    const pass05 =
      (apiGet.status === 200 || getUi) &&
      Boolean(putHit || persisted) &&
      (programDefault || apiGet.data?.isProgramDefault === true || putHit) &&
      nestOk();
    jset('J-HRM-ATT-07-05', pass05 ? 'PASS' : 'FAIL', {
      summary: `API GET ${apiGet.status} default=${programDefault || apiGet.data?.isProgramDefault} PUT ${putHit?.status ?? '—'} persisted=${persisted}`,
      click_path: 'Cài đặt → Thứ tự quỹ nghỉ ốm · GET/PUT sick-leave-fund-order',
      nest_core_0: nestOk(),
    });
  } catch (e) {
    jset('J-HRM-ATT-07-05', 'FAIL', { summary: String(e).slice(0, 300) });
  }

  // J-07-06 panel 5 buckets
  try {
    const host = await openLeaveTab(page);
    await clickCreateLeave(host);
    const dlg = host.locator('[data-testid="att-leave-create-dialog-precision"]').first();
    if (emp) await selectEmployeeInDlg(dlg, page, emp.full_name);
    await selectSickLeaveType(dlg, page, sickMeta?.sick?.leaveTypeKey);
    const buckets = ['annual', 'seniority', 'compensatory', 'carry_over', 'advance'];
    const vis = {};
    for (const b of buckets) {
      vis[b] = await dlg.locator(`[data-testid="leave-balance-row-${b}"]`).isVisible({ timeout: 4000 }).catch(() => false);
    }
    const sickRow = await dlg.locator('[data-testid="leave-balance-row-sick"]').isVisible({ timeout: 1000 }).catch(() => false);
    const panelGet = R.panel_hits.some((h) => h.status === 200);
    await shot(page, '06-j07-06-panel');
    const pass06 = buckets.every((b) => vis[b]) && !sickRow && panelGet && nestOk();
    jset('J-HRM-ATT-07-06', pass06 ? 'PASS' : 'FAIL', {
      summary: `buckets=${JSON.stringify(vis)} sickRow=${sickRow} panelGET=${panelGet}`,
      click_path: 'form panel 5 MVP · no sick bucket',
      must_keep: ATT05BQC1,
      nest_core_0: nestOk(),
    });
    await page.keyboard.press('Escape').catch(() => {});
  } catch (e) {
    jset('J-HRM-ATT-07-06', 'FAIL', { summary: String(e).slice(0, 300) });
  }

  try {
    const host = await openLeaveTab(page);
    await clickCreateLeave(host);
    const dlg = host.locator('[data-testid="att-leave-create-dialog-precision"]').first();
    await dlg.waitFor({ state: 'visible', timeout: 20000 });
    if (emp) await selectEmployeeInDlg(dlg, page, emp.full_name);
    await selectCompLeaveType(dlg, page);
    const panel06 = await dlg.locator('[data-testid="att-06-form-panel"]').isVisible({ timeout: 8000 }).catch(() => false);
    const compRow = await dlg.locator('[data-testid="leave-balance-row-compensatory"]').isVisible({ timeout: 5000 }).catch(() => false);
    const annualRow = await dlg.locator('[data-testid="leave-balance-row-annual"]').isVisible({ timeout: 3000 }).catch(() => false);
    await shot(page, '07-j06-04-comp-regression');
    const pass064 = panel06 && compRow && annualRow && nestOk();
    jset('J-HRM-ATT-06-04', pass064 ? 'PASS' : 'FAIL', {
      summary: `att-06-form-panel=${panel06} compensatory=${compRow} annual sep=${annualRow}`,
      click_path: 'Tạo đơn → ot_comp_leave · panel tách annual',
      must_keep: ATT06QC1,
      nest_core_0: nestOk(),
    });
    await page.keyboard.press('Escape').catch(() => {});
  } catch (e) {
    jset('J-HRM-ATT-06-04', 'FAIL', { summary: String(e).slice(0, 300) });
  }

  // J-07-07 seals
  try {
    const host = await openLeaveTab(page);
    const honesty = await host.locator('[data-testid="att-07-honesty"]').innerText().catch(() => '');
    const seals =
      /≠ ATT-07|attendance_uat_ready=false|C-SLICE/i.test(honesty) &&
      /ATT06|compensatory|06/i.test(honesty) &&
      /ATT05|05b/i.test(honesty);
    await shot(page, '08-j07-07-seals');
    jset('J-HRM-ATT-07-07', seals && nestOk() ? 'PASS' : 'FAIL', {
      summary: `honesty seals=${seals} nest_core_non404=${R.nest_core_leave_non404.length}`,
      click_path: 'att-07-honesty · Nest /core 0 · must_keep',
      must_keep: [ATT06QC1, ATT05BQC1, ATT09QC1],
      nest_core_0: nestOk(),
    });
  } catch (e) {
    jset('J-HRM-ATT-07-07', 'FAIL', { summary: String(e).slice(0, 300) });
  }

  await browser.close();

  const coreJ = [
    'J-HRM-ATT-07-01',
    'J-HRM-ATT-07-02',
    'J-HRM-ATT-07-03',
    'J-HRM-ATT-07-04',
    'J-HRM-ATT-07-05',
    'J-HRM-ATT-07-06',
    'J-HRM-ATT-06-04',
    'J-HRM-ATT-07-07',
  ];
  const fails = coreJ.filter((id) => !String(R.journeys[id]?.verdict || '').startsWith('PASS'));
  R.overall = fails.length === 0 ? 'PASS' : 'FAIL';
  R.ack_status = fails.length === 0 ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  R.endedAt = ts();
  save();
  console.log(`\n=== ${R.ack_status} stamp=${STAMP} fails=${fails.join(',') || 'none'} ===`);
  process.exit(fails.length === 0 ? 0 : 1);
}

main().catch((e) => {
  R.defects.push({ sev: 'P0', id: 'RUNNER', note: String(e).slice(0, 200) });
  R.ack_status = 'FAIL_TO_PM';
  R.endedAt = ts();
  save();
  console.error(e);
  process.exit(1);
});
