# DB Design — Database Schema for Wave 4: Contract Types & Employment Types

| Meta | Value |
|---|---|
| work_item_id | BA-HRM-CONTRACT-EMPLOYMENT-TYPE-DB-DESIGN-01 |
| ref_techspec | [BA_HRM_CONTRACT_EMPLOYMENT_TYPE_TECHSPEC_01_20260813.md](file:///C:/Users/ADMIN/OneDrive/Ta%CC%80i%20li%C3%AA%CC%A3u/Vibe%20Coding/projects/xevn-ecosystem/docs/program/deltas/BA_HRM_CONTRACT_EMPLOYMENT_TYPE_TECHSPEC_01_20260813.md) |
| Location | `apps/api/hrm-api/src/settings-catalogs/` |
| Ngày | 2026-08-13 |
| Trạng thái | CONFIRMED — Sẵn sàng cho API_DESIGN |

---

## 1. Bảng `emp_employment_type` & Seed SQL

```sql
CREATE TABLE IF NOT EXISTS public.emp_employment_type (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL,
  company_id VARCHAR(64) NOT NULL,
  code VARCHAR(64) NOT NULL,
  name VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.emp_employment_type (id, tenant_id, company_id, code, name, status)
VALUES
  ('empt-01', 'xevn', 'holding', 'EMP_OFFICIAL', 'Nhân viên chính thức', 'active'),
  ('empt-02', 'xevn', 'holding', 'EMP_PROBATION', 'Nhân viên thử việc', 'active'),
  ('empt-03', 'xevn', 'holding', 'EMP_SEASONAL', 'Lao động mùa vụ / Thử thách', 'active')
ON CONFLICT (id) DO NOTHING;
```
