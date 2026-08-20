/**
 * QA-D-XBOS-DIST-MAIN-L0-01 — browser network smoke (U65, no seed)
 */
import puppeteer from 'puppeteer';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const EMAIL = 'ceo@xe.vn';
const PASSWORD = 'Xevn@2026';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-qa-d-xbos-dist-main-l0-01-browser.json');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const networkLog = [];
const consoleLog = [];

async function main() {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();

  page.on('requestfailed', (req) => {
    networkLog.push({
      type: 'failed',
      url: req.url(),
      failure: req.failure()?.errorText || 'unknown',
    });
  });
  page.on('response', (res) => {
    const url = res.url();
    if (url.includes('/api/xbos/') || url.includes(':28002')) {
      networkLog.push({ type: 'response', url, status: res.status() });
    }
  });
  page.on('console', (msg) => {
    const t = msg.text();
    if (/28002|ECONNREFUSED|Failed to load/i.test(t)) {
      consoleLog.push(t.slice(0, 300));
    }
  });

  const loginR = await fetch(`${PORTAL}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const loginJ = await loginR.json();
  const data = loginJ?.data ?? loginJ;
  const token = data?.accessToken ?? data?.access_token;
  if (!token) throw new Error(`API login failed HTTP ${loginR.status}`);
  const session = {
    token,
    expiresAt: Date.now() + 8 * 3600_000,
    user: data.user ?? { email: EMAIL, roles: ['group_ceo'] },
  };
  await page.evaluateOnNewDocument((s) => {
    for (const store of [localStorage, sessionStorage]) {
      store.setItem('xevn.portal.accessToken', s.token);
      store.setItem('xevn.portal.tokenExpiresAt', String(s.expiresAt));
      store.setItem('xevn.portal.user', JSON.stringify(s.user));
      store.setItem('xevn.portal.tenantId', 'xevn');
      store.setItem('xevn.portal.companyId', 'main');
    }
  }, session);

  const afterLoginUrl = '(session inject via POST /api/xbos/auth/login 201)';
  await page.goto(`${PORTAL}/command-center`, { waitUntil: 'networkidle2', timeout: 90_000 });
  await sleep(3000);

  const ccUrl = page.url();
  const refused28002 = networkLog.filter(
    (n) =>
      (n.failure && /ECONNREFUSED|28002/i.test(String(n.failure) + n.url)) ||
      (n.url && n.url.includes('127.0.0.1:28002') && n.type === 'failed'),
  );
  const xbosResponses = networkLog.filter((n) => n.type === 'response' && n.url.includes('/api/xbos/'));
  const xbos2xx = xbosResponses.filter((n) => n.status >= 200 && n.status < 300);

  const result = {
    work_item_id: 'QA-D-XBOS-DIST-MAIN-L0-01',
    portal: PORTAL,
    account: EMAIL,
    seed: false,
    hold_deploy: true,
    afterLoginUrl,
    commandCenterUrl: ccUrl,
    econnrefused_28002_count: refused28002.length,
    econnrefused_28002: refused28002.slice(0, 20),
    xbos_api_response_count: xbosResponses.length,
    xbos_api_2xx_count: xbos2xx.length,
    sample_xbos_responses: xbosResponses.slice(-15),
    console_excerpt: consoleLog.slice(0, 10),
    browser_pass:
      refused28002.length === 0 &&
      xbos2xx.length >= 1 &&
      !String(ccUrl).includes('/login') &&
      consoleLog.every((c) => !/ECONNREFUSED.*28002/i.test(c)),
  };

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));

  await browser.close();
  process.exit(result.browser_pass ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
