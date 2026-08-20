#!/usr/bin/env node
/**
 * Focused retest — AC-PLT-EMP-04-YCTD-PICKER only
 * Parent stamp EMPPLATQA2-MSJ0OAL9 (20/21); seasonal was retired — create fresh ET then open YCTD dialog.
 */
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const XBOS = process.env.XBOS_HOST_API || 'http://127.0.0.1:28002';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const COMPANY = process.env.QA_COMPANY_ID || 'main';
const TENANT = 'xevn';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(
  ROOT,
  'docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-emp-qa-02-browser.json',
);
const SCREEN = resolve(
  ROOT,
  'docs/qa/evidence/screens/po-hrm-dynamic-config-platform-emp-qa-02',
);
mkdirSync(SCREEN, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const stamp = Date.now().toString(36).toLowerCase().slice(-8);
const ET_KEY = `seasonal_temp_yctd_${stamp}`;
const ET_LABEL = `YCTD ET QA ${stamp}`;

const base = JSON.parse(readFileSync(OUT_JSON, 'utf8'));
base.probes = base.probes || {};
base.ac = base.ac || {};
base.click_log = base.click_log || [];
base.screens = base.screens || [];

function save() {
  writeFileSync(OUT_JSON, JSON.stringify(base, null, 2));
}
function log(msg) {
  base.click_log.push({ at: new Date().toISOString(), msg });
  console.error(`[log] ${msg}`);
}

function q(path) {
  const u = new URL(path, PORTAL);
  u.searchParams.set('portal', '1');
  u.searchParams.set('tenantId', TENANT);
  u.searchParams.set('companyId', COMPANY);
  u.searchParams.set('_', String(Date.now()));
  return u.toString();
}

async function loginApi() {
  for (const url of [`${PORTAL}/api/xbos/auth/login`, `${XBOS}/api/xbos/auth/login`]) {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
    });
    const j = await r.json().catch(() => ({}));
    const d = j?.data ?? j;
    const token = d?.accessToken ?? d?.access_token;
    if (r.ok && token) {
      return {
        token,
        expiresAt: Date.now() + 8 * 3600_000,
        companyId: COMPANY,
        user: {
          userId: d?.user?.userId || EMAIL,
          email: EMAIL,
          displayName: EMAIL,
          roles: ['group_ceo'],
        },
        raw: d,
      };
    }
  }
  throw new Error('login failed');
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
      store.setItem('hrm_current_tenant_id', 'xevn');
    }
  }, session);
}

async function pickCatalogOption(page, pickerTestId, key, labelHint) {
  const picker = page.getByTestId(pickerTestId);
  if (!(await picker.isVisible().catch(() => false))) {
    return { ok: false, reason: 'picker_not_visible' };
  }
  await picker.scrollIntoViewIfNeeded().catch(() => {});
  await picker.click({ force: true });
  await sleep(500);
  const input = page
    .locator(
      '[data-radix-popper-content-wrapper] input, [role="dialog"] input[placeholder*="Tìm"], input[placeholder*="Tìm"]',
    )
    .last();
  if (await input.isVisible().catch(() => false)) {
    await input.fill(key);
    await sleep(400);
  }
  const keyRe = new RegExp(
    key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
      (labelHint ? '|' + labelHint.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : ''),
    'i',
  );
  const opt = page
    .locator('[role="option"], [cmdk-item], [data-value], button, div')
    .filter({ hasText: keyRe })
    .first();
  if (await opt.isVisible().catch(() => false)) {
    await opt.click({ force: true });
    await sleep(300);
    return { ok: true, via: 'option_click' };
  }
  const content =
    (await page
      .locator('[data-radix-popper-content-wrapper], [role="listbox"], [cmdk-list]')
      .first()
      .innerText()
      .catch(() => '')) || '';
  await page.keyboard.press('Escape').catch(() => {});
  return {
    ok: content.includes(key) || (labelHint ? content.includes(labelHint) : false),
    reason: content.includes(key) ? 'option_visible' : 'option_missing',
    contentSnippet: content.slice(0, 400),
  };
}

async function main() {
  const session = await loginApi();
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  await injectPortalAuth(page, session);

  // 1) Create fresh ET via Settings (browser U65)
  log('Settings ET create for YCTD retest');
  await page.goto(q('/hr/settings'), { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await sleep(3000);
  const etTab = page.getByTestId('settings-tab-emp-employment-types');
  await etTab.waitFor({ state: 'visible', timeout: 45_000 });
  await etTab.click({ force: true });
  await sleep(1200);

  const upsertWait = page
    .waitForResponse(
      (res) =>
        /\/api\/hrm\/employees\/employment-types(\?|$)/.test(res.url()) &&
        ['PUT', 'POST'].includes(res.request().method()) &&
        !/\/retire/.test(res.url()),
      { timeout: 45_000 },
    )
    .catch(() => null);
  await page.getByTestId('hdsd-emp-employment-type-key').fill(ET_KEY);
  await page.getByTestId('hdsd-emp-employment-type-name').fill(ET_LABEL);
  await page.getByTestId('hdsd-emp-employment-type-save').click();
  const upsertRes = await upsertWait;
  const upsertStatus = upsertRes?.status() ?? 0;
  let upsertBody = null;
  try {
    upsertBody = upsertRes ? await upsertRes.json() : null;
  } catch {
    /* */
  }
  base.probes.yctdRetestEtCreate = {
    status: upsertStatus,
    key: upsertBody?.data?.employmentTypeKey || ET_KEY,
    id: upsertBody?.data?.id || null,
  };
  console.log(`ET create → ${upsertStatus}`);
  if (!(upsertStatus >= 200 && upsertStatus < 300)) {
    base.ac['AC-PLT-EMP-04-YCTD-PICKER'] = {
      verdict: 'FAIL',
      at: new Date().toISOString(),
      summary: `YCTD retest blocked — ET create ${upsertStatus}`,
      retest: true,
    };
    base.overall = 'FAIL';
    base.ack_status = 'FAIL_TO_PM';
    save();
    await browser.close();
    process.exitCode = 1;
    return;
  }

  // 2) Open YCTD tab + create dialog via HDSD testid
  log('open Recruitment YCTD');
  await page.goto(q('/hr/recruitment?tab=requisitions'), {
    waitUntil: 'domcontentloaded',
    timeout: 90_000,
  });
  await sleep(3500);
  // click nav label if needed
  const yctdNav = page.getByRole('button', { name: /Yêu cầu tuyển dụng/i }).first();
  if (await yctdNav.isVisible().catch(() => false)) {
    await yctdNav.click();
    await sleep(1000);
  }
  // text heading present?
  await page
    .getByText(/Yêu cầu tuyển dụng/i)
    .first()
    .waitFor({ state: 'visible', timeout: 30_000 })
    .catch(() => {});

  const createBtn = page.getByTestId('hdsd-requisition-create-btn');
  let createVisible = await createBtn.isVisible().catch(() => false);
  if (!createVisible) {
    // PermissionGate may delay — try role
    const alt = page.getByRole('button', { name: /Thêm yêu cầu/i }).first();
    createVisible = await alt.isVisible().catch(() => false);
    if (createVisible) await alt.click();
  } else {
    await createBtn.click();
  }
  await sleep(1500);

  const dialog = page.getByTestId('hdsd-requisition-form-dialog');
  let dialogOk = await dialog.isVisible().catch(() => false);
  if (!dialogOk) {
    dialogOk = await page
      .getByRole('dialog')
      .filter({ hasText: /Tạo yêu cầu tuyển dụng/i })
      .isVisible()
      .catch(() => false);
  }
  await page.screenshot({ path: join(SCREEN, '22-yctd-retest-dialog.png'), fullPage: false }).catch(() => {});
  base.screens.push('docs/qa/evidence/screens/po-hrm-dynamic-config-platform-emp-qa-02/22-yctd-retest-dialog.png');
  base.probes.yctdRetestDialog = {
    createVisible,
    dialogOk,
    bodySnippet: ((await page.locator('body').innerText().catch(() => '')) || '').slice(0, 400),
  };

  let pick = { ok: false, reason: 'dialog_missing' };
  if (dialogOk) {
    pick = await pickCatalogOption(page, 'hdsd-requisition-employment-type', ET_KEY, ET_LABEL);
  }
  base.probes.yctdEtPickerRetest = pick;
  await page.screenshot({ path: join(SCREEN, '23-yctd-retest-picker.png'), fullPage: false }).catch(() => {});
  base.screens.push('docs/qa/evidence/screens/po-hrm-dynamic-config-platform-emp-qa-02/23-yctd-retest-picker.png');

  const ok = dialogOk && pick.ok;
  base.ac['AC-PLT-EMP-04-YCTD-PICKER'] = {
    verdict: ok ? 'PASS' : 'FAIL',
    at: new Date().toISOString(),
    summary: ok
      ? `YCTD create dialog · ET picker has ${ET_KEY} (retest after createBtn testid)`
      : `YCTD retest FAIL dialogOk=${dialogOk} pick=${JSON.stringify(pick).slice(0, 200)}`,
    retest: true,
    etKey: ET_KEY,
  };
  console.log(`${ok ? 'PASS' : 'FAIL'} AC-PLT-EMP-04-YCTD-PICKER — ${base.ac['AC-PLT-EMP-04-YCTD-PICKER'].summary}`);

  const fails = Object.values(base.ac).filter((a) => a.verdict === 'FAIL').length;
  const passes = Object.values(base.ac).filter((a) => a.verdict === 'PASS').length;
  base.overall = fails === 0 ? 'PASS' : 'FAIL';
  base.ack_status = fails === 0 ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  base.endedAt = new Date().toISOString();
  base.summary = {
    ...(base.summary || {}),
    pass: passes,
    fail: fails,
    totalAc: Object.keys(base.ac).length,
    yctd_retest: true,
    yctd_et_key: ET_KEY,
  };
  save();
  console.log(`\n=== ${base.overall} ${base.ack_status} · ${passes}/${Object.keys(base.ac).length} ===`);
  await browser.close();
  process.exitCode = fails === 0 ? 0 : 1;
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
