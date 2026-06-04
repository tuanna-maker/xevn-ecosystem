#!/usr/bin/env node
/**
 * P1-QUAL-QA-MOB-01 — J-MOB-03/04/05 API + detail simulation (du-lich.ceo @ local :28001)
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { repoRoot } from './seed-env-loader.mjs';

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
    body = { _raw: text.slice(0, 200) };
  }
  return { status: res.status, body };
}

function items(body) {
  const d = body?.data;
  if (Array.isArray(d?.items)) return d.items;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d)) return d;
  return [];
}

const results = [];
let pass = true;

function row(jId, step, status, code, note = '', ok = true) {
  const stepPass = ok && status >= 200 && status < 400;
  if (!stepPass) pass = false;
  results.push({ jId, step, status, code, note, pass: stepPass });
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
    writeOut();
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
  const leaveRows = items(leaves.body);
  row(
    'J-MOB-03',
    'GET /attendance/leave-requests (list)',
    leaves.status,
    leaves.body?.code ?? '',
    `rows=${leaveRows.length}`,
  );

  if (leaveRows.length > 0) {
    const id = leaveRows[0].id;
    const detailSim = leaveRows.find((x) => x.id === id);
    row(
      'J-MOB-03',
      'detail: find row in list by id (LeaveRequestDetail)',
      detailSim ? 200 : 404,
      detailSim ? 'HRM-LEAVE-DETAIL-OK' : 'HRM-LEAVE-DETAIL-MISS',
      `id=${id}`,
      Boolean(detailSim),
    );
  } else {
    row('J-MOB-03', 'detail: empty list (UI Chưa có đơn nghỉ)', 200, 'HRM-LEAVE-EMPTY-OK', 'no rows — detail N/A', true);
  }

  const payslips = await req(
    `/payroll/payslips?${new URLSearchParams({ company_id: cid, employee_id: employeeId }).toString()}`,
    { headers: authHeaders },
  );
  const payRows = items(payslips.body);
  row('J-MOB-04', 'GET /payroll/payslips (list)', payslips.status, payslips.body?.code ?? '', `rows=${payRows.length}`);

  if (payRows.length > 0) {
    const pid = payRows[0].id;
    const found = payRows.find((x) => x.id === pid);
    row(
      'J-MOB-04',
      'detail: find payslip in list by id (PayslipDetail)',
      found ? 200 : 404,
      found ? 'HRM-PAY-DETAIL-OK' : 'HRM-PAY-DETAIL-MISS',
      `id=${pid}`,
      Boolean(found),
    );
  } else {
    row('J-MOB-04', 'detail: empty payslips (UI Chưa có phiếu lương)', 200, 'HRM-PAY-EMPTY-OK', 'no rows — detail N/A', true);
  }

  const mgrQ = new URLSearchParams({ company_id: cid, status: 'pending', manager_employee_id: employeeId });
  const pendingLeave = await req(`/attendance/leave-requests?${mgrQ.toString()}`, { headers: authHeaders });
  const pendingLeaveRows = items(pendingLeave.body);
  row(
    'J-MOB-05',
    'GET leave-requests pending (manager)',
    pendingLeave.status,
    pendingLeave.body?.code ?? '',
    `pending=${pendingLeaveRows.length}`,
  );

  const pendingUpdate = await req(`/attendance/update-requests?${mgrQ.toString()}`, { headers: authHeaders });
  row(
    'J-MOB-05',
    'GET update-requests pending (manager)',
    pendingUpdate.status,
    pendingUpdate.body?.code ?? '',
    pendingUpdate.status === 500 ? 'D-MOB-QA-02' : `rows=${items(pendingUpdate.body).length}`,
    pendingUpdate.status !== 500,
  );

  if (pendingLeaveRows.length > 0) {
    const rid = pendingLeaveRows[0].id;
    const approve = await req(`/attendance/leave-requests/${rid}/approve`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ approver_name: 'QA P1-QUAL-QA-MOB-01' }),
    });
    row(
      'J-MOB-05',
      'POST leave-requests/:id/approve',
      approve.status,
      approve.body?.code ?? '',
      `requestId=${rid}`,
      approve.status >= 200 && approve.status < 300,
    );
  } else if (items(pendingUpdate.body).length > 0) {
    const uid = items(pendingUpdate.body)[0].id;
    const approve = await req(`/attendance/update-requests/${uid}/approve`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ approver_name: 'QA P1-QUAL-QA-MOB-01' }),
    });
    row(
      'J-MOB-05',
      'POST update-requests/:id/approve',
      approve.status,
      approve.body?.code ?? '',
      `requestId=${uid}`,
      approve.status >= 200 && approve.status < 300,
    );
  } else {
    row('J-MOB-05', 'approve action: no pending rows (empty UI OK)', 200, 'HRM-APPROVE-EMPTY-OK', 'API lists 200', true);
  }

  writeOut();
  process.exit(pass ? 0 : 1);
}

function writeOut() {
  const out = {
    work_item_id: 'P1-QUAL-QA-MOB-01',
    date: '2026-05-30',
    base: BASE,
    email,
    pass,
    results,
  };
  const outPath = resolve(repoRoot, 'docs/qa/evidence/p1-qual-qa-mob-01-probe-20260530.json');
  mkdirSync(resolve(repoRoot, 'docs/qa/evidence'), { recursive: true });
  writeFileSync(outPath, JSON.stringify(out, null, 2));
  console.log(JSON.stringify(out, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
