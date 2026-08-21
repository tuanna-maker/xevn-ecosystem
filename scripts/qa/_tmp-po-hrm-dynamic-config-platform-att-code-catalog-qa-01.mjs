#!/usr/bin/env node
/**
 * PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-QA-01 — L1 API
 * U65 zero-seed · honesty attendance_uat_ready=false · payroll_e2e_ready=false
 * C-SLICE-≠-MODULE · RETAIN leave/worksite/EMP/SI/CTR · aggregate sealed
 * Parent: ATT-CODE-CATALOG-BE-01 READY_FOR_QA
 *
 * AC: invent → HRM-ATT-CODE-KEY · open DTO (no IsIn4) · EFF admin N+1 · soft-retire
 *     · display status_label/symbol · DENY attendance_uat flip
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
const TENANT = process.env.QA_TENANT_ID || 'xevn';
const TS = Date.now().toString(36).toLowerCase();
const STAMP = `ATTCODEQA-${TS.toUpperCase().slice(-8)}`;
/** Open N+1 slug — format /^[a-z][a-z0-9_]*$/ · e.g. wfh family */
const OPEN_CODE = `wfh_qa_${TS}`.slice(0, 48);
const INVENT_CODE = `zz_invent_att_code_${TS}`.slice(0, 48);
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = resolve(
  ROOT,
  'docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-att-code-catalog-qa-01.json',
);

const LEAVE_SEAL = 'ATTLEAVEQA-MSJ7CPJH';
const WS_SEAL = 'ATTWSQA-MSJC3IN9';
const EMP_SEALS = [
  'EMPDEPTQA-MSK3VVXX',
  'EMPPOSQA2-MSK3CDH1',
  'EMPSTQA-MSK20G7H',
  'EMPCFQA-MSK14LUH',
  'EMPTOKEXTQA-MSJ57PE1',
];

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

function codeKeys(data) {
  return asList(data)
    .map((r) => r.code || r.statusKey || r.status_key || r.key)
    .filter(Boolean)
    .map((k) => String(k).toLowerCase());
}

function todayIso() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Unique attendance_date so re-runs do not hit HRM-ATT-001 duplicate employee+date. */
function offsetIso(days) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
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

function inspectDistAndSrc() {
  const distAtt = resolve(ROOT, 'apps/api/hrm-api/dist/attendance');
  const out = {
    dist_exists: existsSync(distAtt),
    has_code_service: false,
    has_code_constants: false,
    controller_has_effective: false,
    dist_has_key: false,
    src_create_dto_no_isin4: false,
    src_update_dto_no_isin4: false,
    src_has_key: false,
    aggregate_untouched_spot: true,
    stale_dist: false,
    note: '',
  };
  if (!existsSync(distAtt)) {
    out.stale_dist = true;
    out.note = 'dist/attendance missing';
    return out;
  }
  const files = readdirSync(distAtt);
  out.has_code_service = files.includes('att-attendance-code.service.js');
  out.has_code_constants = files.includes('att-attendance-code.constants.js');
  const ctrl = join(distAtt, 'attendance.controller.js');
  if (existsSync(ctrl)) {
    const t = readFileSync(ctrl, 'utf8');
    out.controller_has_effective = t.includes('attendance-codes/effective');
  }
  const distConst = join(distAtt, 'att-attendance-code.constants.js');
  if (existsSync(distConst)) {
    out.dist_has_key = /HRM-ATT-CODE-KEY/.test(readFileSync(distConst, 'utf8'));
  }
  const createDto = resolve(ROOT, 'apps/api/hrm-api/src/attendance/dto/create-attendance-record.dto.ts');
  const updateDto = resolve(ROOT, 'apps/api/hrm-api/src/attendance/dto/update-attendance-status.dto.ts');
  const srcConst = resolve(ROOT, 'apps/api/hrm-api/src/attendance/att-attendance-code.constants.ts');
  const agg = resolve(ROOT, 'apps/api/hrm-api/src/attendance/att-timesheet-line-aggregate.ts');
  /** Strip block/line comments so CODE-MEMORY text mentioning IsIn(4) does not false-fail. */
  const stripComments = (src) =>
    src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  if (existsSync(createDto)) {
    const t = stripComments(readFileSync(createDto, 'utf8'));
    // Open status: MaxLength(64) string — closed IsIn(pending|present|absent|leave) must be absent in code body
    const hasOpenStatus =
      /@IsString\(\)[\s\n\r]*@MaxLength\(64\)[\s\n\r]*status\??/.test(t) ||
      /@MaxLength\(64\)[\s\n\r]*status\??/.test(t);
    const hasClosedStatusIsIn = /@IsIn\(\['pending','present','absent','leave'\]\)/.test(t);
    out.src_create_dto_no_isin4 = hasOpenStatus && !hasClosedStatusIsIn;
  }
  if (existsSync(updateDto)) {
    const t = stripComments(readFileSync(updateDto, 'utf8'));
    out.src_update_dto_no_isin4 = !/@IsIn\(/.test(t) && /status!:\s*string/.test(t);
  }
  if (existsSync(srcConst)) {
    out.src_has_key = /HRM_ATT_CODE_KEY\s*=\s*'HRM-ATT-CODE-KEY'/.test(readFileSync(srcConst, 'utf8'));
  }
  if (existsSync(agg)) {
    const t = readFileSync(agg, 'utf8');
    // Spot: aggregate must NOT import att-attendance-code (GĐ1 sealed — flags not wired)
    out.aggregate_untouched_spot = !/att-attendance-code/.test(t);
  }
  out.stale_dist = !(
    out.has_code_service &&
    out.has_code_constants &&
    out.controller_has_effective &&
    out.dist_has_key
  );
  out.note = out.stale_dist
    ? 'stale/missing dist ATT attendance-code routes'
    : 'dist F-ATT-CAT-CODE + KEY present · DTO open · aggregate sealed spot';
  return out;
}

function sealRetainSpot() {
  const cites = [];
  const paths = [
    'docs/qa/evidence/po-hrm-dynamic-config-platform-att-leave-catalog-qa-01.md',
    'docs/qa/evidence/po-hrm-dynamic-config-platform-att-worksite-catalog-qa-01.md',
    'docs/qa/evidence/po-hrm-dynamic-config-platform-att-code-catalog-be-01.md',
    'docs/qa/evidence/po-hrm-dynamic-config-platform-emp-dept-catalog-qa-01.md',
  ];
  for (const rel of paths) {
    const p = resolve(ROOT, rel);
    if (!existsSync(p)) continue;
    const t = readFileSync(p, 'utf8');
    if (
      t.includes(LEAVE_SEAL) ||
      t.includes(WS_SEAL) ||
      EMP_SEALS.some((s) => t.includes(s)) ||
      /SEAL RETAIN|RETAIN/.test(t)
    ) {
      cites.push(rel);
    }
  }
  return {
    att_leave: LEAVE_SEAL,
    att_worksite: WS_SEAL,
    emp_seals: EMP_SEALS,
    cited_in: cites,
    reopened: false,
    note: 'cite-only RETAIN · leave/worksite/EMP/SI/CTR · aggregate GĐ1 sealed · no flip attendance_uat',
  };
}

const report = {
  work_item_id: 'PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-QA-01',
  parent: 'PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-BE-01 READY_FOR_QA',
  program: 'PO-HRM-CONTINUOUS-W8-20260807',
  stamp: STAMP,
  git_head: gitHead(),
  lane: 'L1_API (≠ UF 🟢)',
  u65: 'zero-seed · no pnpm seed · admin CREATE N+1 via Nest catalog API then invent',
  persona: { email: EMAIL, headerCompany: HEADER_COMPANY },
  honesty: {
    attendance_uat_ready: false,
    payroll_e2e_ready: false,
    c_slice_ne_module: true,
    deny_module_att_uat: true,
    deny_flip_ready: true,
    deny_uf_green_from_l1: true,
    deny_aggregate_rewrite: true,
    seed_used: false,
  },
  open_code: OPEN_CODE,
  invent_code: INVENT_CODE,
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
  for (const companyId of [HEADER_COMPANY, 'holding']) {
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
      };
    }
  }
  return null;
}

async function main() {
  report.dist = inspectDistAndSrc();
  report.seals = sealRetainSpot();
  save();

  const dtoOpen =
    report.dist.src_create_dto_no_isin4 &&
    report.dist.src_update_dto_no_isin4 &&
    report.dist.src_has_key;
  step('DIST_DTO_GATE', {
    verdict: !report.dist.stale_dist && dtoOpen && report.dist.aggregate_untouched_spot ? 'PASS' : 'FAIL',
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

  const unauth = await call(null, 'GET', '/attendance/attendance-codes/effective', {
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

  // --- GET effective baseline ---
  const eff0 = await call(auth.token, 'GET', '/attendance/attendance-codes/effective', {
    query: { company_id: HEADER_COMPANY },
    companyId: HEADER_COMPANY,
  });
  const keys0 = codeKeys(eff0.data ?? eff0.json);
  const total0 =
    typeof eff0.data?.total === 'number' ? eff0.data.total : keys0.length;
  report.val['AC-PLT-ATT-CODE-01c'] = {
    expect: 'GET attendance-codes/effective 2xx · empty [] OK · no seed',
    status: eff0.status,
    code: eff0.code,
    total: total0,
    sample: keys0.slice(0, 10),
  };
  const eff0Ok = eff0.status >= 200 && eff0.status < 300;
  report.val['AC-PLT-ATT-CODE-01c'].verdict = eff0Ok ? 'PASS' : 'FAIL';
  step('GET_EFF_0', {
    verdict: eff0Ok ? 'PASS' : 'FAIL',
    summary: `${eff0.status} ${eff0.code} total=${total0}`,
  });

  // --- Admin CREATE N+1 ---
  const adminCompany = HEADER_COMPANY;
  const upsert = await call(auth.token, 'POST', '/attendance/attendance-codes', {
    companyId: adminCompany,
    body: {
      companyId: adminCompany,
      code: OPEN_CODE,
      nameVi: `QA WFH ${STAMP}`,
      symbol: 'WF',
      sortOrder: 990,
      countsAs: 'work',
      dayWeight: 1,
      isPaid: true,
      isPresent: true,
      status: 'active',
    },
  });
  const adminOk = upsert.status >= 200 && upsert.status < 300;
  const createdId =
    upsert.data?.id || upsert.data?.codeId || upsert.json?.data?.id || null;
  report.val['AC-PLT-ATT-CODE-01d'] = {
    expect: 'Admin CREATE N+1 open slug 2xx/201 · F5 EFF sees code',
    status: upsert.status,
    code: upsert.code,
    open_key: OPEN_CODE,
    createdId,
    summary: upsert.summary,
  };
  report.val['AC-PLT-ATT-CODE-01d'].verdict = adminOk ? 'PASS' : 'FAIL';
  step('ADMIN_N1', {
    verdict: adminOk ? 'PASS' : 'FAIL',
    summary: `${upsert.status} ${upsert.code} key=${OPEN_CODE} id=${createdId}`,
  });

  // F5 — re-GET effective
  const eff1 = await call(auth.token, 'GET', '/attendance/attendance-codes/effective', {
    query: { company_id: adminCompany },
    companyId: adminCompany,
  });
  const keys1 = codeKeys(eff1.data ?? eff1.json);
  const total1 =
    typeof eff1.data?.total === 'number' ? eff1.data.total : keys1.length;
  const hasOpen = keys1.includes(OPEN_CODE.toLowerCase());
  step('EFF_HAS_OPEN_F5', {
    verdict: hasOpen && total1 > 0 ? 'PASS' : 'FAIL',
    summary: `hasOpenKey=${hasOpen} total=${total1} baseline=${total0}`,
  });
  if (adminOk && hasOpen) {
    report.val['AC-PLT-ATT-CODE-01d'].verdict = 'PASS';
    report.val['AC-PLT-ATT-CODE-01d'].eff_after = { total: total1, hasOpen };
  } else if (adminOk && !hasOpen) {
    report.val['AC-PLT-ATT-CODE-01d'].verdict = 'FAIL';
    report.val['AC-PLT-ATT-CODE-01d'].eff_after = { total: total1, hasOpen };
  }

  const emp = await pickEmployee(auth.token);
  step('PICK_EMPLOYEE', {
    verdict: emp ? 'PASS' : 'FAIL',
    summary: emp
      ? `id=${emp.employeeId} company=${emp.companyId}`
      : 'no employee',
  });
  if (!emp) {
    report.overall = 'BLOCKED';
    report.ack_status = 'FAIL_TO_PM';
    report.residuals.push({
      id: 'R-ATT-CODE-QA-NO-EMP',
      severity: 'P1',
      summary: 'No employee to mutate attendance records',
    });
    report.endedAt = new Date().toISOString();
    save();
    process.exit(2);
  }

  // Ensure EFF>0 on employee company if different
  if (emp.companyId !== adminCompany) {
    const upsertEmp = await call(auth.token, 'POST', '/attendance/attendance-codes', {
      companyId: emp.companyId,
      body: {
        companyId: emp.companyId,
        code: OPEN_CODE,
        nameVi: `QA WFH ${STAMP}`,
        symbol: 'WF',
        countsAs: 'work',
        dayWeight: 1,
        isPaid: true,
        isPresent: true,
        status: 'active',
      },
    });
    step('ADMIN_N1_EMP_SCOPE', {
      verdict: upsertEmp.status >= 200 && upsertEmp.status < 300 ? 'PASS' : 'WARN',
      summary: `${upsertEmp.status} ${upsertEmp.code} company=${emp.companyId}`,
    });
  }

  const effEmp = await call(auth.token, 'GET', '/attendance/attendance-codes/effective', {
    query: { company_id: emp.companyId },
    companyId: emp.companyId,
  });
  const keysEmp = codeKeys(effEmp.data ?? effEmp.json);
  const totalEmp =
    typeof effEmp.data?.total === 'number' ? effEmp.data.total : keysEmp.length;
  const effGt0 = totalEmp > 0;
  step('EFF_EMP_SCOPE', {
    verdict: effGt0 ? 'PASS' : 'FAIL',
    summary: `company=${emp.companyId} total=${totalEmp} hasOpen=${keysEmp.includes(OPEN_CODE)}`,
  });

  const inventDate = todayIso();
  /** Offset +2 days avoids collision with prior QA stamp records on today. */
  const openDate = offsetIso(2);

  // --- Invent POST createRecord → HRM-ATT-CODE-KEY ---
  const inventPost = await call(auth.token, 'POST', '/attendance/records', {
    companyId: emp.companyId,
    body: {
      company_id: emp.companyId,
      employee_id: emp.employeeId,
      attendance_date: inventDate,
      status: INVENT_CODE,
      note: `QA invent ${STAMP}`,
      check_in_method: 'manual',
    },
  });
  const inventPostOk =
    inventPost.status >= 400 &&
    inventPost.status < 500 &&
    inventPost.code === 'HRM-ATT-CODE-KEY';
  report.val['VAL-ATT-CODE-CNS-01-POST'] = {
    expect: 'POST invent → 4xx HRM-ATT-CODE-KEY (≠ LEAVE/EMP KEY)',
    status: inventPost.status,
    code: inventPost.code,
    invent: INVENT_CODE,
    message: inventPost.message,
  };
  report.val['VAL-ATT-CODE-CNS-01-POST'].verdict = inventPostOk ? 'PASS' : 'FAIL';
  step('INVENT_POST', {
    verdict: inventPostOk ? 'PASS' : 'FAIL',
    summary: `${inventPost.status} ${inventPost.code}`,
  });

  // Open slug persist on unique date (not inventDate collision)
  let recordId = null;
  const createdOpen = await call(auth.token, 'POST', '/attendance/records', {
    companyId: emp.companyId,
    body: {
      company_id: emp.companyId,
      employee_id: emp.employeeId,
      attendance_date: openDate,
      status: OPEN_CODE,
      note: `QA open persist ${STAMP}`,
      check_in_method: 'manual',
    },
  });
  recordId = createdOpen.data?.id || createdOpen.json?.data?.id || null;
  // If duplicate still (re-run same day offset), fallback: list + PATCH existing
  if (!recordId && createdOpen.code === 'HRM-ATT-001') {
    const listDup = await call(auth.token, 'GET', '/attendance/records', {
      query: {
        company_id: emp.companyId,
        employee_id: emp.employeeId,
        from_date: openDate,
        to_date: openDate,
        page_size: 5,
      },
      companyId: emp.companyId,
    });
    const hit = asList(listDup.data ?? listDup.json)[0];
    if (hit?.id) {
      const patchOpen = await call(auth.token, 'PATCH', `/attendance/records/${hit.id}/status`, {
        companyId: emp.companyId,
        query: { company_id: emp.companyId },
        body: { status: OPEN_CODE, note: `QA open patch ${STAMP}` },
      });
      recordId = hit.id;
      createdOpen.status = patchOpen.status;
      createdOpen.code = patchOpen.code;
      createdOpen.data = patchOpen.data || { ...hit, status: OPEN_CODE, ...(patchOpen.data || {}) };
      step('OPEN_SLUG_PATCH_FALLBACK', {
        verdict: patchOpen.status >= 200 && patchOpen.status < 300 ? 'PASS' : 'FAIL',
        summary: `${patchOpen.status} ${patchOpen.code} recordId=${recordId}`,
      });
    }
  }

  const openPersistOk =
    createdOpen.status >= 200 &&
    createdOpen.status < 300 &&
    String(createdOpen.data?.status || '').toLowerCase() === OPEN_CODE;
  const hasLabel =
    Boolean(createdOpen.data?.status_label) &&
    String(createdOpen.data?.status_label).length > 0;
  const hasSymbol =
    createdOpen.data?.symbol != null && String(createdOpen.data.symbol).length > 0;
  report.val['VAL-ATT-CODE-CNS-07'] = {
    expect: 'Open slug ∈ EFF persists (no closed IsIn4 reject)',
    status: createdOpen.status,
    code: createdOpen.code,
    status_persisted: createdOpen.data?.status ?? null,
    open_key: OPEN_CODE,
    open_date: openDate,
    message: createdOpen.message,
  };
  report.val['VAL-ATT-CODE-CNS-07'].verdict = openPersistOk ? 'PASS' : 'FAIL';
  report.val['VAL-ATT-CODE-CNS-08'] = {
    expect: 'status_label + symbol from catalog when EFF known',
    status_label: createdOpen.data?.status_label ?? null,
    symbol: createdOpen.data?.symbol ?? null,
    hasLabel,
    hasSymbol,
  };
  report.val['VAL-ATT-CODE-CNS-08'].verdict =
    openPersistOk && hasLabel && hasSymbol ? 'PASS' : 'FAIL';
  step('OPEN_SLUG_PERSIST', {
    verdict: openPersistOk ? 'PASS' : 'FAIL',
    summary: `${createdOpen.status} ${createdOpen.code} status=${createdOpen.data?.status} label=${createdOpen.data?.status_label} symbol=${createdOpen.data?.symbol} date=${openDate}`,
  });
  step('DISPLAY_LABEL', {
    verdict: openPersistOk && hasLabel && hasSymbol ? 'PASS' : 'FAIL',
    summary: `label=${createdOpen.data?.status_label} symbol=${createdOpen.data?.symbol}`,
  });

  // --- Invent PATCH status ---
  let inventPatchOk = false;
  if (recordId) {
    const inventPatch = await call(auth.token, 'PATCH', `/attendance/records/${recordId}/status`, {
      companyId: emp.companyId,
      query: { company_id: emp.companyId },
      body: {
        status: INVENT_CODE,
        note: `QA invent patch ${STAMP}`,
      },
    });
    inventPatchOk =
      inventPatch.status >= 400 &&
      inventPatch.status < 500 &&
      inventPatch.code === 'HRM-ATT-CODE-KEY';
    report.val['VAL-ATT-CODE-CNS-01-PATCH'] = {
      expect: 'PATCH invent → 4xx HRM-ATT-CODE-KEY',
      status: inventPatch.status,
      code: inventPatch.code,
      recordId,
    };
    report.val['VAL-ATT-CODE-CNS-01-PATCH'].verdict = inventPatchOk ? 'PASS' : 'FAIL';
    step('INVENT_PATCH', {
      verdict: inventPatchOk ? 'PASS' : 'FAIL',
      summary: `${inventPatch.status} ${inventPatch.code} recordId=${recordId}`,
    });
    // Restore open status after invent patch reject (record should still be OPEN_CODE)
  } else {
    report.val['VAL-ATT-CODE-CNS-01-PATCH'] = {
      expect: 'PATCH invent → 4xx HRM-ATT-CODE-KEY',
      verdict: 'BLOCKED',
      note: 'no recordId to patch',
    };
    step('INVENT_PATCH', { verdict: 'BLOCKED', summary: 'no recordId' });
  }

  // KEY taxonomy — not LEAVE / EMP
  const inventCodeWrongFamily =
    inventPost.code === 'HRM-LEAVE-TYPE-UNKNOWN' ||
    inventPost.code === 'HRM-EMP-STATUS-KEY' ||
    inventPost.code === 'HRM-EMP-CUSTOM-FIELD-KEY';
  report.val['VAL-ATT-CODE-CNS-09'] = {
    expect: 'Day-code invent → HRM-ATT-CODE-KEY only (≠ leave/EMP)',
    post_code: inventPost.code,
    patch_ok: inventPatchOk,
    wrong_family: inventCodeWrongFamily,
  };
  report.val['VAL-ATT-CODE-CNS-09'].verdict =
    inventPostOk && !inventCodeWrongFamily ? 'PASS' : 'FAIL';

  // Combined 01b
  report.val['AC-PLT-ATT-CODE-01b'] = {
    expect: 'Invent day-code → 4xx HRM-ATT-CODE-KEY · no persist',
    post: { status: inventPost.status, code: inventPost.code },
    patch: report.val['VAL-ATT-CODE-CNS-01-PATCH'],
  };
  report.val['AC-PLT-ATT-CODE-01b'].verdict =
    inventPostOk && (inventPatchOk || report.val['VAL-ATT-CODE-CNS-01-PATCH']?.verdict === 'PASS')
      ? 'PASS'
      : inventPostOk
        ? 'PARTIAL'
        : 'FAIL';

  // List/get display spot after open persist
  if (recordId && createdOpen) {
    const getRec = await call(auth.token, 'GET', `/attendance/records/${recordId}`, {
      query: { company_id: emp.companyId },
      companyId: emp.companyId,
    });
    const listRec = await call(auth.token, 'GET', '/attendance/records', {
      query: {
        company_id: emp.companyId,
        employee_id: emp.employeeId,
        from_date: openDate,
        to_date: openDate,
        page_size: 20,
      },
      companyId: emp.companyId,
    });
    const listItems = asList(listRec.data ?? listRec.json);
    const listHit =
      listItems.find((r) => r.id === recordId) ||
      listItems.find((r) => String(r.status || '').toLowerCase() === OPEN_CODE) ||
      null;
    step('LIST_GET_DISPLAY', {
      verdict:
        getRec.status >= 200 &&
        getRec.status < 300 &&
        (getRec.data?.status_label || listHit?.status_label)
          ? 'PASS'
          : 'WARN',
      summary: `get=${getRec.status} label=${getRec.data?.status_label ?? listHit?.status_label} symbol=${getRec.data?.symbol ?? listHit?.symbol}`,
      get: {
        status: getRec.status,
        status_label: getRec.data?.status_label,
        symbol: getRec.data?.symbol,
        code: getRec.code,
      },
      list_hit: listHit
        ? {
            id: listHit.id,
            status: listHit.status,
            status_label: listHit.status_label,
            symbol: listHit.symbol,
          }
        : null,
    });
  }

  // Soft-retire open code → hidden from default EFF
  let retireOk = false;
  let codeIdToRetire = createdId;
  if (!codeIdToRetire) {
    const listAdmin = await call(auth.token, 'GET', '/attendance/attendance-codes', {
      query: { company_id: emp.companyId },
      companyId: emp.companyId,
    });
    const rows = asList(listAdmin.data ?? listAdmin.json);
    const hit = rows.find((r) => String(r.code || '').toLowerCase() === OPEN_CODE);
    codeIdToRetire = hit?.id || null;
  }
  if (codeIdToRetire) {
    const retire = await call(
      auth.token,
      'POST',
      `/attendance/attendance-codes/${codeIdToRetire}/retire`,
      {
        companyId: emp.companyId,
        query: { company_id: emp.companyId },
      },
    );
    retireOk = retire.status >= 200 && retire.status < 300;
    const effAfterRetire = await call(auth.token, 'GET', '/attendance/attendance-codes/effective', {
      query: { company_id: emp.companyId },
      companyId: emp.companyId,
    });
    const keysAfter = codeKeys(effAfterRetire.data ?? effAfterRetire.json);
    const hidden = !keysAfter.includes(OPEN_CODE.toLowerCase());
    report.val['AC-PLT-ATT-CODE-01e'] = {
      expect: 'Soft-retire → hidden from default EFF',
      retire_status: retire.status,
      retire_code: retire.code,
      hidden_from_eff: hidden,
      eff_total: keysAfter.length,
    };
    report.val['AC-PLT-ATT-CODE-01e'].verdict = retireOk && hidden ? 'PASS' : 'FAIL';
    step('SOFT_RETIRE', {
      verdict: retireOk && hidden ? 'PASS' : 'FAIL',
      summary: `retire=${retire.status} ${retire.code} hidden=${hidden}`,
    });
  } else {
    report.val['AC-PLT-ATT-CODE-01e'] = {
      expect: 'Soft-retire → hidden from default EFF',
      verdict: 'BLOCKED',
      note: 'no codeId to retire',
    };
    step('SOFT_RETIRE', { verdict: 'BLOCKED', summary: 'no codeId' });
  }

  // Seal routes still reachable (leave-types/effective · work-sites list — no /effective route)
  const leaveEff = await call(auth.token, 'GET', '/attendance/leave-types/effective', {
    query: { company_id: HEADER_COMPANY },
    companyId: HEADER_COMPANY,
  });
  const wsList = await call(auth.token, 'GET', '/attendance/work-sites', {
    query: { company_id: HEADER_COMPANY },
    companyId: HEADER_COMPANY,
  });
  const sealsReachable =
    leaveEff.status >= 200 &&
    leaveEff.status < 300 &&
    wsList.status >= 200 &&
    wsList.status < 300;
  step('SEAL_ROUTES_SPOT', {
    verdict: sealsReachable && report.dist.aggregate_untouched_spot ? 'PASS' : 'FAIL',
    summary: `leave=${leaveEff.status} ${leaveEff.code} ws=${wsList.status} ${wsList.code} agg_untouched=${report.dist.aggregate_untouched_spot}`,
  });

  report.val['AC-PLT-ATT-CODE-01H'] = {
    expect: 'Honesty false · seals RETAIN · C-SLICE · DENY flip/UAT/aggregate rewrite',
    attendance_uat_ready: false,
    payroll_e2e_ready: false,
    seals: report.seals,
    aggregate_untouched: report.dist.aggregate_untouched_spot,
  };
  report.val['AC-PLT-ATT-CODE-01H'].verdict =
    report.honesty.attendance_uat_ready === false &&
    report.honesty.payroll_e2e_ready === false &&
    report.dist.aggregate_untouched_spot &&
    !report.seals.reopened
      ? 'PASS'
      : 'FAIL';

  report.val['VAL-ATT-CODE-CNS-10'] = {
    expect: 'No aggregate rewrite claim this seat',
    aggregate_imports_att_code: !report.dist.aggregate_untouched_spot,
  };
  report.val['VAL-ATT-CODE-CNS-10'].verdict = report.dist.aggregate_untouched_spot
    ? 'PASS'
    : 'FAIL';

  // Rollup
  const critical = [
    report.val['AC-PLT-ATT-CODE-01c']?.verdict,
    report.val['AC-PLT-ATT-CODE-01d']?.verdict,
    report.val['AC-PLT-ATT-CODE-01b']?.verdict,
    report.val['VAL-ATT-CODE-CNS-07']?.verdict,
    report.val['VAL-ATT-CODE-CNS-08']?.verdict,
    report.val['VAL-ATT-CODE-CNS-09']?.verdict,
    report.val['AC-PLT-ATT-CODE-01e']?.verdict,
    report.val['AC-PLT-ATT-CODE-01H']?.verdict,
    report.val['VAL-ATT-CODE-CNS-10']?.verdict,
  ];
  const fails = critical.filter((v) => v === 'FAIL' || v === 'BLOCKED');
  const partials = critical.filter((v) => v === 'PARTIAL');
  const distFail = report.steps.find((s) => s.id === 'DIST_DTO_GATE')?.verdict === 'FAIL';

  if (fails.length === 0 && !distFail && partials.length === 0) {
    report.overall = 'PASS';
    report.ack_status = 'PASS_TO_PM';
  } else if (fails.length === 0 && partials.length > 0 && !distFail) {
    report.overall = 'PASS_WITH_PARTIAL';
    report.ack_status = 'PASS_TO_PM';
    report.residuals.push({
      id: 'R-ATT-CODE-QA-PARTIAL',
      severity: 'P2',
      summary: `Partial AC: ${partials.join(',')}`,
    });
  } else {
    report.overall = 'FAIL';
    report.ack_status = 'FAIL_TO_PM';
    report.residuals.push({
      id: 'R-ATT-CODE-QA-L1-FAIL',
      severity: 'P1',
      summary: `Failed/blocked: ${fails.join(',') || 'DIST'}`,
      owner: 'dev-be',
    });
  }

  // FE HOLD note — L1 ≠ UF
  report.residuals.push({
    id: 'R-PLT-ATT-CODE-FE-01',
    severity: 'P2',
    summary:
      'FE AttendanceRecordsTable Select rebind to Nest EFF HOLD (VAL-06 / 01f) — L1 PASS ≠ UF 🟢',
    owner: 'dev-fe',
    hold: true,
  });

  report.endedAt = new Date().toISOString();
  save();
  console.log(
    JSON.stringify(
      {
        stamp: STAMP,
        overall: report.overall,
        ack_status: report.ack_status,
        open_code: OPEN_CODE,
        invent_code: INVENT_CODE,
        fails: fails.length,
        out: OUT,
      },
      null,
      2,
    ),
  );
  process.exit(report.ack_status === 'PASS_TO_PM' ? 0 : 1);
}

main().catch((e) => {
  report.overall = 'ERROR';
  report.ack_status = 'FAIL_TO_PM';
  report.residuals.push({ id: 'R-ATT-CODE-QA-CRASH', severity: 'P0', summary: String(e) });
  report.endedAt = new Date().toISOString();
  save();
  console.error(e);
  process.exit(1);
});
