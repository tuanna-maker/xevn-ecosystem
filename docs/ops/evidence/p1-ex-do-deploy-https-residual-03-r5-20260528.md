# P1-EX-DO-DEPLOY-HTTPS-RESIDUAL-03-R5 — HRM FE R5 pilot deploy

| Field | Value |
|---|---|
| work_item_id | `P1-EX-DO-DEPLOY-HTTPS-RESIDUAL-03-R5` |
| from_role | `devops` |
| to_role | `qa` |
| date | `2026-05-28` |
| pilot_url | `https://14-225-217-232.nip.io` |
| attendance_url | `https://14-225-217-232.nip.io/hr/attendance?portal=1&companyId=main` |
| handoff_fe | `docs/qa/evidence/p1-ex-fe-be-https-residual-03-r5-20260528.md` |
| prior_qa_fail | `docs/qa/evidence/p1-ex-qa-https-residual-03-r5-20260528.md` (`fallbackAllCount=8` — FE not deployed) |
| commit | `none` (pscp sync, no git commit) |

---

## Build / deploy timestamps

| Marker | Timestamp (UTC) | Notes |
|---|---|---|
| Source sync complete (`hrmDataMode.ts` mtime on VPS) | `2026-05-28T16:28:42Z` | `stat` on VPS after `pscp` |
| `supabaseRestGuard.ts` synced | `2026-05-28T16:28:44Z` | VPS `stat` |
| `xevn-hrm-fe-dev` container recreated | `2026-05-28T16:29:30.836733161Z` | `docker inspect` |
| Vite dev server ready | `2026-05-28T16:29:31Z` (approx) | Log: `VITE v5.4.21 ready in 488 ms` |

---

## Steps executed

1. Read runbooks (`devops-deploy` skill, `PRODUCTION_ENABLE_RUNBOOK`, prior deploy evidence).
2. Synced R5 HRM FE patch files from local workspace → VPS `/opt/xevn-ecosystem` via `pscp` (12 files).
3. Verified R5 markers on VPS bind mount:
   - `grep -c isRemoteLocalhostSupabaseMisconfig` → `2` in `hrmDataMode.ts`
   - `grep -c shouldBlockSupabaseRest` → `1` in `supabaseRestGuard.ts`
4. Recreated `hrm-fe` only: `docker compose --env-file .env up -d --force-recreate hrm-fe` (no `compose down`, no non-xevn containers touched).
5. Waited for Vite boot; confirmed no import errors in container logs.

### Files synced

```
apps/web/hrm/src/lib/hrmDataMode.ts
apps/web/hrm/src/integrations/supabase/supabaseRestGuard.ts
apps/web/hrm/src/integrations/supabase/client.ts
apps/web/hrm/src/hooks/useDepartments.ts
apps/web/hrm/src/hooks/useWorkShifts.ts
apps/web/hrm/src/hooks/useAttendanceRules.ts
apps/web/hrm/src/hooks/useAttendanceSheets.ts
apps/web/hrm/src/hooks/useLeaveRequests.ts
apps/web/hrm/src/hooks/useLeaveRequestsData.ts
apps/web/hrm/src/hooks/useAttendanceOverview.ts
apps/web/hrm/src/hooks/useAttendanceReports.ts
apps/web/hrm/src/components/attendance/AttendanceExportDialog.tsx
```

---

## Gate results

| Gate | Result | Evidence |
|---|---|---|
| VPS safety (no compose down) | PASS | Targeted `--force-recreate hrm-fe` only |
| R5 source on VPS | PASS | Marker grep counts + file mtimes above |
| L0 `http://127.0.0.1:8080/hr/` | PASS | HTTP `200` |
| L0 `https://14-225-217-232.nip.io/hr/` | PASS | HTTP `200` |
| L0 `https://14-225-217-232.nip.io/api/hrm/` | PASS | HTTP `200` |
| Attendance route HTTPS load | PASS | `https://…/hr/attendance?portal=1&companyId=main` → HTTP `200` |
| Vite boot | PASS | `VITE v5.4.21 ready in 488 ms` |
| **L2.5 fallbackAllCount=0** | **NOT RUN** (QA owner) | Requires browser `performance` probe per FE handoff |

---

## Smoke outputs

```text
grep isRemoteLocalhostSupabaseMisconfig count: 2
grep shouldBlockSupabaseRest count: 1
hr_local:200
hr_https:200
attendance_https:200
hrm_api_https:200
vite: VITE v5.4.21 ready in 488 ms
container_started: 2026-05-28T16:29:30.836733161Z
```

---

## completion_report

- **Closed scope:** Deployed P1-EX-FE-BE-HTTPS-RESIDUAL-03-R5 HRM web bundle (`supabaseRestGuard`, `hrmDataMode` remote-host block, attendance hooks, export dialog) to HTTPS pilot VPS; recreated `xevn-hrm-fe-dev`; L0 HTTPS smoke green for `/hr/`, attendance route, and `/api/hrm/`.
- **Residual:** Live `fallbackAllCount=0` before/after **Kiểm tra lại** not verified by DevOps (QA mandatory browser probe). Hard refresh / cache-bust may be needed on first QA pass after deploy.

---

## Handoff packet

```yaml
work_item_id: P1-EX-DO-DEPLOY-HTTPS-RESIDUAL-03-R5
from_role: devops
to_role: qa
ack_status: READY_FOR_QA
evidence_path: docs/ops/evidence/p1-ex-do-deploy-https-residual-03-r5-20260528.md
next_owner: qa
next_dispatch_prompt: >
  work_item_id: P1-EX-QA-HTTPS-RESIDUAL-03-R5-R1
  from_role: pm
  to_role: qa
  entry_criteria: DevOps deploy evidence docs/ops/evidence/p1-ex-do-deploy-https-residual-03-r5-20260528.md
    (container_started 2026-05-28T16:29:30Z, R5 markers on VPS).
  exit_criteria: On https://14-225-217-232.nip.io/hr/attendance?portal=1&companyId=main
    with ceo@xe.vn / Xevn@2026 — (1) performance probe fallbackAllCount=0 BEFORE and AFTER
    clicking "Kiểm tra lại" (zero 127.0.0.1:54321/rest/v1/*); (2) in-session GET
    /api/hrm/attendance/records?company_id=main&page=1&page_size=10 returns 200 HRM-ATT-200.
  Publish PASS/FAIL to docs/qa/evidence/p1-ex-qa-https-residual-03-r5-r1-20260528.md
    with resource excerpts. ack_status PASS_TO_PM or FAIL_TO_PM.
```
