# ATT Surface Inventory Deep (code SoT)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-BP-ATT-DEEP-CODE-01` |
| **Program** | `PO-HRM-BP-UC-GAP-01` §3 · D4 |
| **Generated** | 2026-08-04 |
| **Method** | Read-only walk `Attendance.tsx` + `apps/web/hrm/src/components/attendance/**` + related hooks/libs |
| **Baseline matrix** | `HRM-ATTENDANCE_FIDELITY_MATRIX.md` (46 rows) |
| **Code anchors** | `apps/web/hrm/src/pages/Attendance.tsx` · `AttendanceEntry.tsx` (lazy shell) · `components/attendance/*` |
| **Drawer** | **None** in attendance tree |
| **uat_done** | `false` (code inventory only — browser verify = next QA) |

---

## 0. Navigation tree (state keys)

```
activeTab ∈ { overview | attendance | shifts | requests | leave | reports | settings }
  attendance → activeAttendanceType ∈ { clock-in | sheets | records | weekly | summary }
             → clockInMethod ∈ { manual | qrcode | faceid | gps }  (when clock-in)
             → attendanceViewMode ∈ { list | data | weekly }
  shifts     → activeShiftType ∈ { list | schedule | overtime }
  requests   → activeRequestType ∈ {
                 leave | late-early | overtime | business-trip | update-attendance |
                 change-shift | leave-summary | compensatory-summary | leave-plan
               }
  settings   → activeSidebarItem ∈ {
                 employees | rules | overtime | leave-rules | late-early |
                 request-rules | users | roles | system
               }
             → activeRulesTab ∈ {
                 general | standard | customize | device | app | tablet | proxy | auto
               }  (when sidebar=rules)
```

Menu constants: `getTopTabs` · `getAttendanceMenuItems` · `getShiftsMenuItems` · `getRequestMenuItems` · `getSidebarMenuItems` · `ATTENDANCE_RULES_TAB_IDS` · `CLOCK_IN_METHOD_OPTIONS`.

---

## 1. Full surface table (code SoT)

Legend — **kind**: `NAV` menu/tab · `PANEL` in-page region · `MODAL` Dialog/AlertDialog · `CTA` button/control · **stub**: `featureInDev` / GĐ2-HOLD / no-op / dead JSX · **matrix**: `#N` from fidelity matrix or `MISSING` / `NESTED` (under parent row) / `EXTRA` / `DEAD`.

| inv_id | kind | menu_path | ui_surface | component file | functions[] | stub/dev label? | in_matrix_row# |
|--------|------|-----------|------------|----------------|-------------|-----------------|----------------|
| S01 | NAV | CC→HRM→Chấm công→Tổng quan | `activeTab=overview` | `Attendance.tsx` `renderOverview` | Year filter; retry; clock-in CTA; view KPI/charts | — | #1 |
| S02 | PANEL | …→Tổng quan→KPI cards | lateEarly / actualLeave / plannedLeave cards | `Attendance.tsx` | View counts; Details link (no nav wire) | Details CTA no route | MISSING (sub of #1) |
| S03 | CTA | …→Tổng quan→Chấm công ngay | `overview-clock-in-cta` | `Attendance.tsx` | `openClockInWizard('manual')` | — | MISSING (bridges #6) |
| S04 | CTA | …→Tổng quan→Tùy chỉnh layout | customize Button | `Attendance.tsx` | — | **disabled** + title HOLD | MISSING |
| S05 | PANEL | …→Tổng quan→Biểu đồ nghỉ tháng | monthlyLeaveData LineChart | `Attendance.tsx` | Hover/tooltip | — | #2 |
| S06 | PANEL | …→Tổng quan→Nghỉ theo phòng ban | departmentLeaveData BarChart | `Attendance.tsx` | Chart | — | #3 |
| S07 | PANEL | …→Tổng quan→Phân tích loại nghỉ | leaveTypeData PieChart | `Attendance.tsx` | Chart + legend | — | **MISSING** |
| S08 | PANEL | …→Tổng quan→Danh sách muộn/sớm | lateEarlyList | `Attendance.tsx` | View rows | — | #4 |
| S09 | PANEL | …→Tổng quan→Đơn nghỉ gần đây | `LeaveOverviewRecentPanel` | `LeaveOverviewRecentPanel.tsx` | View recent leave | — | #5 |
| S10 | NAV | …→Chấm công▼→Vào/ra | `activeAttendanceType=clock-in` + `ClockInMethodSelector` | `Attendance.tsx` · `ClockInMethodSelector.tsx` | Select method; today records table | — | #6 |
| S11 | NAV | …→Clock-In→Thủ công | method=`manual` · `CheckInOutWidget` | `CheckInOutWidget.tsx` | Check-in/out; employee pick | — | #7 |
| S12 | MODAL | …→Clock-In→Thủ công→Confirm | CheckInOut confirm Dialog | `CheckInOutWidget.tsx` | Confirm check-in/out submit | — | NESTED #7 |
| S13 | NAV | …→Clock-In→QR | method=`qrcode` · `QRCodeScanner` | `QRCodeScanner.tsx` | Scan; check-in/out | Shell + camera | #8 |
| S14 | MODAL | …→Clock-In→QR→Confirm | QR confirm Dialog | `QRCodeScanner.tsx` | Confirm after scan | — | NESTED #8 |
| S15 | PANEL | …→Clock-In→QR→Thẻ QR NV | `EmployeeQRCard` | `EmployeeQRCard.tsx` | Select NV; show QR; download PNG; print | — | **MISSING** |
| S16 | MODAL | …→Clock-In→QR→Thẻ QR dialog | EmployeeQR Dialog | `EmployeeQRCard.tsx` | Enlarge QR | — | **MISSING** |
| S17 | NAV | …→Clock-In→Khuôn mặt | method=`faceid` | `FaceIDScanner.tsx` · `FaceRegistration.tsx` | UI shell (pointer-events-none) | **featureInDev** + Face hold banner · GĐ2 | #9 |
| S18 | MODAL | …→Clock-In→Face→Confirm | FaceID confirm Dialog | `FaceIDScanner.tsx` | Blocked when `featureHold` | GĐ2-HOLD | NESTED #9 |
| S19 | MODAL | …→Clock-In→Face→Xóa đăng ký | FaceRegistration AlertDialog | `FaceRegistration.tsx` | Delete face (hold) | GĐ2-HOLD | NESTED #9 |
| S20 | NAV | …→Clock-In→GPS | method=`gps` · `GPSAttendance` | `GPSAttendance.tsx` | Get location; check-in/out | — | #10 |
| S21 | MODAL | …→Clock-In→GPS→Confirm | GPS confirm Dialog | `GPSAttendance.tsx` | Confirm with lat/lon | — | NESTED #10 |
| S22 | PANEL | …→Clock-In→Bản ghi hôm nay | `AttendanceRecordsTable` under wizard | `AttendanceRecordsTable.tsx` | Same table as records | — | NESTED #6/#13 |
| S23 | NAV | …→▼→Bảng chấm công | `sheets` · viewMode=`list` | `Attendance.tsx` `renderAttendanceSheetsList` | List; open sheet→weekly; search | — | #11 |
| S24 | MODAL | …→Bảng chấm công→Thêm bảng | `addSheetModalOpen` Dialog | `Attendance.tsx` | Create sheet POST | — | #12 |
| S25 | MODAL | …→Bảng chấm công→Xóa bảng | `deleteSheetModalOpen` AlertDialog | `Attendance.tsx` | Delete sheet | — | **MISSING** |
| S26 | NAV | …→▼→Bản ghi chấm công | `records` · `AttendanceRecordsTable` | `AttendanceRecordsTable.tsx` | Search; date; status; refresh; edit; delete; export | — | #13 |
| S27 | MODAL | …→Bản ghi→Sửa trạng thái | Edit Dialog PATCH | `AttendanceRecordsTable.tsx` | Update status | — | NESTED #13 |
| S28 | MODAL | …→Bản ghi→Xóa bản ghi | Delete AlertDialog | `AttendanceRecordsTable.tsx` | Delete record | — | **MISSING** |
| S29 | MODAL | …→Bản ghi→Xuất | `AttendanceExportDialog` | `AttendanceExportDialog.tsx` | Export Excel (client) | — | **MISSING** (matrix #30 = reports only) |
| S30 | MODAL | …→Bản ghi→Lọc ngày | Date Popover+Calendar | `AttendanceRecordsTable.tsx` | Filter by date | — | NESTED #13 |
| S31 | NAV | …→▼→Chấm công tuần | `weekly` · viewMode=`weekly` | `Attendance.tsx` `renderWeeklyAttendance` | Reload; open cell; back to list | — | #14 |
| S32 | MODAL | …→Chấm công tuần→Chi tiết ô | `cellDetailModalOpen` Dialog | `Attendance.tsx` | View/edit cell detail UI | — | **MISSING** |
| S33 | CTA | …→Chấm công tuần→Pencil/Settings/Download | icon Buttons | `Attendance.tsx` | — | **no-op** (no onClick) | **MISSING** STUB |
| S34 | NAV | …→▼→Tổng hợp | `summary` · viewMode=`data` | `Attendance.tsx` | Renders `AttendanceRecordsTable` (same as records) | OBS same-as-records | #15 |
| S35 | NAV | …→Ca→Danh sách ca | `activeShiftType=list` | `Attendance.tsx` `renderShiftsContent` | Add; edit; delete; bulk delete; select | — | #16 |
| S36 | MODAL | …→Ca→Thêm/Sửa ca | `shiftModalOpen` Dialog | `Attendance.tsx` | Create/update shift | — | NESTED #16 |
| S37 | MODAL | …→Ca→Xóa hàng loạt | `bulkDeleteShiftsDialogOpen` | `Attendance.tsx` | Bulk delete confirm | — | NESTED #16 |
| S38 | MODAL | …→Ca→Xóa một ca | `shiftPendingDelete` AlertDialog | `Attendance.tsx` | Single delete | — | NESTED #16 |
| S39 | CTA | …→Ca→Sao chép | Copy icon Button | `Attendance.tsx` | — | **no onClick** STUB | **MISSING** |
| S40 | NAV | …→Ca→Phân ca (lịch) | `activeShiftType=schedule` | `Attendance.tsx` | Banner only; goto list | **featureInDev** + GĐ2 badge | #17 |
| S41 | NAV | …→Ca→Tăng ca (ca OT) | `activeShiftType=overtime` | `Attendance.tsx` | Banner only; goto list | **featureInDev** + GĐ2 badge | #18 |
| S42 | NAV | …→Đơn từ→Nghỉ phép | `requests`·`leave` → `LeaveTab` | `LeaveTab.tsx` | Create; list; approve; reject; delete; balance | — | #19 |
| S43 | PANEL | …→Nghỉ phép→Quỹ phép | leave-balance panel | `LeaveTab.tsx` | View balance GET | — | **MISSING** |
| S44 | MODAL | …→Nghỉ phép→Tạo đơn | create Dialog | `LeaveTab.tsx` | Create + attachment | — | NESTED #19 |
| S45 | MODAL | …→Nghỉ phép→Chi tiết | detail Dialog | `LeaveTab.tsx` | View; approve; reject | — | NESTED #19 |
| S46 | MODAL | …→Nghỉ phép→Từ chối | reject Dialog | `LeaveTab.tsx` | Reject + reason | — | NESTED #19 |
| S47 | MODAL | …→Nghỉ phép→Xóa | delete AlertDialog | `LeaveTab.tsx` | Delete | — | NESTED #19 |
| S48 | NAV | …→Đơn từ→Đi muộn/Về sớm | `LateEarlyRequestTab` | `LateEarlyRequestTab.tsx` | List; create; approve; reject; delete | — | #20 |
| S49 | MODAL | …→Muộn/sớm→Add/Detail/Delete | 2 Dialog + AlertDialog | `LateEarlyRequestTab.tsx` | CRUD + approve | — | NESTED #20 |
| S50 | NAV | …→Đơn từ→Tăng ca | `OvertimeRequestTab` | `OvertimeRequestTab.tsx` | List; create; approve; reject; delete | — | #21 |
| S51 | MODAL | …→OT→Add/Detail/Delete | 2 Dialog + AlertDialog | `OvertimeRequestTab.tsx` | CRUD + approve | — | NESTED #21 |
| S52 | NAV | …→Đơn từ→Công tác | `BusinessTripRequestTab` | `BusinessTripRequestTab.tsx` | List; create; approve; reject; delete | — | #22 |
| S53 | MODAL | …→Công tác→Add/Detail/Delete | 2 Dialog + AlertDialog | `BusinessTripRequestTab.tsx` | CRUD + approve | — | NESTED #22 |
| S54 | NAV | …→Đơn từ→Cập nhật chấm công | `AttendanceUpdateRequestTab` | `AttendanceUpdateRequestTab.tsx` | List; create; approve; reject; delete | — | #23 |
| S55 | MODAL | …→Update req→Add/Detail/Delete | 2 Dialog + AlertDialog | `AttendanceUpdateRequestTab.tsx` | CRUD + approve | — | NESTED #23 |
| S56 | NAV | …→Đơn từ→Đổi ca | `ShiftChangeRequestTab` | `ShiftChangeRequestTab.tsx` | List; create; approve; reject; delete | — | #24 |
| S57 | MODAL | …→Đổi ca→Add/Detail/Delete | 2 Dialog + AlertDialog | `ShiftChangeRequestTab.tsx` | CRUD + approve | — | NESTED #24 |
| S58 | NAV | …→Đơn từ→Tổng hợp nghỉ | `leave-summary` | `LeaveTab.tsx` (no props) | **Same UI as leave** — menu state only | ALIAS_SAME_UI | #25 |
| S59 | NAV | …→Đơn từ→Tổng hợp nghỉ bù | `compensatory-summary` | `LeaveTab.tsx` (no props) | **Same UI as leave** | ALIAS_SAME_UI | #26 |
| S60 | NAV | …→Đơn từ→Kế hoạch nghỉ | `leave-plan` | `LeaveTab.tsx` (no props) | **Same UI as leave** | ALIAS_SAME_UI · matrix GĐ2 | #27 |
| S61 | NAV | …→Nghỉ phép (top tab) | `activeTab=leave` · `LeaveTab` | `LeaveTab.tsx` | Same as S42 | Duplicate entry | #28 |
| S62 | NAV | …→Báo cáo | `AttendanceReportsTab` | `AttendanceReportsTab.tsx` | Month/year; charts; emp/dept tables | — | #29 |
| S63 | MODAL | …→Báo cáo→Xuất | `AttendanceExportDialog` | `AttendanceExportDialog.tsx` | Export Excel | PARTIAL client | #30 |
| S64 | NAV | …→Cài đặt→Nhân viên chấm công | `activeSidebarItem=employees` | `Attendance.tsx` | Search; status/dept filter; refresh; import; paginate | — | #31 |
| S65 | MODAL | …→Cài đặt→NV→Nhập khẩu | `EmployeeImportDialog` | `employee/EmployeeImportDialog.tsx` | Import spreadsheet | — | **MISSING** (nested #31) |
| S66 | CTA | …→Cài đặt→NV→Filter/Download icons | ghost icon Buttons | `Attendance.tsx` | — | **no-op** STUB | **MISSING** |
| S67 | NAV | …→Cài đặt→Quy tắc→Chung | `rules`·`general` | `Attendance.tsx` | Edit work days/rounding; **Lưu** PATCH | — | #32 |
| S68 | NAV | …→Cài đặt→Quy tắc→Công chuẩn | `standard` | `Attendance.tsx` | Standard days/hours; **Lưu** PATCH | Columns static elsewhere | #33 |
| S69 | NAV | …→Cài đặt→Quy tắc→Tùy chỉnh | `customize` | `Attendance.tsx` | Static column list; reset/preview/add | Mutate GĐ2 / no persist | #34 |
| S70 | CTA | …→Quy tắc→Tùy chỉnh→Reset/Preview/Add/Advanced | Buttons | `Attendance.tsx` | — | **no-op** STUB CTAs | **MISSING** |
| S71 | CTA | …→Quy tắc→Gợi ý phương thức | suggestMethod Button | `Attendance.tsx` | — | **no-op** | **MISSING** |
| S72 | NAV | …→Cài đặt→Quy tắc→Thiết bị | `device` | `Attendance.tsx` `renderDeviceTabContent` | Tool versions UI; copy login code; FAQ links | Download tool **no-op**; static FAQ | #35 |
| S73 | NAV | …→Cài đặt→Quy tắc→Ứng dụng | `app` | `Attendance.tsx` `renderAppTabContent` | Toggle GPS/Wifi/QR; Face disabled; App Store/Play | Face GĐ1 banner; store buttons no href | #36 |
| S74 | PANEL | …→Ứng dụng→Địa điểm GPS | work-sites list | `Attendance.tsx` | List; remove site; open add | LIVE work-sites API | **MISSING** (under app, not device) |
| S75 | MODAL | …→Ứng dụng→Thêm địa điểm GPS | `gpsDialogOpen` Dialog | `Attendance.tsx` | Add work-site (name/lat/lon/radius) | — | **MISSING** |
| S76 | NAV | …→Quy tắc→Máy tính bảng | `tablet` | `Attendance.tsx` stub branch | — | **featureInDev** | #37 |
| S77 | NAV | …→Quy tắc→Ủy quyền chấm | `proxy` | `Attendance.tsx` stub branch | — | **featureInDev** | #38 |
| S78 | NAV | …→Quy tắc→Tự động | `auto` | `Attendance.tsx` stub branch | — | **featureInDev** | #39 |
| S79 | NAV | …→Cài đặt→Quy tắc tăng ca | sidebar `overtime` | `Attendance.tsx` D4 stub | Redirect banner → `/settings` catalog | CFG redirect (not featureInDev text) | #40 |
| S80 | NAV | …→Cài đặt→Quy tắc nghỉ | `leave-rules` | `Attendance.tsx` D4 stub | Redirect banner → settings | CFG redirect | #41 |
| S81 | NAV | …→Cài đặt→Đi muộn/Về sớm | `late-early` | `Attendance.tsx` D4 stub | Redirect banner → settings | CFG redirect | #42 |
| S82 | NAV | …→Cài đặt→Quy tắc đơn từ | `request-rules` | `Attendance.tsx` D4 stub | Redirect banner → settings | CFG redirect | #43 |
| S83 | NAV | …→Cài đặt→Người dùng | `users` | `Attendance.tsx` placeholder | — | **featureInDev** | #44 |
| S84 | NAV | …→Cài đặt→Vai trò | `roles` | `Attendance.tsx` placeholder | — | **featureInDev** | #45 |
| S85 | NAV | …→Cài đặt→Hệ thống | `system` | `Attendance.tsx` placeholder | — | **featureInDev** | #46 |
| S86 | MODAL | *(orphan)* Leave request create | `leaveRequestModalOpen` | `Attendance.tsx` | Create leave (legacy) | **DEAD** — never `set(true)` | EXTRA DEAD |
| S87 | MODAL | *(orphan)* Leave detail/edit | `leaveDetailModalOpen` | `Attendance.tsx` | Detail/edit/approve | **DEAD** — no opener from live UI | EXTRA DEAD |
| S88 | MODAL | *(orphan)* Leave approval | `approvalModalOpen` | `Attendance.tsx` | Approve/reject confirm | **DEAD** (depends S87) | EXTRA DEAD |
| S89 | MODAL | *(orphan)* Edit attendance (page-level) | `attendanceModalOpen` | `Attendance.tsx` | Edit status | **DEAD** — `openEditAttendanceModal` never called; live edit = S27 | EXTRA DEAD |
| S90 | SHELL | Route `/hr/attendance` | `AttendanceEntry` | `AttendanceEntry.tsx` | Lazy-load workbench | Not a user menu | EXTRA (infra) |

---

## 2. Diff vs `HRM-ATTENDANCE_FIDELITY_MATRIX.md`

### 2.1 MISSING from matrix (must add rows or expand existing)

| inv_id | Why missing | Suggested matrix action |
|--------|-------------|-------------------------|
| S07 | leaveTypeAnalysis pie not in matrix | Add C1 row |
| S04 | Overview customize disabled HOLD | Add C1 STUB row |
| S03 | Clock-in CTA from overview | Note on #1/#6 or add CTA row |
| S15–S16 | EmployeeQRCard + dialog | Add under C2 QR |
| S25 | Delete sheet AlertDialog | Expand #11/#12 |
| S28–S29 | Records delete + export path | Expand #13; link #30 component reuse |
| S32–S33 | Weekly cell modal + no-op icons | Expand #14 |
| S39 | Shift Copy no-op | Expand #16 STUB CTA |
| S43 | Leave balance panel | Expand #19/#28 |
| S65–S66 | Employee import dialog + Filter/Download no-op | Expand #31 |
| S70–S71 | Customize/suggest no-op CTAs | Expand #34 |
| S74–S75 | GPS work-sites CRUD under **App** rules | New C7 rows (not under #35 device) |

Nested modals S12/S14/S18/S19/S21/S27/S30/S36–S38/S44–S47/S49/S51/S53/S55/S57 — matrix lists parent functions[] but not as distinct `ui_surface` rows. Deep inventory treats them as first-class for meeting «rà hết popup».

### 2.2 EXTRA / honesty notes (matrix overstates or code alias)

| Topic | Detail |
|-------|--------|
| #25–#27 leave-summary / compensatory / leave-plan | Code mounts **identical** `<LeaveTab />` — no distinct summary/plan view. Matrix rows are **menu labels only** (ALIAS_SAME_UI). |
| #15 summary vs #13 records | Both end at `AttendanceRecordsTable` when `viewMode=data`. |
| #40–#43 | Matrix STUB_UI; code shows **redirect Alert** to HRM Settings catalog (`att-cfg-stub-*`), not `featureInDev` copy. |
| S86–S89 | Dead Dialogs still mounted in `Attendance.tsx` JSX — **EXTRA** not in matrix; candidates for cleanup (Dev), not UAT LIVE. |
| Drawer | Matrix silent; code confirms **0 Drawer**. |

### 2.3 Matrix rows covered (1:1)

#1–#6, #7–#24, #28–#46 map to inventory NAV rows above. Nested/MISSING listed in §2.1.

---

## 3. Counts

| Metric | Count |
|--------|------:|
| **Total distinct surfaces (inv S01–S90)** | **90** |
| **NAV (menu/tab/sidebar)** | 46 |
| **PANEL** | 8 |
| **MODAL / AlertDialog** | 28 |
| **CTA / shell / orphan** | 8 |
| **Mapped to matrix #1–#46 (any)** | 46 parents + nested |
| **MISSING (new matrix candidates)** | **18** (S03,S04,S07,S15,S16,S25,S28,S29,S32,S33,S39,S43,S65,S66,S70,S71,S74,S75) |
| **NESTED under existing matrix** | 22 |
| **EXTRA DEAD** | 4 (S86–S89) |
| **EXTRA infra** | 1 (S90) |
| **STUB / featureInDev / GĐ2 / no-op** | **22** — S04,S17–S19,S33,S39,S40,S41,S66,S70,S71,S76–S85 (+ Face hold in S17) |
| **featureInDev explicit UI copy** | S17, S40, S41, S76–S78, S83–S85 (9) |
| **GĐ2-HOLD banner** | S17, S40, S41 (+ S60 menu GĐ2 signal) |
| **D4 CFG redirect stubs** | S79–S82 (4) |
| **Mapped to HRM-AT-\*** | Same as matrix: AT-01..13 + AT-14 on sheets/rules; most request/shift/report/settings = **UNMAPPED** |
| **HRM-AT-\* touch surfaces** | S10–S12,S20–S21,S23–S28,S42–S47,S54–S55,S61,S67–S68 (~AT-01..14) |

### Stub inventory (quick)

| Cluster | Surfaces |
|---------|----------|
| Face clock-in | S17–S19 |
| Shifts roster | S40–S41 · Copy CTA S39 |
| Rules tablet/proxy/auto | S76–S78 |
| Settings sidebar RBAC/system | S83–S85 |
| Settings D4 redirect | S79–S82 |
| Overview customize | S04 |
| Weekly no-op icons | S33 |
| Customize column mutate | S70–S71 |
| Settings emp Filter/Download | S66 |

---

## 4. Component tree (imports from Attendance)

```
AttendanceEntry.tsx
└─ Attendance.tsx
   ├─ LeaveOverviewRecentPanel
   ├─ ClockInMethodSelector
   ├─ CheckInOutWidget
   ├─ QRCodeScanner (lazy)
   ├─ EmployeeQRCard
   ├─ FaceIDScanner (lazy, featureHold)
   ├─ FaceRegistration (lazy, featureHold)
   ├─ GPSAttendance (lazy)
   ├─ AttendanceRecordsTable → AttendanceExportDialog
   ├─ LeaveTab (requests leave* + top leave)
   ├─ OvertimeRequestTab | LateEarlyRequestTab | BusinessTripRequestTab
   ├─ AttendanceUpdateRequestTab | ShiftChangeRequestTab
   ├─ AttendanceReportsTab (lazy) → AttendanceExportDialog
   └─ EmployeeImportDialog (settings employees)
```

Hooks (not UI surfaces): `useAttendanceOverview`, `useAttendanceSheets`, `useWorkShifts`, `useAttendanceRules` (+ GPS sites), `useWeeklyAttendanceSummary`, `useEmployees`, `useDepartments`, request hooks per tab.

---

## 5. completion_report

```yaml
work_item_id: PO-HRM-BP-ATT-DEEP-CODE-01
from_role: explore
to_role: pm
ack_status: PASS_TO_PM
completion_report: |
  Closed exhaustive code crawl of HRM Attendance UI.
  Deliverable ATT_SURFACE_INVENTORY_DEEP.md: 90 surfaces vs matrix 46.
  MISSING 18 matrix candidates (leaveType pie, EmployeeQR, GPS work-sites under App,
  sheet delete, records delete/export path, weekly cell modal, leave balance,
  import dialog, no-op CTAs). Nested modals 22. STUB/featureInDev/GĐ2/no-op 22.
  leave-summary/compensatory/leave-plan = ALIAS_SAME_UI LeaveTab.
  Dead orphan leave/attendance Dialogs S86–S89 still mounted.
  No Drawer. Product apps untouched.
residual:
  - Browser U65 verify MISSING + stub honesty (QA)
  - Matrix refresh rows (ba-process / qa synth)
  - Optional Dev cleanup DEAD Dialogs (not this wave)
evidence_path: docs/qa/evidence/po-hrm-bp-att-deep-code-01.md
next_owner: qa
```

## 6. next_dispatch_prompt (QA browser)

```text
work_item_id: PO-HRM-BP-ATT-DEEP-QA-01
from_role: pm
to_role: qa
lane: execution
priority: P0
entry_criteria: |
  L0 stack PASS; U65 zero-seed browser-only;
  Code SoT: docs/qa/professional/menu-fidelity/ATT_SURFACE_INVENTORY_DEEP.md
  Baseline: HRM-ATTENDANCE_FIDELITY_MATRIX.md
exit_criteria: |
  Browser-verify every MISSING inv_id (S03,S04,S07,S15,S16,S25,S28,S29,S32,S33,S39,S43,S65,S66,S70,S71,S74,S75)
  + spot STUB honesty: S17 Face, S40–S41 shifts GĐ2, S76–S85 settings stubs, S79–S82 D4 redirect.
  Confirm ALIAS_SAME_UI for leave-summary / compensatory-summary / leave-plan (same LeaveTab).
  Confirm GPS work-sites under Cài đặt→Quy tắc→Ứng dụng (not Thiết bị).
  Evidence: click path + screenshot/testid + network where LIVE;
  Update matrix runtime or append RUNTIME_LOG delta; PASS_TO_PM.
  Cấm: seed; API-only PASS; claim Attendance CLOSED.
persona: ceo@xe.vn / Xevn@2026 · company main (or pilot scope)
evidence_path: docs/qa/evidence/po-hrm-bp-att-deep-qa-01.md
hdsd_align: Chấm công menu SRS / HDSD ATT
```

---

*PO-HRM-BP-ATT-DEEP-CODE-01 · explore · code SoT · uat_done false*
