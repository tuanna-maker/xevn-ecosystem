#!/usr/bin/env node
/**
 * P1-RESID-C03 — probe mobile list APIs for du-lich.ceo (total >= 1).
 */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadDeployEnv, repoRoot } from './seed-env-loader.mjs';

loadDeployEnv();

const BASE = (process.env.HRM_API_BASE_URL ?? 'http://127.0.0.1:28001').replace(/\/+$/, '');
const email = process.env.HRM_MOBILE_EMAIL ?? 'du-lich.ceo@xe.vn';
const password = process.env.HRM_MOBILE_PILOT_PASSWORD ?? 'xevn-pilot';

async function req(path, init = {}) {
  const url = `${BASE}/api/hrm${path}`;
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
    body = { _raw: text.slice(0, 300) };
  }
  return { status: res.status, body };
}

function total(body) {
  if (typeof body?.data?.total === 'number') return body.data.total;
  if (Array.isArray(body?.data?.data)) return body.data.data.length;
  if (Array.isArray(body?.data?.items)) return body.data.items.length;
  if (Array.isArray(body?.data)) return body.data.length;
  return 0;
}

async function main() {
  const probes = [];
  let pass = true;

  const login = await req('/auth/mobile/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (!login.body?.success) {
    console.error('login failed', login.status, login.body?.code);
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

  const leaves = await req(
    `/attendance/leave-requests?${new URLSearchParams({ company_id: cid, employee_id: employeeId }).toString()}`,
    { headers: authHeaders },
  );
  const leaveTotal = total(leaves.body);
  const leaveOk = leaves.status === 200 && leaveTotal >= 1;
  probes.push({ api: 'GET /attendance/leave-requests', status: leaves.status, total: leaveTotal, pass: leaveOk });
  if (!leaveOk) pass = false;

  const payslips = await req(
    `/payroll/payslips?${new URLSearchParams({ company_id: scopeCompany, employee_id: employeeId }).toString()}`,
    { headers: authHeaders },
  );
  const payTotal = total(payslips.body);
  const payOk = payslips.status === 200 && payTotal >= 1;
  probes.push({ api: 'GET /payroll/payslips', status: payslips.status, total: payTotal, pass: payOk });
  if (!payOk) pass = false;

  const mgrQ = new URLSearchParams({ company_id: cid, status: 'pending', manager_employee_id: employeeId });
  const pendingUpdate = await req(`/attendance/update-requests?${mgrQ.toString()}`, { headers: authHeaders });
  const updTotal = total(pendingUpdate.body);
  const updOk = pendingUpdate.status === 200 && updTotal >= 1;
  probes.push({
    api: 'GET /attendance/update-requests?status=pending&manager_employee_id',
    status: pendingUpdate.status,
    total: updTotal,
    pass: updOk,
  });
  if (!updOk) pass = false;

  const out = {
    work_item_id: 'P1-RESID-C03',
    date: '2026-05-30',
    base: BASE,
    email,
    pass,
    probes,
  };
  writeFileSync(resolve(repoRoot, 'docs/qa/evidence/p1-resid-c03-probe-20260530.json'), `${JSON.stringify(out, null, 2)}\n`);
  console.log(JSON.stringify(out, null, 2));
  process.exit(pass ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
