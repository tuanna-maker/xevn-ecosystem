#!/usr/bin/env node
/**
 * QA-HRM-SETTINGS-CONSUMER-PAY-STALE-01 — UF-HRM-10 consumer + J-HRM-PAY-09-01 no-F5
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const XBOS = process.env.XBOS_HOST_API || 'http://127.0.0.1:28002';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const COMPANY = process.env.QA_COMPANY_ID || 'main';
const TENANT = process.env.QA_TENANT_ID || 'xevn';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const STAMP = `QACONPAYST1-${Date.now().toString(36).toUpperCase().slice(-8)}`;
const GROUP_CODE = `Q09CPY${Date.now().toString(36).toUpperCase().slice(-6)}`;

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-qa-hrm-settings-consumer-pay-stale-01.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/qa-hrm-settings-consumer-pay-stale-01');
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
  work_item_id: 'QA-HRM-SETTINGS-CONSUMER-PAY-STALE-01',
  stamp: STAMP,
  startedAt: ts(),
  persona: { email: EMAIL, companyId: COMPANY },
  u65: 'zero-seed-browser-only',
  env: { PORTAL, XBOS, TENANT, commit: COMMIT },
  l0: { qc_fe_be_health: 'exit 0 (pre-run)' },
  uf: {},
  journeys: {},
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  ack_status: null,
  overall: null,
  endedAt: null,
};

function q(path) {
  const u = new URL(path, PORTAL);
  u.searchParams.set('portal', '1');
  u.searchParams.set('tenantId', TENANT);
  u.searchParams.set('companyId', COMPANY);
  return u.toString();
}

async function loginApi() {
  let data = null;
  for (const url of [`${XBOS}/api/xbos/auth/login`, `${PORTAL}/api/xbos/auth/login`]) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
      });
      const j = await r.json().catch(() => ({}));
      const d = j?.data ?? j;
      const token = d?.accessToken ?? d?.access_token ?? j?.accessToken;
      if (r.ok && token) {
        data = { ...d, accessToken: token };
        break;
      }
    } catch {
      /* */
    }
  }
  if (!data?.accessToken) throw new Error('login failed');
  return {
    token: data.accessToken,
    user: data.user ?? { email: EMAIL },
    companyId: COMPANY,
    expiresAt: Date.now() + 3600000,
    raw: data,
  };
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
      store.setItem('access_token', s.token);
      store.setItem('token', s.token);
      if (s.raw?.refreshToken) store.setItem('xevn.portal.refreshToken', s.raw.refreshToken);
      if (s.raw?.defaultMembershipId)
        store.setItem('xevn.portal.membershipId', s.raw.defaultMembershipId);
    }
  }, session);
}

async function shot(page, name) {
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  R.screens.push(path.replace(/\\/g, '/'));
}

async function resolveHrmContractsFrame(page, timeoutMs = 60000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    for (const f of page.frames()) {
      const has = await f
        .locator('[data-testid="hdsd-contracts-create-btn"]')
        .first()
        .isVisible()
        .catch(() => false);
      if (has) return f;
    }
    if (await page.getByTestId('hdsd-contracts-create-btn').isVisible().catch(() => false)) return page;
    await sleep(400);
  }
  return null;
}

async function resolveWizardShell(page, hrm, timeoutMs = 50000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    for (const ctx of [page, hrm, ...page.frames()]) {
      if (!ctx) continue;
      const stepper = await ctx.getByTestId('ctr-create-wizard-stepper').isVisible().catch(() => false);
      if (stepper) return ctx;
    }
    await sleep(350);
  }
  return null;
}

async function countPickerOptions(ctx) {
  return ctx.locator('[data-testid^="catalog-picker-option-"]').count();
}

async function openPickerAndCount(page, ctx, comboboxTestIds) {
  const ids = Array.isArray(comboboxTestIds) ? comboboxTestIds : [comboboxTestIds];
  let combobox = null;
  let usedId = '';
  for (const id of ids) {
    const loc = ctx.getByTestId(id);
    if (await loc.isVisible().catch(() => false)) {
      combobox = loc;
      usedId = id;
      break;
    }
  }
  if (!combobox) {
    const rootId = ids[0]?.replace(/-combobox$/, '');
    const root = rootId ? ctx.getByTestId(rootId) : null;
    if (root && (await root.isVisible().catch(() => false))) {
      const roleCombo = root.locator('[role="combobox"]').first();
      if (await roleCombo.isVisible().catch(() => false)) {
        combobox = roleCombo;
        usedId = `${rootId} [role=combobox]`;
      }
    }
  }
  if (!combobox) {
    return { ok: false, note: `${ids.join(' | ')} not visible`, optionCount: 0 };
  }
  await combobox.scrollIntoViewIfNeeded().catch(() => {});
  await combobox.click({ force: true, timeout: 20000 });
  await sleep(800);
  let optionCount = 0;
  let sampleOptionTestId = '';
  for (const c of [ctx, page, ...page.frames()]) {
    optionCount = await countPickerOptions(c);
    if (optionCount > 0) {
      sampleOptionTestId =
        (await c.locator('[data-testid^="catalog-picker-option-"]').first().getAttribute('data-testid')) || '';
      break;
    }
  }
  await page.keyboard.press('Escape').catch(() => {});
  const ok = optionCount > 0;
  return {
    ok,
    note: ok ? `${optionCount} options; sample ${sampleOptionTestId}; via ${usedId}` : '0 catalog options',
    optionCount,
    sampleOptionTestId,
    usedTestId: usedId,
  };
}

async function testContractsConsumerPickers(page) {
  const settingsCatalogGets = [];
  page.on('response', (res) => {
    if (res.request().method() === 'GET' && /settings-catalogs/.test(res.url()) && res.status() === 200) {
      settingsCatalogGets.push(res.url().slice(0, 120));
    }
  });

  await page.goto(`${PORTAL}/command-center/hrm/contracts`, {
    waitUntil: 'domcontentloaded',
    timeout: 120000,
  });
  await sleep(3000);
  const hrm = await resolveHrmContractsFrame(page);
  if (!hrm) return { ok: false, note: 'contracts shell not found' };

  await hrm.getByTestId('hdsd-contracts-create-btn').click({ timeout: 45000 });
  await sleep(2000);
  const shell = await resolveWizardShell(page, hrm);
  if (!shell) return { ok: false, note: 'wizard stepper not found' };

  await shell.getByTestId('ctr-create-step-1').waitFor({ state: 'visible', timeout: 45000 }).catch(() => {});
  await shell.getByTestId('ctr-create-template-combobox').waitFor({ state: 'visible', timeout: 60000 }).catch(() => {});
  await sleep(500);

  const deptCtx = await (async () => {
    for (const ctx of [shell, page, ...page.frames()]) {
      if (await ctx.getByTestId('ctr-create-department-picker').isVisible().catch(() => false)) {
        return ctx;
      }
    }
    return shell;
  })();

  let typeCtx = shell;
  for (const ctx of [shell, page, ...page.frames()]) {
    if (await ctx.getByTestId('hdsd-contracts-form-contract-type').isVisible().catch(() => false)) {
      typeCtx = ctx;
      break;
    }
  }

  let contractType = { ok: false, note: 'skipped', optionCount: 0 };
  try {
    contractType = await openPickerAndCount(page, typeCtx, [
      'hdsd-contracts-form-contract-type-combobox',
      'hdsd-contracts-form-contract-type',
    ]);
  } catch (e) {
    contractType = { ok: false, note: String(e).slice(0, 200), optionCount: 0 };
  }

  await page.keyboard.press('Escape').catch(() => {});
  await sleep(300);

  const dept = await openPickerAndCount(page, deptCtx, 'ctr-create-department-picker-combobox');

  const ok = dept.ok && contractType.ok;
  return {
    ok,
    dept,
    contractType,
    settingsCatalogGets: [...new Set(settingsCatalogGets)].slice(0, 5),
    url: page.url(),
  };
}

async function testPayGroupNoF5(page) {
  await page.goto(q('/hr/payroll'), { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(2000);
  await page.getByTestId('payroll-tab-policy').click();
  await sleep(400);
  await page.getByRole('menuitem', { name: /Phân nhóm bảng lương/ }).click();
  await sleep(1500);
  await page.getByTestId('pay-groups-catalog-precision').waitFor({ state: 'visible', timeout: 45000 });

  await page.getByTestId('pay-group-create-btn').click();
  await page.getByTestId('pay-group-form-code').fill(GROUP_CODE);
  await page.getByTestId('pay-group-form-name').fill(`QA consumer pay stale ${GROUP_CODE}`);

  const createWait = page.waitForResponse(
    (res) =>
      res.request().method() === 'POST' &&
      /\/api\/hrm\/payroll\/groups/.test(res.url()) &&
      res.status() >= 200 &&
      res.status() < 300,
    { timeout: 45000 },
  );
  await page.getByTestId('pay-group-form-submit').click();
  const createRes = await createWait;
  const createJson = await createRes.json().catch(() => ({}));
  const groupId = createJson?.data?.id ?? createJson?.id;

  await page
    .waitForResponse(
      (res) => res.request().method() === 'GET' && /\/payroll\/groups\?/.test(res.url()) && res.status() === 200,
      { timeout: 20000 },
    )
    .catch(() => {});

  let rowWithoutF5 = false;
  const rowById = groupId ? page.getByTestId(`pay-group-row-${groupId}`) : null;
  const deadline = Date.now() + 20000;
  while (Date.now() < deadline) {
    const ok =
      (rowById && (await rowById.isVisible().catch(() => false))) ||
      (await page
        .locator(`[data-testid^="pay-group-row-"]`)
        .filter({ hasText: GROUP_CODE })
        .first()
        .isVisible()
        .catch(() => false));
    if (ok) {
      rowWithoutF5 = true;
      break;
    }
    await sleep(400);
  }

  return {
    ok: createRes.status() === 201 && rowWithoutF5,
    post: { status: createRes.status(), id: groupId, code: GROUP_CODE },
    rowWithoutF5,
    url: page.url(),
  };
}

async function main() {
  const session = await loginApi();
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  page.on('console', (msg) => {
    if (msg.type() === 'error') R.consoleErrors.push(msg.text().slice(0, 240));
  });
  page.on('pageerror', (err) => R.pageErrors.push(String(err).slice(0, 240)));

  await injectPortalAuth(page, session);

  try {
    const ctr = await testContractsConsumerPickers(page);
    await shot(page, 'contracts-create-pickers');
    R.uf['UF-HRM-10'] = {
      verdict: ctr.ok ? 'PASS' : 'FAIL',
      spec_ref: 'docs/hrm/SRS.md §16.8 O4 · HRM-SC-02 · UF-HRM-10 consumer',
      click_path: 'Command Center → HRM Hợp đồng → Tạo HĐ → bước 1',
      dept_picker: ctr.dept,
      contract_type_picker: ctr.contractType,
      settings_catalog_gets: ctr.settingsCatalogGets,
      url: ctr.url,
      note: ctr.note,
    };
  } catch (e) {
    R.uf['UF-HRM-10'] = {
      verdict: 'FAIL',
      spec_ref: 'docs/hrm/SRS.md §16.8 O4 · HRM-SC-02 · UF-HRM-10 consumer',
      error: String(e).slice(0, 400),
    };
  }

  try {
    const pay = await testPayGroupNoF5(page);
    await shot(page, 'pay-group-after-create-no-f5');
    R.journeys['J-HRM-PAY-09-01'] = {
      verdict: pay.ok ? 'PASS' : 'FAIL',
      spec_ref: 'FR-UC-BP-PAY-09 · UI-PAYROLL-CLUSTER-EMBED J-HRM-PAY-09-01',
      click_path: 'Lương → Chính sách → Phân nhóm bảng lương → Tạo nhóm → Lưu',
      post: pay.post,
      row_without_f5: pay.rowWithoutF5,
      url: pay.url,
    };
  } catch (e) {
    R.journeys['J-HRM-PAY-09-01'] = {
      verdict: 'FAIL',
      error: String(e).slice(0, 400),
    };
  }

  const ctrOk = R.uf['UF-HRM-10']?.verdict === 'PASS';
  const payOk = R.journeys['J-HRM-PAY-09-01']?.verdict === 'PASS';
  const allPass = ctrOk && payOk;
  R.overall = allPass ? 'PASS' : 'FAIL';
  R.ack_status = allPass ? 'PASS_TO_PM' : 'FAIL_TO_PM';

  R.endedAt = ts();
  writeFileSync(OUT_JSON, JSON.stringify(R, null, 2));
  await browser.close().catch(() => {});
  console.log(JSON.stringify({ stamp: STAMP, ack_status: R.ack_status, overall: R.overall }, null, 2));
  process.exit(R.ack_status === 'PASS_TO_PM' ? 0 : 1);
}

main();
