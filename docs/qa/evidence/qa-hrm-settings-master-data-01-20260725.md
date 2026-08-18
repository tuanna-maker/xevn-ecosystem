# QA-HRM-SETTINGS-MASTER-DATA-01 — Settings master-data P0 gap audit

| Field | Value |
|-------|--------|
| **Date** | 2026-07-25 |
| **Role** | qa |
| **work_item_id** | `QA-HRM-SETTINGS-MASTER-DATA-01` |
| **BA SoT** | `docs/qa/evidence/ba-hrm-settings-master-data-01-20260723.md` |
| **Program** | `docs/program/HRM_SRS_ORPHAN_SETTINGS_RECWF_PROGRAM.md` |
| **Orphan** | `docs/program/ORPHAN_BUSINESS_VS_SRS_SIMPLE.md` mục C |
| **Env** | local — attempted L0 `qc:dev-stack` |
| **U65** | zero-seed · **HOLD_DEPLOY** · **NOT** Phase1/PROD |
| **Overall verdict** | **FAIL** (P0 residuals) + **BLOCKED** live browser/API |

---

## 0. Environment / L0

| Check | Result | Note |
|-------|--------|------|
| `pnpm run qc:dev-stack` | **FAIL** | hrm `:28001` down · portal `:5173/:5175` down · xbos `:28002` **200** |
| `pnpm run dev:hrm-api` | **COMPILE FAIL** | Nest watch: **3× TS** — `employees.service.ts:125-126` uses `scopeContext?.memberTenantId` / `masterTenantPartition` on type `HrmListScopeContext` (only `{ tenantId? }` in `hrm-list-scope.ts`); `operating-units.service.ts:58` QueryFn generics mismatch |
| Portal browser | **BLOCKED** | No FE host; no Network screenshot possible |
| Unit (no seed) | **PASS** | `apps/web/hrm` vitest: `catalogSearchPicker.test.ts` (6) + `hrmDepartmentCatalog.test.ts` (6) = **12/12** |

**Implication:** AC rows below are **code/static + unit** evidence. Live FE-after-2xx / F5 / Network **not executed** → cannot promote UF 🟢. Re-open browser wave after `D-HRM-SETTINGS-MD-COMPILE-BE-01`.

---

## 1. Focus P0 matrix — field × AC-SET-FS-01..05

Legend: **PASS** = code+unit meet AC · **FAIL** = violates BA AC / BR-SET-MD · **BLOCKED** = needs live stack · **PARTIAL** = meets when catalog populated; fails empty / dual SoT.

### 1.1 Chức danh NV (`job_titles` · FR-HRM-SC-POS-01)

| AC | Verdict | Evidence (file / note) |
|----|---------|------------------------|
| **AC-SET-FS-01** | **PARTIAL** | Consumer: `EmployeeFormDialog.tsx` → `toCatalogPickerOptions(job_titles\|positions\|…)` + `CatalogSearchPicker`. BE: `EmployeesService.assertJobTitleKeyInCatalog` → `assertCodeInEffectiveCatalog`. **Residual:** BE seed registry `tenant-position-catalog.ts` `positionsByDept` still live (**G-ORPH-BE-03**); `POST …/seed/tenant-position-catalog*` still on controller. |
| **AC-SET-FS-02** | **PASS** (unit) | `filterCatalogPickerOptions` + `CatalogSearchPicker` `CommandInput` «Tìm theo mã hoặc tên…»; vitest 6/6. **Live BLOCKED.** |
| **AC-SET-FS-03** | **PARTIAL** | Picker persists `option.value` (= catalog **code**). Submit maps `position` field — confirm live bind `job_title_key` vs free `position` string **BLOCKED**. BE validates `job_title_key` when set. |
| **AC-SET-FS-04** | **BLOCKED** | Employees list filter by title — not exercised (no portal). |
| **AC-SET-FS-05** | **PASS** (code) | Empty picker → amber «Chưa có mục… mở Cài đặt…» (`CatalogSearchPicker.tsx` L114–126). Settings: `MasterDataSettingsPanel` emptyLabel + **Đồng bộ XBOS** + extension form. |
| **Field rollup** | **FAIL** | Dual SoT: Settings/XBOS path + **G-ORPH-BE-03** hardcode seed registry still callable. Live UF **BLOCKED**. |

### 1.2 Phòng ban (`departments` · FR-HRM-SC-POS-01)

| AC | Verdict | Evidence |
|----|---------|----------|
| **AC-SET-FS-01** | **FAIL** | Settings bucket `departments` writes `writeKey: 'departments'`. Consumer: if catalog empty, `EmployeeFormDialog` **falls back** to `departments` prop **name as value+label** (L435–445) — not XBOS `effectiveItems` SoT (BR-SET-MD-01 / orphan #9). `hrmDepartmentCatalog.ts` multi-key + `/departments` coalesce still dual-path. |
| **AC-SET-FS-02** | **PASS** (unit) | Same `CatalogSearchPicker` search. |
| **AC-SET-FS-03** | **FAIL** | Fallback path persists **display name**, not catalog **code**. |
| **AC-SET-FS-04** | **BLOCKED** | Attendance / company tab filter not live. |
| **AC-SET-FS-05** | **PARTIAL** | Catalog empty on picker → honest empty CTA **if** no departments prop; with prop → silent name list (mock-like). Settings empty CTA **PASS** code. |
| **Field rollup** | **FAIL** | Name fallback + **G-ORPH-BE-03** `departments[]` in tenant registry. |

### 1.3 Vị trí / JD templates (`job_templates` · FR-HRM-SC-JT-01)

| AC | Verdict | Evidence |
|----|---------|----------|
| **AC-SET-FS-01** | **PARTIAL** | Settings tab **jt** = deep-link only → `/recruitment` Thư viện JD (`MasterDataSettingsPanel` L343–350). CRUD: `JobTemplatesTab` + `useJobTemplates`. Position field: `CatalogSearchPicker` from `job_titles` when dialog open. |
| **AC-SET-FS-02** | **PASS** (code/unit) | Picker search on position; template list has client filter in tab (code). Live **BLOCKED**. |
| **AC-SET-FS-03** | **FAIL** | BE `CreateJobTemplateDto`: `title` / `position_name` free `@IsString` — **no** `@IsIn` catalog; `position_code` optional only. Free-text SoT still API-legal (GAP-MD-04 residual). |
| **AC-SET-FS-04** | **BLOCKED** | Requisition filter by template — no live. |
| **AC-SET-FS-05** | **PARTIAL** | Empty position options → CatalogSearchPicker empty CTA. No Settings-inline CRUD (by design pointer). |
| **Field rollup** | **FAIL** | BE DTO free-text; live CRUD/F5 **BLOCKED**. |

### 1.4 Loại nghỉ (`leave_types` · FR-HRM-SC-LEAVE-01)

| AC | Verdict | Evidence |
|----|---------|----------|
| **AC-SET-FS-01** | **FAIL** | When catalog has items → `toCatalogPickerOptions(leave_types)` **OK**. When empty → **bootstrap** 8 keys from `leaveTypeLabels` (`LeaveTab.tsx` L208–228) — **silent mock options** = **FAIL AC-SET-FS-05 / BR-SET-MD-03**. |
| **AC-SET-FS-02** | **PASS** (code/unit) | CatalogSearchPicker on create form. |
| **AC-SET-FS-03** | **PARTIAL** | BE `leave-requests.service` asserts `leave_type ∈ leave_types` via `assertCodeInEffectiveCatalog` (**VAL-SET-MD-02** / `HRM-ATT-LEAVE-TYPE`). FE bootstrap can offer codes that **fail BE** if catalog empty → UX trap. Display still maps via hardcode `leaveTypeLabels` / `leaveTypeColors`. |
| **AC-SET-FS-04** | **BLOCKED** | List filter by type — no live. |
| **AC-SET-FS-05** | **FAIL** | Bootstrap discrete list ≠ honest empty + CTA. Settings panel empty CTA **PASS**; consumer **FAIL**. |
| **Field rollup** | **FAIL** | FE hardcode + BE `LEAVE_TYPE_COLORS` (**G-ORPH-BE-04/13**) + balance default `annual`. |

---

## 2. Summary table (sponsor P0)

| Field UI | catalog / entity | AC-01 | AC-02 | AC-03 | AC-04 | AC-05 | Field verdict | Top owner |
|----------|------------------|-------|-------|-------|-------|-------|---------------|-----------|
| Chức danh | `job_titles` | PARTIAL | PASSᵘ | PARTIAL | BLOCKED | PASSᶜ | **FAIL** | **dev-be** G-ORPH-BE-03 + compile |
| Phòng ban | `departments` | **FAIL** | PASSᵘ | **FAIL** | BLOCKED | PARTIAL | **FAIL** | **dev-fe** name fallback |
| JD / job templates | `job_templates` | PARTIAL | PASSᶜ | **FAIL** | BLOCKED | PARTIAL | **FAIL** | **dev-be** DTO |
| Loại nghỉ | `leave_types` | **FAIL** | PASSᶜ | PARTIAL | BLOCKED | **FAIL** | **FAIL** | **dev-fe** LeaveTab bootstrap |

ᵘ = unit only · ᶜ = code/static only · live browser/API = **BLOCKED** for all rows.

**P0 all-PASS?** **No** → next_owner **pm** (not qc).

---

## 3. Hardcode residuals still live (G-ORPH-BE-*)

| ID | Status 2026-07-25 | Path / symptom |
|----|-------------------|----------------|
| **G-ORPH-BE-01** | **LIVE** | `tourism-fleet-catalog.ts` `TOURISM_FLEET_CATALOGS`; wired in `settings-catalogs.service.ts` |
| **G-ORPH-BE-02 / 08** | **LIVE** | `group-employee-import-catalog.ts`; `spreadsheet-kinds` / template headers EN |
| **G-ORPH-BE-03** | **CLOSED** (2026-07-25) | Retest `qa-hrm-settings-md-pos-seed-01-20260725.md`: POST seed → **403** `HRM-CAT-POS-SEED-FORBIDDEN` without allow env; runtime SoT = XBOS/Settings picker. Registry bootstrap-only. |
| **G-ORPH-BE-04 / 13** | **LIVE** | FE `LeaveTab` `leaveTypeLabels`/`leaveTypeColors` + bootstrap; BE `attendance-overview.service.ts` `LEAVE_TYPE_COLORS`; `leave-balance.service.ts` default `'annual'` |
| **G-ORPH-BE-05** | **LIVE** (P1) | salary band hardcode (not P0 focus) |
| **G-ORPH-BE-06** | **LIVE** | `payroll-catalog.service.ts` `component_type` DEFAULT / `?? 'Lương'` |
| **G-ORPH-BE-07** | **LIVE** | `Decisions.tsx` `getDecisionTypes` 8 keys + catalog-empty fallback (adjacent to P0) |
| **G-ORPH-BE-09 / 10** | **LIVE** | ops task enums; `INTERVIEW_STATUSES` in DTO |
| **G-ORPH-BE-11 / 12** | N/A Settings | mobile hub / scope registry — out of this wave |
| **G-ORPH-BE-14 / 15** | not re-probed | WF gate / extension mutate — defer SA/Dev after compile |

**Positive progress (not closed):** Settings `MasterDataSettingsPanel` CRUD+sync UX; shared `CatalogSearchPicker`; BE `assertCodeInEffectiveCatalog` on leave / job_title / decisions path — **insufficient** while FE bootstrap + seed registries remain.

---

## 4. Adjacent compile blocker (blocks all browser UF)

| Defect | Owner | Detail |
|--------|-------|--------|
| **hrm-api TS compile** | **dev-be** | `HrmListScopeContext` ≠ `HrmListScope` — `employees.service.ts` assertJobTitle uses wrong type fields; `operating-units.service.ts` QueryFn assignability. Exit: `nest start` listens `:28001` + `qc:dev-stack` green. |

---

## 5. What was NOT done (explicit)

- No `pnpm seed:*` / inbox seed / DB fake.
- No mutate via API-only claim PASS.
- No screenshots (portal down).
- No Phase1 / PROD claim.
- No `apps/**` edits (QA only).

---

## 6. Handoff

- **ack_status:** `PASS_TO_PM`
- **next_owner:** `pm`
- **evidence_path:** `docs/qa/evidence/qa-hrm-settings-master-data-01-20260725.md`
- **residual_auto_fix:** true

### completion_report

**Closed:** P0 field×AC-SET-FS matrix for chức danh / phòng ban / JD / loại nghỉ against BA SoT; G-ORPH-BE live register; L0 blocker documented; FE unit 12/12 for picker libs.

**Open:** Live browser UF (U65) **BLOCKED** on hrm compile; 4/4 P0 fields **FAIL** or residual FAIL; Dev wave required before QA retest / QC.

### next_dispatch_prompt (copy-ready — top FAIL owners)

```text
work_item_id: D-HRM-SETTINGS-MD-COMPILE-BE-01
role: dev-be
priority: P0
entry: hrm-api nest watch FAIL — employees.service.ts uses memberTenantId/masterTenantPartition on HrmListScopeContext (only tenantId); operating-units QueryFn mismatch; evidence docs/qa/evidence/qa-hrm-settings-master-data-01-20260725.md §0+§4
exit: nest listens :28001; qc:dev-stack PASS for hrm; jest/spec for assertJobTitleKeyInCatalog still green; READY_FOR_QA; cấm seed; HOLD_DEPLOY
evidence_path: docs/qa/evidence/be-hrm-settings-md-compile-01-YYYYMMDD.md

--- parallel after compile green ---

work_item_id: D-HRM-SETTINGS-MD-LEAVE-FE-01
role: dev-fe
priority: P0
entry: LeaveTab.tsx leaveTypeLabels/Colors + empty-catalog bootstrap 8 keys = FAIL AC-SET-FS-01/05 BR-SET-MD-03 (QA-HRM-SETTINGS-MASTER-DATA-01)
exit: empty leave_types → honest empty + CTA Settings/sync only (no bootstrap mock); labels/colors from catalog metadata or neutral fallback; unit/regression; READY_FOR_QA; cấm seed
evidence_path: docs/qa/evidence/fe-hrm-settings-md-leave-01-YYYYMMDD.md

work_item_id: D-HRM-SETTINGS-MD-DEPT-FE-01
role: dev-fe
priority: P0
entry: EmployeeFormDialog department fallback to departments prop name-as-code FAIL AC-SET-FS-01/03
exit: only effectiveItems departments|department_catalog|org_departments; empty → CatalogSearchPicker empty CTA; no name SoT; READY_FOR_QA
evidence_path: docs/qa/evidence/fe-hrm-settings-md-dept-01-YYYYMMDD.md

work_item_id: D-HRM-SETTINGS-MD-POS-SEED-BE-01
role: dev-be
priority: P0
entry: G-ORPH-BE-03 tenant-position-catalog.ts + POST seed/tenant-position-catalog* still SoT path (GAP-MD-01)
exit: deprecate/disable seed endpoints for UAT path OR document bootstrap-dev-only behind explicit flag; runtime SoT = XBOS pull + extension only; READY_FOR_QA; cấm using seed in QA evidence
evidence_path: docs/qa/evidence/be-hrm-settings-md-pos-seed-01-YYYYMMDD.md

work_item_id: D-HRM-SETTINGS-MD-JT-BE-01
role: dev-be
priority: P1
entry: CreateJobTemplateDto title/position_name free string — FAIL AC-SET-FS-03; prefer position_code ∈ job_titles
exit: validate position_code via assertCodeInEffectiveCatalog when set; reject free-text SoT per BR-HRM-MD-01; READY_FOR_QA
evidence_path: docs/qa/evidence/be-hrm-settings-md-jt-01-YYYYMMDD.md

work_item_id: QA-HRM-SETTINGS-MASTER-DATA-02
role: qa
priority: after Dev READY_FOR_QA
entry: L0 PASS; U65 browser-only; retest AC-SET-FS-01..05 on Settings master-data + Employees/Leave/Recruitment consumers; ceo@xe.vn
exit: evidence with Network notes + FE after 2xx + F5; matrix update; PASS_TO_PM only if all P0 PASS else FAIL with owners
```

---

## 7. Trace

| Artifact | Used |
|----------|------|
| BA matrix §2–3 P0 | Yes |
| FR align POS/LEAVE/JT | Yes |
| Unit catalogSearchPicker / hrmDepartmentCatalog | 12/12 PASS |
| Browser UF / J-* live | **Not run** (L0 BLOCKED) |
