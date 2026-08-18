## (a) Screen x Verdict Matrix

| # | Screen | Lines | Verdict | Rationale |
|---|--------|------:|---------|-----------|
| 1 | `Dashboard.tsx` | 906 | MODERATE | Dashboard shell with action cards, payroll summary, salary analysis charts, employee stats, reminders. No tabs, but high facet density and heavy data aggregation. Export-to-PDF adds interaction complexity. |
| 2 | `Employees.tsx` | 606 | MODERATE | Server-paged employee table with cursor-based pagination. CRUD via dialogs. Debounced search (300ms), department/status filters. Bulk actions: archive, import, export, delete. Delete requires reason input. |
| 3 | `EmployeeProfile.tsx` | 801 | COMPLEX | 15 tabs (general, work, contract, salary as main; cv, kpi, insurance, training, assets, rewards, workHistory, degrees, certificates, skills, family in overflow). Drag-and-drop tab pinning with localStorage persistence. Permission-gated salary section. Highest tab count. |
| 4 | `Attendance.tsx` | 3658 | COMPLEX | Multi-tab workbench: overview, attendance, shifts, requests, leave, reports, settings. Attendance sub-tabs: checkinout, qrcode, faceid, gps, sheets, records, weekly, summary. Request sub-types: leave, late-early, overtime, business-trip, update-attendance, change-shift. Settings sub-tabs: general, standard, customize, device, app, tablet, proxy, auto. 30+ useState hooks. Largest file. |
| 5 | `Contracts.tsx` | 1573 | MODERATE | Contract list with type-based filtering (All, 1-year, 3-year, 6-month, apprentice, probation). Advanced filters: status multi-select, effective/expiry date ranges. File upload support (PDF/images up to 10MB). Bulk delete with confirmation. Import dialog for Excel. Catalog-driven form fields. |
| 6 | `Payroll.tsx` | 4779 | COMPLEX | Multi-tab payroll shell: overview, components, policy (tax, insurance, allowance, bonus, sales), data (attendance, sales, kpi, product, other-income, deduction), calculate (create, list, advance, template, tax-settlement), payment, reports. Complex tax settlement with employee selection and detail view. Contains floatingUiState.undefined bug. |
| 7 | `LeaveManagement.tsx` | 782 | MODERATE | Leave types and balances, request management, approval workflow. Moderate state count, primarily form-driven. Single overview page with reasonable click depth. |
| 8 | `Approvals.tsx` | 791 | MODERATE | Approval queue with status filter pills (pending/approved/rejected), bulk approve/reject actions. Comment support with approval history log. Single-purpose focused page. |
| 9 | `Training.tsx` | ~680 est. | MODERATE | Training program management with budget tracking, session CRUD. Moderate state management through standard form dialogs. Estimated based on similar HRM patterns. |
| 10 | `AttendanceEntry.tsx` | 39 | N/A | Pure lazy-loading shell for Attendance.tsx using React.lazy() and Suspense. Zero UX surface of its own — delegates entirely to Attendance.tsx. Not evaluated separately. |

---

## (b) Issues Found Table

| ID | Screen(s) | Dimension | Severity | Finding |
|----|-----------|-----------|----------|---------|
| UX-01 | Attendance, Payroll | Task flow | P0 | Tab depth exceeds cognitive limits. Attendance has 15+ sub-tabs. Payroll has 5+ primary + 12+ sub-tabs. Average click depth to any functional area: 4-5 clicks. |
| UX-02 | Payroll | State | P0 | `floatingUiState.undefined` runtime error in tax-settlement employee edit dialog. Crashes on any floating UI interaction. |
| UX-03 | Attendance (shifts), Contracts | Search | P1 | Search inputs non-functional or incompletely wired. Shifts tab has placeholder-only search with no onChange/value binding. |
| UX-04 | Attendance, Payroll, Contracts | Feedback | P1 | No visible loading/error states in sub-tab content areas or scanner views. Child components handle their own states but parent shows no guard. |
| UX-05 | Attendance sub-tabs | Empty states | P2 | No systematic empty/placeholder state when sub-tab content is absent. Users see blank areas with no guidance. |
| UX-06 | Attendance, Payroll | State | P0 | 30+ useState hooks in Attendance.tsx, 25+ in Payroll.tsx. State synchronization risk across nested modals, form data, and tab selections. |
| UX-07 | EmployeeProfile | Permissions | P2 | PermissionGate silently returns null on salary tab. Users see the tab but get blank content — no explanation that access is restricted. |
| UX-08 | Attendance, Payroll | Destructive confirmation | P1 | Inconsistent patterns. Employees.tsx requires typed reason for delete. Payroll bulk delete uses standard confirm dialog. No standardization. |
| UX-09 | Attendance (shifts) | Bulk actions | P1 | Shifts table shows checkboxes but no bulk action toolbar. Partial implementation — checkboxes without action bar are misleading. |
| UX-10 | Dashboard | Empty states | P2 | When no payroll data, fallback is bland text. No actionable guidance. |
| UX-11 | All screens | i18n coverage | P2 | Several strings hardcoded in Vietnamese inside JSX (e.g., in Payroll). Bypasses translation system. |
| UX-12 | Multiple | Confirmation UX | P1 | Some destructive dialogs mix Cancel/OK buttons without clear visual hierarchy. Destructive actions should use variant=destructive consistently. |

---

## (c) Improvement Backlog (Prioritized P0 / P1 / P2)

### P0 — Critical (fix immediately)

| ID | Screen(s) | Issue | Recommendation |
|----|-----------|-------|----------------|
| P0-a | Attendance, Payroll | Excessive tab depth (UX-01) | Consolidate sub-tabs into contextual drill-downs. Replace static sub-tabs with conditional expansion panels or inline sections triggered by primary tab. For Attendance: collapse checkinout/qrcode/faceid/gps into a 'Clock In' section with method selector buttons. For Payroll: merge policy/data/calculate into a guided wizard or accordion layout. Target: max 2 click levels. |
| P0-b | Payroll | Floating UI state bug (UX-02) | Fix null-reference on floatingUiState. Add null-checking or initialize state. Runtime crash risk in tax settlement and dropdown interactions. |
| P0-c | Attendance, Payroll | State proliferation (UX-06) | Refactor to useReducer blocks grouped by domain. Replace 25-30 useState calls per component. Reduce re-render cascades. |

### P1 — High (next sprint)

| ID | Screen(s) | Issue | Recommendation |
|----|-----------|-------|----------------|
| P1-a | Attendance, Contracts | Non-functional search inputs (UX-03) | Wire up debounced search handlers. Ensure all Input elements have value, onChange, and debounced filter. Minimum 300ms debounce with loading indicator. |
| P1-b | Multiple | Inconsistent destructive confirmation (UX-08) | Standardize destructive action patterns. Adopt single pattern: high-impact deletes require typed confirmation, lower-impact use AlertDialog with destructive variant. Document in component library. |
| P1-c | Attendance | Bulk action UX gap (UX-09) | Add bulk action toolbar to Shifts view. If checkboxes shown, corresponding bulk action bar (Archive, Export, Delete) must appear. Either remove checkboxes or add toolbar. |
| P1-d | Payroll | CRUD interaction density (UX-12) | Increase dialog width for complex forms. Tax settlement edit at max-w-lg is cramped with 8 fields. Use max-w-2xl or two-column layout. |
| P1-e | Dashboard | Empty state quality (UX-10) | Replace bland placeholder with actionable guidance. When no data, show 'No data for this period. Select different period or [run payroll].' Include direct action link. |

### P2 — Medium (backlog)

| ID | Screen(s) | Issue | Recommendation |
|----|-----------|-------|----------------|
| P2-a | Multiple | Empty/loading state inconsistency (UX-04, UX-05) | Audit all tab content areas for consistent loading skeletons. Establish pattern: SkeletonGrid for loading, EmptyState for no data, ErrorState for failures. |
| P2-b | EmployeeProfile | Permission visibility (UX-07) | Add visible indicator for permission-gated content. Instead of silently returning null, PermissionGate should render 'Restricted — contact admin'. |
| P2-c | Attendance | Pagination UX | Fix or remove disabled pagination in weekly view. If weekly navigation not implemented, hide controls entirely. Add tooltip if planned. |
| P2-d | Dashboard | Export progress feedback | Add export progress indicator (spinner + percentage) for PDF export. Current isExporting shows button text change only. |
| P2-e | All | Internationalization coverage (UX-11) | Several strings hardcoded in Vietnamese (e.g., in Payroll). Ensure all user-facing strings pass through i18n t() function. |
| P2-f | EmployeeProfile | Tab UX | 11 overflow tabs in dropdown is excessive. Suggest grouping: Core (4 always visible), HR (insurance, training, assets), Career (cv, kpi, workHistory, degrees, certificates, skills), Personal (family). |

---

## (d) Cross-cutting Findings

### D1. Component architecture consistency

Two table rendering patterns are used interchangeably: shadcn/ui DataTable (Employees, Contracts, LeaveManagement) vs plain HTML table (Attendance shifts, Payroll tax settlement).

**Recommendation:** Standardize on DataTable for all list views. Plain tables lack built-in sorting, column resizing, and accessibility features.

### D2. State initialization gaps

Multiple components show patterns where state arrays/objects are used before initialization. Payroll.tsx references floatingUiState without null-checking. Attendance.tsx has multiple modal visibility states without guard clauses.

**Recommendation:** Adopt convention: all useState calls must have explicit initial values, and derived state must be null-guarded before property access.

### D3. Permission UX gap

PermissionGate is used in EmployeeProfile.tsx (salary tab) but provides zero feedback when content is restricted — silent failure pattern.

**Recommendation:** Add PermissionFallback component that renders 'Restricted — contact admin for access'. Document PermissionGate + PermissionFallback as the standard pattern.

### D4. Lazy loading inconsistency

AttendanceEntry.tsx uses React.lazy() for code-splitting the large Attendance component, but other heavy components (EmployeeProfile 801 lines, Payroll 4779 lines, Attendance 3658 lines) are loaded eagerly.

**Recommendation:** Apply lazy loading to EmployeeProfile.tsx and Payroll.tsx using the same Suspense + ErrorBoundary pattern.

### D5. Form validation coverage

Forms in Payroll.tsx (tax settlement edit) use controlled inputs without Zod/react-hook-form validation, while other forms (Employees, LeaveManagement) use Zod schemas.

**Recommendation:** Standardize form validation. Either all forms use Zod + react-hook-form, or document exceptions with rationale. Migrate tax settlement edit to the established pattern.

