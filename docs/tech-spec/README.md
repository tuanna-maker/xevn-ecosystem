# XeVN — Physical DB_DESIGN + API_DESIGN index (U71)

| Field | Value |
|-------|--------|
| **work_item_id** | `SA-U71-TECHSPEC-INDEX-REFRESH-01` (was `SA-U71-PATH-CONVENTION-01`) |
| **gate** | `.cursor/rules/spec-db-api-design-gate.mdc` · OS `_vibe-team-os/13` §3.4.11.**F** / **F.1** |
| **control** | `docs/program/DATA_LINKAGE_BE_FE_QA_CONTROL.md` |
| **gap** | `G-RULE-11` / `G-SPEC-OS-02` — path **CLOSED**; P0 XBOS spine **COMPLETE**; residual = HRM/XBOS **P1** backlog |
| **Date** | 2026-07-27 |

---

## 1. Path convention (normative)

```text
BRD → SRS → TechSpec (docs/hrm|xbos|ecosystem/TECHSPEC*.md)
  → DB_DESIGN_*.md  (physical columns / FK / index · ref_srs)
  → API_DESIGN_*.md (F.1: Mục đích · Nghiệp vụ xử lý · Bước SRS)
  → test plan → Dev
```

| Rule | Detail |
|------|--------|
| **Canonical content** | Slice files **may live** under module roots: `docs/hrm/` · `docs/xbos/` · (future) `docs/ecosystem/`. Prefer the root already used by that module’s TechSpec. |
| **Index / pointers** | `docs/tech-spec/` holds this **README index** + optional **thin pointer** files that link to canonical paths — **no content duplication wipe**. |
| **Naming** | `DB_DESIGN_{DOMAIN}_{SLICE}.md` + `API_DESIGN_{DOMAIN}_{SLICE}.md` (paired). |
| **F.1 bar** | Every API_DESIGN endpoint section must include **Mục đích** + **Nghiệp vụ xử lý** + **Bước SRS** (UC + Diễn biến # / sequence step). |
| **PM `read_first`** | Cite the **canonical** module path (e.g. `docs/hrm/DB_DESIGN_HRM_CO_HC.md` or `docs/xbos/DB_DESIGN_XBOS_ORG_LEGAL.md`), not only the pointer. |
| **TechSpec ≠ physical** | Matrices inside `TECHSPEC.md` §14–§20 do **not** satisfy U71. |

### Allowed layouts

| Layout | When to use |
|--------|-------------|
| **A — Module root (preferred for HRM/XBOS slices)** | `docs/hrm/DB_DESIGN_*.md` + matching `API_DESIGN_*.md` · `docs/xbos/DB_DESIGN_*.md` + matching `API_DESIGN_*.md` |
| **B — tech-spec spine (optional full-module packs)** | `docs/tech-spec/DB_DESIGN_HRM.md` / `DB_DESIGN_XBOS.md` when writing a whole-domain pack |
| **C — Pointer only under tech-spec/** | Thin markdown linking to Layout A — keeps OS path discoverable |

---

## 2. Index — existing U71 pairs (2026-07-27)

| Slice | TechSpec | DB_DESIGN (canonical) | API_DESIGN (canonical) | Pointer (`docs/tech-spec/`) | Status |
|-------|----------|----------------------|------------------------|----------------------------|--------|
| **Company industry (Ngành nghề)** | `docs/hrm/TECHSPEC.md` **§20** | [`docs/hrm/DB_DESIGN_HRM_COMPANY_DISPLAY.md`](../hrm/DB_DESIGN_HRM_COMPANY_DISPLAY.md) | [`docs/hrm/API_DESIGN_HRM_COMPANY_LIST.md`](../hrm/API_DESIGN_HRM_COMPANY_LIST.md) | [DB](./DB_DESIGN_HRM_COMPANY_DISPLAY.md) · [API](./API_DESIGN_HRM_COMPANY_LIST.md) | **COMPLETE** F.1 · `D-HRM-CO-INDUSTRY-SA-01` |
| **Company headcount (CO-HC dual-plane)** | `docs/hrm/TECHSPEC.md` **§19** | [`docs/hrm/DB_DESIGN_HRM_CO_HC.md`](../hrm/DB_DESIGN_HRM_CO_HC.md) | [`docs/hrm/API_DESIGN_HRM_EMPLOYEES_SUMMARY.md`](../hrm/API_DESIGN_HRM_EMPLOYEES_SUMMARY.md) | [DB](./DB_DESIGN_HRM_CO_HC.md) · [API](./API_DESIGN_HRM_EMPLOYEES_SUMMARY.md) | **COMPLETE** F.1 · `SA-U71-HRM-CO-HC-DESIGN-01` |
| **Settings catalogs (leave/dept/positions)** | `docs/hrm/TECHSPEC.md` **§11.4 · §14.8 · §16.2** | [`docs/hrm/DB_DESIGN_HRM_SETTINGS_CATALOG.md`](../hrm/DB_DESIGN_HRM_SETTINGS_CATALOG.md) | [`docs/hrm/API_DESIGN_HRM_SETTINGS_CATALOG.md`](../hrm/API_DESIGN_HRM_SETTINGS_CATALOG.md) | [DB](./DB_DESIGN_HRM_SETTINGS_CATALOG.md) · [API](./API_DESIGN_HRM_SETTINGS_CATALOG.md) | **COMPLETE** F.1 · `SA-U71-HRM-SETTINGS-CATALOG-DESIGN-01` |
| **Leave requests + balance + WF** | `docs/hrm/TECHSPEC.md` **§14.5 · §16.1** | [`docs/hrm/DB_DESIGN_HRM_LEAVE.md`](../hrm/DB_DESIGN_HRM_LEAVE.md) | [`docs/hrm/API_DESIGN_HRM_LEAVE.md`](../hrm/API_DESIGN_HRM_LEAVE.md) | [DB](./DB_DESIGN_HRM_LEAVE.md) · [API](./API_DESIGN_HRM_LEAVE.md) | **COMPLETE** F.1 · `SA-U71-HRM-LEAVE-DESIGN-01` |
| **XBOS org / legal entity + documents** | `docs/xbos/TECHSPEC.md` **§14.4–14.5** · CC P0 §2–4 | [`docs/xbos/DB_DESIGN_XBOS_ORG_LEGAL.md`](../xbos/DB_DESIGN_XBOS_ORG_LEGAL.md) | [`docs/xbos/API_DESIGN_XBOS_ORG_LEGAL.md`](../xbos/API_DESIGN_XBOS_ORG_LEGAL.md) | [DB](./DB_DESIGN_XBOS_ORG_LEGAL.md) · [API](./API_DESIGN_XBOS_ORG_LEGAL.md) | **COMPLETE** F.1 · `SA-U71-XBOS-ORG-LEGAL-DESIGN-01` · evidence [`sa-u71-xbos-org-legal-design-01-20260727.md`](../qa/evidence/sa-u71-xbos-org-legal-design-01-20260727.md) |
| **XBOS shareholders** | `docs/xbos/TECHSPEC.md` **§14.6** · FR-CC-P0-01 | [`docs/xbos/DB_DESIGN_XBOS_SHAREHOLDERS.md`](../xbos/DB_DESIGN_XBOS_SHAREHOLDERS.md) | [`docs/xbos/API_DESIGN_XBOS_SHAREHOLDERS.md`](../xbos/API_DESIGN_XBOS_SHAREHOLDERS.md) | [DB](./DB_DESIGN_XBOS_SHAREHOLDERS.md) · [API](./API_DESIGN_XBOS_SHAREHOLDERS.md) | **COMPLETE** F.1 · `SA-U71-XBOS-SHAREHOLDER-DESIGN-01` · evidence [`sa-u71-xbos-shareholder-design-01-20260727.md`](../qa/evidence/sa-u71-xbos-shareholder-design-01-20260727.md) |
| **HRM employees CRUD + list scope** | `docs/hrm/TECHSPEC.md` **§14.1** FR-EM-01 · UC-HRM-21 | [`docs/hrm/DB_DESIGN_HRM_EMPLOYEES.md`](../hrm/DB_DESIGN_HRM_EMPLOYEES.md) | [`docs/hrm/API_DESIGN_HRM_EMPLOYEES.md`](../hrm/API_DESIGN_HRM_EMPLOYEES.md) | [DB](./DB_DESIGN_HRM_EMPLOYEES.md) · [API](./API_DESIGN_HRM_EMPLOYEES.md) | **COMPLETE** F.1 · `SA-U71-HRM-EMPLOYEES-DESIGN-01` · evidence [`sa-u71-hrm-employees-design-01-20260727.md`](../qa/evidence/sa-u71-hrm-employees-design-01-20260727.md) |
| **HRM attendance sheets** | `docs/hrm/TECHSPEC.md` **§12.1 · §13 · §14.4** FR-AT-14 | [`docs/hrm/DB_DESIGN_HRM_ATT_SHEET.md`](../hrm/DB_DESIGN_HRM_ATT_SHEET.md) | [`docs/hrm/API_DESIGN_HRM_ATT_SHEET.md`](../hrm/API_DESIGN_HRM_ATT_SHEET.md) | [DB](./DB_DESIGN_HRM_ATT_SHEET.md) · [API](./API_DESIGN_HRM_ATT_SHEET.md) | **COMPLETE** F.1 · `SA-U71-HRM-ATT-SHEET-DESIGN-01` · evidence [`sa-u71-hrm-att-sheet-design-01-20260727.md`](../qa/evidence/sa-u71-hrm-att-sheet-design-01-20260727.md) |
| **HRM contracts + insurance** | `docs/hrm/TECHSPEC.md` **§14.2–14.3** FR-CI-01/02 · UC-HRM-25 | [`docs/hrm/DB_DESIGN_HRM_CONTRACTS_INS.md`](../hrm/DB_DESIGN_HRM_CONTRACTS_INS.md) | [`docs/hrm/API_DESIGN_HRM_CONTRACTS_INS.md`](../hrm/API_DESIGN_HRM_CONTRACTS_INS.md) | [DB](./DB_DESIGN_HRM_CONTRACTS_INS.md) · [API](./API_DESIGN_HRM_CONTRACTS_INS.md) | **COMPLETE** F.1 · `SA-U71-HRM-CONTRACTS-INS-DESIGN-01` · evidence [`sa-u71-hrm-contracts-ins-design-01-20260727.md`](../qa/evidence/sa-u71-hrm-contracts-ins-design-01-20260727.md) |
| **XBOS catalog gov (publish / pull / approve)** | `docs/xbos/TECHSPEC.md` **§14.11–14.12** FR-CAT-02/05 | [`docs/xbos/DB_DESIGN_XBOS_CATALOG_GOV.md`](../xbos/DB_DESIGN_XBOS_CATALOG_GOV.md) | [`docs/xbos/API_DESIGN_XBOS_CATALOG_GOV.md`](../xbos/API_DESIGN_XBOS_CATALOG_GOV.md) | [DB](./DB_DESIGN_XBOS_CATALOG_GOV.md) · [API](./API_DESIGN_XBOS_CATALOG_GOV.md) | **COMPLETE** F.1 · `SA-U71-XBOS-CATALOG-GOV-DESIGN-01` · evidence [`sa-u71-xbos-catalog-gov-design-01-20260727.md`](../qa/evidence/sa-u71-xbos-catalog-gov-design-01-20260727.md) |
| **HRM recruitment (YCTD + Lane A stages)** | `docs/hrm/TECHSPEC.md` **§14.7** FR-RC-01 · §16.1 RC-03/05 · §17.6 · §18.2 REC-WF | [`docs/hrm/DB_DESIGN_HRM_RECRUITMENT.md`](../hrm/DB_DESIGN_HRM_RECRUITMENT.md) | [`docs/hrm/API_DESIGN_HRM_RECRUITMENT.md`](../hrm/API_DESIGN_HRM_RECRUITMENT.md) | [DB](./DB_DESIGN_HRM_RECRUITMENT.md) · [API](./API_DESIGN_HRM_RECRUITMENT.md) | **COMPLETE** F.1 · `SA-U71-HRM-RECRUITMENT-DESIGN-01` · evidence [`sa-u71-hrm-recruitment-design-01-20260727.md`](../qa/evidence/sa-u71-hrm-recruitment-design-01-20260727.md) |
| **XBOS workflow engine (def / instance / task)** | `docs/xbos/TECHSPEC.md` **§12.3 · §14.8–14.10** FR-WF-01/03/04 | [`docs/xbos/DB_DESIGN_XBOS_WORKFLOW.md`](../xbos/DB_DESIGN_XBOS_WORKFLOW.md) | [`docs/xbos/API_DESIGN_XBOS_WORKFLOW.md`](../xbos/API_DESIGN_XBOS_WORKFLOW.md) | [DB](./DB_DESIGN_XBOS_WORKFLOW.md) · [API](./API_DESIGN_XBOS_WORKFLOW.md) | **COMPLETE** F.1 · `SA-U71-XBOS-WORKFLOW-DESIGN-01` · evidence [`sa-u71-xbos-workflow-design-01-20260727.md`](../qa/evidence/sa-u71-xbos-workflow-design-01-20260727.md) |
| **HRM payroll (periods + payslips)** | `docs/hrm/TECHSPEC.md` **§14.6** FR-PR-05 · §16.1 PR-01/03/04 · INT-03 | [`docs/hrm/DB_DESIGN_HRM_PAYROLL.md`](../hrm/DB_DESIGN_HRM_PAYROLL.md) | [`docs/hrm/API_DESIGN_HRM_PAYROLL.md`](../hrm/API_DESIGN_HRM_PAYROLL.md) | [DB](./DB_DESIGN_HRM_PAYROLL.md) · [API](./API_DESIGN_HRM_PAYROLL.md) | **COMPLETE** F.1 · `SA-U71-HRM-PAYROLL-DESIGN-01` · evidence [`sa-u71-hrm-payroll-design-01-20260727.md`](../qa/evidence/sa-u71-hrm-payroll-design-01-20260727.md) |
| **XBOS RACI + position-rbac + CC catalogs** | `docs/xbos/TECHSPEC.md` **§14.14–14.16** FR-RACI-02 · FR-CC-P0-04/05 | [`docs/xbos/DB_DESIGN_XBOS_RACI_RBAC.md`](../xbos/DB_DESIGN_XBOS_RACI_RBAC.md) | [`docs/xbos/API_DESIGN_XBOS_RACI_RBAC.md`](../xbos/API_DESIGN_XBOS_RACI_RBAC.md) | [DB](./DB_DESIGN_XBOS_RACI_RBAC.md) · [API](./API_DESIGN_XBOS_RACI_RBAC.md) | **COMPLETE** F.1 · `SA-U71-XBOS-RACI-RBAC-CAT-DESIGN-01` · evidence [`sa-u71-xbos-raci-rbac-design-01-20260727.md`](../qa/evidence/sa-u71-xbos-raci-rbac-design-01-20260727.md) |
| **XBOS KPI rollup (actuals · alerts)** | `docs/xbos/TECHSPEC.md` **§12.2 · §14.17** FR-KPI-03 | [`docs/xbos/DB_DESIGN_XBOS_KPI.md`](../xbos/DB_DESIGN_XBOS_KPI.md) | [`docs/xbos/API_DESIGN_XBOS_KPI.md`](../xbos/API_DESIGN_XBOS_KPI.md) | [DB](./DB_DESIGN_XBOS_KPI.md) · [API](./API_DESIGN_XBOS_KPI.md) | **COMPLETE** F.1 · `SA-U71-XBOS-KPI-DESIGN-01` · evidence [`sa-u71-xbos-kpi-design-01-20260727.md`](../qa/evidence/sa-u71-xbos-kpi-design-01-20260727.md) |
| **XBOS Auth + tenant-scope + ECO scope** | `docs/xbos/TECHSPEC.md` **§14.1–14.3** FR-AUTH-01 · FR-TENANT-01 · FR-ECO-SCOPE-02 | [`docs/xbos/DB_DESIGN_XBOS_AUTH_TENANT.md`](../xbos/DB_DESIGN_XBOS_AUTH_TENANT.md) | [`docs/xbos/API_DESIGN_XBOS_AUTH_TENANT.md`](../xbos/API_DESIGN_XBOS_AUTH_TENANT.md) | [DB](./DB_DESIGN_XBOS_AUTH_TENANT.md) · [API](./API_DESIGN_XBOS_AUTH_TENANT.md) | **COMPLETE** F.1 · `SA-U71-XBOS-AUTH-TENANT-DESIGN-01` · evidence [`sa-u71-xbos-auth-tenant-design-01-20260727.md`](../qa/evidence/sa-u71-xbos-auth-tenant-design-01-20260727.md) |
| **HRM W2 P2 batch — Performance / Decisions / Metadata / Mobile** | `docs/hrm/TECHSPEC.md` **§16.1** PF-01 · **§16.2** MD-01 · **§16.3** MOB-* · **§16.5** FR-27 · `TECHSPEC_MOBILE.md` | [`docs/hrm/DB_DESIGN_HRM_W2_SLICE.md`](../hrm/DB_DESIGN_HRM_W2_SLICE.md) | [`docs/hrm/API_DESIGN_HRM_W2_SLICE.md`](../hrm/API_DESIGN_HRM_W2_SLICE.md) | [DB](./DB_DESIGN_HRM_W2_SLICE.md) · [API](./API_DESIGN_HRM_W2_SLICE.md) | **COMPLETE** F.1 · `SA-U71-HRM-W2-SLICE-DESIGN-01` · evidence [`sa-u71-hrm-w2-slice-design-01-20260727.md`](../qa/evidence/sa-u71-hrm-w2-slice-design-01-20260727.md) |
| **HRM Operations tasks + reports (OP-01..04)** | `docs/hrm/TECHSPEC.md` **§16.5** FR-HRM-OP-01..04 | [`docs/hrm/DB_DESIGN_HRM_OPERATIONS.md`](../hrm/DB_DESIGN_HRM_OPERATIONS.md) | [`docs/hrm/API_DESIGN_HRM_OPERATIONS.md`](../hrm/API_DESIGN_HRM_OPERATIONS.md) | [DB](./DB_DESIGN_HRM_OPERATIONS.md) · [API](./API_DESIGN_HRM_OPERATIONS.md) | **COMPLETE** F.1 · `SA-U71-HRM-OPERATIONS-DESIGN-01` · evidence [`sa-u71-hrm-operations-design-01-20260727.md`](../qa/evidence/sa-u71-hrm-operations-design-01-20260727.md) |
| **HRM Fleet vehicles list (FL-01)** | `docs/hrm/TECHSPEC.md` **§16.5** FR-HRM-FL-01 | [`docs/hrm/DB_DESIGN_HRM_FLEET.md`](../hrm/DB_DESIGN_HRM_FLEET.md) | [`docs/hrm/API_DESIGN_HRM_FLEET.md`](../hrm/API_DESIGN_HRM_FLEET.md) | [DB](./DB_DESIGN_HRM_FLEET.md) · [API](./API_DESIGN_HRM_FLEET.md) | **COMPLETE** F.1 · `SA-U71-HRM-FLEET-DESIGN-01` · evidence [`sa-u71-hrm-fleet-design-01-20260727.md`](../qa/evidence/sa-u71-hrm-fleet-design-01-20260727.md) |
| **HRM Admin invite/reset (FR-02..05)** | `docs/hrm/TECHSPEC.md` **§16.2** FR-HRM-02..05 | [`docs/hrm/DB_DESIGN_HRM_ADMIN.md`](../hrm/DB_DESIGN_HRM_ADMIN.md) | [`docs/hrm/API_DESIGN_HRM_ADMIN.md`](../hrm/API_DESIGN_HRM_ADMIN.md) | [DB](./DB_DESIGN_HRM_ADMIN.md) · [API](./API_DESIGN_HRM_ADMIN.md) | **COMPLETE** F.1 · `SA-U71-HRM-ADMIN-DESIGN-01` · evidence [`sa-u71-hrm-admin-design-01-20260727.md`](../qa/evidence/sa-u71-hrm-admin-design-01-20260727.md) |
| **HRM Import preview (IM-01 non-persist)** | `docs/hrm/TECHSPEC.md` **§16.2** FR-HRM-IM-01 | [`docs/hrm/DB_DESIGN_HRM_IMPORT_PREVIEW.md`](../hrm/DB_DESIGN_HRM_IMPORT_PREVIEW.md) (**N/A table**) | [`docs/hrm/API_DESIGN_HRM_IMPORT_PREVIEW.md`](../hrm/API_DESIGN_HRM_IMPORT_PREVIEW.md) | [DB](./DB_DESIGN_HRM_IMPORT_PREVIEW.md) · [API](./API_DESIGN_HRM_IMPORT_PREVIEW.md) | **COMPLETE** F.1 · `SA-U71-HRM-IMPORT-PREVIEW-DESIGN-01` · evidence [`sa-u71-hrm-import-preview-design-01-20260727.md`](../qa/evidence/sa-u71-hrm-import-preview-design-01-20260727.md) |
| **XBOS Infra settings (foundation scope key plane)** | UC-XBOS-INF-01..03 · CC-07 · wizard UX | As-built `xbos_infrastructure_settings` JSONB (no new DDL) | [`docs/xbos/API_DESIGN_XBOS_INFRASTRUCTURE.md`](../xbos/API_DESIGN_XBOS_INFRASTRUCTURE.md) | — | **COMPLETE** F.1 key-plane · `SA-XBOS-INF-SCOPE-KEY-PLANE-01` · ADR `ADR-XBOS-INF-APPLIES-TO-COMPANY-IDS-KEY-PLANE-20260727` · evidence [`sa-xbos-inf-scope-key-plane-01-20260727.md`](../qa/evidence/sa-xbos-inf-scope-key-plane-01-20260727.md) |

**Counts:** **22** COMPLETE F.1 pairs/slices (14 under `docs/hrm/` incl. IM-01 N/A-DB + **8** under `docs/xbos/` incl. Infra key-plane) · thin pointers under `docs/tech-spec/` (incl. Import preview).

### G-RULE-11 coverage note

| Aspect | Status |
|--------|--------|
| Path bootstrap (`docs/tech-spec/README.md` + pointers) | **CLOSED** · `SA-U71-PATH-CONVENTION-01` |
| U71 P0 physical spine (HRM industry/CO-HC/Settings/Leave + XBOS org-legal/SHR) | **COMPLETE** · this refresh `SA-U71-TECHSPEC-INDEX-REFRESH-01` |
| U71 P1 — attendance sheets | **COMPLETE** · `SA-U71-HRM-ATT-SHEET-DESIGN-01` |
| U71 P1 — contracts + insurance | **COMPLETE** · `SA-U71-HRM-CONTRACTS-INS-DESIGN-01` |
| U71 P1 — XBOS catalog governance | **COMPLETE** · `SA-U71-XBOS-CATALOG-GOV-DESIGN-01` |
| U71 P1 — recruitment requisitions + stages | **COMPLETE** · `SA-U71-HRM-RECRUITMENT-DESIGN-01` |
| U71 P1 — XBOS workflow engine | **COMPLETE** · `SA-U71-XBOS-WORKFLOW-DESIGN-01` |
| U71 P1 — payroll periods + payslips | **COMPLETE** · `SA-U71-HRM-PAYROLL-DESIGN-01` |
| U71 P1 — XBOS RACI + position-rbac + CC catalogs | **COMPLETE** · `SA-U71-XBOS-RACI-RBAC-CAT-DESIGN-01` |
| U71 P2 — XBOS KPI rollup | **COMPLETE** · `SA-U71-XBOS-KPI-DESIGN-01` |
| U71 P2 — XBOS Auth + tenant-scope | **COMPLETE** · `SA-U71-XBOS-AUTH-TENANT-DESIGN-01` |
| U71 P2 — HRM W2 Performance / Decisions / Metadata / Mobile | **COMPLETE** · `SA-U71-HRM-W2-SLICE-DESIGN-01` |
| U71 P2 — HRM Operations tasks + reports (OP-01..04) | **COMPLETE** · `SA-U71-HRM-OPERATIONS-DESIGN-01` |
| U71 P2 — HRM Fleet vehicles list (FL-01) | **COMPLETE** · `SA-U71-HRM-FLEET-DESIGN-01` |
| U71 P2 — HRM Admin invite/reset (FR-02..05) | **COMPLETE** · `SA-U71-HRM-ADMIN-DESIGN-01` |
| U71 P3 — HRM Import preview (IM-01 non-persist) | **COMPLETE** · `SA-U71-HRM-IMPORT-PREVIEW-DESIGN-01` |
| Residual | §3 backlog **empty** for listed U71 physical slices — **G-RULE-11 CLOSED** for scanned U71 F.1 (`TM-U71-PHYSICAL-BACKLOG-CLOSE-01`); OpenAPI/runtime deepen / G-DTO / G-IM-* = execution P2–P3 only — not missing F.1 path |

---

## 3. Backlog pointers (not yet physical)

**Rescan 2026-07-27 (`SA-U71-SPEC-GAP-SCAN-01`):** physical F.1 gap backlog **CLOSED / empty** — evidence [`sa-u71-spec-gap-scan-01-20260727.md`](../qa/evidence/sa-u71-spec-gap-scan-01-20260727.md) · index **22** COMPLETE pairs/slices (incl. Infra key-plane `SA-XBOS-INF-SCOPE-KEY-PLANE-01`) · no open U71 physical SA WI.

| Slice | Proposed paths | Severity | work_item_id |
|-------|----------------|----------|--------------|
| ~~HRM contracts + insurance~~ | ~~`docs/hrm/…`~~ | ~~P1~~ | **DONE** → §2 · `SA-U71-HRM-CONTRACTS-INS-DESIGN-01` |
| ~~XBOS catalog gov~~ | ~~`docs/xbos/…`~~ | ~~P1~~ | **DONE** → §2 · `SA-U71-XBOS-CATALOG-GOV-DESIGN-01` |
| ~~HRM recruitment requisitions~~ | ~~`docs/hrm/…`~~ | ~~P1~~ | **DONE** → §2 · `SA-U71-HRM-RECRUITMENT-DESIGN-01` |
| ~~XBOS workflow engine~~ | ~~`docs/xbos/…`~~ | ~~P1~~ | **DONE** → §2 · `SA-U71-XBOS-WORKFLOW-DESIGN-01` |
| ~~HRM payroll payslips/periods~~ | ~~`docs/hrm/…`~~ | ~~P1~~ | **DONE** → §2 · `SA-U71-HRM-PAYROLL-DESIGN-01` |
| ~~XBOS RACI + position-rbac + CC catalogs~~ | ~~`docs/xbos/…`~~ | ~~P1~~ | **DONE** → §2 · `SA-U71-XBOS-RACI-RBAC-CAT-DESIGN-01` |
| ~~XBOS KPI rollup~~ | ~~`docs/xbos/…`~~ | ~~P2~~ | **DONE** → §2 · `SA-U71-XBOS-KPI-DESIGN-01` |
| ~~XBOS Auth + tenant-scope~~ | ~~`docs/xbos/…`~~ | ~~P2~~ | **DONE** → §2 · `SA-U71-XBOS-AUTH-TENANT-DESIGN-01` |
| ~~HRM Performance / decisions / metadata / mobile~~ | ~~`docs/hrm/…` batch~~ | ~~P2~~ | **DONE** → §2 · `SA-U71-HRM-W2-SLICE-DESIGN-01` |
| ~~HRM Operations tasks + reports (OP-01..04)~~ | ~~`docs/hrm/…`~~ | ~~P2~~ | **DONE** → §2 · `SA-U71-HRM-OPERATIONS-DESIGN-01` |
| ~~HRM Fleet vehicles list (FL-01)~~ | ~~`docs/hrm/…`~~ | ~~P2~~ | **DONE** → §2 · `SA-U71-HRM-FLEET-DESIGN-01` |
| ~~HRM Admin invite/reset (FR-02..05)~~ | ~~`docs/hrm/…`~~ | ~~P2~~ | **DONE** → §2 · `SA-U71-HRM-ADMIN-DESIGN-01` |
| ~~HRM Import preview (IM-01 non-persist)~~ | ~~API_DESIGN + N/A DB note~~ | ~~P3~~ | **DONE** → §2 · `SA-U71-HRM-IMPORT-PREVIEW-DESIGN-01` |

When a new pair lands: **ADD** rows to §2; optionally ADD matching pointer files here.  
**§3 status (2026-07-27):** listed U71 scan backlog rows **closed** — no open physical-design pointer in this table · confirmed by `SA-U71-SPEC-GAP-SCAN-01` + `TM-U71-PHYSICAL-BACKLOG-CLOSE-01`.

---

## 4. Templates & related

| Artifact | Path |
|----------|------|
| DB table template | `_vibe-team-os/templates/TECHSPEC_PHYSICAL_DB_TABLE.md` |
| API contract template | `_vibe-team-os/templates/TECHSPEC_API_CONTRACT.md` |
| Dual-plane metric control | `docs/program/DATA_LINKAGE_BE_FE_QA_CONTROL.md` |
| Gap register | `docs/program/SPEC_CODE_TRACEABILITY_GAP_REGISTER.md` · **G-RULE-11** |

---

## 5. must_keep

- Canonical files under `docs/hrm/` and `docs/xbos/` remain SoT — pointers do not replace them.
- Plane A (LE UUID) ≠ Plane B (operating slug) — see DATA_LINKAGE + CO-HC pair + XBOS org-legal dual-plane cite.
- XBOS SoT for group catalogs — Settings pair cites ADR S1/S3.
- U65 zero-seed · no wipe of existing industry/CO-HC/Settings/Leave/att-sheet/employees/contracts-ins/recruitment/payroll/org-legal/SHR content.
- UF-XBOS-04/05 🟢 — shareholders pair locks runtime contract; do not invent `holder_type`.
- Attendance sheets: header create ≠ auto roster (AC-ATT-SHEET / G-DB-07); leave pair sibling must_keep.
- Catalog gov: Settings HRM pair = consumer must_keep; UF-XBOS-09/15 🟢 approve paths; empty inbox valid (U65).
- Workflow engine: physical column `graph` (wire payload/steps alias); catalog bridge `business_type=hrm_catalog_extension`; must_keep catalog-gov §6 + UF-XBOS-08/09/15 🟢; U65 zero-seed.
- RACI/RBAC/CC: UF-XBOS-07/13/14 🟢; WF `assignment_id` soft → `xbos_position_assignment`; CC autosave ≠ catalog-gov publish; OpenAPI RACI residual is execution-only.
- KPI: UF-XBOS-10 🟢; `xbos_kpi_actuals` TEXT slug; group rollup `holding`/`all`; empty `series` hợp lệ; evaluate ≠ persist actuals; must_keep RACI/WF/catalog-gov pairs; OpenAPI rollup DTO depth P2 residual.
- Auth/Tenant: UF-XBOS-01/11 🟢; JWT claims Plane B slug; select-membership G-OA-02 CLOSED; empty membership AUTH-403 / accessible `[]` hợp lệ; must_keep RACI/WF/catalog-gov/KPI pairs; G-SCOPE-01 on-touch residual.
- Contracts/INS: soft `employee_id` + TEXT slug; BR-CD-F5-01; G-CI-01 nullable `end_date`; U72 F-04/F-05/U-03 FE.
- Recruitment: Lane A `job_requisitions.headcount` SoT; `workflow_instance_id` LOCK; UF-HRM-12; cấm FR-RC bind postings/proposals (§17.6).
- Payroll: TEXT slug periods/payslips; hard `period_id` · soft `employee_id`; PR-05 empty trung thực; G-PR-03 process→slips residual; get-by-id non-blocking target.
- HRM W2 slice: Perf/Dec TEXT slug; Metadata UUID persist + slug→UUID map (G-MD-PLANE-01); Mobile JWT no session table; MOB-04/06/08 cite ATT/Leave — không duplicate; must_keep prior HRM+XBOS pairs; U65 empty decisions/cycles/queue.
- HRM Operations: `hrm_tasks` UUID persist + slug→UUID map (G-OP-PLANE-01); OP-04 aggregate cite ATT/Payroll/Recruitment + `service_requests` twin; G-OP-01/02 residual assignee/filters; must_keep W2/payroll/leave/ATT + XBOS Auth/RACI/WF/catalog-gov/KPI; U65 empty tasks/summary zeros.
- HRM Fleet: `hrm_fleet_vehicles` TEXT slug + `tenant_id`; UK plate scope; FL-01 GET list only (detail/search/upsert HTTP = residual); Settings `hrm_fleet_*` cite must_keep; must_keep OP/W2/payroll/leave/ATT + XBOS Auth/RACI/WF/catalog-gov/KPI; U65 empty vehicles.
- HRM Admin: `profiles` + `platform_admins` + `user_company_memberships` (UUID user_id · TEXT company_id); FR-02..05 POST F.1; cite XBOS Auth/Tenant JWT (do not wipe); G-ADM-01 audit · G-ADM-DTO-01 UUID DTO vs TEXT; must_keep Fleet/OP/W2/payroll/leave/ATT + Auth/RACI/WF/catalog-gov/KPI; U65 no seed admins.
- HRM Import preview (IM-01): **no physical table** — `POST …/spreadsheet/import/preview` → `SHEET-200` in-memory only; cấm invent staging; **G-IM-01 / SESSION / CATALOG CLOSED** BA-U71-IM-RESIDUAL-01 (`SRS_HRM_IM_01_RESIDUAL_TEAM.md` — commit/export OUT; mã phiên non-goal; catalog/DB-dup hard = IM-02); OpenAPI = G-IM-OPENAPI-01 execution; must_keep Admin/Fleet/OP/W2/Employees + Auth/RACI/WF/catalog-gov/KPI; U65 no seed.
