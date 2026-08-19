# API Design — OpenAPI & DTO Contracts for Wave 3: Chức danh & Phòng ban/Chi nhánh

| Meta | Value |
|---|---|
| work_item_id | BA-HRM-POSITION-DEPARTMENT-API-DESIGN-01 |
| ref_techspec | [BA_HRM_POSITION_DEPARTMENT_TECHSPEC_01_20260813.md](file:///C:/Users/ADMIN/OneDrive/Ta%CC%80i%20li%C3%AA%CC%A3u/Vibe%20Coding/projects/xevn-ecosystem/docs/program/deltas/BA_HRM_POSITION_DEPARTMENT_TECHSPEC_01_20260813.md) |
| ref_db_design | [BA_HRM_POSITION_DEPARTMENT_DB_DESIGN_01_20260813.md](file:///C:/Users/ADMIN/OneDrive/Ta%CC%80i%20li%C3%AA%CC%A3u/Vibe%20Coding/projects/xevn-ecosystem/docs/program/deltas/BA_HRM_POSITION_DEPARTMENT_DB_DESIGN_01_20260813.md) |
| ref_srs | [BA_HRM_POSITION_DEPARTMENT_SRS_01_20260813.md](file:///C:/Users/ADMIN/OneDrive/Ta%CC%80i%20li%C3%AA%CC%A3u/Vibe%20Coding/projects/xevn-ecosystem/docs/program/deltas/BA_HRM_POSITION_DEPARTMENT_SRS_01_20260813.md) |
| Ngày | 2026-08-13 |
| Trạng thái | CONFIRMED — Đủ điều kiện Handoff cho Dev FE/BE |

---

## 1. Ma trận Truy xuất SRS -> API -> CSDL (Traceability Matrix)

| SRS UC / FR ID | Tham chiếu Diễn biến SRS | Endpoints API | Controller / Service | Bảng CSDL ảnh hưởng |
|---|---|---|---|---|
| `UC-HRM-DEPT-01` / `FR-HRM-DEPT-01-04` | Bước 1, 3, 6, 7 (Lấy danh sách / Cây Phòng ban) | `GET /api/v1/hrm/departments` | `HrmDepartmentController.findAll` -> `DepartmentService` | `pay_department` |
| `UC-HRM-DEPT-01` / `FR-HRM-DEPT-02-05` | Bước 3, 4, 5, 6 (Tạo Chi nhánh local, check vòng lặp) | `POST /api/v1/hrm/departments` | `HrmDepartmentController.create` -> `DepartmentService` + `CycleDetectionService` | `pay_department` |
| `UC-HRM-POS-01` / `FR-HRM-POS-01-04` | Bước 1, 2, 4 (Xem danh sách Chức danh gán Ngạch) | `GET /api/v1/hrm/positions` | `HrmPositionController.findAll` -> `PositionService` | `pay_position`, `pay_job_grade`, `pay_department` |
| `UC-HRM-POS-01` / `FR-HRM-POS-02` | Bước 2, 3, 4, 5 (Tạo Chức danh — BẮT BUỘC chọn Ngạch) | `POST /api/v1/hrm/positions` | `HrmPositionController.create` -> `PositionService` + `GradeValidator` | `pay_position` |

---

## 2. Chi tiết Endpoints Specs

### 2.1. `POST /api/v1/hrm/positions` (Tạo Chức danh — BẮT BUỘC Ngạch)

- **Mục đích:** HR Admin tạo mới Chức danh chuẩn hoá.
- **Nghiệp vụ xử lý:** Validate `gradeCode` NOT NULL (`BR-POS-01`), kiểm tra tồn tại của Ngạch bậc trong Wave 1 (`pay_job_grade`), gán phòng ban mặc định nếu có.
- **Tham chiếu Diễn biến SRS:** `UC-HRM-POS-01` Diễn biến bước #3, #4, #5, #6.
- **Headers:** `Authorization: Bearer <token>`, `x-tenant-id: xevn`, `x-company-id: c1`

**Request Body (`CreatePositionDto`):**
```json
{
  "code": "cd_lai_xe_tuyen",
  "name": "Lái xe tuyến (LXT)",
  "gradeCode": "E1",
  "defaultDepartmentId": "dept-pt-001",
  "historicalNote": "Gắn Ngạch E1 Wave 1"
}
```

**Response `201 Created`:**
```json
{
  "success": true,
  "statusCode": 201,
  "data": {
    "id": "pos-lxt-001",
    "code": "cd_lai_xe_tuyen",
    "name": "Lái xe tuyến (LXT)",
    "gradeCode": "E1",
    "defaultDepartmentId": "dept-pt-001",
    "status": "active",
    "createdAt": "2026-08-13T22:32:00Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: `{"error": "GRADE_CODE_REQUIRED", "message": "gradeCode là trường bắt buộc, không được để trống"}`
- `400 Bad Request`: `{"error": "INVALID_GRADE_CODE", "message": "Ngạch bậc E99 không tồn tại hoặc đã ngừng hoạt động"}`

---

### 2.2. `POST /api/v1/hrm/departments` (Tạo Chi nhánh local & Check Vòng lặp)

- **Mục đích:** HR Admin tạo mới Chi nhánh địa lý cục bộ (`department_type = branch`).
- **Nghiệp vụ xử lý:** Chạy `CycleDetectionService` để chặn vòng lặp phân cấp `parent_department_id` (`BR-DEPT-02`). Gắn `region_code` Vùng lương tối thiểu (`BR-DEPT-03`).
- **Tham chiếu Diễn biến SRS:** `UC-HRM-DEPT-01` Diễn biến bước #3, #4, #5, #6.

**Request Body (`CreateDepartmentDto`):**
```json
{
  "code": "cn_phu_ninh",
  "name": "Chi nhánh Phù Ninh",
  "departmentType": "branch",
  "parentDepartmentId": "dept-pt-001",
  "regionCode": "REGION_III"
}
```

**Response `201 Created`:**
```json
{
  "success": true,
  "statusCode": 201,
  "data": {
    "id": "dept-pn-002",
    "code": "cn_phu_ninh",
    "name": "Chi nhánh Phù Ninh",
    "departmentType": "branch",
    "parentDepartmentId": "dept-pt-001",
    "regionCode": "REGION_III",
    "isReadOnly": false,
    "status": "active"
  }
}
```

**Error Response:**
- `400 Bad Request`: `{"error": "DEPARTMENT_CYCLE_DETECTED", "message": "parentDepartmentId tạo thành vòng lặp đệ quy trong cây tổ chức"}`

---

### 2.3. `GET /api/v1/hrm/departments` (Danh sách Cây Phòng ban / Chi nhánh)

- **Mục đích:** Tra cứu cây tổ chức Phòng ban & Chi nhánh.
- **Query Params:** `format=tree` (trả về JSON dạng đệ quy) | `format=flat` (trả về danh sách phẳng).

**Response `200 OK` (format=tree):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": [
    {
      "id": "dept-pt-001",
      "code": "cn_phu_tho",
      "name": "Chi nhánh Phú Thọ",
      "departmentType": "branch",
      "regionCode": "REGION_II",
      "children": [
        {
          "id": "dept-pn-002",
          "code": "cn_phu_ninh",
          "name": "Chi nhánh Phù Ninh",
          "departmentType": "branch",
          "regionCode": "REGION_III",
          "children": []
        }
      ]
    }
  ]
}
```
