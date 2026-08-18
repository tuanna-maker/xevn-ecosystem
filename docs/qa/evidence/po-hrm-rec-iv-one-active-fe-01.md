# Evidence — PO-HRM-REC-IV-ONE-ACTIVE-FE-01

- work_item_id: `PO-HRM-REC-IV-ONE-ACTIVE-FE-01`
- from_role: `dev-fe`
- to_role: `qa`
- lane: `execution`
- change_mode: `ADD-only narrow`
- ack_status: `READY_FOR_QA`
- spec_ref:
  - `docs/program/specs/PO-HRM-REC-IV-ONE-ACTIVE-SA-01.md` §3.3 §4 §7
  - `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` `FR-UC-BP-REC-06a`

## Scope delivered

1. Candidate list now renders ACTIVE interview badge from BE projection fields only (no client-side ACTIVE inference).
2. Badge time shows vi-VN datetime `dd/MM/yyyy HH:mm`; fallback `—` for null/invalid value.
3. Schedule interview create flow now maps `HRM-REC-IV-409-ACTIVE` to explicit business toast guidance.
4. Schedule success in candidate list now triggers immediate refetch via `onSuccess={fetchCandidates}` for persistence check.

## Changed files

- `apps/web/hrm/src/components/recruitment/candidateActiveInterview.ts`
- `apps/web/hrm/src/components/recruitment/CandidatesTab.tsx`
- `apps/web/hrm/src/integrations/hrmApi.ts`
- `apps/web/hrm/src/lib/apiError.ts`
- `apps/web/hrm/src/components/recruitment/candidateActiveInterview.test.ts`
- `apps/web/hrm/src/components/recruitment/CandidatesTab.source.test.ts`
- `apps/web/hrm/src/lib/apiError.recruitment-interview.test.ts`

## Test evidence

Command:

`pnpm test -- candidateActiveInterview.test.ts CandidatesTab.source.test.ts apiError.recruitment-interview.test.ts`

Result:

- 3 test files passed
- 7 tests passed
- 0 failed

## completion_report

Đã hoàn tất FE slice one-active theo spec: badge “Đã có lịch” và datetime lấy từ BE projection, fallback an toàn `—`, xử lý lỗi 409 one-active rõ nghĩa trong create flow, và wiring refetch sau tạo lịch để hỗ trợ kiểm tra persistence. Không đụng seed, không claim `recruitment_uat_ready`, không mở scope REC-03.

Residual: Chưa có browser U65 acceptance trong seat FE này; cần QA chạy flow thực tế list -> create -> 409 -> F5 theo matrix.

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: PO-HRM-REC-IV-ONE-ACTIVE-QA-01
from_role: pm
to_role: qa
lane: execution
change_mode: VERIFY-only
read_first:
1. docs/qa/evidence/po-hrm-rec-iv-one-active-fe-01.md
2. docs/program/specs/PO-HRM-REC-IV-ONE-ACTIVE-SA-01.md §3.3 §4
3. docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-REC-06a (AC-REC-IV-01..06)
task:
- Browser U65 flow: candidate list render badge "Đã có lịch" + time dd/MM/yyyy HH:mm from BE projection
- Verify null/invalid datetime shows "—" without crash
- Verify create interview conflict returns 409 HRM-REC-IV-409-ACTIVE and FE shows business-friendly message
- Verify successful schedule reflects in list and remains after F5
forbidden:
- seed acceptance
- API-only claim without FE click path
exit_criteria:
- Evidence with URL/account/click path/network + F5 persistence
- completion_report + next_dispatch_prompt for pm
evidence_path:
- docs/qa/evidence/po-hrm-rec-iv-one-active-qa-01.md
ack_status_target: PASS_TO_PM
```
