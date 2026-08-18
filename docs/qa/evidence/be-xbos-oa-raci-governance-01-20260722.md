# BE-XBOS-OA-RACI-GOVERNANCE-01 — OpenAPI G-OA-W2-RACI-01 (FR-XBOS-RACI-02)

| Field | Value |
|-------|--------|
| **work_item_id** | `BE-XBOS-OA-RACI-GOVERNANCE-01` |
| **from_role** | dev-be |
| **to_role** | qa |
| **lane** | execution |
| **date** | 2026-07-22 (ICT) |
| **ack_status** | **READY_FOR_QA** |
| **gap closed** | **G-OA-W2-RACI-01** + **G-DTO-W2-RACI-01** (TechSpec §14.14 / §14.13 — raci-governance paths + cell body schema) |
| **scope** | OpenAPI yaml **ONLY** — no runtime / FE rewrite |

> **ID SoT:** TechSpec §14.14 **FR-XBOS-RACI-02** · SA W2 `G-OA-W2-RACI-01`. **CC-CAT** = separate Task — **cấm** same wave.

## 1. spec_read_ack

| Artifact | Cite |
|----------|------|
| tech_spec | `docs/xbos/TECHSPEC.md` **§14.14** FR-XBOS-RACI-02 · **§14.13** G-OA-W2-RACI-01 / G-DTO-W2-RACI-01 · **§14.0b** W2 catalog |
| SA packet | `docs/qa/evidence/sa-xbos-techspec-w2-ref-01-20260722.md` — OpenAPI **MISSING** → this ticket |
| runtime SoT (read-only) | `apps/api/xbos-api/src/raci-governance/raci-governance.controller.ts` + `.service.ts` |
| FE contract (read-only) | `apps/web/web-portal/src/integrations/raciGovernanceApi.ts` |
| OpenAPI SoT | `docs/api/openapi/xbos-api.yaml` |

**change_mode:** ADD (contract documentation)  
**must_keep:** UF-XBOS-07 🟢 — no product behavior change; no seed; no CC-CAT paths.

**spec says / code does:** Spec requires `raci-governance` catalog + matrix GET + matrix/cell PUT in OpenAPI M01; runtime already implements catalog/matrix/cell/capabilities/coverage — yaml previously had **zero** `raci-governance` paths. This Task closes contract gap only.

---

## 2. Micro-checklist

| # | Item | Status |
|---|------|--------|
| 1 | `spec_read_ack` TechSpec §14.14 FR-XBOS-RACI-02 | **DONE** (§1) |
| 2 | ADD raci-governance matrix/cell paths+schemas to `xbos-api.yaml` | **DONE** |
| 3 | `pnpm verify:openapi-m01` exit 0 | **DONE** (see §4) |
| 4 | Evidence `docs/qa/evidence/be-xbos-oa-raci-governance-01-20260722.md` | **DONE** |
| 5 | READY_FOR_QA | **DONE** |

---

## 3. OpenAPI delta (ADD)

### Paths

| Method | Path | operationId | Envelope / note |
|--------|------|-------------|-----------------|
| GET | `/raci-governance/catalog` | `raciGovernanceListCatalog` | `XBOS-RACI-200` |
| GET | `/raci-governance/companies/{companyId}/matrix` | `raciGovernanceGetCompanyMatrix` | `XBOS-RACI-200`; `companyId` slug **or** UUID |
| PUT | `/raci-governance/companies/{companyId}/matrix/cell` | `raciGovernanceUpsertMatrixCell` | HTTP 200 + `XBOS-RACI-201` |
| GET | `/raci-governance/capabilities` | `raciGovernanceListCapabilities` | `XBOS-RACI-200` (runtime parity) |
| GET | `/raci-governance/companies/{companyId}/coverage` | `raciGovernanceGetCoverage` | `XBOS-RACI-200` (runtime parity) |

Tags: `M01-Org`, `M01-CC`. Security: `bearerAuth` | `internalApiKey`. Headers: `x-tenant-id`, `x-company-id` (matrix/cell/coverage).

### Components (G-DTO-W2-RACI-01 fold)

| Schema | Maps to |
|--------|---------|
| `UpsertRaciMatrixCellRequest` | `{ activity_id, org_column_id, raci_letters?, actor_id? }` — `^[RACI]*$` |
| `RaciCatalogData` / `RaciActivityRow` / `RaciDomainSummary` | catalog payload |
| `RaciCompanyMatrixData` / `RaciMatrixRow` | matrix GET |
| `CompanyRaciMatrixCell` | upsert RETURNING row (snake_case) |
| `RaciCapabilityListData` / `RaciCapabilityRow` | capabilities |
| `RaciCoverageData` | coverage aggregate |

Error codes documented: `XBOS-RACI-400`, `XBOS-RACI-404`, `XBOS-RACI-503`, `XBOS-AUTH-001`, `SCOPE_CONTEXT_MISMATCH`.

### Version bump

`info.version`: `1.2.3-p1-s2` → `1.2.4-p1-s2` (+ G-OA-W2-RACI-01 / G-DTO-W2-RACI-01 note in description).

### Files touched

| Path | Change |
|------|--------|
| `docs/api/openapi/xbos-api.yaml` | ADD 5 paths + 11 schemas + version note |
| `docs/qa/evidence/be-xbos-oa-raci-governance-01-20260722.md` | this evidence |

**Not touched:** `apps/**`, seed, FE, CC-CAT OpenAPI, Phase1/PROD claims.

---

## 4. Verify

```text
pnpm run verify:openapi-m01
→ PASS verify-openapi-m01 docs/api/openapi/xbos-api.yaml
exit 0
```

Grep confirmation (yaml):

- `operationId: raciGovernanceListCatalog` / `GetCompanyMatrix` / `UpsertMatrixCell` / `ListCapabilities` / `GetCoverage`
- `/raci-governance/catalog` · `…/matrix` · `…/matrix/cell` · `…/capabilities` · `…/coverage`
- `UpsertRaciMatrixCellRequest` / `RaciCompanyMatrixData` / `CompanyRaciMatrixCell`
- `G-OA-W2-RACI-01` / `G-DTO-W2-RACI-01` in `info.description`
- `XBOS-RACI-200` / `XBOS-RACI-201` / `XBOS-RACI-400` / `404` / `503`

---

## 5. Residual

| Gap | Status | Follow-up |
|-----|--------|-----------|
| **G-OA-W2-RACI-01** raci-governance OpenAPI | **CLOSED** (this Task) | QA spot |
| **G-DTO-W2-RACI-01** cell body schema in yaml | **CLOSED** (folded) | Nest class-validator DTO still optional P2 if TM opens apps |
| **G-OA-W2-CC-CAT-01** | **OPEN** — separate queue | **not** this Task |
| Nest `Record<string, unknown>` at edge | P2 residual | only if TM requires runtime DTO |

---

## 6. Handoff

- **ack_status:** `READY_FOR_QA`
- **next_owner:** `qa`
- **evidence_path:** `docs/qa/evidence/be-xbos-oa-raci-governance-01-20260722.md`

### next_dispatch_prompt

```text
work_item_id: QA-XBOS-OA-RACI-GOVERNANCE-01
from_role: pm
to_role: qa
lane: execution
priority: P1

entry_criteria:
- BE-XBOS-OA-RACI-GOVERNANCE-01 READY_FOR_QA
- evidence: docs/qa/evidence/be-xbos-oa-raci-governance-01-20260722.md
- OpenAPI: docs/api/openapi/xbos-api.yaml has raci-governance catalog + matrix + matrix/cell (+ capabilities/coverage) + UpsertRaciMatrixCellRequest
- TechSpec SoT gap ID: G-OA-W2-RACI-01 (FR-XBOS-RACI-02) + G-DTO-W2-RACI-01 folded — not CC-CAT

exit_criteria:
1. Confirm yaml contains operationIds raciGovernanceListCatalog + GetCompanyMatrix + UpsertMatrixCell (+ ListCapabilities + GetCoverage)
2. Confirm schemas UpsertRaciMatrixCellRequest (snake_case body) + RaciCompanyMatrixData + CompanyRaciMatrixCell + XBOS-RACI-200/201/400/404/503
3. pnpm verify:openapi-m01 exit 0
4. Spot-check runtime parity (read-only): raci-governance.controller.ts routes — no FE mutate, U65 no seed
5. must_keep UF-XBOS-07 🟢 — do not regress RACI matrix UX; cấm reopen CC-CAT in this QA
6. Evidence docs/qa/evidence/qa-xbos-oa-raci-governance-01-20260722.md → PASS_TO_PM
cấm: CC-CAT · seed · FE · claim Phase1/PROD · apps rewrite
```
