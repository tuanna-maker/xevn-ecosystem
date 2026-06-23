# P1-BROWSER-E2E-CAT-S2S-AUTH-8088 — BE evidence

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-BROWSER-E2E-CAT-S2S-AUTH-8088` |
| **executed_at** | 2026-06-20 |
| **owner** | dev-be |
| **ack_status** | **READY_FOR_QA** |
| **U65** | zero-seed — no DB/API seed |

## Symptom (VPS R6 residual)

Post-deploy probe (`docs/ops/evidence/p1-deploy-cat-inbox-r6-8088-20260620.md`):

- POST HRM `extension-items` → **201** `HRM-SET-209` but `workflowInstanceId: null`
- `xbos-be` log: `POST /api/xbos/catalog-governance/workflows/start` → **401** `XBOS-AUTH-001` Unauthorized catalog governance access

## Root cause

`XbosCatalogWorkflowBridge` sent only `x-internal-api-key`. On Docker/VPS with `NODE_ENV=production`, `isAuthorizedInternalRequest` in xbos-api **does not** accept static key alone — requires verified **service JWT** (`Authorization: Bearer …`), same class as UF-HRM-10 `config-sync` fix (`buildXbosUpstreamHeaders`).

Secondary risk: `apps/api/*/.env` had `SERVICE_JWT_SECRET=replace_with_strong_secret` while deploy stack expected `xevn-dev-jwt-secret` — compose now pins aligned secrets on both containers.

## Fix

| File | Change |
|------|--------|
| `apps/api/hrm-api/src/settings-catalogs/xbos-catalog-workflow.bridge.ts` | Inject `CatalogSyncService`; call `buildXbosUpstreamHeaders(undefined, { tenantId, companyId })` on `workflows/start` |
| `deploy/xevn-ecosystem/docker-compose.yml` | Pin `SERVICE_JWT_SECRET` / `ISSUER` / `AUDIENCE` on `hrm-be` + `xbos-be` (parity with `INTERNAL_API_KEY`) |
| `deploy/xevn-ecosystem/.env.example` | Document S2S JWT vars next to `INTERNAL_API_KEY` |

## Expected flow after fix

```text
FE extension save (UF-XBOS-09/15)
 → HRM HRM-SET-209
 → bridge POST xbos catalog-governance/workflows/start
     headers: x-internal-api-key + Authorization service JWT (hrm-be / batch scope)
 → XBOS XBOS-CAT-211 workflowInstanceId
 → catalog-governance inbox ≥ 1 for ceo@xe.vn
```

## Verification (local)

| Package | Spec | Result |
|---------|------|--------|
| hrm-api | `p1-browser-e2e-cat-s2s-auth-8088.spec.ts` | **2/2 PASS** |
| hrm-api | `p1-browser-e2e-inbox-spawn-cat.spec.ts` | **3/3 PASS** |
| hrm-api | `p1-web-acceptance-be-sync401.spec.ts` | **3/3 PASS** |
| xbos-api | `catalog-governance.controller.spec.ts` | **15/15 PASS** (incl. production JWT-only + key-only reject) |
| hrm-api | `pnpm run build` | exit **0** |
| xbos-api | `pnpm run build` | exit **0** |

## VPS deploy (devops — after merge/pscp)

```text
pscp apps/api/hrm-api/src/settings-catalogs/xbos-catalog-workflow.bridge.ts
     deploy/xevn-ecosystem/docker-compose.yml
     deploy/xevn-ecosystem/.env.example
docker compose up -d --force-recreate hrm-be xbos-be
```

Re-run probe: `scripts/tmp-p1-deploy-cat-inbox-r6-probe-8088.mjs` — expect `workflowInstanceId` non-null + inbox ≥ 1.

## QA handoff (U65 browser-only)

- **URL:** http://14.225.217.232:8088/
- **Account:** `ceo@xe.vn` / `Xevn@2026`
- **UF:** UF-XBOS-09, UF-XBOS-15
- **PASS when:** extension save → HRM-SET-209 with `workflowInstanceId` + catalog-governance inbox task → Duyệt `XBOS-CAT-201` + F5

## Handoff

- **completion_report:** Bridge S2S auth aligned with catalog-sync service JWT; compose JWT parity; jest + build PASS.
- **residual:** VPS containers must be recreated with updated bridge + compose env (devops pscp).
- **next_owner:** devops (deploy) → qa (UF-09/15 retest)
- **next_dispatch_prompt:** Task devops — work_item_id P1-DEPLOY-CAT-S2S-AUTH-8088: pscp `xbos-catalog-workflow.bridge.ts` + `docker-compose.yml` to 14.225.217.232, `docker compose up -d --force-recreate hrm-be xbos-be`, verify `SERVICE_JWT_SECRET`/`INTERNAL_API_KEY` match on both containers, re-run `scripts/tmp-p1-deploy-cat-inbox-r6-probe-8088.mjs` exit 0 with non-null workflowInstanceId. Then Task qa — work_item_id P1-BROWSER-E2E-XBOS-WAVE-8088-R6-S2S: U65 browser UF-09/15 on :8088, evidence update USER_FLOW_OPERABILITY_MATRIX Dev8088, ack_status PASS_TO_PM or FAIL_TO_PM.
