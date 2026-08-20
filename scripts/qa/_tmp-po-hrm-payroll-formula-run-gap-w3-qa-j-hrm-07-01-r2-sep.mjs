#!/usr/bin/env node
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, join } from 'node:path';

const PORTAL = 'http://127.0.0.1:5173';
const HRM = 'http://127.0.0.1:28001';
const XBOS = 'http://127.0.0.1:28002';
const PERIOD = 'd92d3bbb-f53a-4151-9b12-0ebe9dd27d25';
const MONTH = 9;
const YEAR = 2026;
const CHROME =
  process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCREEN = resolve('docs/qa/evidence/screens/po-hrm-payroll-formula-run-gap-w3-qa-j-hrm-07-01-r2');
mkdirSync(SCREEN, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const R = {
  stamp: `PAYW3J07-R2SEP-${Date.now().toString(36).toUpperCase()}`,
  network: [],
  pageErrors: [],
  tdz: [],
  criteria: {},
  pay: {},
  payslip: {},
};
const q = (p) => {
  const u = new URL(p, PORTAL);
  u.searchParams.set('portal', '1');
  u.searchParams.set('tenantId', 'xevn');
  u.searchParams.set('companyId', 'main');
  return u.toString();
};

const lr = await fetch(`${XBOS}/api/xbos/auth/login`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ email: 'ceo@xe.vn', password: 'Xevn@2026' }),
});
const token = (await lr.json())?.data?.accessToken;
const session = {
  token,
  expiresAt: Date.now() + 8 * 3600e3,
  companyId: 'main',
  user: { userId: 'ceo', email: 'ceo@xe.vn', displayName: 'CEO', roles: ['group_ceo'] },
};

const browser = await chromium.launch({ headless: true, executablePath: CHROME });
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
page.on('pageerror', (e) => {
  const s = String(e);
  R.pageErrors.push(s.slice(0, 200));
  if (/showAddDialog/i.test(s)) R.tdz.push(s);
});
page.on('response', async (res) => {
  const u = res.url();
  if (!/\/api\/hrm\/payroll\//.test(u)) return;
  const e = { method: res.request().method(), status: res.status(), url: u.slice(0, 220), code: null };
  try {
    e.code = (await res.json())?.code || null;
  } catch {
    /* */
  }
  R.network.push(e);
});
await page.addInitScript(
  ({ s }) => {
    const p = JSON.stringify(s.user);
    for (const st of [localStorage, sessionStorage]) {
      st.setItem('xevn.portal.accessToken', s.token);
      st.setItem('xevn.portal.tokenExpiresAt', String(s.expiresAt));
      st.setItem('xevn.portal.user', p);
      st.setItem('xevn.portal.tenantId', 'xevn');
      st.setItem('xevn.portal.companyId', s.companyId);
      st.setItem('hrm_current_company_id', s.companyId);
      st.setItem('access_token', s.token);
      st.setItem('hrm_portal_mode', '1');
    }
  },
  { s: session },
);

await page.goto(q('/hr/payroll'), { waitUntil: 'domcontentloaded', timeout: 90_000 });
await sleep(2500);
const calc = page.locator('[data-testid="payroll-tab-calculate"]');
if (await calc.isVisible().catch(() => false)) await calc.click();
const mi = page.getByRole('menuitem', { name: /Danh sách bảng lương/i }).first();
if (await mi.isVisible().catch(() => false)) await mi.click();
await sleep(1500);
await page.locator('[data-testid="pay-batches-precision"]').waitFor({ state: 'visible', timeout: 25_000 });
R.criteria.load = 'PASS';
R.criteria.tdz = R.tdz.length ? 'FAIL' : 'PASS';

await page.locator('[data-testid="pay-batch-period-filter"]').click({ force: true });
await sleep(400);
const opt = page.locator(`[data-testid="pay-batch-period-option-${MONTH}-${YEAR}"]`);
if (await opt.isVisible().catch(() => false)) await opt.click();
else await page.getByRole('option', { name: `Tháng ${MONTH}/${YEAR}`, exact: true }).click();
await sleep(2000);
await page.locator(`[data-testid="pay-batch-row-${PERIOD}"]`).click({ timeout: 12_000 });
await sleep(3000);

const add = page.locator('[data-testid="pay-batch-add-emp-btn"]');
R.pay.addVisible = await add.isVisible().catch(() => false);
if (R.pay.addVisible) {
  await add.click();
  await sleep(1200);
  const dlg = page.locator('[data-testid="pay-batch-add-emp-dialog-precision"]');
  await dlg.waitFor({ state: 'visible', timeout: 10_000 });
  await page.screenshot({ path: join(SCREEN, '09-sep-enroll-dialog.png') });
  const cbs = dlg.locator('[role="checkbox"]:not([disabled])');
  const n = await cbs.count();
  R.pay.enabledCheckboxes = n;
  if (n >= 1) {
    await cbs.first().click();
    const before = R.network.filter((x) => x.method === 'POST' && /enroll/.test(x.url)).length;
    await dlg.getByRole('button', { name: /Thêm \d+ nhân viên/i }).click();
    await sleep(4000);
    const posts = R.network.filter((x) => x.method === 'POST' && /enroll/.test(x.url)).slice(before);
    R.pay.enrollPosts = posts;
    R.criteria.enroll = posts.some((p) => p.status >= 200 && p.status < 300) ? 'PASS' : 'FAIL';
    await page.screenshot({ path: join(SCREEN, '10-sep-after-enroll.png') });
  } else {
    R.criteria.enroll = 'FAIL_NO_CB';
  }
} else {
  R.criteria.enroll = 'FAIL_NO_BTN';
}

if (R.criteria.enroll === 'PASS') {
  const lock = page.getByRole('button', { name: /Khóa bảng lương/i }).first();
  if (await lock.isVisible().catch(() => false)) {
    await lock.click();
    await sleep(600);
    const conf = page.getByRole('button', { name: /^Khóa bảng lương$/i }).last();
    const before = R.network.filter((x) => x.method === 'POST' && /process/.test(x.url)).length;
    if (await conf.isVisible().catch(() => false)) await conf.click();
    await sleep(6000);
    const posts = R.network.filter((x) => x.method === 'POST' && /process/.test(x.url)).slice(before);
    R.pay.processPosts = posts;
    R.criteria.process = posts.some((p) => p.status >= 200 && p.status < 300) ? 'PASS' : 'FAIL';
    await page.screenshot({ path: join(SCREEN, '11-sep-after-process.png') });
  } else {
    R.criteria.process = 'FAIL_NO_LOCK';
  }
  const table = page.locator('table').filter({ hasText: /Lương cơ bản|Lương Net/i }).first();
  const vis = await table.isVisible().catch(() => false);
  const txt = vis ? await table.innerText().catch(() => '') : '';
  const rows = vis ? await table.locator('tbody tr').count() : 0;
  R.payslip = { visible: vis, rowCount: rows, sample: txt.slice(0, 300) };
  R.criteria.payslip_ui = vis && rows >= 1 ? 'PASS' : 'FAIL';
  await page.reload({ waitUntil: 'domcontentloaded' });
  await sleep(3500);
  await page.locator('[data-testid="payroll-tab-calculate"]').click().catch(() => {});
  const mi2 = page.getByRole('menuitem', { name: /Danh sách bảng lương/i }).first();
  if (await mi2.isVisible().catch(() => false)) await mi2.click();
  await sleep(1000);
  await page.locator('[data-testid="pay-batch-period-filter"]').click({ force: true });
  await sleep(400);
  const opt2 = page.locator(`[data-testid="pay-batch-period-option-${MONTH}-${YEAR}"]`);
  if (await opt2.isVisible().catch(() => false)) await opt2.click();
  else await page.getByRole('option', { name: `Tháng ${MONTH}/${YEAR}`, exact: true }).click();
  await sleep(1500);
  await page.locator(`[data-testid="pay-batch-row-${PERIOD}"]`).click({ timeout: 12_000 });
  await sleep(3000);
  const table2 = page.locator('table').filter({ hasText: /Lương cơ bản|Lương Net/i }).first();
  const rows2 = await table2.locator('tbody tr').count().catch(() => 0);
  R.criteria.f5 = rows2 >= 1 ? 'PASS' : 'FAIL';
  await page.screenshot({ path: join(SCREEN, '12-sep-after-f5.png') });
}

R.verdict =
  R.criteria.tdz === 'PASS' &&
  R.criteria.enroll === 'PASS' &&
  R.criteria.process === 'PASS' &&
  R.criteria.payslip_ui === 'PASS' &&
  R.criteria.f5 === 'PASS'
    ? 'PASS_TO_PM'
    : 'FAIL_TO_PM';

writeFileSync(
  'docs/qa/evidence/_tmp-po-hrm-payroll-formula-run-gap-w3-qa-j-hrm-07-01-r2-sep.json',
  JSON.stringify(R, null, 2),
);
console.log(
  JSON.stringify(
    {
      verdict: R.verdict,
      criteria: R.criteria,
      enrollPosts: R.pay.enrollPosts,
      processPosts: R.pay.processPosts,
      payslip: R.payslip,
      tdz: R.tdz,
      pageErrors: R.pageErrors,
    },
    null,
    2,
  ),
);
await browser.close();
