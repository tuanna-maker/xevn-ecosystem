# BA_HRM_PAYROLL_FORMULA_INPUT_PACK_API_DESIGN_01_20260813 — Wave 10 API Specification

- **Module**: HRM Payroll & Master Catalogs (`hrm_formula_input_pack`)
- **Version**: 1.0.0 (Enterprise Standard)
- **Author**: Antigravity Lead API Architect
- **Status**: APPROVED
- **Ref TechSpec**: [BA_HRM_PAYROLL_FORMULA_INPUT_PACK_TECHSPEC_01_20260813.md](file:///C:/Users/ADMIN/OneDrive/Ta%CC%80i%20li%C3%AA%CC%A3u/Vibe%20Coding/projects/xevn-ecosystem/docs/program/deltas/BA_HRM_PAYROLL_FORMULA_INPUT_PACK_TECHSPEC_01_20260813.md)

---

## 1. REST Endpoints Overview

| HTTP Method | Route Endpoint | Purpose | Authorization Scope |
|---|---|---|---|
| `GET` | `/api/v1/hrm/settings-catalogs/formula-input-packs` | List all formula input packs with bound variables | `company_id` |
| `POST` | `/api/v1/hrm/settings-catalogs/formula-input-packs` | Create or update formula input pack & variables | `company_id` |
| `GET` | `/api/v1/hrm/settings-catalogs/formula-input-packs/:packCode` | Get input pack details & allowlist variables | `company_id` |

---

## 2. Request & Response Payload Contracts

### `GET /api/v1/hrm/settings-catalogs/formula-input-packs`
**Response (200 OK):**
```json
{
  "code": "HRM-SET-200",
  "message": "Formula input packs listed",
  "data": [
    {
      "id": "pack-01",
      "pack_code": "VIET_TRI_PAYROLL_PACK",
      "pack_name": "Gói biến đầu vào lương VP Việt Trì",
      "variables": [
        {
          "variable_code": "BASE_SALARY",
          "display_name": "Lương cơ bản",
          "bound_catalog_key": "hrm_payroll_grade",
          "data_type": "DECIMAL",
          "calculation_sign": "+",
          "status": "active"
        },
        {
          "variable_code": "SALARY_COEFFICIENT",
          "display_name": "Hệ số hưởng lương (Điểm công)",
          "bound_catalog_key": "hrm_payroll_grade",
          "data_type": "DECIMAL",
          "calculation_sign": "+",
          "status": "active"
        }
      ]
    }
  ]
}
```
