# DB Design — Database Schema for Wave 6: Overtime (OT) Types (`att_ot_type`)

| Meta | Value |
|---|---|
| work_item_id | BA-HRM-OVERTIME-TYPE-DB-DESIGN-01 |
| ref_techspec | [BA_HRM_OVERTIME_TYPE_TECHSPEC_01_20260813.md](file:///C:/Users/ADMIN/OneDrive/Ta%CC%80i%20li%C3%AA%CC%A3u/Vibe%20Coding/projects/xevn-ecosystem/docs/program/deltas/BA_HRM_OVERTIME_TYPE_TECHSPEC_01_20260813.md) |
| Location | `apps/api/hrm-api/src/settings-catalogs/` |
| Ngày | 2026-08-13 |
| Trạng thái | CONFIRMED — Sẵn sàng cho API_DESIGN |

---

## 1. Bảng `att_ot_type` & Exclusion Fields

```sql
CREATE TABLE IF NOT EXISTS public.att_ot_type (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL,
  company_id VARCHAR(64) NOT NULL,
  code VARCHAR(64) NOT NULL,
  name VARCHAR(255) NOT NULL,
  multiplier DECIMAL(4, 2) NOT NULL,
  excluded_employment_types TEXT[] NOT NULL DEFAULT '{}',
  excluded_department_ids TEXT[] NOT NULL DEFAULT '{}',
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.att_ot_type (id, tenant_id, company_id, code, name, multiplier, excluded_employment_types, status)
VALUES
  ('ot-01', 'xevn', 'holding', 'OT_WEEKDAY', 'OT Ngày thường (150%)', 1.50, '{"EMP_DRIVER"}', 'active'),
  ('ot-02', 'xevn', 'holding', 'OT_WEEKEND', 'OT Ngày nghỉ hàng tuần (200%)', 2.00, '{"EMP_DRIVER"}', 'active'),
  ('ot-03', 'xevn', 'holding', 'OT_HOLIDAY', 'OT Ngày lễ, Tết (300%)', 3.00, '{"EMP_DRIVER"}', 'active')
ON CONFLICT (id) DO NOTHING;
```
