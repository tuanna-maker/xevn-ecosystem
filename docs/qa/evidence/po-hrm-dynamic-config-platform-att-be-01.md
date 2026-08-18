# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-BE-01

| Meta | Value |
|------|-------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-BE-01` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-VERTICAL-SA-01` · DATA-01 |
| **from_role** | dev-be |
| **to_role** | qa |
| **lane** | execution |
| **ack_status** | **READY_FOR_QA** |
| **date** | 2026-08-07 |
| **change_mode** | **ADD** `att_leave_type` + F-ATT-CAT-* · **EXPAND** leave-requests effective assert |
| **honesty** | `attendance_uat_ready=false` · `payroll_e2e_ready=false` · no Phase1 DONE · U65 |

---

## 1. spec_read_ack

| Artifact | Sections |
|----------|----------|
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-DATA-01.md` | §2 physical · §2.5 dual SoT · §5 VAL-ATT-LVT-* |
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-VERTICAL-SA-01.md` | §3 F-ATT-CAT-LVT-01/02 · F-ATT-CAT-EFF-01 · §6 errors |
| `po-hrm-dynamic-config-platform-att-data-01.md` | unlock ensureSchema |
| AS-IS | `attendance-config.service.ts` work-sites pattern · `leave-requests` settings-catalog assert |

---

## 2. Deliverable (apps)

| Path | Change |
|------|--------|
| `att-leave-type.constants.ts` | Open key format · categories · `HRM-LEAVE-TYPE-UNKNOWN` |
| `att-leave-type.service.ts` | ensureSchema + list/get/upsert/patch/retire + effective union |
| `dto/att-leave-type.dto.ts` | List/upsert/patch/effective query DTOs |
| `attendance.controller.ts` | `/attendance/leave-types*` (+ `/effective`) |
| `leave-requests.service.ts` | R-PLT-ATT-01 assert via `AttLeaveTypeService` |
| `app.module.ts` | provider `AttLeaveTypeService` |
| Specs | `att-leave-type.service.spec.ts` + leave-requests wire + controller mock |

**must_keep untouched:** `work_shifts` ops · sheet/sign spine · settings-catalogs REF writer · no seed.

---

## 3. Schema / API stamps

| Topic | Stamp |
|-------|--------|
| Physical | `CREATE TABLE IF NOT EXISTS public.att_leave_type` + UQ partial `(company_id, lower(leave_type_key)) WHERE archived_at IS NULL` |
| CHK | slug format · category · status — **FORBIDDEN** `leave_type_key IN (…)` |
| Soft-delete | `POST …/retire` → `status=retired` + `archived_at` — no hard DELETE |
| Effective | ATT native + settings `leave_types` REF; collision → `source=att_override` (ATT wins) |
| Empty | `[]` / soft allow create when effective=0 (U65) |
| Consumer | create leave → `HRM-LEAVE-TYPE-UNKNOWN` when effective >0 and key missing |

### Routes

| Method | Path | F-id |
|--------|------|------|
| GET | `/api/hrm/attendance/leave-types` | F-ATT-CAT-LVT-01 |
| GET | `/api/hrm/attendance/leave-types/effective` | F-ATT-CAT-EFF-01 |
| GET | `/api/hrm/attendance/leave-types/:id` | F-ATT-CAT-LVT-01 |
| POST/PUT | `/api/hrm/attendance/leave-types` | F-ATT-CAT-LVT-02 |
| PATCH | `/api/hrm/attendance/leave-types/:id` | F-ATT-CAT-LVT-02 |
| POST | `/api/hrm/attendance/leave-types/:id/retire` | F-ATT-CAT-LVT-02 |

---

## 4. Verification

```text
pnpm --filter hrm-api exec jest --testPathPatterns="att-leave-type.service.spec|attendance-config.service.spec|leave-requests.service.spec|attendance.controller.spec" --no-coverage
→ Test Suites: 4 passed · Tests: 71 passed
```

| Suite | Result |
|-------|--------|
| `att-leave-type.service.spec.ts` | PASS (ensureSchema · open 9th · EFF ATT wins · scope_parity · retire soft · UNKNOWN) |
| `attendance-config.service.spec.ts` | PASS regression |
| `leave-requests.service.spec.ts` | PASS + R-PLT-ATT-01 wire |
| `attendance.controller.spec.ts` | PASS (AttLeaveTypeService mock) |

---

## 5. completion_report

**Closed:** ensureSchema ADD `public.att_leave_type` per DATA-01; F-ATT-CAT-LVT-01/02 CRUD+retire; F-ATT-CAT-EFF-01 effective union (ATT wins); leave-requests wired to effective catalog (`HRM-LEAVE-TYPE-UNKNOWN`); scope_parity list↔get; open catalog accepts `hr_custom_09`; FORBIDDEN closed enum CHECK; soft-delete only; U65 no seed; work_shifts/sheet/sign untouched.

**Residual:** FE Settings picker (`PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-FE-*`); QA AC-PLT-ATT-01..03 U65 browser; R-PLT-ATT-02 accrual GĐ1.5; ba-docs client API DOC-DELTA.

**Forbidden claims:** ATT UAT-ready · Phase1 DONE · seed as UF evidence.

---

## 6. next_owner / next_dispatch_prompt

**next_owner:** **qa**

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-QA-01
from_role: pm
to_role: qa
lane: execution
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-BE-01
priority: P2

## read_first
1. docs/qa/evidence/po-hrm-dynamic-config-platform-att-be-01.md
2. docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-VERTICAL-SA-01.md §5 AC-PLT-ATT-01..03
3. docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-DATA-01.md §5 VAL-ATT-LVT-*

## task
L1 API smoke (browser-only UF HOLD until FE):
- ensureSchema live: GET /attendance/leave-types?company_id=holding → 200 [] or rows
- POST leave-types hr_custom_09 (or unique key) → 201 → GET list has row → get-by-id same scope
- POST leave-types leaveTypeKey=Annual → 400 HRM-PLT-CAT-CODE-INVALID
- GET leave-types/effective — ATT wins collision if REF+ATT same key
- POST leave-requests with type ∉ effective when catalog>0 → 400 HRM-LEAVE-TYPE-UNKNOWN
- Retire → picker list hides; historical leave_requests key intact
- must_keep: U65 zero-seed · work_shifts · sheet/sign
- Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-att-qa-01.md

## exit
PASS_TO_PM · honesty attendance_uat_ready=false until AC-PLT-ATT browser FE
```

---

## 7. Handoff fields

| Field | Value |
|-------|--------|
| **completion_report** | §5 |
| **next_owner** | **qa** |
| **next_dispatch_prompt** | §6 |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-att-be-01.md` |
| **ack_status** | **READY_FOR_QA** |
| **pm_dispatch_hint** | ATT-BE-01 READY — QA L1 smoke; FE picker HOLD until FE seat |
