#!/usr/bin/env node
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';

const PORTAL = 'http://127.0.0.1:5173';
const CHROME =
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const pageErrors = [];
const consoleErrors = [];

const browser = await chromium.launch({
  headless: true,
  executablePath: CHROME,
  args: ['--disable-dev-shm-usage'],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('pageerror', (e) => pageErrors.push(String(e.message).slice(0, 300)));
page.on('console', (m) => {
  if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 300));
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
await page.goto(`${PORTAL}/command-center/hrm/contracts`, {
  waitUntil: 'domcontentloaded',
  timeout: 90000,
});
await sleep(8000);
const hrm = page.frames().find((f) => f.url().includes('/hr/contracts'));
// attach error listeners on frame
hrm.on('pageerror', (e) => pageErrors.push('frame:' + String(e.message).slice(0, 300)));

const before = await hrm.evaluate(() => ({
  dialogOpenAttr: document.querySelector('[data-testid=hdsd-contracts-form-dialog]')?.outerHTML?.slice(0, 100),
  reactFiber: !!document.querySelector('[data-testid=hdsd-contracts-create-btn]'),
}));
await hrm.getByTestId('hdsd-contracts-create-btn').click({ timeout: 15000 });
await sleep(2000);
let count = await hrm.locator('[role=dialog]').count();
const afterClick1 = await hrm.evaluate(() => ({
  dialogs: document.querySelectorAll('[role=dialog]').length,
  testid: !!document.querySelector('[data-testid=hdsd-contracts-form-dialog]'),
  bodyHasCreate: document.body.innerText.includes('Thêm hợp đồng mới') || document.body.innerText.includes('createTitle'),
  overlay: document.querySelectorAll('[data-radix-portal]').length,
}));

// React synthetic: focus + Enter / Space
await hrm.getByTestId('hdsd-contracts-create-btn').focus();
await hrm.getByTestId('hdsd-contracts-create-btn').press('Enter');
await sleep(1500);
count = await hrm.locator('[role=dialog]').count();

// Direct /hr top-level (same tokens)
await page.goto(`${PORTAL}/hr/contracts?portal=1&tenantId=xevn&companyId=main`, {
  waitUntil: 'domcontentloaded',
  timeout: 90000,
});
await sleep(6000);
await page.getByTestId('hdsd-contracts-create-btn').click({ timeout: 15000 });
await sleep(2000);
const directDialogs = await page.locator('[role=dialog]').count();
const directBody = (await page.locator('body').innerText()).slice(0, 400);
const directTestid = await page.getByTestId('hdsd-contracts-form-dialog').isVisible().catch(() => false);

writeFileSync(
  'docs/qa/evidence/_tmp-ci01-r3-debug-click.json',
  JSON.stringify(
    {
      before,
      afterClick1,
      countAfterEnter: count,
      directDialogs,
      directTestid,
      directBody,
      pageErrors,
      consoleErrors: consoleErrors.slice(0, 20),
    },
    null,
    2,
  ),
);
console.log(
  JSON.stringify(
    { afterClick1, countAfterEnter: count, directDialogs, directTestid, pageErrors, consoleErrors: consoleErrors.slice(0, 10) },
    null,
    2,
  ),
);
await browser.close();
