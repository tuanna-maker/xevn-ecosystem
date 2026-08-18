# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-BE-01

| Meta | Value |
|------|-------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-BE-01` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-VERTICAL-SA-01` · DATA-01 CONFIRMED |
| **from_role** | dev-be |
| **to_role** | qa |
| **lane** | execution |
| **ack_status** | **READY_FOR_QA** |
| **date** | 2026-08-07 |
| **change_mode** | **ADD** `emp_document_type` + `emp_employment_type` + F-EMP-CAT-DOC/ET/EFF |
| **honesty** | `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · `payroll_e2e_ready=false` · `attendance_uat_ready=false` · `recruitment_uat_ready=false` · no Phase1 DONE · U65 |

---

## 1. spec_read_ack

| Artifact | Sections |
|----------|----------|
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DATA-01.md` | §2–§3 physical · §3.4 dual SoT ET · §6 VAL-EMP-DOC/ET-* |
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-VERTICAL-SA-01.md` | §3 F-EMP-CAT-DOC/ET/EFF · L-EMP-CAT-* · AC-PLT-EMP-02..06 |
| `DB_DESIGN_HRM_ENTERPRISE.md` | §3.0a–b · §3.5 (via DATA DOC-DELTA) |
| `po-hrm-dynamic-config-platform-emp-data-01.md` | unlock ensureSchema |
| Peer | `att-leave-type.service.ts` dual SoT + open catalog pattern |

---

## 2. Deliverable (apps)

| Path | Change |
|------|--------|
| `emp-document-type.constants.ts` | Open key format · `HRM-EMP-DOC-TYPE-UNKNOWN` · starter docs-only |
| `emp-document-type.service.ts` | ensureSchema + list/get/upsert/patch/retire + EFF-01 + assert |
| `dto/emp-document-type.dto.ts` | List/upsert/patch/effective query DTOs |
| `emp-employment-type.constants.ts` | Open key · `HRM-EMP-ET-UNKNOWN` · group REF key `employment_types` |
| `emp-employment-type.service.ts` | ensureSchema + CRUD/retire + EFF-02 union (EMP wins) + assert |
| `dto/emp-employment-type.dto.ts` | List/upsert/patch/effective DTOs |
| `employees.controller.ts` | `/employees/document-types*` · `/employment-types*` (before `:employeeId`) |
| `employees.module.ts` | providers/exports DOC + ET services |
| Specs | `emp-document-type.service.spec.ts` · `emp-employment-type.service.spec.ts` + controller mocks |

**must_keep untouched:** CORE-01 profile · UF-HRM-02 contracts · SI enrollment · AC-PLT-EMP-01 XBOS position REF · soft-delete only · no seed · no wipe.

**solid_convention_ack:** Catalog services SRP (separate from EmployeesService TXN); display-ready map on list/get; typed DOC/ET flags SoT (not free JSON); FE does not invent catalog ceiling; scope_parity shared `resolveHrmListScope` / `assertResourceInHrmScope`.

---

## 3. Schema / API stamps

| Topic | Stamp |
|-------|--------|
| Physical DOC | `CREATE TABLE IF NOT EXISTS public.emp_document_type` + UQ partial `(company_id, lower(document_type_key)) WHERE archived_at IS NULL` |
| Physical ET | `CREATE TABLE IF NOT EXISTS public.emp_employment_type` + UQ partial `(company_id, lower(employment_type_key)) WHERE archived_at IS NULL` |
| CHK | slug format + status only — **FORBIDDEN** `document_type_key IN (…)` / `employment_type_key IN (full_time,…)` |
| Soft-delete | `POST …/retire` → `status=retired` + `archived_at` — no hard DELETE |
| Dual SoT ET | EMP native + settings `employment_types` REF; collision → `source=emp_override` |
| Empty | `[]` / soft allow assert when effective=0 (U65 — no starter upsert in ensure) |
| Normalize ET | hyphen→underscore on write (`full-time`→`full_time`) |
| Assert helpers | `assertDocumentTypeInEffectiveCatalog` · `assertEmploymentTypeInEffectiveCatalog` |

### Routes

| Method | Path | F-id |
|--------|------|------|
| GET | `/api/hrm/employees/document-types` | F-EMP-CAT-DOC-01 |
| GET | `/api/hrm/employees/document-types/effective` | F-EMP-CAT-EFF-01 |
| GET | `/api/hrm/employees/document-types/:id` | F-EMP-CAT-DOC-01 |
| POST/PUT | `/api/hrm/employees/document-types` | F-EMP-CAT-DOC-02 |
| PATCH | `/api/hrm/employees/document-types/:id` | F-EMP-CAT-DOC-02 |
| POST | `/api/hrm/employees/document-types/:id/retire` | F-EMP-CAT-DOC-02 |
| GET | `/api/hrm/employees/employment-types` | F-EMP-CAT-ET-01 |
| GET | `/api/hrm/employees/employment-types/effective` | F-EMP-CAT-EFF-02 |
| GET | `/api/hrm/employees/employment-types/:id` | F-EMP-CAT-ET-01 |
| POST/PUT | `/api/hrm/employees/employment-types` | F-EMP-CAT-ET-02 |
| PATCH | `/api/hrm/employees/employment-types/:id` | F-EMP-CAT-ET-02 |
| POST | `/api/hrm/employees/employment-types/:id/retire` | F-EMP-CAT-ET-02 |

---

## 4. Verification

```text
pnpm --filter hrm-api exec jest --testPathPatterns="emp-document-type.service.spec|emp-employment-type.service.spec|employees.controller.spec|d-dash-01-employees-summary|p1-hrm-perf-be-01|p1-phase1-be-emp-create-parity" --no-coverage
→ Test Suites: 6 passed · Tests: 39 passed
```

| Suite | Result |
|-------|--------|
| `emp-document-type.service.spec.ts` | PASS (ensureSchema · open N+ · INVALID · scope_parity · retire · UNKNOWN · empty soft-allow) |
| `emp-employment-type.service.spec.ts` | PASS (ensureSchema · hyphen normalize · open 5th · EFF EMP wins · scope_parity · UNKNOWN · retire) |
| `employees.controller.spec.ts` | PASS (catalog service mocks) |
| `d-dash-01` / `p1-hrm-perf` / `p1-phase1` | PASS regression (parity mock INSERT param index fix for manager_id/avatar/custom_fields) |

---

## 5. completion_report

**Closed:** ensureSchema ADD `public.emp_document_type` + `public.emp_employment_type` per DATA-01; F-EMP-CAT-DOC-01/02 + ET-01/02 CRUD+retire; F-EMP-CAT-EFF-01/02 (ET dual SoT EMP wins); open catalog N+/5th+; FORBIDDEN closed enum CHECK; soft-delete only; scope_parity list↔get U19; assert helpers for BR-PLT-02; U65 no seed/starter upsert; must_keep profile/contracts/SI/XBOS position.

**Residual:**
| ID | Item | Owner |
|----|------|-------|
| R-PLT-EMP-01 | Wire checklist / ACT-01 → assert DOC (no Nest checklist path yet) | dev-be later / FE bind |
| R-PLT-EMP-02 | Wire YCTD/employee employment_type → assert ET | dev-be / REC consumer |
| R-PLT-EMP-03 | Client API DOC-DELTA | ba-docs |
| FE | Settings pickers + checklist/ET bind | **dev-fe** HOLD until QA L1 |

**Forbidden claims:** personnel UAT · e2e linkage · PAY/ATT/REC ready · Phase1 DONE · seed as UF evidence.

---

## 6. next_owner / next_dispatch_prompt

**next_owner:** **qa**

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-QA-01
from_role: pm
to_role: qa
lane: execution
priority: P2
change_mode: VERIFY
prior: PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-BE-01 READY_FOR_QA

entry_criteria:
- Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-be-01.md
- L0 stack up (hrm-api)
- U65 zero-seed; cấm seed UF

verify (L1 API — browser FE HOLD):
1) ensureSchema live: GET /api/hrm/employees/document-types?company_id=… → 200 [] or rows
2) POST document-types key hr_doc_custom_09 → 2xx; uppercase CCCD → 400 HRM-PLT-CAT-CODE-INVALID
3) POST employment-types key seasonal_temp (5th+) → 2xx; full-time → persist full_time
4) GET …/employment-types/effective?company_id=… — EMP wins REF collision when both present
5) POST …/:id/retire → status=retired; list default hides; include_archived can still see
6) scope_parity: group CEO main list↔get holding row; member OOS → 404/403
7) FORBIDDEN: closed enum reject; hard-delete; honesty flip

exit_criteria:
- Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-qa-01.md
- ack_status: PASS_TO_PM (or FAIL with residual)
- honesty flags remain false
- next: FE Settings pickers when L1 PASS (or residual R-PLT-EMP-01/02 wire)
```

---

## 7. Handoff contract

| Field | Value |
|-------|--------|
| **ack_status** | **READY_FOR_QA** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-emp-be-01.md` |
| **next_owner** | **qa** |
| **completion_report** | See §5 |
| **next_dispatch_prompt** | See §6 |
