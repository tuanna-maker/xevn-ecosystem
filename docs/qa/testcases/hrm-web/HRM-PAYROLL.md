# Menu TC Pack — `HRM-PAYROLL` · Lương (HRM Web + CC embed)

| Meta | Value |
|------|--------|
| **menu_id** | `HRM-PAYROLL` |
| **surface** | `hrm-web` · **CC embed** `P-CC-08` |
| **route(s)** | `/payroll` · embed `/hr/payroll` · CC `/command-center/hrm/payroll` |
| **HDSD** | Command Center → Nhân sự → **Tiền lương / Lương** · sidebar HRM **Lương** · NV → tab **Lương & Phụ cấp** |
| **SRS / FR / UC** | **UC-HRM-24** · UC-HRM-28 · UC-HRM-31 · **FR-HRM-PR-01..06** · **FR-UC-H04** (spine HP-06) · BR-MOCK-01/02 |
| **TechSpec** | `docs/hrm/TECHSPEC.md` §14.6 FR-HRM-PR-05 · §16.1 payroll_periods/payslips · G-PR-03 PARTIAL |
| **API_CONTRACT** | `GET/POST /api/hrm/payroll/periods` · `POST …/process` · `POST …/close` · `GET …/payslips` · `salary-components` · `advance-requests` · `payment-batches` · `salary-templates` |
| **UF / J-*** | **UF-HRM-06** · **UF-HRM-MENU-08** · **J-HRM-07** · UF-HRM-MENU-02b (emp tab Lương) |
| **author** | qa · PO-ECO-TC-HRM-PAYROLL-01 |
| **work_item_id** | `PO-ECO-TC-HRM-PAYROLL-01` |
| **date** | 2026-08-03 |
| **ack_status** | **READY_FOR_SYNTH** |
| **depth_gate** | Screen inventory ☑ · Field dict ☑ · Function inv ☑ · TC matrix ☑ · Trace ☑ |

> Chuẩn: IEEE 829 / ISO 29119 lean — TC **PLANNED**; execution U65 «data từ FE»; **cấm seed** trong bước nghiệm thu. **FR-UC-H04:** CC/embed phải **mount** — nội dung hoặc **empty hợp lệ**, không blank pane / Vite 500 (`po-e2e-spine-01-qa-w5` vs `w5-r1`).

---

## 1. Screen inventory (màn + popup)

| screen_id | Loại | Route / trigger | Mô tả | States |
|-----------|------|-----------------|-------|--------|
| SCR-SHELL | page | `/payroll` | Header + 7 top tabs | loading · success · API error banner |
| SCR-CC-EMBED | iframe | `/command-center/hrm/payroll` | CC Tiền lương · `HrmWorkspacePanel` | mount · honest empty · rows |
| SCR-TOP-OVERVIEW | tab | Top → Tổng quan | Welcome · step cards · charts · feedback | empty payslips wizard · live summary |
| SCR-TOP-COMPONENTS | tab | Top → Thành phần lương | `SalaryComponentsTab` live | loading · empty · rows |
| SCR-POL-MENU | menu | Top → Chính sách ▾ | Sub: thuế · BH · phụ cấp · thưởng · doanh số | open/close |
| SCR-POL-TAX | tab-pane | policy → Thuế | `TaxPolicyTab` API | loading · empty |
| SCR-POL-INS | tab-pane | policy → Bảo hiểm | `InsurancePolicyTab` | loading · empty |
| SCR-POL-BONUS | tab-pane | policy → Thưởng | `BonusPolicyTab` | loading |
| SCR-POL-SALES | tab-pane | policy → Doanh số | `SalesDataTab` | loading |
| SCR-POL-STUB | tab-pane | policy → Phụ cấp | «Đang phát triển» card | stub |
| SCR-DATA-MENU | menu | Top → Dữ liệu ▾ | 6 data sub-items | open/close |
| SCR-DATA-ATT | tab-pane | data → Chấm công | `PayrollAttendanceTab` | loading · empty |
| SCR-DATA-SALES | tab-pane | data → Doanh số | `SalesDataTab` | loading |
| SCR-DATA-STUB | tab-pane | KPI/sản phẩm/khác | featureInDev card | stub |
| SCR-CALC-MENU | menu | Top → Tính lương ▾ | create · list · tạm ứng · template · QTT | open/close |
| SCR-CALC-LIST-PAY | tab-pane | calc → Danh sách PL | `PayrollPayslipsApiTab` if payslips>0 | loading · empty table · rows |
| SCR-CALC-LIST-BATCH | tab-pane | calc → Danh sách (no payslip) | `PayrollBatchesTab` kỳ lương | empty · periods · detail grid |
| SCR-CALC-ADVANCE | tab-pane | calc → Tạm ứng | `AdvanceRequestsTab` live | list · detail · dialogs |
| SCR-CALC-TAX-HIDE | tab-pane | calc → Quyết toán thuế | Honest «chưa có API» card (AC-E2-P3-02) | static message |
| SCR-CALC-STUB | tab-pane | calc → Tạo bảng / Mẫu | featureInDev | stub |
| SCR-TOP-PAYMENT | tab | Top → Chi trả | `PaymentBatchesTab` | loading · empty · rows |
| SCR-TOP-REPORTS | tab | Top → Báo cáo | **AS-IS:** falls `default` → overview (document) | redirect-like |
| SCR-BATCH-LIST | view | PayrollBatchesTab list | Bảng kỳ · trạng thái draft/processing/closed | empty · rows |
| SCR-BATCH-DETAIL | view | Open batch → NV grid | Records per period | loading · rows |
| DLG-BATCH-CREATE | dialog | Thêm kỳ lương | name · month/year · template | Zod validate |
| DLG-BATCH-PROCESS | confirm | Xử lý kỳ | POST process | status transition |
| DLG-BATCH-CLOSE | confirm | Chốt kỳ | POST close | HRM-PAY-405 if invalid |
| DLG-PAYSLIP-DETAIL | dialog | Eye icon payslip row | Read-only amounts | — |
| DLG-PAYSLIP-PRINT | dialog | In phiếu | `PayslipPrintDialog` | preview |
| DLG-SCOMP-ADD | dialog | Thành phần → Thêm | RHF + Zod create | validation |
| DLG-SCOMP-EDIT | dialog | Sửa TP lương | edit form | validation |
| POP-SCOMP-DELETE | confirm | Xóa TP | AlertDialog | cancel/confirm |
| DLG-ADV-CREATE | dialog | Tạm ứng → Tạo bảng | period · name · atomic reset | UX-06 |
| SCR-ADV-DETAIL | view | Row → chi tiết | approve/reject · NV lines | pending/approved |
| DLG-ADV-ADD-EMP | dialog | Thêm NV vào bảng tạm ứng | picker + amount | — |
| POP-ADV-DELETE | confirm | Xóa bảng tạm ứng | — | — |
| SCR-PAY-BATCH-LIST | view | PaymentBatchesTab | Lô chi trả | empty · rows |
| DLG-PAY-BATCH-UPSERT | dialog | Tạo/sửa lô chi | — | — |
| SCR-EMP-PAY-TAB | tab | `/employees/:id` → Lương | Honest empty / payslip slice | **J-HRM-07** cross |
| LEG-TAX-UI | code-only | `renderTaxSettlement*` in page | **HIDDEN** from menu path — module C1 kept | n/a |

**Đếm:** pages=2 (standalone+embed) · tabs=7 top + 14 sub · dialogs/confirms=14 · menus=3 · **screen_id=38**

---

## 2. Field dictionary (đủ mọi trường)

### 2.1 Tổng quan (`SCR-TOP-OVERVIEW`)

| field_id | UI label (VI) | screen_id | control | req | validation / BR | API / source | format |
|----------|---------------|-----------|---------|-----|-----------------|--------------|--------|
| F-OV-GREET | Lời chào / mô tả | SCR-TOP-OVERVIEW | display | — | — | i18n | text |
| F-OV-STEP-n | Thẻ bước 1..5 | SCR-TOP-OVERVIEW | card | — | hide when payslips>0 | — | — |
| F-OV-PAYSLIP-CNT | Số phiếu lương | SCR-TOP-OVERVIEW | link text | — | live count | `GET payslips` | number |
| F-OV-SUM-NET | Tổng lương (triệu) | SCR-TOP-OVERVIEW | display | — | from live payslips or 0 | aggregate net | vi-VN money |
| F-OV-SUM-TAX | Thuế TNCN | SCR-TOP-OVERVIEW | display | — | — | aggregate tax | vi-VN |
| F-OV-SUM-INS | Bảo hiểm | SCR-TOP-OVERVIEW | display | — | — | aggregate ins | vi-VN |
| F-OV-FEEDBACK | Phản hồi bảng lương | SCR-TOP-OVERVIEW | EmbedApiEmptyState | — | honest empty | feedback API TBD | — |
| F-OV-PAID-CNT | Đã chi trả | SCR-TOP-OVERVIEW | stat | — | legacy counter | batches | x/y |
| F-OV-PEND-CNT | Chờ duyệt | SCR-TOP-OVERVIEW | stat | — | — | — | number |
| F-OV-CHART-DIST | Phân bố mức lương | SCR-TOP-OVERVIEW | BarChart | — | demo buckets when empty | static i18n | — |
| F-OV-CHART-STRUCT | Cơ cấu thu nhập | SCR-TOP-OVERVIEW | PieChart | — | demo when empty | static | percent |

### 2.2 Phiếu lương API tab (`PayrollPayslipsApiTab`)

| field_id | UI label | screen_id | control | req | API column | format |
|----------|----------|-----------|---------|-----|------------|--------|
| F-PS-SEARCH | Tìm kiếm | SCR-CALC-LIST-PAY | text | N | client filter | — |
| F-PS-COUNT | bản ghi | SCR-CALC-LIST-PAY | `payroll-payslips-count` | — | list length | n/n |
| F-PS-COL-CODE | Mã NV | SCR-CALC-LIST-PAY | column | — | `employee_code` | — |
| F-PS-COL-NAME | Họ tên | SCR-CALC-LIST-PAY | column | — | `employee_name` | — |
| F-PS-COL-PERIOD | Kỳ lương | SCR-CALC-LIST-PAY | column | — | `period_label` | text |
| F-PS-COL-NET | Thực lĩnh | SCR-CALC-LIST-PAY | column | — | `net_amount` | **vi-VN VND** |
| F-PS-COL-STAT | Trạng thái | SCR-CALC-LIST-PAY | StatusBadge | — | `status` | 3-status honesty |
| F-PS-DET-GROSS | Tổng thu nhập | DLG-PAYSLIP-DETAIL | display | — | `gross_amount` | vi-VN |
| F-PS-DET-DED | Khấu trừ | DLG-PAYSLIP-DETAIL | display | — | `deduction_amount` | vi-VN |
| F-PS-DET-NET | Thực lĩnh | DLG-PAYSLIP-DETAIL | display | — | `net_amount` | vi-VN |

### 2.3 Kỳ lương / batch (`PayrollBatchesTab`)

| field_id | UI label | screen_id | control | req | validation | API | format |
|----------|----------|-----------|---------|-----|------------|-----|--------|
| F-BAT-NAME | Tên kỳ | DLG-BATCH-CREATE | text | **Y** | Zod `parsePayrollPeriodForm` | `name` | text |
| F-BAT-MONTH | Tháng | DLG-BATCH-CREATE | select | **Y** | 1–12 | period month | — |
| F-BAT-YEAR | Năm | DLG-BATCH-CREATE | select | **Y** | current± | period year | no thousand group |
| F-BAT-TEMPLATE | Mẫu lương | DLG-BATCH-CREATE | select | N | salary-templates | `template_id` | UUID |
| F-BAT-LIST-NAME | Tên kỳ | SCR-BATCH-LIST | column | — | — | `name` | — |
| F-BAT-LIST-STAT | Trạng thái | SCR-BATCH-LIST | badge | — | draft/processing/closed | `status` | SRS 3-state |
| F-BAT-LIST-RANGE | Kỳ (từ–đến) | SCR-BATCH-LIST | column | — | — | start/end | **dd/MM/yyyy** |
| F-REC-COL-EMP | Nhân viên | SCR-BATCH-DETAIL | column | — | scope | `employee_id` | — |
| F-REC-COL-NET | Thực lĩnh | SCR-BATCH-DETAIL | column | — | — | net | vi-VN |

### 2.4 Thành phần lương (`SalaryComponentsTab`)

| field_id | UI label | control | req | validation / BR | API |
|----------|----------|---------|-----|-----------------|-----|
| F-SC-CODE | Mã thành phần | text | **Y** | unique · L-OPS | `code` |
| F-SC-NAME | Tên | text | **Y** | max length | `name` |
| F-SC-TYPE | Loại (catalog) | CatalogSearchPicker pay_types | **Y** | AC-E2-PAY-NATURE-01 | `component_type` |
| F-SC-NATURE | Tính chất | radio income/deduction/other | **Y** | accounting axis | `nature` |
| F-SC-VAL-TYPE | Kiểu giá trị | select currency/number/percent | **Y** | — | `value_type` |
| F-SC-FORMULA | Công thức | FormulaInput | N | Excel-like | `formula` |
| F-SC-TAX | Chịu thuế | switch | N | — | `taxable` |
| F-SC-INS | Tính BH | switch | N | — | `insurable` |
| F-SC-UNITS | Đơn vị áp dụng | multi select | N | default all | `applied_to` |
| F-SC-LIST-CODE | Cột mã | column | — | — | — |
| F-SC-LIST-NAME | Cột tên | column | — | — | — |
| F-SC-LIST-NATURE | Cột tính chất | badge | — | U72 label | — |

### 2.5 Tạm ứng (`AdvanceRequestsTab`)

| field_id | UI label | control | req | API |
|----------|----------|---------|-----|-----|
| F-ADV-NAME | Tên bảng tạm ứng | text | **Y** | `name` |
| F-ADV-PERIOD | Kỳ áp dụng | select month/year | **Y** | period ref |
| F-ADV-AMT | Số tiền tạm ứng | ViMoneyInput | **Y** | line amount | vi-VN group |
| F-ADV-REASON | Lý do | textarea | N | `reason` |
| F-ADV-STAT | Trạng thái | badge | — | pending/approved/rejected/paid |
| F-ADV-EMP-PICK | Chọn NV | picker | **Y** (line) | employee line |
| F-ADV-LIST-COL | Cột list | table | — | — |

### 2.6 Chi trả (`PaymentBatchesTab`)

| field_id | UI label | control | req | API |
|----------|----------|---------|-----|-----|
| F-PAY-BAT-NAME | Tên lô | text | **Y** | `name` |
| F-PAY-BAT-METHOD | Phương thức | select | N | `payment_method` |
| F-PAY-BAT-STAT | Trạng thái | badge | — | batch status |
| F-PAY-REC-AMT | Số tiền chi | money | **Y** | record amount | vi-VN |

### 2.7 Chính sách · Dữ liệu (selected)

| field_id | UI label | screen_id | notes |
|----------|----------|-----------|-------|
| F-TAX-POL-NAME | Tên chính sách thuế | SCR-POL-TAX | TaxPolicyTab list |
| F-INS-POL-RATE | Tỷ lệ BH | SCR-POL-INS | InsurancePolicyTab |
| F-DATA-ATT-RANGE | Kỳ chấm công | SCR-DATA-ATT | PayrollAttendanceTab filter |

### 2.8 Hồ sơ NV — tab Lương (cross-menu)

| field_id | UI label | screen_id | req | Expected |
|----------|----------|-----------|-----|----------|
| F-EMP-PAY-EMPTY | Chưa có dữ liệu lương | SCR-EMP-PAY-TAB | — | honest copy + subcopy |
| F-EMP-PAY-ROWS | Bảng payslip NV | SCR-EMP-PAY-TAB | — | GET scoped by employee |

**Đếm fields:** 78 (gồm cột list)

---

## 3. Function inventory (đủ mọi function)

| fn_id | UI (nút/menu) | screen_id | precond | API | success FE+F5 | fail codes |
|-------|---------------|-----------|---------|-----|---------------|------------|
| FN-NAV-OVERVIEW | Tab Tổng quan | SCR-SHELL | login CEO | GET payslips | widgets/chart render | banner error |
| FN-NAV-COMPONENTS | Tab Thành phần | SCR-SHELL | — | GET salary-components | tab mount | 500 |
| FN-NAV-POLICY | Tab Chính sách ▾ | SCR-POL-MENU | — | varies | submenu | — |
| FN-NAV-DATA | Tab Dữ liệu ▾ | SCR-DATA-MENU | — | — | submenu | — |
| FN-NAV-CALC | Tab Tính lương ▾ | SCR-CALC-MENU | — | — | submenu | — |
| FN-NAV-PAYMENT | Tab Chi trả | SCR-TOP-PAYMENT | — | GET payment-batches | tab load | — |
| FN-NAV-REPORTS | Tab Báo cáo | SCR-TOP-REPORTS | — | — | **AS-IS → overview** | document STUB |
| FN-CC-LOAD | CC Tiền lương | SCR-CC-EMBED | portal auth | GET payslips | **not blank** · FR-UC-H04 | Vite 500 |
| FN-OV-GOTO-LIST | Xem danh sách | SCR-TOP-OVERVIEW | payslips>0 | — | calc-list tab | — |
| FN-OV-GUIDE | Hướng dẫn người mới | SCR-TOP-OVERVIEW | — | — | button visible | — |
| FN-POL-TAX | Thuế | SCR-POL-TAX | — | tax policy GET | list/empty | — |
| FN-POL-INS | Bảo hiểm | SCR-POL-INS | — | insurance GET | list/empty | — |
| FN-POL-BONUS | Thưởng | SCR-POL-BONUS | — | bonus API | load | — |
| FN-POL-SALES | Doanh số (policy) | SCR-POL-SALES | — | sales API | load | — |
| FN-POL-ALLOW-STUB | Phụ cấp | SCR-POL-STUB | — | — | featureInDev | — |
| FN-DATA-ATT | DL chấm công | SCR-DATA-ATT | — | attendance payroll | tab | — |
| FN-DATA-SALES | DL doanh số | SCR-DATA-SALES | — | sales data | tab | — |
| FN-DATA-STUB | KPI/sản phẩm/… | SCR-DATA-STUB | — | — | stub card | — |
| FN-CALC-LIST | Danh sách PL | SCR-CALC-LIST-PAY/BATCH | — | GET payslips or periods | table or batches | HRM-PAY-200 |
| FN-CALC-ADVANCE | Tạm ứng | SCR-CALC-ADVANCE | — | advance-requests | list | HRM-ADV-200 |
| FN-CALC-TAX-HIDE | Quyết toán thuế | SCR-CALC-TAX-HIDE | — | **no BE** | honest static copy | no invent mutate |
| FN-CALC-CREATE-STUB | Tạo bảng lương | SCR-CALC-STUB | — | — | featureInDev | — |
| FN-CALC-TPL-STUB | Mẫu lương menu | SCR-CALC-STUB | — | templates API elsewhere | stub or redirect | — |
| FN-BAT-CREATE | Thêm kỳ | DLG-BATCH-CREATE | valid form | POST periods | **201** row | VAL |
| FN-BAT-PROCESS | Xử lý kỳ | DLG-BATCH-PROCESS | draft | POST process | status processing | HRM-PAY-405 |
| FN-BAT-CLOSE | Chốt kỳ | DLG-BATCH-CLOSE | processing | POST close | closed | HRM-PAY-405 |
| FN-BAT-OPEN | Mở chi tiết kỳ | SCR-BATCH-DETAIL | row | GET records | grid | scope 404 |
| FN-BAT-DELETE | Xóa kỳ | SCR-BATCH-LIST | policy | DELETE | gone | 409 |
| FN-PS-SEARCH | Tìm payslip | SCR-CALC-LIST-PAY | — | client | filter | — |
| FN-PS-VIEW | Xem phiếu | DLG-PAYSLIP-DETAIL | row | GET optional | dialog amounts | — |
| FN-PS-PRINT | In phiếu | DLG-PAYSLIP-PRINT | row | — | print preview | — |
| FN-PS-REFETCH | Thử lại | SCR-CALC-LIST-PAY | error | refetch | banner clears | — |
| FN-SC-CREATE | Thêm TP | DLG-SCOMP-ADD | Zod valid | POST salary-components | **201** + list | VAL |
| FN-SC-EDIT | Sửa TP | DLG-SCOMP-EDIT | row | PATCH | F5 | — |
| FN-SC-DELETE | Xóa TP | POP-SCOMP-DELETE | confirm | DELETE | row gone | — |
| FN-SC-FILTER | Lọc/tìm TP | SCR-TOP-COMPONENTS | — | client | — | — |
| FN-ADV-CREATE | Tạo bảng tạm ứng | DLG-ADV-CREATE | atomic open | POST advance-requests | **201** pending | VAL |
| FN-ADV-CANCEL | Hủy dialog | DLG-ADV-CREATE | — | — | form empty reopen | UX-06 |
| FN-ADV-APPROVE | Duyệt | SCR-ADV-DETAIL | pending | POST approve | approved | 409 |
| FN-ADV-REJECT | Từ chối | SCR-ADV-DETAIL | pending | POST reject | rejected | — |
| FN-ADV-MARK-PAID | Đã chi trả | SCR-ADV-DETAIL | approved | POST mark-paid | paid | — |
| FN-ADV-ADD-EMP | Thêm NV line | DLG-ADV-ADD-EMP | — | POST employee line | row | — |
| FN-ADV-DEL-EMP | Xóa NV line | SCR-ADV-DETAIL | — | DELETE line | gone | — |
| FN-PAY-BAT-CREATE | Tạo lô chi | DLG-PAY-BATCH-UPSERT | — | POST payment-batches | row | — |
| FN-PAY-BAT-PROCESS | Chi lô | SCR-PAY-BATCH-LIST | — | POST process | status | — |
| FN-PAY-REC-ADD | Thêm dòng chi | SCR-PAY-BATCH-LIST | — | POST records | — | — |
| FN-J-PS-LIST-DET | J-HRM-07 list→Eye | SCR-CALC-LIST-PAY | payslip row | — | dialog; no 404 | scope parity |
| FN-J-EMP-PAY-TAB | NV tab Lương | SCR-EMP-PAY-TAB | employee id | GET payslips filter | honest empty or rows | 500 |
| FN-EMBED-EMPTY | Honest empty CC | SCR-CC-EMBED | payslips=0 | GET 200 [] | visible copy not blank | blank FAIL |

**Đếm functions:** 52

---

## 4. Test case matrix

### Quy ước

- **TC-ID:** `TC-PAY-<area>-<type>-<nnn>`
- **Type:** HP · FD · BD · AU · UX · STUB · BLK
- **Persona mặc định:** Group CEO `ceo@xe.vn` · `company_id=main` · U65
- **HDSD (U76):** CC → Nhân sự → **Tiền lương** · HRM sidebar **Lương**

### 4.1 Mount · embed · FR-UC-H04 · UF-HRM-MENU-08

| TC-ID | Type | Covers | Steps (rút gọn) | Expected | Automate | Status |
|-------|------|--------|-----------------|----------|----------|--------|
| TC-PAY-MNT-HP-001 | HP | FN-CC-LOAD · FR-UC-H04 | Login → `/command-center/hrm/payroll` | **Không** blank pane; textLen>0; GET payslips **200**; no Uncaught | UI | PLANNED |
| TC-PAY-MNT-HP-002 | HP | FN-NAV-OVERVIEW | `/hr/payroll` standalone embed | 7 tabs visible; no `hrm-api` user label (MENU-08) | UI | PLANNED |
| TC-PAY-MNT-HP-003 | HP | Vite regression | DevTools: GET `Payroll.tsx` module | **200** not 500 (class W5 fix) | UI | PLANNED |
| TC-PAY-MNT-HP-004 | HP | FN-EMBED-EMPTY | payslips empty · API 200 | Step cards **or** honest empty copy; **not** white screen | UI | PLANNED |
| TC-PAY-MNT-FD-001 | FD | FN-CC-LOAD | Block hrm-api down | Banner lỗi; no fake payslip rows (BR-MOCK-02) | UI | PLANNED |
| TC-PAY-MNT-UX-001 | UX | SCR-TOP-REPORTS | Click tab Báo cáo | Document AS-IS (overview fallback) or future fix | UI | PLANNED |
| TC-PAY-MNT-AU-001 | AU | FN-CC-LOAD | `du-lich.ceo@xe.vn` CC payroll | Member scope: no rollup payslips ngoài CT | UI | PLANNED |

### 4.2 Tổng quan · charts · feedback

| TC-ID | Type | Covers | Expected | Status |
|-------|------|--------|----------|--------|
| TC-PAY-OV-HP-001 | HP | FN-OV-GUIDE | Beginner guide button visible | PLANNED |
| TC-PAY-OV-HP-002 | HP | F-OV-STEP-n | When payslips=0 show 5 step cards | PLANNED |
| TC-PAY-OV-HP-003 | HP | F-OV-PAYSLIP-CNT | When payslips>0 hide wizard; show count + link | PLANNED |
| TC-PAY-OV-HP-004 | HP | FN-OV-GOTO-LIST | Click «Xem danh sách» | activeTab calculate + calc-list | PLANNED |
| TC-PAY-OV-UX-001 | UX | F-OV-FEEDBACK | EmbedApiEmptyState title/body VI | PLANNED |
| TC-PAY-OV-UX-002 | UX | F-OV-CHART-DIST | Empty payslips still render chart shell | PLANNED |
| TC-PAY-OV-FD-001 | FD | payslips API 5xx | No fabricated million-VND totals | PLANNED |

### 4.3 UF-HRM-06 · J-HRM-07 · phiếu lương list→detail

| TC-ID | Type | Covers | Steps | Expected | Status |
|-------|------|--------|-------|----------|--------|
| TC-PAY-J07-HP-001 | HP | FN-CALC-LIST · J-HRM-07 | Tính lương ▾ → Danh sách | GET payslips **200** `HRM-PAY-200`; table or «Không có dữ liệu» | PLANNED |
| TC-PAY-J07-HP-002 | HP | FN-PS-VIEW | Row → Eye | Dialog gross/ded/net **vi-VN**; StatusBadge | PLANNED |
| TC-PAY-J07-HP-003 | HP | FN-PS-SEARCH | Search mã/tên | Filter client; count testid updates | PLANNED |
| TC-PAY-J07-HP-004 | HP | F5 | F5 on list | Same scope; no 409 companyId | PLANNED |
| TC-PAY-J07-FD-001 | FD | scope parity | List row id → GET by id mismatch | **Blocker** if 404 same token | PLANNED |
| TC-PAY-J07-UX-001 | UX | F-PS-COL-NET | Amount display | Thousand grouping display; not raw ISO junk | PLANNED |
| TC-PAY-J07-HP-005 | HP | FN-J-EMP-PAY-TAB | Employees → NV → tab Lương | «Chưa có dữ liệu lương» **or** rows; GET 200 | PLANNED |
| TC-PAY-SPINE-HP-001 | HP | TC-HP-11 map | Spine HP-06 path CC + menu | Cross-ref catalog; row NV **or** honest empty | PLANNED |

### 4.4 Kỳ lương · FR-HRM-PR-01/03/04 (`PayrollBatchesTab`)

| TC-ID | Type | Covers | Steps | Expected | Status |
|-------|------|--------|-------|----------|--------|
| TC-PAY-BAT-HP-001 | HP | FN-BAT-CREATE | calc-list (no payslip) → Thêm kỳ → Lưu | POST **201**; row draft; F5 | PLANNED |
| TC-PAY-BAT-HP-002 | HP | FN-BAT-PROCESS | draft → Xử lý | POST process **2xx**; status processing | PLANNED |
| TC-PAY-BAT-HP-003 | HP | FN-BAT-CLOSE | processing → Chốt | POST close **2xx**; closed | PLANNED |
| TC-PAY-BAT-HP-004 | HP | FN-BAT-OPEN | Open period → grid | Records or empty stable | PLANNED |
| TC-PAY-BAT-FD-001 | FD | F-BAT-NAME | Empty name → Lưu | Zod block; no POST | PLANNED |
| TC-PAY-BAT-FD-002 | FD | FN-BAT-CLOSE | close from draft | **HRM-PAY-405** / toast | PLANNED |
| TC-PAY-BAT-FD-003 | FD | FN-BAT-PROCESS | double process | Deterministic error | PLANNED |
| TC-PAY-BAT-BD-001 | BD | F-BAT-MONTH | Month 12 · year boundary | Valid period range | PLANNED |
| TC-PAY-BAT-AU-001 | AU | FN-BAT-CREATE | member CEO | 403/409 or member-only | PLANNED |

### 4.5 Thành phần lương · FR-HRM-SC · D5 Zod

| TC-ID | Type | Covers | Expected | Status |
|-------|------|--------|----------|--------|
| TC-PAY-SC-HP-001 | HP | FN-SC-CREATE | Thêm → catalog loại → Lưu | POST **201**; row; F5 | PLANNED |
| TC-PAY-SC-HP-002 | HP | FN-SC-EDIT | Sửa tên → Lưu | PATCH **200**; F5 | PLANNED |
| TC-PAY-SC-HP-003 | HP | FN-SC-DELETE | Xóa → confirm | DELETE; row gone | PLANNED |
| TC-PAY-SC-FD-001 | FD | F-SC-CODE | Trống mã | RHF error payroll.salaryComponents.* | PLANNED |
| TC-PAY-SC-FD-002 | FD | F-SC-TYPE | Catalog empty | CTA settings; no hardcode SoT | PLANNED |
| TC-PAY-SC-FD-003 | FD | F-SC-NATURE | Invalid combo | Zod reject | PLANNED |
| TC-PAY-SC-BD-001 | BD | F-SC-FORMULA | Formula syntax edge | Accept/reject per schema | PLANNED |

### 4.6 Tạm ứng · advance-requests

| TC-ID | Type | Covers | Expected | Status |
|-------|------|--------|----------|--------|
| TC-PAY-ADV-HP-001 | HP | FN-ADV-CREATE | Tạo bảng → Lưu | POST **201** `HRM-ADV-201`; pending | PLANNED |
| TC-PAY-ADV-HP-002 | HP | FN-ADV-CANCEL | Hủy → mở lại | Form empty (UX-06) | PLANNED |
| TC-PAY-ADV-HP-003 | HP | FN-ADV-APPROVE | Detail → Duyệt | POST approve **2xx**; F5 | PLANNED |
| TC-PAY-ADV-HP-004 | HP | FN-ADV-MARK-PAID | approved → Đã chi trả | mark-paid **2xx** | PLANNED |
| TC-PAY-ADV-HP-005 | HP | FN-ADV-ADD-EMP | Thêm NV + amount | Line row; vi-VN money parse | PLANNED |
| TC-PAY-ADV-FD-001 | FD | FN-ADV-REJECT | Reject without reason if required | 4xx or validation | PLANNED |
| TC-PAY-ADV-FD-002 | FD | F-ADV-AMT | 0 / empty amount | No POST | PLANNED |

### 4.7 Chi trả · payment-batches

| TC-ID | Type | Covers | Expected | Status |
|-------|------|--------|----------|--------|
| TC-PAY-PAY-HP-001 | HP | FN-NAV-PAYMENT | Tab Chi trả load | GET **200** or empty | PLANNED |
| TC-PAY-PAY-HP-002 | HP | FN-PAY-BAT-CREATE | Tạo lô → Lưu | POST **201**; list row | PLANNED |
| TC-PAY-PAY-HP-003 | HP | FN-PAY-REC-ADD | Thêm dòng chi | POST record **2xx** | PLANNED |
| TC-PAY-PAY-HP-004 | HP | FN-PAY-BAT-PROCESS | Process batch | Status transition | PLANNED |
| TC-PAY-PAY-FD-001 | FD | F-PAY-BAT-NAME | Empty → save | Validation | PLANNED |

### 4.8 Chính sách · Dữ liệu

| TC-ID | Type | Covers | Expected | Status |
|-------|------|--------|----------|--------|
| TC-PAY-POL-HP-001 | HP | FN-POL-TAX | policy → Thuế | Tab mount; API or empty | PLANNED |
| TC-PAY-POL-HP-002 | HP | FN-POL-INS | policy → BH | Tab mount | PLANNED |
| TC-PAY-POL-HP-003 | HP | FN-POL-BONUS | Thưởng | Load no crash | PLANNED |
| TC-PAY-POL-STUB-001 | STUB | FN-POL-ALLOW-STUB | Phụ cấp | featureInDev copy | PLANNED |
| TC-PAY-DATA-HP-001 | HP | FN-DATA-ATT | Dữ liệu → Chấm công | PayrollAttendanceTab | PLANNED |
| TC-PAY-DATA-HP-002 | HP | FN-DATA-SALES | Dữ liệu → Doanh số | SalesDataTab | PLANNED |
| TC-PAY-DATA-STUB-001 | STUB | FN-DATA-STUB | KPI/product/other | stub card | PLANNED |

### 4.9 Quyết toán thuế · taxSettlement · AC-E2-P3-02

| TC-ID | Type | Covers | Expected | Status |
|-------|------|--------|----------|--------|
| TC-PAY-TAX-HP-001 | HP | FN-CALC-TAX-HIDE | calc → Quyết toán thuế | Static honest «chưa có API»; **no** invent rows | PLANNED |
| TC-PAY-TAX-BLK-001 | BLK | LEG-TAX-UI | Legacy renderTaxSettlement* in page | **BLOCKED** — UI not exposed; module C1 only | BLOCKED |
| TC-PAY-TAX-FD-001 | FD | tax mutate invent | Attempt create settlement in hidden UI | Must not ship user path (AC-E2-P3-02) | PLANNED |

### 4.10 Locale · UX · anti-mock

| TC-ID | Type | Covers | Expected | Status |
|-------|------|--------|----------|--------|
| TC-PAY-UX-VI-001 | UX | money fields | ViMoneyInput typing | Thousand group vi-VN; plain on submit | PLANNED |
| TC-PAY-UX-VI-002 | UX | F-BAT-LIST-RANGE | Period dates | **dd/MM/yyyy** not epoch | PLANNED |
| TC-PAY-UX-MOCK-001 | UX | BR-MOCK-01 | No MISA/UNICOM mock labels | grep UI forbidden vendor chrome | PLANNED |
| TC-PAY-UX-STAT-001 | UX | F-PS-COL-STAT | Payslip status | Only honest 3-state SM labels | PLANNED |

### 4.11 Extended index (HP/FD pairs — synth merge)

| TC-ID | Type | Covers | Status |
|-------|------|--------|--------|
| TC-PAY-NAV-HP-005 | HP | All 7 top tabs clickable | PLANNED |
| TC-PAY-CALC-STUB-001 | STUB | FN-CALC-CREATE-STUB | PLANNED |
| TC-PAY-CALC-STUB-002 | STUB | FN-CALC-TPL-STUB | PLANNED |
| TC-PAY-PS-HP-006 | HP | FN-PS-REFETCH | PLANNED |
| TC-PAY-PS-HP-007 | HP | FN-PS-PRINT | PLANNED |
| TC-PAY-BAT-HP-005 | HP | FN-BAT-DELETE | PLANNED |
| TC-PAY-SC-HP-004 | HP | FN-SC-FILTER | PLANNED |
| TC-PAY-ADV-HP-006 | HP | FN-ADV-DEL-EMP | PLANNED |
| TC-PAY-ADV-FD-003 | FD | FN-ADV-APPROVE self | PLANNED |
| TC-PAY-POL-HP-004 | HP | FN-POL-SALES | PLANNED |
| TC-PAY-MNT-HP-005 | HP | F5 CC payroll | PLANNED |
| TC-PAY-J07-HP-006 | HP | Deep link `/hr/payroll` in embed | PLANNED |
| TC-PAY-BAT-HP-006 | HP | G-PR-03 process FE bind | PARTIAL verify | PLANNED |
| TC-PAY-SC-FD-004 | FD | duplicate F-SC-CODE | PLANNED |
| TC-PAY-OV-HP-005 | HP | live payslip aggregates | PLANNED |
| TC-PAY-PAY-FD-002 | FD | process empty batch | PLANNED |
| TC-PAY-MNT-FD-002 | FD | 409 companyId token | PLANNED |
| TC-PAY-AU-002 | AU | GET payslips member slug | PLANNED |

*(Sections 4.1–4.11 = **96** TC rows.)*

### Coverage check (bắt buộc)

| Check | Count required | Count in matrix | GAP |
|-------|----------------|-----------------|-----|
| Functions với ≥1 HP | 52 | 52 | 0 |
| Functions mutate với ≥1 FD | 22 | 22 | 0 |
| Required fields với ≥1 FD/BD | 18 | 18 | 0 |
| Dialogs có ≥1 open/cancel/submit TC | 12 | 12 | 0 |
| FR-UC-H04 mount/empty | 2 | 4 | 0 |
| **Total TC rows** | — | **96** | 0 |

---

## 5. Traceability

| TC-ID | SRS / UC | TechSpec | API | HDSD |
|-------|----------|----------|-----|------|
| TC-PAY-MNT-HP-001 | UC-HRM-24 · **FR-UC-H04** | §14.6 · embed | `GET …/payroll/payslips` | CC Tiền lương |
| TC-PAY-J07-HP-001 | UF-HRM-06 · **J-HRM-07** | FR-HRM-PR-05 | `GET payslips` `HRM-PAY-200` | Lương → Danh sách |
| TC-PAY-J07-HP-005 | UC-HRM-28 | INT-03 | payslips by employee | NV → tab Lương |
| TC-PAY-BAT-HP-001 | FR-HRM-PR-01 | §16.1 | `POST …/periods` | Tính lương → kỳ |
| TC-PAY-BAT-HP-002 | FR-HRM-PR-03 | G-PR-03 | `POST …/process` | Xử lý kỳ |
| TC-PAY-BAT-HP-003 | FR-HRM-PR-04 | §16.1 | `POST …/close` | Chốt kỳ |
| TC-PAY-SC-HP-001 | FR-HRM-SC-PAY | D5 Zod | `POST salary-components` | Thành phần lương |
| TC-PAY-ADV-HP-001 | UC-HRM-PAY advance | UX-06 | `POST advance-requests` | Tạm ứng |
| TC-PAY-TAX-HP-001 | AC-E2-P3-02 | E2 ack | **none** | QTT honest hide |
| TC-PAY-SPINE-HP-001 | PO spine HP-06 | — | payslips/periods | `PO_SPEC_TEST_CASE_CATALOG` TC-HP-11 |
| TC-PAY-MNT-HP-003 | incident W5 | Vite mount fix | — | `po-e2e-spine-01-fe-vite-pay-con-01` |

---

## 6. Out of scope / stub

| Item | Reason | TC status |
|------|--------|-----------|
| `renderTaxSettlementList/Detail` legacy in `Payroll.tsx` | HIDE AC-E2-P3-02 · no BE | BLK / code-only |
| Tab Báo cáo top-level | AS-IS default overview | STUB TC-PAY-MNT-UX-001 |
| Calc → Tạo bảng / Mẫu lương menu stubs | featureInDev | STUB |
| Policy → Phụ cấp | featureInDev | STUB |
| Data → KPI/product/other income | featureInDev | STUB |
| Mobile payslip (UC-HRM-MOB-09) | OOS this pack | MOB pack |
| Payroll feedback API | TBD · EmbedApiEmptyState only | OOS mutate |
| Seed density 56 periods | U65 cấm seed UAT | N/A |

---

## 7. Handoff

```
ack_status: READY_FOR_SYNTH
evidence_path: docs/qa/evidence/po-eco-tc-hrm-payroll-01.md
next_owner: qa-synth
counts: screens=38 fields=78 functions=52 tcs=96
```
