#!/usr/bin/env node
import { chromium } from 'playwright';

const PORTAL = 'http://127.0.0.1:5173';
const HRM = 'http://127.0.0.1:28001';
const XBOS = 'http://127.0.0.1:28002';
const tuannId = '089f36e8-1793-4fd4-b30d-1f5071f63a96';
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

const lr = await fetch(`${XBOS}/api/xbos/auth/login`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ email: 'ceo@xe.vn', password: 'Xevn@2026' }),
});
const token = (await lr.json()).data.accessToken;
const hdr = {
  authorization: `Bearer ${token}`,
  'content-type': 'application/json',
  'x-tenant-id': 'xevn',
  'x-company-id': 'main',
};

const post409 = await fetch(`${HRM}/api/hrm/recruitment/interviews`, {
  method: 'POST',
  headers: hdr,
  body: JSON.stringify({
    company_id: 'main',
    candidate_id: tuannId,
    scheduled_at: new Date(Date.now() + 86400000).toISOString(),
    interviewer: 'browser-post-probe',
  }),
});
const pb = await post409.json();
const ivId = pb?.details?.active_interview_id;
if (ivId) {
  await fetch(`${HRM}/api/hrm/recruitment/interviews/${ivId}/status`, {
    method: 'PATCH',
    headers: hdr,
    body: JSON.stringify({ status: 'cancelled' }),
  });
}

const posts = [];
const browser = await chromium.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: true,
});
const page = await browser.newPage();
page.on('response', async (resp) => {
  if (resp.url().includes('/interviews') && resp.request().method() === 'POST') {
    let b = null;
    try {
      b = await resp.json();
    } catch {
      /* */
    }
    posts.push({ status: resp.status, code: b?.code ?? b?.error?.code });
  }
});

await page.addInitScript((s) => {
  for (const st of [localStorage, sessionStorage]) {
    st.setItem('xevn.portal.accessToken', s.token);
    st.setItem('xevn.portal.companyId', 'main');
    st.setItem('hrm_current_company_id', 'main');
    st.setItem('hrm_portal_mode', '1');
  }
}, { token });

await page.goto(`${PORTAL}/command-center/hrm/recruitment?tab=candidates&companyId=main&tenantId=xevn`, {
  waitUntil: 'domcontentloaded',
});
await sleep(5000);
const nav = await findHost(page, (h) => h.getByRole('button', { name: /ứng viên/i }));
if (nav) await nav.getByRole('button', { name: /ứng viên/i }).first().click({ force: true });
await sleep(2000);
const all = await findHost(page, (h) => h.getByText(/tất cả ứng viên/i));
if (all) await all.getByText(/tất cả ứng viên/i).first().click({ force: true });
await sleep(2500);

const host = await findHost(page, (h) => h.locator('table tbody tr').filter({ hasText: /Tuấn/i }));
const row = host.locator('table tbody tr').filter({ hasText: /Tuấn/i }).first();
await row.locator('button').filter({ has: host.locator('.lucide-calendar-clock') }).first().click({ force: true });
await sleep(1500);

const dlgHost = await findHost(page, (h) => h.locator('[data-testid="schedule-interview-dialog"]'));
const dlg = dlgHost.locator('[data-testid="schedule-interview-dialog"]');
await dlg.locator('[role="combobox"]').first().click({ force: true });
await sleep(400);
const opt = await findHost(page, (h) => h.getByRole('option', { name: '11:00' }).or(h.getByRole('option', { name: '09:00' })));
if (opt) await opt.getByRole('option').first().click({ force: true });
await dlg.getByRole('button', { name: /chọn ngày/i }).click({ force: true }).catch(() => {});
await sleep(700);
const day = await findHost(page, (h) => h.locator('button.rdp-day:not([disabled])').last());
if (day) await day.locator('button.rdp-day:not([disabled])').last().click({ force: true });
await sleep(400);
await dlg.getByRole('button', { name: /^lên lịch phỏng vấn$/i }).click({ force: true });
await sleep(5000);

const toastHost = await findHost(page, (h) => h.locator('[data-sonner-toast]').filter({ hasText: /./ }));
const toast = toastHost
  ? (await toastHost.locator('[data-sonner-toast]').last().innerText().catch(() => '')).trim()
  : null;

await browser.close();
console.log(JSON.stringify({ browserPosts: posts, toast, pass: posts.some((p) => (p.status === 201 || p.status === 409) && p.code !== 'HRM-VAL-001') }, null, 2));
