/**
 * QA-XBOS-DASHBOARD-FE-01 — Retest D-XBOS-DASHBOARD-FE-01 toolbar (TC-016/019)
 * Persona: ceo@xe.vn · portal :5173 · U65 zero-seed
 */
import puppeteer from 'puppeteer';
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

const ORG_REGEX = /bộ lọc|tìm|export|xuất/i;
const CUST_REGEX = /thêm|tạo|tìm/i;

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_DIR = resolve(ROOT, 'docs/qa/evidence');
const RUNTIME = resolve(OUT_DIR, '_tmp-qa-xbos-dashboard-fe-01-runtime.json');
const SCREEN_DIR = resolve(OUT_DIR, 'screens/xbos-dashboard-fe-01-20260801');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const results = {
  work_item_id: 'QA-XBOS-DASHBOARD-FE-01',
  program: 'P-HDSD-ECOSYSTEM-03 · sweep',
  startedAt: new Date().toISOString(),
  env: { PORTAL, EMAIL, u65: 'zero-seed' },
  l0: {},
  tc: [],
  clicks: [],
  network: [],
  consoleErrors: [],
  postMutations: [],
  screens: [],
};

function save() {
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(RUNTIME, JSON.stringify(results, null, 2));
}

function recordTc(id, verdict, detail, extra = {}) {
  const row = { id, verdict, detail, at: new Date().toISOString(), ...extra };
  results.tc.push(row);
  console.log(`${verdict === '🟢' ? 'PASS' : verdict === '🟡' ? 'BLOCK' : 'FAIL'}  ${id}  ${detail.slice(0, 160)}`);
  save();
  return row;
}

async function shot(page, name) {
  mkdirSync(SCREEN_DIR, { recursive: true });
  const path = join(SCREEN_DIR, `${name}.png`);
  await page.screenshot({ path, fullPage: false });
  results.screens.push(path.replace(/\\/g, '/'));
}

function trackNetwork(page) {
  page.on('response', (res) => {
    try {
      const u = res.url();
      const method = res.request().method();
      if (method === 'OPTIONS') return;
      if (!/\/api\/(hrm|xbos)\//.test(u) && !/\/api\/xbos\//.test(u)) return;
      results.network.push({
        method,
        status: res.status(),
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 240),
        at: new Date().toISOString(),
      });
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
        results.postMutations.push({ method, status: res.status(), url: u.replace(/^https?:\/\/[^/]+/, '') });
      }
    } catch {
      /* */
    }
  });
  page.on('pageerror', (e) => {
    const t = String(e).slice(0, 240);
    if (!/favicon|ResizeObserver/i.test(t)) results.consoleErrors.push(t);
  });
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const t = msg.text();
      if (!/favicon|404.*\.map|ResizeObserver|devtools/i.test(t)) {
        results.consoleErrors.push(t.slice(0, 240));
      }
    }
  });
}

function lastNet(pred) {
  for (let i = results.network.length - 1; i >= 0; i--) {
    if (pred(results.network[i])) return results.network[i];
  }
  return null;
}

async function reactSetInput(page, selector, value) {
  await page.waitForSelector(selector, { timeout: 15000 });
  await page.click(selector, { clickCount: 3 });
  await page.keyboard.press('Backspace');
  await page.type(selector, value, { delay: 12 });
}

async function clickToolbarButton(page, label) {
  const clicked = await page.evaluate((text) => {
    const buttons = Array.from(document.querySelectorAll('[data-testid="dashboard-page-toolbar"] button, [role="toolbar"] button'));
    const el = buttons.find((b) => (b.textContent || '').trim().includes(text));
    if (!el) return { ok: false, reason: 'not-found' };
    el.scrollIntoView({ block: 'center' });
    el.click();
    return { ok: true, label: (el.textContent || '').trim() };
  }, label);
  results.clicks.push({ label, ...clicked, at: new Date().toISOString() });
  await sleep(600);
  return clicked.ok;
}

async function bodyHasError(page) {
  return page.evaluate(() => {
    const txt = (document.body?.innerText || '').slice(0, 4000);
    const banner =
      /HRM API Sync ERROR|HRM API request failed|500 Internal|409|403 Forbidden|Không có quyền|companyId mismatch/i.test(
        txt,
      );
    return { banner, snippet: txt.slice(0, 300) };
  });
}

async function uiLogin(page) {
  await page.goto(`${PORTAL}/login`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(800);
  await page.evaluate(() => {
    for (const s of [localStorage, sessionStorage]) s.clear();
  });
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(600);
  await reactSetInput(page, 'input[type="email"]', EMAIL);
  await reactSetInput(page, 'input[type="password"]', PASSWORD);
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => null),
    page.click('button[type="submit"]'),
  ]);
  await sleep(2000);
  return page.url();
}

async function unlockPortalWorkspace(page) {
  await page.goto(`${PORTAL}/cockpit`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(2500);
  const unlocked = await page.evaluate(() => sessionStorage.getItem('xevn.portal.unlocked') === '1');
  return { url: page.url(), unlocked };
}

async function loadDashboard(page, path) {
  await page.goto(`${PORTAL}${path}`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(2500);
  const err = await bodyHasError(page);
  const getOrg = lastNet((n) => n.method === 'GET' && /org|organization|headcount|customers|customer/i.test(n.url));
  const onRoute = page.url().includes(path);
  return { err, getOrg, url: page.url(), onRoute };
}

(async () => {
  console.log('=== QA-XBOS-DASHBOARD-FE-01 ===');

  for (const [name, url] of [
    ['hrm', 'http://127.0.0.1:28001/api/hrm'],
    ['xbos', 'http://127.0.0.1:28002/api/xbos'],
    ['portal', PORTAL],
  ]) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
      results.l0[name] = { ok: r.ok, status: r.status };
    } catch (e) {
      results.l0[name] = { ok: false, error: String(e.message || e) };
    }
  }
  save();

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--window-size=1440,900'],
    defaultViewport: { width: 1440, height: 900 },
  });

  const page = await browser.newPage();
  trackNetwork(page);

  try {
    const loginUrl = await uiLogin(page);
    recordTc(
      'LOGIN',
      /command-center|dashboard|cockpit/.test(loginUrl) ? '🟢' : '🔴',
      `ceo@xe.vn login url=${loginUrl}`,
    );

    const unlock = await unlockPortalWorkspace(page);
    recordTc(
      'PORTAL-UNLOCK',
      unlock.unlocked ? '🟢' : '🔴',
      `/cockpit → sessionStorage xevn.portal.unlocked=${unlock.unlocked} url=${unlock.url}`,
      { clickPath: 'Unified Shell → /cockpit (SRS portal-flow gate)' },
    );

    const consoleBeforeOrg = results.consoleErrors.length;

    // ===== TC-XBOS-HDSD-016 =====
    const org = await loadDashboard(page, '/dashboard/organization');
    await shot(page, 'org-load');
    const orgBody = await page.evaluate(() => (document.body?.innerText || '').slice(0, 1500));
    const orgRegexOk = ORG_REGEX.test(orgBody);
    const toolbarVisible = await page.evaluate(
      () => !!document.querySelector('[data-testid="dashboard-page-toolbar"]'),
    );

    const orgClicks = {
      filter: await clickToolbarButton(page, 'Bộ lọc'),
      search: await clickToolbarButton(page, 'Tìm kiếm'),
      export: await clickToolbarButton(page, 'Xuất Excel'),
    };
    await sleep(500);
    const orgSearchVisible = await page.evaluate(
      () => !!document.querySelector('[data-testid="org-dashboard-search-input"]'),
    );
    await shot(page, 'org-after-clicks');

    const orgConsoleNew = results.consoleErrors.slice(consoleBeforeOrg);
    const org016Pass =
      unlock.unlocked &&
      org.onRoute &&
      !org.err.banner &&
      orgRegexOk &&
      toolbarVisible &&
      orgClicks.filter &&
      orgClicks.search &&
      orgClicks.export &&
      orgSearchVisible &&
      orgConsoleNew.length === 0;

    recordTc(
      'TC-XBOS-HDSD-016',
      org016Pass ? '🟢' : org.err.banner ? '🔴' : '🟡',
      `org onRoute=${org.onRoute} toolbar regex=${orgRegexOk} toolbar=${toolbarVisible} clicks=${JSON.stringify(orgClicks)} searchInput=${orgSearchVisible} GET=${org.getOrg?.status ?? 'soft'} consoleNew=${orgConsoleNew.length} banner=${org.err.banner}`,
      {
        clickPath: '/dashboard/organization → Bộ lọc → Tìm kiếm → Xuất Excel',
        url: org.url,
        bodySample: orgBody.slice(0, 200),
      },
    );

    const consoleBeforeCust = results.consoleErrors.length;
    const postBeforeCust = results.postMutations.length;

    // ===== TC-XBOS-HDSD-019 =====
    const cust = await loadDashboard(page, '/dashboard/customers');
    await shot(page, 'cust-load');
    const custBody = await page.evaluate(() => (document.body?.innerText || '').slice(0, 1500));
    const custRegexOk = CUST_REGEX.test(custBody);

    const custClicks = {
      add: await clickToolbarButton(page, 'Thêm mới'),
      search: await clickToolbarButton(page, 'Tìm kiếm'),
      export: await clickToolbarButton(page, 'Xuất'),
    };
    await sleep(500);
    const crmNotice = await page.evaluate(() =>
      /Thêm khách hàng qua CRM|Dashboard tập đoàn chỉ tổng hợp/i.test(document.body?.innerText || ''),
    );
    const custSearchVisible = await page.evaluate(
      () => !!document.querySelector('[data-testid="customers-dashboard-search-input"]'),
    );
    await shot(page, 'cust-after-clicks');

    const custConsoleNew = results.consoleErrors.slice(consoleBeforeCust);
    const custPostNew = results.postMutations.slice(postBeforeCust);
    const cust019Pass =
      unlock.unlocked &&
      cust.onRoute &&
      !cust.err.banner &&
      custRegexOk &&
      custClicks.add &&
      custClicks.search &&
      custClicks.export &&
      crmNotice &&
      custSearchVisible &&
      custPostNew.length === 0 &&
      custConsoleNew.length === 0;

    recordTc(
      'TC-XBOS-HDSD-019',
      cust019Pass ? '🟢' : cust.err.banner ? '🔴' : '🟡',
      `customers onRoute=${cust.onRoute} regex=${custRegexOk} clicks=${JSON.stringify(custClicks)} crmNotice=${crmNotice} searchInput=${custSearchVisible} POST=${custPostNew.length} GET=${cust.getOrg?.status ?? 'soft'} consoleNew=${custConsoleNew.length} banner=${cust.err.banner}`,
      {
        clickPath: '/dashboard/customers → Thêm mới → Tìm kiếm → Xuất',
        url: cust.url,
        bodySample: custBody.slice(0, 200),
      },
    );

    results.finishedAt = new Date().toISOString();
    results.summary = {
      tc016: results.tc.find((t) => t.id === 'TC-XBOS-HDSD-016')?.verdict,
      tc019: results.tc.find((t) => t.id === 'TC-XBOS-HDSD-019')?.verdict,
      ack: org016Pass && cust019Pass ? 'PASS_TO_PM' : 'FAIL_TO_PM',
    };
    save();
    console.log(`\nDONE ack=${results.summary.ack}`);
  } finally {
    await browser.close();
  }
})().catch((e) => {
  results.fatal = String(e.stack || e);
  save();
  console.error(e);
  process.exit(1);
});
