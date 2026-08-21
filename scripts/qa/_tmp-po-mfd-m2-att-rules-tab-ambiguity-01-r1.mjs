#!/usr/bin/env node
/**
 * PO-MFD-M2-ATT-RULES-TAB-AMBIGUITY-01-R1 — U65 browser retest
 * HDSD: Attendance → Thiết lập → Quy định chấm công
 * Assert: distinct testids; exact «Máy chấm công» count === 1; stubs honest
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
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
const OUT_JSON = resolve(
  ROOT,
  'docs/qa/evidence/_tmp-po-mfd-m2-att-rules-tab-ambiguity-01-r1-browser.json',
);
const SCREEN = resolve(
  ROOT,
  'docs/qa/evidence/screens/po-mfd-m2-att-rules-tab-ambiguity-01-r1',
);
mkdirSync(SCREEN, { recursive: true });

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

const report = {
  work_item_id: 'PO-MFD-M2-ATT-RULES-TAB-AMBIGUITY-01-R1',
  startedAt: ts(),
  u65_zero_seed: true,
  hdsd_align: 'Attendance → Thiết lập → Quy định chấm công',
  env: { PORTAL, HRM, EMAIL, COMPANY, TENANT, commit: COMMIT },
  l0: {},
  consoleErrors: [],
  pageErrors: [],
  checks: {},
  tabClicks: {},
  screens: [],
  residuals: [],
  verdict: null,
  ack_status: null,
  endedAt: null,
};

function save() {
  writeFileSync(OUT_JSON, JSON.stringify(report, null, 2));
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
    user: {
      userId: u.userId || u.id || EMAIL,
      email: u.email || EMAIL,
      displayName: u.displayName || u.fullName || u.name || EMAIL,
      roles: u.roles || ['group_ceo'],
    },
    http: r.status,
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
  const path = resolve(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false });
  report.screens.push(path.replace(/\\/g, '/').split('docs/qa/evidence/')[1] || path);
  return path;
}

async function clickTabByTestId(page, id) {
  const beforeErrors = report.pageErrors.length;
  const loc = page.getByTestId(`hdsd-att-rules-tab-${id}`);
  const count = await loc.count();
  const visible = count > 0 ? await loc.first().isVisible() : false;
  let clickOk = false;
  let strictCollision = false;
  let errMsg = null;
  try {
    await loc.click({ timeout: 10_000 });
    clickOk = true;
  } catch (e) {
    errMsg = String(e).slice(0, 500);
    if (/strict mode violation/i.test(errMsg)) strictCollision = true;
  }
  await sleep(600);
  const body = await page.locator('body').innerText().catch(() => '');
  const featureInDev = /Tính năng đang được phát triển|Feature under development|đang được phát triển/i.test(
    body,
  );
  const newPageErrors = report.pageErrors.slice(beforeErrors);
  const scanFace = newPageErrors.some((e) => /ScanFace/i.test(e));
  const crashed =
    /Something went wrong|is not defined|Cannot read propert/i.test(body) ||
    (newPageErrors.length > 0 && !scanFace && id !== 'app');
  report.tabClicks[id] = {
    testid: `hdsd-att-rules-tab-${id}`,
    count,
    visible,
    clickOk,
    strictCollision,
    featureInDev,
    scanFace,
    newPageErrors,
    errMsg,
    bodySnippet: body.replace(/\s+/g, ' ').slice(0, 280),
  };
  await shot(page, `tab-${id}`);
  return report.tabClicks[id];
}

async function main() {
  const l0Hrm = await fetch(`${HRM}/api/hrm/`).then((r) => r.status).catch(() => 0);
  const l0Portal = await fetch(PORTAL).then((r) => r.status).catch(() => 0);
  report.l0 = { hrm_api: l0Hrm, portal: l0Portal };
  if (l0Hrm !== 200 || l0Portal !== 200) {
    throw new Error(`L0 FAIL hrm=${l0Hrm} portal=${l0Portal}`);
  }

  const session = await loginApi();
  report.checks.login = { http: session.http, persona: EMAIL, companyId: COMPANY };

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  page.on('console', (msg) => {
    const t = msg.text();
    if (msg.type() === 'error' && !/favicon|React DevTools/i.test(t)) {
      report.consoleErrors.push(t.slice(0, 400));
    }
  });
  page.on('pageerror', (err) => report.pageErrors.push(String(err).slice(0, 400)));

  await injectPortalAuth(page, session);

  const url = q('/hr/attendance');
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await sleep(2500);
  report.checks.landed = { url: page.url(), title: await page.title().catch(() => '') };

  await page.getByRole('button', { name: /^Thiết lập$/ }).click({ timeout: 15_000 });
  await sleep(800);
  await page.locator('nav button').filter({ hasText: 'Quy định chấm công' }).click({ timeout: 12_000 });
  await sleep(1200);
  await shot(page, '01-rules-shell');

  // Visibility of all expected testids
  const expectedIds = ['device', 'app', 'tablet', 'proxy', 'auto'];
  const testidPresence = {};
  for (const id of expectedIds) {
    const n = await page.getByTestId(`hdsd-att-rules-tab-${id}`).count();
    const label = (await page.getByTestId(`hdsd-att-rules-tab-${id}`).first().innerText().catch(() => '')).trim();
    testidPresence[id] = { count: n, label };
  }
  report.checks.testidPresence = testidPresence;

  // Exact role count for «Máy chấm công»
  const mayChamCong = page.getByRole('button', { name: 'Máy chấm công', exact: true });
  const mayCount = await mayChamCong.count();
  report.checks.mayChamCongExactCount = mayCount;

  // Also count any element with that exact accessible name (buttons)
  const allMayLabels = await page.locator('button').evaluateAll((btns) =>
    btns
      .map((b) => (b.textContent || '').replace(/\s+/g, ' ').trim())
      .filter((t) => t === 'Máy chấm công'),
  );
  report.checks.mayChamCongButtonTextCount = allMayLabels.length;
  report.checks.rulesTabLabels = {};
  for (const id of expectedIds) {
    report.checks.rulesTabLabels[id] = testidPresence[id]?.label ?? null;
  }

  // Click device + app distinctly via testid (no strict collision)
  const deviceClick = await clickTabByTestId(page, 'device');
  const appClick = await clickTabByTestId(page, 'app');

  // Re-check exact count after switching (tabs still mounted)
  const mayCountAfter = await page.getByRole('button', { name: 'Máy chấm công', exact: true }).count();
  report.checks.mayChamCongExactCountAfter = mayCountAfter;

  // Stubs: tablet / proxy / auto → featureInDev
  const tabletClick = await clickTabByTestId(page, 'tablet');
  const proxyClick = await clickTabByTestId(page, 'proxy');
  const autoClick = await clickTabByTestId(page, 'auto');

  // Device should not crash page (app ScanFace residual allowed)
  const deviceOk = deviceClick.clickOk && !deviceClick.strictCollision && deviceClick.count === 1;
  const appNavOk = appClick.clickOk && !appClick.strictCollision && appClick.count === 1;
  if (appClick.scanFace || appClick.newPageErrors.some((e) => /ScanFace/i.test(e))) {
    report.residuals.push({
      id: 'R-MFD-ATT-SCANFACE-UNDEFINED',
      note: 'App tab may still throw ScanFace — out of scope for this work_item (do not FAIL ambiguity)',
      pageErrors: appClick.newPageErrors,
    });
  }

  const stubsHonest =
    tabletClick.featureInDev && proxyClick.featureInDev && autoClick.featureInDev;
  const uniqueDeviceLabel =
    report.checks.rulesTabLabels.device === 'Máy chấm công' &&
    report.checks.rulesTabLabels.app !== 'Máy chấm công' &&
    report.checks.rulesTabLabels.tablet !== 'Máy chấm công' &&
    report.checks.rulesTabLabels.proxy !== 'Máy chấm công' &&
    report.checks.rulesTabLabels.auto !== 'Máy chấm công';

  const onlyOneMay =
    mayCount === 1 && mayCountAfter === 1 && report.checks.mayChamCongButtonTextCount === 1;

  const allTestidsPresent = expectedIds.every((id) => testidPresence[id]?.count === 1);

  report.checks.exit = {
    deviceOk,
    appNavOk,
    onlyOneMay,
    stubsHonest,
    uniqueDeviceLabel,
    allTestidsPresent,
    deviceCrashed: Boolean(deviceClick.newPageErrors.length && !deviceClick.scanFace),
  };

  const pass =
    deviceOk &&
    appNavOk &&
    onlyOneMay &&
    stubsHonest &&
    uniqueDeviceLabel &&
    allTestidsPresent &&
    !report.checks.exit.deviceCrashed;

  report.verdict = pass ? 'PASS' : 'FAIL';
  report.ack_status = pass ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  report.endedAt = ts();
  save();

  await browser.close();
  console.log(JSON.stringify({ verdict: report.verdict, ack_status: report.ack_status, checks: report.checks.exit, residuals: report.residuals }, null, 2));
  process.exit(pass ? 0 : 2);
}

main().catch((e) => {
  report.verdict = 'FAIL';
  report.ack_status = 'FAIL_TO_PM';
  report.fatal = String(e).slice(0, 800);
  report.endedAt = ts();
  save();
  console.error(e);
  process.exit(1);
});
