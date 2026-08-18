# PO-MFD-M2-ATT-RECORDS-EDIT-01-R2-FE — harden edit Dialog date (Invalid time value)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-MFD-M2-ATT-RECORDS-EDIT-01-R2-FE` |
| **role** | dev-fe |
| **date** | 2026-08-04 |
| **change_mode** | FIX |
| **preserve_default** | true |
| **u65_zero_seed** | true |
| **spec_ref** | HRM-AT-03 · matrix #13 edit · J-HRM-06 mutate |
| **prior QA FAIL** | `docs/qa/evidence/po-mfd-m2-att-records-edit-01-qa.md` · residual `R-MFD-M2-ATT-RECORDS-EDIT-DATE-CRASH` |
| **ack_status** | **READY_FOR_QA** |

---

## Problem (QA)

- Row «Chỉnh sửa» opened wire but Dialog white-screen: `pageErrors: Invalid time value` ×4.
- List GET returns `attendance_date: "Tue Aug 04"` (not `yyyy-MM-dd`).
- FE did `format(new Date(attendance_date + 'T00:00:00'), …)` → throw → `dialogAfterEdit=false` · `patchesFired=0`.

## Fix (FE harden — no BE)

1. Added `formatAttendanceRecordDateDisplay(attendance_date, check_in_at?)` — never throws; prefers `yyyy-MM-dd`, then `check_in_at` ISO date prefix, else `—`.
2. Edit Dialog uses helper (removed date-fns `format(new Date(...+'T00:00:00'))`).
3. `AttendanceRecord.check_in_at` kept from Nest list row for fallback display.
4. PATCH `updateRecord` path + testids `attendance-record-edit-dialog|status|save` **unchanged** (+ optional `attendance-record-edit-date`).

## must_keep

| Item | Status |
|------|--------|
| List GET LIVE | untouched |
| Delete ≠ AT-03 substitute | untouched |
| CLOCK / SHEETS / LEAVE / OT | untouched |
| No seed | yes |

## BE residual (note only — not implemented)

List DTO should normalize `attendance_date` to `yyyy-MM-dd`. FE now survives non-ISO; BE contract cleanup still recommended for consumers/export.

## Files

- `apps/web/hrm/src/lib/attendanceRecordDateDisplay.ts` (+ `.test.ts`)
- `apps/web/hrm/src/components/attendance/AttendanceRecordsTable.tsx`
- `apps/web/hrm/src/hooks/useAttendanceRecords.ts` (`check_in_at` on UI record)

## Verify

```text
pnpm exec vitest run src/lib/attendanceRecordDateDisplay.test.ts src/hooks/useAttendanceRecords.test.ts
→ 2 files · 13 tests PASS
```

Crash repro covered in unit test: `Tue Aug 04` + `T00:00:00` is Invalid Date; helper returns `04/08/2026` via `check_in_at` or `—` without throw.

## completion_report

- **Closed:** R-MFD-M2-ATT-RECORDS-EDIT-DATE-CRASH FE harden — edit Dialog date safe; PATCH path preserved.
- **Residual:** BE `attendance_date` normalize to yyyy-MM-dd (optional / separate BE work_item); browser AT-03 mutate not yet retested.

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: PO-MFD-M2-ATT-RECORDS-EDIT-01-R2-QA
from_role: pm
to_role: qa
u65_zero_seed: true
entry: docs/qa/evidence/po-mfd-m2-att-records-edit-01-r2-fe.md READY_FOR_QA
prior_fail: docs/qa/evidence/po-mfd-m2-att-records-edit-01-qa.md (Invalid time value)
spec_ref: HRM-AT-03 · matrix #13 edit · J-HRM-06

Retest browser U65 (NOT Delete→absent):
1. L0 qc:fe-be-health PASS
2. Login uat.nv0007@xe.vn → /hr/attendance?portal=1&tenantId=xevn&companyId=trsport
3. Chấm công → Dữ liệu chấm công → list GET 200 HRM-ATT-200
4. Row kebab → Chỉnh sửa
5. Assert: dialog visible (testid attendance-record-edit-dialog); pageErrors=[]; date field shows dd/MM/yyyy or «—» (no white screen)
6. Change status → Lưu → PATCH /api/hrm/attendance/records/:id/status 2xx
7. FE after 2xx + F5 status persists
8. patchesFired≥1 · dialogAfterEdit=true · testids status/save present
exit: evidence docs/qa/evidence/po-mfd-m2-att-records-edit-01-r2-qa.md · PASS_TO_PM or FAIL with residual
cấm: seed · invent AT-03 PASS · Attendance CLOSED / Face LIVE claim
```

## ack_status

**READY_FOR_QA**
