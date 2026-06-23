# BE evidence — P1-PHASE1-BE-CRUD-PARITY-MAIN-01 (C-CRUDQC-07)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-PHASE1-BE-CRUD-PARITY-MAIN-01` |
| **condition** | **C-CRUDQC-07** — VPS pilot was hot-fixed via `pscp` before sources were on `origin/main`; workspace must hold parity fixes and devops gets a reproducible deploy/PR file list |
| **from_role** | dev-be |
| **to_role** | qa |
| **ack_status** | **READY_FOR_QA** |
| **date** | 2026-06-04 |

## Problem

QC **GO WITH CONDITIONS** (`p1-phase1-qc-crud-journey-03-20260604.md`): pilot **hrm-be** / **xbos-be** images were built from partial **`pscp`** syncs while `origin/main` at VPS HEAD `68ec457` lacked employee-create persist and legal-entity-profile read-scope fixes. Drift risk on next `git pull` deploy without merging these paths.

## VPS `pscp` hotfix inventory (authoritative)

Sources: `docs/ops/evidence/p1-phase1-do-hrm-emp-deploy-20260604.md`, `docs/ops/evidence/p1-phase1-do-xbos-be-scope-deploy-20260604.md`, `scripts/tmp-vps-pscp-hrm-emp-parity-20260604.ps1`.

### Track A — HRM employee create persist (`P1-PHASE1-BE-EMP-CREATE-PARITY-01`)

| # | Repo path (synced to `/opt/xevn-ecosystem/…`) |
|---|-----------------------------------------------|
| 1 | `apps/api/hrm-api/src/employees/employees.service.ts` |
| 2 | `apps/api/hrm-api/src/employees/employees.controller.ts` |
| 3 | `apps/api/hrm-api/src/employees/employees.service.spec.ts` |
| 4 | `apps/api/hrm-api/src/employees/employees.controller.spec.ts` |
| 5 | `apps/api/hrm-api/src/spreadsheet/spreadsheet.service.ts` |
| 6 | `apps/api/hrm-api/src/spreadsheet/spreadsheet.controller.ts` |

**Deploy helper (repo):** `scripts/tmp-vps-pscp-hrm-emp-parity-20260604.ps1` → `scripts/tmp-run-vps-hrm-emp-deploy-20260604.ps1` → `scripts/tmp-vps-deploy-hrm-be-emp-parity-20260604.sh` (recreate **`hrm-be`** only).

### Track B — XBOS legal-entity read scope (`P1-PHASE1-BE-SCOPE-CRUD-01`)

| # | Repo path (synced to `/opt/xevn-ecosystem/…`) |
|---|-----------------------------------------------|
| 1 | `apps/api/xbos-api/src/legal-entity-profile/legal-entity-profile.controller.ts` |
| 2 | `apps/api/xbos-api/src/legal-entity-profile/legal-entity-profile.controller.spec.ts` |
| 3 | `apps/api/xbos-api/src/common/xbos-group-legal-scope.spec.ts` |

**Deploy:** devops wave `P1-PHASE1-DO-XBOS-BE-SCOPE-DEPLOY-01` — `docker compose … up -d --build --force-recreate xbos-be` after pscp (see ops evidence).

### Workspace parity check (2026-06-04)

| Fix | Present in workspace |
|-----|----------------------|
| `createEmployee` → `resolveHrmPersistCompanyIdText` + `tenant_id` stamp | **YES** — `employees.service.ts` |
| `legal-entity-profile` GET → `resolveXbosGroupLegalReadScopeContext` | **YES** — `legal-entity-profile.controller.ts` |
| Mutation scope helper on profile writes | **YES** — `resolveXbosGroupLegalMutationScopeContext` |

## PR / merge scope for devops (recommended `main` commit)

**Preferred deploy:** `git pull origin main` on VPS + standard `deploy/xevn-ecosystem/deploy.sh` (or compose rebuild both APIs). **Avoid** partial pscp after this merge.

### `hrm-api` package (employee persist)

| Path | Role |
|------|------|
| `apps/api/hrm-api/src/employees/employees.service.ts` | Persist `main`→`holding`, tenant partition |
| `apps/api/hrm-api/src/employees/employees.controller.ts` | Auth + scope context on create |
| `apps/api/hrm-api/src/employees/employees.service.spec.ts` | Regression |
| `apps/api/hrm-api/src/employees/employees.controller.spec.ts` | Regression |
| `apps/api/hrm-api/src/employees/p1-phase1-be-emp-create-parity.spec.ts` | HTTP create→GET→PATCH→list |
| `apps/api/hrm-api/src/spreadsheet/spreadsheet.service.ts` | Import commit parity |
| `apps/api/hrm-api/src/spreadsheet/spreadsheet.controller.ts` | Import headers |
| `apps/api/hrm-api/src/common/hrm-list-scope.ts` | `resolveHrmPersistCompanyIdText` (already on main; required at build) |

**Service:** recreate **`hrm-be`** only.

### `xbos-api` package (legal scope)

| Path | Role |
|------|------|
| `apps/api/xbos-api/src/legal-entity-profile/legal-entity-profile.controller.ts` | Read/mutation scope resolvers |
| `apps/api/xbos-api/src/legal-entity-profile/legal-entity-profile.controller.spec.ts` | Group CEO member-tenant shareholders |
| `apps/api/xbos-api/src/common/xbos-group-legal-scope.ts` | Resolver implementation (VPS likely had from prior wave; include in PR) |
| `apps/api/xbos-api/src/common/xbos-group-legal-scope.spec.ts` | U28 member CEO block |
| `apps/api/xbos-api/src/org-foundation/org-foundation.legal-scope-crud.integration.spec.ts` | Supertest browser-shaped GET |

**Service:** recreate **`xbos-be`** only.

### DevOps verification after deploy

```powershell
$env:PORTAL_DEV_URL='https://14-225-217-232.nip.io'
node scripts/tmp-p1-phase1-member-hrm-cu-probe.mjs
node scripts/tmp-phase1-be-scope-crud-probe.mjs
```

Expect both exit **0** (no pscp drift).

## Local verification (dev-be)

```text
pnpm --filter hrm-api test -- employees.service.spec.ts employees.controller.spec.ts p1-phase1-be-emp-create-parity.spec.ts hrm-list-scope.spec.ts
→ 4 suites, 35/35 PASS

pnpm --filter xbos-api test -- legal-entity-profile.controller.spec.ts xbos-group-legal-scope.spec.ts org-foundation.legal-scope-crud.integration.spec.ts
→ 3 suites, 25/25 PASS

pnpm --filter xbos-api test
→ 45 suites, 242/242 PASS

pnpm --filter hrm-api test
→ 47 passed, 1 failed: perf-budget/ci.perf-budget.spec.ts (catalog-sync timing flake; unrelated to C-CRUDQC-07)

pnpm --filter hrm-api build && pnpm --filter xbos-api build
→ PASS
```

## Related evidence

| Artifact | Link |
|----------|------|
| HRM create parity BE | `docs/qa/evidence/p1-phase1-be-emp-create-parity-20260604.md` |
| XBOS scope CRUD BE | `docs/qa/evidence/p1-phase1-be-scope-crud-20260604.md` |
| VPS hrm deploy | `docs/ops/evidence/p1-phase1-do-hrm-emp-deploy-20260604.md` |
| VPS xbos deploy | `docs/ops/evidence/p1-phase1-do-xbos-be-scope-deploy-20260604.md` |
| QC condition | `docs/qa/evidence/p1-phase1-qc-crud-journey-03-20260604.md` § C-CRUDQC-07 |

## Residual

- **No git commit/push** in this wave (per user policy); PM/devops merges listed paths to `main` then standard VPS deploy.
- Full `hrm-api` jest: 1 perf-budget flake on shared runner — parity suites green.
- **C-CRUDQC-06** orphan contract GET without `employee_id` — out of slice (watch only).

## completion_report

- Catalogued **9** VPS `pscp` hotfix files (6 HRM + 3 XBOS) and **15** recommended PR paths for devops standard deploy.
- Confirmed workspace contains employee persist + legal-entity read scope fixes; targeted jest **60/60** PASS; both API **build** PASS; xbos full **242/242** PASS.

## next_owner

**qa**

## next_dispatch_prompt

```
work_item_id: P1-PHASE1-QA-CRUD-PARITY-MAIN-01
from_role: pm
to_role: qa
entry_criteria: dev-be READY_FOR_QA docs/qa/evidence/p1-phase1-be-crud-parity-main-20260604.md — C-CRUDQC-07 workspace parity verified; devops may merge PR paths to main and redeploy hrm-be + xbos-be (or confirm pilot already matches workspace HEAD after pull).
exit_criteria: On https://14-225-217-232.nip.io — node scripts/tmp-p1-phase1-member-hrm-cu-probe.mjs exit 0 AND node scripts/tmp-phase1-be-scope-crud-probe.mjs exit 0; no regression vs p1-phase1-qc-crud-journey-03; PASS_TO_PM with evidence path.
evidence_path: docs/qa/evidence/p1-phase1-qa-crud-parity-main-20260604.md
ack_status target: PASS_TO_PM
```
