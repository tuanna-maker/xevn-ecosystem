# P1-S5-QA-JXBOS-02-RETEST-01 — J-XBOS-02 catalog-sync L2.5 (2026-06-05)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-S5-QA-JXBOS-02-RETEST-01` |
| **from_role** | `qa` |
| **to_role** | `pm` → `qc` |
| **journey** | **J-XBOS-02** (`docs/program/PROGRAM_JOURNEY_MAP.md`) |
| **entry** | `P1-PHASE1-DO-JXBOS-02-DEPLOY-01` READY_FOR_QA |
| **upstream_evidence** | `docs/ops/evidence/p1-s5-do-jxbos-02-deploy-20260605.md`, `docs/qa/evidence/p1-phase1-be-jxbos-02-pull-20260605.md` |
| **environment_primary** | `https://14-225-217-232.nip.io` |
| **account** | `ceo@xe.vn` / `Xevn@2026` |
| **ack_status** | **PASS_TO_PM** |
| **phase1_done_claim** | **NO** — G5/G8/PROD program gates unchanged |

---

## Executive verdict

| Exit criterion | Result | Detail |
|----------------|--------|--------|
| L0 stack (nip.io substitute) | **PASS** | `pnpm run qc:dev-stack` exit **0** |
| POST `catalog-sync/pull/contract_types?tenantId=xevn&companyId=holding` | **PASS** | HTTP **201** `HRM-SYNC-200` — no **409** |
| GET `catalog-sync?tenantId=xevn&companyId=holding` | **PASS** | HTTP **200** `HRM-SYNC-202`, **count=74** (≥40) |
| GET `catalog-sync` + `x-company-id: holding` | **PASS** | HTTP **200** `HRM-SYNC-202` — no **409** |
| **J-XBOS-02** overall | **PASS** | Prior GWC **409** `SCOPE_CONTEXT_MISMATCH` **not reproduced** |
| **PROGRAM_JOURNEY_MAP** | **PROMOTED** | J-XBOS-02 🟡 → ✅ |

---

## Commands executed

| # | Command | Exit | Notes |
|---|---------|------|-------|
| 1 | `pnpm run qc:dev-stack` (nip.io health URLs) | **0** | L0 |
| 2 | `node scripts/tmp-p1-s5-do-jxbos-02-deploy-probe.mjs` | **0** | `JXBOS_02_DEPLOY_PROBE_OK` |

### Environment (PowerShell)

```powershell
$env:HRM_HEALTH_URL='https://14-225-217-232.nip.io/api/hrm'
$env:XBOS_HEALTH_URL='https://14-225-217-232.nip.io/api/xbos'
$env:PORTAL_DEV_URL='https://14-225-217-232.nip.io'
$env:UAT_PORTAL_EMAIL='ceo@xe.vn'
```

**Executed_at (QA retest):** `2026-06-05T02:47:38.815Z`

---

## L0 stack health

```
✓ hrm-api: HTTP 200 ← https://14-225-217-232.nip.io/api/hrm
✓ xbos-api: HTTP 200 ← https://14-225-217-232.nip.io/api/xbos
✓ web-portal (optional): HTTP 200 ← https://14-225-217-232.nip.io
```

---

## J-XBOS-02 API L2.5 (scope parity)

**Persona:** Group CEO JWT `tenantId=xevn`, `companyId=main`; catalog partition `holding` per ADR.

**Click path (API):** login (`ceo@xe.vn`) → POST pull `contract_types` → GET sync list (query `companyId=holding`) → GET sync list (`x-company-id: holding` header only).

| Step | Method / path | HTTP | Code | Pass |
|------|---------------|-----:|------|:----:|
| 1 | `POST /api/hrm/catalog-sync/pull/contract_types?tenantId=xevn&companyId=holding` | 201 | `HRM-SYNC-200` | ✅ |
| 2 | `GET /api/hrm/catalog-sync?tenantId=xevn&companyId=holding` | 200 | `HRM-SYNC-202` (total **74**) | ✅ |
| 3 | `GET /api/hrm/catalog-sync` + header `x-company-id: holding` | 200 | `HRM-SYNC-202` | ✅ |

**Scope parity:** list and pull both **200/201** with same `holding` partition — no list-with-data / pull-409 regression.

### Probe JSON summary

```json
{
  "verdict": "JXBOS_02_DEPLOY_PROBE_OK",
  "base": "https://14-225-217-232.nip.io",
  "login": { "status": 201, "tenantId": "xevn", "companyId": "main" },
  "POST-catalog-sync-pull-holding": { "status": 201, "code": "HRM-SYNC-200" },
  "GET-catalog-sync-list-holding": { "status": 200, "code": "HRM-SYNC-202", "count": 74 },
  "GET-catalog-sync-holding-header": { "status": 200, "code": "HRM-SYNC-202" }
}
```

---

## Regression vs prior QA (G5 GWC)

| Check | `p1-s5-qa-g5-01` (pre-fix) | This retest |
|-------|---------------------------|-------------|
| POST pull `holding` | **409** `SCOPE_CONTEXT_MISMATCH` | **201** `HRM-SYNC-200` |
| GET sync list `holding` | **409** | **200**, count **74** |
| GET + `x-company-id: holding` | **409** | **200** |

---

## Residual (not blocking J-XBOS-02)

| Item | Owner | Notes |
|------|-------|-------|
| Push BE sources to `origin/main` | `dev-be` / PM | VPS at `68ec457` + pscp — avoid drift |
| G4 `target=xbos` list **409** `XBOS-CFG-004` | program | DB SoT policy — unchanged |
| `verify:hrm:menu-density` contracts-ratio | `qa` / `dev-be` | **6/7** GWC from G5 wave |
| Full portal UI click for catalog-sync screen | optional | API L2.5 slice sufficient per exit criteria |

---

## Handoff packet

- **completion_report:** Formal QA retest after DevOps `P1-PHASE1-DO-JXBOS-02-DEPLOY-01` — all three catalog-sync exit checks **PASS** on nip.io for `ceo@xe.vn`; J-XBOS-02 promoted ✅ on journey map; G5 MET unchanged; Phase 1 / PROD **not** claimed.
- **next_owner:** `pm` → `qc` (G5/J-XBOS-02 closure on gate snapshot if in scope)
- **next_dispatch_prompt:** see below
- **evidence_path:** `docs/qa/evidence/p1-s5-qa-jxbos-02-retest-20260605.md`
- **ack_status:** **PASS_TO_PM**

### next_dispatch_prompt (copy-ready)

```
work_item_id: P1-S5-QC-G5-JXBOS-02-01
from_role: qa
to_role: qc
entry_criteria: P1-S5-QA-JXBOS-02-RETEST-01 PASS_TO_PM — J-XBOS-02 API L2.5 PASS on https://14-225-217-232.nip.io (POST pull 201 HRM-SYNC-200, GET sync 200 count 74, holding header 200, no 409); evidence docs/qa/evidence/p1-s5-qa-jxbos-02-retest-20260605.md; PROGRAM_JOURNEY_MAP J-XBOS-02 ✅
exit_criteria: Re-audit G5 row + J-XBOS-02 on PHASE1_GATE_REPORT / p1-s5-qc-g5 if open; close J-XBOS-02-GWC from p1-s5-qc-g5-01-20260605.md if satisfied; ack GO WITH CONDITIONS only for documented residuals (G4, menu-density, main push)
evidence_path: docs/qa/evidence/p1-s5-qc-g5-jxbos-02-20260605.md
ack_status: PASS_TO_PM
pm_dispatch_hint: Do not claim Phase 1 DONE or PROD-READY
```
