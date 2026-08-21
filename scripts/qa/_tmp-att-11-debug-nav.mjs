#!/usr/bin/env node
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const XBOS = 'http://127.0.0.1:28002';
const CHROME =
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const EMAIL = 'ceo@xe.vn';
const PASSWORD = 'Xevn@2026';

async function loginApi() {
  const r = await fetch(`${XBOS}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const j = await r.json();
  const data = j.data || j;
  return {
    token: data.accessToken || data.access_token,
    expiresAt: Date.now() + 8 * 3600_000,
    companyId: 'main',
    user: {
      userId: data.user?.userId || EMAIL,
      email: EMAIL,
      displayName: EMAIL,
      roles: ['group_ceo'],
    },
  };
}

const session = await loginApi();
console.error('token', Boolean(session.token), 'PORTAL', PORTAL);

const browser = await chromium.launch({ headless: true, executablePath: CHROME });
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
const failed = [];
page.on('response', (res) => {
  if (res.status() >= 400) failed.push({ status: res.status(), url: res.url().slice(0, 400) });
});
page.on('console', (msg) => {
  console.error('[console]', msg.type(), String(msg.text()).slice(0, 500));
});
page.on('pageerror', (e) => console.error('[pageerror]', String(e).slice(0, 800)));

await page.addInitScript(
  ({ s }) => {
    const payload = JSON.stringify(s.user);
    for (const store of [localStorage, sessionStorage]) {
      store.setItem('xevn.portal.accessToken', s.token);
      store.setItem('xevn.portal.tokenExpiresAt', String(s.expiresAt));
      store.setItem('xevn.portal.user', payload);
      store.setItem('xevn.portal.tenantId', 'xevn');
      store.setItem('xevn.portal.companyId', s.companyId);
      store.setItem('hrm_current_company_id', s.companyId);
      store.setItem('hrm_current_tenant_id', 'xevn');
      store.setItem('access_token', s.token);
      store.setItem('token', s.token);
      store.setItem('hrm_portal_mode', '1');
    }
  },
  { s: session },
);

const url = `${PORTAL}/hr/attendance?portal=1&tenantId=xevn&companyId=main&_=${Date.now()}`;
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90_000 });
await page.waitForTimeout(12000);
mkdirSync('docs/qa/evidence/screens/po-hrm-mvp-gd1-att-11-cluster-qa-01', { recursive: true });
await page.screenshot({
  path: 'docs/qa/evidence/screens/po-hrm-mvp-gd1-att-11-cluster-qa-01/00-debug.png',
  fullPage: true,
});

const out = {
  title: await page.title(),
  url: page.url(),
  failed: failed.slice(0, 50),
  rootHtml: await page.evaluate(() => {
    const root = document.querySelector('#root') || document.body;
    return (root?.innerHTML || '').slice(0, 2000);
  }),
  hasMenu: await page.locator('[data-testid="attendance-tab-menu"]').count(),
  hasSheets: await page.locator('[data-testid="att-sheets-precision"]').count(),
  testids: await page.evaluate(() =>
    [...document.querySelectorAll('[data-testid]')]
      .map((e) => e.getAttribute('data-testid'))
      .slice(0, 100),
  ),
  body: ((await page.locator('body').innerText().catch(() => '')) || '').slice(0, 1200),
};
console.log(JSON.stringify(out, null, 2));
await browser.close();
