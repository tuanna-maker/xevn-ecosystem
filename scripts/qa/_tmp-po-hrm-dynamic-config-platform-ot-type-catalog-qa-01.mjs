#!/usr/bin/env node
/**
 * PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-QA-01 — L1 API (+ FE spot)
 * U65 zero-seed · honesty attendance_uat_ready=false · payroll_e2e_ready=false · contracts_printable_ready=false
 * C-SLICE-≠-MODULE · RETAIN CTR KEY/clause · ATT leave L1 / CODE/WS/SHIFT · FE LVRULE 01g HOLD
 * Parent: OT-TYPE-CATALOG-BE-01 READY_FOR_QA
 *
 * AC: admin N+1 · soft-retire · invent HRM-ATT-OT-TYPE-KEY · 01c NOTE_BLOCKED · 01f coeff ≠ formula · FE residual
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
const HEADER_COMPANY = process.env.QA_HEADER_COMPANY || 'main';
const TENANT = process.env.QA_TENANT_ID || 'xevn';
const TS = Date.now().toString(36).toLowerCase();
const STAMP = `ATTOTQA-${TS.toUpperCase().slice(-8)}`;
const OPEN_CODE = `comp_time_${TS}`.slice(0, 48);
const OPEN_CODE_B = `night_qa_${TS}`.slice(0, 48);
const INVENT_CODE = `zz_invent_att_ot_${TS}`.slice(0, 48);
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = resolve(
  ROOT,
  'docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-ot-type-catalog-qa-01.json',
);

const SEALS = {
  CTR_TEMPLATE: 'CTRTPLQA-MSK7U4CG',
  ATT_LVRULE: 'ATTLVRULEQA2-MSK79F2F',
  ATT_CODE: 'ATTCODEQA-MSK4T1A5',
  ATT_LEAVE: 'ATTLEAVEQA-MSJ7CPJH',
  ATT_WS: 'ATTWSQA-MSJC3IN9',
  ATT_SHIFT: 'ATTSHIFTQA-MSK5FXP3',
  FE_LVRULE_01g: 'HOLD',
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

function otCodes(data) {
  return asList(data)
    .map((r) => r.code)
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

function inspectDistAndFe() {
  const out = {
    dist_has_key: false,
    src_has_key: false,
    dist_has_ot_types_route: false,
    src_has_ot_types_route: false,
    fe_ot_hardcode_3: false,
    fe_hardcode_ids: [],
    fe_ot_types_fetch: false,
    fe_admin_surface: false,
    note: '',
  };
  const distConst = resolve(ROOT, 'apps/api/hrm-api/dist/attendance/att-ot-type.constants.js');
  const srcConst = resolve(ROOT, 'apps/api/hrm-api/src/attendance/att-ot-type.constants.ts');
  const distCtrl = resolve(ROOT, 'apps/api/hrm-api/dist/attendance/attendance.controller.js');
  const srcCtrl = resolve(ROOT, 'apps/api/hrm-api/src/attendance/attendance.controller.ts');
  const distSvc = resolve(ROOT, 'apps/api/hrm-api/dist/attendance/att-ot-type.service.js');
  const srcSvc = resolve(ROOT, 'apps/api/hrm-api/src/attendance/att-ot-type.service.ts');
  const feTab = resolve(
    ROOT,
    'apps/web/hrm/src/components/attendance/OvertimeRequestTab.tsx',
  );
  for (const p of [distConst, distSvc, distCtrl]) {
    if (existsSync(p)) {
      const t = readFileSync(p, 'utf8');
      if (/HRM-ATT-OT-TYPE-KEY/.test(t)) out.dist_has_key = true;
      if (/ot-types/.test(t)) out.dist_has_ot_types_route = true;
    }
  }
  for (const p of [srcConst, srcSvc, srcCtrl]) {
    if (existsSync(p)) {
      const t = readFileSync(p, 'utf8');
      if (/HRM-ATT-OT-TYPE-KEY/.test(t)) out.src_has_key = true;
      if (/ot-types/.test(t)) out.src_has_ot_types_route = true;
    }
  }
  if (existsSync(feTab)) {
    const t = readFileSync(feTab, 'utf8');
    const ids = ['weekday', 'weekend', 'holiday'].filter(
      (id) => t.includes(`value="${id}"`) || t.includes(`'${id}'`) || t.includes(`"${id}"`),
    );
    out.fe_hardcode_ids = [...new Set(ids)];
    out.fe_ot_hardcode_3 =
      ids.includes('weekday') && ids.includes('weekend') && ids.includes('holiday');
    out.fe_ot_types_fetch = /ot-types|useOtTypes|att_ot_type|listOtTypes/.test(t);
  }
  // FE admin surface search (spot)
  const feRoot = resolve(ROOT, 'apps/web/hrm/src');
  try {
    const grepHint = execSync(
      `rg -l "ot-types|Loại tăng ca|att_ot_type|OtType" "${feRoot.replace(/\\/g, '/')}" 2>nul || true`,
      { encoding: 'utf8', shell: true },
    );
    out.fe_admin_surface = Boolean(grepHint && grepHint.trim());
    out.fe_admin_files = grepHint.trim().split(/\r?\n/).filter(Boolean).slice(0, 8);
  } catch {
    out.fe_admin_surface = false;
  }
  out.note = out.fe_ot_hardcode_3
    ? 'VAL-ATT-OT-CNS-06 residual — OvertimeRequestTab closed weekday|weekend|holiday; no Nest EFF bind'
    : 'FE hardcode not detected or already rebound';
  return out;
}

const report = {
  work_item_id: 'PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-QA-01',
  stamp: STAMP,
  startedAt: new Date().toISOString(),
  gitHead: gitHead(),
  env: { PORTAL, XBOS, HRM, EMAIL, HEADER_COMPANY, TENANT },
  honesty: {
    attendance_uat_ready: false,
    payroll_e2e_ready: false,
    contracts_printable_ready: false,
    C_SLICE_NE_MODULE: true,
    U65_zero_seed: true,
    formula_LIVE: false,
    seals_retain: SEALS,
  },
  dist_fe: null,
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
  report.dist_fe = inspectDistAndFe();
  const keyLive = report.dist_fe.dist_has_key || report.dist_fe.src_has_key;
  step('DIST_FE_GATE', {
    verdict: keyLive ? 'PASS' : 'FAIL',
    summary: summarizeBody(report.dist_fe, 500),
  });
  if (!keyLive) failOverall('HRM-ATT-OT-TYPE-KEY absent in dist/src');

  const health = await call(null, 'GET', '');
  step('L0_HRM_HEALTH', {
    verdict: health.status === 200 ? 'PASS' : 'FAIL',
    summary: `${health.status} ${health.code}`,
  });
  if (health.status !== 200) failOverall('L0 HRM health FAIL');

  const unauth = await call(null, 'GET', '/attendance/ot-types/effective', {
    query: { company_id: HEADER_COMPANY },
  });
  const unauthOk = unauth.status === 401 || unauth.status === 403;
  const routeMissing = unauth.status === 404;
  step('UNAUTH_EFF', {
    verdict: unauthOk ? 'PASS' : routeMissing ? 'FAIL' : 'FAIL',
    summary: `${unauth.status} ${unauth.code}`,
  });
  report.val.unauth_effective = {
    expect: '401/403 ≠ 404',
    status: unauth.status,
    code: unauth.code,
    verdict: unauthOk ? 'PASS' : 'FAIL',
  };
  if (routeMissing) {
    failOverall('ot-types routes 404 — hrm-api restart / runtime missing new routes');
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

  // Baseline
  const list0 = await call(auth.token, 'GET', '/attendance/ot-types', {
    query: { company_id: HEADER_COMPANY },
  });
  const rows0 = asList(list0.data ?? list0.json);
  const total0 =
    typeof list0.data?.total === 'number' ? list0.data.total : rows0.length;
  const inactiveInDefault0 = rows0.some(
    (r) => String(r.status || '').toLowerCase() === 'inactive',
  );
  step('LIST_DEFAULT_0', {
    verdict: list0.status === 200 && !inactiveInDefault0 ? 'PASS' : list0.status === 200 ? 'WARN' : 'FAIL',
    summary: `${list0.status} ${list0.code} total=${total0} inactiveInDefault=${inactiveInDefault0}`,
  });

  const eff0 = await call(auth.token, 'GET', '/attendance/ot-types/effective', {
    query: { company_id: HEADER_COMPANY },
  });
  const effRows0 = asList(eff0.data ?? eff0.json);
  const effTotal0 =
    typeof eff0.data?.total === 'number' ? eff0.data.total : effRows0.length;
  step('EFF_0', {
    verdict: eff0.status === 200 ? 'PASS' : 'FAIL',
    summary: `${eff0.status} ${eff0.code} total=${effTotal0}`,
  });

  // Admin CREATE N+1 (two so soft-retire one leaves EFF>0 for invent)
  const createA = await call(auth.token, 'POST', '/attendance/ot-types', {
    body: {
      companyId: HEADER_COMPANY,
      code: OPEN_CODE,
      nameVi: `Bù giờ QA ${STAMP}`,
      nameEn: `Comp time QA ${STAMP}`,
      defaultCoeff: 1.75,
      sortOrder: 50,
      status: 'active',
    },
  });
  const createdA =
    createA.data?.id || createA.json?.data?.id || null;
  const createAOk = createA.status >= 200 && createA.status < 300;
  const displayA = createA.data || createA.json?.data || {};
  const displayReadyA =
    createAOk &&
    (displayA.nameVi || displayA.name_vi) &&
    (displayA.defaultCoeff !== undefined ||
      displayA.defaultCoefficient !== undefined ||
      displayA.default_coeff !== undefined);
  step('ADMIN_N1_A', {
    verdict: createAOk && displayReadyA ? 'PASS' : createAOk ? 'WARN' : 'FAIL',
    summary: `${createA.status} ${createA.code} code=${OPEN_CODE} id=${createdA} nameVi=${displayA.nameVi || displayA.name_vi} coeff=${displayA.defaultCoeff ?? displayA.defaultCoefficient ?? displayA.default_coeff}`,
  });
  report.val['AC-PLT-ATT-OT-01d'] = {
    expect: 'Admin CREATE N+1 open code 2xx/201 · F5 list/EFF · display-ready nameVi/defaultCoeff',
    status: createA.status,
    code: createA.code,
    open_key: OPEN_CODE,
    createdId: createdA,
    displayReady: displayReadyA,
    nameVi: displayA.nameVi || displayA.name_vi || null,
    defaultCoeff:
      displayA.defaultCoeff ?? displayA.defaultCoefficient ?? displayA.default_coeff ?? null,
    summary: createA.summary,
    verdict: createAOk ? 'PASS' : 'FAIL',
  };
  if (!createAOk) failOverall('admin CREATE N+1 FAIL');

  const createB = await call(auth.token, 'POST', '/attendance/ot-types', {
    body: {
      companyId: HEADER_COMPANY,
      code: OPEN_CODE_B,
      nameVi: `Ca đêm QA ${STAMP}`,
      defaultCoeff: 2.25,
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
  const list1 = await call(auth.token, 'GET', '/attendance/ot-types', {
    query: { company_id: HEADER_COMPANY },
  });
  const codes1 = otCodes(list1.data ?? list1.json);
  const rows1 = asList(list1.data ?? list1.json);
  const total1 =
    typeof list1.data?.total === 'number' ? list1.data.total : rows1.length;
  const hasOpen = codes1.includes(OPEN_CODE.toLowerCase());
  const openRow = rows1.find(
    (r) => String(r.code || '').toLowerCase() === OPEN_CODE.toLowerCase(),
  );
  const f5Display =
    openRow &&
    (openRow.nameVi || openRow.name_vi) &&
    (openRow.defaultCoeff !== undefined ||
      openRow.defaultCoefficient !== undefined ||
      openRow.default_coeff !== undefined);
  step('LIST_HAS_OPEN_F5', {
    verdict: hasOpen && total1 > 0 && f5Display ? 'PASS' : hasOpen ? 'WARN' : 'FAIL',
    summary: `hasOpen=${hasOpen} total=${total1} baseline=${total0} f5Display=${f5Display}`,
  });
  if (createAOk && hasOpen) {
    report.val['AC-PLT-ATT-OT-01d'].verdict = 'PASS';
    report.val['AC-PLT-ATT-OT-01d'].f5 = {
      total: total1,
      hasOpen,
      f5Display,
      nameVi: openRow?.nameVi || openRow?.name_vi || null,
      defaultCoeff:
        openRow?.defaultCoeff ??
        openRow?.defaultCoefficient ??
        openRow?.default_coeff ??
        null,
    };
  } else if (createAOk) {
    report.val['AC-PLT-ATT-OT-01d'].verdict = 'FAIL';
    failOverall('F5 list missing open code');
  }

  const eff1 = await call(auth.token, 'GET', '/attendance/ot-types/effective', {
    query: { company_id: HEADER_COMPANY },
  });
  const effCodes1 = otCodes(eff1.data ?? eff1.json);
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
    summary: `total=${effTotal1} hasOpen=${effCodes1.includes(OPEN_CODE.toLowerCase())} nameVi=${effOpen?.nameVi || effOpen?.name_vi} coeff=${effOpen?.defaultCoeff ?? effOpen?.defaultCoefficient ?? effOpen?.default_coeff}`,
  });

  // 01f — display field only; FORBIDDEN formula LIVE claim
  report.val['AC-PLT-ATT-OT-01f'] = {
    expect: 'defaultCoeff display-ready only · FORBIDDEN formula LIVE',
    defaultCoeff_on_list:
      openRow?.defaultCoeff ??
      openRow?.defaultCoefficient ??
      openRow?.default_coeff ??
      null,
    defaultCoeff_on_eff:
      effOpen?.defaultCoeff ??
      effOpen?.defaultCoefficient ??
      effOpen?.default_coeff ??
      null,
    formula_LIVE_claimed: false,
    payroll_e2e_ready: false,
    verdict: f5Display || (effOpen && (effOpen.defaultCoeff !== undefined || effOpen.default_coeff !== undefined))
      ? 'PASS'
      : 'FAIL',
    note: 'Evidence stamps defaultCoeff as catalog display/prefill field only — NOT payroll formula engine LIVE',
  };
  step('AC_01f_COEFF_DISPLAY', {
    verdict: report.val['AC-PLT-ATT-OT-01f'].verdict,
    summary: `listCoeff=${report.val['AC-PLT-ATT-OT-01f'].defaultCoeff_on_list} formula_LIVE_claimed=false`,
  });

  // Pick employee for invent
  const emp = await pickEmployee(auth.token);
  step('PICK_EMPLOYEE', {
    verdict: emp ? 'PASS' : 'FAIL',
    summary: emp
      ? `id=${emp.employeeId} company=${emp.companyId}`
      : 'no employee',
  });
  if (!emp) {
    failOverall('no employee for overtime invent');
    report.endedAt = new Date().toISOString();
    save();
    process.exit(2);
  }

  // Invent overtime_type ∉ catalog when EFF>0
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
    overtime_type: INVENT_CODE,
    reason: `QA invent OT TYPE KEY ${STAMP}`,
  };
  const inventPost = await call(auth.token, 'POST', '/attendance/overtime-requests', {
    companyId: emp.companyId,
    body: inventBody,
  });
  const inventMsg = `${inventPost.code || ''} ${inventPost.message || ''} ${inventPost.summary || ''}`;
  const inventOk =
    inventPost.status >= 400 &&
    inventPost.status < 500 &&
    /HRM-ATT-OT-TYPE-KEY/.test(inventMsg);
  step('INVENT_OT_TYPE_KEY', {
    verdict: inventOk ? 'PASS' : 'FAIL',
    summary: `${inventPost.status} ${inventPost.code} · ${inventPost.message || ''}`,
  });
  report.val['AC-PLT-ATT-OT-01b'] = {
    expect: '4xx HRM-ATT-OT-TYPE-KEY · no persist',
    status: inventPost.status,
    code: inventPost.code,
    invent_key: INVENT_CODE,
    summary: inventPost.summary,
    verdict: inventOk ? 'PASS' : 'FAIL',
    network_key_hit: inventOk,
  };
  report.val['VAL-ATT-OT-CNS-01'] = report.val['AC-PLT-ATT-OT-01b'];
  if (!inventOk) failOverall('invent KEY miss');

  const otList = await call(auth.token, 'GET', '/attendance/overtime-requests', {
    query: { company_id: emp.companyId },
    companyId: emp.companyId,
  });
  const otRows = asList(otList.data ?? otList.json);
  const inventPersisted = otRows.some(
    (r) =>
      String(r.overtime_type || '') === INVENT_CODE ||
      String(r.reason || '').includes(STAMP),
  );
  step('INVENT_NO_PERSIST', {
    verdict: !inventPersisted ? 'PASS' : 'FAIL',
    summary: `inventPersisted=${inventPersisted} listStatus=${otList.status}`,
  });
  if (inventPersisted) failOverall('invent persisted');

  // Valid Nest open code → 2xx (L1 wire; FE picker residual separate)
  let validPostOk = false;
  let validId = null;
  let validCoeff = null;
  if (createdA && OPEN_CODE) {
    const validPost = await call(auth.token, 'POST', '/attendance/overtime-requests', {
      companyId: emp.companyId,
      body: {
        ...inventBody,
        overtime_date: offsetIso(3),
        overtime_type: OPEN_CODE,
        // omit coefficient → BE may prefill defaultCoeff (display/prefill ≠ formula LIVE)
        reason: `QA valid Nest OT type ${STAMP}`,
      },
    });
    validPostOk = validPost.status >= 200 && validPost.status < 300;
    validId = validPost.data?.id || validPost.json?.data?.id || null;
    validCoeff =
      validPost.data?.coefficient ?? validPost.json?.data?.coefficient ?? null;
    step('VALID_NEST_OT_TYPE', {
      verdict: validPostOk ? 'PASS' : 'WARN',
      summary: `${validPost.status} ${validPost.code} id=${validId} coeff=${validCoeff}`,
    });
    report.val['AC-PLT-ATT-OT-01_L1_VALID'] = {
      expect: 'Nest OT type ∈ catalog → 2xx (L1 consumer wire)',
      status: validPost.status,
      code: validPost.code,
      id: validId,
      coefficient: validCoeff,
      verdict: validPostOk ? 'PASS' : 'WARN',
      note: 'UF browser Nest picker rebind = R-PLT-ATT-OT-FE-01 residual; L1 proves API accept Nest codes; coeff prefill ≠ formula LIVE',
    };
  }

  // Soft-retire A via POST .../retire
  let retireTarget = createdA;
  let retireCode = OPEN_CODE;
  if (!retireTarget) {
    failOverall('no created ot-type to soft-retire');
  } else {
    const retire = await call(
      auth.token,
      'POST',
      `/attendance/ot-types/${retireTarget}/retire`,
      {
        query: { company_id: HEADER_COMPANY },
        companyId: HEADER_COMPANY,
      },
    );
    const retireOk = retire.status >= 200 && retire.status < 300;
    const retireStatus =
      retire.data?.status || retire.json?.data?.status || null;
    step('SOFT_RETIRE', {
      verdict: retireOk ? 'PASS' : 'FAIL',
      summary: `${retire.status} ${retire.code} status=${retireStatus} archived_at=${retire.data?.archived_at || retire.json?.data?.archived_at || null}`,
    });

    const listAfter = await call(auth.token, 'GET', '/attendance/ot-types', {
      query: { company_id: HEADER_COMPANY },
    });
    const codesAfter = otCodes(listAfter.data ?? listAfter.json);
    const hiddenDefault = !codesAfter.includes(retireCode.toLowerCase());
    const inactiveDefault = asList(listAfter.data ?? listAfter.json).some(
      (r) => String(r.status || '').toLowerCase() === 'inactive',
    );

    const listAll = await call(auth.token, 'GET', '/attendance/ot-types', {
      query: { company_id: HEADER_COMPANY, include_inactive: 'true' },
    });
    const allRows = asList(listAll.data ?? listAll.json);
    const retiredVisible = allRows.some(
      (r) =>
        (String(r.id) === String(retireTarget) ||
          String(r.code || '').toLowerCase() === retireCode.toLowerCase()) &&
        (String(r.status || '').toLowerCase() === 'inactive' ||
          r.archived_at),
    );

    const effAfter = await call(auth.token, 'GET', '/attendance/ot-types/effective', {
      query: { company_id: HEADER_COMPANY },
    });
    const effCodesAfter = otCodes(effAfter.data ?? effAfter.json);
    const effExcludes = !effCodesAfter.includes(retireCode.toLowerCase());

    const eOk =
      retireOk &&
      listAfter.status === 200 &&
      hiddenDefault &&
      !inactiveDefault &&
      listAll.status === 200 &&
      retiredVisible &&
      effExcludes;
    step('AC_01e_LIST_FILTER', {
      verdict: eOk ? 'PASS' : 'FAIL',
      summary: `hiddenDefault=${hiddenDefault} inactiveInDefault=${inactiveDefault} retiredInInclude=${retiredVisible} effExcludes=${effExcludes}`,
    });
    report.val['AC-PLT-ATT-OT-01e'] = {
      expect: 'soft-retire → inactive; EFF excludes; include_inactive shows',
      retireStatus: retire.status,
      retireCode: retire.code,
      status: retireStatus,
      hiddenDefault,
      retiredVisible,
      effExcludes,
      verdict: eOk ? 'PASS' : 'FAIL',
    };
    if (!eOk) failOverall('soft-retire / list filter FAIL');
  }

  // Soft-retire B + cleanup valid OT request (no litter of active QA rows if possible)
  if (createdB) {
    const retireB = await call(
      auth.token,
      'POST',
      `/attendance/ot-types/${createdB}/retire`,
      {
        query: { company_id: HEADER_COMPANY },
        companyId: HEADER_COMPANY,
      },
    );
    step('SOFT_RETIRE_B_CLEANUP', {
      verdict: retireB.status >= 200 && retireB.status < 300 ? 'PASS' : 'WARN',
      summary: `${retireB.status} ${retireB.code}`,
    });
  }
  if (validId) {
    const delOt = await call(
      auth.token,
      'DELETE',
      `/attendance/overtime-requests/${validId}`,
      {
        query: { company_id: emp.companyId },
        companyId: emp.companyId,
      },
    );
    step('CLEANUP_VALID_OT', {
      verdict: delOt.status >= 200 && delOt.status < 300 ? 'PASS' : 'WARN',
      summary: `${delOt.status} ${delOt.code}`,
    });
  }

  // 01c — empty EFF soft-skip
  report.val['AC-PLT-ATT-OT-01c'] = {
    expect: 'EFF=0 invent soft-skip · no seed · empty CTA',
    verdict: 'NOTE_BLOCKED',
    note:
      'Live Nest has/created active rows; isolating EFF=0 would require wipe/retire-all (risk peer data) — FORBIDDEN U65 reckless DELETE. Covered by BE jest VAL-ATT-OT-CNS-05 / AC-01c empty soft-skip; live invent-only path proven at EFF>0 (01b). Baseline EFF before admin documented.',
    baseline_eff_before_admin: effTotal0,
    live_eff_after_admin: effTotal1,
    jest_cite:
      'att-ot-type.service.spec + attendance-requests.service.spec VAL-ATT-OT-CNS-05 soft-skip',
  };
  step('AC_01c_EMPTY', {
    verdict: 'NOTE_BLOCKED',
    summary: `baselineEff=${effTotal0} afterAdmin=${effTotal1}`,
  });

  // FE bind / admin surface
  const feHard = report.dist_fe.fe_ot_hardcode_3;
  const feNest = report.dist_fe.fe_ot_types_fetch;
  report.val['AC-PLT-ATT-OT-01'] = {
    expect: 'EFF>0 OvertimeRequestTab picker Nest GET ot-types',
    fe_hardcode_3: feHard,
    fe_fetches_ot_types: feNest,
    fe_admin_surface: report.dist_fe.fe_admin_surface,
    verdict: feHard && !feNest ? 'PASS_WITH_OBS' : feNest ? 'PASS' : 'PASS_WITH_OBS',
    residual: 'R-PLT-ATT-OT-FE-01',
    note: 'FE still closed weekday|weekend|holiday while Nest EFF>0 — admin L1 PASS; Nest rebind P2 residual — do not FAIL whole BE',
  };
  report.val['R-PLT-ATT-OT-FE-ADMIN'] = {
    severity: 'P2',
    expect: 'FE admin surface Loại tăng ca (Settings REF only this wave)',
    present: report.dist_fe.fe_admin_surface,
    verdict: report.dist_fe.fe_admin_surface ? 'OBS' : 'PASS_WITH_OBS',
    note: 'Admin L1 proven via authenticated Network POST/GET — FE admin ABSENT OK this wave',
  };
  if (feHard && !feNest) {
    obsOverall('FE OvertimeRequestTab hardcode-3 residual R-PLT-ATT-OT-FE-01');
    report.residuals.push({
      id: 'R-PLT-ATT-OT-FE-01',
      severity: 'P2',
      owner: 'dev-fe',
      summary:
        'OvertimeRequestTab still hardcode weekday|weekend|holiday + getCoefficient; rebind Nest ot-types/effective when EFF>0',
    });
  }
  if (!report.dist_fe.fe_admin_surface) {
    report.residuals.push({
      id: 'R-PLT-ATT-OT-FE-ADMIN',
      severity: 'P2',
      owner: 'dev-fe',
      summary:
        'FE admin catalog surface for Loại tăng ca ABSENT — L1 via authenticated Network only this wave',
    });
    if (report.overall === 'PASS') {
      obsOverall('FE admin surface ABSENT R-PLT-ATT-OT-FE-ADMIN');
    }
  }

  // Seal spot (read-only — do not reopen)
  const sealLeave = await call(auth.token, 'GET', '/attendance/leave-types/effective', {
    query: { company_id: HEADER_COMPANY },
  });
  const sealWs = await call(auth.token, 'GET', '/attendance/work-sites', {
    query: { company_id: HEADER_COMPANY },
  });
  const sealCode = await call(auth.token, 'GET', '/attendance/attendance-codes/effective', {
    query: { company_id: HEADER_COMPANY },
  });
  const sealShift = await call(auth.token, 'GET', '/attendance/work-shifts/effective', {
    query: { company_id: HEADER_COMPANY },
  });
  step('SEAL_SPOT', {
    verdict:
      sealLeave.status === 200 &&
      sealWs.status < 500 &&
      sealCode.status === 200 &&
      sealShift.status === 200
        ? 'PASS'
        : 'WARN',
    summary: `leave=${sealLeave.status} ws=${sealWs.status} code=${sealCode.status} shift=${sealShift.status}`,
  });

  // U19 get-by-id fake → OT-404 ≠ KEY
  const fakeId = '00000000-0000-4000-8000-000000000099';
  const getFake = await call(auth.token, 'GET', `/attendance/ot-types/${fakeId}`, {
    query: { company_id: HEADER_COMPANY },
  });
  const u19Ok =
    getFake.status === 404 &&
    String(getFake.code || '').includes('HRM-ATT-OT-404');
  step('U19_GET_FAKE', {
    verdict: getFake.status === 404 ? 'PASS' : 'WARN',
    summary: `${getFake.status} ${getFake.code}`,
  });
  report.val['U19_OT_404'] = {
    expect: '404 HRM-ATT-OT-404 ≠ invent KEY',
    status: getFake.status,
    code: getFake.code,
    verdict: getFake.status === 404 ? 'PASS' : 'WARN',
    note: u19Ok ? 'exact OT-404' : '404 shape OK if code present',
  };

  report.val['AC-PLT-ATT-OT-01H'] = {
    expect: 'honesty flags false · C-SLICE · seals RETAIN · DENY formula LIVE',
    attendance_uat_ready: false,
    payroll_e2e_ready: false,
    contracts_printable_ready: false,
    formula_LIVE: false,
    C_SLICE_NE_MODULE: true,
    U65_zero_seed: true,
    seals_retain: SEALS,
    verdict: 'PASS',
  };
  step('AC_01H_HONESTY', {
    verdict: 'PASS',
    summary: 'ready=false · formula_LIVE=false · seals RETAIN · C-SLICE',
  });

  // Final ack: FAIL wins; else PASS_WITH_OBS if residuals FE; else PASS
  if (report.overall !== 'FAIL') {
    if (report.residuals.length > 0) {
      report.overall = 'PASS_WITH_OBS';
      report.ack_status = 'PASS_WITH_OBS';
    } else {
      report.overall = 'PASS';
      report.ack_status = 'PASS_TO_PM';
    }
  }

  report.network_key_hit = inventOk === true;
  report.endedAt = new Date().toISOString();
  report.today = todayIso();
  save();
  console.log(
    JSON.stringify(
      {
        stamp: STAMP,
        ack_status: report.ack_status,
        overall: report.overall,
        network_key_hit: report.network_key_hit,
        out: OUT,
        residuals: report.residuals.map((r) => r.id),
        invent: `${inventPost.status} ${inventPost.code}`,
        admin: `${createA.status} ${createA.code} ${OPEN_CODE}`,
      },
      null,
      2,
    ),
  );
  process.exit(report.overall === 'FAIL' ? 1 : 0);
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
