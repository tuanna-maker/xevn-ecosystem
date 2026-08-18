# BA-HRM-SETTINGS-MASTER-DATA-01 — Settings master data matrix

| Field | Value |
|-------|--------|
| **Date** | 2026-07-23 |
| **Role** | ba-data (governance) |
| **work_item_id** | `BA-HRM-SETTINGS-MASTER-DATA-01` |
| **lane** | governance — **cấm** `apps/**` · seed · deploy |
| **Program** | `docs/program/HRM_SRS_ORPHAN_SETTINGS_RECWF_PROGRAM.md` |
| **Orphan SoT** | `ORPHAN_BUSINESS_VS_SRS_SIMPLE.md` mục C #7–21 · register §4.1 G-ORPH-BE-01..15 |
| **Catalog SoT** | `docs/hrm/DANH_MUC_XBOS_CHO_HRM.md` · linkage §3 / §4.7 · TECHSPEC §14.8 |

---

## 1. Ownership rule (normative)

| Condition | HRM Settings behaviour | Consumer UI |
|-----------|------------------------|-------------|
| **XBOS = SoT tập đoàn** (DM §1–72 keys published) | **Sync-only** (`POST …/sync-from-xbos` / `catalog-sync/pull/:key`) + **optional company extension** via approval queue (`hrm_catalog_extension_*`) | Picker **select** từ `effectiveItems`; **filter + search** trên label/code; **cấm** free-text làm SoT |
| **Company-local master** (không có / không đủ trên XBOS) | **CRUD bắt buộc** trên Settings HRM (scoped `tenant_id+company_id`) | Cùng picker filter+search; create/edit/deactivate trong Settings |
| **Transactional data** (NV, đơn nghỉ, HĐ…) | **Không** Settings — module nghiệp vụ | Form bind FK / catalog key |

**BR-SET-MD-01:** Mọi field sponsor liệt kê dưới đây = **catalog-backed select**, không điền tay SoT.  
**BR-SET-MD-02:** Extension item công ty con không được đè mã XBOS đã publish (ADD-only merge — TECHSPEC §14.8).  
**BR-SET-MD-03:** Empty catalog sau sync = UI honest empty + badge «chưa đồng bộ» — không hardcode fallback list làm SoT (orphan #9/#13/#19).

---

## 2. Filter + search AC (áp dụng mọi row P0)

| AC-ID | Điều kiện | PASS | FAIL |
|-------|-----------|------|------|
| **AC-SET-FS-01** | Catalog có ≥1 `active` item | Dropdown/combobox chỉ load `effectiveItems` (XBOS+ext) | Free-text / hardcode FE array |
| **AC-SET-FS-02** | User gõ ≥1 ký tự trong picker | Filter client **hoặc** API search theo `label`/`code` (case-insensitive, `vi`) | Không search; phải scroll list dài |
| **AC-SET-FS-03** | User chọn item rồi Lưu | Persist **code/key** (không chỉ nhãn); F5 còn đúng | Persist free label lệch catalog |
| **AC-SET-FS-04** | Filter list screen theo catalog field | Query param / client filter = catalog key; đếm tab khớp | Filter theo hardcode enum lệch DB |
| **AC-SET-FS-05** | Catalog trống / key thiếu | Empty + CTA «Đồng bộ từ XBOS» hoặc «Thêm trong Cài đặt» | Silent mock options |

---

## 3. Ma trận master data (P0 trước — rồi P1)

### 3.1 P0 — sponsor priority

| Field UI (VI) | catalog_key / entity | SoT | Consumer screens | Filter+search AC | Hiện hardcode ở đâu | FR target |
|---------------|----------------------|-----|------------------|------------------|---------------------|-----------|
| **Chức danh NV** | `job_titles` (XBOS DM §7–10,60) + overlay `position` trong `hrm_employee_basic_fields` | **XBOS pull** + optional company extension; **không** seed file làm SoT production | Employees list/form; Import; Recruitment plan | AC-SET-FS-01..05; resolve `job_title_key` | `apps/api/hrm-api/src/settings-catalogs/tenant-position-catalog.ts` (`XE_TMDV`/`VISUN`/… `positionsByDept`) — **G-ORPH-BE-03** | **FR-HRM-SC-MD-01** (ADD) · bind FR-HRM-SC-01 / UC-HRM-06 |
| **Phòng ban** | `positions` / `departments` / org tree DM §3,8–9; FE keys `departments\|department_catalog\|org_departments` | **XBOS org** pull; company overlay CRUD Settings nếu thiếu nhánh local | Employees; Company tab Phòng ban; Attendance sheets; Rec plans | AC-SET-FS-*; cascading dept→position | `tenant-position-catalog.ts` `departments[]`; FE `hrmDepartmentCatalog.ts` multi-key fallback | **FR-HRM-SC-MD-02** |
| **Vị trí / JD tuyển dụng** | Entity `job_templates` (`/api/hrm/recruitment/job-templates`) + catalog `job_grades` / channels DM §37–42 | **Company-local CRUD** Settings hoặc menu TD «Thư viện JD» (per `company_id`); XBOS = kênh/trạng thái chuẩn | JobRequisitionsTab (bắt buộc `job_template_id`); Recruitment | AC-SET-FS-*; search title/code/position_name | API có CRUD; **SRS khách thiếu FR** (orphan B.4); DTO `create-job-template.dto.ts` free `title`/`position_name` | **FR-HRM-RC-JD-01** (ADD) · link F6 delta |
| **Loại nghỉ** | `leave_types` (DM §30) | **XBOS pull** + company extension (entitlement rules local) | LeaveTab; leave create; balance; Attendance overview chart | AC-SET-FS-*; filter list by type | FE `LeaveTab.tsx` `leaveTypeLabels`/`leaveTypeColors` hardcode 8 keys; BE `leave-balance.service.ts` default `annual`; `attendance-overview.service.ts` `LEAVE_TYPE_COLORS` — **G-ORPH-BE-04/13** | **FR-HRM-SC-MD-03** · UC-HRM-10 |
| **Loại quyết định** | `decision_types` (DM §28) — **SRS BR-DEC-04** | **XBOS pull** (group) + optional company types | Decisions tabs/filter/create | AC-SET-FS-*; tab counts = catalog | FE `Decisions.tsx` `getDecisionTypes` hardcode 8 keys; BE `decision_type` free TEXT default `appointment` — **G-ORPH-BE-07** | **FR-HRM-SC-MD-04** · FR-HRM-27 / UC-HRM-27 |
| **Thành phần lương** | `salary_components` + categories; XBOS `payroll_templates` / DM §32–34 (phụ cấp/khấu trừ) | **Hybrid:** loại/nature chuẩn **XBOS**; dòng thành phần **company CRUD** Settings/Payroll | SalaryComponentsTab; templates; payslip; F5 allowance_code | AC-SET-FS-*; filter by `component_type`/`nature` | BE `payroll-catalog.service.ts` default `component_type='Lương'`; FE SelectItem từ runtime list không lock enum — **G-ORPH-BE-06** | **FR-HRM-SC-MD-05** · payroll FR |
| **Fleet fields (du lịch)** | `hrm_fleet_*` (9 keys: driver/vehicle/registration/insurance/permit/road_fee/telecom/gps/finance) DM §46–54 | **XBOS-DM-HRM-13** publish → HRM pull; company `xe-du-lich` extension | Fleet vehicles; Settings fleet group | AC-SET-FS-* trên field defs; search BKS | `tourism-fleet-catalog.ts` `TOURISM_FLEET_CATALOGS` hardcode VI labels — **G-ORPH-BE-01** | **FR-HRM-FL-SCHEMA-01** (ADD) · FR-HRM-FL-01 |
| **Import Excel columns** | `hrm_employee_*_fields` (basic/personal/contact/emergency/address/insurance) + spreadsheet headers | **XBOS field groups** DM §15–20 + group import catalog; alias VI/EN trong Settings | Spreadsheet import/export; Settings field editor | AC-SET-FS-*; template columns = catalog codes; alias search | `group-employee-import-catalog.ts` VI labels + typo «thường chú»; `spreadsheet-kinds.ts` EN-only headers; aliases EN-only — **G-ORPH-BE-02/08** | **FR-HRM-IM-FIELDS-01** (ADD) · FR-HRM-IM-01 |

### 3.2 P1 — orphan C còn lại (Settings-relevant)

| Field UI | catalog_key / entity | SoT | Consumers | Hardcode path | FR target |
|----------|----------------------|-----|-----------|---------------|-----------|
| Salary band dashboard | config `salary_bands` (proposed) | **Company-local** Settings numeric bands | Employee summary / dashboard | `employees/employee-summary.ts` 15/20/30tr — G-ORPH-BE-05 | FR-HRM-SC-MD-06 |
| Interview status | `interview_statuses` (DM §41–42) | **XBOS pull** | Recruitment interviews | `update-interview-status.dto.ts` INTERVIEW_STATUSES — G-ORPH-BE-10 | FR-HRM-RC-IV-01 |
| Ops task priority/status | `operations_task_*` (DM §35–36) | **XBOS pull** | Operations tasks | `create-task.dto.ts` / status DTO — G-ORPH-BE-09 | FR-HRM-OP-ENUM-01 |
| Employment status / gender / … | select values in field catalogs DM §21–26 | **XBOS** | Profile / import | Partial in `GROUP_EMPLOYEE_IMPORT_CATALOGS` (`select:Nam\|Nữ\|Khác`) | FR-HRM-SC-MD-07 |
| Allowance codes (F5) | DM §33 loại phụ cấp | **XBOS pull** | Compensation package lines | `allowance_code` free string on create | FR-HRM-CI-ALLOW-01 |
| Compensation packages | `employee_compensation_packages` | **Company transactional** (+ allowance catalog) | Contracts / CI | Orphan B.5 — API exists, FR khách mỏng | FR-HRM-CI-PKG-01 (BA-P) |
| Catalog WF tenant gate | settings WF bridge | **Config table / ADR** — không hardcode tenant | Extension approval WF | `xbos-catalog-workflow.bridge.ts` — G-ORPH-BE-14 | FR-HRM-SC-WF-GATE-01 |
| Catalog extensions mutate | `hrm_catalog_extension_*` | Policy = XBOS approve; HRM request | Settings + CC | `catalog-extensions.service.ts` — G-ORPH-BE-15 | TechSpec G-DB-06 / annex FR |

### 3.3 Out of Settings (không CRUD catalog — ghi để tránh nhầm)

| Item | Why |
|------|-----|
| Scope slug / pilot UUID registry | ADR scope — không Settings master (G-ORPH-BE-12) |
| Mobile hub limits 5/50 | Product NFR / FR-MOB section — không catalog (G-ORPH-BE-11) |
| Leave-workflow / REC-WF bridges | Process SoT XBOS — SA wave `SA-HRM-SETTINGS-REC-WF-01` |

---

## 4. SoT conflict register (ownership gaps → BA-P / SA)

| Gap-ID | Conflict | Recommendation |
|--------|----------|----------------|
| **GAP-MD-01** | DANH_MUC: chức danh/phòng = XBOS; code: `tenant-position-catalog` hardcode seed | **XBOS SoT**; deprecate seed path cho UAT evidence; Settings = sync + extension |
| **GAP-MD-02** | SRS BR-DEC-04 → `decision_types`; FE hardcode 8 types; BE free TEXT | Lock catalog key `decision_types`; DTO `@IsIn` from synced items |
| **GAP-MD-03** | `leave_types` XBOS key tồn tại; FE/BE palette + default `annual` | Chart colors từ catalog metadata optional; type list = sync only |
| **GAP-MD-04** | Job templates CRUD company-local **không** FR khách | ADD FR-HRM-RC-JD-01 + Settings/TD library UX filter |
| **GAP-MD-05** | Import: 6 domain field catalogs VI ≠ spreadsheet 5 EN headers | One field matrix SoT; alias VI+EN in Settings; template = catalog codes |
| **GAP-MD-06** | Fleet schema only in TS seed file | Promote to XBOS catalog publish OR FR schema table |
| **GAP-MD-07** | Payroll `component_type` default `'Lương'` vs FE `fixed/variable/formula` labels elsewhere | Enum SoT in Settings; align nature/value_type |
| **GAP-MD-08** | Settings UI upsert = free `code`/`label` Input (UF-HRM-10) | Remaster: pick catalog_key + searchable items; free-text chỉ khi extension request |

---

## 5. Validation / error expectations (for Dev later — no code this wave)

| VAL-ID | Condition | Expected |
|--------|-----------|----------|
| VAL-SET-MD-01 | Create employee `job_title_key` ∉ synced `job_titles` | **400** catalog miss (or soft badge per G-FID-06 — SA pick fail-closed) |
| VAL-SET-MD-02 | Create leave `leave_type` ∉ `leave_types` | **400** `HRM-ATT-LEAVE-TYPE` |
| VAL-SET-MD-03 | Create decision `decision_type` ∉ `decision_types` | **400** `HRM-DEC-TYPE` |
| VAL-SET-MD-04 | Requisition without `job_template_id` | **400** (keep G-RC-01 / JD required) |
| VAL-SET-MD-05 | Allowance line without `allowance_code` in catalog | **400** (keep BR-CD-F5-03) |
| VAL-SET-MD-06 | Import header unknown + no alias | **SHEET-422** field; template download lists VI+EN aliases |

**scope_parity (U19):** list catalog overview + get items by key must use same `(tenant_id, company_id)` resolver as employees list; group CEO `main` rollup must not 404 company-scoped catalog that list showed.

---

## 6. Traceability (requirement → API → DB → FE → test)

| Spec | API | DB | FE | Test / journey |
|------|-----|----|----|----------------|
| UC-HRM-06 / FR-HRM-SC-01 | `GET/POST …/settings-catalogs`, `sync-from-xbos`, `catalog-sync/pull/:key` | `synced_catalogs`, `hrm_catalog_extension_*` | `SettingsCatalogsTab`, `useSettingsCatalogsOverview` | UF-HRM-10 · AC-FID-10 ≥8 keys |
| DM §7–10 job titles | pull `job_titles` | synced payload | EmployeeForm / import | J-HRM-02 |
| DM §30 leave | pull `leave_types` | synced + leave_requests.leave_type | LeaveTab | UF-HRM leave · J-HRM attendance |
| DM §28 decisions | pull `decision_types` | `hr_decisions.decision_type` | Decisions.tsx | UC-HRM-27 · AC-DEC-* |
| DM §46–54 fleet | `hrm_fleet_*` | fleet_fields / vehicles | Fleet menu | HRM-FL-01 |
| FR-HRM-IM-01 | spreadsheet import | employees + field catalogs | Spreadsheet UI | HRM-IM-* |
| F6 JD library | `…/recruitment/job-templates` | job_templates | JobRequisitionsTab | UF-HRM-12 · J-HRM-05 |

---

## 7. Risks & mitigation

| Risk | Mitigation |
|------|------------|
| Dual SoT (seed file + XBOS) → picker lệch giữa company | SA ADR: single write path; seed only bootstrap-dev (U65) |
| FE hardcode enums survive after catalog sync | BA-P AC cấm hardcode; QA grep + browser AC-SET-FS-01 |
| Extension free-text becomes shadow SoT | Extension queue + XBOS approve; Settings search only approved items |
| Import Excel VI typo / EN-only aliases | Field matrix FR + alias table in Settings |

---

## 8. Residual (governance)

| # | Residual | Owner |
|---|----------|-------|
| R1 | SRS/TechSpec chưa có FR-HRM-SC-MD-* / RC-JD / FL-SCHEMA / IM-FIELDS | **ba-process** `BA-HRM-ORPHAN-TO-SRS-01` |
| R2 | ADR Settings SoT vs XBOS pull vs company CRUD; deprecate seed registries | **sa** `SA-HRM-SETTINGS-REC-WF-01` |
| R3 | Execution remaster picker filter+search + DTO `@IsIn` | Dev **sau** Sponsor + FR confirm — **không** wave này |

---

## 9. Handoff

- **ack_status:** `PASS_TO_PM`
- **next_owner:** `pm` → `ba-process` (+ `sa` parallel ownership ADR)
- **evidence_path:** `docs/qa/evidence/ba-hrm-settings-master-data-01-20260723.md`
- **cấm:** seed · deploy · claim Phase1/PROD

### next_dispatch_prompt (copy-ready)

```text
work_item_id: BA-HRM-ORPHAN-TO-SRS-01
role: ba-process
lane: governance
entry: đọc docs/qa/evidence/ba-hrm-settings-master-data-01-20260723.md §3–§4 + ORPHAN mục C #7–21
exit:
  1) ADD-only SRS team (+ khách stub): FR-HRM-SC-MD-01..05, FR-HRM-RC-JD-01, FR-HRM-FL-SCHEMA-01, FR-HRM-IM-FIELDS-01
  2) Mỗi FR: Purpose + AC filter/search (AC-SET-FS-01..05) + BR-SET-MD-01..03 + Diễn biến Settings CRUD/sync
  3) Khóa ownership: XBOS SoT → sync+extension; company-local → CRUD Settings
  4) Evidence docs/qa/evidence/ba-hrm-orphan-to-srs-01-YYYYMMDD.md
  5) PASS_TO_PM; cấm apps/** seed deploy
parallel SA: SA-HRM-SETTINGS-REC-WF-01 — ADR TechSpec Settings SoT vs XBOS pull; map GAP-MD-01..08; REC-WF per company
```

---

## completion_report

**Closed:** Ma trận Field UI ↔ catalog_key ↔ SoT ↔ consumers ↔ filter AC ↔ hardcode paths ↔ FR targets cho P0 (chức danh, phòng ban, JD/templates, loại nghỉ, loại QSĐ, thành phần lương, fleet, import Excel) + P1 orphan Settings-related; ownership rule XBOS vs company-local; VAL/trace/gap register.

**Open:** SRS FR text (BA-P); ADR SoT (SA); Dev remaster (blocked until FR+Sponsor).

---

## Appendix A — FR SoT rename (2026-07-23 · BA-HRM-SETTINGS-FR-ALIGN-01)

> **Supersede primary FR IDs** for Dev/QA handoff. Full STT + catalog_key matrix:  
> `docs/qa/evidence/ba-hrm-settings-fr-align-01-20260723.md`

| §3 FR target (this file) | **FR SoT mới** |
|--------------------------|----------------|
| FR-HRM-SC-MD-01 | **FR-HRM-SC-POS-01** |
| FR-HRM-SC-MD-02 | **FR-HRM-SC-POS-01** (cùng FR — phòng ban) |
| FR-HRM-SC-MD-03 | **FR-HRM-SC-LEAVE-01** |
| FR-HRM-SC-MD-04 | **FR-HRM-SC-DEC-01** |
| FR-HRM-SC-MD-05 | **FR-HRM-SC-PAY-01** |
| FR-HRM-RC-JD-01 | **FR-HRM-SC-JT-01** |
| FR-HRM-FL-SCHEMA-01 | **FR-HRM-FL-02** |
| FR-HRM-IM-FIELDS-01 | **FR-HRM-IM-02** (+ IM-03) |
| FR-HRM-SC-MD-06 | **FR-HRM-20-BAND-01** (không SC-PAY) |

BR-HRM-MD-01 · AC-HRM-PICKER-01 · AC-SET-FS-01..05 · SA S1/S3 ownership **không đổi**.
