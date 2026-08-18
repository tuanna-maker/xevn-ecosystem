# BA-CTR-TPL-8-CLAUSE-MAP-01-S7-BE-FIX-TENANT-01 — Evidence

`work_item_id`: `BA-CTR-TPL-8-CLAUSE-MAP-01-S7-BE-FIX-TENANT-01`
`lane`: dev-be
`date`: 2026-08-18
`ack_status`: `READY_FOR_QA`

---

## 1. Root cause (candidate #1 — REAL BUG)

The controller **never read `tenantId` at all**. It only declared
`@Headers('x-tenant-id') tenantId` and then called the service with
`tenantId ?? ''`. The probe sent the tenant id as a **query parameter**
(`?tenantId=xevn`), which NestJS never mapped to that parameter — so the
service received `''` and stored `tenant_id = ''`.

Candidate #2 (controller passes it, service ignores it) — **FALSE**: the
service is a pure passthrough; it binds `$2 = tenantId` verbatim into the
INSERT/UPDATE and the `ON CONFLICT (tenant_id, template_code, clause_id)`.
Verified by the multi-tenant probe: two different `tenantId` values produced
two distinct rows (different `id`s, different `created_at`s).

Candidate #3 (should call `resolveScopeContext` / `resolveTenantOnlyContext`
from `apps/api/hrm-api/src/common/scope-context.ts`) — **NOT REQUIRED FOR
THIS FIX**. `scope-context.ts` resolves the **JWT claim vs header/company
scope mismatch** (`SCOPE_CONTEXT_MISMATCH`) and is used by list/mutation
controllers that also need `companyId` (e.g. `attendance.controller.ts`
lines 317, 340, 358, 374, 389, 404, 421…). This endpoint is tenant-only
(`template_clause_override` has no `company_id` column per spec §1.1) and
already enforces scope through `isAuthorizedInternalRequest`. Adding
`resolveScopeContext` here would be scope-widening and out of band. The
existing convention for tenant-only, header-or-query scope is the
`@Query('tenantId')` + `@Headers('x-tenant-id')` fallback pattern used by
`catalog-sync.controller.ts` (lines 28-29, 47-48, 69-70, 91-92) and
`settings-catalogs.controller.ts` (lines 344-345).

### Files / lines

- `apps/api/hrm-api/src/contract-templates/contract-templates.controller.ts`
  - (before) `listClauses` / `getClause` / `upsertClause` / `softDeleteClause`
    all called `this.svc.*(..., tenantId ?? '')` where `tenantId` came from
    `@Headers('x-tenant-id')` only — query param `?tenantId=` was invisible.
  - (after) each handler now declares `@Query('tenantId') queryTenantId` and
    passes `queryTenantId ?? tenantId ?? ''` (query param first, header
    fallback, empty-string last — matches the rest of the HRM BE).

## 2. Diff summary

Single file edited: `apps/api/hrm-api/src/contract-templates/contract-templates.controller.ts`

- Added `Query` to the NestJS import.
- `listClauses`: `svc.listClauses(templateCode, queryTenantId ?? tenantId ?? '')`
- `getClause`:     `svc.getClause(templateCode, clauseId, queryTenantId ?? tenantId ?? '')`
- `upsertClause`:  `svc.upsertClause(templateCode, clauseId, queryTenantId ?? tenantId ?? '', dto)`
- `softDeleteClause`: `svc.softDeleteClause(templateCode, clauseId, queryTenantId ?? tenantId ?? '')`

No service change. No schema change. No new dependency. Diff is ~12 lines.

## 3. Live evidence (HRM BE on :28001, `x-internal-api-key: xevn-dev-internal-key`)

### BEFORE (reproduced)
```
PUT /api/hrm/contract-templates/XEVN_FT_12M_OFFICE/clauses/CTR-CLAUSE-009
    ?tenantId=xevn&companyId=xevn
-> 200 "item": { "id":"8e91ec28-...", "tenant_id":"", ... }
```
`tenant_id` was `""` even though `?tenantId=xevn` was on the URL.

### Multi-tenant isolation (BEFORE, real isolation bug)
Two `PUT`s with `?tenantId=xevn` and `?tenantId=xe-du-lich` both landed with
`tenant_id:""`, and the `ON CONFLICT (tenant_id, template_code, clause_id)`
key collapsed them onto **one row** — the second write overwrote the first.
Both tenants read back the same row.

### AFTER (live, PID 1615 — `pnpm run start:dev`, NestJS hot-reloaded)
```
PUT .../CTR-CLAUSE-009?tenantId=xevn&companyId=xevn
-> 200 "tenant_id":"xevn","override_text":"query-param text"

PUT .../CTR-CLAUSE-009?tenantId=xe-du-lich
-> 200 "tenant_id":"xe-du-lich","override_text":"q2 text"
   (new id 9c17d6b9-...; distinct row from xevn's 200175ef-...)

GET .../clauses?tenantId=xevn
-> [("xevn","CTR-CLAUSE-009","query-param text")]
   warnings = ["insurance_salary_vnd is required by law (BLL 2019 .168) ..."]   (soft warning, NOT a hard error)

GET .../clauses?tenantId=xe-du-lich
-> [("xe-du-lich","CTR-CLAUSE-009","q2 text")]   (separate row, confirmed)

GET .../clauses/CTR-CLAUSE-009?tenantId=xevn
-> "tenant_id":"xevn", warnings = [insurance_salary_vnd ...]

DELETE .../CTR-CLAUSE-009?tenantId=xe-du-lich -> 200, deleted_at set
DELETE .../CTR-CLAUSE-009?tenantId=xe-du-lich -> 404 (soft-delete isolation holds)
GET    .../CTR-CLAUSE-009?tenantId=xe-du-lich -> 404

GET /api/hrm/contract-templates/bound-codes
-> bind_count 6, [XEVN_FT_12M_OFFICE, XEVN_FT_24M_OFFICE, XEVN_INDEF_OFFICE,
   XEVN_FT_12M_DRIVER, XEVN_FT_24M_DRIVER, XEVN_INDEF_DRIVER]
```

Header form also verified during the probe: `x-tenant-id: xevn` PUT returned
`tenant_id:"xevn"`, so the header path still works (query param takes
precedence via `queryTenantId ?? tenantId`).

## 4. ack_status

`READY_FOR_QA` — bug fixed in code, BE hot-reloaded on :28001 (PID 1615),
and every acceptance check in the task ran green live.
