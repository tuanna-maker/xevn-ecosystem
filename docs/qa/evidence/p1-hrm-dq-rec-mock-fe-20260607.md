# P1-HRM-DQ-REC-MOCK-01 — Recruitment dashboard mock removal (FE)

**Date:** 2026-06-07  
**Work item:** P1-HRM-DQ-REC-MOCK-01  
**Owner:** dev-fe  
**ack_status:** READY_FOR_QA

## Incident

Recruitment dashboard tab showed hardcoded **1OFFICE** org names (CÔNG TY CỔ PHẦN 1OFFICE, Chi nhánh HCM…) not present in XeVN/XBOS tenant.

## Root cause

| File | Issue |
|------|--------|
| `RecruitmentBarChart.tsx` | Hardcoded `const data = [...]` with 1OFFICE departments |
| `RecruitmentLineChart.tsx` | Hardcoded 2023 monthly mock series |
| `Recruitment.tsx` | Fake VND cost cards (`990.000`, `13.395.000`, `2.756.804`) and target KPI `86` |

## Fix summary

1. **`lib/recruitmentDashboardAggregator.ts`** — pure aggregators: dept bar (job posting dept via applications + `useDepartments` catalog), applied-month line chart, cost summary fail-closed (no invented VND), active job posting headcount target.
2. **`hooks/useRecruitmentDashboard.ts`** — loads `listCandidatesPool`, `listCandidateApplications`, `listJobPostings`, `useDepartments`; no mock fallback.
3. **`RecruitmentBarChart` / `RecruitmentLineChart`** — accept live `data` props + empty/loading states.
4. **`Recruitment.tsx`** — wires dashboard hook; cost row shows compact empty state when no cost API; target from active posting headcount.

U34 consumer sync: **unchanged** (no edits under portal catalog/sync paths).

## Verification

```bash
cd apps/web/hrm
pnpm vitest run src/lib/recruitmentDashboardAggregator.test.ts  # 5/5 PASS
pnpm vitest run                                              # 137/137 PASS
pnpm build                                                   # exit 0
```

## QA smoke (manual)

| Step | Account | Expect |
|------|---------|--------|
| 1 | Login `ceo@xe.vn` / `Xevn@2026` | Portal loads |
| 2 | HRM embed → **Tuyển dụng** → tab **Dashboard** | No 1OFFICE labels on dept bar chart |
| 3 | Same | Line chart months reflect live `applied_date` (or empty state if no candidates) |
| 4 | Same | Cost row shows **Không có dữ liệu** (no fake VND) unless BE cost API added later |
| 5 | Same | Dept chart groups by XeVN job posting `department` or **Khác** |

## Residual

- Recruitment **cost** metrics require BE contract/API (currently fail-closed empty).
- Candidates without job application link aggregate under **Khác** until application + posting dept exists.

## Files touched

- `apps/web/hrm/src/lib/recruitmentDashboardAggregator.ts`
- `apps/web/hrm/src/lib/recruitmentDashboardAggregator.test.ts`
- `apps/web/hrm/src/hooks/useRecruitmentDashboard.ts`
- `apps/web/hrm/src/components/recruitment/RecruitmentBarChart.tsx`
- `apps/web/hrm/src/components/recruitment/RecruitmentLineChart.tsx`
- `apps/web/hrm/src/pages/Recruitment.tsx`
