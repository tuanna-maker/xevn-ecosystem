# P1-DEPLOY-8088-RAIL-CATALOG-01 — DevOps evidence

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-DEPLOY-8088-RAIL-CATALOG-01` |
| **from_role** | devops |
| **to_role** | qa |
| **portal** | http://14.225.217.232:8088 |
| **executed_at** | 2026-06-20T08:42–08:44+07 (VPS local) |
| **ack_status** | **READY_FOR_QA** |
| **trigger** | QC GWC `P1-USER-FLOW-WEB-QC-8088` condition **C1** |

---

## Executive summary

Deployed missing Command Center FE modules to VPS via `pscp`, then rebuilt `portal-fe` with `docker compose build --no-cache` + `--force-recreate`. Remote curl smoke **PASS** (all endpoints HTTP 200). Browser CDP check on `/command-center`: **`vite-error-overlay` absent**; Vite module fetches for `command-center-rail-catalog.ts` and `infrastructureEntityKeyResolver.ts` return **200**.

**Residual:** VPS git HEAD remains `68ec457` (pscp-only drift vs `origin/main` — QC condition C3). Full L2.5 browser click-path (J-CC-02) not run by DevOps — handoff to QA.

---

## Root cause

| Symptom | Cause | Class |
|---------|-------|-------|
| Vite overlay: missing `command-center-rail-catalog.ts` | File absent on VPS `/opt/xevn-ecosystem` after acceptance pscp wave | ENV/deploy |
| Follow-on overlay: missing `infrastructureEntityKeyResolver.ts` | Same drift — `CommandCenterPage.tsx` import not on VPS | ENV/deploy |

---

## Files transferred (pscp)

| Local path | Remote path | Size |
|------------|-------------|------|
| `apps/web/web-portal/src/data/command-center-rail-catalog.ts` | `/opt/xevn-ecosystem/apps/web/web-portal/src/data/command-center-rail-catalog.ts` | 1709 B |
| `apps/web/web-portal/src/data/command-center-types.ts` | `/opt/xevn-ecosystem/apps/web/web-portal/src/data/command-center-types.ts` | (dep) |
| `apps/web/web-portal/src/integrations/infrastructureEntityKeyResolver.ts` | `/opt/xevn-ecosystem/apps/web/web-portal/src/integrations/infrastructureEntityKeyResolver.ts` | 3.8 KB |
| `apps/web/web-portal/src/integrations/infrastructureEntityKeyResolver.test.ts` | same tree | (test, optional) |

**Scripts used:**

- `scripts/tmp-run-vps-pscp-rail-catalog-20260620.ps1`
- `scripts/tmp-vps-deploy-rail-catalog-20260620.sh`

---

## Deploy steps (VPS)

```bash
cd /opt/xevn-ecosystem/deploy/xevn-ecosystem
docker compose build --no-cache portal-fe
docker compose --env-file .env up -d --force-recreate portal-fe
```

**Container state after deploy:**

| Container | Status |
|-----------|--------|
| `xevn-portal-fe-dev` | Up (recreated) |
| `xevn-hrm-be-dev` | Up (healthy) |
| `xevn-xbos-be-dev` | Up (healthy) |
| `xevn-hrm-fe-dev` | Up |
| Non-xevn containers | Untouched |

**VPS git HEAD:** `68ec457` (unchanged — pscp-only)

---

## Smoke gates

### Remote curl (VPS localhost)

| Endpoint | HTTP | Result |
|----------|------|--------|
| `8088/` | 200 | PASS |
| `8088/command-center` | 200 | PASS |
| `8088/api/hrm/metrics` | 200 | PASS |
| `8088/api/xbos/metrics` | 200 | PASS |
| `3001/api/hrm/metrics` | 200 | PASS |
| `28002/api/xbos/metrics` | 200 | PASS |

HTML grep: no `command-center-rail-catalog` missing-module string in `/command-center` body.

### Browser (DevOps spot-check)

| Check | Result |
|-------|--------|
| URL `http://14.225.217.232:8088/command-center` | Title loads: *X-BOS \| Hệ điều hành Tập đoàn XeVN* |
| `document.querySelector('vite-error-overlay')` | **null** — PASS |
| `fetch('/src/data/command-center-rail-catalog.ts')` | **200** |
| `fetch('/src/integrations/infrastructureEntityKeyResolver.ts')` | **200** |
| `fetch('/src/pages/command-center/CommandCenterPage.tsx')` | **200** |

**Note:** Unauthenticated browser session shows empty `#root` (no login token) — expected for Dev8088; **not** a Vite compile failure. QA should login `ceo@xe.vn` / `Xevn@2026` for L2.5 J-CC-02.

### portal-fe logs

```
VITE v5.4.21 ready in 302 ms
```

No import-analysis errors after recreate.

---

## Gate table (runbook §1 subset)

| Gate | Result |
|------|--------|
| L0 stack up | PASS (curl 200 portal + proxies) |
| CC Vite overlay absent | **PASS** |
| Non-xevn containers preserved | PASS |
| `verify-production-env` | N/A (dev :8088 slice) |

---

## Residual

| Item | Owner | Severity |
|------|-------|----------|
| L2.5 browser J-CC-02 holding click-path on :8088 | qa | P2 (QC C2) |
| git push / eliminate pscp drift | devops + dev-be | P2 (QC C3) |
| Authenticated CC UI render smoke | qa | P2 |

---

## Handoff

- **completion_report:** C1 closed — `command-center-rail-catalog.ts` + `infrastructureEntityKeyResolver.ts` pscp'd to VPS; `portal-fe` `--no-cache` rebuild + recreate on :8088. Remote + browser module smoke PASS; no Vite overlay on `/command-center`. Residual: QA L2.5 browser after login (C2), git parity (C3).
- **next_owner:** `qa`
- **evidence_path:** `docs/ops/evidence/p1-deploy-8088-rail-catalog-20260620.md`
- **ack_status:** **READY_FOR_QA**

### next_dispatch_prompt (copy-ready — QA L2.5 :8088)

```
Role: qa
work_item_id: P1-QA-8088-L25-CC-RAIL-01
from_role: devops
to_role: qa
priority: P1
entry_criteria: DevOps P1-DEPLOY-8088-RAIL-CATALOG-01 READY_FOR_QA — CC /command-center Vite overlay cleared; evidence docs/ops/evidence/p1-deploy-8088-rail-catalog-20260620.md; QC GWC C2 pending
exit_criteria: Login ceo@xe.vn on http://14.225.217.232:8088; browser L2.5 J-CC-02 holding shareholder click-path PASS (no 409/overlay); update docs/program/PROGRAM_JOURNEY_MAP.md + docs/qa/evidence/p1-qa-8088-l25-cc-rail-20260620.md; ack_status PASS_TO_PM
evidence_path: docs/qa/evidence/p1-qa-8088-l25-cc-rail-20260620.md
ack_status: PASS_TO_PM
pm_dispatch_hint: After PASS — qc re-gate C1/C2 on P1-USER-FLOW-WEB-QC-8088
```
