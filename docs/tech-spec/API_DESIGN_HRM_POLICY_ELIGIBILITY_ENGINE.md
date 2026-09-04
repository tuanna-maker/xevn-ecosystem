# API_DESIGN: API CONTRACTS FOR POLICY ELIGIBILITY & MASTER SETTINGS

**Document Code:** XEVN-API-DESIGN-HRM-POLICY-ELIGIBILITY-v1.0  
**Base URL:** `/api/hrm/pay-policies`  
**Status:** APPROVED  

---

## 1. ENDPOINTS SPECIFICATION

### 1.1 List Policies
- **Endpoint:** `GET /api/hrm/pay-policies`
- **Query Params:** `pay_group_code`, `status`, `scope`
- **Response:**
```json
{
  "data": [
    {
      "id": "78325d6d-e406-444e-a8c3-58f7d65ea9ed",
      "pay_group_code": "GRADE",
      "name": "Bảng Lương Cơ bản theo Bậc ĐPHH",
      "status": "ACTIVE",
      "version": 1,
      "effective_from": "2026-08-01",
      "components": [
        {
          "id": "c1",
          "component_type": "step_only_table",
          "params": {
            "scope": "location",
            "conditions": [
              { "field": "location", "operator": "eq", "value": "YB" }
            ],
            "steps": [
              { "step": "STEP_01", "amount": 4800000 }
            ]
          }
        }
      ]
    }
  ]
}
```

### 1.2 Evaluate Policy Eligibility for Employee
- **Endpoint:** `POST /api/hrm/pay-policies/evaluate-eligibility`
- **Request Payload:**
```json
{
  "employee_id": "emp_123",
  "location_code": "YB",
  "branch_code": "YEN_BAI",
  "job_title_code": "DPHH"
}
```
- **Response:**
```json
{
  "applied_policies": [
    {
      "policy_id": "78325d6d-e406-444e-a8c3-58f7d65ea9ed",
      "policy_name": "Lương Cơ bản Khu vực Yên Bái",
      "priority_level": 3,
      "override_reason": "Matched Location Scope YB (Level 3 > Global Level 5)"
    }
  ]
}
```
