# SA-U71-XBOS-CATALOG-GOV-DESIGN-01 — Physical DB_DESIGN + API_DESIGN (F.1)

| Field | Value |
|-------|--------|
| **work_item_id** | `SA-U71-XBOS-CATALOG-GOV-DESIGN-01` |
| **lane** | governance · U71 P1 |
| **date** | 2026-07-27 |
| **change_mode** | ADD · preserve_default |
| **forbidden** | `apps/**` (not touched) |
| **ack_status** | **PASS_TO_PM** |

---

## 1. Spec read ack

| Layer | Path · section |
|-------|----------------|
| Gap scan | `docs/qa/evidence/sa-u71-spec-gap-scan-01-20260727.md` — XBOS Catalog governance WF P1 |
| TechSpec | `docs/xbos/TECHSPEC.md` **§14.11 FR-XBOS-CAT-02** · **§14.12 FR-XBOS-CAT-05** |
| SRS khách | `docs/client-delivery/xbos/SRS_XBOS_KHACH.md` **§3.11** Diễn biến #1–7 · **§3.12** Diễn biến #1–8 |
| UF must_keep | `USER_FLOW_OPERABILITY_MATRIX.md` **UF-XBOS-09** · **UF-XBOS-15** 🟢 |
| Consumer must_keep | `docs/hrm/DB_DESIGN_HRM_SETTINGS_CATALOG.md` · `API_DESIGN_HRM_SETTINGS_CATALOG.md` (L1 pull / L2a) |
| Gate | `.cursor/rules/spec-db-api-design-gate.mdc` · OS `13` §3.4.11.F/F.1 |
| Runtime truth | `ConfigSyncController/Service` · `CatalogGovernanceController/Service` · WF foundation tables · OpenAPI M01 |

---

## 2. Deliverables

| Artifact | Path | Status |
|----------|------|--------|
| DB_DESIGN | `docs/xbos/DB_DESIGN_XBOS_CATALOG_GOV.md` | **ADD** — L0 config_* + audit + WF bridge columns; dual-plane; HRM cite |
| API_DESIGN | `docs/xbos/API_DESIGN_XBOS_CATALOG_GOV.md` | **ADD** — publish / get-pull / list / start / inbox / approve (+ pending cite) F.1 |
| Pointers | `docs/tech-spec/DB_DESIGN_XBOS_CATALOG_GOV.md` · `API_DESIGN_XBOS_CATALOG_GOV.md` | **ADD** thin |
| Index | `docs/tech-spec/README.md` §2 + §3 | **Promoted** · count **10** pairs |

### F.1 checklist (API)

| Endpoint | Mục đích | Nghiệp vụ | Bước SRS | DTO↔DB | Errors |
|----------|----------|-----------|----------|--------|--------|
| POST `…/config-sync/catalog/{key}/publish` | ✅ | ✅ | UC-XBOS-02/05 | ✅ | CFG-203 / 409 |
| GET `…/config-sync/catalog/{key}` (pull) | ✅ | ✅ | UC-XBOS-03 · HRM-06 | ✅ | CFG-201 |
| GET `…/config-sync/catalogs` | ✅ | ✅ | UC-XBOS-04 | ✅ | CFG-202 |
| POST `…/catalog-governance/workflows/start` | ✅ | ✅ | FR-CAT-02 #1–7 · UF-15 | ✅ | CAT-211 |
| GET `…/catalog-governance/inbox` | ✅ | ✅ | FR-CAT-05 #2 · UF-09 | ✅ | CAT-212 empty OK |
| POST `…/tasks/{taskId}/approve` | ✅ | ✅ | FR-CAT-05 #1–8 · UF-09/15 | ✅ | CAT-201 |
| GET extension-requests | ✅ | ✅ | UC-CAT-01 | proxy | CAT-200 |

---

## 3. Architecture notes (facts)

- L0 SoT = `config_catalogs` + `config_catalog_items` + `catalog_audit_logs` (runtime `ensureSchema`).
- Governance WF = `xbos_workflow_*` with `business_type=HRM_CATALOG`, `business_id=batchId`; final approve → HRM `batches/{id}/review`.
- Pull = GET config-sync (XBOS) consumed by HRM Settings F/G — **Settings pair unchanged**.
- JWT `main` → `holding` on group **read**; publish/start use strict scope intersection (409).
- **must_keep:** UF-XBOS-09/15 🟢; U65 zero-seed; empty inbox valid.

---

## 4. Residual

| Item | Owner | Priority |
|------|-------|----------|
| Full WF engine physical API_DESIGN | `SA-U71-XBOS-WORKFLOW-DESIGN-01` | P1 |
| OpenAPI deepen reject/instance/publish alias | `dev-be` | when execution |
| G-W2-CAT-REJ reject FR client depth | BA W3 | P3 |
| apply-to-members G-BM-REC-02 | BM lane | P1 BM |

---

## 5. Handoff

### completion_report

**Closed:** U71 P1 physical F.1 pair for XBOS catalog governance — `DB_DESIGN_XBOS_CATALOG_GOV.md` + `API_DESIGN_XBOS_CATALOG_GOV.md` covering publish, pull (get/list), start WF, inbox, approve with Mục đích · Nghiệp vụ · bước SRS (FR-CAT-02/05 Diễn biến) · DTO↔DB · errors; Settings HRM consumer must_keep; tech-spec pointers + README §2 promote; no `apps/**`.

**Residual:** WF engine full design WI; OpenAPI deepen; reject FR P3; BM apply-to-members.

### next_owner

`pm`

### next_dispatch_prompt

```text
work_item_id: SA-U71-XBOS-WORKFLOW-DESIGN-01
role: sa
lane: governance · U71 P1
read_first:
  - docs/xbos/TECHSPEC.md §14.8–14.10 FR-WF-01/03/04
  - docs/xbos/DB_DESIGN_XBOS_CATALOG_GOV.md §6 (WF bridge cite — must_keep)
  - docs/xbos/API_DESIGN_XBOS_CATALOG_GOV.md §8 related
  - .cursor/rules/spec-db-api-design-gate.mdc
deliver:
  - docs/xbos/DB_DESIGN_XBOS_WORKFLOW.md
  - docs/xbos/API_DESIGN_XBOS_WORKFLOW.md (def/instance/task F.1)
  - promote docs/tech-spec/README.md §2 + thin pointers
exit: F.1 pair; PASS_TO_PM
evidence_path: docs/qa/evidence/sa-u71-xbos-workflow-design-01-YYYYMMDD.md
cấm: apps/** · wipe catalog-gov / Settings pairs
```

### ack_status

**PASS_TO_PM**

### evidence_path

`docs/qa/evidence/sa-u71-xbos-catalog-gov-design-01-20260727.md`

### pm_dispatch_hint

`SA-U71-XBOS-WORKFLOW-DESIGN-01` — next XBOS P1 physical; catalog-gov COMPLETE for Dev read_first on publish/approve.
