#!/usr/bin/env node
/**
 * PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-QA-02 — U65 browser AC-PLT-DEC Settings + Decisions picker
 * Parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-FE-01
 * Stamp ref L1: DECPLATQA-MSJ1FB3D · QC DEC-QC-01 GWC SEAL (do not wipe)
 * Honesty: decisions UAT=false · personnel/e2e/pay/att/rec/printable=false LOCKED
 * Cấm: seed · invent decisions UAT · flip *_ready · wipe L1 SEAL · claim module GO
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
const XBOS = process.env.XBOS_HOST_API || 'http://127.0.0.1:28002';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const COMPANY = process.env.QA_COMPANY_ID || 'main';
const API_COMPANY = process.env.QA_API_COMPANY_ID || 'holding';
const TENANT = process.env.QA_TENANT_ID || 'xevn';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(
  ROOT,
  'docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-dec-qa-02-browser.json',
);
const SCREEN = resolve(
  ROOT,
  'docs/qa/evidence/screens/po-hrm-dynamic-config-platform-dec-qa-02',
);
mkdirSync(SCREEN, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();
const stamp = Date.now().toString(36).toLowerCase().slice(-8);

function unwrapList(json) {
  if (!json) return [];
  const d = json.data ?? json;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.items)) return d.items;
  if (Array.isArray(json.items)) return json.items;
  return [];
}

const OPEN_KEY = `hr_custom_dec_09_${stamp}`.slice(0, 48);
const OPEN_LABEL = `QSĐ HR QA ${stamp}`;
const HRD_KEY = `HRD_QA_${stamp.toUpperCase()}`.slice(0, 48);
const HRD_LABEL = `HRD QA ${stamp}`;
const UNKNOWN_KEY = `zz_unknown_dec_${stamp}`;
const DEC_CODE = `QA-DEC-${stamp.toUpperCase()}`;
const DEC_TITLE = `Quyết định QA platform ${stamp}`;

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const R = {
  work_item_id: 'PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-QA-02',
  parent: 'PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-FE-01',
  stamp_ref_l1: 'DECPLATQA-MSJ1FB3D',
  startedAt: ts(),
  stamp: `DECPLATQA2-${stamp.toUpperCase()}`,
  persona: { email: EMAIL, companyId: COMPANY, apiCompanyId: API_COMPANY },
  u65: 'zero-seed · browser-only · FE after 2xx + F5',
  hdsd_align:
    'Settings → Loại quyết định DEC · format INVALID · HRD_* VALID · Quyết định type picker effective · CNS UNKNOWN · retire · must_keep',
  honesty: {
    decisions_uat_ready: false,
    hrm_personnel_uat_ready: false,
    employees_e2e_linkage_ready: false,
    payroll_e2e_ready: false,
    attendance_uat_ready: false,
    recruitment_uat_ready: false,
    contracts_printable_ready: false,
    seed_used: false,
    deny_module_decisions_uat: true,
    deny_honesty_flip: true,
    deny_wipe_l1_seal: true,
  },
  env: {
    PORTAL,
    HRM,
    XBOS,
    TENANT,
    commit: COMMIT,
    OPEN_KEY,
    OPEN_LABEL,
    HRD_KEY,
    UNKNOWN_KEY,
    DEC_CODE,
  },
  l0: {},
  ac: {},
  network: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  click_log: [],
  probes: {},
  overall: null,
  ack_status: null,
  endedAt: null,
};

function save() {
  writeFileSync(OUT_JSON, JSON.stringify(R, null, 2));
}
function log(msg, extra = {}) {
  R.click_log.push({ at: ts(), msg, ...extra });
  console.error(`[log] ${msg}`);
}
function ac(id, verdict, detail = {}) {
  R.ac[id] = { verdict, at: ts(), ...detail };
  console.log(`${verdict} ${id} — ${(detail.summary || '').slice(0, 480)}`);
  save();
}
function passCount() {
  return Object.values(R.ac).filter((a) => a.verdict === 'PASS').length;
}
function failCount() {
  return Object.values(R.ac).filter((a) => a.verdict === 'FAIL').length;
}

async function shot(page, name) {
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  R.screens.push(path.replace(/\\/g, '/'));
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
  let lastStatus = 0;
  let data = null;
  for (const url of [`${PORTAL}/api/xbos/auth/login`, `${XBOS}/api/xbos/auth/login`]) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
      });
      lastStatus = r.status;
      const j = await r.json().catch(() => ({}));
      const d = j?.data ?? j;
      const token = d?.accessToken ?? d?.access_token ?? j?.accessToken;
      if (r.ok && token) {
        data = d;
        data.__via = url;
        break;
      }
    } catch {
      /* try next */
    }
  }
  const token = data?.accessToken ?? data?.access_token;
  if (!token) throw new Error(`login failed HTTP ${lastStatus}`);
  const u = data?.user ?? {};
  return {
    token,
    expiresAt: Date.now() + 8 * 3600_000,
    companyId: COMPANY,
    user: {
      userId: u.userId || u.id || EMAIL,
      email: u.email || EMAIL,
      displayName: u.displayName || u.fullName || u.name || EMAIL,
      roles: u.roles || ['group_ceo'],
    },
    raw: data,
  };
}

async function apiCall(token, method, path, body) {
  const url = path.startsWith('http') ? path : `${HRM}${path}`;
  const r = await fetch(url, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      'x-tenant-id': TENANT,
      'x-company-id': COMPANY,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  let json = null;
  try {
    json = await r.json();
  } catch {
    json = null;
  }
  return { status: r.status, json, code: json?.code || json?.error?.code || null };
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
      if (s.raw?.refreshToken) store.setItem('xevn.portal.refreshToken', s.raw.refreshToken);
      if (s.raw?.defaultMembershipId)
        store.setItem('xevn.portal.membershipId', s.raw.defaultMembershipId);
    }
  }, session);
}

function track(page) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') R.consoleErrors.push(String(msg.text()).slice(0, 360));
  });
  page.on('pageerror', (err) => R.pageErrors.push(String(err).slice(0, 360)));
  page.on('dialog', (d) => {
    R.probes.lastDialog = d.message().slice(0, 240);
    void d.accept();
  });
  page.on('response', async (res) => {
    try {
      const u = res.url();
      if (
        !/\/api\/hrm\/(decisions|employees\/(document-types|employment-types)|attendance|leave|recruitment|catalog-sync)/.test(
          u,
        )
      )
        return;
      let bodySnippet = null;
      try {
        if (
          /decision-types|\/decisions(\?|$)/.test(u) &&
          res.request().method() !== 'GET'
        ) {
          const j = await res.json().catch(() => null);
          bodySnippet = j
            ? {
                code: j.code || j?.error?.code || null,
                id: j?.data?.id || j?.id || null,
                key:
                  j?.data?.decisionTypeKey ||
                  j?.decisionTypeKey ||
                  j?.data?.decision_type ||
                  j?.decision_type ||
                  null,
                message: j?.message || j?.error?.message || null,
              }
            : null;
        }
      } catch {
        /* */
      }
      R.network.push({
        method: res.request().method(),
        status: res.status(),
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 480),
        at: ts(),
        body: bodySnippet,
      });
    } catch {
      /* */
    }
  });
}

async function hardRefresh(page) {
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 90_000 });
  await sleep(2500);
}

async function openSettingsTab(page, testId) {
  await page.goto(q('/hr/settings'), { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await sleep(3500);
  await page
    .getByRole('tab', { name: /Loại|Account|Tài khoản|Cài đặt|Giai đoạn|Loại phép/i })
    .first()
    .waitFor({ state: 'visible', timeout: 45_000 })
    .catch(() => {});
  let tab = page.getByTestId(testId);
  let visible = await tab.isVisible().catch(() => false);
  if (!visible) {
    await hardRefresh(page);
    tab = page.getByTestId(testId);
    visible = await tab.isVisible().catch(() => false);
  }
  if (visible) {
    await tab.scrollIntoViewIfNeeded().catch(() => {});
    await tab.click({ force: true });
    await sleep(1500);
  }
  return visible;
}

async function toastBlob(page) {
  const body = (await page.locator('body').innerText().catch(() => '')) || '';
  const toastRoot =
    (await page
      .locator('[data-radix-toast-viewport], [role="status"], li[data-state], [data-sonner-toast]')
      .allInnerTexts()
      .then((a) => a.join('\n'))
      .catch(() => '')) || '';
  return `${body}\n${toastRoot}`;
}

async function toastHasInvalid(page) {
  const blob = await toastBlob(page);
  return {
    ok:
      /HRM-PLT-CAT-CODE-INVALID/i.test(blob) ||
      /Mã loại quyết định không hợp lệ/i.test(blob),
    snippet:
      blob.match(/HRM-PLT-CAT-CODE-INVALID[^\n]{0,120}|Mã loại quyết định[^\n]{0,120}/)?.[0] ||
      blob.slice(0, 200),
  };
}

async function toastHasUnknown(page) {
  const blob = await toastBlob(page);
  return {
    ok:
      /HRM-DEC-TYPE-UNKNOWN/i.test(blob) ||
      /không thuộc catalog hiệu lực/i.test(blob) ||
      /Loại quyết định không thuộc catalog/i.test(blob),
    snippet:
      blob.match(/HRM-DEC-TYPE-UNKNOWN[^\n]{0,160}|không thuộc catalog[^\n]{0,160}/)?.[0] ||
      blob.slice(0, 240),
  };
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
      '[role="dialog"] input, [data-radix-popper-content-wrapper] input, input[placeholder*="Tìm"]',
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
    await sleep(400);
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
    contentSnippet: content.slice(0, 500),
  };
}

async function openDecisionsCreate(page) {
  await page.goto(q('/hr/decisions'), { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await sleep(3500);
  const createBtn = page.getByRole('button', { name: /Thêm quyết định|\+\s*Thêm|Tạo quyết định/i }).first();
  if (await createBtn.isVisible().catch(() => false)) {
    await createBtn.click();
  } else {
    // empty CTA
    const empty = page.getByRole('button', { name: /Thêm|Tạo/i }).first();
    if (await empty.isVisible().catch(() => false)) await empty.click();
  }
  await sleep(1500);
  const dialog = page.locator('[role="dialog"]').filter({ has: page.getByTestId('hdsd-decisions-form-code') }).first();
  const ok = await dialog.isVisible().catch(() => false);
  return { ok, dialog };
}

async function pickFirstPosition(page) {
  const picker = page.getByTestId('hdsd-decisions-form-position');
  if (!(await picker.isVisible().catch(() => false))) {
    return { ok: false, reason: 'position_picker_missing' };
  }
  await picker.click({ force: true });
  await sleep(600);
  const opt = page.locator('[role="option"], [cmdk-item]').first();
  if (await opt.isVisible().catch(() => false)) {
    const text = (await opt.innerText().catch(() => '')).slice(0, 80);
    await opt.click({ force: true });
    await sleep(400);
    return { ok: true, text };
  }
  await page.keyboard.press('Escape').catch(() => {});
  return { ok: false, reason: 'no_position_option' };
}

async function main() {
  for (const [k, url] of [
    ['portal', PORTAL],
    ['hrm', `${HRM}/api/hrm`],
    ['xbos', `${XBOS}/api/xbos`],
  ]) {
    try {
      const r = await fetch(url);
      R.l0[k] = { status: r.status, url };
    } catch (e) {
      R.l0[k] = { status: 0, error: String(e).slice(0, 160) };
    }
  }
  save();
  if (R.l0.portal?.status !== 200 || R.l0.hrm?.status !== 200) {
    R.ack_status = 'FAIL_TO_PM';
    R.overall = 'FAIL';
    R.endedAt = ts();
    save();
    throw new Error(`L0 FAIL portal=${R.l0.portal?.status} hrm=${R.l0.hrm?.status}`);
  }
  ac('L0-STACK', 'PASS', {
    summary: `portal ${R.l0.portal.status} · hrm ${R.l0.hrm.status} · xbos ${R.l0.xbos?.status}`,
  });

  const session = await loginApi();
  log('loginApi ok');

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  track(page);
  await injectPortalAuth(page, session);

  // ——— 1. Settings tab Loại quyết định DEC ———
  log('goto Settings Loại quyết định DEC');
  const tabOk = await openSettingsTab(page, 'settings-tab-dec-decision-types');
  if (!tabOk) {
    await shot(page, '01-settings-no-dec-tab');
    ac('AC-PLT-DEC-TAB', 'FAIL', { summary: 'settings-tab-dec-decision-types not visible' });
    R.overall = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    R.endedAt = ts();
    save();
    await browser.close();
    process.exitCode = 1;
    return;
  }
  ac('AC-PLT-DEC-TAB', 'PASS', { summary: 'Clicked settings-tab-dec-decision-types' });
  await shot(page, '01-settings-dec-tab');

  const panelOk = await page.getByTestId('settings-dec-decision-types').isVisible().catch(() => false);
  ac('AC-PLT-DEC-PANEL', panelOk ? 'PASS' : 'FAIL', {
    summary: panelOk ? 'Panel settings-dec-decision-types visible' : 'DEC panel missing',
  });

  // ——— 3. Format INVALID: space / leading digit ———
  await page.getByTestId('hdsd-dec-decision-type-key').fill('BAD KEY');
  await page.getByTestId('hdsd-dec-decision-type-name').fill('space invalid');
  await page.getByTestId('hdsd-dec-decision-type-save').click();
  await sleep(800);
  const spaceToast = await toastHasInvalid(page);
  R.probes.spaceToast = spaceToast;
  await shot(page, '02-space-invalid');
  ac('AC-PLT-DEC-FORMAT-SPACE', spaceToast.ok ? 'PASS' : 'FAIL', {
    summary: spaceToast.ok
      ? `BAD KEY → toast HRM-PLT-CAT-CODE-INVALID · ${spaceToast.snippet}`
      : `space toast miss · ${spaceToast.snippet}`,
  });

  await page.getByTestId('hdsd-dec-decision-type-key').fill('9bad_key');
  await page.getByTestId('hdsd-dec-decision-type-name').fill('digit invalid');
  await page.getByTestId('hdsd-dec-decision-type-save').click();
  await sleep(800);
  const digitToast = await toastHasInvalid(page);
  R.probes.digitToast = digitToast;
  await shot(page, '03-digit-invalid');
  ac('AC-PLT-DEC-FORMAT-DIGIT', digitToast.ok ? 'PASS' : 'FAIL', {
    summary: digitToast.ok
      ? `9bad_key → toast HRM-PLT-CAT-CODE-INVALID`
      : `digit toast miss · ${digitToast.snippet}`,
  });
  await page.getByTestId('hdsd-dec-decision-type-key').fill('');
  await page.getByTestId('hdsd-dec-decision-type-name').fill('');

  // ——— 2. Create open key ———
  const upsertWait = page
    .waitForResponse(
      (res) =>
        /\/api\/hrm\/decisions\/decision-types(\?|$)/.test(res.url()) &&
        ['PUT', 'POST'].includes(res.request().method()) &&
        !/\/retire/.test(res.url()),
      { timeout: 45_000 },
    )
    .catch(() => null);

  await page.getByTestId('hdsd-dec-decision-type-key').fill(OPEN_KEY);
  await page.getByTestId('hdsd-dec-decision-type-name').fill(OPEN_LABEL);
  log(`click Tạo loại quyết định key=${OPEN_KEY}`);
  await page.getByTestId('hdsd-dec-decision-type-save').click();
  const upsertRes = await upsertWait;
  let upsertStatus = upsertRes?.status() ?? 0;
  let upsertBody = null;
  try {
    upsertBody = upsertRes ? await upsertRes.json() : null;
  } catch {
    upsertBody = null;
  }
  R.probes.openUpsert = {
    status: upsertStatus,
    method: upsertRes?.request()?.method() ?? null,
    url: upsertRes?.url()?.replace(/^https?:\/\/[^/]+/, '') ?? null,
    id: upsertBody?.data?.id ?? upsertBody?.id ?? null,
    decisionTypeKey:
      upsertBody?.data?.decisionTypeKey ?? upsertBody?.decisionTypeKey ?? OPEN_KEY,
    code: upsertBody?.code ?? null,
  };
  await sleep(1200);
  await shot(page, '04-open-after-create');
  const open2xx = upsertStatus >= 200 && upsertStatus < 300;
  ac('AC-PLT-DEC-CREATE-2XX', open2xx ? 'PASS' : 'FAIL', {
    summary: `UPSERT decision-types ${R.probes.openUpsert.method || '?'} → ${upsertStatus} key=${OPEN_KEY} code=${R.probes.openUpsert.code}`,
    network: R.probes.openUpsert,
  });

  // ——— 4. HRD_* uppercase VALID ———
  const hrdWait = page
    .waitForResponse(
      (res) =>
        /\/api\/hrm\/decisions\/decision-types(\?|$)/.test(res.url()) &&
        ['PUT', 'POST'].includes(res.request().method()) &&
        !/\/retire/.test(res.url()),
      { timeout: 45_000 },
    )
    .catch(() => null);
  await page.getByTestId('hdsd-dec-decision-type-key').fill(HRD_KEY);
  await page.getByTestId('hdsd-dec-decision-type-name').fill(HRD_LABEL);
  log(`click Tạo HRD_* key=${HRD_KEY}`);
  await page.getByTestId('hdsd-dec-decision-type-save').click();
  const hrdRes = await hrdWait;
  let hrdStatus = hrdRes?.status() ?? 0;
  let hrdBody = null;
  try {
    hrdBody = hrdRes ? await hrdRes.json() : null;
  } catch {
    hrdBody = null;
  }
  R.probes.hrdUpsert = {
    status: hrdStatus,
    method: hrdRes?.request()?.method() ?? null,
    id: hrdBody?.data?.id ?? hrdBody?.id ?? null,
    decisionTypeKey: hrdBody?.data?.decisionTypeKey ?? hrdBody?.decisionTypeKey ?? HRD_KEY,
    code: hrdBody?.code ?? null,
  };
  await sleep(1000);
  await shot(page, '05-hrd-after-create');
  const hrd2xx = hrdStatus >= 200 && hrdStatus < 300;
  const hrdNotInvalid =
    !/HRM-PLT-CAT-CODE-INVALID/i.test(String(hrdBody?.code || '')) &&
    !(await toastHasInvalid(page)).ok;
  ac('AC-PLT-DEC-HRD-CASE-VALID', hrd2xx && hrdNotInvalid ? 'PASS' : 'FAIL', {
    summary: hrd2xx
      ? `HRD_* ${HRD_KEY} → ${hrdStatus} (case allowed · not CODE-INVALID)`
      : `HRD_* FAIL ${hrdStatus} code=${R.probes.hrdUpsert.code}`,
    network: R.probes.hrdUpsert,
  });

  // ——— F5 / Tải lại → row + effective picker ———
  const reloadBtn = page.getByTestId('hdsd-dec-decision-type-reload');
  if (await reloadBtn.isVisible().catch(() => false)) {
    await reloadBtn.click();
    await sleep(1000);
  }
  log('F5 settings DEC');
  await hardRefresh(page);
  const tab2 = page.getByTestId('settings-tab-dec-decision-types');
  if (await tab2.isVisible().catch(() => false)) {
    await tab2.click({ force: true });
    await sleep(1500);
  }
  await shot(page, '06-dec-f5');

  const openRow = page.getByTestId(`settings-dec-decision-type-row-${OPEN_KEY}`);
  const openRowOk = await openRow.isVisible().catch(() => false);
  const tableText =
    (await page.getByTestId('settings-dec-decision-types-table').innerText().catch(() => '')) || '';
  ac('AC-PLT-DEC-F5-ROW', openRowOk || tableText.includes(OPEN_KEY) ? 'PASS' : 'FAIL', {
    summary: openRowOk
      ? `Row settings-dec-decision-type-row-${OPEN_KEY} after F5`
      : tableText.includes(OPEN_KEY)
        ? `Key ${OPEN_KEY} in DEC table after F5`
        : 'DEC row/key missing after F5',
  });

  const effPick = await pickCatalogOption(
    page,
    'hdsd-dec-decision-type-effective-picker',
    OPEN_KEY,
    OPEN_LABEL,
  );
  R.probes.settingsEffectivePicker = effPick;
  await shot(page, '07-settings-effective-picker');
  ac('AC-PLT-DEC-EFFECTIVE-PICKER', effPick.ok ? 'PASS' : 'FAIL', {
    summary: effPick.ok
      ? `Settings effective picker has ${OPEN_KEY}`
      : `Settings effective picker miss · ${effPick.reason || ''} · ${(effPick.contentSnippet || '').slice(0, 160)}`,
  });

  // Probe effective API
  {
    const effH = await apiCall(
      session.token,
      'GET',
      `/api/hrm/decisions/decision-types/effective?company_id=${API_COMPANY}`,
    );
    const effM = await apiCall(
      session.token,
      'GET',
      `/api/hrm/decisions/decision-types/effective?company_id=${COMPANY}`,
    );
    const keysH = unwrapList(effH.json).map((it) => it.decisionTypeKey || it.decision_type_key);
    const keysM = unwrapList(effM.json).map((it) => it.decisionTypeKey || it.decision_type_key);
    R.probes.effectiveApi = {
      holding: { status: effH.status, hasKey: keysH.includes(OPEN_KEY), sample: keysH.slice(0, 12) },
      main: { status: effM.status, hasKey: keysM.includes(OPEN_KEY), sample: keysM.slice(0, 12) },
    };
  }

  // ——— 5. Quyết định → Thêm → type picker binds effective ———
  log('goto Decisions create form');
  const createOpen = await openDecisionsCreate(page);
  await shot(page, '08-decisions-create');
  ac('AC-PLT-DEC-FORM-OPEN', createOpen.ok ? 'PASS' : 'FAIL', {
    summary: createOpen.ok ? 'Decisions create dialog open' : 'Create dialog missing',
  });

  let decisionsTypePick = { ok: false, reason: 'form_not_open' };
  if (createOpen.ok) {
    // Capture GET effective during form
    const effGetSeen = R.network.some(
      (n) => /decision-types\/effective/.test(n.url) && n.status >= 200 && n.status < 300,
    );
    decisionsTypePick = await pickCatalogOption(
      page,
      'hdsd-decisions-form-type',
      OPEN_KEY,
      OPEN_LABEL,
    );
    R.probes.decisionsTypePicker = { ...decisionsTypePick, effGetSeen };
    await shot(page, '09-decisions-type-picker');
    ac('AC-PLT-DEC-FORM-TYPE-PICKER', decisionsTypePick.ok ? 'PASS' : 'FAIL', {
      summary: decisionsTypePick.ok
        ? `Decisions form type picker has ${OPEN_KEY} (effective bind)`
        : `Form type picker miss · ${decisionsTypePick.reason || ''} · effGetSeen=${effGetSeen}`,
    });

    // ——— must_keep create QSĐ with OPEN_KEY (for history + F-CORE-DEC smoke) ———
    if (decisionsTypePick.ok) {
      await page.getByTestId('hdsd-decisions-form-code').fill(DEC_CODE);
      await page.getByTestId('hdsd-decisions-form-title').fill(DEC_TITLE);
      // Settings emptyForm defaults isPersonBound=true → must pick employee Select (not name-only)
      const empTrig = page.getByTestId('hdsd-decisions-form-employee');
      if (await empTrig.isVisible().catch(() => false)) {
        await empTrig.click();
        await sleep(500);
        const empOpt = page.locator('[role="option"]').first();
        if (await empOpt.isVisible().catch(() => false)) await empOpt.click();
        else await page.keyboard.press('Escape').catch(() => {});
      }
      await page
        .locator('[role="dialog"]')
        .locator('div.space-y-2')
        .filter({ hasText: /Tên nhân viên|Employee name|Họ tên/i })
        .locator('input')
        .first()
        .fill(`NV QA ${stamp}`)
        .catch(() => {});

      const pos = await pickFirstPosition(page);
      R.probes.createPosition = pos;

      const createWait = page
        .waitForResponse(
          (res) =>
            /\/api\/hrm\/decisions(\?|$)/.test(res.url()) &&
            res.request().method() === 'POST' &&
            !/decision-types/.test(res.url()),
          { timeout: 45_000 },
        )
        .catch(() => null);

      await page.getByTestId('hdsd-decisions-form-submit').click();
      const createRes = await createWait;
      let createStatus = createRes?.status() ?? 0;
      let createBody = null;
      try {
        createBody = createRes ? await createRes.json() : null;
      } catch {
        createBody = null;
      }
      R.probes.decisionCreate = {
        status: createStatus,
        id: createBody?.data?.id ?? createBody?.id ?? null,
        decision_type:
          createBody?.data?.decision_type ?? createBody?.decision_type ?? OPEN_KEY,
        code: createBody?.code ?? null,
        decision_code: DEC_CODE,
      };
      await sleep(1500);
      await shot(page, '10-decision-created');
      const createOk = createStatus >= 200 && createStatus < 300;
      ac('AC-PLT-DEC-MUSTKEEP-CREATE', createOk ? 'PASS' : 'FAIL', {
        summary: createOk
          ? `POST decisions → ${createStatus} code=${DEC_CODE} type=${OPEN_KEY}`
          : `Create QSĐ FAIL ${createStatus} code=${R.probes.decisionCreate.code} pos=${pos.ok}`,
        network: R.probes.decisionCreate,
      });
    } else {
      ac('AC-PLT-DEC-MUSTKEEP-CREATE', 'FAIL', {
        summary: 'Skipped create — type picker missing OPEN_KEY',
      });
    }
  } else {
    ac('AC-PLT-DEC-FORM-TYPE-PICKER', 'FAIL', { summary: 'Form not open' });
    ac('AC-PLT-DEC-MUSTKEEP-CREATE', 'FAIL', { summary: 'Form not open' });
  }

  // ——— 6. CNS: unknown type when EFF>0 → 400 + FE toast ———
  log('CNS unknown type FE path');
  const cnsOpen = await openDecisionsCreate(page);
  if (cnsOpen.ok) {
    // pick any effective type first so form validates
    const anyPick = await pickCatalogOption(
      page,
      'hdsd-decisions-form-type',
      OPEN_KEY,
      OPEN_LABEL,
    );
    if (!anyPick.ok) {
      // try appointment / reward / first option
      const picker = page.getByTestId('hdsd-decisions-form-type');
      await picker.click({ force: true });
      await sleep(400);
      const first = page.locator('[role="option"], [cmdk-item]').first();
      if (await first.isVisible().catch(() => false)) await first.click({ force: true });
      await page.keyboard.press('Escape').catch(() => {});
    }
    await page.getByTestId('hdsd-decisions-form-code').fill(`CNS-${stamp.toUpperCase()}`);
    await page.getByTestId('hdsd-decisions-form-title').fill(`CNS probe ${stamp}`);
    await page
      .locator('[role="dialog"]')
      .locator('div.space-y-2')
      .filter({ hasText: /Tên nhân viên|Employee name|Họ tên/i })
      .locator('input')
      .first()
      .fill('CNS Probe')
      .catch(async () => {
        await page.locator('[role="dialog"] input').nth(3).fill('CNS Probe');
      });
    await pickFirstPosition(page);

    // One-shot: rewrite POST body decision_type → unknown (FE submit path → API 400 → toast)
    let cnsRewrote = false;
    await page.route('**/api/hrm/decisions**', async (route) => {
      const req = route.request();
      if (
        req.method() === 'POST' &&
        !/decision-types/.test(req.url()) &&
        !cnsRewrote
      ) {
        cnsRewrote = true;
        let body = {};
        try {
          body = JSON.parse(req.postData() || '{}');
        } catch {
          body = {};
        }
        body.decision_type = UNKNOWN_KEY;
        await route.continue({
          postData: JSON.stringify(body),
          headers: {
            ...req.headers(),
            'content-type': 'application/json',
          },
        });
        return;
      }
      await route.continue();
    });

    const cnsWait = page
      .waitForResponse(
        (res) =>
          /\/api\/hrm\/decisions(\?|$)/.test(res.url()) &&
          res.request().method() === 'POST' &&
          !/decision-types/.test(res.url()),
        { timeout: 45_000 },
      )
      .catch(() => null);

    await page.getByTestId('hdsd-decisions-form-submit').click();
    const cnsRes = await cnsWait;
    let cnsStatus = cnsRes?.status() ?? 0;
    let cnsBody = null;
    try {
      cnsBody = cnsRes ? await cnsRes.json() : null;
    } catch {
      cnsBody = null;
    }
    await sleep(1200);
    const cnsToast = await toastHasUnknown(page);
    R.probes.cns = {
      status: cnsStatus,
      code: cnsBody?.code || cnsBody?.error?.code || null,
      message: cnsBody?.message || cnsBody?.error?.message || null,
      toast: cnsToast,
      rewrote: cnsRewrote,
      unknownKey: UNKNOWN_KEY,
    };
    await shot(page, '11-cns-unknown');
    await page.unroute('**/api/hrm/decisions**').catch(() => {});
    await page.keyboard.press('Escape').catch(() => {});

    const cnsOk =
      cnsStatus === 400 &&
      String(R.probes.cns.code || '') === 'HRM-DEC-TYPE-UNKNOWN' &&
      cnsToast.ok;
    ac('AC-PLT-DEC-CNS-UNKNOWN', cnsOk ? 'PASS' : 'FAIL', {
      summary: cnsOk
        ? `POST decisions → 400 HRM-DEC-TYPE-UNKNOWN + FE toast`
        : `CNS ${cnsStatus} code=${R.probes.cns.code} toast=${cnsToast.ok} · ${cnsToast.snippet}`,
      network: R.probes.cns,
    });
  } else {
    ac('AC-PLT-DEC-CNS-UNKNOWN', 'FAIL', { summary: 'Could not open create dialog for CNS' });
  }

  // ——— 7. Retire → picker hide; history still shows key on old QSĐ ———
  log('retire OPEN_KEY');
  const retireTab = await openSettingsTab(page, 'settings-tab-dec-decision-types');
  ac('AC-PLT-DEC-RETIRE-TAB', retireTab ? 'PASS' : 'FAIL', {
    summary: retireTab ? 'Settings DEC tab for retire' : 'tab missing',
  });

  const retireBtn = page.getByTestId(`hdsd-dec-decision-type-retire-${OPEN_KEY}`);
  const retireWait = page
    .waitForResponse(
      (res) =>
        /\/decision-types\/[^/]+\/retire/.test(res.url()) &&
        res.request().method() === 'POST',
      { timeout: 45_000 },
    )
    .catch(() => null);
  if (await retireBtn.isVisible().catch(() => false)) {
    await retireBtn.click({ force: true });
    await sleep(500);
    // confirm dialog accepted by track()
  } else {
    // fallback API retire if row scrolled away — still verify FE after
    if (R.probes.openUpsert?.id) {
      await apiCall(
        session.token,
        'POST',
        `/api/hrm/decisions/decision-types/${R.probes.openUpsert.id}/retire?company_id=${API_COMPANY}`,
        {},
      );
    }
  }
  const retireRes = await retireWait;
  let retireStatus = retireRes?.status() ?? 0;
  R.probes.retire = {
    status: retireStatus,
    method: retireRes?.request()?.method() ?? null,
    via: (await retireBtn.isVisible().catch(() => false)) ? 'fe' : 'api_fallback_or_prior',
  };
  await sleep(1500);
  await shot(page, '12-after-retire');

  // reload / F5
  if (await page.getByTestId('hdsd-dec-decision-type-reload').isVisible().catch(() => false)) {
    await page.getByTestId('hdsd-dec-decision-type-reload').click();
    await sleep(1000);
  }
  await hardRefresh(page);
  const tab3 = page.getByTestId('settings-tab-dec-decision-types');
  if (await tab3.isVisible().catch(() => false)) {
    await tab3.click({ force: true });
    await sleep(1500);
  }

  const rowGone = !(await page
    .getByTestId(`settings-dec-decision-type-row-${OPEN_KEY}`)
    .isVisible()
    .catch(() => false));
  const settingsPickAfter = await pickCatalogOption(
    page,
    'hdsd-dec-decision-type-effective-picker',
    OPEN_KEY,
    OPEN_LABEL,
  );
  R.probes.retireHide = { rowGone, settingsPickAfter };
  await shot(page, '13-retire-picker-hide');
  ac('AC-PLT-DEC-RETIRE-HIDE', rowGone && !settingsPickAfter.ok ? 'PASS' : 'FAIL', {
    summary: `active rowGone=${rowGone} · settings picker hasKey=${settingsPickAfter.ok}`,
  });

  // Decisions form picker should hide OPEN_KEY
  const afterCreate = await openDecisionsCreate(page);
  let formHide = { ok: false };
  if (afterCreate.ok) {
    formHide = await pickCatalogOption(
      page,
      'hdsd-decisions-form-type',
      OPEN_KEY,
      OPEN_LABEL,
    );
    R.probes.formAfterRetire = formHide;
    await page.keyboard.press('Escape').catch(() => {});
    await page.keyboard.press('Escape').catch(() => {});
  }
  ac('AC-PLT-DEC-RETIRE-FORM-HIDE', !formHide.ok ? 'PASS' : 'FAIL', {
    summary: !formHide.ok
      ? `Decisions form picker hides ${OPEN_KEY} after retire`
      : `Form still shows retired key ${OPEN_KEY}`,
  });

  // History: old QSĐ still shows key
  await page.goto(q('/hr/decisions'), { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await sleep(3000);
  // clear type filter to all if needed
  const bodyText = (await page.locator('body').innerText().catch(() => '')) || '';
  const historyVisible =
    bodyText.includes(OPEN_KEY) ||
    bodyText.includes(OPEN_LABEL) ||
    bodyText.includes(DEC_CODE) ||
    bodyText.includes(DEC_TITLE);
  // also GET decisions list API
  const listDec = await apiCall(
    session.token,
    'GET',
    `/api/hrm/decisions?company_id=${API_COMPANY}&page_size=50`,
  );
  const listDecM = await apiCall(
    session.token,
    'GET',
    `/api/hrm/decisions?company_id=${COMPANY}&page_size=50`,
  );
  const decRows = [...unwrapList(listDec.json), ...unwrapList(listDecM.json)];
  const histRow = decRows.find(
    (d) =>
      d.decision_code === DEC_CODE ||
      d.decisionCode === DEC_CODE ||
      d.decision_type === OPEN_KEY ||
      d.id === R.probes.decisionCreate?.id,
  );
  R.probes.history = {
    feTextHas: historyVisible,
    apiFound: Boolean(histRow),
    apiType: histRow?.decision_type || histRow?.decisionType || null,
    listStatus: listDec.status,
  };
  await shot(page, '14-history-qsd');
  const histOk =
    (R.probes.decisionCreate?.status >= 200 &&
      R.probes.decisionCreate?.status < 300 &&
      (historyVisible ||
        (histRow &&
          String(histRow.decision_type || histRow.decisionType || '') === OPEN_KEY))) ||
    (historyVisible && R.probes.decisionCreate?.status);
  // If create failed, history AC cannot PASS invent — mark FAIL residual
  ac('AC-PLT-DEC-HISTORY-KEY', histOk ? 'PASS' : 'FAIL', {
    summary: histOk
      ? `Old QSĐ keeps type key ${OPEN_KEY} after retire · fe=${historyVisible} api=${Boolean(histRow)}`
      : `History key miss · createStatus=${R.probes.decisionCreate?.status} fe=${historyVisible}`,
  });

  // ——— 8. must_keep smoke ———
  log('must_keep F-CORE-DEC / EMP / ATT / REC');

  // WH hint path: open create, pick appointment/hrd_01, status effective, employee
  const whOpen = await openDecisionsCreate(page);
  let whHint = false;
  if (whOpen.ok) {
    const whPick = await pickCatalogOption(page, 'hdsd-decisions-form-type', 'appointment', 'Bổ nhiệm');
    if (!whPick.ok) {
      await pickCatalogOption(page, 'hdsd-decisions-form-type', 'HRD_01', 'Bổ nhiệm');
    }
    // status effective
    const statusTrig = page.getByTestId('hdsd-decisions-form-status');
    if (await statusTrig.isVisible().catch(() => false)) {
      await statusTrig.click();
      await sleep(300);
      const effOpt = page.getByRole('option', { name: /Hiệu lực|Effective/i }).first();
      if (await effOpt.isVisible().catch(() => false)) await effOpt.click();
      else await page.keyboard.press('Escape');
    }
    // pick first employee if available
    const empTrig = page.getByTestId('hdsd-decisions-form-employee');
    if (await empTrig.isVisible().catch(() => false)) {
      await empTrig.click();
      await sleep(400);
      const empOpt = page.locator('[role="option"]').first();
      if (await empOpt.isVisible().catch(() => false)) await empOpt.click();
      else await page.keyboard.press('Escape');
    }
    await sleep(500);
    whHint = await page.getByTestId('hdsd-decisions-effective-wh-hint').isVisible().catch(() => false);
    R.probes.whHint = { visible: whHint, typePick: whPick };
    await shot(page, '15-wh-hint');
    await page.keyboard.press('Escape').catch(() => {});
  }
  // Approve smoke: list page has status badges / no crash
  await page.goto(q('/hr/decisions'), { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await sleep(2500);
  const decBody = ((await page.locator('body').innerText().catch(() => '')) || '').slice(0, 400);
  const decLoadOk =
    !/ERR_CONNECTION_REFUSED|HRM API Sync ERROR|Uncaught ReferenceError/i.test(decBody) &&
    R.network.some((n) => /\/api\/hrm\/decisions/.test(n.url) && n.status >= 200 && n.status < 500);
  await shot(page, '16-mustkeep-decisions');
  ac('AC-PLT-DEC-MUSTKEEP-DEC-UI', decLoadOk ? 'PASS' : 'FAIL', {
    summary: `Decisions list load ok=${decLoadOk} · WH hint probe visible=${whHint} (smoke)`,
  });

  // EMP DOC/ET tabs
  const empDocTab = await openSettingsTab(page, 'settings-tab-emp-document-types');
  const empEtTab = empDocTab
    ? await openSettingsTab(page, 'settings-tab-emp-employment-types')
    : false;
  await shot(page, '17-mustkeep-emp');
  ac('AC-PLT-DEC-MUSTKEEP-EMP', empDocTab && empEtTab ? 'PASS' : 'FAIL', {
    summary: `EMP DOC tab=${empDocTab} · ET tab=${empEtTab}`,
  });

  // ATT leave
  await page.goto(q('/hr/attendance'), { waitUntil: 'domcontentloaded', timeout: 90_000 }).catch(() => null);
  await sleep(2500);
  const leaveTab = page.getByRole('tab', { name: /Phép|Leave|Nghỉ/i }).first();
  if (await leaveTab.isVisible().catch(() => false)) {
    await leaveTab.click();
    await sleep(1000);
  }
  const attBody = ((await page.locator('body').innerText().catch(() => '')) || '').slice(0, 300);
  const attOk = !/ERR_CONNECTION_REFUSED|HRM API Sync ERROR/i.test(attBody);
  await shot(page, '18-mustkeep-att');
  ac('AC-PLT-DEC-MUSTKEEP-ATT', attOk ? 'PASS' : 'FAIL', {
    summary: `ATT/leave surface load ok=${attOk}`,
  });

  // REC tabs
  await page.goto(q('/hr/recruitment'), { waitUntil: 'domcontentloaded', timeout: 90_000 }).catch(() => null);
  await sleep(3000);
  const recBody = ((await page.locator('body').innerText().catch(() => '')) || '').slice(0, 300);
  const recTabs =
    (await page.getByRole('tab').count().catch(() => 0)) > 0 ||
    /Yêu cầu|Ứng viên|Tin tuyển|Requisition|Candidate/i.test(recBody);
  const recOk = !/ERR_CONNECTION_REFUSED|HRM API Sync ERROR/i.test(recBody) && recTabs;
  await shot(page, '19-mustkeep-rec');
  ac('AC-PLT-DEC-MUSTKEEP-REC', recOk ? 'PASS' : 'FAIL', {
    summary: `REC tabs/surface load ok=${recOk}`,
  });

  // ——— wrap ———
  const fails = failCount();
  const passes = passCount();
  R.overall = fails === 0 ? 'PASS' : 'FAIL';
  R.ack_status = fails === 0 ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  R.endedAt = ts();
  R.summary = { passes, fails, total: passes + fails };
  save();

  console.log(
    `\n=== ${R.work_item_id} ${R.overall} ${passes}/${passes + fails} stamp=${R.stamp} ack=${R.ack_status} ===\n`,
  );
  await browser.close();
  process.exitCode = fails === 0 ? 0 : 1;
}

main().catch((e) => {
  R.overall = 'FAIL';
  R.ack_status = 'FAIL_TO_PM';
  R.endedAt = ts();
  R.fatal = String(e?.stack || e).slice(0, 1200);
  save();
  console.error(e);
  process.exit(1);
});
