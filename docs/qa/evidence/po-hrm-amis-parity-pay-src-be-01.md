# Evidence — PO-HRM-AMIS-PARITY-PAY-SRC-BE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-AMIS-PARITY-PAY-SRC-BE-01` |
| **parent** | `PO-HRM-AMIS-PARITY-RESEARCH-01` |
| **from_role** | `dev-be` |
| **to_role** | `qa` |
| **lane** | execution |
| **date** | 2026-08-07 |
| **priority** | P0 |
| **change_mode** | ADD |
| **prior** | `PO-HRM-AMIS-PARITY-PAY-TPL-BE-01` · `PO-HRM-PAYROLL-FORMULA-RUN-GAP-BE-EVAL-01` · PAY-DEPTH BR-SRC |
| **ack_status** | **READY_FOR_QA** |
| **honesty** | `payroll_e2e_ready=false` · **cấm** claim AMIS parity DONE · **cấm** seed · **cấm** reopen L1 formula seats |

---

## 1. spec_read_ack

| # | Artifact | Used |
|---|----------|------|
| 1 | `docs/qa/evidence/po-hrm-amis-parity-pay-depth-01.md` §3 | BR-AMIS-PAY-SRC-01..05 · sequenceDiagram |
| 2 | `docs/qa/evidence/po-hrm-amis-parity-pay-data-01.md` §4 | Storage tiers · pay_period_input_lines ADD-plan |
| 3 | `docs/program/specs/PO-HRM-AMIS-PARITY-PAY-TPL-API-01.md` §4 · §7 | F-PAY-PROCESS-01 SRC expand · OV-C |
| 4 | `docs/qa/evidence/po-hrm-payroll-formula-run-gap-be-eval-01.md` | Retain evaluator honesty · ATT-412 · FORMULA-412 |

---

## 2. Deliverables (apps)

| Path | Role |
|------|------|
| `apps/api/hrm-api/src/payroll/pay-src-resolver.ts` | SRC loaders + precedence pure helpers · period input schema probe |
| `apps/api/hrm-api/src/payroll/pay-src-resolver.spec.ts` | Jest SRC chain unit |
| `apps/api/hrm-api/src/payroll/pay-formula.service.ts` | `processEmployeePayslipViaSrc` · `resolveSrcComponentAmount` · `source_tier` DDL |
| `apps/api/hrm-api/src/payroll/pay-formula.service.spec.ts` | SRC-02 win · SRC-05 FORMULA-412 |
| `apps/api/hrm-api/src/payroll/payroll.service.ts` | PROCESS binds SRC resolver per employee payslip |
| `apps/api/hrm-api/src/payroll/payroll.service.spec.ts` | Process mock updated |
| `apps/api/hrm-api/src/payroll/pay-formula-variable-bag.ts` | Comment sync — ATT vars only in bag; SRC on PROCESS |

---

## 3. SRC behavior matrix (PROCESS)

| BR | Condition | Implementation | Fail if |
|----|-----------|----------------|---------|
| **SRC-01** | ATT hour vars | Upstream `HRM-PAY-ATT-412` in `processPayrollPeriod` + `evaluateBoundFormula` when formula tier used | Open sheet vars used |
| **SRC-02** | Emp C&B fixed PC | `loadEmployeeFixedAmountForComponent` → short-circuit `source_tier=emp_cb` | Catalog/template overwrites |
| **SRC-03** | Period input pack | `loadPeriodInputAmount` when `pay_period_input_lines` LIVE | Pack ignored → silent 0 |
| **SRC-04** | Template override FK published | Snapshot `formula_definition_id` → `loadPublishedFormulaById` → evaluate | Draft/jsonb-only on process |
| **SRC-05** | Catalog default | `resolveCatalogDefaultFormulaId` (`comp:{code}` convention) or `default_value>0` | Nest % fallback · silent 0₫ |

**Precedence (short-circuit):** emp_cb → period_input → template_override → formula_default → **HRM-PAY-FORMULA-412**

**Column set:** period `sheet_template_snapshot_json.columns` (immutable) else bound formula `gd1_eval_v1` lines.

**Payslip lines:** `payroll_payslip_lines` + optional `source_tier` audit column.

---

## 4. Jest evidence

```text
pnpm --filter hrm-api exec jest \
  --testPathPatterns=pay-src-resolver.spec \
  --testPathPatterns=pay-formula.service.spec \
  --testPathPatterns=payroll.service.spec \
  --no-coverage
→ Test Suites: 3 passed · Tests: 61 passed
```

| Case | Result |
|------|--------|
| pickSrcTierAvailable precedence SRC-02..05 | PASS |
| parsePeriodSnapshotColumns | PASS |
| loadEmployeeFixedAmountForComponent (SRC-02) | PASS |
| loadPeriodInputAmount probe (SRC-03) | PASS |
| resolveCatalogDefaultFormulaId (SRC-05) | PASS |
| processEmployeePayslipViaSrc emp_cb wins over override | PASS |
| processEmployeePayslipViaSrc blocked → FORMULA-412 | PASS |
| payroll.service process via SRC mock | PASS |

---

## 5. completion_report

### Closed

1. **SRC resolver** on PROCESS per BR-AMIS-PAY-SRC-01..05 (ATT gate retained upstream).  
2. Per-component payslip lines with `source_tier` + component amounts (AC-PAY-RUN-06 target).  
3. Template snapshot columns drive evaluate order; OV-C published FK only on process tier 3.  
4. Period input table ADD-plan + probe read (SRC-03 when LIVE).  
5. **Cấm** Nest % fallback · **cấm** `salary_components.formula` TEXT engine.  
6. Jest SRC chain + integration specs PASS.  
7. Honesty: **`payroll_e2e_ready=false`**.

### Residual

| ID | Item | Owner |
|----|------|-------|
| R-PAY-SRC-QA | Browser U65 AC-PAY-SRC-01..06 · AC-PAY-TPL-04 preview | **qa** |
| R-PAY-SRC-ATT | Full hour-var fidelity until `att_timesheet_line` LIVE | ATT lane |
| R-PAY-SRC-INPUT-API | Period input pack CRUD HTTP | ba-data/sa → dev-be later |
| R-PAY-SRC-FE | Template bind + process UF | **dev-fe** after QA L1 |
| `payroll_e2e_ready` | LOCKED false until UF-proven | **pm** |

### Explicit non-claims

- Did **not** flip `payroll_e2e_ready=true` / AMIS parity DONE.  
- Did **not** seed UF data (U65).  
- Did **not** reopen formula API-01 L1 seats.  
- Did **not** invent period input HTTP CRUD this seat.

---

## 6. next_owner / next_dispatch_prompt

**next_owner:** `qa`

```text
work_item_id: PO-HRM-AMIS-PARITY-PAY-SRC-QA-01
from_role: pm
to_role: qa
lane: execution
parent: PO-HRM-AMIS-PARITY-RESEARCH-01
prior: PO-HRM-AMIS-PARITY-PAY-SRC-BE-01 READY_FOR_QA
priority: P0

## Mission
L1 + browser (U65 zero-seed) retest SRC precedence on PROCESS:
1. AC-PAY-SRC-01: NV có C&B fixed → payslip line = history; source_tier=emp_cb; F5 stable
2. AC-PAY-SRC-02: No history + template override published → line = override evaluate (≠ catalog)
3. AC-PAY-SRC-04: Sheet chưa chốt → HRM-PAY-ATT-412 (unchanged)
4. AC-PAY-SRC-05: No history/pack/override/default → FORMULA-412 VI (not silent 0₫)
5. AC-PAY-SRC-06 / AC-PAY-RUN-06: closed sheet + formula path → ≥1 payslip line · amounts match BE
6. Confirm payslip GET lines include source_tier when present
cấm seed · payroll_e2e_ready=false · cấm claim parity DONE

read_first:
- docs/qa/evidence/po-hrm-amis-parity-pay-src-be-01.md
- docs/qa/evidence/po-hrm-amis-parity-pay-depth-01.md §4.2 AC-PAY-SRC
- docs/qa/evidence/po-hrm-payroll-formula-run-gap-be-eval-01.md (retain honesty)

evidence: docs/qa/evidence/po-hrm-amis-parity-pay-src-qa-01.md
honesty: payroll_e2e_ready=false
```

---

## 7. Handoff fields

| Field | Value |
|-------|--------|
| **completion_report** | §5 |
| **next_owner** | **qa** |
| **next_dispatch_prompt** | §6 |
| **evidence_path** | `docs/qa/evidence/po-hrm-amis-parity-pay-src-be-01.md` |
| **ack_status** | **READY_FOR_QA** |
| **pm_dispatch_hint** | `PO-HRM-AMIS-PARITY-PAY-SRC-QA-01` — U65 browser AC-PAY-SRC |
