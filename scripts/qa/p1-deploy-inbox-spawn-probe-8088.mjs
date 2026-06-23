#!/usr/bin/env node
/**
 * P1-BROWSER-E2E-INBOX-DEPLOY-8088 — UF-XBOS-08 inbox spawn smoke (U65 no seed).
 * POST active workflow definition → pending task for ceo@xe.vn exists.
 */
const PORTAL = (process.env.PORTAL_DEV_URL || 'http://14.225.217.232:8088').replace(/\/+$/, '');
const XBOS = (process.env.XBOS_HEALTH_URL || 'http://14.225.217.232:28002/api/xbos').replace(/\/+$/, '');
const EMAIL = 'ceo@xe.vn';
const PASSWORD = 'Xevn@2026';

async function login() {
  const r = await fetch(`${PORTAL}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`login HTTP ${r.status} ${j?.code ?? ''}`);
  const token = j?.data?.accessToken ?? j?.accessToken;
  if (!token) throw new Error('login missing token');
  return token;
}

async function xbosApi(token, path, { method = 'GET', body, companyId = 'main' } = {}) {
  const r = await fetch(`${PORTAL}/api/xbos${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'x-tenant-id': 'xevn',
      'x-company-id': companyId,
      Accept: 'application/json',
      ...(body ? { 'content-type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await r.json().catch(() => ({}));
  return { ok: r.ok, status: r.status, json };
}

async function main() {
  const stamp = Date.now();
  const token = await login();
  console.log('PASS  login XBOS-AUTH-200');

  const before = await xbosApi(
    token,
    `/workflow-engine/tasks?tenantId=xevn&status=pending&assigneeUserId=${encodeURIComponent(EMAIL)}&businessType=workflow_definition_review`,
  );
  const beforeCount = Array.isArray(before.json?.data?.items) ? before.json.data.items.length : 0;
  console.log(
    `${before.ok ? 'PASS' : 'FAIL'}  GET pending definition-review tasks (before) HTTP ${before.status} count=${beforeCount}`,
  );

  const wfCode = `DO-INBOX-${stamp}`;
  const create = await xbosApi(token, '/workflow-engine/definitions', {
    method: 'POST',
    companyId: 'main',
    body: {
      workflowCode: wfCode,
      name: `DevOps Inbox Spawn ${stamp}`,
      status: 'active',
      graph: {
        steps: [
          { id: 'wf-step-1', order: 1, handlerRoleId: 'dept_head', taskName: 'Trưởng BP duyệt' },
          { id: 'wf-step-2', order: 2, handlerRoleId: 'bod', taskName: 'HĐQT phê duyệt' },
        ],
      },
    },
  });
  const defId = create.json?.data?.id;
  console.log(
    `${create.ok && create.status === 201 && defId ? 'PASS' : 'FAIL'}  POST active definition HTTP ${create.status} code=${create.json?.code} id=${defId ?? 'none'}`,
  );
  if (!create.ok || !defId) process.exit(1);

  await new Promise((r) => setTimeout(r, 1500));

  const after = await xbosApi(
    token,
    `/workflow-engine/tasks?tenantId=xevn&status=pending&assigneeUserId=${encodeURIComponent(EMAIL)}&businessType=workflow_definition_review`,
  );
  const afterItems = Array.isArray(after.json?.data?.items) ? after.json.data.items : [];
  const spawned = afterItems.filter(
    (t) => String(t.business_id ?? t.businessId ?? '') === String(defId) || afterItems.length > beforeCount,
  );
  const passSpawn = after.ok && afterItems.length > beforeCount;
  console.log(
    `${passSpawn ? 'PASS' : 'FAIL'}  pending tasks after create HTTP ${after.status} before=${beforeCount} after=${afterItems.length} spawnedForDef=${spawned.length > 0}`,
  );

  const direct = await fetch(
    `${XBOS}/workflow-engine/tasks?tenantId=xevn&status=pending&assigneeUserId=${encodeURIComponent(EMAIL)}`,
    { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } },
  );
  const directJson = await direct.json().catch(() => ({}));
  const directCount = Array.isArray(directJson?.data?.items) ? directJson.data.items.length : 0;
  console.log(
    `${direct.ok ? 'PASS' : 'FAIL'}  direct :28002 tasks HTTP ${direct.status} count=${directCount}`,
  );

  const proxyMetrics = await fetch(`${PORTAL}/api/xbos/metrics`);
  const hrmProxy = await fetch(`${PORTAL}/api/hrm/metrics`);
  console.log(
    `${proxyMetrics.ok ? 'PASS' : 'FAIL'}  portal proxy xbos metrics HTTP ${proxyMetrics.status}`,
  );
  console.log(`${hrmProxy.ok ? 'PASS' : 'FAIL'}  portal proxy hrm metrics HTTP ${hrmProxy.status}`);

  const out = {
    executedAt: new Date().toISOString(),
    portal: PORTAL,
    definitionId: defId,
    workflowCode: wfCode,
    beforePendingCount: beforeCount,
    afterPendingCount: afterItems.length,
    spawnPass: passSpawn,
    directTaskCount: directCount,
    portalXbosMetrics: proxyMetrics.status,
    portalHrmMetrics: hrmProxy.status,
  };
  console.log('JSON_RESULT', JSON.stringify(out));

  process.exit(passSpawn && create.ok && before.ok && after.ok && direct.ok ? 0 : 1);
}

main().catch((e) => {
  console.error('FAIL', e.message);
  process.exit(1);
});
