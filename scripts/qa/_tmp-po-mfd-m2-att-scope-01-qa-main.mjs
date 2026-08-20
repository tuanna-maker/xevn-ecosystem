#!/usr/bin/env node
/** M2 main-scope approve after NV FE create */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = 'http://127.0.0.1:5173';
const HRM = 'http://127.0.0.1:28001';
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const STAMP = `M2MAIN-${Date.now().toString(36).slice(-5).toUpperCase()}`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-po-mfd-m2-att-scope-01-qa-browser.json');

const out = { work_item_id: 'PO-MFD-M2-ATT-SCOPE-01-QA', STAMP, leave: {}, ot: {} };

async function login(email) {
  const r = await fetch(`${HRM}/api/hrm/auth/mobile/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password: 'xevn-uat-2026' }),
  });
  const j = await r.json();
  const d = j?.data ?? j;
  const token = d.access_token ?? d.accessToken;
  const mem = d.active_membership ?? d.memberships?.[0] ?? {};
  return {
    token,
    companyId: mem.company_id || 'trsport',
    user: {
      userId: mem.employee_id || email,
      email,
      displayName: mem.employee_name || email,
      roles: d.roles || [],
    },
    expiresAt: Date.now() + 8e6,
  };
}

async function inject(page, s, portalScope) {
  await page.addInitScript(
    ({ s, portalScope }) => {
      for (const store of [localStorage, sessionStorage]) {
        store.setItem('xevn.portal.accessToken', s.token);
        store.setItem('xevn.portal.tokenExpiresAt', String(s.expiresAt));
        store.setItem('xevn.portal.user', JSON.stringify(s.user));
        store.setItem('xevn.portal.companyId', portalScope);
        store.setItem('hrm_current_company_id', portalScope);
        store.setItem('hrm_portal_mode', '1');
      }
    },
    { s, portalScope },
  );
}

function track(page) {
  page.on('response', async (res) => {
    const u = res.url();
    if (!/leave-requests|overtime-requests/.test(u)) return;
    const m = res.request().method();
    if (m !== 'POST') return;
    const x = res.request().headers()['x-company-id'];
    if (/leave-requests(\?|$)/.test(u) && !/\/(approve|reject)/.test(u)) {
      const j = await res.json().catch(() => ({}));
      out.leave.create = { status: res.status(), code: j?.code, id: j?.data?.id, xCompanyId: x };
    }
    if (/leave-requests\/[^/]+\/approve/.test(u)) {
      const j = await res.json().catch(() => ({}));
      out.leave.approve = {
        status: res.status(),
        code: j?.code,
        xCompanyId: x,
        requestStatus: j?.data?.status,
      };
    }
    if (/overtime-requests\/[^/]+\/approve/.test(u)) {
      const j = await res.json().catch(() => ({}));
      out.ot.approve = { status: res.status(), code: j?.code, xCompanyId: x };
    }
  });
}

const nv = await login('uat.nv0007@xe.vn');
const mgr = await login('uat.nv0002@xe.vn');
const browser = await chromium.launch({
  headless: true,
  executablePath: CHROME,
  args: ['--disable-dev-shm-usage'],
});

{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  const page = await ctx.newPage();
  track(page);
  await inject(page, nv, 'trsport');
  await page.goto(`${PORTAL}/hr/attendance?portal=1&tenantId=xevn&companyId=trsport`, {
    waitUntil: 'domcontentloaded',
    timeout: 120000,
  });
  await sleep(5000);
  await page
    .locator('[role="tab"],button')
    .filter({ hasText: /Nghỉ phép/i })
    .first()
    .click({ force: true })
    .catch(() => {});
  await sleep(2000);
  await page
    .getByRole('button', { name: /Tạo yêu cầu|Tạo đơn|Đăng ký nghỉ/i })
    .first()
    .click({ force: true })
    .catch(() => {});
  await sleep(1500);
  const dlg = page.locator('[role="dialog"]').first();
  if (await dlg.isVisible().catch(() => false)) {
    const c0 = dlg.locator('button[role="combobox"]').first();
    if (await c0.isVisible().catch(() => false)) {
      await c0.click();
      await sleep(600);
      await page.getByRole('option').first().click({ force: true }).catch(() => {});
    }
    const c1 = dlg.locator('button[role="combobox"]').nth(1);
    if (await c1.isVisible().catch(() => false)) {
      await c1.click();
      await sleep(600);
      await page.getByRole('option').first().click({ force: true }).catch(() => {});
    }
    const ta = dlg.locator('textarea').first();
    if (await ta.isVisible().catch(() => false)) await ta.fill(`QA ${STAMP}`);
    await dlg.getByRole('button', { name: /Gửi|Lưu|Tạo/i }).last().click({ force: true }).catch(() => {});
    await sleep(4000);
  }
  await ctx.close();
}

{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  const page = await ctx.newPage();
  track(page);
  // Spreadsheet scope: JWT trsport + x-company-id=main on mutate; list via trsport OU URL
  await inject(page, mgr, 'main');
  await page.goto(`${PORTAL}/hr/attendance?portal=1&tenantId=xevn&companyId=trsport`, {
    waitUntil: 'domcontentloaded',
    timeout: 120000,
  });
  await sleep(5000);
  await page
    .locator('[role="tab"],button')
    .filter({ hasText: /Nghỉ phép/i })
    .first()
    .click({ force: true })
    .catch(() => {});
  await sleep(2000);
  await page
    .locator('[role="tab"],button')
    .filter({ hasText: /Chờ duyệt/i })
    .first()
    .click({ force: true })
    .catch(() => {});
  await sleep(2000);
  let clicked = false;
  const card = page.locator('div').filter({ hasText: STAMP }).first();
  if (await card.isVisible().catch(() => false)) {
    const b = card.getByRole('button', { name: /^Duyệt$/i }).first();
    if (await b.isVisible().catch(() => false)) {
      await b.click({ force: true });
      clicked = true;
    }
  }
  if (!clicked) {
    const b = page.getByRole('button', { name: /^Duyệt$/i }).first();
    if (await b.isVisible().catch(() => false)) {
      await b.click({ force: true });
      clicked = true;
    }
  }
  await sleep(3000);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await sleep(3000);
  const body = await page.locator('body').innerText().catch(() => '');
  out.leave.f5 = /Đã duyệt|approved/i.test(body);
  out.leave.clicked = clicked;
  await ctx.close();
}

{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  const page = await ctx.newPage();
  track(page);
  // Spreadsheet scope: JWT trsport + x-company-id=main on mutate; list via trsport OU URL
  await inject(page, mgr, 'main');
  await page.goto(`${PORTAL}/hr/attendance?portal=1&tenantId=xevn&companyId=trsport`, {
    waitUntil: 'domcontentloaded',
    timeout: 120000,
  });
  await sleep(5000);
  const mgrBtn = page.getByRole('button', { name: /Quản lý đơn/i }).first();
  if (await mgrBtn.isVisible().catch(() => false)) {
    await mgrBtn.click({ force: true });
    await sleep(800);
    const ot = page.getByRole('menuitem', { name: /Làm thêm|Đăng ký làm thêm/i }).first();
    if (await ot.isVisible().catch(() => false)) await ot.click({ force: true });
  }
  await sleep(2500);
  await page
    .locator('[role="tab"],button')
    .filter({ hasText: /Chờ duyệt/i })
    .first()
    .click({ force: true })
    .catch(() => {});
  await sleep(1500);
  out.ot.pendingApproveBtns = await page.getByRole('button', { name: /^Duyệt$/i }).count();
  if (out.ot.pendingApproveBtns > 0) {
    await page.getByRole('button', { name: /^Duyệt$/i }).first().click({ force: true });
    await sleep(2500);
  }
  await ctx.close();
}

await browser.close();

const ap = out.leave.approve;
const leaveOk =
  out.leave.clicked &&
  ap &&
  ap.status >= 200 &&
  ap.status < 300 &&
  ap.status !== 409 &&
  !String(ap.code).includes('409');
out.verdict = leaveOk ? (out.ot.approve ? 'PASS' : 'PARTIAL_PASS') : 'FAIL';
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
process.exit(leaveOk ? 0 : 1);
