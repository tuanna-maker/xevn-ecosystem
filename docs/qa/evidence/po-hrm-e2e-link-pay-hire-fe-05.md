# Evidence — PO-HRM-E2E-LINK-PAY-HIRE-FE-05

| Field | Value |
|-------|--------|
| work_item_id | `PO-HRM-E2E-LINK-PAY-HIRE-FE-05` |
| from_role | dev-fe |
| to_role | pm |
| lane | execution |
| parent | `PO-HRM-E2E-LINK-PAY-HIRE-QA-05` · residual `R-PAY-HIRE-ELIG-UI-ENABLED-MISMATCH` |
| change_mode | FIX narrow |
| date | 2026-08-06 |
| ack_status | **READY_FOR_QA** |
| honesty | `payroll_e2e_ready=false` |
| u65 | zero-seed · no DB mutate |

---

## Defect closed

### P1 — R-PAY-HIRE-ELIG-UI-ENABLED-MISMATCH

- **Symptom:** Add-employee dialog showed ~8 enabled checkboxes while BE eligibility returned `eligible_count=0` (all `NO_CLOSED_SHEET`).
- **Root cause:** `PayrollBatchesTab` used `isEligible = eligibility ? eligibility.eligible : true` — employees from `useEmployees()` **not present** in BE `items[]` defaulted to **enabled** (optimistic open).
- **Fix (fail-closed):**
  - `payrollDomainUi.ts`: `isPayrollEmployeeEligibleForEnroll` + `resolvePayrollEligibilityDisplay` — checkbox enabled only when eligibility loaded and `eligible === true`.
  - Employees missing from BE map → disabled + `NOT_FOUND` badge after load.
  - While loading / error → all checkboxes disabled; selection pruned to strictly eligible ids only.

---

## Files changed

| File | Change |
|------|--------|
| `apps/web/hrm/src/components/payroll/payrollDomainUi.ts` | Fail-closed helpers + `PayrollEligibilityRow` type |
| `apps/web/hrm/src/components/payroll/PayrollBatchesTab.tsx` | Wire helpers; `eligibilityReady` gate; prune selection |
| `apps/web/hrm/src/components/payroll/__tests__/payrollDomainUi.test.ts` | +1 vitest fail-closed matrix |

---

## Validation

```text
pnpm exec vitest run src/components/payroll/__tests__/payrollDomainUi.test.ts \
  src/lib/payrollEnrollPayload.test.ts \
  src/components/payroll/payrollTemplateSelect.test.ts \
  src/hooks/usePayrollBatches.test.ts
→ 27/27 PASS
```

Lint (touched files): no errors.

**must_keep verified:** FE-02 calc-list batches · FE-03 template sentinel · FE-04 iframe Select / auto detail / enroll whitelist · BE-03 scope unchanged.

**forbidden:** `payroll_e2e_ready=true` not set · no seed.

---

## QA entry (browser — U65)

1. Login `ceo@xe.vn` → **Tiền lương** → **Tính lương** → open draft batch → **Thêm nhân viên**.
2. When GET eligibility returns `eligible_count=0`: **zero** enabled checkboxes; all rows disabled with `NO_CLOSED_SHEET` or `NOT_FOUND` badges.
3. When `eligible_count>0`: only rows with `eligible:true` in BE items are selectable.
4. Enroll POST body still `{ mode, employee_ids }` only (FE-04 regression).

---

## Residual

| ID | Owner | Notes |
|----|-------|-------|
| R-PAY-HIRE-NO-ELIGIBLE-U65 | pm | Full AC-04/05 chain still needs attendance close (cross-module) |
| R-PAY-HIRE-ATT-412-BROWSER | dev-fe | Khóa bảng lương on empty draft — P2, out of FE-05 scope |

---

## completion_report

- **Closed:** P1 eligibility UI mismatch — fail-closed checkbox gate aligned with BE `items[]` / `eligible` flag.
- **Open:** U65 zero eligible NV until attendance close; ATT-412 browser lock button P2 unchanged.

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: PO-HRM-E2E-LINK-PAY-HIRE-FE-05-QA
from_role: pm
to_role: qa
lane: execution
parent: PO-HRM-E2E-LINK-PAY-HIRE-FE-05 READY_FOR_QA

read_first:
- docs/qa/evidence/po-hrm-e2e-link-pay-hire-fe-05.md
- docs/qa/evidence/po-hrm-e2e-link-pay-hire-qa-05.md (baseline)

entry_criteria:
- L0 stack up; browser-only U65; payroll_e2e_ready=false
- persona ceo@xe.vn · /hr/payroll?companyId=main

task:
- Re-open add-employee dialog on draft with eligible_count=0
- Assert ZERO enabled checkboxes; all show NO_CLOSED_SHEET or NOT_FOUND badge
- If any eligible NV exists in env, assert only those rows enabled
- Regression FE-04: month Select, auto detail, enroll body whitelist

exit: docs/qa/evidence/po-hrm-e2e-link-pay-hire-fe-05-qa.md PASS or FAIL
ack_status: PASS_TO_PM
```

## ack_status

**READY_FOR_QA**
