# HRM FE quality audit — safe date formatting rollout

**Date:** 2026-05-24  
**Owner:** Dev-FE  
**Work item:** HRM-FE-DATE-SAFE-20260524  
**Utility:** `apps/web/hrm/src/lib/formatDisplayDate.ts`

## Problem

High-traffic HRM pages used `format(new Date(apiValue), …)` on API/mock strings. Invalid or partial values (empty, `01/2025` period labels, garbage) could throw `RangeError` or render **01/01/1970** in the UI.

## Solution

Roll out `formatDisplayDate(value, pattern?)` for all API-sourced date display. Keep `format(new Date(), …)` only for **today** (export filenames, form defaults).

## Before → After (files touched)

| File | Before (unsafe API paths) | After |
|------|---------------------------|-------|
| `src/pages/Contracts.tsx` | 7× `format(new Date(contract.*))` on effective/expiry/created_at | `formatDisplayDate(...)`; filename still `format(new Date(), …)` |
| `src/pages/Decisions.tsx` | 7× on effective/expiry/signing export + table + view dialog | `formatDisplayDate(...)`; export filename unchanged |
| `src/pages/EmployeeProfile.tsx` | Local `formatDate` try/catch + `format(new Date(...))` | Delegates to `formatDisplayDate` |
| `src/components/employee/EmployeeContracts.tsx` | Local `formatDate` try/catch | `formatDisplayDate`; form submit still `format(Date, 'yyyy-MM-dd')` |
| `src/components/employee/EmployeeCertificates.tsx` | Local `formatDate` try/catch | `formatDisplayDate` when date present |
| `src/components/employee/EmployeeResume.tsx` | Local `formatDate` + `created_at` inline | `formatDisplayDate` |
| `src/components/employee/EmployeeWorkTimeline.tsx` | `event_date` inline | `formatDisplayDate(item.event_date)` |
| `src/components/recruitment/CandidatesTab.tsx` | 2× `applied_date` (export + table) | `formatDisplayDate`; export filename unchanged |
| `src/components/recruitment/CandidateDetailView.tsx` | 6× applied/expected/interview dates | `formatDisplayDate` |
| `src/components/recruitment/JobCandidatesDialog.tsx` | 1× `applied_date` | `formatDisplayDate` |
| `src/components/recruitment/CampaignCandidatesTab.tsx` | 1× `applied_date` | `formatDisplayDate`; removed unused `calLocale` |
| `src/lib/formatDisplayDate.test.ts` | 3 tests | 5 tests (+ datetime pattern, invalid input, empty variants) |

## Intentionally unchanged (out of scope / low risk / today-only)

- `format(new Date(), …)` export filenames and form “today” defaults (Contracts, Decisions, CandidatesTab, EmployeeSalary, EmployeeJobList, …)
- `format(formData.someDate, …)` where value is already a `Date` from Calendar picker
- Other recruitment tabs (InterviewsTab, JobPostingsTab, CampaignsTab, HeadcountProposalTab) — candidate-priority wave only; follow-up backlog

## Test evidence

```bash
pnpm --filter vite_react_shadcn_ts test
# Test Files  21 passed (21)
# Tests       82 passed (82)
# formatDisplayDate.test.ts — 5 passed
```

## Residual risk

- Display empty API dates now shows em dash (`—`) instead of mixed `-` / `--` in some screens — UX consistency improvement, not a functional regression.
- Remaining ~40 `format(new Date(api))` call sites elsewhere in `apps/web/hrm` (Insurance, PlatformAdmin, InterviewsTab, …) should be migrated in a second wave.

## QA retest hints (L2.5)

- J-HRM contracts list → detail dates (`ceo@xe.vn`, Contracts page)
- J-HRM decisions list → view dialog dates
- Employee profile → Contracts / Certificates / Resume / Timeline tabs
- Recruitment → Candidates list, candidate detail applied/interview dates
