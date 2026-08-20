#!/usr/bin/env node
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = 'http://127.0.0.1:5173';
const CHROME =
  process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-probe-dialog-geom.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-ui-login-logo-dialog-center-01');
mkdirSync(SCREEN, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function measureIn(host) {
  return host.evaluate(() => {
    const sels = [
      '.xevn-dialog-surface',
      '[data-testid="rec-job-create-edit-dialog-precision"]',
      '[role="dialog"]',
    ];
    const seen = new Set();
    const els = [];
    for (const sel of sels) {
      document.querySelectorAll(sel).forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        els.push(el);
      });
    }
    return {
      href: location.href,
      count: els.length,
      els: els.slice(0, 10).map((el) => {
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return {
          testid: el.getAttribute('data-testid'),
          role: el.getAttribute('role'),
          state: el.getAttribute('data-state'),
          position: cs.position,
          overflowY: cs.overflowY,
          maxHeight: cs.maxHeight,
          topCss: cs.top,
          bottomCss: cs.bottom,
          margin: cs.margin,
          transform: cs.transform,
          zIndex: cs.zIndex,
          rect: {
            top: r.top,
            bottom: r.bottom,
            height: r.height,
            width: r.width,
            left: r.left,
          },
          class: String(el.className).slice(0, 240),
        };
      }),
    };
  });
}

const browser = await chromium.launch({ headless: true, executablePath: CHROME });
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();

await page.goto(`${PORTAL}/login`, { waitUntil: 'networkidle', timeout: 45000 });
await page.evaluate(() => {
  localStorage.clear();
  sessionStorage.clear();
});
await page.goto(`${PORTAL}/login`, { waitUntil: 'networkidle' });
await page.fill('[data-testid="portal-login-email"]', 'ceo@xe.vn');
await page.fill('[data-testid="portal-login-password"]', 'Xevn@2026');
await Promise.all([
  page.waitForResponse((r) => r.url().includes('/auth/login') && r.request().method() === 'POST'),
  page.click('[data-testid="portal-login-submit"]'),
]);
await page.waitForURL((u) => !u.pathname.endsWith('/login'), { timeout: 25000 });
await page.goto(`${PORTAL}/command-center/hrm/recruitment?companyId=main&tenantId=xevn`, {
  waitUntil: 'domcontentloaded',
  timeout: 60000,
});
await sleep(4500);

for (const frame of page.frames()) {
  const tab = frame
    .locator('button, [role="tab"]')
    .filter({ hasText: /Tin\s*Tuyển\s*dụng|Tin tuyển dụng/i })
    .first();
  if (await tab.isVisible().catch(() => false)) {
    await tab.click({ force: true });
    break;
  }
}
await sleep(2500);

for (const frame of page.frames()) {
  const root = frame.locator('[data-testid="rec-jobs-tab-precision"]');
  if (await root.isVisible().catch(() => false)) {
    const btn = root.getByRole('button', { name: /Tạo tin tuyển dụng/i }).first();
    await btn.click({ force: true });
    break;
  }
}
await sleep(2500);

const dump = { parent: await measureIn(page), frames: [] };
for (const frame of page.frames()) {
  dump.frames.push(await measureIn(frame));
}
writeFileSync(OUT, JSON.stringify(dump, null, 2));
await page.screenshot({ path: resolve(SCREEN, '04c-all-frames.png') });
console.log(JSON.stringify(dump, null, 2));
await browser.close();
