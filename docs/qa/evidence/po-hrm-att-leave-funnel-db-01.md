# Evidence — PO-HRM-ATT-LEAVE-FUNNEL-DB-01

| Field | Value |
|-------|--------|
| work_item_id | `PO-HRM-ATT-LEAVE-FUNNEL-DB-01` |
| from_role | ba-data |
| to_role | pm |
| lane | governance · ba-data |
| parent | `PO-HRM-ATT-LEAVE-FUNNEL-SPEC-01` · PM CONFIRMED Option A + staged B · REJECT C |
| change_mode | ADD confirm · **NO** `apps/**` · **no migrate executed** |
| date | 2026-08-06 |
| ack_status | **PASS_TO_PM** |
| honesty | **`attendance_uat_ready=false`** · U65 · WAIVE_L2 · must_keep J-HRM-06b/06c |

---

## spec_read_ack

| Artifact | Sections used |
|----------|---------------|
| `PO-HRM-ATT-LEAVE-FUNNEL-SPEC-01.md` | §4 F-ids · §5 conflict · §6 must_keep · §7 AC · §8 queue |
| `po-hrm-att-leave-funnel-spec-01.md` | Residual OPEN-Q1..Q3 |
| `DB_DESIGN_HRM_ENTERPRISE.md` | §4.4 `is_paid` · §4.6 line hours · §4.6.1 sign must_keep |
| AS-IS | `attendance.service.ts` records DDL · `attendance-sheet-schema.bootstrap.ts` · `leave-requests.service.ts` · `attendance-sheet-sign.service.ts` · `hrm-catalog-lineage.mjs` |

---

## Verdict — **CONFIRMED**

| Topic | Stamp |
|-------|--------|
| Soft FK | **ADD** `attendance_records.leave_request_id` (+ optional `leave_type_key`) |
| Indexes | Partial IX on `leave_request_id` · keep UQ company/employee/date |
| Reverse + closed | Clear by soft FK if sheet not closed; else **409** `HRM-ATT-SHEET-LOCKED` |
| OPEN-Q3 | Code/label/optional `metadata.is_paid` — **no invent** catalog fields; `LVT_04`/unpaid → unpaid hours |
| Header bridge | `attendance_sheets` = alias `att_timesheet_header` |
| Line | `att_timesheet_line` **ABSENT** → ADD-plan staged B (AGG-01) |
| Sign §4.6.1 | must_keep — not wiped |
| BE-01 unlock | **Yes** Option A only |
| AGG / B Dev | **HOLD** until AGG-01 + OPEN-Q2 seal |
| Migrate this seat | **none** |

---

## Closed this seat

1. DOC-DELTA packet `docs/program/specs/PO-HRM-ATT-LEAVE-FUNNEL-DB-01.md`.
2. DOC-DELTA appended to `DB_DESIGN_HRM_ENTERPRISE.md` (§4.5a · §4.6.2 · footer).
3. Validation VAL-FUNNEL-01..10 + traceability to F-ATT-LEAVE-FUNNEL-* / AGG-01.
4. Gaps owned: OPEN-Q1 ba-process · OPEN-Q2 sa · line DDL AGG-01.
5. Honesty: no apps/** · no seed · no ladder N · `attendance_uat_ready=false`.

---

## Residual

| ID | Item | Owner | Blocks BE-01 A? |
|----|------|-------|-----------------|
| OPEN-Q1 | Holiday skip vs leave marker | ba-process | No |
| OPEN-Q2 | submit vs `/aggregate` | sa | No |
| Line DDL | `att_timesheet_line` physical | AGG-01 | B only |
| Module UAT | still false | pm | n/a |

---

## must_keep checklist

| Item | Honored |
|------|---------|
| J-HRM-06b storm / empty honesty | Yes — no sheet seed · no poll tables |
| J-HRM-06c sign §4.6.1 | Yes — preserved |
| WAIVE_L2 | Yes |
| No wipe §4.6 | Yes |
| No invent catalog is_paid DDL | Yes |
| No Option C | Yes |

---

## Artifact paths

| Type | Path |
|------|------|
| DB confirm SoT | `docs/program/specs/PO-HRM-ATT-LEAVE-FUNNEL-DB-01.md` |
| Logical DOC-DELTA | `docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md` |
| This evidence | `docs/qa/evidence/po-hrm-att-leave-funnel-db-01.md` |
| Parent SPEC | `docs/program/specs/PO-HRM-ATT-LEAVE-FUNNEL-SPEC-01.md` |

---

## completion_report

Closed Option A physical soft-FK plan on `attendance_records` + OPEN-Q3 paid/unpaid map without inventing catalog fields + header/line bridge for staged B. Residual: OPEN-Q1/Q2 · AGG line HOLD · `attendance_uat_ready=false`. Unlock BE-01 Option A.

## next_owner

**pm** → **dev-be** `PO-HRM-ATT-LEAVE-FUNNEL-BE-01`

## next_dispatch_prompt

```text
work_item_id: PO-HRM-ATT-LEAVE-FUNNEL-BE-01
from_role: pm
to_role: dev-be
lane: execution · dev-be
parent: PO-HRM-ATT-LEAVE-FUNNEL-DB-01 CONFIRMED · SPEC-01 Option A P0
change_mode: ADD · Nest ensureSchema only for soft FK cols
u65: zero-seed · attendance_uat_ready=false
must_keep: J-HRM-06b storm · J-HRM-06c sign · WAIVE_L2 · AC-ATT-SHEET empty honesty

read_first:
1. docs/program/specs/PO-HRM-ATT-LEAVE-FUNNEL-DB-01.md (§1–§3 CONFIRMED)
2. docs/program/specs/PO-HRM-ATT-LEAVE-FUNNEL-SPEC-01.md §4 F-ATT-LEAVE-FUNNEL-01..04 · §5 conflict
3. docs/qa/evidence/po-hrm-att-leave-funnel-db-01.md
4. AS-IS leave-requests.service approve/reject · attendance.service ensureSchema

entry_criteria:
- DB-01 CONFIRMED soft FK leave_request_id + leave_type_key on attendance_records
- PM stamped Option A; Option C forbidden; AGG/line OUT OF SCOPE this seat

task:
1) ensureSchema ADD leave_request_id UUID NULL + leave_type_key TEXT NULL + partial IX
2) On approve (L1 terminal / WF callback): expand dates → UPSERT status=leave + soft FK (same txn or immediate post-commit); conflict present→409 HRM-ATT-LEAVE-FUNNEL-CONFLICT; closed sheet overlap→409 HRM-ATT-SHEET-LOCKED
3) On reject/cancel after approved: reverse by leave_request_id only if no closed sheet covering date
4) GET /attendance/records EXPAND display-ready leave_request_id · leave_type · leave_type_label · status_label vi-VN; no FE leave join; no extra poll
5) Scope parity F-ATT-LEAVE-FUNNEL-04 (same resolver as leave list/approve)
6) Jest: materialize · reverse · conflict · locked · scope; CODE-MEMORY APPEND
7) Evidence: docs/qa/evidence/po-hrm-att-leave-funnel-be-01.md
8) Exit READY_FOR_QA · next_dispatch_prompt for PO-HRM-ATT-LEAVE-FUNNEL-FE-01

forbidden:
- att_timesheet_line / F-ATT-SHEET-AGG-01 implement (HOLD AGG-01)
- invent ladder N · seed · claim attendance_uat_ready
- wipe sign tables · Option C FE-join · silent overwrite present
- dual header table vs attendance_sheets
```

## ack_status

**PASS_TO_PM**
