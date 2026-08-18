# FE-SPEC-ORPHAN-CODE-SAMPLE-01 — HRM / web-portal FE orphan inventory

| Field | Value |
|-------|--------|
| **work_item_id** | `FE-SPEC-ORPHAN-CODE-SAMPLE-01` |
| **date** | 2026-07-22 (ICT) |
| **from_role** | dev-fe |
| **to_role** | pm |
| **lane** | research / inventory — **no product code change**; **CẤM deploy** |
| **ack_status** | **PASS_TO_PM** |
| **register** | `docs/program/SPEC_CODE_TRACEABILITY_GAP_REGISTER.md` §4 (appended) |
| **parent** | `SPEC-CODE-TRACEABILITY-AUDIT-20260722` |
| **related** | `BA-HRM-EMP-COMPANY-COL-01` · AC-EMP-COL-01..07 |

---

## 1. Scope & method

**In scope:** `apps/web/hrm` embed list/filter surfaces + `apps/web/web-portal` pages CODE-MEMORY coverage (spot).

**Method:**

1. Read BA SoT for company column: `docs/qa/evidence/ba-hrm-emp-company-col-01-20260722.md`.
2. Trace FE resolve path: `Employees.tsx` → `resolveOperatingUnitDisplayName` → `operatingUnitLabelMap` ← `GET /api/hrm/operating-units`.
3. Trace OU filter UI: `HrmOperatingUnitFilter.tsx` copy + option labels.
4. Diff vs SRS khách: FR-HRM-21 (list), FR-HRM-SCOPE-03 (filter ĐVTV), glossary «Đơn vị».
5. Scan `@CODE-MEMORY` on `apps/web/hrm/src/pages` + `web-portal/src/pages`.

**Out of scope:** Deploy, BE registry fix, theme remaster, seed.

---

## 2. Anchor samples (P0) — Employees company column + OU filter

### 2.1 Column «Thông tin công ty» (`Employees.tsx`)

| Item | Finding |
|------|---------|
| **UI header** | `t('company.title')` → vi «**Thông tin công ty**» (`i18n/locales/vi.json` ~L1671) |
| **Cell bind** | `getCompanyName(emp.company_id)` → **`resolveOperatingUnitDisplayName(companyId, operatingUnitLabelMap)` first**, then membership `company.name`, else `—` |
| **Label source** | `HrmOperatingUnitFilterContext.operatingUnitLabelMap` from live `GET /api/hrm/operating-units` (`display_name_vi`) |
| **Observed names** | «Khối Tài chính/Logistics/Dịch vụ/Vận tải X.E», «Tập đoàn XeVN» (BA + sponsor screenshot SoT) |
| **SRS / FR** | FR-HRM-21: bảng hồ sơ + «Đơn vị lọc»; **không** khóa SoT nhãn cột công ty = legal entity. Glossary: Đơn vị = công ty/pháp nhân phiên. BA AC-EMP-COL-01..07 = Plane A LE/ĐVTV |
| **Verdict** | **ORPHAN / MISMATCH** — header says «công ty»; values are Plane B operating-unit «Khối*» (BE map/registry), not ĐVTV legal names |

```text
spec (BA + DANH_MUC / Plane A): cột «Thông tin công ty» = tên pháp nhân / ĐVTV DB
code (FE): bind operating-unit display_name_vi (Khối* when API returns registry/seed)
```

**CODE-MEMORY on page:** `Employees.tsx` has `@CODE-MEMORY` (scale/paging / J-HRM-02) but **does not** cite FR-HRM-21 Diễn biến # / AC-EMP-COL / company-label SoT → **trace weak** for this column.

### 2.2 Operating unit filter (`HrmOperatingUnitFilter.tsx`)

| Item | Finding |
|------|---------|
| **Chrome label** | Hardcoded «**Đơn vị thành viên**» |
| **Options** | «Tất cả đơn vị (rollup)» + `unit.display_name_vi` from same operating-units API |
| **Banner** | «Đang xem: {display_name_vi}» |
| **SRS** | FR-HRM-SCOPE-03: lọc **đơn vị thành viên** hoặc «Tất cả» — semantics = ĐVTV / group member, **not** «Khối vận hành» fiction |
| **CODE-MEMORY** | Present (BM-AC-02 / J-HRM-INT-05) — documents filter behavior; **does not** require Plane A LE names |
| **Verdict** | **SEMANTIC ORPHAN risk** — UI copy says ĐVTV; option values can still be «Khối … X.E» → contradicts AC-EMP-COL-07 (cột vs filter must not diverge) |

FE test fixture `HRM_OPERATING_UNIT_TEST_FIXTURE` in `hrmOperatingUnits.ts` still encodes Khối* (vitest-only; runtime uses API). Chart aggregators (`recruitmentDashboardAggregator`, `attendanceDashboardAggregator`) assert Khối labels in tests — will need update when SoT flips to LE.

### 2.3 Downstream consumers of same label map (same orphan class)

| Surface | Path / symbol | Behavior |
|---------|---------------|----------|
| Recruitment dashboard | `useRecruitmentDashboard` + aggregator | Chart slice names from `operatingUnitLabelMap` |
| Attendance weekly summary | `useWeeklyAttendanceSummary` / `resolveAttendanceUnitLabel` | Department/unit display via same map |
| Embed working context | `resolveEmbedWorkingContext` + filter | `dvtvLabel` = selected unit `display_name_vi` |

---

## 3. Broader FE orphan / weak-spec inventory (sample, not exhaustive)

| ID | Surface | Path | Business name / UI | In SRS clearly? | Class |
|----|---------|------|--------------------|-----------------|-------|
| **G-ORPH-FE-01** | Employees list column | `pages/Employees.tsx` `key:'company'` | Header «Thông tin công ty»; cells Khối* via OU map | Partial (FR-HRM-21 list only; BA AC closes gap) | **P0 mismatch** |
| **G-ORPH-FE-02** | OU filter options | `HrmOperatingUnitFilter.tsx` | «Đơn vị thành viên» + Khối* options | SCOPE-03 says ĐVTV; not Khối labels | **P0 semantic** |
| **G-ORPH-FE-03** | Chart/unit labels | `useRecruitmentDashboard` / attendance aggregators | Khối* on charts | Chart G-INT-02 Plane B was interim; BA says align to LE SoT | **P1 same root** |
| **G-ORPH-FE-04** | Employee form company field | `EmployeeFormDialog.tsx` `t('company.title')` | Same i18n key; picker SoT TBD vs LE | FR-HRM-EM-01 form — đơn vị; not Khối | **P1 verify** |
| **G-ORPH-FE-05** | CC metadata «Khối thông tin *» | `web-portal/.../CommandCenterPage.tsx` | Form **section** titles (general/location/capacity) | XBOS metadata blocks — different sense of «Khối» | **Note** — not employee company; do not conflate with G-ORPH-FE-01 |
| **G-ORPH-FE-06** | Employees CODE-MEMORY thin | `Employees.tsx` block | Missing Diễn biến # / company SoT | Policy requires SRS bước | **G-CM coverage** |

---

## 4. Pages **without** `@CODE-MEMORY`

### 4.1 `apps/web/hrm/src/pages` (32 `.tsx` page files)

| With `@CODE-MEMORY` (9) | Without (23) |
|-------------------------|--------------|
| Attendance, Contracts, Decisions, Employees, Payroll, Performance, Processes, Recruitment, ToolsEquipment | **AttendanceEntry**, **Company**, **Dashboard**, **EmployeeMetadataPage**, **EmployeeProfile**, ForgotPassword, Index, **Insurance**, **InternalServices**, Landing, Login, NotFound, **Onboarding**, PlatformAdmin, PrivacyPolicy, Register, **Reports**, ResetPassword, **Settings**, **SettingsCatalogsPage**, **Tasks**, UniAI, UserGuide |

**Business-priority missing CM (recommend next wave):**  
`Dashboard.tsx`, `EmployeeProfile.tsx`, `Insurance.tsx`, `AttendanceEntry.tsx`, `SettingsCatalogsPage.tsx`, `EmployeeMetadataPage.tsx`, `InternalServices.tsx`, `Onboarding.tsx`, `Reports.tsx`, `Tasks.tsx`, `Company.tsx`, `Settings.tsx`.

Auth/marketing shells (Login/Landing/Register/…) = lower priority for Diễn biến trace.

### 4.2 Components / portal (coverage signal)

| Area | total `.tsx` (ex test) | with CM | without |
|------|------------------------|---------|---------|
| `hrm/src/components` | 206 | 40 | **166** |
| `web-portal/src/pages` | 34 | 7 | **27** |

Portal pages **with** CM (sample): `CommandCenterPage`, `UnifiedShellPage`, `WorkflowCanvas`, ApplyCatalog / Metadata / settings-form-pattern / WorkflowStepResolverFields.

Portal pages **without** CM include: Login, HRPage, OrganizationPage, KPI*, most settings catalogs, Customers/Partners, RACI panel, CatalogGovernance, etc.

---

## 5. Recommended next execution (not done this wave)

| work_item | Owner | Action |
|-----------|-------|--------|
| `D-HRM-EMP-COMPANY-COL-BE-01` | dev-be | Sync `company_slug_map.display_name` ← LE; stop Khối as final display SoT (BA Option A) |
| `D-HRM-EMP-COMPANY-COL-FE-01` | dev-fe | Prefer `company_display_name` / LE map for column; align filter option labels; update vitest that assert Khối; **HOLD_DEPLOY** |
| `QA-HRM-EMP-COMPANY-COL-01` | qa | U65 assert column vs ĐVTV; J-HRM-02; F5 |
| `FE-CM-PAGES-BATCH-01` | dev-fe | Add CODE-MEMORY + Diễn biến # on priority pages in §4.1 |

---

## 6. Handoff

```yaml
work_item_id: FE-SPEC-ORPHAN-CODE-SAMPLE-01
from_role: dev-fe
to_role: pm
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/fe-spec-orphan-code-sample-01-20260722.md
HOLD_DEPLOY: true
completion_report: |
  Closed RESEARCH inventory only.
  P0: Employees «Thông tin công ty» + OU filter bind Plane B Khối labels vs SRS/BA Plane A ĐVTV.
  Listed 23 HRM pages + 27 portal pages without CODE-MEMORY; priority business pages called out.
  Appended SPEC_CODE_TRACEABILITY_GAP_REGISTER §4 G-ORPH-FE-01..06.
  No apps/** product fix; no deploy.
```

### next_dispatch_prompt

```text
work_item_id: D-HRM-EMP-COMPANY-COL-BE-01 + D-HRM-EMP-COMPANY-COL-FE-01 (parallel U69)
parent: BA-HRM-EMP-COMPANY-COL-01 · FE-SPEC-ORPHAN-CODE-SAMPLE-01
spec_ref: docs/qa/evidence/ba-hrm-emp-company-col-01-20260722.md · docs/qa/evidence/fe-spec-orphan-code-sample-01-20260722.md · FR-HRM-21 · FR-HRM-SCOPE-03 · AC-EMP-COL-01..07
entry_criteria: BA+FE research PASS_TO_PM; HOLD_DEPLOY=true
exit_criteria:
  - Cột «Thông tin công ty» = LE/ĐVTV SoT; 0 Khối* as final cell label
  - OU filter options same SoT (AC-EMP-COL-07); vitest updated
  - evidence be-hrm-emp-company-col-01-* + fe-hrm-emp-company-col-01-*
cấm: deploy pilot; seed U65; Option C rename header to keep Khối
after READY_FOR_QA: Task qa QA-HRM-EMP-COMPANY-COL-01
```
