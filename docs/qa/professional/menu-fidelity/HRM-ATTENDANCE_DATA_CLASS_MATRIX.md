# HRM Attendance — Data class matrix (REF / CFG / TXN / RPT)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-MFD-M1-ATT-CFG-REF-01` |
| **program** | U87 · Menu Fidelity Depth |
| **pilot menu** | Command Center → HRM → Chấm công (`apps/web/hrm/src/pages/Attendance.tsx`) |
| **author** | ba-data |
| **date** | 2026-08-04 |
| **SoT program** | `docs/program/PO_MENU_FIDELITY_DEPTH_PROGRAM.md` §4 |
| **DOC-DELTA** | `PO-MFD-M2-ATT-CFG-DOC-01` (2026-08-04) — retire «rules NO_API / HARDCODED in-memory / cfgNotPersisted» for **Chung + work-sites**; SoT [`ADR-HRM-ATTENDANCE-CFG-PERSIST-20260804.md`](../../../architecture/ADR-HRM-ATTENDANCE-CFG-PERSIST-20260804.md) + GWC `po-mfd-m1-att-p0-cfg-qc-01.md`. **uat_done remains false.** Columns / D4 stubs / GEO-001 browser residual unchanged. |

## 1. Legend

| Class | Enterprise meaning | Configure expectation |
|-------|-------------------|------------------------|
| **REF** | Danh mục / master code — picker, không mutate nghiệp vụ tại Attendance | XBOS catalog publish → HRM pull (`catalog-sync` / Settings MD); **không** hardcode FE |
| **CFG** | Quy tắc công ty (versioned) — ảnh hưởng mọi TXN sau khi lưu | HRM Settings / Attendance → Cài đặt **hoặc** `hrm_company_settings` / API rules; F5 phải còn |
| **TXN** | Giao dịch / document — audit, WF, scope | REST mutate + empty honesty; **không** seed UAT |
| **RPT** | Read model / export — derived từ TXN+CFG | GET aggregate; không SoT |

| gap code | Meaning |
|----------|---------|
| **OK** | Có đường cấu hình + API/DB khớp class (có thể thiếu UI polish) |
| **MISSING_CFG_UI** | BE/spec có hoặc cần có; UI stub / placeholder / «đang phát triển» |
| **HARDCODED** | Giá trị cố định FE hoặc default in-memory; không persist / không catalog |

**Scope parity note (U19):** Mọi TXN list↔get-by-id dùng cùng `resolveHrmListScope` / `company_id` TEXT slug — geofence `attendance_work_sites.company_id` hiện UUID (lệch slug) → P0 data defect.

---

## 2. Master matrix (entity / field)

### 2.1 Ca làm việc (work shifts)

| entity/field | class | SoT system | configure_path | validation rules | used_by | gap |
|--------------|-------|------------|----------------|------------------|---------|-----|
| `work_shifts` (row) | **REF** (ca master per company) | **HRM** (table `public.work_shifts`; SRS `FR-HRM-SC-SHIFT-01` HOLD dual vs XBOS `shifts`) | CC→HRM→Chấm công→**Ca→Danh sách** · API `GET/POST/PATCH/DELETE /attendance/work-shifts` | `code`,`name` required; `start_time`,`end_time` HH:mm; `work_hours` ≥0; `coefficient` ≥0; `status` ∈ {active,inactive}; scope `company_id` slug | Payroll (hệ số ca), OT scheduling, sheet roster (future) | **OK** API+UI list; **HARDCODED** chưa bind XBOS catalog `shifts` |
| `work_shifts.code` | REF | HRM | Same + modal Tạo/Sửa ca | Unique per `company_id` (business — enforce BE nếu thiếu → SPEC_GAP) | OT, đổi ca | OK mutate |
| `work_shifts.coefficient` | CFG (attribute on REF row) | HRM | Ca modal field «Hệ số» | Numeric ≥0 | Payroll, OT `coefficient` on request | OK |
| `work_shifts.is_night_shift` / `is_overtime_shift` | CFG | HRM | Ca modal | Boolean | OT rules | OK |
| Shift **schedule** grid | TXN (assignment) | HRM (planned) | Ca→**Lịch ca** | Employee×day → shift_id; scope company | Payroll, Leave overlap | **MISSING_CFG_UI** — UI surface; no dedicated assignment API in controller |
| Shifts→**OT** submenu | RPT/TXN mix | HRM | Ca→Tăng ca | Links to OT requests | OT, Payroll | **PARTIAL** — tab shell; requests live under Đơn từ |

### 2.2 Quy tắc chấm công (attendance rules)

| entity/field | class | SoT system | configure_path | validation rules | used_by | gap |
|--------------|-------|------------|----------------|------------------|---------|-----|
| `attendance_rules` (document) | **CFG** | **HRM** `public.attendance_rules` · Nest `GET/PATCH /attendance/rules` (ADR D2) | Cài đặt→**Quy tắc chấm công** subtabs | One row per `company_id` TEXT slug; `gps_locations` deprecated for enforcement (D3) | Mobile check-in, Payroll standard days | **OK** (persist GWC M1 CFG) — ~~HARDCODED / no Nest~~ **SUPERSEDED** DOC-01 · `uat_done` false |
| `work_start_day` / `work_end_day` | CFG | HRM | Rules→**Chung** (general) | Int 1–31; start ≤ end | Payroll kỳ công | **OK** — wired Save → PATCH (M1 CFG) |
| `work_days[]` | CFG | HRM | Rules→Chung | Subset mon–sun | Standard workday calc | **OK** (persist path) — UX polish optional |
| `round_in_minutes` / `round_out_minutes` | CFG | HRM | Rules→Chung | Enum 0,5,10,15 | Record rounding | **OK** — PATCH persist |
| `standard_type` | CFG | HRM | Rules→**Công chuẩn** (standard) | `fixed` \| `monthly` | Payroll | **OK** — PATCH persist |
| `standard_days_per_month` | CFG | HRM | Rules→Công chuẩn | 1–31 | Payroll | **OK** — PATCH persist (defaults = server lazy create, not seed) |
| `hours_per_day` | CFG | HRM | Rules→Công chuẩn | >0 | Payroll OT base | **OK** — PATCH persist |
| `allow_multiple_checkin` | CFG | HRM | Rules→Chung | Boolean | Records | **OK** — PATCH persist |
| **`auto_checkout`** | **CFG** | HRM | Rules→Chung checkbox «Tự động checkout» | Boolean; duration policy (SPEC_GAP: hours) | Mobile, records `check_out_at` | **OK** flag persist · job duration **GĐ2** (ADR D2) |
| `notify_late` | CFG | HRM | Rules→Chung | Boolean | WF / notify | **OK** — PATCH + F5 verified GWC |
| `gps_enabled` / `wifi_enabled` / `qr_enabled` / `faceid_enabled` | CFG | HRM | Rules→**Thiết bị** / **Ứng dụng** | Boolean toggles; Face ID forced false GĐ1 | Mobile, clock-in methods | **PARTIAL** — App GPS persist GWC; Face ID OUT GĐ1 banner |
| Rules→**Tùy chỉnh** (customize) | CFG | HRM | Rules→Tùy chỉnh | Column visibility/order | Sheet grid | **STUB_UI** — table only |
| Rules→**tablet** / **proxy** / **auto** | CFG | HRM | Rules subtabs | SPEC_GAP enterprise | Device sync | **MISSING_CFG_UI** — «featureInDev» |
| Device tab login code | CFG (integration secret) | HRM/XBOS | Rules→**Máy chấm công** | Rotating token | Device TXN ingest | **HARDCODED** mock string in FE |

### 2.3 Cột bảng công (sheet columns)

| entity/field | class | SoT system | configure_path | validation rules | used_by | gap |
|--------------|-------|------------|----------------|------------------|---------|-----|
| Sheet column definitions (holidayWork, paidOT, annualLeave, …) | **REF+CFG** (column catalog) | **HRM** (target config table; impl: i18n list) | Rules→Tùy chỉnh · `getAttendanceColumnsData(t)` | Stable `column_key`; label vi-VN; `hasAdvanced` per column | Payroll import, sheet export | **CLOSED ACCEPTED_AS_IS_P1** (`PO-MFD-M2-ATT-CFG-COLUMNS-01`) — Phase-1 accepts static 10-row i18n REF-shaped list; Add/Grip non-functional must not claim LIVE mutate; persist/REF-pull = GĐ2 candidate |
| `attendance_sheets.standard_type` | CFG (per sheet) | HRM | Bảng công→Tạo bảng | `standard` \| … per DTO | Sheet grid standard | **OK** via `CreateAttendanceSheetDto` |
| `attendance_sheets.attendance_type` | CFG | HRM | Tạo bảng | `daily` \| `hourly` | Aggregation | **OK** |

### 2.4 Geofence / GPS

| entity/field | class | SoT system | configure_path | validation rules | used_by | gap |
|--------------|-------|------------|----------------|------------------|---------|-----|
| `gps_locations[]` (name, address, lat, lon, **radius**) | **CFG** | **HRM** (FE model) | Rules→**Ứng dụng**→Vị trí GPS; hook `addGPSLocation` | lat/lon numeric; radius >0 (m); name required | Mobile GPS check-in | **MISSING_CFG_UI** — Add/Edit buttons unwired; empty state only |
| `attendance_work_sites` (BE) | **CFG** | **HRM** | **No FE admin** · DDL in `attendance.service` | `radius_meters` default 200; `active`; company scope | `POST /attendance/records` + lat/lon → `HRM-ATT-GEO-001` | **MISSING_CFG_UI** + **HARDCODED** pilot insert HQ; **scope mismatch** UUID vs slug |
| Record `latitude` / `longitude` | TXN (capture) | HRM | Clock-in GPS / Mobile | Optional on DTO; if present → geofence assert | Mobile | **OK** DTO; CFG sites not editable |

### 2.5 Hệ số tăng ca (overtime coefficients)

| entity/field | class | SoT system | configure_path | validation rules | used_by | gap |
|--------------|-------|------------|----------------|------------------|---------|-----|
| OT type catalog (weekday/weekend/holiday…) | **REF** | XBOS/HRM (SPEC_GAP code list) | Cài đặt→**Tăng ca** (sidebar) — stub | Code stable; label vi-VN | OT requests | **MISSING_CFG_UI** entire sidebar panel |
| `CreateOvertimeRequestDto.overtime_type` | REF (code on TXN) | HRM | Đơn từ→Tăng ca | String required | Payroll OT amount | **OK** API; picker source SPEC_GAP |
| `CreateOvertimeRequestDto.coefficient` | CFG (override on TXN) | HRM | OT form | ≥0; default from CFG | Payroll | **OK** optional field |
| `overtime_requests.*` | TXN | HRM | API `/attendance/overtime-requests` | Approve/reject SM | Payroll, KPI | **OK** |

### 2.6 Quy tắc nghỉ phép (leave rules)

| entity/field | class | SoT system | configure_path | validation rules | used_by | gap |
|--------------|-------|------------|----------------|------------------|---------|-----|
| `leave_types` catalog rows | **REF** | **XBOS → HRM** (`catalog-sync` key `leave_types`) | XBOS DM publish → HRM **Settings→Danh mục→Đồng bộ** · not Attendance sidebar | Code unique; metadata e.g. `requires_l2`, paid/unpaid | Leave TXN, balance, Mobile | **OK** sync path; Attendance **Cài đặt→Quy tắc nghỉ** = stub |
| `leave_l1_max_days` / ladder | **CFG** | HRM (`hrm_company_settings` — Option A docs) | Settings company (not Attendance stub) | Fail-closed `HRM-LEAVE-CFG-LADDER` | Leave approve WF | **MISSING_CFG_UI** in Attendance shell |
| `employee_leave_balances` | TXN-like balance | HRM | Derived + GET `leave-balance` | year, leave_type, ≥0 | Leave create | **OK** API |
| `leave_requests` | TXN | HRM | Tab Nghỉ / Đơn từ→Nghỉ phép | Overlap, balance, attachment rules | Payroll, WF | **OK** |

### 2.7 Đi muộn / về sớm (late–early)

| entity/field | class | SoT system | configure_path | validation rules | used_by | gap |
|--------------|-------|------------|----------------|------------------|---------|-----|
| Late/early **policy** (grace minutes, deduct) | **CFG** | HRM | Cài đặt→**Đi muộn về sớm** | SPEC_GAP numeric rules | Payroll deduct | **MISSING_CFG_UI** stub sidebar |
| `late_early_requests` | TXN | HRM | Đơn từ→Đi muộn về sớm | Date, reason, approve SM | Payroll, attendance status | **OK** API |

### 2.8 Quy tắc đơn từ (request rules)

| entity/field | class | SoT system | configure_path | validation rules | used_by | gap |
|--------------|-------|------------|----------------|------------------|---------|-----|
| Request type enable / min notice / max days | **CFG** | HRM | Cài đặt→**Quy tắc đơn từ** | Per request family | All request TXNs | **MISSING_CFG_UI** stub |
| WF template per request | CFG | XBOS WF + HRM bridge | WF designer (ngoài Attendance) | process_code | Leave/OT/update | **OK** bridge; not in Attendance settings |

### 2.9 Giao dịch chấm công core

| entity/field | class | SoT system | configure_path | validation rules | used_by | gap |
|--------------|-------|------------|----------------|------------------|---------|-----|
| `attendance_sheets` | TXN (period header) | HRM | Chấm công→**Bảng công** | `start_date`≤`end_date`; `@IsDateString`; no auto roster rows | Payroll period lock | **OK** |
| `attendance_records` | TXN | HRM | Clock-in / **Bản ghi** | status ∈ pending,present,absent,leave; employee scope | Payroll, Leave | **OK** |
| `attendance_update_requests` | TXN | HRM | Đơn từ→Cập nhật công | approve → patch record | Payroll | **OK** |
| `business_trip_requests` / `shift_change_requests` | TXN | HRM | Đơn từ menus | SM approve | Payroll, shifts | **OK** API |

### 2.10 Báo cáo & overview

| entity/field | class | SoT system | configure_path | validation rules | used_by | gap |
|--------------|-------|------------|----------------|------------------|---------|-----|
| Overview KPI / charts | **RPT** | HRM | Tab **Tổng quan** · `GET /attendance/overview` | Query scoped company | Management | **OK** read API |
| Tab **Báo cáo** | RPT | HRM | `AttendanceReportsTab` | Export filters SPEC_GAP | Payroll audit | **PARTIAL** — lazy tab |
| Weekly / summary submenus | RPT | HRM | Chấm công→Tuần / Tổng hợp | Derived from records+sheets | Payroll | **PARTIAL** — depends on sheet context |

### 2.11 REF khác (pickers trong Attendance)

| entity/field | class | SoT system | configure_path | validation rules | used_by | gap |
|--------------|-------|------------|----------------|------------------|---------|-----|
| `departments` | REF | XBOS→HRM | Settings catalog | Active codes | Filters, sheet scope | **OK** pull |
| `employees` | REF | HRM | Nhân sự module | scope list | All TXN | **OK** |
| `job_titles` / positions on sheet | REF | XBOS→HRM | Settings | Optional on sheet DTO | Sheet filter | **PARTIAL** free-text `positions` on sheet |

### 2.12 Cài đặt sidebar (employees / users / roles / system)

| entity/field | class | SoT system | configure_path | validation rules | used_by | gap |
|--------------|-------|------------|----------------|------------------|---------|-----|
| Settings→**Nhân viên** (attendance scope) | CFG | HRM | Cài đặt sidebar | Employee allow-list for attendance | Device, app | **PARTIAL** — employee list UI; rules link SPEC_GAP |
| Settings→**Người dùng** / **Vai trò** / **Hệ thống** | CFG | HRM / IAM | Stub panels | RBAC | All | **MISSING_CFG_UI** |

---

## 3. Data interaction (CRUD / transition)

| Entity | Create | Read | Update | Delete | Invalid transition |
|--------|--------|------|--------|--------|-------------------|
| work_shifts | POST | GET list | PATCH | DELETE | Delete if referenced → SPEC_GAP |
| attendance_rules | UPSERT lazy on GET | GET `/attendance/rules` | PATCH `/attendance/rules` | — | Scope slug mismatch → 409 |
| attendance_work_sites | POST `/attendance/work-sites` | GET list | PATCH | DELETE | Check-in outside → `HRM-ATT-GEO-001` 400 |
| attendance_sheets | POST | GET | PATCH | DELETE | — |
| attendance_records | POST | GET/list/get-by-id | PATCH status | — | Illegal status → service reject |
| leave_requests | POST | GET | approve/reject | — | Overlap / balance → service codes |
| OT / late / trip / shift-change | POST | GET | approve/reject | DELETE (OT…) | Pending-only delete |

---

## 4. Deterministic errors (FE/QA contract)

| Code | When | HTTP |
|------|------|------|
| `HRM-ATT-GEO-001` | lat/lon outside all active work sites | 400 |
| `HRM-ATT-201` / `HRM-ATT-200` | Record create/list OK | 2xx |
| `HRM-WS-404` / `HRM-WS-409` | Shift scope parity | 404/409 |
| `HRM-AS-201` | Sheet created | 201 |
| `HRM-LEAVE-201` | Leave created | 201 |
| `ATTENDANCE_LOCATION_OUT_OF_RANGE` | API_CONTRACT_VN legacy alias | 422 (align to `HRM-ATT-GEO-001`) |
| `HRM-LEAVE-CFG-LADDER` | Ladder CFG missing (leave approve) | 409/422 (settings) |

---

## 5. Traceability (requirement → API → DB → FE)

| Business capability | SRS / UC | API | DB | FE surface |
|--------------------|----------|-----|-----|------------|
| Ghi nhận công | HRM-AT-01 · FR-HRM-AT-01 | POST `/attendance/records` | `attendance_records` | Clock-in wizard |
| Bảng kỳ + CFG rules/columns | FR-HRM-AT-14 · `by-uc/HRM-AT-14.md` (MFD 2026-08-04) | `/attendance-sheets` · `/attendance/rules` · columns **NO_API** | `attendance_sheets` · `attendance_rules` | Bảng công · Cài đặt→Quy tắc |
| Ca làm | HRM-AT-03 (partial) | `/work-shifts` | `work_shifts` | Ca→Danh sách |
| Nghỉ phép | HRM-AT-10 | `/leave-requests` | `leave_requests` | Nghỉ / Đơn từ |
| Loại nghỉ | HRM-AT-12 | catalog-sync | `synced_catalogs` | Leave picker (Settings sync) |
| Geofence | MOBILE backlog · ADR D3 | records+lat/lon · `/work-sites` admin | `attendance_work_sites` | Rules→App (GPS CRUD GWC; GEO-001 residual) |
| Quy tắc công | ADR D2 · HRM-AT-14 | `GET/PATCH /attendance/rules` | `attendance_rules` | Cài đặt→Quy tắc→Chung (~~NO_API / cfgNotPersisted~~ **SUPERSEDED** DOC-01) |

---

## 6. P0 gaps (ordered for SA / Dev)

**SA ADR (CFG persist):** [`ADR-HRM-ATTENDANCE-CFG-PERSIST-20260804.md`](../../../architecture/ADR-HRM-ATTENDANCE-CFG-PERSIST-20260804.md) · evidence `docs/qa/evidence/po-mfd-m1-att-p0-cfg-sa-01.md`

| # | gap | class | owner lane | Rationale |
|---|-----|-------|------------|-----------|
| P0-1 | `attendance_rules` + geofence UI persist vs `attendance_work_sites` | CFG | — | **CLOSED GWC** M1 CFG (`po-mfd-m1-att-p0-cfg-qc-01.md`) · ADR D2/D3 — ~~HARDCODED~~ **SUPERSEDED** DOC-01 |
| P0-2 | General/Standard rules Save không wire `saveRules` / API | CFG | — | **CLOSED GWC** — Chung PATCH 200; ~~`cfgNotPersisted`~~ retired DOC-01 |
| P0-3 | Sheet columns `getAttendanceColumnsData` | REF/CFG | — | **CLOSED ACCEPTED_AS_IS_P1** (`po-mfd-m2-att-cfg-columns-01-spec.md`) — static i18n OK Phase-1; no Dev; mutate/REF API = GĐ2 candidate |
| P0-4 | `work_shifts` vs XBOS catalog `shifts` dual SoT | REF | sa + dev-be | **ADR D1** — ops `work_shifts` / catalog REF GĐ1 |
| P0-5 | Settings sidebar OT / leave-rules / late-early / request-rules stubs | CFG | dev-fe | **ADR D4** — pointer Settings; not fake CFG (honest stubs GWC) |
| P0-6 | `attendance_work_sites.company_id` UUID vs slug scope | CFG | — | **CLOSED** BE M1 CFG (TEXT slug) · GEO-001 browser residual |

---

## 7. Không phải optional (message cho FE/BE/QA)

- **CFG stub ≠ out of scope:** Màn Cài đặt Chấm công là **nguồn công chuẩn** cho Payroll — QA FAIL nếu chỉ HTTP 200 tab load (U87 §2).
- **REF phải catalog:** `leave_types`, `departments`, (future) `shifts` — không accept dropdown hardcode.
- **TXN OK không cứu CFG sai:** Records 2xx while rules **not** persisted after Lưu → **business FAIL** (AS-IS persist path = Nest PATCH; do not reintroduce `cfgNotPersisted` fake).
- **U65:** Cấu hình phải qua UI/API; không seed work_sites / rules để pass.

---

*PO-MFD-M1-ATT-CFG-REF-01 · ba-data · U87*
