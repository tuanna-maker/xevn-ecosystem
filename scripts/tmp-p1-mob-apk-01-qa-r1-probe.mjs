#!/usr/bin/env node
/**
 * P1-MOB-APK-01-QA-R1 — J-MOB API proxy on pilot :3001 (du-lich.ceo@xe.vn)
 */
const PILOT = (process.env.HRM_API_BASE_URL ?? 'http://14.225.217.232:3001').replace(/\/+$/, '');
const email = process.env.HRM_MOBILE_EMAIL ?? 'du-lich.ceo@xe.vn';
const password = process.env.HRM_MOBILE_PILOT_PASSWORD ?? 'xevn-pilot';

async function req(path, init = {}) {
  const url = `${PILOT}/api/hrm${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = { _raw: text.slice(0, 200) };
  }
  return { status: res.status, body };
}

const results = [];

function row(jId, step, status, code, note = '') {
  results.push({ jId, step, status, code, note });
}

async function main() {
  const health = await req('/');
  row('NET', 'GET /api/hrm/', health.status, health.body?.code ?? '', health.body?.success ? 'ok' : 'fail');

  const login = await req('/auth/mobile/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  row('J-MOB-01', 'POST /auth/mobile/login', login.status, login.body?.code ?? '', `memberships=${login.body?.data?.memberships?.length ?? 0}`);
  if (!login.body?.success) {
    console.log(JSON.stringify({ pilot: PILOT, results }, null, 2));
    process.exit(1);
  }

  const token = login.body.data.access_token;
  const employeeId = login.body.data.employee?.id;
  const companyUuid = login.body.data.company_uuid;
  const scopeTenant = login.body.data.default_tenant_id ?? 'xe-du-lich';
  const scopeCompany = login.body.data.default_company_id ?? 'main';
  const authHeaders = {
    Authorization: `Bearer ${token}`,
    'x-tenant-id': scopeTenant,
    'x-company-id': scopeCompany,
  };

  const cid = companyUuid || scopeCompany;
  const today = new Date().toISOString().slice(0, 10);
  const records = await req(
    `/attendance/records?${new URLSearchParams({ company_id: cid, employee_id: employeeId, from: today, to: today }).toString()}`,
    { headers: authHeaders },
  );
  row('J-MOB-02', 'GET /attendance/records (today)', records.status, records.body?.code ?? '');

  const leaves = await req(
    `/attendance/leave-requests?${new URLSearchParams({ company_id: cid, employee_id: employeeId }).toString()}`,
    { headers: authHeaders },
  );
  row('J-MOB-03', 'GET /attendance/leave-requests', leaves.status, leaves.body?.code ?? '', `rows=${leaves.body?.data?.items?.length ?? leaves.body?.data?.length ?? '?'}`);

  const payslips = await req(
    `/payroll/payslips?${new URLSearchParams({ company_id: cid, employee_id: employeeId }).toString()}`,
    { headers: authHeaders },
  );
  row('J-MOB-04', 'GET /payroll/payslips', payslips.status, payslips.body?.code ?? '');

  const mgrQ = new URLSearchParams({ company_id: cid, status: 'pending', manager_employee_id: employeeId });
  const pendingLeave = await req(`/attendance/leave-requests?${mgrQ.toString()}`, { headers: authHeaders });
  row('J-MOB-05', 'GET leave-requests pending (manager)', pendingLeave.status, pendingLeave.body?.code ?? '');

  const pendingUpdate = await req(`/attendance/update-requests?${mgrQ.toString()}`, { headers: authHeaders });
  const d02 = pendingUpdate.status === 500 ? 'D-MOB-QA-02' : pendingUpdate.status >= 400 ? `HTTP ${pendingUpdate.status}` : '';
  row('J-MOB-05', 'GET update-requests pending (manager)', pendingUpdate.status, pendingUpdate.body?.code ?? '', d02);

  console.log(JSON.stringify({ pilot: PILOT, email, employeeId, scopeTenant, scopeCompany, results }, null, 2));
  const fail500 = pendingUpdate.status === 500;
  process.exit(fail500 ? 2 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
