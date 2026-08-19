# API Design — OpenAPI & DTO Contracts for Wave 8 + Wave 9: Thành phần lương & Phụ cấp/Thưởng/Khấu trừ

| Meta | Value |
|---|---|
| work_item_id | BA-HRM-PAYROLL-COMPONENT-API-DESIGN-01 |
| ref_techspec | [BA_HRM_PAYROLL_COMPONENT_TECHSPEC_01_20260813.md](file:///C:/Users/ADMIN/OneDrive/Ta%CC%80i%20li%C3%AA%CC%A3u/Vibe%20Coding/projects/xevn-ecosystem/docs/program/deltas/BA_HRM_PAYROLL_COMPONENT_TECHSPEC_01_20260813.md) |
| ref_db_design | [BA_HRM_PAYROLL_COMPONENT_DB_DESIGN_01_20260813.md](file:///C:/Users/ADMIN/OneDrive/Ta%CC%80i%20li%C3%AA%CC%A3u/Vibe%20Coding/projects/xevn-ecosystem/docs/program/deltas/BA_HRM_PAYROLL_COMPONENT_DB_DESIGN_01_20260813.md) |
| ref_srs | [BA_HRM_PAYROLL_COMPONENT_SRS_01_20260813.md](file:///C:/Users/ADMIN/OneDrive/Ta%CC%80i%20li%C3%AA%CC%A3u/Vibe%20Coding/projects/xevn-ecosystem/docs/program/deltas/BA_HRM_PAYROLL_COMPONENT_SRS_01_20260813.md) |
| Ngày | 2026-08-13 |
| Trạng thái | CONFIRMED — Đủ điều kiện Handoff cho Dev FE/BE |

---

## 1. Ma trận Truy xuất SRS -> API -> CSDL (Traceability Matrix)

| SRS UC / FR ID | Tham chiếu Diễn biến SRS | Endpoints API | Controller / Service | Bảng CSDL ảnh hưởng |
|---|---|---|---|---|
| `UC-HRM-PAYCAT-01` / `FR-PAYCAT-01` | Ban hành Thành phần lương chung | `POST /api/v1/xbos/catalogs/components/publish` | `XbosComponentController.publish` -> `CatalogGovernanceService` | `pay_component` |
| `UC-HRM-PAYCAT-02` / `FR-PAYCAT-02` | Thêm Thành phần lương riêng theo company/branch | `POST /api/v1/hrm/payroll-components` | `HrmComponentController.createLocal` -> `PayComponentService` | `pay_component` |
| `UC-HRM-PAYCAT-03` / `FR-PAYCAT-03` | Phân loại / Đổi nhóm thành phần lương | `PATCH /api/v1/hrm/payroll-components/:id/classify` | `HrmComponentController.classify` -> `PayComponentService` | `pay_component` |
| `UC-HRM-PAYCAT-04` / `FR-PAYCAT-04` | Ngừng sử dụng thành phần lương (Soft-stop) | `POST /api/v1/hrm/payroll-components/:id/stop` | `HrmComponentController.softStop` -> `PayComponentService` | `pay_component` |
| Tra cứu chung | Danh sách thành phần lương theo bộ lọc | `GET /api/v1/hrm/payroll-components` | `HrmComponentController.findAll` -> `PayComponentService` | `pay_component` |

---

## 2. Chi tiết Endpoints Specs

### 2.1. `POST /api/v1/hrm/payroll-components` (Tạo Khoản Lương Local)

**Request Body (`CreateLocalComponentDto`):**
```json
{
  "code": "ALLOWANCE_PHONE_NAM_DINH",
  "name": "Phụ cấp điện thoại Chi nhánh Nam Định",
  "categoryType": "ALLOWANCE",
  "calculationSign": "+",
  "scopeLevel": "BRANCH",
  "branchId": "dept-nd-001",
  "unitType": "PER_MONTH"
}
```

**Response `201 Created`:**
```json
{
  "success": true,
  "statusCode": 201,
  "data": {
    "id": "comp-att-nd-001",
    "code": "ALLOWANCE_PHONE_NAM_DINH",
    "name": "Phụ cấp điện thoại Chi nhánh Nam Định",
    "categoryType": "ALLOWANCE",
    "calculationSign": "+",
    "scopeLevel": "BRANCH",
    "branchId": "dept-nd-001",
    "status": "active"
  }
}
```
