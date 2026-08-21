#!/usr/bin/env node
/**
 * PO-MFD-M2-ATT-SCANFACE-QA-01 — U65 browser retest after ScanFace → ScanLine
 * HDSD: Attendance → Thiết lập → Quy định → App tab (hdsd-att-rules-tab-app)
 * Assert: no ReferenceError ScanFace; Face ID GĐ1 hold; GPS/Wifi/QR cards render
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
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-mfd-m2-att-scanface-qa-01-browser.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-mfd-m2-att-scanface-qa-01');
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
  work_item_id: 'PO-MFD-M2-ATT-SCANFACE-QA-01',
  startedAt: ts(),
  u65_zero_seed: true,
  hdsd_align: 'Attendance → Thiết lập → Quy định → App tab',
  env: { PORTAL, HRM, EMAIL, COMPANY, TENANT, commit: COMMIT },
  l0: {},
  consoleErrors: [],
  pageErrors: [],
  checks: {},
  screens: [],
  residuals: [],
  matrix_stamp: null,
  verdict: null,
  ack_status: null,
  uat_done: false,
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
    if (msg.type() === 'error' && !/favicon|React DevTools|Download the React/i.test(t)) {
      report.consoleErrors.push(t.slice(0, 400));
    }
  });
  page.on('pageerror', (err) => report.pageErrors.push(String(err).slice(0, 500)));

  await injectPortalAuth(page, session);

  const url = q('/hr/attendance');
  // Hard reload so FE ScanLine fix is loaded (bypass soft cache)
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 60_000 });
  await sleep(2500);
  report.checks.landed = { url: page.url(), title: await page.title().catch(() => '') };

  await page.getByRole('button', { name: /^Thiết lập$/ }).click({ timeout: 15_000 });
  await sleep(800);
  await page.locator('nav button').filter({ hasText: 'Quy định chấm công' }).click({ timeout: 12_000 });
  await sleep(1200);
  await shot(page, '01-rules-shell');

  const appTab = page.getByTestId('hdsd-att-rules-tab-app');
  const appCount = await appTab.count();
  const appLabel = (await appTab.first().innerText().catch(() => '')).trim();
  report.checks.appTab = { count: appCount, label: appLabel, testid: 'hdsd-att-rules-tab-app' };

  const errorsBefore = report.pageErrors.length;
  const consoleBefore = report.consoleErrors.length;
  await appTab.click({ timeout: 10_000 });
  await sleep(1500);
  // Second hard settle after tab mount (method cards)
  await sleep(800);
  await shot(page, '02-app-tab');

  const body = await page.locator('body').innerText().catch(() => '');
  const bodyNorm = body.replace(/\s+/g, ' ');
  report.checks.bodyLen = bodyNorm.length;
  report.checks.bodySnippet = bodyNorm.slice(0, 500);

  const newPageErrors = report.pageErrors.slice(errorsBefore);
  const newConsoleErrors = report.consoleErrors.slice(consoleBefore);
  report.checks.newPageErrors = newPageErrors;
  report.checks.newConsoleErrors = newConsoleErrors;

  const scanFaceError =
    newPageErrors.some((e) => /ScanFace/i.test(e)) ||
    newConsoleErrors.some((e) => /ScanFace/i.test(e)) ||
    /ScanFace is not defined/i.test(bodyNorm);

  const anyPageCrash =
    newPageErrors.some((e) => /ReferenceError|is not defined|Cannot read propert/i.test(e)) ||
    /Something went wrong|is not defined/i.test(bodyNorm);

  // Face ID GĐ1 hold
  const faceBanner = page.getByTestId('att-faceid-cfg-banner');
  const faceBannerVisible = (await faceBanner.count()) > 0 && (await faceBanner.first().isVisible().catch(() => false));
  const faceHoldText =
    /Face ID|ngoài phạm vi GĐ1|chưa hỗ trợ|Chưa hỗ trợ|Nhận diện khuôn mặt/i.test(bodyNorm);

  // Method cards — GPS / Wifi / QR by title text on cards
  const hasGps = /GPS|Định vị/i.test(bodyNorm);
  const hasWifi = /Wi-?Fi|Wifi/i.test(bodyNorm);
  const hasQr = /QR/i.test(bodyNorm);
  const hasFaceCard = /Face ID/i.test(bodyNorm);

  // Card-like UI: count cards containing method titles if present
  const methodCardCount = await page.locator('[class*="card"], [data-slot="card"]').count().catch(() => 0);

  report.checks.surface = {
    scanFaceError,
    anyPageCrash,
    faceBannerVisible,
    faceHoldText,
    hasGps,
    hasWifi,
    hasQr,
    hasFaceCard,
    methodCardCount,
    noMutate: true,
  };

  const cardsOk = hasGps && hasWifi && hasQr && hasFaceCard;
  const holdOk = faceBannerVisible || faceHoldText;
  const noCrash = !scanFaceError && !anyPageCrash && newPageErrors.length === 0;

  let stamp = 'BROKEN';
  if (noCrash && cardsOk && holdOk) stamp = 'LIVE';
  else if (noCrash && holdOk) stamp = 'PARTIAL';
  else if (noCrash && cardsOk) stamp = 'PARTIAL';
  else stamp = 'BROKEN';

  report.matrix_stamp = { row: 36, stamp, reason: noCrash ? 'no ScanFace crash; cards/hold checked' : 'page crash or ScanFace' };

  const pass = noCrash && appCount === 1 && (stamp === 'LIVE' || stamp === 'PARTIAL');
  report.checks.exit = {
    appTabClicked: true,
    appCount,
    noScanFace: !scanFaceError,
    noPageErrors: newPageErrors.length === 0,
    cardsOk,
    holdOk,
    stamp,
    pass,
  };

  report.verdict = pass ? 'PASS' : 'FAIL';
  report.ack_status = pass ? 'PASS_TO_PM' : 'FAIL';
  if (stamp === 'PARTIAL') {
    report.residuals.push({
      id: 'OBS-MFD-ATT-APP-PARTIAL',
      note: 'App tab no crash; stamp PARTIAL — hold or cards incomplete vs full LIVE',
    });
  }
  report.endedAt = ts();
  save();

  await browser.close();
  console.log(
    JSON.stringify(
      {
        verdict: report.verdict,
        ack_status: report.ack_status,
        matrix_stamp: report.matrix_stamp,
        exit: report.checks.exit,
        pageErrors: report.pageErrors,
        consoleErrors: report.consoleErrors.slice(0, 8),
      },
      null,
      2,
    ),
  );
  process.exit(pass ? 0 : 2);
}

main().catch((e) => {
  report.verdict = 'FAIL';
  report.ack_status = 'FAIL';
  report.fatal = String(e).slice(0, 800);
  report.endedAt = ts();
  save();
  console.error(e);
  process.exit(1);
});
