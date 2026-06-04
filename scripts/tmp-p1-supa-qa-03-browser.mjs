#!/usr/bin/env node
/**
 * P1-SUPA-QA-03 — browser zero-54321 on P-CC-03..08 (local).
 * Usage: PORTAL_DEV_URL=http://127.0.0.1:5175 node scripts/tmp-p1-supa-qa-03-browser.mjs
 */
import { chromium } from 'playwright';

const BASE = (process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5175').replace(/\/+$/, '');
const EMAIL = 'ceo@xe.vn';
const PASSWORD = 'Xevn@2026';
const BAD_RE = /54321|supabase\.co|rest\/v1/i;

const ROUTES = [
  { id: 'P-CC-03', path: '/command-center/hrm/employees?companyId=main' },
  { id: 'P-CC-04', path: '/command-center/hrm/contracts?companyId=main' },
  { id: 'P-CC-05', path: '/command-center/hrm/insurance?companyId=main' },
  { id: 'P-CC-06', path: '/command-center/hrm/recruitment?companyId=main' },
  { id: 'P-CC-07', path: '/command-center/hrm/attendance?companyId=main' },
  { id: 'P-CC-08', path: '/command-center/hrm/payroll?companyId=main' },
];

function countBad(page) {
  return page.evaluate((reSource) => {
    const re = new RegExp(reSource, 'i');
    const entries = performance.getEntriesByType('resource');
    const bad = entries.filter((e) => re.test(e.name));
    return { total: entries.length, badCount: bad.length, badUrls: bad.map((e) => e.name).slice(0, 5) };
  }, BAD_RE.source);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  let fails = 0;

  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.fill('input[type="email"], input[name="email"]', EMAIL);
  await page.fill('input[type="password"], input[name="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(4000);

  console.log(`Browser network policy — ${BASE}\n`);

  for (const { id, path } of ROUTES) {
    await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(6000);
    const { total, badCount, badUrls } = await countBad(page);
    const pass = badCount === 0;
    if (!pass) fails += 1;
    console.log(
      `${pass ? 'PASS' : 'FAIL'}  ${id}  bad=${badCount}/${total}${badUrls.length ? `  sample=${badUrls[0]}` : ''}`,
    );
  }

  await browser.close();
  console.log(`\n=== Browser summary: ${fails ? 'FAIL' : 'PASS'} (${ROUTES.length - fails}/${ROUTES.length} routes clean) ===`);
  process.exit(fails ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
