# QA-XBOS-OA-SHAREHOLDERS-01 — OpenAPI G-OA-04 spot verify

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-XBOS-OA-SHAREHOLDERS-01` |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | execution |
| **date** | 2026-07-22 (ICT) |
| **priority** | P1 |
| **ack_status** | **PASS_TO_PM** |
| **verdict** | **PASS** |
| **entry** | `docs/qa/evidence/be-xbos-oa-shareholders-01-20260722.md` |
| **gap closed** | **G-OA-04** (TechSpec §14.13 — shareholders CRUD OpenAPI) |
| **scope** | yaml + verify gate + read-only controller parity — **no** FE mutate, seed, documents OA, apps rewrite |

> **ID note:** Authoritative SoT = TechSpec §14.13 **G-OA-04** = shareholders. Documents = **G-OA-03** / `BE-XBOS-OA-LEGAL-DOCS-01` — **out of scope**.

## 1. Micro-checklist

| # | Item | Result |
|---|------|--------|
| 1 | yaml operationIds list/create/update/delete shareholders | **PASS** |
| 2 | schemas `CreateShareholderRequest` + `LegalEntityShareholder` + XBOS-SHR envelopes | **PASS** |
| 3 | `pnpm verify:openapi-m01` exit 0 | **PASS** |
| 4 | Read-only controller parity note | **PASS** |
| 5 | Evidence this path · `PASS_TO_PM` | **PASS** |

## 2. OpenAPI yaml confirmation

**SoT:** `docs/api/openapi/xbos-api.yaml`

### operationIds

| operationId | Method | Path | Present |
|-------------|--------|------|---------|
| `orgFoundationListShareholders` | GET | `/org-foundation/legal-entities/{entityId}/shareholders` | yes (L629) |
| `orgFoundationCreateShareholder` | POST | same collection | yes (L681) |
| `orgFoundationUpdateShareholder` | PUT | `…/shareholders/{shareholderId}` | yes (L745) |
| `orgFoundationDeleteShareholder` | DELETE | same item | yes (L811) |

Tags: `M01-Org`, `M01-CC`. Security: `bearerAuth` | `internalApiKey`. Headers: `x-tenant-id`, `x-company-id`.

### Schemas + envelopes

| Marker | Present |
|--------|---------|
| `CreateShareholderRequest` | yes — camelCase; `holderName` required; `ratioPercent` 0–100 |
| `UpdateShareholderRequest` | yes — partial ShareholderInput |
| `LegalEntityShareholder` | yes — snake_case row (`holder_name`, `ratio_percent`, …) |
| `ShareholderListData` | yes — `{ items: LegalEntityShareholder[] }` |
| `ShareholderDeletedData` | yes — `{ deleted: true }` |
| Envelope `XBOS-SHR-200` | yes — GET 200 |
| Envelope `XBOS-SHR-201` | yes — POST 201 + PUT 200 |
| Envelope `XBOS-SHR-204` | yes — DELETE 200 |
| Errors `XBOS-SHR-400` / `XBOS-SHR-404` / `XBOS-AUTH-001` / `XBOS-DOC-404` / `SCOPE_CONTEXT_MISMATCH` | yes |
| `G-OA-04` in path description | yes (list summary/description) |

## 3. Verify gate

```text
pnpm run verify:openapi-m01
→ PASS verify-openapi-m01 …/docs/api/openapi/xbos-api.yaml
exit 0
```

(QA re-ran 2026-07-22; matches BE evidence §4.)

## 4. Runtime parity (read-only — no mutate)

**Runtime SoT:** `apps/api/xbos-api/src/legal-entity-profile/legal-entity-profile.controller.ts` + `.service.ts`  
**OpenAPI SoT:** `docs/api/openapi/xbos-api.yaml`

| Runtime | OpenAPI | Match |
|---------|---------|-------|
| `@Controller('org-foundation')` + `@Get('legal-entities/:entityId/shareholders')` | path `/org-foundation/legal-entities/{entityId}/shareholders` | **OK** |
| `ok({ items }, 'XBOS-SHR-200', …)` | response 200 `XBOS-SHR-200` + `ShareholderListData` | **OK** |
| `@Post(…)` → `ok(…, 'XBOS-SHR-201')` (Nest POST default HTTP 201) | response 201 `XBOS-SHR-201` + `CreateShareholderRequest` | **OK** |
| `@Put(…/:shareholderId)` → `ok(…, 'XBOS-SHR-201')` | response 200 `XBOS-SHR-201` + `UpdateShareholderRequest` | **OK** |
| `@Delete(…)` → `ok({ deleted: true }, 'XBOS-SHR-204')` | response 200 `XBOS-SHR-204` + `ShareholderDeletedData` | **OK** |
| `ShareholderInput` camelCase (`holderName`, `ratioPercent` 0–100 → `XBOS-SHR-400`) | `CreateShareholderRequest` | **OK** |
| DB `RETURNING *` / `SELECT *` snake_case | `LegalEntityShareholder` | **OK** |
| Missing row → `XBOS-SHR-404`; entity missing → `XBOS-DOC-404` | documented 404 | **OK** |
| Auth via `assertInternal` → `XBOS-AUTH-001` | response 401 | **OK** |

**FE / UF:** yaml-only wave — **no** FE mutate, **no** browser UF, **U65 no seed**.  
**must_keep:** UF-XBOS-04/05 🟢 — not exercised; no portal regression expected (documentation-only).

**Out of scope (not touched):** documents routes (`listDocuments` / upload), G-OA-03, Phase1/PROD claims, `apps/**` rewrite.

## 5. Residual

| Item | Status | Next |
|------|--------|------|
| **G-OA-03** documents + upload OpenAPI | OPEN | `BE-XBOS-OA-LEGAL-DOCS-01` |
| **G-DTO-02** document DTO components | OPEN | fold with legal-docs OA |
| FE mutate / browser UF-XBOS-05 | N/A | not required this wave |
| Seed / Phase1 / PROD claim | **cấm** — not touched | — |

## 6. Handoff

- **ack_status:** `PASS_TO_PM`
- **next_owner:** `pm` → dispatch **dev-be** `BE-XBOS-OA-LEGAL-DOCS-01`
- **evidence_path:** `docs/qa/evidence/qa-xbos-oa-shareholders-01-20260722.md`
- **closed:** G-OA-04 shareholders CRUD yaml + schemas + verify:openapi-m01 + runtime parity

### next_dispatch_prompt

```text
work_item_id: BE-XBOS-OA-LEGAL-DOCS-01
from_role: pm
to_role: dev-be
lane: execution
priority: P1

entry_criteria:
- QA-XBOS-OA-SHAREHOLDERS-01 PASS (G-OA-04 closed)
- evidence: docs/qa/evidence/qa-xbos-oa-shareholders-01-20260722.md
- TechSpec SoT: docs/xbos/TECHSPEC.md §14.13 G-OA-03 = documents (not shareholders)
- runtime read-only: legal-entity-profile.controller.ts documents + upload routes

exit_criteria:
1. ADD OpenAPI paths for legal-entity documents list/create/update/delete (+ upload if in FR) to docs/api/openapi/xbos-api.yaml
2. Components schemas for Document request/response DTOs (fold G-DTO-02 if tiny)
3. pnpm verify:openapi-m01 exit 0
4. Evidence docs/qa/evidence/be-xbos-oa-legal-docs-01-20260722.md → READY_FOR_QA
5. must_keep UF-XBOS 🟢 — yaml ONLY; no apps rewrite; no seed
cấm: re-open shareholders G-OA-04 · FE mutate · Phase1/PROD claim
```
