#!/usr/bin/env node
/**
 * Smoke tenant scope isolation (NFR P0.5).
 */
import { loadDeployEnv } from './seed-env-loader.mjs';

loadDeployEnv();

const hrmBase = `http://127.0.0.1:${process.env.HRM_BE_PORT ?? 28001}/api/hrm`;
const xbosBase = `http://127.0.0.1:${process.env.XBOS_BE_PORT ?? 28002}/api/xbos`;

async function loginMobile() {
  const res = await fetch(`${hrmBase}/auth/mobile/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-request-id': `iso-${Date.now()}` },
    body: JSON.stringify({
      email: process.env.MOBILE_PILOT_EMAIL ?? 'pilot.tourism@xe-vn.vn',
      password: process.env.MOBILE_PILOT_PASSWORD ?? 'Pilot@2026',
    }),
  });
  const body = await res.json();
  if (!res.ok || !body?.data?.access_token) {
    throw new Error(`login failed: ${res.status} ${JSON.stringify(body)}`);
  }
  return body.data;
}

async function expectScopeMismatch(token, tenantId, companyId) {
  const res = await fetch(`${hrmBase}/attendance/leave-requests?limit=1`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'x-tenant-id': tenantId,
      'x-company-id': companyId,
      'x-request-id': `iso-mismatch-${Date.now()}`,
    },
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, code: body?.code };
}

async function main() {
  const session = await loginMobile();
  const token = session.access_token;
  const tenant = session.tenant_id ?? session.tenantId;
  const company = session.company_id ?? session.companyId ?? session.default_company_id;

  const wrongTenant = tenant === 'xevn' ? 'other-tenant' : 'xevn';
  const mismatch = await expectScopeMismatch(token, wrongTenant, company);
  if (mismatch.status !== 409 && mismatch.status !== 403 && mismatch.status !== 400) {
    throw new Error(`expected scope mismatch, got ${mismatch.status} ${mismatch.code}`);
  }
  console.log('PASS tenant header mismatch →', mismatch.status, mismatch.code);

  const wrongCompany = company === 'main' ? '00000000-0000-4000-8000-000000000099' : 'main';
  const companyMismatch = await expectScopeMismatch(token, tenant, wrongCompany);
  if (companyMismatch.status !== 409 && companyMismatch.status !== 403 && companyMismatch.status !== 400) {
    throw new Error(`expected company mismatch, got ${companyMismatch.status} ${companyMismatch.code}`);
  }
  console.log('PASS company header mismatch →', companyMismatch.status, companyMismatch.code);

  const health = await fetch(`${xbosBase}/`, { headers: { 'x-request-id': `iso-health-${Date.now()}` } });
  if (!health.ok) throw new Error(`xbos health failed ${health.status}`);
  console.log('PASS xbos health');
}

main().catch((err) => {
  console.error('FAIL', err.message);
  process.exit(1);
});
