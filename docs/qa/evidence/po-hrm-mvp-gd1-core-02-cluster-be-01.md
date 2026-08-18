# PO-HRM-MVP-GD1-CORE-02-CLUSTER-BE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-02-CLUSTER-BE-01` |
| **lane** | execution · dev-be |
| **program** | PO-HRM-MVP-GD1-CONTINUOUS (U89) |
| **uc_ids** | UC-BP-CORE-02 |
| **depends_on** | API-01 CONFIRMED · DATA-01 · BA-01 O1–O12 · SA Option A · peer `CORE01QC1-MSL6WMS7` |
| **ack_status** | **READY_FOR_QA** |
| **coded** | 2026-08-09 |
| **honesty** | `recruitment_uat_ready=false` · personnel/CORE UAT **false** · **C-SLICE** · **no flip** |

## Mission closed

| Item | Status |
|------|--------|
| **F-CORE-EMP-02** physical `/contracts-insurance/compensation-packages*` ONE SoT | **RETAIN + UPGRADE** |
| ensureSchema ADD `bank_account` · `bank_name` · `bank_branch` · `tax_id` | **DONE** |
| Create/Revise DTO + persist bank/MST | **DONE** |
| History snapshot **MUST** include bank/MST | **DONE** |
| Revise copy-forward when bank/MST omitted | **DONE** |
| C&B AuthZ → **403** `HRM-CORE-CB-AUTHZ-403` + `hrm_cb_access_audit` | **DONE** |
| RETAIN `HRM-COMP-409-OVERLAP` + alias `HRM-CORE-CB-OVERLAP-409` | **DONE** |
| Mint `HRM-CORE-CB-VAL-400` (amount / SI PATCH redirect) | **DONE** |
| RETAIN public `HRM-CORE-CB-403` (CORE-01 SEALED) | **RETAIN** |
| PATCH SI contribution delta → **400** prefer `…/actions` `change_rate` | **DONE** |
| RETAIN period append F-CORE-SI-RATE | **RETAIN** |
| Display-ready `amount_display` vi-VN | **DONE** |
| U19 list=get=revise=SI same `resolveHrmListScope` | **RETAIN** |
| Nest `/core` dual · second packages/deps/period · seed · honesty · CORE-01=C&B DONE | **DENY** |

## AuthZ rule (O4 / BR-BP-SEC-02)

| Signal | Outcome |
|--------|---------|
| JWT `permissions` / `view_salary` / `cb_membership` | **allow** |
| `group_ceo` · `hrbp*` · `payroll*` · `admin*` · bare `ceo` | **allow** |
| `employee` / `driver` | **403** `HRM-CORE-CB-AUTHZ-403` |
| `subsidiary_ceo` without claim | **403** (fail-closed unit CEO without C&B) |
| Access audit | `hrm_cb_access_audit` on open + mutate (allowed/denied) |

**≠** public `HRM-CORE-CB-403` (CORE-01 SEALED must_keep).

## Files touched

| Path | Change |
|------|--------|
| `apps/api/hrm-api/src/contracts-insurance/compensation-cb-authz.ts` | **ADD** AuthZ + audit + VAL/OVERLAP constants |
| `apps/api/hrm-api/src/contracts-insurance/employee-compensation.service.ts` | **UPGRADE** bank/MST · AuthZ · snapshot · display-ready |
| `apps/api/hrm-api/src/contracts-insurance/dto/create-compensation-package.dto.ts` | **UPGRADE** bank/MST fields |
| `apps/api/hrm-api/src/employee-insurances/employee-insurances.service.ts` | **UPGRADE** PATCH contrib fail-closed |
| `apps/api/hrm-api/src/contracts-insurance/po-hrm-mvp-gd1-core-02-cluster-be-01.spec.ts` | **ADD** |
| `apps/api/hrm-api/src/contracts-insurance/employee-compensation.service.spec.ts` | **UPGRADE** C&B tokens + audit SQL |

## Jest evidence

```text
pnpm --filter hrm-api exec jest --testPathPatterns="po-hrm-mvp-gd1-core-02-cluster-be-01|employee-compensation.service.spec|employee-insurances.service.spec" --no-coverage
Test Suites: 3 passed, 3 total
Tests:       33 passed, 33 total
```

Coverage: bank/MST persist+snapshot · revise copy-forward · AuthZ-403 employee/subsidiary · OVERLAP alias · SI PATCH VAL-400 · schema ADD · Nest /core DENY · F5 revise/history/active RETAIN.

## Optional thin facade

**SKIPPED** this seat — `/employees/:id/compensation*` not added (optional; would require same `EmployeeCompensationService` only). FE binds packages* path.

## spec_read_ack

- srs: `SRS_HRM_ENTERPRISE.md` FR-UC-BP-CORE-02 Diễn biến #1–#4 · BR-BP-SEC-02 · AC-CORE-CB-01/02
- tech_spec / API: `docs/program/specs/PO-HRM-MVP-GD1-CORE-02-CLUSTER-API-01.md` §4–§7 F-CORE-EMP-02 · F-CORE-SI-* · F-CORE-SI-RATE
- db_design: `docs/program/specs/PO-HRM-MVP-GD1-CORE-02-CLUSTER-DATA-01.md` §4 bank/MST header · §5 SI period RETAIN
- api_design: physical `/api/hrm/contracts-insurance/compensation-packages*` + `/employee-insurances*` · paper `/core` alias **DENY** Nest dual

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **READY_FOR_QA** |
| **next_owner** | **qa** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-core-02-cluster-be-01.md` |
| **completion_report** | Physical packages* UPGRADE bank/MST + AuthZ-403 + audit; history snapshot bank/MST; SI PATCH contrib → VAL-400 → change_rate; OVERLAP RETAIN+alias; display-ready; jest 33 PASS. Honesty false · C-SLICE · CORE-01 ≠ C&B DONE · no Nest /core · no seed. |
| **residual** | QA U65 J-HRM-CORE-02-01..04; FE-01 parallel bind; optional thin employees compensation facade |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-02-CLUSTER-QA-01
lane: execution · qa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-02
depends_on: BE-01 READY_FOR_QA — docs/qa/evidence/po-hrm-mvp-gd1-core-02-cluster-be-01.md · FE-01 if ready
entry_criteria: L0 stack; U65 zero-seed; browser-only; C-SLICE honesty false
MISSION: Retest J-HRM-CORE-02-01..04 — (01) open C&B packages AuthZ 200 vs non-C&B 403 HRM-CORE-CB-AUTHZ-403; (02) create/revise bank/MST + history≥2 F5; (03) public F5 still strip + HRM-CORE-CB-403; (04) SI change_rate append · PATCH contrib 400. Network path MUST contain /contracts-insurance/compensation-packages or /employee-insurances — Nest /core 0 SoT. DENY seed · claim CORE-01=C&B DONE · reopen J-CORE-01 · honesty flip.
exit: docs/qa/evidence/po-hrm-mvp-gd1-core-02-cluster-qa-01.md · PASS_TO_PM
```
