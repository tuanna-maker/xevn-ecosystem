# Evidence — PO-HRM-REC-IV-ONE-ACTIVE-BE-01

| Field | Value |
|---|---|
| work_item_id | `PO-HRM-REC-IV-ONE-ACTIVE-BE-01` |
| from_role | `dev-be` |
| to_role | `qa` |
| lane | `execution` |
| change_mode | `ADD-only narrow` |
| ack_status | `READY_FOR_QA` |
| spec_ref | `docs/program/specs/PO-HRM-REC-IV-ONE-ACTIVE-SA-01.md` §2 §3 §5 · `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` FR-UC-BP-REC-06a |

## Scope completed

- Enforced one-active invariant on interview create/update using active-status gate (`scheduled`, `confirmed`) plus DB unique partial index (`uniq_recruitment_interviews_active_candidate`) for race safety.
- Returned deterministic conflict `409` with code `HRM-REC-IV-409-ACTIVE` and stable details payload when candidate already has an active interview.
- Kept scope parity for mutate/list paths via same scope resolution approach (`resolveHrmListScope` + `pushCompanyIdFilter`).
- Added candidate list projection `active_interview` display-ready fields for FE badge and vi-VN datetime formatting fallback-safe (`—`).

## Tests executed

```bash
pnpm --filter hrm-api test -- recruitment.service.spec.ts
```

Result:

- Test Suites: `1 passed`
- Tests: `12 passed`

## Added test coverage

- Conflict on create when active interview exists (`HRM-REC-IV-409-ACTIVE`).
- Create remains allowed after terminal lane (cancel/complete path gate via active-only filter).
- Candidate list includes `active_interview` projection fields for FE badge/time display-ready.

## Files touched

- `apps/api/hrm-api/src/recruitment/recruitment.service.ts`
- `apps/api/hrm-api/src/recruitment/recruitment.service.spec.ts`
- `apps/api/hrm-api/src/recruitment/dto/update-interview-status.dto.ts`

## completion_report

Đã hoàn thành implementation BE hẹp cho invariant “mỗi ứng viên chỉ có 1 interview ACTIVE” tại create/update, thêm deterministic error 409 chuẩn `HRM-REC-IV-409-ACTIVE`, và trả projection display-ready cho list ứng viên. Residual: chưa mở lane FE render badge/UX và chưa chạy browser-flow U65 (thuộc QA/FE wave).

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: PO-HRM-REC-IV-ONE-ACTIVE-QA-01
from_role: pm
to_role: qa
lane: execution
change_mode: verify-only
read_first:
1) docs/qa/evidence/po-hrm-rec-iv-one-active-be-01.md
2) docs/program/specs/PO-HRM-REC-IV-ONE-ACTIVE-SA-01.md §3 §5
3) docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-REC-06a
entry_criteria:
- BE branch includes one-active invariant + deterministic 409 + active_interview projection
task:
- Verify API deterministic conflict: create interview when ACTIVE exists returns 409 code HRM-REC-IV-409-ACTIVE with details
- Verify cancel/completed terminal then create new interview succeeds
- Verify candidate list response has active_interview fields:
  has_active_interview, active_interview_status, active_interview_at, active_interview_display_time_vi_vn, active_interview_badge_label
- Verify no scope parity regression for group CEO company_id=main on list/get/mutate path
exit_criteria:
- QA evidence with request/response samples + verdict per AC
- ack_status: PASS_TO_PM
evidence_path:
- docs/qa/evidence/po-hrm-rec-iv-one-active-qa-01.md
```
