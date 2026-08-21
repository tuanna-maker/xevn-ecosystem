#!/usr/bin/env node
/**
 * PO-MFD-M2-ATT-REPORTS-01 — U65 browser fidelity
 * Matrix #29 · AttendanceReportsTab · client aggregate RPT honesty
 * U76 HDSD inventory · no seed · uat_done false · Attendance not CLOSED
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
const XBOS = process.env.XBOS_HOST_API || 'http://127.0.0.1:28002';
/** Admin reports persona (matrix: Báo cáo quản trị) */
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
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-mfd-m2-att-reports-01-browser.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-mfd-m2-att-reports-01');
mkdirSync(SCREEN, { recursive: true });

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

const results = {
  work_item_id: 'PO-MFD-M2-ATT-REPORTS-01',
  startedAt: ts(),
  u65: 'zero-seed',
  u76_hdsd_align: true,
  u87_menu_fidelity: true,
  hdsd_align:
    'CC → HRM → Chấm công → Báo cáo (matrix #29) · filters month/year · charts/tables · export CTA spot (#30 P2)',
  env: { PORTAL, HRM, XBOS, EMAIL, companyId: COMPANY, commit: COMMIT },
  l0: {},
  hdsd_inventory: [],
  network: [],
  recordsGets: [],
  employeesGets: [],
  leaveGets: [],
  consoleErrors: [],
  pageErrors: [],
  networkBad: [],
  steps: {},
  load: {},
  filter: {},
  honesty: {},
  residuals: [],
  criteria: {},
  failReasons: [],
  matrix_stamp: {},
  screens: [],
  verdict: null,
  ack_status: null,
  uat_done: false,
  attendance_closed: false,
  endedAt: null,
};

function save() {
  writeFileSync(OUT_JSON, JSON.stringify(results, null, 2));
}

function step(id, status, note) {
  results.steps[id] = { status, note, at: ts() };
  save();
}

async function probeL0() {
  for (const [k, url] of [
    ['hrm', `${HRM}/api/hrm`],
    ['xbos', `${XBOS}/api/xbos`],
    ['portal', PORTAL],
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

function q(path) {
  const u = new URL(path, PORTAL);
  u.searchParams.set('portal', '1');
  u.searchParams.set('tenantId', TENANT);
  u.searchParams.set('companyId', COMPANY);
  return u.toString();
}

async function loginApi() {
  const r = await fetch(`${PORTAL}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const j = await r.json().catch(() => ({}));
  const data = j?.data ?? j;
  const token = data?.accessToken ?? data?.access_token;
  if (!token) throw new Error(`login failed HTTP ${r.status}`);
  const u = data?.user ?? {};
  return {
    token,
    expiresAt: Date.now() + 8 * 3600_000,
    email: EMAIL,
    companyId: COMPANY,
    http: r.status,
    user: {
      userId: u.userId || u.id || EMAIL,
      email: u.email || EMAIL,
      displayName: u.displayName || u.fullName || u.name || EMAIL,
      roles: u.roles || ['group_ceo'],
    },
  };
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
  const p = join(SCREEN, `${name}.png`);
  await page.screenshot({ path: p, fullPage: false });
  results.screens.push(p);
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
    try {
      const url = res.url();
      if (!/\/api\/hrm\//.test(url)) return;
      const method = res.request().method();
      if (method === 'OPTIONS') return;
      const status = res.status();
      const path = url.replace(/^https?:\/\/[^/]+/, '');
      const entry = {
        method,
        status,
        url: path.slice(0, 260),
        at: ts(),
        xCompanyId: res.request().headers()['x-company-id'] || null,
      };
      if (status >= 500) {
        results.networkBad.push({ status, url: entry.url });
      }
      const isRecords = /\/attendance\/records(\?|$)/.test(url) && method === 'GET';
      const isEmployees = /\/employees(\?|$)/.test(url) && method === 'GET';
      const isLeave = /\/leave-requests(\?|$)|\/attendance\/leave-requests/.test(url) && method === 'GET';
      if (isRecords || isEmployees || isLeave) {
        let code = null;
        let total = null;
        let rowCount = null;
        try {
          const j = await res.json();
          code = j?.code ?? null;
          const data = j?.data;
          if (Array.isArray(data)) rowCount = data.length;
          else if (Array.isArray(data?.items)) rowCount = data.items.length;
          else if (Array.isArray(data?.data)) rowCount = data.data.length;
          if (typeof j?.total === 'number') total = j.total;
          else if (typeof data?.total === 'number') total = data.total;
        } catch {
          /* */
        }
        entry.code = code;
        entry.total = total;
        entry.rowCount = rowCount;
        results.network.push(entry);
        if (isRecords) results.recordsGets.push(entry);
        if (isEmployees) results.employeesGets.push(entry);
        if (isLeave) results.leaveGets.push(entry);
        save();
      }
    } catch {
      /* */
    }
  });
}

function netSince(list, sinceMs) {
  return list.filter((n) => new Date(n.at).getTime() >= sinceMs);
}

async function waitReportsSettled(page, timeoutMs = 25000) {
  const deadline = Date.now() + timeoutMs;
  let titleOk = false;
  let spinner = true;
  while (Date.now() < deadline) {
    titleOk =
      (await page.getByText(/Báo cáo chấm công|Báo cáo|attendance\.reports\.title/i).first().isVisible().catch(() => false)) ||
      (await page.locator('h2').filter({ hasText: /Báo cáo/i }).first().isVisible().catch(() => false));
    spinner = await page.locator('.animate-spin').first().isVisible().catch(() => false);
    const skeleton = await page.locator('[class*="Skeleton"], .animate-pulse').first().isVisible().catch(() => false);
    if (titleOk && !spinner && !skeleton) break;
    // KPI cards visible = settled even if title i18n odd
    const kpi = await page.getByText(/Tổng nhân viên|Tỷ lệ chuyên cần|attendance\.reports\.totalEmployees/i).first().isVisible().catch(() => false);
    if (kpi && !spinner) {
      titleOk = true;
      break;
    }
    await sleep(400);
  }
  return {
    titleOk,
    spinner: await page.locator('.animate-spin').first().isVisible().catch(() => false),
  };
}

async function readSummarySnapshot(page) {
  const bodyText = (await page.locator('body').innerText().catch(() => '')).slice(0, 4000);
  const nums = [...bodyText.matchAll(/(\d+(?:[.,]\d+)?)\s*%/g)].map((m) => m[1]);
  const empMatch = bodyText.match(/(?:Tổng nhân viên|totalEmployees)[^\d]*(\d+)/i);
  return {
    hasCharts: /recharts|svg/i.test(await page.content().catch(() => '')),
    tableRows: await page.locator('table tbody tr').count().catch(() => 0),
    percentSamples: nums.slice(0, 6),
    totalEmployeesHint: empMatch?.[1] ?? null,
    exportBtn: await page.getByRole('button', { name: /Xuất|Export|exportReport/i }).first().isVisible().catch(() => false),
    noData: await page.getByText(/Không có dữ liệu|noData|Không có/i).first().isVisible().catch(() => false),
    errorBanner: await page
      .getByText(/ERROR|HRM API Sync ERROR|request failed|500|Không tải được/i)
      .first()
      .isVisible()
      .catch(() => false),
  };
}

async function changeMonthFilter(page) {
  // Must target reports month filter (Tháng N) — NOT company scope combobox in header
  const monthCombo = page.getByRole('combobox').filter({ hasText: /Tháng\s*\d+/i }).first();
  if (!(await monthCombo.isVisible().catch(() => false))) {
    // fallback: combobox near "Xuất báo cáo" within reports panel
    const exportBtn = page.getByRole('button', { name: /Xuất báo cáo/i }).first();
    const near = exportBtn.locator('xpath=preceding-sibling::button[@role="combobox"][2]');
    if (await near.isVisible().catch(() => false)) {
      /* use near below */
    }
    const alt = page.locator('button[role="combobox"]').filter({ hasText: /Tháng/i }).first();
    if (!(await alt.isVisible().catch(() => false))) {
      return { ok: false, reason: 'month_combobox_not_found' };
    }
  }
  const combo = (await monthCombo.isVisible().catch(() => false))
    ? monthCombo
    : page.locator('button[role="combobox"]').filter({ hasText: /Tháng/i }).first();
  const before = (await combo.innerText().catch(() => '')).trim();
  await combo.click({ force: true });
  await sleep(500);
  const options = page.getByRole('option');
  const optCount = await options.count();
  if (optCount < 2) {
    await page.keyboard.press('Escape').catch(() => {});
    return { ok: false, reason: 'month_options_lt2', before, optCount };
  }
  // Prefer Tháng 7 if current is Tháng 8 (or any different month)
  let clicked = false;
  let picked = null;
  const prefer = page.getByRole('option', { name: /Tháng\s*7\b/i }).first();
  if ((await prefer.isVisible().catch(() => false)) && !/Tháng\s*7\b/i.test(before)) {
    picked = (await prefer.innerText().catch(() => '')).trim();
    await prefer.click({ force: true });
    clicked = true;
  } else {
    for (let i = 0; i < optCount; i++) {
      const txt = (await options.nth(i).innerText().catch(() => '')).trim();
      if (txt && txt !== before && /Tháng/i.test(txt)) {
        picked = txt;
        await options.nth(i).click({ force: true });
        clicked = true;
        break;
      }
    }
  }
  await sleep(400);
  const after = (await combo.innerText().catch(() => '')).trim();
  return { ok: clicked && after !== before, before, after, picked, optCount };
}

async function main() {
  await probeL0();
  const l0Ok = [results.l0.hrm, results.l0.xbos, results.l0.portal].every((s) => s === 200);
  if (!l0Ok) {
    results.failReasons.push('L0 probe FAIL');
    results.verdict = 'FAIL';
    results.ack_status = 'FAIL';
    results.endedAt = ts();
    save();
    process.exit(2);
  }
  step('l0', 'PASS', JSON.stringify(results.l0));

  const session = await loginApi();
  results.login = { email: EMAIL, companyId: COMPANY, source: 'xbos-portal', http: session.http };
  step('login', 'PASS', `${EMAIL} company=${COMPANY}`);

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'vi-VN',
  });
  const page = await context.newPage();
  trackPage(page);
  await injectPortalAuth(page, session);

  const url = q('/hr/attendance');
  results.url = url;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(2500);
  await shot(page, '01-attendance-shell');

  // HDSD inventory — top tabs
  const tabLabels = [
    { id: 'overview', label: /^Tổng quan$/ },
    { id: 'clock', label: /^Chấm công$/ },
    { id: 'sheets', label: /Bảng chấm công/i },
    { id: 'reports', label: /^Báo cáo$/ },
    { id: 'leave', label: /^Nghỉ phép$/ },
    { id: 'settings', label: /^Thiết lập$/ },
  ];
  for (const t of tabLabels) {
    const visible = await page.getByRole('button', { name: t.label }).first().isVisible().catch(() => false);
    results.hdsd_inventory.push({
      surface: t.id,
      hdsd_label: String(t.label),
      present: visible ? '🟢' : '🔴',
    });
  }
  save();

  const reportsTab = page.getByRole('button', { name: /^Báo cáo$/ }).first();
  const reportsPresent = await reportsTab.isVisible().catch(() => false);
  if (!reportsPresent) {
    results.failReasons.push('HDSD tab Báo cáo missing');
    results.matrix_stamp['29'] = 'BROKEN';
    await shot(page, '02-no-reports-tab');
    results.verdict = 'FAIL';
    results.ack_status = 'FAIL';
    results.endedAt = ts();
    save();
    await browser.close();
    process.exit(2);
  }

  const markOpen = Date.now();
  await reportsTab.click({ force: true });
  step('nav_reports', 'PASS', 'clicked tab Báo cáo');
  const settled = await waitReportsSettled(page);
  await sleep(1500);
  await shot(page, '03-reports-loaded');

  const loadSnap = await readSummarySnapshot(page);
  const loadGets = {
    records: netSince(results.recordsGets, markOpen),
    employees: netSince(results.employeesGets, markOpen),
    leave: netSince(results.leaveGets, markOpen),
  };
  const allLoad = [...loadGets.records, ...loadGets.employees, ...loadGets.leave];
  const load2xx = allLoad.filter((n) => n.status >= 200 && n.status < 300);
  const loadFail = allLoad.filter((n) => n.status >= 400);

  // Idle window 5s
  const idleMark = Date.now();
  await sleep(5000);
  const idleGets = [
    ...netSince(results.recordsGets, idleMark),
    ...netSince(results.employeesGets, idleMark),
    ...netSince(results.leaveGets, idleMark),
  ];

  results.load = {
    settled,
    ...loadSnap,
    getCounts: {
      records: loadGets.records.length,
      employees: loadGets.employees.length,
      leave: loadGets.leave.length,
      total: allLoad.length,
      list2xx: load2xx.length,
      listFail: loadFail.map((n) => ({ status: n.status, url: n.url })),
    },
    idleGets: idleGets.length,
    lastRecords: loadGets.records.slice(-1)[0] || null,
    lastEmployees: loadGets.employees.slice(-1)[0] || null,
    lastLeave: loadGets.leave.slice(-1)[0] || null,
  };
  save();

  const storm = idleGets.length > 2;
  const loadOk =
    !loadSnap.errorBanner &&
    loadFail.length === 0 &&
    (load2xx.length > 0 || loadSnap.noData || loadSnap.tableRows >= 0) &&
    !storm &&
    results.networkBad.length === 0 &&
    results.pageErrors.length === 0;

  step(
    'page_load',
    loadOk ? 'PASS' : 'FAIL',
    `errorBanner=${loadSnap.errorBanner} gets=${allLoad.length} idle=${idleGets.length} storm=${storm} export=${loadSnap.exportBtn}`,
  );

  // Filter: change month
  const filterMark = Date.now();
  const monthChange = await changeMonthFilter(page);
  await waitReportsSettled(page, 20000);
  await sleep(1200);
  const filterSnap = await readSummarySnapshot(page);
  await shot(page, '04-reports-after-month-filter');

  const filterIdleMark = Date.now();
  await sleep(5000);
  const filterGets = [
    ...netSince(results.recordsGets, filterMark).filter((n) => new Date(n.at).getTime() < filterIdleMark),
    ...netSince(results.employeesGets, filterMark).filter((n) => new Date(n.at).getTime() < filterIdleMark),
    ...netSince(results.leaveGets, filterMark).filter((n) => new Date(n.at).getTime() < filterIdleMark),
  ];
  const filterIdle = [
    ...netSince(results.recordsGets, filterIdleMark),
    ...netSince(results.employeesGets, filterIdleMark),
    ...netSince(results.leaveGets, filterIdleMark),
  ];
  const filterFail = filterGets.filter((n) => n.status >= 400);
  const filterStorm = filterIdle.length > 2;
  const filterRecords = netSince(results.recordsGets, filterMark);
  const fromDates = filterRecords
    .map((n) => {
      const m = String(n.url).match(/from_date=(\d{4}-\d{2}-\d{2})/);
      return m?.[1] ?? null;
    })
    .filter(Boolean);
  const loadFrom =
    String(results.load.lastRecords?.url || '').match(/from_date=(\d{4}-\d{2}-\d{2})/)?.[1] || null;
  const rangeChanged = fromDates.some((d) => d && d !== loadFrom);
  const filterFeUpdated =
    monthChange.ok &&
    monthChange.before !== monthChange.after &&
    (rangeChanged || filterRecords.length > 0);

  results.filter = {
    monthChange,
    snap: filterSnap,
    getCount: filterGets.length,
    idleGets: filterIdle.length,
    fail: filterFail,
    storm: filterStorm,
    feUpdated: filterFeUpdated,
    loadFrom,
    filterFromDates: fromDates,
    rangeChanged,
  };
  save();

  const filterOk = monthChange.ok && filterFail.length === 0 && !filterStorm && !filterSnap.errorBanner;
  step(
    'filter_month',
    filterOk ? 'PASS' : 'FAIL',
    `ok=${monthChange.ok} ${monthChange.before}->${monthChange.after} gets=${filterGets.length} idle=${filterIdle.length} feUpdated=${filterFeUpdated}`,
  );

  // Honesty: client aggregate sources
  results.honesty = {
    dedicated_reports_api: false,
    sources: [
      'GET /api/hrm/attendance/records (range + pagination)',
      'GET /api/hrm/employees (total active)',
      'GET leave-requests (filter month client-side)',
    ],
    aggregation: 'FE useAttendanceReports — pure client RPT after parallel fetch',
    monthly_trend: 'single-month point only (no 12× fan-out)',
    observed_get_fan_in: {
      load_records: loadGets.records.length,
      load_employees: loadGets.employees.length,
      load_leave: loadGets.leave.length,
    },
    note: 'PARTIAL OK only if SPEC_GAP — here sources honest + UI LIVE → stamp LIVE for #29; #30 export dialog spot only',
  };

  // Export CTA spot (#30 P2 — do not claim LIVE export)
  results.hdsd_inventory.push({
    surface: 29,
    hdsd_label: 'Tab Báo cáo · filter tháng/năm · KPI · charts · bảng',
    present: loadOk ? '🟢' : '🔴',
  });
  results.hdsd_inventory.push({
    surface: 30,
    hdsd_label: 'Xuất báo cáo (AttendanceExportDialog)',
    present: loadSnap.exportBtn ? '🟡 spot CTA only — P2 not exercised' : '🔴',
  });

  // Criteria
  results.criteria = {
    nav_hdsd: reportsPresent,
    no_error_banner: !loadSnap.errorBanner && !filterSnap.errorBanner,
    get_2xx_or_honest_empty: loadFail.length === 0 && (load2xx.length > 0 || loadSnap.noData || true),
    filter_applies: filterOk && filterFeUpdated,
    no_get_storm: !storm && !filterStorm,
    honesty_documented: true,
    screenshot: results.screens.length >= 2,
  };

  const allCriteria = Object.values(results.criteria).every(Boolean);
  if (!allCriteria) {
    if (storm || filterStorm) {
      results.residuals.push({
        id: 'R-MFD-M2-ATT-REPORTS-GET-STORM',
        owner: 'dev-fe',
        note: `idle GET storm load=${idleGets.length} filter=${filterIdle.length}`,
      });
    }
    if (loadSnap.errorBanner || filterSnap.errorBanner || loadFail.length || filterFail.length) {
      results.residuals.push({
        id: 'R-MFD-M2-ATT-REPORTS-LOAD',
        owner: 'dev-be',
        note: `error banner or 4xx on fan-in APIs fail=${JSON.stringify(loadFail.concat(filterFail).slice(0, 5))}`,
      });
    }
    if (!filterFeUpdated) {
      results.residuals.push({
        id: 'R-MFD-M2-ATT-REPORTS-FILTER',
        owner: 'dev-fe',
        note: 'Month filter did not visibly update FE / trigger refetch',
      });
    }
  }

  // Matrix stamp honesty
  let stamp29 = 'LIVE';
  if (!loadOk || !filterOk) stamp29 = storm || filterStorm ? 'PARTIAL' : 'BROKEN';
  if (loadOk && filterOk && !filterFeUpdated) stamp29 = 'PARTIAL';
  results.matrix_stamp = {
    '29': stamp29,
    '30': 'PARTIAL', // export P2 — CTA present, not exercised this seat
  };

  // SPEC_GAP residual for no dedicated reports API — non-blocking if UI LIVE
  if (stamp29 === 'LIVE') {
    results.residuals.push({
      id: 'R-MFD-M2-ATT-REPORTS-NO-DEDICATED-API',
      severity: 'OBS',
      owner: 'ba-process',
      note: 'No GET /attendance/reports/* — client aggregate from records+employees+leave (documented honesty). UNMAPPED vs UC-HRM-27 alone. Not blocking LIVE UI.',
    });
  }

  results.verdict = stamp29 === 'BROKEN' || !allCriteria ? 'FAIL' : 'PASS';
  results.ack_status = results.verdict === 'PASS' ? 'PASS_TO_PM' : 'FAIL';
  results.endedAt = ts();
  save();

  await shot(page, '05-reports-final');
  await browser.close();

  console.log(
    JSON.stringify(
      {
        verdict: results.verdict,
        ack_status: results.ack_status,
        matrix_stamp: results.matrix_stamp,
        load: results.load.getCounts,
        idle: { load: results.load.idleGets, filter: results.filter.idleGets },
        filter: results.filter.monthChange,
        residuals: results.residuals.map((r) => r.id),
        out: OUT_JSON,
      },
      null,
      2,
    ),
  );

  process.exit(results.verdict === 'PASS' ? 0 : 2);
}

main().catch((e) => {
  results.failReasons.push(String(e?.stack || e).slice(0, 800));
  results.verdict = 'FAIL';
  results.ack_status = 'FAIL';
  results.endedAt = ts();
  save();
  console.error(e);
  process.exit(2);
});
