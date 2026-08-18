# BA-HRM-MD-CATALOG-TRACE-01 — Master-data catalog bind trace

| Field | Value |
|-------|--------|
| **work_item_id** | `BA-HRM-MD-CATALOG-TRACE-01` |
| **from_role** | pm |
| **to_role** | ba-data |
| **lane** | governance G0 — docs only · no `apps/**` · no migrate · no seed |
| **program** | `P-HRM-MD-PICKER-01` |
| **date** | 2026-07-28 |
| **ack_status** | **PASS_TO_PM** |
| **ref** | `HRM_MASTER_DATA_PICKER_GAP_PROGRAM.md` · `DB_DESIGN_HRM_SETTINGS_CATALOG.md` · `API_DESIGN_HRM_SETTINGS_CATALOG.md` · `DANH_MUC_XBOS_CHO_HRM.md` · `HRM_MENU_DATA_LINKAGE_MATRIX.md` §3 · `DB_DESIGN_HRM_EMPLOYEES.md` |

---

## 1. Spec says / Code does (P0 sponsor symptom)

| Layer | Spec | Runtime (as-of 2026-07-28) |
|-------|------|----------------------------|
| Master picker | BR-HRM-MD-01 · AC-HRM-PICKER-01 — chức danh/vị trí = Settings effective codes; consumer = Select/combo; **cấm free-text SoT** | `EmployeeWorkHistory.tsx` L990–994: `<Input value={formData.position} />` |
| Persist key | Soft code → Settings `job_titles` / `positions` (`DB_DESIGN` §10) | `employee_work_timeline.position` **TEXT** free-text; **no** `position_key` / `job_title_key` column |
| Employee master | `employees.job_title_key` soft → catalog + `assertJobTitleKeyInCatalog` | OK on create/update (`employees.service`) |
| Dept on work history | Picker code only | Select **exists** but `SelectItem value={dept.name}` → stores **label**, not catalog `code` |

**Verdict:** Settings SoT + XBOS pull path **exist**. Gap = **orphan consumer bind** on work-history Vị trí (+ dept code semantics) — not missing catalog product idea.

---

## 2. Ownership pipeline (normative)

```text
L0 XBOS config_catalogs / config_catalog_items (publish)
  → POST /api/hrm/settings-catalogs/sync-from-xbos | POST /catalog-sync/pull/{key}
L1 synced_catalogs.payload.items[]
  + L2a hrm_catalog_extension_items
  → mergeEffective → GET /settings-catalogs[/{key}/items]
  → Settings UI + consumer pickers
```

Canonical keys (`hrm-settings-master-keys.ts` / DB_DESIGN §2.1):

| Family | Canonical | Aliases | FR |
|--------|-----------|---------|-----|
| Chức danh / vị trí | `job_titles` | `positions`, `employee_positions` (FE) | FR-HRM-SC-POS-01 |
| Phòng ban | `departments` | `department_catalog`, `org_departments` | FR-HRM-SC-POS-01 |
| Loại nghỉ | `leave_types` | — | FR-HRM-SC-LEAVE-01 |
| Loại quyết định | `decision_types` | — | FR-HRM-SC-DEC-01 |
| Lương | `salary_components` | `payroll_components` (FE) · `payroll_templates` | FR-HRM-SC-PAY-01 |

DANH_MUC STT: 7–10 (chức danh/phòng/vị trí) · 28 (QĐ) · 30 (nghỉ) · 33–34 (phụ cấp/khấu trừ) · XBOS-DM-HRM-07/10 publish→pull.

---

## 3. Trace matrix — catalog_key → XBOS → HRM → FE bind

**Bind status:** `OK` = Select/combo persists **code** + BE assert (when mutate) · `PARTIAL` = UI Select but wrong value (label) or display-only · `MISSING` = no catalog picker · `FREE_TEXT` = Input / invent SoT · `HARDCODE` = fixed enum not from Settings.

| catalog_key | XBOS SoT (DANH_MUC) | HRM table / API | FE consumer | Bind status |
|-------------|---------------------|-----------------|-------------|-------------|
| `job_titles` (+ `positions`) | STT 7–8, 10, 60 · publish `job_titles` | L1 `synced_catalogs` · L2a extension · `GET …/settings-catalogs` · items · sync-from-xbos · pull | **Settings** `MasterDataSettingsPanel` bucket positions (`writeKey: job_titles`) | **OK** |
| same | same | `employees.job_title_key` + `assertJobTitleKeyInCatalog` → `HRM-EMP-JOB-TITLE` | **EmployeeFormDialog** CatalogSearchPicker `position` → `useEmployeeMutations` maps → `job_title_key` | **OK** |
| same | same | same column | **EmployeeProfile** header / resume — `resolveJobTitleDisplayLabel` / `jobTitleOptionsFromCatalog` (display) | **OK** (display) |
| same | same | recruitment JD | **JobTemplatesTab** CatalogSearchPicker `position_code` | **OK** |
| same | same | — | **EmployeeWorkHistory** form **Vị trí** | **FREE_TEXT** (P0) |
| same | same | `employee_work_timeline.position` TEXT | API profile insert/update allowlist includes `position` (no catalog assert) | **FREE_TEXT** / **MISSING** key col |
| same | same | attendance sheet header `positions` TEXT | **Attendance** sheet dialog — options from `employees.map(e => e.position)` not catalog | **FREE_TEXT** / derived |
| `departments` (+ aliases) | STT 3, 9 · XBOS-DM-HRM-06 | L1+L2a · settings-catalogs | **MasterDataSettingsPanel** departments | **OK** |
| same | same | soft ref `custom_fields.department` | **EmployeeFormDialog** CatalogSearchPicker (code) | **OK** |
| same | same | — | **JobRequisitionsTab** dept picker | **OK** |
| same | same | `useDepartments` ← `listDepartmentsFromSettingsCatalog` | **EmployeeWorkHistory** dept Select | **PARTIAL** — value=`dept.name` (label), not `code` |
| same | same | contracts / advance / att filters | Contracts, AdvanceRequestsTab, Attendance dept filters | **PARTIAL** — often `dept.name` as filter value |
| `leave_types` | STT 30 | L1+L2a · `leave_requests.leave_type` + `assertCodeInEffectiveCatalog` | **LeaveTab** CatalogSearchPicker · Settings leaveTypes | **OK** |
| `decision_types` | STT 28 | `hr_decisions.decision_type` + assert | **Decisions.tsx** CatalogSearchPicker · Settings decisionTypes | **OK** |
| `salary_components` / `payroll_templates` | STT 32–34 | payroll CRUD tables + optional synced catalog | **SalaryComponentsTab** — CRUD company components; `component_type` from hook `componentTypes` enum | **HARDCODE** / **MISSING** Settings picker for type nature (GAP-MD-07) |
| `positions` alias alone | STT 10 overlay | treated as family of `job_titles` in merge/picker | FE `HRM_MASTER_DATA_CATALOG_KEYS.positions` includes both | **OK** (alias) when items exist under either key |
| Field catalogs `hrm_employee_*_fields` | STT 15–20 | settings overview | Dynamic profile / import templates | **OK** (out of P0 picker) — cite only |

**scope_parity (U19):** Settings list/get-by-key share `resolveHrmSettingsCatalogCompanyId` / sync scope (`main`→holding). Consumer deep links: J-* Settings + Employee profile workHistory — list overview empty must not invent codes (API_DESIGN §9–10). No new Plane A LE UUID join — codes only.

---

## 4. Gap list — `work_history.position` vs `position_key` / `job_title_key`

| ID | Gap | Spec | Code / DB | Severity | Suggested WI (post-sponsor E1) |
|----|-----|------|-----------|----------|--------------------------------|
| **GAP-WH-POS-01** | Work History **Vị trí** free-text Input | AC-HRM-PICKER-01 · FR-HRM-SC-POS-01 #5 | `EmployeeWorkHistory.tsx` Input `formData.position` | **P0** | `D-FE-HRM-WH-POSITION-PICKER-01` |
| **GAP-WH-POS-02** | No durable catalog key on timeline row | Soft code persist (DB_DESIGN §10) | `employee_work_timeline.position` TEXT only — **no** `position_key` / `job_title_key` | **P0** data | `D-BE-HRM-WH-POSITION-KEY-01` (+ DB_DESIGN/API_DESIGN delta G1 if column ADD) |
| **GAP-WH-POS-03** | BE does not assert timeline position ∈ effective catalog | VAL-SET-MD / BR-HRM-MD-01 | `employee-profile.service` allowlist `position` without `assertCodeInEffectiveCatalog` | **P0** | same BE WI |
| **GAP-WH-DEPT-01** | Dept Select stores **name** not **code** | Persist code only (API_DESIGN §10) | `SelectItem value={dept.name}` | **P1** | fold into FE WH picker WI |
| **GAP-WH-KEY-04** | Naming drift: form `position` vs employee `job_title_key` vs alias catalog `positions` | Canonical persist = catalog `code`; prefer `position_key` **or** reuse `job_title_key` semantics on timeline | Three names collide in docs/FE | **P1** governance | G1 BA/SA delta — pick one wire field (`position_key` recommended for timeline to avoid clashing employee column name) |
| **GAP-ATT-POS-01** | Sheet filter “vị trí” from employee display strings | Should filter by catalog codes | Attendance sheet Select from unique `e.position` | **P2** | after WH/employee bind stable |
| **GAP-PAY-TYPE-01** | `component_type` hardcoded enum vs `salary_components` catalog | FR-HRM-SC-PAY-01 · GAP-MD-07 | `useSalaryComponents.componentTypes` | **P2** | separate PAY picker wave |

**Must_keep for E1:** Do **not** rewrite Settings merge / XBOS L0; do **not** treat seed `tenant-position-catalog` as U65 evidence; preserve EmployeeFormDialog CatalogSearchPicker already **OK**.

**Recommended physical delta (G1, before Dev):**

1. ADD `employee_work_timeline.position_key TEXT NULL` (or rename semantics) — soft ref to `job_titles`/`positions` code.  
2. Keep `position` as optional denormalized **label snapshot** for history display (U72) — **not** SoT.  
3. API create/update work-timeline: require `position_key` ∈ effectiveItems; reject free-text-only.  
4. FE: CatalogSearchPicker options = `jobTitleOptionsFromCatalog`; value=code; label display.

---

## 5. Validation / error expectations (for QA after E1)

| Condition | Rule | Expected |
|-----------|------|----------|
| WH create with empty position_key | required | 400 / FE validation |
| WH create with unknown code | assert catalog | 400 + message free-text SoT forbidden |
| WH create with active catalog code | soft ref | 2xx; F5 row shows **label**; Network body has code |
| Settings empty catalog | honest empty | picker CTA → Cài đặt; no invent |
| Dept on WH | value=code | list filter/search by code; label via catalog |

---

## 6. Traceability (requirement → API → DB → FE → test)

| BR / FR / AC | API | DB | FE | Test / journey |
|--------------|-----|----|----|----------------|
| BR-HRM-MD-01 · AC-HRM-PICKER-01 | GET settings-catalogs/{key}/items | synced + extension | WH Select (future) | UF workHistory + Settings · J-* profile career |
| FR-HRM-SC-POS-01 | sync-from-xbos · items CRUD | job_titles / departments | MasterDataSettingsPanel | UF-HRM-10 · AC-FID-10 |
| FR-EM-01 job title | employees CRUD | `employees.job_title_key` | EmployeeFormDialog | H-EMP / E-EMP-catalog |
| FR-HRM-SC-LEAVE-01 | leave create assert | `leave_requests.leave_type` | LeaveTab | UF leave |
| FR-HRM-SC-DEC-01 | decisions create assert | `hr_decisions.decision_type` | Decisions | AC-DEC-* |
| FR-HRM-SC-PAY-01 | payroll components | salary component rows + optional catalog | SalaryComponentsTab | GAP-PAY-TYPE-01 open |

---

## 7. Data quality risks

| Risk | Mitigation |
|------|------------|
| Historical WH rows free-text only | Migration optional map label→code best-effort; UI show raw as label until mapped; new rows require key |
| Dual keys `job_titles` vs `positions` both non-empty | FE `findCatalogRowByKeys` first-match — SA confirm publish canonical `job_titles` |
| Dept name stored → rename breaks history | Persist code (GAP-WH-DEPT-01) |
| U65 seed temptation for empty catalog | BLOCKED-DATA + Settings sync/extension from FE — never seed in evidence |

---

## 8. Residuals (not closed this WI)

- Full XBOS control live UI audit → `SA-XBOS-HRM-CONTROL-GAP-01` (parallel).  
- FE field inventory completeness → `BA-HRM-MD-PICKER-INVENTORY-01`.  
- Peer Claude independent scan → merge via `SYNTH-HRM-MD-PICKER-01`.  
- No Dev dispatch until U74 sponsor chốt E1.

---

## Handoff

- **completion_report:** Catalog pipe L0→L1→L2a→API traced; P0 matrix shows Settings/EmployeeForm/Leave/Decisions/JD **OK**; Work History position **FREE_TEXT** + missing `position_key`; dept WH **PARTIAL** (name); pay type **HARDCODE**. Evidence + knowledge merge APPEND done. No apps/**.
- **next_owner:** pm
- **ack_status:** PASS_TO_PM
- **evidence_path:** `docs/qa/evidence/ba-hrm-md-catalog-trace-01-20260728.md`
