#!/usr/bin/env node
/**
 * PO-HRM-E2E-LINK-PAY-ATT-CLOSE-QA-02 — U65 retest after FE-01 + BE-01
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
const PAYROLL_MONTH = Number(process.env.QA_PAYROLL_MONTH || 1);
const PAYROLL_YEAR = Number(process.env.QA_PAYROLL_YEAR || 2026);
const ATT_START_VI = `01/${String(PAYROLL_MONTH).padStart(2, '0')}/${PAYROLL_YEAR}`;
const ATT_END_VI = `28/${String(PAYROLL_MONTH).padStart(2, '0')}/${PAYROLL_YEAR}`;
const SHEET_NAME = `QA-ATT-CLOSE-PAY-QA02-${Date.now()}`;
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-e2e-link-pay-att-close-qa-02-browser.json');
const OUT_MD = resolve(ROOT, 'docs/qa/evidence/po-hrm-e2e-link-pay-att-close-qa-02.md');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-e2e-link-pay-att-close-qa-02');
mkdirSync(SCREEN, { recursive: true });

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const R = {
  work_item_id: 'PO-HRM-E2E-LINK-PAY-ATT-CLOSE-QA-02',
  parent: 'PO-HRM-E2E-LINK-PAY-ATT-CLOSE-FE-01 + BE-01',
  u65: 'zero-seed',
  hdsd_align:
    'Chấm công → Bảng chấm công → tạo Jan 2026 → gửi chờ ký → ký NV/QL/HCNS → Chốt → Tiền lương → Thêm NV',
  honesty: { payroll_e2e_ready: false },
  env: { PORTAL: null, HRM, XBOS, EMAIL, commit: COMMIT },
  payrollTarget: { month: PAYROLL_MONTH, year: PAYROLL_YEAR },
  attPeriod: { start: ATT_START_VI, end: ATT_END_VI },
  l0: {},
  clicks: [],
  att: {},
  pay: {},
  network: { att: [], pay: [], enrollBodies: [], createSheetId: null },
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

function vnCalendarMonth(isoDate) {
  const d = new Date(isoDate);
  const vn = new Date(d.getTime() + 7 * 3600_000);
  return { month: vn.getUTCMonth() + 1, year: vn.getUTCFullYear() };
}

function payPeriodMatchesMonth(row) {
  if (!row?.start_date) return false;
  const { month, year } = vnCalendarMonth(row.start_date);
  return month === PAYROLL_MONTH && year === PAYROLL_YEAR;
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
  }
}

async function readActiveSheetId(page) {
  const weekly = page.locator('[data-testid="att-weekly-precision"]');
  if (await weekly.count()) {
    return weekly.getAttribute('data-active-sheet-id');
  }
  const any = page.locator('[data-active-sheet-id]').first();
  if (await any.count()) return any.getAttribute('data-active-sheet-id');
  return null;
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
  await sleep(4000);
  const postOk = R.network.att.some(
    (n) => n.method === 'POST' && /attendance-sheets/.test(n.url) && n.status >= 200 && n.status < 300,
  );
  R.att.createPost2xx = postOk;
  R.att.createdSheetId = R.network.createSheetId;
  const activeId = await readActiveSheetId(page);
  R.att.dataActiveSheetId = activeId;
  R.att.activeSheetIdMatch =
    R.network.createSheetId && activeId ? R.network.createSheetId === activeId : null;
  return postOk;
}

async function openSheetRow(page, sheetId) {
  const activeId = await readActiveSheetId(page);
  if (activeId === sheetId) {
    click('S4-open', `already active sheet ${sheetId.slice(0, 8)} via data-active-sheet-id`);
    return 0;
  }
  const byTestId = page.locator(`[data-testid="att-sheet-row-${sheetId}"]`);
  if (await byTestId.count()) {
    click('S4-open', `att-sheet-row-${sheetId.slice(0, 8)} testid click`);
    await byTestId.click({ timeout: 12_000 });
    await sleep(2800);
    return 0;
  }
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
  if (needle) {
    R.att.rowNavGap = 'target_sheet_not_in_list';
    return -1;
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
  return R.network.att.filter(
    (n) => methodRe.test(n.method) && urlRe.test(n.url) && n.status >= min && n.status <= max,
  ).length;
}

async function runAttendanceClose(page, portal, token) {
  const apiSheets = await apiListSheets(token);
  R.att.apiListStatus = apiSheets.status;

  let pick = pickSheetForPayroll(apiSheets.rows);
  R.att.pickReason = pick.reason;

  await navigateToSheetsList(page, portal);
  await page.screenshot({ path: join(SCREEN, '01-att-list.png') });

  if (!pick.sheet || pick.sheet.status !== 'closed') {
    if (!pick.sheet || pick.reason === 'no_payroll_month_sheet') {
      click('S2-create-attempt', 'no Jan closed sheet — FE create Jan 2026');
      const created = await createSheetFe(page);
      if (!created) {
        R.att.blocked = 'CREATE_FAILED';
        return false;
      }
      await page.screenshot({ path: join(SCREEN, '02-att-after-create-auto-nav.png') });
      const again = await apiListSheets(token);
      pick = pickSheetForPayroll(again.rows);
      if (!pick.sheet && R.network.createSheetId) {
        const found = again.rows.find((r) => r.id === R.network.createSheetId);
        if (found) pick = { sheet: found, reason: 'created_new_by_id' };
      }
      if (!pick.sheet) {
        pick.sheet = again.rows.find((r) => (r.name || '').includes('QA-ATT-CLOSE-PAY-QA02')) || null;
        pick.reason = pick.sheet ? 'created_new_by_name' : pick.reason;
      }
    }
  }

  if (!pick.sheet) {
    R.att.blocked = 'NO_SHEET';
    return false;
  }

  R.att.activeSheetId = pick.sheet.id;
  R.att.statusBefore = pick.sheet.status;

  if (pick.sheet.status === 'closed') {
    R.att.alreadyClosed = true;
    click('S-skip-close', 'Jan sheet already closed');
    const activeId = await readActiveSheetId(page);
    R.att.dataActiveSheetId = activeId;
    return true;
  }

  const rowIdx = await openSheetRow(page, pick.sheet.id);
  if (rowIdx < 0) {
    R.att.blocked = 'ROW_NAV_FAIL';
    R.att.gap = `Cannot open sheet ${pick.sheet.id} from att-sheets list`;
    return false;
  }
  R.att.dataActiveSheetId = await readActiveSheetId(page);
  R.att.activeSheetIdMatch = R.att.dataActiveSheetId === pick.sheet.id;
  await page.screenshot({ path: join(SCREEN, '03-att-detail.png') });

  const holdDraft = page.locator('[data-testid="att-sign-panel-hold-draft"]');
  const submitBtn = page.locator('[data-testid="att-sheet-submit"]');
  R.att.holdDraftVisible = await holdDraft.isVisible().catch(() => false);

  if (await submitBtn.isVisible().catch(() => false)) {
    click('S5-submit', 'att-sheet-submit');
    await submitBtn.click({ timeout: 12_000 });
    await sleep(4000);
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
  await page.screenshot({ path: join(SCREEN, '04-att-before-close.png') });

  if (R.att.closeEnabled) {
    click('S6-close', 'att-sign-close-sheet');
    await closeBtn.click({ timeout: 10_000 });
    await sleep(3500);
    R.att.closePost2xx = netAtt(/^POST$/, /\/close/);
  } else {
    R.att.closeBlocked = 'close_btn_disabled';
    R.att.missingRoles = sigAfter.body?.missing_mandatory_roles;
  }

  click('S7-f5', 'F5 attendance after close');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await sleep(2500);
  await openAttendanceMenuItem(page, /Bảng chấm công|Sheets/i);
  await sleep(1200);

  const after = await apiGetSheet(token, pick.sheet.id);
  R.att.statusAfter = after.body?.status;
  R.att.closedOk = R.att.statusAfter === 'closed' || R.att.alreadyClosed;
  await page.screenshot({ path: join(SCREEN, '05-att-after-close-f5.png') });
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

async function setPayrollMonthFilter(page, month, year) {
  click('P2-filter', `set payroll filter Tháng ${month}/${year}`);
  const monthSelect = page.locator('button[role="combobox"]').filter({ hasText: /^Tháng \d+\/\d+$/ }).first();
  if (await monthSelect.isVisible().catch(() => false)) {
    await monthSelect.click({ timeout: 10_000 });
    await sleep(400);
    const opt = page.getByRole('option', { name: `Tháng ${month}/${year}`, exact: true });
    if (await opt.isVisible().catch(() => false)) {
      await opt.click();
      await sleep(2000);
      return true;
    }
  }
  return false;
}

async function openPayrollDraft(page, token) {
  const label = `Tháng ${PAYROLL_MONTH}/${PAYROLL_YEAR}`;
  click('P2', `open payroll ${label}`);
  await setPayrollMonthFilter(page, PAYROLL_MONTH, PAYROLL_YEAR);
  const periods = await apiListPayPeriods(token);
  R.pay.periodListStatus = periods.status;
  const match = periods.rows.find(payPeriodMatchesMonth);
  R.pay.targetPeriodId = match?.id;
  R.pay.targetPeriodLabel = match?.period_label ?? label;
  R.pay.targetPeriodStart = match?.start_date;

  if (!match) return false;

  await page.locator('table tbody tr').first().waitFor({ state: 'visible', timeout: 20_000 }).catch(() => null);
  const search = page.locator('input[placeholder="Tìm kiếm bảng lương..."]');
  if (await search.isVisible().catch(() => false)) {
    await search.fill('');
    await sleep(400);
    await search.fill(match.period_label?.slice(0, 18) || 'QA-PAY-HIRE-05');
    await sleep(1200);
  }

  const patterns = [
    match.period_label?.slice(0, 18),
    'QA-PAY-HIRE-05',
    `Tháng ${PAYROLL_MONTH}/${PAYROLL_YEAR}`,
  ].filter(Boolean);

  for (const pat of patterns) {
    const row = page.getByRole('row').filter({ hasText: new RegExp(pat.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') }).first();
    if (await row.isVisible().catch(() => false)) {
      click('P3', `click payroll row match ${pat}`);
      await row.click({ timeout: 12_000 });
      await sleep(3500);
      if (await page.locator('[data-testid="pay-batch-add-emp-btn"]').isVisible().catch(() => false)) {
        return true;
      }
    }
  }

  const menuBtn = page
    .locator('table tbody tr')
    .filter({ hasText: /QA-PAY-HIRE-05/i })
    .locator('button')
    .filter({ has: page.locator('svg') })
    .last();
  if (await menuBtn.isVisible().catch(() => false)) {
    click('P3-menu', 'payroll row dropdown Xem chi tiết');
    await menuBtn.click();
    await sleep(500);
    const viewItem = page.getByRole('menuitem', { name: /Xem chi tiết/i }).first();
    if (await viewItem.isVisible().catch(() => false)) {
      await viewItem.click();
      await sleep(3500);
    }
  }

  return await page.locator('[data-testid="pay-batch-add-emp-btn"]').isVisible().catch(() => false);
}

async function checkPayrollEligibilityFe(page, token, periodId) {
  click('P4', 'Thêm nhân viên → eligibility');
  const addBtn = page.locator('[data-testid="pay-batch-add-emp-btn"]');
  if (!(await addBtn.isVisible().catch(() => false))) {
    R.pay.addEmpMissing = true;
    if (periodId) return await apiEligibility(token, periodId);
    return null;
  }
  await addBtn.click({ timeout: 10_000 });
  await sleep(1500);
  const dialog = page.locator('[data-testid="pay-batch-add-emp-dialog-precision"]');
  await dialog.waitFor({ state: 'visible', timeout: 10_000 });
  await sleep(1500);
  await page.screenshot({ path: join(SCREEN, '06-pay-eligibility-dialog.png') });

  const apiElig = periodId ? await apiEligibility(token, periodId) : null;
  R.pay.eligibilityApi = apiElig;

  const enabledCb = await dialog.locator('[role="checkbox"]:not([disabled])').count();
  R.pay.eligibilityFe = { enabledCb };
  await page.keyboard.press('Escape');
  await sleep(400);
  return apiElig;
}

async function tryEnrollAndF5(page) {
  click('P5', 'AC-PAY-HIRE-04 enroll');
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
  const stillHasEmp = !(await page
    .getByText(/Chưa có nhân viên nào trong bảng lương/i)
    .isVisible()
    .catch(() => false));
  await page.screenshot({ path: join(SCREEN, '07-pay-after-enroll-f5.png') });

  return { enrolled: enrollOk, enrollPosts, f5Persist: stillHasEmp && enrollOk };
}

function trackNetwork(page) {
  page.on('response', async (res) => {
    const u = res.url();
    const status = res.status();
    const method = res.request().method();
    if (/attendance-sheets|\/signatures|\/submit|\/close/.test(u)) {
      R.network.att.push({ method, status, url: u.slice(0, 220) });
      if (method === 'POST' && /attendance-sheets$/.test(u.split('?')[0]) && status >= 200 && status < 300) {
        try {
          const j = await res.json();
          const id = j?.data?.id ?? j?.id;
          if (id) R.network.createSheetId = id;
        } catch {
          /* */
        }
      }
    }
    if (/\/api\/hrm\/payroll\//.test(u)) {
      R.network.pay.push({ method, status, url: u.slice(0, 220) });
    }
  });
}

function buildMarkdown() {
  const c = R.criteria;
  const lines = [
    '# Evidence — PO-HRM-E2E-LINK-PAY-ATT-CLOSE-QA-02',
    '',
    '| Field | Value |',
    '|-------|-------|',
    '| work_item_id | `PO-HRM-E2E-LINK-PAY-ATT-CLOSE-QA-02` |',
    '| from_role | qa |',
    '| to_role | pm |',
    `| ack_status | **\`${R.ack_status}\`** |`,
    `| verdict | **${R.verdict}** |`,
    `| date | ${new Date().toISOString().slice(0, 10)} |`,
    `| persona | \`${EMAIL}\` / \`Xevn@2026\` · \`company_id=main\` |`,
    '| u65 | zero-seed · browser-only · cấm seed / payroll_e2e_ready=true |',
    `| honesty | \`payroll_e2e_ready=${R.honesty.payroll_e2e_ready}\` |`,
    '| parent | FE-01 + BE-01 retest after QA-01 FAIL |',
    `| env | portal=${R.env.PORTAL} · hrm=${HRM} · commit=${COMMIT} |`,
    '| machine | `docs/qa/evidence/_tmp-po-hrm-e2e-link-pay-att-close-qa-02-browser.json` |',
    `| screenshots | \`docs/qa/evidence/screens/po-hrm-e2e-link-pay-att-close-qa-02/\` |`,
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
    `| **J-HRM-06c** | Bảng chấm công Jan 2026 → submit → 3× ký → Chốt → F5 | ${c.j_hrm_06c ?? '—'} |`,
    `| **UF-HRM-06** | Tiền lương Tháng ${PAYROLL_MONTH}/${PAYROLL_YEAR} → eligibility | ${c.payrollLink ?? '—'} |`,
    `| **AC-PAY-HIRE-04** | Enroll 2xx | ${c.ac04 ?? '—'} |`,
    `| **AC-PAY-HIRE-05** | F5 persistence | ${c.ac05 ?? '—'} |`,
    '',
    '## Acceptance (QA-02 scope)',
    '',
    '| Check | Verdict | Notes |',
    '|-------|---------|-------|',
    `| Create Jan 2026 → \`data-active-sheet-id\` = created id | ${c.activeSheetId ?? '—'} | |`,
    `| Submit → 3× sign → close 201 | ${c.attClose ?? '—'} | |`,
    `| Payroll eligibility \`eligible_count ≥ 1\` | ${c.eligible ?? '—'} | |`,
    `| AC-PAY-HIRE-04 enroll 2xx | ${c.ac04 ?? '—'} | |`,
    `| AC-PAY-HIRE-05 F5 | ${c.ac05 ?? '—'} | |`,
    '',
    '## FE click path',
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
    '## Network (att close chain)',
    '',
    '```json',
    JSON.stringify(R.network.att.filter((n) => /submit|signatures|close/.test(n.url)).slice(-12), null, 2),
    '```',
    '',
    '## Residuals',
    '',
    ...(R.residuals.length
      ? R.residuals.map((r) => `- **${r.id}** (${r.sev}) · ${r.owner}: ${r.note}`)
      : ['- none']),
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
    R.criteria.attClose = attClosed ? 'PASS' : 'FAIL';
    R.criteria.activeSheetId =
      R.att.activeSheetIdMatch === true
        ? 'PASS'
        : R.att.activeSheetIdMatch === false
          ? 'FAIL'
          : R.att.alreadyClosed
            ? 'N/A'
            : 'NOT CHECKED';
    R.criteria.j_hrm_06c = attClosed ? 'PASS' : 'FAIL';

    await ensurePayrollList(page, R.env.PORTAL);
    await page.screenshot({ path: join(SCREEN, '08-pay-list.png') });
    R.pay.detailOpen = await openPayrollDraft(page, session.token);

    if (!R.pay.targetPeriodId) {
      const periods = await apiListPayPeriods(session.token);
      R.pay.targetPeriodId = periods.rows.find(payPeriodMatchesMonth)?.id;
    }

    let elig = await checkPayrollEligibilityFe(page, session.token, R.pay.targetPeriodId);
    const eligibleCount = elig?.eligible_count ?? 0;
    R.pay.eligibleCount = eligibleCount;
    R.criteria.eligible = eligibleCount >= 1 ? 'PASS' : attClosed ? 'FAIL' : 'BLOCKED';

    if (eligibleCount >= 1 && R.pay.detailOpen) {
      const enroll = await tryEnrollAndF5(page);
      R.pay.enroll = enroll;
      R.criteria.ac04 = enroll.enrolled ? 'PASS' : 'FAIL';
      R.criteria.ac05 = enroll.f5Persist ? 'PASS' : enroll.enrolled ? 'PARTIAL' : 'NOT RUN';
    } else if (eligibleCount >= 1) {
      R.criteria.ac04 = 'FAIL';
      R.criteria.ac05 = 'NOT RUN';
      R.pay.enrollSkipped = 'payroll detail not open — R-PAY-PERIOD-ROW-NAV';
      R.residuals.push({
        id: 'R-PAY-PERIOD-ROW-NAV',
        sev: 'P1',
        owner: 'dev-fe',
        note: 'eligible_count≥1 but pay-batch-add-emp-btn not reachable from list',
      });
    } else {
      R.criteria.ac04 = 'FAIL';
      R.criteria.ac05 = 'NOT RUN';
      R.pay.enrollSkipped = 'eligible_count=0';
    }

    R.criteria.payrollLink = eligibleCount >= 1 ? 'PASS' : attClosed ? 'FAIL' : 'BLOCKED';

    const allPass =
      attClosed &&
      eligibleCount >= 1 &&
      R.criteria.ac04 === 'PASS' &&
      R.criteria.ac05 === 'PASS' &&
      (R.criteria.activeSheetId === 'PASS' || R.criteria.activeSheetId === 'N/A');

    if (allPass) {
      R.verdict = 'PASS_TO_PM';
      R.ack_status = 'PASS_TO_PM';
      R.honesty.payroll_e2e_ready = true;
    } else {
      R.verdict = 'FAIL_TO_PM';
      R.ack_status = 'FAIL_TO_PM';
      if (!attClosed) {
        R.residuals.push({
          id: 'R-ATT-SHEET-SUBMIT-SIGN-GAP',
          sev: 'P0',
          owner: 'dev-fe',
          note: `statusAfter=${R.att.statusAfter} closeEnabled=${R.att.closeEnabled}`,
        });
      }
      if (attClosed && eligibleCount === 0) {
        R.residuals.push({
          id: 'R-PAY-ATT-MONTH-LINK',
          sev: 'P0',
          owner: 'dev-be',
          note: 'Jan closed sheet exists but eligibility still 0',
        });
      }
      if (R.criteria.activeSheetId === 'FAIL') {
        R.residuals.push({
          id: 'R-ATT-ACTIVE-SHEET-ID-MISMATCH',
          sev: 'P1',
          owner: 'dev-fe',
          note: `created=${R.network.createSheetId} active=${R.att.dataActiveSheetId}`,
        });
      }
      if (eligibleCount >= 1 && R.criteria.ac04 !== 'PASS') {
        R.residuals.push({ id: 'R-PAY-ENROLL-FE', sev: 'P1', owner: 'dev-fe', note: 'eligible but enroll failed' });
      }
    }

    R.completion_report = [
      `- **Closed:** L0 PASS; U65 browser QA-02 with ${R.clicks.length} FE clicks.`,
      `- **FE-01:** data-active-sheet-id match=${R.att.activeSheetIdMatch}; createPost2xx=${R.att.createPost2xx}.`,
      `- **Attendance:** closed=${attClosed}; statusAfter=${R.att.statusAfter}; signaturesPost=${R.att.signaturesPost2xx}; closePost=${R.att.closePost2xx}.`,
      `- **BE-01:** eligible_count=${eligibleCount}; AC-04=${R.criteria.ac04}; AC-05=${R.criteria.ac05}.`,
      `- **Honesty:** payroll_e2e_ready=${R.honesty.payroll_e2e_ready}.`,
    ].join('\n');

    if (R.ack_status === 'PASS_TO_PM') {
      R.next_owner = 'qc';
      R.next_dispatch_prompt = `work_item_id: PO-HRM-E2E-LINK-PAY-ATT-CLOSE-QC-01
from_role: pm
to_role: qc
read_first: docs/qa/evidence/po-hrm-e2e-link-pay-att-close-qa-02.md
entry: Jan 2026 att close + eligible_count≥1 + enroll 2xx + F5 PASS
exit: GO — payroll_e2e_ready=true only with full chain evidence`;
    } else {
      R.next_owner = !attClosed ? 'dev-fe' : eligibleCount === 0 ? 'dev-be' : 'dev-fe';
      R.next_dispatch_prompt = `work_item_id: PO-HRM-E2E-LINK-PAY-ATT-CLOSE-QA-03
from_role: pm
to_role: ${R.next_owner}
read_first: docs/qa/evidence/po-hrm-e2e-link-pay-att-close-qa-02.md
residuals: ${R.residuals.map((r) => r.id).join(', ') || 'see evidence'}
exit: fix + READY_FOR_QA retest QA-02 chain`;
    }
  } catch (phaseErr) {
    R.phaseError = String(phaseErr?.message || phaseErr).slice(0, 300);
    R.verdict = 'FAIL_TO_PM';
    R.ack_status = 'FAIL_TO_PM';
  } finally {
    R.endedAt = new Date().toISOString();
    save();
    buildMarkdown();
    await browser.close();
  }
}

main().catch((e) => {
  R.fatal = String(e);
  R.verdict = 'FAIL_TO_PM';
  R.ack_status = 'FAIL_TO_PM';
  save();
  buildMarkdown();
  process.exit(1);
});
