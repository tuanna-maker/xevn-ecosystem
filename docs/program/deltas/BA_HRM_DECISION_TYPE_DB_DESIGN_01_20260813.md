# DB Design — Database Schema for Wave 2: Danh mục Loại quyết định (`hr_decision_types`)

| Meta | Value |
|---|---|
| work_item_id | BA-HRM-DECISION-TYPE-DB-DESIGN-01 |
| ref_techspec | [BA_HRM_DECISION_TYPE_TECHSPEC_01_20260813.md](file:///C:/Users/ADMIN/OneDrive/Ta%CC%80i%20li%C3%AA%CC%A3u/Vibe%20Coding/projects/xevn-ecosystem/docs/program/deltas/BA_HRM_DECISION_TYPE_TECHSPEC_01_20260813.md) |
| Location | `apps/api/hrm-api/src/settings-catalogs/` |
| Ngày | 2026-08-13 |
| Trạng thái | CONFIRMED — Sẵn sàng cho API_DESIGN |

---

## 1. Bảng `hr_decision_types` (Pre-existing Catalog)

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | `VARCHAR(36)` | PRIMARY KEY | ID định danh |
| `tenant_id` | `VARCHAR(64)` | NOT NULL | Tenant holding / member |
| `company_id` | `VARCHAR(64)` | NOT NULL | Công ty thành viên |
| `code` | `VARCHAR(64)` | NOT NULL | Mã loại quyết định (VD: `DEC_SALARY_ADJUSTMENT`) |
| `name` | `VARCHAR(255)` | NOT NULL | Tên loại quyết định |
| `status` | `VARCHAR(20)` | NOT NULL DEFAULT 'active' | ENUM: `active`, `archived` |

---

## 2. Seed SQL cho 7 loại quyết định chuẩn

```sql
INSERT INTO public.hr_decision_types (id, tenant_id, company_id, code, name, status)
VALUES
  ('dec-01', 'xevn', 'holding', 'DEC_REWARD', 'Quyết định Khen thưởng', 'active'),
  ('dec-02', 'xevn', 'holding', 'DEC_DISCIPLINE', 'Quyết định Kỷ luật', 'active'),
  ('dec-03', 'xevn', 'holding', 'DEC_SALARY_ADJUSTMENT', 'Quyết định Điều chỉnh lương', 'active'),
  ('dec-04', 'xevn', 'holding', 'DEC_PROMOTION', 'Quyết định Bổ nhiệm / Thăng tiến', 'active'),
  ('dec-05', 'xevn', 'holding', 'DEC_TERMINATION', 'Quyết định Chấm dứt HĐLĐ', 'active'),
  ('dec-06', 'xevn', 'holding', 'DEC_TRANSFER', 'Quyết định Điều chuyển công tác', 'active'),
  ('dec-07', 'xevn', 'holding', 'DEC_REAPPOINTMENT', 'Quyết định Bổ nhiệm lại', 'active')
ON CONFLICT (id) DO NOTHING;
```
