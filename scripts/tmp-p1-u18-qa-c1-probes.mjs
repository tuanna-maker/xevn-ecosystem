#!/usr/bin/env node
/** P1-U18-QA-C1 — HRM khối C live probes (BE-C1 + FE-C2 UC-HRM-20/21/26). */
import { loadDeployEnv, internalKey } from './seed-env-loader.mjs';
import { portalLogin, hrmApiBase } from './lib/uat-http.mjs';

loadDeployEnv();

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5175';
const email = process.env.UAT_PORTAL_EMAIL ?? 'ceo@xe.vn';
const password = process.env.PORTAL_DEV_PASSWORD ?? 'Xevn@2026';

const results = [];
let fails = 0;

function record(uc, name, pass, detail = {}) {
  results.push({ uc, name, pass, ...detail });
  const mark = pass ? 'PASS' : 'FAIL';
  console.log(`${mark}  ${uc}  ${name}  HTTP ${detail.status ?? '—'}  ${detail.code ?? ''}`);
  if (!pass) fails += 1;
}

async function hrmDirect(method, path, body, extraHeaders = {}) {
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'x-internal-api-key': internalKey(),
    Authorization: `Bearer ${globalThis.__token}`,
    ...extraHeaders,
  };
  const res = await fetch(`${hrmApiBase()}${path}`, {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, code: json?.code, body: json };
}

async function portalProxy(path) {
  const headers = {
    Accept: 'application/json',
    Authorization: `Bearer ${globalThis.__token}`,
    'x-internal-api-key': internalKey(),
  };
  const res = await fetch(`${PORTAL}${path}`, { headers });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, code: json?.code, body: json };
}

async function main() {
  console.log(`P1-U18-QA-C1 probes — HRM ${hrmApiBase()} · Portal ${PORTAL}\n`);
  const session = await portalLogin(email, password);
  globalThis.__token = session.access_token;
  const tenant = session.default_tenant_id ?? session.tenantId ?? 'xevn';
  const company = session.default_company_id ?? session.companyId ?? 'main';
  const scopeHeaders = { 'x-tenant-id': tenant, 'x-company-id': company };

  // --- FE-C2 / UC-HRM-20 dashboard ---
  const opSummaryDirect = await hrmDirect(
    'GET',
    `/operations/reports/summary?tenant_id=${tenant}&company_id=main`,
    null,
    scopeHeaders,
  );
  record(
    'UC-HRM-20',
    'GET operations/reports/summary (direct)',
    opSummaryDirect.status === 200 && opSummaryDirect.code === 'HRM-OPS-200',
    opSummaryDirect,
  );

  const opSummaryProxy = await portalProxy(
    `/api/hrm/operations/reports/summary?tenant_id=${tenant}&company_id=main`,
  );
  record(
    'UC-HRM-20',
    'GET operations/reports/summary (portal proxy)',
    opSummaryProxy.status === 200 && opSummaryProxy.code === 'HRM-OPS-200',
    opSummaryProxy,
  );

  // --- FE-C2 / UC-HRM-21 employees ---
  const empDirect = await hrmDirect(
    'GET',
    '/employees?company_id=main&page_size=100',
    null,
    scopeHeaders,
  );
  const empTotal = empDirect.body?.data?.total ?? empDirect.body?.data?.items?.length ?? 0;
  record(
    'UC-HRM-21',
    'GET employees page_size=100 (direct)',
    empDirect.status === 200 && empDirect.code === 'HRM-EMP-200',
    { ...empDirect, total: empTotal },
  );

  const empProxy = await portalProxy('/api/hrm/employees?company_id=main&page_size=100');
  record(
    'UC-HRM-21',
    'GET employees (portal proxy P-CC-03)',
    empProxy.status === 200 && empProxy.code === 'HRM-EMP-200',
    empProxy,
  );

  // --- FE-C2 / UC-HRM-26 metadata queue ---
  const mdListDirect = await hrmDirect(
    'GET',
    '/employee-metadata/change-requests?company_id=main&status=pending',
    null,
    scopeHeaders,
  );
  record(
    'UC-HRM-26',
    'GET metadata change-requests pending (direct)',
    mdListDirect.status === 200 && mdListDirect.code === 'HRM-META-200',
    mdListDirect,
  );

  const mdListProxy = await portalProxy(
    '/api/hrm/employee-metadata/change-requests?company_id=main&status=pending',
  );
  record(
    'UC-HRM-26',
    'GET metadata change-requests (portal proxy)',
    mdListProxy.status === 200 && mdListProxy.code === 'HRM-META-200',
    mdListProxy,
  );

  // --- BE-C1 cluster probes ---
  const mdScope = await hrmDirect(
    'GET',
    '/employee-metadata/change-requests?company_id=main',
    null,
    {
      Authorization: `Bearer ${globalThis.__token}`,
      'x-tenant-id': tenant,
      'x-company-id': 'holding',
      'x-internal-api-key': internalKey(),
    },
  );
  record(
    'HRM-MD-SCOPE',
    'metadata list scope mismatch',
    mdScope.status === 409 && mdScope.code === 'SCOPE_CONTEXT_MISMATCH',
    mdScope,
  );

  const imTemplate = await hrmDirect(
    'GET',
    '/spreadsheet/templates/employee_import?format=csv&company_id=main',
    null,
    scopeHeaders,
  );
  record(
    'HRM-IM-04',
    'GET spreadsheet template',
    imTemplate.status === 200,
    imTemplate,
  );

  const imLimits = await hrmDirect('GET', '/spreadsheet/limits?company_id=main', null, scopeHeaders);
  record(
    'HRM-IM-LIMITS',
    'GET spreadsheet limits',
    imLimits.status === 200 && imLimits.code === 'SHEET-200',
    imLimits,
  );

  const opTasks = await hrmDirect('GET', '/operations/tasks?company_id=main', null, scopeHeaders);
  record(
    'HRM-OP-02',
    'GET operations/tasks',
    opTasks.status === 200 && opTasks.code === 'HRM-OPS-200',
    opTasks,
  );

  const pfCycles = await hrmDirect('GET', '/performance/cycles?company_id=main', null, scopeHeaders);
  record(
    'HRM-PF-02',
    'GET performance/cycles',
    pfCycles.status === 200 && pfCycles.code === 'HRM-PERF-200',
    pfCycles,
  );

  const pfEval = await hrmDirect('GET', '/performance/evaluations?company_id=main', null, scopeHeaders);
  record(
    'HRM-PF-04',
    'GET performance/evaluations',
    pfEval.status === 200 && pfEval.code === 'HRM-PERF-200',
    pfEval,
  );

  console.log(`\n=== Summary: ${fails === 0 ? 'ALL PASS' : `${fails} FAIL`} / ${results.length} probes ===`);
  if (fails > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
