# Evidence — PO-HRM-ATT-LEAVE-FUNNEL-BE-02

| Field | Value |
|-------|--------|
| work_item_id | `PO-HRM-ATT-LEAVE-FUNNEL-BE-02` |
| from_role | dev-be |
| to_role | pm → **qa** `PO-HRM-ATT-LEAVE-FUNNEL-QA-01` R2 |
| lane | execution · FIX · preserve_default · CODE-MEMORY APPEND |
| parent | `PO-HRM-ATT-LEAVE-FUNNEL-QA-01` FAIL_TO_PM · `R-ATT-LEAVE-FUNNEL-DATE-EXPAND` |
| date | 2026-08-06 |
| ack_status | **READY_FOR_QA** |
| honesty | **`attendance_uat_ready=false`** · U65 zero-seed · WAIVE_L2 intact · no Option C |

---

## spec_read_ack

| Artifact | Sections |
|----------|----------|
| `docs/qa/evidence/po-hrm-att-leave-funnel-qa-01.md` | Root cause `String(Date).slice` → empty days · silent 201 |
| `docs/program/specs/PO-HRM-ATT-LEAVE-FUNNEL-SPEC-01.md` | §4 F-ATT-LEAVE-FUNNEL-01..04 · §5 LOCKED |
| `docs/qa/evidence/po-hrm-att-leave-funnel-be-01.md` | Prior materialize/LOCKED path |

**spec says / code did:** F-ATT-LEAVE-FUNNEL-01 expand inclusive days + LOCKED on closed overlap · code no-op’d when pg returned `Date` (`"Thu Oct 08"` failed regex).

---

## Closed this seat

1. **FIX** `toLeaveDayKey` + `expandLeaveDateRange` — accept `Date` \| ISO datetime \| `yyyy-MM-dd`.
   - `Date` (node-pg DATE = local midnight) → **local** `Y-M-D` (not `toISOString` UTC shift).
   - Strings matching `^\d{4}-\d{2}-\d{2}` → leading 10 chars.
   - **Cấm** `String(Date).slice(0,10)`.
2. Materialize/reverse paths use `toLeaveDayKey` for day keys + RETURNING dates.
3. **Bonus same class:** `AttendanceService.normalizeAttendanceDateForApi` → `toLeaveDayKey` (GET was returning `"Sat Dec 26"`).
4. **Jest** — Date object expand · ISO datetime · LOCKED with pg `Date` leave row → **67/67 PASS** (was 64).
5. **API smoke** (U65, no seed claim as UF) — PASS:
   - open-period approve → `materialized_days: ["2026-12-29"]` + GET records `status=leave` · `attendance_date=2026-12-29`
   - closed Sept overlap approve → **409** `HRM-ATT-SHEET-LOCKED`
6. Forbidden honored — no seed · no Option C · no `apps/web/**` · no `attendance_uat_ready` claim · no commit.

---

## Files touched

| Path | Change |
|------|--------|
| `apps/api/hrm-api/src/attendance/leave-attendance-funnel.service.ts` | `toLeaveDayKey` · expand FIX · CODE-MEMORY APPEND |
| `apps/api/hrm-api/src/attendance/leave-attendance-funnel.service.spec.ts` | Date / ISO / LOCKED Date cases |
| `apps/api/hrm-api/src/attendance/attendance.service.ts` | normalizeAttendanceDateForApi → toLeaveDayKey |
| `scripts/qa/_tmp-po-hrm-att-leave-funnel-be-02-smoke.mjs` | L1 API smoke harness |
| `docs/qa/evidence/_tmp-po-hrm-att-leave-funnel-be-02-smoke.json` | smoke artifact |

---

## Verify

```text
pnpm exec jest --testPathPatterns=leave-attendance-funnel --testPathPatterns=leave-requests.service.spec --testPathPatterns=attendance.service.spec --no-coverage
→ Test Suites: 3 passed · Tests: 67 passed

node scripts/qa/_tmp-po-hrm-att-leave-funnel-be-02-smoke.mjs
→ verdict PASS · stamp LVFN-BE02-MSHMQTH5
  approve_open: 201 materialized_days=["2026-12-29"]
  get_records_leave: status=leave · date=2026-12-29
  approve_lock_overlap: 409 HRM-ATT-SHEET-LOCKED (2026-09-25)
```

---

## Residual

| ID | Owner | Note |
|----|-------|------|
| `PO-HRM-ATT-LEAVE-FUNNEL-QA-01` R2 | **qa** | Browser AC-01..03 + J-HRM-06b · U65 |
| LV-02 | — | stays **WAIVED_P1** |
| Module UAT | — | `attendance_uat_ready=false` |
| Prior smoke wrong-day rows (Dec 13-14 UTC shift before local fix) | ops/ignore | orphan markers; not UF |

---

## completion_report

Closed `R-ATT-LEAVE-FUNNEL-DATE-EXPAND`: `expandLeaveDateRange` / `toLeaveDayKey` coerce pg `Date` + ISO + plain day keys; LOCKED path receives non-empty days; GET records date normalize fixed. Jest 67/67. API smoke PASS (materialize + 409 LOCKED). Honesty false. Residual: QA browser R2.

## next_owner

**qa** — `PO-HRM-ATT-LEAVE-FUNNEL-QA-01` R2

## next_dispatch_prompt

```text
work_item_id: PO-HRM-ATT-LEAVE-FUNNEL-QA-01
from_role: pm
to_role: qa
lane: execution
round: R2
parent: PO-HRM-ATT-LEAVE-FUNNEL-BE-02 READY_FOR_QA · closed R-ATT-LEAVE-FUNNEL-DATE-EXPAND
u65: browser-only · zero-seed · attendance_uat_ready=false
must_keep: J-HRM-06b · J-HRM-06c · WAIVE_L2 · cấm Option C

read_first:
1. docs/qa/evidence/po-hrm-att-leave-funnel-be-02.md
2. docs/qa/evidence/po-hrm-att-leave-funnel-qa-01.md (prior FAIL)
3. docs/program/specs/PO-HRM-ATT-LEAVE-FUNNEL-SPEC-01.md §7 AC

entry_criteria:
- BE-02 smoke PASS: open approve materialized_days>0 + records status=leave yyyy-MM-dd; closed overlap 409 HRM-ATT-SHEET-LOCKED
- Nest hrm-api live with BE-02 dist

task:
1) AC-ATT-LV-SHEET-01 — FE create leave → Duyệt → weekly/Bản ghi leave cell · GET records 2xx · attendance_date ≠ "Thu/Sat …" · ≠1970 · materialized_days length>0
2) AC-ATT-LV-SHEET-03 — leave overlap closed Sept sheet → approve 409 HRM-ATT-SHEET-LOCKED (not 201 empty)
3) AC-ATT-LV-SHEET-02 — cancel reverse if AC-01 PASS (optional if FE cancel still stub — note residual)
4) J-HRM-06b storm ≤2/10s · LV-02 stays WAIVED_P1
5) Evidence docs/qa/evidence/po-hrm-att-leave-funnel-qa-01-r2.md

exit: PASS_TO_PM or FAIL_TO_PM with residual IDs
forbidden: seed · invent ladder N · claim attendance_uat_ready · Option C FE leave join
```

## ack_status

**READY_FOR_QA**
