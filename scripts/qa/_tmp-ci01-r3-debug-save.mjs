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
  const m = res.request().method();
  if (m === 'OPTIONS') return;
  const e = { method: m, status: res.status(), url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 260) };
  try {
    const j = await res.json();
    e.code = j.code;
    e.message = String(j.message || '').slice(0, 200);
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
await sleep(3500);
await page.goto(`${PORTAL}/hr/contracts?portal=1&tenantId=xevn&companyId=main`, {
  waitUntil: 'domcontentloaded',
  timeout: 90000,
});
await sleep(6000);
await page.getByTestId('hdsd-contracts-create-btn').click();
await page.getByTestId('hdsd-contracts-form-dialog').waitFor({ state: 'visible', timeout: 20000 });
await sleep(2000);
const ready = await page.getByTestId('hdsd-contracts-form-ready').isVisible().catch(() => false);
const formSnap = await page.evaluate(() => {
  const dlg = document.querySelector('[data-testid=hdsd-contracts-form-dialog]');
  const inputs = [...(dlg?.querySelectorAll('input, textarea, button[role=combobox], [data-testid]') || [])].map(
    (el) => ({
      tag: el.tagName,
      id: el.id,
      testid: el.getAttribute('data-testid'),
      name: el.getAttribute('name'),
      value: el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement ? el.value : el.textContent?.trim()?.slice(0, 80),
    }),
  );
  return { ready: !!document.querySelector('[data-testid=hdsd-contracts-form-ready]'), inputs };
});

const before = net.length;
await page.getByTestId('hdsd-contracts-form-submit').click();
await sleep(1500);
const toastText = await page
  .locator('[data-sonner-toast], [role=status], li[data-type], .Toaster')
  .allInnerTexts()
  .catch(() => []);
const bodySlice = (await page.locator('body').innerText()).slice(0, 1500);
await sleep(3000);
const posts = net.slice(before).filter((n) => n.method === 'POST');
writeFileSync(
  'docs/qa/evidence/_tmp-ci01-r3-debug-save.json',
  JSON.stringify({ ready, formSnap, toastText, bodySlice, posts, afterNet: net.slice(before) }, null, 2),
);
console.log(JSON.stringify({ ready, toastText, posts, afterNet: net.slice(before) }, null, 2));
await browser.close();
