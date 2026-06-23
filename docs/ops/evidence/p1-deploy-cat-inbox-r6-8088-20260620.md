# P1-DEPLOY-CAT-INBOX-R6-8088 — DevOps evidence (UF-XBOS-09/15 catalog spawn R6)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-DEPLOY-CAT-INBOX-R6-8088` |
| **from_role** | devops |
| **to_role** | qa |
| **portal** | http://14.225.217.232:8088 |
| **executed_at** | 2026-06-20T14:23+07 (ICT) |
| **ack_status** | **READY_FOR_QA** |
| **U65** | NO seed — product API mutation only (extension-items POST) |
| **trigger** | `P1-BROWSER-E2E-CAT-INBOX-SPAWN-8088-R6` BE (`docs/qa/evidence/p1-browser-e2e-cat-inbox-spawn-r6-be-20260620.md`) |

---

## Executive summary

Deployed R6 catalog-governance S2S fixes to VPS `:8088` via **pscp** (4 source files + compose env) + **force-recreate/restart** `xbos-be` + `hrm-be`. Resolved deploy blocker **XBOS-AUTH-001** (INTERNAL_API_KEY mismatch between `deploy/.env` hash and `apps/api/xbos-api/.env` dev fallback) by pinning literal `INTERNAL_API_KEY: xevn-dev-internal-key` in compose for both BE services.

**L0** `qc:dev-stack` exit **0**. **Catalog spawn smoke:** POST `extension-items` **201** `HRM-SET-209` with `workflowInstanceId` **not null** (DevOps probe exit **0**). S2S `xbos-be → hrm-be:3001` metrics **200** from inside `xevn-xbos-be-dev`.

**Residual:** QA browser UF-XBOS-09/15 full click path + inbox UI count (API `catalog-governance/inbox` returned 0 immediately after spawn — workflow instance UUID set; QA validates `?settings=hrm_catalog_governance`).

---

## Files transferred (pscp)

| Local path | Remote path |
|------------|-------------|
| `apps/api/xbos-api/src/common/resolve-hrm-api-base-url.ts` | `/opt/xevn-ecosystem/apps/api/xbos-api/src/common/` |
| `apps/api/xbos-api/src/catalog-governance/catalog-governance.service.ts` | `/opt/xevn-ecosystem/apps/api/xbos-api/src/catalog-governance/` |
| `apps/api/hrm-api/src/settings-catalogs/xbos-catalog-workflow.bridge.ts` | `/opt/xevn-ecosystem/apps/api/hrm-api/src/settings-catalogs/` |
| `deploy/xevn-ecosystem/docker-compose.yml` | `/opt/xevn-ecosystem/deploy/xevn-ecosystem/` |

Compose pins (xbos-be): `HRM_API_URL=http://hrm-be:3001`, `DOCKER=1`, `INTERNAL_API_KEY=xevn-dev-internal-key`  
Compose pins (hrm-be): `DOCKER=1`, `INTERNAL_API_KEY=xevn-dev-internal-key`, `XBOS_API_URL=http://xbos-be:28002`

Remote verify (grep): `resolveHrmApiBaseUrl`, `x-tenant-id` in `hrmFetch`, bridge richer warn log present.

---

## Deploy steps (VPS)

```bash
cd /opt/xevn-ecosystem/deploy/xevn-ecosystem
docker compose --env-file .env build xbos-be hrm-be
docker compose --env-file .env up -d --force-recreate xbos-be hrm-be
# post-fix: docker compose restart hrm-be xbos-be (Nest env reload after INTERNAL_API_KEY pin)
sleep 60–75
```

| Container | Status after deploy |
|-----------|---------------------|
| `xevn-xbos-be-dev` | Up (healthy) — recreated 2026-06-20 ~14:16 ICT |
| `xevn-hrm-be-dev` | Up (healthy) — recreated + restarted ~14:22 ICT |
| `xevn-portal-fe-dev` | Up (unchanged) |
| Non-xevn (tasmos, hsbx, …) | Untouched |

**VPS git HEAD:** `68ec457` (pscp-only drift — not committed per sponsor lock)

---

## Ops fix — INTERNAL_API_KEY (XBOS-AUTH-001)

| Symptom | Root cause | Fix |
|---------|------------|-----|
| Bridge log `XBOS workflow start failed: 401 XBOS-AUTH-001` | `hrm-be` used `deploy/.env` hash key; `xbos-be` effective auth accepted only `xevn-dev-internal-key` fallback | Compose `environment:` literal `INTERNAL_API_KEY: xevn-dev-internal-key` on **both** BE services (wins over `apps/api/*/.env`) |

Post-fix S2S test from `hrm-be` container: `workflows/start` → **404** `HRM-SET-404` (auth pass, fake batch) — not **401**.

---

## Smoke gates

### L0 stack (workstation)

```powershell
$env:HRM_HEALTH_URL='http://14.225.217.232:3001/api/hrm'
$env:XBOS_HEALTH_URL='http://14.225.217.232:28002/api/xbos'
$env:PORTAL_DEV_URL='http://14.225.217.232:8088'
pnpm run qc:dev-stack
# exit 0
```

### Remote (VPS localhost)

| Endpoint | HTTP | Result |
|----------|------|--------|
| `3001/api/hrm/metrics` | 200 | PASS |
| `28002/api/xbos/metrics` | 200 | PASS |
| `8088/` | 200 | PASS |

### S2S docker network

```text
docker exec xevn-xbos-be-dev printenv HRM_API_URL DOCKER INTERNAL_API_KEY
→ http://hrm-be:3001 / 1 / xevn-dev-internal-key
docker exec xevn-xbos-be-dev wget -qO- http://hrm-be:3001/api/hrm/metrics → HRM-METRICS-200
```

### Catalog extension spawn probe (U65 — no seed)

Script: `scripts/tmp-p1-deploy-cat-inbox-r6-probe-8088.mjs`  
JSON: `docs/ops/evidence/p1-deploy-cat-inbox-r6-probe-8088-20260620.json`

Account: `ceo@xe.vn` / `Xevn@2026`

| Step | HTTP | Result | Verdict |
|------|------|--------|---------|
| Login `:8088/api/xbos/auth/login` | 201 | JWT | PASS |
| POST `…/positions/extension-items` (xevn/holding) | **201** | `HRM-SET-209` **`workflowInstanceId=8219900a-…`** | **PASS** |
| GET `catalog-governance/inbox` (after, +3s) | 200 | count=0 (API; QA browser) | WARN |

**Cấm:** `pnpm seed:*` — not used.

---

## QA handoff (browser U63/U64/U65)

Ref: `docs/qa/evidence/p1-browser-e2e-cat-inbox-spawn-r6-be-20260620.md` §QA retest

1. `?settings=company_group_hr` → **X.E Du lịch VN** → **Thêm field** → **Xác nhận**
2. Network: POST extension-items **201** `HRM-SET-209` — `workflowInstanceId` **not null**
3. `?settings=hrm_catalog_governance` → inbox **≥1** → **Duyệt** → `XBOS-CAT-201`; F5

---

## Residual

| Item | Owner | Notes |
|------|-------|-------|
| Browser UF-XBOS-09/15 + inbox UI | **qa** | DevOps API spawn smoke only; inbox API count 0 post-spawn |
| Production INTERNAL_API_KEY policy | **devops/tm** | Dev VPS uses literal dev key; prod uses `deploy/.env` + JWT |
| VPS git parity vs `origin/main` | **pm/devops** | pscp drift on `68ec457` |

---

## Handoff packet

- **completion_report:** P1-DEPLOY-CAT-INBOX-R6-8088 closed — pscp R6 BE sources + compose (`HRM_API_URL`, `DOCKER`, aligned `INTERNAL_API_KEY`); recreate/restart `xbos-be`+`hrm-be` on :8088; L0 PASS; extension-items → `workflowInstanceId` not null (probe exit 0). Fixed XBOS-AUTH-001 S2S blocker. Residual: QA browser UF-09/15 inbox UI.
- **next_owner:** qa
- **next_dispatch_prompt:** Task qa — work_item_id P1-BROWSER-E2E-XBOS-WAVE-8088-R6: entry_criteria P1-DEPLOY-CAT-INBOX-R6-8088 READY_FOR_QA after devops sync on http://14.225.217.232:8088/; evidence docs/ops/evidence/p1-deploy-cat-inbox-r6-8088-20260620.md + docs/qa/evidence/p1-browser-e2e-cat-inbox-spawn-r6-be-20260620.md; U65 zero-seed browser-only; account ceo@xe.vn / Xevn@2026. exit_criteria: UF-XBOS-09 company_group_hr extension → HRM-SET-209 with workflowInstanceId + catalog-governance inbox ≥1 → Duyệt XBOS-CAT-201 + F5; UF-XBOS-15 same path; update USER_FLOW_OPERABILITY_MATRIX Dev8088; ack_status PASS_TO_PM or FAIL_TO_PM.
- **evidence_path:** `docs/ops/evidence/p1-deploy-cat-inbox-r6-8088-20260620.md`
- **ack_status:** **READY_FOR_QA**
