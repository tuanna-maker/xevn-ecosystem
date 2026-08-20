#!/usr/bin/env node
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-e2e-link-pay-hire-qa-03');
mkdirSync(SCREEN, { recursive: true });

const portal = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5175';
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const errors = [];
const browser = await chromium.launch({ headless: true, executablePath: CHROME });
const page = await browser.newPage();
page.on('pageerror', (e) => errors.push(`page:${e.message}`));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(`console:${m.text()}`);
});

const XBOS = process.env.XBOS_HOST_API || 'http://127.0.0.1:28002';

async function loginApi() {
  for (const url of [`${portal}/api/xbos/auth/login`, `${XBOS}/api/xbos/auth/login`]) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: 'ceo@xe.vn', password: 'Xevn@2026' }),
      });
      const j = await r.json().catch(() => ({}));
      const data = j?.data ?? j;
      const token = data?.accessToken ?? data?.access_token;
      if (token) return token;
    } catch {
      /* */
    }
  }
  throw new Error('login failed');
}

const token = await loginApi();

await page.addInitScript((s) => {
  const user = { userId: 'ceo@xe.vn', email: 'ceo@xe.vn', displayName: 'CEO', roles: ['group_ceo'] };
  const payload = JSON.stringify(user);
  for (const store of [localStorage, sessionStorage]) {
    store.setItem('xevn.portal.accessToken', s);
    store.setItem('xevn.portal.tokenExpiresAt', String(Date.now() + 8 * 3600_000));
    store.setItem('xevn.portal.user', payload);
    store.setItem('xevn.portal.tenantId', 'xevn');
    store.setItem('xevn.portal.companyId', 'main');
    store.setItem('hrm_portal_mode', '1');
    store.setItem('hrm_current_company_id', 'main');
    store.setItem('hrm_current_tenant_id', 'xevn');
  }
}, token);

await page.goto(`${portal}/hr/payroll?portal=1&tenantId=xevn&companyId=main`, {
  waitUntil: 'domcontentloaded',
  timeout: 45_000,
});
await page.waitForTimeout(5000);
try {
  await page.locator('[data-testid="pay-batches-precision"]').waitFor({ state: 'visible', timeout: 15_000 });
} catch {
  console.log('batches tab wait timeout');
}

await page.screenshot({ path: `${SCREEN}/debug-01-before-click.png`, fullPage: true });

const btn = page.locator('button').filter({ hasText: /^Lập bảng lương$/ }).first();
console.log('btn visible:', await btn.isVisible().catch(() => false));
console.log('batches tab:', await page.locator('[data-testid="pay-batches-precision"]').isVisible().catch(() => false));

await btn.scrollIntoViewIfNeeded();
await btn.click({ force: true, timeout: 15_000 });
await page.waitForTimeout(4000);

const dlg = page.locator('[data-testid="pay-batch-create-dialog-precision"]');
const dlgVisible = await dlg.isVisible().catch(() => false);
const anyDialog = await page.locator('[role="dialog"]').count();
const selectErr = errors.some((e) => /Select\.Item/i.test(e));
const dlgTitle = dlgVisible ? await dlg.locator('h2, [role="dialog"]').first().textContent().catch(() => '') : null;

console.log('dialog visible:', dlgVisible);
console.log('any role=dialog count:', anyDialog);
console.log('select error:', selectErr);
console.log('dialog title:', dlgTitle);
console.log('errors:', errors.slice(0, 8));

await page.screenshot({ path: `${SCREEN}/debug-02-after-click.png`, fullPage: true });
await browser.close();
