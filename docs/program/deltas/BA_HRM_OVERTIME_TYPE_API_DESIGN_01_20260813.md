# API Design — OpenAPI & DTO Contracts for Wave 6: Overtime (OT) Types

| Meta | Value |
|---|---|
| work_item_id | BA-HRM-OVERTIME-TYPE-API-DESIGN-01 |
| ref_techspec | [BA_HRM_OVERTIME_TYPE_TECHSPEC_01_20260813.md](file:///C:/Users/ADMIN/OneDrive/Ta%CC%80i%20li%C3%AA%CC%A3u/Vibe%20Coding/projects/xevn-ecosystem/docs/program/deltas/BA_HRM_OVERTIME_TYPE_TECHSPEC_01_20260813.md) |
| ref_db_design | [BA_HRM_OVERTIME_TYPE_DB_DESIGN_01_20260813.md](file:///C:/Users/ADMIN/OneDrive/Ta%CC%80i%20li%C3%AA%CC%A3u/Vibe%20Coding/projects/xevn-ecosystem/docs/program/deltas/BA_HRM_OVERTIME_TYPE_DB_DESIGN_01_20260813.md) |
| Ngày | 2026-08-13 |
| Trạng thái | CONFIRMED — Sẵn sàng Handoff |

---

## 1. Endpoints Specs

- **GET /api/v1/hrm/settings-catalogs/items?catalog_key=ot_types**: Trả về 3 loại OT và danh sách quy tắc loại trừ theo bộ phận/loại hình lao động.
