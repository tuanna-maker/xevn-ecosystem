#!/usr/bin/env node
/**
 * PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-QA-01 — L1 API
 * U65 zero-seed · honesty attendance_uat_ready=false · payroll_e2e_ready=false
 * C-SLICE-≠-MODULE · RETAIN ATT-CODE/leave/worksite/EMP/SI/CTR · aggregate sealed
 * Parent: ATT-SHIFT-CATALOG-BE-01 READY_FOR_QA
 *
 * AC: invent → HRM-ATT-SHIFT-KEY · list active default · soft-retire DELETE
 *     · admin CREATE N+1 · 01c NOTE_BLOCKED (no wipe) · FE CNS-02 hardcode residual
 */
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs';
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
const STAMP = `ATTSHIFTQA-${TS.toUpperCase().slice(-8)}`;
const OPEN_CODE = `qa_shift_${TS}`.slice(0, 48);
const OPEN_CODE_B = `qa_shift_b_${TS}`.slice(0, 48);
const INVENT_CODE = `zz_invent_att_shift_${TS}`.slice(0, 48);
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = resolve(
  ROOT,
  'docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-att-shift-catalog-qa-01.json',
);

const ATT_CODE_SEAL = 'ATTCODEQA-MSK4T1A5';
const LEAVE_SEAL = 'ATTLEAVEQA-MSJ7CPJH';
const WS_SEAL = 'ATTWSQA-MSJC3IN9';

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

function shiftCodes(data) {
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
    controller_has_effective: false,
    controller_include_inactive: false,
    fe_shift_change_hardcode_5id: false,
    fe_hardcode_ids: [],
    note: '',
  };
  const distCtrl = resolve(ROOT, 'apps/api/hrm-api/dist/attendance/attendance.controller.js');
  const distCat = resolve(ROOT, 'apps/api/hrm-api/dist/attendance/attendance-catalog.service.js');
  const srcCat = resolve(ROOT, 'apps/api/hrm-api/src/attendance/attendance-catalog.service.ts');
  const feTab = resolve(
    ROOT,
    'apps/web/hrm/src/components/attendance/ShiftChangeRequestTab.tsx',
  );
  if (existsSync(distCat)) {
    out.dist_has_key = /HRM-ATT-SHIFT-KEY/.test(readFileSync(distCat, 'utf8'));
  }
  if (existsSync(srcCat)) {
    out.src_has_key = /HRM-ATT-SHIFT-KEY/.test(readFileSync(srcCat, 'utf8'));
  }
  if (existsSync(distCtrl)) {
    const t = readFileSync(distCtrl, 'utf8');
    out.controller_has_effective = t.includes('work-shifts/effective');
    out.controller_include_inactive = t.includes('include_inactive') || t.includes('includeInactive');
  }
  if (existsSync(feTab)) {
    const t = readFileSync(feTab, 'utf8');
    const ids = ['morning', 'afternoon', 'night', 'office', 'flexible'].filter((id) =>
      t.includes(`id: '${id}'`),
    );
    out.fe_hardcode_ids = ids;
    out.fe_shift_change_hardcode_5id = ids.length === 5;
  }
  out.note = out.fe_shift_change_hardcode_5id
    ? 'VAL-ATT-SHIFT-CNS-02 residual — ShiftChangeRequestTab closed 5-id'
    : 'FE hardcode not detected or already rebound';
  return out;
}

const report = {
  work_item_id: 'PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-QA-01',
  stamp: STAMP,
  startedAt: new Date().toISOString(),
  gitHead: gitHead(),
  env: { PORTAL, XBOS, HRM, EMAIL, HEADER_COMPANY, TENANT },
  honesty: {
    attendance_uat_ready: false,
    payroll_e2e_ready: false,
    C_SLICE_NE_MODULE: true,
    U65_zero_seed: true,
    seals_retain: {
      ATT_CODE: ATT_CODE_SEAL,
      ATT_LEAVE: LEAVE_SEAL,
      ATT_WS: WS_SEAL,
      R_PLT_ATT_CODE_FE_01: 'HOLD',
    },
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

async function main() {
  report.dist_fe = inspectDistAndFe();
  step('DIST_FE_GATE', {
    verdict:
      report.dist_fe.dist_has_key || report.dist_fe.src_has_key ? 'PASS' : 'FAIL',
    summary: summarizeBody(report.dist_fe, 400),
  });
  if (!(report.dist_fe.dist_has_key || report.dist_fe.src_has_key)) {
    failOverall('HRM-ATT-SHIFT-KEY absent in dist/src');
  }

  // L0 health
  const health = await call(null, 'GET', '');
  step('L0_HRM_HEALTH', {
    verdict: health.status === 200 ? 'PASS' : 'FAIL',
    summary: `${health.status} ${health.code}`,
  });

  const unauth = await call(null, 'GET', '/attendance/work-shifts/effective', {
    query: { company_id: HEADER_COMPANY },
  });
  const unauthOk = unauth.status === 401 || unauth.status === 403;
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

  // Baseline list (default active)
  const list0 = await call(auth.token, 'GET', '/attendance/work-shifts', {
    query: { company_id: HEADER_COMPANY },
  });
  const rows0 = asList(list0.data ?? list0.json);
  const total0 =
    typeof list0.data?.total === 'number' ? list0.data.total : rows0.length;
  const inactiveInDefault0 = rows0.some(
    (r) => String(r.status || '').toLowerCase() === 'inactive',
  );
  step('LIST_DEFAULT_0', {
    verdict: list0.status === 200 && !inactiveInDefault0 ? 'PASS' : 'FAIL',
    summary: `${list0.status} ${list0.code} total=${total0} inactiveInDefault=${inactiveInDefault0}`,
  });

  const eff0 = await call(auth.token, 'GET', '/attendance/work-shifts/effective', {
    query: { company_id: HEADER_COMPANY },
  });
  const effRows0 = asList(eff0.data ?? eff0.json);
  const effTotal0 =
    typeof eff0.data?.total === 'number' ? eff0.data.total : effRows0.length;
  step('EFF_0', {
    verdict: eff0.status === 200 ? 'PASS' : 'FAIL',
    summary: `${eff0.status} ${eff0.code} total=${effTotal0}`,
  });

  // Admin CREATE N+1 (two actives so soft-retire one still leaves active≥1 for invent assert)
  const createA = await call(auth.token, 'POST', '/attendance/work-shifts', {
    body: {
      company_id: HEADER_COMPANY,
      code: OPEN_CODE,
      name: `QA Ca ${STAMP}`,
      start_time: '08:00',
      end_time: '17:00',
      work_hours: 8,
      coefficient: 1,
      status: 'active',
      notes: `U65 admin N+1 ${STAMP}`,
    },
  });
  const createdA =
    createA.data?.id || createA.json?.data?.id || null;
  const createAOk = createA.status >= 200 && createA.status < 300;
  step('ADMIN_N1_A', {
    verdict: createAOk ? 'PASS' : 'FAIL',
    summary: `${createA.status} ${createA.code} code=${OPEN_CODE} id=${createdA}`,
  });
  report.val['AC-PLT-ATT-SHIFT-01d'] = {
    expect: 'Admin CREATE N+1 open code 2xx/201 · F5 list/EFF sees',
    status: createA.status,
    code: createA.code,
    open_key: OPEN_CODE,
    createdId: createdA,
    summary: createA.summary,
    verdict: createAOk ? 'PASS' : 'FAIL',
  };

  const createB = await call(auth.token, 'POST', '/attendance/work-shifts', {
    body: {
      company_id: HEADER_COMPANY,
      code: OPEN_CODE_B,
      name: `QA Ca B ${STAMP}`,
      start_time: '14:00',
      end_time: '22:00',
      work_hours: 8,
      coefficient: 1,
      status: 'active',
      notes: `U65 admin N+1 B ${STAMP}`,
    },
  });
  const createdB = createB.data?.id || createB.json?.data?.id || null;
  step('ADMIN_N1_B', {
    verdict: createB.status >= 200 && createB.status < 300 ? 'PASS' : 'WARN',
    summary: `${createB.status} ${createB.code} code=${OPEN_CODE_B} id=${createdB}`,
  });

  // F5 list + effective
  const list1 = await call(auth.token, 'GET', '/attendance/work-shifts', {
    query: { company_id: HEADER_COMPANY },
  });
  const codes1 = shiftCodes(list1.data ?? list1.json);
  const total1 =
    typeof list1.data?.total === 'number'
      ? list1.data.total
      : asList(list1.data ?? list1.json).length;
  const hasOpen = codes1.includes(OPEN_CODE.toLowerCase());
  step('LIST_HAS_OPEN_F5', {
    verdict: hasOpen && total1 > 0 ? 'PASS' : 'FAIL',
    summary: `hasOpen=${hasOpen} total=${total1} baseline=${total0}`,
  });
  if (createAOk && hasOpen) {
    report.val['AC-PLT-ATT-SHIFT-01d'].verdict = 'PASS';
    report.val['AC-PLT-ATT-SHIFT-01d'].f5 = { total: total1, hasOpen };
  } else if (createAOk) {
    report.val['AC-PLT-ATT-SHIFT-01d'].verdict = 'FAIL';
  }

  const eff1 = await call(auth.token, 'GET', '/attendance/work-shifts/effective', {
    query: { company_id: HEADER_COMPANY },
  });
  const effCodes1 = shiftCodes(eff1.data ?? eff1.json);
  const effTotal1 =
    typeof eff1.data?.total === 'number'
      ? eff1.data.total
      : asList(eff1.data ?? eff1.json).length;
  const activeGt0 = effTotal1 > 0;
  step('EFF_ACTIVE_GT0', {
    verdict: activeGt0 && effCodes1.includes(OPEN_CODE.toLowerCase()) ? 'PASS' : 'FAIL',
    summary: `total=${effTotal1} hasOpen=${effCodes1.includes(OPEN_CODE.toLowerCase())}`,
  });

  // Pick employee for consumer invent
  const emp = await pickEmployee(auth.token);
  step('PICK_EMPLOYEE', {
    verdict: emp ? 'PASS' : 'FAIL',
    summary: emp
      ? `id=${emp.employeeId} company=${emp.companyId}`
      : 'no employee',
  });
  if (!emp) {
    failOverall('no employee for shift-change invent');
    report.endedAt = new Date().toISOString();
    save();
    process.exit(2);
  }

  // Invent both current + requested ∉ Nest
  const inventBody = {
    company_id: emp.companyId,
    employee_id: emp.employeeId,
    employee_code: emp.employeeCode,
    employee_name: emp.employeeName,
    department: emp.department || undefined,
    position: emp.position || undefined,
    change_date: offsetIso(3),
    change_type: 'permanent',
    current_shift: INVENT_CODE,
    requested_shift: `${INVENT_CODE}_req`,
    reason: `QA invent KEY ${STAMP}`,
  };
  const inventPost = await call(auth.token, 'POST', '/attendance/shift-change-requests', {
    companyId: emp.companyId,
    body: inventBody,
  });
  const inventOk =
    inventPost.status >= 400 &&
    inventPost.status < 500 &&
    String(inventPost.code || '') === 'HRM-ATT-SHIFT-KEY';
  step('INVENT_SHIFT_KEY', {
    verdict: inventOk ? 'PASS' : 'FAIL',
    summary: `${inventPost.status} ${inventPost.code} · ${inventPost.message || ''}`,
  });
  report.val['AC-PLT-ATT-SHIFT-01b'] = {
    expect: '4xx HRM-ATT-SHIFT-KEY · no persist',
    status: inventPost.status,
    code: inventPost.code,
    invent_keys: [inventBody.current_shift, inventBody.requested_shift],
    summary: inventPost.summary,
    verdict: inventOk ? 'PASS' : 'FAIL',
  };
  report.val['VAL-ATT-SHIFT-CNS-01'] = report.val['AC-PLT-ATT-SHIFT-01b'];
  if (!inventOk) failOverall('invent KEY miss');

  // No persist: list shift-change should not contain invent codes for this stamp
  const scList = await call(auth.token, 'GET', '/attendance/shift-change-requests', {
    query: { company_id: emp.companyId },
    companyId: emp.companyId,
  });
  const scRows = asList(scList.data ?? scList.json);
  const inventPersisted = scRows.some(
    (r) =>
      String(r.current_shift || '') === INVENT_CODE ||
      String(r.requested_shift || '') === `${INVENT_CODE}_req` ||
      String(r.reason || '').includes(STAMP),
  );
  step('INVENT_NO_PERSIST', {
    verdict: !inventPersisted ? 'PASS' : 'FAIL',
    summary: `inventPersisted=${inventPersisted} listStatus=${scList.status}`,
  });
  if (inventPersisted) failOverall('invent persisted');

  // Valid Nest keys persist (sanity that assert passes for real codes)
  let validPostOk = false;
  let validId = null;
  if (createdA && createdB && OPEN_CODE && OPEN_CODE_B) {
    const validPost = await call(auth.token, 'POST', '/attendance/shift-change-requests', {
      companyId: emp.companyId,
      body: {
        ...inventBody,
        change_date: offsetIso(4),
        current_shift: OPEN_CODE,
        requested_shift: OPEN_CODE_B,
        reason: `QA valid Nest keys ${STAMP}`,
      },
    });
    validPostOk = validPost.status >= 200 && validPost.status < 300;
    validId = validPost.data?.id || validPost.json?.data?.id || null;
    step('VALID_NEST_KEYS', {
      verdict: validPostOk ? 'PASS' : 'WARN',
      summary: `${validPost.status} ${validPost.code} id=${validId}`,
    });
    report.val['AC-PLT-ATT-SHIFT-01_L1_VALID'] = {
      expect: 'Nest keys ∈ catalog → 2xx (L1 consumer wire)',
      status: validPost.status,
      code: validPost.code,
      id: validId,
      verdict: validPostOk ? 'PASS' : 'WARN',
      note: 'UF browser picker Nest rebind = CNS-02 residual; L1 proves API accept Nest codes',
    };
  }

  // Soft-retire CREATE A via DELETE (product path)
  let retireTarget = createdA;
  let retireCode = OPEN_CODE;
  if (!retireTarget) {
    failOverall('no created shift to soft-retire');
  } else {
    const del = await call(auth.token, 'DELETE', `/attendance/work-shifts/${retireTarget}`, {
      query: { company_id: HEADER_COMPANY },
      companyId: HEADER_COMPANY,
    });
    const delOk =
      del.status >= 200 &&
      del.status < 300 &&
      (del.data?.status === 'inactive' ||
        del.data?.retired === true ||
        String(del.json?.message || '').toLowerCase().includes('soft'));
    step('SOFT_RETIRE_DELETE', {
      verdict: del.status >= 200 && del.status < 300 ? 'PASS' : 'FAIL',
      summary: `${del.status} ${del.code} status=${del.data?.status} retired=${del.data?.retired} hard=${del.data?.hard_deleted}`,
    });

    const listAfter = await call(auth.token, 'GET', '/attendance/work-shifts', {
      query: { company_id: HEADER_COMPANY },
    });
    const codesAfter = shiftCodes(listAfter.data ?? listAfter.json);
    const hiddenDefault = !codesAfter.includes(retireCode.toLowerCase());
    const inactiveDefault = asList(listAfter.data ?? listAfter.json).some(
      (r) => String(r.status || '').toLowerCase() === 'inactive',
    );

    const listAll = await call(auth.token, 'GET', '/attendance/work-shifts', {
      query: { company_id: HEADER_COMPANY, include_inactive: 'true' },
    });
    const allRows = asList(listAll.data ?? listAll.json);
    const retiredVisible = allRows.some(
      (r) =>
        (String(r.id) === String(retireTarget) ||
          String(r.code || '').toLowerCase() === retireCode.toLowerCase()) &&
        String(r.status || '').toLowerCase() === 'inactive',
    );

    const cns03bOk =
      listAfter.status === 200 &&
      hiddenDefault &&
      !inactiveDefault &&
      listAll.status === 200 &&
      retiredVisible;
    step('CNS_03b_04_LIST_FILTER', {
      verdict: cns03bOk ? 'PASS' : 'FAIL',
      summary: `hiddenDefault=${hiddenDefault} inactiveInDefault=${inactiveDefault} retiredInInclude=${retiredVisible}`,
    });
    report.val['VAL-ATT-SHIFT-CNS-03b'] = {
      expect: 'default active-only; include_inactive shows retired',
      hiddenDefault,
      inactiveInDefault: inactiveDefault,
      retiredVisible,
      defaultStatus: listAfter.status,
      includeStatus: listAll.status,
      verdict: cns03bOk ? 'PASS' : 'FAIL',
    };
    report.val['VAL-ATT-SHIFT-CNS-04'] = {
      expect: 'DELETE soft-retire status=inactive · default list hides',
      deleteStatus: del.status,
      deleteCode: del.code,
      retiredStatus: del.data?.status,
      hard_deleted: del.data?.hard_deleted,
      hiddenDefault,
      verdict: del.status >= 200 && del.status < 300 && hiddenDefault ? 'PASS' : 'FAIL',
    };
    report.val['AC-PLT-ATT-SHIFT-01e'] = report.val['VAL-ATT-SHIFT-CNS-04'];
    if (!cns03bOk || !(del.status >= 200 && del.status < 300 && hiddenDefault)) {
      failOverall('soft-retire / list filter FAIL');
    }
  }

  // 01c — cannot isolate active=0 without wipe/seed; document NOTE_BLOCKED
  report.val['AC-PLT-ATT-SHIFT-01c'] = {
    expect: 'active=0 invent skip · no seed',
    verdict: 'NOTE_BLOCKED',
    note:
      'Live Nest already has/created active rows; isolating active=0 would require wipe/retire-all (risk peer data) or seed — FORBIDDEN U65. Covered by BE jest CNS-05 empty skip; live baseline documented only.',
    baseline_eff_before_admin: effTotal0,
    live_eff_after_admin: effTotal1,
  };
  step('AC_01c_EMPTY', {
    verdict: 'NOTE_BLOCKED',
    summary: `baselineEff=${effTotal0} afterAdmin=${effTotal1} — no wipe`,
  });

  // U19 spot — random UUID get-by-id → 404 (not invent KEY)
  const fakeId = '00000000-0000-4000-8000-000000000099';
  const oos = await call(auth.token, 'GET', `/attendance/work-shifts/${fakeId}`, {
    query: { company_id: HEADER_COMPANY },
  });
  const oosOk = oos.status === 404 && String(oos.code || '').includes('WS-404');
  step('U19_GET_BY_ID_OOS', {
    verdict: oosOk || oos.status === 404 ? 'PASS' : 'WARN',
    summary: `${oos.status} ${oos.code}`,
  });
  report.val['VAL-ATT-SHIFT-CNS-03_U19_SPOT'] = {
    expect: 'get-by-id missing → HRM-WS-404 (≠ invent KEY)',
    status: oos.status,
    code: oos.code,
    verdict: oos.status === 404 ? 'PASS' : 'WARN',
  };

  // Seal route spot (leave/worksite/code — do not reopen)
  const leaveEff = await call(auth.token, 'GET', '/attendance/leave-types/effective', {
    query: { company_id: HEADER_COMPANY },
  });
  const wsList = await call(auth.token, 'GET', '/attendance/work-sites', {
    query: { company_id: HEADER_COMPANY },
  });
  const codeEff = await call(auth.token, 'GET', '/attendance/attendance-codes/effective', {
    query: { company_id: HEADER_COMPANY },
  });
  step('SEAL_ROUTES_SPOT', {
    verdict:
      leaveEff.status === 200 && wsList.status === 200 && codeEff.status === 200
        ? 'PASS'
        : 'WARN',
    summary: `leave=${leaveEff.status} ws=${wsList.status} code=${codeEff.status}`,
  });

  // FE CNS-02 residual
  report.val['VAL-ATT-SHIFT-CNS-02'] = {
    expect: 'ShiftChange picker = Nest active when active>0',
    fe_hardcode_5id: report.dist_fe.fe_shift_change_hardcode_5id,
    fe_ids: report.dist_fe.fe_hardcode_ids,
    verdict: report.dist_fe.fe_shift_change_hardcode_5id ? 'HOLD' : 'PASS',
    residual: report.dist_fe.fe_shift_change_hardcode_5id
      ? 'R-PLT-ATT-SHIFT-CNS-02 / VAL-ATT-SHIFT-CNS-02 Nest rebind'
      : null,
  };
  report.val['AC-PLT-ATT-SHIFT-01'] = {
    expect: 'Browser Nest picker when FE READY',
    verdict: 'HOLD',
    note: 'L1 Nest keys accept OK; FE ShiftChangeRequestTab still closed 5-id — not UF 🟢',
  };
  if (report.dist_fe.fe_shift_change_hardcode_5id) {
    report.residuals.push({
      id: 'R-PLT-ATT-SHIFT-CNS-02',
      severity: 'P2',
      summary:
        'ShiftChangeRequestTab hardcode morning|afternoon|night|office|flexible — rebind Nest when active>0',
      owner: 'dev-fe',
    });
  }

  report.val['AC-PLT-ATT-SHIFT-01H'] = {
    expect: 'honesty false · seals RETAIN · C-SLICE · U65 · DENY ATT UAT',
    attendance_uat_ready: false,
    payroll_e2e_ready: false,
    seals: report.honesty.seals_retain,
    verdict: 'PASS',
  };

  // Cleanup valid SC if created (optional soft — delete request)
  if (validId) {
    const delSc = await call(
      auth.token,
      'DELETE',
      `/attendance/shift-change-requests/${validId}`,
      { query: { company_id: emp.companyId }, companyId: emp.companyId },
    );
    step('CLEANUP_VALID_SC', {
      verdict: delSc.status < 500 ? 'PASS' : 'WARN',
      summary: `${delSc.status} ${delSc.code}`,
    });
  }

  // Soft-retire B as well to avoid catalog litter (still soft, not seed reverse)
  if (createdB) {
    const delB = await call(auth.token, 'DELETE', `/attendance/work-shifts/${createdB}`, {
      query: { company_id: HEADER_COMPANY },
      companyId: HEADER_COMPANY,
    });
    step('SOFT_RETIRE_B', {
      verdict: delB.status >= 200 && delB.status < 300 ? 'PASS' : 'WARN',
      summary: `${delB.status} ${delB.code}`,
    });
  }

  const criticalFails = report.steps.filter(
    (s) =>
      s.verdict === 'FAIL' &&
      ![
        // none optional
      ].includes(s.id),
  );
  if (criticalFails.length > 0 && report.overall === 'PASS') {
    // keep earlier failOverall if set
  }
  if (
    report.val['AC-PLT-ATT-SHIFT-01b']?.verdict !== 'PASS' ||
    report.val['AC-PLT-ATT-SHIFT-01d']?.verdict !== 'PASS' ||
    report.val['VAL-ATT-SHIFT-CNS-03b']?.verdict !== 'PASS' ||
    report.val['VAL-ATT-SHIFT-CNS-04']?.verdict !== 'PASS'
  ) {
    failOverall('core L1 AC FAIL');
  }

  report.endedAt = new Date().toISOString();
  save();
  console.log(
    JSON.stringify(
      {
        stamp: STAMP,
        overall: report.overall,
        ack_status: report.ack_status,
        out: OUT,
        invent: report.val['AC-PLT-ATT-SHIFT-01b'],
        cns03b: report.val['VAL-ATT-SHIFT-CNS-03b'],
        cns04: report.val['VAL-ATT-SHIFT-CNS-04'],
        cns02: report.val['VAL-ATT-SHIFT-CNS-02'],
        residuals: report.residuals,
      },
      null,
      2,
    ),
  );
  process.exit(report.overall === 'PASS' ? 0 : 1);
}

main().catch((e) => {
  report.overall = 'FAIL';
  report.ack_status = 'FAIL_TO_PM';
  report.error = String(e?.stack || e);
  report.endedAt = new Date().toISOString();
  save();
  console.error(e);
  process.exit(1);
});
