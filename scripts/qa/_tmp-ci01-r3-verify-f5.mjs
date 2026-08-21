#!/usr/bin/env node
/** Verify HD-29LK5 present after F5 (no broken search) */
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';

const PORTAL = 'http://127.0.0.1:5173';
const CODE = process.env.CI01_CODE || 'HD-29LK5';
const ID = process.env.CI01_ID || 'e919267c-3d81-4bfa-b1d5-0b86353b86d2';
const CHROME =
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
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
await page.goto(`${PORTAL}/hr/contracts?portal=1&tenantId=xevn&companyId=main`, {
  waitUntil: 'domcontentloaded',
  timeout: 90000,
});
await sleep(5000);
await page.reload({ waitUntil: 'domcontentloaded' });
await sleep(5000);
// clear search if any
const search = page.locator('input[placeholder*="Tìm"]').first();
if (await search.isVisible().catch(() => false)) {
  await search.fill('');
  await sleep(1000);
}
let body = await page.locator('body').innerText();
let found = body.includes(CODE);
// next page if pagination
if (!found) {
  const next = page.getByRole('button').filter({ has: page.locator('svg') }).last();
  // click chevron right near pagination
  const nextBtn = page.locator('button').filter({ hasText: '' }).nth(0);
  await page.locator('button:has(svg.lucide-chevron-right), button:has(.lucide-chevron-right)').last().click({ force: true }).catch(() => {});
  await sleep(1500);
  body = await page.locator('body').innerText();
  found = body.includes(CODE);
}
// API probe via page token
const api = await page.evaluate(async ({ code, id }) => {
  const token = localStorage.getItem('xevn.portal.accessToken');
  const r = await fetch(`/api/hrm/contracts-insurance/contracts?company_id=main&page=1&page_size=100`, {
    headers: { Authorization: `Bearer ${token}`, 'x-company-id': 'main' },
  });
  const j = await r.json();
  const rows = j.data?.items || j.data?.data || j.data || [];
  const list = Array.isArray(rows) ? rows : rows.items || [];
  const hit = list.find((x) => x.contract_code === code || x.id === id);
  return { status: r.status, code: j.code, total: list.length, hit: hit ? { id: hit.id, contract_code: hit.contract_code } : null };
}, { code: CODE, id: ID });

writeFileSync(
  'docs/qa/evidence/_tmp-ci01-r3-verify-f5.json',
  JSON.stringify({ CODE, foundOnUi: found, bodyHas: body.includes(CODE), api, bodySlice: body.slice(0, 800) }, null, 2),
);
console.log(JSON.stringify({ foundOnUi: found, api }, null, 2));
await browser.close();
