# PO-HRM-MVP-GD1-CORE-01-CLUSTER-BE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-01-CLUSTER-BE-01` |
| **lane** | execution · dev-be |
| **program** | PO-HRM-MVP-GD1-CONTINUOUS (U89) |
| **uc_ids** | UC-BP-CORE-01 |
| **depends_on** | API-01 CONFIRMED · DATA-01 · BA-01 O1–O12 · SA Option A |
| **ack_status** | **READY_FOR_QA** |
| **coded** | 2026-08-09 |
| **honesty** | `recruitment_uat_ready=false` · personnel/CORE UAT **false** · **C-SLICE** · **no flip** |

## Mission closed

| Item | Status |
|------|--------|
| **F-CORE-EMP-01** `mapPublicEmployee` — DATA §4 allow + strip §4.3 | **DONE** |
| PATCH/POST CB deny → **403** `HRM-CORE-CB-403` (no silent strip) | **DONE** |
| Soft `candidate_id` display-ready on public DTO | **DONE** |
| **F-CORE-DEP-01** GET/POST/PATCH/soft-DELETE `/employees/:id/dependents*` | **DONE** |
| ensureSchema `public.employee_dependents` + indexes | **DONE** |
| Mint `HRM-CORE-DEP-VAL-400` / `HRM-CORE-DEP-404` + `relation_label` | **DONE** |
| Summary gate VAL-D-06 **option (c)** — `include=compensation_summary` | **DONE** |
| U19 list=get=patch=deps (same `resolveHrmListScope`) | **DONE** |
| RETAIN HTP-05 · REC-07 soft hire · CF/STATUS consumers | **RETAIN** |
| Nest `/core` dual · Nest `/rec` dual · second deps · CORE-02 write · seed · hire=CORE DONE | **DENY** |

## Summary gate choice (VAL-D-06)

**Option (c):** Default `GET /employees/summary` returns headcount / by_company / new_hires with `compensation_summary_included=false` and **zeros/null** for `payroll`, `salary_ranges`, `by_department.avg_salary`. Unlock with `?include=compensation_summary` (C&B / CORE-02 peer bind). Documented for FE: do not treat default summary salary as public-ring SoT.

## Files touched

| Path | Change |
|------|--------|
| `apps/api/hrm-api/src/employees/employee-public-ring.ts` | **ADD** strip/deny/CB-403/relation_label/include gate |
| `apps/api/hrm-api/src/employees/employee-dependents.service.ts` | **ADD** F-CORE-DEP-01 + ensureSchema |
| `apps/api/hrm-api/src/employees/dto/employee-dependent.dto.ts` | **ADD** deps DTOs |
| `apps/api/hrm-api/src/employees/employees.service.ts` | **UPGRADE** public serializer · CB assert · summary gate · raw-row patch |
| `apps/api/hrm-api/src/employees/employees.controller.ts` | **ADD** dependents routes |
| `apps/api/hrm-api/src/employees/employees.module.ts` | Wire `EmployeeDependentsService` |
| `apps/api/hrm-api/src/employees/dto/employee-summary.query.dto.ts` | `include?` |
| `apps/api/hrm-api/src/employees/employee-summary.types.ts` | `compensation_summary_included` |
| `apps/api/hrm-api/src/employees/employee-directory.types.ts` | optional `candidate_id` |
| `apps/api/hrm-api/src/employees/po-hrm-mvp-gd1-core-01-cluster-be-01.spec.ts` | **ADD** |
| peer specs | DI mock + ESS CB-403 + summary include |

## Jest evidence

```text
pnpm --filter hrm-api exec jest --testPathPatterns="po-hrm-mvp-gd1-core-01-cluster-be-01|p1-hrm-perf-be-01|d-dash-01-employees-summary|employees.controller.spec|employees.service.spec" --no-coverage
Test Suites: 5 passed, 5 total
Tests:       65 passed, 65 total
```

Coverage: public strip · CB-403 top-level+CF · ESS CB-403 · deps VAL/404/relation_label · U19 member scope · summary default omit + include unlock · controller DI · HTP/create parity RETAIN.

## spec_read_ack

- srs: `SRS_HRM_ENTERPRISE.md` FR-UC-BP-CORE-01 Diễn biến #1–#4 · BR-BP-SEC-01
- tech_spec / API: `docs/program/specs/PO-HRM-MVP-GD1-CORE-01-CLUSTER-API-01.md` §4–§7 F-CORE-EMP-01 · F-CORE-DEP-01
- db_design: `docs/program/specs/PO-HRM-MVP-GD1-CORE-01-CLUSTER-DATA-01.md` §4–§5 `employees` + `employee_dependents`
- api_design: physical `/api/hrm/employees*` only · paper `/core` alias **DENY** Nest dual

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **READY_FOR_QA** |
| **next_owner** | **qa** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-core-01-cluster-be-01.md` |
| **completion_report** | Physical Nest `/api/hrm/employees*` public strip + CB-403; ADD dependents CRUD on `employee_dependents`; summary gated behind `include=compensation_summary`; U19 parity; jest 65 PASS. Honesty false · no Nest /core · no seed · hire ≠ CORE DONE. |
| **residual** | QA U65 J-HRM-CORE-01-01..04 browser; FE-01 parallel bind; CORE-02 compensation OUT |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-01-CLUSTER-QA-01
lane: execution · qa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-01
depends_on: BE-01 READY_FOR_QA · evidence docs/qa/evidence/po-hrm-mvp-gd1-core-01-cluster-be-01.md · FE-01 if ready
entry_criteria: L0; browser-only U65 zero-seed; honesty false; C-SLICE; cấm seed · Nest /core · claim hire=CORE DONE
MISSION: Retest J-HRM-CORE-01-01 public GET strip; J-01-02 PATCH admin 2xx + F5 no C&B; J-01-03 dependents POST + relation_label + DOB; J-01-04 forced salary body → 403 HRM-CORE-CB-403; Network path /employees; summary default no salary SoT; U19 group CEO list=get=deps.
exit: docs/qa/evidence/po-hrm-mvp-gd1-core-01-cluster-qa-01.md · PASS_TO_PM or FAIL with residual
cấm: seed · Nest /core dual · honesty flip · reopen sealed J-07 · claim CORE/hire UAT DONE
```
