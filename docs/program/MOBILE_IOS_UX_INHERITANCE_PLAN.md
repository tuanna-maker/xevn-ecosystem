# Mobile iOS UX — kế thừa HRM web responsive + chuẩn iOS

**work_item_id:** `PCOMP-W4-MOB-UX-PROGRAM`  
**Ngày:** 2026-06-07  
**Owner:** PM → Dev-FE (parity spec) + Dev-Mobile (implementation) + QA-Device (evidence)  
**Trigger:** Sponsor — giao diện mobile «rất xấu»; web HRM đã responsive → tái sử dụng pattern rồi tinh chỉnh iOS.  
**Benchmark top HRM:** `docs/program/MOBILE_HRM_BENCHMARK_TOP_APPS.md` (Workday, SAP SF, BambooHR, Personio).

---

## 1) Hiện trạng (evidence)

| Vấn đề | Nguyên nhân kỹ thuật | Web HRM đã có |
|--------|----------------------|---------------|
| Tab bar icon ô vuông X | `RootNavigator` **không** set `tabBarIcon`; thiếu `@expo/vector-icons` | Portal dùng Lucide/shadcn icon set |
| Ngày ISO `2026-08-08T00:00:00.000Z` | Mobile render raw API string; **không** qua formatter | `LeaveTab.tsx`: `format(parseISO(...), 'dd/MM/yyyy')` |
| Mã loại nghỉ `LVT_01` | Mobile hiển thị `leave_type` code; web map `leaveTypeLabels` | `leaveTypeLabels` + màu badge trong `LeaveTab.tsx` |
| Lý do `seed:p1-hrm-...` | Seed UAT hiển thị thẳng; web có copy human-readable | BA copy + sanitize display layer |
| Layout phẳng, thiếu hierarchy | `DetailRow` label/value tối giản; không hero card / grouped sections | Detail dialog: avatar row, grid 2 cột, reason block `bg-muted/50` |
| Dark theme không nhất quán | Tokens light (`#F9FAFB`) nhưng build/emulator có thể system dark | Web HRM light + semantic tokens |

**Reference mobile:** `apps/mobile/hrm-mobile/src/features/attendance/LeaveRequestDetailScreen.tsx`  
**Reference web:** `apps/web/hrm/src/components/attendance/LeaveTab.tsx` (detail modal ~L818+)  
**Design tokens mobile:** `apps/mobile/hrm-mobile/src/theme/tokens.ts` (mirror web-portal tailwind xevn.*)

---

## 2) Chiến lược 3 lớp

```text
[Lớp A] Shared display contract  ←── extract từ web HRM (labels, formatters, status tone)
[Lớp B] Component parity map     ←── map shadcn/responsive → RN primitives
[Lớp C] iOS HIG polish           ←── grouped lists, large titles, SF typography, haptics
```

**Không** WebView full embed (mất native nav, offline, push). **Có** chia sẻ logic hiển thị + copy layout từ responsive web.

### Lớp A — Shared display contract (Dev-FE lead spec, Dev-Mobile consume)

| Artifact | Nguồn web | Mobile target |
|----------|-----------|---------------|
| `formatHrmDate(iso) → dd/MM/yyyy` | date-fns trong LeaveTab | `apps/mobile/hrm-mobile/src/utils/formatHrm.ts` |
| `formatHrmDateTime(iso) → dd/MM/yyyy HH:mm` | Attendance pages | cùng module |
| `leaveTypeLabels` / colors | LeaveTab L90–110 | `src/i18n/leaveTypes.ts` hoặc shared package |
| `statusLabel` / `StatusBadge` semantics | web StatusBadge | đã có `StatusBadge.tsx` — align copy vi |
| `sanitizeSeedDisplay(text)` | — | ẩn prefix `seed:` → «Dữ liệu mẫu UAT» hoặc «—» |

**Khuyến nghị dài hạn:** package `packages/hrm-display` (formatters + catalogs, zero React) — Phase 2 nếu web/mobile drift.

### Lớp B — Component parity map (Dev-FE document, Dev-Mobile implement)

> **PCOMP-W4-FE-SPEC-01** (2026-06-07) — bảng dưới có path cụ thể; chi tiết field/formatter xem **§2B.1**.

| Web file + DOM block | Responsive (`@sm`/`@md`/`@lg`) | Mobile RN target | Shared fields / formatters |
|----------------------|----------------------------------|------------------|----------------------------|
| `apps/web/hrm/src/components/attendance/LeaveTab.tsx` — detail `Dialog` hero `div.flex.items-center.gap-4.p-4.bg-muted/50` (L829–840) | `DialogContent sm:max-w-[600px]`; hero full-width @phone | `apps/mobile/hrm-mobile/src/features/attendance/LeaveRequestDetailScreen.tsx` → **`LeaveHeroCard`** (new) | `employee_name`, `employee_code`, `department`; `StatusBadge` ↔ `apps/web/hrm/src/components/common/StatusBadge.tsx` |
| `LeaveTab.tsx` — metric grid `div.grid.grid-cols-2.gap-4` (L842–868) | 2-col trong dialog @all; approval card `sm:grid-cols-4` (L713) | **`DetailMetricGrid`** inside `SurfaceCard` | `leave_type` → `leaveTypeLabels` (L90–110); `total_days`; `start_date`/`end_date` → `format(parseISO, 'dd/MM/yyyy')` |
| `LeaveTab.tsx` — reason `p-3.bg-muted/50.rounded-lg` (L874); reject `bg-red-50` (L896) | muted block full-width | **`DetailNoteBlock`** on `SurfaceCard title="Nội dung"` | `reason`, `rejected_reason` → `sanitizeSeedDisplay()` |
| `LeaveTab.tsx` — list table `saas-table` + filters `flex-col sm:flex-row` (L534–644) | `overflow-x-auto` table @sm; filters stack→row @sm | `LeaveRequestsListScreen.tsx` + `ListRow` | subtitle: `resolveLeaveTypeLabel` + `formatHrmDateRange`; status → `statusLabel` / `StatusBadge` |
| `LeaveTab.tsx` — filter `Select` status/type (L537–560) | `w-[150px]` triggers | `LeaveRequestsListScreen` chip row (`styles.chips`) | filter keys: `all`/`pending`/`approved`/`rejected` |
| `LeaveTab.tsx` — create dialog (L268 `sm:max-w-[500px]`) | single-col form | `CreateLeaveRequestScreen.tsx` + `FormField` | `leaveType`, `startDate`, `endDate`, `reason`, `handoverTo`, `handoverTasks` |
| `LeaveTab.tsx` — approval pending cards (L666–738) | `flex-col sm:flex-row` header; `grid-cols-2 sm:grid-cols-4` metrics | `ManagerApprovalsScreen.tsx` + `ListRow` | same labels/dates as detail; approve/reject actions |
| `apps/web/hrm/src/pages/Attendance.tsx` — overview stats `grid-cols-2 md:grid-cols-3` (L744) | 2-col phone, 3-col @md | `AttendanceHistoryScreen` list-only (no stat cards yet) | overview uses `useAttendanceOverview`; mobile uses `/attendance/records` 14-day window |
| `Attendance.tsx` — tab bar `hidden sm:inline` labels (L2561+) | icon-only @&lt;sm, label @sm+ | `RootNavigator` bottom tabs + `@expo/vector-icons` | tab ids: home / time / payroll / more |
| `Attendance.tsx` + `CheckInOutWidget.tsx` — check-in layout `grid-cols-1 lg:grid-cols-2` (L2138) | stacked @phone, 2-col @lg | `CheckInScreen.tsx` scroll form | `attendance_date` ISO date; `check_in_at` ISO datetime; GPS `latitude`/`longitude` |
| `AttendanceRecordsTable.tsx` — summary `grid-cols-2 md:grid-cols-5` (L177); date `dd/MM/yyyy` (L136) | 2 stat tiles phone, 5 @md | `AttendanceHistoryScreen.tsx` `ListRow` | `attendance_date` → `formatHrmDateVi`; `check_in_at` → `formatHrmDateTime`; `status` badge |
| `apps/web/hrm/src/components/payroll/PayrollPayslipsApiTab.tsx` — shell `p-4 md:p-6`, search `w-full sm:w-72` (L64–90) | header stack @phone, row @sm | `PayrollSummaryScreen.tsx` → `PayslipListScreen.tsx` | period list → payslip list by `period_id` |
| `PayrollPayslipsApiTab.tsx` — table + detail `Dialog max-w-lg` (L92–166) | horizontal scroll implicit; dialog full-width @phone | `PayslipDetailScreen.tsx` + `SurfaceCard` | `employee_code`, `employee_name`, `period_label`, `gross_amount`, `deduction_amount`, `net_amount`, `status` |
| `apps/web/hrm/src/pages/Payroll.tsx` — payslip route `PayrollPayslipsApiTab` when live API (L2758) | `mobile-scroll-tabs px-2 md:px-4` (L2803) | `PayrollSummaryScreen` / `PayslipListScreen` / `PayslipDetailScreen` stack | `formatCurrency` (`Intl vi-VN VND`) ↔ mobile `formatAmount` (`toLocaleString('vi-VN')`) |
| `apps/web/hrm/src/components/employee/EmployeeSalary.tsx` — embed payslip table (employee profile) | profile tab responsive grids | *(out of mobile wave-3 scope)* | same `HrmPayslipRow` contract via `listPayrollPayslips` |
| Portal bottom / HRM embed tabs | shadcn `Tabs` + Lucide | `RootNavigator.tsx` tab bar | Ionicons outline/filled active state |

#### §2B.1 — Parity appendix (PCOMP-W4-FE-SPEC-01)

**Evidence:** `docs/qa/evidence/pcomp-w4-fe-spec-01-20260607.md`

##### LeaveTab — web DOM → mobile

| Block | Web selector / structure | Breakpoint behavior | Mobile file | Gap (mobile today) |
|-------|--------------------------|---------------------|-------------|-------------------|
| List row | `LeaveTab` requests table `tbody tr` or calendar side card `div.p-3.bg-muted/50` | table scroll @phone; calendar `lg:col-span-2` + side `Card` | `LeaveRequestsListScreen.tsx` L134–140 | `title={leave_type}` raw code; subtitle ISO dates |
| Detail hero | `Dialog` → `div.flex` avatar `w-12 h-12 rounded-full` + name + `StatusBadge` | `sm:max-w-[600px]` centered modal | `LeaveRequestDetailScreen.tsx` | no hero; title uses raw `leave_type` |
| Metrics | `grid grid-cols-2` type badge + days + from/to | fixed 2-col in modal | `SurfaceCard` + `DetailRow` | dates raw ISO; no type label map |
| Timestamps | footer `text-xs` `created_at` / `approved_at` `dd/MM/yyyy HH:mm` | full width | `DetailRow` `requested_at` / `reviewed_at` | raw ISO strings |
| Filters | dual `Select` 150px | `sm:flex-row` toolbar | chip `Pressable` row | aligned semantics, needs iOS inset style |

**Shared extract (Lớp A):**

| Formatter / catalog | Web source | Mobile target (UX-01) |
|---------------------|------------|----------------------|
| `formatHrmDateVi` / `parseHrmDateOnly` | `apps/web/hrm/src/lib/formatHrmDate.ts` | `apps/mobile/hrm-mobile/src/utils/formatHrm.ts` |
| `format(parseISO, 'dd/MM/yyyy HH:mm')` | `LeaveTab.tsx` L903–906 | `formatHrmDateTime()` same module |
| `leaveTypeLabels` + `leaveTypeColors` | `LeaveTab.tsx` L90–110 | `apps/mobile/hrm-mobile/src/i18n/leaveTypes.ts` + `resolveLeaveTypeLabel(code)` incl. `LVT_*` |
| `StatusBadge` copy | `apps/web/hrm/src/components/common/StatusBadge.tsx` | `apps/mobile/hrm-mobile/src/components/ui/StatusBadge.tsx` + `mapApiError.statusLabel` |
| `sanitizeSeedDisplay` | *(web BA copy — planned)* | hide `seed:` prefix on `reason` / `rejected_reason` |

##### Attendance — mobile breakpoints

| Web surface | File | Key responsive classes | Mobile equivalent | Fields |
|-------------|------|------------------------|-------------------|--------|
| Overview dashboard | `Attendance.tsx` L713–791 | `p-3 md:p-6`, `grid-cols-2 md:grid-cols-3`, `text-2xl md:text-4xl` | — (manager web-only) | `lateEarlyToday`, `actualLeaveThisWeek`, `plannedLeaveNextWeek` |
| Module tab strip | `Attendance.tsx` L2517–2667 | `px-2 md:px-6`, `hidden sm:inline` labels, `touch-target` | `CheckInScreen` + `AttendanceHistoryScreen` stack | — |
| Check-in widget | `CheckInOutWidget.tsx` | parent `grid-cols-1 lg:grid-cols-2` | `CheckInScreen.tsx` | clock `format(..., 'HH:mm:ss')`, date `EEEE, dd/MM/yyyy` |
| Records + filters | `AttendanceRecordsTable.tsx` L121–198 | `grid-cols-2 md:grid-cols-5` summary; `flex-wrap` filters | `AttendanceHistoryScreen.tsx` L95–105 | `attendance_date`, `check_in_at`, `status` |
| History list row | table `TableRow` with check-in/out cells | table horizontal scroll | `ListRow` `title={attendance_date}` subtitle `Giờ vào: HH:mm` | mobile: partial time format only; date still ISO |

##### Payslip — list / detail

| Block | Web | Responsive | Mobile | Shared |
|-------|-----|------------|--------|--------|
| Period picker | `Payroll.tsx` overview cards `md:col-span-*` | `grid-cols-1 md:grid-cols-12` | `PayrollSummaryScreen.tsx` `ListRow` → `PayslipList` | `period_label`, `start_date`, `end_date`, `status` |
| Payslip list | `PayrollPayslipsApiTab.tsx` `Table` | `flex-col sm:flex-row` header; `sm:w-72` search | `PayslipListScreen.tsx` `ListRow` | `period_label`, `net_amount`, `status` |
| Payslip detail dialog | `Dialog max-w-lg` summary lines | full-width modal @phone | `PayslipDetailScreen.tsx` `SurfaceCard` sections | `gross_amount`, `deduction_amount`, `net_amount` |
| Currency | `formatCurrency` = `Intl.NumberFormat('vi-VN',{currency:'VND'})` L26–27 | — | `formatAmount` `toLocaleString('vi-VN')` + `currency` field | align on `parseAmount` + VND default |
| API contract | `usePayrollPayslips` → `HrmPayslipRow` (`hrmApi.ts` L448–458) | — | `payrollPayslips.ts` `PayslipListRow` | mobile adds `currency`; amounts `number` vs web `string` — normalize in shared helper |
| Query | `buildPayrollPayslipsQuery(companyId, periodId?)` | — | `buildEmployeePayslipQuery(companyId, employeeId)` | mobile scopes `employee_id` for self-service |

**Screenshot refs (optional — DOM only):**

- Leave detail @md: `Dialog` > `space-y-6` > hero `bg-muted/50` + 2×2 grid + reason `rounded-lg` + footer timestamps.
- Attendance @sm: overview 2-column stat cards; check-in page single column widget above full-width `AttendanceRecordsTable`.
- Payslip @sm: stacked title/search; table 6 columns; detail dialog 4 amount lines + `StatusBadge`.

### Lớp C — iOS Human Interface Guidelines

| HIG pattern | Implementation |
|-------------|----------------|
| **Grouped inset lists** | `InsetGroupedSection` — white card on `#F2F2F7` bg (iOS system grouped) |
| **Large titles** | `@react-navigation/native-stack` `headerLargeTitle: true` trên stack chính |
| **Tab bar** | 4 tab: SF Symbol equivalent via `@expo/vector-icons/Ionicons` |
| **Typography** | `Platform.select({ ios: 'System', android: 'Roboto' })`; Dynamic Type Phase 3 |
| **Touch targets** | min 44×44 pt — chips, list rows |
| **Status bar** | `expo-status-bar` style theo light theme |
| **Safe area** | `SafeAreaProvider` + padding on scroll content |

**Tham chiếu:** [Apple HIG — Layout](https://developer.apple.com/design/human-interface-guidelines/layout), [Lists and tables](https://developer.apple.com/design/human-interface-guidelines/lists-and-tables).

---

## 3) Wave execution

### Wave 1 — P0 foundation (`PCOMP-W4-MOB-UX-01`) — 2–3 ngày

1. Add `@expo/vector-icons`; wire `tabBarIcon` (home, time, document-text, menu).
2. `formatHrm.ts` + unit tests; apply to **all** detail/list screens (leave, update, payslip, history).
3. `leaveTypeLabels` + `resolveLeaveTypeLabel(code)` — map LVT_* / annual / sick.
4. `sanitizeSeedDisplay` for reason fields.
5. Enforce light theme tokens; iOS grouped background `#F2F2F7`.
6. Evidence: screenshot before/after + `pnpm --filter hrm-mobile test` PASS.

### Wave 2 — Leave journey iOS (`PCOMP-W4-MOB-UX-02`) — 3–4 ngày

Screens: `LeaveRequestsListScreen`, `LeaveRequestDetailScreen`, `CreateLeaveRequestScreen`.

- Rebuild detail theo web LeaveTab detail modal (hero + grid + note blocks).
- List row: «Nghỉ phép năm · 08/08–11/08/2026» + badge.
- Create form: iOS-style grouped fields (`FormField` upgrade).
- Manager `ManagerApprovalsScreen` cùng pattern.

**J-*:** J-MOB-03 list→detail leave; J-MOB-04 create leave.

### Wave 3 — Rollout các module còn lại (`PCOMP-W4-MOB-UX-03`)

| Module | Web ref |
|--------|---------|
| Check-in / history | `Attendance.tsx` mobile breakpoints |
| Payslip | Payroll embed responsive |
| Contracts | HRM contracts tab |
| Dashboard | Portal employee dashboard cards |

### Wave 4 — QA device + sponsor sign-off

- `qa-device`: J-MOB-01..05 trên emulator + 1 physical iOS nếu có.
- Sponsor UAT mobile slice trong `PCOMP-W6-SP-01`.

---

## 4) Acceptance criteria (QA)

| AC | Pass when |
|----|-----------|
| AC-MUX-01 | Tab bar có icon vector, không placeholder X |
| AC-MUX-02 | Mọi date/datetime hiển thị `dd/MM/yyyy` hoặc `dd/MM/yyyy HH:mm` (vi-VN) |
| AC-MUX-03 | `leave_type` hiển thị nhãn tiếng Việt, không raw code LVT_* |
| AC-MUX-04 | Leave detail có ≥2 visual sections (hero + grouped fields) |
| AC-MUX-05 | Không hiển thị chuỗi `seed:` raw cho end user |
| AC-MUX-06 | Contrast ≥ WCAG AA trên badge + text (uiux-quality-accessibility rule) |
| AC-MUX-07 | Vitest formatters + snapshot 1 screen component |

---

## 5) Out of scope (wave này)

- Redesign toàn bộ portal Command Center trên mobile.
- Flutter / PWA thay native.
- Dark mode product-ready (chỉ fix inconsistency → light default).

---

## 6) Dispatch queue

| ID | Role | Deliverable |
|----|------|-------------|
| `PCOMP-W4-FE-SPEC-01` | Dev-FE | ✅ Parity appendix §2B/§2B.1 + evidence `docs/qa/evidence/pcomp-w4-fe-spec-01-20260607.md` |
| `PCOMP-W4-MOB-UX-01` | Dev-Mobile | Foundation: icons, formatters, tab bar, seed sanitize |
| `PCOMP-W4-MOB-UX-02` | Dev-Mobile | Leave journey iOS redesign |
| `PCOMP-W4-QA-DEV-02` | QA-Device | Retest J-MOB + AC-MUX-01..07 evidence |

**Dependency:** UX-02 after UX-01; QA after UX-02.
