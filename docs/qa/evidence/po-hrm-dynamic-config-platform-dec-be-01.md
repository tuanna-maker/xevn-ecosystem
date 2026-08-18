# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-BE-01

| Meta | Value |
|------|-------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-BE-01` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-VERTICAL-SA-01` · DATA-01 · DEC-BA-01 |
| **from_role** | dev-be |
| **to_role** | qa |
| **lane** | execution |
| **ack_status** | **READY_FOR_QA** |
| **date** | 2026-08-07 |
| **change_mode** | **ADD** `hr_decision_type` + F-DEC-CAT-* · **EXPAND** F-CORE-DEC-01/02 flag source |
| **honesty** | All `*_ready` **false** · U65 · no invent decisions/personnel UAT |

---

## 1. spec_read_ack

| Artifact | Sections |
|----------|----------|
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-DATA-01.md` | §2 physical · §2.4 dual SoT · §5 VAL-DEC-CAT/CNS/ALS/SCP |
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-VERTICAL-SA-01.md` | §3 F-DEC-CAT-TYP/EFF · §4 consumer deepen · §6 errors |
| `DB_DESIGN_HRM_ENTERPRISE.md` | §3.11a · §3.11 (client pointer) |
| Peer | `att_leave_type` / `emp_document_type` ensureSchema |
| AS-IS | `decisions.service.ts` PERSON_BOUND_* / WORK_HISTORY_NEO_* → catalog flags when EFF >0 |

---

## 2. Deliverable (apps)

| Path | Change |
|------|--------|
| `hr-decision-type.constants.ts` | Open key format `^[a-zA-Z][a-zA-Z0-9_]*$` · errors · REF key |
| `hr-decision-type.service.ts` | ensureSchema + list/get/upsert/patch/retire + EFF union |
| `dto/hr-decision-type.dto.ts` | List/upsert/patch/effective DTOs |
| `decisions.controller.ts` | `/decisions/decision-types*` (+ `/effective`) before `:decisionId` |
| `decisions.service.ts` | R-PLT-DEC-01: assert ∈ EFF; person-bound/WH/pos from flags; Sets = empty fallback |
| `app.module.ts` | provider `HrDecisionTypeService` |
| Specs | `hr-decision-type.service.spec.ts` (+ consumer wire) |

**must_keep untouched:** create/approve/effective→WH `decision_id` spine · EMP DOC/ET · ATT leave · REC stages · CTR `contract_types` OUT · settings REF partition merge-read · no seed UF.

**solid_convention_ack:** FE–BE boundary display-ready catalog DTOs; consumer assert ∈ effective; typed flags SoT (not free JSON).

---

## 3. Schema / API stamps

| Topic | Stamp |
|-------|--------|
| Physical | `CREATE TABLE IF NOT EXISTS public.hr_decision_type` + UQ partial `(company_id, lower(decision_type_key)) WHERE archived_at IS NULL` |
| CHK | format-only · status · `writes_work_history ⇒ is_person_bound + wh_event_type` — **FORBIDDEN** `decision_type_key IN (…)` / closed CHECK on `hr_decisions.decision_type` |
| Soft-delete | `POST …/retire` → `status=retired` + `archived_at` — no hard DELETE |
| Dual SoT | DEC native + settings `hr_decision_types` REF; collision → `source=dec_override` (tenant wins) |
| Empty | `[]` / soft allow create when effective=0 (BR-PLT-DEC-06 · U65) |
| Consumer | create/patch → `HRM-DEC-TYPE-UNKNOWN` when EFF >0 and key missing; person-bound → `HRM-DEC-EMP-REQUIRED`; WH from `writes_work_history` |

### Routes

| Method | Path | F-id |
|--------|------|------|
| GET | `/api/hrm/decisions/decision-types` | F-DEC-CAT-TYP-01 |
| GET | `/api/hrm/decisions/decision-types/effective` | F-DEC-CAT-EFF-01 |
| GET | `/api/hrm/decisions/decision-types/:id` | F-DEC-CAT-TYP-01 |
| POST/PUT | `/api/hrm/decisions/decision-types` | F-DEC-CAT-TYP-02 |
| PATCH | `/api/hrm/decisions/decision-types/:id` | F-DEC-CAT-TYP-02 |
| POST | `/api/hrm/decisions/decision-types/:id/retire` | F-DEC-CAT-TYP-02 |

---

## 4. Verification

```text
pnpm --filter hrm-api exec jest --testPathPatterns="hr-decision-type.service.spec|decisions.service.spec|po-hrm-e2e-link-emp-be-03|po-hrm-e2e-link-emp-be-01" --no-coverage
→ Test Suites: 4 passed · Tests: 37 passed
```

| Suite | Result |
|-------|--------|
| `hr-decision-type.service.spec.ts` | PASS (ensureSchema · open N+ · HRD_01 · WH flags VAL · EFF DEC wins · scope_parity · retire soft · UNKNOWN · WH-REQUIRED) |
| `decisions.service.spec.ts` | PASS regression |
| `po-hrm-e2e-link-emp-be-03.spec.ts` | PASS (legacy Sets fallback still exported) |
| `po-hrm-e2e-link-emp-be-01.spec.ts` | PASS WH spine regression |

---

## 5. Honesty

| Flag | Value |
|------|-------|
| Decisions / QSĐ module UAT-ready | **false** |
| `hrm_personnel_uat_ready` | **false** |
| `employees_e2e_linkage_ready` | **false** |
| `payroll_e2e_ready` | **false** |
| `attendance_uat_ready` | **false** |
| `recruitment_uat_ready` | **false** |
| `contracts_printable_ready` | **false** |
| Platform / Phase1 DONE | **false** |
| Seed in UF evidence | **forbidden** |

---

## 6. Residual

| ID | Note | Owner |
|----|------|-------|
| R-PLT-DEC-02 | Client API DOC-DELTA F-DEC-CAT-* | ba-docs |
| R-PLT-DEC-FE-01 | Settings picker + QSĐ form bind | **dev-fe** (HOLD until QA L1) |
| R-PLT-DEC-04/05 | FormSchema / MergeToken print | GĐ1.5 / GĐ2 |

---

## 7. Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **READY_FOR_QA** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-dec-be-01.md` |
| **next_owner** | **qa** |
| **completion_report** | ADD `public.hr_decision_type` ensureSchema (open key, partial UQ, soft retire, WH-flag CHK); F-DEC-CAT-TYP/EFF Nest routes; dual SoT DEC wins REF; wire F-CORE-DEC-01/02 to catalog flags (legacy Sets = empty fallback); jest 37 PASS; honesty all false; U65 no seed. |
| **next_dispatch_prompt** | See below |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-QA-01
from_role: pm
to_role: qa
lane: execution
prior: PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-BE-01 READY_FOR_QA
entry_criteria: L0 stack; U65 zero-seed; browser-only for UF; cite evidence docs/qa/evidence/po-hrm-dynamic-config-platform-dec-be-01.md
exit_criteria: L1 jest/API probe VAL-DEC-CAT/CNS class; scope_parity list=get; FORBIDDEN seed; honesty flags remain false; PASS_TO_PM or FAIL with residual
cấm: seed UF · claim decisions UAT · flip *_ready · wipe WH spine
spec_ref: DEC-DATA-01 §5 · DEC-VERTICAL-SA-01 §3–§5 · AC-PLT-DEC-01..06
evidence_path: docs/qa/evidence/po-hrm-dynamic-config-platform-dec-qa-01.md
```
