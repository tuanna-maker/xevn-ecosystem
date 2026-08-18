# Evidence — `PO-HRM-PAYROLL-PERIOD-LIST-TOTALS-BE-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAYROLL-PERIOD-LIST-TOTALS-BE-01` |
| **from_role** | `dev-be` |
| **to_role** | `qa` |
| **lane** | execution |
| **date** | 2026-08-07 |
| **priority** | P3 |
| **parent** | `PO-HRM-CONTINUOUS-W7-20260807` |
| **closes** | **R-PAY-PERIOD-LIST-TOTALS** (OBS from summary-cards QC) |
| **ack_status** | **`READY_FOR_QA`** |
| **honesty** | **`payroll_e2e_ready=false`** |

### Honesty locks

| Flag | Value |
|------|-------|
| **`payroll_e2e_ready`** | **`false`** — DENIED flip |
| **Formula LIVE / invent** | **DENIED** — totals = SUM of existing payslip amounts only |
| **Seed** | none (U65) |
| **process-post GWC · period-bind GWC · summary-cards FE** | **must_keep** — untouched behavior; list adds display fields only |
| **Module UAT / J-HRM-07 e2e** | NOT claimed |

---

## spec_read_ack

| Artifact | Used |
|----------|------|
| `po-hrm-payroll-formula-run-gap-w3-qc-summary-cards-01.md` | OBS **R-PAY-PERIOD-LIST-TOTALS** idle-ok → this seat |
| `po-hrm-payroll-formula-run-gap-w3-fe-summary-cards-01.md` | Root cause: GET list omitted `total_gross`/`total_net`/`payslip_summary`; PROCESS already returns `payslip_summary` |
| `payroll.service.ts` | `listPayrollPeriods` · `mapPeriod` · `queryPeriodInScope` · PROCESS summary SUM |
| `PO_HRM_CONTINUOUS_W7_20260807.md` | W7 row for this work_item |

---

## Root cause

PROCESS POST already rolls up display-ready:

```sql
COALESCE(SUM(gross_amount), 0) … COALESCE(SUM(net_amount), 0)
FROM payroll_payslips WHERE period_id = …
```

→ `payslip_summary: { total_gross, total_net }`.

`GET /payroll/periods` list (and get-by-id `mapPeriod`) only exposed `employee_count` — **no** totals → list table columns stayed 0 until detail lines loaded / FE line_aggregate.

**Not** a formula engine gap — display-ready contract gap on list/get.

---

## Fix (BE)

1. **LATERAL** join `PAYROLL_PERIOD_PAYSLIP_TOTALS_LATERAL` — one scan of `payroll_payslips` per period for `employee_count` + `SUM(gross/deduction/net)` (same SoT as PROCESS).
2. Wire into **`listPayrollPeriods`** and **`queryPeriodInScope`** (get-by-id / process / enroll scope path) — **list↔get scope_parity retained** (`expandPayrollPeriodCompanyIds` + `pushCompanyIdFilter`).
3. **`mapPeriod`** emits:
   - top-level `total_gross` / `total_deduction` / `total_net` (numbers)
   - nested `payslip_summary` (same shape as PROCESS — FE `resolvePeriodDisplayTotals` can bind either)
4. PROCESS response also sets top-level totals + `total_deduction` in summary (additive; `payroll_e2e_ready: false` retained).
5. Soft-delete: no hard DELETE; payslips remain CASCADE on period; no invent soft-delete column.

### Files

- `apps/api/hrm-api/src/payroll/payroll.service.ts`
- `apps/api/hrm-api/src/payroll/payroll.service.spec.ts`

### solid_convention_ack

- Display-ready fields computed in Nest from payslip rows — FE must not invent payroll formula / net calc.
- Scope resolver shared list ↔ get-by-id.

---

## Tests

| Command | Result |
|---------|--------|
| `pnpm --filter hrm-api exec jest src/payroll/payroll.service.spec.ts --no-coverage` | **PASS** · **42** tests |

New / updated coverage:

- `listPayrollPeriods returns display-ready total_gross/total_net + payslip_summary (R-PAY-PERIOD-LIST-TOTALS)`
- `getPeriodById exposes display-ready totals via mapPeriod (list↔get parity R-PAY-PERIOD-LIST-TOTALS)`
- PROCESS summary mock includes `total_deduction`; asserts top-level + `payslip_summary`
- List ORDER BY / LATERAL SQL assertions updated (period-bind + main↔holding scope tests retained)

---

## Contract (QA assert after process)

`GET /api/hrm/payroll/periods?company_id=main` (or member) item for a **processed** period:

| Field | Expect |
|-------|--------|
| `total_gross` | number — SUM payslip `gross_amount` (e.g. **12345000**) |
| `total_net` | number — SUM payslip `net_amount` |
| `total_deduction` | number — SUM payslip `deduction_amount` |
| `payslip_summary.total_gross` / `.total_net` | same as top-level |
| `employee_count` | COUNT payslips (unchanged semantics) |
| Draft / empty | all totals **0** |

Persona: `ceo@xe.vn` · U65 zero-seed · compare to PROCESS body / payslip list for same period (e.g. prior stamp target `cf38deac` if still present — **not** invent LIVE).

---

## Residual

| ID | Sev | Note |
|----|-----|------|
| **`payroll_e2e_ready`** | honesty | LOCKED **false** |
| Formula LIVE / module UAT | — | DENIED |
| FE list column bind | optional FE | may already use `resolvePeriodDisplayTotals` — QA verify list columns after this BE |

---

## completion_report

### Closed

- R-PAY-PERIOD-LIST-TOTALS: GET periods list + get-by-id expose display-ready `total_gross` / `total_net` (+ `total_deduction`) and `payslip_summary` from proven payslip SUM.
- Scope parity list↔get retained; soft-delete / process-post / period-bind / summary-cards must_keep.
- jest 42 PASS; `payroll_e2e_ready=false`.

### Residual

- QA browser/API assert list fields after process; honesty locks unchanged.

## next_owner

**qa**

## next_dispatch_prompt

```text
work_item_id: PO-HRM-PAYROLL-PERIOD-LIST-TOTALS-QA-01
from_role: pm
to_role: qa
lane: execution
priority: P3
parent: PO-HRM-PAYROLL-PERIOD-LIST-TOTALS-BE-01
entry_criteria: BE READY_FOR_QA · evidence docs/qa/evidence/po-hrm-payroll-period-list-totals-be-01.md · U65 zero-seed
exit_criteria: After process (or existing processed period), GET /payroll/periods item has total_gross/total_net (+ payslip_summary) matching payslip SUM / PROCESS body; draft=0; scope main OK; payroll_e2e_ready=false; no seed; must_keep process-post/period-bind/summary-cards
evidence_path: docs/qa/evidence/po-hrm-payroll-period-list-totals-qa-01.md
ack_status: PASS_TO_PM
cấm: seed · invent formula LIVE · flip payroll_e2e_ready · reopen process-post GWC
```

## ack_status

**READY_FOR_QA**
