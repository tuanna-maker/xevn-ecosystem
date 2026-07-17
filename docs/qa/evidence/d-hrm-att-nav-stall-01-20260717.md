# D-HRM-ATT-NAV-STALL-01 — Soft-nav leave Attendance stalls (FE fix)

- **Date:** 2026-07-17
- **work_item_id:** `D-HRM-ATT-NAV-STALL-01`
- **owner:** `dev-fe`
- **ack_status:** `READY_FOR_QA`
- **spec_ref:** QA W2 evidence `docs/qa/evidence/p1-hrm-scale-qa-w2-20260717.md` § NEW DEFECT; J-HRM-02; P1-HRM-PERF-FE-01 soft-nav (no iframe remount)
- **U65:** zero-seed (no seed in this wave)
- **NOT claimed:** Phase 1 DONE / PROD-READY / W1 regression closed by this file alone

---

## Defect

Soft-navigate **away from** Attendance (Chấm công → Nhân sự / Hợp đồng): portal URL + iframe `window.location` update to `/hr/employees` or `/hr/contracts`, but **Outlet stays on Attendance Overview** until hard F5. **0** new network while stuck. Navigating **into** attendance and employees↔contracts OK.

## Root cause

1. **Primary:** HRM `BrowserRouter` had `future.v7_startTransition: true`. With that flag, React Router defers location `setState` inside `React.startTransition`. History/URL updates immediately; matched routes/`useLocation` stay on the previous page until the transition commits. Heavy Attendance (Recharts + large tree) can starve/delay that commit indefinitely → URL moved, view stuck, no Employees mount/fetch.
2. **Secondary:** Soft-nav called `navigate(path)` which **dropped** embed search (`portal`, `companyId`, `tenantId`, `_v`) — unsafe for Scale W1 `embedScopeKey` / `_v` stability even when sessionStorage kept portal mode.

`flushSync(() => navigate(...))` alone is **not** sufficient on BrowserRouter: the history listener still wraps `setState` in `startTransition` when the flag is on.

## Fix (minimal)

| File | Change |
|------|--------|
| `apps/web/hrm/src/App.tsx` | Remove `v7_startTransition` (keep `v7_relativeSplatPath`). Comment documents D-HRM-ATT-NAV-STALL-01. |
| `apps/web/hrm/src/lib/portalEmbedSoftNavigate.ts` | New helper: preserve `search`, `flushSync` + `navigate(..., { flushSync: true })`. |
| `apps/web/hrm/src/components/layout/PortalEmbedRouterSync.tsx` | Wire bridge → `applyPortalEmbedSoftNavigate` via `locationRef` (always latest search). |

**Not changed (must_keep):** `HrmWorkspaceRoute` iframe `key={embedScopeKey}` / locked `src` / postMessage soft-nav; `useEmployeesPage` / profile RQ dedupe; employees↔contracts soft-nav path.

## Tests

```text
pnpm exec vitest run \
  src/lib/portalEmbedSoftNavigate.test.ts \
  src/lib/portalEmbedNavBridge.test.ts \
  src/components/layout/PortalEmbedRouterSync.test.ts
→ 7 passed
```

Coverage: leave attendance → employees/contracts with embed QS preserved; bridge origin guard unchanged.

## QA retest (browser, U65)

Env: pilot `:8088` or local portal+HRM after FE deploy. Persona: `ceo@xe.vn` / BOD / `main`.

| # | Click path | Expect |
|---|------------|--------|
| 1 | Employees → Contracts → **Attendance** → **Nhân sự** | Employees list renders **without F5**; ≥1 `GET /employees?...page=1` after leave; body ≠ Attendance «Đi muộn, về sớm» |
| 2 | Attendance → **Hợp đồng** | Contracts renders without F5; contracts list network fires |
| 3 | Repeat #1 once more | Same PASS (2× leave directions) |
| 4 | J-HRM-02 smoke | list→profile→back; `_v` / iframe element stable; soft-nav Nhân sự ↔ Hợp đồng still OK |

**cấm:** seed · claim Phase 1/PROD · remount iframe on every path change

---

## Handoff

- `completion_report`: Soft-nav leave Attendance stall fixed — disabled HRM `v7_startTransition`; portal soft-nav preserves embed QS via `applyPortalEmbedSoftNavigate`. Vitest 7 PASS. No iframe remount; W1 picker/profile paths untouched.
- `next_owner`: `qa`
- `ack_status`: `READY_FOR_QA`
- `evidence_path`: `docs/qa/evidence/d-hrm-att-nav-stall-01-20260717.md`
- `pm_dispatch_hint`: QA retest soft-nav leave Attendance ×2 + J-HRM-02 smoke

### next_dispatch_prompt

```text
work_item_id: D-HRM-ATT-NAV-STALL-01
from_role: pm
to_role: qa
subagent_type: qa

Retest D-HRM-ATT-NAV-STALL-01 after FE fix (v7_startTransition off + preserve embed QS soft-nav).
entry_criteria: FE deploy with PortalEmbedRouterSync + App.tsx change; L0 stack; U65 zero-seed; browser-only
exit_criteria:
  1) Soft-nav Attendance → Nhân sự: Employees UI without F5; employees GET fires; not stuck on Overview
  2) Soft-nav Attendance → Hợp đồng: Contracts UI without F5
  3) Repeat leave directions ×2
  4) J-HRM-02 smoke: list→profile→back; _v/iframe stable; employees↔contracts soft-nav PASS
evidence_path: docs/qa/evidence/d-hrm-att-nav-stall-01-qa-20260717.md
ack_status: PASS_TO_PM or FAIL_TO_PM
cấm: seed · Phase 1/PROD claim
```
