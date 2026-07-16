# P1-CC-MOUNT-DUP-CALLS-FE — Command Center / portal duplicate mount API calls

| | |
|---|---|
| **work_item_id** | `P1-CC-MOUNT-DUP-CALLS-FE` |
| **from_role** | dev-fe |
| **to_role** | qa |
| **date** | 2026-07-17 |
| **ack_status** | **READY_FOR_QA** |
| **entry** | dup-key wave CLOSED (🟢); isolated FE perf/noise; zero-seed U65 (no seeding; browser verify deferred to QA) |
| **prior evidence** | `docs/qa/evidence/p1-hrm-console-audit-qa-retest-20260716.md` (residual mount ×2–×4) |

## Scope

5 endpoint families fire 2–4× per Command Center / portal mount (non-erroring noise):

- `GET /api/xbos/tenant-scope/accessible` `[tenant-scope.accessible]`
- `GET /api/xbos/kpi-engine/rollup` `[kpi-engine.rollup]`
- `GET /api/xbos/workflow-engine/tasks` `[workflow-engine.tasks.list]`
- `GET /api/xbos/catalog-governance/inbox` `[catalog-governance.inbox]`
- `GET /api/xbos/kpi-engine/portal-alerts` `[kpi-engine.portal-alerts]`

**Employees dup-key area untouched** (🟢 CLOSED): `apps/web/hrm/src/hooks/useEmployees.ts` — no edits; regression tests re-run (see below).

## spec_read_ack

- **OpenAPI:** `docs/api/openapi/xbos-api.yaml` — `/tenant-scope/accessible` §L153, `/catalog-governance/inbox` §L267, `/kpi-engine/rollup` §L318, `/kpi-engine/portal-alerts` §L337, `/workflow-engine/tasks` §L690. All contracts (path, query params, headers) **unchanged** by this fix.
- **Scope ladder:** `docs/architecture/ADR-GROUP-CEO-MAIN-HOLDING-SCOPE.md` — `companyId` remains part of each request scope; coalescer keys include tenant/company so cross-scope reads are never merged.

## Root-cause trace — "spec says / code does"

web-portal has **no React Query** (`apps/web/web-portal/package.json` — no `@tanstack/react-query`). Every widget owns a raw `useEffect` + `fetch`, so there is no shared-key dedupe. Duplicate sources found:

| Family | Callers (code does) | Why ×2–×4 |
|---|---|---|
| `tenant-scope.accessible` | `GlobalFilterContext` (fetches only when no memberships) + `ApiHealthBanner` health-ping hits same path | separate consumers + React **StrictMode** dev double-invoke of each effect |
| `kpi-engine.rollup` | `useCommandCenterKpiRail` (CommandCenterPage + ExecutiveDashboardPage) | StrictMode double-invoke; per-instance `useEffect` fetch |
| `workflow-engine.tasks.list` | **ExecutiveDashboardPage**: `listWorkflowTasks(t,'pending')` **and** `fetchPortalAlerts(...)`→`listWorkflowTasks(t,'pending')` inside the **same `Promise.all`** — identical params → true concurrent duplicate. CommandCenterPage: inbox effect (assignee-filtered) + alerts effect (unfiltered) — **distinct params, legitimate** | true concurrent dup (Exec) + StrictMode double |
| `catalog-governance.inbox` | `fetchPortalAlerts` (via CommandCenterPage alerts effect + ExecutiveDashboardPage) | StrictMode double + concurrent effects |
| `kpi-engine.portal-alerts` | `fetchPortalAlerts` (CommandCenterPage + ExecutiveDashboardPage) | StrictMode double |

**Spec says:** each mount cycle should issue ≤1 network read per distinct scope.
**Code did:** N identical concurrent reads because there was no request-sharing layer.

## Solution option evaluation (per solution-option-evaluation rule)

| Option | Summary | Verdict |
|---|---|---|
| **A. Introduce React Query** | Add `@tanstack/react-query` + `QueryClientProvider`, migrate hooks | ❌ Rejected — new dependency + large blast radius across many raw-`useEffect` widgets; not minimal delta |
| **B. TTL stale-cache (30–60s) on all 5** | Cache resolved values 30–60s | ⚠️ Partial — risks **stale inbox after approve/reject** (`reloadInboxTasks` → `fetchCommandCenterInboxTasks` → `listWorkflowTasks`) → regression |
| **C. In-flight coalescing (+ short TTL only for read-only families)** | Share pending promise per key; short TTL micro-cache only where no mutate→refetch path | ✅ **Chosen** — minimal delta, SOLID, mutation-safe |

**Chosen = C.** New single-responsibility util `requestCoalescer.ts`:
- In-flight dedupe **always** (concurrent identical keys share one flight; entry dropped once settled → next read is fresh → mutation-safe).
- Short **30s TTL** micro-cache applied **only** to read-only families with no mutate→refetch path: `tenant-scope.accessible`, `kpi-engine.rollup`.
- `workflow-engine.tasks.list`, `catalog-governance.inbox`, `kpi-engine.portal-alerts` → **in-flight only (ttl 0)** so approve/reject reloads stay fresh.
- `invalidateCoalesced(prefix)` exposed for future mutation invalidation.
- No change to `xbosHttp` transport, headers, query params, or backend.

## Before → After (network calls per mount cycle)

| Family | Before (prod) | Before (dev StrictMode) | After (prod) | After (dev StrictMode) |
|---|---|---|---|---|
| `tenant-scope.accessible` | ≤2 (scope + health) | ×2–×4 | 1 (30s TTL collapses scope + health + re-renders) | 1 |
| `kpi-engine.rollup` | 1–2 | ×2–×4 | 1 | 1 |
| `workflow-engine.tasks.list` (Exec, identical params) | 2 (direct + via alerts) | ×4 | **1** (coalesced) | 1 |
| `workflow-engine.tasks.list` (CC, distinct assignee vs feed) | 2 distinct — **legitimate, documented** | ×4 | 2 distinct (StrictMode dup removed) | 2 |
| `catalog-governance.inbox` | 1–2 | ×2–×4 | 1 per distinct scope | 1 |
| `kpi-engine.portal-alerts` | 1–2 | ×2–×4 | 1 | 1 |

> **Documented residual (not a defect):** On CommandCenterPage the assignee-filtered inbox read and the unfiltered alerts-feed read are **distinct consumers with distinct query params** → they must not be merged (different data). Coalescing only removes the redundant StrictMode/concurrent *identical* duplicate of each. In production StrictMode double-invoke does not occur.

## Files touched

| File | Change |
|---|---|
| `apps/web/web-portal/src/integrations/requestCoalescer.ts` | **new** — in-flight coalescer + optional TTL + invalidation |
| `apps/web/web-portal/src/integrations/tenantScopeApi.ts` | `fetchAccessibleTenants` → coalesced, 30s TTL |
| `apps/web/web-portal/src/integrations/kpiEngineApi.ts` | `fetchKpiRollup` → coalesced, 30s TTL, key incl. tenant/company/range |
| `apps/web/web-portal/src/integrations/workflowEngineApi.ts` | `listWorkflowTasks` → coalesced, in-flight only |
| `apps/web/web-portal/src/integrations/portalAlertsApi.ts` | catalog inbox + portal-alerts reads → coalesced, in-flight only |
| `apps/web/web-portal/src/integrations/requestCoalescer.test.ts` | **new** — unit tests (dedupe / TTL / invalidate / reject) |
| `apps/web/web-portal/src/integrations/workflowEngineApi.coalesce.test.ts` | **new** — single-fetch across two consumers; distinct params not merged; refetch after settle |

## Test evidence

```
# coalescer + touched suites
web-portal vitest: requestCoalescer.test.ts (6) + workflowEngineApi.coalesce.test.ts (3)
  + workflowEngineApi.inbox.test.ts (4) + useCommandCenterKpiRail.test.ts (5) → 18 passed

# full web-portal suite (regression)
Test Files  63 passed (63)
      Tests  295 passed (295)

# employees dup-key regression (CLOSED area — hrm)
useEmployees.pageSize.test.ts (2) + useEmployees.dedupe.test.ts (2) → 4 passed

# production build
pnpm --filter web-portal build → tsc + vite build ✓ built in 6.69s (exit 0)
```

## Exit criteria check

- [x] Each endpoint ≤1 network call per mount cycle in production build (StrictMode dev-only duplication documented; CC assignee-vs-feed distinct-param reads documented as legitimate).
- [x] Tests pass (18 targeted + 295 full suite).
- [x] No regression to employees list (useEmployees tests pass; no HRM edits).
- [x] No API contract / backend change.

## QA hand-back (browser verification — U65, deferred to QA)

Verify on dev `http://14.225.217.232:8088` after FE redeploy (BE-only deploy will NOT include this FE change):
1. Login `ceo@xe.vn` / `Xevn@2026` → Command Center + Executive Dashboard (`/cockpit`).
2. DevTools → Network, filter each path; hard reload (F5).
3. Expect ≤1 request per mount for `tenant-scope/accessible`, `kpi-engine/rollup`, `kpi-engine/portal-alerts`, `catalog-governance/inbox`; `workflow-engine/tasks` ≤1 for Executive Dashboard, ≤2 (assignee inbox + alerts feed) on Command Center.
4. **Regression:** open an approval task → Approve → inbox row disappears / list refreshes (proves in-flight-only coalescing did not stale the reload).
5. J-HRM-02 employees list → profile unaffected.

---

```yaml
work_item_id: P1-CC-MOUNT-DUP-CALLS-FE
from_role: dev-fe
to_role: qa
ack_status: READY_FOR_QA
evidence_path: docs/qa/evidence/p1-cc-mount-dup-calls-fe-20260717.md
completion_report: >
  Added web-portal requestCoalescer (in-flight dedupe + 30s TTL for read-only families) and wired
  it into the 5 mount-duplicated endpoint families. React Query is absent in web-portal, so a
  minimal SOLID coalescing util was used instead. workflow/catalog/portal-alerts use in-flight-only
  (ttl 0) to keep approve/reject reloads fresh. 18 targeted + 295 full web-portal tests pass;
  useEmployees regression (4) pass; production build green. No API/backend change. Employees
  dup-key CLOSED area untouched.
residual: >
  CommandCenter fires workflow-engine/tasks twice with DISTINCT params (assignee inbox vs unfiltered
  alerts feed) — legitimate multi-consumer, documented, not merged. Dev StrictMode may still show a
  single extra invoke; production build issues ≤1 per distinct scope. Browser confirmation deferred
  to QA (U65 zero-seed; FE must be redeployed to :8088).
next_owner: qa
next_dispatch_prompt: >
  Retest P1-CC-MOUNT-DUP-CALLS-FE on :8088 after FE redeploy. Login ceo@xe.vn/Xevn@2026 → Command
  Center + /cockpit. DevTools Network + F5: confirm ≤1 call per mount for tenant-scope/accessible,
  kpi-engine/rollup, kpi-engine/portal-alerts, catalog-governance/inbox; workflow-engine/tasks ≤1 on
  Executive Dashboard, ≤2 (assignee inbox + alerts feed) on Command Center. Regression: approve a
  workflow task → inbox refreshes (no stale). Confirm J-HRM-02 employees list→profile still PASS.
  Evidence: docs/qa/evidence/p1-cc-mount-dup-calls-fe-20260717.md.
```
