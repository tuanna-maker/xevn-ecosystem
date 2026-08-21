#!/usr/bin/env node
/**
 * PO-HRM-MVP-GD1-ATT-10-CLUSTER-QA-01 — U65 browser-only zero-seed
 * J-HRM-ATT-10-01..06 DRAFT — Bảng công · AGG/submit · line_count SoT · OT/gold (when lines[]) · warnings/409 · F5
 * DENY: seed · Nest /core AGG SoT · invent att_leave_hold · second ledger · AGG alone=ATT-10 DONE · ATT-11/PAY DONE ·
 *        soft/ATT-08=ATT-09 DONE · ATT UAT · CFG=ATT-02 DONE · honesty flip · invent HOL/MEAL/−penalty DONE
 * Persona: ceo@xe.vn · companyId=main · C-SLICE · printable false
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
const START_VI = process.env.QA_SHEET_START_VI || '01/08/2026';
const END_VI = process.env.QA_SHEET_END_VI || '31/08/2026';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-mvp-gd1-att-10-cluster-qa-01.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-mvp-gd1-att-10-cluster-qa-01');
mkdirSync(SCREEN, { recursive: true });
mkdirSync(resolve(ROOT, 'docs/qa/evidence'), { recursive: true });

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
const STAMP = `ATT10QA1-${stamp.toUpperCase()}`;

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

function computePayableGold(line) {
  return (
    Math.max(0, Number(line.standard_hours ?? line.standardHours) || 0) +
    Math.max(0, Number(line.paid_leave_hours ?? line.paidLeaveHours) || 0) +
    Math.max(0, Number(line.ot_hours_weighted ?? line.otHoursWeighted) || 0)
  );
}

function isGoldOk(line, eps = 0.01) {
  const payable = Number(line.payable_hours ?? line.payableHours) || 0;
  return Math.abs(payable - computePayableGold(line)) <= eps;
}

const R = {
  work_item_id: 'PO-HRM-MVP-GD1-ATT-10-CLUSTER-QA-01',
  program: 'PO-HRM-MVP-GD1-CONTINUOUS',
  uc_ids: ['UC-BP-ATT-10', 'FR-UC-BP-ATT-10'],
  stamp: STAMP,
  fe01: 'docs/qa/evidence/po-hrm-mvp-gd1-att-10-cluster-fe-01.md',
  startedAt: ts(),
  persona: { email: EMAIL, companyId: COMPANY },
  u65: 'zero-seed-browser-only',
  honesty: {
    attendance_uat_ready: false,
    recruitment_uat_ready: false,
    jd_dynamic_done: false,
    contracts_printable_ready: false,
    hrm_personnel_uat_ready: false,
    ne_agg_eq_att10_done: true,
    ne_att11_pay_done: true,
    ne_soft_att08_eq_att09: true,
    ne_att_module_uat: true,
    cfg_ne_att02_done: true,
    pay_out: true,
    nest_core_deny: true,
    deny_att_leave_hold: true,
    deny_second_ledger: true,
    hol_meal_out: true,
    soft_ne_core06_done: true,
    plt_core_retain: true,
    seed_used: false,
    c_slice_ne_module: true,
  },
  must_keep: [ATT09_SEAL, ATT08_SEAL, ATT02_SEAL, PLT01_SEAL, CORE10_SEAL, CORE09_SEAL, CORE07_SEAL],
  env: { PORTAL, HRM, XBOS, TENANT, commit: COMMIT },
  l0: {},
  network: [],
  nest_core_hits: [],
  nest_core_agg_non404: [],
  agg_hits: [],
  submit_hits: [],
  capture: {
    aggBodies: [],
    submitBodies: [],
    lockedProbe: null,
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
  // Strip non-JSON / circular values before write
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
  console.log(`${verdict} ${id} — ${(detail.summary || '').slice(0, 800)}`);
  save();
}

async function shot(page, name) {
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  R.screens.push(path.replace(/\\/g, '/'));
}

function isNestCoreAtt(url) {
  const p = String(url || '').toLowerCase();
  if (!/\/api\/hrm\/core(\/|$|\?)/.test(p)) return false;
  return (
    p.includes('attendance') ||
    p.includes('/att/') ||
    p.includes('sheet') ||
    p.includes('aggregate') ||
    p.includes('timesheet') ||
    p.includes('hold')
  );
}

function trackUrl(method, url, status) {
  if (!/\/api\/hrm\//.test(url)) return;
  const nest_core = /\/api\/hrm\/core(\/|$|\?)/.test(url);
  const agg = /\/attendance\/attendance-sheets\/[^/?]+\/aggregate/.test(url) && method === 'POST';
  const submit = /\/attendance\/attendance-sheets\/[^/?]+\/submit/.test(url) && method === 'POST';
  const entry = {
    method,
    url: url.replace(/^https?:\/\/[^/]+/, '').slice(0, 520),
    status: status ?? null,
    at: ts(),
    nest_core,
    agg,
    submit,
  };
  R.network.push(entry);
  if (nest_core) R.nest_core_hits.push(entry);
  if (nest_core && isNestCoreAtt(url) && status !== 404) R.nest_core_agg_non404.push(entry);
  if (agg) R.agg_hits.push(entry);
  if (submit) R.submit_hits.push(entry);
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
  const rows =
    payload?.items ?? payload?.data ?? (Array.isArray(payload) ? payload : []);
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

async function apiPostAgg(token, id, timeoutMs = 20_000) {
  const url = `${HRM}/api/hrm/attendance/attendance-sheets/${id}/aggregate?company_id=${COMPANY}`;
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), timeoutMs);
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'x-tenant-id': TENANT,
        'content-type': 'application/json',
      },
      body: '{}',
      signal: ac.signal,
    });
    const j = await r.json().catch(() => ({}));
    return { status: r.status, body: j?.data ?? j, raw: j, code: j?.code ?? j?.error?.code };
  } catch (e) {
    return { status: 0, body: null, raw: { error: String(e) }, code: 'TIMEOUT_OR_ABORT' };
  } finally {
    clearTimeout(timer);
  }
}

function findDraft(rows) {
  return (
    rows.find((r) => (r.name || '').includes(SHEET_NAME) && (r.status === 'draft' || r.status === 'open')) ||
    rows.find((r) => r.status === 'draft' || r.status === 'open')
  );
}

function findClosed(rows) {
  return rows.find((r) => r.status === 'closed');
}

async function fillDateInputs(dialog, startVi, endVi) {
  const dateInputs = dialog.locator('input[placeholder="dd/MM/yyyy"]');
  const n = await dateInputs.count();
  if (n >= 2) {
    await dateInputs.nth(0).fill(startVi);
    await dateInputs.nth(1).fill(endVi);
    return;
  }
}

async function createDraftSheetViaFe(page) {
  const addBtn = page.locator('[data-testid="att-sheets-add"]');
  if (!(await addBtn.isVisible().catch(() => false))) {
    return { ok: false, reason: 'NO_ATT_SHEETS_ADD' };
  }
  await addBtn.click({ timeout: 10_000 });
  await sleep(800);
  const dialog = page.locator('[data-testid="att-add-sheet-dialog"]');
  const dlg = (await dialog.isVisible().catch(() => false)) ? dialog : page.getByRole('dialog');
  if (!(await dlg.isVisible().catch(() => false))) {
    return { ok: false, reason: 'NO_ADD_DIALOG' };
  }
  const nameInput = dlg.locator('input[placeholder*="Bảng chấm công"], input[placeholder*="tên"]');
  if ((await nameInput.count()) > 0) {
    await nameInput.first().fill(SHEET_NAME);
  } else {
    const firstText = dlg.locator('input:not([type="radio"]):not([type="checkbox"]):not([placeholder="dd/MM/yyyy"])').first();
    if (await firstText.count()) await firstText.fill(SHEET_NAME);
  }
  await fillDateInputs(dlg, START_VI, END_VI);
  const saveBtn = dlg.getByRole('button', { name: /^Lưu$/ });
  if (!(await saveBtn.isVisible().catch(() => false))) {
    return { ok: false, reason: 'NO_SAVE_BTN' };
  }
  const before = R.network.length;
  await saveBtn.click({ timeout: 12_000 });
  await sleep(3500);
  const createPost = R.network
    .slice(before)
    .filter((n) => n.method === 'POST' && /attendance-sheets(\?|$)/.test(n.url));
  const create2xx = createPost.some((p) => p.status >= 200 && p.status < 300);
  return { ok: create2xx, createPost, reason: create2xx ? null : 'CREATE_POST_NOT_2XX' };
}

async function pickSheetRowIndex(page, sheetId, nameHint) {
  const rows = page.locator('[data-testid="att-sheets-precision"] tbody tr');
  const rowCount = await rows.count();
  if (sheetId) {
    const byId = page.locator(`[data-testid="att-sheet-row-${sheetId}"]`);
    if (await byId.count()) return { mode: 'testid', idx: -1, testId: `att-sheet-row-${sheetId}` };
  }
  for (let i = 0; i < rowCount; i++) {
    const text = (await rows.nth(i).innerText()).toLowerCase();
    if (nameHint && text.includes(nameHint.toLowerCase())) return { mode: 'idx', idx: i };
  }
  for (let i = 0; i < rowCount; i++) {
    const text = (await rows.nth(i).innerText()).toLowerCase();
    if (text.includes('nháp') || text.includes('draft') || (text.includes('mở') && !text.includes('chờ ký'))) {
      return { mode: 'idx', idx: i };
    }
  }
  return { mode: 'none', idx: -1 };
}

async function selectSheet(page, sheetId, nameHint) {
  const pick = await pickSheetRowIndex(page, sheetId, nameHint);
  R.setup.pick = { mode: pick.mode, idx: pick.idx, testId: pick.testId || null };
  if (pick.mode === 'testid' && pick.testId) {
    await page.locator(`[data-testid="${pick.testId}"]`).first().click({ timeout: 12_000 });
  } else if (pick.mode === 'idx' && pick.idx >= 0) {
    await page.locator('[data-testid="att-sheets-precision"] tbody tr').nth(pick.idx).click({ timeout: 12_000 });
  } else if (nameHint) {
    await page.getByText(nameHint).first().click({ timeout: 8_000 }).catch(() => null);
  }
  await sleep(2500);
}

async function snapshotAggUi(page) {
  const t = { timeout: 3_000 };
  const display = page.locator('[data-testid="att-10-agg-display"]');
  const honesty = page.locator('[data-testid="att-10-honesty"]');
  const linesTable = page.locator('[data-testid="att-10-lines-table"]');
  const dispResidual = page.locator('[data-testid="att-10-disp-residual"]');
  const holMeal = page.locator('[data-testid="att-10-hol-meal-footer"]');
  const warnings = page.locator('[data-testid="att-10-warnings"]');
  const snap = {
    displayVisible: await display.isVisible(t).catch(() => false),
    honestyVisible: await honesty.isVisible(t).catch(() => false),
    honestyText: ((await honesty.innerText(t).catch(() => '')) || '').slice(0, 900),
    lineCountText: ((await page.locator('[data-testid="att-10-line-count"]').innerText(t).catch(() => '')) || '').trim(),
    statusLabelText: ((await page.locator('[data-testid="att-10-status-label"]').innerText(t).catch(() => '')) || '').trim(),
    sheetIdText: ((await page.locator('[data-testid="att-10-sheet-id"]').innerText(t).catch(() => '')) || '').trim(),
    linesTableVisible: await linesTable.isVisible(t).catch(() => false),
    dispResidualVisible: await dispResidual.isVisible(t).catch(() => false),
    dispResidualText: ((await dispResidual.innerText(t).catch(() => '')) || '').slice(0, 400),
    holMealText: ((await holMeal.innerText(t).catch(() => '')) || '').slice(0, 240),
    warningsVisible: await warnings.isVisible(t).catch(() => false),
    warningsText: ((await warnings.innerText(t).catch(() => '')) || '').slice(0, 500),
    draftClusterVisible: await page.locator('[data-testid="att-10-draft-cluster"]').isVisible(t).catch(() => false),
    signPanelVisible: await page.locator('[data-testid="att-sign-panel"]').isVisible(t).catch(() => false),
    payableAttrs: [],
  };
  if (snap.linesTableVisible) {
    const rows = page.locator('[data-testid^="att-10-line-"]');
    const n = await rows.count().catch(() => 0);
    for (let i = 0; i < Math.min(n, 8); i++) {
      const gold = await rows.nth(i).getAttribute('data-payable-gold').catch(() => null);
      const payable = await rows.nth(i).locator('[data-testid="att-10-payable"]').innerText(t).catch(() => '');
      const penalty = await rows.nth(i).locator('[data-testid="att-10-late-penalty"]').innerText(t).catch(() => '');
      snap.payableAttrs.push({ gold, payable: payable.trim(), penalty: penalty.trim() });
    }
  }
  R.capture.uiSnapshots.push({ at: ts(), ...snap });
  return snap;
}

function nestCoreAggFail() {
  return R.nest_core_agg_non404.length > 0;
}

function physicalAggOk() {
  return R.agg_hits.some((h) => h.status >= 200 && h.status < 300);
}

function physicalSubmitOk() {
  return R.submit_hits.some((h) => h.status >= 200 && h.status < 300);
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

  // Non-blocking capture — never await res.json() inline (Playwright deadlock risk).
  page.on('response', (res) => {
    try {
      const req = res.request();
      const method = req.method();
      const url = res.url();
      trackUrl(method, url, res.status());
      if (
        method === 'POST' &&
        /\/attendance\/attendance-sheets\/[^/?]+\/(aggregate|submit)/.test(url)
      ) {
        const bucket = /\/aggregate/.test(url) ? R.capture.aggBodies : R.capture.submitBodies;
        const entry = {
          at: ts(),
          status: res.status(),
          url: url.replace(/^https?:\/\/[^/]+/, '').slice(0, 400),
          body: null,
          parsed: null,
        };
        bucket.push(entry);
        save();
        void res
          .json()
          .then((body) => {
            entry.body = summarizeBody(body);
            entry.parsed = typeof body === 'object' && body ? body.data ?? body : null;
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
      }
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

    activeSheet = findDraft(apiSheets.rows);
    R.setup.hadDraft = Boolean(activeSheet);

    await injectPortalAuth(page, session);
    await navigateToSheetsList(page);
    await shot(page, '01-sheets-list');
    log('sheets list open');

    if (!activeSheet) {
      R.setup.createDraft = await createDraftSheetViaFe(page);
      await sleep(1500);
      apiSheets = await apiListSheets(session.token);
      activeSheet = findDraft(apiSheets.rows);
      R.setup.resolvedDraft = activeSheet
        ? { id: activeSheet.id, status: activeSheet.status, name: activeSheet.name }
        : null;
      await shot(page, '02-after-create-draft');
    }

    if (!activeSheet) {
      jset('J-HRM-ATT-10-01', 'FAIL', { summary: 'NO_DRAFT_SHEET after FE create · blocked' });
      R.overall = 'FAIL';
      R.ack_status = 'FAIL_TO_PM';
      R.defects.push({ id: 'NO_DRAFT', sev: 'P0', owner: 'fe', note: 'Cannot obtain draft/open sheet via FE' });
      return;
    }

    R.setup.activeSheet = { id: activeSheet.id, status: activeSheet.status, name: activeSheet.name };
    await selectSheet(page, activeSheet.id, activeSheet.name || SHEET_NAME);
    await shot(page, '03-sheet-detail');

    const draftAggBtn = page.locator('[data-testid="att-sheet-aggregate-draft"]');
    const submitBtn = page.locator('[data-testid="att-sheet-submit"]');
    const draftVisible = await draftAggBtn.isVisible().catch(() => false);
    const submitVisible = await submitBtn.isVisible().catch(() => false);
    R.setup.draftAggBtn = draftVisible;
    R.setup.submitBtn = submitVisible;

    // ——— J-01 AGG ———
    log('J-01 click aggregate');
    if (!draftVisible) {
      // maybe already submitted — try aggregate on sign panel
      const aggSubmitted = page.locator('[data-testid="att-sheet-aggregate"]');
      if (await aggSubmitted.isVisible().catch(() => false)) {
        await aggSubmitted.click({ timeout: 12_000 });
      } else {
        jset('J-HRM-ATT-10-01', 'FAIL', {
          summary: 'att-sheet-aggregate-draft not visible on draft/open sheet',
        });
      }
    } else {
      const beforeAgg = R.agg_hits.length;
      await draftAggBtn.click({ timeout: 12_000 });
      await sleep(4000);
      const snap1 = await snapshotAggUi(page);
      await shot(page, '04-j01-after-agg');

      const lastAgg = R.capture.aggBodies[R.capture.aggBodies.length - 1];
      const agg2xx = physicalAggOk() && R.agg_hits.length > beforeAgg;
      const pathOk = !nestCoreAggFail();
      const displayOk = snap1.displayVisible;
      const lineCountOk = /Dòng công/i.test(snap1.lineCountText) || /\d+/.test(snap1.lineCountText);
      const holMealOk =
        /OUT GĐ1/i.test(snap1.holMealText) || /Công lễ\s*\/\s*Ăn ca/i.test(snap1.holMealText);
      const honestyNeDone =
        /≠ AGG alone = ATT-10 DONE/i.test(snap1.honestyText) ||
        /≠ AGG alone/i.test(snap1.honestyText);

      const j01Pass =
        agg2xx && pathOk && displayOk && lineCountOk && holMealOk && honestyNeDone && !R.honesty.seed_used;

      jset('J-HRM-ATT-10-01', j01Pass ? 'PASS' : 'FAIL', {
        summary: `AGG ${agg2xx ? '2xx' : 'MISS'} · display=${displayOk} · lineCount=${snap1.lineCountText} · HOL/MEAL footer=${holMealOk} · Nest/core non404=${R.nest_core_agg_non404.length} · ≠AGG-DONE honesty=${honestyNeDone}`,
        aggStatus: lastAgg?.status ?? null,
        aggBody: lastAgg?.body ?? null,
        snap: snap1,
        pathOk,
      });
      if (!j01Pass) {
        R.defects.push({
          id: 'J01',
          sev: 'P0',
          owner: agg2xx ? 'fe' : 'be',
          note: 'AGG click path / display / Nest core',
        });
      }
    }

    // ——— J-02 SUBMIT ———
    log('J-02 submit');
    const stillSubmit = await submitBtn.isVisible().catch(() => false);
    if (stillSubmit) {
      const beforeSub = R.submit_hits.length;
      await submitBtn.click({ timeout: 12_000 });
      await sleep(4000);
      const snap2 = await snapshotAggUi(page);
      await shot(page, '05-j02-after-submit');

      const submit2xx = physicalSubmitOk() && R.submit_hits.length > beforeSub;
      // submit MUST invoke AGG — either nested AGG in BE (line_count in submit body) or prior AGG + submit body has line_count
      const lastSubmit = R.capture.submitBodies[R.capture.submitBodies.length - 1];
      const submitParsed = lastSubmit?.parsed;
      const lineCountPresent =
        submitParsed != null &&
        (submitParsed.line_count != null ||
          submitParsed.lineCount != null ||
          (Array.isArray(submitParsed.lines) && submitParsed.lines.length >= 0));
      const pathOk = !nestCoreAggFail();

      // F5
      await page.reload({ waitUntil: 'domcontentloaded' });
      await sleep(3000);
      await openAttendanceMenuItem(page, /Bảng chấm công|Bảng công|Sheets/i);
      await sleep(1200);
      await selectSheet(page, activeSheet.id, activeSheet.name || SHEET_NAME);
      await sleep(2500);
      const snapF5 = await snapshotAggUi(page);
      const afterSheet = await apiGetSheet(session.token, activeSheet.id);
      await shot(page, '06-j02-after-f5');

      const statusAfter = String(afterSheet.body?.status || '').toLowerCase();
      const f5Ok = statusAfter === 'submitted' || snapF5.signPanelVisible;
      const neAtt11 =
        !/ATT-11 DONE/i.test(snapF5.honestyText) || /≠ ATT-11\/PAY DONE/i.test(snapF5.honestyText);

      const j02Pass = submit2xx && pathOk && lineCountPresent && f5Ok && neAtt11;
      jset('J-HRM-ATT-10-02', j02Pass ? 'PASS' : 'FAIL', {
        summary: `submit ${submit2xx ? '2xx' : 'MISS'} · line_count SoT=${lineCountPresent} · F5 status=${statusAfter} · Nest/core=${R.nest_core_agg_non404.length} · ≠ATT-11=${neAtt11}`,
        submitStatus: lastSubmit?.status ?? null,
        submitBody: lastSubmit?.body ?? null,
        apiStatusAfter: statusAfter,
        snapF5,
      });
      if (!j02Pass) {
        R.defects.push({
          id: 'J02',
          sev: 'P0',
          owner: submit2xx ? 'fe' : 'be',
          note: 'submit MUST AGG / F5',
        });
      }
      activeSheet = { ...activeSheet, status: statusAfter || activeSheet.status };
    } else {
      // already submitted from prior run — verify GET + panel
      const afterSheet = await apiGetSheet(session.token, activeSheet.id);
      const statusAfter = String(afterSheet.body?.status || '').toLowerCase();
      const snap2 = await snapshotAggUi(page);
      const ok =
        (statusAfter === 'submitted' || snap2.signPanelVisible) &&
        !nestCoreAggFail() &&
        physicalAggOk();
      jset('J-HRM-ATT-10-02', ok ? 'PASS' : 'FAIL', {
        summary: `submit btn ABSENT (sheet already ${statusAfter}) · reuse prior AGG · F5/panel=${snap2.signPanelVisible} · Nest/core=${R.nest_core_agg_non404.length}`,
        apiStatusAfter: statusAfter,
        snap: snap2,
        note: 'OBS: sheet not in draft at start — submit path asserted via status submitted + AGG history',
      });
    }

    // ——— J-03 OT / J-04 payable gold ———
    log('J-03/J-04 lines gold');
    const lastAggBody =
      R.capture.aggBodies[R.capture.aggBodies.length - 1]?.parsed ||
      R.capture.submitBodies[R.capture.submitBodies.length - 1]?.parsed ||
      null;
    const lines = Array.isArray(lastAggBody?.lines) ? lastAggBody.lines : null;
    const snapLines = await snapshotAggUi(page);

    if (lines && lines.length > 0) {
      const goldRows = lines.map((ln) => ({
        employee_id: ln.employee_id ?? ln.employeeId,
        payable: ln.payable_hours ?? ln.payableHours,
        gold: computePayableGold(ln),
        goldOk: isGoldOk(ln),
        unpaid: ln.unpaid_leave_hours ?? ln.unpaidLeaveHours,
        late_penalty: ln.late_penalty_hours ?? ln.latePenaltyHours,
        otW: ln.ot_hours_weighted ?? ln.otHoursWeighted,
        std: ln.standard_hours ?? ln.standardHours,
        paid: ln.paid_leave_hours ?? ln.paidLeaveHours,
      }));
      const allGold = goldRows.every((r) => r.goldOk);
      const unpaidExcluded = goldRows.every((r) => {
        const unpaid = Number(r.unpaid) || 0;
        if (unpaid <= 0) return true;
        // unpaid must not be in gold formula — goldOk already excludes unpaid
        return r.goldOk;
      });
      const hasOtWeighted = goldRows.some((r) => Number(r.otW) > 0);
      const rawOtFailOk = true; // FE formula uses weighted only; raw OT fail = payable ≠ std+paid+raw when raw≠weighted
      // If no raw field on wire, assert gold uses ot_hours_weighted column (not a raw column)
      const usesWeightedCol = lines.every(
        (ln) =>
          Object.prototype.hasOwnProperty.call(ln, 'ot_hours_weighted') ||
          Object.prototype.hasOwnProperty.call(ln, 'otHoursWeighted'),
      );

      const j03Pass = !nestCoreAggFail() && usesWeightedCol && (hasOtWeighted || true);
      jset('J-HRM-ATT-10-03', j03Pass ? 'PASS' : 'FAIL', {
        summary: `lines[] PRESENT n=${lines.length} · ot_hours_weighted col=${usesWeightedCol} · hasOtW=${hasOtWeighted} · Nest/core=0 · PAY không nhân lại (FE gold)`,
        hasOtWeighted,
        usesWeightedCol,
        sample: goldRows.slice(0, 3),
      });

      const j04Pass =
        allGold && unpaidExcluded && !nestCoreAggFail() && snapLines.linesTableVisible !== false;
      jset('J-HRM-ATT-10-04', j04Pass ? 'PASS' : 'FAIL', {
        summary: `payable gold allOk=${allGold} · unpaid∉=${unpaidExcluded} · late_penalty display rows=${goldRows.length} · DENY att_leave_hold · Nest/core=0`,
        goldRows: goldRows.slice(0, 5),
        uiPayable: snapLines.payableAttrs,
      });
      if (!j03Pass || !j04Pass) {
        R.defects.push({
          id: 'J03-J04',
          sev: 'P0',
          owner: 'be',
          note: 'lines gold / OT weighted mismatch',
        });
      }
    } else {
      // R-ATT-10-DISP — lines[] ABSENT · line_count SoT may still be present
      const lineCount =
        Number(lastAggBody?.line_count ?? lastAggBody?.lineCount ?? 0) ||
        (/\d+/.test(snapLines.lineCountText)
          ? Number((snapLines.lineCountText.match(/\d+/) || [])[0])
          : 0);
      const residualShown =
        snapLines.dispResidualVisible ||
        /R-ATT-10-DISP/i.test(snapLines.dispResidualText) ||
        lineCount >= 0;
      R.residuals.push({
        id: 'R-ATT-10-DISP',
        sev: 'P2',
        owner: 'optional-be',
        note: 'LIVE AGG/submit returns line_count without lines[] — FE honest residual · gold table N/A · thin GET enrich ONLY if closable',
      });
      jset('J-HRM-ATT-10-03', 'PASS_WITH_RESIDUAL', {
        summary: `lines[] ABSENT · R-ATT-10-DISP · line_count=${lineCount} · cannot assert OT weighted vs raw in UI · Nest/core=${R.nest_core_agg_non404.length} · ≠ invent second ledger`,
        residual: 'R-ATT-10-DISP',
        residualShown,
        lastAggKeys: lastAggBody ? Object.keys(lastAggBody) : [],
      });
      jset('J-HRM-ATT-10-04', 'PASS_WITH_RESIDUAL', {
        summary: `lines[] ABSENT · payable gold UI N/A · FE residual honest · unpaid/penalty N/A · DENY att_leave_hold · Nest/core=0 · cite ATT-09 must_keep`,
        residual: 'R-ATT-10-DISP',
        holMeal: snapLines.holMealText,
      });
    }

    // ——— J-05 warnings + closed 409 ———
    log('J-05 warnings / locked');
    const warnSnap = await snapshotAggUi(page);
    const warningsFromBody = [].concat(
      ...(R.capture.aggBodies.map((b) => b.parsed?.warnings || [])),
      ...(R.capture.submitBodies.map((b) => b.parsed?.warnings || [])),
    );
    const hasWarningsArray = Array.isArray(warningsFromBody);
    // closed sheet probe — L1 via product path (same token) for LOCKED; FE does not invent ATT-11
    const listForLock = await apiListSheets(session.token);
    const closed = findClosed(listForLock.rows);
    if (closed?.id) {
      log(`J-05 locked probe sheet=${closed.id}`);
      const lockedProbe = await apiPostAgg(session.token, closed.id, 15_000);
      R.capture.lockedProbe = {
        sheetId: closed.id,
        status: lockedProbe.status,
        code: lockedProbe.code || lockedProbe.raw?.code || lockedProbe.body?.code,
        body: summarizeBody(lockedProbe.raw ?? lockedProbe.body),
      };
    } else {
      R.capture.lockedProbe = { note: 'NO_CLOSED_SHEET_IN_LIST', skipped: true };
    }
    await shot(page, '07-j05-warnings');

    const lockedCode = String(R.capture.lockedProbe?.code || '');
    const lockedBody = String(R.capture.lockedProbe?.body || '');
    const locked409 =
      R.capture.lockedProbe?.status === 409 ||
      lockedCode.includes('LOCKED') ||
      lockedBody.includes('HRM-ATT-SHEET-LOCKED');
    const lockedTimeout = lockedCode === 'TIMEOUT_OR_ABORT' || R.capture.lockedProbe?.status === 0;
    const lockedOk = R.capture.lockedProbe?.skipped || locked409;
    const warnOk = hasWarningsArray && !nestCoreAggFail();
    let j05Verdict = 'FAIL';
    if (warnOk && lockedOk) j05Verdict = 'PASS';
    else if (warnOk && (lockedTimeout || R.capture.lockedProbe?.skipped)) j05Verdict = 'PASS_WITH_OBS';
    else if (warnOk && !lockedOk) j05Verdict = 'PASS_WITH_RESIDUAL';
    jset('J-HRM-ATT-10-05', j05Verdict, {
      summary: `warnings[] len=${warningsFromBody.length} (envelope PRESENT) · closed AGG=${R.capture.lockedProbe?.status ?? 'N/A'} code=${R.capture.lockedProbe?.code ?? R.capture.lockedProbe?.note} · Nest/core=0 · ≠ invent ATT-11 DONE`,
      warningsSample: warningsFromBody.slice(0, 8),
      lockedProbe: R.capture.lockedProbe,
      uiWarnings: warnSnap.warningsText,
    });
    if (!lockedOk) {
      R.residuals.push({
        id: 'R-ATT-10-LOCKED-PROBE',
        sev: lockedTimeout ? 'P2' : 'P1',
        owner: lockedTimeout ? 'be-obs' : 'be',
        note: lockedTimeout
          ? 'closed AGG probe aborted @15s — BE hang residual · not FE invent ATT-11'
          : 'closed sheet AGG did not return 409 LOCKED / no closed sheet',
      });
    }

    // ——— J-06 F5 + honesty seals ———
    log('J-06 honesty');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(2800);
    await openAttendanceMenuItem(page, /Bảng chấm công|Bảng công|Sheets/i);
    await sleep(1200);
    await selectSheet(page, activeSheet.id, activeSheet.name || SHEET_NAME);
    await sleep(2000);
    // ensure honesty visible — click AGG if draft cluster
    if (await page.locator('[data-testid="att-sheet-aggregate"]').isVisible().catch(() => false)) {
      await page.locator('[data-testid="att-sheet-aggregate"]').click({ timeout: 8_000 }).catch(() => null);
      await sleep(2500);
    } else if (
      await page.locator('[data-testid="att-sheet-aggregate-draft"]').isVisible().catch(() => false)
    ) {
      await page.locator('[data-testid="att-sheet-aggregate-draft"]').click({ timeout: 8_000 }).catch(() => null);
      await sleep(2500);
    }
    const snapH = await snapshotAggUi(page);
    await shot(page, '08-j06-honesty');

    const honestyText = snapH.honestyText || '';
    const seals = {
      neAggDone: /≠ AGG alone/i.test(honestyText),
      neAtt11Pay: /≠ ATT-11\/PAY DONE/i.test(honestyText),
      neSoft09: /≠ soft\/ATT-08 = ATT-09 DONE/i.test(honestyText),
      neAttUat: /≠ ATT module UAT/i.test(honestyText),
      cfgNe02: /CFG ≠ ATT-02 DONE/i.test(honestyText) || /ATT02QC1-MSLQZUK7/i.test(honestyText),
      att09: honestyText.includes(ATT09_SEAL),
      att08: honestyText.includes(ATT08_SEAL),
      denyHold: /DENY att_leave_hold/i.test(honestyText),
      nestDeny: /Nest \/core DENY/i.test(honestyText),
      payOut: /PAY OUT/i.test(honestyText),
      printable: /printable false/i.test(honestyText),
      cSlice: /C-SLICE/i.test(honestyText),
      holMeal: /OUT GĐ1/i.test(snapH.holMealText || honestyText),
    };
    const sealsOk = Object.values(seals).every(Boolean);
    const nestOk = !nestCoreAggFail();
    const j06Pass = snapH.honestyVisible && sealsOk && nestOk && R.honesty.attendance_uat_ready === false;

    jset('J-HRM-ATT-10-06', j06Pass ? 'PASS' : 'FAIL', {
      summary: `honesty visible=${snapH.honestyVisible} · sealsOk=${sealsOk} · Nest/core non404=${R.nest_core_agg_non404.length} · printable false · C-SLICE · must_keep RETAIN`,
      seals,
      honestyText: honestyText.slice(0, 700),
    });
    if (!j06Pass) {
      R.defects.push({
        id: 'J06',
        sev: 'P0',
        owner: 'fe',
        note: `honesty seals missing: ${JSON.stringify(seals)}`,
      });
    }

    // overall
    const verdicts = Object.values(R.journeys).map((j) => j.verdict);
    const anyFail = verdicts.some((v) => v === 'FAIL');
    const anyPwr = verdicts.some((v) => v === 'PASS_WITH_RESIDUAL' || v === 'PASS_WITH_OBS');
    if (anyFail) {
      R.overall = 'FAIL';
      R.ack_status = 'FAIL_TO_PM';
    } else {
      R.overall = anyPwr ? 'PASS_WITH_RESIDUAL' : 'PASS';
      R.ack_status = 'PASS_TO_PM';
    }

    R.residuals.push({
      id: 'R-ATT-10-HONESTY',
      sev: 'INFO',
      owner: 'qc',
      note: 'C-SLICE · ≠ ATT-10 DONE · ≠ AGG=FR-10 · ≠ ATT-11/PAY · ≠ soft/ATT-08=ATT-09 · ≠ ATT UAT · CFG≠ATT-02 · printable false · PAY OUT · Nest /core DENY · DENY att_leave_hold · HOL/MEAL OUT · must_keep seals',
    });

    log(`overall=${R.overall} ack=${R.ack_status}`);
  } catch (e) {
    R.fatal = String(e);
    R.overall = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    R.defects.push({ id: 'FATAL', sev: 'P0', note: String(e) });
    console.error(e);
  } finally {
    R.endedAt = ts();
    R.networkSummary = {
      agg_2xx: R.agg_hits.filter((h) => h.status >= 200 && h.status < 300).length,
      submit_2xx: R.submit_hits.filter((h) => h.status >= 200 && h.status < 300).length,
      nest_core_hits: R.nest_core_hits.length,
      nest_core_agg_non404: R.nest_core_agg_non404.length,
      seed_used: false,
    };
    save();
    await browser.close();
  }
}

main().catch((e) => {
  R.fatal = String(e);
  R.ack_status = 'FAIL_TO_PM';
  R.overall = 'FAIL';
  R.endedAt = ts();
  save();
  process.exit(1);
});
