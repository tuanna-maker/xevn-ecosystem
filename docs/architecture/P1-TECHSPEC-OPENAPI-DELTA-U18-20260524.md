# Phase 1 U18 — TechSpec / OpenAPI delta (remaining planned UC)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-TODAY-GOV-SA` / `GOV-SRS-DELTA` |
| **Date** | 2026-05-24 (ICT) |
| **Owner** | SA |
| **Baseline** | 63 `planned`, 30 `e2e_pass`, 1 `waived` (`phase1-impl-status.json`) |
| **G gates** | G1–G9 open on promotion + E2E (`PHASE1_COMPLETION_PLAN.md`) |
| **Related ADR** | [`ADR-GROUP-CEO-MAIN-HOLDING-SCOPE.md`](./ADR-GROUP-CEO-MAIN-HOLDING-SCOPE.md), [`ADR-XBOS-M01-OPENAPI-BOUNDARIES.md`](../decisions/ADR-XBOS-M01-OPENAPI-BOUNDARIES.md), [`ADR-HRM-RBAC-SCOPE-LADDER.md`](../decisions/ADR-HRM-RBAC-SCOPE-LADDER.md) |

---

## 1. Executive summary

**Primary gap is spec drift, not greenfield design.** Of ~57–63 matrix rows still marked `planned`, a majority already have Nest controllers in `apps/api/*` but are missing from OpenAPI YAML, FE wiring, or `impl_status` promotion. U18 execution should prioritize **contract documentation → FE anti-mock → QA e2e_pass** over new API invention.

| Khối | Planned (matrix) | Root cause class | SA verdict |
|------|----------------:|------------------|------------|
| **A** — XBOS + M00 CC | ~37 | OpenAPI S2 defer + FE mock (dashboard, CC rail) | Document S2 planes; compose KPI from `kpi-engine` |
| **C** — HRM | ~20 | BE exists; OpenAPI/hrm-api.yaml stops at S3 core; embed tabs | Extend `hrm-api.yaml` §Metadata/Spreadsheet/Operations/Performance |
| **B** — DM-LOG | 0 `planned` (22 `data`) | M03 TechSpec absent; verify-only for LOG-19..22 | Pattern-reuse delta, not new controllers |

---

## 2. Architecture invariants (all new/changed endpoints)

Apply [`ADR-GROUP-CEO-MAIN-HOLDING-SCOPE.md`](./ADR-GROUP-CEO-MAIN-HOLDING-SCOPE.md) §4:

| Surface | Resolver | Notes |
|---------|----------|-------|
| HRM operational lists | `resolveHrmListScope` | Group CEO `main` → `GROUP_MEMBER_SLUGS` |
| HRM settings-catalogs | `resolveHrmSettingsCatalogCompanyId` | Persist/read key `holding` |
| XBOS KPI rollup | `resolveKpiRollupScopeContext` | JWT `main` + query `holding` OK |
| XBOS org / business-master / assets | `resolveScopeContext` | Strict 409 — no ad-hoc alias |
| XBOS group legal read (audit, CC meta) | `resolveXbosGroupLegalReadScopeContext` | CC workspace-meta |

OpenAPI **must** document scope behavior per path (409 `SCOPE_CONTEXT_MISMATCH`).

---

## 3. OpenAPI package deltas

### 3.1 `docs/api/openapi/xbos-api.yaml` → **v1.2.0-p1-s2**

Extend S1 M01 with deferred S2 planes (code already exists):

| Tag | Prefix | operationId (add) | UC / spec_ref |
|-----|--------|-------------------|---------------|
| **M01-WF** | `/workflow-engine/*` | `wfListDefinitions`, `wfUpsertDefinition`, `wfStartInstance`, `wfListInstances`, `wfInstanceDetail`, `wfListTasks`, `wfCompleteTask`, `wfRejectTask`, `wfListReportingRoutes`, `wfUpsertReportingRoute` | `UC-XBOS-13`..`15`, `UC-XBOS-WF-01`..`06`, `UC-XBOS-CC-06` |
| **M01-AssetRequest** | `/asset-requests` | `assetRequestList`, `assetRequestCreate`, `assetRequestTransition` | `UC-XBOS-AR-01`..`03`, `UC-XBOS-16` |
| **M01-Assets** | `/assets` | `assetRegister`, `assetList`, `assetUpdate`, `assetLifecycleEvents` | `UC-XBOS-AST-01`..`02` |
| **M01-Infra** | `/infrastructure/*` | `infraGetSettings`, `infraUpsertSettings`, `infraGetSummary` | `UC-XBOS-INF-01`..`03`, `UC-XBOS-CC-07` |
| **M01-Audit** | `/platform-audit/events` | `platformAuditListEvents` | `UC-XBOS-06` |
| **M01-CC** (extend) | `/command-center/workspace-meta` | *(exists)* | `UC-CC-P0-08` |
| **M01-CC** (new) | `/command-center/executive-rail` | `ccExecutiveRail` | `UC-XBOS-CC-05` — **compose** `kpi-engine/portal-alerts` + `workflow-engine/tasks` + optional counts; **no** duplicate KPI math |
| **M01-Org** (extend) | `/org-foundation/legal-entities/:id/shareholders`, `/documents` | `orgShareholdersCrud`, `orgLegalDocuments` | `UC-CC-03`, `UC-CC-04`, `UC-CC-P0-02` |
| **M01-DM-Ops** | `/config-sync/catalog/{key}/export`, `/import` | `catalogExport`, `catalogImport` | `XBOS-DM-10`..`11` |
| **M01-Catalog** (extend) | `/catalog-governance/*` | document reject + history query | `XBOS-DM-12`..`18`, `UC-XBOS-CAT-*` |

**Dashboard (no new math plane):**

| UC | FE contract | Backend sources |
|----|-------------|-----------------|
| `UC-XBOS-DASH-01` | `GET /kpi-engine/rollup` + `GET /command-center/executive-rail` | Compose in FE or thin BFF in `command-center` |
| `UC-XBOS-DASH-02` | `GET /kpi-engine/rollup?companyId=` per member unit | Group CEO: iterate `GROUP_MEMBER_SLUGS` or single rollup |
| `UC-XBOS-DASH-03` | `GET/PUT /business-master/kpi_metrics` + policy fields in `custom_fields` | Whitelist domain — no new controller |

**Deferred / waiver (do not block G2 today):**

| UC | Decision |
|----|----------|
| `UC-ECO-MASTER-01` | Covered by `business-master/:domain` — meta-UC; mark `waived` or map to existing domains |
| `UC-ECO-FE-01` | Tracking UC for `FE_MOCK` audit — exit = `verify:capabilities` PASS, not one endpoint |
| `UC-ECO-SCOPE-01` | Portal route guard — FE `AuthGuard` + redirect; no XBOS API |
| `UC-XBOS-INF-02` | **Gap:** metadata field templates per legal entity — reuse `infrastructure/settings.metaTemplates[]` or `business-master` extension; SA recommends JSON column in `xbos_infrastructure_settings` P1-minimal |

**CI gate:** extend `pnpm verify:openapi-m01` → `verify:openapi-p1-s2` with required operationIds above.

### 3.2 `docs/api/openapi/hrm-api.yaml` → **v1.3.0-p1-s3b**

Add planes (controllers exist; YAML missing):

| Tag | Paths | operationId | UC / spec_ref |
|-----|-------|-------------|---------------|
| **Metadata** | `POST/GET /employee-metadata/change-requests`, `POST .../approve`, `POST .../reject`, `GET /employee-metadata/audit-logs` | `metaSubmit`, `metaList`, `metaApprove`, `metaReject`, `metaAuditLog` | `HRM-MD-01`..`05`, `UC-HRM-26` |
| **Spreadsheet** | `GET /spreadsheet/templates/:kind`, `POST /spreadsheet/import/preview`, `POST /spreadsheet/import/commit`, `POST /spreadsheet/export`, `GET /spreadsheet/limits` | `sheetTemplate`, `sheetPreview`, `sheetCommit`, `sheetExport`, `sheetLimits` | `HRM-IM-01`..`04` |
| **Operations** | `POST/GET /operations/tasks`, `PATCH /operations/tasks/:id/status`, `GET /operations/reports/summary`, `POST/GET /operations/service-requests` | `opsTask*`, `opsSummary`, `opsServiceRequest*` | `HRM-OP-01`..`04`, `UC-HRM-MOB-11` |
| **Performance** | `POST/GET /performance/cycles`, `POST/GET /performance/evaluations` | `perfCycle*`, `perfEval*` | `HRM-PF-01`..`04` |
| **Embed** | Document consumer: `GET /employees` (list rollup), aggregates for overview | `listEmployees`, `getEmployeeById` | `UC-HRM-20`, `UC-HRM-21` |

**OpenAPI fix (breaking doc only):** `CompanyIdQuery` schema — allow **slug** (`main`, `holding`, member slugs) not only UUID; aligns with ADR scope ladder.

**Scope note on all list paths:** reference `resolveHrmListScope` in description; group CEO `company_id=main` returns rollup partition.

### 3.3 Khối B — M03 Logistic DM (TechSpec only)

No new logistic-api in P1. Pattern:

| UC | Technical binding | API surface |
|----|-------------------|-------------|
| `XBOS-DM-LOG-01`..`09` | Same as `XBOS-DM-01`..`09` with `CatalogTarget=logistic` or catalog keys prefixed `log_dm_*` | `config-sync/catalogs?target=xbos` + company scope |
| `XBOS-DM-LOG-10`..`18` | Same governance as `XBOS-DM-10`..`18` | `catalog-governance` + publish |
| `XBOS-DM-LOG-19` | Pre-flight script | `pnpm verify:phase1:logistic-catalog` (gate) |
| `XBOS-DM-LOG-20`..`22` | Seed cardinality rules | `scripts/seed/phase1-logistic-catalog.ts` + BA checklist |

Add **`docs/logistics/TECHSPEC_M03_DM_LOG_P1.md`** (delta stub) — full `docs/logistics/TECHSPEC.md` remains P2.

---

## 4. TECHSPEC_HE section deltas (append-only)

### §4.7 — OpenAPI P1-S2/S3b extension (2026-05-24)

| Package | Version | Scope |
|---------|---------|-------|
| `xbos-api.yaml` | 1.2.0-p1-s2 | WF, Asset, Infra, Audit, CC rail, DM export/import |
| `hrm-api.yaml` | 1.3.0-p1-s3b | Metadata, Spreadsheet, Operations, Performance |

Static gate: `pnpm verify:openapi-p1-s2` (new) + existing M01 gate.

### §7.3 supplement — Workflow REST contract

| Step | Endpoint | Code |
|------|----------|------|
| Save definition | `PUT /workflow-engine/definitions/:id` | `XBOS-WF-201` |
| Start instance | `POST /workflow-engine/instances` | `XBOS-WF-201` |
| Inbox tasks | `GET /workflow-engine/tasks?assigneeUserId=` | `XBOS-WF-203` |
| Approve step | `POST /workflow-engine/tasks/:id/complete` | `XBOS-WF-200` |
| Reject step | `POST /workflow-engine/tasks/:id/reject` | `XBOS-WF-205` |
| Reporting routes | `GET/POST /workflow-engine/reporting-routes` | `UC-XBOS-15` |

### §9.5 supplement — M03 DM-LOG P1 (không logistic-api)

Logistic Phase 1 = **catalog configuration only** on XBOS hub. Operational LG-* UC remain P2 per `LO_TRINH_PHASE_1_2_XEVN.md`.

---

## 5. impl_status correction (SA recommendation)

Promote to `be` after OpenAPI row exists (Dev-BE + matrix regen):

| UC cluster | Evidence controller |
|------------|---------------------|
| `UC-XBOS-13`..`15`, `WF-*`, `UC-XBOS-CC-06` | `workflow-engine.controller.ts` |
| `UC-XBOS-AR-*`, `UC-XBOS-16` | `asset-request.controller.ts` |
| `UC-XBOS-AST-*` | `assets.controller.ts` |
| `UC-XBOS-INF-*`, `UC-XBOS-CC-07` | `infrastructure.controller.ts` |
| `UC-XBOS-06` | `platform-audit.controller.ts` |
| `HRM-MD-*` | `employee-metadata.controller.ts` |
| `HRM-IM-*` | `spreadsheet.controller.ts` |
| `HRM-OP-*` | `operations.controller.ts` |
| `HRM-PF-*` | `performance.controller.ts` |

Remaining `planned` after promotion → **FE + E2E** backlog (not BE invention).

---

## 6. Risks

| Risk | Mitigation |
|------|------------|
| OpenAPI drift from Nest | Same PR rule as ADR-XBOS-M01; verify script |
| CC executive rail duplicates KPI | Rail = read compose only; math stays `kpi-engine` |
| Group CEO 409 on new lists | Mandatory scope helper from §2 |
| U18 EOD over-scope | P0 = promote+wire existing BE; P2 = INF-02 templates, ECO-MASTER-01 |

---

## 7. Validation evidence plan

| Check | Owner | Pass |
|-------|-------|------|
| OpenAPI static | Dev-BE | `verify:openapi-p1-s2` exit 0 |
| Scope regression | QA | `hrm-list-scope.spec`, `kpi-rollup-scope.spec` |
| FE anti-mock | Dev-FE | `FE_MOCK_TO_API_AUDIT.md` W1–W14 → API or disabled |
| L2 pilot | QA | `PILOT_BUSINESS_FLOW_MATRIX.md` P-CC-* |
| G1 promotion | QA-02 | `planned` → `e2e_pass` with evidence path |

---

*Delta only — SRS unchanged. Full SRS: `docs/client-delivery/02_SRS_XeVN_OS.html`.*
