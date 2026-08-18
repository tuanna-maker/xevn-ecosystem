# QA-XBOS-OA-RACI-GOVERNANCE-01 — OpenAPI G-OA-W2-RACI-01 spot verify

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-XBOS-OA-RACI-GOVERNANCE-01` |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | execution |
| **date** | 2026-07-22 (ICT) |
| **priority** | P1 |
| **ack_status** | **PASS_TO_PM** |
| **verdict** | **PASS** |
| **entry** | `docs/qa/evidence/be-xbos-oa-raci-governance-01-20260722.md` |
| **gap closed** | **G-OA-W2-RACI-01** + **G-DTO-W2-RACI-01** (TechSpec §14.14 FR-XBOS-RACI-02 — raci-governance paths + cell body schema) |
| **scope** | yaml + verify gate + read-only controller/FE path parity — **no** FE mutate, seed, Phase1/PROD, apps rewrite, CC-CAT |

> **ID SoT:** TechSpec §14.14 **FR-XBOS-RACI-02** · SA W2 `G-OA-W2-RACI-01`. **CC-CAT** = separate Task — **not reopened**.

## 1. Micro-checklist

| # | Item | Result |
|---|------|--------|
| 1 | operationIds catalog / matrix / cell (+ capabilities / coverage) | **PASS** |
| 2 | `UpsertRaciMatrixCellRequest` + `XBOS-RACI-200` / `201` (+ 400/404/503) | **PASS** |
| 3 | `pnpm verify:openapi-m01` exit 0 | **PASS** |
| 4 | Read-only controller parity | **PASS** |
| 5 | Evidence this path · `PASS_TO_PM` | **PASS** |

## 2. OpenAPI yaml confirmation

**SoT:** `docs/api/openapi/xbos-api.yaml` (`info.version` `1.2.4-p1-s2`)

### operationIds

| operationId | Method | Path | Present |
|-------------|--------|------|---------|
| `raciGovernanceListCatalog` | GET | `/raci-governance/catalog` | yes (~L1433) |
| `raciGovernanceGetCompanyMatrix` | GET | `/raci-governance/companies/{companyId}/matrix` | yes (~L1477) |
| `raciGovernanceUpsertMatrixCell` | PUT | `/raci-governance/companies/{companyId}/matrix/cell` | yes (~L1534) |
| `raciGovernanceListCapabilities` | GET | `/raci-governance/capabilities` | yes (~L1607) |
| `raciGovernanceGetCoverage` | GET | `/raci-governance/companies/{companyId}/coverage` | yes (~L1648) |

Tags: `M01-Org`, `M01-CC`. Security: `bearerAuth` | `internalApiKey`. Headers: `x-tenant-id`, `x-company-id` (matrix/cell/coverage).

### Schemas + envelopes

| Marker | Present |
|--------|---------|
| `UpsertRaciMatrixCellRequest` | yes — snake_case; required `activity_id`, `org_column_id`; optional `raci_letters` (`^[RACI]*$`), `actor_id` |
| `RaciCatalogData` / `RaciActivityRow` / `RaciDomainSummary` | yes |
| `RaciCompanyMatrixData` / `RaciMatrixRow` | yes |
| `CompanyRaciMatrixCell` | yes — snake_case RETURNING row |
| `RaciCapabilityListData` / `RaciCapabilityRow` | yes |
| `RaciCoverageData` | yes |
| Envelope `XBOS-RACI-200` | yes — GET catalog / matrix / capabilities / coverage |
| Envelope `XBOS-RACI-201` | yes — PUT cell (HTTP 200 Nest PUT) |
| Errors `XBOS-RACI-400` / `404` / `503` / `XBOS-AUTH-001` / `SCOPE_CONTEXT_MISMATCH` | yes |
| `G-OA-W2-RACI-01` / `G-DTO-W2-RACI-01` in `info.description` | yes (L13) |

### CC-CAT must_keep (not reopened)

| Check | Result |
|-------|--------|
| yaml paths for CC-CAT / command-center catalog in this delta | **none** (grep `CC-CAT` / `cc-cat` in yaml → 0) |
| Scope stayed on `raci-governance` only | **OK** |

## 3. Verify gate

```text
pnpm run verify:openapi-m01
→ PASS verify-openapi-m01 …/docs/api/openapi/xbos-api.yaml
exit 0
```

(QA re-ran 2026-07-22 ICT; matches BE evidence §4.)

## 4. Runtime parity (read-only — no mutate)

**Runtime SoT:** `apps/api/xbos-api/src/raci-governance/raci-governance.controller.ts` + `.service.ts`  
**FE contract (read-only):** `apps/web/web-portal/src/integrations/raciGovernanceApi.ts`  
**OpenAPI SoT:** `docs/api/openapi/xbos-api.yaml`

| Runtime | OpenAPI | Match |
|---------|---------|-------|
| `@Controller('raci-governance')` + `@Get('catalog')` → `ok(…, 'XBOS-RACI-200')` | path + `raciGovernanceListCatalog` + 200 `XBOS-RACI-200` | **OK** |
| `@Get('companies/:companyId/matrix')` → `XBOS-RACI-200`; UUID path → `XBOS-RACI-404` | path + envelope + 404 | **OK** |
| `@Put('companies/:companyId/matrix/cell')` → `ok(…, 'XBOS-RACI-201')` (Nest PUT HTTP 200) | PUT 200 + `XBOS-RACI-201` + `CompanyRaciMatrixCell` | **OK** |
| Body `activity_id` / `org_column_id` required → `XBOS-RACI-400` | `UpsertRaciMatrixCellRequest` required + 400 | **OK** |
| Service invalid letters → `XBOS-RACI-400`; `seed-*` activity → `XBOS-RACI-503` | documented 400/503 | **OK** |
| `@Get('capabilities')` / `@Get('…/coverage')` → `XBOS-RACI-200` | operationIds + schemas | **OK** |
| Auth via `assertInternal` → `XBOS-AUTH-001` | response 401 | **OK** |
| FE `saveRaciMatrixCell` snake_case body + PUT `…/matrix/cell` | request schema + path | **OK** (read-only spot) |

**FE / UF:** yaml-only wave — **no** FE mutate, **no** browser UF, **U65 no seed**.  
**must_keep:** UF-XBOS-07 🟢 — not exercised; no portal regression expected (documentation-only).  
**cấm:** CC-CAT reopen · seed · Phase1/PROD claim · `apps/**` rewrite — **not touched**.

## 5. Residual

| Item | Status | Next |
|------|--------|------|
| **G-OA-W2-RACI-01** raci-governance OpenAPI | **CLOSED** | — |
| **G-DTO-W2-RACI-01** cell body schema | **CLOSED** (folded) | Nest class-validator DTO still optional P2 if TM opens apps |
| **G-OA-W2-CC-CAT-01** | **OPEN** — separate queue | **BE-XBOS-OA-CC-CAT-01** (not this QA) |
| FE mutate / browser UF RACI | N/A | not required this wave |
| Seed / Phase1 / PROD claim | **cấm** — not touched | — |

## 6. Handoff

- **ack_status:** `PASS_TO_PM`
- **next_owner:** `pm`
- **evidence_path:** `docs/qa/evidence/qa-xbos-oa-raci-governance-01-20260722.md`
- **closed:** G-OA-W2-RACI-01 + G-DTO-W2-RACI-01 yaml paths/schemas + verify:openapi-m01 + runtime parity

### next_dispatch_prompt

```text
work_item_id: BE-XBOS-OA-CC-CAT-01
from_role: pm
to_role: dev-be
lane: execution
priority: P1

entry_criteria:
- QA-XBOS-OA-RACI-GOVERNANCE-01 PASS (docs/qa/evidence/qa-xbos-oa-raci-governance-01-20260722.md)
- G-OA-W2-RACI-01 CLOSED — do not reopen raci-governance yaml
- TechSpec SoT gap: G-OA-W2-CC-CAT-01 (separate from RACI)

exit_criteria:
1. ADD OpenAPI paths/schemas for CC-CAT per TechSpec §14.x owner-tag
2. pnpm verify:openapi-m01 exit 0
3. Evidence docs/qa/evidence/be-xbos-oa-cc-cat-01-20260722.md → READY_FOR_QA
cấm: reopen G-OA-W2-RACI-01 · seed · FE · Phase1/PROD · apps rewrite unless TM opens DTO P2

ALTERNATE (sample gate only):
work_item_id: QC-XBOS-OA-RACI-GOVERNANCE-01
from_role: pm
to_role: qc
— audit QA PASS + verify:openapi-m01 spot; GWC bounded yaml; NOT Phase1/PROD
```

---

## completion_report

**Closed:** Spot-verify OpenAPI for FR-XBOS-RACI-02 — 5 operationIds (catalog/matrix/cell/capabilities/coverage), `UpsertRaciMatrixCellRequest` + RACI schemas, envelopes `XBOS-RACI-200/201/400/404/503`, `verify:openapi-m01` exit 0, read-only Nest controller + FE path parity. CC-CAT not in yaml delta.

**Residual:** G-OA-W2-CC-CAT-01 OPEN (next BE); Nest edge still `Record<string, unknown>` P2 optional; no UF/browser this wave.

**ack_status:** `PASS_TO_PM`  
**next_owner:** `pm`  
**evidence_path:** `docs/qa/evidence/qa-xbos-oa-raci-governance-01-20260722.md`
