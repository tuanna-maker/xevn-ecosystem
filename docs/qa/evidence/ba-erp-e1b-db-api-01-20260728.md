# BA-ERP-E1B-DB-API-01 — DB_DESIGN + API_DESIGN Settings E1-B

| Field | Value |
|-------|--------|
| **work_item_id** | `BA-ERP-E1B-DB-API-01` |
| **from_role** | pm |
| **to_role** | ba-data |
| **lane** | governance G1 E1-B — U71 · **no** `apps/**` · **no** migration apply |
| **date** | 2026-07-28 |
| **ack_status** | **PASS_TO_PM** |
| **program** | `FIDELITY_PROGRAM_DISPATCH.md` Cohort 2 E1-B · `SETTINGS-UI-EXPAND` |

---

## 1. read_first ack

| # | Artifact | Result |
|---|----------|--------|
| 1 | `docs/program/FIDELITY_PROGRAM_DISPATCH.md` E1-B | Expand 4→10+ buckets; alias `decision_types`↔`hr_decision_types`; sync E2E |
| 2 | `docs/hrm/DB_DESIGN_HRM_SETTINGS_CATALOG.md` | L0/L1/L2a tables reuse — no new DDL |
| 3 | `docs/hrm/API_DESIGN_HRM_SETTINGS_CATALOG.md` | Endpoints A–H baseline; F already pull-all |
| 4 | Prior matrix / spot | 4 UI buckets; live DEC = `hr_decision_types`; FE MISS |

---

## 2. Deliverables

| Artifact | Path | Status |
|----------|------|--------|
| DB_DESIGN E1-B | `docs/hrm/DB_DESIGN_HRM_SETTINGS_E1B.md` | **ADD** |
| API_DESIGN E1-B | `docs/hrm/API_DESIGN_HRM_SETTINGS_E1B.md` | **ADD** |
| Pointer APPEND | Base DB_DESIGN + API_DESIGN «E1-B APPEND» headers | **APPEND** |
| Knowledge merge | `HRM_ERP_FIDELITY_KNOWLEDGE_MERGE.md` | **APPEND** (this wave) |

---

## 3. Design decisions (summary)

### 3.1 Bucket registry (≥10)

| # | VI label | Canonical key | Aliases |
|---|----------|---------------|---------|
| 1–4 | Chức danh / Phòng ban / Loại nghỉ / Loại QSĐ | `job_titles` · `departments` · `leave_types` · `decision_types` | POS/DEPT aliases; DEC + **`hr_decision_types`** |
| 5–10 | HĐ / Hình thức LĐ / Ca / Grade / Kênh TD / Tính chất lương | `contract_types` · `employment_types` · `shifts` · `job_grades` · `recruitment_channels` · `pay_types` | see DB_DESIGN §3 |
| 11 (rec.) | Thành phần lương catalog | `salary_components` | `payroll_components` |

### 3.2 DEC alias (P0)

- FR canonical: `decision_types` (FR-HRM-SC-DEC-01).
- Live storage/pull: **`hr_decision_types`**.
- Merge/assert/GET must use **family** union — VAL-E1B-DEC-01..05.
- **No** migration rename of live key in this WI.

### 3.3 Sync gap

| Question | Verdict |
|----------|---------|
| New sync endpoint? | **No** — `POST /api/hrm/settings-catalogs/sync-from-xbos` pulls all remote keys |
| Behavior gap? | **Yes** — alias-aware pull/get/items/assert; FE ≥10 tabs; writeKey → storageKey |

### 3.4 API F.1

Every E1-B endpoint section (A′–G′) has **Mục đích · Nghiệp vụ · Bước SRS** (+ DTO↔DB / errors). Checklist in API_DESIGN §12.

---

## 4. Exit criteria check

| # | Criterion | Result |
|---|-----------|--------|
| 1 | DB_DESIGN + API_DESIGN E1-B (or APPEND headers) with F.1 | **PASS** |
| 2 | Evidence this file | **PASS** |
| 3 | APPEND merge; PASS_TO_PM; next SA then Dev-FE/BE | **PASS** (handoff below) |
| 4 | No apps/** · no migration apply | **PASS** |

---

## 5. Residuals (not closed here)

| Residual | Next owner |
|----------|------------|
| SA review alias storageKey + shifts vs work_shifts note | `sa` |
| FE MasterDataSettingsPanel ≥10 + DEC keys include `hr_decision_types` | `dev-fe` |
| BE `resolveCatalogFamily` + master-keys expand + assert family | `dev-be` |
| Consumer FREE_TEXT position / HARDCODE bind | E1-A (out of E1-B UI expand) |
| XBOS L0 publish empty families | XBOS / devops — not HRM invent |

---

## 6. Handoff packet

```yaml
work_item_id: BA-ERP-E1B-DB-API-01
from_role: ba-data
to_role: pm
ack_status: PASS_TO_PM
entry_criteria: U71 DB+API E1-B before Dev apps/**
exit_criteria: designs + evidence + merge APPEND
evidence_path: docs/qa/evidence/ba-erp-e1b-db-api-01-20260728.md
completion_report: |
  Closed: DB_DESIGN_HRM_SETTINGS_E1B + API_DESIGN_HRM_SETTINGS_E1B (F.1);
  DEC alias hr_decision_types; ≥10 bucket registry; sync gap = behavior not new URL;
  APPEND pointers on base Settings catalog designs.
  Residual: SA sign-off then Dev-FE/BE implement; no migration.
next_owner: sa
next_dispatch_prompt: |
  work_item_id: SA-ERP-E1B-DESIGN-REVIEW-01
  from_role: pm
  to_role: sa
  lane: governance G1 E1-B — U71
  read_first:
    - docs/hrm/DB_DESIGN_HRM_SETTINGS_E1B.md
    - docs/hrm/API_DESIGN_HRM_SETTINGS_E1B.md
    - docs/qa/evidence/ba-erp-e1b-db-api-01-20260728.md
  exit_criteria:
    - Confirm alias storageKey policy for DEC (prefer hr_decision_types) + no DDL
    - Confirm shifts catalog vs work_shifts residual stays P1 (not block E1-B UI)
    - Sign-off → PM dispatch D-FE-ERP-E1B-MD-PANEL-01 + D-BE-ERP-E1B-ALIAS-KEYS-01
  cấm: apps/** code; migration apply; seed
```

---

## 7. Copy-ready Dev prompts (after SA)

### Dev-FE

```text
work_item_id: D-FE-ERP-E1B-MD-PANEL-01
to_role: dev-fe
read_first: docs/hrm/DB_DESIGN_HRM_SETTINGS_E1B.md §3 · API_DESIGN_HRM_SETTINGS_E1B.md §10 · MasterDataSettingsPanel.tsx · catalogSearchPicker.ts
exit_criteria: ≥10 MD buckets; decisionTypes.keys includes hr_decision_types+decision_types; writeKey DEC = storage resolve; U72 VI labels; CRUD+search per bucket; no hardcode fallback as SoT; CODE-MEMORY APPEND; unit/smoke
cấm: seed U65; overwrite E1-A consumer pickers out of scope
```

### Dev-BE

```text
work_item_id: D-BE-ERP-E1B-ALIAS-KEYS-01
to_role: dev-be
read_first: docs/hrm/API_DESIGN_HRM_SETTINGS_E1B.md §0–§7 · DB_DESIGN_HRM_SETTINGS_E1B.md §3.2 · hrm-settings-master-keys.ts · settings-catalogs.service.ts
exit_criteria: resolveCatalogFamily; GET items/overview/assert DEC family merge; pull/{key} alias try-list; expand master allow-list for E1-B keys; jest covers hr_decision_types via decision_types; CODE-MEMORY APPEND
cấm: migration rename; invent L0 in HRM; seed
```
