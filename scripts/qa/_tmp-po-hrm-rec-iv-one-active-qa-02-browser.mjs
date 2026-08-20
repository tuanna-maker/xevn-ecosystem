#!/usr/bin/env node
/** Browser supplement — schedule Tuấn after pipeline start (U65 FE path) */
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
const EMAIL = 'ceo@xe.vn';
const PASS = 'Xevn@2026';
const TARGET = 'tuanna@unicomhub.com';
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../../docs/qa/evidence/_tmp-po-hrm-rec-iv-one-active-qa-02-browser.json');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function findHost(page, fn) {
  for (const h of [page, ...page.frames()]) {
    try {
      if (await fn(h).first().isVisible({ timeout: 900 }).catch(() => false)) return h;
    } catch {
      /* */
    }
  }
  return null;
}

async function login() {
  const r = await fetch(`${PORTAL}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASS }),
  });
  return ((await r.json()).data).accessToken;
}

async function main() {
  const token = await login();
  const hdr = { authorization: `Bearer ${token}`, 'x-tenant-id': 'xevn', 'x-company-id': 'main' };

  const result = { network: [], badge: {}, spineBefore: null, spineAfter: null };

  const spineBefore = await fetch(`${HRM}/api/hrm/recruitment/candidates?company_id=main&page_size=100`, { headers: hdr });
  const spineRows = (await spineBefore.json()).data?.data ?? [];
  result.spineBefore = spineRows.find((r) => r.email?.toLowerCase() === TARGET.toLowerCase()) ?? null;

  const browser = await chromium.launch({ executablePath: CHROME, headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('response', async (resp) => {
    const url = resp.url();
    if (url.includes('/api/hrm/recruitment/')) {
      let body = null;
      try {
        body = await resp.json();
      } catch {
        body = null;
      }
      result.network.push({
        method: resp.request().method(),
        path: url.replace(PORTAL, '').slice(0, 100),
        status: resp.status(),
        code: body?.code ?? null,
      });
    }
  });

  await page.addInitScript((s) => {
    for (const store of [localStorage, sessionStorage]) {
      store.setItem('xevn.portal.accessToken', s.token);
      store.setItem('xevn.portal.tokenExpiresAt', String(Date.now() + 8e6));
      store.setItem('xevn.portal.user', JSON.stringify({ email: s.email, displayName: 'CEO', roles: ['group_ceo'] }));
      store.setItem('xevn.portal.tenantId', 'xevn');
      store.setItem('xevn.portal.companyId', 'main');
      store.setItem('hrm_portal_mode', '1');
      store.setItem('hrm_current_company_id', 'main');
    }
  }, { token, email: EMAIL });

  await page.goto(`${PORTAL}/command-center/hrm/recruitment?tab=candidates&companyId=main&tenantId=xevn`, {
    waitUntil: 'domcontentloaded',
  });
  await sleep(4500);

  const nav = await findHost(page, (h) => h.getByRole('button', { name: /ứng viên/i }));
  if (nav) await nav.getByRole('button', { name: /ứng viên/i }).first().click({ force: true });
  await sleep(2500);
  const all = await findHost(page, (h) => h.getByText(/tất cả ứng viên/i));
  if (all) await all.getByText(/tất cả ứng viên/i).first().click({ force: true });
  await sleep(2000);

  const host = await findHost(page, (h) => h.locator('table tbody tr').filter({ hasText: /Tuấn/i }));
  const row = host.locator('table tbody tr').filter({ hasText: /Tuấn/i }).first();

  await row.locator('button').nth(0).click({ force: true });
  await sleep(4000);

  await row.locator('button').nth(2).click({ force: true });
  await sleep(1500);

  const dlgHost = await findHost(page, (h) => h.locator('[data-testid="schedule-interview-dialog"]'));
  if (dlgHost) {
    const dlg = dlgHost.locator('[data-testid="schedule-interview-dialog"]');
    await dlg.locator('[role="combobox"]').first().click({ force: true });
    await sleep(400);
    const opt = await findHost(page, (h) => h.getByRole('option', { name: '09:00' }));
    if (opt) await opt.getByRole('option', { name: '09:00' }).first().click({ force: true });
    await dlg.getByRole('button', { name: /chọn ngày/i }).click({ force: true }).catch(() => {});
    await sleep(800);
    const day = await findHost(page, (h) => h.locator('button.rdp-day:not([disabled])').last());
    if (day) await day.locator('button.rdp-day:not([disabled])').last().click({ force: true });
    await sleep(500);
    await dlg.getByRole('button', { name: /^lên lịch phỏng vấn$/i }).click({ force: true });
    await sleep(4000);
  }

  const badgeHost = await findHost(page, (h) =>
    h.locator('table tbody tr').filter({ hasText: /Tuấn/i }).locator('[data-testid="candidate-active-interview-badge"]'),
  );
  if (badgeHost) {
    const b = badgeHost
      .locator('table tbody tr')
      .filter({ hasText: /Tuấn/i })
      .locator('[data-testid="candidate-active-interview-badge"]');
    result.badge.visible = await b.isVisible().catch(() => false);
    result.badge.label = (await b.innerText().catch(() => '')).trim();
    const t = badgeHost
      .locator('table tbody tr')
      .filter({ hasText: /Tuấn/i })
      .locator('[data-testid="candidate-active-interview-time"]');
    result.badge.time = (await t.innerText().catch(() => '')).trim();
  }

  await page.reload({ waitUntil: 'domcontentloaded' });
  await sleep(4500);
  const badgeF5Host = await findHost(page, (h) =>
    h.locator('[data-testid="candidate-active-interview-badge"]').filter({ hasText: /Đã có lịch/i }),
  );
  result.badge.f5Any = Boolean(badgeF5Host);

  const toastHost = await findHost(page, (h) =>
    h.locator('[data-sonner-toast]').filter({ hasText: /./ }),
  );
  if (toastHost) {
    result.lastToast = (await toastHost.locator('[data-sonner-toast]').last().innerText().catch(() => '')).trim();
  }

  await browser.close();

  const spineAfter = await fetch(`${HRM}/api/hrm/recruitment/candidates?company_id=main&page_size=100`, { headers: hdr });
  const spineAfterRows = (await spineAfter.json()).data?.data ?? [];
  result.spineAfter = spineAfterRows.find((r) => r.email?.toLowerCase() === TARGET.toLowerCase()) ?? null;

  writeFileSync(OUT, JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
