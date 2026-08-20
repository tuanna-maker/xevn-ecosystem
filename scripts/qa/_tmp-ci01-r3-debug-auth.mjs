#!/usr/bin/env node
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';

const PORTAL = 'http://127.0.0.1:5173';
const CHROME =
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const net = [];

const browser = await chromium.launch({
  headless: true,
  executablePath: CHROME,
  args: ['--disable-dev-shm-usage'],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('response', async (res) => {
  const u = res.url();
  if (!u.includes('/api/')) return;
  if (res.request().method() === 'OPTIONS') return;
  const e = {
    method: res.request().method(),
    status: res.status(),
    url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 260),
  };
  try {
    const j = await res.json();
    e.code = j.code;
    e.message = String(j.message || '').slice(0, 180);
  } catch {
    /* */
  }
  net.push(e);
});

await page.goto(`${PORTAL}/login`, { waitUntil: 'domcontentloaded' });
await page.evaluate(() => {
  for (const s of [localStorage, sessionStorage]) s.clear();
});
await page.goto(`${PORTAL}/login`, { waitUntil: 'domcontentloaded' });
await page.locator('input[type=email]').fill('ceo@xe.vn');
await page.locator('input[type=password]').fill('Xevn@2026');
await page.locator('button[type=submit]').filter({ hasText: /Đăng nhập/i }).click();
await sleep(4000);

const portalKeys = await page.evaluate(() => {
  const o = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    o[k] = String(localStorage.getItem(k) || '').slice(0, 120);
  }
  return o;
});

await page.goto(`${PORTAL}/command-center/hrm/contracts`, {
  waitUntil: 'domcontentloaded',
  timeout: 90000,
});
await sleep(6000);
const hrm = page.frames().find((f) => f.url().includes('/hr/contracts'));
const hrmKeys = hrm
  ? await hrm.evaluate(() => {
      const o = {};
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        o[k] = String(localStorage.getItem(k) || '').slice(0, 120);
      }
      return o;
    })
  : null;
const body = hrm ? (await hrm.locator('body').innerText()).slice(0, 600) : 'NO_FRAME';

// retry: open membership if needed then reload iframe
const membershipBtn = page.locator('button, [role="button"]').filter({ hasText: /CEO|membership|Chọn/i }).first();
console.log('membership visible', await membershipBtn.isVisible().catch(() => false));

writeFileSync(
  'docs/qa/evidence/_tmp-ci01-r3-debug-auth.json',
  JSON.stringify(
    {
      pageUrl: page.url(),
      hrmUrl: hrm?.url(),
      portalKeys,
      hrmKeys,
      body,
      net: net.filter((n) => /auth|contract|employee|membership/i.test(n.url)).slice(-40),
    },
    null,
    2,
  ),
);
console.log(
  JSON.stringify(
    {
      pageUrl: page.url(),
      hrmUrl: hrm?.url(),
      portalToken: Boolean(portalKeys['xevn.portal.accessToken']),
      hrmTokenKeys: hrmKeys ? Object.keys(hrmKeys) : [],
      bodyHead: body.slice(0, 300),
      contractNet: net.filter((n) => /contract/i.test(n.url)),
    },
    null,
    2,
  ),
);
await browser.close();
