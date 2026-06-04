# P1-EX-DO-DEPLOY-HTTPS-J-HRM-06-SCOPE-02 — portalAuthBridge pilot sync

| Field | Value |
|---|---|
| work_item_id | `P1-EX-DO-DEPLOY-HTTPS-J-HRM-06-SCOPE-02` |
| from_role | `devops` |
| to_role | `qa` |
| date | `2026-05-29` |
| pilot_url | `https://14-225-217-232.nip.io` |
| entry_qa_fail | `docs/qa/evidence/p1-ex-qa-https-j-hrm-06-01-r2-20260529.md` (`deploy_partial` — missing `waitForPortalAccessToken` export) |
| prior_deploy | `docs/ops/evidence/p1-ex-do-deploy-https-j-hrm-06-scope-01-20260529.md` |
| commit | `none` (pscp sync, no git commit) |

---

## Build / deploy timestamps

| Marker | Timestamp (UTC) | Notes |
|---|---|---|
| Source sync complete (`portalAuthBridge.ts` on VPS) | `2026-05-29T00:19:24Z` (approx, pre-recreate) | VPS `wc -c` → **4312** bytes |
| `xevn-hrm-fe-dev` container recreated | `2026-05-29T00:19:31.69233935Z` | `docker inspect` |
| Vite dev server ready | `~2026-05-29T00:19:32Z` | Log: `VITE v5.4.21 ready in 415 ms` |

---

## Steps executed

1. Read runbooks + QA R2 evidence (`deploy_partial` root cause).
2. `pscp` synced **7** HRM FE files (scope-01 set + `portalAuthBridge.ts`) to `/opt/xevn-ecosystem`.
3. VPS disk verification:
   - `grep -c waitForPortalAccessToken` → **1** in `portalAuthBridge.ts`
   - `grep -c resolveEmployeeFetchCompanyIds` → **2** in `useEmployee.ts`
   - `portalAuthBridge.ts` size **4312** bytes (was **11018** stale on pilot per QA R2)
4. Recreated `hrm-fe` only: `docker compose --env-file .env up -d --force-recreate hrm-fe` (no `compose down`).
5. L0 smoke (local + HTTPS) + pilot Vite source probe + Node export check.
6. Non-xevn safety: `tasmos_*` containers remain Up.

### Files synced

```
apps/web/hrm/src/lib/portalAuthBridge.ts
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
| `waitForPortalAccessToken` on VPS disk | **PASS** | grep count **1**; size **4312** |
| `resolveEmployeeFetchCompanyIds` retained | **PASS** | grep count **2**; `useEmployee.ts` **5843** bytes |
| Pilot Vite source (`/hr/src/lib/portalAuthBridge.ts`) | **PASS** | Node probe: len **14195**, `hasExport=true`, `hasWait=true` (was count **0** per QA R2) |
| Pilot `useEmployee.ts` | **PASS** | `hasResolve=2` (unchanged from scope-01) |
| L0 `http://127.0.0.1:8080/hr/` | **PASS** | HTTP **200** |
| L0 `https://14-225-217-232.nip.io/hr/` | **PASS** | HTTP **200** |
| L0 `https://…/hr/attendance?portal=1&companyId=main` | **PASS** | HTTP **200** |
| L0 `https://14-225-217-232.nip.io/api/hrm/` | **PASS** | HTTP **200** |
| Vite boot | **PASS** | `VITE v5.4.21 ready in 415 ms` |
| **J-HRM-06 L2.5 UI** | **NOT RUN** (QA owner) | Requires `ceo@xe.vn` portal session + CC iframe |

---

## Smoke outputs

```text
VPS disk: waitForPortalAccessToken count=1 portalAuthBridge bytes=4312
VPS disk: resolveEmployeeFetchCompanyIds count=2 useEmployee bytes=5843
container_started: 2026-05-29T00:19:31.69233935Z
HR_LOCAL=200 HR_HTTPS=200 attendance_https=200 API_HTTPS=200
PILOT portalAuthBridge (node): status=200 len=14195 hasWait=true hasExport=true
vite: VITE v5.4.21 ready in 415 ms
```

---

## completion_report

- **Closed scope:** Synced missing `portalAuthBridge.ts` (+ re-synced full P1-EX-FE-HTTPS-J-HRM-06-SCOPE-01 file set) to HTTPS pilot; recreated `xevn-hrm-fe-dev`; verified `waitForPortalAccessToken` export on VPS disk and live pilot Vite module (closes QA R2 `deploy_partial` PAGEERROR). L0 HTTPS smoke green for `/hr/`, attendance embed route, and `/api/hrm/`.
- **Residual:** J-HRM-06 L2.5 browser journey (attendance list → profile, CC iframe, deep link) and P-CC-07 UI sync CONNECTED require QA R3 with portal login — DevOps did not run authenticated Playwright matrix.

---

## Handoff packet

```yaml
work_item_id: P1-EX-DO-DEPLOY-HTTPS-J-HRM-06-SCOPE-02
from_role: devops
to_role: qa
ack_status: READY_FOR_QA
evidence_path: docs/ops/evidence/p1-ex-do-deploy-https-j-hrm-06-scope-02-20260529.md
next_owner: qa
next_dispatch_prompt: >
  work_item_id: P1-EX-QA-HTTPS-J-HRM-06-01-R3
  from_role: pm
  to_role: qa
  entry_criteria: DevOps deploy evidence
    docs/ops/evidence/p1-ex-do-deploy-https-j-hrm-06-scope-02-20260529.md
    (container_started 2026-05-29T00:19:31Z; PILOT portalAuthBridge hasWait/export true).
  exit_criteria: On https://14-225-217-232.nip.io with ceo@xe.vn / Xevn@2026 —
    (1) J-HRM-06 L2.5: no PAGEERROR on portalAuthBridge; attendance list → profile
    (no «Không tìm thấy nhân viên» when GET employees/:id 200) on CC iframe AND direct embed;
    deep link /hr/employees/{id}?portal=1&companyId=main shows profile;
    (2) P-CC-07: fallback54321=0, sync CONNECTED observable, attendance API 200.
  Publish PASS/FAIL to docs/qa/evidence/p1-ex-qa-https-j-hrm-06-01-r3-20260529.md.
  ack_status: PASS_TO_PM or FAIL_TO_PM.
```

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: P1-EX-QA-HTTPS-J-HRM-06-01-R3
from_role: devops
to_role: qa
entry_criteria: docs/ops/evidence/p1-ex-do-deploy-https-j-hrm-06-scope-02-20260529.md — R2 deploy_partial closed (portalAuthBridge waitForPortalAccessToken on pilot); container 2026-05-29T00:19:31Z
exit_criteria: J-HRM-06 L2.5 PASS + P-CC-07 UI sync on https://14-225-217-232.nip.io (ceo@xe.vn); no portalAuthBridge PAGEERROR; hard refresh first pass
evidence_path: docs/qa/evidence/p1-ex-qa-https-j-hrm-06-01-r3-20260529.md
ack_status: PASS_TO_PM or FAIL_TO_PM
```
