# QC Gate — QC-XBOS-OA-KPI-DTO-01 (2026-07-27)

| Field | Value |
|-------|--------|
| **work_item_id** | `QC-XBOS-OA-KPI-DTO-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **lane** | governance · contract GO |
| **date** | `2026-07-27` (ICT) |
| **decision** | **GO WITH CONDITIONS** — **G-DTO-W2-KPI-01 CLOSED** (OpenAPI F.1 rollup/series/actuals + verify m01/p1-s2) |
| **scope_claim** | Yaml/DTO contract only: `docs/api/openapi/xbos-api.yaml` **1.2.8-p1-s2** KPI A–E |
| **phase1_done_claim** | **NO** — NOT Phase 1 DONE |
| **prod_ready_claim** | **NO** — NOT PROD-READY · NOT `:8088` |
| **deploy** | **HOLD_DEPLOY** |
| **ack_status** | **PASS_TO_PM** |
| **U65** | zero-seed — yaml/DTO only; no seed · no UF-XBOS-10 browser mutate claim |

---

## Scope (bounded — contract GO)

| In scope | Explicitly out (cấm) |
|----------|----------------------|
| Audit QA PASS + BE READY_FOR_QA close **G-DTO-W2-KPI-01** | UF-XBOS-10 FE mutate / browser PASS from this packet |
| OpenAPI F.1 rollup/series + evaluate/batch/alerts | Phase 1 DONE / PROD-READY / `:8088` promote |
| QC re-run `verify:openapi-m01` + `verify:openapi-p1-s2` exit 0 | Seed / DB fake / inbox seed |
| must_keep UF-XBOS-10 🟢 · RACI/POS sibling | Reopen Nest RACI/POS DTO |

**Spec SoT:** `docs/xbos/TECHSPEC.md` §14.17 · `docs/xbos/API_DESIGN_XBOS_KPI.md` A–E · FR-XBOS-KPI-03 Diễn biến #1–7 · UF-XBOS-10.

---

## Micro-checklist (exit_criteria)

| # | Criterion | Result |
|---|-----------|--------|
| 1 | G-DTO-W2-KPI-01 CLOSED · OpenAPI F.1 rollup/series · verify m01+p1-s2 cited PASS | **PASS** — §Spot + Command table |
| 2 | must_keep UF-XBOS-10 · RACI/POS · no FE mutate claim | **PASS** — QA/BE explicit; sibling `qa-xbos-oa-dto-p2-01` PASS |
| 3 | GO or GWC (HOLD_DEPLOY) · NOT Phase1/PROD/:8088 | **GWC** · HOLD_DEPLOY · **NOT** Phase1/PROD/:8088 |
| 4 | Evidence this path · PASS_TO_PM | **PASS** |
| 5 | Append bus | **PASS** (same session) |

---

## Evidence chain audited

| Artifact | Gap / role | Verdict | Closed |
|----------|------------|---------|--------|
| `docs/qa/evidence/be-xbos-oa-kpi-dto-01-20260727.md` | G-DTO-W2-KPI-01 deepen | **READY_FOR_QA** | OA 1.2.8-p1-s2 + jest 24/24 cite |
| `docs/qa/evidence/qa-xbos-oa-kpi-dto-01-20260727.md` | yaml/DTO contract spot | **PASS** · PASS_TO_PM | F.1 A–E + verify exit 0 |
| `docs/qa/evidence/qa-xbos-oa-dto-p2-01-20260727.md` | Sibling RACI/POS | **PASS** · PASS_TO_PM | G-DTO-W2-RACI-01 / POS-01 must_keep |
| `docs/xbos/TECHSPEC.md` §14.17 | Residual row + TM flag | **CLOSED** 2026-07-27 | W2 KPI CLOSED |
| `docs/xbos/API_DESIGN_XBOS_KPI.md` | Header + residual P2 | **CLOSED** 2026-07-27 | series depth |

**must_keep:** UF-XBOS-10 🟢 prior (not re-exercised) · RACI/POS sibling DTO untouched · HOLD_DEPLOY · U65.

---

## Spot verify (QC)

### Command table

| Command | Result | Classification |
|---------|--------|----------------|
| `pnpm run verify:openapi-m01` | **PASS** exit **0** — `PASS verify-openapi-m01 …/xbos-api.yaml` | PRODUCT (contract) |
| `pnpm run verify:openapi-p1-s2` | **PASS** exit **0** — `PASS verify-openapi-p1-s2 …/xbos-api.yaml` | PRODUCT (contract) |
| Grep spot `KpiRollupData` / `KpiRollupSeries` / `KpiRollupPoint` / `rollupMode` enum `[group, single]` / `kpiEngineRollup` F.1 / `XBOS-KPI-200..204` / `G-DTO-W2-KPI-01 CLOSED` | **Present** in `docs/api/openapi/xbos-api.yaml` **1.2.8-p1-s2** | PRODUCT |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-xbos-oa-kpi-dto-01-20260727.md` | **FAIL** 3/8 (`portal_url`, `journey_l25`, `crud_or_matrix`) | PROCESS — yaml-only QA pack (expected) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-xbos-oa-kpi-dto-01-20260727.md` | **PASS** exit **0** (8/8) — this QC pack | PROCESS |

**Portal URL / PORTAL_DEV_URL:** N/A for yaml-only OpenAPI/DTO gate — no browser UF in slice (`PORTAL_DEV_URL` not required).

### OpenAPI F.1 / schema spot (independent)

| Layer | Observation | Verdict |
|-------|-------------|---------|
| Version | `info.version: 1.2.8-p1-s2`; description cites G-DTO-W2-KPI-01 | **PASS** |
| Schemas | `KpiRollupPoint` · `KpiRollupSeries` · `KpiRollupData` required includes `series`; `rollupMode` enum **group\|single** | **PASS** |
| Op C | `kpiEngineRollup` — **Mục đích** / **Nghiệp vụ** / **Bước SRS** FR-XBOS-KPI-03 #1–7; examples `groupRollupWithSeries` + `emptySeries` (`series: []`) | **PASS** |
| Ops A/B/D/E | evaluate / evaluate-batch / portal-alerts GET+POST + envelopes **XBOS-KPI-200..204** | **PASS** |
| TECHSPEC §14.17 | Row G-DTO-W2-KPI-01 = **CLOSED**; TM flag W2 includes KPI CLOSED | **PASS** |
| API_DESIGN | Header OpenAPI CLOSED + residual P2 series depth CLOSED | **PASS** |

### Read-only module / contract matrix

| Module / AC | Create | Read | Update | Delete | Note |
|-------------|--------|------|--------|--------|------|
| `KpiRollupData` series/points | N/A yaml | **PASS** | N/A docs | N/A | G-DTO-W2-KPI-01 |
| `rollupMode` group\|single | N/A | **PASS** enum | N/A | N/A | Endpoint C |
| kpiEngineEvaluate / batch | N/A schema | **PASS** | evaluate body | N/A | XBOS-KPI-200/201 · no actuals write |
| portal-alerts GET/POST | POST schema | **PASS** list | N/A | N/A | XBOS-KPI-203/204 |
| UF-XBOS-10 browser mutate | — | **not claimed** | — | — | must_keep prior 🟢 |
| Sibling RACI/POS DTO | — | **PASS** prior | — | — | `qa-xbos-oa-dto-p2-01` |

---

## Classification (ENV vs PRODUCT)

| Signal | Type | QC finding |
|--------|------|------------|
| G-DTO-W2-KPI-01 OpenAPI series/rollup F.1 | PRODUCT | **PASS** — CLOSED |
| `verify:openapi-m01` + `verify:openapi-p1-s2` exit 0 | PRODUCT | **PASS** (QC re-run 2026-07-27) |
| TECHSPEC §14.17 / API_DESIGN CLOSED markers | PRODUCT | **PASS** |
| QA yaml pack 3/8 missing portal/J-*/matrix wording | PROCESS | **OPEN P3** — expected yaml-only; QC pack 8/8 |
| Seed / FE mutate / UF-XBOS-10 browser | PROCESS U65 | **PASS** — none claimed |
| Phase1 / PROD / `:8088` | OUT OF SLICE | **NOT claimed** · HOLD_DEPLOY |

---

## L2.5 journey coverage

| J-ID / slice | Status | Note |
|--------------|--------|------|
| **J-CC-03** KPI rollup (browser) | **N/A** this packet | Yaml/DTO contract wave — L2.5 browser **not in entry criteria**; prior journey/UF must_keep not retested |
| UF-XBOS-10 FE mutate | **not claimed** | Contract PASS ≠ browser PASS (U65) |
| OpenAPI G-DTO-W2-KPI-01 | **PASS** | F.1 + verify gate |

**QC:** No L2.5 product NO-GO — browser journey coverage **out of scope** for this contract GO (anti-stuck yaml audit). Do **not** promote UF-XBOS-10 or J-CC-03 from this evidence.

---

## Residual / Conditions

| ID | Severity | Status | Owner |
|----|----------|--------|-------|
| **C-OA-KPI-QA-PACK-01** | P3 PROCESS | OPEN | QA optional — enrich future yaml packs with `PORTAL_DEV_URL` N/A + journey N/A + read-only matrix for Layer B 8/8 |
| UF-XBOS-10 / J-CC-03 browser retest | — | **DEFER** | Separate WI only if sponsor asks — **not required** to close G-DTO-W2-KPI-01 |
| Future actuals upsert API | P3 | OPEN | BA/SA when CR |
| Nest ValidationPipe on evaluate body | P3 | OPEN | optional |
| Product P0/P1 for KPI OpenAPI DTO | — | **NONE** | — |
| Phase1 / PROD / `:8088` | — | **NOT claimed** | HOLD_DEPLOY |

---

## Verdict

**GO WITH CONDITIONS**

- **Closed:** Soft residual **G-DTO-W2-KPI-01** — OpenAPI **1.2.8-p1-s2** F.1 deepen for KPI evaluate / batch / rollup (`KpiRollupData`/`Series`/`Point` + `rollupMode` group\|single + empty series) / portal-alerts; TECHSPEC §14.17 + API_DESIGN CLOSED; QA PASS + QC verify m01 + p1-s2 exit **0**; sibling RACI/POS must_keep intact.
- **Conditions:** HOLD_DEPLOY; **C-OA-KPI-QA-PACK-01** P3 PROCESS; optional browser UF-10 / J-CC-03 only under separate WI; **NOT** Phase 1 DONE; **NOT** PROD-READY; **NOT** `:8088`.
- **cấm honored:** no seed · no UF-XBOS-10 FE mutate claim · no Phase1/PROD/:8088 · no RACI/POS reopen.

---

## Handoff

### completion_report

**Closed:** QC contract gate **GO WITH CONDITIONS** for `QC-XBOS-OA-KPI-DTO-01`. Independent audit confirms **G-DTO-W2-KPI-01 CLOSED**: OpenAPI F.1 A–E + rollup series depth + verify `openapi-m01`/`openapi-p1-s2` exit 0; TECHSPEC §14.17 + API_DESIGN CLOSED; QA + BE evidence chain intact; must_keep UF-XBOS-10 / RACI/POS / U65 / HOLD_DEPLOY. QC evidence-pack **8/8**. **No seed · no UF-10 browser PASS · NOT Phase1/PROD/:8088.**

**Residual:** C-OA-KPI-QA-PACK-01 P3 (yaml QA Layer B optional); browser UF-10/J-CC-03 deferred separate WI; no product P0/P1.

### next_owner

`pm`

### next_dispatch_prompt

```text
work_item_id: PM-INTAKE-QC-XBOS-OA-KPI-DTO-01
from_role: qc
to_role: pm
lane: governance intake · W2 KPI DTO residual close
priority: P2

entry_criteria:
- QC-XBOS-OA-KPI-DTO-01 = GO WITH CONDITIONS
- evidence: docs/qa/evidence/qc-xbos-oa-kpi-dto-01-20260727.md
- QA PASS: docs/qa/evidence/qa-xbos-oa-kpi-dto-01-20260727.md
- BE: docs/qa/evidence/be-xbos-oa-kpi-dto-01-20260727.md

action:
1. Bus INTAKE: mark G-DTO-W2-KPI-01 CLOSED (product contract); TM W2 flag already CLOSED — confirm board
2. Keep HOLD_DEPLOY; do NOT claim Phase1/PROD/:8088
3. must_keep: UF-XBOS-10 🟢 · RACI/POS · no FE reopen from yaml alone
4. Optional later (non-blocking): separate WI for UF-XBOS-10 / J-CC-03 browser only if sponsor asks
5. Note C-OA-KPI-QA-PACK-01 P3 PROCESS (QA yaml pack 3/8) — optional Layer B enrich
cấm: seed · treat yaml PASS as UF-10 mutate PASS · Phase1/PROD/:8088 · reopen RACI/POS
```

### ack_status

**PASS_TO_PM**

### evidence_path

`docs/qa/evidence/qc-xbos-oa-kpi-dto-01-20260727.md`

### pm_dispatch_hint

`PM-INTAKE` — GWC closes G-DTO-W2-KPI-01; HOLD_DEPLOY; no UF-10 browser / Phase1/PROD from this packet.
