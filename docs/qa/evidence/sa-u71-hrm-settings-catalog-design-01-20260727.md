# SA-U71-HRM-SETTINGS-CATALOG-DESIGN-01 — Evidence

| Field | Value |
|-------|--------|
| **work_item_id** | `SA-U71-HRM-SETTINGS-CATALOG-DESIGN-01` |
| **lane** | governance · U71 |
| **date** | 2026-07-27 |
| **change_mode** | ADD · preserve_default |
| **ack_status** | **PASS_TO_PM** |

---

## 1. Deliverables

| Artifact | Path | Verdict |
|----------|------|---------|
| DB_DESIGN | `docs/hrm/DB_DESIGN_HRM_SETTINGS_CATALOG.md` | **PRESENT** — L0 XBOS `config_catalogs`/`config_catalog_items` · L1 `synced_catalogs` · L2a `hrm_catalog_extension_*` · keys `leave_types` / `departments`(+aliases) / `job_titles`|`positions` · soft consumer refs · `ref_srs` |
| API_DESIGN | `docs/hrm/API_DESIGN_HRM_SETTINGS_CATALOG.md` | **PRESENT** — F.1 triad on list/create/update/delete/sync/pull/get · DTO↔DB · errors · XBOS governance cite |

### F.1 spot-check (API)

| Endpoint | Mục đích | Nghiệp vụ | Bước SRS |
|----------|----------|-----------|----------|
| `GET /api/hrm/settings-catalogs` | ✅ | ✅ | FR-HRM-SC-01 Diễn biến #1–#4 |
| `GET …/{catalogKey}/items` | ✅ | ✅ | FR-HRM-SC-POS-01 / LEAVE-01 picker |
| `POST/PATCH/DELETE …/items` | ✅ | ✅ | POS/LEAVE CRUD Diễn biến |
| `POST …/sync-from-xbos` | ✅ | ✅ | UC-HRM-06 / FR-HRM-06 |
| `POST /api/hrm/catalog-sync/pull/:key` + GET list/get/status | ✅ | ✅ | UC-HRM-06..08 |

---

## 2. Spec read ack

| Source | Cite |
|--------|------|
| Gap scan | `docs/qa/evidence/sa-u71-spec-gap-scan-01-20260727.md` — Settings P0 row |
| TechSpec | `docs/hrm/TECHSPEC.md` §11.4 · §14.8 · §16.2 · §18.1 |
| ADR | `docs/decisions/ADR-HRM-SETTINGS-SOT-REC-WF-COMPANY-20260723.md` S1/S3 |
| XBOS | `docs/xbos/TECHSPEC.md` FR-XBOS-CAT-02/05 · `DANH_MUC_XBOS_CHO_HRM.md` |
| SRS | team §16.2 FR-HRM-SC-POS/LEAVE · khách delta Diễn biến §2 · §4 |
| Style ref | `DB_DESIGN_HRM_COMPANY_DISPLAY.md` · `API_DESIGN_HRM_COMPANY_LIST.md` |
| Runtime truth | `hrm-settings-master-keys.ts` · `settings-catalogs.service` DDL · `catalog-sync` pull · XBOS `config_catalogs` |

---

## 3. Architecture decisions (locked in design)

| Decision | Verdict |
|----------|---------|
| SoT group master | **XBOS** `config_catalog_*` (ADR S1) |
| HRM persistence | Snapshot `synced_catalogs` + extension overlay only |
| Tenant CRUD write path | `hrm_catalog_extension_items` (S3 UX) — not fork SoT |
| Publish/pull key | Same `catalog_key` + `(tenant_id, company_id)` partition |
| Consumer integrity | Soft code assert ∈ effectiveItems — no hard FK |

**must_keep:** XBOS SoT · U65 no-seed evidence · honest empty unsynced.  
**forbidden:** `apps/**` this wave · HRM invent group master · free-text leave/dept/pos SoT.

---

## 4. Residual

| Residual | Owner | Note |
|----------|-------|------|
| OpenAPI yaml Settings mutation semantics refresh | `dev-be` | After PM opens execution |
| Full XBOS catalog-governance API_DESIGN | `SA-U71-XBOS-CATALOG-GOV-DESIGN-01` | Cited §8 only |
| Leave balance physical DB | `SA-U71-HRM-LEAVE-DESIGN-01` | Consumer of `leave_types` |
| Path `docs/tech-spec/` bootstrap | `SA-U71-PATH-CONVENTION-01` | Files under `docs/hrm/` OK per scan |
| G-RULE-11 | Still OPEN program-wide | One more P0 pair closed; others remain |

---

## 5. Handoff

### completion_report

**Closed:** U71 physical F.1 pair for HRM Settings catalogs — DB layers L0/L1/L2a + publish/pull keys for leave_types / departments / positions (job_titles); API_DESIGN covers overview, items list, create/update/delete, sync-from-xbos, catalog-sync pull/list/get/status with Mục đích · Nghiệp vụ · bước SRS · DTO↔DB · errors. No `apps/**`.

**Residual:** XBOS CAT gov full file; OpenAPI refresh on Dev wave; leave balance design separate; G-RULE-11 program still open until other P0 writes.

### next_owner

`pm`

### next_dispatch_prompt

```text
work_item_id: QA-U71-HRM-SETTINGS-CATALOG-DESIGN-REVIEW-01 (optional spot) OR continue P0 writes
role: pm → next SA write OR ba-data spot FK

If continuing U71 P0 write wave (recommended parallel remaining):
1) SA-U71-HRM-LEAVE-DESIGN-01 — DB_DESIGN_HRM_LEAVE + API_DESIGN_HRM_LEAVE (cite leave_types from docs/hrm/DB_DESIGN_HRM_SETTINGS_CATALOG.md)
2) SA-U71-HRM-CO-HC-DESIGN-01 — if not done
3) SA-U71-XBOS-ORG-LEGAL-DESIGN-01 / SHAREHOLDER

When opening Dev Settings execution:
  read_first MUST include:
    - docs/hrm/DB_DESIGN_HRM_SETTINGS_CATALOG.md
    - docs/hrm/API_DESIGN_HRM_SETTINGS_CATALOG.md
    - docs/hrm/TECHSPEC.md §18.1
    - ADR-HRM-SETTINGS-SOT-REC-WF-COMPANY-20260723
  entry: U65 zero-seed; XBOS SoT must_keep
  exit: spec_read_ack with db_design + api_design + bước SRS; CODE-MEMORY APPEND
Cấm: Dev feature Settings without this pair in read_first (U71).
```

### ack_status

**PASS_TO_PM**

### evidence_path

`docs/qa/evidence/sa-u71-hrm-settings-catalog-design-01-20260727.md`

### pm_dispatch_hint

`SA-U71-HRM-LEAVE-DESIGN-01` next P0 settings-adjacent; Dev Settings blocked until PM opens execution with this pair in `read_first`.
