# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-BE-01

| Meta | Value |
|------|-------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-BE-01` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-SA-01` Option B LOCKED |
| **prior** | DATA-01 CONFIRMED · BA-01 CONFIRMED · BE HOLD lifted |
| **from_role** | dev-be |
| **to_role** | qa |
| **lane** | execution |
| **ack_status** | **READY_FOR_QA** |
| **date** | 2026-08-08 |
| **change_mode** | **ADD** `emp_employment_status` + `emp_status_reason` + F-EMP-CAT-ST/STR/EFF + CNS KEY · **DROP** `chk_employees_status` |
| **honesty** | `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · `contracts_printable_ready=false` · **DENIED** invent module EMP UAT · **`C-SLICE-≠-MODULE`** · U65 |
| **solid_convention_ack** | FE–BE boundary · display-ready `status_label` from Nest catalog when known · catalog services SRP |

---

## 1. spec_read_ack

| Artifact | Sections |
|----------|----------|
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-DATA-01.md` | §2–§4 physical · dual SoT · CHECK DROP · VAL-EMP-ST/STR-* |
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-SA-01.md` | §5–§6 F-EMP-CAT-ST/STR · F-EMP-ST-CNS · KEY codes |
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-BA-01.md` | AC-PLT-EMP-STATUS-01* · BR-PLT-EMP-ST-* · consumer surfaces |
| `DB_DESIGN_HRM_ENTERPRISE.md` | §3.0c/d pointer via DATA DOC-DELTA · §3.1 status open key |
| Peer | `emp_document_type` / `emp_employment_type` / `att_leave_type` / `si_insurer` ensureSchema |

**db_design:** `emp_employment_status` · `emp_status_reason` · `employees.status` EXPAND open catalog key · DROP closed `chk_employees_status`.

**api_design:** F-EMP-CAT-ST-01..04 · ST-EFF-01 · F-EMP-CAT-STR-* · STR-EFF-01 · F-EMP-ST-CNS-01/02 — mục đích + bước AC-PLT-EMP-STATUS-01*.

---

## 2. Deliverable (apps)

| Path | Change |
|------|--------|
| `emp-employment-status.constants.ts` | Open key · `HRM-EMP-STATUS-KEY` · REF keys `employee_statuses`/`employment_statuses` |
| `emp-employment-status.service.ts` | ensureSchema + CRUD/retire + EFF dual SoT EMP wins + alias assert + label lookup |
| `dto/emp-employment-status.dto.ts` | List/upsert/patch/effective DTOs + typed flags |
| `emp-status-reason.constants.ts` | Open key · `HRM-EMP-STATUS-REASON-KEY` |
| `emp-status-reason.service.ts` | ensureSchema + CRUD/retire + EFF + CNS-02 applies_to |
| `dto/emp-status-reason.dto.ts` | List/upsert/patch/effective DTOs |
| `employees.service.ts` | DROP `chk_employees_status`; create/update status + reason assert; `status_label` from catalog |
| `employees.controller.ts` | `/employment-statuses*` · `/status-reasons*` (before `:employeeId`) |
| `employees.module.ts` | providers/exports ST + STR |
| `employee-display.ts` | Prefer catalog label when known (L-EMP-ST-13) |
| `create/update-employee.dto.ts` | optional `status` · `status_reason_key` |
| Specs | `emp-employment-status.service.spec.ts` · `emp-status-reason.service.spec.ts` + controller/parity mocks |

**must_keep untouched:** emp_document_type / emp_employment_type LIVE · EMP-CUSTOM CNS L1 · MergeToken EXT · ATT/SI/CTR seals · U65 no seed.

---

## 3. Schema / API stamps

| Topic | Stamp |
|-------|--------|
| Physical ST | `CREATE TABLE IF NOT EXISTS public.emp_employment_status` + UQ partial `(company_id, lower(status_key)) WHERE archived_at IS NULL` + IX effective |
| Physical STR | `CREATE TABLE IF NOT EXISTS public.emp_status_reason` + UQ partial lower(reason_key) + IX effective |
| CHK | format + row-status only — **FORBIDDEN** `status_key IN (…)` / `reason_key IN (…)` |
| Consumer CHECK | `ALTER TABLE employees DROP CONSTRAINT IF EXISTS chk_employees_status` |
| Soft-delete | retire → `status=retired` + `archived_at` — no hard DELETE |
| Dual SoT ST | EMP native + Settings REF partitions; collision → `source=emp_override` |
| Empty | `[]` / soft skip invent when EFF=0 (U65 — no starter upsert) |
| CNS | `HRM-EMP-STATUS-KEY` · `HRM-EMP-STATUS-REASON-KEY` |
| Display | `status_label` from catalog `name_vi` when known; hardcode bootstrap only EFF=0 |

### Routes

| Method | Path | F-id |
|--------|------|------|
| GET | `/api/hrm/employees/employment-statuses` | F-EMP-CAT-ST-01 |
| GET | `/api/hrm/employees/employment-statuses/effective` | F-EMP-CAT-ST-EFF-01 |
| POST/PUT | `/api/hrm/employees/employment-statuses` | F-EMP-CAT-ST-02 |
| PATCH | `/api/hrm/employees/employment-statuses/:id` | F-EMP-CAT-ST-03 |
| POST | `/api/hrm/employees/employment-statuses/:id/retire` | F-EMP-CAT-ST-04 |
| GET | `/api/hrm/employees/status-reasons` | F-EMP-CAT-STR-01 |
| GET | `/api/hrm/employees/status-reasons/effective` | F-EMP-CAT-STR-EFF-01 |
| POST/PUT | `/api/hrm/employees/status-reasons` | F-EMP-CAT-STR-02 |
| PATCH/retire | `/api/hrm/employees/status-reasons/:id` | STR update/retire |

---

## 4. Verification

```text
pnpm --filter hrm-api exec jest --testPathPatterns="emp-employment-status.service.spec|emp-status-reason.service.spec|employees.controller.spec|d-dash-01-employees-summary|p1-hrm-perf-be-01|p1-phase1-be-emp-create-parity|employee-display.spec|emp-employment-type.service.spec|emp-document-type.service.spec" --no-coverage
→ Test Suites: 9 passed · Tests: 60 passed
```

| Suite | Result |
|-------|--------|
| `emp-employment-status.service.spec.ts` | PASS (ensureSchema · N+ · INVALID · CONFLICT · retire · ALS EMP wins · invent KEY · empty soft · alias · scope) |
| `emp-status-reason.service.spec.ts` | PASS (ensureSchema · N+ · invent KEY · applies_to · empty soft · requires_reason · retire) |
| DOC/ET + controller + dash/perf/parity + display | PASS regression |

---

## 5. completion_report

**Closed:** ensureSchema ADD `public.emp_employment_status` + `public.emp_status_reason` (open keys, partial UQ, format/row CHKs, effective IX, typed ST flags / applies_to); DROP closed `chk_employees_status`; Nest F-EMP-CAT-ST-01..04 + ST-EFF-01 + STR-* + STR-EFF-01; dual SoT Settings REF merge-read tenant wins; F-EMP-ST-CNS-01/02 invent KEY when EFF>0; display-ready `status_label` from catalog; jest VAL-EMP-ST/STR-CAT/CNS/ALS/SCP; @CODE-MEMORY APPEND; U65 no seed; honesty flags remain false; DOC/ET · EMP-CUSTOM · EXT · ATT/SI/CTR RETAIN.

**Residual:** FE picker rebind Nest EFF (dev-fe after QA); mobile label map; ba-docs API DOC-DELTA; transition-graph code residual OK.

---

## 6. Honesty / seals

| Flag / seal | Value |
|-------------|--------|
| `hrm_personnel_uat_ready` | **false** |
| `employees_e2e_linkage_ready` | **false** |
| `contracts_printable_ready` | **false** |
| Module EMP UAT / Phase1 | **DENIED** · **`C-SLICE-≠-MODULE`** |
| EMP DOC/ET · EMP-CUSTOM CNS · MergeToken EXT · ATT/SI/CTR | **RETAIN** |
| Seed | **DENIED** (U65) |

---

## 7. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **READY_FOR_QA** |
| **next_owner** | **qa** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-emp-status-catalog-be-01.md` |
| **next_dispatch_prompt** | See below |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-QA-01
from_role: pm
to_role: qa
lane: execution
priority: P1
entry_criteria: BE-01 READY_FOR_QA · U65 zero-seed · evidence be-01.md
read_first: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-status-catalog-be-01.md · BA-01 AC-PLT-EMP-STATUS-01*
task:
- L1: invent status when EFF>0 → 4xx HRM-EMP-STATUS-KEY (no seed to create EFF — admin CREATE N+1 via API/UI then invent)
- L1: chk_employees_status ABSENT (probe information_schema / insert open key e.g. probation after catalog row)
- L1: GET …/employment-statuses/effective + …/status-reasons/effective list 200 (empty [] OK)
- Confirm DOC/ET / EMP-CUSTOM / EXT / ATT/SI/CTR untouched
- Honesty flags remain false · C-SLICE-≠-MODULE
exit_criteria: PASS_TO_PM or FAIL with residual · evidence docs/qa/evidence/po-hrm-dynamic-config-platform-emp-status-catalog-qa-01.md
cấm: seed UF · flip ready · invent module EMP UAT
```
