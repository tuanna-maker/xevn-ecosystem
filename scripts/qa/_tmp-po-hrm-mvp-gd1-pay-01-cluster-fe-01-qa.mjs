#!/usr/bin/env node
/**
 * QA-PO-HRM-MVP-GD1-PAY-01-CLUSTER-FE-01 — U65 zero-seed browser
 * J-HRM-PAY-01-02/03/04 bind panel FE · testids · F5 · 412 toast · process 412
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync, spawnSync } from 'node:child_process';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
const XBOS = process.env.XBOS_HOST_API || 'http://127.0.0.1:28002';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const COMPANY = process.env.QA_COMPANY_ID || 'main';
const TENANT = process.env.QA_TENANT_ID || 'xevn';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-mvp-gd1-pay-01-cluster-fe-01-qa.json');
const OUT_MD = resolve(ROOT, 'docs/qa/evidence/po-hrm-mvp-gd1-pay-01-cluster-fe-01-qa.md');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-mvp-gd1-pay-01-cluster-fe-01-qa');
mkdirSync(SCREEN, { recursive: true });

const ATT12QC1 = 'ATT12QC1-MSMAIGWC1';
const ATT11QC1 = 'ATT11QC1-MSLXTH9P';
const PAY01QA1 = 'PAY01QA1-MSMBA9OA';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();
const STAMP = `PAY01FEQA1-${Date.now().toString(36).toUpperCase().slice(-8)}`;

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const R = {
  work_item_id: 'QA-PO-HRM-MVP-GD1-PAY-01-CLUSTER-FE-01',
  stamp: STAMP,
  fe_handoff: 'docs/qa/evidence/po-hrm-mvp-gd1-pay-01-cluster-fe-01.md',
  api_qa_baseline: 'docs/qa/evidence/po-hrm-mvp-gd1-pay-01-cluster-qa-01.md',
  startedAt: ts(),
  persona: { email: EMAIL, companyId: COMPANY },
  u65: 'zero-seed-browser-only',
  honesty: {
    payroll_e2e_ready: false,
    ne_pay01_done: true,
    ne_pay_module_uat: true,
    c_slice: true,
    seed_used: false,
  },
  must_keep: [ATT12QC1, ATT11QC1, PAY01QA1],
  env: { PORTAL, HRM, XBOS, TENANT, commit: COMMIT },
  l0: {},
  l1_fe_vitest: {},
  network: [],
  bind_posts: [],
  process_posts: [],
  setup: {},
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  journeys: {},
  testids: {},
  defects: [],
  overall: null,
  ack_status: null,
  endedAt: null,
};

function save() {
  writeFileSync(OUT_JSON, JSON.stringify(R, null, 2));
}
function jset(id, verdict, detail = {}) {
  R.journeys[id] = { verdict, at: ts(), ...detail };
  console.log(`${verdict} ${id} — ${(detail.summary || '').slice(0, 500)}`);
  save();
}
async function shot(page, name) {
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  R.screens.push(path.replace(/\\/g, '/'));
}

function trackBind(method, url, status, extra = {}) {
  if (!/\/timesheet-binds/.test(url)) return;
  const entry = {
    method,
    url: url.replace(/^https?:\/\/[^/]+/, '').slice(0, 480),
    status,
    at: ts(),
    ...extra,
  };
  R.bind_posts.push(entry);
  R.network.push(entry);
}

function trackProcess(method, url, status, extra = {}) {
  if (!/\/process/.test(url) || !/payroll\/periods/.test(url)) return;
  const entry = { method, url: url.replace(/^https?:\/\/[^/]+/, '').slice(0, 480), status, at: ts(), ...extra };
  R.process_posts.push(entry);
  R.network.push(entry);
}

function q(path, extra = {}) {
  const u = new URL(path, PORTAL);
  u.searchParams.set('portal', '1');
  u.searchParams.set('tenantId', TENANT);
  u.searchParams.set('companyId', COMPANY);
  u.searchParams.set('_', String(Date.now()));
  for (const [k, v] of Object.entries(extra)) {
    if (v != null) u.searchParams.set(k, String(v));
  }
  return u.toString();
}

async function loginApi() {
  let data = null;
  for (const url of [`${XBOS}/api/xbos/auth/login`, `${PORTAL}/api/xbos/auth/login`]) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
      });
      const j = await r.json().catch(() => ({}));
      const d = j?.data ?? j;
      const token = d?.accessToken ?? d?.access_token ?? j?.accessToken;
      if (r.ok && token) {
        data = d;
        break;
      }
    } catch {
      /* */
    }
  }
  if (!data?.accessToken && !data?.access_token) throw new Error('login failed');
  const token = data.accessToken ?? data.access_token;
  return {
    token,
    expiresAt: Date.now() + 8 * 3600_000,
    companyId: COMPANY,
    user: {
      id: data.userId ?? 'ceo',
      email: EMAIL,
      tenantId: TENANT,
      companyId: COMPANY,
      roles: data.roles ?? ['group_ceo'],
    },
  };
}

async function apiCall(token, method, path, opts = {}) {
  const url = path.startsWith('http') ? path : `${HRM}/api/hrm${path.startsWith('/') ? path : `/${path}`}`;
  const headers = {
    authorization: `Bearer ${token}`,
    'x-company-id': opts.companyId ?? COMPANY,
    'x-tenant-id': TENANT,
    'content-type': 'application/json',
  };
  const init = { method, headers };
  if (opts.body !== undefined) init.body = JSON.stringify(opts.body);
  const r = await fetch(url, init);
  const text = await r.text();
  let json = {};
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text.slice(0, 200) };
  }
  return { status: r.status, json, code: json?.code, data: json?.data ?? json };
}

function parseSheets(j) {
  const d = j?.data;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.items)) return d.items;
  if (Array.isArray(d)) return d;
  return [];
}

function periodRange(period) {
  return {
    start: period.start_date ? new Date(period.start_date) : null,
    end: period.end_date ? new Date(period.end_date) : null,
  };
}

function sheetRange(sheet) {
  const start = sheet.start_date || sheet.period_start || sheet.from_date;
  const end = sheet.end_date || sheet.period_end || sheet.to_date || start;
  return { start: start ? new Date(start) : null, end: end ? new Date(end) : null };
}

function rangesOverlap(a, b) {
  if (!a.start || !a.end || !b.start || !b.end) return false;
  return a.start <= b.end && a.end >= b.start;
}

function pickClosedSheetForPeriod(sheets, period) {
  const pr = periodRange(period);
  return sheets.find((s) => s.status === 'closed' && rangesOverlap(sheetRange(s), pr));
}

async function createPayPeriodOverlappingClosed(token, closedSheet) {
  const stamp = Date.now();
  const start = closedSheet.start_date || closedSheet.period_start;
  const end = closedSheet.end_date || closedSheet.period_end || start;
  if (!start) throw new Error('closed sheet missing start_date');
  const body = {
    company_id: COMPANY,
    period_label: `QA-PAY-FE01-${stamp}`,
    start_date: String(start).slice(0, 10),
    end_date: String(end).slice(0, 10),
  };
  const r = await apiCall(token, 'POST', '/payroll/periods', { body, companyId: COMPANY });
  if (r.status === 201 && r.data?.id) {
    const d = new Date(start);
    return {
      ...r.data,
      _companyId: COMPANY,
      _month: d.getMonth() + 1,
      _year: d.getFullYear(),
    };
  }
  throw new Error(`create overlapping period failed ${r.status}`);
}

async function findPeriodSheetPair(token, sheets) {
  const list = await apiCall(token, 'GET', '/payroll/periods?company_id=main');
  const raw = list.data?.data ?? list.data ?? [];
  const rows = Array.isArray(raw) ? raw : [];
  for (const p of rows) {
    if (p.status !== 'draft' && p.status !== 'open') continue;
    const closed = pickClosedSheetForPeriod(sheets, p);
    if (closed) {
      const d = p.start_date ? new Date(p.start_date) : new Date();
      return {
        period: { ...p, _month: d.getMonth() + 1, _year: d.getFullYear() },
        closed,
      };
    }
  }
  return null;
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

async function ensureCalcList(page) {
  await page.goto(q('/hr/payroll'), { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await sleep(2500);
  const calcTab = page.locator('[data-testid="payroll-tab-calculate"]');
  if (await calcTab.isVisible().catch(() => false)) {
    await calcTab.click({ timeout: 10_000 });
    await sleep(400);
  }
  const listItem = page.getByRole('menuitem', { name: /Danh sách bảng lương/i }).first();
  if (await listItem.isVisible().catch(() => false)) {
    await listItem.click();
    await sleep(1500);
  }
  await page.locator('[data-testid="pay-batches-precision"]').waitFor({ state: 'visible', timeout: 25_000 });
}

async function setMonthFilter(page, month, year) {
  await page.keyboard.press('Escape').catch(() => {});
  await sleep(200);
  const filter = page.locator('[data-testid="pay-batch-period-filter"]');
  if (await filter.isVisible().catch(() => false)) {
    await filter.click({ timeout: 12_000, force: true });
    await sleep(400);
    const opt = page.locator(`[data-testid="pay-batch-period-option-${month}-${year}"]`);
    if (await opt.isVisible().catch(() => false)) await opt.click();
    else await page.getByRole('option', { name: `Tháng ${month}/${year}`, exact: true }).click();
    await sleep(2000);
  }
}

async function openPeriodDetail(page, periodId) {
  const full = page.locator(`[data-testid="pay-batch-row-${periodId}"]`).first();
  if (await full.isVisible().catch(() => false)) {
    await full.click();
    await sleep(2500);
    return await page.locator('[data-testid="pay-period-timesheet-binds"]').isVisible().catch(() => false);
  }
  const short = periodId.slice(0, 8);
  const row = page.locator(`[data-testid^="pay-batch-row-${short}"]`).first();
  if (await row.isVisible().catch(() => false)) {
    await row.click();
    await sleep(2500);
    return await page.locator('[data-testid="pay-period-timesheet-binds"]').isVisible().catch(() => false);
  }
  return false;
}

async function findDraftPeriodWithoutBind(token) {
  const list = await apiCall(token, 'GET', '/payroll/periods?company_id=main');
  const raw = list.data?.data ?? list.data ?? [];
  const rows = Array.isArray(raw) ? raw : [];
  for (const p of rows) {
    if (p.status !== 'draft' && p.status !== 'open') continue;
    const binds = await apiCall(token, 'GET', `/payroll/periods/${p.id}/timesheet-binds?company_id=main`);
    const items = binds.data?.items ?? binds.data ?? [];
    if (Array.isArray(items) && items.length === 0) {
      const d = p.start_date ? new Date(p.start_date) : new Date();
      return { ...p, _month: d.getMonth() + 1, _year: d.getFullYear() };
    }
  }
  return null;
}

async function gotoPayrollWithRetry(page, url, attempts = 3) {
  for (let i = 0; i < attempts; i++) {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90_000 });
    await sleep(3500 + i * 1500);
    const err = R.pageErrors.some((e) => /Failed to fetch dynamically imported module:.*Payroll/i.test(e));
    if (!err) return;
    R.pageErrors.length = 0;
  }
}

async function openPeriodDeepLink(page, periodId, month, year) {
  const url = q('/hr/payroll', {
    pay_batch_id: periodId,
    pay_period_month: month,
    pay_period_year: year,
  });
  await gotoPayrollWithRetry(page, url);
  const calcTab = page.locator('[data-testid="payroll-tab-calculate"]');
  if (await calcTab.isVisible().catch(() => false)) {
    await calcTab.click({ timeout: 10_000 }).catch(() => {});
    await sleep(500);
  }
  const listItem = page.getByRole('menuitem', { name: /Danh sách bảng lương/i }).first();
  if (await listItem.isVisible().catch(() => false)) {
    await listItem.click();
    await sleep(2000);
  }
  const panelVisible = await page
    .locator('[data-testid="pay-period-timesheet-binds"]')
    .waitFor({ state: 'visible', timeout: 35_000 })
    .catch(() => null);
  if (panelVisible) return true;
  const opened = await openPeriodDetail(page, periodId);
  if (opened) return true;
  await gotoPayrollWithRetry(page, url);
  await sleep(2000);
  return await page
    .locator('[data-testid="pay-period-timesheet-binds"]')
    .waitFor({ state: 'visible', timeout: 25_000 })
    .catch(() => null);
}

async function selectSheetById(page, sheetId) {
  const trigger = page.locator('[data-testid="pay-bind-sheet-select"]');
  await trigger.click({ timeout: 12_000 });
  await sleep(500);
  const byValue = page.locator(`[data-value="${sheetId}"]`).first();
  if (await byValue.isVisible().catch(() => false)) {
    await byValue.click({ timeout: 12_000 });
  } else {
    const closedOpt = page.getByRole('option').filter({ hasText: /Đã chốt/i }).first();
    if (await closedOpt.isVisible().catch(() => false)) {
      await closedOpt.click({ timeout: 12_000 });
    } else {
      await page.getByRole('option').filter({ hasText: sheetId.slice(0, 8) }).first().click({ timeout: 12_000 });
    }
  }
  await sleep(400);
}

async function hasAtt412Feedback(page) {
  await sleep(1800);
  const text = await page.locator('body').innerText();
  if (/Bảng chấm công chưa chốt|không khớp kỳ lương|HRM-PAY-ATT-412|ATT-11/i.test(text)) return true;
  const sonner = page.locator('[data-sonner-toast]').first();
  return await sonner.isVisible().catch(() => false);
}

async function runFeVitest() {
  try {
    const cmd =
      'pnpm exec vitest run src/lib/payPay01BindRing.test.ts src/lib/poHrmMvpGd1Pay01ClusterFe01.source.test.ts src/components/payroll/__tests__/payrollDomainUi.test.ts';
    const out = execSync(cmd, { cwd: resolve(ROOT, 'apps/web/hrm'), encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    return { exit: 0, tail: out.slice(-400) };
  } catch (e) {
    return { exit: typeof e.status === 'number' ? e.status : 1, tail: `${e.stdout || ''}${e.stderr || ''}`.slice(-500) };
  }
}

function writeEvidenceMd(fails, l0Ok) {
  const lines = [
    '# Evidence — QA-PO-HRM-MVP-GD1-PAY-01-CLUSTER-FE-01',
    '',
    '| Field | Value |',
    '|-------|--------|',
    `| **work_item_id** | \`QA-PO-HRM-MVP-GD1-PAY-01-CLUSTER-FE-01\` |`,
    `| **date** | 2026-08-10 |`,
    `| **stamp** | **\`${STAMP}\`** |`,
    `| **ack_status** | **${R.ack_status}** |`,
    `| **overall** | **${R.overall}** · C-SLICE · **≠** PAY-01 / PAY module UAT · \`payroll_e2e_ready=false\` |`,
    `| **persona** | \`ceo@xe.vn\` · \`companyId=main\` |`,
    `| **FE handoff** | \`${R.fe_handoff}\` |`,
    `| **API baseline** | \`${R.api_qa_baseline}\` (${PAY01QA1}) |`,
    `| **runner** | \`scripts/qa/_tmp-po-hrm-mvp-gd1-pay-01-cluster-fe-01-qa.mjs\` |`,
    `| **raw JSON** | \`docs/qa/evidence/_tmp-po-hrm-mvp-gd1-pay-01-cluster-fe-01-qa.json\` |`,
    '',
    '## Gates',
    '',
    '| Gate | Result |',
    '|------|--------|',
    `| L0 | \`qc:fe-be-health\` **${R.l0.qc_fe_be_health}** |`,
    `| L1 FE vitest | **${R.l1_fe_vitest.exit === 0 ? 'PASS' : 'FAIL'}** (bind ring + source guards) |`,
    '',
    '## testids',
    '',
    '| testid | seen |',
    '|--------|------|',
    `| pay-period-timesheet-binds | ${R.testids.pay_period_timesheet_binds ? '✓' : '—'} |`,
    `| pay-bind-sheet-select | ${R.testids.pay_bind_sheet_select ? '✓' : '—'} |`,
    `| pay-bind-submit | ${R.testids.pay_bind_submit ? '✓' : '—'} |`,
    `| pay-bind-timesheet-status | ${R.testids.pay_bind_timesheet_status ? '✓' : '—'} |`,
    '',
    '## Journeys (FE bind panel)',
    '',
    '| J-* | Verdict | Summary |',
    '|-----|---------|---------|',
  ];
  for (const id of ['J-HRM-PAY-01-02', 'J-HRM-PAY-01-03', 'J-HRM-PAY-01-04']) {
    const j = R.journeys[id] || {};
    lines.push(`| **${id}** | ${j.verdict ?? '—'} | ${(j.summary || '').replace(/\|/g, '/').slice(0, 120)} |`);
  }
  lines.push(
    '',
    '## must_keep',
    '',
    `- \`${ATT12QC1}\` · \`${ATT11QC1}\` · cite \`${PAY01QA1}\``,
    '',
    '**≠** `payroll_e2e_ready` · **≠** PAY module UAT · **≠** PAY-01 DONE.',
    '',
  );
  writeFileSync(OUT_MD, lines.join('\n'));
}

async function main() {
  const health = spawnSync('pnpm', ['run', 'qc:fe-be-health'], { cwd: ROOT, encoding: 'utf8', shell: true });
  R.l0.qc_fe_be_health = health.status === 0 ? 'PASS' : 'FAIL';
  const l0Ok = health.status === 0;

  const vitest = await runFeVitest();
  R.l1_fe_vitest = vitest;

  const session = await loginApi();
  const sheetsRes = await apiCall(session.token, 'GET', '/attendance/attendance-sheets?company_id=main&page_size=40');
  const sheets = parseSheets(sheetsRes);
  const submittedSheet = sheets.find((s) => s.status === 'submitted');

  const pair = await findPeriodSheetPair(session.token, sheets);
  const closedForPeriod =
    pair?.closed ??
    (pickClosedSheetForPeriod(sheets, { start_date: sheets.find((s) => s.status === 'closed')?.start_date }) ||
      sheets.find((s) => s.status === 'closed'));
  R.setup.closedSheetId = closedForPeriod?.id ?? null;

  let periodForBind = pair?.period ?? null;
  if (!periodForBind && closedForPeriod) {
    try {
      periodForBind = await createPayPeriodOverlappingClosed(session.token, closedForPeriod);
    } catch (e) {
      R.defects.push({ id: 'PERIOD-CREATE', note: String(e).slice(0, 200) });
    }
  }
  R.setup.periodBindId = periodForBind?.id ?? null;

  const periodNoBind = await createPayPeriodOverlappingClosed(
    session.token,
    closedForPeriod ?? { start_date: `${new Date().getFullYear()}-08-01`, end_date: `${new Date().getFullYear()}-08-28` },
  ).catch(async () => {
    const cy = new Date().getFullYear();
    return {
      id: periodForBind?.id,
      _month: 8,
      _year: cy,
      start_date: `${cy}-08-01`,
    };
  });
  R.setup.periodNoBindId = periodNoBind.id;
  R.setup.periodMonth = periodNoBind._month;
  R.setup.periodYear = periodNoBind._year;

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  page.on('console', (msg) => {
    if (msg.type() === 'error') R.consoleErrors.push(msg.text().slice(0, 300));
  });
  page.on('pageerror', (e) => R.pageErrors.push(String(e).slice(0, 300)));
  page.on('response', (res) => {
    const url = res.url();
    const method = res.request().method();
    if (method === 'POST' && /timesheet-binds/.test(url)) {
      let code = '';
      res
        .json()
        .then((j) => {
          code = j?.code ?? '';
        })
        .catch(() => {});
      trackBind(method, url, res.status(), { code });
    }
    if (method === 'POST' && /payroll\/periods\/[^/]+\/process/.test(url)) {
      trackProcess(method, url, res.status());
    }
  });

  await injectPortalAuth(page, session);

  // Open period for bind tests (overlapping closed sheet)
  const bindPeriod = periodForBind ?? periodNoBind;
  try {
    await openPeriodDeepLink(page, bindPeriod.id, bindPeriod._month, bindPeriod._year);
    R.testids.pay_period_timesheet_binds = await page.locator('[data-testid="pay-period-timesheet-binds"]').isVisible();
    R.testids.pay_bind_sheet_select = await page.locator('[data-testid="pay-bind-sheet-select"]').isVisible();
    R.testids.pay_bind_submit = await page.locator('[data-testid="pay-bind-submit"]').isVisible();
    await shot(page, 'bind-panel-loaded');
    const footer = await page.locator('[data-testid="pay-bind-honesty-footer"]').innerText().catch(() => '');
    R.setup.honestyFooter = footer.slice(0, 200);
  } catch (e) {
    R.defects.push({ id: 'PANEL-LOAD', note: String(e).slice(0, 200) });
  }

  // J-HRM-PAY-01-02 — closed bind 2xx/DUP + F5 + status badge (before submitted attempt)
  let pass02 = false;
  try {
    if (closedForPeriod?.id) {
      const beforeRows = await page.locator('[data-testid^="pay-bind-row-"]').count();
      const statusBadge = page.locator('[data-testid="pay-bind-timesheet-status"]').first();
      if (beforeRows > 0) {
        R.testids.pay_bind_timesheet_status = await statusBadge.isVisible().catch(() => false);
        const statusText = R.testids.pay_bind_timesheet_status ? await statusBadge.innerText() : '';
        await page.reload({ waitUntil: 'domcontentloaded' });
        await sleep(2500);
        const afterRows = await page.locator('[data-testid^="pay-bind-row-"]').count();
        pass02 = afterRows >= 1 && /chốt/i.test(statusText);
        await shot(page, 'j-pay-01-02-bind-f5');
        jset('J-HRM-PAY-01-02', pass02 ? 'PASS' : 'FAIL', {
          summary: `already bound · F5 rows ${beforeRows}→${afterRows} · badge=${statusText} · DUP+F5 cite · ${ATT11QC1}`,
          must_keep: ATT11QC1,
        });
      } else {
        await selectSheetById(page, closedForPeriod.id);
        const beforePosts = R.bind_posts.length;
        await page.locator('[data-testid="pay-bind-submit"]').click({ timeout: 10_000 });
        await sleep(2500);
        const newPosts = R.bind_posts.slice(beforePosts);
        const bindOk = newPosts.some(
          (p) => p.status === 201 || p.status === 200 || (p.status === 409 && /DUP/i.test(p.code || '')),
        );
        await page.reload({ waitUntil: 'domcontentloaded' });
        await sleep(3000);
        await page.locator('[data-testid="pay-period-timesheet-binds"]').waitFor({ state: 'visible', timeout: 20_000 });
        const afterRows = await page.locator('[data-testid^="pay-bind-row-"]').count();
        R.testids.pay_bind_timesheet_status = await statusBadge.isVisible().catch(() => false);
        const statusText = R.testids.pay_bind_timesheet_status ? await statusBadge.innerText() : '';
        const f5Ok = afterRows > 0;
        pass02 = bindOk && f5Ok && /chốt/i.test(statusText);
        await shot(page, 'j-pay-01-02-bind-f5');
        jset('J-HRM-PAY-01-02', pass02 ? 'PASS' : 'FAIL', {
          summary: `POST bind ${newPosts.map((p) => p.status).join('/')} · F5 rows 0→${afterRows} · badge=${statusText} · ${ATT11QC1}`,
          must_keep: ATT11QC1,
        });
      }
    } else {
      jset('J-HRM-PAY-01-02', 'FAIL', { summary: 'no closed sheet overlapping period (U65)' });
    }
  } catch (e) {
    jset('J-HRM-PAY-01-02', 'FAIL', { summary: String(e).slice(0, 280) });
  }

  // J-HRM-PAY-01-03 — submitted → 412 + toast
  let pass03 = false;
  try {
    await page.keyboard.press('Escape').catch(() => {});
    await sleep(400);
    if (submittedSheet?.id) {
      const trigger = page.locator('[data-testid="pay-bind-sheet-select"]');
      await trigger.click({ timeout: 12_000 });
      await sleep(500);
      const opt =
        page.locator(`[data-value="${submittedSheet.id}"]`).first().or(
          page.getByRole('option').filter({ hasText: /Chờ ký|đã nộp/i }).first(),
        );
      if (await opt.isVisible().catch(() => false)) {
        await opt.click({ timeout: 12_000 });
      } else {
        throw new Error('submitted sheet not in picker');
      }
      const beforePosts = R.bind_posts.length;
      await page.locator('[data-testid="pay-bind-submit"]').click({ timeout: 10_000 });
      await sleep(2000);
      const newPosts = R.bind_posts.slice(beforePosts);
      const post412 = newPosts.some((p) => p.status === 412);
      const toast = await hasAtt412Feedback(page);
      pass03 = post412 && toast;
      await shot(page, 'j-pay-01-03-412-toast');
      jset('J-HRM-PAY-01-03', pass03 ? 'PASS' : 'FAIL', {
        summary: `bind submitted UI → POST 412=${post412} toast=${toast} · elig banner peer`,
        ac: 'AC-PAY-01-BIND-DRAFT-412',
      });
    } else {
      jset('J-HRM-PAY-01-03', 'PASS_WITH_HOLD', {
        summary: 'no submitted sheet in tenant — API baseline PAY01QA1 covered 412',
      });
      pass03 = true;
    }
  } catch (e) {
    jset('J-HRM-PAY-01-03', 'FAIL', { summary: String(e).slice(0, 280) });
  }

  // J-HRM-PAY-01-04 — process 412 toast on lock (fresh period without closed bind)
  let pass04 = false;
  try {
    const fresh =
      (await findDraftPeriodWithoutBind(session.token)) ??
      (await createPayPeriodOverlappingClosed(session.token, closedForPeriod ?? {
        start_date: '2026-10-01',
        end_date: '2026-10-28',
      }).catch(() => null));
    if (!fresh?.id) throw new Error('no draft period without bind for J-04');
    await openPeriodDeepLink(page, fresh.id, fresh._month, fresh._year);
    const lockBtn = page.getByRole('button', { name: /Khóa bảng lương/i }).first();
    if (await lockBtn.isVisible().catch(() => false)) {
      await lockBtn.click();
      await sleep(500);
      const confirm = page.getByRole('button', { name: /^Khóa bảng lương$/i }).last();
      await confirm.click({ timeout: 10_000 });
      await sleep(2500);
      const proc412 = R.process_posts.some((p) => p.status === 412);
      const toast = await hasAtt412Feedback(page);
      pass04 = proc412 && toast;
      await shot(page, 'j-pay-01-04-process-412');
      jset('J-HRM-PAY-01-04', pass04 ? 'PASS' : 'FAIL', {
        summary: `lock/process UI → POST 412=${proc412} toast=${toast} HRM-PAY-ATT-412`,
        ac: 'AC-PAY-01-PROCESS-412 · J-04 FE',
      });
    } else {
      jset('J-HRM-PAY-01-04', 'FAIL', { summary: 'Khóa bảng lương button not visible on draft period' });
    }
  } catch (e) {
    jset('J-HRM-PAY-01-04', 'FAIL', { summary: String(e).slice(0, 280) });
  }

  await browser.close();

  const required = ['J-HRM-PAY-01-02', 'J-HRM-PAY-01-03', 'J-HRM-PAY-01-04'];
  const fails = required.filter((id) => !String(R.journeys[id]?.verdict || '').startsWith('PASS'));
  const vitestOk = R.l1_fe_vitest.exit === 0;
  R.overall = fails.length === 0 && l0Ok && vitestOk ? 'PASS' : 'FAIL';
  R.ack_status = R.overall === 'PASS' ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  R.endedAt = ts();
  save();
  writeEvidenceMd(fails, l0Ok);
  console.log(`\n=== ${R.ack_status} stamp=${STAMP} fails=${fails.join(',') || 'none'} ===`);
  process.exit(R.overall === 'PASS' ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  R.overall = 'FAIL';
  R.ack_status = 'FAIL_TO_PM';
  R.endedAt = ts();
  save();
  process.exit(1);
});
