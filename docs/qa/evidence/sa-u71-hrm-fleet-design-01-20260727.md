# SA-U71-HRM-FLEET-DESIGN-01 — Physical DB + API (FL-01)

| Field | Value |
|-------|--------|
| **work_item_id** | `SA-U71-HRM-FLEET-DESIGN-01` |
| **from_role** | `pm` |
| **to_role** | `sa` |
| **lane** | governance · U71 P2 physical design |
| **change_mode** | ADD · preserve_default |
| **date** | 2026-07-27 |
| **ack_status** | **PASS_TO_PM** |

---

## 1. Deliverables

| Artifact | Path | Status |
|----------|------|--------|
| DB_DESIGN (canonical) | `docs/hrm/DB_DESIGN_HRM_FLEET.md` | **ADD** |
| API_DESIGN (canonical) | `docs/hrm/API_DESIGN_HRM_FLEET.md` | **ADD** |
| Pointer DB | `docs/tech-spec/DB_DESIGN_HRM_FLEET.md` | **ADD** |
| Pointer API | `docs/tech-spec/API_DESIGN_HRM_FLEET.md` | **ADD** |
| Index promote | `docs/tech-spec/README.md` §2 → **19** pairs · §3 FL **DONE** · Admin/Import residual | **UPDATED** |

**forbidden_paths:** `apps/**` — **not touched**.

---

## 2. F.1 checklist (API_DESIGN)

| § | Endpoint | Mục đích | Nghiệp vụ xử lý | Bước SRS (UC/FR + Diễn biến) | Verdict |
|---|----------|----------|-----------------|------------------------------|---------|
| A | `GET /api/hrm/fleet/vehicles` | ✅ Danh sách hồ sơ xe / empty | ✅ resolveHrmListScope + TEXT filter + status/limit | FR-HRM-FL-01 #1/#2/#3/#6/#8 · G-FL-02/01/07 residual #4/#5/#7 | **PASS** |
| B | Service `upsertVehicle` (no HTTP) | ✅ Documented residual only | ✅ UPSERT UK plate — **not** TechSpec-required FL-01 write | FL-01 «không tạo ở bước chỉ xem» · G-FL-UPSERT | **PASS** (residual, not ALIGNED HTTP) |

**Note:** TechSpec §16.5 FL-01 requires **list only**. Public mutate not invented as DONE.

---

## 3. must_keep (verified not rewritten)

| Pair | Path |
|------|------|
| HRM Operations | `docs/hrm/DB_DESIGN_HRM_OPERATIONS.md` · API |
| HRM W2 slice | `docs/hrm/DB_DESIGN_HRM_W2_SLICE.md` · API |
| HRM Payroll / Leave / ATT | prior `docs/hrm/DB_DESIGN_HRM_*` |
| XBOS Auth/Tenant | `docs/xbos/DB_DESIGN_XBOS_AUTH_TENANT.md` · API |
| XBOS RACI / WF / catalog-gov / KPI | prior `docs/xbos/DB_DESIGN_XBOS_*` |

---

## 4. Architecture facts (evidence-based)

| Fact | Source |
|------|--------|
| `hrm_fleet_vehicles.company_id` **TEXT** + `tenant_id` TEXT | `FleetService.ensureSchema` |
| UK `(tenant_id, company_id, license_plate)` | `uq_hrm_fleet_plate_scope` |
| CHK status `active`\|`inactive` | DDL |
| List = `resolveHrmListScope` + `pushCompanyIdFilter` | `FleetController.listVehicles` |
| Public HTTP = GET only | `fleet.controller.ts` |
| `upsertVehicle` service-only | `fleet.service.ts` — no controller route |
| ≠ Operations UUID plane | Contrast `G-OP-PLANE-01` — Fleet stays TEXT |

---

## 5. Residual

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **G-FL-01** | Info | `ba`/`dev-fe` optional | Detail get-by-id non-goal |
| **G-FL-02** | P2 | `dev-be` | Keyword plate/name filter |
| **G-FL-07** | P2 | `dev-fe`+`qa` | Catalog-missing UX |
| **G-FL-UPSERT** | Info/P2 | `pm`→BA | Public write after write FR |
| **G-SCOPE-01** | P0 standing | `dev-be`+`qa` | on-touch fleet list |
| OpenAPI `/fleet/vehicles` | P2 | `dev-be` | yaml deepen |
| **SA-U71-HRM-ADMIN-DESIGN-01** | P2 | `sa` | **next** backlog Admin FR-02..05 |
| **SA-U71-HRM-IMPORT-PREVIEW-DESIGN-01** | P3 | `sa` | after Admin or parallel if PM splits |

**Non-claims:** Phase 1 DONE · PROD-READY · UF 🟢 bulk · seed for evidence.

---

## 6. Handoff

### completion_report

**Closed:** U71 P2 HRM Fleet physical design — `DB_DESIGN_HRM_FLEET` + `API_DESIGN_HRM_FLEET` F.1 for `GET /api/hrm/fleet/vehicles` (TechSpec-required); service upsert documented as residual (FL-01 view-only); TEXT slug plane + UK plate; Settings `hrm_fleet_*` cited; thin pointers; README §2 count **19**; §3 FL marked DONE; F.1 checklist complete; must_keep OP/W2/payroll/leave/ATT + XBOS Auth/RACI/WF/catalog-gov/KPI preserved; no `apps/**`.

**Residual:** G-FL-01/02/07 · G-FL-UPSERT · G-SCOPE-01 on-touch · OpenAPI deepen · next SA Admin invite/reset (then Import preview P3).

### next_owner

`pm`

### next_dispatch_prompt

```text
work_item_id: SA-U71-HRM-ADMIN-DESIGN-01
role: sa
lane: governance · U71 P2
read_first:
  - docs/hrm/TECHSPEC.md §16.2 FR-HRM-02..05 (platform-admin / company-admin / invite / reset)
  - docs/xbos/DB_DESIGN_XBOS_AUTH_TENANT.md (must_keep — cite JWT/membership; do not wipe)
  - docs/hrm/DB_DESIGN_HRM_FLEET.md · DB_DESIGN_HRM_OPERATIONS.md (must_keep siblings)
  - docs/tech-spec/README.md §3 residual admin/import
  - templates TECHSPEC_PHYSICAL_DB_TABLE + TECHSPEC_API_CONTRACT
deliver:
  - docs/hrm/DB_DESIGN_HRM_ADMIN.md (platform_admins / memberships / invite paths TechSpec lists)
  - docs/hrm/API_DESIGN_HRM_ADMIN.md F.1 for FR-02..05 endpoints
  - thin pointers + README §2 promote · mark Admin DONE in §3
  - evidence docs/qa/evidence/sa-u71-hrm-admin-design-01-YYYYMMDD.md
change_mode: ADD · preserve_default
cấm: apps/** · wipe Fleet/OP/W2/Auth · seed · Phase1/PROD claim
```

### evidence_path

`docs/qa/evidence/sa-u71-hrm-fleet-design-01-20260727.md`

### ack_status

**PASS_TO_PM**
