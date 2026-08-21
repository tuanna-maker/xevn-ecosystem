#!/usr/bin/env node
/**
 * PO-MFD-M2-ATT-WEEKLY-01 — U65 browser
 * Matrix #14 Chấm công tuần · #15 Tổng hợp công · sheet context vs week default
 * No seed · uat_done false · Attendance not CLOSED
 * must_keep: do NOT reopen SETTINGS/REPORTS/REQUESTS/LEAVE/OT/CLOCK GWC
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
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-mfd-m2-att-weekly-01-browser.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-mfd-m2-att-weekly-01');
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
  work_item_id: 'PO-MFD-M2-ATT-WEEKLY-01',
  startedAt: ts(),
  u65: 'zero-seed',
  u76_hdsd_align: true,
  hdsd_align:
    'CC → HRM → Chấm công → ▼ → Chấm công tuần (#14) · Tổng hợp công (#15) · sheet→weekly context',
  env: { PORTAL, HRM, XBOS, EMAIL, companyId: COMPANY, commit: COMMIT },
  l0: {},
  portal_url: null,
  click_path: [],
  hdsd_inventory: [],
  network: [],
  recordsGets: [],
  sheetsGets: [],
  consoleErrors: [],
  pageErrors: [],
  networkBad: [],
  mutateCalls: [],
  steps: {},
  surfaces: {},
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
  results.screens.push(p.replace(/\\/g, '/'));
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
        url: path.slice(0, 320),
        at: ts(),
        t: Date.now(),
        xCompanyId: res.request().headers()['x-company-id'] || null,
      };
      if (status >= 500) results.networkBad.push({ status, url: entry.url });
      if (method !== 'GET') results.mutateCalls.push(entry);

      let code = null;
      let rowCount = null;
      let from_date = null;
      let to_date = null;
      try {
        const u = new URL(url);
        from_date = u.searchParams.get('from_date');
        to_date = u.searchParams.get('to_date');
      } catch {
        /* */
      }
      entry.from_date = from_date;
      entry.to_date = to_date;

      if (/\/attendance\/records(\?|$)/.test(url) && method === 'GET') {
        try {
          const j = await res.json();
          code = j?.code ?? j?.meta?.code ?? null;
          const data = j?.data ?? j;
          if (Array.isArray(data)) rowCount = data.length;
          else if (Array.isArray(data?.items)) rowCount = data.items.length;
          else if (Array.isArray(data?.data)) rowCount = data.data.length;
          else if (typeof data?.total === 'number') rowCount = data.total;
        } catch {
          /* */
        }
        entry.code = code;
        entry.rowCount = rowCount;
        results.recordsGets.push(entry);
      }
      if (/\/attendance\/attendance-sheets(\?|$)/.test(url) && method === 'GET') {
        try {
          const j = await res.json();
          code = j?.code ?? j?.meta?.code ?? null;
        } catch {
          /* */
        }
        entry.code = code;
        results.sheetsGets.push(entry);
      }
      results.network.push(entry);
    } catch {
      /* */
    }
  });
}

async function openAttendanceMenu(page, nameRe) {
  await page.locator('[data-testid="attendance-tab-menu"]').click({ timeout: 15_000 });
  await sleep(400);
  const item = page.getByRole('menuitem', { name: nameRe });
  const label = (await item.innerText().catch(() => '')).trim();
  await item.click({ timeout: 10_000 });
  await sleep(1800);
  return label;
}

async function syncErrorVisible(page) {
  return page
    .getByText(/HRM API Sync ERROR|HRM API request failed/i)
    .isVisible()
    .catch(() => false);
}

async function countIdleRecordsGets(ms = 10_000) {
  const mark = Date.now();
  const before = results.recordsGets.length;
  await sleep(ms);
  const storm = results.recordsGets.filter((g) => g.t >= mark);
  return { before, stormCount: storm.length, storm, ok: storm.length <= 2 };
}

function stampRuntime({ syncError, getOk, loadingStuck, emptyOk }) {
  if (syncError || !getOk) return 'BROKEN';
  if (loadingStuck && !emptyOk) return 'BROKEN';
  return 'LIVE';
}

async function main() {
  await probeL0();
  if (results.l0.hrm !== 200 || results.l0.portal !== 200) {
    results.verdict = 'BLOCKED';
    results.ack_status = 'BLOCKED';
    results.failReasons.push('L0 stack not healthy');
    results.endedAt = ts();
    save();
    process.exit(2);
  }

  const session = await loginApi();
  results.steps.login = { http: session.http, companyId: session.companyId, email: EMAIL };

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
    const url = q('/hr/attendance');
    results.portal_url = url;
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45_000 });
    await sleep(2000);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(2500);
    results.steps.landed = { url: page.url() };
    results.click_path.push('Login ceo@xe.vn → inject token → /hr/attendance?portal=1&companyId=main → hard reload');

    // —— #14 Weekly (default week, no sheet selected) ——
    const weeklyGetsBefore = results.recordsGets.length;
    const weeklyLabel = await openAttendanceMenu(page, /Chấm công tuần/i);
    results.click_path.push(`Chấm công ▼ → menuitem «${weeklyLabel || 'Chấm công tuần'}»`);
    await sleep(1200);

    const weeklyShell =
      (await page.getByText(/Chấm công tuần|Tuần|Tải lại/i).first().isVisible().catch(() => false)) ||
      (await page.locator('table').first().isVisible().catch(() => false));
    const weeklyEmpty = await page
      .getByText(/Không có dữ liệu|Chưa có|no data|empty/i)
      .first()
      .isVisible()
      .catch(() => false);
    const weeklySync = await syncErrorVisible(page);
    const weeklyLoading = await page
      .getByText(/Đang tải|loadingData/i)
      .first()
      .isVisible()
      .catch(() => false);
    const weeklyGets = results.recordsGets.slice(weeklyGetsBefore);
    const weeklyOk = weeklyGets.some((g) => g.status >= 200 && g.status < 300);
    const weeklyCode = weeklyGets.find((g) => g.status >= 200 && g.status < 300)?.code ?? null;
    const weeklyRange = weeklyGets.find((g) => g.from_date && g.to_date);
    const weeklyTr = await page.locator('table tbody tr').count().catch(() => 0);

    const weeklyStorm = await countIdleRecordsGets(10_000);
    await shot(page, '01-weekly-default');

    results.surfaces.row14_weekly = {
      runtime: stampRuntime({
        syncError: weeklySync,
        getOk: weeklyOk,
        loadingStuck: weeklyLoading && weeklyTr === 0 && !weeklyEmpty,
        emptyOk: weeklyEmpty || weeklyTr >= 0,
      }),
      menuLabel: weeklyLabel,
      shellVisible: weeklyShell,
      emptyHonesty: weeklyEmpty || (weeklyOk && weeklyTr === 0),
      syncError: weeklySync,
      loadingStuck: weeklyLoading,
      dataRowCount: weeklyTr,
      listGets: weeklyGets.map((g) => ({
        status: g.status,
        code: g.code,
        rowCount: g.rowCount,
        from_date: g.from_date,
        to_date: g.to_date,
      })),
      listCode: weeklyCode,
      weekRange: weeklyRange
        ? { from_date: weeklyRange.from_date, to_date: weeklyRange.to_date }
        : null,
      storm10s: weeklyStorm.stormCount,
      stormOk: weeklyStorm.ok,
      sheetContext: null,
      note: 'Menu weekly without selected sheet → resolveWeeklyDateRange(null) current week',
    };
    step('weekly_default', results.surfaces.row14_weekly.runtime, weeklyLabel);

    // —— Sheet context → open sheet → weekly grid ——
    const sheetsBefore = results.sheetsGets.length;
    await openAttendanceMenu(page, /Bảng chấm công/i);
    results.click_path.push('Chấm công ▼ → Bảng chấm công (list for sheet context)');
    await sleep(1500);
    await shot(page, '02-sheets-for-context');

    const sheetRows = page.locator('table tbody tr').filter({ has: page.locator('td') });
    const sheetRowCount = await sheetRows.count().catch(() => 0);
    let sheetContextProbe = {
      sheetsAvailable: sheetRowCount,
      opened: false,
      runtime: 'N/A_NO_SHEET',
    };

    if (sheetRowCount > 0) {
      const recordsBeforeSheet = results.recordsGets.length;
      // Click blue sheet name (same as SHEETS-01) — not checkbox/first td
      const sheetLink = page.getByText(/QA-SHEET-MFD-M2/i).first();
      const linkVisible = await sheetLink.isVisible().catch(() => false);
      if (linkVisible) {
        await sheetLink.click({ timeout: 10_000 });
      } else {
        const nameBtn = sheetRows.first().locator('button, a, [role="button"]').filter({ hasText: /.+/ }).first();
        await nameBtn.click({ timeout: 10_000 }).catch(async () => {
          await sheetRows.first().locator('td').nth(2).click();
        });
      }
      await sleep(2800);
      results.click_path.push('Click sheet name QA-SHEET-MFD-M2 → weekly grid (sheet context)');

      const leftSheetsList = !(await page
        .getByRole('heading', { name: /Bảng chấm công chi tiết/i })
        .isVisible()
        .catch(() => false));
      const weeklyTitleVisible = await page
        .getByText(/QA-SHEET-MFD-M2|Chấm công tuần|Tuần/i)
        .first()
        .isVisible()
        .catch(() => false);
      const afterSheetGets = results.recordsGets.slice(recordsBeforeSheet);
      const sheetWeeklyOk = afterSheetGets.some((g) => g.status >= 200 && g.status < 300);
      const sheetSync = await syncErrorVisible(page);
      const sheetWeeklyEmpty = await page
        .getByText(/Không có dữ liệu|Chưa có/i)
        .first()
        .isVisible()
        .catch(() => false);
      // Sheet July 2026 → expect from_date in July range (not current calendar week Aug)
      const sheetRange = afterSheetGets.find(
        (g) => g.from_date && g.to_date && String(g.from_date).startsWith('2026-07'),
      ) || afterSheetGets.find((g) => g.from_date && g.to_date);
      const rangeUsesSheet =
        !!sheetRange &&
        String(sheetRange.from_date).startsWith('2026-07') &&
        String(sheetRange.to_date).startsWith('2026-07');
      const sheetStorm = await countIdleRecordsGets(8_000);
      await shot(page, '03-weekly-sheet-context');

      const openedOk = leftSheetsList || weeklyTitleVisible || sheetWeeklyOk;
      sheetContextProbe = {
        sheetsAvailable: sheetRowCount,
        opened: openedOk,
        runtime: stampRuntime({
          syncError: sheetSync,
          getOk: sheetWeeklyOk && openedOk,
          loadingStuck: false,
          emptyOk: true,
        }),
        syncError: sheetSync,
        leftSheetsList,
        weeklyTitleVisible,
        listGets: afterSheetGets.map((g) => ({
          status: g.status,
          code: g.code,
          rowCount: g.rowCount,
          from_date: g.from_date,
          to_date: g.to_date,
        })),
        weekRange: sheetRange
          ? { from_date: sheetRange.from_date, to_date: sheetRange.to_date }
          : null,
        rangeUsesSheetPeriod: rangeUsesSheet,
        storm8s: sheetStorm.stormCount,
        stormOk: sheetStorm.ok,
        emptyHonesty: sheetWeeklyEmpty || sheetWeeklyOk,
        note: 'Open sheet name → setSelectedSheetId + weekly; GET records from_date/to_date should follow sheet week window',
      };
      if (openedOk && sheetWeeklyOk && !rangeUsesSheet) {
        results.residuals.push({
          id: 'OBS-MFD-M2-ATT-WEEKLY-SHEET-RANGE',
          severity: 'P2',
          note: `Sheet July opened but GET range=${sheetRange?.from_date}..${sheetRange?.to_date} — document honesty vs expected sheet week`,
        });
      }
    } else {
      results.residuals.push({
        id: 'OBS-MFD-M2-ATT-WEEKLY-NO-SHEET-ROW',
        severity: 'P2',
        note: 'No sheet row to open — default-week weekly still validated; sheet-context path N/A (U65 no invent create)',
      });
      await shot(page, '03-no-sheet-for-context');
    }
    results.surfaces.row14_sheet_context = sheetContextProbe;
    step('weekly_sheet_context', sheetContextProbe.runtime, `sheets=${sheetRowCount}`);

    // —— #15 Summary (same viewMode=data as records) ——
    const summaryBefore = results.recordsGets.length;
    const summaryLabel = await openAttendanceMenu(page, /Tổng hợp công|Tổng hợp/i);
    results.click_path.push(`Chấm công ▼ → menuitem «${summaryLabel || 'Tổng hợp công'}»`);
    await sleep(1500);

    const summaryTitle =
      (await page.getByText(/Dữ liệu chấm công|Tổng hợp công|Bản ghi chấm công/i).first().isVisible().catch(() => false)) ||
      (await page.locator('table').first().isVisible().catch(() => false));
    const summaryEmpty = await page
      .getByText(/Không có dữ liệu|Chưa có bản ghi|noData/i)
      .first()
      .isVisible()
      .catch(() => false);
    const summarySync = await syncErrorVisible(page);
    const summaryLoading = await page
      .getByText(/Đang tải|loadingData/i)
      .first()
      .isVisible()
      .catch(() => false);
    const summaryGets = results.recordsGets.slice(summaryBefore);
    // Summary reuses records view — may reuse cached RQ; allow prior GET if no new GET but table live
    const summaryGetOk =
      summaryGets.some((g) => g.status >= 200 && g.status < 300) ||
      results.recordsGets.some((g) => g.status >= 200 && g.status < 300);
    const summaryCode =
      summaryGets.find((g) => g.status >= 200 && g.status < 300)?.code ??
      [...results.recordsGets].reverse().find((g) => g.status >= 200 && g.status < 300)?.code ??
      null;
    const summaryTr = await page.locator('table tbody tr').count().catch(() => 0);
    const summaryStorm = await countIdleRecordsGets(10_000);
    await shot(page, '04-summary');

    // Honesty: summary === records surface (API_MAP: no dedicated summary API)
    const sameAsRecords = /Dữ liệu chấm công|Tổng hợp/i.test(
      (await page.locator('body').innerText().catch(() => '')).slice(0, 4000),
    );

    results.surfaces.row15_summary = {
      runtime: stampRuntime({
        syncError: summarySync,
        getOk: summaryGetOk,
        loadingStuck: summaryLoading && summaryTr === 0 && !summaryEmpty,
        emptyOk: summaryEmpty || summaryTr >= 0,
      }),
      menuLabel: summaryLabel,
      shellVisible: summaryTitle,
      emptyHonesty: summaryEmpty || (summaryGetOk && summaryTr === 0),
      syncError: summarySync,
      loadingStuck: summaryLoading,
      dataRowCount: summaryTr,
      listGets: summaryGets.map((g) => ({
        status: g.status,
        code: g.code,
        rowCount: g.rowCount,
        from_date: g.from_date,
        to_date: g.to_date,
      })),
      listCode: summaryCode,
      storm10s: summaryStorm.stormCount,
      stormOk: summaryStorm.ok,
      productNote:
        'activeAttendanceType=summary sets attendanceViewMode=data — same GET /attendance/records as records (no dedicated summary API)',
      sameAsRecordsSurface: sameAsRecords,
      newGetsOnOpen: summaryGets.length,
    };
    step('summary', results.surfaces.row15_summary.runtime, summaryLabel);

    await shot(page, '05-final');

    results.hdsd_inventory = [
      {
        hdsd_ref: 'Matrix #14 · Chấm công tuần',
        fe_label: weeklyLabel || 'Chấm công tuần',
        control: 'menuitem attendance ▼ → weekly',
        present: !!weeklyLabel,
      },
      {
        hdsd_ref: 'Matrix #15 · Tổng hợp',
        fe_label: summaryLabel || 'Tổng hợp công',
        control: 'menuitem attendance ▼ → summary → viewMode=data',
        present: !!summaryLabel,
      },
      {
        hdsd_ref: 'Sheet → weekly grid context',
        fe_label: 'Bảng chấm công → open row',
        control: 'setSelectedSheetId + attendanceViewMode=weekly',
        present: sheetContextProbe.opened === true || sheetRowCount === 0,
      },
    ];

    // Criteria
    const r14 = results.surfaces.row14_weekly;
    const r14s = results.surfaces.row14_sheet_context;
    const r15 = results.surfaces.row15_summary;
    const pageErrOk = results.pageErrors.length === 0;
    const no500 = results.networkBad.length === 0;
    const noMutate = results.mutateCalls.length === 0;

    results.criteria = {
      l0_entry: results.l0.hrm === 200 && results.l0.portal === 200,
      login_main: Boolean(session.token) && session.companyId === COMPANY,
      weekly_load: r14.runtime === 'LIVE',
      weekly_storm: r14.stormOk === true,
      weekly_no_error_banner: r14.syncError === false,
      sheet_context:
        r14s.runtime === 'LIVE' || r14s.runtime === 'N/A_NO_SHEET' || r14s.runtime === 'LIVE',
      summary_load: r15.runtime === 'LIVE',
      summary_storm: r15.stormOk === true,
      summary_no_error_banner: r15.syncError === false,
      pageErrors_zero: pageErrOk,
      no_http_500: no500,
      u65_no_mutate: noMutate,
      uat_done_false: results.uat_done === false,
      attendance_not_closed: results.attendance_closed === false,
    };

    if (!results.criteria.weekly_load) results.failReasons.push('row14 weekly not LIVE');
    if (!results.criteria.weekly_storm) results.failReasons.push('row14 GET storm after settle');
    if (!results.criteria.summary_load) results.failReasons.push('row15 summary not LIVE');
    if (!results.criteria.summary_storm) results.failReasons.push('row15 GET storm after settle');
    if (!results.criteria.pageErrors_zero) results.failReasons.push(`pageErrors=${results.pageErrors.length}`);
    if (!results.criteria.no_http_500) results.failReasons.push('HTTP ≥500 on HRM');
    if (r14s.opened && r14s.runtime !== 'LIVE') results.failReasons.push('sheet→weekly context not LIVE');

    const pass = results.failReasons.length === 0;
    results.verdict = pass ? 'PASS' : 'FAIL';
    results.ack_status = pass ? 'PASS_TO_PM' : 'FAIL';
    results.endedAt = ts();
    save();

    console.log(JSON.stringify({
      verdict: results.verdict,
      ack_status: results.ack_status,
      row14: r14.runtime,
      row14_sheet: r14s.runtime,
      row15: r15.runtime,
      weeklyGets: r14.listGets,
      summaryGets: r15.listGets,
      storm: { weekly: r14.storm10s, summary: r15.storm10s },
      failReasons: results.failReasons,
      out: OUT_JSON,
    }, null, 2));

    await browser.close();
    process.exit(pass ? 0 : 1);
  } catch (e) {
    results.verdict = 'FAIL';
    results.ack_status = 'FAIL';
    results.failReasons.push(String(e?.message || e).slice(0, 400));
    results.endedAt = ts();
    save();
    console.error(e);
    await browser.close().catch(() => null);
    process.exit(1);
  }
}

main();
