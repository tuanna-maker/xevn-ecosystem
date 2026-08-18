# QA-XBOS-OA-KPI-DTO-01 — OpenAPI/DTO contract spot (KPI rollup/series/actuals)

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-XBOS-OA-KPI-DTO-01` |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | execution · OpenAPI/DTO contract spot (browser NOT required) |
| **date** | 2026-07-27 (ICT) |
| **upstream** | `docs/qa/evidence/be-xbos-oa-kpi-dto-01-20260727.md` **READY_FOR_QA** |
| **OpenAPI** | `docs/api/openapi/xbos-api.yaml` `info.version` **1.2.8-p1-s2** |
| **api_design** | `docs/xbos/API_DESIGN_XBOS_KPI.md` Endpoints **A–E** |
| **tech_spec** | `docs/xbos/TECHSPEC.md` **§14.17** G-DTO-W2-KPI-01 |
| **U65** | zero-seed · no runtime mutate · yaml/DTO only |
| **ack_status** | **PASS_TO_PM** |

---

## 1. Scope & must_keep

| Claim allowed | Claim **forbidden** |
|---------------|---------------------|
| G-DTO-W2-KPI-01 CLOSED at OpenAPI F.1 + DTO depth (series/rollup/actuals map) | UF-XBOS-10 FE mutate / browser PASS from this packet |
| verify:openapi-m01 + verify:openapi-p1-s2 exit 0 | Phase1 DONE / PROD-READY |
| F.1 Mục đích / Nghiệp vụ / Bước SRS on kpiEngine* A–E | Seed / DB fake / inbox seed |

**must_keep preserved:** UF-XBOS-10 🟢 prior · RACI/POS sibling DTO · HOLD_DEPLOY · U65.

---

## 2. Exit criteria checklist

| # | Criterion | Evidence | Verdict |
|---|-----------|----------|---------|
| 1 | G-DTO-W2-KPI-01 closed in OA (series/rollup/actuals F.1 + DTO depth) | OA `KpiRollupData`/`Series`/`Point` + `rollupMode` enum `group\|single`; evaluate/batch/portal-alerts schemas; TECHSPEC §14.17 + API_DESIGN header **CLOSED**; info.description cites gap | ✅ PASS |
| 2 | `pnpm run verify:openapi-m01 && pnpm run verify:openapi-p1-s2` exit 0 | §3 — EXIT_M01=0 · EXIT_P1S2=0 | ✅ PASS |
| 3 | must_keep: no UF-XBOS-10 FE mutate from yaml-only; U65 | This packet — contract-only; no browser; no seed | ✅ PASS |
| 4 | Evidence + PASS_TO_PM / FAIL | This file | ✅ PASS_TO_PM |
| 5 | Append bus | `docs/program/AGENT_MESSAGE_BUS.md` | ✅ PASS |

---

## 3. Verify commands (QA re-run)

```text
pnpm run verify:openapi-m01
→ PASS verify-openapi-m01 …/docs/api/openapi/xbos-api.yaml
EXIT_M01=0

pnpm run verify:openapi-p1-s2
→ PASS verify-openapi-p1-s2 …/docs/api/openapi/xbos-api.yaml
EXIT_P1S2=0

info.version: 1.2.8-p1-s2
```

Script needles confirmed (`scripts/verify-openapi-m01.mjs` / `verify-openapi-p1-s2.mjs`):
`KpiRollupData` · `KpiRollupSeries` · `KpiRollupPoint` · `G-DTO-W2-KPI-01` · `kpiEngineRollup` · `kpiEngineEvaluate` · `kpiEngineEvaluateBatch` · `kpiEnginePortalAlerts` (+ p1-s2: `kpiEnginePublishPortalAlert`).

---

## 4. Spot detail (spec says / OA does)

### 4.1 G-DTO-W2-KPI-01 — rollup series depth (Endpoint C)

| Layer | Observation |
|-------|-------------|
| OpenAPI schemas | `KpiRollupPoint` (period/actual/target ↔ `xbos_kpi_actuals`); `KpiRollupSeries` (metricCode + points); `KpiRollupData` required `[tenantId, companyId, rollupMode, companyIds, from, to, series]`; `rollupMode` enum **`[group, single]`**; description marks **G-DTO-W2-KPI-01 CLOSED** + `series: []` valid (U65) |
| OpenAPI op | `operationId: kpiEngineRollup` — F.1 **Mục đích / Nghiệp vụ / Bước SRS** FR-XBOS-KPI-03 Diễn biến #1–7; examples `groupRollupWithSeries` + **`emptySeries`** (`series: []`, `rollupMode: single`); codes **XBOS-KPI-202** / 401 / 409 |
| API_DESIGN | Header OpenAPI **1.2.8-p1-s2** · residual P2 ~~series depth~~ → **CLOSED** 2026-07-27 (`BE-XBOS-OA-KPI-DTO-01`) |
| TECHSPEC §14.17 | Row **G-DTO-W2-KPI-01** = **CLOSED** 2026-07-27 · W2 TM flag includes KPI CLOSED |

### 4.2 Evaluate / batch / portal-alerts (Endpoints A/B/D/E)

| Endpoint | OA evidence | Codes |
|----------|-------------|-------|
| A evaluate | `KpiEvaluateBody` (target/actual + metricCode/emitPortalAlert); `KpiEvaluateResult`; F.1 Mục đích/Nghiệp vụ/Bước SRS on `kpiEngineEvaluate` | **XBOS-KPI-200** |
| B evaluate-batch | `KpiEvaluateBatchRequest` / `KpiEvaluateBatchData`; empty items valid | **XBOS-KPI-201** |
| D portal-alerts GET | `KpiPortalAlert` / `KpiPortalAlertListData`; empty items valid | **XBOS-KPI-203** |
| E portal-alerts POST | `PublishPortalAlertRequest` / `PublishPortalAlertData` | **XBOS-KPI-204** |

**Actuals depth:** rollup point/series descriptions map `period_date` / `actual_value` / `target_value` / `metric_code` from `xbos_kpi_actuals`; evaluate explicitly does **not** write actuals (API_DESIGN A) — OA matches.

---

## 5. Residual

| Item | Severity | Owner | Note |
|------|----------|-------|------|
| UF-XBOS-10 browser retest | — | qa (optional / separate WI) | yaml/DTO PASS ≠ FE widget mutate; prior 🟢 must_keep — **not claimed here** |
| Future actuals upsert API | P3 | BA/SA when CR | Out of scope (BE residual) |
| Nest ValidationPipe on evaluate body | P3 | — | Optional; types remain |
| Phase1 / PROD | — | — | **Not claimed** |

---

## 6. Handoff

### completion_report

**Closed:** Contract spot **PASS** for `QA-XBOS-OA-KPI-DTO-01`. Confirmed OpenAPI **1.2.8-p1-s2**: `KpiRollupData` / `KpiRollupSeries` / `KpiRollupPoint` + `rollupMode` `group|single`; kpiEngineRollup F.1 (Mục đích · Nghiệp vụ · FR-XBOS-KPI-03 #1–7) + empty-series example; evaluate / batch / portal-alerts schemas + **XBOS-KPI-200..204**; G-DTO-W2-KPI-01 **CLOSED** in TECHSPEC §14.17 + API_DESIGN. Re-ran `verify:openapi-m01` + `verify:openapi-p1-s2` **exit 0**. **No seed · no UF-XBOS-10 FE mutate claim · no Phase1/PROD.**

**Residual:** Optional browser UF-10 only under separate WI; no P0/P1 contract gap on this packet.

### next_owner

`pm`

### next_dispatch_prompt

```text
work_item_id: PM-INTAKE-QA-XBOS-OA-KPI-DTO-01
role: pm
lane: governance intake · W2 KPI DTO residual close
entry_criteria:
  - docs/qa/evidence/qa-xbos-oa-kpi-dto-01-20260727.md PASS_TO_PM
  - G-DTO-W2-KPI-01 CLOSED (OA 1.2.8-p1-s2 + TECHSPEC §14.17)
exit_criteria:
  - Update W2 residual board / TM flag if needed (KPI CLOSED)
  - must_keep: UF-XBOS-10 🟢 · HOLD_DEPLOY · no FE reopen from yaml alone
  - Optional later: separate WI for UF-XBOS-10 browser only if sponsor asks — not required for DTO close
  - cấm: seed · Phase1/PROD claim · treat yaml PASS as UF-10 mutate PASS
evidence_path: docs/qa/evidence/qa-xbos-oa-kpi-dto-01-20260727.md
ack_status: PASS_TO_PM (intake complete)
```

### ack_status

**PASS_TO_PM**

### evidence_path

`docs/qa/evidence/qa-xbos-oa-kpi-dto-01-20260727.md`

### pm_dispatch_hint

`PM-INTAKE` — close soft residual G-DTO-W2-KPI-01 after QA yaml/DTO PASS; do not open UF-XBOS-10 browser from this packet.
