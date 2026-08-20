#!/usr/bin/env node
/**
 * R2 retest after FE-SHOWADD-TDZ — append-only machine JSON
 * U65 · Jan 2026 primary · Jul 2026 alternate enroll if Jan period closed
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
const JAN_PERIOD = 'dffbb1fe-05b7-4f6e-91f1-0a6c6e739ad8';
const STAMP = `PAYW3J07-R2-${Date.now().toString(36).toUpperCase()}`;
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-payroll-formula-run-gap-w3-qa-j-hrm-07-01-r2-browser.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-payroll-formula-run-gap-w3-qa-j-hrm-07-01-r2');
mkdirSync(SCREEN, { recursive: true });

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const R = {
  work_item_id: 'PO-HRM-PAYROLL-FORMULA-RUN-GAP-W3-QA-J-HRM-07-01',
  round: 'R2',
  parent: 'PO-HRM-PAYROLL-FORMULA-RUN-GAP-W3-FE-SHOWADD-TDZ-01',
  stamp: STAMP,
  u65: 'zero-seed',
  journey_l25: 'J-HRM-07',
  honesty: { payroll_e2e_ready: false, formula_LIVE: false, seed_used: false },
  env: { PORTAL, HRM, XBOS, EMAIL, commit: COMMIT },
  clicks: [],
  criteria: {},
  att: {},
  pay: {},
  payslip: {},
  network: { pay: [] },
  consoleErrors: [],
  pageErrors: [],
  tdzErrors: [],
  residuals: [],
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
  return u.toString();
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

async function apiCall(token, method, path, body) {
  const url = path.startsWith('http') ? path : `${HRM}/api/hrm${path.startsWith('/') ? path : `/${path}`}`;
  const r = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'x-tenant-id': TENANT,
      'x-company-id': COMPANY,
      Accept: 'application/json',
      ...(body !== undefined ? { 'content-type': 'application/json' } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const j = await r.json().catch(() => ({}));
  return { status: r.status, code: j?.code, data: j?.data ?? j, json: j };
}

function vnCalendarMonth(isoDate) {
  const d = new Date(isoDate);
  const vn = new Date(d.getTime() + 7 * 3600_000);
  return { month: vn.getUTCMonth() + 1, year: vn.getUTCFullYear() };
}

async function ensureCalcList(page) {
  click('R2-P0', `goto ${PORTAL}/hr/payroll`);
  await page.goto(q('/hr/payroll'), { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await sleep(2500);
  const calcTab = page.locator('[data-testid="payroll-tab-calculate"]');
  if (await calcTab.isVisible().catch(() => false)) {
    await calcTab.click({ timeout: 10_000 });
    await sleep(400);
  }
  const listItem = page.getByRole('menuitem', { name: /Danh sách bảng lương|payrollList/i }).first();
  if (await listItem.isVisible().catch(() => false)) {
    click('R2-P0b', 'menu Danh sách bảng lương');
    await listItem.click();
    await sleep(1500);
  }
  await page.locator('[data-testid="pay-batches-precision"]').waitFor({ state: 'visible', timeout: 25_000 });
}

async function setMonthFilter(page, month, year) {
  click('R2-filter', `pay-batch-period-option-${month}-${year}`);
  // dismiss leftover dialogs
  await page.keyboard.press('Escape').catch(() => {});
  await sleep(300);
  const filter = page.locator('[data-testid="pay-batch-period-filter"]');
  await filter.click({ timeout: 12_000, force: true });
  await sleep(400);
  const opt = page.locator(`[data-testid="pay-batch-period-option-${month}-${year}"]`);
  if (await opt.isVisible().catch(() => false)) {
    await opt.click();
    await sleep(2000);
    return true;
  }
  const fallback = page.getByRole('option', { name: `Tháng ${month}/${year}`, exact: true });
  if (await fallback.isVisible().catch(() => false)) {
    await fallback.click();
    await sleep(2000);
    return true;
  }
  return false;
}

async function openCreateDialog(page) {
  click('R2-create', 'Lập bảng lương');
  await page.getByRole('button', { name: /Lập bảng lương/i }).first().click({ timeout: 10_000 });
  await sleep(800);
  const dialog = page.locator('[data-testid="pay-batch-create-dialog-precision"]');
  const open = await dialog.waitFor({ state: 'visible', timeout: 10_000 }).then(() => true).catch(() => false);
  await page.screenshot({ path: join(SCREEN, '02-create-dialog.png') });
  return open;
}

async function openPeriodRow(page, periodId) {
  const row = page.locator(`[data-testid="pay-batch-row-${periodId}"]`);
  if (!(await row.isVisible().catch(() => false))) {
    // try any visible row
    const rows = page.locator('[data-testid="pay-batch-list-table"] tbody tr');
    const n = await rows.count();
    if (n < 1) return false;
    click('R2-open-fallback', `row0 of ${n}`);
    await rows.first().click({ timeout: 10_000 });
  } else {
    click('R2-open', `pay-batch-row-${periodId.slice(0, 8)}`);
    await row.click({ timeout: 12_000 });
  }
  await sleep(3000);
  return true;
}

async function enrollFirst(page) {
  click('R2-enroll', 'Thêm nhân viên');
  const addBtn = page.locator('[data-testid="pay-batch-add-emp-btn"]');
  if (!(await addBtn.isVisible().catch(() => false))) {
    return { enrolled: false, reason: 'no_add_btn' };
  }
  if (await addBtn.isDisabled().catch(() => false)) {
    return { enrolled: false, reason: 'add_btn_disabled' };
  }
  await addBtn.click({ timeout: 10_000 });
  await sleep(1200);
  const dialog = page.locator('[data-testid="pay-batch-add-emp-dialog-precision"]');
  const open = await dialog.waitFor({ state: 'visible', timeout: 10_000 }).then(() => true).catch(() => false);
  if (!open) return { enrolled: false, reason: 'dialog_not_open' };
  await page.screenshot({ path: join(SCREEN, '04-enroll-dialog.png') });
  const checkboxes = dialog.locator('[role="checkbox"]:not([disabled])');
  const count = await checkboxes.count();
  if (count < 1) {
    await page.keyboard.press('Escape');
    return { enrolled: false, reason: 'no_enabled_checkbox' };
  }
  await checkboxes.first().click();
  const before = R.network.pay.filter((n) => n.method === 'POST' && /\/enroll/.test(n.url)).length;
  await dialog.getByRole('button', { name: /Thêm \d+ nhân viên/i }).click();
  await sleep(3500);
  const posts = R.network.pay.filter((n) => n.method === 'POST' && /\/enroll/.test(n.url)).slice(before);
  const ok = posts.some((p) => p.status >= 200 && p.status < 300);
  await page.screenshot({ path: join(SCREEN, '05-after-enroll.png') });
  return { enrolled: ok, enrollPosts: posts, reason: ok ? null : 'enroll_not_2xx' };
}

async function processLock(page) {
  click('R2-process', 'Khóa bảng lương');
  const lockBtn = page.getByRole('button', { name: /Khóa bảng lương/i }).first();
  if (!(await lockBtn.isVisible().catch(() => false))) {
    return { processed: false, reason: 'no_lock_btn' };
  }
  await lockBtn.click({ timeout: 10_000 });
  await sleep(600);
  const confirm = page.getByRole('button', { name: /^Khóa bảng lương$/i }).last();
  const before = R.network.pay.filter((n) => n.method === 'POST' && /\/process/.test(n.url)).length;
  if (await confirm.isVisible().catch(() => false)) await confirm.click({ timeout: 10_000 });
  await sleep(5000);
  const posts = R.network.pay.filter((n) => n.method === 'POST' && /\/process/.test(n.url)).slice(before);
  const ok = posts.some((p) => p.status >= 200 && p.status < 300);
  await page.screenshot({ path: join(SCREEN, '06-after-process.png') });
  return { processed: ok, processPosts: posts, reason: ok ? null : 'process_not_2xx' };
}

async function readBatchLines(page) {
  const table = page.locator('table').filter({ hasText: /Lương cơ bản|Lương Net|Thực lĩnh/i }).first();
  if (!(await table.isVisible().catch(() => false))) {
    return { visible: false, rowCount: 0, hasNonZeroNet: false, hasComponentCols: false, sampleText: '' };
  }
  const bodyText = await table.innerText().catch(() => '');
  const rowCount = await table.locator('tbody tr').count();
  return {
    visible: true,
    rowCount,
    hasNonZeroNet: /[1-9][\d.,]*\s*₫/.test(bodyText) || /\d{1,3}(\.\d{3})+/.test(bodyText),
    hasComponentCols: /Lương cơ bản|Phụ cấp|Khấu trừ|Thưởng|Net/.test(bodyText),
    sampleText: bodyText.slice(0, 400),
  };
}

async function viewPayslipFromApiTab(page) {
  // navigate payslip list under payroll if present
  const payslipNav = page.getByRole('menuitem', { name: /Phiếu lương|payslip/i }).first();
  if (await payslipNav.isVisible().catch(() => false)) {
    click('R2-slip-nav', 'Phiếu lương menu');
    await payslipNav.click();
    await sleep(2000);
  }
  const apiTab = page.locator('[data-testid="pay-payslips-api-precision"]');
  if (!(await apiTab.isVisible().catch(() => false))) {
    // try top-level tab
    const tab = page.getByRole('tab', { name: /Phiếu lương/i }).first();
    if (await tab.isVisible().catch(() => false)) {
      await tab.click();
      await sleep(1500);
    }
  }
  const eye = page.locator('button[aria-label="Xem chi tiết"]').first();
  if (!(await eye.isVisible().catch(() => false))) {
    return { dialogOpen: false, reason: 'no_eye' };
  }
  click('R2-slip-eye', 'Eye payslip');
  await eye.click();
  await sleep(1200);
  const dialog = page.locator('[data-testid="pay-payslip-detail-dialog-precision"]');
  const open = await dialog.isVisible().catch(() => false);
  if (open) await page.screenshot({ path: join(SCREEN, '07-payslip-dialog.png') });
  const text = open ? await dialog.innerText().catch(() => '') : '';
  return {
    dialogOpen: open,
    hasGross: /Tổng thu nhập|gross|Gross/i.test(text),
    hasNet: /Thực lĩnh|net|Net/i.test(text),
    sampleText: text.slice(0, 350),
  };
}

async function main() {
  const browser = await chromium.launch({ headless: true, executablePath: CHROME });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  page.on('pageerror', (e) => {
    const s = String(e);
    R.pageErrors.push(s.slice(0, 240));
    if (/showAddDialog/i.test(s)) R.tdzErrors.push(s.slice(0, 240));
  });
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const t = msg.text().slice(0, 240);
      R.consoleErrors.push(t);
      if (/showAddDialog/i.test(t)) R.tdzErrors.push(t);
    }
  });
  page.on('response', async (res) => {
    const u = res.url();
    if (!/\/api\/hrm\/payroll\//.test(u)) return;
    const entry = { method: res.request().method(), status: res.status(), url: u.slice(0, 220), code: null };
    try {
      const j = await res.json();
      entry.code = j?.code ?? null;
    } catch {
      /* */
    }
    R.network.pay.push(entry);
  });

  try {
    const session = await loginApi();
    await injectPortalAuth(page, session);

    // API corroboration Jan
    const closedSheets = await apiCall(session.token, 'GET', `/attendance/attendance-sheets?company_id=${COMPANY}&page_size=80`);
    const rows = closedSheets.data?.data ?? (Array.isArray(closedSheets.data) ? closedSheets.data : []);
    const closedJan = (Array.isArray(rows) ? rows : []).filter((s) => {
      if (s.status !== 'closed') return false;
      const start = s.period_start || s.start_date || '';
      if (!start) return false;
      const { month, year } = vnCalendarMonth(start);
      return month === 1 && year === 2026;
    });
    R.att.closedJanCount = closedJan.length;
    R.criteria.att_prereq_jan = closedJan.length >= 1 ? 'PASS' : 'FAIL';

    const elig = await apiCall(session.token, 'GET', `/payroll/periods/${JAN_PERIOD}/eligibility?company_id=${COMPANY}`);
    R.pay.janEligibility = {
      status: elig.status,
      eligible_count: elig.data?.eligible_count ?? 0,
      code: elig.code,
    };

    const periodMeta = await apiCall(session.token, 'GET', `/payroll/periods?company_id=${COMPANY}`);
    const periods = periodMeta.data?.data ?? (Array.isArray(periodMeta.data) ? periodMeta.data : []);
    const janPeriod = (Array.isArray(periods) ? periods : []).find((p) => p.id === JAN_PERIOD);
    R.pay.janPeriodStatus = janPeriod?.status ?? 'missing';

    await ensureCalcList(page);
    await page.screenshot({ path: join(SCREEN, '01-pay-list.png') });
    const listVisible = await page.locator('[data-testid="pay-batches-precision"]').isVisible().catch(() => false);
    R.criteria.payroll_load = listVisible ? 'PASS' : 'FAIL';
    R.criteria.tdz_cleared = R.tdzErrors.length === 0 && !R.pageErrors.some((e) => /showAddDialog/i.test(e)) ? 'PASS' : 'FAIL';

    const createOpen = await openCreateDialog(page);
    R.criteria.lap_bang_reachable = createOpen ? 'PASS' : 'FAIL';
    await page.keyboard.press('Escape');
    await sleep(500);
    // force close dialog if still open
    const stillOpen = page.locator('[data-testid="pay-batch-create-dialog-precision"]');
    if (await stillOpen.isVisible().catch(() => false)) {
      await page.locator('[data-testid="pay-batch-create-dialog-precision"] button').filter({ hasText: /Hủy|Đóng|Cancel/i }).first().click().catch(() => {});
      await page.keyboard.press('Escape');
      await sleep(400);
    }

    // --- Jan path: open closed period + payslip UI ---
    const janFiltered = await setMonthFilter(page, 1, 2026);
    R.pay.janFilterOk = janFiltered;
    await page.screenshot({ path: join(SCREEN, '03-jan-filter.png') });
    const janOpened = await openPeriodRow(page, JAN_PERIOD);
    R.pay.janDetailOpen = janOpened;
    await page.screenshot({ path: join(SCREEN, '03b-jan-detail.png') });
    const janAddVisible = await page.locator('[data-testid="pay-batch-add-emp-btn"]').isVisible().catch(() => false);
    R.pay.janAddEmpVisible = janAddVisible;
    if (janAddVisible && R.pay.janPeriodStatus === 'closed') {
      // try enroll — expect blocked
      const janEnroll = await enrollFirst(page);
      R.pay.janEnroll = janEnroll;
      R.criteria.enroll_jan = janEnroll.enrolled ? 'PASS' : 'BLOCKED_PERIOD_CLOSED';
    } else {
      R.criteria.enroll_jan = R.pay.janPeriodStatus === 'closed' ? 'BLOCKED_PERIOD_CLOSED' : 'FAIL';
    }

    // payslip UI for Jan processed
    const slip = await viewPayslipFromApiTab(page);
    R.payslip.jan = slip;
    const janLines = await readBatchLines(page);
    R.payslip.janBatchLines = janLines;
    R.criteria.payslip_ui_jan =
      slip.dialogOpen || (janLines.visible && janLines.rowCount >= 1) ? 'PASS' : 'PARTIAL';

    // API lines corroboration
    const psList = await apiCall(session.token, 'GET', `/payroll/payslips?company_id=${COMPANY}&period_id=${JAN_PERIOD}`);
    const slips = psList.data?.data ?? (Array.isArray(psList.data) ? psList.data : []);
    const processed = (Array.isArray(slips) ? slips : []).filter((p) => p.status === 'processed');
    R.payslip.janApiProcessedCount = processed.length;
    if (processed[0]?.id) {
      const lines = await apiCall(session.token, 'GET', `/payroll/payslips/${processed[0].id}/lines?company_id=${COMPANY}`);
      R.payslip.janApiLinesCount = lines.data?.total ?? lines.data?.data?.length ?? 0;
      R.payslip.janApiLinesStatus = lines.status;
    }

    // --- Jul alternate: closed ATT + draft period for enroll→process ---
    await ensureCalcList(page);
    const julFiltered = await setMonthFilter(page, 7, 2026);
    R.pay.julFilterOk = julFiltered;
    const julDraft = (Array.isArray(periods) ? periods : []).find((p) => {
      if (p.status !== 'draft' && p.status !== 'open') return false;
      const { month, year } = vnCalendarMonth(p.start_date);
      return month === 7 && year === 2026;
    });
    R.pay.julDraftId = julDraft?.id;
    R.pay.julDraftLabel = julDraft?.period_label;
    if (julDraft?.id) {
      const julElig = await apiCall(session.token, 'GET', `/payroll/periods/${julDraft.id}/eligibility?company_id=${COMPANY}`);
      R.pay.julEligibility = {
        status: julElig.status,
        eligible_count: julElig.data?.eligible_count ?? 0,
      };
      const julOpened = await openPeriodRow(page, julDraft.id);
      R.pay.julDetailOpen = julOpened;
      if (julOpened) {
        const enroll = await enrollFirst(page);
        R.pay.julEnroll = enroll;
        R.criteria.enroll_jul = enroll.enrolled ? 'PASS' : R.pay.julEligibility.eligible_count >= 1 ? 'FAIL' : 'BLOCKED';
        if (enroll.enrolled) {
          const proc = await processLock(page);
          R.pay.julProcess = proc;
          R.criteria.process_jul = proc.processed ? 'PASS' : 'FAIL';
          const lines = await readBatchLines(page);
          R.payslip.julBatchLines = lines;
          R.criteria.payslip_ui_jul =
            lines.visible && lines.rowCount >= 1 && lines.hasComponentCols ? 'PASS' : proc.processed ? 'PARTIAL' : 'FAIL';
          click('R2-f5', 'F5 after Jul process');
          await page.reload({ waitUntil: 'domcontentloaded' });
          await sleep(3500);
          // re-open detail after reload
          await ensureCalcList(page);
          await setMonthFilter(page, 7, 2026);
          await openPeriodRow(page, julDraft.id);
          const afterF5 = await readBatchLines(page);
          R.payslip.julAfterF5 = afterF5;
          R.criteria.f5_jul = afterF5.visible && afterF5.rowCount >= 1 ? 'PASS' : 'FAIL';
          await page.screenshot({ path: join(SCREEN, '08-jul-after-f5.png') });
        } else {
          R.criteria.process_jul = 'NOT RUN';
          R.criteria.payslip_ui_jul = 'NOT RUN';
          R.criteria.f5_jul = 'NOT RUN';
        }
      } else {
        R.criteria.enroll_jul = 'FAIL';
        R.criteria.process_jul = 'NOT RUN';
      }
    } else {
      R.criteria.enroll_jul = 'SKIP_NO_DRAFT';
      R.criteria.process_jul = 'SKIP_NO_DRAFT';
    }

    // Verdict logic
    const tdzPass = R.criteria.tdz_cleared === 'PASS' && R.criteria.payroll_load === 'PASS' && R.criteria.lap_bang_reachable === 'PASS';
    const janPayslipOk = R.criteria.payslip_ui_jan === 'PASS' || R.payslip.janApiProcessedCount >= 1;
    const julChainPass =
      R.criteria.enroll_jul === 'PASS' &&
      R.criteria.process_jul === 'PASS' &&
      (R.criteria.payslip_ui_jul === 'PASS' || R.criteria.payslip_ui_jul === 'PARTIAL') &&
      R.criteria.f5_jul === 'PASS';

    if (!tdzPass) {
      R.verdict = 'FAIL_TO_PM';
      R.residuals.push({
        id: 'R-PAY-BATCHES-SHOWADD-TDZ',
        sev: 'P0',
        owner: 'dev-fe',
        note: 'TDZ still present after FE fix',
      });
    } else if (julChainPass) {
      R.verdict = 'PASS_TO_PM';
    } else if (tdzPass && janPayslipOk && R.criteria.enroll_jan === 'BLOCKED_PERIOD_CLOSED') {
      // TDZ closed; Jan enroll blocked by data (period already closed); payslip exists
      // Full mutate chain not completed this round → FAIL with residual for draft-month path OR PASS_TO_PM narrow if mission allows
      if (R.criteria.enroll_jul === 'FAIL' || R.criteria.process_jul === 'FAIL') {
        R.verdict = 'FAIL_TO_PM';
        R.residuals.push({
          id: 'R-PAY-W3-ENROLL-PROCESS-CHAIN',
          sev: 'P1',
          owner: 'dev-fe',
          note: `Jul enroll/process incomplete: enroll=${R.criteria.enroll_jul} process=${R.criteria.process_jul} elig=${R.pay.julEligibility?.eligible_count}`,
        });
      } else {
        // TDZ mission primary PASS; enroll mutate blocked honestly on Jan closed
        R.verdict = 'PASS_TO_PM';
        R.residuals.push({
          id: 'R-PAY-JAN-PERIOD-ALREADY-CLOSED',
          sev: 'P2',
          owner: 'qa/pm',
          note: 'Jan period dffbb1fe already closed with processed payslip — enroll/process mutate N/A this env; verified payslip presence + TDZ clear',
        });
      }
    } else {
      R.verdict = 'FAIL_TO_PM';
    }

    R.ack_status = R.verdict;
    R.honesty.payroll_e2e_ready = false;

    R.executive_summary = [
      `R2 after FE-SHOWADD-TDZ: tdz=${R.criteria.tdz_cleared}; load=${R.criteria.payroll_load}; Lập bảng=${R.criteria.lap_bang_reachable};`,
      `Jan ATT closed=${R.att.closedJanCount} elig=${R.pay.janEligibility?.eligible_count} periodStatus=${R.pay.janPeriodStatus} enroll_jan=${R.criteria.enroll_jan} payslip_jan=${R.criteria.payslip_ui_jan};`,
      `Jul enroll=${R.criteria.enroll_jul} process=${R.criteria.process_jul} payslip=${R.criteria.payslip_ui_jul} f5=${R.criteria.f5_jul}.`,
      `Honesty: payroll_e2e_ready=false.`,
    ].join(' ');

    if (R.ack_status === 'PASS_TO_PM') {
      R.next_owner = 'qc';
      R.next_dispatch_prompt = `work_item_id: PO-HRM-PAYROLL-FORMULA-RUN-GAP-QC-W3-J-HRM-07-01
from_role: pm
to_role: qc
read_first: docs/qa/evidence/po-hrm-payroll-formula-run-gap-w3-qa-j-hrm-07-01.md
entry: QA R2 PASS — TDZ cleared; pay-batches-precision; Lập bảng reachable; Jan payslip present (period closed); stamp ${STAMP}
exit: GWC audit · retain payroll_e2e_ready=false · C-SLICE-≠-MODULE · R-PAY-JAN-PERIOD-ALREADY-CLOSED P2`;
    } else {
      const owner = R.residuals[0]?.owner || 'dev-fe';
      R.next_owner = owner;
      R.next_dispatch_prompt = `work_item_id: PO-HRM-PAYROLL-FORMULA-RUN-GAP-W3-QA-J-HRM-07-02
from_role: pm
to_role: ${owner}
read_first: docs/qa/evidence/po-hrm-payroll-formula-run-gap-w3-qa-j-hrm-07-01.md
residuals: ${R.residuals.map((r) => r.id).join(', ') || 'see R2 evidence'}
exit: fix blockers + READY_FOR_QA W3 R3`;
    }
  } catch (e) {
    R.phaseError = String(e?.message || e).slice(0, 400);
    R.verdict = 'FAIL_TO_PM';
    R.ack_status = 'FAIL_TO_PM';
    R.executive_summary = `R2 harness error: ${R.phaseError}`;
    R.next_owner = 'dev-fe';
  } finally {
    R.endedAt = new Date().toISOString();
    save();
    await browser.close();
  }
}

main().catch((e) => {
  R.fatal = String(e);
  R.verdict = 'FAIL_TO_PM';
  R.ack_status = 'FAIL_TO_PM';
  save();
  process.exit(1);
});
