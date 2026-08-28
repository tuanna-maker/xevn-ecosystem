# API Contract: Payroll Data Source Mapping & Template Assignment

**Version:** 1.0

## 1. DTO Cập nhật (Update DTOs)

### 1.1 Tạo/Sửa Thành phần lương (Salary Component)
**Endpoint:** `POST /hrm/salary-components` và `PUT /hrm/salary-components/:id`

**Payload Bổ sung:**
```typescript
{
  // ... fields cũ (code, name, type...)
  "data_source_type": "SYSTEM_CONTRACT" | "TIMESHEET" | "INPUT_HUB" | "FORMULA" | "CONSTANT",
  "source_mapping_key": "string | null" // Bắt buộc nếu type != FORMULA/CONSTANT
}
```

## 2. Endpoints Mới (New Endpoints)

### 2.1 Gán/Cập nhật Mẫu Bảng Lương cho Nhân Viên (Bulk Assign)
**Endpoint:** `POST /hrm/payroll-templates/assign-employees`
**Method:** POST
**Mô tả:** Gán 1 hoặc nhiều nhân viên vào 1 hoặc nhiều Mẫu bảng lương.

**Request Payload:**
```json
{
  "employee_ids": ["uuid-1", "uuid-2"],
  "assignments": [
    {
      "template_id": "uuid-template-A",
      "effective_from": "2026-01-01",
      "effective_to": null
    },
    {
      "template_id": "uuid-template-B",
      "effective_from": "2026-01-01",
      "effective_to": "2026-12-31"
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Đã gán thành công 2 nhân viên vào các bảng lương được chọn."
}
```

### 2.2 Hủy gán Nhân viên khỏi Mẫu (Unassign)
**Endpoint:** `POST /hrm/payroll-templates/unassign-employees`
**Method:** POST

**Request Payload:**
```json
{
  "employee_id": "uuid-1",
  "template_id": "uuid-template-A"
}
```

### 2.3 Lấy danh sách Nhân viên đã được gán (List Assigned Employees)
**Endpoint:** `GET /hrm/payroll-templates/:id/employees`
**Method:** GET

**Query Parameters:**
- `status`: `active`, `upcoming`, `expired`
- `search`: string

**Response:**
```json
{
  "data": [
    {
      "assignment_id": "uuid-assign-1",
      "employee_id": "uuid-1",
      "employee_code": "NV001",
      "employee_name": "Nguyễn Văn A",
      "department_name": "Phòng Kế toán",
      "position_name": "Chuyên viên",
      "effective_from": "2026-01-01",
      "effective_to": null
    }
  ],
  "meta": { "total": 1, "page": 1 }
}
```
