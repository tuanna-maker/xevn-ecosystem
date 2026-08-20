#!/usr/bin/env node
/**
 * PO-HRM-PAYROLL-FORMULA-RUN-GAP-W3-QA-PROCESS-POST-02
 * U65 browser — fresh draft + ATT closed same month (NOT d92d3bbb processed)
 *
 * Env note: Sep create → 409 HRM-PAY-002 overlap with processed d92d3bbb.
 * Path: FE sign+close Aug submitted sheet 74aba4d4 → Aug draft bb194e52 → enroll → Khóa → process.
 *
 * Honesty: payroll_e2e_ready=false · DENY formula LIVE invent
 * Cấm: seed · reopen TDZ · invent LIVE
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
const MONTH = 8;
const YEAR = 2026;
const SKIP_PROCESSED = 'd92d3bbb-f53a-4151-9b12-0ebe9dd27d25';
const AUG_SHEET = '74aba4d4-9c75-4707-9d01-7690516e95c7';
/** Prefer empty Aug draft without broken D-only sheet template (bb194e52 → 412 SRC-D) */
const AUG_DRAFT = 'cf38deac-8b64-474d-9aee-b34249c0f5a1';
const AUG_DRAFT_BAD_TPL = 'bb194e52-54e2-4292-bb54-37d392ddcaf6';
const PREFERRED_EMP_CODES = ['HLD-0001', 'NV002', 'PORTAL-GCEO'];
const STAMP = `PAYW3PROC2-${Date.now().toString(36).toUpperCase()}`;
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(
  ROOT,
  'docs/qa/evidence/_tmp-po-hrm-payroll-formula-run-gap-w3-qa-process-post-02.json',
);
const SCREEN = resolve(
  ROOT,
  'docs/qa/evidence/screens/po-hrm-payroll-formula-run-gap-w3-qa-process-post-02',
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
  work_item_id: 'PO-HRM-PAYROLL-FORMULA-RUN-GAP-W3-QA-PROCESS-POST-02',
  parent: 'PO-HRM-PAYROLL-FORMULA-RUN-GAP-W3-BE-PROCESS-FORMULA-412-01',
  stamp: STAMP,
  u65: 'zero-seed',
  journey_l25: 'J-HRM-07',
  honesty: {
    payroll_e2e_ready: false,
    formula_LIVE: false,
    seed_used: false,
    module_uat_claim: false,
    non_zero_observed: false,
  },
  env: { PORTAL, HRM, XBOS, EMAIL, commit: COMMIT },
  target: {
    periodId: AUG_DRAFT,
    month: MONTH,
    year: YEAR,
    skipProcessed: SKIP_PROCESSED,
    attSheetId: AUG_SHEET,
    note: 'Aug draft cf38deac (no D-only tpl) + FE close Aug ATT; NOT d92d3bbb; skip bb194e52 SRC-D 412',
    sepCreateBlocked: 'HRM-PAY-002 overlap with processed Sep',
    skippedBadTplDraft: AUG_DRAFT_BAD_TPL,
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

function listPeriods(payload) {
  return payload?.data ?? (Array.isArray(payload) ? payload : []);
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
    sample: text.slice(0, 600),
  };
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
  for (let round = 0; round < 10; round++) {
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

const session = await loginApi();

// --- API prereq snapshots ---
const sheetBefore = await apiCall(
  session.token,
  'GET',
  `/attendance/attendance-sheets/${AUG_SHEET}?company_id=${COMPANY}`,
);
R.att.sheetBefore = {
  status: sheetBefore.status,
  code: sheetBefore.code,
  sheetStatus: sheetBefore.data?.status,
  id: sheetBefore.data?.id,
};
const periodsBefore = await apiCall(session.token, 'GET', `/payroll/periods?company_id=${COMPANY}`);
const periodListBefore = listPeriods(periodsBefore.data);
const draft = periodListBefore.find((p) => p.id === AUG_DRAFT);
const skipRow = periodListBefore.find((p) => p.id === SKIP_PROCESSED);
R.pay.skipProcessedStatus = skipRow
  ? { id: skipRow.id, status: skipRow.status, emp: skipRow.employee_count }
  : null;
R.pay.periodBefore = draft
  ? {
      id: draft.id,
      status: draft.status,
      employee_count: draft.employee_count,
      period_label: draft.period_label,
      start_date: draft.start_date,
      end_date: draft.end_date,
    }
  : null;
R.criteria.period_draft = draft?.status === 'draft' ? 'PASS' : `FAIL_${draft?.status || 'MISSING'}`;
R.criteria.not_skip_processed = AUG_DRAFT !== SKIP_PROCESSED ? 'PASS' : 'FAIL';
R.criteria.skip_not_target =
  skipRow?.status === 'processed' ? 'PASS_SKIP_PROCESSED' : 'WARN_SKIP_STATUS';
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
  if (!/\/api\/hrm\/(payroll|attendance)\//.test(u)) return;
  const entry = {
    method: res.request().method(),
    status: res.status(),
    url: u.slice(0, 300),
    code: null,
    message: null,
    payroll_e2e_ready: null,
  };
  try {
    const j = await res.json();
    entry.code = j?.code || null;
    entry.message = typeof j?.message === 'string' ? j.message.slice(0, 160) : null;
    if (j?.payroll_e2e_ready !== undefined) entry.payroll_e2e_ready = j.payroll_e2e_ready;
    if (j?.data?.payroll_e2e_ready !== undefined) entry.payroll_e2e_ready = j.data.payroll_e2e_ready;
    if (/\/process/i.test(u) && res.request().method() === 'POST') {
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
    }
  },
  { s: session },
);

try {
  // ========== ATT: sign + close Aug sheet ==========
  click('S0', `goto attendance · close ${AUG_SHEET.slice(0, 8)}`);
  await page.goto(q('/hr/attendance'), { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await sleep(2800);
  await openAttendanceMenuItem(page, /Bảng chấm công|Sheets/i);
  await sleep(1500);
  await page.locator('[data-testid="att-sheets-precision"]').waitFor({ state: 'visible', timeout: 45_000 });
  await page.screenshot({ path: join(SCREEN, '01-att-list.png'), fullPage: false });

  if (String(R.att.sheetBefore?.sheetStatus || '').toLowerCase() === 'closed') {
    R.criteria.att_closed_same_month = 'PASS_ALREADY_CLOSED';
    R.att.closePath = 'already_closed';
  } else {
    const rows = page.locator('[data-testid="att-sheets-precision"] tbody tr');
    const rowCount = await rows.count();
    let opened = false;
    const needle = AUG_SHEET.slice(0, 8).toLowerCase();
    for (let i = 0; i < rowCount; i++) {
      const text = (await rows.nth(i).innerText().catch(() => '')).toLowerCase();
      if (text.includes(needle) || text.includes('qa-att-line-03') || text.includes('payfeatt')) {
        click('S4-open', `row ${i}`);
        await rows.nth(i).click({ timeout: 12_000 });
        await sleep(2500);
        opened = true;
        break;
      }
    }
    // fallback: click by name fragment
    if (!opened) {
      const byName = page.getByText(/QA-ATT-LINE-03|PAYFEATT/i).first();
      if (await byName.isVisible().catch(() => false)) {
        await byName.click();
        await sleep(2500);
        opened = true;
      }
    }
    R.att.sheetOpened = opened;
    await page.screenshot({ path: join(SCREEN, '02-att-detail.png'), fullPage: false });

    const submitBtn = page.locator('[data-testid="att-sheet-submit"]');
    if (await submitBtn.isVisible().catch(() => false)) {
      click('S5-submit', 'att-sheet-submit');
      await submitBtn.click({ timeout: 12_000 });
      await sleep(4000);
    }

    R.att.signPanelVisible = await page
      .locator('[data-testid="att-sign-panel"]')
      .isVisible()
      .catch(() => false);
    await clickEnabledSignSteps(page);
    await sleep(1500);

    const sigAfter = await apiCall(
      session.token,
      'GET',
      `/attendance/attendance-sheets/${AUG_SHEET}/signatures?company_id=${COMPANY}`,
    );
    R.att.canCloseAfterSign = sigAfter.data?.can_close;
    R.att.missingRoles = sigAfter.data?.missing_mandatory_roles;
    R.att.sigStatus = sigAfter.status;

    const closeBtn = page.locator('[data-testid="att-sign-close-sheet"]');
    R.att.closeEnabled = await closeBtn.isEnabled().catch(() => false);
    await page.screenshot({ path: join(SCREEN, '03-att-before-close.png'), fullPage: false });

    if (R.att.closeEnabled) {
      click('S6-close', 'att-sign-close-sheet');
      await closeBtn.click({ timeout: 10_000 });
      await sleep(4000);
      const closePosts = R.network.filter(
        (x) => x.method === 'POST' && /\/close/.test(x.url) && /attendance-sheets/.test(x.url),
      );
      R.att.closePosts = closePosts.slice(-3);
    } else {
      R.att.closeBlocked = 'close_btn_disabled';
    }

    const after = await apiCall(
      session.token,
      'GET',
      `/attendance/attendance-sheets/${AUG_SHEET}?company_id=${COMPANY}`,
    );
    R.att.sheetAfter = { status: after.data?.status, http: after.status, code: after.code };
    R.criteria.att_closed_same_month =
      String(after.data?.status || '').toLowerCase() === 'closed' ? 'PASS' : 'FAIL_NOT_CLOSED';
    await page.screenshot({ path: join(SCREEN, '04-att-after-close.png'), fullPage: false });
  }
  save();

  // ========== PAYROLL process on Aug draft ==========
  await ensureCalcList(page);
  R.criteria.payroll_load = 'PASS';
  R.criteria.tdz_cleared = R.tdzErrors.length ? 'FAIL' : 'PASS';
  await page.screenshot({ path: join(SCREEN, '05-pay-list.png'), fullPage: false });

  // Prefer known Aug draft; fallback newest Aug draft ≠ skip
  let targetId = AUG_DRAFT;
  {
    const periods = await apiCall(session.token, 'GET', `/payroll/periods?company_id=${COMPANY}`);
    const list = listPeriods(periods.data);
    let row = list.find((p) => p.id === AUG_DRAFT && String(p.status).toLowerCase() === 'draft');
    if (!row) {
      row = list
        .filter((p) => {
          if (p.id === SKIP_PROCESSED || p.id === AUG_DRAFT_BAD_TPL) return false;
          if (String(p.status || '').toLowerCase() !== 'draft') return false;
          const { month, year } = vnMonthYear(p.start_date || p.end_date);
          return month === MONTH && year === YEAR;
        })
        .sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')))[0];
      R.pay.draftFallbackUsed = true;
    }
    if (row) {
      targetId = row.id;
      R.target.periodId = targetId;
      R.pay.periodBefore = {
        id: row.id,
        status: row.status,
        employee_count: row.employee_count,
        period_label: row.period_label,
      };
      R.criteria.period_draft = 'PASS';
    }
  }

  await setMonthFilter(page, MONTH, YEAR);
  click('open', `pay-batch-row-${targetId}`);
  await page.locator(`[data-testid="pay-batch-row-${targetId}"]`).click({ timeout: 20_000 });
  await sleep(3500);
  await page.screenshot({ path: join(SCREEN, '06-detail-before.png'), fullPage: false });

  const bodyText = await page.locator('body').innerText().catch(() => '');
  R.pay.detailEmpHint = (bodyText.match(/(\d+)\s*nhân viên/i) || [])[1] || null;
  R.pay.addEmpVisible = await page
    .locator('[data-testid="pay-batch-add-emp-btn"]')
    .isVisible()
    .catch(() => false);

  // --- Enroll ≥1 ---
  click('enroll', 'Thêm nhân viên');
  if (R.pay.addEmpVisible) {
    await page.locator('[data-testid="pay-batch-add-emp-btn"]').click();
    await sleep(1500);
    const dlg = page.locator('[data-testid="pay-batch-add-emp-dialog-precision"]');
    const dlgOpen = await dlg.isVisible().catch(() => false);
    R.pay.enrollDialogOpen = dlgOpen;
    if (dlgOpen) {
      await page.screenshot({ path: join(SCREEN, '07-enroll-dialog.png'), fullPage: false });
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
        // Prefer C&B-known codes (HLD-0001 / NV002) — avoid QA-M3 mid-hire without SRC
        let pick = enabledIdx.find((i) => i > 0) ?? enabledIdx[0];
        const dlgText = await dlg.innerText().catch(() => '');
        R.pay.enrollDialogSample = dlgText.slice(0, 400);
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
        const addBtn = dlg.getByRole('button', { name: /Thêm \d+ nhân viên/i });
        if (await addBtn.isVisible().catch(() => false)) await addBtn.click();
        else await dlg.getByRole('button', { name: /Thêm/i }).last().click();
        await sleep(7000);
        const posts = R.network.filter((x) => x.method === 'POST' && /enroll/i.test(x.url)).slice(before);
        R.pay.enrollPosts = posts;
        R.criteria.enroll = posts.some((p) => p.status >= 200 && p.status < 300)
          ? 'PASS'
          : 'FAIL_ENROLL_HTTP';
      } else {
        const emp = Number(R.pay.periodBefore?.employee_count || R.pay.detailEmpHint || 0);
        R.criteria.enroll = emp >= 1 ? 'PASS_PREEXISTING_NO_ENABLED_CB' : 'FAIL_NO_ENABLED_CB';
        const huy = dlg.getByRole('button', { name: /^Hủy$/i });
        if (await huy.isVisible().catch(() => false)) await huy.click();
        else await page.keyboard.press('Escape').catch(() => {});
        await sleep(800);
      }
      await dlg.waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => {});
    } else {
      R.criteria.enroll = 'FAIL_NO_DIALOG';
    }
  } else if (Number(R.pay.periodBefore?.employee_count || 0) >= 1) {
    R.criteria.enroll = 'PASS_PREEXISTING_ENROLLED';
  } else {
    R.criteria.enroll = 'FAIL_NO_ADD_BTN';
  }
  await page.screenshot({ path: join(SCREEN, '08-after-enroll.png'), fullPage: false });
  save();

  {
    const periods = await apiCall(session.token, 'GET', `/payroll/periods?company_id=${COMPANY}`);
    const row = listPeriods(periods.data).find((p) => p.id === targetId);
    R.pay.periodMid = row
      ? { id: row.id, status: row.status, employee_count: row.employee_count }
      : null;
  }

  // --- Process ---
  click('process', 'Khóa bảng lương');
  await page.keyboard.press('Escape').catch(() => {});
  await sleep(400);
  const lock = page.getByRole('button', { name: /Khóa bảng lương/i }).first();
  R.pay.lockVisible = await lock.isVisible().catch(() => false);
  if (R.pay.lockVisible) {
    await lock.click({ force: true });
    await sleep(900);
    await page.screenshot({ path: join(SCREEN, '09-lock-confirm.png'), fullPage: false });
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
    const posts = R.network
      .filter((x) => x.method === 'POST' && /\/process/i.test(x.url))
      .slice(before);
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
    R.pay.headerButtons = await page
      .locator('button')
      .evaluateAll((els) => els.map((e) => (e.textContent || '').trim()).filter(Boolean).slice(0, 40))
      .catch(() => []);
  }
  await page.screenshot({ path: join(SCREEN, '10-after-process.png'), fullPage: false });

  R.payslip.afterProcess = await capturePayslipTable(page);
  R.criteria.payslip_ui =
    R.payslip.afterProcess.visible && R.payslip.afterProcess.rowCount >= 1 ? 'PASS' : 'FAIL';
  R.honesty.non_zero_observed = !!R.payslip.afterProcess.hasNonZero;

  // --- F5 ---
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
  await setMonthFilter(page, MONTH, YEAR);
  await page.locator(`[data-testid="pay-batch-row-${targetId}"]`).click({ timeout: 20_000 });
  await sleep(4000);
  R.payslip.afterF5 = await capturePayslipTable(page);
  R.criteria.f5 =
    R.payslip.afterF5.visible && R.payslip.afterF5.rowCount >= 1 ? 'PASS' : 'FAIL';
  await page.screenshot({ path: join(SCREEN, '11-after-f5.png'), fullPage: false });

  const periodAfter = await apiCall(session.token, 'GET', `/payroll/periods?company_id=${COMPANY}`);
  const tAfter = listPeriods(periodAfter.data).find((p) => p.id === targetId);
  R.pay.periodAfter = tAfter
    ? {
        id: tAfter.id,
        status: tAfter.status,
        employee_count: tAfter.employee_count,
        processed_at: tAfter.processed_at,
      }
    : null;
  R.criteria.period_processed =
    String(tAfter?.status || '').toLowerCase() === 'processed' ? 'PASS' : `FAIL_${tAfter?.status || 'MISSING'}`;

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
        }))
      : [],
  };

  const enrollOk =
    R.criteria.enroll === 'PASS' || String(R.criteria.enroll || '').startsWith('PASS_PREEXISTING');
  const processOk = R.criteria.process === 'PASS';
  const payslipOk = R.criteria.payslip_ui === 'PASS';
  const f5Ok = R.criteria.f5 === 'PASS';
  const attOk = String(R.criteria.att_closed_same_month || '').startsWith('PASS');
  const draftOk = R.criteria.period_draft === 'PASS' || processOk;
  const tdzOk = R.criteria.tdz_cleared === 'PASS';
  const notSkip = R.criteria.not_skip_processed === 'PASS';
  const honestyOk = !R.honesty.payroll_e2e_ready_flip_detected;

  R.honesty.formula_LIVE = false;
  if (R.honesty.non_zero_observed && processOk) {
    R.honesty.live_gate_note =
      'non-zero after process 2xx — still DENIED invent LIVE (no AC promote)';
  }

  R.verdict =
    attOk && tdzOk && notSkip && draftOk && enrollOk && processOk && payslipOk && f5Ok && honestyOk
      ? 'PASS_TO_PM'
      : 'FAIL_TO_PM';
  R.ack_status = R.verdict;
  R.honesty.payroll_e2e_ready = false;
  R.honesty.formula_LIVE = false;
  R.finishedAt = new Date().toISOString();
  R.executive_summary = [
    `stamp=${STAMP}`,
    `period=${R.target.periodId?.slice(0, 8)}`,
    `att=${R.criteria.att_closed_same_month}`,
    `enroll=${R.criteria.enroll}`,
    `process=${R.criteria.process}`,
    `period_after=${R.pay.periodAfter?.status}`,
    `payslip=${R.criteria.payslip_ui}`,
    `f5=${R.criteria.f5}`,
    `tdz=${R.criteria.tdz_cleared}`,
    `non_zero=${R.honesty.non_zero_observed}`,
    `verdict=${R.verdict}`,
    'honesty payroll_e2e_ready=false LIVE=DENIED',
  ].join(' · ');
} catch (err) {
  R.fatal = String(err?.stack || err).slice(0, 900);
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
      target: R.target,
      att: {
        sheetBefore: R.att.sheetBefore,
        sheetAfter: R.att.sheetAfter,
        canCloseAfterSign: R.att.canCloseAfterSign,
        missingRoles: R.att.missingRoles,
        closeEnabled: R.att.closeEnabled,
        closePosts: R.att.closePosts,
      },
      processPosts: R.pay.processPosts,
      enrollPosts: R.pay.enrollPosts,
      payslip: R.payslip,
      periodBefore: R.pay.periodBefore,
      periodMid: R.pay.periodMid,
      periodAfter: R.pay.periodAfter,
      payslipsApi: R.pay.payslipsApi,
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
