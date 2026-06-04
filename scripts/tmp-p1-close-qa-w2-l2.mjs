#!/usr/bin/env node
/**
 * P1-CLOSE-QA-W2 — portal-proxy L2 (delete after QA ack).
 */
import { loadDeployEnv } from './seed-env-loader.mjs';
import { portalLogin } from './lib/uat-http.mjs';

loadDeployEnv();
const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5175';
const SEG = process.env.W1B_SEGMENT_ID || '7a58129a-731b-453d-859e-997efa52e051';

const rows = [];
function record(id, name, pass, detail = {}) {
  rows.push({ id, name, pass, ...detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${id}  ${name}${detail.status != null ? ` HTTP ${detail.status}` : ''}${detail.code ? ` ${detail.code}` : ''}`);
}

async function portalFetch(path, init = {}, session) {
  const headers = {
    Accept: 'application/json',
    Authorization: `Bearer ${session.access_token}`,
    'x-tenant-id': session.defaultTenantId ?? session.default_tenant_id ?? 'xevn',
    'x-company-id': session.defaultCompanyId ?? session.default_company_id ?? 'main',
    ...(init.headers ?? {}),
  };
  const res = await fetch(`${PORTAL}${path}`, { ...init, headers: { ...headers, ...init.headers } });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body, code: body?.code };
}

async function main() {
  const session = await portalLogin('ceo@xe.vn', 'Xevn@2026');

  // FE-W2 HRM embed (non-pilot)
  const reports = await portalFetch('/api/hrm/operations/reports/summary?tenant_id=xevn&company_id=main', {}, session);
  record('L2-W2-REPORTS', 'HRM reports summary embed', reports.status === 200 && reports.code === 'HRM-OPS-200', reports);

  const tasks = await portalFetch('/api/hrm/operations/tasks?company_id=main&page_size=10', {}, session);
  record(
    'L2-W2-TASKS',
    'HRM tasks list embed',
    tasks.status === 200 && (tasks.code === 'HRM-OPS-200' || tasks.body?.code === 'HRM-OPS-200'),
    tasks,
  );

  const svc = await portalFetch('/api/hrm/operations/service-requests?company_id=main&page_size=10', {}, session);
  record('L2-W2-SERVICES', 'HRM internal-services list', svc.status === 200, svc);

  // CC-03/04 legal entity (FE-A2)
  const legal = await portalFetch('/api/xbos/org-foundation/legal-entities', {}, session);
  const first = Array.isArray(legal.body?.data) ? legal.body.data[0] : legal.body?.data?.[0];
  const entityId = first?.id ?? first?.company_id;
  record('L2-CC-01-LIST', 'legal-entities list (CC-01/03)', legal.status === 200, legal);

  let detailGet = { status: 0, code: 'skip' };
  if (entityId) {
    detailGet = await portalFetch(`/api/xbos/org-foundation/legal-entities/${entityId}`, {}, session);
  }
  record(
    'L2-CC-03-DETAIL',
    'legal-entity GET by id (CC-03)',
    !entityId || (detailGet.status === 200 && detailGet.code === 'XBOS-ORG-200'),
    detailGet,
  );

  // UC-XBOS-10 promote (accept 200 or 201)
  const promote = await portalFetch(
    '/api/xbos/org-foundation/business-lines/promote',
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ segmentId: SEG, code: `BL-QA-W2-${Date.now()}`, name: 'QA W2 BL' }),
    },
    session,
  );
  record(
    'L2-UC-XBOS-10',
    'business-lines/promote live',
    (promote.status === 200 || promote.status === 201) && promote.code === 'XBOS-ORG-202',
    promote,
  );

  // CC-08 corrected path
  const deptTpl = await portalFetch(
    '/api/xbos/business-master/dept_system_templates/items?tenant_id=xevn&company_id=main',
    {},
    session,
  );
  record('L2-CC-08', 'dept_system_templates items', deptTpl.status === 200, deptTpl);

  const failed = rows.filter((r) => !r.pass);
  console.log(`\n=== ${rows.length - failed.length}/${rows.length} PASS ===`);
  process.exitCode = failed.length ? 1 : 0;
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
