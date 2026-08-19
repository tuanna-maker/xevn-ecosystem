# PO-HRM-EMP-PROFILE-CATALOG-API-01.md — API CONTRACT SPECIFICATION
## HỢP ĐỒNG API PHÂN HỆ HỒ SƠ NHÂN VIÊN & DANH MỤC NHÂN SỰ

---

## 1. ENDPOINTS & CẤU TRÚC REQUEST / RESPONSE

### 1.1. `GET /api/hrm/employees`
- **Mục đích**: Lấy danh sách nhân viên theo phân trang và bộ lọc tenant/company.
- **Query Parameters**:
  - `company_id`: `string` (bắt buộc)
  - `page`: `number` (mặc định 1)
  - `page_size`: `number` (mặc định 20)
  - `keyword`: `string` (tìm theo mã hoặc tên)
  - `department`: `string` (bộ lọc phòng ban)
- **Response Contract (HTTP 200 OK)**:
```json
{
  "data": [
    {
      "id": "emp-uuid-001",
      "company_id": "main",
      "employee_code": "NV001",
      "full_name": "Nguyễn Văn A",
      "email": "a.nguyen@company.vn",
      "phone": "0901234567",
      "department": "DEPT_02",
      "department_name": "Vận hành",
      "position": "Đội trưởng Lái xe",
      "gender": "male",
      "employment_type": "full_time",
      "status": "active"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "pageSize": 20
  }
}
```

### 1.2. `GET /api/hrm/employees/:id`
- **Mục đích**: Lấy chi tiết hồ sơ nhân viên.
- **Response Contract (HTTP 200 OK)**:
```json
{
  "id": "emp-uuid-001",
  "company_id": "main",
  "employee_code": "NV001",
  "full_name": "Nguyễn Văn A",
  "department": "DEPT_02",
  "position": "Đội trưởng Lái xe",
  "job_title_key": "LEGAL_SPECIALIST",
  "gender": "male",
  "employment_type": "full_time",
  "status": "active"
}
```

### 1.3. `PATCH /api/hrm/employees/:id`
- **Mục đích**: Cập nhật hồ sơ nhân viên.
- **Request Body Contract**:
```json
{
  "full_name": "Nguyễn Văn A",
  "department": "DEPT_02",
  "position": "POS_01",
  "gender": "male",
  "employment_type": "full_time"
}
```

---

## 2. QUY ĐỊNH MÃ TRẢ VỀ & MÔ HÌNH LỖI (STATUS CODES & ERROR MODEL)
- **200 OK**: Thao tác thành công.
- **400 Bad Request**: Lỗi định dạng dữ liệu (Validation Error).
- **404 Not Found**: Không tìm thấy bản ghi nhân viên.
- **500 Internal Server Error**: Lỗi hệ thống backend.
