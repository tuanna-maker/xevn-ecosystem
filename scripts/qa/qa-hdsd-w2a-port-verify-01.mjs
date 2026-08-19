/**
 * QA-HDSD-W2A-PORT-VERIFY-01 — W2a canonical :8080/hr vs W2b embed :5173/command-center/hrm
 * U65 zero-seed · browser-only · menu parity spot on employees list
 */
import puppeteer from 'puppeteer';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM_STANDALONE = (process.env.HRM_STANDALONE_URL || 'http://127.0.0.1:8080/hr/').replace(/\/?$/, '/');
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-qa-hdsd-w2a-port-verify-runtime.json');
const SCREEN_DIR = resolve(ROOT, 'docs/qa/evidence/screens/hdsd-w2a-port-verify-20260730');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const qPortal = (path) =>
  `${PORTAL}${path}${path.includes('?') ? '&' : '?'}portal=1&tenantId=xevn&companyId=main`;
const qHrm = (path) => {
  const base = HRM_STANDALONE.replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}${p.includes('?') ? '&' : '?'}portal=1&tenantId=xevn&companyId=main`;
};

async function apiPortalLogin() {
  const urls = [`${PORTAL}/api/xbos/auth/login`, `${PORTAL}/api/auth/login`];
  let lastErr = '';
  for (const url of urls) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
      });
      const text = await r.text();
      const j = text ? JSON.parse(text) : {};
      const data = j?.data ?? j;
      const token = data?.accessToken ?? data?.access_token ?? j?.accessToken;
      if (token) {
        return {
          token,
          expiresAt: Date.now() + 8 * 3600_000,
          user: data?.user ?? { userId: EMAIL, email: EMAIL, roles: ['group_ceo', 'portal'] },
          raw: data,
          loginUrl: url,
        };
      }
      lastErr = `HTTP ${r.status} via ${url}`;
    } catch (e) {
      lastErr = `${url}: ${String(e).slice(0, 160)}`;
    }
  }
  throw new Error(`login failed — ${lastErr}`);
}

async function injectSession(page, session) {
  await page.evaluateOnNewDocument((s) => {
    const payload = JSON.stringify(s.user);
    for (const store of [localStorage, sessionStorage]) {
      store.setItem('xevn.portal.accessToken', s.token);
      store.setItem('xevn.portal.tokenExpiresAt', String(s.expiresAt));
      store.setItem('xevn.portal.user', payload);
      store.setItem('xevn.portal.tenantId', 'xevn');
      store.setItem('xevn.portal.companyId', 'main');
    }
    sessionStorage.setItem('hrm:operating-unit-filter', 'all');
  }, session);
}

const results = {
  work_item_id: 'QA-HDSD-W2A-PORT-VERIFY-01',
  startedAt: new Date().toISOString(),
  persona: EMAIL,
  u65: 'zero-seed browser-only',
  l0: {},
  w2a: {},
  w2b: {},
  menuParity: {},
  network: [],
  consoleErrors: [],
  verdict: null,
};

function save() {
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(results, null, 2));
}

function trackNetwork(page) {
  page.on('response', (res) => {
    try {
      const u = res.url();
      if (!/\/api\/(hrm|xbos)\//.test(u)) return;
      if (res.request().method() === 'OPTIONS') return;
      results.network.push({
        method: res.request().method(),
        status: res.status(),
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 220),
      });
    } catch {
      /* */
    }
  });
  page.on('console', (msg) => {
    const t = msg.type();
    if (t === 'error') results.consoleErrors.push(msg.text().slice(0, 300));
  });
}

function lastNet(pred) {
  for (let i = results.network.length - 1; i >= 0; i--) {
    if (pred(results.network[i])) return results.network[i];
  }
  return null;
}

async function waitForNet(pred, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const hit = lastNet(pred);
    if (hit) return hit;
    await sleep(300);
  }
  return null;
}

async function reactSetInput(page, selector, value) {
  await page.waitForSelector(selector, { timeout: 15000 });
  await page.click(selector, { clickCount: 3 });
  await page.keyboard.press('Backspace');
  await page.type(selector, value, { delay: 12 });
}

async function bodyHasError(page) {
  return page.evaluate(() => {
    const body = document.body?.innerText || '';
    const banner =
      /HRM API Sync ERROR|request failed \(500\)|Internal Server Error|Không thể tải|Lỗi đồng bộ|Phạm vi tenant\/công ty không khớp|companyId mismatches/i.test(
        body,
      );
    const err500 = /500|503/.test(body.slice(0, 4000));
    return { banner, err500, snippet: body.slice(0, 400).replace(/\s+/g, ' ') };
  });
}

async function extractNavLabels(page) {
  return page.evaluate(() => {
    const labels = [];
    for (const sel of ['nav a', '[role="navigation"] a', 'aside a', '.sidebar a', '[data-testid*="nav"]']) {
      for (const el of document.querySelectorAll(sel)) {
        const t = (el.textContent || '').trim().replace(/\s+/g, ' ');
        if (t.length >= 2 && t.length <= 40) labels.push(t);
      }
    }
    return [...new Set(labels)].slice(0, 30);
  });
}

async function shot(page, name) {
  mkdirSync(SCREEN_DIR, { recursive: true });
  const path = join(SCREEN_DIR, `${name}.png`);
  await page.screenshot({ path, fullPage: false });
  return path.replace(/\\/g, '/');
}

async function hrmStandaloneViaPortalBridge(standalonePage, session) {
  await injectSession(standalonePage, session);
  await standalonePage.goto(qHrm('/employees'), { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(3500);
  return { mode: 'portal-session-bridge', url: standalonePage.url() };
}

const browser = await puppeteer.launch({
  headless: true,
  executablePath: CHROME,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

try {
  const session = await apiPortalLogin();
  results.portalAuth = { loginUrl: session.loginUrl, tokenOk: !!session.token };

  // ===== W2b embed (command-center path per BA dual-entry) =====
  const portalPage = await browser.newPage();
  trackNetwork(portalPage);
  await injectSession(portalPage, session);
  await portalPage.goto(qPortal('/command-center/hrm/employees'), {
    waitUntil: 'domcontentloaded',
    timeout: 90000,
  });
  await sleep(2000);
  const w2bEmpNet = await waitForNet(
    (n) => /\/api\/hrm\/employees(\?|$)/.test(n.url) && n.method === 'GET' && !/\/summary/.test(n.url),
    20000,
  );
  await sleep(1500);
  const w2bShot = await shot(portalPage, 'w2b-employees-list');
  const w2bErr = await bodyHasError(portalPage);
  const w2bNav = await extractNavLabels(portalPage);
  results.w2b = {
    url: portalPage.url(),
    target: 'http://127.0.0.1:5173/command-center/hrm/employees',
    screenshot: w2bShot,
    employeesGet: w2bEmpNet,
    errorBanner: w2bErr.banner,
    bodySnippet: w2bErr.snippet.slice(0, 200),
    navLabels: w2bNav,
    verdict:
      !w2bErr.banner &&
      w2bEmpNet &&
      w2bEmpNet.status < 400 &&
      /hrm\/employees/.test(portalPage.url())
        ? '🟢'
        : w2bErr.banner
          ? '🔴'
          : '🟡',
  };

  // ===== W2a standalone (:8080/hr) via portal session bridge =====
  const w2aPage = await browser.newPage();
  trackNetwork(w2aPage);
  const w2aLogin = await hrmStandaloneViaPortalBridge(w2aPage, session);
  const w2aEmpNet = await waitForNet(
    (n) => /\/api\/hrm\/employees(\?|$)/.test(n.url) && n.method === 'GET' && !/\/summary/.test(n.url),
    20000,
  );
  await sleep(1000);
  const w2aShot = await shot(w2aPage, 'w2a-employees-list');
  const w2aErr = await bodyHasError(w2aPage);
  const w2aNav = await extractNavLabels(w2aPage);
  results.w2a = {
    url: w2aPage.url(),
    target: 'http://127.0.0.1:8080/hr/employees',
    loginMode: w2aLogin.mode,
    screenshot: w2aShot,
    employeesGet: w2aEmpNet,
    errorBanner: w2aErr.banner,
    bodySnippet: w2aErr.snippet.slice(0, 200),
    navLabels: w2aNav,
    verdict:
      !w2aErr.banner && w2aEmpNet && w2aEmpNet.status < 400 && /employees/.test(w2aPage.url())
        ? '🟢'
        : w2aErr.banner
          ? '🔴'
          : '🟡',
  };

  // Menu parity — compare key HRM nav tokens present in both
  const keyTokens = ['Nhân sự', 'Hợp đồng', 'Chấm công', 'Lương', 'Cài đặt', 'Báo cáo', 'Tuyển dụng'];
  const w2aText = w2aNav.join(' ');
  const w2bText = w2bNav.join(' ');
  const parity = keyTokens.map((tok) => ({
    token: tok,
    w2a: w2aText.includes(tok),
    w2b: w2bText.includes(tok),
    match: w2aText.includes(tok) === w2bText.includes(tok),
  }));
  const parityOk = parity.every((p) => p.match);
  results.menuParity = { keyTokens: parity, parityOk, w2aCount: w2aNav.length, w2bCount: w2bNav.length };

  const has409Employees = [w2aEmpNet, w2bEmpNet].some((n) => n?.status === 409);
  const hardFail =
    results.w2a.verdict === '🔴' ||
    results.w2b.verdict === '🔴' ||
    has409Employees ||
    results.consoleErrors.some((e) => /ERR_CONNECTION_REFUSED|54321/.test(e));

  results.verdict =
    hardFail ? 'FAIL' : results.w2a.verdict === '🟢' && results.w2b.verdict === '🟢' ? 'PASS' : 'PASS_WITH_SOFT';
  results.finishedAt = new Date().toISOString();
  save();

  console.log('=== QA-HDSD-W2A-PORT-VERIFY-01 ===');
  console.log('W2a', results.w2a.verdict, results.w2a.url, 'GET', results.w2a.employeesGet?.status);
  console.log('W2b', results.w2b.verdict, results.w2b.url, 'GET', results.w2b.employeesGet?.status);
  console.log('Menu parity', parityOk ? 'OK' : 'SOFT', JSON.stringify(parity.filter((p) => !p.match)));
  console.log('Overall', results.verdict);
  process.exit(hardFail ? 1 : 0);
} finally {
  await browser.close();
}
