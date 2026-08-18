# BE-HRM-IM-PREVIEW-HTTP-ALIGN-01 — Align preview HTTP status

| Field | Value |
|-------|--------|
| **work_item_id** | `BE-HRM-IM-PREVIEW-HTTP-ALIGN-01` |
| **from_role** | `dev-be` |
| **to_role** | `qa` |
| **lane** | execution · close QA residual (sponsor zero-residual) |
| **date** | 2026-07-27 |
| **workspace** | `C:\xevn-ecosystem` |
| **entry** | QA residual Preview HTTP **201** vs OpenAPI `'200'` · envelope `SHEET-200` OK |
| **ack_status** | **READY_FOR_QA** |
| **U65** | honored — no seed · no invent staging · no IM-02 claim |

---

## 1. Decision (SoT)

| Option | Meaning | Verdict |
|--------|---------|---------|
| A | Nest returns **200** + `SHEET-200`; OpenAPI/`API_DESIGN` keep `'200'` | **SELECTED** |
| B | Nest keeps Nest POST default **201**; document OpenAPI `'201'` + `SHEET-200` | Rejected |

**Rationale:** `docs/hrm/API_DESIGN_HRM_IMPORT_PREVIEW.md` §A Identity = HTTP **200** · `SHEET-200`; team residual `SRS_HRM_IM_01_RESIDUAL_TEAM.md` §3 Network = **200** `SHEET-200`. Envelope code already correct; only Nest default POST→201 was wrong.

**Root cause:** `SpreadsheetController.importPreview` had no `@HttpCode` → NestJS POST default **201 Created**.

---

## 2. Changes

| Artifact | Change |
|----------|--------|
| `apps/api/hrm-api/src/spreadsheet/spreadsheet.controller.ts` | `@HttpCode(HttpStatus.OK)` on `importPreview` · `@CODE-MEMORY-CHANGE` APPEND |
| `spreadsheet.controller.spec.ts` | Assert `HTTP_CODE_METADATA` = 200 + body `SHEET-200` |
| `docs/api/openapi/hrm-api.yaml` | version `1.3.3-im-preview-http` · lock text HTTP status 200 · response desc `HTTP 200 · SHEET-200` |
| `scripts/verify-openapi-hrm-p1-s3b.mjs` | version needle + HTTP 200 needles (55 checks) |
| `docs/hrm/API_DESIGN_HRM_IMPORT_PREVIEW.md` | §A Identity note Nest `@HttpCode` · residual **G-IM-HTTP-200 CLOSED** |

**must_keep verified:** IM-01 non-persist · no staging · no IM-02 path change · U65 · FL-01 untouched.

---

## 3. Verification

| Command | Result |
|---------|--------|
| `pnpm --filter hrm-api exec jest --testPathPatterns=spreadsheet.controller.spec --no-coverage` | **PASS** · **8/8** |
| `pnpm run verify:openapi-hrm-p1-s3b` | **PASS** · **55** checks · EXIT 0 |

---

## 4. spec_read_ack

```markdown
## spec_read_ack
- srs: docs/hrm/SRS_HRM_IM_01_RESIDUAL_TEAM.md §3 Network 200 SHEET-200 · docs/client-delivery/hrm/SRS_HRM_KHACH.md §3.32 FR-HRM-IM-01
- tech_spec: docs/hrm/TECHSPEC.md §16.2 row 32 · SHEET-200
- db_design: docs/hrm/DB_DESIGN_HRM_IMPORT_PREVIEW.md · N/A table (non-persist)
- api_design: docs/hrm/API_DESIGN_HRM_IMPORT_PREVIEW.md §A · HTTP 200 · SHEET-200 · Diễn biến #1–#8
- sponsor_confirm: residual close from QA-HRM-OA-IMPORT-FLEET-01 · PM DISPATCHED BE-HRM-IM-PREVIEW-HTTP-ALIGN-01
```

---

## 5. Residual

| ID | Sev | Note |
|----|-----|------|
| Commit OpenAPI `'200'` vs envelope `SHEET-201` | Info | **OUT** this WI (IM-02) — not touched |
| Browser UF IM-01 | — | Separate `QA-HRM-IM-01-PREVIEW-AC-01` if open |
| Phase1 / PROD | — | **NOT claimed** |

---

## 6. Handoff

### completion_report

**Closed:** Align Nest runtime + OpenAPI + API_DESIGN for import preview success = HTTP **200** + envelope **`SHEET-200`**. Root cause Nest POST default 201 fixed via `@HttpCode(OK)`. Verify needles 55 PASS; jest 8/8; G-IM-HTTP-200 CLOSED. No staging / seed / IM-02 / FL-01 changes.

**Residual:** IM-02 commit status doc mismatch (optional later); browser IM AC separate.

### next_owner

`qa`

### next_dispatch_prompt

```text
work_item_id: QA-HRM-IM-PREVIEW-HTTP-ALIGN-01
from_role: pm
to_role: qa
lane: execution · spot verify only
entry_criteria: BE-HRM-IM-PREVIEW-HTTP-ALIGN-01 READY_FOR_QA · evidence docs/qa/evidence/be-hrm-im-preview-http-align-01-20260727.md
exit_criteria:
  1) pnpm run verify:openapi-hrm-p1-s3b EXIT 0 (55 checks; version 1.3.3-im-preview-http; needles HTTP status 200 + HTTP 200 · SHEET-200)
  2) Optional L1 if stack up: POST /api/hrm/spreadsheet/import/preview → HTTP **200** (not 201) + body code SHEET-200 · dryRun · U65 no seed
  3) Confirm G-IM-HTTP-200 CLOSED in API_DESIGN residual table
  4) Evidence docs/qa/evidence/qa-hrm-im-preview-http-align-01-20260727.md · PASS_TO_PM
cấm: invent staging · seed · claim IM-02 · Phase1/PROD · browser full UF (out of spot)
must_keep: IM-01 non-persist · FL-01 untouched · U65
```

### evidence_path

`docs/qa/evidence/be-hrm-im-preview-http-align-01-20260727.md`

### ack_status

`READY_FOR_QA`
