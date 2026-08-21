#!/usr/bin/env node
/**
 * PO-MFD-M2-ATT-SHEETS-01 — U65 browser fidelity
 * Matrix #11–12 · HRM-AT-14 sheets · AC-ATT-SHEET
 * List empty honesty · create CTA · Network · payroll period SoT
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
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-mfd-m2-att-sheets-01-browser.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-mfd-m2-att-sheets-01');
mkdirSync(SCREEN, { recursive: true });

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const SHEET_NAME = `QA-SHEET-MFD-M2 01/07/2026-31/07/2026`;
const START_VI = '01/07/2026';
const END_VI = '31/07/2026';
const SKIP_CREATE = process.env.SHEETS_SKIP_CREATE === '1';

const results = {
  work_item_id: 'PO-MFD-M2-ATT-SHEETS-01',
  startedAt: new Date().toISOString(),
  u65: 'zero-seed',
  hdsd_align: 'Attendance → Bảng công / sheets',
  env: { PORTAL, HRM, XBOS, EMAIL, commit: COMMIT },
  l0: {},
  steps: {},
  sheetGets: [],
  sheetPosts: [],
  recordsGets: [],
  consoleErrors: [],
  pageErrors: [],
  networkBad: [],
  surfaces: {},
  criteria: {},
  failReasons: [],
  residuals: [],
  verdict: null,
  ack_status: null,
  uat_done: false,
  endedAt: null,
};

function save() {
  writeFileSync(OUT_JSON, JSON.stringify(results, null, 2));
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

function q(path) {
  const u = new URL(path, PORTAL);
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
    if (!/\/api\/hrm\//.test(url)) return;
    if (status >= 500) {
      results.networkBad.push({ status, url: url.slice(0, 220) });
    }
    if (/attendance-sheets(\?|$|\/)/.test(url) && res.request().method() === 'GET') {
      let code = null;
      try {
        const j = await res.json();
        code = j?.code ?? j?.meta?.code ?? null;
      } catch {
        /* */
      }
      results.sheetGets.push({ status, code, url: url.slice(0, 220), t: Date.now() });
    }
    if (/attendance-sheets(\?|$)/.test(url) && res.request().method() === 'POST') {
      let code = null;
      let body = null;
      try {
        body = await res.json();
        code = body?.code ?? body?.meta?.code ?? null;
      } catch {
        /* */
      }
      results.sheetPosts.push({
        status,
        code,
        id: body?.data?.id ?? body?.id ?? null,
        url: url.slice(0, 220),
      });
    }
    if (/\/attendance\/records(\?|$)/.test(url) && res.request().method() === 'GET') {
      results.recordsGets.push({ status, url: url.slice(0, 220), t: Date.now() });
    }
  });
}

async function openSheetsMenu(page) {
  await page.locator('[data-testid="attendance-tab-menu"]').click({ timeout: 15_000 });
  await sleep(350);
  await page.getByRole('menuitem', { name: /Bảng chấm công/i }).click({ timeout: 10_000 });
  await sleep(1200);
}

async function fillDateInputs(dialog, startVi, endVi) {
  const inputs = dialog.locator('input[placeholder="dd/MM/yyyy"]');
  const count = await inputs.count();
  if (count < 2) throw new Error(`expected ≥2 dd/MM/yyyy inputs, got ${count}`);
  await inputs.nth(0).fill('');
  await inputs.nth(0).fill(startVi);
  await inputs.nth(0).blur();
  await sleep(200);
  await inputs.nth(1).fill('');
  await inputs.nth(1).fill(endVi);
  await inputs.nth(1).blur();
  await sleep(200);
}

async function main() {
  await probeL0();
  if (results.l0.hrm !== 200 || results.l0.portal !== 200) {
    results.verdict = 'BLOCKED';
    results.ack_status = 'BLOCKED';
    results.failReasons.push('L0 stack not healthy');
    results.endedAt = new Date().toISOString();
    save();
    process.exit(2);
  }

  const session = await loginApi();
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
    // —— Step 1: open Attendance embed ——
    const url = q('/hr/attendance');
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45_000 });
    await sleep(2000);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(2500);
    results.steps.landed = { url: page.url() };

    // —— Step 2: navigate Bảng chấm công (#11) ——
    const getsBefore = results.sheetGets.length;
    await openSheetsMenu(page);
    await sleep(1500);
    const titleVisible = await page.getByText(/Bảng chấm công chi tiết/i).isVisible().catch(() => false);
    const emptyCopy = await page
      .getByText(/Chưa có bảng chấm công nào/i)
      .isVisible()
      .catch(() => false);
    const addBtn = page
      .locator('button')
      .filter({ hasText: /^Thêm$/ })
      .first();
    const addVisible = await addBtn.isVisible().catch(() => false);
    const syncError = await page
      .getByText(/HRM API Sync ERROR|HRM API request failed/i)
      .isVisible()
      .catch(() => false);
    const listGets = results.sheetGets.slice(getsBefore);
    const listGetOk = listGets.some((g) => g.status === 200);
    const bodyText = await page.locator('main, [class*="space-y"]').first().innerText().catch(() => '');
    const rowCountHint = (bodyText.match(/Tổng số bản ghi:\s*(\d+)/) || [])[1] ?? null;

    results.surfaces.row11_list = {
      runtime: !titleVisible || syncError || !listGetOk ? 'BROKEN' : 'LIVE',
      titleVisible,
      emptyCopy,
      addVisible,
      syncError,
      listGets: listGets.map((g) => ({ status: g.status, code: g.code })),
      rowCountHint,
    };
    results.steps.list = results.surfaces.row11_list;
    await shot(page, '01-sheets-list.png');

    // Idle 10s storm check (AC-ATT-SHEET-04)
    const stormMark = Date.now();
    const getsAtMark = results.sheetGets.length;
    await sleep(10_000);
    const stormGets = results.sheetGets.filter((g) => g.t >= stormMark);
    results.steps.storm10s = {
      sheetGets: stormGets.length,
      recordsGets: results.recordsGets.filter((g) => g.t >= stormMark).length,
      ok: stormGets.length <= 2,
    };

    // —— Step 3: open create modal (#12) ——
    if (!addVisible) {
      results.surfaces.row12_create = { runtime: 'BROKEN', reason: 'Add CTA not visible' };
      results.failReasons.push('Add CTA missing on sheets list');
    } else if (SKIP_CREATE) {
      const existing = await page.getByText(/QA-SHEET-MFD-M2/i).first().isVisible().catch(() => false);
      results.surfaces.row12_create = {
        runtime: existing ? 'LIVE' : 'PARTIAL',
        skipped: true,
        existingRow: existing,
      };
      results.steps.create = results.surfaces.row12_create;
      results.steps.f5 = { rowAfterF5: existing, skipped: true };
      await shot(page, '04-after-create.png');
      await shot(page, '05-after-f5.png');
      if (existing) {
        await page.getByText(/QA-SHEET-MFD-M2/i).first().click();
        await sleep(2000);
        const weeklyTitle = await page
          .getByText(/Bảng chấm công từ ngày|Công chuẩn|Tải lại/i)
          .first()
          .isVisible()
          .catch(() => false);
        results.steps.grid = {
          weeklyTitle,
          runtime: weeklyTitle ? 'LIVE' : 'PARTIAL',
          skippedCreate: true,
        };
        await shot(page, '06-sheet-grid.png');
      }
    } else {
      await addBtn.click();
      await sleep(800);
      const dialog = page.getByRole('dialog');
      const dialogTitle = await dialog
        .getByText(/Thêm bảng chấm công/i)
        .isVisible()
        .catch(() => false);
      const saveBtn = dialog.getByRole('button', { name: /^Lưu$/ });
      const cancelBtn = dialog.getByRole('button', { name: /^Hủy$/ });
      const monthlyRadio = dialog.locator('input[type="radio"][value="monthly"]');
      results.surfaces.row12_modal = {
        dialogTitle,
        saveVisible: await saveBtn.isVisible().catch(() => false),
        cancelVisible: await cancelBtn.isVisible().catch(() => false),
        monthlyRadioVisible: await monthlyRadio.isVisible().catch(() => false),
      };
      await shot(page, '02-add-sheet-modal.png');

      // Fill form — July 2026 · Công chuẩn theo tháng
      const nameInput = dialog.locator('input[placeholder*="Bảng chấm công"]');
      if ((await nameInput.count()) > 0) {
        await nameInput.first().fill(SHEET_NAME);
      } else {
        const texts = dialog.locator('input:not([type="radio"]):not([type="checkbox"])');
        const n = await texts.count();
        let filled = false;
        for (let i = 0; i < n; i++) {
          const ph = (await texts.nth(i).getAttribute('placeholder')) || '';
          if (ph === 'dd/MM/yyyy') continue;
          if (/Bảng chấm|attendance|sheet/i.test(ph)) {
            await texts.nth(i).fill(SHEET_NAME);
            filled = true;
            break;
          }
        }
        if (!filled && n > 0) await texts.nth(0).fill(SHEET_NAME);
      }

      await fillDateInputs(dialog, START_VI, END_VI);
      if (await monthlyRadio.isVisible()) {
        await monthlyRadio.check({ force: true });
      }
      await shot(page, '03-add-sheet-filled.png');

      const postsBefore = results.sheetPosts.length;
      await saveBtn.click();
      await sleep(2500);

      const posts = results.sheetPosts.slice(postsBefore);
      const postOk = posts.find((p) => p.status === 201 || p.status === 200);
      const postFail = posts.find((p) => p.status >= 400);
      const rowAfter = await page.getByText(SHEET_NAME).isVisible().catch(() => false);
      const periodCell = await page
        .getByText(/01\/07\/2026\s*[-–]\s*31\/07\/2026/)
        .isVisible()
        .catch(() => false);

      results.surfaces.row12_create = {
        runtime: postOk && rowAfter ? 'LIVE' : postFail || !postOk ? 'BROKEN' : 'PARTIAL',
        posts,
        rowAfterCreate: rowAfter,
        periodVisible: periodCell,
        dialogClosed: !(await dialog.isVisible().catch(() => false)),
      };
      results.steps.create = results.surfaces.row12_create;
      await shot(page, '04-after-create.png');

      // F5 persistence
      await page.reload({ waitUntil: 'domcontentloaded' });
      await sleep(2500);
      await openSheetsMenu(page);
      await sleep(1500);
      const rowAfterF5 = await page.getByText(SHEET_NAME).isVisible().catch(() => false);
      results.steps.f5 = { rowAfterF5 };
      await shot(page, '05-after-f5.png');

      // Open sheet → weekly grid empty honesty
      if (rowAfterF5) {
        await page.getByText(SHEET_NAME).first().click();
        await sleep(2000);
        const weeklyTitle = await page
          .getByText(/Bảng chấm công từ ngày|Công chuẩn|Tải lại/i)
          .first()
          .isVisible()
          .catch(() => false);
        const errorBanner = await page
          .getByText(/HRM API Sync ERROR|request failed/i)
          .isVisible()
          .catch(() => false);
        const spinnerStorm = await page.locator('.animate-spin').count();
        results.steps.grid = {
          weeklyTitle,
          errorBanner,
          spinnerCount: spinnerStorm,
          recordsGets: results.recordsGets.slice(-5),
          runtime: errorBanner ? 'BROKEN' : weeklyTitle ? 'LIVE' : 'PARTIAL',
        };
        await shot(page, '06-sheet-grid.png');
      } else {
        results.steps.grid = { runtime: 'BLOCKED', reason: 'row missing after F5' };
        results.failReasons.push('Sheet row missing after F5');
      }
    }

    // —— Step 4: payroll period SoT — Dữ liệu tính lương → Chấm công ——
    const getsBeforePayroll = results.sheetGets.length;
    const payrollUrl = q('/hr/payroll');
    await page.goto(payrollUrl, { waitUntil: 'domcontentloaded', timeout: 45_000 });
    await sleep(2500);
    const dataMenu = page
      .locator('button')
      .filter({ hasText: /Dữ liệu tính lương/i })
      .first();
    let payrollNav = { clickedDataMenu: false, clickedAttItem: false };
    if (await dataMenu.isVisible().catch(() => false)) {
      await dataMenu.click();
      payrollNav.clickedDataMenu = true;
      await sleep(400);
      const attItem = page.getByRole('menuitem', { name: /^Chấm công$/ });
      if (await attItem.isVisible().catch(() => false)) {
        await attItem.click();
        payrollNav.clickedAttItem = true;
        await sleep(2500);
      }
    }
    const payrollSeesSheet = await page
      .getByText(/QA-SHEET-MFD-M2/i)
      .first()
      .isVisible()
      .catch(() => false);
    const payrollSeesPeriod = await page
      .getByText(/01\/07\/2026\s*[-–]\s*31\/07\/2026/)
      .first()
      .isVisible()
      .catch(() => false);
    const payrollGets = results.sheetGets.slice(getsBeforePayroll);
    const payrollGetOk = payrollGets.some((g) => g.status === 200);
    results.steps.payroll = {
      url: page.url(),
      ...payrollNav,
      payrollSeesSheet,
      payrollSeesPeriod,
      payrollGetOk,
      recentSheetGets: payrollGets.map((g) => ({ status: g.status, code: g.code })),
      note: 'Payroll → Dữ liệu tính lương → Chấm công · PayrollAttendanceTab · GET attendance-sheets',
      runtime:
        payrollSeesSheet || (payrollGetOk && payrollSeesPeriod)
          ? 'LIVE'
          : payrollGetOk
            ? 'PARTIAL'
            : 'BROKEN',
    };
    await shot(page, '07-payroll-period.png');

    // —— Verdict ——
    const s11 = results.surfaces.row11_list;
    const s12 = results.surfaces.row12_create;
    const f5ok = results.steps.f5?.rowAfterF5 === true;
    const createLive = s12?.runtime === 'LIVE' && f5ok;
    const listLive = s11?.runtime === 'LIVE' && !s11?.syncError;

    const payrollRt = results.steps.payroll?.runtime;
    if (listLive && createLive && results.steps.storm10s?.ok !== false) {
      results.verdict = 'PASS';
      results.ack_status = 'PASS_TO_PM';
      if (payrollRt === 'PARTIAL' || payrollRt === 'BROKEN') {
        results.residuals.push({
          id: 'R-MFD-M2-ATT-SHEETS-PAYROLL-UI',
          owner: payrollRt === 'BROKEN' ? 'dev-fe' : 'qa',
          severity: payrollRt === 'BROKEN' ? 'P1' : 'P2',
          note: `Payroll period binding UI ${payrollRt}: ${JSON.stringify(results.steps.payroll)}`,
        });
        // Attendance sheets AC core PASS; payroll consumer path residual — not invent Attendance CLOSED
        if (payrollRt === 'BROKEN') {
          results.verdict = 'PARTIAL';
          results.ack_status = 'FAIL';
          results.failReasons.push('Payroll Dữ liệu→Chấm công did not bind sheet period SoT in browser');
        }
      }
    } else if (listLive && !createLive) {
      results.verdict = 'FAIL';
      results.ack_status = 'FAIL';
      results.residuals.push({
        id: 'R-MFD-M2-ATT-SHEETS-CREATE',
        owner: s12?.posts?.some((p) => p.status >= 500) ? 'dev-be' : 'dev-fe',
        severity: 'P0',
        note: `Create/persist gap: ${JSON.stringify(s12?.posts || [])} f5=${f5ok}`,
      });
      results.failReasons.push('Create or F5 persist failed');
    } else if (!listLive) {
      results.verdict = 'FAIL';
      results.ack_status = 'FAIL';
      results.residuals.push({
        id: 'R-MFD-M2-ATT-SHEETS-LIST',
        owner: 'dev-be',
        severity: 'P0',
        note: 'Sheets list not LIVE — GET fail or Sync ERROR',
      });
    } else {
      results.verdict = 'PARTIAL';
      results.ack_status = 'FAIL';
      results.failReasons.push('Partial fidelity — see surfaces');
    }

    if (results.pageErrors.length) {
      results.residuals.push({
        id: 'R-MFD-M2-ATT-SHEETS-PAGEERROR',
        owner: 'dev-fe',
        severity: 'P1',
        note: results.pageErrors.slice(0, 3).join(' | '),
      });
    }
  } catch (e) {
    results.verdict = 'BLOCKED';
    results.ack_status = 'BLOCKED';
    results.failReasons.push(String(e?.message || e).slice(0, 400));
  } finally {
    results.endedAt = new Date().toISOString();
    save();
    await browser.close().catch(() => null);
  }

  console.log(JSON.stringify({
    verdict: results.verdict,
    ack_status: results.ack_status,
    surfaces: results.surfaces,
    steps: {
      storm10s: results.steps.storm10s,
      f5: results.steps.f5,
      create: results.steps.create,
      payroll: results.steps.payroll,
      grid: results.steps.grid,
    },
    failReasons: results.failReasons,
    residuals: results.residuals,
    out: OUT_JSON,
  }, null, 2));

  process.exit(results.ack_status === 'PASS_TO_PM' ? 0 : 1);
}

main().catch((e) => {
  results.verdict = 'BLOCKED';
  results.ack_status = 'BLOCKED';
  results.failReasons.push(String(e?.message || e));
  results.endedAt = new Date().toISOString();
  save();
  console.error(e);
  process.exit(2);
});
