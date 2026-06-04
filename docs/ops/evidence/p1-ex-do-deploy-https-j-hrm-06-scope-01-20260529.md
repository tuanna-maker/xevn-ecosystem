# P1-EX-DO-DEPLOY-HTTPS-J-HRM-06-SCOPE-01 — HRM FE scope fix pilot deploy

| Field | Value |
|---|---|
| work_item_id | `P1-EX-DO-DEPLOY-HTTPS-J-HRM-06-SCOPE-01` |
| from_role | `devops` |
| to_role | `qa` |
| date | `2026-05-29` |
| pilot_url | `https://14-225-217-232.nip.io` |
| handoff_fe | `docs/qa/evidence/p1-ex-fe-https-j-hrm-06-scope-01-20260529.md` |
| prior_qa_fail | `docs/qa/evidence/p1-ex-qa-https-j-hrm-06-01-r1-20260529.md` (`deploy_gap` — pilot missing `resolveEmployeeFetchCompanyIds`) |
| commit | `none` (pscp sync, no git commit) |

---

## Build / deploy timestamps

| Marker | Timestamp (UTC) | Notes |
|---|---|---|
| Source sync complete (`useEmployee.ts` mtime on VPS) | `2026-05-28T17:00:49Z` | `stat` after `pscp` (+07 displayed as `2026-05-29 00:00:49`) |
| `xevn-hrm-fe-dev` container recreated | `2026-05-28T17:01:24.476241335Z` | `docker inspect` |
| Vite dev server ready | `~2026-05-28T17:01:25Z` | Log: `VITE v5.4.21 ready in 456 ms` |

---

## Steps executed

1. Read runbooks (`devops-deploy` skill, prior R5 deploy evidence pattern).
2. VPS audit: `xevn-hrm-fe-dev` Up (stale start `2026-05-28T16:29:30Z` from prior wave).
3. Synced J-HRM-06 FE scope patch files local → `/opt/xevn-ecosystem` via `pscp` (6 files).
4. Verified VPS bind-mount markers:
   - `grep -c resolveEmployeeFetchCompanyIds` → **2** in `useEmployee.ts`
   - File size **5843** bytes (matches local workspace)
5. Recreated `hrm-fe` only: `docker compose --env-file .env up -d --force-recreate hrm-fe` (no `compose down`).
6. L0 HTTPS smoke + pilot Vite source probe (see below).

### Files synced

```
apps/web/hrm/src/hooks/useEmployee.ts
apps/web/hrm/src/integrations/hrmApi.ts
apps/web/hrm/src/contexts/AuthContext.tsx
apps/web/hrm/src/lib/hrmEmbedNavigation.ts
apps/web/hrm/src/components/attendance/AttendanceRecordsTable.tsx
apps/web/hrm/src/pages/Attendance.tsx
```

---

## Gate results

| Gate | Result | Evidence |
|---|---|---|
| VPS safety (no compose down) | **PASS** | Targeted `--force-recreate hrm-fe` only |
| `resolveEmployeeFetchCompanyIds` on VPS disk | **PASS** | grep count **2**; size **5843** |
| Pilot Vite source (`/hr/src/hooks/useEmployee.ts`) | **PASS** | `hasResolveCount=2`, `len=20815` (was **6010** / absent pre-deploy per QA R1) |
| L0 `http://127.0.0.1:8080/hr/` | **PASS** | HTTP **200** |
| L0 `https://14-225-217-232.nip.io/hr/` | **PASS** | HTTP **200** |
| L0 `https://…/hr/attendance?portal=1&companyId=main` | **PASS** | HTTP **200** |
| L0 `https://14-225-217-232.nip.io/api/hrm/` | **PASS** | HTTP **200** |
| Vite boot | **PASS** | `VITE v5.4.21 ready in 456 ms` |
| **J-HRM-06 L2.5 UI** | **NOT RUN** (QA owner) | Browser list→detail + CC iframe required |

---

## Smoke outputs

```text
grep resolveEmployeeFetchCompanyIds count: 2
useEmployee.ts bytes (VPS): 5843
container_started: 2026-05-28T17:01:24.476241335Z
hr_local:200
hr_https:200
attendance_https:200
hrm_api_https:200
PILOT_SRC len=20815 hasResolveCount=2
vite: VITE v5.4.21 ready in 456 ms
```

---

## completion_report

- **Closed scope:** Synced P1-EX-FE-HTTPS-J-HRM-06-SCOPE-01 file set to HTTPS pilot VPS; recreated `xevn-hrm-fe-dev`; verified `resolveEmployeeFetchCompanyIds` present on VPS disk and on live pilot Vite source; L0 HTTPS smoke green for `/hr/`, attendance route, and `/api/hrm/`.
- **Residual:** J-HRM-06 L2.5 browser journey (attendance list → employee profile, CC iframe + direct embed) not exercised by DevOps — QA must confirm UI no longer shows «Không tìm thấy nhân viên» when detail API returns 200. Hard refresh recommended on first QA pass.

---

## Handoff packet

```yaml
work_item_id: P1-EX-DO-DEPLOY-HTTPS-J-HRM-06-SCOPE-01
from_role: devops
to_role: qa
ack_status: READY_FOR_QA
evidence_path: docs/ops/evidence/p1-ex-do-deploy-https-j-hrm-06-scope-01-20260529.md
next_owner: qa
next_dispatch_prompt: >
  work_item_id: P1-EX-QA-HTTPS-J-HRM-06-01-R2
  from_role: pm
  to_role: qa
  entry_criteria: DevOps deploy evidence
    docs/ops/evidence/p1-ex-do-deploy-https-j-hrm-06-scope-01-20260529.md
    (container_started 2026-05-28T17:01:24Z; PILOT_SRC hasResolveCount=2).
  exit_criteria: On https://14-225-217-232.nip.io with ceo@xe.vn / Xevn@2026 —
    (1) J-HRM-06 L2.5: attendance list → click employee → profile loads (no
    «Không tìm thấy nhân viên») on CC iframe AND direct embed; deep link
    /hr/employees/{id}?portal=1&companyId=main shows profile when GET by id 200;
    (2) P-CC-07 regression: fallback54321=0, sync CONNECTED, attendance API 200.
  Publish PASS/FAIL to docs/qa/evidence/p1-ex-qa-https-j-hrm-06-01-r2-20260529.md.
  ack_status PASS_TO_PM or FAIL_TO_PM.
```
