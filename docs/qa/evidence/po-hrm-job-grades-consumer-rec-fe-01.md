# Evidence — PO-HRM-JOB-GRADES-CONSUMER-REC-FE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `D-FE-HRM-REC-JOB-GRADE-CONSUMER-01` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **date** | 2026-08-11 |
| **ack_status** | **`READY_FOR_QA`** |
| **spec_ref** | `BA-HRM-JOB-GRADES-CONSUMER-REC-01` · **AC-SET-CONSUMER-JG-REC-01** |
| **must_keep** | `RECCHQC1` · `ATTLVTSOTQC1` · `ATTLVTCONQC1` · YCTD WF chain · `settings_catalog_e2e_ready=false` |

## Change (FE)

| Area | Detail |
|------|--------|
| YCTD create | `CatalogSearchPicker` **Ngạch/bậc** · `jobGradeOptionsFromCatalog` · `job_grade_key` on `createJobRequisition` |
| YCTD edit | `editJobGradeKey` + PATCH `job_grade_key` |
| List/detail | `resolveJobGradeLabel` · `yctd-grade-label-*` · `yctd-detail-job-grade` |
| API types | `HrmJobRequisition.job_grade_key` · create/update payload |
| HDSD | `hdsd-requisition-job-grade` |

## Verification

| Check | Result |
|-------|--------|
| `pnpm exec vitest run src/lib/po-hrm-job-grades-consumer-rec-fe-01.test.ts` | **4/4 PASS** |
| U65 | no seed · narrow AC only · ≠ UF-HRM-10 full PASS |

## Residual

- **BE** `D-BE-HRM-REC-JOB-GRADE-ASSERT-01` — persist + assert `job_grade_key` on `job_requisitions` (DTO/SELECT not on BE at FE handoff); QA mutate 2xx/F5 label depends on BE slice.
- `JobPostingsTab` — out of scope unless same field exposed later.

## completion_report

**Closed:** REC YCTD consumer FE for `job_grades` per AC-SET-CONSUMER-JG-REC-01 — picker, Network body wiring, list/detail labels, vitest source locks.

**Open:** BE persistence/assert; browser U65 QA narrow leg.

## next_owner

`qa` (after optional parallel `dev-be` READY)

## next_dispatch_prompt

```text
work_item_id: QA-PO-HRM-JOB-GRADES-CONSUMER-REC-01
role: qa
read_first:
  - docs/qa/evidence/po-hrm-job-grades-consumer-rec-fe-01.md
  - docs/program/specs/BA-HRM-JOB-GRADES-CONSUMER-REC-01.md
entry_criteria: D-FE-HRM-REC-JOB-GRADE-CONSUMER-01 READY_FOR_QA; L0 stack; ceo@xe.vn / main; job_grades EFF>0 from Settings sync (U65 — no seed)
exit_criteria: Tuyển dụng → Yêu cầu tuyển → Tạo/sửa → chọn Ngạch/bậc → POST/PATCH body job_grade_key = catalog code → 2xx → F5 list + detail label resolveJobGradeLabel; Network evidence; cấm UF-HRM-10 full PASS; must_keep RECCHQC1
evidence_path: docs/qa/evidence/qa-po-hrm-job-grades-consumer-rec-01.md
ack_status: PASS_TO_PM or FAIL_TO_PM
```
