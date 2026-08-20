#!/usr/bin/env node
/** GPS-first Network capture for PO-MFD-M2-ATT-CLOCK-01 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = 'http://127.0.0.1:5173';
const HRM = 'http://127.0.0.1:28001';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-mfd-m2-att-clock-01');
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-po-mfd-m2-att-clock-01-gps-only.json');
mkdirSync(SCREEN, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const posts = [];

async function login() {
  for (const password of ['Xevn@2026', 'xevn-uat-2026']) {
    const r = await fetch(`${HRM}/api/hrm/auth/mobile/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'uat.nv0007@xe.vn', password }),
    });
    const j = await r.json().catch(() => ({}));
    const d = j?.data ?? j;
    const token = d?.access_token ?? d?.accessToken;
    if (!token) continue;
    const mem = d.active_membership ?? d.memberships?.[0] ?? {};
    return {
      token,
      expiresAt: Date.now() + 8 * 3600e3,
      user: {
        userId: mem.employee_id || 'nv',
        email: 'uat.nv0007@xe.vn',
        displayName: mem.employee_name || 'NV',
        roles: ['employee'],
      },
    };
  }
  throw new Error('login fail');
}

const session = await login();
const browser = await chromium.launch({ headless: true, executablePath: CHROME });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  locale: 'vi-VN',
  geolocation: { latitude: 10, longitude: 10, accuracy: 12 },
  permissions: ['geolocation'],
});
const page = await context.newPage();
page.on('response', async (res) => {
  const u = res.url();
  if (!/\/api\/hrm\/attendance\/records/.test(u)) return;
  const method = res.request().method();
  if (method === 'OPTIONS') return;
  const e = {
    method,
    status: res.status(),
    url: u.replace(/^https?:\/\/[^/]+/, ''),
    xCompanyId: res.request().headers()['x-company-id'] || null,
  };
  if (method === 'POST') {
    try {
      const body = JSON.parse(res.request().postData() || '{}');
      e.bodyKeys = Object.keys(body);
      e.hasLatLon = body.latitude != null && body.longitude != null;
      e.company_id = body.company_id;
      e.employee_id = body.employee_id;
      e.latitude = body.latitude ?? null;
      e.longitude = body.longitude ?? null;
    } catch {
      /* */
    }
    try {
      const j = await res.json();
      e.code = j?.code || null;
      e.message = String(j?.message || '').slice(0, 120);
    } catch {
      /* */
    }
  }
  posts.push(e);
});
await page.addInitScript((s) => {
  const p = JSON.stringify(s.user);
  for (const store of [localStorage, sessionStorage]) {
    store.setItem('xevn.portal.accessToken', s.token);
    store.setItem('xevn.portal.tokenExpiresAt', String(s.expiresAt));
    store.setItem('xevn.portal.user', p);
    store.setItem('xevn.portal.tenantId', 'xevn');
    store.setItem('xevn.portal.companyId', 'trsport');
    store.setItem('hrm_portal_mode', '1');
    store.setItem('hrm_current_company_id', 'trsport');
    store.setItem('hrm_current_tenant_id', 'xevn');
  }
}, session);

await page.goto(
  `${PORTAL}/hr/attendance?portal=1&tenantId=xevn&companyId=trsport&_g=${Date.now()}`,
  { waitUntil: 'domcontentloaded', timeout: 60_000 },
);
await sleep(2500);
await page.locator('[data-testid="attendance-tab-clock-in"]').click();
await sleep(1000);
await page.locator('[data-testid="clock-in-method-gps"]').click();
await sleep(2000);
const combo = page.locator('[data-testid="clock-in-panel-gps"]').getByRole('combobox').first();
await combo.click();
await sleep(600);
const opts = page.locator('[role="option"]');
const n = await opts.count();
// Prefer index 1 to avoid already-checked-in UAT-0201 from prior run
const idx = n > 1 ? 1 : 0;
const label = await opts.nth(idx).innerText();
await opts.nth(idx).click();
await sleep(1000);
const cta = page
  .locator('[data-testid="clock-in-panel-gps"] button')
  .filter({ hasText: /Check-in|Chấm/i })
  .first();
const enabled = await cta.isEnabled().catch(() => false);
if (enabled) await cta.click();
await sleep(800);
if ((await page.locator('[role="dialog"]').count()) > 0) {
  const btns = page.locator('[role="dialog"] button');
  const bn = await btns.count();
  for (let i = 0; i < bn; i++) {
    const t = (await btns.nth(i).innerText()).trim();
    if (/Hủy|Cancel|Check-out/i.test(t)) continue;
    await btns.nth(i).click();
    break;
  }
}
await sleep(2500);
await page.screenshot({ path: join(SCREEN, '08-gps-first-attempt.png') });
const out = {
  empLabel: label.slice(0, 80),
  optionCount: n,
  ctaEnabled: enabled,
  posts,
  gpsText: (await page.locator('[data-testid="clock-in-panel-gps"]').innerText()).slice(0, 500),
};
writeFileSync(OUT, JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
await browser.close();
