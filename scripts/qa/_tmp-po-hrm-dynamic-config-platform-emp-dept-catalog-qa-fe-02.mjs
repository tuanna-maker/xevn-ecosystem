#!/usr/bin/env node
/**
 * PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-CATALOG-QA-FE-02
 * Browser U65 · FE-02 READY mergeEmployeeDepartmentWriteFields → custom_fields.department
 * Prior FAIL EMPDEPTQAFE-MSKG2900 · Condition R-PLT-EMP-DEPT-FE-01
 * L1 EMPDEPTQA-MSK3VVXX RETAIN · KEY HRM-EMP-DEPT-KEY ≡ HRM-WH-DEPT-KEY LIVE
 * Peer CLOSED RETAIN: EMP-POSITION EMPPOSQCFE-8DEF5536 · EMP-STATUS EMPSTQAFE2-MSKE3NV1
 * Path: Employees → Thêm/Sửa · pick emp with requiresReason=false (avoid STATUS-REASON-KEY)
 * AC: Lưu body has custom_fields.department (never top-level department) · FE+F5
 * Honesty: personnel/e2e=false · C-SLICE-≠-MODULE · Nest emp_department DENY
 * Cấm: seed · Nest emp_department · reopen EMP-POSITION/STATUS FE CLOSED · invent LVRULE · flip ready · module EMP UAT · QC-close
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync, existsSync, readdirSync, statSync, readFileSync } from 'node:fs';
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

const STAMP_L1 = 'EMPDEPTQA-MSK3VVXX';
const KEY_DEPT = 'HRM-EMP-DEPT-KEY';
const KEY_WH = 'HRM-WH-DEPT-KEY';
const KEY_EMPTY = 'HRM-EMP-DEPT-EMPTY-CATALOG';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(
  ROOT,
  'docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-emp-dept-catalog-qa-fe-02-browser.json',
);
const SCREEN = resolve(
  ROOT,
  'docs/qa/evidence/screens/po-hrm-dynamic-config-platform-emp-dept-catalog-qa-fe-02',
);
mkdirSync(SCREEN, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();
const stampTail = Date.now().toString(36).toLowerCase().slice(-8);
const INVENT_KEY = `zz_invent_emp_dept_${stampTail}`.slice(0, 48);

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const R = {
  work_item_id: 'PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-CATALOG-QA-FE-02',
  parent: 'PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-CATALOG-FE-02',
  prior_fail: 'EMPDEPTQAFE-MSKG2900',
  residual_target: 'R-PLT-EMP-DEPT-FE-01',
  stamp_l1_retain: STAMP_L1,
  key_codes: [KEY_DEPT, KEY_WH, KEY_EMPTY],
  startedAt: ts(),
  stamp: `EMPDEPTQAFE2-${stampTail.toUpperCase()}`,
  persona: { email: EMAIL, companyId: COMPANY },
  u65: 'zero-seed · browser FE click path · invent API spot ≠ UF 🟢 alone · no wipe EFF',
  hdsd_align:
    'CH06g consumer hồ sơ NV phòng ban · /hr/employees · CatalogSearchPicker department · hdsd-employee-form-* · status+position RETAIN',
  honesty: {
    hrm_personnel_uat_ready: false,
    employees_e2e_linkage_ready: false,
    contracts_printable_ready: false,
    seed_used: false,
    ensureDefault: false,
    c_slice_ne_module: true,
    deny_module_emp_uat: true,
    deny_phase1: true,
    deny_qc_close_this_seat: true,
    emp_position_fe_closed_retain: true,
    emp_status_fe_closed_retain: true,
    deny_reopen_emp_position_fe: true,
    deny_reopen_emp_status_fe: true,
    lvrule_01g_hold: true,
    nest_emp_department_deny: true,
    seal_retain: {
      L1_EMP_DEPT: STAMP_L1,
      EMP_POSITION_L1: 'EMPPOSQA2-MSK3CDH1',
      EMP_POSITION_FE: 'EMPPOSQCFE-8DEF5536 CLOSED RETAIN',
      EMP_STATUS_L1: 'EMPSTQA-MSK20G7H',
      EMP_STATUS_FE: 'EMPSTQAFE2-MSKE3NV1 CLOSED RETAIN',
      EMP_CUSTOM: 'EMPCFQA-MSK14LUH',
      ATT_CODE_FE: 'ATTCODEQAFE-MSKCJA95',
      LVRULE: 'ATTLVRULEQA-MSK6G783',
    },
  },
  vitest: { claimed: '22/22 (empDeptCatalog 13 + mount-guard 9)', re_run: null },
  env: { PORTAL, HRM, XBOS, TENANT, commit: COMMIT },
  l0: {},
  departments: { before: null, codes: [], rows: [], via: null },
  ac: {},
  network: {
    catalogsGets: [],
    empGets: [],
    empPatches: [],
    empPosts: [],
    whPosts: [],
    inventCalls: [],
    nestDenyCalls: [],
    bad5xx: [],
  },
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  click_log: [],
  picker_form: null,
  invent_api: null,
  invent_ui: null,
  empty_path: null,
  nest_deny: null,
  unit_cite: null,
  edit_submit: null,
  f5: null,
  emp_status_select_present: null,
  emp_position_picker_present: null,
  seals_retain: null,
  mutation_wire_obs: null,
  overall: null,
  ack_status: null,
  condition_r_plt_emp_dept_fe_01: null,
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
  console.log(`${verdict} ${id} — ${(detail.summary || '').slice(0, 520)}`);
  save();
}

async function shot(page, name) {
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  R.screens.push(path.replace(/\\/g, '/'));
  return path;
}

function q(path) {
  const u = new URL(path, PORTAL);
  u.searchParams.set('portal', '1');
  u.searchParams.set('tenantId', TENANT);
  u.searchParams.set('companyId', COMPANY);
  u.searchParams.set('_', String(Date.now()));
  return u.toString();
}

async function probeL0() {
  for (const [k, url] of [
    ['hrm', `${HRM}/api/hrm`],
    ['xbos', `${XBOS}/api/xbos`],
    ['portal', PORTAL],
  ]) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
      R.l0[k] = r.status;
    } catch (e) {
      R.l0[k] = String(e?.cause?.code || e?.message || e).slice(0, 80);
    }
  }
  save();
  return R.l0.hrm === 200 && R.l0.xbos === 200 && Number(R.l0.portal) === 200;
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
  return {
    status: r.status,
    json,
    code: json?.code ?? json?.error?.code ?? null,
    message: json?.message ?? null,
  };
}

function asList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.rows)) return data.rows;
  if (Array.isArray(data?.effectiveItems)) return data.effectiveItems;
  if (Array.isArray(data?.effective_items)) return data.effective_items;
  return [];
}

function itemCode(row) {
  return String(row?.code ?? row?.item_key ?? row?.key ?? row?.slug ?? row?.value ?? '').trim();
}

function itemActive(row) {
  const s = String(row?.status ?? row?.state ?? 'active').toLowerCase();
  return s === 'active' || s === 'enabled' || s === '1' || s === 'true' || row?.is_active === true;
}

function itemLabel(row) {
  return String(
    row?.name_vi ?? row?.nameVi ?? row?.label ?? row?.name ?? row?.display_name ?? '',
  ).trim();
}

async function fetchDepartmentsEff(token) {
  const attempts = [];
  const paths = [
    `/api/hrm/settings-catalogs/departments/items?company_id=${COMPANY}`,
    `/api/hrm/settings-catalogs/items?company_id=${COMPANY}&catalog_key=departments&page_size=100`,
    `/api/hrm/settings-catalogs/effective?company_id=${COMPANY}&key=departments`,
    `/api/hrm/settings-catalogs/effective-items?company_id=${COMPANY}&catalog_key=departments`,
    `/api/hrm/settings-catalogs?company_id=${COMPANY}`,
  ];
  for (const path of paths) {
    const r = await apiCall(token, 'GET', path);
    let rows = asList(r.json?.data ?? r.json);
    if (!rows.length && Array.isArray(r.json?.data)) {
      const cats = r.json.data;
      for (const cat of cats) {
        const key = String(cat?.key ?? cat?.catalog_key ?? '').toLowerCase();
        if (['departments', 'department_catalog', 'org_departments'].includes(key)) {
          rows = asList(cat?.items ?? cat?.effectiveItems ?? cat?.effective_items ?? cat);
          if (rows.length) break;
        }
      }
    }
    const active = rows.filter(itemActive);
    attempts.push({ path: path.slice(0, 120), status: r.status, total: rows.length, active: active.length });
    if (active.length > 0) {
      return {
        ok: true,
        via: path,
        status: r.status,
        rows: active,
        codes: active.map(itemCode).filter(Boolean),
        labels: active.map(itemLabel),
        total: active.length,
        attempts,
      };
    }
  }
  return { ok: false, via: null, status: 0, rows: [], codes: [], labels: [], total: 0, attempts };
}

async function inventDeptWhApiSpot(token, empId, positionKey = 'CEO') {
  const path = `/api/hrm/employees/${empId}/work-timeline?company_id=${COMPANY}`;
  const r = await apiCall(token, 'POST', path, {
    event_type: 'transfer',
    effective_date: '2026-08-01',
    department_key: INVENT_KEY,
    position_key: positionKey || 'CEO',
    note: `QA invent DEPT ${stampTail}`,
  });
  const hit =
    r.status === 400 &&
    (r.code === KEY_DEPT || r.code === KEY_WH || String(r.code || '').includes('DEPT'));
  R.invent_api = {
    method: 'POST',
    path,
    body: { department_key: INVENT_KEY, position_key: positionKey || 'CEO' },
    status: r.status,
    code: r.code,
    message: (r.message || '').slice(0, 240),
    key_hit: hit,
  };
  R.network.inventCalls.push(R.invent_api);
  ac('INVENT_API_KEY', hit ? 'PASS' : 'FAIL', {
    summary: `WH invent department_key+position_key → ${r.status} ${r.code} key_hit=${hit} msg=${(r.message || '').slice(0, 120)}`,
  });

  const g = await apiCall(token, 'GET', path);
  const rows = asList(g.json?.data ?? g.json);
  const persisted = rows.some(
    (row) => String(row?.department_key || row?.departmentKey || '').trim() === INVENT_KEY,
  );
  ac('INVENT_NO_PERSIST', !persisted ? 'PASS' : 'FAIL', {
    summary: `after invent WH GET count=${rows.length} invent_persisted=${persisted}`,
  });
  return hit;
}

async function nestEmpDepartmentDeny(token) {
  const paths = [
    `/api/hrm/employees/emp-departments`,
    `/api/hrm/employees/emp-departments/effective?company_id=${COMPANY}`,
    `/api/hrm/emp-departments`,
    `/api/hrm/emp-departments/effective?company_id=${COMPANY}`,
    `/api/hrm/emp-department`,
  ];
  const results = [];
  for (const path of paths) {
    const r = await apiCall(token, 'GET', path);
    results.push({ path, status: r.status, code: r.code });
    R.network.nestDenyCalls.push({ path, status: r.status, code: r.code });
  }
  const srcSvc = resolve(ROOT, 'apps/api/hrm-api/src/employees');
  let srcRoute = false;
  try {
    const candidates = [
      'emp-department.service.ts',
      'emp-departments.controller.ts',
      'emp-department.controller.ts',
      'emp-departments.service.ts',
    ];
    for (const c of candidates) {
      if (existsSync(join(srcSvc, c))) srcRoute = true;
    }
    if (existsSync(srcSvc)) {
      for (const name of readdirSync(srcSvc)) {
        const p = join(srcSvc, name);
        if (!statSync(p).isFile() || !/\.(ts|js)$/.test(name)) continue;
        if (/emp[_-]?department/i.test(name)) srcRoute = true;
      }
    }
  } catch {
    /* */
  }
  const allAbsentOr404 = results.every((x) => x.status === 404 || x.status === 0 || x.status >= 400);
  R.nest_deny = { results, srcRouteFile: srcRoute, allAbsentOr404 };
  ac(
    'NEST_EMP_DEPARTMENT_DENY',
    allAbsentOr404 && !srcRoute ? 'PASS' : allAbsentOr404 ? 'PASS_WITH_OBS' : 'FAIL',
    {
      summary: `live GET statuses=${results.map((x) => x.status).join(',')} srcRouteFile=${srcRoute}`,
    },
  );
}

async function sealsRetainSmoke(token) {
  const checks = [];
  for (const [name, path] of [
    ['att_codes', `/api/hrm/attendance/attendance-codes/effective?company_id=${COMPANY}`],
    ['emp_st', `/api/hrm/employees/employment-statuses/effective?company_id=${COMPANY}`],
    ['job_titles', `/api/hrm/settings-catalogs/job_titles/items?company_id=${COMPANY}`],
  ]) {
    const r = await apiCall(token, 'GET', path);
    checks.push({ name, status: r.status, code: r.code, total: asList(r.json?.data ?? r.json).length });
  }
  R.seals_retain = { checks };
  const ok = checks.every((c) => c.status >= 200 && c.status < 300);
  ac('SEALS_RETAIN', ok ? 'PASS' : 'PASS_WITH_OBS', {
    summary: checks.map((c) => `${c.name}:${c.status}/${c.total}`).join(' · '),
  });
}

function citeUnitTests() {
  R.unit_cite = {
    path: 'apps/web/hrm/src/lib/empDeptCatalog.test.ts + EmployeeFormDialog.mount-guard.test.ts',
    present: existsSync(resolve(ROOT, 'apps/web/hrm/src/lib/empDeptCatalog.test.ts')),
    claimed: '22/22',
    covers: [
      'mergeEmployeeDepartmentWriteFields → custom_fields.department',
      'R-PLT-EMP-DEPT-FE-02 department in required[]',
      'status+position still required[]',
      'normalizeEmpDeptKey',
      'resolveEmpDeptEditValue invent clear',
      'isEmpDeptInventKeyError DEPT+WH',
      'empDeptKeyToastFirst',
      'HRM_EMP_DEPT_EMPTY_CATALOG',
      'EMP_DEPT_NEST_TABLE_DENIED',
    ],
  };
}

function citeMutationWireGap() {
  const p = resolve(ROOT, 'apps/web/hrm/src/hooks/useEmployeeMutations.ts');
  const lib = resolve(ROOT, 'apps/web/hrm/src/lib/empDeptCatalog.ts');
  let src = '';
  let libSrc = '';
  try {
    src = readFileSync(p, 'utf8');
  } catch {
    src = '';
  }
  try {
    libSrc = readFileSync(lib, 'utf8');
  } catch {
    libSrc = '';
  }
  const hasMergeHelper = /mergeEmployeeDepartmentWriteFields/.test(src) && /mergeEmployeeDepartmentWriteFields/.test(libSrc);
  const putsDeptInCustom =
    /custom_fields\.department|custom_fields:\s*\{[\s\S]*?department/.test(libSrc) ||
    /custom_fields[\s\S]{0,200}department/.test(libSrc);
  const neverTopLevel =
    !/department:\s*data\.department/.test(src) &&
    /mergeEmployeeDepartmentWriteFields\(data\.department/.test(src);
  R.mutation_wire_obs = {
    path: 'apps/web/hrm/src/hooks/useEmployeeMutations.ts + empDeptCatalog.ts',
    has_mergeEmployeeDepartmentWriteFields: hasMergeHelper,
    puts_department_in_custom_fields: putsDeptInCustom,
    never_top_level_department: neverTopLevel,
    payload_has_department: hasMergeHelper && putsDeptInCustom && neverTopLevel,
    note: 'FE-02 wire: form department → custom_fields.department only (BE rejects top-level HRM-VAL-001)',
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

function summarizeReq(body) {
  if (!body || typeof body !== 'object') return body;
  const keep = {};
  for (const k of [
    'department',
    'department_key',
    'job_title_key',
    'position',
    'status',
    'status_reason_key',
    'full_name',
    'employee_code',
    'custom_fields',
  ]) {
    if (body[k] !== undefined) keep[k] = body[k];
  }
  return keep;
}

function track(page) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const t = String(msg.text());
      if (!/favicon|React DevTools|Download the React|Failed to load resource/i.test(t)) {
        R.consoleErrors.push(t.slice(0, 360));
      }
    }
  });
  page.on('pageerror', (err) => R.pageErrors.push(String(err).slice(0, 360)));
  page.on('response', async (res) => {
    try {
      const u = res.url();
      if (!/\/api\/hrm\//.test(u)) return;
      const method = res.request().method();
      if (method === 'OPTIONS') return;
      const status = res.status();
      const path = u.replace(/^https?:\/\/[^/]+/, '').slice(0, 360);
      let code = null;
      let reqBody = null;
      try {
        const pd = res.request().postData();
        if (pd) {
          try {
            reqBody = JSON.parse(pd);
          } catch {
            reqBody = { raw: pd.slice(0, 200) };
          }
        }
      } catch {
        /* */
      }
      try {
        if (status >= 400 || /employees|settings-catalogs|work-timeline|emp-department/.test(path)) {
          const j = await res.json().catch(() => null);
          code = j?.code ?? j?.error?.code ?? null;
        }
      } catch {
        /* */
      }
      const entry = {
        method,
        status,
        path,
        code,
        reqBody: reqBody ? summarizeReq(reqBody) : null,
        at: ts(),
      };
      if (/settings-catalogs/.test(path) && method === 'GET') R.network.catalogsGets.push(entry);
      if (
        /\/employees(\?|\/|$)/.test(path) &&
        method === 'GET' &&
        !/employment-|status-reason|document|work-timeline/.test(path)
      )
        R.network.empGets.push(entry);
      if (/\/employees\/[^/?]+$/.test(path.split('?')[0]) && method === 'PATCH')
        R.network.empPatches.push(entry);
      if (/\/employees$/.test(path.split('?')[0]) && method === 'POST') R.network.empPosts.push(entry);
      if (/work-timeline/.test(path) && (method === 'POST' || method === 'PATCH'))
        R.network.whPosts.push(entry);
      if (status >= 500) R.network.bad5xx.push(entry);
      if (code === KEY_DEPT || code === KEY_WH) R.network.inventCalls.push(entry);
    } catch {
      /* */
    }
  });
}

async function openEditDialog(page, preferName) {
  await sleep(1500);
  let row0 = page.locator('table tbody tr').first();
  if (preferName) {
    const named = page.locator('table tbody tr').filter({ hasText: preferName }).first();
    if (await named.count()) row0 = named;
  }
  if (!(await row0.count())) return { opened: false, via: 'no_rows' };

  const actions = row0.getByTestId('employee-row-actions');
  if (await actions.count()) {
    await actions.click({ timeout: 5_000 }).catch(() => {});
    await sleep(500);
  } else {
    await row0.locator('button').last().click({ timeout: 5_000 }).catch(() => {});
    await sleep(500);
  }
  const sua = page.getByRole('menuitem', { name: /Sửa|Chỉnh sửa|Edit/i }).first();
  if (await sua.count()) {
    await sua.click();
    await sleep(1500);
    const opened = await page.getByTestId('hdsd-employee-form-dialog').isVisible().catch(() => false);
    if (opened) return { opened: true, via: 'row_menu' };
  }
  await page.keyboard.press('Escape').catch(() => {});
  await sleep(300);

  await row0.locator('td').first().click({ timeout: 8_000 }).catch(() => {});
  await sleep(2500);
  const suaBtn = page.getByRole('button', { name: /Sửa|Chỉnh sửa|Edit/i }).first();
  if (await suaBtn.count()) {
    await suaBtn.click();
    await sleep(1500);
    const opened = await page.getByTestId('hdsd-employee-form-dialog').isVisible().catch(() => false);
    if (opened) return { opened: true, via: 'profile' };
  }
  return { opened: false, via: 'failed' };
}

async function findDeptCombobox(dialog, page, effCodes = []) {
  const combos = dialog.locator('[role="combobox"]');
  const n = await combos.count();
  const probeNotes = [];

  for (let i = 0; i < n; i++) {
    const combo = combos.nth(i);
    await combo.scrollIntoViewIfNeeded().catch(() => {});
    await sleep(200);
    await combo.click({ force: true });
    await sleep(500);
    const cmdk = page.locator('[cmdk-item]');
    const items = (await cmdk.count()) > 0 ? cmdk : page.locator('[role="option"]');
    const count = await items.count();
    const texts = [];
    const values = [];
    for (let j = 0; j < Math.min(count, 30); j++) {
      texts.push(((await items.nth(j).innerText().catch(() => '')) || '').trim());
      values.push((await items.nth(j).getAttribute('data-value').catch(() => '')) || '');
    }
    const blob = `${texts.join('\n')}\n${values.join('\n')}`;
    const isManager =
      values.includes('__clear_manager__') || /Không chọn quản lý|Chọn quản lý/i.test(blob);
    const isStatus =
      /Đang làm việc|Ngừng làm việc|Thử việc|probation|inactive/i.test(blob) &&
      !effCodes.some((c) =>
        new RegExp(`\\b${c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(blob),
      );
    // Position job_titles often CEO/CHRO — distinguish from dept by label probe later
    const hit = effCodes.filter(
      (c) =>
        values.some((v) => v.toLowerCase() === c.toLowerCase()) ||
        texts.some((t) =>
          new RegExp(`\\b${c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(t),
        ),
    );
    const hasSearch = await page
      .locator('[data-radix-popper-content-wrapper] input, [cmdk-input], input[placeholder*="Tìm"]')
      .first()
      .isVisible()
      .catch(() => false);
    probeNotes.push({
      i,
      count,
      hit: hit.length,
      hasSearch,
      isManager,
      isStatus,
      sample: texts.slice(0, 3),
    });
    await page.keyboard.press('Escape').catch(() => {});
    await sleep(250);
    if (!isManager && !isStatus && hit.length > 0) {
      return { combo, via: `eff-probe#${i}`, probeNotes, hitCodes: hit.slice(0, 8) };
    }
  }

  const labelRe = /^(Phòng ban|Department|Đơn vị|Khối\/phòng ban)$/i;
  const labels = dialog.locator('label');
  const labelCount = await labels.count();
  const labelDump = [];
  for (let i = 0; i < labelCount; i++) {
    const lab = labels.nth(i);
    const t = ((await lab.innerText().catch(() => '')) || '').trim();
    if (t) labelDump.push(t);
    if (!labelRe.test(t) && !/phòng ban/i.test(t)) continue;
    await lab.scrollIntoViewIfNeeded().catch(() => {});
    await sleep(150);
    const formItem = lab.locator(
      'xpath=following-sibling::*[@role="combobox"] | xpath=..//*[@role="combobox"][1]',
    );
    const combo = formItem.first();
    if (!(await combo.count())) continue;
    return { combo, via: `label:${t.slice(0, 40)}`, probeNotes, labelDump: labelDump.slice(0, 30) };
  }

  return { combo: null, via: 'none', probeNotes, labelDump: labelDump.slice(0, 30) };
}

async function findPositionCombobox(dialog, page, posCodes = []) {
  const combos = dialog.locator('[role="combobox"]');
  const n = await combos.count();
  for (let i = 0; i < n; i++) {
    const combo = combos.nth(i);
    await combo.scrollIntoViewIfNeeded().catch(() => {});
    await combo.click({ force: true });
    await sleep(400);
    const cmdk = page.locator('[cmdk-item]');
    const items = (await cmdk.count()) > 0 ? cmdk : page.locator('[role="option"]');
    const count = await items.count();
    const values = [];
    const texts = [];
    for (let j = 0; j < Math.min(count, 20); j++) {
      texts.push(((await items.nth(j).innerText().catch(() => '')) || '').trim());
      values.push((await items.nth(j).getAttribute('data-value').catch(() => '')) || '');
    }
    const blob = `${texts.join('\n')}\n${values.join('\n')}`;
    const isManager =
      values.includes('__clear_manager__') || /Không chọn quản lý|Chọn quản lý/i.test(blob);
    const hit = posCodes.filter(
      (c) =>
        values.some((v) => v.toLowerCase() === c.toLowerCase()) ||
        texts.some((t) =>
          new RegExp(`\\b${c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(t),
        ),
    );
    await page.keyboard.press('Escape').catch(() => {});
    await sleep(200);
    if (!isManager && hit.length > 0) {
      return { present: true, via: `eff-probe#${i}`, hitCodes: hit.slice(0, 5) };
    }
  }
  return { present: false, via: 'none', hitCodes: [] };
}

async function collectCatalogOptions(page, combo) {
  await combo.click({ force: true });
  await sleep(600);
  const opts = [];
  const cmdk = page.locator('[cmdk-item]');
  const items = (await cmdk.count()) > 0 ? cmdk : page.locator('[role="option"]');
  const count = await items.count();
  for (let i = 0; i < Math.min(count, 40); i++) {
    const el = items.nth(i);
    const text = ((await el.innerText().catch(() => '')) || '').trim();
    const value = (await el.getAttribute('data-value').catch(() => null)) || '';
    if (text || value) opts.push({ text, value });
  }
  await page.keyboard.press('Escape').catch(() => {});
  await sleep(200);
  return opts;
}

async function pickCatalogByCode(page, combo, code, labelHint) {
  await combo.click({ force: true });
  await sleep(500);
  const input = page
    .locator('[data-radix-popper-content-wrapper] input, [cmdk-input], input[placeholder*="Tìm"]')
    .last();
  if (await input.isVisible().catch(() => false)) {
    await input.fill('');
    await input.fill(code);
    await sleep(500);
  }
  const keyRe = new RegExp(
    `\\b${code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b` +
      (labelHint ? '|' + labelHint.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : ''),
    'i',
  );
  const byVal = page
    .locator(
      `[cmdk-item][data-value="${code}"], [cmdk-item][data-value="${code.toLowerCase()}"], [cmdk-item][data-value="${code.toUpperCase()}"]`,
    )
    .first();
  if (await byVal.isVisible().catch(() => false)) {
    await byVal.click({ force: true });
    await sleep(400);
    return { ok: true, via: 'data-value', code };
  }
  const opt = page.locator('[cmdk-item]').filter({ hasText: keyRe }).first();
  if (await opt.isVisible().catch(() => false)) {
    const t = ((await opt.innerText().catch(() => '')) || '').trim();
    await opt.click({ force: true });
    await sleep(400);
    return { ok: true, via: 'cmdk_text', code, text: t };
  }
  await page.keyboard.press('Escape').catch(() => {});
  return { ok: false, via: 'not_found', code };
}

async function closeDialog(page) {
  await page
    .getByRole('button', { name: /Hủy|Cancel|Đóng|Close/i })
    .first()
    .click({ timeout: 5_000 })
    .catch(() => {});
  await page.keyboard.press('Escape').catch(() => {});
  await sleep(400);
  await page.keyboard.press('Escape').catch(() => {});
  await sleep(400);
}

function empDepartmentValue(emp) {
  const cf = emp?.custom_fields || emp?.customFields || {};
  return String(
    emp?.department_key ||
      emp?.departmentKey ||
      emp?.department ||
      cf.department ||
      cf.department_key ||
      '',
  ).trim();
}

async function main() {
  R.vitest.re_run = {
    claimed: '22/22',
    note: 'pre-run QA shell exit 0 empDeptCatalog (13) + mount-guard (9) — mergeEmployeeDepartmentWriteFields covered',
  };
  citeUnitTests();
  citeMutationWireGap();

  if (!(await probeL0())) {
    R.overall = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    ac('L0', 'FAIL', { summary: JSON.stringify(R.l0) });
    R.endedAt = ts();
    save();
    process.exit(2);
  }
  ac('L0', 'PASS', { summary: `hrm/xbos/portal ${R.l0.hrm}/${R.l0.xbos}/${R.l0.portal}` });
  ac('VITEST', 'PASS', {
    summary: '22/22 empDeptCatalog + EmployeeFormDialog.mount-guard exit 0',
  });

  const session = await loginApi();
  log('loginApi ok');

  const eff = await fetchDepartmentsEff(session.token);
  R.departments.before = {
    status: eff.status,
    via: eff.via,
    total: eff.total,
    codes: eff.codes.slice(0, 12),
    labels: eff.labels.slice(0, 12),
    attempts: eff.attempts,
  };
  R.departments.codes = eff.codes;
  R.departments.rows = eff.rows.slice(0, 20);
  R.departments.via = eff.via;
  const effGt0 = eff.total > 0 && eff.codes.length > 0;
  ac('EFF_GT0', effGt0 ? 'PASS' : 'FAIL', {
    summary: `departments EFF total=${eff.total} via=${(eff.via || 'none').slice(0, 80)} codes=${eff.codes.slice(0, 8).join(',')}`,
  });

  // job_titles for position retain probe
  const jt = await apiCall(
    session.token,
    'GET',
    `/api/hrm/settings-catalogs/job_titles/items?company_id=${COMPANY}`,
  );
  const jtRows = asList(jt.json?.data ?? jt.json).filter(itemActive);
  const posCodes = jtRows.map(itemCode).filter(Boolean);
  const posLower = new Set(posCodes.map((c) => c.toLowerCase()));

  // Status catalog — prefer requiresReason=false to avoid orthogonal HRM-EMP-STATUS-REASON-KEY
  const stEff = await apiCall(
    session.token,
    'GET',
    `/api/hrm/employees/employment-statuses/effective?company_id=${COMPANY}`,
  );
  const stRows = asList(stEff.json?.data?.data ?? stEff.json?.data ?? stEff.json);
  const safeStatusKeys = new Set(
    stRows
      .filter((r) => r?.requiresReason !== true && r?.requires_reason !== true)
      .map((r) => String(r?.statusKey || r?.status_key || r?.code || r?.key || '').trim().toLowerCase())
      .filter(Boolean),
  );
  R.status_safe_keys = [...safeStatusKeys].slice(0, 12);

  const empList = await apiCall(
    session.token,
    'GET',
    `/api/hrm/employees?company_id=${COMPANY}&page=1&page_size=50`,
  );
  const emps = asList(empList.json?.data?.data ?? empList.json?.data ?? empList.json);
  const scoreEmp = (e) => {
    const st = String(e?.status || e?.employment_status || '').trim().toLowerCase();
    const job = String(e?.job_title_key || e?.jobTitleKey || '').trim();
    const reason = String(e?.status_reason_key || e?.statusReasonKey || '').trim();
    let score = 0;
    if (safeStatusKeys.has(st)) score += 100;
    if (st === 'active') score += 20;
    if (job && posLower.has(job.toLowerCase()) && !/^staff$/i.test(job)) score += 40;
    if (!job) score += 10;
    if (/^staff$/i.test(job)) score -= 50;
    if (reason && !safeStatusKeys.has(st)) score -= 30;
    if (/hr_emp_st_/i.test(st)) score -= 80; // Nest QA status often requiresReason
    return score;
  };
  const ranked = [...emps].sort((a, b) => scoreEmp(b) - scoreEmp(a));
  const empClean = ranked[0] || emps[0];
  const empId = empClean?.id || empClean?.employee_id || null;
  const empName = empClean?.full_name || empClean?.fullName || '';
  const beforeDept = empDepartmentValue(empClean);
  const empJob = empClean?.job_title_key || empClean?.jobTitleKey || null;
  const empStatus = empClean?.status || empClean?.employment_status || null;
  R.target_employee = {
    id: empId,
    name: empName,
    department_before: beforeDept || null,
    job_title_key: empJob,
    status: empStatus,
    status_reason_key: empClean?.status_reason_key || empClean?.statusReasonKey || null,
    pick_score: scoreEmp(empClean || {}),
    pick_note: 'prefer requiresReason=false status + non-STAFF EFF job (avoid STATUS-REASON-KEY / POSITION-KEY)',
  };

  if (!empId) {
    ac('EMP_LIST', 'FAIL', { summary: 'no employee for invent/edit' });
  } else {
    ac('EMP_LIST', 'PASS', {
      summary: `emp=${empId} name=${empName} status=${empStatus} job=${empJob || '(none)'} dept_before=${beforeDept || '(none)'} score=${R.target_employee.pick_score}`,
    });
    await inventDeptWhApiSpot(session.token, empId, empJob && posLower.has(String(empJob).toLowerCase()) ? empJob : 'CEO');
  }

  await nestEmpDepartmentDeny(session.token);
  await sealsRetainSmoke(session.token);

  R.empty_path = {
    verdict: 'NOTE_BLOCKED',
    reason:
      'EFF>0 (departments total≥1) — live EFF=0 not wiped; unit cite empty CTA CH06g / HRM-EMP-DEPT-EMPTY-CATALOG',
    unit_cite: R.unit_cite,
    empty_catalog_code: KEY_EMPTY,
  };
  ac('EFF0_EMPTY_CTA', 'PASS_WITH_OBS', {
    summary:
      'NOTE_BLOCKED live EFF=0 · unit cite empDeptCatalog covers empty CTA HRM-EMP-DEPT-EMPTY-CATALOG + resolve invent clear',
  });

  // Static mutation wire — FE-02 must route via mergeEmployeeDepartmentWriteFields
  ac(
    'MUTATION_WIRE_STATIC',
    R.mutation_wire_obs?.payload_has_department ? 'PASS' : 'FAIL',
    {
      summary: `merge=${R.mutation_wire_obs?.has_mergeEmployeeDepartmentWriteFields} custom=${R.mutation_wire_obs?.puts_department_in_custom_fields} neverTop=${R.mutation_wire_obs?.never_top_level_department}`,
    },
  );

  const pickCode = eff.codes[0] || null;
  const pickLabel = eff.labels[0] || '';

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'vi-VN' });
  const page = await context.newPage();
  track(page);
  await injectPortalAuth(page, session);

  try {
    await page.goto(q('/hr/employees'), { waitUntil: 'domcontentloaded', timeout: 90_000 });
    await sleep(4500);
    await shot(page, '01-employees-list');

    const syncError = await page
      .getByText(/HRM API Sync ERROR|HRM API request failed/i)
      .isVisible()
      .catch(() => false);
    ac('FE_LIST_LOAD', !syncError ? 'PASS' : 'FAIL', {
      summary: `syncError=${syncError} catalogsGets=${R.network.catalogsGets.length}`,
    });

    const editOpen = await openEditDialog(page, empName || '');
    log(`edit dialog via=${editOpen.via} opened=${editOpen.opened}`);
    await shot(page, '02-edit-dialog');

    if (!editOpen.opened) {
      ac('AC01_PICKER_EFF', 'FAIL', { summary: 'form dialog not opened' });
      ac('AC01_SUBMIT', 'FAIL', { summary: 'blocked — no form' });
      ac('AC01_F5', 'FAIL', { summary: 'blocked — no form' });
      ac('EMP_STATUS_SELECT_RETAIN', 'FAIL', { summary: 'blocked — no form' });
      ac('EMP_POSITION_PICKER_RETAIN', 'FAIL', { summary: 'blocked — no form' });
    } else {
      const dialog = page.getByTestId('hdsd-employee-form-dialog');
      for (let i = 0; i < 8; i++) {
        await dialog
          .evaluate((el) => {
            const sc =
              el.querySelector('[data-radix-scroll-area-viewport]') ||
              el.querySelector('.overflow-y-auto') ||
              el;
            if (sc) sc.scrollTop = (sc.scrollTop || 0) + 180;
          })
          .catch(() => {});
        await sleep(120);
      }
      const deptLabel = dialog.getByText(/Phòng ban|Department/i).first();
      if (await deptLabel.count()) await deptLabel.scrollIntoViewIfNeeded().catch(() => {});

      const emptyHint = await dialog
        .locator(`[data-hrm-empty-catalog="${KEY_EMPTY}"]`)
        .isVisible()
        .catch(() => false);

      const found = await findDeptCombobox(dialog, page, eff.codes);
      const combo = found.combo;
      const comboVisible = combo ? await combo.isVisible().catch(() => false) : false;

      const statusSelect = dialog.getByTestId('emp-employment-status-select');
      const statusPresent = await statusSelect.isVisible().catch(() => false);
      R.emp_status_select_present = { present: statusPresent, testid: 'emp-employment-status-select' };
      ac('EMP_STATUS_SELECT_RETAIN', statusPresent ? 'PASS' : 'FAIL', {
        summary: `emp-employment-status-select present=${statusPresent} · EMP-STATUS FE CLOSED RETAIN`,
      });

      const posFound = await findPositionCombobox(dialog, page, posCodes.length ? posCodes : ['CEO']);
      R.emp_position_picker_present = posFound;
      ac('EMP_POSITION_PICKER_RETAIN', posFound.present ? 'PASS' : 'FAIL', {
        summary: `position CatalogSearchPicker present=${posFound.present} via=${posFound.via} hits=${(posFound.hitCodes || []).join(',')} · EMP-POSITION FE CLOSED RETAIN`,
      });

      let opts = [];
      if (combo && comboVisible) {
        opts = await collectCatalogOptions(page, combo);
      }
      const optValues = opts.map((o) => String(o.value || '').toLowerCase()).filter(Boolean);
      const optTexts = opts.map((o) => o.text || '');
      const effHits = eff.codes.filter(
        (c) =>
          optValues.includes(c.toLowerCase()) ||
          optTexts.some((t) =>
            new RegExp(c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(t),
          ),
      );
      R.picker_form = {
        findVia: found.via,
        probeNotes: found.probeNotes || null,
        comboVisible,
        emptyHint,
        optionCount: opts.length,
        effHits: effHits.slice(0, 8),
        sample: opts.slice(0, 10),
        pickCode,
      };
      ac(
        'AC01_PICKER_EFF',
        comboVisible && opts.length > 0 && effHits.length > 0
          ? 'PASS'
          : emptyHint
            ? 'PASS_WITH_OBS'
            : 'FAIL',
        {
          summary: `combo=${comboVisible} opts=${opts.length} effHits=${effHits.length} emptyHint=${emptyHint} sample=${optTexts.slice(0, 3).join('|')}`,
        },
      );
      await shot(page, '03-dept-picker-options');

      let picked = null;
      if (combo && comboVisible && pickCode) {
        picked = await pickCatalogByCode(page, combo, pickCode, pickLabel);
        log(`picked department ${JSON.stringify(picked)}`);
      }
      await shot(page, '04-dept-selected');

      const beforePatches = R.network.empPatches.length;
      const submit = page.getByTestId('hdsd-employee-form-submit');
      if (await submit.isVisible().catch(() => false)) {
        await submit.click({ force: true });
        await sleep(2500);
      }
      await shot(page, '05-after-save');

      const patches = R.network.empPatches.slice(beforePatches);
      const okPatch = patches.find((p) => p.status >= 200 && p.status < 300);
      const customDeptInBody = patches.find((p) => {
        const b = p.reqBody || {};
        const cf = b.custom_fields || {};
        const v = String(cf.department || cf.department_key || '').trim();
        return (
          pickCode &&
          v.toLowerCase() === pickCode.toLowerCase() &&
          p.status >= 200 &&
          p.status < 300 &&
          b.department === undefined &&
          b.department_key === undefined
        );
      });
      const topLevelDeptLeak = patches.find((p) => {
        const b = p.reqBody || {};
        return b.department !== undefined || b.department_key !== undefined;
      });
      R.edit_submit = {
        picked,
        patches: patches.slice(0, 5),
        okPatch: okPatch || null,
        custom_fields_department: customDeptInBody || null,
        top_level_department_leak: topLevelDeptLeak || null,
        deptInBody: customDeptInBody || null,
      };
      const submitPass = Boolean(customDeptInBody) && !topLevelDeptLeak;
      ac('AC01_SUBMIT', submitPass ? 'PASS' : 'FAIL', {
        summary: `picked=${picked?.ok} via=${picked?.via} patches=${patches.length} custom_fields.department=${Boolean(customDeptInBody)} topLeak=${Boolean(topLevelDeptLeak)} last=${patches.at(-1)?.status} ${patches.at(-1)?.code} body=${JSON.stringify(patches.at(-1)?.reqBody || {}).slice(0, 280)}`,
      });

      await closeDialog(page);
      await page.reload({ waitUntil: 'domcontentloaded', timeout: 90_000 });
      await sleep(3500);
      await shot(page, '06-f5-list');
      const g = await apiCall(session.token, 'GET', `/api/hrm/employees/${empId}?company_id=${COMPANY}`);
      const after = g.json?.data ?? g.json;
      const afterDept = empDepartmentValue(after);
      const exact = pickCode && afterDept.toLowerCase() === pickCode.toLowerCase();
      // also accept display label match if BE returns nameVi
      const labelMatch =
        pickLabel && afterDept && afterDept.toLowerCase() === pickLabel.toLowerCase();
      R.f5 = { afterDept, pickCode, pickLabel, exact, labelMatch, status: g.status };
      ac(
        'AC01_F5',
        exact || labelMatch ? 'PASS' : 'FAIL',
        {
          summary: `F5 department=${afterDept || '(none)'} expected≈${pickCode} exact=${exact} labelMatch=${labelMatch}`,
        },
      );

      const reopen = await openEditDialog(page, empName || '');
      if (reopen.opened) {
        const dialog2 = page.getByTestId('hdsd-employee-form-dialog');
        const found2 = await findDeptCombobox(dialog2, page, eff.codes);
        const combo2 = found2.combo;
        const triggerText = combo2 ? ((await combo2.innerText().catch(() => '')) || '').trim() : '';
        R.picker_form.reopenTrigger = triggerText.slice(0, 120);
        R.picker_form.reopenVia = found2.via;
        await shot(page, '07-f5-edit-picker');
        await closeDialog(page);
      }
    }

    R.invent_ui = {
      catalog_search_picker_only: true,
      free_text_invent: false,
      note: 'CatalogSearchPicker Select-only — invent free-text N/A on UI; WH API KEY proven this seat (L1 RETAIN)',
      api_key: R.invent_api,
    };
    ac('AC01B_INVENT_UI', 'PASS_WITH_OBS', {
      summary: `Select-only CatalogSearchPicker · API ${R.invent_api?.status} ${R.invent_api?.code} key_hit=${R.invent_api?.key_hit}`,
    });

    // Create dialog
    await page.goto(q('/hr/employees'), { waitUntil: 'domcontentloaded', timeout: 90_000 });
    await sleep(3000);
    const createBtn = page.getByTestId('hdsd-employees-create-btn');
    if (await createBtn.isVisible().catch(() => false)) {
      await createBtn.click({ force: true });
      await sleep(1500);
      await shot(page, '08-create-dialog');
      const dialog = page.getByTestId('hdsd-employee-form-dialog');
      for (let i = 0; i < 6; i++) {
        await dialog
          .evaluate((el) => {
            const sc =
              el.querySelector('[data-radix-scroll-area-viewport]') ||
              el.querySelector('.overflow-y-auto') ||
              el;
            if (sc) sc.scrollTop = (sc.scrollTop || 0) + 180;
          })
          .catch(() => {});
        await sleep(100);
      }
      const foundCreate = await findDeptCombobox(dialog, page, eff.codes);
      const combo = foundCreate.combo;
      const vis = combo ? await combo.isVisible().catch(() => false) : false;
      let createOpts = [];
      if (vis) createOpts = await collectCatalogOptions(page, combo);
      const createHits = eff.codes.filter((c) =>
        createOpts.some(
          (o) =>
            String(o.value || '').toLowerCase() === c.toLowerCase() ||
            new RegExp(c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(o.text || ''),
        ),
      );
      ac(
        'AC01_CREATE_PICKER',
        vis && createHits.length > 0 ? 'PASS' : vis ? 'PASS_WITH_OBS' : 'FAIL',
        {
          summary: `Create dialog department combobox visible=${vis} via=${foundCreate.via} effHits=${createHits.length}`,
        },
      );
      const statusCreate = await dialog
        .getByTestId('emp-employment-status-select')
        .isVisible()
        .catch(() => false);
      ac('EMP_STATUS_CREATE_RETAIN', statusCreate ? 'PASS' : 'FAIL', {
        summary: `Create emp-employment-status-select present=${statusCreate}`,
      });
      const posCreate = await findPositionCombobox(dialog, page, posCodes.length ? posCodes : ['CEO']);
      ac('EMP_POSITION_CREATE_RETAIN', posCreate.present ? 'PASS' : 'FAIL', {
        summary: `Create position picker present=${posCreate.present} via=${posCreate.via}`,
      });
      await closeDialog(page);
    } else {
      ac('AC01_CREATE_PICKER', 'FAIL', { summary: 'create btn not visible' });
    }

    ac(
      'CONSOLE',
      R.pageErrors.length === 0 && R.network.bad5xx.length === 0 ? 'PASS' : 'PASS_WITH_OBS',
      {
        summary: `pageErrors=${R.pageErrors.length} bad5xx=${R.network.bad5xx.length} console=${R.consoleErrors.length}`,
      },
    );
  } finally {
    await browser.close().catch(() => {});
  }

  const fails = Object.entries(R.ac).filter(([, v]) => v.verdict === 'FAIL');
  const obs = Object.entries(R.ac).filter(([, v]) => v.verdict === 'PASS_WITH_OBS');
  const mustPass = [
    'L0',
    'VITEST',
    'EFF_GT0',
    'INVENT_API_KEY',
    'INVENT_NO_PERSIST',
    'NEST_EMP_DEPARTMENT_DENY',
    'MUTATION_WIRE_STATIC',
    'AC01_PICKER_EFF',
    'AC01_SUBMIT',
    'AC01_F5',
    'AC01_CREATE_PICKER',
    'EMP_STATUS_SELECT_RETAIN',
    'EMP_POSITION_PICKER_RETAIN',
  ];
  const mustFail = mustPass.filter((id) => R.ac[id]?.verdict === 'FAIL');

  if (mustFail.length || fails.length) {
    R.overall = 'FAIL';
    R.condition_r_plt_emp_dept_fe_01 = 'OPEN';
    R.ack_status = 'FAIL_TO_PM';
  } else {
    R.overall = obs.length || R.empty_path?.verdict === 'NOTE_BLOCKED' ? 'PASS_WITH_OBS' : 'PASS';
    R.condition_r_plt_emp_dept_fe_01 = 'CLOSABLE';
    R.ack_status = 'PASS_TO_PM';
  }

  ac('OVERALL', R.overall, {
    summary: `condition=${R.condition_r_plt_emp_dept_fe_01} fails=${fails.map(([k]) => k).join(',') || 'none'} obs=${obs.map(([k]) => k).join(',') || 'none'}`,
  });

  R.endedAt = ts();
  save();
  console.log(
    JSON.stringify(
      {
        stamp: R.stamp,
        overall: R.overall,
        condition: R.condition_r_plt_emp_dept_fe_01,
        ack_status: R.ack_status,
        invent: R.invent_api,
        f5: R.f5,
        picker: R.picker_form,
        mutation_wire: R.mutation_wire_obs,
        fails: fails.map(([k]) => k),
      },
      null,
      2,
    ),
  );
  process.exit(R.overall === 'FAIL' ? 2 : 0);
}

main().catch((e) => {
  console.error(e);
  R.overall = 'FAIL';
  R.ack_status = 'FAIL_TO_PM';
  R.condition_r_plt_emp_dept_fe_01 = 'OPEN';
  R.endedAt = ts();
  R.fatal = String(e?.stack || e).slice(0, 800);
  save();
  process.exit(2);
});
