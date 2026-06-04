# P1-EX-DO-DEPLOY-HTTPS-J-HRM-06-ATT-BLANK-01 — AttendanceEntry pilot sync

| Field | Value |
|---|---|
| work_item_id | `P1-EX-DO-DEPLOY-HTTPS-J-HRM-06-ATT-BLANK-01` |
| from_role | `devops` |
| to_role | `qa` |
| date | `2026-05-29` |
| pilot_url | `https://14-225-217-232.nip.io` |
| entry_fe | `docs/qa/evidence/p1-ex-fe-https-j-hrm-06-attendance-blank-01-20260529.md` (AttendanceEntry, RouteErrorBoundary, App.tsx, main.tsx) |
| prior_qa_fail | `docs/qa/evidence/p1-ex-qa-https-j-hrm-06-01-r3-20260529.md` (`attendance_route_blank`, empty `#root` on HTTPS pilot) |
| commit | `none` (pscp sync, no git commit) |

---

## Build / deploy timestamps

| Marker | Timestamp (UTC) | Notes |
|---|---|---|
| Source sync complete (4 HRM FE files on VPS) | `2026-05-29T01:29:xxZ` (approx) | pscp from dev workstation |
| `xevn-hrm-fe-dev` container recreated | `2026-05-29T01:30:12.005631495Z` | `docker inspect` |
| Vite dev server ready | `~2026-05-29T01:30:13Z` | Log: `VITE v5.4.21 ready in 568 ms` |

---

## Steps executed

1. Read runbooks + dev-fe evidence (`attendance_route_blank` — Suspense `fallback={null}` on heavy Attendance chunk).
2. `pscp` synced **4** HRM FE files to `/opt/xevn-ecosystem` (no `compose down`).
3. VPS disk verification:
   - `attendance-entry-loading` → **1** in `AttendanceEntry.tsx`
   - `RouteErrorBoundary` → **3** in `AttendanceEntry.tsx`
   - `AttendanceEntry` import in `App.tsx` → **2**
   - File sizes: AttendanceEntry **1243** B, RouteErrorBoundary **1671** B, App **9139** B, main **431** B
4. Recreated `hrm-fe` only: `docker compose --env-file .env up -d --force-recreate hrm-fe`.
5. L0 smoke (VPS localhost + HTTPS) + pilot Vite source probe.
6. Non-xevn safety: `tasmos_*` containers remain Up.

### Files synced

```
apps/web/hrm/src/pages/AttendanceEntry.tsx
apps/web/hrm/src/components/common/RouteErrorBoundary.tsx
apps/web/hrm/src/App.tsx
apps/web/hrm/src/main.tsx
```

---

## Gate results

| Gate | Result | Evidence |
|---|---|---|
| VPS safety (no compose down) | **PASS** | Targeted `--force-recreate hrm-fe` only |
| `attendance-entry-loading` on VPS disk | **PASS** | grep count **1** |
| `AttendanceEntry` wired in App | **PASS** | grep count **2** |
| Pilot Vite source (`/hr/src/pages/AttendanceEntry.tsx`) | **PASS** | HTTP **200**, len **7979**, `hasLoading=true`, `hasBoundary=true` |
| L0 `http://127.0.0.1:8080/hr/attendance?portal=1&companyId=main` | **PASS** | HTTP **200** |
| L0 `http://127.0.0.1:8080/hr/` | **PASS** | HTTP **200** |
| L0 `https://14-225-217-232.nip.io/hr/attendance?portal=1&companyId=main` | **PASS** | HTTP **200** |
| L0 `https://14-225-217-232.nip.io/hr/` | **PASS** | HTTP **200** |
| L0 `https://14-225-217-232.nip.io/api/hrm/metrics` | **PASS** | HTTP **200** |
| Vite boot | **PASS** | `VITE v5.4.21 ready in 568 ms` |
| **J-HRM-06 L2.5 UI** | **NOT RUN** (QA owner) | Requires `ceo@xe.vn` portal session + CC iframe; verify `#root` not empty after 30s |

---

## Smoke outputs

```text
VPS disk: attendance-entry-loading=1 RouteErrorBoundary refs=3 AttendanceEntry in App=2
bytes: AttendanceEntry=1243 RouteErrorBoundary=1671 App=9139 main=431
container_started: 2026-05-29T01:30:12.005631495Z
HR_LOCAL_attendance=200 HR_ROOT=200 API=200
HTTPS attendance=200 HR=200 API=200
PILOT AttendanceEntry.tsx: status=200 len=7979 hasLoading=true hasBoundary=true
vite: VITE v5.4.21 ready in 568 ms
non-xevn: tasmos_ngrok_dev tasmos_web_dev tasmos_backend_dev Up
```

---

## completion_report

- **Closed scope:** Synced AttendanceEntry shell + RouteErrorBoundary + App/main preload to HTTPS pilot; recreated `xevn-hrm-fe-dev`; L0 HTTP **200** for `/hr/attendance` (local + nip.io) and pilot Vite module exposes loading UI markers (closes DevOps entry for QA R4 blank-root retest).
- **Residual:** J-HRM-06 L2.5 browser journey (attendance list → profile, CC iframe, P-CC-07 sync CONNECTED) and authenticated `#root` DOM check after 30s require QA R4 — DevOps did not run Playwright/matrix with portal login.

---

## Handoff packet

```yaml
work_item_id: P1-EX-DO-DEPLOY-HTTPS-J-HRM-06-ATT-BLANK-01
from_role: devops
to_role: qa
ack_status: READY_FOR_QA
evidence_path: docs/ops/evidence/p1-ex-do-deploy-https-j-hrm-06-att-blank-01-20260529.md
next_owner: qa
```

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: P1-EX-QA-HTTPS-J-HRM-06-01-R4
from_role: devops
to_role: qa
entry_criteria: docs/ops/evidence/p1-ex-do-deploy-https-j-hrm-06-att-blank-01-20260529.md — container_started 2026-05-29T01:30:12Z; pilot AttendanceEntry hasLoading/hasBoundary true; L0 HTTPS /hr/attendance 200
exit_criteria: On https://14-225-217-232.nip.io with ceo@xe.vn / Xevn@2026 — (1) J-HRM-06 L2.5: attendance list/row → profile on CC iframe AND direct embed; #root not empty after 30s on /hr/attendance?portal=1&companyId=main; data-testid attendance-entry-loading or workbench visible; (2) P-CC-07: fallback54321=0, HRM API Sync CONNECTED, GET attendance/records 200
evidence_path: docs/qa/evidence/p1-ex-qa-https-j-hrm-06-01-r4-20260529.md
ack_status: PASS_TO_PM or FAIL_TO_PM
```
