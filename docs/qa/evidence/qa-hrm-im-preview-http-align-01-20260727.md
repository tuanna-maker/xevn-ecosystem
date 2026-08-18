# QA-HRM-IM-PREVIEW-HTTP-ALIGN-01 — Import preview HTTP status align

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-HRM-IM-PREVIEW-HTTP-ALIGN-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **lane** | execution · contract spot |
| **date** | 2026-07-27 |
| **workspace** | `C:\xevn-ecosystem` |
| **entry** | `BE-HRM-IM-PREVIEW-HTTP-ALIGN-01` READY_FOR_QA · prior residual Preview HTTP **201** vs OpenAPI `'200'` (`qa-hrm-oa-import-fleet-01`) |
| **ack_status** | **PASS_TO_PM** |
| **U65** | honored — no seed · no invent staging · no IM-02 / Phase1 / PROD claim |

---

## 1. Scope

Close Info/P3 residual from `QA-HRM-OA-IMPORT-FLEET-01`: Nest POST default **201** vs OpenAPI/API_DESIGN success **200** + envelope **`SHEET-200`**.

**Out of scope:** IM-02 commit · browser full UF (covered separately by `QA-HRM-IM-01-PREVIEW-AC-01`) · Phase1/PROD.

---

## 2. Alignment matrix (Nest · OpenAPI · API_DESIGN)

| Plane | Success contract | Evidence |
|-------|------------------|----------|
| **Nest** | `@HttpCode(HttpStatus.OK)` on `SpreadsheetController.importPreview` · body `ok(..., 'SHEET-200', ...)` | `apps/api/hrm-api/src/spreadsheet/spreadsheet.controller.ts` L131–159 |
| **OpenAPI** | `version: 1.3.3-im-preview-http` · `sheetPreview` responses `'200'` · desc `HTTP 200 · SHEET-200` · description locks Nest `@HttpCode(OK)` not 201 | `docs/api/openapi/hrm-api.yaml` |
| **API_DESIGN** | §A Identity HTTP **200** + `SHEET-200` · residual **G-IM-HTTP-200 CLOSED** | `docs/hrm/API_DESIGN_HRM_IMPORT_PREVIEW.md` §A + residual table |
| **Verify needles** | version + `HTTP status: 200` + `HTTP 200 · SHEET-200` | `scripts/verify-openapi-hrm-p1-s3b.mjs` |

**Verdict plane alignment:** **PASS** — all three SoTs agree: HTTP **200** + envelope **`SHEET-200`**.

---

## 3. Commands

| # | Command | Result |
|---|---------|--------|
| 1 | `pnpm run verify:openapi-hrm-p1-s3b` | **PASS** · **55** checks · **EXIT 0** |
| 2 | `pnpm --filter hrm-api exec jest --testPathPatterns=spreadsheet.controller.spec --no-coverage` | **PASS** · **8/8** (includes `HTTP_CODE_METADATA` = 200 + `SHEET-200`) |

---

## 4. Optional L1 (stack up · U65)

| Item | Value |
|------|--------|
| Endpoint | `POST http://127.0.0.1:28001/api/hrm/spreadsheet/import/preview` |
| Auth | `x-internal-api-key` (dev) · `x-tenant-id=xevn` · `x-company-id=main` |
| Multipart | `file` (1-row CSV) + `kind=employee_import` + `dryRun=true` |
| **HTTP status** | **200** (not 201) |
| Envelope | `success=true` · **`code=SHEET-200`** · message `Import preview` |
| Payload | `dryRun=true` · `rowCount=1` · `previewRows` len=1 · `errors=[]` · `truncated=false` |
| Persist | Preview path only — **no** commit · **no** seed · **no** staging invent |

Prior fleet L1 residual (**201** + `SHEET-200`) is **CLOSED** at runtime after BE `@HttpCode(OK)`.

---

## 5. Residual

| ID | Sev | Note |
|----|-----|------|
| IM-02 commit OpenAPI/`SHEET-201` doc mismatch | Info | **OUT** this WI — do not claim |
| Browser UF IM-01 | — | Separate WI `QA-HRM-IM-01-PREVIEW-AC-01` (already PASS_TO_PM same day — Network 200 confirmed) |
| Phase1 / PROD | — | **NOT claimed** |

---

## 6. Classification

| Class | Value |
|-------|--------|
| Layer | Integration / contract (OpenAPI + Nest runtime) |
| Blast | R1 (controller + yaml + verify needles — BE closed; QA spot only) |
| Product risk | Low — status align only; IM-01 non-persist invariant kept |

---

## 7. Handoff

### completion_report

**Closed:** Spot verify `QA-HRM-IM-PREVIEW-HTTP-ALIGN-01` — Nest `@HttpCode(OK)` + OpenAPI `1.3.3-im-preview-http` + API_DESIGN §A / **G-IM-HTTP-200 CLOSED** all lock HTTP **200** + **`SHEET-200`**. `verify:openapi-hrm-p1-s3b` **55 PASS EXIT 0**; jest controller **8/8**; optional L1 live POST → **HTTP 200** + `SHEET-200` + `dryRun=true` (U65, no seed). Prior OA-fleet Info residual **201 vs 200** closed.

**Residual:** IM-02 commit status docs OUT; no Phase1/PROD.

### next_owner

`pm`

### next_dispatch_prompt

```text
work_item_id: PM-INTAKE-HRM-IM-PREVIEW-HTTP-ALIGN-01
from_role: qa
to_role: pm
lane: governance intake
entry_criteria: QA-HRM-IM-PREVIEW-HTTP-ALIGN-01 PASS_TO_PM · evidence docs/qa/evidence/qa-hrm-im-preview-http-align-01-20260727.md
exit_criteria:
  1) Mark G-IM-HTTP-200 / preview HTTP 201 residual CLOSED on bus / residual tracker
  2) Do NOT reopen BE-HRM-IM-PREVIEW-HTTP-ALIGN-01 unless verify:openapi-hrm-p1-s3b fails
  3) Optional: if QC program requires formal GO on OpenAPI residual — dispatch QC spot audit this evidence (contract-only; no browser retest required)
  4) Continue parallel lanes (IM-01 browser QC if needed; IM-02 OUT)
cấm: seed · invent staging · claim IM-02 · Phase1/PROD
```

### evidence_path

`docs/qa/evidence/qa-hrm-im-preview-http-align-01-20260727.md`

### ack_status

`PASS_TO_PM`
