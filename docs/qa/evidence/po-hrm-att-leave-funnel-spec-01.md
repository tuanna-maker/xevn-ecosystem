# Evidence — PO-HRM-ATT-LEAVE-FUNNEL-SPEC-01

| Field | Value |
|-------|--------|
| work_item_id | `PO-HRM-ATT-LEAVE-FUNNEL-SPEC-01` |
| role | sa |
| date | 2026-08-06 |
| lane | governance · docs-only |
| parent | `PO-HRM-E2E-LINK-ATT-SPEC-01` §4.2 · §5 **P0-3** |
| ack_status | **PASS_TO_PM** |
| honesty | **`attendance_uat_ready=false`** |

---

## Spec read ack

| Artifact | Sections used |
|----------|---------------|
| `docs/program/specs/PO-HRM-E2E-LINK-ATT-SPEC-01.md` | §1.1 L11 · §2 ATT-SB-02 · §4.2 · §5 P0-3 · §8 honesty |
| `docs/program/PO_E2E_BUSINESS_SPINE_PROGRAM.md` | E2E-SPINE-02 leave → số dư/công |
| `docs/program/PROGRAM_JOURNEY_MAP.md` | J-HRM-06 / **06b** / **06c** |
| `docs/program/specs/PO-HRM-ATT-LEAVE-LADDER-N-01.md` | **WAIVE_L2_PHASE1** must_keep |
| `SRS_HRM_ENTERPRISE.md` | FR-UC-BP-ATT-09 → **ATT-10** Công nghỉ phép → ATT-11 |
| `TECHSPEC_HRM_ENTERPRISE.md` | F-ATT-SHEET-01..04 · F-ATT-LEAVE-01..03 map · §6.4 sign |
| `DB_DESIGN_HRM_ENTERPRISE.md` | §4.6 `paid_leave_hours` / `unpaid_leave_hours` |
| AS-IS code | `leave-requests.service.ts` approve path · `attendance-catalog.service.ts` header-only · `attendance.service.ts` records enum `leave` |
| ADR | `ADR-HRM-ATT-SHEET-HTTP-PATH-20260805.md` |

---

## Closed this seat

1. **AS-IS gap stamped:** approve leave = status + balance + fanout only — **no** `attendance_records` materialize → ATT-SB-02 / AC-ATT-LV-SHEET-01 fail class.
2. **Options A/B/C** + recommend **A (P0) + staged B (hours)**; **C REJECT** (OS 28).
3. **API intents F.1:** F-ATT-LEAVE-FUNNEL-01..04 + F-ATT-SHEET-AGG-01 (purpose · business · SRS bước).
4. **must_keep:** J-HRM-06b storm · J-HRM-06c sign · WAIVE_L2 (no reopen N).
5. **P0_fix_queue:** DB → BE → FE → QA (+ AGG staged).
6. **Honesty:** `attendance_uat_ready=false`; no apps/**; no commit; no ladder invent.

---

## Residual / OPEN-Q

| ID | Item | Owner |
|----|------|-------|
| OPEN-Q1 | Holiday days inside leave range | ba-process |
| OPEN-Q2 | Aggregate on `submit` vs `/aggregate` | sa+ba-data |
| OPEN-Q3 | paid vs unpaid from leave_types | ba-data |
| ATT module UAT | Still false until FUNNEL-QA + other ATT P0 | pm |

---

## must_keep checklist (this wave)

| Item | Honored |
|------|---------|
| J-HRM-06b / AC-ATT-SHEET storm | Yes — INV-4 · AC regress |
| J-HRM-06c sign paths | Yes — no bypass / no regress contract |
| WAIVE_L2_PHASE1 | Yes — ladder WF HOLD |
| No apps/** | Yes |
| No attendance_uat_ready claim | Yes |

---

## Artifact paths

| Type | Path |
|------|------|
| Spec packet | `docs/program/specs/PO-HRM-ATT-LEAVE-FUNNEL-SPEC-01.md` |
| This evidence | `docs/qa/evidence/po-hrm-att-leave-funnel-spec-01.md` |

---

## completion_report

Closed governance P0-3 leave→sheet funnel TechSpec/API intents (Option A + staged B). Residual: PM CONFIRM → ba-data DB soft FK; Dev HOLD; OPEN-Q1..Q3; `attendance_uat_ready=false`.

## next_owner

**pm** → CONFIRM → **ba-data** `PO-HRM-ATT-LEAVE-FUNNEL-DB-01`

## next_dispatch_prompt

```text
work_item_id: PO-HRM-ATT-LEAVE-FUNNEL-DB-01
from_role: pm
to_role: ba-data
lane: governance · ba-data
parent: PO-HRM-ATT-LEAVE-FUNNEL-SPEC-01 (SA PASS_TO_PM · Option A + staged B)
change_mode: ADD · NO CODE apps/**

entry_criteria:
- Read docs/program/specs/PO-HRM-ATT-LEAVE-FUNNEL-SPEC-01.md §4–§8
- PM stamped CONFIRM Option A P0 (+ B staged)
- must_keep: AC-ATT-SHEET · J-HRM-06b/06c · WAIVE_L2 · U65
- honesty: attendance_uat_ready=false

task:
1) DOC-DELTA DB_DESIGN: soft FK leave_request_id (+ leave_type_key optional) on attendance_records; IX; reverse rules when sheet closed
2) Map paid_leave_hours / unpaid_leave_hours source for F-ATT-SHEET-AGG-01 (OPEN-Q3) — no invent catalog fields
3) Note AS-IS attendance_sheets header vs att_timesheet_line §4.6 — physical bridge or alias plan
4) Evidence: docs/qa/evidence/po-hrm-att-leave-funnel-db-01.md
5) Exit: PASS_TO_PM · next_dispatch_prompt for PO-HRM-ATT-LEAVE-FUNNEL-BE-01

forbidden: apps/** · seed · invent ladder N · claim attendance_uat_ready · wipe §4.6 sign tables
```

## ack_status

**PASS_TO_PM**
