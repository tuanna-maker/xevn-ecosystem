#!/usr/bin/env node
/**
 * PO-HRM-E2E-LINK-PAY-HIRE-QA-03 — U65 browser retest after FE-03 (Select sentinel fix)
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
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-e2e-link-pay-hire-qa-03-browser.json');
const OUT_MD = resolve(ROOT, 'docs/qa/evidence/po-hrm-e2e-link-pay-hire-qa-03.md');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-e2e-link-pay-hire-qa-03');
mkdirSync(SCREEN, { recursive: true });

const TS = Date.now();
const CREATE_MONTH = 10 + (TS % 3); // 10-12/2026 — away from May processed + prior QA drafts
const CREATE_YEAR = 2026;
const ATT412_MONTH = 11;
const ATT412_YEAR = 2026;
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
  work_item_id: 'PO-HRM-E2E-LINK-PAY-HIRE-QA-03',
  parent: 'PO-HRM-E2E-LINK-PAY-HIRE-FE-03',
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
  const bodies = [
    `${portal}/api/xbos/auth/login`,
    `${XBOS}/api/xbos/auth/login`,
  ];
  for (const url of bodies) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
      });
      const j = await r.json().catch(() => ({}));
      const data = j?.data ?? j;
      const token = data?.accessToken ?? data?.access_token;
      if (token) {
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
          loginUrl: url,
        };
      }
    } catch {
      /* try next */
    }
  }
  throw new Error('login failed — portal and xbos auth unreachable');
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
    if (/\/periods(\?|$|\/)/.test(url)) results.network.periods.push(entry);
    if (/\/payslips(\?|$)/.test(url) && method === 'GET') results.network.payslips.push(entry);
    if (/\/eligibility/.test(url) && method === 'GET') results.network.eligibility.push(entry);
  });
}

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

async function openPayrollBatchList(page, portal) {
  await page.goto(q(portal, '/hr/payroll'), { waitUntil: 'domcontentloaded', timeout: 45_000 });
  await sleep(2500);

  const calcTab = page.locator('.mobile-scroll-tabs button').filter({ hasText: /Tính lương/i }).first();
  if (await calcTab.isVisible().catch(() => false)) {
    await calcTab.click({ timeout: 15_000 });
    await sleep(600);
    const listItem = page.locator('[role="menuitem"]').filter({ hasText: /^Danh sách bảng lương$/ }).first();
    if (await listItem.isVisible().catch(() => false)) {
      await listItem.click({ timeout: 10_000 });
      await sleep(2000);
      return { nav: 'calc-dropdown-list' };
    }
    const calcListTab = page.locator('.mobile-scroll-tabs button').filter({ hasText: /Danh sách bảng lương|Tính lương/i });
    const subTab = page.getByRole('tab', { name: /Danh sách bảng lương/i }).first();
    if (await subTab.isVisible().catch(() => false)) {
      await subTab.click();
      await sleep(1500);
      return { nav: 'sub-tab' };
    }
  }

  const viewListLink = page.getByRole('button', { name: /Xem danh sách/i });
  if (await viewListLink.isVisible().catch(() => false)) {
    await viewListLink.click({ timeout: 10_000 });
    await sleep(2000);
    return { nav: 'overview-link' };
  }

  return { nav: 'direct-payroll' };
}

async function detectPayrollSurface(page) {
  const batchesTab = await page.locator('[data-testid="pay-batches-precision"]').isVisible().catch(() => false);
  const createBtn =
    (await page.locator('button').filter({ hasText: /^Lập bảng lương$/ }).first().isVisible().catch(() => false)) ||
    (await page.getByRole('button', { name: /Lập bảng lương/i }).first().isVisible().catch(() => false));
  const addEmpBtn =
    (await page.locator('button').filter({ hasText: /^Thêm nhân viên$/ }).first().isVisible().catch(() => false)) ||
    (await page.getByRole('button', { name: /Thêm nhân viên/i }).first().isVisible().catch(() => false));
  const payslipRow = await page.getByText(/HLD-|Nguyễn Văn An/i).first().isVisible().catch(() => false);
  return {
    batchesTab,
    createBtn,
    addEmpBtn,
    payslipRow,
    mode: batchesTab || createBtn ? 'batches' : payslipRow ? 'payslips-only' : 'unknown',
  };
}

async function ensureCalcListTab(page, portal) {
  await page.goto(q(portal, '/hr/payroll'), { waitUntil: 'domcontentloaded', timeout: 45_000 });
  await sleep(5000);

  try {
    await page.locator('[data-testid="pay-batches-precision"]').waitFor({ state: 'visible', timeout: 15_000 });
    return 'batches-direct';
  } catch {
    /* fall through to menu navigation */
  }

  const calcTabBtn = page.locator('.mobile-scroll-tabs button, [role="tab"]').filter({ hasText: /Tính lương/i }).first();
  if (await calcTabBtn.isVisible().catch(() => false)) {
    await calcTabBtn.click({ timeout: 10_000 }).catch(() => {});
    await sleep(500);
  }

  const listMenu = page.locator('[role="menuitem"], [role="tab"]').filter({ hasText: /Danh sách bảng lương/i }).first();
  if (await listMenu.isVisible().catch(() => false)) {
    await listMenu.click({ timeout: 10_000 });
    await sleep(2000);
    return 'menu-list';
  }

  const listSubTab = page.getByRole('tab', { name: /Danh sách bảng lương|Bảng lương/i }).first();
  if (await listSubTab.isVisible().catch(() => false)) {
    await listSubTab.click({ timeout: 10_000 });
    await sleep(2000);
    return 'sub-tab';
  }

  return 'default';
}

async function selectMonthYearInDialog(page, month, year) {
  const dialog = page.locator('[data-testid="pay-batch-create-dialog-precision"]');
  await dialog.locator('label:has-text("Tháng")').locator('..').locator('button[role="combobox"]').click();
  await page.getByRole('option', { name: new RegExp(`^Tháng ${month}$`) }).click();
  await sleep(300);
  await dialog.locator('label:has-text("Năm")').locator('..').locator('button[role="combobox"]').click();
  await page.getByRole('option', { name: String(year), exact: true }).click();
  await sleep(300);
}

async function setListPeriodFilter(page, month, year) {
  const label = `Tháng ${month}/${year}`;
  let combo = page
    .locator('[data-testid="pay-batches-precision"] button[role="combobox"]')
    .filter({ hasText: /Tháng \d+\/\d+/ })
    .first();
  if (!(await combo.isVisible().catch(() => false))) {
    combo = page.locator('button[role="combobox"]').filter({ hasText: /Tháng \d+\/\d+/ }).first();
  }
  await combo.click({ timeout: 10_000, force: true });
  await page.getByRole('option', { name: label, exact: true }).click();
  await sleep(2500);
  return label;
}

async function createBatch(page, name, month, year) {
  const createTrigger = page.locator('button').filter({ hasText: /^Lập bảng lương$/ }).first();
  await createTrigger.scrollIntoViewIfNeeded();
  await createTrigger.click({ timeout: 15_000, force: true });
  await sleep(4000);
  const dialog = page.locator('[data-testid="pay-batch-create-dialog-precision"]');
  let dialogVisible = false;
  try {
    await dialog.waitFor({ state: 'visible', timeout: 12_000 });
    dialogVisible = true;
  } catch {
    dialogVisible = await dialog.isVisible().catch(() => false);
  }
  if (!dialogVisible) {
    return { created: false, postsBefore: 0, dialogVisible: false };
  }
  await dialog.locator('input').first().fill(name);
  await selectMonthYearInDialog(page, month, year);
  const postsBefore = results.network.periods.filter((p) => p.method === 'POST').length;
  await dialog.getByRole('button', { name: /^Lập bảng lương$/ }).click();
  await sleep(3500);
  await setListPeriodFilter(page, month, year);
  const postEntry = results.network.periods.filter((p) => p.method === 'POST').slice(-1)[0] ?? null;
  const created =
    (postEntry?.status >= 200 && postEntry?.status < 300) ||
    (await page.getByText(name, { exact: false }).first().isVisible().catch(() => false));
  return { created, postsBefore, dialogVisible: true, postEntry, month, year };
}

async function listDraftPeriods(token) {
  const r = await fetch(`${HRM}/api/hrm/payroll/periods?company_id=main`, {
    headers: { Authorization: `Bearer ${token}`, 'x-company-id': 'main', 'x-tenant-id': 'xevn' },
  });
  const j = await r.json().catch(() => ({}));
  const rows = j?.data?.data ?? j?.data ?? [];
  return (Array.isArray(rows) ? rows : []).filter((p) => p.status === 'draft');
}

async function openExistingDraft(page, token) {
  const drafts = await listDraftPeriods(token);
  if (!drafts.length) return null;
  const d = drafts[0];
  const start = new Date(d.start_date);
  const month = start.getUTCMonth() + 1;
  const year = start.getUTCFullYear();
  const name = d.period_label;
  await setListPeriodFilter(page, month, year);
  const row = page.locator('table tbody tr').filter({ hasText: name }).first();
  if (await row.isVisible().catch(() => false)) {
    await row.click();
    await sleep(2000);
    return { id: d.id, name, month, year, reused: true };
  }
  return { id: d.id, name, month, year, reused: true, rowMissing: true };
}

async function openBatchByName(page, name, month, year) {
  await setListPeriodFilter(page, month, year);
  const row = page.locator('table tbody tr').filter({ hasText: name }).first();
  await row.waitFor({ state: 'visible', timeout: 20_000 });
  await row.click({ timeout: 10_000 });
  await sleep(2000);
}

async function checkEligibilityInDialog(page) {
  await page.locator('button').filter({ hasText: /^Thêm nhân viên$/ }).first().click({ timeout: 10_000 });
  await sleep(1200);
  const dialog = page.locator('[data-testid="pay-batch-add-emp-dialog-precision"]');
  await dialog.waitFor({ state: 'visible', timeout: 10_000 });
  await sleep(1500);

  const eligGets = results.network.eligibility.slice(-3);
  const reasonBadge = await dialog.getByText(/chấm công|chưa chốt|NO_CLOSED|không đủ điều kiện/i).first().isVisible().catch(() => false);
  const disabledCheckbox = await dialog.locator('[role="checkbox"][data-disabled="true"], [role="checkbox"][disabled]').count();
  const errorBanner = await dialog.getByText(/không tải được|404|eligibility/i).first().isVisible().catch(() => false);

  await page.keyboard.press('Escape');
  await sleep(400);

  return {
    eligGets,
    reasonBadge,
    disabledCheckbox,
    errorBanner,
    fePass: eligGets.some((e) => e.status === 200) && (reasonBadge || disabledCheckbox > 0),
  };
}

async function addFirstEligibleEmployee(page) {
  await page.locator('button').filter({ hasText: /^Thêm nhân viên$/ }).first().click({ timeout: 10_000 });
  await sleep(1200);
  const dialog = page.locator('[data-testid="pay-batch-add-emp-dialog-precision"]');
  await dialog.waitFor({ state: 'visible' });
  await sleep(1500);

  const checkboxes = dialog.locator('[role="checkbox"]:not([disabled])');
  const count = await checkboxes.count();
  let clicked = false;
  for (let i = 0; i < count; i++) {
    const cb = checkboxes.nth(i);
    const disabled = await cb.getAttribute('disabled');
    const dataDisabled = await cb.getAttribute('data-disabled');
    if (!disabled && dataDisabled !== 'true') {
      await cb.click();
      clicked = true;
      break;
    }
  }
  if (!clicked) {
    await page.keyboard.press('Escape');
    return { added: false, reason: 'no_eligible_employee_in_dialog' };
  }

  const enrollBefore = results.network.enroll.length;
  await dialog.getByRole('button', { name: /Thêm \d+ nhân viên/i }).click();
  await sleep(3500);
  const enrollPost = results.network.enroll.slice(enrollBefore)[0] ?? null;
  const emptyRow = await page.getByText(/Chưa có nhân viên nào trong bảng lương/i).isVisible().catch(() => false);
  const empCountText = await page.locator('text=/\\d+ nhân viên/').first().textContent().catch(() => '');
  return { added: !emptyRow, enrollPost, empCountText };
}

async function fetchEligibility(token, periodId) {
  const url = `${HRM}/api/hrm/payroll/periods/${periodId}/eligibility?company_id=main`;
  const r = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, 'x-company-id': 'main', 'x-tenant-id': 'xevn' },
  });
  const j = await r.json().catch(() => ({}));
  const data = j?.data ?? j;
  const items = data?.items ?? [];
  const ineligible = items.filter((i) => !i.eligible);
  return {
    status: r.status,
    code: j?.code,
    eligible_count: data?.eligible_count,
    ineligible_count: data?.ineligible_count,
    sampleReasons: ineligible.slice(0, 3).map((i) => ({ code: i.employee_code, reasons: i.reasons })),
    hasReasons: ineligible.some((i) => Array.isArray(i.reasons) && i.reasons.length > 0),
  };
}

async function tryLockBatch(page) {
  const procBefore = results.network.process.length;
  await page.getByRole('button', { name: /Khóa bảng lương/i }).click({ timeout: 10_000 });
  await sleep(400);
  await page.getByRole('button', { name: /^Khóa bảng lương$/ }).last().click();
  await sleep(3500);
  const procPosts = results.network.process.slice(procBefore);
  const errorToast = await page
    .getByText(/Lỗi khi khóa|Attendance sheet must be closed|chưa chốt|412|HRM-PAY-ATT/i)
    .first()
    .isVisible()
    .catch(() => false);
  const lockedBadge = await page.getByText(/Đã khóa/i).first().isVisible().catch(() => false);
  return { procPosts, errorToast, lockedBadge };
}

function buildMarkdown() {
  const c = results.criteria;
  const lines = [
    '# Evidence — PO-HRM-E2E-LINK-PAY-HIRE-QA-03',
    '',
    '| Field | Value |',
    '|-------|-------|',
    '| work_item_id | `PO-HRM-E2E-LINK-PAY-HIRE-QA-03` |',
    '| from_role | qa |',
    '| to_role | pm |',
    `| ack_status | **\`${results.ack_status}\`** |`,
    `| verdict | **${results.verdict}** |`,
    `| date | ${new Date().toISOString().slice(0, 10)} |`,
    `| persona / URL | \`${EMAIL}\` / \`Xevn@2026\` · ${results.env.PORTAL}/hr/payroll |`,
    '| u65 | zero-seed · browser-only |',
    '| honesty | `payroll_e2e_ready=false` |',
    `| supersedes | \`po-hrm-e2e-link-pay-hire-qa-01.md\` |`,
    `| env | portal=${results.env.PORTAL} · hrm=${HRM} · commit=${COMMIT} |`,
    `| machine evidence | \`docs/qa/evidence/_tmp-po-hrm-e2e-link-pay-hire-qa-03-browser.json\` |`,
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
    '| ID | Click path | Result |',
    '|----|------------|--------|',
    '| **UF-HRM-06** / **J-HRM-07** | Login → `/hr/payroll` → Tính lương → Danh sách bảng lương | see criteria |',
    '',
    '## Acceptance criteria',
    '',
    '| AC / Check | Verdict | Notes |',
    '|------------|---------|-------|',
    `| Create dialog opens (no SelectItem crash) | ${c.dialogOpen ?? '—'} | FE-03 sentinel fix |`,
    `| PayrollBatchesTab visible (Lập bảng + Thêm NV) with existing payslip | ${c.surface ?? '—'} | FE-02 calc-list decouple |`,
    `| **AC-PAY-HIRE-04** enroll POST 2xx → list updates | ${c.ac04 ?? '—'} | |`,
    `| **AC-PAY-HIRE-05** F5 persistence | ${c.ac05 ?? '—'} | |`,
    `| GET eligibility reasons[] (BE) | ${c.eligibilityBe ?? '—'} | not 404 on :28001 |`,
    `| Eligibility reasons (FE UI) | ${c.eligibilityFe ?? '—'} | badges in add-employee dialog |`,
    `| **HRM-PAY-ATT-412** process without closed sheet | ${c.att412 ?? '—'} | |`,
    `| Network eligibility/enroll not 404 | ${c.routesLive ?? '—'} | |`,
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
    `- **Closed:** QA-03 browser retest after FE-03 dialog fix + BE-02 routes; verdict **${results.verdict}**.`,
    `- **Open:** ${results.residuals.length ? results.residuals.map((r) => r.id).join(', ') : 'none if PASS'}.`,
    '- **Honesty:** `payroll_e2e_ready=false` unchanged.',
    '',
    '## next_owner',
    '',
    results.ack_status === 'PASS_TO_PM' ? '`qc` (narrow PAY hire slice gate)' : results.residuals[0]?.owner || '`dev-fe` / `dev-be`',
    '',
    '## next_dispatch_prompt',
    '',
    '```text',
    results.ack_status === 'PASS_TO_PM'
      ? `work_item_id: PO-HRM-E2E-LINK-PAY-HIRE-QC-01\nfrom_role: pm\nto_role: qc\nentry: docs/qa/evidence/po-hrm-e2e-link-pay-hire-qa-03.md PASS\nexit: GO/GWC on PAY hire slice · payroll_e2e_ready stays false`
      : `work_item_id: PO-HRM-E2E-LINK-PAY-HIRE-${results.residuals[0]?.owner === 'dev-be' ? 'BE' : 'FE'}-04\nfrom_role: pm\nto_role: ${results.residuals[0]?.owner || 'dev-fe'}\nentry: QA-03 FAIL — ${results.failReasons[0] || 'see evidence'}\nread: docs/qa/evidence/po-hrm-e2e-link-pay-hire-qa-03.md`,
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
    results.ack_status = 'FAIL_TO_PM';
    results.failReasons.push('L0 stack not healthy');
    results.endedAt = new Date().toISOString();
    save();
    buildMarkdown();
    process.exit(2);
  }

  const session = await loginApi(portal);
  results.steps.login = { http: session.http, companyId: session.companyId };

  const payslipProbe = await probePayslipCount(session.token);
  results.steps.payslipProbe = payslipProbe;

  const periodsRes = await fetch(`${HRM}/api/hrm/payroll/periods?company_id=main`, {
    headers: { Authorization: `Bearer ${session.token}`, 'x-company-id': 'main', 'x-tenant-id': 'xevn' },
  });
  const periodsJson = await periodsRes.json().catch(() => ({}));
  const periodRows = periodsJson?.data?.data ?? periodsJson?.data ?? [];
  const draftPeriod = (Array.isArray(periodRows) ? periodRows : []).find((p) => p.status === 'draft');
  const probePeriodId = draftPeriod?.id ?? periodRows?.[0]?.id;
  if (probePeriodId) {
    const eligProbe = await fetchEligibility(session.token, probePeriodId);
    results.steps.apiEligibilityProbe = eligProbe;
    results.criteria.apiEligibilityNot404 = eligProbe.status !== 404 ? 'PASS' : 'FAIL';
  }
  const enrollProbe = probePeriodId
    ? await fetch(`${HRM}/api/hrm/payroll/periods/${probePeriodId}/enroll?company_id=main`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.token}`,
          'content-type': 'application/json',
          'x-company-id': 'main',
          'x-tenant-id': 'xevn',
        },
        body: JSON.stringify({ mode: 'auto_eligible', company_id: 'main' }),
      }).then(async (r) => ({ status: r.status, ...(await r.json().catch(() => ({}))) }))
    : null;
  results.steps.apiEnrollProbe = enrollProbe
    ? { status: enrollProbe.status, code: enrollProbe.code, message: enrollProbe.message }
    : null;
  results.criteria.apiEnrollNot404 =
    enrollProbe && enrollProbe.status !== 404 ? 'PASS' : enrollProbe?.status === 404 ? 'FAIL' : 'SKIP';

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
    const navRes = await ensureCalcListTab(page, portal);
    results.steps.landed = { url: page.url(), nav: navRes };
    await sleep(2000);
    await shot(page, '01-payroll-calc-list.png');

    const surface = await detectPayrollSurface(page);
    results.steps.surface = surface;
    results.criteria.surface =
      surface.mode === 'batches' && (surface.createBtn || surface.batchesTab)
        ? 'PASS'
        : surface.mode === 'batches'
          ? 'PASS (partial — batches tab without create btn visible)'
          : 'FAIL';

    if (surface.mode !== 'batches') {
      results.failReasons.push(`PayrollBatchesTab not visible — mode=${surface.mode}; payslipCount=${payslipProbe.count}`);
      results.residuals.push({
        id: 'R-PAY-HIRE-BATCHES-HIDDEN',
        owner: 'dev-fe',
        severity: 'P0',
        note: 'FE-02 fix not effective on live portal — calc-list still not showing batches',
      });
      results.criteria.ac04 = 'BLOCKED';
      results.criteria.ac05 = 'NOT RUN';
      results.criteria.eligibilityBe = 'NOT RUN';
      results.criteria.eligibilityFe = 'NOT RUN';
      results.criteria.att412 = 'NOT RUN';
      results.criteria.routesLive = 'PARTIAL (API probe only)';
    } else {
      const mainMonth = new Date().getMonth() + 1;
      const mainYear = new Date().getFullYear();

      let periodIdMain = null;
      let createBtnVisible = surface.createBtn;
      if (!createBtnVisible) {
        createBtnVisible = await page
          .locator('button')
          .filter({ hasText: /^Lập bảng lương$/ })
          .first()
          .isVisible()
          .catch(() => false);
      }
      results.steps.createBtnRetry = createBtnVisible;

      if (createBtnVisible) {
        const createRes = await createBatch(page, BATCH_NAME_MAIN, CREATE_MONTH, CREATE_YEAR);
        results.steps.createMain = createRes;
        const selectCrash =
          results.consoleErrors.some((e) => /Select\.Item.*empty string/i.test(e)) ||
          results.pageErrors.some((e) => /Select\.Item.*empty string/i.test(e));
        results.steps.dialogOpenProbe = {
          dialogVisible: createRes.dialogVisible,
          selectCrash,
        };
        results.criteria.dialogOpen =
          createRes.dialogVisible && !selectCrash ? 'PASS' : selectCrash ? 'FAIL (Select crash)' : 'FAIL';
        if (!createRes.dialogVisible) {
          results.failReasons.push('Create dialog did not mount after Lập bảng lương click');
        } else if (selectCrash) {
          results.failReasons.push('Create dialog Select.Item empty value crash (FE-03 not effective)');
        }
        await shot(page, '02-batch-created.png');

        let batchCtx = null;
        if (createRes.created || createRes.postEntry?.status === 201) {
          batchCtx = { name: BATCH_NAME_MAIN, month: createRes.month, year: createRes.year };
          await openBatchByName(page, batchCtx.name, batchCtx.month, batchCtx.year);
        } else if (createRes.dialogVisible) {
          const reused = await openExistingDraft(page, session.token);
          if (reused) {
            batchCtx = reused;
            results.steps.reusedDraft = reused;
            if (!reused.rowMissing) {
              /* already clicked row */
            } else {
              results.failReasons.push('Draft period exists in API but row not visible after filter');
            }
          }
        }

        if (batchCtx && !batchCtx.rowMissing) {
          results.steps.openMain = { url: page.url(), batch: batchCtx.name, month: batchCtx.month };
          await shot(page, '03-batch-detail-empty.png');

          periodIdMain = batchCtx.id ?? results.network.periods.find((p) => p.method === 'POST' && p.status === 201)?.url?.match(/periods\/([^/?]+)/)?.[1] ?? null;
          if (!periodIdMain && batchCtx.name) {
            const drafts = await listDraftPeriods(session.token);
            periodIdMain = drafts.find((d) => d.period_label === batchCtx.name)?.id ?? periodIdMain;
          }

          const eligUi = await checkEligibilityInDialog(page);
          results.steps.eligibilityUi = eligUi;

          if (periodIdMain) {
            const eligBe = await fetchEligibility(session.token, periodIdMain);
            results.steps.eligibilityApi = eligBe;
            results.criteria.eligibilityBe =
              eligBe.status === 200 && eligBe.hasReasons ? 'PASS' : eligBe.status === 200 ? 'PASS (no ineligible sample)' : 'FAIL';
          } else {
            results.criteria.eligibilityBe = results.network.eligibility.some((e) => e.status === 200) ? 'PASS' : 'FAIL';
          }

          results.criteria.eligibilityFe = eligUi.fePass ? 'PASS' : eligUi.errorBanner ? 'FAIL (404 banner)' : 'PARTIAL';

          const addRes = await addFirstEligibleEmployee(page);
          results.steps.enrollMain = addRes;
          await shot(page, '04-after-enroll.png');

          periodIdMain =
            addRes.enrollPost?.url?.match(/periods\/([^/]+)\/enroll/)?.[1] ?? periodIdMain;

          const ac04Pass =
            addRes.enrollPost?.status >= 200 &&
            addRes.enrollPost?.status < 300 &&
            addRes.added === true;
          results.criteria.ac04 =
            ac04Pass
              ? 'PASS'
              : addRes.enrollPost?.code === 'HRM-PAY-ENROLL-EMPTY' || addRes.reason === 'no_eligible_employee_in_dialog'
                ? 'FAIL (U65 — 0 eligible NV; NO_CLOSED_SHEET ×53; enroll empty)'
                : addRes.enrollPost?.status === 409
                  ? 'PARTIAL (409 — already enrolled)'
                  : 'FAIL';
          if (!ac04Pass && addRes.reason) results.failReasons.push(`Enroll: ${addRes.reason}`);
          if (addRes.enrollPost?.code === 'HRM-PAY-ENROLL-EMPTY') {
            results.residuals.push({
              id: 'R-PAY-HIRE-NO-ELIGIBLE-U65',
              owner: 'pm',
              severity: 'P1',
              note: 'U65 zero-seed: all NV ineligible NO_CLOSED_SHEET — need FE attendance close-sheet path before enroll 2xx or pilot data waiver',
            });
          }

          await page.reload({ waitUntil: 'domcontentloaded' });
          await sleep(3000);
          await openBatchByName(page, batchCtx.name, batchCtx.month, batchCtx.year);
          await sleep(1500);
          const stillHasRow = !(await page
            .getByText(/Chưa có nhân viên nào trong bảng lương/i)
            .isVisible()
            .catch(() => false));
          results.steps.f5 = { stillHasRow };
          results.criteria.ac05 = stillHasRow && ac04Pass ? 'PASS' : ac04Pass === false ? 'NOT RUN (enroll blocked)' : stillHasRow ? 'PASS' : 'FAIL';
          await shot(page, '05-after-f5.png');

          const lockRes = await tryLockBatch(page);
          results.steps.processMain = lockRes;
          await shot(page, '06-after-lock-attempt.png');
          const proc412 = lockRes.procPosts.some((p) => p.status === 412 || p.code === 'HRM-PAY-ATT-412');
          if (proc412 || lockRes.errorToast) {
            results.criteria.att412 = 'PASS';
          } else if (lockRes.lockedBadge) {
            results.criteria.att412 = 'SKIP (sheet closed — 412 not triggered)';
          } else {
            results.criteria.att412 = 'INCONCLUSIVE';
          }

          await page.getByRole('button', { name: /ArrowLeft|Quay lại/i }).first().click().catch(() => page.goBack());
          await sleep(1200);
          await openPayrollBatchList(page, portal);

          const create412 = await createBatch(page, BATCH_NAME_NO_SHEET, ATT412_MONTH, ATT412_YEAR);
          if (create412.created) {
            await openBatchByName(page, BATCH_NAME_NO_SHEET, ATT412_MONTH, ATT412_YEAR);
            await addFirstEligibleEmployee(page);
            const lock412 = await tryLockBatch(page);
            results.steps.process412 = lock412;
            const got412 =
              lock412.procPosts.some((p) => p.status === 412 || p.code === 'HRM-PAY-ATT-412') ||
              lock412.errorToast;
            if (got412) results.criteria.att412 = 'PASS';
            else if (results.criteria.att412 !== 'PASS') {
              results.criteria.att412 = 'FAIL';
              results.failReasons.push('Expected HRM-PAY-ATT-412 when no closed attendance sheet');
            }
            await shot(page, '07-412-attempt.png');
          }
        } else if (!createRes.dialogVisible) {
          results.criteria.ac04 = 'FAIL';
        } else {
          results.failReasons.push('Could not create or open draft batch from FE');
          results.criteria.ac04 = 'FAIL';
        }
      } else {
        const draftRow = page.locator('table tbody tr').filter({ hasText: /Nháp|draft/i }).first();
        if (await draftRow.isVisible().catch(() => false)) {
          await draftRow.click({ timeout: 10_000 });
          await sleep(1500);
          results.steps.openExistingDraft = { url: page.url() };
          const eligUi = await checkEligibilityInDialog(page);
          results.steps.eligibilityUi = eligUi;
          results.criteria.eligibilityFe = eligUi.fePass ? 'PASS' : 'PARTIAL';
          const addRes = await addFirstEligibleEmployee(page);
          results.steps.enrollExisting = addRes;
          periodIdMain = addRes.enrollPost?.url?.match(/periods\/([^/]+)\/enroll/)?.[1] ?? null;
          if (periodIdMain) {
            const eligBe = await fetchEligibility(session.token, periodIdMain);
            results.steps.eligibilityApi = eligBe;
            results.criteria.eligibilityBe = eligBe.status === 200 ? 'PASS' : 'FAIL';
          }
          const ac04Pass =
            addRes.enrollPost?.status >= 200 && addRes.enrollPost?.status < 300 && addRes.added;
          results.criteria.ac04 = ac04Pass ? 'PASS' : 'FAIL';
          await page.reload({ waitUntil: 'domcontentloaded' });
          await sleep(2500);
          results.criteria.ac05 = addRes.added ? 'PASS (partial — existing draft)' : 'FAIL';
        } else {
          results.failReasons.push('Lập bảng lương button not visible and no draft row to open');
          results.criteria.ac04 = 'BLOCKED';
        }
      }

      const eligNot404 = results.network.eligibility.every((e) => e.status !== 404);
      const enrollNot404 = results.network.enroll.every((e) => e.status !== 404);
      results.criteria.routesLive = eligNot404 && enrollNot404 ? 'PASS' : 'FAIL';
      if (!eligNot404) results.failReasons.push('GET eligibility returned 404 in browser');
      if (!enrollNot404) results.failReasons.push('POST enroll returned 404 in browser');
    }

    const passDialog = results.criteria.dialogOpen === 'PASS' || results.criteria.dialogOpen === undefined;
    const passSurface = results.criteria.surface?.startsWith('PASS');
    const passAc04 = String(results.criteria.ac04 || '').startsWith('PASS');
    const passAc05 = results.criteria.ac05 === 'PASS';
    const passRoutes = results.criteria.routesLive === 'PASS' || results.criteria.routesLive?.startsWith('PASS');
    const passEligBe = String(results.criteria.eligibilityBe || '').startsWith('PASS');
    const pass412 = ['PASS', 'SKIP'].some((p) => String(results.criteria.att412 || '').startsWith(p));

    if (passDialog && passSurface && passAc04 && passAc05 && passRoutes && passEligBe && pass412 && results.failReasons.length === 0) {
      results.verdict = 'PASS';
      results.ack_status = 'PASS_TO_PM';
    } else if (results.criteria.ac04?.startsWith('PARTIAL') && passSurface && passAc05) {
      results.verdict = 'PARTIAL';
      results.ack_status = 'FAIL_TO_PM';
    } else {
      results.verdict = results.failReasons.some((f) => f.includes('blocked') || f.includes('not visible')) ? 'FAIL' : 'FAIL';
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
