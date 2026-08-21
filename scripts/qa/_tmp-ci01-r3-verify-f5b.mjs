#!/usr/bin/env node
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';

const PORTAL = 'http://127.0.0.1:5173';
const EMP = 'QA W4E3 W4E3E1V7HA UPD';
const CODE_API = 'HD-29LK5';
const ID = 'e919267c-3d81-4bfa-b1d5-0b86353b86d2';
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
await sleep(4000);
await page.reload({ waitUntil: 'domcontentloaded' });
await sleep(5000);
const search = page.locator('input[placeholder*="Tìm"]').first();
if (await search.isVisible()) await search.fill('');
await sleep(800);
// search by employee name (mapApiContract overwrites contract_code display)
await search.fill(EMP.split(' ').slice(-1)[0] || EMP);
await sleep(1200);
let body = await page.locator('body').innerText();
const byEmpFrag = body.includes('W4E3E1V7HA') || body.includes(EMP);
await search.fill('');
await sleep(500);
await search.fill(EMP);
await sleep(1200);
body = await page.locator('body').innerText();
const byEmpFull = body.includes('W4E3E1V7HA') || body.includes(EMP);
const api = await page.evaluate(async ({ id, code }) => {
  const token = localStorage.getItem('xevn.portal.accessToken');
  const r = await fetch(
    `/api/hrm/contracts-insurance/contracts?company_id=main&page=1&page_size=100`,
    { headers: { Authorization: `Bearer ${token}`, 'x-company-id': 'main' } },
  );
  const j = await r.json();
  const rows = j.data ?? [];
  const arr = Array.isArray(rows) ? rows : [];
  const hit = arr.find((x) => x.id === id || x.contract_code === code);
  return {
    status: r.status,
    total: arr.length,
    hit: hit
      ? {
          id: hit.id,
          contract_code: hit.contract_code,
          employee_code: hit.employee_code,
          employee_name: hit.employee_name,
        }
      : null,
    displayCodes: arr.slice(0, 5).map((x) => ({
      api_code: x.contract_code,
      emp: x.employee_code,
      synthesized: x.employee_code ? `${x.employee_code}-HD` : null,
    })),
  };
}, { id: ID, code: CODE_API });

const out = { byEmpFrag, byEmpFull, api, CODE_API, EMP };
writeFileSync('docs/qa/evidence/_tmp-ci01-r3-verify-f5b.json', JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
await browser.close();
