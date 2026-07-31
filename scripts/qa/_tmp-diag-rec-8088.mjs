import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = 'http://14.225.217.232:8088';
const CHROME =
  process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/qa-rec-hdsd-coverage-01a-20260801');
mkdirSync(SCREEN, { recursive: true });

const r = await fetch(`${PORTAL}/api/xbos/auth/login`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ email: 'ceo@xe.vn', password: 'Xevn@2026' }),
});
const j = await r.json();
const data = j?.data ?? j;
const token = data.accessToken || data.access_token;
const user = data.user || {};
if (!token) throw new Error(`login ${r.status}`);

const browser = await chromium.launch({
  headless: true,
  executablePath: CHROME,
  args: ['--no-sandbox'],
});
const page = await browser.newPage();
const fails = [];
page.on('response', async (res) => {
  const u = res.url();
  if (res.status() >= 400 && /\/hr\//.test(u)) {
    let body = '';
    try {
      body = (await res.text()).slice(0, 220);
    } catch {
      /* */
    }
    fails.push({ status: res.status(), url: u.replace(PORTAL, '').slice(0, 200), body });
  }
});
page.on('pageerror', (e) => console.log('PAGEERR', String(e).slice(0, 240)));
page.on('console', (m) => {
  if (m.type() === 'error') console.log('CONSOLE', String(m.text()).slice(0, 240));
});

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
  }
}, {
  token,
  expiresAt: Date.now() + 8 * 3600_000,
  user: {
    userId: user.userId || user.id || 'ceo',
    email: 'ceo@xe.vn',
    displayName: user.displayName || 'CEO',
    roles: user.roles || ['group_ceo'],
  },
});

await page.goto(PORTAL, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(2000);
console.log('portal body', (await page.locator('body').innerText()).slice(0, 200).replace(/\s+/g, ' '));

fails.length = 0;
const url = `${PORTAL}/hr/recruitment?portal=1&tenantId=xevn&companyId=main&tab=dashboard`;
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
await page.waitForTimeout(5000);
console.log('rec body', (await page.locator('body').innerText().catch(() => '')).slice(0, 400).replace(/\s+/g, ' '));
console.log('FAILS', JSON.stringify(fails.slice(0, 30), null, 2));
await page.screenshot({ path: resolve(SCREEN, 'diag-8088.png') });

fails.length = 0;
await page.goto(`${PORTAL}/command-center/hrm/recruitment`, {
  waitUntil: 'domcontentloaded',
  timeout: 60000,
});
await page.waitForTimeout(6000);
console.log(
  'frames',
  page.frames().map((f) => f.url().slice(0, 120)),
);
let iframeText = 'no-iframe';
try {
  iframeText = await page.frameLocator('iframe').first().locator('body').innerText({ timeout: 8000 });
} catch (e) {
  iframeText = `iframe err ${String(e).slice(0, 120)}`;
}
console.log('iframe body', String(iframeText).slice(0, 400).replace(/\s+/g, ' '));
console.log('cc body', (await page.locator('body').innerText()).slice(0, 300).replace(/\s+/g, ' '));
console.log('CC FAILS', JSON.stringify(fails.slice(0, 30), null, 2));
await page.screenshot({ path: resolve(SCREEN, 'diag-cc.png') });
await browser.close();
