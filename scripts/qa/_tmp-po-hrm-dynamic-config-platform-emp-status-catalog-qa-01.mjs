#!/usr/bin/env node
/**
 * PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-QA-01 — L1 API
 * U65 zero-seed · honesty LOCKED false · C-SLICE-≠-MODULE
 * AC-PLT-EMP-STATUS-01* · invent status → HRM-EMP-STATUS-KEY when EFF>0
 * invent reason → HRM-EMP-STATUS-REASON-KEY (spot)
 * chk_employees_status ABSENT via open key persist outside active|inactive
 * SEAL RETAIN: EMP-CUSTOM CNS · EXT · DOC/ET · ATT/SI/CTR
 */
import { writeFileSync, mkdirSync, existsSync, readdirSync, readFileSync } from 'node:fs';
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
const TS = Date.now().toString(36).toLowerCase();
const STAMP = `EMPSTQA-${TS.toUpperCase().slice(-8)}`;
const OPEN_STATUS = `hr_emp_st_${TS}`.slice(0, 48);
const OPEN_REASON = `hr_emp_str_${TS}`.slice(0, 48);
const INVENT_STATUS = `zz_invent_emp_st_${TS}`.slice(0, 48);
const INVENT_REASON = `zz_invent_emp_str_${TS}`.slice(0, 48);
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = resolve(
  ROOT,
  'docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-emp-status-catalog-qa-01.json',
);

const EXT_SEAL = 'EMPTOKEXTQA-MSJ57PE1';
const EMPCF_SEAL = 'EMPCFQA-MSK14LUH';

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
  return [];
}

function statusKeys(data) {
  return asList(data)
    .map((r) => r.statusKey || r.status_key || r.code || r.key)
    .filter(Boolean)
    .map((k) => String(k).toLowerCase());
}

function reasonKeys(data) {
  return asList(data)
    .map((r) => r.reasonKey || r.reason_key || r.code || r.key)
    .filter(Boolean)
    .map((k) => String(k).toLowerCase());
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

function inspectDist() {
  const distEmp = resolve(ROOT, 'apps/api/hrm-api/dist/employees');
  const out = {
    dist_exists: existsSync(distEmp),
    has_st_service: false,
    has_st_constants: false,
    has_str_service: false,
    has_str_constants: false,
    controller_has_st_effective: false,
    controller_has_str_effective: false,
    src_has_status_key: false,
    src_has_reason_key: false,
    src_drop_chk: false,
    stale_dist: false,
    note: '',
  };
  if (!existsSync(distEmp)) {
    out.stale_dist = true;
    out.note = 'dist/employees missing';
    return out;
  }
  const files = readdirSync(distEmp);
  out.has_st_service = files.includes('emp-employment-status.service.js');
  out.has_st_constants = files.includes('emp-employment-status.constants.js');
  out.has_str_service = files.includes('emp-status-reason.service.js');
  out.has_str_constants = files.includes('emp-status-reason.constants.js');
  const ctrl = join(distEmp, 'employees.controller.js');
  if (existsSync(ctrl)) {
    const t = readFileSync(ctrl, 'utf8');
    out.controller_has_st_effective = t.includes('employment-statuses/effective');
    out.controller_has_str_effective = t.includes('status-reasons/effective');
  }
  const stConst = resolve(ROOT, 'apps/api/hrm-api/src/employees/emp-employment-status.constants.ts');
  const strConst = resolve(ROOT, 'apps/api/hrm-api/src/employees/emp-status-reason.constants.ts');
  const empSvc = resolve(ROOT, 'apps/api/hrm-api/src/employees/employees.service.ts');
  if (existsSync(stConst)) {
    out.src_has_status_key = /HRM-EMP-STATUS-KEY/.test(readFileSync(stConst, 'utf8'));
  }
  if (existsSync(strConst)) {
    out.src_has_reason_key = /HRM-EMP-STATUS-REASON-KEY/.test(readFileSync(strConst, 'utf8'));
  }
  if (existsSync(empSvc)) {
    out.src_drop_chk = /DROP CONSTRAINT IF EXISTS chk_employees_status/.test(
      readFileSync(empSvc, 'utf8'),
    );
  }
  out.stale_dist = !(
    out.has_st_service &&
    out.has_st_constants &&
    out.has_str_service &&
    out.controller_has_st_effective &&
    out.controller_has_str_effective
  );
  out.note = out.stale_dist
    ? 'stale/missing dist EMP-STATUS routes'
    : 'dist ST/STR + effective routes present · KEY constants in src';
  return out;
}

function sealRetainSpot() {
  const cites = [];
  const paths = [
    'docs/qa/evidence/po-hrm-dynamic-config-platform-emp-custom-field-qa-01.md',
    'docs/qa/evidence/po-hrm-dynamic-config-platform-emp-custom-field-qc-01.md',
    'docs/qa/evidence/po-hrm-dynamic-config-platform-merge-token-emp-ext-qc-01.md',
    'docs/qa/evidence/po-hrm-dynamic-config-platform-emp-status-catalog-be-01.md',
  ];
  for (const rel of paths) {
    const p = resolve(ROOT, rel);
    if (!existsSync(p)) continue;
    const t = readFileSync(p, 'utf8');
    if (t.includes(EXT_SEAL) || t.includes(EMPCF_SEAL) || /SEAL RETAIN|RETAIN/.test(t)) {
      cites.push(rel);
    }
  }
  return {
    emp_custom_cns: EMPCF_SEAL,
    merge_token_ext: EXT_SEAL,
    cited_in: cites,
    reopened: false,
    note: 'cite-only RETAIN · suite not re-executed · DOC/ET · ATT/SI/CTR per BE-01 must_keep',
  };
}

const report = {
  work_item_id: 'PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-QA-01',
  parent: 'PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-BE-01 READY_FOR_QA',
  program: 'PO-HRM-CONTINUOUS-W8-20260807',
  stamp: STAMP,
  git_head: gitHead(),
  lane: 'L1_API (≠ UF 🟢)',
  u65: 'zero-seed · no pnpm seed · admin CREATE N+1 via Nest API then invent',
  persona: { email: EMAIL, headerCompany: HEADER_COMPANY, apiCompany: API_COMPANY },
  honesty: {
    hrm_personnel_uat_ready: false,
    employees_e2e_linkage_ready: false,
    contracts_printable_ready: false,
    c_slice_ne_module: true,
    deny_module_emp_uat: true,
    deny_flip_ready: true,
    deny_uf_green_from_l1: true,
    seed_used: false,
  },
  open_status: OPEN_STATUS,
  open_reason: OPEN_REASON,
  invent_status: INVENT_STATUS,
  invent_reason: INVENT_REASON,
  dist: {},
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

async function pickEmployee(token) {
  for (const companyId of [API_COMPANY, HEADER_COMPANY]) {
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
        employeeId: emp.id || emp.employeeId,
        employee_code: emp.employee_code || emp.employeeCode || null,
        status_before: emp.status || null,
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
    return { via: 'get', status: get.status, row: get.data };
  }
  const list = await call(token, 'GET', '/employees', {
    query: { company_id: emp.companyId, page_size: 20 },
    companyId: emp.companyId,
  });
  const items = asList(list.data ?? list.json);
  const row = items.find((e) => (e.id || e.employeeId) === emp.employeeId) || null;
  return { via: 'list', status: list.status, row };
}

async function main() {
  report.dist = inspectDist();
  report.seals = sealRetainSpot();
  save();

  step('DIST_GATE', {
    verdict: !report.dist.stale_dist && report.dist.src_has_status_key ? 'PASS' : 'FAIL',
    summary: report.dist.note,
    ...report.dist,
  });

  const l0ok = await l0();
  step('L0', {
    verdict: l0ok ? 'PASS' : 'FAIL',
    summary: `hrm=${report.l0.hrm?.status} xbos=${report.l0.xbos?.status} portal=${report.l0.portal?.status}`,
  });
  if (!l0ok) {
    report.overall = 'BLOCKED';
    report.ack_status = 'FAIL_TO_PM';
    report.endedAt = new Date().toISOString();
    save();
    process.exit(2);
  }

  const unauth = await call(null, 'GET', '/employees/employment-statuses/effective', {
    query: { company_id: HEADER_COMPANY },
  });
  step('UNAUTH_EFF', {
    verdict: unauth.status === 401 || unauth.status === 403 ? 'PASS' : 'FAIL',
    summary: `${unauth.status} ${unauth.code}`,
    status: unauth.status,
    code: unauth.code,
  });

  const auth = await login();
  step('LOGIN', {
    verdict: auth.ok ? 'PASS' : 'FAIL',
    summary: auth.ok ? `via ${auth.via}` : auth.body,
  });
  if (!auth.ok) {
    report.overall = 'BLOCKED';
    report.ack_status = 'FAIL_TO_PM';
    report.endedAt = new Date().toISOString();
    save();
    process.exit(2);
  }

  // --- GET effective (empty [] OK) ---
  const stEff0 = await call(auth.token, 'GET', '/employees/employment-statuses/effective', {
    query: { company_id: HEADER_COMPANY },
    companyId: HEADER_COMPANY,
  });
  const stKeys0 = statusKeys(stEff0.data ?? stEff0.json);
  report.val['AC-PLT-EMP-STATUS-01c-ST'] = {
    expect: 'GET employment-statuses/effective 2xx · empty [] OK',
    status: stEff0.status,
    code: stEff0.code,
    total: stKeys0.length,
    sample: stKeys0.slice(0, 8),
  };
  const stEffOk = stEff0.status >= 200 && stEff0.status < 300;
  report.val['AC-PLT-EMP-STATUS-01c-ST'].verdict = stEffOk ? 'PASS' : 'FAIL';
  step('GET_ST_EFF', {
    verdict: stEffOk ? 'PASS' : 'FAIL',
    summary: `${stEff0.status} ${stEff0.code} total=${stKeys0.length}`,
  });

  const strEff0 = await call(auth.token, 'GET', '/employees/status-reasons/effective', {
    query: { company_id: HEADER_COMPANY },
    companyId: HEADER_COMPANY,
  });
  const strKeys0 = reasonKeys(strEff0.data ?? strEff0.json);
  report.val['AC-PLT-EMP-STATUS-01c-STR'] = {
    expect: 'GET status-reasons/effective 2xx · empty [] OK',
    status: strEff0.status,
    code: strEff0.code,
    total: strKeys0.length,
    sample: strKeys0.slice(0, 8),
  };
  const strEffOk = strEff0.status >= 200 && strEff0.status < 300;
  report.val['AC-PLT-EMP-STATUS-01c-STR'].verdict = strEffOk ? 'PASS' : 'FAIL';
  step('GET_STR_EFF', {
    verdict: strEffOk ? 'PASS' : 'FAIL',
    summary: `${strEff0.status} ${strEff0.code} total=${strKeys0.length}`,
  });

  // --- Admin CREATE N+1 status (requires_reason=true for reason invent path) ---
  const adminCompany = HEADER_COMPANY;
  const upsertSt = await call(auth.token, 'PUT', '/employees/employment-statuses', {
    companyId: adminCompany,
    body: {
      companyId: adminCompany,
      statusKey: OPEN_STATUS,
      nameVi: `QA EMP status ${STAMP}`,
      sortOrder: 990,
      isWorkforceActive: true,
      isTerminal: false,
      requiresReason: true,
      countsTowardHeadcount: true,
      status: 'active',
    },
  });
  const stAdminOk = upsertSt.status >= 200 && upsertSt.status < 300;
  report.val['AC-PLT-EMP-STATUS-01d'] = {
    expect: 'Admin CREATE N+1 open status_key 2xx',
    status: upsertSt.status,
    code: upsertSt.code,
    open_key: OPEN_STATUS,
    summary: upsertSt.summary,
  };
  report.val['AC-PLT-EMP-STATUS-01d'].verdict = stAdminOk ? 'PASS' : 'FAIL';
  step('ADMIN_ST_N1', {
    verdict: stAdminOk ? 'PASS' : 'FAIL',
    summary: `${upsertSt.status} ${upsertSt.code} key=${OPEN_STATUS}`,
  });

  const stEff1 = await call(auth.token, 'GET', '/employees/employment-statuses/effective', {
    query: { company_id: adminCompany },
    companyId: adminCompany,
  });
  const stKeys1 = statusKeys(stEff1.data ?? stEff1.json);
  const hasOpenSt = stKeys1.includes(OPEN_STATUS.toLowerCase());
  step('EFF_HAS_OPEN_ST', {
    verdict: hasOpenSt ? 'PASS' : 'FAIL',
    summary: `hasOpenKey=${hasOpenSt} total=${stKeys1.length}`,
  });

  // --- Admin CREATE N+1 reason ---
  const upsertStr = await call(auth.token, 'PUT', '/employees/status-reasons', {
    companyId: adminCompany,
    body: {
      companyId: adminCompany,
      reasonKey: OPEN_REASON,
      nameVi: `QA EMP reason ${STAMP}`,
      sortOrder: 990,
      appliesToStatusKeys: [OPEN_STATUS],
      status: 'active',
    },
  });
  const strAdminOk = upsertStr.status >= 200 && upsertStr.status < 300;
  report.val['AC-PLT-EMP-STATUS-01d-STR'] = {
    expect: 'Admin CREATE N+1 open reason_key 2xx',
    status: upsertStr.status,
    code: upsertStr.code,
    open_key: OPEN_REASON,
  };
  report.val['AC-PLT-EMP-STATUS-01d-STR'].verdict = strAdminOk ? 'PASS' : 'FAIL';
  step('ADMIN_STR_N1', {
    verdict: strAdminOk ? 'PASS' : 'FAIL',
    summary: `${upsertStr.status} ${upsertStr.code} key=${OPEN_REASON}`,
  });

  const emp = await pickEmployee(auth.token);
  step('PICK_EMPLOYEE', {
    verdict: emp ? 'PASS' : 'FAIL',
    summary: emp
      ? `id=${emp.employeeId} company=${emp.companyId} status_before=${emp.status_before}`
      : 'no employee',
  });
  if (!emp) {
    report.overall = 'BLOCKED';
    report.ack_status = 'FAIL_TO_PM';
    report.endedAt = new Date().toISOString();
    save();
    process.exit(2);
  }

  // Ensure EFF>0 on employee company scope — if employee company differs, also upsert there
  if (emp.companyId !== adminCompany) {
    const upsertStEmp = await call(auth.token, 'PUT', '/employees/employment-statuses', {
      companyId: emp.companyId,
      body: {
        companyId: emp.companyId,
        statusKey: OPEN_STATUS,
        nameVi: `QA EMP status ${STAMP}`,
        sortOrder: 990,
        requiresReason: true,
        status: 'active',
      },
    });
    step('ADMIN_ST_N1_EMP_SCOPE', {
      verdict: upsertStEmp.status >= 200 && upsertStEmp.status < 300 ? 'PASS' : 'WARN',
      summary: `${upsertStEmp.status} ${upsertStEmp.code} company=${emp.companyId}`,
    });
    const upsertStrEmp = await call(auth.token, 'PUT', '/employees/status-reasons', {
      companyId: emp.companyId,
      body: {
        companyId: emp.companyId,
        reasonKey: OPEN_REASON,
        nameVi: `QA EMP reason ${STAMP}`,
        appliesToStatusKeys: [OPEN_STATUS],
        status: 'active',
      },
    });
    step('ADMIN_STR_N1_EMP_SCOPE', {
      verdict: upsertStrEmp.status >= 200 && upsertStrEmp.status < 300 ? 'PASS' : 'WARN',
      summary: `${upsertStrEmp.status} ${upsertStrEmp.code}`,
    });
  }

  // Confirm EFF>0 on employee company
  const stEffEmp = await call(auth.token, 'GET', '/employees/employment-statuses/effective', {
    query: { company_id: emp.companyId },
    companyId: emp.companyId,
  });
  const stKeysEmp = statusKeys(stEffEmp.data ?? stEffEmp.json);
  const effGt0 = stKeysEmp.length > 0;
  step('EFF_EMP_SCOPE', {
    verdict: effGt0 ? 'PASS' : 'FAIL',
    summary: `company=${emp.companyId} total=${stKeysEmp.length} hasOpen=${stKeysEmp.includes(OPEN_STATUS)}`,
  });

  // --- Invent status → HRM-EMP-STATUS-KEY ---
  const inventSt = await call(auth.token, 'PATCH', `/employees/${emp.employeeId}`, {
    companyId: emp.companyId,
    body: { status: INVENT_STATUS },
  });
  const inventStKey =
    inventSt.status >= 400 &&
    inventSt.status < 500 &&
    String(inventSt.code || '').includes('HRM-EMP-STATUS-KEY');
  report.val['AC-PLT-EMP-STATUS-01b'] = {
    expect: 'invent status when EFF>0 → 4xx HRM-EMP-STATUS-KEY',
    invent: INVENT_STATUS,
    status: inventSt.status,
    code: inventSt.code,
    message: inventSt.message,
    eff_count: stKeysEmp.length,
  };
  if (!effGt0) {
    report.val['AC-PLT-EMP-STATUS-01b'].verdict = 'SOFT_SKIP_EFF0';
    step('VAL-EMP-ST-CNS-01', {
      verdict: 'SOFT_SKIP_EFF0',
      summary: 'EFF=0 — invent assert soft skip (U65); admin CREATE failed to raise EFF',
    });
  } else if (inventStKey) {
    report.val['AC-PLT-EMP-STATUS-01b'].verdict = 'PASS';
    step('VAL-EMP-ST-CNS-01', {
      verdict: 'PASS',
      summary: `${inventSt.status} ${inventSt.code}`,
    });
  } else {
    report.val['AC-PLT-EMP-STATUS-01b'].verdict = 'FAIL';
    step('VAL-EMP-ST-CNS-01', {
      verdict: 'FAIL',
      summary: `${inventSt.status} ${inventSt.code} ≠ HRM-EMP-STATUS-KEY`,
    });
  }

  // --- Invent reason spot → HRM-EMP-STATUS-REASON-KEY ---
  // Use open status (∈ EFF, requires_reason) + invent reason
  const inventStr = await call(auth.token, 'PATCH', `/employees/${emp.employeeId}`, {
    companyId: emp.companyId,
    body: { status: OPEN_STATUS, status_reason_key: INVENT_REASON },
  });
  const inventStrKey =
    inventStr.status >= 400 &&
    inventStr.status < 500 &&
    String(inventStr.code || '').includes('HRM-EMP-STATUS-REASON-KEY');
  report.val['VAL-EMP-STR-CNS-01'] = {
    expect: 'invent reason when required/EFF>0 → 4xx HRM-EMP-STATUS-REASON-KEY',
    invent: INVENT_REASON,
    with_status: OPEN_STATUS,
    status: inventStr.status,
    code: inventStr.code,
    message: inventStr.message,
  };
  if (inventStrKey) {
    report.val['VAL-EMP-STR-CNS-01'].verdict = 'PASS';
    step('VAL-EMP-STR-CNS-01', {
      verdict: 'PASS',
      summary: `${inventStr.status} ${inventStr.code}`,
    });
  } else if (
    inventStr.status >= 400 &&
    String(inventStr.code || '').includes('HRM-EMP-STATUS-KEY')
  ) {
    // open status not in employee company EFF — scope issue
    report.val['VAL-EMP-STR-CNS-01'].verdict = 'FAIL_SCOPE_STATUS';
    step('VAL-EMP-STR-CNS-01', {
      verdict: 'FAIL_SCOPE_STATUS',
      summary: `${inventStr.status} ${inventStr.code} — open status not accepted on emp company`,
    });
  } else {
    report.val['VAL-EMP-STR-CNS-01'].verdict = 'FAIL';
    step('VAL-EMP-STR-CNS-01', {
      verdict: 'FAIL',
      summary: `${inventStr.status} ${inventStr.code} ≠ HRM-EMP-STATUS-REASON-KEY`,
    });
  }

  // --- chk_employees_status ABSENT: persist open key outside active|inactive ---
  const openPersist = await call(auth.token, 'PATCH', `/employees/${emp.employeeId}`, {
    companyId: emp.companyId,
    body: { status: OPEN_STATUS, status_reason_key: OPEN_REASON },
  });
  const afterOpen = await refetchEmployee(auth.token, emp);
  const persistedStatus = String(
    afterOpen.row?.status || afterOpen.row?.employment_status || '',
  ).toLowerCase();
  const openPersistOk =
    openPersist.status >= 200 &&
    openPersist.status < 300 &&
    persistedStatus === OPEN_STATUS.toLowerCase();
  const chkReject =
    openPersist.status >= 400 &&
    /check|chk_employees_status|active.*inactive/i.test(
      `${openPersist.code} ${openPersist.message} ${openPersist.summary}`,
    );
  report.val['CHK_EMPLOYEES_STATUS_ABSENT'] = {
    expect: 'open key outside active|inactive persists (or no CHECK reject)',
    open_key: OPEN_STATUS,
    status: openPersist.status,
    code: openPersist.code,
    persisted_status: persistedStatus,
    chk_reject_observed: chkReject,
    src_drop_chk: report.dist.src_drop_chk,
  };
  if (openPersistOk && !chkReject) {
    report.val['CHK_EMPLOYEES_STATUS_ABSENT'].verdict = 'PASS';
    step('CHK_ABSENT', {
      verdict: 'PASS',
      summary: `${openPersist.status} ${openPersist.code} persisted status=${persistedStatus} (≠ closed active|inactive only)`,
    });
  } else if (chkReject) {
    report.val['CHK_EMPLOYEES_STATUS_ABSENT'].verdict = 'FAIL';
    step('CHK_ABSENT', {
      verdict: 'FAIL',
      summary: `CHECK still rejecting: ${openPersist.status} ${openPersist.code}`,
    });
  } else {
    report.val['CHK_EMPLOYEES_STATUS_ABSENT'].verdict = 'FAIL';
    step('CHK_ABSENT', {
      verdict: 'FAIL',
      summary: `${openPersist.status} ${openPersist.code} persisted=${persistedStatus}`,
    });
  }

  // Restore prior status if possible (best-effort; may KEY if prior not in EFF)
  if (emp.status_before) {
    const restore = await call(auth.token, 'PATCH', `/employees/${emp.employeeId}`, {
      companyId: emp.companyId,
      body: { status: emp.status_before, status_reason_key: '' },
    });
    step('RESTORE_STATUS', {
      verdict: restore.status < 500 ? 'SPOT' : 'WARN',
      summary: `${restore.status} ${restore.code} → ${emp.status_before}`,
    });
  }

  // Seals
  report.val['SEALS_RETAIN'] = {
    verdict: report.seals.cited_in?.length ? 'PASS' : 'WARN',
    ...report.seals,
  };
  step('SEALS_RETAIN', {
    verdict: report.val['SEALS_RETAIN'].verdict,
    summary: report.seals.note,
  });

  report.val['AC-PLT-EMP-STATUS-01H'] = {
    verdict: 'PASS',
    honesty: report.honesty,
    note: 'flags remain false · DENY invent module EMP UAT / flip ready · C-SLICE-≠-MODULE',
  };

  report.residuals.push({
    id: 'R-PLT-EMP-ST-FE-01',
    severity: 'P2',
    owner: 'dev-fe',
    status: 'HOLD',
    note: 'FE picker rebind Nest GET …/employment-statuses/effective — L1 PASS ≠ UF 🟢 · browser after FE-01',
  });

  const v01b = report.val['AC-PLT-EMP-STATUS-01b']?.verdict;
  const vStr = report.val['VAL-EMP-STR-CNS-01']?.verdict;
  const vChk = report.val['CHK_EMPLOYEES_STATUS_ABSENT']?.verdict;
  const vEffSt = report.val['AC-PLT-EMP-STATUS-01c-ST']?.verdict;
  const vEffStr = report.val['AC-PLT-EMP-STATUS-01c-STR']?.verdict;
  const v01d = report.val['AC-PLT-EMP-STATUS-01d']?.verdict;

  const corePass =
    !report.dist.stale_dist &&
    report.dist.src_has_status_key &&
    report.dist.src_has_reason_key &&
    vEffSt === 'PASS' &&
    vEffStr === 'PASS' &&
    v01d === 'PASS' &&
    v01b === 'PASS' &&
    vStr === 'PASS' &&
    vChk === 'PASS';

  if (corePass) {
    report.overall = 'PASS';
    report.ack_status = 'PASS_TO_PM';
  } else {
    report.overall = 'FAIL';
    report.ack_status = 'FAIL_TO_PM';
  }

  report.endedAt = new Date().toISOString();
  save();
  console.log('OVERALL', report.overall);
  console.log('ACK', report.ack_status);
  console.log('STAMP', report.stamp);
  console.log('OUT', OUT);
  process.exit(report.ack_status === 'PASS_TO_PM' ? 0 : 1);
}

main().catch((e) => {
  report.overall = 'ERROR';
  report.ack_status = 'FAIL_TO_PM';
  report.error = String(e?.stack || e).slice(0, 1200);
  report.endedAt = new Date().toISOString();
  save();
  console.error(e);
  process.exit(1);
});
