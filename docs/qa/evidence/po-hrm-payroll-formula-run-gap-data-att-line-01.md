# Evidence — `PO-HRM-PAYROLL-FORMULA-RUN-GAP-DATA-ATT-LINE-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-DATA-ATT-LINE-01` |
| **from_role** | `ba-data` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | governance |
| **parent** | `PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01` |
| **prior** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-QC-FE-EVAL-01` GWC · **R-PAY-F-ATT-LINE OPEN** (`ATT_TIMESHEET_LINE_ABSENT`) |
| **priority** | P0 |
| **change_mode** | ADD |
| **ack_status** | **PASS_TO_PM** |
| **SoT spec** | [`docs/program/specs/PO-HRM-PAYROLL-FORMULA-RUN-GAP-DATA-ATT-LINE-01.md`](../../program/specs/PO-HRM-PAYROLL-FORMULA-RUN-GAP-DATA-ATT-LINE-01.md) |
| **honesty** | `payroll_e2e_ready=false` · formula LIVE **DENIED** · no apps/** · no seed |

---

## 1. Mission closed

Physical data design for payroll evaluator **hours fidelity**: close residual design gap **R-PAY-F-ATT-LINE** so PROCESS/PREVIEW can resolve **closed** timesheet hours into var bag (`payable_hours` / ATT hour keys) **without inventing silent 0**.

---

## 2. AS-IS vs ADD (read artifacts)

| Artifact | Finding |
|----------|---------|
| QC-FE-EVAL | Preview OK-COMPUTE with overrides still warns `ATT_TIMESHEET_LINE_ABSENT` · ready=false |
| QC-EVAL / BE-EVAL | Hours incomplete → PREVIEW-STUB; PROCESS open sheet → ATT-412; bag probe `att_timesheet_line` |
| DATA-01 | G-PAY-F-06 · line **PAPER/ABSENT**; header LIVE |
| FUNNEL-DB-01 §5 | Header = `attendance_sheets`; line ADD staged B / AGG-01 |
| DB_DESIGN §4.6 | Logical line columns (standard/OT weighted/leave/payable + lock) |
| Migration close | `closed_at`/`closed_by` on `attendance_sheets` LIVE |
| Nest bootstrap | `ensureAttendanceSheetSchema` — **no** line DDL |
| Nest allow-list | `PAY_FORMULA_ATT_HOUR_VARS` = 5 hour keys (no `work_days`, no OT boolean) |

**Decision:** **CONFIRMED ADD** `public.att_timesheet_line` keyed by `(header_id, employee_id)` under closed `attendance_sheets` — **REJECT** VIEW-over-records and PAY shadow hours.

---

## 3. Deliverables checklist

| # | Deliverable | Status |
|---|-------------|--------|
| 1 | Evidence this file | **DONE** |
| 2 | DB_DESIGN delta / confirm path | **DONE** — SoT `PO-HRM-PAYROLL-FORMULA-RUN-GAP-DATA-ATT-LINE-01.md` |
| 3 | Field list ↔ gd1_eval_v1 ATT vars | **DONE** — §3 SoT (5 hour keys; OT=weighted hours; work_days optional/DEFER) |
| 4 | BR closed-only → ATT-412 honest | **DONE** — BR-PAY-ATT-LINE-01..06 · VAL-* |
| 5 | next_dispatch_prompt SA vs BE | **DONE** — unlock **sa first**, then BE |

---

## 4. Field list (PAY bag)

| Var | Column | GĐ1 |
|-----|--------|-----|
| `payable_hours` | `payable_hours` | required when in `required_vars` |
| `standard_hours` | `standard_hours` | when listed |
| `ot_hours_weighted` | `ot_hours_weighted` | when listed (coeff in ATT) |
| `paid_leave_hours` | `paid_leave_hours` | when listed |
| `unpaid_leave_hours` | `unpaid_leave_hours` | when listed |
| `work_days` | optional nullable col | **DEFER** as formula var (not in allow-list) |
| OT flag boolean | — | **OUT** |

Plus optional AGG cols: `late_penalty_hours`, `meal_shift_hours`, `other_components_json` — not in ATT allow-list.

---

## 5. BR summary (closed gate)

1. **PROCESS** feeds only from **`attendance_sheets.status=closed`** + locked line — else **`HRM-PAY-ATT-412`**.  
2. Incomplete / ABSENT line when hours vars required → **honest fail** (ATT-412 / PREVIEW-STUB) — **cấm** silent `0`.  
3. Writer = ATT AGG only; PAY read-only; soft-delete `archived_at`; scope_parity U19 with sheet list.  
4. Q-PAY-FORMULA dual-control unchanged (answered) — independent of line DDL.

---

## 6. Unlock path (explicit)

| Path | When |
|------|------|
| **SA (required next)** | F.1 F-ATT-SHEET-AGG + PAY bag SELECT bind + error taxonomy freeze + API-01 DOC-DELTA lift “hours BLOCKED forever” |
| **BE (after SA)** | ATT ensureSchema+AGG+lock · PAY `loadAttHoursFromClosedLine` |
| **Direct BE without SA** | **DENIED** this residual (spec-before-code · AGG F.1 still paper vs Nest paths) |

**R-PAY-F-ATT-LINE product status:** design **LOCKED** · implementation **OPEN** until SA→BE→QA.

---

## 7. Residual

| ID | Status | Owner |
|----|--------|-------|
| R-PAY-F-ATT-LINE (physical design) | **CLOSED** (this seat) | — |
| R-PAY-F-ATT-LINE (DDL+wire+UF) | **OPEN** | sa → dev-be → qa |
| G-PAY-F-06 | OPEN until LIVE rows | BE/QA |
| R-PAY-F-CB-BAG | OPEN (parallel) | qa |
| `payroll_e2e_ready` | **LOCKED false** | pm |
| `C-SLICE-≠-MODULE` | CONDITION | pm/qc |

---

## 8. Explicit non-claims

- Did **not** flip `payroll_e2e_ready` / claim LIVE / Phase1 / J-HRM-07 process UAT.  
- Did **not** mutate `apps/**` / migrations apply / seed.  
- Did **not** overwrite closed ATT header/sign schema.  
- Did **not** invent VIEW silent-zero path.

---

## completion_report

### Closed

1. CONFIRMED ADD physical `att_timesheet_line` under LIVE `attendance_sheets` close gate.  
2. Mapped 5 `gd1_eval_v1` ATT hour vars → columns; OT = weighted hours; work_days DEFER.  
3. BR/VAL matrix: closed-only PROCESS · honest ATT-412 / PREVIEW-STUB · no silent 0.  
4. Soft-delete + tenant scope_parity + must_keep sign/header documented.  
5. Unlock path: **sa API delta first**, then **dev-be** wire (not Nest this seat).

### Residual

- SA F.1 AGG + PAY bag · BE DDL/AGG/bag SELECT · QA UF close R-PAY-F-ATT-LINE runtime · keep ready=false.

---

## Handoff

| Field | Value |
|-------|--------|
| **completion_report** | §8 |
| **next_owner** | **pm** → dispatch **sa** |
| **next_dispatch_prompt** | below |
| **evidence_path** | `docs/qa/evidence/po-hrm-payroll-formula-run-gap-data-att-line-01.md` |
| **ack_status** | **PASS_TO_PM** |
| **pm_dispatch_hint** | Unlock **sa** `PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-ATT-LINE-01` — **cấm** BE Nest before F.1 · **cấm** flip `payroll_e2e_ready` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-ATT-LINE-01
from_role: pm
to_role: sa
lane: governance
parent: PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01
prior: PO-HRM-PAYROLL-FORMULA-RUN-GAP-DATA-ATT-LINE-01 PASS_TO_PM (R-PAY-F-ATT-LINE physical LOCKED · att_timesheet_line CONFIRMED ADD)
priority: P0
change_mode: ADD

## Mission
API F.1 delta for ATT timesheet line hours fidelity (payroll var bag):
1) F-ATT-SHEET-AGG-01 — write/upsert att_timesheet_line columns per DATA-ATT-LINE-01 §2 (standard_hours, ot_hours_weighted, paid/unpaid_leave_hours, payable_hours, line_locked, soft-delete); bind header_id → attendance_sheets; Nest path alias vs paper /att/attendance-sheets/aggregate.
2) F-PAY-ATT-CLOSED-01 / PREVIEW§4.4 / PROCESS§5 — SELECT closed+locked line → map PAY_FORMULA_ATT_HOUR_VARS; freeze BR-PAY-ATT-LINE-02 taxonomy (open/missing sheet → HRM-PAY-ATT-412; closed incomplete line → ATT-412 ATT_LINE_INCOMPLETE preferred; ABSENT table → PREVIEW-STUB + ATT_TIMESHEET_LINE_ABSENT).
3) DOC-DELTA PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01 + client API_DESIGN pointer — lift “hours BLOCKED forever”; keep payroll_e2e_ready=false; cấm silent 0; cấm Leave/OT HTTP as var SoT.
4) Unlock packet for dual dev-be: ATT ensureSchema+AGG+close lock · PAY loadAttHoursFromClosedLine in pay-formula-variable-bag.

## read_first
- docs/program/specs/PO-HRM-PAYROLL-FORMULA-RUN-GAP-DATA-ATT-LINE-01.md
- docs/qa/evidence/po-hrm-payroll-formula-run-gap-data-att-line-01.md
- docs/program/specs/PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01.md §4.4 · §5 · §7
- docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md F-ATT-SHEET-AGG · F-PAY-ATT-CLOSED-01
- docs/program/specs/PO-HRM-ATT-LEAVE-FUNNEL-DB-01.md §5

## exit_criteria
- Evidence docs/qa/evidence/po-hrm-payroll-formula-run-gap-api-att-line-01.md
- F.1 Mục đích · Nghiệp vụ · bước SRS · DTO↔column · lỗi for AGG + PAY bag bind
- next_dispatch_prompt for dev-be ATT+PAY wire (or split BE-ATT / BE-PAY)
- honesty: payroll_e2e_ready=false · no claim LIVE · no apps/** code
- ack_status PASS_TO_PM

cấm: invent seed · flip payroll_e2e_ready · claim LIVE · overwrite closed ATT header/sign without must_keep · Nest implement this seat
```

**After SA PASS (do not run now):**

```text
work_item_id: PO-HRM-PAYROLL-FORMULA-RUN-GAP-BE-ATT-LINE-01
from_role: pm
to_role: dev-be
lane: execution
prior: PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-ATT-LINE-01 CONFIRMED
## Mission
ensureSchema att_timesheet_line + ATT AGG writer + close line_locked; PAY bag load closed line hours; retain ATT-412 / PREVIEW-STUB; cấm silent 0; payroll_e2e_ready=false; U65.
evidence: docs/qa/evidence/po-hrm-payroll-formula-run-gap-be-att-line-01.md
```
