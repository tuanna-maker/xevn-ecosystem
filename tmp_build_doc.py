#!/usr/bin/env python3
"""Build the UX/UI ERP Screen Analysis Matrix document."""

# Full document content
sections = {}

# Section (a)
sections['a'] = """## (a) Screen x Verdict Matrix

| # | Screen | Lines | Verdict | Key Pattern / Rationale |
|---|--------|------:|---------|------------------------|
| 1 | OrdinaryLeaveManagement.tsx | 782 | MODERATE | Leave types and balances, request management, approval workflow. Moderate state, form-driven. Single overview page, no deep navigation. |
| 2 | SpecialLeaveManagement.tsx | ~500 est. | MODERATE | Similar structure to OrdinaryLeaveManagement for special leave types. Lower complexity. |
| 3 | RosterManagement.tsx | ~600 est. | MODERATE | Shift/roster scheduling. Likely table-heavy with date pickers. |
| 4 | AttendanceCorrectionRequest.tsx | ~400 est. | SIMPLE-MODERATE | Request list with status filtering. Focused single-purpose page. |
| 5 | AttendancePolicy.tsx | ~350 est. | SIMPLE | Configuration page for attendance rules. Form-based CRUD, moderate depth. |
| 6 | AttendanceSheetView.tsx | ~500 est. | MODERATE | Calendar or grid view for attendance sheets. Date navigation adds click depth. |
| 7 | ShiftManagement.tsx | ~450 est. | MODERATE | Shift CRUD with time scheduling. Single-purpose, likely clean flow. |
| 8 | HRPolicyDashboard.tsx | ~300 est. | SIMPLE | Dashboard for HR policies. Overview-heavy, few interactions. |
| 9 | AttendanceDashboard.tsx | ~400 est. | MODERATE | Stats and charts for attendance. Similar complexity to HRPolicyDashboard. |
| 10 | BasicSalaryDashboard.tsx | ~350 est. | MODERATE | Salary overview dashboard. Moderate data viz. |
"""

import os

output_path = r"C:\xevn-ecosystem\docs\qa\evidence\ux-ui-erp-screen-matrix-01.md"

os.makedirs(os.path.dirname(output_path), exist_ok=True)

with open(output_path, "w", encoding="utf-8") as f:
    f.write(sections['a'])
    f.write("\n---\n\n")

    f.write("## (b) Issues Found Table\n\n")
    f.write("| ID | Screen(s) | Dimension | Severity | Finding |\n")
    f.write("|----|-----------|-----------|----------|---------|\n")
    f.write("| UX-01 | Attendance, Payroll | Task flow | P0 | Tab depth exceeds cognitive limits. Attendance has 15+ sub-tabs. Payroll has 5+ primary + 12+ sub-tabs. Average click depth to any functional area: 4-5 clicks. |\n")
    f.write("| UX-02 | Payroll | State | P0 | `floatingUiState.undefined` runtime error in tax-settlement employee edit dialog. Crashes on any floating UI interaction. |\n")
    f.write("| UX-03 | Attendance (shifts), Contracts | Search | P1 | Search inputs non-functional or incompletely wired. Shifts tab has placeholder-only search with no onChange/value binding. |\n")
    f.write("| UX-04 | Attendance, Payroll, Contracts | Feedback | P1 | No visible loading/error states in sub-tab content areas or scanner views. Child components handle their own states but parent shows no guard. |\n")
    f.write("| UX-05 | Attendance sub-tabs | Empty states | P2 | No systematic empty/placeholder state when sub-tab content is absent. Users see blank areas with no guidance. |\n")
    f.write("| UX-06 | Attendance, Payroll | State | P0 | 30+ useState hooks in Attendance.tsx, 25+ in Payroll.tsx. State synchronization risk across nested modals, form data, and tab selections. |\n")
    f.write("| UX-07 | EmployeeProfile | Permissions | P2 | PermissionGate silently returns null on salary tab. Users see the tab but get blank content — no explanation that access is restricted. |\n")
    f.write("| UX-08 | Attendance, Payroll | Destructive confirmation | P1 | Inconsistent patterns. Employees.tsx requires typed reason for delete. Payroll bulk delete uses standard confirm dialog. No standardization. |\n")
    f.write("| UX-09 | Attendance (shifts) | Bulk actions | P1 | Shifts table shows checkboxes but no bulk action toolbar. Partial implementation — checkboxes without action bar are misleading. |\n")
    f.write("| UX-10 | Dashboard | Empty states | P2 | When no payroll data, fallback is bland text. No actionable guidance. |\n")
    f.write("| UX-11 | All screens | i18n coverage | P2 | Several strings hardcoded in Vietnamese inside JSX (e.g., in Payroll). Bypasses translation system. |\n")
    f.write("| UX-12 | Multiple | Confirmation UX | P1 | Some destructive dialogs mix Cancel/OK buttons without clear visual hierarchy. Destructive actions should use variant=destructive consistently. |\n")
    f.write("\n---\n\n")

    f.write("## (c) Improvement Backlog (Prioritized P0 / P1 / P2)\n\n")
    f.write("### P0 — Critical (fix immediately)\n\n")
    f.write("| ID | Screen(s) | Issue | Recommendation |\n")
    f.write("|----|-----------|-------|----------------|\n")
    f.write("| P0-a | Attendance, Payroll | Excessive tab depth (UX-01) | Consolidate sub-tabs into contextual drill-downs. Replace static sub-tabs with conditional expansion panels or inline sections triggered by primary tab. For Attendance: collapse checkinout/qrcode/faceid/gps into a 'Clock In' section with method selector buttons. For Payroll: merge policy/data/calculate into a guided wizard or accordion layout. Target: max 2 click levels. |\n")
    f.write("| P0-b | Payroll | Floating UI state bug (UX-02) | Fix null-reference on floatingUiState. Add null-checking or initialize state. Runtime crash risk in tax settlement and dropdown interactions. |\n")
    f.write("| P0-c | Attendance, Payroll | State proliferation (UX-06) | Refactor to useReducer blocks grouped by domain. Replace 25-30 useState calls per component. Reduce re-render cascades. |\n")
    f.write("\n### P1 — High (next sprint)\n\n")
    f.write("| ID | Screen(s) | Issue | Recommendation |\n")
    f.write("|----|-----------|-------|----------------|\n")
    f.write("| P1-a | Attendance, Contracts | Non-functional search inputs (UX-03) | Wire up debounced search handlers. Ensure all Input elements have value, onChange, and debounced filter. Minimum 300ms debounce with loading indicator. |\n")
    f.write("| P1-b | Multiple | Inconsistent destructive confirmation (UX-08) | Standardize destructive action patterns. Adopt single pattern: high-impact deletes require typed confirmation, lower-impact use AlertDialog with destructive variant. Document in component library. |\n")
    f.write("| P1-c | Attendance | Bulk action UX gap (UX-09) | Add bulk action toolbar to Shifts view. If checkboxes shown, corresponding bulk action bar (Archive, Export, Delete) must appear. Either remove checkboxes or add toolbar. |\n")
    f.write("| P1-d | Payroll | CRUD interaction density (UX-12) | Increase dialog width for complex forms. Tax settlement edit at max-w-lg is cramped with 8 fields. Use max-w-2xl or two-column layout. |\n")
    f.write("| P1-e | Dashboard | Empty state quality (UX-10) | Replace bland placeholder with actionable guidance. When no data, show 'No data for this period. Select different period or [run payroll].' Include direct action link. |\n")
    f.write("\n### P2 — Medium (backlog)\n\n")
    f.write("| ID | Screen(s) | Issue | Recommendation |\n")
    f.write("|----|-----------|-------|----------------|\n")
    f.write("| P2-a | Multiple | Empty/loading state inconsistency (UX-04, UX-05) | Audit all tab content areas for consistent loading skeletons. Establish pattern: SkeletonGrid for loading, EmptyState for no data, ErrorState for failures. |\n")
    f.write("| P2-b | EmployeeProfile | Permission visibility (UX-07) | Add visible indicator for permission-gated content. Instead of silently returning null, PermissionGate should render 'Restricted — contact admin'. |\n")
    f.write("| P2-c | Attendance | Pagination UX | Fix or remove disabled pagination in weekly view. If weekly navigation not implemented, hide controls entirely. Add tooltip if planned. |\n")
    f.write("| P2-d | Dashboard | Export progress feedback | Add export progress indicator (spinner + percentage) for PDF export. Current isExporting shows button text change only. |\n")
    f.write("| P2-e | All | Internationalization coverage (UX-11) | Several strings hardcoded in Vietnamese (e.g., in Payroll). Ensure all user-facing strings pass through i18n t() function. |\n")
    f.write("| P2-f | EmployeeProfile | Tab UX | 11 overflow tabs in dropdown is excessive. Suggest grouping: Core (4 always visible), HR (insurance, training, assets), Career (cv, kpi, workHistory, degrees, certificates, skills), Personal (family). |\n")
    f.write("\n---\n\n")

    f.write("## (d) Cross-cutting Findings\n\n")
    f.write("### D1. Component architecture consistency\n\n")
    f.write("Two table rendering patterns are used interchangeably: shadcn/ui DataTable (Employees, Contracts, LeaveManagement) vs plain HTML table (Attendance shifts, Payroll tax settlement).\n\n")
    f.write("**Recommendation:** Standardize on DataTable for all list views. Plain tables lack built-in sorting, column resizing, and accessibility features.\n\n")
    f.write("### D2. State initialization gaps\n\n")
    f.write("Multiple components show patterns where state arrays/objects are used before initialization. Payroll.tsx references floatingUiState without null-checking. Attendance.tsx has multiple modal visibility states without guard clauses.\n\n")
    f.write("**Recommendation:** Adopt convention: all useState calls must have explicit initial values, and derived state must be null-guarded before property access.\n\n")
    f.write("### D3. Permission UX gap\n\n")
    f.write("PermissionGate is used in EmployeeProfile.tsx (salary tab) but provides zero feedback when content is restricted — silent failure pattern.\n\n")
    f.write("**Recommendation:** Add PermissionFallback component that renders 'Restricted — contact admin for access'. Document PermissionGate + PermissionFallback as the standard pattern.\n\n")
    f.write("### D4. Lazy loading inconsistency\n\n")
    f.write("AttendanceEntry.tsx uses React.lazy() for code-splitting the large Attendance component, but other heavy components (EmployeeProfile 801 lines, Payroll 4779 lines, Attendance 3658 lines) are loaded eagerly.\n\n")
    f.write("**Recommendation:** Apply lazy loading to EmployeeProfile.tsx and Payroll.tsx using the same Suspense + ErrorBoundary pattern.\n\n")
    f.write("### D5. Form validation coverage\n\n")
    f.write("Forms in Payroll.tsx (tax settlement edit) use controlled inputs without Zod/react-hook-form validation, while other forms (Employees, LeaveManagement) use Zod schemas.\n\n")
    f.write("**Recommendation:** Standardize form validation. Either all forms use Zod + react-hook-form, or document exceptions with rationale. Migrate tax settlement edit to the established pattern.\n\n")

print(f"Document written to: {output_path}")
print(f"Total size: {os.path.getsize(output_path)} bytes")
