# PO-HRM Settings consumer — job_titles → Work Timeline (BE)

| Meta | Value |
|------|--------|
| **work_item_id** | `D-BE-HRM-WH-POSITION-KEY-01` |
| **role** | dev-be |
| **date** | 2026-08-11 |
| **ack_status** | `READY_FOR_QA` |

## spec_read_ack

| Field | Path / ref |
|-------|------------|
| **srs** | `docs/hrm/SRS.md` §16.8 O4 · `docs/program/specs/PO-HRM-SETTINGS-SRS-FIDELITY-DELTA-01.md` §6.2 **AC-SET-CONSUMER-JT-WH-01** |
| **tech_spec** | `docs/hrm/TECHSPEC.md` §11.4 / §14 (profile work timeline) |
| **db_design** | `docs/hrm/DB_DESIGN_HRM_MD_BIND_E1A.md` §3 — `employee_work_timeline.position_key` + index |
| **api_design** | `docs/hrm/API_DESIGN_HRM_MD_BIND_E1A.md` WH-C / WH-U — `POST`/`PATCH` … `/work-timeline` |
| **uc_ids** | UF-HRM-10 · AC-HRM-PICKER-01 · AC-SET-CONSUMER-JT-WH-01 |
| **change_mode** | ADD (trace + regression); runtime logic **RETAIN** E1-A / F-CORE-WH-02 |

## completion_report

**Closed (BE leg):**

- `employee_work_timeline` schema: `position_key` + `department_key` via `ensureSchema` (`employee-profile.service.ts`).
- **POST** `createWorkTimelineItem`: requires `position_key`; rejects `position` without `position_key` → **`HRM-WH-PICK-REQUIRED`**; `assertCodeInEffectiveCatalog` on **`job_titles`**; denorms `position` label from catalog when omitted.
- **PATCH** `updateWorkTimelineItem`: invent-only `position` without key rejected; `position_key` in body → catalog assert + allowlist persist.
- Regression jest: `po-hrm-settings-consumer-jt-wh-be-01.spec.ts` (4 cases) + `be-erp-e1a-pos-key-01.spec.ts` WH block (RETAIN).

**Residual (not BE):**

- FE `EmployeeWorkHistory` still Input free-text until **`D-FE-HRM-WH-POSITION-PICKER-01`**.
- `settings_catalog_e2e_ready=false` (honesty RETAIN).
- Full UF-HRM-10 consumer matrix — **ba-data** / QA browser U65.

## Verification

```text
pnpm --filter hrm-api test -- po-hrm-settings-consumer-jt-wh-be-01.spec.ts be-erp-e1a-pos-key-01.spec.ts
→ Test Suites: 2 passed · Tests: 22 passed
```

| Case | Expected |
|------|----------|
| POST `position_key=TP_KD` | 201 path · catalog assert `job_titles` · INSERT includes `position_key` |
| POST unknown code | 400 `HRM-WH-PICK-REQUIRED` |
| PATCH `position_key` | assert catalog · UPDATE sets `position_key` |
| Empty catalog message | 400 `HRM-WH-PICK-EMPTY-CATALOG` |

**U65:** No seed used in evidence — unit mocks only.

## API contract (QA Network)

| Method | Path | Body (Vị trí) |
|--------|------|----------------|
| POST | `/api/hrm/employees/:employeeId/work-timeline?company_id=` | `position_key` (required) · optional `position` snapshot |
| PATCH | `/api/hrm/employees/:employeeId/work-timeline/:itemId` | `position_key` when changing Vị trí |

Error codes: `HRM-WH-PICK-REQUIRED` (≡ legacy doc alias `HRM-WH-POS-KEY` class) · `HRM-WH-PICK-EMPTY-CATALOG`.

## next_owner

`qa` (after FE picker) · immediate next execution: **`dev-fe`**

## next_dispatch_prompt

```text
work_item_id: D-FE-HRM-WH-POSITION-PICKER-01
role: dev-fe
read_first:
  - docs/program/specs/PO-HRM-SETTINGS-SRS-FIDELITY-DELTA-01.md §6.2 AC-SET-CONSUMER-JT-WH-01
  - docs/qa/evidence/po-hrm-settings-consumer-jt-wh-be-01.md
  - apps/web/hrm/src/lib/catalogSearchPicker.ts (resolveWorkTimelinePositionFromCatalog)
entry_criteria: D-BE-HRM-WH-POSITION-KEY-01 READY_FOR_QA; BE POST/PATCH accepts position_key ∈ job_titles
exit_criteria:
  - EmployeeWorkHistory Vị trí → CatalogSearchPicker (job_titles)
  - POST/PATCH body sends position_key + label snapshot; F5 label = catalog
  - hdsd test ids workTimelinePositionPicker wired
  - evidence docs/qa/evidence/po-hrm-settings-consumer-jt-wh-fe-01.md
  - ack_status READY_FOR_QA
must_keep: settings_catalog_e2e_ready=false; sealed dept/REC-CH/CTR slices; att-leave-types SoT
cấm: seed for UAT evidence
```
