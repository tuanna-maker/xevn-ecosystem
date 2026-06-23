# PCOMP-W4-FE-SPEC-01 — Mobile iOS UX parity spec (Dev-FE)

**work_item_id:** `PCOMP-W4-FE-SPEC-01`  
**Date:** 2026-06-07  
**Owner:** Dev-FE  
**ack_status:** `PASS_TO_PM`  
**Artifact updated:** `docs/program/MOBILE_IOS_UX_INHERITANCE_PLAN.md` §2B + §2B.1

---

## Scope closed

Parity appendix for three Wave-3 modules with concrete web paths, Tailwind breakpoints, mobile RN targets, and shared formatter/field contracts:

1. **LeaveTab** — list, detail, create, approval, filters  
2. **Attendance** — overview/check-in/records responsive breakpoints  
3. **Payslip** — API tab list/detail + mobile period→payslip journey

No product code changed; documentation-only deliverable for `PCOMP-W4-MOB-UX-01` / `PCOMP-W4-MOB-UX-02` consumption.

---

## Method

- Read web HRM: `LeaveTab.tsx`, `Attendance.tsx`, `CheckInOutWidget.tsx`, `AttendanceRecordsTable.tsx`, `PayrollPayslipsApiTab.tsx`, `Payroll.tsx`, `formatHrmDate.ts`, `StatusBadge.tsx`
- Read mobile: `LeaveRequestsListScreen`, `LeaveRequestDetailScreen`, `CreateLeaveRequestScreen`, `ManagerApprovalsScreen`, `CheckInScreen`, `AttendanceHistoryScreen`, `PayrollSummaryScreen`, `PayslipListScreen`, `PayslipDetailScreen`, `payrollPayslips.ts`
- Mapped responsive classes (`sm:`, `md:`, `lg:`) to RN screen equivalents and listed display gaps (raw ISO dates, raw `leave_type` codes)

---

## Key findings (P0 for Dev-Mobile UX-01)

| Gap | Web behavior | Mobile today | Shared fix |
|-----|--------------|--------------|------------|
| Dates | `format(parseISO, 'dd/MM/yyyy')` / `formatHrmDateVi` | Raw ISO in list + detail | Extract `formatHrm.ts` from `apps/web/hrm/src/lib/formatHrmDate.ts` |
| Leave type | `leaveTypeLabels` L90–110 | Raw `leave_type` / `LVT_*` | `leaveTypes.ts` + `resolveLeaveTypeLabel` |
| Seed reason | human-readable / hidden | `seed:p1-hrm-...` visible | `sanitizeSeedDisplay` |
| Payslip currency | `Intl` VND | `toLocaleString` + currency suffix | unify `formatHrmCurrency` / `parseAmount` |
| Leave detail layout | hero + 2×2 grid + note blocks | flat `DetailRow` cards | `LeaveHeroCard`, `DetailMetricGrid`, `DetailNoteBlock` |

---

## Parity matrix (summary)

Full table in `MOBILE_IOS_UX_INHERITANCE_PLAN.md` §2B. Representative rows:

| Web | Responsive | Mobile RN | Formatters |
|-----|------------|-----------|------------|
| `LeaveTab.tsx` detail L829–910 | `sm:max-w-[600px]` | `LeaveRequestDetailScreen` → `LeaveHeroCard` | `leaveTypeLabels`, `formatHrmDate`, `formatHrmDateTime`, `StatusBadge` |
| `LeaveTab.tsx` list L534–644 | `sm:flex-row` filters | `LeaveRequestsListScreen` | `formatHrmDateRange`, `resolveLeaveTypeLabel` |
| `Attendance.tsx` L2138 + `CheckInOutWidget` | `lg:grid-cols-2` | `CheckInScreen` | `formatHrmDateTime` for check-in |
| `AttendanceRecordsTable.tsx` L177 | `grid-cols-2 md:grid-cols-5` | `AttendanceHistoryScreen` | `formatHrmDateVi`, time `HH:mm` |
| `PayrollPayslipsApiTab.tsx` | `p-4 md:p-6`, `sm:w-72` | `PayslipListScreen` / `PayslipDetailScreen` | `formatCurrency` / `parseAmount` |

---

## DOM structure refs (no screenshots)

**Leave detail (web @md):**

```text
Dialog[sm:max-w-600px]
  └─ div.space-y-6
       ├─ div.flex.gap-4.p-4.bg-muted/50        ← hero (avatar, name, StatusBadge)
       ├─ div.grid.grid-cols-2.gap-4            ← type badge, days, from, to
       ├─ div > p.p-3.bg-muted/50.rounded-lg    ← reason
       └─ div.text-xs.border-t                   ← created_at / approved_at
```

**Attendance check-in (@sm stacked):**

```text
div.grid.grid-cols-1.lg:grid-cols-2
  ├─ CheckInOutWidget (Card: clock HH:mm:ss, date EEEE dd/MM/yyyy)
  └─ guide Card
div.mt-6 > AttendanceRecordsTable
  └─ div.grid.grid-cols-2.md:grid-cols-5       ← summary tiles
```

**Payslip list (@sm):**

```text
div.p-4.md:p-6
  ├─ div.flex-col.sm:flex-row                  ← title + search sm:w-72
  └─ Card > Table (code, name, period, net, status, eye)
Dialog[max-w-lg]                               ← gross / deduction / net + StatusBadge
```

---

## Residual (not in this spec wave)

- `EmployeeSalary.tsx` embed payslip (employee profile web-only; mobile uses self-service stack)
- Calendar tab in `LeaveTab` (no mobile calendar parity in W4)
- Attendance overview stat cards (manager dashboard; mobile history list only)
- Package `packages/hrm-display` — Phase 2 per plan Lớp A

---

## Verification

- [x] `MOBILE_IOS_UX_INHERITANCE_PLAN.md` §2B paths populated
- [x] §2B.1 appendix with Leave / Attendance / Payslip subsections
- [x] Formatter sources cited with file + line refs
- [x] Mobile gap column documents current drift for UX-01/02

---

## Handoff

- **next_owner:** `dev-mobile` (`PCOMP-W4-MOB-UX-01` foundation)
- **pm_dispatch_hint:** UX-01 must land `formatHrm.ts`, `leaveTypes.ts`, `sanitizeSeedDisplay` before UX-02 Leave redesign
