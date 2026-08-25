#!/usr/bin/env node
import { createHmac } from 'node:crypto';
import { loadDeployEnv } from '../seed-env-loader.mjs';

function signJwt(claims) {
  const secret = process.env.SERVICE_JWT_SECRET ?? 'xevn-dev-jwt-secret';
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    ...claims,
    iss: process.env.SERVICE_JWT_ISSUER ?? 'xevn-internal',
    aud: process.env.SERVICE_JWT_AUDIENCE ?? 'xevn-api',
    iat: now,
    exp: now + 3600,
  };
  const payloadPart = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = createHmac('sha256', secret).update(`${header}.${payloadPart}`).digest('base64url');
  return `${header}.${payloadPart}.${sig}`;
}

function group(lines) {
  const byEmployee = new Map();
  for (const line of lines) {
    const employeeId = String(line.employeeId ?? line.employee_id ?? '').trim();
    const code = String(line.componentCode ?? line.component_code ?? '').trim();
    if (!employeeId || !code) continue;
    const bucket = byEmployee.get(employeeId) ?? {};
    bucket[code] = (bucket[code] ?? 0) + Number(line.amount ?? 0);
    byEmployee.set(employeeId, bucket);
  }
  return byEmployee;
}

loadDeployEnv();
const periodId = 'a4e896b6-6b22-4c0f-80e3-0acda5ee2810';
const token = signJwt({
  sub: 'ceo@xe.vn',
  email: 'ceo@xe.vn',
  tenant_id: 'xevn',
  company_id: 'main',
  role_code: 'group_ceo',
});
const base = process.env.HRM_API_URL ?? 'http://127.0.0.1:28001';

async function get(path) {
  const res = await fetch(`${base}/api/hrm${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'x-tenant-id': 'xevn',
      'x-company-id': 'main',
    },
  });
  const body = await res.json();
  return { status: res.status, body };
}

const payslips = await get(`/payroll/payslips?company_id=main&period_id=${periodId}`);
const slipData = payslips.body?.data?.data ?? payslips.body?.data ?? [];
console.log('payslips', slipData.map((r) => ({ code: r.employee_code, gross: r.gross_amount })));

for (const slip of slipData) {
  const perEmp = await get(
    `/payroll/periods/${periodId}/input-lines?company_id=main&employee_id=${slip.employee_id}&limit=500`,
  );
  const empData = perEmp.body?.data ?? perEmp.body;
  const empItems = empData?.items ?? empData;
  console.log(`\n${slip.employee_code} per-employee lines`, Array.isArray(empItems) ? empItems.length : 0);
  if (Array.isArray(empItems)) {
    console.log('  components', group(empItems).get(slip.employee_id));
  }
}
