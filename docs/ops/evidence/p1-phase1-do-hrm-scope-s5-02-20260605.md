# DevOps evidence — P1-PHASE1-DO-HRM-SCOPE-S5-02 (2026-06-05)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-PHASE1-DO-HRM-SCOPE-S5-02` |
| **related_be** | `P1-PHASE1-BE-SCOPE-P0-S5-02` / **D-SCOPE-S5-HRM-RESTORE-01** |
| **from_role** | `devops` |
| **to_role** | `qa` |
| **VPS** | `root@14.225.217.232` `/opt/xevn-ecosystem` |
| **Portal** | `https://14-225-217-232.nip.io` |
| **VPS git HEAD** | `68ec457` (parity sources via **pscp** — not yet on `origin/main`) |
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
| Member CEO cross-partition restore | **PASS** | **404** `HRM-EMP-404` (not **201**) |
| Full `tmp-p1-phase1-qa-scope-p0-s5-probe.mjs` | **PASS** | exit **0** `SCOPE_P0_S5_PROBE_OK` |

---

## Deploy method

BE scope fix (**D-SCOPE-S5-HRM-RESTORE-01**) was **local-only** (uncommitted vs `origin/main` at `68ec457`). Synced via **pscp** then image rebuild (same pattern as `p1-phase1-do-hrm-emp-deploy-20260604.md`).

| Step | Action |
|------|--------|
| 1 | `pscp` 3 runtime files to `/opt/xevn-ecosystem/` |
| 2 | Remote `merge-vps-port-env.mjs --apply-canonical` |
| 3 | `docker compose --env-file .env up -d --build --force-recreate hrm-be` |
| 4 | Wait 50s; metrics smoke |
| 5 | Local nip.io scope probe + stack stability |

### Files synced (pscp)

| Path |
|------|
| `apps/api/hrm-api/src/common/hrm-list-scope.ts` |
| `apps/api/hrm-api/src/employees/employees.service.ts` |
| `apps/api/hrm-api/src/employees/employees.controller.ts` |

---

## Remote smoke (post-recreate)

```
[smoke] hrm metrics HTTP 200
[smoke] https hrm metrics HTTP 200
xevn-hrm-be-dev   Up (healthy)   0.0.0.0:3001->3001/tcp
VPS HEAD=68ec457
```

---

## Pilot scope smoke (TM-S5-P0-01 — target of deploy)

```powershell
$env:PORTAL_DEV_URL='https://14-225-217-232.nip.io'
node scripts/tmp-p1-phase1-qa-scope-p0-s5-probe.mjs
# exit 0 — SCOPE_P0_S5_PROBE_OK
```

| Check | Before deploy (QA 2026-06-05) | After deploy |
|-------|------------------------------|--------------|
| `HRM-RESTORE-MEMBER-CEO-OOS-BLOCKED` | **FAIL** HTTP **201** `HRM-EMP-204` | **PASS** HTTP **404** `HRM-EMP-404` |
| Group CEO restore happy path | PASS | PASS |
| Phantom restore | PASS 404 | PASS 404 |
| XBOS TM-S5-P0-02 / J-* spot checks | PASS | PASS |

**Executed_at (probe):** `2026-06-05T01:54:10.762Z`

---

## Residual / PM hint

| Item | Owner | Trigger |
|------|-------|---------|
| Push BE scope fix to `origin/main` | `dev-be` / PM | Avoid pscp drift on next VPS pull |
| Full QA matrix `P1-PHASE1-QA-SCOPE-P0-S5-02` | `qa` | Formal retest + evidence promote |
| SA P0-3/P0-4 (catalog-sync batch GET) | unchanged | Out of this work_item |

---

## Handoff

- **completion_report:** Deployed HRM restore scope partition fix to pilot `hrm-be`; member CEO restore on holding archived employee returns **404** on nip.io; full scope probe and stack stability **PASS**.
- **next_owner:** `qa`
- **next_dispatch_prompt:** see below
- **evidence_path:** `docs/ops/evidence/p1-phase1-do-hrm-scope-s5-02-20260605.md`
- **ack_status:** **READY_FOR_QA**

### next_dispatch_prompt (copy-ready)

```
work_item_id: P1-PHASE1-QA-SCOPE-P0-S5-02
from_role: devops
to_role: qa
entry_criteria: P1-PHASE1-DO-HRM-SCOPE-S5-02 READY_FOR_QA — hrm-be redeployed on https://14-225-217-232.nip.io; DevOps smoke HRM-RESTORE-MEMBER-CEO-OOS-BLOCKED PASS (404 HRM-EMP-404 not 201); evidence docs/ops/evidence/p1-phase1-do-hrm-scope-s5-02-20260605.md
exit_criteria: Re-run scripts/tmp-p1-phase1-qa-scope-p0-s5-probe.mjs on nip.io exit 0; confirm D-SCOPE-S5-HRM-RESTORE-01 closed; TM-S5-P0-01 member-restore IDOR no longer reproduces; publish docs/qa/evidence/p1-phase1-qa-scope-p0-s5-02-20260605.md with PASS_TO_PM or FAIL_TO_PM; ack_status PASS_TO_PM if all TM-S5 P0 HRM slices green
evidence_path: docs/qa/evidence/p1-phase1-qa-scope-p0-s5-02-20260605.md
ack_status: PASS_TO_PM
Accounts: ceo@xe.vn / du-lich.ceo@xe.vn — Xevn@2026. L0: nip.io substitute if local qc:dev-stack down.
```
