# P1-PHASE1-DO-JXBOS-02-DEPLOY-01 — J-XBOS-02 catalog-sync hrm-be deploy (2026-06-05)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-PHASE1-DO-JXBOS-02-DEPLOY-01` |
| **related_be** | `P1-PHASE1-BE-JXBOS-02-PULL-01` |
| **from_role** | `devops` |
| **to_role** | `qa` |
| **journey** | **J-XBOS-02** |
| **pilot_url** | `https://14-225-217-232.nip.io` |
| **VPS** | `root@14.225.217.232` `/opt/xevn-ecosystem` |
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
| `POST …/catalog-sync/pull/contract_types?tenantId=xevn&companyId=holding` | **PASS** | HTTP **201** `HRM-SYNC-200` (not 409) |
| `GET …/catalog-sync?tenantId=xevn&companyId=holding` | **PASS** | HTTP **200** `HRM-SYNC-202`, **total=74** |
| `GET …/catalog-sync` with `x-company-id: holding` | **PASS** | HTTP **200** `HRM-SYNC-202` |
| L0 `qc:dev-stack` (nip.io override) | **PASS** | exit 0 |
| Deploy probe `JXBOS_02_DEPLOY_PROBE_OK` | **PASS** | exit 0 |

---

## Deploy method

BE catalog-sync scope fix was **local-only** (uncommitted vs `origin/main` at `68ec457`). Synced via **pscp** then image rebuild (same pattern as `p1-phase1-do-hrm-scope-s5-02-20260605.md`).

| Step | Action |
|------|--------|
| 0 | VPS audit — xevn containers Up; HEAD `68ec457` |
| 1 | `pscp` 5 runtime files to `/opt/xevn-ecosystem/` |
| 2 | Remote `merge-vps-port-env.mjs --apply-canonical` |
| 3 | `docker compose --env-file .env up -d --build --force-recreate hrm-be` |
| 4 | Wait 50s; metrics smoke |
| 5 | Local nip.io J-XBOS-02 probe + `qc:dev-stack` |

### Files synced (pscp)

| Path |
|------|
| `apps/api/hrm-api/src/common/hrm-catalog-sync-scope.ts` |
| `apps/api/hrm-api/src/common/hrm-catalog-sync-scope.spec.ts` |
| `apps/api/hrm-api/src/catalog-sync/catalog-sync.controller.ts` |
| `apps/api/hrm-api/src/catalog-sync/catalog-sync.service.ts` |
| `apps/api/hrm-api/src/catalog-sync/catalog-sync.controller.spec.ts` |

**Scripts (repo, no secrets):** `scripts/tmp-vps-pscp-jxbos-02-catalog-sync-20260605.ps1`, `scripts/tmp-vps-deploy-hrm-be-jxbos-02-20260605.sh`, `scripts/tmp-run-vps-jxbos-02-deploy-20260605.ps1`, `scripts/tmp-p1-s5-do-jxbos-02-deploy-probe.mjs`

---

## Remote smoke (post-recreate)

```text
[smoke] hrm metrics HTTP 200
[smoke] https hrm metrics HTTP 200
xevn-hrm-be-dev   Up (healthy)   0.0.0.0:3001->3001/tcp
VPS HEAD=68ec457
non-xevn: tasmos_*, asms_*, viconnec_* — Up (unchanged)
```

---

## Pilot J-XBOS-02 smoke (ceo@xe.vn)

```powershell
$env:PORTAL_DEV_URL='https://14-225-217-232.nip.io'
node scripts/tmp-p1-s5-do-jxbos-02-deploy-probe.mjs
# exit 0 — JXBOS_02_DEPLOY_PROBE_OK
```

| Probe | Before deploy (BE evidence) | After deploy |
|-------|----------------------------|--------------|
| `POST pull/contract_types?companyId=holding` | **409** / **502** | **201** `HRM-SYNC-200` |
| `GET catalog-sync?companyId=holding` | **409** (QA) / partial **200** | **200** `HRM-SYNC-202`, total **74** |
| `GET catalog-sync` + `x-company-id: holding` | **409** | **200** `HRM-SYNC-202` |

**Executed_at (probe):** `2026-06-05T02:46:07.335Z`

### Workstation L0

```powershell
$env:HRM_HEALTH_URL='https://14-225-217-232.nip.io/api/hrm'
$env:XBOS_HEALTH_URL='https://14-225-217-232.nip.io/api/xbos'
$env:PORTAL_DEV_URL='https://14-225-217-232.nip.io'
pnpm run qc:dev-stack
# exit 0
```

---

## Residual / PM hint

| Item | Owner | Trigger |
|------|-------|---------|
| Push J-XBOS-02 BE sources to `origin/main` | `dev-be` / PM | Avoid pscp drift on next VPS pull |
| `settings-catalogs/sync-from-xbos` bulk JWT pass-through | `dev-be` (backlog) | Out of this slice |
| Full L2.5 J-XBOS-02 UI journey | `qa` | Formal retest post-deploy |

---

## Handoff

- **completion_report:** Deployed J-XBOS-02 catalog-sync scope fix to pilot `hrm-be`; POST pull and GET list return **200/201** on nip.io for `ceo@xe.vn` with `companyId=holding` (no 409); holding header alias **200**; L0 stack healthy.
- **next_owner:** `qa`
- **next_dispatch_prompt:** see below
- **evidence_path:** `docs/ops/evidence/p1-s5-do-jxbos-02-deploy-20260605.md`
- **ack_status:** **READY_FOR_QA**

### next_dispatch_prompt (copy-ready)

```
work_item_id: P1-S5-QA-JXBOS-02-RETEST-01
from_role: devops
to_role: qa
entry_criteria: P1-PHASE1-DO-JXBOS-02-DEPLOY-01 READY_FOR_QA — hrm-be redeployed on https://14-225-217-232.nip.io; DevOps smoke POST catalog-sync/pull contract_types holding → 201 HRM-SYNC-200; GET catalog-sync holding → 200 total 74; evidence docs/ops/evidence/p1-s5-do-jxbos-02-deploy-20260605.md + docs/qa/evidence/p1-phase1-be-jxbos-02-pull-20260605.md
exit_criteria: L2.5 J-XBOS-02 on nip.io — ceo@xe.vn login → POST /api/hrm/catalog-sync/pull/contract_types?tenantId=xevn&companyId=holding → 200/201 HRM-SYNC-200; GET /api/hrm/catalog-sync?tenantId=xevn&companyId=holding → 200 count≥40; holding header variant 200; no 409 SCOPE_CONTEXT_MISMATCH; evidence docs/qa/evidence/p1-s5-qa-jxbos-02-retest-20260605.md; ack_status PASS_TO_PM
evidence_path: docs/qa/evidence/p1-s5-qa-jxbos-02-retest-20260605.md
ack_status: PASS_TO_PM
Accounts: ceo@xe.vn / Xevn@2026. L0: nip.io substitute if local qc:dev-stack down.
pm_dispatch_hint: After QA PASS promote J-XBOS-02 🟡→✅ on PROGRAM_JOURNEY_MAP.md
```
