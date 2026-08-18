# D-UX-VI-FORMAT-SHARED-01 — FE evidence (2026-07-20)

**work_item_id:** `D-UX-VI-FORMAT-SHARED-01`  
**role:** dev-fe  
**ack_status:** `READY_FOR_QA`  
**spec_ref:** sponsor chat 2026-07-20 VI date+number format project-wide  

## Scope closed

1. **SoT** lifted to `@xevn/ui` (`packages/ui`):
   - `formatViGroupedInteger` / `parseViGroupedInteger`
   - `formatViGroupedDecimal` / `parseViGroupedDecimal` (optional rates — see decision)
   - `formatDisplayDate` + `VI_DATE_DISPLAY_PATTERN` (`dd/MM/yyyy`) / `VI_DATETIME_DISPLAY_PATTERN`
   - `ViGroupedIntegerInput` (text + `inputMode=numeric` → `onValueChange: number`)
2. **Dual export** (existing import paths kept):
   - Portal: `apps/web/web-portal/src/utils/viNumberFormat.ts` → re-export `@xevn/ui`
   - Portal: `apps/web/web-portal/src/modules/hrm/formatJoinDate.ts` → `formatDisplayDate` SoT
   - HRM: `apps/web/hrm/src/lib/viNumberFormat.ts` → re-export
   - HRM: `apps/web/hrm/src/lib/formatDisplayDate.ts` → re-export SoT + local payroll helpers
3. **HRM Vite alias:** `@xevn/ui` → `packages/ui/src` (parity with portal)
4. **CommandCenter must_keep:** charter capital still format/parse; contributedValue migrated to `ViGroupedIntegerInput` (numeric store unchanged)

## Decimal decision

| Use case | Helper |
|----------|--------|
| VND / quantity whole amounts | `formatViGroupedInteger` + `ViGroupedIntegerInput` |
| Rates / money with minor units (1.234,56) | `formatViGroupedDecimal` / `parseViGroupedDecimal` |
| Ratio % (0–100) | keep plain `type="number"` until product asks otherwise |

**Do not** change API payloads to strings — always submit `number`.

## Usage (copy for migration waves)

```tsx
import {
  ViGroupedIntegerInput,
  formatViGroupedInteger,
  parseViGroupedInteger,
  formatDisplayDate,
  VI_DATE_DISPLAY_PATTERN,
} from '@xevn/ui';
// or HRM dual: '@/lib/viNumberFormat' / '@/lib/formatDisplayDate'

<ViGroupedIntegerInput
  value={amount}
  onValueChange={setAmount}
  className="…"
/>

// Display only
formatDisplayDate(isoOrApiDate); // → dd/MM/yyyy
formatDisplayDate(stamp, 'dd/MM/yyyy HH:mm'); // time only when needed
```

## Date fill UX note

Native `<input type="date">` **cannot** reliably render `dd/MM/yyyy` in all browsers (browser-local chrome). Prefer existing HRM **Calendar + Popover** pattern for fill; use `formatDisplayDate` for labels/tables.

### Files still on `type="date"` (follow-up waves)

**HRM**

- `apps/web/hrm/src/pages/Performance.tsx`
- `apps/web/hrm/src/pages/Payroll.tsx`
- `apps/web/hrm/src/pages/InternalServices.tsx`
- `apps/web/hrm/src/pages/PlatformAdmin.tsx`
- `apps/web/hrm/src/components/employee/EmployeeSalary.tsx`
- `apps/web/hrm/src/components/employee/EmployeeContracts.tsx`
- `apps/web/hrm/src/components/employee/EmployeeCompensationPanel.tsx`
- `apps/web/hrm/src/components/employee/EmployeeFormDialog.tsx`
- `apps/web/hrm/src/components/employee/EmployeeCertificates.tsx`
- `apps/web/hrm/src/components/employee/EmployeeWorkTimeline.tsx`
- `apps/web/hrm/src/components/employee/EmployeeKPI.tsx`
- `apps/web/hrm/src/components/employee/EmployeeInsurance.tsx`
- `apps/web/hrm/src/components/employee/EmployeeTraining.tsx`
- `apps/web/hrm/src/components/employee/EmployeeRewardsDiscipline.tsx`
- `apps/web/hrm/src/components/employee/EmployeeAssets.tsx`
- `apps/web/hrm/src/components/attendance/LeaveTab.tsx`
- `apps/web/hrm/src/components/tasks/TaskFormDialog.tsx`
- `apps/web/hrm/src/components/payroll/TaxPolicyTab.tsx`
- `apps/web/hrm/src/components/payroll/PayrollAttendanceTab.tsx`
- `apps/web/hrm/src/components/payroll/InsurancePolicyTab.tsx`
- `apps/web/hrm/src/components/payroll/BonusPolicyTab.tsx`

**Portal**

- `apps/web/web-portal/src/pages/command-center/CommandCenterPage.tsx` (company / shareholder / dept metadata dates)

### Calendar/Popover pattern already used (prefer for fill)

Examples: `RecruitmentReportsTab`, `JobPostingsTab`, `ShiftChangeRequestTab`, `AddInsuranceDialog`, `CandidateFormDialog`, `CampaignFormDialog`, `ScheduleInterviewDialog`, leave/OT request tabs, `Contracts.tsx`, etc. (`from '@/components/ui/calendar'`).

## Tests

```text
pnpm --filter web-portal test -- src/utils/viNumberFormat.test.ts
→ 6 PASS

pnpm --filter vite_react_shadcn_ts exec vitest run src/lib/formatDisplayDate.test.ts src/lib/viNumberFormat.test.ts
→ 10 PASS (8 formatDisplayDate + 2 dual-export)
```

## Residual / out of scope this wave

- Full inventory migration of `type="number"` → `ViGroupedIntegerInput` → **D-UX-VI-FORMAT-HRM-01** / **D-UX-VI-FORMAT-PORTAL-01**
- Mobile metro alias for `@xevn/ui` utils (pure helpers ready; no RN input this wave)
- Replacing every `type="date"` with Calendar (listed above)

## Cấm respected

- No seed · no Phase1/PROD claim · no API payload string change · no business-logic rewrite
