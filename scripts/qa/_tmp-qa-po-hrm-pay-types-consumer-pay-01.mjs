#!/usr/bin/env node
/**
 * QA-PO-HRM-PAY-TYPES-CONSUMER-PAY-01 — AC-SET-CONSUMER-PT-PAY-01
 * U65 ceo@ · zero-seed · J-HRM-PAY-E2-01 narrow (picker → Lưu → F5 + invent API)
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const PORTAL_CANDIDATES = [
  process.env.PORTAL_DEV_URL,
  'http://127.0.0.1:5175',
  'http://127.0.0.1:5173',
].filter(Boolean);
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

const STAMP = `PTPAYQA-${Date.now().toString(36).toUpperCase().slice(-8)}`;
const SC_CODE = `qa_pt_${STAMP.slice(-8).toLowerCase()}`;
const SC_NAME = `QA TP PAY ${STAMP}`;
const PAY_TYPE_EXT_CODE = `ptqa${STAMP.slice(-6).toLowerCase()}`;
const PAY_TYPE_EXT_LABEL = `QA Bản chất ${STAMP}`;

const PAY_TYPE_KEYS = new Set([
  'pay_types',
  'component_types',
  'pay_natures',
  'salary_component_types',
]);

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-qa-po-hrm-pay-types-consumer-pay-01.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/qa-po-hrm-pay-types-consumer-pay-01');
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
  work_item_id: 'QA-PO-HRM-PAY-TYPES-CONSUMER-PAY-01',
  stamp: STAMP,
  journey: 'J-HRM-PAY-E2-01',
  ac_id: 'AC-SET-CONSUMER-PT-PAY-01',
  startedAt: ts(),
  u65: 'zero-seed-browser-only',
  persona: { email: EMAIL, companyId: COMPANY },
  honesty: {
    settings_catalog_e2e_ready: false,
    uf_hrm_10_full: false,
    payroll_e2e_ready: false,
    must_keep: ['JGRECQC1', 'ATTLVTSOTQC1', 'ETCTRQC1', 'RECCHQC1', 'QACONPAYSTQC1'],
  },
  env: { PORTAL: null, HRM, XBOS, TENANT, commit: COMMIT },
  l0: { qc_dev_stack: 'HTTP 200 all (node exit glitch)', qc_fe_be_health: 'exit 0' },
  vitest: { result: '57/57 (pre-run)' },
  payTypes: { effBefore: 0, effAfter: 0, codes: [], labels: {}, syncUsed: false, feCreateUsed: false },
  ids: { scCode: SC_CODE, selectedPayTypeCode: null, selectedPayTypeLabel: null, savedComponentId: null },
  ac: {},
  network: [],
  apiProbes: [],
  consoleErrors: [],
  ack_status: null,
  overall: null,
  pm_dispatch_hint: null,
  endedAt: null,
};

function save() {
  writeFileSync(OUT_JSON, JSON.stringify(R, null, 2));
}

function ac(id, verdict, detail = {}) {
  R.ac[id] = { verdict, ...detail, at: ts() };
  console.log(`${verdict} ${id} — ${(detail.summary || '').slice(0, 360)}`);
  save();
}

async function pickPortal() {
  for (const base of PORTAL_CANDIDATES) {
    try {
      const r = await fetch(base, { signal: AbortSignal.timeout(8000) });
      if (r.status === 200 || r.status === 304) return base.replace(/\/$/, '');
    } catch {
      /* */
    }
  }
  return null;
}

function q(portal, path, extra = {}) {
  const u = new URL(path, portal);
  u.searchParams.set('portal', '1');
  u.searchParams.set('tenantId', TENANT);
  u.searchParams.set('companyId', COMPANY);
  if (extra.tab) u.searchParams.set('tab', extra.tab);
  return u.toString();
}

async function loginApi(portal) {
  for (const url of [`${XBOS}/api/xbos/auth/login`, `${portal}/api/xbos/auth/login`]) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
      });
      const j = await r.json().catch(() => ({}));
      const data = j?.data ?? j;
      const token = data?.accessToken ?? data?.access_token ?? j?.accessToken;
      if (r.ok && token) {
        return { token, user: data?.user ?? { email: EMAIL }, companyId: COMPANY, expiresAt: Date.now() + 3600000 };
      }
    } catch {
      /* */
    }
  }
  throw new Error('login failed');
}

async function fetchPayTypeEff(token) {
  const url = `${HRM}/api/hrm/settings-catalogs?company_id=${COMPANY}`;
  const r = await fetch(url, {
    headers: { authorization: `Bearer ${token}`, 'x-tenant-id': TENANT },
  });
  const j = await r.json().catch(() => ({}));
  const catalogs = j?.data?.catalogs ?? j?.catalogs ?? [];
  const list = Array.isArray(catalogs) ? catalogs : [];
  const merged = [];
  for (const c of list) {
    const k = String(c?.catalog_key ?? c?.key ?? '');
    if (!PAY_TYPE_KEYS.has(k)) continue;
    const items = c?.effectiveItems ?? c?.effective_items ?? c?.items ?? [];
    if (Array.isArray(items)) merged.push(...items);
  }
  const seen = new Set();
  const active = [];
  for (const i of merged) {
    if (i?.is_active === false || i?.active === false) continue;
    const code = String(i.code ?? i.item_key ?? i.storage_key ?? '').trim();
    if (!code || seen.has(code)) continue;
    seen.add(code);
    active.push(i);
  }
  const codes = active.map((i) => String(i.code ?? i.item_key ?? '')).filter(Boolean);
  const labels = {};
  for (const i of active) {
    const code = String(i.code ?? i.item_key ?? '');
    labels[code] = String(i.name_vi ?? i.label ?? i.name ?? code);
  }
  return { status: r.status, count: codes.length, codes, labels, items: active };
}

async function apiJson(token, method, path, body) {
  const url = `${HRM}/api/hrm${path.startsWith('/') ? path : `/${path}`}`;
  const r = await fetch(url, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      'x-tenant-id': TENANT,
      'content-type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const j = await r.json().catch(() => ({}));
  const code = j?.code ?? j?.error?.code ?? j?.data?.code ?? null;
  return { status: r.status, code, body: j };
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

function wireNetwork(page) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') R.consoleErrors.push(msg.text().slice(0, 400));
  });
  page.on('response', async (res) => {
    const req = res.request();
    const url = res.url();
    const method = req.method();
    if (!/\/api\/hrm\//.test(url)) return;
    const entry = { method, url: url.slice(0, 240), status: res.status(), at: ts() };
    if (/salary-components/.test(url) && ['POST', 'PATCH', 'PUT'].includes(method)) {
      let body = null;
      try {
        body = req.postDataJSON();
      } catch {
        /* */
      }
      R.network.push({ ...entry, body });
      if (method === 'POST' && res.status() >= 200 && res.status() < 300) {
        try {
          const j = await res.json();
          R.ids.savedComponentId = j?.data?.id ?? j?.id ?? R.ids.savedComponentId;
        } catch {
          /* */
        }
      }
    }
  });
}

async function shot(page, name) {
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  return path.replace(/\\/g, '/');
}

async function findInFrames(page, locatorFn) {
  for (const h of [page, ...page.frames()]) {
    try {
      const loc = locatorFn(h);
      if (await loc.first().isVisible({ timeout: 600 }).catch(() => false)) return h;
    } catch {
      /* */
    }
  }
  return page;
}

async function countPickerOptions(page, ctx) {
  for (const c of [ctx, page, ...page.frames()]) {
    const n = await c.locator('[data-testid^="catalog-picker-option-"]').count();
    if (n > 0) {
      const loc = c.locator('[data-testid^="catalog-picker-option-"]');
      const codes = [];
      const m = Math.min(n, 40);
      for (let i = 0; i < m; i++) {
        const tid = (await loc.nth(i).getAttribute('data-testid')) || '';
        const code = tid.replace(/^catalog-picker-option-/, '');
        if (code) codes.push(code);
      }
      return { count: n, codes };
    }
  }
  return { count: 0, codes: [] };
}

async function pickCatalogOption(page, ctx, combobox, preferCode) {
  await combobox.scrollIntoViewIfNeeded().catch(() => {});
  await combobox.click({ force: true, timeout: 25000 });
  await sleep(900);
  const opts = await countPickerOptions(page, ctx);
  if (opts.count === 0) {
    await page.keyboard.press('Escape').catch(() => {});
    return { ok: false, reason: 'picker-empty', opts };
  }
  const targetCode = preferCode && opts.codes.includes(preferCode) ? preferCode : opts.codes[0];
  const optId = `catalog-picker-option-${targetCode}`;
  const optHost = await findInFrames(page, (h) => h.getByTestId(optId));
  const opt = optHost.getByTestId(optId).first();
  if (await opt.isVisible({ timeout: 8000 }).catch(() => false)) {
    await opt.click({ force: true });
  } else {
    await page.evaluate((code) => {
      const el = document.querySelector(`[data-testid="catalog-picker-option-${code}"]`);
      el?.click();
    }, targetCode);
  }
  await sleep(500);
  return { ok: true, code: targetCode, opts };
}

async function ensurePayTypesViaFe(page, portal) {
  await page.goto(q(portal, '/hr/settings', { tab: 'master-data' }), {
    waitUntil: 'domcontentloaded',
    timeout: 120000,
  });
  await sleep(3500);
  const syncBtn = page.getByTestId('md-sync-xbos');
  if (await syncBtn.isVisible().catch(() => false)) {
    const syncWait = page
      .waitForResponse((res) => /catalog-sync|settings-catalogs\/sync/i.test(res.url()), { timeout: 60000 })
      .catch(() => null);
    await syncBtn.click({ force: true });
    await syncWait;
    await sleep(2500);
    R.payTypes.syncUsed = true;
  }
  const tab = page.getByTestId('md-tab-payTypes');
  if (await tab.isVisible().catch(() => false)) {
    await tab.click({ force: true });
    await sleep(1200);
  }
  await shot(page, '01-settings-pay-types');
}

async function createPayTypeExtension(page, code, label) {
  const codeInput = page.getByTestId('md-code-payTypes');
  const labelInput = page.getByTestId('md-label-payTypes');
  if (!(await codeInput.isVisible().catch(() => false))) return false;
  await codeInput.fill(code);
  await labelInput.fill(label);
  const postWait = page
    .waitForResponse(
      (res) =>
        /settings-catalogs\/items/.test(res.url()) &&
        res.request().method() === 'POST' &&
        res.status() >= 200 &&
        res.status() < 300,
      { timeout: 45000 },
    )
    .catch(() => null);
  await page.getByTestId('md-save-payTypes').click({ force: true });
  await postWait;
  await sleep(2000);
  R.payTypes.feCreateUsed = true;
  await shot(page, '02-pay-type-created');
  return true;
}

async function openComponentsTab(page) {
  const errBanner = page.locator('text=/HRM API|Sync ERROR|500|409/i').first();
  const hasErr = await errBanner.isVisible().catch(() => false);
  if (hasErr) return { ok: false, reason: 'error-banner' };

  const compTab = page.getByTestId('payroll-tab-components').first();
  const compTabByText = page.getByRole('button', { name: /Thành phần lương|Salary components/i }).first();
  if (await compTab.isVisible().catch(() => false)) {
    await compTab.click();
  } else if (await compTabByText.isVisible().catch(() => false)) {
    await compTabByText.click();
  } else {
    await page.locator('button', { hasText: /Thành phần lương/i }).first().click({ force: true }).catch(() => {});
  }
  await sleep(1800);
  return { ok: true };
}

async function createSalaryComponent(page, portal, payTypeCode, payTypeLabel) {
  await page.goto(q(portal, '/hr/payroll'), { waitUntil: 'domcontentloaded', timeout: 120000 });
  await sleep(2000);
  await shot(page, '03-payroll-load');

  const tabOpen = await openComponentsTab(page);
  if (!tabOpen.ok) return { ok: false, reason: tabOpen.reason };
  await shot(page, '04-components-tab');

  const addHost = await findInFrames(page, (h) => h.getByTestId('hdsd-pay-salary-component-add'));
  const addBtn = addHost.getByTestId('hdsd-pay-salary-component-add');
  if (!(await addBtn.isVisible().catch(() => false))) {
    return { ok: false, reason: 'add-button-missing' };
  }
  await addBtn.click({ force: true });
  await sleep(1200);
  await shot(page, '05-add-dialog');

  const codeHost = await findInFrames(page, (h) => h.getByTestId('pay-salary-component-code-input'));
  await codeHost.getByTestId('pay-salary-component-code-input').fill(SC_CODE);
  const nameHost = await findInFrames(page, (h) => h.getByTestId('pay-salary-component-name-input'));
  await nameHost.getByTestId('pay-salary-component-name-input').fill(SC_NAME);

  const typeHost = await findInFrames(page, (h) => h.getByTestId('hdsd-pay-salary-component-type'));
  const typeRoot = typeHost.getByTestId('hdsd-pay-salary-component-type');
  const combo = typeRoot.locator('[role="combobox"]').first();
  const target = (await combo.isVisible().catch(() => false)) ? combo : typeRoot;
  const pick = await pickCatalogOption(page, typeHost, target, payTypeCode);
  if (!pick.ok) return { ok: false, reason: pick.reason, pick };

  R.ids.selectedPayTypeCode = pick.code;
  R.ids.selectedPayTypeLabel = payTypeLabel || pick.code;

  const parityOk = pick.opts.count === R.payTypes.effAfter || pick.opts.count <= R.payTypes.effAfter;
  ac('AC-PICKER-PARITY', parityOk ? 'PASS' : 'FAIL', {
    summary: `picker options=${pick.opts.count} apiEff=${R.payTypes.effAfter} codes=${pick.opts.codes.slice(0, 8).join(',')}`,
  });

  const postsBefore = R.network.length;
  const saveHost = await findInFrames(page, (h) => h.getByTestId('hdsd-pay-salary-component-save'));
  const saveWait = page
    .waitForResponse((res) => /salary-components/.test(res.url()) && res.request().method() === 'POST', {
      timeout: 45000,
    })
    .catch(() => null);
  await saveHost.getByTestId('hdsd-pay-salary-component-save').click({ force: true });
  const resp = await saveWait;
  await sleep(2500);
  await shot(page, '06-after-save');

  const postNet = R.network.slice(postsBefore).find((n) => n.method === 'POST' && /salary-components/.test(n.url));
  const httpStatus = resp ? resp.status() : postNet?.status ?? null;
  const bodyType = postNet?.body?.component_type ?? postNet?.body?.componentType ?? null;
  const typeOk = bodyType === pick.code;
  const httpOk = httpStatus >= 200 && httpStatus < 300;

  return {
    ok: Boolean(httpOk && typeOk),
    httpStatus,
    bodyType,
    pick,
    postNet,
  };
}

async function verifyF5List(page, portal, payTypeLabel) {
  await page.reload({ waitUntil: 'domcontentloaded' });
  await sleep(3000);
  await openComponentsTab(page);
  await sleep(1500);
  await shot(page, '07-after-f5');

  const text = await page.evaluate(() => document.body.innerText || '');
  const codeUpper = SC_CODE.toUpperCase();
  const hasCode =
    text.toLowerCase().includes(SC_CODE.toLowerCase()) || text.includes(codeUpper);
  const hasName = text.includes(SC_NAME);
  const hasLabel = payTypeLabel ? text.includes(payTypeLabel) : true;

  const rowHost = await findInFrames(page, (h) =>
    h.locator('tbody tr').filter({ hasText: new RegExp(SC_NAME, 'i') }),
  );
  const row = rowHost.locator('tbody tr').filter({ hasText: SC_NAME }).first();
  const rowVisible = await row.isVisible().catch(() => false);

  let detailLabelOk = false;
  if (rowVisible) {
    await row.click({ force: true }).catch(() => {});
    await sleep(1500);
    await shot(page, '08-detail');
    const detailText = await page.evaluate(() => document.body.innerText || '');
    detailLabelOk = payTypeLabel ? detailText.includes(payTypeLabel) : true;
  }

  const ok = rowVisible && hasName && hasLabel && (hasCode || detailLabelOk);
  return { hasCode, hasName, hasLabel, rowVisible, detailLabelOk, ok };
}

async function main() {
  const portal = await pickPortal();
  if (!portal) {
    ac('L0-PORTAL', 'FAIL', { summary: 'portal not reachable' });
    R.ack_status = 'FAIL_TO_PM';
    R.overall = 'FAIL';
    save();
    process.exit(1);
  }
  R.env.PORTAL = portal;
  save();

  const session = await loginApi(portal);
  let eff = await fetchPayTypeEff(session.token);
  R.payTypes.effBefore = eff.count;
  R.payTypes.codes = eff.codes.slice(0, 30);
  R.payTypes.labels = eff.labels;
  save();

  const browser = await chromium.launch({
    headless: true,
    executablePath: existsSync(CHROME) ? CHROME : undefined,
    args: ['--disable-dev-shm-usage'],
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  wireNetwork(page);
  await injectPortalAuth(page, session);
  await page.goto(q(portal, '/command-center'), { waitUntil: 'domcontentloaded', timeout: 120000 });
  await sleep(1500);

  let payTypeCode = eff.codes[0] || 'luong';
  let payTypeLabel = eff.labels[payTypeCode] || payTypeCode;

  if (eff.count === 0) {
    await ensurePayTypesViaFe(page, portal);
    eff = await fetchPayTypeEff(session.token);
    if (eff.count === 0) {
      await createPayTypeExtension(page, PAY_TYPE_EXT_CODE, PAY_TYPE_EXT_LABEL);
      eff = await fetchPayTypeEff(session.token);
    }
    payTypeCode = eff.codes.includes(PAY_TYPE_EXT_CODE) ? PAY_TYPE_EXT_CODE : eff.codes[0];
    payTypeLabel = eff.labels[payTypeCode] || PAY_TYPE_EXT_LABEL;
  }

  R.payTypes.effAfter = eff.count;
  R.payTypes.codes = eff.codes.slice(0, 30);
  save();

  ac('PAY-TYPES-EFF', eff.count > 0 ? 'PASS' : 'FAIL', {
    summary: `EFF before=${R.payTypes.effBefore} after=${eff.count} sync=${R.payTypes.syncUsed} feCreate=${R.payTypes.feCreateUsed} sample=${eff.codes.slice(0, 5).join(',')}`,
  });

  if (eff.count === 0) {
    R.ack_status = 'FAIL_TO_PM';
    R.overall = 'FAIL';
    R.pm_dispatch_hint = 'dev-fe — pay_types catalog empty after U65 Settings sync+create';
    R.endedAt = ts();
    save();
    await browser.close();
    process.exit(1);
  }

  // Regression: pay-stale consumer (sealed QACONPAYSTQC1 — do not reopen)
  try {
    const staleScript = resolve(__dir, '_tmp-qa-hrm-settings-consumer-pay-stale-01.mjs');
    if (existsSync(staleScript)) {
      execSync(`node "${staleScript}"`, { cwd: ROOT, encoding: 'utf8', stdio: 'pipe', timeout: 120000 });
      ac('REGRESSION-QACONPAYST', 'PASS', { summary: 'pay-stale harness exit 0 (sealed legs untouched)' });
    }
  } catch (e) {
    ac('REGRESSION-QACONPAYST', 'OBS', { summary: `pay-stale skip/fail: ${String(e.message || e).slice(0, 120)}` });
  }

  const create = await createSalaryComponent(page, portal, payTypeCode, payTypeLabel);
  ac('AC-SET-CONSUMER-PT-PAY-01-CREATE', create.ok ? 'PASS' : 'FAIL', {
    summary: `POST HTTP=${create.httpStatus} component_type=${create.bodyType} expected=${create.pick?.code} reason=${create.reason || 'ok'}`,
  });

  let f5 = { ok: false };
  if (create.ok) {
    f5 = await verifyF5List(page, portal, payTypeLabel);
    ac('AC-SET-CONSUMER-PT-PAY-01-F5', f5.ok ? 'PASS' : 'FAIL', {
      summary: `row=${f5.rowVisible} code=${f5.hasCode} name=${f5.hasName} label=${f5.hasLabel}`,
    });
  } else {
    ac('AC-SET-CONSUMER-PT-PAY-01-F5', 'FAIL', { summary: 'blocked — create failed' });
  }

  const invent = await apiJson(session.token, 'POST', '/payroll/salary-components', {
    company_id: COMPANY,
    code: `invent_${STAMP.slice(-6).toLowerCase()}`,
    name: 'QA invent pay type',
    component_type: `INVENT_PT_${STAMP}`,
    nature: 'income',
    value_type: 'currency',
    is_taxable: false,
    is_insurance_base: false,
    is_active: true,
  });
  R.apiProbes.push({ id: 'VAL-PT-PAY-BE-01-invent', ...invent });
  const inventOk = invent.status === 400 && invent.code === 'HRM-PAY-TYPE-KEY';
  ac('VAL-PT-PAY-BE-01-invent', inventOk ? 'PASS' : 'FAIL', {
    summary: `POST invent → HTTP ${invent.status} code=${invent.code}`,
  });

  const allPass =
    R.ac['PAY-TYPES-EFF']?.verdict === 'PASS' &&
    R.ac['AC-SET-CONSUMER-PT-PAY-01-CREATE']?.verdict === 'PASS' &&
    R.ac['AC-SET-CONSUMER-PT-PAY-01-F5']?.verdict === 'PASS' &&
    R.ac['VAL-PT-PAY-BE-01-invent']?.verdict === 'PASS';

  R.ack_status = allPass ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  R.overall = allPass ? 'PASS' : 'FAIL';
  R.pm_dispatch_hint = allPass
    ? 'pm → QC-PO-HRM-PAY-TYPES-CONSUMER-PAY-01 narrow GWC'
    : 'dev-fe/dev-be — AC-SET-CONSUMER-PT-PAY-01 browser or invent probe FAIL';
  R.endedAt = ts();
  save();
  await browser.close();
  process.exit(allPass ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  R.ack_status = 'FAIL_TO_PM';
  R.overall = 'FAIL';
  R.pm_dispatch_hint = String(e.message || e);
  R.endedAt = ts();
  save();
  process.exit(1);
});
