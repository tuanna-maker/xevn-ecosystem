/**
 * BUILD-GAP-PERF-FORM-SCHEMA-01-QA — Performance route + MD panel spot (U65)
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-build-gap-perf-form-schema-01-browser.json');
const SCREEN_DIR = resolve(ROOT, 'docs/qa/evidence/screens/build-gap-perf-form-schema-01-20260803');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

const q = (path) => {
  const u = new URL(path, PORTAL);
  u.searchParams.set('portal', '1');
  u.searchParams.set('tenantId', 'xevn');
  u.searchParams.set('companyId', 'main');
  return u.toString();
};

const results = {
  work_item_id: 'BUILD-GAP-PERF-FORM-SCHEMA-01-QA',
  startedAt: ts(),
  env: { PORTAL, EMAIL, u65: 'zero-seed', companyId: 'main' },
  viteProbes: {},
  steps: {},
  consoleErrors: [],
  pageErrors: [],
  network: [],
  screens: [],
  seed_used: false,
  verdict: null,
};

function save() {
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(results, null, 2));
}

async function loginApi() {
  const r = await fetch(`${PORTAL}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const j = await r.json().catch(() => ({}));
  const data = j?.data ?? j;
  const token = data?.accessToken ?? data?.access_token ?? j?.accessToken;
  if (!token) throw new Error(`login failed HTTP ${r.status}`);
  const u = data?.user ?? {};
  return {
    token,
    expiresAt: Date.now() + 8 * 3600_000,
    email: EMAIL,
    user: {
      userId: u.userId || u.id || u.email || EMAIL,
      email: u.email || EMAIL,
      displayName: u.displayName || u.fullName || u.name || EMAIL,
      roles: u.roles || ['group_ceo'],
    },
    raw: data,
    companyId: 'main',
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
      if (s.raw?.refreshToken) store.setItem('xevn.portal.refreshToken', s.raw.refreshToken);
    }
  }, session);
}

function track(page) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') results.consoleErrors.push(String(msg.text()).slice(0, 320));
  });
  page.on('pageerror', (err) => results.pageErrors.push(String(err).slice(0, 320)));
  page.on('response', (res) => {
    const u = res.url();
    if (/performanceFormSchema|Failed to resolve import/.test(u)) {
      results.network.push({ status: res.status(), url: u.slice(0, 400), at: ts() });
    }
    if (/\/api\/hrm\/(performance|eval)/.test(u) && res.request().method() === 'GET') {
      results.network.push({
        method: 'GET',
        status: res.status(),
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 320),
        at: ts(),
      });
    }
  });
}

async function viteProbe() {
  for (const [key, path] of [
    ['performanceFormSchema', '/hr/src/lib/performanceFormSchema.ts'],
    ['PerformancePage', '/hr/src/pages/Performance.tsx'],
  ]) {
    try {
      const r = await fetch(`${PORTAL}${path}`, { signal: AbortSignal.timeout(15000) });
      results.viteProbes[key] = r.status;
    } catch (e) {
      results.viteProbes[key] = String(e).slice(0, 120);
    }
  }
  save();
}

async function main() {
  await viteProbe();
  const session = await loginApi();
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
  });
  const page = await browser.newPage();
  track(page);
  await injectPortalAuth(page, session);

  const perfUrl = q('/hr/performance');
  await page.goto(perfUrl, { waitUntil: 'networkidle', timeout: 90000 });
  await sleep(1500);

  const overlay = page.locator('vite-error-overlay');
  const hasOverlay = await overlay.count().then((c) => c > 0).catch(() => false);
  const perfE3 = await page.getByTestId('performance-page-e3').isVisible().catch(() => false);
  const cyclesEmpty = await page.getByTestId('perf-cycles-empty').isVisible().catch(() => false);
  const evalsEmpty = await page.getByTestId('perf-evals-empty').isVisible().catch(() => false);
  const cycleRow = await page.getByTestId('perf-cycle-row').count().catch(() => 0);
  const bodyText = await page.locator('body').innerText().catch(() => '');
  const importFail =
    /Failed to resolve import.*performanceFormSchema/i.test(bodyText) ||
    results.consoleErrors.some((e) => /performanceFormSchema|Failed to resolve import/i.test(e));

  mkdirSync(SCREEN_DIR, { recursive: true });
  await page.screenshot({ path: join(SCREEN_DIR, 'performance-load.png') }).catch(() => {});

  results.steps.performance_load = {
    url: page.url(),
    viteOverlay: hasOverlay,
    performancePageE3: perfE3,
    cyclesEmpty,
    evalsEmpty,
    cycleRowCount: cycleRow,
    importFail,
    pass:
      !hasOverlay &&
      !importFail &&
      perfE3 &&
      (cyclesEmpty || evalsEmpty || cycleRow > 0),
  };

  await page.reload({ waitUntil: 'networkidle', timeout: 90000 });
  await sleep(1200);
  const perfE3F5 = await page.getByTestId('performance-page-e3').isVisible().catch(() => false);
  results.steps.performance_f5 = { performancePageE3: perfE3F5, pass: perfE3F5 && !hasOverlay };

  const settingsUrl = q('/hr/settings');
  await page.goto(settingsUrl, { waitUntil: 'networkidle', timeout: 90000 });
  await sleep(800);
  await page.getByRole('tab', { name: /Danh mục nghiệp vụ/i }).click({ timeout: 8000 }).catch(async () => {
    await page.locator('text=Danh mục').first().click({ timeout: 5000 }).catch(() => {});
  });
  await sleep(1000);
  const mdPanel = await page.getByTestId('md-settings-panel').isVisible().catch(() => false);
  const mdTabs = await page.getByTestId('md-bucket-tabs').isVisible().catch(() => false);
  await page.screenshot({ path: join(SCREEN_DIR, 'settings-md-tab.png') }).catch(() => {});
  results.steps.settings_md_spot = { mdPanel, mdTabs, pass: mdPanel || mdTabs };

  const badConsole = results.consoleErrors.filter(
    (e) =>
      !/favicon|404.*\.png|ResizeObserver|devtools/i.test(e) &&
      (/500|Failed to resolve|performanceFormSchema|vite/i.test(e) || e.includes('HRM API')),
  );

  results.verdict =
    results.steps.performance_load.pass &&
    results.steps.performance_f5.pass &&
    results.steps.settings_md_spot.pass &&
    results.viteProbes.performanceFormSchema === 200 &&
    results.viteProbes.PerformancePage === 200 &&
    badConsole.length === 0 &&
    results.pageErrors.length === 0
      ? 'PASS_TO_PM'
      : 'FAIL';

  results.finishedAt = ts();
  save();
  await browser.close();
  console.log(JSON.stringify({ verdict: results.verdict, steps: results.steps, viteProbes: results.viteProbes }, null, 2));
  process.exit(results.verdict === 'PASS_TO_PM' ? 0 : 1);
}

main().catch((e) => {
  results.error = String(e);
  results.verdict = 'FAIL';
  save();
  console.error(e);
  process.exit(1);
});
