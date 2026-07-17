# R-DASH-PAYROLL-CHART-0-DEPLOY (+ R-DEPT-FETCH-X2) — DevOps deploy evidence

| Field | Value |
|-------|-------|
| **work_item_id** | `R-DASH-PAYROLL-CHART-0-DEPLOY` (+ `R-DEPT-FETCH-X2`) |
| **date** | 2026-07-17 |
| **owner** | devops |
| **target** | `http://14.225.217.232:8088` |
| **U65** | zero-seed — **no** `pnpm seed:*` / inbox seed / DB fake |
| **phase1_done_claim** | **NO** |
| **prod_ready_claim** | **NO** |
| **ack_status** | **READY_FOR_QA** |

---

## Commits deployed

| SHA | Message |
|-----|---------|
| `7563c4d` | fix(hrm): honest payroll chart empty-state + department GET coalesce |

**VPS HEAD:** `7563c4d1c2a07b283bf2b77aa45cd09d0b487b4e` (`git pull origin main` fast-forward from `397ac81`).

### Allow-list (committed + pushed)

- `apps/web/hrm/src/lib/dashboardPayrollChart.ts`
- `apps/web/hrm/src/lib/dashboardPayrollChart.test.ts`
- `apps/web/hrm/src/pages/Dashboard.tsx`
- `apps/web/hrm/src/lib/hrmDepartmentCatalog.ts`
- `apps/web/hrm/src/lib/hrmDepartmentCatalog.test.ts`
- `apps/web/hrm/src/components/company/DepartmentManagement.tsx`
- `docs/qa/evidence/r-dash-payroll-chart-0-dept-x2-20260717.md`

Unrelated dirty lanes (xbos auth, leave-workflow, portal auth session, …) **not** scooped.

Dev-FE evidence: `docs/qa/evidence/r-dash-payroll-chart-0-dept-x2-20260717.md`

---

## Commands (VPS)

```bash
cd /opt/xevn-ecosystem
git stash -u || true
git fetch origin main
git pull origin main   # → 7563c4d
node scripts/merge-vps-port-env.mjs --apply-canonical

cd deploy/xevn-ecosystem
docker compose --env-file .env up -d --build --no-deps --force-recreate \
  portal-fe hrm-fe
```

### Services recreated

| Container | StartedAt (UTC) | Status | Ports |
|-----------|-----------------|--------|-------|
| `xevn-portal-fe-dev` | `2026-07-17T04:01:08.970Z` | running | `8088→5173` |
| `xevn-hrm-fe-dev` | `2026-07-17T04:01:08.732Z` | running | `8080→8080` |

Non-xevn left running. **No** `docker compose down`. **No** seed.

---

## Smoke results

| Check | Result |
|-------|--------|
| `GET http://14.225.217.232:8088/` | **200** |
| `GET http://14.225.217.232:8088/command-center` | **200** |
| `GET http://14.225.217.232:8088/command-center/hrm` | **200** |
| `GET http://14.225.217.232:8088/command-center/hrm/dashboard` | **200** |
| `GET http://14.225.217.232:8088/command-center/hrm/company` | **200** |
| `GET http://127.0.0.1:8088/` (on VPS) | **200** |
| `GET http://127.0.0.1:8088/command-center/hrm/dashboard` | **200** |
| `GET http://127.0.0.1:8088/command-center/hrm/company` | **200** |
| `GET http://127.0.0.1:8080/` (on VPS) | **302** (SPA redirect — OK) |
| Seed used | **none** |

### Bind-mount source proof (VPS HEAD `7563c4d`)

| Marker | Result |
|--------|--------|
| `apps/web/hrm/src/lib/dashboardPayrollChart.ts` | **PRESENT** |
| `hasEmployeeSalaryAggregate` in `Dashboard.tsx` | **2** |
| `dashboard-payroll-chart-empty` in `Dashboard.tsx` | **1** |
| `COMPANY_DEPARTMENTS_QUERY_KEY` in `DepartmentManagement.tsx` | **2** |
| `staleTime` in `DepartmentManagement.tsx` | **1** |
| `companyDepartmentsInflight` coalesce in `hrmDepartmentCatalog.ts` | **PRESENT** (R-DEPT-FETCH-X2 comment + Map) |

---

## Residual / not claimed

- L0 HTTP 200 only — **not** browser AC (no fake 0 VNĐ; departments GET ×1).
- **Not** Phase 1 DONE / PROD-READY.
- Browser QA still required under U65 (zero-seed).

---

## Handoff

| Field | Value |
|-------|-------|
| **ack_status** | `READY_FOR_QA` |
| **next_owner** | `qa` |
| **evidence_path** | `docs/qa/evidence/r-dash-payroll-chart-0-dept-x2-deploy-20260717.md` |
| **next_dispatch_prompt** | Light browser QA on `http://14.225.217.232:8088` — Dashboard «Tổng hợp lương» no fake 0 VNĐ when no salary aggregate (`data-testid=dashboard-payroll-chart-empty`); UC-HRM-20 Kỳ lương tile OK; Phòng ban `GET /departments` ×1 (coalesce + React Query); U65 no seed; evidence `docs/qa/evidence/r-dash-payroll-chart-0-dept-x2-qa-20260717.md`; VPS HEAD `7563c4d` |
