#!/usr/bin/env node
/**
 * P1-EX-DO-SEED-ATTENDANCE-HTTPS-10 — seed attendance records for main-scope employees on HTTPS pilot.
 */
import { createHash } from 'node:crypto';

const PORTAL = (process.env.PORTAL_DEV_URL || 'https://14-225-217-232.nip.io').replace(/\/+$/, '');
const TAG = process.env.HRM_FIDELITY_SEED_TAG ?? 'p1-ex-do-seed-attendance-https-10';
const email = process.env.UAT_PORTAL_EMAIL ?? 'ceo@xe.vn';
const password = process.env.PORTAL_DEV_PASSWORD ?? 'Xevn@2026';
const TENANT = process.env.MASTER_TENANT_ID ?? 'xevn';
const COHORT_MAX = Number(process.env.HRM_ATTENDANCE_COHORT_MAX ?? 217);

function stableUuid(seed) {
  const h = createHash('sha256').update(seed).digest('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-8${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

function hashByte(seed) {
  return createHash('sha256').update(seed).digest()[0];
}

function inCohort(key) {
  return hashByte(`${TAG}:attendance:${key}`) < COHORT_MAX;
}

function attendanceCompanyUuid(companySlug) {
  return stableUuid(`hrm-scope:${TENANT}:${companySlug}`);
}

function resolveAttendanceCompanyId(emp) {
  const cf = emp.custom_fields ?? emp.customFields ?? {};
  if (cf.attendance_company_uuid && /^[0-9a-f-]{36}$/i.test(cf.attendance_company_uuid)) {
    return cf.attendance_company_uuid;
  }
  const slug = emp.company_id ?? emp.companyId ?? 'holding';
  return attendanceCompanyUuid(String(slug));
}

async function fetchJson(url, init = {}) {
  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body, code: body?.code };
}

function listPayload(body) {
  const inner = body?.data;
  if (inner && typeof inner === 'object' && !Array.isArray(inner)) {
    const rows = inner.data ?? inner.items ?? [];
    const total = inner.total ?? rows.length;
    return { rows, total };
  }
  if (Array.isArray(inner)) return { rows: inner, total: inner.length };
  return { rows: [], total: 0 };
}

async function portalLogin() {
  const { status, body } = await fetchJson(`${PORTAL}/api/xbos/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  const data = body?.data ?? body;
  const token = data?.access_token ?? data?.accessToken;
  return { ok: (status === 200 || status === 201) && Boolean(token), token, data };
}

function sessionHeaders(token, data) {
  const tenant = data?.defaultTenantId ?? data?.default_tenant_id ?? TENANT;
  const company = data?.defaultCompanyId ?? data?.default_company_id ?? 'main';
  return {
    Authorization: `Bearer ${token}`,
    'x-tenant-id': tenant,
    'x-company-id': company,
  };
}

function recentAttendanceDate(offsetDays) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - offsetDays);
  return d.toISOString().slice(0, 10);
}

async function main() {
  const login = await portalLogin();
  if (!login.ok) {
    console.error('Login failed');
    process.exit(1);
  }

  const headers = sessionHeaders(login.token, login.data);

  const preList = await fetchJson(
    `${PORTAL}/api/hrm/attendance/records?company_id=main&page_size=10`,
    { headers },
  );
  const preTotal = listPayload(preList.body).total;

  const empRes = await fetchJson(`${PORTAL}/api/hrm/employees?company_id=main&page_size=100`, {
    headers,
  });
  const { rows: employees, total: empTotal } = listPayload(empRes.body);
  if (empRes.status !== 200 || employees.length === 0) {
    console.error('No employees in main scope', empRes.status, empRes.code, empTotal);
    process.exit(1);
  }

  let created = 0;
  let skipped = 0;
  const errors = [];

  for (const emp of employees) {
    const code = emp.employee_code ?? emp.employeeCode ?? emp.id;
    if (!inCohort(String(code))) {
      skipped += 1;
      continue;
    }

    const employeeId = emp.id ?? emp.employee_id;
    if (!employeeId) {
      errors.push({ code, reason: 'missing employee id' });
      continue;
    }

    const companyUuid = resolveAttendanceCompanyId(emp);
    const dayOffset = (hashByte(`${code}:day`) % 14) + 1;
    const attendanceDate = recentAttendanceDate(dayOffset);

    const recordBody = {
      company_id: companyUuid,
      employee_id: employeeId,
      attendance_date: attendanceDate,
      check_in_at: `${attendanceDate}T01:00:00.000Z`,
      check_out_at: `${attendanceDate}T10:00:00.000Z`,
      status: 'present',
      note: TAG,
      created_by: TAG,
    };

    const post = await fetchJson(`${PORTAL}/api/hrm/attendance/records`, {
      method: 'POST',
      headers,
      body: JSON.stringify(recordBody),
    });

    if (post.status === 201 || post.code === 'HRM-ATT-201') {
      created += 1;
    } else {
      errors.push({
        employeeId,
        code,
        status: post.status,
        apiCode: post.code,
        message: post.body?.message,
      });
    }
  }

  const listRes = await fetchJson(
    `${PORTAL}/api/hrm/attendance/records?company_id=main&page_size=10`,
    { headers },
  );
  const { total: listTotal, rows } = listPayload(listRes.body);

  const first = rows[0];
  let employeeProbe = null;
  if (first?.employee_id) {
    const probe = await fetchJson(
      `${PORTAL}/api/hrm/employees/${first.employee_id}?company_id=main`,
      { headers },
    );
    employeeProbe = {
      status: probe.status,
      code: probe.code,
      employee_id: first.employee_id,
    };
  }

  const result = {
    seed_tag: TAG,
    portal: PORTAL,
    pre_list_total: preTotal,
    employees_fetched: employees.length,
    employees_emp_total: empTotal,
    attendance_posted: created,
    skipped_cohort: skipped,
    errors_count: errors.length,
    errors_sample: errors.slice(0, 5),
    attendance_list_total: listTotal,
    employee_probe: employeeProbe,
    sample_row: first
      ? {
          id: first.id,
          employee_id: first.employee_id,
          company_id: first.company_id,
          attendance_date: first.attendance_date,
        }
      : null,
  };

  console.log(JSON.stringify(result, null, 2));

  const pass =
    listTotal >= 1 &&
    listRes.status === 200 &&
    listRes.code === 'HRM-ATT-200' &&
    employeeProbe?.status === 200 &&
    employeeProbe?.code === 'HRM-EMP-200';

  process.exit(pass ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
