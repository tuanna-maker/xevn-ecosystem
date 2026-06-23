# PCOMP-W0-QA-01 — Full source mock audit matrix

| Field | Value |
|-------|--------|
| **work_item_id** | PCOMP-W0-QA-01 |
| **program** | P1-PRODUCT-COMPLETE |
| **date** | 2026-06-07 |
| **scope** | `apps/web/hrm` + `apps/web/web-portal` (prod UI paths) |
| **classifier** | `docs/program/PHASE1_PRODUCT_COMPLETION_PMP_PLAN.md` §3 |
| **ack_status** | **PASS_TO_PM** |

---

## Method

1. Grep patterns (exclude `*.test.*`, `*.spec.*`):
   - `mockCompanies`, `HRM_MOCK_`, `previewMock`, `allowMockFallback`
   - `const *Data = [` (manual triage — import templates vs user-facing)
2. Read `mockPolicy.ts` — portal prod gate: `allowMockFallback()` = `DEV && VITE_ALLOW_MOCK_FALLBACK=true`.
3. Read `hrmDataMode.ts` — HRM embed **no** mock gate; API-only for attendance path; other pages may render inline mock unconditionally.
4. Cross-check against PMP plan §3 inventory; add delta rows where grep diverges.

**Not in scope:** vitest `vi.mock`, React `Suspense fallback`, i18n `fallbackLng`.

---

## Executive summary

| Surface | P0 (prod user sees fake data) | P1 (portal gated / legacy panel) | P2 (dead code / dev-only / OK) |
|---------|-------------------------------|----------------------------------|--------------------------------|
| **HRM embed** `apps/web/hrm` | **11** active findings | 0 | 3 |
| **Web portal** `apps/web/web-portal` | 0 when `VITE_ALLOW_MOCK_FALLBACK≠true` | **18** gated fallback paths | 6 type-only / test |

**Verdict:** Audit **complete** for W0. HRM embed remains primary **P0** product-completion blocker (~15% mock UI per PMP §1). Portal mock is **prod-safe** when mock flag off but **code debt** for W2.

**Residual:** Runtime browser proof deferred to W1/W2 QA (L2 matrix + J-HRM); this wave is **source-only**.

---

## Prod gate reference

```typescript
// apps/web/web-portal/src/utils/mockPolicy.ts
export function allowMockFallback(): boolean {
  return import.meta.env.DEV && import.meta.env.VITE_ALLOW_MOCK_FALLBACK === 'true';
}
```

HRM app: **no equivalent** — `EmployeeSalary`, `Payroll`, `Attendance`, `EmployeeJobList`, `CandidateDetailView` render mock without env gate.

---

## §3.1 HRM embed — P0 user-facing (`apps/web/hrm`)

| ID | File | Pattern / symbol | User impact | Wave | Status |
|----|------|------------------|-------------|------|--------|
| M-HRM-01 | `pages/Attendance.tsx` | `weeklyAttendanceData` L239 — rendered L2086 | Weekly grid shows hardcoded NV/shifts | W1 | **OPEN P0** |
| M-HRM-01b | `pages/Attendance.tsx` | `attendanceSheetsData` L225 | Defined; **no JSX ref** — dead | — | **P2 cleanup** |
| M-HRM-01c | `pages/Attendance.tsx` | `monthlyLeaveData`/`departmentLeaveData`/`leaveTypeData` L297+ | Overview charts use API via `useAttendanceOverview`; static arrays **not** bound when DB empty | W1 | **PARTIAL** — only weekly grid P0 |
| M-HRM-02 | `pages/Payroll.tsx` | `payrollFeedbackData` L505 — rendered L1287 | Feedback tab fake rows | W1 | **OPEN P0** |
| M-HRM-10 | `pages/Payroll.tsx` | `advanceBatchesData`, `paymentBatchesData`, `salaryComponentsData`, `taxPolicyParticipantsData`, … | Advance/payment/salary-component tabs use mock arrays | W1 | **OPEN P0** |
| M-HRM-09 | `components/employee/EmployeeSalary.tsx` | `mockSalaryData`, `mockAllowances`, `mockMonthlyPayroll` — fallback when no payslip | Profile salary tab fake numbers | W1 | **OPEN P0** |
| M-HRM-04 | `components/employee/EmployeeJobList.tsx` | `initialMockJobs` L94 — `useState(initialMockJobs)` | Job list fake tasks | W1 | **OPEN P0** |
| M-HRM-04b | `components/employee/EmployeeJobProgressChart.tsx` | `statusData`/`priorityData` | **Derived from props** — OK if jobs from API | W1 | **Blocked by M-HRM-04** |
| M-HRM-11 | `components/employee/EmployeeWorkHistory.tsx` | `initialWorkHistory`, `initialTasks`, `monthlyPerformanceData`, `quarterlyPerformanceData`, `priorityDistribution` | Work history + performance charts mock | W1 | **OPEN P0** |
| M-HRM-05 | `components/recruitment/CandidateDetailView.tsx` | `radarChartData` L114 — hardcoded evaluation radar | Candidate detail fake scores | W1 | **OPEN P0** |
| M-HRM-12 | `pages/Recruitment.tsx` | `staffingProposals`, `interviewSchedules`, `recruitmentCampaigns` L187+ | **Dead code** (type-only `selectedProposal`); main tabs use hooks | — | **P2 cleanup** |

### Closed / reclassified (delta vs prior grep)

| ID | Prior | QA W0 finding |
|----|-------|---------------|
| M-HRM-03 | `ToolsReportTab`, `ServiceReportTab` static charts | **CLOSED** — both use `useToolsEquipment` / `useServiceRequests`; `statusData` aggregated from API |
| M-HRM-06 | `HeadcountProposalTab` summary chart mock | **P2 OK** — `statusData` L451 is Excel export sheet, not UI chart |
| M-HRM-08 | `RecruitmentPieChart`, `CampaignFunnelChart` | **CLOSED** — props/API derived |
| M-HRM-R04 | GPS HCM / skills radar | **CLOSED** — `EmployeeSkillsRadarChart` empty state; `GPSAttendance` uses geolocation API |

### HRM grep counts (non-test)

| Pattern | Matches `apps/web/hrm` |
|---------|------------------------|
| `mockCompanies` | 0 |
| `HRM_MOCK_` | 0 |
| `previewMock` | 0 |
| `allowMockFallback` | 0 |
| `const *Data = [` | 24 files (7 user-facing P0, rest import-template/chart-derive/dead) |

---

## §3.2 Portal — P1 legacy (`apps/web/web-portal`)

All rows gated by `allowMockFallback()` unless noted. **P0 in prod** only if ship with `VITE_ALLOW_MOCK_FALLBACK=true` in dev server (not production build).

| ID | File | Pattern | API path | Wave | Priority |
|----|------|---------|----------|------|----------|
| M-CC-01 | `modules/hrm/HrmWorkspacePanel.tsx` | `previewMockRows(HRM_MOCK_*)` on `hrmDataSource==='error'` | HRM client + error fallback | W2 | **P1** |
| M-CC-02 | `modules/hrm/mock-data.ts` | 15× `HRM_MOCK_*` exports | — catalog | W2 | **P1** |
| M-CC-03 | `hooks/useDeptSystemTemplates.ts` | `MOCK_SEED` ← `INITIAL_DEPT_SYSTEM_TEMPLATES` | `business-master/dept_system_templates` | W2 | **P1** |
| M-CC-04 | `integrations/infrastructureApi.ts` | `INFRASTRUCTURE_MOCK_SEED` | `infrastructure/settings` | W2 | **P1** |
| M-CC-05 | `data/mockData.ts`, `mock-data.ts` | `mockCompanies`, `mockEmployees`, … | tenant-scope | W2 | **P1** |
| M-CC-06 | `hooks/useCommandCenterKpiRail.ts` | `getKpiSeriesForPersona` when flag | kpi-engine / business-master | W2 | **P1** |
| M-CC-07 | `pages/hr/HRPage.tsx` | ~~`mockEmployees` on API fail + flag~~ | `listHrmEmployees` | W2 | **CLOSED** — QA-05 `portalStrictMode` |
| M-CC-08 | `pages/dashboard/ExecutiveDashboardPage.tsx` | ~~`mockExecutiveDashboardStats` cards~~ | KPI hooks partial | W2 | **CLOSED** — QA-05 strict demo layout off |
| M-CC-09 | Settings `*SettingsPage.tsx` (4) | ~~mock on catch + flag~~ | `businessMasterApi` | W2 | **CLOSED** — QA-05 four pages fail-closed |
| M-CC-10 | `hooks/useKpiDashboardSnapshot.ts` | ~~`mockKPIDashboardData` fallback~~ | kpi-engine evaluate | W2 | **CLOSED** — QA-05 snapshot resolver |
| M-CC-11 | `contexts/GlobalFilterContext.tsx` | `fallbackMaster` on tenant-scope fail | `tenant-scope/accessible` | W2 | **P1** |
| M-CC-12 | `pages/command-center/CommandCenterPage.tsx` | inbox/alerts/workflow/infra mock branches | multiple XBOS APIs | W2 | **P1** |
| M-CC-13 | `data/command-center-mock.ts` | rail types + seed tasks/KPI | inbox API | W2 | **P1** (types OK) |
| M-CC-14 | `pages/customers/CustomersPage.tsx`, `PartnersPage.tsx` | mock fallback | business-master | W2 | **P2** |
| M-CC-15 | `pages/settings/VehicleTypesSettingsPage.tsx` | `mockVehicleTypes` | asset-registry | W2 | **P2** |

### Portal grep counts (non-test)

| Pattern | Files | Notes |
|---------|-------|-------|
| `HRM_MOCK_` | 2 | `mock-data.ts`, `HrmWorkspacePanel.tsx` |
| `mockCompanies` | 2 | `mockData.ts`, `mock-data.ts` (type imports elsewhere) |
| `previewMock` | 1 | `HrmWorkspacePanel.tsx` |
| `allowMockFallback` | 18 files | All gated branches |

---

## P2 — acceptable / cleanup only

| ID | Location | Reason |
|----|----------|--------|
| M-HRM-07 | Import dialogs `templateData` | Excel template generation only |
| M-HRM-12 | `Recruitment.tsx` dead mock blocks | Remove with W1 cleanup |
| M-HRM-01b | `attendanceSheetsData` unused | Delete |
| M-CC-13 | `command-center-mock.ts` type exports | Keep types; remove seed data in W2 |

---

## Wave dispatch map (PM)

| Wave | Owner | Entry | Exit |
|------|-------|-------|------|
| W1 | dev-fe | M-HRM-01,02,04,05,09,10,11 open | `verify:hrm:no-mock-ui` P0 grep 0 hits |
| W2 | dev-fe + dev-be | M-CC-01..15 | CC strict mode; deprecate or API-only `HrmWorkspacePanel` |
| W0 follow | ba-process | PCOMP-W0-BA-D-01 | BR rows for new M-HRM-09..12 |
| W0 follow | sa | PCOMP-W0-SA-01 | Scope P0 XBOS list unchanged |

---

## completion_report

- **Closed:** Full source grep matrix for HRM + portal; aligned with PMP §3; reclassified M-HRM-03/06/08 and M-HRM-R04 closed; added M-HRM-09..12, M-CC-07..15.
- **Open P0:** 8 HRM embed user-facing mock clusters (Attendance weekly, Payroll tabs, Employee profile widgets, Candidate radar).
- **Open P1:** 13 portal gated legacy paths (W2).
- **Not promoted:** Browser L2/L2.5 — separate W1 QA after dev-fe.

## next_owner

**PM** — intake W0; dispatch **dev-fe** W1 top P0 + **ba-process** delta if spec rows needed.

## next_dispatch_prompt

```
PM → dev-fe | DISPATCH PCOMP-W1-FE-01
work_item_id: PCOMP-W1-FE-01
entry_criteria: pcomp-w0-mock-matrix-20260607.md P0 rows M-HRM-01,02,04,05,09,10,11 OPEN
exit_criteria: grep apps/web/hrm zero user-facing mock fallback in Attendance weekly grid, Payroll feedback/advance/payment, EmployeeSalary, EmployeeJobList, EmployeeWorkHistory charts, CandidateDetailView radar; jest/vitest regression; READY_FOR_QA
evidence_path: docs/qa/evidence/pcomp-w1-fe-mock-removal-YYYYMMDD.md
spec_ref: PHASE1_PRODUCT_COMPLETION_PMP_PLAN.md §3.1 W1
```

## evidence_path

`docs/qa/evidence/pcomp-w0-mock-matrix-20260607.md`
