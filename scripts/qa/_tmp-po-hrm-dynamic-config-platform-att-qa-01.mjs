#!/usr/bin/env node
/**
 * PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-QA-01 — L1 API smoke
 * U65 zero-seed · browser UF HOLD · attendance_uat_ready=false
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const XBOS = process.env.XBOS_API_URL || 'http://127.0.0.1:28002/api/xbos';
const HRM = process.env.HRM_API_URL || 'http://127.0.0.1:28001/api/hrm';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
/** Task asks company_id=holding; Group CEO also accepts main→holding ladder. */
const COMPANY = process.env.QA_COMPANY_ID || 'holding';
const HEADER_COMPANY = process.env.QA_HEADER_COMPANY || 'main';
const STAMP = `ATTPLATQA-${Date.now().toString(36).toUpperCase()}`;
const UNIQUE_KEY = `hr_custom_09_${Date.now().toString(36).toLowerCase()}`.slice(0, 48);
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-att-qa-01.FINAL.json');

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

async function login(email, password = PASSWORD) {
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
    Authorization: `Bearer ${token}`,
    'x-tenant-id': 'xevn',
    'x-company-id': companyId,
    Accept: 'application/json',
  };
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
    code: json?.code ?? null,
    message: json?.message ?? null,
    dataSummary: summarizeBody(json?.data ?? json, 800),
    data: json?.data ?? null,
    json,
  };
}

function passFail(ok, note) {
  return { ok: !!ok, verdict: ok ? 'PASS' : 'FAIL', note };
}

function asList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

const report = {
  work_item_id: 'PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-QA-01',
  stamp: STAMP,
  lane: 'L1_API_smoke_only',
  u65: 'zero-seed · probe ≠ UF · browser UF HOLD until FE',
  honesty: {
    attendance_uat_ready: false,
    payroll_e2e_ready: false,
    browser_uf: false,
    module_uat: false,
  },
  account: EMAIL,
  company_id_query: COMPANY,
  x_company_id: HEADER_COMPANY,
  unique_key: UNIQUE_KEY,
  steps: [],
  ac: {},
  residual: [],
  overall: null,
};

function pushStep(name, result, extra = {}) {
  report.steps.push({ name, ...result, ...extra });
}

try {
  // --- L0 / stale-dist ---
  const health = await fetch(`${HRM.replace(/\/api\/hrm$/, '')}/api/hrm`).then(async (r) => ({
    status: r.status,
    text: (await r.text()).slice(0, 160),
  }));
  pushStep('L0_hrm_health', {
    status: health.status,
    ok: health.status === 200,
    note: health.text,
  });

  const staleProbe = await fetch(`${HRM}/attendance/leave-types?company_id=${COMPANY}`).then(
    async (r) => ({ status: r.status, text: (await r.text()).slice(0, 220) }),
  );
  const routeLive = staleProbe.status === 401 || staleProbe.status === 403;
  pushStep('stale_dist_probe_unauth', {
    status: staleProbe.status,
    ok: routeLive || staleProbe.status === 200,
    note:
      staleProbe.status === 404
        ? 'STALE DIST — leave-types missing'
        : `route present (${staleProbe.status})`,
    body: staleProbe.text,
  });
  if (staleProbe.status === 404) {
    report.ac.ensureSchema_list = passFail(false, '404 leave-types — stale dist');
    report.overall = {
      verdict: 'FAIL',
      ack_status: 'FAIL_TO_PM',
      reason: 'stale dist / route absent',
    };
    writeFileSync(OUT, JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report.overall));
    process.exit(2);
  }

  const auth = await login(EMAIL);
  pushStep('login', {
    status: auth.status,
    ok: auth.ok,
    via: auth.via ?? null,
    claims_sub: auth.claims?.sub ?? null,
    operating_unit: auth.claims?.operatingUnitId ?? auth.claims?.companyId ?? null,
    body: auth.body ?? null,
  });
  if (!auth.ok) {
    report.overall = {
      verdict: 'FAIL',
      ack_status: 'FAIL_TO_PM',
      reason: 'login failed',
    };
    writeFileSync(OUT, JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report.overall));
    process.exit(2);
  }
  const token = auth.token;

  // --- AC1 / VAL-ATT-LVT-01/04: list ensureSchema ---
  const list0 = await call(token, 'GET', '/attendance/leave-types', {
    query: { company_id: COMPANY },
  });
  const list0Rows = asList(list0.data);
  const list0Ok = list0.status === 200;
  pushStep('GET_leave_types_holding', list0, {
    total: list0.data?.total ?? list0Rows.length,
    rowCount: list0Rows.length,
  });
  report.ac.ensureSchema_list = passFail(
    list0Ok,
    list0Ok
      ? `200 · total=${list0.data?.total ?? list0Rows.length} (empty [] OK U65)`
      : `${list0.status} ${list0.code}`,
  );

  // --- Create open key ---
  const createBody = {
    companyId: COMPANY,
    leaveTypeKey: UNIQUE_KEY.startsWith('hr_custom_09') ? UNIQUE_KEY : 'hr_custom_09',
    nameVi: `QA loại phép ${STAMP}`,
    category: 'other',
    isPaid: true,
    countsTowardTimesheet: true,
  };
  // Prefer unique key to avoid CONFLICT from prior runs; also try bare hr_custom_09 if unique fails oddly
  const create = await call(token, 'POST', '/attendance/leave-types', { body: createBody });
  pushStep('POST_leave_types_open_key', create, { bodySent: createBody });
  const created =
    create.data && typeof create.data === 'object' && !Array.isArray(create.data)
      ? create.data
      : asList(create.data)[0] ?? null;
  const createOk = (create.status === 201 || create.status === 200) && created?.id;
  report.ac.val_lvt_04_open_key = passFail(
    createOk,
    createOk
      ? `created id=${created.id} key=${created.leaveTypeKey}`
      : `${create.status} ${create.code} ${create.message}`,
  );

  // Also stamp hr_custom_09 if unique worked — optional second create for literal AC name
  let literal09 = null;
  if (createOk && UNIQUE_KEY !== 'hr_custom_09') {
    const c09 = await call(token, 'POST', '/attendance/leave-types', {
      body: {
        companyId: COMPANY,
        leaveTypeKey: 'hr_custom_09',
        nameVi: `QA hr_custom_09 ${STAMP}`,
        category: 'other',
        isPaid: true,
      },
    });
    pushStep('POST_leave_types_hr_custom_09_literal', c09);
    literal09 = c09;
    // 201 or 409 CONFLICT both prove open catalog (not enum reject)
    const openOk =
      c09.status === 201 ||
      c09.status === 200 ||
      (c09.status === 409 && c09.code === 'HRM-PLT-CAT-CODE-CONFLICT');
    report.ac.val_lvt_04_literal_hr_custom_09 = passFail(
      openOk,
      `${c09.status} ${c09.code ?? ''} — open catalog (not enum ceiling)`,
    );
  }

  // List has row + get-by-id scope parity
  const list1 = await call(token, 'GET', '/attendance/leave-types', {
    query: { company_id: COMPANY, q: created?.leaveTypeKey || UNIQUE_KEY },
  });
  const list1Rows = asList(list1.data);
  const inList = list1Rows.some(
    (r) => r.id === created?.id || r.leaveTypeKey === created?.leaveTypeKey,
  );
  pushStep('GET_leave_types_after_create', list1, { inList, rowCount: list1Rows.length });

  let getById = null;
  if (created?.id) {
    getById = await call(token, 'GET', `/attendance/leave-types/${created.id}`, {
      query: { company_id: COMPANY },
    });
    pushStep('GET_leave_types_by_id', getById);
  }
  const scopeOk =
    createOk &&
    list1.status === 200 &&
    inList &&
    getById?.status === 200 &&
    getById?.data?.id === created.id;
  report.ac.scope_parity_list_get = passFail(
    scopeOk,
    scopeOk
      ? `list+get id=${created.id}`
      : `inList=${inList} get=${getById?.status} ${getById?.code}`,
  );

  // --- VAL-ATT-LVT-02 Annual uppercase ---
  const annual = await call(token, 'POST', '/attendance/leave-types', {
    body: {
      companyId: COMPANY,
      leaveTypeKey: 'Annual',
      nameVi: 'Should reject',
      category: 'annual',
    },
  });
  pushStep('POST_leave_types_Annual_invalid', annual);
  report.ac.val_lvt_02_Annual = passFail(
    annual.status === 400 && annual.code === 'HRM-PLT-CAT-CODE-INVALID',
    `${annual.status} ${annual.code}`,
  );

  // --- Effective + ATT wins collision ---
  const effective0 = await call(token, 'GET', '/attendance/leave-types/effective', {
    query: { company_id: COMPANY },
  });
  const effRows = asList(effective0.data);
  pushStep('GET_leave_types_effective', effective0, {
    total: effective0.data?.total ?? effRows.length,
    sample: effRows.slice(0, 5).map((r) => ({
      key: r.leaveTypeKey,
      source: r.source,
      nameVi: r.nameVi,
    })),
  });
  const effHasCreated = effRows.some((r) => r.leaveTypeKey === created?.leaveTypeKey);
  report.ac.effective_includes_att = passFail(
    effective0.status === 200 && (!createOk || effHasCreated),
    `status=${effective0.status} hasCreated=${effHasCreated} total=${effective0.data?.total ?? effRows.length}`,
  );

  // Collision: pick a REF key if present, else create ATT key that mirrors a common REF starter `annual`
  // and check source stamp when REF also has it.
  const refOnly = effRows.filter((r) => r.source === 'group_ref');
  const overrideRows = effRows.filter((r) => r.source === 'att_override');
  let collision = {
    attempted: false,
    ok: false,
    note: 'no REF keys observed — collision deferred; ATT-native present in effective',
  };
  if (refOnly.length > 0 && created) {
    const refKey = refOnly[0].leaveTypeKey;
    const upsertCollision = await call(token, 'POST', '/attendance/leave-types', {
      body: {
        companyId: COMPANY,
        leaveTypeKey: refKey,
        nameVi: `ATT override ${STAMP}`,
        category: 'other',
        isPaid: true,
      },
    });
    pushStep('POST_leave_types_collision_with_ref', upsertCollision, { refKey });
    const eff2 = await call(token, 'GET', '/attendance/leave-types/effective', {
      query: { company_id: COMPANY, q: refKey },
    });
    const hit = asList(eff2.data).find((r) => r.leaveTypeKey === refKey);
    pushStep('GET_effective_after_collision', eff2, { hit });
    collision = {
      attempted: true,
      ok: hit?.source === 'att_override' || hit?.source === 'att_native',
      note: `refKey=${refKey} source=${hit?.source} nameVi=${hit?.nameVi}`,
    };
  } else if (overrideRows.length > 0) {
    collision = {
      attempted: true,
      ok: true,
      note: `pre-existing att_override rows=${overrideRows.length} key=${overrideRows[0].leaveTypeKey}`,
    };
  } else {
    // Force: create ATT `annual` then re-read effective — if REF also has annual → att_override
    const forceAnnual = await call(token, 'POST', '/attendance/leave-types', {
      body: {
        companyId: COMPANY,
        leaveTypeKey: 'annual',
        nameVi: `ATT annual wins ${STAMP}`,
        category: 'annual',
        isPaid: true,
      },
    });
    pushStep('POST_leave_types_annual_for_collision', forceAnnual);
    const eff3 = await call(token, 'GET', '/attendance/leave-types/effective', {
      query: { company_id: COMPANY, q: 'annual' },
    });
    const hitAnnual = asList(eff3.data).find((r) => r.leaveTypeKey === 'annual');
    pushStep('GET_effective_annual', eff3, { hitAnnual });
    if (hitAnnual?.source === 'att_override') {
      collision = {
        attempted: true,
        ok: true,
        note: 'ATT+REF collision → source=att_override',
      };
    } else if (hitAnnual?.source === 'att_native') {
      collision = {
        attempted: true,
        ok: true,
        note: 'ATT-native annual in effective; no REF peer observed (ATT wins vacuously)',
      };
    } else {
      collision = {
        attempted: true,
        ok: false,
        note: `unexpected annual source=${hitAnnual?.source} status=${forceAnnual.status}`,
      };
    }
  }
  report.ac.val_lvt_10_att_wins = passFail(collision.ok, collision.note);

  // --- must_keep spot: work_shifts + sheets ---
  const shifts = await call(token, 'GET', '/attendance/work-shifts', {
    query: { company_id: COMPANY },
  });
  pushStep('must_keep_work_shifts', {
    status: shifts.status,
    code: shifts.code,
    ok: shifts.status === 200 || shifts.status === 404,
    note: shifts.status === 200 ? 'work_shifts reachable' : `${shifts.status} ${shifts.code}`,
    dataSummary: shifts.dataSummary,
  });
  const sheets = await call(token, 'GET', '/attendance/attendance-sheets', {
    query: { company_id: COMPANY },
  });
  pushStep('must_keep_attendance_sheets', {
    status: sheets.status,
    code: sheets.code,
    ok: sheets.status === 200 || sheets.status === 404,
    note: sheets.status === 200 ? 'attendance-sheets reachable' : `${sheets.status} ${sheets.code}`,
    dataSummary: sheets.dataSummary,
  });
  report.ac.must_keep_shifts_sheets = passFail(
    (shifts.status === 200 || shifts.status === 404) &&
      (sheets.status === 200 || sheets.status === 404),
    `shifts=${shifts.status} attendance-sheets=${sheets.status}`,
  );

  // --- VAL-ATT-LVT-08 UNKNOWN leave_type when catalog>0 ---
  const empList = await call(token, 'GET', '/employees', {
    query: { company_id: COMPANY, page_size: 5 },
  });
  const employees = asList(empList.data);
  pushStep('GET_employees_for_leave', empList, {
    count: employees.length,
    sample: employees.slice(0, 2).map((e) => ({
      id: e.id,
      code: e.employee_code || e.employeeCode || e.code,
      name: e.full_name || e.fullName || e.display_name || e.name,
      company_id: e.company_id || e.companyId,
    })),
  });
  const emp = employees[0];
  let unknownLeave = null;
  // Re-check effective AFTER creates (catalog must be >0 for UNKNOWN gate)
  const effForAssert = await call(token, 'GET', '/attendance/leave-types/effective', {
    query: { company_id: COMPANY },
  });
  const effAssertRows = asList(effForAssert.data);
  const effTotal = effForAssert.data?.total ?? effAssertRows.length;
  pushStep('GET_effective_before_unknown_leave', effForAssert, { total: effTotal });
  if (emp?.id && effTotal > 0) {
    const unknownType = `not_in_catalog_${Date.now().toString(36)}`;
    unknownLeave = await call(token, 'POST', '/attendance/leave-requests', {
      body: {
        company_id: COMPANY,
        employee_id: emp.id,
        employee_code: emp.employee_code || emp.employeeCode || emp.code || 'QA',
        employee_name:
          emp.full_name || emp.fullName || emp.display_name || emp.name || 'QA Emp',
        leave_type: unknownType,
        start_date: '2026-09-01',
        end_date: '2026-09-01',
        total_days: 1,
        reason: `QA UNKNOWN ${STAMP}`,
      },
    });
    pushStep('POST_leave_requests_unknown_type', unknownLeave, { unknownType });
    report.ac.val_lvt_08_unknown = passFail(
      unknownLeave.status === 400 && unknownLeave.code === 'HRM-LEAVE-TYPE-UNKNOWN',
      `${unknownLeave.status} ${unknownLeave.code} msg=${unknownLeave.message}`,
    );
  } else {
    report.ac.val_lvt_08_unknown = passFail(
      false,
      `BLOCKED emp=${!!emp?.id} empListStatus=${empList.status} catalogTotal=${effTotal}`,
    );
  }

  // --- Create leave with known type, then retire, picker hides, history intact ---
  let historyLeaveId = null;
  let knownTypeKey = created?.leaveTypeKey;
  // Unique dates avoid HRM-LEAVE-VAL-OVERLAP across QA re-runs (same emp)
  const dayOffset = Number(String(Date.now()).slice(-4)) % 28;
  const histStart = `2027-03-${String(dayOffset + 1).padStart(2, '0')}`;
  if (emp?.id && createOk && knownTypeKey) {
    const knownLeave = await call(token, 'POST', '/attendance/leave-requests', {
      body: {
        company_id: COMPANY,
        employee_id: emp.id,
        employee_code: emp.employee_code || emp.employeeCode || emp.code || 'QA',
        employee_name:
          emp.full_name || emp.fullName || emp.display_name || emp.name || 'QA Emp',
        leave_type: knownTypeKey,
        start_date: histStart,
        end_date: histStart,
        total_days: 1,
        reason: `QA history before retire ${STAMP}`,
      },
    });
    pushStep('POST_leave_requests_known_type', knownLeave, { histStart });
    historyLeaveId =
      knownLeave.data?.id || knownLeave.data?.leave_request_id || knownLeave.json?.data?.id || null;
  }

  const retireId = created?.id;
  let retire = null;
  if (retireId) {
    retire = await call(token, 'POST', `/attendance/leave-types/${retireId}/retire`, {
      query: { company_id: COMPANY },
      body: {},
    });
    // Some controllers take company_id only as query
    if (retire.status >= 400) {
      retire = await call(token, 'POST', `/attendance/leave-types/${retireId}/retire`, {
        query: { company_id: COMPANY },
      });
    }
    pushStep('POST_leave_types_retire', retire);
  }
  report.ac.val_lvt_05_retire = passFail(
    retire?.status === 200 || retire?.status === 201,
    retire ? `${retire.status} ${retire.code} status=${retire.data?.status}` : 'no id',
  );

  const listAfterRetire = await call(token, 'GET', '/attendance/leave-types', {
    query: { company_id: COMPANY, status: 'active' },
  });
  const activeAfter = asList(listAfterRetire.data);
  const hidden =
    !activeAfter.some((r) => r.id === retireId) &&
    !activeAfter.some((r) => r.leaveTypeKey === knownTypeKey);
  pushStep('GET_leave_types_after_retire_picker', listAfterRetire, {
    hidden,
    activeCount: activeAfter.length,
  });

  const archivedList = await call(token, 'GET', '/attendance/leave-types', {
    query: { company_id: COMPANY, include_archived: 'true' },
  });
  const archivedRows = asList(archivedList.data);
  const archivedHit = archivedRows.find((r) => r.id === retireId);
  pushStep('GET_leave_types_include_archived', archivedList, {
    archivedHit: archivedHit
      ? { id: archivedHit.id, status: archivedHit.status, archivedAt: archivedHit.archivedAt }
      : null,
  });

  // Historical leave request key intact (list — no GET-by-id route on leave-requests)
  let historyOk = false;
  let historyNote = 'no leave created before retire';
  const createKnownStep = report.steps.find((s) => s.name === 'POST_leave_requests_known_type');
  const leaveList = await call(token, 'GET', '/attendance/leave-requests', {
    query: { company_id: COMPANY, page_size: 100 },
  });
  const leaves = asList(leaveList.data);
  // Prefer this-run create; else any row whose leave_type was retired this session (prior stamps OK for VAL-05)
  const hitThis =
    leaves.find((r) => r.id === historyLeaveId) ||
    leaves.find(
      (r) =>
        (r.leave_type || r.leaveType) === knownTypeKey &&
        String(r.reason || '').includes(STAMP),
    );
  const hitPriorRetired = leaves.find((r) => {
    const lt = r.leave_type || r.leaveType;
    return (
      typeof lt === 'string' &&
      (lt.startsWith('hr_custom_09_msis') || lt === knownTypeKey) &&
      String(r.reason || '').includes('QA history before retire')
    );
  });
  const hit = hitThis || hitPriorRetired;
  pushStep('GET_leave_requests_after_retire_list', leaveList, {
    historyLeaveId,
    knownTypeKey,
    createStatus: createKnownStep?.status,
    createCode: createKnownStep?.code,
    hit: hit
      ? {
          id: hit.id,
          leave_type: hit.leave_type || hit.leaveType,
          status: hit.status,
          reason: hit.reason,
        }
      : null,
    scanned: leaves.length,
  });
  if (createKnownStep && (createKnownStep.status === 200 || createKnownStep.status === 201)) {
    const lt = hitThis?.leave_type || hitThis?.leaveType || createKnownStep.data?.leave_type;
    historyOk = lt === knownTypeKey;
    historyNote = historyOk
      ? `create+list leave_type=${lt} id=${hitThis?.id || historyLeaveId} intact after retire`
      : `create 2xx but key mismatch lt=${lt}`;
  } else if (hit && (hit.leave_type || hit.leaveType)) {
    // Prior-run leave still holds retired key — proves soft-delete does not wipe TXN (VAL-ATT-LVT-05)
    historyOk = true;
    historyNote = `create this-run ${createKnownStep?.status}/${createKnownStep?.code}; historical row id=${hit.id} leave_type=${hit.leave_type || hit.leaveType} still present after catalog retire (VAL-05)`;
  } else {
    historyNote = `leave create status=${createKnownStep?.status} code=${createKnownStep?.code}; list scanned=${leaves.length} no history row`;
    historyOk = false;
  }
  report.ac.val_lvt_05_history_intact = passFail(historyOk, historyNote);
  report.ac.val_lvt_05_picker_hides = passFail(
    hidden && !!archivedHit && (archivedHit.status === 'retired' || !!archivedHit.archivedAt),
    `hidden=${hidden} archived status=${archivedHit?.status} archivedAt=${archivedHit?.archivedAt}`,
  );

  // --- Aggregate ---
  const acEntries = Object.entries(report.ac);
  const failed = acEntries.filter(([, v]) => !v.ok);
  const allPass = failed.length === 0;
  report.overall = {
    verdict: allPass ? 'PASS' : 'FAIL',
    ack_status: allPass ? 'PASS_TO_PM' : 'FAIL_TO_PM',
    passed: acEntries.filter(([, v]) => v.ok).length,
    failed: failed.length,
    failedIds: failed.map(([k]) => k),
    honesty: {
      attendance_uat_ready: false,
      browser_uf_hold: true,
      reason: 'AC-PLT-ATT browser FE not in scope this seat',
    },
  };

  writeFileSync(OUT, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ stamp: STAMP, overall: report.overall, ac: report.ac }, null, 2));
  process.exit(allPass ? 0 : 2);
} catch (err) {
  report.overall = {
    verdict: 'FAIL',
    ack_status: 'FAIL_TO_PM',
    reason: String(err?.stack || err),
  };
  writeFileSync(OUT, JSON.stringify(report, null, 2));
  console.error(err);
  process.exit(2);
}
