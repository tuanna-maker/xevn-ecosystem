# PCOMP-W7-BE-TASKS-SLUG-01-R1 — home/summary tasks slug scope fix

| Field | Value |
|-------|--------|
| **work_item_id** | `PCOMP-W7-BE-TASKS-SLUG-01-R1` |
| **from_role** | dev-be |
| **to_role** | qa |
| **ack_status** | **READY_FOR_QA** |
| **generated** | 2026-06-07 |
| **defect closed** | **D-W7-HOME-TASKS-SLUG-01** |
| **upstream QA** | `docs/qa/evidence/pcomp-w7-qa-home-summary-01-20260607.md` |

---

## Root cause

`GET /home/summary?company_id=holding&include=tasks` (default include) failed with HTTP 500:

1. **Slug scope (nip.io / prior deploy):** `buildTasks` / `buildManagerPending` downstream queries could pass slug `holding` into UUID-cast SQL on inbox `company_id` without `expandHrmTextCompanyIds` mapping — parity gap vs `buildWhosOut` (`pushWorkforceEmployeeScopeFilter` on `lr.employee_id`).
2. **Local runtime (post-refactor):** DB driver returned `created_at` / `requested_at` as `Date` objects; `buildTasks` / `buildManagerPending` sort used `.localeCompare` on non-strings → `HRM-SYS-001`.

---

## Fix summary (`apps/api/hrm-api/src/home/home.service.ts`)

| Area | Change |
|------|--------|
| `queryScopedLeaveRequests` | Already uses `pushWorkforceEmployeeScopeFilter` on `lr.employee_id` (mirror `buildWhosOut`) |
| `queryScopedInbox` | `expandHrmTextCompanyIds` + `pushCompanyIdUuidFilter` for broadcast rows; viewer-targeted OR branch; no raw `holding::uuid` |
| `buildTasks` / `buildManagerPending` | `normalizeTimestamp` + `compareTimestampsDesc` for safe sort; `inboxTitle` / `inboxDeepLink` null-guard on `event_type` |
| `attendance.listUpdateRequests` | Unchanged — already uses `expandHrmTextCompanyIds` + `aur.company_id::text` for holding slug |

---

## Verification

### Jest

```bash
pnpm --filter hrm-api test -- home.service.spec.ts
# exit 0 — 18/18 PASS (includes D-W7-HOME-TASKS-SLUG-01 slug scope tests)
```

### Local API — holding slug combined include

```bash
HRM_API_BASE_URL=http://127.0.0.1:28001 node scripts/tmp-pcomp-w7-qa-home-summary-01-probe.mjs
# exit 0 — pass: true
```

| Probe | HTTP | code |
|-------|------|------|
| `include=tasks,manager_pending` | **200** | `HRM-HOME-200` |
| `include=tasks,manager_pending,celebrations,whos_out` | **200** | `HRM-HOME-200` |
| `include=celebrations,whos_out` | **200** | `HRM-HOME-200` |

| Journey | Result |
|---------|--------|
| J-MOB-06 (tasks holding) | **PASS** |
| J-MOB-08 (celebrations) | **PASS** — 5 items, privacy clean |
| J-MOB-09 (whos_out) | **PASS** — 1 item |

**Account:** `uat.nv0001@xe.vn` / `xevn-uat-2026` · `company_id=holding` · `employee_id=3796d949-4513-45c0-88fa-33030a062b17`

---

## Residual

| Item | Owner | Notes |
|------|-------|-------|
| nip.io redeploy | devops | Local fix verified; VPS needs hrm-api image rebuild for nip.io parity |
| `tmp-pcomp-w7-qa-hub-04b-probe.mjs` | qa | Re-run after deploy; script should force `company_id=holding` per QA note |
| C-W7QC-DEVICE-01 | qa-device | UI hub walk after nip.io deploy |

---

## Handoff

```yaml
completion_report: |
  Closed D-W7-HOME-TASKS-SLUG-01 for PCOMP-W7-BE-TASKS-SLUG-01-R1. buildTasks/buildManagerPending
  paths use workforce slug scope on leave queries (lr.employee_id IN) and expanded UUID mapping on
  inbox broadcasts; fixed Date localeCompare crash in task/manager_pending sort. jest home.service.spec.ts
  18/18 PASS. Local probe exit 0 — tasks+manager_pending and full hub include return HRM-HOME-200
  with company_id=holding. Residual: nip.io redeploy + device UI retest.

next_owner: qa

next_dispatch_prompt: |
  work_item_id: PCOMP-W7-QA-HOME-SUMMARY-01-R2
  from_role: pm
  to_role: qa
  entry_criteria: dev-be READY_FOR_QA PCOMP-W7-BE-TASKS-SLUG-01-R1 —
  docs/qa/evidence/pcomp-w7-be-tasks-slug-01-20260607.md; D-W7-HOME-TASKS-SLUG-01 closed locally.
  exit_criteria: Re-run L0 qc:fe-be-health:pilot; nip.io (or local if pre-deploy) GET
  /home/summary?company_id=holding&include=tasks,manager_pending,celebrations,whos_out → 200 HRM-HOME-200;
  J-MOB-06/08/09 API PASS; hub-04b probe exit 0; PASS_TO_PM with evidence
  docs/qa/evidence/pcomp-w7-qa-home-summary-01-r2-YYYYMMDD.md.

evidence_path: docs/qa/evidence/pcomp-w7-be-tasks-slug-01-20260607.md
ack_status: READY_FOR_QA
```
