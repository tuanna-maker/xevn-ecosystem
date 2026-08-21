/**
 * BUILD-GAP-MD-PANEL-01-QA — UF-HRM-10 master-data tab (U65 · U76)
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
const WORK_ITEM = 'BUILD-GAP-MD-PANEL-01-QA';
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-build-gap-md-panel-01-qa-runtime.json');
const SCREEN_DIR = resolve(ROOT, 'docs/qa/evidence/screens/build-gap-md-panel-01-qa');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

const results = {
  work_item_id: WORK_ITEM,
  uf_id: 'UF-HRM-10',
  spec_ref: 'HRM-SETTINGS SCR-TAB-MASTER',
  u65: 'zero-seed',
  startedAt: ts(),
  env: { PORTAL, EMAIL, companyId: 'main' },
  clicks: [],
  network: [],
  consoleErrors: [],
  pageErrors: [],
  viteOverlay: false,
  screens: [],
  ac: {},
  ack_status: 'PENDING',
};

function save() {
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(results, null, 2));
}

function click(action, detail = {}) {
  results.clicks.push({ at: ts(), action, ...detail });
  save();
}

async function shot(page, name) {
  mkdirSync(SCREEN_DIR, { recursive: true });
  const path = join(SCREEN_DIR, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  results.screens.push({ name, path: path.replace(/\\/g, '/') });
  return path;
}

function track(page) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      results.consoleErrors.push(String(msg.text()).slice(0, 320));
    }
  });
  page.on('pageerror', (err) => results.pageErrors.push(String(err).slice(0, 320)));
  page.on('response', async (res) => {
    try {
      const u = res.url();
      if (!/\/api\/hrm\/settings-catalogs/.test(u)) return;
      const method = res.request().method();
      if (method === 'OPTIONS') return;
      results.network.push({
        at: ts(),
        method,
        status: res.status(),
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 400),
      });
      save();
    } catch {
      /* */
    }
  });
}

async function loginApi() {
  const r = await fetch(`${PORTAL}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const j = await r.json();
  const data = j?.data ?? j;
  const token = data?.accessToken;
  if (!token) throw new Error(`login failed HTTP ${r.status}`);
  const u = data?.user ?? {};
  return {
    token,
    expiresAt: Date.now() + 8 * 3600_000,
    user: {
      userId: u.userId || u.id || u.email || EMAIL,
      email: u.email || EMAIL,
      displayName: u.displayName || u.fullName || u.name || 'CEO Tập đoàn',
      roles: u.roles || ['group_ceo'],
    },
    raw: data,
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
      store.setItem('xevn.portal.companyId', 'main');
      store.setItem('hrm_portal_mode', '1');
      store.setItem('hrm_current_company_id', 'main');
      store.setItem('hrm_current_tenant_id', 'xevn');
      if (s.raw?.refreshToken) store.setItem('xevn.portal.refreshToken', s.raw.refreshToken);
      if (s.raw?.defaultMembershipId) {
        store.setItem('xevn.portal.membershipId', s.raw.defaultMembershipId);
      }
    }
  }, session);
  await page.goto(PORTAL, { waitUntil: 'domcontentloaded', timeout: 60000 });
}

function q(path) {
  const u = new URL(path, PORTAL);
  u.searchParams.set('portal', '1');
  u.searchParams.set('tenantId', 'xevn');
  u.searchParams.set('companyId', 'main');
  return u.toString();
}

async function main() {
  const session = await loginApi();
  click('login-api', { email: EMAIL, ok: true });

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  const page = await browser.newContext({ viewport: { width: 1440, height: 900 } }).then((c) => c.newPage());
  track(page);
  await injectPortalAuth(page, session);

  const settingsUrl = q('/hr/settings');
  await page.goto(settingsUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(3500);
  click('goto-settings', { url: page.url() });
  await shot(page, '01-settings-shell');

  const viteText = await page.evaluate(() => {
    const el = document.querySelector('vite-error-overlay');
    return el ? el.textContent?.slice(0, 500) : '';
  });
  results.viteOverlay = !!viteText || /Failed to resolve import|Internal server error/i.test(await page.content());
  if (results.viteOverlay) {
    results.ac.vite = { verdict: 'FAIL', snippet: viteText.slice(0, 200) };
  }

  const tab = page.locator('[role="tab"]').filter({ hasText: /Danh mục nghiệp vụ/i });
  const tabCount = await tab.count();
  if (tabCount === 0) {
    await page.locator('button, [role="tab"]').filter({ hasText: /Danh mục nghiệp vụ/i }).first().click({ timeout: 8000 }).catch(() => {});
  } else {
    await tab.first().click({ timeout: 8000 });
  }
  click('tab-master-data', { selector: 'Danh mục nghiệp vụ' });
  await sleep(4000);
  await shot(page, '02-master-data-tab');

  const body = await page.evaluate(() => document.body?.innerText?.slice(0, 8000) || '');
  const html = await page.content();

  const hasMdPanel =
    /#md-code-|md-code-/.test(html) ||
    html.includes('MasterDataSettingsPanel') ||
    /Chức danh|Phòng ban|Loại nghỉ|Loại quyết định|insurers|kpiLibrary/i.test(body);
  const hasBucketTabs = await page.locator('[role="tablist"] [role="tab"]').count();
  const hasEmptyCta = /Thêm|Thêm mới|Tạo mới|Chưa có|empty|Đồng bộ/i.test(body);
  const hasViteAfterTab =
    /Failed to resolve import.*MasterDataSettingsPanel|Internal server error/i.test(html);

  const catalogGets = results.network.filter((n) => n.method === 'GET');
  const catalog5xx = results.network.filter((n) => n.status >= 500);
  const storm5xx = catalog5xx.length >= 3;

  results.ac.panel_mount = {
    hasMdPanel,
    hasBucketTabs,
    hasEmptyCta,
    hasViteAfterTab,
    bodySnippet: body.slice(0, 600),
  };
  results.ac.settings_catalogs_network = {
    total: results.network.length,
    gets: catalogGets.length,
    status5xx: catalog5xx.map((n) => n.status),
    storm5xx,
  };

  const pass =
    !results.viteOverlay &&
    !hasViteAfterTab &&
    (hasMdPanel || hasEmptyCta) &&
    !storm5xx &&
    catalog5xx.length === 0;

  results.ack_status = pass ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  results.finishedAt = ts();
  save();
  await browser.close();
  console.log(JSON.stringify({ ack_status: results.ack_status, ac: results.ac }, null, 2));
  process.exit(pass ? 0 : 2);
}

main().catch((e) => {
  results.runError = String(e);
  results.ack_status = 'FAIL_TO_PM';
  save();
  console.error(e);
  process.exit(2);
});
