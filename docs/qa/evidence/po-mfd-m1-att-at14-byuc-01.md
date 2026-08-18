# Evidence — PO-MFD-M1-ATT-AT14-BYUC-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M1-ATT-AT14-BYUC-01` |
| **from_role** | ba-process |
| **to_role** | pm |
| **lane** | governance |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/professional/by-uc/HRM-AT-14.md` |
| **date** | 2026-08-04 |
| **uat_done** | false |

## completion_report

**Closed:** Professional by-UC pack `HRM-AT-14.md` (37 TC) theo template `_TEMPLATE_UC_TC.md` và cấu trúc sibling `HRM-AT-01.md`. Phạm vi MFD: quy tắc **Chung / Công chuẩn / Ứng dụng** (Save persist target), GPS work sites, tùy chỉnh cột bảng công, kèm **AC-ATT-SHEET** bảng kỳ; HP+FD+AU tối thiểu; `code_readiness: PARTIAL` (sheets LIKELY_IMPL · rules/columns/GPS admin GAP) bám `HRM-ATTENDANCE_DATA_CLASS_MATRIX.md` + `po-mfd-m1-att-cfg-ref-01.md`. SPEC_GAP rows: `attendance_rules` FR đủ 7 mục, column catalog API, auto-checkout duration, work_sites CRUD+slug. Cập nhật `_INVENTORY_PHASE1.md` (MFD delta) và matrix trace §5.

**Residual:** Chưa browser U65; chưa SA ADR rules physical model; tablet/proxy/auto subtabs chỉ FD stub honesty; device login code UNMAPPED; execution blocked on `PO-MFD-M1-ATT-P0-CFG-BE-01`.

**Sources read:** `HRM-ATTENDANCE_DATA_CLASS_MATRIX.md`; `po-mfd-m1-att-cfg-ref-01.md`; `PO_PM_SENIOR_TRAINING_PACK_20260804.md` §15; `HRM-AT-01.md`; `docs/hrm/SRS.md` UC-HRM-23/HRM-AT-14 + AC-ATT-SHEET; `docs/hrm/TECHSPEC.md` §12.1/§14.4; `useAttendanceRules.ts`; `attendance.controller.ts` (sheets).

## Quiz §15.4 (ack)

1. **Surfaces (Attendance CFG):** Rules→Chung (STUB Save) · Rules→Công chuẩn · Rules→Ứng dụng/GPS · Rules→Tùy chỉnh cột · Bảng công list/mutate · Ca danh sách (REF, ngoài AT-14 P0).
2. **REF vs CFG:** `leave_types` = REF @ Settings catalog-sync (not Attendance sidebar stub); `standard_days_per_month` / GPS radius = CFG target `attendance_rules` + `attendance_work_sites` — hiện HARDCODED/in-memory.
3. **UNMAPPED → mapped:** `HRM-AT-14.md` now covers rules/columns/sheets cluster previously absent in `by-uc/`.
4. **Payroll/Leave link:** CFG công chuẩn + sheet columns drive payroll; leave_types REF not Attendance «Quy tắc nghỉ» stub — cases cite consumer in TC-STD/GPS/COL.
5. **P0 first fix:** Same as cfg-ref evidence — rules API + geofence slug + wire Save (`dev-be`+`dev-fe` after SA ADR).

## next_owner

pm

## next_dispatch_prompt

```text
work_item_id: PO-MFD-M1-ATT-P0-CFG-BE-01
from_role: pm
to_role: sa (governance 0.5d) then dev-be + dev-fe

read_first:
- docs/qa/professional/by-uc/HRM-AT-14.md §7–§9
- docs/qa/professional/menu-fidelity/HRM-ATTENDANCE_DATA_CLASS_MATRIX.md §6
- docs/qa/evidence/po-mfd-m1-att-cfg-ref-01.md (next_dispatch_prompt)

SA exit: ADR snippet — attendance_rules table vs company_settings JSON; work_sites company_id TEXT slug parity; dual shifts SoT (work_shifts vs XBOS shifts).

dev-be/dev-fe entry: Implement per ADR; map TC-HRM-AT-14-RULE-GEN-SAVE-HP-001 / GPS-CRUD-HP-001 / COL-MUTATE target cases; U65 no seed.

QA exit (after READY_FOR_QA): Browser CFG persist F5 + sheet AC-ATT-SHEET-01..06 subset; document AS-IS FAIL for unwired until fixed.

evidence_path: docs/qa/evidence/po-mfd-m1-att-p0-cfg-be-01.md
ack_status target: READY_FOR_QA
cấm: seed rules/sites
```
