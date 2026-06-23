# P1-BROWSER-E2E-INBOX-DEPLOY-8088 — DevOps evidence (UF-XBOS-08/09/15 inbox spawn)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-BROWSER-E2E-INBOX-DEPLOY-8088` |
| **from_role** | devops |
| **to_role** | qa |
| **portal** | http://14.225.217.232:8088 |
| **executed_at** | 2026-06-20T12:47+07 (ICT) |
| **ack_status** | **READY_FOR_QA** |
| **U65** | NO seed — deploy + product API mutation only |
| **trigger** | `P1-BROWSER-E2E-INBOX-08-09` BE fix (`docs/qa/evidence/p1-browser-e2e-inbox-spawn-be-20260620.md`) |

---

## Executive summary

Deployed inbox-spawn BE fixes to VPS `:8088` stack via **pscp** (4 source files) + **force-recreate** `hrm-be` + `xbos-be`. L0 `qc:dev-stack` exit **0**. Inbox spawn smoke: POST active workflow definition **201** `XBOS-WF-201` → pending `workflow_definition_review` tasks **+2** for `ceo@xe.vn` (portal proxy + direct `:28002`). **No** `pnpm seed:workflow:inbox`.

**Residual:** QA browser retest UF-XBOS-08/09/15 (U63/U64) — full click path, F5, Network evidence. VPS git HEAD unchanged (`68ec457` — pscp-only drift).

---

## Files transferred (pscp)

| Local path | Remote path |
|------------|-------------|
| `apps/api/xbos-api/src/workflow-engine/workflow-engine.service.ts` | `/opt/xevn-ecosystem/apps/api/xbos-api/src/workflow-engine/workflow-engine.service.ts` |
| `apps/api/xbos-api/src/workflow-engine/workflow-catalog.constants.ts` | same tree |
| `apps/api/hrm-api/src/settings-catalogs/settings-catalogs.controller.ts` | `/opt/xevn-ecosystem/apps/api/hrm-api/src/settings-catalogs/settings-catalogs.controller.ts` |
| `apps/api/hrm-api/src/settings-catalogs/xbos-catalog-workflow.bridge.ts` | same tree |

Remote verify (grep):

- `maybeSpawnDefinitionInboxTask` at line 125 — xbos workflow spawn
- `bulkSync === true` at line 326 — HRM immediate write gated
- `shouldStartCatalogWorkflow` at line 18 — xevn/main bridge

---

## Deploy steps (VPS)

```bash
cd /opt/xevn-ecosystem/deploy/xevn-ecosystem
docker compose --env-file .env build hrm-be xbos-be
docker compose --env-file .env up -d --force-recreate hrm-be xbos-be
# wait ~60s — hrm-be Nest boot ~45s after recreate
```

| Container | Status after deploy |
|-----------|---------------------|
| `xevn-xbos-be-dev` | Up (healthy) — recreated 2026-06-20 ~12:45 ICT |
| `xevn-hrm-be-dev` | Up (healthy) — recreated 2026-06-20 ~12:45 ICT |
| `xevn-portal-fe-dev` | Up (unchanged) |
| Non-xevn (tasmos, hsbx, …) | Untouched |

**VPS git HEAD:** `68ec457` (pscp-only — not on `origin/main`)

---

## Smoke gates

### L0 stack (workstation)

```powershell
$env:HRM_HEALTH_URL='http://14.225.217.232:3001/api/hrm'
$env:XBOS_HEALTH_URL='http://14.225.217.232:28002/api/xbos'
$env:PORTAL_DEV_URL='http://14.225.217.232:8088'
pnpm run qc:dev-stack
# exit 0 — HRM + XBOS + portal 200
```

### Remote curl (VPS localhost, post-boot)

| Endpoint | HTTP | Result |
|----------|------|--------|
| `3001/api/hrm/metrics` | 200 | PASS |
| `28002/api/xbos/metrics` | 200 | PASS |
| `8088/` | 200 | PASS |

### UF-XBOS-08 inbox spawn probe (U65 — no seed)

Script: `scripts/tmp-p1-deploy-inbox-spawn-probe-8088.mjs`  
JSON: `docs/ops/evidence/p1-deploy-inbox-spawn-probe-8088-20260620.json`

Account: `ceo@xe.vn` / `Xevn@2026`

| Step | HTTP | Code / result | Verdict |
|------|------|---------------|---------|
| Login `:8088/api/xbos/auth/login` | 201 | XBOS-AUTH-200 | PASS |
| GET pending `workflow_definition_review` tasks (before) | 200 | count=0 | PASS |
| POST `/workflow-engine/definitions` status=active | **201** | XBOS-WF-201 `id=cd795bd2-…` | PASS |
| GET pending tasks (after) | 200 | before=0 **after=2** spawnedForDef=true | **PASS** |
| Direct `:28002/workflow-engine/tasks` pending | 200 | count=13 | PASS |
| Portal proxy `:8088/api/xbos/metrics` | 200 | PASS |
| Portal proxy `:8088/api/hrm/metrics` | 200 | PASS |

**Cấm:** `pnpm seed:workflow:inbox` — not used.

---

## QA handoff (browser U63/U64 — U65 zero-seed)

### UF-XBOS-08

1. Login `ceo@xe.vn` / `Xevn@2026` on http://14.225.217.232:8088
2. `?settings=workflow` → **Thêm quy trình mới** → fill → **Lưu quy trình** (active)
3. Network: POST `/api/xbos/workflow-engine/definitions` **201**
4. `/command-center` → Hộp thư — pending **+1** (or more for multi-step graph)
5. **Duyệt** → POST complete **201**; F5

### UF-XBOS-09 / UF-XBOS-15

1. `?settings=company_group_hr` → member → **Thêm field** → **Lưu** (Đồng bộ HRM)
2. Network: POST extension-items **201** `HRM-SET-209` (not `HRM-SET-202`)
3. `?settings=hrm_catalog_governance` → inbox **≥1**
4. **Duyệt** → `XBOS-CAT-201`; F5

Spec ref: `docs/qa/evidence/p1-browser-e2e-inbox-spawn-be-20260620.md` §QA retest

---

## Residual

| Item | Owner | Notes |
|------|-------|-------|
| Browser L2.5 UF-08/09/15 full click path | **qa** | DevOps API spawn smoke only |
| UF-14 scope 409 | **devops** | Separate `P1-BROWSER-E2E-UF14-DEPLOY-8088-R4` |
| VPS git parity vs `origin/main` | **pm/devops** | pscp drift on `68ec457` |
| CC inbox empty-banner seed hint | **dev-fe** | Remove after QA PASS |

---

## Handoff packet

- **completion_report:** P1-BROWSER-E2E-INBOX-DEPLOY-8088 closed — pscp 4 BE files (xbos workflow spawn + hrm catalog approval bridge); `hrm-be` + `xbos-be` force-recreate on :8088; L0 PASS; POST active WF definition → pending tasks +2 (no seed). Residual: QA browser UF-08/09/15.
- **next_owner:** qa
- **next_dispatch_prompt:** Task qa — work_item_id P1-BROWSER-E2E-XBOS-WAVE-8088-R5: entry_criteria P1-BROWSER-E2E-INBOX-DEPLOY-8088 READY_FOR_QA — http://14.225.217.232:8088/ L0 PASS; BE evidence docs/ops/evidence/p1-deploy-inbox-spawn-8088-20260620.md + docs/qa/evidence/p1-browser-e2e-inbox-spawn-be-20260620.md; U65 browser-only zero-seed; account ceo@xe.vn / Xevn@2026. exit_criteria: UF-XBOS-08 workflow save → inbox pending + Duyệt; UF-XBOS-09/15 extension save HRM-SET-209 → catalog-governance inbox ≥1 → approve XBOS-CAT-201; F5 persist; update USER_FLOW_OPERABILITY_MATRIX Dev8088; evidence docs/qa/evidence/p1-browser-e2e-xbos-hrm-20260620.md §R5; ack_status PASS_TO_PM or FAIL_TO_PM.
- **evidence_path:** `docs/ops/evidence/p1-deploy-inbox-spawn-8088-20260620.md`
- **ack_status:** **READY_FOR_QA**
