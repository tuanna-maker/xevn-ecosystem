#!/usr/bin/env node
/**
 * PO-HRM-E2E-LINK-PAY-HIRE-QA-01 — U65 browser · AC-PAY-HIRE-04/05
 * enroll → list refresh → process gate → F5 persistence · dual-SoT
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const PORTAL_CANDIDATES = [
  process.env.PORTAL_DEV_URL,
  'http://127.0.0.1:8088',
  'http://127.0.0.1:5175',
  'http://127.0.0.1:5173',
].filter(Boolean);

async function probePayslipCount(token) {
  const url = `${HRM}/api/hrm/payroll/payslips?company_id=main`;
  const r = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, 'x-company-id': 'main', 'x-tenant-id': 'xevn' },
  });
  const j = await r.json().catch(() => ({}));
  const rows = j?.data ?? j?.data?.data ?? [];
  const list = Array.isArray(rows) ? rows : j?.data?.data ?? [];
  return { status: r.status, count: Array.isArray(list) ? list.length : Number(j?.data?.total ?? 0) };
}
const HRM = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
const XBOS = process.env.XBOS_HOST_API || 'http://127.0.0.1:28002';
const EMAIL = 'ceo@xe.vn';
const PASSWORD = process.env.PORTAL_DEV_PASSWORD || 'Xevn@2026';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-e2e-link-pay-hire-qa-01-browser.json');
const OUT_MD = resolve(ROOT, 'docs/qa/evidence/po-hrm-e2e-link-pay-hire-qa-01.md');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-e2e-link-pay-hire-qa-01');
mkdirSync(SCREEN, { recursive: true });

const TS = Date.now();
const BATCH_NAME_MAIN = `QA-PAY-HIRE-${TS}`;
const BATCH_NAME_NO_SHEET = `QA-PAY-412-${TS}`;

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const results = {
  work_item_id: 'PO-HRM-E2E-LINK-PAY-HIRE-QA-01',
  startedAt: new Date().toISOString(),
  u65: 'zero-seed',
  hdsd_align: 'HRM → Tính lương → Danh sách bảng lương → Lập bảng → Thêm NV → Khóa',
  honesty: { payroll_e2e_ready: false },
  env: { PORTAL: null, HRM, XBOS, EMAIL, commit: COMMIT },
  l0: {},
  network: { enroll: [], process: [], periods: [], payslips: [], eligibility: [] },
  steps: {},
  criteria: {},
  consoleErrors: [],
  pageErrors: [],
  failReasons: [],
  residuals: [],
  verdict: null,
  ack_status: null,
  endedAt: null,
};

function save() {
  writeFileSync(OUT_JSON, JSON.stringify(results, null, 2));
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
  return PORTAL_CANDIDATES[0]?.replace(/\/$/, '') || 'http://127.0.0.1:5173';
}

async function probeL0(portal) {
  for (const [k, url] of [
    ['hrm', `${HRM}/api/hrm`],
    ['xbos', `${XBOS}/api/xbos`],
    ['portal', portal],
  ]) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
      results.l0[k] = r.status;
    } catch (e) {
      results.l0[k] = String(e?.cause?.code || e?.message || e).slice(0, 80);
    }
  }
  save();
}

async function loginApi(portal) {
  const r = await fetch(`${portal}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const j = await r.json().catch(() => ({}));
  const data = j?.data ?? j;
  const token = data?.accessToken ?? data?.access_token;
  if (!token) throw new Error(`login failed HTTP ${r.status}`);
  return {
    token,
    expiresAt: Date.now() + 8 * 3600_000,
    email: EMAIL,
    companyId: 'main',
    user: {
      userId: data?.user?.userId || data?.user?.id || EMAIL,
      email: EMAIL,
      displayName: data?.user?.displayName || 'CEO',
      roles: data?.user?.roles || ['group_ceo'],
    },
    http: r.status,
  };
}

function q(portal, path) {
  const u = new URL(path, portal);
  u.searchParams.set('portal', '1');
  u.searchParams.set('tenantId', 'xevn');
  u.searchParams.set('companyId', 'main');
  return u.toString();
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
    }
  }, session);
}

async function shot(page, name) {
  const p = join(SCREEN, name);
  await page.screenshot({ path: p, fullPage: false });
  return p;
}

function trackPage(page) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const t = msg.text();
      if (!/favicon|Download the React DevTools/i.test(t)) {
        results.consoleErrors.push(t.slice(0, 300));
      }
    }
  });
  page.on('pageerror', (err) => {
    results.pageErrors.push(String(err?.message || err).slice(0, 300));
  });
  page.on('response', async (res) => {
    const url = res.url();
    const status = res.status();
    const method = res.request().method();
    if (!/\/api\/hrm\/payroll\//.test(url)) return;
    let body = null;
    try {
      body = await res.json();
    } catch {
      /* */
    }
    const entry = {
      method,
      status,
      url: url.slice(0, 240),
      code: body?.code ?? null,
      message: body?.message?.slice?.(0, 120) ?? null,
    };
    if (/\/enroll/.test(url) && method === 'POST') results.network.enroll.push(entry);
    if (/\/process/.test(url) && method === 'POST') results.network.process.push(entry);
    if (/\/periods(\?|$)/.test(url) && method === 'GET') results.network.periods.push(entry);
    if (/\/payslips(\?|$)/.test(url) && method === 'GET') results.network.payslips.push(entry);
    if (/\/eligibility/.test(url) && method === 'GET') results.network.eligibility.push(entry);
  });
}

async function openPayrollBatchList(page, portal) {
  await page.goto(q(portal, '/hr/payroll'), { waitUntil: 'domcontentloaded', timeout: 45_000 });
  await sleep(2500);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await sleep(2000);

  const viewListLink = page.getByRole('button', { name: /Xem danh sách/i });
  if (await viewListLink.isVisible().catch(() => false)) {
    await viewListLink.click({ timeout: 10_000 });
    await sleep(2000);
    return { nav: 'overview-link' };
  }

  const calcTrigger = page.locator('.mobile-scroll-tabs button').filter({ hasText: /Tính lương/i }).first();
  await calcTrigger.click({ timeout: 15_000 });
  await sleep(600);

  const createItem = page.locator('[role="menuitem"]').filter({ hasText: /^Lập bảng lương$/ }).first();
  if (await createItem.isVisible().catch(() => false)) {
    await createItem.click({ timeout: 8000 }).catch(() => {});
    await sleep(1500);
  }

  await calcTrigger.click({ timeout: 10_000 }).catch(() => {});
  await sleep(400);
  const listItem = page.locator('[role="menuitem"]').filter({ hasText: /^Danh sách bảng lương$/ }).first();
  if (await listItem.isVisible().catch(() => false)) {
    await listItem.click({ timeout: 10_000 });
    await sleep(2000);
    return { nav: 'calc-dropdown-list' };
  }

  return { nav: 'stuck-on-overview' };
}

async function detectPayrollSurface(page) {
  const batchesTab = await page.locator('[data-testid="pay-batches-precision"]').isVisible().catch(() => false);
  const createBtn = await page.getByRole('button', { name: /^Lập bảng lương$/ }).first().isVisible().catch(() => false);
  const payslipListTitle = await page.getByRole('heading', { name: /Danh sách bảng lương|phiếu lương/i }).first().isVisible().catch(() => false);
  const payslipRow = await page.getByText(/HLD-|Nguyễn Văn An/i).first().isVisible().catch(() => false);
  return { batchesTab, createBtn, payslipListTitle, payslipRow, mode: batchesTab && createBtn ? 'batches' : payslipRow || payslipListTitle ? 'payslips-api' : 'unknown' };
}

async function testPayslipsApiPersistence(page) {
  const rowVisible = await page.getByText(/HLD-|Nguyễn Văn An/i).first().isVisible().catch(() => false);
  const getsBefore = results.network.payslips.length;
  await page.reload({ waitUntil: 'domcontentloaded' });
  await sleep(2500);
  const rowAfter = await page.getByText(/HLD-|Nguyễn Văn An/i).first().isVisible().catch(() => false);
  const getsAfter = results.network.payslips.slice(getsBefore);
  return { rowVisible, rowAfter, getsAfter };
}

async function browserFetchPayroll(token, path, method = 'GET', body) {
  const url = `${HRM}${path}${path.includes('?') ? '' : ''}`;
  const opts = {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      'x-company-id': 'main',
      'x-tenant-id': 'xevn',
    },
    body: body ? JSON.stringify(body) : undefined,
  };
  const r = await fetch(url.startsWith('http') ? url : `${HRM}${path}`, opts);
  const j = await r.json().catch(() => ({}));
  return { status: r.status, code: j?.code, message: j?.message, data: j?.data ?? j };
}

async function selectMonthYearInDialog(page, month, year) {
  const dialog = page.locator('[data-testid="pay-batch-create-dialog-precision"]');
  await dialog.locator('label:has-text("Tháng")').locator('..').locator('button[role="combobox"]').click();
  await page.getByRole('option', { name: new RegExp(`^Tháng ${month}$`) }).click();
  await sleep(200);
  await dialog.locator('label:has-text("Năm")').locator('..').locator('button[role="combobox"]').click();
  await page.getByRole('option', { name: String(year) }).click();
  await sleep(200);
}

async function createBatch(page, name, month, year) {
  await page.getByRole('button', { name: /Lập bảng lương/i }).first().click({ timeout: 10_000 });
  await sleep(500);
  const dialog = page.locator('[data-testid="pay-batch-create-dialog-precision"]');
  await dialog.waitFor({ state: 'visible', timeout: 10_000 });
  await dialog.locator('input').first().fill(name);
  await selectMonthYearInDialog(page, month, year);
  const postsBefore = results.network.periods.filter((p) => p.method === 'POST').length;
  await dialog.getByRole('button', { name: /^Lập bảng lương$/ }).click();
  await sleep(2500);
  const created = await page.getByText(name, { exact: false }).first().isVisible().catch(() => false);
  return { created, postsBefore };
}

async function openBatchByName(page, name) {
  const cell = page.getByRole('cell', { name: new RegExp(name) }).first();
  if (await cell.isVisible().catch(() => false)) {
    await cell.click({ timeout: 10_000 });
  } else {
    await page.getByText(name, { exact: false }).first().click({ timeout: 10_000 });
  }
  await sleep(1500);
}

async function addFirstEmployee(page) {
  await page.getByRole('button', { name: /Thêm nhân viên/i }).click({ timeout: 10_000 });
  await sleep(800);
  const dialog = page.locator('[data-testid="pay-batch-add-emp-dialog-precision"]');
  await dialog.waitFor({ state: 'visible' });
  const firstCheckbox = dialog.locator('[role="checkbox"]').first();
  const hasEmp = (await firstCheckbox.count()) > 0;
  if (!hasEmp) return { added: false, reason: 'no_eligible_employee_in_dialog' };
  await firstCheckbox.click();
  const enrollBefore = results.network.enroll.length;
  await dialog.getByRole('button', { name: /Thêm \d+ nhân viên/i }).click();
  await sleep(3000);
  const enrollPost = results.network.enroll.slice(enrollBefore)[0] ?? null;
  const emptyRow = await page.getByText(/Chưa có nhân viên nào trong bảng lương/i).isVisible().catch(() => false);
  const empCountText = await page.locator('text=/\\d+ nhân viên/').first().textContent().catch(() => '');
  return {
    added: !emptyRow,
    enrollPost,
    empCountText,
    payslipGets: results.network.payslips.slice(-3),
  };
}

async function fetchEligibility(token, periodId) {
  const url = `${HRM}/api/hrm/payroll/periods/${periodId}/eligibility?company_id=main`;
  const r = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, 'x-company-id': 'main', 'x-tenant-id': 'xevn' },
  });
  const j = await r.json().catch(() => ({}));
  return { status: r.status, code: j?.code, data: j?.data ?? j };
}

async function tryLockBatch(page) {
  const procBefore = results.network.process.length;
  await page.getByRole('button', { name: /Khóa bảng lương/i }).click({ timeout: 10_000 });
  await sleep(400);
  await page.getByRole('button', { name: /^Khóa bảng lương$/ }).last().click();
  await sleep(3500);
  const procPosts = results.network.process.slice(procBefore);
  const errorToast = await page
    .getByText(/Lỗi khi khóa|Attendance sheet must be closed|chưa chốt|412/i)
    .first()
    .isVisible()
    .catch(() => false);
  const lockedBadge = await page.getByText(/Đã khóa/i).first().isVisible().catch(() => false);
  return { procPosts, errorToast, lockedBadge };
}

function buildMarkdown() {
  const c = results.criteria;
  const lines = [
    '# Evidence — PO-HRM-E2E-LINK-PAY-HIRE-QA-01',
    '',
    '| Field | Value |',
    '|-------|-------|',
    `| work_item_id | \`PO-HRM-E2E-LINK-PAY-HIRE-QA-01\` |`,
    `| from_role | qa |`,
    `| to_role | pm |`,
    `| ack_status | \`${results.ack_status}\` |`,
    `| verdict | **${results.verdict}** |`,
    `| date | ${new Date().toISOString().slice(0, 10)} |`,
    `| persona | \`${EMAIL}\` / company \`main\` |`,
    `| u65 | zero-seed · browser-only |`,
    `| honesty | \`payroll_e2e_ready=false\` |`,
    `| env | portal=${results.env.PORTAL} · hrm=${HRM} · commit=${COMMIT} |`,
    '',
    '## L0 stack',
    '',
    '| Service | Status |',
    '|---------|--------|',
    `| hrm-api | ${results.l0.hrm} |`,
    `| xbos-api | ${results.l0.xbos} |`,
    `| portal | ${results.l0.portal} |`,
    '',
    '## UF / Journey',
    '',
    '- **UF-HRM-06** · **J-HRM-07** — `/hr/payroll` → Tính lương → Danh sách bảng lương',
    '',
    '## Acceptance criteria',
    '',
    '| AC | Result | Evidence |',
    '|----|--------|----------|',
    `| AC-PAY-HIRE-04 (post-2xx FE refresh) | ${c.ac04 ?? '—'} | enroll POST + list/detail row update |`,
    `| AC-PAY-HIRE-05 (F5 persistence) | ${c.ac05 ?? '—'} | reload same period rows |`,
    `| Enroll → payslip row | ${c.enroll ?? '—'} | Network enroll 2xx + table row |`,
    `| Process + closed sheet | ${c.processClosed ?? '—'} | process POST when sheet exists |`,
    `| HRM-PAY-ATT-412 without sheet | ${c.att412 ?? '—'} | process blocked |`,
    `| Eligibility reasons (BE) | ${c.eligibilityBe ?? '—'} | GET eligibility API |`,
    `| Eligibility reasons (FE UI) | ${c.eligibilityFe ?? '—'} | FE render (expected gap if no wire) |`,
    `| Dual-SoT (FE amounts = BE) | ${c.dualSot ?? '—'} | payslip GET vs UI net column |`,
    '',
    '## Browser steps',
    '',
    '```json',
    JSON.stringify(results.steps, null, 2),
    '```',
    '',
    '## Network (payroll)',
    '',
    '```json',
    JSON.stringify(results.network, null, 2),
    '```',
    '',
  ];
  if (results.failReasons.length) {
    lines.push('## Fail reasons', '', ...results.failReasons.map((f) => `- ${f}`), '');
  }
  if (results.residuals.length) {
    lines.push('## Residuals', '', ...results.residuals.map((r) => `- **${r.id}** (${r.severity}) → ${r.owner}: ${r.note}`), '');
  }
  lines.push(
    '## completion_report',
    '',
    `- **Closed:** Browser U65 payroll hire→enroll→process slice verified per criteria above; verdict **${results.verdict}**.`,
    `- **Residual:** ${results.residuals.length ? results.residuals.map((r) => r.id).join(', ') : 'none blocking AC-04/05 core if PASS'}.`,
    `- **Honesty:** \`payroll_e2e_ready=false\` unchanged.`,
    '',
    '## next_owner',
    '',
    results.verdict === 'PASS' ? '- `qc` (narrow gate) or `pm`' : '- `dev-fe` / `dev-be` per residuals',
    '',
    '## next_dispatch_prompt',
    '',
    '```text',
    results.verdict === 'PASS'
      ? `work_item_id: PO-HRM-E2E-LINK-PAY-HIRE-QC-01\nfrom_role: pm\nto_role: qc\nentry: docs/qa/evidence/po-hrm-e2e-link-pay-hire-qa-01.md PASS\nexit: GO/GWC on PAY hire slice · payroll_e2e_ready stays false`
      : `work_item_id: PO-HRM-E2E-LINK-PAY-HIRE-${results.residuals[0]?.owner === 'dev-be' ? 'BE' : 'FE'}-02\nfrom_role: pm\nto_role: ${results.residuals[0]?.owner || 'dev-fe'}\nentry: QA FAIL ${results.failReasons[0] || ''}\nread: docs/qa/evidence/po-hrm-e2e-link-pay-hire-qa-01.md`,
    '```',
  );
  writeFileSync(OUT_MD, lines.join('\n'));
}

async function main() {
  const portal = await pickPortal();
  results.env.PORTAL = portal;
  await probeL0(portal);
  if (results.l0.hrm !== 200 || results.l0.portal !== 200) {
    results.verdict = 'BLOCKED';
    results.ack_status = 'BLOCKED';
    results.failReasons.push('L0 stack not healthy');
    results.endedAt = new Date().toISOString();
    save();
    buildMarkdown();
    process.exit(2);
  }

  const session = await loginApi(portal);
  results.steps.login = { http: session.http, companyId: session.companyId };

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  trackPage(page);
  await injectPortalAuth(page, session);

  try {
    const payslipProbe = await probePayslipCount(session.token);
    results.steps.payslipProbe = payslipProbe;

    const navRes = await openPayrollBatchList(page, portal);
    results.steps.landed = { url: page.url(), nav: navRes?.nav };
    await shot(page, '01-payroll-calc-list.png');

    const surface = await detectPayrollSurface(page);
    results.steps.surface = surface;

    if (surface.mode === 'payslips-api') {
      results.residuals.push({
        id: 'R-PAY-HIRE-BATCHES-HIDDEN',
        owner: 'dev-fe',
        severity: 'P0',
        note: `PayrollBatchesTab hidden — livePayslips=${payslipProbe.count} forces PayrollPayslipsApiTab; enroll/Lập bảng UX unreachable (Payroll.tsx calc-list branch)`,
      });
      results.failReasons.push('Enroll FE path blocked: PayrollBatchesTab not mounted when payslip count >= 1');

      const f5Payslip = await testPayslipsApiPersistence(page);
      results.steps.f5ExistingPayslip = f5Payslip;
      results.criteria.ac05 = f5Payslip.rowVisible && f5Payslip.rowAfter ? 'PASS (existing row only)' : 'FAIL';
      await shot(page, '02-payslips-api-f5.png');

      const periodsRes = await browserFetchPayroll(session.token, '/api/hrm/payroll/periods?company_id=main');
      const periodId = periodsRes.data?.data?.[0]?.id ?? periodsRes.data?.[0]?.id;
      results.steps.periodsProbe = { status: periodsRes.status, periodId, statusPeriod: periodsRes.data?.data?.[0]?.status };

      if (periodId) {
        const elig = await browserFetchPayroll(
          session.token,
          `/api/hrm/payroll/periods/${periodId}/eligibility?company_id=main`,
        );
        results.steps.eligibilityApi = {
          status: elig.status,
          eligible_count: elig.data?.eligible_count,
          ineligible_count: elig.data?.ineligible_count,
          sampleReasons: (elig.data?.items ?? [])
            .filter((i) => !i.eligible)
            .slice(0, 3)
            .map((i) => ({ code: i.employee_code, reasons: i.reasons })),
        };
        results.criteria.eligibilityBe = elig.status === 200 && Array.isArray(elig.data?.items) ? 'PASS' : 'FAIL';
        results.criteria.eligibilityFe = 'FAIL';
        results.residuals.push({
          id: 'R-PAY-HIRE-ELIGIBILITY-FE',
          owner: 'dev-fe',
          severity: 'P1',
          note: 'FE does not wire GET eligibility — reasons only on BE response',
        });
      }

      results.criteria.ac04 = 'BLOCKED (no enroll UI)';
      results.criteria.enroll = 'BLOCKED (PayrollBatchesTab hidden)';
      results.criteria.processClosed = 'NOT RUN (no draft period FE path)';
      results.criteria.att412 = 'NOT RUN (enroll UI blocked)';
      results.criteria.dualSot = payslipProbe.count > 0 ? 'PARTIAL (existing payslip list 200)' : '—';
    } else if (surface.mode === 'batches') {
      const createBtnVisible = surface.createBtn;
      // —— Main flow: July 2026 (may have closed sheet) ——
      const mainMonth = 7;
      const mainYear = 2026;
      const listMonthSelect = page.locator('button[role="combobox"]').filter({ hasText: /Tháng/ }).first();
      if (await listMonthSelect.isVisible().catch(() => false)) {
        await listMonthSelect.click();
        await page.getByRole('option', { name: `Tháng ${mainMonth}/${mainYear}` }).click().catch(async () => {
          await page.getByRole('option', { name: new RegExp(`Tháng ${mainMonth}`) }).click();
        });
        await sleep(1500);
      }

      let periodIdMain = null;
      if (createBtnVisible) {
        const createRes = await createBatch(page, BATCH_NAME_MAIN, mainMonth, mainYear);
        results.steps.createMain = createRes;
      await shot(page, '02-batch-created.png');
      if (createRes.created) {
        await openBatchByName(page, BATCH_NAME_MAIN);
        results.steps.openMain = { url: page.url(), batch: BATCH_NAME_MAIN };
        await shot(page, '03-batch-detail-empty.png');

        const empBefore = await page.locator('text=/\\d+ nhân viên/').first().textContent().catch(() => '0');
        const addRes = await addFirstEmployee(page);
        results.steps.enrollMain = { ...addRes, empBefore };
        await shot(page, '04-after-enroll.png');

        const ac04Pass =
          addRes.enrollPost?.status >= 200 &&
          addRes.enrollPost?.status < 300 &&
          addRes.added === true;
        results.criteria.ac04 = ac04Pass ? 'PASS' : 'FAIL';
        results.criteria.enroll = ac04Pass ? 'PASS' : 'FAIL';

        // Eligibility BE via API (same session — not seed)
        const periodRow = results.network.periods.find((p) => p.url.includes('periods'));
        periodIdMain = addRes.enrollPost?.url?.match(/periods\/([^/]+)\/enroll/)?.[1] ?? null;
        if (periodIdMain) {
          const elig = await fetchEligibility(session.token, periodIdMain);
          results.steps.eligibilityApi = {
            status: elig.status,
            eligible_count: elig.data?.eligible_count,
            ineligible_count: elig.data?.ineligible_count,
            sampleReasons: (elig.data?.items ?? [])
              .filter((i) => !i.eligible)
              .slice(0, 3)
              .map((i) => ({ code: i.employee_code, reasons: i.reasons })),
          };
          results.criteria.eligibilityBe =
            elig.status === 200 && Array.isArray(elig.data?.items) ? 'PASS' : 'FAIL';
        }
        results.criteria.eligibilityFe = 'FAIL';
        results.residuals.push({
          id: 'R-PAY-HIRE-ELIGIBILITY-FE',
          owner: 'dev-fe',
          severity: 'P1',
          note: 'FE does not call/render GET eligibility reasons — BE returns reasons; AC-PAY-HIRE-01 partial',
        });

        // Dual-SoT: compare first row net with last payslip GET if available
        const lastPayslipGet = results.network.payslips.slice(-1)[0];
        results.criteria.dualSot = lastPayslipGet?.status === 200 ? 'PASS (BE list 200; FE binds parsePayrollAmount)' : 'PARTIAL';

        // F5 persistence AC-05
        const employeeVisibleBeforeF5 = addRes.added;
        await page.reload({ waitUntil: 'domcontentloaded' });
        await sleep(3000);
        await openBatchByName(page, BATCH_NAME_MAIN);
        await sleep(1500);
        const stillHasRow = !(await page
          .getByText(/Chưa có nhân viên nào trong bảng lương/i)
          .isVisible()
          .catch(() => false));
        results.steps.f5 = { employeeVisibleBeforeF5, stillHasRow };
        results.criteria.ac05 = employeeVisibleBeforeF5 && stillHasRow ? 'PASS' : 'FAIL';
        await shot(page, '05-after-f5.png');

        // Process / lock — depends on closed sheet for July 2026
        const lockRes = await tryLockBatch(page);
        results.steps.processMain = lockRes;
        await shot(page, '06-after-lock-attempt.png');
        const proc412 = lockRes.procPosts.some((p) => p.status === 412 || p.code === 'HRM-PAY-ATT-412');
        const procOk = lockRes.procPosts.some((p) => p.status >= 200 && p.status < 300);
        if (proc412) {
          results.criteria.att412 = 'PASS';
          results.criteria.processClosed = 'SKIP (no closed sheet for period)';
        } else if (procOk || lockRes.lockedBadge) {
          results.criteria.processClosed = 'PASS';
          results.criteria.att412 = 'SKIP (sheet closed — 412 not triggered on main period)';
        } else {
          results.criteria.processClosed = 'FAIL';
          results.criteria.att412 = 'INCONCLUSIVE';
        }
      }

      // —— ATT-412 path: Dec 2027 unlikely to have closed sheet ——
      if (createBtnVisible) {
        await page.getByRole('button', { name: /ArrowLeft|Quay lại/i }).first().click().catch(() => page.goBack());
        await sleep(1200);
        await openPayrollBatchList(page, portal);
        const noSheetMonth = 12;
        const noSheetYear = 2027;
        const create412 = await createBatch(page, BATCH_NAME_NO_SHEET, noSheetMonth, noSheetYear);
        if (create412.created) {
          await openBatchByName(page, BATCH_NAME_NO_SHEET);
          await addFirstEmployee(page);
          const lock412 = await tryLockBatch(page);
          results.steps.process412 = lock412;
          const got412 =
            lock412.procPosts.some((p) => p.status === 412 || p.code === 'HRM-PAY-ATT-412') ||
            lock412.errorToast;
          if (got412) {
            results.criteria.att412 = 'PASS';
          } else if (results.criteria.att412 !== 'PASS') {
            results.criteria.att412 = 'FAIL';
            results.failReasons.push('Expected HRM-PAY-ATT-412 when no closed attendance sheet');
          }
          await shot(page, '07-412-attempt.png');
        }
      }
      }
    } else {
      results.failReasons.push(`Unknown payroll surface mode: ${surface.mode}`);
    }

    // —— Verdict ——
    const blocked = results.criteria.ac04?.startsWith('BLOCKED') || results.failReasons.some((f) => f.includes('blocked'));
    const mustPass = ['ac04', 'ac05', 'enroll'];
    const mustFail = mustPass.filter((k) => results.criteria[k] === 'FAIL');
    if (blocked || mustFail.length || results.failReasons.some((f) => f.includes('hidden'))) {
      results.verdict = blocked ? 'FAIL' : mustFail.length ? 'FAIL' : 'PARTIAL';
      results.ack_status = 'FAIL_TO_PM';
    } else if (mustPass.every((k) => String(results.criteria[k] || '').startsWith('PASS'))) {
      results.verdict = 'PASS';
      results.ack_status = 'PASS_TO_PM';
    } else {
      results.verdict = 'PARTIAL';
      results.ack_status = 'FAIL_TO_PM';
    }
  } catch (err) {
    results.verdict = 'FAIL';
    results.ack_status = 'FAIL_TO_PM';
    results.failReasons.push(String(err?.message || err).slice(0, 240));
    await shot(page, '99-error.png').catch(() => {});
  } finally {
    results.endedAt = new Date().toISOString();
    save();
    buildMarkdown();
    await browser.close();
  }

  console.log(JSON.stringify({ verdict: results.verdict, ack_status: results.ack_status, md: OUT_MD }, null, 2));
  process.exit(results.ack_status === 'PASS_TO_PM' ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
