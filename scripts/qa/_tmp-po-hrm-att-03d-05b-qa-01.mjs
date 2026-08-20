#!/usr/bin/env node
/**
 * PO-HRM-ATT-03d-05b-QA-01 — U65 browser-only
 * UF1: GPS work-sites create → edit radius → FE + F5
 * UF2: Leave balance panel by type (GET leave-balance/panel)
 * CẤM: seed · API mutate outside UI · invent Attendance CLOSED
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
const PASSWORD = process.env.PORTAL_DEV_PASSWORD || 'Xevn@2026';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-att-03d-05b-qa-01-browser.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-att-03d-05b-qa-01');
const SHOTS = resolve(ROOT, 'docs/qa/evidence/shots');
mkdirSync(SCREEN, { recursive: true });
mkdirSync(SHOTS, { recursive: true });

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SITE_NAME = `QA-GPS-${Date.now().toString(36).slice(-6)}`;
const SITE_LAT = 10.7769;
const SITE_LNG = 106.7009;
const SITE_RADIUS = 120;
const SITE_RADIUS_EDIT = 200;

const results = {
  work_item_id: 'PO-HRM-ATT-03d-05b-QA-01',
  startedAt: new Date().toISOString(),
  u65: 'zero-seed-browser-only',
  hdsd_align:
    'Chấm công → Thiết lập → Quy định chấm công → App → GPS card · Nghỉ phép → Tạo yêu cầu → panel quỹ',
  env: { PORTAL, HRM, XBOS, EMAIL, commit: COMMIT },
  l0: {},
  steps: {},
  network: {
    workSitesGet: [],
    workSitesPost: [],
    workSitesPatch: [],
    workSitesDelete: [],
    leaveBalancePanel: [],
    leaveBalanceSingle: [],
    bad5xx: [],
  },
  consoleErrors: [],
  pageErrors: [],
  uf: {},
  residual: [],
  verdict: null,
  ack_status: null,
  failReasons: [],
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
  return results.l0.hrm === 200 && results.l0.xbos === 200 && Number(results.l0.portal) === 200;
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
  const p = join(SCREEN, `${name}.png`);
  await page.screenshot({ path: p, fullPage: false });
  return p;
}

function trackResponse(res) {
  const u = res.url();
  const method = res.request().method();
  const status = res.status();
  const path = u.replace(/^https?:\/\/[^/]+/, '').slice(0, 320);
  const row = { at: new Date().toISOString(), method, status, path };

  if (/\/api\/hrm\/attendance\/work-sites/.test(u)) {
    if (method === 'GET') results.network.workSitesGet.push(row);
    else if (method === 'POST') results.network.workSitesPost.push(row);
    else if (method === 'PATCH') results.network.workSitesPatch.push(row);
    else if (method === 'DELETE') results.network.workSitesDelete.push(row);
  }
  if (/\/api\/hrm\/attendance\/leave-balance\/panel/.test(u) && method === 'GET') {
    results.network.leaveBalancePanel.push(row);
  } else if (/\/api\/hrm\/attendance\/leave-balance(?:\?|$)/.test(u) && method === 'GET') {
    results.network.leaveBalanceSingle.push(row);
  }
  if (/\/api\/hrm\//.test(u) && status >= 500) {
    results.network.bad5xx.push(row);
  }
}

async function openGpsCard(page) {
  await page.getByRole('button', { name: /^Thiết lập$/ }).click({ timeout: 15_000 });
  await sleep(800);
  await page.locator('nav button').filter({ hasText: 'Quy định chấm công' }).click({ timeout: 12_000 });
  await sleep(1200);
  await page.getByTestId('hdsd-att-rules-tab-app').click({ timeout: 10_000 });
  await sleep(1500);
  await page.getByTestId('att-gps-sites-card').waitFor({ state: 'visible', timeout: 12_000 });
}

async function fillGpsDialog(page, { name, lat, lng, radius }) {
  const dialog = page.locator('[data-testid="att-gps-add-dialog"], [data-testid="att-gps-edit-dialog"]');
  await dialog.waitFor({ state: 'visible', timeout: 10_000 });
  const inputs = dialog.locator('input');
  // order: name, address, lat, lng, radius
  await inputs.nth(0).fill(String(name));
  await inputs.nth(1).fill('QA U65 geofence site');
  await inputs.nth(2).fill(String(lat));
  await inputs.nth(3).fill(String(lng));
  await inputs.nth(4).fill(String(radius));
}

async function main() {
  const l0ok = await probeL0();
  if (!l0ok) {
    results.verdict = 'BLOCKED';
    results.ack_status = 'FAIL_TO_PM';
    results.failReasons.push('L0 down — need devops restart xbos/hrm/portal');
    results.residual.push({
      id: 'PO-HRM-ATT-03d-05b-DEVOPS-L0',
      owner: 'devops',
      note: `l0=${JSON.stringify(results.l0)} — start xbos-api :28002 (tsc emit dist if nest watch MODULE_NOT_FOUND)`,
    });
    results.endedAt = new Date().toISOString();
    save();
    console.log(JSON.stringify({ verdict: results.verdict, l0: results.l0 }, null, 2));
    process.exit(2);
  }

  const session = await loginApi();
  results.steps.login = { http: session.http, persona: EMAIL, companyId: 'main' };
  save();

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  page.on('console', (msg) => {
    const t = msg.text();
    if (msg.type() === 'error' && !/favicon|React DevTools|Download the React/i.test(t)) {
      results.consoleErrors.push(t.slice(0, 400));
    }
  });
  page.on('pageerror', (err) => results.pageErrors.push(String(err).slice(0, 400)));
  page.on('response', trackResponse);

  await injectPortalAuth(page, session);
  await page.goto(q('/hr/attendance'), { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await sleep(2500);
  results.steps.landed = { url: page.url() };

  // ========== UF1 GPS work-sites ==========
  try {
    await openGpsCard(page);
    await shot(page, '01-gps-list');
    const getBefore = results.network.workSitesGet.length;
    await sleep(800);
    const emptyOk = await page
      .getByText(/Chưa có vị trí GPS|noGpsLocations/i)
      .first()
      .isVisible()
      .catch(() => false);
    const rowCount0 = await page.locator('[data-testid^="att-gps-row-"]').count();
    results.uf.gps_list = {
      get2xx: results.network.workSitesGet.some((g) => g.status >= 200 && g.status < 300),
      emptyOrRows: emptyOk || rowCount0 >= 0,
      rowCount0,
      getCalls: results.network.workSitesGet.slice(getBefore),
    };

    // Create
    results.network.workSitesPost.length = 0;
    await page.getByTestId('att-gps-add-open').click({ timeout: 10_000 });
    await fillGpsDialog(page, {
      name: SITE_NAME,
      lat: SITE_LAT,
      lng: SITE_LNG,
      radius: SITE_RADIUS,
    });
    await page.getByTestId('att-gps-add-submit').click({ timeout: 8_000 });
    await sleep(2500);
    const postOk = results.network.workSitesPost.some((p) => p.status >= 200 && p.status < 300);
    const rowVisible = await page.getByText(SITE_NAME).first().isVisible().catch(() => false);
    const radiusVisible = await page
      .locator('[data-testid^="att-gps-row-"]')
      .filter({ hasText: SITE_NAME })
      .filter({ hasText: new RegExp(`${SITE_RADIUS}m`) })
      .count()
      .then((c) => c > 0)
      .catch(() => false);
    await shot(page, '02-gps-after-create');
    await page.screenshot({ path: join(SHOTS, 'po-hrm-att-03d-gps.png'), fullPage: false });

    // F5 persist create
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 60_000 });
    await sleep(2000);
    await openGpsCard(page);
    await sleep(1500);
    const afterF5Create = await page.getByText(SITE_NAME).first().isVisible().catch(() => false);
    await shot(page, '03-gps-f5-after-create');

    // Edit radius
    results.network.workSitesPatch.length = 0;
    const targetRow = page.locator('[data-testid^="att-gps-row-"]').filter({ hasText: SITE_NAME }).first();
    const editBtn = targetRow.locator('[data-testid^="att-gps-edit-"]');
    await editBtn.click({ timeout: 10_000 });
    await fillGpsDialog(page, {
      name: SITE_NAME,
      lat: SITE_LAT,
      lng: SITE_LNG,
      radius: SITE_RADIUS_EDIT,
    });
    await page.getByTestId('att-gps-edit-submit').click({ timeout: 8_000 });
    await sleep(2500);
    const patchOk = results.network.workSitesPatch.some((p) => p.status >= 200 && p.status < 300);
    const editFe = await page
      .locator('[data-testid^="att-gps-row-"]')
      .filter({ hasText: SITE_NAME })
      .filter({ hasText: new RegExp(`${SITE_RADIUS_EDIT}m`) })
      .count()
      .then((c) => c > 0)
      .catch(() => false);
    await shot(page, '04-gps-after-edit');

    // F5 persist edit
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 60_000 });
    await sleep(2000);
    await openGpsCard(page);
    await sleep(1500);
    const afterF5Edit = await page
      .locator('[data-testid^="att-gps-row-"]')
      .filter({ hasText: SITE_NAME })
      .filter({ hasText: new RegExp(`${SITE_RADIUS_EDIT}m`) })
      .count()
      .then((c) => c > 0)
      .catch(() => false);
    await shot(page, '05-gps-f5-after-edit');

    // Cleanup delete (UI path — not seed; keep env tidy for next runs)
    results.network.workSitesDelete.length = 0;
    const delRow = page.locator('[data-testid^="att-gps-row-"]').filter({ hasText: SITE_NAME }).first();
    const delBtn = delRow.locator('[data-testid^="att-gps-remove-"]');
    if ((await delBtn.count()) > 0) {
      page.once('dialog', (d) => d.accept().catch(() => {}));
      await delBtn.click({ timeout: 8_000 });
      await sleep(2000);
    }
    const deleteOk =
      results.network.workSitesDelete.some((d) => d.status >= 200 && d.status < 300) ||
      !(await page.getByText(SITE_NAME).first().isVisible().catch(() => false));

    results.uf.gps_crud = {
      siteName: SITE_NAME,
      postOk,
      rowVisibleAfterCreate: rowVisible,
      radiusVisibleAfterCreate: radiusVisible,
      f5AfterCreate: afterF5Create,
      patchOk,
      feAfterEdit: editFe,
      f5AfterEdit: afterF5Edit,
      deleteOk,
      posts: results.network.workSitesPost,
      patches: results.network.workSitesPatch,
      deletes: results.network.workSitesDelete,
    };

    const gpsPass =
      postOk &&
      rowVisible &&
      afterF5Create &&
      patchOk &&
      editFe &&
      afterF5Edit;
    results.uf.gps_verdict = gpsPass ? 'PASS' : 'FAIL';
    if (!gpsPass) {
      results.failReasons.push('UF1 GPS work-sites create/edit/F5 incomplete');
      results.residual.push({
        id: 'PO-HRM-ATT-03d-05b-DEV-GPS',
        owner: postOk || patchOk ? 'dev-fe' : 'dev-be',
        note: JSON.stringify(results.uf.gps_crud),
      });
    }
  } catch (e) {
    results.uf.gps_verdict = 'FAIL';
    results.uf.gps_error = String(e).slice(0, 500);
    results.failReasons.push(`UF1 exception: ${String(e).slice(0, 200)}`);
    results.residual.push({
      id: 'PO-HRM-ATT-03d-05b-DEV-GPS',
      owner: 'dev-fe',
      note: results.uf.gps_error,
    });
    await shot(page, '99-gps-error').catch(() => {});
  }
  save();

  // ========== UF2 Leave panel ==========
  try {
    results.network.leaveBalancePanel.length = 0;
    results.network.leaveBalanceSingle.length = 0;
    await page.goto(q('/hr/attendance'), { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await sleep(2000);
    await page.getByRole('button', { name: /^Nghỉ phép$/ }).click({ timeout: 15_000 });
    await sleep(1500);
    await page.getByRole('button', { name: /Tạo yêu cầu nghỉ/i }).click({ timeout: 12_000 });
    await sleep(1000);

    const dialog = page.locator('[role="dialog"]').first();
    await dialog.waitFor({ state: 'visible', timeout: 10_000 });
    const selectTrigger = dialog.locator('[role="combobox"]').first();
    await selectTrigger.click({ timeout: 8000 });
    await sleep(500);
    let empPicked = false;
    let empText = '';
    for (let attempt = 0; attempt < 10; attempt++) {
      const opt = page.locator('[role="option"]').first();
      if ((await opt.count()) > 0) {
        empText = (await opt.innerText()).trim();
        await opt.click();
        empPicked = true;
        break;
      }
      await sleep(1200);
      if (attempt === 2) await selectTrigger.click().catch(() => {});
    }
    await sleep(2500);

    // Prefer dialog-scoped locators — page also mounts leave-balance-panel under aria-hidden
    await dialog.getByTestId('leave-balance-panel').waitFor({ state: 'attached', timeout: 12_000 }).catch(() => {});
    const panelVisible =
      (await dialog.getByTestId('leave-balance-panel').count()) > 0 &&
      ((await dialog.getByTestId('leave-balance-panel').isVisible().catch(() => false)) ||
        (await dialog.getByTestId('leave-balance-panel').count()) > 0);
    const byTypeVisible =
      (await dialog.getByTestId('leave-balance-by-type').count()) > 0 &&
      ((await dialog.getByTestId('leave-balance-by-type').isVisible().catch(() => false)) ||
        (await dialog.getByTestId('leave-balance-by-type').count()) > 0);
    const panelGets = results.network.leaveBalancePanel.filter((g) => g.status >= 200 && g.status < 300);
    const singleGets = results.network.leaveBalanceSingle;
    const storm = singleGets.length > 3 && panelGets.length === 0;
    const body = await dialog.innerText().catch(() => '');
    const bannerStorm =
      (body.match(/HRM API Sync ERROR|Sync ERROR|Failed to load/gi) || []).length >= 2;
    const honestEmpty =
      /Còn lại|Hold|0|—|không có|empty|quỹ|Số dư phép/i.test(body) || byTypeVisible;
    const mvpTypes = ['annual', 'seniority', 'compensatory', 'carry_over', 'advance'];
    const mvpRows = {};
    for (const t of mvpTypes) {
      mvpRows[t] = (await dialog.locator(`[data-testid="leave-balance-row-${t}"]`).count()) > 0;
    }
    const mvpRowCount = Object.values(mvpRows).filter(Boolean).length;

    await shot(page, '06-leave-panel');
    await page.screenshot({
      path: join(SHOTS, 'po-hrm-att-05b-leave-panel.png'),
      fullPage: false,
    });

    // Optional: set dates for projected remaining
    const projectedVisible = await page
      .getByTestId('leave-balance-projected')
      .isVisible()
      .catch(() => false);

    results.uf.leave_panel = {
      empPicked,
      empText: empText.slice(0, 80),
      panelVisible,
      byTypeVisible,
      panelGet2xx: panelGets.length > 0,
      panelGets,
      mvpRows,
      mvpRowCount,
      singleGetsCount: singleGets.length,
      singleGetsSample: singleGets.slice(0, 5),
      storm,
      bannerStorm,
      honestEmpty,
      projectedVisible,
      pageErrors: results.pageErrors.slice(-5),
    };

    // PASS: panel GET 2xx + 5 MVP rows in DOM (dialog overflow may hide isVisible)
    const leavePass =
      empPicked &&
      panelGets.length > 0 &&
      mvpRowCount >= 5 &&
      (panelVisible || byTypeVisible || mvpRowCount >= 5) &&
      !storm &&
      !bannerStorm &&
      results.network.bad5xx.filter((b) => /leave-balance/.test(b.path)).length === 0;
    results.uf.leave_verdict = leavePass ? 'PASS' : 'FAIL';
    if (!leavePass) {
      results.failReasons.push('UF2 leave-balance/panel bind incomplete or storm');
      results.residual.push({
        id: 'PO-HRM-ATT-03d-05b-DEV-LEAVE',
        owner: panelGets.length === 0 || mvpRowCount < 5 ? 'dev-fe' : 'dev-be',
        note: JSON.stringify(results.uf.leave_panel),
      });
    }

    // Close dialog — no submit mutate leave request
    await page.keyboard.press('Escape').catch(() => {});
  } catch (e) {
    results.uf.leave_verdict = 'FAIL';
    results.uf.leave_error = String(e).slice(0, 500);
    results.failReasons.push(`UF2 exception: ${String(e).slice(0, 200)}`);
    results.residual.push({
      id: 'PO-HRM-ATT-03d-05b-DEV-LEAVE',
      owner: 'dev-fe',
      note: results.uf.leave_error,
    });
    await shot(page, '99-leave-error').catch(() => {});
  }

  const gpsOk = results.uf.gps_verdict === 'PASS';
  const leaveOk = results.uf.leave_verdict === 'PASS';
  const noCrash = results.pageErrors.length === 0;
  results.verdict = gpsOk && leaveOk && noCrash ? 'PASS' : 'FAIL';
  results.ack_status = results.verdict === 'PASS' ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  results.attendance_closed_claim = false;
  results.endedAt = new Date().toISOString();
  save();

  await browser.close();
  console.log(
    JSON.stringify(
      {
        verdict: results.verdict,
        ack_status: results.ack_status,
        gps: results.uf.gps_verdict,
        leave: results.uf.leave_verdict,
        failReasons: results.failReasons,
        residual: results.residual,
        l0: results.l0,
      },
      null,
      2,
    ),
  );
  process.exit(results.verdict === 'PASS' ? 0 : 1);
}

main().catch((e) => {
  results.verdict = 'FAIL';
  results.ack_status = 'FAIL_TO_PM';
  results.failReasons.push(String(e).slice(0, 400));
  results.endedAt = new Date().toISOString();
  save();
  console.error(e);
  process.exit(1);
});
