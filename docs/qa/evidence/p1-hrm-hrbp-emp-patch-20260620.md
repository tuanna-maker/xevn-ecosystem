# P1-HRM-HRBP-EMP-PATCH-01 — Member HRBP employee PATCH RBAC

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-HRM-HRBP-EMP-PATCH-01` |
| **from_role** | `dev-be` |
| **to_role** | `qa` |
| **date** | 2026-06-20 |
| **ack_status** | **READY_FOR_QA** |
| **spec_ref** | `ADR-HRM-RBAC-SCOPE-LADDER` §3.3 (HRBP tenant HR scope) |
| **defect** | `D-UF-WEB-HRM-09-01` / UF-HRM-09 |

---

## Problem

Portal HRBP `du-lich.hr@xe.vn` (`tenantId=xe-du-lich`, `companyId=main`, `roleCode=HRBP_MANAGER`) could **list** employees (200) but **PATCH** `/employees/{id}?company_id=main` returned **403** `HRM-EMP-403`.

Root cause: `employee-update-policy.ts` `FULL_UPDATE_ROLE_CODES` omitted `hrbp_manager`; portal JWT uses `roleCode: HRBP_MANAGER` (lowercased to `hrbp_manager`).

## Fix

| File | Change |
|------|--------|
| `apps/api/hrm-api/src/employees/employee-update-policy.ts` | Add `hrbp_manager` to `FULL_UPDATE_ROLE_CODES`; allow `roles[]` containing `hrbp_manager` in `canFullEmployeeUpdate()` |

Scope resolution unchanged — `updateEmployee` still uses `resolveHrmListScope` + `assertResourceInHrmScope` (list/get parity).

## Verification

| Command | Result |
|---------|--------|
| `pnpm exec jest --testPathPatterns="employee-update-policy\|p1-hrm-hrbp-emp-patch-01"` | **11/11 PASS** |
| `pnpm run build` (hrm-api) | **exit 0** |

### Regression coverage

- `employee-update-policy.spec.ts` — `HRBP_MANAGER` roleCode + `hrbp_manager` roles array + cross-employee `job_title_key` patch allowed
- `p1-hrm-hrbp-emp-patch-01.spec.ts` — member HRBP service-level PATCH on `main` scope; plain employee still 403 on cross-employee patch

## QA retest (UF-HRM-09)

1. Login portal `du-lich.hr@xe.vn` / `Xevn@2026` → JWT `tenantId=xe-du-lich`, `companyId=main`.
2. `GET /api/hrm/employees?company_id=main` → 200, pick employee id (e.g. `MEMEMP440961`).
3. `PATCH /api/hrm/employees/{id}?company_id=main` body `{ "job_title_key": "<existing or valid key>" }` → expect **200** (not 403).
4. Negative: login as plain employee in same tenant → PATCH another employee → still **403** `HRM-EMP-403`.

## Residual

- Dept-level row narrowing (Target G-FID §3.3) not implemented — HRBP can PATCH any employee in tenant `main` scope (same as member CEO HR ops expectation for UF-HRM-09).
- Cross-tenant PATCH still blocked by scope assert (409/404).

---

## completion_report

**Closed:** `HRBP_MANAGER` portal role can PATCH employees within own tenant `company_id=main`; policy + service regression tests; build PASS.

**Open:** QA UF-HRM-09 retest on local `:5173` / pilot stack.

## next_owner

`qa`

## next_dispatch_prompt

```
Role: qa
work_item_id: P1-HRM-HRBP-EMP-PATCH-01-R1
from_role: dev-be
to_role: qa
entry_criteria: dev-be READY_FOR_QA — docs/qa/evidence/p1-hrm-hrbp-emp-patch-20260620.md
Tasks:
1) L0 stack up (`pnpm run qc:dev-stack`)
2) Login du-lich.hr@xe.vn / Xevn@2026 — PATCH /api/hrm/employees/{id}?company_id=main with job_title_key → expect 200 (UF-HRM-09)
3) Negative: plain employee same tenant cannot PATCH peer → 403
4) Update docs/qa/evidence/user-flow-web-qa-l0-20260616.md UF-HRM-09 row + D-UF-WEB-HRM-09-01 status
Exit: PASS_TO_PM with evidence path
ack_status: PASS_TO_PM
```
