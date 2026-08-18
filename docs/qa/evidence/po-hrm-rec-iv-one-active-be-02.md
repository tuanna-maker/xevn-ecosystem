# Evidence — PO-HRM-REC-IV-ONE-ACTIVE-BE-02

| Field | Value |
|---|---|
| work_item_id | `PO-HRM-REC-IV-ONE-ACTIVE-BE-02` |
| from_role | `dev-be` |
| to_role | `qa` |
| lane | `execution` |
| change_mode | `FIX narrow` |
| parent | `PO-HRM-REC-IV-ONE-ACTIVE-QA-01` FAIL (`BE-DTO-SCHEDULE-IV-COMPANY-SLUG`) |
| ack_status | `READY_FOR_QA` |
| spec_ref | `docs/program/specs/PO-HRM-REC-IV-ONE-ACTIVE-SA-01.md` §3 · `SRS_HRM_ENTERPRISE.md` FR-UC-BP-REC-06a |

## Root cause (QA-01)

`ScheduleInterviewDto.company_id` used `@IsUUID()` while HRM scope uses slug (`main` / `holding`). HTTP `POST /recruitment/interviews` failed **400** `HRM-VAL-001` before service one-active gate could return **409** `HRM-REC-IV-409-ACTIVE`.

## Fix applied

| Change | Detail |
|--------|--------|
| DTO | `ScheduleInterviewDto.company_id`: `@IsUUID()` → `@IsString()` `@MaxLength(80)` — aligned with `CreateCandidateDto` |
| HTTP spec | `po-hrm-rec-iv-one-active-be-02.spec.ts` — ValidationPipe + supertest POST with `company_id=holding` |
| Invariant | **Preserved** — no service/DDL change; one-active logic unchanged from BE-01 |

## Tests executed

```bash
pnpm --filter hrm-api test -- recruitment.service.spec.ts po-hrm-rec-iv-one-active-be-02.spec.ts
```

| Suite | Result |
|-------|--------|
| `recruitment.service.spec.ts` | **12/12 PASS** (regression) |
| `po-hrm-rec-iv-one-active-be-02.spec.ts` | **4/4 PASS** |

### New HTTP coverage (BE-02)

| Case | HTTP | Code | Not |
|------|-----:|------|-----|
| Slug `holding` + valid candidate → create | 201 | `HRM-REC-203` | `HRM-VAL-001` |
| Slug `holding` + active conflict | 409 | `HRM-REC-IV-409-ACTIVE` | `HRM-VAL-001` |
| DTO accepts `holding` / `main` | — | validateSync 0 errors | UUID-only |
| DTO rejects slug > 80 chars | — | validation error | — |

## Files touched

- `apps/api/hrm-api/src/recruitment/dto/schedule-interview.dto.ts`
- `apps/api/hrm-api/src/recruitment/po-hrm-rec-iv-one-active-be-02.spec.ts` (new)

## Residual (not in BE-02 scope)

| ID | Owner | Note |
|----|-------|------|
| `FE-WIRE-POOL-ACTIVE-PROJECTION` | dev-fe | Pool list path lacks `active_interview` projection |
| `FE-SCHEDULE-LANE-B-vs-A` | dev-fe | Schedule dialog uses catalog Lane B |

## completion_report

Đã sửa DTO validation `ScheduleInterviewDto.company_id` chấp nhận slug scope (`holding`/`main`, max 80) khớp `CreateCandidateDto`. Thêm HTTP-level spec xác nhận POST không còn **400 HRM-VAL-001** trên slug; trả **201 HRM-REC-203** hoặc **409 HRM-REC-IV-409-ACTIVE**. Regression service **12/12 PASS**. Không đụng DDL/seed/invariant service.

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: PO-HRM-REC-IV-ONE-ACTIVE-QA-02
from_role: pm
to_role: qa
lane: execution
change_mode: verify-only
read_first:
  - docs/qa/evidence/po-hrm-rec-iv-one-active-be-02.md
  - docs/qa/evidence/po-hrm-rec-iv-one-active-qa-01.md (prior FAIL matrix)
entry_criteria:
  - BE-02 READY_FOR_QA merged / hrm-api restarted on :28001
  - U65 zero-seed · browser-only for UF claims
task:
  - Retest AC-1: POST /api/hrm/recruitment/interviews company_id=holding|main + valid candidate → 201 or 409 HRM-REC-IV-409-ACTIVE (NOT 400 HRM-VAL-001)
  - Retest AC-2: cancel/completed → create new interview via HTTP
  - Retest AC-3/4 per QA-01 matrix (pool projection still FE residual unless FE-02 done)
  - Persona ceo@xe.vn · company_id=main rollup
exit_criteria:
  - evidence docs/qa/evidence/po-hrm-rec-iv-one-active-qa-02.md
  - ack_status PASS_TO_PM or FAIL_TO_PM with residual owner
cấm: pnpm seed:* · claim recruitment_uat_ready without L2.5 browser
```

## evidence_path

- `docs/qa/evidence/po-hrm-rec-iv-one-active-be-02.md`

## ack_status

**READY_FOR_QA**
