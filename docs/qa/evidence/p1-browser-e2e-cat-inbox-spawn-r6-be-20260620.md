# P1-BROWSER-E2E-CAT-INBOX-SPAWN-8088-R6 — BE evidence

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-BROWSER-E2E-CAT-INBOX-SPAWN-8088-R6` |
| **role** | dev-be |
| **executed_at** | 2026-06-20 |
| **entry** | QA R5 UF-XBOS-09/15 BLOCKED — `docs/qa/evidence/p1-browser-e2e-xbos-r5-8088-20260620.md` |
| **ack_status** | **READY_FOR_QA** |
| **U65** | NO seed |

---

## Root cause

| Symptom | Cause |
|---------|-------|
| POST `extension-items` **201** `HRM-SET-209` with `workflowInstanceId: null` | HRM bridge called XBOS `catalog-governance/workflows/start`; XBOS failed mid-flight and bridge swallowed error |
| GET `catalog-governance/inbox` **200** `items: []` | `startCatalogApprovalWorkflow` never created instance/tasks |

**Two defects in XBOS `CatalogGovernanceService` S2S path:**

1. **`hrmFetch` without scope headers** — GET/POST `/settings-catalogs/batches/*` requires `x-tenant-id` + `x-company-id` when only `x-internal-api-key` is present (`SCOPE_TENANT_REQUIRED` / wrong partition). Member tourism batches use `xe-du-lich/main`; group CEO uses `xevn/holding`.
2. **Wrong HRM upstream URL in Docker** — default `http://127.0.0.1:${HRM_BE_PORT}` from inside `xbos-be` container cannot reach `hrm-be:3001`.

WF definition spawn (UF-08) worked after R4 deploy because it is XBOS-only; catalog path requires HRM round-trip.

---

## Fixes

| File | Change |
|------|--------|
| `apps/api/xbos-api/src/common/resolve-hrm-api-base-url.ts` | Docker-aware HRM upstream (`hrm-be:3001` when `DOCKER=1` / `/.dockerenv`) |
| `apps/api/xbos-api/src/catalog-governance/catalog-governance.service.ts` | `hrmFetch` sends `x-tenant-id` / `x-company-id` from batch member scope; approve/detail/review use instance `context.memberTenantId/memberCompanyId` |
| `apps/api/hrm-api/src/settings-catalogs/xbos-catalog-workflow.bridge.ts` | Richer warn log on XBOS start failure (code/message) |
| `deploy/xevn-ecosystem/docker-compose.yml` | `xbos-be`: `HRM_API_URL=http://hrm-be:3001`, `DOCKER=1` |

Flow after fix (browser, no seed):

```text
FE company_group_hr → Thêm field → Xác nhận
 → HRM POST …/extension-items → HRM-SET-209 + workflowInstanceId set
 → HRM bridge → XBOS POST catalog-governance/workflows/start
 → XBOS hrmFetch GET batch (scoped) → startInstance → inbox task ceo@xe.vn
 → GET catalog-governance/inbox items ≥ 1
 → Duyệt POST …/tasks/{id}/approve → XBOS-CAT-201
```

---

## Verification (local)

| Package | Spec | Result |
|---------|------|--------|
| xbos-api | `p1-browser-e2e-inbox-spawn-cat.spec.ts` | **1/1 PASS** |
| xbos-api | `resolve-hrm-api-base-url.spec.ts` | **3/3 PASS** |
| xbos-api | `catalog-governance.controller.spec.ts` | **13/13 PASS** |
| hrm-api | `p1-browser-e2e-inbox-spawn-cat.spec.ts` | **3/3 PASS** |
| hrm-api | `settings-catalogs.controller.spec.ts` | **33/33 PASS** |

Build: `xbos-api` + `hrm-api` `pnpm run build` → exit **0**

---

## QA retest (:8088) — U65 browser

**Account:** `ceo@xe.vn` / `Xevn@2026` · http://14.225.217.232:8088/

### UF-XBOS-09 / UF-XBOS-15

1. `?settings=company_group_hr` → **X.E Du lịch VN** → **Cấu hình chi tiết** → **Thêm field** → **Xác nhận (áp dụng)**
2. Network: POST `…/extension-items` **201** `HRM-SET-209` — response `data.workflowInstanceId` **not null**
3. Network: observe POST `/api/xbos/catalog-governance/workflows/start` **201** `XBOS-CAT-211` (via bridge, may appear on HRM side only)
4. `?settings=hrm_catalog_governance` → **Hộp thư (≥1)**
5. **Duyệt** → POST `catalog-governance/tasks/{id}/approve` **201** `XBOS-CAT-201`; F5

**Cấm:** `pnpm seed:*`

---

## Deploy hint (devops — :8088 sync required)

VPS must rebuild/recreate **xbos-be** (primary) + optional **hrm-be** (bridge log only):

```powershell
# pscp sources (minimum xbos side)
pscp apps/api/xbos-api/src/common/resolve-hrm-api-base-url.ts root@14.225.217.232:/opt/xevn-ecosystem/apps/api/xbos-api/src/common/
pscp apps/api/xbos-api/src/catalog-governance/catalog-governance.service.ts root@14.225.217.232:/opt/xevn-ecosystem/apps/api/xbos-api/src/catalog-governance/
pscp apps/api/hrm-api/src/settings-catalogs/xbos-catalog-workflow.bridge.ts root@14.225.217.232:/opt/xevn-ecosystem/apps/api/hrm-api/src/settings-catalogs/
pscp deploy/xevn-ecosystem/docker-compose.yml root@14.225.217.232:/opt/xevn-ecosystem/deploy/xevn-ecosystem/

# on VPS
cd /opt/xevn-ecosystem/deploy/xevn-ecosystem
docker compose --env-file .env up -d --force-recreate xbos-be hrm-be
```

Post-deploy smoke (no seed): extension field from FE → inbox count +1 for `ceo@xe.vn`.

---

## Handoff packet

- **completion_report:** Closed R-W1-09-CAT-SPAWN root cause — XBOS catalog workflow start could not read HRM batch (missing scope headers + docker localhost URL). Implemented scoped S2S fetch + `resolveHrmApiBaseUrl`; compose pins `HRM_API_URL` for xbos-be. Jest/build PASS. Residual: VPS deploy + QA browser UF-09/15.
- **next_owner:** devops (deploy :8088) → qa
- **next_dispatch_prompt:** Task qa — work_item_id P1-BROWSER-E2E-XBOS-WAVE-8088-R6: entry_criteria dev-be R6 READY_FOR_QA after devops sync xbos-be (+ hrm-be bridge log) on http://14.225.217.232:8088/; evidence docs/qa/evidence/p1-browser-e2e-cat-inbox-spawn-r6-be-20260620.md; U65 zero-seed browser-only; account ceo@xe.vn / Xevn@2026. exit_criteria: UF-XBOS-09 company_group_hr extension → HRM-SET-209 with workflowInstanceId + catalog-governance inbox ≥1 → Duyệt XBOS-CAT-201 + F5; UF-XBOS-15 same path; update USER_FLOW_OPERABILITY_MATRIX Dev8088; ack_status PASS_TO_PM or FAIL_TO_PM.
- **evidence_path:** `docs/qa/evidence/p1-browser-e2e-cat-inbox-spawn-r6-be-20260620.md`
- **ack_status:** **READY_FOR_QA**
