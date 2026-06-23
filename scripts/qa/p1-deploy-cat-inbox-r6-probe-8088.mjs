#!/usr/bin/env node
/**
 * P1-DEPLOY-CAT-INBOX-R6-8088 — catalog extension → workflowInstanceId + inbox smoke (U65 no seed).
 */
const PORTAL = (process.env.PORTAL_DEV_URL || 'http://14.225.217.232:8088').replace(/\/+$/, '');
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

async function hrmApi(token, path, { method = 'GET', body, tenantId = 'xevn', companyId = 'holding' } = {}) {
  const r = await fetch(`${PORTAL}/api/hrm${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'x-tenant-id': tenantId,
      'x-company-id': companyId,
      'x-user-id': EMAIL,
      Accept: 'application/json',
      ...(body ? { 'content-type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await r.json().catch(() => ({}));
  return { ok: r.ok, status: r.status, json };
}

async function xbosApi(token, path, { method = 'GET', body } = {}) {
  const r = await fetch(`${PORTAL}/api/xbos${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'x-tenant-id': 'xevn',
      'x-company-id': 'holding',
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
  const code = `devops_r6_${stamp}`;
  const token = await login();
  console.log('PASS  login XBOS-AUTH-200');

  const inboxBefore = await xbosApi(
    token,
    `/catalog-governance/inbox?assigneeUserId=${encodeURIComponent(EMAIL)}&tenantId=xevn&companyId=holding`,
  );
  const beforeCount = Array.isArray(inboxBefore.json?.data?.items)
    ? inboxBefore.json.data.items.length
    : 0;
  console.log(
    `${inboxBefore.ok ? 'PASS' : 'FAIL'}  GET inbox (before) HTTP ${inboxBefore.status} count=${beforeCount}`,
  );

  const ext = await hrmApi(token, '/settings-catalogs/positions/extension-items', {
    method: 'POST',
    tenantId: 'xevn',
    companyId: 'holding',
    body: {
      items: [{ code, label: `DevOps R6 ${stamp}`, status: 'active' }],
    },
  });
  const wfId = ext.json?.data?.workflowInstanceId ?? ext.json?.data?.workflow_instance_id ?? null;
  const extPass =
    ext.ok &&
    ext.status === 201 &&
    ext.json?.code === 'HRM-SET-209' &&
    wfId != null &&
    String(wfId).length > 0;
  console.log(
    `${extPass ? 'PASS' : 'FAIL'}  POST extension-items HTTP ${ext.status} code=${ext.json?.code} workflowInstanceId=${wfId ?? 'null'}`,
  );

  await new Promise((r) => setTimeout(r, 3000));

  const inboxAfter = await xbosApi(
    token,
    `/catalog-governance/inbox?assigneeUserId=${encodeURIComponent(EMAIL)}&tenantId=xevn&companyId=holding`,
  );
  const afterItems = Array.isArray(inboxAfter.json?.data?.items) ? inboxAfter.json.data.items : [];
  const inboxPass = inboxAfter.ok && afterItems.length > beforeCount;
  console.log(
    `${inboxPass ? 'PASS' : 'WARN'}  GET inbox (after) HTTP ${inboxAfter.status} before=${beforeCount} after=${afterItems.length}`,
  );

  const out = {
    executedAt: new Date().toISOString(),
    portal: PORTAL,
    extensionCode: code,
    extensionHttp: ext.status,
    extensionCodeResp: ext.json?.code,
    workflowInstanceId: wfId,
    workflowInstanceIdNotNull: wfId != null && String(wfId).length > 0,
    inboxBeforeCount: beforeCount,
    inboxAfterCount: afterItems.length,
    spawnPass: extPass,
    inboxSpawnPass: inboxPass,
  };
  console.log('JSON_RESULT', JSON.stringify(out));

  process.exit(extPass && inboxBefore.ok && inboxAfter.ok ? 0 : 1);
}

main().catch((e) => {
  console.error('FAIL', e.message);
  process.exit(1);
});
