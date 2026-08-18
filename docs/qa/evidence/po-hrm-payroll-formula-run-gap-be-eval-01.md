# Evidence — PO-HRM-PAYROLL-FORMULA-RUN-GAP-BE-EVAL-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-BE-EVAL-01` |
| **parent** | `PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01` |
| **from_role** | `dev-be` |
| **to_role** | `qa` |
| **lane** | execution |
| **date** | 2026-08-07 |
| **priority** | P0 |
| **change_mode** | ADD |
| **prior** | QC-02 GWC (browser GĐ1 form · R-PAY-FE-FORM CLOSED) · residual **R-PAY-F-EVAL** |
| **ack_status** | **READY_FOR_QA** |
| **honesty** | `payroll_e2e_ready=false` · **cấm** claim formula LIVE / Phase1 DONE / module UAT |

---

## 1. spec_read_ack

| # | Artifact | Used |
|---|----------|------|
| 1 | `docs/qa/evidence/po-hrm-payroll-formula-run-gap-qc-02.md` | GWC · R-PAY-F-EVAL OPEN · preview 412-PREVIEW-STUB retain |
| 2 | `docs/qa/evidence/po-hrm-payroll-formula-run-gap-qc-01.md` | L1 CRUD dual-control retained |
| 3 | `docs/program/specs/PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01.md` §4.4 · §5 · §7 | PREVIEW / PROCESS bind · error codes |
| 4 | `docs/qa/evidence/po-hrm-payroll-formula-run-gap-be-01.md` | Formulas CRUD baseline |
| 5 | `docs/qa/evidence/po-hrm-payroll-formula-run-gap-data-01.md` §3 | ATT hours ownership · G-PAY-F-06 ABSENT |
| 6 | `PO_HRM_AMIS_PARITY_RESEARCH_01.md` §3 | SRC Emp→Period→Template→Catalog cite — template merge **not invented** |

---

## 2. Deliverables (apps)

| Path | Role |
|------|------|
| `apps/api/hrm-api/src/payroll/pay-formula-evaluator.ts` | Documented subset **`gd1_eval_v1`** pure evaluate + classify opaque GĐ1 |
| `apps/api/hrm-api/src/payroll/pay-formula-evaluator.spec.ts` | Jest pure eval |
| `apps/api/hrm-api/src/payroll/pay-formula-variable-bag.ts` | ATT line probe · C&B soft-read · overrides · precedence warnings |
| `apps/api/hrm-api/src/payroll/pay-formula.service.ts` | PREVIEW deepen · `resolvePublishedFormulaForProcess` · `evaluateBoundFormula` · `payroll_payslip_lines` DDL + replace |
| `apps/api/hrm-api/src/payroll/payroll.service.ts` | PROCESS bind published formula → lines · FORMULA-412 / ATT-412 honesty |
| `apps/api/hrm-api/src/payroll/pay-formula.constants.ts` | `HRM-PAY-FORMULA-412-NOT-EVALUABLE` (+ reuse PREVIEW-STUB / FORMULA-412) |
| Specs | `pay-formula.service.spec` · `payroll.service.spec` updated |

**Documented subset (`gd1_eval_v1`):**

```json
{
  "form": "gd1_eval_v1",
  "lines": [
    { "component_code": "BASE", "sign": "earning", "source": "var", "var": "base_salary" },
    { "component_code": "X", "sign": "deduction", "source": "expr", "expr": { "op": "mul", "left": "base_salary", "right": 0.1 } }
  ]
}
```

FE GĐ1 opaque `{ form:"gd1", ops:[{op:"opaque"|noop}] }` → **not LIVE** → `HRM-PAY-FORMULA-412-PREVIEW-STUB`.

---

## 3. Behavior matrix

| Path | Condition | Result |
|------|-----------|--------|
| PREVIEW | Opaque GĐ1 / unsupported form | **412-PREVIEW-STUB** (honest) |
| PREVIEW | `gd1_eval_v1` + ATT hours missing + no overrides | **412-PREVIEW-STUB** (ATT line absent) |
| PREVIEW | `gd1_eval_v1` + complete bag (overrides and/or C&B-only) | **200** lines/gross/net · `payroll_e2e_ready=false` |
| PROCESS | No active published formula | **HRM-PAY-FORMULA-412** — **no** silent zero |
| PROCESS | Closed sheet fail | **HRM-PAY-ATT-412** (unchanged) |
| PROCESS | Opaque / incomplete ATT bag | **FORMULA-412** / mapped stub codes |
| PROCESS | Evaluable + bag ready | Upsert amounts + **`payroll_payslip_lines`** + snapshot `formula_definition_id` |

**SRC precedence (implemented GĐ1):** Period `formula_definition_id` → company latest `active` · Emp override / Template HTTP merge / `salary_components.formula` TEXT = **not** engine (warnings only).

---

## 4. Jest evidence

```text
pnpm --filter hrm-api exec jest --testPathPatterns=pay-formula-evaluator.spec --testPathPatterns=pay-formula.service.spec --testPathPatterns=payroll.service.spec --testPathPatterns=payroll.controller.spec --no-coverage
→ Test Suites: 4 passed · Tests: 49 passed
```

Coverage intent:

| Case | Result |
|------|--------|
| Pure eval var/const/expr · opaque fail · MISSING_VAR · DIV_BY_ZERO | PASS |
| PREVIEW opaque → PREVIEW-STUB | PASS |
| PREVIEW gd1_eval_v1 + overrides → computed · ready=false | PASS |
| PROCESS no formula → FORMULA-412 | PASS |
| PROCESS bind + payslip lines | PASS |
| ATT-412 + dual-control regression retained | PASS |

---

## 5. completion_report

### Closed

1. Staged evaluator path for documented `gd1_eval_v1` subset + jest.  
2. PREVIEW: real compute when bag ready; else honest **412-PREVIEW-STUB**.  
3. PROCESS: bind published formula version; write `payroll_payslip_lines`; refuse silent zero.  
4. ATT hours fidelity remain blocked until `att_timesheet_line` (probe + stub).  
5. CODE-MEMORY APPEND VI on touched modules.  
6. Honesty: **`payroll_e2e_ready=false`**.

### Residual

| ID | Item | Owner |
|----|------|-------|
| R-PAY-F-ATT-LINE | `att_timesheet_line` ADD → hours var bag LIVE | ATT / ba-data → **dev-be** later |
| R-PAY-F-EVAL-QA | L1 + browser preview/process with gd1_eval_v1 | **qa** |
| R-PAY-FE-OPAQUE→EVAL | FE may later emit `gd1_eval_v1` lines (optional) | **dev-fe** |
| R-PAY-AMIS-TPL | Template formula override merge | AMIS TPL — **not** this seat |
| `payroll_e2e_ready` | LOCKED false until UF-proven | **pm** |

### Explicit non-claims

- Did **not** invent LIVE claim / flip `payroll_e2e_ready`.  
- Did **not** treat `salary_components.formula` as engine.  
- Did **not** invent template HTTP merge.  
- Did **not** seed UF data (U65).  
- Did **not** claim Phase1 DONE / module payroll UAT / J-HRM-07 formula process UAT.

---

## 6. next_owner / next_dispatch_prompt

**next_owner:** `qa`

```text
work_item_id: PO-HRM-PAYROLL-FORMULA-RUN-GAP-QA-EVAL-01
from_role: pm
to_role: qa
lane: execution
parent: PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01
prior: PO-HRM-PAYROLL-FORMULA-RUN-GAP-BE-EVAL-01 READY_FOR_QA
priority: P0

## Mission
L1 (+ optional browser) retest staged evaluator honesty:
1. POST preview on FE GĐ1 opaque formula → still HRM-PAY-FORMULA-412-PREVIEW-STUB (no fake LIVE)
2. Create/publish formula with expression_json form=gd1_eval_v1 + required_vars base_salary only → preview with variableOverrides → 200 lines/gross/net · payroll_e2e_ready=false
3. PROCESS period without active formula → HRM-PAY-FORMULA-412 (not silent 0₫ UAT)
4. PROCESS with ATT open → still HRM-PAY-ATT-412
5. Confirm payslip_lines written only when evaluate succeeds
U65 zero-seed · cấm claim formula LIVE / Phase1 / module UAT

read_first:
- docs/qa/evidence/po-hrm-payroll-formula-run-gap-be-eval-01.md
- docs/program/specs/PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01.md §4.4 · §5 · §7

evidence: docs/qa/evidence/po-hrm-payroll-formula-run-gap-qa-eval-01.md
honesty: payroll_e2e_ready=false
```

---

## 7. Handoff fields

| Field | Value |
|-------|--------|
| **completion_report** | §5 |
| **next_owner** | **qa** |
| **next_dispatch_prompt** | §6 |
| **evidence_path** | `docs/qa/evidence/po-hrm-payroll-formula-run-gap-be-eval-01.md` |
| **ack_status** | **READY_FOR_QA** |
| **pm_dispatch_hint** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-QA-EVAL-01` — keep ready=false |
