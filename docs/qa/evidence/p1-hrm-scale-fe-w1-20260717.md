# P1-HRM-SCALE-FE-W1 — Employees server page (RQ) + profile nav dedupe

**work_item_id:** `P1-HRM-SCALE-FE-W1`  
**date:** 2026-07-17  
**owner:** dev-fe  
**ack_status:** READY_FOR_QA  
**U65:** zero-seed (no seed used)

**Closes residual:** `D-P1-HRM-EMP-PROFILE-REQ-DEDUPE-01` (P1) from `docs/qa/evidence/p1-hrm-menu-employees-20260717.md`

---

## spec_read_ack

| Artifact | Sections | Notes |
|----------|----------|-------|
| `docs/decisions/ADR-HRM-SCALE-1000-USERS-20260717.md` | §5.1–5.2, §5.3, §6 W1 | Option B RQ pages; iframe key = tenant+company; T-FANOUT ≤1 |
| `docs/qa/evidence/cd-fb-03-hrm-perf-audit-20260620.md` | full | As-is ~12× list fan-out |
| `docs/qa/evidence/p1-hrm-menu-employees-20260717.md` | Profile residual | Detail ×2 + two×12-page list chains on list→profile |
| `docs/qa/evidence/p1-hrm-perf-fe-01-20260620.md` | FE-01 | Stable `embedScopeKey` + soft nav (was regresssed to `key={target}`) |
| `docs/hrm/SRS.md` | AC-INT-SCOPE-G-01 | ≥1000 NV — must stay paged |

**spec says:** Employees table must not call `listAllEmployees` on mount; ≤1 list GET per page; list→profile must not refetch full directory or duplicate detail GET; iframe key must not include path.  
**code does (after):** `useEmployeesPage` (RQ); `useEmployee` (RQ detail key); portal `key={embedScopeKey}` + locked `src` + `postPortalEmbedNavigate` on path change.

---

## Changes

| File | Change |
|------|--------|
| `apps/web/hrm/src/hooks/useEmployeesPage.ts` | **ADD** RQ paged list; `dedupeEmployeesById`; `refetchOnWindowFocus: false` |
| `apps/web/hrm/src/hooks/useEmployeesPage.test.ts` | **ADD** query keys + pageSize=50 |
| `apps/web/hrm/src/pages/Employees.tsx` | Server page UI; no `listAllEmployees` on mount (export/archive lazy) |
| `apps/web/hrm/src/hooks/useEmployee.ts` | **REPLACE** useEffect fetch → RQ `['employee-detail', id, companyId]` (StrictMode in-flight dedupe) |
| `apps/web/hrm/src/hooks/useEmployee.test.ts` | Detail query key assertions |
| `apps/web/hrm/src/pages/EmployeeProfile.tsx` | Drop unused `useEmployees` import (type-only `EmployeeFormData`) |
| `apps/web/web-portal/src/modules/hrm/HrmWorkspaceRoute.tsx` | **RESTORE FE-01:** `key={embedScopeKey}`; lock `src` per scope remount; path change → soft nav (fixes remount storm that re-fired list chains) |

---

## D-P1-HRM-EMP-PROFILE-REQ-DEDUPE-01 — closure

| Symptom (QA :8088) | Fix |
|--------------------|-----|
| Detail GET ×2 for same id | `useEmployee` → React Query; identical key shares one in-flight request |
| Two full page 1–12 `listAllEmployees` chains on profile open | (1) Table no longer uses full merge; (2) iframe no longer remounts on path/`employees/:id` because `key`/`src` ignore path |
| Return list → profile again | RQ `staleTime: 60s` keeps page + detail warm; no silent multi-page refetch |

---

## Verification

```text
pnpm --filter vite_react_shadcn_ts test -- src/hooks/useEmployee.test.ts src/hooks/useEmployeesPage.test.ts src/hooks/useEmployees.pageSize.test.ts src/hooks/useEmployees.dedupe.test.ts
→ 4 files / 17 tests PASS

pnpm --filter web-portal test -- src/modules/hrm/portalEmbedNavBridge.test.ts src/modules/hrm/paths.test.ts
→ 2 files / 14 tests PASS

pnpm --filter vite_react_shadcn_ts build
→ ✓ built (production)
```

---

## QA checklist (browser `:8088`, U65)

Persona: `ceo@xe.vn` / `Xevn@2026`

1. **T-FANOUT (list):** HRM → Employees — ≤1 `GET /api/hrm/employees?page=&page_size=50` on mount (optional `/summary`). No page=2..N.
2. **Page change:** exactly 1 list GET for that page.
3. **D-P1-HRM-EMP-PROFILE-REQ-DEDUPE-01:** click row → profile:
   - **≤1** `GET /employees/:id?company_id=main` (not 2)
   - **0** multi-page `listAllEmployees` / page=1..12 chains
   - iframe document does **not** reload (Network: no new `/hr/employees/...` document)
4. **Back to list:** ≤1 list GET if cache stale; prefer 0 if within staleTime; J-HRM-02 still PASS.
5. **T-CONSOLE-P0:** no duplicate-key warnings.
6. CC tab switch still soft-nav (FE-01 regression guard).

---

## Residual (W2)

- Satellite pickers still `useEmployees` → `listAllEmployees`.
- Department filter client-side on current server page only.
- 1000-VU load = W3.

---

## Handoff

- `completion_report:` Closed ADR FE W1 server-paged Employees + D-P1-HRM-EMP-PROFILE-REQ-DEDUPE-01 (RQ detail + restored embedScopeKey soft nav). Vitest 17+14 PASS; HRM build PASS.
- `next_owner:` qa
- `ack_status:` READY_FOR_QA
- `evidence_path:` `docs/qa/evidence/p1-hrm-scale-fe-w1-20260717.md`

### next_dispatch_prompt

```text
work_item_id: P1-HRM-SCALE-QA-W1
from_role: pm
to_role: qa
entry_criteria: P1-HRM-SCALE-FE-W1 READY_FOR_QA incl. D-P1-HRM-EMP-PROFILE-REQ-DEDUPE-01; evidence docs/qa/evidence/p1-hrm-scale-fe-w1-20260717.md; U65 zero-seed; L0 qc:fe-be-health PASS
read_first: ADR §5.5 T-FANOUT/T-CONSOLE-P0/T-DEDUPE; p1-hrm-menu-employees-20260717.md residual; p1-hrm-scale-fe-w1-20260717.md QA checklist
spec_ref: ADR §5.1–5.3; J-HRM-02; defect D-P1-HRM-EMP-PROFILE-REQ-DEDUPE-01
exit_criteria: Browser :8088 ceo@xe.vn — Employees mount ≤1 list GET/page; list→profile ≤1 detail GET and 0 multi-page list chains; iframe no document reload; console P0=0; J-HRM-02 PASS; PASS_TO_PM
evidence_path: docs/qa/evidence/p1-hrm-scale-qa-w1-20260717.md
cấm: seed; claim PASS on probe-only
```
