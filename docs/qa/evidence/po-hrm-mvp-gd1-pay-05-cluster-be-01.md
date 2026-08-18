# PO-HRM-MVP-GD1-PAY-05-CLUSTER-BE-01 — evidence

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-05-CLUSTER-BE-01` |
| **role** | dev-be |
| **ack_status** | **READY_FOR_QA** |
| **honesty** | `payroll_e2e_ready=false` · **C-SLICE** · **≠ PAY-05 / FR-UC-BP-PAY-05 DONE** |

## spec_read_ack

| Artifact | Cite |
|----------|------|
| **srs** | `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` · **FR-UC-BP-PAY-05** Diễn biến #1–#2 · Thành công |
| **tech_spec** | `docs/program/specs/PO-HRM-MVP-GD1-PAY-05-CLUSTER-API-01.md` §4.2 F-PAY-SI-CEILING-01 · §4.4 process order · §4.9–4.10 · §5 DTO |
| **db_design** | `docs/program/specs/PO-HRM-MVP-GD1-PAY-05-CLUSTER-DATA-01.md` §6.1 `si_employee_amount` / `si_employer_amount` |
| **api_design** | API-01 **F-PAY-SI-CEILING-01** inside **F-PAY-PROCESS-01** after GTCG · **HRM-PAY-SI-403** · **HRM-SET-SI-412-MISSING** |
| **uc_ids** | `UC-BP-PAY-05` · `FR-UC-BP-PAY-05` · **BR-BP-SPL-02** · **REQ_L_004** |
| **sponsor_confirm** | Wave-41 seat #46 · API-01 + DATA-01 CONFIRMED 2026-08-10 |

## Closed (BE)

1. **ensureSchema** — `payroll_payslips.si_employee_amount` + `si_employer_amount` (`ensurePayrollPayslipsSiColumns`).
2. **F-PAY-SI-CEILING-01** — `sumMergedInsuranceBaseFromLines` (`is_insurance_base`) · enrollment gate · `pick` from `pay_insurance_rate_cfg` · `min(base, ceiling)` once · aggregate `si_*` · persist header.
3. **Process order** — split eval + merge → GTCG persist → **SI ceiling** → period processed (RETAIN PAY-03/04 order before SI).
4. **403** — `assertNoPaySiOverrideInBody` on `POST …/process` + enroll payload.
5. **412** — `HRM-SET-SI-412-MISSING` when enrolled type lacks active CFG (`failOnMissingCfg` on process).
6. **GET payslip** — `consolidatedInsuranceBaseVnd` · `ceilingAmountVnd` · `siEmployeeAmountVnd` · `siEmployerAmountVnd` display-ready (detail + list stored SI).
7. **DENY** — no payroll duplicate rate CRUD · no `si_*` on segment DDL.

## must_keep (regression)

- **PAY01QC1** — ATT-412 before process side-effects.
- **PAY02QC1** — formula eval path unchanged before SI persist.
- **PAY03QC1** — GTCG persist before SI step.
- **PAY04QC1** — `pay-payslip-split.service.spec.ts` · HRM-PAY-SPLIT-409.

## Verification

```bash
cd apps/api/hrm-api
pnpm exec jest src/payroll/pay-si-ceiling-resolver.spec.ts \
  src/payroll/pay-gtgc-resolver.spec.ts \
  src/payroll/pay-payslip-split.service.spec.ts \
  src/payroll/pay-formula-variable-bag.spec.ts \
  src/payroll/payroll.service.spec.ts --no-cache
pnpm run build
# 79 tests PASS · nest build PASS (2026-08-10)
```

## Residual (not BE-01)

- **dev-fe** read-only SI/ceiling preview (`PO-HRM-MVP-GD1-PAY-05-CLUSTER-FE-01`).
- **qa** U65 **J-HRM-PAY-05-01..08** + regression PAY-03/04.
- **PAY-06** progressive TNCN header depth HOLD.

## Files touched

- `apps/api/hrm-api/src/payroll/pay-si-ceiling.constants.ts`
- `apps/api/hrm-api/src/payroll/pay-si-ceiling-guard.ts`
- `apps/api/hrm-api/src/payroll/pay-si-ceiling-resolver.ts`
- `apps/api/hrm-api/src/payroll/pay-si-ceiling-resolver.spec.ts`
- `apps/api/hrm-api/src/payroll/payroll.service.ts`
