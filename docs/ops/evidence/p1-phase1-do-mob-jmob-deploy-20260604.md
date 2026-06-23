# P1-PHASE1-DO-MOB-JMOB-DEPLOY-01 — Pilot hrm-be redeploy (JMOB-04/05)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-PHASE1-DO-MOB-JMOB-DEPLOY-01` |
| **build_ref** | `P1-PHASE1-BE-MOB-JMOB-04-05-01` |
| **from_role** | `devops` |
| **to_role** | `qa` |
| **date** | 2026-06-04 |
| **pilot_url** | `https://14-225-217-232.nip.io` |
| **ack_status** | **READY_FOR_QA** |
| **verdict** | **PASS** |

---

## Deploy method

Local `main` has **uncommitted** JMOB scope sources → **pscp manifest** (not `git pull`).

| Step | Action |
|------|--------|
| 1 | `scripts/tmp-vps-pscp-mob-jmob-04-05-20260604.ps1` — 7 files → `/opt/xevn-ecosystem` |
| 2 | `docker compose --env-file .env up -d --build --force-recreate hrm-be` on VPS |
| 3 | Boot wait until `GET http://127.0.0.1:3001/api/hrm/metrics` → **200** (~21s) |
| 4 | `node scripts/seed-hrm-uat-mob-pilot-qual.mjs` on VPS (idempotent UAT0001 qual) |

**pscp files:** `hrm-list-scope.ts`, `payroll.service.ts`, `attendance.service.ts`, specs + `p1-phase1-be-mob-jmob-04-05.spec.ts` (per `docs/qa/evidence/p1-phase1-be-mob-jmob-04-05-20260604.md`).

**Non-xevn containers:** not stopped (`docker compose down` not used).

---

## Verification

### API probe (`uat.nv0001@xe.vn`)

```powershell
$env:PORTAL_DEV_URL="https://14-225-217-232.nip.io"
$env:HRM_API_BASE_URL="https://14-225-217-232.nip.io"
$env:HRM_MOBILE_EMAIL="uat.nv0001@xe.vn"
$env:HRM_MOBILE_PILOT_PASSWORD="xevn-uat-2026"
node scripts/tmp-p1-resid-c03-probe.mjs
# exit 0
```

| Probe | nip.io | `:3001` direct |
|-------|--------|----------------|
| leave-requests | 6 | 6 |
| payslips | **1** | **1** |
| pending update-requests | **1** | **1** |
| **exit code** | **0** | **0** |

JSON artifact: `docs/qa/evidence/p1-resid-c03-probe-20260530.json` (updated on probe run).

### Post-deploy note

Immediately after recreate, nip.io login returned **502** until Nest finished boot; first probe after deploy showed `pending=0` before VPS seed re-run. After seed + warm API, **both** nip.io and direct `:3001` probes **PASS**.

---

## Gate table

| Gate | Result |
|------|--------|
| hrm-be container Up + healthy | **PASS** |
| `/api/hrm/metrics` 200 (host :3001) | **PASS** |
| JMOB C03 probe (payslips≥1, pending≥1) | **PASS** |
| Non-xevn docker ps | **PASS** (no stop/rm) |

---

## completion_report

- **Closed:** Pilot `hrm-be` serves `P1-PHASE1-BE-MOB-JMOB-04-05-01` (payroll UUID→slug list parity; manager pending slug+uuid filter). `tmp-p1-resid-c03-probe.mjs` exit **0** on nip.io for `uat.nv0001@xe.vn` (payslips=1, pending=1).
- **Open:** **qa** / **qa-device** L2.5 device journeys J-MOB-04 detail + J-MOB-05 Duyệt UI (`p1-phase1-qa-mob-jmob-20260604-r2.md`).

## next_owner

`qa`

## next_dispatch_prompt

```
work_item_id: P1-PHASE1-QA-MOB-JMOB-01-R2
from_role: pm
to_role: qa
entry_criteria: docs/ops/evidence/p1-phase1-do-mob-jmob-deploy-20260604.md READY_FOR_QA; PORTAL_DEV_URL=https://14-225-217-232.nip.io; tmp-p1-resid-c03-probe.mjs exit 0 for uat.nv0001@xe.vn (payslips>=1, pending>=1)
exit_criteria: Re-run C03 probe on nip.io exit 0; optional qa-device adb J-MOB-04/05 if in scope; evidence docs/qa/evidence/p1-phase1-qa-mob-jmob-20260604-r2.md; ack PASS_TO_PM
evidence_path: docs/qa/evidence/p1-phase1-qa-mob-jmob-20260604-r2.md
```

## pm_dispatch_hint

Dispatch **qa-device** for strict device L2.5 after **qa** confirms API probe; no further **devops** unless probe regresses to 502/pending=0.
