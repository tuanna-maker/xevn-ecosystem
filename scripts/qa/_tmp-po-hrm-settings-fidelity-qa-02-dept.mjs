#!/usr/bin/env node
/** PO-HRM-SETTINGS-FIDELITY-QA-02-DEPT — narrow UF-CTR-DEPT-CATALOG-PICKER re-run after FE-03 */
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
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const STAMP = `SETFID02DEPT-${Date.now().toString(36).toUpperCase().slice(-8)}`;
const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-settings-fidelity-qa-02-dept.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-settings-fidelity-qa-02');
mkdirSync(SCREEN, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

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
      const token = d?.accessToken ?? d?.access_token ?? j?.accessToken;
      if (r.ok && token) return { token, user: d.user ?? { email: EMAIL }, companyId: COMPANY };
    } catch {
      /* */
    }
  }
  throw new Error('login failed');
}

async function injectPortalAuth(page, session) {
  const expiresAt = Date.now() + 3600000;
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
  }, { ...session, expiresAt });
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

async function smokeContractsDeptPicker(page) {
  const url = `${PORTAL}/command-center/hrm/contracts`;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await sleep(3000);
  const hrm = await resolveHrmContractsFrame(page);
  if (!hrm) return { ok: false, note: 'contracts shell not found' };
  await hrm.getByTestId('hdsd-contracts-create-btn').click({ timeout: 45000 });
  await sleep(2000);
  const shell = await resolveWizardShell(page, hrm);
  if (!shell) {
    return { ok: false, note: 'ctr-create-wizard-stepper not found (dialog/parent-portal)' };
  }
  await shell.getByTestId('ctr-create-step-1').waitFor({ state: 'visible', timeout: 45000 }).catch(() => {});
  await shell.getByTestId('ctr-create-template-combobox').waitFor({ state: 'visible', timeout: 60000 }).catch(() => {});
  await sleep(500);
  let pickerRootVisible = false;
  let comboboxVisible = false;
  let clickCtx = null;
  for (const ctx of [shell, page, ...page.frames()]) {
    const root = ctx.getByTestId('ctr-create-department-picker');
    if (await root.isVisible().catch(() => false)) {
      pickerRootVisible = true;
      await root.scrollIntoViewIfNeeded().catch(() => {});
      const combobox = ctx.getByTestId('ctr-create-department-picker-combobox');
      comboboxVisible = await combobox.isVisible().catch(() => false);
      if (comboboxVisible) {
        clickCtx = ctx;
        await combobox.click();
        break;
      }
    }
  }
  if (!pickerRootVisible) {
    return {
      ok: false,
      note: 'ctr-create-department-picker not in DOM',
      pickerRootVisible,
      comboboxVisible,
    };
  }
  if (!comboboxVisible) {
    return { ok: false, note: 'ctr-create-department-picker present but combobox not visible', pickerRootVisible };
  }
  await sleep(500);
  let optionCount = 0;
  let sampleOptionTestId = '';
  for (const ctx of [clickCtx, shell, page, ...page.frames()]) {
    if (!ctx) continue;
    optionCount = await ctx.locator('[data-testid^="catalog-picker-option-"]').count();
    if (optionCount > 0) {
      const first = ctx.locator('[data-testid^="catalog-picker-option-"]').first();
      sampleOptionTestId = (await first.getAttribute('data-testid')) || '';
      break;
    }
  }
  await page.keyboard.press('Escape').catch(() => {});
  const ok = optionCount > 0;
  return {
    ok,
    note: ok ? `${optionCount} catalog-picker-option(s); sample ${sampleOptionTestId}` : 'picker open but 0 options',
    optionCount,
    pickerRootVisible,
    comboboxVisible,
    sampleOptionTestId,
  };
}

const result = {
  work_item_id: 'PO-HRM-SETTINGS-FIDELITY-QA-02-DEPT',
  parent: 'PO-HRM-SETTINGS-FIDELITY-QA-02',
  fix_ref: 'PO-HRM-SETTINGS-FIDELITY-FE-03',
  stamp: STAMP,
  startedAt: ts(),
  persona: { email: EMAIL, companyId: COMPANY },
  u65: 'zero-seed-browser-only',
  env: { PORTAL, commit: COMMIT },
  l0: { qc_fe_be_health: 'exit 0 (run separately)' },
  uf: 'UF-CTR-DEPT-CATALOG-PICKER',
  endedAt: null,
  ack_status: null,
};

async function main() {
  const session = await loginApi();
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text().slice(0, 300));
  });
  await injectPortalAuth(page, session);
  const dp = await smokeContractsDeptPicker(page);
  const shotPath = join(SCREEN, `contracts-dept-picker-${STAMP}.png`);
  await page.screenshot({ path: shotPath, fullPage: false }).catch(() => {});
  result.dept = dp;
  result.consoleErrors = consoleErrors.slice(0, 10);
  result.screenshot = shotPath.replace(/\\/g, '/');
  result.endedAt = ts();
  result.ack_status = dp.ok ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  writeFileSync(OUT_JSON, JSON.stringify(result, null, 2));
  await browser.close();
  console.log(JSON.stringify(result, null, 2));
  process.exit(dp.ok ? 0 : 1);
}

main().catch((e) => {
  result.error = String(e);
  result.ack_status = 'FAIL_TO_PM';
  result.endedAt = ts();
  writeFileSync(OUT_JSON, JSON.stringify(result, null, 2));
  console.error(e);
  process.exit(1);
});
