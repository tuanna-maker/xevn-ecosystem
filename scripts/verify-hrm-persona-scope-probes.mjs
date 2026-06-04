#!/usr/bin/env node
/**
 * Persona scope probes for HRM-FIDELITY-BE-SCOPE (group CEO main rollup).
 * work_item_id: HRM-FIDELITY-BE-SCOPE
 */
import { loadDeployEnv } from './seed-env-loader.mjs';
import { portalLogin } from './lib/uat-http.mjs';

loadDeployEnv();

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5175';
const password = process.env.PORTAL_DEV_PASSWORD ?? 'Xevn@2026';

async function probe(email, label) {
  const session = await portalLogin(email, password);
  const tenant = session.defaultTenantId ?? session.default_tenant_id ?? 'xevn';
  const company = session.defaultCompanyId ?? session.default_company_id ?? 'main';
  const token = session.access_token ?? session.accessToken;
  const headers = {
    Authorization: `Bearer ${token}`,
    'x-tenant-id': tenant,
    'x-company-id': company,
    Accept: 'application/json',
  };

  const paths = [
    ['/api/hrm/employees?company_id=main&page_size=100', 'employees'],
    ['/api/hrm/contracts-insurance/contracts?company_id=main', 'contracts'],
    ['/api/hrm/contracts-insurance/insurance/expiring?company_id=main', 'insurance-expiring'],
    ['/api/hrm/recruitment/requisitions?company_id=main&page_size=100', 'requisitions'],
    ['/api/hrm/attendance/records?company_id=main&page_size=100', 'attendance'],
  ];

  const rows = {};
  for (const [path, key] of paths) {
    const res = await fetch(`${PORTAL}${path}`, { headers });
    const body = await res.json().catch(() => ({}));
    const total = body?.data?.total ?? body?.meta?.total ?? body?.data?.data?.length ?? 0;
    rows[key] = { http: res.status, total: Number(total) };
  }

  return { label, email, tenant, company, role: session.roleCode, rows };
}

async function main() {
  const results = [];
  results.push(await probe('ceo@xe.vn', 'group-ceo'));
  results.push(await probe('du-lich.ceo@xe.vn', 'member-ceo'));

  let fail = 0;
  console.log('verify-hrm-persona-scope-probes\n');
  for (const r of results) {
    console.log(`## ${r.label} (${r.email}) tenant=${r.tenant} company=${r.company}`);
    for (const [k, v] of Object.entries(r.rows)) {
      const pass =
        v.http === 200 &&
        (k === 'insurance-expiring'
          ? true
          : k === 'employees'
            ? v.total >= 100
            : v.total > 0);
      if (r.label === 'group-ceo' && !pass) fail += 1;
      console.log(`  ${pass ? 'PASS' : 'FAIL'}  ${k}  HTTP ${v.http}  total=${v.total}`);
    }
    console.log('');
  }

  const groupContracts = results[0]?.rows?.contracts?.total ?? 0;
  if (groupContracts <= 0) fail += 1;

  console.log(fail === 0 ? '=== Persona probes PASS ===' : `=== Persona probes FAIL (${fail}) ===`);
  process.exit(fail === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
