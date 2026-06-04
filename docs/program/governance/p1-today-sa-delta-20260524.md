# P1 Today — SA governance delta (U18 EOD 2026-05-24)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-TODAY-GOV-SA` / `GOV-SRS-DELTA` |
| **from_role** | sa |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | This file + [`docs/architecture/P1-TECHSPEC-OPENAPI-DELTA-U18-20260524.md`](../architecture/P1-TECHSPEC-OPENAPI-DELTA-U18-20260524.md) |

---

## 1. Context

U18 Phase 1 EOD target (G1–G9). Baseline: **63 planned**, **30 e2e_pass**, **1 waived** (`UC-HRM-27`). QA S5 regression PASS on gates G7/G8/G9; **G1/G2 OPEN**.

Sources: `PHASE1_COMPLETION_PLAN.md`, `PHASE1_UC_SRS_TECHSPEC_MATRIX.md`, `xbos-api.yaml` v1.1, `hrm-api.yaml` v1.2, `ADR-GROUP-CEO-MAIN-HOLDING-SCOPE.md`.

---

## 2. SA findings (facts)

1. **Spec drift dominates:** ~70% of khối A/C `planned` rows have Nest controllers already; matrix + OpenAPI lag implementation.
2. **OpenAPI S1 package incomplete for P1 close:** `workflow-engine`, `asset-requests`, `assets`, `infrastructure`, `platform-audit`, HRM metadata/spreadsheet/operations/performance not in YAML.
3. **Khối B:** 0 `planned`; 22 `data` — M03 TechSpec was missing; added pattern-reuse stub (no new API program).
4. **Scope:** All new/changed list/catalog paths must cite ADR group CEO helpers (§4 mapping table).
5. **Dashboard / CC rail:** No new KPI math — compose `kpi-engine` + `workflow-engine/tasks` + alerts; FE removes mock (W1–W11 `FE_MOCK_TO_API_AUDIT.md`).

---

## 3. Deliverables (SA)

| Artifact | Path |
|----------|------|
| TechSpec/OpenAPI delta (authoritative) | `docs/architecture/P1-TECHSPEC-OPENAPI-DELTA-U18-20260524.md` |
| M03 DM-LOG P1 stub | `docs/logistics/TECHSPEC_M03_DM_LOG_P1.md` |
| TECHSPEC_HE §4.7 pointer | `docs/ecosystem/TECHSPEC_HE_SINH_THAI_XEVN.md` |

---

## 4. Dev backlog (dispatch-ready)

### Wave P0 — BE contract + status promotion (same day)

| backlog_id | Owner | spec_ref | UC (primary) | Action | Exit |
|------------|-------|----------|--------------|--------|------|
| **P1-U18-BE-A1** | dev-be | `P1-TECHSPEC-OPENAPI-DELTA §3.1 M01-WF` | `UC-XBOS-13`..`15`, `WF-01`..`06`, `UC-XBOS-CC-06` | Add OpenAPI paths for `workflow-engine/*`; jest smoke | `verify:openapi-p1-s2` includes WF ops |
| **P1-U18-BE-A2** | dev-be | `§3.1 M01-AssetRequest/Assets` | `UC-XBOS-AR-01`..`03`, `UC-XBOS-16`, `AST-01`..`02` | OpenAPI + promote impl_status → `be` | Controller spec PASS |
| **P1-U18-BE-A3** | dev-be | `§3.1 M01-Infra/Audit` | `UC-XBOS-INF-01`..`03`, `UC-XBOS-06`, `UC-XBOS-CC-07` | OpenAPI infra + platform-audit | Static gate PASS |
| **P1-U18-BE-C1** | dev-be | `§3.2 Metadata/Spreadsheet` | `HRM-MD-01`..`05`, `HRM-IM-01`..`04` | Extend `hrm-api.yaml`; fix `company_id` slug schema | OpenAPI lint PASS |
| **P1-U18-BE-C2** | dev-be | `§3.2 Operations/Performance` | `HRM-OP-01`..`04`, `HRM-PF-01`..`04` | OpenAPI tags + promote → `be` | hrm-api jest module PASS |

### Wave P0 — FE wire (parallel after BE-A OpenAPI)

| backlog_id | Owner | spec_ref | UC | Action | Exit |
|------------|-------|----------|-----|--------|------|
| **P1-U18-FE-A1** | dev-fe | `FE_MOCK W1–W3`, `§3.1 DASH` | `UC-XBOS-DASH-01`..`03` | Replace dashboard mocks with `kpiEngineApi` + `businessMasterApi` | No mock on `/cockpit`, `/dashboard/kpi-*` |
| **P1-U18-FE-A2** | dev-fe | `FE_MOCK W11–W12`, `§3.1 CC rail` | `UC-XBOS-CC-05`, `UC-XBOS-CC-06` | Wire CC rail to WF tasks + KPI alerts; canvas to `workflow-engine/definitions` | P-CC config routes L2 PASS |
| **P1-U18-FE-A3** | dev-fe | `FE_MOCK W15–W16`, `ADR-HRM-EMBED` | `UC-CC-01`, `UC-CC-03`, `UC-CC-04` | Org/dept + legal entity save via org-foundation APIs | No mockCompanies on save |
| **P1-U18-FE-C1** | dev-fe | `docs/hrm/TECHSPEC §11`, `§3.2 Embed` | `UC-HRM-20`, `UC-HRM-21` | HrmWorkspacePanel overview + employees → API mode + rollup scope | P-CC-02/03 embed PASS |
| **P1-U18-FE-C2** | dev-fe | `§3.2 Metadata` | `UC-HRM-26` | Metadata queue tab → `employee-metadata/*` | Embed tab loads 200 |

### Wave P1 — DM ops + B gate

| backlog_id | Owner | spec_ref | UC | Action | Exit |
|------------|-------|----------|-----|--------|------|
| **P1-U18-BE-A4** | dev-be | `§3.1 M01-DM-Ops`, `TECHSPEC_M03_DM_LOG` | `XBOS-DM-10`..`18`, `XBOS-DM-LOG-10`..`18` | Spec export/import on config-sync (CSV); catalog-governance reject path in OpenAPI | Seed + export smoke |
| **P1-U18-DO-B1** | devops | `TECHSPEC_M03 §4`, G4 | `XBOS-DM-LOG-19`..`22` | Run + document `verify:phase1:logistic-catalog` | LOG-19 checklist PASS |
| **P1-U18-QA-1** | qa | G1/G2 | All promoted UC | Batch e2e_pass promotion + L2 matrix | `phase1-impl-status` planned < 20 |

### Wave P2 — defer (documented, not EOD blocker)

| UC | spec_ref | Owner | Note |
|----|----------|-------|------|
| `UC-ECO-MASTER-01` | TECHSPEC_HE §8 | pm | Map to `business-master` or waive |
| `UC-ECO-FE-01` | FE_MOCK meta | pm | Exit = capabilities gate |
| `UC-XBOS-INF-02` | §3.1 INF-02 gap | dev-be | JSON metaTemplates — post-EOD |
| `UC-HRM-27` | waived | fe | Already waived |

---

## 5. G1–G9 SA view (post-delta)

| Gate | Status | Unblock |
|------|--------|---------|
| G1 245 UC | OPEN | QA-02 promotion wave |
| G2 XBOS 104 | OPEN | P1-U18-* A waves + verify:capabilities |
| G3 HRM 119 | OPEN | Embed + standalone FE-C* |
| G4 DM-LOG 22 | PARTIAL | LOG-19 verify (data seeded) |
| G5 183 DM | PARTIAL | S4 DO-01 done; BA checklist |
| G6 Mobile 15 | PASS | Regression only |
| G7 phase1:gate | PASS | Keep on promote |
| G8 L0–L3 | PASS | Retest after FE |
| G9 traceability | PASS | Maintain on promote |

---

## 6. PM dispatch recommendation (sequencing)

```text
11:00  P1-U18-BE-A1 ‖ A2 ‖ A3 ‖ C1 ‖ C2  (max 3 parallel Task)
11:30  P1-U18-FE-A1 ‖ A2 ‖ C1             (after OpenAPI merged or spec path fixed)
14:00  P1-U18-FE-A3 ‖ C2 ‖ BE-A4
16:00  P1-U18-DO-B1 + P1-U18-QA-1
21:00  P1-S5-QA-02 + TM + QC
```

---

## 7. Handoff packet

| Field | Value |
|-------|--------|
| entry_criteria | U18 gov wave; baseline 63 planned |
| exit_criteria | Delta docs published; backlog with spec_ref; PASS_TO_PM |
| needed_by | PM exec wave dispatch EOD ICT |
| residual risk | EOD full G1 unlikely — prioritize P0 promotion (~40 UC be→e2e) |

---

*No commit (SA governance-only).*
