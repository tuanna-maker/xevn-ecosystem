#!/usr/bin/env node
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';

const PORTAL = 'http://127.0.0.1:5173';
const HRM = 'http://127.0.0.1:28001';
const XBOS = 'http://127.0.0.1:28002';
const CHROME =
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const reqs = [];
const resps = [];

async function apiLogin() {
  for (const base of [XBOS, PORTAL]) {
    try {
      const r = await fetch(`${base}/api/xbos/auth/login`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: 'ceo@xe.vn', password: 'Xevn@2026' }),
        signal: AbortSignal.timeout(15000),
      });
      const text = await r.text();
      let j = {};
      try {
        j = JSON.parse(text);
      } catch {
        /* */
      }
      const d = j.data || j;
      const token = d.accessToken || d.access_token;
      console.log('login via', base, r.status, j.code, Boolean(token), text.slice(0, 120));
      if (token) return token;
    } catch (e) {
      console.log('login err', base, e.message);
    }
  }
  return null;
}

const token = await apiLogin();
if (token) {
  for (const path of [
    '/api/hrm/employees?company_id=main&page=1&page_size=5',
    '/api/hrm/contracts-insurance/contracts?company_id=main&page=1&page_size=5',
  ]) {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 20000);
    try {
      const r = await fetch(`${HRM}${path}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'x-company-id': 'main',
          'x-tenant-id': 'xevn',
        },
        signal: controller.signal,
      });
      const text = await r.text();
      console.log('direct', r.status, path, text.slice(0, 180));
    } catch (e) {
      console.log('direct FAIL', path, e.message);
    } finally {
      clearTimeout(t);
    }
  }
}

const browser = await chromium.launch({
  headless: true,
  executablePath: CHROME,
  args: ['--disable-dev-shm-usage'],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('request', (req) => {
  const u = req.url();
  if (/contracts|employees/.test(u) && req.method() !== 'OPTIONS') {
    reqs.push({ method: req.method(), url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 220), at: Date.now() });
  }
});
page.on('response', async (res) => {
  const u = res.url();
  if (!/contracts|employees/.test(u)) return;
  if (res.request().method() === 'OPTIONS') return;
  resps.push({
    method: res.request().method(),
    status: res.status(),
    url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 220),
    at: Date.now(),
  });
});
page.on('requestfailed', (req) => {
  const u = req.url();
  if (/contracts|employees/.test(u)) {
    reqs.push({
      method: req.method(),
      url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 220),
      failed: req.failure()?.errorText,
    });
  }
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
await page.goto(`${PORTAL}/hr/contracts?portal=1&tenantId=xevn&companyId=main`, {
  waitUntil: 'domcontentloaded',
  timeout: 90000,
});
await sleep(7000);
await page.getByTestId('hdsd-contracts-create-btn').click();
await page.getByTestId('hdsd-contracts-form-dialog').waitFor({ state: 'visible', timeout: 25000 });
await sleep(2500);
const ready = await page.getByTestId('hdsd-contracts-form-ready').isVisible().catch(() => false);
console.log('formReady', ready);
const n0 = reqs.length;
await page.getByTestId('hdsd-contracts-form-submit').click();
await sleep(12000);
const btn = await page.getByTestId('hdsd-contracts-form-submit').innerText().catch(() => '');
const toastText = await page.locator('[data-sonner-toast]').allInnerTexts().catch(() => []);
const postReqs = reqs.slice(n0).filter((r) => r.method === 'POST');
const postResps = resps.filter((r) => r.method === 'POST');
writeFileSync(
  'docs/qa/evidence/_tmp-ci01-r3-debug-hang.json',
  JSON.stringify({ ready, btn, toastText, postReqs, postResps, reqs: reqs.slice(-20), resps: resps.slice(-20) }, null, 2),
);
console.log(JSON.stringify({ ready, btn, toastText, postReqs, postResps }, null, 2));
await browser.close();
