#!/usr/bin/env node
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';

const PORTAL = 'http://127.0.0.1:5173';
const CHROME =
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCREEN = 'docs/qa/evidence/screens/po-uc-tc-w4-qa-e4-ci01-r3';
mkdirSync(SCREEN, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch({
  headless: true,
  executablePath: CHROME,
  args: ['--disable-dev-shm-usage'],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(`${PORTAL}/login`, { waitUntil: 'domcontentloaded' });
await page.evaluate(() => {
  for (const s of [localStorage, sessionStorage]) s.clear();
});
await page.goto(`${PORTAL}/login`, { waitUntil: 'domcontentloaded' });
await page.locator('input[type=email]').fill('ceo@xe.vn');
await page.locator('input[type=password]').fill('Xevn@2026');
await page.locator('button[type=submit]').filter({ hasText: /Đăng nhập/i }).click();
await sleep(3500);
await page.goto(`${PORTAL}/command-center/hrm/contracts`, {
  waitUntil: 'domcontentloaded',
  timeout: 90000,
});
await sleep(5000);
const hrm = page.frames().find((f) => f.url().includes('/hr/contracts'));
console.log('hrm', hrm && hrm.url());
if (!hrm) {
  writeFileSync(
    'docs/qa/evidence/_tmp-ci01-r3-debug2.json',
    JSON.stringify({ error: 'no hrm frame', frames: page.frames().map((f) => f.url()) }, null, 2),
  );
  await browser.close();
  process.exit(1);
}
const create = hrm.getByTestId('hdsd-contracts-create-btn');
console.log('createVisible', await create.isVisible());
console.log('createDisabled', await create.isDisabled().catch(() => null));
const createCount = await hrm.getByTestId('hdsd-contracts-create-btn').count();
const btnTexts = await hrm
  .locator('button')
  .evaluateAll((els) =>
    els.map((e) => ({
      text: (e.innerText || '').trim().slice(0, 80),
      testid: e.getAttribute('data-testid'),
      aria: e.getAttribute('aria-label'),
    })),
  );
await create.click({ force: true });
await sleep(3500);
await page.screenshot({ path: `${SCREEN}/debug-after-create.png` });
const dialogs = await hrm
  .locator('[role=dialog], [data-testid=hdsd-contracts-form-dialog]')
  .evaluateAll((els) =>
    els.map((e) => ({
      testid: e.getAttribute('data-testid'),
      text: (e.innerText || '').slice(0, 300),
      display: getComputedStyle(e).display,
      visibility: getComputedStyle(e).visibility,
      open: e.getAttribute('data-state') || e.getAttribute('open'),
    })),
  );
const body = (await hrm.locator('body').innerText()).slice(0, 2500);
const testids = await hrm
  .locator('[data-testid]')
  .evaluateAll((els) => els.map((e) => e.getAttribute('data-testid')));
const out = { dialogs, testids, body, url: hrm.url(), createCount, btnTexts };
writeFileSync('docs/qa/evidence/_tmp-ci01-r3-debug2.json', JSON.stringify(out, null, 2));
console.log(JSON.stringify({ dialogs, testids, createCount, btnSample: btnTexts.slice(0, 25) }, null, 2));
await browser.close();
