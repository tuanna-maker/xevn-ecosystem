# QA-XBOS-OA-LEGAL-DOCS-01 — OpenAPI G-OA-03 spot verify

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-XBOS-OA-LEGAL-DOCS-01` |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | execution |
| **date** | 2026-07-22 (ICT) |
| **priority** | P1 |
| **ack_status** | **PASS_TO_PM** |
| **verdict** | **PASS** |
| **entry** | `docs/qa/evidence/be-xbos-oa-legal-docs-01-20260722.md` |
| **gap closed** | **G-OA-03** + **G-DTO-02** (TechSpec §14.13 — documents CRUD + upload + DTO components) |
| **scope** | yaml + verify gate + read-only controller parity — **no** FE mutate, seed, Phase1/PROD, apps rewrite |

> **ID SoT:** TechSpec §14.13 **G-OA-03** = documents. Shareholders = **G-OA-04** — **not reopened** (prior QA PASS intact).

## 1. Micro-checklist

| # | Item | Result |
|---|------|--------|
| 1 | yaml docs CRUD + upload + file stream operationIds | **PASS** |
| 2 | schemas `CreateDocumentRequest` + `LegalEntityDocument` + XBOS-DOC envelopes | **PASS** |
| 3 | `pnpm verify:openapi-m01` exit 0 | **PASS** |
| 4 | Read-only controller parity | **PASS** |
| 5 | Evidence this path · `PASS_TO_PM` | **PASS** |

## 2. OpenAPI yaml confirmation

**SoT:** `docs/api/openapi/xbos-api.yaml`

### operationIds

| operationId | Method | Path | Present |
|-------------|--------|------|---------|
| `orgFoundationListDocuments` | GET | `/org-foundation/legal-entities/{entityId}/documents` | yes (L935) |
| `orgFoundationCreateDocument` | POST | same collection | yes (L987) |
| `orgFoundationUpdateDocument` | PUT | `…/documents/{documentId}` | yes (L1051) |
| `orgFoundationDeleteDocument` | DELETE | same item | yes (L1117) |
| `orgFoundationUploadDocumentFile` | POST | `…/documents/{documentId}/upload` | yes (L1171) |
| `orgFoundationStreamDocumentFile` | GET | `/org-foundation/legal-documents/{documentId}/file` | yes (L1259) |

Tags: `M01-Org`, `M01-CC`. CRUD security: `bearerAuth` | `internalApiKey`. Stream: `security: []` (runtime parity). Headers: `x-tenant-id`, `x-company-id`.

### Schemas + envelopes

| Marker | Present |
|--------|---------|
| `CreateDocumentRequest` | yes — camelCase; `documentName` required; `documentCode` / `issuedDate` / `expiredDate` optional |
| `UpdateDocumentRequest` | yes — partial DocumentInput (COALESCE) |
| `LegalEntityDocument` | yes — snake_case row (`document_name`, `file_url`, `storage_path`, `mime_type`, `file_size`, …) |
| `DocumentListData` | yes — `{ items: LegalEntityDocument[] }` |
| `DocumentDeletedData` | yes — `{ deleted: true }` |
| Envelope `XBOS-DOC-200` | yes — GET list 200 |
| Envelope `XBOS-DOC-201` | yes — POST create 201 + PUT 200 + upload 201 |
| Envelope `XBOS-DOC-204` | yes — DELETE 200 soft-delete |
| Errors `XBOS-DOC-400` / `404` / `413` / `415` / `XBOS-AUTH-001` / `SCOPE_CONTEXT_MISMATCH` | yes |
| Upload multipart `file` | yes — 413 / 415 documented |
| Stream raw binary | yes — not ApiEnvelope; `security: []` |
| `G-OA-03` / `G-DTO-02` in `info.description` | yes (L12) |

### G-OA-04 must_keep (not reopened)

| Marker | Present |
|--------|---------|
| `orgFoundationListShareholders` | yes (unchanged) |
| `CreateShareholderRequest` | yes (unchanged) |

## 3. Verify gate

```text
pnpm run verify:openapi-m01
→ PASS verify-openapi-m01 …/docs/api/openapi/xbos-api.yaml
exit 0
```

(QA re-ran 2026-07-22 ICT; matches BE evidence §4.)

## 4. Runtime parity (read-only — no mutate)

**Runtime SoT:** `apps/api/xbos-api/src/legal-entity-profile/legal-entity-profile.controller.ts` + `.service.ts`  
**OpenAPI SoT:** `docs/api/openapi/xbos-api.yaml`

| Runtime | OpenAPI | Match |
|---------|---------|-------|
| `@Controller('org-foundation')` + `@Get('legal-entities/:entityId/documents')` | path `/org-foundation/legal-entities/{entityId}/documents` | **OK** |
| `ok({ items }, 'XBOS-DOC-200', …)` | response 200 `XBOS-DOC-200` + `DocumentListData` | **OK** |
| `@Post(…)` → `ok(…, 'XBOS-DOC-201')` (Nest POST default HTTP 201) | response 201 `XBOS-DOC-201` + `CreateDocumentRequest` | **OK** |
| `@Put(…/:documentId)` → `ok(…, 'XBOS-DOC-201')` | response 200 `XBOS-DOC-201` + `UpdateDocumentRequest` | **OK** |
| `@Delete(…)` → `ok(…, 'XBOS-DOC-204')` | response 200 `XBOS-DOC-204` + `DocumentDeletedData` | **OK** |
| `@Post(…/upload)` + `FileInterceptor('file')` → `ok(…, 'XBOS-DOC-201')` | multipart upload + 201 `XBOS-DOC-201` | **OK** |
| `@Get('legal-documents/:documentId/file')` — no `assertInternal`; raw stream | path + `security: []` + binary | **OK** |
| `DocumentInput` camelCase (`documentName` required → `XBOS-DOC-400`) | `CreateDocumentRequest` | **OK** |
| Upload: missing file → `XBOS-DOC-400`; too large → `413`; MIME → `415` | documented 400/413/415 | **OK** |
| DB `RETURNING *` / `SELECT *` snake_case | `LegalEntityDocument` | **OK** |
| Auth via `assertInternal` → `XBOS-AUTH-001` (CRUD/upload) | response 401 | **OK** |

**FE / UF:** yaml-only wave — **no** FE mutate, **no** browser UF, **U65 no seed**.  
**must_keep:** UF-XBOS-03/06 🟢 — not exercised; no portal regression expected (documentation-only).  
**cấm:** G-OA-04 reopen · seed · Phase1/PROD claim · `apps/**` rewrite — **not touched**.

## 5. Residual

| Item | Status | Next |
|------|--------|------|
| **G-OA-03** documents + upload OpenAPI | **CLOSED** | — |
| **G-DTO-02** document DTO components | **CLOSED** (folded) | — |
| **G-OA-04** shareholders | **CLOSED** prior — not reopened | — |
| G-OA-02..04 chain | closed at yaml spot | PM close chain **or** QC sample gate |
| FE mutate / browser UF documents | N/A | not required this wave |
| Seed / Phase1 / PROD claim | **cấm** — not touched | — |

## 6. Handoff

- **ack_status:** `PASS_TO_PM`
- **next_owner:** `pm`
- **evidence_path:** `docs/qa/evidence/qa-xbos-oa-legal-docs-01-20260722.md`
- **closed:** G-OA-03 + G-DTO-02 documents CRUD/upload/stream yaml + schemas + verify:openapi-m01 + runtime parity

### next_dispatch_prompt

```text
work_item_id: PM-XBOS-OA-G-OA-02-04-CLOSE-01
from_role: qa
to_role: pm
lane: governance
priority: P1

entry_criteria:
- QA-XBOS-OA-SELECT-MEMBERSHIP-01 PASS (G-OA-02)
- QA-XBOS-OA-SHAREHOLDERS-01 PASS (G-OA-04)
- QA-XBOS-OA-LEGAL-DOCS-01 PASS (G-OA-03 + G-DTO-02)
- evidence: docs/qa/evidence/qa-xbos-oa-legal-docs-01-20260722.md

action:
- Close G-OA-02..04 OpenAPI chain on bus / TechSpec residual tracker
- OR dispatch QC sample gate on OpenAPI M01 (verify:openapi-m01 + spot 1 path per G-OA-*)
cấm: reopen G-OA-04 · seed · Phase1/PROD · FE mutate this wave
```
