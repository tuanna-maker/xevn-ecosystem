# BE-XBOS-OA-SHAREHOLDERS-01 — OpenAPI G-OA-04 (FR-CC-P0-01 shareholders)

| Field | Value |
|-------|--------|
| **work_item_id** | `BE-XBOS-OA-SHAREHOLDERS-01` |
| **from_role** | dev-be |
| **to_role** | qa |
| **lane** | execution |
| **date** | 2026-07-22 (ICT) |
| **ack_status** | **READY_FOR_QA** |
| **gap closed** | **G-OA-04** (TechSpec §14.6 / §14.13 — shareholders CRUD OpenAPI) |
| **scope** | OpenAPI yaml **ONLY** — no runtime / FE rewrite |

> **ID note:** PM/QA residual sometimes labeled this ticket “G-OA-03”. Authoritative SoT is `docs/xbos/TECHSPEC.md` §14.13: **G-OA-04** = shareholders (`BE-XBOS-OA-SHAREHOLDERS-01`); **G-OA-03** = documents (`BE-XBOS-OA-LEGAL-DOCS-01`) — **out of scope** this Task.

## 1. spec_read_ack

| Artifact | Cite |
|----------|------|
| tech_spec | `docs/xbos/TECHSPEC.md` **§14.6** FR-CC-P0-01 · **§14.13** G-OA-04 · **§15** yaml sync |
| CC P0 | `docs/xbos/COMMAND_CENTER_P0_TECHSPEC.md` §2 table · §4 API · §6 `XBOS-SHR-*` |
| TM packet | `docs/qa/evidence/tm-xbos-code-spec-convention-01-20260722.md` §3 G-OA-04 row |
| prior OA | `docs/qa/evidence/be-xbos-oa-select-membership-01-20260722.md` (G-OA-02 PASS pattern) |
| runtime SoT (read-only) | `apps/api/xbos-api/src/legal-entity-profile/legal-entity-profile.controller.ts` + `.service.ts` (`ShareholderInput`) |
| OpenAPI SoT | `docs/api/openapi/xbos-api.yaml` |

**change_mode:** ADD (contract documentation)  
**must_keep:** UF-XBOS-04/05 🟢 — no product behavior change; documents / G-OA-03 **out of scope**.

---

## 2. Micro-checklist

| # | Item | Status |
|---|------|--------|
| 1 | `spec_read_ack` in evidence | **DONE** (§1) |
| 2 | ADD shareholders paths + schemas to `xbos-api.yaml` | **DONE** |
| 3 | `pnpm verify:openapi-m01` exit 0 | **DONE** (see §4) |
| 4 | Evidence this path | **DONE** |
| 5 | READY_FOR_QA | **DONE** |

---

## 3. OpenAPI delta (ADD)

### Paths

| Method | Path | operationId | Envelope |
|--------|------|-------------|----------|
| GET | `/org-foundation/legal-entities/{entityId}/shareholders` | `orgFoundationListShareholders` | `XBOS-SHR-200` |
| POST | `/org-foundation/legal-entities/{entityId}/shareholders` | `orgFoundationCreateShareholder` | `XBOS-SHR-201` (HTTP 201) |
| PUT | `…/shareholders/{shareholderId}` | `orgFoundationUpdateShareholder` | `XBOS-SHR-201` (HTTP 200) |
| DELETE | `…/shareholders/{shareholderId}` | `orgFoundationDeleteShareholder` | `XBOS-SHR-204` (HTTP 200, soft-delete) |

Tags: `M01-Org`, `M01-CC`. Security: `bearerAuth` | `internalApiKey`. Headers: `x-tenant-id`, `x-company-id`.

### Components

| Schema | Maps to |
|--------|---------|
| `CreateShareholderRequest` | `ShareholderInput` camelCase (`holderName` required; `ratioPercent` 0–100) |
| `UpdateShareholderRequest` | Partial `ShareholderInput` |
| `LegalEntityShareholder` | DB row snake_case (`holder_name`, `ratio_percent`, …) |
| `ShareholderListData` | `{ items: LegalEntityShareholder[] }` |
| `ShareholderDeletedData` | `{ deleted: true }` |

Error codes documented: `XBOS-SHR-400`, `XBOS-SHR-404`, `XBOS-AUTH-001`, `XBOS-DOC-404` (entity partition), `SCOPE_CONTEXT_MISMATCH`.

### Version bump

`info.version`: `1.2.1-p1-s2` → `1.2.2-p1-s2` (+ G-OA-04 note in description).

### Files touched

| Path | Change |
|------|--------|
| `docs/api/openapi/xbos-api.yaml` | ADD 2 path groups + 5 schemas + version note |
| `docs/qa/evidence/be-xbos-oa-shareholders-01-20260722.md` | this evidence |

**Not touched:** `apps/**`, seed, documents (G-OA-03 / OA-legal-docs), portal FE, Phase1/PROD claims.

---

## 4. Verify

```text
pnpm run verify:openapi-m01
→ PASS verify-openapi-m01 docs/api/openapi/xbos-api.yaml
exit 0
```

Grep confirmation (yaml):

- `operationId: orgFoundationListShareholders` / `CreateShareholder` / `UpdateShareholder` / `DeleteShareholder`
- `/org-foundation/legal-entities/{entityId}/shareholders`
- `CreateShareholderRequest` / `LegalEntityShareholder` / `ShareholderListData`
- `G-OA-04` in `info.description`

---

## 5. Residual

| Gap | Status | Follow-up |
|-----|--------|-----------|
| **G-OA-03** documents + upload OpenAPI | OPEN | `BE-XBOS-OA-LEGAL-DOCS-01` (separate; PM “OA-04” alias in prior residual) |
| **G-DTO-02** document DTO components | OPEN | fold with legal-docs OA ticket |
| TechSpec §14.6 PARTIAL → CLOSED wording | optional SA/TM doc delta | not required for yaml Task |

---

## 6. Handoff

- **ack_status:** `READY_FOR_QA`
- **next_owner:** `qa`
- **evidence_path:** `docs/qa/evidence/be-xbos-oa-shareholders-01-20260722.md`

### next_dispatch_prompt

```text
work_item_id: QA-XBOS-OA-SHAREHOLDERS-01
from_role: pm
to_role: qa
lane: execution
priority: P1

entry_criteria:
- BE-XBOS-OA-SHAREHOLDERS-01 READY_FOR_QA
- evidence: docs/qa/evidence/be-xbos-oa-shareholders-01-20260722.md
- OpenAPI: docs/api/openapi/xbos-api.yaml has shareholders CRUD + CreateShareholderRequest / LegalEntityShareholder
- TechSpec SoT gap ID: G-OA-04 (FR-CC-P0-01) — not documents

exit_criteria:
1. Confirm yaml contains operationIds orgFoundationListShareholders + Create/Update/DeleteShareholder
2. Confirm schemas CreateShareholderRequest (camelCase) + LegalEntityShareholder (snake_case) + XBOS-SHR-200/201/204
3. pnpm verify:openapi-m01 exit 0
4. Spot-check runtime parity (read-only): legal-entity-profile.controller shareholders routes — no FE mutate, U65 no seed
5. must_keep UF-XBOS-04/05 🟢 — do not regress CC shareholder UX
6. Evidence docs/qa/evidence/qa-xbos-oa-shareholders-01-20260722.md → PASS_TO_PM
cấm: documents OpenAPI (G-OA-03 / LEGAL-DOCS) · seed · claim Phase1/PROD · apps rewrite
```
