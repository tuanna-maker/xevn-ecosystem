# PO-MFD-M2-ATT-SETTINGS-EMP-01-FE — Settings→Nhân viên Refresh + Import wire

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-MFD-M2-ATT-SETTINGS-EMP-01-FE` |
| **role** | dev-fe |
| **date** | 2026-08-04 |
| **change_mode** | FIX |
| **preserve_default** | true |
| **u65_zero_seed** | true |
| **spec_ref** | matrix #31 · ATT-C7 · HRM-IM-01 · FR-HRM-IM-01 · HDSD Thiết lập→Nhân viên |
| **prior residual** | `R-MFD-M2-ATT-SETTINGS-EMP-IMPORT-REFRESH-UNWIRED` (`po-mfd-m2-att-settings-emp-01-qa.md`) |
| **ack_status** | **READY_FOR_QA** |
| **uat_done** | **false** |
| **attendance_closed** | **false** |

---

## spec_read_ack

| Artifact | Cite |
|----------|------|
| **srs** | `docs/hrm/BANG_TONG_HOP_USECASE_HRM.md` **HRM-IM-01** (Xem trước import nhân sự từ file) · matrix #31 Settings→Nhân viên (refresh + import CTAs) · HDSD path CC→HRM→Chấm công→Thiết lập→Nhân viên |
| **tech_spec** | `docs/hrm/TECHSPEC.md` **FR-HRM-IM-01** · `POST /api/hrm/spreadsheet/import/preview` + commit · `kind=employee_import` · existing FE `previewEmployeeSpreadsheetImport` / `commitEmployeeSpreadsheetImport` |
| **db_design** | N/A (FE wire only — reuse employee spreadsheet import; no new tables) |
| **api_design** | Reuse existing Nest spreadsheet import — **no** new attendance-employee import endpoint |
| **change_mode** | FIX |
| **sponsor_confirm** | PM dispatch `PO-MFD-M2-ATT-SETTINGS-EMP-01-FE` · residual from QA/QC GWC |

### Spec says / code did

| Item | Spec / QA | Before | After |
|------|-----------|--------|-------|
| List | GET employees LIVE | Working (`useEmployees`) | Unchanged |
| Lấy lại dữ liệu | Refetch same GET | Button **no onClick** | `refetchEmployees()` |
| Nhập khẩu | File + import API or fail-closed | Button **no onClick** | Opens `EmployeeImportDialog` → preview/commit HRM-IM-01; fail-closed toast if no company scope |

---

## Problem (QA)

- Thiết lập → Nhân viên: list GET **200** `HRM-EMP-200` (59 rows).
- **Lấy lại dữ liệu** / **Nhập khẩu** click → **0** network; no file dialog.
- Root cause: `Attendance.tsx` `renderSettingsContent` employees branch — both `<Button>` had **no `onClick`**.

---

## Fix (FE only)

1. **Refresh** — `data-testid=hdsd-att-settings-emp-refresh` → `handleRefreshSettingsEmployees` → `useEmployees.refetch` (same GET picker path).
2. **Import** — `data-testid=hdsd-att-settings-emp-import` → open existing `EmployeeImportDialog` (file picker + preview/commit spreadsheet API). Fail-closed toast when `currentCompanyId` missing.
3. Helper `resolveAttendanceEmployeeImportScope` (parity with Employees.tsx scope).
4. CODE-MEMORY APPEND on `Attendance.tsx` + new lib file.

**Not invented:** attendance-specific import API. Reused employee spreadsheet import (HRM-IM-01) already LIVE on `/hr/employees`.

---

## must_keep

| Item | Status |
|------|--------|
| List GET path / scope headers | untouched |
| REPORTS / REQUESTS / LEAVE / OT / CLOCK | untouched |
| No seed · no invent #31 LIVE / Attendance CLOSED | yes |

---

## Files

- `apps/web/hrm/src/pages/Attendance.tsx` — wire CTAs + dialog + CODE-MEMORY APPEND
- `apps/web/hrm/src/lib/attendanceSettingsEmployeesActions.ts` — scope helper + CODE-MEMORY
- `apps/web/hrm/src/lib/attendanceSettingsEmployeesActions.test.ts` — unit + source-guard

---

## Verify

```text
cd apps/web/hrm
pnpm test -- src/lib/attendanceSettingsEmployeesActions.test.ts src/pages/Attendance.smoke.test.ts
→ Test Files  2 passed (2)
→ Tests  5 passed (5)
```

---

## Residuals for QA / BA

| ID | Owner | Note |
|----|-------|------|
| Browser retest Refresh GET + Import dialog | **qa** | R2 below |
| `R-MFD-M2-ATT-SETTINGS-EMP-MAPPING-SPEC_GAP` | ba-process | OBS — mã chấm công / leave days still REF/`—` (unchanged this wave) |

---

## completion_report

**Closed:** `R-MFD-M2-ATT-SETTINGS-EMP-IMPORT-REFRESH-UNWIRED` — FE wire Refresh→refetch + Import→EmployeeImportDialog (HRM-IM-01). Vitest 5/5. FE only; no BE.

**Open:** Browser U65 retest (QA R2). Do **not** stamp #31 LIVE / Attendance CLOSED / `uat_done` until QA browser evidence.

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: PO-MFD-M2-ATT-SETTINGS-EMP-01-R2-QA
from_role: pm
to_role: qa
lane: execution
priority: P1
u65_zero_seed: true
hdsd_align: true
u76_hdsd_align: true
entry_criteria: FE READY_FOR_QA docs/qa/evidence/po-mfd-m2-att-settings-emp-01-fe.md — Refresh/Import wired; vitest 5/5; L0 via qc:fe-be-health
exit_criteria: Browser ceo@xe.vn / main — Thiết lập→Nhân viên; click Lấy lại dữ liệu → GET employees 200 (refetch); click Nhập khẩu → dialog + file chooser (preview API if file selected optional); idle0; stamp #31 honesty (PARTIAL→LIVE only if both CTAs network-proven); uat_done=false; Attendance NOT CLOSED; evidence docs/qa/evidence/po-mfd-m2-att-settings-emp-01-r2-qa.md; ack_status PASS_TO_PM
cấm: seed · invent Attendance CLOSED · invent UAT DONE · invent #31 LIVE without network proof · reopen REPORTS/REQUESTS/LEAVE/OT/CLOCK without new FAIL
evidence_path: docs/qa/evidence/po-mfd-m2-att-settings-emp-01-r2-qa.md
ack_status: PASS_TO_PM
```

## ack_status

**READY_FOR_QA**
