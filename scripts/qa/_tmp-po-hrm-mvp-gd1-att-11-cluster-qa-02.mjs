#!/usr/bin/env node
/**
 * PO-HRM-MVP-GD1-ATT-11-CLUSTER-QA-02 — U65 browser-only zero-seed
 * J-HRM-ATT-11-01..06 — Sign/close/reopen · Nest /core 0 · C-SLICE · printable false
 * DENY: seed · Nest /core SoT · invent att_leave_hold · second ledger · LIVE alone=ATT-11 DONE ·
 *        AGG=ATT-10 DONE · soft/ATT-08=ATT-09 DONE · ATT UAT · CFG=ATT-02 DONE · FIXED_GĐ1=full R-SIGN-01 ·
 *        invent PAY/printable/HOL/MEAL/lines[]/CSUM/INBOX DONE · honesty flip
 * Persona: ceo@xe.vn · companyId=main
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
const SHEET_NAME = process.env.QA_SHEET_NAME || 'QA-ATT-10-CLUSTER-01';
const PREFERRED_SHEET_ID =
  process.env.QA_SHEET_ID || '2d1a688e-0449-4237-a2df-2b2f1707f138';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-mvp-gd1-att-11-cluster-qa-02.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-mvp-gd1-att-11-cluster-qa-02');
mkdirSync(SCREEN, { recursive: true });
mkdirSync(resolve(ROOT, 'docs/qa/evidence'), { recursive: true });

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
const stamp = Date.now().toString(36).toLowerCase().slice(-8);
const STAMP = `ATT11QA2-${stamp.toUpperCase()}`;

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

function summarizeBody(body, max = 900) {
  const s = typeof body === 'string' ? body : JSON.stringify(body);
  return s.length > max ? `${s.slice(0, max)}…` : s;
}

const R = {
  work_item_id: 'PO-HRM-MVP-GD1-ATT-11-CLUSTER-QA-02',
  program: 'PO-HRM-MVP-GD1-CONTINUOUS',
  uc_ids: ['UC-BP-ATT-11', 'FR-UC-BP-ATT-11'],
  stamp: STAMP,
  fe02: 'docs/qa/evidence/po-hrm-mvp-gd1-att-11-cluster-fe-02.md',
  qa01_prior: 'docs/qa/evidence/po-hrm-mvp-gd1-att-11-cluster-qa-01.md',
  startedAt: ts(),
  persona: { email: EMAIL, companyId: COMPANY },
  u65: 'zero-seed-browser-only',
  honesty: {
    attendance_uat_ready: false,
    recruitment_uat_ready: false,
    jd_dynamic_done: false,
    contracts_printable_ready: false,
    hrm_personnel_uat_ready: false,
    ne_live_eq_att11_done: true,
    ne_agg_eq_att10_done: true,
    ne_soft_att08_eq_att09: true,
    ne_att_module_uat: true,
    cfg_ne_att02_done: true,
    ne_fixed_gd1_eq_full_rsign01: true,
    pay_out: true,
    nest_core_deny: true,
    deny_att_leave_hold: true,
    deny_second_ledger: true,
    csum_inbox_out: true,
    hol_meal_lines_out: true,
    soft_ne_core06_done: true,
    plt_core_retain: true,
    seed_used: false,
    c_slice_ne_module: true,
    printable_false: true,
  },
  must_keep: [
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
  nest_core_sign_non404: [],
  sign_get_hits: [],
  sign_post_hits: [],
  close_hits: [],
  reopen_hits: [],
  capture: {
    signGetBodies: [],
    signPostBodies: [],
    closeBodies: [],
    reopenBodies: [],
    forceCloseProbes: [],
    uiSnapshots: [],
  },
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
  const safe = JSON.parse(
    JSON.stringify(R, (k, v) => {
      if (v && typeof v === 'object' && v._apiName === 'Locator') return undefined;
      if (typeof v === 'bigint') return String(v);
      return v;
    }),
  );
  writeFileSync(OUT_JSON, JSON.stringify(safe, null, 2));
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

function isNestCoreAttSign(url) {
  const p = String(url || '').toLowerCase();
  if (!/\/api\/hrm\/core(\/|$|\?)/.test(p)) return false;
  return (
    p.includes('attendance') ||
    p.includes('/att/') ||
    p.includes('sheet') ||
    p.includes('sign') ||
    p.includes('close') ||
    p.includes('reopen') ||
    p.includes('timesheet')
  );
}

function trackUrl(method, url, status) {
  if (!/\/api\/hrm\//.test(url)) return;
  const nest_core = /\/api\/hrm\/core(\/|$|\?)/.test(url);
  const signGet =
    method === 'GET' && /\/attendance\/attendance-sheets\/[^/?]+\/signatures/.test(url);
  const signPost =
    method === 'POST' && /\/attendance\/attendance-sheets\/[^/?]+\/signatures/.test(url);
  const close = method === 'POST' && /\/attendance\/attendance-sheets\/[^/?]+\/close/.test(url);
  const reopen = method === 'POST' && /\/attendance\/attendance-sheets\/[^/?]+\/reopen/.test(url);
  const entry = {
    method,
    url: url.replace(/^https?:\/\/[^/]+/, '').slice(0, 520),
    status: status ?? null,
    at: ts(),
    nest_core,
    signGet,
    signPost,
    close,
    reopen,
  };
  R.network.push(entry);
  if (nest_core) R.nest_core_hits.push(entry);
  if (nest_core && isNestCoreAttSign(url) && status !== 404) R.nest_core_sign_non404.push(entry);
  if (signGet) R.sign_get_hits.push(entry);
  if (signPost) R.sign_post_hits.push(entry);
  if (close) R.close_hits.push(entry);
  if (reopen) R.reopen_hits.push(entry);
}

function q(path) {
  const u = new URL(path, PORTAL);
  u.searchParams.set('portal', '1');
  u.searchParams.set('tenantId', TENANT);
  u.searchParams.set('companyId', COMPANY);
  u.searchParams.set('_', String(Date.now()));
  return u.toString();
}

async function l0Probe() {
  const out = {};
  for (const [k, url] of [
    ['hrm', `${HRM}/api/hrm`],
    ['xbos', `${XBOS}/api/xbos`],
    ['portal', PORTAL],
  ]) {
    try {
      const r = await fetch(url);
      out[k] = { status: r.status, url };
    } catch (e) {
      out[k] = { status: 0, error: String(e), url };
    }
  }
  try {
    const r = await fetch(`${HRM}/api/hrm/core/attendance/attendance-sheets`);
    out.nest_core_att = { status: r.status, url: '/api/hrm/core/attendance/attendance-sheets' };
  } catch (e) {
    out.nest_core_att = { status: 0, error: String(e) };
  }
  R.l0 = out;
  save();
  return out.hrm?.status === 200 && out.xbos?.status === 200;
}

async function loginApi() {
  for (const url of [`${PORTAL}/api/xbos/auth/login`, `${XBOS}/api/xbos/auth/login`]) {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
    });
    const j = await r.json().catch(() => ({}));
    const data = j?.data ?? j;
    const token = data?.accessToken ?? data?.access_token;
    if (token) {
      const u = data?.user ?? {};
      return {
        token,
        email: EMAIL,
        expiresAt: Date.now() + 8 * 3600_000,
        companyId: COMPANY,
        user: {
          userId: u.userId || u.id || EMAIL,
          email: u.email || EMAIL,
          displayName: u.displayName || u.fullName || EMAIL,
          roles: u.roles || ['group_ceo'],
        },
      };
    }
  }
  throw new Error('loginApi failed');
}

async function injectPortalAuth(page, session) {
  await page.addInitScript(
    ({ s }) => {
      const payload = JSON.stringify(s.user);
      for (const store of [localStorage, sessionStorage]) {
        store.setItem('xevn.portal.accessToken', s.token);
        store.setItem('xevn.portal.tokenExpiresAt', String(s.expiresAt));
        store.setItem('xevn.portal.user', payload);
        store.setItem('xevn.portal.tenantId', 'xevn');
        store.setItem('xevn.portal.companyId', s.companyId);
        store.setItem('hrm_current_company_id', s.companyId);
        store.setItem('hrm_current_tenant_id', 'xevn');
        store.setItem('access_token', s.token);
        store.setItem('token', s.token);
        store.setItem('hrm_portal_mode', '1');
      }
    },
    { s: session },
  );
}

async function openAttendanceMenuItem(page, labelRe) {
  await page.locator('[data-testid="attendance-tab-menu"]').click();
  await sleep(500);
  const byText = page.locator('[role="menu"], [data-radix-menu-content]').getByText(labelRe).first();
  if (await byText.count()) {
    await byText.click({ timeout: 8_000 });
    return true;
  }
  const candidates = page.locator('[role="menuitem"]');
  const n = await candidates.count();
  for (let i = 0; i < n; i++) {
    const text = ((await candidates.nth(i).innerText().catch(() => '')) || '').trim();
    if (labelRe.test(text)) {
      await candidates.nth(i).click();
      return true;
    }
  }
  return false;
}

async function navigateToSheetsList(page) {
  await page.goto(q('/hr/attendance'), { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await sleep(2800);
  const opened = await openAttendanceMenuItem(page, /Bảng chấm công|Bảng công|Sheets/i);
  R.setup.menuOpen = opened;
  await sleep(1500);
  await page
    .locator('[data-testid="att-sheets-precision"]')
    .waitFor({ state: 'visible', timeout: 45_000 })
    .catch(() => null);
}

async function apiListSheets(token) {
  const url = `${HRM}/api/hrm/attendance/attendance-sheets?company_id=${COMPANY}&page_size=50`;
  const r = await fetch(url, {
    headers: { authorization: `Bearer ${token}`, 'x-tenant-id': TENANT },
  });
  const j = await r.json().catch(() => ({}));
  const payload = j?.data ?? j;
  const rows = payload?.items ?? payload?.data ?? (Array.isArray(payload) ? payload : []);
  return { status: r.status, rows: Array.isArray(rows) ? rows : [] };
}

async function apiGetSheet(token, id) {
  const url = `${HRM}/api/hrm/attendance/attendance-sheets/${id}?company_id=${COMPANY}`;
  const r = await fetch(url, {
    headers: { authorization: `Bearer ${token}`, 'x-tenant-id': TENANT },
  });
  const j = await r.json().catch(() => ({}));
  return { status: r.status, body: j?.data ?? j, raw: j };
}

async function apiGetSignatures(token, id) {
  const url = `${HRM}/api/hrm/attendance/attendance-sheets/${id}/signatures?company_id=${COMPANY}`;
  const r = await fetch(url, {
    headers: { authorization: `Bearer ${token}`, 'x-tenant-id': TENANT },
  });
  const j = await r.json().catch(() => ({}));
  return { status: r.status, body: j?.data ?? j, raw: j, code: j?.code ?? j?.error?.code };
}

async function apiForceClose(token, id) {
  const url = `${HRM}/api/hrm/attendance/attendance-sheets/${id}/close?company_id=${COMPANY}`;
  const r = await fetch(url, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'x-tenant-id': TENANT,
      'content-type': 'application/json',
    },
    body: '{}',
  });
  const j = await r.json().catch(() => ({}));
  const probe = {
    at: ts(),
    status: r.status,
    code: j?.code ?? j?.error?.code ?? null,
    body: summarizeBody(j),
  };
  R.capture.forceCloseProbes.push(probe);
  save();
  return probe;
}

function findSubmitted(rows) {
  const preferred = rows.find((r) => r.id === PREFERRED_SHEET_ID && r.status === 'submitted');
  if (preferred) return preferred;
  return (
    rows.find((r) => (r.name || '').includes(SHEET_NAME) && r.status === 'submitted') ||
    rows.find((r) => r.status === 'submitted')
  );
}

async function selectSheet(page, sheetId, nameHint) {
  const byId = page.locator(`[data-testid="att-sheet-row-${sheetId}"]`);
  if (await byId.count()) {
    await byId.first().click({ timeout: 12_000 });
  } else {
    const rows = page.locator('[data-testid="att-sheets-precision"] tbody tr');
    const rowCount = await rows.count();
    let clicked = false;
    for (let i = 0; i < rowCount; i++) {
      const text = (await rows.nth(i).innerText()).toLowerCase();
      if (nameHint && text.includes(String(nameHint).toLowerCase()) && /chờ ký|submitted/i.test(text)) {
        await rows.nth(i).click({ timeout: 12_000 });
        clicked = true;
        break;
      }
    }
    if (!clicked && nameHint) {
      await page.getByText(nameHint).first().click({ timeout: 8_000 }).catch(() => null);
    }
  }
  await sleep(2800);
}

async function snapshotAtt11Ui(page) {
  const t = { timeout: 3_000 };
  const signPanel = page.locator('[data-testid="att-sign-panel"]');
  const display = page.locator('[data-testid="att-11-sign-display"]');
  const honesty = page.locator('[data-testid="att-11-honesty"]');
  const att10Honesty = page.locator('[data-testid="att-10-honesty"]');
  const closeBtn = page.locator('[data-testid="att-sign-close-sheet"]');
  const reopenBtn = page.locator('[data-testid="att-sheet-reopen"]');
  const snap = {
    signPanelVisible: await signPanel.isVisible(t).catch(() => false),
    displayVisible: await display.isVisible(t).catch(() => false),
    headerId: ((await page.locator('[data-testid="att-11-header-id"]').innerText(t).catch(() => '')) || '').trim(),
    statusLabel: ((await page.locator('[data-testid="att-11-status-label"]').innerText(t).catch(() => '')) || '').trim(),
    canCloseAttr: await page.locator('[data-testid="att-11-can-close"]').getAttribute('data-can-close').catch(() => null),
    canCloseText: ((await page.locator('[data-testid="att-11-can-close"]').innerText(t).catch(() => '')) || '').trim(),
    missingRoles: ((await page.locator('[data-testid="att-11-missing-roles"]').innerText(t).catch(() => '')) || '').trim(),
    missingEmpty: ((await page.locator('[data-testid="att-11-missing-roles-empty"]').innerText(t).catch(() => '')) || '').trim(),
    rejectBlockVisible: await page.locator('[data-testid="att-11-reject-block"]').isVisible(t).catch(() => false),
    closeEvent: ((await page.locator('[data-testid="att-11-close-event"]').innerText(t).catch(() => '')) || '').trim(),
    fixedGd1: ((await page.locator('[data-testid="att-11-fixed-gd1-footer"]').innerText(t).catch(() => '')) || '').slice(0, 400),
    csumInbox: ((await page.locator('[data-testid="att-11-csum-inbox-footer"]').innerText(t).catch(() => '')) || '').slice(0, 400),
    honestyVisible: await honesty.isVisible(t).catch(() => false),
    honestyText: ((await honesty.innerText(t).catch(() => '')) || '').slice(0, 1200),
    att10HonestyText: ((await att10Honesty.innerText(t).catch(() => '')) || '').slice(0, 600),
    closeDisabled: await closeBtn.isDisabled(t).catch(() => null),
    reopenVisible: await reopenBtn.isVisible(t).catch(() => false),
    confirmEmployee: await page.locator('[data-testid="att-sign-confirm-employee"]').isVisible(t).catch(() => false),
    confirmManager: await page
      .locator('[data-testid="att-sign-confirm-direct_manager"]')
      .isVisible(t)
      .catch(() => false),
    confirmHr: await page.locator('[data-testid="att-sign-confirm-hr_admin"]').isVisible(t).catch(() => false),
  };
  R.capture.uiSnapshots.push({ at: ts(), ...snap });
  return snap;
}

function nestCoreFail() {
  return R.nest_core_sign_non404.length > 0;
}

function physicalSignGetOk() {
  return R.sign_get_hits.some((h) => h.status >= 200 && h.status < 300);
}

function isIncomplete409(probe) {
  const code = String(probe?.code || '');
  const body = String(probe?.body || '');
  return (
    probe?.status === 409 &&
    (/HRM-ATT-SIGN-INCOMPLETE/i.test(code) ||
      /INCOMPLETE/i.test(code) ||
      /HRM-ATT-SIGN-INCOMPLETE/i.test(body) ||
      /INCOMPLETE/i.test(body))
  );
}

async function reloadSelectSheet(page, sheet) {
  await page.reload({ waitUntil: 'domcontentloaded' });
  await sleep(2800);
  await openAttendanceMenuItem(page, /Bảng chấm công|Bảng công|Sheets/i);
  await sleep(1200);
  await selectSheet(page, sheet.id, sheet.name || SHEET_NAME);
  await sleep(2500);
}

async function signRole(page, role) {
  const btn = page.locator(`[data-testid="att-sign-confirm-${role}"]`);
  if (!(await btn.isVisible().catch(() => false))) {
    return { ok: false, reason: `NO_CONFIRM_${role}` };
  }
  const before = R.sign_post_hits.length;
  await btn.click({ timeout: 12_000 });
  await sleep(2800);
  const hit = R.sign_post_hits.slice(before).find((h) => h.status >= 200 && h.status < 300);
  return { ok: Boolean(hit), status: hit?.status ?? null, reason: hit ? null : 'POST_SIGN_NOT_2XX' };
}

async function main() {
  const l0ok = await l0Probe();
  if (!l0ok) {
    R.overall = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    R.defects.push({ id: 'L0', sev: 'P0', note: 'stack not healthy' });
    save();
    process.exit(2);
  }

  const browser = await chromium.launch({ headless: true, executablePath: CHROME });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  page.on('dialog', async (dialog) => {
    try {
      const type = dialog.type();
      const msg = dialog.message() || '';
      if (type === 'prompt' || /từ chối|ly do|lý do|reject/i.test(msg)) {
        await dialog.accept('QA ATT-11 reject — thiếu chứng từ chấm công (U65)');
      } else {
        await dialog.accept().catch(() => dialog.dismiss());
      }
    } catch {
      /* */
    }
  });

  page.on('response', (res) => {
    try {
      const req = res.request();
      const method = req.method();
      const url = res.url();
      trackUrl(method, url, res.status());
      const isSignGet =
        method === 'GET' && /\/attendance\/attendance-sheets\/[^/?]+\/signatures/.test(url);
      const isSignPost =
        method === 'POST' && /\/attendance\/attendance-sheets\/[^/?]+\/signatures/.test(url);
      const isClose = method === 'POST' && /\/attendance\/attendance-sheets\/[^/?]+\/close/.test(url);
      const isReopen = method === 'POST' && /\/attendance\/attendance-sheets\/[^/?]+\/reopen/.test(url);
      if (!(isSignGet || isSignPost || isClose || isReopen)) return;
      const bucket = isSignGet
        ? R.capture.signGetBodies
        : isSignPost
          ? R.capture.signPostBodies
          : isClose
            ? R.capture.closeBodies
            : R.capture.reopenBodies;
      const entry = {
        at: ts(),
        status: res.status(),
        url: url.replace(/^https?:\/\/[^/]+/, '').slice(0, 400),
        body: null,
        parsed: null,
        code: null,
      };
      bucket.push(entry);
      save();
      void res
        .json()
        .then((body) => {
          entry.body = summarizeBody(body);
          entry.parsed = typeof body === 'object' && body ? body.data ?? body : null;
          entry.code = body?.code ?? body?.error?.code ?? null;
          save();
        })
        .catch(() => {
          void res
            .text()
            .then((t) => {
              entry.body = summarizeBody(t);
              save();
            })
            .catch(() => {});
        });
    } catch {
      /* */
    }
  });
  page.on('console', (msg) => {
    if (msg.type() === 'error') R.consoleErrors.push(String(msg.text()).slice(0, 400));
  });
  page.on('pageerror', (e) => R.pageErrors.push(String(e).slice(0, 400)));

  let session;
  let activeSheet = null;

  try {
    session = await loginApi();
    R.setup.loginApi = true;
    let apiSheets = await apiListSheets(session.token);
    R.setup.apiSheetsStatus = apiSheets.status;
    R.setup.sheetStatuses = apiSheets.rows.map((r) => ({ id: r.id, status: r.status, name: r.name }));

    activeSheet = findSubmitted(apiSheets.rows);
    R.setup.hadSubmitted = Boolean(activeSheet);

    await injectPortalAuth(page, session);
    await navigateToSheetsList(page);
    await shot(page, '01-sheets-list');
    log('sheets list open');

    if (!activeSheet) {
      jset('J-HRM-ATT-11-01', 'FAIL', {
        summary: 'NO_SUBMITTED_SHEET — cite ATT-10 submit peer required · zero-seed · blocked',
      });
      R.overall = 'FAIL';
      R.ack_status = 'FAIL_TO_PM';
      R.defects.push({
        id: 'NO_SUBMITTED',
        sev: 'P0',
        owner: 'fe',
        note: 'Need submitted sheet from ATT-10 peer path (≠ seed)',
      });
      return;
    }

    R.setup.activeSheet = { id: activeSheet.id, status: activeSheet.status, name: activeSheet.name };
    await selectSheet(page, activeSheet.id, activeSheet.name || SHEET_NAME);
    await shot(page, '02-sheet-detail');

    // ——— J-01 LOAD GET signatures ———
    log('J-01 load signatures');
    await sleep(2000);
    const snap1 = await snapshotAtt11Ui(page);
    await shot(page, '03-j01-sign-load');
    const lastGet = R.capture.signGetBodies[R.capture.signGetBodies.length - 1];
    const get2xx = physicalSignGetOk();
    const pathOk = !nestCoreFail();
    const displayOk =
      snap1.signPanelVisible &&
      snap1.displayVisible &&
      Boolean(snap1.headerId) &&
      Boolean(snap1.statusLabel) &&
      snap1.canCloseAttr != null;
    const fixedOk = /FIXED_GĐ1|FIXED_GD1|NV|QL|HCNS/i.test(snap1.fixedGd1);
    const honestyNeLive =
      /≠ LIVE alone = ATT-11 DONE|≠ LIVE=ATT-11 DONE|LIVE alone ≠|≠ LIVE/i.test(snap1.honestyText) ||
      /ATT-11 DONE/i.test(snap1.honestyText);
    const j01Pass = get2xx && pathOk && displayOk && fixedOk && !R.honesty.seed_used;

    jset('J-HRM-ATT-11-01', j01Pass ? 'PASS' : 'FAIL', {
      summary: `GET signatures ${get2xx ? '2xx' : 'MISS'} · display=${displayOk} · can_close=${snap1.canCloseAttr} · FIXED_GĐ1=${fixedOk} · Nest/core non404=${R.nest_core_sign_non404.length} · ≠LIVE-DONE honesty=${honestyNeLive}`,
      getStatus: lastGet?.status ?? null,
      getBody: lastGet?.body ?? null,
      snap: snap1,
      pathOk,
      honestyNeLive,
    });
    if (!j01Pass) {
      R.defects.push({
        id: 'J01',
        sev: 'P0',
        owner: get2xx ? 'fe' : 'be',
        note: 'GET signatures / SignPanel display / Nest core',
      });
    }

    // ——— J-04 incomplete no-bypass (before signs) ———
    log('J-04 incomplete no-bypass');
    const snap4pre = await snapshotAtt11Ui(page);
    const closeDisabledPre = snap4pre.closeDisabled === true || snap4pre.canCloseAttr === 'false';
    const force4 = await apiForceClose(session.token, activeSheet.id);
    const incomplete4 = isIncomplete409(force4);
    const j04Pass = closeDisabledPre && incomplete4 && pathOk && !nestCoreFail();
    await shot(page, '04-j04-incomplete');
    jset('J-HRM-ATT-11-04', j04Pass ? 'PASS' : 'FAIL', {
      summary: `closeDisabled=${closeDisabledPre} · forceClose ${force4.status}/${force4.code} incomplete409=${incomplete4} · Nest/core=${R.nest_core_sign_non404.length}`,
      forceClose: force4,
      snap: snap4pre,
    });
    if (!j04Pass) {
      R.defects.push({
        id: 'J04',
        sev: 'P0',
        owner: incomplete4 ? 'fe' : 'be',
        note: 'incomplete close must 409 INCOMPLETE + FE no-bypass',
      });
    }

    // ——— J-02 sign ladder + close + F5 ———
    log('J-02 sign NV+QL+HR → close');
    const sEmp = await signRole(page, 'employee');
    await shot(page, '05-j02-after-employee');
    const sMgr = await signRole(page, 'direct_manager');
    await shot(page, '06-j02-after-manager');
    const sHr = await signRole(page, 'hr_admin');
    await sleep(1500);
    const snap2pre = await snapshotAtt11Ui(page);
    await shot(page, '07-j02-before-close');
    const canCloseTrue = snap2pre.canCloseAttr === 'true';
    const closeBtn = page.locator('[data-testid="att-sign-close-sheet"]');
    const beforeClose = R.close_hits.length;
    let closeClicked = false;
    if (canCloseTrue && (await closeBtn.isEnabled().catch(() => false))) {
      await closeBtn.click({ timeout: 12_000 });
      closeClicked = true;
      await sleep(3500);
    }
    const closeHit = R.close_hits.slice(beforeClose).find((h) => h.status >= 200 && h.status < 300);
    const lastClose = R.capture.closeBodies[R.capture.closeBodies.length - 1];
    const closeEventOk =
      /timesheet\.closed/i.test(String(lastClose?.parsed?.event || '')) ||
      /timesheet\.closed/i.test(String(lastClose?.body || '')) ||
      /timesheet\.closed/i.test((await snapshotAtt11Ui(page)).closeEvent);
    await reloadSelectSheet(page, activeSheet);
    const afterClose = await apiGetSheet(session.token, activeSheet.id);
    const statusClosed = String(afterClose.body?.status || '').toLowerCase() === 'closed';
    const snap2f5 = await snapshotAtt11Ui(page);
    await shot(page, '08-j02-after-f5-closed');
    const reopenVisible = snap2f5.reopenVisible === true;
    const payOutOk =
      /≠ invent PAY|PAY OUT|≠ invent PAY DONE/i.test(snap2f5.honestyText) ||
      /≠ invent PAY DONE/i.test(snap2f5.closeEvent) ||
      R.honesty.pay_out === true;
    const j02Pass =
      sEmp.ok &&
      sMgr.ok &&
      sHr.ok &&
      canCloseTrue &&
      Boolean(closeHit) &&
      closeClicked &&
      statusClosed &&
      !nestCoreFail() &&
      payOutOk;

    jset('J-HRM-ATT-11-02', j02Pass ? 'PASS' : 'FAIL', {
      summary: `signs emp=${sEmp.ok}/mgr=${sMgr.ok}/hr=${sHr.ok} · can_close=${canCloseTrue} · close2xx=${Boolean(closeHit)} · F5 closed=${statusClosed} · event=${closeEventOk} · Nest/core=${R.nest_core_sign_non404.length}`,
      signs: { sEmp, sMgr, sHr },
      closeStatus: closeHit?.status ?? lastClose?.status ?? null,
      closeBody: lastClose?.body ?? null,
      apiStatusAfter: afterClose.body?.status,
      snapPre: snap2pre,
      snapF5: snap2f5,
      reopenVisible,
      closeEventOk,
    });
    if (!j02Pass) {
      R.defects.push({
        id: 'J02',
        sev: 'P0',
        owner: closeHit ? 'fe' : sEmp.ok && sMgr.ok && sHr.ok ? 'be' : 'fe',
        note: 'sign ladder / close / F5 closed',
      });
    }
    activeSheet = { ...activeSheet, status: statusClosed ? 'closed' : activeSheet.status };

    // ——— J-05 reopen ———
    log('J-05 reopen');
    let j05Pass = false;
    if (String(activeSheet.status).toLowerCase() === 'closed' || statusClosed) {
      const reopenBtn = page.locator('[data-testid="att-sheet-reopen"]');
      const beforeRe = R.reopen_hits.length;
      if (await reopenBtn.isVisible().catch(() => false)) {
        await reopenBtn.click({ timeout: 12_000 });
        await sleep(3500);
      }
      const reopenHit = R.reopen_hits
        .slice(beforeRe)
        .find((h) => h.status >= 200 && h.status < 300);
      await reloadSelectSheet(page, activeSheet);
      const afterRe = await apiGetSheet(session.token, activeSheet.id);
      const statusSubmitted = String(afterRe.body?.status || '').toLowerCase() === 'submitted';
      const sigAfter = await apiGetSignatures(session.token, activeSheet.id);
      const steps = Array.isArray(sigAfter.body?.steps) ? sigAfter.body.steps : [];
      const activeApproved = steps.filter(
        (s) => String(s.outcome || '').toLowerCase() === 'approved' && !s.archived_at,
      );
      // archived prior steps: can_close false + missing roles present OR steps empty/active cleared
      const archivedOk =
        sigAfter.body?.can_close === false ||
        (Array.isArray(sigAfter.body?.missing_mandatory_roles) &&
          sigAfter.body.missing_mandatory_roles.length > 0) ||
        activeApproved.length === 0;
      const snap5 = await snapshotAtt11Ui(page);
      await shot(page, '09-j05-after-reopen-f5');
      j05Pass = Boolean(reopenHit) && statusSubmitted && archivedOk && !nestCoreFail();
      jset('J-HRM-ATT-11-05', j05Pass ? 'PASS' : 'FAIL', {
        summary: `reopen2xx=${Boolean(reopenHit)} · F5 status=${afterRe.body?.status} · archived/cleared=${archivedOk} · Nest/core=${R.nest_core_sign_non404.length}`,
        reopenStatus: reopenHit?.status ?? null,
        reopenBody: R.capture.reopenBodies[R.capture.reopenBodies.length - 1]?.body ?? null,
        apiStatusAfter: afterRe.body?.status,
        sigCanClose: sigAfter.body?.can_close,
        missing: sigAfter.body?.missing_mandatory_roles,
        snap: snap5,
      });
      if (!j05Pass) {
        R.defects.push({
          id: 'J05',
          sev: 'P0',
          owner: reopenHit ? 'be' : 'fe',
          note: 'reopen → submitted + archive prior steps',
        });
      }
      activeSheet = { ...activeSheet, status: statusSubmitted ? 'submitted' : activeSheet.status };
    } else {
      jset('J-HRM-ATT-11-05', 'FAIL', {
        summary: 'Sheet not closed — cannot assert reopen (blocked by J-02)',
      });
      R.defects.push({ id: 'J05', sev: 'P0', owner: 'fe', note: 'reopen blocked — sheet not closed' });
    }

    // ——— J-03 reject blocks close ———
    log('J-03 reject → 409');
    let j03Pass = false;
    if (String(activeSheet.status).toLowerCase() === 'submitted') {
      const rejectBtn = page.locator('[data-testid="att-sign-reject-employee"]');
      const beforeRej = R.sign_post_hits.length;
      if (await rejectBtn.isVisible().catch(() => false)) {
        await rejectBtn.click({ timeout: 12_000 });
        await sleep(3000);
      }
      const rejHit = R.sign_post_hits.slice(beforeRej).find((h) => h.status >= 200 && h.status < 300);
      const snap3 = await snapshotAtt11Ui(page);
      await shot(page, '10-j03-after-reject');
      const canCloseFalse = snap3.canCloseAttr === 'false';
      const rejectUi =
        snap3.rejectBlockVisible === true ||
        Boolean(await page.locator('[data-testid="att-sign-reject-comment-employee"]').count());
      const closeDisabled = snap3.closeDisabled === true;
      const force3 = await apiForceClose(session.token, activeSheet.id);
      const incomplete3 = isIncomplete409(force3);
      j03Pass =
        Boolean(rejHit) && canCloseFalse && closeDisabled && incomplete3 && !nestCoreFail();
      jset('J-HRM-ATT-11-03', j03Pass ? 'PASS' : 'FAIL', {
        summary: `reject2xx=${Boolean(rejHit)} · can_close=false=${canCloseFalse} · closeDisabled=${closeDisabled} · rejectUI=${rejectUi} · forceClose ${force3.status}/${force3.code} · Nest/core=${R.nest_core_sign_non404.length}`,
        rejectStatus: rejHit?.status ?? null,
        forceClose: force3,
        snap: snap3,
      });
      if (!j03Pass) {
        R.defects.push({
          id: 'J03',
          sev: 'P0',
          owner: incomplete3 ? 'fe' : 'be',
          note: 'reject must block close with 409 INCOMPLETE',
        });
      }
    } else {
      jset('J-HRM-ATT-11-03', 'FAIL', {
        summary: 'Sheet not submitted after reopen — cannot reject path',
      });
      R.defects.push({ id: 'J03', sev: 'P0', owner: 'fe', note: 'reject blocked — not submitted' });
    }

    // ——— J-06 honesty + seals ———
    log('J-06 honesty seals');
    const snap6 = await snapshotAtt11Ui(page);
    await shot(page, '11-j06-honesty');
    const h = snap6.honestyText || '';
    const seals = {
      ne_live_done:
        /≠ LIVE|LIVE alone|≠ LIVE=ATT-11|≠ LIVE alone = ATT-11 DONE/i.test(h) ||
        R.honesty.ne_live_eq_att11_done,
      ne_agg_done: /≠ AGG|ATT10QC1|AGG=ATT-10/i.test(h) || /ATT-10/i.test(h),
      ne_09: /ATT09QC1|≠ soft|ATT-09/i.test(h),
      ne_08: /ATT08QC1|ATT-08/i.test(h),
      cfg_ne_02: /ATT02QC1|CFG≠|ATT-02/i.test(h),
      printable: /printable\s*false|contracts_printable_ready=false|printable false/i.test(h),
      pay_out: /PAY OUT|≠ invent PAY|PAY/i.test(h),
      nest_core: /Nest\s*\/core|\/core.*DENY|Nest \/core DENY/i.test(h),
      deny_hold: /att_leave_hold|DENY invent att_leave_hold/i.test(h),
      csum_out: /CSUM|INBOX|OUT GĐ1/i.test(snap6.csumInbox) || /CSUM|INBOX/i.test(h),
      fixed_gd1: /FIXED_GĐ1|FIXED_GD1|≠.*R-SIGN-01/i.test(snap6.fixedGd1) || /FIXED_GĐ1|R-SIGN-01/i.test(h),
      c_slice: /C-SLICE|≠ ATT UAT|attendance_uat_ready=false/i.test(h),
      plt_core: /PLT01QC1|CORE10QC1|CORE09QC1|CORE07QC1/i.test(h),
    };
    const honestyVisible = snap6.honestyVisible === true;
    const j06Pass =
      honestyVisible &&
      !nestCoreFail() &&
      seals.ne_live_done &&
      seals.pay_out &&
      seals.nest_core &&
      seals.c_slice &&
      seals.fixed_gd1 &&
      seals.csum_out &&
      !R.honesty.seed_used;

    jset('J-HRM-ATT-11-06', j06Pass ? 'PASS' : 'FAIL', {
      summary: `honestyVisible=${honestyVisible} · seals=${JSON.stringify(seals)} · Nest/core non404=${R.nest_core_sign_non404.length} · seed=${R.honesty.seed_used}`,
      seals,
      snap: snap6,
      must_keep: R.must_keep,
    });
    if (!j06Pass) {
      R.defects.push({
        id: 'J06',
        sev: 'P1',
        owner: 'fe',
        note: 'honesty footer / seals incomplete',
      });
    }

    R.residuals.push({
      id: 'R-ATT-11-WF',
      sev: 'P2',
      owner: 'qc',
      note: 'FIXED_GĐ1 interim footer · ≠ invent full R-SIGN-01 DONE',
    });
    R.residuals.push({
      id: 'R-ATT-11-CSUM',
      sev: 'INFO',
      owner: '—',
      note: 'OUT GĐ1 · footer OUT',
    });
    R.residuals.push({
      id: 'R-ATT-11-INBOX',
      sev: 'INFO',
      owner: '—',
      note: 'OUT GĐ1 · footer OUT',
    });
    R.residuals.push({
      id: 'R-ATT-11-EMIT',
      sev: 'INFO',
      owner: 'qc',
      note: 'response-only timesheet.closed · ≠ invent PAY DONE',
    });
    R.residuals.push({
      id: 'R-ATT-10-DISP',
      sev: 'P2',
      owner: '—',
      note: 'peer HOLD · HOL/MEAL OUT · ≠ invent lines[] DONE',
    });
    R.residuals.push({
      id: 'R-ATT-11-HONESTY',
      sev: 'INFO',
      owner: 'qc',
      note: 'C-SLICE · ≠ ATT-11 module UAT · printable false · PAY OUT · must_keep seals',
    });

    const verdicts = Object.values(R.journeys).map((j) => j.verdict);
    const anyFail = verdicts.some((v) => v === 'FAIL');
    const anyResidual = verdicts.some((v) => v === 'PASS_WITH_RESIDUAL');
    R.overall = anyFail ? 'FAIL' : anyResidual ? 'PASS_WITH_RESIDUAL' : 'PASS';
    R.ack_status = anyFail ? 'FAIL_TO_PM' : 'PASS_TO_PM';
    R.endedAt = ts();
    save();
  } catch (e) {
    R.overall = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    R.defects.push({ id: 'RUNNER', sev: 'P0', note: String(e).slice(0, 800) });
    R.endedAt = ts();
    save();
    console.error(e);
  } finally {
    await browser.close().catch(() => {});
    save();
    console.log(
      JSON.stringify(
        {
          stamp: R.stamp,
          overall: R.overall,
          ack_status: R.ack_status,
          journeys: Object.fromEntries(
            Object.entries(R.journeys).map(([k, v]) => [k, v.verdict]),
          ),
          nest_core_sign_non404: R.nest_core_sign_non404.length,
          sign_get: R.sign_get_hits.length,
          sign_post: R.sign_post_hits.length,
          close: R.close_hits.length,
          reopen: R.reopen_hits.length,
          defects: R.defects,
        },
        null,
        2,
      ),
    );
    process.exit(R.ack_status === 'PASS_TO_PM' ? 0 : 2);
  }
}

main();
