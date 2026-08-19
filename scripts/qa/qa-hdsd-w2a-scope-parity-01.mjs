/**
 * QA-HDSD-W2A-SCOPE-PARITY-01 — Retest W2a standalone scope parity after D-HRM-W2A-SCOPE-PARITY-01
 * U65 zero-seed · mobile login on :8080/hr/* · compare W2b embed :5173
 */
import puppeteer from 'puppeteer';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HRM = (process.env.HRM_STANDALONE_URL || 'http://127.0.0.1:8080').replace(/\/$/, '');
const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-qa-hdsd-w2a-scope-parity-runtime.json');
const SCREEN_DIR = resolve(ROOT, 'docs/qa/evidence/screens/qa-hdsd-w2a-scope-parity-20260730');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const qHrm = (path) => {
  let p = path.startsWith('/') ? path : `/${path}`;
  if (!p.startsWith('/hr/') && p !== '/hr') p = `/hr${p}`;
  return `${HRM}${p}`;
};
const qPortal = (path) =>
  `${PORTAL}${path}${path.includes('?') ? '&' : '?'}portal=1&tenantId=xevn&companyId=main`;

const CRITICAL_APIS = [
  { id: 'catalog-sync', pred: (n) => /\/api\/hrm\/catalog-sync(\?|$)/.test(n.url) && n.method === 'GET' },
  { id: 'employees', pred: (n) => /\/api\/hrm\/employees(\?|$)/.test(n.url) && n.method === 'GET' && !/\/summary/.test(n.url) },
  { id: 'employees/summary', pred: (n) => /\/api\/hrm\/employees\/summary/.test(n.url) && n.method === 'GET' },
  { id: 'settings-catalogs', pred: (n) => /\/api\/hrm\/settings-catalogs(\?|$)/.test(n.url) && n.method === 'GET' },
];

const results = {
  work_item_id: 'QA-HDSD-W2A-SCOPE-PARITY-01',
  program: 'P-HDSD-QA-SRS-01',
  persona: EMAIL,
  u65: 'zero-seed browser-only',
  startedAt: new Date().toISOString(),
  l0: {},
  w2a: { apis: {}, scope409Count: 0, jHrm01: null },
  w2b: { apis: {}, scope409Count: 0 },
  network: [],
  consoleErrors: [],
  verdict: null,
};

function save() {
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(results, null, 2));
}

function trackNetwork(page, tag) {
  page.on('response', (res) => {
    try {
      const u = res.url();
      if (!/\/api\/hrm\//.test(u)) return;
      if (res.request().method() === 'OPTIONS') return;
      const row = {
        tag,
        method: res.request().method(),
        status: res.status(),
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 240),
        at: new Date().toISOString(),
      };
      results.network.push(row);
      if (row.status === 409) {
        if (tag === 'w2a') results.w2a.scope409Count++;
        if (tag === 'w2b') results.w2b.scope409Count++;
      }
    } catch {
      /* */
    }
  });
  page.on('console', (msg) => {
    if (msg.type() === 'error') results.consoleErrors.push(`[${tag}] ${msg.text().slice(0, 280)}`);
  });
}

function collectApis(tag, sinceIdx) {
  const slice = results.network.slice(sinceIdx).filter((n) => n.tag === tag);
  const out = {};
  for (const api of CRITICAL_APIS) {
    const hits = slice.filter(api.pred);
    const last = hits.length ? hits[hits.length - 1] : null;
    out[api.id] = last ? { status: last.status, url: last.url } : null;
  }
  const scope409 = slice.filter((n) => n.status === 409);
  return { apis: out, scope409Urls: scope409.map((n) => n.url), all409: scope409.length };
}

function lastNet(pred) {
  for (let i = results.network.length - 1; i >= 0; i--) {
    if (pred(results.network[i])) return results.network[i];
  }
  return null;
}

async function waitForNet(pred, timeoutMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const hit = lastNet(pred);
    if (hit) return hit;
    await sleep(250);
  }
  return null;
}

async function bodyHasScopeError(page) {
  return page.evaluate(() => {
    const t = document.body?.innerText || '';
    return {
      scopeBanner: /Phạm vi tenant\/công ty không khớp|companyId mismatches/i.test(t),
      syncError: /HRM API Sync ERROR|Sync ERROR/i.test(t),
      snippet: t.slice(0, 350).replace(/\s+/g, ' '),
    };
  });
}

async function shot(page, name) {
  mkdirSync(SCREEN_DIR, { recursive: true });
  const path = join(SCREEN_DIR, `${name}.png`);
  await page.screenshot({ path, fullPage: false });
  return path.replace(/\\/g, '/');
}

async function hrmMobileLogin(page) {
  await page.goto(qHrm('/login'), { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(1500);
  await page.waitForSelector('input[type="email"]', { timeout: 30000 });
  await page.click('input[type="email"]', { clickCount: 3 });
  await page.keyboard.press('Backspace');
  await page.type('input[type="email"]', EMAIL, { delay: 10 });
  await page.type('input[type="password"]', PASSWORD, { delay: 10 });
  const netBefore = results.network.length;
  await page.click('button[type="submit"]');
  await sleep(5000);
  const loginNet = results.network.slice(netBefore).find((n) => /auth\/(mobile\/)?login/.test(n.url));
  const storage = await page.evaluate(() => ({
    token: !!localStorage.getItem('xevn.portal.accessToken'),
    tenant: localStorage.getItem('hrm_current_tenant_id'),
    company: localStorage.getItem('hrm_current_company_id'),
    url: location.href,
  }));
  return { loginNet, storage, url: page.url() };
}

async function clickFirstEmployeeRow(page) {
  return page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('tbody tr, [role="row"]')).filter((r) => {
      const t = (r.textContent || '').trim();
      return t.length > 8 && !/không có|no data|empty|chưa có|stt/i.test(t);
    });
    if (!rows.length) return { ok: false, reason: 'empty' };
    rows[0].scrollIntoView({ block: 'center' });
    rows[0].click();
    return { ok: true, text: (rows[0].textContent || '').replace(/\s+/g, ' ').trim().slice(0, 120) };
  });
}

async function apiPortalLogin() {
  for (const url of [`${PORTAL}/api/xbos/auth/login`, `${PORTAL}/api/auth/login`]) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
      });
      const j = await r.json();
      const data = j?.data ?? j;
      const token = data?.accessToken ?? data?.access_token;
      if (token) return { token, user: data?.user ?? { email: EMAIL } };
    } catch {
      /* */
    }
  }
  throw new Error('portal login failed');
}

async function injectPortalSession(page, session) {
  await page.evaluateOnNewDocument((s) => {
    const payload = JSON.stringify(s.user);
    for (const store of [localStorage, sessionStorage]) {
      store.setItem('xevn.portal.accessToken', s.token);
      store.setItem('xevn.portal.user', payload);
      store.setItem('xevn.portal.tenantId', 'xevn');
      store.setItem('xevn.portal.companyId', 'main');
    }
  }, session);
}

function apisAll2xx(apis) {
  return CRITICAL_APIS.every((a) => {
    const hit = apis[a.id];
    return hit && hit.status >= 200 && hit.status < 300;
  });
}

function apisAny409(apis) {
  return Object.values(apis).some((h) => h?.status === 409);
}

(async () => {
  console.log('=== QA-HDSD-W2A-SCOPE-PARITY-01 ===', HRM);

  for (const [name, url] of [
    ['hrm-api', 'http://127.0.0.1:28001/api/hrm'],
    ['hrm-standalone', `${HRM}/`],
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

  try {
    // ===== W2a — mobile login standalone =====
    const w2a = await browser.newPage();
    trackNetwork(w2a, 'w2a');
    const login = await hrmMobileLogin(w2a);
    results.w2a.login = login;
    await shot(w2a, 'w2a-after-login');

    const routes = [
      { path: '/employees', label: 'employees-list', apis: ['catalog-sync', 'employees'] },
      { path: '/company', label: 'headcount', apis: ['employees/summary'] },
      { path: '/settings', label: 'settings', apis: ['catalog-sync', 'settings-catalogs'] },
    ];

    for (const route of routes) {
      const idx = results.network.length;
      await w2a.goto(qHrm(route.path), { waitUntil: 'domcontentloaded', timeout: 90000 });
      await sleep(3500);
      for (const apiId of route.apis) {
        const def = CRITICAL_APIS.find((a) => a.id === apiId);
        if (def) await waitForNet((n) => n.tag === 'w2a' && def.pred(n), 15000);
      }
      const collected = collectApis('w2a', idx);
      results.w2a.routes = results.w2a.routes || {};
      results.w2a.routes[route.label] = {
        url: w2a.url(),
        ...collected,
        body: await bodyHasScopeError(w2a),
      };
      await shot(w2a, `w2a-${route.label}`);
    }

    // J-HRM-01 list → detail on employees
    await w2a.goto(qHrm('/employees'), { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(3000);
    await waitForNet((n) => n.tag === 'w2a' && /\/api\/hrm\/employees(\?|$)/.test(n.url), 15000);
    const rowClick = await clickFirstEmployeeRow(w2a);
    await sleep(2500);
    const detailGet = lastNet(
      (n) => n.tag === 'w2a' && n.method === 'GET' && /\/api\/hrm\/employees\/[^/?]+/.test(n.url),
    );
    const jErr = await bodyHasScopeError(w2a);
    results.w2a.jHrm01 = {
      clickPath: `${HRM}/hr/employees → click row`,
      rowClick,
      detailGet: detailGet ? { status: detailGet.status, url: detailGet.url } : null,
      finalUrl: w2a.url(),
      scopeBanner: jErr.scopeBanner,
      verdict:
        rowClick.ok && detailGet && detailGet.status >= 200 && detailGet.status < 300 && !jErr.scopeBanner
          ? '🟢 PASS'
          : rowClick.ok === false && rowClick.reason === 'empty'
            ? '🟡 NO_ROWS'
            : '🔴 FAIL',
    };
    await shot(w2a, 'w2a-j-hrm-01-detail');

    // Merge all W2a critical APIs from routes
    const w2aApis = {};
    for (const r of Object.values(results.w2a.routes || {})) {
      for (const [k, v] of Object.entries(r.apis || {})) {
        if (v) w2aApis[k] = v;
      }
    }
    results.w2a.apis = w2aApis;

    // ===== W2b embed parity spot =====
    const session = await apiPortalLogin();
    const w2b = await browser.newPage();
    trackNetwork(w2b, 'w2b');
    await injectPortalSession(w2b, session);
    await w2b.goto(qPortal('/command-center/hrm/employees'), { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(3500);
    await waitForNet((n) => n.tag === 'w2b' && /\/api\/hrm\/employees(\?|$)/.test(n.url), 20000);
    const w2bIdx = results.network.findIndex((n) => n.tag === 'w2b');
    const w2bEmp = collectApis('w2b', w2bIdx >= 0 ? w2bIdx : 0);
    results.w2b.employees = {
      url: w2b.url(),
      ...w2bEmp,
      body: await bodyHasScopeError(w2b),
    };
    results.w2b.apis = w2bEmp.apis;
    await shot(w2b, 'w2b-employees-embed');

    await w2b.goto(qPortal('/command-center/hrm/settings'), { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(3000);
    await waitForNet((n) => n.tag === 'w2b' && /catalog-sync|settings-catalogs/.test(n.url), 15000);
    const w2bSetIdx = results.network.length - 20;
    results.w2b.settings = collectApis('w2b', Math.max(0, w2bSetIdx));

    // Verdict
    const w2aCriticalOk = apisAll2xx(results.w2a.apis);
    const w2aNo409 = results.w2a.scope409Count === 0 && !apisAny409(results.w2a.apis);
    const w2aNoBanner = !Object.values(results.w2a.routes || {}).some((r) => r.body?.scopeBanner);
    const jPass = ['🟢 PASS', '🟡 NO_ROWS'].includes(results.w2a.jHrm01.verdict);

    const hardFail =
      !w2aCriticalOk ||
      !w2aNo409 ||
      w2aNoBanner === false ||
      results.w2a.jHrm01.verdict === '🔴 FAIL' ||
      results.consoleErrors.some((e) => /ERR_CONNECTION_REFUSED|:54321/.test(e));

    results.verdict = hardFail ? 'FAIL_TO_PM' : 'PASS_TO_PM';
    results.parity = {
      w2aEmployees: results.w2a.apis.employees?.status,
      w2bEmployees: results.w2b.apis.employees?.status,
      w2aCatalogSync: results.w2a.apis['catalog-sync']?.status,
      w2bCatalogSync: results.w2b.routes?.settings?.apis?.['catalog-sync']?.status ?? results.w2b.settings?.apis?.['catalog-sync']?.status,
      match: results.w2a.apis.employees?.status === results.w2b.apis.employees?.status,
    };
    results.finishedAt = new Date().toISOString();
    save();

    console.log('W2a login storage', login.storage);
    console.log('W2a APIs', JSON.stringify(results.w2a.apis));
    console.log('W2a scope409 count', results.w2a.scope409Count);
    console.log('J-HRM-01', results.w2a.jHrm01.verdict);
    console.log('W2b employees', results.w2b.apis.employees?.status);
    console.log('VERDICT', results.verdict);
    process.exit(hardFail ? 1 : 0);
  } finally {
    await browser.close();
  }
})();
