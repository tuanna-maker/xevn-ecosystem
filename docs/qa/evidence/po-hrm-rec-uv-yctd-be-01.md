# Evidence — PO-HRM-REC-UV-YCTD-BE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-REC-UV-YCTD-BE-01` |
| **role** | dev-be |
| **lane** | execution |
| **change_mode** | ADD · preserve_default |
| **date** | 2026-08-06 |
| **program** | `W-ALL-PARALLEL-01` |
| **parent** | `PO-HRM-REC-UV-YCTD-QA-PLAN-01` PASS_TO_PM |
| **ack_status** | **READY_FOR_QA** |
| **honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · U65 zero-seed · **DENIED** REC-03 / job_postings SoT / module UAT |

---

## spec_read_ack

| Artifact | Cite |
|----------|------|
| **srs** | `SRS_HRM_ENTERPRISE.md` v0.11 · **FR-UC-BP-REC-05a** Diễn biến **#1–#6** + Thành công · **FR-UC-BP-REC-06b** Diễn biến **#1–#6** + Thành công · AC-REC-UV-01..04 · AC-REC-CMP-01..05 |
| **tech_spec** | `docs/program/specs/PO-HRM-REC-UV-YCTD-TECH-01.md` · **F-REC-UV-YCTD-01..05** · **F-REC-CMP-01..02** |
| **db_design** | `docs/program/specs/PO-HRM-REC-UV-YCTD-DB-01.md` **CONFIRMED** · ONE physical soft FK `requisition_id` · alias `recruitment_request_id` · position from YCTD · no CASCADE · no dual FK |
| **api_design** | `docs/program/specs/PO-HRM-REC-UV-YCTD-API-01.md` **CONFIRMED** · REQUIRED/STATUS/NOT-FOUND/MISMATCH/MAX-N/YCTD-MIX · empty 200[] · no silent Lane B |
| **qa_plan** | `docs/qa/evidence/po-hrm-rec-uv-yctd-qa-plan-01.md` §4.4 P0 unit gate |

**cascade unlock:** DB-01 + API-01 + QA-PLAN → this BE wave (narrow only).

**solid_convention_ack:** list/get/create/compare share `resolveHrmListScope` + aliased `company_id` filter (U19 `scope_parity`).

---

## Implemented (narrow)

| Cap | Behavior |
|-----|----------|
| **F-REC-UV-YCTD-01** | `GET /recruitment/requisitions?receivable=true` / `open_for_hire=true` → only open/approved/open_for_hire; empty → `{ items: [], data: [], total: 0 }` |
| **F-REC-UV-YCTD-02** | `GET /requisitions/:id?for=uv` → `UvPositionDisplay`; non-receivable → `HRM-REC-UV-YCTD-STATUS`; OOS → `HRM-REC-UV-YCTD-NOT-FOUND` |
| **F-REC-UV-YCTD-03** | `POST /candidates` — YCTD **REQUIRED**; STATUS/NOT-FOUND/MISMATCH; alias `recruitment_request_id`; position derive `source:'yctd'`; free-text `position` ignored as SoT |
| **No silent Lane B** | Missing YCTD → `HRM-REC-UV-YCTD-REQUIRED` (not CP-201). Explicit Lane B → **`POST /candidates-pool`** |
| **F-REC-UV-YCTD-05** | List/get candidates display-ready YCTD id (+ alias) + position derived |
| **F-REC-CMP-01** | `GET /recruitment/applications?requisition_id=&include=evals` — empty 200[]; eval_status none / «chưa đánh giá» |
| **F-REC-CMP-02** | `GET /recruitment/compare?requisition_id=&candidate_ids=` — MAX-N (4) · YCTD-MIX |
| **Alias** | `recruitment_request_id` ↔ `requisition_id` (ONE physical); ambiguous dual → `HRM-REC-UV-YCTD-ALIAS` |

### Files touched

- `apps/api/hrm-api/src/recruitment/uv-yctd-bind.ts` **(ADD)**
- `apps/api/hrm-api/src/recruitment/dto/compare-candidates.query.dto.ts` **(ADD)**
- `apps/api/hrm-api/src/recruitment/dto/list-applications.query.dto.ts` **(ADD)**
- `apps/api/hrm-api/src/recruitment/dto/create-candidate.dto.ts`
- `apps/api/hrm-api/src/recruitment/dto/list-job-requisitions.query.dto.ts`
- `apps/api/hrm-api/src/recruitment/dto/get-job-requisition.query.dto.ts`
- `apps/api/hrm-api/src/recruitment/dto/list-candidates.query.dto.ts`
- `apps/api/hrm-api/src/recruitment/recruitment.service.ts`
- `apps/api/hrm-api/src/recruitment/recruitment.controller.ts`
- `apps/api/hrm-api/src/recruitment/po-hrm-rec-uv-yctd-be-01.spec.ts` **(ADD)**
- `apps/api/hrm-api/src/recruitment/recruitment.controller.spec.ts`
- `apps/api/hrm-api/src/recruitment/recruitment.service.spec.ts`

`code_memory_required: true` — APPEND on helper / service / controller / DTOs.

---

## must_keep / FORBIDDEN (verified)

| Rule | Status |
|------|--------|
| ONE physical soft FK `requisition_id` | Kept — alias only |
| No CASCADE delete | Soft FK kept |
| FORBIDDEN `job_postings` UV/compare SoT | UT-12 / CMP-07 assert zero `job_postings` SQL |
| FORBIDDEN silent Lane B on POST /candidates | UT-04 / UT-13 |
| FORBIDDEN REC-03 / seed / recruitment_uat_ready | Not claimed |
| N–N UT-REC-UV-14 | **Deferred P1** (physical N–N not in this MVP — Lane A 1:1 spine) |

---

## Jest evidence

```bash
pnpm --filter hrm-api exec jest --testPathPatterns="po-hrm-rec-uv-yctd-be-01|recruitment.controller.spec|recruitment.service.spec" --verbose
# Regression: po-hrm-jd-yctd-ref-be-01 · po-e2e-spine-01-be-cand-dto · p1-phase1-be-rec-patch
```

| Suite | Result |
|-------|--------|
| `po-hrm-rec-uv-yctd-be-01.spec.ts` | **PASS** |
| `recruitment.controller.spec.ts` | **PASS** |
| `recruitment.service.spec.ts` | **PASS** |
| JD-YCTD + spine DTO + rec-patch regression | **PASS** (24) |

**P0 gate map (QA plan §4.4):**

- UT-REC-UV-01..07, 08..10, 12..13 — green
- UT-REC-CMP-01..03, 06..07 — green (CMP-04/05 covered via applications include=evals + compare rows `eval_status:none`)
- IT-REC-UV-SP-01..02 — green

**Note:** Browser UF / `J-HRM-REC-UV-01` / `J-HRM-REC-CMP-01` **not** claimed PASS from unit alone (U65).

---

## Residual

| ID | Item | Owner |
|----|------|-------|
| R-UV-YCTD-FE | Thêm UV YCTD SELECT + position derived + surface error codes | **dev-fe** `PO-HRM-REC-UV-YCTD-FE-01` (parallel) |
| R-UV-YCTD-CMP-FE | Already READY_FOR_QA — wire to BE compare routes | FE peer / QA-02 |
| R-UV-YCTD-POOL-FE | Point `createCandidatePool` → `POST /candidates-pool` (no silent dual-route) | **dev-fe** |
| R-UV-YCTD-QA | Browser U65 after FE READY | **qa** `PO-HRM-REC-UV-YCTD-QA-01` / `QA-02` |
| R-UV-YCTD-NN | N–N application physical UT-14 | defer P1 |

---

## Completion / handoff

| Field | Value |
|-------|--------|
| **completion_report** | Narrow BE ADD complete: receivable list empty 200[]; bind STATUS; create REQUIRED/NOT-FOUND/MISMATCH/alias/position derive; no silent Lane B (+ explicit POST candidates-pool); list/get display-ready; GET applications + GET compare MAX-N/YCTD-MIX; jest P0 UT-REC-UV + UT-REC-CMP + IT-SP green. No job_postings SoT. No dual FK. Honesty false. |
| **next_owner** | **qa** (after FE READY) — or PM hold until FE handoff; CMP-FE already READY |
| **next_dispatch_prompt** | See below |
| **evidence_path** | `docs/qa/evidence/po-hrm-rec-uv-yctd-be-01.md` |
| **ack_status** | **READY_FOR_QA** |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-REC-UV-YCTD-QA-01 (+ QA-02 when FE+CMP-FE READY)
from_role: pm
to_role: qa
entry_criteria: BE READY_FOR_QA (this evidence) · FE-01 READY · CMP-FE-01 READY · L0 stack · U65 zero-seed
exit_criteria: Browser UF-REC-UV-01..08 + J-HRM-REC-UV-01; UF-REC-CMP-01..06 + J-HRM-REC-CMP-01; FE sau 2xx + F5; cấm seed; recruitment_uat_ready=false
evidence_path: docs/qa/evidence/po-hrm-rec-uv-yctd-qa-01.md
ref: docs/qa/evidence/po-hrm-rec-uv-yctd-qa-plan-01.md §5 · BE evidence po-hrm-rec-uv-yctd-be-01.md
```
