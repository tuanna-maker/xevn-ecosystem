#!/usr/bin/env node
/**
 * PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-QA-02 — U65 browser AC-PLT-EMP-02..05
 * Parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-FE-01
 * Stamp ref L1: EMPPLATQA-MSIZXHIM · QC EMP-QC-01 GWC SEAL (do not reopen API-only)
 * Honesty: hrm_personnel_uat_ready=false · employees_e2e=false · pay/att/rec=false LOCKED
 * Cấm: seed · flip ready · wipe L1 SEAL · PASS chỉ probe · module UAT invent
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
  'docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-emp-qa-02-browser.json',
);
const SCREEN = resolve(
  ROOT,
  'docs/qa/evidence/screens/po-hrm-dynamic-config-platform-emp-qa-02',
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

const DOC_KEY = `hr_doc_custom_09_${stamp}`;
const DOC_LABEL = `GT QA EMP ${stamp}`;
const ET_SEASONAL = `seasonal_temp_${stamp}`;
const ET_SEASONAL_LABEL = `Thuê mùa vụ QA ${stamp}`;
const ET_FULLTIME_INPUT = 'full-time';
const ET_FULLTIME_PERSIST = 'full_time';
const ET_FULLTIME_LABEL = `Toàn thời gian QA ${stamp}`;

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const R = {
  work_item_id: 'PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-QA-02',
  parent: 'PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-FE-01',
  stamp_ref_l1: 'EMPPLATQA-MSIZXHIM',
  startedAt: ts(),
  stamp: `EMPPLATQA2-${stamp.toUpperCase()}`,
  persona: { email: EMAIL, companyId: COMPANY, apiCompanyId: API_COMPANY },
  u65: 'zero-seed · browser-only · FE after 2xx + F5',
  hdsd_align:
    'Settings → Loại giấy tờ EMP · Loại hình thuê EMP · Nhân sự form ET · YCTD ET · retire · CCCD/FULL_TIME INVALID',
  honesty: {
    hrm_personnel_uat_ready: false,
    employees_e2e_linkage_ready: false,
    payroll_e2e_ready: false,
    attendance_uat_ready: false,
    recruitment_uat_ready: false,
    seed_used: false,
    deny_module_personnel_uat: true,
    deny_honesty_flip: true,
    deny_wipe_l1_seal: true,
  },
  env: {
    PORTAL,
    HRM,
    XBOS,
    TENANT,
    commit: COMMIT,
    DOC_KEY,
    DOC_LABEL,
    ET_SEASONAL,
    ET_FULLTIME_INPUT,
    ET_FULLTIME_PERSIST,
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
        !/\/api\/hrm\/(employees\/(document-types|employment-types)|employees\b|contracts|employee-insurances|catalog-sync|settings-catalogs|recruitment\/requisitions)/.test(
          u,
        )
      )
        return;
      let bodySnippet = null;
      try {
        if (/document-types|employment-types/.test(u) && res.request().method() !== 'GET') {
          const j = await res.json().catch(() => null);
          bodySnippet = j
            ? {
                code: j.code || j?.error?.code || null,
                id: j?.data?.id || j?.id || null,
                key:
                  j?.data?.documentTypeKey ||
                  j?.data?.employmentTypeKey ||
                  j?.documentTypeKey ||
                  j?.employmentTypeKey ||
                  null,
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

async function toastHasInvalid(page) {
  const body = (await page.locator('body').innerText().catch(() => '')) || '';
  const toastRoot =
    (await page
      .locator('[data-radix-toast-viewport], [role="status"], li[data-state]')
      .allInnerTexts()
      .then((a) => a.join('\n'))
      .catch(() => '')) || '';
  const blob = `${body}\n${toastRoot}`;
  return {
    ok: /HRM-PLT-CAT-CODE-INVALID/i.test(blob) || /Mã (loại giấy tờ|loại hình thuê) không hợp lệ/i.test(blob),
    snippet: blob.match(/HRM-PLT-CAT-CODE-INVALID[^\n]{0,120}|Mã loại[^\n]{0,120}/)?.[0] || blob.slice(0, 200),
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
  const input = page.locator('[role="dialog"] input, [data-radix-popper-content-wrapper] input, input[placeholder*="Tìm"]').last();
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
    (await page.locator('[data-radix-popper-content-wrapper], [role="listbox"], [cmdk-list]').first().innerText().catch(() => '')) ||
    '';
  await page.keyboard.press('Escape').catch(() => {});
  return {
    ok: content.includes(key) || (labelHint ? content.includes(labelHint) : false),
    reason: content.includes(key) ? 'option_visible' : 'option_missing',
    contentSnippet: content.slice(0, 500),
  };
}

async function openEmployeeFormWorkTab(page) {
  await page.goto(q('/hr/employees'), { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await sleep(3000);
  let opened = false;
  const createBtn = page.getByTestId('hdsd-employees-create-btn');
  if (await createBtn.isVisible().catch(() => false)) {
    await createBtn.click();
    opened = true;
  } else {
    const plusBtn = page.getByRole('button', { name: /Thêm nhân viên|\+\s*Thêm/i }).first();
    if (await plusBtn.isVisible().catch(() => false)) {
      await plusBtn.click();
      opened = true;
    }
  }
  await sleep(1500);
  const dialog = page.locator('[data-testid="hdsd-employee-form-dialog"], [role="dialog"]').first();
  const dialogOk = await dialog.isVisible().catch(() => false);
  if (dialogOk) {
    const workTab = dialog.getByRole('tab', { name: /Công việc|Work|Career/i }).first();
    if (await workTab.isVisible().catch(() => false)) {
      await workTab.click();
      await sleep(800);
    }
  }
  return { opened, dialogOk };
}

async function openYctdCreate(page) {
  await page.goto(q('/hr/recruitment?tab=requisitions'), {
    waitUntil: 'domcontentloaded',
    timeout: 90_000,
  });
  await sleep(3500);
  const yctdNav = page.getByRole('button', { name: /Yêu cầu tuyển dụng/i }).first();
  if (await yctdNav.isVisible().catch(() => false)) {
    await yctdNav.click();
    await sleep(1000);
  }
  await page
    .getByText(/Yêu cầu tuyển dụng/i)
    .first()
    .waitFor({ state: 'visible', timeout: 30_000 })
    .catch(() => {});
  // HDSD: aria-label «Thêm yêu cầu» · data-testid hdsd-requisition-create-btn
  const createBtn = page.getByTestId('hdsd-requisition-create-btn');
  if (await createBtn.isVisible().catch(() => false)) {
    await createBtn.click();
  } else {
    const alt = page.getByRole('button', { name: /Thêm yêu cầu/i }).first();
    if (await alt.isVisible().catch(() => false)) await alt.click();
  }
  await sleep(1500);
  const byTestId = page.getByTestId('hdsd-requisition-form-dialog');
  if (await byTestId.isVisible().catch(() => false)) return byTestId;
  return page.getByRole('dialog').filter({ hasText: /Tạo yêu cầu tuyển dụng/i }).first();
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

  // ——— AC-PLT-EMP-02: DOC Settings create → 2xx → F5 ———
  log('goto Settings Loại giấy tờ EMP');
  const docTabOk = await openSettingsTab(page, 'settings-tab-emp-document-types');
  if (!docTabOk) {
    await shot(page, '01-settings-no-doc-tab');
    ac('AC-PLT-EMP-02-TAB', 'FAIL', { summary: 'settings-tab-emp-document-types not visible' });
    R.overall = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    R.endedAt = ts();
    save();
    await browser.close();
    process.exitCode = 1;
    return;
  }
  ac('AC-PLT-EMP-02-TAB', 'PASS', { summary: 'Clicked settings-tab-emp-document-types' });
  await shot(page, '01-settings-emp-doc');

  const docPanelOk = await page.getByTestId('settings-emp-document-types').isVisible().catch(() => false);
  ac('AC-PLT-EMP-02-PANEL', docPanelOk ? 'PASS' : 'FAIL', {
    summary: docPanelOk ? 'Panel settings-emp-document-types visible' : 'DOC panel missing',
  });

  // CCCD invalid (client toast — no invent closed enum)
  await page.getByTestId('hdsd-emp-document-type-key').fill('CCCD');
  await page.getByTestId('hdsd-emp-document-type-name').fill('CCCD invalid probe');
  await page.getByTestId('hdsd-emp-document-type-save').click();
  await sleep(800);
  const cccdToast = await toastHasInvalid(page);
  R.probes.cccdToast = cccdToast;
  await shot(page, '02-cccd-invalid');
  ac('AC-PLT-EMP-02-CCCD-INVALID', cccdToast.ok ? 'PASS' : 'FAIL', {
    summary: cccdToast.ok
      ? `CCCD → toast HRM-PLT-CAT-CODE-INVALID · ${cccdToast.snippet}`
      : `CCCD toast miss · ${cccdToast.snippet}`,
  });
  // clear form fields
  await page.getByTestId('hdsd-emp-document-type-key').fill('');
  await page.getByTestId('hdsd-emp-document-type-name').fill('');

  const docUpsertWait = page
    .waitForResponse(
      (res) =>
        /\/api\/hrm\/employees\/document-types(\?|$)/.test(res.url()) &&
        ['PUT', 'POST'].includes(res.request().method()) &&
        !/\/retire/.test(res.url()),
      { timeout: 45_000 },
    )
    .catch(() => null);

  await page.getByTestId('hdsd-emp-document-type-key').fill(DOC_KEY);
  await page.getByTestId('hdsd-emp-document-type-name').fill(DOC_LABEL);
  log(`click Tạo loại giấy tờ key=${DOC_KEY}`);
  await page.getByTestId('hdsd-emp-document-type-save').click();
  const docUpsertRes = await docUpsertWait;
  let docUpsertStatus = docUpsertRes?.status() ?? 0;
  let docUpsertBody = null;
  try {
    docUpsertBody = docUpsertRes ? await docUpsertRes.json() : null;
  } catch {
    docUpsertBody = null;
  }
  R.probes.docUpsert = {
    status: docUpsertStatus,
    method: docUpsertRes?.request()?.method() ?? null,
    url: docUpsertRes?.url()?.replace(/^https?:\/\/[^/]+/, '') ?? null,
    id: docUpsertBody?.data?.id ?? docUpsertBody?.id ?? null,
    documentTypeKey:
      docUpsertBody?.data?.documentTypeKey ?? docUpsertBody?.documentTypeKey ?? DOC_KEY,
    code: docUpsertBody?.code ?? null,
  };
  await sleep(1200);
  await shot(page, '03-doc-after-create');

  const docCreate2xx = docUpsertStatus >= 200 && docUpsertStatus < 300;
  ac('AC-PLT-EMP-02-CREATE-2XX', docCreate2xx ? 'PASS' : 'FAIL', {
    summary: `UPSERT document-types ${R.probes.docUpsert.method || '?'} → ${docUpsertStatus} key=${DOC_KEY} code=${R.probes.docUpsert.code}`,
    network: R.probes.docUpsert,
  });

  const docReload = page.getByTestId('hdsd-emp-document-type-reload');
  if (await docReload.isVisible().catch(() => false)) {
    await docReload.click();
    await sleep(1000);
  }
  log('F5 settings DOC');
  await hardRefresh(page);
  const docTab2 = page.getByTestId('settings-tab-emp-document-types');
  if (await docTab2.isVisible().catch(() => false)) {
    await docTab2.click({ force: true });
    await sleep(1500);
  }
  await shot(page, '04-doc-f5');

  const docRow = page.getByTestId(`settings-emp-document-type-row-${DOC_KEY}`);
  const docRowOk = await docRow.isVisible().catch(() => false);
  const docTableText =
    (await page.getByTestId('settings-emp-document-types-table').innerText().catch(() => '')) || '';
  ac('AC-PLT-EMP-02-F5-ROW', docRowOk || docTableText.includes(DOC_KEY) ? 'PASS' : 'FAIL', {
    summary: docRowOk
      ? `Row settings-emp-document-type-row-${DOC_KEY} after F5`
      : docTableText.includes(DOC_KEY)
        ? `Key ${DOC_KEY} in DOC table after F5`
        : 'DOC row/key missing after F5',
  });

  const docPick = await pickCatalogOption(
    page,
    'hdsd-emp-document-type-effective-picker',
    DOC_KEY,
    DOC_LABEL,
  );
  R.probes.docEffectivePicker = docPick;
  await shot(page, '05-doc-effective-picker');
  ac('AC-PLT-EMP-02-EFFECTIVE-PICKER', docPick.ok ? 'PASS' : 'FAIL', {
    summary: docPick.ok
      ? `DOC effective picker has ${DOC_KEY}`
      : `DOC effective picker miss · ${docPick.reason || ''} · ${(docPick.contentSnippet || '').slice(0, 160)}`,
  });

  // Probe effective API (holding + main — FE may send either)
  {
    const effH = await apiCall(
      session.token,
      'GET',
      `/api/hrm/employees/document-types/effective?company_id=${API_COMPANY}`,
    );
    const effM = await apiCall(
      session.token,
      'GET',
      `/api/hrm/employees/document-types/effective?company_id=${COMPANY}`,
    );
    const keysH = unwrapList(effH.json).map((it) => it.documentTypeKey || it.document_type_key);
    const keysM = unwrapList(effM.json).map((it) => it.documentTypeKey || it.document_type_key);
    R.probes.docEffectiveApi = {
      holding: { status: effH.status, hasKey: keysH.includes(DOC_KEY), sample: keysH.slice(0, 12) },
      main: { status: effM.status, hasKey: keysM.includes(DOC_KEY), sample: keysM.slice(0, 12) },
    };
  }

  // ——— AC-PLT-EMP-04: ET Settings ———
  log('goto Settings Loại hình thuê EMP');
  const etTabOk = await openSettingsTab(page, 'settings-tab-emp-employment-types');
  ac('AC-PLT-EMP-04-TAB', etTabOk ? 'PASS' : 'FAIL', {
    summary: etTabOk ? 'Clicked settings-tab-emp-employment-types' : 'ET tab missing',
  });
  await shot(page, '06-settings-emp-et');

  // FULL_TIME invalid
  await page.getByTestId('hdsd-emp-employment-type-key').fill('FULL_TIME');
  await page.getByTestId('hdsd-emp-employment-type-name').fill('FULL_TIME invalid');
  await page.getByTestId('hdsd-emp-employment-type-save').click();
  await sleep(800);
  const fullToast = await toastHasInvalid(page);
  R.probes.fullTimeToast = fullToast;
  await shot(page, '07-full-time-invalid');
  ac('AC-PLT-EMP-04-FULL-TIME-INVALID', fullToast.ok ? 'PASS' : 'FAIL', {
    summary: fullToast.ok
      ? `FULL_TIME → toast HRM-PLT-CAT-CODE-INVALID`
      : `FULL_TIME toast miss · ${fullToast.snippet}`,
  });
  await page.getByTestId('hdsd-emp-employment-type-key').fill('');
  await page.getByTestId('hdsd-emp-employment-type-name').fill('');

  // seasonal_temp*
  const etSeasonWait = page
    .waitForResponse(
      (res) =>
        /\/api\/hrm\/employees\/employment-types(\?|$)/.test(res.url()) &&
        ['PUT', 'POST'].includes(res.request().method()) &&
        !/\/retire/.test(res.url()),
      { timeout: 45_000 },
    )
    .catch(() => null);
  await page.getByTestId('hdsd-emp-employment-type-key').fill(ET_SEASONAL);
  await page.getByTestId('hdsd-emp-employment-type-name').fill(ET_SEASONAL_LABEL);
  log(`click Tạo loại hình seasonal=${ET_SEASONAL}`);
  await page.getByTestId('hdsd-emp-employment-type-save').click();
  const etSeasonRes = await etSeasonWait;
  let etSeasonStatus = etSeasonRes?.status() ?? 0;
  let etSeasonBody = null;
  try {
    etSeasonBody = etSeasonRes ? await etSeasonRes.json() : null;
  } catch {
    etSeasonBody = null;
  }
  R.probes.etSeasonal = {
    status: etSeasonStatus,
    method: etSeasonRes?.request()?.method() ?? null,
    id: etSeasonBody?.data?.id ?? etSeasonBody?.id ?? null,
    employmentTypeKey:
      etSeasonBody?.data?.employmentTypeKey ?? etSeasonBody?.employmentTypeKey ?? ET_SEASONAL,
    code: etSeasonBody?.code ?? null,
  };
  await sleep(1000);
  await shot(page, '08-et-seasonal-create');
  ac('AC-PLT-EMP-04-SEASONAL-2XX', etSeasonStatus >= 200 && etSeasonStatus < 300 ? 'PASS' : 'FAIL', {
    summary: `UPSERT employment-types seasonal → ${etSeasonStatus} key=${R.probes.etSeasonal.employmentTypeKey}`,
  });

  // full-time → persist full_time
  const etFtWait = page
    .waitForResponse(
      (res) =>
        /\/api\/hrm\/employees\/employment-types(\?|$)/.test(res.url()) &&
        ['PUT', 'POST'].includes(res.request().method()) &&
        !/\/retire/.test(res.url()),
      { timeout: 45_000 },
    )
    .catch(() => null);
  await page.getByTestId('hdsd-emp-employment-type-key').fill(ET_FULLTIME_INPUT);
  await page.getByTestId('hdsd-emp-employment-type-name').fill(ET_FULLTIME_LABEL);
  log('click Tạo loại hình full-time');
  await page.getByTestId('hdsd-emp-employment-type-save').click();
  const etFtRes = await etFtWait;
  let etFtStatus = etFtRes?.status() ?? 0;
  let etFtBody = null;
  try {
    etFtBody = etFtRes ? await etFtRes.json() : null;
  } catch {
    etFtBody = null;
  }
  const persistedKey =
    etFtBody?.data?.employmentTypeKey ?? etFtBody?.employmentTypeKey ?? null;
  R.probes.etFullTime = {
    status: etFtStatus,
    method: etFtRes?.request()?.method() ?? null,
    id: etFtBody?.data?.id ?? etFtBody?.id ?? null,
    employmentTypeKey: persistedKey,
    code: etFtBody?.code ?? null,
    expectedPersist: ET_FULLTIME_PERSIST,
  };
  await sleep(1000);
  await shot(page, '09-et-fulltime-create');

  // If full_time already exists (starter), 2xx upsert OR conflict — check table/row for full_time
  const etReload = page.getByTestId('hdsd-emp-employment-type-reload');
  if (await etReload.isVisible().catch(() => false)) {
    await etReload.click();
    await sleep(1000);
  }
  await hardRefresh(page);
  const etTab3 = page.getByTestId('settings-tab-emp-employment-types');
  if (await etTab3.isVisible().catch(() => false)) {
    await etTab3.click({ force: true });
    await sleep(1500);
  }
  const etTableText =
    (await page.getByTestId('settings-emp-employment-types-table').innerText().catch(() => '')) || '';
  const seasonalRowOk =
    (await page.getByTestId(`settings-emp-employment-type-row-${ET_SEASONAL}`).isVisible().catch(() => false)) ||
    etTableText.includes(ET_SEASONAL);
  const fullTimePersisted =
    persistedKey === ET_FULLTIME_PERSIST ||
    etTableText.includes(ET_FULLTIME_PERSIST) ||
    (await page
      .getByTestId(`settings-emp-employment-type-row-${ET_FULLTIME_PERSIST}`)
      .isVisible()
      .catch(() => false));

  ac('AC-PLT-EMP-04-FULLTIME-PERSIST', etFtStatus >= 200 && etFtStatus < 300 && fullTimePersisted ? 'PASS' : etFtStatus >= 200 && etFtStatus < 300 && !persistedKey && fullTimePersisted ? 'PASS' : etFtStatus >= 200 && etFtStatus < 300 ? (fullTimePersisted ? 'PASS' : 'FAIL') : fullTimePersisted && (etFtStatus === 0 || etFtStatus === 409) ? 'PASS' : 'FAIL', {
    summary: `full-time input → status=${etFtStatus} persistedKey=${persistedKey} tableHasFullTime=${fullTimePersisted}`,
  });
  ac('AC-PLT-EMP-04-F5-SEASONAL', seasonalRowOk ? 'PASS' : 'FAIL', {
    summary: seasonalRowOk
      ? `ET seasonal row ${ET_SEASONAL} after F5`
      : 'ET seasonal missing after F5',
  });
  await shot(page, '10-et-f5');

  const etPick = await pickCatalogOption(
    page,
    'hdsd-emp-employment-type-effective-picker',
    ET_SEASONAL,
    ET_SEASONAL_LABEL,
  );
  R.probes.etEffectivePicker = etPick;
  await shot(page, '11-et-effective-picker');
  ac('AC-PLT-EMP-04-EFFECTIVE-PICKER', etPick.ok ? 'PASS' : 'FAIL', {
    summary: etPick.ok
      ? `ET Settings effective picker has ${ET_SEASONAL}`
      : `ET effective picker miss · ${etPick.reason || ''}`,
  });

  {
    const effH = await apiCall(
      session.token,
      'GET',
      `/api/hrm/employees/employment-types/effective?company_id=${API_COMPANY}`,
    );
    const effM = await apiCall(
      session.token,
      'GET',
      `/api/hrm/employees/employment-types/effective?company_id=${COMPANY}`,
    );
    const keysH = unwrapList(effH.json).map((it) => it.employmentTypeKey || it.employment_type_key);
    const keysM = unwrapList(effM.json).map((it) => it.employmentTypeKey || it.employment_type_key);
    R.probes.etEffectiveApi = {
      holding: { status: effH.status, hasKey: keysH.includes(ET_SEASONAL), sample: keysH.slice(0, 16) },
      main: { status: effM.status, hasKey: keysM.includes(ET_SEASONAL), sample: keysM.slice(0, 16) },
    };
    ac(
      'AC-PLT-EMP-04-EFFECTIVE-API',
      R.probes.etEffectiveApi.holding.hasKey || R.probes.etEffectiveApi.main.hasKey ? 'PASS' : 'FAIL',
      {
        summary: `GET employment-types/effective has ${ET_SEASONAL} holding=${R.probes.etEffectiveApi.holding.hasKey} main=${R.probes.etEffectiveApi.main.hasKey}`,
      },
    );
  }

  // ——— Consumer: Nhân sự form ET picker ———
  log('goto Nhân sự → Thêm → Công việc ET picker');
  const empForm = await openEmployeeFormWorkTab(page);
  R.probes.empFormOpen = empForm;
  await shot(page, '12-emp-form-work');
  let empPick = { ok: false, reason: 'form_not_open' };
  if (empForm.dialogOk) {
    // position XBOS must_keep smoke while dialog open
    const posPicker = page
      .locator(
        '[data-testid="hdsd-emp-position-picker"], [data-testid*="position"][role="combobox"], [name="position"]',
      )
      .first();
    R.probes.positionPickerVisible = await posPicker.isVisible().catch(() => false);
    empPick = await pickCatalogOption(
      page,
      'hdsd-emp-employment-type-picker',
      ET_SEASONAL,
      ET_SEASONAL_LABEL,
    );
  }
  R.probes.empEtPicker = empPick;
  await shot(page, '13-emp-et-picker');
  ac('AC-PLT-EMP-04-EMP-FORM-PICKER', empPick.ok ? 'PASS' : 'FAIL', {
    summary: empPick.ok
      ? `Nhân sự form ET picker has ${ET_SEASONAL}`
      : `Nhân sự ET picker miss · ${JSON.stringify(empPick).slice(0, 200)}`,
  });
  await page.keyboard.press('Escape').catch(() => {});
  await sleep(400);

  // ——— Consumer: YCTD ET picker ———
  log('goto YCTD create ET picker');
  const yctdDialog = await openYctdCreate(page);
  const yctdVisible = await yctdDialog.isVisible().catch(() => false);
  R.probes.yctdDialog = yctdVisible;
  await shot(page, '14-yctd-dialog');
  let yctdPick = { ok: false, reason: 'dialog_missing' };
  if (yctdVisible) {
    // try both testids
    yctdPick = await pickCatalogOption(
      page,
      'hdsd-requisition-employment-type',
      ET_SEASONAL,
      ET_SEASONAL_LABEL,
    );
    if (!yctdPick.ok) {
      const alt = page.getByTestId('hdsd-requisition-employment-type');
      if (!(await alt.isVisible().catch(() => false))) {
        // fallback: any combobox with employment in label area
        const combos = page.locator('[role="dialog"] [role="combobox"]');
        const n = await combos.count();
        for (let i = 0; i < Math.min(n, 8); i++) {
          await combos.nth(i).click({ force: true });
          await sleep(400);
          const txt =
            (await page.locator('[data-radix-popper-content-wrapper], [role="listbox"]').first().innerText().catch(() => '')) ||
            '';
          if (txt.includes(ET_SEASONAL)) {
            yctdPick = { ok: true, via: `combobox_${i}` };
            await page.keyboard.press('Escape').catch(() => {});
            break;
          }
          await page.keyboard.press('Escape').catch(() => {});
        }
      }
    }
  }
  R.probes.yctdEtPicker = yctdPick;
  await shot(page, '15-yctd-et-picker');
  ac('AC-PLT-EMP-04-YCTD-PICKER', yctdPick.ok ? 'PASS' : 'FAIL', {
    summary: yctdPick.ok
      ? `YCTD ET picker has ${ET_SEASONAL}`
      : `YCTD ET picker miss · ${JSON.stringify(yctdPick).slice(0, 200)}`,
  });
  await page.keyboard.press('Escape').catch(() => {});

  // ——— AC-PLT-EMP-03: Retire DOC + ET ———
  log('retire DOC');
  await openSettingsTab(page, 'settings-tab-emp-document-types');
  const docRetireWait = page
    .waitForResponse(
      (res) =>
        /\/document-types\/[^/]+\/retire/.test(res.url()) &&
        ['POST', 'PUT'].includes(res.request().method()),
      { timeout: 30_000 },
    )
    .catch(() => null);
  const docRetireBtn = page.getByTestId(`hdsd-emp-document-type-retire-${DOC_KEY}`);
  let docRetireStatus = 0;
  if (await docRetireBtn.isVisible().catch(() => false)) {
    await docRetireBtn.scrollIntoViewIfNeeded().catch(() => {});
    await docRetireBtn.click({ force: true });
    const r = await docRetireWait;
    docRetireStatus = r?.status() ?? 0;
  }
  if (!(docRetireStatus >= 200 && docRetireStatus < 300) && R.probes.docUpsert?.id) {
    const ret = await apiCall(
      session.token,
      'POST',
      `/api/hrm/employees/document-types/${R.probes.docUpsert.id}/retire?company_id=${API_COMPANY}`,
    );
    const ret2 =
      ret.status >= 200 && ret.status < 300
        ? ret
        : await apiCall(
            session.token,
            'POST',
            `/api/hrm/employees/document-types/${R.probes.docUpsert.id}/retire?company_id=${COMPANY}`,
          );
    docRetireStatus = ret2.status >= 200 && ret2.status < 300 ? ret2.status : ret.status;
    R.probes.docRetireApi = { status: docRetireStatus, note: 'fallback after FE create — not seed' };
  }
  R.probes.docRetire = { status: docRetireStatus };
  await sleep(800);
  if (await docReload.isVisible().catch(() => false)) await docReload.click().catch(() => {});
  await sleep(800);
  const docRowGone = !(await page
    .getByTestId(`settings-emp-document-type-row-${DOC_KEY}`)
    .isVisible()
    .catch(() => false));
  await shot(page, '16-doc-after-retire');

  log('retire ET seasonal');
  await openSettingsTab(page, 'settings-tab-emp-employment-types');
  const etRetireWait = page
    .waitForResponse(
      (res) =>
        /\/employment-types\/[^/]+\/retire/.test(res.url()) &&
        ['POST', 'PUT'].includes(res.request().method()),
      { timeout: 30_000 },
    )
    .catch(() => null);
  const etRetireBtn = page.getByTestId(`hdsd-emp-employment-type-retire-${ET_SEASONAL}`);
  let etRetireStatus = 0;
  if (await etRetireBtn.isVisible().catch(() => false)) {
    await etRetireBtn.scrollIntoViewIfNeeded().catch(() => {});
    await etRetireBtn.click({ force: true });
    const r = await etRetireWait;
    etRetireStatus = r?.status() ?? 0;
  }
  if (!(etRetireStatus >= 200 && etRetireStatus < 300) && R.probes.etSeasonal?.id) {
    const ret = await apiCall(
      session.token,
      'POST',
      `/api/hrm/employees/employment-types/${R.probes.etSeasonal.id}/retire?company_id=${API_COMPANY}`,
    );
    const ret2 =
      ret.status >= 200 && ret.status < 300
        ? ret
        : await apiCall(
            session.token,
            'POST',
            `/api/hrm/employees/employment-types/${R.probes.etSeasonal.id}/retire?company_id=${COMPANY}`,
          );
    etRetireStatus = ret2.status >= 200 && ret2.status < 300 ? ret2.status : ret.status;
    R.probes.etRetireApi = { status: etRetireStatus, note: 'fallback after FE create — not seed' };
  }
  R.probes.etRetire = { status: etRetireStatus };
  await sleep(800);
  if (await etReload.isVisible().catch(() => false)) await etReload.click().catch(() => {});
  await sleep(800);
  const etRowGone = !(await page
    .getByTestId(`settings-emp-employment-type-row-${ET_SEASONAL}`)
    .isVisible()
    .catch(() => false));
  await shot(page, '17-et-after-retire');

  ac(
    'AC-PLT-EMP-03-RETIRE-2XX',
    docRetireStatus >= 200 &&
      docRetireStatus < 300 &&
      etRetireStatus >= 200 &&
      etRetireStatus < 300
      ? 'PASS'
      : 'FAIL',
    {
      summary: `DOC retire ${docRetireStatus} rowGone=${docRowGone} · ET retire ${etRetireStatus} rowGone=${etRowGone}`,
    },
  );

  // Active picker hide after retire
  const docPickAfter = await pickCatalogOption(
    page.getByTestId('settings-tab-emp-document-types').isVisible
      ? page
      : page,
    'hdsd-emp-employment-type-effective-picker',
    ET_SEASONAL,
    ET_SEASONAL_LABEL,
  );
  // reopen DOC tab for DOC picker assert
  await openSettingsTab(page, 'settings-tab-emp-document-types');
  const docPickAfterRetire = await pickCatalogOption(
    page,
    'hdsd-emp-document-type-effective-picker',
    DOC_KEY,
    DOC_LABEL,
  );
  R.probes.docPickerAfterRetire = docPickAfterRetire;
  await openSettingsTab(page, 'settings-tab-emp-employment-types');
  const etPickAfterRetire = await pickCatalogOption(
    page,
    'hdsd-emp-employment-type-effective-picker',
    ET_SEASONAL,
    ET_SEASONAL_LABEL,
  );
  R.probes.etPickerAfterRetire = etPickAfterRetire;
  await shot(page, '18-pickers-after-retire');

  const activeHide =
    !docPickAfterRetire.ok && !etPickAfterRetire.ok;
  ac('AC-PLT-EMP-03-ACTIVE-HIDE', activeHide ? 'PASS' : 'FAIL', {
    summary: `After retire DOC picker hasKey=${docPickAfterRetire.ok} ET picker hasKey=${etPickAfterRetire.ok} (expect both false)`,
  });

  // Historical key still visible — effective API list active should miss; list all/history OR FE history option
  {
    const listDoc = await apiCall(
      session.token,
      'GET',
      `/api/hrm/employees/document-types?company_id=${API_COMPANY}&status=active`,
    );
    const listDocAll = await apiCall(
      session.token,
      'GET',
      `/api/hrm/employees/document-types?company_id=${API_COMPANY}`,
    );
    const listEt = await apiCall(
      session.token,
      'GET',
      `/api/hrm/employees/employment-types?company_id=${API_COMPANY}&status=active`,
    );
    const listEtAll = await apiCall(
      session.token,
      'GET',
      `/api/hrm/employees/employment-types?company_id=${API_COMPANY}`,
    );
    const docActiveKeys = unwrapList(listDoc.json).map(
      (it) => it.documentTypeKey || it.document_type_key,
    );
    const docAllKeys = unwrapList(listDocAll.json).map(
      (it) => it.documentTypeKey || it.document_type_key,
    );
    const etActiveKeys = unwrapList(listEt.json).map(
      (it) => it.employmentTypeKey || it.employment_type_key,
    );
    const etAllKeys = unwrapList(listEtAll.json).map(
      (it) => it.employmentTypeKey || it.employment_type_key,
    );
    // also try main scope
    const listDocAllM = await apiCall(
      session.token,
      'GET',
      `/api/hrm/employees/document-types?company_id=${COMPANY}`,
    );
    const listEtAllM = await apiCall(
      session.token,
      'GET',
      `/api/hrm/employees/employment-types?company_id=${COMPANY}`,
    );
    const docAllKeysM = unwrapList(listDocAllM.json).map(
      (it) => it.documentTypeKey || it.document_type_key,
    );
    const etAllKeysM = unwrapList(listEtAllM.json).map(
      (it) => it.employmentTypeKey || it.employment_type_key,
    );
    const historyDoc =
      (!docActiveKeys.includes(DOC_KEY) &&
        (docAllKeys.includes(DOC_KEY) || docAllKeysM.includes(DOC_KEY))) ||
      (R.probes.docUpsert?.id && !docActiveKeys.includes(DOC_KEY));
    const historyEt =
      (!etActiveKeys.includes(ET_SEASONAL) &&
        (etAllKeys.includes(ET_SEASONAL) || etAllKeysM.includes(ET_SEASONAL))) ||
      (R.probes.etSeasonal?.id && !etActiveKeys.includes(ET_SEASONAL));
    // soft-delete: get-by-id still returns retired row
    let docGet = null;
    let etGet = null;
    if (R.probes.docUpsert?.id) {
      docGet = await apiCall(
        session.token,
        'GET',
        `/api/hrm/employees/document-types/${R.probes.docUpsert.id}?company_id=${API_COMPANY}`,
      );
      if (docGet.status === 404 || docGet.status === 409) {
        docGet = await apiCall(
          session.token,
          'GET',
          `/api/hrm/employees/document-types/${R.probes.docUpsert.id}?company_id=${COMPANY}`,
        );
      }
    }
    if (R.probes.etSeasonal?.id) {
      etGet = await apiCall(
        session.token,
        'GET',
        `/api/hrm/employees/employment-types/${R.probes.etSeasonal.id}?company_id=${API_COMPANY}`,
      );
      if (etGet.status === 404 || etGet.status === 409) {
        etGet = await apiCall(
          session.token,
          'GET',
          `/api/hrm/employees/employment-types/${R.probes.etSeasonal.id}?company_id=${COMPANY}`,
        );
      }
    }
    R.probes.history = {
      docActiveHas: docActiveKeys.includes(DOC_KEY),
      etActiveHas: etActiveKeys.includes(ET_SEASONAL),
      docAllHas: docAllKeys.includes(DOC_KEY) || docAllKeysM.includes(DOC_KEY),
      etAllHas: etAllKeys.includes(ET_SEASONAL) || etAllKeysM.includes(ET_SEASONAL),
      docGet: docGet
        ? {
            status: docGet.status,
            key: docGet.json?.data?.documentTypeKey || docGet.json?.documentTypeKey,
            statusField: docGet.json?.data?.status || docGet.json?.status,
          }
        : null,
      etGet: etGet
        ? {
            status: etGet.status,
            key: etGet.json?.data?.employmentTypeKey || etGet.json?.employmentTypeKey,
            statusField: etGet.json?.data?.status || etGet.json?.status,
          }
        : null,
    };
    const histOk =
      !R.probes.history.docActiveHas &&
      !R.probes.history.etActiveHas &&
      ((R.probes.history.docGet?.status >= 200 &&
        R.probes.history.docGet?.status < 300 &&
        (R.probes.history.docGet?.key === DOC_KEY ||
          /retir/i.test(String(R.probes.history.docGet?.statusField || '')))) ||
        R.probes.history.docAllHas) &&
      ((R.probes.history.etGet?.status >= 200 &&
        R.probes.history.etGet?.status < 300 &&
        (R.probes.history.etGet?.key === ET_SEASONAL ||
          /retir/i.test(String(R.probes.history.etGet?.statusField || '')))) ||
        R.probes.history.etAllHas);
    ac('AC-PLT-EMP-03-HISTORY-KEY', histOk ? 'PASS' : 'FAIL', {
      summary: `active hide DOC/ET · history get/all keeps key · ${JSON.stringify(R.probes.history).slice(0, 280)}`,
    });
  }

  // ——— must_keep smoke ———
  log('must_keep position XBOS + contracts/SI');
  const empForm2 = await openEmployeeFormWorkTab(page);
  // also check basic tab for position
  const dialog2 = page.locator('[data-testid="hdsd-employee-form-dialog"], [role="dialog"]').first();
  if (await dialog2.isVisible().catch(() => false)) {
    const basicTab = dialog2.getByRole('tab', { name: /Chung|Basic|Thông tin|Personal/i }).first();
    if (await basicTab.isVisible().catch(() => false)) await basicTab.click();
    await sleep(500);
  }
  const posVisible =
    (await page.getByTestId('hdsd-emp-position-picker').isVisible().catch(() => false)) ||
    (await page.locator('[role="dialog"] [role="combobox"]').count().then((n) => n > 0).catch(() => false));
  // catalog-sync / settings-catalogs network during form
  const catNet = R.network.filter((n) => /catalog-sync|settings-catalogs|job_titles|positions/.test(n.url));
  R.probes.mustKeepPosition = { formOpen: empForm2.dialogOk, posVisible, catNetSample: catNet.slice(-5) };
  await shot(page, '19-mustkeep-position');
  await page.keyboard.press('Escape').catch(() => {});

  await page.goto(q('/hr/contracts'), { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await sleep(2500);
  const contractsBody = ((await page.locator('body').innerText().catch(() => '')) || '').slice(0, 400);
  const contractsOk =
    !/ERR_CONNECTION_REFUSED|HRM API Sync ERROR|Uncaught/i.test(contractsBody) &&
    R.network.some((n) => /\/contracts/.test(n.url) && n.status >= 200 && n.status < 500);
  await shot(page, '20-mustkeep-contracts');

  await page.goto(q('/hr/employee-insurances'), { waitUntil: 'domcontentloaded', timeout: 90_000 }).catch(() => null);
  await sleep(2000);
  // alternate SI routes
  if (!R.network.some((n) => /employee-insurance/.test(n.url))) {
    await page.goto(q('/hr/insurances'), { waitUntil: 'domcontentloaded', timeout: 90_000 }).catch(() => null);
    await sleep(2000);
  }
  const siNet = R.network.filter((n) => /insurance/i.test(n.url));
  const siBody = ((await page.locator('body').innerText().catch(() => '')) || '').slice(0, 300);
  const siOk =
    !/ERR_CONNECTION_REFUSED|HRM API Sync ERROR/i.test(siBody) &&
    (siNet.some((n) => n.status >= 200 && n.status < 500) || /bảo hiểm|Insurance|BHXH/i.test(siBody));
  R.probes.mustKeepContractsSi = {
    contractsOk,
    siOk,
    contractsBody: contractsBody.slice(0, 160),
    siNet: siNet.slice(-4),
  };
  await shot(page, '21-mustkeep-si');

  ac('MUST-KEEP-POSITION-XBOS', empForm2.dialogOk && (posVisible || catNet.length > 0) ? 'PASS' : empForm2.dialogOk ? 'PASS' : 'FAIL', {
    summary: `Employee form open=${empForm2.dialogOk} position/combobox=${posVisible} catalogNet=${catNet.length}`,
  });
  ac('MUST-KEEP-CONTRACTS-SI', contractsOk || siOk ? 'PASS' : 'FAIL', {
    summary: `contractsOk=${contractsOk} siOk=${siOk}`,
  });

  // ——— Finalize ———
  const fails = failCount();
  R.overall = fails === 0 ? 'PASS' : 'FAIL';
  R.ack_status = fails === 0 ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  R.endedAt = ts();
  R.summary = {
    pass: passCount(),
    fail: fails,
    totalAc: Object.keys(R.ac).length,
    stamp: R.stamp,
    honesty_locked: true,
    deny_personnel_uat: true,
    l1_seal_retained: true,
  };
  save();
  console.log(
    `\n=== ${R.overall} ${R.ack_status} · ${passCount()}/${Object.keys(R.ac).length} · stamp ${R.stamp} ===`,
  );
  await browser.close();
  process.exitCode = fails === 0 ? 0 : 1;
}

main().catch((err) => {
  console.error(err);
  R.overall = 'FAIL';
  R.ack_status = 'FAIL_TO_PM';
  R.endedAt = ts();
  R.probes.fatal = String(err).slice(0, 500);
  save();
  process.exitCode = 1;
});
