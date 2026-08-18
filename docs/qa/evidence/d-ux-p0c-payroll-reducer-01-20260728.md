# D-UX-P0C-PAYROLL-REDUCER-01 — Payroll domain useReducer (P0-c)

**Date:** 2026-07-28  
**Role:** dev-fe  
**Spec:** `docs/program/UX-UI-ERP-ANALYSIS.md` §5 **P0-c** / UX-06  
**change_mode:** FIX · preserve_default · code_memory APPEND VI  
**U65:** no seed · HOLD_DEPLOY

## spec_read_ack

| Field | Value |
|-------|-------|
| srs / analysis | `docs/program/UX-UI-ERP-ANALYSIS.md` §5 P0-c — state proliferation Payroll 25+ `useState` → `useReducer` by domain |
| tech / product | `_vibe-team-os/UX-PRODUCT-RULES.md` §3.4 state smell — modal+form atomic reset |
| must_keep | `taxSettlementFloatingUi` C1; `SalaryComponentsTab` Zod+RHF D5; Payroll mount; Clock-In / Attendance untouched; EmployeeProfile untouched |

## Closed scope

1. **Domain reducers** (`apps/web/hrm/src/components/payroll/payrollDomainUi.ts`):
   - shell (tab/filter/sort + live bootstrap)
   - advance (+ approval dialog)
   - tax settlement UI (list/dialogs — **not** floating edit C1)
   - salary component dialogs (edit/delete/system — live Add stays in SalaryComponentsTab)
   - batch (payment / summary delete / payslip print)
2. **Hook** `usePayrollDomainUi` — SetStateAction-compatible setters + **atomic** `on*OpenChange` / open/close so Esc/overlay close resets forms (UX-06).
3. **Payroll.tsx** wire — race-prone tab/modal/form state via hook; C1 floating UI remains local `useState(createEmptyTaxSettlementFloatingUiState)`.
4. **Unit tests** — reducer transitions (open→edit→close = empty form / null target).

## must_keep verification

| Guard | Status |
|-------|--------|
| `taxSettlementFloatingUi` import + local state in Payroll | kept |
| `SalaryComponentsTab` mount / Zod+RHF | not modified this WI |
| EmployeeProfile | not touched |
| Attendance / Clock-In | not touched |

## Tests

```bash
cd apps/web/hrm
pnpm exec vitest run src/components/payroll/__tests__/payrollDomainUi.test.ts src/components/payroll/__tests__/taxSettlementFloatingUi.test.ts
# → 22 passed (13 domain + 9 floating C1 regression)
pnpm exec tsc --noEmit -p tsconfig.json
# → exit 0
```

## Residual (out of this WI)

- Policy mock tabs (tax/insurance participant dialogs) still local `useState` — not in P0-c race cluster.
- Full Payroll IA collapse / lazy route = separate wave (P0-a).
- Browser L2.5 cancel→reopen form empty = QA.

## Handoff

- `ack_status`: **READY_FOR_QA**
- `next_owner`: qa
- `work_item_id` QA: **QA-UX-P0C-01**

### next_dispatch_prompt (copy-ready)

```text
work_item_id: QA-UX-P0C-01
from_role: pm
to_role: qa
lane: execution
entry_criteria: D-UX-P0C-PAYROLL-REDUCER-01 READY_FOR_QA; U65 browser-only; no seed
evidence_dev: docs/qa/evidence/d-ux-p0c-payroll-reducer-01-20260728.md
spec_ref: docs/program/UX-UI-ERP-ANALYSIS.md P0-c / UX-06
AC:
  1) Login ceo@xe.vn → HRM Payroll mount OK (no module t() crash)
  2) Tax settlement: open Add → fill fields → Cancel/Esc → reopen → form empty (no stale year/units)
  3) Tax refund/deduction dialogs: same cancel→reopen empty
  4) Advance Add: fill → close → reopen empty
  5) Salary component Edit: open edit → Esc → reopen not stale; Delete dialog target clears
  6) C1 regression: tax settlement employee Edit still opens (floatingUi null-guard)
  7) SalaryComponentsTab live Add still Zod+RHF (D5)
  8) Do NOT require Attendance/Profile changes
cấm: seed; deploy; PASS only unit test without browser AC above
exit_criteria: evidence docs/qa/evidence/qa-ux-p0c-01-20260728.md; PASS_TO_PM or FAIL with residual
```
