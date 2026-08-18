# PO-HRM-MVP-GD1-PAY-03-CLUSTER-BE-01 — evidence

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-03-CLUSTER-BE-01` |
| **role** | dev-be |
| **ack_status** | **READY_FOR_QA** |
| **honesty** | `payroll_e2e_ready=false` · **C-SLICE** · **≠ PAY-03 / FR-UC-BP-PAY-03 DONE** |

## spec_read_ack

| Artifact | Cite |
|----------|------|
| **srs** | `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` · **FR-UC-BP-PAY-03** Diễn biến #1–#2 · luồng #3 · Thành công |
| **tech_spec** | `docs/program/specs/PO-HRM-MVP-GD1-PAY-03-CLUSTER-API-01.md` §4.2–4.7 · §5 DTO |
| **db_design** | `docs/program/specs/PO-HRM-MVP-GD1-PAY-03-CLUSTER-DATA-01.md` §6.1 `payroll_payslips.gtgc_amount` · §6.2 `pay_gtgc_statutory_cfg` |
| **api_design** | API-01 **F-PAY-GTCG-01** · **F-PAY-CB-READ-01** bag · **F-PAY-PROCESS-01** persist · **HRM-PAY-GTCG-403/412** |
| **uc_ids** | `UC-BP-PAY-03` · `FR-UC-BP-PAY-03` · **BR-BP-PAY-02** · **REQ_L_003** |
| **sponsor_confirm** | Wave-40 seat #45 · API-01 + DATA-01 CONFIRMED stamp 2026-08-10 |

## Closed (BE)

1. **ensureSchema** — `payroll_payslips.gtgc_amount` + `public.pay_gtgc_statutory_cfg` (mirror insurance CFG pattern).
2. **F-PAY-GTCG-01** — `resolvePayGtgcForEmployee` · count `employee_dependents` at `period.end_date` · amount from CFG row (no sole literals).
3. **Bag** — `injectPayGtgcIntoVariableBag` after `loadCoreCbVariableBag` in `buildPayFormulaVariableBag` → `dependents_count` + `gtgc_amount_vnd`.
4. **Process order** — `evaluateBoundFormula` surface `process` → **HRM-PAY-GTCG-412** before eval when CFG missing; RETAIN ATT-412 / FORMULA / SPLIT-409 paths.
5. **Persist** — `processPayrollPeriod` updates `payroll_payslips.gtgc_amount` once per employee after successful eval.
6. **403** — `assertNoPayGtgcOverrideInBody` on `POST …/process` body + enroll payload.
7. **GET payslip** — `dependentsCount` + `gtgcAmountVnd` display-ready on list/get/ESS (stored header + resolver).
8. **DENY** — no `/api/hrm/payroll/**/dependents*` routes added (grep 0).

## must_keep (regression)

- **PAY01QC1** — ATT-412 before process side-effects · `pay-att-hour-boundary` RETAIN.
- **PAY02QC1** — GTCG inject after CB read · before `gd1_eval_v1` via bag in `evaluateBoundFormula`.
- **PAY04QC1** — `pay-payslip-split.service.spec.ts` PASS · no `gtgc_amount` on segment DDL.

## Verification

```bash
cd apps/api/hrm-api
pnpm exec jest src/payroll/pay-gtgc-resolver.spec.ts \
  src/payroll/pay-payslip-split.service.spec.ts \
  src/payroll/pay-formula-variable-bag.spec.ts \
  src/payroll/payroll.service.spec.ts --no-cache
# 44 + 29 tests PASS (2026-08-10)
pnpm run build
```

## Residual (not BE-01)

- **dev-fe** read-only GTCG on payslip UI · hide payroll grid inputs (`PO-HRM-MVP-GD1-PAY-03-CLUSTER-FE-01`).
- **qa** U65 **J-HRM-PAY-03-01..08** + regression J-PAY-01/02/04 / J-CORE-01-03.
- Optional **F-PAY-GTGC-CFG-ADMIN-01** settings CRUD (CFG rows via test fixture insert / future admin).
- **PAY-05/06** SI ceiling · progressive TNCN HOLD.

## Files touched

- `apps/api/hrm-api/src/payroll/pay-gtgc.constants.ts`
- `apps/api/hrm-api/src/payroll/pay-gtgc-statutory-cfg.ts`
- `apps/api/hrm-api/src/payroll/pay-gtgc-resolver.ts`
- `apps/api/hrm-api/src/payroll/pay-gtgc-guard.ts`
- `apps/api/hrm-api/src/payroll/pay-gtgc-resolver.spec.ts`
- `apps/api/hrm-api/src/payroll/pay-formula-variable-bag.ts`
- `apps/api/hrm-api/src/payroll/pay-formula.service.ts`
- `apps/api/hrm-api/src/payroll/payroll.service.ts`
- `apps/api/hrm-api/src/payroll/payroll.controller.ts`
