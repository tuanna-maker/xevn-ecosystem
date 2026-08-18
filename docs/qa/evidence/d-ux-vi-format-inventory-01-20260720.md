# D-UX-VI-FORMAT-INVENTORY-01 — Number & date field inventory

| Field | Value |
|-------|-------|
| work_item_id | `D-UX-VI-FORMAT-INVENTORY-01` |
| date | 2026-07-20 |
| lane | execution (explore / inventory only) |
| scope | `apps/web/hrm/src`, `apps/web/web-portal/src`, `apps/mobile/hrm-mobile/src`, `packages/ui` |
| product code edited | **none** (inventory only) |
| sponsor UX lock | (1) dates always `dd/MM/yyyy` display + entry chrome; (2) money/qty auto thousand-group vi-VN (dot) while typing |

## Summary

| Surface | Editable `type=number` (approx) | Money/qty needing group | `type=date` native | Calendar/Popover already `dd/MM/yyyy` | Shared helper ready |
|---------|----------------------------------|-------------------------|--------------------|---------------------------------------|---------------------|
| HRM web | ~90+ user inputs (+ chart axes skip) | **~45 Y** | **~40+** | Many leave/contracts/decisions OK | `formatDisplayDate`, `formatHrmDateVi` (display only) |
| web-portal | ~15+ | **~5 Y** (credit/expense + metadata); charter/contributed **already grouped** | **~10+** | Few; mostly native `type=date` | `viNumberFormat.ts` (reference impl) |
| hrm-mobile | **0** money edit inputs found | N/A entry; display uses `formatHrmCurrency` | Calendar sheet via `HrmDateField` / `HrmDateRangeField` | **Yes** (`formatHrmDate` → `dd/MM/yyyy`) | `formatHrm.ts` |
| packages/ui | **0** number/date inputs | — | — | — | No format helpers |

**Key gap:** Almost all money/qty fields still use browser `type="number"` (no thousand dots while typing). Portal `charterCapital` + shareholder `contributedValue` are the **only** production typing-group reference (`formatViGroupedInteger` / `parseViGroupedInteger`). Native `type="date"` stores `yyyy-MM-dd` and chrome is OS/locale-dependent — **not** guaranteed `dd/MM/yyyy` entry UX.

---

## A. Number inputs

Legend — **needs_grouped**: Y = money/large qty (≥1000 typical); N = chart axis, % 0–100, page size, year, tiny counts, SLA hours, sort order.

### A1. HRM web — money / salary / qty (needs_grouped = Y)

| app | file:line | field purpose | current | needs_grouped | priority |
|-----|-----------|---------------|---------|---------------|----------|
| hrm | `components/employee/EmployeeFormDialog.tsx:991` | Employee base salary (finance tab) | `type=number` | Y | P0 |
| hrm | `components/employee/EmployeeCompensationPanel.tsx:288` | Compensation base amount (VNĐ) | `type=number` | Y | P0 |
| hrm | `components/employee/EmployeeCompensationPanel.tsx:308` | Probation salary amount | `type=number` | Y | P0 |
| hrm | `components/employee/EmployeeCompensationPanel.tsx:347` | Allowance line amount | `type=number` | Y | P0 |
| hrm | `components/employee/EmployeeSalary.tsx:338` | Allowance amount add/edit | `type=number` | Y | P0 |
| hrm | `components/insurance/AddInsuranceDialog.tsx:484` | Insurance base salary | `type=number` | Y | P0 |
| hrm | `components/payroll/InsurancePolicyTab.tsx:587` | Insurance contribution (VND) | `type=number` | Y | P0 |
| hrm | `components/payroll/AdvanceRequestsTab.tsx:509` | Advance amount per employee | `type=number` | Y | P0 |
| hrm | `components/payroll/BonusPolicyTab.tsx:803` | Bonus fixed amount | `type=number` | Y | P0 |
| hrm | `components/payroll/SalaryTemplateBuilder.tsx:942` | Component default value | `type=number` | Y | P0 |
| hrm | `components/payroll/SalaryTemplateBuilder.tsx:974` | Component min value | `type=number` | Y | P0 |
| hrm | `components/payroll/SalaryTemplateBuilder.tsx:985` | Component max value | `type=number` | Y | P0 |
| hrm | `components/payroll/SalesDataTab.tsx:842,969` | Sales target | `type=number` | Y | P0 |
| hrm | `components/payroll/SalesDataTab.tsx:850,977` | Actual sales | `type=number` | Y | P0 |
| hrm | `components/payroll/SalesDataTab.tsx:867,994` | Commission amount | `type=number` | Y | P0 |
| hrm | `components/payroll/SalesDataTab.tsx:875,1002` | Bonus amount | `type=number` | Y | P0 |
| hrm | `pages/Payroll.tsx:2161` | Tax settlement total taxable income | `type=number` | Y | P0 |
| hrm | `pages/Payroll.tsx:2182` | Family deduction | `type=number` | Y | P0 |
| hrm | `pages/Payroll.tsx:2190+` | BHTN / other tax money fields (cluster ~2190–2228) | `type=number` | Y | P0 |
| hrm | `pages/Payroll.tsx:3065` | Payroll money input (batch/form) | `type=number` | Y | P0 |
| hrm | `components/recruitment/HeadcountProposalTab.tsx:1212` | Salary budget min | `type=number` | Y | P0 |
| hrm | `components/recruitment/HeadcountProposalTab.tsx:1231` | Salary budget max | `type=number` | Y | P0 |
| hrm | `components/recruitment/JobPostingsTab.tsx:903` | Job salary_min | **raw text** `Input` (not type=number) | Y | P0 |
| hrm | `components/recruitment/JobPostingsTab.tsx:920` | Job salary_max | **raw text** `Input` | Y | P0 |
| hrm | `components/attendance/BusinessTripRequestTab.tsx:460` | Estimated trip cost | `type=number` | Y | P0 |
| hrm | `components/attendance/BusinessTripRequestTab.tsx:470` | Advance amount | `type=number` | Y | P0 |
| hrm | `components/employee/EmployeeInsurance.tsx:425` | Employee SI contribution | `type=number` | Y | P1 |
| hrm | `components/employee/EmployeeInsurance.tsx:429` | Employer contribution | `type=number` | Y | P1 |
| hrm | `components/employee/EmployeeInsurance.tsx:482` | Benefit value | `type=number` | Y | P1 |
| hrm | `components/employee/EmployeeRewardsDiscipline.tsx:504` | Reward amount | `type=number` | Y | P1 |
| hrm | `components/employee/EmployeeRewardsDiscipline.tsx:571` | Discipline penalty amount | `type=number` | Y | P1 |
| hrm | `components/employee/EmployeeAssets.tsx:469` | Asset value | `type=number` | Y | P1 |
| hrm | `components/employee/EmployeeTraining.tsx:602` | Training cost | `type=number` | Y | P1 |
| hrm | `components/employee/EmployeeKPI.tsx:470` | KPI target value (may be money/%) | `type=number` | Y* | P1 |
| hrm | `components/employee/EmployeeKPI.tsx:478` | KPI actual value | `type=number` | Y* | P1 |
| hrm | `pages/PlatformAdmin.tsx:985` | Plan price monthly | `type=number` | Y | P1 |
| hrm | `pages/PlatformAdmin.tsx:989` | Plan price yearly | `type=number` | Y | P1 |
| hrm | `components/recruitment/HeadcountProposalTab.tsx:1097` | Extra headcount qty | `type=number` | Y | P1 |
| hrm | `components/recruitment/CampaignFormDialog.tsx:430` | Campaign hire quantity | `type=number` | Y | P1 |
| hrm | `components/recruitment/JobPostingsTab.tsx:885` | Job headcount | `type=number` | Y | P1 |
| hrm | `pages/InternalServices.tsx:382` | Meal quantity | `type=number` | Y | P2 |
| hrm | `pages/InternalServices.tsx:446` | Supply item quantity | `type=number` | Y | P2 |
| hrm | `components/payroll/SalesDataTab.tsx:883–899,1010–1026` | Order/customer counts | `type=number` | Y (small ints OK skip if <1000) | P2 |

\*KPI: group only when unit is money/large absolute; skip if unit=`%`.

### A2. HRM web — skip / needs_grouped = N

| app | file:line | field purpose | current | needs_grouped | priority |
|-----|-----------|---------------|---------|---------------|----------|
| hrm | `pages/Payroll.tsx:1018` + report tabs | Chart `XAxis type="number"` | chart | N | — |
| hrm | `components/reports/*`, `Dashboard.tsx`, `RecruitmentBarChart.tsx`, `TaskDashboardView.tsx`, `ChatMessageRenderer.tsx`, `EmployeeJobProgressChart.tsx`, `AttendanceReportsTab.tsx` | Chart axes | chart | N | — |
| hrm | `pages/Payroll.tsx:1612` | Tax settlement **year** | `type=number` | N | — |
| hrm | `pages/Performance.tsx:171` | Score 0–100 | `type=number` | N | — |
| hrm | `components/recruitment/CandidateFormDialog.tsx:372` | Rating 0–5 | `type=number` | N | — |
| hrm | `components/recruitment/CandidateEvaluationDialog.tsx:698` | Criterion weight % | `type=number` | N | — |
| hrm | `components/recruitment/CandidateEvaluationDialog.tsx:732` | Score (tiny) | `type=number` | N | — |
| hrm | `components/payroll/BonusPolicyTab.tsx:814` | Bonus % rate | `type=number` | N | — |
| hrm | `components/payroll/SalesDataTab.tsx:858,985` | Commission rate | `type=number` | N | — |
| hrm | `components/insurance/AddInsuranceDialog.tsx:440,453,466` | SI/HI/UI rates % | `type=number` | N | — |
| hrm | `components/employee/EmployeeKPI.tsx:497` | Weight % | `type=number` | N | — |
| hrm | `components/employee/EmployeeTraining.tsx:527,579,589` | Duration / progress / score | `type=number` | N | — |
| hrm | `components/employee/EmployeeDegrees.tsx:434` | Graduation **year** | `type=number` | N | — |
| hrm | `components/employee/EmployeeContracts.tsx:864` | Probation period (days) | `type=number` | N | — |
| hrm | `pages/Attendance.tsx:1460–1468` | Standard work days/hours | `type=number` | N | — |
| hrm | `pages/Attendance.tsx:2757,2769` | Shift coefficient / hours | `type=number` | N | — |
| hrm | `pages/Attendance.tsx:2800,2805` | Grace minutes | `type=number` | N | — |
| hrm | `pages/Attendance.tsx:3366` | Leave days (0.5 step) | `type=number` | N | — |
| hrm | `pages/PlatformAdmin.tsx:965` | Sort order | `type=number` | N | — |
| hrm | `pages/PlatformAdmin.tsx:993` | Max employees (count) | `type=number` | N* | P2 optional |
| hrm | `components/company/CompanyManagement.tsx:620` | Employee count | `type=number` | N* | P2 optional |
| hrm | `components/recruitment/HeadcountProposalTab.tsx:1077` | Current headcount | `type=number` | N* | P2 optional |
| hrm | `pages/Recruitment.tsx:1476,1483` | Monthly headcount grid (ns/nv) | `type=number` | N* | P2 |
| hrm | `pages/InternalServices.tsx:415` | Vehicle passengers | `type=number` | N | — |

\*Counts can stay ungrouped unless UX wants dots for large orgs.

### A3. web-portal

| app | file:line | field purpose | current | needs_grouped | priority |
|-----|-----------|---------------|---------|---------------|----------|
| portal | `pages/command-center/CommandCenterPage.tsx:5052–5065` | Charter capital (VNĐ) | **text + `formatViGroupedInteger`** | Y — **DONE** | — |
| portal | `pages/command-center/CommandCenterPage.tsx:5359–5372` | Shareholder contributed value | **text + grouped** | Y — **DONE** | — |
| portal | `pages/command-center/CommandCenterPage.tsx:5350` | Shareholder ratio % | `type=number` | N | — |
| portal | `pages/settings/VendorsSettingsPage.tsx:601` | Credit limit (VNĐ) | `type=number` | Y | P0 |
| portal | `pages/settings/ExpenseCategoriesSettingsPage.tsx:514` | Max amount no approval (VNĐ) | `type=number` | Y | P0 |
| portal | `pages/settings/VendorsSettingsPage.tsx:615` | Discount % | `type=number` | N | — |
| portal | `pages/settings/KPIMetricsSettingsPage.tsx:461,475,489` | KPI target / warn / critical | `type=number` | Y* (if absolute) | P1 |
| portal | `pages/settings/VehicleTypesSettingsPage.tsx:674` | Payload (tấn) | `type=number` | N | — |
| portal | `pages/settings/VehicleTypesSettingsPage.tsx:689` | Fuel norm L/100km | `type=number` | N | — |
| portal | `pages/settings/VehicleTypesSettingsPage.tsx:743` | Maintenance interval km | `type=number` | Y | P1 |
| portal | `CommandCenterPage.tsx:5964,6108,6251,6340,10082` | Metadata custom `dataType=number` | `type=number` | Y if money defs | P1 |
| portal | `CommandCenterPage.tsx:7417,7617` | Workflow SLA hours | `type=number` | N | — |
| portal | `CommandCenterPage.tsx:7908,7989` | Org/RACI numeric cells | `type=number` | context | P2 |
| portal | `CommandCenterPage.tsx:8420` | Field definition order | `type=number` | N | — |
| portal | `pages/kpi/KPIDashboardPage.tsx:202` | Chart axis | chart | N | — |

### A4. hrm-mobile

| app | file:line | field purpose | current | needs_grouped | priority |
|-----|-----------|---------------|---------|---------------|----------|
| mobile | — | No editable money/qty `TextInput` with `decimal-pad`/`numeric` for salary found | display-only payslip via `formatHrmCurrency` | N (no entry) | — |
| mobile | `components/ui/FormField.tsx:23` | Supports `decimal-pad` / `numeric` | capability only | — | SHARED later |
| mobile | `utils/dynamicProfileForm.ts` | Profile fields — no money keyboard mapping today | text/phone/email | future | P2 |

### A5. packages/ui

No `type=number` / currency input components under `packages/ui/src`. Shared `ViGroupedNumberInput` should live in a shared FE package or be copied from portal helper first (wave SHARED).

---

## B. Date inputs / displays

### B1. Pattern taxonomy

| Pattern | Entry chrome | Display typically | Gap vs lock |
|---------|--------------|-------------------|-------------|
| `Input type="date"` / `<input type="date">` | Browser/OS native (often `mm/dd/yyyy` on en-US Windows) | value = `yyyy-MM-dd` | **GAP entry chrome** — replace with Calendar+Popover or masked `dd/MM/yyyy` |
| Calendar + Popover + `format(..., 'dd/MM/yyyy')` | Custom button shows dd/MM/yyyy | OK | **OK** (keep; unify helper) |
| `formatDisplayDate` / `formatHrmDateVi` / `toLocaleDateString('vi-VN')` | display-only | ≈ dd/MM/yyyy | **OK display**; prefer one helper |
| Mobile `HrmDateField` / `HrmDateRangeField` | sheet calendar; trigger shows `formatHrmDate` | `dd/MM/yyyy` | **OK** |
| Raw ISO in UI | — | `2026-07-20T…` | **GAP** if any remain |

### B2. HRM — native `type="date"` (entry gap)

| app | file | pattern | already dd/MM/yyyy? | gap |
|-----|------|---------|---------------------|-----|
| hrm | `components/employee/EmployeeFormDialog.tsx:681,798` | `type=date` birth/start | No (native) | Replace entry chrome |
| hrm | `components/employee/EmployeeCompensationPanel.tsx:269` | `type=date` effective | No | Replace |
| hrm | `components/employee/EmployeeSalary.tsx:342` | `type=date` allowance effective | No | Replace |
| hrm | `components/employee/EmployeeContracts.tsx:778,806,814,876` | `type=date` contract dates | No | Replace (page Contracts also has Popover OK) |
| hrm | `components/employee/EmployeeInsurance.tsx:415,419,492` | `type=date` | No | Replace |
| hrm | `components/employee/EmployeeAssets.tsx:428,436` | `type=date` | No | Replace |
| hrm | `components/employee/EmployeeCertificates.tsx:369,377` | `type=date` | No | Replace |
| hrm | `components/employee/EmployeeTraining.tsx:509,517` | `type=date` | No | Replace |
| hrm | `components/employee/EmployeeRewardsDiscipline.tsx:486,553,577,581` | `type=date` | No | Replace |
| hrm | `components/employee/EmployeeKPI.tsx:442,450` | `type=date` | No | Replace |
| hrm | `components/employee/EmployeeWorkTimeline.tsx:202` | `type=date` | No | Replace |
| hrm | `components/tasks/TaskFormDialog.tsx:133–134` | `type=date` | No | Replace |
| hrm | `components/attendance/LeaveTab.tsx:447,455` | `type=date` (+ also Calendar elsewhere) | Mixed | Align to Popover |
| hrm | `components/payroll/TaxPolicyTab.tsx:403,522` | `type=date` | No | Replace |
| hrm | `components/payroll/PayrollAttendanceTab.tsx:536,545` | `type=date` | No | Replace |
| hrm | `components/payroll/BonusPolicyTab.tsx:862,870` | `type=date` | No | Replace |
| hrm | `components/payroll/InsurancePolicyTab.tsx:450,579` | `type=date` | No | Replace |
| hrm | `pages/Payroll.tsx:3038,3203,4421,4601` | `type=date` | No | Replace |
| hrm | `pages/Performance.tsx:125,133` | `type=date` cycle | No | Replace |
| hrm | `pages/InternalServices.tsx:378,402` | `type=date` | No | Replace |
| hrm | `pages/PlatformAdmin.tsx:1252` | `type=date` trial end | No | Replace |

### B3. HRM — Calendar/Popover already `dd/MM/yyyy` (keep)

| app | file | pattern | already dd/MM/yyyy? | gap |
|-----|------|---------|---------------------|-----|
| hrm | `pages/Attendance.tsx` leave create/edit | Popover+Calendar | Yes | Optional shared DateField |
| hrm | `components/attendance/ShiftChangeRequestTab.tsx` | Popover+Calendar | Yes | — |
| hrm | `components/attendance/AttendanceUpdateRequestTab.tsx` | Popover+Calendar | Yes | — |
| hrm | `components/attendance/OvertimeRequestTab.tsx` | Popover+Calendar | Yes | — |
| hrm | `pages/Contracts.tsx` form + filters | Popover+Calendar | Yes | — |
| hrm | `pages/Decisions.tsx` | Popover+Calendar | Yes | — |
| hrm | `components/recruitment/JobPostingsTab.tsx` deadline | Popover+Calendar | Yes | — |
| hrm | `components/recruitment/CandidateFormDialog.tsx` | Popover+Calendar | Yes | — |
| hrm | `components/recruitment/CampaignFormDialog.tsx` | Popover+Calendar | Yes | — |
| hrm | `components/recruitment/ScheduleInterviewDialog.tsx` | Popover+Calendar | Yes | — |
| hrm | `components/recruitment/HeadcountProposalTab.tsx` | Popover+Calendar | Yes | — |
| hrm | `components/recruitment/RecruitmentReportsTab.tsx` | Popover+Calendar | Yes | — |
| hrm | `components/payroll/SalaryTemplateBuilder.tsx` | Popover+Calendar | Yes | — |
| hrm | `components/employee/EmployeeJobList.tsx` | Popover+Calendar | Yes | — |
| hrm | `components/attendance/LeaveTab.tsx` calendar select | Calendar | Yes display | — |

### B4. HRM — display helpers (mostly OK)

| app | file | pattern | already dd/MM/yyyy? | gap |
|-----|------|---------|---------------------|-----|
| hrm | `lib/formatDisplayDate.ts` | date-fns `dd/MM/yyyy` | Yes | Promote as SoT |
| hrm | `lib/formatHrmDate.ts` → `formatHrmDateVi` | `toLocaleDateString('vi-VN')` | Yes (locale) | Prefer explicit `dd/MM/yyyy` |
| hrm | Many list/export `format(..., 'dd/MM/yyyy')` | date-fns | Yes | — |
| hrm | `pages/Employees.tsx`, `AdvanceRequestsTab`, `PayrollBatchesTab`, etc. | `toLocaleDateString('vi-VN')` | Yes ≈ | Unify to `formatDisplayDate` |
| hrm | `pages/Attendance.tsx:413–414` | `toLocaleDateString('en-GB')` | dd/MM/yyyy via en-GB | Prefer vi helper |

### B5. web-portal dates

| app | file | pattern | already dd/MM/yyyy? | gap |
|-----|------|---------|---------------------|-----|
| portal | `CommandCenterPage.tsx:5106,5459,5467,5972,6073,6116,6259,6348,10090` | mostly `type=date` (+ Calendar icon decoration) | No entry | Replace with dd/MM/yyyy chrome |
| portal | `modules/hrm/formatJoinDate.ts` | `toLocaleDateString('vi-VN')` | Yes display | — |
| portal | `pages/hr/HRPage.tsx:173` | `toLocaleDateString('vi-VN')` | Yes display | — |

### B6. hrm-mobile dates

| app | file | pattern | already dd/MM/yyyy? | gap |
|-----|------|---------|---------------------|-----|
| mobile | `components/ui/HrmDateField.tsx` | custom calendar sheet; display `formatHrmDate` | **Yes** | Component exists but **no import consumers** found (orphan vs range field) |
| mobile | `components/ui/HrmDateRangeField.tsx` | range sheet; used by CreateLeave | **Yes** | Golden path |
| mobile | `features/attendance/CreateLeaveRequestScreen.tsx` | `HrmDateRangeField` | Yes | — |
| mobile | Lists/details via `formatHrmDate` / `formatHrmDateTime` | display | Yes | — |
| mobile | `components/home/DashboardDateBar.tsx` | `formatHrmDate` pill | Yes | — |

### B7. packages/ui

No date picker / format utilities.

---

## C. Existing helpers

### C1. `apps/web/web-portal/src/utils/viNumberFormat.ts`

- `formatViGroupedInteger(value)` — truncate; if `|n|>=1000` → `toLocaleString('vi-VN')` (dots); `<1000` raw digits; `0` → `''`.
- `parseViGroupedInteger(raw)` — strip non-digits → integer.
- Tests: `viNumberFormat.test.ts` (`1.000`, `500.000.000.000`).
- **In use:** Command Center charter capital + shareholder contributed value.
- **Recommendation:** extract to shared module (`packages/` or `apps/web/*/src/lib`) as SoT for SHARED wave; wrap in controlled `ViGroupedIntegerInput` (text + `inputMode=numeric`).

### C2. `apps/web/hrm/src/lib/formatDisplayDate.ts`

- Safe display `dd/MM/yyyy` (default); never throws on bad API values; preserves `MM/yyyy` period labels.
- Also `payslipPayDateLabel` / `formatPayrollPayDateCell`.
- **Display only** — does not provide entry chrome.

### C3. `apps/web/hrm/src/lib/formatHrmDate.ts`

- `parseHrmDateOnly` — timezone-safe date-only parse.
- `formatHrmDateVi` — `toLocaleDateString('vi-VN')`.
- Used by Insurance list, ExpiringContractsAlert, etc.

### C4. Mobile `HrmDateField` + `formatHrm.ts`

- `apps/mobile/hrm-mobile/src/utils/formatHrm.ts` — `formatHrmDate` → explicit `dd/MM/yyyy`; `formatHrmDateTime`; `formatHrmCurrency` (Intl vi-VN).
- `HrmDateField.tsx` — full calendar sheet; stores ISO `yyyy-MM-dd` via `toIsoDateOnly`.
- `HrmDateRangeField.tsx` — production leave create path.
- **Gap:** `HrmDateField` currently unused by features (only range field imported) — wire single-date screens or delete later.

### C5. Missing shared pieces

| Need | Status |
|------|--------|
| Shared `ViGroupedNumberInput` (web) | Missing — portal helper only |
| Shared `HrmDatePicker` replacing `type=date` | Missing — pattern exists in Attendance/Contracts |
| HRM import of `viNumberFormat` | Missing |
| Mobile grouped money **entry** | N/A until editable money fields appear |

---

## D. Recommended apply order (Top 20 money/salary/qty first)

Apply **SHARED helper first**, then patch these call sites:

| # | app | target | why |
|---|-----|--------|-----|
| 1 | SHARED | Promote `viNumberFormat` + `ViGroupedIntegerInput` | SoT for all FE |
| 2 | hrm | `EmployeeCompensationPanel` base / probation / allowance | Core salary UX |
| 3 | hrm | `EmployeeFormDialog` salary | Create/edit NV |
| 4 | hrm | `EmployeeSalary` allowance amount | Profile lương |
| 5 | hrm | `AddInsuranceDialog` base_salary | BH + lương |
| 6 | hrm | `InsurancePolicyTab` mức đóng | Payroll BH |
| 7 | hrm | `AdvanceRequestsTab` amount | Tạm ứng |
| 8 | hrm | `BonusPolicyTab` fixed amount | Thưởng |
| 9 | hrm | `SalaryTemplateBuilder` default/min/max | Template |
| 10 | hrm | `Payroll.tsx` tax settlement money cluster | Quyết toán |
| 11 | hrm | `SalesDataTab` target/actual/commission/bonus | Doanh số |
| 12 | hrm | `HeadcountProposalTab` budget min/max | Ngân sách TD |
| 13 | hrm | `JobPostingsTab` salary_min/max (text) | JD lương |
| 14 | hrm | `BusinessTripRequestTab` cost/advance | Công tác |
| 15 | portal | `VendorsSettingsPage` creditLimit | Công nợ |
| 16 | portal | `ExpenseCategoriesSettingsPage` maxAmountNoApproval | Chi phí |
| 17 | hrm | `EmployeeRewardsDiscipline` reward/penalty | Khen thưởng |
| 18 | hrm | `EmployeeAssets` value | Tài sản |
| 19 | hrm | `EmployeeTraining` cost | Đào tạo |
| 20 | hrm | `EmployeeInsurance` contributions | Hồ sơ BH |

**Parallel date wave (after or alongside SHARED DateField):** replace all `type=date` in §B2 with Popover+Calendar (reuse Attendance/Contracts pattern) + store ISO `yyyy-MM-dd`.

---

## Wave plan (FE)

```
SHARED  → extract ViGroupedIntegerInput + HrmDatePicker (from portal/HRM patterns)
HRM     → Top 20 + remaining Y money + type=date → DatePicker
PORTAL  → credit/expense/KPI money + remaining type=date (charter already OK)
MOBILE  → confirm display OK; wire HrmDateField if single-date edit appears; FormField decimal grouping if money edit added
```

---

## completion_report

| Item | Result |
|------|--------|
| Number inputs inventoried | HRM ~90+ (`type=number` + 2 raw salary text); portal ~15+; mobile 0 money entry; packages/ui 0 |
| Date inputs inventoried | HRM ~40+ native `type=date` **gap**; many Calendar/Popover already `dd/MM/yyyy`; portal Command Center mostly `type=date` gap; mobile leave path OK |
| Helpers documented | `viNumberFormat`, `formatDisplayDate`, `formatHrmDate`, mobile `HrmDateField`/`formatHrm` |
| Top 20 apply order | §D |
| Product code changed | **none** |
| Residual | Metadata-driven portal number fields need runtime money detection; KPI unit-dependent grouping |

## next_dispatch_prompt

```text
work_item_id: D-UX-VI-FORMAT-SHARED-01
from_role: pm
to_role: dev-fe
lane: execution
priority: P0

## Goal
Create shared vi-VN format primitives for sponsor UX lock (inventory: docs/qa/evidence/d-ux-vi-format-inventory-01-20260720.md).

## Scope
1. Extract/promote `formatViGroupedInteger` + `parseViGroupedInteger` from
   apps/web/web-portal/src/utils/viNumberFormat.ts into a shared importable module
   (prefer packages/* or agreed web shared path usable by hrm + portal).
2. Add controlled `ViGroupedIntegerInput` (type=text, inputMode=numeric, tabular-nums)
   wrapping format/parse while typing — parity with CommandCenter charterCapital.
3. Add `HrmDatePicker` (Popover + Calendar) displaying dd/MM/yyyy, emitting yyyy-MM-dd —
   mirror Attendance leave / Contracts form pattern; do NOT use native type=date.
4. Unit tests for format/parse + input round-trip.

## Out of scope this wave
Do not mass-replace all call sites yet — only SHARED components + tests.
Next waves: D-UX-VI-FORMAT-HRM-01 (Top 20 §D), D-UX-VI-FORMAT-PORTAL-01, D-UX-VI-FORMAT-MOBILE-01.

## Exit
READY_FOR_QA — evidence path + list of exported APIs.
cấm: seed; do not regress portal charterCapital grouping already live.
```

### Follow-on prompts (after SHARED PASS)

1. **`D-UX-VI-FORMAT-HRM-01`** — Apply Top 20 §D + batch-replace `type=date` in §B2 with `HrmDatePicker`.
2. **`D-UX-VI-FORMAT-PORTAL-01`** — Vendors creditLimit, Expense maxAmount, KPI thresholds if absolute, metadata number when money; replace Command Center `type=date`.
3. **`D-UX-VI-FORMAT-MOBILE-01`** — Audit editable money; reuse `formatHrmCurrency` patterns; wire `HrmDateField` for single-date edits if any.

## ack_status

**PASS_TO_PM**
