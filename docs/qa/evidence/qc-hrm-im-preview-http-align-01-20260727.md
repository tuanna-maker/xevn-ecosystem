# QC Gate — QC-HRM-IM-PREVIEW-HTTP-ALIGN-01 (2026-07-27)

| Field | Value |
|-------|--------|
| **work_item_id** | `QC-HRM-IM-PREVIEW-HTTP-ALIGN-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **lane** | governance · contract spot GO |
| **date** | `2026-07-27` (ICT) |
| **decision** | **GO WITH CONDITIONS** — Nest + OpenAPI + API_DESIGN lock HTTP **200** + **`SHEET-200`**; **G-IM-HTTP-200 CLOSED** |
| **scope_claim** | Contract/status align only for `POST /api/hrm/spreadsheet/import/preview` |
| **phase1_done_claim** | **NO** — NOT Phase 1 DONE |
| **prod_ready_claim** | **NO** — NOT PROD-READY · **HOLD_DEPLOY** |
| **im02_claim** | **NO** — NOT IM-02 |
| **ack_status** | **PASS_TO_PM** |
| **U65** | zero-seed — no invent staging · no FE reopen · no BE reopen |

---

## Scope (bounded — contract only)

| In scope | Explicitly out (cấm) |
|----------|----------------------|
| Audit Nest `@HttpCode(OK)` + OpenAPI `'200'` + API_DESIGN §A · `SHEET-200` | Browser full UF IM-01 (sibling `QC-HRM-IM-01-PREVIEW-AC-01`) |
| Confirm `verify:openapi-hrm-p1-s3b` PASS (QA cite + QC re-run) | Reopen `BE-HRM-IM-PREVIEW-HTTP-ALIGN-01` without FAIL |
| Close residual **G-IM-HTTP-200** / prior OA-fleet **201** | Claim IM-02 · Phase1 · PROD · `:8088` |
| GO/GWC + this evidence · PASS_TO_PM | Seed / invent staging tables |

**Upstream:**
- QA: `docs/qa/evidence/qa-hrm-im-preview-http-align-01-20260727.md` · `PASS_TO_PM`
- BE: `docs/qa/evidence/be-hrm-im-preview-http-align-01-20260727.md` · `READY_FOR_QA`

**Sibling (do not block):** `QC-HRM-IM-01-PREVIEW-AC-01` — product/browser AC lane parallel.

---

## Micro-checklist (exit criteria)

| # | Item | Result |
|---|------|--------|
| 1 | Nest + OpenAPI + API_DESIGN HTTP **200** + **`SHEET-200`** · **G-IM-HTTP-200 CLOSED** | **PASS** — §Alignment |
| 2 | `verify:openapi-hrm-p1-s3b` cited PASS in QA + QC re-run | **PASS** — 55 checks · EXIT **0** |
| 3 | GO or GWC · HOLD_DEPLOY · NOT IM-02 / Phase1 / PROD | **GWC** · HOLD_DEPLOY |
| 4 | Evidence this path · PASS_TO_PM | **PASS** |
| 5 | Append bus | **PASS** |

---

## Alignment audit (Nest · OpenAPI · API_DESIGN)

| Plane | SoT observation | Verdict |
|-------|-----------------|---------|
| **Nest** | `SpreadsheetController.importPreview` `@HttpCode(HttpStatus.OK)` · `return ok(..., 'SHEET-200', 'Import preview')` · CODE-MEMORY-CHANGE APPEND | **PASS** |
| **OpenAPI** | `info.version: 1.3.3-im-preview-http` · `operationId: sheetPreview` · `responses['200']` · desc `HTTP 200 · SHEET-200` · locks Nest `@HttpCode(OK)` not 201 | **PASS** |
| **API_DESIGN** | `docs/hrm/API_DESIGN_HRM_IMPORT_PREVIEW.md` §A Identity HTTP **200** + `SHEET-200` · residual table **G-IM-HTTP-200** = **CLOSED** | **PASS** |
| **Verify needles** | `scripts/verify-openapi-hrm-p1-s3b.mjs` — version + `HTTP status: 200` + `HTTP 200 · SHEET-200` | **PASS** |

**Prior OA-fleet residual (HTTP 201 vs `'200'`):** **CLOSED** by this align (envelope `SHEET-200` was already correct).

---

## Spot verify (QC)

### Command table

| Command | Result | Classification |
|---------|--------|----------------|
| `pnpm run verify:openapi-hrm-p1-s3b` | **PASS** exit **0** — `PASS verify-openapi-hrm-p1-s3b …/hrm-api.yaml (55 checks)` | PRODUCT (contract gate) |
| Spot grep Nest `@HttpCode(HttpStatus.OK)` + `SHEET-200` on `importPreview` | **Present** — `spreadsheet.controller.ts` | PRODUCT |
| Spot OpenAPI `version: 1.3.3-im-preview-http` + responses `'200'` + `HTTP 200 · SHEET-200` | **Present** — `docs/api/openapi/hrm-api.yaml` | PRODUCT |
| Spot API_DESIGN residual **G-IM-HTTP-200** = **CLOSED** | **Present** — `API_DESIGN_HRM_IMPORT_PREVIEW.md` | PRODUCT |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-hrm-im-preview-http-align-01-20260727.md` | **FAIL** 3/8 (`portal_url`, `journey_l25`, `crud_or_matrix`) | PROCESS — contract-only QA pack (expected) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-hrm-im-preview-http-align-01-20260727.md` | **PASS** exit **0** (8/8) — this QC pack | PROCESS |

**Portal URL / PORTAL_DEV_URL:** N/A for contract-only HTTP status gate — no browser UF in this WI (`PORTAL_DEV_URL` not required). Optional L1 cited by QA: `POST http://127.0.0.1:28001/api/hrm/spreadsheet/import/preview` → HTTP **200** + `SHEET-200` (U65).

**Journey / L2.5:** Browser L2.5 for import preview **N/A** on this contract WI — owned by sibling product lane `QC-HRM-IM-01-PREVIEW-AC-01` (J-HRM-02 employee context). OpenAPI/Nest contract slice **PASS** (matrix below).

### Read-only module / contract matrix

| Module / AC | Create | Read | Update | Delete | Note |
|-------------|--------|------|--------|--------|------|
| `sheetPreview` HTTP status | N/A | **PASS** 200 | N/A | N/A | Nest `@HttpCode(OK)` |
| Envelope code | N/A | **PASS** `SHEET-200` | N/A | N/A | must_keep IM-01 non-persist |
| OpenAPI `1.3.3-im-preview-http` | N/A | **PASS** | N/A | N/A | responses `'200'` |
| API_DESIGN §A / G-IM-HTTP-200 | N/A | **PASS** CLOSED | N/A | N/A | residual table |
| IM-02 commit path | — | **OUT** | — | — | not claimed |

### L2.5 journey coverage

| J-ID / slice | Status | Note |
|--------------|--------|------|
| Browser **J-HRM-02** / UF IM-01 mutate | **N/A** | Contract WI — L2.5 not in entry criteria; sibling product QC |
| OpenAPI/Nest HTTP-align G-IM-HTTP-200 | **PASS** | 200 + SHEET-200 three-plane lock |

**QC:** No L2.5 product NO-GO for this packet — journey browser coverage **not in scope** of contract spot.

---

## Classification (ENV vs PRODUCT)

| Signal | Type | QC finding |
|--------|------|------------|
| Nest POST default 201 → `@HttpCode(OK)` 200 | PRODUCT | **PASS** — CLOSED |
| OpenAPI `'200'` + `SHEET-200` + version needle | PRODUCT | **PASS** |
| API_DESIGN G-IM-HTTP-200 CLOSED | PRODUCT | **PASS** |
| `verify:openapi-hrm-p1-s3b` 55 EXIT 0 | PRODUCT | **PASS** (QC re-run) |
| QA optional L1 live POST 200 | PRODUCT | **PASS** (audit accept cite; U65) |
| QA Layer B pack 3/8 missing portal/J-*/matrix | PROCESS | **OPEN P3** — expected contract-only; QC pack 8/8 |
| Seed / invent staging / IM-02 | PROCESS U65 | **PASS** — none claimed |
| Phase1 / PROD / deploy | OUT OF SLICE | **HOLD_DEPLOY** · **NOT claimed** |

---

## Residual / Conditions

| ID | Severity | Status | Owner |
|----|----------|--------|-------|
| **HOLD_DEPLOY** | Program | OPEN | PM — local/contract GO only; no :8088 / PROD promote from this packet |
| **C-IM-HTTP-QA-PACK-01** | P3 PROCESS | OPEN | QA optional — enrich future contract packs with `PORTAL_DEV_URL` N/A + journey N/A + read-only matrix for Layer B 8/8 |
| IM-02 commit OpenAPI/`SHEET-201` mismatch | Info | OUT | Separate WI — **not reopened** |
| Sibling `QC-HRM-IM-01-PREVIEW-AC-01` | Product | Parallel | PM — do not block this contract close |
| Product P0/P1 on HTTP-align | — | **NONE** | — |
| BE reopen | — | **NO** | Only if `verify:openapi-hrm-p1-s3b` regresses |

---

## Verdict

**GO WITH CONDITIONS**

- **Closed:** Import preview success contract = HTTP **200** + envelope **`SHEET-200`** across Nest + OpenAPI `1.3.3-im-preview-http` + API_DESIGN §A; residual **G-IM-HTTP-200 CLOSED**; prior OA-fleet **201** residual CLOSED. QC re-ran `verify:openapi-hrm-p1-s3b` **55 PASS EXIT 0**. QA jest 8/8 + L1 200 cited accepted. **No BE reopen.**
- **Conditions:** **HOLD_DEPLOY**; **NOT** IM-02; **NOT** Phase 1 DONE; **NOT** PROD-READY; C-IM-HTTP-QA-PACK-01 P3 (QA Layer B 3/8 expected); browser UF owned by sibling product QC.
- **cấm honored:** no seed · no invent staging · no IM-02 claim · no BE reopen without FAIL.

---

## Handoff

### completion_report

**Closed:** Formal QC contract spot **GO WITH CONDITIONS** for `QC-HRM-IM-PREVIEW-HTTP-ALIGN-01`. Three-plane lock Nest `@HttpCode(OK)` + OpenAPI `'200'`/`SHEET-200` + API_DESIGN **G-IM-HTTP-200 CLOSED** audited; `verify:openapi-hrm-p1-s3b` **55 PASS EXIT 0** (QC re-run matches QA cite); prior fleet HTTP **201** residual CLOSED. Evidence pack this file 8/8. Sibling product `QC-HRM-IM-01-PREVIEW-AC-01` not blocked.

**Residual / conditions:** HOLD_DEPLOY · NOT IM-02 / Phase1 / PROD · C-IM-HTTP-QA-PACK-01 P3 soft · no Dev reopen.

### next_owner

`pm`

### next_dispatch_prompt

```text
work_item_id: PM-INTAKE-QC-HRM-IM-PREVIEW-HTTP-ALIGN-01
from_role: qc
to_role: pm
lane: governance intake
priority: P2

entry_criteria:
- QC-HRM-IM-PREVIEW-HTTP-ALIGN-01 = GO WITH CONDITIONS
- evidence: docs/qa/evidence/qc-hrm-im-preview-http-align-01-20260727.md
- G-IM-HTTP-200 CLOSED · verify:openapi-hrm-p1-s3b 55 PASS

action:
1. Bus INTAKE: mark G-IM-HTTP-200 / preview HTTP 201 residual CLOSED (product contract)
2. HOLD_DEPLOY — do not promote :8088 / PROD from this packet
3. Do NOT reopen BE-HRM-IM-PREVIEW-HTTP-ALIGN-01 unless verify:openapi-hrm-p1-s3b fails
4. Continue sibling QC-HRM-IM-01-PREVIEW-AC-01 (browser product) independently — do not merge scopes
5. Optional P3: QA Layer B enrich on future contract packs (C-IM-HTTP-QA-PACK-01)

cấm: seed · invent staging · claim IM-02 · Phase1/PROD · BE reopen without FAIL
```

### evidence_path

`docs/qa/evidence/qc-hrm-im-preview-http-align-01-20260727.md`

### ack_status

`PASS_TO_PM`
