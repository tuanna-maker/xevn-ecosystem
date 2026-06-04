#!/usr/bin/env node
/**
 * P1-CLOSE-BE-W5 — legal entity scope + workflow PUT + HRM service-requests page_size.
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

  const listLe = await portalFetch('/api/xbos/org-foundation/legal-entities', {}, session);
  const items = listLe.body?.data?.items ?? [];
  record('W5-LE-LIST', listLe.status === 200 && items.length > 0, listLe);

  const members = await portalFetch('/api/xbos/tenant-scope/group-member-units', {}, session);
  const entity = pickMember(members);
  let detail = { status: 0, code: 'skip' };
  if (entity?.id) {
    detail = await portalFetch(`/api/xbos/org-foundation/legal-entities/${entity.id}`, {}, session);
  }
  record('W5-LE-GET', Boolean(entity?.id) && detail.status === 200, { entityId: entity?.id, ...detail });

  const defs = await portalFetch('/api/xbos/workflow-engine/definitions?company_id=main', {}, session);
  const defItems = defs.body?.data?.items ?? defs.body?.data ?? [];
  const defRow = Array.isArray(defItems)
    ? defItems.find((d) => /^[0-9a-f-]{36}$/i.test(String(d?.id)))
    : null;
  let wfPut = { status: 0, code: 'skip' };
  if (defRow?.id) {
    const graph =
      defRow.graph && typeof defRow.graph === 'object'
        ? defRow.graph
        : { nodes: [{ id: 'start', type: 'start' }], edges: [] };
    wfPut = await portalFetch(`/api/xbos/workflow-engine/definitions/${defRow.id}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: defRow.name ?? 'QA WF',
        code: defRow.workflow_code ?? defRow.code ?? 'QA-WF',
        graph,
        status: defRow.status ?? 'active',
      }),
    }, session);
  }
  record('W5-WF-PUT', Boolean(defRow?.id) && wfPut.status === 200 && wfPut.code !== 'XBOS-SYS-001', wfPut);

  const svc = await portalFetch('/api/hrm/operations/service-requests?company_id=main&page_size=10', {}, session);
  record('W5-SVC-PAGE', svc.status === 200 && (svc.code === 'HRM-SVC-200' || svc.code === 'HRM-OPS-200'), svc);

  const failed = rows.filter((r) => !r.pass);
  console.log(`\n=== BE-W5 ${rows.length - failed.length}/${rows.length} PASS ===`);
  process.exitCode = failed.length ? 1 : 0;
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
