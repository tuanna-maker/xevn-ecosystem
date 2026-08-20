#!/usr/bin/env node
/**
 * PO-MFD-M2-ATT-SETTINGS-CATALOG-500-01-QA — U65 browser confirm after BE harden
 * Path: ceo@ → /hr/attendance → Thiết lập → Quy định chấm công → Tùy chỉnh
 * Assert: GET /api/hrm/settings-catalogs → 200 (HRM-SET-200); no Sync ERROR / 500
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
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
  'docs/qa/evidence/_tmp-po-mfd-m2-att-settings-catalog-500-01-qa-browser.json',
);
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-mfd-m2-att-settings-catalog-500-01-qa');
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
  work_item_id: 'PO-MFD-M2-ATT-SETTINGS-CATALOG-500-01-QA',
  startedAt: ts(),
  u65_zero_seed: true,
  hdsd_align: 'Chấm công → Thiết lập → Quy định chấm công → Tùy chỉnh bảng công',
  env: { PORTAL, HRM, EMAIL, COMPANY, TENANT, commit: COMMIT },
  l0: {},
  settingsCatalogGets: [],
  networkBad: [],
  consoleErrors: [],
  pageErrors: [],
  steps: {},
  bodyTextSample: '',
  syncErrorBanner: false,
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

async function main() {
  const l0Hrm = await fetch(`${HRM}/api/hrm/`).then((r) => r.status).catch(() => 0);
  const l0Portal = await fetch(PORTAL).then((r) => r.status).catch(() => 0);
  report.l0 = { hrm_api: l0Hrm, portal: l0Portal };
  if (l0Hrm !== 200) throw new Error(`L0 FAIL hrm-api ${l0Hrm}`);

  const session = await loginApi();
  report.steps.login = { http: session.http, persona: EMAIL, companyId: COMPANY };

  // Direct API confirm (supporting — browser is primary U65)
  const direct = await fetch(`${HRM}/api/hrm/settings-catalogs`, {
    headers: {
      authorization: `Bearer ${session.token}`,
      'x-tenant-id': TENANT,
      'x-company-id': COMPANY,
    },
  });
  const directBody = await direct.json().catch(() => ({}));
  report.steps.directApi = {
    status: direct.status,
    code: directBody?.code ?? directBody?.meta?.code ?? null,
    keysSample: Array.isArray(directBody?.data)
      ? directBody.data.slice(0, 3).map((r) => r?.catalog_key ?? r?.key)
      : typeof directBody?.data,
  };
  save();

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
  page.on('response', async (res) => {
    const u = res.url();
    const method = res.request().method();
    if (method === 'GET' && /\/api\/hrm\/settings-catalogs(?:\?|$)/.test(u)) {
      let code = null;
      try {
        const j = await res.json();
        code = j?.code ?? j?.meta?.code ?? null;
      } catch {
        /* body already consumed elsewhere — status still recorded */
      }
      report.settingsCatalogGets.push({
        at: ts(),
        status: res.status(),
        code,
        path: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 220),
      });
    }
    if (/\/api\/hrm\//.test(u) && res.status() >= 500) {
      report.networkBad.push({
        status: res.status(),
        method,
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 240),
      });
    }
  });

  await injectPortalAuth(page, session);
  const url = q('/hr/attendance');
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45_000 });
  await sleep(2000);
  report.steps.attendanceLoad = {
    url,
    hasAttendance: /Chấm công|Thiết lập/i.test(await page.locator('body').innerText().catch(() => '')),
  };

  // Clear prior catalog captures from shell load noise after navigations — keep all for evidence
  await page.getByRole('button', { name: /^Thiết lập$/ }).click({ timeout: 15_000 });
  await sleep(600);
  await page.locator('nav button').filter({ hasText: 'Quy định chấm công' }).click({ timeout: 12_000 });
  await sleep(800);
  report.steps.openRules = { ok: true };

  // Prefer testid (stable); fallback label
  const customizeTab = page.locator('[data-testid="hdsd-att-rules-tab-customize"]');
  if (await customizeTab.count()) {
    await customizeTab.click({ timeout: 10_000 });
  } else {
    await page.getByRole('button', { name: /Tùy chỉnh bảng công|Tùy chỉnh/i }).first().click({
      timeout: 10_000,
    });
  }
  await sleep(2500);

  const body = await page.locator('body').innerText().catch(() => '');
  report.bodyTextSample = body.slice(0, 800);
  report.syncErrorBanner =
    /HRM API Sync ERROR|Sync ERROR|settings-catalogs.*500|HRM-SYS-001/i.test(body);
  report.steps.customizeTab = {
    visibleCustomize: /Tùy chỉnh|customize/i.test(body),
    syncErrorBanner: report.syncErrorBanner,
  };
  await page.screenshot({ path: join(SCREEN, 'tuy-chinh.png'), fullPage: false }).catch(() => {});

  const catalogOk = report.settingsCatalogGets.some(
    (g) => g.status === 200 && (!g.code || /HRM-SET-200|SET-200/i.test(String(g.code))),
  );
  const catalogAny200 = report.settingsCatalogGets.some((g) => g.status === 200);
  const no500 = !report.networkBad.some((n) => /settings-catalogs/.test(n.url));
  const noSys500 = report.networkBad.length === 0;

  report.steps.assert = {
    settingsCatalogGets: report.settingsCatalogGets.length,
    catalogOk,
    catalogAny200,
    no500OnCatalog: no500,
    networkBadCount: report.networkBad.length,
    syncErrorBanner: report.syncErrorBanner,
    directApi200: report.steps.directApi?.status === 200,
  };

  const pass =
    (catalogAny200 || report.steps.directApi?.status === 200) &&
    no500 &&
    !report.syncErrorBanner &&
    (catalogOk || catalogAny200 || report.steps.directApi?.status === 200);

  // Strict browser path: require at least one browser GET 200 for settings-catalogs
  const browserPass =
    report.settingsCatalogGets.some((g) => g.status === 200) &&
    no500 &&
    !report.syncErrorBanner;

  report.verdict = browserPass ? 'PASS' : 'FAIL';
  report.ack_status = browserPass ? 'PASS_TO_PM' : 'FAIL';
  report.runtime_stamp_hint = browserPass ? 'LIVE' : 'BROKEN';
  report.endedAt = ts();
  save();
  await browser.close();
  console.log(JSON.stringify({ verdict: report.verdict, gets: report.settingsCatalogGets, bad: report.networkBad }, null, 2));
  console.log('Wrote', OUT_JSON);
  if (!browserPass) process.exit(2);
}

main().catch((e) => {
  console.error(e);
  report.endedAt = ts();
  report.fatal = String(e).slice(0, 500);
  report.verdict = 'FAIL';
  report.ack_status = 'FAIL';
  save();
  process.exit(1);
});
