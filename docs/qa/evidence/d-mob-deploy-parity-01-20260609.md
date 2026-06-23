# D-MOB-DEPLOY-PARITY-01 — hrm-be nip.io deploy (leave slug + home/summary)

| Field | Value |
|-------|-------|
| **work_item_id** | `D-MOB-DEPLOY-PARITY-01` |
| **from_role** | devops |
| **to_role** | qa |
| **ack_status** | `READY_FOR_QA` |
| **generatedAt** | 2026-06-09 |
| **target** | `https://14-225-217-232.nip.io` / VPS `14.225.217.232` |

## Scope

Deploy dev-be fixes for **holding slug** on leave-requests + **home/summary** aggregate to pilot hrm-be. Pre-deploy nip.io showed leave-requests `company_id=holding` → **500** `HRM-SYS-001` (uuid cast).

## Deploy steps executed

1. **Audit VPS** — `xevn-hrm-be-dev` Up (healthy); ports canonical via `merge-vps-port-env.mjs`.
2. **PSCP sync** (13 files) — `scripts/tmp-vps-pscp-d-mob-deploy-parity-01.ps1`:
   - `leave-requests.service.ts` + spec
   - `hrm-inbox.service.ts` + spec
   - `home/*` module (controller, service, dto, types, specs)
   - `app.module.ts`, `hrm-list-scope.ts` + spec
3. **Force-recreate hrm-be** — `scripts/tmp-vps-deploy-hrm-be-d-mob-deploy-parity-01.sh`
   - `docker compose up -d --build --force-recreate hrm-be`
   - Post-hook: `vps-post-hrm-be-mob-pilot-qual.sh` PASS (pending manager queue)
4. **Non-xevn containers** — tasmos_* still Up (no `compose down`).

## Gate table

| Gate | Pre-deploy | Post-deploy | PASS |
|------|------------|-------------|------|
| HRM metrics (HTTPS) | 200 | 200 | ✅ |
| leave-requests holding slug (nv0001) | 500 HRM-SYS-001 | 200 HRM-LEAVE-200 | ✅ |
| leave-balance holding (nv0001) | 200 8/3 | 200 8/3 | ✅ |
| home/summary holding tasks (nv0001) | 400/500 (pre-fix) | 200 HRM-HOME-200 | ✅ |
| leave slug probe 4/4 | 3/4 FAIL | 4/4 PASS | ✅ |
| nv0002 scoped company (`trsport`) | — | leave/balance/home 200 | ✅ |

## Smoke commands & artifacts

```bash
# Leave slug regression (4 probes)
HRM_API_BASE_URL=https://14-225-217-232.nip.io node scripts/tmp-d-mob-parity-leave-slug-01-probe.mjs
# → summary.verdict PASS (4/4)

# Parity smoke both personas (company_id = login default)
HRM_API_BASE_URL=https://14-225-217-232.nip.io node scripts/tmp-d-mob-deploy-parity-01-probe.mjs
# → nv0001 holding 3/3 PASS; nv0002 must use trsport (not holding) — see note below

# Home summary extended (J-MOB-06 tasks block)
HRM_API_BASE_URL=https://14-225-217-232.nip.io node scripts/tmp-pcomp-w7-qa-home-summary-01-probe.mjs
# → J-MOB-06 PASS; J-MOB-08/09 need celebrations/whos_out seed (data gap, not deploy)
```

**JSON evidence:** `docs/qa/evidence/d-mob-deploy-parity-01-probe.json`, `docs/qa/evidence/d-mob-parity-leave-slug-01-probe.json`

### Persona matrix (post-deploy)

| Persona | company_id query | leave-requests | leave-balance | home/summary |
|---------|------------------|----------------|---------------|--------------|
| `uat.nv0001@xe.vn` | `holding` | 200 HRM-LEAVE-200 | 200 8 avail / 3 used | 200 tasks=11 mgr=1 |
| `uat.nv0002@xe.vn` | `trsport` (JWT default) | 200 HRM-LEAVE-200 | 200 HRM-LEAVE-BAL-200 | 200 HRM-HOME-200 |

**Note:** nv0002 JWT scope is member company `trsport`; queries with `company_id=holding` correctly return **409 SCOPE_CONTEXT_MISMATCH** (RBAC, not regression).

## Residual (QA lane)

- **J-MOB-08 / J-MOB-09:** celebrations/whos_out counts 0 on pilot — seed/data, not route 500; QA may verify separately if in matrix scope.
- **Git:** fixes synced via PSCP (uncommitted on main); PM should schedule commit+push for persistence.

## Files synced (manifest)

See `scripts/tmp-vps-pscp-d-mob-deploy-parity-01.ps1` (13 paths under `apps/api/hrm-api/src/`).

---

**completion_report:** hrm-be redeployed on VPS; holding slug leave-requests 500→200; home/summary 200 for nv0001; nv0002 scoped endpoints 200. L0 stack healthy. Celebrations/whos_out seed out of scope.

**next_owner:** qa

**next_dispatch_prompt:**

```
work_item_id: D-MOB-DEPLOY-PARITY-01
from_role: pm
to_role: qa
lane: execution
entry_criteria: devops READY_FOR_QA — nip.io hrm-be redeployed; docs/qa/evidence/d-mob-deploy-parity-01-20260609.md
action: Retest MOB-PARITY / J-MOB-06 on nip.io — uat.nv0001 holding leave-requests + leave-balance + home/summary; uat.nv0002 with trsport scope; L2.5 J-MOB-25 leave-balance chip if in matrix
exit_criteria: evidence docs/qa/evidence/d-mob-deploy-parity-01-qa-20260609.md; ack_status PASS_TO_PM or FAIL with defect ids
```

**evidence_path:** `docs/qa/evidence/d-mob-deploy-parity-01-20260609.md`

**ack_status:** `READY_FOR_QA`
