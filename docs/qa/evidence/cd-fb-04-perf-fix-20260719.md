# CD-FB-04 — HRM Perf Fix (FE-01..04)

**work_item_id:** CD-FB-04-PERF-FIX  
**date:** 2026-07-19  
**owner:** dev-fe  
**ack_status:** READY_FOR_QA  
**spec_ref:** `docs/qa/evidence/cd-fb-03-hrm-perf-audit-20260620.md` · CUSTOMER_DEMO_HRM_DELTA F7  
**change_mode:** UPGRADE  
**must_keep:** F3–F6 green ACs · U65 zero-seed · no Phase1/PROD claim

---

## Summary

| ID | Deliverable | Status |
|----|-------------|--------|
| **P1-HRM-PERF-FE-01** | Iframe soft-nav — `_v` cache-bust only on JWT/tenant `scopeRevision`; tab path → postMessage | Confirmed + CODE-MEMORY |
| **P1-HRM-PERF-FE-02** | Split/capped `useEmployees` + `enabled` gates (TaskFormDialog, Attendance, InternalServices) | UPGRADE |
| **P1-HRM-PERF-FE-03** | Unified `useSettingsCatalogsOverview` (`hrm-settings-catalogs` RQ key) | **NEW this wave** |
| **P1-HRM-PERF-FE-04** | Dashboard `employees/summary` + shared expiring-contracts RQ + QueryClient `staleTime: 60_000` | Confirmed + tests |

---

## Before / after call-count estimate (pilot ~1107 NV · embed)

| Scenario | Before (audit CD-FB-03) | After (FE-01..04) | Δ |
|----------|-------------------------|-------------------|---|
| CC HRM tab switch ×3 (dash→emp→contracts) | ~45–51 (3× full iframe remount) | ~0 remount APIs (in-SPA soft-nav) | **≈ −100% remount storm** |
| Dashboard first mount | ~17 (listAllEmployees ~12 + contracts 2× + misc) | ~4–6 (`summary` 1×, expiring 1×, leave, attendance) | **≈ −60–70%** |
| Contracts open create dialog after Settings visit | 2× `GET /settings-catalogs` (~76 catalogs each) | **1×** first + **cache hit** within 60s | **≈ −50% catalogs** |
| Employee profile mount | ~16+ (spurious full employee list) | detail + modules only (no `useEmployees` list) | **≈ −12 list pages** |
| Soft remount / window focus within 60s | refetch all (staleTime 0) | RQ serves cache | fewer repeat GETs |

**QA target (P1-HRM-PERF-QA-01):** Network on dashboard mount ↓ **≥50%** vs CD-FB-03 baseline (~17 → ≤8).

---

## Files touched

| Path | Change |
|------|--------|
| `apps/web/hrm/src/hooks/useSettingsCatalogsOverview.ts` | **NEW** unified RQ hook |
| `apps/web/hrm/src/hooks/p1-hrm-perf-fe-02.test.ts` | **NEW** enabled-gate regression |
| `apps/web/hrm/src/hooks/p1-hrm-perf-fe-03.test.ts` | **NEW** shared key consumers |
| `apps/web/hrm/src/hooks/p1-hrm-perf-fe-04.test.ts` | Extend dashboard / App staleTime asserts |
| `apps/web/hrm/src/components/settings/SettingsCatalogsTab.tsx` | Use shared hook + invalidate key |
| `apps/web/hrm/src/pages/Contracts.tsx` | Drop `contracts-settings-catalogs` key |
| `apps/web/hrm/src/components/employee/EmployeeFormDialog.tsx` | Drop `employee-form-catalogs` key |
| `apps/web/hrm/src/components/tasks/TaskFormDialog.tsx` | `enabled: open` on employees/departments |
| `apps/web/hrm/src/hooks/useEmployees.ts` | CODE-MEMORY FE-02 |
| `apps/web/hrm/src/App.tsx` | CODE-MEMORY FE-04 (staleTime kept) |
| `apps/web/hrm/src/hooks/useExpiringContractsDashboard.ts` | CODE-MEMORY FE-04 |
| `apps/web/web-portal/.../HrmWorkspaceRoute.tsx` | CODE-MEMORY FE-01 |

**Untouched (must_keep):** F3 role chips · F4 leave · F5 compensation tabs · F6 recruit JD/funnel product paths.

---

## Tests run

```text
apps/web/hrm:
  pnpm exec vitest run src/hooks/p1-hrm-perf-fe-02.test.ts \
    src/hooks/p1-hrm-perf-fe-03.test.ts src/hooks/p1-hrm-perf-fe-04.test.ts
  → 9/9 PASS

apps/web/web-portal:
  pnpm exec vitest run src/modules/hrm/paths.test.ts \
    src/modules/hrm/portalEmbedSoftNavGuard.test.ts
  → 15/15 PASS
```

U65: no seed used.

---

## QA retest (browser — `P1-HRM-PERF-QA-01`)

1. L0: `pnpm run qc:fe-be-health` (hrm-api `:28001` up).  
2. Login `ceo@xe.vn` → Command Center HRM embed (`:8088` or `:5175`).  
3. **Dashboard mount:** DevTools Network — count `employees` / `contracts` / `settings-catalogs` / `leave` — expect **no** `employees?page=` storm; **1×** `employees/summary`; **1×** expiring contracts. Target ≤50% of ~17 baseline.  
4. **Tab soft-nav:** dashboard → employees → contracts — iframe document **not** reloaded; no new `_v=` per tab; SPA route only.  
5. **Catalogs:** open Settings catalogs → then Contracts → Create — second screen should **not** re-download full catalogs if within 60s (same RQ key).  
6. F5 deep link employee profile — no full employee list fan-out.  
7. Smoke F3–F6 green paths (role chip, leave, contract compensation tab, recruit) — no AC overwrite.

---

## Residual

- Attendance/payroll satellite tabs that stay mounted still call capped `useEmployees` (1 RQ page, shared key) — intentional.  
- BE cursor/summary for list tables remains `P1-HRM-PERF-BE-01` (out of FE scope).  
- Soft-nav verify fallback may still force document `src` reload on stall (CD-FB-09) — content remount without bumping `embedScopeKey`.

---

## completion_report

Closed CD-FB-04-PERF-FIX: FE-01 soft-nav cache-bust confirmed; FE-02 enabled gates + capped picker; FE-03 unified settings-catalogs RQ; FE-04 dashboard summary/contract dedupe + 60s staleTime. Vitest 9+15 PASS. F3–F6 product paths not overwritten. Evidence for QA network ↓50% dashboard mount.

## next_owner

qa

## next_dispatch_prompt

```text
work_item_id: P1-HRM-PERF-QA-01
from_role: pm
to_role: qa
lane: execution
entry_criteria: CD-FB-04-PERF-FIX READY_FOR_QA; evidence docs/qa/evidence/cd-fb-04-perf-fix-20260719.md; U65 zero-seed; L0 qc:fe-be-health PASS
exit_criteria: Browser Network on HRM Dashboard mount shows ≥50% fewer API calls vs CD-FB-03 baseline (~17 → ≤8); soft-nav tab switch no iframe remount/`_v` per tab; settings-catalogs not double-fetched Contracts after Settings within 60s; F3–F6 smoke green; evidence updated; PASS_TO_PM
cấm: seed · Phase1/PROD claim · overwrite F3–F6 PASS ACs
persona: ceo@xe.vn / Xevn@2026
J-*: J-HRM-02 soft-nav · dashboard mount
```

## ack_status

READY_FOR_QA
