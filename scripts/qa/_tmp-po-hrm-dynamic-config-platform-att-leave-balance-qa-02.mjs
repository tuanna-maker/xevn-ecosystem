#!/usr/bin/env node
/**
 * PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-QA-02 — L1 Network invent KEY
 * Parent: ATT-LEAVE-BALANCE-BE-02 READY_FOR_QA · closes R-PLT-ATT-LVRULE-CNS-WIRE
 * Stamp L1 admin RETAIN: ATTLVRULEQA-MSK6G783
 * U65 zero-seed · honesty attendance_uat/payroll_e2e=false · engine HOLD · C-SLICE
 * DENY: module ATT UAT · flip ready · invent FE · claim engine LIVE
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
const STAMP = `ATTLVRULEQA2-${TS.toUpperCase().slice(-8)}`;
const L1_ADMIN_SEAL = 'ATTLVRULEQA-MSK6G783';
const INVENT_POLICY_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const MALFORMED_POLICY_ID = 'not-a-uuid-invent';
const INVENT_TYPE = `zz_invent_lvrule_type_${TS}`.slice(0, 48);
const ORPHAN_TYPE = `zz_orphan_lvrule_${TS}`.slice(0, 48);
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = resolve(
  ROOT,
  'docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-att-leave-balance-qa-02.json',
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

function inspectDist() {
  const out = {
    dist_has_lvrule_key: false,
    controller_assert_consumer_wired: false,
    service_has_assert: false,
    dist_route_snippet: '',
  };
  const readIf = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : '');
  const distConst = resolve(
    ROOT,
    'apps/api/hrm-api/dist/attendance/att-leave-accrual-policy.constants.js',
  );
  const srcConst = resolve(
    ROOT,
    'apps/api/hrm-api/src/attendance/att-leave-accrual-policy.constants.ts',
  );
  const distCtrl = resolve(ROOT, 'apps/api/hrm-api/dist/attendance/attendance.controller.js');
  const distSvc = resolve(
    ROOT,
    'apps/api/hrm-api/dist/attendance/att-leave-accrual-policy.service.js',
  );
  const constTxt = readIf(distConst) || readIf(srcConst);
  out.dist_has_lvrule_key = constTxt.includes(LVRULE_KEY);
  const ctrl = readIf(distCtrl);
  out.controller_assert_consumer_wired =
    ctrl.includes('leave-accrual-policies/assert-consumer') &&
    ctrl.includes('assertLeaveAccrualPolicyForConsumer');
  if (out.controller_assert_consumer_wired) {
    out.dist_route_snippet = 'POST leave-accrual-policies/assert-consumer → assertLeaveAccrualPolicyForConsumer';
  }
  out.service_has_assert = readIf(distSvc).includes('assertLeaveAccrualPolicyForConsumer');
  return out;
}

const report = {
  work_item_id: 'PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-QA-02',
  stamp: STAMP,
  stamp_l1_admin_retain: L1_ADMIN_SEAL,
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
      FE_01g_HOLD: 'R-PLT-ATT-LVRULE-FE-01g HOLD — do not invent FE',
      L1_admin: L1_ADMIN_SEAL,
    },
  },
  dist: null,
  leave_type_key: null,
  policy_id: null,
  policy_company_id: null,
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
  report.dist = inspectDist();
  const distWired =
    report.dist.dist_has_lvrule_key &&
    report.dist.controller_assert_consumer_wired &&
    report.dist.service_has_assert;
  step('DIST_WIRE_GATE', {
    verdict: distWired ? 'PASS' : 'FAIL',
    summary: summarizeBody(report.dist, 500),
  });
  if (!distWired) failOverall('dist assert-consumer wire incomplete');

  const health = await call(null, 'GET', '');
  step('L0_HRM_HEALTH', {
    verdict: health.status === 200 ? 'PASS' : 'FAIL',
    summary: `${health.status} ${health.code}`,
  });
  if (health.status !== 200) failOverall('L0 hrm health not 200');

  // Task 1: unauth assert-consumer — expect 401 ≠ 404 (route registered)
  const unauthAssert = await call(
    null,
    'POST',
    '/attendance/leave-accrual-policies/assert-consumer',
    {
      body: {
        companyId: HEADER_COMPANY,
        leaveTypeKey: 'lvt_01',
        policyId: INVENT_POLICY_ID,
      },
    },
  );
  const unauthOk =
    (unauthAssert.status === 401 || unauthAssert.status === 403) &&
    unauthAssert.status !== 404;
  step('UNAUTH_ASSERT_CONSUMER', {
    verdict: unauthOk ? 'PASS' : 'FAIL',
    summary: `${unauthAssert.status} ${unauthAssert.code}`,
  });
  report.val.route_registered = {
    expect: 'unauth POST assert-consumer → 401/403 ≠ 404',
    status: unauthAssert.status,
    code: unauthAssert.code,
    verdict: unauthOk ? 'PASS' : 'FAIL',
  };
  if (!unauthOk) failOverall(`assert-consumer unauth ${unauthAssert.status} (want 401≠404)`);

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
    failOverall('no EFF leave_type_key');
    report.endedAt = new Date().toISOString();
    save();
    process.exit(2);
  }

  // Prefer existing active policy; else admin CREATE (01d retain pattern)
  const list0 = await call(auth.token, 'GET', '/attendance/leave-accrual-policies', {
    query: { company_id: HEADER_COMPANY, leave_type_key: leaveTypeKey },
  });
  const rows0 = asList(list0.data ?? list0.json);
  const activeExisting = rows0.find((r) => {
    const st = String(r.status || 'active').toLowerCase();
    return st === 'active' || st === 'published' || (!r.archivedAt && !r.archived_at && st !== 'retired');
  });

  let createdId = activeExisting?.id || null;
  let createdCompany =
    activeExisting?.companyId || activeExisting?.company_id || HEADER_COMPANY;
  let createdMode =
    activeExisting?.accrualMode || activeExisting?.accrual_mode || 'year_start_grant';
  let createdDays =
    Number(activeExisting?.annualDays ?? activeExisting?.annual_days ?? 12) || 12;
  let createSource = activeExisting ? 'existing_active' : 'admin_create';

  if (!createdId) {
    const created = await call(auth.token, 'POST', '/attendance/leave-accrual-policies', {
      body: {
        companyId: HEADER_COMPANY,
        leaveTypeKey,
        accrualMode: 'year_start_grant',
        annualDays: 12,
        unit: 'day',
        allowNegative: false,
        version: 1,
        effectiveFrom: todayIso(),
        effectiveTo: offsetIso(365),
      },
    });
    createdId = created.data?.id || created.json?.data?.id || null;
    createdCompany =
      created.data?.companyId || created.data?.company_id || HEADER_COMPANY;
    createdMode = created.data?.accrualMode || 'year_start_grant';
    createdDays = Number(created.data?.annualDays ?? 12) || 12;
    const createOk = is2xx(created.status) && Boolean(createdId);
    step('ADMIN_CREATE_OR_EXISTING', {
      verdict: createOk ? 'PASS' : 'FAIL',
      summary: `CREATE ${created.status} ${created.code} id=${createdId}`,
    });
    if (!createOk) failOverall(`admin CREATE failed ${created.status} ${created.code}`);
  } else {
    step('ADMIN_CREATE_OR_EXISTING', {
      verdict: 'PASS',
      summary: `reuse existing active id=${createdId} company=${createdCompany}`,
    });
  }
  report.policy_id = createdId;
  report.policy_company_id = createdCompany;
  report.create_source = createSource;

  // Soft-skip: no rule params (companyId+leaveTypeKey only)
  const softSkipEmpty = await call(
    auth.token,
    'POST',
    '/attendance/leave-accrual-policies/assert-consumer',
    {
      body: {
        companyId: HEADER_COMPANY,
        leaveTypeKey,
      },
    },
  );
  const softSkipOk =
    is2xx(softSkipEmpty.status) &&
    (softSkipEmpty.data?.skipped === true ||
      softSkipEmpty.json?.data?.skipped === true ||
      softSkipEmpty.data?.policy == null);
  step('SOFT_SKIP_NO_RULE_PARAMS', {
    verdict: softSkipOk ? 'PASS' : 'FAIL',
    summary: `${softSkipEmpty.status} ${softSkipEmpty.code} skipped=${softSkipEmpty.data?.skipped} ${summarizeBody(softSkipEmpty.data, 200)}`,
  });
  report.val.soft_skip_no_params = {
    expect: '200 soft-skip when no rule params',
    status: softSkipEmpty.status,
    code: softSkipEmpty.code,
    skipped: softSkipEmpty.data?.skipped ?? softSkipEmpty.json?.data?.skipped,
    verdict: softSkipOk ? 'PASS' : 'FAIL',
  };
  if (!softSkipOk) failOverall('soft-skip no-params FAIL');

  // Invent unknown policyId → KEY
  const inventId = await call(
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
  const inventIdOk =
    inventId.status === 400 && String(inventId.code) === LVRULE_KEY;
  step('INVENT_POLICY_ID_KEY', {
    verdict: inventIdOk ? 'PASS' : 'FAIL',
    summary: `${inventId.status} ${inventId.code}`,
  });

  // Invent ad-hoc mode|days (no policyId) → KEY
  const inventAdhoc = await call(
    auth.token,
    'POST',
    '/attendance/leave-accrual-policies/assert-consumer',
    {
      body: {
        companyId: HEADER_COMPANY,
        leaveTypeKey,
        accrualMode: 'zz_invent_mode_adhoc',
        annualDays: 999,
      },
    },
  );
  const inventAdhocOk =
    inventAdhoc.status === 400 && String(inventAdhoc.code) === LVRULE_KEY;
  step('INVENT_ADHOC_MODE_DAYS_KEY', {
    verdict: inventAdhocOk ? 'PASS' : 'FAIL',
    summary: `${inventAdhoc.status} ${inventAdhoc.code}`,
  });

  // Malformed policyId → KEY (no 500)
  const inventMalformed = await call(
    auth.token,
    'POST',
    '/attendance/leave-accrual-policies/assert-consumer',
    {
      body: {
        companyId: HEADER_COMPANY,
        leaveTypeKey,
        policyId: MALFORMED_POLICY_ID,
      },
    },
  );
  const inventMalformedOk =
    inventMalformed.status === 400 &&
    String(inventMalformed.code) === LVRULE_KEY &&
    inventMalformed.status !== 500;
  step('INVENT_MALFORMED_POLICY_ID_KEY', {
    verdict: inventMalformedOk ? 'PASS' : 'FAIL',
    summary: `${inventMalformed.status} ${inventMalformed.code}`,
  });

  const networkKeyHit = inventIdOk || inventAdhocOk || inventMalformedOk;
  report.val['AC-PLT-ATT-LEAVE-BAL-01b'] = {
    expect: `Network 4xx ${LVRULE_KEY} when active>0 invent · no persist`,
    invent_policy_id: {
      status: inventId.status,
      code: inventId.code,
      verdict: inventIdOk ? 'PASS' : 'FAIL',
    },
    invent_adhoc: {
      status: inventAdhoc.status,
      code: inventAdhoc.code,
      verdict: inventAdhocOk ? 'PASS' : 'FAIL',
    },
    invent_malformed: {
      status: inventMalformed.status,
      code: inventMalformed.code,
      verdict: inventMalformedOk ? 'PASS' : 'FAIL',
    },
    network_key_hit: networkKeyHit,
    controller_assert_consumer_wired: report.dist.controller_assert_consumer_wired,
    verdict: inventIdOk && inventAdhocOk && inventMalformedOk ? 'PASS' : 'FAIL',
  };
  if (!(inventIdOk && inventAdhocOk && inventMalformedOk)) {
    failOverall('AC-01b invent KEY Network FAIL');
  }

  // No persist: invent UUID still absent from list
  const listAfterInvent = await call(auth.token, 'GET', '/attendance/leave-accrual-policies', {
    query: {
      company_id: HEADER_COMPANY,
      leave_type_key: leaveTypeKey,
      include_inactive: 'true',
    },
  });
  const inventPersisted = asList(listAfterInvent.data ?? listAfterInvent.json).some(
    (r) => String(r.id) === INVENT_POLICY_ID,
  );
  step('INVENT_NO_PERSIST', {
    verdict: !inventPersisted ? 'PASS' : 'FAIL',
    summary: `inventUuidPersisted=${inventPersisted}`,
  });
  if (inventPersisted) failOverall('invent policyId persisted');

  // Valid published binding → 200
  const validBind = await call(
    auth.token,
    'POST',
    '/attendance/leave-accrual-policies/assert-consumer',
    {
      body: {
        companyId: HEADER_COMPANY,
        leaveTypeKey,
        policyId: createdId,
        accrualMode: createdMode,
        annualDays: createdDays,
      },
    },
  );
  const validOk =
    is2xx(validBind.status) &&
    (validBind.data?.skipped === false ||
      String(validBind.data?.policy?.id || validBind.json?.data?.policy?.id || '') ===
        String(createdId) ||
      String(validBind.code || '').includes('LVRULE-200'));
  step('VALID_PUBLISHED_BINDING', {
    verdict: validOk ? 'PASS' : 'FAIL',
    summary: `${validBind.status} ${validBind.code} skipped=${validBind.data?.skipped} policyId=${validBind.data?.policy?.id || null}`,
  });
  report.val.valid_published_binding = {
    expect: '200 match published policy',
    status: validBind.status,
    code: validBind.code,
    skipped: validBind.data?.skipped,
    policy_id: validBind.data?.policy?.id || null,
    verdict: validOk ? 'PASS' : 'FAIL',
  };
  if (!validOk) failOverall(`valid binding FAIL ${validBind.status} ${validBind.code}`);

  // Soft-retire → invent skip or hide (BA 01e); include_inactive OK
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
    summary: `${retire.status} ${retire.code} status=${retireRow?.status || null}`,
  });

  const listAfter = await call(auth.token, 'GET', '/attendance/leave-accrual-policies', {
    query: { company_id: HEADER_COMPANY, leave_type_key: leaveTypeKey },
  });
  const hiddenDefault = !asList(listAfter.data ?? listAfter.json).some(
    (r) => String(r.id) === String(createdId),
  );
  const listInactive = await call(auth.token, 'GET', '/attendance/leave-accrual-policies', {
    query: {
      company_id: HEADER_COMPANY,
      leave_type_key: leaveTypeKey,
      include_inactive: 'true',
    },
  });
  const retiredVisible = asList(listInactive.data ?? listInactive.json).some(
    (r) => String(r.id) === String(createdId),
  );
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

  // After soft-retire: invent may soft-skip (active=0) OR still KEY if other actives remain
  const inventAfterRetire = await call(
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
  const inventAfterOk =
    (is2xx(inventAfterRetire.status) &&
      (inventAfterRetire.data?.skipped === true || inventAfterRetire.data?.policy == null)) ||
    (inventAfterRetire.status === 400 && String(inventAfterRetire.code) === LVRULE_KEY);
  step('INVENT_AFTER_SOFT_RETIRE', {
    verdict: inventAfterOk ? 'PASS' : 'FAIL',
    summary: `${inventAfterRetire.status} ${inventAfterRetire.code} skipped=${inventAfterRetire.data?.skipped}`,
  });

  const retireAcOk =
    retireOk && hiddenDefault && retiredVisible && effHides && inventAfterOk;
  step('RETIRE_VISIBILITY', {
    verdict: retireAcOk ? 'PASS' : 'FAIL',
    summary: `hiddenDefault=${hiddenDefault} includeInactive=${retiredVisible} effHides=${effHides} inventAfter=${inventAfterRetire.status}/${inventAfterRetire.code}`,
  });
  report.val['AC-PLT-ATT-LEAVE-BAL-01e'] = {
    expect: 'soft-retire hide · include_inactive · invent skip or KEY if peers remain',
    retire_status: retire.status,
    hiddenDefault,
    retiredVisible,
    effHides,
    invent_after: {
      status: inventAfterRetire.status,
      code: inventAfterRetire.code,
      skipped: inventAfterRetire.data?.skipped,
    },
    verdict: retireAcOk ? 'PASS' : 'FAIL',
  };
  if (!retireAcOk) failOverall('soft-retire / invent-after FAIL');

  // Orthogonal: orphan TYPE + leave-type UNKNOWN
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
    String(orphan.code) !== LEAVE_TYPE_UNKNOWN &&
    String(orphan.code) !== LVRULE_KEY;
  step('ORPHAN_TYPE_ORTHOGONAL', {
    verdict: orphanOk ? 'PASS' : 'FAIL',
    summary: `${orphan.status} ${orphan.code}`,
  });

  const emp = await pickEmployee(auth.token);
  let inventType = { status: 0, code: null };
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
        reason: `QA-02 type invent RETAIN ${STAMP}`,
      },
    });
  }
  const typeUnknownOk =
    inventType.status >= 400 &&
    inventType.status < 500 &&
    String(inventType.code) === LEAVE_TYPE_UNKNOWN &&
    String(inventType.code) !== LVRULE_KEY;
  step('TYPE_INVENT_UNKNOWN_ORTHOGONAL', {
    verdict: typeUnknownOk ? 'PASS' : 'FAIL',
    summary: `${inventType.status} ${inventType.code}`,
  });
  report.val.orthogonal = {
    orphan_TYPE: { status: orphan.status, code: orphan.code, verdict: orphanOk ? 'PASS' : 'FAIL' },
    leave_type_UNKNOWN: {
      status: inventType.status,
      code: inventType.code,
      verdict: typeUnknownOk ? 'PASS' : 'FAIL',
    },
  };
  if (!orphanOk) failOverall(`orphan expected ${LVRULE_TYPE}`);
  if (!typeUnknownOk) failOverall(`type invent expected ${LEAVE_TYPE_UNKNOWN}`);

  report.val['AC-PLT-ATT-LEAVE-BAL-01H'] = {
    attendance_uat_ready: false,
    payroll_e2e_ready: false,
    engine_LIVE: 'HOLD',
    seals: report.honesty.seals_retain,
    C_SLICE_NE_MODULE: true,
    U65: true,
    DENY: [
      'module ATT UAT',
      'flip attendance_uat_ready / payroll_e2e_ready',
      'claim F-ATT-LEAVE-04 engine LIVE',
      'invent FE 01g',
    ],
    verdict: 'PASS',
  };

  report.residuals.push({
    id: 'R-PLT-ATT-LVRULE-CNS-WIRE',
    owner: 'qc',
    note: 'QA-02 Network KEY LIVE via assert-consumer — ready for QC-02 Condition close',
    status: networkKeyHit ? 'READY_CLOSE' : 'OPEN',
  });
  report.residuals.push({
    id: 'R-PLT-ATT-LVRULE-FE-01g',
    owner: 'dev-fe',
    note: 'FE admin/grant/panel HOLD — do not invent FE this seat',
    status: 'HOLD',
  });
  report.residuals.push({
    id: 'F-ATT-LEAVE-04-ENGINE',
    owner: 'OUT',
    note: 'Accrue engine LIVE HOLD — DENIED claim',
    status: 'HOLD',
  });

  const hardFails = report.steps.filter((s) => s.verdict === 'FAIL');
  if (hardFails.length) {
    failOverall(`hard FAIL steps: ${hardFails.map((s) => s.id).join(',')}`);
  } else if (report.val['AC-PLT-ATT-LEAVE-BAL-01b']?.verdict === 'PASS') {
    report.overall = 'PASS';
    report.ack_status = 'PASS_TO_PM';
    report.conditions_closed_candidate = ['R-PLT-ATT-LVRULE-CNS-WIRE'];
  }

  report.endedAt = new Date().toISOString();
  save();
  console.log(
    JSON.stringify(
      {
        ack_status: report.ack_status,
        overall: report.overall,
        stamp: report.stamp,
        stamp_l1_admin_retain: L1_ADMIN_SEAL,
        leave_type_key: report.leave_type_key,
        policy_id: report.policy_id,
        invent_01b: report.val['AC-PLT-ATT-LEAVE-BAL-01b']?.verdict,
        network_key_hit: report.val['AC-PLT-ATT-LEAVE-BAL-01b']?.network_key_hit,
        controller_assert_consumer_wired: report.dist.controller_assert_consumer_wired,
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
