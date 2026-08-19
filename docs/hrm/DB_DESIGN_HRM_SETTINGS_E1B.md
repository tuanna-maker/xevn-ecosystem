# DB_DESIGN — HRM Settings E1-B (expand MD buckets + DEC alias)

| Field | Value |
|-------|--------|
| **work_item_id** | `BA-ERP-E1B-DB-API-01` |
| **cohort** | `E1-B` · alias `SETTINGS-UI-EXPAND` · U71 |
| **change_mode** | ADD · preserve_default · **no migration apply** |
| **extends** | `docs/hrm/DB_DESIGN_HRM_SETTINGS_CATALOG.md` (L0/L1/L2a tables **reuse**) |
| **ref_srs** | `SRS_HRM_KHACH_DELTA_CAI_DAT_20260723.md` **FR-HRM-SC-01** · **FR-HRM-SC-POS-01** · **FR-HRM-SC-LEAVE-01** · **FR-HRM-SC-DEC-01** · **FR-HRM-SC-PAY-01** · UC-HRM-06..08 · UC-HRM-27 |
| **ref_techspec** | `docs/hrm/TECHSPEC.md` §11.4 · §14.8 · §16.2 · §18.1 |
| **ref_adr** | `ADR-HRM-SETTINGS-SOT-REC-WF-COMPANY-20260723` **S1/S3** |
| **ref_xbos** | `DANH_MUC_XBOS_CHO_HRM.md` §3 STT 7–10 · §5 STT 27–34 · §6 STT 37–42 |
| **ref_api** | `docs/hrm/API_DESIGN_HRM_SETTINGS_E1B.md` |
| **ref_program** | `FIDELITY_PROGRAM_DISPATCH.md` Cohort 2 E1-B · `ba-hrm-erp-settings-consumer-01` · `qa-hrm-erp-fidelity-spot-01` |
| **Date** | 2026-07-28 |

> **Invariant (must_keep):** Same L0→L1→L2a ownership as base Settings catalog design. XBOS = SoT group master. **No new physical tables** for E1-B — only **key registry + alias map + Settings UI bucket contract** over existing `synced_catalogs` / `hrm_catalog_extension_*` / XBOS `config_catalog*`.

---

## 1. Problem (data plane)

| Fact | Evidence |
|------|----------|
| Settings MD UI = **4** buckets only | `MasterDataSettingsPanel` · consumer matrix |
| Live XBOS/HRM key for loại QSĐ = **`hr_decision_types`** | QA spot: 3 items; FE `decision_types` **MISS** |
| FE/BE constants still use `decision_types` | `HRM_MASTER_DATA_CATALOG_KEYS` · `HRM_SC_DEC_KEY` |
| ≥6 ERP families pullable but **no MD UI** | `contract_types`, `shifts`, `job_grades`, `recruitment_channels`, `employment_types`, `pay_types` / `salary_components` |

---

## 2. Ownership layers (unchanged)

Reuse `DB_DESIGN_HRM_SETTINGS_CATALOG.md` §1:

```text
L0 XBOS config_catalogs(+items)
  → L1 synced_catalogs.payload
  → L2a hrm_catalog_extension_items
  → effectiveItems (merge)
```

E1-B **does not** invent HRM-only SoT tables for the new buckets.

---

## 3. Canonical `catalog_key` registry — E1-B Settings MD surface (≥10 buckets)

Keys: TEXT, `normalize = trim().toLowerCase()`, pattern `^[a-z0-9_][a-z0-9_-]{1,62}$`.

### 3.1 Bucket matrix (normative for FE tabs + BE master-key allow-list)

| # | Bucket UI label (VI · U72) | Canonical `catalog_key` (FR / write preferred) | Runtime aliases (same logical family) | DANH_MUC | `ref_srs` | E1-B status |
|---|----------------------------|-----------------------------------------------|----------------------------------------|----------|-----------|-------------|
| 1 | Chức danh | **`job_titles`** | `positions`, `employee_positions` | §3 STT 7–8,10 · §10 STT 60 | FR-HRM-SC-POS-01 | Keep (UI YES) |
| 2 | Phòng ban | **`departments`** | `department_catalog`, `org_departments` | §3 STT 9 · §2 STT 3 | FR-HRM-SC-POS-01 | Keep |
| 3 | Loại nghỉ | **`leave_types`** | — | §5 STT 30 | FR-HRM-SC-LEAVE-01 | Keep |
| 4 | Loại quyết định | **`decision_types`** (FR canonical) | **`hr_decision_types`** (**live storage / pull SoT**) | §5 STT 28 | FR-HRM-SC-DEC-01 | **Alias fix P0** |
| 5 | Loại hợp đồng | **`contract_types`** | — | §5 STT 27 | FR-HRM-SC-01 + CI consumers | **Expand** |
| 6 | Hình thức LĐ | **`employment_types`** | `employment_type` | Related §4.1 STT 21 (distinct codes; see §5) | FR-HRM-SC-01 · P0-EMP-TYPE | **Expand** |
| 7 | Ca làm việc | **`shifts`** | — | §5 STT 31 | FR-HRM-SC-01 · P1-SHIFTS note | **Expand** |
| 8 | Bậc / grade | **`job_grades`** | `grades` | §6 STT 37–42 family | FR-HRM-SC-JT-01 related | **Expand** |
| 9 | Nguồn ứng viên | **`recruitment_channels`** | `candidate_sources` | §6 STT 39 | FR-HRM-SC-01 · P0-REC-CHANNEL | **Expand** |
| 10 | Tính chất lương | **`pay_types`** | `component_types`, `pay_natures` | §5 STT 32–34 (nature axis) | FR-HRM-SC-PAY-01 (nhóm tính chất) | **Expand** |
| 11 | Thành phần lương (catalog) | **`salary_components`** | `payroll_components` | §5 STT 33–34 | FR-HRM-SC-PAY-01 | **Expand** (optional 11th; hybrid with TX table) |

**DoD E1-B:** MD panel renders **≥10** of rows #1–#11 (rows 1–10 minimum; #11 strongly recommended).

### 3.2 DEC alias lock (`decision_types` ↔ `hr_decision_types`)

| Rule ID | Condition | Expected |
|---------|-----------|----------|
| **VAL-E1B-DEC-01** | Overview / GET items / picker / assert for family DEC | Resolve **union** of keys `{decision_types, hr_decision_types}` → one logical catalog |
| **VAL-E1B-DEC-02** | XBOS live SoT key = `hr_decision_types` and `decision_types` empty | FE bucket **must** show items from `hr_decision_types` (not MISS → hardcode) |
| **VAL-E1B-DEC-03** | Settings write (POST/PATCH extension) | Prefer **storage key** = `hr_decision_types` when L1 row exists under that key; else write canonical `decision_types` and document dual-read |
| **VAL-E1B-DEC-04** | Consumer `decision_type` code | Assert against **merged effectiveItems** of alias family (not single literal key) |
| **VAL-E1B-DEC-05** | Same `code` on both keys | Merge dedupe by `code`; prefer L1 XBOS origin; label conflict → keep XBOS label (same as base merge) |

**Logical family id (runtime):** `dec_types` (internal only — **not** a DB column; not exposed as raw key to UI).

```text
effectiveItems(DEC) =
  merge(
    synced_catalogs where catalog_key IN ('decision_types','hr_decision_types'),
    hrm_catalog_extension_items where catalog_key IN (...same...)
  )
```

### 3.3 Other alias families (E1-B)

| Family id | Canonical | Aliases | Notes |
|-----------|-----------|---------|-------|
| `pos_titles` | `job_titles` | `positions`, `employee_positions` | Already in base design |
| `org_depts` | `departments` | `department_catalog`, `org_departments` | Already in base |
| `pay_nature` | `pay_types` | `component_types`, `pay_natures` | Replaces FE HARDCODE `componentTypes` list (E1-A/E2 may bind consumers) |
| `pay_comp` | `salary_components` | `payroll_components` | Catalog dictionary; company TX `salary_components` **table** remains hybrid (must_keep module CRUD) |
| `emp_class` | `employment_types` | `employment_type` | Codes: normalize `full_time` (underscore); forbid dual `full-time` SoT |
| `rec_channel` | `recruitment_channels` | `candidate_sources` | Candidate `source` SoT |
| `grade` | `job_grades` | `grades` | Recruitment/JD |

---

## 4. Physical tables — reuse only (no DDL this WI)

| Table | E1-B change |
|-------|-------------|
| `config_catalogs` / `config_catalog_items` | Publish new/alias keys on XBOS when missing (`hr_decision_types` already live) |
| `synced_catalogs` | Rows appear after pull; **UNIQUE (tenant_id, company_id, catalog_key)** unchanged — two keys for DEC may coexist until XBOS consolidates |
| `hrm_catalog_extension_items` | Extension rows use **resolved storage key** (§3.2) |
| `hrm_catalog_extension_requests` / `*_removal_requests` | Same; `catalog_key` stores storage key |
| `sync_audit_logs` | Log actual pulled key string |

**Cấm migration apply** in this WI: no ALTER TABLE, no rename of live `hr_decision_types` → `decision_types` without XBOS governance wave.

---

## 5. Semantic notes (data quality)

### 5.1 `employment_types` vs STT 21

| Key | Meaning | Sample codes |
|-----|---------|--------------|
| **`employment_types`** | Hình thức / class (full-time, part-time, contractor…) | `full_time`, `part_time`, `contractor` |
| STT 21 labor status (field unit / future key) | Trạng thái LĐ (đang làm, thử việc…) | Separate — **out of E1-B MD minimum** unless already published |

Do **not** overload STT 21 as employment class SoT.

### 5.2 `shifts` vs `work_shifts` table

| Store | Role |
|-------|------|
| Catalog **`shifts`** | XBOS dictionary of shift **codes** for Settings MD + future picker |
| Table **`work_shifts`** | Company TX schedule CRUD (Attendance module) |

E1-B opens Settings bucket for **`shifts`**. Binding Attendance TX to catalog codes = **P1-SHIFTS-SOT** (SA) — residual, not blocked for UI expand.

### 5.3 `pay_types` vs `salary_components`

| Key | Role |
|-----|------|
| **`pay_types`** | Nature / nhóm tính chất (Lương, Phụ cấp, Khấu trừ, Chấm công…) — kills FE HARDCODE list |
| **`salary_components`** | Component **codes** dictionary (optional Settings bucket #11); company may still CRUD TX rows in Payroll module |

---

## 6. Consumer soft refs (E1-B surface — assert ownership later E1-A)

| Consumer field | Catalog family | Soft rule |
|----------------|----------------|-----------|
| `hr_decisions.decision_type` / decisions DTO | DEC (`hr_decision_types`∪`decision_types`) | ∈ effective active |
| Contracts `contract_type` | `contract_types` | ∈ effective |
| Employee / requisition `employment_type` | `employment_types` | ∈ effective; one spelling |
| Candidate `source` | `recruitment_channels` | ∈ effective |
| Payroll `component_type` | `pay_types` | ∈ effective |
| Attendance / roster shift code (future) | `shifts` | ∈ effective after SA bind |

E1-B DB/API design **enables** Settings CRUD+sync; consumer picker rewiring remains E1-A / domain cohorts (must_keep OK paths).

> **DOC-DELTA 2026-07-28 (`BA-ERP-E2-DB-API-01`):** Consumer assert for Payroll `component_type` → `pay_types` and Contracts `contract_type` → `contract_types` is **normative** in `DB_DESIGN_HRM_ERP_E2.md` / `API_DESIGN_HRM_ERP_E2.md` (error codes `HRM-PAY-TYPE-KEY` / `HRM-CON-TYPE-KEY`).

---

## 7. Validation matrix (DB / key plane)

| VAL-ID | Condition | Expected result |
|--------|-----------|-----------------|
| VAL-E1B-KEY-01 | Unknown key outside registry + aliases | `HRM-SET-001` / reject mutate |
| VAL-E1B-KEY-02 | Duplicate `(tenant, company, catalog_key, code)` on extension | 409 conflict |
| VAL-E1B-KEY-03 | Pull writes `hr_decision_types` | Row in `synced_catalogs`; FE DEC bucket non-MISS |
| VAL-E1B-KEY-04 | Extension write under alias | Stored under resolved storage key; readable via any alias |
| VAL-E1B-KEY-05 | Empty L1 for new bucket | Honest empty — **no** mock items (FR-HRM-SC-01) |
| VAL-E1B-KEY-06 | `employment_types` codes | Canonical underscore form; reject invent free-text |
| VAL-E1B-SCOPE-01 | List vs get-by-key same company partition | `scope_parity` with `resolveHrmSettingsCatalogCompanyId` |

---

## 8. Acceptance (DB plane E1-B)

| Check | PASS |
|-------|------|
| No new tables required for E1-B | Schema unchanged |
| Alias map documented for DEC + §3.3 | This file |
| ≥10 bucket keys listed with FR/DANH_MUC | §3.1 |
| `hr_decision_types` treated as live storage alias of FR `decision_types` | §3.2 |
| Migration **not** applied | Explicit |

---

## 9. Out of scope / residual

| Item | Owner |
|------|-------|
| FE MasterDataSettingsPanel tab expand | `dev-fe` E1-B |
| BE `hrm-settings-master-keys` + merge alias helper | `dev-be` E1-B |
| XBOS rename live key → FR-only `decision_types` | XBOS governance (optional later) |
| Attendance `work_shifts` ↔ `shifts` ownership ADR | SA P1-SHIFTS |
| Consumer FREE_TEXT position pickers | E1-A (not E1-B) |
| Apply migration / seed | **Forbidden** this WI |
| E3 catalog consumers `insurers` / `kpi_library` | Soft assert ownership → `DB_DESIGN_HRM_ERP_E3.md` §2.4–2.5 · Settings MD bucket UI optional residual |

---

## 10. must_keep / forbidden

| must_keep | forbidden |
|-----------|-----------|
| L0/L1/L2a table model | New HRM SoT tables for dictionaries |
| Live data under `hr_decision_types` | Dropping/renaming without XBOS WF |
| Soft code refs | Free-text SoT on Settings mutate |
| Honest empty | Fake catalog rows for UAT / U65 seed |
| Base Settings design | Overwriting POS/LEAVE OK paths |
