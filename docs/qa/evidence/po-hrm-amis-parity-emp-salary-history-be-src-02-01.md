# Evidence — PO-HRM-AMIS-PARITY-EMP-SALARY-HISTORY-BE-SRC-02-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-AMIS-PARITY-EMP-SALARY-HISTORY-BE-SRC-02-01` |
| **parent** | `PO-HRM-AMIS-PARITY-EMP-SALARY-HISTORY-DATA-01` |
| **from_role** | dev-be |
| **to_role** | qa |
| **lane** | execution |
| **date** | 2026-08-07 |
| **change_mode** | ADD · EXPAND |
| **ack_status** | **READY_FOR_QA** |
| **honesty** | `payroll_e2e_ready=false` · U65 zero-seed |

---

## Mission closed

Implement **BR-AMIS-PAY-SRC-02** per-component fixed PC resolution on payroll PROCESS using `employee_compensation_lines.component_code`.

---

## spec_read_ack

| Layer | Path / section |
|-------|----------------|
| DATA | `docs/qa/evidence/po-hrm-amis-parity-emp-salary-history-data-01.md` §4–§7 |
| BR | `docs/qa/evidence/po-hrm-amis-parity-pay-depth-01.md` §3 BR-SRC-02 |
| AS-IS | `pay-formula-variable-bag.ts` · `employee-compensation.service.ts` |

---

## Implementation summary

| # | Deliverable | Status |
|---|-------------|--------|
| 1 | `ensureSchema` ADD `employee_compensation_lines.component_code` + partial index | DONE |
| 2 | Backfill §10 (allowance→code, base→`base`, probation if catalog) on bootstrap | DONE |
| 3 | DTO `component_code` optional; validate vs `salary_components` (`HRM-COMP-004`) | DONE |
| 4 | Duplicate component per package (`HRM-COMP-005`); overlap guard (`HRM-COMP-409-OVERLAP`) | DONE |
| 5 | Export `resolveEffectiveCompensationPackage` — shared package order with var bag | DONE |
| 6 | EXPAND `loadEmployeeFixedAmountForComponent` — match by `component_code`; `source_ref=emp_cb:package:{id}:line:{id}`; skip template/catalog when hit | DONE |
| 7 | PROCESS path unchanged orchestration — `resolveSrcComponentAmount` short-circuits at tier 1 | DONE |

---

## Files touched

- `apps/api/hrm-api/src/contracts-insurance/employee-compensation.service.ts`
- `apps/api/hrm-api/src/contracts-insurance/dto/create-compensation-package.dto.ts`
- `apps/api/hrm-api/src/payroll/pay-formula-variable-bag.ts`
- `apps/api/hrm-api/src/payroll/pay-src-resolver.ts`
- `apps/api/hrm-api/src/contracts-insurance/employee-compensation.service.spec.ts`
- `apps/api/hrm-api/src/payroll/pay-src-resolver.spec.ts`
- `apps/api/hrm-api/src/payroll/pay-formula.service.spec.ts`

---

## Verification

```bash
cd apps/api/hrm-api
pnpm exec jest --testPathPatterns="pay-src-resolver|employee-compensation|pay-formula.service|pay-formula-variable-bag" --no-coverage
# 58 passed · 4 suites · exit 0
```

| Test ID | Result |
|---------|--------|
| VAL-PAY-SRC-02A | PASS — component_code line → amount + `emp_cb:package:*:line:*` |
| VAL-PAY-SRC-02B | PASS — template override skipped when emp C&B present (`pay-formula.service.spec.ts`) |
| VAL-EMP-SH-04 | PASS — unknown `component_code` → `HRM-COMP-004` |
| VAL-EMP-SH-05 | PASS — duplicate component → `HRM-COMP-005` |
| VAL-EMP-SH-06 | PASS — overlapping segments → `HRM-COMP-409-OVERLAP` |
| Unmapped fall-through | PASS — no fixed PC → null → SRC-03..05 (`pay-src-resolver.spec.ts`) |

---

## must_keep (verified)

- Contract pointer fallback only — `resolveEffectiveCompensationPackage` order preserved
- No print snapshot reads for PAY
- No overwrite paid segments / revise still append-only
- `ATT-412` / `FORMULA-412` honesty — no silent 0 when all SRC tiers empty
- `payroll_e2e_ready=false`

---

## Residual

| ID | Owner | Note |
|----|-------|------|
| FE C&B line component picker | dev-fe | G-EMP-SH-05 |
| QA U65 AC-PAY-SRC-01 browser | qa | J-HRM-07 process path |
| `nest build` pre-existing TS in `pay-period-input-pack.service.ts` | dev-be backlog | unrelated to this wave |

---

## completion_report

**Closed:** Schema EXPAND + backfill + DTO validation + SRC-02 per-component PROCESS resolver with audit `source_ref`; jest 58/58 on touched suites.

**Open:** FE timeline picker; QA browser matrix; unrelated `pay-period-input-pack.service.ts` build TS (pre-existing).

---

## next_owner

**qa**

## next_dispatch_prompt

```text
work_item_id: PO-HRM-AMIS-PARITY-EMP-SALARY-HISTORY-QA-SRC-02-01
from_role: pm
to_role: qa
lane: execution
priority: P1
parent: PO-HRM-AMIS-PARITY-EMP-SALARY-HISTORY-BE-SRC-02-01
entry_criteria: docs/qa/evidence/po-hrm-amis-parity-emp-salary-history-be-src-02-01.md READY_FOR_QA · jest 58 PASS

## Mission
U65 browser retest AC-PAY-SRC-01 / VAL-PAY-SRC-02A/B on PROCESS path (J-HRM-07).
1. Login ceo@xe.vn → HRM C&B package create/revise with component_code on allowance line
2. Process payroll period → payslip line amount = package line; source_tier=emp_cb; F5 stable
3. When history present for component — template override amount MUST NOT win (VAL-PAY-SRC-02B)
4. No seed · FE full click path · Network 2xx + F5

must_keep: payroll_e2e_ready=false · ATT-412 honesty if sheet not closed
exit: PASS_TO_PM or FAIL with evidence docs/qa/evidence/po-hrm-amis-parity-emp-salary-history-qa-src-02-01.md
ack_status: PASS_TO_PM
```

---

## evidence_path

`docs/qa/evidence/po-hrm-amis-parity-emp-salary-history-be-src-02-01.md`

## ack_status

**READY_FOR_QA**
