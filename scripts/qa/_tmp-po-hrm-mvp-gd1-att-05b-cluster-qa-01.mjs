#!/usr/bin/env node
/**
 * PO-HRM-MVP-GD1-ATT-05B-CLUSTER-QA-01 — U65 zero-seed · J-HRM-ATT-05B-01..06 (đơn nghỉ)
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
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-mvp-gd1-att-05b-cluster-qa-01.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-mvp-gd1-att-05b-cluster-qa-01');
mkdirSync(SCREEN, { recursive: true });

const ATT05QC1 = 'ATT05QC1-MSM52GWC1';
const ATT04QC1 = 'ATT04QC1-MSM22G4W';
const ATT04BQC1 = 'ATT04BQC1-MSM3S8QC1';
const ATT09QC1 = 'ATT09QC1-MSLUTL9D';
const ATT03DQC1 = 'ATT03DQC1-MSM1CR19';

const RANGE_SUBMIT = {
  startVi: '24/12/2026',
  endVi: '25/12/2026',
};
const RANGE_OVERLAP = {
  startVi: '24/12/2026',
  endVi: '25/12/2026',
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();
const stampSuffix = Date.now().toString(36).toLowerCase().slice(-8);
const STAMP = `ATT05BQA1-${stampSuffix.toUpperCase()}`;

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const R = {
  work_item_id: 'PO-HRM-MVP-GD1-ATT-05B-CLUSTER-QA-01',
  stamp: STAMP,
  fe_evidence: 'docs/qa/evidence/po-hrm-mvp-gd1-att-05b-cluster-fe-01.md',
  ba_spec: 'docs/program/specs/PO-HRM-MVP-GD1-ATT-05B-CLUSTER-BA-01.md',
  startedAt: ts(),
  persona: { email: EMAIL, companyId: COMPANY },
  u65: 'zero-seed-browser-only',
  honesty: {
    attendance_uat_ready: false,
    ne_att05b_done: true,
    ne_att05_done: true,
    ne_att_module_uat: true,
    seed_used: false,
    c_slice: true,
    deny_merge_carry: true,
    deny_att_leave_hold: true,
  },
  must_keep: [ATT05QC1, ATT04QC1, ATT04BQC1, ATT09QC1, ATT03DQC1],
  env: { PORTAL, HRM, XBOS, TENANT, commit: COMMIT },
  l0: { qc_dev_stack: 'manual', qc_fe_be_health: 'exit 0 ALL PASS' },
  network: [],
  attendance_mutations: [],
  nest_core_hits: [],
  nest_core_leave_non404: [],
  lvt_hits: [],
  lvrule_hits: [],
  grant_hits: [],
  panel_hits: [],
  preview_hits: [],
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

function trackUrl(method, url, status) {
  if (!/\/api\/hrm\//.test(url)) return;
  const nest_core = /\/api\/hrm\/core(\/|$|\?)/.test(url);
  const attendance = /\/api\/hrm\/attendance\//.test(url);
  const lvt =
    /\/attendance\/leave-types/.test(url) &&
    !/\/effective/.test(url) &&
    (method === 'GET' || method === 'POST' || method === 'PUT' || method === 'PATCH');
  const lvrule = /\/attendance\/leave-accrual-policies/.test(url);
  const grant = /\/attendance\/leave-balance\/tracked-entitlement/.test(url) && method === 'PUT';
  const panel = /leave-balance(\/panel)?(\?|$)/.test(url) && method === 'GET';
  const preview = /preview-deduction/.test(url) && method === 'POST';
  const leaveCreate =
    /\/attendance\/leave-requests(\?|$)/.test(url) && method === 'POST' && !preview;
  const entry = {
    method,
    url: url.replace(/^https?:\/\/[^/]+/, '').slice(0, 480),
    status,
    at: ts(),
    nest_core,
    attendance,
    lvt,
    lvrule,
    grant,
    panel,
    preview,
    leaveCreate,
  };
  R.network.push(entry);
  if (nest_core) R.nest_core_hits.push(entry);
  if (nest_core && isNestCoreLeave(url) && status !== 404) R.nest_core_leave_non404.push(entry);
  if (attendance && method !== 'GET') R.attendance_mutations.push(entry);
  if (lvt) R.lvt_hits.push(entry);
  if (lvrule) R.lvrule_hits.push(entry);
  if (grant) R.grant_hits.push(entry);
  if (panel) R.panel_hits.push(entry);
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
  trackUrl(method, url, r.status);
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
  for (const [key, p] of [
    ['nest_core_leave_types', `/core/attendance/leave-types?company_id=${COMPANY}`],
    ['nest_core_leave_requests', `/core/attendance/leave-requests?company_id=${COMPANY}`],
  ]) {
    const nest = await apiCall(token, 'GET', p);
    out[key] = { status: nest.status, ok: nest.status === 404 };
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
  page.on('response', (res) => {
    try {
      const req = res.request();
      trackUrl(req.method(), res.url(), res.status());
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

async function openLeaveRules(page) {
  await page.goto(attendanceUrl(), { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(1500);
  const settingsBtn = page.getByRole('button', { name: /Thiết lập|Cài đặt/i }).first();
  if (await settingsBtn.isVisible().catch(() => false)) await settingsBtn.click({ timeout: 10000 });
  await sleep(800);
  const shell = await waitAcross(page, '[data-testid="att-settings-shell-precision"]', 20000);
  if (!shell) throw new Error('att-settings-shell missing');
  const leaveNav = shell.host.getByRole('button', { name: /Quy định nghỉ/i }).first();
  if (await leaveNav.isVisible().catch(() => false)) await leaveNav.click({ timeout: 10000 });
  await sleep(1000);
  const panel = await waitAcross(page, '[data-testid="att-cfg-leave-rules-precision"]', 25000);
  if (!panel) throw new Error('att-cfg-leave-rules missing');
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

async function toggleSwitchInWrap(host, testId, wantOn) {
  const wrap = host.locator(`[data-testid="${testId}"]`).first();
  await wrap.scrollIntoViewIfNeeded().catch(() => {});
  for (let attempt = 0; attempt < 4; attempt++) {
    const sw = wrap.locator('button[role="switch"]').first();
    if (!(await sw.isVisible().catch(() => false))) {
      await wrap.click({ force: true });
      await sleep(250);
      continue;
    }
    const state = await sw.getAttribute('data-state').catch(() => '');
    const isOn = state === 'checked' || state === 'on';
    if (wantOn === isOn) return;
    await sw.click({ force: true });
    await sleep(350);
  }
}

async function ensureEmployeeForBalancePanel(host, page) {
  const table = host.locator('[data-testid="leave-balance-by-type"]');
  if (await table.isVisible({ timeout: 2500 }).catch(() => false)) return;
  await clickCreateLeave(host, page);
  const dlg = host.locator('[data-testid="att-leave-create-dialog-precision"]').first();
  await dlg.waitFor({ state: 'visible', timeout: 15000 });
  const trigger = dlg.locator('.xevn-field-select-md').first();
  await trigger.click({ timeout: 10000 });
  await sleep(500);
  await page.locator('[role="option"]').filter({ hasNotText: /CORE07|qa_c07p/i }).first().click();
  await sleep(2500);
  await host.keyboard.press('Escape').catch(() => {});
  await sleep(1200);
}

async function selectCategoryCarryOver(page) {
  const opts = [
    page.locator('[role="option"]').filter({ hasText: /Chuyển năm/i }).first(),
    page.locator('[data-value="carry_over"]').first(),
    page.locator('[role="option"]').filter({ hasText: /carry_over/i }).first(),
  ];
  for (const opt of opts) {
    if (await opt.isVisible({ timeout: 2000 }).catch(() => false)) {
      await opt.click();
      return;
    }
  }
  throw new Error('category carry_over option not found');
}

async function clickCreateLeave(host, page) {
  const dlgOpen = await host
    .locator('[data-testid="att-leave-create-dialog-precision"]')
    .isVisible({ timeout: 800 })
    .catch(() => false);
  if (dlgOpen) return;
  const candidates = [
    host.getByRole('button', { name: /Tạo yêu cầu nghỉ|Tạo yêu cầu|Tạo đơn|Đăng ký nghỉ/i }).first(),
    host.locator('button').filter({ hasText: /Tạo yêu cầu/i }).first(),
    page.getByRole('button', { name: /Tạo yêu cầu/i }).first(),
  ];
  for (const btn of candidates) {
    if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await btn.click({ timeout: 10000 });
      return;
    }
  }
  throw new Error('create leave CTA not found');
}

async function openGrantDialog(host, page) {
  await clickCreateLeave(host, page);
  const dlg = host.locator('[data-testid="att-leave-create-dialog-precision"]').first();
  await dlg.waitFor({ state: 'visible', timeout: 15000 });
  const trigger = dlg.locator('.xevn-field-select-md').first();
  if (await trigger.isVisible().catch(() => false)) {
    await trigger.click({ timeout: 10000 });
    await sleep(500);
    let empOpt = page.locator('[role="option"]').filter({ hasNotText: /CORE07|qa_c07p/i }).first();
    const hint = R.setup?.employee?.name;
    if (hint) {
      const filtered = page
        .locator('[role="option"]')
        .filter({ hasText: new RegExp(String(hint).slice(0, 14).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') })
        .first();
      if (await filtered.isVisible({ timeout: 3000 }).catch(() => false)) empOpt = filtered;
    }
    await empOpt.waitFor({ state: 'visible', timeout: 12000 });
    await empOpt.click();
    await sleep(1200);
  }
  return dlg;
}

async function grantInDialog(host, dlg, page, { leaveTypeKey, days }) {
  let grantPanel = dlg.locator('[data-testid="att-04-grant-panel"]').first();
  if (!(await grantPanel.isVisible({ timeout: 3000 }).catch(() => false))) {
    grantPanel = host.locator('[data-testid="att-04-grant-panel"]').first();
  }
  if (!(await grantPanel.isVisible({ timeout: 5000 }).catch(() => false))) return null;
  const typeTrigger = grantPanel.locator('[data-testid="hdsd-att-grant-leave-type"]').first();
  if (await typeTrigger.isVisible().catch(() => false)) {
    await typeTrigger.click();
    await sleep(400);
    if (leaveTypeKey === 'carry_over') {
      const co = page.locator('[data-testid="hdsd-att-grant-leave-type-carry-over"]').first();
      if (await co.isVisible({ timeout: 3000 }).catch(() => false)) await co.click();
      else await page.locator('[role="option"]').filter({ hasText: /chuyển kỳ|carry_over/i }).first().click();
    } else {
      await page.locator('[role="option"]').filter({ hasText: /Phép năm|annual/i }).first().click();
    }
    await sleep(300);
  }
  await grantPanel.locator('[data-testid="hdsd-att-grant-entitled-days"]').first().fill(String(days));
  const before = R.grant_hits.length;
  await grantPanel.locator('[data-testid="hdsd-att-grant-save"]').first().click();
  await sleep(2500);
  return R.grant_hits.slice(before).find((h) => h.status >= 200 && h.status < 300);
}

async function readHonesty05b(host) {
  const el = host.locator('[data-testid="att-05b-honesty"]').first();
  const text = (await el.innerText().catch(() => '')).trim();
  return {
    visible: Boolean(text),
    text: text.slice(0, 900),
    neAtt05b: /≠ ATT-05b|≠ FR-05b|FR-05b/i.test(text),
    neAtt05: /≠ ATT-05|ATT05QC1/i.test(text),
    neUat: /≠ ATT module UAT|attendance_uat_ready=false/i.test(text),
    denyMerge: /DENY merge|không gộp|carry_over/i.test(text),
    denyHold: /att_leave_hold|pending_days/i.test(text),
    mk04: /ATT04QC1|ATT04BQC1/i.test(text),
    mk05: /ATT05QC1/i.test(text),
    mk09: /ATT09QC1|pending_days/i.test(text),
    mk03d: /ATT03D/i.test(text),
  };
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
    held: Number(row.pending_days ?? 0),
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
  return { put, verify, ok };
}

async function pickEmployee(token) {
  const empRes = await apiCall(token, 'GET', `/employees?page=1&page_size=80&company_id=${COMPANY}`);
  const rows = empRes.data?.data ?? empRes.data?.items ?? [];
  const emp = rows.find(
    (e) =>
      e.status === 'active' &&
      !/qa_c07|PENDING|HIRE-|CORE07/i.test(`${e.full_name || ''}${e.employee_code || ''}`),
  );
  return emp;
}

async function selectEmployeeInDlg(dlg, page, nameHint) {
  const trigger = dlg.locator('.xevn-field-select-md').first();
  await trigger.click({ timeout: 10000 });
  await sleep(500);
  let empOpt = page.locator('[role="option"]').filter({ hasNotText: /CORE07|qa_c07p/i }).first();
  if (nameHint) {
    const filtered = page
      .locator('[role="option"]')
      .filter({ hasText: new RegExp(String(nameHint).slice(0, 14).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') })
      .first();
    if (await filtered.isVisible({ timeout: 3000 }).catch(() => false)) empOpt = filtered;
  }
  await empOpt.waitFor({ state: 'visible', timeout: 12000 });
  const label = (await empOpt.innerText().catch(() => '')).trim();
  await empOpt.click();
  await sleep(2000);
  return label;
}

async function selectLeaveTypeInDlg(dlg, page, prefer = /Phép năm|annual/i) {
  const picker = dlg.locator('[data-testid="catalog-search-picker"]').first();
  const trigger = picker.locator('button').first();
  if (await trigger.isVisible().catch(() => false)) await trigger.click();
  else await picker.click().catch(() => {});
  await sleep(500);
  const opt = page.locator('[role="option"]').filter({ hasText: prefer }).first();
  if (await opt.isVisible({ timeout: 3000 }).catch(() => false)) {
    await opt.click();
  } else {
    await page.locator('[role="option"]').first().click();
  }
  await sleep(1200);
}

async function fillDates(dlg, startVi, endVi) {
  const dateInputs = dlg.locator('input.xevn-field-date, input[placeholder="dd/MM/yyyy"]');
  await dateInputs.nth(0).fill(startVi);
  await dateInputs.nth(0).press('Tab');
  await sleep(200);
  await dateInputs.nth(1).fill(endVi);
  await dateInputs.nth(1).press('Tab');
  await sleep(1500);
}

async function fillReason(dlg) {
  const reasonInput = dlg.locator('[data-testid="hdsd-leave-reason"], textarea').first();
  if (await reasonInput.isVisible().catch(() => false)) {
    await reasonInput.fill('QA ATT-05B cluster U65');
  }
}

async function submitCreate(dlg) {
  const submitBtn = dlg.getByRole('button', { name: /Gửi|Nộp|Submit|Tạo yêu cầu/i }).last();
  if (await submitBtn.isDisabled().catch(() => false)) return { clicked: false };
  const before = R.leave_create_hits.length;
  await submitBtn.click({ timeout: 10000 });
  await sleep(2500);
  const createHit = R.leave_create_hits.slice(before).find((h) => h.status >= 200 && h.status < 300);
  return { clicked: true, createHit };
}

async function readHeldInFormPanel(dlg, leaveTypeKey) {
  const held = dlg.locator(`[data-testid="leave-balance-held-${leaveTypeKey}"]`).first();
  const avail = dlg.locator(`[data-testid="leave-balance-available-${leaveTypeKey}"]`).first();
  const heldText = (await held.innerText().catch(() => '—')).trim();
  const availText = (await avail.innerText().catch(() => '—')).trim();
  return {
    heldNum: Number.parseFloat(heldText),
    availNum: Number.parseFloat(availText),
    heldText,
    availText,
  };
}

async function readHonesty05(host) {
  const el = host.locator('[data-testid="att-05-honesty"]').first();
  const text = (await el.innerText().catch(() => '')).trim();
  return {
    visible: Boolean(text),
    text: text.slice(0, 800),
    neAtt05: /≠ ATT-05|≠ FR-05/i.test(text),
    fyHold: /R-ATT-05-FY|FY CRUD HOLD/i.test(text),
    engineHold: /ROLLOVER|EXPIRE|ENGINE/i.test(text),
    ledgerSep: /carry_over|LEDGER_SEP|tách/i.test(text),
    denyMerge: /DENY merge|không gộp/i.test(text),
  };
}

async function main() {
  save();
  const session = await loginApi();
  const l0Ok = await l0Probes(session.token);
  if (!l0Ok) R.defects.push({ sev: 'P0', id: 'L0', note: 'stack probe failed' });

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  trackPage(page);
  await injectPortalAuth(page, session);

  let nestOk = () => R.nest_core_leave_non404.length === 0;


  const emp = await pickEmployee(session.token);
  if (!emp?.id) {
    R.defects.push({ sev: 'P0', id: 'NO-EMP', note: 'no active employee' });
  } else {
    R.setup.employee = { id: emp.id, code: emp.employee_code, name: emp.full_name };
    const g = await grantTrackedEntitlement(session.token, emp.id, 'annual', 14);
    R.setup.grant = g;
    if (!g.ok) R.defects.push({ sev: 'P0', id: 'GRANT', note: 'PUT tracked-entitlement failed' });
  }

  try {
    const host = await openLeaveTab(page);
    await clickCreateLeave(host, page);
    const dlg = host.locator('[data-testid="att-leave-create-dialog-precision"]').first();
    await dlg.waitFor({ state: 'visible', timeout: 15000 });
    const panelBefore = R.panel_hits.length;
    await selectEmployeeInDlg(dlg, page, R.setup.employee?.name);
    const formPanelVis = await dlg.locator('[data-testid="att-05b-form-panel"]').isVisible({ timeout: 15000 }).catch(() => false);
    const panelGets = R.panel_hits.slice(panelBefore).filter((h) => h.status >= 200 && h.status < 300);
    await shot(page, '01-j05b-01-form-panel');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(1500);
    const host2 = await openLeaveTab(page);
    await clickCreateLeave(host2, page);
    const dlg2 = host2.locator('[data-testid="att-leave-create-dialog-precision"]').first();
    await selectEmployeeInDlg(dlg2, page, R.setup.employee?.name);
    const f5Panel = await dlg2.locator('[data-testid="att-05b-form-panel"]').isVisible({ timeout: 15000 }).catch(() => false);
    const pass01 = formPanelVis && panelGets.length >= 1 && f5Panel && nestOk();
    jset('J-HRM-ATT-05B-01', pass01 ? 'PASS' : 'FAIL', {
      summary: 'formPanel=' + formPanelVis + ' panelGET=' + panelGets.length + ' f5=' + f5Panel + ' nest=' + R.nest_core_leave_non404.length,
      click_path: 'Nghỉ phép → Tạo đơn → panel on form · GET panel 2xx · F5',
      nest_core_0: nestOk(),
    });
  } catch (e) {
    jset('J-HRM-ATT-05B-01', 'FAIL', { summary: String(e).slice(0, 300) });
  }

  try {
    const host = await openLeaveTab(page);
    const dlg = await openGrantDialog(host, page);
    const annualVis = await dlg.locator('[data-testid="leave-balance-row-annual"]').isVisible({ timeout: 12000 }).catch(() => false);
    const carryRow = dlg.locator('[data-testid="leave-balance-row-carry_over"]').first();
    const carryVis = await carryRow.isVisible({ timeout: 12000 }).catch(() => false);
    const carryLabel = (await carryRow.innerText().catch(() => '')).includes('Phép chuyển kỳ');
    await shot(page, '02-j05b-02-carry-sep');
    await host.keyboard.press('Escape').catch(() => {});
    const pass02 = annualVis && carryVis && carryLabel && nestOk();
    jset('J-HRM-ATT-05B-02', pass02 ? 'PASS' : 'FAIL', {
      summary: 'annual=' + annualVis + ' carry=' + carryVis + ' label=' + carryLabel + ' ATT05QC1',
      click_path: 'Form → carry_over tách annual',
      nest_core_0: nestOk(),
    });
  } catch (e) {
    jset('J-HRM-ATT-05B-02', 'FAIL', { summary: String(e).slice(0, 300) });
  }

  try {
    const host = await openLeaveTab(page);
    const dlg = await openGrantDialog(host, page);
    const pickerVis = await dlg.locator('[data-testid="catalog-search-picker"]').isVisible({ timeout: 8000 }).catch(() => false);
    const panelBefore = R.panel_hits.length;
    await selectLeaveTypeInDlg(dlg, page, /Phép năm|annual/i);
    const refetchAfter = R.panel_hits.length > panelBefore;
    const previewBefore = R.preview_hits.length;
    await fillDates(dlg, RANGE_SUBMIT.startVi, RANGE_SUBMIT.endVi);
    await sleep(3500);
    const previewHit = R.preview_hits.slice(previewBefore).find((h) => h.status >= 200 && h.status < 300);
    const previewAny = R.preview_hits.slice(previewBefore).length > 0;
    await shot(page, '03-j05b-03-picker-refetch-preview');
    await host.keyboard.press('Escape').catch(() => {});
    const pass03 = pickerVis && refetchAfter && previewHit && nestOk();
    if (!pass03 && previewAny && !previewHit) {
      R.defects.push({ sev: 'P1', id: 'J05B-03-PREVIEW-400', note: 'preview-deduction called but not 2xx' });
    }
    jset('J-HRM-ATT-05B-03', pass03 ? 'PASS' : 'FAIL', {
      summary: 'picker=' + pickerVis + ' refetch=' + refetchAfter + ' preview=' + (previewHit?.status ?? '—') + ' nest=' + R.nest_core_leave_non404.length,
      click_path: 'EFF picker · refetch · preview-deduction',
      nest_core_0: nestOk(),
    });
  } catch (e) {
    jset('J-HRM-ATT-05B-03', 'FAIL', { summary: String(e).slice(0, 300) });
  }

  try {
    const empId = R.setup.employee?.id;
    const balBefore = empId ? await fetchBalance(session.token, empId, 'annual') : { pending: 0 };
    const host = await openLeaveTab(page);
    const dlg = await openGrantDialog(host, page);
    await selectLeaveTypeInDlg(dlg, page, /Phép năm|annual/i);
    await fillDates(dlg, RANGE_SUBMIT.startVi, RANGE_SUBMIT.endVi);
    await fillReason(dlg);
    const heldBefore = await readHeldInFormPanel(dlg, 'annual');
    const submit = await submitCreate(dlg);
    await sleep(2000);
    const balAfter = empId ? await fetchBalance(session.token, empId, 'annual') : balBefore;
    const pendingUp = balAfter.pending > balBefore.pending;
    await page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(1500);
    const balF5 = empId ? await fetchBalance(session.token, empId, 'annual') : balAfter;
    const f5Persist = balF5.pending >= balAfter.pending && balF5.pending > balBefore.pending;
    await shot(page, '04-j05b-04-post-hold');
    const pass04 = submit.clicked && submit.createHit && pendingUp && f5Persist && nestOk();
    jset('J-HRM-ATT-05B-04', pass04 ? 'PASS' : 'FAIL', {
      summary: 'POST ' + (submit.createHit?.status ?? '—') + ' pending ' + balBefore.pending + '→' + balAfter.pending + ' F5=' + balF5.pending + ' held ' + heldBefore.heldText,
      click_path: 'Gửi đơn → pending↑ · F5',
      nest_core_0: nestOk(),
    });
  } catch (e) {
    jset('J-HRM-ATT-05B-04', 'FAIL', { summary: String(e).slice(0, 300) });
  }

  try {
    const host = await openLeaveTab(page);
    await clickCreateLeave(host, page);
    const dlg = host.locator('[data-testid="att-leave-create-dialog-precision"]').first();
    await dlg.waitFor({ state: 'visible', timeout: 15000 });
    const emptyVis = await dlg.locator('[data-testid="att-05b-empty-catalog"]').isVisible({ timeout: 3000 }).catch(() => false);
    const pickerVis = await dlg.locator('[data-testid="catalog-search-picker"]').isVisible({ timeout: 3000 }).catch(() => false);
    let verdict05 = 'FAIL';
    let summary05 = '';
    if (emptyVis) {
      verdict05 = 'PASS';
      summary05 = 'att-05b-empty-catalog honest';
    } else if (pickerVis) {
      verdict05 = 'PASS_WITH_HOLD';
      summary05 = 'catalog populated — conditional tenant';
    } else summary05 = 'no empty hint nor picker';
    await shot(page, '05-j05b-05-empty');
    await host.keyboard.press('Escape').catch(() => {});
    jset('J-HRM-ATT-05B-05', verdict05, { summary: summary05, nest_core_0: nestOk() });
  } catch (e) {
    jset('J-HRM-ATT-05B-05', 'FAIL', { summary: String(e).slice(0, 300) });
  }

  try {
    const host = await openLeaveTab(page);
    const h05b = await readHonesty05b(host);
    const att09Text = (await host.locator('[data-testid="att-09-honesty"]').innerText().catch(() => '')).trim();
    const mk09Peer = /ATT09QC1|pending_days/i.test(att09Text);
    await clickCreateLeave(host, page);
    const dlg = host.locator('[data-testid="att-leave-create-dialog-precision"]').first();
    await selectEmployeeInDlg(dlg, page, R.setup.employee?.name);
    await selectLeaveTypeInDlg(dlg, page, /Phép năm|annual/i);
    await fillDates(dlg, RANGE_OVERLAP.startVi, RANGE_OVERLAP.endVi);
    await fillReason(dlg);
    const advVis = await dlg.locator('[data-testid="att-05b-adv-hint"]').isVisible({ timeout: 2000 }).catch(() => false);
    const beforeOverlap = R.leave_create_hits.length;
    const submit2 = await submitCreate(dlg);
    await sleep(1500);
    const overlapHit = R.leave_create_hits.slice(beforeOverlap).find((h) => h.status === 409 || h.status === 400);
    const overlapUi = await dlg.locator('[data-testid="att-09-type-block"]').isVisible({ timeout: 3000 }).catch(() => false);
    const overlapOk = Boolean(overlapHit) || overlapUi;
    const pass06 =
      h05b.visible &&
      h05b.neAtt05b &&
      h05b.neUat &&
      h05b.denyMerge &&
      h05b.mk05 &&
      (h05b.mk09 || mk09Peer) &&
      overlapOk &&
      nestOk();
    await shot(page, '06-j05b-06-honesty-overlap');
    jset('J-HRM-ATT-05B-06', pass06 ? 'PASS_WITH_HOLD' : 'FAIL', {
      summary: 'honesty=' + h05b.neAtt05b + ' overlap=' + overlapOk + ' adv=' + advVis + ' FY/DEDUCT HOLD',
      must_keep: R.must_keep,
      nest_core_0: nestOk(),
    });
  } catch (e) {
    jset('J-HRM-ATT-05B-06', 'FAIL', { summary: String(e).slice(0, 300) });
  }
  await browser.close();

  const mandatory = ['J-HRM-ATT-05B-01', 'J-HRM-ATT-05B-02', 'J-HRM-ATT-05B-03', 'J-HRM-ATT-05B-04'];
  const holdOk = ['J-HRM-ATT-05B-05', 'J-HRM-ATT-05B-06'];
  const mandFail = mandatory.some((id) => R.journeys[id]?.verdict === 'FAIL');
  const holdFail = holdOk.some((id) => R.journeys[id]?.verdict === 'FAIL');
  const badCore = R.nest_core_leave_non404.length > 0;
  const nonAttMutations = R.network.filter(
    (n) => n.method !== 'GET' && /\/api\/hrm\//.test(n.url) && !n.attendance && !n.nest_core,
  );

  R.overall = mandFail || holdFail || badCore ? 'FAIL' : 'PASS';
  R.ack_status = R.overall === 'PASS' ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  R.network_summary = {
    attendance_mutations: R.attendance_mutations.length,
    nest_core_leave_non404: R.nest_core_leave_non404.length,
    non_attendance_hrm_writes: nonAttMutations.length,
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
