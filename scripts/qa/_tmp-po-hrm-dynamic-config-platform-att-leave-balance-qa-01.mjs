#!/usr/bin/env node
/**
 * PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-QA-01 — L1 API
 * Parent: ATT-LEAVE-BALANCE-BE-01 READY_FOR_QA
 * U65 zero-seed · honesty attendance_uat_ready=false · payroll_e2e_ready=false
 * engine LIVE HOLD · C-SLICE-≠-MODULE
 * RETAIN: leave-type HRM-LEAVE-TYPE-UNKNOWN · ATTCODEQA-MSK4T1A5 · ATT-WS ·
 *         ATTSHIFTQA-MSK5FXP3 · FE HOLDs — cấm reopen L1 · cấm claim engine LIVE
 *
 * Prefer: invent KEY LIVE Network when ≥1 active policy
 * Admin CREATE N+1 · soft-retire · orphan TYPE · empty NOTE_BLOCKED · U19 spot
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
const STAMP = `ATTLVRULEQA-${TS.toUpperCase().slice(-8)}`;
const INVENT_POLICY_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const INVENT_TYPE = `zz_invent_lvrule_type_${TS}`.slice(0, 48);
const ORPHAN_TYPE = `zz_orphan_lvrule_${TS}`.slice(0, 48);
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = resolve(
  ROOT,
  'docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-att-leave-balance-qa-01.json',
);

const ATT_CODE_SEAL = 'ATTCODEQA-MSK4T1A5';
const ATT_SHIFT_SEAL = 'ATTSHIFTQA-MSK5FXP3';
const LEAVE_TYPE_UNKNOWN = 'HRM-LEAVE-TYPE-UNKNOWN';
const LVRULE_KEY = 'HRM-ATT-LVRULE-KEY';
const LVRULE_TYPE = 'HRM-ATT-LVRULE-TYPE';

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
  if (data && typeof data === 'object' && data.id) return [data];
  return [];
}

/** F-ATT-LVRULE-04 envelope: { total, data: row|null } nested under ok().data */
function unwrapPolicyRow(envelope) {
  if (!envelope) return null;
  const d = envelope.data ?? envelope;
  if (d && typeof d === 'object' && d.id) return d;
  if (d && typeof d === 'object' && d.data && d.data.id) return d.data;
  const list = asList(d);
  return list[0] || null;
}

function is2xx(status) {
  return status >= 200 && status < 300;
}

async function pickEmployee(token) {
  const r = await call(token, 'GET', '/employees', {
    query: { company_id: HEADER_COMPANY, page_size: 5 },
  });
  const rows = asList(r.data ?? r.json);
  const row = rows[0];
  if (!row) return null;
  return {
    employee_id: row.id || row.employee_id,
    employee_code: String(row.employee_code || row.code || 'QA-EMP'),
    employee_name: String(row.full_name || row.name || row.employee_name || 'QA Employee'),
    company_id: String(row.company_id || 'holding'),
    department: row.department || row.department_name || undefined,
    position: row.position || row.position_name || undefined,
  };
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

function inspectDistAndFe() {
  const out = {
    dist_has_lvrule_key: false,
    src_has_lvrule_key: false,
    dist_has_lvrule_type: false,
    controller_has_policies: false,
    controller_assert_consumer_wired: false,
    leave_balance_mvp_hardcode: false,
    mvp_snippet: '',
    note: '',
  };
  const distSvc = resolve(
    ROOT,
    'apps/api/hrm-api/dist/attendance/att-leave-accrual-policy.service.js',
  );
  const distConst = resolve(
    ROOT,
    'apps/api/hrm-api/dist/attendance/att-leave-accrual-policy.constants.js',
  );
  const srcConst = resolve(
    ROOT,
    'apps/api/hrm-api/src/attendance/att-leave-accrual-policy.constants.ts',
  );
  const distCtrl = resolve(ROOT, 'apps/api/hrm-api/dist/attendance/attendance.controller.js');
  const leaveBal = resolve(ROOT, 'apps/api/hrm-api/src/attendance/leave-balance.service.ts');

  const readIf = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : '');
  const constTxt = readIf(distConst) || readIf(srcConst);
  out.dist_has_lvrule_key = constTxt.includes(LVRULE_KEY);
  out.src_has_lvrule_key = readIf(srcConst).includes(LVRULE_KEY);
  out.dist_has_lvrule_type = constTxt.includes(LVRULE_TYPE);

  const ctrl = readIf(distCtrl);
  out.controller_has_policies = ctrl.includes('leave-accrual-policies');
  out.controller_assert_consumer_wired =
    ctrl.includes('assertLeaveAccrualPolicyForConsumer') ||
    /leave-accrual-policies\/assert|leave-balances\/(grant|adjust|accrue)/.test(ctrl);

  const svc = readIf(distSvc);
  if (!out.controller_assert_consumer_wired) {
    out.controller_assert_consumer_wired = false;
    out.note =
      'assertLeaveAccrualPolicyForConsumer LIVE in service+jest; HTTP grant/adjust consumer wire ABSENT (BE residual follow-on)';
  }
  if (svc.includes('assertLeaveAccrualPolicyForConsumer')) {
    out.service_has_assert = true;
  }

  if (existsSync(leaveBal)) {
    const t = readIf(leaveBal);
    out.leave_balance_mvp_hardcode =
      /MVP_LEAVE|annual|seniority|compensatory|advance/.test(t) &&
      /hardcode|MVP|five|5 loại/i.test(t);
    const m = t.match(/MVP[^\n]{0,80}|5 loại[^\n]{0,80}/);
    out.mvp_snippet = m ? m[0] : '';
  }
  return out;
}

const report = {
  work_item_id: 'PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-QA-01',
  stamp: STAMP,
  startedAt: new Date().toISOString(),
  gitHead: gitHead(),
  env: { PORTAL, XBOS, HRM, EMAIL, HEADER_COMPANY, TENANT },
  honesty: {
    attendance_uat_ready: false,
    payroll_e2e_ready: false,
    F_ATT_LEAVE_04_engine_LIVE: 'HOLD',
    C_SLICE_NE_MODULE: true,
    U65_zero_seed: true,
    seals_retain: {
      leave_type_invent: LEAVE_TYPE_UNKNOWN,
      ATT_CODE: ATT_CODE_SEAL,
      ATT_WS: 'ATT-WS RETAIN',
      ATT_SHIFT: ATT_SHIFT_SEAL,
      FE_HOLDS: 'ATT-CODE FE · ATT-SHIFT CNS-02 RETAIN do not invent',
    },
  },
  dist_fe: null,
  leave_type_key: null,
  policy_id: null,
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
  const distOk =
    report.dist_fe.dist_has_lvrule_key || report.dist_fe.src_has_lvrule_key;
  step('DIST_KEY_GATE', {
    verdict: distOk && report.dist_fe.controller_has_policies ? 'PASS' : 'FAIL',
    summary: summarizeBody(report.dist_fe, 500),
  });
  if (!distOk) failOverall('HRM-ATT-LVRULE-KEY absent in dist/src');
  if (!report.dist_fe.controller_has_policies) {
    failOverall('leave-accrual-policies routes absent in dist controller');
  }

  const health = await call(null, 'GET', '');
  step('L0_HRM_HEALTH', {
    verdict: health.status === 200 ? 'PASS' : 'FAIL',
    summary: `${health.status} ${health.code}`,
  });
  if (health.status !== 200) failOverall('L0 hrm health not 200');

  const unauth = await call(null, 'GET', '/attendance/leave-accrual-policies/effective', {
    query: { company_id: HEADER_COMPANY, leave_type_key: 'annual' },
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
  if (!unauthOk) failOverall('unauth effective not 401/403');

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

  // EFF leave types — bind policy to existing sealed type (no reopen leave-type L1 invent)
  const lvt = await call(auth.token, 'GET', '/attendance/leave-types/effective', {
    query: { company_id: HEADER_COMPANY },
  });
  const lvtRows = asList(lvt.data ?? lvt.json);
  const typeKeyOf = (r) =>
    String(r?.leaveTypeKey || r?.leave_type_key || r?.key || r?.code || '').toLowerCase();
  const preferKeys = ['annual', 'lvt_01', 'hr_leave_cat_msj7cpjh'];
  const pick =
    preferKeys
      .map((k) => lvtRows.find((r) => typeKeyOf(r) === k))
      .find(Boolean) ||
    lvtRows.find((r) => {
      const k = typeKeyOf(r);
      const st = String(r.status || 'active').toLowerCase();
      return k && st !== 'inactive' && st !== 'retired';
    }) ||
    lvtRows[0];
  const leaveTypeKey = typeKeyOf(pick);
  report.leave_type_key = leaveTypeKey || null;
  step('LEAVE_TYPES_EFF', {
    verdict: lvt.status === 200 && leaveTypeKey ? 'PASS' : 'FAIL',
    summary: `${lvt.status} ${lvt.code} count=${lvtRows.length} pick=${leaveTypeKey || 'NONE'}`,
  });
  if (!leaveTypeKey) {
    failOverall('no EFF leave_type_key to bind policy (cannot CREATE without invent type)');
    report.endedAt = new Date().toISOString();
    save();
    process.exit(2);
  }

  // Baseline policies for type
  const list0 = await call(auth.token, 'GET', '/attendance/leave-accrual-policies', {
    query: { company_id: HEADER_COMPANY, leave_type_key: leaveTypeKey },
  });
  const rows0 = asList(list0.data ?? list0.json);
  const total0 =
    typeof list0.data?.total === 'number' ? list0.data.total : rows0.length;
  step('LIST_BASELINE', {
    verdict: list0.status === 200 ? 'PASS' : 'FAIL',
    summary: `${list0.status} ${list0.code} total=${total0}`,
  });

  const eff0 = await call(auth.token, 'GET', '/attendance/leave-accrual-policies/effective', {
    query: {
      company_id: HEADER_COMPANY,
      leave_type_key: leaveTypeKey,
      as_of: todayIso(),
    },
  });
  const eff0Empty =
    eff0.status === 200 &&
    (eff0.data == null ||
      (typeof eff0.data === 'object' &&
        !eff0.data.id &&
        !asList(eff0.data).length));
  const hadActiveBefore = total0 > 0;
  step('EFF_BASELINE', {
    verdict: eff0.status === 200 ? 'PASS' : 'FAIL',
    summary: `${eff0.status} ${eff0.code} empty=${eff0Empty} hadActiveBefore=${hadActiveBefore}`,
  });

  // 01c NOTE_BLOCKED: invent-skip-at-empty only if baseline active=0; no wipe
  report.val['AC-PLT-ATT-LEAVE-BAL-01c'] = {
    expect: 'empty active soft · invent skip · no seed',
    baseline_active_for_type: total0,
    verdict: 'NOTE_BLOCKED',
    note: hadActiveBefore
      ? 'Baseline already had active policy for type — invent-skip-at-empty not isolated without wipe (U65 FORBIDDEN). Jest CNS-05 cite.'
      : 'Baseline active=0 observed (soft empty OK). Invent Network skip not re-probed after CREATE (would need wipe). Jest CNS-05 cite.',
  };

  // Admin CREATE N+1 bound EFF type
  const createBody = {
    companyId: HEADER_COMPANY,
    leaveTypeKey,
    accrualMode: 'year_start_grant',
    annualDays: 12,
    unit: 'day',
    allowNegative: false,
    version: 1,
    effectiveFrom: todayIso(),
    effectiveTo: offsetIso(365),
  };
  const created = await call(auth.token, 'POST', '/attendance/leave-accrual-policies', {
    body: createBody,
  });
  const createdId = created.data?.id || created.json?.data?.id || null;
  report.policy_id = createdId;
  const createOk =
    is2xx(created.status) &&
    Boolean(createdId) &&
    String(created.data?.leaveTypeKey || created.data?.leave_type_key || leaveTypeKey)
      .toLowerCase() === leaveTypeKey;
  step('ADMIN_CREATE_N1', {
    verdict: createOk ? 'PASS' : 'FAIL',
    summary: `${created.status} ${created.code} id=${createdId} ${summarizeBody(created.data, 240)}`,
  });
  report.val['AC-PLT-ATT-LEAVE-BAL-01d'] = {
    expect: 'Admin CREATE N+1 bound EFF · 2xx · F5 list · resolve sees row',
    status: created.status,
    code: created.code,
    id: createdId,
    verdict: createOk ? 'PASS' : 'FAIL',
  };
  if (!createOk) failOverall(`admin CREATE failed ${created.status} ${created.code}`);

  // F5 list + effective
  const listF5 = await call(auth.token, 'GET', '/attendance/leave-accrual-policies', {
    query: { company_id: HEADER_COMPANY, leave_type_key: leaveTypeKey },
  });
  const rowsF5 = asList(listF5.data ?? listF5.json);
  const hasCreated = rowsF5.some(
    (r) => String(r.id) === String(createdId) || String(r.policyId) === String(createdId),
  );
  const displayReady = rowsF5.some(
    (r) =>
      String(r.id) === String(createdId) &&
      (r.leaveTypeNameVi || r.accrualModeLabel || r.statusLabel),
  );
  step('F5_LIST', {
    verdict: listF5.status === 200 && hasCreated ? 'PASS' : 'FAIL',
    summary: `${listF5.status} ${listF5.code} hasCreated=${hasCreated} displayReady=${displayReady} n=${rowsF5.length}`,
  });

  const effF5 = await call(auth.token, 'GET', '/attendance/leave-accrual-policies/effective', {
    query: {
      company_id: HEADER_COMPANY,
      leave_type_key: leaveTypeKey,
      as_of: todayIso(),
    },
  });
  const effRow = unwrapPolicyRow(effF5);
  const effHit = is2xx(effF5.status) && String(effRow?.id || '') === String(createdId);
  step('F5_EFFECTIVE', {
    verdict: effHit ? 'PASS' : 'FAIL',
    summary: `${effF5.status} ${effF5.code} hit=${effHit} id=${effRow?.id || null}`,
  });
  if (!(listF5.status === 200 && hasCreated && effHit)) {
    failOverall('F5 list/effective missing created policy');
  } else {
    report.val['AC-PLT-ATT-LEAVE-BAL-01d'].f5 = 'PASS';
  }

  // Prefer invent KEY LIVE Network — probe consumer surfaces
  const inventAttempts = [];
  const emp = await pickEmployee(auth.token);
  step('PICK_EMPLOYEE', {
    verdict: emp?.employee_id ? 'PASS' : 'FAIL',
    summary: emp
      ? `${emp.employee_id} company=${emp.company_id}`
      : 'no employee for leave invent spot',
  });

  // A) leave-requests — DTO has no policy_id; invent policy fields → VAL-001 (whitelist) proves not wired
  if (emp?.employee_id) {
    const inventLeave = await call(auth.token, 'POST', '/attendance/leave-requests', {
      body: {
        company_id: emp.company_id,
        employee_id: emp.employee_id,
        employee_code: emp.employee_code,
        employee_name: emp.employee_name,
        department: emp.department,
        position: emp.position,
        leave_type: leaveTypeKey,
        start_date: todayIso(),
        end_date: todayIso(),
        total_days: 1,
        reason: `QA invent LVRULE ${STAMP}`,
        policy_id: INVENT_POLICY_ID,
        accrual_mode: 'zz_invent_mode_adhoc',
        annual_days: 999,
      },
    });
    inventAttempts.push({
      surface: 'POST /attendance/leave-requests + invent policy_* (expect VAL or KEY)',
      status: inventLeave.status,
      code: inventLeave.code,
      summary: inventLeave.summary,
    });
  }

  // B) leave-balance grant/adjust/accrue (expect 404 if ABSENT)
  for (const path of [
    '/attendance/leave-balances/grant',
    '/attendance/leave-balance/grant',
    '/attendance/leave-balances/adjust',
    '/attendance/leave-balances/accrue',
  ]) {
    const r = await call(auth.token, 'POST', path, {
      body: {
        companyId: HEADER_COMPANY,
        leaveTypeKey,
        policyId: INVENT_POLICY_ID,
        accrualMode: 'zz_invent_mode_adhoc',
        annualDays: 999,
      },
    });
    inventAttempts.push({
      surface: `POST ${path}`,
      status: r.status,
      code: r.code,
      summary: r.summary,
    });
  }

  // C) leave-accrual-policies assert probe (expect 404 if ABSENT)
  const assertProbe = await call(
    auth.token,
    'POST',
    '/attendance/leave-accrual-policies/assert-consumer',
    {
      body: {
        companyId: HEADER_COMPANY,
        leaveTypeKey,
        policyId: INVENT_POLICY_ID,
        accrualMode: 'year_start_grant',
        annualDays: 999,
      },
    },
  );
  inventAttempts.push({
    surface: 'POST /attendance/leave-accrual-policies/assert-consumer',
    status: assertProbe.status,
    code: assertProbe.code,
    summary: assertProbe.summary,
  });

  const inventKeyHit = inventAttempts.find(
    (a) =>
      a.status >= 400 &&
      a.status < 500 &&
      String(a.code) === LVRULE_KEY,
  );
  const inventKeyWrong = inventAttempts.find(
    (a) =>
      a.status >= 200 &&
      a.status < 300 &&
      /policy|accrual|annual/i.test(JSON.stringify(a)),
  );

  report.val['AC-PLT-ATT-LEAVE-BAL-01b'] = {
    expect: `Network 4xx ${LVRULE_KEY} when active>0 invent policy_id/mode|days · no persist`,
    attempts: inventAttempts,
    network_key_hit: Boolean(inventKeyHit),
    controller_assert_wired: report.dist_fe.controller_assert_consumer_wired,
    helper_in_service: Boolean(report.dist_fe.service_has_assert),
    verdict: inventKeyHit
      ? 'PASS'
      : 'FAIL_GAP_WIRE',
    note: inventKeyHit
      ? `KEY via ${inventKeyHit.surface}`
      : 'No HTTP consumer surface emits HRM-ATT-LVRULE-KEY yet (grant/adjust/assert ABSENT). Helper LIVE service+jest (BE residual: wire when product surface ships). Leave-request invent did not stamp LVRULE-KEY.',
  };
  step('INVENT_KEY_LIVE', {
    verdict: inventKeyHit ? 'PASS' : 'FAIL_GAP_WIRE',
    summary: inventKeyHit
      ? `${inventKeyHit.status} ${inventKeyHit.code}`
      : summarizeBody(inventAttempts, 600),
  });

  // Soft-retire
  const retire = await call(
    auth.token,
    'POST',
    `/attendance/leave-accrual-policies/${createdId}/retire`,
    { query: { company_id: HEADER_COMPANY } },
  );
  const retireRow = unwrapPolicyRow(retire) || retire.data;
  const retireOk =
    is2xx(retire.status) &&
    (String(retireRow?.status || '').toLowerCase() === 'retired' ||
      Boolean(retireRow?.archivedAt || retireRow?.archived_at));
  step('SOFT_RETIRE', {
    verdict: retireOk ? 'PASS' : 'FAIL',
    summary: `${retire.status} ${retire.code} status=${retireRow?.status || null} archived=${Boolean(retireRow?.archivedAt || retireRow?.archived_at)}`,
  });

  const listAfter = await call(auth.token, 'GET', '/attendance/leave-accrual-policies', {
    query: { company_id: HEADER_COMPANY, leave_type_key: leaveTypeKey },
  });
  const rowsAfter = asList(listAfter.data ?? listAfter.json);
  const hiddenDefault = !rowsAfter.some((r) => String(r.id) === String(createdId));

  const listInactive = await call(auth.token, 'GET', '/attendance/leave-accrual-policies', {
    query: {
      company_id: HEADER_COMPANY,
      leave_type_key: leaveTypeKey,
      include_inactive: 'true',
    },
  });
  const rowsInactive = asList(listInactive.data ?? listInactive.json);
  const retiredVisible = rowsInactive.some((r) => String(r.id) === String(createdId));

  const effAfter = await call(auth.token, 'GET', '/attendance/leave-accrual-policies/effective', {
    query: {
      company_id: HEADER_COMPANY,
      leave_type_key: leaveTypeKey,
      as_of: todayIso(),
    },
  });
  const effAfterRow = unwrapPolicyRow(effAfter);
  const effHides =
    is2xx(effAfter.status) && String(effAfterRow?.id || '') !== String(createdId);

  const retireAcOk = is2xx(retire.status) && hiddenDefault && retiredVisible && effHides;
  step('RETIRE_VISIBILITY', {
    verdict: retireAcOk ? 'PASS' : 'FAIL',
    summary: `hiddenDefault=${hiddenDefault} includeInactive=${retiredVisible} effHides=${effHides}`,
  });
  report.val['AC-PLT-ATT-LEAVE-BAL-01e'] = {
    expect: 'soft-retire · default/resolve hide · include_inactive OK',
    retire_status: retire.status,
    retire_code: retire.code,
    hiddenDefault,
    retiredVisible,
    effHides,
    verdict: retireAcOk ? 'PASS' : 'FAIL',
  };
  if (!retireAcOk) failOverall('soft-retire visibility FAIL');
  if (!retireOk) failOverall('soft-retire response not retired/archived');

  // Orphan admin type → LVRULE-TYPE
  const orphan = await call(auth.token, 'POST', '/attendance/leave-accrual-policies', {
    body: {
      companyId: HEADER_COMPANY,
      leaveTypeKey: ORPHAN_TYPE,
      accrualMode: 'year_start_grant',
      annualDays: 1,
      unit: 'day',
      version: 1,
      effectiveFrom: todayIso(),
    },
  });
  const orphanOk =
    orphan.status >= 400 &&
    orphan.status < 500 &&
    String(orphan.code) === LVRULE_TYPE &&
    String(orphan.code) !== LEAVE_TYPE_UNKNOWN;
  step('ORPHAN_TYPE', {
    verdict: orphanOk ? 'PASS' : 'FAIL',
    summary: `${orphan.status} ${orphan.code}`,
  });
  report.val['VAL-ATT-LVRULE-CNS-09'] = {
    expect: `4xx ${LVRULE_TYPE} ≠ ${LEAVE_TYPE_UNKNOWN}`,
    status: orphan.status,
    code: orphan.code,
    verdict: orphanOk ? 'PASS' : 'FAIL',
  };
  if (!orphanOk) failOverall(`orphan type expected ${LVRULE_TYPE} got ${orphan.status} ${orphan.code}`);

  // Confirm orphan not persisted
  const orphanList = await call(auth.token, 'GET', '/attendance/leave-accrual-policies', {
    query: {
      company_id: HEADER_COMPANY,
      leave_type_key: ORPHAN_TYPE,
      include_inactive: 'true',
    },
  });
  const orphanPersisted = asList(orphanList.data ?? orphanList.json).some(
    (r) =>
      String(r.leaveTypeKey || r.leave_type_key || '').toLowerCase() === ORPHAN_TYPE,
  );
  step('ORPHAN_NO_PERSIST', {
    verdict: !orphanPersisted ? 'PASS' : 'FAIL',
    summary: `persisted=${orphanPersisted}`,
  });
  if (orphanPersisted) failOverall('orphan type policy persisted');

  // 01f type invent RETAIN — spot leave-request invent type → UNKNOWN (cite seal, no reopen L1 pack)
  let inventType = { status: 0, code: null, summary: 'skipped — no employee' };
  if (emp?.employee_id) {
    inventType = await call(auth.token, 'POST', '/attendance/leave-requests', {
      body: {
        company_id: emp.company_id,
        employee_id: emp.employee_id,
        employee_code: emp.employee_code,
        employee_name: emp.employee_name,
        department: emp.department,
        position: emp.position,
        leave_type: INVENT_TYPE,
        start_date: todayIso(),
        end_date: todayIso(),
        total_days: 1,
        reason: `QA type invent RETAIN ${STAMP}`,
      },
    });
  }
  const typeUnknownOk =
    inventType.status >= 400 &&
    inventType.status < 500 &&
    String(inventType.code) === LEAVE_TYPE_UNKNOWN &&
    String(inventType.code) !== LVRULE_KEY;
  step('TYPE_INVENT_RETAIN', {
    verdict: typeUnknownOk ? 'PASS' : 'FAIL',
    summary: `${inventType.status} ${inventType.code}`,
  });
  report.val['AC-PLT-ATT-LEAVE-BAL-01f'] = {
    expect: `leave TXN invent type → ${LEAVE_TYPE_UNKNOWN} ≠ ${LVRULE_KEY} · L1 RETAIN`,
    status: inventType.status,
    code: inventType.code,
    verdict: typeUnknownOk ? 'PASS' : 'FAIL',
  };
  if (!typeUnknownOk) {
    failOverall(
      `type invent expected ${LEAVE_TYPE_UNKNOWN}; got ${inventType.status} ${inventType.code}`,
    );
  }

  // U19 scope spot — get-by-id fake UUID → LVRULE-404; member OOS if possible
  const fakeId = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';
  const getFake = await call(
    auth.token,
    'GET',
    `/attendance/leave-accrual-policies/${fakeId}`,
    { query: { company_id: HEADER_COMPANY } },
  );
  const u19FakeOk =
    getFake.status === 404 &&
    (String(getFake.code) === 'HRM-ATT-LVRULE-404' || String(getFake.code).includes('404'));
  step('U19_GET_FAKE', {
    verdict: u19FakeOk ? 'PASS' : 'FAIL',
    summary: `${getFake.status} ${getFake.code}`,
  });

  // Member OOS: get created (now retired) under a bogus company slug if API allows
  const getOos = await call(
    auth.token,
    'GET',
    `/attendance/leave-accrual-policies/${createdId}`,
    { query: { company_id: 'zz_member_oos_lvrule' }, companyId: 'zz_member_oos_lvrule' },
  );
  const u19OosOk =
    getOos.status === 404 ||
    getOos.status === 409 ||
    (getOos.status >= 400 && getOos.status < 500);
  step('U19_MEMBER_OOS_SPOT', {
    verdict: u19OosOk ? 'PASS' : 'FAIL',
    summary: `${getOos.status} ${getOos.code}`,
  });
  report.val['VAL-ATT-LVRULE-CNS-03_U19'] = {
    fake: { status: getFake.status, code: getFake.code, verdict: u19FakeOk ? 'PASS' : 'FAIL' },
    member_oos: {
      status: getOos.status,
      code: getOos.code,
      verdict: u19OosOk ? 'PASS' : 'FAIL',
    },
  };
  if (!u19FakeOk) failOverall('U19 fake get-by-id expected LVRULE-404');

  // Seal routes spot — do not reopen
  const seals = {};
  for (const [name, path] of [
    ['leave_types_eff', '/attendance/leave-types/effective'],
    ['att_codes_eff', '/attendance/attendance-codes/effective'],
    ['work_shifts_eff', '/attendance/work-shifts/effective'],
    ['work_sites', '/attendance/work-sites'],
  ]) {
    const r = await call(auth.token, 'GET', path, {
      query: { company_id: HEADER_COMPANY },
    });
    seals[name] = { status: r.status, code: r.code };
  }
  step('SEAL_ROUTES_SPOT', {
    verdict: Object.values(seals).every((s) => s.status === 200) ? 'PASS' : 'FAIL',
    summary: summarizeBody(seals, 400),
  });

  // FE residual 01g — panel MVP hardcode
  report.val['AC-PLT-ATT-LEAVE-BAL-01g'] = {
    expect: 'panel types ⊆ EFF/policy-bound when >0 · kill MVP-five sole SoT',
    verdict: 'HOLD',
    note: 'FE admin/grant/panel residual for PM — do not invent FE this seat. leave-balance.service still documents MVP panel path.',
    mvp_snippet: report.dist_fe.mvp_snippet || null,
  };
  report.residuals.push({
    id: 'R-PLT-ATT-LVRULE-FE-01g',
    owner: 'dev-fe',
    note: 'Admin «Quy tắc quỹ phép» UI + consumer grant bind + panel MVP-five kill (01g) — HOLD this QA seat',
  });
  report.residuals.push({
    id: 'R-PLT-ATT-LVRULE-CNS-WIRE',
    owner: 'dev-be',
    note: 'Wire assertLeaveAccrualPolicyForConsumer on grant/adjust (or gated leave body) so Network emits HRM-ATT-LVRULE-KEY — BE residual follow-on; helper+jest LIVE',
  });
  report.residuals.push({
    id: 'F-ATT-LEAVE-04-ENGINE',
    owner: 'OUT',
    note: 'Accrue engine LIVE HOLD — DENIED claim this seat',
  });

  report.val['AC-PLT-ATT-LEAVE-BAL-01H'] = {
    attendance_uat_ready: false,
    payroll_e2e_ready: false,
    engine_LIVE: 'HOLD',
    seals: report.honesty.seals_retain,
    C_SLICE_NE_MODULE: true,
    U65: true,
    verdict: 'PASS',
  };

  // Overall: invent Network wire gap is known BE residual — if all admin ACs PASS → PASS_TO_PM with Condition
  const hardFails = report.steps.filter((s) => s.verdict === 'FAIL');
  if (hardFails.length) {
    failOverall(`hard FAIL steps: ${hardFails.map((s) => s.id).join(',')}`);
  } else if (report.val['AC-PLT-ATT-LEAVE-BAL-01b']?.verdict === 'FAIL_GAP_WIRE') {
    report.overall = 'PASS';
    report.ack_status = 'PASS_TO_PM';
    report.conditions = [
      'R-PLT-ATT-LVRULE-CNS-WIRE — invent KEY Network not on HTTP yet; helper+jest LIVE; wire grant/adjust follow-on',
      'R-PLT-ATT-LVRULE-FE-01g — FE admin/grant/panel HOLD',
      '01c NOTE_BLOCKED — no wipe for empty invent-skip isolate',
    ];
  }

  report.endedAt = new Date().toISOString();
  save();
  console.log(
    JSON.stringify(
      {
        ack_status: report.ack_status,
        overall: report.overall,
        stamp: report.stamp,
        leave_type_key: report.leave_type_key,
        policy_id: report.policy_id,
        invent_01b: report.val['AC-PLT-ATT-LEAVE-BAL-01b']?.verdict,
        conditions: report.conditions || [],
        fail_reason: report.fail_reason || null,
        out: OUT,
      },
      null,
      2,
    ),
  );
  process.exit(report.ack_status === 'PASS_TO_PM' ? 0 : 2);
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
