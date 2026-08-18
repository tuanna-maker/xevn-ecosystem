# PO-HRM Settings consumer — WH position catalog scope parity (BE)

| Meta | Value |
|------|--------|
| **work_item_id** | `D-BE-HRM-WH-POSITION-CATALOG-SCOPE-01` |
| **role** | dev-be |
| **date** | 2026-08-11 |
| **ack_status** | `READY_FOR_QA` |
| **qa_stamp** | fixes **WHPOS1-MSNL05LB** |

## spec_read_ack

| Field | Path / ref |
|-------|------------|
| **srs** | `docs/hrm/SRS.md` §16.8 O4 · `docs/program/specs/PO-HRM-SETTINGS-SRS-FIDELITY-DELTA-01.md` §6.2 **AC-SET-CONSUMER-JT-WH-01** |
| **tech_spec** | `docs/hrm/TECHSPEC.md` §11.4 / §14 |
| **db_design** | `docs/hrm/DB_DESIGN_HRM_MD_BIND_E1A.md` §3 |
| **api_design** | `docs/hrm/API_DESIGN_HRM_MD_BIND_E1A.md` WH-C |
| **change_mode** | FIX |

## Root cause

`GET /settings-catalogs/job_titles/items?company_id=main` resolves partition via `resolveHrmSettingsCatalogCompanyId` → **`holding`** (group catalog SoT).

`POST …/work-timeline` called `assertCodeInEffectiveCatalog` with **raw** `employee.company_id` (often `main` or member slug) **without** the same resolver → empty/wrong partition → **400** `HRM-WH-PICK-REQUIRED` for codes visible in the picker.

## Fix

`employee-profile.service.ts`:

- `resolveWhCatalogCompanyId` → `resolveHrmSettingsCatalogCompanyId(authorization, tenantId, persistCompanyId)`
- `assertWhPositionKey` / `assertWhDepartmentKey` pass **catalog** `companyId` to assert (persist row `company_id` unchanged)

Pattern aligned with `recruitment-catalog.service.ts` `assertJdPositionCodeInCatalog`.

## Verification

```text
pnpm --filter hrm-api test -- po-hrm-settings-consumer-jt-wh-be-01.spec.ts be-erp-e1a-pos-key-01.spec.ts
→ Test Suites: 2 passed · Tests: 23 passed
```

| Case | Expected |
|------|----------|
| RETAIN holding assert | `companyId: 'holding'` on catalog assert |
| **NEW** employee `company_id=main`, query `main`, `position_key=ceo` | assert `job_titles` + `departments` with **`companyId: 'holding'`** |
| Unknown code / empty catalog | RETAIN `HRM-WH-PICK-REQUIRED` / `HRM-WH-PICK-EMPTY-CATALOG` |

**U65:** No seed — unit mocks + scope resolver logic only.

## QA retest (browser)

| Step | Check |
|------|--------|
| Persona | `ceo@xe.vn` · `company_id=main` |
| Path | UF-HRM-10 QTCT → Thêm → Vị trí **giám đốc** → Lưu → F5 |
| Network | `POST …/work-timeline` → **201** · body `position_key=ceo` |
| F5 | Row visible · label = catalog |

## completion_report

**Closed:** scope_parity between Settings `job_titles` list/overview and work-timeline catalog assert for `main` / group CEO; regression + new jest case; `settings_catalog_e2e_ready=false` RETAIN.

**Residual:** Full UF-HRM-10 matrix · `settings_catalog_e2e_ready` flip — QA/QC only after U65 browser PASS.

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: QA-PO-HRM-WH-POSITION-PICKER-02
role: qa
read_first:
  - docs/qa/evidence/qa-po-hrm-settings-consumer-jt-wh-01.md (WHPOS1-MSNL05LB)
  - docs/qa/evidence/po-hrm-settings-consumer-jt-wh-be-02.md
entry_criteria: D-BE-HRM-WH-POSITION-CATALOG-SCOPE-01 READY_FOR_QA; hrm-api restarted if needed
exit_criteria:
  - U65 browser: QTCT Vị trí picker → Lưu → POST 201 → F5 row persists (ceo/CHRO)
  - Network position_key ∈ prior GET job_titles/items (main)
  - evidence docs/qa/evidence/qa-po-hrm-settings-consumer-jt-wh-02.md
  - ack_status PASS_TO_PM or FAIL_TO_PM with Network body
cấm: seed
hdsd_align: hdsd-work-timeline-add-btn · hdsd-work-timeline-position-picker · hdsd-work-timeline-submit
```
