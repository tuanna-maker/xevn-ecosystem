# Evidence — `PO-HRM-AMIS-PARITY-PAY-PERIOD-BIND-BE-02`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-AMIS-PARITY-PAY-PERIOD-BIND-BE-02` |
| **from_role** | `dev-be` |
| **to_role** | `qa` |
| **lane** | execution |
| **date** | 2026-08-07 |
| **priority** | P0 |
| **parent** | `PO-HRM-AMIS-PARITY-PAY-PERIOD-BIND-QA-01` FAIL · **R-PAY-PERIOD-LIST-TPL** |
| **ack_status** | **`READY_FOR_QA`** |
| **honesty** | **`payroll_e2e_ready=false`** |

### Honesty locks

| Flag | Value |
|------|-------|
| **`payroll_e2e_ready`** | **`false`** — DENIED flip |
| **Seed** | none (U65) |
| **Module UAT** | NOT claimed |

---

## spec_read_ack

| Artifact | Used |
|----------|------|
| `po-hrm-amis-parity-pay-period-bind-qa-01.md` | FAIL AC-PAY-TPL-03 · listHit `pay_sheet_template_id: null` |
| `po-hrm-amis-parity-pay-period-bind-fe-01.md` § Residual | R-PAY-PERIOD-LIST-TPL |
| `payroll.service.ts` | `listPayrollPeriods` + `mapPeriod` + `queryPeriodInScope` |

---

## Root cause

POST create binds via `PaySheetTemplateService.bindToPeriod` and returns `pay_sheet_template_id` + `sheet_template_snapshot_json` on **create response only**.

`listPayrollPeriods` SELECT omitted those columns; `mapPeriod()` also dropped them even when `queryPeriodInScope` (get-by-id) selected them → FE invalidateQueries / F5 showed `—`.

---

## Fix (ADD/FIX — preserve pack≠mẫu)

| Change | File |
|--------|------|
| SELECT adds `formula_definition_id`, `pay_sheet_template_id`, `sheet_template_snapshot_json` | `listPayrollPeriods` |
| `mapPeriod` returns `pay_sheet_template_id` + `sheet_template_snapshot_json` | shared list + get-by-id |
| CODE-MEMORY APPEND | `PO-HRM-AMIS-PARITY-PAY-PERIOD-BIND-BE-02` |
| Jest regression | list SELECT asserts + snapshot `template_name`; get-by-id mapPeriod parity |

**must_keep:** enroll pack ≠ mẫu · soft-delete · JWT scope · `payroll_e2e_ready=false`

---

## Verification

| Command | Result |
|---------|--------|
| `pnpm --filter hrm-api exec jest src/payroll/payroll.service.spec.ts --no-coverage` | **37 passed** |

### Regression coverage

1. `listPayrollPeriods returns pay_sheet_template bind + snapshot (R-PAY-PERIOD-LIST-TPL)` — SQL contains bind cols; DTO has `template_name`.
2. `getPeriodById exposes pay_sheet_template bind via mapPeriod (list↔get parity)`.

---

## completion_report

### Closed

1. **R-PAY-PERIOD-LIST-TPL** — GET `/api/hrm/payroll/periods` list DTO includes `pay_sheet_template_id` + `sheet_template_snapshot_json` (incl. `template_name`).
2. get-by-id uses same `mapPeriod` — bind fields no longer stripped after SELECT.
3. Jest 37 PASS on `payroll.service.spec.ts`.

### Residual

- QA browser retest AC-PAY-TPL-03 / AC5 F5 (harness `po-hrm-amis-parity-pay-period-bind-qa-01`) — expect row tpl name after list refetch.
- **R-PAY-PERIOD-FILTER-UX** (month filter) — optional FE; not this slice.
- **`payroll_e2e_ready`** remains **false**.

---

## Handoff

| Field | Value |
|-------|--------|
| **next_owner** | **qa** |
| **evidence_path** | `docs/qa/evidence/po-hrm-amis-parity-pay-period-bind-be-02.md` |
| **ack_status** | **`READY_FOR_QA`** |
| **payroll_e2e_ready** | **`false`** |

### next_dispatch_prompt

```text
work_item_id: PO-HRM-AMIS-PARITY-PAY-PERIOD-BIND-QA-02
from_role: pm
to_role: qa
lane: execution
priority: P0
parent: PO-HRM-AMIS-PARITY-PAY-PERIOD-BIND-BE-02 READY_FOR_QA

## Mission
Retest AC-PAY-TPL-03 browser U65 after R-PAY-PERIOD-LIST-TPL fix.
Expect: POST periods 201 with paySheetTemplateId → GET list same id has pay_sheet_template_id + sheet_template_snapshot_json.template_name → row/F5 shows mẫu name (not —).
Reuse harness scripts/qa/_tmp-po-hrm-amis-parity-pay-period-bind-qa-01.mjs (or QA-02 copy).
Persona ceo@xe.vn · company_id=main · zero-seed.

## read_first
1. docs/qa/evidence/po-hrm-amis-parity-pay-period-bind-be-02.md
2. docs/qa/evidence/po-hrm-amis-parity-pay-period-bind-qa-01.md

## exit
PASS_TO_PM or FAIL_TO_PM · evidence docs/qa/evidence/po-hrm-amis-parity-pay-period-bind-qa-02.md
honesty: payroll_e2e_ready=false
```
