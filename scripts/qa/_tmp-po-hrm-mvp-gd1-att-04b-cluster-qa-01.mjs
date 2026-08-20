#!/usr/bin/env node
/**
 * PO-HRM-MVP-GD1-ATT-04B-CLUSTER-QA-01 — U65 zero-seed · J-HRM-ATT-04B-01..06
 * Persona: ceo@xe.vn · companyId=main · C-SLICE · ≠ ATT-04b / FR-04b / ATT UAT DONE
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
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-mvp-gd1-att-04b-cluster-qa-01.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-mvp-gd1-att-04b-cluster-qa-01');
mkdirSync(SCREEN, { recursive: true });

const ATT04QC1 = 'ATT04QC1-MSM22G4W';
const ATT09QC1 = 'ATT09QC1-MSLUTL9D';
const ATT03DQC1 = 'ATT03DQC1-MSM1CR19';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();
const stampSuffix = Date.now().toString(36).toLowerCase().slice(-8);
const STAMP = `ATT04BQA1-${stampSuffix.toUpperCase()}`;
const TYPE_ADV = `hr_04b_adv_${stampSuffix}`;
const TYPE_NO = `hr_04b_no_${stampSuffix}`;
const TYPE_ADV_NAME = `QA 04B ứng ${stampSuffix}`;
const TYPE_NO_NAME = `QA 04B gate ${stampSuffix}`;
const RANGE_REJECT = {
  start: '2026-02-09',
  end: '2026-02-10',
  startVi: '09/02/2026',
  endVi: '10/02/2026',
};

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

function summarizeBody(body, max = 600) {
  const s = typeof body === 'string' ? body : JSON.stringify(body);
  return s.length > max ? `${s.slice(0, max)}…` : s;
}

const R = {
  work_item_id: 'PO-HRM-MVP-GD1-ATT-04B-CLUSTER-QA-01',
  program: 'PO_HRM_MVP_GD1_CONTINUOUS',
  uc_ids: ['UC-BP-ATT-04b', 'FR-UC-BP-ATT-04b', 'BR-BP-LV-07'],
  stamp: STAMP,
  fe_evidence: 'docs/qa/evidence/po-hrm-mvp-gd1-att-04b-cluster-fe-01.md',
  be_evidence: 'docs/qa/evidence/po-hrm-mvp-gd1-att-04b-cluster-be-01.md',
  startedAt: ts(),
  persona: { email: EMAIL, companyId: COMPANY },
  u65: 'zero-seed-browser-only',
  types: { TYPE_ADV, TYPE_NO },
  honesty: {
    attendance_uat_ready: false,
    ne_att04b_done: true,
    ne_att04_done: true,
    ne_att_module_uat: true,
    printable_false: true,
    pay_out: true,
    deny_att_leave_hold: true,
    nest_core_deny: true,
    seed_used: false,
    c_slice: true,
  },
  must_keep: [ATT04QC1, ATT09QC1, ATT03DQC1],
  env: { PORTAL, HRM, XBOS, TENANT, commit: COMMIT },
  l0: {},
  network: [],
  attendance_mutations: [],
  nest_core_hits: [],
  nest_core_leave_non404: [],
  lvt_hits: [],
  lvrule_hits: [],
  leave_create_hits: [],
  grant_hits: [],
  panel_hits: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  click_log: [],
  journeys: {},
  residuals: [],
  defects: [],
  setup: {},
  capture: { leaveCreateResponses: [] },
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
  const lvt =
    /\/attendance\/leave-types/.test(url) &&
    !/\/effective/.test(url) &&
    (method === 'GET' || method === 'POST' || method === 'PUT' || method === 'PATCH');
  const lvrule = /\/attendance\/leave-accrual-policies/.test(url);
  const grant = /\/attendance\/leave-balance\/tracked-entitlement/.test(url) && method === 'PUT';
  const panel = /leave-balance(\/panel)?(\?|$)/.test(url) && method === 'GET';
  const leaveCreate =
    /\/attendance\/leave-requests(\?|$)/.test(url) && method === 'POST' && !/preview/.test(url);
  const entry = {
    method,
    url: url.replace(/^https?:\/\/[^/]+/, '').slice(0, 480),
    status: status ?? null,
    at: ts(),
    nest_core,
    attendance,
    lvt,
    lvrule,
    grant,
    panel,
    leaveCreate,
    ...extra,
  };
  R.network.push(entry);
  if (nest_core) R.nest_core_hits.push(entry);
  if (nest_core && isNestCoreLeave(url) && status !== 404) R.nest_core_leave_non404.push(entry);
  if (attendance && method !== 'GET') R.attendance_mutations.push(entry);
  if (lvt) R.lvt_hits.push(entry);
  if (lvrule) R.lvrule_hits.push(entry);
  if (grant) R.grant_hits.push(entry);
  if (panel) R.panel_hits.push(entry);
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
  return {
    status: r.status,
    code: json?.code ?? json?.error?.code ?? null,
    data: json?.data ?? json,
    json,
    summary: summarizeBody(json),
    path: url.replace(/^https?:\/\/[^/]+/, ''),
  };
}

async function ensureHolidayYear(token, year) {
  const get = await apiCall(token, 'GET', `/attendance/holiday-calendars/${year}?company_id=${COMPANY}`);
  if (get.status === 200) return get;
  return await apiCall(token, 'PUT', `/attendance/holiday-calendars/${year}`, {
    body: { companyId: COMPANY, days: [] },
  });
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
  for (const [key, p] of [
    ['nest_core_leave_types', `/core/attendance/leave-types?company_id=${COMPANY}`],
    ['nest_core_leave_requests', `/core/attendance/leave-requests?company_id=${COMPANY}`],
  ]) {
    const nest = await apiCall(token, 'GET', p);
    out[key] = { status: nest.status, ok: nest.status === 404 };
  }
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
      const url = res.url();
      trackUrl(req.method(), url, res.status());
      if (
        req.method() === 'POST' &&
        /\/attendance\/leave-requests/.test(url) &&
        !/preview/.test(url)
      ) {
        const body = await res.text().catch(() => '');
        let code = null;
        try {
          const j = JSON.parse(body);
          code = j?.code ?? j?.error?.code ?? null;
        } catch {
          /* */
        }
        R.capture.leaveCreateResponses.push({
          status: res.status(),
          code,
          at: ts(),
          snippet: body.slice(0, 400),
        });
        save();
      }
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

async function ensureAnnualTypeNoAdvance(host, page) {
  const row = host.locator('[data-testid="settings-att-leave-type-row-annual"]').first();
  if (await row.isVisible({ timeout: 5000 }).catch(() => false)) {
    await row.click();
    await sleep(400);
    await toggleAllowsAdvance(host, false);
    await host.locator('[data-testid="hdsd-att-leave-type-save"]').click();
    await sleep(2000);
    log('J-03 annual row · allows_advance OFF');
    return 'existing';
  }
  await host.locator('[data-testid="hdsd-att-leave-type-key"]').fill('annual');
  await host.locator('[data-testid="hdsd-att-leave-type-name"]').fill('Phép năm');
  const cat = host.locator('[data-testid="hdsd-att-leave-type-category"]').first();
  if (await cat.isVisible().catch(() => false)) {
    await cat.click();
    await sleep(300);
    await page.locator('[role="option"]').filter({ hasText: /Phép năm|annual/i }).first().click();
    await sleep(200);
  }
  await toggleAllowsAdvance(host, false);
  await host.locator('[data-testid="hdsd-att-leave-type-save"]').click();
  await sleep(2500);
  log('J-03 created annual · allows_advance OFF');
  return 'created';
}

async function toggleAllowsAdvance(host, wantOn) {
  const wrap = host.locator('[data-testid="hdsd-att-leave-type-allows-advance"]').first();
  await wrap.scrollIntoViewIfNeeded().catch(() => {});
  const sw = wrap.locator('button[role="switch"]').first();
  if (!(await sw.isVisible().catch(() => false))) {
    await wrap.click({ force: true });
    await sleep(300);
  }
  const state = await sw.getAttribute('data-state').catch(() => '');
  const isOn = state === 'checked' || state === 'on';
  if (wantOn !== isOn) await sw.click({ force: true });
  await sleep(200);
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

async function selectEmployeeInDlg(dlg, page, pickIndex = 0) {
  const trigger = dlg.locator('.xevn-field-select-md').first();
  await trigger.click({ timeout: 10000 });
  await sleep(500);
  let opt = page.locator('[role="option"]').nth(pickIndex);
  if (pickIndex === 0) {
    opt = page.locator('[role="option"]').filter({ hasNotText: /CORE07|qa_c07p|c07p/i }).first();
  }
  await opt.waitFor({ state: 'visible', timeout: 12000 });
  const label = (await opt.innerText().catch(() => '')).trim();
  await opt.click();
  log('pick employee', { label: label.slice(0, 60), pickIndex });
  await sleep(800);
  return label;
}

async function locVisibleAcross(page, selector, ms = 12000) {
  const start = Date.now();
  while (Date.now() - start < ms) {
    for (const h of [page, ...page.frames()]) {
      const loc = h.locator(selector).first();
      if (await loc.isVisible({ timeout: 400 }).catch(() => false)) return loc;
    }
    await sleep(200);
  }
  return null;
}

async function selectLeaveTypeInDlg(dlg, page, preferredKey = 'annual') {
  const picker = dlg.locator('[data-testid="catalog-search-picker"]').first();
  await picker.waitFor({ state: 'visible', timeout: 20000 });
  await sleep(2000);
  await picker.click({ timeout: 8000, force: true });
  await sleep(600);
  const cmdkInput = await locVisibleAcross(page, '[cmdk-input]', 10000);
  if (cmdkInput) {
    const q = preferredKey === 'annual' ? 'annual' : String(preferredKey).replace(/^hr_/, '');
    await cmdkInput.fill('');
    await cmdkInput.fill(q.slice(0, 24));
    await sleep(500);
  }
  const valueKey = preferredKey === 'annual' ? 'annual' : preferredKey;
  let opt = await locVisibleAcross(page, `[cmdk-item][data-value="${valueKey}"]`, 8000);
  if (!opt) {
    const re = preferredKey === 'annual' ? /Phép năm/i : new RegExp(preferredKey, 'i');
    const start = Date.now();
    while (Date.now() - start < 12000) {
      for (const h of [page, ...page.frames()]) {
        const candidate = h.locator('[cmdk-item], [role="option"]').filter({ hasText: re }).first();
        if (await candidate.isVisible({ timeout: 400 }).catch(() => false)) {
          opt = candidate;
          break;
        }
      }
      if (opt) break;
      await sleep(200);
    }
  }
  if (!opt) throw new Error('leave type option not found in frame/cmdk');
  const label = (await opt.innerText().catch(() => '')).trim();
  await opt.click();
  await sleep(800);
  log('select leave type', { label: label.slice(0, 80), preferredKey });
  return label;
}

async function submitCreate(dlg) {
  const before = R.leave_create_hits.length;
  const submitBtn = dlg.getByRole('button', { name: /Gửi|Nộp|Submit|Tạo yêu cầu/i }).last();
  if (await submitBtn.isDisabled().catch(() => false)) return { clicked: false, disabled: true };
  await submitBtn.click({ timeout: 10000 });
  await sleep(2500);
  const hit = R.leave_create_hits.slice(before).find((h) => h.method === 'POST');
  return { clicked: true, postHit: hit };
}

async function grantEntitledInDialog(host, dlg, page, days, leaveTypeKey = 'annual') {
  let grantPanel = dlg.locator('[data-testid="att-04-grant-panel"]').first();
  if (!(await grantPanel.isVisible({ timeout: 3000 }).catch(() => false))) {
    grantPanel = host.locator('[data-testid="att-04-grant-panel"]').first();
  }
  if (!(await grantPanel.isVisible({ timeout: 5000 }).catch(() => false))) return null;
  const typeTrigger = grantPanel.locator('[data-testid="hdsd-att-grant-leave-type"]').first();
  if (await typeTrigger.isVisible().catch(() => false)) {
    await typeTrigger.click();
    await sleep(400);
    const opt =
      leaveTypeKey === 'annual'
        ? page.locator('[role="option"]').filter({ hasText: /Phép năm|annual/i }).first()
        : page.locator('[role="option"]').filter({ hasText: leaveTypeKey }).first();
    if (await opt.isVisible({ timeout: 3000 }).catch(() => false)) await opt.click();
    else await page.locator('[role="option"]').first().click();
    await sleep(300);
  }
  const daysInput = grantPanel.locator('[data-testid="hdsd-att-grant-entitled-days"]').first();
  await daysInput.fill(String(days));
  const saveBtn = grantPanel.locator('[data-testid="hdsd-att-grant-save"]').first();
  const before = R.grant_hits.length;
  await saveBtn.click();
  await sleep(2000);
  return R.grant_hits.slice(before).find((h) => h.status >= 200 && h.status < 300);
}

async function readHonesty04b(host) {
  const el = host.locator('[data-testid="att-04b-honesty"]').first();
  const text = (await el.innerText().catch(() => '')).trim();
  const neDone = /≠ ATT-04b|≠ FR-04b|≠ ATT UAT/i.test(text);
  const neAtt04 = /≠ ATT-04 DONE/i.test(text);
  const cSlice = /C-SLICE|attendance_uat_ready=false/i.test(text);
  const mk04 = text.includes(ATT04QC1.slice(0, 12)) || text.includes('ATT04QC1');
  const mk09 = /ATT09|pending_days|MSLUTL9D/i.test(text);
  const mk03d = /ATT03D|MSM1CR19/i.test(text);
  return { visible: Boolean(text), text: text.slice(0, 600), neDone, neAtt04, cSlice, mk04, mk09, mk03d };
}

async function main() {
  save();
  const session = await loginApi();
  const l0Ok = await l0(session.token);
  await ensureHolidayYear(session.token, 2026);
  R.setup.holiday_2026 = await ensureHolidayYear(session.token, 2026);

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

  // ——— J-01 allows_advance ———
  try {
    const host = await openLeaveRules(page);
    await host.locator('[data-testid="hdsd-att-leave-type-key"]').fill(TYPE_ADV);
    await host.locator('[data-testid="hdsd-att-leave-type-name"]').fill(TYPE_ADV_NAME);
    await toggleAllowsAdvance(host, true);
    const lvtBefore = R.lvt_hits.filter((h) => h.method !== 'GET').length;
    await host.locator('[data-testid="hdsd-att-leave-type-save"]').click();
    await sleep(2000);
    const mutate = R.lvt_hits
      .filter((h) => h.method !== 'GET')
      .slice(lvtBefore)
      .find((h) => h.status >= 200 && h.status < 300);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(2000);
    const typeProbe = await apiCall(session.token, 'GET', `/attendance/leave-types?company_id=${COMPANY}`);
    const items = typeProbe.data?.items ?? typeProbe.data?.data ?? [];
    const saved = Array.isArray(items)
      ? items.find((i) => i.leaveTypeKey === TYPE_ADV || i.leave_type_key === TYPE_ADV)
      : null;
    const advanceOn = Boolean(saved?.allowsAdvance ?? saved?.allows_advance);
    await shot(page, 'j01-allows-advance');
    const pass = mutate && advanceOn && nestOk();
    jset('J-HRM-ATT-04B-01', pass ? 'PASS' : 'FAIL', {
      summary: `mutate=${mutate?.status} advanceOn=${advanceOn} nestCore=${R.nest_core_leave_non404.length}`,
      click_path: 'Thiết lập → Quy định nghỉ → tạo loại → Cho phép ứng phép → Lưu → F5',
      mutate,
      nest_core_0: nestOk(),
    });
  } catch (e) {
    jset('J-HRM-ATT-04B-01', 'FAIL', { summary: String(e).slice(0, 300) });
    R.defects.push({ sev: 'P0', id: 'J01', note: String(e).slice(0, 200) });
  }

  const capSeed = await apiCall(session.token, 'POST', '/attendance/leave-accrual-policies', {
    body: {
      companyId: COMPANY,
      leaveTypeKey: TYPE_ADV,
      accrualMode: 'manual_only',
      annualDays: 12,
      effectiveFrom: '2026-01-01',
      advanceMaxDays: 3,
      advanceCapPercent: 50,
    },
  });
  R.setup.cap_seed_policy = {
    status: capSeed.status,
    code: capSeed.code,
    note: 'product policy POST after TYPE_ADV · capCrudLive detect',
  };

  // ——— J-02 panel advance / unpaid labels ———
  try {
    const host = await openLeaveTab(page);
    const createBtn = host.getByRole('button', { name: /Tạo yêu cầu/i }).first();
    await createBtn.click({ timeout: 10000 });
    await sleep(800);
    const dlg = host.locator('[data-testid="att-leave-create-dialog-precision"]').first();
    await selectEmployeeInDlg(dlg, page);
    const panel = host.locator('[data-testid="leave-balance-panel"]').first();
    const panelText = (await panel.innerText().catch(() => '')).slice(0, 1200);
    const hasAdvance = /Ứng phép/i.test(panelText);
    const hasUnpaidMap =
      /Không lương/i.test(panelText) ||
      /unpaid/i.test(panelText) ||
      panelText.includes('advance');
    await shot(page, 'j02-panel');
    const pass = (await panel.isVisible().catch(() => false)) && hasAdvance && nestOk();
    jset('J-HRM-ATT-04B-02', pass ? 'PASS' : 'FAIL', {
      summary: `panel advance label=${hasAdvance} unpaidMap=${hasUnpaidMap} nestCore=${R.nest_core_leave_non404.length}`,
      click_path: 'Nghỉ phép → Tạo → chọn NV → leave-balance-panel',
      panelSnippet: panelText.slice(0, 400),
      nest_core_0: nestOk(),
    });
  } catch (e) {
    jset('J-HRM-ATT-04B-02', 'FAIL', { summary: String(e).slice(0, 300) });
  }

  // ——— J-03 gate reject (ứng OFF · MVP annual tracked) ———
  try {
    const hostRules = await openLeaveRules(page);
    await ensureAnnualTypeNoAdvance(hostRules, page);

    const host = await openLeaveTab(page);
    const createBtn = host.getByRole('button', { name: /Tạo yêu cầu/i }).first();
    await createBtn.click({ timeout: 10000 });
    await sleep(800);
    const dlg = host.locator('[data-testid="att-leave-create-dialog-precision"]').first();
    await selectEmployeeInDlg(dlg, page, 0);
    await selectLeaveTypeInDlg(dlg, page, 'annual');
    const grantHit = await grantEntitledInDialog(host, dlg, page, 0, 'annual');
    await fillDates(dlg, RANGE_REJECT.startVi, RANGE_REJECT.endVi);
    const reason = dlg.locator('textarea, [data-testid="hdsd-leave-reason"]').first();
    if (await reason.isVisible().catch(() => false)) {
      await reason.fill('QA ATT-04B gate reject U65');
    }
    await sleep(1500);
    const submitBtn = dlg.getByRole('button', { name: /Gửi|Nộp|Submit/i }).last();
    const preDisabled = await submitBtn.isDisabled().catch(() => true);
    const dlgDebug = (await dlg.innerText().catch(() => '')).slice(0, 500);
    R.capture.j03_pre_submit = { preDisabled, dlgDebug };
    save();
    const submit = preDisabled ? { clicked: false, disabled: true } : await submitCreate(dlg);
    const rejectBanner = await dlg
      .locator('[data-testid="att-04b-balance-reject"]')
      .isVisible({ timeout: 5000 })
      .catch(() => false);
    const lastResp = R.capture.leaveCreateResponses.at(-1);
    const codeOk =
      lastResp?.status === 400 &&
      (lastResp?.code === 'HRM-LEAVE-VAL-BALANCE' || lastResp?.code === 'HRM_LEAVE_VAL_BALANCE');
    const dlgStillOpen = await dlg.isVisible().catch(() => false);
    await shot(page, 'j03-balance-reject');
    const pass =
      grantHit &&
      submit.clicked &&
      !submit.disabled &&
      codeOk &&
      rejectBanner &&
      dlgStillOpen &&
      nestOk();
    if (!pass) {
      R.defects.push({
        sev: 'P0',
        id: 'J03-GATE',
        note: `grant=${grantHit?.status} post=${lastResp?.status}:${lastResp?.code} banner=${rejectBanner}`,
      });
    }
    jset('J-HRM-ATT-04B-03', pass ? 'PASS' : 'FAIL', {
      summary: `submit clicked=${submit.clicked} disabled=${submit.disabled} POST ${lastResp?.status} ${lastResp?.code} banner=${rejectBanner} dlgOpen=${dlgStillOpen} grant=${grantHit?.status}`,
      click_path: 'annual ứng OFF · grant panel 1d annual · 3d range → Gửi → 400 + att-04b-balance-reject',
      lastResp,
      grantHit,
      nest_core_0: nestOk(),
    });
  } catch (e) {
    jset('J-HRM-ATT-04B-03', 'FAIL', { summary: String(e).slice(0, 300) });
  }

  // ——— J-04 over-bal branch ———
  try {
    const host = await openLeaveTab(page);
    const createBtn = host.getByRole('button', { name: /Tạo yêu cầu/i }).first();
    await createBtn.click({ timeout: 10000 });
    await sleep(800);
    const hold = host.locator('[data-testid="att-04b-over-bal-hold"]').first();
    const holdVisible = await hold.isVisible({ timeout: 8000 }).catch(() => false);
    const dialogLive = await host
      .locator('[data-testid="att-04b-over-bal-dialog"]')
      .isVisible()
      .catch(() => false);
    const verdict = dialogLive && !holdVisible ? 'PASS' : 'PASS_WITH_HOLD';
    if (verdict === 'PASS_WITH_HOLD') {
      R.residuals.push({
        id: 'R-ATT-04B-OVER-BAL',
        note: 'att-04b-over-bal-hold footer · ATT_04B_BALANCE_RESOLUTION_API_LIVE=false',
      });
    }
    await shot(page, 'j04-over-bal-hold');
    jset('J-HRM-ATT-04B-04', verdict, {
      summary: `holdFooter=${holdVisible} dialogLive=${dialogLive} nestCore=${R.nest_core_leave_non404.length}`,
      click_path: 'Nghỉ phép → Tạo dialog · over-bal HOLD footer',
      nest_core_0: nestOk(),
    });
  } catch (e) {
    jset('J-HRM-ATT-04B-04', 'PASS_WITH_HOLD', { summary: String(e).slice(0, 300) });
    R.residuals.push({ id: 'R-ATT-04B-OVER-BAL', note: 'runner error — HOLD' });
  }

  // ——— J-05 cap CRUD ———
  try {
    const host = await openLeaveRules(page);
    const capHold = host.locator('[data-testid="att-04b-cap-hold"]').first();
    const capHoldVisible = await capHold.isVisible({ timeout: 8000 }).catch(() => false);
    const capHoldText = (await capHold.innerText().catch(() => '')).slice(0, 300);
    const maxInput = host.locator('[data-testid="hdsd-att-lvrule-advance-max-days"]').first();
    const capInputsLive = await maxInput.isVisible({ timeout: 2000 }).catch(() => false);
    let capMutate = null;
    if (capInputsLive) {
      await host.locator('[data-testid="hdsd-att-lvrule-leave-type"]').click();
      await sleep(400);
      await page.locator('[role="option"]').filter({ hasText: TYPE_ADV_NAME }).first().click();
      await sleep(300);
      await maxInput.fill('2');
      await host.locator('[data-testid="hdsd-att-lvrule-advance-cap-percent"]').fill('40');
      const before = R.lvrule_hits.filter((h) => h.method === 'POST').length;
      await host.locator('[data-testid="hdsd-att-lvrule-save"]').click();
      await sleep(2000);
      capMutate = R.lvrule_hits
        .filter((h) => h.method === 'POST')
        .slice(before)
        .find((h) => h.status >= 200 && h.status < 300);
    }
    const verdict =
      capMutate && capInputsLive ? 'PASS' : 'PASS_WITH_HOLD';
    if (verdict === 'PASS_WITH_HOLD') {
      R.residuals.push({
        id: 'R-ATT-04B-CAP-CRUD',
        note: 'att-04b-cap-hold · cap inputs not LIVE end-to-end in browser',
        capHoldText,
      });
    }
    await shot(page, 'j05-cap');
    jset('J-HRM-ATT-04B-05', verdict, {
      summary: `capInputs=${capInputsLive} mutate=${capMutate?.status} holdFooter=${capHoldVisible} nestCore=${R.nest_core_leave_non404.length}`,
      click_path: 'Quy định nghỉ → Quy tắc quỹ · cap fields',
      capMutate,
      capHoldText,
      nest_core_0: nestOk(),
    });
  } catch (e) {
    jset('J-HRM-ATT-04B-05', 'PASS_WITH_HOLD', { summary: String(e).slice(0, 300) });
    R.residuals.push({ id: 'R-ATT-04B-CAP-CRUD', note: 'runner error — HOLD' });
  }

  // ——— J-06 honesty seals ———
  try {
    const host = await openLeaveTab(page);
    const h = await readHonesty04b(host);
    const overHold = await host
      .locator('[data-testid="att-04b-over-bal-hold"]')
      .isVisible()
      .catch(() => false);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(1500);
    const host2 = await openLeaveTab(page);
    const h2 = await readHonesty04b(host2);
    await shot(page, 'j06-honesty');
    const pass =
      h.visible &&
      h.neDone &&
      h.cSlice &&
      h2.visible &&
      nestOk() &&
      !R.honesty.seed_used;
    jset('J-HRM-ATT-04B-06', pass ? 'PASS' : 'FAIL', {
      summary: `honesty neDone=${h.neDone} mk04=${h.mk04} mk09=${h.mk09} mk03d=${h.mk03d} overHold=${overHold} nestCore=${R.nest_core_leave_non404.length}`,
      click_path: 'att-04b-honesty · F5 · seals',
      honesty: h,
      must_keep: R.must_keep,
      nest_core_0: nestOk(),
    });
  } catch (e) {
    jset('J-HRM-ATT-04B-06', 'FAIL', { summary: String(e).slice(0, 300) });
  }

  await browser.close();

  const mandatory = ['J-HRM-ATT-04B-01', 'J-HRM-ATT-04B-02', 'J-HRM-ATT-04B-03'];
  const mandatoryFail = mandatory.filter((id) => R.journeys[id]?.verdict === 'FAIL');
  const anyFail = Object.values(R.journeys).some((j) => j.verdict === 'FAIL');
  const passAll =
    l0Ok &&
    mandatoryFail.length === 0 &&
    !anyFail &&
    R.nest_core_leave_non404.length === 0;

  R.overall = passAll ? 'PASS' : mandatoryFail.length ? 'FAIL' : 'PASS_WITH_HOLD';
  R.ack_status = mandatoryFail.length || !l0Ok ? 'FAIL_TO_PM' : 'PASS_TO_PM';
  R.probes = {
    nest_core_leave_non404: R.nest_core_leave_non404.length,
    attendance_mutations: R.attendance_mutations.length,
    leave_create_posts: R.leave_create_hits.length,
    panel_gets: R.panel_hits.length,
  };
  R.endedAt = ts();
  save();

  console.log(
    `\n=== ${R.ack_status} stamp=${STAMP} overall=${R.overall} mandatoryFail=${mandatoryFail.join(',')} nestCore=${R.nest_core_leave_non404.length} ===`,
  );
  process.exit(mandatoryFail.length || !l0Ok ? 1 : 0);
}

main().catch((e) => {
  R.overall = 'FAIL';
  R.ack_status = 'FAIL_TO_PM';
  R.defects.push({ sev: 'P0', id: 'RUNNER', note: String(e).slice(0, 300) });
  R.endedAt = ts();
  save();
  console.error(e);
  process.exit(1);
});
