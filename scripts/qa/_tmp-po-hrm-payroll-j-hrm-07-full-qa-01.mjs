#!/usr/bin/env node
/**
 * PO-HRM-PAYROLL-J-HRM-07-FULL-QA-01
 * U65 full browser spine (NOT slice-only):
 *   ATT create → submit → sign → close
 *   → create period (template bind)
 *   → enroll → Khóa/process
 *   → header cards + payslip/line visible + F5
 *
 * Fresh draft only — NEVER proof on d92d3bbb (already processed Sep).
 * Honesty: payroll_e2e_ready=false LOCKED · DENY module UAT / AMIS DONE / invent ready flip
 * must_keep: process-post / period-bind / summary-cards GWC — do not demote
 * Cấm: seed
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
const XBOS = process.env.XBOS_HOST_API || 'http://127.0.0.1:28002';
const EMAIL = 'ceo@xe.vn';
const PASSWORD = process.env.PORTAL_DEV_PASSWORD || 'Xevn@2026';
const COMPANY = 'main';
const TENANT = 'xevn';
const SKIP_PROCESSED = 'd92d3bbb-f53a-4151-9b12-0ebe9dd27d25';
const PREFERRED_EMP_CODES = ['UAT-0100', 'HLD-0001', 'NV002', 'PORTAL-GCEO'];
const STAMP = `PAYJ07FULL-${Date.now().toString(36).toUpperCase()}`;
const TPL_CODE = `qa_j07_${STAMP.toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 36)}`;
const TPL_NAME = `Mẫu J07 ${STAMP}`;
const PERIOD_NAME = `Bảng lương J07 ${STAMP}`;
const SHEET_NAME = `QA-J07-ATT ${STAMP}`;
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-payroll-j-hrm-07-full-qa-01.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-payroll-j-hrm-07-full-qa-01');
mkdirSync(SCREEN, { recursive: true });

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Resolved free month/year after probe */
let PERIOD_MONTH = Number(process.env.QA_PERIOD_MONTH || 0) || 0;
let PERIOD_YEAR = Number(process.env.QA_PERIOD_YEAR || 0) || 0;

const R = {
  work_item_id: 'PO-HRM-PAYROLL-J-HRM-07-FULL-QA-01',
  parent: 'PO-HRM-CONTINUOUS-W7-20260807',
  program: 'PO_HRM_PAYROLL_FORMULA_AND_RUN_GAP_01',
  stamp: STAMP,
  u65: 'zero-seed',
  journey_l25: 'J-HRM-07',
  honesty: {
    payroll_e2e_ready: false,
    payroll_e2e_ready_flip_detected: false,
    formula_LIVE: false,
    seed_used: false,
    module_uat_claim: false,
    j_hrm_07_done_claim: false,
    amis_done_claim: false,
    must_keep_process_post_gwc: true,
    must_keep_period_bind_gwc: true,
    must_keep_summary_cards_gwc: true,
    demoted_prior_gwc: false,
  },
  env: { PORTAL, HRM, XBOS, EMAIL, commit: COMMIT, PERIOD_MONTH, PERIOD_YEAR },
  target: {
    periodId: null,
    sheetId: null,
    tplCode: TPL_CODE,
    skipProcessed: SKIP_PROCESSED,
    note: 'Fresh create ATT+period on free slot — NOT d92d3bbb',
  },
  clicks: [],
  criteria: {},
  att: {},
  pay: {},
  cards: {},
  payslip: {},
  network: [],
  requestBodies: [],
  pageErrors: [],
  tdzErrors: [],
  consoleErrors: [],
  startedAt: new Date().toISOString(),
};

function save() {
  writeFileSync(OUT_JSON, JSON.stringify(R, null, 2));
}
function click(step, detail) {
  R.clicks.push({ step, detail, at: new Date().toISOString() });
  save();
}
function q(path) {
  const u = new URL(path, PORTAL);
  u.searchParams.set('portal', '1');
  u.searchParams.set('tenantId', TENANT);
  u.searchParams.set('companyId', COMPANY);
  u.searchParams.set('_', String(Date.now()));
  return u.toString();
}
function parseVnMoney(text) {
  if (text == null) return null;
  const normalized = String(text)
    .replace(/[\u00a0\u202f\u2007\u2009]/g, ' ')
    .normalize('NFKC');
  const digits = normalized.replace(/[^\d]/g, '');
  if (!digits) {
    if (/^[\s—\-–]*$|0\s*₫?/.test(normalized)) return 0;
    return null;
  }
  const n = Number(digits);
  return Number.isFinite(n) ? n : null;
}
function listPeriods(payload) {
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
}
function vnMonthYear(iso) {
  const d = new Date(iso);
  const vn = new Date(d.getTime() + 7 * 3600_000);
  return { month: vn.getUTCMonth() + 1, year: vn.getUTCFullYear() };
}
function pad2(n) {
  return String(n).padStart(2, '0');
}
/** dd/MM/yyyy for month bounds (VN) */
function monthBoundsVi(month, year) {
  const last = new Date(year, month, 0).getDate();
  return {
    startVi: `01/${pad2(month)}/${year}`,
    endVi: `${pad2(last)}/${pad2(month)}/${year}`,
  };
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
        expiresAt: Date.now() + 8 * 3600_000,
        companyId: COMPANY,
        user: {
          userId: u.userId || u.id || EMAIL,
          email: u.email || EMAIL,
          displayName: u.displayName || u.fullName || EMAIL,
          roles: u.roles || ['group_ceo'],
        },
        raw: data,
      };
    }
  }
  throw new Error('loginApi failed');
}

async function apiCall(token, method, path, body) {
  const url = `${HRM}/api/hrm${path.startsWith('/') ? path : `/${path}`}`;
  const r = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'x-tenant-id': TENANT,
      'x-company-id': COMPANY,
      Accept: 'application/json',
      ...(body ? { 'content-type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const j = await r.json().catch(() => ({}));
  return { status: r.status, code: j?.code, message: j?.message, data: j?.data ?? j, raw: j };
}

async function resolveFreePeriodSlot(token) {
  if (PERIOD_MONTH && PERIOD_YEAR) {
    return { month: PERIOD_MONTH, year: PERIOD_YEAR, source: 'env' };
  }
  const periods = await apiCall(token, 'GET', `/payroll/periods?company_id=${COMPANY}`);
  const rows = listPeriods(periods.data);
  const occupied = new Set();
  for (const row of rows) {
    const sd = row.start_date || row.period_start;
    if (!sd) continue;
    const { month, year } = vnMonthYear(sd);
    occupied.add(`${month}-${year}`);
  }
  const cy = 2026;
  const candidates = [];
  for (const y of [cy + 1, cy + 2, cy]) {
    for (let m = 1; m <= 12; m++) candidates.push({ month: m, year: y });
  }
  // Prefer early 2027 free slots (stable for filter UI)
  candidates.sort((a, b) => a.year - b.year || a.month - b.month);
  for (const c of candidates) {
    if (!occupied.has(`${c.month}-${c.year}`)) {
      PERIOD_MONTH = c.month;
      PERIOD_YEAR = c.year;
      R.env.PERIOD_MONTH = PERIOD_MONTH;
      R.env.PERIOD_YEAR = PERIOD_YEAR;
      R.pay.slot = { ...c, source: 'probe', occupied: [...occupied].sort().slice(0, 40) };
      return { ...c, source: 'probe' };
    }
  }
  PERIOD_MONTH = 2;
  PERIOD_YEAR = cy + 1;
  R.env.PERIOD_MONTH = PERIOD_MONTH;
  R.env.PERIOD_YEAR = PERIOD_YEAR;
  return { month: PERIOD_MONTH, year: PERIOD_YEAR, source: 'fallback' };
}

async function ensureCalcList(page) {
  click('P0', `goto ${PORTAL}/hr/payroll`);
  await page.goto(q('/hr/payroll'), { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await sleep(2500);
  const calcTab = page.locator('[data-testid="payroll-tab-calculate"]');
  if (await calcTab.isVisible().catch(() => false)) {
    await calcTab.click({ timeout: 10_000 });
    await sleep(400);
  }
  const listItem = page.getByRole('menuitem', { name: /Danh sách bảng lương/i }).first();
  if (await listItem.isVisible().catch(() => false)) {
    click('P0b', 'menu Danh sách bảng lương');
    await listItem.click();
    await sleep(1500);
  }
  await page.locator('[data-testid="pay-batches-precision"]').waitFor({ state: 'visible', timeout: 45_000 });
}

async function setMonthFilter(page, month, year) {
  click('filter', `pay-batch-period-option-${month}-${year}`);
  await page.keyboard.press('Escape').catch(() => {});
  await sleep(400);
  // Ensure list chrome is present (create dialog / detail can hide filter)
  const filter = page.locator('[data-testid="pay-batch-period-filter"]');
  if (!(await filter.isVisible().catch(() => false))) {
    await ensureCalcList(page);
  }
  if (!(await filter.isVisible().catch(() => false))) {
    R.pay.filterMissing = true;
    save();
    return { ok: false, reason: 'filter_not_visible' };
  }
  await filter.click({ timeout: 20_000, force: true });
  await sleep(700);
  const opt = page.locator(`[data-testid="pay-batch-period-option-${month}-${year}"]`);
  if (await opt.isVisible().catch(() => false)) await opt.click({ force: true });
  else {
    const byRole = page.getByRole('option', { name: `Tháng ${month}/${year}`, exact: true });
    if (await byRole.isVisible().catch(() => false)) await byRole.click({ force: true });
    else {
      await page.keyboard.press('Escape').catch(() => {});
      return { ok: false, reason: 'option_missing' };
    }
  }
  await sleep(2000);
  return { ok: true };
}

async function openPeriodRow(page, periodId) {
  const full = page.locator(`[data-testid="pay-batch-row-${periodId}"]`).first();
  if (await full.isVisible().catch(() => false)) {
    click('open', `pay-batch-row-${periodId}`);
    await full.click({ timeout: 15_000 });
    await sleep(3000);
    return true;
  }
  const short = periodId.slice(0, 8);
  const row = page.locator(`[data-testid^="pay-batch-row-${short}"]`).first();
  if (await row.isVisible().catch(() => false)) {
    click('open', (await row.getAttribute('data-testid')) || short);
    await row.click({ timeout: 15_000 });
    await sleep(3000);
    return true;
  }
  const byStamp = page.locator('tr').filter({ hasText: STAMP }).first();
  if (await byStamp.isVisible().catch(() => false)) {
    click('open-stamp', STAMP);
    await byStamp.click({ timeout: 15_000 });
    await sleep(3000);
    return true;
  }
  const byShort = page.locator('tr').filter({ hasText: short }).first();
  if (await byShort.isVisible().catch(() => false)) {
    click('open-short', short);
    await byShort.click({ timeout: 15_000 });
    await sleep(3000);
    return true;
  }
  const ids = await page
    .locator('[data-testid^="pay-batch-row-"]')
    .evaluateAll((els) => els.map((e) => e.getAttribute('data-testid')).filter(Boolean));
  R.debug = { ...(R.debug || {}), rowTestIds: ids.slice(0, 40) };
  save();
  return false;
}

async function openAttendanceMenuItem(page, labelRe) {
  const tab = page.locator('[data-testid="attendance-tab-menu"]');
  if (await tab.isVisible().catch(() => false)) {
    await tab.click();
    await sleep(500);
  }
  const byText = page.locator('[role="menu"], [data-radix-menu-content]').getByText(labelRe).first();
  if (await byText.count()) {
    await byText.click({ timeout: 8_000 });
    return;
  }
  const items = page.locator('[role="menuitem"]');
  const n = await items.count();
  for (let i = 0; i < n; i++) {
    const text = ((await items.nth(i).innerText().catch(() => '')) || '').trim();
    if (labelRe.test(text)) {
      await items.nth(i).click();
      return;
    }
  }
}

async function clickEnabledSignSteps(page) {
  for (let round = 0; round < 12; round++) {
    const btns = page.locator('[data-testid^="att-sign-confirm-"]');
    const count = await btns.count();
    let clicked = false;
    for (let i = 0; i < count; i++) {
      const btn = btns.nth(i);
      if (await btn.isEnabled().catch(() => false)) {
        const tid = (await btn.getAttribute('data-testid')) || `idx-${i}`;
        click('S-sign', `${tid} round ${round}`);
        await btn.click({ timeout: 10_000 });
        await sleep(2800);
        clicked = true;
        break;
      }
    }
    if (!clicked) break;
  }
}

async function fillDateInputs(dialog, startVi, endVi) {
  const dates = dialog.locator('input[placeholder="dd/MM/yyyy"]');
  const n = await dates.count();
  if (n >= 1) await dates.nth(0).fill(startVi);
  if (n >= 2) await dates.nth(1).fill(endVi);
}

async function capturePayslipTable(page) {
  const table = page.locator('table').filter({ hasText: /Lương cơ bản|Lương Net|Gross|Net/i }).first();
  const visible = await table.isVisible().catch(() => false);
  const text = visible ? await table.innerText().catch(() => '') : '';
  const rowCount = visible ? await table.locator('tbody tr').count().catch(() => 0) : 0;
  const hasNonZero = /[1-9][\d.,]*\s*₫/.test(text);
  return {
    visible,
    rowCount,
    hasComponentCols: /Lương cơ bản|Phụ cấp|Khấu trừ/.test(text),
    hasNonZero,
    sample: text.slice(0, 600),
  };
}

async function readSummaryCards(page) {
  const cards = page.locator('[data-testid="pay-batch-summary-cards"]');
  const visible = await cards.isVisible().catch(() => false);
  if (!visible) return { visible: false };
  const source = await cards.getAttribute('data-totals-source');
  const grossText = (await page.locator('[data-testid="pay-batch-summary-gross"]').innerText().catch(() => '')).trim();
  const netText = (await page.locator('[data-testid="pay-batch-summary-net"]').innerText().catch(() => '')).trim();
  const dedText = (await page.locator('[data-testid="pay-batch-summary-deduction"]').innerText().catch(() => '')).trim();
  const empText = (await page.locator('[data-testid="pay-batch-summary-emp-count"]').innerText().catch(() => '')).trim();
  return {
    visible: true,
    source,
    grossText,
    netText,
    dedText,
    empText,
    gross: parseVnMoney(grossText),
    net: parseVnMoney(netText),
    deduction: parseVnMoney(dedText),
    empCount: Number(empText) || 0,
  };
}

async function ensureActiveTemplate(page) {
  click('T0', 'settings pay-sheet-tpl');
  await page.goto(q('/hr/settings'), { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await sleep(2500);
  const tabBtn = page.getByTestId('settings-tab-pay-sheet-tpl');
  await tabBtn.scrollIntoViewIfNeeded().catch(() => {});
  await tabBtn.click({ force: true });
  await sleep(1500);
  await page.getByTestId('pay-sheet-tpl-settings-panel').waitFor({ state: 'visible', timeout: 20_000 }).catch(() => null);

  const existingRow = page.getByTestId(`pay-sheet-tpl-row-${TPL_CODE}`);
  if (await existingRow.isVisible().catch(() => false)) {
    return { created: false, code: TPL_CODE, name: TPL_NAME };
  }
  await page.getByTestId('hdsd-pay-sheet-tpl-new').click({ force: true }).catch(() => {});
  await sleep(400);
  await page.getByTestId('hdsd-pay-sheet-tpl-code').fill(TPL_CODE);
  await page.getByTestId('hdsd-pay-sheet-tpl-name').fill(TPL_NAME);
  await page.getByTestId('hdsd-pay-sheet-tpl-status').click({ force: true });
  await sleep(400);
  const activeOpt = page.getByRole('option', { name: /active|đang áp dụng|hiệu lực/i }).first();
  if (await activeOpt.isVisible().catch(() => false)) {
    await activeOpt.click({ force: true });
  } else {
    await page
      .locator('[role="option"]')
      .filter({ hasText: /^active$/i })
      .first()
      .click({ force: true })
      .catch(async () => {
        await page.keyboard.type('active');
        await page.keyboard.press('Enter');
      });
  }
  await sleep(300);
  await page.getByTestId('hdsd-pay-sheet-tpl-save-header').click();
  await sleep(2500);
  const createPost = R.network.find(
    (n) => n.method === 'POST' && /\/pay-sheet-templates/.test(n.url) && n.status === 201,
  );
  const rowVisible = await page.getByTestId(`pay-sheet-tpl-row-${TPL_CODE}`).isVisible().catch(() => false);
  return { created: true, code: TPL_CODE, name: TPL_NAME, createPost, rowVisible };
}

// ---------- main ----------
const session = await loginApi();
const slot = await resolveFreePeriodSlot(session.token);
click('slot', JSON.stringify(slot));
save();

const browser = await chromium.launch({
  headless: true,
  executablePath: CHROME,
  args: ['--disable-dev-shm-usage'],
});
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'vi-VN' });
const page = await context.newPage();

page.on('pageerror', (e) => {
  const s = String(e);
  R.pageErrors.push(s.slice(0, 240));
  if (/showAddDialog/i.test(s)) R.tdzErrors.push(s.slice(0, 240));
});
page.on('console', (msg) => {
  if (msg.type() === 'error') {
    const t = msg.text().slice(0, 200);
    R.consoleErrors.push(t);
    if (/showAddDialog/i.test(t)) R.tdzErrors.push(t);
  }
});
page.on('request', (req) => {
  try {
    const u = req.url();
    if (!/\/api\/hrm\/(payroll|attendance)\//.test(u)) return;
    const method = req.method();
    if (!['POST', 'PUT', 'PATCH'].includes(method)) return;
    let body = null;
    try {
      body = req.postDataJSON();
    } catch {
      try {
        body = req.postData();
      } catch {
        /* */
      }
    }
    R.requestBodies.push({
      method,
      url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 420),
      body:
        body && typeof body === 'object'
          ? {
              paySheetTemplateId: body.paySheetTemplateId ?? body.pay_sheet_template_id,
              period_label: body.period_label,
              name: body.name,
              keys: Object.keys(body).slice(0, 24),
            }
          : String(body || '').slice(0, 200),
      at: new Date().toISOString(),
    });
  } catch {
    /* */
  }
});
page.on('response', async (res) => {
  const u = res.url();
  if (!/\/api\/hrm\/(payroll|attendance)\//.test(u)) return;
  const method = res.request().method();
  if (method === 'OPTIONS') return;
  const entry = {
    method,
    status: res.status(),
    url: u.slice(0, 320),
    code: null,
    message: null,
    payroll_e2e_ready: null,
    dataId: null,
  };
  try {
    const j = await res.json();
    entry.code = j?.code || null;
    entry.message = typeof j?.message === 'string' ? j.message.slice(0, 160) : null;
    if (j?.payroll_e2e_ready !== undefined) entry.payroll_e2e_ready = j.payroll_e2e_ready;
    if (j?.data?.payroll_e2e_ready !== undefined) entry.payroll_e2e_ready = j.data.payroll_e2e_ready;
    const d = j?.data ?? j;
    if (d?.id) entry.dataId = d.id;
    if (d?.pay_sheet_template_id) entry.paySheetTemplateId = d.pay_sheet_template_id;
    if (d?.start_date) entry.start_date = d.start_date;
    if (d?.sheet_template_snapshot_json?.template_name) {
      entry.snapshotTemplateName = d.sheet_template_snapshot_json.template_name;
    }
    if (/\/process/i.test(u) && method === 'POST') {
      entry.bodySnippet = JSON.stringify(j).slice(0, 900);
    }
  } catch {
    /* */
  }
  R.network.push(entry);
});

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
      if (s.raw?.refreshToken) store.setItem('xevn.portal.refreshToken', s.raw.refreshToken);
      if (s.raw?.defaultMembershipId) store.setItem('xevn.portal.membershipId', s.raw.defaultMembershipId);
    }
  },
  { s: session },
);

try {
  // ========== 1) Active mẫu (Settings) ==========
  const tpl = await ensureActiveTemplate(page);
  await page.screenshot({ path: join(SCREEN, '01-settings-tpl.png'), fullPage: false });
  R.pay.tpl = tpl;
  R.criteria.tpl_active =
    tpl.rowVisible || tpl.createPost?.status === 201 || tpl.created === false ? 'PASS' : 'FAIL';
  if (R.criteria.tpl_active !== 'PASS') throw new Error('Active pay-sheet template missing');
  save();

  // ========== 2) ATT create → submit → sign → close ==========
  click('A0', `goto attendance · create ${SHEET_NAME}`);
  await page.goto(q('/hr/attendance'), { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await sleep(2800);
  await openAttendanceMenuItem(page, /Bảng chấm công|Sheets/i);
  await sleep(1500);
  await page.locator('[data-testid="att-sheets-precision"]').waitFor({ state: 'visible', timeout: 45_000 });
  await page.screenshot({ path: join(SCREEN, '02-att-list.png'), fullPage: false });

  const addBtn = page.locator('[data-testid="att-sheets-add"]');
  R.att.addVisible = await addBtn.isVisible().catch(() => false);
  if (!R.att.addVisible) throw new Error('att-sheets-add not visible');

  click('A1', 'att-sheets-add');
  await addBtn.click();
  await sleep(900);
  const dialog = page.getByRole('dialog');
  await dialog.waitFor({ state: 'visible', timeout: 15_000 });
  const { startVi, endVi } = monthBoundsVi(PERIOD_MONTH, PERIOD_YEAR);
  R.att.bounds = { startVi, endVi, month: PERIOD_MONTH, year: PERIOD_YEAR };

  const nameInput = dialog.locator('input').filter({ hasNot: page.locator('[type="radio"],[type="checkbox"]') }).first();
  // Prefer placeholder match
  const named = dialog.locator('input[placeholder*="Bảng chấm công"]');
  if (await named.count()) await named.first().fill(SHEET_NAME);
  else {
    const texts = dialog.locator('input:not([type="radio"]):not([type="checkbox"])');
    const n = await texts.count();
    let filled = false;
    for (let i = 0; i < n; i++) {
      const ph = (await texts.nth(i).getAttribute('placeholder')) || '';
      if (ph === 'dd/MM/yyyy') continue;
      await texts.nth(i).fill(SHEET_NAME);
      filled = true;
      break;
    }
    if (!filled && n > 0) await texts.nth(0).fill(SHEET_NAME);
  }
  await fillDateInputs(dialog, startVi, endVi);
  const monthlyRadio = dialog.locator('input[type="radio"][value="monthly"]');
  if (await monthlyRadio.isVisible().catch(() => false)) await monthlyRadio.check({ force: true });
  await page.screenshot({ path: join(SCREEN, '03-att-create-filled.png'), fullPage: false });

  const postsBeforeSheet = R.network.filter((x) => x.method === 'POST' && /attendance-sheets/.test(x.url)).length;
  await dialog.getByRole('button', { name: /^Lưu$/ }).click();
  await sleep(3500);
  const sheetPosts = R.network
    .filter((x) => x.method === 'POST' && /attendance-sheets(\?|$|\/)/.test(x.url) && !/signatures|close/.test(x.url))
    .slice(postsBeforeSheet);
  R.att.createPosts = sheetPosts.slice(-3);
  const createOk = sheetPosts.find((p) => p.status === 201 || p.status === 200);
  if (createOk?.dataId) {
    R.target.sheetId = createOk.dataId;
  }
  R.criteria.att_create = createOk ? 'PASS' : 'FAIL';
  await page.screenshot({ path: join(SCREEN, '04-att-after-create.png'), fullPage: false });

  // Open created sheet
  let opened = false;
  if (await page.getByText(SHEET_NAME).first().isVisible().catch(() => false)) {
    click('A2', 'open sheet by name');
    await page.getByText(SHEET_NAME).first().click();
    await sleep(2800);
    opened = true;
  } else if (R.target.sheetId) {
    const short = R.target.sheetId.slice(0, 8);
    const rows = page.locator('[data-testid="att-sheets-precision"] tbody tr');
    const rowCount = await rows.count();
    for (let i = 0; i < rowCount; i++) {
      const text = (await rows.nth(i).innerText().catch(() => '')).toLowerCase();
      if (text.includes(short.toLowerCase()) || text.includes(STAMP.toLowerCase())) {
        await rows.nth(i).click();
        await sleep(2800);
        opened = true;
        break;
      }
    }
  }
  R.att.sheetOpened = opened;
  if (!opened) throw new Error('Could not open created ATT sheet');
  await page.screenshot({ path: join(SCREEN, '05-att-detail.png'), fullPage: false });

  // Resolve sheet id from API if missing
  if (!R.target.sheetId) {
    const sheets = await apiCall(session.token, 'GET', `/attendance/attendance-sheets?company_id=${COMPANY}`);
    const list = Array.isArray(sheets.data?.data)
      ? sheets.data.data
      : Array.isArray(sheets.data)
        ? sheets.data
        : Array.isArray(sheets.data?.items)
          ? sheets.data.items
          : [];
    const hit = list.find((s) => String(s.name || s.period_label || '').includes(STAMP));
    if (hit?.id) R.target.sheetId = hit.id;
  }

  const submitBtn = page.locator('[data-testid="att-sheet-submit"]');
  if (await submitBtn.isVisible().catch(() => false)) {
    click('A3', 'att-sheet-submit');
    await submitBtn.click({ timeout: 12_000 });
    await sleep(4000);
  }

  R.att.signPanelVisible = await page.locator('[data-testid="att-sign-panel"]').isVisible().catch(() => false);
  await clickEnabledSignSteps(page);
  await sleep(1500);

  if (R.target.sheetId) {
    const sigAfter = await apiCall(
      session.token,
      'GET',
      `/attendance/attendance-sheets/${R.target.sheetId}/signatures?company_id=${COMPANY}`,
    );
    R.att.canCloseAfterSign = sigAfter.data?.can_close;
    R.att.missingRoles = sigAfter.data?.missing_mandatory_roles;
    R.att.sigStatus = sigAfter.status;
  }

  const closeBtn = page.locator('[data-testid="att-sign-close-sheet"]');
  R.att.closeEnabled = await closeBtn.isEnabled().catch(() => false);
  await page.screenshot({ path: join(SCREEN, '06-att-before-close.png'), fullPage: false });

  if (R.att.closeEnabled) {
    click('A4', 'att-sign-close-sheet');
    await closeBtn.click({ timeout: 10_000 });
    await sleep(4000);
    R.att.closePosts = R.network
      .filter((x) => x.method === 'POST' && /\/close/.test(x.url) && /attendance-sheets/.test(x.url))
      .slice(-3);
  } else {
    R.att.closeBlocked = 'close_btn_disabled';
  }

  if (R.target.sheetId) {
    const after = await apiCall(
      session.token,
      'GET',
      `/attendance/attendance-sheets/${R.target.sheetId}?company_id=${COMPANY}`,
    );
    R.att.sheetAfter = { status: after.data?.status, http: after.status, code: after.code, id: after.data?.id };
    R.criteria.att_closed =
      String(after.data?.status || '').toLowerCase() === 'closed' ? 'PASS' : 'FAIL_NOT_CLOSED';
  } else {
    R.criteria.att_closed = 'FAIL_NO_SHEET_ID';
  }
  await page.screenshot({ path: join(SCREEN, '07-att-after-close.png'), fullPage: false });
  save();

  // ========== 3) Create period with template bind ==========
  await ensureCalcList(page);
  R.criteria.payroll_load = 'PASS';
  R.criteria.tdz_cleared = R.tdzErrors.length ? 'FAIL' : 'PASS';
  await page.screenshot({ path: join(SCREEN, '08-pay-list.png'), fullPage: false });

  click('P1', 'Lập bảng lương');
  const createBtn = page.getByRole('button', { name: /lập bảng lương/i }).first();
  await createBtn.click({ force: true });
  await sleep(1200);
  const createDlg = page.getByTestId('pay-batch-create-dialog-precision');
  await createDlg.waitFor({ state: 'visible', timeout: 15_000 });
  await createDlg.locator('input').first().fill(PERIOD_NAME);
  await page.getByTestId('pay-batch-create-month-select').click({ force: true });
  await sleep(400);
  await page.getByTestId(`pay-batch-create-month-option-${PERIOD_MONTH}`).click({ force: true });
  await sleep(300);
  await page.getByTestId('pay-batch-create-year-select').click({ force: true });
  await sleep(400);
  await page.getByTestId(`pay-batch-create-year-option-${PERIOD_YEAR}`).click({ force: true });
  await sleep(300);

  const tplSelect = page.getByTestId('pay-period-pay-sheet-tpl-select');
  let pickedOk = false;
  let pickedLabel = null;
  for (let attempt = 0; attempt < 6 && !pickedOk; attempt++) {
    await tplSelect.click({ force: true });
    await sleep(800 + attempt * 400);
    const optionByCode = page.locator(`[data-testid="pay-period-pay-sheet-tpl-option-${TPL_CODE}"]`);
    if ((await optionByCode.count().catch(() => 0)) > 0) {
      await optionByCode.first().click({ force: true });
      pickedOk = true;
      pickedLabel = TPL_NAME;
      break;
    }
    const byStamp = page.getByRole('option').filter({ hasText: STAMP });
    if ((await byStamp.count().catch(() => 0)) > 0) {
      pickedLabel = ((await byStamp.first().innerText().catch(() => '')) || '').trim();
      await byStamp.first().click({ force: true });
      pickedOk = true;
      break;
    }
    await page.keyboard.press('Escape').catch(() => {});
    await sleep(200);
  }
  if (!pickedOk) {
    await tplSelect.click({ force: true });
    await sleep(800);
    const options = page.locator('[role="listbox"] [role="option"], [role="option"]');
    const count = await options.count().catch(() => 0);
    for (let i = 0; i < count; i++) {
      const t = ((await options.nth(i).innerText().catch(() => '')) || '').trim();
      if (!t || /chọn mẫu|không có|Đang tải|Chưa có/i.test(t)) continue;
      await options.nth(i).click({ force: true });
      pickedOk = true;
      pickedLabel = t;
      break;
    }
  }
  R.pay.tplPicked = { pickedOk, pickedLabel, TPL_CODE };
  await page.screenshot({ path: join(SCREEN, '09-period-create-filled.png'), fullPage: false });

  const beforePeriodPosts = R.network.filter(
    (n) => n.method === 'POST' && /\/payroll\/periods(\?|$)/.test(n.url) && !/\/(process|enroll)/.test(n.url),
  ).length;
  await page.getByTestId('hdsd-pay-period-create-submit').click({ force: true });
  await sleep(4000);
  const periodPosts = R.network
    .filter(
      (n) =>
        n.method === 'POST' &&
        /\/payroll\/periods(\?|$)/.test(n.url) &&
        !/\/(process|enroll)/.test(n.url),
    )
    .slice(beforePeriodPosts);
  R.pay.createPosts = periodPosts.slice(-3);
  const periodPost = periodPosts.find((p) => p.status === 201);
  const periodBody = R.requestBodies
    .filter((b) => b.method === 'POST' && /\/payroll\/periods/.test(b.url))
    .slice(-1)[0];
  R.criteria.period_create =
    periodPost?.status === 201 && Boolean(periodBody?.body?.paySheetTemplateId || periodPost?.paySheetTemplateId)
      ? 'PASS'
      : periodPost?.status === 201
        ? 'PASS_NO_BODY_TPL_OBS'
        : 'FAIL';
  if (periodPost?.dataId) R.target.periodId = periodPost.dataId;
  if (periodPost?.start_date) {
    const { month, year } = vnMonthYear(periodPost.start_date);
    PERIOD_MONTH = month;
    PERIOD_YEAR = year;
    R.env.PERIOD_MONTH = PERIOD_MONTH;
    R.env.PERIOD_YEAR = PERIOD_YEAR;
  }
  R.criteria.not_skip_processed =
    R.target.periodId && R.target.periodId !== SKIP_PROCESSED ? 'PASS' : 'FAIL';
  await createDlg.waitFor({ state: 'hidden', timeout: 15_000 }).catch(() => {});
  await sleep(1000);
  save();

  if (!R.target.periodId) {
    // fallback: find by stamp label
    const periods = await apiCall(session.token, 'GET', `/payroll/periods?company_id=${COMPANY}`);
    const hit = listPeriods(periods.data).find((p) => String(p.period_label || '').includes(STAMP));
    if (hit?.id) R.target.periodId = hit.id;
  }
  if (!R.target.periodId) throw new Error('Period create did not yield id');
  if (R.target.periodId === SKIP_PROCESSED) throw new Error('Refused to use d92d3bbb');

  // ========== 4) Open fresh draft → enroll ==========
  // Re-nav to list (create dialog can leave filter hidden)
  await ensureCalcList(page);
  const filterRes = await setMonthFilter(page, PERIOD_MONTH, PERIOD_YEAR);
  R.pay.filterAfterCreate = filterRes;
  const targetId = R.target.periodId;
  let openedPeriod = await openPeriodRow(page, targetId);
  if (!openedPeriod && filterRes?.ok === false) {
    // try without filter / search all months by stamp after reload list
    await ensureCalcList(page);
    openedPeriod = await openPeriodRow(page, targetId);
  }
  if (!openedPeriod) throw new Error(`Could not open period row ${targetId.slice(0, 8)}`);
  await page.screenshot({ path: join(SCREEN, '10-detail-before-enroll.png'), fullPage: false });

  const bodyText = await page.locator('body').innerText().catch(() => '');
  R.pay.detailEmpHint = (bodyText.match(/(\d+)\s*nhân viên/i) || [])[1] || null;
  R.pay.addEmpVisible = await page.locator('[data-testid="pay-batch-add-emp-btn"]').isVisible().catch(() => false);

  click('enroll', 'Thêm nhân viên');
  if (R.pay.addEmpVisible) {
    await page.locator('[data-testid="pay-batch-add-emp-btn"]').click();
    await sleep(1500);
    const dlg = page.locator('[data-testid="pay-batch-add-emp-dialog-precision"]');
    const dlgOpen = await dlg.isVisible().catch(() => false);
    R.pay.enrollDialogOpen = dlgOpen;
    if (dlgOpen) {
      await page.screenshot({ path: join(SCREEN, '11-enroll-dialog.png'), fullPage: false });
      const allCb = dlg.locator('[role="checkbox"]');
      const allN = await allCb.count();
      const enabledIdx = [];
      for (let i = 0; i < allN; i++) {
        const cb = allCb.nth(i);
        const disabled =
          (await cb.getAttribute('aria-disabled')) === 'true' ||
          (await cb.getAttribute('data-disabled')) !== null ||
          (await cb.isDisabled().catch(() => false));
        if (!disabled) enabledIdx.push(i);
      }
      R.pay.checkboxTotal = allN;
      R.pay.enabledCheckboxes = enabledIdx.length;
      if (enabledIdx.length >= 1) {
        let pick = enabledIdx.find((i) => i > 0) ?? enabledIdx[0];
        for (const code of PREFERRED_EMP_CODES) {
          const row = dlg
            .locator('tr, [role="row"], label, div')
            .filter({ hasText: new RegExp(code, 'i') })
            .first();
          if (await row.isVisible().catch(() => false)) {
            const cb = row.locator('[role="checkbox"]').first();
            if (await cb.isVisible().catch(() => false)) {
              const disabled =
                (await cb.getAttribute('aria-disabled')) === 'true' ||
                (await cb.getAttribute('data-disabled')) !== null;
              if (!disabled) {
                await cb.click();
                R.pay.enrollPreferredCode = code;
                pick = -1;
                break;
              }
            }
          }
        }
        if (pick >= 0) await allCb.nth(pick).click();
        await sleep(400);
        const before = R.network.filter((x) => x.method === 'POST' && /enroll/i.test(x.url)).length;
        const addEmpBtn = dlg.getByRole('button', { name: /Thêm \d+ nhân viên/i });
        if (await addEmpBtn.isVisible().catch(() => false)) await addEmpBtn.click();
        else await dlg.getByRole('button', { name: /Thêm/i }).last().click();
        await sleep(7000);
        const posts = R.network.filter((x) => x.method === 'POST' && /enroll/i.test(x.url)).slice(before);
        R.pay.enrollPosts = posts;
        R.criteria.enroll = posts.some((p) => p.status >= 200 && p.status < 300) ? 'PASS' : 'FAIL_ENROLL_HTTP';
      } else {
        R.criteria.enroll = 'FAIL_NO_ENABLED_CB';
        const huy = dlg.getByRole('button', { name: /^Hủy$/i });
        if (await huy.isVisible().catch(() => false)) await huy.click();
        else await page.keyboard.press('Escape').catch(() => {});
      }
      await dlg.waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => {});
    } else {
      R.criteria.enroll = 'FAIL_NO_DIALOG';
    }
  } else {
    R.criteria.enroll = 'FAIL_NO_ADD_BTN';
  }
  await page.screenshot({ path: join(SCREEN, '12-after-enroll.png'), fullPage: false });
  save();

  // ========== 5) Process ==========
  click('process', 'Khóa bảng lương');
  await page.keyboard.press('Escape').catch(() => {});
  await sleep(400);
  const lock = page.getByRole('button', { name: /Khóa bảng lương/i }).first();
  R.pay.lockVisible = await lock.isVisible().catch(() => false);
  if (R.pay.lockVisible) {
    await lock.click({ force: true });
    await sleep(900);
    await page.screenshot({ path: join(SCREEN, '13-lock-confirm.png'), fullPage: false });
    const confCandidates = [
      page.locator('[role="alertdialog"]').getByRole('button', { name: /Khóa bảng lương/i }),
      page.locator('[role="dialog"]').getByRole('button', { name: /Khóa bảng lương/i }),
      page.getByRole('button', { name: /^Khóa bảng lương$/i }).last(),
    ];
    const before = R.network.filter((x) => x.method === 'POST' && /\/process/i.test(x.url)).length;
    let confirmed = false;
    for (const c of confCandidates) {
      if (await c.isVisible().catch(() => false)) {
        await c.click({ force: true });
        confirmed = true;
        break;
      }
    }
    R.pay.confirmClicked = confirmed;
    await sleep(15000);
    const posts = R.network.filter((x) => x.method === 'POST' && /\/process/i.test(x.url)).slice(before);
    R.pay.processPosts = posts;
    R.criteria.process = posts.some((p) => p.status >= 200 && p.status < 300)
      ? 'PASS'
      : posts.length
        ? 'FAIL_HTTP'
        : 'FAIL_NO_POST';
    R.honesty.process_ready_flags = posts.map((p) => p.payroll_e2e_ready);
    if (R.honesty.process_ready_flags.some((v) => v === true)) {
      R.honesty.payroll_e2e_ready_flip_detected = true;
    }
  } else {
    R.criteria.process = 'FAIL_NO_LOCK_BTN';
  }
  await page.screenshot({ path: join(SCREEN, '14-after-process.png'), fullPage: false });

  R.payslip.afterProcess = await capturePayslipTable(page);
  R.cards.afterProcess = await readSummaryCards(page);
  R.criteria.payslip_ui =
    R.payslip.afterProcess.visible && R.payslip.afterProcess.rowCount >= 1 ? 'PASS' : 'FAIL';
  R.honesty.non_zero_observed = !!R.payslip.afterProcess.hasNonZero;

  // ========== 6) F5 + cards ==========
  click('f5', 'reload + re-open period');
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 90_000 });
  await sleep(4000);
  try {
    await ensureCalcList(page);
  } catch (e) {
    R.pay.f5ListError = String(e).slice(0, 200);
    await page.goto(q('/hr/payroll'), { waitUntil: 'domcontentloaded', timeout: 90_000 });
    await sleep(3000);
    await page.locator('[data-testid="payroll-tab-calculate"]').click().catch(() => {});
    const miRetry = page.getByRole('menuitem', { name: /Danh sách bảng lương/i }).first();
    if (await miRetry.isVisible().catch(() => false)) await miRetry.click();
    await sleep(2000);
    await page.locator('[data-testid="pay-batches-precision"]').waitFor({ state: 'visible', timeout: 40_000 });
  }
  await setMonthFilter(page, PERIOD_MONTH, PERIOD_YEAR);
  const openedAfterF5 = await openPeriodRow(page, targetId);
  if (!openedAfterF5) throw new Error(`F5 could not re-open period ${targetId.slice(0, 8)}`);
  await sleep(1500);
  R.payslip.afterF5 = await capturePayslipTable(page);
  R.cards.afterF5 = await readSummaryCards(page);
  R.criteria.f5 = R.payslip.afterF5.visible && R.payslip.afterF5.rowCount >= 1 ? 'PASS' : 'FAIL';
  R.criteria.summary_cards =
    R.cards.afterF5?.visible &&
    ((R.cards.afterF5.gross != null && R.cards.afterF5.gross > 0) ||
      (R.cards.afterF5.net != null && R.cards.afterF5.net > 0) ||
      R.payslip.afterF5.hasNonZero)
      ? R.cards.afterF5.gross > 0 || R.cards.afterF5.net > 0
        ? 'PASS'
        : 'PARTIAL_LINE_NONZERO_CARDS_ZERO'
      : R.cards.afterF5?.visible
        ? 'FAIL_CARDS_ZERO'
        : 'FAIL_NO_CARDS';
  await page.screenshot({ path: join(SCREEN, '15-after-f5.png'), fullPage: false });

  const periodAfter = await apiCall(session.token, 'GET', `/payroll/periods?company_id=${COMPANY}`);
  const tAfter = listPeriods(periodAfter.data).find((p) => p.id === targetId);
  R.pay.periodAfter = tAfter
    ? {
        id: tAfter.id,
        status: tAfter.status,
        employee_count: tAfter.employee_count,
        processed_at: tAfter.processed_at,
        pay_sheet_template_id: tAfter.pay_sheet_template_id,
        period_label: tAfter.period_label,
        start_date: tAfter.start_date,
      }
    : null;
  R.criteria.period_processed =
    String(tAfter?.status || '').toLowerCase() === 'processed' ? 'PASS' : `FAIL_${tAfter?.status || 'MISSING'}`;
  R.criteria.period_tpl_bound = tAfter?.pay_sheet_template_id ? 'PASS' : 'FAIL_NO_TPL';

  const payslips = await apiCall(
    session.token,
    'GET',
    `/payroll/payslips?company_id=${COMPANY}&payroll_period_id=${targetId}`,
  );
  const slipRows = payslips.data?.data ?? (Array.isArray(payslips.data) ? payslips.data : []);
  R.pay.payslipsApi = {
    status: payslips.status,
    count: Array.isArray(slipRows) ? slipRows.length : 0,
    sample: Array.isArray(slipRows)
      ? slipRows.slice(0, 3).map((s) => ({
          id8: s.id?.slice(0, 8),
          status: s.status,
          gross: s.gross_amount ?? s.grossAmount,
          net: s.net_amount ?? s.netAmount,
        }))
      : [],
  };

  // cards match line if both non-zero
  if (R.cards.afterF5?.gross > 0 && R.payslip.afterF5?.hasNonZero) {
    R.criteria.cards_match_line =
      R.cards.afterF5.gross === parseVnMoney(R.payslip.afterF5.sample) ||
      R.cards.afterF5.source === 'line_aggregate'
        ? 'PASS_OR_SOURCE'
        : 'OBS';
  }

  const enrollOk = R.criteria.enroll === 'PASS' || String(R.criteria.enroll || '').startsWith('PASS_');
  const processOk = R.criteria.process === 'PASS';
  const payslipOk = R.criteria.payslip_ui === 'PASS';
  const f5Ok = R.criteria.f5 === 'PASS';
  const attOk = R.criteria.att_closed === 'PASS' && R.criteria.att_create === 'PASS';
  const periodOk =
    (R.criteria.period_create === 'PASS' || R.criteria.period_create === 'PASS_NO_BODY_TPL_OBS') &&
    R.criteria.period_processed === 'PASS';
  const cardsOk =
    R.criteria.summary_cards === 'PASS' || R.criteria.summary_cards === 'PARTIAL_LINE_NONZERO_CARDS_ZERO';
  const tdzOk = R.criteria.tdz_cleared === 'PASS';
  const notSkip = R.criteria.not_skip_processed === 'PASS';
  const honestyOk = !R.honesty.payroll_e2e_ready_flip_detected;
  const tplOk = R.criteria.tpl_active === 'PASS';

  R.honesty.payroll_e2e_ready = false;
  R.honesty.formula_LIVE = false;
  R.honesty.j_hrm_07_done_claim = false;
  R.honesty.module_uat_claim = false;

  // Full spine PASS requires ATT + period create bind + enroll + process + payslip + F5 + honesty
  // Cards PARTIAL (line nonzero, cards 0) = FAIL residual owner FE (but prior GWC must_keep — note OBS if prior closed on cf38deac)
  const fullPass =
    attOk &&
    tplOk &&
    periodOk &&
    enrollOk &&
    processOk &&
    payslipOk &&
    f5Ok &&
    tdzOk &&
    notSkip &&
    honestyOk &&
    R.criteria.summary_cards === 'PASS';

  R.verdict = fullPass ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  R.ack_status = R.verdict;
  R.residuals = [];
  if (!attOk) R.residuals.push({ id: 'R-J07-ATT-CLOSE', owner: 'dev-fe', note: R.criteria.att_closed });
  if (!periodOk)
    R.residuals.push({
      id: 'R-J07-PERIOD-CREATE-PROCESS',
      owner: 'dev-be',
      note: `${R.criteria.period_create}/${R.criteria.period_processed}`,
    });
  if (!enrollOk) R.residuals.push({ id: 'R-J07-ENROLL', owner: 'dev-fe', note: R.criteria.enroll });
  if (!processOk) R.residuals.push({ id: 'R-J07-PROCESS', owner: 'dev-be', note: R.criteria.process });
  if (!payslipOk || !f5Ok)
    R.residuals.push({ id: 'R-J07-PAYSLIP-UI', owner: 'dev-fe', note: `${R.criteria.payslip_ui}/${R.criteria.f5}` });
  if (R.criteria.summary_cards !== 'PASS')
    R.residuals.push({
      id: 'R-J07-SUMMARY-CARDS',
      owner: 'dev-fe',
      note: R.criteria.summary_cards,
      must_keep_prior_gwc: true,
    });
  if (!tdzOk) R.residuals.push({ id: 'R-PAY-BATCHES-SHOWADD-TDZ', owner: 'dev-fe', note: 'reopened' });

  R.finishedAt = new Date().toISOString();
  R.executive_summary = [
    `stamp=${STAMP}`,
    `sheet=${R.target.sheetId?.slice(0, 8)}`,
    `period=${R.target.periodId?.slice(0, 8)}`,
    `ym=${PERIOD_MONTH}/${PERIOD_YEAR}`,
    `att_create=${R.criteria.att_create}`,
    `att_closed=${R.criteria.att_closed}`,
    `period_create=${R.criteria.period_create}`,
    `enroll=${R.criteria.enroll}`,
    `process=${R.criteria.process}`,
    `period_after=${R.pay.periodAfter?.status}`,
    `payslip=${R.criteria.payslip_ui}`,
    `f5=${R.criteria.f5}`,
    `cards=${R.criteria.summary_cards}`,
    `tdz=${R.criteria.tdz_cleared}`,
    `verdict=${R.verdict}`,
    'honesty payroll_e2e_ready=false LOCKED · DENY J-HRM-07 DONE / module UAT / AMIS',
  ].join(' · ');
} catch (err) {
  R.fatal = String(err?.stack || err).slice(0, 1200);
  R.verdict = 'FAIL_TO_PM';
  R.ack_status = 'FAIL_TO_PM';
  R.finishedAt = new Date().toISOString();
  if (!R.residuals) R.residuals = [];
  R.residuals.push({ id: 'R-J07-FATAL', owner: 'qa', note: String(err?.message || err).slice(0, 200) });
} finally {
  R.honesty.payroll_e2e_ready = false;
  save();
  await browser.close().catch(() => {});
}

console.log(
  JSON.stringify(
    {
      stamp: R.stamp,
      verdict: R.verdict,
      criteria: R.criteria,
      target: R.target,
      env: { PERIOD_MONTH: R.env.PERIOD_MONTH, PERIOD_YEAR: R.env.PERIOD_YEAR },
      att: {
        createPosts: R.att.createPosts,
        sheetAfter: R.att.sheetAfter,
        closeEnabled: R.att.closeEnabled,
        canCloseAfterSign: R.att.canCloseAfterSign,
        missingRoles: R.att.missingRoles,
      },
      pay: {
        createPosts: R.pay.createPosts,
        enrollPosts: R.pay.enrollPosts,
        processPosts: R.pay.processPosts,
        periodAfter: R.pay.periodAfter,
        payslipsApi: R.pay.payslipsApi,
        tplPicked: R.pay.tplPicked,
      },
      cards: R.cards,
      payslip: R.payslip,
      residuals: R.residuals,
      tdzErrors: R.tdzErrors,
      honesty: R.honesty,
      executive_summary: R.executive_summary,
      fatal: R.fatal,
    },
    null,
    2,
  ),
);

process.exit(R.verdict === 'PASS_TO_PM' ? 0 : 2);
