# Evidence — `PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-ATT-LINE-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-ATT-LINE-01` |
| **from_role** | `sa` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | governance |
| **parent** | `PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01` |
| **prior** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-DATA-ATT-LINE-01` PASS_TO_PM (`att_timesheet_line` CONFIRMED ADD) |
| **priority** | P0 |
| **change_mode** | ADD |
| **ack_status** | **PASS_TO_PM** |
| **SoT spec** | [`docs/program/specs/PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-ATT-LINE-01.md`](../../program/specs/PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-ATT-LINE-01.md) |
| **DOC-DELTA** | [`PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01.md`](../../program/specs/PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01.md) **§13** (ADD-only) |
| **client pointer** | `API_DESIGN_HRM_ENTERPRISE.md` F-ATT-SHEET-AGG · F-PAY-ATT-CLOSED-01 · F-PAY-FORMULA-PREVIEW-01 (UPGRADE, no wipe) |
| **honesty** | `payroll_e2e_ready=false` · formula LIVE **DENIED** · no `apps/**` · no seed |

---

## 1. Mission closed

API F.1 for residual **R-PAY-F-ATT-LINE**: AGG write path → physical `att_timesheet_line` + PAY PREVIEW/PROCESS bag SELECT closed+locked lines → `PAY_FORMULA_ATT_HOUR_VARS`; freeze **ATT-412 vs PREVIEW-STUB**; unlock dual **dev-be**.

---

## 2. AS-IS facts (read)

| Artifact | Finding |
|----------|---------|
| DATA-ATT-LINE-01 | CONFIRMED ADD DDL · 5 hour vars · BR closed-only · reject VIEW |
| Nest bag | `buildPayFormulaVariableBag` probe-only → `ATT_TIMESHEET_LINE_ABSENT`; no SELECT line hours |
| Nest ATT | `submit` / `close` LIVE; **no** `/aggregate`; close does **not** set `line_locked` |
| QC-EVAL | PREVIEW hours incomplete → **412-PREVIEW-STUB**; PROCESS open → **ATT-412**; no silent 0 |
| FUNNEL OPEN-Q2 | submit vs `/aggregate` — **FROZEN** Option C this seat |
| Client AGG | Paper `/att/.../aggregate` + `attendance_sheet_lines` alias — Nest physical name **`att_timesheet_line`** |

---

## 3. Deliverables checklist

| # | Deliverable | Status |
|---|-------------|--------|
| 1 | F.1 F-ATT-SHEET-AGG-01 (mục đích · nghiệp vụ · bước SRS · DTO↔column · lỗi) | **DONE** — ATT-LINE-01 §2 |
| 2 | F.1 PAY bag bind PREVIEW §4.4 / PROCESS §5 / F-PAY-ATT-CLOSED-01 | **DONE** — ATT-LINE-01 §3 |
| 3 | Error taxonomy freeze ATT-412 vs PREVIEW-STUB | **DONE** — ATT-LINE-01 §4 · API-01 §13.3 |
| 4 | DOC-DELTA API-01 (no wipe) | **DONE** — §13 |
| 5 | Client API_DESIGN pointer UPGRADE | **DONE** — AGG / CLOSED / PREVIEW |
| 6 | Unlock dual BE + next_dispatch_prompt | **DONE** — §6 handoff below |
| 7 | Evidence this file | **DONE** |

---

## 4. Taxonomy freeze (summary)

| Situation | PROCESS | PREVIEW |
|-----------|---------|---------|
| No closed sheet | **`HRM-PAY-ATT-412`** | Prefer **PREVIEW-STUB** if ATT hours required |
| Closed · line missing / incomplete | **`HRM-PAY-ATT-412`** (`ATT_LINE_*`) | **PREVIEW-STUB** + `ATT_HOURS_VAR_BAG_INCOMPLETE` |
| Table ABSENT | ATT-412 if process needs hours | **PREVIEW-STUB** + `ATT_TIMESHEET_LINE_ABSENT` |
| Invent `0` | **FORBIDDEN** | **FORBIDDEN** |

QC AC4a/AC4b honesty baseline **retained**.

---

## 5. OPEN-Q2 freeze

**ACCEPT:** Nest `POST /api/hrm/attendance/attendance-sheets/:sheetId/aggregate` **and** `submit` **must invoke** AGG before/as `status→submitted`. Close **must** `line_locked=true`.

---

## 6. Residual

| ID | Status | Owner |
|----|--------|-------|
| R-PAY-F-ATT-LINE (API F.1) | **CLOSED** | — |
| R-PAY-F-ATT-LINE (DDL+wire+UF) | **OPEN** | **dev-be** → **qa** |
| G-PAY-F-06 runtime | OPEN until LIVE rows + UF | BE/QA |
| R-PAY-F-CB-BAG | OPEN (parallel) | qa / be as prior |
| `payroll_e2e_ready` | **LOCKED false** | pm |

---

## 7. Explicit non-claims

- Did **not** implement Nest / migrations / seed.
- Did **not** wipe API-01 §1–§12 or ATT header/sign SoT.
- Did **not** invent VIEW silent-zero path or `work_days` allow-list key.
- Did **not** flip `payroll_e2e_ready` / claim LIVE / Phase1 / J-HRM-07.

---

## completion_report

### Closed

1. F.1 CONFIRMED for F-ATT-SHEET-AGG-01 write DTO↔`att_timesheet_line` + submit hook + close lock.  
2. F.1 CONFIRMED for PAY `loadAttHoursFromClosedLine` → `PAY_FORMULA_ATT_HOUR_VARS` on PREVIEW/PROCESS.  
3. Taxonomy frozen: PROCESS fidelity → ATT-412; PREVIEW staging ABSENT/incomplete → PREVIEW-STUB; **cấm** silent 0.  
4. DOC-DELTA API-01 §13 + client AGG/CLOSED/PREVIEW UPGRADE (ADD-only).  
5. Dual **dev-be** unlocked (ATT ensureSchema+AGG · PAY bag SELECT).

### Residual

- BE wire + QA UF to close R-PAY-F-ATT-LINE runtime; keep `payroll_e2e_ready=false`.

---

## Handoff

| Field | Value |
|-------|--------|
| **completion_report** | § above |
| **next_owner** | **pm** → dispatch **dev-be** |
| **next_dispatch_prompt** | below |
| **evidence_path** | `docs/qa/evidence/po-hrm-payroll-formula-run-gap-api-att-line-01.md` |
| **ack_status** | **PASS_TO_PM** |
| **pm_dispatch_hint** | Unlock **dev-be** ATT+PAY (split OK) — **cấm** flip `payroll_e2e_ready` · **cấm** silent 0 · **cấm** VIEW invent |

### next_dispatch_prompt (copy-ready — preferred dual seat)

```text
work_item_id: PO-HRM-PAYROLL-FORMULA-RUN-GAP-BE-ATT-LINE-01
from_role: pm
to_role: dev-be
lane: execution
parent: PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01
prior: PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-ATT-LINE-01 PASS_TO_PM (F.1 AGG+PAY bag CONFIRMED · taxonomy FROZEN)
priority: P0
change_mode: ADD

## Mission
Wire R-PAY-F-ATT-LINE runtime (dual lane in one seat OR split ATT then PAY):

### A — ATT
1) ensureAttTimesheetLineSchema (exact table att_timesheet_line per DATA-ATT-LINE-01 §2) — must_keep attendance_sheets + att_timesheet_sign_step
2) F-ATT-SHEET-AGG-01: POST /api/hrm/attendance/attendance-sheets/:sheetId/aggregate — UPSERT lines; submit invokes AGG; close sets line_locked=true; reopen archives lines
3) scope_parity U19 with sheet list/get; soft-delete archived_at; cấm hard DELETE

### B — PAY
4) loadAttHoursFromClosedLine into buildPayFormulaVariableBag — map PAY_FORMULA_ATT_HOUR_VARS from closed+locked line
5) Taxonomy: PROCESS open/missing/incomplete → HRM-PAY-ATT-412; PREVIEW ABSENT/incomplete → HRM-PAY-FORMULA-412-PREVIEW-STUB; cấm silent 0
6) Retain QC-EVAL honesty (opaque stub · FORMULA-412 · C&B VARS)

## read_first
- docs/program/specs/PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-ATT-LINE-01.md
- docs/program/specs/PO-HRM-PAYROLL-FORMULA-RUN-GAP-DATA-ATT-LINE-01.md
- docs/program/specs/PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01.md §4.4 · §5 · §7 · §13
- docs/qa/evidence/po-hrm-payroll-formula-run-gap-api-att-line-01.md
- apps/api/hrm-api/src/payroll/pay-formula-variable-bag.ts
- apps/api/hrm-api/src/attendance/attendance-sheet-sign.service.ts
- apps/api/hrm-api/src/attendance/attendance-sheet-schema.bootstrap.ts

## exit_criteria
- jest: AGG upsert + close lock + bag SELECT + ATT-412 / PREVIEW-STUB regression
- CODE-MEMORY APPEND on touched files
- evidence: docs/qa/evidence/po-hrm-payroll-formula-run-gap-be-att-line-01.md
- READY_FOR_QA
- honesty: payroll_e2e_ready=false · no seed · no claim LIVE · no VIEW-only hours

## split_ok
If quota/blast: BE-ATT-LINE-ATT-01 (schema+AGG+lock) then BE-ATT-LINE-PAY-01 (bag SELECT) — same SoT.

cấm: silent 0 · seed · flip payroll_e2e_ready · wipe header/sign · invent work_days allow-list · salary_components.formula as engine
```

**After BE READY_FOR_QA:**

```text
work_item_id: PO-HRM-PAYROLL-FORMULA-RUN-GAP-QA-ATT-LINE-01
from_role: pm
to_role: qa
lane: execution
prior: PO-HRM-PAYROLL-FORMULA-RUN-GAP-BE-ATT-LINE-01 READY_FOR_QA
## Mission
L1 (+ browser if stack up): closed sheet + locked line → preview/process bind hours without ATT_TIMESHEET_LINE_ABSENT; open sheet still ATT-412; incomplete → honest stub/412; U65 zero-seed; payroll_e2e_ready=false.
evidence: docs/qa/evidence/po-hrm-payroll-formula-run-gap-qa-att-line-01.md
```
