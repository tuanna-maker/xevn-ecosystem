import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';

const CHROME =
  process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORTAL = 'http://127.0.0.1:5173';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(`${PORTAL}/login`, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.locator('[data-testid="portal-login-email"]').fill('ceo@xe.vn');
await page.locator('[data-testid="portal-login-password"]').fill('Xevn@2026');
await Promise.all([
  page.waitForResponse(
    (r) => r.url().includes('/auth/login') && r.request().method() === 'POST',
    { timeout: 20000 },
  ),
  page.locator('[data-testid="portal-login-submit"]').click(),
]);
await page.waitForURL((u) => !u.pathname.endsWith('/login'), { timeout: 25000 }).catch(() => null);
await sleep(1200);
const url = `${PORTAL}/command-center/hrm/recruitment?tab=interviews&companyId=main&tenantId=xevn&_qa=${Date.now()}`;
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
await sleep(5000);

const info = [];
const frames = [page, ...page.frames()];
for (let i = 0; i < frames.length; i++) {
  const f = frames[i];
  const name = i === 0 ? 'main' : String(f.url() || '').slice(0, 140);
  const body = (await f.locator('body').innerText().catch(() => '')).replace(/\s+/g, ' ').slice(0, 700);
  const tables = await f.locator('table').count().catch(() => 0);
  const rows = await f.locator('table tbody tr').count().catch(() => 0);
  const precision = await f.locator('[data-testid="rec-interviews-tab-precision"]').count().catch(() => 0);
  const links = await f
    .locator('a,button,[role="menuitem"]')
    .filter({ hasText: /Lịch phỏng vấn|Phỏng vấn|Interviews/i })
    .evaluateAll((els) =>
      els.slice(0, 12).map((el) => ({
        tag: el.tagName,
        text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60),
        href: el.getAttribute?.('href') || null,
      })),
    )
    .catch(() => []);
  info.push({ i, name, tables, rows, precision, links, body });
}
writeFileSync('docs/qa/evidence/_tmp-interview-select-probe.json', JSON.stringify(info, null, 2));
console.log(JSON.stringify(info, null, 2));
await browser.close();
