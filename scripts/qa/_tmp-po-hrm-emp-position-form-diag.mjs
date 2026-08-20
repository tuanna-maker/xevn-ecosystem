#!/usr/bin/env node
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';

const PORTAL = 'http://127.0.0.1:5173';
const HRM = 'http://127.0.0.1:28001';
const CHROME =
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const login = await fetch(`${PORTAL}/api/xbos/auth/login`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ email: 'ceo@xe.vn', password: 'Xevn@2026' }),
}).then((r) => r.json());
const data = login?.data ?? login;
const token = data.accessToken || data.access_token;

const ov = await fetch(`${HRM}/api/hrm/settings-catalogs?company_id=main`, {
  headers: {
    authorization: `Bearer ${token}`,
    'x-tenant-id': 'xevn',
    'x-company-id': 'main',
  },
}).then((r) => r.json());

const cats = Array.isArray(ov?.data) ? ov.data : Array.isArray(ov) ? ov : [];
const summary = cats.map((c) => ({
  key: c.key || c.catalogKey || c.catalog_key,
  items: (c.effectiveItems || c.effective_items || c.items || []).length,
  sample: (c.effectiveItems || c.effective_items || c.items || [])
    .slice(0, 5)
    .map((i) => i.code || i.item_key || i.key),
}));
const basic = cats.find((c) => /basic_field/i.test(String(c.key || c.catalogKey || '')));
const jt = cats.find((c) => /job_title|^positions$/i.test(String(c.key || c.catalogKey || '')));

const session = {
  token,
  expiresAt: Date.now() + 8 * 3600_000,
  companyId: 'main',
  user: { userId: 'ceo@xe.vn', email: 'ceo@xe.vn', displayName: 'CEO', roles: ['group_ceo'] },
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

await page.goto(`${PORTAL}/hr/employees?portal=1&tenantId=xevn&companyId=main`, {
  waitUntil: 'domcontentloaded',
  timeout: 90_000,
});
await sleep(4500);
const row = page.locator('table tbody tr').filter({ hasText: 'Nguyễn Văn QA M3' }).first();
const actions = row.getByTestId('employee-row-actions');
if (await actions.count()) await actions.click();
else await row.locator('button').last().click();
await sleep(500);
await page.getByRole('menuitem', { name: /Sửa|Edit/i }).first().click();
await sleep(2000);
const dialog = page.getByTestId('hdsd-employee-form-dialog');
for (let i = 0; i < 15; i++) {
  await dialog
    .evaluate((el) => {
      const sc =
        el.querySelector('[data-radix-scroll-area-viewport]') ||
        el.querySelector('.overflow-y-auto') ||
        el;
      if (sc) sc.scrollTop = (sc.scrollTop || 0) + 180;
    })
    .catch(() => {});
  await sleep(80);
}
const diag = await dialog.evaluate(() => {
  const root = document.querySelector('[data-testid="hdsd-employee-form-dialog"]');
  if (!root) return { missing: true };
  const labels = [...root.querySelectorAll('label')]
    .map((l) => (l.textContent || '').trim())
    .filter(Boolean);
  const combos = [...root.querySelectorAll('[role="combobox"]')].map((c) =>
    (c.getAttribute('aria-label') || c.textContent || '').trim().slice(0, 100),
  );
  const empty = [...root.querySelectorAll('[data-hrm-empty-catalog]')].map((e) => ({
    code: e.getAttribute('data-hrm-empty-catalog'),
    text: (e.textContent || '').trim().slice(0, 140),
  }));
  const statuses = [...root.querySelectorAll('[role="status"]')].map((s) =>
    (s.textContent || '').trim().slice(0, 160),
  );
  const body = root.textContent || '';
  return {
    labels,
    combos,
    empty,
    statuses: statuses.slice(0, 10),
    hasViTri: /Vị trí|Chức danh/i.test(body),
    hasPhongBan: /Phòng ban/i.test(body),
    hasEmptyHint: /Danh mục chức danh trống|CH06f|Chưa có mục trong danh mục/i.test(body),
    snippet: body.replace(/\s+/g, ' ').slice(0, 600),
  };
});

const out = {
  catalogSummary: summary.slice(0, 40),
  basic,
  jobTitles: jt
    ? {
        key: jt.key || jt.catalogKey,
        n: (jt.effectiveItems || jt.items || []).length,
        codes: (jt.effectiveItems || jt.items || [])
          .slice(0, 10)
          .map((i) => i.code || i.item_key),
      }
    : null,
  diag,
};
writeFileSync(
  'docs/qa/evidence/_tmp-po-hrm-emp-position-form-diag.json',
  JSON.stringify(out, null, 2),
);
console.log(JSON.stringify(out, null, 2));
await browser.close();
