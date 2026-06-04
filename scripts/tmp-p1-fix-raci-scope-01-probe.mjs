#!/usr/bin/env node
/** P1-FIX-RACI-SCOPE-01 — live probe: member UUID matrix 200 (not 409). */
import { loadDeployEnv } from './seed-env-loader.mjs';
import { portalLogin } from './lib/uat-http.mjs';

loadDeployEnv();
const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5175';

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

async function main() {
  const session = await portalLogin('ceo@xe.vn', 'Xevn@2026');
  const legal = await portalFetch('/api/xbos/org-foundation/legal-entities', {}, session);
  const items = legal.body?.data?.items ?? [];
  const member = items.find((r) => r?.tenant_id && r.tenant_id !== 'xevn' && /^[0-9a-f-]{36}$/i.test(String(r.id)));
  const memberId = member?.id;
  if (!memberId) {
    console.error('FAIL: no member legal entity UUID in list');
    process.exitCode = 1;
    return;
  }

  const matrixMain = await portalFetch('/api/xbos/raci-governance/companies/main/matrix', {}, session);
  const matrixMember = await portalFetch(
    `/api/xbos/raci-governance/companies/${memberId}/matrix`,
    {},
    session,
  );

  console.log('member_entity', { id: memberId, tenant_id: member?.tenant_id, name: member?.name });
  console.log('GET companies/main/matrix', matrixMain.status, matrixMain.code);
  console.log('GET companies/{uuid}/matrix', matrixMember.status, matrixMember.code, matrixMember.message);

  const scopePass = matrixMember.status === 200 && matrixMember.code === 'XBOS-RACI-200';
  const mainPass = matrixMain.status === 200 && matrixMain.code === 'XBOS-RACI-200';
  console.log(scopePass && mainPass ? 'PROBE_PASS' : 'PROBE_FAIL');
  process.exitCode = scopePass && mainPass ? 0 : 1;
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
