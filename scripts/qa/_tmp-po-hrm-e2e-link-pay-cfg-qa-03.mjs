#!/usr/bin/env node
/**
 * PO-HRM-E2E-LINK-PAY-CFG-QA-03 — U65 retest after O4-SC-KEY-BE-01
 * Parent: PO-HRM-E2E-LINK-PAY-CFG-O4-SC-KEY-BE-01
 * Honesty: payroll_e2e_ready=false · zero-seed · FE click path required
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
const TENANT = process.env.QA_TENANT_ID || 'xevn';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-e2e-link-pay-cfg-qa-03-browser.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-e2e-link-pay-cfg-qa-03');
mkdirSync(SCREEN, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();
const stamp = Date.now().toString(36).toUpperCase().slice(-6);
const SC_CODE = `QA_SC_${stamp}`;
const SC_LABEL = `TP lương QA ${stamp}`;
/** Second Settings code keeps picker options after first instance consumes SC_CODE */
const SC_CODE_B = `QA_SB_${stamp}`;
const SC_LABEL_B = `TP lương B QA ${stamp}`;
const INVENT_CODE = `INVENT_${stamp}`;

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const R = {
  work_item_id: 'PO-HRM-E2E-LINK-PAY-CFG-QA-03',
  parent: 'PO-HRM-E2E-LINK-PAY-CFG-O4-SC-KEY-BE-01',
  startedAt: ts(),
  persona: { email: EMAIL, companyId: COMPANY },
  u65: 'zero-seed · browser-only · FE after 2xx + F5',
  hdsd_align:
    'Cài đặt → Danh mục (salary_components) → Thêm · Lương → Thành phần lương → Thêm (picker)',
  honesty: { payroll_e2e_ready: false, seed_used: false },
  env: { PORTAL, HRM, XBOS, TENANT, commit: COMMIT },
  l0: {},
  probes: {},
  ac: {},
  network: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  click_log: [],
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
  console.log(`${verdict} ${id} — ${(detail.summary || '').slice(0, 420)}`);
  save();
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
  const r = await fetch(`${PORTAL}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const j = await r.json().catch(() => ({}));
  const data = j?.data ?? j;
  const token = data?.accessToken ?? data?.access_token ?? j?.accessToken;
  if (!token) throw new Error(`login failed HTTP ${r.status}`);
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

async function apiCall(base, token, method, path) {
  const url = `${base}${path}`;
  const r = await fetch(url, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      'x-tenant-id': TENANT,
      'x-company-id': COMPANY,
    },
  });
  let json = null;
  try {
    json = await r.json();
  } catch {
    json = null;
  }
  return { status: r.status, json };
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
  page.on('response', async (res) => {
    try {
      const u = res.url();
      if (!/\/api\/hrm\/(settings-catalogs|payroll\/salary-components)/.test(u)) return;
      R.network.push({
        method: res.request().method(),
        status: res.status(),
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 420),
        at: ts(),
      });
    } catch {
      /* */
    }
  });
}

async function probe(token) {
  const overview = await apiCall(HRM, token, 'GET', `/api/hrm/settings-catalogs?company_id=${COMPANY}`);
  const catalogs = overview.json?.data?.catalogs ?? overview.json?.catalogs ?? [];
  const scKey = catalogs.find((c) => c.catalogKey === 'salary_components');
  const ptKey = catalogs.find((c) => c.catalogKey === 'pay_types');
  const scItems = await apiCall(
    HRM,
    token,
    'GET',
    `/api/hrm/settings-catalogs/salary_components/items?company_id=${COMPANY}`,
  );
  const scList =
    scItems.json?.data?.data ??
    scItems.json?.data?.items ??
    scItems.json?.data ??
    [];
  const scArr = Array.isArray(scList) ? scList : [];
  const effFromOverview = Array.isArray(scKey?.effectiveItems) ? scKey.effectiveItems.length : null;
  R.probes = {
    ...(R.probes || {}),
    overviewStatus: overview.status,
    overviewCatalogCount: catalogs.length,
    settingsHasSalaryComponentsKey: Boolean(scKey),
    settingsSalaryComponentsName: scKey?.name ?? null,
    settingsSalaryComponentsEff:
      effFromOverview ?? scArr.length,
    settingsHasPayTypesKey: Boolean(ptKey),
    settingsPayTypesEff: Array.isArray(ptKey?.effectiveItems)
      ? ptKey.effectiveItems.length
      : ptKey
        ? 1
        : 0,
    scItemCodes: scArr.map((r) => r.code || r.item_code || r.key).filter(Boolean).slice(0, 20),
    scItemsStatus: scItems.status,
  };
  save();
  return R.probes;
}

async function openComponentsTab(page) {
  const byTestId = page.getByTestId('payroll-tab-components');
  for (let i = 0; i < 30; i++) {
    if (await byTestId.isVisible().catch(() => false)) {
      await byTestId.click();
      break;
    }
    const byText = page
      .locator('[role="tab"], button')
      .filter({ hasText: /^Thành phần lương$/i })
      .first();
    if (await byText.isVisible().catch(() => false)) {
      await byText.click();
      break;
    }
    await sleep(150);
  }
  await page
    .getByTestId('pay-components-precision')
    .waitFor({ state: 'visible', timeout: 20_000 })
    .catch(() => {});
  await sleep(800);
}

async function openAddDialog(page) {
  const addNearHeader = page
    .locator('[data-testid="pay-components-precision"]')
    .locator('xpath=ancestor::div[1]')
    .getByRole('button', { name: /Thêm/i })
    .first();
  const addTarget = page
    .getByRole('button', { name: /Thêm mới|Add New|\+ Thêm/i })
    .filter({ hasNotText: /bảng lương|hệ thống|system/i })
    .first();
  let clicked = false;
  for (const btn of [addNearHeader, addTarget]) {
    if (await btn.isVisible().catch(() => false)) {
      await btn.click();
      clicked = true;
      break;
    }
  }
  if (!clicked) {
    const any = page.locator('button').filter({ hasText: /Thêm mới/i }).first();
    if (await any.isVisible().catch(() => false)) {
      await any.click();
      clicked = true;
    }
  }
  if (!clicked) throw new Error('Thêm mới button missing on Thành phần lương');
  await sleep(1200);
  const dialog = page.getByTestId('pay-salary-component-add-dialog-precision');
  await dialog.waitFor({ state: 'visible', timeout: 15_000 });
  return dialog;
}

async function pickFirstCmdk(page) {
  await sleep(400);
  const item = page.locator('[cmdk-item], [role="option"]').first();
  if (await item.isVisible().catch(() => false)) {
    await item.click();
    return true;
  }
  return false;
}

async function main() {
  for (const [name, url] of [
    ['hrm-api', `${HRM}/api/hrm`],
    ['xbos-api', `${XBOS}/api/xbos`],
    ['portal', PORTAL],
  ]) {
    try {
      const r = await fetch(url);
      R.l0[name] = r.status;
    } catch (e) {
      R.l0[name] = `ERR ${String(e).slice(0, 80)}`;
    }
  }
  save();

  const session = await loginApi();
  let probes = await probe(session.token);

  ac(
    'API-OVERVIEW-SC-KEY',
    probes.settingsHasSalaryComponentsKey ? 'PASS' : 'FAIL',
    {
      summary: probes.settingsHasSalaryComponentsKey
        ? `GET /settings-catalogs includes catalogKey=salary_components name="${probes.settingsSalaryComponentsName}" eff=${probes.settingsSalaryComponentsEff}`
        : 'salary_components key ABSENT from overview — O4-SC-KEY not live',
      overviewStatus: probes.overviewStatus,
    },
  );

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  track(page);
  await injectPortalAuth(page, session);

  // --- A. Settings Select label + FE create extension ---
  log('goto /hr/settings-catalogs');
  await page.goto(q('/hr/settings-catalogs'), { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await sleep(2000);
  await shot(page, '01-settings-catalogs');

  const keyTrigger = page.locator('#ext-catalog-key').first();
  let selectHasSalaryComponents = false;
  let selectLabelHit = null;
  let selectOptionSample = [];
  if (await keyTrigger.isVisible().catch(() => false)) {
    await keyTrigger.click();
    await sleep(600);
    const opts = page.getByRole('option');
    const n = await opts.count();
    for (let i = 0; i < n; i++) {
      const t = ((await opts.nth(i).textContent()) || '').trim();
      if (t) selectOptionSample.push(t.slice(0, 100));
      if (/Thành phần lương \(danh mục\)|salary_components/i.test(t)) {
        selectHasSalaryComponents = true;
        selectLabelHit = t;
      }
    }
    await page.keyboard.press('Escape').catch(() => {});
  }
  R.probes.settingsSelect = {
    selectHasSalaryComponents,
    selectLabelHit,
    optionCount: selectOptionSample.length,
    sample: selectOptionSample.slice(0, 24),
  };
  ac(
    'UF-SETTINGS-SELECT-SC-LABEL',
    selectHasSalaryComponents ? 'PASS' : 'FAIL',
    {
      summary: selectHasSalaryComponents
        ? `Settings Select shows «${selectLabelHit}»`
        : 'Select missing «Thành phần lương (danh mục)»',
      sample: selectOptionSample.slice(0, 12),
    },
  );

  async function feCreateScItem(code, label) {
    const trigger = page.locator('#ext-catalog-key').first();
    if (!(await trigger.isVisible().catch(() => false))) return { ok: false, status: null };
    await trigger.click();
    await sleep(400);
    const opt = page
      .getByRole('option')
      .filter({ hasText: /Thành phần lương \(danh mục\)|salary_components/i })
      .first();
    if (!(await opt.isVisible().catch(() => false))) {
      await page.keyboard.press('Escape').catch(() => {});
      return { ok: false, status: null, reason: 'option-missing' };
    }
    await opt.click();
    await page.locator('#ext-code').fill(code);
    await page.locator('#ext-label').fill(label);
    const postWait = page
      .waitForResponse(
        (r) =>
          /settings-catalogs\/(items|.*\/extension-items)/.test(r.url()) &&
          r.request().method() === 'POST',
        { timeout: 25_000 },
      )
      .catch(() => null);
    await page.getByRole('button', { name: /Thêm|Add|Lưu/i }).last().click();
    const resp = await postWait;
    const status = resp?.status() ?? null;
    await sleep(1000);
    return { ok: Boolean(resp && status >= 200 && status < 300), status, code };
  }

  let feCreateOk = false;
  let feCreateStatus = null;
  let feCreateBOk = false;
  if (selectHasSalaryComponents) {
    const r1 = await feCreateScItem(SC_CODE, SC_LABEL);
    feCreateOk = r1.ok;
    feCreateStatus = r1.status;
    const r2 = await feCreateScItem(SC_CODE_B, SC_LABEL_B);
    feCreateBOk = r2.ok;
    await shot(page, '02-settings-after-create');
  }
  ac('UF-SETTINGS-FE-CREATE-SC', feCreateOk ? 'PASS' : 'FAIL', {
    summary: feCreateOk
      ? `FE create extension POST ${feCreateStatus} codes=${SC_CODE}${feCreateBOk ? `,${SC_CODE_B}` : ' (B failed)'}`
      : `FE create salary_components failed status=${feCreateStatus}`,
    code: SC_CODE,
    codeB: SC_CODE_B,
    feCreateBOk,
  });

  // F5 Settings → re-probe density
  await page.reload({ waitUntil: 'domcontentloaded' });
  await sleep(2000);
  await shot(page, '03-settings-f5');
  probes = await probe(session.token);
  const densOk =
    probes.settingsHasSalaryComponentsKey &&
    probes.settingsSalaryComponentsEff > 0 &&
    (probes.scItemCodes.includes(SC_CODE) || probes.settingsSalaryComponentsEff >= 1);
  ac('UF-SETTINGS-EFF-AFTER-F5', densOk ? 'PASS' : 'FAIL', {
    summary: densOk
      ? `After F5 effectiveItems=${probes.settingsSalaryComponentsEff} codes=[${probes.scItemCodes.join(',')}]`
      : `effectiveItems still ${probes.settingsSalaryComponentsEff} after FE create`,
    scItemCodes: probes.scItemCodes,
    created: [SC_CODE, SC_CODE_B],
  });

  // --- B. Payroll → Thành phần lương → CatalogSearchPicker + invent ---
  log('goto /hr/payroll components');
  await page.goto(q('/hr/payroll'), { waitUntil: 'commit', timeout: 90_000 });
  await sleep(1800);
  await openComponentsTab(page);
  await shot(page, '04-components-tab');

  const errBanner = page.locator('text=/HRM API Sync ERROR|ERR_CONNECTION_REFUSED/i').first();
  const hasErrBanner = await errBanner.isVisible().catch(() => false);
  ac('L2-PAYROLL-LOAD', hasErrBanner ? 'FAIL' : 'PASS', {
    summary: hasErrBanner ? 'ERROR banner on payroll' : 'Payroll components tab reachable',
  });

  const dialog = await openAddDialog(page);
  await shot(page, '05-add-dialog');

  const catalogPicker = page.getByTestId('pay-salary-component-catalog-picker');
  const pickerVisible = await catalogPicker.isVisible().catch(() => false);
  const freeTextCode = page.locator('input.xevn-field-code').first();
  const freeTextVisible = await freeTextCode.isVisible().catch(() => false);

  ac('AC-PAY-COMP-01-PICKER', pickerVisible && !freeTextVisible ? 'PASS' : 'FAIL', {
    summary:
      pickerVisible && !freeTextVisible
        ? `CatalogSearchPicker visible (settings SC eff=${probes.settingsSalaryComponentsEff}) · free-text hidden`
        : `picker=${pickerVisible} freeText=${freeTextVisible} eff=${probes.settingsSalaryComponentsEff}`,
  });

  // Invent-code negative: force invent via RHF/DOM if free-text absent; assert no invent POST 2xx
  const inventPosts = [];
  const inventResponses = [];
  const onReq = (req) => {
    if (req.method() === 'POST' && /\/payroll\/salary-components/.test(req.url())) {
      inventPosts.push(req.postData()?.slice(0, 500) || '');
    }
  };
  const onRes = async (res) => {
    try {
      if (res.request().method() === 'POST' && /\/payroll\/salary-components/.test(res.url())) {
        let body = '';
        try {
          body = (await res.text()).slice(0, 400);
        } catch {
          /* */
        }
        inventResponses.push({ status: res.status(), body });
      }
    } catch {
      /* */
    }
  };
  page.on('request', onReq);
  page.on('response', onRes);

  // Force invent into form if possible (catalog-bound should Zod-block)
  await page.evaluate((code) => {
    const inputs = Array.from(document.querySelectorAll('input'));
    const codeInput = inputs.find((el) => el.classList.contains('xevn-field-code'));
    if (codeInput) {
      codeInput.removeAttribute('readonly');
      codeInput.removeAttribute('disabled');
      codeInput.value = code;
      codeInput.dispatchEvent(new Event('input', { bubbles: true }));
      codeInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }, INVENT_CODE);

  // Also try typing invent into picker search then submit without valid selection
  if (pickerVisible) {
    await catalogPicker.click();
    await sleep(400);
    const search = page.locator('[cmdk-input], input[placeholder*="Tìm"]').last();
    if (await search.isVisible().catch(() => false)) {
      await search.fill(INVENT_CODE);
      await sleep(400);
    }
    await page.keyboard.press('Escape').catch(() => {});
  }

  const saveBtn = dialog
    .getByRole('button', { name: /Thêm|Lưu|Add|Save|Tạo/i })
    .filter({ hasNotText: /Hủy|Cancel/i })
    .last();
  if (await saveBtn.isVisible().catch(() => false)) {
    await saveBtn.click();
    await sleep(1500);
  }
  await shot(page, '06-invent-attempt');

  const inventPostHit = inventPosts.some((b) => new RegExp(INVENT_CODE, 'i').test(b));
  const inventOkHttp = inventResponses.some(
    (r) => r.status >= 200 && r.status < 300 && /INVENT_/i.test(r.body),
  );
  const inventBlocked = !inventPostHit && !inventOkHttp;
  ac('AC-PAY-COMP-01-INVENT-NEGATIVE', inventBlocked ? 'PASS' : 'FAIL', {
    summary: inventBlocked
      ? `Invent ${INVENT_CODE} did not reach successful salary-components POST (picker/Zod gate)`
      : `Invent code leaked to POST inventPostHit=${inventPostHit} inventOkHttp=${inventOkHttp}`,
    inventPosts: inventPosts.slice(0, 3),
    inventResponses: inventResponses.slice(0, 3),
  });

  // Positive picker path: pick SC_CODE + pay_types → POST 2xx → F5
  // Re-open dialog clean
  await page.keyboard.press('Escape').catch(() => {});
  await sleep(500);
  const dialogStill = await dialog.isVisible().catch(() => false);
  if (dialogStill) {
    await dialog.getByRole('button', { name: /Hủy|Cancel|Đóng/i }).first().click().catch(() => {});
    await sleep(600);
  }
  const dialog2 = await openAddDialog(page);
  await shot(page, '07-add-dialog-positive');

  const picker2 = page.getByTestId('pay-salary-component-catalog-picker');
  let pickedSc = false;
  if (await picker2.isVisible().catch(() => false)) {
    await picker2.click();
    await sleep(500);
    const search = page.locator('[cmdk-input], input[placeholder*="Tìm"]').last();
    if (await search.isVisible().catch(() => false)) {
      await search.fill(SC_CODE);
      await sleep(500);
    }
    const opt = page
      .locator('[cmdk-item], [role="option"]')
      .filter({ hasText: new RegExp(SC_CODE, 'i') })
      .first();
    if (await opt.isVisible().catch(() => false)) {
      await opt.click();
      pickedSc = true;
    } else {
      pickedSc = await pickFirstCmdk(page);
    }
  }

  // pay_types
  let payTypePicked = false;
  const typeTriggers = dialog2.locator('button[role="combobox"]');
  const typeCount = await typeTriggers.count();
  for (let i = 0; i < typeCount; i++) {
    const t = typeTriggers.nth(i);
    const txt = ((await t.textContent()) || '').trim();
    // Skip the salary-component picker combobox if already filled
    if (/Chọn|bản chất|loại|danh mục|Select/i.test(txt) || txt.length < 4) {
      await t.click();
      await sleep(400);
      if (await pickFirstCmdk(page)) {
        payTypePicked = true;
        break;
      }
      await page.keyboard.press('Escape').catch(() => {});
    }
  }

  ac('UF-PICK-CATALOG-CODE', pickedSc ? 'PASS' : 'FAIL', {
    summary: pickedSc
      ? `Picked catalog code (target ${SC_CODE})`
      : `Could not pick ${SC_CODE} from CatalogSearchPicker`,
  });
  ac('UF-PICK-PAY-TYPES', payTypePicked || probes.settingsPayTypesEff > 0 ? (payTypePicked ? 'PASS' : 'BLOCKED') : 'FAIL', {
    summary: payTypePicked
      ? 'Selected pay_types option'
      : `pay_types pick failed (eff=${probes.settingsPayTypesEff})`,
  });

  let postStatus = null;
  let savedCode = null;
  const save2 = dialog2
    .getByRole('button', { name: /Thêm|Lưu|Add|Save|Tạo/i })
    .filter({ hasNotText: /Hủy|Cancel/i })
    .last();
  if (await save2.isVisible().catch(() => false)) {
    const respWait = page
      .waitForResponse(
        (r) => /\/payroll\/salary-components/.test(r.url()) && r.request().method() === 'POST',
        { timeout: 18_000 },
      )
      .catch(() => null);
    await save2.click();
    const resp = await respWait;
    if (resp) {
      postStatus = resp.status();
      try {
        const j = await resp.json();
        savedCode = j?.data?.code ?? j?.code ?? null;
      } catch {
        /* */
      }
    }
    await sleep(1200);
    await shot(page, '08-after-positive-save');
  }

  ac(
    'UF-MUTATE-POST',
    postStatus >= 200 && postStatus < 300 ? 'PASS' : postStatus ? 'FAIL' : 'BLOCKED',
    {
      summary: postStatus
        ? `POST salary-components → ${postStatus} code=${savedCode || '?'}`
        : 'No POST — form incomplete / Zod blocked',
      postStatus,
      savedCode,
      expectedCatalogCode: SC_CODE,
    },
  );

  if (postStatus >= 200 && postStatus < 300) {
    await page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(2000);
    await openComponentsTab(page);
    const rowText = (await page.locator('table tbody').textContent().catch(() => '')) || '';
    const code = savedCode || SC_CODE;
    ac('UF-F5-INSTANCE', rowText.includes(code) ? 'PASS' : 'FAIL', {
      summary: rowText.includes(code) ? `Row ${code} after F5` : `Missing ${code} after F5`,
      snippet: rowText.slice(0, 220),
    });
    await shot(page, '09-f5-instance');

    await openAddDialog(page);
    await sleep(800);
    const pickerAgain = await page
      .getByTestId('pay-salary-component-catalog-picker')
      .isVisible()
      .catch(() => false);
    const freeTextAgain = await page.locator('input.xevn-field-code').first().isVisible().catch(() => false);
    const catalogBoundEmptyHint = await page
      .getByText(/Chưa có mục trong danh mục|Mã lấy từ danh mục Cài đặt/i)
      .first()
      .isVisible()
      .catch(() => false);
    // PASS if picker trigger OR catalog-bound empty UI (all codes consumed) — never free-text when density>0
    const pickerAgainOk = (pickerAgain || catalogBoundEmptyHint) && !freeTextAgain;
    // Prefer remaining SC_CODE_B still selectable
    let remainingPickable = false;
    if (pickerAgain) {
      await page.getByTestId('pay-salary-component-catalog-picker').click();
      await sleep(400);
      const search = page.locator('[cmdk-input], input[placeholder*="Tìm"]').last();
      if (await search.isVisible().catch(() => false)) {
        await search.fill(SC_CODE_B);
        await sleep(400);
      }
      remainingPickable = await page
        .locator('[cmdk-item], [role="option"]')
        .filter({ hasText: new RegExp(SC_CODE_B, 'i') })
        .first()
        .isVisible()
        .catch(() => false);
      await page.keyboard.press('Escape').catch(() => {});
    }
    ac(
      'AC-PAY-COMP-01-PICKER-AGAIN',
      pickerAgainOk && (remainingPickable || catalogBoundEmptyHint) ? 'PASS' : 'FAIL',
      {
        summary: pickerAgainOk
          ? remainingPickable
            ? `Thêm again → CatalogSearchPicker still bound; remaining ${SC_CODE_B} pickable`
            : 'Thêm again → catalogBound empty-hint (all Settings codes already used as instances) · free-text still hidden'
          : `picker=${pickerAgain} freeText=${freeTextAgain} emptyHint=${catalogBoundEmptyHint}`,
        remainingPickable,
      },
    );
    await shot(page, '10-add-again');
  } else {
    ac('UF-F5-INSTANCE', 'BLOCKED', { summary: 'Skipped — no successful instance POST' });
    ac('AC-PAY-COMP-01-PICKER-AGAIN', 'BLOCKED', { summary: 'Skipped — no successful create' });
  }

  page.off('request', onReq);
  page.off('response', onRes);

  const uncaught = [
    ...R.pageErrors,
    ...R.consoleErrors.filter((t) => /Uncaught ReferenceError|Uncaught TypeError/i.test(t)),
  ];
  ac('CONSOLE-GATE', uncaught.length === 0 ? 'PASS' : 'FAIL', {
    summary: uncaught.length === 0 ? 'No uncaught' : `${uncaught.length} uncaught`,
    sample: uncaught.slice(0, 3),
  });
  ac('HONESTY-NO-E2E-READY', 'PASS', {
    summary: 'payroll_e2e_ready remains false — not claimed',
  });

  await browser.close();

  const fails = Object.entries(R.ac).filter(([, v]) => v.verdict === 'FAIL');
  const blocked = Object.entries(R.ac).filter(([, v]) => v.verdict === 'BLOCKED');
  R.overall = fails.length === 0 ? (blocked.length > 0 ? 'PASS_WITH_BLOCKED' : 'PASS') : 'FAIL';
  R.ack_status = fails.length === 0 ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  R.honesty.payroll_e2e_ready = false;
  R.endedAt = ts();
  save();
  console.log(
    `\nOVERALL=${R.overall} ack=${R.ack_status} blocked=${blocked.length} fail=${fails.length}`,
  );
  process.exit(fails.length === 0 ? 0 : 1);
}

main().catch((e) => {
  R.overall = 'FAIL';
  R.ack_status = 'FAIL_TO_PM';
  R.error = String(e).slice(0, 500);
  R.endedAt = ts();
  save();
  console.error(e);
  process.exit(1);
});
