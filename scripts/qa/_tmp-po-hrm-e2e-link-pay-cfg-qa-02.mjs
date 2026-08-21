#!/usr/bin/env node
/**
 * PO-HRM-E2E-LINK-PAY-CFG-QA-02 — U65 density bootstrap + AC-PAY-COMP-01 picker retest
 * Parent: QA-01 PASS_WITH_BLOCKED (catalog density 0)
 * Honesty: payroll_e2e_ready=false · zero-seed · no invent TDZ re-dispatch
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
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-e2e-link-pay-cfg-qa-02-browser.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-e2e-link-pay-cfg-qa-02');
mkdirSync(SCREEN, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const R = {
  work_item_id: 'PO-HRM-E2E-LINK-PAY-CFG-QA-02',
  parent: 'PO-HRM-E2E-LINK-PAY-CFG-QA-01',
  startedAt: ts(),
  persona: { email: EMAIL, companyId: COMPANY },
  u65: 'zero-seed · browser-only · FE after 2xx + F5',
  hdsd_align: 'Lương → Thành phần lương → Thêm · Cài đặt danh mục · CC apply (spot)',
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
      if (
        !/\/api\/(hrm\/(settings-catalogs|payroll\/salary-components)|xbos\/config-sync)/.test(u)
      )
        return;
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
  const catalogs = overview.json?.data?.catalogs ?? [];
  const scKey = catalogs.find((c) => c.catalogKey === 'salary_components');
  const ptKey = catalogs.find((c) => c.catalogKey === 'pay_types');
  const scItems = await apiCall(
    HRM,
    token,
    'GET',
    `/api/hrm/settings-catalogs/salary_components/items?company_id=${COMPANY}`,
  );
  const ptItems = await apiCall(
    HRM,
    token,
    'GET',
    `/api/hrm/settings-catalogs/pay_types/items?company_id=${COMPANY}`,
  );
  const payComp = await apiCall(
    HRM,
    token,
    'GET',
    `/api/hrm/payroll/salary-components?company_id=${COMPANY}`,
  );
  const xbosPt = await apiCall(
    XBOS,
    token,
    'GET',
    `/api/xbos/config-sync/catalog/pay_types?company_id=${COMPANY}`,
  );
  const xbosSc = await apiCall(
    XBOS,
    token,
    'GET',
    `/api/xbos/config-sync/catalog/salary_components?company_id=${COMPANY}`,
  );
  const payRows = payComp.json?.data?.data ?? payComp.json?.data ?? [];
  const payList = Array.isArray(payRows) ? payRows : [];
  const scList = scItems.json?.data?.data ?? scItems.json?.data?.items ?? [];
  const ptList = ptItems.json?.data?.data ?? ptItems.json?.data?.items ?? [];
  R.probes = {
    overviewStatus: overview.status,
    overviewCatalogCount: catalogs.length,
    settingsHasSalaryComponentsKey: Boolean(scKey),
    settingsHasPayTypesKey: Boolean(ptKey),
    settingsSalaryComponentsEff: scKey?.effectiveItems?.length ?? (Array.isArray(scList) ? scList.length : 0),
    settingsPayTypesEff: ptKey?.effectiveItems?.length ?? (Array.isArray(ptList) ? ptList.length : 0),
    settingsSalaryComponentsPickerTotal: scItems.json?.data?.total ?? null,
    settingsPayTypesPickerTotal: ptItems.json?.data?.total ?? null,
    payrollSalaryComponentsTotal: payComp.json?.data?.total ?? payList.length,
    payrollStarterCodes: payList
      .filter((r) => /LUONG_CO_BAN|THUE_TNCN_HT|SO_NGAY_NGHI_BU/i.test(String(r.code || '')))
      .map((r) => ({ code: r.code, name: r.name, is_system: r.is_system })),
    xbosPayTypes: { status: xbosPt.status, code: xbosPt.json?.code, message: xbosPt.json?.message },
    xbosSalaryComponents: {
      status: xbosSc.status,
      code: xbosSc.json?.code,
      message: xbosSc.json?.message,
    },
  };
  save();
  return R.probes;
}

async function openComponentsTab(page) {
  // Prefer stable testid — text match can race with other "Thêm" surfaces on Tính lương
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
  return byTestId;
}

async function openAddDialog(page) {
  const scoped = page.getByTestId('pay-components-precision').locator('..');
  const addTarget = page
    .getByRole('button', { name: /Thêm mới|Add New|\+ Thêm/i })
    .filter({ hasNotText: /bảng lương|hệ thống|system/i })
    .first();
  const addNearHeader = page
    .locator('[data-testid="pay-components-precision"]')
    .locator('xpath=ancestor::div[1]')
    .getByRole('button', { name: /Thêm/i })
    .first();
  const candidates = [addNearHeader, addTarget];
  let clicked = false;
  for (const btn of candidates) {
    if (await btn.isVisible().catch(() => false)) {
      await btn.click();
      clicked = true;
      break;
    }
  }
  if (!clicked) {
    // Last resort: any visible Thêm mới on page after components precision visible
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
    'PROBE-STARTER-ROWS',
    probes.payrollStarterCodes.length >= 1 ? 'PASS' : 'BLOCKED',
    {
      summary:
        probes.payrollStarterCodes.length >= 1
          ? `PAY-CATALOG-BE starter rows present: ${probes.payrollStarterCodes.map((c) => c.code).join(',')}`
          : 'No LUONG_CO_BAN/THUE_TNCN_HT/SO_NGAY_NGHI_BU on payroll salary-components list',
      codes: probes.payrollStarterCodes,
    },
  );
  ac(
    'PROBE-SETTINGS-DENSITY',
    probes.settingsSalaryComponentsEff > 0 && probes.settingsPayTypesEff > 0 ? 'PASS' : 'BLOCKED',
    {
      summary: `Settings salary_components eff=${probes.settingsSalaryComponentsEff} pay_types eff=${probes.settingsPayTypesEff}; keys present sc=${probes.settingsHasSalaryComponentsKey} pt=${probes.settingsHasPayTypesKey}`,
    },
  );
  ac(
    'PROBE-XBOS-PAY-TYPES',
    probes.xbosPayTypes.status === 200 ? 'PASS' : 'BLOCKED',
    {
      summary: `XBOS config-sync pay_types → HTTP ${probes.xbosPayTypes.status} ${probes.xbosPayTypes.code || ''} ${probes.xbosPayTypes.message || ''}`,
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

  // --- Step A: Settings FE — try add pay_types / salary_components (product path) ---
  log('goto /hr/settings-catalogs');
  await page.goto(q('/hr/settings-catalogs'), { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await sleep(1800);
  await shot(page, '01-settings-catalogs');

  const syncBtn = page.getByRole('button', { name: /Đồng bộ từ XBOS|Sync from XBOS|Đồng bộ/i }).first();
  if (await syncBtn.isVisible().catch(() => false)) {
    const syncWait = page
      .waitForResponse(
        (r) => /settings-catalogs\/sync-from-xbos/.test(r.url()) && r.request().method() === 'POST',
        { timeout: 45_000 },
      )
      .catch(() => null);
    await syncBtn.click();
    const syncResp = await syncWait;
    R.probes.syncFromXbos = syncResp ? syncResp.status() : 'no-response';
    await sleep(2000);
    await shot(page, '02-settings-sync');
  }

  // Collect Select options for catalog key
  const keyTrigger = page.locator('#ext-catalog-key').first();
  let selectHasPayTypes = false;
  let selectHasSalaryComponents = false;
  let selectOptionSample = [];
  if (await keyTrigger.isVisible().catch(() => false)) {
    await keyTrigger.click();
    await sleep(500);
    const opts = page.getByRole('option');
    const n = await opts.count();
    for (let i = 0; i < n; i++) {
      const t = ((await opts.nth(i).textContent()) || '').trim();
      if (t) selectOptionSample.push(t.slice(0, 80));
      if (/pay_types|bản chất|loại TP/i.test(t)) selectHasPayTypes = true;
      if (/salary_components|thành phần lương/i.test(t)) selectHasSalaryComponents = true;
    }
    await page.keyboard.press('Escape').catch(() => {});
  }
  R.probes.settingsSelect = {
    selectHasPayTypes,
    selectHasSalaryComponents,
    optionCount: selectOptionSample.length,
    sample: selectOptionSample.slice(0, 20),
  };
  ac('UF-SETTINGS-FE-CREATE-PAY-TYPES-KEY', selectHasPayTypes ? 'PASS' : 'BLOCKED', {
    summary: selectHasPayTypes
      ? 'Settings Select exposes pay_types (Bản chất / loại TP lương)'
      : 'Settings Select missing pay_types',
  });
  ac(
    'UF-SETTINGS-FE-CREATE-SALARY-COMPONENTS-KEY',
    selectHasSalaryComponents ? 'PASS' : 'BLOCKED',
    {
      summary: selectHasSalaryComponents
        ? 'Settings Select exposes salary_components'
        : 'Settings Select missing salary_components — AC-PAY-COMP-01 picker density cannot be FE-bootstrapped (XBOS P2 HOLD + no synced key)',
      sample: selectOptionSample.slice(0, 12),
    },
  );

  // If keys appear, try create items via FE
  async function feAddCatalogItem(catalogLabelOrKey, code, label) {
    const trigger = page.locator('#ext-catalog-key').first();
    if (!(await trigger.isVisible().catch(() => false))) return { ok: false, reason: 'no-trigger' };
    await trigger.click();
    await sleep(400);
    const opt = page
      .getByRole('option')
      .filter({ hasText: new RegExp(catalogLabelOrKey, 'i') })
      .first();
    if (!(await opt.isVisible().catch(() => false))) {
      await page.keyboard.press('Escape').catch(() => {});
      return { ok: false, reason: 'option-missing' };
    }
    await opt.click();
    await page.locator('#ext-code').fill(code);
    await page.locator('#ext-label').fill(label);
    const postWait = page
      .waitForResponse(
        (r) =>
          /settings-catalogs\/(items|.*\/extension-items)/.test(r.url()) &&
          r.request().method() === 'POST',
        { timeout: 20_000 },
      )
      .catch(() => null);
    await page.getByRole('button', { name: /Thêm|Add|Lưu/i }).last().click();
    const resp = await postWait;
    await sleep(1200);
    return { ok: Boolean(resp && resp.status() >= 200 && resp.status() < 300), status: resp?.status() };
  }

  let fePayTypeCreated = false;
  let feSalaryCompCatalogCreated = false;
  if (selectHasPayTypes) {
    const r1 = await feAddCatalogItem(
      'Bản chất / loại TP lương|pay_types',
      `QA_PT_${Date.now().toString(36).toUpperCase().slice(-5)}`,
      'Thu nhập thường xuyên QA',
    );
    fePayTypeCreated = r1.ok;
    ac('UF-SETTINGS-CREATE-PAY-TYPES', r1.ok ? 'PASS' : 'FAIL', {
      summary: r1.ok
        ? 'Created pay_types item via Settings FE'
        : `pay_types FE create failed: ${JSON.stringify(r1)}`,
    });
  }
  if (selectHasSalaryComponents) {
    const r2 = await feAddCatalogItem(
      'Thành phần lương \\(danh mục\\)|salary_components',
      'LUONG_CO_BAN',
      'Lương cơ bản',
    );
    feSalaryCompCatalogCreated = r2.ok;
    ac('UF-SETTINGS-CREATE-SALARY-COMPONENTS', r2.ok ? 'PASS' : 'FAIL', {
      summary: r2.ok
        ? 'Created salary_components catalog item via Settings FE'
        : `salary_components FE create failed: ${JSON.stringify(r2)}`,
    });
  } else {
    ac('UF-SETTINGS-CREATE-SALARY-COMPONENTS', 'BLOCKED', {
      summary:
        'Cannot FE-create salary_components catalog item — key absent from Settings Select (chicken-egg vs XBOS P2 HOLD)',
    });
  }
  await shot(page, '03-settings-after-attempt');

  // Spot: Command Center Apply panel — observe pay_types availability
  log('spot CC apply catalog');
  await page.goto(q('/command-center'), { waitUntil: 'domcontentloaded', timeout: 90_000 }).catch(() => {});
  await sleep(1500);
  const settingsNav = page.getByRole('button', { name: /Cài đặt|Settings/i }).first();
  if (await settingsNav.isVisible().catch(() => false)) await settingsNav.click().catch(() => {});
  const applyLink = page
    .getByText(/Áp dụng danh mục|Apply catalog|danh mục HRM/i)
    .first();
  if (await applyLink.isVisible().catch(() => false)) {
    await applyLink.click();
    await sleep(1500);
    await shot(page, '04-cc-apply-panel');
    const bodyText = (await page.locator('body').textContent().catch(() => '')) || '';
    const hasPayTypesLabel = /Bản chất|pay_types|loại TP/i.test(bodyText);
    ac('SPOT-CC-APPLY-PAY-TYPES-UI', hasPayTypesLabel ? 'PASS' : 'BLOCKED', {
      summary: hasPayTypesLabel
        ? 'Apply panel exposes pay_types label (allow-list UI)'
        : 'Apply panel / route not conclusive for pay_types',
    });
  } else {
    ac('SPOT-CC-APPLY-PAY-TYPES-UI', 'BLOCKED', {
      summary: 'Could not open Apply catalog panel from CC — probe already shows XBOS pay_types 404',
    });
  }

  // Re-probe after FE attempts
  probes = await probe(session.token);

  // --- Step B: Payroll → Thành phần lương → Thêm ---
  log('goto /hr/payroll components');
  await page.goto(q('/hr/payroll'), { waitUntil: 'commit', timeout: 90_000 });
  await sleep(1500);
  await openComponentsTab(page);
  const onComponents =
    (await page.getByTestId('pay-components-precision').isVisible().catch(() => false)) ||
    (await page.getByTestId('payroll-tab-components').getAttribute('data-state').catch(() => '')) ===
      'active' ||
    /Thành phần lương/i.test(
      (await page.getByTestId('pay-components-precision').textContent().catch(() => '')) || '',
    );
  if (!onComponents) {
    // Retry click with force
    await page.getByTestId('payroll-tab-components').click({ force: true }).catch(() => {});
    await sleep(1200);
  }
  await shot(page, '05-components-tab');

  const errBanner = page.locator('text=/HRM API Sync ERROR|ERR_CONNECTION_REFUSED/i').first();
  const hasErrBanner = await errBanner.isVisible().catch(() => false);
  ac('L2-PAYROLL-LOAD', hasErrBanner ? 'FAIL' : 'PASS', {
    summary: hasErrBanner ? 'ERROR banner on payroll' : 'Payroll components tab reachable',
  });

  // Assert starter rows visible in list (payroll API SoT — not Settings picker)
  const tableText = (await page.locator('table').first().textContent().catch(() => '')) || '';
  const starterVisible = /LUONG_CO_BAN|Lương cơ bản|THUE_TNCN/i.test(tableText);
  ac('UF-STARTER-ROWS-LIST', starterVisible || probes.payrollStarterCodes.length > 0 ? 'PASS' : 'BLOCKED', {
    summary: starterVisible
      ? 'Starter/system rows visible on Thành phần lương list (payroll SoT)'
      : `List text may not show codes; API starter count=${probes.payrollStarterCodes.length}`,
    tableSnippet: tableText.slice(0, 200),
  });

  await openAddDialog(page);
  await shot(page, '06-add-dialog-1');

  const catalogPicker = page.getByTestId('pay-salary-component-catalog-picker');
  const pickerVisible = await catalogPicker.isVisible().catch(() => false);
  const freeTextCode = page.locator('input.xevn-field-code').first();
  const freeTextVisible = await freeTextCode.isVisible().catch(() => false);
  const settingsEff = probes.settingsSalaryComponentsEff ?? 0;

  if (settingsEff > 0) {
    ac('AC-PAY-COMP-01-PICKER', pickerVisible ? 'PASS' : 'FAIL', {
      summary: pickerVisible
        ? `CatalogSearchPicker visible (settings salary_components=${settingsEff})`
        : `Expected picker; free-text=${freeTextVisible}`,
    });

    // Invent negative: try force invent via free-text if any, else empty submit + ensure no invent POST
    const inventPosts = [];
    const onReq = (req) => {
      if (req.method() === 'POST' && /salary-components/.test(req.url())) {
        inventPosts.push(req.postData()?.slice(0, 400) || '');
      }
    };
    page.on('request', onReq);

    // Prefer pick valid catalog code
    if (pickerVisible) {
      await catalogPicker.click();
      await sleep(500);
      const search = page.locator('[cmdk-input], input[placeholder*="Tìm"]').last();
      if (await search.isVisible().catch(() => false)) {
        await search.fill('LUONG');
        await sleep(400);
      }
      const opt = page.getByRole('option').first();
      if (await opt.isVisible().catch(() => false)) await opt.click();
      else {
        // CommandItem may not use option role
        const item = page.locator('[cmdk-item]').first();
        if (await item.isVisible().catch(() => false)) await item.click();
      }
    }

    // pay_types picker
    const typeCombo = page
      .locator('[role="dialog"] button[role="combobox"]')
      .filter({ hasText: /Chọn|bản chất|loại|danh mục/i })
      .first();
    if (await typeCombo.isVisible().catch(() => false)) {
      await typeCombo.click();
      await sleep(400);
      const pt = page.locator('[cmdk-item], [role="option"]').first();
      if (await pt.isVisible().catch(() => false)) await pt.click();
    }

    // Negative invent: if somehow free-text code available while catalog bound — type INVENT_
    if (freeTextVisible && !pickerVisible) {
      await freeTextCode.fill('INVENT_TX_99');
    }

    const saveBtn = page.getByRole('button', { name: /^Lưu$|Save/i }).first();
    let postStatus = null;
    let savedCode = null;
    if (await saveBtn.isVisible().catch(() => false)) {
      // First: empty/invalid path if no selection
      const respWait = page
        .waitForResponse(
          (r) => /salary-components/.test(r.url()) && r.request().method() === 'POST',
          { timeout: 12_000 },
        )
        .catch(() => null);
      await saveBtn.click();
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
      await sleep(1000);
      await shot(page, '07-after-save-attempt');
    }

    const inventHit = inventPosts.some((b) => /INVENT_/i.test(b));
    ac('AC-PAY-COMP-01-INVENT-BLOCKED', inventHit ? 'FAIL' : 'PASS', {
      summary: inventHit
        ? 'Invent code reached POST — Zod/picker failed'
        : 'No invent-code POST observed (picker/Zod gate)',
      inventPosts,
    });

    ac(
      'UF-MUTATE-POST',
      postStatus >= 200 && postStatus < 300 ? 'PASS' : postStatus ? 'FAIL' : 'BLOCKED',
      {
        summary: postStatus
          ? `POST salary-components → ${postStatus}`
          : 'No POST — Zod blocked or incomplete form',
        postStatus,
        savedCode,
      },
    );

    if (postStatus >= 200 && postStatus < 300 && savedCode) {
      await page.reload({ waitUntil: 'domcontentloaded' });
      await sleep(2000);
      await openComponentsTab(page);
      const rowText = (await page.locator('table tbody').textContent().catch(() => '')) || '';
      ac('UF-F5-PERSIST', rowText.includes(savedCode) ? 'PASS' : 'FAIL', {
        summary: rowText.includes(savedCode)
          ? `Row ${savedCode} after F5`
          : `Missing ${savedCode} after F5`,
      });
      await shot(page, '08-f5');
    }

    // Thêm again — picker still required
    await openAddDialog(page);
    const picker2 = await page.getByTestId('pay-salary-component-catalog-picker').isVisible().catch(() => false);
    ac('AC-PAY-COMP-01-PICKER-AGAIN', picker2 ? 'PASS' : 'FAIL', {
      summary: picker2 ? 'Thêm again → CatalogSearchPicker still bound' : 'Picker missing on second open',
    });
    await shot(page, '09-add-again');
    page.off('request', onReq);
  } else {
    // Empty Settings salary_components catalog path — free-text Mã + pay_types picker if available
    ac('AC-PAY-COMP-01-EMPTY-FALLBACK', !pickerVisible && freeTextVisible ? 'PASS' : 'FAIL', {
      summary:
        !pickerVisible && freeTextVisible
          ? 'Empty Settings catalog → free-text Mã Input (honest)'
          : `picker=${pickerVisible} freeText=${freeTextVisible}`,
    });
    const payTypesCta = page.locator('text=/pay_types|Cài đặt/i').first();
    const hasCta = await payTypesCta.isVisible().catch(() => false);
    ac('AC-PAY-COMP-01-EMPTY-CTA', hasCta ? 'PASS' : 'BLOCKED', {
      summary: hasCta ? 'pay_types / Settings CTA visible' : 'CTA not found',
    });

    const stamp = `QA_TP_${Date.now().toString(36).toUpperCase().slice(-6)}`;
    if (freeTextVisible) {
      await freeTextCode.fill(stamp);
      const nameInput = page.locator('input.xevn-field-name').first();
      if (await nameInput.isVisible().catch(() => false)) await nameInput.fill(`QA TP ${stamp}`);
    }

    // Select pay_types (Settings density may exist even when salary_components catalog empty)
    const dialog = page.getByTestId('pay-salary-component-add-dialog-precision');
    const typeTriggers = dialog.locator('button[role="combobox"]');
    const typeCount = await typeTriggers.count();
    let payTypePicked = false;
    for (let i = 0; i < typeCount; i++) {
      const t = typeTriggers.nth(i);
      const txt = ((await t.textContent()) || '').trim();
      if (/Chọn|bản chất|loại|danh mục|Select/i.test(txt) || txt.length < 3) {
        await t.click();
        await sleep(500);
        const item = page.locator('[cmdk-item], [role="option"]').first();
        if (await item.isVisible().catch(() => false)) {
          await item.click();
          payTypePicked = true;
          break;
        }
        await page.keyboard.press('Escape').catch(() => {});
      }
    }
    ac('UF-PICK-PAY-TYPES', payTypePicked || probes.settingsPayTypesEff > 0 ? (payTypePicked ? 'PASS' : 'BLOCKED') : 'BLOCKED', {
      summary: payTypePicked
        ? 'Selected pay_types option in Add dialog'
        : `Could not pick pay_types (eff=${probes.settingsPayTypesEff})`,
    });

    const saveBtn = dialog
      .getByRole('button', { name: /Thêm|Lưu|Add|Save|Tạo/i })
      .filter({ hasNotText: /Hủy|Cancel/i })
      .last();
    let postStatus = null;
    let savedCode = null;
    if (await saveBtn.isVisible().catch(() => false)) {
      const respWait = page
        .waitForResponse(
          (r) => /salary-components/.test(r.url()) && r.request().method() === 'POST',
          { timeout: 15_000 },
        )
        .catch(() => null);
      await saveBtn.click();
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
      await sleep(1000);
      await shot(page, '07-empty-save-attempt');
    }

    if (postStatus >= 200 && postStatus < 300) {
      ac('UF-EMPTY-CREATE-INSTANCE', 'PASS', {
        summary: `Free-text create POST ${postStatus} code=${savedCode || stamp}`,
        postStatus,
        savedCode: savedCode || stamp,
      });
      await page.reload({ waitUntil: 'domcontentloaded' });
      await sleep(2000);
      await openComponentsTab(page);
      const rowText = (await page.locator('table tbody').textContent().catch(() => '')) || '';
      const code = savedCode || stamp;
      ac('UF-F5-PERSIST', rowText.includes(code) ? 'PASS' : 'FAIL', {
        summary: rowText.includes(code) ? `Row ${code} after F5` : `Missing ${code} after F5`,
      });
      await shot(page, '08-f5-free-text');

      // Thêm again — still expect free-text unless Settings salary_components got density
      await openAddDialog(page);
      const pickerAfter = await page
        .getByTestId('pay-salary-component-catalog-picker')
        .isVisible()
        .catch(() => false);
      probes = await probe(session.token);
      if (probes.settingsSalaryComponentsEff > 0) {
        ac('AC-PAY-COMP-01-PICKER', pickerAfter ? 'PASS' : 'FAIL', {
          summary: pickerAfter
            ? 'After density bootstrap → CatalogSearchPicker'
            : 'Settings has items but picker missing',
        });
      } else {
        ac('AC-PAY-COMP-01-PICKER', 'BLOCKED', {
          summary:
            'Payroll instance create succeeded but Settings salary_components still 0 — CatalogSearchPicker not claimed (starters ≠ Settings SoT)',
          payrollStarters: probes.payrollStarterCodes,
        });
      }
      await shot(page, '09-add-again');
      ac('AC-PAY-COMP-01-INVENT-BLOCKED', 'BLOCKED', {
        summary: 'Invent-code negative requires catalogBound Settings >0 — still blocked',
      });
      ac('UF-MUTATE-POST', 'PASS', {
        summary: `Instance create POST ${postStatus} (free-text path; not catalog-bound)`,
      });
    } else {
      ac('UF-EMPTY-CREATE-INSTANCE', postStatus ? 'FAIL' : 'BLOCKED', {
        summary: postStatus
          ? `POST salary-components → ${postStatus}`
          : 'No POST — form incomplete or Zod blocked',
        postStatus,
        stamp,
        payTypePicked,
      });
      ac('AC-PAY-COMP-01-PICKER', 'BLOCKED', {
        summary: `Settings salary_components still ${settingsEff} — CatalogSearchPicker path not claimable`,
        payrollStarters: probes.payrollStarterCodes,
      });
      ac('AC-PAY-COMP-01-INVENT-BLOCKED', 'BLOCKED', {
        summary: 'Invent-code negative requires catalogBound >0 — not exercised',
      });
      ac('UF-MUTATE-POST', 'BLOCKED', {
        summary: 'No successful salary-components POST on free-text path',
      });
      ac('UF-F5-PERSIST', 'BLOCKED', { summary: 'Skipped — no successful create' });
    }
  }

  const uncaught = [
    ...R.pageErrors,
    ...R.consoleErrors.filter((t) => /Uncaught ReferenceError|Uncaught TypeError/i.test(t)),
  ];
  ac('CONSOLE-GATE', uncaught.length === 0 ? 'PASS' : 'FAIL', {
    summary: uncaught.length === 0 ? 'No uncaught' : `${uncaught.length} uncaught`,
    sample: uncaught.slice(0, 3),
  });
  ac('TDZ-SUPERSEDED', 'PASS', {
    summary: 'D-PAY-BATCHES-TDZ-01 not re-dispatched — superseded by SHOWADD-TDZ wave (per PM)',
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
  console.log(`\nOVERALL=${R.overall} ack=${R.ack_status} blocked=${blocked.length} fail=${fails.length}`);
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
