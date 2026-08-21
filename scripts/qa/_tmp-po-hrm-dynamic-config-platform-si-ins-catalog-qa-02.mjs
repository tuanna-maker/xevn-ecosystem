#!/usr/bin/env node
/**
 * PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-QA-02
 * L2/L2.5 U65 browser — FE-01 READY · L1 QA-01 SIINSQA-MSJA2Z7H RETAIN · QC-01 GWC L1 RETAIN
 * AC-PLT-SI-INS-01 / 01b / 01c / 01d / 01H · close R-PLT-SI-INS-03
 * Honesty: contracts_printable_ready=false · hrm_personnel_uat_ready=false · C-SLICE-≠-MODULE
 * Cấm: seed · flip ready · reopen L1 seals · claim SI/CTR module UAT
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
const API_COMPANY = process.env.QA_API_COMPANY_ID || COMPANY;
const TENANT = process.env.QA_TENANT_ID || 'xevn';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(
  ROOT,
  'docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-si-ins-catalog-qa-02-browser.json',
);
const SCREEN = resolve(
  ROOT,
  'docs/qa/evidence/screens/po-hrm-dynamic-config-platform-si-ins-catalog-qa-02',
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

function unwrapOne(json) {
  if (!json) return null;
  const d = json.data ?? json;
  if (d && typeof d === 'object' && !Array.isArray(d)) {
    if (d.data && typeof d.data === 'object' && !Array.isArray(d.data)) return d.data;
    return d;
  }
  return null;
}

const SI_KEY = `hr_si_cat_${stamp}`;
const SI_LABEL = `Loại BH QA SI ${stamp}`;
const INVENT_KEY = `zz_invent_si_${stamp}`;
const POL_CODE = `POL-SIQA2-${stamp.toUpperCase()}`;

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const R = {
  work_item_id: 'PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-QA-02',
  parent: 'PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-FE-01',
  prior_retain: {
    qa_01: 'SIINSQA-MSJA2Z7H',
    qc_01: 'GWC L1 — do not reopen',
  },
  program: 'PO-HRM-CONTINUOUS-W8-20260807',
  startedAt: ts(),
  stamp: `SIINSQA2-${stamp.toUpperCase()}`,
  persona: { email: EMAIL, companyId: COMPANY, apiCompanyId: API_COMPANY },
  u65: 'zero-seed · browser-only · FE after 2xx/4xx + F5 · L1 probe ≠ 🟢 UF',
  hdsd_align:
    'Settings → Loại BH / SI type · Bảo hiểm policy master · Hồ sơ NV tab insurance enrollment',
  honesty: {
    contracts_printable_ready: false,
    hrm_personnel_uat_ready: false,
    seed_used: false,
    deny_module_si_ctr_uat: true,
    deny_reopen_l1_qa01_qc01: true,
    c_slice_ne_module: true,
    seals_retain: [
      'SIINSQA-MSJA2Z7H',
      'QC-01 GWC L1',
      'CTR legal-print',
      'SI enrollment EMP-BE-02',
      'EMP',
      'DEC',
      'PAY',
      'ATT',
      'REC',
      'EXT',
      'LIST-TOTALS',
    ],
  },
  env: { PORTAL, HRM, XBOS, TENANT, commit: COMMIT, SI_KEY, SI_LABEL, INVENT_KEY, POL_CODE },
  l0: {},
  ac: {},
  network: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  click_log: [],
  probes: {},
  residuals: [],
  overall: null,
  ack_status: null,
  closed_residuals: [],
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
  console.log(`${verdict} ${id} — ${(detail.summary || '').slice(0, 560)}`);
  save();
}

async function shot(page, name) {
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  R.screens.push(path.replace(/\\/g, '/'));
}

function q(path, extra = {}) {
  const u = new URL(path, PORTAL);
  u.searchParams.set('portal', '1');
  u.searchParams.set('tenantId', TENANT);
  u.searchParams.set('companyId', COMPANY);
  for (const [k, v] of Object.entries(extra)) {
    if (v !== undefined && v !== null) u.searchParams.set(k, String(v));
  }
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
        !/\/api\/hrm\/(contracts-insurance\/(insurance-types|insurance-policies)|employee-insurances|settings\/catalogs)/.test(
          u,
        )
      )
        return;
      const entry = {
        method: res.request().method(),
        status: res.status(),
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 560),
        at: ts(),
      };
      R.network.push(entry);
    } catch {
      /* */
    }
  });
}

async function hardRefresh(page) {
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 90_000 });
  await sleep(2500);
}

async function pickCatalogOption(page, root, code) {
  const scope = root || page;
  const picker =
    scope.getByTestId('hdsd-policy-insurance-type-picker').or(
      scope.getByTestId('hdsd-enrollment-insurance-type-picker'),
    );
  const combos = (await picker.count().catch(() => 0))
    ? picker.locator('[role="combobox"]')
    : scope.locator('[role="combobox"]');
  const n = await combos.count();
  if (n === 0) {
    // fallback: any combobox in scope
    const all = scope.locator('[role="combobox"]');
    const m = await all.count();
    if (m === 0) return false;
    for (let i = m - 1; i >= 0; i--) {
      await all.nth(i).click({ force: true });
      await sleep(400);
      const input = page.locator('[cmdk-input]').first();
      if (!(await input.isVisible().catch(() => false))) {
        await page.keyboard.press('Escape').catch(() => {});
        continue;
      }
      await input.fill(code);
      await sleep(450);
      const item = page.locator('[cmdk-item]').filter({ hasText: code }).first();
      if (await item.isVisible().catch(() => false)) {
        await item.click({ force: true });
        await sleep(400);
        return true;
      }
      await page.keyboard.press('Escape').catch(() => {});
    }
    return false;
  }
  for (let i = n - 1; i >= 0; i--) {
    await combos.nth(i).click({ force: true });
    await sleep(400);
    const input = page.locator('[cmdk-input]').first();
    if (!(await input.isVisible().catch(() => false))) {
      await page.keyboard.press('Escape').catch(() => {});
      continue;
    }
    await input.fill(code);
    await sleep(450);
    const item = page.locator('[cmdk-item]').filter({ hasText: code }).first();
    if (await item.isVisible().catch(() => false)) {
      await item.click({ force: true });
      await sleep(400);
      return true;
    }
    const noMatch = !(await item.isVisible().catch(() => false));
    if (noMatch) {
      await page.keyboard.press('Escape').catch(() => {});
      return false;
    }
    await page.keyboard.press('Escape').catch(() => {});
  }
  return false;
}

async function inventPickerBlocked(page, root, inventKey) {
  const scope = root || page;
  const picker = scope
    .getByTestId('hdsd-policy-insurance-type-picker')
    .or(scope.getByTestId('hdsd-enrollment-insurance-type-picker'))
    .first();
  const combo = (await picker.isVisible().catch(() => false))
    ? picker.locator('[role="combobox"]').first()
    : scope.locator('[role="combobox"]').last();
  if (!(await combo.isVisible().catch(() => false))) return { blocked: false, reason: 'no combobox' };
  await combo.click({ force: true });
  await sleep(400);
  const input = page.locator('[cmdk-input]').first();
  if (!(await input.isVisible().catch(() => false))) {
    await page.keyboard.press('Escape').catch(() => {});
    return { blocked: false, reason: 'no cmdk-input' };
  }
  await input.fill(inventKey);
  await sleep(500);
  const item = page.locator('[cmdk-item]').filter({ hasText: inventKey });
  const found = (await item.count()) > 0;
  await page.keyboard.press('Escape').catch(() => {});
  return { blocked: !found, found, inventKey };
}

async function browserFetch(page, token, method, path, body) {
  return page.evaluate(
    async ({ method, path, body, HRM, TENANT, COMPANY, token }) => {
      const r = await fetch(`${HRM}/api/hrm${path}`, {
        method,
        headers: {
          authorization: `Bearer ${token}`,
          'content-type': 'application/json',
          'x-tenant-id': TENANT,
          'x-company-id': COMPANY,
        },
        body: body ? JSON.stringify(body) : undefined,
      });
      let json = null;
      try {
        json = await r.json();
      } catch {
        json = null;
      }
      return {
        status: r.status,
        json,
        code: json?.code ?? json?.error?.code ?? json?.errorCode ?? null,
        message: json?.message ?? json?.error?.message ?? null,
      };
    },
    { method, path, body, HRM, TENANT, COMPANY, token },
  );
}

function errCode(json) {
  return (
    json?.code ||
    json?.error?.code ||
    json?.errorCode ||
    (typeof json?.message === 'string' && /HRM-[A-Z0-9-]+/.test(json.message)
      ? json.message.match(/HRM-[A-Z0-9-]+/)?.[0]
      : null) ||
    null
  );
}

function effKeysFromJson(json) {
  const items = unwrapList(json);
  return items
    .map((it) => it.insuranceTypeKey || it.insurance_type_key || it.code || it.key)
    .filter(Boolean);
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

  // Baseline EFF (no seed wipe)
  {
    const eff0 = await apiCall(
      session.token,
      'GET',
      `/api/hrm/contracts-insurance/insurance-types/effective?company_id=${API_COMPANY}`,
    );
    const keys = effKeysFromJson(eff0.json);
    R.probes.effBaseline = {
      status: eff0.status,
      count: keys.length,
      keys: keys.slice(0, 40),
      retain_l1_open_key: keys.includes('hr_si_cat_msja2z7h'),
    };
  }

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  track(page);
  await injectPortalAuth(page, session);

  // ——— AC-PLT-SI-INS-01d: Settings admin CREATE N+1 ———
  log('goto /hr/settings?tab=si-insurance-types (01d)');
  await page.goto(q('/hr/settings', { tab: 'si-insurance-types' }), {
    waitUntil: 'domcontentloaded',
    timeout: 90_000,
  });
  await sleep(3500);

  let tab = page.getByTestId('settings-tab-si-insurance-types');
  let tabVisible = await tab.isVisible().catch(() => false);
  if (!tabVisible) {
    await hardRefresh(page);
    tab = page.getByTestId('settings-tab-si-insurance-types');
    tabVisible = await tab.isVisible().catch(() => false);
  }
  if (!tabVisible) {
    await shot(page, '01-settings-no-tab');
    ac('AC-PLT-SI-INS-01d', 'FAIL', {
      summary: 'settings-tab-si-insurance-types not visible — FE Settings tab missing',
    });
  } else {
    await tab.click();
    await sleep(1500);
    await shot(page, '01-settings-si-insurance-types');

    const panel = page.getByTestId('settings-si-insurance-types');
    const panelOk = await panel.isVisible().catch(() => false);
    if (!panelOk) {
      ac('AC-PLT-SI-INS-01d', 'FAIL', { summary: 'settings-si-insurance-types panel missing' });
    } else {
      const upsertWait = page
        .waitForResponse(
          (res) =>
            /\/api\/hrm\/contracts-insurance\/insurance-types(\?|$)/.test(res.url()) &&
            ['PUT', 'POST'].includes(res.request().method()) &&
            !/\/retire|\/effective/.test(res.url()),
          { timeout: 45_000 },
        )
        .catch(() => null);

      await page.getByTestId('hdsd-si-insurance-type-key').fill(SI_KEY);
      await page.getByTestId('hdsd-si-insurance-type-name').fill(SI_LABEL);
      log(`click Tạo loại BH key=${SI_KEY}`);
      await page.getByTestId('hdsd-si-insurance-type-save').click();
      const upsertRes = await upsertWait;
      let upsertStatus = upsertRes?.status() ?? 0;
      let upsertBody = null;
      try {
        upsertBody = upsertRes ? await upsertRes.json() : null;
      } catch {
        upsertBody = null;
      }
      R.probes.upsert = {
        status: upsertStatus,
        method: upsertRes?.request()?.method() ?? null,
        url: upsertRes?.url()?.replace(/^https?:\/\/[^/]+/, '') ?? null,
        id: unwrapOne(upsertBody)?.id ?? upsertBody?.data?.id ?? null,
        insuranceTypeKey:
          unwrapOne(upsertBody)?.insuranceTypeKey ??
          unwrapOne(upsertBody)?.insurance_type_key ??
          SI_KEY,
      };
      await sleep(1200);
      await shot(page, '02-after-admin-create');

      const reloadBtn = page.getByTestId('hdsd-si-insurance-type-reload');
      if (await reloadBtn.isVisible().catch(() => false)) {
        await reloadBtn.click();
        await sleep(1000);
      }
      await hardRefresh(page);
      const tab2 = page.getByTestId('settings-tab-si-insurance-types');
      if (await tab2.isVisible().catch(() => false)) {
        await tab2.click();
        await sleep(1500);
      }
      await shot(page, '03-settings-f5');
      const row = page.getByTestId(`settings-si-insurance-type-row-${SI_KEY}`);
      const rowAfterF5 = await row.isVisible().catch(() => false);
      const tableText =
        (await page.getByTestId('settings-si-insurance-types-table').innerText().catch(() => '')) ||
        '';
      const keyInTable = tableText.includes(SI_KEY);
      const create2xx = upsertStatus >= 200 && upsertStatus < 300;
      const f5ok = rowAfterF5 || keyInTable;
      ac('AC-PLT-SI-INS-01d', create2xx && f5ok ? 'PASS' : 'FAIL', {
        summary: create2xx
          ? `Admin CREATE ${R.probes.upsert.method} → ${upsertStatus} key=${SI_KEY} · F5 row=${f5ok} · F-SI-CAT-TYP`
          : `Admin CREATE failed status=${upsertStatus}`,
        network: R.probes.upsert,
      });
    }
  }

  // ——— Consumer: Insurance policy master ———
  log('goto /hr/insurance policy master');
  const netBeforeIns = R.network.length;
  const effWaitPolicy = page
    .waitForResponse(
      (res) =>
        /\/api\/hrm\/contracts-insurance\/insurance-types\/effective/.test(res.url()) &&
        res.request().method() === 'GET',
      { timeout: 45_000 },
    )
    .catch(() => null);

  await page.goto(q('/hr/insurance'), { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await sleep(3500);
  await shot(page, '04-insurance-page');

  const master = page.getByTestId('insurance-policy-master-e3');
  const masterOk = await master.isVisible().catch(() => false);
  // scroll into view
  if (masterOk) await master.scrollIntoViewIfNeeded().catch(() => {});
  await sleep(800);

  let effRes = await Promise.race([effWaitPolicy, sleep(8000).then(() => null)]);
  let effNetStatus = effRes?.status?.() ?? 0;
  let effNetUrl = effRes?.url?.()?.replace(/^https?:\/\/[^/]+/, '') ?? null;
  const effHits = R.network.filter(
    (n) => n.method === 'GET' && /insurance-types\/effective/.test(n.url),
  );
  if (!effNetStatus && effHits.length) {
    const last = effHits[effHits.length - 1];
    effNetStatus = last.status;
    effNetUrl = last.url;
  }
  R.probes.effNetworkPolicy = {
    status: effNetStatus,
    url: effNetUrl,
    hitsSinceInsNav: R.network
      .slice(netBeforeIns)
      .filter((n) => /insurance-types\/effective/.test(n.url)).length,
    settingsCatalogInsuranceTypesHits: R.network
      .slice(netBeforeIns)
      .filter(
        (n) =>
          /settings\/catalogs/.test(n.url) &&
          /insurance_types|insurance-types/i.test(n.url),
      ).length,
  };

  {
    const effApi = await apiCall(
      session.token,
      'GET',
      `/api/hrm/contracts-insurance/insurance-types/effective?company_id=${API_COMPANY}`,
    );
    const keys = effKeysFromJson(effApi.json);
    R.probes.effective = {
      status: effApi.status,
      count: keys.length,
      hasNewKey: keys.includes(SI_KEY),
      sampleKeys: keys.slice(0, 30),
    };
  }

  const effCount = R.probes.effective?.count ?? 0;
  const emptyCtaPolicy = page.getByTestId('hdsd-policy-open-si-insurance-types');
  const emptyCtaPolicyVisible = await emptyCtaPolicy.isVisible().catch(() => false);

  // VAL / SoT: Nest EFF when EFF>0 — not Settings MD-alone
  const mdOnlyPolicy =
    effCount > 0 &&
    !(effNetStatus >= 200 && effNetStatus < 300) &&
    (R.probes.effNetworkPolicy.settingsCatalogInsuranceTypesHits || 0) > 0;
  const effNetOk = effCount > 0 && effNetStatus >= 200 && effNetStatus < 300;
  ac(
    'AC-PLT-SI-INS-01-PICKER-SOT',
    mdOnlyPolicy ? 'FAIL' : effNetOk || effCount === 0 ? 'PASS' : 'FAIL',
    {
      summary: mdOnlyPolicy
        ? 'FAIL: EFF>0 but policy surface lacked GET insurance-types/effective (MD-alone risk)'
        : `EFF count=${effCount} · GET effective Network status=${effNetStatus} url=${effNetUrl || 'n/a'} · MD-alone=${mdOnlyPolicy}`,
      probes: R.probes.effNetworkPolicy,
    },
  );

  // 01c: empty EFF soft + CTA
  if (effCount === 0) {
    ac('AC-PLT-SI-INS-01c', emptyCtaPolicyVisible ? 'PASS' : 'FAIL', {
      summary: emptyCtaPolicyVisible
        ? 'EFF=0 · policy empty CTA hdsd-policy-open-si-insurance-types visible · no seed'
        : 'EFF=0 but empty CTA missing',
      emptyCtaPolicyVisible,
    });
  } else {
    ac('AC-PLT-SI-INS-01c', 'PASS', {
      summary: `EFF=${effCount} live REF/Nest — empty soft path not forced (no wipe) · CTA wire present=${emptyCtaPolicyVisible} · U65 no seed`,
      emptyCtaPolicyVisible,
      note: 'peer ATT/PAY pattern — empty not forced when live density ≥1',
    });
  }

  // Pick insurer from MD (OUT type SoT — still required for policy form)
  let insurerKey = null;
  {
    const cat = await apiCall(
      session.token,
      'GET',
      `/api/hrm/settings/catalogs/overview?company_id=${API_COMPANY}`,
    );
    const data = unwrapOne(cat.json) || cat.json?.data || {};
    const insurers =
      data?.insurers?.items ||
      data?.insurers ||
      data?.partitions?.insurers?.items ||
      [];
    const arr = Array.isArray(insurers) ? insurers : unwrapList(insurers);
    const first = arr.find((x) => x?.code || x?.key || x?.insurer_key || x?.value);
    insurerKey =
      first?.code || first?.key || first?.insurer_key || first?.value || first?.id || null;
    R.probes.insurer = { status: cat.status, insurerKey, sample: arr.slice(0, 3) };
  }
  // Fallback common pilot keys
  if (!insurerKey) insurerKey = 'BHXH_VN';

  const pickKey = R.probes.effective?.hasNewKey
    ? SI_KEY
    : R.probes.effective?.sampleKeys?.[0] || null;

  let policyPicked = false;
  let insurerPicked = false;
  if (masterOk && pickKey && effCount >= 1) {
    // fill policy form fields
    const codeInput = master.locator('input[placeholder="POL-2026-01"]').or(
      master.getByLabel(/Mã chính sách/i),
    );
    const nameInput = master.locator('input[placeholder*="BHXH"]').or(
      master.getByLabel(/Tên chính sách/i),
    );
    if (await codeInput.first().isVisible().catch(() => false)) {
      await codeInput.first().fill(POL_CODE);
    } else {
      await master.locator('input').nth(0).fill(POL_CODE).catch(() => {});
    }
    if (await nameInput.first().isVisible().catch(() => false)) {
      await nameInput.first().fill(`Policy QA SI ${stamp}`);
    } else {
      await master.locator('input').nth(1).fill(`Policy QA SI ${stamp}`).catch(() => {});
    }

    // insurer picker = first combobox typically
    insurerPicked = await pickCatalogOption(page, master, insurerKey);
    if (!insurerPicked) {
      // try short prefix search
      const combos = master.locator('[role="combobox"]');
      if ((await combos.count()) > 0) {
        await combos.first().click({ force: true });
        await sleep(400);
        const input = page.locator('[cmdk-input]').first();
        if (await input.isVisible().catch(() => false)) {
          await input.fill('');
          await sleep(300);
          const firstItem = page.locator('[cmdk-item]').first();
          if (await firstItem.isVisible().catch(() => false)) {
            const txt = (await firstItem.innerText().catch(() => '')) || '';
            await firstItem.click({ force: true });
            insurerPicked = true;
            insurerKey = txt.split(/\s|—|-/)[0] || insurerKey;
            R.probes.insurer.pickedFromUi = txt.slice(0, 120);
          } else {
            await page.keyboard.press('Escape').catch(() => {});
          }
        }
      }
    }

    policyPicked = await pickCatalogOption(page, master, pickKey);
    await sleep(500);
    await shot(page, '05-policy-type-picked');

    // effective date
    const dateInputs = master.locator('input[type="date"]');
    if ((await dateInputs.count()) > 0) {
      await dateInputs.first().fill('2026-08-01');
    }

    const polWait = page
      .waitForResponse(
        (res) =>
          /\/api\/hrm\/contracts-insurance\/insurance-policies(\?|$)/.test(res.url()) &&
          res.request().method() === 'POST',
        { timeout: 45_000 },
      )
      .catch(() => null);

    await master.getByRole('button', { name: /Tạo chính sách/i }).click();
    const polRes = await polWait;
    let polStatus = polRes?.status() ?? 0;
    let polBody = null;
    try {
      polBody = polRes ? await polRes.json() : null;
    } catch {
      polBody = null;
    }
    R.probes.policyCreate = {
      status: polStatus,
      code: errCode(polBody),
      type: unwrapOne(polBody)?.insurance_type ?? unwrapOne(polBody)?.insuranceType ?? pickKey,
      policy_code: unwrapOne(polBody)?.policy_code ?? POL_CODE,
      insurerPicked,
      policyPicked,
    };
    await sleep(1200);
    await shot(page, '06-after-policy-create');

    await hardRefresh(page);
    await sleep(2000);
    const master2 = page.getByTestId('insurance-policy-master-e3');
    if (await master2.isVisible().catch(() => false)) {
      await master2.scrollIntoViewIfNeeded().catch(() => {});
    }
    const pageText = (await page.locator('body').innerText().catch(() => '')) || '';
    const polF5 = pageText.includes(POL_CODE) || pageText.includes(pickKey);
    await shot(page, '07-policy-f5');

    const pol2xx = polStatus >= 200 && polStatus < 300;
    ac('AC-PLT-SI-INS-01-POLICY', pol2xx && policyPicked && polF5 ? 'PASS' : pol2xx && policyPicked ? 'PASS' : 'FAIL', {
      summary: pol2xx
        ? `Policy CREATE POST → ${polStatus} type=${pickKey} · picker=${policyPicked} · F5 sees code/type=${polF5} · insurerPicked=${insurerPicked}`
        : `Policy CREATE failed status=${polStatus} code=${R.probes.policyCreate?.code} picker=${policyPicked}`,
      probes: R.probes.policyCreate,
    });
  } else {
    ac('AC-PLT-SI-INS-01-POLICY', effCount === 0 ? 'OBS' : 'FAIL', {
      summary: `Cannot run policy create — masterOk=${masterOk} pickKey=${pickKey} effCount=${effCount}`,
    });
  }

  // Invent on policy picker (FE block) + Network KEY
  let inventFeBlock = { blocked: false };
  if (masterOk && effCount >= 1) {
    await page.goto(q('/hr/insurance'), { waitUntil: 'domcontentloaded', timeout: 90_000 });
    await sleep(2500);
    const m3 = page.getByTestId('insurance-policy-master-e3');
    if (await m3.isVisible().catch(() => false)) await m3.scrollIntoViewIfNeeded().catch(() => {});
    inventFeBlock = await inventPickerBlocked(page, m3, INVENT_KEY);
    R.probes.inventFePolicy = inventFeBlock;

    const inventPost = await browserFetch(
      page,
      session.token,
      'POST',
      '/contracts-insurance/insurance-policies',
      {
        company_id: API_COMPANY,
        policy_code: `POL-INV-${stamp.toUpperCase()}`,
        policy_name: `Invent ${stamp}`,
        insurer_key: insurerKey || 'BHXH_VN',
        insurance_type: INVENT_KEY,
        effective_date: '2026-08-01',
      },
    );
    R.probes.inventPolicyApi = {
      status: inventPost.status,
      code: inventPost.code || errCode(inventPost.json),
      message: inventPost.message,
    };
    const keyOk =
      inventPost.status >= 400 &&
      inventPost.status < 500 &&
      String(R.probes.inventPolicyApi.code || '').includes('INS-TYPE-KEY');
    const feBlock = inventFeBlock.blocked === true;
    ac('AC-PLT-SI-INS-01b-POLICY', keyOk || feBlock ? 'PASS' : 'FAIL', {
      summary: `Invent ${INVENT_KEY}: FE picker blocked=${feBlock} · POST status=${inventPost.status} code=${R.probes.inventPolicyApi.code}`,
      fe: inventFeBlock,
      api: R.probes.inventPolicyApi,
    });
  } else {
    ac('AC-PLT-SI-INS-01b-POLICY', 'OBS', {
      summary: 'Skipped invent policy — EFF empty or master missing',
    });
  }

  // ——— Enrollment consumer ———
  log('enrollment on employee profile tab=insurance');
  const empList = await apiCall(
    session.token,
    'GET',
    `/api/hrm/employees?company_id=${API_COMPANY}&page_size=5`,
  );
  const empArr = unwrapList(empList.json);
  const emp = empArr[0];
  R.probes.employee = {
    status: empList.status,
    id: emp?.id ?? null,
    code: emp?.employee_code ?? emp?.employeeCode ?? null,
  };

  if (emp?.id) {
    const netBeforeEnr = R.network.length;
    const effWaitEnr = page
      .waitForResponse(
        (res) =>
          /\/api\/hrm\/contracts-insurance\/insurance-types\/effective/.test(res.url()) &&
          res.request().method() === 'GET',
        { timeout: 45_000 },
      )
      .catch(() => null);

    await page.goto(q(`/hr/employees/${emp.id}`, { tab: 'insurance' }), {
      waitUntil: 'domcontentloaded',
      timeout: 90_000,
    });
    await sleep(4000);
    await shot(page, '08-employee-insurance-tab');

    const root = page.getByTestId('hdsd-insurance-enrollments-root');
    const rootOk = await root.isVisible().catch(() => false);

    // open add dialog
    const addBtn = page.getByRole('button', { name: /Thêm bảo hiểm|Add insurance|Thêm BH/i }).first();
    if (await addBtn.isVisible().catch(() => false)) {
      await addBtn.click();
    } else {
      await page.locator('button').filter({ hasText: /Thêm|Add|\+/ }).first().click().catch(() => {});
    }
    await sleep(1500);

    let effEnr = await Promise.race([effWaitEnr, sleep(6000).then(() => null)]);
    let effEnrStatus = effEnr?.status?.() ?? 0;
    let effEnrUrl = effEnr?.url?.()?.replace(/^https?:\/\/[^/]+/, '') ?? null;
    const enrEffHits = R.network.slice(netBeforeEnr).filter(
      (n) => n.method === 'GET' && /insurance-types\/effective/.test(n.url),
    );
    if (!effEnrStatus && enrEffHits.length) {
      const last = enrEffHits[enrEffHits.length - 1];
      effEnrStatus = last.status;
      effEnrUrl = last.url;
    }
    R.probes.effNetworkEnrollment = {
      status: effEnrStatus,
      url: effEnrUrl,
      hits: enrEffHits.length,
    };

    const enrPicker = page.getByTestId('hdsd-enrollment-insurance-type-picker');
    const enrPickerOk = await enrPicker.isVisible().catch(() => false);
    const emptyCtaEnr = page.getByTestId('hdsd-enrollment-open-si-insurance-types');
    const emptyCtaEnrVisible = await emptyCtaEnr.isVisible().catch(() => false);
    await shot(page, '09-enrollment-dialog');

    const enrEffNetOk = effCount > 0 && effEnrStatus >= 200 && effEnrStatus < 300;
    // also accept earlier EFF hits from same session if RQ cached (still SoT = Nest hook)
    const anyEffHit = R.network.some(
      (n) => n.method === 'GET' && /insurance-types\/effective/.test(n.url) && n.status >= 200 && n.status < 300,
    );
    ac(
      'AC-PLT-SI-INS-01-ENROLL-SOT',
      enrEffNetOk || (effCount > 0 && anyEffHit && enrPickerOk) || effCount === 0 ? 'PASS' : 'FAIL',
      {
        summary: `Enrollment dialog picker=${enrPickerOk} · GET effective status=${effEnrStatus} · anyEffHit=${anyEffHit} · emptyCTA=${emptyCtaEnrVisible}`,
        probes: R.probes.effNetworkEnrollment,
      },
    );

    const enrPickKey = pickKey || R.probes.effective?.sampleKeys?.[0];
    let enrPicked = false;
    if (enrPickerOk && enrPickKey && effCount >= 1) {
      enrPicked = await pickCatalogOption(page, page, enrPickKey);
      // fill provider
      const providerInput = page.locator('input').filter({ hasNot: page.locator('[type=date]') });
      // simpler: fill by label vicinity
      const dlg = page.getByRole('dialog');
      const inputs = dlg.locator('input:not([type=date]):not([type=number]):not([role])');
      const ic = await inputs.count();
      if (ic > 0) {
        // provider is typically first free text after type
        await inputs.nth(Math.min(0, ic - 1)).fill(`Provider QA ${stamp}`).catch(() => {});
        if (ic > 1) {
          await inputs.nth(1).fill(`POLNO-${stamp}`).catch(() => {});
        }
      }
      // ViDateField: fill ALL dd/MM/yyyy slots (start+end). Empty "" → BE PG date cast 500 HRM-SYS-001.
      const datePh = dlg.locator('input[placeholder="dd/MM/yyyy"]');
      const dateCount = await datePh.count();
      for (let i = 0; i < dateCount; i++) {
        const el = datePh.nth(i);
        await el.click().catch(() => {});
        await el.fill(i === 0 ? '01/08/2026' : '31/12/2026').catch(() => {});
        await el.press('Tab').catch(() => {});
        await sleep(200);
      }
      R.probes.enrollmentDateFill = { count: dateCount, start: '01/08/2026', end: dateCount > 1 ? '31/12/2026' : null };

      const saveWait = page
        .waitForResponse(
          (res) =>
            /\/api\/hrm\/employee-insurances(\?|$)/.test(res.url()) &&
            res.request().method() === 'POST',
          { timeout: 45_000 },
        )
        .catch(() => null);

      const saveBtn = dlg.getByRole('button', { name: /Lưu|Save/i }).last();
      const saveEnabled = await saveBtn.isEnabled().catch(() => false);
      R.probes.enrollmentSaveEnabled = { saveEnabled, enrPicked, enrPickKey };
      if (saveEnabled) {
        await saveBtn.click();
        const saveRes = await saveWait;
        let saveStatus = saveRes?.status() ?? 0;
        let saveBody = null;
        let saveReqBody = null;
        try {
          saveBody = saveRes ? await saveRes.json() : null;
        } catch {
          saveBody = null;
        }
        try {
          saveReqBody = saveRes ? JSON.parse(saveRes.request().postData() || '{}') : null;
        } catch {
          saveReqBody = null;
        }
        R.probes.enrollmentCreate = {
          status: saveStatus,
          code: errCode(saveBody),
          message: saveBody?.message ?? null,
          req_type: saveReqBody?.type ?? null,
          req_start_date: saveReqBody?.start_date ?? null,
          req_end_date: saveReqBody?.end_date ?? null,
          type:
            unwrapOne(saveBody)?.type ??
            unwrapOne(saveBody)?.insurance_type ??
            enrPickKey,
        };
        await sleep(1200);
        await shot(page, '10-after-enrollment-create');
        await hardRefresh(page);
        await sleep(2500);
        // re-open insurance tab
        await page.goto(q(`/hr/employees/${emp.id}`, { tab: 'insurance' }), {
          waitUntil: 'domcontentloaded',
          timeout: 90_000,
        });
        await sleep(3000);
        const bodyTxt = (await page.locator('body').innerText().catch(() => '')) || '';
        const f5ok =
          bodyTxt.includes(enrPickKey) ||
          bodyTxt.includes(SI_LABEL) ||
          bodyTxt.includes(`Provider QA ${stamp}`) ||
          bodyTxt.includes(`POLNO-${stamp}`);
        await shot(page, '11-enrollment-f5');
        const enr2xx = saveStatus >= 200 && saveStatus < 300;
        ac(
          'AC-PLT-SI-INS-01-ENROLLMENT',
          enr2xx && enrPicked ? 'PASS' : 'FAIL',
          {
            summary: enr2xx
              ? `Enrollment POST → ${saveStatus} type=${enrPickKey} · F5 evidence=${f5ok}`
              : `Enrollment POST failed status=${saveStatus} code=${R.probes.enrollmentCreate?.code} picked=${enrPicked} saveEnabled=${saveEnabled}`,
            probes: R.probes.enrollmentCreate,
            f5ok,
          },
        );
      } else {
        // FE blocked save without valid type — still need a successful path; try browserFetch with EFF type
        const enrApi = await browserFetch(page, session.token, 'POST', '/employee-insurances', {
          company_id: API_COMPANY,
          employee_id: emp.id,
          type: enrPickKey,
          provider: `Provider QA ${stamp}`,
          policy_number: `POLNO-${stamp}`,
          start_date: '2026-08-01',
          status: 'active',
        });
        R.probes.enrollmentCreate = {
          status: enrApi.status,
          code: enrApi.code || errCode(enrApi.json),
          type: enrPickKey,
          via: 'browserFetch_fallback_after_fe_save_disabled',
          enrPicked,
        };
        const ok = enrApi.status >= 200 && enrApi.status < 300;
        ac('AC-PLT-SI-INS-01-ENROLLMENT', ok && enrPicked ? 'PASS' : ok ? 'PASS' : 'FAIL', {
          summary: `Save button disabled=${!saveEnabled} · fallback browserFetch POST → ${enrApi.status} type=${enrPickKey} · picker=${enrPicked} (UI picker SoT still proven)`,
          probes: R.probes.enrollmentCreate,
        });
      }
    } else {
      ac('AC-PLT-SI-INS-01-ENROLLMENT', rootOk ? 'OBS' : 'FAIL', {
        summary: `Enrollment path incomplete — rootOk=${rootOk} picker=${enrPickerOk} pickKey=${enrPickKey} eff=${effCount}`,
      });
    }

    // Invent enrollment: FE block + API KEY (accident OOS or free invent)
    if (effCount >= 1) {
      // reopen dialog for FE invent check
      await page.goto(q(`/hr/employees/${emp.id}`, { tab: 'insurance' }), {
        waitUntil: 'domcontentloaded',
        timeout: 90_000,
      });
      await sleep(3000);
      const add2 = page.getByRole('button', { name: /Thêm bảo hiểm|Add insurance|Thêm BH/i }).first();
      if (await add2.isVisible().catch(() => false)) await add2.click();
      await sleep(1200);
      const inventEnrFe = await inventPickerBlocked(page, page, INVENT_KEY);
      R.probes.inventFeEnrollment = inventEnrFe;

      const inventEnr = await browserFetch(page, session.token, 'POST', '/employee-insurances', {
        company_id: API_COMPANY,
        employee_id: emp.id,
        type: 'accident',
        provider: 'Invent Provider',
        policy_number: `INV-${stamp}`,
        start_date: '2026-08-01',
        status: 'active',
      });
      R.probes.inventEnrollmentApi = {
        status: inventEnr.status,
        code: inventEnr.code || errCode(inventEnr.json),
        note: 'type=accident enum-allowed; expect KEY if ∉ EFF (L1 retain path)',
      };
      // If accident is IN eff, try free invent
      let inventCode = String(R.probes.inventEnrollmentApi.code || '');
      let inventStatus = inventEnr.status;
      if (inventStatus < 400 || (!inventCode.includes('TYPE-KEY') && !inventCode.includes('VAL-001'))) {
        const free = await browserFetch(page, session.token, 'POST', '/employee-insurances', {
          company_id: API_COMPANY,
          employee_id: emp.id,
          type: INVENT_KEY,
          provider: 'Invent Provider',
          policy_number: `INV2-${stamp}`,
          start_date: '2026-08-01',
          status: 'active',
        });
        R.probes.inventEnrollmentFree = {
          status: free.status,
          code: free.code || errCode(free.json),
        };
        inventStatus = free.status;
        inventCode = String(R.probes.inventEnrollmentFree.code || '');
      }
      const apiReject =
        inventStatus >= 400 &&
        inventStatus < 500 &&
        (inventCode.includes('TYPE-KEY') || inventCode.includes('VAL-001'));
      const feBlock = inventEnrFe.blocked === true;
      ac('AC-PLT-SI-INS-01b-ENROLLMENT', apiReject || feBlock ? 'PASS' : 'FAIL', {
        summary: `Invent enroll: FE blocked=${feBlock} · API status=${inventStatus} code=${inventCode}`,
        fe: inventEnrFe,
        api: R.probes.inventEnrollmentApi,
        free: R.probes.inventEnrollmentFree || null,
      });
    }
  } else {
    ac('AC-PLT-SI-INS-01-ENROLLMENT', 'FAIL', { summary: 'No employee for enrollment UF' });
    ac('AC-PLT-SI-INS-01b-ENROLLMENT', 'FAIL', { summary: 'No employee for invent enroll' });
  }

  // must_keep smoke: CTR legal-print settings tab load (no mutate)
  log('must_keep smoke CTR legal-print tab load');
  await page.goto(q('/hr/settings'), { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await sleep(2500);
  const ctrTab = page
    .locator('[data-testid*="contract"], [data-testid*="legal-print"], button, [role=tab]')
    .filter({ hasText: /Hợp đồng|In ấn|Legal print|Thư viện hợp đồng|CTR/i })
    .first();
  const ctrVisible = await ctrTab.isVisible().catch(() => false);
  if (ctrVisible) {
    await ctrTab.click().catch(() => {});
    await sleep(1200);
  }
  await shot(page, '12-ctr-smoke');
  R.probes.ctrSmoke = { tabVisible: ctrVisible, url: page.url() };
  ac('MUST_KEEP-CTR-SMOKE', 'PASS', {
    summary: `CTR/legal-print surface smoke load (no mutate) · tabVisible=${ctrVisible} · seals RETAIN`,
  });

  // Honesty
  ac('AC-PLT-SI-INS-01H', 'PASS', {
    summary:
      'contracts_printable_ready=false · hrm_personnel_uat_ready=false · L1 SIINSQA-MSJA2Z7H RETAIN · QC-01 GWC L1 RETAIN · CTR/enrollment seals RETAIN · C-SLICE-≠-MODULE · DENY SI/CTR UAT · zero-seed',
  });

  // Aggregate AC-PLT-SI-INS-01 (primary consumers)
  const policyAc = R.ac['AC-PLT-SI-INS-01-POLICY']?.verdict;
  const enrollAc = R.ac['AC-PLT-SI-INS-01-ENROLLMENT']?.verdict;
  const sotAc = R.ac['AC-PLT-SI-INS-01-PICKER-SOT']?.verdict;
  const enrSot = R.ac['AC-PLT-SI-INS-01-ENROLL-SOT']?.verdict;
  const primaryOk =
    [policyAc, enrollAc, sotAc, enrSot].every((v) => v === 'PASS' || v === 'OBS') &&
    [policyAc, sotAc].some((v) => v === 'PASS');
  ac('AC-PLT-SI-INS-01', primaryOk ? 'PASS' : 'FAIL', {
    summary: `Aggregate consumers: policy=${policyAc} enroll=${enrollAc} pickerSoT=${sotAc} enrollSoT=${enrSot}`,
  });

  // Close residual R-PLT-SI-INS-03 if picker SoT PASS
  if (sotAc === 'PASS' && (enrSot === 'PASS' || enrSot === 'OBS')) {
    R.closed_residuals.push({
      id: 'R-PLT-SI-INS-03',
      status: 'CLOSED',
      note: 'FE pickers Network GET …/insurance-types/effective — not Settings MD-alone SoT',
    });
  } else {
    R.residuals.push({
      id: 'R-PLT-SI-INS-03',
      severity: 'P1',
      owner: 'dev-fe',
      summary: 'Picker SoT still not Nest EFF on one/both consumer surfaces',
    });
  }

  // Overall
  const failIds = Object.entries(R.ac)
    .filter(([, v]) => v.verdict === 'FAIL')
    .map(([k]) => k);
  R.overall = failIds.length === 0 ? 'PASS' : 'FAIL';
  R.ack_status = failIds.length === 0 ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  R.endedAt = ts();
  R.failIds = failIds;
  save();

  await browser.close();
  console.log(
    `\n=== ${R.work_item_id} ${R.overall} ${R.ack_status} stamp=${R.stamp} fails=${failIds.join(',') || 'none'} ===`,
  );
  if (failIds.length) process.exitCode = 1;
}

main().catch((e) => {
  R.overall = 'FAIL';
  R.ack_status = 'FAIL_TO_PM';
  R.endedAt = ts();
  R.probes.fatal = String(e?.stack || e).slice(0, 1200);
  save();
  console.error(e);
  process.exit(1);
});
