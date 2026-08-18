# Evidence — PO-HRM-REC-IV-ONE-ACTIVE-SA-01

| Field | Value |
|-------|--------|
| work_item_id | `PO-HRM-REC-IV-ONE-ACTIVE-SA-01` |
| from_role | sa |
| to_role | pm |
| lane | governance |
| change_mode | ADD-only |
| date | 2026-08-06 |
| source_spec | `docs/program/specs/PO-HRM-REC-INTERVIEW-ONE-ACTIVE-SPEC-01.md` |
| source_docs | `docs/qa/evidence/po-hrm-rec-iv-one-active-docs-01.md` |
| output_packet | `docs/program/specs/PO-HRM-REC-IV-ONE-ACTIVE-SA-01.md` |
| ack_status | **PASS_TO_PM** |

## Delivered scope

- Đã phát hành SA packet ADD-only cho one-active interview cardinality với 4 lớp rõ: boundaries, DB intent, API deterministic contract, FE display-ready contract.
- Đã định nghĩa hành vi deterministic cho create/update/list khi candidate đã có ACTIVE interview, bao gồm mã lỗi `HRM-REC-IV-409-ACTIVE`.
- Đã chốt list contract cho badge ứng viên “Đã có lịch” với trường datetime hiển thị `dd/MM/yyyy HH:mm` (vi-VN) và fallback `—`.
- Đã giữ OPEN rõ ràng các quyết định sản phẩm chưa chốt (`OPEN-Q1..Q4`), không tự bịa.
- Đã cung cấp prompt dispatch hẹp copy-ready cho `dev-be` và `dev-fe`.

## Deterministic contract highlights

| Area | Locked in packet |
|------|------------------|
| Create interview | 201 khi không ACTIVE; 409 `HRM-REC-IV-409-ACTIVE` khi đã có ACTIVE |
| Update status | Chỉ transition hợp lệ; transition sai trả 400 deterministic |
| Candidate list badge | `active_interview` projection display-ready từ BE; không tự suy luận ở FE |
| Date display | `active_interview_display_time_vi_vn` format `dd/MM/yyyy HH:mm`; null/invalid -> `—` |
| Scope parity | list/get/mutate dùng cùng resolver scope |

## OPEN questions intentionally unresolved

| ID | Nội dung | Trạng thái |
|----|----------|------------|
| OPEN-Q1 | One-active theo UV hay UV×YCTD | OPEN (cần sponsor/PM quyết định) |
| OPEN-Q2 | Reschedule R-A vs R-B | OPEN (cần PM chốt trước Dev) |
| OPEN-Q3 | `no_show` có thuộc TERMINAL | OPEN |
| OPEN-Q4 | SoT mutate MVP: `interviews` hay `recruitment_interviews` | OPEN |

## Forbidden compliance

- Không chỉnh `apps/**`.
- Không claim `recruitment_uat_ready`.
- Không invent REC-03/campaign/tin đăng.
- Không dùng seed làm acceptance.

## completion_report

Đã hoàn tất packet SA cho cardinality “1 ACTIVE interview/candidate/legal-entity” dưới dạng docs ADD-only, bao gồm DB/API/FE contracts và deterministic error taxonomy. Scope này chỉ là governance paper lock cho Dev wave kế; chưa mở bất kỳ claim UAT hay app implementation.

## next_owner

`pm`

## next_dispatch_prompt

```text
Dispatch 1 (dev-be)
work_item_id: PO-HRM-REC-IV-ONE-ACTIVE-BE-01
from_role: pm
to_role: dev-be
lane: execution
change_mode: ADD-only narrow
read_first:
  - docs/program/specs/PO-HRM-REC-IV-ONE-ACTIVE-SA-01.md §2 §3 §5
  - docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-REC-06a
entry_criteria:
  - PM chốt OPEN-Q2 và OPEN-Q4 trên bus (temporary decision allowed)
task:
  - Enforce one-active invariant on create/update (transaction + deterministic 409 HRM-REC-IV-409-ACTIVE)
  - Scope parity list/get/mutate
  - Return candidate-list projection fields active_interview as packet contract
forbidden:
  - REC-03/campaign
  - dual mutate SoT
  - seed acceptance
exit_criteria:
  - tests cover conflict + cancel->create + list badge projection
  - completion_report + next_dispatch_prompt for qa
evidence_path: docs/qa/evidence/po-hrm-rec-iv-one-active-be-01.md
ack_status_target: READY_FOR_QA
```

```text
Dispatch 2 (dev-fe)
work_item_id: PO-HRM-REC-IV-ONE-ACTIVE-FE-01
from_role: pm
to_role: dev-fe
lane: execution
change_mode: ADD-only narrow
read_first:
  - docs/program/specs/PO-HRM-REC-IV-ONE-ACTIVE-SA-01.md §3.3 §4
  - docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-REC-06a
entry_criteria:
  - BE active_interview projection contract available
task:
  - Render badge "Đã có lịch" + vi-VN datetime `dd/MM/yyyy HH:mm`
  - Handle 409 HRM-REC-IV-409-ACTIVE gracefully in create flow
  - Null/invalid datetime -> `—`
forbidden:
  - infer ACTIVE from client-only state if BE projection exists
  - seed acceptance
  - claim recruitment_uat_ready
exit_criteria:
  - FE tests/evidence for badge + conflict UX + F5 persistence
  - completion_report + next_dispatch_prompt for qa
evidence_path: docs/qa/evidence/po-hrm-rec-iv-one-active-fe-01.md
ack_status_target: READY_FOR_QA
```

## evidence_path

`docs/qa/evidence/po-hrm-rec-iv-one-active-sa-01.md`

