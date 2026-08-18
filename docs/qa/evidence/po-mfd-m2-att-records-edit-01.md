# Evidence — `PO-MFD-M2-ATT-RECORDS-EDIT-01` (dev-fe)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M2-ATT-RECORDS-EDIT-01` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **date** | 2026-08-04 |
| **lane** | execution · FIX residual `R-MFD-M2-ATT-RECORDS-EDIT-STUB` |
| **priority** | P1 |
| **change_mode** | FIX · preserve_default |
| **spec_ref** | HRM-AT-03 · matrix #13 edit · J-HRM-06 detail/mutate |
| **U65** | zero-seed · no `pnpm seed:*` · FE wire only |
| **ack_status** | **READY_FOR_QA** |
| **uat_done** | `false` — **NOT** Attendance CLOSED · **NOT** Face LIVE |
| **do_not_regress** | CLOCK / SHEETS / LEAVE / OT GWC slices · list GET LIVE |

---

## completion_report

### Closed

1. **Root cause:** `AttendanceRecordsTable` row menu «Chỉnh sửa» had **no** `onSelect`/`onClick` → QA/QC `dialogAfterEdit=false` · `patchesFired=0`.
2. **FIX:** Wire Edit → Dialog (status select + optional note) → `updateRecord` → `updateAttendanceStatus` → `PATCH /api/hrm/attendance/records/:id/status`.
3. **Status enum:** `toApiAttendanceStatus` maps UI aliases (`on_leave`→`leave`, `late`/`early_leave`→`present`) to Nest DTO `pending|present|absent|leave`.
4. **After 2xx:** hook toast + `fetchRecords` refetch; Save button disabled while in-flight (double-click UX).
5. **CODE-MEMORY** APPEND on `AttendanceRecordsTable.tsx`, `useAttendanceRecords.ts`, `hrmApi.updateAttendanceStatus`.
6. **Vitest:** `useAttendanceRecords.test.ts` **7/7 PASS** (incl. 3 new mapper cases).

### Residual / out of scope

- Browser UAT of PATCH 2xx + F5 → **QA** this wave.
- Delete still maps to `status=absent` via existing hook path — **not** claimed as AT-03 PASS (forbidden Delete→absent as status UX cheat).
- `Attendance.tsx` `openEditAttendanceModal` remains unused overview path (hardcodes `present`) — not required for matrix #13 records table; ADD/FIX only on LIVE table.
- Face LIVE / Attendance CLOSED — **not claimed**.

---

## Files touched

| Path | Change |
|------|--------|
| `apps/web/hrm/src/components/attendance/AttendanceRecordsTable.tsx` | Edit modal + onSelect wire + testids |
| `apps/web/hrm/src/hooks/useAttendanceRecords.ts` | `toApiAttendanceStatus` + `updateRecord` uses mapper |
| `apps/web/hrm/src/hooks/useAttendanceRecords.test.ts` | mapper unit tests |
| `apps/web/hrm/src/integrations/hrmApi.ts` | CODE-MEMORY-CHANGE note on PATCH consumer |
| `apps/web/hrm/src/i18n/locales/vi.json` · `en.json` | `attendanceRecords.editNote*` |

---

## Browser verify path (QA)

```text
portal_url: http://127.0.0.1:5173/hr/attendance?portal=1&tenantId=xevn&companyId=trsport
persona: uat.nv0007@xe.vn (or HR with records) · companyId=trsport
```

1. Login → Chấm công → **Dữ liệu chấm công** (`activeAttendanceType=records`)
2. Confirm list LIVE (GET `/api/hrm/attendance/records` 200) — must_keep
3. Row kebab → **Chỉnh sửa** → dialog `data-testid=attendance-record-edit-dialog` opens
4. Change **Trạng thái** select → **Lưu**
5. Network: `PATCH /api/hrm/attendance/records/:id/status` → **2xx**
6. FE after 2xx: badge/status updates on row; dialog closes
7. **F5** → status persists
8. Assert: `patchesFired≥1` · `dialogAfterEdit=true` · no seed · no Attendance CLOSED claim

### Testids

- `attendance-records-table`
- `attendance-record-edit-{id}`
- `attendance-record-edit-dialog`
- `attendance-record-edit-status`
- `attendance-record-edit-save`

### Unit evidence

```bash
cd apps/web/hrm && pnpm exec vitest run src/hooks/useAttendanceRecords.test.ts
# → 7 passed (7)
```

---

## spec_read_ack

- srs: `docs/qa/professional/by-uc/HRM-AT-03.md` · TC-HRM-AT-03-ACT-HP-001 PATCH status · Diễn biến Lưu → 2xx → F5
- tech_spec: `docs/hrm/TECHSPEC.md` attendance records status
- api_design: `PATCH /api/hrm/attendance/records/:id/status` · `UpdateAttendanceStatusDto` status ∈ pending|present|absent|leave
- matrix: `HRM-ATTENDANCE_FIDELITY_MATRIX.md` #13 edit STUB → wire
- residual: `docs/qa/evidence/po-mfd-m2-att-records-01-qc.md` · `R-MFD-M2-ATT-RECORDS-EDIT-STUB`

---

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: PO-MFD-M2-ATT-RECORDS-EDIT-01-QA
from_role: pm
to_role: qa
lane: execution
priority: P1
u65_zero_seed: true
entry_criteria: L0 qc:fe-be-health PASS; FE wire READY_FOR_QA @ docs/qa/evidence/po-mfd-m2-att-records-edit-01.md
exit_criteria:
  - Browser: login → Chấm công → Dữ liệu chấm công → row Sửa → modal → change status → Lưu
  - Network PATCH /api/hrm/attendance/records/:id/status 2xx
  - FE after 2xx + F5 status persists
  - dialogAfterEdit=true · patchesFired≥1 · pageErrors=[]
  - must_keep: list GET LIVE; CLOCK/SHEETS/LEAVE/OT untouched; no seed; no Attendance CLOSED / Face LIVE claim
spec_ref: HRM-AT-03 · matrix #13 edit · J-HRM-06 mutate
evidence_path: docs/qa/evidence/po-mfd-m2-att-records-edit-01-qa.md
ack_status: PASS_TO_PM | FAIL_TO_PM
cấm: seed · Delete→absent as AT-03 PASS · invent Face LIVE
```

---

**ack_status:** `READY_FOR_QA`
