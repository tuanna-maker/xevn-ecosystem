#!/usr/bin/env node
import { chromium } from 'playwright';

const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE = 'http://127.0.0.1:8080';

const login = await fetch('http://127.0.0.1:28002/api/xbos/auth/login', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ email: 'ceo@xe.vn', password: 'Xevn@2026' }),
});
const j = await login.json();
const data = j.data || j;
const token = data.accessToken || data.access_token;

const browser = await chromium.launch({ headless: true, executablePath: CHROME });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.addInitScript(({ token }) => {
  const u = JSON.stringify({
    userId: 'ceo',
    email: 'ceo@xe.vn',
    displayName: 'CEO',
    roles: ['group_ceo'],
  });
  for (const s of [localStorage, sessionStorage]) {
    s.setItem('xevn.portal.accessToken', token);
    s.setItem('access_token', token);
    s.setItem('token', token);
    s.setItem('xevn.portal.companyId', 'main');
    s.setItem('hrm_current_company_id', 'main');
    s.setItem('xevn.portal.tenantId', 'xevn');
    s.setItem('hrm_current_tenant_id', 'xevn');
    s.setItem('xevn.portal.user', u);
    s.setItem('xevn.portal.tokenExpiresAt', String(Date.now() + 8 * 3600e3));
  }
}, { token });

await page.goto(
  `${BASE}/hr/recruitment?companyId=main&tenantId=xevn&tab=jobs&_qa=${Date.now()}`,
  { waitUntil: 'domcontentloaded', timeout: 60_000 },
);
await page.waitForTimeout(2500);

const info = await page.evaluate(() => {
  const root = document.querySelector('[data-testid="rec-jobs-tab-precision"]');
  const all = [...document.querySelectorAll('h1,h2,h3,[class*="font-display"]')].map((el) => {
    const cs = getComputedStyle(el);
    return {
      tag: el.tagName,
      text: (el.textContent || '').trim().slice(0, 80),
      fs: cs.fontSize,
      fw: cs.fontWeight,
      ff: cs.fontFamily.slice(0, 48),
      inRoot: !!(root && root.contains(el)),
      cls: (el.className || '').toString().slice(0, 100),
    };
  });
  return { hasTestId: !!root, all };
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
