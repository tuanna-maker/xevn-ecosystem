# P1-DEPLOY-8088-BROWSER-E2E-PREP — DevOps evidence

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-DEPLOY-8088-BROWSER-E2E-PREP` |
| **from_role** | pm |
| **to_role** | qa |
| **portal** | http://14.225.217.232:8088 |
| **executed_at** | 2026-06-20T09:42–09:46+07 (VPS local) |
| **ack_status** | **READY_FOR_QA** |
| **trigger** | Sponsor U63 — browser E2E XBOS→HRM on :8088; FE includes P1-CC-SHR-RATIO-UX-01-FE |

---

## Executive summary

Recursive **pscp** of `apps/web/web-portal/src` (196 files) to VPS, flattened accidental `src/src` nesting from first pscp attempt, then **`portal-fe` `docker compose build --no-cache`** + `--force-recreate`. Remote + workstation L0 smoke **PASS** (all required endpoints HTTP 200). Shareholder ratio module (`shareholderRowUpdate.ts` + `applyShareholderRowFieldUpdate` in `CommandCenterPage.tsx`) verified on host **and** inside `xevn-portal-fe-dev` container.

**Residual:** VPS git HEAD remains `68ec457` (pscp-only drift vs `origin/main`). Browser L2/L2.5 UF-XBOS-01..15 + UF-HRM-* not run by DevOps — handoff QA per `docs/qa/P1_BROWSER_E2E_XBOS_HRM_WAVE.md`.

---

## Pre-deploy audit

| Check | Result |
|-------|--------|
| `xevn-portal-fe-dev` | Up (pre-wave) |
| `xevn-hrm-be-dev` | Up (healthy) |
| `xevn-xbos-be-dev` | Up (healthy) |
| Non-xevn containers | Untouched |
| VPS HEAD | `68ec457` |
| `shareholderRowUpdate.ts` (pre-sync) | **MISSING** on VPS |

---

## Deploy steps

### 1. PSCP recursive `web-portal/src`

- Script: `scripts/tmp-run-vps-pscp-browser-e2e-prep-20260620.ps1`
- Target: `/opt/xevn-ecosystem/apps/web/web-portal/` (pscp `-r` creates `src/` under parent)
- Key files synced:
  - `src/pages/command-center/shareholderRowUpdate.ts` (572 B) — **P1-CC-SHR-RATIO-UX-01-FE**
  - `src/pages/command-center/shareholderRowUpdate.test.ts`
  - `src/pages/command-center/CommandCenterPage.tsx` (imports `applyShareholderRowFieldUpdate`)
  - Full tree: integrations, data, modules/hrm, pages, hooks, utils (196 files)

### 2. Flatten nested `src/src` (first pscp attempt artifact)

- Script: `scripts/tmp-vps-fix-nested-src-20260620.sh`
- `cp -a src/src/. → src/` + `rm -rf src/src`

### 3. `portal-fe` rebuild

- Script: `scripts/tmp-vps-deploy-browser-e2e-prep-bg-20260620.sh` (background + log `/tmp/e2e-prep-deploy.log`)
- Launcher: `scripts/tmp-run-vps-bg-deploy-browser-e2e-prep-20260620.ps1`

```bash
cd /opt/xevn-ecosystem/deploy/xevn-ecosystem
docker compose build --no-cache portal-fe
docker compose --env-file .env up -d --force-recreate portal-fe
```

**Container state after deploy:**

| Container | Status |
|-----------|--------|
| `xevn-portal-fe-dev` | Up (recreated 2026-06-20 ~09:46 ICT) |
| `xevn-hrm-be-dev` | Up (healthy) |
| `xevn-xbos-be-dev` | Up (healthy) |

**VPS git HEAD:** `68ec457` (unchanged — pscp-only)

---

## Smoke results

### Remote (127.0.0.1 on VPS — post-rebuild)

| Endpoint | HTTP | Verdict |
|----------|------|---------|
| `http://127.0.0.1:8088/` | **200** | PASS |
| `http://127.0.0.1:8088/command-center` | **200** | PASS |
| `http://127.0.0.1:8088/api/hrm/metrics` | **200** | PASS |
| `http://127.0.0.1:8088/api/xbos/metrics` | **200** | PASS |

Portal ready in **6s** after recreate.

### Workstation L0 (`qc:dev-stack`)

```powershell
$env:HRM_HEALTH_URL='http://14.225.217.232:3001/api/hrm'
$env:XBOS_HEALTH_URL='http://14.225.217.232:28002/api/xbos'
$env:PORTAL_DEV_URL='http://14.225.217.232:8088'
pnpm run qc:dev-stack
# exit 0 — hrm-api 200, xbos-api 200, web-portal 200
```

### Shareholder ratio module verification

| Check | Result |
|-------|--------|
| Host: `grep applyShareholderRowFieldUpdate CommandCenterPage.tsx` | **match** |
| Host: `shareholderRowUpdate.ts` size | 572 B |
| Container: `/app/apps/web/web-portal/src/pages/command-center/shareholderRowUpdate.ts` | **OK** |

---

## Gate table

| Gate | Result | Notes |
|------|--------|-------|
| VPS audit (no `compose down`) | **PASS** | Non-xevn untouched |
| PSCP `web-portal/src` | **PASS** | 196 files; nested fix applied |
| `portal-fe --no-cache` rebuild | **PASS** | Background deploy FAIL=0 |
| L0 `:8088/`, `/command-center`, metrics | **PASS** | All HTTP 200 |
| P1-CC-SHR-RATIO-UX-01-FE on :8088 | **PASS** | Module present host + container |
| L2/L2.5 browser E2E | **N/A** | QA owner (U63) |

---

## Residual

| Item | Owner | Notes |
|------|-------|-------|
| Browser UF-XBOS-01..15 + UF-HRM wave | **qa** | `docs/qa/P1_BROWSER_E2E_XBOS_HRM_WAVE.md` |
| UF-XBOS-04/05 ratio/contributed independent click-path | **qa** | AC-SHR browser verify after login |
| git push / eliminate pscp drift | dev-be + devops | VPS HEAD `68ec457` vs local |
| UF-HRM-10 sync 401 (if still open) | dev-be | Prior wave residual |

---

## Handoff

- **completion_report:** `:8088` browser E2E prep complete — full `web-portal/src` pscp (196 files), `shareholderRowUpdate.ts` + ratio UX on VPS, `portal-fe --no-cache` rebuild + recreate. L0 remote + `qc:dev-stack` PASS. Residual: QA browser E2E wave (U63), git parity.
- **next_owner:** `qa`
- **evidence_path:** `docs/ops/evidence/p1-deploy-8088-browser-e2e-prep-20260620.md`
- **ack_status:** **READY_FOR_QA**

### next_dispatch_prompt (copy-ready — QA browser E2E :8088)

```
Role: qa
work_item_id: P1-QA-BROWSER-E2E-8088-XBOS-HRM
from_role: devops
to_role: qa
entry_criteria: P1-DEPLOY-8088-BROWSER-E2E-PREP READY_FOR_QA — http://14.225.217.232:8088/ L0 PASS (qc:dev-stack exit 0); full web-portal/src synced; P1-CC-SHR-RATIO-UX-01-FE (shareholderRowUpdate.ts) verified in container; evidence docs/ops/evidence/p1-deploy-8088-browser-e2e-prep-20260620.md; account ceo@xe.vn / Xevn@2026
exit_criteria: Browser-only E2E per docs/qa/P1_BROWSER_E2E_XBOS_HRM_WAVE.md — Wave 1 UF-XBOS-01..15 then Wave 2 UF-HRM; UF-XBOS-04/05 must verify ratio_percent and contributed_value independent (no auto-calc); screenshot + Network 2xx + F5 persist per UF template; update docs/qa/evidence/p1-browser-e2e-xbos-hrm-20260620.md + USER_FLOW_OPERABILITY_MATRIX Dev8088 column; ack_status PASS_TO_PM or FAIL_TO_PM with defect ids
evidence_path: docs/qa/evidence/p1-browser-e2e-xbos-hrm-20260620.md
ack_status: PASS_TO_PM
pm_dispatch_hint: After XBOS wave PASS — qc re-gate P1-USER-FLOW-WEB-QC-8088; if UF-HRM-10 sync 502 persists dispatch dev-be P1-WEB-ACCEPTANCE-BE-SYNC-401
```

---

## Commands reference

```powershell
# Full deploy (pscp + fix + bg rebuild)
powershell -ExecutionPolicy Bypass -File scripts/tmp-run-vps-pscp-browser-e2e-prep-20260620.ps1

# Deploy-only (after pscp)
powershell -ExecutionPolicy Bypass -File scripts/tmp-run-vps-bg-deploy-browser-e2e-prep-20260620.ps1

# L0 from workstation
$env:HRM_HEALTH_URL='http://14.225.217.232:3001/api/hrm'
$env:XBOS_HEALTH_URL='http://14.225.217.232:28002/api/xbos'
$env:PORTAL_DEV_URL='http://14.225.217.232:8088'
pnpm run qc:dev-stack

# Verify shareholder module on VPS
powershell -ExecutionPolicy Bypass -File scripts/tmp-verify-vps-shr-ratio-20260620.ps1
```
