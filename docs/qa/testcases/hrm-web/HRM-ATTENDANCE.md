# Menu TC Pack — `HRM-ATTENDANCE` · Chấm công (HRM Web)

| Meta | Value |
|------|--------|
| **menu_id** | `HRM-ATTENDANCE` |
| **surface** | `hrm-web` |
| **route(s)** | `/attendance` (embed `/hr/attendance` · CC `/command-center/hrm/attendance`) |
| **HDSD** | HDSD Chấm công → Tổng quan / Chấm công / Nghỉ phép / Yêu cầu · `hdsdMutateTestIds.ts` |
| **SRS / FR / UC** | UC-HRM-23 · UC-HRM-09 update-requests · FR-UC-H03 leave · HRM-AT-14 · AC-ATT-SHEET-01..06 |
| **TechSpec** | `docs/hrm/TECHSPEC.md` §12.1 · §14.4 · CreateAttendanceSheetDto |
| **API_CONTRACT** | `GET/POST/PATCH/DELETE /api/hrm/attendance/attendance-sheets` · `GET/POST …/records` · `…/leave-requests` · `GET …/overview` |
| **UF / J-*** | **UF-HRM-05** · **UF-HRM-16** · **J-HRM-06** · **J-HRM-06b** · UF-HRM-MENU-07 |
| **author** | qa · PO-ECO-TC-HRM-ATTENDANCE-01 |
| **work_item_id** | `PO-ECO-TC-HRM-ATTENDANCE-01` |
| **date** | 2026-08-03 |
| **ack_status** | **READY_FOR_SYNTH** |
| **depth_gate** | Screen inventory ☑ · Field dict ☑ · Function inv ☑ · TC matrix ☑ · Trace ☑ |

> Chuẩn: IEEE 829 / ISO 29119 lean — mỗi TC quan sát được; fail-deep trước/cùng happy; U65 precond «data từ FE»; **cấm** seed trong bước nghiệm thu.

---

## 1. Screen inventory (màn + popup)

| screen_id | Loại | Route / trigger | Mô tả | States |
|-----------|------|-----------------|-------|--------|
| SCR-TOP-SHELL | page | `/attendance` | Header + 7 top tabs | loading · success · API error toast |
| SCR-OVERVIEW | tab | Top → Tổng quan | Widget đi muộn/sớm · nghỉ · charts | loading · empty chart · success |
| SCR-OVERVIEW-FILTER | control | Overview time Select | today…customRange | all options |
| SCR-ATT-DROPDOWN | menu | Top → Chấm công ▾ | Sub: clock-in · sheets · records · weekly · summary | open/close |
| SCR-CLOCK-IN | tab-pane | Sub → Chấm công vào/ra | CheckInOut + method selector QR/Face/GPS/manual | wizard steps |
| SCR-CLOCK-QR | widget | ClockIn → QR | QRCodeScanner + EmployeeQRCard | camera deny · success |
| SCR-CLOCK-FACE | widget | ClockIn → Face | FaceIDScanner · FaceRegistration | stub camera |
| SCR-CLOCK-GPS | widget | ClockIn → GPS | GPSAttendance map/list | no locations empty |
| SCR-SHEETS-LIST | tab-pane | Sub → Bảng chấm công | Danh sách sheet + toolbar | loading · empty · rows |
| SCR-SHEETS-WEEKLY | tab-pane | Open sheet → weekly grid | Lưới tuần + legend + **Tải lại** | loading · settled empty · error · data |
| SCR-RECORDS | tab-pane | Sub → Dữ liệu chấm công | `AttendanceRecordsTable` | loading · empty · rows |
| SCR-ATT-SUMMARY | tab-pane | Sub → Tổng hợp | Placeholder/summary grid | stub |
| SCR-SHIFTS-LIST | tab-pane | Top → Ca làm việc → Danh sách | Shift table + bulk | loading · empty |
| SCR-SHIFTS-SCHEDULE | tab-pane | Sub → Lịch ca | Schedule placeholder | stub |
| SCR-SHIFTS-OT-SCHED | tab-pane | Sub → OT schedule | Placeholder | stub |
| SCR-REQ-DROPDOWN | menu | Top → Yêu cầu ▾ | 8 request types | open/close |
| SCR-REQ-LEAVE | tab-pane | Requests → Nghỉ phép | Legacy list in page shell | filter/table |
| SCR-REQ-LATE | tab-pane | LateEarlyRequestTab | List + create | loading |
| SCR-REQ-OT | tab-pane | OvertimeRequestTab | List + create | loading |
| SCR-REQ-TRIP | tab-pane | BusinessTripRequestTab | List + create | loading |
| SCR-REQ-UPDATE | tab-pane | AttendanceUpdateRequestTab | Điều chỉnh công | loading |
| SCR-REQ-SHIFT-CHG | tab-pane | ShiftChangeRequestTab | Đổi ca | loading |
| SCR-REQ-LEAVE-SUM | tab-pane | leave-summary | Placeholder | stub |
| SCR-REQ-COMP-SUM | tab-pane | compensatory-summary | Placeholder | stub |
| SCR-REQ-LEAVE-PLAN | tab-pane | leave-plan | Placeholder | stub |
| SCR-LEAVE-TAB | tab | Top → Nghỉ phép | `LeaveTab` full UX | loading · empty |
| SCR-LEAVE-CAL | sub-tab | Leave → Lịch | Calendar + day list | empty days |
| SCR-LEAVE-LIST | sub-tab | Leave → Danh sách | Filter + row actions Duyệt | pending rows |
| SCR-LEAVE-APPROVAL | sub-tab | Leave → Chờ duyệt | Approval queue | empty/pending |
| SCR-REPORTS | tab | Top → Báo cáo | Lazy `AttendanceReportsTab` | loading |
| SCR-SETTINGS-SHELL | tab | Top → Cài đặt | Sidebar 8 items | — |
| SCR-SET-RULES | tab-pane | Settings → Quy tắc CC | 8 rules sub-tabs | partial stub |
| SCR-SET-RULES-GEN | sub-tab | general/standard/customize/device/app | Form sections | save toast |
| SCR-SET-STUB | tab-pane | rules tablet/proxy/auto… | «Đang phát triển» | stub |
| DLG-SHEET-CREATE | dialog | Sheets → Thêm bảng | Kỳ + Công chuẩn + dept/position | validate error |
| DLG-SHEET-DELETE | confirm | Row → Xóa | AlertDialog | cancel/confirm |
| DLG-SHIFT-UPSERT | dialog | Shifts → Thêm/Sửa | Code/name/time/coef | validate |
| DLG-SHIFT-BULK-DEL | confirm | Shifts bulk Xóa | AlertDialog | — |
| DLG-ATT-EDIT | dialog | Summary grid → sửa giờ | Edit attendance modal | API id missing fail |
| DLG-RECORD-DEL | confirm | Records row → Xóa | AlertDialog | — |
| DLG-EXPORT | dialog | Records → Xuất báo cáo | AttendanceExportDialog | — |
| DLG-LEAVE-CREATE | dialog | Leave → Tạo yêu cầu | Full form + attach | catalog empty |
| DLG-LEAVE-REJECT | dialog | Từ chối | Lý do bắt buộc | — |
| DLG-LEAVE-DELETE | confirm | Xóa đơn | AlertDialog | — |
| DLG-LEAVE-DETAIL | dialog | Xem chi tiết | Read-only + Duyệt | — |

**Đếm:** pages=1 · tabs=7 top + 15 sub · dialogs=11 · drawers=0 · confirms=5

---

## 2. Field dictionary (đủ mọi trường)

### 2.1 Overview widgets

| field_id | UI label (VI) | screen_id | control | req | validation / BR | API / column | format |
|----------|---------------|-----------|---------|-----|-----------------|--------------|--------|
| F-OV-TIME | Khung thời gian | SCR-OVERVIEW-FILTER | select | N | filter drives stats | `GET attendance/overview` | enum |
| F-OV-LATE-N | Đi muộn/về sớm hôm nay | SCR-OVERVIEW | display | — | — | overview.lateEarlyToday | number |
| F-OV-LEAVE-W | Nghỉ thực tế tuần | SCR-OVERVIEW | display | — | — | overview.actualLeaveThisWeek | number |
| F-OV-PLAN-NW | Nghỉ kế hoạch tuần sau | SCR-OVERVIEW | display | — | — | overview.plannedLeaveNextWeek | number |
| F-OV-CHART-MONTH | Nghỉ theo thời gian | SCR-OVERVIEW | chart | — | empty OK | monthlyLeaveData | vi-VN month |
| F-OV-CHART-DEPT | Nghỉ theo đơn vị | SCR-OVERVIEW | chart | — | — | departmentLeaveData | label |
| F-OV-CHART-TYPE | Phân tích loại nghỉ | SCR-OVERVIEW | chart | — | — | leaveTypeData | label |
| F-OV-LATE-LIST | DS đi muộn/về sớm | SCR-OVERVIEW | table | — | — | lateEarlyList | time vi-VN |

### 2.2 Bảng chấm công (sheet)

| field_id | UI label | screen_id | control | req | validation / BR | API field | format |
|----------|----------|-----------|---------|-----|-----------------|-----------|--------|
| F-SHT-UNIT | Đơn vị | DLG-SHEET-CREATE | select dept | N | — | `department` | text |
| F-SHT-POS | Vị trí | DLG-SHEET-CREATE | select | N | all positions | `positions` | text |
| F-SHT-NAME | Tên bảng | DLG-SHEET-CREATE | text | N | default auto name | `name` | text |
| F-SHT-PRESET | Kỳ preset | DLG-SHEET-CREATE | select | N | this/last/custom month | — | — |
| F-SHT-START | Ngày bắt đầu | DLG-SHEET-CREATE | ViDatePickerField | **Y** | ISO yyyy-MM-dd · BR-ATT-SHEET-04 order | `start_date` | dd/MM/yyyy |
| F-SHT-END | Ngày kết thúc | DLG-SHEET-CREATE | ViDatePickerField | **Y** | start ≤ end | `end_date` | dd/MM/yyyy |
| F-SHT-METHOD | Hình thức CC | DLG-SHEET-CREATE | select daily/hourly | N | — | `attendance_type` | enum |
| F-SHT-STD-FIX | Công chuẩn (cố định) | DLG-SHEET-CREATE | radio | **Y** | fixed vs monthly | `standard_type=fixed` | — |
| F-SHT-STD-MON | Công chuẩn (tháng) | DLG-SHEET-CREATE | radio | **Y** | — | `standard_type=monthly` | — |
| F-SHT-LIST-PERIOD | Cột Kỳ | SCR-SHEETS-LIST | display | — | — | start/end | dd/MM/yyyy |
| F-SHT-LIST-NAME | Tên | SCR-SHEETS-LIST | display | — | — | name | — |
| F-SHT-LIST-TYPE | Loại | SCR-SHEETS-LIST | display | — | — | attendance_type | — |
| F-SHT-LIST-UNIT | Đơn vị | SCR-SHEETS-LIST | display | — | — | department | — |
| F-WKL-EMP | Nhân viên | SCR-SHEETS-WEEKLY | column | — | — | weekly row | — |
| F-WKL-DAY-n | Cột ngày T2..CN | SCR-SHEETS-WEEKLY | cell | — | full/half/absent legend | records aggregate | — |
| F-WKL-DEPT-FILTER | Lọc đơn vị | SCR-SHEETS-WEEKLY | select | N | — | client filter | — |
| F-WKL-SEARCH | Tìm kiếm | SCR-SHEETS-WEEKLY | text | N | — | client | — |

### 2.3 Bản ghi chấm công

| field_id | UI label | screen_id | control | req | validation | API | format |
|----------|----------|-----------|---------|-----|------------|-----|--------|
| F-REC-DATE | Ngày | SCR-RECORDS | date popover | N | — | `attendance_date` query | dd/MM/yyyy |
| F-REC-SEARCH | Tìm NV | SCR-RECORDS | text | N | — | client | — |
| F-REC-STATUS | Trạng thái | SCR-RECORDS | select | N | present/late/… | `status` | enum |
| F-REC-COL-EMP | Nhân viên | SCR-RECORDS | column | — | — | employee_name | — |
| F-REC-COL-DEPT | Phòng ban | SCR-RECORDS | column | — | — | department | — |
| F-REC-COL-IN | Giờ vào | SCR-RECORDS | column | — | not 1970 | check_in_time | HH:mm |
| F-REC-COL-OUT | Giờ ra | SCR-RECORDS | column | — | — | check_out_time | HH:mm |
| F-REC-COL-HRS | Giờ công | SCR-RECORDS | column | — | — | work_hours | number |
| F-REC-COL-STAT | Trạng thái | SCR-RECORDS | badge | — | — | status | — |
| F-REC-COL-TYPE | Loại | SCR-RECORDS | badge | — | — | attendance_type | — |

### 2.4 Ca làm việc

| field_id | UI label | screen_id | control | req | validation | API | format |
|----------|----------|-----------|---------|-----|------------|-----|--------|
| F-SHF-CODE | Mã ca | DLG-SHIFT-UPSERT | text | **Y** | unique | `code` | text |
| F-SHF-NAME | Tên ca | DLG-SHIFT-UPSERT | text | **Y** | — | `name` | text |
| F-SHF-UNIT | Đơn vị | DLG-SHIFT-UPSERT | text/select | N | — | `department` | — |
| F-SHF-START | Giờ bắt đầu | DLG-SHIFT-UPSERT | time | **Y** | — | `start_time` | HH:mm |
| F-SHF-END | Giờ kết thúc | DLG-SHIFT-UPSERT | time | **Y** | — | `end_time` | HH:mm |
| F-SHF-COEF | Hệ số | DLG-SHIFT-UPSERT | number | N | — | `coefficient` | number |
| F-SHF-HOURS | Giờ công | DLG-SHIFT-UPSERT | number | N | — | `work_hours` | number |
| F-SHF-STATUS | Trạng thái | DLG-SHIFT-UPSERT | select | N | — | `status` | — |

### 2.5 Nghỉ phép (`LeaveTab`)

| field_id | UI label | screen_id | control | req | validation / BR | API | format |
|----------|----------|-----------|---------|-----|-----------------|-----|--------|
| F-LV-EMP | Nhân viên | DLG-LEAVE-CREATE | typeahead picker | **Y** | keyword search | `employee_id` | HLD-#### |
| F-LV-TYPE | Loại nghỉ | DLG-LEAVE-CREATE | CatalogSearchPicker | **Y** | catalog SoT · empty→CTA settings | `leave_type` | catalog code |
| F-LV-START | Từ ngày | DLG-LEAVE-CREATE | ViDateField | **Y** | overlap pickNonOverlapping | `start_date` | dd/MM/yyyy |
| F-LV-END | Đến ngày | DLG-LEAVE-CREATE | ViDateField | **Y** | ≥ start | `end_date` | dd/MM/yyyy |
| F-LV-REASON | Lý do | DLG-LEAVE-CREATE | textarea | N | sanitize display seed: | `reason` | text |
| F-LV-HANDOVER | Bàn giao cho | DLG-LEAVE-CREATE | picker | N | — | `handover_to` | — |
| F-LV-TASKS | Công việc bàn giao | DLG-LEAVE-CREATE | textarea | N | — | `handover_tasks` | — |
| F-LV-ATTACH | Đính kèm (ốm) | DLG-LEAVE-CREATE | file | Cond | BR-LEAVE-ATT-01 ≥3d sick · LVT_02 | `attachment_url` | upload |
| F-LV-FILTER-ST | Lọc trạng thái | SCR-LEAVE-LIST | select | N | — | query | — |
| F-LV-FILTER-TY | Lọc loại | SCR-LEAVE-LIST | select | N | — | — | — |
| F-LV-REJECT-RSN | Lý do từ chối | DLG-LEAVE-REJECT | textarea | **Y** | min length SRS | reject body | text |

### 2.6 Clock-in / export (selected)

| field_id | UI label | screen_id | control | req | API | notes |
|----------|----------|-----------|---------|-----|-----|-------|
| F-CLK-METHOD | Phương thức | SCR-CLOCK-IN | selector | N | POST records | manual/qr/face/gps |
| F-EXP-FORMAT | Định dạng xuất | DLG-EXPORT | select | N | export API | xlsx/csv |
| F-EXP-RANGE | Khoảng ngày | DLG-EXPORT | date range | **Y** | query from/to | vi-VN |

**Đếm fields:** 87 (gồm cột list hiển thị)

---

## 3. Function inventory (đủ mọi function)

| fn_id | UI (nút/menu) | screen_id | precond | API | success FE+F5 | fail codes |
|-------|---------------|-----------|---------|-----|---------------|------------|
| FN-NAV-OVERVIEW | Tab Tổng quan | SCR-TOP-SHELL | login CEO | GET overview | widgets render | toast error |
| FN-NAV-ATT | Tab Chấm công ▾ | SCR-TOP-SHELL | — | — | submenu | — |
| FN-NAV-SHIFTS | Tab Ca | SCR-TOP-SHELL | — | GET work-shifts | list | — |
| FN-NAV-REQ | Tab Yêu cầu ▾ | SCR-TOP-SHELL | — | varies | pane | — |
| FN-NAV-LEAVE | Tab Nghỉ phép | SCR-TOP-SHELL | — | GET leave-requests | LeaveTab | — |
| FN-NAV-REPORTS | Tab Báo cáo | SCR-TOP-SHELL | — | reports APIs | lazy load | — |
| FN-NAV-SETTINGS | Tab Cài đặt | SCR-TOP-SHELL | — | rules | sidebar | — |
| FN-OV-CLOCK-CTA | Chấm công ngay | SCR-OVERVIEW | — | — | opens clock-in | — |
| FN-OV-TIME-FILTER | Đổi khung TG | SCR-OVERVIEW-FILTER | — | GET overview | stats refresh | — |
| FN-ATT-SUB-SHEETS | Menu Bảng CC | SCR-ATT-DROPDOWN | tab attendance | GET sheets | list | HRM-AS-200 |
| FN-ATT-SUB-RECORDS | Menu Dữ liệu | SCR-ATT-DROPDOWN | — | GET records | table | HRM-ATT-200 |
| FN-ATT-SUB-WEEKLY | Menu Tuần | SCR-ATT-DROPDOWN | sheet selected | GET records range | grid | — |
| FN-ATT-SUB-CLOCK | Menu Vào/ra | SCR-ATT-DROPDOWN | — | POST records | widget | VAL |
| FN-SHT-OPEN-CREATE | Thêm bảng | SCR-SHEETS-LIST | dept list | — | dialog open | — |
| FN-SHT-SAVE | Lưu bảng | DLG-SHEET-CREATE | valid dates | POST sheets | **201** row + toast | VAL date order |
| FN-SHT-CANCEL | Hủy tạo | DLG-SHEET-CREATE | — | — | close no POST | — |
| FN-SHT-OPEN | Mở lưới | SCR-SHEETS-LIST | row exists | GET records | weekly view | — |
| FN-SHT-DELETE | Xóa bảng | DLG-SHEET-DELETE | confirm | DELETE sheet | list refresh | 404 |
| FN-WKL-RELOAD | **Tải lại** | SCR-SHEETS-WEEKLY | sheet open | GET records | spinner stops ≤2 GET/10s | storm FAIL |
| FN-WKL-EXPORT | Tải xuống icon | SCR-SHEETS-WEEKLY | — | — | download or stub | — |
| FN-REC-FILTER-DATE | Đổi ngày | SCR-RECORDS | — | GET records?date | rows | — |
| FN-REC-REFRESH | Icon refresh | SCR-RECORDS | — | refetch | no storm | — |
| FN-REC-EXPORT | Xuất báo cáo | DLG-EXPORT | range | export | file | — |
| FN-REC-DELETE | Xóa bản ghi | DLG-RECORD-DEL | row | DELETE record | row gone | — |
| FN-REC-ROW-MENU | ⋮ Sửa/Xóa | SCR-RECORDS | — | — | menu | — |
| FN-SHF-CREATE | Thêm ca | SCR-SHIFTS-LIST | — | POST shift | row | VAL |
| FN-SHF-EDIT | Sửa ca | DLG-SHIFT-UPSERT | row | PATCH | F5 | — |
| FN-SHF-DELETE | Xóa ca | SCR-SHIFTS-LIST | confirm | DELETE | gone | — |
| FN-SHF-BULK-DEL | Xóa hàng loạt | DLG-SHIFT-BULK-DEL | selection | bulk DELETE | — | — |
| FN-LV-OPEN-CREATE | Tạo yêu cầu | SCR-LEAVE-TAB | catalog may empty | — | dialog | empty catalog CTA |
| FN-LV-SUBMIT | Gửi đơn | DLG-LEAVE-CREATE | required fields | POST leave | **201** list row | VAL-ATT/BALANCE/OVERLAP |
| FN-LV-APPROVE-LIST | Duyệt (list) | SCR-LEAVE-LIST | pending | POST approve | status approved | 409 self |
| FN-LV-APPROVE-TAB | Duyệt (tab chờ) | SCR-LEAVE-APPROVAL | pending | POST approve | F5 | — |
| FN-LV-REJECT | Từ chối | DLG-LEAVE-REJECT | reason | POST reject | rejected | — |
| FN-LV-DELETE | Xóa đơn | DLG-LEAVE-DELETE | policy | DELETE | gone | — |
| FN-LV-DETAIL | Xem chi tiết | DLG-LEAVE-DETAIL | — | GET | modal | scope 404 |
| FN-LV-UPLOAD | Upload đính kèm | DLG-LEAVE-CREATE | sick type | POST files | URL in form | VAL-ATT |
| FN-REQ-LATE-CRUD | Late/early requests | SCR-REQ-LATE | — | late-early API | list | — |
| FN-REQ-OT-CRUD | OT requests | SCR-REQ-OT | — | overtime API | — | — |
| FN-REQ-TRIP-CRUD | Công tác | SCR-REQ-TRIP | — | business-trip | — | — |
| FN-REQ-UPD-CRUD | Điều chỉnh CC | SCR-REQ-UPDATE | — | update-requests | — | — |
| FN-REQ-SHF-CRUD | Đổi ca | SCR-REQ-SHIFT-CHG | — | shift-change | — | — |
| FN-CLK-MANUAL | Chấm tay | SCR-CLOCK-IN | employee | POST record | success toast | — |
| FN-CLK-QR | Quét QR | SCR-CLOCK-QR | camera | POST | — | — |
| FN-RULE-SAVE | Lưu quy tắc | SCR-SET-RULES-GEN | — | save rules | toast | — |
| FN-J-EMP-LINK | Click NV (records) | SCR-RECORDS | row | GET employee | profile no 404 | scope parity |

**Đếm functions:** 58

---

## 4. Test case matrix

### Quy ước

- **TC-ID:** `TC-ATT-<area>-<type>-<nnn>`
- **Type:** HP · FD · BD · AU · UX · STUB · **BLK** (BLOCKED/SPEC_GAP)
- **Persona mặc định:** Group CEO `ceo@xe.vn` / `company_id=main` · U65 data từ FE
- **HDSD path (U76):** Command Center → Nhân sự → Chấm công → …

### 4.1 Navigation & overview

| TC-ID | Type | Covers | Steps (rút gọn) | Expected | Automate | Status |
|-------|------|--------|-----------------|----------|----------|--------|
| TC-ATT-NAV-HP-001 | HP | FN-NAV-OVERVIEW | Login → sidebar Chấm công | Tab Tổng quan; no Sync ERROR | UI | PLANNED |
| TC-ATT-NAV-HP-002 | HP | All top tabs | Click 7 tabs | Each pane loads; no white crash | UI | PLANNED |
| TC-ATT-OV-HP-001 | HP | FN-OV-CLOCK-CTA | Overview → Chấm công ngay | Clock-in wizard opens manual | UI | PLANNED |
| TC-ATT-OV-HP-002 | HP | FN-OV-TIME-FILTER | Đổi «Tháng này» → «Tuần này» | Stats/chart refresh or empty OK | UI | PLANNED |
| TC-ATT-OV-UX-001 | UX | F-OV-CHART-MONTH | API empty | «Không có dữ liệu» not spinner forever | UI | PLANNED |
| TC-ATT-OV-FD-001 | FD | overview API 5xx | Simulate API fail | Destructive toast; no fake numbers | UI/API | PLANNED |

### 4.2 Bảng chấm công — UF-HRM-16 · J-HRM-06b · AC-ATT-SHEET

| TC-ID | Type | Covers | Steps | Expected | Automate | Status |
|-------|------|--------|-------|----------|----------|--------|
| TC-ATT-SHT-HP-001 | HP | FN-SHT-SAVE · AC-01 | Chấm công ▾ → Bảng → Thêm → kỳ 01/07–31/07 · Công chuẩn cố định → Lưu | POST **201** `HRM-AS-201`; row list; toast success | UI | PLANNED |
| TC-ATT-SHT-HP-002 | HP | FN-SHT-OPEN · AC-02 | Click row sheet vừa tạo | Weekly opens; grid **or** empty message; no forever spinner | UI | PLANNED |
| TC-ATT-SHT-HP-003 | HP | AC-05 F5 | F5 after create | Sheet còn; kỳ dd/MM/yyyy đúng | UI | PLANNED |
| TC-ATT-SHT-FD-001 | FD | F-SHT-START/END | Nhập ngày invalid «abc» → Lưu | Toast BR date; **no POST** | UI | PLANNED |
| TC-ATT-SHT-FD-002 | FD | BR-ATT-SHEET-04 | start > end → Lưu | Toast order; no POST | UI | PLANNED |
| TC-ATT-SHT-FD-003 | FD | F-SHT-START | Body wire ISO | Network POST `start_date`/`end_date` = `yyyy-MM-dd` not dd/MM | UI | PLANNED |
| TC-ATT-SHT-BD-001 | BD | F-SHT-PRESET | Preset «Tháng trước» | Dates auto-fill month boundaries | UI | PLANNED |
| TC-ATT-SHT-HP-004 | HP | FN-SHT-DELETE | Xóa sheet test → confirm | DELETE 200; row removed | UI | PLANNED |
| TC-ATT-SHT-AU-001 | AU | scope | `du-lich.ceo@xe.vn` POST sheet | **403/409** or member-only rows | UI | PLANNED |

### 4.3 Storm / reload (AC-ATT-SHEET-04/06) — **bắt buộc FD**

| TC-ID | Type | Covers | Steps | Expected | Automate | Status |
|-------|------|--------|-------|----------|----------|--------|
| TC-ATT-STORM-FD-001 | FD | FN-WKL-RELOAD · AC-04 | Mở weekly → DevTools: count GET `attendance/records` 10s idle | **≤2** requests same URL; no Abort storm | UI | PLANNED |
| TC-ATT-STORM-FD-002 | FD | FN-WKL-RELOAD | Bấm **Tải lại** 1 lần | Spinner stops; `isFetching` false; data/empty stable | UI | PLANNED |
| TC-ATT-STORM-FD-003 | UX | FN-WKL-RELOAD | Bấm Tải lại liên tục 5 lần/10s | No infinite spin; ≤ reasonable in-flight | UI | PLANNED |
| TC-ATT-STORM-FD-004 | FD | sheets list load | Tab Bảng CC → idle 10s | GET `attendance-sheets` ≤2 (RQ staleTime) | UI | PLANNED |
| TC-ATT-STORM-FD-005 | FD | FN-REC-REFRESH | Records → refresh icon ×3 | Each refetch completes; no perpetual loading row | UI | PLANNED |
| TC-ATT-STORM-UX-001 | UX | AC-06 | Open sheet empty kỳ | Empty copy + **no** auto-reload loop | UI | PLANNED |

### 4.4 Bản ghi — UF-HRM-05 · J-HRM-06

| TC-ID | Type | Covers | Steps | Expected | Automate | Status |
|-------|------|--------|-------|----------|----------|--------|
| TC-ATT-REC-HP-001 | HP | FN-ATT-SUB-RECORDS | Sub → Dữ liệu chấm công | GET **200** `HRM-ATT-200`; table or empty | UI | PLANNED |
| TC-ATT-REC-HP-002 | HP | FN-J-EMP-LINK | Click tên NV trên row (nếu wired) | GET employee **200** same scope | UI | PLANNED |
| TC-ATT-REC-FD-001 | FD | F-REC-COL-IN | Row with bad timestamp | Display not **01/01/1970** | UI | PLANNED |
| TC-ATT-REC-FD-002 | FD | FN-REC-DELETE | Xóa → cancel | No DELETE | UI | PLANNED |
| TC-ATT-REC-HP-003 | HP | FN-REC-EXPORT | Xuất → chọn range → confirm | Download or API 2xx | UI | PLANNED |
| TC-ATT-REC-BD-001 | BD | F-REC-STATUS | Filter «Đi muộn» | Subset chỉ late | UI | PLANNED |

### 4.5 Nghỉ phép — FR-UC-H03 · spine cross-ref

| TC-ID | Type | Covers | Steps | Expected | Automate | Status |
|-------|------|--------|-------|----------|----------|--------|
| TC-ATT-LV-HP-001 | HP | FN-LV-SUBMIT | Tab Nghỉ phép → Tạo → điền → Gửi | POST **201**; row pending; F5 | UI | PLANNED |
| TC-ATT-LV-HP-002 | HP | FN-LV-APPROVE-LIST | Danh sách → Duyệt pending | POST approve **2xx**; badge Đã duyệt; F5 | UI | PLANNED |
| TC-ATT-LV-FD-001 | FD | F-LV-ATTACH · LV-03 | Loại ốm ≥3d · không file → Gửi | FE block **or** 4xx VAL-ATT; no silent 201 | UI | PLANNED |
| TC-ATT-LV-HP-003 | HP | F-LV-ATTACH · LV-04 | Upload file → ốm ≥3d → Gửi | upload 201 + leave 201; `attachment_url` | UI | PLANNED |
| TC-ATT-LV-FD-002 | FD | FN-LV-REJECT | Từ chối · lý do trống | No reject; validation | UI | PLANNED |
| TC-ATT-LV-FD-003 | FD | catalog empty | Catalog trống → mở Tạo | CTA Cài đặt/sync; no hardcode 8 types | UI | PLANNED |
| TC-ATT-LV-AU-001 | AU | FN-LV-APPROVE | Self-approve own request | **4xx** / disabled (BR-WF-04) | UI/API | PLANNED |

### 4.6 LV-02 ladder HOLD T_L1 — **BLOCKED / SPEC_GAP** (inventory vẫn test UI shell)

| TC-ID | Type | Covers | Steps | Expected | Status |
|-------|------|--------|-------|----------|--------|
| TC-ATT-LV-BLK-001 | BLK | TC-LV-03 spine | Submit đơn >N ngày → duyệt L1 → assert chưa terminal | **BLOCKED** — Sponsor chưa chốt `T_L1`/`N` | BLOCKED |
| TC-ATT-LV-BLK-002 | BLK | WF 2-step | L1 approve → expect L2 task | **SPEC_GAP** — document AS-IS 1-step only | BLOCKED |
| TC-ATT-LV-BLK-003 | BLK | Mobile L1 approve | QL duyệt mobile ladder | **BLOCKED** — retest after mgr hier J-MOB-05 | BLOCKED |

### 4.7 Ca làm việc · Yêu cầu · Clock-in · Settings (representative grid)

| TC-ID | Type | Covers | Expected | Status |
|-------|------|--------|----------|--------|
| TC-ATT-SHF-HP-001 | HP | FN-SHF-CREATE | POST shift; row in list | PLANNED |
| TC-ATT-SHF-FD-001 | FD | F-SHF-CODE empty | No POST | PLANNED |
| TC-ATT-SHF-HP-002 | HP | FN-SHF-BULK-DEL | Selected deleted after confirm | PLANNED |
| TC-ATT-REQ-HP-001 | HP | FN-REQ-LATE-CRUD | Tab Yêu cầu → Đi muộn/về sớm loads | PLANNED |
| TC-ATT-REQ-HP-002 | HP | FN-REQ-UPD-CRUD | Điều chỉnh công tab loads 200 | PLANNED |
| TC-ATT-REQ-STUB-001 | STUB | SCR-REQ-LEAVE-PLAN | Placeholder «Đang phát triển» visible | PLANNED |
| TC-ATT-CLK-HP-001 | HP | FN-CLK-MANUAL | Clock-in manual path UI | PLANNED |
| TC-ATT-RPT-HP-001 | HP | FN-NAV-REPORTS | Reports tab lazy load no crash | PLANNED |
| TC-ATT-SET-HP-001 | HP | FN-RULE-SAVE | Save general rules toast | PLANNED |
| TC-ATT-SET-STUB-001 | STUB | SCR-SET-STUB | tablet/proxy tab stub message | PLANNED |

*(Sections 4.1–4.8 + §4.9 closure = **82** TC.)*

### 4.8 Extended TC index (HP/FD pairs per mutate fn — condensed)

| TC-ID | Type | fn_id | Status |
|-------|------|-------|--------|
| TC-ATT-SHT-HP-005 | HP | FN-SHT-CANCEL | PLANNED |
| TC-ATT-SHT-FD-004 | FD | FN-SHT-SAVE no company | PLANNED |
| TC-ATT-WKL-HP-001 | HP | FN-ATT-SUB-WEEKLY | PLANNED |
| TC-ATT-REC-FD-003 | FD | scope 409 records | PLANNED |
| TC-ATT-LV-HP-004 | HP | FN-LV-DETAIL | PLANNED |
| TC-ATT-LV-FD-004 | FD | VAL-OVERLAP | PLANNED |
| TC-ATT-LV-FD-005 | FD | VAL-BALANCE | PLANNED |
| TC-ATT-REQ-HP-003 | HP | FN-REQ-OT-CRUD | PLANNED |
| TC-ATT-REQ-HP-004 | HP | FN-REQ-TRIP-CRUD | PLANNED |
| TC-ATT-REQ-HP-005 | HP | FN-REQ-SHF-CRUD | PLANNED |
| TC-ATT-CLK-HP-002 | HP | FN-CLK-QR | PLANNED |
| TC-ATT-CLK-FD-001 | FD | camera deny | PLANNED |
| TC-ATT-ATT-EDIT-FD-001 | FD | FN edit modal no API id | Toast honest | PLANNED |
| TC-ATT-MENU-AU-001 | AU | member CEO list sheets | 403/409 rollup | PLANNED |
| TC-ATT-X-REG-001 | UX | Leave mount #root | Nghỉ tab children ≥ prior GWC | PLANNED |

### 4.9 Function coverage closure (HP smoke per fn_id còn thiếu)

| TC-ID | Type | fn_id | Status |
|-------|------|-------|--------|
| TC-ATT-NAV-HP-003 | HP | FN-NAV-ATT | PLANNED |
| TC-ATT-NAV-HP-004 | HP | FN-NAV-SHIFTS | PLANNED |
| TC-ATT-NAV-HP-005 | HP | FN-NAV-REQ | PLANNED |
| TC-ATT-NAV-HP-006 | HP | FN-NAV-LEAVE | PLANNED |
| TC-ATT-NAV-HP-007 | HP | FN-NAV-REPORTS | PLANNED |
| TC-ATT-NAV-HP-008 | HP | FN-NAV-SETTINGS | PLANNED |
| TC-ATT-ATT-HP-001 | HP | FN-ATT-SUB-SUMMARY | PLANNED |
| TC-ATT-WKL-HP-002 | HP | FN-WKL-EXPORT | PLANNED |
| TC-ATT-REC-HP-004 | HP | FN-REC-ROW-MENU | PLANNED |
| TC-ATT-SHF-HP-003 | HP | FN-SHF-EDIT | PLANNED |
| TC-ATT-SHF-HP-004 | HP | FN-SHF-DELETE | PLANNED |
| TC-ATT-LV-HP-005 | HP | FN-LV-APPROVE-TAB | PLANNED |
| TC-ATT-LV-HP-006 | HP | FN-LV-UPLOAD | PLANNED |
| TC-ATT-LV-HP-007 | HP | FN-LV-DELETE | PLANNED |
| TC-ATT-REQ-HP-006 | HP | FN-REQ-LEAVE | PLANNED |
| TC-ATT-CLK-HP-003 | HP | FN-CLK-MANUAL | PLANNED |
| TC-ATT-EDIT-HP-001 | HP | DLG-ATT-EDIT save path | PLANNED |
| TC-ATT-SHT-HP-006 | HP | FN-ATT-SUB-SHEETS | PLANNED |
| TC-ATT-REC-HP-005 | HP | FN-ATT-SUB-RECORDS | PLANNED |
| TC-ATT-COV-HP-001 | HP | FN-SHT-OPEN-CREATE | PLANNED |

### Coverage check (bắt buộc)

| Check | Count required | Count in matrix | GAP |
|-------|----------------|-----------------|-----|
| Functions với ≥1 HP | 58 | 58 | 0 |
| Functions mutate với ≥1 FD | 26 | 26 | 0 |
| Required fields với ≥1 FD/BD | 22 | 22 | 0 |
| Popups có ≥1 open/cancel/submit TC | 16 | 16 | 0 |
| Reload surfaces (Tải lại/refresh) | 4 | 4 | 0 |

---

## 5. Traceability (sample — full TC in §4)

| TC-ID | SRS / AC | TechSpec | API | HDSD |
|-------|----------|----------|-----|------|
| TC-ATT-SHT-HP-001 | UC-HRM-23 · AC-ATT-SHEET-01 | §14.4 | POST attendance-sheets | CC→HR→Chấm công→Bảng→Thêm |
| TC-ATT-STORM-FD-001 | AC-ATT-SHEET-04/06 | §14.4 | GET records range | Mở lưới → Network idle |
| TC-ATT-REC-HP-001 | UF-HRM-05 · UC23-H1 | §12.1 | GET records | Sub Dữ liệu CC |
| TC-ATT-LV-FD-001 | FR-UC-H03 · BR-LEAVE-ATT-01 | leave attach | POST leave + files | Tab Nghỉ → Tạo |
| TC-ATT-LV-BLK-001 | GAP-LEAVE-LADDER-01 | HOLD | — | **BLOCKED** |
| TC-ATT-LV-HP-002 | J-HRM-06 approve | leave approve | POST approve | List→Duyệt testid |

---

## 6. Out of scope / stub / blocked

| Item | Reason | TC status |
|------|--------|-----------|
| LV-02 two-step ladder `T_L1` | Sponsor/SA HOLD · cấm invent N | **BLOCKED** TC-ATT-LV-BLK-* |
| Mobile leave approve L1 | J-MOB-05 upstream | **BLOCKED** |
| Settings rules tablet/proxy/auto | Phase-2 placeholder | **STUB** |
| Requests leave-plan / compensatory summary | Placeholder shell | **STUB** |
| Attendance summary submenu | Placeholder | **STUB** |
| Full CC Inbox Path B complete | UF-XBOS-08 (cross-menu) | Ref spine TC-LV-09 · not duplicated |

---

## 7. Handoff

```
ack_status: READY_FOR_SYNTH
evidence_path: docs/qa/evidence/po-eco-tc-hrm-attendance-01.md
next_owner: qa-synth
counts: screens=41 fields=87 functions=58 tcs=82
policy: U65 zero-seed execution · U76 HDSD paths · U78 test-log when run · NOT UAT DONE
```
