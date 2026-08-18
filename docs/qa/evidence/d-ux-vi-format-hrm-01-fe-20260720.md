# D-UX-VI-FORMAT-HRM-01 — FE evidence (2026-07-20)

| Field | Value |
|-------|-------|
| **work_item_id** | `D-UX-VI-FORMAT-HRM-01` |
| **from_role** | dev-fe |
| **to_role** | qa |
| **ack_status** | **READY_FOR_QA** |
| **spec_ref** | `docs/program/UX_VI_DATE_NUMBER_FORMAT_AC.md` §4 MUST/EXEMPT · inventory Top20 |
| **shared SoT** | `@xevn/ui` `ViGroupedIntegerInput` + `formatDisplayDate` (dual via `@/lib/viNumberFormat`) |

## Scope closed

1. **HRM wrapper** `ViMoneyInput` — Input surface styles over SoT `ViGroupedIntegerInput`; helpers `amountStringToNumber` / `numberToAmountString` for string drafts.
2. **MUST money/qty** wired (vi-VN thousand group while typing; `onValueChange` → **number** for API):
   - Compensation base / probation / allowance + effective date Calendar `dd/MM/yyyy`
   - Employee form salary; salary allowance amount
   - Insurance base salary (Add dialog) + policy mức đóng; employee SI/employer/benefit
   - Advance amount; bonus **fixed** amount (rate % left EXEMPT)
   - Salary template default/min/max
   - Sales target / actual / commission amount / bonus (rate + order counts left EXEMPT)
   - Payroll tax settlement money cluster (dependents count + pay-by % left EXEMPT)
   - Headcount salary budget min/max; job salary min/max
   - Business trip cost / advance; rewards / penalty; asset value; training **cost** only
3. **Dates:** compensation effective → Popover+Calendar display `formatDisplayDate`; active package dates display via `formatDisplayDate` (no raw ISO). Job/insurance already Calendar. Residual native `type=date` listed below (not blocking this money wave).
4. **EXEMPT left alone:** page_size, year, scores 0–100, %, chart `XAxis type=number`, commission/bonus %, insurance rates %, dependents count, meal/order small counts, payment form % default.

## Files touched

| Path | Change |
|------|--------|
| `apps/web/hrm/src/components/ui/ViMoneyInput.tsx` | **new** wrapper + helpers |
| `apps/web/hrm/src/components/ui/__tests__/viMoneyInput.test.ts` | **new** vitest |
| `apps/web/hrm/src/lib/compensationLines.ts` | strip `.` separators on parse |
| `apps/web/hrm/src/components/employee/EmployeeCompensationPanel.tsx` | ViMoney + Calendar effective |
| `apps/web/hrm/src/components/employee/EmployeeFormDialog.tsx` | salary ViMoney |
| `apps/web/hrm/src/components/employee/EmployeeSalary.tsx` | allowance amount |
| `apps/web/hrm/src/components/employee/EmployeeInsurance.tsx` | contributions + benefit |
| `apps/web/hrm/src/components/employee/EmployeeRewardsDiscipline.tsx` | reward/penalty |
| `apps/web/hrm/src/components/employee/EmployeeAssets.tsx` | asset value |
| `apps/web/hrm/src/components/employee/EmployeeTraining.tsx` | cost only |
| `apps/web/hrm/src/components/insurance/AddInsuranceDialog.tsx` | base_salary |
| `apps/web/hrm/src/components/payroll/InsurancePolicyTab.tsx` | mức đóng |
| `apps/web/hrm/src/components/payroll/AdvanceRequestsTab.tsx` | advance amount |
| `apps/web/hrm/src/components/payroll/BonusPolicyTab.tsx` | fixed amount |
| `apps/web/hrm/src/components/payroll/SalaryTemplateBuilder.tsx` | default/min/max |
| `apps/web/hrm/src/components/payroll/SalesDataTab.tsx` | money fields ×2 dialogs |
| `apps/web/hrm/src/components/recruitment/HeadcountProposalTab.tsx` | budget min/max |
| `apps/web/hrm/src/components/recruitment/JobPostingsTab.tsx` | salary_min/max |
| `apps/web/hrm/src/components/attendance/BusinessTripRequestTab.tsx` | cost/advance |
| `apps/web/hrm/src/pages/Payroll.tsx` | tax settlement money |

## Tests

```text
pnpm --filter vite_react_shadcn_ts exec vitest run \
  src/components/ui/__tests__/viMoneyInput.test.ts \
  src/lib/viNumberFormat.test.ts \
  src/lib/formatDisplayDate.test.ts \
  src/lib/compensationLines.test.ts
→ 18 PASS (4 files)
```

## Residual (not this wave — defer)

- Remaining native `type=date` entry chrome (EmployeeContracts, LeaveTab, Payroll dates, Performance, …) — prefer Calendar in follow-up; display already mostly `dd/MM/yyyy` on lists.
- Meal / supply qty InternalServices P2; PlatformAdmin plan prices P1 optional.
- KPI target when unit=`%` stays EXEMPT; money unit not auto-detected this wave.
- Portal `D-UX-VI-FORMAT-PORTAL-01` / Mobile parity separate.

## Cấm respected

- No seed · no Phase1/PROD claim · API payloads remain **numeric** · no ScopeBar remount

## next_dispatch_prompt

```text
work_item_id: QA-UX-VI-FORMAT-01
from_role: pm
to_role: qa
lane: execution
residual_auto_fix: true
entry_criteria: L0 stack up; browser-only U65; D-UX-VI-FORMAT-HRM-01 READY_FOR_QA
evidence_dev: docs/qa/evidence/d-ux-vi-format-hrm-01-fe-20260720.md
spec_ref: docs/program/UX_VI_DATE_NUMBER_FORMAT_AC.md §5 AC-UX-NUM-01..04 · AC-UX-DATE-01/02

## HRM sample matrix (must browser)
1. UF-HRM-03 / compensation — Đãi ngộ: gõ lương 20000000 → UI 20.000.000; Lưu → Network amount number; F5 vẫn group; ngày hiệu lực button hiện dd/MM/yyyy
2. UF-HRM-04 insurance — AddInsurance base_salary + InsurancePolicy mức đóng: group typing; rates % không group
3. UF-HRM-12 job salary_min/max — JobPostings form group; headcount type=number vẫn plain
4. UF-HRM-06 payroll — tax settlement money fields group; dependents + year EXEMPT; SalesData money group, commission rate plain
5. Spot: Advance amount, Bonus fixed (not %), Business trip cost

## Exit
- evidence: docs/qa/evidence/qa-ux-vi-format-01-hrm-20260720.md
- mỗi UF: click path + Network numeric proof + FE sau 2xx + F5
- ack_status PASS_TO_PM hoặc FAIL với file:line
cấm: seed · PASS chỉ probe · stringify assert
```
