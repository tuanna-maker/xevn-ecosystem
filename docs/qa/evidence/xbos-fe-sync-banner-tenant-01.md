# XBOS-FE-SYNC-BANNER-TENANT-01 — Live Evidence

work_item_id: `XBOS-FE-SYNC-BANNER-TENANT-01`
lane: dev-fe
date: 2026-08-18
ack_status: READY_FOR_QA

## Symptom (verified live)
`http://localhost:5176/settings/companies` → banner "XBOS API Sync — Failed to fetch" permanently.

## Root cause (confirmed, not re-verified)
`XbosApiSyncBanner.tsx` → `syncXbosCatalogs('xbos')` → `listXbosCatalogsForTarget('xbos')`
→ `GET /api/xbos/config-sync/catalogs?target=xbos` with **no tenant id / company id**.
XBOS BE `ConfigSyncController.listCatalogsForSystem` → `resolveXbosGroupLegalReadScopeContext`
→ `resolveScopeContext` → `assertScopeId(undefined, 'tenantId')` throws `SCOPE_TENANT_REQUIRED`
→ 400 → `fetch` rejects → banner `error` state. Company table itself is fine (different endpoint).

## Fix (FE only, `apps/web/x-bos-core/src/**`)
No BE / DB / dependency changes.

### 1. `apps/web/x-bos-core/src/integrations/xbosApi.ts`
`listXbosCatalogsForTarget` and `syncXbosCatalogs` gained an optional
`scope?: { tenantId?: string; companiesId?: string }` param. When provided the
request builds `?target=...&tenantId=...&companiesId=...` via `URLSearchParams`.
Wire names match the BE exactly: `@Query('tenantId')` / `@Query('companiesId')`
in `apps/api/xbos-api/src/config-sync/config-sync.controller.ts`.

```ts
export async function listXbosCatalogsForTarget(
  target: 'xbos' | 'hrm' = 'xbos',
  scope?: { tenantId?: string; companiesId?: string },
) {
  const params = new URLSearchParams({ target });
  if (scope?.tenantId) params.set('tenantId', scope.tenantId);
  if (scope?.companiesId) params.set('companiesId', scope.companiesId);
  const data = await xbosRequest<{ data: XbosCatalog[] }>(`/api/xbos/config-sync/catalogs?${params}`, {
    method: 'GET',
  });
  return data.data;
}

export async function syncXbosCatalogs(
  target: 'xbos' | 'hrm' = 'xbos',
  scope?: { tenantId?: string; companiesId?: string },
) {
  await bootstrapXbosCatalogs();
  return listXbosCatalogsForTarget(target, scope);
}
```

### 2. `apps/web/x-bos-core/src/components/layout/XbosApiSyncBanner.tsx`
Forward the master-tenant scope the banner already assumed (`DEFAULT_TENANT`):

```ts
const DEFAULT_TENANT = 'xevn';
const DEFAULT_COMPANY = 'holding';
...
const catalogs = await syncXbosCatalogs('xbos', { tenantId: DEFAULT_TENANT, companiesId: DEFAULT_COMPANY });
hydrateCatalogsFromApi(catalogs, DEFAULT_TENANT);
```

`xevn` / `holding` are the values the BE resolves to for the group holding row
(`XBOS_MASTER_TENANT_ID = 'xevn'`, `XBOS_GROUP_LEGAL_HOLDING = 'holding'`,
`xbos-group-legal-scope.ts`), so no mismatch path is triggered.

## Live curl evidence (BE on :3002, internal key)
Before fix:
```
GET /api/xbos/config-sync/catalogs?target=xbos
-> 400 {"success":false,"code":"SCOPE_TENANT_REQUIRED","message":"tenantId is required"}
GET ...?target=xbos&tenantId=xevn
-> 400 {"success":false,"code":"SCOPE_COMPANY_REQUIRED","message":"companyId is required"}
```
After fix (FE now sends both):
```
$ curl -s -H "x-internal-api-key: xevn-dev-internal-key"     "http://127.0.0.1:3002/api/xbos/config-sync/catalogs?target=xbos&tenantId=xevn&companiesId=holding"
-> 200 {"success":true,"code":"XBOS-CFG-202","message":"Catalogs listed",
   "data":{"total":74,"target":"xbos","tenantId":"xevn","companiesId":"holding","data":[...]}}
$ curl -s -H "x-internal-api-key: xevn-dev-internal-key"     "http://127.0.0.1:3002/api/xbos/config-sync/catalogs?target=xbos&tenantId=xevn&companiesId=main"
-> 200 {"success":true,"code":"XBOS-CFG-202","message":"Catalogs listed",
   "data":{"total":92,"target":"xbos","tenantId":"xevn","companiesId":"main","data":[...]}}
```

## Browser banner state after
`http://localhost:5176/settings/companies` → banner shows **CONNECTED** with
`Đã đồng bộ 74 danh mục từ API XBOS.` and a populated `Sync gần nhất: ...` line.
No "Failed to fetch" / "ERROR". The "Sync lại" button still works.

## Verification method
- FE restarted: killed the old `node` on port 5176 (PID 15260), started
  `npx vite --port 5176` from `apps/web/x-bos-core`; confirmed port 5176 free
  before start and listening after.
- Live curl against the running BE (no DB seed, no new dependency).
- Browser check of the banner text after restart.

## Scope
Allowed paths only: `apps/web/x-bos-core/src/**`. No `apps/api/**`,
no `apps/web/hrm/**`, no policy-pack / ContractCreate / contracts-insurance /
payroll touched. No DB seed. No new dependencies.
