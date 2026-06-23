# P1-METADATA-APPLY-DEPLOY-8088 — portal-fe :8088 metadata apply UX sync

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-METADATA-APPLY-DEPLOY-8088` |
| **role** | devops |
| **executed_at** | 2026-06-20T21:45+07 |
| **portal** | http://14.225.217.232:8088/ |
| **prior_handoff** | `docs/qa/evidence/p1-metadata-apply-ux-fe-20260620.md` (dev-fe READY_FOR_QA — QA blocked on stale bundle) |
| **ack_status** | **READY_FOR_QA** |

---

## Executive summary

**PASS (deploy parity)** — VPS `:8088` now serves synced `infrastructureFieldsConfigUx.ts` + updated `CommandCenterPage.tsx` with metadata apply UX symbols. Pre-sync VPS disk had **no** `infrastructureFieldsConfigUx.ts` and **0** CommandCenter imports.

---

## Pre-deploy audit

| Check | Pre | Post (disk) |
|-------|-----|-------------|
| `infrastructureFieldsConfigUx.ts` on VPS | **MISSING** | **exists** |
| `grep -c shouldShowInfraConsumerNavHint` (ux file) | **0** | **1** |
| `grep -c buildInfraFieldsApplySuccessMessage` (CommandCenterPage) | **0** | **2** |
| `grep -c infrastructureFieldsConfigUx` (CommandCenterPage) | **0** | **1** |
| `xevn-portal-fe-dev` | Up | Up (recreated) |

---

## Actions executed

1. **pscp sync** (targeted — no `node_modules`):
   - `apps/web/web-portal/src/**` → `/opt/xevn-ecosystem/apps/web/web-portal/src`
   - `apps/web/web-portal/public/**`, `index.html`
2. **Vite cache clear:** `docker exec xevn-portal-fe-dev rm -rf .../node_modules/.vite`
3. **Force recreate:** `docker compose --env-file .env up -d --force-recreate --no-deps portal-fe`
4. **Smoke:** `:8088/` and `:8088/command-center` → **200** (~18s after recreate)

Note: `portal-fe` uses bind-mount + `node:22-alpine` (no Dockerfile build). Volume sync + recreate is canonical fix.

---

## curl verification (exit criteria)

```bash
# Served integration module
curl -s http://127.0.0.1:8088/src/integrations/infrastructureFieldsConfigUx.ts \
  | grep -c shouldShowInfraConsumerNavHint   # 1
curl -s http://127.0.0.1:8088/src/integrations/infrastructureFieldsConfigUx.ts \
  | grep -c buildInfraFieldsApplySuccessMessage # 1

# Served CommandCenter consumer wiring
curl -s http://127.0.0.1:8088/src/pages/command-center/CommandCenterPage.tsx \
  | grep -c infrastructureFieldsConfigUx          # 1
curl -s http://127.0.0.1:8088/src/pages/command-center/CommandCenterPage.tsx \
  | grep -c shouldShowInfraConsumerNavHint      # 2
curl -s http://127.0.0.1:8088/src/pages/command-center/CommandCenterPage.tsx \
  | grep -c infrastructureFieldsApplyBusy       # 3
curl -s http://127.0.0.1:8088/src/pages/command-center/CommandCenterPage.tsx \
  | grep -c applyInfrastructureFieldsConfig     # 2
curl -s http://127.0.0.1:8088/src/pages/command-center/CommandCenterPage.tsx \
  | grep -c infrastructureApplySuccessBanner    # 3
curl -s http://127.0.0.1:8088/src/pages/command-center/CommandCenterPage.tsx \
  | grep -c 'Mở màn nhập điểm hạ tầng'        # 1
```

| Symbol / text | Served count | PASS |
|---------------|--------------|------|
| `shouldShowInfraConsumerNavHint` (ux + page) | 1 + 2 | ✅ |
| `buildInfraFieldsApplySuccessMessage` | 1 (ux) + usage in page | ✅ |
| `infrastructureFieldsConfigUx` import | 1 | ✅ |
| `infrastructureFieldsApplyBusy` | 3 | ✅ |
| `applyInfrastructureFieldsConfig` | 2 | ✅ |
| `infrastructureApplySuccessBanner` | 3 | ✅ |
| `Mở màn nhập điểm hạ tầng` | 1 | ✅ |

---

## Safety / non-xevn

Non-xevn containers unchanged. No `docker compose down`.

---

## QA retest scope (U65 · browser-only · no seed)

**Persona:** `ceo@xe.vn` / `Xevn@2026` · `:8088`

| Path | Click / expect |
|------|----------------|
| **UF path A** (primary) | CC → Cài đặt → **Hạ tầng cơ sở** → **Điểm hạ tầng** → **Mở cấu hình khối & trường** → **Xác nhận (áp dụng)** → spinner + emerald banner; PUT **200** + GET refresh; custom fields on site detail; **F5** persists |
| **UF path B** | `?settings=company_member_units` → infra modal → hint + **Mở màn nhập điểm hạ tầng** → `?settings=company_infrastructure` |

**Residual (DevOps):** none — deploy parity closed. Business UF verdict = QA.

---

## Commands reference

```powershell
pscp -r -batch apps\web\web-portal\src root@14.225.217.232:/opt/xevn-ecosystem/apps/web/web-portal/
```

```bash
cd /opt/xevn-ecosystem/deploy/xevn-ecosystem
docker compose --env-file .env up -d --force-recreate --no-deps portal-fe
```
