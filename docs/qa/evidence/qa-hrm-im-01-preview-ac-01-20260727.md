# QA-HRM-IM-01-PREVIEW-AC-01 — FR-HRM-IM-01 browser AC (U65)

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-HRM-IM-01-PREVIEW-AC-01` |
| **from_role** | `pm` |
| **to_role** | `qa` |
| **lane** | execution · browser U65 (sponsor zero-seed) |
| **date** | 2026-07-27 |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| **env** | portal `http://127.0.0.1:5173` · hrm-api `:28001` · xbos-api `:28002` |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** |
| **HOLD_DEPLOY** | yes · **NOT** Phase1 / PROD / `:8088` |

---

## Classification

| Item | Value |
|------|--------|
| **UF / FR** | FR-HRM-IM-01 · UC HRM-IM-01 · Diễn biến #1–#8 |
| **spec_ref** | `docs/hrm/SRS_HRM_IM_01_RESIDUAL_TEAM.md` · `docs/hrm/API_DESIGN_HRM_IMPORT_PREVIEW.md` §A/§1 |
| **entry** | BA-U71-IM-RESIDUAL-01 PASS · BE-HRM-OA-IMPORT-FLEET-01 (G-IM-OPENAPI-01 CLOSED) · L0 UP |
| **seed** | **none** (U65) |
| **IM-02 commit** | **OUT** — not executed; not claimed DONE |

---

## Command table

| Step | Action | Result |
|------|--------|--------|
| L0 | portal `:5173` + hrm `:28001` + xbos `:28002` | UP (hrm restarted mid-run to load `@HttpCode(OK)`) |
| Login | XBOS `POST /api/xbos/auth/login` | 200 · JWT injected |
| Navigate | `GET /hr/employees?portal=1&tenantId=xevn&companyId=main` | Employees list · total **1109** |
| Click | **Import Excel** | Dialog open |
| Upload | CSV 4 rows (valid + missing email + missing code/name/bad date + existing `HLD-0996` + fake catalog title) | FE → preview |
| Network | `POST /api/hrm/spreadsheet/import/preview` | **HTTP 200** · **`SHEET-200`** |
| Close | Cancel / Esc — **no commit** | Dialog closed |
| F5 | Reload employees | total **1109** unchanged; preview not restored |

**Harness:** `node scripts/qa/qa-hrm-im-01-preview-ac-01.mjs`  
**Runtime JSON:** `docs/qa/evidence/_tmp-qa-hrm-im-01-preview-ac-01-runtime.json`  
**Screenshots:** `docs/qa/evidence/screenshots/qa-hrm-im-01-preview-ac-01/` (`01-employees-list` · `02-import-dialog-open` · `03-preview-table` · `04-after-f5`)

---

## AC matrix

| AC | Verdict | Evidence |
|----|---------|----------|
| **AC-IM-01-SCOPE-01** | **PASS** | Preview `SHEET-200`; summary total **1109→1109**; unique code `QA-IM01-MS309L65-OK` **not** in employees list; **0** commit; **0** POST/PUT/PATCH/DELETE `/employees` |
| **AC-IM-01-SCOPE-02** | **PASS** | IM-01 closed on preview alone — no staging table invent; commit **not** required (IM-02 OUT) |
| **AC-IM-01-SESSION-01** | **PASS** | Payload keys: `kind,headersDetected,canonicalHeaders,rowCount,previewRows,truncated,errors,dryRun` — **no** `sessionId` / `previewToken`; FE preview table **4** rows |
| **AC-IM-01-SESSION-02** | **PASS** | After F5: dialog closed; preview UI **not** restored from server (ephemeral) |
| **AC-IM-01-VAL-01** | **PASS** | `errors[]` len=4 · `SHEET-422` Required email / employee_code / Invalid date (row-level; still `SHEET-200`) |
| **AC-IM-01-VAL-02** | **PASS** | Fake `job_title_key=NOT_A_REAL_CATALOG_KEY_XYZ` still preview HTTP 200 — **no** catalog hard-block / no staging |
| **AC-IM-01-VAL-03** | **PASS** | Row with existing code `HLD-0996` still `SHEET-200` — DB-dup hard-fail **OUT** (IM-02) |

---

## Network (DevTools / Puppeteer)

| Field | Value |
|-------|--------|
| URL | `http://127.0.0.1:5173/api/hrm/spreadsheet/import/preview` (Vite proxy → hrm-api) |
| HTTP | **200** |
| Envelope code | **`SHEET-200`** · message `Import preview` |
| `rowCount` | 4 |
| `dryRun` | true |
| `sessionId` / `previewToken` | **absent** |
| Commit calls | **0** |

> First attempt against stale hrm-api returned HTTP **201** + `SHEET-200` (Nest POST default). Source already had `@HttpCode(HttpStatus.OK)` (`BE-HRM-IM-PREVIEW-HTTP-ALIGN-01`). QA restarted `pnpm run dev:hrm-api` → retest **HTTP 200**. Align WI can treat HTTP spot as corroborated here.

---

## L2.5 journey matrix

| J-* / path | Click path | Verdict |
|------------|------------|---------|
| **J-HRM-02** (employees list host) + IM-01 preview slice | Employees list → **Import Excel** → upload CSV → preview table → Cancel (no commit) → F5 | **PASS** |
| Dedicated J-IM-* | Not in `PROGRAM_JOURNEY_MAP.md` | N/A — propose BA add `J-HRM-IM-01` later (non-blocking) |

Load-only employees ≠ IM-01 DONE — mutate preview path executed above.

---

## Residual

| ID | Sev | Status | Note |
|----|-----|--------|------|
| HTTP 201 stale process | P3 | **CLOSED** this run | After restart → 200; BE align WI READY_FOR_QA already on bus |
| IM-02 commit / export | — | **OUT** | Not tested · not DONE |
| Staging invent | — | **None** | Honored U65 |
| Catalog/DB-dup hard on preview | — | **OUT** by AC | Deferred IM-02 |

---

## Process guards

| Guard | Result |
|-------|--------|
| `pnpm seed:*` | **Not used** |
| Invent staging / `import_preview_*` | **Not used** |
| Claim IM-02 DONE | **No** |
| Phase1 / PROD / `:8088` | **No** |

---

## Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | `qc` |
| **completion_report** | Browser U65 PASS all AC-IM-01-SCOPE-01/02 · SESSION-01/02 · VAL-01..03. Network POST preview → HTTP 200 `SHEET-200`; no sessionId; zero employees INSERT; no commit. Harness + screenshots + runtime JSON attached. |
| **evidence_path** | `docs/qa/evidence/qa-hrm-im-01-preview-ac-01-20260727.md` |
| **next_dispatch_prompt** | See below |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: QC-HRM-IM-01-PREVIEW-AC-01
from_role: pm
to_role: qc
lane: governance · Go/No-Go audit
entry_criteria:
  - QA-HRM-IM-01-PREVIEW-AC-01 PASS_TO_PM @ docs/qa/evidence/qa-hrm-im-01-preview-ac-01-20260727.md
  - Runtime: docs/qa/evidence/_tmp-qa-hrm-im-01-preview-ac-01-runtime.json
  - Screenshots: docs/qa/evidence/screenshots/qa-hrm-im-01-preview-ac-01/
  - Spec lock: docs/hrm/SRS_HRM_IM_01_RESIDUAL_TEAM.md + API_DESIGN_HRM_IMPORT_PREVIEW
exit_criteria:
  - Audit AC-IM-01-SCOPE/SESSION/VAL PASS + Network HTTP 200 SHEET-200 + zero persist + no commit
  - verify:qc:evidence-pack friendly (command_table + L2.5 journey + Residual present)
  - GO or GWC with residual list; NO invent staging / NO IM-02 DONE / NOT Phase1/PROD/:8088
  - evidence_path: docs/qa/evidence/qc-hrm-im-01-preview-ac-01-20260727.md
cấm: seed · reopen Dev for PASS product · claim IM-02 · Phase1/PROD
```
