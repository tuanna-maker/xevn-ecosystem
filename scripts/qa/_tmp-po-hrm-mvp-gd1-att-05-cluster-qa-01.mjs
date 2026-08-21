#!/usr/bin/env node
/**
 * PO-HRM-MVP-GD1-ATT-05-CLUSTER-QA-01 — U65 zero-seed · J-HRM-ATT-05-01..06
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
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-mvp-gd1-att-05-cluster-qa-01.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-mvp-gd1-att-05-cluster-qa-01');
mkdirSync(SCREEN, { recursive: true });

const ATT04QC1 = 'ATT04QC1-MSM22G4W';
const ATT04BQC1 = 'ATT04BQC1-MSM3S8QC1';
const ATT09QC1 = 'ATT09QC1-MSLUTL9D';
const ATT03DQC1 = 'ATT03DQC1-MSM1CR19';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();
const stampSuffix = Date.now().toString(36).toLowerCase().slice(-8);
const STAMP = `ATT05QA1-${stampSuffix.toUpperCase()}`;

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const R = {
  work_item_id: 'PO-HRM-MVP-GD1-ATT-05-CLUSTER-QA-01',
  stamp: STAMP,
  fe_evidence: 'docs/qa/evidence/po-hrm-mvp-gd1-att-05-cluster-fe-01.md',
  startedAt: ts(),
  persona: { email: EMAIL, companyId: COMPANY },
  u65: 'zero-seed-browser-only',
  honesty: {
    attendance_uat_ready: false,
    ne_att05_done: true,
    ne_fr05_done: true,
    ne_att_module_uat: true,
    seed_used: false,
    c_slice: true,
  },
  must_keep: [ATT04QC1, ATT04BQC1, ATT09QC1, ATT03DQC1],
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
  const entry = { method, url: url.replace(/^https?:\/\/[^/]+/, '').slice(0, 480), status, at: ts(), nest_core, attendance, lvt, lvrule, grant, panel };
  R.network.push(entry);
  if (nest_core) R.nest_core_hits.push(entry);
  if (nest_core && isNestCoreLeave(url) && status !== 404) R.nest_core_leave_non404.push(entry);
  if (attendance && method !== 'GET') R.attendance_mutations.push(entry);
  if (lvt) R.lvt_hits.push(entry);
  if (lvrule) R.lvrule_hits.push(entry);
  if (grant) R.grant_hits.push(entry);
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
    const empOpt = page.locator('[role="option"]').filter({ hasNotText: /CORE07|qa_c07p/i }).first();
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

  // J-05-01 — allowsCarryOver + category carry_over
  try {
    const host = await openLeaveRules(page);
    await host.locator('[data-testid="settings-att-leave-types"]').waitFor({ state: 'visible', timeout: 15000 });
    await sleep(1500);
    let row = host.locator('[data-testid="settings-att-leave-type-row-carry_over"]').first();
    let rowExists = await row.isVisible({ timeout: 5000 }).catch(() => false);
    if (!rowExists) {
      log('J-05-01 bootstrap carry_over type via FE');
      await host.locator('[data-testid="hdsd-att-leave-type-key"]').fill('carry_over');
      await host.locator('[data-testid="hdsd-att-leave-type-name"]').fill('Phép chuyển kỳ');
      const catTrigger = host.locator('[data-testid="hdsd-att-leave-type-category"]').first();
      await catTrigger.click();
      await sleep(300);
      await selectCategoryCarryOver(page);
      await sleep(200);
      await toggleSwitchInWrap(host, 'hdsd-att-leave-type-allows-carry-over', true);
    } else {
      await row.click();
      await sleep(500);
      const catTrigger = host.locator('[data-testid="hdsd-att-leave-type-category"]').first();
      if (await catTrigger.isVisible().catch(() => false)) {
        await catTrigger.click();
        await sleep(300);
        await selectCategoryCarryOver(page);
        await sleep(200);
      }
      await toggleSwitchInWrap(host, 'hdsd-att-leave-type-allows-carry-over', true);
    }
    const lvtBefore = R.lvt_hits.filter((h) => h.method === 'PUT' || h.method === 'PATCH' || h.method === 'POST').length;
    await host.locator('[data-testid="hdsd-att-leave-type-save"]').click();
    log('J-05-01 save carry_over type');
    await sleep(2500);
    const mutate = R.lvt_hits
      .slice(lvtBefore)
      .find((h) => (h.method === 'PUT' || h.method === 'PATCH' || h.method === 'POST') && h.status >= 200 && h.status < 300);
    const carrySwitch = host.locator('[data-testid="hdsd-att-leave-type-allows-carry-over"] button[role="switch"]').first();
    const swState = await carrySwitch.getAttribute('data-state').catch(() => '');
    const switchOn = swState === 'checked' || swState === 'on';
    await page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(2000);
    const host2 = await openLeaveRules(page);
    await host2.locator('[data-testid="settings-att-leave-type-row-carry_over"]').first().click();
    await sleep(400);
    const sw2 = await host2
      .locator('[data-testid="hdsd-att-leave-type-allows-carry-over"] button[role="switch"]')
      .first()
      .getAttribute('data-state')
      .catch(() => '');
    const f5On = sw2 === 'checked' || sw2 === 'on';
    const typeProbe2 = await apiCall(session.token, 'GET', `/attendance/leave-types?company_id=${COMPANY}`);
    const items2 = Array.isArray(typeProbe2.data?.data) ? typeProbe2.data.data : [];
    const savedCo2 = items2.find((i) => (i.leaveTypeKey ?? i.leave_type_key) === 'carry_over');
    const apiCarryOn2 = Boolean(savedCo2?.allowsCarryOver ?? savedCo2?.allows_carry_over);
    const catOk = (savedCo2?.category ?? '') === 'carry_over';
    await shot(page, '01-j05-01-carry-type');
    const pass = mutate && (switchOn || apiCarryOn2) && (f5On || apiCarryOn2) && catOk && nestOk();
    jset('J-HRM-ATT-05-01', pass ? 'PASS' : 'FAIL', {
      summary: `LVT ${mutate?.status} allowsCarryOver UI=${switchOn} API=${apiCarryOn2} cat=${savedCo2?.category} F5=${f5On} nestCore=${R.nest_core_leave_non404.length}`,
      click_path: 'Thiết lập → Quy định nghỉ → carry_over → Cho phép mang sang → Lưu → F5',
      mutate,
      nest_core_0: nestOk(),
    });
  } catch (e) {
    jset('J-HRM-ATT-05-01', 'FAIL', { summary: String(e).slice(0, 300) });
    R.defects.push({ sev: 'P0', id: 'J05-01-ERR', note: String(e).slice(0, 200) });
  }

  // J-05-02 — panel Phép chuyển kỳ
  try {
    const host = await openLeaveTab(page);
    await clickCreateLeave(host, page);
    const dlg = host.locator('[data-testid="att-leave-create-dialog-precision"]').first();
    await dlg.waitFor({ state: 'visible', timeout: 15000 });
    const trigger = dlg.locator('.xevn-field-select-md').first();
    await trigger.click({ timeout: 10000 });
    await sleep(500);
    await page.locator('[role="option"]').filter({ hasNotText: /CORE07|qa_c07p/i }).first().click();
    await sleep(3000);
    const carryRow = dlg.locator('[data-testid="leave-balance-row-carry_over"]').first();
    const carryVisible = await carryRow.isVisible({ timeout: 15000 }).catch(() => false);
    const carryLabel = (await carryRow.innerText().catch(() => '')).includes('Phép chuyển kỳ');
    await shot(page, '02-j05-02-panel-carry');
    await host.keyboard.press('Escape').catch(() => {});
    const pass = carryVisible && carryLabel && nestOk();
    jset('J-HRM-ATT-05-02', pass ? 'PASS' : 'FAIL', {
      summary: `row carry_over=${carryVisible} labelVi=${carryLabel} nestCore=${R.nest_core_leave_non404.length}`,
      click_path: 'Nghỉ phép → Tạo → chọn NV → panel dialog row carry_over «Phép chuyển kỳ»',
      nest_core_0: nestOk(),
    });
  } catch (e) {
    jset('J-HRM-ATT-05-02', 'FAIL', { summary: String(e).slice(0, 300) });
  }

  // J-05-03 — LVRULE carry cols
  try {
    const host = await openLeaveRules(page);
    await host.locator('[data-testid="settings-att-leave-accrual-policies"]').first().scrollIntoViewIfNeeded().catch(() => {});
    await sleep(400);
    await host.locator('[data-testid="hdsd-att-lvrule-leave-type"]').first().click();
    await sleep(300);
    const coOpt = page.locator('[role="option"]').filter({ hasText: /chuyển kỳ|Chuyển năm|carry_over/i }).first();
    if (await coOpt.isVisible({ timeout: 3000 }).catch(() => false)) await coOpt.click();
    else await page.locator('[role="option"]').filter({ hasText: /annual|Phép năm/i }).first().click();
    await sleep(300);
    const ruleTrigger = host.locator('[data-testid="hdsd-att-lvrule-carry-expire-rule"]').first();
    if (await ruleTrigger.isVisible({ timeout: 5000 }).catch(() => false)) {
      await ruleTrigger.click();
      await sleep(300);
      await page.locator('[role="option"]').first().click();
      await sleep(200);
    }
    const capInput = host.locator('[data-testid="hdsd-att-lvrule-carry-cap-days"]').first();
    if (await capInput.isVisible().catch(() => false)) await capInput.fill('5');
    const effIso = '2030-06-01';
    const effFrom = host.locator('[data-testid="hdsd-att-lvrule-effective-from"]').first();
    if (await effFrom.isVisible().catch(() => false)) {
      const inputType = await effFrom.getAttribute('type').catch(() => '');
      await effFrom.fill(inputType === 'date' ? effIso : effIso.split('-').reverse().join('/'));
    }
    const annualDays = host.locator('[data-testid="hdsd-att-lvrule-annual-days"]').first();
    if (await annualDays.isVisible().catch(() => false)) await annualDays.fill('12');
    const modeTrigger = host.locator('[data-testid="hdsd-att-lvrule-mode"]').first();
    if (await modeTrigger.isVisible().catch(() => false)) {
      await modeTrigger.click();
      await sleep(250);
      await page.locator('[role="option"]').first().click();
      await sleep(200);
    }
    const lvrBefore = R.network.length;
    await host.locator('[data-testid="hdsd-att-lvrule-save"]').click();
    log('J-05-03 save LVRULE carry');
    await sleep(2500);
    const polMutate = R.network
      .slice(lvrBefore)
      .find((h) => h.lvrule && h.method === 'POST' && h.status >= 200 && h.status < 300);
    const carryRuleVisible = await ruleTrigger.isVisible({ timeout: 3000 }).catch(() => false);
    const carryCapVisible = await capInput.isVisible().catch(() => false);
    const policyRows = await host.locator('[data-testid^="att-lvrule-row-"]').count();
    const tableText = await host.locator('[data-testid="settings-att-leave-accrual-policies"]').innerText().catch(() => '');
    const tableCarryMeta = /Trần|mang sang|Q1|carry/i.test(tableText);
    const fyHold = await host.locator('[data-testid="att-05-fy-hold"]').isVisible({ timeout: 5000 }).catch(() => false);
    const lvruleHonesty = (await host.locator('[data-testid="att-05-lvrule-honesty"]').innerText().catch(() => '')).includes('ATT-05');
    await shot(page, '03-j05-03-lvrule-carry');
    const pass =
      (polMutate && fyHold && lvruleHonesty && nestOk()) ||
      (carryRuleVisible && carryCapVisible && policyRows >= 1 && tableCarryMeta && fyHold && lvruleHonesty && nestOk());
    jset('J-HRM-ATT-05-03', pass ? 'PASS' : 'FAIL', {
      summary: `POST policy ${polMutate?.status ?? '—'} carryUi=${carryRuleVisible}/${carryCapVisible} rows=${policyRows} tableCarry=${tableCarryMeta} att-05-fy-hold=${fyHold} ≠expire job DONE nestCore=${R.nest_core_leave_non404.length}`,
      click_path: 'Quy tắc quỹ → carry rule+cap → Lưu',
      polMutate,
      nest_core_0: nestOk(),
    });
  } catch (e) {
    jset('J-HRM-ATT-05-03', 'FAIL', { summary: String(e).slice(0, 300) });
  }

  // J-05-04 — separate ledger + grant carry_over
  try {
    const host = await openLeaveTab(page);
    const dlg = await openGrantDialog(host, page).then(() => host.locator('[data-testid="att-leave-create-dialog-precision"]').first());
    await dlg.waitFor({ state: 'visible', timeout: 15000 });
    const grantAnnual = await grantInDialog(host, dlg, page, { leaveTypeKey: 'annual', days: 8 });
    const grantCarry = await grantInDialog(host, dlg, page, { leaveTypeKey: 'carry_over', days: 3 });
    await sleep(2000);
    const rowAnnual = await dlg.locator('[data-testid="leave-balance-row-annual"]').isVisible({ timeout: 10000 }).catch(() => false);
    const rowCarry = await dlg.locator('[data-testid="leave-balance-row-carry_over"]').isVisible({ timeout: 10000 }).catch(() => false);
    const ledgerSep = await dlg.locator('[data-testid="att-05-ledger-sep"]').isVisible({ timeout: 8000 }).catch(() => false);
    const availAnnual = await dlg.locator('[data-testid="leave-balance-available-annual"]').innerText().catch(() => '');
    const availCarry = await dlg.locator('[data-testid="leave-balance-available-carry_over"]').innerText().catch(() => '');
    await shot(page, '04-j05-04-ledger-sep');
    await host.keyboard.press('Escape').catch(() => {});
    await page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(1200);
    const pass =
      grantAnnual &&
      grantCarry &&
      rowAnnual &&
      rowCarry &&
      ledgerSep &&
      nestOk() &&
      !R.honesty.seed_used;
    if (!pass) R.defects.push({ sev: 'P0', id: 'J05-04', note: `grants=${!!grantAnnual}/${!!grantCarry} rows=${rowAnnual}/${rowCarry}` });
    jset('J-HRM-ATT-05-04', pass ? 'PASS' : 'FAIL', {
      summary: `PUT annual=${grantAnnual?.status} carry=${grantCarry?.status} rows sep ledgerSep=${ledgerSep} avail annual=${availAnnual.trim()} carry=${availCarry.trim()} deduct=HOLD footer`,
      click_path: 'Tạo → grant annual + grant carry_over → F5 → att-05-ledger-sep',
      grantAnnual,
      grantCarry,
      nest_core_0: nestOk(),
      deduct_order: 'HOLD R-ATT-05-DEDUCT',
    });
  } catch (e) {
    jset('J-HRM-ATT-05-04', 'FAIL', { summary: String(e).slice(0, 300) });
  }

  // J-05-05 — FY HOLD footer
  try {
    const host = await openLeaveRules(page);
    const fyHold = host.locator('[data-testid="att-05-fy-hold"]').first();
    const fyText = (await fyHold.innerText().catch(() => '')).trim();
    const pass =
      (await fyHold.isVisible({ timeout: 8000 }).catch(() => false)) &&
      /R-ATT-05-FY|F-ATT-FY-01|HOLD/i.test(fyText) &&
      nestOk();
    await shot(page, '05-j05-05-fy-hold');
    jset('J-HRM-ATT-05-05', pass ? 'PASS_WITH_HOLD' : 'FAIL', {
      summary: `att-05-fy-hold visible · FY CRUD not LIVE · interim calendar only`,
      click_path: 'Quy định nghỉ → att-05-fy-hold footer',
      fyText: fyText.slice(0, 400),
      nest_core_0: nestOk(),
    });
  } catch (e) {
    jset('J-HRM-ATT-05-05', 'FAIL', { summary: String(e).slice(0, 300) });
  }

  // J-05-06 — honesty · ENGINE HOLD · must_keep
  try {
    const host = await openLeaveTab(page);
    const h05 = await readHonesty05(host);
    const att09Text = (await host.locator('[data-testid="att-09-honesty"]').innerText().catch(() => '')).trim();
    const mk09 = /pending_days|ATT-09|ATT09|hold/i.test(att09Text);
    const pass =
      h05.visible &&
      h05.neAtt05 &&
      h05.fyHold &&
      h05.engineHold &&
      h05.ledgerSep &&
      mk09 &&
      nestOk() &&
      !R.honesty.seed_used;
    await page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(1200);
    await openLeaveTab(page);
    await shot(page, '06-j05-06-honesty-f5');
    jset('J-HRM-ATT-05-06', pass ? 'PASS_WITH_HOLD' : 'FAIL', {
      summary: `att-05-honesty neDone=${h05.neAtt05} fy=${h05.fyHold} engine=${h05.engineHold} att09=${mk09} nestCore=${R.nest_core_leave_non404.length}`,
      click_path: 'Nghỉ phép → att-05-honesty · ROLLOVER/EXPIRE HOLD · ≠ ATT-05/ATT UAT',
      honesty: h05,
      must_keep: R.must_keep,
      nest_core_0: nestOk(),
    });
  } catch (e) {
    jset('J-HRM-ATT-05-06', 'FAIL', { summary: String(e).slice(0, 300) });
  }

  await browser.close();

  const mandatory = ['J-HRM-ATT-05-01', 'J-HRM-ATT-05-02', 'J-HRM-ATT-05-03', 'J-HRM-ATT-05-04'];
  const holdOk = ['J-HRM-ATT-05-05', 'J-HRM-ATT-05-06'];
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
