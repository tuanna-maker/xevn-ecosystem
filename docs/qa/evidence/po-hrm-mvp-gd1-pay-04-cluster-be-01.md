# PO-HRM-MVP-GD1-PAY-04-CLUSTER-BE-01 — dev-be evidence

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-04-CLUSTER-BE-01` |
| **role** | dev-be |
| **ack_status** | **READY_FOR_QA** |
| **honesty** | `payroll_e2e_ready=false` · **C-SLICE** · **≠ PAY-04 / FR-UC-BP-PAY-04 DONE** |
| **must_keep** | `PAY01QC1-MSMBGWC1` · `PAY02QC1-MSMC4GWC1` · ATT peer seals |

## spec_read_ack

- **srs:** `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` · FR-UC-BP-PAY-04 Diễn biến #1–#3 + FAIL + Thành công
- **api:** `docs/program/specs/PO-HRM-MVP-GD1-PAY-04-CLUSTER-API-01.md` §4.1 S1–S5 · §4.6 · §5 DTO
- **data:** `docs/program/specs/PO-HRM-MVP-GD1-PAY-04-CLUSTER-DATA-01.md` §6.1
- **ba:** `docs/program/specs/PO-HRM-MVP-GD1-PAY-04-CLUSTER-BA-01.md` AC-PAY-04-*

## Closed (BE slice)

1. **DDL** — `ensurePayPayslipSplitSegmentsSchema` + `payroll.service` `ensureSchema` → `public.payroll_payslip_split_segments` (DV-14: no static tax cols on segment).
2. **F-PAY-SPLIT-01** — `PayPayslipSplitService.processEmployeeInPeriod` wired in `processPayrollPeriod` after ATT-412 + `resolvePublishedFormulaForProcess` (PAY02 order retained).
3. **HRM-PAY-SPLIT-409** — merge guard `detectDoubleStaticViolation` + 409 on process path.
4. **GET payslip** — `segments[]` display-ready (default include on get-by-id); `split` / `segmentCount` on response.
5. **Process payload** — `employees[]` summary with `split`, `segment_count`, `payslip_id`, `net_amount_vnd`.

## Files touched

- `apps/api/hrm-api/src/payroll/pay-payslip-split.service.ts`
- `apps/api/hrm-api/src/payroll/pay-payslip-split.constants.ts`
- `apps/api/hrm-api/src/payroll/pay-payslip-split.service.spec.ts`
- `apps/api/hrm-api/src/payroll/dto/pay-payslip-split-segment.dto.ts`
- `apps/api/hrm-api/src/payroll/dto/get-payroll-payslip.query.dto.ts`
- `apps/api/hrm-api/src/payroll/payroll.service.ts`
- `apps/api/hrm-api/src/payroll/payroll.controller.ts`

## Verify commands

```bash
pnpm --filter hrm-api test -- pay-payslip-split.service.spec.ts
pnpm --filter hrm-api test -- payroll.service.spec.ts
```

## Residual (not this seat)

- dev-fe PAY-04 preview bind (`PO-HRM-MVP-GD1-PAY-04-CLUSTER-FE-01`)
- U65 J-HRM-PAY-04-* browser evidence
- Full PAY-03 GTCG / PAY-05 SI depth
- `payroll_e2e_ready` remains **false**

## completion_report

BE ADD narrow for PAY-04 split-month C-SLICE: segment table + orchestration inside process + 409 guard + GET `segments[]`. PAY-01/02 process order and closed-hour proration path preserved. Not module UAT / not PAY-04 DONE.

## next_owner

**qa**

## next_dispatch_prompt

```text
work_item_id: PO-HRM-MVP-GD1-PAY-04-CLUSTER-QA-01
role: qa
lane: execution · U65 · J-HRM-PAY-04-01..08 (subset C-SLICE)
depends_on: PO-HRM-MVP-GD1-PAY-04-CLUSTER-BE-01 READY_FOR_QA @ docs/qa/evidence/po-hrm-mvp-gd1-pay-04-cluster-be-01.md
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-04-CLUSTER-BA-01.md (AC-PAY-04-*)
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-04-CLUSTER-API-01.md §5 DTO
entry_criteria: L0 stack; ceo@xe.vn; zero-seed FE process path when data exists
exit_criteria:
  - Regression J-HRM-PAY-01-* / J-HRM-PAY-02-05..07 subset PASS
  - PAY-04: process mid-period C&B change → one payslip + segments[] after F5
  - HRM-PAY-SPLIT-409 observable when double-static scenario (or document BLOCKED if no FE data)
  - evidence docs/qa/evidence/po-hrm-mvp-gd1-pay-04-cluster-qa-01.md · ack_status PASS_TO_PM
cấm: seed · claim PAY-04 DONE · payroll_e2e_ready flip
```
