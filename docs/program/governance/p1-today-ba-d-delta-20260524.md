# P1-TODAY-GOV-BA-D — Data contract delta (U18 · Phase 1 today)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-TODAY-GOV-BA-D` |
| **program** | U18 · `PHASE1_TODAY_EXECUTION_PLAN.md` |
| **from_role** | ba-data |
| **to_role** | pm → dev-be (execution wave B/C) |
| **date** | 2026-05-24 (ICT) |
| **ack_status** | **PASS_TO_PM** |
| **spec_ref** | G5 · G3 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` · `HRM_SEED_CARDINALITY_RULES.md` · `S1_BA_DATA_MD01-08.md` |

---

## 1. Executive summary

| Topic | Finding | Dev-BE action (priority) |
|-------|---------|---------------------------|
| **G5 — 183 catalogs** | **183 = 72 HRM-facing** (`DANH_MUC_XBOS_CHO_HRM.md`) **+ 112 logistic** (`parseLogisticCatalogDefs()`). Seeds today: **560** logistic publishes (stub item), **6** HRM `target=hrm` keys on holding, **110** group-employee field defs — **not** full 72 HRM catalog keys. | P0: publish + `assignedTo` includes `hrm` for SRS §2–12 keys; P1: fix `XBOS-CFG-004` on `target=xbos` logistic list |
| **HRM contracts** | SoT = XBOS `config_catalogs` + pull → `synced_catalogs`; transactional data SoT = HRM tables with **CARD-*** + **CAT-*** rules (`HRM_SEED_CARDINALITY_RULES.md`). Scope: JWT `companyId=main` + row `company_slug` — never `xevn` as company. | P0: `seed:hrm:fidelity` / satellite seed; catalog pull before fidelity; list APIs use group rollup |
| **63 planned UC (tracking)** | Snapshot `phase1-impl-status.json` → **63 `planned`**, **50 `data`** (matrix regenerate: **57 / 49** — drift). **113 UC** blocked primarily on **data/seed/catalog**, not greenfield API design. | Wave B/C: close `data` first (publish+pull), then `planned` clusters below |

---

## 2. G5 — 183 catalog data contract (XBOS SoT)

### 2.1 Composition (183)

| Bucket | Count | Source doc | `catalog_key` pattern | `assigned_systems` (target) |
|--------|------:|------------|----------------------|-----------------------------|
| HRM / org / CC catalogs | **72** | `docs/hrm/DANH_MUC_XBOS_CHO_HRM.md` §2–12 | snake_case semantic (`job_titles`, `leave_types`, …) | Must include **`hrm`** for keys consumed by HRM embed/settings |
| Logistic + workflow defs | **112** (SRS ~111) | `docs/logistics/DANH_MUC_XBOS_VA_USECASE_LOGISTIC.md` §2 | `log_dm_{stt}` / `log_wf_{nnn}` | **`xbos`**, **`web-portal`** (Phase 1 seed); **`hrm`** only if SRS links menu |
| **Total** | **183** | BRD/SRS split | — | — |

### 2.2 Physical model — `public.config_catalogs` / `config_catalog_items`

| Column | Semantics | Validation |
|--------|-----------|------------|
| `tenant_id` | Tenant slug (`xevn`, `xe-du-lich`, …) | `^[a-z0-9][a-z0-9_-]{1,62}$` |
| `company_id` | Operating bucket (`holding`, `main`, member slugs) | Same regex; group HRM list uses **`main`** on API, **`holding`** for group catalog publish |
| `catalog_key` | Stable key; lowercased on write | Unique per `(tenant_id, company_id, catalog_key)` |
| `name` | Display label | Non-empty |
| `domain` | Module domain (`logistics`, `workflow_definition`, `performance_management`, …) | Free text in S1; logistic seed uses `logistics` or `workflow_definition` |
| `assigned_systems` | JSON array ⊆ `{hrm, xbos, web-portal}` | List/filter: `assigned_systems @> '["hrm"]'` |
| `version` | Monotonic on checksum change | Bump when item set changes |
| `checksum` | `sha256` canonical items (`config-sync.service` **XBOS-CFG-004** if mismatch) | Must match recomputed items on read |

**Item row**

| Column | Semantics | Validation |
|--------|-----------|------------|
| `code` | Business code | `^[A-Za-z0-9_:-]{2,64}$` (publish DTO) |
| `label` | Display | Non-empty |
| `unit` | Optional (KPI, etc.) | — |
| `status` | `active` \| `draft` | Enum |

### 2.3 API contract — publish / list (Dev-BE)

| Operation | HTTP | Envelope success | Deterministic errors |
|-----------|------|------------------|----------------------|
| Publish | `POST /api/xbos/config-sync/catalog/{catalogKey}/publish` | `success`, `code` `XBOS-CFG-201`, `data.version` | `XBOS-VAL-001` invalid target; scope 409 family |
| List for consumer | `GET /api/xbos/config-sync/catalogs?target={hrm\|xbos\|web-portal}&tenantId&companyId` | `XBOS-CFG-202`, `data.catalogs[]` | `XBOS-CFG-002` not assigned; **409 `XBOS-CFG-004`** checksum |
| Get one | `GET /api/xbos/config-sync/catalog/{key}?target=…` | Full `ConfigCatalog` + `items[]` | `XBOS-CFG-001` not found |

**Scope rules (G5 QA PASS — do not regress)**

| Persona | Headers | Expected `target=hrm` |
|---------|---------|---------------------|
| Group CEO | `x-tenant-id: xevn`, `x-company-id: holding` or `main` | **200**, **6 keys** (bootstrap set), **no 409** |
| Member CEO | `xe-du-lich` / `main` | **200**, **0 catalogs** (until member publish wave) |

**Seeded today (P1-S4-DO-01 / QA-01 evidence)**

| Seed command | Metric | Gap vs 183 |
|--------------|--------|------------|
| `pnpm run seed:phase1:logistic-catalog` | 112 keys × 5 companies = **560** rows; stub `PHASE1_STUB` only | Does not satisfy semantic items for DM UC; not in `target=hrm` |
| Bootstrap / holding publish | **6** HRM-assigned keys: `cost_centers`, `job_titles`, `kpi_library`, `xevn_business_domains`, `xevn_governance_policies`, `xevn_subsidiaries` | **66** of 72 HRM SRS catalogs not yet published with `hrm` |
| `pnpm run seed:hrm:group-employee-catalog` | **110** effective import fields / 5 scopes | Employee **field template** — not replacement for §2–12 value catalogs |

### 2.4 Delta rules for G5 closure (BA-D)

| ID | Condition | Expected result | Owner |
|----|-----------|-----------------|-------|
| **DELTA-G5-01** | For each STT 1–72 in `DANH_MUC_XBOS_CHO_HRM.md` | Row in `config_catalogs` with `assigned_systems` containing **`hrm`**, `version ≥ 1`, ≥1 `active` item | Dev-BE + DevOps seed |
| **DELTA-G5-02** | Logistic keys `log_dm_*` / `log_wf_*` | Remain published per company; items may stay stub until Phase 2 — **do not** count toward HRM menu density | Dev-BE |
| **DELTA-G5-03** | `GET …?target=hrm` after publish | `total ≥ 6` (today) → target **≥ 40** interim → **72** at G5 DONE | QA `verify:hrm:menu-density` + config-sync probe |
| **DELTA-G5-04** | Checksum drift | Re-publish or repair items before list; no silent skip | Dev-BE (`XBOS-CFG-004` residual on `target=xbos`) |
| **DELTA-G5-05** | HRM consumption | `POST /api/hrm/catalog-sync/pull/:catalogKey` writes `synced_catalogs` snapshot; settings UI reads snapshot | Dev-BE HRM |

**Suggested seed/API sequence (Wave B)**

```text
1. pnpm run seed:phase1:logistic-catalog          # 112 × companies (existing)
2. node scripts/seed-hrm-xbos-catalog-keys.mjs    # NEW — map 72 keys (DELTA-G5-01)
3. pnpm run seed:hrm:group-employee-catalog       # field defs (existing)
4. For each holding HRM key: catalog-sync/pull from HRM API (tenant xevn, company holding|main per PILOT_SCOPE)
5. QA: GET /config-sync/catalogs?target=hrm + menu-density
```

---

## 3. HRM data contracts (delta on existing packs)

**Authoritative baselines (no rewrite):**

- `docs/hrm/HRM_SEED_CARDINALITY_RULES.md` — CARD-*, CAT-*, scope, MEM-*
- `docs/qa/PILOT_SCOPE_DATA_MATRIX.md` — VAL-SCOPE-01..08
- `docs/xbos/S1_BA_DATA_MD01-08.md` — business-master JSONB (not catalog SoT)

### 3.1 HRM catalog ingestion plane

| Store | SoT | Key fields | Consumer |
|-------|-----|------------|----------|
| `public.synced_catalogs` | XBOS publish + pull | `tenant_id`, `company_id`, `catalog_key`, `version`, `checksum`, `payload` JSONB | `settings-catalogs`, dropdowns, import validation |
| `settings-catalogs` service | Merged snapshot + local overrides | `catalogKey`, `effectiveItems[]` | Portal HRM embed P-CC-04a |
| Transactional (contracts, leave, …) | HRM DB | FK `employee_id`, `company_id` slug | Menus per `HRM_MENU_DATA_LINKAGE_MATRIX.md` |

**Pull contract**

| Step | Rule |
|------|------|
| 1 | Resolve scope: `tenantId` + `companyId` from JWT (member: single tenant; group: `xevn` + `main` for API) |
| 2 | Upstream `GET {XBOS}/config-sync/catalog/{key}?target=hrm` |
| 3 | Upsert `synced_catalogs`; reject if upstream 409/404 |
| 4 | Satellite seed (**CARD-***) must reference **codes** present in snapshot (**VAL-CAT-01**) |

### 3.2 U18 deltas (HRM — not in prior pack)

| ID | Gap | Dev-BE / seed note |
|----|-----|-------------------|
| **DELTA-HRM-01** | Group CEO list under-count when querying `company_id=main` only | Apply rollup predicate across `GROUP_MEMBER_SLUGS` (R-CARD-01) in employees + satellite list services |
| **DELTA-HRM-02** | `seed:hrm:fidelity` not yet default in Wave C | Implement `seed-hrm-satellite-from-workforce.mjs` per CARD-*; run after catalog pull |
| **DELTA-HRM-03** | Member unit empty config-sync | Publish subset of 72 keys per `xe-du-lich/main` (DELTA-G5-01 member slice) |
| **DELTA-HRM-04** | Contract/leave type codes ad hoc | Map `employee_contracts.contract_type`, `leave_requests.leave_type` → synced catalog `code` |

---

## 4. Planned + data UC — data gap map (63 + 50)

### 4.1 Tracking sources

| Source | `planned` | `data` | Note |
|--------|----------:|-------:|------|
| `phase1-impl-status.json` → `last_regression.matrix_counts` | **63** | **50** | U18 baseline in `PHASE1_TODAY_EXECUTION_PLAN.md` |
| `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` (regenerate) | **57** | **49** | PM run `pnpm docs:phase1:matrix` to reconcile |

### 4.2 `data` status (49–50 UC) — seed/publish first

Primary blocker: **catalog version + items + HRM pull**, not new controllers.

| Cluster | UC examples | Data deliverable |
|---------|-------------|------------------|
| XBOS DM CRUD | `XBOS-DM-01` … `XBOS-DM-09` | Published catalogs with real items (not stub) per domain |
| XBOS DM workflow | `XBOS-DM-10` … `XBOS-DM-18` | Items + audit rows + approval workflow refs |
| XBOS DM-HRM | `XBOS-DM-HRM-01` … `XBOS-DM-HRM-15` | 72-key publish matrix; HRM pull; preset/field groups |
| CAT governance | `UC-XBOS-CAT-01`, `02`, `04`, `06`, `07` | Extension requests + WF catalog seeds |
| Data+XBOS | `UC-ECO-MASTER-01`, `UC-ECO-MASTER-03` | `xbos_business_master_entries` + catalog cross-ref |

**Exit for cluster:** `impl_status` → `be` or `fe` after `DELTA-G5-01` + pull + QA probe.

### 4.3 `planned` status (57–63 UC) — data prerequisites

| Cluster | Count (matrix) | UC IDs | Data prerequisite before API/FE |
|---------|---------------|--------|----------------------------------|
| Workflow / reporting | 3 | `UC-XBOS-13`, `14`, `15` | `workflow_definition` catalogs + engine seed instances |
| Asset requests | 5 | `UC-XBOS-16`, `AR-01`–`03`, `AST-01`–`02` | `asset_registry` rows + states; MD-07 vehicle types |
| Command Center / portal | 6 | `UC-ECO-SCOPE-01`, `UC-CC-01`, `03`, `04`, `UC-ECO-FE-01`, `UC-ECO-MASTER-01` | Org tree + legal entity master + dept templates |
| CC / INF / DASH | 8 | `UC-XBOS-CC-05`–`08`, `DASH-01`–`03`, `INF-01`–`03` | `command_center_catalogs`, `kpi_policies`, `kpi_sparkline_snapshots` domains |
| DM import/export/approve | 9 | `XBOS-DM-10`–`18` | Non-stub items + `catalog_audit_logs` |
| HRM master / scope / import | 23 | `HRM-MD-01`–`05`, `HRM-SC-06`–`09`, `HRM-IM-01`–`04`, `HRM-OP-01`–`04`, `HRM-PF-01`–`04`, `UC-HRM-20`, `21` | Group employee catalog + synced field groups + workforce N |
| **Total planned (matrix)** | **57** | — | — |

**U18 rule:** Do not mark `planned` UC as `e2e_pass` until **VAL-CAT-01** + **VAL-CARD-*** (if HRM UI) pass for the route.

### 4.4 Crosswalk — G5 / G3 gates

| Gate | UC slice | Data contract exit |
|------|----------|-------------------|
| **G5** | `XBOS-DM-*`, `XBOS-DM-HRM-*`, `UC-XBOS-CAT-*` | 183 publish checklist GREEN; config-sync `target=hrm` ≥ agreed count |
| **G3** | 119 HRM UC | CARD-* satisfied + catalogs synced; see `HRM_SEED_CARDINALITY_RULES.md` §3 |

---

## 5. Validation matrix (today’s wave)

| ID | Condition | Expected result |
|----|-----------|-----------------|
| VAL-U18-D-01 | After DELTA-G5-01 batch | `GET /api/xbos/config-sync/catalogs?target=hrm` (ceo scope) returns ≥40 keys OR documented waiver list |
| VAL-U18-D-02 | Each new catalog | ≥3 `active` items; checksum matches on read |
| VAL-U18-D-03 | HRM pull | `synced_catalogs` row count ≥ published hrm keys for same scope |
| VAL-U18-D-04 | Fidelity seed | `pnpm run verify:hrm:menu-density` exit 0 (7/7) |
| VAL-U18-D-05 | Scope | No 409 on group CEO holding/main for catalog list (regression) |
| VAL-U18-D-06 | Logistic xbos target | `XBOS-CFG-004` on `log_dm_1` **tracked** — fix or waive with owner |

---

## 6. Traceability (requirement → artifact → test)

| Requirement | BA delta | Implementation / seed | QA evidence |
|-------------|----------|----------------------|-------------|
| U18 G5 183 DM | §2 DELTA-G5-* | `seed:phase1:logistic-catalog`, future `seed-hrm-xbos-catalog-keys` | `p1-s4-qa-01-20260524.md`, config-sync probe |
| U18 G3 HRM 119 | §3 DELTA-HRM-* | `seed:hrm:group-employee-catalog`, `seed:hrm:fidelity` | `verify:hrm:menu-density`, L2 matrix |
| 63 planned closure | §4.3 | Per-cluster seeds above | `phase1:gate`, UC matrix regenerate |
| 50 data closure | §4.2 | Publish+pull | `PILOT_BUSINESS_FLOW_MATRIX` P-CC-04a |
| Multi-company scope | `PILOT_SCOPE_DATA_MATRIX` | `scope-context.ts`, headers | `qc:fe-be-health:pilot` |

---

## 7. Data risks (PM / TA)

| ID | Risk | Mitigation | Owner |
|----|------|------------|-------|
| R-U18-01 | Matrix 57 vs tracker 63 `planned` | Regenerate matrix; single SoT for dispatch | PM |
| R-U18-02 | Stub-only logistic items | Accept for G5 count; separate quality gate for DM UC | TA waiver |
| R-U18-03 | Checksum 409 blocks xbos consumer | Repair publish pipeline before Phase 2 logistic UI | Dev-BE |
| R-U18-04 | HRM catalog SoT bypass | Enforce CAT-02/CAT-03 in code review | TM |

---

## 8. Dev-BE backlog extract (dispatch-ready)

| Priority | Task | Commands / paths | Unblocks |
|----------|------|------------------|----------|
| P0 | Publish remaining HRM catalog keys (DELTA-G5-01) | New seed script + `config-sync` publish API | 50 `data` UC, G5 |
| P0 | HRM pull all holding keys | `POST /api/hrm/catalog-sync/pull/:key` | settings-catalogs, VAL-CAT-01 |
| P0 | Satellite fidelity seed | `seed-hrm-satellite-from-workforce.mjs` (per CARD-*) | G3, 23 planned HRM |
| P1 | Fix checksum for logistic catalogs | `config-sync.service` / re-seed items | `target=xbos` list |
| P1 | Group rollup on list APIs | `hrm-list-scope.ts` | DELTA-HRM-01, persona QA |
| P2 | Member-tenant catalog publish | DELTA-HRM-03 | `du-lich.ceo` flows |

---

## 9. Handoff packet

| Field | Value |
|-------|--------|
| work_item_id | `P1-TODAY-GOV-BA-D` |
| from_role | ba-data |
| to_role | pm |
| entry_criteria | U18 governance wave; G5/G3 in scope; S4 seed evidence exists |
| exit_criteria | Delta data contracts for 183 G5 + HRM + 63/50 UC gaps documented; Dev-BE backlog §8 |
| evidence_path | **`docs/program/governance/p1-today-ba-d-delta-20260524.md`** |
| needed_by | `P1-TODAY-GOV-BE-LEAD`, Wave B/C execution, QA L2 |
| ack_status | **PASS_TO_PM** |

---

## 10. References

- `docs/program/PHASE1_TODAY_EXECUTION_PLAN.md`
- `docs/program/PHASE1_COMPLETION_PLAN.md` (G5, G3)
- `docs/hrm/DANH_MUC_XBOS_CHO_HRM.md`
- `docs/logistics/DANH_MUC_XBOS_VA_USECASE_LOGISTIC.md`
- `docs/hrm/HRM_SEED_CARDINALITY_RULES.md`
- `docs/qa/evidence/p1-s4-do-01-20260524.md`, `p1-s4-qa-01-20260524.md`
- `apps/api/xbos-api/src/config-sync/config-sync.service.ts`
- `apps/api/hrm-api/src/catalog-sync/catalog-sync.service.ts`
