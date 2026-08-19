# API Design — OpenAPI & DTO Contracts for Wave 1: Danh mục Ngạch bậc lương

| Meta | Value |
|---|---|
| work_item_id | BA-HRM-PAYROLL-GRADE-API-DESIGN-01 |
| ref_techspec | [BA_HRM_PAYROLL_GRADE_TECHSPEC_01_20260813.md](file:///C:/Users/ADMIN/OneDrive/Ta%CC%80i%20li%C3%AA%CC%A3u/Vibe%20Coding/projects/xevn-ecosystem/docs/program/deltas/BA_HRM_PAYROLL_GRADE_TECHSPEC_01_20260813.md) |
| ref_db_design | [BA_HRM_PAYROLL_GRADE_DB_DESIGN_01_20260813.md](file:///C:/Users/ADMIN/OneDrive/Ta%CC%80i%20li%C3%AA%CC%A3u/Vibe%20Coding/projects/xevn-ecosystem/docs/program/deltas/BA_HRM_PAYROLL_GRADE_DB_DESIGN_01_20260813.md) |
| ref_srs | [BA_HRM_PAYROLL_GRADE_SRS_01_20260813.md](file:///C:/Users/ADMIN/OneDrive/Ta%CC%80i%20li%C3%AA%CC%A3u/Vibe%20Coding/projects/xevn-ecosystem/docs/program/deltas/BA_HRM_PAYROLL_GRADE_SRS_01_20260813.md) |
| Ngày | 2026-08-13 |
| Trạng thái | CONFIRMED — Đủ điều kiện Handoff cho Dev FE/BE |

---

## 1. Ma trận Truy xuất SRS -> API -> CSDL (Traceability Matrix)

| SRS UC / FR ID | Tham chiếu Diễn biến SRS | Endpoints API | Controller / Service | Bảng CSDL ảnh hưởng |
|---|---|---|---|---|
| `UC-HRM-GRADE-01` / `FR-UC-GRADE-01` | Bước 1-8 (Nhập, validate & tạo bản ghi chờ duyệt) | `POST /api/v1/xbos/catalogs/publish` | `XbosCatalogController.publishCatalog` -> `CatalogGovernanceService` | `xbos_catalog_bundle`, `xbos_catalog_item` |
| `UC-HRM-GRADE-01` / `BR-GRADE-01` | Bước 9-11 (Người phê duyệt thứ 2 duyệt) | `POST /api/v1/xbos/catalogs/approve/:bundleId` | `XbosCatalogController.approveCatalog` -> `CatalogGovernanceService` | `xbos_catalog_bundle` |
| `UC-HRM-GRADE-02` / `FR-UC-GRADE-02` | Bước 1-7 (Áp dụng danh mục xuống tenant) | `POST /api/v1/xbos/catalogs/apply` | `XbosCatalogController.applyCatalogToMembers` -> `CatalogSyncService` | `pay_job_grade`, `pay_job_grade_step` |
| `UC-HRM-GRADE-03` / `FR-UC-GRADE-03` | Bước 1-5 (HR Admin công ty thành viên xem read-only) | `GET /api/v1/hrm/payroll-grades` | `HrmPayrollGradeController.findAll` -> `PayrollGradeService` | `pay_job_grade`, `pay_job_grade_step` |
| `UC-HRM-GRADE-03` | Xem chi tiết 1 Ngạch bậc | `GET /api/v1/hrm/payroll-grades/:code` | `HrmPayrollGradeController.findByCode` -> `PayrollGradeService` | `pay_job_grade`, `pay_job_grade_step` |

---

## 2. Chi tiết Endpoints Specs

### 2.1. `POST /api/v1/xbos/catalogs/publish` (XBOS Master Publish)

- **Mục đích:** Quản trị viên Tập đoàn tạo và gửi duyệt danh mục Ngạch bậc lương mới tại cấp Tập đoàn.
- **Nghiệp vụ xử lý:** Validate mã trùng, thứ tự tăng dần theo bậc, sàn lương tối thiểu vùng I, tạo bundle ở trạng thái `PENDING_APPROVAL`.
- **Tham chiếu Diễn biến SRS:** `UC-HRM-GRADE-01` Diễn biến bước #1, #3, #4, #5, #6, #7, #8.
- **Headers:** `Authorization: Bearer <token>`, `x-scope: xevn/holding`

**Request Body (`PublishGradeCatalogDto`):**
```json
{
  "domain": "hrm_payroll_grade",
  "effectiveDate": "2026-01-01",
  "items": [
    {
      "code": "D1",
      "name": "Ngạch D1 - Lãnh đạo cấp cao",
      "steps": [
        { "stepNumber": 1, "baseSalary": 15000000.00, "note": "Bậc I" },
        { "stepNumber": 2, "baseSalary": 17500000.00, "note": "Bậc II" }
      ]
    },
    {
      "code": "E1",
      "name": "Ngạch E1 - Nhân viên chuyên môn",
      "steps": [
        { "stepNumber": 1, "baseSalary": 6500000.00, "note": "Bậc I" },
        { "stepNumber": 2, "baseSalary": 7200000.00, "note": "Bậc II" }
      ]
    }
  ]
}
```

**Response `201 Created`:**
```json
{
  "success": true,
  "statusCode": 201,
  "data": {
    "bundleId": "bundle-2026-grade-001",
    "domain": "hrm_payroll_grade",
    "status": "PENDING_APPROVAL",
    "createdBy": "user-group-admin-01",
    "effectiveDate": "2026-01-01"
  }
}
```

**Error Responses:**
- `400 Bad Request`: `{"error": "INVALID_STEP_ORDER", "message": "Mức lương bậc 2 phải lớn hơn hoặc bằng bậc 1"}`
- `409 Conflict`: `{"error": "DUPLICATE_GRADE_CODE", "message": "Mã ngạch D1 đã tồn tại trong danh mục đang ban hành"}`

---

### 2.2. `POST /api/v1/xbos/catalogs/approve/:bundleId` (XBOS Approve Catalog)

- **Mục đích:** Người phê duyệt thứ 2 phê duyệt ban hành danh mục.
- **Nghiệp vụ xử lý:** Check `approved_by != created_by` (`BR-GRADE-01`), chuyển status sang `PUBLISHED`, emit event sync.
- **Tham chiếu Diễn biến SRS:** `UC-HRM-GRADE-01` Diễn biến bước #9, #10, #11.

**Response `200 OK`:**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "bundleId": "bundle-2026-grade-001",
    "status": "PUBLISHED",
    "approvedBy": "user-group-approver-02",
    "publishedAt": "2026-08-13T22:30:00Z"
  }
}
```

---

### 2.3. `GET /api/v1/hrm/payroll-grades` (Tenant Read-Only API)

- **Mục đích:** HR Admin tại công ty thành viên tra cứu danh mục Ngạch bậc lương đã được áp dụng.
- **Nghiệp vụ xử lý:** Đọc bảng `pay_job_grade` kèm `steps` của company hiện tại, trả về danh sách chỉ đọc.
- **Tham chiếu Diễn biến SRS:** `UC-HRM-GRADE-03` Diễn biến bước #1, #3, #4, #5.
- **Headers:** `Authorization: Bearer <token>`, `x-tenant-id: xevn`, `x-company-id: c1`

**Query Parameters:**
- `status`: `active` (default) | `archived`
- `search`: string (tìm theo `code` hoặc `name`)

**Response `200 OK`:**
```json
{
  "success": true,
  "statusCode": 200,
  "data": [
    {
      "id": "g-d1-001",
      "code": "D1",
      "name": "Ngạch D1 - Lãnh đạo cấp cao",
      "isReadOnly": true,
      "status": "active",
      "effectiveDate": "2026-01-01",
      "steps": [
        { "id": "s-d1-1", "stepNumber": 1, "baseSalary": 15000000.00, "note": "Bậc I" },
        { "id": "s-d1-2", "stepNumber": 2, "baseSalary": 17500000.00, "note": "Bậc II" }
      ]
    }
  ]
}
```
