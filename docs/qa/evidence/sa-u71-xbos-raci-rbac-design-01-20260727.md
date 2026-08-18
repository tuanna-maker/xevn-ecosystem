# SA-U71-XBOS-RACI-RBAC-CAT-DESIGN-01 — Physical DB_DESIGN + API_DESIGN (F.1)

| Field | Value |
|-------|--------|
| **work_item_id** | `SA-U71-XBOS-RACI-RBAC-CAT-DESIGN-01` |
| **lane** | governance · U71 P1 |
| **date** | 2026-07-27 |
| **change_mode** | ADD · preserve_default |
| **forbidden** | `apps/**` (not touched) |
| **ack_status** | **PASS_TO_PM** |

---

## 1. Spec read ack

| Layer | Path · section |
|-------|----------------|
| Gap scan | `docs/qa/evidence/sa-u71-spec-gap-scan-01-20260727.md` — XBOS RACI + position-rbac + CC catalogs P1 |
| TechSpec | `docs/xbos/TECHSPEC.md` **§14.14 FR-XBOS-RACI-02** · **§14.15 FR-CC-P0-04** · **§14.16 FR-CC-P0-05** |
| RACI TS | `docs/xbos/RACI_GOVERNANCE_TECHSPEC.md` (schema baseline; API paths superseded by runtime/master TECHSPEC) |
| CC P0 | `docs/xbos/COMMAND_CENTER_P0_TECHSPEC.md` §2 matrix cell · §4 position-rbac |
| SRS khách | `SRS_XBOS_KHACH.md` **§3.13** Diễn biến #1–8 · **§3.14** #1–7 · **§3.15** #1–7 |
| WF must_keep | `docs/xbos/DB_DESIGN_XBOS_WORKFLOW.md` — `assignment_id` soft → `xbos_position_assignment` |
| Catalog-gov must_keep | `docs/xbos/DB_DESIGN_XBOS_CATALOG_GOV.md` · Settings HRM pair — CC autosave ≠ L0 publish |
| UF must_keep | **UF-XBOS-07** · **UF-XBOS-13** · **UF-XBOS-14** 🟢 |
| Gate | `.cursor/rules/spec-db-api-design-gate.mdc` · OS `13` §3.4.11.F/F.1 |
| Runtime truth | `FoundationSchemaService.ensureRaciGovernanceTables` · `PositionRbacService` · `BusinessMasterService` · controllers |

---

## 2. Deliverables

| Artifact | Path | Status |
|----------|------|--------|
| DB_DESIGN | `docs/xbos/DB_DESIGN_XBOS_RACI_RBAC.md` | **ADD** — RACI tables + CC matrix + assignment + business-master CC partitions |
| API_DESIGN | `docs/xbos/API_DESIGN_XBOS_RACI_RBAC.md` | **ADD** — Endpoints A–I F.1 |
| Pointers | `docs/tech-spec/DB_DESIGN_XBOS_RACI_RBAC.md` · `API_DESIGN_XBOS_RACI_RBAC.md` | **ADD** thin |
| Index | `docs/tech-spec/README.md` §2 + §3 + §5 | **Promoted** · count **14** pairs |

### F.1 checklist (API)

| Endpoint | Mục đích | Nghiệp vụ | Bước SRS | DTO↔DB | Errors |
|----------|----------|-----------|----------|--------|--------|
| GET `…/raci-governance/catalog` | ✅ | ✅ | FR-RACI-02 #2 | ✅ | RACI-200 |
| GET `…/companies/{id}/matrix` | ✅ | ✅ | FR-RACI-02 #2/#3/#7 | ✅ | RACI-200 · 409 |
| PUT `…/matrix/cell` | ✅ | ✅ | FR-RACI-02 #4–#8 · UF-07 | ✅ | RACI-201 |
| GET capabilities / coverage | ✅ | ✅ | Supporting #2 | ✅ | RACI-200 |
| GET `…/position-rbac/matrix` | ✅ | ✅ | FR-CC-P0-04 #2/#6 · UF-13 | ✅ | POS-200 |
| PUT `…/position-rbac/matrix` | ✅ | ✅ | FR-CC-P0-04 #4–#7 · UF-13 | ✅ | POS-201 |
| GET/POST assignments | ✅ | ✅ | WF soft cite | ✅ | POS-* |
| GET `…/command_center_catalogs/items` | ✅ | ✅ | FR-CC-P0-05 #2/#3/#6 · UF-14 | ✅ | MASTER-200 |
| PUT `…/items/{itemId}` autosave | ✅ | ✅ | FR-CC-P0-05 #4–#7 · UF-14 | ✅ | MASTER-201 |

---

## 3. Architecture notes (facts)

- **One paired pack** preferred: RACI + position-rbac matrix + CC catalogs share Command Center / Settings adjacency; catalog-gov L0 remains separate must_keep.
- RACI persist key = TEXT `company_id` (slug/holding); empty `raci_letters` clears override; audit append-only.
- Position matrix PK `(tenant_id, role_id, row_id)`; stable `row_id` from CC P0 defs.
- `xbos_position_assignment.id` = soft target of workflow `assignment_id` (must_keep WF pair).
- CC catalogs = `xbos_business_master_entries` domain `command_center_catalogs`; partitions `regulations|measurements|pricing`; JWT `main`→`holding`.
- **must_keep:** UF-07/13/14 🟢; U65 zero-seed; no wipe catalog-gov/Settings/WF.

---

## 4. Residual

| Item | Owner | Priority |
|------|-------|----------|
| OpenAPI add `raci-governance/*` | `BE-XBOS-OA-RACI-GOVERNANCE-01` · `dev-be` | P1 G-OA-W2-RACI-01 |
| OpenAPI CC kinds semantics | `BE-XBOS-OA-CC-CATALOGS-01` · `dev-be` | P1 G-OA-W2-CC-CAT-01 |
| class-validator RACI cell DTO | gộp OA | P2 |
| PermissionMatrixRow OpenAPI depth | P2 | G-DTO-W2-POS-01 |
| P2 sync RACI → permission_grant | Evolution | RACI TS §5 |
| Next U71 P2 | KPI / Auth-tenant | scan §2 |

---

## 5. Handoff

### completion_report

**Closed:** U71 P1 physical F.1 pair for XBOS RACI + position-rbac + CC catalogs — `DB_DESIGN_XBOS_RACI_RBAC.md` + `API_DESIGN_XBOS_RACI_RBAC.md` with Mục đích · Nghiệp vụ · bước SRS (FR-RACI-02 / FR-CC-P0-04 / FR-CC-P0-05 Diễn biến) · DTO↔DB · errors; WF `assignment_id` soft cite + catalog-gov must_keep; tech-spec thin pointers + README §2 promote (14 pairs); no `apps/**`.

**Residual:** OpenAPI deepen RACI + CC kinds (execution); DTO class-validator P2; KPI/Auth P2 backlog.

### next_owner

`pm`

### next_dispatch_prompt

```text
work_item_id: BE-XBOS-OA-RACI-GOVERNANCE-01 (+ optional BE-XBOS-OA-CC-CATALOGS-01 same wave)
role: dev-be
lane: execution
entry_criteria:
  - read docs/xbos/API_DESIGN_XBOS_RACI_RBAC.md Endpoints A–I (F.1)
  - read docs/xbos/DB_DESIGN_XBOS_RACI_RBAC.md
  - docs/xbos/TECHSPEC.md §14.14–14.16 gaps G-OA-W2-RACI-01 · G-OA-W2-CC-CAT-01
  - must_keep UF-XBOS-07/13/14 🟢 — sync OpenAPI only; cấm behavior change
exit_criteria:
  - xbos-api.yaml has raci-governance catalog/matrix/cell (+ capabilities/coverage)
  - command_center_catalogs domain docs enum regulations|measurements|pricing + examples
  - jest/OpenAPI smoke; no apps FE unless needed
  - READY_FOR_QA
evidence_path: docs/qa/evidence/be-xbos-oa-raci-cc-20260727.md
cấm: seed; wipe catalog-gov/WF pairs; change matrix merge semantics
```

### ack_status

**PASS_TO_PM**

### evidence_path

`docs/qa/evidence/sa-u71-xbos-raci-rbac-design-01-20260727.md`

### pm_dispatch_hint

`BE-XBOS-OA-RACI-GOVERNANCE-01` · `BE-XBOS-OA-CC-CATALOGS-01` — OpenAPI deepen after U71 physical pair; or next scan P2 `SA-U71-XBOS-KPI-DESIGN-01`.
