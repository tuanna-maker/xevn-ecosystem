# PO-HRM-MVP-GD1-PAY-02-CLUSTER-BE-01 — evidence

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-02-CLUSTER-BE-01` |
| **role** | dev-be |
| **date** | 2026-08-10 |
| **ack_status** | **READY_FOR_QA** |
| **honesty** | `payroll_e2e_ready=false` · **C-SLICE** · **≠ PAY-02 / FR-UC-BP-PAY-02 DONE** · **≠ PAY module UAT** |
| **must_keep** | `PAY01QC1-MSMBGWC1` · `F-PAY-ATT-CLOSED-01` · ATT peer chain |

## spec_read_ack

| Artifact | Cite |
|----------|------|
| API-01 | §4.7 F-PAY-PROCESS-01 process order · §4.9 AC-PAY-COMP-01 · §6 scope parity |
| BA-01 | O5/O6/O8/O12 · AC-PAY-02-PROCESS-ORDER · AC-PAY-02-COMP-01 · AC-PAY-02-SCOPE-PARITY |
| PAY-01 API-01 | §4.6 F-PAY-ATT-CLOSED-01 · ATT-412 must_keep |

## change_mode

FIX narrow · preserve `gd1_eval_v1` · CODE-MEMORY APPEND · **no** COMP FK DDL · **no** `att_leave_hold`

## Closed scope

1. **RETAIN** `processPayrollPeriod` — `HRM-PAY-ATT-412` when `require_closed_timesheet && !has_closed_sheet` **before** `resolvePublishedFormulaForProcess` (regression jest `AC-PAY-02-PROCESS-ORDER`).
2. **RETAIN** `HRM-PAY-FORMULA-412` when no published active bind (existing `payroll.service.spec`).
3. **R-PAY-02-COMP-01** — `assertComponentCodeInEffectiveCatalog` on period input pack `createInputLine` (jest); template lines already via `assertComponentIdInEffectiveCatalog` (`pay-sheet-template.service.spec`).
4. **U19** — formula `listFormulas` / `getFormulaById` / `updateFormula` scope parity jest (`pay-formula.service.spec`).
5. **VAL-PAY-02-DATA-08** — `default_formula_definition_id` rejects non-`active` published formula (`payroll-catalog.service.spec`).

## Files touched

- `apps/api/hrm-api/src/payroll/payroll.service.ts` (CODE-MEMORY APPEND)
- `apps/api/hrm-api/src/payroll/payroll.service.spec.ts`
- `apps/api/hrm-api/src/payroll/pay-formula.service.spec.ts`
- `apps/api/hrm-api/src/payroll/pay-period-input-pack.service.ts` (CODE-MEMORY APPEND)
- `apps/api/hrm-api/src/payroll/pay-period-input-pack.service.spec.ts`
- `apps/api/hrm-api/src/payroll/payroll-catalog.service.spec.ts`

## Verification

```bash
cd apps/api/hrm-api
pnpm exec jest --testPathPatterns="payroll.service.spec|pay-formula.service.spec|pay-period-input-pack.service.spec|payroll-catalog.service.spec|pay-formula-evaluator.spec|salary-component-consumer-assert.spec|pay-sheet-template.service.spec" --no-cache
```

| Suite | Result |
|-------|--------|
| PAY-02 BE jest bundle (above) | **110 passed** · exit **0** (2026-08-10) |

## Residual (not BE-01)

- U65 browser AC: author/publish/preview/process/COMP picker (**dev-fe** `PO-HRM-MVP-GD1-PAY-02-CLUSTER-FE-01`)
- QA **J-HRM-PAY-02-01..08** + PAY-01/ATT regression subset
- Evaluator statutory depth PAY-03+ (**HOLD**)
- `employee-compensation` COMP assert lives in `contracts-insurance` (CNS-BE-01) — out of payroll `allowed_paths`

## next_owner

**qa** — U65 matrix per API-01 §7; attach regression **J-HRM-PAY-01-04** (ATT-412) when touching process
