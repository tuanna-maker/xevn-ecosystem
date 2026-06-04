#!/usr/bin/env node
/**
 * P1-CLOSE-QA-W1B — portal-proxy L2 for FE-A2 + FE-W1B (delete after QA ack).
 */
import { loadDeployEnv } from './seed-env-loader.mjs';
import { portalLogin } from './lib/uat-http.mjs';

loadDeployEnv();
const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5175';
const SEG = process.env.W1B_SEGMENT_ID || '22f76620-23ee-42f2-a3f0-ed646683f902';

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

  // CC-05 / FE-A2 KPI
  const rollup = await portalFetch(
    `/api/xbos/kpi-engine/rollup?tenantId=xevn&companyId=main`,
    {},
    session,
  );
  record('L2-CC-05', 'KPI rollup main (no 409)', rollup.status === 200 && rollup.code === 'XBOS-KPI-202', rollup);

  const evaluate = await portalFetch(
    '/api/xbos/kpi-engine/evaluate-batch',
    { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({}) },
    session,
  );
  record('L2-CC-05b', 'KPI evaluate-batch', evaluate.status === 201 || evaluate.status === 200, evaluate);

  // FE-W1B CC-07 infra
  const infra = await portalFetch('/api/xbos/infrastructure/settings', {}, session);
  record('L2-CC-07', 'infrastructure/settings', infra.status === 200, infra);

  // FE-W1B CC-08 dept templates
  const deptTpl = await portalFetch('/api/xbos/dept_system_templates/items?tenant_id=xevn&company_id=main', {}, session);
  record('L2-CC-08', 'dept_system_templates items', deptTpl.status === 200, deptTpl);

  // FE-W1B CC-06 workflow definitions
  const wf = await portalFetch('/api/xbos/workflow-engine/definitions?company_id=main', {}, session);
  record('L2-CC-06', 'workflow-engine definitions', wf.status === 200, wf);

  // FE-A2 AR
  const ar = await portalFetch('/api/xbos/asset-requests?company_id=main', {}, session);
  record('L2-AR-01', 'asset-requests list', ar.status === 200, ar);

  // FE-W1B DASH cockpit data (rollup used by ExecutiveDashboardPage)
  const dashRollup = await portalFetch(
    `/api/xbos/kpi-engine/rollup?tenantId=xevn&companyId=main&period=month`,
    {},
    session,
  );
  record('L2-DASH-01', 'cockpit KPI rollup month', dashRollup.status === 200, dashRollup);

  const kpiDash = await portalFetch('/api/xbos/kpi-engine/dashboard-snapshot?companyId=main', {}, session);
  record('L2-DASH-02', 'kpi-dashboard snapshot', kpiDash.status === 200 || kpiDash.status === 404, kpiDash);

  // Org screens
  const tree = await portalFetch('/api/xbos/org-foundation/org-units/tree', {}, session);
  record('L2-ORG', 'org-units tree', tree.status === 200, tree);

  const legal = await portalFetch('/api/xbos/org-foundation/legal-entities', {}, session);
  record('L2-CC-01', 'legal-entities list', legal.status === 200, legal);

  // UC-XBOS-10 promote (W1B)
  const promote = await portalFetch(
    '/api/xbos/org-foundation/business-lines/promote',
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ segmentId: SEG, code: `BL-QA-${Date.now()}`, name: 'QA W1B BL' }),
    },
    session,
  );
  record(
    'L2-UC-XBOS-10',
    'business-lines/promote seeded segment',
    promote.status === 200 && promote.code === 'XBOS-ORG-202',
    promote,
  );

  // ECO-SCOPE: unauthenticated protected route
  const unauth = await fetch(`${PORTAL}/cockpit`, { redirect: 'manual' });
  const loc = unauth.headers.get('location') ?? '';
  record('L2-ECO-SCOPE-01', 'unauth /cockpit redirects login', unauth.status === 302 && loc.includes('/login'), {
    status: unauth.status,
    location: loc,
  });

  const failed = rows.filter((r) => !r.pass);
  console.log(`\n=== ${rows.length - failed.length}/${rows.length} PASS ===`);
  process.exitCode = failed.length ? 1 : 0;
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
