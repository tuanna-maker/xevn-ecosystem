# BE-XBOS-OA-LEGAL-DOCS-01 — OpenAPI G-OA-03 (FR-XBOS-ORG-03 documents)

| Field | Value |
|-------|--------|
| **work_item_id** | `BE-XBOS-OA-LEGAL-DOCS-01` |
| **from_role** | dev-be |
| **to_role** | qa |
| **lane** | execution |
| **date** | 2026-07-22 (ICT) |
| **ack_status** | **READY_FOR_QA** |
| **gap closed** | **G-OA-03** + **G-DTO-02** (TechSpec §14.5 / §14.13 — documents CRUD + upload + DTO components) |
| **scope** | OpenAPI yaml **ONLY** — no runtime / FE rewrite |

> **ID SoT:** TechSpec §14.13 **G-OA-03** = documents (`BE-XBOS-OA-LEGAL-DOCS-01`). Shareholders = **G-OA-04** — **cấm reopen** (QA shareholders PASS).

## 1. spec_read_ack

| Artifact | Cite |
|----------|------|
| tech_spec | `docs/xbos/TECHSPEC.md` **§14.5** FR-XBOS-ORG-03 · **§14.13** G-OA-03 / G-DTO-02 · **§15** yaml sync |
| CC P0 | `docs/xbos/COMMAND_CENTER_P0_TECHSPEC.md` §2 `xbos_legal_entity_document` · §3 storage · §4 API · §6 `XBOS-DOC-*` |
| TM packet | `docs/qa/evidence/tm-xbos-code-spec-convention-01-20260722.md` §3 G-OA-03 row (+ fold G-DTO-02) |
| prior OA | `docs/qa/evidence/be-xbos-oa-shareholders-01-20260722.md` (G-OA-04 PASS pattern) · `qa-xbos-oa-shareholders-01-20260722.md` residual → this ticket |
| runtime SoT (read-only) | `apps/api/xbos-api/src/legal-entity-profile/legal-entity-profile.controller.ts` + `.service.ts` (`DocumentInput`) |
| OpenAPI SoT | `docs/api/openapi/xbos-api.yaml` |

**change_mode:** ADD (contract documentation)  
**must_keep:** UF-XBOS-03/06 🟢 — no product behavior change; **G-OA-04 shareholders** not touched.

**spec says / code does:** Spec requires documents + upload in OpenAPI M01; runtime CC P0 already has list/create/update/delete/upload/stream — yaml previously had zero `/documents` paths. This Task closes contract gap only.

---

## 2. Micro-checklist

| # | Item | Status |
|---|------|--------|
| 1 | `spec_read_ack` in evidence | **DONE** (§1) |
| 2 | ADD documents paths + schemas (+ upload) to `xbos-api.yaml` | **DONE** |
| 3 | fold G-DTO-02 (document DTO components) | **DONE** |
| 4 | `pnpm verify:openapi-m01` exit 0 | **DONE** (see §4) |
| 5 | Evidence + READY_FOR_QA | **DONE** |

---

## 3. OpenAPI delta (ADD)

### Paths

| Method | Path | operationId | Envelope / note |
|--------|------|-------------|-----------------|
| GET | `/org-foundation/legal-entities/{entityId}/documents` | `orgFoundationListDocuments` | `XBOS-DOC-200` |
| POST | `/org-foundation/legal-entities/{entityId}/documents` | `orgFoundationCreateDocument` | `XBOS-DOC-201` (HTTP 201) |
| PUT | `…/documents/{documentId}` | `orgFoundationUpdateDocument` | `XBOS-DOC-201` (HTTP 200) |
| DELETE | `…/documents/{documentId}` | `orgFoundationDeleteDocument` | `XBOS-DOC-204` (soft-delete) |
| POST | `…/documents/{documentId}/upload` | `orgFoundationUploadDocumentFile` | multipart `file`; `XBOS-DOC-201`; 413/415 |
| GET | `/org-foundation/legal-documents/{documentId}/file` | `orgFoundationStreamDocumentFile` | raw binary; security `[]` (runtime parity) |

Tags: `M01-Org`, `M01-CC`. CRUD security: `bearerAuth` | `internalApiKey`. Headers: `x-tenant-id`, `x-company-id`.

### Components (G-DTO-02 fold)

| Schema | Maps to |
|--------|---------|
| `CreateDocumentRequest` | `DocumentInput` camelCase (`documentName` required; `documentCode`, `issuedDate`, `expiredDate`) |
| `UpdateDocumentRequest` | Partial `DocumentInput` (COALESCE) |
| `LegalEntityDocument` | DB row snake_case (`document_name`, `file_url`, `storage_path`, `mime_type`, `file_size`, …) |
| `DocumentListData` | `{ items: LegalEntityDocument[] }` |
| `DocumentDeletedData` | `{ deleted: true }` |

Error codes documented: `XBOS-DOC-400`, `XBOS-DOC-404`, `XBOS-DOC-413`, `XBOS-DOC-415`, `XBOS-AUTH-001`, `SCOPE_CONTEXT_MISMATCH`.

### Version bump

`info.version`: `1.2.2-p1-s2` → `1.2.3-p1-s2` (+ G-OA-03 / G-DTO-02 note in description).

### Files touched

| Path | Change |
|------|--------|
| `docs/api/openapi/xbos-api.yaml` | ADD 4 path groups + 5 schemas + version note |
| `docs/qa/evidence/be-xbos-oa-legal-docs-01-20260722.md` | this evidence |

**Not touched:** `apps/**`, seed, shareholders OpenAPI (G-OA-04), portal FE, Phase1/PROD claims.

---

## 4. Verify

```text
pnpm run verify:openapi-m01
→ PASS verify-openapi-m01 docs/api/openapi/xbos-api.yaml
exit 0
```

Grep confirmation (yaml):

- `operationId: orgFoundationListDocuments` / `CreateDocument` / `UpdateDocument` / `DeleteDocument` / `UploadDocumentFile` / `StreamDocumentFile`
- `/org-foundation/legal-entities/{entityId}/documents`
- `/org-foundation/legal-documents/{documentId}/file`
- `CreateDocumentRequest` / `LegalEntityDocument` / `DocumentListData`
- `G-OA-03` / `G-DTO-02` in `info.description`
- `XBOS-DOC-200` / `201` / `204` / `413` / `415`

---

## 5. Residual

| Gap | Status | Follow-up |
|-----|--------|-----------|
| **G-OA-03** documents + upload OpenAPI | **CLOSED** (this Task) | QA spot |
| **G-DTO-02** document DTO components | **CLOSED** (folded) | — |
| **G-OA-04** shareholders | **CLOSED** prior — **do not reopen** | — |
| Legal-entity **profile** body schemas (ORG create/upsert deep DTO) | optional later if TM opens | out of G-DTO-02 fold for documents |
| TechSpec §14.5 PARTIAL → CLOSED wording | optional SA/TM doc delta | not required for yaml Task |

---

## 6. Handoff

- **ack_status:** `READY_FOR_QA`
- **next_owner:** `qa`
- **evidence_path:** `docs/qa/evidence/be-xbos-oa-legal-docs-01-20260722.md`

### next_dispatch_prompt

```text
work_item_id: QA-XBOS-OA-LEGAL-DOCS-01
from_role: pm
to_role: qa
lane: execution
priority: P1

entry_criteria:
- BE-XBOS-OA-LEGAL-DOCS-01 READY_FOR_QA
- evidence: docs/qa/evidence/be-xbos-oa-legal-docs-01-20260722.md
- OpenAPI: docs/api/openapi/xbos-api.yaml has documents CRUD + upload + file stream + CreateDocumentRequest / LegalEntityDocument
- TechSpec SoT gap ID: G-OA-03 (FR-XBOS-ORG-03) + G-DTO-02 folded — not shareholders

exit_criteria:
1. Confirm yaml contains operationIds orgFoundationListDocuments + Create/Update/DeleteDocument + UploadDocumentFile + StreamDocumentFile
2. Confirm schemas CreateDocumentRequest (camelCase) + LegalEntityDocument (snake_case) + XBOS-DOC-200/201/204 + upload 413/415
3. pnpm verify:openapi-m01 exit 0
4. Spot-check runtime parity (read-only): legal-entity-profile.controller documents + upload + legal-documents/:id/file — no FE mutate, U65 no seed
5. must_keep UF-XBOS-03/06 🟢 — do not regress CC document UX; cấm reopen G-OA-04 shareholders
6. Evidence docs/qa/evidence/qa-xbos-oa-legal-docs-01-20260722.md → PASS_TO_PM
cấm: reopen G-OA-04 · seed · FE · claim Phase1/PROD · apps rewrite
```
