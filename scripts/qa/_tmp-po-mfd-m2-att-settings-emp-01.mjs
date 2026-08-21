#!/usr/bin/env node
/**
 * PO-MFD-M2-ATT-SETTINGS-EMP-01 — U65 browser fidelity
 * Matrix #31 · Settings→Nhân viên · import/refresh honesty
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
/** Settings / attendance admin persona */
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
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-mfd-m2-att-settings-emp-01-browser.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-mfd-m2-att-settings-emp-01');
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
  work_item_id: 'PO-MFD-M2-ATT-SETTINGS-EMP-01',
  startedAt: ts(),
  u65: 'zero-seed',
  u76_hdsd_align: true,
  u87_menu_fidelity: true,
  hdsd_align:
    'CC → HRM → Chấm công → Thiết lập / Cài đặt → Nhân viên (matrix #31) · list · refresh · import',
  env: { PORTAL, HRM, XBOS, EMAIL, companyId: COMPANY, commit: COMMIT },
  l0: {},
  hdsd_inventory: [],
  network: [],
  employeesGets: [],
  allHrmGets: [],
  mutateCalls: [],
  consoleErrors: [],
  pageErrors: [],
  networkBad: [],
  steps: {},
  load: {},
  refresh: {},
  import: {},
  f5: {},
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
      if (method !== 'GET') {
        results.mutateCalls.push(entry);
      }
      const isEmployees = /\/employees(\?|$)/.test(url) && method === 'GET';
      let code = null;
      let total = null;
      let rowCount = null;
      if (isEmployees || method !== 'GET') {
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
      }
      entry.code = code;
      entry.total = total;
      entry.rowCount = rowCount;
      if (method === 'GET') {
        results.allHrmGets.push(entry);
      }
      results.network.push(entry);
      if (isEmployees) results.employeesGets.push(entry);
      save();
    } catch {
      /* */
    }
  });
}

function netSince(list, sinceMs) {
  return list.filter((n) => new Date(n.at).getTime() >= sinceMs);
}

async function waitEmployeesPanel(page, timeoutMs = 25000) {
  const deadline = Date.now() + timeoutMs;
  let titleOk = false;
  while (Date.now() < deadline) {
    titleOk =
      (await page.locator('h2').filter({ hasText: /Nhân viên/i }).first().isVisible().catch(() => false)) ||
      (await page.getByRole('button', { name: /Lấy lại dữ liệu|Làm mới|Nhập khẩu|Nhập|Import|Refresh/i }).first().isVisible().catch(() => false));
    const spinner = await page.locator('.animate-spin').first().isVisible().catch(() => false);
    if (titleOk && !spinner) break;
    await sleep(400);
  }
  return {
    titleOk,
    spinner: await page.locator('.animate-spin').first().isVisible().catch(() => false),
  };
}

async function readEmpSnapshot(page) {
  const bodyText = (await page.locator('body').innerText().catch(() => '')).slice(0, 5000);
  const tableRows = await page.locator('table tbody tr').count().catch(() => 0);
  const refreshBtn = page.getByRole('button', { name: /Lấy lại dữ liệu|Làm mới|refreshData|Refresh Data|Refresh/i }).first();
  const importBtn = page.getByRole('button', { name: /Nhập khẩu|Nhập|Import|import/i }).first();
  return {
    bodySnippet: bodyText.slice(0, 400).replace(/\s+/g, ' '),
    tableRows,
    hasTable: tableRows > 0,
    refreshVisible: await refreshBtn.isVisible().catch(() => false),
    importVisible: await importBtn.isVisible().catch(() => false),
    searchVisible: await page.getByPlaceholder(/Tìm|Search|search/i).first().isVisible().catch(() => false),
    totalHint: (bodyText.match(/(?:Tổng|totalRecords)[^\d]*([\d.,]+)/i) || [])[1] || null,
    errorBanner: await page
      .getByText(/ERROR|HRM API Sync ERROR|request failed|500|Không tải được/i)
      .first()
      .isVisible()
      .catch(() => false),
    featureInDev: /tính năng đang phát triển|featureInDev|đang phát triển/i.test(bodyText),
  };
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

  const tabLabels = [
    { id: 'overview', label: /^Tổng quan$/ },
    { id: 'clock', label: /^Chấm công$/ },
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

  const settingsTab = page.getByRole('button', { name: /^Thiết lập$/ }).first();
  const settingsPresent = await settingsTab.isVisible().catch(() => false);
  if (!settingsPresent) {
    results.failReasons.push('HDSD tab Thiết lập missing');
    results.matrix_stamp['31'] = 'BROKEN';
    await shot(page, '02-no-settings-tab');
    results.verdict = 'FAIL';
    results.ack_status = 'FAIL';
    results.endedAt = ts();
    save();
    await browser.close();
    process.exit(2);
  }

  const markOpen = Date.now();
  await settingsTab.click({ force: true });
  step('nav_settings', 'PASS', 'clicked tab Thiết lập');
  await sleep(800);

  // Sidebar Nhân viên (default activeSidebarItem=employees, but click to be sure)
  const empSide = page
    .locator('button, a, [role="button"], div')
    .filter({ hasText: /^Nhân viên$/ })
    .first();
  // Prefer sidebar item with exact label near settings nav
  const sidebarEmp = page.getByRole('button', { name: /^Nhân viên$/ }).first();
  if (await sidebarEmp.isVisible().catch(() => false)) {
    await sidebarEmp.click({ force: true });
    step('nav_employees_sidebar', 'PASS', 'clicked sidebar Nhân viên');
  } else if (await empSide.isVisible().catch(() => false)) {
    await empSide.click({ force: true });
    step('nav_employees_sidebar', 'PASS', 'clicked Nhân viên (fallback)');
  } else {
    step('nav_employees_sidebar', 'OBS', 'sidebar Nhân viên not found as button — relying on default activeSidebarItem=employees');
  }

  const settled = await waitEmployeesPanel(page);
  await sleep(1500);
  await shot(page, '03-settings-employees-loaded');

  const loadSnap = await readEmpSnapshot(page);
  const loadEmpGets = netSince(results.employeesGets, markOpen);
  const load2xx = loadEmpGets.filter((n) => n.status >= 200 && n.status < 300);
  const loadFail = loadEmpGets.filter((n) => n.status >= 400);

  const idleMark = Date.now();
  await sleep(5000);
  const idleGets = netSince(results.employeesGets, idleMark);
  const idleAllHrm = netSince(results.allHrmGets, idleMark);

  results.load = {
    settled,
    ...loadSnap,
    getCounts: {
      employees: loadEmpGets.length,
      list2xx: load2xx.length,
      listFail: loadFail.map((n) => ({ status: n.status, url: n.url })),
    },
    idleGets: idleGets.length,
    idleAllHrmGets: idleAllHrm.length,
    lastEmployees: loadEmpGets.slice(-1)[0] || null,
  };
  save();

  const storm = idleGets.length > 2 || idleAllHrm.length > 8;
  const loadOk =
    !loadSnap.errorBanner &&
    loadFail.length === 0 &&
    results.networkBad.length === 0 &&
    results.pageErrors.length === 0 &&
    !storm &&
    (load2xx.length > 0 || loadSnap.tableRows > 0 || loadSnap.featureInDev);

  step(
    'page_load',
    loadOk ? 'PASS' : 'FAIL',
    `errorBanner=${loadSnap.errorBanner} rows=${loadSnap.tableRows} empGets=${loadEmpGets.length} idle=${idleGets.length} storm=${storm} refresh=${loadSnap.refreshVisible} import=${loadSnap.importVisible}`,
  );

  results.hdsd_inventory.push({
    surface: 31,
    hdsd_label: 'Thiết lập → Nhân viên · tìm · lọc · refresh · import · bảng NV',
    present: loadOk && loadSnap.refreshVisible && loadSnap.importVisible ? '🟢' : loadOk ? '🟡' : '🔴',
  });

  // --- Refresh CTA (VI: Lấy lại dữ liệu) ---
  const refreshBtn = page.getByRole('button', { name: /Lấy lại dữ liệu|Làm mới|refreshData|Refresh Data|Refresh/i }).first();
  const refreshMark = Date.now();
  let refreshClicked = false;
  if (await refreshBtn.isVisible().catch(() => false)) {
    await refreshBtn.click({ force: true });
    refreshClicked = true;
    await sleep(2000);
  }
  await shot(page, '04-after-refresh-click');
  const refreshGets = netSince(results.employeesGets, refreshMark);
  const refreshMutates = netSince(results.mutateCalls, refreshMark);
  const refreshAll = netSince(results.allHrmGets, refreshMark);
  const refresh2xx = refreshGets.filter((n) => n.status >= 200 && n.status < 300);
  results.refresh = {
    clicked: refreshClicked,
    employeesGets: refreshGets.length,
    allHrmGets: refreshAll.length,
    mutates: refreshMutates.length,
    list2xx: refresh2xx.length,
    last: refreshGets.slice(-1)[0] || null,
    wired: refreshGets.length > 0 || refreshMutates.length > 0,
  };
  save();
  step(
    'refresh_cta',
    refreshClicked ? (results.refresh.wired ? 'PASS' : 'SPEC_GAP') : 'FAIL',
    `clicked=${refreshClicked} wired=${results.refresh.wired} empGets=${refreshGets.length}`,
  );

  // --- Import CTA (VI: Nhập khẩu) ---
  const importBtn = page.getByRole('button', { name: /Nhập khẩu|Nhập|Import|import/i }).first();
  const importMark = Date.now();
  let importClicked = false;
  let fileChooserOpened = false;
  if (await importBtn.isVisible().catch(() => false)) {
    page.once('filechooser', () => {
      fileChooserOpened = true;
    });
    await importBtn.click({ force: true });
    importClicked = true;
    await sleep(2000);
  }
  await shot(page, '05-after-import-click');
  const importGets = netSince(results.employeesGets, importMark);
  const importMutates = netSince(results.mutateCalls, importMark);
  const importAll = netSince(results.allHrmGets, importMark);
  const dialogOrChooser =
    fileChooserOpened ||
    (await page.getByRole('dialog').first().isVisible().catch(() => false)) ||
    (await page.locator('input[type="file"]').first().isVisible().catch(() => false));
  results.import = {
    clicked: importClicked,
    employeesGets: importGets.length,
    allHrmGets: importAll.length,
    mutates: importMutates.length,
    fileChooserOrDialog: dialogOrChooser,
    wired: importGets.length > 0 || importMutates.length > 0 || dialogOrChooser,
  };
  save();
  step(
    'import_cta',
    importClicked ? (results.import.wired ? 'PASS' : 'SPEC_GAP') : 'FAIL',
    `clicked=${importClicked} wired=${results.import.wired} dialog=${dialogOrChooser}`,
  );

  // F5 only if mutate happened
  let f5Ok = true;
  if (results.mutateCalls.length > 0) {
    const beforeRows = loadSnap.tableRows;
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(2500);
    const settingsAgain = page.getByRole('button', { name: /^Thiết lập$/ }).first();
    if (await settingsAgain.isVisible().catch(() => false)) {
      await settingsAgain.click({ force: true });
      await sleep(1000);
    }
    const afterSnap = await readEmpSnapshot(page);
    await shot(page, '06-after-f5');
    results.f5 = { performed: true, beforeRows, afterRows: afterSnap.tableRows, errorBanner: afterSnap.errorBanner };
    f5Ok = !afterSnap.errorBanner;
    step('f5', f5Ok ? 'PASS' : 'FAIL', `rows ${beforeRows}->${afterSnap.tableRows}`);
  } else {
    results.f5 = { performed: false, reason: 'no mutate — F5 not required' };
    step('f5', 'SKIP', 'no mutate');
  }

  // Honesty
  const listLive = loadOk && (load2xx.length > 0 || loadSnap.tableRows > 0);
  const refreshUnwired = refreshClicked && !results.refresh.wired;
  const importUnwired = importClicked && !results.import.wired;
  results.honesty = {
    list_source: 'GET /api/hrm/employees via useEmployees (REF master)',
    refresh_wired: results.refresh.wired,
    import_wired: results.import.wired,
    attendance_code_column: 'UI shows employee_code as attendance code (no dedicated mapping API observed)',
    leave_days_column: 'static em-dash — not leave-balance wired on this panel',
    note: 'PARTIAL when list LIVE but Import/Refresh CTAs have no onClick / no network',
  };

  if (refreshUnwired || importUnwired) {
    results.residuals.push({
      id: 'R-MFD-M2-ATT-SETTINGS-EMP-IMPORT-REFRESH-UNWIRED',
      severity: 'P1',
      owner: 'dev-fe',
      note: `Refresh wired=${results.refresh.wired}; Import wired=${results.import.wired}. Buttons render without onClick / network / file dialog. Wire refetchEmployees + import flow or honest disable + SPEC_GAP badge.`,
    });
  }
  if (listLive) {
    results.residuals.push({
      id: 'R-MFD-M2-ATT-SETTINGS-EMP-MAPPING-SPEC_GAP',
      severity: 'OBS',
      owner: 'ba-process',
      note: 'Matrix #31 mapping mã chấm công / attendance allow-list — UI uses employee master list only; leave days = —; UNMAPPED SPEC_GAP. Non-blocking for PARTIAL honesty.',
    });
  }

  // Matrix stamp
  let stamp31 = 'PARTIAL';
  if (!loadOk) stamp31 = storm ? 'PARTIAL' : 'BROKEN';
  if (listLive && results.refresh.wired && results.import.wired) stamp31 = 'LIVE';
  if (!listLive && !loadSnap.featureInDev) stamp31 = 'BROKEN';
  results.matrix_stamp = { '31': stamp31 };

  results.criteria = {
    nav_hdsd: settingsPresent && (loadSnap.refreshVisible || loadSnap.importVisible || loadSnap.hasTable),
    no_error_banner: !loadSnap.errorBanner,
    list_honest: listLive || loadSnap.featureInDev,
    cta_exercised_or_documented: refreshClicked && importClicked && (results.refresh.wired || refreshUnwired) && (results.import.wired || importUnwired),
    no_get_storm: !storm,
    f5_if_mutate: f5Ok,
    screenshot: results.screens.length >= 3,
  };

  const blockingFail =
    !results.criteria.nav_hdsd ||
    !results.criteria.no_error_banner ||
    !results.criteria.list_honest ||
    !results.criteria.cta_exercised_or_documented ||
    !results.criteria.no_get_storm ||
    !results.criteria.f5_if_mutate ||
    stamp31 === 'BROKEN' ||
    results.pageErrors.length > 0 ||
    results.networkBad.length > 0;

  // Honesty PARTIAL with documented unwired CTAs = PASS_TO_PM (not invent LIVE)
  results.verdict = blockingFail ? 'FAIL' : 'PASS';
  results.ack_status = results.verdict === 'PASS' ? 'PASS_TO_PM' : 'FAIL';
  results.endedAt = ts();
  save();

  await shot(page, '07-settings-emp-final');
  await browser.close();

  console.log(
    JSON.stringify(
      {
        verdict: results.verdict,
        ack_status: results.ack_status,
        matrix_stamp: results.matrix_stamp,
        load: results.load.getCounts,
        idle: { emp: results.load.idleGets, allHrm: results.load.idleAllHrmGets },
        refresh: results.refresh,
        import: results.import,
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
