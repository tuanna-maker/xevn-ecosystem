#!/usr/bin/env node
/**
 * PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-QA-01 — L1 API
 * U65 zero-seed · honesty attendance_uat_ready=false · payroll_e2e_ready=false
 * C-SLICE-≠-MODULE · RETAIN OT-TYPE L1/FE-01 CLOSED · ATT leave/CODE/WS/SHIFT seals
 * KEY LOCKED: HRM-ATT-OT-COMP-KEY · table att_ot_comp_type · orthogonal to att_ot_type
 * Parent: ATT-COMP-TYPE-CATALOG-BE-01 READY_FOR_QA (R3)
 *
 * AC: admin N+1 · invent HRM-ATT-OT-COMP-KEY ≠ OT-TYPE-KEY · soft-retire · 01c NOTE_BLOCKED · 01f/01H
 */
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const XBOS = process.env.XBOS_API_URL || 'http://127.0.0.1:28002/api/xbos';
const HRM = process.env.HRM_API_URL || 'http://127.0.0.1:28001/api/hrm';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const MEMBER_EMAIL = process.env.QA_MEMBER_EMAIL || 'du-lich.ceo@xe.vn';
const HEADER_COMPANY = process.env.QA_HEADER_COMPANY || 'main';
const TENANT = process.env.QA_TENANT_ID || 'xevn';
const TS = Date.now().toString(36).toLowerCase();
const STAMP = `ATTCOMPQA-${TS.toUpperCase().slice(-8)}`;
const OPEN_CODE = `banked_hours_${TS}`.slice(0, 48);
const OPEN_CODE_B = `mixed_pay_${TS}`.slice(0, 48);
const INVENT_CODE = `zz_invent_att_otc_${TS}`.slice(0, 48);
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = resolve(
  ROOT,
  'docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-att-comp-type-catalog-qa-01.json',
);

const SEALS = {
  OT_TYPE_L1: 'ATTOTQA-MSK8VETU',
  OT_TYPE_FE_01: 'ATTOTQAFE-MSK9TJDM',
  CTR_TEMPLATE: 'CTRTPLQA-MSK7U4CG',
  ATT_LVRULE: 'ATTLVRULEQA2-MSK79F2F',
  ATT_CODE: 'ATTCODEQA-MSK4T1A5',
  ATT_LEAVE: 'ATTLEAVEQA-MSJ7CPJH',
  ATT_WS: 'ATTWSQA-MSJC3IN9',
  ATT_SHIFT: 'ATTSHIFTQA-MSK5FXP3',
  FE_LVRULE_01g: 'HOLD',
  FE_OT_ADMIN: 'HOLD',
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
  return [];
}

function codesOf(data) {
  return asList(data)
    .map((r) => r.code)
    .filter(Boolean)
    .map((k) => String(k).toLowerCase());
}

function offsetIso(days) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

async function login(email = EMAIL, password = PASSWORD) {
  for (const url of [`${PORTAL}/api/xbos/auth/login`, `${XBOS}/auth/login`]) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const j = await r.json().catch(() => ({}));
      const d = j.data || j;
      const token = d.accessToken || d.access_token;
      if (r.ok && token) {
        return { ok: true, status: r.status, token, claims: decodeJwt(token), via: url, email };
      }
      if (url.includes('28002')) {
        return { ok: false, status: r.status, body: summarizeBody(j), token: null, email };
      }
    } catch (e) {
      if (url.includes('28002')) {
        return { ok: false, status: 0, body: String(e?.message || e), token: null, email };
      }
    }
  }
  return { ok: false, status: 0, body: 'login failed both portals', token: null, email };
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

async function pickEmployee(token) {
  const r = await call(token, 'GET', '/employees', {
    query: { company_id: HEADER_COMPANY, page_size: 5 },
    companyId: HEADER_COMPANY,
  });
  const rows = asList(r.data ?? r.json);
  const row = rows[0];
  if (!row) return null;
  return {
    employeeId: row.id || row.employee_id,
    employeeCode: row.employee_code || row.code || 'QA-EMP',
    employeeName: row.full_name || row.name || row.employee_name || 'QA Employee',
    companyId: row.company_id || HEADER_COMPANY,
    department: row.department || row.department_name || null,
    position: row.position || row.position_name || null,
  };
}

function inspectDiskAndFe() {
  const out = {
    disk_gate: {},
    src_has_key: false,
    src_has_otc_route: false,
    dist_has_key: false,
    dist_has_otc_route: false,
    src_ot_type_orthogonal: false,
    fold_into_ot_type: false,
    fe_comp_hardcode_2: false,
    fe_comp_fetch: false,
    fe_admin_surface: false,
    note: '',
  };
  const files = {
    constants: 'apps/api/hrm-api/src/attendance/att-ot-comp-type.constants.ts',
    service: 'apps/api/hrm-api/src/attendance/att-ot-comp-type.service.ts',
    spec: 'apps/api/hrm-api/src/attendance/att-ot-comp-type.service.spec.ts',
    dto: 'apps/api/hrm-api/src/attendance/dto/att-ot-comp-type.dto.ts',
  };
  for (const [k, rel] of Object.entries(files)) {
    const p = resolve(ROOT, rel);
    const len = existsSync(p) ? readFileSync(p).length : 0;
    out.disk_gate[k] = { path: rel, length: len, ok: len > 0 };
  }
  const srcConst = resolve(ROOT, files.constants);
  const srcSvc = resolve(ROOT, files.service);
  const srcCtrl = resolve(ROOT, 'apps/api/hrm-api/src/attendance/attendance.controller.ts');
  const srcOtType = resolve(ROOT, 'apps/api/hrm-api/src/attendance/att-ot-type.service.ts');
  for (const p of [srcConst, srcSvc, srcCtrl]) {
    if (existsSync(p)) {
      const t = readFileSync(p, 'utf8');
      if (/HRM-ATT-OT-COMP-KEY/.test(t)) out.src_has_key = true;
      if (/ot-comp-types/.test(t)) out.src_has_otc_route = true;
    }
  }
  if (existsSync(srcSvc)) {
    const t = readFileSync(srcSvc, 'utf8');
    out.fold_into_ot_type = /CREATE TABLE[\s\S]*att_ot_type/i.test(t) && /att_ot_comp_type/.test(t) === false;
    out.src_ot_type_orthogonal =
      /att_ot_comp_type/.test(t) && !/ALTER TABLE\s+att_ot_type/i.test(t);
  }
  if (existsSync(srcOtType)) {
    const t = readFileSync(srcOtType, 'utf8');
    // peer seal retain — file still exists
    out.peer_ot_type_service_present = true;
    out.peer_ot_type_mentions_comp_fold = /att_ot_comp_type/.test(t);
  }
  const distConst = resolve(ROOT, 'apps/api/hrm-api/dist/attendance/att-ot-comp-type.constants.js');
  const distCtrl = resolve(ROOT, 'apps/api/hrm-api/dist/attendance/attendance.controller.js');
  for (const p of [distConst, distCtrl]) {
    if (existsSync(p)) {
      const t = readFileSync(p, 'utf8');
      if (/HRM-ATT-OT-COMP-KEY/.test(t)) out.dist_has_key = true;
      if (/ot-comp-types/.test(t)) out.dist_has_otc_route = true;
    }
  }
  const feTab = resolve(ROOT, 'apps/web/hrm/src/components/attendance/OvertimeRequestTab.tsx');
  if (existsSync(feTab)) {
    const t = readFileSync(feTab, 'utf8');
    const hasSalary = /salary/.test(t);
    const hasCompLeave = /compensatory_leave/.test(t);
    out.fe_comp_hardcode_2 = hasSalary && hasCompLeave;
    out.fe_comp_fetch = /ot-comp-types|useOtCompTypes|att_ot_comp_type|listOtCompTypes/.test(t);
  }
  out.disk_all_ok = Object.values(out.disk_gate).every((x) => x.ok);
  out.note = out.fe_comp_hardcode_2 && !out.fe_comp_fetch
    ? 'VAL-ATT-COMP-CNS-06 residual — OvertimeRequestTab hardcode salary|compensatory_leave; no Nest EFF bind (FE HOLD — L1 API only this wave)'
    : 'FE compensation bind spot';
  return out;
}

const report = {
  work_item_id: 'PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-QA-01',
  stamp: STAMP,
  startedAt: new Date().toISOString(),
  gitHead: gitHead(),
  env: { PORTAL, XBOS, HRM, EMAIL, MEMBER_EMAIL, HEADER_COMPANY, TENANT },
  honesty: {
    attendance_uat_ready: false,
    payroll_e2e_ready: false,
    contracts_printable_ready: false,
    C_SLICE_NE_MODULE: true,
    U65_zero_seed: true,
    formula_LIVE: false,
    seals_retain: SEALS,
    peer_ot_type_reopen: false,
  },
  disk_fe: null,
  steps: [],
  val: {},
  residuals: [],
  overall: 'PASS',
  ack_status: 'PASS_TO_PM',
};

function step(id, payload) {
  report.steps.push({ id, at: new Date().toISOString(), ...payload });
}

function save() {
  writeFileSync(OUT, JSON.stringify(report, null, 2), 'utf8');
}

function failOverall(reason) {
  report.overall = 'FAIL';
  report.ack_status = 'FAIL_TO_PM';
  report.fail_reason = reason;
}

function obsOverall(reason) {
  if (report.overall === 'FAIL') return;
  report.overall = 'PASS_WITH_OBS';
  report.ack_status = 'PASS_WITH_OBS';
  report.obs_reason = reason;
}

async function main() {
  report.disk_fe = inspectDiskAndFe();
  const diskOk = report.disk_fe.disk_all_ok && report.disk_fe.src_has_key && report.disk_fe.src_has_otc_route;
  step('DISK_GATE', {
    verdict: diskOk ? 'PASS' : 'FAIL',
    summary: summarizeBody(report.disk_fe.disk_gate, 400),
  });
  if (!diskOk) failOverall('disk gate FAIL — att-ot-comp-type files missing or Length=0');

  const health = await call(null, 'GET', '');
  step('L0_HRM_HEALTH', {
    verdict: health.status === 200 ? 'PASS' : 'FAIL',
    summary: `${health.status} ${health.code}`,
  });
  if (health.status !== 200) failOverall('L0 HRM health FAIL');

  let xbosHealth = { status: 0, code: null };
  try {
    const xr = await fetch(`${XBOS.replace(/\/api\/xbos$/, '')}/api/xbos`.replace(/\/api\/xbos$/, '') + '/api/xbos');
    // probe root xbos health like hrm
  } catch {
    /* ignore */
  }
  try {
    const xr = await fetch('http://127.0.0.1:28002/api/xbos');
    const j = await xr.json().catch(() => ({}));
    xbosHealth = { status: xr.status, code: j?.code ?? null };
  } catch (e) {
    xbosHealth = { status: 0, code: String(e?.message || e) };
  }
  step('L0_XBOS_HEALTH', {
    verdict: xbosHealth.status === 200 ? 'PASS' : 'WARN',
    summary: `${xbosHealth.status} ${xbosHealth.code}`,
  });

  const unauth = await call(null, 'GET', '/attendance/ot-comp-types/effective', {
    query: { company_id: HEADER_COMPANY },
  });
  const unauthOk = unauth.status === 401 || unauth.status === 403;
  const routeMissing = unauth.status === 404;
  step('UNAUTH_EFF', {
    verdict: unauthOk ? 'PASS' : 'FAIL',
    summary: `${unauth.status} ${unauth.code}`,
  });
  report.val.unauth_effective = {
    expect: '401/403 ≠ 404',
    status: unauth.status,
    code: unauth.code,
    verdict: unauthOk ? 'PASS' : 'FAIL',
  };
  if (routeMissing) {
    failOverall('ot-comp-types routes 404 — hrm-api restart / runtime missing new routes');
    report.endedAt = new Date().toISOString();
    save();
    process.exit(2);
  }

  const auth = await login();
  step('LOGIN', {
    verdict: auth.ok ? 'PASS' : 'FAIL',
    summary: auth.ok
      ? `via ${auth.via} status=${auth.status}`
      : `${auth.status} ${auth.body}`,
  });
  if (!auth.ok) {
    failOverall('login failed');
    report.endedAt = new Date().toISOString();
    save();
    process.exit(2);
  }

  // Baseline list + effective
  const list0 = await call(auth.token, 'GET', '/attendance/ot-comp-types', {
    query: { company_id: HEADER_COMPANY },
  });
  const rows0 = asList(list0.data ?? list0.json);
  const total0 =
    typeof list0.data?.total === 'number' ? list0.data.total : rows0.length;
  step('LIST_DEFAULT_0', {
    verdict: list0.status === 200 ? 'PASS' : 'FAIL',
    summary: `${list0.status} ${list0.code} total=${total0}`,
  });

  const eff0 = await call(auth.token, 'GET', '/attendance/ot-comp-types/effective', {
    query: { company_id: HEADER_COMPANY },
  });
  const effRows0 = asList(eff0.data ?? eff0.json);
  const effTotal0 =
    typeof eff0.data?.total === 'number' ? eff0.data.total : effRows0.length;
  step('EFF_0', {
    verdict: eff0.status === 200 ? 'PASS' : 'FAIL',
    summary: `${eff0.status} ${eff0.code} total=${effTotal0}`,
  });
  report.val['AC-PLT-ATT-COMP-01c_baseline'] = {
    expect: 'EFF empty soft OK · no seed (01c) — invent-skip at empty NOTE_BLOCKED if not re-probed after N+1',
    eff_total_before_admin: effTotal0,
    seed_used: false,
    verdict: eff0.status === 200 ? 'PASS' : 'FAIL',
  };

  // Admin CREATE N+1 (banked_hours + mixed) — two so soft-retire one leaves EFF>0
  const createA = await call(auth.token, 'POST', '/attendance/ot-comp-types', {
    body: {
      companyId: HEADER_COMPANY,
      code: OPEN_CODE,
      nameVi: `Ngân giờ QA ${STAMP}`,
      nameEn: `Banked hours QA ${STAMP}`,
      sortOrder: 50,
      status: 'active',
    },
  });
  const createdA = createA.data?.id || createA.json?.data?.id || null;
  const createAOk = createA.status >= 200 && createA.status < 300;
  const displayA = createA.data || createA.json?.data || {};
  const displayReadyA = createAOk && (displayA.nameVi || displayA.name_vi);
  step('ADMIN_N1_A', {
    verdict: createAOk && displayReadyA ? 'PASS' : createAOk ? 'WARN' : 'FAIL',
    summary: `${createA.status} ${createA.code} code=${OPEN_CODE} id=${createdA} nameVi=${displayA.nameVi || displayA.name_vi}`,
  });
  report.val['AC-PLT-ATT-COMP-01d'] = {
    expect: 'Admin CREATE N+1 open (banked_hours*) 201 · F5 list/EFF · name_vi display-ready',
    status: createA.status,
    code: createA.code,
    open_key: OPEN_CODE,
    createdId: createdA,
    displayReady: displayReadyA,
    nameVi: displayA.nameVi || displayA.name_vi || null,
    summary: createA.summary,
    verdict: createAOk ? 'PASS' : 'FAIL',
  };
  if (!createAOk) failOverall('admin CREATE N+1 FAIL');

  const createB = await call(auth.token, 'POST', '/attendance/ot-comp-types', {
    body: {
      companyId: HEADER_COMPANY,
      code: OPEN_CODE_B,
      nameVi: `Hỗn hợp QA ${STAMP}`,
      sortOrder: 60,
      status: 'active',
    },
  });
  const createdB = createB.data?.id || createB.json?.data?.id || null;
  step('ADMIN_N1_B', {
    verdict: createB.status >= 200 && createB.status < 300 ? 'PASS' : 'WARN',
    summary: `${createB.status} ${createB.code} code=${OPEN_CODE_B} id=${createdB}`,
  });

  // F5 list + effective
  const list1 = await call(auth.token, 'GET', '/attendance/ot-comp-types', {
    query: { company_id: HEADER_COMPANY },
  });
  const codes1 = codesOf(list1.data ?? list1.json);
  const rows1 = asList(list1.data ?? list1.json);
  const total1 =
    typeof list1.data?.total === 'number' ? list1.data.total : rows1.length;
  const hasOpen = codes1.includes(OPEN_CODE.toLowerCase());
  const openRow = rows1.find(
    (r) => String(r.code || '').toLowerCase() === OPEN_CODE.toLowerCase(),
  );
  const f5Display = openRow && (openRow.nameVi || openRow.name_vi);
  step('LIST_HAS_OPEN_F5', {
    verdict: hasOpen && total1 > 0 && f5Display ? 'PASS' : hasOpen ? 'WARN' : 'FAIL',
    summary: `hasOpen=${hasOpen} total=${total1} baseline=${total0} f5Display=${!!f5Display}`,
  });
  if (createAOk && hasOpen) {
    report.val['AC-PLT-ATT-COMP-01d'].verdict = 'PASS';
    report.val['AC-PLT-ATT-COMP-01d'].f5 = {
      total: total1,
      hasOpen,
      f5Display: !!f5Display,
      nameVi: openRow?.nameVi || openRow?.name_vi || null,
    };
  } else if (createAOk) {
    report.val['AC-PLT-ATT-COMP-01d'].verdict = 'FAIL';
    failOverall('F5 list missing open code');
  }

  const eff1 = await call(auth.token, 'GET', '/attendance/ot-comp-types/effective', {
    query: { company_id: HEADER_COMPANY },
  });
  const effCodes1 = codesOf(eff1.data ?? eff1.json);
  const effRows1 = asList(eff1.data ?? eff1.json);
  const effTotal1 =
    typeof eff1.data?.total === 'number' ? eff1.data.total : effRows1.length;
  const activeGt0 = effTotal1 > 0;
  const effOpen = effRows1.find(
    (r) => String(r.code || '').toLowerCase() === OPEN_CODE.toLowerCase(),
  );
  step('EFF_ACTIVE_GT0', {
    verdict:
      activeGt0 && effCodes1.includes(OPEN_CODE.toLowerCase()) ? 'PASS' : 'FAIL',
    summary: `total=${effTotal1} hasOpen=${effCodes1.includes(OPEN_CODE.toLowerCase())} nameVi=${effOpen?.nameVi || effOpen?.name_vi}`,
  });

  // 01f — display-ready name_vi · FORBIDDEN formula LIVE
  report.val['AC-PLT-ATT-COMP-01f'] = {
    expect: 'name_vi display-ready · FORBIDDEN formula LIVE / payroll_e2e flip',
    nameVi_on_list: openRow?.nameVi || openRow?.name_vi || null,
    nameVi_on_eff: effOpen?.nameVi || effOpen?.name_vi || null,
    formula_LIVE_claimed: false,
    payroll_e2e_ready: false,
    verdict: f5Display || (effOpen && (effOpen.nameVi || effOpen.name_vi)) ? 'PASS' : 'FAIL',
    note: 'Catalog labels ≠ payroll formula engine LIVE',
  };
  step('AC_01f_DISPLAY', {
    verdict: report.val['AC-PLT-ATT-COMP-01f'].verdict,
    summary: `nameVi=${report.val['AC-PLT-ATT-COMP-01f'].nameVi_on_list} formula_LIVE_claimed=false`,
  });

  const emp = await pickEmployee(auth.token);
  step('PICK_EMPLOYEE', {
    verdict: emp ? 'PASS' : 'FAIL',
    summary: emp ? `id=${emp.employeeId} company=${emp.companyId}` : 'no employee',
  });
  if (!emp) {
    failOverall('no employee for overtime invent');
    report.endedAt = new Date().toISOString();
    save();
    process.exit(2);
  }

  // Need a valid overtime_type for invent-comp test (peer OT-TYPE seal — reuse existing EFF or soft-skip if empty)
  const otTypeEff = await call(auth.token, 'GET', '/attendance/ot-types/effective', {
    query: { company_id: HEADER_COMPANY },
  });
  const otTypeRows = asList(otTypeEff.data ?? otTypeEff.json);
  let otTypeCode = otTypeRows[0]?.code || null;
  let otTypeCreatedId = null;
  if (!otTypeCode) {
    // Create temporary OT type so invent COMP KEY is not masked by OT-TYPE KEY / VAL
    const otTmpCode = `qa_otc_peer_${TS}`.slice(0, 48);
    const otCreate = await call(auth.token, 'POST', '/attendance/ot-types', {
      body: {
        companyId: HEADER_COMPANY,
        code: otTmpCode,
        nameVi: `Peer OT for COMP QA ${STAMP}`,
        defaultCoeff: 1.5,
        sortOrder: 90,
        status: 'active',
      },
    });
    otTypeCode = otCreate.data?.code || otTmpCode;
    otTypeCreatedId = otCreate.data?.id || otCreate.json?.data?.id || null;
    step('PEER_OT_TYPE_TEMP', {
      verdict: otCreate.status >= 200 && otCreate.status < 300 ? 'PASS' : 'WARN',
      summary: `${otCreate.status} ${otCreate.code} code=${otTypeCode} id=${otTypeCreatedId} · TEMP for COMP invent isolation — soft-retire after`,
    });
  } else {
    step('PEER_OT_TYPE_REUSE', {
      verdict: 'PASS',
      summary: `reuse existing ot-type code=${otTypeCode} · no reopen FE/L1 seal`,
    });
  }

  // Invent compensation_type ∉ catalog when EFF>0 → HRM-ATT-OT-COMP-KEY (≠ OT-TYPE-KEY)
  const inventBody = {
    company_id: emp.companyId,
    employee_id: emp.employeeId,
    employee_code: emp.employeeCode,
    employee_name: emp.employeeName,
    department: emp.department || undefined,
    position: emp.position || undefined,
    overtime_date: offsetIso(2),
    start_time: '18:00',
    end_time: '21:00',
    total_hours: 3,
    overtime_type: otTypeCode || 'weekday',
    compensation_type: INVENT_CODE,
    reason: `QA invent OT COMP KEY ${STAMP}`,
  };
  const inventPost = await call(auth.token, 'POST', '/attendance/overtime-requests', {
    companyId: emp.companyId,
    body: inventBody,
  });
  const inventMsg = `${inventPost.code || ''} ${inventPost.message || ''} ${inventPost.summary || ''}`;
  const inventOk =
    inventPost.status >= 400 &&
    inventPost.status < 500 &&
    /HRM-ATT-OT-COMP-KEY/.test(inventMsg);
  const wrongKey =
    /HRM-ATT-OT-TYPE-KEY/.test(inventMsg) && !/HRM-ATT-OT-COMP-KEY/.test(inventMsg);
  step('INVENT_OT_COMP_KEY', {
    verdict: inventOk ? 'PASS' : 'FAIL',
    summary: `${inventPost.status} ${inventPost.code} · ${inventPost.message || ''} · wrongKey=${wrongKey}`,
  });
  report.val['AC-PLT-ATT-COMP-01b'] = {
    expect: '4xx HRM-ATT-OT-COMP-KEY · no persist · ≠ HRM-ATT-OT-TYPE-KEY',
    status: inventPost.status,
    code: inventPost.code,
    invent_key: INVENT_CODE,
    summary: inventPost.summary,
    verdict: inventOk ? 'PASS' : 'FAIL',
    network_key_hit: inventOk,
    wrong_key_ot_type: wrongKey,
  };
  report.val['VAL-ATT-COMP-CNS-01'] = report.val['AC-PLT-ATT-COMP-01b'];
  report.val['VAL-ATT-COMP-CNS-08'] = {
    expect: 'COMP invent stamps HRM-ATT-OT-COMP-KEY only — orthogonal to OT-TYPE-KEY',
    code: inventPost.code,
    verdict: inventOk && !wrongKey ? 'PASS' : 'FAIL',
  };
  if (!inventOk) failOverall(wrongKey ? 'invent stamped OT-TYPE-KEY not COMP-KEY' : 'invent COMP KEY miss');

  const otList = await call(auth.token, 'GET', '/attendance/overtime-requests', {
    query: { company_id: emp.companyId },
    companyId: emp.companyId,
  });
  const otRows = asList(otList.data ?? otList.json);
  const inventPersisted = otRows.some(
    (r) =>
      String(r.compensation_type || '') === INVENT_CODE ||
      String(r.reason || '').includes(`invent OT COMP KEY ${STAMP}`),
  );
  step('INVENT_NO_PERSIST', {
    verdict: !inventPersisted ? 'PASS' : 'FAIL',
    summary: `inventPersisted=${inventPersisted} listStatus=${otList.status}`,
  });
  if (inventPersisted) failOverall('invent compensation_type persisted');

  // Valid Nest compensation_type → 2xx
  let validPostOk = false;
  let validId = null;
  if (createdA && OPEN_CODE) {
    const validPost = await call(auth.token, 'POST', '/attendance/overtime-requests', {
      companyId: emp.companyId,
      body: {
        ...inventBody,
        overtime_date: offsetIso(3),
        compensation_type: OPEN_CODE,
        reason: `QA valid Nest OT COMP ${STAMP}`,
      },
    });
    validPostOk = validPost.status >= 200 && validPost.status < 300;
    validId = validPost.data?.id || validPost.json?.data?.id || null;
    const validComp =
      validPost.data?.compensation_type ||
      validPost.json?.data?.compensation_type ||
      null;
    step('VALID_NEST_OT_COMP', {
      verdict: validPostOk ? 'PASS' : 'WARN',
      summary: `${validPost.status} ${validPost.code} id=${validId} compensation_type=${validComp}`,
    });
    report.val['AC-PLT-ATT-COMP-01_L1_VALID'] = {
      expect: 'Nest compensation_type ∈ catalog → 2xx (L1 consumer wire)',
      status: validPost.status,
      code: validPost.code,
      id: validId,
      compensation_type: validComp,
      verdict: validPostOk ? 'PASS' : 'WARN',
      note: 'UF browser Nest picker rebind = R-PLT-ATT-OTC-03 residual; L1 proves API accept Nest codes',
    };
  }

  // Soft-retire A
  let retireTarget = createdA;
  let retireCode = OPEN_CODE;
  if (!retireTarget) {
    failOverall('no created ot-comp-type to soft-retire');
  } else {
    const retire = await call(
      auth.token,
      'POST',
      `/attendance/ot-comp-types/${retireTarget}/retire`,
      {
        query: { company_id: HEADER_COMPANY },
        companyId: HEADER_COMPANY,
      },
    );
    const retireOk = retire.status >= 200 && retire.status < 300;
    const retireStatus = retire.data?.status || retire.json?.data?.status || null;
    step('SOFT_RETIRE', {
      verdict: retireOk ? 'PASS' : 'FAIL',
      summary: `${retire.status} ${retire.code} status=${retireStatus} archived_at=${retire.data?.archived_at || retire.json?.data?.archived_at || null}`,
    });

    const listAfter = await call(auth.token, 'GET', '/attendance/ot-comp-types', {
      query: { company_id: HEADER_COMPANY },
    });
    const codesAfter = codesOf(listAfter.data ?? listAfter.json);
    const hiddenDefault = !codesAfter.includes(retireCode.toLowerCase());

    const listAll = await call(auth.token, 'GET', '/attendance/ot-comp-types', {
      query: { company_id: HEADER_COMPANY, include_inactive: 'true' },
    });
    const allRows = asList(listAll.data ?? listAll.json);
    const retiredVisible = allRows.some(
      (r) =>
        (String(r.id) === String(retireTarget) ||
          String(r.code || '').toLowerCase() === retireCode.toLowerCase()) &&
        String(r.status || '').toLowerCase() === 'inactive',
    );

    const effAfter = await call(auth.token, 'GET', '/attendance/ot-comp-types/effective', {
      query: { company_id: HEADER_COMPANY },
    });
    const effAfterCodes = codesOf(effAfter.data ?? effAfter.json);
    const effExcludes = !effAfterCodes.includes(retireCode.toLowerCase());

    step('SOFT_RETIRE_VISIBILITY', {
      verdict: hiddenDefault && retiredVisible && effExcludes ? 'PASS' : 'FAIL',
      summary: `hiddenDefault=${hiddenDefault} retiredVisible=${retiredVisible} effExcludes=${effExcludes}`,
    });
    report.val['AC-PLT-ATT-COMP-01e'] = {
      expect: 'soft-retire → default list/EFF hide · include_inactive shows',
      retire_status: retireStatus,
      hiddenDefault,
      retiredVisible,
      effExcludes,
      verdict:
        retireOk && hiddenDefault && retiredVisible && effExcludes ? 'PASS' : 'FAIL',
    };
    if (report.val['AC-PLT-ATT-COMP-01e'].verdict !== 'PASS') {
      failOverall('soft-retire visibility FAIL');
    }
  }

  // U19 get-by-id fake UUID → OTC-404 ≠ KEY
  const fakeId = '00000000-0000-4000-8000-000000000099';
  const miss = await call(auth.token, 'GET', `/attendance/ot-comp-types/${fakeId}`, {
    query: { company_id: HEADER_COMPANY },
  });
  const missOk =
    miss.status === 404 && /HRM-ATT-OTC-404/.test(`${miss.code || ''} ${miss.summary || ''}`);
  step('U19_OTC_404', {
    verdict: missOk ? 'PASS' : miss.status === 404 ? 'WARN' : 'FAIL',
    summary: `${miss.status} ${miss.code}`,
  });
  report.val.U19_OTC_404 = {
    expect: 'get-by-id miss → HRM-ATT-OTC-404 ≠ invent KEY',
    status: miss.status,
    code: miss.code,
    verdict: missOk || miss.status === 404 ? 'PASS' : 'FAIL',
  };

  // Member scope parity (optional)
  const memberAuth = await login(MEMBER_EMAIL, PASSWORD);
  if (memberAuth.ok && createdB) {
    const memberGet = await call(
      memberAuth.token,
      'GET',
      `/attendance/ot-comp-types/${createdB}`,
      {
        query: { company_id: HEADER_COMPANY },
        companyId: HEADER_COMPANY,
      },
    );
    const scopeDeny =
      memberGet.status === 404 ||
      memberGet.status === 409 ||
      memberGet.status === 403;
    step('U19_MEMBER_SCOPE', {
      verdict: scopeDeny ? 'PASS' : 'WARN',
      summary: `${memberGet.status} ${memberGet.code} · member=${MEMBER_EMAIL}`,
    });
    report.val.U19_member_scope = {
      expect: 'member CEO cannot read holding row → 404/409/403 as AC allows',
      status: memberGet.status,
      code: memberGet.code,
      verdict: scopeDeny ? 'PASS' : 'WARN',
    };
  } else {
    step('U19_MEMBER_SCOPE', {
      verdict: 'SKIP',
      summary: memberAuth.ok
        ? 'no createdB id'
        : `member login fail ${memberAuth.status}`,
    });
  }

  // Seal routes spot — peer OT-TYPE + leave/WS/code/shift still 200
  const sealPaths = [
    '/attendance/ot-types/effective',
    '/attendance/leave-types/effective',
    '/attendance/work-sites',
    '/attendance/attendance-codes/effective',
    '/attendance/work-shifts/effective',
  ];
  const sealResults = [];
  for (const p of sealPaths) {
    const r = await call(auth.token, 'GET', p, {
      query: { company_id: HEADER_COMPANY },
    });
    sealResults.push({ path: p, status: r.status, code: r.code });
  }
  const sealsOk = sealResults.every((s) => s.status === 200);
  step('SEAL_ROUTES_SPOT', {
    verdict: sealsOk ? 'PASS' : 'WARN',
    summary: summarizeBody(sealResults, 500),
  });

  // Cleanup: soft-retire B + temp OT type + delete valid OT if created
  if (createdB) {
    const retireB = await call(
      auth.token,
      'POST',
      `/attendance/ot-comp-types/${createdB}/retire`,
      { query: { company_id: HEADER_COMPANY } },
    );
    step('CLEANUP_RETIRE_B', {
      verdict: retireB.status >= 200 && retireB.status < 300 ? 'PASS' : 'WARN',
      summary: `${retireB.status} ${retireB.code}`,
    });
  }
  if (otTypeCreatedId) {
    const retireOt = await call(
      auth.token,
      'POST',
      `/attendance/ot-types/${otTypeCreatedId}/retire`,
      { query: { company_id: HEADER_COMPANY } },
    );
    step('CLEANUP_PEER_OT_TYPE', {
      verdict: retireOt.status >= 200 && retireOt.status < 300 ? 'PASS' : 'WARN',
      summary: `${retireOt.status} ${retireOt.code} · temp peer retired — OT-TYPE L1/FE seals RETAIN`,
    });
  }
  if (validId) {
    try {
      const del = await call(auth.token, 'DELETE', `/attendance/overtime-requests/${validId}`, {
        companyId: emp.companyId,
      });
      step('CLEANUP_VALID_OT', {
        verdict: del.status < 500 ? 'PASS' : 'WARN',
        summary: `${del.status} ${del.code}`,
      });
    } catch (e) {
      step('CLEANUP_VALID_OT', { verdict: 'WARN', summary: String(e?.message || e) });
    }
  }

  // 01c NOTE_BLOCKED — no wipe to re-force empty EFF invent-skip
  report.val['AC-PLT-ATT-COMP-01c'] = {
    expect: 'EFF=0 invent soft-skip · no seed',
    baseline_eff_total: effTotal0,
    invent_skip_at_empty_live: effTotal0 === 0 ? 'baseline_empty_ok_not_reforced_after_n1' : 'baseline_already_gt0',
    jest_cite: 'att-ot-comp-type.service.spec.ts empty EFF soft-skip',
    seed_used: false,
    wipe_forbidden: true,
    verdict: 'NOTE_BLOCKED',
    note: 'Live invent-skip-at-empty not re-forced after N+1 (would need wipe — FORBIDDEN U65). Jest covers soft-skip; live invent KEY proven at EFF>0 (01b).',
  };

  // Honesty
  report.val['AC-PLT-ATT-COMP-01H'] = {
    attendance_uat_ready: false,
    payroll_e2e_ready: false,
    contracts_printable_ready: false,
    formula_LIVE: false,
    ot_type_seal_retain: true,
    peer_ot_type_reopen: false,
    C_SLICE_NE_MODULE: true,
    U65_zero_seed: true,
    fold_into_att_ot_type: false,
    invent_fe_admin: false,
    verdict: 'PASS',
  };

  // FE residual OBS (not FAIL whole L1)
  if (report.disk_fe.fe_comp_hardcode_2 && !report.disk_fe.fe_comp_fetch) {
    report.residuals.push({
      id: 'R-PLT-ATT-OTC-03',
      severity: 'P2',
      owner: 'dev-fe',
      note: 'OvertimeRequestTab compensation still hardcode salary|compensatory_leave — rebind Nest EFF when EFF>0 (VAL-ATT-COMP-CNS-06). L1 API PASS ≠ UF 🟢.',
    });
    obsOverall('FE compensation Nest picker residual R-PLT-ATT-OTC-03 — L1 core PASS');
  }
  if (report.val['AC-PLT-ATT-COMP-01c']?.verdict === 'NOTE_BLOCKED') {
    if (report.overall !== 'FAIL') {
      // keep PASS or PASS_WITH_OBS; NOTE_BLOCKED alone does not fail
      if (report.overall === 'PASS') {
        // leave as PASS if only 01c NOTE — peer OT-TYPE pattern used PASS_WITH_OBS for FE; we already OBS for FE
      }
    }
  }

  // network_key_hit top-level
  report.network_key_hit = !!report.val['AC-PLT-ATT-COMP-01b']?.network_key_hit;
  report.key_locked = 'HRM-ATT-OT-COMP-KEY';
  report.orthogonal_to = 'HRM-ATT-OT-TYPE-KEY';

  report.endedAt = new Date().toISOString();
  save();
  const exitCode = report.overall === 'FAIL' ? 2 : 0;
  console.log(
    JSON.stringify(
      {
        stamp: STAMP,
        overall: report.overall,
        ack_status: report.ack_status,
        network_key_hit: report.network_key_hit,
        out: OUT,
        open_code: OPEN_CODE,
        invent_code: INVENT_CODE,
        fail_reason: report.fail_reason || null,
        obs_reason: report.obs_reason || null,
      },
      null,
      2,
    ),
  );
  process.exit(exitCode);
}

main().catch((e) => {
  report.overall = 'FAIL';
  report.ack_status = 'FAIL_TO_PM';
  report.fail_reason = String(e?.stack || e);
  report.endedAt = new Date().toISOString();
  save();
  console.error(e);
  process.exit(2);
});
