#!/usr/bin/env node
/**
 * PO-MFD-M2-ATT-SHIFTS-02-QA — U65 browser
 * Danh sách ca LIVE + Lịch phân ca / Ca làm thêm GĐ2 hold honesty
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
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-mfd-m2-att-shifts-02-qa-browser.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-mfd-m2-att-shifts-02-qa');
mkdirSync(SCREEN, { recursive: true });

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const results = {
  work_item_id: 'PO-MFD-M2-ATT-SHIFTS-02-QA',
  fe_work_item: 'PO-MFD-M2-ATT-SHIFTS-02',
  startedAt: new Date().toISOString(),
  u65: 'zero-seed',
  hdsd_align: 'Attendance → Ca',
  env: { PORTAL, HRM, XBOS, EMAIL, commit: COMMIT },
  l0: {},
  steps: {},
  workShiftGets: [],
  consoleErrors: [],
  pageErrors: [],
  networkBad: [],
  criteria: {},
  failReasons: [],
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

async function openShiftsMenu(page) {
  const trig = page.locator('button').filter({ hasText: /Ca làm việc/i }).first();
  await trig.click({ timeout: 15_000 });
  await sleep(450);
}

async function clickShiftsMenuItem(page, testId) {
  await openShiftsMenu(page);
  const item = page.getByTestId(testId);
  await item.click({ timeout: 10_000 });
  await sleep(900);
}

function hasDepthError() {
  const re = /Maximum update depth/i;
  return (
    results.pageErrors.some((e) => re.test(e)) ||
    results.consoleErrors.some((e) => re.test(e))
  );
}

async function shot(page, name) {
  const p = join(SCREEN, name);
  await page.screenshot({ path: p, fullPage: false });
  return p.replace(/\\/g, '/').split('docs/qa/evidence/')[1] || p;
}

async function main() {
  await probeL0();
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
    if (msg.type() === 'error' && !/favicon|React DevTools/i.test(t)) {
      results.consoleErrors.push(t.slice(0, 400));
    }
    if (/Maximum update depth/i.test(t)) {
      results.consoleErrors.push(`[depth] ${t.slice(0, 400)}`);
    }
  });
  page.on('pageerror', (err) => results.pageErrors.push(String(err).slice(0, 400)));
  page.on('response', (res) => {
    const u = res.url();
    if (/\/api\/hrm\/attendance\/work-shifts/.test(u) && res.request().method() === 'GET') {
      results.workShiftGets.push({
        at: new Date().toISOString(),
        status: res.status(),
        path: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 220),
      });
    }
    if (/\/api\/hrm\//.test(u) && res.status() >= 500) {
      results.networkBad.push({ status: res.status(), url: u.slice(0, 240) });
    }
  });

  await injectPortalAuth(page, session);
  const url = q('/hr/attendance');
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45_000 });
  await sleep(1800);
  // Hard reload (FE honesty bundle)
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 45_000 });
  await sleep(2000);
  results.steps.attendanceLoad = {
    url,
    hardReload: true,
    bodyHint: /Chấm công|Ca làm việc/i.test(await page.locator('body').innerText().catch(() => '')),
  };
  save();

  // --- 1) Danh sách ca LIVE ---
  results.workShiftGets.length = 0;
  await clickShiftsMenuItem(page, 'shifts-menu-list');
  await sleep(2000);
  const idleStart = Date.now();
  await sleep(5000);
  const getsIdle = results.workShiftGets.filter((g) => new Date(g.at).getTime() >= idleStart - 300);
  const tableVisible = (await page.locator('[data-testid="shifts-table"]').count()) > 0;
  const listGetsOk = results.workShiftGets.some((g) => g.status >= 200 && g.status < 300);
  const noDepth = !hasDepthError();
  const noStorm = getsIdle.length <= 2 && results.workShiftGets.length <= 8;
  results.steps.list = {
    tableVisible,
    workShiftGetTotal: results.workShiftGets.length,
    workShiftGetsIdle5s: getsIdle.length,
    workShiftStatuses: [...new Set(results.workShiftGets.map((g) => g.status))],
    noMaximumUpdateDepth: noDepth,
    noGetStorm: noStorm,
    screenshot: await shot(page, '01-danh-sach-ca.png'),
  };
  results.criteria.c1_list_live =
    tableVisible && listGetsOk && noDepth && noStorm;
  if (!results.criteria.c1_list_live) {
    results.failReasons.push(
      `C1 FAIL table=${tableVisible} gets=${results.workShiftGets.length} idle=${getsIdle.length} depth=${!noDepth}`,
    );
  }
  save();

  // --- 2) Lịch phân ca hold ---
  await openShiftsMenu(page);
  const scheduleMenuBadge = (await page.getByTestId('shifts-menu-schedule-gd2').count()) > 0;
  const scheduleMenuBadgeText = scheduleMenuBadge
    ? (await page.getByTestId('shifts-menu-schedule-gd2').innerText()).trim()
    : '';
  await page.getByTestId('shifts-menu-schedule').click({ timeout: 10_000 });
  await sleep(1000);
  const scheduleHold = (await page.getByTestId('shifts-schedule-hold').count()) > 0;
  const scheduleAlert = (await page.getByTestId('shifts-gd2-hold-alert').count()) > 0;
  const scheduleHoldBadge = (await page.getByTestId('shifts-gd2-hold-badge').count()) > 0;
  const scheduleHoldBadgeText = scheduleHoldBadge
    ? (await page.getByTestId('shifts-gd2-hold-badge').innerText()).trim()
    : '';
  const scheduleAlertText = scheduleAlert
    ? (await page.getByTestId('shifts-gd2-hold-alert').innerText()).slice(0, 280)
    : '';
  const scheduleTableAbsent = (await page.locator('[data-testid="shifts-table"]').count()) === 0;
  const featureInDev = /đang được phát triển|đang phát triển|featureInDev|in development/i.test(
    scheduleAlertText,
  );
  results.steps.schedule = {
    menuGd2Badge: scheduleMenuBadge,
    menuGd2Text: scheduleMenuBadgeText,
    holdVisible: scheduleHold,
    alertVisible: scheduleAlert,
    holdBadgeText: scheduleHoldBadgeText,
    alertExcerpt: scheduleAlertText,
    featureInDev,
    shiftsTableAbsent: scheduleTableAbsent,
    screenshot: await shot(page, '02-lich-phan-ca-hold.png'),
  };
  results.criteria.c2_schedule_hold =
    scheduleMenuBadge &&
    scheduleHold &&
    scheduleAlert &&
    scheduleHoldBadge &&
    /GĐ2|P2/i.test(scheduleHoldBadgeText) &&
    scheduleTableAbsent &&
    featureInDev;
  if (!results.criteria.c2_schedule_hold) {
    results.failReasons.push(
      `C2 FAIL menuBadge=${scheduleMenuBadge} hold=${scheduleHold} alert=${scheduleAlert} tableAbsent=${scheduleTableAbsent} badge=${scheduleHoldBadgeText}`,
    );
  }
  save();

  // --- 3) Ca làm thêm hold ---
  await openShiftsMenu(page);
  const otMenuBadge = (await page.getByTestId('shifts-menu-overtime-gd2').count()) > 0;
  const otMenuBadgeText = otMenuBadge
    ? (await page.getByTestId('shifts-menu-overtime-gd2').innerText()).trim()
    : '';
  await page.getByTestId('shifts-menu-overtime').click({ timeout: 10_000 });
  await sleep(1000);
  const otHold = (await page.getByTestId('shifts-overtime-hold').count()) > 0;
  const otAlert = (await page.getByTestId('shifts-gd2-hold-alert').count()) > 0;
  const otHoldBadge = (await page.getByTestId('shifts-gd2-hold-badge').count()) > 0;
  const otHoldBadgeText = otHoldBadge
    ? (await page.getByTestId('shifts-gd2-hold-badge').innerText()).trim()
    : '';
  const otAlertText = otAlert
    ? (await page.getByTestId('shifts-gd2-hold-alert').innerText()).slice(0, 280)
    : '';
  const otTableAbsent = (await page.locator('[data-testid="shifts-table"]').count()) === 0;
  const otFeatureInDev = /đang được phát triển|đang phát triển|featureInDev|in development/i.test(
    otAlertText,
  );
  results.steps.overtime = {
    menuGd2Badge: otMenuBadge,
    menuGd2Text: otMenuBadgeText,
    holdVisible: otHold,
    alertVisible: otAlert,
    holdBadgeText: otHoldBadgeText,
    alertExcerpt: otAlertText,
    featureInDev: otFeatureInDev,
    shiftsTableAbsent: otTableAbsent,
    screenshot: await shot(page, '03-ca-lam-them-hold.png'),
  };
  results.criteria.c3_overtime_hold =
    otMenuBadge &&
    otHold &&
    otAlert &&
    otHoldBadge &&
    /GĐ2|P2/i.test(otHoldBadgeText) &&
    otTableAbsent &&
    otFeatureInDev;
  if (!results.criteria.c3_overtime_hold) {
    results.failReasons.push(
      `C3 FAIL menuBadge=${otMenuBadge} hold=${otHold} alert=${otAlert} tableAbsent=${otTableAbsent} badge=${otHoldBadgeText}`,
    );
  }
  save();

  // --- 4) Hold CTA → Danh sách ca ---
  const cta = page.getByTestId('shifts-hold-goto-list');
  const ctaVisible = (await cta.count()) > 0;
  if (ctaVisible) {
    await cta.click({ timeout: 8000 });
    await sleep(1200);
  }
  const backTable = (await page.locator('[data-testid="shifts-table"]').count()) > 0;
  const holdGone =
    (await page.getByTestId('shifts-overtime-hold').count()) === 0 &&
    (await page.getByTestId('shifts-schedule-hold').count()) === 0;
  results.steps.holdCta = {
    ctaVisible,
    returnedToList: backTable,
    holdPanelsGone: holdGone,
    screenshot: await shot(page, '04-cta-back-to-list.png'),
  };
  results.criteria.c4_cta_to_list = ctaVisible && backTable && holdGone;
  if (!results.criteria.c4_cta_to_list) {
    results.failReasons.push(
      `C4 FAIL cta=${ctaVisible} table=${backTable} holdGone=${holdGone}`,
    );
  }
  save();

  results.steps.depthAndErrors = {
    pageErrors: results.pageErrors.slice(0, 10),
    consoleErrors: results.consoleErrors.slice(0, 15),
    maximumUpdateDepth: hasDepthError(),
    network500: results.networkBad.slice(0, 8),
  };

  const allPass =
    results.criteria.c1_list_live &&
    results.criteria.c2_schedule_hold &&
    results.criteria.c3_overtime_hold &&
    results.criteria.c4_cta_to_list &&
    !hasDepthError();

  results.verdict = allPass ? 'PASS' : 'FAIL';
  results.ack_status = allPass ? 'PASS_TO_PM' : 'FAIL';
  results.uat_done = false;
  results.endedAt = new Date().toISOString();
  save();

  await browser.close();
  console.log(JSON.stringify({
    verdict: results.verdict,
    ack_status: results.ack_status,
    criteria: results.criteria,
    failReasons: results.failReasons,
    out: OUT_JSON,
  }, null, 2));
  process.exit(allPass ? 0 : 2);
}

main().catch((e) => {
  results.verdict = 'ERROR';
  results.ack_status = 'FAIL';
  results.failReasons.push(String(e?.stack || e).slice(0, 600));
  results.endedAt = new Date().toISOString();
  save();
  console.error(e);
  process.exit(1);
});
