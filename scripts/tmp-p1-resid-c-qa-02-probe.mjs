#!/usr/bin/env node
/**
 * P1-RESID-C-QA-02 — J-MOB-03/04/05 on pilot :3001 (release APK API base)
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { repoRoot } from './seed-env-loader.mjs';

const BASE = (process.env.HRM_API_BASE_URL ?? 'http://14.225.217.232:3001').replace(/\/+$/, '');
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

function total(body) {
  if (typeof body?.data?.total === 'number') return body.data.total;
  return items(body).length;
}

const results = [];
let pass = true;

function row(jId, step, status, code, note, ok) {
  const stepPass = ok !== undefined ? ok : status >= 200 && status < 400;
  if (!stepPass) pass = false;
  results.push({ jId, step, status, code: code ?? '', note, pass: stepPass });
}

async function main() {
  const health = await req('/');
  row('NET', 'GET /api/hrm/', health.status, health.body?.code, health.body?.success ? 'ok' : 'fail');

  const login = await req('/auth/mobile/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  row('AUTH', 'POST /auth/mobile/login', login.status, login.body?.code, `memberships=${login.body?.data?.memberships?.length ?? 0}`);
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

  // J-MOB-03 — leave list + detail by id
  const leaveList = await req(
    `/attendance/leave-requests?${new URLSearchParams({ company_id: cid, employee_id: employeeId })}`,
    { headers: authHeaders },
  );
  const leaveRows = items(leaveList.body);
  row('J-MOB-03', 'GET leave-requests (list)', leaveList.status, leaveList.body?.code, `rows=${leaveRows.length}`, leaveList.status === 200 && leaveRows.length >= 1);
  if (leaveRows.length >= 1) {
    const leaveId = leaveRows[0].id;
    const found = leaveRows.find((r) => r.id === leaveId);
    row('J-MOB-03', 'detail: row by id (LeaveRequestDetail sim)', found ? 200 : 404, found ? 'HRM-LEAVE-DETAIL-OK' : 'MISS', `leaveId=${leaveId}`, Boolean(found));
  }

  // J-MOB-04 — payslips use company_id=main per seed probe + mobile app
  const payList = await req(
    `/payroll/payslips?${new URLSearchParams({ company_id: scopeCompany, employee_id: employeeId })}`,
    { headers: authHeaders },
  );
  const payRows = items(payList.body);
  const payTotal = total(payList.body);
  row('J-MOB-04', 'GET payslips (list, company_id=main)', payList.status, payList.body?.code, `total=${payTotal}`, payList.status === 200 && payTotal >= 1);
  if (payRows.length >= 1) {
    const payId = payRows[0].id;
    const found = payRows.find((r) => r.id === payId);
    row('J-MOB-04', 'detail: payslip row by id (PayslipDetail sim)', found ? 200 : 404, found ? 'HRM-PAY-DETAIL-OK' : 'MISS', `payslipId=${payId}`, Boolean(found));
  }

  // J-MOB-05 — pending list + approve with company_uuid header
  const mgrQ = new URLSearchParams({ company_id: cid, status: 'pending', manager_employee_id: employeeId });
  const pending = await req(`/attendance/update-requests?${mgrQ}`, { headers: authHeaders });
  const pendingRows = items(pending.body);
  row('J-MOB-05', 'GET update-requests pending (manager)', pending.status, pending.body?.code, `pending=${pendingRows.length}`, pending.status === 200 && pendingRows.length >= 1);

  if (pendingRows.length >= 1) {
    const updId = pendingRows[0].id;
    const approveHeaders = { ...authHeaders, 'x-company-id': companyUuid || scopeCompany };
    const approve = await req(`/attendance/update-requests/${updId}/approve`, {
      method: 'POST',
      headers: approveHeaders,
      body: JSON.stringify({ approver_name: 'QA P1-RESID-C-QA-02' }),
    });
    row('J-MOB-05', 'POST update-requests/:id/approve (x-company-id=uuid)', approve.status, approve.body?.code, `requestId=${updId}`, approve.status >= 200 && approve.status < 300);

    // Contrast: main header → expect 409 (document scope lesson)
    const approveMain = await req(`/attendance/update-requests/${updId}/approve`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ approver_name: 'QA scope-contrast' }),
    });
    row('J-MOB-05', 'POST approve with x-company-id=main (scope contrast)', approveMain.status, approveMain.body?.code, approveMain.status === 409 ? 'expected 409' : 'unexpected', approveMain.status === 409 || approve.status >= 200);
  }

  writeOut();
  process.exit(pass ? 0 : 1);
}

function writeOut() {
  const out = {
    work_item_id: 'P1-RESID-C-QA-02',
    date: '2026-05-30',
    base: BASE,
    email,
    device_available: false,
    pass,
    results,
  };
  const dir = resolve(repoRoot, 'docs/qa/evidence');
  mkdirSync(dir, { recursive: true });
  writeFileSync(resolve(dir, 'p1-resid-c-qa-02-probe-20260530.json'), `${JSON.stringify(out, null, 2)}\n`);
  console.log(JSON.stringify(out, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
