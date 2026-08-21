#!/usr/bin/env node
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-uat-ctr-01');
mkdirSync(SCREEN, { recursive: true });

const login = await fetch(`${PORTAL}/api/xbos/auth/login`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ email: 'ceo@xe.vn', password: 'Xevn@2026' }),
});
const j = await login.json();
const d = j.data || j;
const token = d.accessToken || d.access_token;
if (!token) throw new Error('login fail');

const browser = await chromium.launch({ headless: true, executablePath: CHROME });
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await page.addInitScript((s) => {
  for (const store of [localStorage, sessionStorage]) {
    store.setItem('xevn.portal.accessToken', s.token);
    store.setItem('xevn.portal.tokenExpiresAt', String(Date.now() + 8e6));
    store.setItem(
      'xevn.portal.user',
      JSON.stringify({ email: 'ceo@xe.vn', roles: ['group_ceo'] }),
    );
    store.setItem('xevn.portal.tenantId', 'xevn');
    store.setItem('xevn.portal.companyId', 'main');
    store.setItem('hrm_portal_mode', '1');
    store.setItem('hrm_current_company_id', 'main');
  }
}, { token });

await page.goto(
  `${PORTAL}/hr/settings?portal=1&tenantId=xevn&companyId=main&tab=contract-legal&_=${Date.now()}`,
  { waitUntil: 'domcontentloaded', timeout: 90000 },
);
await page.waitForTimeout(2500);
const tab = page.getByTestId('settings-tab-contract-legal');
if (await tab.isVisible()) await tab.click();
await page.waitForTimeout(1500);
await page.getByTestId('ctr-legal-tab-templates').click();
await page.waitForTimeout(1500);

// Select GENERAL pack if present
const pack = page.getByTestId('ctr-tpl-pack');
if (await pack.isVisible().catch(() => false)) {
  await pack.click({ force: true });
  await page.waitForTimeout(400);
  const opt = page.getByRole('option').filter({ hasText: /GENERAL|Chung/i }).first();
  if (await opt.isVisible().catch(() => false)) await opt.click({ force: true });
  else await page.keyboard.press('Escape');
  await page.waitForTimeout(800);
}

const palette = page.getByTestId('ctr-tpl-palette');
const info = {
  paletteVisible: await palette.isVisible().catch(() => false),
  paletteText: (await palette.innerText().catch(() => '')).slice(0, 500),
  rbd: await palette.locator('[data-rbd-draggable-id]').count().catch(() => 0),
  rfd: await palette.locator('[data-rfd-draggable-id]').count().catch(() => 0),
  grab: await palette.locator('.cursor-grab').count().catch(() => 0),
  dragHandle: await palette.locator('[data-rbd-drag-handle-draggable-id]').count().catch(() => 0),
  canvasItems: await page.locator('[data-testid^="ctr-tpl-canvas-item-"]').count().catch(() => 0),
};
console.log(JSON.stringify(info, null, 2));
await page.screenshot({ path: resolve(SCREEN, 'dnd-probe.png') });

// Try drag if grab exists
if (info.grab > 0) {
  const src = palette.locator('.cursor-grab').first();
  const canvas = page.getByTestId('ctr-tpl-canvas');
  const box = await src.boundingBox();
  const cbox = await canvas.boundingBox();
  if (box && cbox) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(100);
    await page.mouse.move(cbox.x + cbox.width / 2, cbox.y + 60, { steps: 25 });
    await page.waitForTimeout(100);
    await page.mouse.up();
    await page.waitForTimeout(800);
  }
  const after = await page.locator('[data-testid^="ctr-tpl-canvas-item-"]').count();
  console.log(JSON.stringify({ afterDragCanvasItems: after }, null, 2));
  await page.screenshot({ path: resolve(SCREEN, 'dnd-probe-after.png') });
}

await browser.close();
