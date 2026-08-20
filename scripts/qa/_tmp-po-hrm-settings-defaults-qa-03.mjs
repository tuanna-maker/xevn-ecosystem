#!/usr/bin/env node
/**
 * PO-HRM-SETTINGS-DEFAULTS-QA-03 — U65 browser Settings defaults UF
 * Parent: PO-HRM-SETTINGS-DEFAULTS-FE-01 · closes QC-02 FE CONDITION
 * Honesty: payroll_e2e_ready=false · zero-seed · DENY module UAT / AMIS DONE / J-*
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
const OUT_JSON = resolve(
  ROOT,
  'docs/qa/evidence/_tmp-po-hrm-settings-defaults-qa-03-browser.json',
);
const SCREEN = resolve(
  ROOT,
  'docs/qa/evidence/screens/po-hrm-settings-defaults-qa-03',
);
mkdirSync(SCREEN, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();
const stamp = Date.now().toString(36).toLowerCase().slice(-8);

const TAX_PERSONAL = 11_500_000;
const TAX_DEPENDENT = 4_400_000;
const SI_KEY = `BHXH_QA3_${stamp}`;
/** Must exist in job_titles catalog (VAL-SET-POS-01) — free-text → HRM-SET-POS-400-KEY */
const POS_KEY = 'CEO';
const POS_AMOUNT = 750_000;

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const R = {
  work_item_id: 'PO-HRM-SETTINGS-DEFAULTS-QA-03',
  parent: 'PO-HRM-SETTINGS-DEFAULTS-FE-01',
  resume_chunk: 'K6.3',
  startedAt: ts(),
  stamp: `SETDEFQA3-${stamp.toUpperCase()}`,
  persona: { email: EMAIL, companyId: COMPANY },
  u65: 'zero-seed · browser-only · FE after 2xx + F5',
  hdsd_align:
    'Settings → Mặc định thuế/BH/PC · Lưu thuế · Tạo BH · Tạo PC · Resolve draft',
  honesty: {
    payroll_e2e_ready: false,
    seed_used: false,
    deny_module_settings_uat: true,
    deny_amis_done: true,
    deny_j_star_promote: true,
    deny_fe_formula_invent: true,
  },
  env: {
    PORTAL,
    HRM,
    XBOS,
    TENANT,
    commit: COMMIT,
    SI_KEY,
    POS_KEY,
    TAX_PERSONAL,
    TAX_DEPENDENT,
  },
  l0: {},
  ac: {},
  network: [],
  networkDetail: [],
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
      if (!/\/api\/hrm\/(settings\/|payroll\/salary-components)/.test(u)) return;
      const method = res.request().method();
      let code = null;
      let bodySnippet = null;
      try {
        const j = await res.json();
        code = j?.code ?? j?.data?.code ?? null;
        if (method !== 'GET') {
          bodySnippet = JSON.stringify(j).slice(0, 420);
        }
      } catch {
        /* */
      }
      const entry = {
        method,
        status: res.status(),
        code,
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 480),
        at: ts(),
      };
      R.network.push(entry);
      if (method !== 'GET' || /resolve|company-settings/.test(u)) {
        R.networkDetail.push({ ...entry, bodySnippet });
      }
    } catch {
      /* */
    }
  });
}

async function hardRefresh(page) {
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 90_000 });
  await sleep(2800);
}

async function fillViMoney(page, testId, amount) {
  const el = page.getByTestId(testId);
  await el.click({ force: true });
  await el.fill('');
  await el.fill(String(amount));
  await el.blur();
  await sleep(200);
}

async function openSettingsDefaultsTab(page) {
  log('goto /hr/settings Mặc định thuế/BH/PC');
  await page.goto(q('/hr/settings'), { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await sleep(3500);
  await page
    .getByRole('tab', { name: /Mặc định|Account|Tài khoản|Cài đặt|Loại phép/i })
    .first()
    .waitFor({ state: 'visible', timeout: 45_000 })
    .catch(() => {});

  let tab = page.getByTestId('settings-tab-settings-defaults');
  let tabVisible = await tab.isVisible().catch(() => false);
  if (!tabVisible) {
    await page.evaluate(() => window.scrollTo(0, 0));
    await sleep(800);
    await hardRefresh(page);
    tab = page.getByTestId('settings-tab-settings-defaults');
    tabVisible = await tab.isVisible().catch(() => false);
  }
  if (!tabVisible) {
    await shot(page, '01-settings-no-tab');
    R.probes.settingsBodySnippet = (
      (await page.locator('body').innerText().catch(() => '')) || ''
    ).slice(0, 500);
    return false;
  }
  await tab.click();
  await sleep(2000);
  return true;
}

function networkHit(pred) {
  return R.network.filter(pred);
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

  const tabOk = await openSettingsDefaultsTab(page);
  if (!tabOk) {
    ac('AC-SETDEF-TAB', 'FAIL', {
      summary: 'settings-tab-settings-defaults not visible',
      body: R.probes.settingsBodySnippet,
    });
    R.overall = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    R.endedAt = ts();
    save();
    await browser.close();
    process.exitCode = 1;
    return;
  }
  ac('AC-SETDEF-TAB', 'PASS', { summary: 'Clicked settings-tab-settings-defaults' });
  await shot(page, '01-tab-defaults');

  const panel = page.getByTestId('settings-defaults-panel');
  const panelOk = await panel.isVisible().catch(() => false);
  ac(
    'AC-SETDEF-PANEL',
    panelOk ? 'PASS' : 'FAIL',
    { summary: panelOk ? 'Panel visible' : 'settings-defaults-panel missing' },
  );

  // Honesty badge
  const badge = page.getByTestId('settings-defaults-honesty-badge');
  const badgeText = ((await badge.innerText().catch(() => '')) || '').trim();
  const honestyOk =
    /payroll_e2e_ready\s*=\s*false/i.test(badgeText) || badgeText.includes('false');
  R.probes.honestyBadge = badgeText;
  ac('AC-SETDEF-HONESTY', honestyOk ? 'PASS' : 'FAIL', {
    summary: `badge="${badgeText}" · expected payroll_e2e_ready=false`,
  });

  // ——— TAX ———
  log('TAX fill + save');
  await fillViMoney(page, 'hdsd-settings-tax-personal', TAX_PERSONAL);
  await fillViMoney(page, 'hdsd-settings-tax-dependent', TAX_DEPENDENT);

  const taxPutWait = page.waitForResponse(
    (res) =>
      res.request().method() === 'PUT' &&
      /\/api\/hrm\/settings\/company-settings/.test(res.url()) &&
      res.status() >= 200,
    { timeout: 45_000 },
  );
  await page.getByTestId('hdsd-settings-tax-save').click({ force: true });
  let taxPut = null;
  try {
    taxPut = await taxPutWait;
  } catch (e) {
    log('TAX PUT wait timeout', { err: String(e).slice(0, 120) });
  }
  await sleep(2500);
  await shot(page, '02-tax-after-save');

  const taxPuts = networkHit(
    (n) => n.method === 'PUT' && /company-settings/.test(n.url) && n.status >= 200 && n.status < 300,
  );
  const taxCodes = taxPuts.map((n) => n.code).filter(Boolean);
  const taxOk =
    taxPuts.length >= 1 &&
    taxPuts.every((n) => n.status === 200) &&
    (taxCodes.length === 0 || taxCodes.every((c) => c === 'HRM-SET-TAX-200' || String(c).includes('TAX')));
  R.probes.taxPuts = taxPuts;
  ac('AC-SETDEF-TAX-SAVE', taxOk ? 'PASS' : 'FAIL', {
    summary: `PUT count=${taxPuts.length} statuses=${taxPuts.map((n) => n.status).join(',')} codes=${taxCodes.join(',') || 'n/a'} firstWait=${taxPut?.status() ?? 'timeout'}`,
  });

  async function openDefaultsAfterRefresh() {
    await hardRefresh(page);
    const tab = page.getByTestId('settings-tab-settings-defaults');
    await tab.waitFor({ state: 'visible', timeout: 30_000 }).catch(() => {});
    await tab.click({ force: true });
    // Wait for panel + successful list GETs (avoid race on Nest 5xx storm)
    await page.getByTestId('settings-defaults-panel').waitFor({ state: 'visible', timeout: 30_000 });
    await page
      .waitForResponse(
        (res) =>
          res.request().method() === 'GET' &&
          /\/api\/hrm\/settings\/insurance-rate-cfg/.test(res.url()) &&
          res.status() === 200,
        { timeout: 45_000 },
      )
      .catch(() => null);
    await page
      .waitForResponse(
        (res) =>
          res.request().method() === 'GET' &&
          /\/api\/hrm\/payroll\/salary-components/.test(res.url()) &&
          res.status() === 200,
        { timeout: 45_000 },
      )
      .catch(() => null);
    await sleep(1500);
  }

  async function ensureSiRowVisible(key) {
    let text = (
      (await page.getByTestId('settings-si-list-table').innerText().catch(() => '')) || ''
    ).trim();
    if (text.includes(key)) return text;
    // click reload once if empty/missing after F5
    await page.getByTestId('hdsd-settings-si-reload').click({ force: true });
    await page
      .waitForResponse(
        (res) =>
          res.request().method() === 'GET' &&
          /insurance-rate-cfg/.test(res.url()) &&
          res.status() === 200,
        { timeout: 30_000 },
      )
      .catch(() => null);
    await sleep(1200);
    text = (
      (await page.getByTestId('settings-si-list-table').innerText().catch(() => '')) || ''
    ).trim();
    return text;
  }

  async function pickPcFromCatalog() {
    // Ensure SC loaded
    const posErrBefore = (
      (await page.getByTestId('settings-pos-error').innerText().catch(() => '')) || ''
    ).trim();
    if (posErrBefore) {
      await page.getByTestId('hdsd-settings-pos-reload').click({ force: true });
      await page
        .waitForResponse(
          (res) =>
            res.request().method() === 'GET' &&
            /salary-components/.test(res.url()) &&
            res.status() === 200,
          { timeout: 30_000 },
        )
        .catch(() => null);
      await sleep(1000);
    }
    const lineCode = page.getByTestId('hdsd-settings-pos-line-code-0');
    await lineCode.click({ force: true });
    await sleep(700);
    let options = page.locator('[role="option"]');
    let optCount = await options.count().catch(() => 0);
    if (optCount === 0) {
      await page.keyboard.press('Escape').catch(() => {});
      await page.getByTestId('hdsd-settings-pos-reload').click({ force: true });
      await page
        .waitForResponse(
          (res) =>
            res.request().method() === 'GET' &&
            /salary-components/.test(res.url()) &&
            res.status() === 200,
          { timeout: 30_000 },
        )
        .catch(() => null);
      await sleep(1200);
      await lineCode.click({ force: true });
      await sleep(700);
      options = page.locator('[role="option"]');
      optCount = await options.count().catch(() => 0);
    }
    let pickedPc = null;
    let pickIdx = 0;
    for (let i = 0; i < optCount; i++) {
      const t = ((await options.nth(i).innerText().catch(() => '')) || '').trim();
      if (/PC_RET_AC81/i.test(t) || /^PC_/i.test(t)) {
        pickIdx = i;
        pickedPc = t;
        break;
      }
    }
    if (optCount > 0 && !pickedPc) {
      pickedPc = ((await options.nth(0).innerText().catch(() => '')) || '').trim();
    }
    if (optCount > 0) {
      await options.nth(pickIdx).click({ force: true });
      await sleep(400);
    } else {
      await page.keyboard.press('Escape').catch(() => {});
    }
    return { optCount, pickedPc };
  }

  // F5 TAX persist
  log('TAX F5 persist');
  await openDefaultsAfterRefresh();
  const personalAfter = (
    (await page.getByTestId('hdsd-settings-tax-personal').inputValue().catch(() => '')) || ''
  ).replace(/\D/g, '');
  const dependentAfter = (
    (await page.getByTestId('hdsd-settings-tax-dependent').inputValue().catch(() => '')) || ''
  ).replace(/\D/g, '');
  R.probes.taxF5 = { personalAfter, dependentAfter };
  const taxF5Ok =
    personalAfter === String(TAX_PERSONAL) && dependentAfter === String(TAX_DEPENDENT);
  ac('AC-SETDEF-TAX-F5', taxF5Ok ? 'PASS' : 'FAIL', {
    summary: `personal=${personalAfter} expect ${TAX_PERSONAL} · dependent=${dependentAfter} expect ${TAX_DEPENDENT}`,
  });
  await shot(page, '03-tax-f5');

  // ——— SI ———
  log('SI create');
  await page.getByTestId('hdsd-settings-si-type-key').fill(SI_KEY);
  await page.getByTestId('hdsd-settings-si-emp-pct').fill('8');
  await page.getByTestId('hdsd-settings-si-er-pct').fill('17.5');
  await fillViMoney(page, 'hdsd-settings-si-ceiling', 36_000_000);
  const fromVal = await page.getByTestId('hdsd-settings-si-from').inputValue().catch(() => '');
  if (!fromVal) {
    await page.getByTestId('hdsd-settings-si-from').fill('2026-08-07');
  }
  await page.getByTestId('hdsd-settings-si-notes').fill(`QA-03 U65 ${stamp}`);

  const siPostWait = page.waitForResponse(
    (res) => {
      if (res.request().method() !== 'POST') return false;
      const u = res.url();
      if (!/\/api\/hrm\/settings\/insurance-rate-cfg/.test(u)) return false;
      if (/\/retire/.test(u)) return false;
      const pathOnly = u.split('?')[0];
      // create = collection POST (no UUID suffix)
      return !/insurance-rate-cfg\/[0-9a-f-]{36}/i.test(pathOnly);
    },
    { timeout: 45_000 },
  );

  await page.getByTestId('hdsd-settings-si-save').click({ force: true });
  let siRes = null;
  try {
    siRes = await siPostWait;
  } catch (e) {
    log('SI POST wait timeout', { err: String(e).slice(0, 120) });
  }
  await sleep(2500);
  await shot(page, '04-si-after-create');

  const siPosts = networkHit(
    (n) =>
      n.method === 'POST' &&
      /insurance-rate-cfg/.test(n.url) &&
      !/retire/.test(n.url) &&
      n.status >= 200 &&
      n.status < 300,
  );
  const siOk = siPosts.some((n) => n.status === 201 || n.status === 200);
  R.probes.siPosts = siPosts;
  R.probes.siWaitStatus = siRes?.status?.() ?? null;

  const siTableText = (
    (await page.getByTestId('settings-si-list-table').innerText().catch(() => '')) || ''
  ).trim();
  const siRowVisible = siTableText.includes(SI_KEY);
  R.probes.siTableSnippet = siTableText.slice(0, 400);
  ac('AC-SETDEF-SI-CREATE', siOk && siRowVisible ? 'PASS' : 'FAIL', {
    summary: `POST ok=${siOk} statuses=${siPosts.map((n) => `${n.status}/${n.code}`).join(',')} rowVisible=${siRowVisible} key=${SI_KEY}`,
  });

  // F5 SI
  log('SI F5');
  await openDefaultsAfterRefresh();
  const siTableF5 = await ensureSiRowVisible(SI_KEY);
  const siF5Ok = siTableF5.includes(SI_KEY);
  R.probes.siF5 = siTableF5.slice(0, 400);
  ac('AC-SETDEF-SI-F5', siF5Ok ? 'PASS' : 'FAIL', {
    summary: `F5 list has ${SI_KEY}=${siF5Ok}`,
  });
  await shot(page, '05-si-f5');

  // ——— POS ———
  log('POS create + catalog PC · positionKey=CEO (job_titles)');
  // Retire any existing active CEO row in UI so create is not 409
  const existingCeoRetire = page.locator('[data-testid^="hdsd-settings-pos-retire-"]');
  // Prefer row containing CEO
  const ceoRow = page
    .locator('[data-testid^="settings-pos-row-"]')
    .filter({ hasText: /\bCEO\b/ });
  if ((await ceoRow.count().catch(() => 0)) > 0) {
    const retireBtn = ceoRow.first().locator('[data-testid^="hdsd-settings-pos-retire-"]');
    if (await retireBtn.isVisible().catch(() => false)) {
      const retireWait = page.waitForResponse(
        (res) =>
          res.request().method() === 'POST' &&
          /position-compensation-policies\/.+\/retire/.test(res.url()),
        { timeout: 20_000 },
      );
      await retireBtn.click({ force: true });
      await retireWait.catch(() => null);
      await sleep(1200);
    }
  }
  void existingCeoRetire;

  await page.getByTestId('hdsd-settings-pos-key').fill(POS_KEY);
  await page.getByTestId('hdsd-settings-pos-name').fill(`PC QA3 ${stamp}`);
  const posFrom = await page.getByTestId('hdsd-settings-pos-from').inputValue().catch(() => '');
  if (!posFrom) {
    await page.getByTestId('hdsd-settings-pos-from').fill('2026-08-07');
  }

  const { optCount, pickedPc } = await pickPcFromCatalog();
  R.probes.posPcOptCount = optCount;
  R.probes.posPickedPc = pickedPc;

  await fillViMoney(page, 'hdsd-settings-pos-line-amount-0', POS_AMOUNT);

  const posPostWait = page.waitForResponse(
    (res) => {
      if (res.request().method() !== 'POST') return false;
      const u = res.url();
      return (
        /\/api\/hrm\/settings\/position-compensation-policies/.test(u) &&
        !/\/retire/.test(u) &&
        !/\/resolve/.test(u)
      );
    },
    { timeout: 45_000 },
  );
  await page.getByTestId('hdsd-settings-pos-save').click({ force: true });
  let posRes = null;
  try {
    posRes = await posPostWait;
  } catch (e) {
    log('POS POST wait timeout', { err: String(e).slice(0, 120) });
  }
  await sleep(2500);
  await shot(page, '06-pos-after-create');

  const posPosts = networkHit(
    (n) =>
      n.method === 'POST' &&
      /position-compensation-policies/.test(n.url) &&
      !/retire/.test(n.url) &&
      n.status >= 200,
  );
  const posCreateOk = posPosts.some(
    (n) => (n.status === 201 || n.status === 200) && (n.code == null || n.code === 'HRM-SET-POS-201'),
  );
  const posErr = (
    (await page.getByTestId('settings-pos-error').innerText().catch(() => '')) || ''
  ).trim();
  const posTable = (
    (await page.getByTestId('settings-pos-list-table').innerText().catch(() => '')) || ''
  ).trim();
  const posRowVisible = posTable.includes(POS_KEY);
  R.probes.posPosts = posPosts;
  R.probes.posError = posErr;
  R.probes.posTableSnippet = posTable.slice(0, 400);
  ac('AC-SETDEF-POS-CREATE', posCreateOk && posRowVisible && optCount > 0 ? 'PASS' : 'FAIL', {
    summary: `catalogOpts=${optCount} picked=${pickedPc} POST=${posPosts.map((n) => `${n.status}/${n.code}`).join(',')} row=${posRowVisible} err=${posErr.slice(0, 120)} wait=${posRes?.status?.() ?? 'timeout'}`,
  });

  // F5 POS
  log('POS F5');
  await openDefaultsAfterRefresh();
  let posTableF5 = (
    (await page.getByTestId('settings-pos-list-table').innerText().catch(() => '')) || ''
  ).trim();
  if (!posTableF5.includes(POS_KEY)) {
    await page.getByTestId('hdsd-settings-pos-reload').click({ force: true });
    await page
      .waitForResponse(
        (res) =>
          res.request().method() === 'GET' &&
          /position-compensation-policies/.test(res.url()) &&
          !/resolve/.test(res.url()) &&
          res.status() === 200,
        { timeout: 30_000 },
      )
      .catch(() => null);
    await sleep(1200);
    posTableF5 = (
      (await page.getByTestId('settings-pos-list-table').innerText().catch(() => '')) || ''
    ).trim();
  }
  const posF5Ok = posTableF5.includes(POS_KEY);
  R.probes.posF5 = posTableF5.slice(0, 400);
  ac('AC-SETDEF-POS-F5', posF5Ok ? 'PASS' : 'FAIL', {
    summary: `F5 list has ${POS_KEY}=${posF5Ok}`,
  });
  await shot(page, '07-pos-f5');

  // ——— Resolve SRC-02 ———
  log('POS resolve SRC-02');
  await page.getByTestId('hdsd-settings-pos-resolve-key').fill(POS_KEY);
  const resolveWait = page.waitForResponse(
    (res) =>
      res.request().method() === 'GET' &&
      /position-compensation-policies\/resolve/.test(res.url()),
    { timeout: 30_000 },
  );
  await page.getByTestId('hdsd-settings-pos-resolve').click({ force: true });
  let resolveRes = null;
  let resolveBody = null;
  try {
    resolveRes = await resolveWait;
    resolveBody = await resolveRes.json().catch(() => null);
  } catch (e) {
    log('resolve wait timeout', { err: String(e).slice(0, 120) });
  }
  await sleep(1500);
  const resolveUi = (
    (await page.getByTestId('settings-pos-resolve-result').innerText().catch(() => '')) || ''
  ).trim();
  const rawResolve = JSON.stringify(resolveBody ?? {});
  R.probes.resolve = {
    status: resolveRes?.status?.() ?? null,
    code: resolveBody?.code ?? null,
    ui: resolveUi.slice(0, 500),
    bodyKeys: resolveBody ? Object.keys(resolveBody?.data ?? resolveBody ?? {}) : [],
    hasEmployeePackageId: /"employeePackageId"\s*:\s*"[^"]+"/.test(rawResolve),
    warnings: resolveBody?.data?.warnings ?? resolveBody?.warnings ?? null,
  };
  const resolveOk =
    resolveRes?.status?.() === 200 &&
    !R.probes.resolve.hasEmployeePackageId &&
    resolveUi.length > 0;
  ac('AC-SETDEF-POS-RESOLVE', resolveOk ? 'PASS' : 'FAIL', {
    summary: `status=${R.probes.resolve.status} code=${R.probes.resolve.code} uiLen=${resolveUi.length} inventEmpPkg=${R.probes.resolve.hasEmployeePackageId} ui=${resolveUi.slice(0, 160)}`,
  });
  await shot(page, '08-pos-resolve');

  // No invented formula — check panel copy
  const panelText = ((await panel.innerText().catch(() => '')) || '').slice(0, 1200);
  const noInvent =
    /không công thức FE|Display-ready|SRC-02|draft/i.test(panelText) &&
    !/GTGC\s*=\s*\d|tính thuế trên FE|formula engine/i.test(panelText);
  R.probes.panelHonestySnippet = panelText.slice(0, 280);
  ac('AC-SETDEF-NO-INVENT', noInvent ? 'PASS' : 'FAIL', {
    summary: `panel honesty copy present=${noInvent}`,
  });

  // Rollup
  const verdicts = Object.values(R.ac).map((v) => v.verdict);
  const allPass = verdicts.length > 0 && verdicts.every((v) => v === 'PASS');
  R.overall = allPass ? 'PASS' : 'FAIL';
  R.ack_status = allPass ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  R.endedAt = ts();
  R.summary = {
    passCount: verdicts.filter((v) => v === 'PASS').length,
    failCount: verdicts.filter((v) => v === 'FAIL').length,
    total: verdicts.length,
    stamp: R.stamp,
    payroll_e2e_ready: false,
  };
  save();
  await shot(page, '09-final');
  await browser.close();

  console.log(
    JSON.stringify(
      {
        overall: R.overall,
        ack_status: R.ack_status,
        stamp: R.stamp,
        pass: R.summary.passCount,
        fail: R.summary.failCount,
        out: OUT_JSON,
      },
      null,
      2,
    ),
  );
  process.exitCode = allPass ? 0 : 1;
}

main().catch((err) => {
  R.overall = 'FAIL';
  R.ack_status = 'FAIL_TO_PM';
  R.endedAt = ts();
  R.fatal = String(err).slice(0, 800);
  save();
  console.error(err);
  process.exitCode = 1;
});
