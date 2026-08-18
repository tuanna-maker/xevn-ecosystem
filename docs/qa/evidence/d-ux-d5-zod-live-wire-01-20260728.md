# D-UX-D5-ZOD-LIVE-WIRE-01 — Wire Zod+RHF on live SalaryComponentsTab Add dialog

| Field | Value |
|-------|--------|
| **work_item_id** | `D-UX-D5-ZOD-LIVE-WIRE-01` |
| **from_role** | pm |
| **to_role** | dev-fe |
| **date** | 2026-07-28 |
| **prior** | `QA-UX-D5-01` **FAIL_TO_PM** @ `docs/qa/evidence/qa-ux-d5-01-20260728.md` |
| **ack_status** | **READY_FOR_QA** |
| **locks** | U65 zero-seed · HOLD_DEPLOY · no seed · no deploy · no Profile |

---

## Defect (QA)

- Zod + RHF lived only on orphan `Payroll.tsx` Dialog — **no** `setShowAddSalaryComponentDialog(true)` from user CTA.
- Live path: `SalaryComponentsTab` Add dialog used manual `validateForm` + `salaryComponents.validation.*` (`manualDestructiveP=3`, `formItemMessage=0`).

---

## Fix (FIX)

| Change | Detail |
|--------|--------|
| Live Add dialog | `SalaryComponentsTab` → `createSalaryComponentFormSchema` + `useForm` + `zodResolver` + `FormField` / `FormMessage` |
| Messages | Inject `payroll.salaryComponents.*` after `useTranslation` (no module-scope `t()`) |
| Defaults | `appliedUnits: ['all']` → map `applied_to: 'all'` for API (`mapZodValuesToFormData`) |
| Orphan removed | Payroll Add dialog + dead `showAddSalaryComponentDialog` / manual validate helpers deleted; tab still mounts `<SalaryComponentsTab />` |
| Edit/Delete (tab) | Unchanged (manual edit validate) |
| must_keep C1 | Payroll tax-settlement edit dialog re-wired to `taxSettlementFloatingUi` (`formatPayrollMoney` / `ViMoneyInput` / open-close reset) |
| must_keep other | Payroll mount; Clock-In / UX-03 debounce not touched |

### CODE-MEMORY

- APPEND VI on `SalaryComponentsTab.tsx`, `salaryComponentFormSchema.ts`, `Payroll.tsx`

---

## Exit grep

```text
SalaryComponentsTab.tsx → createSalaryComponentFormSchema  (wired)
Payroll.tsx → showAddSalaryComponentDialog  (absent — orphan removed)
```

---

## Unit (supporting)

| Suite | Result |
|-------|--------|
| `salaryComponentFormSchema.test.ts` | **5/5 PASS** |
| `taxSettlementFloatingUi.test.ts` (must_keep C1) | **9/9 PASS** |
| `tsc --noEmit` (hrm) | **exit 0** |

```bash
pnpm --filter vite_react_shadcn_ts exec vitest run \
  src/components/payroll/__tests__/salaryComponentFormSchema.test.ts \
  src/components/payroll/__tests__/taxSettlementFloatingUi.test.ts
```

---

## QA retest focus (browser U65)

1. `/hr/payroll` → Thành phần lương → **Thêm mới** → empty submit → `formItemMessage≥1` (RHF FormMessage VI from `payroll.salaryComponents.*`).
2. Tax settlement C1 still opens (must_keep).
3. No `ReferenceError: t is not defined`.
4. Re-run: `node scripts/qa/qa-ux-d5-01-browser.mjs` → expect `UF-D5-zod-rhf-live-wiring` **PASS**.
5. If PASS → PM may unlock UX-09 / `D-UX-UX09-SHIFTS-BULK-01`.

---

## Handoff

- `completion_report`: Live Add dialog Zod+RHF wired; orphan Payroll dialog removed; unit 14/14; must_keep C1 tests green.
- `next_owner`: `qa`
- `ack_status`: **READY_FOR_QA**
- `evidence_path`: `docs/qa/evidence/d-ux-d5-zod-live-wire-01-20260728.md`

### next_dispatch_prompt

```text
work_item_id: QA-UX-D5-01
from_role: pm
to_role: qa
lane: execution
entry_criteria: D-UX-D5-ZOD-LIVE-WIRE-01 READY_FOR_QA · U65 HOLD_DEPLOY
read_first:
  - docs/qa/evidence/d-ux-d5-zod-live-wire-01-20260728.md
  - docs/qa/evidence/qa-ux-d5-01-20260728.md (prior FAIL)
retest:
  - node scripts/qa/qa-ux-d5-01-browser.mjs
  - AC: live Add empty submit → FormMessage (formItemMessage≥1); keys payroll.salaryComponents.*
  - must_keep: Payroll mount / no t undefined; tax C1; Clock-In
exit_criteria:
  - UF-D5-zod-rhf-live-wiring PASS → PASS_TO_PM
  - then PM unlock UX-09 / D-UX-UX09-SHIFTS-BULK-01
cấm: seed · deploy
```
