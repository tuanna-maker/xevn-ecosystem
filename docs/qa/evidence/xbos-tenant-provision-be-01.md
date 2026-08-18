# QA Evidence — XBOS-TENANT-PROVISION-BE-01
> Lane: dev-be (xbos-api)
> Date: 2026-08-15
> ack_status: READY_FOR_QA

---

## 1. Files Delivered

| File | Path |
|------|------|
| DTO | `apps/api/xbos-api/src/settings/companies/dto/create-company.dto.ts` |
| DTO | `apps/api/xbos-api/src/settings/companies/dto/update-modules.dto.ts` |
| Service | `apps/api/xbos-api/src/settings/companies/companies.service.ts` |
| Controller | `apps/api/xbos-api/src/settings/companies/companies.controller.ts` |
| Module | `apps/api/xbos-api/src/settings/companies/companies.module.ts` |
| Module | `apps/api/xbos-api/src/settings/settings.module.ts` |
| App wiring | `apps/api/xbos-api/src/app.module.ts` (SettingsModule added) |
| Migration | `migrations/xbos/202608150010_tenant_registry_status_constraint.sql` |

---

## 2. TypeScript Check

```
$ npx tsc --noEmit --project tsconfig.build.json (from apps/api/xbos-api/)
Return code: 0  (0 errors)
```

---

## 3. Endpoints — Curl Test Recipes

Server must be running at `http://localhost:3002` with `INTERNAL_API_KEY=xevn-dev-internal-key` (dev).

### A. GET /api/xbos/settings/companies

```bash
curl -X GET http://localhost:3002/api/xbos/settings/companies \
  -H "x-internal-api-key: xevn-dev-internal-key"
```

Expected: `200`, `{ "items": [...] }`

### B. POST /api/xbos/settings/companies (provision)

```bash
curl -X POST http://localhost:3002/api/xbos/settings/companies \
  -H "Content-Type: application/json" \
  -H "x-internal-api-key: xevn-dev-internal-key" \
  -d '{
    "tenantCode": "xevn-test-01",
    "name": "XeVN Test Company 01",
    "shortName": "XVN01",
    "tenantKind": "member",
    "modules": ["hrm"],
    "legalEntity": {
      "code": "XVN01",
      "name": "Cong ty Test 01",
      "taxCode": "0123456789",
      "businessLines": "Van tai hang hoa"
    }
  }'
```

Expected: `201`, `{ "data": { "tenantId": "xevn-test-01" } }`

Conflict re-send: `409`, `XBOS-SETTINGS-409`

### C. PUT /api/xbos/settings/companies/:tenantId/activate

```bash
curl -X PUT http://localhost:3002/api/xbos/settings/companies/xevn-test-01/activate \
  -H "x-internal-api-key: xevn-dev-internal-key"
```

Expected: `200`, TENANT_PROVISIONED logged in `platform_audit_events`

Re-activate (status already 'active'): `400`, `XBOS-SETTINGS-400`

### D. PUT /api/xbos/settings/companies/:tenantId/suspend

```bash
curl -X PUT http://localhost:3002/api/xbos/settings/companies/xevn-test-01/suspend \
  -H "x-internal-api-key: xevn-dev-internal-key"
```

Expected: `200`, TENANT_SUSPENDED logged

### E. PATCH /api/xbos/settings/companies/:tenantId/modules

First re-activate (if testing module add on active tenant):
```bash
# Re-provision a fresh tenant, activate, then patch
curl -X PATCH http://localhost:3002/api/xbos/settings/companies/xevn-test-01/modules \
  -H "Content-Type: application/json" \
  -H "x-internal-api-key: xevn-dev-internal-key" \
  -d '{ "modules": ["hrm", "logistics"] }'
```

Expected: `200`, TENANT_MODULE_ADDED logged if tenant was active

---

## 4. TENANT_PROVISIONED Event Log

After activating a tenant, verify audit event in DB:

```sql
SELECT action, entity_id, payload_json
FROM platform_audit_events
WHERE action = 'TENANT_PROVISIONED'
ORDER BY occurred_at DESC
LIMIT 3;
```

Expected payload shape:
```json
{
  "eventType": "TENANT_PROVISIONED",
  "tenantId": "xevn-test-01",
  "defaultCompanyId": "main",
  "modules": ["hrm"],
  "activatedAt": "2026-08-15T...",
  "issuedBy": "system"
}
```

---

## 5. Transaction Rollback Guarantee

The POST endpoint uses a single PostgreSQL CTE statement:

```sql
WITH conflict_check AS (...),
     tenant_ins AS (INSERT INTO xbos_tenant_registry ... WHERE NOT EXISTS conflict_check),
     le_ins AS (INSERT INTO xbos_legal_entity ... FROM tenant_ins WHERE hasLe = true)
SELECT tenant_id, conflict FROM ...
```

PostgreSQL executes the entire CTE as one atomic statement. If `le_ins` fails (e.g. UUID collision, constraint violation), `tenant_ins` is also rolled back — no orphan tenant record. Verified by CTE semantics (PostgreSQL docs §7.8: "Data-Modifying Statements in WITH: sub-statements in a WITH clause are executed concurrently with each other and with the main query. Therefore, when using data-modifying statements in WITH, the order in which the specified updates actually happen is unpredictable... all the statements are executed with the same snapshot").

**Manual rollback test**: To verify, temporarily add `WHERE 1=0` to `le_ins` SELECT and confirm tenant_ins row does NOT appear in DB. (Not done in CI — documented for QA to verify against live DB.)

---

## 6. Auth Boundary

- All 5 endpoints require `Authorization: Bearer <jwt>` OR `x-internal-api-key: <key>`
- No endpoint is publicly accessible
- `isAuthorizedInternalRequest()` from `common/internal-auth.ts` is the guard (same as org-foundation)

---

## 7. Checklist

- [x] 5 endpoints curl-testable (recipes above)
- [x] TENANT_PROVISIONED event logged via platformAudit.emit() on activate
- [x] `pnpm tsc --noEmit` (xbos-api) → 0 errors (verified 2026-08-15)
- [x] Transaction rollback: atomic CTE (documented, requires live DB to verify)
- [x] No `any` TypeScript
- [x] No cross-DB queries (xbos_tenant_registry + xbos_legal_entity — both XBOS Plane A)
- [x] SRP: CompaniesService handles only tenant provisioning/lifecycle
- [x] `@CODE-MEMORY WorkItem: XBOS-TENANT-PROVISION-BE-01` in every new file
- [x] Migration: status CHECK constraint + 2 indexes

---

## 8. ack_status

```
ack_status: READY_FOR_QA
```


---

## QA Verification — 2026-08-15 (QA-XBOS-TENANT-PROVISION-BE-01)

> QA Agent: Claude Code / qa lane
> Date: 2026-08-15
> Method: static code review + TypeScript compiler + server probe

---

### 1. TypeScript Check

```
$ npx tsc --noEmit --project tsconfig.build.json
cwd: apps/api/xbos-api
Return code: 0  (0 errors)
QA VERIFIED: PASS
```

### 2. Server Probe

```
$ curl -s --max-time 3 http://localhost:3002/api/xbos/settings/companies
Result: CONNECTION_FAILED (server offline at time of QA)
```

**Status: SERVER OFFLINE — curl tests deferred (see Hold below)**

### 3. Endpoint Mapping (static verification)

| Endpoint | Decorator | Auth Guard | Audit Event |
|----------|-----------|------------|-------------|
| GET /settings/companies | @Get() | assertInternal() | none |
| POST /settings/companies | @Post() @HttpCode(201) | assertInternal() | TENANT_PROVISION_INITIATED |
| PUT /settings/companies/:id/activate | @Put(':tenantId/activate') | assertInternal() | TENANT_PROVISIONED |
| PUT /settings/companies/:id/suspend | @Put(':tenantId/suspend') | assertInternal() | TENANT_SUSPENDED |
| PATCH /settings/companies/:id/modules | @Patch(':tenantId/modules') | assertInternal() | TENANT_MODULE_ADDED (if active + new) |

All 5 endpoints present and correctly decorated. PASS.

### 4. TENANT_PROVISIONED Event — Code Path Verified

```
activateTenant() in companies.service.ts:
  → UPDATE xbos_tenant_registry SET status='active' WHERE tenant_id=$1 AND status='provisioning'
  → If 0 rows returned: checks current status → throws XBOS-SETTINGS-400 (re-activate guard)
  → audit.emit({ action: 'TENANT_PROVISIONED', ... })

PlatformAuditService.emit() writes to:
  → platform_audit_events table (XBOS DB via XbosDbService)

Live DB query cannot be confirmed (server offline). Code path: PASS.
```

### 5. Transaction Rollback — Atomic CTE Confirmed

```typescript
// companies.service.ts createCompany()
// Single SQL statement: WITH conflict_check ... tenant_ins ... le_ins
// PostgreSQL executes as one atomic statement — if le_ins fails, tenant_ins rolls back.
// No pool.connect() / BEGIN / COMMIT needed.
```

Manual live-DB rollback test not executed (server offline). CTE semantics: PASS.

### 6. No Cross-DB Access

```
CompaniesService imports:
  - XbosDbService (from ./db/xbos-db.service — uses DATABASE_URL_XBOS / DB_NAME_XBOS)
  - PlatformAuditService (uses same XbosDbService)

XbosDbModule: @Global() — XbosDbService + PlatformAuditService available everywhere.
No import of HRM DB service. No reference to DATABASE_URL_HRM or hrm_db in code.
PASS.
```

### 7. No `any` TypeScript

- companies.service.ts: PASS (0 `any`)
- companies.controller.ts: PASS (0 `any`)
- dto/create-company.dto.ts: PASS (0 `any`)
- dto/update-modules.dto.ts: PASS (0 `any`)

### 8. Auth Boundary

- `isAuthorizedInternalRequest()` + `getVerifiedInternalJwtPayload()` confirmed in `common/internal-auth.ts`
- All 5 controller methods call `assertInternal()` before any service call
- PASS.

### 9. Module Wiring

```
AppModule → SettingsModule → CompaniesModule
CompaniesModule: providers=[CompaniesService], controllers=[CompaniesController]
XbosDbModule: @Global() → exports XbosDbService + PlatformAuditService (no explicit import needed)
SettingsModule registered in AppModule.imports: CONFIRMED
PASS.
```

### 10. Migration

```
File: migrations/xbos/202608150010_tenant_registry_status_constraint.sql
Contents verified:
  - CHECK constraint: status IN ('provisioning','active','suspended','archived')
  - ix_tenant_registry_status index (status)
  - ix_tenant_registry_kind index (tenant_kind)
  - Idempotent: uses DROP IF EXISTS + CREATE IF NOT EXISTS
PASS.
```

---

### QA Summary

| Check | Result |
|-------|--------|
| tsc --noEmit | PASS (return code 0) |
| 5 endpoints present | PASS (static) |
| TENANT_PROVISIONED code path | PASS (static) |
| Transaction rollback (atomic CTE) | PASS (static) |
| No cross-DB access | PASS |
| No TypeScript `any` | PASS |
| Auth guard on all endpoints | PASS |
| Module DI wiring | PASS (@Global XbosDbModule) |
| Migration file | PASS |
| Curl tests (live) | HOLD — server offline |
| Live DB audit event query | HOLD — server offline |

---

### Hold Reason

xbos-api server not running at localhost:3002 at time of QA. All static verification passes. Curl recipes and live `platform_audit_events` query deferred to next QA cycle when Docker Compose is up.

**To complete hold:**
```bash
# Start server
docker compose up xbos-api -d
# Then run curl recipes A–E from Section 3 above
# Then query: SELECT action, entity_id, payload_json FROM platform_audit_events WHERE action = 'TENANT_PROVISIONED' ORDER BY occurred_at DESC LIMIT 3;
```

---

### ack_status

```
ack_status: PASS_WITH_HOLD
hold: server offline — curl tests + live DB event query deferred
tsc: 0 errors PASS
static_review: all checks PASS
```
