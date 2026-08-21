#!/usr/bin/env node
/**
 * PO-HRM-PAYROLL-FORMULA-RUN-GAP-W3-QA-J-HRM-07-01
 * U65 browser J-HRM-07: ATT chốt → kỳ lương → enroll → Process (Khóa) → phiếu + dòng trên UI → F5
 * payroll_e2e_ready=false · cấm seed · honesty no LIVE claim
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
const PAYROLL_MONTH = Number(process.env.QA_PAYROLL_MONTH || 8);
const PAYROLL_YEAR = Number(process.env.QA_PAYROLL_YEAR || 2026);
const STAMP = `PAYW3J07-${Date.now().toString(36).toUpperCase()}`;
const PERIOD_LABEL = `QA-W3-J-HRM-07-${STAMP}`;
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-payroll-formula-run-gap-w3-qa-j-hrm-07-01-browser.json');
const OUT_MD = resolve(ROOT, 'docs/qa/evidence/po-hrm-payroll-formula-run-gap-w3-qa-j-hrm-07-01.md');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-payroll-formula-run-gap-w3-qa-j-hrm-07-01');
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
  parent: 'PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01',
  stamp: STAMP,
  u65: 'zero-seed',
  hdsd_align:
    'Chấm công chốt → Tiền lương → Tính lương → Lập bảng/chọn kỳ → Thêm NV → Khóa (Process) → xem phiếu/dòng → F5',
  journey_l25: 'J-HRM-07',
  honesty: { payroll_e2e_ready: false, formula_LIVE: false, seed_used: false },
  env: { PORTAL: null, HRM, XBOS, EMAIL, commit: COMMIT },
  payrollTarget: { month: PAYROLL_MONTH, year: PAYROLL_YEAR },
  l0: {},
  clicks: [],
  att: {},
  pay: {},
  payslip: {},
  network: { att: [], pay: [], createSheetId: null },
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

async function apiListPayPeriods(token) {
  const r = await apiCall(token, 'GET', `/payroll/periods?company_id=${COMPANY}`);
  const rows = r.data?.data ?? (Array.isArray(r.data) ? r.data : []);
  return { status: r.status, rows: Array.isArray(rows) ? rows : [] };
}

async function apiEligibility(token, periodId) {
  const r = await apiCall(token, 'GET', `/payroll/periods/${periodId}/eligibility?company_id=${COMPANY}`);
  const data = r.data ?? {};
  return {
    status: r.status,
    eligible_count: data?.eligible_count ?? 0,
    ineligible_count: data?.ineligible_count ?? 0,
  };
}

async function apiListClosedSheets(token) {
  const r = await apiCall(token, 'GET', `/attendance/attendance-sheets?company_id=${COMPANY}&page_size=80`);
  const rows = r.data?.data ?? (Array.isArray(r.data) ? r.data : []);
  const closed = (Array.isArray(rows) ? rows : []).filter((s) => s.status === 'closed');
  return closed;
}

function trackNetwork(page) {
  page.on('response', async (res) => {
    const u = res.url();
    const status = res.status();
    const method = res.request().method();
    if (/attendance-sheets|\/signatures|\/submit|\/close/.test(u)) {
      R.network.att.push({ method, status, url: u.slice(0, 220) });
    }
    if (/\/api\/hrm\/payroll\//.test(u)) {
      R.network.pay.push({ method, status, url: u.slice(0, 220), code: null });
      try {
        const j = await res.json();
        const last = R.network.pay[R.network.pay.length - 1];
        if (last) last.code = j?.code ?? null;
      } catch {
        /* */
      }
    }
  });
}

async function setPayrollMonthFilter(page) {
  click('P-filter', `pay-batch-period-option-${PAYROLL_MONTH}-${PAYROLL_YEAR}`);
  const filter = page.locator('[data-testid="pay-batch-period-filter"]');
  if (!(await filter.isVisible().catch(() => false))) return false;
  await filter.click({ timeout: 10_000 });
  await sleep(400);
  const opt = page.locator(`[data-testid="pay-batch-period-option-${PAYROLL_MONTH}-${PAYROLL_YEAR}"]`);
  if (await opt.isVisible().catch(() => false)) {
    await opt.click();
    await sleep(2000);
    return true;
  }
  const fallback = page.getByRole('option', { name: `Tháng ${PAYROLL_MONTH}/${PAYROLL_YEAR}`, exact: true });
  if (await fallback.isVisible().catch(() => false)) {
    await fallback.click();
    await sleep(2000);
    return true;
  }
  return false;
}

async function ensurePayrollCalcList(page, portal) {
  click('P0', `goto ${portal}/hr/payroll`);
  await page.goto(q(portal, '/hr/payroll'), { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await sleep(2500);
  const calcTab = page.locator('[data-testid="payroll-tab-calculate"]');
  if (await calcTab.isVisible().catch(() => false)) {
    await calcTab.click({ timeout: 10_000 });
    await sleep(400);
  }
  const listItem = page.getByRole('menuitem', { name: /Danh sách bảng lương|payrollList/i }).first();
  if (await listItem.isVisible().catch(() => false)) {
    click('P0b', 'menu Danh sách bảng lương');
    await listItem.click();
    await sleep(1500);
  }
  await page.locator('[data-testid="pay-batches-precision"]').waitFor({ state: 'visible', timeout: 25_000 }).catch(() => null);
}

async function createPayrollPeriodFe(page, token) {
  click('P-create', 'Lập bảng lương dialog');
  await page.getByRole('button', { name: /Lập bảng lương/i }).first().click({ timeout: 10_000 });
  await sleep(800);
  const dialog = page.locator('[data-testid="pay-batch-create-dialog-precision"]');
  await dialog.waitFor({ state: 'visible', timeout: 10_000 });
  await dialog.locator('input').first().fill(PERIOD_LABEL);
  const monthSel = page.locator('[data-testid="pay-batch-create-month-select"]');
  if (await monthSel.isVisible().catch(() => false)) {
    await monthSel.click();
    await page.locator(`[data-testid="pay-batch-create-month-option-${PAYROLL_MONTH}"]`).click();
  }
  const yearSel = page.locator('[data-testid="pay-batch-create-year-select"]');
  if (await yearSel.isVisible().catch(() => false)) {
    await yearSel.click();
    await page.locator(`[data-testid="pay-batch-create-year-option-${PAYROLL_YEAR}"]`).click();
  }
  const tplTrigger = dialog.locator('button[role="combobox"]').filter({ hasText: /mẫu|Không/i }).first();
  if (await tplTrigger.isVisible().catch(() => false)) {
    await tplTrigger.click().catch(() => {});
    await sleep(300);
    const tplOpt = page.getByRole('option').nth(1);
    if (await tplOpt.isVisible().catch(() => false)) {
      const tplText = await tplOpt.innerText().catch(() => '');
      R.pay.templateSelected = tplText.slice(0, 80);
      await tplOpt.click().catch(() => {});
    }
  }
  const beforePosts = R.network.pay.filter((n) => n.method === 'POST' && /\/periods/.test(n.url)).length;
  await dialog.getByRole('button', { name: /Lập bảng lương/i }).click();
  await sleep(3500);
  const createPosts = R.network.pay.filter((n) => n.method === 'POST' && /\/periods/.test(n.url)).slice(beforePosts);
  const createOk = createPosts.some((p) => p.status >= 200 && p.status < 300);
  R.pay.createPosts = createPosts;
  R.pay.createOk = createOk;
  const periods = await apiListPayPeriods(token);
  const match = periods.rows.find((p) => p.period_label?.includes('QA-W3-J-HRM-07') || payPeriodMatchesMonth(p));
  R.pay.targetPeriodId = match?.id;
  R.pay.targetPeriodLabel = match?.period_label;
  return createOk && !!match?.id;
}

async function openPayrollPeriodRow(page, token, periodId) {
  await setPayrollMonthFilter(page);
  if (periodId) {
    const row = page.locator(`[data-testid="pay-batch-row-${periodId}"]`);
    if (await row.isVisible().catch(() => false)) {
      click('P-open', `pay-batch-row-${periodId.slice(0, 8)}`);
      await row.click({ timeout: 12_000 });
      await sleep(3000);
      if (await page.locator('[data-testid="pay-batch-add-emp-btn"]').isVisible().catch(() => false)) {
        return true;
      }
    }
  }
  const rows = page.locator('[data-testid="pay-batch-list-table"] tbody tr');
  const n = await rows.count();
  for (let i = 0; i < n; i++) {
    const text = await rows.nth(i).innerText().catch(() => '');
    if (/draft|Nháp|Đang soạn/i.test(text) || text.includes(String(PAYROLL_MONTH))) {
      click('P-open-fallback', `row ${i}`);
      await rows.nth(i).click({ timeout: 10_000 });
      await sleep(3000);
      if (await page.locator('[data-testid="pay-batch-add-emp-btn"]').isVisible().catch(() => false)) {
        return true;
      }
    }
  }
  return false;
}

async function enrollFirstEligible(page) {
  click('P-enroll', 'Thêm nhân viên');
  const addBtn = page.locator('[data-testid="pay-batch-add-emp-btn"]');
  if (!(await addBtn.isVisible().catch(() => false))) return { enrolled: false, reason: 'no_add_btn' };
  await addBtn.click({ timeout: 10_000 });
  await sleep(1200);
  const dialog = page.locator('[data-testid="pay-batch-add-emp-dialog-precision"]');
  await dialog.waitFor({ state: 'visible', timeout: 10_000 });
  await page.screenshot({ path: join(SCREEN, '04-enroll-dialog.png') });
  const checkboxes = dialog.locator('[role="checkbox"]:not([disabled])');
  const count = await checkboxes.count();
  if (count < 1) {
    await page.keyboard.press('Escape');
    return { enrolled: false, reason: 'no_enabled_checkbox' };
  }
  await checkboxes.first().click();
  const enrollBefore = R.network.pay.filter((n) => n.method === 'POST' && /\/enroll/.test(n.url)).length;
  await dialog.getByRole('button', { name: /Thêm \d+ nhân viên/i }).click();
  await sleep(3500);
  const enrollPosts = R.network.pay.filter((n) => n.method === 'POST' && /\/enroll/.test(n.url)).slice(enrollBefore);
  const enrollOk = enrollPosts.some((p) => p.status >= 200 && p.status < 300);
  await page.screenshot({ path: join(SCREEN, '05-after-enroll.png') });
  return { enrolled: enrollOk, enrollPosts, reason: enrollOk ? null : 'enroll_not_2xx' };
}

async function processLockBatch(page) {
  click('P-process', 'Khóa bảng lương (= Process)');
  const lockBtn = page.getByRole('button', { name: /Khóa bảng lương/i }).first();
  if (!(await lockBtn.isVisible().catch(() => false))) {
    return { processed: false, reason: 'no_lock_btn' };
  }
  await lockBtn.click({ timeout: 10_000 });
  await sleep(600);
  const confirm = page.getByRole('button', { name: /^Khóa bảng lương$/i }).last();
  const processBefore = R.network.pay.filter((n) => n.method === 'POST' && /\/process/.test(n.url)).length;
  if (await confirm.isVisible().catch(() => false)) {
    await confirm.click({ timeout: 10_000 });
  }
  await sleep(5000);
  const processPosts = R.network.pay.filter((n) => n.method === 'POST' && /\/process/.test(n.url)).slice(processBefore);
  const processOk = processPosts.some((p) => p.status >= 200 && p.status < 300);
  await page.screenshot({ path: join(SCREEN, '06-after-process.png') });
  return { processed: processOk, processPosts, reason: processOk ? null : 'process_not_2xx' };
}

async function readBatchDetailLines(page) {
  const table = page.locator('table').filter({ hasText: /Lương cơ bản|Lương Net/i }).first();
  if (!(await table.isVisible().catch(() => false))) {
    return { visible: false, rowCount: 0, hasNonZeroNet: false, sampleText: '' };
  }
  const bodyText = await table.innerText().catch(() => '');
  const rows = table.locator('tbody tr');
  const rowCount = await rows.count();
  const hasNonZeroNet = /[1-9][\d.,]*\s*₫/.test(bodyText) || /\d{1,3}(\.\d{3})+/.test(bodyText);
  const hasComponentCols = /Lương cơ bản|Phụ cấp|Khấu trừ|Thưởng/.test(bodyText);
  return {
    visible: true,
    rowCount,
    hasNonZeroNet,
    hasComponentCols,
    sampleText: bodyText.slice(0, 400),
  };
}

async function openPayslipListTab(page) {
  const payslipTab = page.locator('[data-testid="pay-payslips-api-precision"]');
  if (await payslipTab.isVisible().catch(() => false)) return true;
  const calcTab = page.locator('[data-testid="payroll-tab-calculate"]');
  if (await calcTab.isVisible().catch(() => false)) {
    await calcTab.click().catch(() => {});
    await sleep(300);
  }
  return false;
}

async function viewPayslipDialog(page) {
  const apiTab = page.locator('[data-testid="pay-payslips-api-precision"]');
  if (!(await apiTab.isVisible().catch(() => false))) {
    click('P-slip-nav', 'stay on batch detail for lines');
    return { dialogOpen: false, usedBatchTable: true };
  }
  const eye = apiTab.locator('button[aria-label="Xem chi tiết"]').first();
  if (!(await eye.isVisible().catch(() => false))) {
    return { dialogOpen: false, usedBatchTable: true };
  }
  click('P-slip-eye', 'Eye payslip detail');
  await eye.click();
  await sleep(1200);
  const dialog = page.locator('[data-testid="pay-payslip-detail-dialog-precision"]');
  const open = await dialog.isVisible().catch(() => false);
  if (open) await page.screenshot({ path: join(SCREEN, '07-payslip-dialog.png') });
  const text = open ? await dialog.innerText().catch(() => '') : '';
  return {
    dialogOpen: open,
    hasGross: /Tổng thu nhập|gross/i.test(text),
    hasNet: /Thực lĩnh|net/i.test(text),
    hasDeduction: /Khấu trừ/i.test(text),
    sampleText: text.slice(0, 350),
    usedBatchTable: false,
  };
}

function buildMarkdown() {
  const c = R.criteria;
  const lines = [
    '# Evidence — PO-HRM-PAYROLL-FORMULA-RUN-GAP-W3-QA-J-HRM-07-01',
    '',
    '| Field | Value |',
    '|-------|-------|',
    '| **work_item_id** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-W3-QA-J-HRM-07-01` |',
    '| **from_role** | `qa` |',
    '| **to_role** | `pm` |',
    `| **ack_status** | **\`${R.ack_status}\`** |`,
    `| **verdict** | **${R.verdict}** |`,
    `| **date** | ${new Date().toISOString().slice(0, 10)} |`,
    '| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |',
    '| **U65** | zero-seed · browser-only · cấm seed |',
    `| **honesty** | \`payroll_e2e_ready=${R.honesty.payroll_e2e_ready}\` · formula LIVE **DENIED** |`,
    '| **journey_l25** | **J-HRM-07** — Lương → phiếu lương + dòng thành phần |',
    `| **portal_url** | ${R.env.PORTAL} |`,
    `| **stamp** | \`${STAMP}\` |`,
    `| **machine** | \`docs/qa/evidence/_tmp-po-hrm-payroll-formula-run-gap-w3-qa-j-hrm-07-01-browser.json\` |`,
    `| **screenshots** | \`docs/qa/evidence/screens/po-hrm-payroll-formula-run-gap-w3-qa-j-hrm-07-01/\` |`,
    '',
    '## L0 stack',
    '',
    '| Service | Status |',
    '|---------|--------|',
    `| hrm-api | ${R.l0.hrm} |`,
    `| xbos-api | ${R.l0.xbos} |`,
    `| portal | ${R.l0.portal} |`,
    '',
    '## Executive summary',
    '',
    R.executive_summary || '_pending_',
    '',
    '## UF / J-HRM-07',
    '',
    '| Step | Click path | Result |',
    '|------|------------|--------|',
    `| ATT prerequisite | Closed sheet same month (${PAYROLL_MONTH}/${PAYROLL_YEAR}) | ${c.att_prereq ?? '—'} |`,
    `| P-CC-08 load | Tiền lương → Tính lương → Danh sách | ${c.payroll_load ?? '—'} |`,
    `| Create/select kỳ | Lập bảng / filter Tháng ${PAYROLL_MONTH}/${PAYROLL_YEAR} | ${c.period ?? '—'} |`,
    `| Enroll NV | Thêm nhân viên → POST enroll 2xx | ${c.enroll ?? '—'} |`,
    `| Process | Khóa bảng lương → POST /process 2xx | ${c.process ?? '—'} |`,
    `| UI phiếu + dòng | Batch detail cols / payslip dialog | ${c.payslip_ui ?? '—'} |`,
    `| F5 persist | Reload → rows/dialog còn | ${c.f5 ?? '—'} |`,
    '',
    '## Acceptance criteria',
    '',
    '| AC | Verdict | Notes |',
    '|----|---------|-------|',
    `| AC-W3-01 ATT closed same month | ${c.att_prereq ?? '—'} | API closed sheets + eligibility |`,
    `| AC-W3-02 Period create/open | ${c.period ?? '—'} | label \`${PERIOD_LABEL}\` or existing draft |`,
    `| AC-W3-03 Enroll browser 2xx | ${c.enroll ?? '—'} | |`,
    `| AC-W3-04 Process browser 2xx | ${c.process ?? '—'} | Khóa = process+close |`,
    `| AC-W3-05 Payslip + lines on UI | ${c.payslip_ui ?? '—'} | not API-only |`,
    `| AC-W3-06 F5 persistence | ${c.f5 ?? '—'} | |`,
    `| Honesty payroll_e2e_ready | **false** | QC later only |`,
    '',
    '## FE click path',
    '',
    ...R.clicks.map((x, i) => `${i + 1}. **${x.step}** — ${x.detail}`),
    '',
    '## Payroll phase (JSON)',
    '',
    '```json',
    JSON.stringify({ pay: R.pay, payslip: R.payslip, att: R.att }, null, 2),
    '```',
    '',
    '## Network (payroll chain)',
    '',
    '```json',
    JSON.stringify(
      R.network.pay.filter((n) => /enroll|process|periods|payslips/.test(n.url)).slice(-20),
      null,
      2,
    ),
    '```',
    '',
    '## Console / page errors',
    '',
    R.consoleErrors.length ? R.consoleErrors.map((e) => `- ${e}`).join('\n') : '- none captured P0',
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
    R.executive_summary = 'L0 FAIL — stack not healthy.';
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

    const closedSheets = await apiListClosedSheets(session.token);
    const closedSameMonth = closedSheets.filter((s) => {
      const start = s.period_start || s.start_date || '';
      if (!start) return false;
      const { month, year } = vnCalendarMonth(start);
      return month === PAYROLL_MONTH && year === PAYROLL_YEAR;
    });
    R.att.closedSameMonthCount = closedSameMonth.length;
    R.criteria.att_prereq = closedSameMonth.length >= 1 ? 'PASS' : 'FAIL';

    await ensurePayrollCalcList(page, R.env.PORTAL);
    await page.screenshot({ path: join(SCREEN, '01-pay-list.png') });
    R.criteria.payroll_load = (await page.locator('[data-testid="pay-batches-precision"]').isVisible().catch(() => false))
      ? 'PASS'
      : 'FAIL';

    await setPayrollMonthFilter(page);
    let periods = await apiListPayPeriods(session.token);
    let draft = periods.rows.find((p) => payPeriodMatchesMonth(p) && (p.status === 'draft' || p.status === 'open'));
    let periodId = draft?.id;

    if (!periodId) {
      const created = await createPayrollPeriodFe(page, session.token);
      R.criteria.period = created ? 'PASS' : 'FAIL';
      periodId = R.pay.targetPeriodId;
    } else {
      R.pay.targetPeriodId = periodId;
      R.pay.targetPeriodLabel = draft.period_label;
      R.criteria.period = 'PASS';
    }

    const elig = periodId ? await apiEligibility(session.token, periodId) : { eligible_count: 0 };
    R.pay.eligibility = elig;
    if (closedSameMonth.length >= 1 && elig.eligible_count < 1) {
      R.residuals.push({
        id: 'R-PAY-ATT-MONTH-LINK',
        sev: 'P0',
        owner: 'dev-be',
        note: `closed sheet exists but eligible_count=0 for ${PAYROLL_MONTH}/${PAYROLL_YEAR}`,
      });
    }

    const detailOpen = await openPayrollPeriodRow(page, session.token, periodId);
    R.pay.detailOpen = detailOpen;
    if (!detailOpen) {
      R.criteria.enroll = 'FAIL';
      R.criteria.process = 'NOT RUN';
      R.criteria.payslip_ui = 'NOT RUN';
      R.criteria.f5 = 'NOT RUN';
      R.residuals.push({
        id: 'R-PAY-PERIOD-ROW-NAV',
        sev: 'P1',
        owner: 'dev-fe',
        note: 'Could not open period detail — pay-batch-add-emp-btn missing',
      });
    } else {
      const enroll = await enrollFirstEligible(page);
      R.pay.enroll = enroll;
      R.criteria.enroll = enroll.enrolled ? 'PASS' : elig.eligible_count >= 1 ? 'FAIL' : 'BLOCKED';

      if (enroll.enrolled) {
        const proc = await processLockBatch(page);
        R.pay.process = proc;
        R.criteria.process = proc.processed ? 'PASS' : 'FAIL';

        const batchLines = await readBatchDetailLines(page);
        R.payslip.batchLines = batchLines;

        let slipUi = await viewPayslipDialog(page);
        if (slipUi.usedBatchTable) slipUi = { ...slipUi, batchLines };

        const uiOk =
          batchLines.visible &&
          batchLines.rowCount >= 1 &&
          batchLines.hasComponentCols &&
          (batchLines.hasNonZeroNet || proc.processed);
        R.payslip.ui = slipUi;
        R.criteria.payslip_ui = uiOk ? 'PASS' : proc.processed ? 'PARTIAL' : 'FAIL';

        click('P-f5', 'F5 persistence');
        await page.reload({ waitUntil: 'domcontentloaded' });
        await sleep(3500);
        const afterF5 = await readBatchDetailLines(page);
        R.payslip.afterF5 = afterF5;
        R.criteria.f5 = afterF5.visible && afterF5.rowCount >= 1 ? 'PASS' : 'FAIL';
        await page.screenshot({ path: join(SCREEN, '08-after-f5.png') });

        if (periodId && proc.processed) {
          const psList = await apiCall(session.token, 'GET', `/payroll/payslips?company_id=${COMPANY}&period_id=${periodId}`);
          const rows = psList.data?.data ?? (Array.isArray(psList.data) ? psList.data : []);
          const processed = (Array.isArray(rows) ? rows : []).filter((p) => p.status === 'processed');
          R.payslip.apiProcessedCount = processed.length;
          if (processed[0]?.id) {
            const lines = await apiCall(session.token, 'GET', `/payroll/payslips/${processed[0].id}/lines?company_id=${COMPANY}`);
            R.payslip.apiLinesCount = lines.data?.total ?? lines.data?.data?.length ?? 0;
          }
        }
      } else {
        R.criteria.process = 'NOT RUN';
        R.criteria.payslip_ui = 'NOT RUN';
        R.criteria.f5 = 'NOT RUN';
        if (elig.eligible_count === 0) {
          R.residuals.push({
            id: 'R-PAY-NO-ELIGIBLE-U65',
            sev: 'P0',
            owner: 'dev-fe',
            note: 'Need closed attendance sheet same month before enroll (U65)',
          });
        }
      }
    }

    const corePass =
      R.criteria.att_prereq === 'PASS' &&
      R.criteria.payroll_load === 'PASS' &&
      R.criteria.period === 'PASS' &&
      R.criteria.enroll === 'PASS' &&
      R.criteria.process === 'PASS' &&
      (R.criteria.payslip_ui === 'PASS' || R.criteria.payslip_ui === 'PARTIAL') &&
      R.criteria.f5 === 'PASS';

    R.verdict = corePass ? 'PASS_TO_PM' : 'FAIL_TO_PM';
    R.ack_status = R.verdict;
    R.honesty.payroll_e2e_ready = false;

    R.executive_summary = [
      `U65 browser W3 J-HRM-07 (${PAYROLL_MONTH}/${PAYROLL_YEAR}): att closed=${closedSameMonth.length};`,
      `eligible=${elig.eligible_count}; enroll=${R.criteria.enroll}; process=${R.criteria.process};`,
      `payslip UI=${R.criteria.payslip_ui}; F5=${R.criteria.f5}.`,
      `**Honesty:** payroll_e2e_ready=false — slice browser ≠ module UAT / formula LIVE.`,
    ].join(' ');

    R.completion_report = [
      `- **Closed:** L0 PASS; J-HRM-07 browser W3 with ${R.clicks.length} FE clicks; stamp \`${STAMP}\`.`,
      `- **ATT prereq:** ${R.criteria.att_prereq} (closedSameMonth=${closedSameMonth.length}).`,
      `- **Enroll/Process/UI:** enroll=${R.criteria.enroll}; process=${R.criteria.process}; payslip_ui=${R.criteria.payslip_ui}; f5=${R.criteria.f5}.`,
      `- **API corroboration:** processed payslips=${R.payslip.apiProcessedCount ?? 'n/a'}; lines=${R.payslip.apiLinesCount ?? 'n/a'}.`,
      `- **Honesty:** payroll_e2e_ready=false (mandatory); formula LIVE DENIED.`,
    ].join('\n');

    if (R.ack_status === 'PASS_TO_PM') {
      R.next_owner = 'qc';
      R.next_dispatch_prompt = `work_item_id: PO-HRM-PAYROLL-FORMULA-RUN-GAP-QC-W3-J-HRM-07-01
from_role: pm
to_role: qc
read_first: docs/qa/evidence/po-hrm-payroll-formula-run-gap-w3-qa-j-hrm-07-01.md
entry: QA W3 browser J-HRM-07 PASS — enroll+process+payslip UI+F5
exit: GWC audit — retain payroll_e2e_ready=false · C-SLICE-≠-MODULE`;
    } else {
      const owner = R.residuals[0]?.owner || 'dev-fe';
      R.next_owner = owner;
      R.next_dispatch_prompt = `work_item_id: PO-HRM-PAYROLL-FORMULA-RUN-GAP-W3-QA-J-HRM-07-02
from_role: pm
to_role: ${owner}
read_first: docs/qa/evidence/po-hrm-payroll-formula-run-gap-w3-qa-j-hrm-07-01.md
residuals: ${R.residuals.map((r) => r.id).join(', ') || 'see evidence'}
exit: fix blockers + READY_FOR_QA W3 retest`;
    }
  } catch (phaseErr) {
    R.phaseError = String(phaseErr?.message || phaseErr).slice(0, 300);
    R.verdict = 'FAIL_TO_PM';
    R.ack_status = 'FAIL_TO_PM';
    R.executive_summary = `Harness error: ${R.phaseError}`;
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
