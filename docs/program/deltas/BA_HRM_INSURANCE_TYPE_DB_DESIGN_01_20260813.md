# DB Design — Database Schema for Wave 5: Insurance Types & Rate Configurations

| Meta | Value |
|---|---|
| work_item_id | BA-HRM-INSURANCE-TYPE-DB-DESIGN-01 |
| ref_techspec | [BA_HRM_INSURANCE_TYPE_TECHSPEC_01_20260813.md](file:///C:/Users/ADMIN/OneDrive/Ta%CC%80i%20li%C3%AA%CC%A3u/Vibe%20Coding/projects/xevn-ecosystem/docs/program/deltas/BA_HRM_INSURANCE_TYPE_TECHSPEC_01_20260813.md) |
| Location | `apps/api/hrm-api/src/settings-catalogs/` |
| Ngày | 2026-08-13 |
| Trạng thái | CONFIRMED — Sẵn sàng cho API_DESIGN |

---

## 1. Bảng `si_insurance_type` & `pay_insurance_rate_cfg`

```sql
CREATE TABLE IF NOT EXISTS public.si_insurance_type (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL,
  company_id VARCHAR(64) NOT NULL,
  code VARCHAR(64) NOT NULL,
  name VARCHAR(255) NOT NULL,
  employer_rate DECIMAL(5, 2) NOT NULL,
  employee_rate DECIMAL(5, 2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.si_insurance_type (id, tenant_id, company_id, code, name, employer_rate, employee_rate, status)
VALUES
  ('ins-01', 'xevn', 'holding', 'INS_BHXH', 'Bảo hiểm xã hội', 17.00, 8.00, 'active'),
  ('ins-02', 'xevn', 'holding', 'INS_BHYT', 'Bảo hiểm y tế', 3.00, 1.50, 'active'),
  ('ins-03', 'xevn', 'holding', 'INS_BHTN', 'Bảo hiểm thất nghiệp', 1.00, 1.00, 'active'),
  ('ins-04', 'xevn', 'holding', 'INS_KPCD', 'Kinh phí công đoàn', 2.00, 0.00, 'active'),
  ('ins-05', 'xevn', 'holding', 'INS_BHTNLN', 'Bảo hiểm TNLĐ - BNN', 0.50, 0.00, 'active')
ON CONFLICT (id) DO NOTHING;
```
