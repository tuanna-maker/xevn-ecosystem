# Evidence — `PO-HRM-AMIS-PARITY-PAY-PAYMENT-WIRE-BE-02`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-AMIS-PARITY-PAY-PAYMENT-WIRE-BE-02` |
| **prior** | `PO-HRM-AMIS-PARITY-PAY-PAYMENT-WIRE-QA-01` FAIL · stamp `PAYWIRE-MSIRGZEZ` · R-PAY-WIRE-DEPT-COL |
| **from_role** | `dev-be` |
| **to_role** | `qa` |
| **lane** | execution |
| **date** | 2026-08-07 |
| **priority** | P0 |
| **ack_status** | **`READY_FOR_QA`** |
| **payroll_e2e_ready** | **`false`** (DENIED flip) |

---

## Root cause

`wirePaymentBatchFromPeriod` SELECT used `e.department`, but live `public.employees` has **no** `department` column. Directory/display uses `custom_fields->>'department'` (`readDepartment` in `employee-directory.ts`).

## Fix (ADD/FIX — no invent column)

```sql
NULLIF(TRIM(e.custom_fields->>'department'), '') AS department
```

- Null-safe when key missing / employee join null.
- Matches OS 28 display pattern; does **not** invent `employees.department`.
- Close gate `HRM-PAY-005` untouched.

### Files

- `apps/api/hrm-api/src/payroll/payroll-catalog.service.ts` — SQL + CODE-MEMORY APPEND BE-02
- `apps/api/hrm-api/src/payroll/payroll-catalog.service.spec.ts` — assert `custom_fields->>'department'`, reject `\be\.department\b`; null-dept still adds record

---

## Verification

| Check | Result |
|-------|--------|
| Jest `payroll-catalog.service.spec` | **13 passed** |
| `nest build` + `verify-dist` | **PASS** |
| Dist contains fix | `NULLIF(TRIM(e.custom_fields->>'department'), '')` |
| Live restart `start:prod` | Nest up `:28001` |
| Live POST wire (U65, no seed) | **201** `HRM-PAY-WIRE-201` · `records_added=1` · `payslip_count=1` · `payroll_e2e_ready=false` |

### Live smoke

```http
POST /api/hrm/payroll/periods/38674cc1-2e7e-43a7-a244-8d30e069208b/wire-payment-batch?company_id=main
→ 201 HRM-PAY-WIRE-201
data.records_added=1 · data.payslip_count=1 · data.batch.id=aa4e704c-…
```

Persona: `ceo@xe.vn` · fixture period QA-CB-BAG-VARS2 (same as QA-01).

---

## Residual / not promoted

| ID | Owner |
|----|-------|
| R-PAY-WIRE-IDEMP | qa — re-wire skip |
| R-PAY-WIRE-PROCESS-CLOSE | qa — process → paid → close 203 |
| R-PAY-WIRE-FE | dev-fe later |
| module UAT / `payroll_e2e_ready=true` | **DENIED** |

---

## completion_report

### Closed

1. R-PAY-WIRE-DEPT-COL — SQL uses `custom_fields->>'department'`.
2. Jest schema-reality asserts + null department path (no silent 0).
3. Live POST → **201** `HRM-PAY-WIRE-201` after dist restart.
4. Honesty `payroll_e2e_ready=false` retained; HRM-PAY-005 not overwritten.

### Residual

QA-02 full AC matrix (idempotent, process, close after paid).

---

## Handoff

| Field | Value |
|-------|--------|
| **next_owner** | **qa** |
| **ack_status** | **READY_FOR_QA** |
| **evidence_path** | `docs/qa/evidence/po-hrm-amis-parity-pay-payment-wire-be-02.md` |

### next_dispatch_prompt

```text
work_item_id: PO-HRM-AMIS-PARITY-PAY-PAYMENT-WIRE-QA-02
from_role: pm
to_role: qa
lane: execution
parent: PO-HRM-AMIS-PARITY-PAY-PAYMENT-WIRE-BE-02
priority: P0

## Mission
Retest wire-payment-batch after R-PAY-WIRE-DEPT-COL fix (custom_fields department).

## read_first
- docs/qa/evidence/po-hrm-amis-parity-pay-payment-wire-be-02.md
- docs/qa/evidence/po-hrm-amis-parity-pay-payment-wire-qa-01.md

## entry_criteria
- BE-02 READY_FOR_QA · live dist has custom_fields->>'department'
- L0 HRM :28001 200 · U65 zero-seed

## exit_criteria
- AC1: processed → POST wire → 201 HRM-PAY-WIRE-201 (not 500 e.department)
- AC2: re-wire idempotent records_skipped>0
- AC3: POST payment-batches/:id/process → payslips paid
- AC4: close before pay still HRM-PAY-005
- AC5: close after all paid → HRM-PAY-203 (if reachable)
- payroll_e2e_ready=false · no seed · no module UAT claim
- evidence: docs/qa/evidence/po-hrm-amis-parity-pay-payment-wire-qa-02.md

## cấm
seed · claim AMIS step7 DONE · flip payroll_e2e_ready
```
