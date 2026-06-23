# P1-PHASE1-DO-STACK-STABILITY-01 — nip.io login 502 flaps + local L0 doc

| Field | Value |
|-------|-------|
| work_item_id | `P1-PHASE1-DO-STACK-STABILITY-01` |
| from_role | `devops` |
| to_role | `qa` |
| date | `2026-06-04` |
| pilot_url | `https://14-225-217-232.nip.io` |
| ack_status | **READY_FOR_QA** |

---

## Root cause (502 on `POST /api/xbos/auth/login`)

| Finding | Detail |
|---------|--------|
| nginx 502 | Upstream `127.0.0.1:28002` unreachable while `xevn-xbos-be-dev` restarts (Nest `start:dev` after deploy/recreate) |
| Log pattern | 2026-06-04 17:54–17:55 +07: multiple **502** on login; **201** resumes ~17:59 after container Up |
| Not app logic | xbos logs show **201** ~50ms when process is listening; 502 only during boot window |

---

## Mitigations applied

| Change | Path / action |
|--------|----------------|
| Deploy warmup | `deploy/xevn-ecosystem/deploy.sh` — wait HRM `/api/hrm/` 200 + XBOS login 201 (120s) before Done |
| Docker healthcheck | `deploy/xevn-ecosystem/docker-compose.yml` — `hrm-be` + `xbos-be` wget health, `start_period: 120s` |
| nginx timeouts | `deploy/nginx/xevn-ecosystem-vhost.conf` — `proxy_connect/send/read` 15s/90s on `/api/hrm/` and `/api/xbos/` |
| Stability probe | `scripts/stack-stability-login-probe.mjs` — `pnpm run probe:stack-stability` (fail on any 502) |
| QA local L0 doc | `docs/ops/LOCAL_DEV_STACK_L0.md` — terminal order for `qc:dev-stack` + L1 |
| qc hints | `scripts/qc-dev-stack.mjs` — points to L0 doc when APIs down |

**VPS (2026-06-04):** nginx vhost reloaded; `docker-compose.yml` synced; `force-recreate xbos-be hrm-be`.

---

## Verification

### nip.io login stability (workstation)

```text
pnpm run probe:stack-stability
# 20/20 × 201, f502=0, exit 0

node scripts/stack-stability-login-probe.mjs --samples 30
# 30/30 × 201, exit 0 (post-recreate + ~75s boot wait)
```

### Pilot L0 (`qc:dev-stack` with env override)

```powershell
$env:HRM_HEALTH_URL="https://14-225-217-232.nip.io/api/hrm"
$env:XBOS_HEALTH_URL="https://14-225-217-232.nip.io/api/xbos"
$env:PORTAL_DEV_URL="https://14-225-217-232.nip.io"
pnpm run qc:dev-stack
# exit 0 — hrm-api + xbos-api 200
```

### Local L0 (workstation, APIs not started)

```text
pnpm run qc:dev-stack
# exit 1 — expected ECONNREFUSED :28001/:28002 until dev:hrm-api + dev:xbos-api running
```

See **`docs/ops/LOCAL_DEV_STACK_L0.md`** for QA startup steps before L1 `test:system:uat`.

---

## QA dispatch (L0 / L1)

| Layer | Command | PASS when |
|-------|---------|-----------|
| L0 local | Start APIs per L0 doc → `pnpm run qc:dev-stack` | exit 0, hrm + xbos 200 |
| L0 pilot | env override above | exit 0 |
| L0 post-deploy | `pnpm run probe:stack-stability` | zero 502 |
| L1 | `pnpm run test:system:uat` | exit 0 (after L0 local PASS) |

Account: `ceo@xe.vn` / `Xevn@2026` (matrix standard).

---

## Residual

| ID | Item | Owner | Notes |
|----|------|-------|-------|
| R1 | Local stack off on QA machine | QA | Not DevOps blocker — follow L0 doc |
| R2 | Historical nginx 502 count on VPS | informational | 1041 total in access.log; new deploys should use warmup + probe |
| R3 | `start:dev` on VPS still restarts on file watch | devops/TM | Production path = compiled image (out of scope) |

---

## completion_report

Closed: nip.io login 502 flap mitigation (nginx timeouts, deploy warmup, BE healthchecks, stability probe, LOCAL_DEV_STACK_L0 doc). Post-change probe 30/30 login 201, pilot `qc:dev-stack` exit 0. Open: QA must bring local APIs up for L1 on workstation.

## next_owner

**qa**

## next_dispatch_prompt

```
work_item_id: P1-PHASE1-QA-STACK-L0-01
from_role: pm
to_role: qa
entry_criteria: devops READY_FOR_QA docs/ops/evidence/p1-phase1-do-stack-stability-20260604.md — probe 30/30 login 201 on nip.io; pilot qc:dev-stack exit 0.
exit_criteria: (1) Follow docs/ops/LOCAL_DEV_STACK_L0.md — start dev:hrm-api + dev:xbos-api, pnpm run qc:dev-stack exit 0 local. (2) pnpm run test:system:uat exit 0. (3) pnpm run probe:stack-stability against nip.io after any deploy — zero 502. (4) Evidence docs/qa/evidence/p1-phase1-qa-stack-l0-20260604.md with commands + exit codes.
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/p1-phase1-qa-stack-l0-20260604.md
```

## evidence_path

`docs/ops/evidence/p1-phase1-do-stack-stability-20260604.md`

## ack_status

**READY_FOR_QA**
