#!/usr/bin/env node
import { chromium } from 'playwright';

const CHROME =
  process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const XBOS = 'http://127.0.0.1:28002';
const r = await fetch(`${XBOS}/api/xbos/auth/login`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ email: 'ceo@xe.vn', password: 'Xevn@2026' }),
});
const j = await r.json();
const data = j?.data ?? j;
const token = data.accessToken || data.access_token;
const user = {
  userId: data.user?.userId || 'ceo',
  email: 'ceo@xe.vn',
  roles: ['group_ceo'],
};

const browser = await chromium.launch({ headless: true, executablePath: CHROME });
const page = await browser.newPage();
await page.addInitScript(
  ({ token, user }) => {
    const payload = JSON.stringify(user);
    for (const store of [localStorage, sessionStorage]) {
      store.setItem('xevn.portal.accessToken', token);
      store.setItem('xevn.portal.tokenExpiresAt', String(Date.now() + 8 * 3600e3));
      store.setItem('xevn.portal.user', payload);
      store.setItem('xevn.portal.tenantId', 'xevn');
      store.setItem('xevn.portal.companyId', 'main');
      store.setItem('hrm_current_company_id', 'main');
      store.setItem('access_token', token);
      store.setItem('hrm_portal_mode', '1');
    }
  },
  { token, user },
);

await page.goto(
  `http://127.0.0.1:5173/hr/recruitment?portal=1&tenantId=xevn&companyId=main&tab=jobs&_qa=${Date.now()}`,
  { waitUntil: 'domcontentloaded', timeout: 60_000 },
);
await page.waitForTimeout(3500);

const info = await page.evaluate(() => {
  const root = document.querySelector('[data-testid="rec-jobs-tab-precision"]');
  if (!root) return { root: false };
  const rows = root.querySelectorAll('tbody tr').length;
  const lucideTrash = root.querySelectorAll('svg.lucide-trash-2').length;
  const destructive = root.querySelectorAll('.text-destructive').length;
  const btns = Array.from(root.querySelectorAll('button')).map((b) => ({
    title: b.getAttribute('title') || '',
    aria: b.getAttribute('aria-label') || '',
    cls: (b.className || '').toString().slice(0, 80),
    hasTrashSvg: !!b.querySelector('svg.lucide-trash-2'),
    hasDestructive: !!b.querySelector('.text-destructive'),
  }));
  return {
    root: true,
    rows,
    lucideTrash,
    destructive,
    trashBtns: btns.filter((b) => b.hasTrashSvg || b.hasDestructive || /xóa|delete/i.test(b.title + b.aria)),
    text: (root.innerText || '').slice(0, 400),
  };
});
console.log(JSON.stringify(info, null, 2));

// Try click first trash svg parent button
const trashSvg = page.locator('[data-testid="rec-jobs-tab-precision"] svg.lucide-trash-2').first();
if (await trashSvg.count()) {
  await trashSvg.click({ force: true });
  await page.waitForTimeout(800);
  const alertVisible = await page.locator('[role="alertdialog"]').isVisible().catch(() => false);
  const wm = await page.evaluate(() => {
    const el =
      document.querySelector('[data-testid="xevn-alert-dialog-wordmark"]') ||
      document.querySelector('[role="alertdialog"] .xevn-dialog-wordmark');
    if (!el) return null;
    return getComputedStyle(el).backgroundColor;
  });
  console.log(JSON.stringify({ alertVisible, wm }));
  if (alertVisible) {
    await page.getByRole('button', { name: /Hủy|Cancel/i }).first().click().catch(() => null);
  }
}

await browser.close();
