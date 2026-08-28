# API CONTRACT — XEVN HRM PAYROLL POLICY ENGINE
## OpenAPI 3.0 — Endpoint Reference v1.0
**Base URL:** `/api/hrm`  
**Auth:** `Authorization: Bearer {HrmJwt}` (RS256, issued by xbos-api)  
**Tenant:** Extracted từ JWT claim `tenant_id`  
**Ngày:** 2026-08-22

---

## 1. GRADE MANAGEMENT

### `GET /grades`
Lấy danh sách grade definitions đang hiệu lực.

**Query Params:**
```
as_of_date?: string  # YYYY-MM-DD, default = today
```

**Response 200:**
```json
{
  "data": [
    {
      "id": 1,
      "grade_code": "M1",
      "grade_name": "Trưởng phòng",
      "effective_from": "2026-01-01",
      "effective_to": null,
      "steps": [
        { "step_number": 1, "monthly_salary_vnd": 8300000 },
        { "step_number": 2, "monthly_salary_vnd": 9400000 }
      ]
    }
  ]
}
```

---

### `POST /grades`
Tạo grade definition mới (version mới theo QĐ).

**Roles:** HR_ADMIN

**Body:**
```json
{
  "grade_code": "M1",
  "grade_name": "Trưởng phòng",
  "effective_from": "2026-01-01",
  "steps": [
    { "step_number": 1, "monthly_salary_vnd": 8300000 },
    { "step_number": 2, "monthly_salary_vnd": 9400000 },
    { "step_number": 3, "monthly_salary_vnd": 10500000 }
  ]
}
```

**Response 201:**
```json
{
  "id": 42,
  "grade_code": "M1",
  "effective_from": "2026-01-01"
}
```

**Errors:**
- `409` — grade_code đang có version ACTIVE chưa đóng (phải dùng close + create mới)

---

### `PUT /grades/:id/steps`
Cập nhật mức lương các bậc trong grade (chỉ khi grade DRAFT / chưa dùng).

**Body:**
```json
{
  "steps": [
    { "step_number": 1, "monthly_salary_vnd": 8500000 }
  ]
}
```

---

### `POST /employees/:id/grade-assignment`
Gán ngạch-bậc cho nhân viên.

**Roles:** HR_MANAGER

**Body:**
```json
{
  "grade_code": "M1",
  "step_number": 2,
  "effective_from": "2026-09-01",
  "reason": "Bổ nhiệm trưởng phòng theo QĐ 125/2026"
}
```

**Response 201:**
```json
{
  "assignment_id": 88,
  "employee_id": "EMP-001",
  "grade_code": "M1",
  "step_number": 2,
  "effective_from": "2026-09-01",
  "monthly_salary_vnd": 9400000
}
```

**Side effect:** `employees.grade_code` và `employees.step_number` tự update.

---

### `GET /employees/:id/grade-history`
Lịch sử ngạch-bậc của nhân viên.

**Response 200:**
```json
{
  "employee_id": "EMP-001",
  "history": [
    {
      "assignment_id": 88,
      "grade_code": "M1",
      "step_number": 2,
      "effective_from": "2026-09-01",
      "monthly_salary_vnd": 9400000,
      "reason": "Bổ nhiệm trưởng phòng",
      "created_by": "HR-001",
      "created_at": "2026-08-22T10:00:00Z"
    }
  ]
}
```

---

### `POST /grade-promotions`
Tạo đề xuất nâng bậc.

**Roles:** DEPT_MANAGER

**Body:**
```json
{
  "employee_id": "EMP-001",
  "proposed_step": 3,
  "reason": "Đủ 2 năm, KPI ≥ 80%"
}
```

**Response 201:**
```json
{
  "promotion_id": 5,
  "status": "PENDING_L1",
  "workflow_instance_id": "WF-123",
  "auto_checks": {
    "years_of_service": 2.3,
    "kpi_avg_4_quarters": 85.2,
    "has_active_discipline": false,
    "all_passed": true
  }
}
```

**Errors:**
- `422` — NV đang ở bậc max (không nâng được)
- `409` — NV đã có promotion request PENDING

---

## 2. POLICY ENGINE

### `GET /bonus-policies`
Lấy danh sách policies.

**Query Params:**
```
pay_group_code?: string
status?: 'DRAFT' | 'ACTIVE' | 'ARCHIVED'
```

**Response 200:**
```json
{
  "data": [
    {
      "id": 10,
      "name": "Lương LX Tuyến Nam Định v2",
      "pay_group_code": "LX_TUYEN",
      "status": "ACTIVE",
      "version": 2,
      "effective_from": "2025-09-01",
      "effective_to": null,
      "component_count": 8
    }
  ]
}
```

---

### `POST /pay-policies`
Tạo policy mới.

**Roles:** HR_ADMIN

**Body:**
```json
{
  "name": "Lương LX Tuyến Nam Định v2",
  "pay_group_code": "LX_TUYEN",
  "effective_from": "2025-09-01",
  "description": "Điều chỉnh đơn giá lượt theo QĐ 439/2025"
}
```

---

### `GET /pay-policies/:id`
Chi tiết policy + components.

**Response 200:**
```json
{
  "id": 10,
  "name": "Lương LX Tuyến Nam Định v2",
  "pay_group_code": "LX_TUYEN",
  "status": "ACTIVE",
  "version": 2,
  "effective_from": "2025-09-01",
  "effective_to": null,
  "components": [
    {
      "id": 101,
      "component_type": "trip_rate_tiered",
      "name": "Lương lượt",
      "sort_order": 1,
      "is_deduction": false,
      "input_source": "excel_import",
      "params": {
        "province_code": "ND",
        "tiers": [
          { "max_trips": 100, "rate_vnd": 65000 },
          { "max_trips": 999, "rate_vnd": 70000 }
        ],
        "support_rate_vnd": 70000,
        "noibai_rate_vnd": 50000,
        "sunday_meal_vnd": 25000
      }
    }
  ]
}
```

---

### `POST /pay-policies/:id/clone`
Clone policy với effective_from mới (tạo version mới).

**Body:**
```json
{
  "effective_from": "2026-01-01",
  "name": "Lương LX Tuyến Nam Định v3",
  "reason": "Điều chỉnh QĐ 816/2025"
}
```

**Response 201:**
```json
{
  "new_policy_id": 11,
  "version": 3,
  "cloned_from": 10,
  "status": "DRAFT"
}
```

**Side effect:** Policy gốc `effective_to` tự set = new `effective_from` - 1 ngày.

---

### `POST /pay-policies/:id/components`
Thêm income component vào policy.

**Roles:** HR_ADMIN (chỉ khi policy DRAFT)

**Body:**
```json
{
  "component_type": "attendance_bonus_conditional",
  "name": "Thưởng chuyên cần LX Tuyến",
  "sort_order": 10,
  "is_deduction": false,
  "input_source": "attendance_system",
  "effective_from": "2026-04-01",
  "params": {
    "min_working_days": 24,
    "exclude_weekend": true,
    "bonus_vnd": 1000000,
    "period_to": "2026-05-31"
  }
}
```

**Errors:**
- `400` — `component_type` không hợp lệ (không có trong 28 types)
- `409` — Policy đã ACTIVE (phải clone trước)

---

### `POST /pay-policies/:id/preview`
Tính thử với data mẫu.

**Body:**
```json
{
  "sample_input": {
    "TRIP_LOG": {
      "so_luot_t1": 85,
      "so_luot_t2": 20,
      "so_luot_noibai": 5,
      "so_luot_ho_tro": 3,
      "dt_hop_dong_vnd": 2000000
    },
    "REVENUE_CLDV": {
      "doanh_thu_vnd": 150000000,
      "diem_cldv": 9.6
    }
  },
  "sample_attendance": {
    "working_days": 26,
    "sunday_count": 4,
    "weekend_count": 8
  },
  "sample_grade": {
    "grade_code": "E2",
    "step_number": 3,
    "monthly_salary_vnd": 6100000
  }
}
```

**Response 200:**
```json
{
  "components": [
    {
      "component_type": "grade_base",
      "name": "Lương cơ bản ngạch-bậc",
      "amount_vnd": 6100000,
      "breakdown": { "grade_code": "E2", "step": 3 }
    },
    {
      "component_type": "trip_rate_tiered",
      "name": "Lương lượt",
      "amount_vnd": 7125000,
      "breakdown": {
        "luot_t1": 85, "rate_t1": 65000, "subtotal_t1": 5525000,
        "luot_t2": 20, "rate_t2": 70000, "subtotal_t2": 1400000,
        "ngay_cn": 4, "an_ca_cn": 100000
      }
    }
  ],
  "subtotal_income_vnd": 13225000,
  "warnings": []
}
```

---

### `POST /pay-policies/:id/assign`
Gán policy cho nhân viên hoặc nhóm.

**Body:**
```json
{
  "employee_ids": ["EMP-001", "EMP-002"],
  "effective_from": "2026-09-01",
  "reason": "Áp dụng chính sách mới"
}
```

---

### `GET /employees/:id/policy-assignment`
Policy đang active của nhân viên.

**Response 200:**
```json
{
  "employee_id": "EMP-001",
  "policy_id": 10,
  "policy_name": "Lương LX Tuyến Nam Định v2",
  "pay_group_code": "LX_TUYEN",
  "effective_from": "2025-09-01",
  "effective_to": null
}
```

---

## 3. INPUT DATA HUB

### `GET /payroll-inputs/templates/:type`
Tải template Excel cho loại input.

**Path Params:** `type` = TRIP_LOG | REVENUE_CLDV | MAINTENANCE_COST | FREIGHT_REVENUE | DPHH_REVENUE | HOTLINE_STATS | BRANCH_STATS

**Response 200:** File Excel binary (`application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`)

---

### `POST /payroll-inputs/import`
Upload file Excel.

**Content-Type:** `multipart/form-data`

**Form Fields:**
```
period_month: string  # YYYY-MM
input_type: string
file: binary (Excel file)
```

**Response 202:**
```json
{
  "import_id": 55,
  "status": "PENDING",
  "total_rows": 120,
  "message": "Đang validate, refresh sau 5 giây"
}
```

**Async:** Validation chạy background; client poll hoặc nhận websocket event.

---

### `GET /payroll-inputs/:period`
Danh sách imports cho kỳ lương.

**Path Params:** `period` = `2026-06` (YYYY-MM)

**Response 200:**
```json
{
  "period_month": "2026-06-01",
  "imports": [
    {
      "import_id": 55,
      "input_type": "TRIP_LOG",
      "status": "VALIDATED",
      "version": 1,
      "total_rows": 120,
      "error_rows": 3,
      "uploaded_by": "HR-001",
      "validated_at": "2026-08-22T10:30:00Z"
    }
  ],
  "missing_types": ["REVENUE_CLDV"]
}
```

---

### `GET /payroll-inputs/:id/rows`
Preview rows với trạng thái validate.

**Query Params:**
```
status?: 'OK' | 'ERROR' | 'WARNING'
page?: number (default 1)
limit?: number (default 50)
```

**Response 200:**
```json
{
  "import_id": 55,
  "rows": [
    {
      "row_id": 1001,
      "row_number": 2,
      "raw_employee_ref": "Nguyễn Văn A",
      "employee_id": "EMP-001",
      "row_status": "OK",
      "data": {
        "tinh_code": "ND",
        "so_luot_t1": 85,
        "so_luot_t2": 20
      }
    },
    {
      "row_id": 1002,
      "row_number": 3,
      "raw_employee_ref": "Trần Thị B",
      "employee_id": null,
      "row_status": "ERROR",
      "error_message": "Không tìm thấy nhân viên khớp với 'Trần Thị B'"
    }
  ],
  "total": 120,
  "error_count": 3
}
```

---

### `PUT /payroll-inputs/:id/rows/:rowId`
Override một row (sửa data hoặc gán employee_id thủ công).

**Body:**
```json
{
  "employee_id": "EMP-015",
  "data": {
    "so_luot_t1": 90
  }
}
```

**Response 200:**
```json
{
  "row_id": 1002,
  "row_status": "OVERRIDDEN",
  "overridden_by": "HR-001"
}
```

---

### `POST /payroll-inputs/:id/approve`
Approve import (sau khi HR review xong).

**Roles:** HR_MANAGER

**Response 200:**
```json
{
  "import_id": 55,
  "status": "APPROVED",
  "approved_by": "HR-001",
  "approved_at": "2026-08-22T11:00:00Z"
}
```

---

## 4. PAYROLL BATCH

### `POST /payroll/batch`
Tạo và chạy batch tính lương.

**Roles:** HR_MANAGER

**Body:**
```json
{
  "period_month": "2026-06",
  "pay_group_codes": ["LX_TUYEN", "DPHH"],
  "force_missing_inputs": false
}
```

**Response 202:**
```json
{
  "batch_id": "BATCH-2026-06-001",
  "status": "RUNNING",
  "employee_count": 87,
  "started_at": "2026-08-22T11:05:00Z",
  "missing_inputs": []
}
```

---

### `GET /payroll/batch/:id`
Trạng thái batch.

**Response 200:**
```json
{
  "batch_id": "BATCH-2026-06-001",
  "status": "COMPLETED",
  "period_month": "2026-06-01",
  "employee_count": 87,
  "total_gross_vnd": "1234567890",
  "total_net_vnd": "987654321",
  "started_at": "2026-08-22T11:05:00Z",
  "completed_at": "2026-08-22T11:07:30Z",
  "errors": []
}
```

---

### `GET /payroll/batch/:id/records`
Danh sách payroll records trong batch.

**Query Params:** `page`, `limit`, `search` (tên/mã NV)

**Response 200:**
```json
{
  "data": [
    {
      "record_id": 501,
      "employee_id": "EMP-001",
      "employee_name": "Nguyễn Văn A",
      "pay_group_code": "LX_TUYEN",
      "gross_vnd": "15200000",
      "net_vnd": "13450000",
      "status": "DRAFT"
    }
  ]
}
```

---

### `GET /payroll/records/:id/payslip`
Payslip chi tiết (breakdown từng component).

**Response 200:**
```json
{
  "record_id": 501,
  "employee": {
    "id": "EMP-001",
    "name": "Nguyễn Văn A",
    "grade_code": "E2",
    "step_number": 3,
    "pay_group_code": "LX_TUYEN",
    "province_code": "ND"
  },
  "period": { "month": 6, "year": 2026 },
  "components": [
    {
      "component_type": "grade_base",
      "name": "Lương cơ bản ngạch-bậc",
      "amount_vnd": "6100000",
      "is_deduction": false,
      "breakdown": { "grade_code": "E2", "step": 3 }
    },
    {
      "component_type": "trip_rate_tiered",
      "name": "Lương lượt",
      "amount_vnd": "7125000",
      "is_deduction": false,
      "breakdown": {
        "luot_t1": 85, "rate_t1": 65000,
        "luot_t2": 20, "rate_t2": 70000,
        "an_ca_cn_x4": 100000
      }
    },
    {
      "component_type": "vehicle_repair_deduction",
      "name": "Giảm trừ bảo dưỡng",
      "amount_vnd": "-250000",
      "is_deduction": true,
      "breakdown": { "group_cost": 2500000, "rate": 10 }
    }
  ],
  "subtotal_income_vnd": "14725000",
  "bhxh_vnd": "488000",
  "bhyt_vnd": "91500",
  "bhtn_vnd": "61000",
  "pit_vnd": "634500",
  "total_deductions_vnd": "1525000",
  "net_vnd": "13200000",
  "status": "DRAFT"
}
```

---

### `GET /payroll/records/:id/payslip.pdf`
Export payslip PDF.

**Response:** Binary PDF (`application/pdf`)

---

### `POST /payroll/batch/:id/approve`
HR/Finance phê duyệt batch.

**Response 200:**
```json
{ "batch_id": "BATCH-2026-06-001", "status": "APPROVED" }
```

---

### `POST /payroll/batch/:id/lock`
Lock batch (không cho sửa tiếp).

**Roles:** FINANCE_MANAGER

**Response 200:**
```json
{ "batch_id": "BATCH-2026-06-001", "status": "LOCKED", "locked_at": "2026-08-22T..." }
```

---

## 5. POLICY DECISIONS

### `GET /policy-decisions`
Danh sách quyết định.

**Query Params:** `decision_type`, `status`, `from_date`, `to_date`

---

### `POST /policy-decisions`
Tạo quyết định mới.

**Body:**
```json
{
  "decision_code": "QĐ-439/2025",
  "decision_type": "AMEND",
  "title": "Điều chỉnh cơ chế lương lái xe tuyến",
  "content": "...",
  "issued_date": "2025-10-29",
  "effective_date": "2025-09-01",
  "target_policy_id": 10
}
```

---

### `POST /policy-decisions/:id/approve`
BGĐ phê duyệt → trigger tạo policy version mới.

**Response 200:**
```json
{
  "decision_id": 20,
  "status": "APPROVED",
  "resulting_policy_id": 11,
  "resulting_policy_version": 3
}
```

---

## 6. VEHICLE & FUEL

### `GET /vehicles`

**Response 200:**
```json
{
  "data": [
    {
      "id": 1,
      "plate_number": "30H-12345",
      "vehicle_type_code": "FRR_55T",
      "vehicle_type_name": "5.5T FRR",
      "driver_employee_id": "EMP-050",
      "driver_name": "Lê Văn C",
      "fuel_quota_per_100km": 12.0
    }
  ]
}
```

---

### `POST /vehicles/:id/fuel-logs`
Nhập km thực tế tháng.

**Body:**
```json
{
  "period_month": "2026-06",
  "actual_km": 4200,
  "actual_liters": 520.5
}
```

**Response 201:**
```json
{
  "log_id": 88,
  "vehicle_id": 1,
  "period_month": "2026-06-01",
  "actual_km": 4200,
  "quota_liters": 504.0,
  "actual_liters": 520.5,
  "over_quota_liters": 16.5,
  "deduction_vnd": 0,
  "note": "Vượt 16.5L nhưng chưa đủ ngưỡng phạt"
}
```

---

## 7. ERROR CODES

| Code | HTTP | Mô tả |
|------|------|-------|
| `HRM-GRADE-NOT-FOUND` | 404 | Grade code không tồn tại |
| `HRM-GRADE-MAX-STEP` | 422 | NV đang ở bậc cao nhất |
| `HRM-POLICY-ACTIVE-NO-EDIT` | 409 | Policy ACTIVE không sửa trực tiếp |
| `HRM-POLICY-NO-CALC` | 400 | component_type không có calculator |
| `HRM-IMPORT-PERIOD-LOCKED` | 409 | Kỳ lương đã LOCKED |
| `HRM-IMPORT-TYPE-INVALID` | 400 | input_type không hợp lệ |
| `HRM-BATCH-RUNNING` | 409 | Batch đang chạy, không tạo batch mới |
| `HRM-BATCH-LOCKED` | 409 | Batch đã LOCKED, không cho sửa |
| `HRM-POOL-IMBALANCE` | 500 | Pool sum ≠ pool_amount (data integrity) |
| `HRM-EMPLOYEE-NO-POLICY` | 422 | NV không có policy active cho kỳ này |
| `HRM-PAY-FORMULA-VAR-NOT-ALLOWED` | 400 | Formula var key không được phép |
