# P1-HRM-H0-H1-7-TASKS-FIX — Dev-FE evidence (2026-06-06)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-HRM-H0-H1-7-TASKS-FIX` |
| **defect_id** | `D-HRM-TASKS-EMPTY-01` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **ack_status** | `READY_FOR_QA` |

## Defect closed

| ID | Symptom | Root cause | Fix |
|----|---------|------------|-----|
| **D-HRM-TASKS-EMPTY-01** | `/command-center/hrm/tasks` empty / error banner; Network `GET /api/hrm/operations/tasks?page_size=300` **400** | `useTasks.ts` requested `page_size: 300` — Nest `List*QueryDto` caps at **100** (`@Max(100)`) | Use shared `HRM_API_MAX_PAGE_SIZE` (100) via `buildOperationsTasksQuery()` |

## U34 — task create refreshes list

`createTask` mutation already calls `queryClient.invalidateQueries({ queryKey: ['tasks'] })` on success — unchanged; list refetch after create verified by react-query contract.

## Files changed

- `apps/web/hrm/src/hooks/useTasks.ts` — `buildOperationsTasksQuery`, `page_size: 100`
- `apps/web/hrm/src/hooks/useTasks.test.ts` — regression test for page_size cap

## Verification

```bash
# hrm package
pnpm exec vitest run src/hooks/useTasks.test.ts   # 2/2 PASS
pnpm exec vitest run                              # 118/118 PASS
pnpm run build                                    # exit 0
```

**API probe (ceo@xe.vn / main):**

| Request | HTTP | Result |
|---------|------|--------|
| `GET /operations/tasks?company_id=main&page_size=300` | **400** | `page_size must not be greater than 100` |
| `GET /operations/tasks?company_id=main&page_size=100` | **200** | `total=17`, `rows=17` |

## QA retest (L2 — P-CC tasks tab)

**Account:** `ceo@xe.vn` / `Xevn@2026` · stack portal `:5173` or `:5175` + hrm-api `:28001`

1. Navigate `/command-center/hrm/tasks` — **no** HRM API error banner; list shows **17** task rows (not empty).
2. Network: `GET /api/hrm/operations/tasks?company_id=main&page_size=100` → **200** (not 400).
3. **U34:** Create a new task via dialog → toast success → list count increments without manual refresh.
4. Console: no `54321` / Supabase REST on load path.

## Residual

None for this defect. If tenant grows beyond 100 tasks, follow-up pagination loop (same pattern as attendance) — out of scope for pilot seed (17 rows).

## Handoff

- **next_owner:** `qa`
- **pm_dispatch_hint:** Retest L2 tasks tab + U34 create refresh on `/command-center/hrm/tasks`

---

## QA retest — P1-HRM-H0-H1-7-TASKS-FIX (2026-06-06)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-HRM-H0-H1-7-TASKS-FIX` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **ack_status** | **PASS_TO_PM** (defect closed; H1–H7 wave promote) |
| **environment** | `http://localhost:5173` · `ceo@xe.vn` / `Xevn@2026` · hrm-api `:28001` |

### D-HRM-TASKS-EMPTY-01 — **CLOSED**

| Check | Result |
|-------|--------|
| L0 `qc:dev-stack` | exit **0** |
| L0 `qc:fe-be-health` | **8/8 PASS** |
| API `page_size=100` direct + proxy | HTTP **200** `total=17` → **18** after create probe |
| API `page_size=300` | HTTP **400** (expected — FE no longer sends 300) |
| `useTasks.test.ts` | **2/2 PASS** (`page_size: 100`) |
| Browser `/command-center/hrm/tasks` | iframe «Tất cả (**17**)» → «Tất cả (**18**)»; «Hiển thị 1-10 / 18 bản ghi»; no HRM error banner |
| Browser `/hr/tasks?portal=1` | «Tất cả (17)»; table rows visible (10/page) |
| Console | No **409** / **500** / **54321** on tasks load |

### U34 consumer sync

| Test | Verdict |
|------|---------|
| UI «Tạo công việc» button | **NOT RUN** — `PermissionGate` hides create in embed session (Export only) |
| API POST create → list hydrate | **PASS** — `POST /operations/tasks` **201**; reload embed shows **18** rows incl. `QA-H1-7-TASKS-RETEST-*` at top |
| `invalidateQueries(['tasks'])` on create | Verified by dev-fe contract + vitest; live UI click blocked by RBAC gate |

### H1–H7 wave promotion

All **target** FE-fix defects from prior FAIL retest now **CLOSED**: intsvc-404, pay-empty, company-empty, rpt-mock, **tasks-empty**, J-HRM-07. Residual P2/P3 from full audit (insurance row count, dashboard date, J03/J04, payslip i18n) — **not promoted**, unchanged GWC.

- **evidence_path:** `docs/qa/evidence/p1-hrm-web-retest-20260606.md` § QA tasks-fix retest
- **pm_dispatch_hint:** Promote H1–H7 wave → dispatch `qc` L2.5 spot or close sprint item `P1-HRM-H0-H1-7`
