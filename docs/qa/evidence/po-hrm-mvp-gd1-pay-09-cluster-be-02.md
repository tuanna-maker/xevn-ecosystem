# PO-HRM-MVP-GD1-PAY-09-CLUSTER-BE-02 — evidence

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-09-CLUSTER-BE-02` |
| **role** | dev-be |
| **parent QA** | `PAY09QA1-MSMG50YQ` (`po-hrm-mvp-gd1-pay-09-cluster-qa-01.md`) |
| **ack_status** | **READY_FOR_QA** |
| **honesty** | `payroll_e2e_ready=false` · **C-SLICE** · **≠ PAY-09 / FR-UC-BP-PAY-09 DONE** |

## Root cause (spec says / code did)

| Defect | Cause | Fix |
|--------|--------|-----|
| Period list/create/eligibility **HRM-SYS-001** | `periodGroupJoinSql` joins `pay_payroll_group pg`; WHERE used unqualified `id`, `company_id`, `status` | `pushPayrollPeriodCompanyIdFilter` + `payroll_periods.id` / `payroll_periods.status` in `queryPeriodInScope` + `listPayrollPeriods` |
| **GET groups/:id/members** 500 | `employee_work_timeline` has `event_date`, not `effective_from` | ORDER BY `ewt.event_date DESC NULLS LAST` (align `employee-profile.service.ts`) |

## Files

- `apps/api/hrm-api/src/payroll/payroll.service.ts`
- `apps/api/hrm-api/src/payroll/pay-payroll-group.service.ts`
- `apps/api/hrm-api/src/payroll/payroll.service.spec.ts` (mock SQL matchers)

## Verification

```bash
cd apps/api/hrm-api
pnpm exec jest src/payroll/pay-payroll-group-resolver.spec.ts \
  src/payroll/payroll.service.spec.ts \
  src/payroll/payroll.controller.spec.ts --no-cache
pnpm run build
pnpm run qc:fe-be-health   # repo root
node scripts/qa/_tmp-po-hrm-mvp-gd1-pay-09-cluster-be-02-probe.mjs
```

| Check | Result |
|-------|--------|
| PAY-09 jest bundle | **PASS (59)** |
| `pnpm run build` (hrm-api) | **PASS** |
| L0 `qc:fe-be-health` | **PASS** |
| Live probe (ceo@xe.vn · main · U65) | periods **200** · create **201** · eligibility **200** · members **200** |

### Live probe sample (2026-08-10)

```json
{
  "group_create": { "status": 201, "code": "HRM-PAY-201" },
  "periods_list": { "status": 200, "code": "HRM-PAY-200" },
  "period_create": { "status": 201, "code": "HRM-PAY-201" },
  "eligibility": { "status": 200, "code": "HRM-PAY-200" },
  "members": { "status": 200, "code": "HRM-PAY-200" }
}
```

Runner: `scripts/qa/_tmp-po-hrm-mvp-gd1-pay-09-cluster-be-02-probe.mjs`

## must_keep

- PAY01QC1 … PAY08QC1 seals · no pipeline reorder · `payroll_e2e_ready=false`
- No seed · **≠** claim PAY-09 module DONE

## completion_report

**Closed:** P0 SQL fixes for period scope queries + group members resolver; jest PAY-09 bundle green; live probes for J-HRM-PAY-09-02/03 unblock paths.

**Residual:** QA full `PO-HRM-MVP-GD1-PAY-09-CLUSTER-QA-01` re-run · FE-01 HOLD · process PAY-09 E2E still false.

## next_owner

`qa`

## next_dispatch_prompt

```
work_item_id: PO-HRM-MVP-GD1-PAY-09-CLUSTER-QA-02
entry_criteria: BE-02 READY_FOR_QA — docs/qa/evidence/po-hrm-mvp-gd1-pay-09-cluster-be-02.md; L0 PASS; U65 zero-seed; ceo@xe.vn / main
exit_criteria: Re-run scripts/qa/_tmp-po-hrm-mvp-gd1-pay-09-cluster-qa-01.mjs — J-HRM-PAY-09-02 members 200 · J-HRM-PAY-09-03 period list/elig/create not HRM-SYS-001; PAY-09 jest 59 PASS; cite PAY01..08 regression; payroll_e2e_ready=false; ack PASS_TO_PM or FAIL with evidence
evidence_path: docs/qa/evidence/po-hrm-mvp-gd1-pay-09-cluster-qa-01.md (overwrite stamp)
```
