# Evidence — PO-MFD-M1-ATT-CFG-REF-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M1-ATT-CFG-REF-01` |
| **from_role** | ba-data |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/professional/menu-fidelity/HRM-ATTENDANCE_DATA_CLASS_MATRIX.md` |
| **date** | 2026-08-04 |

## completion_report

**Closed:** Phân loại REF/CFG/TXN/RPT cho toàn bộ cụm Attendance enterprise (ca, quy tắc general/standard/device/app, OT coeff, leave rules, late-early, request rules, cột bảng công, geofence, auto-checkout) kèm SoT XBOS/HRM, đường cấu hình menu/API, validation, consumer Payroll/Leave/OT/Mobile, và mã gap `OK` / `MISSING_CFG_UI` / `HARDCODED`. Bảng P0 §6 ordered cho SA/Dev.

**Residual:** Chưa browser runtime (inventory code/docs); `HRM-AT-14` chưa có file `by-uc/` — ghi UNMAPPED trong matrix; API attendance-rules chưa có trên Nest (chỉ Supabase types + FE hook); SPEC_GAP chi tiết policy auto-checkout hours / OT type catalog codes — cần BA delta narrow nếu Dev implement P0-1.

**Sources read:** `PO_MENU_FIDELITY_DEPTH_PROGRAM.md` §4; training pack §15; `Attendance.tsx` (settings, rules subtabs, columns); `DB_DESIGN_VN.md` / `API_CONTRACT_VN.md` (attendance keywords); `apps/api/hrm-api/src/attendance/*` DTOs + controller + catalog/service + geofence in `attendance.service.ts`; `useAttendanceRules.ts`; `hrm-settings-master-keys.ts` (`leave_types`, `shifts`); `catalog-sync` leave_types.

## Quiz §15.4 (training pack)

1. **≥5 surfaces + runtime (pre-browser):**
   - Cài đặt→Quy tắc chấm công→**Chung** — ~~**STUB_UI** (Save unwired, in-memory)~~ **SUPERSEDED** DOC-01 / M1 CFG GWC — Nest `PATCH /attendance/rules` **200** + F5 (`po-mfd-m2-att-cfg-doc-01.md`).
   - Cài đặt→Quy tắc→**Ứng dụng** GPS list — **PARTIAL** (read hook defaults, Add unwired).
   - Cài đặt→**Tăng ca** / **Quy tắc nghỉ** / **Đi muộn** — **STUB_UI** (`featureInDev`).
   - Ca→**Danh sách** — **LIVE** (`/attendance/work-shifts`).
   - Chấm công→**Bảng công** — **LIVE** (sheets API; grid empty honest).
   - Rules→**Tùy chỉnh** cột — **HARDCODED** list, no API.

2. **REF vs CFG — cấu hình ở đâu:**
   - **REF:** `leave_types` — XBOS catalog publish → HRM Settings catalog pull (`catalog-sync`, key `leave_types`); không cấu hình tại Attendance sidebar stub.
   - **CFG:** `standard_days_per_month` / geofence radius — **target** HRM `attendance_rules` + `attendance_work_sites`; **hiện tại** FE defaults trong `useAttendanceRules.ts` (no API); BE geofence via `attendance_work_sites` on check-in only.

3. **UNMAPPED by-uc (examples):**
   - Attendance **Cài đặt** panels: overtime, leave-rules, late-early, request-rules, users, roles, system (no HRM-AT-xx).
   - Rules subtabs: tablet, proxy, auto.
   - Sheet **column catalog** customize (FR-HRM-AT-14 column AC not in `docs/qa/professional/by-uc/HRM-AT-14.md` — file absent).
   - Device tool download/login wizard (device integration UC gap).

4. **Payroll / Leave link (P0 surface):**
   - **Payroll:** `standard_days_per_month`, `hours_per_day`, sheet columns, OT `coefficient`, work shift coefficient — all **CFG/REF** currently stub or hardcoded → sai công chuẩn lương.
   - **Leave:** `leave_types` REF drives balance + request; Attendance «Quy tắc nghỉ» stub does not replace Settings sync — payroll leave columns on sheet hardcoded.

5. **P0 fix đầu tiên + owner:**
   - **P0-1:** Ship `attendance_rules` API + unify geofence (`attendance_work_sites` slug scope) + wire Rules→Chung/App Save to persist — **dev-be** (API/DB) + **dev-fe** (bind controls to `saveRules`/API); **sa** ack dual model.

## next_owner

pm

## next_dispatch_prompt

```text
work_item_id: PO-MFD-M1-ATT-P0-CFG-BE-01
Dispatch SA (ack, 0.5d governance) then dev-be + dev-fe execution:

read_first:
- docs/qa/professional/menu-fidelity/HRM-ATTENDANCE_DATA_CLASS_MATRIX.md §6 P0-1..P0-6
- apps/web/hrm/src/hooks/useAttendanceRules.ts
- apps/api/hrm-api/src/attendance/attendance.service.ts (attendance_work_sites)
- docs/hrm/SRS.md FR-HRM-SC-SHIFT-01 (dual shifts SoT)

SA exit: ADR snippet — single SoT for shifts (work_shifts vs XBOS shifts) + attendance_rules physical table vs company_settings JSON; geofence company_id TEXT slug parity.

dev-be entry: Implement GET/PATCH /attendance/rules (or settings key) persisting attendance_rules shape; CRUD /attendance/work-sites with company_id TEXT; remove ensureDefaultWorkSite pilot insert from UAT path (U65); align HRM-ATT-GEO-001 with API_CONTRACT; DTO strict.

dev-fe entry: Wire Rules→general/standard/app Save + GPS add/edit to API; replace getAttendanceColumnsData hardcode with API or feature flag STUB banner; mark sidebar OT/leave-rules stubs with «Cấu hình tại Settings→Danh mục» where applicable.

QA entry (after READY_FOR_QA): U65 browser — configure rule → F5 → mutate record with GPS; Payroll consumer smoke N/A until payroll wave — document CFG persisted.

evidence_path: docs/qa/evidence/po-mfd-m1-att-p0-cfg-be-01.md
ack_status target: READY_FOR_QA
cấm: seed rules/sites; apps change without spec_read_ack
```
