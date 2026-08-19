# BA-HRM-EMPLOYMENT-TYPES-CONSUMER-CTR-01 — `employment_types` → Contracts Hình thức làm việc

| Meta | Value |
|------|--------|
| **work_item_id** | `GOV-HRM-SETTINGS-CONSUMER-MATRIX-NEXT-02` |
| **parent** | `BR-SET-CONSUMER-MATRIX-01` · `PO-HRM-SETTINGS-SRS-FIDELITY-DELTA-01` §6.2 |
| **date** | 2026-08-11 |
| **ack_status** | `PASS_TO_PM` |
| **lane** | governance · docs only |

## spec_read_ack

| Layer | Path |
|-------|------|
| srs | `docs/hrm/SRS.md` §16 · **FR-HRM-SC-ET-01** · §16.8 O4 (EMP/CTR consumers) |
| tech_spec | `docs/hrm/DB_DESIGN_HRM_SETTINGS_E1B.md` §5.1 `employment_types` codes |
| db_design | `docs/hrm/DB_DESIGN_HRM_SETTINGS_CATALOG.md` · canonical `employment_types` |
| api_design | `docs/hrm/API_DESIGN_HRM_SETTINGS_CATALOG.md` · GET effective items · contracts POST `work_arrangement` |

## Consumer row (P0)

| AC-ID | catalog_key | Màn → field | Owner | QA hint |
|-------|-------------|-------------|-------|---------|
| **AC-SET-CONSUMER-ET-CTR-01** | `employment_types` | Hợp đồng → **Tạo HĐ** bước 1 · **Hình thức làm việc** (`work_arrangement` on POST) | **dev-fe** (`CatalogSearchPicker` or EFF union helper) → **dev-be** (optional `assertCodeInEffectiveCatalog` on `work_arrangement` when EFF>0) | **UF-HRM-10** (narrow leg) · **AC-HRM-PICKER-01** · U65: Settings pull/sync `employment_types` → wizard picker options = EFF codes (snake) → Lưu 2xx → F5 detail shows label · **≠** full UF-HRM-10 PASS |

## Spec says / Code does

| | Spec | Code (2026-08-11) |
|---|------|-------------------|
| SoT | Settings catalog `employment_types` (group REF) + tenant extension; persist **code** (`full_time`, …) | `ContractCreateStep1GeneralGrid.tsx`: `WORK_ARRANGEMENT_OPTIONS` hardcoded `Select` |
| Peer | Employee / YCTD use `useEmpEmploymentTypesEffective` (Nest EMP writer ∪ group REF) | Contracts wizard **not** on same effective union |
| POST | `work_arrangement` string on contract create | Sends hardcoded enum value — may drift from Settings codes |

## Validation (QA after FE)

| Condition | Rule | Expected |
|-----------|------|----------|
| EFF>0 | Picker options | Only codes from effective `employment_types` (or documented union with EMP nest) |
| EFF=0 | Honest empty | CTA → Cài đặt / master-data; no invent options |
| Mutate | U65 | Chọn hình thức → Lưu → Network POST includes `work_arrangement` = catalog code → F5 label matches |
| Regression | CTR sealed legs | `department_key` · `contract_type` pickers unchanged (`QACONPAYSTQC1`) |

## BR (narrow)

| BR-ID | Rule |
|-------|------|
| **BR-SET-CONSUMER-ET-CODE-01** | `work_arrangement` on contract must use canonical snake codes per **BR-HRM-SC-ET-CODE-01** when catalog EFF>0 |
| **BR-SET-CONSUMER-ET-DUAL-01** | If union Nest EMP + settings REF, same option set as YCTD picker (`useEmpEmploymentTypesEffective`) — document in FE helper |

## Honesty

`settings_catalog_e2e_ready=false` · **cấm** claim UF-HRM-10 full PASS · **cấm** reopen sealed `departments` / `recruitment_channels` / `contract_types` / `job_titles` QTCT slices.

## completion_report

Closed: P0 matrix leg **employment_types → CTR work_arrangement** with AC-SET-CONSUMER-ET-CTR-01 + validation/BR rows. Residual: full `BR-SET-CONSUMER-MATRIX-01` · REC CH AC rows §6.2 · dual SoT ET on Employee (Nest) vs Settings admin.

## next_owner

`dev-fe`

## next_dispatch_prompt

```text
work_item_id: PO-HRM-EMPLOYMENT-TYPES-CONSUMER-CTR-FE-01
role: dev-fe
read_first:
  - docs/program/specs/BA-HRM-EMPLOYMENT-TYPES-CONSUMER-CTR-01.md
  - docs/program/specs/PO-HRM-SETTINGS-SRS-FIDELITY-DELTA-01.md §6.2 AC-SET-CONSUMER-ET-CTR-01
  - apps/web/hrm/src/components/contracts/ContractCreateStep1GeneralGrid.tsx (WORK_ARRANGEMENT_OPTIONS)
  - apps/web/hrm/src/components/recruitment/JobRequisitionsTab.tsx (employment_type picker peer)
entry_criteria: GOV-HRM-SETTINGS-CONSUMER-MATRIX-NEXT-02 PASS; must_keep QACONPAYSTQC1 dept+contract_types legs; settings_catalog_e2e_ready=false
exit_criteria: Replace hardcoded Select with catalog-backed picker (settings overview or useEmpEmploymentTypesEffective per BR-SET-CONSUMER-ET-DUAL-01); vitest; data-testid ctr-create-work-arrangement still; evidence po-hrm-employment-types-consumer-ctr-fe-01.md; READY_FOR_QA narrow AC-SET-CONSUMER-ET-CTR-01
cấm: UF-HRM-10 full PASS; reopen WHPOS/dept/REC-CH sealed slices
allowed_paths: apps/web/hrm/src/components/contracts/** · apps/web/hrm/src/lib/catalogSearchPicker.ts · related tests
evidence_path: docs/qa/evidence/po-hrm-employment-types-consumer-ctr-fe-01.md
```

## evidence_path

`docs/program/specs/BA-HRM-EMPLOYMENT-TYPES-CONSUMER-CTR-01.md` · delta `PO-HRM-SETTINGS-SRS-FIDELITY-DELTA-01.md` §6.2
