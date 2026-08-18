# BA-HRM-ATT-SHEET-AC-01 — Acceptance criteria: Bảng chấm công create → open (no reload storm)

| Field | Value |
|-------|-------|
| **work_item_id** | `BA-HRM-ATT-SHEET-AC-01` |
| **from_role** | pm |
| **to_role** | ba-process |
| **lane** | governance |
| **date** | 2026-07-21 |
| **ack_status** | **PASS_TO_PM** |
| **U65** | zero-seed — AC browser-only; **cấm** seed trong nghiệm thu |
| **coord** | `BA-HRM-SPEC-QUALITY-AUDIT-01` (skeleton + HRM-AT-14 baseline) |

---

## Sponsor defect (intake)

Create «Bảng chấm công 01/07/2026–31/07/2026 (Công chuẩn)» → **no data** + **auto reload loop**.

## Spec says / code does (as-is)

| Layer | Spec (after this wave) | Runtime observed |
|-------|------------------------|------------------|
| Create | POST header `attendance_sheets` → list row (AC-ATT-SHEET-01) | BE `createAttendanceSheet` INSERT header only; FE `createSheet` + invalidate RQ |
| Open grid | Aggregate `attendance_records` in sheet period (AC-ATT-SHEET-02) | `useWeeklyAttendanceSummary` → `listAttendanceRecords(from,to)` → `buildWeeklyAttendanceRows` **only from records** (not full roster) |
| Empty | Live-empty + reason when `records=[]` (BR-ATT-SHEET-06) | UI `attendance.overview.noData` — **valid** if no records; **invalid** if spinner/storm |
| Storm | ≤2 GET / URL / 10s (BR-ATT-SHEET-07, AC-04/06) | Prior: list storm fixed RQ (`D-HRM-ATT-LEAVE-FETCH-STORM`); weekly hook still deps on `t` / `employeesById` — **suspect** for open-grid loop → **dev-fe** |

---

## Deliverables (ADD-only)

| Artifact | Change |
|----------|--------|
| `docs/hrm/SRS.md` UC-HRM-23 / HRM-AT-14 | Click path FE; AC-ATT-SHEET-01..**06**; BR-ATT-SHEET-06..07; mermaid VI |
| `docs/hrm/TECHSPEC.md` §12.1 + §13 | Contract `HRM-AS-200/201`; FE bind; anti-storm NFR |
| `docs/hrm/BRD.md` | BR-ATT-SHEET-06..07 |
| `docs/program/PROGRAM_JOURNEY_MAP.md` | **J-HRM-06b** ⬜ |
| `docs/qa/PILOT_BUSINESS_FLOW_BA_TRACE.md` | UC23-S1..S4 · TC-BAP-07-S-* |
| `docs/qa/USER_FLOW_SRS_TRACE_DELTA.md` | Proposed **UF-HRM-16** (not 15 — reserved decisions mock) |

---

## AC summary (QA copy-ready)

**Persona:** `ceo@xe.vn` / `Xevn@2026` · `companyId=main`  
**URL:** `/command-center/hrm/attendance` or `/hr/attendance?portal=1&companyId=main`

| AC | Pass | Fail |
|----|------|------|
| **AC-ATT-SHEET-01** | Thêm → kỳ **01/07/2026–31/07/2026** + **Công chuẩn** → Lưu → POST **201** `HRM-AS-201` → list có row **không** cần F5 | List không đổi / seed cheat |
| **AC-ATT-SHEET-02** | Open sheet → grid NV **hoặc** empty ổn định + lý do | Spinner vô hạn / ERROR giả khi API 200 |
| **AC-ATT-SHEET-03** | List `total=0` → empty copy, no ERROR banner | Empty che 4xx/5xx |
| **AC-ATT-SHEET-04** | `GET …/attendance-sheets` ≤2 / 10s settle | ≥5 / Abort×N / RATE-429 loop |
| **AC-ATT-SHEET-05** | F5 → sheet còn; kỳ đúng | Sheet mất |
| **AC-ATT-SHEET-06** | Open weekly: `GET …/records` ≤2 / 10s; loading ends | Records storm / forever spin (**sponsor class**) |

**cấm:** `pnpm seed:*` · API fake state · claim Phase 1 DONE.

---

## completion_report

**Closed:** Explicit FE click-path AC for attendance sheet create→list→open; measurable no-storm thresholds; TechSpec `attendance-sheets` contract; journey **J-HRM-06b**; UF **UF-HRM-16**; BA_TRACE branches.

**Residual:** Browser PASS still open — execution lane **dev-fe** (`D-HRM-ATT-SHEET-EMPTY-RELOAD-LOOP-01`) then **qa** retest AC-01..06. Auto-generate records on create = out of scope (CR). UF-HRM-16 not yet promoted into `USER_FLOW_OPERABILITY_MATRIX.md` §4 (PM/QA).

---

## Handoff

- **next_owner:** `pm` → dispatch **dev-fe** (fix loop) then **qa** (AC browser)
- **ack_status:** `PASS_TO_PM`
- **evidence_path:** `docs/qa/evidence/ba-hrm-att-sheet-ac-01-20260721.md`

### next_dispatch_prompt (copy-ready)

```text
work_item_id: D-HRM-ATT-SHEET-EMPTY-RELOAD-LOOP-01
from_role: pm
to_role: dev-fe
lane: execution

## Spec (read first)
- docs/hrm/SRS.md UC-HRM-23 / HRM-AT-14 · AC-ATT-SHEET-01..06 · BR-ATT-SHEET-06/07
- docs/hrm/TECHSPEC.md §12.1 attendance-sheets
- docs/qa/evidence/ba-hrm-att-sheet-ac-01-20260721.md

## Defect
Create sheet 01/07/2026–31/07/2026 Công chuẩn → empty + auto reload loop.

## Fix
1. Stabilize weekly open path (useWeeklyAttendanceSummary deps — no t/object identity storm on GET records).
2. After POST sheet: list shows row; open → empty-with-reason OR grid if records exist; loading must end.
3. Measurable: ≤2 GET attendance-sheets and ≤2 GET records (same from/to) per 10s settle.
4. Regression vitest on hook deps; READY_FOR_QA with evidence path.
5. must_keep: UF-HRM-05 / J-HRM-06 records path; U65 zero-seed.

cấm: apps unrelated · seed · Phase1 DONE
```

After FE READY_FOR_QA:

```text
work_item_id: QA-HRM-ATT-SHEET-AC-01
to_role: qa
entry: L0 stack up; U65 browser-only
exit: AC-ATT-SHEET-01..06 + J-HRM-06b evidence; matrix UF-HRM-16 flag; PASS_TO_PM
cấm: seed · probe-only PASS
```
