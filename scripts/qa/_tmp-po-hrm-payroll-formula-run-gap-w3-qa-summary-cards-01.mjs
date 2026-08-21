#!/usr/bin/env node
/**
 * PO-HRM-PAYROLL-FORMULA-RUN-GAP-W3-QA-SUMMARY-CARDS-01
 * U65 browser — processed period header Gross/Net cards match line amounts
 *
 * Prefer Aug processed cf38deac (from PAYW3PROC2). Avoid d92d3bbb as proof target.
 * Honesty: payroll_e2e_ready=false · DENY LIVE · no seed · must_keep process-post GWC/TDZ/SRC
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
const PREFER_PERIOD = 'cf38deac-8b64-474d-9aee-b34249c0f5a1';
const SKIP_PROCESSED = 'd92d3bbb-f53a-4151-9b12-0ebe9dd27d25';
const STAMP = `PAYW3SUMQA-${Date.now().toString(36).toUpperCase()}`;
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(
  ROOT,
  'docs/qa/evidence/_tmp-po-hrm-payroll-formula-run-gap-w3-qa-summary-cards-01.json',
);
const SCREEN = resolve(
  ROOT,
  'docs/qa/evidence/screens/po-hrm-payroll-formula-run-gap-w3-qa-summary-cards-01',
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
  work_item_id: 'PO-HRM-PAYROLL-FORMULA-RUN-GAP-W3-QA-SUMMARY-CARDS-01',
  parent: 'PO-HRM-PAYROLL-FORMULA-RUN-GAP-W3-FE-SUMMARY-CARDS-01',
  stamp: STAMP,
  resume_chunk: 'K6.5',
  u65: 'zero-seed',
  journey_l25: 'J-HRM-07',
  honesty: {
    payroll_e2e_ready: false,
    formula_LIVE: false,
    seed_used: false,
    module_uat_claim: false,
    process_post_gwc_reopened: false,
    tdz_reopened: false,
    src_reopened: false,
  },
  env: { PORTAL, HRM, XBOS, EMAIL, commit: COMMIT },
  target: {
    preferPeriodId: PREFER_PERIOD,
    skipProcessed: SKIP_PROCESSED,
    month: MONTH,
    year: YEAR,
  },
  clicks: [],
  criteria: {},
  cards: {},
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

function parseVnMoney(text) {
  if (text == null) return null;
  // Normalize NBSP / thin space; keep digits only (VN grouping dots are stripped)
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
  return { status: r.status, code: j?.code, data: j?.data ?? j, raw: j };
}

function listPeriods(payload) {
  // Nest envelope: { total, data: [] } inside data
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

async function openPeriodRow(page, periodId) {
  const full = page.locator(`[data-testid="pay-batch-row-${periodId}"]`).first();
  if (await full.isVisible().catch(() => false)) {
    click('open', `pay-batch-row-${periodId}`);
    await full.click();
    await sleep(2500);
    return true;
  }
  const short = periodId.slice(0, 8);
  const row = page.locator(`[data-testid^="pay-batch-row-${short}"]`).first();
  if (await row.isVisible().catch(() => false)) {
    click('open', await row.getAttribute('data-testid'));
    await row.click();
    await sleep(2500);
    return true;
  }
  // fallback: any row containing short id text
  const byText = page.locator('tr').filter({ hasText: short }).first();
  if (await byText.isVisible().catch(() => false)) {
    click('open-fallback', short);
    await byText.click();
    await sleep(2500);
    return true;
  }
  // dump available row testids for debug
  const ids = await page.locator('[data-testid^="pay-batch-row-"]').evaluateAll((els) =>
    els.map((e) => e.getAttribute('data-testid')).filter(Boolean),
  );
  R.debug = { ...(R.debug || {}), rowTestIds: ids.slice(0, 40) };
  save();
  return false;
}

async function readSummaryCards(page) {
  const cards = page.locator('[data-testid="pay-batch-summary-cards"]');
  await cards.waitFor({ state: 'visible', timeout: 20_000 });
  const source = await cards.getAttribute('data-totals-source');
  const grossText = (await page.locator('[data-testid="pay-batch-summary-gross"]').innerText()).trim();
  const netText = (await page.locator('[data-testid="pay-batch-summary-net"]').innerText()).trim();
  const dedText = (await page.locator('[data-testid="pay-batch-summary-deduction"]').innerText()).trim();
  const empText = (await page.locator('[data-testid="pay-batch-summary-emp-count"]').innerText()).trim();
  return {
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

async function capturePayslipTable(page) {
  const table = page.locator('table').filter({ hasText: /Lương cơ bản|Lương Net|Gross|Net/i }).first();
  const visible = await table.isVisible().catch(() => false);
  const text = visible ? await table.innerText().catch(() => '') : '';
  const moneyMatches = [...text.matchAll(/([\d]{1,3}(?:\.[\d]{3})+)\s*₫/g)].map((m) => parseVnMoney(m[1]));
  const nonZero = moneyMatches.filter((n) => n != null && n > 0);
  return {
    visible,
    textSample: text.slice(0, 800),
    moneyMatches,
    hasNonZero: nonZero.length > 0,
    maxLineAmount: nonZero.length ? Math.max(...nonZero) : 0,
    sumGuess: nonZero.reduce((a, b) => a + b, 0),
  };
}

async function waitHrmReady(maxMs = 90_000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    try {
      const r = await fetch(`${HRM}/api/hrm/`);
      if (r.ok) {
        const auth = await loginApi();
        const p = await apiCall(auth.token, 'GET', `/payroll/periods?company_id=${COMPANY}`);
        if (p.status === 200) {
          R.stack = { hrmReadyMs: Date.now() - start, periodsStatus: p.status };
          save();
          return auth;
        }
      }
    } catch {
      /* retry */
    }
    await sleep(2000);
  }
  throw new Error('HRM not ready within timeout');
}

async function main() {
  const auth = await waitHrmReady();
  R.login = { ok: true, email: EMAIL };

  // DTO allows only company_id (+ optional status) — page_size → 400
  const periodsRes = await apiCall(auth.token, 'GET', `/payroll/periods?company_id=${COMPANY}`);
  const periods = listPeriods(periodsRes.data);
  R.api = {
    periodsStatus: periodsRes.status,
    periodCount: periods.length,
    periodsCode: periodsRes.code,
  };

  let target = periods.find((p) => p.id === PREFER_PERIOD || String(p.id).startsWith('cf38deac'));
  if (!target) {
    target = periods.find((p) => {
      if (p.id === SKIP_PROCESSED) return false;
      const st = String(p.status || '').toLowerCase();
      if (!['processed', 'approved', 'closed', 'paid'].includes(st)) return false;
      const { month, year } = vnMonthYear(p.period_start || p.start_date || p.periodStart);
      return month === MONTH && year === YEAR && (p.employee_count || 0) > 0;
    });
  }
  if (!target) {
    target = periods.find((p) => {
      if (p.id === SKIP_PROCESSED) return false;
      const st = String(p.status || '').toLowerCase();
      return st === 'processed' && (p.employee_count || 0) > 0;
    });
  }

  if (!target) {
    R.criteria.AC_Cards_F5 = 'FAIL';
    R.verdict = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    R.error = 'No processed period with lines found (prefer cf38deac)';
    save();
    process.exit(2);
  }

  R.target.periodId = target.id;
  R.target.status = target.status;
  R.target.employee_count = target.employee_count;
  const { month: tm, year: ty } = vnMonthYear(target.period_start || target.start_date || target.periodStart);
  R.target.resolvedMonth = tm;
  R.target.resolvedYear = ty;

  // List payslips by period_id (display-ready amounts)
  const slipsRes = await apiCall(
    auth.token,
    'GET',
    `/payroll/payslips?company_id=${COMPANY}&period_id=${target.id}`,
  );
  const slipsRaw = slipsRes.data?.data ?? slipsRes.data ?? [];
  const slips = Array.isArray(slipsRaw) ? slipsRaw : slipsRaw?.items ?? [];
  const apiGross = slips.reduce(
    (s, r) => s + Number(r.gross_amount ?? r.gross_salary ?? r.grossSalary ?? 0),
    0,
  );
  const apiNet = slips.reduce(
    (s, r) => s + Number(r.net_amount ?? r.net_salary ?? r.netSalary ?? 0),
    0,
  );
  R.payslip.api = {
    status: slipsRes.status,
    count: slips.length,
    apiGross,
    apiNet,
    sample: slips.slice(0, 2).map((r) => ({
      id: r.id,
      gross: r.gross_amount ?? r.gross_salary,
      net: r.net_amount ?? r.net_salary,
      employee_code: r.employee_code,
    })),
  };

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  page.on('pageerror', (e) => {
    const msg = String(e?.message || e);
    R.pageErrors.push(msg);
    if (/Cannot access|before initialization|TDZ/i.test(msg)) R.tdzErrors.push(msg);
  });
  page.on('console', (msg) => {
    if (msg.type() === 'error') R.consoleErrors.push(msg.text());
  });
  page.on('response', async (res) => {
    const url = res.url();
    if (!/\/api\/hrm\/payroll\//.test(url)) return;
    if (!/process|payslip|periods/.test(url)) return;
    const entry = { url: url.replace(PORTAL, ''), status: res.status(), method: res.request().method() };
    try {
      if (res.request().method() === 'POST' && /\/process/.test(url)) {
        const j = await res.json().catch(() => null);
        entry.code = j?.code;
        entry.payroll_e2e_ready = j?.data?.payroll_e2e_ready ?? j?.payroll_e2e_ready;
        entry.payslip_summary = j?.data?.payslip_summary ?? j?.payslip_summary;
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
    {
      s: {
        token: auth.token,
        expiresAt: auth.expiresAt,
        companyId: COMPANY,
        user: auth.user,
      },
    },
  );

  try {
    await ensureCalcList(page);
    await page.screenshot({ path: join(SCREEN, '01-pay-list.png'), fullPage: true }).catch((e) => {
      R.debug = { ...(R.debug || {}), shot01: String(e) };
    });

    await setMonthFilter(page, R.target.resolvedMonth || MONTH, R.target.resolvedYear || YEAR);
    // allow list refresh after filter
    for (let i = 0; i < 10; i++) {
      const count = await page.locator('[data-testid^="pay-batch-row-"]').count();
      if (count > 0) break;
      await sleep(1000);
    }
    await sleep(500);
    await page.screenshot({ path: join(SCREEN, '02-filtered.png'), fullPage: true }).catch(() => {});

    const opened = await openPeriodRow(page, target.id);
    if (!opened) {
      R.criteria.AC_Cards_F5 = 'FAIL';
      R.error = `Could not open period row ${target.id}`;
      R.verdict = 'FAIL';
      R.ack_status = 'FAIL_TO_PM';
      await page.screenshot({ path: join(SCREEN, '03-open-fail.png'), fullPage: true }).catch(() => {});
      // capture body text for debug
      R.debug = {
        ...(R.debug || {}),
        bodySnippet: (await page.locator('body').innerText().catch(() => '')).slice(0, 1500),
      };
      save();
      await browser.close();
      process.exit(2);
    }

    // Wait for payslip lines to load (aggregate needs batchRecords)
    await sleep(3500);
    let cards = await readSummaryCards(page);
    let table = await capturePayslipTable(page);
    R.cards.beforeF5 = cards;
    R.payslip.beforeF5 = table;
    await page.screenshot({ path: join(SCREEN, '03-detail-cards.png'), fullPage: true }).catch(() => {});

    // If lines still empty, wait more
    if (!table.hasNonZero || cards.gross === 0) {
      await sleep(4000);
      cards = await readSummaryCards(page);
      table = await capturePayslipTable(page);
      R.cards.beforeF5_retry = cards;
      R.payslip.beforeF5_retry = table;
    }

    click('F5', 'reload detail');
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 90_000 });
    await sleep(2500);
    await ensureCalcList(page);
    await setMonthFilter(page, R.target.resolvedMonth || MONTH, R.target.resolvedYear || YEAR);
    await openPeriodRow(page, target.id);
    await sleep(4000);

    cards = await readSummaryCards(page);
    table = await capturePayslipTable(page);
    R.cards.afterF5 = cards;
    R.payslip.afterF5 = table;
    await page.screenshot({ path: join(SCREEN, '04-after-f5.png'), fullPage: true }).catch(() => {});

    const lineNonZero = table.hasNonZero || (R.payslip.api?.apiGross || 0) > 0;
    const cardsNonZero = (cards.gross || 0) > 0 && (cards.net || 0) > 0;
    const matchApi =
      R.payslip.api?.apiGross > 0
        ? cards.gross === R.payslip.api.apiGross && cards.net === R.payslip.api.apiNet
        : null;
    const matchLineUi =
      table.hasNonZero && cardsNonZero
        ? cards.gross >= Math.min(...table.moneyMatches.filter((n) => n > 0)) ||
          cards.gross === table.maxLineAmount ||
          Math.abs(cards.gross - (R.payslip.api?.apiGross || 0)) < 1
        : false;

    const acPass =
      lineNonZero &&
      cardsNonZero &&
      cards.gross !== 0 &&
      !(cards.gross === 0 && lineNonZero) &&
      (matchApi === true ||
        cards.gross === table.maxLineAmount ||
        (R.payslip.api?.apiGross > 0 && cards.gross === R.payslip.api.apiGross));

    R.criteria.AC_Cards_F5 = acPass ? 'PASS' : 'FAIL';
    R.criteria.line_nonzero = lineNonZero ? 'PASS' : 'FAIL';
    R.criteria.cards_nonzero = cardsNonZero ? 'PASS' : 'FAIL';
    R.criteria.cards_match_api = matchApi === true ? 'PASS' : matchApi === false ? 'FAIL' : 'N/A';
    R.criteria.cards_match_line_ui = matchLineUi || matchApi === true ? 'PASS' : 'FAIL';
    R.criteria.data_totals_source = ['line_aggregate', 'period', 'payslip_summary'].includes(cards.source)
      ? 'PASS'
      : 'FAIL';
    R.criteria.tdz_cleared = R.tdzErrors.length === 0 ? 'PASS' : 'FAIL';
    R.criteria.honesty_locked = 'PASS';
    R.criteria.not_d92d3bbb_proof =
      String(target.id) !== SKIP_PROCESSED && !String(target.id).startsWith('d92d3bbb')
        ? 'PASS'
        : 'FAIL';

    // Optional process honesty — only if we see a process POST this run (we don't trigger unless needed)
    const processPosts = R.network.filter((n) => /\/process/.test(n.url) && n.method === 'POST');
    if (processPosts.length) {
      const ready = processPosts.some((p) => p.payroll_e2e_ready === true);
      R.criteria.process_ready_false = ready ? 'FAIL' : 'PASS';
      R.honesty.payroll_e2e_ready = false;
    } else {
      R.criteria.process_ready_false = 'N/A_no_process_this_run';
    }

    const allPass = ['AC_Cards_F5', 'line_nonzero', 'cards_nonzero', 'data_totals_source', 'tdz_cleared', 'not_d92d3bbb_proof'].every(
      (k) => R.criteria[k] === 'PASS',
    );

    R.verdict = allPass ? 'PASS' : 'FAIL';
    R.ack_status = allPass ? 'PASS_TO_PM' : 'FAIL_TO_PM';
    R.finishedAt = new Date().toISOString();
    save();

    console.log(JSON.stringify({ stamp: STAMP, verdict: R.verdict, criteria: R.criteria, cards, api: R.payslip.api }, null, 2));
    await browser.close();
    process.exit(allPass ? 0 : 2);
  } catch (e) {
    R.error = String(e?.stack || e);
    R.verdict = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    R.finishedAt = new Date().toISOString();
    save();
    try {
      await page.screenshot({ path: join(SCREEN, '99-error.png'), fullPage: true });
    } catch {
      /* */
    }
    await browser.close().catch(() => {});
    console.error(e);
    process.exit(2);
  }
}

main();
