# Menu TC Pack — `HRM-DASHBOARD` · Tổng quan HRM (HRM Web)

| Meta | Value |
|------|--------|
| **menu_id** | `HRM-DASHBOARD` |
| **surface** | `hrm-web` |
| **route(s)** | `/` (standalone `/hr/` · embed `/command-center/hrm/dashboard`) |
| **HDSD** | Sidebar **Tổng quan** (MENU-01) · Command Center → Nhân sự → **Dashboard** |
| **SRS / FR / UC** | **UC-HRM-20** · **BR-DQ-01** · **BR-EXEC-01** · **AC-HC-03** · UX-10 empty actionable |
| **TechSpec** | `docs/hrm/TECHSPEC.md` §11 embed · `HRM_MENU_DATA_LINKAGE_MATRIX.md` §2.1 dashboard |
| **API_CONTRACT** | `GET /api/hrm/employees/summary` · `GET …/attendance/overview` · `GET …/payroll/payslips` · `GET …/attendance/leave-requests` · `GET …/contracts-insurance/contracts/expiring` · `GET …/operations/reports/summary` (CC embed) · `POST …/attendance/leave-requests/{id}/approve` (nhắc việc) |
| **UF / J-*** | **UF-HRM-MENU-01** · **P-CC-HRM-DASH** · **J-HRM-MENU-SWEEP** (leaf load) |
| **Menu roster** | **MENU-01** — Wave B/C · `ECOSYSTEM_MENU_ROSTER.md` |
| **author** | qa · PO-ECO-TC-HRM-DASHBOARD-01 |
| **work_item_id** | `PO-ECO-TC-HRM-DASHBOARD-01` |
| **date** | 2026-08-03 |
| **ack_status** | **READY_FOR_SYNTH** |
| **depth_gate** | Screen inventory ☑ · Field dict ☑ · Function inv ☑ · TC matrix ☑ · Trace ☑ |

> Chuẩn: IEEE 829 / ISO 29119 lean · WORLD-STANDARD depth (`PO_ECOSYSTEM_TESTCASE_DEPTH_PROGRAM.md` §2). U65: dữ liệu từ FE — **cấm** seed trong execution. Dashboard **read-heavy**; mutate duy nhất trên màn: **Duyệt đơn nghỉ** (HrmApiReminders) + export PDF client-side.

---

## 1. Screen inventory (màn + popup)

| screen_id | Loại | Route / trigger | Mô tả | States |
|-----------|------|-----------------|-------|--------|
| SCR-DASH-SHELL | page | `/` · iframe CC dashboard | Layout chính + grid 2+1 cột | loading skeleton · success · partial empty |
| SCR-TOOLBAR | bar | Top | Chọn kỳ · menu xuất báo cáo | exporting spinner |
| MNU-EXPORT | dropdown | Nút Xuất báo cáo | Mục **Xuất PDF** | open/close |
| SCR-PORTAL-OPS | section | CC embed only | Card «Tổng quan HRM» 4 ô KPI | hidden standalone · loading «…» · error amber |
| SCR-EXPIRING | section | Auto khi có HĐ sắp hết hạn | Alert tối đa 5 dòng + Xem thêm | loading pulse · **hidden** khi 0 |
| SCR-QUICK-ACT | grid | 5 thẻ gradient | NV · TD · CC · Lương · Báo cáo | always render |
| SCR-PAYROLL-SUM | card | Cột trái | Tổng lương · thuế · BHXH ước tính | skeleton · **—** · values · **EmptyState** |
| SCR-CHART-SAL-RNG | chart | Bar ngang | Phân tích khoảng lương | empty CTA · chart |
| SCR-CHART-INCOME | chart | Donut | Cơ cấu thu nhập | empty · **Phase-2** bonus slices 0% |
| SCR-CHART-TREND | chart | Area | Thu nhập TB theo tháng | empty · chart |
| SCR-CHART-DEPT | chart | Bar dọc | TB thu nhập theo đơn vị | empty `dashboard-dept-salary-empty` · chart |
| SCR-COMPARE | card | So sánh kỳ | 4 KPI + summary box | salary **—** khi no aggregate |
| SCR-HR-STATS | card | Cột phải | Tổng / active / mới / số phòng ban | numbers from summary |
| SCR-PAY-FUND | card | Cột phải | Quỹ lương + link Chi tiết | compact money vi-VN |
| SCR-REMIND | card | Cột phải | Pending leave banner · HrmApiReminders · NV mới · HĐ inline | partial hidden |
| SCR-EMPTY-PAY | inline | `data-testid=dashboard-payroll-chart-empty` | EmptyState → Lương | no fake 0 VNĐ |
| SCR-EMPTY-DEPT | inline | `dashboard-dept-salary-empty` | EmptyState dept chart | — |
| SCR-EMPTY-NEWEMP | inline | `dashboard-newest-employees-empty` | EmptyState → Nhân sự | — |
| BLK-HRM-REMIND | block | `HrmApiReminders` | Inbox + duyệt đơn | hidden khi thiếu employeeId |

**Đếm:** pages=1 · sections=12 · dropdowns=1 · inline empty=3 · confirms=0

---

## 2. Field dictionary (đủ mọi trường)

### 2.1 Toolbar & period

| field_id | UI label (VI) | screen_id | control | req | validation / BR | API | format |
|----------|---------------|-----------|---------|-----|-----------------|-----|--------|
| F-PERIOD-SEL | Kỳ dữ liệu | SCR-TOOLBAR | Select week/month/quarter/year | N | client-only charts | — | enum |
| F-PERIOD-LBL | Hiển thị dữ liệu | SCR-DASH-SHELL | text | — | sync `selectedPeriod` | — | VI label |
| F-PERIOD-BADGE | Badge ngắn (7 ngày…) | SCR-DASH-SHELL | badge | — | — | — | text |
| F-EXPORT-BTN | Xuất báo cáo | SCR-TOOLBAR | Button+Dropdown | N | disabled khi exporting | — | — |
| F-EXPORT-PDF | Xuất PDF | MNU-EXPORT | menu item | N | html2pdf client | — | file .pdf |

### 2.2 Portal operations (embed)

| field_id | UI label | screen_id | control | req | BR | API field |
|----------|----------|-----------|---------|-----|-----|-----------|
| F-OPS-EMP | Nhân sự | SCR-PORTAL-OPS | KPI tile | — | AC-HC-03 total | `employees/summary.total` |
| F-OPS-ATT | Chấm công | SCR-PORTAL-OPS | KPI tile | — | BR-DQ | `operations…attendance_records` |
| F-OPS-REC | Tuyển dụng | SCR-PORTAL-OPS | KPI tile | — | — | `job_requisitions` |
| F-OPS-PAY | Kỳ lương | SCR-PORTAL-OPS | KPI tile | — | — | `payroll_periods` |

### 2.3 Payroll summary & charts

| field_id | UI label | screen_id | control | req | validation / BR | API / derive | format |
|----------|---------------|-----------|---------|-----|-----------------|--------------|--------|
| F-PAY-TOTAL | Tổng lương | SCR-PAYROLL-SUM | display | — | BR-EXEC-01 no fake 0 | `payroll.total` | vi-VN compact |
| F-PAY-TAX | Thuế TNCN | SCR-PAYROLL-SUM | display | — | ~10% estimate | derived | VNĐ |
| F-PAY-INS | Bảo hiểm | SCR-PAYROLL-SUM | display | — | ~10.5% estimate | derived | VNĐ |
| F-CH-SAL-RNG | Khoảng lương (bar) | SCR-CHART-SAL-RNG | chart axis | — | BR-DQ-01 labels | `salary_ranges[]` | count |
| F-CH-INCOME | Cơ cấu thu nhập | SCR-CHART-INCOME | pie legend | — | **Phase-2** bonus 0% | derived | percent |
| F-CH-TREND | Thu nhập TB | SCR-CHART-TREND | area Y | — | month labels T1.. | avg from payroll | money tooltip |
| F-CH-DEPT | TB theo đơn vị | SCR-CHART-DEPT | bar X dept | — | strip «Phòng » | `by_department.avg_salary` | money |

### 2.4 Comparison & HR stats

| field_id | UI label | screen_id | control | req | BR | source |
|----------|----------|-----------|---------|-----|-----|--------|
| F-CMP-EMP | Nhân sự (kỳ này/trước) | SCR-COMPARE | stat | — | — | summary + new_hires |
| F-CMP-SAL | Tổng lương compare | SCR-COMPARE | stat | — | prev **approx 0.95** Phase-2 | payroll |
| F-CMP-ATT | Tỷ lệ chấm công | SCR-COMPARE | percent | — | overview proxy | attendance overview |
| F-CMP-LEAVE | Ngày nghỉ | SCR-COMPARE | count | — | filter leave by period | leave-requests |
| F-STAT-TOTAL | Tổng nhân viên | SCR-HR-STATS | number | — | AC-HC-03 | `total` |
| F-STAT-ACTIVE | Đang làm việc | SCR-HR-STATS | number | — | AC-HC-03 | `active_count` |
| F-STAT-NEW | Nhân viên mới | SCR-HR-STATS | number | — | 30d | `new_hires.last_30_days` |
| F-STAT-DEPT | Số phòng ban | SCR-HR-STATS | number | — | — | `by_department.length` |

### 2.5 Pay fund · expiring · reminders

| field_id | UI label | screen_id | control | req | BR | format |
|----------|----------|-----------|---------|-----|-----|--------|
| F-FUND-AMT | Quỹ lương tháng | SCR-PAY-FUND | money | — | compact | vi-VN |
| F-FUND-COUNT | Số NV · phiếu lương | SCR-PAY-FUND | text | — | payslip list len | number |
| F-EXP-NAME | Tên NV (alert) | SCR-EXPIRING | link row | — | label not raw key | text |
| F-EXP-CODE | Mã HĐ | SCR-EXPIRING | badge | — | — | text |
| F-EXP-TYPE | Loại HĐ | SCR-EXPIRING | text | — | `resolveContractTypeDisplayLabel` | VI |
| F-EXP-DATE | Ngày hết hạn | SCR-EXPIRING | text | — | not 1970 | dd/MM/yyyy |
| F-EXP-URGENCY | Còn X ngày | SCR-EXPIRING | badge | — | ≤7 red | VI |
| F-REM-PEND-CNT | Đơn nghỉ chờ | SCR-REMIND | banner | — | status pending | count |
| F-REM-INBOX | Thông báo gần đây | BLK-HRM-REMIND | list | — | event_type map | datetime vi-VN |
| F-REM-LEAVE-ROW | Dòng duyệt | BLK-HRM-REMIND | row | — | leave_type catalog label | text |
| F-REM-APPROVE | Duyệt | BLK-HRM-REMIND | Button | N | reviewer from profile | action |
| F-NEW-EMP-NAME | NV mới nhất | SCR-REMIND | avatar row | — | max 3 | text |
| F-NEW-EMP-CODE | Mã NV | SCR-REMIND | subtext | — | — | HLD-#### |

### 2.6 Quick actions (display-only)

| field_id | UI label | screen_id | href |
|----------|----------|-----------|------|
| F-QA-EMP | Quản lý nhân sự | SCR-QUICK-ACT | `/employees` |
| F-QA-REC | Tuyển dụng | SCR-QUICK-ACT | `/recruitment` |
| F-QA-ATT | Chấm công | SCR-QUICK-ACT | `/attendance` |
| F-QA-PAY | Tính lương | SCR-QUICK-ACT | `/payroll` |
| F-QA-RPT | Báo cáo | SCR-QUICK-ACT | `/reports` |

**Đếm fields:** 42

---

## 3. Function inventory (đủ mọi function)

| fn_id | UI (nút/menu) | screen_id | precond | API METHOD path | success FE+F5 | fail codes |
|-------|---------------|-----------|---------|-----------------|---------------|------------|
| FN-NAV-LOAD | Mở **Tổng quan** | SCR-DASH-SHELL | login CEO | GET summary + overview + payslips + leave + expiring | 200 spine; no Sync ERROR | 5xx banner |
| FN-PERIOD-CHANGE | Đổi kỳ (tuần/tháng…) | SCR-TOOLBAR | — | — (client) | compare + trend window đổi | — |
| FN-EXPORT-OPEN | Mở menu xuất | MNU-EXPORT | — | — | menu visible | — |
| FN-EXPORT-PDF | Xuất PDF | MNU-EXPORT | DOM mounted | — (html2pdf) | toast success · file download | toast error |
| FN-QA-NAV | Click thẻ quick action | SCR-QUICK-ACT | — | — | route `/employees`… | — |
| FN-OPS-LOAD | Tile CC embed | SCR-PORTAL-OPS | portal embed mode | GET operations/reports/summary | 4 tiles số | amber error text |
| FN-EXPIRING-SHOW | Render alert | SCR-EXPIRING | ≥1 expiring | GET …/contracts/expiring | ≤5 rows | hidden if 0 |
| FN-EXPIRING-ALL | Xem tất cả HĐ | SCR-EXPIRING | — | — | `/contracts` embed query | — |
| FN-EXPIRING-ROW | Click dòng HĐ | SCR-EXPIRING | row | GET employee optional | profile or contracts **no 404** | scope |
| FN-EXPIRING-MORE | Xem thêm (>5) | SCR-EXPIRING | >5 rows | — | contracts list | — |
| FN-PAY-EMPTY-CTA | CTA EmptyState lương | SCR-EMPTY-PAY | no salary aggregate | — | navigate `/payroll` | — |
| FN-DEPT-EMPTY-CTA | CTA dept empty | SCR-EMPTY-DEPT | no dept avg | — | `/payroll` | — |
| FN-NEWEMP-EMPTY-CTA | CTA NV mới | SCR-EMPTY-NEWEMP | recent empty | — | `/employees` | — |
| FN-PAY-LINK-DET | Chi tiết quỹ lương | SCR-PAY-FUND | — | — | `/payroll` | — |
| FN-PAY-LINK-MORE | Xem thêm lương | SCR-PAY-FUND | — | — | `/payroll` | — |
| FN-REMIND-APPROVE | **Duyệt** đơn nghỉ | BLK-HRM-REMIND | pending row · employeeId | POST …/leave-requests/{id}/approve | toast success · row gone refetch | 4xx toast |
| FN-CHART-TOOLTIP | Hover chart | SCR-CHART-* | has data | — | tooltip vi-VN money | — |
| FN-F5-PERSIST | F5 dashboard | SCR-DASH-SHELL | post load | same GETs | state consistent · no storm | RATE-429 |

**Đếm functions:** 18 (mutate: **FN-EXPORT-PDF**, **FN-REMIND-APPROVE**)

---

## 4. Test case matrix

### Quy ước

- **TC-ID:** `TC-DASH-<area>-<type>-<nnn>`
- **Type:** HP · FD · BD · AU · UX · **NET** (network spine) · **DQ** (data quality) · **BLK**
- **Persona mặc định:** Group CEO `ceo@xe.vn` / `Xevn@2026` · `company_id=main`
- **HDSD (U76):** Command Center → **Nhân sự** → mặc định tab **Tổng quan** · hoặc sidebar HRM **Tổng quan**

### 4.1 Load · UF-HRM-MENU-01 · P-CC-HRM-DASH · network spine

| TC-ID | Type | Covers | Precond | Steps (HDSD) | Expected | Layer | Status |
|-------|------|--------|---------|--------------|----------|-------|--------|
| TC-DASH-L-HP-001 | HP | FN-NAV-LOAD · UF-HRM-MENU-01 | L0 stack | Login → **Tổng quan** | `#root` mount; no HRM Sync ERROR | UI | PLANNED |
| TC-DASH-L-HP-002 | HP | P-CC-HRM-DASH | CC embed | CC → Nhân sự → dashboard iframe | URL `/command-center/hrm/dashboard`; same spine | UI | PLANNED |
| TC-DASH-NET-HP-001 | NET | FN-NAV-LOAD | DevTools | Load dashboard | `employees/summary` **200**; `attendance/overview` **200**; `payroll/payslips` **200**; `leave-requests` **200**; **cấm** storm `attendance/records` | UI | PLANNED |
| TC-DASH-NET-HP-002 | NET | FN-EXPIRING-SHOW | — | Network tab | ≤1 `contracts/expiring` (shared RQ key) | UI | PLANNED |
| TC-DASH-L-HP-003 | HP | FN-F5-PERSIST | post load | F5 | Same KPIs; no duplicate storm > baseline | UI | PLANNED |
| TC-DASH-L-FD-001 | FD | FN-NAV-LOAD | hrm-api down | Mở Tổng quan | Error surfaces; **cấm** mock tenant labels (BR-EXEC-01) | UI | PLANNED |
| TC-DASH-L-FD-002 | FD | scope | probe | GET summary wrong company | **409**; UI không fiction | API/UI | PLANNED |
| TC-DASH-L-AU-001 | AU | FN-NAV-LOAD | no token | Deep `/hr/` | Login redirect | UI | PLANNED |
| TC-DASH-L-UX-001 | UX | SCR-DASH-SHELL | slow API | Observe load | Payroll skeleton pulse then **—** or value; no «0 VNĐ» flash | UI | PLANNED |
| TC-DASH-OPS-HP-001 | HP | FN-OPS-LOAD | CC embed | Quan sát «Tổng quan HRM» | 4 tiles; GET `operations/reports/summary` **200** | UI | PLANNED |
| TC-DASH-OPS-FD-001 | FD | FN-OPS-LOAD | ops API fail | Embed load | Amber error text; tiles not fake | UI | PLANNED |
| TC-DASH-OPS-UX-001 | UX | SCR-PORTAL-OPS | standalone HRM | Open `/` not CC | Section **hidden** (not embed mode) | UI | PLANNED |

### 4.2 Period · comparison · data quality

| TC-ID | Type | Covers | Steps | Expected | Status |
|-------|------|--------|-------|----------|--------|
| TC-DASH-PER-HP-001 | HP | FN-PERIOD-CHANGE | Chọn **Quý này** | Badge + compare labels «Quý này / Quý trước» | PLANNED |
| TC-DASH-PER-HP-002 | HP | FN-PERIOD-CHANGE | Chọn **Năm nay** | Trend chart month count = 12 | PLANNED |
| TC-DASH-PER-HP-003 | HP | FN-PERIOD-CHANGE | Tuần → Tháng → F5 | Period persists reasonable | PLANNED |
| TC-DASH-CMP-HP-001 | HP | F-CMP-ATT | Có overview | Compare attendance % hiển thị | PLANNED |
| TC-DASH-CMP-HP-002 | HP | F-CMP-LEAVE | Có leave trong kỳ | Leave count ≥0 integer | PLANNED |
| TC-DASH-CMP-UX-001 | UX | F-CMP-SAL | No salary aggregate | Compare salary shows **—** not 0 | PLANNED |
| TC-DASH-DQ-HP-001 | DQ | AC-HC-03 | summary loaded | «Tổng NV» ≠ «Đang làm việc» when archived exist | PLANNED |
| TC-DASH-DQ-FD-001 | DQ | BR-DQ-01 | chart dept axis | No `1OFFICE` / mock tenant in DOM | PLANNED |
| TC-DASH-DQ-FD-002 | DQ | VAL-DQ-02 | grep policy | Dashboard charts API-backed or empty | PLANNED |

### 4.3 Payroll empty · charts · Phase-2 income stub

| TC-ID | Type | Covers | Steps | Expected | Status |
|-------|------|--------|-------|----------|--------|
| TC-DASH-PAY-HP-001 | HP | F-PAY-TOTAL | NV có lương aggregate | Compact VNĐ + tax/insurance columns | PLANNED |
| TC-DASH-PAY-UX-001 | UX | SCR-EMPTY-PAY | `employees_with_salary=0` U65 | `dashboard-payroll-chart-empty` + CTA Lương | PLANNED |
| TC-DASH-PAY-HP-002 | HP | FN-PAY-EMPTY-CTA | Click CTA empty | Navigate `/payroll` | PLANNED |
| TC-DASH-CH-HP-001 | HP | F-CH-SAL-RNG | has aggregate | Bar chart ranges + footer count | PLANNED |
| TC-DASH-CH-UX-001 | UX | F-CH-INCOME | has aggregate | Pie shows base 100%; bonus/allowance **0%** documented Phase-2 | PLANNED |
| TC-DASH-CH-HP-002 | HP | F-CH-TREND | has aggregate | Area tooltip full VNĐ format | PLANNED |
| TC-DASH-CH-HP-003 | HP | F-CH-DEPT | dept avg >0 | Bar chart labels from `by_department` | PLANNED |
| TC-DASH-CH-UX-002 | UX | SCR-EMPTY-DEPT | no dept salary | `dashboard-dept-salary-empty` | PLANNED |
| TC-DASH-CH-UX-003 | UX | FN-CHART-TOOLTIP | hover bar | Tooltip vi-VN; no crash | PLANNED |

### 4.4 Quick actions · pay fund · HR stats

| TC-ID | Type | Covers | Steps | Expected | Status |
|-------|------|--------|-------|----------|--------|
| TC-DASH-QA-HP-001 | HP | F-QA-EMP | Click NV card | `/employees` load | PLANNED |
| TC-DASH-QA-HP-002 | HP | F-QA-REC | Click TD | `/recruitment` | PLANNED |
| TC-DASH-QA-HP-003 | HP | F-QA-ATT | Click CC | `/attendance` | PLANNED |
| TC-DASH-QA-HP-004 | HP | F-QA-PAY | Click Lương | `/payroll` | PLANNED |
| TC-DASH-QA-HP-005 | HP | F-QA-RPT | Click BC | `/reports` | PLANNED |
| TC-DASH-FUND-HP-001 | HP | FN-PAY-LINK-DET | Click Chi tiết | `/payroll` | PLANNED |
| TC-DASH-FUND-HP-002 | HP | F-FUND-COUNT | có payslips | Text shows «· N phiếu lương» | PLANNED |
| TC-DASH-STAT-HP-001 | HP | F-STAT-* | summary 200 | Four stats match API numbers | PLANNED |

### 4.5 Expiring contracts · cross-nav

| TC-ID | Type | Covers | Steps | Expected | Status |
|-------|------|--------|-------|----------|--------|
| TC-DASH-EXP-HP-001 | HP | FN-EXPIRING-SHOW | HĐ trong 30d (tạo từ FE HĐ) | Alert visible ≤5 | PLANNED |
| TC-DASH-EXP-UX-001 | UX | FN-EXPIRING-SHOW | 0 expiring | Section **absent** (not empty card) | PLANNED |
| TC-DASH-EXP-HP-002 | HP | F-EXP-DATE | row visible | dd/MM/yyyy ≠ 01/01/1970 | PLANNED |
| TC-DASH-EXP-HP-003 | HP | FN-EXPIRING-ROW | click row có employee_id | `/employees/{id}` **200** | PLANNED |
| TC-DASH-EXP-HP-004 | HP | FN-EXPIRING-ALL | Xem tất cả | `/contracts` | PLANNED |
| TC-DASH-EXP-HP-005 | HP | FN-EXPIRING-MORE | >5 contracts | Ghost button count | PLANNED |

### 4.6 Reminders · approve leave (mutate) · newest employees

| TC-ID | Type | Covers | Steps (HDSD) | Expected | Status |
|-------|------|--------|--------------|----------|--------|
| TC-DASH-REM-UX-001 | UX | BLK-HRM-REMIND | CEO no employeeId mapping | Block hidden | PLANNED |
| TC-DASH-REM-HP-001 | HP | F-REM-PEND-CNT | pending leave exists | Amber banner count | PLANNED |
| TC-DASH-REM-HP-002 | HP | FN-REMIND-APPROVE | Tạo đơn nghỉ FE → pending on dashboard | **Duyệt** → POST approve **2xx**; toast; row removed | PLANNED |
| TC-DASH-REM-FD-001 | FD | FN-REMIND-APPROVE | approve invalid id / 409 | Toast error; no silent success | PLANNED |
| TC-DASH-REM-HP-003 | HP | F-REM-LEAVE-ROW | catalog leave types | Label catalog not raw key | PLANNED |
| TC-DASH-NEW-HP-001 | HP | F-NEW-EMP-* | recent hires in summary | Up to 3 rows | PLANNED |
| TC-DASH-NEW-UX-001 | UX | SCR-EMPTY-NEWEMP | no recent | `dashboard-newest-employees-empty` + CTA | PLANNED |
| TC-DASH-NEW-HP-002 | HP | FN-NEWEMP-EMPTY-CTA | Click CTA | `/employees` | PLANNED |

### 4.7 Export PDF

| TC-ID | Type | Covers | Steps | Expected | Status |
|-------|------|--------|-------|----------|--------|
| TC-DASH-EXP-PDF-HP-001 | HP | FN-EXPORT-PDF | Xuất báo cáo → PDF | toast success; `.pdf` downloaded | PLANNED |
| TC-DASH-EXP-PDF-FD-001 | FD | FN-EXPORT-PDF | Block html2pdf (offline) | toast error; `isExporting` reset | PLANNED |
| TC-DASH-EXP-PDF-UX-001 | UX | FN-EXPORT-OPEN | Open menu cancel | No download | PLANNED |

### 4.8 Member scope · menu sweep

| TC-ID | Type | Covers | Steps | Expected | Status |
|-------|------|--------|-------|----------|--------|
| TC-DASH-AU-HP-001 | AU | member CEO | `du-lich.ceo@xe.vn` | Dashboard load scoped counts · no holding rollup leak | PLANNED |
| TC-DASH-SWP-HP-001 | HP | J-HRM-MENU-SWEEP | MENU-01 first leaf | Pass load criteria UF-HRM-MENU-01 | PLANNED |

**Coverage check:**

| Check | Required | In matrix | GAP |
|-------|----------|-----------|-----|
| Functions ≥1 HP | 18 | 18 | 0 |
| Mutate fn ≥1 FD | 2 | 2 | 0 |
| Required fields ≥1 FD/BD | 0 required inputs | N/A | 0 |
| Dropdown export ≥1 open/submit | 1 | TC-DASH-EXP-PDF-* | 0 |
| P-CC-HRM-DASH spine | 4 GETs | TC-DASH-NET-HP-001 | 0 |

**Tổng TC:** 54 (53 PLANNED + 1 BLK note in §6)

---

## 5. Traceability

| TC-ID | SRS / UC | TechSpec | API | HDSD |
|-------|----------|----------|-----|------|
| TC-DASH-L-HP-001 | UC-HRM-20 · UF-HRM-MENU-01 | §11 embed | summary spine | Sidebar Tổng quan |
| TC-DASH-L-HP-002 | UC-HRM-20 · P-CC-HRM-DASH | linkage §2.1 | same | CC Nhân sự dashboard |
| TC-DASH-NET-HP-001 | D-HRM-DASH-NET-01 | network audit | 4 spine GETs | DevTools |
| TC-DASH-DQ-HP-001 | AC-HC-03 · BR-DQ | HRM_DASHBOARD_DATA_QUALITY_RULES | employees/summary | Stats card |
| TC-DASH-PAY-UX-001 | UX-10 · BR-EXEC-01 | — | payroll aggregate | Empty honesty |
| TC-DASH-REM-HP-002 | UF-HRM-05 adjacency | leave approve | POST approve | Nhắc việc |
| TC-DASH-EXP-HP-003 | J-HRM-03 adjacency | contracts | GET employee | Expiring row |
| TC-DASH-CH-UX-001 | Phase-2 income mix | — | derived pie | Chart stub |

**Prior runtime (cite only — no re-run):** `PILOT_BUSINESS_FLOW_MATRIX.md` P-CC-HRM-DASH PASS 2026-07-31 · `qa-hrm-dash-net-01-verify-20260730.md` · menu sweep MENU-01 · `d-dash-fe-storm-20260717.md`

---

## 6. Out of scope / stub / blocked

| Item | Reason | TC tag |
|------|--------|--------|
| Income KPI/bonus/allowance pie slices | Phase-2 payroll mix | **STUB** · TC-DASH-CH-UX-001 |
| Historical payroll compare (prev salary ×0.95) | No payroll history table | **Phase-2** · TC-DASH-CMP-UX-001 note |
| Export Excel/CSV | UI chỉ PDF | **OOS** |
| Dashboard mutate NV/HĐ/payroll | Menus khác | **OOS** — cross-ref packs |
| Mobile Home dashboard | MOB-HOME pack | **OOS** |
| Seed dashboard density | U65 | **Cấm** execution |
| AI/Tasks widgets on `/` | Other menus | **OOS** |
| LV-02 ladder HOLD | Sponsor ladder | SPEC_GAP on execution |

---

## 7. Handoff

```
ack_status: READY_FOR_SYNTH
evidence_path: docs/qa/evidence/po-eco-tc-hrm-dashboard-01.md
work_item_id: PO-ECO-TC-HRM-DASHBOARD-01
next_owner: qa-synth
counts: screens=19 fields=42 functions=18 tcs=54
policy: U65 zero-seed execution · U76 HDSD paths · NOT UAT DONE
```
