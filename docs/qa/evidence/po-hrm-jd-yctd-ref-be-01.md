# Evidence — PO-HRM-JD-YCTD-REF-BE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-JD-YCTD-REF-BE-01` |
| **role** | dev-be |
| **lane** | execution |
| **change_mode** | ADD |
| **date** | 2026-08-06 |
| **ack_status** | **READY_FOR_QA** |
| **honesty** | **DENIED:** `jd_dynamic_done` · campaign / `job_postings` SoT · seed for UF · full JD remaster · product GO |

---

## spec_read_ack

| Artifact | Cite |
|----------|------|
| **srs** | `SRS_HRM_ENTERPRISE.md` v0.10 · **FR-UC-BP-REC-02** / **02b** Diễn biến **1a–1d** · Thành công FE |
| **tech_spec** | `docs/program/specs/PO-HRM-JD-YCTD-REF-TECHSPEC-01.md` · **F-YCTD-JD-01..05** |
| **db_design** | `docs/program/specs/PO-HRM-JD-YCTD-REF-DB-01.md` **CONFIRMED** · ONE physical soft FK `job_requisitions.job_template_id` · alias `job_description_id` · no CASCADE |
| **api_design** | `docs/program/specs/PO-HRM-JD-YCTD-REF-API-01.md` **CONFIRMED** · STATUS/REQUIRED/NOT-FOUND · empty 200[] · preview ≠ `values_json` |
| **qa_plan** | `docs/qa/evidence/po-hrm-jd-yctd-ref-qa-plan-01.md` §3 UT-YCTD-JD-01..12 · IT-YCTD-JD-SP-01..02 · §7 allowed_paths · §12 |

**cascade unlock:** SPEC + TechSpec + DB-01 + API-01 + QA-PLAN-01 → this BE wave (narrow only).

---

## Implemented (narrow)

| Cap | Behavior |
|-----|----------|
| **F-YCTD-JD-01** | `GET /recruitment/job-templates?bindable=true` / `for=yctd` → Hiệu lực only; thin items; empty → `{ items: [], data: [], total: 0 }` |
| **F-YCTD-JD-02** | `GET /recruitment/job-templates/:id?preview=yctd` → `YctdJdPreview`; non-active → `HRM-JD-YCTD-STATUS`; out-of-scope → `HRM-JD-YCTD-NOT-FOUND` |
| **F-YCTD-JD-03** | `POST /recruitment/requisitions` — REQUIRED bind; STATUS/NOT-FOUND gates; soft FK + optional snapshot text; **no** `values_json` / `job_postings` write |
| **F-YCTD-JD-04** | PATCH re-bind on draft/rejected/open/on_hold; Ngừng → STATUS; approved+ → `HRM-JD-YCTD-REBIND-LOCKED` 409 |
| **F-YCTD-JD-05** | List/get join `jd_code`/`jd_title`; response alias `job_description_id` = `job_template_id`; history after retire kept (LEFT JOIN) |
| **Alias** | `job_description_id` ↔ `job_template_id` (ONE physical); ambiguous dual → `HRM-JD-YCTD-ALIAS` |

### Files touched

- `apps/api/hrm-api/src/recruitment/yctd-jd-bind.ts` **(ADD)**
- `apps/api/hrm-api/src/recruitment/recruitment-catalog.service.ts`
- `apps/api/hrm-api/src/recruitment/recruitment.service.ts`
- `apps/api/hrm-api/src/recruitment/recruitment.controller.ts`
- `apps/api/hrm-api/src/recruitment/dto/create-job-requisition.dto.ts`
- `apps/api/hrm-api/src/recruitment/dto/update-job-requisition.dto.ts`
- `apps/api/hrm-api/src/recruitment/po-hrm-jd-yctd-ref-be-01.spec.ts` **(ADD)**

`code_memory_required: true` — APPEND on catalog / service / controller / DTOs / helper.

---

## must_keep / FORBIDDEN (verified)

| Rule | Status |
|------|--------|
| ONE physical soft FK `job_template_id` | Kept — no second column |
| F-REC-YCTD plan / out_of_plan stubs | Untouched |
| No CASCADE delete | Soft FK + LEFT JOIN history |
| FORBIDDEN `job_postings` JD SoT | UT-09 asserts zero `job_postings` SQL on create |
| FORBIDDEN campaign unlock / full JD remaster / seed | Not in diff |

---

## Jest evidence

```bash
pnpm --filter hrm-api exec jest --testPathPatterns="po-hrm-jd-yctd-ref-be-01" --verbose
# + regression: recruitment.service.spec · p1-phase1-be-rec-patch · p1-web-acceptance-rec-patch
```

| Suite | Result |
|-------|--------|
| `po-hrm-jd-yctd-ref-be-01.spec.ts` | **PASS** (UT-01..12 + IT-SP-01..02) |
| `recruitment.service.spec.ts` | **PASS** |
| `p1-phase1-be-rec-patch.spec.ts` | **PASS** |
| `p1-web-acceptance-rec-patch-notes.spec.ts` | **PASS** |

**Case map:** UT-YCTD-JD-01..12 · IT-YCTD-JD-SP-01 · IT-YCTD-JD-SP-02 — all green in unit/integration mock scope.

**Note:** Browser UF / `J-HRM-JD-YCTD-01` **not** claimed PASS from unit alone (U65).

---

## Residual

| ID | Item | Owner |
|----|------|-------|
| R-YCTD-JD-FE | Picker + preview + FE sau 2xx/F5 | **dev-fe** `PO-HRM-JD-YCTD-REF-FE-01` (parallel) |
| R-YCTD-JD-QA | Browser U65 after FE READY | **qa** `PO-HRM-JD-YCTD-REF-QA-01` |

---

## Completion / handoff

| Field | Value |
|-------|--------|
| **completion_report** | Narrow BE ADD complete: bindable list Hiệu lực; preview/create/patch STATUS·REQUIRED·NOT-FOUND; alias DTO ONE physical; display-ready jd_code/title; jest UT-01..12 + IT-SP-01..02 green. No campaign/job_postings SoT. No migrate invent second FK. |
| **next_owner** | **qa** (after FE also READY_FOR_QA) — or PM hold until FE handoff |
| **evidence_path** | `docs/qa/evidence/po-hrm-jd-yctd-ref-be-01.md` |
| **ack_status** | **READY_FOR_QA** |
