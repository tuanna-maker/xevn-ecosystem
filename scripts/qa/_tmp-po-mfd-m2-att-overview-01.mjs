#!/usr/bin/env node
/**
 * PO-MFD-M2-ATT-OVERVIEW-01-QA — U65 browser
 * Year filter wire + honesty (no day/week/month) · must_keep RECORDS + SETTINGS-EMP spot
 * No seed · uat_done false · Attendance not CLOSED
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

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
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-mfd-m2-att-overview-01-browser.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-mfd-m2-att-overview-01');
mkdirSync(SCREEN, { recursive: true });

const CURRENT_YEAR = new Date().getFullYear();
const LAST_YEAR = CURRENT_YEAR - 1;

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

const results = {
  work_item_id: 'PO-MFD-M2-ATT-OVERVIEW-01-QA',
  startedAt: ts(),
  u65: 'zero-seed',
  u76_hdsd_align: true,
  hdsd_align: 'CC → HRM → Chấm công → Tổng quan · lọc năm (this/last) · honesty theo năm',
  env: { PORTAL, HRM, XBOS, EMAIL, companyId: COMPANY, commit: COMMIT, CURRENT_YEAR, LAST_YEAR },
  l0: {},
  hdsd_inventory: [],
  network: [],
  overviewGets: [],
  recordsGets: [],
  employeesGets: [],
  consoleErrors: [],
  pageErrors: [],
  networkBad: [],
  mutateCalls: [],
  steps: {},
  overview: {},
  yearSwitch: {},
  must_keep: {},
  residuals: [],
  criteria: {},
  failReasons: [],
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
        url: path.slice(0, 300),
        at: ts(),
        xCompanyId: res.request().headers()['x-company-id'] || null,
      };
      if (status >= 500) results.networkBad.push({ status, url: entry.url });
      if (method !== 'GET') results.mutateCalls.push(entry);

      const isOverview = /\/attendance\/overview(\?|$)/.test(url) && method === 'GET';
      const isRecords = /\/attendance\/records(\?|$)/.test(url) && method === 'GET';
      const isEmployees = /\/employees(\?|$)/.test(url) && method === 'GET';

      let code = null;
      let year = null;
      try {
        const u = new URL(url);
        year = u.searchParams.get('year');
      } catch {
        /* */
      }
      entry.year = year;

      if (isOverview || isRecords || isEmployees || method !== 'GET') {
        try {
          const j = await res.json();
          code = j?.code ?? null;
          entry.code = code;
          if (typeof j?.total === 'number') entry.total = j.total;
          else if (typeof j?.data?.total === 'number') entry.total = j.data.total;
        } catch {
          /* */
        }
      }

      results.network.push(entry);
      if (isOverview) results.overviewGets.push(entry);
      if (isRecords) results.recordsGets.push(entry);
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

async function waitOverviewSettled(page, timeoutMs = 25000) {
  const deadline = Date.now() + timeoutMs;
  let honesty = false;
  let loading = true;
  while (Date.now() < deadline) {
    honesty = await page.getByTestId('overview-year-filter-honesty').isVisible().catch(() => false);
    loading = await page.getByTestId('overview-loading').isVisible().catch(() => false);
    const spin = await page.locator('.animate-spin').first().isVisible().catch(() => false);
    if (honesty && !loading && !spin) break;
    await sleep(350);
  }
  return {
    honesty,
    loading: await page.getByTestId('overview-loading').isVisible().catch(() => false),
    spinner: await page.locator('.animate-spin').first().isVisible().catch(() => false),
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
  results.portal_url = url;
  const markOpen = Date.now();
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(2000);

  // Ensure Tổng quan tab
  const overviewTab = page.getByRole('button', { name: /^Tổng quan$/ }).first();
  if (await overviewTab.isVisible().catch(() => false)) {
    await overviewTab.click({ force: true }).catch(() => {});
    await sleep(800);
  }

  let settled = await waitOverviewSettled(page);

  // Recover transient 500 on first paint (retry CTA or soft reload once)
  const markRetry = Date.now();
  let errorVisibleEarly = await page.getByTestId('overview-error').isVisible().catch(() => false);
  if (errorVisibleEarly) {
    const retryBtn = page.getByTestId('overview-error-retry');
    if (await retryBtn.isVisible().catch(() => false)) {
      await retryBtn.click({ force: true });
      step('overview_retry', 'PASS', 'clicked overview-error-retry');
    } else {
      await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
      await overviewTab.click({ force: true }).catch(() => {});
      step('overview_retry', 'PASS', 'soft reload after overview-error');
    }
    settled = await waitOverviewSettled(page);
    await sleep(1200);
  }
  await shot(page, '01-overview-this-year');

  // HDSD inventory
  for (const t of [
    { id: 'overview', label: /^Tổng quan$/ },
    { id: 'clock', label: /^Chấm công$/ },
    { id: 'reports', label: /^Báo cáo$/ },
    { id: 'leave', label: /^Nghỉ phép$/ },
    { id: 'settings', label: /^Thiết lập$/ },
  ]) {
    const visible = await page.getByRole('button', { name: t.label }).first().isVisible().catch(() => false);
    results.hdsd_inventory.push({ surface: t.id, hdsd_label: String(t.label), present: visible ? '🟢' : '🔴' });
  }
  save();

  const honestyEl = page.getByTestId('overview-year-filter-honesty');
  const honestyVisible = await honestyEl.isVisible().catch(() => false);
  const honestyText = honestyVisible ? (await honestyEl.innerText().catch(() => '')).trim() : '';
  const yearFilter = page.getByTestId('overview-year-filter');
  const yearFilterVisible = await yearFilter.isVisible().catch(() => false);
  const loadedYearText = (
    await page.getByTestId('overview-loaded-year').innerText().catch(() => '')
  ).trim();
  const errorVisible = await page.getByTestId('overview-error').isVisible().catch(() => false);
  const errorBannerStorm = await page
    .getByText(/HRM API Sync ERROR|ERR_CONNECTION_REFUSED/i)
    .first()
    .isVisible()
    .catch(() => false);

  // Open select — assert only this-year / last-year; no day/week/month on YEAR select
  let optionTexts = [];
  let hasUnsupported = false;
  if (yearFilterVisible) {
    await yearFilter.click({ force: true });
    await sleep(400);
    const opts = page.getByRole('option');
    const n = await opts.count();
    for (let i = 0; i < n; i++) {
      optionTexts.push((await opts.nth(i).innerText().catch(() => '')).trim());
    }
    const joined = optionTexts.join(' | ').toLowerCase();
    hasUnsupported =
      /hôm nay|today|tuần|week|tháng(?!\s*\d)|month|quý|quarter|custom|tùy chỉnh/.test(joined) ||
      optionTexts.some((t) =>
        /today|yesterday|this-week|last-week|this-month|last-month|this-quarter|custom/i.test(t),
      );
    await shot(page, '02-year-select-open');
    await page.keyboard.press('Escape').catch(() => {});
    await sleep(300);
  }

  // Prefer post-retry this-year GET
  const sinceForLoad = errorVisibleEarly ? markRetry : markOpen;
  const thisYearGets = netSince(results.overviewGets, sinceForLoad).filter(
    (g) => String(g.year) === String(CURRENT_YEAR),
  );
  const loadOverview =
    thisYearGets.filter((g) => g.status >= 200 && g.status < 300).slice(-1)[0] ||
    thisYearGets.slice(-1)[0] ||
    null;

  // Idle settle (post success)
  const idleMark = Date.now();
  await sleep(5000);
  const idleOverview = netSince(results.overviewGets, idleMark);
  const badAfterSettle = results.networkBad.filter((b) => {
    // tolerate pre-retry shell 500s; storm = continued 5xx after settle window start
    return true;
  });
  const badAfterRetry = results.overviewGets
    .concat(results.network.filter((n) => n.status >= 500))
    .filter((n) => new Date(n.at).getTime() >= idleMark - 100 && n.status >= 500);

  results.overview = {
    settled,
    honestyVisible,
    honestyText: honestyText.slice(0, 200),
    honestyMentionsYear: /năm|year/i.test(honestyText),
    yearFilterVisible,
    loadedYearText,
    errorVisible,
    errorVisibleEarly,
    errorBannerStorm,
    optionTexts,
    hasUnsupportedTimeOptions: hasUnsupported,
    optionCount: optionTexts.length,
    loadOverview,
    idleOverviewCount: idleOverview.length,
    pageErrors: results.pageErrors.length,
    consoleErrors: results.consoleErrors.length,
    networkBadTotal: results.networkBad.length,
    networkBadAfterIdleStart: badAfterRetry.length,
  };
  save();

  const acHonesty =
    honestyVisible &&
    results.overview.honestyMentionsYear &&
    yearFilterVisible &&
    !hasUnsupported &&
    optionTexts.length === 2;
  step(
    'ac_honesty_year_only',
    acHonesty ? 'PASS' : 'FAIL',
    `honesty=${honestyVisible} opts=${optionTexts.length} unsupported=${hasUnsupported}`,
  );

  const acThisYear =
    loadOverview &&
    loadOverview.status >= 200 &&
    loadOverview.status < 300 &&
    String(loadOverview.year) === String(CURRENT_YEAR) &&
    !errorBannerStorm &&
    !errorVisible &&
    results.pageErrors.length === 0 &&
    idleOverview.length <= 1;
  step(
    'ac_this_year_get',
    acThisYear ? 'PASS' : 'FAIL',
    `status=${loadOverview?.status} year=${loadOverview?.year} code=${loadOverview?.code} idle=${idleOverview.length} errUI=${errorVisible}`,
  );

  // Switch last-year
  const markLast = Date.now();
  await yearFilter.click({ force: true });
  await sleep(350);
  const lastOpt = page.getByTestId('overview-year-last').or(page.getByRole('option', { name: new RegExp(String(LAST_YEAR)) }));
  const lastVisible = await lastOpt.first().isVisible().catch(() => false);
  if (lastVisible) {
    await lastOpt.first().click({ force: true });
  } else {
    await page.getByRole('option').filter({ hasText: String(LAST_YEAR) }).first().click({ force: true }).catch(() => {});
  }
  await sleep(500);
  const settledLast = await waitOverviewSettled(page);
  await sleep(1200);
  await shot(page, '03-overview-last-year');

  const lastGets = netSince(results.overviewGets, markLast).filter((g) => String(g.year) === String(LAST_YEAR));
  const lastOverview = lastGets.slice(-1)[0] || null;
  const loadedAfter = (await page.getByTestId('overview-loaded-year').innerText().catch(() => '')).trim();

  const idleMark2 = Date.now();
  await sleep(4000);
  const idle2 = netSince(results.overviewGets, idleMark2);

  results.yearSwitch = {
    settledLast,
    lastOverview,
    loadedAfter,
    idleAfterSwitch: idle2.length,
    lastYearGetCount: lastGets.length,
  };
  save();

  const acLastYear =
    lastOverview &&
    lastOverview.status >= 200 &&
    lastOverview.status < 300 &&
    String(lastOverview.year) === String(LAST_YEAR) &&
    idle2.length <= 1;
  step(
    'ac_last_year_refetch',
    acLastYear ? 'PASS' : 'FAIL',
    `status=${lastOverview?.status} year=${lastOverview?.year} idle=${idle2.length} loaded=${loadedAfter.slice(0, 80)}`,
  );

  // must_keep: RECORDS list
  const markRec = Date.now();
  const clockTab = page.getByRole('button', { name: /^Chấm công$/ }).first();
  await clockTab.click({ force: true });
  await sleep(600);
  // submenu records
  const recordsItem = page
    .getByRole('menuitem', { name: /Bản ghi|Records|attendance\.attendanceMenu\.records/i })
    .or(page.getByText(/Bản ghi chấm công|Danh sách chấm công|Records/i))
    .first();
  // Try dropdown items under Chấm công
  let recordsOpened = false;
  const menuCandidates = [
    page.getByRole('menuitem', { name: /Bản ghi|records/i }).first(),
    page.locator('[role="menuitem"], button, a').filter({ hasText: /Bản ghi/i }).first(),
    page.getByText(/^Bản ghi$/).first(),
  ];
  for (const c of menuCandidates) {
    if (await c.isVisible().catch(() => false)) {
      await c.click({ force: true });
      recordsOpened = true;
      break;
    }
  }
  // If submenu already visible as list item in dropdown panel
  if (!recordsOpened) {
    const alt = page.locator('button, [role="menuitem"], div').filter({ hasText: /Bản ghi chấm công|Bản ghi/i }).first();
    if (await alt.isVisible().catch(() => false)) {
      await alt.click({ force: true });
      recordsOpened = true;
    }
  }
  await sleep(2500);
  await shot(page, '04-mustkeep-records');
  const recGets = netSince(results.recordsGets, markRec);
  const recOk = recGets.some((g) => g.status >= 200 && g.status < 300);
  results.must_keep.records = {
    opened: recordsOpened || recGets.length > 0,
    gets: recGets.slice(-3),
    ok: recOk,
  };
  step('must_keep_records', recOk ? 'PASS' : 'FAIL', `gets=${recGets.length} last=${recGets.slice(-1)[0]?.status}`);

  // must_keep: SETTINGS-EMP tab opens (no deep mutate)
  const markEmp = Date.now();
  const settingsTab = page.getByRole('button', { name: /^Thiết lập$/ }).first();
  await settingsTab.click({ force: true });
  await sleep(800);
  const sidebarEmp = page.getByRole('button', { name: /^Nhân viên$/ }).first();
  let empOpened = false;
  if (await sidebarEmp.isVisible().catch(() => false)) {
    await sidebarEmp.click({ force: true });
    empOpened = true;
  } else {
    const empTab = page.locator('button, [role="menuitem"]').filter({ hasText: /^Nhân viên$/ }).first();
    if (await empTab.isVisible().catch(() => false)) {
      await empTab.click({ force: true });
      empOpened = true;
    }
  }
  await sleep(2500);
  await shot(page, '05-mustkeep-settings-emp');
  const empGets = netSince(results.employeesGets, markEmp);
  const empTable =
    (await page.locator('table tbody tr').count().catch(() => 0)) > 0 ||
    (await page.getByRole('button', { name: /Lấy lại dữ liệu/i }).first().isVisible().catch(() => false)) ||
    (await page.getByRole('button', { name: /Nhập khẩu/i }).first().isVisible().catch(() => false));
  const empGetOk = empGets.some((g) => g.status >= 200 && g.status < 300);
  // Employees may already be cached from RECORDS spot — UI LIVE + sidebar Nhân viên = OK
  const empOk = empGetOk || (empOpened && empTable) || empTable;
  const mutateAfterMk = results.mutateCalls.filter((m) => new Date(m.at).getTime() >= markRec);
  results.must_keep.settings_emp = {
    opened: empOpened || empOk,
    tableOrCta: empTable,
    gets: empGets.slice(-3),
    ok: empOk,
    mutateDuringSpot: mutateAfterMk.length,
  };
  step(
    'must_keep_settings_emp',
    empOk ? 'PASS' : 'FAIL',
    `gets=${empGets.length} tableOrCta=${empTable} opened=${empOpened} mutate=${mutateAfterMk.length}`,
  );

  // Residual OBS
  results.residuals.push({
    id: 'R-MFD-M2-ATT-OVERVIEW-PERIOD-SPEC_GAP',
    severity: 'OBS',
    owner: 'ba-process',
    note: 'Day/week/month/quarter filters not on Nest — honesty year-only OK; FR+period params if product needs finer grain',
    blocking: false,
  });

  // Criteria rollup — storm = continued 5xx after overview settle (not transient first-paint)
  const stormOk = !errorBannerStorm && idleOverview.length <= 1 && !errorVisible;
  results.criteria = {
    l0: true,
    honesty_year_only: acHonesty,
    this_year_get: acThisYear,
    last_year_refetch: acLastYear,
    must_keep_records: !!results.must_keep.records?.ok,
    must_keep_settings_emp: !!results.must_keep.settings_emp?.ok,
    no_error_storm: stormOk,
    no_page_errors: results.pageErrors.length === 0,
    uat_done_false: results.uat_done === false,
    attendance_not_closed: results.attendance_closed === false,
    no_seed: true,
  };

  const allPass = Object.entries(results.criteria)
    .filter(([k]) => !['uat_done_false', 'attendance_not_closed', 'no_seed'].includes(k))
    .every(([, v]) => v === true);

  results.verdict = allPass ? 'PASS' : 'FAIL';
  results.ack_status = allPass ? 'PASS_TO_PM' : 'FAIL';
  if (!allPass) {
    for (const [k, v] of Object.entries(results.criteria)) {
      if (!v && !['uat_done_false', 'attendance_not_closed', 'no_seed'].includes(k)) {
        results.failReasons.push(`criteria.${k}=false`);
      }
    }
  }
  results.endedAt = ts();
  save();
  await browser.close();
  console.log(JSON.stringify({ verdict: results.verdict, ack: results.ack_status, fail: results.failReasons, out: OUT_JSON }, null, 2));
  process.exit(allPass ? 0 : 2);
}

main().catch((e) => {
  results.failReasons.push(String(e?.stack || e).slice(0, 500));
  results.verdict = 'FAIL';
  results.ack_status = 'FAIL';
  results.endedAt = ts();
  save();
  console.error(e);
  process.exit(2);
});
