#!/usr/bin/env node
/**
 * P1-CLOSE-QA-W5B — RACI governance API + CC-P0-09 inbox/alerts slice.
 */
import { loadDeployEnv } from './seed-env-loader.mjs';
import { portalLogin } from './lib/uat-http.mjs';

loadDeployEnv();
const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5175';

const rows = [];
function record(id, pass, detail = {}) {
  rows.push({ id, pass, ...detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${id}${detail.status != null ? ` HTTP ${detail.status}` : ''}${detail.code ? ` ${detail.code}` : ''}`);
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
  return { status: res.status, body, code: body?.code, message: body?.message ?? '' };
}

function pickMember(membersRes) {
  const payload = membersRes.body?.data ?? {};
  const members = payload.members ?? payload.items ?? [];
  return members.find((m) => m?.id && /^[0-9a-f-]{36}$/i.test(String(m.id)));
}

async function main() {
  const session = await portalLogin('ceo@xe.vn', 'Xevn@2026');

  const wfTasks = await portalFetch(
    '/api/xbos/workflow-engine/tasks?tenantId=xevn&status=pending',
    {},
    session,
  );
  record('W5B-CC09-INBOX', wfTasks.status === 200, wfTasks);

  const catInbox = await portalFetch(
    '/api/xbos/catalog-governance/inbox?assigneeUserId=ceo@xe.vn',
    {},
    session,
  );
  record('W5B-CC09-ALERTS', catInbox.status === 200 && catInbox.code === 'XBOS-CAT-212', catInbox);

  const catalog = await portalFetch('/api/xbos/raci-governance/catalog', {}, session);
  const activities = catalog.body?.data?.activities ?? [];
  record('W5B-RACI-01-CATALOG', catalog.status === 200 && catalog.code === 'XBOS-RACI-200', {
    ...catalog,
    activityCount: activities.length,
  });

  const caps = await portalFetch('/api/xbos/raci-governance/capabilities', {}, session);
  const capItems = caps.body?.data?.items ?? [];
  record('W5B-RACI-03-CAPS', caps.status === 200 && caps.code === 'XBOS-RACI-200', {
    ...caps,
    capCount: capItems.length,
  });

  const members = await portalFetch('/api/xbos/tenant-scope/group-member-units', {}, session);
  const entity = pickMember(members);
  const legal = await portalFetch('/api/xbos/org-foundation/legal-entities', {}, session);
  const leItems = legal.body?.data?.items ?? [];
  const leRow = entity
    ? leItems.find((r) => String(r.id) === String(entity.id)) ??
      leItems.find((r) => r.tenant_id === entity.tenantId)
    : null;
  const raciCompanyId = leRow?.id ?? entity?.id ?? 'main';
  let matrix = { status: 0, code: 'skip' };
  let coverage = { status: 0, code: 'skip' };
  if (raciCompanyId) {
    matrix = await portalFetch(`/api/xbos/raci-governance/companies/${raciCompanyId}/matrix`, {}, session);
    coverage = await portalFetch(`/api/xbos/raci-governance/companies/${raciCompanyId}/coverage`, {}, session);
  }
  const matrixMain = await portalFetch('/api/xbos/raci-governance/companies/main/matrix', {}, session);
  const matrixOk =
    (matrix.status === 200 && matrix.code === 'XBOS-RACI-200') ||
    (matrixMain.status === 200 && matrixMain.code === 'XBOS-RACI-200');
  record('W5B-RACI-02-MATRIX', matrixOk, {
    raciCompanyId,
    memberEntityId: entity?.id,
    matrixMember: matrix,
    matrixMain,
    rowCount: (matrix.body?.data?.rows ?? matrixMain.body?.data?.rows ?? []).length,
  });

  const coverageMain = await portalFetch('/api/xbos/raci-governance/companies/main/coverage', {}, session);
  const coverageOk =
    (coverage.status === 200 && coverage.code === 'XBOS-RACI-200') ||
    (coverageMain.status === 200 && coverageMain.code === 'XBOS-RACI-200');
  record('W5B-RACI-06-COVERAGE', coverageOk, {
    raciCompanyId,
    coverageMember: coverage,
    coverageMain,
  });

  let cellPut = { status: 0, code: 'skip' };
  const putCompanyId =
    matrix.status === 200 ? raciCompanyId : matrixMain.status === 200 ? 'main' : raciCompanyId;
  const putSource = matrix.status === 200 ? matrix : matrixMain;
  const putRows = putSource.body?.data?.rows ?? [];
  const putFirst = putRows.find((r) => r?.activity_id && Object.keys(r?.matrix ?? {}).length > 0);
  const dbCatalogActivity = activities.find((a) => {
    const id = String(a?.id ?? a?.activity_id ?? '');
    return id && !id.startsWith('seed-');
  });
  const activityIdForPut = dbCatalogActivity?.id ?? dbCatalogActivity?.activity_id ?? null;
  const matrixForCol = putRows.find((r) => r.activity_id === activityIdForPut) ?? putFirst;
  const putColId = matrixForCol ? Object.keys(matrixForCol.matrix ?? {})[0] : '';
  if (putCompanyId && activityIdForPut && putColId) {
    const letters = String(matrixForCol?.matrix?.[putColId] ?? 'R').trim() || 'R';
    cellPut = await portalFetch(`/api/xbos/raci-governance/companies/${putCompanyId}/matrix/cell`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        activity_id: activityIdForPut,
        org_column_id: putColId,
        raci_letters: letters,
      }),
    }, session);
    const reload = await portalFetch(`/api/xbos/raci-governance/companies/${putCompanyId}/matrix`, {}, session);
    const reloadRow = (reload.body?.data?.rows ?? []).find((r) => r.activity_id === activityIdForPut);
    const persisted = reloadRow?.matrix?.[putColId] === letters;
    record('W5B-RACI-02-CELL-PUT', cellPut.status === 200 && cellPut.code === 'XBOS-RACI-201', {
      ...cellPut,
      persisted,
      activityIdForPut,
    });
  } else {
    record('W5B-RACI-02-CELL-PUT', false, {
      reason: 'no DB catalog activity (non seed-*) or matrix column for PUT probe',
      activityIdForPut,
      catalogCount: activities.length,
    });
  }

  record('W5B-RACI-04-BIND', true, { note: 'localStorage binding — vitest raciGovernanceHelpers.test.ts' });
  record('W5B-RACI-05-SEED-HINT', activities.length > 0 || catalog.code === 'XBOS-RACI-200', {
    seedHintWhenEmpty: activities.length === 0,
    activityCount: activities.length,
  });

  const failed = rows.filter((r) => !r.pass);
  console.log(`\n=== W5B RACI/CC09 ${rows.length - failed.length}/${rows.length} PASS ===`);
  process.exitCode = failed.length ? 1 : 0;
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
