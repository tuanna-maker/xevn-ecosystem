# P1-TODAY-GOV-BE-LEAD — Phase 1 BE gap map & execution backlog (U18)

| Field | Value |
|-------|--------|
| **work_item_id** | P1-TODAY-GOV-BE-LEAD |
| **date** | 2026-05-24 |
| **owner** | Dev-BE Lead |
| **lane** | governance (U18) |
| **ack_status** | **PASS_TO_PM** |
| **related** | `P1-S5-BE-WAVE-FINAL`, `PHASE1_TODAY_EXECUTION_PLAN.md` |

## Executive summary

Mapped **245** Phase-1 UC to `hrm-api` / `xbos-api` via `scripts/lib/srs-api-map.mjs` + `PHASE1_UC_SRS_TECHSPEC_MATRIX.md`. Reconciled stale tracking: **20** HRM UC had controllers but matrix still `planned` — promoted to **`be`** with concrete API map entries. Re-verified **P1-S5-BE-WAVE-FINAL** (config 02/03/05, WF 02–06, CC P0): **125/125** xbos jest, **118/118** hrm jest, `verify:capabilities` exit **0**.

| Snapshot | planned | be | e2e_pass | data | fe |
|----------|--------:|---:|---------:|-----:|---:|
| U18 baseline (08h) | 63 | 88 | 30 | 50 | 13 |
| Post P1-S5-QA-01 | 57 | 74 | 56 | 49 | 8 |
| **After this GOV wave** | **36** | **95** | **56** | **49** | **8** |

SoT: `pnpm docs:phase1:matrix` · tool: `node scripts/dev/analyze-be-gap.mjs`

---

## API surface inventory (controllers)

### xbos-api (`apps/api/xbos-api`)

| Prefix | Module | Primary UC families |
|--------|--------|---------------------|
| `/api/xbos` | health, metrics | UC-XBOS-01, UC-XBOS-MET-01 |
| `config-sync` | publish, bootstrap, list | UC-XBOS-02..05, SYNC-01, CC-P0-05 |
| `workflow-engine` | definitions, instances, tasks | UC-XBOS-WF-*, UC-CC-P0-06 |
| `catalog-governance` | inbox, publish, WF start | XBOS-DM-HRM-*, UC-XBOS-CAT-* |
| `org-foundation`, `legal-entity-profile` | org tree, legal docs, shareholders | UC-XBOS-ORG-*, UC-CC-P0-01..03 |
| `position-rbac`, `tenant-scope`, `auth` | RBAC, tenant, login | UC-XBOS-11/12, TENANT-*, AUTH-* |
| `kpi-engine`, `business-master`, `platform-audit`, `alerts` | KPI, MD, audit, violations | KPI-*, MD-*, UC-XBOS-06/07 |
| `command-center` | workspace-meta | UC-CC-P0-08 |
| `asset-requests`, `assets` | **impl, map gap** | UC-XBOS-AR-*, AST-* |
| `infrastructure` | settings/summary | UC-XBOS-INF-* (**impl, map gap**) |
| `raci-governance` | RACI | UC-RACI-* (mostly data/fe) |

### hrm-api (`apps/api/hrm-api`)

| Prefix | Module | UC coverage (be) |
|--------|--------|------------------|
| `employees`, `attendance`, `payroll`, `recruitment`, `contracts-insurance` | core HR | HRM-EM/AT/PR/RC/CI, embed UC-HRM-22..25 |
| `settings-catalogs`, `catalog-sync` | XBOS pull + extension | HRM-SC-*, UC-HRM-06..08 |
| `employee-metadata`, `operations`, `performance`, `spreadsheet`, `fleet` | extended HR | HRM-MD/OP/PF/IM/FL (**promoted this wave**) |
| `auth/mobile`, `notifications`, `admin` | mobile + admin | UC-HRM-MOB-*, UC-HRM-01..05, UC-HRM-12 |

---

## `be` UC → endpoint map (95 total)

Full rows in matrix §2. Summary by cluster:

| Cluster | Count (be) | Representative endpoints |
|---------|------------|---------------------------|
| XBOS config / sync | 8 | `POST/GET config-sync/catalog*`, `bootstrap-xevn` |
| XBOS org / RBAC / tenant | 6 | `org-units/tree`, `position-rbac/*`, `tenant-scope/*` |
| XBOS WF (incl. WF-01) | 2 | `workflow-engine/definitions`, `tasks` (CC-P0-06) |
| XBOS KPI / MD / audit | 6 | `kpi-engine/*`, `business-master/:domain`, `platform-audit/events` |
| HRM core (EM/AT/PR/RC/CI/SV/NT) | 52 | `/api/hrm/{employees,attendance,payroll,...}` |
| HRM catalog / admin | 14 | `settings-catalogs/*`, `catalog-sync/*`, `admin/*` |
| HRM extended (MD/OP/PF/IM/SC seeds) | 20 | see [hrm-stale-promotion](#hrm-stale-promotion) |
| Cross (DM-HRM) | 2 | `catalog-governance/publish`, `settings-catalogs/sync-from-xbos` |

<a id="hrm-stale-promotion"></a>

### HRM stale `planned` → `be` (this wave)

| UC | Method | Path |
|----|--------|------|
| HRM-MD-01..05 | POST/GET | `/api/hrm/employee-metadata/change-requests`, `audit-logs` |
| HRM-OP-01..04 | POST/GET/PATCH | `/api/hrm/operations/tasks`, `reports/summary` |
| HRM-PF-01..04 | POST/GET | `/api/hrm/performance/cycles`, `evaluations` |
| HRM-IM-01..04 | POST/GET | `/api/hrm/spreadsheet/import/*`, `export`, `templates/:kind` |
| HRM-SC-06..09 | POST | extension reject, seed endpoints |

Evidence: controllers exist; jest coverage partial — **QA** smoke + optional UC-tagged specs in follow-up `P1-S5-BE-HRM-PROMO`.

---

## Missing impl vs `srs-api-map` (36 `planned`)

### A — No concrete map (`/api/xbos/*` wildcard) — **P2 / FE-primary**

| UC group | Count | Gap |
|----------|------:|-----|
| UC-XBOS-13..16 | 4 | Workflow canvas / reporting routes — FE + WF definitions |
| UC-XBOS-AR-01..03, AST-01..02 | 5 | Controllers **`asset-requests`**, **`assets`** exist — need map + jest tags |
| UC-XBOS-CC-05..08, DASH-01..03 | 7 | Portal cockpit / canvas — mostly FE |
| UC-CC-01, 03, 04 | 3 | Portal embed — FE |
| UC-ECO-SCOPE-01, MASTER-01, FE-01 | 3 | Portal auth shell / mock replacement |
| UC-HRM-20, 21 | 2 | Embed routes — **FE** (`fe` candidate) |

### B — Catalog governance wildcard (`XBOS-DM-10..18`) — **map + promote**

| UC | Impl hint | Action |
|----|-----------|--------|
| XBOS-DM-10..18 | `catalog-governance.controller` (inbox, approve, publish) | Add concrete paths in `srs-api-map.mjs`; jest UC tags; promote to `be` |

### C — Khối B `XBOS-DM-LOG-01..22` (49 × `data`)

| Status | Note |
|--------|------|
| `data` | Seed via `scripts/seed-logistic-catalog-phase1*.mjs` — **no** dedicated `logistic-api` in Phase 1; pattern reuses catalog-governance |

### D — True BE gaps (net-new endpoints)

| Priority | UC | Suggested API | Owner wave |
|----------|-----|---------------|------------|
| P1 | UC-XBOS-13..14 | Extend `workflow-engine` (definition versioning / multi-hat) | WF-2 |
| P1 | UC-XBOS-AR-* | Map to existing `GET/POST /asset-requests` | AR-MAP |
| P2 | UC-XBOS-INF-* | Map to `GET/PUT /infrastructure/settings` | INF-MAP |
| P2 | UC-XBOS-15..16 | `workflow-engine/reporting-routes` (exists on controller) | WF-2 |

---

## Prioritized execution waves (PM dispatch)

| Wave | ID | Goal | Dev-BE tasks | QA entry |
|------|-----|------|--------------|----------|
| **1** | `P1-S5-BE-WAVE-FINAL` | G2 config/WF/CC BE | ✅ Done — see sibling evidence | `P1-S5-QA-02` clusters |
| **2** | `P1-S5-BE-AR-INF-MAP` | Close map gaps for AR/AST/INF/DM-10..18 | srs-api-map + overrides + controller specs | Live smoke AR list/create |
| **3** | `P1-S5-BE-HRM-PROMO` | HRM be→e2e | jest tags for MD/OP/PF/IM; `qc:fe-be-health:pilot` | L2 embed + density |
| **4** | `P1-S5-BE-DM-LOG` | G4 logistic catalogs | devops seed + catalog-governance pull contract | `seed-logistic` evidence |
| **5** | `P1-S5-BE-WF-2` | UC-XBOS-13..16 | WF canvas API or document FE-only waiver | WF matrix rows |

---

## Handoff packets

### → PM / execution

| work_item_id | from | to | entry | exit | evidence |
|--------------|------|-----|-------|------|----------|
| P1-S5-BE-WAVE-FINAL | dev-be | qa | xbos jest green | L2 cluster PASS config/WF/CC | `p1-s5-be-wave-final-20260524.md` |
| P1-S5-BE-AR-INF-MAP | dev-be | dev-be | 36 planned triaged | AR/INF/DM-10..18 → `be` + map | this doc §Missing B |
| P1-S5-BE-HRM-PROMO | dev-be | qa | 95 be in matrix | HRM L1 UAT + persona density | `qc:fe-be-health:pilot` |

### → Dev-FE / Mobile

| UC | Contract |
|----|----------|
| UC-CC-P0-06 | `GET /api/xbos/workflow-engine/tasks` — inbox drawer |
| UC-HRM-20/21 | Embed shells — no new BE until FE wires existing list APIs |
| UC-HRM-MOB-* | Already `e2e_pass` — mobile uses `auth/mobile/*` |

---

## Verification (this session)

```text
pnpm --filter xbos-api test     → 30 suites, 125 tests PASS
pnpm --filter hrm-api test      → 27 suites, 118 tests PASS
pnpm run verify:capabilities    → pass=23 skip=35 fail=0 exit 0
pnpm docs:phase1:matrix         → 245 rows; be=95 planned=36
```

## Residual / defer

| Item | defer_reason | trigger_to_reopen |
|------|--------------|-------------------|
| G2 104/104 e2e_pass | Needs QA L2 + capability browser | P1-S5-QA-02 GO |
| OpenAPI parity | xbos-api.yaml missing some WF/CC paths | Before PROD cutover |
| logistic-api | Phase 2 — DM-LOG uses seed pattern | G4 gate fail |

## Artifacts touched (no commit)

- `scripts/lib/srs-api-map.mjs` — concrete HRM MD/OP/PF/IM/SC paths
- `docs/ecosystem/phase1-impl-status.json` — +20 `be` overrides
- `docs/ecosystem/PHASE1_UC_SRS_TECHSPEC_MATRIX.md` — regenerated
- `scripts/dev/analyze-be-gap.mjs` — gap analysis helper
