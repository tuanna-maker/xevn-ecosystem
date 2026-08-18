# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-BE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-BE-01` |
| **role** | dev-be |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **parent** | ATT-CODE-CATALOG-SA-01 Option B · BA-01 CONFIRMED · DATA-01 CONFIRMED |
| **Date** | 2026-08-08 |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | ADD |
| **Honesty** | `attendance_uat_ready=false` · `payroll_e2e_ready=false` · **C-SLICE-≠-MODULE** · U65 zero-seed |

---

## 1. spec_read_ack

| Artifact | Cite |
|----------|------|
| **srs / BA** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-BA-01.md` §3–§6 · AC-PLT-ATT-CODE-01* · VAL-ATT-CODE-CNS-01..10 |
| **tech_spec / SA** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-SA-01.md` §5–§6 F-ATT-CAT-CODE/EFF · F-ATT-CODE-CNS-01 · L-ATT-CODE-* |
| **db_design / DATA** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-DATA-01.md` §2 `att_attendance_code` · §3 DROP closed status CHECK/DTO |
| **api_design** | F-ATT-CAT-CODE-01..04 · F-ATT-CAT-CODE-EFF-01 · F-ATT-CODE-CNS-01 → `HRM-ATT-CODE-KEY` |
| **sponsor_confirm** | BA-01 CONFIRMED + DATA-01 CONFIRMED — BE HOLD LIFTED (PM dispatch) |

---

## 2. What closed

| Cap | Implementation |
|-----|----------------|
| **ensureSchema** | `public.att_attendance_code` + partial UQ `(company_id, lower(code)) WHERE archived_at IS NULL` + format/symbol/counts_as/day_weight/row_status CHKs + effective IX + typed flags |
| **DROP ceiling** | `chk_attendance_status` DROP in `AttendanceService.ensureSchema` + `LeaveAttendanceFunnelService.ensureLeaveFunnelSchema`; CREATE TABLE no longer embeds closed CHECK |
| **DTO open** | `CreateAttendanceRecordDto` / `UpdateAttendanceStatusDto` / `ListAttendanceRecordsQueryDto` — **no** `@IsIn(['pending','present','absent','leave'])` |
| **F-ATT-CAT-CODE-01..04** | Nest CRUD/retire under `/attendance/attendance-codes*` |
| **F-ATT-CAT-CODE-EFF-01** | GET `/attendance/attendance-codes/effective` — dual SoT Settings REF `attendance_codes` merge-read; **ATT wins** |
| **F-ATT-CODE-CNS-01** | `createRecord` / `updateStatus` assert ∈ EFF when count>0 → **`HRM-ATT-CODE-KEY`**; EFF=0 soft skip · **no seed** |
| **Display-ready** | `status_label` + `symbol` from catalog lookup on list/get/create/update (bootstrap hardcode only when EFF empty) |
| **scope_parity** | list ↔ get-by-id ↔ assert via `resolveHrmListScope` / `assertResourceInHrmScope` |
| **@CODE-MEMORY** | APPEND on service/constants/DTOs/controller/attendance.service |

---

## 3. must_keep / FORBIDDEN verified

| Lock | Status |
|------|--------|
| L-ATT-CODE-07 — no rewrite `att-timesheet-line-aggregate` / LIST-TOTALS | **RETAIN** — flags physical only |
| Fold into `att_leave_type` / work_shifts / work_sites | **FORBIDDEN** — separate Nest table |
| Seed / flip `attendance_uat_ready` / `payroll_e2e_ready` | **DENIED** |
| Reopen EMP/ATT leave/worksite/SI/CTR seals | **RETAIN** |
| Mega-EAV | **DENIED** |

---

## 4. Jest evidence

```text
pnpm --filter hrm-api exec jest --testPathPatterns=att-attendance-code.service.spec --testPathPatterns=attendance.controller.spec --testPathPatterns=attendance.service.spec --no-coverage
→ Test Suites: 3 passed · Tests: 60 passed

pnpm --filter hrm-api exec jest --testPathPatterns=leave-attendance-funnel.service.spec --testPathPatterns=att-leave-type.service.spec --no-coverage
→ Test Suites: 2 passed · Tests: 23 passed (regression seals)
```

VAL coverage in `att-attendance-code.service.spec.ts`: CNS-01 invent KEY · CNS-02 admin N+1 · CNS-03 scope_parity · CNS-04 soft-retire · CNS-05 empty skip · CNS-07 open slug wire · CNS-08 display · CNS-09 KEY taxonomy · CNS-10 aggregate non-claim · dual-SoT ATT wins · createRecord invent wire.

---

## 5. Files touched (allow-list)

- `apps/api/hrm-api/src/attendance/att-attendance-code.constants.ts` **ADD**
- `apps/api/hrm-api/src/attendance/att-attendance-code.service.ts` **ADD**
- `apps/api/hrm-api/src/attendance/att-attendance-code.service.spec.ts` **ADD**
- `apps/api/hrm-api/src/attendance/dto/att-attendance-code.dto.ts` **ADD**
- `apps/api/hrm-api/src/attendance/dto/create-attendance-record.dto.ts` **UPGRADE** open status
- `apps/api/hrm-api/src/attendance/dto/update-attendance-status.dto.ts` **UPGRADE** open status
- `apps/api/hrm-api/src/attendance/dto/list-attendance-records.query.dto.ts` **UPGRADE** open status filter
- `apps/api/hrm-api/src/attendance/attendance.service.ts` **ADD** DROP chk · CNS assert · display
- `apps/api/hrm-api/src/attendance/attendance.controller.ts` **ADD** attendance-codes routes
- `apps/api/hrm-api/src/attendance/attendance.controller.spec.ts` **ADD** mock
- `apps/api/hrm-api/src/attendance/leave-attendance-funnel.service.ts` **FIX** DROP chk on funnel ensure
- `apps/api/hrm-api/src/app.module.ts` **ADD** provider

---

## 6. Residual / next

| Item | Owner |
|------|-------|
| L1 invent KEY + DTO IsIn gone + EFF list browser | **qa** |
| FE rebind `AttendanceRecordsTable` Select to Nest EFF (VAL-06 / 01f) | **dev-fe** after QA or parallel |
| GĐ2 aggregate flag wiring | **OUT** this seat |

---

## 7. Handoff

```yaml
ack_status: READY_FOR_QA
next_owner: qa
evidence_path: docs/qa/evidence/po-hrm-dynamic-config-platform-att-code-catalog-be-01.md
honesty:
  attendance_uat_ready: false
  payroll_e2e_ready: false
  C-SLICE: true
  U65: zero-seed
```
