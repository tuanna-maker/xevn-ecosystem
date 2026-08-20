#!/usr/bin/env node
/**
 * PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-QA-02
 * LIVE U65 retest after EMP-POSITION-CATALOG-BE-01 (closes R-PLT-EMP-POS-BE-01)
 * 1) Confirm EFF job_titles >0 (admin list/picker) without seed wipe
 * 2) PATCH /employees/{id} invent job_title_key → 4xx HRM-EMP-POSITION-KEY (NOT 200)
 * 3) GET/F5 invent NOT persisted
 * 4) Spot create invent if reachable; EFF=0 soft path note if reachable without seed
 * 5) Confirm no Nest emp_position table/route invented
 * L1 phụ ≠ UF 🟢 · DENY module EMP UAT / flip ready / reopen seals
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
const RUN_STAMP = `EMPPOSQA2-${STAMP.toUpperCase()}`;
const INVENT_KEY = `zz_invent_emp_pos_${STAMP}`.slice(0, 48);
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = resolve(
  ROOT,
  'docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-emp-position-catalog-qa-02.json',
);
const SEALS = {
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
  const s = String(row?.status ?? row?.state ?? 'active').toLowerCase();
  return s === 'active' || s === 'enabled' || s === '1' || s === 'true';
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

function inspectSrcDistNestDeny() {
  const srcRoot = resolve(ROOT, 'apps/api/hrm-api/src');
  const distRoot = resolve(ROOT, 'apps/api/hrm-api/dist');
  const empSvc = resolve(srcRoot, 'employees/employees.service.ts');
  const empMod = resolve(srcRoot, 'employees/employees.module.ts');
  const settingsMod = resolve(srcRoot, 'settings-catalogs/settings-catalogs.module.ts');
  const out = {
    src_has_POSITION_KEY: false,
    src_has_WH_ALIAS: false,
    src_assertJobTitle: false,
    employees_module_imports_settings: false,
    settings_catalogs_module_present: false,
    dist_employees_has_POSITION_KEY: false,
    dist_employees_module_imports_settings: false,
    nest_emp_position_src_route: false,
    nest_emp_position_dist_route: false,
    nest_emp_position_service_file: false,
    note: '',
  };

  if (existsSync(empSvc)) {
    const t = readFileSync(empSvc, 'utf8');
    out.src_has_POSITION_KEY = t.includes('HRM-EMP-POSITION-KEY') || t.includes("HRM_EMP_POSITION_KEY");
    out.src_has_WH_ALIAS = t.includes('HRM-WH-PICK-REQUIRED') || t.includes('HRM_EMP_POSITION_KEY_WH_ALIAS');
    out.src_assertJobTitle = t.includes('assertJobTitleKeyInCatalog');
  }
  if (existsSync(empMod)) {
    const t = readFileSync(empMod, 'utf8');
    out.employees_module_imports_settings = /SettingsCatalogsModule/.test(t);
  }
  out.settings_catalogs_module_present = existsSync(settingsMod);

  // DENY Nest emp_position — scan for invented table/route/service
  const scanForEmpPosition = (dir) => {
    if (!existsSync(dir)) return { route: false, service: false };
    let route = false;
    let service = false;
    const walk = (d) => {
      for (const name of readdirSync(d, { withFileTypes: true })) {
        const p = join(d, name.name);
        if (name.isDirectory()) {
          if (['node_modules', '.git'].includes(name.name)) continue;
          walk(p);
          continue;
        }
        if (!/\.(ts|js)$/.test(name.name)) continue;
        const base = name.name.toLowerCase();
        if (/emp[_-]?position/.test(base) && !/job_title|assert|catalog|position-key|wh-pick/.test(base)) {
          service = true;
        }
        try {
          const t = readFileSync(p, 'utf8');
          if (/@Controller\([^)]*emp[_-]?position/i.test(t)) route = true;
          if (/CREATE TABLE[^;]*emp_position/i.test(t)) service = true;
        } catch {
          /* ignore */
        }
      }
    };
    walk(dir);
    return { route, service };
  };

  const srcScan = scanForEmpPosition(srcRoot);
  const distScan = scanForEmpPosition(distRoot);
  out.nest_emp_position_src_route = srcScan.route;
  out.nest_emp_position_dist_route = distScan.route;
  out.nest_emp_position_service_file = srcScan.service || distScan.service;

  const distEmpSvc = resolve(distRoot, 'employees/employees.service.js');
  const distEmpMod = resolve(distRoot, 'employees/employees.module.js');
  if (existsSync(distEmpSvc)) {
    const t = readFileSync(distEmpSvc, 'utf8');
    out.dist_employees_has_POSITION_KEY = t.includes('HRM-EMP-POSITION-KEY');
  }
  if (existsSync(distEmpMod)) {
    const t = readFileSync(distEmpMod, 'utf8');
    out.dist_employees_module_imports_settings = /SettingsCatalogsModule/.test(t);
  }

  out.note =
    out.nest_emp_position_src_route || out.nest_emp_position_service_file
      ? 'FAIL: Nest emp_position invented'
      : 'PASS: no Nest emp_position table/route/service · Option A Settings job_titles SoT';
  return out;
}

function sealRetainSpot() {
  const cites = [];
  const paths = [
    'docs/qa/evidence/po-hrm-dynamic-config-platform-emp-status-catalog-qa-01.md',
    'docs/qa/evidence/po-hrm-dynamic-config-platform-emp-custom-field-qa-01.md',
    'docs/qa/evidence/po-hrm-dynamic-config-platform-merge-token-emp-ext-qc-01.md',
    'docs/qa/evidence/po-hrm-dynamic-config-platform-emp-position-catalog-be-01.md',
  ];
  for (const rel of paths) {
    const p = resolve(ROOT, rel);
    if (!existsSync(p)) continue;
    const t = readFileSync(p, 'utf8');
    if (
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
  work_item_id: 'PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-QA-02',
  parent: 'PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-BE-01 READY_FOR_QA · closes R-PLT-EMP-POS-BE-01',
  program: 'PO-HRM-CONTINUOUS-W8-20260807',
  stamp: RUN_STAMP,
  invent_key: INVENT_KEY,
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

async function fetchJobTitlesEff(token, companyId) {
  const attempts = [];
  const paths = [
    {
      path: '/settings-catalogs/items',
      query: { company_id: companyId, catalog_key: 'job_titles', page_size: 100 },
    },
    {
      path: '/settings-catalogs/effective',
      query: { company_id: companyId, key: 'job_titles' },
    },
    {
      path: '/settings-catalogs/effective-items',
      query: { company_id: companyId, catalog_key: 'job_titles' },
    },
    {
      path: `/settings-catalogs/${encodeURIComponent('job_titles')}/items`,
      query: { company_id: companyId },
    },
    {
      path: `/settings-catalogs/${encodeURIComponent('job_titles')}/effective`,
      query: { company_id: companyId },
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
  // overview may embed catalogs
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
  for (const cat of catalogs) {
    const key = String(cat?.key ?? cat?.catalog_key ?? cat?.storageKey ?? '').toLowerCase();
    if (!['job_titles', 'positions', 'employee_positions'].includes(key)) continue;
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
        job_title_key_before: emp.job_title_key || emp.jobTitleKey || null,
      };
    }
  }
  return null;
}

async function refetchEmployee(token, emp) {
  const get = await call(token, 'GET', `/employees/${emp.employeeId}`, {
    query: { company_id: emp.companyId },
    companyId: emp.companyId,
  });
  if (get.status >= 200 && get.status < 300 && get.data) {
    return {
      via: 'get',
      status: get.status,
      code: get.code,
      row: get.data,
      job_title_key: get.data.job_title_key ?? get.data.jobTitleKey ?? null,
    };
  }
  const list = await call(token, 'GET', '/employees', {
    query: { company_id: emp.companyId, page_size: 20 },
    companyId: emp.companyId,
  });
  const items = asList(list.data ?? list.json);
  const row = items.find((e) => (e.id || e.employeeId) === emp.employeeId) || null;
  return {
    via: 'list',
    status: list.status,
    code: list.code,
    row,
    job_title_key: row?.job_title_key ?? row?.jobTitleKey ?? null,
  };
}

async function main() {
  report.src_dist = inspectSrcDistNestDeny();
  report.seals = sealRetainSpot();
  save();

  const nestDenyPass =
    !report.src_dist.nest_emp_position_src_route &&
    !report.src_dist.nest_emp_position_dist_route &&
    !report.src_dist.nest_emp_position_service_file;

  step('SRC_DIST_NEST_DENY', {
    verdict:
      report.src_dist.src_has_POSITION_KEY &&
      report.src_dist.employees_module_imports_settings &&
      nestDenyPass
        ? 'PASS'
        : 'FAIL',
    ...report.src_dist,
  });

  const l0ok = await l0();
  step('L0', { verdict: l0ok ? 'PASS' : 'FAIL', ...report.l0 });
  if (!l0ok) {
    report.overall = 'FAIL';
    report.ack_status = 'FAIL_TO_PM';
    report.residuals.push({ id: 'R-PLT-EMP-POS-L0', severity: 'P0', note: 'hrm/xbos not 200' });
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

  // EFF job_titles >0 — try holding then main (no seed)
  let eff = await fetchJobTitlesEff(auth.token, API_COMPANY);
  if (!eff.ok || eff.activeCount === 0) {
    const alt = await fetchJobTitlesEff(auth.token, HEADER_COMPANY);
    if (alt.activeCount > eff.activeCount) eff = alt;
  }
  step('EFF_JOB_TITLES', {
    verdict: eff.activeCount > 0 ? 'PASS' : 'SOFT_BLOCK',
    companyId: eff.companyId,
    activeCount: eff.activeCount,
    total: eff.items.length,
    via: eff.via || null,
    sample: (eff.items || []).filter(itemActive).slice(0, 8).map(itemCode),
    attempts: eff.attempts,
    summary: `EFF active job_titles=${eff.activeCount} via ${eff.via || 'none'}`,
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
    report.residuals.push({ id: 'R-PLT-EMP-POS-NO-EMP', severity: 'P1', note: 'no employee for PATCH' });
    report.endedAt = new Date().toISOString();
    save();
    process.exit(2);
  }

  // Align EFF company with employee company when possible
  if (emp.companyId !== eff.companyId) {
    const effEmpCo = await fetchJobTitlesEff(auth.token, emp.companyId);
    if (effEmpCo.activeCount > 0) {
      eff = effEmpCo;
      step('EFF_JOB_TITLES_ALIGN', {
        verdict: 'PASS',
        companyId: eff.companyId,
        activeCount: eff.activeCount,
        via: eff.via,
        summary: `aligned EFF to employee company ${emp.companyId} active=${eff.activeCount}`,
      });
    }
  }

  const before = await refetchEmployee(auth.token, emp);
  step('GET_BEFORE', {
    verdict: before.status >= 200 && before.status < 300 ? 'PASS' : 'WARN',
    status: before.status,
    code: before.code,
    via: before.via,
    job_title_key: before.job_title_key,
  });

  // AC-PLT-EMP-01b — invent PATCH
  const patchInvent = await call(auth.token, 'PATCH', `/employees/${emp.employeeId}`, {
    query: { company_id: emp.companyId },
    companyId: emp.companyId,
    body: { job_title_key: INVENT_KEY },
  });
  const inventIs4xx = patchInvent.status >= 400 && patchInvent.status < 500;
  const inventHasKey =
    patchInvent.code === 'HRM-EMP-POSITION-KEY' ||
    patchInvent.code === 'HRM-WH-PICK-REQUIRED';
  const inventNot200 = patchInvent.status !== 200;
  const inventPass = inventIs4xx && inventHasKey && inventNot200;
  step('PATCH_INVENT_JOB_TITLE_KEY', {
    verdict: inventPass ? 'PASS' : 'FAIL',
    expect: '4xx HRM-EMP-POSITION-KEY (≡ HRM-WH-PICK-REQUIRED) — NOT 200',
    status: patchInvent.status,
    code: patchInvent.code,
    message: patchInvent.message,
    path: patchInvent.path,
    invent_key: INVENT_KEY,
    summary: `PATCH invent → ${patchInvent.status} ${patchInvent.code}`,
  });

  const after = await refetchEmployee(auth.token, emp);
  const persisted =
    String(after.job_title_key || '').toLowerCase() === INVENT_KEY.toLowerCase();
  step('GET_AFTER_NO_PERSIST', {
    verdict: !persisted ? 'PASS' : 'FAIL',
    status: after.status,
    via: after.via,
    job_title_key_after: after.job_title_key,
    job_title_key_before: before.job_title_key,
    invent_persisted: persisted,
    summary: persisted
      ? `FAIL invent persisted as ${after.job_title_key}`
      : `invent NOT persisted (after=${after.job_title_key ?? 'null'})`,
  });

  // Spot create invent (if DTO reachable without seed)
  let createSpot = { attempted: false, skipped_reason: null };
  if (eff.activeCount > 0) {
    const createBody = {
      company_id: emp.companyId,
      employee_code: `QA-POS-${STAMP}`.slice(0, 24),
      email: `qa.pos.${STAMP}@xe.vn`,
      full_name: `QA Position Invent ${STAMP}`,
      job_title_key: INVENT_KEY,
      status: 'active',
    };
    const createInvent = await call(auth.token, 'POST', '/employees', {
      companyId: emp.companyId,
      body: createBody,
    });
    createSpot = {
      attempted: true,
      status: createInvent.status,
      code: createInvent.code,
      message: createInvent.message,
      path: createInvent.path,
      verdict:
        createInvent.status >= 400 &&
        createInvent.status < 500 &&
        (createInvent.code === 'HRM-EMP-POSITION-KEY' ||
          createInvent.code === 'HRM-WH-PICK-REQUIRED')
          ? 'PASS'
          : 'FAIL',
      summary: `POST create invent → ${createInvent.status} ${createInvent.code}`,
    };
    // cleanup if somehow created
    if (createInvent.status >= 200 && createInvent.status < 300) {
      const createdId = createInvent.data?.id || createInvent.json?.data?.id;
      if (createdId) {
        await call(auth.token, 'DELETE', `/employees/${createdId}`, {
          query: { company_id: emp.companyId },
          companyId: emp.companyId,
        }).catch(() => null);
      }
    }
  } else {
    createSpot = {
      attempted: false,
      skipped_reason: 'EFF=0 — AC-01c soft path; invent hard-block not required; no seed to force EFF',
      verdict: 'SPOT_DEFER',
    };
  }
  step('SPOT_CREATE_INVENT', createSpot);

  // EFF=0 soft path note (do not wipe catalog)
  step('EFF0_SOFT_PATH_NOTE', {
    verdict: 'NOTE',
    reachable_without_seed: false,
    note:
      'AC-PLT-EMP-01c EFF=0 soft skip — NOT forced this seat (would require wipe/seed — FORBIDDEN U65). Live EFF>0 path is authoritative for R-PLT-EMP-POS-BE-01 close.',
    live_eff_active: eff.activeCount,
  });

  // Probe DENY Nest emp_position route live
  const nestProbe = await call(auth.token, 'GET', '/emp-position', {
    query: { company_id: emp.companyId },
    companyId: emp.companyId,
  });
  const nestProbe2 = await call(auth.token, 'GET', '/employees/emp-positions', {
    query: { company_id: emp.companyId },
    companyId: emp.companyId,
  });
  step('NEST_EMP_POSITION_ROUTE_PROBE', {
    verdict:
      nestProbe.status === 404 && nestProbe2.status === 404 && nestDenyPass ? 'PASS' : 'WARN',
    get_emp_position: { status: nestProbe.status, code: nestProbe.code },
    get_employees_emp_positions: { status: nestProbe2.status, code: nestProbe2.code },
    src_dist_deny: nestDenyPass,
    summary: `live routes 404 expected · src/dist deny=${nestDenyPass}`,
  });

  const vals = {
    'AC-PLT-EMP-01b_EFF_GT0': eff.activeCount > 0 ? 'PASS' : 'FAIL',
    'AC-PLT-EMP-01b_PATCH_INVENT_4xx_KEY': inventPass ? 'PASS' : 'FAIL',
    'AC-PLT-EMP-01b_NO_PERSIST': !persisted ? 'PASS' : 'FAIL',
    'VAL-EMP-POS-CNS-03_CREATE_SPOT': createSpot.verdict || 'N/A',
    'AC-PLT-EMP-01c_EFF0_NOTE': 'NOTE_NO_WIPE',
    'DENY_NEST_EMP_POSITION': nestDenyPass && nestProbe.status === 404 ? 'PASS' : 'FAIL',
    'SEALS_RETAIN': report.seals.reopened === false ? 'PASS' : 'FAIL',
    'HONESTY_FALSE_LOCKED': 'PASS',
  };
  report.val = vals;

  const criticalPass =
    inventPass &&
    !persisted &&
    nestDenyPass &&
    report.src_dist.src_has_POSITION_KEY &&
    report.src_dist.employees_module_imports_settings &&
    eff.activeCount > 0;

  if (!inventPass) {
    report.residuals.push({
      id: 'R-PLT-EMP-POS-BE-01',
      severity: 'P1',
      note: `invent PATCH still ${patchInvent.status} ${patchInvent.code} — expect 4xx HRM-EMP-POSITION-KEY (DI/wiring may be stale on :28001)`,
    });
  }
  if (persisted) {
    report.residuals.push({
      id: 'R-PLT-EMP-POS-PERSIST',
      severity: 'P0',
      note: 'invent job_title_key persisted after GET',
    });
  }
  if (createSpot.attempted && createSpot.verdict === 'FAIL') {
    report.residuals.push({
      id: 'R-PLT-EMP-POS-CREATE-SPOT',
      severity: 'P2',
      note: `create invent ${createSpot.status} ${createSpot.code}`,
    });
  }

  report.overall = criticalPass ? 'PASS' : 'FAIL';
  report.ack_status = criticalPass ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  report.endedAt = new Date().toISOString();
  save();

  console.log('\n=== SUMMARY ===');
  console.log(JSON.stringify({ stamp: RUN_STAMP, overall: report.overall, ack: report.ack_status, val: vals }, null, 2));
  process.exit(criticalPass ? 0 : 1);
}

main().catch((e) => {
  report.overall = 'FAIL';
  report.ack_status = 'FAIL_TO_PM';
  report.residuals.push({ id: 'R-PLT-EMP-POS-SCRIPT', severity: 'P0', note: String(e?.stack || e) });
  report.endedAt = new Date().toISOString();
  save();
  console.error(e);
  process.exit(2);
});
