# D-DASH-FE-STORM — Dashboard FE storm & summary wiring

| Field | Value |
|-------|-------|
| **work_item_id** | `D-DASH-FE-STORM` |
| **date** | 2026-07-17 |
| **from_role** | dev-fe |
| **to_role** | qa |
| **entry** | `docs/qa/evidence/p1-hrm-menu-dashboard-20260717.md` FAIL residuals D-DASH-02..05 |
| **spec_ref** | `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md` §2.1 `dashboard` · UC-HRM-20 |
| **U65** | zero-seed · fix is FE code only; no DB/seed touched |
| **ack_status** | **READY_FOR_QA** |
| **flag** | 🟡 → pending QA browser re-verify on Dev8088 |

---

## Scope closed (FE)

| # | Residual | Fix | Files |
|---|----------|-----|-------|
| D-DASH-02 (item 1) | UC-HRM-20 `PortalOperationsSummary` not mounted → `GET /operations/reports/summary` **0 calls** | Mounted `<PortalOperationsSummary />` on Dashboard (renders **"Tổng quan HRM (UC-HRM-20)"** + calls `operations/reports/summary` in embed API mode) | `pages/Dashboard.tsx` |
| D-DASH-03 (item 2) | `contracts` **×23** storm on dashboard mount | `useExpiringContractsDashboard` now calls the dedicated aggregate `GET /contracts-insurance/contracts/expiring?days=30` = **1 request** (was `listAllEmployeeContracts` paginating the full active collection). Shared RQ key keeps Dashboard count + `ExpiringContractsAlert` on a **single** fetch. | `hooks/useExpiringContractsDashboard.ts` |
| D-DASH-03 (item 2) | `employees` **×12** storm | Working-tree Dashboard already reads `useEmployeesSummary` (**1** `/employees/summary` call, shared RQ key). `PortalOperationsSummary` was issuing a **second** summary request (`include_archived:true`, different key) — now coalesced to the same key = still **1** summary call after mounting UC-HRM-20 tile. No `listAllEmployees` mounted on the dashboard. | `components/dashboard/PortalOperationsSummary.tsx` |
| D-DASH-04 (item 3) | `leave-requests` **21315 ms** | Verified non-blocking: dashboard paints via React Query async state (defaults to `[]`), no duplicate leave-requests call on mount. Latency is **BE-bound** (server-side leave-requests scan on 1000+ NV, no status filter). See "BE-bound" below. | (no FE regression; documented) |
| D-DASH-05 (item 4) | `TỔNG LƯƠNG / thuế / BH` shows fake **0 VNĐ** | Payroll tiles are summary-bound: **skeleton** while `/employees/summary` loads, **`—`** when it errors/unavailable, real value only when `payrollSummaryReady`. No fake `0` when the aggregate is missing. | `pages/Dashboard.tsx` |

---

## Storm before / after (dashboard mount)

| Endpoint | Before (QA evidence) | After (FE working tree) |
|----------|---------------------:|------------------------:|
| `/contracts-insurance/contracts` (list, paginated) | **23** | **0** |
| `/contracts-insurance/contracts/expiring` | 0 | **1** |
| `/employees` (list, paginated) | **12** | **0** |
| `/employees/summary` | 0¹ | **1** (shared by Dashboard + UC-HRM-20 tile) |
| `/operations/reports/summary` | **0** | **1** (UC-HRM-20 now mounted) |
| `/attendance/leave-requests` | 1 (21s) | 1 (non-blocking; BE-bound) |

¹ Live QA showed `/employees` pagination because the deployed :8088 bundle predates the summary route order fix; working tree already uses `useEmployeesSummary`.

---

## BE-bound residuals (not FE fixable — do not block this handoff)

1. **`GET /employees/summary` 500 on live** (`invalid input syntax for type uuid: "summary"`) — route-order/deploy. Tracked by **D-DASH-01** (BE, dispatched separately). Until deployed, payroll tiles render `—` (not fake 0) by design.
2. **`leave-requests` 21.3s** — server-side latency on 1000+ NV with no status scoping. Recommend BE: index on `(company_id, status, start_date)` and/or expose pending-leave count via `operations/reports/summary` so the dashboard can drop the full-collection read. FE already keeps this call off the paint path.

---

## Verification (dev-fe)

| Gate | Result |
|------|--------|
| `vitest run` — perf-fe-04 keys, leave-requests-data, formatHrmDate, contracts binding | **PASS** (8 tests) |
| `vite build` (production bundle) | **PASS** — `✓ built in 49.75s`, exit 0 |
| ESLint on changed files | **PASS** (no lint errors) |
| `tsc -p tsconfig.app.json` | Pre-existing repo-wide errors only; **no new** errors from changed files. The 2 `Dashboard.tsx` errors (`attendance status === 'approved'`) are **pre-existing** (unrelated to this change; build uses `vite build`). |

Changed files:
- `apps/web/hrm/src/pages/Dashboard.tsx`
- `apps/web/hrm/src/hooks/useExpiringContractsDashboard.ts`
- `apps/web/hrm/src/components/dashboard/PortalOperationsSummary.tsx`

---

## QA re-verify (U65 · browser-only, Dev8088)

Persona `ceo@xe.vn` / `Xevn@2026` · `company_id=main` · URL `http://14.225.217.232:8088/command-center/hrm/dashboard`

1. Login → rail **NHÂN SỰ** → **Tổng quan**; open DevTools Performance/Network before re-click.
2. Assert card **"Tổng quan HRM (UC-HRM-20)"** renders and Network shows **1×** `/operations/reports/summary`.
3. Assert `/contracts-insurance/contracts` (list) **not** stormed (expect the single `.../expiring` call instead); `/employees` list **not** stormed.
4. Payroll tiles: while summary pending → skeleton; if BE summary still 500 → tiles show `—` (not `0 VNĐ`); after D-DASH-01 deploy → real totals.
5. F5 / iframe reload → counts stable, no ERROR banner / 409 / 54321.

> Note: full green on tiles 2/4 depends on **D-DASH-01** (BE summary route) being deployed to :8088.

---

## Handoff

- **completion_report:** FE closed D-DASH-02..05: UC-HRM-20 summary card mounted (`operations/reports/summary` now consumed), contracts×23 + employees×12 mount storm removed (single aggregate/summary calls, shared RQ keys), payroll tiles no longer fake `0 VNĐ` (skeleton/`—`/value), leave-requests kept off paint path. Residual is BE-bound (D-DASH-01 summary 500 deploy + leave-requests latency).
- **next_owner:** qa
- **next_dispatch_prompt:**
  ```
  work_item_id: D-DASH-QA-RETEST
  from_role: pm | to_role: qa
  entry: docs/qa/evidence/d-dash-fe-storm-20260717.md (dev-fe READY_FOR_QA)
  U65 browser-only · Dev8088 · ceo@xe.vn / Xevn@2026 · company_id=main
  URL: http://14.225.217.232:8088/command-center/hrm/dashboard
  Verify:
   1) Card "Tổng quan HRM (UC-HRM-20)" renders; Network shows 1× /operations/reports/summary
   2) No contracts×N / employees×N storm on mount (expect 1× .../contracts/expiring; 1× /employees/summary)
   3) Payroll tiles: skeleton while loading; "—" if BE summary still 500; real totals once D-DASH-01 deployed (no fake 0 VNĐ)
   4) leave-requests does not block paint; F5 → no ERROR banner / 409 / 54321
  exit: PASS_TO_PM or FAIL_TO_PM with screenshots + Network counts
  note: tiles 2/4 full-green gated on BE D-DASH-01 (/employees/summary 500 deploy). Report BE-bound separately, do not fail FE for it.
  evidence: docs/qa/evidence/d-dash-qa-retest-20260717.md
  ```
- **evidence_path:** `docs/qa/evidence/d-dash-fe-storm-20260717.md`
- **ack_status:** READY_FOR_QA
