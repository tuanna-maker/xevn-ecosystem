# PO-HRM-SETTINGS-CATALOG-CONSUMER-AUDIT-FE-01

**work_item_id:** `PO-HRM-SETTINGS-CATALOG-CONSUMER-AUDIT-FE-01`  
**role:** dev-fe  
**date:** 2026-08-10  
**U65:** browser QA only — no seed in evidence  
**ack_status:** `READY_FOR_QA`

## Scope

Audit `GET /api/hrm/settings-catalogs` consumers in `apps/web/hrm` — catalogs must appear on business forms (not only Settings list). P0 fix: **Contracts** create wizard department field bound to `departments` catalog (was label-only `Select` + `useDepartments` names).

## Verify (dev)

```bash
pnpm --filter @xevn/hrm-web exec vitest run src/lib/po-hrm-settings-catalog-consumer-audit-fe-01.test.ts src/lib/contractCreateWizard.source.test.ts src/lib/catalogSearchPicker.test.ts --reporter=dot
```

## Consumer matrix (master-data families → UI)

Legend: **PASS** = bound via `useSettingsCatalogsOverview` + `*OptionsFromCatalog` or dedicated helper; **PASS (Nest)** = Nest `*/effective` SoT (not settings overview); **EMPTY** = honest empty + CTA when EFF=0; **FAIL** = not consumer-bound (Settings-only or hardcoded).

| catalog_key (family) | Screen / module | Control / helper | Verdict |
|----------------------|-----------------|------------------|---------|
| `job_titles` (+ positions aliases) | EmployeeFormDialog | `CatalogSearchPicker` · `jobTitleOptionsFromCatalog` | PASS |
| `job_titles` | Contracts wizard | position via `resolveContractCreatePositionKey` + `jobTitleOptionsFromCatalog` | PASS |
| `job_titles` | EmployeeContracts tab | `CatalogSearchPicker` position | PASS |
| `job_titles` | JobRequisitionsTab / JobPostingsTab / JobTemplatesTab / HeadcountProposalTab / Recruitment plans | `CatalogSearchPicker` · `jobTitleOptionsFromCatalog` | PASS |
| `job_titles` | Decisions / Performance / EmployeeWorkTimeline / EmployeeProfile | catalog helpers | PASS |
| `departments` (+ aliases) | EmployeeFormDialog | `CatalogSearchPicker` · `departmentOptionsFromCatalog` | PASS |
| `departments` | **Contracts wizard (fix)** | `CatalogSearchPicker` · `departmentOptionsFromCatalog` · `department_key` on POST | **PASS (fixed)** |
| `departments` | EmployeeContracts | `CatalogSearchPicker` dept | PASS |
| `departments` | JobRequisitionsTab | `requisitionDepartmentPickerOptions` → catalog first | PASS |
| `departments` | JobPostingsTab / Headcount / Decisions / Performance / WorkTimeline | `departmentOptionsFromCatalog` | PASS |
| `contract_types` | Contracts list chips + wizard | `contractTypeOptionsFromCatalog` · `CatalogSearchPicker` | PASS |
| `contract_types` | EmployeeContracts | `contractTypeOptionsFromCatalog` | PASS |
| `employment_types` | EmployeeForm / JobRequisitions | `useEmpEmploymentTypesEffective` (Nest) | PASS (Nest) |
| `leave_types` | LeaveTab | `leaveTypeOptionsFromCatalog` | PASS / EMPTY |
| `hr_decision_types` | Decisions | `decisionTypeOptionsFromCatalog` (lib) | PASS |
| `pay_types` | Payroll nature pickers | `payTypeOptionsFromCatalog` where wired | PASS |
| `salary_components` | Salary components (Nest primary) | Nest EFF + REF settings | PASS (Nest) |
| `insurers` / `insurance_types` | BH dialogs | Nest F-SI-CAT-* EFF | PASS (Nest) |
| `kpi_library` | Performance | `kpiLibraryOptionsFromCatalog` | PASS |
| `job_grades` | Performance (optional) | `jobGradeOptionsFromCatalog` | PASS |
| `recruitment_channels` | Candidates source | no settings overview bind found | **EMPTY / BE** |
| `shifts` | Attendance admin | dedicated ATT catalog modules | PASS (slice) |
| `recruitment_pipeline_stages` | Recruitment kanban | `useRecPipelineStagesEffective` | PASS (Nest) |
| Form-field catalogs (`hrm_contract_form_fields`, `hrm_employee_basic_fields`, …) | Contracts / Employee form | `findCatalog` + field visibility | PASS |
| Settings list only | SettingsCatalogsTab / MasterDataSettingsPanel | overview CRUD | Settings (expected) |

## P0 fix summary

| File | Change |
|------|--------|
| `pages/Contracts.tsx` | `departmentPickerOptions` = `departmentOptionsFromCatalog`; removed `useDepartments` label merge; edit resolves `department_key` |
| `ContractCreateStep1GeneralGrid.tsx` | Phòng ban → `CatalogSearchPicker` (`ctr-create-department-picker`) |
| `contractCreateWizardState.ts` | POST `department_key` + label via `buildDepartmentKeyFields` |
| `useContracts.ts` | Map `department_key` on list/detail row |

## Residual / BE gaps (not FE P0)

| Item | Owner | Note |
|------|-------|------|
| `recruitment_channels` on candidate intake | BE/BA | No `*OptionsFromCatalog` consumer in REC forms — confirm UC if required |
| `work_arrangement` on CTR wizard | BA | Still hardcoded Select (not `employment_types` catalog) — out of this WI unless sponsor maps to catalog |
| Live EFF counts | QA | U65: login → Settings sync XBOS → open form → picker options match Settings row count |

## PM board (2026-08-10 — narrow slice GWC)

**QC:** `QACONPAYSTQC1-MSNG1JQC1` · **QA:** `QACONPAYST1-MSNG1JPS` — Contracts create **dept + type** consumer legs **🟢 slice**; full matrix **not** UAT-ready. See `docs/program/dispatch/PO-HRM-SETTINGS-CONSUMER-MATRIX-PM-01.md`.

## QA entry (U65 FE)

- Persona: `ceo@xe.vn` / Command Center → HRM Contracts  
- UF: create HĐ → **Loại HĐ** + **Phòng ban** pickers show catalog items after XBOS sync (Network: single cached `GET settings-catalogs`)  
- F5 after Lưu: department label + `department_key` on contract row  
- Employee create/edit: dept/position pickers unchanged (regression)  
- JobRequisitions create: dept/position pickers unchanged  

## completion_report

Closed: consumer audit matrix + Contracts department catalog bind P0 + vitest source locks.  
Open: `recruitment_channels` consumer gap; CTR `work_arrangement` hardcoded list (documented).
