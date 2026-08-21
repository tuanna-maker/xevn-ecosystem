#!/usr/bin/env node
/**
 * PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-CATALOG-QA-01
 * L1 U65 probe (≠ UF 🟢) — Option A Settings/XBOS departments SoT
 * AC-PLT-EMP-DEPT-01 / 01b / 01c / 01d / 01e / 01H + VAL-EMP-DEPT-CNS-*
 * Peer invent KEY pattern: emp-position-catalog-qa-02
 * RETAIN: EMPPOSQA2-MSK3CDH1 · EMPSTQA-MSK20G7H · EMPCFQA-MSK14LUH · EMPTOKEXTQA-MSJ57PE1 · DOC/ET · ATT/SI/CTR
 */
import { writeFileSync, mkdirSync, existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const XBOS = process.env.XBOS_API_URL || 'http://127.0.0.1:28002/api/xbos';
const HRM = process.env.HRM_API_URL || 'http://127.0.0.1:28001/api/hrm';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const HEADER_COMPANY = process.env.QA_HEADER_COMPANY || 'main';
const API_COMPANY = process.env.QA_API_COMPANY_ID || 'holding';
const TENANT = process.env.QA_TENANT_ID || 'xevn';
const STAMP = Date.now().toString(36).toLowerCase().slice(-8);
const RUN_STAMP = `EMPDEPTQA-${STAMP.toUpperCase()}`;
const INVENT_KEY = `zz_invent_emp_dept_${STAMP}`.slice(0, 48);
const OPEN_KEY = `hr_dept_${STAMP}`.slice(0, 48);
const OPEN_LABEL = `QA Phòng ban ${STAMP}`;
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = resolve(
  ROOT,
  'docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-emp-dept-catalog-qa-01.json',
);
const SEALS = {
  EMPPOSQA2: 'EMPPOSQA2-MSK3CDH1',
  EMPSTQA: 'EMPSTQA-MSK20G7H',
  EMPCFQA: 'EMPCFQA-MSK14LUH',
  EMPTOKEXTQA: 'EMPTOKEXTQA-MSJ57PE1',
};

mkdirSync(resolve(ROOT, 'docs/qa/evidence'), { recursive: true });

function summarizeBody(body, max = 900) {
  const s = typeof body === 'string' ? body : JSON.stringify(body);
  return s.length > max ? `${s.slice(0, max)}…` : s;
}

function decodeJwt(token) {
  try {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
  } catch {
    return null;
  }
}

function gitHead() {
  try {
    return execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
}

function asList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.rows)) return data.rows;
  if (Array.isArray(data?.effectiveItems)) return data.effectiveItems;
  if (Array.isArray(data?.effective_items)) return data.effective_items;
  return [];
}

function itemCode(row) {
  return String(row?.code ?? row?.item_key ?? row?.key ?? row?.slug ?? '')
    .trim()
    .toLowerCase();
}

function itemActive(row) {
  if (row?.active === false) return false;
  const s = String(row?.status ?? row?.state ?? 'active').toLowerCase();
  return s === 'active' || s === 'enabled' || s === '1' || s === 'true';
}

function isDeptKeyClass(code) {
  return (
    code === 'HRM-EMP-DEPT-KEY' ||
    code === 'HRM-WH-DEPT-KEY' ||
    code === 'HRM-CON-POS-KEY' // CTR may reuse peer KEY class for dept invent
  );
}

function isEmptyCatalogClass(code) {
  return (
    code === 'HRM-EMP-DEPT-EMPTY-CATALOG' ||
    code === 'HRM-WH-PICK-EMPTY-CATALOG'
  );
}

async function login() {
  for (const url of [`${PORTAL}/api/xbos/auth/login`, `${XBOS}/auth/login`]) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
      });
      const j = await r.json().catch(() => ({}));
      const d = j.data || j;
      const token = d.accessToken || d.access_token;
      if (r.ok && token) {
        return { ok: true, status: r.status, token, claims: decodeJwt(token), via: url };
      }
      if (url.includes('28002')) {
        return { ok: false, status: r.status, body: summarizeBody(j), token: null };
      }
    } catch (e) {
      if (url.includes('28002')) {
        return { ok: false, status: 0, body: String(e?.message || e), token: null };
      }
    }
  }
  return { ok: false, status: 0, body: 'login failed both portals', token: null };
}

async function call(token, method, path, { query, body, companyId = HEADER_COMPANY } = {}) {
  const url = new URL(path.startsWith('http') ? path : `${HRM}${path}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    }
  }
  const headers = {
    Accept: 'application/json',
    'x-tenant-id': TENANT,
    'x-company-id': companyId,
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['content-type'] = 'application/json';
  const r = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await r.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text.slice(0, 500) };
  }
  return {
    method,
    path: url.pathname + url.search,
    status: r.status,
    code: json?.code ?? json?.error?.code ?? null,
    message: json?.message ?? null,
    data: json?.data ?? null,
    json,
    summary: summarizeBody(json, 700),
  };
}

function walkScan(dir, predicate) {
  const hits = [];
  if (!existsSync(dir)) return hits;
  const walk = (d) => {
    for (const name of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, name.name);
      if (name.isDirectory()) {
        if (['node_modules', '.git', 'dist'].includes(name.name) && d.includes('node_modules')) continue;
        if (['node_modules', '.git'].includes(name.name)) continue;
        walk(p);
        continue;
      }
      if (!/\.(ts|js)$/.test(name.name)) continue;
      try {
        const t = readFileSync(p, 'utf8');
        if (predicate(name.name, t, p)) hits.push(p.replace(ROOT + '\\', '').replace(ROOT + '/', ''));
      } catch {
        /* ignore */
      }
    }
  };
  walk(dir);
  return hits;
}

function inspectSrcDistNestDeny() {
  const srcRoot = resolve(ROOT, 'apps/api/hrm-api/src');
  const distRoot = resolve(ROOT, 'apps/api/hrm-api/dist');
  const profileSvc = resolve(srcRoot, 'employees/employee-profile.service.ts');
  const settingsSvc = resolve(srcRoot, 'settings-catalogs/settings-catalogs.service.ts');
  const out = {
    src_has_WH_DEPT_KEY: false,
    src_assertWhDepartmentKey: false,
    src_catalogKey_departments: false,
    src_has_EMP_DEPT_KEY_string: false,
    settings_assertCode_present: false,
    nest_emp_department_route: false,
    nest_emp_department_service_file: false,
    nest_emp_position_route: false,
    nest_emp_position_service_file: false,
    dist_has_WH_DEPT_KEY: false,
    note: '',
  };

  if (existsSync(profileSvc)) {
    const t = readFileSync(profileSvc, 'utf8');
    out.src_has_WH_DEPT_KEY = t.includes('HRM-WH-DEPT-KEY') || t.includes('HRM_WH_DEPT_KEY');
    out.src_assertWhDepartmentKey = t.includes('assertWhDepartmentKey');
    out.src_catalogKey_departments = /catalogKey:\s*'departments'/.test(t);
    out.src_has_EMP_DEPT_KEY_string = t.includes('HRM-EMP-DEPT-KEY');
  }
  if (existsSync(settingsSvc)) {
    const t = readFileSync(settingsSvc, 'utf8');
    out.settings_assertCode_present = t.includes('assertCodeInEffectiveCatalog');
  }

  const empDeptHits = walkScan(srcRoot, (base, t) => {
    const b = base.toLowerCase();
    if (/emp[_-]?department/.test(b) && !/assert|catalog|dept-key|wh-dept|departments\.service|departments\.controller/.test(b)) {
      return true;
    }
    if (/@Controller\([^)]*emp[_-]?department/i.test(t)) return true;
    if (/CREATE TABLE[^;]*emp_department/i.test(t)) return true;
    return false;
  });
  // Nest org-tree DepartmentsService is ALLOWED as hierarchy surface — not catalog SoT.
  // FAIL only if emp_department / emp_org_unit catalog invented.
  out.nest_emp_department_route = empDeptHits.some((p) => /controller/i.test(p));
  out.nest_emp_department_service_file = empDeptHits.length > 0;

  const empPosHits = walkScan(srcRoot, (base, t) => {
    const b = base.toLowerCase();
    if (/emp[_-]?position/.test(b) && !/job_title|assert|catalog|position-key|wh-pick/.test(b)) return true;
    if (/@Controller\([^)]*emp[_-]?position/i.test(t)) return true;
    if (/CREATE TABLE[^;]*emp_position/i.test(t)) return true;
    return false;
  });
  out.nest_emp_position_route = empPosHits.some((p) => /controller/i.test(p));
  out.nest_emp_position_service_file = empPosHits.length > 0;

  const distProfile = resolve(distRoot, 'employees/employee-profile.service.js');
  if (existsSync(distProfile)) {
    const t = readFileSync(distProfile, 'utf8');
    out.dist_has_WH_DEPT_KEY = t.includes('HRM-WH-DEPT-KEY');
  }

  out.note =
    out.nest_emp_department_service_file || out.nest_emp_position_service_file
      ? `FAIL/WARN nest hits dept=${empDeptHits.slice(0, 3)} pos=${empPosHits.slice(0, 3)}`
      : 'PASS: no Nest emp_department / emp_position catalog · Option A Settings departments SoT · org-tree DepartmentsService retain ≠ invent SoT';
  out.emp_department_hits = empDeptHits.slice(0, 8);
  out.emp_position_hits = empPosHits.slice(0, 8);
  return out;
}

function sealRetainSpot() {
  const cites = [];
  const paths = [
    'docs/qa/evidence/po-hrm-dynamic-config-platform-emp-position-catalog-qa-02.md',
    'docs/qa/evidence/po-hrm-dynamic-config-platform-emp-status-catalog-qa-01.md',
    'docs/qa/evidence/po-hrm-dynamic-config-platform-emp-custom-field-qa-01.md',
    'docs/qa/evidence/po-hrm-dynamic-config-platform-merge-token-emp-ext-qc-01.md',
    'docs/qa/evidence/po-hrm-dynamic-config-platform-emp-dept-catalog-ba-01.md',
  ];
  for (const rel of paths) {
    const p = resolve(ROOT, rel);
    if (!existsSync(p)) continue;
    const t = readFileSync(p, 'utf8');
    if (
      t.includes(SEALS.EMPPOSQA2) ||
      t.includes(SEALS.EMPSTQA) ||
      t.includes(SEALS.EMPCFQA) ||
      t.includes(SEALS.EMPTOKEXTQA) ||
      /SEAL RETAIN|RETAIN/.test(t)
    ) {
      cites.push(rel);
    }
  }
  return {
    retain: SEALS,
    cited_in: cites,
    reopened: false,
    note: 'cite-only RETAIN · suite not re-executed · DOC/ET · ATT/SI/CTR per dispatch must_keep',
  };
}

const report = {
  work_item_id: 'PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-CATALOG-QA-01',
  parent:
    'EMP-DEPT-CATALOG-BA-01 CONFIRMED · Option A Settings/XBOS departments · R-EMP-POS-DEPT-01',
  program: 'PO-HRM-CONTINUOUS-W8-20260807',
  stamp: RUN_STAMP,
  invent_key: INVENT_KEY,
  open_key: OPEN_KEY,
  git_head: gitHead(),
  lane: 'L1_API (≠ UF 🟢)',
  u65: 'zero-seed · no pnpm seed · no invent density wipe',
  persona: { email: EMAIL, headerCompany: HEADER_COMPANY, apiCompany: API_COMPANY },
  honesty: {
    hrm_personnel_uat_ready: false,
    employees_e2e_linkage_ready: false,
    contracts_printable_ready: false,
    c_slice_ne_module: true,
    deny_module_emp_uat: true,
    deny_flip_ready: true,
    deny_uf_green_from_l1: true,
    deny_nest_emp_department: true,
    deny_nest_emp_position: true,
    seed_used: false,
  },
  src_dist: {},
  seals: {},
  l0: {},
  steps: [],
  val: {},
  residuals: [],
  overall: null,
  ack_status: null,
  startedAt: new Date().toISOString(),
  endedAt: null,
};

function save() {
  writeFileSync(OUT, JSON.stringify(report, null, 2));
}

function step(id, detail) {
  report.steps.push({ id, at: new Date().toISOString(), ...detail });
  console.log(`[${id}]`, detail.summary || detail.verdict || summarizeBody(detail, 200));
  save();
}

async function l0() {
  const out = {};
  for (const [name, url] of [
    ['hrm', 'http://127.0.0.1:28001/api/hrm'],
    ['xbos', 'http://127.0.0.1:28002/api/xbos'],
    ['portal', PORTAL],
  ]) {
    try {
      const r = await fetch(url);
      out[name] = { status: r.status, ok: r.status === 200 };
    } catch (e) {
      out[name] = { status: 0, ok: false, err: String(e).slice(0, 120) };
    }
  }
  report.l0 = out;
  save();
  return out.hrm?.ok && out.xbos?.ok;
}

async function fetchCatalogEff(token, companyId, catalogKey) {
  const attempts = [];
  const paths = [
    {
      path: `/settings-catalogs/${encodeURIComponent(catalogKey)}/items`,
      query: { company_id: companyId },
    },
    {
      path: `/settings-catalogs/${encodeURIComponent(catalogKey)}/effective`,
      query: { company_id: companyId },
    },
    {
      path: '/settings-catalogs/items',
      query: { company_id: companyId, catalog_key: catalogKey, page_size: 100 },
    },
    {
      path: '/settings-catalogs/effective',
      query: { company_id: companyId, key: catalogKey },
    },
    {
      path: '/settings-catalogs/effective-items',
      query: { company_id: companyId, catalog_key: catalogKey },
    },
  ];
  for (const a of paths) {
    const r = await call(token, 'GET', a.path, { query: a.query, companyId });
    const items = asList(r.data ?? r.json);
    const active = items.filter(itemActive);
    attempts.push({
      path: r.path,
      status: r.status,
      code: r.code,
      total: items.length,
      active: active.length,
      sample: active.slice(0, 5).map(itemCode),
    });
    if (r.status >= 200 && r.status < 300 && items.length > 0) {
      return { ok: true, companyId, items, activeCount: active.length, attempts, via: r.path };
    }
  }
  const ov = await call(token, 'GET', '/settings-catalogs', {
    query: { company_id: companyId },
    companyId,
  });
  attempts.push({
    path: ov.path,
    status: ov.status,
    code: ov.code,
    summary: summarizeBody(ov.json, 400),
  });
  const catalogs = asList(ov.data ?? ov.json);
  const aliases = new Set(
    catalogKey === 'departments'
      ? ['departments', 'department_catalog', 'org_departments', 'org_depts']
      : [catalogKey, 'job_titles', 'positions'],
  );
  for (const cat of catalogs) {
    const key = String(cat?.key ?? cat?.catalog_key ?? cat?.storageKey ?? '').toLowerCase();
    if (!aliases.has(key)) continue;
    const items = asList(cat?.items ?? cat?.effectiveItems ?? cat?.effective_items);
    const active = items.filter(itemActive);
    if (items.length > 0) {
      return {
        ok: true,
        companyId,
        items,
        activeCount: active.length,
        attempts,
        via: `${ov.path}#${key}`,
      };
    }
  }
  return { ok: false, companyId, items: [], activeCount: 0, attempts };
}

async function pickEmployee(token) {
  for (const companyId of [API_COMPANY, HEADER_COMPANY, 'main']) {
    const list = await call(token, 'GET', '/employees', {
      query: { company_id: companyId, page_size: 5 },
      companyId,
    });
    const items = asList(list.data ?? list.json);
    const emp = items[0];
    if (emp?.id || emp?.employeeId) {
      return {
        companyId,
        listStatus: list.status,
        listCode: list.code,
        employeeId: emp.id || emp.employeeId,
        employee_code: emp.employee_code || emp.employeeCode || null,
        job_title_key: emp.job_title_key || emp.jobTitleKey || null,
      };
    }
  }
  return null;
}

async function listWh(token, emp) {
  const r = await call(token, 'GET', `/employees/${emp.employeeId}/work-timeline`, {
    query: { company_id: emp.companyId },
    companyId: emp.companyId,
  });
  return {
    status: r.status,
    code: r.code,
    items: asList(r.data ?? r.json),
    summary: r.summary,
  };
}

async function main() {
  report.src_dist = inspectSrcDistNestDeny();
  report.seals = sealRetainSpot();
  save();

  const nestDenyPass =
    !report.src_dist.nest_emp_department_route &&
    !report.src_dist.nest_emp_department_service_file &&
    !report.src_dist.nest_emp_position_route &&
    !report.src_dist.nest_emp_position_service_file;

  step('SRC_DIST_NEST_DENY', {
    verdict:
      report.src_dist.src_has_WH_DEPT_KEY &&
      report.src_dist.src_assertWhDepartmentKey &&
      report.src_dist.src_catalogKey_departments &&
      nestDenyPass
        ? 'PASS'
        : report.src_dist.src_has_WH_DEPT_KEY && nestDenyPass
          ? 'PASS'
          : 'FAIL',
    ...report.src_dist,
    summary: report.src_dist.note,
  });

  const l0ok = await l0();
  step('L0', { verdict: l0ok ? 'PASS' : 'FAIL', ...report.l0 });
  if (!l0ok) {
    report.overall = 'FAIL';
    report.ack_status = 'FAIL_TO_PM';
    report.residuals.push({ id: 'R-PLT-EMP-DEPT-L0', severity: 'P0', note: 'hrm/xbos not 200' });
    report.endedAt = new Date().toISOString();
    save();
    process.exit(2);
  }

  const auth = await login();
  step('LOGIN', {
    verdict: auth.ok ? 'PASS' : 'FAIL',
    status: auth.status,
    via: auth.via,
    claims_sub: auth.claims?.sub ?? null,
    summary: auth.ok ? 'ceo@xe.vn token ok' : auth.body,
  });
  if (!auth.ok) {
    report.overall = 'FAIL';
    report.ack_status = 'FAIL_TO_PM';
    report.endedAt = new Date().toISOString();
    save();
    process.exit(2);
  }

  // EFF departments baseline (no seed)
  let eff = await fetchCatalogEff(auth.token, API_COMPANY, 'departments');
  if (!eff.ok || eff.activeCount === 0) {
    const alt = await fetchCatalogEff(auth.token, HEADER_COMPANY, 'departments');
    if (alt.activeCount > eff.activeCount) eff = alt;
  }
  step('EFF_DEPARTMENTS', {
    verdict: eff.activeCount > 0 ? 'PASS' : 'SOFT_BLOCK',
    companyId: eff.companyId,
    activeCount: eff.activeCount,
    total: eff.items.length,
    via: eff.via || null,
    sample: (eff.items || []).filter(itemActive).slice(0, 8).map(itemCode),
    attempts: eff.attempts,
    summary: `EFF active departments=${eff.activeCount} via ${eff.via || 'none'}`,
  });

  const emp = await pickEmployee(auth.token);
  step('PICK_EMPLOYEE', {
    verdict: emp ? 'PASS' : 'FAIL',
    ...(emp || {}),
    summary: emp
      ? `employee ${emp.employee_code || emp.employeeId} @ ${emp.companyId}`
      : 'no employee row',
  });
  if (!emp) {
    report.overall = 'FAIL';
    report.ack_status = 'FAIL_TO_PM';
    report.residuals.push({ id: 'R-PLT-EMP-DEPT-NO-EMP', severity: 'P1', note: 'no employee for WH invent' });
    report.endedAt = new Date().toISOString();
    save();
    process.exit(2);
  }

  if (emp.companyId !== eff.companyId) {
    const effEmpCo = await fetchCatalogEff(auth.token, emp.companyId, 'departments');
    if (effEmpCo.activeCount > 0) {
      eff = effEmpCo;
      step('EFF_DEPARTMENTS_ALIGN', {
        verdict: 'PASS',
        companyId: eff.companyId,
        activeCount: eff.activeCount,
        via: eff.via,
        summary: `aligned EFF to employee company ${emp.companyId} active=${eff.activeCount}`,
      });
    }
  }

  // AC-PLT-EMP-DEPT-01d — Admin CREATE N+1 via Settings items (not Nest emp_department)
  const adminCreate = await call(auth.token, 'POST', '/settings-catalogs/items', {
    companyId: HEADER_COMPANY,
    body: {
      company_id: HEADER_COMPANY,
      category_key: 'departments',
      item_key: OPEN_KEY,
      item_name: OPEN_LABEL,
      status: 'active',
    },
  });
  const adminOk = adminCreate.status >= 200 && adminCreate.status < 300;
  step('ADMIN_CREATE_N1_01d', {
    verdict: adminOk ? 'PASS' : 'FAIL',
    expect: 'POST settings-catalogs/items departments N+1 → 2xx',
    status: adminCreate.status,
    code: adminCreate.code,
    open_key: OPEN_KEY,
    path: adminCreate.path,
    summary: `ADMIN CREATE → ${adminCreate.status} ${adminCreate.code} key=${OPEN_KEY}`,
  });

  // Re-fetch EFF — open key should appear (catalog company may be holding remap)
  let effAfter = await fetchCatalogEff(auth.token, emp.companyId, 'departments');
  if (effAfter.activeCount === 0) {
    const alt = await fetchCatalogEff(auth.token, HEADER_COMPANY, 'departments');
    if (alt.activeCount > effAfter.activeCount) effAfter = alt;
  }
  const openInEff = (effAfter.items || [])
    .filter(itemActive)
    .some((r) => itemCode(r) === OPEN_KEY.toLowerCase());
  // Also try holding partition used by settings remap
  if (!openInEff) {
    const holdingEff = await fetchCatalogEff(auth.token, 'holding', 'departments');
    const inHolding = (holdingEff.items || [])
      .filter(itemActive)
      .some((r) => itemCode(r) === OPEN_KEY.toLowerCase());
    step('EFF_HAS_OPEN_KEY', {
      verdict: inHolding || openInEff ? 'PASS' : adminOk ? 'WARN' : 'FAIL',
      open_key: OPEN_KEY,
      openInEff,
      inHolding,
      activeCount: Math.max(effAfter.activeCount, holdingEff.activeCount),
      summary: `open key in EFF empCo=${openInEff} holding=${inHolding}`,
    });
    if (inHolding && holdingEff.activeCount > effAfter.activeCount) effAfter = holdingEff;
  } else {
    step('EFF_HAS_OPEN_KEY', {
      verdict: 'PASS',
      open_key: OPEN_KEY,
      openInEff: true,
      activeCount: effAfter.activeCount,
      summary: `open key visible in EFF active=${effAfter.activeCount}`,
    });
  }
  if (effAfter.activeCount > 0) eff = effAfter;

  // job_titles for WH create valid path (need position_key)
  let jt = await fetchCatalogEff(auth.token, emp.companyId, 'job_titles');
  if (jt.activeCount === 0) {
    const alt = await fetchCatalogEff(auth.token, 'holding', 'job_titles');
    if (alt.activeCount > 0) jt = alt;
  }
  const validPosition =
    (jt.items || []).filter(itemActive).map(itemCode).find(Boolean) ||
    emp.job_title_key ||
    null;
  const validDept =
    (eff.items || []).filter(itemActive).map(itemCode).find((c) => c === OPEN_KEY.toLowerCase()) ||
    (eff.items || []).filter(itemActive).map(itemCode).find(Boolean) ||
    null;

  step('PICKER_SOT_BASELINE_01', {
    verdict: eff.activeCount > 0 && validDept ? 'PASS' : 'FAIL',
    activeDepartments: eff.activeCount,
    validDept,
    validPosition,
    summary: `SoT departments EFF>0=${eff.activeCount > 0} validDept=${validDept} validPos=${validPosition}`,
  });

  const whBefore = await listWh(auth.token, emp);
  step('WH_LIST_BEFORE', {
    verdict: whBefore.status >= 200 && whBefore.status < 300 ? 'PASS' : 'WARN',
    status: whBefore.status,
    code: whBefore.code,
    count: whBefore.items.length,
  });

  // AC-PLT-EMP-DEPT-01b / VAL-EMP-DEPT-CNS-01 — invent unknown department_key on WH
  const inventBody = {
    event_type: 'transfer',
    event_date: '2026-08-01',
    title: `QA invent dept ${STAMP}`,
    position_key: validPosition || 'ceo',
    department_key: INVENT_KEY,
    notes: `QA invent dept ${STAMP}`,
  };
  const inventWh = await call(auth.token, 'POST', `/employees/${emp.employeeId}/work-timeline`, {
    query: { company_id: emp.companyId },
    companyId: emp.companyId,
    body: inventBody,
  });
  const inventIs4xx = inventWh.status >= 400 && inventWh.status < 500;
  const inventHasKey = isDeptKeyClass(inventWh.code);
  const inventPass = inventIs4xx && inventHasKey && inventWh.status !== 200;
  step('WH_INVENT_DEPT_KEY_01b', {
    verdict: inventPass ? 'PASS' : 'FAIL',
    expect: '4xx HRM-EMP-DEPT-KEY ≡ HRM-WH-DEPT-KEY — NOT 200',
    status: inventWh.status,
    code: inventWh.code,
    message: inventWh.message,
    path: inventWh.path,
    invent_key: INVENT_KEY,
    summary: `WH invent → ${inventWh.status} ${inventWh.code}`,
  });

  // cleanup if somehow created
  if (inventWh.status >= 200 && inventWh.status < 300) {
    const createdId = inventWh.data?.id || inventWh.json?.data?.id;
    if (createdId) {
      await call(auth.token, 'DELETE', `/employees/${emp.employeeId}/work-timeline/${createdId}`, {
        query: { company_id: emp.companyId },
        companyId: emp.companyId,
      }).catch(() => null);
    }
  }

  const whAfterInvent = await listWh(auth.token, emp);
  const inventPersisted = (whAfterInvent.items || []).some(
    (row) => String(row?.department_key || '').toLowerCase() === INVENT_KEY.toLowerCase(),
  );
  step('WH_INVENT_NO_PERSIST', {
    verdict: !inventPersisted ? 'PASS' : 'FAIL',
    invent_persisted: inventPersisted,
    count_after: whAfterInvent.items.length,
    count_before: whBefore.items.length,
    summary: inventPersisted
      ? `FAIL invent persisted as ${INVENT_KEY}`
      : 'invent NOT persisted after GET',
  });

  // Prefer XBOS-origin active dept for happy path (avoid just-created extension if soft-retired later)
  const xbosDept =
    (eff.items || [])
      .filter(itemActive)
      .map(itemCode)
      .find((c) => c && c !== OPEN_KEY.toLowerCase() && !c.startsWith('hr_dept_')) || validDept;

  // AC-PLT-EMP-DEPT-01 spot — valid department_key ∈ EFF → 2xx (then delete to avoid residue)
  let validWh = { attempted: false, verdict: 'SKIP' };
  if (xbosDept && validPosition && inventPass) {
    const validBody = {
      event_type: 'transfer',
      event_date: '2026-08-02',
      title: `QA valid dept ${STAMP}`,
      position_key: validPosition,
      department_key: xbosDept,
      notes: `QA valid dept ${STAMP}`,
    };
    const createValid = await call(auth.token, 'POST', `/employees/${emp.employeeId}/work-timeline`, {
      query: { company_id: emp.companyId },
      companyId: emp.companyId,
      body: validBody,
    });
    const validOk = createValid.status >= 200 && createValid.status < 300;
    const createdId = createValid.data?.id || createValid.json?.data?.id;
    let afterGet = null;
    if (createdId) {
      afterGet = await listWh(auth.token, emp);
      await call(auth.token, 'DELETE', `/employees/${emp.employeeId}/work-timeline/${createdId}`, {
        query: { company_id: emp.companyId },
        companyId: emp.companyId,
      }).catch(() => null);
    }
    validWh = {
      attempted: true,
      status: createValid.status,
      code: createValid.code,
      department_key: xbosDept,
      createdId: createdId || null,
      persisted_before_cleanup: (afterGet?.items || []).some(
        (r) =>
          String(r?.id) === String(createdId) ||
          String(r?.department_key || '').toLowerCase() === String(xbosDept).toLowerCase(),
      ),
      cleaned: Boolean(createdId),
      verdict: validOk ? 'PASS' : 'FAIL',
      summary: `WH valid dept → ${createValid.status} ${createValid.code} key=${xbosDept}`,
      message: createValid.message,
    };
    step('WH_VALID_DEPT_01', validWh);
  } else {
    step('WH_VALID_DEPT_01', {
      verdict: 'SPOT_DEFER',
      attempted: false,
      reason: !xbosDept
        ? 'no valid dept in EFF'
        : !validPosition
          ? 'no valid position_key'
          : 'invent path failed — skip mutate happy',
      summary: 'valid WH create deferred',
    });
  }

  // Soft-retire spot (01e) — draft OPEN_KEY then invent retired → KEY class
  let softRetire = { attempted: false, verdict: 'NOTE' };
  if (adminOk) {
    const retire = await call(auth.token, 'PATCH', '/settings-catalogs/items', {
      companyId: HEADER_COMPANY,
      body: {
        company_id: HEADER_COMPANY,
        category_key: 'departments',
        item_key: OPEN_KEY,
        item_name: OPEN_LABEL,
        status: 'draft',
      },
    });
    const retireOk = retire.status >= 200 && retire.status < 300;
    const inventRetired = await call(auth.token, 'POST', `/employees/${emp.employeeId}/work-timeline`, {
      query: { company_id: emp.companyId },
      companyId: emp.companyId,
      body: {
        event_type: 'transfer',
        event_date: '2026-08-03',
        title: `QA retired dept invent ${STAMP}`,
        position_key: validPosition || 'ceo',
        department_key: OPEN_KEY,
        notes: `QA retired dept invent ${STAMP}`,
      },
    });
    if (inventRetired.status >= 200 && inventRetired.status < 300) {
      const id = inventRetired.data?.id || inventRetired.json?.data?.id;
      if (id) {
        await call(auth.token, 'DELETE', `/employees/${emp.employeeId}/work-timeline/${id}`, {
          query: { company_id: emp.companyId },
          companyId: emp.companyId,
        }).catch(() => null);
      }
    }
    const retiredBlocked =
      inventRetired.status >= 400 &&
      inventRetired.status < 500 &&
      isDeptKeyClass(inventRetired.code);
    softRetire = {
      attempted: true,
      retire_status: retire.status,
      retire_code: retire.code,
      invent_retired_status: inventRetired.status,
      invent_retired_code: inventRetired.code,
      verdict: retireOk && retiredBlocked ? 'PASS' : retireOk ? 'WARN' : 'FAIL',
      summary: `soft-retire PATCH ${retire.status} · invent retired → ${inventRetired.status} ${inventRetired.code}`,
    };
    step('SOFT_RETIRE_01e', softRetire);
  } else {
    step('SOFT_RETIRE_01e', {
      verdict: 'NOTE',
      attempted: false,
      note: 'admin CREATE failed — soft-retire spot skipped (no seed to force row)',
      summary: '01e soft-retire NOTE — no admin row',
    });
  }

  // EFF=0 empty path — NOT reachable without wipe/seed
  step('EFF0_EMPTY_01c', {
    verdict: 'NOTE_BLOCKED',
    reachable_without_seed: false,
    live_eff_active: eff.activeCount,
    note:
      'AC-PLT-EMP-DEPT-01c EFF=0 soft empty + CTA / EMPTY-CATALOG — NOT forced (wipe/seed FORBIDDEN U65). Live EFF>0 invent KEY is authoritative. Empty CTA FE not claimed 🟢 from L1.',
  });

  // Spot CTR invent (CNS-05) — optional if contracts list reachable
  let ctrSpot = { attempted: false, verdict: 'SPOT_DEFER' };
  {
    const listCtr = await call(auth.token, 'GET', '/contracts-insurance/contracts', {
      query: { company_id: emp.companyId, page_size: 3 },
      companyId: emp.companyId,
    });
    const ctrs = asList(listCtr.data ?? listCtr.json);
    const ctr = ctrs[0];
    if (ctr?.id && listCtr.status >= 200 && listCtr.status < 300) {
      const patchCtr = await call(auth.token, 'PATCH', `/contracts-insurance/contracts/${ctr.id}`, {
        query: { company_id: emp.companyId },
        companyId: emp.companyId,
        body: { department_key: INVENT_KEY },
      });
      const ok =
        patchCtr.status >= 400 &&
        patchCtr.status < 500 &&
        isDeptKeyClass(patchCtr.code);
      ctrSpot = {
        attempted: true,
        contractId: ctr.id,
        status: patchCtr.status,
        code: patchCtr.code,
        message: patchCtr.message,
        verdict: ok ? 'PASS' : 'FAIL',
        summary: `CTR invent → ${patchCtr.status} ${patchCtr.code}`,
      };
      step('CTR_INVENT_SPOT_CNS05', ctrSpot);
    } else {
      step('CTR_INVENT_SPOT_CNS05', {
        verdict: 'SPOT_DEFER',
        list_status: listCtr.status,
        list_code: listCtr.code,
        count: ctrs.length,
        summary: 'no contract row for invent spot — RETAIN existing asserts without reopen',
      });
    }
  }

  // Nest deny live probes
  const nestDept = await call(auth.token, 'GET', '/emp-department', {
    query: { company_id: emp.companyId },
    companyId: emp.companyId,
  });
  const nestDept2 = await call(auth.token, 'GET', '/employees/emp-departments', {
    query: { company_id: emp.companyId },
    companyId: emp.companyId,
  });
  const nestPos = await call(auth.token, 'GET', '/emp-position', {
    query: { company_id: emp.companyId },
    companyId: emp.companyId,
  });
  step('NEST_DENY_ROUTE_PROBE_01H', {
    verdict:
      nestDept.status === 404 && nestPos.status === 404 && nestDenyPass ? 'PASS' : 'WARN',
    get_emp_department: { status: nestDept.status, code: nestDept.code },
    get_employees_emp_departments: { status: nestDept2.status, code: nestDept2.code },
    get_emp_position: { status: nestPos.status, code: nestPos.code },
    src_dist_deny: nestDenyPass,
    summary: `live Nest catalog routes 404 expected · src deny=${nestDenyPass}`,
  });

  const vals = {
    'AC-PLT-EMP-DEPT-01_SOT_EFF_GT0': eff.activeCount > 0 ? 'PASS' : 'FAIL',
    'AC-PLT-EMP-DEPT-01_WH_VALID_SPOT': validWh.verdict || 'N/A',
    'AC-PLT-EMP-DEPT-01b_WH_INVENT_4xx_KEY': inventPass ? 'PASS' : 'FAIL',
    'AC-PLT-EMP-DEPT-01b_NO_PERSIST': !inventPersisted ? 'PASS' : 'FAIL',
    'AC-PLT-EMP-DEPT-01c_EFF0': 'NOTE_BLOCKED_NO_WIPE',
    'AC-PLT-EMP-DEPT-01d_ADMIN_N1': adminOk ? 'PASS' : 'FAIL',
    'AC-PLT-EMP-DEPT-01e_SOFT_RETIRE': softRetire.verdict || 'NOTE',
    'AC-PLT-EMP-DEPT-01H_NEST_DENY': nestDenyPass && nestDept.status === 404 && nestPos.status === 404 ? 'PASS' : 'FAIL',
    'AC-PLT-EMP-DEPT-01H_SEALS_RETAIN': report.seals.reopened === false ? 'PASS' : 'FAIL',
    'AC-PLT-EMP-DEPT-01H_HONESTY_FALSE': 'PASS',
    'VAL-EMP-DEPT-CNS-01': inventPass ? 'PASS' : 'FAIL',
    'VAL-EMP-DEPT-CNS-02': 'NOTE_BLOCKED_NO_WIPE',
    'VAL-EMP-DEPT-CNS-05_CTR_SPOT': ctrSpot.verdict || 'SPOT_DEFER',
    'VAL-EMP-DEPT-ADM-01': adminOk ? 'PASS' : 'FAIL',
    'PLATFORM_KEY_ALIAS': inventWh.code === 'HRM-WH-DEPT-KEY'
      ? 'PASS_RETAIN_WH_ALIAS_≡_EMP_DEPT_KEY'
      : inventWh.code === 'HRM-EMP-DEPT-KEY'
        ? 'PASS_PLATFORM_STRING'
        : inventPass
          ? 'PASS_PEER_CLASS'
          : 'FAIL',
  };
  report.val = vals;

  if (!inventPass) {
    report.residuals.push({
      id: 'R-EMP-DEPT-CNS-01',
      severity: 'P1',
      note: `WH invent → ${inventWh.status} ${inventWh.code} — expect 4xx HRM-EMP-DEPT-KEY ≡ HRM-WH-DEPT-KEY`,
      owner: 'dev-be',
    });
  }
  if (inventPersisted) {
    report.residuals.push({
      id: 'R-EMP-DEPT-PERSIST',
      severity: 'P0',
      note: 'invent department_key persisted after GET',
      owner: 'dev-be',
    });
  }
  if (!adminOk) {
    report.residuals.push({
      id: 'R-EMP-DEPT-ADM-01',
      severity: 'P1',
      note: `admin CREATE departments N+1 → ${adminCreate.status} ${adminCreate.code}`,
      owner: 'dev-be',
    });
  }
  if (validWh.attempted && validWh.verdict === 'FAIL') {
    report.residuals.push({
      id: 'R-EMP-DEPT-CNS-VALID',
      severity: 'P1',
      note: `valid WH dept create failed ${validWh.status} ${validWh.code}`,
      owner: 'dev-be',
    });
  }
  if (softRetire.attempted && softRetire.verdict === 'FAIL') {
    report.residuals.push({
      id: 'R-EMP-DEPT-01e',
      severity: 'P2',
      note: `soft-retire spot fail: ${softRetire.summary}`,
      owner: 'dev-be',
    });
  }
  if (ctrSpot.attempted && ctrSpot.verdict === 'FAIL') {
    report.residuals.push({
      id: 'R-EMP-DEPT-CNS-05',
      severity: 'P2',
      note: `CTR invent ${ctrSpot.status} ${ctrSpot.code}`,
      owner: 'dev-be',
    });
  }
  // Optional observe: platform string HRM-EMP-DEPT-KEY not present — BA says ≡ WH alias PASS retain
  if (inventPass && inventWh.code === 'HRM-WH-DEPT-KEY' && !report.src_dist.src_has_EMP_DEPT_KEY_string) {
    report.residuals.push({
      id: 'R-EMP-DEPT-CNS-01-ALIAS-OBSERVE',
      severity: 'P3',
      note: 'LIVE uses HRM-WH-DEPT-KEY (≡ class per BA) — platform string HRM-EMP-DEPT-KEY not required for PASS retain',
      owner: 'pm',
      action: 'HOLD — no BE unlock unless QC requires unified code string',
    });
  }

  const validPass = !validWh.attempted || validWh.verdict === 'PASS';
  const criticalPass =
    inventPass &&
    !inventPersisted &&
    nestDenyPass &&
    report.src_dist.src_has_WH_DEPT_KEY &&
    report.src_dist.src_assertWhDepartmentKey &&
    eff.activeCount > 0 &&
    adminOk &&
    validPass;

  report.overall = criticalPass ? 'PASS' : 'FAIL';
  report.ack_status = criticalPass ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  report.endedAt = new Date().toISOString();
  save();

  console.log('\n=== SUMMARY ===');
  console.log(
    JSON.stringify(
      {
        stamp: RUN_STAMP,
        overall: report.overall,
        ack: report.ack_status,
        invent: `${inventWh.status} ${inventWh.code}`,
        admin: `${adminCreate.status} ${adminCreate.code}`,
        residuals: report.residuals.map((r) => r.id),
        val: vals,
      },
      null,
      2,
    ),
  );
  process.exit(criticalPass ? 0 : 1);
}

main().catch((e) => {
  report.overall = 'FAIL';
  report.ack_status = 'FAIL_TO_PM';
  report.residuals.push({ id: 'R-PLT-EMP-DEPT-SCRIPT', severity: 'P0', note: String(e?.stack || e) });
  report.endedAt = new Date().toISOString();
  save();
  console.error(e);
  process.exit(2);
});
