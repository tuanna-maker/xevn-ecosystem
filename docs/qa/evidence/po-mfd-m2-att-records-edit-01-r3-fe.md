# PO-MFD-M2-ATT-RECORDS-EDIT-01-R3-FE — PATCH status mutate company scope

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-MFD-M2-ATT-RECORDS-EDIT-01-R3-FE` |
| **role** | dev-fe |
| **date** | 2026-08-04 |
| **change_mode** | FIX |
| **preserve_default** | true |
| **u65_zero_seed** | true |
| **spec_ref** | HRM-AT-03 · matrix #13 edit · J-HRM-06 mutate |
| **prior QA FAIL** | `docs/qa/evidence/po-mfd-m2-att-records-edit-01-r2-qa.md` · residual `R-MFD-M2-ATT-RECORDS-EDIT-PATCH-SCOPE` |
| **CLOSED prior** | `R-MFD-M2-ATT-RECORDS-EDIT-DATE-CRASH` (R2 FE — keep) |
| **ack_status** | **READY_FOR_QA** |

---

## Problem (QA R2)

- Edit Dialog LIVE; date `04/08/2026`; no white screen.
- **Lưu** → PATCH `/api/hrm/attendance/records/:id/status` **409** `HRM-ATT-409` with browser header **`x-company-id=main`** while OU / JWT = **`trsport`**.
- L1 Nest + `x-company-id=trsport` → **200** `HRM-ATT-202` (BE OK; FE header scope FAIL).

## Root cause

`updateAttendanceStatus` called `requestHrm` **without** mutate scope opts → `inferRuntimeScope()` / spreadsheet catalog early-return forced **`main`** on portal master-tenant sessions (same class as leave approve / ATT update-request approve before `resolveHrmMutateCompanyScope`).

## Fix (FE only)

1. `updateAttendanceStatus(recordId, payload, companyId?)` → `hrmOuMutateOpts(companyId)` → `resolveHrmMutateCompanyScope` → `x-company-id` = JWT/OU (never default `main` on member NV).
2. `useAttendanceRecords.updateRecord` / `checkOut` / `deleteRecord` pass `currentCompanyId`.
3. `Attendance.tsx` legacy save path also passes `currentCompanyId`.
4. Kept DATE harden + testids `attendance-record-edit-dialog|status|save|date`.

## must_keep

| Item | Status |
|------|--------|
| List GET LIVE | untouched |
| DATE harden (R2) | kept |
| Edit testids | kept |
| Delete ≠ AT-03 substitute | untouched |
| CLOCK / SHEETS / LEAVE / OT | untouched |
| No seed · no invent AT-03 PASS / Attendance CLOSED | yes |

## Files

- `apps/web/hrm/src/integrations/hrmApi.ts` — `updateAttendanceStatus` + CODE-MEMORY APPEND
- `apps/web/hrm/src/integrations/hrmApi.updateAttendanceStatus.test.ts` — fetch assert `x-company-id=trsport`
- `apps/web/hrm/src/hooks/useAttendanceRecords.ts` — pass `currentCompanyId` + CODE-MEMORY APPEND
- `apps/web/hrm/src/hooks/useAttendanceRecords.test.ts` — source-guard wire
- `apps/web/hrm/src/pages/Attendance.tsx` — pass `currentCompanyId`
- `apps/web/hrm/src/components/attendance/AttendanceRecordsTable.tsx` — CODE-MEMORY APPEND (consumer)

## Verify

```text
pnpm exec vitest run src/integrations/hrmApi.updateAttendanceStatus.test.ts \
  src/hooks/useAttendanceRecords.test.ts \
  src/lib/attendanceRecordDateDisplay.test.ts \
  src/integrations/hrmApi.approveLeaveRequest.test.ts
→ 4 files · 17 tests PASS
```

Unit asserts PATCH header `x-company-id=trsport` (not `main`) when JWT/hint = trsport.

## completion_report

- **Closed (FE):** `R-MFD-M2-ATT-RECORDS-EDIT-PATCH-SCOPE` — status PATCH mutate scope parity with leave/ATT approve.
- **Residual:** Browser AT-03 mutate not yet retested (QA R3). Do **not** stamp matrix #13 edit LIVE / Attendance CLOSED until QA browser 2xx + F5.

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: PO-MFD-M2-ATT-RECORDS-EDIT-01-R3-QA
from_role: pm
to_role: qa
u65_zero_seed: true
entry: docs/qa/evidence/po-mfd-m2-att-records-edit-01-r3-fe.md READY_FOR_QA
prior_fail: docs/qa/evidence/po-mfd-m2-att-records-edit-01-r2-qa.md (PATCH 409 x-company-id=main)
spec_ref: HRM-AT-03 · matrix #13 edit · J-HRM-06
hdsd_align: Chấm công → Dữ liệu chấm công → row Chỉnh sửa → status → Lưu

Retest browser U65 (NOT Delete→absent · NOT invent AT-03 PASS / Attendance CLOSED):
1. L0 qc:fe-be-health PASS
2. Login uat.nv0007@xe.vn → /hr/attendance?portal=1&tenantId=xevn&companyId=trsport
3. List GET 200 HRM-ATT-200
4. Row kebab → Chỉnh sửa → dialog + date dd/MM/yyyy (or —) · pageErrors=[]
5. Change status → Lưu → PATCH /attendance/records/:id/status **2xx** (expect HRM-ATT-202)
6. Assert Network header **x-company-id=trsport** (NOT main)
7. FE after 2xx + F5 → status persists
8. Evidence: docs/qa/evidence/po-mfd-m2-att-records-edit-01-r3-qa.md
cấm: seed · Delete as AT-03 · claim Face LIVE / Attendance CLOSED
```

## ack_status

**READY_FOR_QA**
