# SRS — XEVN HRM PAYROLL POLICY ENGINE v1.0
## Software Requirements Specification — Chi tiết đầy đủ
**Phiên bản:** 1.0 | **Ngày:** 2026-08-22 | **Trạng thái:** Draft  
**Căn cứ:** XEVN_POLICY_CATALOG.md · XEVN_MODULE_ANALYSIS_WBS.md · BRD_NEW.md · SRS_NEW.md

---

## 1. PHẠM VI

| Epic | Tên | Ưu tiên | Phụ thuộc |
|------|-----|---------|-----------|
| E0 | Foundation (Catalog + Employee + Attendance Extension) | P0 | — |
| E1 | Grade-Step Management | P0 | E0 |
| E2 | Policy Engine | P0 | E0, E1 |
| E3 | Input Data Hub | P0 | E0 |
| E4 | Payroll Engine Rewrite | P0 | E1, E2, E3 |
| E5 | Policy Decision Management | P1 | E2 |
| E6 | Vehicle & Fuel Tracking | P1 | E0 |
| E7 | Mobile Enhancement | P1 | E4 |

**Nguyên tắc bắt buộc (kế thừa từ SRS_NEW v1):**
- Multi-tenant row-level: mọi query filter `tenant_id`
- Soft-delete only: `deleted_at TIMESTAMPTZ NULL`
- Money columns: `BIGINT` (VND nguyên — không dùng float)
- Text IDs: `tenant_id`, `company_id` là TEXT, không FK cross-plane
- Versioning: thay đổi policy → tạo version mới, không sửa version cũ

---

## 2. EPIC E0 — FOUNDATION

### E0.1 Catalog Extension

**Catalog types cần thêm (platform-owned, is_platform=true):**

| type | Codes mẫu | metadata schema |
|------|----------|----------------|
| `GRADE` | D1..E2 (11 codes) | `{tier, max_step: int}` |
| `PAY_GROUP` | LX_TUYEN, LX_TAI, DPHH, TONG_DAI, VP_TINH, VP_HN | `{description}` |
| `PROVINCE` | ND, NB, TB, PT, VT, YB, HN | `{revenue_threshold_vnd, tier1_pct, tier2_pct, accident_deduction_pct}` |
| `VEHICLE_TYPE` | QKR_2T_HOT, NPR_35T_COLD, FRR_55T, DAU_KEO... | `{fuel_quota_per_100km, cargo_temp}` |
| `ROUTE_TYPE` | STANDARD, NOIBAI, SUPPORT | `{include_in_monthly_dt: bool}` |
| `SHIFT_TYPE` | CA_SANG, CA_CHIEU, HC, CA3 | `{start_hour, end_hour, work_hours}` |
| `COMPONENT_TYPE` | trip_rate_tiered, revenue_quality... (28 types) | `{is_deduction, input_source_options[]}` |
| `HOTLINE_CODE` | TD_1500, TD_1731 | `{pool_key}` |
| `OFFICE_BRANCH` | VP_NGOC_HOI, VP_NAM_DINH... (15+ codes) | `{milestone_1, milestone_2, milestone_3, branch_type}` |
| `POLICY_DECISION_TYPE` | ISSUE, AMEND, BONUS_AWARD, PROPOSAL | `{}` |

**BR-E0-01:** Tenant không thể xóa hoặc sửa platform catalog rows.  
**BR-E0-02:** PROVINCE metadata dùng để config công thức DT per-province (thay vì hardcode).

---

### E0.2 Employee Extension

**Migration: Thêm columns vào `employees`:**

| Column | Type | Default | Mô tả |
|--------|------|---------|-------|
| `grade_code` | TEXT | NULL | FK logic → catalog GRADE |
| `step_number` | SMALLINT | NULL | Bậc (1–9) |
| `pay_group_code` | TEXT | NULL | FK logic → catalog PAY_GROUP |
| `province_code` | TEXT | NULL | Tỉnh định biên (LX Tuyến) |
| `vehicle_type_code` | TEXT | NULL | Loại xe (LX Tải) |
| `hotline_code` | TEXT | NULL | Số TĐ (Tổng đài) |
| `is_probation` | BOOLEAN | FALSE | Đang thử việc |
| `probation_end_date` | DATE | NULL | Ngày hết thử việc |

**BR-E0-03:** `pay_group_code` bắt buộc khi contract ACTIVE.  
**BR-E0-04:** `grade_code` bắt buộc với pay_group IN ('VP_HN','LX_TUYEN','LX_TAI').

---

### E0.3 Attendance Extension

**Migration: Thêm columns vào `attendance_records`:**

| Column | Type | Default | Mô tả |
|--------|------|---------|-------|
| `shift_type_code` | TEXT | NULL | CA_SANG / CA_CHIEU / HC |
| `is_sunday` | BOOLEAN | FALSE | Trigger thưởng ăn ca 25k |
| `is_weekend` | BOOLEAN | FALSE | Thứ 7 hoặc CN |

**AttendanceSummaryService (mới):**
- Input: `(employee_id, period_month)`
- Output: `{working_days, sunday_count, weekend_count, total_hours, shift_breakdown, attendance_pct_of_standard}`
- Được gọi bởi Payroll Batch để tính: thưởng chuyên cần, ăn ca CN, pool ratio TĐ

---

## 3. EPIC E1 — GRADE-STEP MANAGEMENT

### Use Cases

**UC-E1-01: Quản lý Thang bảng lương (Versioned)**
- Actor: HR_ADMIN
- Tạo/sửa thang bảng lương theo QĐ
- Mỗi QĐ mới → version mới với `effective_from` mới
- Version cũ tự set `effective_to = new_effective_from - 1`
- **BR-E1-01:** Không xóa grade đang được NV dùng
- **BR-E1-02:** Lương bậc lưu dạng BIGINT VND

**UC-E1-02: Gán Ngạch-Bậc cho Nhân viên**
- Actor: HR_MANAGER
- Chọn NV → Chọn grade → Chọn step → Ngày hiệu lực → Lưu
- **BR-E1-03:** Tạo record mới trong `employee_grade_assignments`, không xóa record cũ

**UC-E1-03: Đề xuất Nâng bậc (Workflow)**
- Actor: DEPT_MANAGER → HR_MANAGER → BGĐ
- Hệ thống auto-check: ≥730 ngày liên tục + KPI ≥80% (4 kỳ) + không kỷ luật
- Reuse XBOS Workflow Engine
- **BR-E1-04:** Nâng tối đa 1 bậc/lần; không nâng nếu đang ở bậc max

### DB Schema

```sql
CREATE TABLE IF NOT EXISTS pay_grade_definitions (
  id              BIGSERIAL     PRIMARY KEY,
  tenant_id       TEXT          NOT NULL DEFAULT '',
  grade_code      TEXT          NOT NULL,
  grade_name      TEXT          NOT NULL,
  effective_from  DATE          NOT NULL,
  effective_to    DATE          NULL,
  created_by      TEXT          NOT NULL DEFAULT '',
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ   NULL,
  CONSTRAINT chk_grade_period CHECK (effective_to IS NULL OR effective_to >= effective_from)
);

CREATE INDEX IF NOT EXISTS idx_pay_grade_def_tenant_code
  ON pay_grade_definitions (tenant_id, grade_code)
  WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS pay_grade_steps (
  id              BIGSERIAL     PRIMARY KEY,
  grade_def_id    BIGINT        NOT NULL,
  step_number     SMALLINT      NOT NULL CHECK (step_number BETWEEN 1 AND 9),
  monthly_salary  BIGINT        NOT NULL CHECK (monthly_salary > 0)
);

CREATE TABLE IF NOT EXISTS employee_grade_assignments (
  id              BIGSERIAL     PRIMARY KEY,
  tenant_id       TEXT          NOT NULL DEFAULT '',
  employee_id     TEXT          NOT NULL,
  grade_def_id    BIGINT        NOT NULL,
  step_number     SMALLINT      NOT NULL,
  effective_from  DATE          NOT NULL,
  reason          TEXT          NULL,
  approved_by     TEXT          NULL,
  created_by      TEXT          NOT NULL DEFAULT '',
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_emp_grade_assign_emp_date
  ON employee_grade_assignments (tenant_id, employee_id, effective_from DESC);
```

---

## 4. EPIC E2 — POLICY ENGINE

### Use Cases

**UC-E2-01: Tạo Chính sách Lương**
- Actor: HR_ADMIN
- Chọn Pay Group → Đặt tên + ngày hiệu lực → Thêm income_components → Config params → Preview → Submit
- **BR-E2-01:** Policy ACTIVE không sửa trực tiếp — dùng Clone để tạo version mới
- **BR-E2-02:** Policy DRAFT không dùng để tính lương batch

**UC-E2-02: Gán Policy cho Nhân viên/Nhóm**
- Actor: HR_ADMIN
- Gán cho từng NV hoặc toàn bộ nhóm pay_group
- **BR-E2-03:** Khi gán policy mới, policy cũ tự close `effective_to`
- **BR-E2-04:** 1 NV chỉ có 1 policy ACTIVE tại 1 thời điểm

**UC-E2-03: Preview Tính thử**
- Actor: HR_ADMIN
- Nhập data mẫu (số lượt, DT, điểm CLDV...) → hệ thống tính + hiển thị breakdown
- Không lưu vào payroll records

### 30 Component Types và Params Schema (Dynamic Configuration)

Hệ thống thiết kế theo kiến trúc Dynamic Rendering. Bảng `params` (JSONB) không giới hạn cấu trúc, UI Frontend (React) sẽ render Component tương ứng (Flat form hoặc Tiered Table) dựa trên `component_type`.

| # | Nhóm | component_type | params (JSONB) schema (Gợi ý) | Loại UI Render |
|---|---|---------------|-----------------------------|---------------|
| 1 | Chung | `grade_base` | _(auto tính theo bảng lương ngạch-bậc, không cần điền JSON)_ | Read-only |
| 2 | Chung | `grade_allowance` | `locations: [{ province, amount }]` | Tiered Table |
| 3 | Chung | `kpi_bonus_pct` | `grade_code, max_pct, overachieve_multiplier` | Tiered Table |
| 4 | LXTuyen | `trip_rate_tiered` | `province_code`, `tiers: [{ min, max, rate }]` | Tiered Table |
| 5 | LXTuyen | `revenue_quality` | `province_code, thresholds, cldv_table` | Tiered Table |
| 6 | LXTuyen | `cpn_commission` | `pct_rate: 10` | Flat Input |
| 7 | LXTuyen | `contract_fee` | `fee_table:[{type, flat_vnd, revenue_pct}]` | Tiered Table |
| 8 | LXTuyen | `vehicle_repair_deduction` | `group_pct, accident_pct` | Flat Input |
| 9 | LXTuyen | `attendance_bonus_conditional` | `conditions, amount_vnd` | Tiered Table |
| 10 | LXTuyen | `meal_allowance_conditional` | `rate_per_sunday: 25000` | Flat Input |
| 11 | LXTuyen | `remote_work_allowance` | `rates_by_type: [{ type, amount }]` | Tiered Table |
| 12 | LXTai | `fixed_base_salary` | `vehicle_type_code, salary_vnd` | Tiered Table |
| 13 | LXTai | `vehicle_mgmt_allowance` | `amount_vnd` | Flat Input |
| 14 | LXTai | `revenue_commission_tiered` | `driver_type, tiers: [{ max_rev, pct }]` | Tiered Table |
| 15 | LXTai | `clhd_point_deduction` | `vnd_per_point, penalty_table` | Tiered Table |
| 16 | LXTai | `loading_support` | `driver_type, flat_amount_vnd` | Tiered Table |
| 17 | LXTai | `fuel_quota_deduction` | `vehicle_type, quota_per_100km` | Tiered Table |
| 18 | DPHH | `kpi_pool_share` | `region, pool_amount` | Flat Input |
| 19 | DPHH | `revenue_commission_sent` | `tiers: [{ rev_min, pct }]` | Tiered Table |
| 20 | DPHH | `revenue_commission_received` | `tiers: [{ rev_max, pct }]` | Tiered Table |
| 21 | DPHH | `team_milestone_bonus` | `branch_code, milestones: [{ m1, m2, m3 }]` | Tiered Table |
| 22 | DPHH | `delivery_commission` | `region, pct_rate, pool_tiers` | Tiered Table |
| 23 | TD | `zero_sum_pool_base` | `pool_amount, standard_days` | Flat Input |
| 24 | TD | `zero_sum_pool_bonus` | `pool_contract_am, pool_contract_pm` | Tiered Table |
| 25 | TD | `kpi_multiplier` | `miss_rate_tiers: [{ max_rate, multiplier }]` | Tiered Table |
| 26 | TD | `ranking_bonus` | `rank_tiers: [{ rank, amount_vnd }]` | Tiered Table |
| 27 | TD | `special_allowance_app` | `rate_per_hour` | Flat Input |
| 28 | VP Tỉnh | `zero_sum_pool_branch` | `branch_code, customer_rate, mgmt_rate` | Tiered Table |
| 29 | VP Tỉnh | `branch_base_salary` | `branch_code, position, amount` | Tiered Table |
| 30 | Chung | `probation_salary` | `is_flat, amount_vnd, override_pct` | Flat Input |


### DB Schema

```sql
CREATE TABLE IF NOT EXISTS pay_policies (
  id               BIGSERIAL     PRIMARY KEY,
  tenant_id        TEXT          NOT NULL DEFAULT '',
  name             TEXT          NOT NULL,
  pay_group_code   TEXT          NOT NULL,
  description      TEXT          NULL,
  version          SMALLINT      NOT NULL DEFAULT 1,
  parent_policy_id BIGINT        NULL,
  effective_from   DATE          NOT NULL,
  effective_to     DATE          NULL,
  status           TEXT          NOT NULL DEFAULT 'DRAFT',
  created_by       TEXT          NOT NULL DEFAULT '',
  approved_by      TEXT          NULL,
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ   NOT NULL DEFAULT now(),
  deleted_at       TIMESTAMPTZ   NULL,
  CONSTRAINT chk_policy_status  CHECK (status IN ('DRAFT','ACTIVE','ARCHIVED')),
  CONSTRAINT chk_policy_period  CHECK (effective_to IS NULL OR effective_to >= effective_from)
);

CREATE TABLE IF NOT EXISTS pay_income_components (
  id               BIGSERIAL     PRIMARY KEY,
  policy_id        BIGINT        NOT NULL,
  component_type   TEXT          NOT NULL,
  name             TEXT          NOT NULL,
  effective_from   DATE          NOT NULL,
  effective_to     DATE          NULL,
  input_source     TEXT          NOT NULL DEFAULT 'manual',
  params           JSONB         NOT NULL DEFAULT '{}',
  sort_order       SMALLINT      NOT NULL DEFAULT 0,
  is_deduction     BOOLEAN       NOT NULL DEFAULT false,
  is_required      BOOLEAN       NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT now(),
  CONSTRAINT chk_input_source CHECK (
    input_source IN ('manual','excel_import','xbos_api','attendance_system','kpi_system','vehicle_system')
  )
);

CREATE TABLE IF NOT EXISTS pay_policy_assignments (
  id               BIGSERIAL     PRIMARY KEY,
  tenant_id        TEXT          NOT NULL DEFAULT '',
  employee_id      TEXT          NOT NULL,
  policy_id        BIGINT        NOT NULL,
  effective_from   DATE          NOT NULL,
  effective_to     DATE          NULL,
  assigned_by      TEXT          NOT NULL DEFAULT '',
  reason           TEXT          NULL,
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_policy_assign_emp_active
  ON pay_policy_assignments (tenant_id, employee_id, effective_from DESC)
  WHERE effective_to IS NULL;
```

---

## 5. EPIC E3 — INPUT DATA HUB

### Use Cases

**UC-E3-01: Upload dữ liệu đầu vào lương (Excel)**
- Actor: HR_STAFF
- Chọn kỳ + loại → tải template → điền → upload
- Hệ thống validate: format, employee matching, range check, duplicate
- Preview với highlight lỗi → sửa inline hoặc upload lại → Approve
- **BR-E3-01:** Upload lần 2 → version mới, hỏi xác nhận override
- **BR-E3-02:** Kỳ đã LOCKED không cho import
- **BR-E3-03:** Kỳ lương cần đủ tất cả import types của pay_group trước khi batch

**Template columns per input_type:**

| input_type | Cột bắt buộc | Cột tuỳ chọn |
|-----------|-------------|-------------|
| `TRIP_LOG` | ma_nv, tinh_code, so_luot_t1, so_luot_t2 | so_luot_noibai, so_luot_ho_tro, dt_hop_dong_vnd |
| `REVENUE_CLDV` | ma_nv, doanh_thu_vnd, diem_cldv | dt_cpn_vnd, dt_khan_nuoc_vnd |
| `MAINTENANCE_COST` | to_xe_id, cp_sua_chua_vnd, loai_xe | loai_vi_pham |
| `FREIGHT_REVENUE` | ma_nv, loai_xe_code, doanh_thu_vnd | diem_clhd_points |
| `DPHH_REVENUE` | van_phong_code, dt_gui_vnd, dt_nhan_vnd, ma_nv, gio_cong | dt_giao_hang_vnd |
| `HOTLINE_STATS` | ma_nv, so_td_code, cuoc_nghe, gio_lam, ty_le_nho_pct | hd_ky_count, diem_cldv |
| `BRANCH_STATS` | chi_nhanh_code, so_khach, so_xe | cp_phat_sinh_vnd |

### DB Schema

```sql
CREATE TABLE IF NOT EXISTS pay_input_imports (
  id               BIGSERIAL     PRIMARY KEY,
  tenant_id        TEXT          NOT NULL DEFAULT '',
  period_month     DATE          NOT NULL,
  input_type       TEXT          NOT NULL,
  version          SMALLINT      NOT NULL DEFAULT 1,
  status           TEXT          NOT NULL DEFAULT 'PENDING',
  file_url         TEXT          NULL,
  total_rows       INTEGER       NOT NULL DEFAULT 0,
  error_rows       INTEGER       NOT NULL DEFAULT 0,
  uploaded_by      TEXT          NOT NULL DEFAULT '',
  validated_at     TIMESTAMPTZ   NULL,
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT now(),
  deleted_at       TIMESTAMPTZ   NULL,
  CONSTRAINT chk_import_status CHECK (
    status IN ('PENDING','VALIDATED','APPROVED','ERROR','SUPERSEDED')
  )
);

CREATE TABLE IF NOT EXISTS pay_input_rows (
  id               BIGSERIAL     PRIMARY KEY,
  import_id        BIGINT        NOT NULL,
  employee_id      TEXT          NULL,
  raw_employee_ref TEXT          NOT NULL,
  data             JSONB         NOT NULL DEFAULT '{}',
  row_status       TEXT          NOT NULL DEFAULT 'OK',
  error_message    TEXT          NULL,
  overridden_by    TEXT          NULL,
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT now(),
  CONSTRAINT chk_row_status CHECK (
    row_status IN ('OK','ERROR','WARNING','OVERRIDDEN')
  )
);

CREATE INDEX IF NOT EXISTS idx_pay_input_rows_import
  ON pay_input_rows (import_id, row_status);
```

---

## 6. EPIC E4 — PAYROLL ENGINE REWRITE

### Use Cases

**UC-E4-01: Chạy Batch Tính lương**
- Actor: HR_MANAGER
- Pre-check imports → Batch tính → Pool aggregation → BHXH/PIT → Save → 6-step approval

**Luồng kỹ thuật:**
```
For each employee in batch:
  1. Load active policy tại period_month
  2. Load AttendanceSummary (từ AttendanceSummaryService)
  3. Load GradeStep hiện tại
  4. Load input rows từ pay_input_rows (per employee)
  5. For each income_component in policy (sort_order ASC):
       result = ComponentCalculator[component_type].calculate(...)
       accumulate results
  
After all employees:
  6. GroupBy pool_key → PoolCalculationService.distribute()
  7. For each employee: apply pool share
  8. Calculate BHXH(8%) + BHYT(1.5%) + BHTN(1%) từ grade_base salary
  9. Calculate PIT (progressive table)
  10. Save payroll_records với components[] JSONB + policy_snapshot JSONB
```

**ComponentCalculator interface:**
```typescript
interface ComponentCalculator {
  readonly componentType: string;
  calculate(ctx: CalcContext): Promise<ComponentResult>;
}

type CalcContext = {
  component: PayIncomeComponent;  // params JSONB
  inputBag: Record<string, unknown>; // từ pay_input_rows
  attendance: AttendanceSummary;
  gradeStep: { grade_code: string; step_number: number; salary_vnd: bigint } | null;
  employeeId: string;
  periodMonth: Date;
};

type ComponentResult = {
  component_type: string;
  amount_vnd: bigint;        // âm = deduction
  breakdown: JsonObject;     // chi tiết công thức
  warnings: string[];
};
```

**BR-E4-01:** Batch đã LOCKED không chạy lại.  
**BR-E4-02:** Pool calculation chỉ sau khi tất cả NV trong pool tính xong phần non-pool.  
**BR-E4-03:** Lưu `policy_snapshot` (copy toàn bộ policy+components tại thời điểm tính) để audit.

**UC-E4-02: Xem Payslip chi tiết**
- EMPLOYEE: tự xem payslip của mình
- HR/Finance: xem tất cả
- Cấu trúc response: `{employee, period, components[], subtotal_income, subtotal_deductions, pit, net, status}`

### DB Update

```sql
ALTER TABLE payroll_records
  ADD COLUMN IF NOT EXISTS policy_id          BIGINT      NULL,
  ADD COLUMN IF NOT EXISTS policy_snapshot    JSONB       NULL,
  ADD COLUMN IF NOT EXISTS components         JSONB       NULL,
  ADD COLUMN IF NOT EXISTS input_import_refs  JSONB       NULL;
```

---

## 7. EPIC E5 — POLICY DECISION MANAGEMENT

### Use Cases

**UC-E5-01: Tạo và Phê duyệt Quyết định**

| Loại QĐ | Hành động khi APPROVED |
|---------|----------------------|
| ISSUE | Tạo pay_policy mới với status=ACTIVE |
| AMEND | Clone policy đang ACTIVE → version mới với params cập nhật |
| BONUS_AWARD | Tạo `attendance_bonus_conditional` hoặc `special_allowance` component với period_to |
| PROPOSAL | Lưu nháp BGĐ xem → khi approved → chọn 1 trong 3 loại trên |

**BR-E5-01:** `decision_code` unique trong tenant.  
**BR-E5-02:** QĐ đã APPROVED không sửa/xóa.

### DB Schema

```sql
CREATE TABLE IF NOT EXISTS pay_policy_decisions (
  id                    BIGSERIAL     PRIMARY KEY,
  tenant_id             TEXT          NOT NULL DEFAULT '',
  decision_code         TEXT          NOT NULL,
  decision_type         TEXT          NOT NULL,
  title                 TEXT          NOT NULL,
  content               TEXT          NULL,
  issued_date           DATE          NOT NULL,
  effective_date        DATE          NOT NULL,
  status                TEXT          NOT NULL DEFAULT 'DRAFT',
  approved_by           TEXT          NULL,
  approved_at           TIMESTAMPTZ   NULL,
  reject_reason         TEXT          NULL,
  resulting_policy_id   BIGINT        NULL,
  created_by            TEXT          NOT NULL DEFAULT '',
  created_at            TIMESTAMPTZ   NOT NULL DEFAULT now(),
  deleted_at            TIMESTAMPTZ   NULL,
  CONSTRAINT chk_decision_type   CHECK (decision_type IN ('ISSUE','AMEND','BONUS_AWARD','PROPOSAL')),
  CONSTRAINT chk_decision_status CHECK (status IN ('DRAFT','PENDING_APPROVAL','APPROVED','REJECTED'))
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_policy_decision_code_active
  ON pay_policy_decisions (tenant_id, decision_code)
  WHERE deleted_at IS NULL;
```

---

## 8. EPIC E6 — VEHICLE & FUEL TRACKING

### DB Schema

```sql
CREATE TABLE IF NOT EXISTS vehicles (
  id                  BIGSERIAL     PRIMARY KEY,
  tenant_id           TEXT          NOT NULL DEFAULT '',
  plate_number        TEXT          NOT NULL,
  vehicle_type_code   TEXT          NOT NULL,
  driver_employee_id  TEXT          NULL,
  status              TEXT          NOT NULL DEFAULT 'ACTIVE',
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT now(),
  deleted_at          TIMESTAMPTZ   NULL
);

CREATE TABLE IF NOT EXISTS vehicle_fuel_logs (
  id                  BIGSERIAL     PRIMARY KEY,
  vehicle_id          BIGINT        NOT NULL,
  period_month        DATE          NOT NULL,
  actual_km           INTEGER       NOT NULL DEFAULT 0,
  quota_per_100km     NUMERIC(5,2)  NOT NULL,
  quota_liters        NUMERIC(8,2)  NOT NULL,
  actual_liters       NUMERIC(8,2)  NULL,
  over_quota_liters   NUMERIC(8,2)  NULL,
  deduction_vnd       BIGINT        NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT now()
);
```

---

## 9. EPIC E7 — MOBILE ENHANCEMENT

**UC-E7-01: Payslip chi tiết (Mobile)**
- Accordion per income component (expand → xem breakdown)
- Màu xanh = income; màu đỏ = deduction
- Hiển thị ngạch, bậc, nhóm lương

**UC-E7-02: Ca làm việc khi check-in**
- Dropdown chọn ca: CA_SANG / CA_CHIEU / HC
- Badge ngày CN trên lịch attendance
- Monthly summary: quota công chuẩn vs thực tế

---

## 10. API CONTRACT

```
# Grade Management
GET    /api/hrm/grades
POST   /api/hrm/grades
GET    /api/hrm/grades/:id/steps
PUT    /api/hrm/grades/:id/steps
POST   /api/hrm/employees/:id/grade-assignment
GET    /api/hrm/employees/:id/grade-history
POST   /api/hrm/grade-promotions

# Policy Engine
GET    /api/hrm/pay-policies
POST   /api/hrm/pay-policies
GET    /api/hrm/pay-policies/:id
POST   /api/hrm/pay-policies/:id/clone
GET    /api/hrm/pay-policies/:id/components
POST   /api/hrm/pay-policies/:id/components
PUT    /api/hrm/pay-policies/:id/components/:cid
POST   /api/hrm/pay-policies/:id/preview
POST   /api/hrm/pay-policies/:id/assign
GET    /api/hrm/employees/:id/policy-assignment

# Input Data Hub
GET    /api/hrm/payroll-inputs/templates/:type
POST   /api/hrm/payroll-inputs/import
GET    /api/hrm/payroll-inputs/:period
GET    /api/hrm/payroll-inputs/:id/rows
PUT    /api/hrm/payroll-inputs/:id/rows/:rowId
POST   /api/hrm/payroll-inputs/:id/approve

# Payroll Batch
POST   /api/hrm/payroll/batch
GET    /api/hrm/payroll/batch/:id
GET    /api/hrm/payroll/batch/:id/records
GET    /api/hrm/payroll/records/:id/payslip
GET    /api/hrm/payroll/records/:id/payslip.pdf
POST   /api/hrm/payroll/batch/:id/approve
POST   /api/hrm/payroll/batch/:id/lock

# Policy Decisions
GET    /api/hrm/policy-decisions
POST   /api/hrm/policy-decisions
GET    /api/hrm/policy-decisions/:id
POST   /api/hrm/policy-decisions/:id/approve

# Vehicle & Fuel
GET    /api/hrm/vehicles
POST   /api/hrm/vehicles
PUT    /api/hrm/vehicles/:id
POST   /api/hrm/vehicles/:id/fuel-logs
GET    /api/hrm/vehicles/:id/fuel-logs
```

---

## 11. ACCEPTANCE CRITERIA

| Epic | Criteria | Priority |
|------|---------|---------|
| E1 | Bảng 11×9 edit được; version theo QĐ; nâng bậc workflow | P0 |
| E1 | Gán ngạch-bậc → lịch sử lưu không mất | P0 |
| E2 | Tạo policy 5+ components; preview cho kết quả đúng | P0 |
| E2 | Clone policy → version mới; policy cũ tự close | P0 |
| E2 | Gán cho NV → 1 policy active tại 1 thời điểm | P0 |
| E3 | Upload TRIP_LOG → validate → preview error rows → approve | P0 |
| E3 | Upload lần 2 cùng kỳ → hỏi override | P0 |
| E4 | Batch 100 NV < 5 phút | P0 |
| E4 | Pool TĐ: ∑ shares = pool_amount (zero-sum đúng) | P0 |
| E4 | Payslip hiển thị từng component + breakdown | P0 |
| E4 | Batch LOCKED không cho sửa | P0 |
| E5 | QĐ AMEND → approve → policy version mới tự tạo | P1 |
| E6 | Km nhập → tính vượt/thiếu đúng bảng quota | P1 |
| E7 | Payslip mobile có accordion component | P1 |

---

## 12. CẤU HÌNH THAM SỐ TOÀN CỤC (GLOBAL SETTINGS)

Để đảm bảo tính linh hoạt của hệ thống Payroll mà không phụ thuộc vào việc hardcode các con số kinh doanh, toàn bộ các tham số có thể thay đổi sẽ được đưa vào module **Cấu hình tham số lương (Payroll Parameters)** trong màn hình `Cài đặt` (Settings).

Các cấu hình bắt buộc phải có màn hình để HR/Admin tự định nghĩa:

| Nhóm Cấu hình | Mô tả & Tham số | Mức độ |
|---|---------|----------|
| **Cơ chế đặc thù** | Loại hình trả lương (Ngạch-bậc, Pool) cho từng nhóm/vùng (VD: VP Hà Nội). | 🔴 Quan trọng |
| **Hạn mức & Tỷ lệ** | Tỷ lệ % cho phép tạm ứng tối đa trên mức lương cơ sở/dự kiến; Tỷ lệ thưởng chuyên cần. | 🔴 Quan trọng |
| **Định mức doanh thu** | Mức 1 / Mức 2 doanh thu thưởng (áp dụng cho LX Tải hoặc các đối tượng tương tự) theo loại xe. | 🔴 Quan trọng |
| **Quỹ thưởng (Pool)** | Công thức phân bổ quỹ thưởng (Pool) cho từng nhóm (VD: TĐ 1500 vs 1731), chia theo trọng số, cổ phần hay cào bằng. | 🟠 Trung bình |
| **Phân quyền dữ liệu** | Phân định rõ phòng ban (HR, Fleet, v.v.) nào được quyền nhập/Duyệt điểm phạt CLHĐ, chi phí nhiên liệu. | 🟡 Thấp |
| **Thời hạn áp dụng** | Ngày hết hạn của các khoản phụ cấp/thưởng đặc biệt (VD: Thưởng chuyên cần LX Tuyến hết hạn gia hạn). | 🟡 Thấp |

*Ghi chú:* Các thông số này phải được fetch thông qua API từ `hrm-api` để Policy Engine tính toán tự động dựa trên thời điểm tính lương, tránh bị lỗi logic khi số liệu kinh doanh thay đổi.
