# HRM Attendance — Menu Fidelity Matrix (U87 · M1)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-MFD-M1-ATT-INV-ALL` |
| **Program** | `PO-MENU-FIDELITY-01` · U87 |
| **User path** | Command Center → HRM embed → **Chấm công** (`Attendance.tsx`) |
| **Code anchor** | `apps/web/hrm/src/pages/Attendance.tsx` |
| **Generated** | 2026-08-04 |
| **uat_done** | `false` |
| **DOC-DELTA** | `PO-MFD-M2-ATT-CFG-DOC-01` — Rules→Chung persist = Nest PATCH 200 (ADR + M1 CFG GWC); ~~FE `cfgNotPersisted` / rules not persisted~~ **SUPERSEDED**. Not full Attendance UAT. |
| **Runtime legend** | `LIVE` \| `PARTIAL` \| `STUB_UI` \| `BROKEN` — browser U65 (`PO-MFD-M1-ATT-QA-RUNTIME`) + code read where not probed |

## UC pack map (HRM-AT-* titles)

| File | Title |
|------|--------|
| HRM-AT-01 | Ghi nhận bản ghi chấm công |
| HRM-AT-02 | Xem danh sách bản ghi chấm công |
| HRM-AT-03 | Cập nhật trạng thái bản ghi chấm công |
| HRM-AT-04 | Tạo đơn chỉnh sửa chấm công |
| HRM-AT-05 | Xem danh sách đơn chỉnh sửa chấm công |
| HRM-AT-06 | Sửa đơn chỉnh sửa chấm công |
| HRM-AT-07 | Phê duyệt đơn chỉnh sửa chấm công |
| HRM-AT-08 | Từ chối đơn chỉnh sửa chấm công |
| HRM-AT-09 | Xóa đơn chỉnh sửa chấm công |
| HRM-AT-10 | Tạo đơn nghỉ phép |
| HRM-AT-11 | Xem danh sách đơn nghỉ phép |
| HRM-AT-12 | Phê duyệt đơn nghỉ phép |
| HRM-AT-13 | Từ chối đơn nghỉ phép |

---

## Matrix (≥40 surfaces)

| # | Cluster | menu_path | ui_surface | functions[] | business_meaning | links | srs_ref | techspec_ref | api_contract | data_class | config_how | runtime | uc_tc_map | owner_next | priority |
|---|---------|-----------|------------|-------------|------------------|-------|---------|--------------|--------------|------------|------------|---------|-----------|------------|----------|
| 1 | C1 | CC→HRM→Chấm công→Tổng quan | `activeTab=overview` | Lọc thời gian; xem KPI; drill chart | Dashboard vận hành: tỷ lệ đi làm, muộn sớm, nghỉ theo tháng/đơn vị — input cho điều hành và payroll preview | Leave balance · Payroll KPI · Employee master | `docs/hrm/SRS.md` chấm công overview · `SRS_VN.md` (GPS/geofence mong muốn GĐ1) | `docs/hrm/TECHSPEC.md` (attendance overview) · `TECH_SPEC_VN.md` SPEC_GAP depth | `GET /attendance/overview` | RPT | Company scope JWT; không catalog | LIVE | UNMAPPED | qa | P1 |
| 2 | C1 | CC→HRM→Chấm công→Tổng quan→Biểu đồ nghỉ tháng | overview / monthlyLeaveData | Hover/tooltip chart | Theo dõi xu hướng nghỉ theo tháng để HRBP cân staffing | Leave TXN · Reports | SPEC_GAP (`SRS_VN` không FR riêng chart) | SPEC_GAP | `GET /attendance/overview` (aggregated) | RPT | — | LIVE | UNMAPPED | ba | P2 |
| 3 | C1 | CC→HRM→Chấm công→Tổng quan→Nghỉ theo phòng ban | overview / departmentLeaveData | Chart segment | So sánh phòng ban — phân bổ nguồn lực | Org foundation departments | SPEC_GAP | SPEC_GAP | overview aggregate | RPT | Dept từ HRM org | LIVE | UNMAPPED | qa | P2 |
| 4 | C1 | CC→HRM→Chấm công→Tổng quan→Danh sách muộn/sớm | overview / lateEarlyList | Xem dòng; (link NV nếu có) | Canh báo kỷ luật / OT eligibility | Payroll deductions · KPI | SPEC_GAP | SPEC_GAP | overview aggregate | RPT | Rules CFG muộn/sớm (settings) | LIVE | UNMAPPED | qa | P1 |
| 5 | C1 | CC→HRM→Chấm công→Tổng quan→Đơn nghỉ gần đây | `LeaveOverviewRecentPanel` | Click row → chi tiết (J-*) | Bridge overview → leave workflow | Leave tab · WF inbox · Mobile ESS | HRM-AT-11 (list slice) | `docs/hrm/TECHSPEC.md` leave | `GET /attendance/leave-requests` | TXN | leave_types REF (XBOS catalog) | LIVE | HRM-AT-11 (partial) | qa | P1 |
| 6 | C2 | CC→HRM→Chấm công→Chấm công→Vào/ra (Clock-In hub) | `activeAttendanceType=clock-in` · `ClockInMethodSelector` | Chọn phương thức; xem bản ghi hôm nay | Điểm vào ESS chấm công — nguồn TXN cho công chuẩn | Mobile parity · Payroll | HRM-AT-01 · `SRS_VN.md` GPS 200m | `docs/hrm/TECHSPEC.md` records | `POST /attendance/records` (check-in path) · `API_CONTRACT_VN` check-in/out | TXN | Geofence CFG (rules/device) | LIVE (`PO-MFD-M2-ATT-CLOCK-01`) | HRM-AT-01 | qa | P0 |
| 7 | C2 | CC→HRM→Chấm công→Clock-In→Thủ công | clock-in · `manual` | Nhập/submit chấm tay | Fallback khi không GPS/thiết bị | AT-04 update-requests | HRM-AT-01 | TECHSPEC attendance-records | POST records | TXN | — | LIVE (`PO-MFD-M2-ATT-CLOCK-01` · POST 201+F5) | HRM-AT-01 | qa | P0 |
| 8 | C2 | CC→HRM→Chấm công→Clock-In→QR | clock-in · `qr` | Quét QR | Chấm công tại cổng/kho — logistics | Mobile · Device CFG | HRM-AT-01 · mindmap FaceID/GPS GĐ2 signal | SPEC_GAP QR depth | POST records / SPEC_GAP | TXN | Device rules | PARTIAL (shell · CLOCK-01) | UNMAPPED | ba | P1 |
| 9 | C2 | CC→HRM→Chấm công→Clock-In→Khuôn mặt | clock-in · `face` | Face capture/register | Chống gian lận chấm hộ | Mindmap «FaceID» GĐ2 | SPEC_GAP | SPEC_GAP | MOCK_ONLY / partial FaceRegistration | TXN | Device/app rules | GĐ2-HOLD (`PO-MFD-M2-ATT-CLOCK-01`) | UNMAPPED | pm | GĐ2-HOLD |
| 10 | C2 | CC→HRM→Chấm công→Clock-In→GPS | clock-in · `gps` | Lấy vị trí; check-in | Geofence enterprise (`SRS_VN` 200m) | Payroll location · Mobile driver | `SRS_VN.md` § executive summary | SPEC_GAP | POST check-in · `ATTENDANCE_LOCATION_OUT_OF_RANGE 422` | TXN | CFG geofence settings/rules | LIVE (`PO-MFD-M2-ATT-CLOCK-01-R2` · POST lat/lon; GEO-001 CFG-gated 0 sites) | HRM-AT-01 | qa | P0 |
| 11 | C2 | CC→HRM→Chấm công→▼→Bảng chấm công | `activeAttendanceType=sheets` · `attendanceViewMode=list` | Thêm; tìm; lọc đơn vị; mở sheet | Kỳ chốt công theo phòng/ca — SoT period cho payroll run | Payroll run · Shifts REF | SPEC_GAP (sheets FR sparse in SRS_VN) | `docs/hrm/TECHSPEC.md` | `GET/POST/DELETE /attendance/attendance-sheets` | TXN | attendance_type hourly/daily CFG | LIVE | **HRM-AT-14** | qa | P0 |
| 12 | C2 | CC→HRM→Chấm công→▼→Bảng chấm công→Thêm bảng | Add sheet modal | Lưu; hủy | Tạo kỳ chấm mới | Sheets list | SPEC_GAP | TECHSPEC | POST attendance-sheets | TXN | Department REF | LIVE | **HRM-AT-14** | qa | P0 |
| 13 | C2 | CC→HRM→Chấm công→▼→Bản ghi chấm công | `activeAttendanceType=records` | Lọc; sửa dòng (modal) | Sổ chi tiết TXN ngày/giờ | AT-04..09 · Payroll | HRM-AT-02 · HRM-AT-03 | TECHSPEC records | `GET/PATCH /attendance/records` | TXN | — | **LIVE** list+edit (`PO-MFD-M2-ATT-RECORDS-EDIT-01-R3-QA` · GET 200 HRM-ATT-200 · dialog date `04/08/2026` · PATCH 200 HRM-ATT-202 `x-company-id=trsport` · F5 «Chờ duyệt» · pageErrors=[]) | HRM-AT-02, HRM-AT-03 | qa | P0 |
| 14 | C2 | CC→HRM→Chấm công→▼→Chấm công tuần | `weekly` · `attendanceViewMode=weekly` | Chuyển tuần; tải lại; ô ca | Lưới tuần — planner HR xem coverage ca | Shifts REF · Schedule (GAP) | SPEC_GAP | SPEC_GAP | weekly fetch hook (records aggregate) | RPT | Shift codes REF | **LIVE** (`PO-MFD-M2-ATT-WEEKLY-01` · GET records 200 `HRM-ATT-200` week `2026-08-03..09` · sheet→weekly LIVE empty `2026-06-30..07-06` · storm0 · no ERROR) | UNMAPPED | qa | P1 |
| 15 | C2 | CC→HRM→Chấm công→▼→Tổng hợp | `activeAttendanceType=summary` · viewMode=data | Xem bảng; chuyển tuần | Tổng hợp công trước chốt — input payroll | Payroll · Reports | SPEC_GAP | SPEC_GAP | GET records (same as summary UI) | RPT | Column defs CFG (rules/standard) | **LIVE** wire (`PO-MFD-M2-ATT-WEEKLY-01` · summary→records GET 200 `HRM-ATT-200` storm0) · OBS product same-as-records (no dedicated summary API) | UNMAPPED | ba | P1 |
| 16 | C3 | CC→HRM→Chấm công→Ca→Danh sách ca | `activeTab=shifts` · `activeShiftType=list` | Thêm; sửa; xóa; chọn hàng; xóa hàng loạt; sao chép (icon) | Danh mục ca REF cho roster và hệ số OT | OT requests · Payroll coefficient | SPEC_GAP shift master FR | `docs/hrm/TECHSPEC.md` · CODE `useWorkShifts` | `GET/POST/PATCH/DELETE /attendance/work-shifts` | REF | Department · coefficient CFG | LIVE | UNMAPPED | qa | P0 |
| 17 | C3 | CC→HRM→Chấm công→Ca→Phân ca (lịch) | `activeShiftType=schedule` | *(menu đổi state only)* | Xếp lịch ca theo NV — mindmap «Phân ca & lịch» | Employee · Shifts | Mindmap IN_GĐ1 partial | SPEC_GAP | NO_API (UI không branch) | CFG | Roster rules | **STUB_UI** (`PO-MFD-M2-ATT-QA-RUNTIME-01` · SHIFTS-02 honesty `featureInDev`+GĐ2) | UNMAPPED | ba-process | P0 menu honesty · roster GĐ2 |
| 18 | C3 | CC→HRM→Chấm công→Ca→Tăng ca (ca OT) | `activeShiftType=overtime` | *(menu đổi state only)* | Ca OT riêng — tách hệ số OT | OT requests · Payroll | SPEC_GAP | SPEC_GAP | NO_API (same list render) | REF | OT coefficient CFG | **STUB_UI** (`PO-MFD-M2-ATT-QA-RUNTIME-01` · SHIFTS-02 honesty) | UNMAPPED | ba-process | P1 · roster GĐ2 |
| 19 | C4 | CC→HRM→Chấm công→Đơn từ→Nghỉ phép | `requests` · `leave` → `LeaveTab` | Tạo; xem; sửa; duyệt/từ chối | Quản lý nghỉ — trừ quỹ, WF | Leave balance · WF · Payroll | HRM-AT-10..13 | TECHSPEC leave | `GET/POST /attendance/leave-requests` · approve/reject | TXN | leave_types REF (XBOS) | LIVE (WF 2026-08-04 `LEAVE-WF-01` 201→203+F5 QL) | HRM-AT-10,11,12,13 | qa | P0 |
| 20 | C4 | CC→HRM→Chấm công→Đơn từ→Đi muộn/Về sớm | `LateEarlyRequestTab` | Tạo; duyệt; danh sách | Giải trình kỷ luật — ảnh hưởng công chuẩn | Overview late list · Payroll | SPEC_GAP | SPEC_GAP | late-early endpoints (attendance controller) | TXN | Late rules CFG | **LIVE** (`REQUESTS-01-R2` idle0 + CTA + create 201 HRM-LE-REQ-201 + F5) | UNMAPPED | qa | P0 |
| 21 | C4 | CC→HRM→Chấm công→Đơn từ→Tăng ca | `OvertimeRequestTab` | Tạo; duyệt; xóa | OT chi phí — payroll OT | Payroll · Shifts | SPEC_GAP | SPEC_GAP | `GET/POST /attendance/overtime-requests` | TXN | OT rules CFG | **LIVE** (`REQUESTS-01` spot + OT GWC CLOSED) | UNMAPPED | qa | P0 |
| 22 | C4 | CC→HRM→Chấm công→Đơn từ→Công tác | `BusinessTripRequestTab` | Tạo; duyệt | Công tác tính công/ngày đi | Payroll cột business trip | SPEC_GAP | SPEC_GAP | business-trip-requests API | TXN | Trip types CFG | **LIVE** (`REQUESTS-01-R2` idle0 + CTA · no storm) | UNMAPPED | qa | P0 |
| 23 | C4 | CC→HRM→Chấm công→Đơn từ→Cập nhật chấm công | `AttendanceUpdateRequestTab` | Tạo; sửa; duyệt; từ chối; xóa | Điều chỉnh TXN sau sự cố | HRM-AT-04..09 | HRM-AT-04..09 | TECHSPEC update-requests | `update-requests` CRUD + approve/reject | TXN | — | **LIVE** (`REQUESTS-01` list+CTA) | HRM-AT-04,05,06,07,08,09 | qa | P0 |
| 24 | C4 | CC→HRM→Chấm công→Đơn từ→Đổi ca | `ShiftChangeRequestTab` | Tạo; duyệt | Đổi ca đã xếp — roster integrity | Schedule GAP · Shifts REF | SPEC_GAP | SPEC_GAP | shift-change-requests API | TXN | Shifts REF | **LIVE** (`REQUESTS-01-R2` idle0 + CTA · no storm) | UNMAPPED | qa | P0 |
| 25 | C4 | CC→HRM→Chấm công→Đơn từ→Tổng hợp nghỉ | `leave-summary` → `LeaveTab` | Tab/filter tổng hợp | HR xem quỹ đã dùng theo kỳ | Leave balance · Payroll | SPEC_GAP | SPEC_GAP | leave-requests aggregate | RPT | leave_types REF | LIVE | UNMAPPED | ba | P2 |
| 26 | C4 | CC→HRM→Chấm công→Đơn từ→Tổng hợp nghỉ bù | `compensatory-summary` → `LeaveTab` | View summary | OT/nghỉ bù — payroll linkage | OT · Leave | SPEC_GAP | SPEC_GAP | SPEC_GAP | RPT | Compensatory rules CFG | LIVE | UNMAPPED | ba | P2 |
| 27 | C4 | CC→HRM→Chấm công→Đơn từ→Kế hoạch nghỉ | `leave-plan` → `LeaveTab` | Plan view | Lập kế hoạch nghỉ tập thể | Staffing · Leave | Mindmap GĐ2 signal | SPEC_GAP | SPEC_GAP | RPT | — | LIVE | UNMAPPED | ba | GĐ2-HOLD |
| 28 | C5 | CC→HRM→Chấm công→Nghỉ phép (tab) | `activeTab=leave` · `LeaveTab` | Same as requests/leave | Tab top-level trùng module nghỉ — persona HR/QL | WF · Mobile ESS | HRM-AT-10..13 | TECHSPEC leave | leave-requests API | TXN | leave_types REF | LIVE (WF confirm `LEAVE-WF-01`) | HRM-AT-10..13 | qa | P0 |
| 29 | C6 | CC→HRM→Chấm công→Báo cáo | `AttendanceReportsTab` | Chọn tháng/năm; charts; bảng NV/PB; xuất | Báo cáo quản trị trước chốt lương | Payroll · Command Center KPI | `docs/hrm/SRS.md` reports · UF-HRM-05 | `useAttendanceReports` CODE · TECHSPEC | `GET records` + employees + leave-requests fan-in | RPT | — | **LIVE** (`REPORTS-01` U65 ceo@ filter 8→7 idle0 · honesty) | UNMAPPED (≠ UC-HRM-27 alone) | qa | P1 |
| 30 | C6 | CC→HRM→Chấm công→Báo cáo→Xuất | `AttendanceExportDialog` | Export Excel/PDF | Deliveable HRIS / kiểm toán | Payroll external | SPEC_GAP | TECHSPEC | export client-side / SPEC_GAP | RPT | — | PARTIAL | UNMAPPED | qa | P2 |
| 31 | C7 | CC→HRM→Chấm công→Cài đặt→Nhân viên chấm công | `settings` · `activeSidebarItem=employees` | Tìm; lọc trạng thái/PB; refresh; import; export icon | Gán mã chấm công / mapping NV ↔ attendance | Employee master | SPEC_GAP | SPEC_GAP | `useEmployees` list + refetch + EmployeeImportDialog | REF | Employee status REF | **LIVE** (`SETTINGS-EMP-01-R2` U65: list GET 200 HRM-EMP-200 · idle0 · Refresh GET 200 · Import dialog) · OBS mapping mã CC/leave | UNMAPPED (mapping OBS) | qa | P1 |
| 32 | C7 | CC→HRM→Chấm công→Cài đặt→Quy tắc→Chung | `rules` · `activeRulesTab=general` | Lưu quy tắc (`saveRules` → PATCH) | Policy holding: ngày công chuẩn, chốt kỳ | Payroll · All TXN | FR-HRM-AT-14 · ADR D2 | TECHSPEC rules | `GET/PATCH /attendance/rules` | CFG | Company + holding policy | LIVE (persist GWC) | **HRM-AT-14** | qa | P0 **GWC** |
| 33 | C7 | CC→HRM→Chấm công→Cài đặt→Quy tắc→Công chuẩn | `activeRulesTab=standard` | Chỉnh công chuẩn; rounding (columns = separate) | Định nghĩa công chuẩn tháng/giờ; cột payroll mock | Payroll | FR-HRM-AT-14 | TECHSPEC | rules PATCH + column metadata | CFG | rules OK · columns `getAttendanceColumnsData` static | PARTIAL | **HRM-AT-14** | dev-fe | P0 rules **GWC** · columns **ACCEPTED_AS_IS_P1** (`CFG-COLUMNS-01`) |
| 34 | C7 | CC→HRM→Chấm công→Cài đặt→Quy tắc→Tùy chỉnh | `activeRulesTab=customize` | Toggle/custom fields | Mở rộng công ty con | Payroll | SPEC_GAP | SPEC_GAP | rules API | CFG | Company override | LIVE | UNMAPPED | ba | P2 · static REF-shaped **ACCEPTED_AS_IS_P1** · mutate GĐ2 (`CFG-COLUMNS-01`) |
| 35 | C7 | CC→HRM→Chấm công→Cài đặt→Quy tắc→Thiết bị | `activeRulesTab=device` | Device attendance rules form | Máy chấm công / tablet sync | Hardware · TXN ingest | SPEC_GAP | SPEC_GAP | rules API | CFG | Device registry | LIVE | UNMAPPED | sa | P1 |
| 36 | C7 | CC→HRM→Chấm công→Cài đặt→Quy tắc→Ứng dụng | `activeRulesTab=app` | Mobile app policy fields | ESS mobile check-in policy | Mobile · GPS | `SRS_VN.md` geofence | SPEC_GAP | rules API | CFG | App policy | LIVE | UNMAPPED | qa | P1 |
| 37 | C7 | CC→HRM→Chấm công→Cài đặt→Quy tắc→Máy tính bảng | `activeRulesTab=tablet` | — | Chấm công kiosk/tablet | Device | Mindmap | SPEC_GAP | NO_API | CFG | — | STUB_UI (`featureInDev`) | UNMAPPED | dev-fe | P2 |
| 38 | C7 | CC→HRM→Chấm công→Cài đặt→Quy tắc→Ủy quyền chấm | `activeRulesTab=proxy` | — | Chấm hộ có kiểm soát | WF audit | SPEC_GAP | SPEC_GAP | NO_API | CFG | — | STUB_UI | UNMAPPED | ba | GĐ2-HOLD |
| 39 | C7 | CC→HRM→Chấm công→Cài đặt→Quy tắc→Tự động | `activeRulesTab=auto` | — | Auto checkout 10h (`SRS_VN`) | Payroll hours | `SRS_VN.md` auto checkout | SPEC_GAP | NO_API | CFG | Holding timer | STUB_UI | UNMAPPED | dev-be | P1 |
| 40 | C7 | CC→HRM→Chấm công→Cài đặt→Quy tắc tăng ca | `activeSidebarItem=overtime` | — | Hệ số/ ngưỡng OT | OT TXN · Payroll | SPEC_GAP | SPEC_GAP | NO_API | CFG | OT policy | STUB_UI | UNMAPPED | ba-data | P0 |
| 41 | C7 | CC→HRM→Chấm công→Cài đặt→Quy tắc nghỉ | `leave-rules` | — | Map loại nghỉ ↔ cột công | leave_types XBOS | SPEC_GAP | SPEC_GAP | NO_API | CFG | Catalog pull | STUB_UI | UNMAPPED | ba-data | P0 |
| 42 | C7 | CC→HRM→Chấm công→Cài đặt→Đi muộn/Về sớm | `late-early` | — | Ngưỡng phút muộn/sớm | Overview · Payroll | SPEC_GAP | SPEC_GAP | NO_API | CFG | — | STUB_UI | UNMAPPED | ba | P1 |
| 43 | C7 | CC→HRM→Chấm công→Cài đặt→Quy tắc đơn từ | `request-rules` | — | SLA/approval rules đơn từ | WF | SPEC_GAP | SPEC_GAP | NO_API | CFG | WF catalog | STUB_UI | UNMAPPED | ba | P1 |
| 44 | C7 | CC→HRM→Chấm công→Cài đặt→Người dùng | `users` | — | Phân quyền chấm công module | RBAC JWT | ADR-HRM-RBAC | SPEC_GAP | NO_API | CFG | Roles | STUB_UI | UNMAPPED | sa | P1 |
| 45 | C7 | CC→HRM→Chấm công→Cài đặt→Vai trò | `roles` | — | Role attendance admin | RBAC | SPEC_GAP | SPEC_GAP | NO_API | CFG | — | STUB_UI | UNMAPPED | sa | P2 |
| 46 | C7 | CC→HRM→Chấm công→Cài đặt→Hệ thống | `system` | — | Tham số hệ thống module | Platform | SPEC_GAP | SPEC_GAP | NO_API | CFG | — | STUB_UI | UNMAPPED | devops | P2 |

---

## Summary counts

| Metric | Value |
|--------|------:|
| **Total surfaces** | 46 |
| **Mapped to HRM-AT-* (any)** | 12 rows |
| **UNMAPPED** | 34 rows |
| **STUB_UI (browser)** | 12 (#17–18 · #37–46; deep QA `PO-HRM-BP-ATT-DEEP-QA-01`) |
| **PARTIAL (browser)** | 3 (#8 QR · #30 export dialog · #33 columns ACCEPTED_AS_IS_P1) |
| **UNKNOWN (QA)** | 0 (`PO-HRM-BP-ATT-DEEP-QA-01`) |
| **LIVE (browser deep QA probes)** | 28 probes LIVE · matrix rows #1–7 · #10–16 · #19–29 · #31–32 · #34–36 LIVE; Face #9 GĐ2-HOLD |
| **BROKEN (browser)** | 0 |
| **GĐ2-HOLD (runtime)** | 1 (#9 Face) |

## Mindmap cross-check (`HRM_CUSTOMER_CAPABILITY_MINDMAP.md`)

| Lá Chấm công | Matrix coverage |
|--------------|-----------------|
| GPS/FaceID | Rows 9 GĐ2-HOLD · 10 LIVE (lat/lon; GEO-001 CFG) |
| Phân ca & lịch | Rows 16 LIVE · 17–18 STUB_UI (SHIFTS-02 honesty) |
| Giải trình & chốt công | Rows 11–15 · 23 · sheets |

---

## Synth notes (APPEND · PO-MFD-M1-ATT-SYNTH · 2026-08-04)

| Note | Detail |
|------|--------|
| M2 backlog | `HRM-ATTENDANCE_M2_BACKLOG.md` — P0 seq 1–8; UNMAPPED dedupe table |
| Runtime | **QA browser** `PO-MFD-M2-ATT-QA-RUNTIME-01` — UNKNOWN=0; log `HRM-ATTENDANCE_RUNTIME_LOG.md` · evidence `po-mfd-m2-att-qa-runtime-01.md` |
| HRM-AT-14 | Rows **11–12**, **32–33** → mapped via `HRM-AT-14.md` (CFG/sheets) |
| DISPATCHED | Scope P0-1 · Balance P0-3 — do not re-queue |
| GĐ2-HOLD | Rows **9, 27, 37, 38** — honest stub; row **17** P0 menu via SHIFTS-02 |

---

## Browser runtime overlay (2026-08-04 · PO-MFD-M2-ATT-QA-RUNTIME-01)

Persona `ceo@xe.vn` · `company_id=main` · U65 read-only · L0 PASS entry + exit. Full table: `HRM-ATTENDANCE_RUNTIME_LOG.md`. Machine: `_tmp-po-mfd-m2-att-qa-runtime-01-browser.json` (379 GET 2xx · 0 bad).

| Matrix # | runtime (browser) |
|---------:|-------------------|
| 1–5 | LIVE (overview + sub-panels · GET overview 200) |
| 6 | **LIVE** (hub · CLOCK-01 GWC kept) |
| 7 | **LIVE** (manual shell spot · POST GWC kept, not re-mutated) |
| 8 | **PARTIAL** (QR shell · ACCEPTED_AS_IS_P1) |
| 9 | **GĐ2-HOLD** (Face banner · 0 POST) |
| 10 | **LIVE** (GPS method spot · CLOCK-01-R2 GWC kept · no POST this seat) |
| 11–16 | LIVE · sheets/records/weekly/summary/shifts GETs 200 |
| 17–18 | **STUB_UI** (SHIFTS-02 honesty `featureInDev`+GĐ2 · NO_API roster) |
| 19 | LIVE (LEAVE-WF-01 GWC kept) |
| 20 | **LIVE** (late-early GET 200 · REQUESTS-01-R2 GWC) |
| 21 | **LIVE** (OT GET · OT GWC CLOSED) |
| 22 | **LIVE** (trip GET 200) |
| 23 | **LIVE** (update-attendance GET) |
| 24 | **LIVE** (shift-change GET 200) |
| 25–28 | LIVE |
| 29 | LIVE · #30 **PARTIAL** (export not clicked · P2) |
| 31 | **LIVE** (employees GET · SETTINGS-EMP-01-R2 GWC) |
| 32–34 | LIVE (rules/customize · columns #33 PARTIAL ACCEPTED_AS_IS_P1) |
| 35 | **LIVE** (device testid · DEVICE ACCEPTED_AS_IS_P1) |
| 36 | **LIVE** (app testid · ScanFace CLOSED) |
| 37–39 | STUB_UI (i18n tablet/proxy/auto · AUTO ACCEPTED_AS_IS_P1) |
| 40–46 | STUB_UI |

---

## Browser runtime overlay (2026-08-04 · PO-HRM-BP-ATT-DEEP-QA-01)

Persona `ceo@xe.vn` · `company_id=main` · U65 read-only deep walk · L0 PASS entry+exit. Log: `ATT_DEEP_QA_RUNTIME_LOG.md`. Machine: `_tmp-po-hrm-bp-att-deep-qa-01-browser.json` (401 GET 2xx · 0 bad · 0 mutates · 44 screenshots). **uat_done false** · **Attendance not CLOSED**.

| Matrix # | runtime (deep QA) |
|---------:|-------------------|
| 1–7 · 10–16 · 19–29 · 31–32 · 34–36 | LIVE (confirm M2) |
| 8 | PARTIAL QR |
| 9 | GĐ2-HOLD Face |
| 17–18 | STUB_UI featureInDev |
| 30 | **PARTIAL** — Xuất dialog **opened** (no download; client empty fetch) |
| 33 | PARTIAL columns ACCEPTED_AS_IS_P1 |
| 37–39 | STUB_UI featureInDev |
| 40–43 | STUB_UI **cfgRedirect** `att-cfg-stub-*` (not LIVE form) |
| 44–46 | STUB_UI featureInDev |

Inventory reconcile: `ATT_SURFACE_INVENTORY_DEEP.md` 18 MISSING — nested residuals in `po-hrm-bp-att-deep-qa-01.md` (S15–16, S74–75, …). Meeting A1–A6 gap stamps → ba-process.

---

*PO-MFD-M1-ATT-INV-ALL · ba-process · design ≠ UAT · uat_done false*
