# DevOps evidence — P1-PHASE1-DO-HRM-EMP-DEPLOY-01 (2026-06-04)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-PHASE1-DO-HRM-EMP-DEPLOY-01` |
| **related_be** | `P1-PHASE1-BE-EMP-CREATE-PARITY-01` |
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
| VPS audit + safe deploy | **PASS** | `hrm-be` only; no `docker compose down`; non-xevn untouched |
| `xevn-hrm-be-dev` recreate | **PASS** | `--build --force-recreate hrm-be` |
| Remote smoke `3001/api/hrm/metrics` | **PASS** | HTTP **200** |
| Remote smoke HTTPS `/api/hrm/metrics` | **PASS** | HTTP **200** |
| `pnpm run probe:stack-stability` | **PASS** | 20/20 login, zero 502 |
| Employee parity on pilot (`MEM-CRUD-02`, `J-HRM-02`) | **PASS** | POST/PATCH/GET **200** after deploy |
| Full `tmp-p1-phase1-member-hrm-cu-probe.mjs` | **FAIL exit 1** | **1** fail: `MEM-CRUD-01 contract GET detail` **404** (contract created without `employee_id`; separate from employee deploy) |

---

## Deploy method

Parity sources were **not yet on `origin/main`**; synced via `pscp` then image rebuild on VPS (same pattern as `vps-deploy-20260603.md`).

| Step | Action |
|------|--------|
| 1 | `pscp` 6 files: `employees.*`, `spreadsheet.*` under `apps/api/hrm-api/src/` |
| 2 | Remote `scripts/tmp-vps-deploy-hrm-be-emp-parity-20260604.sh`: stash/pull, `merge-vps-port-env.mjs --apply-canonical`, `docker compose up -d --build --force-recreate hrm-be`, sleep 45s |
| 3 | Local probes |

**Scripts (repo, no secrets):** `scripts/tmp-vps-pscp-hrm-emp-parity-20260604.ps1`, `scripts/tmp-run-vps-hrm-emp-deploy-20260604.ps1`, `scripts/tmp-vps-deploy-hrm-be-emp-parity-20260604.sh`

---

## Remote smoke (post-recreate)

```
[smoke] hrm metrics HTTP 200
[smoke] https hrm metrics HTTP 200
xevn-hrm-be-dev   Up (healthy)   0.0.0.0:3001->3001/tcp
```

---

## Local verification

```powershell
pnpm run probe:stack-stability
# PASS: 20/20 login 200/201, zero 502

$env:PORTAL_DEV_URL='https://14-225-217-232.nip.io'
node scripts/tmp-p1-phase1-member-hrm-cu-probe.mjs
# exit 1 — see probe excerpt below
```

### Probe excerpt (employee slice — target of this deploy)

| Check | Result |
|-------|--------|
| `MEM-CRUD-02 employee POST` | **PASS** HTTP 201 `HRM-EMP-201` |
| `MEM-CRUD-02 employee PATCH` | **PASS** HTTP 200 `HRM-EMP-202` |
| `J-HRM-02 scope parity GET` | **PASS** HTTP 200 |
| `MEM-CRUD-01 contract GET detail` | **FAIL** HTTP 404 (probe creates contract without `employee_id`; `getContractById` SQL requires joined employee) |

**Control:** Existing list row with `employee_id` → GET **200** `HRM-CON-200` on same stack (post-deploy).

---

## Residual / PM hint

| Item | Owner | Trigger |
|------|-------|---------|
| Push `P1-PHASE1-BE-EMP-CREATE-PARITY-01` sources to `main` (currently VPS-only via pscp) | `dev-be` / PM | Next commit wave |
| `MEM-CRUD-01 contract GET` for orphan contracts (no `employee_id`) | `dev-be` | Separate work item; not blocking employee create parity QA |
| Full probe exit **0** | `qa` + `dev-be` | QA may sign **MEM-CRUD-02** / **J-HRM-02** / **AC-CRUD-HRM-EMP-M-C-01** while contract GET tracked separately |

---

## completion_report

- Recreated **`xevn-hrm-be-dev`** with employee create scope persist parity build; HRM metrics and stack-stability **PASS**.
- Employee C/U and **J-HRM-02** PASS on nip.io pilot.
- Full member CU probe still **exit 1** due to pre-existing contract GET detail gap (not regressed by this deploy).

## next_owner

**qa**

## next_dispatch_prompt

```
work_item_id: P1-PHASE1-QA-CRUD-JOURNEY-03
from_role: pm
to_role: qa
entry_criteria: devops READY_FOR_QA docs/ops/evidence/p1-phase1-do-hrm-emp-deploy-20260604.md — hrm-be redeployed; MEM-CRUD-02 + J-HRM-02 PASS on https://14-225-217-232.nip.io.
exit_criteria: Re-run PORTAL_DEV_URL=https://14-225-217-232.nip.io node scripts/tmp-p1-phase1-member-hrm-cu-probe.mjs; promote AC-CRUD-HRM-EMP-M-C-01 on MEM-CRUD-02/J-HRM-02 PASS; document MEM-CRUD-01 contract GET 404 as separate defect if still failing; PASS_TO_PM with docs/qa/evidence/p1-phase1-qa-crud-journey-03-20260604.md.
evidence_path: docs/qa/evidence/p1-phase1-qa-crud-journey-03-20260604.md
ack_status target: PASS_TO_PM
```
