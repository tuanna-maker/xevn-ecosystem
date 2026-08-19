# API Design — OpenAPI & DTO Contracts for Wave 4: Contract & Employment Types

| Meta | Value |
|---|---|
| work_item_id | BA-HRM-CONTRACT-EMPLOYMENT-TYPE-API-DESIGN-01 |
| ref_techspec | [BA_HRM_CONTRACT_EMPLOYMENT_TYPE_TECHSPEC_01_20260813.md](file:///C:/Users/ADMIN/OneDrive/Ta%CC%80i%20li%C3%AA%CC%A3u/Vibe%20Coding/projects/xevn-ecosystem/docs/program/deltas/BA_HRM_CONTRACT_EMPLOYMENT_TYPE_TECHSPEC_01_20260813.md) |
| ref_db_design | [BA_HRM_CONTRACT_EMPLOYMENT_TYPE_DB_DESIGN_01_20260813.md](file:///C:/Users/ADMIN/OneDrive/Ta%CC%80i%20li%C3%AA%CC%A3u/Vibe%20Coding/projects/xevn-ecosystem/docs/program/deltas/BA_HRM_CONTRACT_EMPLOYMENT_TYPE_DB_DESIGN_01_20260813.md) |
| Ngày | 2026-08-13 |
| Trạng thái | CONFIRMED — Sẵn sàng Handoff |

---

## 1. Traceability Matrix & Endpoints

- **GET /api/v1/hrm/settings-catalogs/items?catalog_key=employment_types**: Picker API trả về 3 loại hình lao động chuẩn.
- **GET /api/v1/hrm/settings-catalogs/items?catalog_key=contract_types**: Picker API trả về 5 loại hợp đồng lao động chuẩn.
