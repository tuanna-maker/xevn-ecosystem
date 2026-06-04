#!/usr/bin/env node
/**
 * MOB-404 / MOB-QA-02 — API smoke for HRM mobile backlog.
 */
import { loadDeployEnv } from './seed-env-loader.mjs';
import { stableUuid } from './lib/stable-uuid.mjs';

loadDeployEnv();

const port = process.env.HRM_BE_PORT ?? '28001';
const base = (process.env.HRM_API_BASE_URL ?? `http://127.0.0.1:${port}`).replace(/\/+$/, '');
const tenant = process.env.HRM_TENANT_ID ?? 'xe-du-lich';
const company = process.env.HRM_COMPANY_ID ?? 'main';
const email = process.env.HRM_MOBILE_EMAIL ?? 'du-lich.ceo@xe.vn';
const password = process.env.HRM_MOBILE_PILOT_PASSWORD ?? 'xevn-pilot';
async function req(path, init = {}) {
  const url = `${base}/api/hrm${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'x-tenant-id': tenant,
      'x-company-id': company,
      ...(init.headers ?? {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  return { res, body };
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function main() {
  const health = await req('/');
  assert(health.body?.success === true, 'health failed');

  const login = await req('/auth/mobile/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  assert(login.body?.success === true, `login failed: ${login.body?.code}`);
  const token = login.body.data.access_token;
  const employeeId = login.body.data.employee.id;
  const companyUuid =
    login.body.data.company_uuid ??
    process.env.HRM_COMPANY_UUID ??
    stableUuid(`hrm-scope:${login.body.data.default_tenant_id ?? tenant}:${login.body.data.default_company_id ?? company}`);
  assert(Array.isArray(login.body.data.roles), 'roles missing');

  const scopeTenant = login.body.data.default_tenant_id ?? tenant;
  const scopeCompany = login.body.data.default_company_id ?? company;
  const authHeaders = {
    Authorization: `Bearer ${token}`,
    'x-tenant-id': scopeTenant,
    'x-company-id': scopeCompany,
  };
  const leaves = await req(
    `/attendance/leave-requests?company_id=${encodeURIComponent(companyUuid)}&employee_id=${encodeURIComponent(employeeId)}`,
    { headers: authHeaders },
  );
  assert(leaves.body?.success === true, `leave list failed: ${leaves.res.status} ${leaves.body?.code ?? ''}`);

  const payslips = await req(
    `/payroll/payslips?company_id=${encodeURIComponent(scopeCompany)}&employee_id=${encodeURIComponent(employeeId)}`,
    { headers: authHeaders },
  );
  assert(payslips.body?.success === true, `payslips failed: ${payslips.res.status} ${payslips.body?.code ?? ''}`);

  console.log('MOB smoke OK:', { base, email, employeeId });
}

main().catch((e) => {
  console.error('MOB smoke FAIL:', e.message);
  process.exit(1);
});
