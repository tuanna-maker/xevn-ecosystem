#!/usr/bin/env node
/**
 * HRM catalog-sync pull all holding keys + bulk sync-from-xbos.
 * work_item_id: P1-U18-DO-B1
 */
import { loadDeployEnv, xbosBase, hrmBase, internalKey } from './seed-env-loader.mjs';

loadDeployEnv();

const tenantId = process.env.MASTER_TENANT_ID ?? 'xevn';
const companyId = process.env.HRM_GROUP_CATALOG_COMPANY ?? 'holding';

async function main() {
  const scopeHeaders = {
    'x-internal-api-key': internalKey(),
    'x-tenant-id': tenantId,
    'x-company-id': companyId,
    'content-type': 'application/json',
  };

  const listRes = await fetch(
    `${xbosBase()}/api/xbos/config-sync/catalogs?target=hrm&tenantId=${tenantId}&companyId=${companyId}`,
    { headers: scopeHeaders },
  );
  const listJson = await listRes.json();
  if (!listRes.ok || !listJson.success) {
    console.error('List catalogs failed', listRes.status, listJson);
    process.exit(1);
  }
  const catalogs = listJson.data?.data ?? listJson.data?.catalogs ?? [];
  const keys = catalogs.map((c) => c.key).filter(Boolean);
  console.log(`Upstream target=hrm keys: ${keys.length}`);

  const pullResults = [];
  for (const key of keys) {
    const res = await fetch(`${hrmBase()}/api/hrm/catalog-sync/pull/${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: scopeHeaders,
      body: '{}',
    });
    const json = await res.json().catch(() => ({}));
    pullResults.push({ key, status: res.status, ok: res.ok && json.success !== false, code: json.code });
  }

  const bulkRes = await fetch(`${hrmBase()}/api/hrm/settings-catalogs/sync-from-xbos`, {
    method: 'POST',
    headers: scopeHeaders,
    body: '{}',
  });
  const bulkJson = await bulkRes.json();

  const pulledOk = pullResults.filter((r) => r.ok).length;
  console.log(
    JSON.stringify(
      {
        success: pulledOk === keys.length && bulkRes.ok,
        upstream_keys: keys.length,
        pull_ok: pulledOk,
        pull_fail: pullResults.filter((r) => !r.ok),
        bulk_sync: { status: bulkRes.status, code: bulkJson.code, pulledKeys: bulkJson.data?.pulledKeys?.length },
      },
      null,
      2,
    ),
  );
  if (pulledOk < keys.length || !bulkRes.ok) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
