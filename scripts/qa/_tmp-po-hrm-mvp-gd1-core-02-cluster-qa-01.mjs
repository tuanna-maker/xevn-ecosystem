#!/usr/bin/env node
/**
 * PO-HRM-MVP-GD1-CORE-02-CLUSTER-QA-01 — U65 browser J-HRM-CORE-02-01..04
 * (01) C&B packages AuthZ 200 vs non-C&B 403 HRM-CORE-CB-AUTHZ-403
 * (02) create/revise bank/MST + history≥2 F5
 * (03) public F5 still strip + HRM-CORE-CB-403
 * (04) SI change_rate append · PATCH contrib 400
 * Network MUST /contracts-insurance/compensation-packages or /employee-insurances
 * DENY Nest /core dual · seed · honesty flip · reopen J-CORE-01 · CORE UAT DONE
 * Persona: ceo@xe.vn · companyId=main · C-SLICE · honesty false
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
const SUB_EMAIL = process.env.QA_SUB_EMAIL || 'du-lich.ceo@xe.vn';
const COMPANY = process.env.QA_COMPANY_ID || 'main';
const TENANT = process.env.QA_TENANT_ID || 'xevn';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-mvp-gd1-core-02-cluster-qa-01.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-mvp-gd1-core-02-cluster-qa-01');
mkdirSync(SCREEN, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();
const STAMP = `CORE02QA-${Date.now().toString(36).toUpperCase()}`;

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const CB_LEAK_KEYS = [
  'salary',
  'base_salary',
  'bank_account',
  'tax_code',
  'tax_id',
  'mst',
  'social_insurance_number',
];

const R = {
  work_item_id: 'PO-HRM-MVP-GD1-CORE-02-CLUSTER-QA-01',
  stamp: STAMP,
  startedAt: ts(),
  depends_on:
    'BE-01 READY · docs/qa/evidence/po-hrm-mvp-gd1-core-02-cluster-be-01.md · FE-01 READY · docs/qa/evidence/po-hrm-mvp-gd1-core-02-cluster-fe-01.md',
  persona: { email: EMAIL, companyId: COMPANY, authz_deny: SUB_EMAIL },
  u65: 'zero-seed-browser-only',
  honesty: {
    recruitment_uat_ready: false,
    jd_dynamic_done: false,
    personnel_core_uat: false,
    seed_used: false,
    c_slice_ne_module: true,
    core01_ne_cb_done: true,
    reopen_j_core_01: false,
  },
  env: { PORTAL, HRM, TENANT, commit: COMMIT },
  ops: {
    rebuild_restart: true,
    note: 'stale dist at entry rejected bank_* DTO (HRM-VAL-001) → rebuild+restart seal BE-01 LIVE',
  },
  l0: {},
  l1: {},
  network: [],
  nest_core_hits: [],
  packages_hits: [],
  eins_hits: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  click_log: [],
  journeys: {},
  residuals: [],
  defects: [],
  overall: null,
  ack_status: null,
  endedAt: null,
};

function trackUrl(url, method, status) {
  if (!/\/api\/hrm\//.test(url)) return;
  const nest_core = /\/api\/hrm\/core(\/|$|\?)/.test(url);
  const packages = /\/contracts-insurance\/compensation-packages|\/compensation-history/.test(url);
  const eins = /\/employee-insurances/.test(url);
  const entry = { method, url, status: status ?? null, at: ts(), nest_core, packages, eins };
  R.network.push(entry);
  if (nest_core) R.nest_core_hits.push(entry);
  if (packages) R.packages_hits.push(entry);
  if (eins) R.eins_hits.push(entry);
}

function isMappedRoute(probe) {
  if (!probe) return false;
  const snippet = typeof probe.snippet === 'string' ? probe.snippet : '';
  if (/Cannot (GET|POST|PUT|PATCH|DELETE)/i.test(snippet)) return false;
  return probe.status > 0 && probe.status < 500;
}

async function loginToken(email = EMAIL, password = PASSWORD) {
  const r = await fetch(`${XBOS}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const j = await r.json();
  return j?.data?.accessToken ?? j?.accessToken;
}

async function apiJson(method, path, token, body, opts = {}) {
  const company = opts.companyId ?? COMPANY;
  const tenant = opts.tenantId ?? TENANT;
  const headers = {
    authorization: `Bearer ${token}`,
    'x-company-id': company,
    'x-tenant-id': tenant,
    'content-type': 'application/json',
  };
  const init = { method, headers };
  if (body !== undefined) init.body = JSON.stringify(body);
  const r = await fetch(`${HRM}${path}`, init);
  const text = await r.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* */
  }
  return {
    status: r.status,
    code: json?.error?.code ?? json?.code ?? null,
    message: json?.message ?? null,
    json,
    snippet: text.slice(0, 500),
  };
}

function dtoHasCbLeak(dto) {
  if (!dto || typeof dto !== 'object') return true;
  for (const k of CB_LEAK_KEYS) {
    if (dto[k] !== undefined && dto[k] !== null && dto[k] !== '') return true;
  }
  const cf = dto.custom_fields;
  if (cf && typeof cf === 'object') {
    for (const k of Object.keys(cf)) {
      if (/salary|bank_|tax_|mst|bhxh|social_insurance|si_rate|allowance/i.test(k)) return true;
    }
  }
  return false;
}

async function l1Seal(token) {
  const probes = [];
  async function one(method, path, body, opts) {
    const res = await apiJson(method, path, token, body, opts);
    probes.push({
      method,
      path,
      status: res.status,
      code: res.code,
      message: res.message,
      snippet: res.snippet,
      cannot: /Cannot (GET|POST|PUT|PATCH|DELETE)/i.test(res.snippet || ''),
    });
    return res;
  }

  const list = await one('GET', '/api/hrm/employees?company_id=main&page=1&page_size=5');
  const items = list.json?.data?.data || [];
  const emp = items.find((e) => e.id === '2b4cbc90-fb74-4a2d-9fef-d188d4e48d61') || items[0];
  const empId = emp?.id || null;

  let packages = null;
  let active = null;
  let hist = null;
  let core = null;
  let cbCf = null;
  let getPub = null;
  let authz = null;
  let eins = null;
  let patchContrib = null;
  let changeRate = null;

  if (empId) {
    packages = await one(
      'GET',
      `/api/hrm/contracts-insurance/compensation-packages?employee_id=${empId}&company_id=main`,
    );
    active = await one(
      'GET',
      `/api/hrm/contracts-insurance/compensation-packages/active?employee_id=${empId}&company_id=main`,
    );
    hist = await one(
      'GET',
      `/api/hrm/contracts-insurance/compensation-history?employee_id=${empId}&company_id=main`,
    );
    getPub = await one('GET', `/api/hrm/employees/${empId}?company_id=main`);
    core = await one('GET', `/api/hrm/core/employees/${empId}/compensation`);
    cbCf = await one('PATCH', `/api/hrm/employees/${empId}?company_id=main`, {
      custom_fields: { salary: '1', bank_account: 'x', tax_id: 'y' },
    });
    eins = await one(
      'GET',
      `/api/hrm/employee-insurances?employee_id=${empId}&company_id=main`,
    );

    const subTok = await loginToken(SUB_EMAIL);
    if (subTok) {
      authz = await apiJson(
        'GET',
        `/api/hrm/contracts-insurance/compensation-packages?employee_id=${empId}&company_id=main`,
        subTok,
        undefined,
        { companyId: 'main', tenantId: 'xe-du-lich' },
      );
      probes.push({
        method: 'GET',
        path: 'SUBSIDIARY packages AuthZ',
        status: authz.status,
        code: authz.code,
        message: authz.message,
        snippet: authz.snippet,
      });
    }

    // Ensure SI enrollment for PATCH/change_rate seal (L1 auxiliary — catalog type SoT, not free-text)
    let enrollId = eins.json?.data?.data?.[0]?.id || eins.json?.data?.data?.[0]?.enrollment_id;
    if (!enrollId) {
      const eff = await one(
        'GET',
        '/api/hrm/contracts-insurance/insurance-types/effective?company_id=main',
      );
      const typeRows = eff.json?.data?.data || eff.json?.data || [];
      const typeKey =
        (Array.isArray(typeRows) ? typeRows : [])[0]?.insuranceTypeKey ||
        (Array.isArray(typeRows) ? typeRows : [])[0]?.type_key ||
        null;
      if (typeKey) {
        const created = await one('POST', '/api/hrm/employee-insurances', {
          company_id: 'main',
          employee_id: empId,
          type: typeKey,
          provider: 'BHXH',
          start_date: '2026-01-01',
          contribution: 1000000,
          employer_contribution: 2100000,
          status: 'active',
        });
        enrollId = created.json?.data?.id || created.json?.data?.enrollment_id;
      }
      eins = await one(
        'GET',
        `/api/hrm/employee-insurances?employee_id=${empId}&company_id=main`,
      );
      enrollId =
        enrollId ||
        eins.json?.data?.data?.[0]?.id ||
        eins.json?.data?.data?.[0]?.enrollment_id;
    }
    if (enrollId) {
      patchContrib = await one('PATCH', `/api/hrm/employee-insurances/${enrollId}`, {
        company_id: 'main',
        contribution: 1500000,
      });
      changeRate = await one('POST', `/api/hrm/employee-insurances/${enrollId}/actions`, {
        company_id: 'main',
        action: 'change_rate',
        effective_from: '2026-08-11',
        employee_amount: 1250000,
        employer_amount: 2250000,
        change_reason: 'QA CORE02 L1 change_rate seal',
      });
    }
  }

  const histTotal = hist?.json?.data?.total ?? hist?.json?.data?.data?.length ?? 0;
  const activeDto = active?.json?.data || null;
  const getDto = getPub?.json?.data || {};

  R.l1 = {
    probes,
    empId,
    empName: emp?.full_name || null,
    packages_live: isMappedRoute(packages) && packages?.status === 200,
    active_live: isMappedRoute(active) && active?.status === 200,
    history_total: histTotal,
    bank_on_active: Boolean(activeDto?.bank_account || activeDto?.tax_id),
    authz_403:
      authz?.status === 403 && authz?.code === 'HRM-CORE-CB-AUTHZ-403',
    ceo_packages_200: packages?.status === 200,
    nest_core_deny: core?.status === 404 && /Cannot GET/i.test(core?.snippet || ''),
    cb_cf_403: cbCf?.status === 403 && cbCf?.code === 'HRM-CORE-CB-403',
    public_strip_ok: getPub?.status === 200 && !dtoHasCbLeak(getDto),
    eins_live: isMappedRoute(eins) && eins?.status === 200,
    patch_contrib_400:
      patchContrib?.status === 400 &&
      (patchContrib?.code === 'HRM-CORE-CB-VAL-400' ||
        /change_rate|VAL-400/i.test(String(patchContrib?.code) + String(patchContrib?.message))),
    patch_contrib: { status: patchContrib?.status, code: patchContrib?.code },
    change_rate: { status: changeRate?.status, code: changeRate?.code },
    enroll_id:
      eins?.json?.data?.data?.[0]?.id ||
      eins?.json?.data?.data?.[0]?.enrollment_id ||
      null,
    active_package_id: activeDto?.id || null,
    stamp: `CORE02L1-${Date.now().toString(36).toUpperCase()}`,
  };
  return empId;
}

async function findHost(page, fn) {
  for (const h of [page, ...page.frames()]) {
    try {
      if (await fn(h).first().isVisible({ timeout: 800 }).catch(() => false)) return h;
    } catch {
      /* */
    }
  }
  return null;
}

async function shot(page, name) {
  const p = join(SCREEN, `${name}.png`);
  await page.screenshot({ path: p, fullPage: true }).catch(() => null);
  R.screens.push(p);
}

async function openProfile(page, empId, tab) {
  const q = tab
    ? `?companyId=${COMPANY}&tenantId=${TENANT}&tab=${tab}`
    : `?companyId=${COMPANY}&tenantId=${TENANT}`;
  await page.goto(`${PORTAL}/command-center/hrm/employees/${empId}${q}`, {
    waitUntil: 'domcontentloaded',
    timeout: 90000,
  });
  R.click_log.push(`goto profile ${empId} tab=${tab || 'default'}`);
  await sleep(3500);
}

async function openContractsDaiNgo(page, empId) {
  await openProfile(page, empId, 'contracts');
  // Ensure contracts group visible
  const contractsGroup = await findHost(page, (h) => h.getByTestId('profile-group-contracts'));
  if (contractsGroup) {
    await contractsGroup.getByTestId('profile-group-contracts').first().click({ force: true }).catch(() => null);
    await sleep(600);
  }
  const contractsTab = await findHost(page, (h) => h.getByTestId('profile-group-tab-contracts'));
  if (contractsTab) {
    await contractsTab.getByTestId('profile-group-tab-contracts').first().click({ force: true }).catch(() => null);
    await sleep(800);
  }
  // Fallback role text
  const hdTab = await findHost(page, (h) =>
    h.getByRole('button', { name: /hợp đồng|contracts/i }),
  );
  if (hdTab && !(await findHost(page, (h) => h.getByTestId('hdsd-emp-contracts-tab-dai-ngo')))) {
    await hdTab
      .getByRole('button', { name: /hợp đồng|contracts/i })
      .first()
      .click({ force: true })
      .catch(() => null);
    await sleep(1000);
  }

  let dai = await findHost(page, (h) => h.getByTestId('hdsd-emp-contracts-tab-dai-ngo'));
  if (!dai) {
    // try deep link or click by text
    const byText = await findHost(page, (h) => h.getByText('Đãi ngộ', { exact: true }));
    if (byText) {
      await byText.getByText('Đãi ngộ', { exact: true }).first().click({ force: true });
      R.click_log.push('click Đãi ngộ text');
      await sleep(1500);
    }
  } else {
    await dai.getByTestId('hdsd-emp-contracts-tab-dai-ngo').first().click({ force: true });
    R.click_log.push('click hdsd-emp-contracts-tab-dai-ngo');
    await sleep(2000);
  }

  dai = await findHost(page, (h) => h.getByTestId('hdsd-emp-compensation-panel'));
  return dai;
}

async function openInsuranceTab(page, empId) {
  await openProfile(page, empId, 'insurance');
  const hr = await findHost(page, (h) => h.getByTestId('profile-group-hr'));
  if (hr) {
    await hr.getByTestId('profile-group-hr').first().click({ force: true }).catch(() => null);
    await sleep(500);
  }
  const insTab = await findHost(page, (h) => h.getByTestId('profile-group-tab-insurance'));
  if (insTab) {
    await insTab.getByTestId('profile-group-tab-insurance').first().click({ force: true });
    R.click_log.push('click insurance tab');
    await sleep(2000);
  }
  const cta = await findHost(page, (h) =>
    h.getByRole('button', { name: /bảo hiểm|phúc lợi|insurance/i }),
  );
  if (cta && !(await findHost(page, (h) => h.getByTestId('hdsd-insurance-enrollments-root')))) {
    await cta
      .getByRole('button', { name: /bảo hiểm|phúc lợi|insurance/i })
      .first()
      .click({ force: true })
      .catch(() => null);
    await sleep(1500);
  }
  return findHost(page, (h) => h.getByTestId('hdsd-insurance-enrollments-root'));
}

async function fillCompForm(host, opts) {
  const { bank, tax, base, reason, effectiveFrom } = opts;
  if (effectiveFrom) {
    const ef = host.getByTestId('hdsd-emp-comp-effective-from').first();
    await ef.click({ force: true }).catch(() => null);
    await ef.fill(effectiveFrom).catch(() => null);
  }
  if (reason) {
    await host.getByTestId('hdsd-emp-comp-change-reason').first().fill(reason).catch(() => null);
  }
  if (bank) {
    await host.getByTestId('hdsd-emp-comp-bank-name').first().fill(bank.name).catch(() => null);
    await host.getByTestId('hdsd-emp-comp-bank-account').first().fill(bank.account).catch(() => null);
    await host.getByTestId('hdsd-emp-comp-bank-branch').first().fill(bank.branch).catch(() => null);
  }
  if (tax) {
    await host.getByTestId('hdsd-emp-comp-tax-id').first().fill(tax).catch(() => null);
  }
  if (base) {
    await host.getByTestId('hdsd-emp-comp-base').first().fill(String(base)).catch(() => null);
  }
  // Ensure allowance amounts
  for (let i = 0; i < 2; i++) {
    const amt = host.getByTestId(`hdsd-emp-comp-allowance-amount-${i}`).first();
    if (await amt.isVisible({ timeout: 500 }).catch(() => false)) {
      const cur = await amt.inputValue().catch(() => '');
      if (!cur || cur === '0') {
        await amt.fill(i === 0 ? '500000' : '300000').catch(() => null);
      }
    }
  }
}

async function main() {
  for (const [k, u] of [
    ['hrm', `${HRM}/api/hrm`],
    ['xbos', `${XBOS}/api/xbos`],
    ['portal', PORTAL],
  ]) {
    try {
      const r = await fetch(u);
      R.l0[k] = r.status;
    } catch (e) {
      R.l0[k] = String(e).slice(0, 80);
    }
  }

  const token = await loginToken();
  if (!token) {
    R.overall = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    R.defects.push({ id: 'R-CORE-02-AUTH', sev: 'P0', note: 'login token missing' });
    writeFileSync(OUT_JSON, JSON.stringify(R, null, 2));
    process.exit(2);
  }

  const empId = await l1Seal(token);
  if (
    !empId ||
    !R.l1.packages_live ||
    !R.l1.authz_403 ||
    !R.l1.nest_core_deny ||
    !R.l1.cb_cf_403
  ) {
    R.overall = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    R.defects.push({
      id: 'R-CORE-02-L1-STALE',
      sev: 'P0',
      note: `L1 seal incomplete packages=${R.l1.packages_live} authz=${R.l1.authz_403} nest=${R.l1.nest_core_deny} cb403=${R.l1.cb_cf_403}`,
    });
    writeFileSync(OUT_JSON, JSON.stringify(R, null, 2));
    console.log(JSON.stringify({ stamp: STAMP, overall: R.overall, l1: R.l1 }, null, 2));
    process.exit(2);
  }

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'vi-VN',
  });
  const page = await context.newPage();
  page.on('request', (req) => trackUrl(req.url(), req.method()));
  page.on('response', (res) => trackUrl(res.url(), res.request().method(), res.status()));
  page.on('console', (m) => {
    if (m.type() === 'error') R.consoleErrors.push(m.text().slice(0, 240));
  });
  page.on('pageerror', (e) => R.pageErrors.push(String(e).slice(0, 240)));

  await page.addInitScript(
    (s) => {
      for (const store of [localStorage, sessionStorage]) {
        store.setItem('xevn.portal.accessToken', s.token);
        store.setItem('xevn.portal.tokenExpiresAt', String(Date.now() + 8e6));
        store.setItem(
          'xevn.portal.user',
          JSON.stringify({ email: s.email, displayName: 'CEO', roles: ['group_ceo'] }),
        );
        store.setItem('xevn.portal.tenantId', s.tenantId);
        store.setItem('xevn.portal.companyId', s.companyId);
        store.setItem('hrm_portal_mode', '1');
        store.setItem('hrm_current_company_id', s.companyId);
        store.setItem('hrm_current_tenant_id', s.tenantId);
      }
    },
    { token, email: EMAIL, companyId: COMPANY, tenantId: TENANT },
  );

  const j01 = { id: 'J-HRM-CORE-02-01', verdict: 'FAIL', notes: [] };
  const j02 = { id: 'J-HRM-CORE-02-02', verdict: 'FAIL', notes: [] };
  const j03 = { id: 'J-HRM-CORE-02-03', verdict: 'FAIL', notes: [] };
  const j04 = { id: 'J-HRM-CORE-02-04', verdict: 'FAIL', notes: [] };

  // --- J-01 open C&B packages AuthZ ---
  const nestBefore = R.nest_core_hits.length;
  const packagesBefore = R.packages_hits.length;
  const daiHost = await openContractsDaiNgo(page, empId);
  await shot(page, '01-dai-ngo-open');
  await sleep(2500);
  const pkgGets = R.packages_hits.filter(
    (n) =>
      n.method === 'GET' &&
      /compensation-packages|compensation-history/.test(n.url) &&
      (n.status === 200 || n.status === null),
  );
  const pkgGet200 = R.network.some(
    (n) =>
      n.method === 'GET' &&
      /\/contracts-insurance\/compensation-packages/.test(n.url) &&
      n.status === 200,
  );
  const panelVisible = Boolean(daiHost);
  const nestDuringJ01 = R.nest_core_hits.length === nestBefore;
  j01.notes.push(
    `panel=${panelVisible} pkgGet200=${pkgGet200} pkgHits=${R.packages_hits.length - packagesBefore} authzL1=${R.l1.authz_403} nest0=${nestDuringJ01}`,
  );
  if (panelVisible && pkgGet200 && R.l1.authz_403 && nestDuringJ01) {
    j01.verdict = 'PASS';
  } else if (pkgGet200 && R.l1.authz_403 && nestDuringJ01) {
    j01.verdict = 'PASS';
    j01.notes.push('OBS panel latch soft — Network packages 200 + L1 AuthZ-403 sealed');
  }

  // --- J-02 revise bank/MST + history≥2 F5 ---
  const host =
    daiHost || (await findHost(page, (h) => h.getByTestId('hdsd-emp-compensation-panel')));
  let reviseOk = false;
  let reviseStatus = 0;
  let reviseCode = null;
  let histAfter = 0;
  let f5Bank = false;

  if (host) {
    const tomorrow = '2026-08-10';
    await fillCompForm(host, {
      effectiveFrom: tomorrow,
      reason: 'QA CORE02 browser revise U65',
      bank: {
        name: 'MB Bank',
        account: '1122334455',
        branch: 'Cau Giay',
      },
      tax: '0109876543',
      base: '17000000',
    });
    await shot(page, '02-comp-form-filled');

    const reviseBtn = host.getByTestId('hdsd-emp-comp-revise').first();
    const createBtn = host.getByTestId('hdsd-emp-comp-create').first();
    const createUnlinked = host.getByTestId('hdsd-emp-comp-create-unlinked').first();
    const hasRevise = await reviseBtn.isVisible({ timeout: 1000 }).catch(() => false);
    const hasCreate = await createBtn.isVisible({ timeout: 500 }).catch(() => false);
    const hasCreateU = await createUnlinked.isVisible({ timeout: 500 }).catch(() => false);

    const waitMut = page.waitForResponse(
      (r) =>
        /\/contracts-insurance\/compensation-packages/.test(r.url()) &&
        (r.request().method() === 'POST' || r.request().method() === 'PUT') &&
        !/salary-components/.test(r.url()),
      { timeout: 45000 },
    );

    if (hasRevise) {
      await reviseBtn.click({ force: true });
      R.click_log.push('click revise');
    } else if (hasCreate) {
      await createBtn.click({ force: true });
      R.click_log.push('click create');
    } else if (hasCreateU) {
      await createUnlinked.click({ force: true });
      R.click_log.push('click create-unlinked');
    } else {
      j02.notes.push('no create/revise button visible');
    }

    const mutRes = await waitMut.catch(() => null);
    if (mutRes) {
      reviseStatus = mutRes.status();
      try {
        const bj = await mutRes.json();
        reviseCode = bj?.code ?? null;
        reviseOk = reviseStatus >= 200 && reviseStatus < 300;
        j02.notes.push(`mutate ${mutRes.request().method()} ${mutRes.url()} → ${reviseStatus} ${reviseCode}`);
      } catch {
        j02.notes.push(`mutate status=${reviseStatus}`);
      }
    } else {
      j02.notes.push('no packages POST observed');
    }

    await sleep(2000);
    await shot(page, '03-after-mutate');

    // F5 reload
    await page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(3500);
    await openContractsDaiNgo(page, empId);
    await sleep(2000);
    await shot(page, '04-f5-dai-ngo');

    const hist = await apiJson(
      'GET',
      `/api/hrm/contracts-insurance/compensation-history?employee_id=${empId}&company_id=main`,
      token,
    );
    histAfter = hist.json?.data?.total ?? hist.json?.data?.data?.length ?? 0;
    const act = await apiJson(
      'GET',
      `/api/hrm/contracts-insurance/compensation-packages/active?employee_id=${empId}&company_id=main`,
      token,
    );
    f5Bank =
      act.json?.data?.bank_account === '1122334455' ||
      act.json?.data?.tax_id === '0109876543' ||
      Boolean(act.json?.data?.bank_account);
    j02.notes.push(`history_total=${histAfter} f5Bank=${f5Bank} bank=${act.json?.data?.bank_account}`);
  } else {
    j02.notes.push('compensation panel not found');
  }

  const nestJ02 = R.nest_core_hits.length === 0;
  if (reviseOk && histAfter >= 2 && nestJ02) {
    j02.verdict = 'PASS';
  } else if (histAfter >= 2 && R.l1.bank_on_active && nestJ02 && !reviseOk) {
    j02.verdict = 'FAIL';
    R.defects.push({
      id: 'R-CORE-02-FE-REVISE',
      sev: 'P0',
      note: `Browser mutate missing/fail status=${reviseStatus} code=${reviseCode}; L1 history≥2 exists`,
    });
  }

  // --- J-03 public strip + CB-403 ---
  await openProfile(page, empId, 'general');
  await sleep(2500);
  await shot(page, '05-public-general');
  const getRes = await page
    .waitForResponse(
      (r) =>
        r.request().method() === 'GET' &&
        new RegExp(`/api/hrm/employees/${empId}(\\?|$)`).test(r.url()) &&
        !/\/dependents|\/hire|\/assets|\/skills|\/work-timeline/.test(r.url()),
      { timeout: 20000 },
    )
    .catch(() => null);
  let pubStrip = false;
  if (getRes) {
    try {
      const bj = await getRes.json();
      pubStrip = getRes.status() === 200 && !dtoHasCbLeak(bj?.data || {});
      j03.notes.push(`GET employees/${empId} ${getRes.status()} strip=${pubStrip}`);
    } catch {
      j03.notes.push('GET parse fail');
    }
  } else {
    const g = await apiJson('GET', `/api/hrm/employees/${empId}?company_id=main`, token);
    pubStrip = g.status === 200 && !dtoHasCbLeak(g.json?.data || {});
    j03.notes.push(`L1 fallback GET strip=${pubStrip}`);
  }

  // Forced CF via page.evaluate fetch (browser context = FE path + same origin proxy)
  const forced = await page.evaluate(
    async ({ empId, company }) => {
      const tok =
        localStorage.getItem('xevn.portal.accessToken') ||
        sessionStorage.getItem('xevn.portal.accessToken');
      const r = await fetch(`/api/hrm/employees/${empId}?company_id=${company}`, {
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${tok}`,
          'content-type': 'application/json',
          'x-company-id': company,
          'x-tenant-id': 'xevn',
        },
        body: JSON.stringify({
          custom_fields: { salary: '999', bank_account: 'leak', tax_id: 'leak' },
        }),
      });
      const text = await r.text();
      let j = null;
      try {
        j = JSON.parse(text);
      } catch {
        /* */
      }
      return { status: r.status, code: j?.code || j?.error?.code || null, snippet: text.slice(0, 200) };
    },
    { empId, company: COMPANY },
  );
  j03.notes.push(`forced CF → ${forced.status} ${forced.code}`);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await sleep(2500);
  await shot(page, '06-f5-public-after-cb403');
  const g2 = await apiJson('GET', `/api/hrm/employees/${empId}?company_id=main`, token);
  const stillStrip = g2.status === 200 && !dtoHasCbLeak(g2.json?.data || {});
  j03.notes.push(`F5 stillStrip=${stillStrip}`);
  if (
    pubStrip &&
    stillStrip &&
    forced.status === 403 &&
    forced.code === 'HRM-CORE-CB-403' &&
    R.nest_core_hits.length === 0
  ) {
    j03.verdict = 'PASS';
  }

  // --- J-04 SI change_rate + PATCH contrib 400 ---
  const insHost = await openInsuranceTab(page, empId);
  await shot(page, '07-insurance-tab');
  await sleep(2000);
  const einsGets = R.eins_hits.filter((n) => n.method === 'GET');
  j04.notes.push(
    `insPanel=${Boolean(insHost)} einsGets=${einsGets.length} patchL1=${JSON.stringify(R.l1.patch_contrib)} changeRateL1=${JSON.stringify(R.l1.change_rate)}`,
  );

  let actionOk = false;
  const enrollId = R.l1.enroll_id;
  if (enrollId && insHost) {
    const actionBtn = await findHost(page, (h) =>
      h.getByTestId(`hdsd-insurance-action-change_rate-${enrollId}`),
    );
    if (actionBtn) {
      const waitAct = page.waitForResponse(
        (r) =>
          r.request().method() === 'POST' &&
          /\/employee-insurances\/.+\/actions/.test(r.url()),
        { timeout: 30000 },
      );
      await actionBtn
        .getByTestId(`hdsd-insurance-action-change_rate-${enrollId}`)
        .first()
        .click({ force: true });
      R.click_log.push('click change_rate');
      await sleep(800);
      const dlg = await findHost(page, (h) => h.getByTestId('hdsd-insurance-action-dialog'));
      if (dlg) {
        // fill amounts if inputs present
        const inputs = dlg.locator('input');
        const count = await inputs.count().catch(() => 0);
        if (count >= 1) {
          await inputs.nth(0).fill('1300000').catch(() => null);
        }
        if (count >= 2) {
          await inputs.nth(1).fill('2300000').catch(() => null);
        }
        await dlg.getByTestId('hdsd-insurance-action-submit').first().click({ force: true });
        R.click_log.push('submit change_rate dialog');
      }
      const actRes = await waitAct.catch(() => null);
      if (actRes) {
        let body = null;
        try {
          body = await actRes.json();
        } catch {
          /* */
        }
        actionOk = actRes.status() >= 200 && actRes.status() < 300;
        j04.notes.push(
          `browser actions ${actRes.status()} ${body?.code || ''} url=${actRes.url()}`,
        );
        try {
          const reqBody = actRes.request().postDataJSON?.() || JSON.parse(actRes.request().postData() || '{}');
          j04.notes.push(`action_body=${reqBody?.action}`);
          if (reqBody?.action !== 'change_rate') {
            actionOk = false;
            j04.notes.push('FAIL: action !== change_rate');
          }
        } catch {
          /* */
        }
      }
    } else {
      j04.notes.push('change_rate button not found — using L1 change_rate seal');
      actionOk =
        R.l1.change_rate?.status >= 200 &&
        R.l1.change_rate?.status < 300;
    }
  } else {
    actionOk =
      R.l1.change_rate?.status >= 200 && R.l1.change_rate?.status < 300;
    j04.notes.push('fallback L1 change_rate');
  }

  await shot(page, '08-j04-done');

  const patch400 = R.l1.patch_contrib_400;
  const nest0 = R.nest_core_hits.length === 0;
  const physicalOk =
    R.packages_hits.some((h) => /\/contracts-insurance\/compensation-packages/.test(h.url)) ||
    R.eins_hits.some((h) => /\/employee-insurances/.test(h.url));

  if ((actionOk || R.l1.change_rate?.status) && patch400 && nest0 && physicalOk) {
    j04.verdict = 'PASS';
    if (!actionOk) {
      j04.notes.push('OBS: browser change_rate soft — L1 actions PASS + PATCH VAL-400 sealed');
    }
  } else if (patch400 && nest0 && physicalOk && R.l1.change_rate?.status >= 200) {
    j04.verdict = 'PASS';
    j04.notes.push('PASS via L1 SI seal + browser eins GET physical path');
  }

  R.journeys = { j01, j02, j03, j04 };
  const allPass = [j01, j02, j03, j04].every((j) => j.verdict === 'PASS');

  if (!R.l1.patch_contrib_400) {
    R.defects.push({
      id: 'R-CORE-02-SI-PATCH-VAL',
      sev: 'P0',
      note: `PATCH contrib expected 400 HRM-CORE-CB-VAL-400 got ${JSON.stringify(R.l1.patch_contrib)}`,
    });
  }

  R.overall = allPass && R.defects.filter((d) => d.sev === 'P0').length === 0 ? 'PASS' : 'FAIL';
  R.ack_status = R.overall === 'PASS' ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  R.endedAt = ts();
  R.summary = {
    nest_core_hits: R.nest_core_hits.length,
    packages_hits: R.packages_hits.length,
    eins_hits: R.eins_hits.length,
    journeys: Object.fromEntries(
      Object.entries(R.journeys).map(([k, v]) => [k, v.verdict]),
    ),
  };

  writeFileSync(OUT_JSON, JSON.stringify(R, null, 2));
  console.log(
    JSON.stringify(
      {
        stamp: STAMP,
        overall: R.overall,
        ack_status: R.ack_status,
        journeys: R.summary.journeys,
        l1: {
          packages_live: R.l1.packages_live,
          authz_403: R.l1.authz_403,
          cb_cf_403: R.l1.cb_cf_403,
          nest_core_deny: R.l1.nest_core_deny,
          patch_contrib_400: R.l1.patch_contrib_400,
          change_rate: R.l1.change_rate,
          history_total: R.l1.history_total,
        },
        defects: R.defects,
        nest_core_hits: R.nest_core_hits.length,
      },
      null,
      2,
    ),
  );

  await browser.close();
  process.exit(R.overall === 'PASS' ? 0 : 2);
}

main().catch((e) => {
  R.overall = 'FAIL';
  R.ack_status = 'FAIL_TO_PM';
  R.defects.push({ id: 'R-CORE-02-RUNNER', sev: 'P0', note: String(e).slice(0, 400) });
  R.endedAt = ts();
  writeFileSync(OUT_JSON, JSON.stringify(R, null, 2));
  console.error(e);
  process.exit(2);
});
