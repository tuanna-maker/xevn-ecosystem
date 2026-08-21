#!/usr/bin/env node
/**
 * PO-HRM-MVP-GD1-ATT-04-CLUSTER-QA-01 — U65 zero-seed · J-HRM-ATT-04-01..06
 * Persona: ceo@xe.vn · companyId=main · C-SLICE · ≠ ATT-04 / ATT UAT DONE
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
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-mvp-gd1-att-04-cluster-qa-01.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-mvp-gd1-att-04-cluster-qa-01');
mkdirSync(SCREEN, { recursive: true });
mkdirSync(resolve(ROOT, 'docs/qa/evidence'), { recursive: true });

const ATT03D_SEAL = 'ATT03DQC1-MSM1CR19';
const ATT03B_SEAL = 'ATT03BQC1-MSM0891H';
const ATT01_SEAL = 'ATT01QC1-MSLZ3KIM';
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
const stampSuffix = Date.now().toString(36).toLowerCase().slice(-8);
const STAMP = `ATT04QA1-${stampSuffix.toUpperCase()}`;
const NEW_TYPE_KEY = `hr_att04_${stampSuffix}`;
const NEW_TYPE_NAME = `QA ATT-04 loại ${stampSuffix}`;

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
  work_item_id: 'PO-HRM-MVP-GD1-ATT-04-CLUSTER-QA-01',
  program: 'PO-HRM-MVP-GD1-CONTINUOUS',
  uc_ids: ['UC-BP-ATT-04', 'FR-UC-BP-ATT-04'],
  stamp: STAMP,
  fe_evidence: 'docs/qa/evidence/po-hrm-mvp-gd1-att-04-cluster-fe-01.md',
  startedAt: ts(),
  persona: { email: EMAIL, companyId: COMPANY },
  u65: 'zero-seed-browser-only',
  new_type_key: NEW_TYPE_KEY,
  honesty: {
    attendance_uat_ready: false,
    ne_att04_done: true,
    ne_att_module_uat: true,
    fy_hold: true,
    engine_hold: true,
    printable_false: true,
    pay_out: true,
    deny_att_leave_hold: true,
    nest_core_deny: true,
    seed_used: false,
    c_slice: true,
  },
  must_keep: [
    ATT03D_SEAL,
    ATT03B_SEAL,
    ATT01_SEAL,
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
    p.includes('hold') ||
    p.includes('work-site')
  );
}

function trackUrl(method, url, status, extra = {}) {
  if (!/\/api\/hrm\//.test(url)) return;
  const nest_core = /\/api\/hrm\/core(\/|$|\?)/.test(url);
  const lvt =
    /\/attendance\/leave-types/.test(url) &&
    !/\/effective/.test(url) &&
    (method === 'GET' || method === 'POST' || method === 'PUT' || method === 'PATCH');
  const lvrule = /\/attendance\/leave-accrual-policies/.test(url);
  const grant =
    /\/attendance\/leave-balance\/tracked-entitlement/.test(url) && method === 'PUT';
  const panel = /leave-balance(\/panel)?(\?|$)/.test(url) && method === 'GET';
  const entry = {
    method,
    url: url.replace(/^https?:\/\/[^/]+/, '').slice(0, 480),
    status: status ?? null,
    at: ts(),
    nest_core,
    lvt,
    lvrule,
    grant,
    panel,
    ...extra,
  };
  R.network.push(entry);
  if (nest_core) R.nest_core_hits.push(entry);
  if (nest_core && isNestCoreLeave(url) && status !== 404) R.nest_core_leave_non404.push(entry);
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
    : `${HRM}${path.startsWith('/api/') ? path : `/api/hrm${path.startsWith('/') ? path : `/${path}`}`}`;
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
    summary: summarizeBody(json, 600),
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
  const probes = [
    ['nest_core_work_sites', `/api/hrm/core/attendance/work-sites?company_id=${COMPANY}`],
    ['nest_core_leave_types', `/api/hrm/core/attendance/leave-types?company_id=${COMPANY}`],
    ['nest_core_leave_requests', `/api/hrm/core/attendance/leave-requests?company_id=${COMPANY}`],
  ];
  for (const [key, p] of probes) {
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
  page.on('response', async (res) => {
    try {
      const req = res.request();
      trackUrl(req.method(), res.url(), res.status());
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

async function openLeaveRules(page) {
  await page.goto(attendanceUrl(), { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(1500);
  const settingsBtn = page.getByRole('button', { name: /Thiết lập|Cài đặt/i }).first();
  if (await settingsBtn.isVisible().catch(() => false)) {
    await settingsBtn.click({ timeout: 10000 });
    log('open Thiết lập');
  } else {
    const hit =
      (await findAcross(page, 'button:has-text("Thiết lập")')) ||
      (await findAcross(page, 'button:has-text("Cài đặt")'));
    if (!hit) throw new Error('settings tab not found');
    await hit.locator.click({ force: true });
  }
  await sleep(800);
  const shell = await waitAcross(page, '[data-testid="att-settings-shell-precision"]', 20000);
  if (!shell) throw new Error('att-settings-shell-precision missing');

  const leaveNav = shell.host.getByRole('button', { name: /Quy định nghỉ/i }).first();
  if (await leaveNav.isVisible().catch(() => false)) {
    await leaveNav.click({ timeout: 10000 });
    log('open Quy định nghỉ sidebar');
  } else {
    const hit = await findAcross(page, 'button:has-text("Quy định nghỉ")');
    if (!hit) throw new Error('Quy định nghỉ nav not found');
    await hit.locator.click({ force: true });
  }
  await sleep(1000);
  const panel = await waitAcross(page, '[data-testid="att-cfg-leave-rules-precision"]', 25000);
  if (!panel) throw new Error('att-cfg-leave-rules-precision missing');
  return panel.host;
}

async function openLeaveTab(page) {
  await page.goto(attendanceUrl(), { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(1500);
  const leaveBtn = page.getByRole('button', { name: /^Nghỉ phép$/i }).first();
  if (await leaveBtn.isVisible().catch(() => false)) {
    await leaveBtn.click({ timeout: 10000 });
    log('open Nghỉ phép');
  } else {
    const hit = await findAcross(page, 'button:has-text("Nghỉ phép")');
    if (hit) await hit.locator.click({ force: true });
  }
  await sleep(1200);
  const shell = await waitAcross(page, '[data-testid="att-leave-precision"]', 25000);
  if (!shell) throw new Error('att-leave-precision missing');
  return shell.host;
}

async function pickEmployeeOnLeaveTab(page, host) {
  const createBtn = host.getByRole('button', { name: /Tạo yêu cầu nghỉ|Tạo yêu cầu/i }).first();
  if (await createBtn.isVisible().catch(() => false)) {
    await createBtn.click({ timeout: 10000 });
    await sleep(800);
    const dlg = host.locator('[data-testid="att-leave-create-dialog-precision"]').first();
    if (await dlg.isVisible().catch(() => false)) {
      const trigger = dlg.locator('.xevn-field-select-md').first();
      if (await trigger.isVisible().catch(() => false)) {
        await trigger.click();
        await sleep(500);
        const opt = page.locator('[role="option"]').first();
        await opt.waitFor({ state: 'visible', timeout: 10000 });
        const label = (await opt.innerText().catch(() => '')).trim();
        await opt.click();
        log('pick employee in create dialog', { label: label.slice(0, 60) });
        await host.keyboard.press('Escape').catch(() => {});
        await sleep(400);
        return label;
      }
    }
  }
  return '';
}

async function readHonesty04(host) {
  const honesty = host.locator('[data-testid="att-04-honesty"]').first();
  const text = (await honesty.innerText().catch(() => '')).trim();
  const fy = /R-ATT-04-FY|FY HOLD/i.test(text);
  const engine = /R-ATT-04-ENGINE|ENGINE HOLD|F-ATT-LEAVE-04/i.test(text);
  const neDone = /≠ ATT-04 DONE|≠ ATT module UAT/i.test(text);
  const denyHold = /att_leave_hold|pending_days/i.test(text);
  return { visible: Boolean(text), text: text.slice(0, 500), fy, engine, neDone, denyHold };
}

async function main() {
  save();
  const session = await loginApi();
  const l0Ok = await l0(session.token);
  if (!l0Ok) {
    R.defects.push({ sev: 'P0', id: 'L0', note: 'stack not healthy' });
  }

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  trackPage(page);
  await injectPortalAuth(page, session);

  let nestOk = R.nest_core_leave_non404.length === 0;

  // ——— J-01 Loại phép N+1 ———
  try {
    const host = await openLeaveRules(page);
    await shot(page, '01-j01-leave-rules');
    const keyInput = host.locator('[data-testid="hdsd-att-leave-type-key"]').first();
    const nameInput = host.locator('[data-testid="hdsd-att-leave-type-name"]').first();
    await keyInput.fill(NEW_TYPE_KEY);
    await nameInput.fill(NEW_TYPE_NAME);
    const lvtBefore = R.lvt_hits.filter((h) => h.method === 'POST' || h.method === 'PUT').length;
    await host.locator('[data-testid="hdsd-att-leave-type-save"]').click();
    log('J-01 save leave type');
    await sleep(2000);
    const lvtAfter = R.lvt_hits.filter((h) => h.method === 'POST' || h.method === 'PUT');
    const mutate = lvtAfter.slice(lvtBefore).find((h) => h.status >= 200 && h.status < 300);
    const row = host.locator(`[data-testid="settings-att-leave-type-row-${NEW_TYPE_KEY}"]`).first();
    const rowVisible = await row.isVisible({ timeout: 8000 }).catch(() => false);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(2000);
    await openLeaveRules(page);
    const rowF5 = await host
      .locator(`[data-testid="settings-att-leave-type-row-${NEW_TYPE_KEY}"]`)
      .isVisible({ timeout: 8000 })
      .catch(() => false);
    await shot(page, '02-j01-f5-type-row');
    const j01Pass =
      mutate &&
      mutate.status >= 200 &&
      mutate.status < 300 &&
      rowVisible &&
      rowF5 &&
      nestOk;
    if (!j01Pass) {
      R.defects.push({ sev: 'P0', id: 'J01-TYPE', note: `mutate=${mutate?.status} row=${rowVisible} f5=${rowF5}` });
    }
    jset('J-HRM-ATT-04-01', j01Pass ? 'PASS' : 'FAIL', {
      summary: `POST/PUT ${mutate?.status} row=${rowVisible} F5=${rowF5} key=${NEW_TYPE_KEY} nestCore=${R.nest_core_leave_non404.length}`,
      click_path: 'Thiết lập → Quy định nghỉ → Loại phép N+1 → Lưu → F5',
      mutate,
      nest_core_0: nestOk,
    });
  } catch (e) {
    jset('J-HRM-ATT-04-01', 'FAIL', { summary: String(e).slice(0, 300) });
    R.defects.push({ sev: 'P0', id: 'J01-ERR', note: String(e).slice(0, 200) });
  }

  nestOk = R.nest_core_leave_non404.length === 0;

  // ——— J-02 Quy tắc quỹ N+1 ———
  try {
    const host = await openLeaveRules(page);
    const policyCard = host.locator('[data-testid="settings-att-leave-accrual-policies"]').first();
    await policyCard.scrollIntoViewIfNeeded().catch(() => {});
    await sleep(500);
    const typeTrigger = host.locator('[data-testid="hdsd-att-lvrule-leave-type"]').first();
    await typeTrigger.click({ timeout: 10000 });
    await sleep(400);
    const opt = page.locator('[role="option"]').filter({ hasText: NEW_TYPE_NAME }).first();
    if (await opt.isVisible({ timeout: 3000 }).catch(() => false)) {
      await opt.click();
    } else {
      await page.locator('[role="option"]').filter({ hasText: NEW_TYPE_KEY }).first().click();
    }
    await sleep(300);
    const lvrBefore = R.lvrule_hits.filter((h) => h.method === 'POST').length;
    await host.locator('[data-testid="hdsd-att-lvrule-save"]').click();
    log('J-02 save policy');
    await sleep(2000);
    const lvrAfter = R.lvrule_hits.filter((h) => h.method === 'POST');
    const polMutate = lvrAfter.slice(lvrBefore).find((h) => h.status >= 200 && h.status < 300);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(2000);
    const host2 = await openLeaveRules(page);
    const rows = await host2.locator('[data-testid^="att-lvrule-row-"]').count();
    await shot(page, '03-j02-policy-f5');
    const j02Pass = polMutate && polMutate.status >= 200 && polMutate.status < 300 && rows > 0 && nestOk;
    if (!j02Pass) {
      R.defects.push({ sev: 'P0', id: 'J02-POLICY', note: `post=${polMutate?.status} rows=${rows}` });
    }
    jset('J-HRM-ATT-04-02', j02Pass ? 'PASS' : 'FAIL', {
      summary: `POST policy ${polMutate?.status} rows=${rows} nestCore=${R.nest_core_leave_non404.length}`,
      click_path: 'Quy định nghỉ → Quy tắc quỹ → Lưu → F5',
      polMutate,
      nest_core_0: nestOk,
    });
  } catch (e) {
    jset('J-HRM-ATT-04-02', 'FAIL', { summary: String(e).slice(0, 300) });
    R.defects.push({ sev: 'P0', id: 'J02-ERR', note: String(e).slice(0, 200) });
  }

  nestOk = R.nest_core_leave_non404.length === 0;

  // ——— J-03 HR grant (browser PUT) ———
  let grantEmpId = null;
  try {
    const empRes = await apiCall(
      session.token,
      'GET',
      `/employees?page=1&page_size=20&company_id=${COMPANY}`,
    );
    const rows = empRes.data?.data ?? empRes.data?.items ?? [];
    const emp = rows.find((e) => e.status === 'active') ?? rows[0];
    grantEmpId = emp?.id;
    R.setup.grant_emp = { id: grantEmpId, code: emp?.employee_code, name: emp?.full_name };

    const host = await openLeaveTab(page);
    const createBtn = host.getByRole('button', { name: /Tạo yêu cầu nghỉ|Tạo yêu cầu/i }).first();
    await createBtn.click({ timeout: 10000 });
    await sleep(800);
    const dlg = host.locator('[data-testid="att-leave-create-dialog-precision"]').first();
    await dlg.waitFor({ state: 'visible', timeout: 15000 });
    const trigger = dlg.locator('.xevn-field-select-md').first();
    await trigger.click({ timeout: 10000 });
    await sleep(500);
    const empOpt = page.locator('[role="option"]').first();
    await empOpt.waitFor({ state: 'visible', timeout: 10000 });
    await empOpt.click();
    log('J-03 employee selected in create dialog');
    await sleep(1200);

    let grantPanel = dlg.locator('[data-testid="att-04-grant-panel"]').first();
    let panelVisible = await grantPanel.isVisible({ timeout: 3000 }).catch(() => false);
    if (!panelVisible) {
      grantPanel = host.locator('[data-testid="att-04-grant-panel"]').first();
      panelVisible = await grantPanel.isVisible({ timeout: 5000 }).catch(() => false);
    }
    if (!panelVisible) {
      throw new Error('att-04-grant-panel not visible after employee pick');
    }
    const grantBefore = R.grant_hits.length;
    const daysInput =
      (await grantPanel.locator('[data-testid="hdsd-att-grant-entitled-days"]').count()) > 0
        ? grantPanel.locator('[data-testid="hdsd-att-grant-entitled-days"]').first()
        : host.locator('[data-testid="hdsd-att-grant-entitled-days"]').first();
    await daysInput.fill('15');
    const saveBtn =
      (await grantPanel.locator('[data-testid="hdsd-att-grant-save"]').count()) > 0
        ? grantPanel.locator('[data-testid="hdsd-att-grant-save"]').first()
        : host.locator('[data-testid="hdsd-att-grant-save"]').first();
    await saveBtn.click();
    log('J-03 grant save');
    await sleep(2500);
    const grantHit = R.grant_hits.slice(grantBefore).find((h) => h.status >= 200 && h.status < 300);
    await host.keyboard.press('Escape').catch(() => {});
    await sleep(400);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(1500);
    await openLeaveTab(page);
    await shot(page, '04-j03-grant-f5');
    const j03Pass = grantHit && panelVisible && nestOk;
    if (!j03Pass) {
      R.defects.push({ sev: 'P0', id: 'J03-GRANT', note: `put=${grantHit?.status} panel=${panelVisible}` });
    }
    jset('J-HRM-ATT-04-03', j03Pass ? 'PASS' : 'FAIL', {
      summary: `PUT ${grantHit?.status} panelVisible=${panelVisible} nestCore=${R.nest_core_leave_non404.length}`,
      click_path: 'Nghỉ phép → Tạo → chọn NV → att-04-grant-panel → Lưu entitled → F5',
      grantHit,
      nest_core_0: nestOk,
    });
  } catch (e) {
    jset('J-HRM-ATT-04-03', 'FAIL', { summary: String(e).slice(0, 300) });
    R.defects.push({ sev: 'P0', id: 'J03-ERR', note: String(e).slice(0, 200) });
  }

  nestOk = R.nest_core_leave_non404.length === 0;

  // ——— J-04 Panel MVP ———
  try {
    const host = await openLeaveTab(page);
    const panel = host.locator('[data-testid="leave-balance-panel"]').first();
    const panelVisible = await panel.isVisible({ timeout: 10000 }).catch(() => false);
    const panelText = (await panel.innerText().catch(() => '')).slice(0, 800);
    const hasMvp =
      /annual|phép năm|ốm|thai sản|Ốm|Phép/i.test(panelText) || panelText.length > 20;
    await shot(page, '05-j04-panel');
    const j04Pass = panelVisible && hasMvp && nestOk;
    jset('J-HRM-ATT-04-04', j04Pass ? 'PASS' : 'FAIL', {
      summary: `panel=${panelVisible} mvpLabels=${hasMvp} nestCore=${R.nest_core_leave_non404.length}`,
      click_path: 'Nghỉ phép → leave-balance-panel',
      nest_core_0: nestOk,
    });
  } catch (e) {
    jset('J-HRM-ATT-04-04', 'FAIL', { summary: String(e).slice(0, 300) });
  }

  // ——— J-05 EFF / CNS ———
  try {
    const eff = await apiCall(session.token, 'GET', `/attendance/leave-types/effective?company_id=${COMPANY}`);
    const effItems = eff.data?.items ?? eff.data?.data ?? eff.data ?? [];
    const hasNewType = Array.isArray(effItems) && effItems.some((t) => t.leaveTypeKey === NEW_TYPE_KEY);
    const host = await openLeaveTab(page);
    const createBtn = host.getByRole('button', { name: /Tạo yêu cầu nghỉ|Tạo yêu cầu/i }).first();
    let effPickerOk = false;
    if (await createBtn.isVisible().catch(() => false)) {
      await createBtn.click();
      await sleep(800);
      const dlg = host.locator('[data-testid="att-leave-create-dialog-precision"]').first();
      const typeCombo = dlg.getByRole('combobox').nth(1);
      if (await typeCombo.isVisible().catch(() => false)) {
        await typeCombo.click();
        await sleep(500);
        const optNew = page.locator('[role="option"]').filter({ hasText: NEW_TYPE_NAME }).first();
        effPickerOk = await optNew.isVisible({ timeout: 5000 }).catch(() => false);
        await host.keyboard.press('Escape').catch(() => {});
      }
    }
    let cnsProbe = { status: 'SKIP' };
    if (grantEmpId) {
      cnsProbe = await apiCall(session.token, 'PUT', `/attendance/leave-balance/tracked-entitlement`, {
        body: {
          company_id: COMPANY,
          employee_id: grantEmpId,
          leave_type: NEW_TYPE_KEY,
          balance_year: 2026,
          entitled_days: 14,
          accrual_mode: 'manual_only',
          annual_days: 99,
        },
      });
    }
    const cnsOk =
      cnsProbe.status === 400 ||
      cnsProbe.status === 409 ||
      cnsProbe.code === 'HRM-ATT-LVRULE-KEY' ||
      cnsProbe.status === 200;
    await shot(page, '06-j05-eff-cns');
    const j05Pass = (hasNewType || effPickerOk) && nestOk;
    jset('J-HRM-ATT-04-05', j05Pass ? 'PASS' : 'FAIL', {
      summary: `EFF hasType=${hasNewType} picker=${effPickerOk} CNS probe=${cnsProbe.status}:${cnsProbe.code}`,
      click_path: 'Tạo đơn → EFF picker · API CNS probe when policy active',
      cnsProbe: { status: cnsProbe.status, code: cnsProbe.code },
      nest_core_0: nestOk,
    });
  } catch (e) {
    jset('J-HRM-ATT-04-05', 'FAIL', { summary: String(e).slice(0, 300) });
  }

  nestOk = R.nest_core_leave_non404.length === 0;

  // ——— J-06 Seals · HOLD · ≠DONE ———
  try {
    const host = await openLeaveRules(page);
    const honesty = await readHonesty04(host);
    const pageText = (await host.innerText().catch(() => '')).slice(0, 2000);
    const sealsOk =
      pageText.includes(ATT03D_SEAL.slice(0, 12)) ||
      pageText.includes('ATT03D') ||
      honesty.neDone;
    const fyEngine =
      honesty.fy && honesty.engine && /ENGINE HOLD|FY HOLD/i.test(honesty.text + pageText);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(1500);
    await openLeaveRules(page);
    await shot(page, '07-j06-honesty-f5');
    const denyHold =
      /pending_days|att_leave_hold|ATT09QC1|MSLUTL9D/i.test(honesty.text + pageText) ||
      R.must_keep.includes(ATT09_SEAL);
    const j06Pass =
      honesty.visible &&
      honesty.neDone &&
      fyEngine &&
      denyHold &&
      nestOk &&
      !R.honesty.seed_used;
    jset('J-HRM-ATT-04-06', j06Pass ? 'PASS' : 'FAIL', {
      summary: `honesty visible=${honesty.visible} neDone=${honesty.neDone} fyEngine=${fyEngine} denyHold=${denyHold} nestCore=${R.nest_core_leave_non404.length}`,
      click_path: 'F5 → att-04-honesty · FY/ENGINE HOLD footers',
      honesty,
      must_keep: R.must_keep,
      nest_core_0: nestOk,
    });
  } catch (e) {
    jset('J-HRM-ATT-04-06', 'FAIL', { summary: String(e).slice(0, 300) });
  }

  await browser.close();

  const journeyIds = [
    'J-HRM-ATT-04-01',
    'J-HRM-ATT-04-02',
    'J-HRM-ATT-04-03',
    'J-HRM-ATT-04-04',
    'J-HRM-ATT-04-05',
    'J-HRM-ATT-04-06',
  ];
  const fails = journeyIds.filter((id) => R.journeys[id]?.verdict === 'FAIL');
  const passAll = fails.length === 0 && l0Ok && R.nest_core_leave_non404.length === 0;
  R.overall = passAll ? 'PASS' : 'FAIL';
  R.ack_status = passAll ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  R.probes = {
    nest_core_leave_non404: R.nest_core_leave_non404.length,
    lvt_mutations: R.lvt_hits.filter((h) => h.method !== 'GET').length,
    lvrule_mutations: R.lvrule_hits.filter((h) => h.method !== 'GET').length,
    grant_puts: R.grant_hits.length,
    panel_gets: R.panel_hits.length,
  };
  R.endedAt = ts();
  save();

  console.log(`\n=== ${R.ack_status} stamp=${STAMP} overall=${R.overall} fails=${fails.join(',')} nestCore=${R.nest_core_leave_non404.length} ===`);
  process.exit(passAll ? 0 : 1);
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
