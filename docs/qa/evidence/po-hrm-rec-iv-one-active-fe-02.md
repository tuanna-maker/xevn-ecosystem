# Evidence — PO-HRM-REC-IV-ONE-ACTIVE-FE-02

| Field | Value |
|-------|-------|
| **work_item_id** | `PO-HRM-REC-IV-ONE-ACTIVE-FE-02` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **lane** | `execution` |
| **change_mode** | `FIX narrow` |
| **parent** | `PO-HRM-REC-IV-ONE-ACTIVE-QA-01` FAIL |
| **ack_status** | `READY_FOR_QA` |
| **spec_ref** | `PO-HRM-REC-IV-ONE-ACTIVE-SA-01.md` §3.3 §4 · `FR-UC-BP-REC-06a` |
| **recruitment_uat_ready** | **false** (locked) |

## Root cause (QA residuals closed)

| Residual | Fix |
|----------|-----|
| `FE-WIRE-POOL-ACTIVE-PROJECTION` | `CandidatesTab.fetchCandidates` parallel-fetches `listCandidatesPool` + `listRecruitmentCandidates` rollup; merges `active_interview` onto pool rows by normalized email via `mergeActiveInterviewOntoPoolCandidates` |
| `FE-SCHEDULE-LANE-B-vs-A` | `ScheduleInterviewDialog` calls `scheduleRecruitmentInterview` (Lane A); resolves spine `candidate_id` by email via `resolveSpineRecruitmentCandidateId`; removed `createInterviewCatalog` bypass |

## Changed files

- `apps/web/hrm/src/components/recruitment/candidateActiveInterview.ts` — merge helpers
- `apps/web/hrm/src/components/recruitment/CandidatesTab.tsx` — dual fetch + merge
- `apps/web/hrm/src/components/recruitment/ScheduleInterviewDialog.tsx` — Lane A schedule wire
- `apps/web/hrm/src/integrations/hrmApi.ts` — `HrmRecruitmentCandidate.active_interview`, `resolveSpineRecruitmentCandidateId`, normalize company_id on list
- `apps/web/hrm/src/components/recruitment/candidateActiveInterview.test.ts`
- `apps/web/hrm/src/components/recruitment/CandidatesTab.source.test.ts`
- `apps/web/hrm/src/components/recruitment/ScheduleInterviewDialog.source.test.ts`

## Preserved

- `data-testid=candidate-active-interview-badge`
- `data-testid=candidate-active-interview-time`
- `toErrorMessage` map for `HRM-REC-IV-409-ACTIVE`
- Pool mutate paths (stage/delete/import) unchanged

## Test evidence

Command:

```bash
pnpm test -- candidateActiveInterview.test.ts CandidatesTab.source.test.ts apiError.recruitment-interview.test.ts ScheduleInterviewDialog.source.test.ts
```

Result (2026-08-06):

- 4 test files passed
- **13/13** tests passed
- 0 failed

## QA browser matrix (retest after BE-02 DTO)

Persona: `ceo@xe.vn` / `Xevn@2026` · `company_id=main`  
URL: `/command-center/hrm/recruitment?tab=candidates&companyId=main&tenantId=xevn`

1. Pool row whose email matches Lane A spine row with ACTIVE interview → badge + time visible; F5 persists.
2. Schedule dialog → duplicate ACTIVE → toast contains `HRM-REC-IV-409-ACTIVE` friendly message (requires `PO-HRM-REC-IV-ONE-ACTIVE-BE-02` DTO slug fix).
3. Pool-only email (no spine row) → schedule shows sync error before POST (no silent catalog bypass).

## Residual (not FE)

- `BE-DTO-SCHEDULE-IV-COMPANY-SLUG` — HTTP POST interview still blocked until dev-be-02; FE Lane A wire ready.
- Email merge assumes pool ↔ spine same email; cross-lane id mismatch handled by email key only.

---

## completion_report

Đã sửa P0 projection: UI list vẫn dùng pool nhưng nhận `active_interview` từ Lane A `listRecruitmentCandidates` rollup (merge email). P1: dialog chuyển sang `scheduleRecruitmentInterview` + resolve spine id; bỏ catalog path bypass one-active. Vitest 13/13 PASS. Không seed, không claim `recruitment_uat_ready`.

## next_owner

`qa` (sau BE-02 DTO nếu cần full 409 HTTP path)

## next_dispatch_prompt

```text
work_item_id: PO-HRM-REC-IV-ONE-ACTIVE-QA-02
from_role: pm
to_role: qa
lane: execution
change_mode: VERIFY-only
read_first:
  - docs/qa/evidence/po-hrm-rec-iv-one-active-fe-02.md
  - docs/qa/evidence/po-hrm-rec-iv-one-active-be-02.md (when READY)
  - docs/program/specs/PO-HRM-REC-IV-ONE-ACTIVE-SA-01.md §3.3 §4
entry_criteria:
  - BE-02 READY (slug company_id on POST interview) OR QA documents BLOCKED on BE only
  - FE-02 READY_FOR_QA
task:
  - Browser U65: badge visible when spine ACTIVE + pool email match
  - Schedule duplicate ACTIVE → 409 toast via toErrorMessage (Lane A)
  - F5 persistence after successful schedule
  - No seed; recruitment_uat_ready stays false
exit_criteria:
  - evidence docs/qa/evidence/po-hrm-rec-iv-one-active-qa-02.md PASS_TO_PM or FAIL with layer
ack_status_target: PASS_TO_PM
```

## evidence_path

`docs/qa/evidence/po-hrm-rec-iv-one-active-fe-02.md`

## ack_status

**READY_FOR_QA**
