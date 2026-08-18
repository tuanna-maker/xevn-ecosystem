# D-UX-VI-FORMAT-HRM-DATE-02 — FE evidence (2026-07-20)

| Field | Value |
|-------|-------|
| **work_item_id** | `D-UX-VI-FORMAT-HRM-DATE-02` |
| **from_role** | dev-fe |
| **to_role** | qa |
| **ack_status** | **READY_FOR_QA** |
| **spec_ref** | `docs/program/UX_VI_DATE_NUMBER_FORMAT_AC.md` §BR-UX-DATE-02 |
| **shared SoT** | `@xevn/ui` `ViDateInput` via HRM wrapper `ViDateField` |

## Scope closed

1. **New wrapper** `ViDateField` — Input surface styles; `value`/`onValueChange` stay ISO `yyyy-MM-dd` for API (display `dd/MM/yyyy` while typing).
2. **High-traffic entry chrome migrated** from native `type="date"`:
   - Employee contracts (profile tab): signing / effective / expiry / probation end
   - Leave create dialog: start / end dates
   - Employee form: start_date, birth_date (react-hook-form)
   - Insurance employee tab: SI start/end + benefit start
   - Salary allowance effective date
   - Payroll: payment period date, summary date, tax/insurance participant effective dates
   - Payroll tabs: bonus policy effective/expiry; tax/insurance policy filters + add-participant; attendance sheet period
   - Rewards/discipline dialogs (reward date + discipline effective range)
   - Task form start/due dates
   - Employee profile satellites: training, assets, certificates, KPI period, work timeline
3. **Already Calendar (no change):** `pages/Contracts.tsx` list filters + form; `EmployeeCompensationPanel` effective date.
4. **API payloads:** unchanged — form state still ISO strings; no grouped date strings to Network.

## Files touched

| Path | Change |
|------|--------|
| `apps/web/hrm/src/components/ui/ViDateField.tsx` | **new** HRM wrapper |
| `apps/web/hrm/src/components/ui/__tests__/viDateField.test.ts` | **new** vitest (SoT round-trip) |
| `apps/web/hrm/src/components/employee/EmployeeContracts.tsx` | 4 date fields |
| `apps/web/hrm/src/components/attendance/LeaveTab.tsx` | create dialog dates |
| `apps/web/hrm/src/components/employee/EmployeeFormDialog.tsx` | start_date, birth_date |
| `apps/web/hrm/src/components/employee/EmployeeInsurance.tsx` | 3 date fields |
| `apps/web/hrm/src/components/employee/EmployeeSalary.tsx` | allowance effective |
| `apps/web/hrm/src/components/employee/EmployeeRewardsDiscipline.tsx` | 4 date fields |
| `apps/web/hrm/src/components/employee/EmployeeTraining.tsx` | start/end |
| `apps/web/hrm/src/components/employee/EmployeeAssets.tsx` | assigned/return |
| `apps/web/hrm/src/components/employee/EmployeeCertificates.tsx` | issue/expiry |
| `apps/web/hrm/src/components/employee/EmployeeKPI.tsx` | period start/end |
| `apps/web/hrm/src/components/employee/EmployeeWorkTimeline.tsx` | event date |
| `apps/web/hrm/src/components/payroll/BonusPolicyTab.tsx` | effective/expiry |
| `apps/web/hrm/src/components/payroll/InsurancePolicyTab.tsx` | filter + add effective |
| `apps/web/hrm/src/components/payroll/TaxPolicyTab.tsx` | filter + add effective |
| `apps/web/hrm/src/components/payroll/PayrollAttendanceTab.tsx` | sheet period |
| `apps/web/hrm/src/pages/Payroll.tsx` | 4 date fields + controlled state |
| `apps/web/hrm/src/components/tasks/TaskFormDialog.tsx` | start/due |

## Tests

```text
pnpm --filter vite_react_shadcn_ts exec vitest run \
  src/components/ui/__tests__/viDateField.test.ts \
  src/lib/formatDisplayDate.test.ts
→ 12 PASS (2 files)
```

## QA spot-check (browser-only · U65 no seed)

| UF / Journey | Persona | Click path | AC |
|--------------|---------|------------|-----|
| UF-HRM-03 | `ceo@xe.vn` | HRM → NV → Hợp đồng → Sửa → ngày ký/hiệu lực show **dd/MM/yyyy** → Lưu → Network PUT body `yyyy-MM-dd` → F5 |
| J-HRM-06 | `ceo@xe.vn` | Chấm công → Nghỉ phép → Tạo → nhập **dd/MM/yyyy** từ/đến → Gửi → POST ISO → F5 list |

## Residual (defer wave 3)

- `pages/Performance.tsx` cycle filter dates (2)
- `pages/InternalServices.tsx` meal/vehicle dates (2)
- `pages/PlatformAdmin.tsx` trial end (1)
- Mobile ESS parity separate (`D-UX-VI-FORMAT-MOB-*`)

## Cấm respected

- No seed · no Phase1/PROD claim · save payloads remain ISO · no ScopeBar remount
