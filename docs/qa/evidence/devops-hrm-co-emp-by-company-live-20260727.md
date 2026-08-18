# D-HRM-CO-EMP-COUNT-DO-RESTART-01 — live `by_company` on :28001

| Field | Value |
|-------|-------|
| **work_item_id** | `D-HRM-CO-EMP-COUNT-DO-RESTART-01` |
| **role** | devops |
| **date** | 2026-07-27 |
| **ack_status** | **PASS_TO_PM** |
| **constraints** | U65 zero-seed · HOLD_DEPLOY (:8088 untouched) · freeze entrypoint `dist-uat-w6` retained with update note |

## Goal

Ensure live `hrm-api` on `:28001` serves code where `GET /api/hrm/employees/summary?company_id=main` returns `data.by_company` (Plane B, length 5).

## Baseline (before)

| Check | Result |
|-------|--------|
| Listener | PID serving `node --enable-source-maps dist-uat-w6/main.js` on `:28001` |
| Freeze artifact | `apps/api/hrm-api/dist-uat-w6` — **no** `by_company` in `employees.service.js` |
| Freeze note | `D-HRM-LEAVE-REQ-CREATE-BE-01` @ 2026-07-27T09:39:03+07:00 |
| Probe | Login XBOS `ceo@xe.vn` → GET summary → HTTP **200** `HRM-EMP-SUMMARY-200` |
| `data.by_company` | **ABSENT** (keys: company_id, total, active_count, … by_department, …) |

## Actions executed

1. Confirmed source already implements `by_company` (`employees.service.ts` + `employee-summary.ts`); compiled freeze did not.
2. `pnpm --filter hrm-api run build` → `dist/` contains `by_company AS (` CTE + `buildEmployeeSummaryByCompany`.
3. Synced `dist` → `dist-uat-w6` via `robocopy /E /IS /IT` (hash match on `employees.service.js`).
4. **Did not wipe freeze without note** — updated `dist-uat-w6/FREEZE_UPDATE_NOTE.md` with this work_item + prior leave freeze lineage.
5. Stopped old listener; restarted:
   - `node --enable-source-maps <abs>/dist-uat-w6/main.js`
   - cwd `apps/api/hrm-api`
   - env from `deploy/xevn-ecosystem/.env` + `apps/api/hrm-api/.env`
   - `HRM_BE_PORT=28001` / `PORT=28001`
6. No seed. No remote / `:8088` deploy.

## After probe

| Check | Result |
|-------|--------|
| Health | `GET http://127.0.0.1:28001/api/hrm/` → **200** |
| Login | `POST :28002/api/xbos/auth/login` `ceo@xe.vn` → **201** `XBOS-AUTH-200` |
| Summary | `GET :28001/api/hrm/employees/summary?company_id=main` → **200** `HRM-EMP-SUMMARY-200` |
| `data.by_company.length` | **5** |
| Slugs | `holding`, `trsport`, `logistics`, `finance`, `services` |
| Sample totals | holding 229 · trsport/logistics/finance/services 220 each |
| Live CMD | `node --enable-source-maps …/dist-uat-w6/main.js` |
| Live PID | recorded in `dist-uat-w6/.SPONSOR_UAT_PID` |

## Stack gate

```text
pnpm run qc:fe-be-health
=== Summary: ALL PASS ===
exit 0
```

(hrm-api, xbos-api, portal :5173, login, employees, catalog-sync, portal proxies)

## Freeze note (excerpt)

- `work_item_id: D-HRM-CO-EMP-COUNT-DO-RESTART-01`
- `prior_freeze: D-HRM-LEAVE-REQ-CREATE-BE-01` (leave create / G-AT10-01 / inbox slug→UUID)
- Entrypoint remains **`dist-uat-w6`** (not nest `--watch`)
- HOLD_DEPLOY: `:8088` not touched

## Residual

- FE may still use interim N× slug calls until QA promotes single-summary Network path — API contract is now live.
- First `Start-Process` with redirected stdio to polluted log failed once; successful start used absolute entry path + inherited env (no redirect hang). Prefer relative argv on Unicode paths per prior W6 lesson if Start-Process flaky.

## Handoff

- `ack_status`: **PASS_TO_PM**
- `next_owner`: **qa** (retest company card can use summary `by_company`; optional promote off interim)
- `evidence_path`: `docs/qa/evidence/devops-hrm-co-emp-by-company-live-20260727.md`
