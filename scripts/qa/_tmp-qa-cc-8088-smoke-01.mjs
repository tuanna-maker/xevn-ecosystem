#!/usr/bin/env node
/**
 * QA-CC-8088-SMOKE-01 — U65 FE-only browser smoke
 * Login ceo@xe.vn → Command Center home → F5
 * FAIL if Vite overlay / CloneCatalogPanel import miss / Uncaught ReferenceError / white crash
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://14.225.217.232:8088';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-qa-cc-8088-smoke-01-runtime.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/qa-cc-8088-smoke-01');
mkdirSync(SCREEN, { recursive: true });

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const FAIL_PATTERNS = [
  /Failed to resolve import/i,
  /CloneCatalogPanel/i,
  /Uncaught ReferenceError/i,
  /Internal server error/i,
  /Failed to fetch dynamically imported module/i,
];

const results = {
  work_item_id: 'QA-CC-8088-SMOKE-01',
  startedAt: new Date().toISOString(),
  u65: 'zero-seed',
  seed: false,
  mutates: 0,
  env: { PORTAL, EMAIL, commit: COMMIT },
  clickPath: [],
  checks: {},
  failReasons: [],
  screenshots: [],
  consoleErrors: [],
  consoleWarnings: [],
  pageErrors: [],
  network: [],
  moduleHits: [],
  overlay: {},
  body: {},
  verdict: null,
  ack_status: null,
  endedAt: null,
};

function save() {
  writeFileSync(OUT_JSON, JSON.stringify(results, null, 2));
}

function click(step, extra = {}) {
  const row = { step, at: new Date().toISOString(), ...extra };
  results.clickPath.push(row);
  console.log(`CLICK  ${row.at}  ${step}`);
  save();
}

function pass(id, detail) {
  results.checks[id] = { pass: true, ...detail };
  save();
}

function fail(id, reason) {
  results.failReasons.push(`${id}: ${reason}`);
  results.checks[id] = { pass: false, reason };
  save();
}

function isInterestingNet(u) {
  return (
    /\/login(?:\?|$)/.test(u) ||
    /\/command-center/.test(u) ||
    /CommandCenterPage/.test(u) ||
    /CloneCatalog(Panel|BundlePanel)/.test(u) ||
    /configSyncClone/.test(u) ||
    /\/auth\/login/.test(u) ||
    /\/src\//.test(u)
  );
}

function textHitsFail(t) {
  return FAIL_PATTERNS.some((re) => re.test(t));
}

async function snapshotUi(page) {
  return page.evaluate(() => {
    const overlay = document.querySelector('vite-error-overlay');
    const root = document.querySelector('#root');
    const errBanner = document.querySelector('[data-testid="portal-login-error"]');
    const bodyText = (document.body?.innerText || '').slice(0, 2500);
    return {
      url: location.href,
      title: document.title,
      overlayPresent: Boolean(overlay),
      overlayText: overlay ? (overlay.shadowRoot?.textContent || overlay.textContent || '').slice(0, 800) : '',
      rootLen: root ? root.innerHTML.length : 0,
      loginForm: Boolean(document.querySelector('[data-testid="portal-login-form"]')),
      loginError: errBanner ? (errBanner.textContent || '').slice(0, 200) : '',
      personaBar: Boolean(document.querySelector('[data-testid="cc-persona-bar"]')),
      clonePanel: Boolean(document.querySelector('[data-testid="clone-catalog-panel"]')),
      bodyHasCloneImport: /Failed to resolve import\s+"\.\/CloneCatalogPanel"/i.test(bodyText),
      bodyHasViteFailed: /Failed to resolve import/i.test(bodyText),
      bodyHasRefErr: /Uncaught ReferenceError/i.test(bodyText),
      bodyPreview: bodyText.slice(0, 600),
    };
  });
}

async function main() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'vi-VN',
    ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();

  page.on('pageerror', (e) => {
    const msg = String(e?.message || e).slice(0, 400);
    results.pageErrors.push(msg);
    save();
  });
  page.on('console', (msg) => {
    const t = msg.text().slice(0, 400);
    if (msg.type() === 'error') results.consoleErrors.push(t);
    if (msg.type() === 'warning' && textHitsFail(t)) results.consoleWarnings.push(t);
  });
  page.on('response', (res) => {
    const u = res.url();
    const method = res.request().method();
    if (method === 'OPTIONS') return;
    const hit =
      /CommandCenterPage|CloneCatalog(Panel|BundlePanel)|configSyncClone/.test(u) ||
      (method === 'POST' && /\/auth\/login/.test(u)) ||
      (res.request().resourceType() === 'document' && /8088/.test(u));
    if (!isInterestingNet(u) && !hit) return;
    const entry = {
      method,
      status: res.status(),
      type: res.request().resourceType(),
      url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 240),
      at: new Date().toISOString(),
    };
    results.network.push(entry);
    if (/CommandCenterPage|CloneCatalog(Panel|BundlePanel)/.test(u)) {
      results.moduleHits.push(entry);
    }
  });

  try {
    click('open_login', { url: `${PORTAL}/login` });
    await page.goto(`${PORTAL}/login`, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.goto(`${PORTAL}/login`, { waitUntil: 'networkidle', timeout: 60000 });
    await sleep(500);

    const loginUi = await snapshotUi(page);
    results.body.login = loginUi;
    await page.screenshot({ path: join(SCREEN, '01-login.png'), fullPage: false });
    results.screenshots.push('01-login.png');

    if (!loginUi.loginForm) {
      fail('AC1_fe_login', `login form missing url=${loginUi.url} rootLen=${loginUi.rootLen}`);
    } else {
      pass('AC1_login_form', { url: loginUi.url, overlay: loginUi.overlayPresent });
    }

    click('type_email', { persona: EMAIL });
    await page.locator('[data-testid="portal-login-email"]').fill(EMAIL);
    click('type_password');
    await page.locator('[data-testid="portal-login-password"]').fill(PASSWORD);

    const loginWait = page.waitForResponse(
      (r) => r.url().includes('/auth/login') && r.request().method() === 'POST',
      { timeout: 25000 },
    );
    click('click_submit', { testid: 'portal-login-submit' });
    await page.locator('[data-testid="portal-login-submit"]').click();
    let loginStatus = null;
    try {
      const loginRes = await loginWait;
      loginStatus = loginRes.status();
    } catch (e) {
      fail('AC1_login_network', String(e?.message || e).slice(0, 200));
    }

    await page.waitForURL((u) => !u.pathname.endsWith('/login'), { timeout: 25000 }).catch(() => null);
    await sleep(1200);

    const afterLogin = page.url();
    if (loginStatus >= 200 && loginStatus < 300 && !afterLogin.includes('/login')) {
      pass('AC1_fe_login', { loginStatus, afterUrl: afterLogin });
    } else {
      const err = await page.locator('[data-testid="portal-login-error"]').innerText().catch(() => '');
      fail('AC1_fe_login', `status=${loginStatus} url=${afterLogin} err=${err.slice(0, 160)}`);
    }

    click('open_command_center', { url: `${PORTAL}/command-center` });
    await page.goto(`${PORTAL}/command-center`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForLoadState('networkidle', { timeout: 45000 }).catch(() => null);
    await sleep(2500);

    const cc = await snapshotUi(page);
    results.body.ccLoad = cc;
    await page.screenshot({ path: join(SCREEN, '02-command-center.png'), fullPage: false });
    results.screenshots.push('02-command-center.png');

    const overlayFail =
      cc.overlayPresent ||
      cc.bodyHasCloneImport ||
      cc.bodyHasViteFailed ||
      /Failed to resolve import/.test(cc.overlayText);
    const refFail =
      cc.bodyHasRefErr ||
      results.pageErrors.some((e) => /ReferenceError/i.test(e)) ||
      results.consoleErrors.some((e) => /Uncaught ReferenceError/i.test(e));
    const cloneImportFail =
      results.pageErrors.some((e) => /CloneCatalogPanel/i.test(e)) ||
      results.consoleErrors.some((e) => /Failed to resolve import.*CloneCatalogPanel/i.test(e)) ||
      results.moduleHits.some((m) => /CloneCatalogPanel/.test(m.url) && m.status >= 500) ||
      results.moduleHits.some((m) => /CommandCenterPage/.test(m.url) && m.status >= 500);

    if (overlayFail || cloneImportFail) {
      fail(
        'AC2_no_vite_overlay',
        `overlay=${cc.overlayPresent} cloneImport=${cc.bodyHasCloneImport} moduleHits=${JSON.stringify(results.moduleHits.slice(0, 8))}`,
      );
    } else {
      pass('AC2_no_vite_overlay', {
        overlayPresent: false,
        cloneImportText: false,
        moduleHits: results.moduleHits,
      });
    }

    if (refFail) {
      fail('AC2_no_reference_error', results.pageErrors.concat(results.consoleErrors).filter((e) => /ReferenceError/i.test(e)).slice(0, 3).join(' | '));
    } else {
      pass('AC2_no_reference_error', { pageErrors: results.pageErrors.length });
    }

    const usable =
      !cc.loginForm &&
      cc.rootLen > 200 &&
      !overlayFail &&
      (cc.personaBar || /Trung tâm|Command Center|Việc cần xử lý|Chỉ số KPI|Tập đoàn/i.test(cc.bodyPreview));
    if (usable) {
      pass('AC3_page_usable', {
        url: cc.url,
        rootLen: cc.rootLen,
        personaBar: cc.personaBar,
        emptyOk: true,
      });
    } else {
      fail(
        'AC3_page_usable',
        `url=${cc.url} rootLen=${cc.rootLen} personaBar=${cc.personaBar} loginForm=${cc.loginForm} preview=${cc.bodyPreview.slice(0, 180)}`,
      );
    }

    const doc200 = results.network.some(
      (n) => n.type === 'document' && n.status === 200 && /command-center/.test(n.url),
    );
    const pageMod = results.moduleHits.find((m) => /CommandCenterPage/.test(m.url));
    const cloneMod = results.moduleHits.find((m) => /CloneCatalogPanel\.tsx/.test(m.url));
    if ((doc200 || cc.url.includes('/command-center')) && (!pageMod || pageMod.status === 200) && (!cloneMod || cloneMod.status === 200)) {
      pass('AC5_network_200', {
        document200: doc200,
        commandCenterPage: pageMod || null,
        cloneCatalogPanel: cloneMod || null,
      });
    } else {
      fail(
        'AC5_network_200',
        `doc200=${doc200} pageMod=${JSON.stringify(pageMod)} cloneMod=${JSON.stringify(cloneMod)}`,
      );
    }

    click('f5_reload', { url: page.url() });
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForLoadState('networkidle', { timeout: 45000 }).catch(() => null);
    await sleep(2500);

    const f5 = await snapshotUi(page);
    results.body.f5 = f5;
    await page.screenshot({ path: join(SCREEN, '03-f5.png'), fullPage: false });
    results.screenshots.push('03-f5.png');

    const f5Overlay =
      f5.overlayPresent ||
      f5.bodyHasCloneImport ||
      f5.bodyHasViteFailed ||
      results.moduleHits.some((m) => m.status >= 500);
    const f5Usable =
      !f5.loginForm &&
      f5.url.includes('/command-center') &&
      f5.rootLen > 200 &&
      !f5Overlay &&
      (f5.personaBar || /Trung tâm|Command Center|Việc cần xử lý|Chỉ số KPI|Tập đoàn/i.test(f5.bodyPreview));

    if (f5Usable) {
      pass('AC4_f5_command_center', { url: f5.url, rootLen: f5.rootLen, personaBar: f5.personaBar });
    } else {
      fail(
        'AC4_f5_command_center',
        `url=${f5.url} overlay=${f5.overlayPresent} rootLen=${f5.rootLen} loginForm=${f5.loginForm} preview=${f5.bodyPreview.slice(0, 180)}`,
      );
    }

    results.overlay = { load: cc, f5 };
  } catch (e) {
    fail('harness', String(e?.message || e).slice(0, 400));
  } finally {
    await browser.close().catch(() => null);
  }

  const allPass = results.failReasons.length === 0 && Object.values(results.checks).every((c) => c.pass !== false);
  results.verdict = allPass ? 'PASS' : 'FAIL';
  results.ack_status = allPass ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  results.endedAt = new Date().toISOString();
  save();
  console.log(
    JSON.stringify(
      {
        verdict: results.verdict,
        ack_status: results.ack_status,
        failReasons: results.failReasons,
        checks: results.checks,
        clickPath: results.clickPath.map((c) => c.step),
        moduleHits: results.moduleHits,
        pageErrors: results.pageErrors,
        consoleErrors: results.consoleErrors.slice(0, 12),
      },
      null,
      2,
    ),
  );
  process.exit(allPass ? 0 : 2);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
