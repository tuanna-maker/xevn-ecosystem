#!/usr/bin/env node
/** GPS lat/lon Network wire retest — PO-HRM-UI-BRAND-W3-ATT-A-QA exit#3 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = 'http://127.0.0.1:5173';
const EMAIL = 'ceo@xe.vn';
const PASSWORD = 'Xevn@2026';
const COMPANY = 'main';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-ui-brand-w3-att-a-qa-gps-wire.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-ui-brand-w3-att-a-qa');
mkdirSync(SCREEN, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const posts = [];
const requests = [];

async function login() {
  const r = await fetch(`${PORTAL}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const j = await r.json().catch(() => ({}));
  const d = j?.data ?? j;
  const token = d?.accessToken ?? d?.access_token;
  if (!token) throw new Error('login fail');
  const u = d?.user ?? {};
  return {
    token,
    expiresAt: Date.now() + 8 * 3600e3,
    companyId: COMPANY,
    user: {
      userId: u.userId || u.id || EMAIL,
      email: EMAIL,
      displayName: u.displayName || EMAIL,
      roles: u.roles || ['group_ceo'],
    },
  };
}

const session = await login();
const browser = await chromium.launch({ headless: true, executablePath: CHROME });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  locale: 'vi-VN',
  geolocation: { latitude: 21.028511, longitude: 105.804817, accuracy: 10 },
  permissions: ['geolocation'],
});
const page = await context.newPage();

page.on('request', (req) => {
  const u = req.url();
  if (req.method() === 'POST' && /\/attendance\/records/.test(u)) {
    let body = {};
    try {
      body = JSON.parse(req.postData() || '{}');
    } catch {
      /* */
    }
    requests.push({
      url: u.replace(/^https?:\/\/[^/]+/, ''),
      hasLatLon: body.latitude != null && body.longitude != null,
      latitude: body.latitude ?? null,
      longitude: body.longitude ?? null,
      bodyKeys: Object.keys(body),
    });
  }
});
page.on('response', async (res) => {
  const u = res.url();
  if (res.request().method() !== 'POST' || !/\/attendance\/records/.test(u)) return;
  let body = {};
  try {
    body = JSON.parse(res.request().postData() || '{}');
  } catch {
    /* */
  }
  let code = null;
  try {
    const j = await res.json();
    code = j?.code || null;
  } catch {
    /* */
  }
  posts.push({
    status: res.status(),
    code,
    hasLatLon: body.latitude != null && body.longitude != null,
    latitude: body.latitude ?? null,
    longitude: body.longitude ?? null,
  });
});

await page.addInitScript((s) => {
  const p = JSON.stringify(s.user);
  for (const store of [localStorage, sessionStorage]) {
    store.setItem('xevn.portal.accessToken', s.token);
    store.setItem('xevn.portal.tokenExpiresAt', String(s.expiresAt));
    store.setItem('xevn.portal.user', p);
    store.setItem('xevn.portal.tenantId', 'xevn');
    store.setItem('xevn.portal.companyId', s.companyId);
    store.setItem('hrm_portal_mode', '1');
    store.setItem('hrm_current_company_id', s.companyId);
    store.setItem('hrm_current_tenant_id', 'xevn');
  }
}, session);

await page.goto(
  `${PORTAL}/hr/attendance?portal=1&tenantId=xevn&companyId=main&_g=${Date.now()}`,
  { waitUntil: 'domcontentloaded', timeout: 60_000 },
);
await sleep(2500);
await page.locator('[data-testid="attendance-tab-clock-in"]').click().catch(async () => {
  await page.getByRole('tab', { name: /Chấm công/i }).first().click().catch(() => {});
});
await sleep(1200);
await page.locator('[data-testid="clock-in-method-gps"]').click();
await sleep(2500);

const attempts = [];
const combo = page.locator('[data-testid="clock-in-panel-gps"]').getByRole('combobox').first();
await combo.click();
await sleep(600);
const optCount = await page.locator('[role="option"]').count();
await page.keyboard.press('Escape');
await sleep(300);

const maxTry = Math.min(optCount, 3);
for (let i = 0; i < maxTry; i++) {
  await combo.click();
  await sleep(400);
  const opts = page.locator('[role="option"]');
  const n = await opts.count();
  if (i >= n) break;
  const label = (await opts.nth(i).innerText()).trim().slice(0, 80);
  await opts.nth(i).click();
  await sleep(1000);

  const openBtn = page.locator('[data-testid="clock-in-gps-open-confirm"]');
  const enabled = await openBtn.isEnabled().catch(() => false);
  if (!enabled) {
    attempts.push({ i, label, openEnabled: false });
    continue;
  }
  await openBtn.click();
  await sleep(700);
  const dlg = page.locator('[data-testid="clock-in-gps-confirm-dialog"]');
  const dlgOk = await dlg.isVisible().catch(() => false);
  if (!dlgOk) {
    attempts.push({ i, label, openEnabled: true, dialog: false });
    continue;
  }

  const btnTexts = await dlg.locator('button').evaluateAll((btns) =>
    btns.map((b) => (b.textContent || '').trim().slice(0, 60)),
  );
  // i18n may leak key `gpsAttendance.checkIn` on VI locale — match key OR translated label
  let clicked = false;
  const candidates = [
    dlg.getByRole('button', { name: /gpsAttendance\.checkIn/i }),
    dlg.getByRole('button', { name: /^Check-in$/i }),
    dlg.getByRole('button', { name: /Chấm công$/i }),
    dlg.locator('button').filter({ hasText: /gpsAttendance\.checkIn|Check-in|^Chấm công$/i }),
  ];
  for (const c of candidates) {
    if ((await c.count()) > 0 && (await c.first().isVisible().catch(() => false))) {
      const before = requests.length;
      await c.first().click();
      clicked = true;
      await sleep(3500);
      attempts.push({
        i,
        label,
        openEnabled: true,
        dialog: true,
        btnTexts,
        clicked: true,
        postsAfter: posts.slice(),
        requestsAfter: requests.slice(before),
      });
      break;
    }
  }
  if (!clicked) {
    attempts.push({ i, label, openEnabled: true, dialog: true, btnTexts, clicked: false });
    await page.keyboard.press('Escape');
    await sleep(400);
    continue;
  }
  if (requests.some((r) => r.hasLatLon) || posts.some((p) => p.hasLatLon)) break;
  // dialog may have closed; continue if no latlon
  await page.keyboard.press('Escape').catch(() => {});
  await sleep(400);
}

await page.screenshot({ path: join(SCREEN, '07-gps-wire-retest.png') });
const out = {
  optCount,
  attempts,
  requests,
  posts,
  pass: requests.some((r) => r.hasLatLon) || posts.some((p) => p.hasLatLon),
};
writeFileSync(OUT, JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
await browser.close();
process.exit(out.pass ? 0 : 1);
