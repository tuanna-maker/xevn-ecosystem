# PCOMP-W7-DO-TASKS-SLUG-01-R1 — VPS deploy home.service.ts tasks slug fix

| Field | Value |
|-------|--------|
| **work_item_id** | `PCOMP-W7-DO-TASKS-SLUG-01-R1` |
| **from_role** | devops |
| **to_role** | qa |
| **ack_status** | **READY_FOR_QA** |
| **generated** | 2026-06-07 |
| **VPS** | `14.225.217.232` / `https://14-225-217-232.nip.io` |
| **upstream** | dev-be `PCOMP-W7-BE-TASKS-SLUG-01-R1` — `docs/qa/evidence/pcomp-w7-be-tasks-slug-01-20260607.md` |
| **defect closed** | **D-W7-HOME-TASKS-SLUG-01** (nip.io holding slug tasks/manager_pending 500) |

---

## Root cause (deploy gap)

Local BE fixed `buildTasks` / `buildManagerPending` slug scope + `Date.localeCompare` crash (D-W7-HOME-TASKS-SLUG-01). VPS `xevn-hrm-be-dev` still ran pre-fix `home.service.ts` — `include=tasks,manager_pending` with `company_id=holding` returned **500** on nip.io.

---

## Actions executed

### 1. PSCP sync

`scripts/tmp-vps-pscp-home-summary-20260607.ps1` → `/opt/xevn-ecosystem` (14 files; primary delta **`home.service.ts`**):

- `apps/api/hrm-api/src/home/home.service.ts` (+ controller, types, dto, specs)
- `apps/api/hrm-api/src/app.module.ts`
- `apps/api/hrm-api/src/common/hrm-list-scope.ts` (+ spec)
- `apps/api/hrm-api/src/operating-units/*`

### 2. hrm-be force-recreate

```bash
cd /opt/xevn-ecosystem/deploy/xevn-ecosystem
docker compose --env-file .env up -d --build --force-recreate hrm-be
# wait 90s — Nest boot + healthcheck
```

- **Container:** `xevn-hrm-be-dev` — `Up (healthy)` port `3001:3001`
- **Nest logs:** `Nest application successfully started` — no TS compile errors
- **Git HEAD on VPS:** `68ec457` (pscp overlay; W7 tasks-slug delta not on `origin/main`)
- **Non-xevn containers:** tasmos_*, asms_* still Up — no `compose down`

---

## Smoke results

| Gate | Command / check | Result |
|------|-----------------|--------|
| L0 direct metrics | VPS `curl http://127.0.0.1:3001/api/hrm/metrics` | **200** |
| L0 nip.io metrics | probe `metrics_status` @ `https://14-225-217-232.nip.io` | **200** |
| **Exit criteria** | Auth GET `/home/summary?company_id=holding&include=tasks,manager_pending,celebrations,whos_out` @ nip.io | **HTTP 200** `HRM-HOME-200` |
| Probe script | `HRM_API_BASE_URL=https://14-225-217-232.nip.io node scripts/tmp-pcomp-w7-qa-home-summary-01-probe.mjs` | **exit 0** |
| L0 pilot gate | `pnpm run qc:fe-be-health:pilot` | **exit 0** (8/8 + 13/13) |

### Authenticated probe (nip.io) — full hub include

**Account:** `uat.nv0001@xe.vn` / `xevn-uat-2026` · `employee_id=3796d949-4513-45c0-88fa-33030a062b17`

| Include | HTTP | code | tasks | manager_pending | celebrations | whos_out |
|---------|------|------|-------|-----------------|--------------|----------|
| `tasks,manager_pending` | **200** | `HRM-HOME-200` | 10 | 2 | — | — |
| `tasks,manager_pending,celebrations,whos_out` | **200** | `HRM-HOME-200` | 10 | 2 | 5 | 1 |

| Journey | Result |
|---------|--------|
| J-MOB-06 (tasks holding) | **PASS** |
| J-MOB-08 (celebrations) | **PASS** — 5 items, privacy clean |
| J-MOB-09 (whos_out) | **PASS** — 1 item |

Probe JSON: `docs/qa/evidence/pcomp-w7-qa-home-summary-01-probe.json`

---

## Residual

| Item | Owner | Notes |
|------|-------|-------|
| VPS code via PSCP not on `origin/main` | dev-be / PM | Commit W7 tasks-slug delta when sponsor requests |
| `tmp-pcomp-w7-qa-hub-04b-probe.mjs` | qa | Re-run after deploy; force `company_id=holding` |
| C-W7QC-DEVICE-01 | qa-device | UI hub walk after nip.io API QA PASS |

---

## Handoff

```yaml
completion_report: |
  Deployed PCOMP-W7-BE-TASKS-SLUG-01 fix to VPS: PSCP home.service.ts (+ home module manifest 14 files);
  force-recreate hrm-be. nip.io authenticated GET /home/summary?company_id=holding&include=tasks,manager_pending,celebrations,whos_out
  → HTTP 200 HRM-HOME-200 (tasks=10, manager_pending=2, celebrations=5, whos_out=1). D-W7-HOME-TASKS-SLUG-01 closed on pilot.
  tmp-pcomp-w7-qa-home-summary-01-probe.mjs exit 0 @ nip.io. qc:fe-be-health:pilot exit 0 (8/8 + 13/13).
  Residual: git/main parity; device UI retest.

next_owner: qa

next_dispatch_prompt: |
  work_item_id: PCOMP-W7-QA-HOME-SUMMARY-01-R2
  from_role: pm
  to_role: qa
  entry_criteria: devops READY_FOR_QA PCOMP-W7-DO-TASKS-SLUG-01-R1 —
  docs/qa/evidence/pcomp-w7-do-tasks-slug-01-20260607.md; nip.io GET
  /home/summary?company_id=holding&include=tasks,manager_pending,celebrations,whos_out → 200 HRM-HOME-200;
  qc:fe-be-health:pilot exit 0.
  exit_criteria: Re-run L0 qc:fe-be-health:pilot; nip.io probe exit 0; J-MOB-06/08/09 API PASS;
  hub-04b probe exit 0; PASS_TO_PM with evidence docs/qa/evidence/pcomp-w7-qa-home-summary-01-r2-20260607.md.

evidence_path: docs/qa/evidence/pcomp-w7-do-tasks-slug-01-20260607.md
ack_status: READY_FOR_QA
pm_dispatch_hint: QA PCOMP-W7-QA-HOME-SUMMARY-01-R2
```
