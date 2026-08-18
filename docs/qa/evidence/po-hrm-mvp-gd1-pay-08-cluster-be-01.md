# PO-HRM-MVP-GD1-PAY-08-CLUSTER-BE-01 — evidence

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-08-CLUSTER-BE-01` |
| **role** | dev-be |
| **ack_status** | **READY_FOR_QA** |
| **honesty** | `payroll_e2e_ready=false` · **C-SLICE** · **≠ PAY-08 / FR-UC-BP-PAY-08 DONE** |

## spec_read_ack

| Artifact | Cite |
|----------|------|
| **srs** | `SRS_HRM_ENTERPRISE.md` · **FR-UC-BP-PAY-08** Diễn biến #1–#2 · Luồng #4 ESS |
| **tech_spec** | `docs/program/specs/PO-HRM-MVP-GD1-PAY-08-CLUSTER-API-01.md` §4.3–4.11 · §5 DTO |
| **db_design** | `docs/program/specs/PO-HRM-MVP-GD1-PAY-08-CLUSTER-DATA-01.md` §6.1–6.3 |
| **api_design** | **F-PAY-PAYSLIP-01** publish · payment-status · void · **F-PAY-PROCESS-01** RETAIN |
| **uc_ids** | `UC-BP-PAY-08` · **BR-BP-PAY-03** · **BR-BP-SLIP-01** · **REQ_L_005** |
| **sponsor_confirm** | Wave-44 seat #49 · API-01 + DATA-01 stamp 2026-08-10 |

## Closed (BE)

1. **ensureSchema** — `ensurePayPayslipLifecycleSchema`: `payment_status` · `published_to_ess/at/by` · `version` · expanded `chk_payslip_status` · `payroll_periods.payroll_locked` · `pay_payslip_payment_status_audit`.
2. **POST** `/api/hrm/payroll/payslips/:id/publish` — `calculated|processed` → `published` · lines required · **HRM-PAY-PUBLISH-409** on void/wrong status/empty lines · idempotent when already published.
3. **PATCH** `/api/hrm/payroll/payslips/:id/payment-status` — enum + `payment_status_label_vi` on GET · audit row · deny on unpublished (**HRM-PAY-PUBLISH-409**).
4. **POST** `/api/hrm/payroll/payslips/:id/void` — O22 peer: `status=void` · settlement `cancelled|ready` · no DELETE.
5. **ESS** — `me/payslips*` filter `published_to_ess=true` + `status=published` · confirm gate **HRM-PAY-PUBLISH-409** if unpublished · RETAIN **HRM-PAY-403-ESS**.
6. **LOCK** — **HRM-PAY-LOCK-409** on `enroll` + `process` when `payroll_locked` or period `closed` · publish/TT allowed under lock.
7. **DENY** — `assertNoPayPayslipAmountOverrideInBody` → **HRM-PAY-PAYSLIP-403** · generic `PATCH payslips/:id` → 405.
8. **mapPayslip** — `payment_status` · `payment_status_label_vi` · publish flags · API `processed`→`calculated`.
9. **must_keep** — F-PAY-PROCESS-01 writer unchanged · PAY-01..07 process order guards retained.

## must_keep (regression)

- **PAY01QC1** … **PAY07QC1** — process spine not reordered.
- **ATT12QC1** · **ATT11QC1** — closed sheet peer on process RETAIN.

## Verification

```bash
cd apps/api/hrm-api
pnpm exec jest src/payroll/pay-payslip-guard.spec.ts \
  src/payroll/pay-payslip-lifecycle.helpers.spec.ts \
  src/payroll/payroll.service.spec.ts --no-cache
# 49 tests PASS (2026-08-10)
pnpm run build
```

## Residual (not BE-01)

- **dev-fe** preview/publish · Payment tab · ESS (`PO-HRM-MVP-GD1-PAY-08-CLUSTER-FE-01`).
- **qa** U65 **J-HRM-PAY-08-01..08** + regression PAY-01..07.
- **O19** wire-batch SoT vs PATCH TT · **O11** full version clone UI.

## Files touched

- `apps/api/hrm-api/src/payroll/pay-payslip.constants.ts`
- `apps/api/hrm-api/src/payroll/pay-payslip-guard.ts`
- `apps/api/hrm-api/src/payroll/pay-payslip-lifecycle.schema.ts`
- `apps/api/hrm-api/src/payroll/pay-payslip-lifecycle.helpers.ts`
- `apps/api/hrm-api/src/payroll/dto/publish-payslip.dto.ts`
- `apps/api/hrm-api/src/payroll/dto/patch-payslip-payment-status.dto.ts`
- `apps/api/hrm-api/src/payroll/dto/void-payslip.dto.ts`
- `apps/api/hrm-api/src/payroll/payroll.service.ts`
- `apps/api/hrm-api/src/payroll/payroll.controller.ts`
- `apps/api/hrm-api/src/payroll/pay-payslip-guard.spec.ts`
- `apps/api/hrm-api/src/payroll/pay-payslip-lifecycle.helpers.spec.ts`
- `apps/api/hrm-api/src/payroll/payroll.service.spec.ts`
