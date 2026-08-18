# CD-FB-03 — HRM Embed Performance Audit

**work_item_id:** CD-FB-03-PERF-AUDIT  
**date:** 2026-06-20  
**owner:** dev-fe  
**ack_status:** PASS_TO_PM  
**pilot scale:** ~1107 employees · 76 catalogs (`:8088`)

---

## Executive summary

| P0 root cause | Impact |
|---------------|--------|
| Iframe **full reload** mỗi tab CC HRM | Toàn bộ mount API storm lặp lại |
| `useEmployees()` auto-fetch **~12** sequential pages | Mọi consumer kể cả profile chỉ cần mutation |
| Duplicate `settings-catalogs` (76 catalogs) | 2× payload nặng / màn |
| Dashboard duplicate contracts + full employee list | ~17 calls mount |
| No `staleTime` on QueryClient | Refetch on remount/focus |

---

## Top 5 P0 fixes → work items

| ID | Fix | Owner |
|----|-----|-------|
| P1-HRM-PERF-FE-01 | Iframe soft nav — bỏ cache-bust remount | dev-fe |
| P1-HRM-PERF-FE-02 | Split `useEmployees` + `enabled` gates | dev-fe |
| P1-HRM-PERF-FE-03 | Unified `settings-catalogs` RQ cache | dev-fe |
| P1-HRM-PERF-FE-04 | Dashboard contract dedupe + QueryClient staleTime | dev-fe |
| P1-HRM-PERF-BE-01 | Employees summary/cursor API | dev-be |

---

## Call counts (embed, pilot scale)

| Screen | ~API calls mount | Redundant |
|--------|------------------|-----------|
| Dashboard | ~17 | contracts 2×, employees ~12 |
| Employees list | ~15 | full list for table |
| Employee profile | ~16+ | full list spurious |
| Contracts | 4+ | settings-catalogs 2× |
| Tab switch CC | **100% repeat** | iframe remount |

**Files:** `HrmWorkspaceRoute.tsx`, `useEmployees.ts`, `EmployeeProfile.tsx`, `Dashboard.tsx`, `hrmApi.ts` (`listAllEmployees` loop).

---

## QA follow-up

`P1-HRM-PERF-QA-01` — Network audit before/after FE-01..04 on `:8088`.
