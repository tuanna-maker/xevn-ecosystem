# PCOMP-W7-DO-HOME-SUMMARY-01-R2 — VPS deploy GET /api/hrm/home/summary

| Field | Value |
|-------|--------|
| **work_item_id** | `PCOMP-W7-DO-HOME-SUMMARY-01-R2` |
| **from_role** | devops |
| **to_role** | qa |
| **ack_status** | **READY_FOR_QA** |
| **generated** | 2026-06-07 |
| **VPS** | `14.225.217.232` / `https://14-225-217-232.nip.io` |
| **upstream** | R1 INVALID — route still 404 on nip.io despite PSCP; `docs/qa/evidence/pcomp-w7-be-04b-01-r2-20260607.md` (local BE PASS) |
| **defect closed** | `C-MOB-HUB-BE-DEPLOY-01` (pilot 404 on `/home/summary`) |

---

## Root cause (R2)

| Symptom | Cause |
|---------|--------|
| GET `/api/hrm/home/summary` **404** `HRM-DATA-404` / `Cannot GET` | Nest `start:dev` **did not register** new routes — TypeScript compile error in `employees.controller.ts` (stale `restoreEmployee(employeeId)` call vs service signature requiring `requestedCompanyId`) blocked watch rebuild |
| R1 claimed PASS but QA still 404 | Metrics healthcheck passed on **old** compiled bundle; home module files on disk but not loaded into running process |

---

## Actions executed

### 1. PSCP sync (14 files)

`scripts/tmp-vps-pscp-home-summary-20260607.ps1` → `/opt/xevn-ecosystem`:

- `apps/api/hrm-api/src/home/*` (controller, service, types, dto, specs)
- `apps/api/hrm-api/src/app.module.ts` (HomeController + HomeService)
- `apps/api/hrm-api/src/common/hrm-list-scope.ts` (+ spec)
- `apps/api/hrm-api/src/operating-units/*` (registry + controller + service + specs)

### 2. hrm-be force-recreate

```bash
cd /opt/xevn-ecosystem/deploy/xevn-ecosystem
docker compose --env-file .env up -d --build --force-recreate hrm-be
# wait ~90s Nest boot (cold start longer than 45s)
```

### 3. Fix TS compile blocker (R2 delta vs R1)

PSCP additional files after `docker logs` showed:

```text
employees.controller.ts:591 — restoreEmployee(employeeId) missing requestedCompanyId
Found 1 error. Watching for file changes.
```

Synced from local:

- `employees.controller.ts`, `employees.controller.spec.ts`
- `employees.service.ts`, `employees.service.spec.ts`

Then `docker restart xevn-hrm-be-dev` → route registered.

- **Container:** `xevn-hrm-be-dev` — `Up (healthy)` port `3001:3001`
- **Git HEAD on VPS:** `68ec457` (pscp overlay; W7 delta not on origin/main)
- **Route:** `GET /api/hrm/home/summary` responds (400/401 without auth — not 404)
- **Non-xevn containers:** not touched (no `compose down`)

---

## Smoke results

| Gate | Command / check | Result |
|------|-----------------|--------|
| L0 direct metrics | VPS `curl http://127.0.0.1:3001/api/hrm/metrics` | **200** |
| L0 nip.io metrics | `curl https://14-225-217-232.nip.io/api/hrm/metrics` | **200** |
| Route exists (no auth) | `GET .../home/summary?company_id=holding&include=celebrations,whos_out` | **400** `HRM-VAL-001` (not 404) |
| **Exit criteria** | Authenticated `GET .../home/summary?company_id=holding&employee_id={uuid}&include=celebrations,whos_out` @ nip.io | **HTTP 200** `HRM-HOME-200` |
| Probe script | `HRM_API_BASE_URL=https://14-225-217-232.nip.io node scripts/tmp-pcomp-w7-qa-04b-01-probe.mjs` | **exit 0** |
| Payload | celebrations `total_count=5`, whos_out `items.length=1` | **PASS** |
| Privacy | no `date_of_birth` / `birth_year` in JSON | **PASS** |

### Authenticated curl (nip.io)

```text
POST /api/hrm/auth/mobile/login  → 201 (uat.nv0001@xe.vn)
GET  /api/hrm/home/summary?company_id=holding&employee_id=3796d949-4513-45c0-88fa-33030a062b17&include=celebrations,whos_out
     → 200 HRM-HOME-200 (celebrations=5, whos_out=1)
```

**Note:** `employee_id` is required (`@IsUUID()` on DTO). Bare URL without auth returns **400**, not 404 — confirms route deployed. Mobile supplies `employee_id` from login.

---

## Residual

| Item | Owner | Notes |
|------|-------|-------|
| VPS code via PSCP not on `origin/main` | dev-be / PM | Commit W7 delta when sponsor requests |
| Nest watch TS error silent route miss | devops | After pscp, always `docker logs xevn-hrm-be-dev \| tail -30` for compile errors |
| hrm-be cold start 502 (~60–90s) | devops | Wait for `(healthy)` before nip.io probe |
| MOB APK + device L2.5 J-MOB-08/09 | qa-device | Separate lane after API QA PASS |

---

## Handoff

```yaml
completion_report: |
  R2 deployed home/summary 04b to VPS: PSCP 14 home/scope files + 4 employees compile-fix files;
  force-recreate + restart hrm-be. Root cause of R1 INVALID: employees.controller.ts TS error blocked
  Nest watch from loading HomeController (404 despite files on disk). nip.io authenticated
  GET /home/summary?company_id=holding&include=celebrations,whos_out → HTTP 200 HRM-HOME-200
  (celebrations=5, whos_out=1). tmp-pcomp-w7-qa-04b-01-probe.mjs exit 0 @ nip.io.
  Residual: PSCP overlay pending git push; device/APK out of scope.

next_owner: qa

next_dispatch_prompt: |
  work_item_id: PCOMP-W7-QA-HUB-04b-R3
  from_role: pm
  to_role: qa
  entry_criteria: devops READY_FOR_QA PCOMP-W7-DO-HOME-SUMMARY-01-R2 —
  docs/qa/evidence/pcomp-w7-do-home-summary-01-20260607.md; nip.io /home/summary 200 confirmed
  (not 404); probe exit 0 with HRM_API_BASE_URL=https://14-225-217-232.nip.io.
  exit_criteria: Re-run node scripts/tmp-pcomp-w7-qa-04b-01-probe.mjs + qc:fe-be-health:pilot;
  J-MOB-08/09 API PASS (holding slug, celebrations≥2, whos_out≥1, privacy no birth_year);
  MUX-04a hub QA unblocked on nip.io. ack_status PASS_TO_PM or FAIL_TO_PM with defect ids.

evidence_path: docs/qa/evidence/pcomp-w7-do-home-summary-01-20260607.md
ack_status: READY_FOR_QA
```
