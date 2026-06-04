#!/usr/bin/env node
/**
 * P1-RESID-C-QA-01 — J-MOB-03/04/05 detail + approve after C03 seed
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { repoRoot } from './seed-env-loader.mjs';

const BASE = (process.env.HRM_API_BASE_URL ?? 'http://127.0.0.1:28001').replace(/\/+$/, '');
const email = 'du-lich.ceo@xe.vn';
const password = process.env.HRM_MOBILE_PILOT_PASSWORD ?? 'xevn-pilot';

async function req(path, init = {}) {
  const res = await fetch(`${BASE}/api/hrm${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

function items(body) {
  const d = body?.data;
  if (Array.isArray(d?.items)) return d.items;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d)) return d;
  return [];
}

async function main() {
  const seedIds = JSON.parse(
    readFileSync(resolve(repoRoot, 'docs/qa/evidence/p1-resid-c03-probe-20260530.json'), 'utf8'),
  );
  const results = [];
  let pass = true;

  const login = await req('/auth/mobile/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (!login.body?.success) {
    console.error('login failed', login.status);
    process.exit(1);
  }
  const token = login.body.data.access_token;
  const employeeId = login.body.data.employee?.id;
  const companyUuid = login.body.data.company_uuid;
  const authHeaders = {
    Authorization: `Bearer ${token}`,
    'x-tenant-id': login.body.data.default_tenant_id ?? 'xe-du-lich',
    'x-company-id': login.body.data.default_company_id ?? 'main',
  };
  const cid = companyUuid || authHeaders['x-company-id'];

  const leaveId =
    seedIds?.ids?.leave ?? items(
      (
        await req(
          `/attendance/leave-requests?${new URLSearchParams({ company_id: cid, employee_id: employeeId })}`,
          { headers: authHeaders },
        )
      ).body,
    )[0]?.id;
  const leaveList = await req(
    `/attendance/leave-requests?${new URLSearchParams({ company_id: cid, employee_id: employeeId })}`,
    { headers: authHeaders },
  );
  const leaveRow = items(leaveList.body).find((r) => r.id === leaveId);
  const j03 = leaveList.status === 200 && leaveRow;
  results.push({
    jId: 'J-MOB-03',
    step: 'list + detail row by seeded id',
    status: leaveList.status,
    code: leaveList.body?.code,
    pass: Boolean(j03),
    note: `leaveId=${leaveId}`,
  });
  if (!j03) pass = false;

  const payCompanyId = authHeaders['x-company-id'] ?? 'main';
  const payList = await req(
    `/payroll/payslips?${new URLSearchParams({ company_id: payCompanyId, employee_id: employeeId })}`,
    { headers: authHeaders },
  );
  const payRows = items(payList.body);
  const payId = seedIds?.ids?.payslip ?? payRows[0]?.id;
  const payRow = payRows.find((r) => r.id === payId);
  const j04 = payList.status === 200 && payRow;
  results.push({
    jId: 'J-MOB-04',
    step: 'list + detail payslip by seeded id',
    status: payList.status,
    code: payList.body?.code,
    pass: Boolean(j04),
    note: `payslipId=${payId}`,
  });
  if (!j04) pass = false;

  const mgrQ = new URLSearchParams({ company_id: cid, status: 'pending', manager_employee_id: employeeId });
  const pending = await req(`/attendance/update-requests?${mgrQ}`, { headers: authHeaders });
  const updId = seedIds?.ids?.update_request ?? items(pending.body)[0]?.id;
  const j05List = pending.status === 200 && items(pending.body).length >= 1;
  results.push({
    jId: 'J-MOB-05',
    step: 'GET pending update-requests (manager)',
    status: pending.status,
    code: pending.body?.code,
    pass: j05List,
    note: `pending=${items(pending.body).length}`,
  });
  if (!j05List) pass = false;

  let approveOk = false;
  if (updId) {
    const approveHeaders = {
      ...authHeaders,
      'x-company-id': companyUuid || authHeaders['x-company-id'],
    };
    const approve = await req(`/attendance/update-requests/${updId}/approve`, {
      method: 'POST',
      headers: approveHeaders,
      body: JSON.stringify({ approver_name: 'QA P1-RESID-C-QA-01' }),
    });
    approveOk = approve.status >= 200 && approve.status < 300;
    results.push({
      jId: 'J-MOB-05',
      step: 'POST update-requests/:id/approve',
      status: approve.status,
      code: approve.body?.code,
      pass: approveOk,
      note: `requestId=${updId}`,
    });
    if (!approveOk) pass = false;
  }

  const out = {
    work_item_id: 'P1-RESID-C-QA-01',
    date: '2026-05-30',
    base: BASE,
    email,
    pass,
    results,
  };
  writeFileSync(
    resolve(repoRoot, 'docs/qa/evidence/p1-resid-c03-jmob-probe-20260530.json'),
    `${JSON.stringify(out, null, 2)}\n`,
  );
  console.log(JSON.stringify(out, null, 2));
  process.exit(pass ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
