# ADR: Group CEO — `main` (JWT / portal) vs `holding` (seed / XBOS legal entity)

| Field | Value |
|-------|--------|
| **ADR-ID** | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE |
| **work_item_id** | `P1-S2-SA-01` |
| **Status** | Accepted |
| **Date** | 2026-05-24 |
| **Decision owner** | SA |
| **Closes** | P1-S1-TM-01 condition **C2** (consolidated scope matrix) |
| **Related ADRs** | [`ADR-HRM-RBAC-SCOPE-LADDER.md`](../decisions/ADR-HRM-RBAC-SCOPE-LADDER.md), [`ADR-XBOS-M01-OPENAPI-BOUNDARIES.md`](../decisions/ADR-XBOS-M01-OPENAPI-BOUNDARIES.md), [`ADR-HRM-EMBED-DATA-MODE.md`](../decisions/ADR-HRM-EMBED-DATA-MODE.md) |
| **BA / seed** | [`HRM_SEED_CARDINALITY_RULES.md`](../hrm/HRM_SEED_CARDINALITY_RULES.md) (`GROUP_MEMBER_SLUGS`) |
| **Evidence** | `docs/qa/evidence/phase1-view-gaps-be-20260524.md`, `docs/qa/evidence/p1-s1-tm-01-review-20260524.md` |

---

## 1. Context

XeVN master-tenant **group CEO** (`ceo@xe.vn`, `tenantId=xevn`, `roleCode=group_ceo`) signs in with JWT **`companyId=main`**. That value is the **portal operating bucket** from `xbos_tenant_registry.default_company_id` and is intentional per [`ADR-HRM-RBAC-SCOPE-LADDER`](../decisions/ADR-HRM-RBAC-SCOPE-LADDER.md) §3.1.

Operational and catalog **seed data** for the group legal anchor and XBOS-published employee-import catalogs are stored under **`company_id=holding`** (and sibling operating slugs). Command Center KPI rollup probes and catalog overview APIs therefore often send **`companyId=holding`** while the bearer token still carries **`main`**.

Without explicit, role-gated resolution, `resolveScopeContext` returns **HTTP 409** `companyId mismatches token scope` — view-completeness and pilot routes show empty panels despite healthy seeds.

Sprint S1 implemented two scoped helpers (not a global JWT change). This ADR formalizes the pattern so S2 security review and new list/catalog endpoints do not reintroduce ad-hoc aliases.

---

## 2. Problem statement

| Symptom | Typical request | Root cause |
|---------|-----------------|------------|
| Settings catalogs **total=0** | `GET /api/hrm/settings-catalogs` with JWT `main` | Import catalog rows keyed `(xevn, holding)`; overview queried `main` |
| KPI rollup **409** | `GET /api/xbos/kpi-engine/rollup?companyId=holding` + JWT `main` | Strict JWT∩query match in default scope resolver |
| HRM lists **under-count** for group CEO | `?company_id=main` only | SQL filtered `company_id = 'main'`; workforce lives across **five** member slugs |
| Team confusion | Mixed `main` / `holding` in docs and probes | Two identifier planes (operating JWT vs legal/seed slug) undocumented in one matrix |

**Non-problem (by design):** Changing group CEO JWT to `holding` — rejected; breaks HRM embed invariant and FE `identityScope` normalization.

---

## 3. Decision

**Keep JWT `companyId=main` for group leadership on master tenant.** Resolve `main` ↔ `holding` (and group rollup) only in **named, role-gated server helpers** — never as a default bypass of `resolveScopeContext`.

### 3.1 Invariants

1. **JWT plane:** Group CEO on `xevn` always has `companyId=main` after login (unchanged).
2. **409 remains default:** Any alias not listed in §4 is a defect; do not add controller-level string swaps.
3. **Member CEOs:** `tenantId ≠ xevn` + `companyId=main` → **no** `main`→`holding` mapping (single company bucket `main` only).
4. **Group list rollup:** When JWT+query are both `main` on master with `group_ceo` (or `group_*`), SQL spans **`GROUP_MEMBER_SLUGS`** — not only `holding`.
5. **Catalog / KPI exceptions:** Map or accept `holding` only where seed or XBOS contract requires it (§4 table).

### 3.2 Architecture (resolution flow)

```text
Portal / CC request
        │
        ▼
┌───────────────────┐
│ Bearer JWT        │  tenantId=xevn, companyId=main, role=group_ceo
└─────────┬─────────┘
          │
    ┌─────┴─────┬─────────────────┬──────────────────┐
    ▼           ▼                 ▼                  ▼
 HRM lists   HRM settings      XBOS KPI          XBOS org / BM
 ?co=main    catalogs          rollup            (no alias)
    │           │                 │                  │
    ▼           ▼                 ▼                  ▼
resolveHrm   resolveHrm      resolveKpi         resolveScopeContext
ListScope    SettingsCatalog RollupScopeContext  (strict)
    │           CompanyId         │
    ▼           │                 ▼
 IN (5 slugs)  holding row key   holding query OK
 master        for overview      if JWT main
 partition
```

---

## 4. Mapping table — group CEO (`tenantId=xevn`, `roleCode=group_ceo`)

Canonical member operating slugs (**`GROUP_MEMBER_SLUGS`**):

| Constant in code | Slugs |
|------------------|--------|
| `HRM_GROUP_MEMBER_COMPANY_SLUGS` (`hrm-list-scope.ts`) | `holding`, `trsport`, `logistics`, `finance`, `services` |
| `GROUP_MEMBER_SLUGS` (`HRM_SEED_CARDINALITY_RULES.md`, `scripts/lib/uat-workforce.mjs`) | Same five values |

| API / surface | JWT `companyId` | Request `companyId` / query | Resolved read scope | Server helper | 409? |
|---------------|-----------------|----------------------------|---------------------|---------------|------|
| Portal login / session | `main` | — | JWT unchanged | `auth.service` | — |
| HRM operational lists (employees, contracts, recruitment, payroll, …) | `main` | `main` | SQL `company_id IN GROUP_MEMBER_SLUGS` + master `tenant_id=xevn` partition | `resolveHrmListScope` | No |
| HRM operational lists (filter one unit) | `main` | `holding` \| other slug | Single slug only; **no** five-slug rollup | `resolveHrmListScope` | No |
| HRM settings-catalogs overview / sync | `main` | `main` (from scope) | Persisted key **`holding`** for catalog partition | `resolveHrmSettingsCatalogCompanyId` | No |
| HRM TEXT-table **create** (contracts, insurance, recruitment requisition, performance cycle) | `main` | body `company_id=main` | Persist **`holding`**; list rollup reads back | `resolveHrmPersistCompanyIdText` | No (throws if outside list scope) |
| HRM attendance satellites (leave, records via workforce) | `main` | `main` | Via employee subquery over rollup scope | `pushWorkforceEmployeeScopeFilter` + `resolveHrmListScope` | No |
| XBOS KPI engine rollup | `main` | `holding` | Effective query `companyId=holding` | `resolveKpiRollupScopeContext` | No (alias) |
| XBOS KPI / other with JWT `holding` | `holding` | `main` | — | `resolveScopeContext` | **Yes** (no reverse alias) |
| XBOS org-foundation, business-master, catalog-governance, config-sync, command-center, platform-audit | `main` | `holding` (or slug aligned with JWT) | Group CEO read: effective **`holding`** partition | `resolveXbosGroupLegalReadScopeContext` | No when alias applies |
| XBOS workflow-engine, assets, position-rbac | `main` | Must match JWT | **Strict** — no `main`→`holding` alias | `resolveScopeContext` | Yes if mismatch |
| Member subsidiary CEO (`xe-du-lich`, …) | `main` | `main` | `company_id=main` + `custom_fields.tenant_id=<member>` | `resolveHrmListScope` | No |
| Member CEO on master routes | `main` | `main` | Same as member row; **no** `holding` map | `resolveHrmSettingsCatalogCompanyId` | — |

**`main` → `holding` alias (group CEO only):** applies to **catalog company partition**, **KPI rollup query**, **XBOS legal-read surfaces** (§4 `resolveXbosGroupLegalReadScopeContext`), and **HRM TEXT create persistence** (`resolveHrmPersistCompanyIdText`) — not to full HRM list rollup (which uses all five slugs).

**Evidence (closure):** `docs/qa/evidence/p1-ex-sa-03-20260527.md` (EX-SA01-P1-01 + ADR §4 sync); prior `p1-ex-sa-01-20260526.md`, `p1-ex-sa-02-20260526.md`.

---

## 5. Member CEO (unchanged — company-scoped)

| Persona | `tenantId` | JWT `companyId` | List SQL `company_id` | `main`→`holding` |
|---------|------------|-----------------|------------------------|------------------|
| Subsidiary CEO (e.g. `du-lich.ceo@xe.vn`) | `xe-du-lich` | `main` | `main` only | **Never** |
| Group CEO | `xevn` | `main` | `GROUP_MEMBER_SLUGS` when query=`main` | Catalog + KPI only per §4 |

Member tenant rows must carry `employees.custom_fields.tenant_id = <member>`; group rollup uses master partition `tenant_id=xevn` across the five slugs.

---

## 6. Implementation references (current)

| Helper | Module | Gate conditions |
|--------|--------|-----------------|
| `resolveHrmListScope` | `apps/api/hrm-api/src/common/hrm-list-scope.ts` | `tenantId=xevn`, query=`main`, claim=`main`, `group_ceo` or `group_*` |
| `resolveHrmSettingsCatalogCompanyId` | same | Group rollup scope → return `holding` |
| `resolveHrmPersistCompanyIdText` | same | Group CEO create on TEXT `company_id`: `main` → `holding`; must be in list scope |
| `resolveKpiRollupScopeContext` | `apps/api/xbos-api/src/kpi-engine/kpi-rollup-scope.ts` | Master tenant + group role + claim `main` + request `holding` |
| `resolveXbosGroupLegalReadScopeContext` | `apps/api/xbos-api/src/common/xbos-group-legal-scope.ts` | Master tenant group roles; legal-read routes (org, BM, catalog, config-sync, CC, audit) |
| `HRM_GROUP_MEMBER_COMPANY_SLUGS` | same as `GROUP_MEMBER_SLUGS` | Exported for tests and services |

**Tests (regression required for changes):**

- `apps/api/hrm-api/src/common/hrm-list-scope.spec.ts`
- `apps/api/xbos-api/src/kpi-engine/kpi-rollup-scope.spec.ts`

**Consumers (non-exhaustive):** `settings-catalogs.controller.ts`, `kpi-engine.controller.ts`, HRM list services using `pushEmployeeListScopeFilters` / `pushWorkforceEmployeeScopeFilter`.

---

## 7. Consequences

### Positive

- Closes pilot **409** class for KPI rollup and catalog overview without changing JWT or re-seeding under `main`.
- Group CEO list APIs align with **UAT workforce** distribution across five slugs (~1100+ employees visible on `?company_id=main`).
- TM C2 documentation debt cleared; QC can audit against one matrix.

### Negative / risks

| Risk | Mitigation |
|------|------------|
| New endpoint copies alias logic incorrectly → widens reads | Only use §4 helpers; code review + jest specs |
| Assumption “holding = group” for all APIs | Lists use **five** slugs; `holding` alone is catalog/KPI/XBOS org |
| FE sends `holding` on HRM embed lists | FE must normalize to `main` for HRM REST per scope ladder ADR |
| Drift between seed and resolver | `verify:hrm:menu-density`, `verify:phase1:view-completeness`, persona probes |

### Non-goals

- Re-keying all catalog seeds to `main`.
- Issuing JWT with `companyId=holding` for group CEO.
- Global relaxation of `resolveScopeContext` for all XBOS modules.
- RLS / `PLATFORM_RLS_ENABLED` (separate SA sign-off).

---

## 8. Options considered

| Option | Summary | Verdict |
|--------|---------|---------|
| **A — JWT stays `main`; server aliases (this ADR)** | Minimal JWT/FE churn; explicit helpers | **Accepted** (implemented S1) |
| **B — JWT `holding` for group CEO** | Matches XBOS org slug | **Rejected** — breaks HRM embed + ladder ADR |
| **C — Re-seed catalogs under `main`** | Removes alias | **Rejected** — duplicates XBOS legal entity key; high migration cost |
| **D — Disable 409 globally** | Fastest | **Rejected** — security / tenant isolation |

---

## 9. Validation and acceptance evidence

| Check | Command / artifact | Expected |
|-------|-------------------|----------|
| Unit scope | `hrm-list-scope.spec.ts`, `kpi-rollup-scope.spec.ts` | PASS |
| View completeness | `pnpm run verify:phase1:view-completeness` | catalogs, kpi-rollup, leave **PASS** |
| BE handoff | `docs/qa/evidence/phase1-view-gaps-be-20260524.md` | 10/10 probes |
| Menu density | `pnpm run verify:hrm:menu-density` | Group CEO 7/7 |
| Persona | `ceo@xe.vn` lists on `company_id=main` | Counts ≥ seed thresholds across rollup |

QC gate **P1-S2-QC-01:** C2 satisfied when this ADR is **Accepted** and linked from TM review + sprint backlog.

---

## 10. Rollout / governance

1. **Dev-BE:** New HRM list or catalog endpoints on master tenant must call `resolveHrmListScope` / `resolveHrmSettingsCatalogCompanyId` — not raw query `company_id`.
2. **Dev-FE:** Command Center KPI rollup may pass `companyId=holding`; HRM embed lists must keep `main` aligned with JWT.
3. **QA:** Persona matrix rows for group CEO reference §4; member CEO negative test — no rollup to `holding`.
4. **SA:** Amend [`ADR-HRM-RBAC-SCOPE-LADDER`](../decisions/ADR-HRM-RBAC-SCOPE-LADDER.md) §4 cross-link to this ADR (no duplicate tables).

---

## 11. Handoff packet

| Field | Value |
|-------|--------|
| **work_item_id** | P1-S2-SA-01 |
| **from_role** | sa |
| **to_role** | pm |
| **entry_criteria** | TM C2; S2 W0 backlog |
| **exit_criteria** | ADR Accepted at `docs/architecture/ADR-GROUP-CEO-MAIN-HOLDING-SCOPE.md` |
| **evidence_path** | This file + jest specs cited in §6 |
| **ack_status** | PASS_TO_PM |
