# Evidence — W1-B-02-EMP

| Field | Value |
|-------|--------|
| **work_item_id** | `W1-B-02-EMP` |
| **slice** | `docs/program/slices/DOC-ENT-P0-HRM-EMP.md` (**ACTIVE**) |
| **executor** | Cursor dev-be (Team Claude parked) |
| **date** | 2026-08-03 |
| **change_mode** | UPGRADE / ADD (restore missing src) |
| **ack_status** | `READY_FOR_QA` |

## spec_read_ack

- srs: `docs/brand-new-documents-20270801/SRS_NEW.md` · **FR-UC-H01** · **FR-UC-HRM-21** · Diễn biến list→detail cùng scope
- api_contract: `docs/brand-new-documents-20270801/API_CONTRACT_NEW.md` §3.1–3.4
- db_design: `docs/brand-new-documents-20270801/DB_DESIGN_NEW.md` · `employees` (+ `custom_fields` JSONB)
- os: OS 28 FE–BE display-ready SoC · OS 25 SOLID · scope parity U19
- sponsor_confirm: W1-B packet / Cursor owns coding 2026-08-03

## Display-ready fields (OS 28)

On create / list / get / patch / archive / restore (`mapEmployee`):

| Field | Source | Notes |
|-------|--------|-------|
| `display_name` | `full_name` | FE bind name without join |
| `department` | `custom_fields.department` | flattened |
| `job_title_label` | `custom_fields.job_title_label` → `position` → short key | **never** snake `LEGAL_SPECIALIST` |
| `status_label` | VI map (`active`→Đang làm việc, …) | fallback raw / `—` |
| `phone_number` | `custom_fields.phone_number` / `work_phone` | flattened |
| `company_display_name` | LE SoT (must_keep) | unchanged |

Directory view (`mapDirectoryListItem`): + `status_label` + `job_title_label` (keeps `job_title` = key for mobile MP-01).

## Scope parity (list ↔ get-by-id ↔ patch)

| Path | Resolver |
|------|----------|
| GET list | `resolveHrmListScope` + `pushEmployeeListScopeFilters` + `scopeContext` |
| GET :id | same `queryEmployeeById` filters |
| PATCH :id | **fixed** — now passes `toHrmListScopeContext(tenantId)` into `updateEmployee` (was missing) |

Jest: group CEO `company_id=main` finds/updates `holding` row via `company_id = ANY`.

## Files touched

### In-scope (employees)

- `apps/api/hrm-api/src/employees/employee-display.ts` (**new**)
- `apps/api/hrm-api/src/employees/employee-display.spec.ts` (**new**)
- `apps/api/hrm-api/src/employees/employee-directory.ts`
- `apps/api/hrm-api/src/employees/employee-directory.spec.ts`
- `apps/api/hrm-api/src/employees/employees.service.ts`
- `apps/api/hrm-api/src/employees/employees.service.spec.ts`
- `apps/api/hrm-api/src/employees/employees.controller.ts`
- `apps/api/hrm-api/src/employees/employees.controller.spec.ts`
- `apps/api/hrm-api/src/employees/employee-list-cursor.ts` (**restored from dist** — missing blocked jest)

### Extra restore (jest load — same class as W1-B-01 leave bridge)

- `apps/api/hrm-api/src/operating-units/hrm-company-display-name.ts` (**restored from dist**)
- `apps/api/hrm-api/src/settings-catalogs/hrm-settings-master-keys.ts` (**restored from dist** — closes R-MASTER-KEYS)

### Artifacts

- `docs/program/slices/DOC-ENT-P0-HRM-EMP.md` → **ACTIVE**
- `docs/qa/evidence/w1b-02-emp.md`

## CODE-MEMORY

- NEW `@CODE-MEMORY` on `employee-display.ts`
- APPEND `@CODE-MEMORY-CHANGE` W1-B-02-EMP on `employees.service.ts` + `employees.controller.ts`
- Restore blocks on `employee-list-cursor.ts` · `hrm-company-display-name.ts` · `hrm-settings-master-keys.ts`

## Jest

```text
pnpm --filter hrm-api exec jest src/employees/employee-display.spec.ts src/employees/employee-directory.spec.ts src/employees/employees.service.spec.ts src/employees/employees.controller.spec.ts --no-cache
→ Test Suites: 4 passed, 4 total
→ Tests:       52 passed, 52 total
```

New cases: display-ready list+get; main→holding get parity; main→holding patch parity; null `job_title_label` when only snake key; directory no raw label leak; controller PATCH passes `scopeContext`.

## must_keep verified

- `company_display_name` LE SoT (not Khối)
- keyset cursor path unchanged
- list/get share `pushEmployeeListScopeFilters`
- U65: no seed
- no web/mobile / leave / NEW docs rewrite

## Residual

| ID | Severity | Note | Owner |
|----|----------|------|-------|
| R-QA-BROWSER | P0 gate | Browser U65 EMP UF not run (BE-only) | qa |
| R-FE-BIND | P2 | FE `useEmployee` still joins custom_fields; can prefer top-level `department` / `job_title_label` next wave | dev-fe optional |

## next_dispatch_prompt

```text
work_item_id: W1-B-02-EMP-QA
role: qa
mission: Retest employees list→detail→patch display-ready + scope parity (FR-UC-H01 / FR-UC-HRM-21)
entry: W1-B-02-EMP READY_FOR_QA · evidence docs/qa/evidence/w1b-02-emp.md
AC:
  - GET /api/hrm/employees?company_id=main (ceo@xe.vn) rows include status_label, department, job_title_label, display_name (no FE catalog join)
  - click row → GET :id same company_id=main succeeds for holding employee (not 404)
  - PATCH same id under company_id=main → 202 + display-ready fields
  - job_title_label never equals snake catalog key when label missing (UI shows —)
  - U65 zero-seed; browser FE path preferred for UF
exit: evidence docs/qa/evidence/w1b-02-emp-qa.md · PASS_TO_PM or FAIL with defect
forbidden: seed · leave rewrite
```

## completion_report

**Closed:** Employees BE display-ready (OS 28) on list/get/patch; PATCH scopeContext parity with list/get; CODE-MEMORY; jest 52/52; slice ACTIVE; missing src restored for module load.

**Open:** Browser QA; optional FE prefer top-level display fields.
