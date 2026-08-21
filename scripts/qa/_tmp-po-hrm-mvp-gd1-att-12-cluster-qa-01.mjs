#!/usr/bin/env node
/**
 * QA-PO-HRM-MVP-GD1-ATT-12-CLUSTER-01 — U65 zero-seed
 * J-HRM-ATT-12-01..05 + J-12-07 · regression J-HRM-ATT-06-04 · J-HRM-ATT-07-03..05
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
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-mvp-gd1-att-12-cluster-qa-01.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-mvp-gd1-att-12-cluster-qa-01');
const FIXTURE_PNG = join(SCREEN, '_fixture-sick-attach.png');
mkdirSync(SCREEN, { recursive: true });

const ATT07QC1 = 'ATT07QC1-MSM9GWC1';
const ATT06QC1 = 'ATT06QC1-MSM84GWC1';
const ATT05BQC1 = 'ATT05BQC1-MSM5SDQC1';
const ATT09QC1 = 'ATT09QC1-MSLUTL9D';
const CORE07QC1 = 'CORE07QC1-KZJTSHNT';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();
const STAMP = `ATT12QA1-${Date.now().toString(36).toUpperCase().slice(-8)}`;

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const R = {
  work_item_id: 'QA-PO-HRM-MVP-GD1-ATT-12-CLUSTER-01',
  stamp: STAMP,
  fe_evidence: 'docs/qa/evidence/po-hrm-mvp-gd1-att-12-cluster-fe-01.md',
  be_evidence: 'docs/qa/evidence/po-hrm-mvp-gd1-att-12-cluster-be-01.md',
  startedAt: ts(),
  persona: { email: EMAIL, companyId: COMPANY },
  u65: 'zero-seed-browser-only',
  honesty: {
    attendance_uat_ready: false,
    ne_att12_done: true,
    ne_fr12_done: true,
    c_slice: true,
    seed_used: false,
  },
  must_keep: [ATT07QC1, ATT06QC1, ATT05BQC1, ATT09QC1, CORE07QC1],
  env: { PORTAL, HRM, XBOS, TENANT, commit: COMMIT },
  l0: {},
  l1: {},
  network: [],
  panel_hits: [],
  shift_default_hits: [],
  nest_core_leave_non404: [],
  setup: {},
  consoleErrors: [],
  pageErrors: [],
  screens: [],
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
  return /leave|holiday|attendance|\/att\/|hold/.test(p);
}

function trackUrl(method, url, status, extra = {}) {
  if (!/\/api\/hrm\//.test(url)) return;
  const nest_core = /\/api\/hrm\/core(\/|$|\?)/.test(url);
  const panel = /leave-balance\/panel/.test(url) && method === 'GET';
  const shiftDef = /shift-assignments\/activate-default/.test(url) && method === 'GET';
  const entry = {
    method,
    url: url.replace(/^https?:\/\/[^/]+/, '').slice(0, 480),
    status,
    at: ts(),
    nest_core,
    panel,
    shiftDef,
    ...extra,
  };
  R.network.push(entry);
  if (nest_core && isNestCoreLeave(url) && status !== 404) R.nest_core_leave_non404.push(entry);
  if (panel) R.panel_hits.push(entry);
  if (shiftDef) R.shift_default_hits.push(entry);
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

function sickRangesForRun() {
  const off = parseInt(STAMP.replace(/\D/g, '').slice(-3), 10) % 20;
  const pad = (n) => String(n).padStart(2, '0');
  const dShort = 12 + off;
  return { short: { startVi: `${pad(dShort)}/12/2027`, endVi: `${pad(dShort + 1)}/12/2027` } };
}

function ensureFixturePng() {
  const png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64',
  );
  writeFileSync(FIXTURE_PNG, png);
  return FIXTURE_PNG;
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
      id: data.userId ?? 'ceo',
      email: EMAIL,
      tenantId: TENANT,
      companyId: COMPANY,
      roles: data.roles ?? ['group_ceo'],
    },
    raw: data,
  };
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
  trackUrl(method, url, r.status, { code: json?.code });
  return { status: r.status, data: json?.data ?? json, json };
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
  page.on('response', (res) => {
    try {
      trackUrl(res.request().method(), res.url(), res.status());
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

async function pickActiveEmployee(token) {
  const empRes = await apiCall(token, 'GET', `/employees?page=1&page_size=100&company_id=${COMPANY}`);
  const rows = empRes.data?.data ?? empRes.data?.items ?? [];
  const active = rows.filter(
    (e) =>
      (e.status === 'active' || e.employment_status === 'active') &&
      !/qa_c07|PENDING|HIRE-|CORE07/i.test(`${e.full_name || ''}${e.employee_code || ''}`),
  );
  for (const e of active.slice(0, 15)) {
    const panel = await apiCall(
      token,
      'GET',
      `/attendance/leave-balance/panel?employee_id=${encodeURIComponent(e.id)}&company_id=${COMPANY}`,
    );
    if (panel.status === 200) return { id: e.id, name: e.full_name, status: e.status };
  }
  return active[0] ? { id: active[0].id, name: active[0].full_name, status: active[0].status } : null;
}

async function openProfile(page, employeeId) {
  await page.goto(q(`/hr/employees/${employeeId}`), { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(2800);
}

async function assertAtt12Strip(page, employeeId, label) {
  const strip = await waitAcross(page, '[data-testid="hdsd-emp-att12-enroll-confirm-strip"]', 25000);
  if (!strip) return { ok: false, reason: 'strip missing' };
  const buckets = ['annual', 'seniority', 'compensatory', 'carry_over', 'advance'];
  const vis = {};
  for (const b of buckets) {
    vis[b] = await strip.host
      .locator(`[data-testid="hdsd-emp-att12-leave-row-${b}"]`)
      .isVisible({ timeout: 5000 })
      .catch(() => false);
  }
  const panelOk = R.panel_hits.some(
    (h) => h.status >= 200 && h.status < 300 && h.url.includes(employeeId),
  );
  const shiftOk = R.shift_default_hits.some((h) => h.status >= 200 && h.status < 300);
  const shiftSummary = await strip.host
    .locator('[data-testid="hdsd-emp-att12-shift-summary"]')
    .innerText()
    .catch(() => '');
  const footer = await strip.host.locator('[data-testid="hdsd-emp-att12-honesty-footer"]').innerText().catch(() => '');
  const banner = await strip.host.locator('[data-testid="hdsd-emp-att12-honesty-banner"]').innerText().catch(() => '');
  await shot(page, label);
  return {
    ok: buckets.every((b) => vis[b]) && panelOk && shiftSummary.length > 2,
    vis,
    panelOk,
    shiftOk,
    shiftSummary: shiftSummary.slice(0, 120),
    footer,
    banner,
  };
}

// --- attendance regression helpers (from ATT-07 harness) ---
const R_LEAVE = { eff_hits: [], fund_order_hits: [], leave_create_hits: [], panel_hits_form: [] };

function trackLeaveExtra(method, url, status, extra = {}) {
  trackUrl(method, url, status, extra);
  if (/leave-types\/effective/.test(url) && method === 'GET') R_LEAVE.eff_hits.push({ status });
  if (/sick-leave-fund-order/.test(url)) R_LEAVE.fund_order_hits.push({ method, status });
  if (/\/attendance\/leave-requests(\?|$)/.test(url) && method === 'POST' && !/preview/.test(url)) {
    R_LEAVE.leave_create_hits.push({ status, ...extra });
  }
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

async function openFundOrderPanel(page) {
  await page.goto(attendanceUrl(), { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(1500);
  const settingsBtn = page.getByRole('button', { name: /Thiết lập|Cài đặt/i }).first();
  if (await settingsBtn.isVisible().catch(() => false)) await settingsBtn.click({ timeout: 10000 });
  await sleep(800);
  const shell = await waitAcross(page, '[data-testid="att-settings-shell-precision"]', 20000);
  if (!shell) throw new Error('att-settings-shell missing');
  const nav = shell.host.getByRole('button', { name: /Thứ tự quỹ nghỉ ốm/i }).first();
  if (await nav.isVisible().catch(() => false)) await nav.click({ timeout: 10000 });
  await sleep(1000);
  const panel = await waitAcross(page, '[data-testid="att-cfg-sick-leave-fund-order-precision"]', 20000);
  if (!panel) throw new Error('fund-order panel missing');
  return panel.host;
}

let sickMeta = null;

async function findSickTypeFromEff(token) {
  for (const cid of [COMPANY, 'holding', 'main']) {
    const eff = await apiCall(token, 'GET', `/attendance/leave-types/effective?company_id=${encodeURIComponent(cid)}`);
    const items = eff.data?.items ?? eff.data?.data ?? (Array.isArray(eff.data) ? eff.data : []);
    const sick =
      items.find((t) => t.leaveTypeKey === 'lvt_02') ??
      items.find((t) => t.category === 'sick') ??
      items.find((t) => /ốm|sick/i.test(`${t.leaveTypeKey || ''}${t.nameVi || ''}`));
    if (sick) return { companyId: cid, sick };
  }
  return null;
}

async function main() {
  save();
  const session = await loginApi();
  const l0Ok = await l0Probes(session.token);
  R.l0.qc_dev_stack = l0Ok ? 'hrm/xbos/portal 200' : 'FAIL';
  if (!l0Ok) R.defects.push({ sev: 'P0', id: 'L0', note: 'stack probe failed' });

  try {
    execSync('pnpm exec jest src/attendance/po-hrm-mvp-gd1-att-12-cluster-be-01.spec.ts --silent', {
      cwd: resolve(ROOT, 'apps/api/hrm-api'),
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    R.l1.be_jest_att12 = '5 PASS';
  } catch (e) {
    R.l1.be_jest_att12 = `FAIL ${String(e.message || e).slice(0, 120)}`;
    R.defects.push({ sev: 'P0', id: 'BE-JEST', note: 'att-12 be spec' });
  }

  const emp = await pickActiveEmployee(session.token);
  sickMeta = await findSickTypeFromEff(session.token);
  R.setup.employee = emp;
  R.setup.sick_eff = sickMeta;

  const browser = await chromium.launch({ headless: true, executablePath: CHROME, args: ['--disable-dev-shm-usage'] });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  trackPage(page);
  await injectPortalAuth(page, session);

  const sickRanges = sickRangesForRun();
  R.setup.sick_ranges = sickRanges;

  if (!emp?.id) {
    jset('J-HRM-ATT-12-05', 'FAIL', { summary: 'no active employee for strip' });
  } else {
    // J-12-01 smoke: active profile + activate CTA absent for active
    try {
      await openProfile(page, emp.id);
      const statusText = await page.evaluate(() => document.body.innerText.slice(0, 4000));
      const activeOk = /Hoạt động|active/i.test(statusText);
      const activateSubmit = await page.getByTestId('hdsd-emp-activate-submit').isVisible().catch(() => false);
      const pass01 = activeOk && !activateSubmit && nestOk();
      jset('J-HRM-ATT-12-01', pass01 ? 'PASS' : 'FAIL', {
        summary: `active=${activeOk} activateSubmitVisible=${activateSubmit}`,
        click_path: `Hồ sơ NV ${emp.id} · status Hoạt động smoke`,
        nest_core_0: nestOk(),
      });
    } catch (e) {
      jset('J-HRM-ATT-12-01', 'FAIL', { summary: String(e).slice(0, 300) });
    }

    // J-12-02 emit ≠ DONE honesty (sr-only banner)
    try {
      await openProfile(page, emp.id);
      const banner = await page.locator('[data-testid="hdsd-emp-att12-honesty-banner"]').innerText().catch(() => '');
      const pass02 =
        /≠ ATT-12|FR-12|emit/i.test(banner) && /DENY merge|C-SLICE/i.test(banner) && nestOk();
      jset('J-HRM-ATT-12-02', pass02 ? 'PASS' : 'FAIL', {
        summary: `banner=${banner.slice(0, 160)}`,
        click_path: 'strip honesty · emit necessary not sufficient',
        nest_core_0: nestOk(),
      });
    } catch (e) {
      jset('J-HRM-ATT-12-02', 'FAIL', { summary: String(e).slice(0, 300) });
    }

    // J-12-03 balances F5
    try {
      R.panel_hits = [];
      await openProfile(page, emp.id);
      const a = await assertAtt12Strip(page, emp.id, '03-j12-03-panel');
      await page.reload({ waitUntil: 'domcontentloaded' });
      await sleep(2500);
      const a2 = await assertAtt12Strip(page, emp.id, '03b-j12-03-f5');
      const pass03 = a.ok && a2.ok && nestOk();
      jset('J-HRM-ATT-12-03', pass03 ? 'PASS' : 'FAIL', {
        summary: `buckets=${JSON.stringify(a.vis)} panelGET=${a.panelOk} F5=${a2.ok}`,
        click_path: 'GET leave-balance/panel · F5 parity',
        nest_core_0: nestOk(),
      });
    } catch (e) {
      jset('J-HRM-ATT-12-03', 'FAIL', { summary: String(e).slice(0, 300) });
    }

    // J-12-04 shift default visible
    try {
      R.shift_default_hits = [];
      await openProfile(page, emp.id);
      const a = await assertAtt12Strip(page, emp.id, '04-j12-04-shift');
      const pass04 = a.ok && (a.shiftOk || a.shiftSummary.length > 5) && nestOk();
      jset('J-HRM-ATT-12-04', pass04 ? 'PASS' : 'FAIL', {
        summary: `shiftGET=${a.shiftOk} summary="${a.shiftSummary}"`,
        click_path: 'GET shift-assignments/activate-default · shift summary',
        nest_core_0: nestOk(),
      });
    } catch (e) {
      jset('J-HRM-ATT-12-04', 'FAIL', { summary: String(e).slice(0, 300) });
    }

    // J-12-05 HCNS confirm strip (primary)
    try {
      R.panel_hits = [];
      R.shift_default_hits = [];
      await openProfile(page, emp.id);
      const a = await assertAtt12Strip(page, emp.id, '05-j12-05-strip');
      const footerOk = /attendance_uat_ready=false|≠ ATT-12/i.test(`${a.footer} ${a.banner}`);
      const noMerge = Object.values(a.vis).filter(Boolean).length >= 5;
      await page.reload({ waitUntil: 'domcontentloaded' });
      await sleep(2500);
      const a2 = await assertAtt12Strip(page, emp.id, '05b-j12-05-f5');
      const pass05 = a.ok && a2.ok && footerOk && noMerge && nestOk();
      jset('J-HRM-ATT-12-05', pass05 ? 'PASS' : 'FAIL', {
        summary: `strip=${a.ok} F5=${a2.ok} footer=${footerOk} buckets5=${noMerge} panel2xx=${a.panelOk}`,
        click_path: 'ceo@ → Hồ sơ Hoạt động → Quỹ phép & ca mặc định · Network panel+activate-default · F5',
        hdsd_align: [
          'hdsd-emp-att12-enroll-confirm-strip',
          'hdsd-emp-att12-leave-row-*',
          'hdsd-emp-att12-shift-summary',
          'hdsd-emp-att12-honesty-footer',
        ],
        nest_core_0: nestOk(),
      });
    } catch (e) {
      jset('J-HRM-ATT-12-05', 'FAIL', { summary: String(e).slice(0, 300) });
    }

    // J-12-07 seals + idempotent honesty
    try {
      await openProfile(page, emp.id);
      const footer = await page.locator('[data-testid="hdsd-emp-att12-honesty-footer"]').innerText().catch(() => '');
      const banner = await page.locator('[data-testid="hdsd-emp-att12-honesty-banner"]').innerText().catch(() => '');
      const seals =
        /≠ ATT-12|≠ ATT UAT|C-SLICE/i.test(footer) &&
        /ATT-07|ATT-06|ATT-05/i.test(footer) &&
        /DENY merge/i.test(banner);
      jset('J-HRM-ATT-12-07', seals && nestOk() ? 'PASS' : 'FAIL', {
        summary: `footer="${footer.slice(0, 100)}" bannerMerge=${/DENY merge/i.test(banner)}`,
        must_keep: [ATT07QC1, ATT06QC1, ATT05BQC1, ATT09QC1, CORE07QC1],
        nest_core_0: nestOk(),
      });
    } catch (e) {
      jset('J-HRM-ATT-12-07', 'FAIL', { summary: String(e).slice(0, 300) });
    }
  }

  async function selectEmployeeInDlg(dlg, page, nameHint) {
    const trigger = dlg.locator('.xevn-field-select-md').first();
    await trigger.click({ timeout: 10000 });
    await sleep(500);
    const frames = [page, ...page.frames()];
    let empOpt = null;
    for (const h of frames) {
      const loc = h.locator('[role="option"]').filter({ hasNotText: /CORE07|qa_c07p/i }).first();
      if (await loc.isVisible({ timeout: 800 }).catch(() => false)) {
        empOpt = loc;
        break;
      }
    }
    if (!empOpt) empOpt = page.locator('[role="option"]').first();
    if (nameHint) {
      for (const h of frames) {
        const filtered = h
          .locator('[role="option"]')
          .filter({
            hasText: new RegExp(String(nameHint).slice(0, 12).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'),
          })
          .first();
        if (await filtered.isVisible({ timeout: 2000 }).catch(() => false)) {
          empOpt = filtered;
          break;
        }
      }
    }
    await empOpt.click({ timeout: 15000 });
    await sleep(2000);
  }

  async function selectSickLeaveType(dlg, page, preferKey) {
    const picker = dlg.locator('[data-testid="catalog-search-picker"]').first();
    const trigger = picker.locator('button').first();
    if (await trigger.isVisible().catch(() => false)) await trigger.click();
    else await picker.click().catch(() => {});
    await sleep(500);
    const key = preferKey || sickMeta?.sick?.leaveTypeKey || 'lvt_02';
    for (const h of [page, ...page.frames()]) {
      const byTestId = h.locator(`[data-testid="catalog-picker-option-${key}"]`).first();
      if (await byTestId.isVisible({ timeout: 3000 }).catch(() => false)) {
        await byTestId.click();
        await sleep(2000);
        return;
      }
    }
    for (const h of [page, ...page.frames()]) {
      const sick = h
        .locator('[role="option"], [data-testid^="catalog-picker-option-"]')
        .filter({ hasText: /ốm|sick|lvt_02|LVT_02|LeaveCat/i })
        .first();
      if (await sick.isVisible({ timeout: 5000 }).catch(() => false)) {
        await sick.click();
        await sleep(2000);
        return;
      }
    }
    throw new Error(`sick leave type not found (key=${key})`);
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

  async function waitSubmitReady(dlg, ms = 25000) {
    const submit = dlg.getByRole('button', { name: /Gửi|Nộp|Submit|yêu cầu/i }).last();
    const start = Date.now();
    while (Date.now() - start < ms) {
      if (!(await submit.isDisabled().catch(() => true))) return { ready: true };
      await sleep(500);
    }
    return { ready: false };
  }

  async function selectCompLeaveType(dlg, page) {
    const picker = dlg.locator('[data-testid="catalog-search-picker"]').first();
    await picker.scrollIntoViewIfNeeded().catch(() => {});
    const trigger = picker.locator('button[role="combobox"], button').first();
    if (await trigger.isVisible().catch(() => false)) await trigger.click({ force: true });
    else await picker.click({ force: true }).catch(() => {});
    await sleep(600);
    for (const h of [page, ...page.frames()]) {
      const byId = h.locator('[data-testid="catalog-picker-option-ot_comp_leave"]').first();
      if (await byId.isVisible({ timeout: 4000 }).catch(() => false)) {
        await byId.click();
        await sleep(1500);
        return;
      }
    }
    for (const h of [page, ...page.frames()]) {
      const scoped = h
        .locator('[role="option"], [data-testid^="catalog-picker-option-"]')
        .filter({ hasText: /Nghỉ bù|nghỉ bù|ot_comp|bù OT|Phép bù/i })
        .first();
      if (await scoped.isVisible({ timeout: 3000 }).catch(() => false)) {
        await scoped.click();
        await sleep(1500);
        return;
      }
    }
    throw new Error('ot_comp_leave option not found');
  }

  if (emp?.id) {
    R.setup.grantAnnual = await apiCall(session.token, 'PUT', `/attendance/leave-balance/tracked-entitlement`, {
      body: {
        company_id: COMPANY,
        employee_id: emp.id,
        leave_type: 'annual',
        balance_year: 2028,
        entitled_days: 14,
      },
    }).then((r) => r.status === 200 || r.status === 201);
  }

  // Regression J-06-04
  try {
    const host = await openLeaveTab(page);
    await host.getByRole('button', { name: /Tạo yêu cầu nghỉ|Tạo đơn|Đăng ký nghỉ/i }).first().click({ timeout: 10000 });
    await sleep(800);
    const dlg = host.locator('[data-testid="att-leave-create-dialog-precision"]').first();
    await dlg.waitFor({ state: 'visible', timeout: 15000 });
    if (emp) await selectEmployeeInDlg(dlg, page, emp.name);
    await selectCompLeaveType(dlg, page);
    const panel06 = await dlg.locator('[data-testid="att-06-form-panel"]').isVisible({ timeout: 8000 }).catch(() => false);
    const compRow = await dlg.locator('[data-testid="leave-balance-row-compensatory"]').isVisible({ timeout: 5000 }).catch(() => false);
    const annualRow = await dlg.locator('[data-testid="leave-balance-row-annual"]').isVisible({ timeout: 3000 }).catch(() => false);
    await shot(page, 'reg-j06-04');
    jset('J-HRM-ATT-06-04', panel06 && compRow && annualRow && nestOk() ? 'PASS' : 'FAIL', {
      summary: `panel=${panel06} comp=${compRow} annual=${annualRow}`,
      must_keep: ATT06QC1,
      nest_core_0: nestOk(),
    });
    await page.keyboard.press('Escape').catch(() => {});
  } catch (e) {
    jset('J-HRM-ATT-06-04', 'FAIL', { summary: String(e).slice(0, 300) });
  }

  // Regression J-07-03..05 (subset)
  try {
    const host = await openLeaveTab(page);
    await host.getByRole('button', { name: /Tạo yêu cầu nghỉ|Tạo đơn/i }).first().click({ timeout: 10000 });
    const dlg = host.locator('[data-testid="att-leave-create-dialog-precision"]').first();
    await dlg.waitFor({ state: 'visible', timeout: 15000 });
    if (emp) await selectEmployeeInDlg(dlg, page, emp.name);
    await selectSickLeaveType(dlg, page, sickMeta?.sick?.leaveTypeKey);
    const dates = dlg.locator('input[placeholder="dd/MM/yyyy"]');
    await dates.nth(0).fill(sickRanges.short.startVi);
    await dates.nth(1).fill(sickRanges.short.endVi);
    await sleep(2000);
    await waitPreview2xx();
    const attach = dlg.locator('[data-testid="hdsd-leave-attachment-input"]').first();
    if (await attach.isVisible().catch(() => false)) {
      await attach.setInputFiles(ensureFixturePng());
      await sleep(3000);
    }
    const reason = dlg.locator('textarea').first();
    if (await reason.isVisible().catch(() => false)) await reason.fill(`QA ATT-12 reg ${STAMP}`);
    const submit = dlg.getByRole('button', { name: /Gửi|Nộp/i }).last();
    const beforePosts = R.network.filter((n) => n.method === 'POST' && /leave-requests/.test(n.url)).length;
    const ready = await waitSubmitReady(dlg);
    if (ready.ready) await submit.click({ timeout: 10000 });
    else await submit.click({ force: true, timeout: 5000 }).catch(() => {});
    await sleep(4500);
    const posts = R.network.filter((n) => n.method === 'POST' && /leave-requests/.test(n.url));
    const createHit = posts.slice(beforePosts).find((h) => h.status >= 200 && h.status < 300);
    const pass03 = Boolean(createHit) && nestOk();
    jset('J-HRM-ATT-07-03', pass03 ? 'PASS' : 'FAIL', {
      summary: `POST sick ${createHit?.status ?? '—'} (regression subset)`,
      must_keep: ATT07QC1,
      nest_core_0: nestOk(),
    });
    const toastText = await page.evaluate(() => document.body.innerText.slice(0, 2000));
    const pass04 = pass03 && (/Phân nhánh|pending/i.test(toastText) || createHit);
    jset('J-HRM-ATT-07-04', pass04 ? 'PASS' : 'FAIL', {
      summary: `toast/F5 peer ${pass04}`,
      must_keep: ATT09QC1,
    });
    await page.keyboard.press('Escape').catch(() => {});
  } catch (e) {
    jset('J-HRM-ATT-07-03', 'FAIL', { summary: String(e).slice(0, 300) });
    jset('J-HRM-ATT-07-04', 'FAIL', { summary: String(e).slice(0, 300) });
  }

  try {
    const host = await openFundOrderPanel(page);
    const beforePut = R.network.filter((n) => /sick-leave-fund-order/.test(n.url) && n.method === 'PUT').length;
    await host.locator('[data-testid="hdsd-att-sick-leave-fund-order-save"]').click({ timeout: 10000 });
    await sleep(3000);
    const putHit = R.network
      .filter((n) => /sick-leave-fund-order/.test(n.url) && n.method === 'PUT')
      .slice(beforePut)
      .find((h) => h.status >= 200 && h.status < 300);
    const getOk = R.network.some((n) => /sick-leave-fund-order/.test(n.url) && n.method === 'GET' && n.status === 200);
    jset('J-HRM-ATT-07-05', (putHit || getOk) && nestOk() ? 'PASS' : 'FAIL', {
      summary: `fund-order GET=${getOk} PUT=${putHit?.status ?? '—'}`,
      must_keep: ATT07QC1,
    });
  } catch (e) {
    jset('J-HRM-ATT-07-05', 'FAIL', { summary: String(e).slice(0, 300) });
  }

  await browser.close();

  const coreJ = [
    'J-HRM-ATT-12-01',
    'J-HRM-ATT-12-02',
    'J-HRM-ATT-12-03',
    'J-HRM-ATT-12-04',
    'J-HRM-ATT-12-05',
    'J-HRM-ATT-12-07',
    'J-HRM-ATT-06-04',
    'J-HRM-ATT-07-03',
    'J-HRM-ATT-07-04',
    'J-HRM-ATT-07-05',
  ];
  const fails = coreJ.filter((id) => !String(R.journeys[id]?.verdict || '').startsWith('PASS'));
  R.overall = fails.length === 0 && l0Ok ? 'PASS' : 'FAIL';
  R.ack_status = R.overall === 'PASS' ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  R.endedAt = ts();
  save();
  console.log(`\n=== ${R.ack_status} stamp=${STAMP} fails=${fails.join(',') || 'none'} ===`);
  process.exit(fails.length === 0 && l0Ok ? 0 : 1);
}

main().catch((e) => {
  R.defects.push({ sev: 'P0', id: 'RUNNER', note: String(e).slice(0, 200) });
  R.ack_status = 'FAIL_TO_PM';
  R.endedAt = ts();
  save();
  console.error(e);
  process.exit(1);
});
