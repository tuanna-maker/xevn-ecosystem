# Evidence — PO-HRM-AMIS-PARITY-PAY-PAYMENT-WIRE-BE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-AMIS-PARITY-PAY-PAYMENT-WIRE-BE-01` |
| **from_role** | dev-be |
| **to_role** | qa |
| **parent** | `PO-HRM-AMIS-PARITY-RESEARCH-01` |
| **date** | 2026-08-07 |
| **priority** | P2 |
| **ack_status** | **READY_FOR_QA** |
| **honesty** | `payroll_e2e_ready=false` · slice ≠ module UAT · cấm claim AMIS parity DONE |

---

## spec_read_ack

| Artifact | Section | Verdict |
|----------|---------|---------|
| `docs/qa/evidence/po-hrm-amis-parity-ba-01.md` | §2.1 step7 Chi trả | **CONFIRMED** — wire AC from processed payslips |
| Existing payment batch APIs | `payroll-catalog.service.ts` | **REUSE** — CRUD/process already LIVE |
| AMIS spine | Step7 after process (step5) | **ADD** wire orchestrator only |

---

## Closed (this seat)

1. **POST** `/api/hrm/payroll/periods/:periodId/wire-payment-batch` → `HRM-PAY-WIRE-201`
   - Preconditions: period `status=processed` · scope parity with period list/get
   - Creates (or reuses) `payment_batches.payroll_batch_id = periodId`
   - Adds `payment_records` per payslip `status=processed` · `amount=net_amount` · `payroll_record_id=payslip.id`
   - Idempotent: skips payslips already wired
   - Optional `require_ess_confirm=true` filters `employee_confirmed_at IS NOT NULL`
2. **Process payment** sync: `processPaymentRecord` / `processAllPaymentsInBatch` → payslip `status=paid` when record paid
3. **Close period gate**: `POST …/close` requires all payslips `paid` else `HRM-PAY-005`
4. Schema indexes: unique `payroll_batch_id` on batch · unique `payroll_record_id` on record
5. Jest: `payroll-catalog.service.spec.ts` wire + sync · `payroll.service.spec.ts` HRM-PAY-005 · `payroll.controller.spec.ts` route

---

## API matrix

| Method | Path | Code | When |
|--------|------|------|------|
| POST | `/payroll/periods/:periodId/wire-payment-batch` | `HRM-PAY-WIRE-201` | processed period + ≥1 processed payslip |
| POST | `/payroll/periods/:periodId/wire-payment-batch` | `HRM-PAY-WIRE-409` | period not processed |
| POST | `/payroll/periods/:periodId/wire-payment-batch` | `HRM-PAY-WIRE-412` | no eligible payslips |
| POST | `/payroll/periods/:periodId/close` | `HRM-PAY-005` | unpaid payslips remain |
| POST | `/payroll/payment-batches/:id/process` | `HRM-PB-202` | marks records + payslips paid |

---

## Files touched

| Path | Change |
|------|--------|
| `apps/api/hrm-api/src/payroll/dto/wire-payment-batch.dto.ts` | **ADD** |
| `apps/api/hrm-api/src/payroll/payroll-catalog.service.ts` | wire + sync + indexes |
| `apps/api/hrm-api/src/payroll/payroll.service.ts` | close gate HRM-PAY-005 |
| `apps/api/hrm-api/src/payroll/payroll.controller.ts` | route wire-payment-batch |
| `apps/api/hrm-api/src/payroll/payroll-catalog.service.spec.ts` | wire tests |
| `apps/api/hrm-api/src/payroll/payroll.service.spec.ts` | close gate test |
| `apps/api/hrm-api/src/payroll/payroll.controller.spec.ts` | route test |

---

## Verify commands

```bash
pnpm --filter hrm-api test -- payroll-catalog.service.spec.ts payroll.service.spec.ts payroll.controller.spec.ts
```

---

## Residual / not promoted

| Item | Owner | Notes |
|------|-------|-------|
| FE bind wire on Chi trả tab | dev-fe | Manual add-record still works; wire button not in scope |
| Bank account auto-fill from employee profile | dev-be | department joined; bank optional |
| Full browser J-HRM-07 close-out chain | qa | U65: process → wire → process batch → close → F5 |
| `payroll_e2e_ready=true` | — | **cấm** this wave |

---

## completion_report

AMIS step7 minimal backend spine: wire payment batch from processed payslips, sync payslip paid on payout, block period close until all payslips paid. Existing payment-batch CRUD/process preserved. Honesty lock kept.

## next_owner

**qa**

## next_dispatch_prompt

```text
work_item_id: PO-HRM-AMIS-PARITY-PAY-PAYMENT-WIRE-QA-01
from_role: pm
to_role: qa
lane: execution
parent: PO-HRM-AMIS-PARITY-PAY-PAYMENT-WIRE-BE-01
priority: P2

## Mission
Browser/API U65 retest AMIS step7 wire spine — no seed mutate.

## read_first
- docs/qa/evidence/po-hrm-amis-parity-pay-payment-wire-be-01.md
- docs/qa/evidence/po-hrm-amis-parity-ba-01.md §2.1 step7

## entry_criteria
- hrm-api tests PASS for payroll-catalog.service.spec.ts + payroll.service.spec.ts + payroll.controller.spec.ts
- Stack L0 if browser (ceo@xe.vn / Xevn@2026)

## exit_criteria
- Processed period → POST wire-payment-batch → 201 HRM-PAY-WIRE-201 · records count = processed payslips
- Re-wire idempotent (records_skipped > 0, no duplicate payroll_record_id)
- POST payment-batches/:id/process → payslips status paid
- POST period close before pay → HRM-PAY-005; after all paid → HRM-PAY-203
- Evidence docs/qa/evidence/po-hrm-amis-parity-pay-payment-wire-qa-01.md
- ack_status PASS_TO_PM · payroll_e2e_ready=false

## cấm
pnpm seed:* · DB fake · claim module UAT / parity DONE
```

## evidence_path

`docs/qa/evidence/po-hrm-amis-parity-pay-payment-wire-be-01.md`

## ack_status

**READY_FOR_QA**
