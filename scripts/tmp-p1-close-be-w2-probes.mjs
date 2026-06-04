/**
 * P1-CLOSE-BE-W2 live probes — HRM-AT-04..13, PR, embed UC-HRM-22..25.
 * Usage: node scripts/tmp-p1-close-be-w2-probes.mjs
 */
import { randomUUID } from 'node:crypto';

const HRM = process.env.HRM_BASE ?? 'http://127.0.0.1:28001/api/hrm';
const INTERNAL = process.env.INTERNAL_API_KEY ?? 'xevn-dev-internal-key';
const TENANT = 'xevn';
const COMPANY_SLUG = process.env.HRM_PROBE_COMPANY ?? 'main';
const HOLDING_UUID = '10000000-0000-4000-8000-000000000001';

const headers = (extra = {}) => ({
  'x-internal-api-key': INTERNAL,
  'x-tenant-id': TENANT,
  'x-company-id': COMPANY_SLUG,
  ...extra,
});

async function req(method, path, body, extraHeaders = {}) {
  const res = await fetch(`${HRM}${path}`, {
    method,
    headers: {
      ...headers(body ? { 'content-type': 'application/json' } : {}),
      ...extraHeaders,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}

async function probe(name, method, path, body, expectCode, extraHeaders = {}) {
  const { status, json } = await req(method, path, body, extraHeaders);
  const expectedCodes = Array.isArray(expectCode) ? expectCode : expectCode ? [expectCode] : [];
  const codeMatched = expectedCodes.length === 0 || expectedCodes.includes(json.code);
  const statusOk = expectedCodes.length > 0 ? codeMatched : status < 400;
  const row = { name, method, path, status, code: json.code, ok: statusOk && codeMatched };
  console.log(JSON.stringify(row));
  return row;
}

const rows = [];

function resolveCompanyUuid(emp) {
  const cf = emp?.custom_fields ?? {};
  if (cf.attendance_company_uuid && /^[0-9a-f-]{36}$/i.test(cf.attendance_company_uuid)) {
    return cf.attendance_company_uuid;
  }
  if (emp?.company_id && /^[0-9a-f-]{36}$/i.test(emp.company_id)) {
    return emp.company_id;
  }
  return HOLDING_UUID;
}

async function resolveEmployee() {
  const { status, json } = await req('GET', `/employees?company_id=${encodeURIComponent(COMPANY_SLUG)}&page_size=1`);
  const emp = json?.data?.data?.[0] ?? json?.data?.items?.[0] ?? json?.data?.[0];
  if (status >= 400 || !emp?.id) {
    return {
      company_id: HOLDING_UUID,
      employee_id: null,
      employee_code: 'NV0001',
      employee_name: 'Probe Fallback',
    };
  }
  return {
    company_id: resolveCompanyUuid(emp),
    employee_id: emp.id,
    employee_code: emp.employee_code ?? 'NV0001',
    employee_name: emp.full_name ?? emp.employee_name ?? 'Probe Employee',
  };
}

async function runAttendanceMutations(emp) {
  const uuidScopeHeaders = { 'x-company-id': emp.company_id };
  const base = {
    company_id: emp.company_id,
    employee_id: emp.employee_id,
    employee_code: emp.employee_code,
    employee_name: emp.employee_name,
    attendance_date: '2026-05-20',
    update_type: 'check_in',
    reason: 'p1-close-be-w2-probe',
  };
  if (!emp.employee_id) {
    console.log(JSON.stringify({ skip: 'attendance-mutations', reason: 'no employee_id from list' }));
    return;
  }

  const create1 = await req('POST', '/attendance/update-requests', base);
  const ur1 = create1.json?.data?.id;
  rows.push({
    name: 'HRM-AT-04 create update-request',
    method: 'POST',
    path: '/attendance/update-requests',
    status: create1.status,
    code: create1.json?.code,
    ok: create1.json?.code === 'HRM-ATT-REQ-201',
  });
  console.log(JSON.stringify(rows[rows.length - 1]));

  rows.push(
    await probe(
      'HRM-AT-05 list update-requests',
      'GET',
      `/attendance/update-requests?company_id=${encodeURIComponent(COMPANY_SLUG)}`,
      undefined,
      'HRM-ATT-REQ-200',
    ),
  );

  if (ur1) {
    rows.push(
      await probe('HRM-AT-06 patch update-request', 'PATCH', `/attendance/update-requests/${ur1}`, {
        reason: 'p1-close-be-w2 patched',
      }, 'HRM-ATT-REQ-202', uuidScopeHeaders),
    );
  }

  const create2 = await req('POST', '/attendance/update-requests', base);
  const ur2 = create2.json?.data?.id;
  if (ur2) {
    rows.push(
      await probe('HRM-AT-07 approve update-request', 'POST', `/attendance/update-requests/${ur2}/approve`, {
        approver_name: 'probe-mgr',
      }, 'HRM-ATT-REQ-203', uuidScopeHeaders),
    );
  }

  const create3 = await req('POST', '/attendance/update-requests', base);
  const ur3 = create3.json?.data?.id;
  if (ur3) {
    rows.push(
      await probe('HRM-AT-08 reject update-request', 'POST', `/attendance/update-requests/${ur3}/reject`, {
        approver_name: 'probe-mgr',
        rejected_reason: 'probe-reject',
      }, 'HRM-ATT-REQ-204', uuidScopeHeaders),
    );
  }

  const create4 = await req('POST', '/attendance/update-requests', base);
  const ur4 = create4.json?.data?.id;
  if (ur4) {
    rows.push(
      await probe(
        'HRM-AT-09 delete update-request',
        'DELETE',
        `/attendance/update-requests/${ur4}`,
        undefined,
        'HRM-ATT-REQ-205',
        uuidScopeHeaders,
      ),
    );
  }

  const leaveBase = {
    company_id: emp.company_id,
    employee_id: emp.employee_id,
    employee_code: emp.employee_code,
    employee_name: emp.employee_name,
    leave_type: 'annual',
    start_date: '2026-07-01',
    end_date: '2026-07-02',
    total_days: 2,
    reason: 'p1-close-be-w2-leave',
  };

  const lr1 = await req('POST', '/attendance/leave-requests', leaveBase);
  rows.push({
    name: 'HRM-AT-10 create leave-request',
    method: 'POST',
    path: '/attendance/leave-requests',
    status: lr1.status,
    code: lr1.json?.code,
    ok: lr1.json?.code === 'HRM-LEAVE-201',
  });
  console.log(JSON.stringify(rows[rows.length - 1]));

  rows.push(
    await probe(
      'HRM-AT-11 list leave-requests',
      'GET',
      `/attendance/leave-requests?company_id=${encodeURIComponent(COMPANY_SLUG)}`,
      undefined,
      'HRM-LEAVE-200',
    ),
  );

  const lr2 = await req('POST', '/attendance/leave-requests', leaveBase);
  const leaveId2 = lr2.json?.data?.id;
  if (leaveId2) {
    rows.push(
      await probe('HRM-AT-12 approve leave-request', 'POST', `/attendance/leave-requests/${leaveId2}/approve`, {
        reviewer_name: 'probe-mgr',
      }, 'HRM-LEAVE-203', uuidScopeHeaders),
    );
    rows.push(
      await probe(
        'HRM-AT-12-NG leave approve scope mismatch',
        'POST',
        `/attendance/leave-requests/${leaveId2}/approve`,
        { reviewer_name: 'probe-mgr' },
        'HRM-LEAVE-409',
      ),
    );
  }

  const lr3 = await req('POST', '/attendance/leave-requests', leaveBase);
  const leaveId3 = lr3.json?.data?.id;
  if (leaveId3) {
    rows.push(
      await probe('HRM-AT-13 reject leave-request', 'POST', `/attendance/leave-requests/${leaveId3}/reject`, {
        reviewer_name: 'probe-mgr',
        rejected_reason: 'probe-overlap',
      }, 'HRM-LEAVE-204', uuidScopeHeaders),
    );
  }
}

async function runEmbedReads() {
  rows.push(
    await probe(
      'UC-HRM-22 recruitment requisitions',
      'GET',
      `/recruitment/requisitions?company_id=${encodeURIComponent(COMPANY_SLUG)}&page_size=5`,
      undefined,
      'HRM-REC-200',
    ),
  );
  rows.push(
    await probe(
      'UC-HRM-23 attendance records embed',
      'GET',
      `/attendance/records?company_id=${encodeURIComponent(COMPANY_SLUG)}&page_size=5`,
      undefined,
      'HRM-ATT-200',
    ),
  );
  rows.push(
    await probe(
      'UC-HRM-24 payroll periods embed',
      'GET',
      `/payroll/periods?company_id=${encodeURIComponent(COMPANY_SLUG)}`,
      undefined,
      'HRM-PAY-200',
    ),
  );
  rows.push(
    await probe(
      'UC-HRM-25 contracts embed',
      'GET',
      `/contracts-insurance/contracts?company_id=${encodeURIComponent(COMPANY_SLUG)}`,
      undefined,
      'HRM-CON-200',
    ),
  );
}

async function runPayrollMutations(companyUuid) {
  const label = `w2-probe-${randomUUID().slice(0, 8)}`;
  const create = await req('POST', '/payroll/periods', {
    company_id: companyUuid,
    period_label: label,
    start_date: '2026-05-01',
    end_date: '2026-05-31',
    created_by: 'p1-close-be-w2',
  });
  rows.push({
    name: 'HRM-PR-01 create payroll period',
    method: 'POST',
    path: '/payroll/periods',
    status: create.status,
    code: create.json?.code,
    ok: create.json?.code === 'HRM-PAY-201' || create.json?.code === 'HRM-PAY-002',
  });
  console.log(JSON.stringify(rows[rows.length - 1]));

  const periodId = create.json?.data?.id;

  const list = await req('GET', `/payroll/periods?company_id=${encodeURIComponent(COMPANY_SLUG)}`);
  rows.push({
    name: 'HRM-PR-02 list payroll periods',
    method: 'GET',
    path: '/payroll/periods',
    status: list.status,
    code: list.json?.code,
    ok: list.json?.code === 'HRM-PAY-200',
  });
  console.log(JSON.stringify(rows[rows.length - 1]));

  if (periodId) {
    rows.push(
      await probe(
        'HRM-PR-03 process payroll period',
        'POST',
        `/payroll/periods/${periodId}/process`,
        undefined,
        ['HRM-PAY-202', 'HRM-PAY-409'],
      ),
    );
    rows.push(
      await probe(
        'HRM-PR-04 close payroll period',
        'POST',
        `/payroll/periods/${periodId}/close`,
        undefined,
        ['HRM-PAY-203', 'HRM-PAY-409'],
      ),
    );
  }

  rows.push(
    await probe(
      'HRM-PR-05 list payslips',
      'GET',
      `/payroll/payslips?company_id=${encodeURIComponent(COMPANY_SLUG)}&page_size=5`,
      undefined,
      'HRM-PAY-200',
    ),
  );
  rows.push(
    await probe(
      'HRM-PR-06 reconciliation summary',
      'GET',
      `/payroll/reports/reconciliation?company_id=${encodeURIComponent(companyUuid)}`,
      undefined,
      'HRM-PAY-200',
    ),
  );
}

const emp = await resolveEmployee();
await runAttendanceMutations(emp);
await runEmbedReads();
await runPayrollMutations(emp.company_id);

const failed = rows.filter((r) => r.ok === false);
process.exitCode = failed.length ? 1 : 0;
