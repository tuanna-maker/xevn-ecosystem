# Phase 1 — Scope parity audit (list ↔ GET-by-id)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-PHASE1-SA-SCOPE-PARITY-01`, promotion `PCOMP-W3-SA-02` |
| **Auditor** | SA (governance) |
| **Date** | 2026-06-04 (initial audit); **2026-06-07** (P0-1..P0-4 promoted **Y**) |
| **Status** | Complete — **all P0 closed**; QA evidence `PCOMP-W3-QA-03`, corroborated `PCOMP-W3-QA-04` |
| **Normative ADRs** | [`ADR-GROUP-CEO-MAIN-HOLDING-SCOPE.md`](ADR-GROUP-CEO-MAIN-HOLDING-SCOPE.md), [`docs/decisions/ADR-HRM-RBAC-SCOPE-LADDER.md`](../decisions/ADR-HRM-RBAC-SCOPE-LADDER.md) |

---

## 1. Audit rule (U19 / TM gate)

For each in-scope module:

1. **List** and **GET-by-id** (or UUID-keyed read) must apply the **same scope resolver** (or equivalent row guard derived from that resolver).
2. Group CEO JWT `tenantId=xevn`, `companyId=main` must not filter operational HRM rows on `company_id='main'` alone; rollup uses `HRM_GROUP_MEMBER_COMPANY_SLUGS` via `resolveHrmListScope`.
3. Catalog / KPI / XBOS legal surfaces use **named ADR helpers** (`resolveHrmSettingsCatalogCompanyId`, `resolveKpiRollupScopeContext`, `resolveXbosGroupLegalReadScopeContext`) — not ad-hoc `company_id = JWT` in SQL.
4. Mutate-by-id must call `assertResourceInHrmScope` (HRM) or partition assert (XBOS legal) after resolving list scope.

**Evidence method:** static grep + controller/service read-through; regression specs cited where present.

---

## 2. Summary matrix

| Module | List resolver | GET-by-id resolver | Parity | Notes |
|--------|---------------|-------------------|--------|-------|
| HRM employees | `resolveHrmListScope` | `resolveHrmListScope` + `pushEmployeeListScopeFilters` | **Y** | P0-2 restore scoped — evidence **2026-06-07** (`PCOMP-W3-QA-03`) |
| HRM contracts | `resolveHrmListScope` | `resolveHrmListScope` + `pushCompanyIdFilter` | **Y** | Spec: `contracts-insurance.service.spec.ts` |
| XBOS org-foundation legal-entities | `resolveXbosGroupLegalReadScopeContext` | `assertJwtMayReadLegalEntityPartition` after partition resolve | **Y** | P0-1 closed — evidence **2026-06-07** (`PCOMP-W3-QA-03`) |
| XBOS KPI rollup | `resolveKpiRollupScopeContext` | N/A (single GET `rollup`) | **Y** | No separate id route |
| HRM settings-catalogs (overview) | `resolveScopeContext` + `resolveHrmSettingsCatalogCompanyId` | N/A (overview only) | **Y** | ADR `main`→`holding` |
| HRM catalog-sync | `resolveHrmCatalogSyncScope` → `resolveHrmSettingsCatalogCompanyId` | Same | **Y** | P0-3 closed — evidence **2026-06-07** (`PCOMP-W3-QA-03`) |
| HRM settings-catalogs batch detail | `resolveHrmSettingsCatalogCompanyId` + row assert | Scoped batch GET | **Y** | P0-4 closed — evidence **2026-06-07** (`PCOMP-W3-QA-03`) |
| XBOS config-sync catalog GET | `resolveXbosGroupLegalReadScopeContext` | Same | **Y** | Spec: `config-sync.controller.spec.ts` |

**Phase 1 gate:** **PASS** — all in-scope list↔detail paths aligned; P0-1..P0-4 closed per QA live probes **15/15** + jest **67/67** (`verify:hrm:xbos-integrity` `scope_parity=PASS gaps=0`). Corroborated `PCOMP-W3-QA-04` integrity re-run **2026-06-07**.

---

## 3. Detailed findings

### 3.1 HRM employees

| Surface | Resolver | File paths |
|---------|----------|------------|
| List | `resolveHrmListScope` → `pushEmployeeListScopeFilters` | `apps/api/hrm-api/src/employees/employees.service.ts` (`listEmployees`) |
| GET `:id` | `resolveHrmListScope` → `queryEmployeeById` (optional `skipTenantPartition` fallback) | Same file (`getEmployeeById`, `queryEmployeeById`) |
| Mutate | `resolveHrmListScope` + `assertResourceInHrmScope` | `updateEmployee`, `archiveEmployee` |

**Parity:** **Y** for list/detail and **restore** under `?company_id=main` (group rollup). Aligns with ADR-HRM-RBAC §3.1 and ADR-GROUP-CEO §4 HRM operational lists.

**Regression evidence:** `employees.service.spec.ts`, `docs/qa/evidence/u18-hrm-emp-scope-fix-20260524.md`.

| Gap | Severity | Status | Evidence |
|-----|----------|--------|----------|
| `POST :employeeId/restore` | **P0-2** | **CLOSED → Y** | **2026-06-07** — `PCOMP-W3-QA-03` §4: archive→restore **200** (`HRM-EMP-204`); member cross-restore **404** (`HRM-EMP-404`); jest `employees.service.spec.ts` **12/12**. Corroborated `PCOMP-W3-QA-04` `verify:hrm:xbos-integrity` `scope_parity=PASS`. |

---

### 3.2 HRM contracts (`employee_contracts`)

| Surface | Resolver | File paths |
|---------|----------|------------|
| List | `resolveHrmListScope` + `pushCompanyIdFilter` | `contracts-insurance.service.ts` (`listContracts`, `listExpiringContracts`) |
| GET `:id` | `resolveHrmListScope` + same filters | `getContractById` |
| Mutate | `resolveHrmListScope` + `assertResourceInHrmScope` on peek row | `updateContract`, `deleteContract` |

**Parity:** **Y**.

**Regression evidence:** `contracts-insurance.service.spec.ts` — `getContractById keeps list/detail scope parity for company_id=main`.

---

### 3.3 XBOS org-foundation — legal entities

| Surface | Resolver | File paths |
|---------|----------|------------|
| List | `resolveXbosGroupLegalReadScopeContext` → `listLegalEntities(tenantId, companyId)` | `org-foundation.controller.ts`, `org-foundation.service.ts` |
| GET `:entityId` | `readScope()` + `resolveLegalEntityPartition` + **`assertJwtMayReadLegalEntityPartition`** | `org-foundation.controller.ts`, `xbos-group-legal-scope.ts` |
| Mutate PUT | `resolveXbosGroupLegalMutationScopeContext` | `org-foundation.controller.ts` |

**Parity:** **Y** (read authorization).

**Architecture intent (ADR-GROUP-CEO §4):** Group CEO may read member legal rows by UUID with registry tenant headers; member CEOs must be **tenant-bound**. `assertJwtMayReadLegalEntityPartition` enforced on GET after partition resolve.

| Gap | Severity | Status | Evidence |
|-----|----------|--------|----------|
| Legal-entity GET IDOR | **P0-1** | **CLOSED → Y** | **2026-06-07** — `PCOMP-W3-QA-03` §3: group CEO member UUID **200** (`XBOS-ORG-200`); `du-lich.ceo@xe.vn` cross-tenant **409** (`SCOPE_CONTEXT_MISMATCH`); jest `org-foundation.controller.spec.ts` **17/17**. Corroborated `PCOMP-W3-QA-04` integrity `scope_parity=PASS`. |



---

### 3.4 XBOS KPI engine

| Surface | Resolver | File paths |
|---------|----------|------------|
| GET `rollup` | `resolveKpiRollupScopeContext` | `kpi-engine.controller.ts`, `kpi-rollup-scope.ts` |
| POST evaluate / alerts | `resolveScopeContext` / `resolveTenantOnlyContext` | Same controller (write/alert paths — out of list/detail parity scope) |

**Parity:** **Y** for Command Center rollup probe (`JWT main` + query `holding` per ADR §4).

**Regression evidence:** `kpi-rollup-scope.spec.ts`, `docs/ops/evidence/p1-ex-be-https-j-cc-03-scope-01-20260529.md`.

---

### 3.5 Catalog surfaces

#### HRM `settings-catalogs` (overview / sync)

| Surface | Resolver | File paths |
|---------|----------|------------|
| GET overview | `resolveScopeContext` + **`resolveHrmSettingsCatalogCompanyId`** | `settings-catalogs.controller.ts` L22–39 |
| POST sync-from-xbos | Same catalog company mapping | L87–103 |

**Parity (internal):** **Y** — list/overview uses holding partition for group CEO `main`.

#### HRM `catalog-sync` (synced catalog mirror)

| Surface | Resolver | File paths |
|---------|----------|------------|
| GET list / GET `:catalogKey` / GET `status` | **`resolveHrmCatalogSyncScope`** → `resolveHrmSettingsCatalogCompanyId` | `catalog-sync.controller.ts`, `hrm-catalog-sync-scope.ts` |

**Parity vs settings-catalogs:** **Y** — group CEO `companyId=main` maps to **`holding`** partition on both overview and catalog-sync (ADR §4).

| Gap | Severity | Status | Evidence |
|-----|----------|--------|----------|
| Catalog-sync partition mismatch | **P0-3** | **CLOSED → Y** | **2026-06-07** — `PCOMP-W3-QA-03` §5: overview **200** (`HRM-SET-200`); catalog-sync list **200** 74 items (`HRM-SYNC-202`); by-key **200** (`HRM-SYNC-201`); jest `hrm-catalog-sync-scope.spec.ts` + `catalog-sync.controller.spec.ts` **15/15**. Corroborated `PCOMP-W3-QA-04` integrity `scope_parity=PASS`. |

#### HRM `settings-catalogs` extension batch

| Surface | Resolver | File paths |
|---------|----------|------------|
| GET `batches/:batchId` | Catalog scope resolve + partition assert on batch rows | `settings-catalogs.controller.ts`, `settings-catalogs.service.ts` |

**Parity:** **Y** — batch GET scoped to caller catalog partition; cross-partition → **409** `HRM-SET-409`.

| Gap | Severity | Status | Evidence |
|-----|----------|--------|----------|
| Unscoped batch GET | **P0-4** | **CLOSED → Y** | **2026-06-07** — `PCOMP-W3-QA-03` §2: live probes **15/15** — in-scope batch **200** (`HRM-SET-220`); missing UUID **404** (`HRM-SET-404`); `du-lich.ceo@xe.vn` holding batch **409**; group CEO member batch **409** (`HRM-SET-409`); jest `settings-catalogs` **35/35**. Corroborated `PCOMP-W3-QA-04` §5 register **PROMOTED**. |

#### XBOS `config-sync` / `catalog-governance`

| Surface | Resolver | File paths |
|---------|----------|------------|
| GET `catalog/:catalogKey` | `resolveXbosGroupLegalReadScopeContext` | `config-sync.controller.ts` L58–77 |
| GET `catalogs` | Same | L80–98 |
| GET `instances/:instanceId` | `resolveGroupReadScope` (JWT gate); detail by workflow id | `catalog-governance.controller.ts` L127–138 |

**Parity:** **Y** for XBOS catalog GET/list (same helper). Workflow instance detail is id-keyed governance data — acceptable residual if instance ids are unguessable; optional hardening: filter by resolved `tenantId`.

---

## 4. P0 fixes — Dev-BE (`P1-PHASE1-BE-SCOPE-CRUD-01`)

| ID | Module | Change | Files (primary) | Acceptance | Status | QA evidence |
|----|--------|--------|-----------------|------------|--------|-------------|
| **P0-1** | XBOS legal-entity GET | After `readScope`, resolve partition via `getLegalEntityById` / `resolveLegalEntityPartition`, then **`assertJwtMayReadLegalEntityPartition(authorization, jwtScope, partition)`** | `org-foundation.controller.ts`, `xbos-group-legal-scope.ts` | Member CEO GET other tenant UUID → **409**; group CEO member UUID → **200**; jest in `org-foundation.controller.spec.ts` | **CLOSED** | **2026-06-07** `PCOMP-W3-QA-03` §3 |
| **P0-2** | HRM employee restore | Pass `companyId` from scope; `resolveHrmListScope` + load row + **`assertResourceInHrmScope`** before UPDATE | `employees.service.ts`, `employees.controller.ts` | Restore holding employee with `company_id=main` scope → **200**; out-of-scope id → **404/409** | **CLOSED** | **2026-06-07** `PCOMP-W3-QA-03` §4 |
| **P0-3** | HRM catalog-sync | Replace strict `resolveScopeContext` company with **`resolveHrmSettingsCatalogCompanyId`** (same as overview) on GET list / GET key / status / pull | `catalog-sync.controller.ts` | Group CEO `main`: overview and catalog-sync return same partition; jest or probe | **CLOSED** | **2026-06-07** `PCOMP-W3-QA-03` §5 |
| **P0-4** | HRM settings batch GET | On `getExtensionBatchDetail`, resolve catalog scope; **`assertResourceInHrmScope`** (or tenant+company filter) on first row / all rows | `settings-catalogs.controller.ts`, `settings-catalogs.service.ts` | Batch outside scope → **404** or **409** | **CLOSED** | **2026-06-07** `PCOMP-W3-QA-03` §2; corroborated `PCOMP-W3-QA-04` §5 |

**P1 (same work item, non-blocking pilot smoke):** `catalog-governance` `instances/:instanceId` — attach resolved `tenantId` to governance query when schema supports it.

---

## 5. Architecture references

| Topic | ADR / doc |
|-------|-----------|
| JWT `main` vs seed `holding` | `ADR-GROUP-CEO-MAIN-HOLDING-SCOPE.md` §3–4 |
| HRM five-slug rollup | `ADR-HRM-RBAC-SCOPE-LADDER.md` §3.1; `hrm-list-scope.ts` `HRM_GROUP_MEMBER_COMPANY_SLUGS` |
| Catalog partition | ADR-GROUP-CEO §4 — `resolveHrmSettingsCatalogCompanyId` |
| KPI rollup alias | ADR-GROUP-CEO §4 — `resolveKpiRollupScopeContext` |
| XBOS legal read | ADR-GROUP-CEO §4 — `resolveXbosGroupLegalReadScopeContext` |
| TM gate | `docs/qa/evidence/hrm-tm-review-20260524.md` §1 scope parity checklist |

---

## 6. Verification plan (post Dev-BE)

**Executed 2026-06-07** (`PCOMP-W3-QA-03`, corroborated `PCOMP-W3-QA-04`):

1. `pnpm --filter hrm-api test` — settings-catalogs **35/35**, catalog-sync **15/15**, employees **12/12**.
2. `pnpm --filter xbos-api test` — `org-foundation.controller.spec.ts` **17/17**.
3. Live persona probes **15/15** — batch GET, legal GET isolation, restore, catalog-sync partition.
4. `pnpm run verify:hrm:xbos-integrity` — `scope_parity=PASS` gaps **0**.

---

## 7. SA verdict

| Gate | Result |
|------|--------|
| Audit complete | **Yes** |
| Pilot employees + contracts + KPI + XBOS config catalog | **PASS** (parity **Y**) |
| Legal-entity GET + catalog-sync + batch GET (P0-1..P0-4) | **PASS** — promoted **Y** **2026-06-07** per `PCOMP-W3-QA-03`; corroborated `PCOMP-W3-QA-04` |
| `scope_parity` register | **PASS** — `verify:hrm:xbos-integrity` gaps **0** (QA-03/04) |
| Recommended `ack_status` | **`PASS_TO_PM`** — dispatch **technical-manager** `PCOMP-W5-TM-01` scope_parity sign-off |

---

*Initial audit: SA `P1-PHASE1-SA-SCOPE-PARITY-01` (2026-06-04). Promotion: SA `PCOMP-W3-SA-02` (2026-06-07) per QA `PCOMP-W3-QA-03` + `PCOMP-W3-QA-04`. TM `scope_parity` sign-off pending `PCOMP-W5-TM-01`.*
