#!/usr/bin/env node
/**
 * Narrow mutate probe — NV001-HD edit work_arrangement (U65 · stable testids)
 * Align with _tmp-qa-po-hrm-employment-types-consumer-ctr-01.mjs edit leg.
 */
import { chromium } from 'playwright';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM = process.env.HRM_API_URL || 'http://127.0.0.1:28001/api/hrm';
const XBOS = process.env.XBOS_HOST_API || 'http://127.0.0.1:28002';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const COMPANY = process.env.QA_COMPANY_ID || 'main';
const TENANT = process.env.QA_TENANT_ID || 'xevn';
const CHROME =
  process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function loginApi() {
  for (const url of [`${XBOS}/api/xbos/auth/login`, `${PORTAL}/api/xbos/auth/login`]) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
      });
      const j = await r.json().catch(() => ({}));
      const d = j?.data ?? j;
      const token = d?.accessToken ?? d?.access_token;
      if (r.ok && token) return { token, raw: d };
    } catch {
      /* */
    }
  }
  throw new Error('login failed');
}

async function fetchEffectiveCodes(token) {
  const url = `${HRM}/employees/employment-types/effective?company_id=${COMPANY}`;
  const r = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, 'X-Tenant-ID': TENANT },
  });
  const j = await r.json().catch(() => ({}));
  const payload = j?.data ?? j;
  const items = Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload?.items)
      ? payload.items
      : [];
  return items
    .map((row) => String(row?.employmentTypeKey ?? row?.employment_type_key ?? '').trim())
    .filter(Boolean);
}

async function injectPortalAuth(page, session) {
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
      store.setItem('access_token', s.token);
    }
  }, session);
}

async function resolveHrmContractsFrame(page, timeoutMs = 60000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    for (const f of page.frames()) {
      if (await f.locator('[data-testid="hdsd-contracts-create-btn"]').first().isVisible().catch(() => false)) {
        return f;
      }
    }
    await sleep(400);
  }
  return null;
}

async function resolveWizardShell(page, hrm) {
  for (const ctx of [page, hrm, ...page.frames()]) {
    if (await ctx.getByTestId('ctr-create-wizard-stepper').isVisible().catch(() => false)) return ctx;
  }
  return null;
}

async function pickCatalogOption(page, ctx, rootTestId, preferCode) {
  const root = ctx.getByTestId(rootTestId);
  await root.scrollIntoViewIfNeeded().catch(() => {});
  await root.click({ force: true });
  await sleep(600);
  const tid = preferCode ? `catalog-picker-option-${preferCode}` : null;
  for (const c of [ctx, page, ...page.frames()]) {
    if (tid) {
      const opt = c.getByTestId(tid);
      if (await opt.isVisible({ timeout: 8000 }).catch(() => false)) {
        await opt.click({ force: true });
        return preferCode;
      }
    }
    const first = c.locator('[data-testid^="catalog-picker-option-"]').first();
    if (await first.isVisible({ timeout: 8000 }).catch(() => false)) {
      const testId = (await first.getAttribute('data-testid')) || '';
      await first.click({ force: true });
      const m = testId.match(/^catalog-picker-option-(.+)$/);
      return m ? m[1] : testId;
    }
  }
  return null;
}

const session = await loginApi();
const effCodes = await fetchEffectiveCodes(session.token);
const selectedTarget = effCodes[1] ?? effCodes[0] ?? null;

let patchBody = null;
let selectedWa = null;

const browser = await chromium.launch({ headless: true, executablePath: CHROME });
const page = await browser.newPage();
page.on('request', (req) => {
  const m = req.method();
  if (
    (m === 'PATCH' || m === 'PUT') &&
    /\/contracts-insurance\/contracts\//.test(req.url()) &&
    !req.url().includes('/preview')
  ) {
    try {
      patchBody = req.postDataJSON();
    } catch {
      patchBody = null;
    }
  }
});

await injectPortalAuth(page, {
  token: session.token,
  user: session.raw?.user ?? { email: EMAIL },
  companyId: COMPANY,
  expiresAt: Date.now() + 3600000,
});

await page.goto(`${PORTAL}/command-center/hrm/contracts`, { waitUntil: 'domcontentloaded', timeout: 120000 });
await sleep(3000);
const hrm = await resolveHrmContractsFrame(page);
if (!hrm) {
  console.log(JSON.stringify({ pass: false, error: 'contracts shell not found' }, null, 2));
  process.exit(1);
}

const row = hrm.getByRole('row', { name: /NV001-HD/ });
await row.getByRole('button', { name: /Sửa/i }).click({ timeout: 30000 });
await sleep(2000);
const shell = await resolveWizardShell(page, hrm);
if (!shell) {
  console.log(JSON.stringify({ pass: false, error: 'wizard not found' }, null, 2));
  process.exit(1);
}

let waCtx = shell;
for (const ctx of [shell, page, ...page.frames()]) {
  if (await ctx.getByTestId('ctr-create-work-arrangement').isVisible().catch(() => false)) {
    waCtx = ctx;
    break;
  }
}

selectedWa = await pickCatalogOption(page, waCtx, 'ctr-create-work-arrangement', selectedTarget);
await sleep(400);
await shell.getByTestId('ctr-create-step-1').click({ position: { x: 8, y: 8 }, force: true }).catch(() => {});
await sleep(200);

const saveWait = page.waitForResponse(
  (res) => {
    const method = res.request().method();
    return (
      (method === 'PATCH' || method === 'PUT') &&
      /\/contracts-insurance\/contracts\//.test(res.url()) &&
      !res.url().includes('/preview')
    );
  },
  { timeout: 90000 },
);
await shell.getByTestId('hdsd-contracts-form-submit').click();
const saveRes = await saveWait.catch(() => null);
const patchStatus = saveRes?.status() ?? null;

await page.reload({ waitUntil: 'domcontentloaded' });
await sleep(2500);
const hrm2 = await resolveHrmContractsFrame(page);
const host2 = hrm2 || page;
await host2.getByRole('row', { name: /NV001-HD/ }).getByRole('button', { name: /Sửa/i }).click({ timeout: 20000 });
await sleep(1500);
const shell2 = await resolveWizardShell(page, hrm2);
let f5LabelOk = false;
if (shell2 && selectedWa) {
  const triggerText = await shell2.getByTestId('ctr-create-work-arrangement').innerText().catch(() => '');
  f5LabelOk = triggerText.length > 2 && !/Chọn hình thức/i.test(triggerText);
}

const out = {
  selectedWa,
  patchStatus,
  work_arrangement: patchBody?.work_arrangement,
  f5LabelOk,
  pass:
    patchStatus != null &&
    patchStatus >= 200 &&
    patchStatus < 300 &&
    String(patchBody?.work_arrangement) === String(selectedWa) &&
    f5LabelOk,
};
console.log(JSON.stringify(out, null, 2));
await browser.close();
process.exit(out.pass ? 0 : 1);
