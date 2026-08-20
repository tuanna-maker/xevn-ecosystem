#!/usr/bin/env node
/**
 * PO-HRM-PAYROLL-FORMULA-RUN-GAP-W3-QA-PROCESS-POST-01
 * U65 browser — draft Sep 2026 period with ATT closed (not Jan dffbb1fe)
 * Capture enroll (or preexisting) → POST /process 2xx → payslip UI → F5
 * Honesty: payroll_e2e_ready=false · DENY formula LIVE unless non-zero + AC map
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
const PERIOD = 'd92d3bbb-f53a-4151-9b12-0ebe9dd27d25';
const MONTH = 9;
const YEAR = 2026;
const STAMP = `PAYW3PROC-${Date.now().toString(36).toUpperCase()}`;
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(
  ROOT,
  'docs/qa/evidence/_tmp-po-hrm-payroll-formula-run-gap-w3-qa-process-post-01.json',
);
const SCREEN = resolve(
  ROOT,
  'docs/qa/evidence/screens/po-hrm-payroll-formula-run-gap-w3-qa-process-post-01',
);
mkdirSync(SCREEN, { recursive: true });

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const R = {
  work_item_id: 'PO-HRM-PAYROLL-FORMULA-RUN-GAP-W3-QA-PROCESS-POST-01',
  parent: 'PO-HRM-PAYROLL-FORMULA-RUN-GAP-QC-W3-J-HRM-07-01',
  stamp: STAMP,
  u65: 'zero-seed',
  journey_l25: 'J-HRM-07',
  honesty: {
    payroll_e2e_ready: false,
    formula_LIVE: false,
    seed_used: false,
    module_uat_claim: false,
  },
  env: { PORTAL, HRM, XBOS, EMAIL, commit: COMMIT },
  target: {
    periodId: PERIOD,
    month: MONTH,
    year: YEAR,
    note: 'Sep draft + ATT closed same month; NOT Jan dffbb1fe',
  },
  clicks: [],
  criteria: {},
  att: {},
  pay: {},
  payslip: {},
  network: [],
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

async function apiCall(token, method, path) {
  const url = `${HRM}/api/hrm${path.startsWith('/') ? path : `/${path}`}`;
  const r = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'x-tenant-id': TENANT,
      'x-company-id': COMPANY,
      Accept: 'application/json',
    },
  });
  const j = await r.json().catch(() => ({}));
  return { status: r.status, code: j?.code, data: j?.data ?? j };
}

function vnMonthYear(iso) {
  const d = new Date(iso);
  const vn = new Date(d.getTime() + 7 * 3600_000);
  return { month: vn.getUTCMonth() + 1, year: vn.getUTCFullYear() };
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
  await page.locator('[data-testid="pay-batches-precision"]').waitFor({ state: 'visible', timeout: 25_000 });
}

async function setMonthFilter(page, month, year) {
  click('filter', `pay-batch-period-option-${month}-${year}`);
  await page.keyboard.press('Escape').catch(() => {});
  await sleep(300);
  await page.locator('[data-testid="pay-batch-period-filter"]').click({ timeout: 12_000, force: true });
  await sleep(400);
  const opt = page.locator(`[data-testid="pay-batch-period-option-${month}-${year}"]`);
  if (await opt.isVisible().catch(() => false)) await opt.click();
  else await page.getByRole('option', { name: `Tháng ${month}/${year}`, exact: true }).click();
  await sleep(2000);
}

async function capturePayslipTable(page) {
  const table = page.locator('table').filter({ hasText: /Lương cơ bản|Lương Net/i }).first();
  const visible = await table.isVisible().catch(() => false);
  const text = visible ? await table.innerText().catch(() => '') : '';
  const rowCount = visible ? await table.locator('tbody tr').count().catch(() => 0) : 0;
  const hasNonZero = /[1-9][\d.,]*\s*₫/.test(text);
  return {
    visible,
    rowCount,
    hasComponentCols: /Lương cơ bản|Phụ cấp|Khấu trừ/.test(text),
    hasNonZero,
    sample: text.slice(0, 500),
  };
}

const session = await loginApi();

// --- API prereq: ATT closed Sep + period draft ---
const sheets = await apiCall(
  session.token,
  'GET',
  `/attendance/attendance-sheets?company_id=${COMPANY}&page_size=80`,
);
const sheetRows = sheets.data?.data ?? (Array.isArray(sheets.data) ? sheets.data : []);
const closedSep = sheetRows.filter((s) => {
  if (String(s.status || '').toLowerCase() !== 'closed') return false;
  const { month, year } = vnMonthYear(s.start_date || s.end_date);
  return month === MONTH && year === YEAR;
});
R.att = {
  closedSepCount: closedSep.length,
  closedSepIds: closedSep.map((s) => s.id?.slice(0, 8)),
  sample: closedSep[0]
    ? {
        id: closedSep[0].id,
        name: closedSep[0].name,
        start: closedSep[0].start_date,
        end: closedSep[0].end_date,
      }
    : null,
};
R.criteria.att_closed_same_month = closedSep.length >= 1 ? 'PASS' : 'FAIL';

const periods = await apiCall(session.token, 'GET', `/payroll/periods?company_id=${COMPANY}`);
const periodList = periods.data?.data ?? (Array.isArray(periods.data) ? periods.data : []);
const target = periodList.find((p) => p.id === PERIOD);
R.pay.periodBefore = target
  ? {
      id: target.id,
      status: target.status,
      employee_count: target.employee_count,
      start_date: target.start_date,
      end_date: target.end_date,
      period_label: target.period_label,
    }
  : null;
R.criteria.period_draft = target?.status === 'draft' ? 'PASS' : `FAIL_${target?.status || 'MISSING'}`;

const elig = await apiCall(
  session.token,
  'GET',
  `/payroll/periods/${PERIOD}/eligibility?company_id=${COMPANY}`,
);
R.pay.eligibility = {
  status: elig.status,
  code: elig.code,
  eligible_count: elig.data?.eligible_count,
  ineligible_count: elig.data?.ineligible_count,
};
save();

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
    const t = msg.text().slice(0, 200);
    R.consoleErrors.push(t);
    if (/showAddDialog/i.test(t)) R.tdzErrors.push(t);
  }
});
page.on('response', async (res) => {
  const u = res.url();
  if (!/\/api\/hrm\/payroll\//.test(u)) return;
  const entry = {
    method: res.request().method(),
    status: res.status(),
    url: u.slice(0, 260),
    code: null,
  };
  try {
    entry.code = (await res.json())?.code || null;
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
    }
  },
  { s: session },
);

try {
  await ensureCalcList(page);
  R.criteria.payroll_load = 'PASS';
  R.criteria.tdz_cleared = R.tdzErrors.length ? 'FAIL' : 'PASS';
  await page.screenshot({ path: join(SCREEN, '01-pay-list.png'), fullPage: false });

  await setMonthFilter(page, MONTH, YEAR);
  click('open', `pay-batch-row-${PERIOD}`);
  await page.locator(`[data-testid="pay-batch-row-${PERIOD}"]`).click({ timeout: 15_000 });
  await sleep(3500);
  await page.screenshot({ path: join(SCREEN, '02-sep-detail-before.png'), fullPage: false });

  const bodyText = await page.locator('body').innerText().catch(() => '');
  R.pay.detailHas53 = /53\s*nhân viên/i.test(bodyText);
  R.pay.addEmpVisible = await page
    .locator('[data-testid="pay-batch-add-emp-btn"]')
    .isVisible()
    .catch(() => false);

  // --- Enroll attempt (U65) ---
  click('enroll', 'Thêm nhân viên');
  if (R.pay.addEmpVisible) {
    await page.locator('[data-testid="pay-batch-add-emp-btn"]').click();
    await sleep(1200);
    const dlg = page.locator('[data-testid="pay-batch-add-emp-dialog-precision"]');
    const dlgOpen = await dlg.isVisible().catch(() => false);
    R.pay.enrollDialogOpen = dlgOpen;
    if (dlgOpen) {
      await page.screenshot({ path: join(SCREEN, '03-enroll-dialog.png'), fullPage: false });
      // Radix Checkbox: enabled = not data-disabled / aria-disabled
      const allCb = dlg.locator('[role="checkbox"]');
      const allN = await allCb.count();
      let enabledN = 0;
      for (let i = 0; i < allN; i++) {
        const cb = allCb.nth(i);
        const disabled =
          (await cb.getAttribute('aria-disabled')) === 'true' ||
          (await cb.getAttribute('data-disabled')) !== null ||
          (await cb.isDisabled().catch(() => false));
        if (!disabled) enabledN += 1;
      }
      R.pay.checkboxTotal = allN;
      R.pay.enabledCheckboxes = enabledN;
      if (enabledN >= 1) {
        for (let i = 0; i < allN; i++) {
          const cb = allCb.nth(i);
          const disabled =
            (await cb.getAttribute('aria-disabled')) === 'true' ||
            (await cb.getAttribute('data-disabled')) !== null ||
            (await cb.isDisabled().catch(() => false));
          if (!disabled) {
            await cb.click();
            break;
          }
        }
        const before = R.network.filter((x) => x.method === 'POST' && /enroll/i.test(x.url)).length;
        await dlg.getByRole('button', { name: /Thêm \d+ nhân viên/i }).click();
        await sleep(5000);
        const posts = R.network.filter((x) => x.method === 'POST' && /enroll/i.test(x.url)).slice(before);
        R.pay.enrollPosts = posts;
        R.criteria.enroll = posts.some((p) => p.status >= 200 && p.status < 300)
          ? 'PASS'
          : 'FAIL_ENROLL_HTTP';
      } else {
        R.criteria.enroll = R.pay.detailHas53
          ? 'PASS_PREEXISTING_53_NO_ENABLED_CB'
          : 'FAIL_NO_ENABLED_CB';
      }
      // Always dismiss enroll dialog so lock button is clickable
      const huy = dlg.getByRole('button', { name: /^Hủy$/i });
      if (await huy.isVisible().catch(() => false)) await huy.click();
      else await page.keyboard.press('Escape').catch(() => {});
      await sleep(800);
      await dlg.waitFor({ state: 'hidden', timeout: 8_000 }).catch(() => {});
    } else {
      R.criteria.enroll = 'FAIL_NO_DIALOG';
    }
  } else if (R.pay.detailHas53 || (target?.employee_count || 0) >= 1) {
    R.criteria.enroll = 'PASS_PREEXISTING_ENROLLED';
  } else {
    R.criteria.enroll = 'FAIL_NO_ADD_BTN';
  }
  await page.screenshot({ path: join(SCREEN, '04-after-enroll-attempt.png'), fullPage: false });
  save();

  // --- Process / Khóa ---
  click('process', 'Khóa bảng lương');
  // Ensure no modal blocks header actions
  await page.keyboard.press('Escape').catch(() => {});
  await sleep(400);
  const lock = page.getByRole('button', { name: /Khóa bảng lương/i }).first();
  R.pay.lockVisible = await lock.isVisible().catch(() => false);
  R.pay.lockCount = await page.getByRole('button', { name: /Khóa bảng lương/i }).count().catch(() => 0);
  if (R.pay.lockVisible) {
    await lock.click({ force: true });
    await sleep(900);
    await page.screenshot({ path: join(SCREEN, '05-lock-confirm.png'), fullPage: false });
    // Confirm dialog: prefer destructive confirm in AlertDialog footer
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
    await sleep(12000);
    const posts = R.network
      .filter((x) => x.method === 'POST' && /\/process/i.test(x.url))
      .slice(before);
    R.pay.processPosts = posts;
    R.criteria.process =
      posts.some((p) => p.status >= 200 && p.status < 300) ? 'PASS' : posts.length ? 'FAIL_HTTP' : 'FAIL_NO_POST';
  } else {
    R.criteria.process = 'FAIL_NO_LOCK_BTN';
    R.pay.headerButtons = await page
      .locator('button')
      .evaluateAll((els) => els.map((e) => (e.textContent || '').trim()).filter(Boolean).slice(0, 40))
      .catch(() => []);
  }
  await page.screenshot({ path: join(SCREEN, '06-after-process.png'), fullPage: false });

  R.payslip.afterProcess = await capturePayslipTable(page);
  R.criteria.payslip_ui =
    R.payslip.afterProcess.visible && R.payslip.afterProcess.rowCount >= 1 ? 'PASS' : 'FAIL';

  // honesty LIVE gate
  if (R.payslip.afterProcess.hasNonZero) {
    R.honesty.formula_LIVE = false; // still DENY unless AC map — flag note only
    R.honesty.non_zero_observed = true;
  } else {
    R.honesty.non_zero_observed = false;
  }

  // --- F5 persist ---
  click('f5', 'reload + re-open period');
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 90_000 });
  await sleep(4000);
  try {
    await ensureCalcList(page);
  } catch (e) {
    R.pay.f5ListError = String(e).slice(0, 200);
    // soft retry once
    await page.goto(q('/hr/payroll'), { waitUntil: 'domcontentloaded', timeout: 90_000 });
    await sleep(3000);
    await page.locator('[data-testid="payroll-tab-calculate"]').click().catch(() => {});
    const miRetry = page.getByRole('menuitem', { name: /Danh sách bảng lương/i }).first();
    if (await miRetry.isVisible().catch(() => false)) await miRetry.click();
    await sleep(2000);
    await page.locator('[data-testid="pay-batches-precision"]').waitFor({ state: 'visible', timeout: 40_000 });
  }
  await setMonthFilter(page, MONTH, YEAR);
  await page.locator(`[data-testid="pay-batch-row-${PERIOD}"]`).click({ timeout: 20_000 });
  await sleep(4000);
  R.payslip.afterF5 = await capturePayslipTable(page);
  R.criteria.f5 =
    R.payslip.afterF5.visible && R.payslip.afterF5.rowCount >= 1 ? 'PASS' : 'FAIL';
  await page.screenshot({ path: join(SCREEN, '07-after-f5.png'), fullPage: false });

  const periodAfter = await apiCall(session.token, 'GET', `/payroll/periods?company_id=${COMPANY}`);
  const listAfter = periodAfter.data?.data ?? [];
  const tAfter = listAfter.find((p) => p.id === PERIOD);
  R.pay.periodAfter = tAfter
    ? {
        id: tAfter.id,
        status: tAfter.status,
        employee_count: tAfter.employee_count,
        processed_at: tAfter.processed_at,
      }
    : null;

  const enrollOk =
    R.criteria.enroll === 'PASS' ||
    String(R.criteria.enroll || '').startsWith('PASS_PREEXISTING');
  const processOk = R.criteria.process === 'PASS';
  const payslipOk = R.criteria.payslip_ui === 'PASS';
  const f5Ok = R.criteria.f5 === 'PASS';
  const attOk = R.criteria.att_closed_same_month === 'PASS';
  const draftOk = R.criteria.period_draft === 'PASS' || processOk; // draft may flip after process
  const tdzOk = R.criteria.tdz_cleared === 'PASS';

  R.verdict =
    attOk && tdzOk && enrollOk && processOk && payslipOk && f5Ok ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  R.ack_status = R.verdict;
  R.honesty.payroll_e2e_ready = false;
  R.honesty.formula_LIVE = false;
  R.finishedAt = new Date().toISOString();
  R.executive_summary = [
    `stamp=${STAMP}`,
    `att_sep=${R.criteria.att_closed_same_month}`,
    `enroll=${R.criteria.enroll}`,
    `process=${R.criteria.process}`,
    `payslip=${R.criteria.payslip_ui}`,
    `f5=${R.criteria.f5}`,
    `tdz=${R.criteria.tdz_cleared}`,
    `period_status_after=${R.pay.periodAfter?.status}`,
    `non_zero=${R.honesty.non_zero_observed}`,
    `verdict=${R.verdict}`,
    'honesty payroll_e2e_ready=false LIVE=DENIED',
  ].join(' · ');
} catch (err) {
  R.fatal = String(err?.stack || err).slice(0, 800);
  R.verdict = 'FAIL_TO_PM';
  R.ack_status = 'FAIL_TO_PM';
  R.finishedAt = new Date().toISOString();
} finally {
  save();
  await browser.close().catch(() => {});
}

console.log(
  JSON.stringify(
    {
      stamp: R.stamp,
      verdict: R.verdict,
      criteria: R.criteria,
      processPosts: R.pay.processPosts,
      enrollPosts: R.pay.enrollPosts,
      payslip: R.payslip,
      periodAfter: R.pay.periodAfter,
      att: R.att,
      tdzErrors: R.tdzErrors,
      pageErrors: R.pageErrors.slice(0, 5),
      honesty: R.honesty,
      executive_summary: R.executive_summary,
      fatal: R.fatal,
    },
    null,
    2,
  ),
);

process.exit(R.verdict === 'PASS_TO_PM' ? 0 : 1);
