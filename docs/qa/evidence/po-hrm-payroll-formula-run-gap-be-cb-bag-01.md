# Evidence — PO-HRM-PAYROLL-FORMULA-RUN-GAP-BE-CB-BAG-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-BE-CB-BAG-01` |
| **parent** | `PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01` |
| **from_role** | `dev-be` |
| **to_role** | `qa` |
| **lane** | execution |
| **date** | 2026-08-07 |
| **priority** | P0 |
| **change_mode** | ADD |
| **prior** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-QC-EVAL-01` GO WITH CONDITIONS · **R-PAY-F-CB-BAG OPEN** |
| **ack_status** | **READY_FOR_QA** |
| **honesty** | `payroll_e2e_ready=false` · **cấm** claim formula LIVE / Phase1 DONE / module UAT |

---

## 1. spec_read_ack

| # | Artifact | Used |
|---|----------|------|
| 1 | `docs/qa/evidence/po-hrm-payroll-formula-run-gap-qc-eval-01.md` | GWC · R-PAY-F-CB-BAG OPEN · process VARS residual |
| 2 | `docs/qa/evidence/po-hrm-payroll-formula-run-gap-qa-eval-01.md` | AC5 SKIP `FORMULA-412-VARS` · `CB_PACKAGE_ABSENT` |
| 3 | `docs/qa/evidence/po-hrm-payroll-formula-run-gap-be-eval-01.md` | Staged evaluator baseline |
| 4 | `docs/program/specs/PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01.md` §4.4 · §5 · §7 | PROCESS bind · VARS taxonomy |
| 5 | `employee_compensation_*` Nest read paths | Soft-read packages/lines · contract link |

**Root cause (QA stamp):** PROCESS `HRM-PAY-FORMULA-412-VARS` + warnings `CB_PACKAGE_ABSENT` — soft-read used **exact** `company_id = period.company_id`, missing employee OU / aliases / contract fallback.

---

## 2. Deliverables (apps)

| Path | Role |
|------|------|
| `apps/api/hrm-api/src/payroll/pay-formula-variable-bag.ts` | **ADD** expand period+emp OU · employee-anchored fallback · contract `compensation_package_id` · probation→base map |
| `apps/api/hrm-api/src/payroll/pay-formula-variable-bag.spec.ts` | **ADD** jest C&B bag cases |
| `apps/api/hrm-api/src/payroll/pay-formula.service.spec.ts` | **ADD** evaluateBoundFormula C&B no-overrides + VARS-412 absent |
| `apps/api/hrm-api/src/payroll/pay-formula.service.ts` | CODE-MEMORY APPEND VI |
| `apps/api/hrm-api/src/payroll/payroll.service.ts` | CODE-MEMORY APPEND VI |
| Dist | `pnpm --filter hrm-api build` + `verify-dist` **PASS** (R-PAY-F-STALE-DIST SOP) |

**C&B resolve order (PROCESS / PREVIEW with employeeId):**

1. Expand company ids = period OU aliases ∪ employee home OU aliases (`main`↔`holding`↔UUID + member slug).
2. Effective package in expanded scope → lines → `base_salary` / `allowance_*`.
3. Else employee-anchored package (any company) + warning `CB_PACKAGE_EMPLOYEE_FALLBACK`.
4. Else `employee_contracts.compensation_package_id` + warning `CB_PACKAGE_FROM_CONTRACT_LINK`.
5. Else `CB_PACKAGE_ABSENT` → caller **`HRM-PAY-FORMULA-412-VARS`** (no silent 0₫).

---

## 3. Behavior matrix

| Path | Condition | Result |
|------|-----------|--------|
| PROCESS / evaluate | Published `gd1_eval_v1` + CORE C&B base present (no overrides) | **computed** → upsert amounts + **`payroll_payslip_lines`** · `sourcePrecedence` includes `emp_cb` |
| PROCESS / evaluate | C&B package still absent | **`HRM-PAY-FORMULA-412-VARS`** · `payroll_e2e_ready=false` |
| PROCESS | No active formula | **`HRM-PAY-FORMULA-412`** (retained) |
| PROCESS | Open ATT sheet | **`HRM-PAY-ATT-412`** (retained) |
| PREVIEW | Hours vars + ATT line absent | **`HRM-PAY-FORMULA-412-PREVIEW-STUB`** (retained) |
| Honesty | — | **`payroll_e2e_ready=false`** · no seed · no LIVE claim |

---

## 4. Jest evidence

```text
pnpm --filter hrm-api exec jest --testPathPatterns=pay-formula-variable-bag.spec --testPathPatterns=pay-formula-evaluator.spec --testPathPatterns=pay-formula.service.spec --testPathPatterns=payroll.service.spec --testPathPatterns=payroll.controller.spec --no-coverage
→ Test Suites: 5 passed · Tests: 60 passed
```

| Case | Result |
|------|--------|
| Period holding + emp OU trsport package → base_salary | PASS |
| Employee-anchored / contract-link fallbacks | PASS |
| Probation line → base_salary | PASS |
| Absent package → empty + CB_PACKAGE_ABSENT | PASS |
| evaluateBoundFormula no overrides → gross/net/lines | PASS |
| evaluateBoundFormula absent → FORMULA-412-VARS | PASS |
| ATT / dual-control / PREVIEW-STUB retained | PASS |

```text
pnpm --filter hrm-api run build → nest build + verify-dist PASS
```

---

## 5. completion_report

### Closed

1. CORE C&B → evaluator var bag for PROCESS without `variableOverrides` cheat.  
2. Success path writes `payroll_payslip_lines` via existing PROCESS bind (evaluate computed).  
3. Honest **FORMULA-412-VARS** when bag still incomplete; ATT-412 / FORMULA-412 / PREVIEW-STUB retained.  
4. Jest regression **60 PASS**; CODE-MEMORY APPEND VI; dist rebuild SOP.  
5. Honesty: **`payroll_e2e_ready=false`**.

### Residual

| ID | Item | Owner |
|----|------|-------|
| **R-PAY-F-CB-BAG** | L1/browser PROCESS success lines with real C&B (no overrides) | **qa** this wave |
| R-PAY-F-ATT-LINE | `att_timesheet_line` hours LIVE | ATT / ba-data → **dev-be** later |
| R-PAY-FE-OPAQUE→EVAL | FE emit `gd1_eval_v1` (optional) | **dev-fe** |
| R-PAY-F-STALE-DIST | Restart `start:prod` after dist if live :28001 | **qa** / devops observe |
| `payroll_e2e_ready` | LOCKED false until UF-proven | **pm** |

### Explicit non-claims

- Did **not** flip `payroll_e2e_ready` / claim formula LIVE / Phase1 / module UAT.  
- Did **not** invent ATT line schema.  
- Did **not** seed (U65).  
- Did **not** treat `salary_components.formula` as engine.

---

## 6. next_owner / next_dispatch_prompt

**next_owner:** `qa`

```text
work_item_id: PO-HRM-PAYROLL-FORMULA-RUN-GAP-QA-CB-BAG-01
from_role: pm
to_role: qa
lane: execution
parent: PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01
prior: PO-HRM-PAYROLL-FORMULA-RUN-GAP-BE-CB-BAG-01 READY_FOR_QA
priority: P0

## Mission
L1 retest R-PAY-F-CB-BAG:
1. Ensure HRM dist refreshed / restart start:prod if needed (R-PAY-F-STALE-DIST SOP)
2. Pick enrolled employee WITH CORE C&B base package (or create via FE C&B only — U65 no seed script)
3. Publish gd1_eval_v1 required_vars=[base_salary] only (no payable_hours)
4. PROCESS period with closed ATT sheet → 2xx · payroll_payslip_lines · amounts from C&B (no variableOverrides)
5. PROCESS employee without C&B → still HRM-PAY-FORMULA-412-VARS (honest)
6. Retain ATT-412 / FORMULA-412 regression
honesty: payroll_e2e_ready=false · cấm seed · cấm claim LIVE / Phase1 / module UAT

read_first:
- docs/qa/evidence/po-hrm-payroll-formula-run-gap-be-cb-bag-01.md
- docs/qa/evidence/po-hrm-payroll-formula-run-gap-qc-eval-01.md
evidence: docs/qa/evidence/po-hrm-payroll-formula-run-gap-qa-cb-bag-01.md
```
