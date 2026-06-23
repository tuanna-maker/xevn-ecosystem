# DevOps evidence — P1-PHASE1-DO-CRUD-PARITY-DEPLOY-01 (2026-06-04)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-PHASE1-DO-CRUD-PARITY-DEPLOY-01` |
| **related_be** | `P1-PHASE1-BE-EMP-CREATE-PARITY-01`, `P1-PHASE1-BE-SCOPE-CRUD-01` |
| **from_role** | `devops` |
| **to_role** | `qa` |
| **VPS** | `root@14.225.217.232` `/opt/xevn-ecosystem` |
| **Portal** | `https://14-225-217-232.nip.io` |
| **VPS HEAD (post-pull)** | `68ec457` |
| **ack_status** | **READY_FOR_QA** |

---

## Executive verdict

| Gate | Result | Notes |
|------|--------|-------|
| C-CRUDQC-07 pscp manifest (9 files) | **PASS** | HRM employee/spreadsheet + XBOS legal-entity scope |
| `xevn-hrm-be-dev` + `xevn-xbos-be-dev` recreate | **PASS** | `--build --force-recreate`; no `compose down` |
| Remote smoke HRM/XBOS metrics (direct + HTTPS) | **PASS** | HTTP **200** all four |
| `pnpm run probe:stack-stability` | **PASS** | 20/20 login **201**, `f502=0` |
| `tmp-p1-phase1-member-hrm-cu-probe.mjs` | **PASS** | exit **0** — MEM-CRUD-01/02, J-HRM-01/02 |
| `tmp-phase1-be-scope-crud-probe.mjs` | **PASS** | exit **0** — GET/PUT legal entity + member block **409** |

---

## Deploy method

Parity sources synced via **pscp** (not yet fully on `origin/main` at deploy time); targeted BE image rebuild on VPS.

| Step | Action |
|------|--------|
| 1 | `scripts/tmp-vps-pscp-crud-parity-main-20260604.ps1` — 9 source files |
| 2 | `scripts/tmp-vps-deploy-crud-parity-be-20260604.sh` — stash/pull, `merge-vps-port-env.mjs --apply-canonical`, `docker compose up -d --build --force-recreate hrm-be xbos-be`, sleep 50s |
| 3 | Local `probe:stack-stability` + CRUD probes |

**Scripts (repo, no secrets):** `tmp-vps-pscp-crud-parity-main-20260604.ps1`, `tmp-vps-deploy-crud-parity-be-20260604.sh`

---

## Remote smoke (post-recreate)

```
[smoke] hrm metrics HTTP 200
[smoke] xbos metrics HTTP 200
[smoke] https hrm metrics HTTP 200
[smoke] https xbos metrics HTTP 200
xevn-hrm-be-dev   Up (healthy)   0.0.0.0:3001->3001/tcp
xevn-xbos-be-dev  Up (healthy)   0.0.0.0:28002->28002/tcp
```

---

## Local verification

```powershell
pnpm run probe:stack-stability
# PASS: 20/20 login 201, f502=0

$env:PORTAL_DEV_URL='https://14-225-217-232.nip.io'
node scripts/tmp-p1-phase1-member-hrm-cu-probe.mjs
# exit 0 — MEM_CRUD_JOURNEY_03_OK

node scripts/tmp-phase1-be-scope-crud-probe.mjs
# exit 0 — PROBE_OK
```

### Probe highlights

| Check | Result |
|-------|--------|
| MEM-CRUD-01 contract POST/PATCH/GET detail | **PASS** (GET detail **200** — prior orphan-contract gap closed on pilot) |
| MEM-CRUD-02 employee POST/PATCH | **PASS** |
| J-HRM-01 / J-HRM-02 | **PASS** |
| XBOS legal GET/PUT + shareholders | **PASS** |
| Member CEO rollup block | **PASS** HTTP **409** |

---

## Residual / PM hint

| Item | Owner | Trigger |
|------|-------|---------|
| Commit/push C-CRUDQC-07 sources to `main` (VPS has pscp copies) | `dev-be` / PM | User requests commit |
| L2.5 J-* manual QA on portal UI | `qa` | This evidence is L0/API CRUD only |

---

## completion_report

- Synced **9** parity files via pscp; recreated **hrm-be** and **xbos-be** on pilot VPS; all metrics smoke **200**.
- **probe:stack-stability**, member HRM C/U probe, and XBOS scope CRUD probe all **exit 0** on nip.io.
- No non-xevn containers stopped; no git push (per user policy).

## next_owner

**qa**

## next_dispatch_prompt

```
work_item_id: P1-PHASE1-QA-CRUD-JOURNEY-03
from_role: pm
to_role: qa
entry_criteria: devops READY_FOR_QA docs/ops/evidence/p1-phase1-do-crud-parity-deploy-20260604.md — hrm-be + xbos-be redeployed; probe:stack-stability 20/20 zero 502; tmp-p1-phase1-member-hrm-cu-probe.mjs and tmp-phase1-be-scope-crud-probe.mjs exit 0 on https://14-225-217-232.nip.io.
exit_criteria: Re-run L2.5 J-HRM-01/02 and member legal journeys on portal; promote AC-CRUD-HRM-EMP-M-C-01 and scope CRUD ACs; PASS_TO_PM with docs/qa/evidence/p1-phase1-qa-crud-journey-03-20260604.md.
evidence_path: docs/qa/evidence/p1-phase1-qa-crud-journey-03-20260604.md
ack_status target: PASS_TO_PM
```
