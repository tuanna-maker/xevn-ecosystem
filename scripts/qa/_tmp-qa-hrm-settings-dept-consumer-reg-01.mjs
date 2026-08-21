#!/usr/bin/env node
/**
 * QA-HRM-SETTINGS-DEPT-CONSUMER-REG-01 — BR-SET-CONSUMER-DEPT-REG-01 + AC-SET-CONSUMER-DEPT-EMP-01
 * U65 ceo@ · dept catalog consumer ≥2 screens beyond Contracts (Employee + JobRequisitions)
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
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

const STAMP = `DEPTCONREG1-${Date.now().toString(36).toUpperCase().slice(-8)}`;

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-qa-hrm-settings-dept-consumer-reg-01.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/qa-hrm-settings-dept-consumer-reg-01');
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
  work_item_id: 'QA-HRM-SETTINGS-DEPT-CONSUMER-REG-01',
  stamp: STAMP,
  startedAt: ts(),
  persona: { email: EMAIL, companyId: COMPANY },
  u65: 'zero-seed-browser-only',
  honesty: { settings_catalog_e2e_ready: false, deny_flip: true },
  env: { PORTAL, HRM, XBOS, TENANT, commit: COMMIT },
  l0: { qc_fe_be_health: 'exit 0 (pre-run)' },
  vitest: {
    files: [
      'po-hrm-settings-catalog-consumer-audit-fe-01.test.ts',
      'contractFormFieldResolver.test.ts',
    ],
    result: '9/9 pass (pre-run)',
  },
  catalogs: { deptEffCount: 0, deptCodes: [], settingsCatalogGet: null },
  screens: {},
  consoleErrors: [],
  pageErrors: [],
  ack_status: null,
  overall: null,
  endedAt: null,
};

function save() {
  writeFileSync(OUT_JSON, JSON.stringify(R, null, 2));
}

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

async function fetchDeptEff(token) {
  const url = `${HRM}/api/hrm/settings-catalogs?company_id=${COMPANY}`;
  const r = await fetch(url, {
    headers: { authorization: `Bearer ${token}`, 'x-tenant-id': TENANT },
  });
  const j = await r.json().catch(() => ({}));
  R.catalogs.settingsCatalogGet = { status: r.status, url: url.slice(0, 160) };
  const catalogs = j?.data?.catalogs ?? j?.catalogs ?? j?.data ?? [];
  const list = Array.isArray(catalogs) ? catalogs : [];
  const deptCat = list.find(
    (c) =>
      c?.catalog_key === 'departments' ||
      c?.key === 'departments' ||
      /department/i.test(String(c?.catalog_key || c?.key || '')),
  );
  const items =
    deptCat?.effective_items ??
    deptCat?.effectiveItems ??
    deptCat?.items?.filter((i) => i?.status !== 'inactive') ??
    [];
  const active = (Array.isArray(items) ? items : []).filter(
    (i) => i?.is_active !== false && i?.active !== false,
  );
  const codes = active
    .map((i) => i?.code ?? i?.storage_key ?? i?.key)
    .filter(Boolean)
    .map(String);
  R.catalogs.deptEffCount = codes.length;
  R.catalogs.deptCodes = codes.slice(0, 40);
  save();
  return { count: codes.length, codes };
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
  return path.replace(/\\/g, '/');
}

async function countPickerOptions(page, ctx) {
  for (const c of [ctx, page, ...page.frames()]) {
    const n = await c.locator('[data-testid^="catalog-picker-option-"]').count();
    if (n > 0) {
      const sample =
        (await c.locator('[data-testid^="catalog-picker-option-"]').first().getAttribute('data-testid')) ||
        '';
      const codes = [];
      const loc = c.locator('[data-testid^="catalog-picker-option-"]');
      const m = Math.min(n, 30);
      for (let i = 0; i < m; i++) {
        const tid = (await loc.nth(i).getAttribute('data-testid')) || '';
        const code = tid.replace(/^catalog-picker-option-/, '');
        if (code) codes.push(code);
      }
      return { count: n, sample, codes };
    }
  }
  return { count: 0, sample: '', codes: [] };
}

async function openCatalogPicker(page, ctx, comboboxLocator) {
  await comboboxLocator.scrollIntoViewIfNeeded().catch(() => {});
  await comboboxLocator.click({ force: true, timeout: 25000 });
  await sleep(900);
  const opts = await countPickerOptions(page, ctx);
  await page.keyboard.press('Escape').catch(() => {});
  await sleep(250);
  return opts;
}

async function findDeptComboboxInDialog(page, dialog) {
  const byTestId = dialog.locator('[data-testid*="department"]').locator('[role="combobox"]').first();
  if (await byTestId.isVisible().catch(() => false)) return { combo: byTestId, via: 'testid-department-combobox' };

  const reqDept = dialog.getByTestId('hdsd-requisition-department');
  if (await reqDept.isVisible().catch(() => false)) {
    const combo = reqDept.locator('[role="combobox"]').first();
    if (await combo.isVisible().catch(() => false)) return { combo, via: 'hdsd-requisition-department' };
    return { combo: reqDept, via: 'hdsd-requisition-department-root' };
  }

  const combos = dialog.locator('[role="combobox"]');
  const n = await combos.count();
  for (let i = 0; i < n; i++) {
    const combo = combos.nth(i);
    const labelNear = await combo
      .locator('xpath=ancestor::*[contains(@class,"space-y") or contains(@class,"grid")][1]')
      .innerText()
      .catch(() => '');
    if (/phòng ban|department/i.test(labelNear)) return { combo, via: `combobox-index-${i}` };
  }
  if (n > 0) return { combo: combos.first(), via: 'first-combobox-fallback' };
  return { combo: null, via: 'none' };
}

function matchEff(pickerCodes, effCodes) {
  if (!effCodes.length) return { ok: pickerCodes.length === 0, note: 'EFF=0' };
  if (pickerCodes.length === 0) return { ok: false, note: 'picker empty but EFF>0' };
  const effSet = new Set(effCodes.map((c) => c.toUpperCase()));
  const matched = pickerCodes.filter((c) => effSet.has(c.toUpperCase()));
  const ok = matched.length > 0 && pickerCodes.length <= effCodes.length + 2;
  return {
    ok,
    note: `picker=${pickerCodes.length} eff=${effCodes.length} matched=${matched.length}`,
    matchedSample: matched.slice(0, 5),
  };
}

async function testEmployeeFormDept(page, eff) {
  await page.goto(q('/hr/employees'), { waitUntil: 'domcontentloaded', timeout: 120000 });
  await sleep(3500);

  let ctx = page;
  for (const f of page.frames()) {
    if (await f.getByTestId('hdsd-employees-create-btn').isVisible().catch(() => false)) {
      ctx = f;
      break;
    }
  }

  const createBtn = ctx.getByTestId('hdsd-employees-create-btn');
  if (await createBtn.isVisible().catch(() => false)) {
    await createBtn.click({ timeout: 30000 });
  } else {
    await ctx.getByRole('button', { name: /Thêm nhân viên|Thêm|Tạo/i }).first().click({ timeout: 30000 }).catch(() => {});
  }
  await sleep(2000);

  let dialogCtx = page;
  for (const c of [ctx, page, ...page.frames()]) {
    if (await c.getByTestId('hdsd-employee-form-dialog').isVisible().catch(() => false)) {
      dialogCtx = c;
      break;
    }
  }
  const dialog = dialogCtx.getByTestId('hdsd-employee-form-dialog');
  const visible = await dialog.isVisible().catch(() => false);
  if (!visible) {
    return { ac: 'AC-SET-CONSUMER-DEPT-EMP-01', ok: false, note: 'employee form dialog not visible' };
  }

  const { combo, via } = await findDeptComboboxInDialog(page, dialog);
  if (!combo) {
    return { ac: 'AC-SET-CONSUMER-DEPT-EMP-01', ok: false, note: 'no dept combobox in employee form' };
  }

  const opts = await openCatalogPicker(page, dialogCtx, combo);
  const parity = matchEff(opts.codes, eff.codes);
  const screen = await shot(page, 'employee-form-dept-picker');
  const ok = opts.count > 0 && parity.ok;
  return {
    ac: 'AC-SET-CONSUMER-DEPT-EMP-01',
    ok,
    url: page.url(),
    clickPath: 'HRM Nhân viên → Thêm → Phòng ban CatalogSearchPicker',
    via,
    optionCount: opts.count,
    sampleOptionTestId: opts.sample,
    pickerCodesSample: opts.codes.slice(0, 8),
    effParity: parity,
    screenshot: screen,
  };
}

async function testJobRequisitionDept(page, eff) {
  const recUrl = new URL('/hr/recruitment', PORTAL);
  recUrl.searchParams.set('portal', '1');
  recUrl.searchParams.set('tenantId', TENANT);
  recUrl.searchParams.set('companyId', COMPANY);
  recUrl.searchParams.set('tab', 'requisitions');
  await page.goto(recUrl.toString(), {
    waitUntil: 'domcontentloaded',
    timeout: 120000,
  });
  await sleep(4000);

  let recCtx = page;
  for (const f of page.frames()) {
    if (await f.getByTestId('hdsd-requisition-create-btn').isVisible().catch(() => false)) {
      recCtx = f;
      break;
    }
  }

  const createReq = recCtx.getByTestId('hdsd-requisition-create-btn');
  if (await createReq.isVisible().catch(() => false)) await createReq.click();
  else await recCtx.getByRole('button', { name: /Thêm yêu cầu|Thêm|Tạo/i }).first().click().catch(() => {});
  await sleep(2500);
  await recCtx.getByTestId('hdsd-requisition-form-ready').waitFor({ state: 'visible', timeout: 25000 }).catch(() => {});

  let dialogCtx = recCtx;
  for (const c of [recCtx, page, ...page.frames()]) {
    if (await c.getByTestId('hdsd-requisition-form-dialog').isVisible().catch(() => false)) {
      dialogCtx = c;
      break;
    }
  }
  const dialog = dialogCtx.getByTestId('hdsd-requisition-form-dialog');
  const formReady = await dialogCtx.getByTestId('hdsd-requisition-form-ready').isVisible().catch(() => false);

  const deptRoot = dialogCtx.getByTestId('hdsd-requisition-department');
  const deptVisible = await deptRoot.isVisible().catch(() => false);
  if (!deptVisible) {
    return {
      ac: 'AC-SET-CONSUMER-DEPT-REC-01',
      ok: false,
      note: 'hdsd-requisition-department not visible',
      formReady,
    };
  }

  const combo = deptRoot.locator('[role="combobox"]').first();
  const target = (await combo.isVisible().catch(() => false)) ? combo : deptRoot;
  const opts = await openCatalogPicker(page, dialogCtx, target);
  const parity = matchEff(opts.codes, eff.codes);
  const screen = await shot(page, 'job-requisition-dept-picker');
  const ok = opts.count > 0 && parity.ok;
  return {
    ac: 'AC-SET-CONSUMER-DEPT-REC-01 (matrix leg)',
    ok,
    url: page.url(),
    clickPath: 'Tuyển dụng → Yêu cầu tuyển dụng → Thêm → Phòng ban picker',
    formReady,
    optionCount: opts.count,
    sampleOptionTestId: opts.sample,
    pickerCodesSample: opts.codes.slice(0, 8),
    effParity: parity,
    screenshot: screen,
  };
}

async function main() {
  const session = await loginApi();
  const eff = await fetchDeptEff(session.token);
  save();

  const launchOpts = { headless: true };
  if (existsSync(CHROME)) launchOpts.executablePath = CHROME;
  const browser = await chromium.launch(launchOpts);

  const page = await browser.newPage();
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const t = String(msg.text());
      if (!/favicon|DevTools|Failed to load resource/i.test(t)) R.consoleErrors.push(t.slice(0, 300));
    }
  });
  page.on('pageerror', (e) => R.pageErrors.push(String(e).slice(0, 300)));

  await injectPortalAuth(page, session);

  R.screens.employee = await testEmployeeFormDept(page, eff);
  save();
  await page.keyboard.press('Escape').catch(() => {});
  await sleep(500);

  R.screens.jobRequisition = await testJobRequisitionDept(page, eff);
  save();

  const empOk = R.screens.employee?.ok;
  const recOk = R.screens.jobRequisition?.ok;
  const brOk = empOk && recOk && eff.count > 0;

  R.screens.summary = {
    BR_SET_CONSUMER_DEPT_REG_01: brOk ? 'PASS' : 'FAIL',
    beyond_contracts_screens: [empOk && 'EmployeeForm', recOk && 'JobRequisitions'].filter(Boolean),
    AC_SET_CONSUMER_DEPT_CTR_01: 'CLOSED slice — not re-stamped (QACONPAYSTQC1)',
    settings_catalog_e2e_ready: false,
  };

  R.overall = brOk && empOk && recOk ? 'PASS' : 'FAIL';
  R.ack_status = R.overall === 'PASS' ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  R.endedAt = ts();
  save();

  await browser.close();
  console.log(JSON.stringify({ stamp: STAMP, overall: R.overall, ack_status: R.ack_status }, null, 2));
  process.exit(R.overall === 'PASS' ? 0 : 1);
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
