# XEVN HRM — PHÂN TÍCH MODULE & WBS
## Module Impact Analysis + Work Breakdown Structure

> **Căn cứ:** XEVN_POLICY_CATALOG.md + XEVN_MASTER_CONTEXT_v2.md + BRD_NEW.md + SRS_NEW.md  
> **Ngày:** 2026-08-22  
> **Mục đích:** Lên kế hoạch sửa/thêm module trước khi viết SRS chi tiết

---

## PHẦN 1 — TỔNG QUAN IMPACT

```
HIỆN TẠI (BRD v1 đã định nghĩa):           THỰC TẾ CẦN (từ tài liệu KH):
─────────────────────────────────           ──────────────────────────────
Employee (CRUD cơ bản)                  →   Employee + Ngạch/Bậc + Grade Ladder
Payroll (Net = Gross - BHXH...)         →   Policy Engine (28 component_type)
Attendance (GPS check-in)               →   Attendance + Bonus Trigger + Quota
Leave (Workflow 2 cấp)                  →   Leave (giữ nguyên — OK)
Recruitment (Pipeline cố định)          →   Recruitment (giữ nguyên — OK)
Catalog (type/code/display)             →   Catalog + Province Config + Grade Config
─────────────────────────────────           ──────────────────────────────
THIẾU HOÀN TOÀN:                            CẦN THÊM MỚI:
─────────────────────────────────           ──────────────────────────────
(không có)                              →   Policy Engine (core mới)
(không có)                              →   Policy Decision Management (QĐ lifecycle)
(không có)                              →   Input Data Hub (Trip/Revenue/CLDV/SC)
(không có)                              →   Pool Calculation Engine
(không có)                              →   Grade-Step Management
(không có)                              →   Vehicle & Fuel Quota Tracking
```

---

## PHẦN 2 — MODULE CẦN CHỈNH SỬA (MODIFY)

### M-01: Employee Profile
**Trạng thái hiện tại:** CRUD 4 tab — Personal, Job, Contract/Salary, Documents  
**Cần thêm gì:**

| Field/Feature | Lý do | Impact |
|--------------|-------|--------|
| `grade_id` (FK → grade) | Ngạch là nền tảng lương cơ bản | DB + API + Form UI |
| `step_id` (FK → step) | Bậc xác định mức lương ngạch-bậc | DB + API + Form UI |
| `pay_group` enum | Xác định loại policy áp dụng (LX Tuyến/Tải/ĐPHH/TĐ/VP...) | DB + API + Form UI |
| `probation_flag` | Thử việc → 85% policy, hoặc flat rate riêng | DB + API logic |
| `province_code` | LX tuyến cần biết tỉnh định biên để tính đơn giá | DB + API |
| `vehicle_type_code` | LX tải cần biết loại xe để tra lương cứng + khoán NL | DB + API |
| `contract_start_date` | Để xác định policy_assignment effective | DB |
| Grade promotion history | Lịch sử nâng bậc — audit trail | DB (new table) |

**Phạm vi ảnh hưởng:**
- `employees` table: thêm 6 columns
- API: `PATCH /employees/:id` cập nhật grade/step/pay_group
- Form UI: Tab "Hợp đồng & Lương" → thêm Grade Selector, Pay Group Selector
- Mobile: Payslip view cần hiển thị ngạch/bậc

---

### M-02: Payroll Module (Sửa toàn diện)
**Trạng thái hiện tại:** `payroll_records` có `gross`, `deductions: JSONB`, `net`, 6-step status  
**Vấn đề cốt lõi:** Công thức `Net = Gross - BHXH - BHYT - BHTN - PIT` **KHÔNG phản ánh thực tế** — XeVN có 28 loại income component khác nhau.

**Cần sửa/thêm:**

| Thay đổi | Chi tiết | Impact |
|---------|---------|--------|
| `payroll_records` → thêm `policy_snapshot_id` | Lưu policy version tại thời điểm tính | DB |
| `payroll_records` → thêm `components: JSONB[]` | Chi tiết từng component đã tính | DB |
| `payroll_records` → thêm `input_data_ref: JSONB` | Tham chiếu dữ liệu đầu vào (trip_log, revenue_import...) | DB |
| Batch engine: plugin-based per component_type | Mỗi component_type là 1 calculator class | BE service |
| Pool calculation (zero-sum) | TĐ, VP Tỉnh — chia pool sau khi tổng hợp tất cả NV | BE logic |
| 6-step approval (giữ nguyên) | OK, chỉ thêm lock ở step cuối | Giữ nguyên |
| Payslip detail view | Hiển thị breakdown từng component | FE + Mobile |

**Phạm vi ảnh hưởng:**
- **DB:** 5 bảng mới (xem Module M-05 — Policy Engine)
- **BE:** Rewrite payroll calculation service hoàn toàn
- **FE:** Payslip UI thêm accordion chi tiết từng component
- **Mobile:** Payslip screen thêm component breakdown

---

### M-03: Attendance Module
**Trạng thái hiện tại:** GPS check-in/out, auto-checkout 10h, anomaly detection  
**Cần thêm gì:**

| Feature | Lý do | Impact |
|---------|-------|--------|
| Sunday flag | QĐ 439: ăn ca CN 25,000đ — cần biết ngày CN | DB (field `is_sunday`) |
| Monthly work-day aggregation | Tính ngày công cho thưởng chuyên cần ≥24NC | BE service mới |
| Weekend attendance flag | Thưởng chuyên cần: không nghỉ T6/T7/CN | BE query logic |
| Pool attendance ratio | TĐ: ≥50% công chuẩn → hệ số pool | BE calculation |
| Ca sáng/Ca chiều flag | TĐ: pool HĐ+TG khác nhau theo ca | DB (field `shift_type`) |
| Minimum/Maximum giờ | VP Tỉnh: 220–290h/tháng | BE validation |

**Phạm vi ảnh hưởng:**
- `attendance_records` table: thêm `shift_type`, `is_sunday` flag
- BE: thêm `AttendanceSummaryService` tổng hợp tháng cho payroll input
- FE: Attendance report thêm cột ngày công, ca, CN

---

### M-04: Catalog Module (XBOS)
**Trạng thái hiện tại:** type/code/display_name/is_platform/metadata  
**Cần thêm catalog types mới:**

| Catalog Type | Dùng cho | Số entries ước tính |
|-------------|---------|-------------------|
| `GRADE` | Ngạch (D1→E2, 11 ngạch) | 11 |
| `GRADE_STEP` | Bậc trong ngạch (I→IX) | 9 |
| `PAY_GROUP` | Nhóm lương (7 nhóm) | 7 |
| `PROVINCE` | Tỉnh/TP (NĐ, NB, TB, PT, VT, YB, HN...) | 10+ |
| `VEHICLE_TYPE` | Loại xe (2.5T hàng nóng, 3.5T lạnh...) | 12 |
| `ROUTE_TYPE` | Loại tuyến (NOIBAI, STANDARD, SUPPORT) | 3 |
| `SHIFT_TYPE` | Ca làm việc (CA_SANG, CA_CHIEU, HC) | 5 |
| `COMPONENT_TYPE` | Loại income component (28 loại) | 28 |
| `POLICY_DECISION_TYPE` | Loại QĐ (ISSUE, AMEND, BONUS_AWARD, PROPOSAL) | 4 |
| `DEDUCTION_RULE` | Quy tắc giảm trừ (PT vs NĐ/NB/TB) | 2+ |
| `HOTLINE_CODE` | Số TĐ (1500, 1731) | 2 |
| `OFFICE_BRANCH` | VP/Chi nhánh (8 VP ĐPHH, 3 VP Tỉnh...) | 15+ |

**Phạm vi ảnh hưởng:**
- `catalog_items` table: không thay đổi schema (đã có `metadata: JSONB`)
- BE: thêm catalog type validation cho các type mới
- Portal/CC: Settings menu thêm các catalog type mới
- Seed data: 80+ entries cần seed ban đầu

---

## PHẦN 3 — MODULE CẦN THÊM MỚI (NEW)

### N-01: Grade-Step Management (Quản lý Ngạch-Bậc)
**Lý do:** Nền tảng lương cơ bản — tất cả nhân viên đều cần.

**Chức năng:**
- CRUD thang bảng lương ngạch-bậc (11 ngạch × 9 bậc)
- Gán ngạch/bậc cho nhân viên
- Nâng bậc: kiểm tra điều kiện (≥2 năm + KPI ≥80% + không kỷ luật) → workflow phê duyệt
- Lịch sử ngạch-bậc (audit trail)
- Versioning thang lương theo QĐ

**DB mới:**

```sql
grade_definitions (id, tenant_id, grade_code, grade_name, effective_from, effective_to)
grade_steps (id, grade_id, step_number, monthly_salary, created_at)
employee_grade_assignments (id, employee_id, grade_id, step_id, effective_from, approved_by, reason)
```

**Phạm vi ảnh hưởng:**
- DB: 3 bảng mới
- BE: GradeService, StepService, GradePromotionWorkflow
- API: `/grades`, `/grades/:id/steps`, `/employees/:id/grade-history`
- FE: Settings → Thang bảng lương + Employee → Tab Lương
- Mobile: Payslip hiển thị ngạch/bậc

---

### N-02: Policy Engine (Hệ thống Chính sách Lương — CORE)
**Lý do:** Trái tim của toàn bộ tính lương — không có cái này không tính được gì đúng.

**Chức năng:**
- CRUD `pay_policy` (nhóm chính sách + danh sách income_component)
- Versioning policy (mỗi QĐ → version mới, version cũ vẫn giữ)
- Gán policy cho employee (policy_assignment với effective_from)
- 28 loại `income_component` (xem POLICY_CATALOG.md)
- Config params dạng JSONB (tier_table, rate, threshold, conditions...)
- Preview tính thử với data mẫu

**DB mới:**

```sql
pay_policies (
  id, tenant_id, name, pay_group, description,
  effective_from, effective_to, version, parent_policy_id,
  status [DRAFT|ACTIVE|ARCHIVED], created_by, approved_by
)

income_components (
  id, policy_id, component_type, name,
  effective_from, effective_to,
  input_source [manual|excel_import|xbos_api|attendance_system],
  params JSONB,  -- tier_table, rate, threshold, pool_key, conditions...
  sort_order, is_deduction, is_required
)

policy_assignments (
  id, tenant_id, employee_id, policy_id,
  effective_from, effective_to,
  assigned_by, reason
)
```

**input_source types và params mẫu:**

| component_type | input_source | params mẫu |
|--------------|-------------|-----------|
| `trip_rate_tiered` | xbos_api | `{province_code, tier_table:[{max_trips,rate}], support_rate}` |
| `revenue_quality` | excel_import | `{revenue_threshold, tier1_rate, tier2_rate, cldv_table}` |
| `zero_sum_pool` | attendance_system | `{pool_amount, pool_key, allocation_basis:"working_hours"}` |
| `kpi_bonus_pct` | kpi_system | `{max_pct, overachieve_multiplier:1.5}` |
| `attendance_bonus_conditional` | attendance_system | `{min_days:24, exclude_weekends:true, bonus_amount:1000000, period_to}` |
| `team_milestone_bonus` | excel_import | `{office_code, milestones:[{threshold,bonus_pct}]}` |

**Phạm vi ảnh hưởng:**
- DB: 3 bảng mới + ảnh hưởng `payroll_records`
- BE: PolicyService, ComponentCalculatorFactory (plugin pattern), PolicyVersioning
- API: `/pay-policies`, `/pay-policies/:id/components`, `/employees/:id/policy-assignment`
- FE: Settings → Chính sách lương (form phức tạp nhất — builder UI)
- Mobile: Không ảnh hưởng trực tiếp

---

### N-03: Policy Decision Management (Quản lý Quyết định)
**Lý do:** XeVN ban hành ~5–10 QĐ/năm điều chỉnh chính sách. Cần quản lý vòng đời QĐ.

**Chức năng:**
- Tạo QĐ (số hiệu, ngày ban hành, loại QĐ, nội dung)
- 4 loại QĐ: ISSUE / AMEND / BONUS_AWARD / PROPOSAL
- Workflow phê duyệt BGĐ
- Khi phê duyệt → trigger tạo policy version mới (AMEND) hoặc policy mới (ISSUE)
- Lịch sử QĐ: audit trail, không xóa

**DB mới:**

```sql
policy_decisions (
  id, tenant_id, decision_code, decision_type,
  title, content TEXT,
  issued_date, effective_date,
  status [DRAFT|PENDING_APPROVAL|APPROVED|REJECTED],
  approved_by, approved_at, reject_reason,
  resulting_policy_id FK,  -- policy được tạo/sửa khi QĐ được duyệt
  created_by
)
```

**Phạm vi ảnh hưởng:**
- DB: 1 bảng mới + FK sang pay_policies
- BE: PolicyDecisionService, trigger → PolicyService.createVersion()
- API: `/policy-decisions`, workflow endpoints
- FE: HR Admin → Quản lý Quyết định (list, form, approval)

---

### N-04: Input Data Hub (Dữ liệu đầu vào lương)
**Lý do:** Mỗi tháng phải import: số lượt (LX Tuyến), DT (LX Tải/ĐPHH/TĐ), điểm CLDV, chi phí SC, số cuộc nghe. Hiện tại làm thủ công Excel.

**Chức năng:**
- Import Excel theo template chuẩn cho từng loại input
- Validate format trước khi lưu
- Cho phép sửa sau import, trước khi tính lương
- Link với payroll_period (tháng nào, NV nào)
- Lưu version import (nếu import lại thì tạo version mới)

**Các loại input cần hỗ trợ:**

| Input Type | Đối tượng | Template cột cần có |
|-----------|----------|---------------------|
| `TRIP_LOG` | LX Tuyến | NV, Tỉnh, Tuyến, Số lượt T1, Số lượt T2, Số lượt Nội Bài, Số lượt hỗ trợ, DT HĐ |
| `REVENUE_CLDV` | LX Tuyến | NV, DT tháng, Điểm CLDV, DT CPN, DT khăn nước |
| `MAINTENANCE_COST` | LX Tuyến | Tổ, Chi phí SC, Loại xe, Loại vi phạm |
| `FREIGHT_REVENUE` | LX Tải | NV, Loại xe, DT tháng, Điểm CLHĐ (số điểm) |
| `DPSHH_REVENUE` | ĐPHH | VP, DT gửi VP, DT nhận VP, DT giao hàng cá nhân, Giờ công NV |
| `HOTLINE_STATS` | TĐ | NV, Số TĐ, Cuộc nghe, HĐ ký, Giờ làm, % nhỡ, Điểm CLDV |
| `BRANCH_STATS` | VP Tỉnh | Chi nhánh, Số khách, Số xe, Chi phí phát sinh |

**DB mới:**

```sql
payroll_input_imports (
  id, tenant_id, period_month DATE,
  input_type ENUM,
  status [PENDING|VALIDATED|APPROVED|ERROR],
  file_url, row_count, error_count,
  uploaded_by, validated_at
)

payroll_input_rows (
  id, import_id, employee_id,
  data JSONB,  -- raw row data theo input_type
  status [OK|ERROR|OVERRIDDEN],
  error_message, overridden_by
)
```

**Phạm vi ảnh hưởng:**
- DB: 2 bảng mới
- BE: ImportService (per input_type), ValidationService, Excel parser
- API: `/payroll-inputs/import`, `/payroll-inputs/:period/review`
- FE: HR → Nhập liệu lương (upload, preview, confirm)
- Mobile: Không ảnh hưởng

---

### N-05: Pool Calculation Engine
**Lý do:** TĐ và VP Tỉnh dùng zero-sum pool — phải tổng hợp toàn bộ NV trong pool trước khi phân bổ cho từng người. Không thể tính lương từng người độc lập.

**Chức năng:**
- Group NV theo `pool_key` (ví dụ: pool_key = "TD_1500_2026_06")
- Tổng hợp contributions (số cuộc nghe, hệ số vị trí × giờ công)
- Chia pool theo tỷ lệ contribution
- Output → payroll_record của từng NV trong pool

**Phạm vi ảnh hưởng:**
- Không cần bảng mới (dùng `income_components.params` + `payroll_input_rows`)
- BE: PoolCalculationService — chạy trong batch payroll sau khi gom đủ input
- API: Không cần endpoint riêng — gọi từ batch payroll
- FE: Payroll batch UI hiển thị pool summary trước khi confirm

---

### N-06: Vehicle & Fuel Quota Tracking
**Lý do:** LX tải cần khoán nhiên liệu (L/100km) → tính vượt mức → giảm trừ QLPT.

**Chức năng:**
- Quản lý phương tiện (biển số, loại xe, định mức NL)
- Nhập km thực tế hàng tháng
- Tính nhiên liệu thực tế vs định mức
- Output giảm trừ → input cho payroll component `fuel_quota_deduction`

**DB mới:**

```sql
vehicles (id, tenant_id, plate_number, vehicle_type_code, driver_employee_id)

vehicle_fuel_logs (
  id, vehicle_id, period_month,
  actual_km NUMERIC,
  fuel_consumed NUMERIC,
  quota_rate NUMERIC,  -- L/100km theo catalog
  over_quota_liter NUMERIC,
  deduction_amount NUMERIC
)
```

**Phạm vi ảnh hưởng:**
- DB: 2 bảng mới
- BE: VehicleService, FuelQuotaCalculator
- API: `/vehicles`, `/vehicles/:id/fuel-logs`
- FE: Logistics → Phương tiện + Khoán nhiên liệu
- Mobile: LX Tải xem được định mức vs thực tế

---

## PHẦN 4 — MA TRẬN IMPACT TỔNG HỢP

| Layer | Không ảnh hưởng | Sửa nhẹ | Sửa nhiều | Mới hoàn toàn |
|-------|----------------|---------|-----------|--------------|
| **DB** | Leave, Workflow | Employees, Attendance, Catalog | Payroll Records | Grade, Policy Engine, Input Hub, Pool, Vehicle |
| **BE** | Notification, Auth | Attendance Summary | Payroll Batch | PolicyService, ImportService, PoolCalcService, FuelService |
| **API** | Auth endpoints | Employee API | Payroll API | /grades, /pay-policies, /payroll-inputs, /policy-decisions, /vehicles |
| **FE Web** | Login, Recruitment | Employee form | Payslip detail | Settings: Grade/Policy/Decision; HR: Input Hub |
| **Mobile** | Login, Leave | Payslip breakdown | — | Fuel tracking (P2) |
| **Portal/CC** | Super Admin core | Catalog | — | Policy Decision review |

---

## PHẦN 5 — WBS (Work Breakdown Structure)

### EPIC 0: FOUNDATION (Tiên quyết cho mọi thứ)

```
0. Foundation
├── 0.1 Catalog Extension
│   ├── 0.1.1 Thêm catalog types: GRADE, PAY_GROUP, PROVINCE, VEHICLE_TYPE...
│   ├── 0.1.2 Seed 80+ catalog entries
│   └── 0.1.3 API + Portal UI cho catalog mới
├── 0.2 Employee Extension
│   ├── 0.2.1 Migration: thêm grade_id, step_id, pay_group, province_code, vehicle_type_code
│   ├── 0.2.2 API: cập nhật Employee CRUD
│   └── 0.2.3 FE: cập nhật form nhân viên
└── 0.3 Attendance Extension
    ├── 0.3.1 Migration: thêm shift_type, is_sunday
    └── 0.3.2 BE: AttendanceSummaryService (tổng hợp tháng)
```

---

### EPIC 1: GRADE-STEP MANAGEMENT (P0)

```
1. Grade-Step Management
├── 1.1 DB: grade_definitions, grade_steps, employee_grade_assignments
├── 1.2 BE: GradeService, StepService
├── 1.3 BE: GradePromotionWorkflow (kết hợp Workflow Engine XBOS)
├── 1.4 API: /grades CRUD, /employees/:id/grade, /employees/:id/grade-history
├── 1.5 FE: Settings → Thang bảng lương (bảng 11×9 với edit inline)
└── 1.6 FE: Employee form → Grade/Step selector + history tab
```

---

### EPIC 2: POLICY ENGINE (P0 — Core)

```
2. Policy Engine
├── 2.1 DB: pay_policies, income_components, policy_assignments
├── 2.2 BE: PolicyService (CRUD + versioning)
├── 2.3 BE: PolicyAssignmentService
├── 2.4 BE: ComponentCalculatorFactory
│   ├── 2.4.1 Calculator: grade_base, grade_allowance, kpi_bonus_pct
│   ├── 2.4.2 Calculator: trip_rate_tiered, revenue_quality, cpn_commission, contract_fee
│   ├── 2.4.3 Calculator: fixed_base_salary, revenue_commission_tiered, vehicle_mgmt_allowance
│   ├── 2.4.4 Calculator: kpi_pool_share, revenue_commission_tiered (ĐPHH), delivery_commission
│   ├── 2.4.5 Calculator: zero_sum_pool (TĐ, VP Tỉnh)
│   ├── 2.4.6 Calculator: attendance_bonus_conditional, remote_work_allowance
│   └── 2.4.7 Calculator: vehicle_repair_deduction, clhd_point_deduction, fuel_quota_deduction
├── 2.5 BE: PolicyPreviewService (tính thử với data mẫu)
├── 2.6 API: /pay-policies, /pay-policies/:id/components, /pay-policies/:id/preview
├── 2.7 API: /employees/:id/policy-assignment
└── 2.8 FE: Settings → Chính sách lương
    ├── 2.8.1 Policy list + versioning timeline
    ├── 2.8.2 Policy builder (thêm/sửa/xóa income_component)
    ├── 2.8.3 Component config form (dynamic theo component_type)
    └── 2.8.4 Policy assignment tab per employee
```

---

### EPIC 3: INPUT DATA HUB (P0 — cần trước khi tính lương)

```
3. Input Data Hub
├── 3.1 DB: payroll_input_imports, payroll_input_rows
├── 3.2 BE: ImportService (Excel parser per input_type)
│   ├── 3.2.1 TRIP_LOG parser + validator
│   ├── 3.2.2 REVENUE_CLDV parser + validator
│   ├── 3.2.3 MAINTENANCE_COST parser + validator
│   ├── 3.2.4 FREIGHT_REVENUE parser + validator
│   ├── 3.2.5 DPSHH_REVENUE parser + validator
│   ├── 3.2.6 HOTLINE_STATS parser + validator
│   └── 3.2.7 BRANCH_STATS parser + validator
├── 3.3 BE: ImportValidationService (schema check, employee match, period check)
├── 3.4 API: /payroll-inputs/templates/:type (tải template Excel)
├── 3.5 API: /payroll-inputs/import, /payroll-inputs/:period/review
└── 3.6 FE: HR → Nhập liệu lương
    ├── 3.6.1 Upload + preview trước khi submit
    ├── 3.6.2 Error highlight per row
    ├── 3.6.3 Manual override cho từng dòng
    └── 3.6.4 Import history + rollback
```

---

### EPIC 4: PAYROLL ENGINE REWRITE (P0)

```
4. Payroll Engine
├── 4.1 DB: update payroll_records (thêm policy_snapshot_id, components JSONB[])
├── 4.2 BE: PayrollBatchService (rewrite)
│   ├── 4.2.1 Pre-check: đủ input data không?
│   ├── 4.2.2 Load policy cho từng NV tại period_month
│   ├── 4.2.3 Invoke ComponentCalculatorFactory per component
│   ├── 4.2.4 Pool aggregation (zero_sum_pool)
│   ├── 4.2.5 BHXH/BHYT/BHTN/PIT calculation
│   ├── 4.2.6 Generate payroll_records (per NV)
│   └── 4.2.7 6-step approval (tái dùng Workflow Engine)
├── 4.3 BE: PayslipService (generate PDF per employee)
├── 4.4 API: /payroll/batch/run, /payroll/batch/:id/status, /payroll/:id/payslip
└── 4.5 FE: HR → Bảng lương tháng
    ├── 4.5.1 Batch run UI + progress
    ├── 4.5.2 Payroll list với filter/sort
    ├── 4.5.3 Payslip detail (accordion component breakdown)
    ├── 4.5.4 Pool summary view (TĐ, VP Tỉnh)
    └── 4.5.5 Export Excel/PDF
```

---

### EPIC 5: POLICY DECISION MANAGEMENT (P1)

```
5. Policy Decision Management
├── 5.1 DB: policy_decisions
├── 5.2 BE: PolicyDecisionService
├── 5.3 BE: PolicyDecision → PolicyVersion trigger
├── 5.4 API: /policy-decisions CRUD + workflow
└── 5.5 FE: HR Admin → Quản lý Quyết định
    ├── 5.5.1 List QĐ với filter theo type/status/date
    ├── 5.5.2 Form tạo QĐ (4 loại)
    ├── 5.5.3 BGĐ approval UI
    └── 5.5.4 Kết nối với Policy Engine version
```

---

### EPIC 6: VEHICLE & FUEL TRACKING (P1)

```
6. Vehicle & Fuel
├── 6.1 DB: vehicles, vehicle_fuel_logs
├── 6.2 BE: VehicleService, FuelQuotaCalculator
├── 6.3 API: /vehicles, /vehicles/:id/fuel-logs
└── 6.4 FE: Logistics → Phương tiện + Khoán nhiên liệu
```

---

### EPIC 7: MOBILE ENHANCEMENT (P1)

```
7. Mobile Enhancement
├── 7.1 Payslip: hiển thị component breakdown (accordion)
├── 7.2 Payslip: hiển thị ngạch/bậc
├── 7.3 Attendance: ca làm việc selector (ca sáng/chiều/HC)
└── 7.4 Attendance: hiển thị quota công chuẩn vs thực tế (TĐ)
```

---

## PHẦN 6 — THỨ TỰ THỰC HIỆN

```
PHASE 0 (Tiên quyết — 1–2 tuần):
  Epic 0 (Foundation)
    └─ Catalog Extension → Employee Extension → Attendance Extension

PHASE 1 (Core tính lương — 4–6 tuần):
  Epic 1 (Grade-Step)     ──┐
  Epic 2 (Policy Engine)  ──┤ Song song được
  Epic 3 (Input Data Hub) ──┘
  ↓ (sau khi cả 3 xong)
  Epic 4 (Payroll Engine Rewrite)

PHASE 2 (Hoàn thiện — 2–3 tuần):
  Epic 5 (Policy Decision)  ──┐ Song song được
  Epic 6 (Vehicle & Fuel)   ──┘
  Epic 7 (Mobile Enhancement)

TỔNG ƯỚC LƯỢNG: 8–12 tuần (2–3 tháng) cho team 3–4 người
```

---

## PHẦN 7 — DEPENDENCIES & RISKS

| Risk | Mức | Mitigation |
|------|-----|-----------|
| Pool calculation complexity (TĐ, VP Tỉnh) | 🔴 Cao | Viết unit test kỹ; có test data thực tế |
| Mức 1/Mức 2 LX Tải chưa có số liệu cụ thể | 🟠 Cao | Cần Sponsor confirm trước Epic 2.4.3 |
| Import Excel format không chuẩn | 🟡 Trung bình | Template hóa, validate strict |
| Province-level config phức tạp | 🟡 Trung bình | Config trong JSONB params — flexible |
| Policy versioning race condition (tháng chuyển giao) | 🟡 Trung bình | Dùng `effective_from` để query chính xác |
| Quy chế VP HN chưa có tài liệu | 🟠 Cao | Hỏi Sponsor trước khi thiết kế pay_group HN |

---

## PHẦN 8 — TRÌNH TỰ TÀI LIỆU CẦN VIẾT

```
1. SRS Chi tiết (per Epic)
   ├── SRS-G01: Grade-Step Management
   ├── SRS-P01: Policy Engine (core)
   ├── SRS-P02: Policy Decision Management
   ├── SRS-I01: Input Data Hub
   ├── SRS-PAY01: Payroll Engine
   └── SRS-V01: Vehicle & Fuel

2. TechSpec (per layer)
   ├── DB Schema (Prisma migrations)
   ├── BE Architecture (Service/Repository/Event)
   └── API Contract (OpenAPI 3.0)

3. API Contract (per module)

4. UI/UX Spec (per screen)
   ├── Settings: Grade Builder, Policy Builder
   ├── HR: Input Hub, Payroll Batch, Payslip
   └── Mobile: Payslip Detail, Attendance Summary
```
