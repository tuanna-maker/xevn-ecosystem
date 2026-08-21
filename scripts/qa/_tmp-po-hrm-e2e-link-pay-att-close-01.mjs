#!/usr/bin/env node
/**
 * PO-HRM-E2E-LINK-PAY-ATT-CLOSE-01 — U65 cross-module:
 * Attendance sheet close/sign (J-HRM-06c) → Payroll eligibility → AC-PAY-HIRE-04/05
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const PORTAL_CANDIDATES = [
  process.env.PORTAL_DEV_URL,
  'http://127.0.0.1:5175',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:8088',
].filter(Boolean);

const HRM = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
const XBOS = process.env.XBOS_HOST_API || 'http://127.0.0.1:28002';
const EMAIL = 'ceo@xe.vn';
const PASSWORD = process.env.PORTAL_DEV_PASSWORD || 'Xevn@2026';
const COMPANY = 'main';
const TENANT = 'xevn';
/** Payroll target month (matches QA-05 draft Tháng 1/2026) */
const PAYROLL_MONTH = Number(process.env.QA_PAYROLL_MONTH || 1);
const PAYROLL_YEAR = Number(process.env.QA_PAYROLL_YEAR || 2026);
const ATT_START_VI = `01/${String(PAYROLL_MONTH).padStart(2, '0')}/${PAYROLL_YEAR}`;
const ATT_END_VI =
  PAYROLL_MONTH === 2
    ? `28/${String(PAYROLL_MONTH).padStart(2, '0')}/${PAYROLL_YEAR}`
    : `28/${String(PAYROLL_MONTH).padStart(2, '0')}/${PAYROLL_YEAR}`;
const SHEET_NAME = `QA-ATT-CLOSE-PAY-${Date.now()}`;
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-e2e-link-pay-att-close-01-browser.json');
const OUT_MD = resolve(ROOT, 'docs/qa/evidence/po-hrm-e2e-link-pay-att-close-01.md');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-e2e-link-pay-att-close-01');
mkdirSync(SCREEN, { recursive: true });

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const R = {
  work_item_id: 'PO-HRM-E2E-LINK-PAY-ATT-CLOSE-01',
  parent: 'PO-HRM-E2E-LINK-PAY-HIRE-QA-05',
  u65: 'zero-seed',
  hdsd_align:
    'Chấm công → Bảng chấm công → tạo/mở kỳ → gửi chờ ký → ký NV/QL/HCNS → Chốt → Tiền lương → Thêm NV',
  honesty: { payroll_e2e_ready: false },
  env: { PORTAL: null, HRM, XBOS, EMAIL, commit: COMMIT },
  payrollTarget: { month: PAYROLL_MONTH, year: PAYROLL_YEAR },
  attPeriod: { start: ATT_START_VI, end: ATT_END_VI },
  l0: {},
  clicks: [],
  att: {},
  pay: {},
  network: { att: [], pay: [], enrollBodies: [] },
  consoleErrors: [],
  pageErrors: [],
  criteria: {},
  residuals: [],
  verdict: null,
  ack_status: null,
  startedAt: new Date().toISOString(),
  endedAt: null,
};

function save() {
  writeFileSync(OUT_JSON, JSON.stringify(R, null, 2));
}

function click(step, detail) {
  R.clicks.push({ step, detail, at: new Date().toISOString() });
  save();
}

async function pickPortal() {
  for (const url of PORTAL_CANDIDATES) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(6000) });
      if (r.status === 200) return url.replace(/\/$/, '');
    } catch {
      /* */
    }
  }
  return PORTAL_CANDIDATES[0]?.replace(/\/$/, '') || 'http://127.0.0.1:5175';
}

function q(portal, path) {
  const u = new URL(path, portal);
  u.searchParams.set('portal', '1');
  u.searchParams.set('tenantId', TENANT);
  u.searchParams.set('companyId', COMPANY);
  return u.toString();
}

async function loginApi() {
  for (const url of [`${R.env.PORTAL}/api/xbos/auth/login`, `${XBOS}/api/xbos/auth/login`]) {
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

function parseSheetRows(j) {
  const d = j?.data;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.items)) return d.items;
  if (Array.isArray(d)) return d;
  if (Array.isArray(j?.items)) return j.items;
  return [];
}

async function apiListSheets(token) {
  const url = `${HRM}/api/hrm/attendance/attendance-sheets?company_id=${COMPANY}&page_size=80`;
  const r = await fetch(url, {
    headers: { authorization: `Bearer ${token}`, 'x-tenant-id': TENANT },
  });
  const j = await r.json().catch(() => ({}));
  return { status: r.status, rows: parseSheetRows(j) };
}

async function apiGetSheet(token, id) {
  const r = await fetch(`${HRM}/api/hrm/attendance/attendance-sheets/${id}?company_id=${COMPANY}`, {
    headers: { authorization: `Bearer ${token}`, 'x-tenant-id': TENANT },
  });
  const j = await r.json().catch(() => ({}));
  return { status: r.status, body: j?.data ?? j };
}

async function apiGetSignatures(token, id) {
  const r = await fetch(`${HRM}/api/hrm/attendance/attendance-sheets/${id}/signatures?company_id=${COMPANY}`, {
    headers: { authorization: `Bearer ${token}`, 'x-tenant-id': TENANT },
  });
  const j = await r.json().catch(() => ({}));
  return { status: r.status, body: j?.data ?? j };
}

async function apiListPayPeriods(token) {
  const r = await fetch(`${HRM}/api/hrm/payroll/periods?company_id=${COMPANY}`, {
    headers: { Authorization: `Bearer ${token}`, 'x-tenant-id': TENANT, 'x-company-id': COMPANY },
  });
  const j = await r.json().catch(() => ({}));
  const rows = j?.data?.data ?? j?.data ?? [];
  return { status: r.status, rows: Array.isArray(rows) ? rows : [] };
}

function payPeriodMatchesMonth(row) {
  if (!row?.start_date) return false;
  const d = new Date(row.start_date);
  const vnMonth = d.getUTCMonth() === 11 && d.getUTCDate() >= 31
    ? 1
    : d.getUTCMonth() + 1;
  const vnYear = d.getUTCMonth() === 11 && d.getUTCDate() >= 31
    ? d.getUTCFullYear() + 1
    : d.getUTCFullYear();
  return vnMonth === PAYROLL_MONTH && vnYear === PAYROLL_YEAR;
}

async function apiEligibility(token, periodId) {
  const r = await fetch(`${HRM}/api/hrm/payroll/periods/${periodId}/eligibility?company_id=${COMPANY}`, {
    headers: { authorization: `Bearer ${token}`, 'x-tenant-id': TENANT, 'x-company-id': COMPANY },
  });
  const j = await r.json().catch(() => ({}));
  const data = j?.data ?? j;
  return {
    status: r.status,
    code: j?.code,
    eligible_count: data?.eligible_count ?? 0,
    ineligible_count: data?.ineligible_count ?? 0,
    sampleReasons: (data?.items ?? [])
      .filter((i) => !i.eligible)
      .slice(0, 3)
      .map((i) => ({ code: i.employee_code, reasons: i.reasons })),
  };
}

function sheetMatchesPayrollMonth(row) {
  const start = row.period_start || row.start_date || row.from_date || '';
  const end = row.period_end || row.end_date || row.to_date || '';
  const name = (row.name || '').toLowerCase();
  const m = String(PAYROLL_MONTH).padStart(2, '0');
  const y = String(PAYROLL_YEAR);
  if (start.includes(`${y}-${m}`) || end.includes(`${y}-${m}`)) return true;
  if (name.includes(`/${m}/${y}`) || name.includes(`tháng ${PAYROLL_MONTH}`)) return true;
  return false;
}

function pickSheetForPayroll(rows) {
  const matching = rows.filter(sheetMatchesPayrollMonth);
  const closed = matching.find((r) => r.status === 'closed');
  if (closed) return { sheet: closed, reason: 'existing_closed_match' };
  const submitted = matching.find((r) => r.status === 'submitted');
  if (submitted) return { sheet: submitted, reason: 'existing_submitted_match' };
  const draft = matching.find((r) => r.status === 'draft' || r.status === 'open');
  if (draft) return { sheet: draft, reason: 'existing_draft_match' };
  return { sheet: null, reason: 'no_payroll_month_sheet' };
}

async function openAttendanceMenuItem(page, labelRe) {
  await page.locator('[data-testid="attendance-tab-menu"]').click();
  await sleep(500);
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

async function navigateToSheetsList(page, portal) {
  click('S0', `goto ${portal}/hr/attendance`);
  await page.goto(q(portal, '/hr/attendance'), { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await sleep(2800);
  click('S1', 'menu Bảng chấm công');
  await openAttendanceMenuItem(page, /Bảng chấm công|Sheets/i);
  await sleep(1500);
  await page.locator('[data-testid="att-sheets-precision"]').waitFor({ state: 'visible', timeout: 45_000 }).catch(() => null);
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

async function createSheetFe(page) {
  click('S2-create', 'att-sheets-add');
  const addBtn = page.locator('[data-testid="att-sheets-add"]');
  if (!(await addBtn.isVisible().catch(() => false))) {
    R.att.createBlocked = 'no_add_button';
    return null;
  }
  await addBtn.click({ timeout: 12_000 });
  await sleep(1200);
  const dialog = page.locator('[role="dialog"]').last();
  await dialog.waitFor({ state: 'visible', timeout: 10_000 });
  const nameInput = dialog.locator('input').first();
  await nameInput.fill(SHEET_NAME);
  await fillDateInputs(dialog, ATT_START_VI, ATT_END_VI);
  const stdRadio = dialog.getByText(/Công chuẩn|Standard/i).first();
  if (await stdRadio.isVisible().catch(() => false)) {
    await stdRadio.click().catch(() => {});
  }
  click('S3-create', 'dialog Lưu/Tạo bảng');
  const saveBtn = dialog.getByRole('button', { name: /Lưu|Tạo|Thêm/i }).first();
  await saveBtn.click({ timeout: 12_000 });
  await sleep(3500);
  const postOk = R.network.att.some((n) => n.method === 'POST' && /attendance-sheets/.test(n.url) && n.status >= 200 && n.status < 300);
  R.att.createPost2xx = postOk;
  return postOk;
}

async function openSheetRow(page, sheetId) {
  const rows = page.locator('[data-testid="att-sheets-precision"] tbody tr');
  const rowCount = await rows.count();
  const needle = sheetId ? sheetId.slice(0, 8).toLowerCase() : '';
  for (let i = 0; i < rowCount; i++) {
    const text = (await rows.nth(i).innerText().catch(() => '')).toLowerCase();
    if (needle && text.includes(needle)) {
      click('S4-open', `row click sheet ${needle}`);
      await rows.nth(i).click({ timeout: 12_000 });
      await sleep(2200);
      return i;
    }
  }
  if (rowCount > 0) {
    click('S4-open', 'first row fallback');
    await rows.nth(0).click({ timeout: 12_000 });
    await sleep(2200);
    return 0;
  }
  return -1;
}

async function clickEnabledSignSteps(page) {
  for (let round = 0; round < 8; round++) {
    const btns = page.locator('[data-testid^="att-sign-confirm-"]');
    const count = await btns.count();
    let clicked = false;
    for (let i = 0; i < count; i++) {
      const btn = btns.nth(i);
      if (await btn.isEnabled().catch(() => false)) {
        const tid = (await btn.getAttribute('data-testid')) || `idx-${i}`;
        click('S-sign', `${tid} round ${round}`);
        await btn.click({ timeout: 10_000 });
        await sleep(2500);
        clicked = true;
        break;
      }
    }
    if (!clicked) break;
  }
}

function netAtt(methodRe, urlRe, min = 200, max = 299) {
  return R.network.att.filter((n) => methodRe.test(n.method) && urlRe.test(n.url) && n.status >= min && n.status <= max).length;
}

async function runAttendanceClose(page, portal, token) {
  const apiSheets = await apiListSheets(token);
  R.att.apiListStatus = apiSheets.status;
  R.att.apiSheetSummary = apiSheets.rows.slice(0, 12).map((r) => ({
    id: r.id,
    status: r.status,
    name: r.name,
    period_start: r.period_start || r.start_date,
  }));

  let pick = pickSheetForPayroll(apiSheets.rows);
  R.att.pickReason = pick.reason;

  await navigateToSheetsList(page, portal);
  await page.screenshot({ path: join(SCREEN, '01-att-list.png') });

  if (!pick.sheet) {
    click('S2-create-attempt', 'no matching sheet — FE create');
    const created = await createSheetFe(page);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(2000);
    await navigateToSheetsList(page, portal);
    const again = await apiListSheets(token);
    pick = pickSheetForPayroll(again.rows);
    if (!pick.sheet && created) {
      pick.sheet = again.rows.find((r) => (r.name || '').includes('QA-ATT-CLOSE-PAY')) || again.rows[0];
      pick.reason = 'created_new';
    }
  }

  if (!pick.sheet) {
    R.att.blocked = 'NO_SHEET_CREATE_OR_LIST';
    R.att.gap = 'Cannot find or create attendance sheet for payroll month from FE';
    return false;
  }

  R.att.activeSheetId = pick.sheet.id;
  R.att.statusBefore = pick.sheet.status;

  if (pick.sheet.status === 'closed') {
    R.att.alreadyClosed = true;
    click('S-skip-close', 'sheet already closed');
    return true;
  }

  const rowIdx = await openSheetRow(page, pick.sheet.id);
  R.att.rowIdx = rowIdx;
  await page.screenshot({ path: join(SCREEN, '02-att-detail.png') });

  const submitBtn = page.locator('[data-testid="att-sheet-submit"]');
  if (await submitBtn.isVisible().catch(() => false)) {
    click('S5-submit', 'att-sheet-submit');
    await submitBtn.click({ timeout: 12_000 });
    await sleep(3500);
    R.att.submitPost2xx = netAtt(/^POST$/, /\/submit/);
  }

  R.att.signPanelVisible = await page.locator('[data-testid="att-sign-panel"]').isVisible().catch(() => false);
  R.att.signaturesGet2xx = netAtt(/^GET$/, /\/signatures/);

  await clickEnabledSignSteps(page);
  R.att.signaturesPost2xx = netAtt(/^POST$/, /\/signatures/);

  const sigAfter = await apiGetSignatures(token, pick.sheet.id);
  R.att.canCloseAfterSign = sigAfter.body?.can_close;

  const closeBtn = page.locator('[data-testid="att-sign-close-sheet"]');
  R.att.closeEnabled = await closeBtn.isEnabled().catch(() => false);
  await page.screenshot({ path: join(SCREEN, '03-att-before-close.png') });

  if (R.att.closeEnabled) {
    click('S6-close', 'att-sign-close-sheet');
    await closeBtn.click({ timeout: 10_000 });
    await sleep(3500);
    R.att.closePost2xx = netAtt(/^POST$/, /\/close/);
  } else {
    R.att.closeBlocked = 'close_btn_disabled';
    R.att.missingRoles = sigAfter.body?.missing_mandatory_roles;
  }

  await page.reload({ waitUntil: 'domcontentloaded' });
  await sleep(2500);
  await openAttendanceMenuItem(page, /Bảng chấm công|Sheets/i);
  await sleep(1200);

  const after = await apiGetSheet(token, pick.sheet.id);
  R.att.statusAfter = after.body?.status;
  R.att.closedOk = R.att.statusAfter === 'closed' || R.att.alreadyClosed;
  await page.screenshot({ path: join(SCREEN, '04-att-after-close-f5.png') });
  return R.att.closedOk;
}

async function ensurePayrollList(page, portal) {
  click('P0', `goto payroll ${portal}/hr/payroll`);
  await page.goto(q(portal, '/hr/payroll'), { waitUntil: 'domcontentloaded', timeout: 45_000 });
  await sleep(4000);
  const calcTab = page.locator('.mobile-scroll-tabs button, [role="tab"]').filter({ hasText: /Tính lương/i }).first();
  if (await calcTab.isVisible().catch(() => false)) {
    click('P1', 'tab Tính lương');
    await calcTab.click({ timeout: 10_000 }).catch(() => {});
    await sleep(500);
  }
  await page.locator('[data-testid="pay-batches-precision"]').waitFor({ state: 'visible', timeout: 20_000 }).catch(() => null);
}

async function selectMonthYearInPayDialog(page, month, year) {
  const dialog = page.locator('[data-testid="pay-batch-create-dialog-precision"]');
  await dialog.waitFor({ state: 'visible', timeout: 12_000 });
  const monthSelect = page.locator('[data-testid="pay-batch-create-month-select"]');
  await monthSelect.click({ timeout: 15_000 });
  await page.locator(`[data-testid="pay-batch-create-month-option-${month}"]`).click({ timeout: 10_000 });
  await sleep(300);
  const yearSelect = page.locator('[data-testid="pay-batch-create-year-select"]');
  if (await yearSelect.isVisible().catch(() => false)) {
    await yearSelect.click({ timeout: 10_000 });
    const yearOpt = page.locator(`[data-testid="pay-batch-create-year-option-${year}"]`);
    if (await yearOpt.isVisible().catch(() => false)) await yearOpt.click();
    else await page.getByRole('option', { name: String(year), exact: true }).click();
    await sleep(300);
  }
}

async function openOrCreatePayrollDraft(page, token) {
  const label = `Tháng ${PAYROLL_MONTH}/${PAYROLL_YEAR}`;
  click('P2', `open/create payroll ${label}`);
  const periods = await apiListPayPeriods(token);
  R.pay.periodListStatus = periods.status;
  const match = periods.rows.find(payPeriodMatchesMonth) || periods.rows.find((p) => p.status === 'draft');
  R.pay.targetPeriodId = match?.id;
  R.pay.targetPeriodLabel = match?.period_label ?? label;

  if (match) {
    click('P3', `click payroll row ${match.period_label?.slice(0, 30)}`);
    const row = page.locator('[data-testid="pay-batches-precision"] tbody tr, table tbody tr').filter({
      hasText: new RegExp(match.period_label?.slice(0, 12) || 'QA-PAY', 'i'),
    }).first();
    if (await row.isVisible().catch(() => false)) {
      await row.click({ timeout: 10_000 });
      await sleep(2500);
      if (await page.locator('[data-testid="pay-batch-add-emp-btn"]').isVisible().catch(() => false)) return true;
    }
    const anyRow = page.locator('[data-testid="pay-batches-precision"] tbody tr, table tbody tr').first();
    if (await anyRow.isVisible().catch(() => false)) {
      click('P3-fallback', 'first payroll row');
      await anyRow.click({ timeout: 10_000 });
      await sleep(2500);
      return await page.locator('[data-testid="pay-batch-add-emp-btn"]').isVisible().catch(() => false);
    }
  }

  click('P3-create', 'Lập bảng lương FE create');
  const createTrigger = page.locator('button').filter({ hasText: /^Lập bảng lương$/ }).first();
  if (!(await createTrigger.isVisible().catch(() => false))) return false;
  await createTrigger.click({ timeout: 15_000, force: true });
  await sleep(2000);
  const dialog = page.locator('[data-testid="pay-batch-create-dialog-precision"]');
  await dialog.waitFor({ state: 'visible', timeout: 12_000 });
  await dialog.locator('input').first().fill(`QA-ATT-CLOSE-PAY-${Date.now()}`);
  await selectMonthYearInPayDialog(page, PAYROLL_MONTH, PAYROLL_YEAR);
  await dialog.getByRole('button', { name: /^Lập bảng lương$/ }).click();
  await sleep(4000);
  const post = R.network.pay.filter((n) => n.method === 'POST' && /\/periods/.test(n.url)).slice(-1)[0];
  R.pay.createPost = post;
  return await page.locator('[data-testid="pay-batch-add-emp-btn"]').isVisible().catch(() => false);
}

async function checkPayrollEligibilityFe(page, token, periodId) {
  click('P4', 'Thêm nhân viên → eligibility dialog');
  const addBtn = page.locator('[data-testid="pay-batch-add-emp-btn"]');
  if (!(await addBtn.isVisible().catch(() => false))) {
    R.pay.addEmpMissing = true;
    return null;
  }
  await addBtn.click({ timeout: 10_000 });
  await sleep(1500);
  const dialog = page.locator('[data-testid="pay-batch-add-emp-dialog-precision"]');
  await dialog.waitFor({ state: 'visible', timeout: 10_000 });
  await sleep(1500);
  await page.screenshot({ path: join(SCREEN, '05-pay-eligibility-dialog.png') });

  const apiElig = periodId ? await apiEligibility(token, periodId) : null;
  R.pay.eligibilityApi = apiElig;

  const enabledCb = await dialog.locator('[role="checkbox"]:not([disabled])').count();
  const disabledCb = await dialog.locator('[role="checkbox"][disabled], [role="checkbox"][data-disabled="true"]').count();
  const noClosedVisible = await dialog
    .getByText(/NO_CLOSED_SHEET|Chưa chốt|chấm công/i)
    .first()
    .isVisible()
    .catch(() => false);

  R.pay.eligibilityFe = { enabledCb, disabledCb, noClosedVisible };
  await page.keyboard.press('Escape');
  await sleep(400);
  return apiElig;
}

async function tryEnrollAndF5(page) {
  click('P5', 'enroll attempt AC-PAY-HIRE-04');
  const addBtn = page.locator('[data-testid="pay-batch-add-emp-btn"]');
  await addBtn.click({ timeout: 10_000 });
  await sleep(1200);
  const dialog = page.locator('[data-testid="pay-batch-add-emp-dialog-precision"]');
  await dialog.waitFor({ state: 'visible' });

  const checkboxes = dialog.locator('[role="checkbox"]:not([disabled])');
  const count = await checkboxes.count();
  let clicked = false;
  for (let i = 0; i < count; i++) {
    const cb = checkboxes.nth(i);
    if (await cb.isEnabled().catch(() => false)) {
      await cb.click();
      clicked = true;
      break;
    }
  }
  if (!clicked) {
    await page.keyboard.press('Escape');
    return { enrolled: false, reason: 'no_enabled_checkbox' };
  }

  const enrollBefore = R.network.pay.filter((n) => n.method === 'POST' && /\/enroll/.test(n.url)).length;
  await dialog.getByRole('button', { name: /Thêm \d+ nhân viên/i }).click();
  await sleep(3500);
  const enrollPosts = R.network.pay.filter((n) => n.method === 'POST' && /\/enroll/.test(n.url)).slice(enrollBefore);
  const enrollOk = enrollPosts.some((p) => p.status >= 200 && p.status < 300);

  click('P6', 'F5 AC-PAY-HIRE-05');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await sleep(3500);
  const stillHasEmp = !(await page.getByText(/Chưa có nhân viên nào trong bảng lương/i).isVisible().catch(() => false));
  await page.screenshot({ path: join(SCREEN, '06-pay-after-enroll-f5.png') });

  return { enrolled: enrollOk, enrollPosts, f5Persist: stillHasEmp && enrollOk };
}

function trackNetwork(page) {
  page.on('request', (req) => {
    const u = req.url();
    const method = req.method();
    if (method === 'POST' && /\/enroll/.test(u)) {
      try {
        const body = req.postDataJSON();
        if (body) R.network.enrollBodies.push(body);
      } catch {
        /* */
      }
    }
  });
  page.on('response', (res) => {
    const u = res.url();
    const status = res.status();
    const method = res.request().method();
    if (/attendance-sheets|\/signatures|\/submit|\/close/.test(u)) {
      R.network.att.push({ method, status, url: u.slice(0, 200) });
    }
    if (/\/api\/hrm\/payroll\//.test(u)) {
      R.network.pay.push({ method, status, url: u.slice(0, 200) });
    }
  });
}

function buildMarkdown() {
  const c = R.criteria;
  const lines = [
    '# Evidence — PO-HRM-E2E-LINK-PAY-ATT-CLOSE-01',
    '',
    '| Field | Value |',
    '|-------|-------|',
    '| work_item_id | `PO-HRM-E2E-LINK-PAY-ATT-CLOSE-01` |',
    '| from_role | qa |',
    '| to_role | pm |',
    `| ack_status | **\`${R.ack_status}\`** |`,
    `| verdict | **${R.verdict}** |`,
    `| date | ${new Date().toISOString().slice(0, 10)} |`,
    `| persona | \`${EMAIL}\` / \`Xevn@2026\` · \`company_id=main\` |`,
    '| u65 | zero-seed · browser-only · cấm seed/API fake close |',
    '| honesty | `payroll_e2e_ready=false` |',
    '| parent | `PO-HRM-E2E-LINK-PAY-HIRE-QA-05` · residual `R-PAY-HIRE-NO-ELIGIBLE-U65` |',
    `| env | portal=${R.env.PORTAL} · hrm=${HRM} · commit=${COMMIT} |`,
    '| machine | `docs/qa/evidence/_tmp-po-hrm-e2e-link-pay-att-close-01-browser.json` |',
    `| screenshots | \`docs/qa/evidence/screens/po-hrm-e2e-link-pay-att-close-01/\` |`,
    '',
    '## L0 stack',
    '',
    '| Service | Status |',
    '|---------|--------|',
    `| hrm-api | ${R.l0.hrm} |`,
    `| xbos-api | ${R.l0.xbos} |`,
    `| portal | ${R.l0.portal} |`,
    '',
    '## Journey / UF',
    '',
    '| ID | Path | Result |',
    '|----|------|--------|',
    `| **J-HRM-06c** | Chấm công → Bảng chấm công → ký → Chốt → F5 | ${c.j_hrm_06c ?? '—'} |`,
    `| **UF-HRM-06** / payroll link | Tiền lương → Tháng ${PAYROLL_MONTH}/${PAYROLL_YEAR} → Thêm NV | ${c.payrollLink ?? '—'} |`,
    '',
    '## Acceptance',
    '',
    '| AC | Verdict | Notes |',
    '|----|---------|-------|',
    `| Attendance close from FE (no seed) | ${c.attClose ?? '—'} | |`,
    `| Payroll eligibility eligible_count ≥ 1 | ${c.eligible ?? '—'} | |`,
    `| **AC-PAY-HIRE-04** enroll 2xx | ${c.ac04 ?? '—'} | |`,
    `| **AC-PAY-HIRE-05** F5 persistence | ${c.ac05 ?? '—'} | |`,
    '',
    '## FE click path (ordered)',
    '',
    ...R.clicks.map((x, i) => `${i + 1}. **${x.step}** — ${x.detail}`),
    '',
    '## Attendance phase',
    '',
    '```json',
    JSON.stringify(R.att, null, 2),
    '```',
    '',
    '## Payroll phase',
    '',
    '```json',
    JSON.stringify(R.pay, null, 2),
    '```',
    '',
    '## Residuals',
    '',
    ...R.residuals.map((r) => `- **${r.id}** (${r.sev}) · ${r.owner}: ${r.note}`),
    '',
    '## completion_report',
    '',
    R.completion_report || '',
    '',
    '## next_owner',
    '',
    R.next_owner || '',
    '',
    '## next_dispatch_prompt',
    '',
    '```text',
    R.next_dispatch_prompt || '',
    '```',
    '',
    `## ack_status\n\n**\`${R.ack_status}\`**`,
  ];
  writeFileSync(OUT_MD, lines.join('\n'), 'utf8');
}

async function main() {
  R.env.PORTAL = await pickPortal();
  for (const [k, url] of [
    ['hrm', `${HRM}/api/hrm`],
    ['xbos', `${XBOS}/api/xbos`],
    ['portal', R.env.PORTAL],
  ]) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
      R.l0[k] = r.status;
    } catch (e) {
      R.l0[k] = String(e?.message || e).slice(0, 80);
    }
  }
  if (R.l0.hrm !== 200 || R.l0.xbos !== 200) {
    R.verdict = 'BLOCKED';
    R.ack_status = 'BLOCKED';
    R.att.blocked = 'L0_FAIL';
    buildMarkdown();
    save();
    return;
  }

  const browser = await chromium.launch({ headless: true, executablePath: CHROME });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  trackNetwork(page);
  page.on('pageerror', (e) => R.pageErrors.push(String(e)));
  page.on('console', (msg) => {
    if (msg.type() === 'error') R.consoleErrors.push(msg.text().slice(0, 200));
  });

  try {
    const session = await loginApi();
    await injectPortalAuth(page, session);

    const attClosed = await runAttendanceClose(page, R.env.PORTAL, session.token);
    R.criteria.attClose = attClosed ? 'PASS' : R.att.blocked ? 'BLOCKED' : 'FAIL';
    R.criteria.j_hrm_06c = attClosed ? 'PASS' : R.att.closeBlocked ? 'FAIL' : 'PARTIAL';

    await ensurePayrollList(page, R.env.PORTAL);
    await page.screenshot({ path: join(SCREEN, '05-pay-list.png') });
    let detailOk = false;
    try {
      detailOk = await openOrCreatePayrollDraft(page, session.token);
    } catch (e) {
      R.pay.payrollNavError = String(e?.message || e).slice(0, 200);
    }
    R.pay.detailOpen = detailOk;

    if (!R.pay.targetPeriodId) {
      const periods = await apiListPayPeriods(session.token);
      const match = periods.rows.find(payPeriodMatchesMonth);
      R.pay.targetPeriodId = match?.id;
    }

    let elig = null;
    try {
      elig = await checkPayrollEligibilityFe(page, session.token, R.pay.targetPeriodId);
    } catch (e) {
      R.pay.eligibilityError = String(e?.message || e).slice(0, 200);
      if (R.pay.targetPeriodId) elig = await apiEligibility(session.token, R.pay.targetPeriodId);
    }
    const eligibleCount = elig?.eligible_count ?? 0;
    R.pay.eligibleCount = eligibleCount;
    R.criteria.eligible = eligibleCount >= 1 ? 'PASS' : attClosed ? 'FAIL' : 'BLOCKED';

    if (eligibleCount >= 1) {
      const enroll = await tryEnrollAndF5(page);
      R.pay.enroll = enroll;
      R.criteria.ac04 = enroll.enrolled ? 'PASS' : 'FAIL';
      R.criteria.ac05 = enroll.f5Persist ? 'PASS' : enroll.enrolled ? 'PARTIAL' : 'NOT RUN';
    } else {
      R.criteria.ac04 = 'FAIL';
      R.criteria.ac05 = 'NOT RUN';
      R.pay.enrollSkipped = 'eligible_count=0 after att close attempt';
    }

    R.criteria.payrollLink =
      eligibleCount >= 1 ? 'PASS' : attClosed && eligibleCount === 0 ? 'FAIL' : 'BLOCKED';

    if (!attClosed && R.att.blocked) {
      R.verdict = 'BLOCKED';
      R.ack_status = 'BLOCKED';
      R.residuals.push({
        id: 'R-ATT-CLOSE-FE-GAP',
        sev: 'P0',
        owner: 'dev-fe/dev-be',
        note: R.att.gap || R.att.blocked || 'Cannot complete attendance close from FE under U65',
      });
    } else if (!attClosed) {
      R.verdict = 'FAIL_TO_PM';
      R.ack_status = 'FAIL_TO_PM';
      R.residuals.push({
        id: 'R-ATT-SIGN-CLOSE-INCOMPLETE',
        sev: 'P0',
        owner: 'dev-fe',
        note: `closeEnabled=${R.att.closeEnabled} canClose=${R.att.canCloseAfterSign} missing=${JSON.stringify(R.att.missingRoles || [])}`,
      });
    } else if (eligibleCount >= 1 && R.pay.enroll?.enrolled) {
      R.verdict = 'PASS_TO_PM';
      R.ack_status = 'PASS_TO_PM';
      R.honesty.payroll_e2e_ready = R.pay.enroll?.f5Persist ? true : false;
    } else if (attClosed && eligibleCount === 0) {
      R.verdict = 'FAIL_TO_PM';
      R.ack_status = 'FAIL_TO_PM';
      R.residuals.push({
        id: 'R-PAY-ELIG-NO-MATCH-AFTER-CLOSE',
        sev: 'P0',
        owner: 'dev-be',
        note: 'Sheet closed from FE but payroll eligibility still 0 — month/scope linkage gap',
      });
    } else {
      R.verdict = 'FAIL_TO_PM';
      R.ack_status = 'FAIL_TO_PM';
    }

    R.completion_report = [
      `- **Closed:** L0 PASS; U65 browser chain executed with ${R.clicks.length} logged FE clicks.`,
      `- **Attendance:** ${attClosed ? 'sheet closed (or was closed)' : 'close NOT achieved'} — statusAfter=${R.att.statusAfter}.`,
      `- **Payroll:** eligible_count=${eligibleCount}; AC-04=${R.criteria.ac04}; AC-05=${R.criteria.ac05}.`,
      `- **Honesty:** payroll_e2e_ready=${R.honesty.payroll_e2e_ready}.`,
    ].join('\n');

    if (R.ack_status === 'PASS_TO_PM') {
      R.next_owner = 'qc';
      R.next_dispatch_prompt = `work_item_id: PO-HRM-E2E-LINK-PAY-ATT-CLOSE-QC-01
from_role: pm
to_role: qc
read_first: docs/qa/evidence/po-hrm-e2e-link-pay-att-close-01.md
entry: att close + enroll 2xx + F5 evidence
exit: GO or GWC — payroll_e2e_ready only if enroll+F5 PASS`;
    } else if (R.ack_status === 'BLOCKED') {
      R.next_owner = 'dev-fe';
      R.next_dispatch_prompt = `work_item_id: PO-HRM-E2E-LINK-PAY-ATT-CLOSE-FE-01
from_role: pm
to_role: dev-fe
read_first: docs/qa/evidence/po-hrm-e2e-link-pay-att-close-01.md
entry: QA BLOCKED — ${R.att.blocked || R.att.gap}
exit: READY_FOR_QA — U65 FE path to create/submit/sign/close sheet for payroll month ${PAYROLL_MONTH}/${PAYROLL_YEAR}`;
    } else {
      R.next_owner = R.att.closedOk ? 'dev-be' : 'dev-fe';
      R.next_dispatch_prompt = `work_item_id: PO-HRM-E2E-LINK-PAY-ATT-CLOSE-${R.att.closedOk ? 'BE' : 'FE'}-02
from_role: pm
to_role: ${R.next_owner}
read_first: docs/qa/evidence/po-hrm-e2e-link-pay-att-close-01.md
residuals: ${R.residuals.map((r) => r.id).join(', ')}
exit: fix + READY_FOR_QA retest PO-HRM-E2E-LINK-PAY-ATT-CLOSE-01`;
    }
  } catch (phaseErr) {
    R.phaseError = String(phaseErr?.message || phaseErr).slice(0, 300);
    if (!R.verdict) {
      R.verdict = R.att.closedOk ? 'FAIL_TO_PM' : 'BLOCKED';
      R.ack_status = R.verdict;
    }
  } finally {
    R.endedAt = new Date().toISOString();
    save();
    buildMarkdown();
    await browser.close();
  }
}

main().catch((e) => {
  R.fatal = String(e);
  if (!R.verdict) {
    R.verdict = R.att?.closedOk ? 'FAIL_TO_PM' : 'BLOCKED';
    R.ack_status = R.verdict;
  }
  save();
  buildMarkdown();
  process.exit(R.att?.closedOk ? 0 : 1);
});
