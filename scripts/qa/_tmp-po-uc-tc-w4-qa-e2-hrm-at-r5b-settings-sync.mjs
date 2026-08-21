#!/usr/bin/env node
/**
 * Corroboration: FE Settings sync-from-xbos for trsport after BE holding→OU pull fix.
 * Not Leave L2; supplements R5b when Leave empty CTA is already gone (picker populated).
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const PORTAL = 'http://127.0.0.1:5173';
const HRM = 'http://127.0.0.1:28001';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCREEN = 'docs/qa/evidence/screens/po-uc-tc-w4-qa-e2-hrm-at-r5b-at12-create-catalog';
mkdirSync(SCREEN, { recursive: true });

const login = await fetch(`${HRM}/api/hrm/auth/mobile/login`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ email: 'uat.nv0002@xe.vn', password: 'xevn-uat-2026' }),
}).then((r) => r.json());
const data = login?.data ?? login;
const token = data.access_token ?? data.accessToken;
const mem = data.active_membership ?? data.memberships?.[0] ?? {};
const session = {
  token,
  expiresAt: Date.now() + 8 * 3600 * 1000,
  companyId: 'trsport',
  user: {
    userId: mem.employee_id || 'uat.nv0002',
    email: 'uat.nv0002@xe.vn',
    displayName: mem.employee_name || 'NV0002',
    roles: data.roles || ['employee', 'manager'],
  },
};

const out = { syncBody: null, catalogGet: null, network: [], clickedSync: false };

const browser = await chromium.launch({
  headless: true,
  executablePath: CHROME,
  args: ['--disable-dev-shm-usage'],
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  locale: 'vi-VN',
});
const page = await context.newPage();

page.on('response', async (res) => {
  const u = res.url();
  if (!/settings-catalogs/.test(u)) return;
  const method = res.request().method();
  if (method === 'OPTIONS') return;
  const hdrs = res.request().headers();
  const entry = {
    method,
    status: res.status(),
    url: u.replace(/^https?:\/\/[^/]+/, ''),
    xCompanyId: hdrs['x-company-id'] || null,
  };
  if (method === 'POST' && /sync-from-xbos/.test(u)) {
    try {
      const j = await res.json();
      const d = j?.data ?? j;
      const pulled = d?.pulledKeys || d?.pulled_keys || [];
      out.syncBody = {
        status: res.status(),
        code: j?.code || d?.code,
        pulledKeys: pulled,
        pulledKeysCount: pulled.length,
        xCompanyId: entry.xCompanyId,
        hasLeaveTypes: pulled.includes('leave_types'),
      };
      entry.pulledKeysCount = pulled.length;
      entry.code = out.syncBody.code;
    } catch {
      out.syncBody = { status: res.status(), parseError: true };
    }
  }
  if (method === 'GET' && !/sync-from-xbos/.test(u)) out.catalogGet = entry;
  out.network.push(entry);
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

await page.goto(
  `${PORTAL}/hr/settings-catalogs?portal=1&tenantId=xevn&companyId=trsport`,
  { waitUntil: 'domcontentloaded', timeout: 60000 },
);
await page.waitForTimeout(4000);
await page.screenshot({ path: join(SCREEN, '08-settings-catalogs.png'), fullPage: false }).catch(() => {});

const syncBtn = page
  .getByRole('button', { name: /Đồng bộ từ XBOS|Dong bo tu XBOS|Sync from XBOS/i })
  .first();
if (await syncBtn.isVisible().catch(() => false)) {
  await syncBtn.click({ force: true });
  out.clickedSync = true;
} else {
  out.clickedSync = await page.evaluate(() => {
    const nodes = Array.from(document.querySelectorAll('button, a'));
    const hit = nodes.find((n) =>
      /đồng bộ từ xbos|sync from xbos/i.test((n.textContent || '').trim()),
    );
    if (!hit) return false;
    hit.click();
    return true;
  });
}
await page.waitForTimeout(15000);
await page.screenshot({ path: join(SCREEN, '09-settings-after-sync.png'), fullPage: false }).catch(() => {});

await page.goto(
  `${PORTAL}/hr/attendance?portal=1&tenantId=xevn&companyId=trsport`,
  { waitUntil: 'domcontentloaded', timeout: 60000 },
);
await page.waitForTimeout(3000);
await page.evaluate(() => {
  const nodes = Array.from(document.querySelectorAll('[role="tab"], button, a'));
  const hit = nodes.find((n) => /nghỉ phép|leave/i.test((n.textContent || '').trim()));
  if (hit) hit.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
});
await page.waitForTimeout(2500);
await page.evaluate(() => {
  const nodes = Array.from(document.querySelectorAll('button, a'));
  const hit = nodes.find((n) =>
    /tạo yêu cầu|tạo đơn|đăng ký nghỉ/i.test((n.textContent || '').trim()),
  );
  if (hit) hit.click();
});
await page.waitForTimeout(2000);
const dlg = page.locator('[role="dialog"]').first();
const typeTrigger = dlg.locator('button[role="combobox"]').nth(1);
let options = [];
if (await typeTrigger.isVisible().catch(() => false)) {
  await typeTrigger.click({ force: true });
  await page.waitForTimeout(800);
  options = (await page.getByRole('option').allTextContents().catch(() => []))
    .map((t) => t.replace(/\s+/g, ' ').trim())
    .filter((t) => t && !/^chọn|select/i.test(t));
}
await page
  .screenshot({ path: join(SCREEN, '10-leave-picker-after-settings-sync.png'), fullPage: false })
  .catch(() => {});

out.leaveOptionsAfter = options.slice(0, 8);
out.leaveOptionCount = options.length;

writeFileSync(
  'docs/qa/evidence/_tmp-po-uc-tc-w4-qa-e2-hrm-at-r5b-settings-sync.json',
  JSON.stringify(out, null, 2),
);
console.log(JSON.stringify(out, null, 2));
await browser.close();

const ok =
  out.clickedSync &&
  out.syncBody &&
  out.syncBody.status >= 200 &&
  out.syncBody.status < 300 &&
  out.syncBody.xCompanyId === 'trsport' &&
  (out.syncBody.pulledKeysCount || 0) > 0 &&
  out.leaveOptionCount >= 1;
process.exit(ok ? 0 : 1);
