# U18-HRM-EMP-SCOPE — GET /employees/:id scope hotfix verification

| Field | Value |
|-------|--------|
| **work_item_id** | U18-HRM-EMP-SCOPE |
| **date** | 2026-05-24 |
| **owner** | QA |
| **fix** | `GET /employees/:id` uses `resolveHrmListScope` (group CEO `main` → holding rollup) |
| **account** | `ceo@xe.vn` / `Xevn@2026` |
| **stack** | hrm-api `:28001` · xbos-api `:28002` · portal `:5175` |
| **ack_status** | **PASS_TO_PM** |

## Scope

Verify that group CEO querying `GET /employees/{id}?company_id=main` returns **200 HRM-EMP-200** (not **404 HRM-EMP-404**) for an employee visible in the contracts list under holding rollup. Regression: `test:hrm-embed:audit` + targeted jest.

## Gate table

| # | Gate | Command / probe | Exit | Result |
|---|------|-----------------|-----:|--------|
| L0 | Dev stack | `pnpm run qc:dev-stack` | 0 | **PASS** |
| Live | Contracts → employee by id (direct HRM) | see §Primary probe | 0 | **PASS** |
| Live | Portal proxy GET employee | see §Portal proxy | 0 | **PASS** |
| L2 | HRM embed audit | `pnpm run test:hrm-embed:audit` | 0 | **PASS** **8/8** |
| BE jest | employees + hrm-list-scope | `pnpm --filter hrm-api test -- employees.service.spec employees.controller.spec hrm-list-scope.spec` | 0 | **PASS** **17/17** |

## Primary probe — contracts list → GET employee by id

**Step 1:** `GET /api/hrm/contracts-insurance/contracts?company_id=main`  
- HTTP **200** · code **HRM-CON-200**

**Step 2:** Picked `employee_id` from first contract row:

```
62dff592-104c-4c8c-8e3a-a335109e3131
```

**Step 3:** `GET /api/hrm/employees/62dff592-104c-4c8c-8e3a-a335109e3131?company_id=main`  
- HTTP **200** · code **HRM-EMP-200**  
- Employee: **Lý Thị Hùng** · `company_id`: **trsport** (member unit under holding rollup — confirms `main` scope resolves to holding, not literal `main` company row filter)

**Before fix (expected failure mode):** same probe returned **404 HRM-EMP-404** because get-by-id filtered on `company_id = 'main'` instead of holding rollup scope.

## Portal proxy

`GET http://127.0.0.1:5175/api/hrm/employees/62dff592-104c-4c8c-8e3a-a335109e3131?company_id=main`  
- HTTP **200** · code **HRM-EMP-200** · **PASS**

## HRM embed audit (regression)

```
PASS P-CC-03 200 HRM-EMP-200
PASS P-CC-04a 200 HRM-SET-200
PASS P-CC-04b 200 HRM-CON-200
PASS P-CC-05 200 HRM-CON-200
PASS P-CC-06 200 HRM-REC-200
PASS P-CC-07 200 HRM-ATT-200
PASS P-CC-08 200 HRM-PAY-200
PASS FE-hrm-health 200 HRM-HEALTH-200
```

Artifact: `docs/qa/evidence/hrm-embed-fe-audit-20260524.md`

## Verdict

**PASS** — hotfix verified. Group CEO `company_id=main` can retrieve employee detail for holding-rollup employees sourced from contracts list. No regression on embed audit or targeted jest.

## Residual risk

- Negative case (member CEO accessing cross-company employee by UUID) not re-probed in this slice — covered by existing `hrm-list-scope.spec.ts`.
- Contract detail pages that deep-link by slug vs UUID remain separate from this scope fix (see U18-C1-D-01).
