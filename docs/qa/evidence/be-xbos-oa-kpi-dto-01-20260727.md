# BE-XBOS-OA-KPI-DTO-01 — OpenAPI KPI rollup/series/actuals F.1 depth

| Field | Value |
|-------|--------|
| **work_item_id** | `BE-XBOS-OA-KPI-DTO-01` |
| **from_role** | dev-be |
| **to_role** | qa |
| **lane** | execution · close soft residual **G-DTO-W2-KPI-01** |
| **date** | 2026-07-27 (ICT) |
| **change_mode** | ADD/UPGRADE · preserve_default |
| **ack_status** | **READY_FOR_QA** |
| **gaps closed** | **G-DTO-W2-KPI-01** |
| **OpenAPI** | `docs/api/openapi/xbos-api.yaml` `info.version` **1.2.8-p1-s2** |
| **U65** | zero-seed · no runtime mutate for evidence |
| **HOLD_DEPLOY** | stands |
| **must_keep** | UF-XBOS-10 🟢 · RACI/WF/catalog-gov · sibling RACI/POS DTO work |

---

## 1. spec_read_ack

| Layer | Cite |
|-------|------|
| **srs** | `SRS_XBOS_KHACH.md` §3.16 **FR-XBOS-KPI-03** Diễn biến #1–7 · UC-XBOS-KPI-01/02/04 · **UF-XBOS-10** |
| **tech_spec** | `docs/xbos/TECHSPEC.md` §12.2 · **§14.17** · residual G-DTO-W2-KPI-01 → **CLOSED** |
| **db_design** | `docs/xbos/DB_DESIGN_XBOS_KPI.md` — `xbos_kpi_actuals` · `xbos_portal_alerts` |
| **api_design** | `docs/xbos/API_DESIGN_XBOS_KPI.md` Endpoints **A–E** F.1 |
| **upstream residual** | `docs/qa/evidence/sa-u71-xbos-kpi-design-01-20260727.md` §4 G-DTO-W2-KPI-01 |
| **sibling must_keep** | `docs/qa/evidence/be-xbos-oa-dto-p2-01-20260727.md` — RACI/POS CLOSED untouched |
| **runtime SoT** | `KpiEngineController` · `KpiEngineService` · `resolveKpiRollupScopeContext` |
| **OpenAPI SoT** | `docs/api/openapi/xbos-api.yaml` **1.2.8-p1-s2** |

**spec says / code does:** Close OpenAPI components + F.1 descriptions for rollup `series`/`points`, evaluate, portal-alerts per API_DESIGN. Runtime evaluate/rollup/scope/empty-series preserved; no seed; no wipe RACI/POS.

---

## 2. Paths changed

| Path | Change |
|------|--------|
| `docs/api/openapi/xbos-api.yaml` | **UPGRADE** 1.2.8-p1-s2; schemas `KpiRollup*` · `KpiEvaluate*` · portal-alert; F.1 A–E + examples |
| `scripts/verify-openapi-m01.mjs` | **ADD** KPI DTO/F.1 needles |
| `scripts/verify-openapi-p1-s2.mjs` | **ADD** KPI DTO/F.1 needles |
| `apps/api/xbos-api/src/kpi-engine/kpi-engine.controller.ts` | **APPEND** `@CODE-MEMORY` + CHANGE |
| `apps/api/xbos-api/src/kpi-engine/kpi-engine.service.spec.ts` | **ADD** series/points + empty series jest |
| `docs/xbos/TECHSPEC.md` §14.17 | Mark G-DTO-W2-KPI-01 **CLOSED** |
| `docs/xbos/API_DESIGN_XBOS_KPI.md` | OpenAPI CLOSED note |

**Not touched:** seed · FE · RACI/POS Nest DTO · catalog-gov · WF · Phase1/PROD claim.

---

## 3. Contract checklist

| Gap | Deliverable | Verdict |
|-----|-------------|---------|
| G-DTO-W2-KPI-01 | `KpiRollupData` · `KpiRollupSeries` · `KpiRollupPoint` · `rollupMode` enum | ✅ |
| Evaluate depth | `KpiEvaluateBody` (+ metricCode/emit) · `KpiEvaluateResult` · batch schemas | ✅ |
| Alerts | `KpiPortalAlert` · `KpiPortalAlertListData` · `PublishPortalAlertRequest` | ✅ |
| F.1 | Mục đích · Nghiệp vụ · bước SRS on evaluate / batch / rollup / portal-alerts GET+POST | ✅ |
| Examples | group series · empty series · evaluate · publish | ✅ |

---

## 4. Verify

```text
pnpm run verify:openapi-m01
→ PASS verify-openapi-m01 …/xbos-api.yaml
exit 0

pnpm run verify:openapi-p1-s2
→ PASS verify-openapi-p1-s2 …/xbos-api.yaml
exit 0

pnpm -C apps/api/xbos-api exec jest --testPathPatterns="kpi-engine" --no-coverage
→ Test Suites: 3 passed · Tests: 24 passed
exit 0
```

---

## 5. Residual

| Item | Owner | Note |
|------|-------|------|
| UF-XBOS-10 browser retest | qa (optional) | yaml/DTO PASS ≠ FE widget; must_keep prior 🟢 |
| Future actuals upsert API | BA/SA when CR | P3 — out of scope |
| Nest class-validator on evaluate body | — | Types remain; ValidationPipe edge optional P3 |

---

## 6. Handoff

### completion_report

**Closed:** G-DTO-W2-KPI-01 — OpenAPI F.1 deepen for KPI evaluate / batch / rollup / portal-alerts with `KpiRollupData` series/points depth + examples; verify m01 + p1-s2 exit 0; jest kpi-engine 24/24; CODE-MEMORY APPEND on controller; TECHSPEC/API_DESIGN residual CLOSED. **No seed · no UF-10 behavior wipe · RACI/POS sibling preserved.**

**Residual:** Optional QA yaml/DTO spot; browser UF-10 not required for this contract wave.

### next_owner

`qa`

### next_dispatch_prompt

```text
work_item_id: QA-XBOS-OA-KPI-DTO-01
role: qa
lane: execution · OpenAPI/DTO contract spot (browser NOT required)
entry_criteria:
  - read docs/qa/evidence/be-xbos-oa-kpi-dto-01-20260727.md READY_FOR_QA
  - docs/api/openapi/xbos-api.yaml version 1.2.8-p1-s2
  - API_DESIGN_XBOS_KPI.md Endpoints A–E
exit_criteria:
  - Confirm KpiRollupData / KpiRollupSeries / KpiRollupPoint + rollupMode group|single
  - Confirm kpiEngineRollup F.1 (Mục đích · Nghiệp vụ · FR-XBOS-KPI-03 #1–7) + empty series example
  - Confirm evaluate / batch / portal-alerts schemas + XBOS-KPI-200..204
  - Confirm G-DTO-W2-KPI-01 CLOSED in TECHSPEC §14.17 + API_DESIGN
  - pnpm run verify:openapi-m01 && pnpm run verify:openapi-p1-s2 exit 0
  - must_keep: UF-XBOS-10 🟢 · RACI/POS · U65 · HOLD_DEPLOY
  - cấm: seed · claim UF-10 browser PASS from yaml alone · Phase1/PROD
evidence_path: docs/qa/evidence/qa-xbos-oa-kpi-dto-01-20260727.md
ack_status: PASS_TO_PM
```

### ack_status

**READY_FOR_QA**

### evidence_path

`docs/qa/evidence/be-xbos-oa-kpi-dto-01-20260727.md`

### pm_dispatch_hint

`QA-XBOS-OA-KPI-DTO-01` — yaml/DTO spot close G-DTO-W2-KPI-01; no browser mutate required.
