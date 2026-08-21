#!/usr/bin/env node
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';

const PORTAL = 'http://127.0.0.1:5173';
const CHROME =
  process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const EMAIL = 'ceo@xe.vn';
const PASSWORD = 'Xevn@2026';
const COMPANY = 'main';
const TENANT = 'xevn';
const stamp = `O4${Date.now().toString(36).toUpperCase().slice(-5)}`;
const TITLE = `QA O4 WARN ${stamp}`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const lr = await fetch(`${PORTAL}/api/xbos/auth/login`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
});
const j = await lr.json();
const data = j?.data ?? j;
const token = data.accessToken || data.access_token;
const session = {
  token,
  expiresAt: Date.now() + 8 * 3600e3,
  companyId: COMPANY,
  user: { userId: EMAIL, email: EMAIL, displayName: EMAIL, roles: ['group_ceo'] },
  raw: data,
};

const browser = await chromium.launch({
  headless: true,
  executablePath: CHROME,
  args: ['--disable-dev-shm-usage'],
});
const page = await (
  await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'vi-VN' })
).newPage();
const net = [];
page.on('response', (res) => {
  const u = res.url();
  if (/recruitment-plans/.test(u)) {
    net.push({
      m: res.request().method(),
      s: res.status(),
      u: u.replace(/^https?:\/\/[^/]+/, ''),
    });
  }
});
await page.addInitScript((s) => {
  const payload = JSON.stringify(s.user);
  for (const store of [localStorage, sessionStorage]) {
    store.setItem('xevn.portal.accessToken', s.token);
    store.setItem('xevn.portal.tokenExpiresAt', String(s.expiresAt));
    store.setItem('xevn.portal.user', payload);
    store.setItem('xevn.portal.tenantId', 'xevn');
    store.setItem('xevn.portal.companyId', s.companyId);
    store.setItem('hrm_portal_mode', '1');
    store.setItem('hrm_current_company_id', s.companyId);
    store.setItem('hrm_current_tenant_id', 'xevn');
  }
}, session);

const url = `${PORTAL}/hr/recruitment?portal=1&tenantId=${TENANT}&companyId=${COMPANY}&tab=plans&_=${Date.now()}`;
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
await sleep(3000);
await page.getByTestId('rec-hc-create-plan-btn').click();
await sleep(1000);
await page
  .locator('[role=dialog] input')
  .filter({ hasNot: page.locator('[type=number]') })
  .first()
  .fill(TITLE);
await page.locator('input[aria-label="Cần tuyển tháng 8"]').first().fill('5');
const combos = page.locator('[data-testid=rec-hc-plan-grid] [role=combobox]');
for (let i = 0; i < Math.min(await combos.count(), 2); i++) {
  await combos.nth(i).focus();
  await combos.nth(i).press('Enter');
  await sleep(300);
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await sleep(250);
}
try {
  await page.locator('input[aria-label="Cần tuyển tháng 8"]').first().fill('5');
} catch {
  /* */
}
await page.getByTestId('rec-hc-save-plan-btn').click({ force: true });
await sleep(2500);
await page.getByText(TITLE, { exact: false }).first().click();
await sleep(1200);
const approve = page.getByTestId('rec-hc-approve-plan-btn');
const present = await approve.count();
let toast = '';
let apNet = null;
if (present) {
  await approve.click();
  await sleep(2000);
  toast = (
    (await page
      .locator('[data-sonner-toast], [role=status], li[data-type]')
      .allInnerTexts()
      .catch(() => [])) || []
  ).join(' | ');
  apNet = net.filter((n) => n.m === 'PATCH' && /status/.test(n.u)).slice(-1)[0] || null;
}
const body = (await page.locator('body').innerText()) || '';
const over = /vượt|Cảnh báo vượt/i.test(toast + body);
const locked = await page.locator('[title*="đã khóa sau duyệt"]').count();
const out = {
  stamp,
  present,
  apNet,
  toast: toast.slice(0, 240),
  over,
  locked,
  statusApproved: /Đã duyệt|approved/i.test(body),
};
writeFileSync(
  'docs/qa/evidence/_tmp-po-hrm-mvp-gd1-rec-01-cluster-qa-01-o4.json',
  JSON.stringify(out, null, 2),
);
console.log(JSON.stringify(out, null, 2));
await browser.close();
