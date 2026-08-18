# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-BE-01

| Meta | Value |
|------|-------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-BE-01` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-VERTICAL-SA-01` · DATA-01 |
| **resume_chunk** | K6.2c |
| **from_role** | dev-be |
| **to_role** | qa |
| **lane** | execution |
| **ack_status** | **READY_FOR_QA** |
| **date** | 2026-08-07 |
| **change_mode** | **ADD** `rec_pipeline_stage` + F-REC-CAT-* · **EXPAND** F-REC-APP-02 effective assert |
| **honesty** | `recruitment_uat_ready=false` · `payroll_e2e_ready=false` · no Phase1 DONE · U65 |

---

## 1. spec_read_ack

| Artifact | Sections |
|----------|----------|
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-DATA-01.md` | §2 physical · §2.5 dual/ops · §5 VAL-REC-STG-* |
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-VERTICAL-SA-01.md` | §3 F-REC-CAT-STG-01/02 · F-REC-CAT-EFF-01 · APP-02 wire |
| `DB_DESIGN_HRM_ENTERPRISE.md` | §2.4a · §2.5–2.6 |
| `po-hrm-dynamic-config-platform-rec-data-01.md` | unlock ensureSchema |
| Peer pattern | `att-leave-type.service.ts` open catalog ensureSchema |
| Consumer AS-IS | `RecruitmentCatalogService.updateCandidateApplicationStage` · pool stage |

---

## 2. Deliverable (apps)

| Path | Change |
|------|--------|
| `rec-pipeline-stage.constants.ts` | Open key format · errors · starter docs-only |
| `rec-pipeline-stage.service.ts` | ensureSchema + list/get/upsert/patch/retire + effective + assert |
| `dto/rec-pipeline-stage.dto.ts` | List/upsert/patch/effective query DTOs |
| `recruitment.controller.ts` | `/recruitment/pipeline-stages*` (+ `/effective`) |
| `recruitment-catalog.service.ts` | F-REC-APP-02 assert via `RecPipelineStageService` |
| `hire-employee-link.ts` | `isHiredStage(stage, hiredOutcomeKey?)` |
| `app.module.ts` | provider `RecPipelineStageService` |
| Specs | `rec-pipeline-stage.service.spec.ts` · `rec-pipeline-stage.app02-wire.spec.ts` + controller/IV mocks |

**must_keep untouched:** JD DnD / `rec_jd_*` · IV one-active · hire→EMP soft · YCTD · U65 no seed · no closed `stage_key IN (six)`.

---

## 3. Schema / API stamps

| Topic | Stamp |
|-------|--------|
| Physical | `CREATE TABLE IF NOT EXISTS public.rec_pipeline_stage` |
| UQ active | `(company_id, lower(stage_key)) WHERE archived_at IS NULL` |
| UQ hired | `(company_id) WHERE is_hired_outcome AND archived_at IS NULL` |
| CHK | slug format · status · flags (hired⇒terminal; ¬hired∧reject) — **FORBIDDEN** `stage_key IN (…)` |
| Soft-delete | `POST …/retire` → `status=retired` + `archived_at` — no hard DELETE |
| Sole hired retire | `412 HRM-REC-STG-HIRED-REQUIRED` |
| Effective | Active tenant rows + `hiredOutcomeKey` (GĐ1 no XBOS REF) |
| Empty | `[]` / soft allow transition when effective=0 (U65) |
| Consumer | APP-02 → `HRM-REC-STAGE-UNKNOWN` when effective >0 and key missing |
| Ops map | `wf_task_type_key` optional — **≠** second catalog |

### Routes

| Method | Path | F-id |
|--------|------|------|
| GET | `/api/hrm/recruitment/pipeline-stages` | F-REC-CAT-STG-01 |
| GET | `/api/hrm/recruitment/pipeline-stages/effective` | F-REC-CAT-EFF-01 |
| GET | `/api/hrm/recruitment/pipeline-stages/:id` | F-REC-CAT-STG-01 |
| POST/PUT | `/api/hrm/recruitment/pipeline-stages` | F-REC-CAT-STG-02 |
| PATCH | `/api/hrm/recruitment/pipeline-stages/:id` | F-REC-CAT-STG-02 |
| POST | `/api/hrm/recruitment/pipeline-stages/:id/retire` | F-REC-CAT-STG-02 |

---

## 4. Verification

```text
pnpm --filter hrm-api exec jest --testPathPatterns="rec-pipeline-stage|recruitment.controller.spec|po-hrm-rec-iv-one-active-be-02|hire-employee-link.spec" --no-coverage
→ Test Suites: 5 passed · Tests: 48 passed
```

| Suite | Result |
|-------|--------|
| `rec-pipeline-stage.service.spec.ts` | PASS (ensureSchema · open 7th · hired UQ/flags · scope_parity · retire · UNKNOWN · EFF hiredOutcomeKey) |
| `rec-pipeline-stage.app02-wire.spec.ts` | PASS (APP-02 UNKNOWN · empty soft-allow · pool wire · isHiredStage key) |
| `recruitment.controller.spec.ts` | PASS (RecPipelineStageService mock) |
| `po-hrm-rec-iv-one-active-be-02.spec.ts` | PASS regression |
| `hire-employee-link.spec.ts` | PASS regression |

---

## 5. completion_report

**Closed:** ensureSchema ADD `public.rec_pipeline_stage` per DATA-01; F-REC-CAT-STG-01/02 CRUD+retire; F-REC-CAT-EFF-01 + `hiredOutcomeKey`; F-REC-APP-02 wired (`HRM-REC-STAGE-UNKNOWN`); scope_parity list↔get; open catalog accepts `hr_custom_stage_07`; FORBIDDEN closed enum CHECK; soft-delete only; `wf_task_type_key` ops-only; U65 no seed; JD/IV/hire/YCTD untouched.

**Residual:** FE Settings/REC CFG picker (`PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-FE-*`); QA AC-PLT-REC-02..05 U65 browser; ba-docs client API DOC-DELTA if not already stamped.

**Forbidden claims:** recruitment UAT-ready · payroll_e2e_ready · Phase1 DONE · seed as UF evidence.

---

## 6. next_owner / next_dispatch_prompt

**next_owner:** **qa**

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-QA-01
from_role: pm
to_role: qa
lane: execution
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-BE-01
priority: P2

## read_first
1. docs/qa/evidence/po-hrm-dynamic-config-platform-rec-be-01.md
2. docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-VERTICAL-SA-01.md §5 AC-PLT-REC-02..05
3. docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-DATA-01.md §5 VAL-REC-STG-*

## task
L1 API smoke (browser-only UF HOLD until FE):
- ensureSchema live: GET /recruitment/pipeline-stages?company_id=holding → 200 [] or rows
- POST pipeline-stages hr_custom_stage_07 (unique) → 201 → GET list has row → get-by-id same scope
- POST stageKey=Interview → 400 HRM-PLT-CAT-CODE-INVALID
- GET pipeline-stages/effective — hiredOutcomeKey when is_hired_outcome present
- PATCH candidate-applications/:id/stage with to_stage ∉ effective when catalog>0 → 400 HRM-REC-STAGE-UNKNOWN
- Retire non-hired → picker list hides; historical application.stage intact
- Second is_hired_outcome → 409 HRM-REC-STG-HIRED-DUP
- must_keep: U65 zero-seed · JD DnD · IV one-active · hire→EMP · YCTD
- Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-rec-qa-01.md
- Honesty: recruitment_uat_ready=false · payroll_e2e_ready=false

## exit
PASS_TO_PM with AC matrix; FAIL → residual + pm_dispatch_hint
```

---

## 7. Handoff packet

| Field | Value |
|-------|--------|
| work_item_id | PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-BE-01 |
| from_role | dev-be |
| to_role | qa |
| entry_criteria | BE jest PASS · ensureSchema SQL present |
| exit_criteria | L1 VAL-REC-STG + APP-02 UNKNOWN smoke · evidence path |
| evidence_path | docs/qa/evidence/po-hrm-dynamic-config-platform-rec-be-01.md |
| needed_by | same-day wave |
| ack_status | **READY_FOR_QA** |
| next_owner | qa |
| next_dispatch_prompt | (copy §6) |
