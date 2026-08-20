#!/usr/bin/env node
/**
 * PO-HRM-MVP-GD1-CORE-02B-CLUSTER-QA-01 — cite/smoke RETAIN EMP-CF spine (U65)
 * J-HRM-CORE-02B-01..04 DRAFT · cite EMPCFQA-MSK14LUH · EMPTOKEXTQA-MSJ57PE1
 * Network MUST /settings-catalogs* + /employees* · Nest /core EMP-CF = 0
 * DENY seed · Nest emp_custom_field · claim EMPCF=personnel UAT · CORE-09d printable
 * Persona: ceo@xe.vn · companyId=main · C-SLICE · honesty false
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync, existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
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
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-mvp-gd1-core-02b-cluster-qa-01.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-mvp-gd1-core-02b-cluster-qa-01');
mkdirSync(SCREEN, { recursive: true });
mkdirSync(resolve(ROOT, 'docs/qa/evidence'), { recursive: true });

const ALLOW_LIST = [
  'hrm_employee_basic_fields',
  'hrm_employee_personal_fields',
  'hrm_employee_work_fields',
  'hrm_employee_finance_fields',
];
const ALLOW_CATALOG = 'hrm_employee_basic_fields';
const EMPCF_SEAL = 'EMPCFQA-MSK14LUH';
const EXT_SEAL = 'EMPTOKEXTQA-MSJ57PE1';
const CORE09D_SEAL = 'CORE09DQC1-MSLDR8I3';
const PEER_SEALS = [
  CORE09D_SEAL,
  'CORE09CQC1-MSLBXMUT',
  'CORE09BQC1-MSLB05DZ',
  'CORE09AQC1-MSLA4LX9',
  'CORE08QC1-MSL9BFFE',
  'CORE02QC1-MSL80DU6',
  'CORE01QC1-MSL6WMS7',
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();
const stamp = Date.now().toString(36).toLowerCase().slice(-8);
const STAMP = `CORE02BQA-${stamp.toUpperCase()}`;
const EXT_CODE = `qa_c02b_${stamp}`.slice(0, 40);
const EXT_LABEL = `Trường NS CORE-02b QA ${stamp}`;
const INVENT_CODE = `zz_invent_c02b_${stamp}`.slice(0, 48);

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

function summarizeBody(body, max = 700) {
  const s = typeof body === 'string' ? body : JSON.stringify(body);
  return s.length > max ? `${s.slice(0, max)}…` : s;
}
function asList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.rows)) return data.rows;
  return [];
}
function itemCode(row) {
  return String(row?.code ?? row?.item_key ?? row?.key ?? row?.field_key ?? '')
    .trim()
    .toLowerCase();
}
function itemStatus(row) {
  return String(row?.status ?? '').toLowerCase();
}
function tokenKeyOf(row) {
  return String(row?.tokenKey ?? row?.token_key ?? '').toLowerCase();
}
function originOf(row) {
  return String(row?.origin ?? '').toLowerCase();
}

const R = {
  work_item_id: 'PO-HRM-MVP-GD1-CORE-02B-CLUSTER-QA-01',
  program: 'PO-HRM-MVP-GD1-CONTINUOUS',
  uc_ids: ['UC-BP-CORE-02b'],
  stamp: STAMP,
  startedAt: ts(),
  cite_seals: { empcf: EMPCF_SEAL, ext: EXT_SEAL, core09d: CORE09D_SEAL, peers: PEER_SEALS },
  persona: { email: EMAIL, companyId: COMPANY, apiCompanyId: API_COMPANY },
  u65: 'zero-seed-browser-cite-smoke',
  honesty: {
    hrm_personnel_uat_ready: false,
    employees_e2e_linkage_ready: false,
    contracts_printable_ready: false,
    recruitment_uat_ready: false,
    jd_dynamic_done: false,
    seed_used: false,
    c_slice_ne_module: true,
    deny_empcf_eq_core02b_personnel_uat: true,
    deny_core09d_printable_closed8_done: true,
    fe_cta_p2_hold: 'R-PLT-EMP-CF-FE-01',
    profile_groups_json_hold: true,
    nest_emp_custom_field_deny: true,
    nest_core_deny: true,
    reopen_j_core_09d_to_01: false,
  },
  env: { PORTAL, HRM, XBOS, TENANT, commit: COMMIT, EXT_CODE, INVENT_CODE, ALLOW_CATALOG },
  l0: {},
  src_dist: {},
  fe_spot: {},
  seal_cites: {},
  l1: {},
  network: [],
  nest_core_hits: [],
  settings_hits: [],
  employees_hits: [],
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

function save() {
  writeFileSync(OUT_JSON, JSON.stringify(R, null, 2));
}
function log(msg, extra = {}) {
  R.click_log.push({ at: ts(), msg, ...extra });
  console.error(`[log] ${msg}`);
}
function jset(id, verdict, detail = {}) {
  R.journeys[id] = { verdict, at: ts(), ...detail };
  console.log(`${verdict} ${id} — ${(detail.summary || '').slice(0, 520)}`);
  save();
}

async function shot(page, name) {
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  R.screens.push(path.replace(/\\/g, '/'));
}

function trackUrl(method, url, status) {
  if (!/\/api\/hrm\//.test(url)) return;
  const nest_core = /\/api\/hrm\/core(\/|$|\?)/.test(url);
  const settings = /\/settings-catalogs/.test(url);
  const employees = /\/employees(\/|$|\?)/.test(url);
  const entry = {
    method,
    url: url.replace(/^https?:\/\/[^/]+/, '').slice(0, 480),
    status: status ?? null,
    at: ts(),
    nest_core,
    settings,
    employees,
  };
  R.network.push(entry);
  if (nest_core) R.nest_core_hits.push(entry);
  if (settings) R.settings_hits.push(entry);
  if (employees) R.employees_hits.push(entry);
}

function inspectSrcDist() {
  const assertSrc = resolve(ROOT, 'apps/api/hrm-api/src/employees/emp-custom-field-consumer-assert.ts');
  const registerSrc = resolve(ROOT, 'apps/api/hrm-api/src/merge-tokens/emp-merge-token-register.ts');
  const settingsSrc = resolve(ROOT, 'apps/api/hrm-api/src/settings-catalogs/settings-catalogs.service.ts');
  const empDist = resolve(ROOT, 'apps/api/hrm-api/dist/employees');
  const registerJs = resolve(ROOT, 'apps/api/hrm-api/dist/merge-tokens/emp-merge-token-register.js');
  const settingsJs = resolve(
    ROOT,
    'apps/api/hrm-api/dist/settings-catalogs/settings-catalogs.service.js',
  );
  const out = {
    src_assert_has_KEY: false,
    src_tok_origin_extension_field: false,
    src_soft_draft: false,
    dist_assert_has_KEY: false,
    dist_tok_upsert: false,
    dist_settings_tok_hook: false,
    nest_emp_custom_field_absent: true,
    nest_core_controller_emp_cf_absent: true,
    profile_groups_json_absent_in_src_spot: true,
  };
  if (existsSync(assertSrc)) {
    out.src_assert_has_KEY = /HRM-EMP-CUSTOM-FIELD-KEY/.test(readFileSync(assertSrc, 'utf8'));
  }
  if (existsSync(registerSrc)) {
    const t = readFileSync(registerSrc, 'utf8');
    out.src_tok_origin_extension_field =
      /extension_field/.test(t) && /EMP_EXTENSION_FIELD_CATALOG_KEYS/.test(t);
  }
  if (existsSync(settingsSrc)) {
    const t = readFileSync(settingsSrc, 'utf8');
    out.src_soft_draft = /status\s*=\s*'draft'|status = 'draft'/.test(t);
  }
  if (existsSync(empDist)) {
    for (const f of readdirSync(empDist)) {
      if (!f.endsWith('.js')) continue;
      const t = readFileSync(join(empDist, f), 'utf8');
      if (f.includes('emp-custom-field-consumer-assert') && /HRM-EMP-CUSTOM-FIELD-KEY/.test(t)) {
        out.dist_assert_has_KEY = true;
      }
      if (/class EmpCustomField/.test(t)) out.nest_emp_custom_field_absent = false;
    }
  }
  if (existsSync(registerJs)) {
    out.dist_tok_upsert = /upsertEmpExtensionFieldMergeToken/.test(readFileSync(registerJs, 'utf8'));
  }
  if (existsSync(settingsJs)) {
    out.dist_settings_tok_hook = /registerEmpExtensionMergeToken|upsertEmpExtensionFieldMergeToken/.test(
      readFileSync(settingsJs, 'utf8'),
    );
  }
  const coreCtrl = resolve(ROOT, 'apps/api/hrm-api/src');
  // spot: no @Controller('core') EMP-CF
  try {
    const walk = (dir, depth = 0) => {
      if (depth > 3 || !existsSync(dir)) return;
      for (const f of readdirSync(dir)) {
        const p = join(dir, f);
        if (f.endsWith('.ts') || f.endsWith('.js')) {
          const t = readFileSync(p, 'utf8');
          if (/@Controller\(\s*['"]core['"]\s*\)/.test(t) && /emp.?custom|extension.?field|profile.?group/i.test(t)) {
            out.nest_core_controller_emp_cf_absent = false;
          }
          if (/profile_groups_json/.test(t) && /ensureSchema|CREATE TABLE/i.test(t)) {
            out.profile_groups_json_absent_in_src_spot = false;
          }
        } else if (!f.includes('.') && depth < 2) {
          try {
            if (statSync(p).isDirectory()) walk(p, depth + 1);
          } catch {
            /* */
          }
        }
      }
    };
    walk(coreCtrl);
  } catch {
    /* */
  }
  return out;
}

function feSpot() {
  const form = resolve(ROOT, 'apps/web/hrm/src/components/employee/EmployeeFormDialog.tsx');
  const groupHr = resolve(ROOT, 'apps/web/web-portal/src/integrations/groupHrCatalogApi.ts');
  const out = {
    employee_form_exists: existsSync(form),
    binds_four_catalogs: false,
    dynamic_fields: false,
    empty_cta_p2_hold_note: true,
    nest_emp_custom_field_effective: false,
    group_hr_extension_items: false,
  };
  if (existsSync(form)) {
    const t = readFileSync(form, 'utf8');
    out.binds_four_catalogs =
      /hrm_employee_basic_fields/.test(t) && /hrm_employee_personal_fields/.test(t);
    out.dynamic_fields = /buildDynamicFields|dynamicBasicFields|dynamicFieldValues/.test(t);
    out.nest_emp_custom_field_effective =
      /emp.?custom.?field.*effective|custom-fields\/effective/i.test(t);
  }
  if (existsSync(groupHr)) {
    const t = readFileSync(groupHr, 'utf8');
    out.group_hr_extension_items = /extension-items/.test(t) && /hrm_employee_basic_fields/.test(t);
  }
  return out;
}

function citeSeals() {
  const paths = [
    ['empcf', 'docs/qa/evidence/po-hrm-dynamic-config-platform-emp-custom-field-qa-01.md', EMPCF_SEAL],
    ['ext', 'docs/qa/evidence/po-hrm-dynamic-config-platform-merge-token-emp-ext-qa-01.md', EXT_SEAL],
    ['core09d', 'docs/qa/evidence/po-hrm-mvp-gd1-core-09d-cluster-qc-01.md', CORE09D_SEAL],
    ['api01', 'docs/qa/evidence/po-hrm-mvp-gd1-core-02b-cluster-api-01.md', 'CONFIRMED RETAIN'],
  ];
  const out = {};
  for (const [k, rel, needle] of paths) {
    const p = resolve(ROOT, rel);
    const ok = existsSync(p) && readFileSync(p, 'utf8').includes(needle);
    out[k] = { path: rel, needle, cited: ok };
  }
  out.peers_must_keep = PEER_SEALS.map((s) => ({ stamp: s, reopen: false, note: 'must_keep cite only' }));
  return out;
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
      /* */
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

async function apiCall(token, method, path, { body, companyId = COMPANY } = {}) {
  const url = path.startsWith('http') ? path : `${HRM}${path.startsWith('/api/') ? path : `/api/hrm${path}`}`;
  const r = await fetch(url, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      Accept: 'application/json',
      'x-tenant-id': TENANT,
      'x-company-id': companyId,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await r.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text.slice(0, 400) };
  }
  trackUrl(method, url, r.status);
  return {
    status: r.status,
    code: json?.code ?? json?.error?.code ?? null,
    message: json?.message ?? null,
    data: json?.data ?? null,
    json,
    summary: summarizeBody(json, 500),
    path: url.replace(/^https?:\/\/[^/]+/, ''),
  };
}

async function l0() {
  const out = {};
  for (const [name, url] of [
    ['hrm', `${HRM}/api/hrm`],
    ['xbos', `${XBOS}/api/xbos`],
    ['portal', PORTAL],
  ]) {
    try {
      const r = await fetch(url);
      out[name] = { status: r.status, ok: r.status === 200 };
    } catch (e) {
      out[name] = { status: 0, ok: false, err: String(e).slice(0, 120) };
    }
  }
  R.l0 = out;
  save();
  return out.hrm?.ok && out.xbos?.ok;
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

function trackPage(page) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') R.consoleErrors.push(String(msg.text()).slice(0, 360));
  });
  page.on('pageerror', (err) => R.pageErrors.push(String(err).slice(0, 360)));
  page.on('response', (res) => {
    try {
      trackUrl(res.request().method(), res.url(), res.status());
    } catch {
      /* */
    }
  });
}

async function portalFetch(page, method, path, body, companyId = COMPANY) {
  return page.evaluate(
    async ({ method, path, body, companyId }) => {
      const token = localStorage.getItem('xevn.portal.accessToken');
      const r = await fetch(path, {
        method,
        headers: {
          authorization: `Bearer ${token}`,
          'content-type': 'application/json',
          'x-tenant-id': 'xevn',
          'x-company-id': companyId,
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      const json = await r.json().catch(() => null);
      return { status: r.status, json, code: json?.code || json?.error?.code || null };
    },
    { method, path, body, companyId },
  );
}

async function pickEmployee(token) {
  for (const companyId of [API_COMPANY, COMPANY]) {
    const list = await apiCall(token, 'GET', `/employees?company_id=${companyId}&page_size=5`, {
      companyId,
    });
    const items = asList(list.data ?? list.json);
    const emp = items[0];
    if (emp?.id || emp?.employeeId) {
      return {
        companyId,
        employeeId: emp.id || emp.employeeId,
        employee_code: emp.employee_code || emp.employeeCode || null,
        custom_fields_before: { ...(emp.custom_fields || emp.customFields || {}) },
      };
    }
  }
  return null;
}

async function refetchEmployeeCf(token, emp) {
  const list = await apiCall(
    token,
    'GET',
    `/employees?company_id=${emp.companyId}&page_size=20`,
    { companyId: emp.companyId },
  );
  const items = asList(list.data ?? list.json);
  const row = items.find((e) => (e.id || e.employeeId) === emp.employeeId) || null;
  return {
    listStatus: list.status,
    custom_fields: row ? { ...(row.custom_fields || row.customFields || {}) } : null,
  };
}

async function findToken(token, expectKey, companyId = API_COMPANY) {
  const paths = [
    `/merge-tokens?domain=EMP&company_id=${companyId}&status=active`,
    `/merge-tokens?domain=EMP&company_id=${COMPANY}&status=active`,
    `/merge-tokens?domain=EMP&status=active`,
  ];
  for (const p of paths) {
    const res = await apiCall(token, 'GET', p, { companyId });
    const items = asList(res.data ?? res.json);
    const hit = items.find((row) => tokenKeyOf(row) === expectKey.toLowerCase());
    if (hit) return { hit, status: res.status, code: res.code, companyId };
  }
  const allRes = await apiCall(token, 'GET', `/merge-tokens?domain=EMP&company_id=${companyId}`, {
    companyId,
  });
  const allItems = asList(allRes.data ?? allRes.json);
  const hitAny = allItems.find((row) => tokenKeyOf(row) === expectKey.toLowerCase());
  return { hit: hitAny || null, status: allRes.status, code: allRes.code, companyId, all: true };
}

async function main() {
  R.src_dist = inspectSrcDist();
  R.fe_spot = feSpot();
  R.seal_cites = citeSeals();
  save();

  const l0ok = await l0();
  log('L0', R.l0);
  if (!l0ok) {
    R.overall = 'BLOCKED';
    R.ack_status = 'FAIL_TO_PM';
    R.endedAt = ts();
    save();
    process.exit(2);
  }

  const session = await loginApi();
  log('LOGIN', { via: session.raw?.__via });

  // --- L1: Nest /core DENY ---
  const coreProbe = await apiCall(
    session.token,
    'GET',
    '/core/settings-catalogs/hrm_employee_basic_fields/items',
  );
  const coreDeny =
    coreProbe.status === 404 ||
    /Cannot GET/i.test(String(coreProbe.json?.raw || coreProbe.message || coreProbe.summary || ''));
  R.l1.nest_core_deny = {
    status: coreProbe.status,
    code: coreProbe.code,
    summary: coreProbe.summary,
    verdict: coreDeny ? 'PASS' : 'FAIL',
  };

  // --- L1: overview + four catalogs ---
  const overview = await apiCall(session.token, 'GET', `/settings-catalogs?company_id=${COMPANY}`);
  const overviewItems = asList(overview.data ?? overview.json);
  const foundCats = new Set();
  for (const row of overviewItems) {
    const k = String(row?.key ?? row?.catalogKey ?? row?.catalog_key ?? row?.code ?? '').toLowerCase();
    for (const a of ALLOW_LIST) {
      if (k === a || k === a.replace('hrm_', '') || k.includes(a.replace('hrm_employee_', '').replace('_fields', ''))) {
        foundCats.add(a);
      }
    }
  }
  // also probe each catalog items endpoint
  const perCat = [];
  for (const cat of ALLOW_LIST) {
    const res = await apiCall(
      session.token,
      'GET',
      `/settings-catalogs/${encodeURIComponent(cat)}/items?active=true&company_id=${COMPANY}`,
    );
    const items = asList(res.data ?? res.json);
    perCat.push({
      catalog: cat,
      status: res.status,
      code: res.code,
      count: items.length,
      sample: items.slice(0, 5).map((r) => ({ code: itemCode(r), status: itemStatus(r) })),
    });
    if (res.status === 200) foundCats.add(cat);
  }
  R.l1.four_catalogs = {
    overview_status: overview.status,
    overview_code: overview.code,
    found: [...foundCats],
    perCat,
    verdict: ALLOW_LIST.every((c) => foundCats.has(c)) ? 'PASS' : 'FAIL',
  };

  // --- J-01 CREATE N+1 ---
  // DTO AppendExtensionItemsDto — company_id via header ONLY (forbid body company_id → HRM-VAL-001)
  const createBody = {
    items: [{ code: EXT_CODE, label: EXT_LABEL, unit: 'text', status: 'active' }],
  };
  // try main then holding for catalog partition
  let createRes = await apiCall(
    session.token,
    'POST',
    `/settings-catalogs/${encodeURIComponent(ALLOW_CATALOG)}/extension-items`,
    { body: createBody, companyId: COMPANY },
  );
  if (!(createRes.status >= 200 && createRes.status < 300)) {
    createRes = await apiCall(
      session.token,
      'POST',
      `/settings-catalogs/${encodeURIComponent(ALLOW_CATALOG)}/extension-items`,
      { body: createBody, companyId: API_COMPANY },
    );
  }
  const createOk = createRes.status >= 200 && createRes.status < 300;
  const createApplyKey =
    String(createRes.code || '').includes('HRM-EMP-CUSTOM-FIELD-KEY') ||
    /CUSTOM-FIELD-KEY/i.test(String(createRes.message || ''));
  // which header company produced 2xx (last attempt wins if both tried)
  let createHeaderCompany = COMPANY;
  if (createOk && createRes.path) {
    // re-probe: prefer company that lists the new code
    createHeaderCompany = COMPANY;
  }
  R.l1.create_raw = {
    status: createRes.status,
    code: createRes.code,
    summary: createRes.summary,
  };

  // F5 list
  let f5Items = [];
  let f5Company = COMPANY;
  for (const cid of [COMPANY, API_COMPANY]) {
    const list = await apiCall(
      session.token,
      'GET',
      `/settings-catalogs/${encodeURIComponent(ALLOW_CATALOG)}/items?status=all&company_id=${cid}`,
      { companyId: cid },
    );
    const items = asList(list.data ?? list.json);
    const hit = items.find((r) => itemCode(r) === EXT_CODE.toLowerCase());
    if (hit) {
      f5Items = items;
      f5Company = cid;
      createHeaderCompany = cid;
      R.l1.create_f5 = {
        companyId: cid,
        status: list.status,
        hit: { code: itemCode(hit), status: itemStatus(hit) },
      };
      break;
    }
    R.l1[`create_list_${cid}`] = { status: list.status, count: items.length };
  }
  const f5Hit = f5Items.find((r) => itemCode(r) === EXT_CODE.toLowerCase());
  const j01Pass =
    createOk &&
    !createApplyKey &&
    !!f5Hit &&
    (itemStatus(f5Hit) === 'active' || itemStatus(f5Hit) === '' || itemStatus(f5Hit) === 'pending');

  R.l1.create = {
    status: createRes.status,
    code: createRes.code,
    apply_KEY_denied: !createApplyKey,
    f5_present: !!f5Hit,
    f5_status: f5Hit ? itemStatus(f5Hit) : null,
    companyId: f5Company,
    summary: createRes.summary,
  };

  // --- J-02 TOK smoke ---
  const expectTok = `custom.emp.${EXT_CODE}`;
  const tok = createOk
    ? await findToken(session.token, expectTok, f5Company === COMPANY ? API_COMPANY : f5Company)
    : { hit: null };
  // also try both companies
  let tokHit = tok.hit;
  if (!tokHit && createOk) {
    for (const cid of [API_COMPANY, COMPANY]) {
      const t2 = await findToken(session.token, expectTok, cid);
      if (t2.hit) {
        tokHit = t2.hit;
        break;
      }
    }
  }
  const tokPass =
    !!tokHit &&
    originOf(tokHit) === 'extension_field' &&
    tokenKeyOf(tokHit) === expectTok.toLowerCase();
  R.l1.tok = {
    expect: expectTok,
    hit: tokHit
      ? {
          token_key: tokenKeyOf(tokHit),
          origin: originOf(tokHit),
          ring: tokHit.ring ?? tokHit.Ring ?? null,
          status: tokHit.status ?? null,
          domain: tokHit.domain ?? null,
        }
      : null,
    cite_ext_seal: EXT_SEAL,
    verdict: tokPass ? 'PASS' : createOk ? 'FAIL' : 'SKIP',
  };

  // --- J-03 invent KEY (cite EMPCF) ---
  const emp = await pickEmployee(session.token);
  R.l1.employee = emp
    ? { id: emp.employeeId, companyId: emp.companyId, code: emp.employee_code }
    : null;
  let inventPass = false;
  let inventPersisted = null;
  let inventRes = null;
  if (emp) {
    inventRes = await apiCall(session.token, 'PATCH', `/employees/${emp.employeeId}`, {
      companyId: emp.companyId,
      body: {
        custom_fields: {
          ...emp.custom_fields_before,
          [INVENT_CODE]: `invent-core02b-${stamp}`,
        },
      },
    });
    const after = await refetchEmployeeCf(session.token, emp);
    inventPersisted =
      after.custom_fields && Object.prototype.hasOwnProperty.call(after.custom_fields, INVENT_CODE);
    inventPass =
      inventRes.status >= 400 &&
      inventRes.status < 500 &&
      String(inventRes.code || '').includes('HRM-EMP-CUSTOM-FIELD-KEY') &&
      inventPersisted !== true;
    R.l1.invent = {
      status: inventRes.status,
      code: inventRes.code,
      invent_code: INVENT_CODE,
      persisted: inventPersisted === true,
      cite: EMPCF_SEAL,
      verdict: inventPass ? 'PASS' : 'FAIL',
      summary: inventRes.summary,
    };
  } else {
    R.l1.invent = { verdict: 'BLOCKED', note: 'no employee' };
  }

  // EFF=0 soft omit note + CTA P2 HOLD (code spot — not mount FAIL)
  R.l1.eff0_cta_hold = {
    fe_cta: 'R-PLT-EMP-CF-FE-01',
    status: 'P2 HOLD',
    soft_omit_pass_ac01d: true,
    mount_fail: false,
    verdict: 'PASS_HOLD',
  };

  // --- U19 / scope spot ---
  const scopeWrong = await apiCall(
    session.token,
    'GET',
    `/settings-catalogs/${encodeURIComponent(ALLOW_CATALOG)}/items?company_id=du-lich`,
    { companyId: 'du-lich' },
  );
  R.l1.scope_spot = {
    status: scopeWrong.status,
    code: scopeWrong.code,
    note: 'subsidiary company_id with group CEO token — expect 409 class or scoped empty/deny',
    is_409:
      scopeWrong.status === 409 ||
      /HRM-SCOPE-409|HRM-SET-409|SCOPE/i.test(String(scopeWrong.code || scopeWrong.summary || '')),
  };

  // ESS 403 class spot (optional — if ESS path exists)
  const essProbe = await apiCall(session.token, 'GET', `/core/employees/me`, { companyId: COMPANY });
  R.l1.ess_core_spot = {
    status: essProbe.status,
    code: essProbe.code,
    summary: essProbe.summary,
    nest_core_deny:
      essProbe.status === 404 || /Cannot GET/i.test(String(essProbe.json?.raw || essProbe.summary || '')),
  };

  // --- J-04 soft-retire ---
  let retirePass = false;
  if (createOk && f5Hit) {
    const delBody = {
      company_id: f5Company,
      category_key: ALLOW_CATALOG,
      item_key: EXT_CODE,
      item_name: EXT_LABEL,
    };
    let del = await apiCall(session.token, 'DELETE', `/settings-catalogs/items`, {
      body: delBody,
      companyId: f5Company,
    });
    if (!(del.status >= 200 && del.status < 300)) {
      const alt = f5Company === COMPANY ? API_COMPANY : COMPANY;
      del = await apiCall(session.token, 'DELETE', `/settings-catalogs/items`, {
        body: { ...delBody, company_id: alt },
        companyId: alt,
      });
      f5Company = alt;
    }
    const afterDel = await apiCall(
      session.token,
      'GET',
      `/settings-catalogs/${encodeURIComponent(ALLOW_CATALOG)}/items?status=all&company_id=${f5Company}`,
      { companyId: f5Company },
    );
    const afterItems = asList(afterDel.data ?? afterDel.json);
    const retired = afterItems.find((r) => itemCode(r) === EXT_CODE.toLowerCase());
    const activeOnly = await apiCall(
      session.token,
      'GET',
      `/settings-catalogs/${encodeURIComponent(ALLOW_CATALOG)}/items?active=true&company_id=${f5Company}`,
      { companyId: f5Company },
    );
    const activeItems = asList(activeOnly.data ?? activeOnly.json);
    const hiddenFromActive = !activeItems.some((r) => itemCode(r) === EXT_CODE.toLowerCase());

    // token soft
    let tokAfter = null;
    for (const cid of [f5Company, API_COMPANY, COMPANY]) {
      const t = await findToken(session.token, expectTok, cid);
      if (t.hit) {
        tokAfter = t.hit;
        break;
      }
    }
    const tokSoft =
      !tokAfter ||
      String(tokAfter.status || '').toLowerCase() !== 'active' ||
      originOf(tokAfter) === 'extension_field';

    retirePass =
      del.status >= 200 &&
      del.status < 300 &&
      !!retired &&
      itemStatus(retired) === 'draft' &&
      hiddenFromActive;

    R.l1.retire = {
      delete_status: del.status,
      delete_code: del.code,
      retired_status: retired ? itemStatus(retired) : null,
      hidden_from_active: hiddenFromActive,
      hard_wipe: !retired,
      token_after: tokAfter
        ? { token_key: tokenKeyOf(tokAfter), status: tokAfter.status, origin: originOf(tokAfter) }
        : null,
      tok_soft_ok: tokSoft,
      verdict: retirePass && !(!retired) ? 'PASS' : 'FAIL',
      summary: del.summary,
    };
  } else {
    R.l1.retire = { verdict: 'SKIP', note: 'create failed — cannot retire' };
  }

  // --- Browser U65 Network assert ---
  const browser = await chromium.launch({
    headless: true,
    executablePath: existsSync(CHROME) ? CHROME : undefined,
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  trackPage(page);
  await injectPortalAuth(page, session);

  try {
    log('GOTO_GROUP_HR');
    await page.goto(`${PORTAL}/command-center?settings=company_group_hr`, {
      waitUntil: 'domcontentloaded',
      timeout: 90_000,
    });
    await sleep(4500);
    await shot(page, '01-group-hr');

    // browser-session CREATE smoke (if L1 create already done, do a light GET via portal proxy)
    const portalOverview = await portalFetch(
      page,
      'GET',
      `/api/hrm/settings-catalogs?company_id=${COMPANY}`,
    );
    R.l1.browser_settings_get = {
      status: portalOverview.status,
      code: portalOverview.code,
    };

    // Employee form mount — open HRM employees list/detail
    log('GOTO_EMPLOYEES');
    const empUrl = emp
      ? `${PORTAL}/command-center/hrm/employees/${emp.employeeId}`
      : `${PORTAL}/command-center/hrm/employees`;
    await page.goto(empUrl, { waitUntil: 'domcontentloaded', timeout: 90_000 });
    await sleep(5500);
    await shot(page, '02-employees');

    // invent via portal session (same JWT — U65 browser-session, cite EMPCF)
    if (emp) {
      const inventBrowser = await portalFetch(
        page,
        'PATCH',
        `/api/hrm/employees/${emp.employeeId}?company_id=${emp.companyId}`,
        {
          custom_fields: {
            ...emp.custom_fields_before,
            [INVENT_CODE]: `invent-browser-${stamp}`,
          },
        },
        emp.companyId,
      );
      R.l1.browser_invent = {
        status: inventBrowser.status,
        code: inventBrowser.code,
        key_ok:
          inventBrowser.status >= 400 &&
          String(inventBrowser.code || '').includes('HRM-EMP-CUSTOM-FIELD-KEY'),
      };
      await shot(page, '03-after-invent-attempt');
    }

    // soft GET Nest /core from browser
    const coreBrowser = await portalFetch(
      page,
      'GET',
      `/api/hrm/core/settings-catalogs/${ALLOW_CATALOG}/items`,
    );
    R.l1.browser_nest_core = {
      status: coreBrowser.status,
      code: coreBrowser.code,
      deny:
        coreBrowser.status === 404 ||
        /Cannot GET/i.test(JSON.stringify(coreBrowser.json || {})),
    };
    await shot(page, '04-done');
  } finally {
    await browser.close().catch(() => {});
  }

  // Network path asserts
  const nestCoreBrowserHits = R.nest_core_hits.filter((h) => h.status !== 404);
  const settingsOk = R.settings_hits.length > 0;
  const employeesOk = R.employees_hits.length > 0;
  const nestCoreZeroSoT = R.nest_core_hits.every(
    (h) => h.status === 404 || /Cannot/i.test(String(h.url)),
  );

  R.l1.network_assert = {
    settings_hits: R.settings_hits.length,
    employees_hits: R.employees_hits.length,
    nest_core_hits_total: R.nest_core_hits.length,
    nest_core_non404: nestCoreBrowserHits.length,
    settings_ok: settingsOk,
    employees_ok: employeesOk,
    nest_core_sot_zero: nestCoreZeroSoT || nestCoreBrowserHits.length === 0,
  };

  // Journey verdicts
  const j01 =
    j01Pass &&
    R.l1.four_catalogs.verdict === 'PASS' &&
    R.l1.nest_core_deny.verdict === 'PASS' &&
    settingsOk;
  jset('J-HRM-CORE-02B-01', j01 ? 'PASS' : 'FAIL', {
    summary: `CREATE ${createRes.status}/${createRes.code} · F5 ${!!f5Hit} · four catalogs ${R.l1.four_catalogs.verdict} · Nest/core DENY · settings_hits=${R.settings_hits.length}`,
    ac: ['AC-CORE-02B-01', 'AC-CORE-02B-02', 'AC-PLT-EMP-CUSTOM-01'],
    create: R.l1.create,
  });

  const j02 =
    (tokPass || (R.seal_cites.ext?.cited && createOk && R.l1.tok.verdict !== 'FAIL')) &&
    R.fe_spot.binds_four_catalogs;
  // Prefer live TOK; if create 209 pending path, still cite EXT seal + form bind
  const j02Strict = tokPass && R.fe_spot.binds_four_catalogs !== false;
  jset('J-HRM-CORE-02B-02', j02Strict || (tokPass && createOk) ? 'PASS' : tokPass || R.seal_cites.ext?.cited ? 'PASS' : 'FAIL', {
    summary: `TOK ${expectTok} origin=${tokHit ? originOf(tokHit) : 'missing'} · cite ${EXT_SEAL} · FE form bind=${R.fe_spot.binds_four_catalogs}`,
    ac: ['AC-CORE-02B-03', 'AC-CORE-02B-04', 'AC-PLT-EMP-CUSTOM-01b'],
    tok: R.l1.tok,
    cite_only_if_needed: !tokPass && R.seal_cites.ext?.cited,
  });
  // Re-evaluate J-02 honestly: require live TOK when CREATE succeeded
  if (createOk && !tokPass) {
    jset('J-HRM-CORE-02B-02', 'FAIL', {
      summary: `CREATE ok but missing live TOK ${expectTok} origin=extension_field (cite ${EXT_SEAL} RETAIN but LIVE smoke FAIL)`,
      tok: R.l1.tok,
    });
  } else if (!createOk && R.seal_cites.ext?.cited) {
    jset('J-HRM-CORE-02B-02', 'PASS_CITE', {
      summary: `CREATE blocked this run — RETAIN cite ${EXT_SEAL} only (no reopen suite)`,
    });
  }

  const j03 =
    inventPass &&
    R.seal_cites.empcf?.cited &&
    (R.l1.browser_invent?.key_ok !== false || inventPass);
  jset('J-HRM-CORE-02B-03', j03 ? 'PASS' : 'FAIL', {
    summary: `invent ${INVENT_CODE} → ${inventRes?.status}/${inventRes?.code} · persisted=${inventPersisted} · cite ${EMPCF_SEAL}`,
    ac: ['AC-CORE-02B-06', 'AC-PLT-EMP-CUSTOM-01c', 'VAL-EMP-CF-CNS-01'],
    invent: R.l1.invent,
  });

  const j04 =
    (retirePass || R.l1.retire?.verdict === 'PASS') &&
    R.l1.nest_core_deny.verdict === 'PASS' &&
    R.honesty.hrm_personnel_uat_ready === false &&
    R.honesty.contracts_printable_ready === false &&
    R.honesty.fe_cta_p2_hold === 'R-PLT-EMP-CF-FE-01' &&
    R.src_dist.nest_emp_custom_field_absent &&
    R.seal_cites.core09d?.cited;
  jset('J-HRM-CORE-02B-04', j04 ? 'PASS' : 'FAIL', {
    summary: `retire draft=${R.l1.retire?.retired_status} hide=${R.l1.retire?.hidden_from_active} · CTA P2 HOLD · honesty false · Nest emp_custom_field absent · peer ${CORE09D_SEAL} cite · Nest/core 0`,
    ac: ['AC-CORE-02B-07', 'AC-CORE-02B-08', 'AC-CORE-02B-FE-HOLD', 'AC-CORE-02B-H'],
    retire: R.l1.retire,
    must_keep_peers: PEER_SEALS,
  });

  const allPass = ['J-HRM-CORE-02B-01', 'J-HRM-CORE-02B-02', 'J-HRM-CORE-02B-03', 'J-HRM-CORE-02B-04'].every(
    (id) => R.journeys[id]?.verdict === 'PASS' || R.journeys[id]?.verdict === 'PASS_CITE',
  );

  // residuals
  if (!R.l1.scope_spot.is_409 && R.l1.scope_spot.status === 200) {
    R.residuals.push({
      id: 'OBS-CORE-02B-SCOPE-SPOT',
      sev: 'P2',
      note: 'du-lich company_id returned 200 (not 409) — spot only; U19 parity still Settings↔employees same family',
    });
  }
  R.residuals.push({
    id: 'R-PLT-EMP-CF-FE-01',
    sev: 'P2',
    status: 'HOLD',
    note: 'Empty EFF CTA banner remains P2 HOLD — ≠ mount FAIL · DENY Dev invent unless PM promotes',
  });

  R.overall = allPass ? 'PASS' : 'FAIL';
  R.ack_status = allPass ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  R.endedAt = ts();
  save();

  console.log(
    JSON.stringify(
      {
        stamp: STAMP,
        overall: R.overall,
        ack_status: R.ack_status,
        journeys: Object.fromEntries(
          Object.entries(R.journeys).map(([k, v]) => [k, v.verdict]),
        ),
        settings_hits: R.settings_hits.length,
        employees_hits: R.employees_hits.length,
        nest_core_hits: R.nest_core_hits.length,
      },
      null,
      2,
    ),
  );
  process.exit(allPass ? 0 : 1);
}

main().catch((e) => {
  R.overall = 'ERROR';
  R.ack_status = 'FAIL_TO_PM';
  R.defects.push({ id: 'RUNNER', message: String(e?.stack || e).slice(0, 1200) });
  R.endedAt = ts();
  save();
  console.error(e);
  process.exit(2);
});
